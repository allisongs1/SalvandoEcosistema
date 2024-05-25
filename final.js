window.addEventListener('load', () => {
    const canvas = document.getElementById('finalCanvas');
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const finalImage = new Image();
    finalImage.src = 'images/final1.png'; // Ruta de la imagen de recomendaciones
    finalImage.onload = () => {
        ctx.drawImage(finalImage, 0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'white';
        ctx.font = '48px Arial';
        
    };
});
// JavaScript Document