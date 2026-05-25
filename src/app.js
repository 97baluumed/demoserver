const http = require('http');
const url = require('url');
const getUsers = require('./modules/users');

const server = http.createServer((request, response) => {
    const parsedUrl = url.parse(request.url, true);
    const query = parsedUrl.query;

    const setHeaders = (contentType) => {
        response.writeHead(200, { 'Content-Type': contentType });
    };

    const hasQuery = Object.keys(query).length > 0;

    if (hasQuery) {
        if ('hello' in query) {
            const name = query.hello;
            if (name) {
                setHeaders('text/plain');
                response.end(`Hello, ${name}`);
            } else {
                response.writeHead(400, { 'Content-Type': 'text/plain' });
                response.end('Enter a name');
            }
            return;
        }

        if ('users' in query) {
            setHeaders('application/json');
            response.end(getUsers());
            return;
        }

        response.writeHead(500);
        response.end();
        return;
    }

    setHeaders('text/plain');
    response.end('Hello, World!');
});

const PORT = process.env.PORT || 3003;

server.listen(PORT, '127.0.0.1', () => {
    console.log(`Сервер запущен по адресу http://127.0.0.1:${PORT}`);
});