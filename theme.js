// Función para obtener el tema preferido del usuario
function getPreferredTheme() {
    // Verificar si hay una preferencia guardada en localStorage
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        return savedTheme;
    }

    // Si no hay preferencia guardada, usar la preferencia del sistema
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
    }

    return 'light';
}

// Función para aplicar el tema
function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    updateThemeIcon(theme);
}

// Función para actualizar el icono del botón
function updateThemeIcon(theme) {
    const themeIcon = document.querySelector('.theme-icon img');
    if (themeIcon) {
        themeIcon.src = theme === 'dark' ? './image/noche-y-dia.png' : './image/dia-y-noche.png';
        themeIcon.alt = theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro';
    }
}

// Función para alternar el tema
function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
}

// Inicializar el tema cuando se carga la página
document.addEventListener('DOMContentLoaded', () => {
    const preferredTheme = getPreferredTheme();
    setTheme(preferredTheme);

    // Agregar event listener al botón de toggle
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }

    // Escuchar cambios en la preferencia del sistema (opcional)
    if (window.matchMedia) {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        mediaQuery.addEventListener('change', (e) => {
            // Solo actualizar si no hay una preferencia guardada
            if (!localStorage.getItem('theme')) {
                setTheme(e.matches ? 'dark' : 'light');
            }
        });
    }
});

