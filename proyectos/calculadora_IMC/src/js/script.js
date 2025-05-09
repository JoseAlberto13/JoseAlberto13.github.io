// Constantes para categorías de IMC
const CATEGORIAS_IMC = {
    BAJO_PESO: { max: 18.5, color: '#ffeaa7', texto: 'Bajo Peso'},
    NORMAL: { max: 25, color: '#55efc4', texto: 'Peso Normal'},
    SOBREPESO: { max: 30, color: '#fab1a0', texto: 'Sobrepeso'},
    OBESIDAD: { max: 40, color: '#ff7675', texto: 'Obesidad'},
    OBESIDAD_MORBIDA: { max: Infinity, color: '#ff7675', texto: 'Obesidad Mórbida',}
};

// Variables para el control de ajuste
let intervaloAjuste;
let ajusteActivo = false;

function calcularIMC() {
    const peso = parseFloat(document.getElementById('peso').value);
    const altura = parseFloat(document.getElementById('altura').value);
    const imc = peso / (altura * altura);
    
    // Encontrar la categoría correspondiente
    const categoria = Object.values(CATEGORIAS_IMC).find(cat => imc < cat.max);
    
    // Actualizar la visualización
    document.getElementById('imc-valor').textContent = imc.toFixed(1);
    document.getElementById('imc-categoria').textContent = categoria.texto;
    
    // Actualizar el color del círculo
    document.querySelector('.imc-circle').style.background = categoria.color;
}

function actualizarValores() {
    const peso = document.getElementById('peso');
    const altura = document.getElementById('altura');
    document.getElementById('peso-valor').textContent = `${peso.value} kg`;
    document.getElementById('altura-valor').textContent = `${altura.value} m`;
    calcularIMC();
}

function ajustarValor(tipo, incremento) {
    const input = document.getElementById(tipo);
    const valorActual = parseFloat(input.value);
    const nuevoValor = Math.min(Math.max(valorActual + incremento, parseFloat(input.min)), parseFloat(input.max));
    input.value = nuevoValor;
    
    const evento = new Event('input');
    input.dispatchEvent(evento);
}

function iniciarAjusteContinuo(tipo, incremento) {
    if (ajusteActivo) {
        detenerAjuste();
        return;
    }
    
    ajusteActivo = true;
    ajustarValor(tipo, incremento);

    setTimeout(() => {
        if (ajusteActivo) {
            intervaloAjuste = setInterval(() => ajustarValor(tipo, incremento), 50);
        }
    }, 500);
}

function detenerAjuste() {
    ajusteActivo = false;
    clearInterval(intervaloAjuste);
}

// Event Listeners
document.getElementById('peso').addEventListener('input', actualizarValores);
document.getElementById('altura').addEventListener('input', actualizarValores);
window.addEventListener('blur', detenerAjuste);

// Inicialización
calcularIMC();