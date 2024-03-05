---
layout: post
title:  How to stream data over HTTP using NextJS
date:   2024-03-05
description: "A guide to using HTTP streaming for efficient data visualization in NextJS applications"
categories: web

---
![cover](../../../../assets/http_streaming/http-streaming.png)
<br>

## Let's continue

Continuing the in-depth analysis started with the previous article "[How to stream data over HTTP using Node and Fetch API][part1]", in this one we will see how to apply [HTTP streaming] within [Next.js] the well-known React framework to create complete web applications. 

Summarizing, in the [previous article][part1] we have dealt with:
* How to split our overall computation in smaller tasks which can return a partial (_and consistent_) result using the [async generators][async generator]
* How to return data chunk over http using [Node.js] [http.ServerResponse] from the Server
* How to use a [readable stream] form [Fetch API] to consume the data chunk over http in the Client

## Next.js implementation

Take note that the implementation will be based on [typescript] to make in evidence the objects' type  that we are going to use. In [Next.js] the main implementation topics are:

* Create an instance of [ReadableStream] that fetch data from an [async generator]
* Create a [Response object][Response] specialization that accept a [ReadableStream] as result body 
* Create a [NextJS Route Handler][Route Handlers] that returns such [Response object][Response] when invoked
* Create a client side [React] component that consume the data chunk over http.

### Create a ReadableStream from an async generator

```typescript

export const makeStream = <T extends Record<string, unknown>>(generator: AsyncGenerator<T, void, unknown>) => 
{

    const encoder = new TextEncoder();
    return new ReadableStream<any>({
        async start(controller) {
            for await (let chunk of generator) {
                const chunkData =  encoder.encode(JSON.stringify(chunk));
                controller.enqueue(chunkData);
            }
            controller.close();
        }
    });
}
```

In the code above we have created a `makeStream` function that takes in an [async generator] and return a [ReadableStream]. As you see we can pass to the [ReadableStream]’s `constructor`, a callback function that is used when the stream starts to produce data. when invoked to this function is provided a controller object where we can put the fetched data on a queue.  

So in summary, it's taking an [async generator] of data, encoding each chunk to binary data, and piping that data through a [ReadableStream] so that the stream can be consumed asynchronously.

This allows you to generate data on demand and stream it to the client efficiently without buffering everything in memory. The client can then read from the stream over time as the data becomes available.

### Create a specialized Response Object

```typescript
/**
 * A custom Response subclass that accepts a ReadableStream.
 * This allows creating a streaming Response for async generators.
 */
class StreamingResponse extends Response {

  constructor( res: ReadableStream<any>, init?: ResponseInit ) {
    super(res as any, {
      ...init,
      status: 200,
      headers: {
        ...init?.headers,
      },
    });
  }
}

```

In the code above we have created `StreamingResponse` a custom [Response] subclass that accepts a [ReadableStream] as response body. This allows to return a response ables to streaming data from a [Next.js Route Handler][Route Handlers].

### Create a NextJS Route Handler that stream data

We have almost done, to test streaming data, we can create a [NextJS Rout Handler][Route Handlers] that handle a `GET` request that return a response that fetch, encode and stringify the data from an async generator that is exactly our previously implementd `StreamingResponse`

```typescript
// file: app/api/stream-data/route.ts

type Item = {
  key: string;
  value: string;
}

/**
 * async generator that simulate a data fetch from external resource and
 * return chunck of data every second
 */
async function *fetchItems(): AsyncGenerator<Item, void, unknown> {
  
    const sleep = async (ms: number) => 
        (new Promise(resolve => setTimeout(resolve, ms)))
    
    for( let i = 0 ; i < 10 ; ++i ) {
        await sleep(1000)
        yield {
            key: `key${i}`,
            value: `value${i}`
        }
    }
}

/**
 * Next.js Route Handler that returns a Response object 
 * that stream data from the async generator.
 * 
 */
export async function GET(req: NextRequest ) {

    const stream = makeStream( fetchItems() )
    const response = new StreamingResponse( stream )
    return response
}


```

### Create React component that consume the data chunk over http.

The last step is to create a **Client Side React Component** to consume and show streamed chunck of data.

Like in the [previous article][part1] we have developed the function `streamingFetch` using the [Fetch API] to handle streaming response from the server through a [body reader][attach a Reader] and we employ it in the `useEffect` [React] hook as shown below 


```typescript
// file: app/components/RenderStreamData.tsx

/**
 * Generator function that streams the response body from a fetch request.
 */
export async function* streamingFetch( input: RequestInfo | URL, init?: RequestInit ) {

    const response = await fetch( input, init)  
    const reader  = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
  
    for( ;; ) {
        const { done, value } = await reader.read()
        if( done ) break;

        try {
            yield decoder.decode(value)
        }
        catch( e:any ) {
            console.warn( e.message )
        }
      
    }
}

export default function RenderStreamData() {
  const [data, setData] = useState<any[]>([]);

  useEffect( () => {
    const asyncFetch = async () => {
      const it = streamingFetch( '/api/stream-data') 

      for await ( let value of it ) {
        try {
          const chunk = JSON.parse(value);
          setData( (prev) => [...prev, chunk]);
        }
        catch( e:any ) {
          console.warn( e.message )
        }
      }
    }
    
    asyncFetch()
  }, []);

  return (
    <div>
        {data.map((chunk, index) => (
          <p key={index}>{`Received chunk ${index} - ${chunk.value}`}</p>
        ))}
    </div>
  );
}

```

Et voilà ✅, we have all the main components to implement succesfully streaming data over http in [Next.js].

#### Take a note 👀: 
> ❗**Streaming approach only makes sense when component consume and render data directly from client side**, so in this case you **must not use the approach of using [Server Components]** available in [Next.js]. 


## Conclusion

In this article we have seen a practical guide to using HTTP streaming for efficient data visualization in [Next.js] web applications. We have explored how create and customize an instance of [ReadableStream], creating a Response object  specialization that accepts it as a result body. To test we have used a [NextJS Route Handler][Route Handlers]. Additionally, to consume data chunk over http, we have developed a client-side [React] component that is the right way to achieve the benefit to streaming data from a server.

Hope that this knowledge will be helpful. In the meanwhile, enjoy coding! 👋 

> 💻 The code is available in [Github][repo] 💻

## References

* [How to stream data over HTTP using Node and Fetch API][part1]

[repo]: https://github.com/bsorrentino/http-streaming
[Next.js]: https://nextjs.org
[React]: https://reactjs.org
[part1]: https://bsorrentino.github.io/bsorrentino/web/2024/02/10/how-to-stream-data-over-http.html
[http.ServerResponse]: https://nodejs.org/api/http.html#class-httpserverresponse
[ReadableStream]: https://developer.mozilla.org/en-US/docs/Web/API/ReadableStream
[Response]: https://developer.mozilla.org/en-US/docs/Web/API/Response
[Route Handlers]: https://nextjs.org/docs/app/building-your-application/routing/route-handlers
[Server Components]: https://nextjs.org/docs/app/building-your-application/rendering/server-components
[HTTP streaming]: https://en.wikipedia.org/wiki/Chunked_transfer_encoding
[Fetch API]: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API
[readable stream]: https://developer.mozilla.org/en-US/docs/Web/API/Streams_API/Using_readable_streams

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