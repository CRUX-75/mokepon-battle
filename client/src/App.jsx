import { useEffect, useState } from 'react';
import Mapa from './Mapa';
import { ASSETS } from './config/assets';
import './App.css';

function App() {
  const [vista, setVista] = useState('SELECCION');
  const [mokepones] = useState([
    { id: 1, nombre: "Hipodoge", tipo: "💧 Agua" },
    { id: 2, nombre: "Capipepo", tipo: "🌱 Tierra" },
    { id: 3, nombre: "Ratigueya", tipo: "🔥 Fuego" }
  ]);
  const [miMokepon, setMiMokepon] = useState(null);
  const [enemigo, setEnemigo] = useState(null);
  const [misAtaques, setMisAtaques] = useState([]);
  const [historial, setHistorial] = useState([]);
  const [victorias, setVictorias] = useState(0);
  const [derrotas, setDerrotas] = useState(0);

  const seleccionarMascota = (nombre) => {
    const atqs = ASSETS.ATAQUES;
    const config = {
      Hipodoge: [
        {t:'AGUA', i:atqs.AGUA}, {t:'AGUA', i:atqs.AGUA}, {t:'AGUA', i:atqs.AGUA}, 
        {t:'FUEGO', i:atqs.FUEGO}, {t:'TIERRA', i:atqs.TIERRA}
      ],
      Capipepo: [
        {t:'TIERRA', i:atqs.TIERRA}, {t:'TIERRA', i:atqs.TIERRA}, {t:'TIERRA', i:atqs.TIERRA}, 
        {t:'FUEGO', i:atqs.FUEGO}, {t:'AGUA', i:atqs.AGUA}
      ],
      Ratigueya: [
        {t:'FUEGO', i:atqs.FUEGO}, {t:'FUEGO', i:atqs.FUEGO}, {t:'FUEGO', i:atqs.FUEGO}, 
        {t:'TIERRA', i:atqs.TIERRA}, {t:'AGUA', i:atqs.AGUA}
      ]
    };

    setMiMokepon(nombre);
    setMisAtaques(config[nombre] || []);
    setVista('MAPA');
  };

  const iniciarBatalla = (nombreEnemigo) => {
    setEnemigo({ nombre: nombreEnemigo });
    setVista('BATALLA');
  };

  const ejecutarAtaque = (ataque, index) => {
    const opciones = ['FUEGO', 'AGUA', 'TIERRA'];
    const atqCPU = opciones[Math.floor(Math.random() * 3)];
    resolverRonda(ataque.t, atqCPU);
    setMisAtaques(prev => prev.filter((_, i) => i !== index));
  };

  const resolverRonda = (jugador, cpu) => {
    let res = 'EMPATE';
    if ((jugador === 'FUEGO' && cpu === 'TIERRA') || 
        (jugador === 'AGUA' && cpu === 'FUEGO') || 
        (jugador === 'TIERRA' && cpu === 'AGUA')) {
      res = 'GANASTE';
      setVictorias(v => v + 1);
    } else if (jugador !== cpu) {
      res = 'PERDISTE';
      setDerrotas(d => d + 1);
    }
    setHistorial(prev => [{ j: jugador, e: cpu, res }, ...prev]);
  };

  const volverAlMapa = () => {
    // Restaurar ataques
    const atqs = ASSETS.ATAQUES;
    const config = {
      Hipodoge: [
        {t:'AGUA', i:atqs.AGUA}, {t:'AGUA', i:atqs.AGUA}, {t:'AGUA', i:atqs.AGUA}, 
        {t:'FUEGO', i:atqs.FUEGO}, {t:'TIERRA', i:atqs.TIERRA}
      ],
      Capipepo: [
        {t:'TIERRA', i:atqs.TIERRA}, {t:'TIERRA', i:atqs.TIERRA}, {t:'TIERRA', i:atqs.TIERRA}, 
        {t:'FUEGO', i:atqs.FUEGO}, {t:'AGUA', i:atqs.AGUA}
      ],
      Ratigueya: [
        {t:'FUEGO', i:atqs.FUEGO}, {t:'FUEGO', i:atqs.FUEGO}, {t:'FUEGO', i:atqs.FUEGO}, 
        {t:'TIERRA', i:atqs.TIERRA}, {t:'AGUA', i:atqs.AGUA}
      ]
    };
    setMisAtaques(config[miMokepon] || []);
    setHistorial([]);
    setEnemigo(null);
    setVista('MAPA');
  };

  // ========================================
  // VISTA: SELECCIÓN DE MASCOTA
  // ========================================
  if (vista === 'SELECCION') return (
    <div className="main-container">
      <h1 className="title">🎮 MOKEPON</h1>
      <h2 style={{ marginBottom: '30px', fontSize: '1.5rem', opacity: 0.9 }}>
        ELIGE TU MASCOTA
      </h2>
      <div className="grid-seleccion">
        {mokepones.map(m => (
          <div 
            key={m.id} 
            className="card-selec" 
            onClick={() => seleccionarMascota(m.nombre)}
          >
            <img src={ASSETS.PERSONAJES[m.nombre.toLowerCase()]} width="120" alt={m.nombre} />
            <h3>{m.nombre}</h3>
            <p style={{ opacity: 0.8, marginBottom: '15px', fontSize: '1.1rem' }}>{m.tipo}</p>
            <button>ELEGIR</button>
          </div>
        ))}
      </div>
    </div>
  );

  // ========================================
  // VISTA: MAPA
  // ========================================
  if (vista === 'MAPA') return (
    <div className="main-container">
      <h1 className="title">🗺️ BUSCA UN ENEMIGO</h1>
      <p style={{ 
        fontSize: '1.2rem', 
        marginBottom: '20px', 
        textAlign: 'center',
        opacity: 0.9 
      }}>
        Choca con un Mokepon salvaje para iniciar batalla
      </p>
      <Mapa 
        mascotaJugador={miMokepon}
        alEntrarEnBatalla={iniciarBatalla}
      />
    </div>
  );

  // ========================================
  // VISTA: BATALLA
  // ========================================
  if (vista === 'BATALLA') return (
    <div style={{ minHeight: '100vh', padding: '20px' }}>
      <div className="battle-layout">
        <div className="combat-side">
          <h2 className="title">⚔️ ¡BATALLA!</h2>
          
          <div className="vs-container">
            <div className="fighter-card">
              <p>TÚ</p>
              <img src={ASSETS.PERSONAJES[miMokepon?.toLowerCase()]} width="100" alt={miMokepon} />
              <h3>{miMokepon}</h3>
            </div>
            
            <div className="vs-badge">VS</div>
            
            <div className="fighter-card">
              <p>RIVAL</p>
              <img src={ASSETS.PERSONAJES[enemigo?.nombre.toLowerCase()]} width="100" alt={enemigo?.nombre} />
              <h3>{enemigo?.nombre}</h3>
            </div>
          </div>

          <div className="ataques-grid">
            {misAtaques.map((atq, i) => (
              <button 
                key={i} 
                className="btn-atq"
                onClick={() => ejecutarAtaque(atq, i)}
                title={atq.t}
              >
                <img src={atq.i} alt={atq.t} />
              </button>
            ))}
          </div>

          {misAtaques.length === 0 && historial.length > 0 && (
            <div style={{ marginTop: '30px' }}>
              <button 
                className="btn-reiniciar"
                onClick={volverAlMapa}
              >
                🗺️ VOLVER AL MAPA
              </button>
            </div>
          )}
        </div>

        <div className="historial-side">
          <h3>📜 HISTORIAL DE COMBATE</h3>
          
          <div style={{
            background: 'rgba(255, 255, 255, 0.1)',
            padding: '15px',
            borderRadius: '10px',
            marginBottom: '20px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>
              🏆 Victorias: <span style={{ color: '#22c55e' }}>{victorias}</span>
            </div>
            <div style={{ fontSize: '1.1rem', fontWeight: 'bold', marginTop: '8px' }}>
              💀 Derrotas: <span style={{ color: '#ef4444' }}>{derrotas}</span>
            </div>
          </div>

          {historial.map((h, i) => (
            <div 
              key={i} 
              className={`mensaje-historial ${
                h.res === 'GANASTE' ? 'win-border' : 
                h.res === 'PERDISTE' ? 'lose-border' : ''
              }`}
            >
              Tu <strong>{h.j}</strong> vs <strong>{h.e}</strong> → {h.res}
            </div>
          ))}

          {historial.length === 5 && (
            <div className="final-banner">
              <h2>{victorias > derrotas ? "🎉 ¡VICTORIA!" : derrotas > victorias ? "💀 DERROTA" : "🤝 EMPATE"}</h2>
              <p style={{ marginTop: '10px', fontSize: '1.1rem' }}>
                Resultado: {victorias} - {derrotas}
              </p>
              <button 
                className="btn-reiniciar"
                onClick={volverAlMapa}
              >
                🗺️ VOLVER AL MAPA
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return null;
}

export default App;