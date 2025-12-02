document.addEventListener('DOMContentLoaded', () => {
    const projectsContainer = document.querySelector('.projects-grid');
    const projectsUrl = './assets/data/projects.json';

    fetch(projectsUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(projects => {
            projects.forEach(project => {
                const projectCard = document.createElement('div');
                projectCard.classList.add('project-card');

                const technologiesHtml = project.technologies.map(tech =>
                    `<span class="tech-tag">${tech}</span>`
                ).join('');

                projectCard.innerHTML = `
                    <h3>${project.title}</h3>
                    <a href="${project.demoLink}" target="_blank">
                        <img src="${project.image}" alt="${project.title} Preview" class="project-image">
                    </a>
                    <p>${project.description}</p>
                    <div class="project-tech">
                        ${technologiesHtml}
                    </div>
                    <div class="project-links">
                        <a href="${project.demoLink}" class="project-btn" target="_blank">Ver Demo</a>
                        <a href="${project.codeLink}" class="project-btn" target="_blank">Ver Código</a>
                    </div>
                `;

                projectsContainer.appendChild(projectCard);
            });
        })
        .catch(error => {
            console.error('Error loading projects:', error);
            projectsContainer.innerHTML = '<p>Error al cargar los proyectos.</p>';
        });
});
