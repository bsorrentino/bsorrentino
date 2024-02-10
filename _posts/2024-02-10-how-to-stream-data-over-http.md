---
layout: post
title:  How to stream data over HTTP using Node and Fetch API
date:   2024-02-10
description: "A guide to using HTTP streaming for efficient data visualization in web applications "
categories: web

---
![cover](../../../../assets/http_streaming/http-streaming.png)
<br>

## Abstract

This article presents a practical guide to using [HTTP streaming] (aka "_chunked transfer encoding over HTTP_" ) for efficient data visualization in web applications. 

> I was inspired to write this article from the experience I had working on AI projects that leverage the streaming support provided by [OpenAI API] and I'd want to share my findings hoping that could be useful.

## What is HTTP streaming?

[HTTP streaming] is a way of sending data over HTTP using a mechanism called **chunked transfer encoding**. This means that the server can send the response in multiple chunks, each with its own size and content. The client can start processing the response as soon as it receives the first chunk, without waiting for the whole response to be complete. This can reduce the latency and the memory usage of both the server and the client.

**Compatibility**
> HTTP streaming is supported by most modern browsers and HTTP clients, and it works well with plain HTTP and HTTPS. 

**HTTP/1.1 vs HTTP/2**
> You can also use HTTP/2 for streaming, which has some advantages over HTTP/1.1, such as multiplexing and header compression. However, HTTP/2 requires HTTPS and some additional configuration on the server side. 
>
> **For simplicity This article will focus on HTTP/1.1**.

## Why use HTTP streaming?

[HTTP streaming] can be useful for web applications that need to visualize a large amount of data, such as charts, graphs, maps, tables or a time-consuming response like a complex AI response, this mainly to offer a User a more engaging interactive experience.

## Proof Of Concept

I choosen to use plain javascript, [Node.js] and standard [Fetch API] for implementing the examples as proof of concept, avoiding any third-party frameworks so we will not be sidetracked by technology details, but we will focus on the streaming architecture. 

### ❗IMPORTANT❗ The Async Generator

Because to implement the [chunked transfer encoding over HTTP][HTTP Streaming] we need to split our overall computation in smaller tasks which can return a partial (_and consistent_) result, we will explore the [async generators][async generator]  an incredible built-in javascript tool that is ideal for this goal. 

#### Anatomy of Async Generator function

- An [async generator function] is a particular function that return an [AsyncGenerator object][async generator] conforms to both the [async iterable][async iteration] and the [async iterator][async iteration] protocol. 
- An [async generator function] allows [yielding][yield] an intermediate result during an iterative process suspending current execution and giving the possibility to use such result by code that are waiting for it.

Ultimately an [async generator function] (`function*`) combines the features of [async functions] and [generator functions], where you can use both the [await] and [yield] keywords within the function body, so you can handle asynchronous tasks ergonomically with [await], while leveraging the lazy nature of [generator functions]. 

### Server Side Implementation

The Assumption is to have an [async generator function] that produces data in chunks. As prrof of concept here is a simple function that sends out data chunks, with a delay between each one: 

```javascript
async function* generateData() {
    for (let i = 0; i < 1000; i++) {
        // Simulate delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        // Yield data chunk
        yield `data chunk ${i}\n`;
    }
}
```

In real case we would have a more complex logic to generate the data chunks coming from external data sources, but for the purpose of this example we will keep it simple.

Now we can write a simple server that streams the data over HTTP to the client. It is important take a note that, to iterate over the data chunks  we can to use the [for await] statement that creates a loop iterating over [async iterable objects][async iteration].


```javascript
import http from 'http';

const server = http.createServer(async (req, res) => {
    res.writeHead(200, {
        'Content-Type': 'text/plain',
        'Transfer-Encoding': 'chunked'
    });
    // Asynchronous iterate over the data chunks
    for await (const chunk of generateData()) {
        res.write(chunk);
        console.log(`Sent: ${chunk}`);
    }
    res.end();
});

const PORT = 3000;
server.listen(PORT, () => 
    console.log(`Server running at http://localhost:${PORT}/`) );
```

As you can see from the code above, the implementation of [chunked transfer encoding over HTTP] in [Node.js] is pretty straight forward, we iterate over data chunks asynchronously and write them to HTTP response that's all. 

### Client Side Implementation

On the client side we use [fetch API] to handle streaming response from the server. In this case we can [attach a Reader] to a response's body using `getReader()`, that locks to the stream and waits for each chunk of data sent by server. 

**Decoding the data chunks**
> Since the data chunk are encoded we need to decode it first to be able to use it.

#### Bonus 💯 : Wrap around the Reader with an asynchronous generator function 

We can wrap around the Reader with an asynchronous generator function that allows fetching data in a streaming fashion yielding each chunk of data as soon as it is available. 

```javascript
/**
 * Generator function to stream responses from fetch calls.
 * 
 * @param {Function} fetchcall - The fetch call to make. Should return a response with a readable body stream.
 * @returns {AsyncGenerator<string>} An async generator that yields strings from the response stream.
 */
async function* streamingFetch( fetchcall ) {

    const response = await fetchcall();
    // Attach Reader
    const reader = response.body.getReader();
    while (true) {
        // wait for next encoded chunk
        const { done, value } = await reader.read();
         // check if stream is done
        if (done) break;
        // Decodes data chunk and yields it
        yield (new TextDecoder().decode(value));
    }
}
```

Now we can use the `streamingFetch` generator function to stream the data chunks coming from the server as shown below.

```javascript
(async () => {

    for await ( let chunk of streamingFetch( () => fetch('http://localhost:3000/') ) ) {
        console.log( chunk )
    }

})();
```
It's DONE! ✅ now you can see data chunks coming from the server as soon as they are available. 

**Take a Note 👀:** 
> We have both an [async generator] in the server to produce chunks of data and in the client to consume them.


## Advantages

-   **Snappy User Experience**: You can start showing data as soon as it's available.
-   **Scalable API**: No memory usage spikes from accumulating results in memory.
-   **Uses plain HTTP and a standard JavaScript API**. There are no connections to manage or complicated frameworks that might become obsolete in a few years.


## Disadvantages

-   **Implementation is slightly more involved** than using regular API calls.
-   **Error handling becomes more difficult** because HTTP status code 200 will be sent as soon as streaming starts.
    -   What do we do when something goes wrong in the middle of the stream?
    -   The application must be able to determine if the stream has not completed and behave accordingly.
-   **Needs formatting assumptions** as part of the contract or usage of an unconventional format.


# Bonus 💯: Streaming response from OpenAI Chat

As said at beginning I delved into [HTTP Streaming] to be able to leverage the streaming support provided by [OpenAI streaming API]. Essentially the streaming version of the API, instead to return whole answer, return an [async iterable object][async iteration] 🤩.
So, we can use the same approach as we did before 😉 to stream over HTTP the data chunks coming from the OpenAI server as shown below:

 
```javascript
import http from 'http';
import OpenAI from "openai";

const openai = new OpenAI();

(async () => {

    const stream = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [{ role: "user", content: "Say this is a test" }],
        stream: true,
    });

    const server = http.createServer(async (req, res) => {
        res.writeHead(200, {
            'Content-Type': 'text/plain',
            'Transfer-Encoding': 'chunked'
        });

    // Asynchronous iterate over the data chunks
    for await (const chunk of stream) {
        res.write(chunk.choices[0]?.delta?.content || "");
        console.log(`Sent: ${chunk}`);
    }

    res.end();
});

const PORT = 3000;
server.listen(PORT, () => 
    console.log(`Server running at http://localhost:${PORT}/`) );
})();
```

# Conclusion

In this article we have seen a practical guide to using HTTP streaming for efficient data visualization in web applications. We have explored the use of [chunked transfer encoding over HTTP][HTTP streaming] its advantages and disadvantages. We have also delved into the power of [async generator functions][async generator function] and their use in implementing HTTP Streaming. Finally, we have seen a real use case of streaming data over HTTP using [Node.js], [Fetch API], and [OpenAI streaming API].  

Hope that this knowledge will be helpful. In the meanwhile, enjoy coding! 👋 

# References

* [Implement HTTP Streaming with Node.js and Fetch API][ref1]


[async functions]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function
[generator functions]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/GeneratorFunction
[async generator function]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function*
[async generator]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/AsyncGenerator
[async iteration]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols#the_async_iterator_and_async_iterable_protocols
[yield]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/yield
[await]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/await
[for await]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for-await...of
[HTTP streaming]: https://en.wikipedia.org/wiki/Chunked_transfer_encoding
[Fetch API]: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API
[readable stream]: https://developer.mozilla.org/en-US/docs/Web/API/Streams_API/Using_readable_streams
[attach a reader]: https://developer.mozilla.org/en-US/docs/Web/API/Streams_API/Using_readable_streams#attaching_a_reader
[OpenAI streaming API]: https://platform.openai.com/docs/api-reference/streaming
[Node.js]: https://nodejs.org/en
[OpenAI API]: https://platform.openai.com/docs/api-reference

[ref1]: https://www.loginradius.com/blog/engineering/guest-post/http-streaming-with-nodejs-and-fetch-api/

