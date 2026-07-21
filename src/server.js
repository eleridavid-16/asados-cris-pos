import path from "path";
import { fileURLToPath } from "url";
import express from "express";
import http from "http";
import cors from "cors";
import { Server } from "socket.io";

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(express.json());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("Dispositivo conectado:", socket.id);

  socket.on("nuevoPedido", (pedido) => {
    console.log("Pedido recibido:", pedido.numero);
    io.emit("pedidoCocina", pedido);
  });

  socket.on("disconnect", () => {
    console.log("Dispositivo desconectado:", socket.id);
  });
});
const distPath = path.join(__dirname, "../dist");

app.use(express.static(distPath));

app.get(/.*/, (req, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});

const PORT = process.env.PORT || 3001;

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Servidor iniciado en puerto ${PORT}`);
});