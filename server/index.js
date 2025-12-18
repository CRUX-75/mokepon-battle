const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// --- DATOS ---
const mokepones = [
  { id: 1, nombre: "Hipodoge", tipo: "Agua" },
  { id: 2, nombre: "Capipepo", tipo: "Tierra" },
  { id: 3, nombre: "Ratigueya", tipo: "Fuego" },
];

const jugadores = [];

class Jugador {
  constructor(id) {
    this.id = id;
    this.x = 0;
    this.y = 0;
    this.mokepon = null;
    this.ataque = null;
  }
  asignarMokepon(mokepon) { this.mokepon = mokepon; }
  actualizarPosicion(x, y) { this.x = x; this.y = y; }
  asignarAtaque(ataque) { this.ataque = ataque; }
}

// --- ENDPOINTS ---

app.get("/", (req, res) => res.send("Backend funcionando!"));

// 1. Unirse al juego
app.get("/unirse", (req, res) => {
  const id = `${Math.random()}`;
  const jugador = new Jugador(id);
  jugadores.push(jugador);
  // Limpieza básica: si hay muchos jugadores inactivos, podríamos borrarlos aquí
  res.send(id);
});

// 2. Obtener lista de monstruos
app.get("/mokepones", (req, res) => res.json(mokepones));

// 3. Asignar Mokepon al jugador
app.post("/mokepon/:jugadorId", (req, res) => {
  const jugadorId = req.params.jugadorId || "";
  const nombre = req.body.mokepon || "";
  const jugador = jugadores.find((j) => j.id === jugadorId);
  
  if (jugador) {
    jugador.asignarMokepon(nombre);
    console.log(`Jugador ${jugadorId} eligió ${nombre}`);
  }
  res.end();
});

// 4. Actualizar posición en el mapa y devolver enemigos
app.post("/mokepon/:jugadorId/posicion", (req, res) => {
  const jugadorId = req.params.jugadorId || "";
  const { x, y } = req.body;
  const jugador = jugadores.find((j) => j.id === jugadorId);
  
  if (jugador) {
    jugador.actualizarPosicion(x, y);
  }
  
  // Devolvemos todos los jugadores menos el que hace la petición
  const enemigos = jugadores.filter((j) => j.id !== jugadorId);
  res.json({ enemigos });
});

// 5. Recibir un ataque
app.post("/mokepon/:jugadorId/ataque", (req, res) => {
  const jugadorId = req.params.jugadorId || "";
  const { ataque } = req.body;
  const jugador = jugadores.find((j) => j.id === jugadorId);
  
  if (jugador) {
    jugador.asignarAtaque(ataque);
  }
  res.end();
});

// 6. Validar combate (Polling)
app.get("/mokepon/:jugadorId/combate/:enemigoId", (req, res) => {
  const { jugadorId, enemigoId } = req.params;
  const jugador = jugadores.find((j) => j.id === jugadorId);
  const enemigo = jugadores.find((j) => j.id === enemigoId);

  // Si alguno se desconectó
  if (!jugador || !enemigo) {
      return res.status(404).json({ error: "Jugador no encontrado" });
  }

  // Si alguno no ha atacado todavía, esperamos
  if (!jugador.ataque || !enemigo.ataque) {
    return res.json({ resultado: 'PENDIENTE' });
  }

  // Lógica de Piedra, Papel o Tijera
  let resultado = 'EMPATE';
  if (jugador.ataque == enemigo.ataque) {
    resultado = 'EMPATE';
  } else if (
    (jugador.ataque == 'FUEGO' && enemigo.ataque == 'TIERRA') ||
    (jugador.ataque == 'AGUA' && enemigo.ataque == 'FUEGO') ||
    (jugador.ataque == 'TIERRA' && enemigo.ataque == 'AGUA')
  ) {
    resultado = 'GANASTE';
  } else {
    resultado = 'PERDISTE';
  }

  // Guardamos la respuesta antes de borrar
  const respuesta = {
    resultado: resultado,
    ataqueMio: jugador.ataque,
    ataqueEnemigo: enemigo.ataque
  };

  // IMPORTANTE: Limpiamos los ataques inmediatamente para permitir la siguiente ronda
  jugador.ataque = null;
  enemigo.ataque = null;

  res.json(respuesta);
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));