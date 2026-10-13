// Локальный запуск: node server.js -> http://localhost:3000
const http = require("http");
const handler = require("./api/clients");

const PORT = process.env.PORT || 3000;
http.createServer(handler).listen(PORT, () => console.log(`http://localhost:${PORT}`));
