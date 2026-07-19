import { io } from "socket.io-client";

const servidor = `http://${window.location.hostname}:3001`;

export const socket = io(servidor);