import { useEffect, useState } from "react";
import { socket } from "./socket";
import logo_res from "./assets/logo_res.png";

function Cocina() {
  const [pedidos, setPedidos] = useState([]);

  useEffect(() => {
    const recibirPedido = (pedido) => {
      setPedidos((actuales) => [...actuales, pedido]);

      const audio = new Audio("/campana.wav");
audio.volume = 1;
audio.currentTime = 0;

audio.play().catch(() => {
  console.log("Haz clic una vez en la pantalla de cocina para activar el sonido.");
});
};

   socket.on("pedidoCocina", recibirPedido);

return () => {
  socket.off("pedidoCocina", recibirPedido);
};
}, []);

  const marcarListo = (numero) => {
    setPedidos((actuales) =>
      actuales.filter((pedido) => pedido.numero !== numero)
    );
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#111",
        color: "white",
        padding: "20px",
        fontFamily: "Arial",
        minHeight: "100vh",
        backgroundImage: `
      linear-gradient(
        rgba(0,0,0,0.7),
        rgba(0,0,0,0.7)
      ),
      url(${logo_res})
    `,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        color: "white",
        padding: "20px",
        fontFamily: "Arial",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "15px",
        }}
      >
        <h1
          style={{
            textAlign: "center",
            fontSize: "24px",
            marginTop: 0,
            color: "white",
          }}
        >
          COCINA — ASADOS CHRYSTI
        </h1>
      </div>

      {pedidos.length === 0 ? (
        <h2 style={{ textAlign: "center", color: "#aaa" }}>
          Esperando pedidos...
        </h2>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, 240px)",
            gap: "14px",
            justifyContent: "start",
          }}
        >
          {pedidos.map((pedido) => (
            <div
              key={pedido.numero}
              style={{
                backgroundColor: "white",
                color: "black",
                borderRadius: "10px",
                padding: "14px",
                borderTop: "12px solid #d32f2f",
              }}
            >
              <div
                style={{
                  textAlign: "center",
                  fontSize: "28px",
                  fontWeight: "bold",
                  marginBottom: "10px",
                }}
              >
                #{String(pedido.numero).padStart(3, "0")}
              </div>

              <hr />

              {pedido.productos.map((producto) => (
                <h2 key={producto.id}>
                  {producto.cantidad} × {producto.nombre}
                </h2>
              ))}

              <button
                onClick={() => marcarListo(pedido.numero)}
                style={{
                  width: "100%",
                  padding: "16px",
                  marginTop: "15px",
                  backgroundColor: "#2e7d32",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  fontSize: "22px",
                  cursor: "pointer",
                }}
              >
                LISTO
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Cocina;