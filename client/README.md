# ⚔️ Mokepon - Interactive 2D RPG Game

[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Canvas API](https://img.shields.io/badge/Canvas_API-E34F26?style=for-the-badge&logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)

**Mokepon** es un juego web interactivo donde exploras un mundo 2D, encuentras enemigos CPU con IA y los enfrentas en batallas por turnos. Inspirado en los clásicos RPG de monstruos coleccionables, combina exploración libre con combate estratégico tipo piedra-papel-tijera.

![Mokepon Gameplay](https://via.placeholder.com/800x400?text=Gameplay+Preview)

---

## 🎮 Características

- **🗺️ Exploración en Tiempo Real:** Mundo 2D renderizado con Canvas API donde puedes moverte libremente
- **🤖 Enemigos CPU Inteligentes:** De 3 a 5 enemigos que se mueven autónomamente por el mapa
- **⚔️ Sistema de Combate por Turnos:** Mecánica de 5 rondas con tipos elementales (Agua 💧, Fuego 🔥, Tierra 🌱)
- **📱 100% Responsive:** Jugable en móviles, tablets y desktop
- **🎨 Interfaz Moderna:** Diseño con glassmorphism, animaciones suaves y feedback visual inmediato
- **📊 Historial de Combate:** Registro visual de cada batalla con contadores de victorias/derrotas
- **♻️ Rejugabilidad:** Vuelve al mapa tras cada batalla para enfrentar más enemigos

---

## 🛠️ Stack Tecnológico

| Tecnología          | Uso                                  |
| ------------------- | ------------------------------------ |
| **React 18+**       | Framework frontend con Hooks         |
| **Canvas API**      | Renderizado 2D del mapa y sprites    |
| **Vite**            | Build tool y dev server ultra-rápido |
| **CSS3**            | Estilos modernos con animaciones     |
| **JavaScript ES6+** | Lógica del juego y game loops        |

### ❌ No requiere:

- Backend (Node.js/Express)
- Base de datos
- WebSockets
- Dependencias externas complejas

---

## 📁 Estructura del Proyecto

```
mokepon/
├── public/
│   └── assets/              # Sprites y mapas (600x600px)
│       ├── mokemap.png
│       ├── hipodoge.png
│       ├── capipepo.png
│       ├── ratigueya.png
│       ├── agua.png
│       ├── fuego.png
│       └── tierra.png
├── src/
│   ├── App.jsx              # Orquestador principal (vistas y estado)
│   ├── Mapa.jsx             # Motor del mapa (Canvas + IA enemigos)
│   ├── App.css              # Estilos completos + responsive
│   └── config/
│       └── assets.js        # Configuración centralizada de rutas
├── index.html
├── package.json
└── vite.config.js
```

---

## 🚀 Instalación y Ejecución

### Prerrequisitos

- Node.js 16+ y npm

### Pasos:

1. **Clonar el repositorio:**

```bash
git clone https://github.com/tu-usuario/mokepon.git
cd mokepon
```

2. **Instalar dependencias:**

```bash
npm install
```

3. **Iniciar servidor de desarrollo:**

```bash
npm run dev
```

4. **Abrir en el navegador:**

```
http://localhost:5173
```

---

## 🎯 Cómo Jugar

### 1️⃣ Selección de Mascota

Elige entre tres Mokepones, cada uno con su tipo elemental:

- **Hipodoge** 💧 (Agua): 3 ataques de agua + 1 fuego + 1 tierra
- **Capipepo** 🌱 (Tierra): 3 ataques de tierra + 1 fuego + 1 agua
- **Ratigueya** 🔥 (Fuego): 3 ataques de fuego + 1 tierra + 1 agua

### 2️⃣ Exploración del Mapa

- Usa **WASD** o **flechas de dirección** para moverte
- Busca enemigos CPU que se mueven aleatoriamente
- Choca con ellos para iniciar batalla

### 3️⃣ Batalla por Turnos

- Elige un ataque (los botones muestran el tipo elemental)
- El CPU elige aleatoriamente su ataque
- Se resuelve según la lógica de tipos:
  - 💧 **Agua** vence a 🔥 **Fuego**
  - 🔥 **Fuego** vence a 🌱 **Tierra**
  - 🌱 **Tierra** vence a 💧 **Agua**

### 4️⃣ Victoria y Continuación

- Gana quien tenga más victorias después de 5 rondas
- Vuelve al mapa para buscar más enemigos
- ¡Derrota a todos para completar el juego!

---

## 🧠 Arquitectura Técnica

### Game Loops Optimizados

```javascript
// Jugador: 60 FPS (movimiento suave)
setInterval(actualizarJugador, 1000 / 60);

// Enemigos CPU: 20 FPS (optimización de rendimiento)
setInterval(actualizarEnemigos, 50);
```

### Sistema de Colisiones (AABB)

```javascript
const colision =
  jugador.x < enemigo.x + 40 &&
  jugador.x + 40 > enemigo.x &&
  jugador.y < enemigo.y + 40 &&
  jugador.y + 40 > enemigo.y;
```

### IA de Enemigos

- Movimiento autónomo con velocidad aleatoria
- Rebote físico en los bordes del mapa
- Cambio de dirección probabilístico (5%)

### Gestión de Estado (React)

- `useState` para vistas, combates e historial
- `useRef` para imágenes, canvas y teclas presionadas
- `useEffect` para game loops, carga de recursos y event listeners

---

## 🎨 Personalización

### Agregar un Nuevo Mokepon

1. **Coloca el sprite** en `/public/assets/nuevomon.png`

2. **Actualiza `config/assets.js`:**

```javascript
PERSONAJES: {
  // ...existentes
  nuevomon: "/assets/nuevomon.png";
}
```

3. **Añade al array en `App.jsx`:**

```javascript
const [mokepones] = useState([
  // ...existentes
  { id: 4, nombre: "NuevoMon", tipo: "⚡ Eléctrico" },
]);
```

4. **Define su baraja de ataques:**

```javascript
const config = {
  // ...existentes
  NuevoMon: [
    { t: "FUEGO", i: atqs.FUEGO },
    { t: "FUEGO", i: atqs.FUEGO },
    { t: "AGUA", i: atqs.AGUA },
    { t: "TIERRA", i: atqs.TIERRA },
    { t: "TIERRA", i: atqs.TIERRA },
  ],
};
```

### Cambiar Colores del Tema

Edita las variables CSS en `App.css`:

```css
:root {
  --bg-dark: #0f172a; /* Fondo oscuro */
  --accent: #fbbf24; /* Color de acento */
  --win: #22c55e; /* Color de victoria */
  --lose: #ef4444; /* Color de derrota */
}
```

---

## 📊 Optimizaciones de Performance

✅ **Separación de game loops** (60 FPS jugador, 20 FPS enemigos)  
✅ **Uso de useRef** para evitar re-renders innecesarios  
✅ **Carga asíncrona de recursos** con `Promise.all()`  
✅ **Cleanup de event listeners** para prevenir memory leaks  
✅ **Renderizado condicional** hasta que los recursos estén listos  
✅ **Algoritmo AABB optimizado** O(n) con máximo 5 enemigos

---

## 🚧 Roadmap de Mejoras

### Corto Plazo

- [ ] Sistema de puntuación con localStorage
- [ ] Power-ups en el mapa (vida extra, ataques especiales)
- [ ] Sonidos y música de fondo
- [ ] Más tipos de ataques (Rayo, Hielo, Veneno)

### Mediano Plazo

- [ ] Sistema de niveles y evolución
- [ ] Inventario de objetos
- [ ] Múltiples mapas con teletransportadores
- [ ] Modo historia con NPCs y diálogos

### Largo Plazo

- [ ] Modo multijugador con WebSockets
- [ ] Sistema de clanes/equipos
- [ ] Torneos automáticos
- [ ] Editor de mapas personalizado

---

## 📸 Screenshots

### Selección de Mascota

![Selección](https://via.placeholder.com/600x400?text=Pantalla+de+Selecci%C3%B3n)

### Exploración del Mapa

![Mapa](https://via.placeholder.com/600x400?text=Mapa+de+Exploraci%C3%B3n)

### Batalla

![Batalla](https://via.placeholder.com/600x400?text=Sistema+de+Combate)

---

## 🤝 Contribuciones

Las contribuciones son bienvenidas! Si quieres mejorar el juego:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/nuevaCaracteristica`)
3. Commit tus cambios (`git commit -m 'Agrega nueva característica'`)
4. Push a la rama (`git push origin feature/nuevaCaracteristica`)
5. Abre un Pull Request

---

## 📝 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.

---

## 👨‍💻 Autor

**Nabit Mikan Castano**

- GitHub: [@tu-usuario](https://github.com/tu-usuario)
- LinkedIn: [Tu Perfil](https://linkedin.com/in/tu-perfil)

---

## 🙏 Agradecimientos

- Inspirado en los clásicos juegos de RPG de monstruos coleccionables
- Sprites y assets del curso de Programación Básica de Platzi
- Comunidad de React por las increíbles herramientas

---

## 📚 Documentación Adicional

Para información técnica detallada, consulta:

- [Documentación Técnica Completa](DOCUMENTATION.md)
- [Guía de Contribución](CONTRIBUTING.md)

---

⭐ **Si te gusta el proyecto, dale una estrella!** ⭐

---

**Última actualización:** Diciembre 2024  
**Versión:** 2.0 (Solo CPU)  
**Estado:** ✅ Producción
