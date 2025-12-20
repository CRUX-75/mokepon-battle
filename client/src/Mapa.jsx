import { useEffect, useRef, useState } from 'react';
import { ASSETS } from './config/assets';

export default function Mapa({ mascotaJugador, alEntrarEnBatalla }) {
  const canvasRef = useRef(null);
  const [pos, setPos] = useState({ x: 50, y: 50 });
  const [enemigosCPU, setEnemigosCPU] = useState([]);
  const imgs = useRef({});
  const [listo, setListo] = useState(false);
  const keysPressed = useRef({});
  const movementInterval = useRef(null);
  const enemyMovementInterval = useRef(null);

  const MOKEPONES_NOMBRES = ['Hipodoge', 'Capipepo', 'Ratigueya'];

  // ========================================
  // 1. CARGAR IMÁGENES
  // ========================================
  useEffect(() => {
    const recursos = { mapa: ASSETS.MAPA, ...ASSETS.PERSONAJES };
    const promesas = Object.entries(recursos).map(([k, v]) => {
      return new Promise(res => {
        const img = new Image();
        img.src = v;
        img.onload = () => {
          imgs.current[k] = img;
          res();
        };
        img.onerror = () => {
          console.warn(`Error cargando imagen: ${k}`);
          res();
        };
      });
    });
    
    Promise.all(promesas).then(() => {
      setListo(true);
      console.log('✅ Todas las imágenes cargadas');
    });
  }, []);

  // ========================================
  // 2. GENERAR ENEMIGOS CPU ALEATORIOS
  // ========================================
  useEffect(() => {
    if (!listo) return;

    // Generar 3-5 enemigos CPU en posiciones aleatorias
    const numEnemigos = Math.floor(Math.random() * 3) + 3; // 3 a 5 enemigos
    const enemigos = [];

    for (let i = 0; i < numEnemigos; i++) {
      enemigos.push({
        id: `cpu-${i}`,
        nombre: MOKEPONES_NOMBRES[Math.floor(Math.random() * 3)],
        x: Math.random() * 500 + 25, // Entre 25 y 525
        y: Math.random() * 500 + 25,
        dx: (Math.random() - 0.5) * 2, // Velocidad X aleatoria (-1 a 1)
        dy: (Math.random() - 0.5) * 2  // Velocidad Y aleatoria (-1 a 1)
      });
    }

    setEnemigosCPU(enemigos);
    console.log(`🤖 ${numEnemigos} enemigos CPU generados`);
  }, [listo]);

  // ========================================
  // 3. MOVER ENEMIGOS CPU AUTOMÁTICAMENTE
  // ========================================
  useEffect(() => {
    if (enemigosCPU.length === 0) return;

    enemyMovementInterval.current = setInterval(() => {
      setEnemigosCPU(prevEnemigos => 
        prevEnemigos.map(enemigo => {
          let newX = enemigo.x + enemigo.dx;
          let newY = enemigo.y + enemigo.dy;

          // Rebotar en los bordes
          if (newX <= 0 || newX >= 550) {
            enemigo.dx = -enemigo.dx;
            newX = Math.max(0, Math.min(550, newX));
          }
          if (newY <= 0 || newY >= 550) {
            enemigo.dy = -enemigo.dy;
            newY = Math.max(0, Math.min(550, newY));
          }

          // Cambiar dirección aleatoriamente (5% de probabilidad)
          if (Math.random() < 0.05) {
            enemigo.dx = (Math.random() - 0.5) * 2;
            enemigo.dy = (Math.random() - 0.5) * 2;
          }

          return { ...enemigo, x: newX, y: newY };
        })
      );
    }, 50); // 20 FPS para enemigos

    return () => {
      if (enemyMovementInterval.current) {
        clearInterval(enemyMovementInterval.current);
      }
    };
  }, [enemigosCPU.length]);

  // ========================================
  // 4. DIBUJAR EN CANVAS
  // ========================================
  useEffect(() => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!listo || !ctx) return;

    // Limpiar canvas
    ctx.clearRect(0, 0, 600, 600);

    // Dibujar mapa de fondo
    if (imgs.current.mapa) {
      ctx.drawImage(imgs.current.mapa, 0, 0, 600, 600);
    }

    // Función auxiliar para dibujar mokepones
    const dibujarMokepon = (nombre, x, y) => {
      const imgKey = nombre?.toLowerCase();
      const img = imgs.current[imgKey] || imgs.current.hipodoge;
      if (img) {
        ctx.drawImage(img, x, y, 50, 50);
      }
    };

    // Dibujar enemigos CPU y detectar colisiones
    enemigosCPU.forEach(enemigo => {
      dibujarMokepon(enemigo.nombre, enemigo.x, enemigo.y);

      // Detección de colisión
      const colision = 
        pos.x < enemigo.x + 40 && 
        pos.x + 40 > enemigo.x && 
        pos.y < enemigo.y + 40 && 
        pos.y + 40 > enemigo.y;

      if (colision) {
        // Remover enemigo del mapa
        setEnemigosCPU(prev => prev.filter(e => e.id !== enemigo.id));
        // Iniciar batalla
        alEntrarEnBatalla(enemigo.nombre);
      }
    });

    // Dibujar jugador
    dibujarMokepon(mascotaJugador, pos.x, pos.y);

  }, [pos, enemigosCPU, listo, mascotaJugador, alEntrarEnBatalla]);

  // ========================================
  // 5. MANEJO DE TECLADO (WASD y Flechas)
  // ========================================
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }
      keysPressed.current[e.key.toLowerCase()] = true;
    };

    const handleKeyUp = (e) => {
      keysPressed.current[e.key.toLowerCase()] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // Game loop para movimiento del jugador
    movementInterval.current = setInterval(() => {
      const speed = 4; // Píxeles por frame
      let newX = pos.x;
      let newY = pos.y;

      if (keysPressed.current['arrowup'] || keysPressed.current['w']) {
        newY -= speed;
      }
      if (keysPressed.current['arrowdown'] || keysPressed.current['s']) {
        newY += speed;
      }
      if (keysPressed.current['arrowleft'] || keysPressed.current['a']) {
        newX -= speed;
      }
      if (keysPressed.current['arrowright'] || keysPressed.current['d']) {
        newX += speed;
      }

      // Limitar movimiento dentro del canvas
      newX = Math.max(0, Math.min(550, newX));
      newY = Math.max(0, Math.min(550, newY));

      if (newX !== pos.x || newY !== pos.y) {
        setPos({ x: newX, y: newY });
      }
    }, 1000 / 60); // 60 FPS

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      if (movementInterval.current) {
        clearInterval(movementInterval.current);
      }
      keysPressed.current = {};
    };
  }, [pos]);

  // ========================================
  // 6. RENDER
  // ========================================
  return (
    <div className="mapa-wrapper">
      <canvas 
        ref={canvasRef} 
        width={600} 
        height={600}
        style={{ display: listo ? 'block' : 'none' }}
      />
      {!listo && (
        <div style={{ 
          width: 600, 
          height: 600, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          background: 'rgba(0,0,0,0.3)',
          borderRadius: '20px',
          border: '4px solid var(--accent)'
        }}>
          <p style={{ fontSize: '1.5rem' }}>⏳ Cargando mapa...</p>
        </div>
      )}
      <p className="mapa-instrucciones">
        🎮 Usa las <strong>flechas</strong> o <strong>WASD</strong> para moverte
        <br />
        💥 Choca con los enemigos para iniciar batalla ({enemigosCPU.length} restantes)
      </p>
    </div>
  );
}