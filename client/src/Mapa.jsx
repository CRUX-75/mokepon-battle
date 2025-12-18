import { useEffect, useRef, useState } from 'react';
import { ASSETS, API_URL } from './config/assets';

export default function Mapa({ jugadorId, mascotaJugador, alEntrarEnBatalla }) {
  const canvasRef = useRef(null);
  const [pos, setPos] = useState({ x: 50, y: 50 });
  const [enemigos, setEnemigos] = useState([]);
  const imgs = useRef({});
  const [listo, setListo] = useState(false);
  const keysPressed = useRef({});
  const movementInterval = useRef(null);

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
          res(); // Continuar aunque falle
        };
      });
    });
    
    Promise.all(promesas).then(() => {
      setListo(true);
      console.log('Todas las imágenes cargadas');
    });
  }, []);

  // ========================================
  // 2. SINCRONIZAR POSICIÓN CON SERVIDOR (Multijugador)
  // ========================================
  useEffect(() => {
    if (!jugadorId) return;

    const interval = setInterval(() => {
      fetch(`${API_URL}/mokepon/${jugadorId}/posicion`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ x: pos.x, y: pos.y })
      })
        .then(res => res.json())
        .then(data => {
          // Filtrar enemigos (no incluirse a sí mismo)
          setEnemigos(data.enemigos || []);
        })
        .catch(err => {
          console.error('Error sincronizando posición:', err);
        });
    }, 500);

    return () => clearInterval(interval);
  }, [pos, jugadorId]);

  // ========================================
  // 3. DIBUJAR EN CANVAS
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

    // Dibujar enemigos y detectar colisiones
    enemigos.forEach(enemigo => {
      dibujarMokepon(enemigo.mokepon, enemigo.x, enemigo.y);

      // Detección de colisión (AABB - Axis-Aligned Bounding Box)
      const colision = 
        pos.x < enemigo.x + 40 && 
        pos.x + 40 > enemigo.x && 
        pos.y < enemigo.y + 40 && 
        pos.y + 40 > enemigo.y;

      if (colision) {
        alEntrarEnBatalla(enemigo.id);
      }
    });

    // Dibujar jugador
    dibujarMokepon(mascotaJugador, pos.x, pos.y);

  }, [pos, enemigos, listo, mascotaJugador, alEntrarEnBatalla]);

  // ========================================
  // 4. MANEJO DE TECLADO (WASD y Flechas)
  // ========================================
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Prevenir scroll de página con flechas
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }
      keysPressed.current[e.key.toLowerCase()] = true;
    };

    const handleKeyUp = (e) => {
      keysPressed.current[e.key.toLowerCase()] = false;
    };

    // Agregar listeners
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // Game loop para movimiento suave
    movementInterval.current = setInterval(() => {
      const speed = 5; // Píxeles por frame
      let newX = pos.x;
      let newY = pos.y;

      // Detectar teclas presionadas
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

      // Limitar movimiento dentro del canvas (con margen de 50px por el sprite)
      newX = Math.max(0, Math.min(550, newX));
      newY = Math.max(0, Math.min(550, newY));

      // Actualizar posición solo si cambió
      if (newX !== pos.x || newY !== pos.y) {
        setPos({ x: newX, y: newY });
      }
    }, 1000 / 60); // 60 FPS

    // Cleanup
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
  // 5. RENDER
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
          borderRadius: '20px'
        }}>
          <p style={{ fontSize: '1.5rem' }}>Cargando mapa...</p>
        </div>
      )}
      <p className="mapa-instrucciones">
        🎮 Usa las <strong>flechas</strong> o <strong>WASD</strong> para moverte
      </p>
    </div>
  );
}