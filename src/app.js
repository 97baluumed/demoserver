const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');

const USERS_FILE = path.join(__dirname, 'data', 'users.json');
const BOOKS_FILE = path.join(__dirname, 'data', 'books.json');

const readUsers = () => {
    const data = fs.readFileSync(USERS_FILE, 'utf-8');
    return JSON.parse(data);
};

const writeUsers = (users) => {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf-8');
};

const readBooks = () => {
    const data = fs.readFileSync(BOOKS_FILE, 'utf-8');
    return JSON.parse(data);
};

const writeBooks = (books) => {
    fs.writeFileSync(BOOKS_FILE, JSON.stringify(books, null, 2), 'utf-8');
};

const server = http.createServer((request, response) => {
    const parsedUrl = url.parse(request.url, true);
    const query = parsedUrl.query;
    const pathname = parsedUrl.pathname;
    console.log('PATHNAME:', pathname);

    const hasQuery = Object.keys(query).length > 0;

    if (hasQuery) {
        if ('hello' in query) {
            const name = query.hello;
            if (name) {
                response.writeHead(200, { 'Content-Type': 'text/plain' });
                response.end(`Hello, ${name}`);
            } else {
                response.writeHead(400, { 'Content-Type': 'text/plain' });
                response.end('Enter a name');
            }
            return;
        }

        if ('users' in query) {
            response.writeHead(200, { 'Content-Type': 'application/json' });
            response.end(fs.readFileSync(USERS_FILE));
            return;
        }

        response.writeHead(500);
        response.end();
        return;
    }

    if (pathname === '/books' && request.method === 'GET') {
        response.writeHead(200, { 'Content-Type': 'application/json' });
        response.end(fs.readFileSync(BOOKS_FILE));
        return;
    }

    if (pathname === '/books' && request.method === 'POST') {
        let body = '';
        request.on('data', chunk => {
            body += chunk;
        });
        request.on('end', () => {
            try {
                const input = JSON.parse(body);
                if (!input.title || !input.author) {
                    response.writeHead(400, { 'Content-Type': 'text/plain' });
                    response.end('Title and author are required');
                    return;
                }

                const books = readBooks();
                const id = books.length > 0 ? Math.max(...books.map(b => b.id)) + 1 : 1;
                const newBook = {
                    id,
                    title: input.title,
                    author: input.author,
                    available: true
                };

                books.push(newBook);
                writeBooks(books);

                response.writeHead(201, { 'Content-Type': 'application/json' });
                response.end(JSON.stringify(newBook));
            } catch (err) {
                response.writeHead(400, { 'Content-Type': 'text/plain' });
                response.end('Invalid JSON');
            }
        });
        return;
    }

    const bookPathRegex = /^\/books\/(\d+)$/;
    const bookIdMatch = pathname.match(bookPathRegex);

    if (bookIdMatch && request.method === 'GET') {
        const books = readBooks();
        const id = parseInt(bookIdMatch[1]);
        const book = books.find(b => b.id === id);

        if (book) {
            response.writeHead(200, { 'Content-Type': 'application/json' });
            response.end(JSON.stringify(book));
        } else {
            response.writeHead(404, { 'Content-Type': 'text/plain' });
            response.end('Book not found');
        }
        return;
    }

    if (bookIdMatch && request.method === 'PUT') {
        const id = parseInt(bookIdMatch[1]);
        let body = '';
        request.on('data', chunk => {
            body += chunk;
        });
        request.on('end', () => {
            try {
                const input = JSON.parse(body);
                if (!input.title || !input.author) {
                    response.writeHead(400, { 'Content-Type': 'text/plain' });
                    response.end('Title and author are required');
                    return;
                }

                const books = readBooks();
                const bookIndex = books.findIndex(b => b.id === id);

                if (bookIndex === -1) {
                    response.writeHead(404, { 'Content-Type': 'text/plain' });
                    response.end('Book not found');
                    return;
                }

                books[bookIndex].title = input.title;
                books[bookIndex].author = input.author;
                writeBooks(books);

                response.writeHead(200, { 'Content-Type': 'application/json' });
                response.end(JSON.stringify(books[bookIndex]));
            } catch (err) {
                response.writeHead(400, { 'Content-Type': 'text/plain' });
                response.end('Invalid JSON');
            }
        });
        return;
    }

    if (bookIdMatch && request.method === 'DELETE') {
        const id = parseInt(bookIdMatch[1]);
        const books = readBooks();
        const bookIndex = books.findIndex(b => b.id === id);

        if (bookIndex === -1) {
            response.writeHead(404, { 'Content-Type': 'text/plain' });
            response.end('Book not found');
            return;
        }

        books.splice(bookIndex, 1);
        writeBooks(books);

        response.writeHead(204);
        response.end();
        return;
    }

    if (pathname === '/users' && request.method === 'GET') {
        response.writeHead(200, { 'Content-Type': 'application/json' });
        response.end(fs.readFileSync(USERS_FILE));
        return;
    }

    if (pathname === '/users' && request.method === 'POST') {
        let body = '';
        request.on('data', chunk => {
            body += chunk;
        });
        request.on('end', () => {
            try {
                const input = JSON.parse(body);
                if (!input.name) {
                    response.writeHead(400, { 'Content-Type': 'text/plain' });
                    response.end('Name is required');
                    return;
                }

                const users = readUsers();
                const id = users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1; const newUser = { id, name: input.name, borrowedBooks: [] };

                users.push(newUser);
                writeUsers(users);

                response.writeHead(201, { 'Content-Type': 'application/json' });
                response.end(JSON.stringify(newUser));
            } catch (err) {
                response.writeHead(400, { 'Content-Type': 'text/plain' });
                response.end('Invalid JSON');
            }
        });
        return;
    }

    const userPathRegex = /^\/users\/(\d+)$/;
    const userIdMatch = pathname.match(userPathRegex);

    if (userIdMatch && request.method === 'GET') {
        const users = readUsers();
        const id = parseInt(userIdMatch[1]);
        const user = users.find(u => u.id === id);

        if (user) {
            user.borrowedBooks = user.borrowedBooks || [];
            response.writeHead(200, { 'Content-Type': 'application/json' });
            response.end(JSON.stringify(user));
        } else {
            response.writeHead(404, { 'Content-Type': 'text/plain' });
            response.end('User not found');
        }
        return;
    }

    if (userIdMatch && request.method === 'PUT') {
        const id = parseInt(userIdMatch[1]);
        let body = '';
        request.on('data', chunk => {
            body += chunk;
        });
        request.on('end', () => {
            try {
                const input = JSON.parse(body);
                if (!input.name) {
                    response.writeHead(400, { 'Content-Type': 'text/plain' });
                    response.end('Name is required');
                    return;
                }

                const users = readUsers();
                const userIndex = users.findIndex(u => u.id === id);

                if (userIndex === -1) {
                    response.writeHead(404, { 'Content-Type': 'text/plain' });
                    response.end('User not found');
                    return;
                }

                users[userIndex].name = input.name;
                writeUsers(users);

                response.writeHead(200, { 'Content-Type': 'application/json' });
                response.end(JSON.stringify(users[userIndex]));
            } catch (err) {
                response.writeHead(400, { 'Content-Type': 'text/plain' });
                response.end('Invalid JSON');
            }
        });
        return;
    }

    if (userIdMatch && request.method === 'DELETE') {
        const id = parseInt(userIdMatch[1]);
        const users = readUsers();
        const userIndex = users.findIndex(u => u.id === id);
        if (userIndex === -1) {
            response.writeHead(404);
            response.end('User not found');
            return;
        }
        users.splice(userIndex, 1);
        writeUsers(users);

        response.writeHead(204);
        response.end();
        return;
    }

    const borrowRegex = /^\/users\/(\d+)\/borrow\/(\d+)/; const borrowMatch = pathname.match(borrowRegex);

    if (borrowMatch && request.method === 'POST') {
        const userId = parseInt(borrowMatch[1]);
        const bookId = parseInt(borrowMatch[2]);

        const users = readUsers();
        const books = readBooks();
        const user = users.find(u => u.id === userId);

        if (!user) {
            response.writeHead(404, { 'Content-Type': 'text/plain' });
            response.end('User not found');
            return;
        }

        const book = books.find(b => b.id === bookId);
        if (!book) {
            response.writeHead(404, { 'Content-Type': 'text/plain' });
            response.end('Book not found');
            return;
        }

        if (user.borrowedBooks.some(b => b.bookId === bookId)) {
            response.writeHead(400, { 'Content-Type': 'text/plain' });
            response.end('Book already borrowed');
            return;
        }

        user.borrowedBooks.push({ bookId, borrowedAt: new Date().toISOString() });
        writeUsers(users);

        response.writeHead(200, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify({
            message: 'Book borrowed successfully',
            userId,
            bookId
        }));
        return;
    }

    const returnRegex = /^\/users\/(\d+)\/return\/(\d+)/; const returnMatch = pathname.match(returnRegex);

    if (returnMatch && request.method === 'POST') {
        const userId = parseInt(returnMatch[1]);
        const bookId = parseInt(returnMatch[2]);

        const users = readUsers();
        const books = readBooks();
        const user = users.find(u => u.id === userId);

        if (!user) {
            response.writeHead(404, { 'Content-Type': 'text/plain' });
            response.end('User not found');
            return;
        }

        const book = books.find(b => b.id === bookId);
        if (!book) {
            response.writeHead(404, { 'Content-Type': 'text/plain' });
            response.end('Book not found');
            return;
        }

        const bookIndex = user.borrowedBooks.findIndex(b => b.bookId === bookId);
        if (bookIndex === -1) {
            response.writeHead(400, { 'Content-Type': 'text/plain' });
            response.end('Book not borrowed');
            return;
        }

        user.borrowedBooks.splice(bookIndex, 1);
        writeUsers(users);

        response.writeHead(200, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify({
            message: 'Book returned successfully',
            userId,
            bookId
        }));
        return;
    }

    response.writeHead(200, { 'Content-Type': 'text/plain' });
    response.end('Hello, World!');
});

const PORT = process.env.PORT || 3003;

server.listen(PORT, '127.0.0.1', () => {
    console.log(`Сервер запущен по адресу http://127.0.0.1:${PORT}`);
});
