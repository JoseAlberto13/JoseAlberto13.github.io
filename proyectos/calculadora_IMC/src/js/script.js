// Constantes para categorías de IMC
const CATEGORIAS_IMC = {
    BAJO_PESO: { max: 18.5, color: '#ffeaa7', texto: 'Bajo Peso' },
    NORMAL: { max: 25, color: '#55efc4', texto: 'Peso Normal' },
    SOBREPESO: { max: 30, color: '#fab1a0', texto: 'Sobrepeso' },
    OBESIDAD: { max: 40, color: '#ff7675', texto: 'Obesidad' },
    OBESIDAD_MORBIDA: { max: Infinity, color: '#ff7675', texto: 'Obesidad Mórbida' }
};

// Datos aproximados de percentiles OMS
const datosOMSPeso = {
    12: [7.7, 8.4, 9.6, 10.9, 12.4], // 1 año
    24: [9.7, 10.5, 12.2, 14.3, 16.5], // 2 años
    36: [11.3, 12.2, 14.3, 17.0, 19.9], // 3 años
    48: [12.7, 13.7, 16.3, 19.8, 23.6], // 4 años
    60: [14.1, 15.3, 18.4, 22.7, 27.4], // 5 años
    72: [15.5, 16.9, 20.5, 25.6, 31.2], // 6 años
    84: [16.9, 18.6, 22.9, 29.1, 35.8], // 7 años
    96: [18.4, 20.3, 25.4, 32.7, 40.6], // 8 años
    108: [20.0, 22.2, 28.1, 36.9, 46.2] // 9 años
};

const datosOMSAltura = {
    12: [71.0, 73.4, 76.1, 78.8, 81.5], // 1 año (en cm)
    24: [82.5, 85.1, 87.8, 90.4, 93.0], // 2 años
    36: [91.9, 94.8, 97.5, 100.1, 102.7], // 3 años
    48: [99.9, 102.9, 105.7, 108.5, 111.3], // 4 años
    60: [107.2, 110.2, 113.0, 115.7, 118.5], // 5 años
    72: [114.0, 117.0, 119.8, 122.6, 125.4], // 6 años
    84: [120.2, 123.3, 126.1, 128.9, 131.7], // 7 años
    96: [126.0, 129.0, 131.8, 134.6, 137.4], // 8 años
    108: [131.4, 134.5, 137.3, 140.1, 142.9] // 9 años
};

// Variables para el control de ajuste
let intervaloAjuste;
let ajusteActivo = false;
let modoActual = 'adulto';

function cambiarModo(modo) {
    modoActual = modo;

    document.getElementById('btn-adulto').classList.toggle('active', modo === 'adulto');
    document.getElementById('btn-infante').classList.toggle('active', modo === 'infante');

    document.getElementById('age-inputs').classList.toggle('show', modo === 'infante');
    document.getElementById('z-chart-container').classList.toggle('show', modo === 'infante');

    if (modo === 'infante') {
        document.getElementById('peso').setAttribute('min', '3');
        document.getElementById('peso').setAttribute('max', '50');
        document.getElementById('peso').value = '15';
        document.getElementById('altura').setAttribute('min', '0.50');
        document.getElementById('altura').setAttribute('max', '1.50');
        document.getElementById('altura').value = '0.90';
        document.querySelector('[for="altura"]').textContent = 'Altura (m):';
    } else {
        document.getElementById('peso').setAttribute('min', '10');
        document.getElementById('peso').setAttribute('max', '140');
        document.getElementById('peso').value = '70';
        document.getElementById('altura').setAttribute('min', '0.60');
        document.getElementById('altura').setAttribute('max', '2.20');
        document.getElementById('altura').value = '1.70';
        document.querySelector('[for="altura"]').textContent = 'Altura (m):';
    }

    actualizarValores();
}

function calcularIMC() {
    const peso = parseFloat(document.getElementById('peso').value);
    const altura = parseFloat(document.getElementById('altura').value);
    const imc = peso / (altura * altura);

    const categoria = Object.values(CATEGORIAS_IMC).find(cat => imc < cat.max);

    document.getElementById('imc-valor').textContent = imc.toFixed(1);
    document.getElementById('imc-categoria').textContent = categoria.texto;

    document.querySelector('.imc-circle').style.background = categoria.color;

    return imc;
}

function calcularPercentil(valor, datosReferencia) {
    if (!datosReferencia) return 50;

    if (valor <= datosReferencia[0]) return 3;
    if (valor <= datosReferencia[1]) return 15;
    if (valor <= datosReferencia[2]) return 50;
    if (valor <= datosReferencia[3]) return 85;
    if (valor <= datosReferencia[4]) return 97;
    return 99;
}

function actualizarGraficoZ(percentilPeso, percentilAltura) {
    // Generar curva normal
    let curvePoints = [];
    for (let x = 0; x <= 400; x += 10) {
        const z = (x - 200) / 60; // Normalizar
        const y = 140 - (80 * Math.exp(-0.5 * z * z)); // Curva gaussiana invertida
        curvePoints.push(`${x},${y}`);
    }

    document.getElementById('normal-curve').setAttribute('d', `M${curvePoints.join(' L')}`);

    // Actualizar línea del paciente (promedio de percentiles)
    const percentilPromedio = (percentilPeso + percentilAltura) / 2;
    let posicionX = 200; // P50 por defecto

    if (percentilPromedio <= 3) posicionX = 80;
    else if (percentilPromedio <= 15) posicionX = 120;
    else if (percentilPromedio <= 50) posicionX = 160 + (percentilPromedio - 15) * 40 / 35;
    else if (percentilPromedio <= 85) posicionX = 200 + (percentilPromedio - 50) * 80 / 35;
    else if (percentilPromedio <= 97) posicionX = 280 + (percentilPromedio - 85) * 40 / 12;
    else posicionX = 320;

    document.getElementById('patient-line').setAttribute('x1', posicionX);
    document.getElementById('patient-line').setAttribute('x2', posicionX);

    // Área sombreada hasta la posición del paciente
    const areaPoints = [];
    for (let x = 0; x <= posicionX; x += 10) {
        const z = (x - 200) / 60;
        const y = 140 - (80 * Math.exp(-0.5 * z * z));
        areaPoints.push(`${x},${y}`);
    }
    areaPoints.push(`${posicionX},140`);
    areaPoints.push(`0,140`);

    document.getElementById('shaded-area').setAttribute('d', `M${areaPoints.join(' L')}Z`);
}

function actualizarValores() {
    const peso = document.getElementById('peso');
    const altura = document.getElementById('altura');

    document.getElementById('peso-valor').textContent = `${peso.value} kg`;
    document.getElementById('altura-valor').textContent = `${altura.value} m`;

    calcularIMC();

    if (modoActual === 'infante') {
        const anos = parseInt(document.getElementById('anos').value) || 0;
        const meses = parseInt(document.getElementById('meses').value) || 0;
        const edadMeses = anos * 12 + meses;

        // Obtener datos de referencia más cercanos
        const edadClave = Math.min(108, Math.max(12, Math.round(edadMeses / 12) * 12));
        const datosPeso = datosOMSPeso[edadClave];
        const datosAltura = datosOMSAltura[edadClave];

        const pesoKg = parseFloat(peso.value);
        const alturaCm = parseFloat(altura.value) * 100; // Convertir a cm

        const percentilPeso = calcularPercentil(pesoKg, datosPeso);
        const percentilAltura = calcularPercentil(alturaCm, datosAltura);

        document.getElementById('percentil-peso').textContent = `P${percentilPeso}`;
        document.getElementById('percentil-altura').textContent = `P${percentilAltura}`;

        // Actualizar gráfico
        actualizarGraficoZ(percentilPeso, percentilAltura);

        // Interpretación
        const promedioPercentil = (percentilPeso + percentilAltura) / 2;
        let interpretacion = '';

        if (promedioPercentil < 3) {
            interpretacion = 'Crecimiento muy por debajo del promedio. Se recomienda evaluación médica.';
        } else if (promedioPercentil < 15) {
            interpretacion = 'Crecimiento por debajo del promedio. Monitoreo recomendado.';
        } else if (promedioPercentil <= 85) {
            interpretacion = 'Crecimiento normal para su edad.';
        } else if (promedioPercentil <= 97) {
            interpretacion = 'Crecimiento por encima del promedio. Monitoreo recomendado.';
        } else {
            interpretacion = 'Crecimiento muy por encima del promedio. Se recomienda evaluación médica.';
        }

        document.getElementById('interpretacion-texto').textContent = interpretacion;
    }
}

function ajustarValor(tipo, incremento) {
    const input = document.getElementById(tipo);
    const valorActual = parseFloat(input.value);
    const nuevoValor = Math.min(Math.max(valorActual + incremento, parseFloat(input.min)), parseFloat(input.max));
    input.value = nuevoValor;

    actualizarValores();
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
actualizarValores();