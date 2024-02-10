

/**
 * Generator function to stream responses from fetch calls.
 * 
 * @param {Function} fetchcall - The fetch call to make. Should return a response with a readable body stream.
 * @returns {AsyncGenerator<string>} An async generator that yields strings from the response stream.
 */
async function* streamingFetch(fetchcall) {

    const response = await fetchcall();

    const reader = response.body.getReader();
    while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        yield (new TextDecoder().decode(value));
    }
}

// streamingFetch()

(async () => {

    for await ( let chunk of streamingFetch( () => fetch('http://localhost:3000/') ) ) {
        console.log( chunk )
    }

})()

