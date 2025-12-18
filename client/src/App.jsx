import { useEffect, useState } from 'react';
import Mapa from './Mapa';
import { ASSETS, API_URL } from './config/assets';
import './App.css';

function App() {
  const [vista, setVista] = useState('MODO_INICIAL');
  const [modo, setModo] = useState(null);
  const [jugadorId, setJugadorId] = useState(null);
  const [mokepones, setMokepones] = useState([]);
  const [miMokepon, setMiMokepon] = useState(null);
  const [enemigo, setEnemigo] = useState({ nombre: 'Rival', id: null });
  const [misAtaques, setMisAtaques] = useState([]);
  const [historial, setHistorial] = useState([]);
  const [victorias, setVictorias] = useState(0);
  const [derrotas, setDerrotas] = useState(0);

  useEffect(() => {
    fetch(`${API_URL}/mokepones`).then(res => res.json()).then(setMokepones);
  }, []);

  const iniciarModo = (m) => {
    setModo(m);
    if (m === 'MULTI') {
      fetch(`${API_URL}/unirse`).then(res => res.text()).then(setJugadorId);
    }
    setVista('SELECCION');
  };

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

    if (modo === 'MULTI') {
      fetch(`${API_URL}/mokepon/${jugadorId}`, {
        method: "post",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mokepon: nombre })
      }).then(() => setVista('MAPA'));
    } else {
      setEnemigo({ nombre: 'Ratigueya CPU', id: 'cpu' });
      setVista('BATALLA');
    }
  };

  const ejecutarAtaque = (ataque, index) => {
    if (modo === 'CPU') {
      const opciones = ['FUEGO', 'AGUA', 'TIERRA'];
      const atqCPU = opciones[Math.floor(Math.random() * 3)];
      resolverRonda(ataque.t, atqCPU);
    } else {
      fetch(`${API_URL}/mokepon/${jugadorId}/ataque`, {
        method: "post",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ataque: ataque.t })
      });
      revisarCombateMulti();
    }
    setMisAtaques(prev => prev.filter((_, i) => i !== index));
  };

  const resolverRonda = (j, e) => {
    let res = 'EMPATE';
    if ((j === 'FUEGO' && e === 'TIERRA') || (j === 'AGUA' && e === 'FUEGO') || (j === 'TIERRA' && e === 'AGUA')) {
      res = 'GANASTE';
      setVictorias(v => v + 1);
    } else if (j !== e) {
      res = 'PERDISTE';
      setDerrotas(d => d + 1);
    }
    setHistorial(prev => [{ j, e, res }, ...prev]);
  };

  const revisarCombateMulti = () => {
    const int = setInterval(() => {
      fetch(`${API_URL}/mokepon/${jugadorId}/combate/${enemigo.id}`)
        .then(res => res.json())
        .then(data => {
          if (data.resultado !== 'PENDIENTE') {
            clearInterval(int);
            resolverRonda(data.ataqueMio, data.ataqueEnemigo);
          }
        });
    }, 1000);
  };

  // Vistas
  if (vista === 'MODO_INICIAL') return (
    <div className="main-container">
      <h1 className="title">Mokepon Online</h1>
      <div className="modo-selector">
        <button className="btn-modo" onClick={() => iniciarModo('CPU')}>SOLO vs CPU</button>
        <button className="btn-modo multi" onClick={() => iniciarModo('MULTI')}>ONLINE</button>
      </div>
    </div>
  );

  if (vista === 'BATALLA') return (
    <div className="battle-layout">
      <div className="combat-side">
        <h2 className="title">¡ATAQUE! ⚔️</h2>
        <div className="vs-container">
          <div className="fighter-card">
            <p>TUYO</p>
            <img src={ASSETS.PERSONAJES[miMokepon.toLowerCase()]} width="100" />
            <h3>{miMokepon}</h3>
          </div>
          <div className="vs-badge">VS</div>
          <div className="fighter-card">
            <p>RIVAL</p>
            <img src={ASSETS.PERSONAJES[enemigo.nombre.toLowerCase().split(' ')[0]]} width="100" />
            <h3>{enemigo.nombre}</h3>
          </div>
        </div>

        <div className="ataques-grid">
          {misAtaques.map((atq, i) => (
            <button key={i} className="btn-atq" onClick={() => ejecutarAtaque(atq, i)}>
              <img src={atq.i} alt={atq.t} />
            </button>
          ))}
        </div>
      </div>

      <div className="historial-side">
        <h3>HISTORIAL DE COMBATE</h3>
        {historial.map((h, i) => (
          <div key={i} className={`mensaje-historial ${h.res === 'GANASTE' ? 'win-border' : h.res === 'PERDISTE' ? 'lose-border' : ''}`}>
            Tu {h.j} venció a {h.e} 👉 {h.res}
          </div>
        ))}
        {historial.length === 5 && (
          <div className="final-banner">
            <h2>{victorias > derrotas ? "¡VICTORIA FINAL! 🎉" : "DERROTA TOTAL 💀"}</h2>
            <button className="btn-reiniciar" onClick={() => window.location.reload()}>REINICIAR</button>
          </div>
        )}
      </div>
    </div>
  );

  if (vista === 'MAPA') return (
    <div className="main-container">
      <h1>BUSCA UN ENEMIGO</h1>
      <div className="mapa-wrapper">
        <Mapa jugadorId={jugadorId} mascotaJugador={miMokepon} alEntrarEnBatalla={(id) => { setEnemigo({nombre:'Enemigo Online', id}); setVista('BATALLA'); }} />
      </div>
    </div>
  );

  if (vista === 'SELECCION') return (
    <div className="main-container">
      <h1 className="title">ELIGE TU MASCOTA</h1>
      <div className="grid-seleccion">
        {mokepones.map(m => (
          <div key={m.id} className="card-selec" onClick={() => seleccionarMascota(m.nombre)}>
            <img src={ASSETS.PERSONAJES[m.nombre.toLowerCase()]} width="80" />
            <h3>{m.nombre}</h3>
            <button>ELEGIR</button>
          </div>
        ))}
      </div>
    </div>
  );

  return null;
}

export default App;