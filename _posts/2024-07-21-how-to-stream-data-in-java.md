---
layout: post
title:  How to stream data over HTTP using Java Servlet and Fetch API
date:   2024-07-21
description: "A guide to using HTTP streaming for efficient data visualization in Java Servlet applications"
categories: web

---
![cover](../../../../assets/http_streaming/http-streaming.png)
<br>


## Yet another article on http streaming

Since the previous article [How to stream data over HTTP using Node and Fetch API][part1], received positive feedback, let’s continue to evaluate how to apply [HTTP streaming] using Java [Servlet] Container and [Fetch API]. In this article we will see how to apply [HTTP streaming] within [Jetty] a well-known Java [Servlet] Container. 

## Requirements

Here are the specific data streaming requirements for this scenario. 

- Divide our overall computation into smaller tasks that can return a partial (and consistent) result.
- Send data chunks over HTTP using features available from HttpServletRequest and HttpServletResponse 
- Use a [Readable stream] from [Fetch API] to receive the data chunks over HTTP on the Client 

## Look to the implementation 👀

### Server - Jetty Servlet

>  👉 Take note that the implementation will be based on **Jetty 12.x** and (as requires) **Java 17** 

In [Jetty Servlet Container][Jetty] the main implementation steps are: 

- **Initiate asynchronous processing** for a given request using `ServletRequest.startAsync()` method.
  > `ServletRequest.startAsync()` is part of the [Servlet 3.0 API][Servlet], which introduced asynchronous processing to servlets. This allowing the [Servlet] to handle tasks that may take a long time to complete without blocking the main request-handling thread.  
- Acquire a `PrintWriter` from response
- **Perform an asynchronous task** for generate chunks of data**, writing them to the response through `PrintWriter` 
- Complete asynchronous processing once finished
- **Serve a html page (<i>index.html</i>)** thta contains javascript code that will fetch data stream (<i>consume the data chunk over http.</i>) 

The server code concerns the `HttpServlet.doGET` implementation, I’ve reported the meaningful pieces, the complete implementation is [here][java-code]. 

```java
protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
    response.setContentType("application/json");
    response.setCharacterEncoding("UTF-8");

    // Start asynchronous processing
    var asyncContext = request.startAsync();

    // Acquire a writer from response
    final PrintWriter writer = response.getWriter();

    CompletableFuture.runAsync(() -> {
        try {

            for (int chunk = 0; chunk < 10; ++chunk) {

                TimeUnit.SECONDS.sleep(1); // simulate time to accomplish task
                var data = new ChunkOfData(chunk);

                try {
                    var serializedData = objectMapper.writeValueAsString(data);
                    writer.println(serializedData);
                } catch (IOException e) {
                    log.warn("error serializing data!. skip it.", e);
                }
                writer.flush();
            }
        } catch (InterruptedException e) {
            log.error("got an interrupt on processing!", e);
            throw new RuntimeException(e);
        }
    }).whenComplete((result, ex) -> {
        writer.close();
        asyncContext.complete();
    });
}
```

As said the `request.startAsync()` starts the asynchronous processing, while the process for streaming data is performed using `CompletableFuture.runAsync()` that is asynchronously completed by a task running in the `ForkJoinPool.commonPool()` after it runs the given action. 

As you can see, data streaming is straightforward. You must write each chunk of data to the response’s writer and then flush it. Once completed entire process, you must terminate both writer (`close()`) and asynchronous context (`complete()`) 

### Client - Web Component. 

The last step is to create a [Web Component] to consume and show streamed chunks of data. 

As we did in the [previous article][part1], we used the [Fetch API] to create the function `streamingResponse()`, which can handle streaming response from the server using a [body reader][readable stream] . We use this function in the `connectedCallback()` method, a lifecycle hook in Web Components, that is invoked each time a custom element is appended to the DOM. 

```javascript

async function* streamingResponse(response) {
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

/**
 * StreamingElement is a custom web component .
 * It is used to display streaming data.
 */
export class StreamingElement extends HTMLElement {

    get url() { return this.getAttribute('url') }

    async #fetchStreamingData() {

        console.debug( 'start fetching data')
        const execResponse = await fetch(`${this.url}/stream`);

        for await (let chunk of streamingResponse( execResponse )  ) {
            console.debug( 'fetched chunk', chunk )
            this.render( chunk );
        }
    }

    connectedCallback() {
        this.#fetchStreamingData()
    }

}

window.customElements.define('streaming-poc', StreamingElement);

```

## Bundle all and let’s try

After complete implementations i’ve bundled the client code (`js`, `html`) within java project as embedded resources configuring Jetty server to map a static route on them. So, to try we can simply run the jar or using maven exec plugin as shown below: 

```bash
mvn exec:java@test  
```

Et voilà ✅, we have all the main elements to implement successfully streaming data over http using Java Servlet. 

## Bonus 💯: Using java-async-generator library 

To achieve [chunked transfer encoding over HTTP][HTTP Streaming], we must break the main computation into smaller tasks that yield partial (_yet consistent_) results. Javascript offers a powerful built-in tool for this purpose: [async generators][async generator], which are perfect for the task. Java lacks an async generator equivalent, however, we've created a library, the [java-async-generator], to try bridge this gap. 
The library uses the `CompletableFuture` that is the java concept closer to the [Promise] in javascript. Below the [Servlet] code that use [java-async-generator] for streaming data 


Below how to looks like the `HttpServlet.doGET` implementation using async generator

```java

protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
    response.setContentType("application/json");
    response.setCharacterEncoding("UTF-8");

    // Start asynchronous processing
    var asyncContext = request.startAsync();

    // Acquire a writer from response
    final PrintWriter writer = response.getWriter();

    // create async generator
    var startAsyncTasks = AsyncGeneratorQueue.of(new LinkedBlockingQueue<>(), 
                                                    this::taskEmitter );
    // start async generator
    startAsyncTasks.forEachAsync( chunk -> {
        try {
            var serializedData = objectMapper.writeValueAsString(chunk);
            writer.println(serializedData);
        } catch (IOException e) {
            StreamingServer.log.warn("error serializing data!. skip it.", e);
        }
        writer.flush();

    }).whenComplete((result, ex) -> {
        writer.close();
        asyncContext.complete();
    });
}


private void taskEmitter( BlockingQueue<AsyncGenerator.Data<ChunkOfData>> emitter ) {
    try {
        for (int chunk = 0; chunk < 10; ++chunk) {
            TimeUnit.SECONDS.sleep(1); // simulate time to accomplish task
            // add task to emitter
            emitter.add( AsyncGenerator.Data.of(new ChunkOfData(chunk)));
        }
    }
    catch (InterruptedException e) {
        StreamingServer.log.error("got an interrupt on processing!", e);
        throw new RuntimeException(e);
    }
}

```

The main difference respects the previous server implementation is the creation of an `AsyncIteratorQueue`, a specialization of `AsyncIterator`, designed to enqueue asynchronous tasks with a blocking queue and retrieve each task's outcome within a for-each iteration. As you can see the async tasks are emitted by `taskEmitter()` method, providing a well-defined and coherent data stream from the emitting source to the receiver, simplifying implementation of more complex streaming scenarios. 

## Conclusion 

This article has presented a practical guide to streaming data over HTTP using Java [Servlet] and how to consume and display it from javascript using the fetch API. Streaming data is preferable to polling or long-polling in terms of efficiency, responsiveness, and scalability. This technique can enhance the functionality and interactivity of web applications that need to show live or near-live data. Feel free to try out this method and share your feedback with us. 

I hope that this knowledge will be helpful, in the meanwhile, enjoy coding! 👋 

> 💻 The complete code is available on [Github][repo] 💻 

## References 

* [How to stream data over HTTP using Node and Fetch API][part1]
* [How to stream data over HTTP using NextJS][part2]

[Web Component]: https://developer.mozilla.org/en-US/docs/Web/Web_Components
[java-async-generator]: https://github.com/bsorrentino/java-async-generator
[Jetty]: https://www.eclipse.org/jetty/
[Servlet]: https://javaee.github.io/servlet-spec/
[repo]: https://github.com/bsorrentino/http-streaming
[java-code]: https://github.com/bsorrentino/http-streaming/tree/main/java
[Promise]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise
[typescript]: https://www.typescriptlang.org
[part1]: https://bsorrentino.github.io/bsorrentino/web/2024/02/10/how-to-stream-data-over-http.html
[part2]: https://bsorrentino.github.io/bsorrentino/web/2024/03/05/how-to-stream-data-in-nextjs.html
[ServerResponse]: https://nodejs.org/api/http.html#class-httpserverresponse
[ReadableStream]: https://developer.mozilla.org/en-US/docs/Web/API/ReadableStream
[Response]: https://developer.mozilla.org/en-US/docs/Web/API/Response
[Route Handlers]: https://nextjs.org/docs/app/building-your-application/routing/route-handlers
[Server Components]: https://nextjs.org/docs/app/building-your-application/rendering/server-components
[TextEncoder]: https://developer.mozilla.org/en-US/docs/Web/API/TextEncoder
[HTTP streaming]: https://en.wikipedia.org/wiki/Chunked_transfer_encoding
[Fetch API]: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API
[Readable stream]: https://developer.mozilla.org/en-US/docs/Web/API/Streams_API/Using_readable_streams
[async functions]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function
[generator functions]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/GeneratorFunction
[async generator function]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function*
[async generator]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/AsyncGenerator
[async iteration]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols#the_async_iterator_and_async_iterable_protocols
[yield]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/yield
[await]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/await
[for await]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for-await...of
[attach a reader]: https://developer.mozilla.org/en-US/docs/Web/API/Streams_API/Using_readable_streams#attaching_a_reader
[OpenAI streaming API]: https://platform.openai.com/docs/api-reference/streaming
[Node.js]: https://nodejs.org/en
[OpenAI API]: https://platform.openai.com/docs/api-reference

[ref1]: https://www.loginradius.com/blog/engineering/guest-post/http-streaming-with-nodejs-and-fetch-api/
[ref2]: https://bsorrentino.github.io/bsorrentino/git/2023/03/03/the_power_of_js_generators.html
[Next.js]: https://nextjs.org
[React]: https://reactjs.org
[server actions]: https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations
