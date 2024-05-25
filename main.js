const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const timerElement = document.getElementById('timer');
const recolectadaElement = document.getElementById('recolectada');
const restanteElement = document.getElementById('restante');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    ajustarContenedor(); // Ajustar el contenedor cuando se redimensiona la ventana
});

const images = {
    mar: 'images/escenario.jpg',
    botella: 'images/botella.png',
    lata: 'images/lata.png',
    bolsa: 'images/bolsa.png',
    cubrebocas: 'images/cubrebocas.png',
    otroPlastico: 'images/plastico1.png',
    contenedor: 'images/contenedor.png',
    burbuja: 'images/burbuja.png',
};

const basuras = [];
const burbujas = [];
let recolectada = 0;
let tiempoRestante = 60;
let timerInterval = null;
let juegoTerminado = false; // Variable para controlar el estado del juego

class Basura {
    constructor(x, y, tipo) {
        this.x = x;
        this.y = y;
        this.width = 50;
        this.height = 50;
        this.tipo = tipo;
        this.image = new Image();
        this.image.src = images[tipo];
        this.isDragging = false;
    }

    draw() {
        ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
    }

    isClicked(mouseX, mouseY) {
        return mouseX > this.x && mouseX < this.x + this.width && mouseY > this.y && mouseY < this.y + this.height;
    }

    isInContenedor(contenedorX, contenedorY, contenedorWidth, contenedorHeight) {
        return this.x + this.width > contenedorX && this.x < contenedorX + contenedorWidth &&
               this.y + this.height > contenedorY && this.y < contenedorY + contenedorHeight;
    }
}

class Burbuja {
    constructor(x, y, size, speed) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.speed = speed;
        this.image = new Image();
        this.image.src = images.burbuja;
    }

    draw() {
        ctx.drawImage(this.image, this.x, this.y, this.size, this.size);
    }

    update() {
        this.y -= this.speed;
        if (this.y + this.size < 0) {
            this.y = canvas.height + this.size;
        }
    }
}

const mar = new Image();
mar.src = images.mar;

const contenedor = {
    x: 0,
    y: 0,
    width: 150,
    height: 150,
    image: new Image()
};
contenedor.image.src = images.contenedor;

function ajustarContenedor() {
    contenedor.x = (canvas.width - contenedor.width) / 2; // Centrar horizontalmente
    contenedor.y = canvas.height - contenedor.height - 20; // Posición abajo con un pequeño margen
}

function generarBasuras() {
    const tipos = Object.keys(images).filter(tipo => tipo !== 'mar' && tipo !== 'contenedor' && tipo !== 'burbuja');
    for (let i = 0; i < 10; i++) {
        const x = Math.random() * (canvas.width - 50);
        const y = Math.random() * (canvas.height - 50);
        const tipo = tipos[Math.floor(Math.random() * tipos.length)];
        basuras.push(new Basura(x, y, tipo));
    }
    restanteElement.textContent = basuras.length;
}

function generarBurbujas() {
    for (let i = 0; i < 20; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const size = Math.random() * 70 + 40; // Tamaño más grande para las burbujas
        const speed = Math.random() * 2 + 1;
        burbujas.push(new Burbuja(x, y, size, speed));
    }
}

canvas.addEventListener('mousedown', (e) => {
    if (juegoTerminado) return; // No permitir interacciones si el juego ha terminado

    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    basuras.forEach(basura => {
        if (basura.isClicked(mouseX, mouseY)) {
            basura.isDragging = true;
            basura.offsetX = mouseX - basura.x;
            basura.offsetY = mouseY - basura.y;
        }
    });
});

canvas.addEventListener('mousemove', (e) => {
    if (juegoTerminado) return; // No permitir interacciones si el juego ha terminado

    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    basuras.forEach(basura => {
        if (basura.isDragging) {
            basura.x = mouseX - basura.offsetX;
            basura.y = mouseY - basura.offsetY;
        }
    });
});

canvas.addEventListener('mouseup', () => {
    if (juegoTerminado) return; // No permitir interacciones si el juego ha terminado

    basuras.forEach(basura => {
        if (basura.isDragging) {
            basura.isDragging = false;

            // Si la basura está dentro del contenedor, eliminarla y actualizar contadores
            if (basura.isInContenedor(contenedor.x, contenedor.y, contenedor.width, contenedor.height)) {
                const index = basuras.indexOf(basura);
                if (index > -1) {
                    basuras.splice(index, 1);
                    recolectada++;
                    recolectadaElement.textContent = recolectada;
                    restanteElement.textContent = basuras.length;

                    // Si todas las basuras han sido recolectadas
                    if (basuras.length === 0) {
                        terminarJuego();
                    }
                }
            }
        }
    });
});

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(mar, 0, 0, canvas.width, canvas.height);
    ctx.drawImage(contenedor.image, contenedor.x, contenedor.y, contenedor.width, contenedor.height);

    burbujas.forEach(burbuja => {
        burbuja.update();
        burbuja.draw();
    });

    basuras.forEach(basura => basura.draw());

    requestAnimationFrame(gameLoop);
}

function startTimer() {
    if (timerInterval) return; // Evita iniciar múltiples temporizadores
    timerElement.textContent = `Iniciar: ${tiempoRestante}`;
    timerInterval = setInterval(() => {
        tiempoRestante--;
        timerElement.textContent = tiempoRestante;
        if (tiempoRestante <= 0 || basuras.length === 0) {
            clearInterval(timerInterval);
            terminarJuego();
        }
    }, 1000);
}

function terminarJuego() {
    juegoTerminado = true;
    clearInterval(timerInterval);
    window.location.href = "final.html"; // Redirigir a la página final
}

mar.onload = () => {
    ajustarContenedor(); // Ajusta la posición del contenedor al cargar la imagen del mar
    generarBasuras();
    generarBurbujas();
    gameLoop();
};

timerElement.addEventListener('click', startTimer);
