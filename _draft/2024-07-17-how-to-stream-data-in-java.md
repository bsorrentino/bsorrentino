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

Continuing the in-depth analysis started with the previous article "[How to stream data over HTTP using Node and Fetch API][part1]", in this one we will see how to apply [HTTP streaming] within [Next.js] the well-known [React] framework to create complete web applications. 


In the [previous article][part1], we covered how to: 

* Divide our overall computation into smaller tasks that can return a partial (and consistent) result using [async generators][async generator]
* Send data chunks over HTTP using [Node.js] [ServerResponse] from the Server 
* Use a [readable stream] from [Fetch API] to receive the data chunks over HTTP on the Client 

## Next.js implementation

In [Next.js] the main implementation steps are:
> Take note that the implementation will be based on [typescript] to make in evidence the objects' type  that we are going to use. 

* Create an instance of [ReadableStream] that fetch data from an [async generator]
* Create a [Response object][Response] specialization that accept a [ReadableStream] as result body 
* Create a [NextJS Route Handler][Route Handlers] that returns such [Response object][Response] when invoked
* Create a client side [React] component that consume the data chunk over http.

### Create a ReadableStream from an async generator

We will create a [ReadableStream] that fetch data from an [async generator] using [TextEncoder] to encode the data chunks.

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

The `makeStream` function takes in an [async generator] and return a [ReadableStream]. As you see we can pass to the [ReadableStream]’s `constructor`, a callback function that is used when the stream starts to produce data. Once invoked, to this function is provided a controller object where we can put the fetched data on a queue.  

So in summary, it's taking an [async generator] of data, encoding each chunk to binary data, and piping that data through a [ReadableStream] so that the stream can be consumed asynchronously. This allows you to generate data on demand and stream it to the client efficiently without buffering everything in memory. The client can then read from the stream over time as the data becomes available.

### Create a specialized Response object

Now we create a custom subclass of [Response] able to manage a [ReadableStream] 

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

In the code above the `StreamingResponse` is the custom [Response] subclass that accepts a [ReadableStream] as response body. This allows to return a response able to streaming data from a [Next.js Route Handler][Route Handlers]. 

### Create a NextJS Route Handler that stream data

We have almost done! To test streaming data, we can create a [NextJS Route Handler][Route Handlers] that handle a `GET` http request that return a response that fetch, format and encode the data from an [async generator] that is exactly our earlier implemented `StreamingResponse` class.

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

As we did in the [previous article][part1], we used the [Fetch API] to create the function `streamingFetch`, which can handle streaming response from the server using a [body reader][attach a Reader]. We use this function in the `useEffect` [React] hook as follows:  

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

Hope that this knowledge will be helpful, **stay tune because the next article will be dedicated to implement http streaming from the amazing [Next.js Server Actions][server actions]**. In the meanwhile, enjoy coding! 👋 

> 💻 The code is available on [Github][repo] 💻

## References

* [How to stream data over HTTP using Node and Fetch API][part1]

[server actions]: https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations
[repo]: https://github.com/bsorrentino/http-streaming
[typescript]: https://www.typescriptlang.org
[Next.js]: https://nextjs.org
[React]: https://reactjs.org
[part1]: https://bsorrentino.github.io/bsorrentino/web/2024/02/10/how-to-stream-data-over-http.html
[ServerResponse]: https://nodejs.org/api/http.html#class-httpserverresponse
[ReadableStream]: https://developer.mozilla.org/en-US/docs/Web/API/ReadableStream
[Response]: https://developer.mozilla.org/en-US/docs/Web/API/Response
[Route Handlers]: https://nextjs.org/docs/app/building-your-application/routing/route-handlers
[Server Components]: https://nextjs.org/docs/app/building-your-application/rendering/server-components
[TextEncoder]: https://developer.mozilla.org/en-US/docs/Web/API/TextEncoder
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
