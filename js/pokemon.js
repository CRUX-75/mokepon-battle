// --- CONSTANTES (Para evitar errores de escritura) ---
const TIPO_FUEGO = 'FUEGO'
const TIPO_AGUA = 'AGUA'
const TIPO_TIERRA = 'TIERRA'

// Reglas: Quién gana a quién
const VENTAJAS = {
    [TIPO_FUEGO]: TIPO_TIERRA,
    [TIPO_AGUA]: TIPO_FUEGO,
    [TIPO_TIERRA]: TIPO_AGUA
}

// --- VARIABLES GLOBALES ---
let ataqueJugador = []
let ataqueEnemigo = []
let victoriasJugador = 0
let victoriasEnemigo = 0
let botones = []
let ataquesMokeponEnemigo = []

// --- BASE DE DATOS MOKEPONES ---
const MOKEPONES = {
    'Hipodoge': { 
        nombre: 'Hipodoge', 
        imagen: './assets/hipodoge.png',
        ataques: [
            { nombre: '💧', id: 'boton-agua', tipo: TIPO_AGUA, foto: './assets/agua.png' },
            { nombre: '💧', id: 'boton-agua', tipo: TIPO_AGUA, foto: './assets/agua.png' },
            { nombre: '💧', id: 'boton-agua', tipo: TIPO_AGUA, foto: './assets/agua.png' },
            { nombre: '🔥', id: 'boton-fuego', tipo: TIPO_FUEGO, foto: './assets/fuego.png' },
            { nombre: '🌱', id: 'boton-tierra', tipo: TIPO_TIERRA, foto: './assets/tierra.png' },
        ]
    },
    'Capipepo': { 
        nombre: 'Capipepo', 
        imagen: './assets/capipepo.png',
        ataques: [
            { nombre: '🌱', id: 'boton-tierra', tipo: TIPO_TIERRA, foto: './assets/tierra.png' },
            { nombre: '🌱', id: 'boton-tierra', tipo: TIPO_TIERRA, foto: './assets/tierra.png' },
            { nombre: '🌱', id: 'boton-tierra', tipo: TIPO_TIERRA, foto: './assets/tierra.png' },
            { nombre: '💧', id: 'boton-agua', tipo: TIPO_AGUA, foto: './assets/agua.png' },
            { nombre: '🔥', id: 'boton-fuego', tipo: TIPO_FUEGO, foto: './assets/fuego.png' },
        ]
    },
    'Ratigueya': { 
        nombre: 'Ratigueya', 
        imagen: './assets/ratigueya.png',
        ataques: [
            { nombre: '🔥', id: 'boton-fuego', tipo: TIPO_FUEGO, foto: './assets/fuego.png' },
            { nombre: '🔥', id: 'boton-fuego', tipo: TIPO_FUEGO, foto: './assets/fuego.png' },
            { nombre: '🔥', id: 'boton-fuego', tipo: TIPO_FUEGO, foto: './assets/fuego.png' },
            { nombre: '💧', id: 'boton-agua', tipo: TIPO_AGUA, foto: './assets/agua.png' },
            { nombre: '🌱', id: 'boton-tierra', tipo: TIPO_TIERRA, foto: './assets/tierra.png' },
        ]
    }
}

// --- UTILIDADES ---
const getId = (id) => document.getElementById(id)
const ocultarElemento = (id) => getId(id).style.display = 'none'
const mostrarElemento = (id) => getId(id).style.display = 'block'
const aleatorio = (min, max) => Math.floor(Math.random() * (max - min + 1) + min)

// --- INICIO ---
function iniciarJuego() {
    ocultarElemento('seleccionar-ataque')
    ocultarElemento('reiniciar')
    
    getId('boton-mascota').addEventListener('click', seleccionarMascotaJugador)
    getId('boton-reiniciar').addEventListener('click', reiniciarJuego)
}

// --- SELECCIÓN ---
function seleccionarMascotaJugador() {
    const inputSeleccionado = document.querySelector('input[name="mascota"]:checked')

    if (!inputSeleccionado) {
        alert('⚠️ Selecciona una mascota primero')
        return
    }

    const nombreMascota = inputSeleccionado.value
    const datosMascota = MOKEPONES[nombreMascota]

    getId('mascota-jugador').innerHTML = datosMascota.nombre
    getId('imagen-jugador').src = datosMascota.imagen

    // Renderizar ataques
    mostrarAtaques(datosMascota.ataques)

    ocultarElemento('seleccionar-mascota')
    mostrarElemento('seleccionar-ataque')
    
    seleccionarMascotaEnemigo()
}

function seleccionarMascotaEnemigo() {
    const nombresDisponibles = Object.keys(MOKEPONES)
    const indiceAleatorio = aleatorio(0, nombresDisponibles.length - 1)
    const nombreEnemigo = nombresDisponibles[indiceAleatorio]
    const datosEnemigo = MOKEPONES[nombreEnemigo]

    getId('mascota-enemigo').innerHTML = datosEnemigo.nombre
    getId('imagen-enemigo').src = datosEnemigo.imagen
    
    // Clonación segura del array de ataques
    ataquesMokeponEnemigo = [...datosEnemigo.ataques]
    mostrarAtaquesEnemigo(ataquesMokeponEnemigo)
}

// --- RENDERIZADO OPTIMIZADO ---
function mostrarAtaques(ataques) {
    const contenedorAtaques = getId('contenedor-ataques')
    let ataquesHTML = "" // Variable temporal (Buffer)

    ataques.forEach((ataque, index) => {
        // Usamos dataset.tipo para guardar si es FUEGO/AGUA/TIERRA en el HTML
        ataquesHTML += `
        <button id="${ataque.id}-${index}" class="boton-de-ataque bAtaque" data-tipo="${ataque.tipo}">
             <img src="${ataque.foto}" alt="${ataque.nombre}" style="pointer-events: none">
        </button>
        `
    })

    // Una sola inserción al DOM (Mucho más rápido)
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
    
    // Una sola inserción al DOM
    contenedor.innerHTML = html
}

// --- SECUENCIA DE JUEGO ---
function secuenciaAtaque() {
    botones.forEach((boton) => {
        boton.addEventListener('click', (e) => {
            // Leemos el tipo directamente del data-attribute que guardamos antes
            // Esto es más seguro que leer el ID o el texto
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
    
    // Usamos la propiedad .tipo que agregamos a la BD
    ataqueEnemigo.push(ataqueObjeto.tipo)

    // Visual: Apagar botón
    let botonAtaqueEnemigo = document.getElementById(ataqueObjeto.id_unico)
    if (botonAtaqueEnemigo) {
        botonAtaqueEnemigo.classList.add('ataque-gastado')
    }

    // Lógica: Eliminar carta
    ataquesMokeponEnemigo.splice(indiceAleatorio, 1)
    
    iniciarPelea()
}

function iniciarPelea() {
    if (ataqueJugador.length === ataqueEnemigo.length) {
        combate()
    }
}

// --- COMBATE OPTIMIZADO (Sin if/else gigantes) ---
function combate() {
    let index = ataqueJugador.length - 1
    let jugador = ataqueJugador[index]
    let enemigo = ataqueEnemigo[index]
    let resultado = ""

    if (jugador === enemigo) {
        resultado = "EMPATE"
    } else if (VENTAJAS[jugador] === enemigo) {
        // Si mi ataque tiene ventaja sobre el enemigo (Ej: AGUA[FUEGO])
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

// --- MENSAJES ---
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

window.addEventListener('load', iniciarJuego)