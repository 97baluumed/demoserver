const { app, connectDB } = require('./app');

const PORT = process.env.PORT || 3005;

connectDB().then(() => {
    app.listen(PORT, '127.0.0.1', () => {
        console.log(`Server running at http://127.0.0.1:${PORT}`);
    });
});