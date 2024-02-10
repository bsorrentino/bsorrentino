
import http from 'http';

async function* generateData() {
    for (let i = 0; i < 10; i++) {
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate delay
        yield `Data chunk ${i}\n`;
    }
}

const server = http.createServer(async (req, res) => {
    res.writeHead(200, {
        'Content-Type': 'text/plain',
        'Transfer-Encoding': 'chunked'
    });

    for await (const chunk of generateData()) {
        res.write(chunk);
        console.log(`Sent: ${chunk}`);
    }

    res.end();
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/`);
});
