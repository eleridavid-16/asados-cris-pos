import { useState, useEffect } from "react";
import Cocina from "./cocina";
import { socket } from "./socket";
import pollo from "./assets/pollo.png";
import costillas from "./assets/costillas.png";
import images from "./assets/images.png";
import pechuga from "./assets/pechuga.png";
import logoRes from "./assets/logo_res.png";

const productos = [
  {
    id: 1,
    categoria: "Combinaciones",
    nombre: "1/4 Pollo + 6 Patacones",
    precio: 2.5,
    imagen: pollo,
  },
  {
    id: 2,
    categoria: "Combinaciones",
    nombre: "Costilla + 6 Patacones",
    precio: 3,
    imagen: costillas,
  },
  {
    id: 3,
    categoria: "Combinaciones",
    nombre: "Chorizo + 6 Patacones",
    precio: 3,
    imagen: images,
  },
  {
    id: 4,
    categoria: "Combinaciones",
    nombre: "Pechuga extra para combo",
    precio: 0.4,
    imagen: pechuga,
  },

  {
    id: 5,
    categoria: "Pollo asado",
    nombre: "Pollo Asado Entero",
    precio: 8.5,
  },
  { id: 6, categoria: "Pollo asado", nombre: "1/2 Pollo Asado", precio: 4.25 },
  { id: 7, categoria: "Pollo asado", nombre: "1/4 Pollo Asado", precio: 2.25 },
  { id: 8, categoria: "Pollo asado", nombre: "Pechuga", precio: 2.5 },

  {
    id: 9,
    categoria: "Costillas y carnes",
    nombre: "Costilla Entera 16 oz",
    precio: 9.5,
  },
  {
    id: 10,
    categoria: "Costillas y carnes",
    nombre: "Media Costilla",
    precio: 4.5,
  },
  {
    id: 11,
    categoria: "Costillas y carnes",
    nombre: "Cuarto de Costilla 4 oz",
    precio: 2.25,
  },
  { id: 12, categoria: "Costillas y carnes", nombre: "1/2 Mixto", precio: 4.5 },
  {
    id: 13,
    categoria: "Costillas y carnes",
    nombre: "Mixto Entero",
    precio: 9.5,
  },
  { id: 14, categoria: "Costillas y carnes", nombre: "Carne Asada", precio: 4 },

  {
    id: 15,
    categoria: "Acompañamientos",
    nombre: "Bollos de Maíz",
    precio: 1.25,
  },
  { id: 16, categoria: "Acompañamientos", nombre: "Patacones", precio: 1.5 },
  { id: 17, categoria: "Acompañamientos", nombre: "Papas Fritas", precio: 1.5 },
  {
    id: 18,
    categoria: "Acompañamientos",
    nombre: "Papas Horneadas",
    precio: 2,
  },

  { id: 19, categoria: "Bebidas", nombre: "Chicheme", precio: 1.5 },
  { id: 20, categoria: "Bebidas", nombre: "Soda", precio: 1.25 },
  { id: 21, categoria: "Bebidas", nombre: "Jugo Natural", precio: 1.5 },
  { id: 22, categoria: "Bebidas", nombre: "Agua", precio: 1 },

  { id: 23, categoria: "Especiales", nombre: "Parrilla Mixta", precio: 12 },
];

const categorias = [
  "Combinaciones",
  "Pollo asado",
  "Costillas y carnes",
  "Acompañamientos",
  "Bebidas",
  "Especiales",
];

function App() {
  if (window.location.pathname === "/cocina") {
    return <Cocina />;
  }

  const [vista, setVista] = useState("pos");
  const [categoriaActiva, setCategoriaActiva] = useState("Combinaciones");
  const [carrito, setCarrito] = useState([]);

  const [pedidos, setPedidos] = useState(() => {
    return JSON.parse(localStorage.getItem("pedidos") || "[]");
  });

  const [numeroPedido, setNumeroPedido] = useState(() => {
    const ultimo = Number(localStorage.getItem("ultimoNumeroPedido") || "0");
    return ultimo + 1;
  });

  const agregarProducto = (producto) => {
    setCarrito((actual) => {
      const existente = actual.find((item) => item.id === producto.id);

      if (existente) {
        return actual.map((item) =>
          item.id === producto.id
            ? { ...item, cantidad: item.cantidad + 1 }
            : item,
        );
      }

      return [...actual, { ...producto, cantidad: 1 }];
    });
  };

  const cambiarCantidad = (id, nuevaCantidad) => {
    if (nuevaCantidad <= 0) {
      setCarrito((actual) => actual.filter((item) => item.id !== id));
      return;
    }

    setCarrito((actual) =>
      actual.map((item) =>
        item.id === id ? { ...item, cantidad: nuevaCantidad } : item,
      ),
    );
  };

  const total = carrito.reduce(
    (suma, item) => suma + item.precio * item.cantidad,
    0,
  );

  const enviarPedido = () => {
    if (carrito.length === 0) {
      alert("Primero agrega productos al pedido.");
      return;
    }

    const pedidoNuevo = {
      numero: numeroPedido,
      productos: carrito,
      total,
      fecha: new Date().toLocaleString(),
      estado: "Pendiente",
    };

    const nuevosPedidos = [...pedidos, pedidoNuevo];

    setPedidos(nuevosPedidos);

    localStorage.setItem("pedidos", JSON.stringify(nuevosPedidos));

    localStorage.setItem("ultimoNumeroPedido", String(numeroPedido));
    socket.emit("nuevoPedido", pedidoNuevo);
    setCarrito([]);
    setNumeroPedido((actual) => actual + 1);
  };

  const eliminarPedido = (numero) => {
    const nuevosPedidos = pedidos.filter((pedido) => pedido.numero !== numero);

    setPedidos(nuevosPedidos);

    localStorage.setItem("pedidos", JSON.stringify(nuevosPedidos));
  };

  const reiniciarPedidos = () => {
    const confirmar = window.confirm(
      "¿Seguro que deseas reiniciar los pedidos? El próximo será el #001.",
    );

    if (!confirmar) {
      return;
    }

    localStorage.setItem("ultimoNumeroPedido", "0");
    localStorage.setItem("pedidos", "[]");

    setNumeroPedido(1);
    setPedidos([]);
    setCarrito([]);
  };

  const productosVisibles = productos.filter(
    (producto) => producto.categoria === categoriaActiva,
  );

  const ventasPorDia = {};

  pedidos.forEach((pedido) => {
    // Ajusta esto según el formato de tu fecha
    const fecha = pedido.fecha.split(" ")[0];

    if (!ventasPorDia[fecha]) {
      ventasPorDia[fecha] = {
        total: 0,
        productos: {},
        cantidadPedidos: 0,
      };
    }

    ventasPorDia[fecha].total += pedido.total;
    ventasPorDia[fecha].cantidadPedidos++;

    pedido.productos.forEach((producto) => {
      if (!ventasPorDia[fecha].productos[producto.nombre]) {
        ventasPorDia[fecha].productos[producto.nombre] = 0;
      }

      ventasPorDia[fecha].productos[producto.nombre] += producto.cantidad;
    });
  });

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#000000",
        color: "white",
        padding: "20px",
        fontFamily: "Arial, sans-serif",
        minHeight: "100vh",
        backgroundImage: `
      linear-gradient(
        rgba(0,0,0,0.5),
        rgba(0,0,0,0.5)
      ),
      url(${logoRes})
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
            fontSize: "48px",
            color: "white",
            margin: 0,
          }}
        >
          ASADOS CHRYSTI
        </h1>

        <img
          src={logoRes}
          alt="Logo"
          style={{
            width: "125px",
            height: "100px",
          }}
        />
      </div>

      <div
        style={{
          display: "flex",
          gap: "10px",
          marginBottom: "20px",
          justifyContent: "center",
        }}
      >
        <button
          onClick={() => setVista("pos")}
          style={{
            padding: "14px 22px",
            backgroundColor: vista === "pos" ? "#d32f2f" : "#444",
            color: "white",
            border: "none",
            borderRadius: "5px",
            fontSize: "17px",
            cursor: "pointer",
          }}
        >
          NUEVO PEDIDO
        </button>

        <button
          onClick={() => setVista("pedidos")}
          style={{
            padding: "14px 22px",
            backgroundColor: vista === "pedidos" ? "#d32f2f" : "#444",
            color: "white",
            border: "none",
            borderRadius: "5px",
            fontSize: "17px",
            cursor: "pointer",
          }}
        >
          PEDIDOS ENVIADOS ({pedidos.length})
        </button>
        <button 
        style={{
            padding: "14px 22px",
            backgroundColor: vista === "reporte" ? "#d32f2f" : "#444",
            color: "white",
            border: "none",
            borderRadius: "5px",
            fontSize: "17px",
            cursor: "pointer",
          }}
        onClick={() => setVista("reporte")}>REPORTE DIARIO</button>
        <button
          onClick={reiniciarPedidos}
          style={{
            background: "#d32f2f",
            color: "white",
            border: "none",
            borderRadius: "5px",
            padding: "14px 20px",
            fontSize: "17px",
            cursor: "pointer",
          }}
        >
          🔄 REINICIAR PEDIDOS
        </button>
      </div>

      {vista === "pos" && (
        <>
          <div
            style={{
              display: "flex",
              gap: "10px",
              flexWrap: "wrap",
              marginBottom: "20px",
            }}
          >
            {categorias.map((categoria) => (
              <button
                key={categoria}
                onClick={() => setCategoriaActiva(categoria)}
                style={{
                  padding: "12px 18px",
                  borderRadius: "5px",
                  border: "2px solid #ff9800",
                  backgroundColor:
                    categoriaActiva === categoria ? "#d32f2f" : "transparent",
                  color: categoriaActiva === categoria ? "white" : "#ff9800",
                  fontSize: "16px",
                  cursor: "pointer",
                }}
              >
                {categoria.toUpperCase()}
              </button>
            ))}
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "2fr 1fr",
              gap: "20px",
              alignItems: "start",
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
                gap: "15px",
              }}
            >
              {productosVisibles.map((producto) => (
                <div
                  key={producto.id}
                  style={{
                    backgroundColor: "white",
                    color: "black",
                    borderRadius: "6px",
                    padding: "18px",
                    textAlign: "center",
                  }}
                >
                  <img
                    src={producto.imagen}
                    alt={producto.imagen}
                    style={{ width: "50%", borderRadius: "10px" }}
                  />
                  <h2 style={{ minHeight: "5px", color: "black" }}>
                    {producto.nombre}
                  </h2>

                  <h2 style={{ color: "#d32f2f" }}>
                    ${producto.precio.toFixed(2)}
                  </h2>

                  <button
                    onClick={() => agregarProducto(producto)}
                    style={{
                      width: "100%",
                      padding: "12px",
                      backgroundColor: "#1976d2",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      fontSize: "17px",
                      cursor: "pointer",
                    }}
                  >
                    AGREGAR
                  </button>
                </div>
              ))}
            </div>

            <div
              style={{
                backgroundColor: "white",
                color: "black",
                borderRadius: "10px",
                padding: "18px",
              }}
            >
              <h1
                style={{
                  textAlign: "center",
                  color: "black",
                  fontSize: "50px",
                }}
              >
                Pedido #{String(numeroPedido).padStart(3, "0")}
              </h1>

              <hr />

              {carrito.length === 0 ? (
                <p style={{ textAlign: "center" }}>
                  No hay productos seleccionados.
                </p>
              ) : (
                carrito.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      borderBottom: "1px solid #ccc",
                      padding: "12px 0",
                    }}
                  >
                    <strong>{item.nombre}</strong>

                    <p>${item.precio.toFixed(2)} cada uno</p>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "12px",
                      }}
                    >
                      <button
                        onClick={() =>
                          cambiarCantidad(item.id, item.cantidad - 1)
                        }
                        style={{
                          width: "40px",
                          height: "40px",
                          borderRadius: "50%",
                          border: "none",
                          backgroundColor: "#424242",
                          color: "white",
                          fontSize: "24px",
                          fontWeight: "bold",
                          cursor: "pointer",
                        }}
                      >
                        −
                      </button>

                      <strong
                        style={{
                          fontSize: "22px",
                          minWidth: "30px",
                          textAlign: "center",
                        }}
                      >
                        {item.cantidad}
                      </strong>

                      <button
                        onClick={() =>
                          cambiarCantidad(item.id, item.cantidad + 1)
                        }
                        style={{
                          width: "40px",
                          height: "40px",
                          borderRadius: "50%",
                          border: "none",
                          backgroundColor: "#ff6f00",
                          color: "white",
                          fontSize: "24px",
                          fontWeight: "bold",
                          cursor: "pointer",
                        }}
                      >
                        +
                      </button>
                    </div>

                    <p>Subtotal: ${(item.cantidad * item.precio).toFixed(2)}</p>
                  </div>
                ))
              )}

              <h1
                style={{
                  textAlign: "center",
                  color: "black",
                  fontSize: "50px",
                }}
              >
                Total: ${total.toFixed(2)}
              </h1>

              <button
                onClick={enviarPedido}
                style={{
                  width: "100%",
                  padding: "15px",
                  backgroundColor: "#2e7d32",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  fontSize: "18px",
                  cursor: "pointer",
                }}
              >
                ENVIAR PEDIDO
              </button>
            </div>
          </div>
        </>
      )}

      {vista === "pedidos" && (
        <div>
          <h2>Pedidos enviados</h2>

          {pedidos.length === 0 ? (
            <p>No hay pedidos enviados.</p>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                gap: "20px",
                marginTop: "20px",
              }}
            >
              {[...pedidos].reverse().map((pedido) => (
                <div
                  key={pedido.numero}
                  style={{
                    backgroundColor: "white",
                    color: "black",
                    padding: "18px",
                    borderRadius: "8px",
                  }}
                >
                  <h2 style={{ textAlign: "center", color: "black" }}>
                    Pedido # {String(pedido.numero).padStart(3, "0")}
                  </h2>

                  <p>{pedido.fecha}</p>

                  {pedido.productos.map((producto) => (
                    <p key={producto.id}>
                      {producto.cantidad} × {producto.nombre}
                    </p>
                  ))}

                  <h3>Total: ${pedido.total.toFixed(2)}</h3>

                  <button
                    onClick={() => eliminarPedido(pedido.numero)}
                    style={{
                      padding: "10px 18px",
                      backgroundColor: "#c62828",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                    }}
                  >
                    ELIMINAR
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {vista === "reporte" && (
        <div>
          <h1
            style={{
              textAlign: "center",
              marginBottom: "30px",
              color: "white",
            }}
          >
            Reporte Diario de Ventas
          </h1>

          {Object.entries(ventasPorDia)
            .reverse()
            .map(([fecha, datos]) => (
              <div
                key={fecha}
                style={{
                  backgroundColor: "white",
                  color: "black",
                  padding: "20px",
                  borderRadius: "10px",
                  marginBottom: "20px",
                }}
              >
                <h2 style={{ color: "black" }}>{fecha}</h2>

                <p>
                  <strong>Total vendido:</strong>
                  {" $"}
                  {datos.total.toFixed(2)}
                </p>

                <p>
                  <strong>Pedidos realizados:</strong> {datos.cantidadPedidos}
                </p>

                <hr />

                <h3>Productos vendidos</h3>

                {Object.entries(datos.productos).map(([nombre, cantidad]) => (
                  <p key={nombre}>
                    {nombre}: {cantidad}
                  </p>
                ))}
              </div>
            ))}
        </div>
      )}
    </div>
  );
}

export default App;
