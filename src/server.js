import express from "express";
import http from "http";
import cors from "cors";
import { Server } from "socket.io";

const app = express();

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

server.listen(3001, "0.0.0.0", () => {
  console.log("Servidor iniciado en puerto 3001");
});