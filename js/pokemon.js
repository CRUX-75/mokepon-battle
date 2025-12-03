// =========================================
// 1. CONSTANTES Y CONFIGURACIÓN
// =========================================
const TIPO_FUEGO = 'FUEGO'
const TIPO_AGUA = 'AGUA'
const TIPO_TIERRA = 'TIERRA'

const VENTAJAS = {
    [TIPO_FUEGO]: TIPO_TIERRA,
    [TIPO_AGUA]: TIPO_FUEGO,
    [TIPO_TIERRA]: TIPO_AGUA
}

// =========================================
// 2. VARIABLES GLOBALES
// =========================================
let ataqueJugador = []
let ataqueEnemigo = []
let victoriasJugador = 0
let victoriasEnemigo = 0
let botones = []
let ataquesMokeponEnemigo = []

// Variables del Mapa
let lienzo = document.getElementById('mapa')
let mapa = lienzo.getContext('2d')
let intervalo
let mapaBackground = new Image()
mapaBackground.src = './assets/mokemap.png'

const anchoMaximoMapa = 600

let anchoDelMapa = window.innerWidth - 80 // Restamos más espacio para los márgenes
if (anchoDelMapa < 320) {
    anchoDelMapa = 320 - 40 // Mínimo de seguridad
}
// Ajuste Responsive del Canvas
if (anchoDelMapa > anchoMaximoMapa) {
    anchoDelMapa = anchoMaximoMapa - 20
}
let alturaQueBuscamos = anchoDelMapa * 600 / 800
lienzo.width = anchoDelMapa
lienzo.height = alturaQueBuscamos

// =========================================
// 3. CLASES Y OBJETOS
// =========================================
class Mokepon {
    constructor(nombre, foto, vida, fotoMapa, x = 10, y = 10) {
        this.nombre = nombre
        this.foto = foto
        this.vida = vida
        this.ataques = []
        this.ancho = 40
        this.alto = 40
        this.x = x
        this.y = y
        this.mapaFoto = new Image()
        this.mapaFoto.src = fotoMapa
        this.velocidadX = 0
        this.velocidadY = 0
    }

    pintarMokepon() {
        mapa.drawImage(
            this.mapaFoto,
            this.x,
            this.y,
            this.ancho,
            this.alto
        )
    }
}

// --- Definición de Ataques ---
const HIPODOGE_ATAQUES = [
    { nombre: '💧', id: 'boton-agua', tipo: TIPO_AGUA, foto: './assets/agua.png' },
    { nombre: '💧', id: 'boton-agua', tipo: TIPO_AGUA, foto: './assets/agua.png' },
    { nombre: '💧', id: 'boton-agua', tipo: TIPO_AGUA, foto: './assets/agua.png' },
    { nombre: '🔥', id: 'boton-fuego', tipo: TIPO_FUEGO, foto: './assets/fuego.png' },
    { nombre: '🌱', id: 'boton-tierra', tipo: TIPO_TIERRA, foto: './assets/tierra.png' },
]

const CAPIPEPO_ATAQUES = [
    { nombre: '🌱', id: 'boton-tierra', tipo: TIPO_TIERRA, foto: './assets/tierra.png' },
    { nombre: '🌱', id: 'boton-tierra', tipo: TIPO_TIERRA, foto: './assets/tierra.png' },
    { nombre: '🌱', id: 'boton-tierra', tipo: TIPO_TIERRA, foto: './assets/tierra.png' },
    { nombre: '💧', id: 'boton-agua', tipo: TIPO_AGUA, foto: './assets/agua.png' },
    { nombre: '🔥', id: 'boton-fuego', tipo: TIPO_FUEGO, foto: './assets/fuego.png' },
]

const RATIGUEYA_ATAQUES = [
    { nombre: '🔥', id: 'boton-fuego', tipo: TIPO_FUEGO, foto: './assets/fuego.png' },
    { nombre: '🔥', id: 'boton-fuego', tipo: TIPO_FUEGO, foto: './assets/fuego.png' },
    { nombre: '🔥', id: 'boton-fuego', tipo: TIPO_FUEGO, foto: './assets/fuego.png' },
    { nombre: '💧', id: 'boton-agua', tipo: TIPO_AGUA, foto: './assets/agua.png' },
    { nombre: '🌱', id: 'boton-tierra', tipo: TIPO_TIERRA, foto: './assets/tierra.png' },
]

// --- Creación de Instancias (Jugador) ---
let hipodoge = new Mokepon('Hipodoge', './assets/hipodoge.png', 5, './assets/hipodoge.png')
let capipepo = new Mokepon('Capipepo', './assets/capipepo.png', 5, './assets/capipepo.png')
let ratigueya = new Mokepon('Ratigueya', './assets/ratigueya.png', 5, './assets/ratigueya.png')

hipodoge.ataques.push(...HIPODOGE_ATAQUES)
capipepo.ataques.push(...CAPIPEPO_ATAQUES)
ratigueya.ataques.push(...RATIGUEYA_ATAQUES)

let mokepones = [hipodoge, capipepo, ratigueya]

// --- Creación de Instancias (Enemigos del Mapa) ---
let hipodogeEnemigo = new Mokepon('Hipodoge', './assets/hipodoge.png', 5, './assets/hipodoge.png', 150, 100)
let capipepoEnemigo = new Mokepon('Capipepo', './assets/capipepo.png', 5, './assets/capipepo.png', 250, 180)
let ratigueyaEnemigo = new Mokepon('Ratigueya', './assets/ratigueya.png', 5, './assets/ratigueya.png', 50, 200)

hipodogeEnemigo.ataques.push(...HIPODOGE_ATAQUES)
capipepoEnemigo.ataques.push(...CAPIPEPO_ATAQUES)
ratigueyaEnemigo.ataques.push(...RATIGUEYA_ATAQUES)

// Lista de enemigos para gestionar colisiones fácilmente
let enemigosMapa = [hipodogeEnemigo, capipepoEnemigo, ratigueyaEnemigo]


// =========================================
// 4. FUNCIONES DE INICIO Y SELECCIÓN
// =========================================
function iniciarJuego() {
    ocultarElemento('seleccionar-ataque')
    ocultarElemento('ver-mapa')
    ocultarElemento('reiniciar')
    
    getId('boton-mascota').addEventListener('click', seleccionarMascotaJugador)
    getId('boton-reiniciar').addEventListener('click', reiniciarJuego)
}

function seleccionarMascotaJugador() {
    const inputSeleccionado = document.querySelector('input[name="mascota"]:checked')

    if (!inputSeleccionado) {
        alert('⚠️ Selecciona una mascota primero')
        return
    }

    const nombreMascota = inputSeleccionado.value
    mascotaJugadorObjeto = mokepones.find(mokepon => mokepon.nombre === nombreMascota)

    getId('mascota-jugador').innerHTML = mascotaJugadorObjeto.nombre
    getId('imagen-jugador').src = mascotaJugadorObjeto.foto
    mostrarAtaques(mascotaJugadorObjeto.ataques)

    ocultarElemento('seleccionar-mascota')
    mostrarElemento('ver-mapa')
    iniciarMapa()
}

// =========================================
// 5. LÓGICA DEL MAPA
// =========================================
function iniciarMapa() {
    intervalo = setInterval(pintarCanvas, 50)
    window.addEventListener('keydown', sePresionoTecla)
    window.addEventListener('keyup', detenerMovimiento)
}

function pintarCanvas() {
    // Actualizar posición Jugador
    mascotaJugadorObjeto.x = mascotaJugadorObjeto.x + mascotaJugadorObjeto.velocidadX
    mascotaJugadorObjeto.y = mascotaJugadorObjeto.y + mascotaJugadorObjeto.velocidadY

    // Limpiar Canvas
    mapa.clearRect(0, 0, lienzo.width, lienzo.height)

    // Dibujar Fondo
    mapa.drawImage(mapaBackground, 0, 0, lienzo.width, lienzo.height)

    // Dibujar Jugador
    mascotaJugadorObjeto.pintarMokepon()

    // Dibujar Enemigos y Revisar Colisiones (Optimizado con forEach)
    enemigosMapa.forEach(enemigo => {
        enemigo.pintarMokepon()
        revisarColision(enemigo)
    })
}

function revisarColision(enemigo) {
    const arribaEnemigo = enemigo.y
    const abajoEnemigo = enemigo.y + enemigo.alto
    const derechaEnemigo = enemigo.x + enemigo.ancho
    const izquierdaEnemigo = enemigo.x

    const arribaMascota = mascotaJugadorObjeto.y
    const abajoMascota = mascotaJugadorObjeto.y + mascotaJugadorObjeto.alto
    const derechaMascota = mascotaJugadorObjeto.x + mascotaJugadorObjeto.ancho
    const izquierdaMascota = mascotaJugadorObjeto.x

    if(
        abajoMascota < arribaEnemigo ||
        arribaMascota > abajoEnemigo ||
        derechaMascota < izquierdaEnemigo ||
        izquierdaMascota > derechaEnemigo
    ) {
        return // No hay colisión
    }

    // ¡COLISIÓN DETECTADA!
    detenerMovimiento()
    clearInterval(intervalo)
    
    ocultarElemento('ver-mapa')
    mostrarElemento('seleccionar-ataque')
    seleccionarMascotaEnemigo(enemigo)
}

// Controles de Movimiento
function moverDerecha() { mascotaJugadorObjeto.velocidadX = 5 }
function moverIzquierda() { mascotaJugadorObjeto.velocidadX = -5 }
function moverAbajo() { mascotaJugadorObjeto.velocidadY = 5 }
function moverArriba() { mascotaJugadorObjeto.velocidadY = -5 }

function detenerMovimiento() {
    mascotaJugadorObjeto.velocidadX = 0
    mascotaJugadorObjeto.velocidadY = 0
}

function sePresionoTecla(event) {
    switch (event.key) {
        case 'ArrowUp': moverArriba(); break
        case 'ArrowDown': moverAbajo(); break
        case 'ArrowLeft': moverIzquierda(); break
        case 'ArrowRight': moverDerecha(); break
    }
}

// =========================================
// 6. LÓGICA DE BATALLA
// =========================================
function seleccionarMascotaEnemigo(enemigo) {
    getId('mascota-enemigo').innerHTML = enemigo.nombre
    getId('imagen-enemigo').src = enemigo.foto
    ataquesMokeponEnemigo = [...enemigo.ataques]
    mostrarAtaquesEnemigo(ataquesMokeponEnemigo)
}

function mostrarAtaques(ataques) {
    const contenedorAtaques = getId('contenedor-ataques')
    let ataquesHTML = ""

    ataques.forEach((ataque, index) => {
        ataquesHTML += `
        <button id="${ataque.id}-${index}" class="boton-de-ataque bAtaque" data-tipo="${ataque.tipo}">
             <img src="${ataque.foto}" alt="${ataque.nombre}" style="pointer-events: none">
        </button>
        `
    })

    contenedorAtaques.innerHTML = ataquesHTML
    botones = document.querySelectorAll('.bAtaque')
    secuenciaAtaque()
}

function mostrarAtaquesEnemigo(ataques) {
    const contenedor = getId('ataques-enemigo-contenedor')
    let html = ""

    ataques.forEach((ataque, index) => {
        ataque.id_unico = `enemigo-atk-${index}` 
        html += `
            <div id="${ataque.id_unico}" class="boton-enemigo">
                <img src="${ataque.foto}" alt="${ataque.nombre}">
            </div>
        `
    })
    contenedor.innerHTML = html
}

function secuenciaAtaque() {
    botones.forEach((boton) => {
        boton.addEventListener('click', (e) => {
            const tipoAtaque = e.currentTarget.dataset.tipo
            ataqueJugador.push(tipoAtaque)
            boton.style.background = '#ccc'
            boton.disabled = true 
            ataqueAleatorioEnemigo()
        })
    })
}

function ataqueAleatorioEnemigo() {
    if (ataquesMokeponEnemigo.length === 0) return

    let indiceAleatorio = aleatorio(0, ataquesMokeponEnemigo.length - 1)
    let ataqueObjeto = ataquesMokeponEnemigo[indiceAleatorio]
    
    ataqueEnemigo.push(ataqueObjeto.tipo)

    let botonAtaqueEnemigo = document.getElementById(ataqueObjeto.id_unico)
    if (botonAtaqueEnemigo) {
        botonAtaqueEnemigo.classList.add('ataque-gastado')
    }

    ataquesMokeponEnemigo.splice(indiceAleatorio, 1)
    iniciarPelea()
}

function iniciarPelea() {
    if (ataqueJugador.length === ataqueEnemigo.length) {
        combate()
    }
}

function combate() {
    let index = ataqueJugador.length - 1
    let jugador = ataqueJugador[index]
    let enemigo = ataqueEnemigo[index]
    let resultado = ""

    if (jugador === enemigo) {
        resultado = "EMPATE"
    } else if (VENTAJAS[jugador] === enemigo) {
        resultado = "GANASTE"
        victoriasJugador++
    } else {
        resultado = "PERDISTE"
        victoriasEnemigo++
    }
    
    getId('victorias-jugador').innerHTML = victoriasJugador
    getId('victorias-enemigo').innerHTML = victoriasEnemigo
    crearMensaje(resultado, jugador, enemigo)

    if (ataqueJugador.length === 5) {
        revisarVidas()
    }
}

function revisarVidas() {
    if (victoriasJugador === victoriasEnemigo) {
        crearMensajeFinal("¡ESTO FUE UN EMPATE! 😐")
    } else if (victoriasJugador > victoriasEnemigo) {
        crearMensajeFinal("¡FELICIDADES! Ganaste la Guerra 🎉")
    } else {
        crearMensajeFinal("Lo siento, has perdido la Guerra ☠️")
    }
}

// =========================================
// 7. MENSAJES Y UTILIDADES
// =========================================
function crearMensaje(resultado, ataqueJ, ataqueE) {
    const sectionMensajes = getId('mensajes')
    const parrafo = document.createElement('div')
    parrafo.classList.add('mensaje-batalla')

    if (resultado === 'GANASTE') {
        parrafo.classList.add('ganaste')
        parrafo.innerHTML = `Tú: ${ataqueJ} 🆚 Rival: ${ataqueE} <br> 🎉 GANASTE TURNO`
    } else if (resultado === 'PERDISTE') {
        parrafo.classList.add('perdiste')
        parrafo.innerHTML = `Tú: ${ataqueJ} 🆚 Rival: ${ataqueE} <br> ☠️ PERDISTE TURNO`
    } else {
        parrafo.classList.add('empate')
        parrafo.innerHTML = `Tú: ${ataqueJ} 🆚 Rival: ${ataqueE} <br> 😐 EMPATE`
    }
    sectionMensajes.prepend(parrafo) 
}

function crearMensajeFinal(resultadoFinal) {
    const sectionMensajes = getId('mensajes')
    const parrafo = document.createElement('div')
    parrafo.classList.add('mensaje-batalla', 'mensaje-final')
    parrafo.innerHTML = resultadoFinal
    sectionMensajes.prepend(parrafo)
    mostrarElemento('reiniciar')
}

function reiniciarJuego() {
    location.reload()
}

// Helpers
const getId = (id) => document.getElementById(id)
const ocultarElemento = (id) => getId(id).style.display = 'none'
const mostrarElemento = (id) => getId(id).style.display = 'flex'
const aleatorio = (min, max) => Math.floor(Math.random() * (max - min + 1) + min)

// Arranque
window.addEventListener('load', iniciarJuego)