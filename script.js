// Three.js Earth
const scene = new THREE.Scene();
const container = document.getElementById('earth-canvas');

// === FOND DE PARTICULES DYNAMIQUE ===
const bgCanvas = document.getElementById('bg-canvas');
if (bgCanvas) {
    const ctx = bgCanvas.getContext('2d');
    let width, height;
    let particles = [];
    let mouseX = null, mouseY = null;

    function resizeCanvas() {
        width = window.innerWidth;
        height = window.innerHeight;
        bgCanvas.width = width;
        bgCanvas.height = height;
    }

    function random(min, max) {
        return Math.random() * (max - min) + min;
    }

    function initParticles(count) {
        particles = [];
        for (let i = 0; i < count; i++) {
            particles.push({
                x: random(0, width),
                y: random(0, height),
                radius: random(1, 3),
                speedX: random(-0.5, 0.5),
                speedY: random(-0.5, 0.5),
                alpha: random(0.3, 0.8)
            });
        }
    }

    function drawParticles() {
        ctx.clearRect(0, 0, width, height);
        ctx.fillStyle = '#0a192f';
        ctx.fillRect(0, 0, width, height);

        for (let p of particles) {
            p.x += p.speedX;
            p.y += p.speedY;

            if (p.x < 0) p.x = width;
            if (p.x > width) p.x = 0;
            if (p.y < 0) p.y = height;
            if (p.y > height) p.y = 0;

            if (mouseX !== null && mouseY !== null) {
                const dx = mouseX - p.x;
                const dy = mouseY - p.y;
                const dist = Math.hypot(dx, dy);
                if (dist < 100) {
                    const angle = Math.atan2(dy, dx);
                    const force = (100 - dist) / 100 * 0.5;
                    p.x += Math.cos(angle) * force;
                    p.y += Math.sin(angle) * force;
                }
            }

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(0, 210, 255, ${p.alpha})`;
            ctx.fill();
        }

        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.hypot(dx, dy);
                if (dist < 100) {
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = `rgba(0, 210, 255, ${0.2 * (1 - dist / 100)})`;
                    ctx.lineWidth = 0.5;
                    ctx.stroke();
                }
            }
        }

        requestAnimationFrame(drawParticles);
    }

    function handleMouseMove(e) {
        mouseX = e.clientX;
        mouseY = e.clientY;
    }

    function handleMouseLeave() {
        mouseX = null;
        mouseY = null;
    }

    window.addEventListener('resize', () => {
        resizeCanvas();
        initParticles(120);
    });

    resizeCanvas();
    initParticles(120);
    drawParticles();

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);

    window.initParticles = initParticles;
    window.drawParticles = drawParticles;
    window.resizeCanvas = resizeCanvas;
}

// === TERRE 3D ===
if (container) {
    const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });

    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    const geometry = new THREE.SphereGeometry(3, 40, 40);
    const material = new THREE.MeshPhongMaterial({
        color: 0x00d2ff,
        wireframe: true,
        transparent: true,
        opacity: 0.15
    });
    const earth = new THREE.Mesh(geometry, material);
    scene.add(earth);

    const light = new THREE.PointLight(0xffffff, 1);
    light.position.set(5, 5, 5);
    scene.add(light);
    scene.add(new THREE.AmbientLight(0x404040));

    camera.position.z = 6;

    // Utilisation d'une variable globale pour pouvoir la modifier depuis les paramètres
    window.earthRotationSpeed = 0.002;

    function animate() {
        requestAnimationFrame(animate);
        earth.rotation.y += window.earthRotationSpeed;
        renderer.render(scene, camera);
    }
    animate();

    window.addEventListener('resize', () => {
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
    });
}
// === MENU MOBILE ===
const menuToggle = document.getElementById('menu-toggle');
const menuItems = document.getElementById('menu-items');

if (menuToggle && menuItems) {
    menuToggle.addEventListener('click', () => {
        menuItems.classList.toggle('active');
    });
}

// === MENU SCROLL EFFECT + ACTIVE LINK ===
window.addEventListener('scroll', () => {
    const menu = document.querySelector('.menu');
    if (menu) {
        menu.classList.toggle('scrolled', window.scrollY > 100);
    }
    
    let current = '';
    document.querySelectorAll('section[id], main[id]').forEach(section => {
        const sectionTop = section.offsetTop - 100;
        const sectionHeight = section.clientHeight;
        if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
            current = section.getAttribute('id');
        }
    });
    
    document.querySelectorAll('.menu-items a').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
});

// === DÉFILEMENT FLUIDE + ANIMATION AU CLIC SUR LES LIENS DU MENU ===
document.querySelectorAll('.menu-items a').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('href');
        if (targetId && targetId !== '#') {
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({ behavior: 'smooth' });
                targetElement.classList.add('section-highlight');
                setTimeout(() => {
                    targetElement.classList.remove('section-highlight');
                }, 800);
            }
        }
        // Fermer le menu mobile si ouvert
        if (menuItems) menuItems.classList.remove('active');
    });
});

// === LIVE FEED PROJETS ===
function addProjectFeedItem(projectId, message) {
    const feed = document.getElementById(projectId);
    if (!feed) {
        console.warn(`Feed non trouvé : ${projectId}`);
        return;
    }

    const now = new Date();
    const time = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    const item = document.createElement('div');
    item.className = 'feed-item';
    item.innerHTML = `<span class="feed-time">${time}</span><span class="feed-content">${message}</span>`;
    
    feed.insertBefore(item, feed.firstChild);
    
    while (feed.children.length > 5) {
        feed.removeChild(feed.lastChild);
    }
}

const messages = {
    gtb: [
        '🆕 5 nouveaux adhérents inscrits',
        '📚 Emprunt de "Le Petit Prince" enregistré',
        '⚠️ Procédure de vol déclenchée (retard > 30j)',
        '🔍 Consultation du catalogue : 25 recherches',
        '💳 Carte numérique générée pour M. Dupont',
        '✅ Nouveau module d\'emprunt validé',
        '🔐 Mise à jour de sécurité',
        '📊 Statistiques mensuelles disponibles'
    ],
    dorkls: [
        '🔍 Scan de 1500 URLs terminé',
        '🚀 Nouveau record de vitesse',
        '🛡️ Contournement WAF amélioré',
        '📝 Mise à jour de la doc',
        '⚡ Optimisation du moteur'
    ],
    sqli: [
        '💉 3 nouvelles injections détectées',
        '📥 Export des résultats en cours',
        '🔧 Correction d\'un faux positif',
        '🚀 Version 2.1 en préparation',
        '📊 Analyse des logs terminée'
    ],
    ms17: [
        '🔬 Nouvelle variante d\'EternalBlue',
        '📑 Publication d\'un article',
        '🛠️ Correctif analysé',
        '⚠️ Alerte sur système non patché',
        '📈 Progression de la recherche'
    ],
    stockvison: [
        '🤖 Assistant DeepSeek: analyse des ventes',
        '📊 Nouveau rapport de rentabilité généré',
        '📦 Import JSON de 150 produits effectué',
        '🔐 Connexion admin détectée',
        '📉 Alerte: produit en fin de vie'
    ],
    phpcompiler: [
        '🔍 Tokenisation du fichier index.php réussie',
        '⚠️ Erreur syntaxique détectée ligne 12 : ";" manquant',
        '📊 Statistiques : 150 lignes, 8 fonctions, 3 classes',
        '📂 Projet "MonApp" ouvert avec 5 fichiers PHP',
        '💡 Documentation PHP affichée pour "echo"'
    ],
    covid: [
        '🌍 Génération de 10 pays avec 60 patients',
        '📊 ABR construit : 35 âges distincts agrégés',
        '📈 Pourcentage de décès (tranche 60-80) : 68%',
        '💾 Export de l\'ABR dans ABR.txt réussi',
        '🔍 Parcours ABR : 120 patients analysés'
    ]
};

// Messages de bienvenue
setTimeout(() => {
    addProjectFeedItem('feed-gtb', '✅ GTB prêt – suivi en temps réel activé');
    addProjectFeedItem('feed-phpcompiler', '✅ PHP Compiler prêt – analyse lexicale en direct');
    addProjectFeedItem('feed-covid', '✅ Analyse COVID-19 – simulation épidémiologique prête');
}, 500);

setInterval(() => {
    addProjectFeedItem('feed-gtb', messages.gtb[Math.floor(Math.random() * messages.gtb.length)]);
}, 22000);

setInterval(() => {
    addProjectFeedItem('feed-dorkls', messages.dorkls[Math.floor(Math.random() * messages.dorkls.length)]);
}, 18000);

setInterval(() => {
    addProjectFeedItem('feed-sqli', messages.sqli[Math.floor(Math.random() * messages.sqli.length)]);
}, 25000);

setInterval(() => {
    addProjectFeedItem('feed-ms17', messages.ms17[Math.floor(Math.random() * messages.ms17.length)]);
}, 30000);

setInterval(() => {
    addProjectFeedItem('feed-stockvison', messages.stockvison[Math.floor(Math.random() * messages.stockvison.length)]);
}, 27000);

setInterval(() => {
    addProjectFeedItem('feed-phpcompiler', messages.phpcompiler[Math.floor(Math.random() * messages.phpcompiler.length)]);
}, 24000);

setInterval(() => {
    addProjectFeedItem('feed-covid', messages.covid[Math.floor(Math.random() * messages.covid.length)]);
}, 26000);

// === GLOBAL FEED DYNAMIQUE ===
const globalFeedContainer = document.getElementById('live-feed-global');

const globalMessages = [
    { category: 'gtb', msg: '📚 GTB: Nouvelle collection de livres ajoutée' },
    { category: 'gtb', msg: '✅ GTB: Module d\'emprunt optimisé' },
    { category: 'gtb', msg: '🔍 GTB: Recherche avancée améliorée' },
    { category: 'dorkls', msg: '🔍 DorkLS: Scan de 2500 URLs terminé' },
    { category: 'dorkls', msg: '🚀 DorkLS: Nouveau record de vitesse (150 req/s)' },
    { category: 'dorkls', msg: '🛡️ DorkLS: Contournement WAF mis à jour' },
    { category: 'sqli', msg: '💉 SQLI Scanner: Détection d\'une nouvelle vulnérabilité' },
    { category: 'sqli', msg: '📥 SQLI Scanner: Export JSON amélioré' },
    { category: 'sqli', msg: '🔧 Correction d\'un faux positif sur les payloads' },
    { category: 'stockvison', msg: '🤖 StockVison: Assistant DeepSeek analyse les tendances' },
    { category: 'stockvison', msg: '📊 Nouveau rapport de rentabilité généré' },
    { category: 'stockvison', msg: '📦 Import JSON de 200 produits effectué' },
    { category: 'ms17', msg: '🔬 MS17-010: Analyse d\'une nouvelle variante' },
    { category: 'ms17', msg: '📑 Publication d\'un article technique' },
    { category: 'ms17', msg: '🛠️ Correctif de sécurité en test' },
    { category: 'phpcompiler', msg: '🐘 PHP Compiler: Tokenisation temps réel améliorée' },
    { category: 'phpcompiler', msg: '📂 Ouverture de projet : 12 fichiers PHP analysés' },
    { category: 'covid', msg: '📊 COVID-19: ABR construit avec 35 nœuds' },
    { category: 'covid', msg: '🌍 Simulation: 10 pays générés, 60 patients' },
    { category: 'general', msg: '🌐 Site web mis à jour (version 2.0)' },
    { category: 'general', msg: '📝 Documentation des projets enrichie' },
    { category: 'general', msg: '⭐ Nouvelle étoile GitHub sur SQLI Scanner' },
    { category: 'general', msg: '📧 Nouveau formulaire de contact actif' }
];

function addGlobalFeedItem(message) {
    if (!globalFeedContainer) return;
    const now = new Date();
    const time = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    const item = document.createElement('div');
    item.className = 'feed-item';
    item.innerHTML = `<span class="feed-time">${time}</span><span class="feed-content">${message}</span>`;
    globalFeedContainer.appendChild(item);
    while (globalFeedContainer.children.length > 10) {
        globalFeedContainer.removeChild(globalFeedContainer.firstChild);
    }
    globalFeedContainer.scrollTop = globalFeedContainer.scrollHeight;
}

if (globalFeedContainer) {
    addGlobalFeedItem('🌟 Bienvenue sur le flux d\'activités globales !');
    addGlobalFeedItem('🚀 Les projets sont en développement actif');
    let globalFeedInterval = setInterval(() => {
        const randomIndex = Math.floor(Math.random() * globalMessages.length);
        addGlobalFeedItem(globalMessages[randomIndex].msg);
    }, 12000);
    window.globalFeedInterval = globalFeedInterval;
    window.addGlobalFeedItem = addGlobalFeedItem;
    window.globalMessages = globalMessages;
}

// === COPY BUTTONS (EMAIL) ===
document.querySelectorAll('.copy-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
        e.preventDefault();
        const textToCopy = btn.getAttribute('data-copy');
        if (textToCopy) {
            try {
                await navigator.clipboard.writeText(textToCopy);
                const originalIcon = btn.innerHTML;
                btn.innerHTML = '<i class="fas fa-check"></i>';
                setTimeout(() => {
                    btn.innerHTML = originalIcon;
                }, 1500);
            } catch (err) {
                console.error('Erreur de copie:', err);
                alert('Impossible de copier. Veuillez le faire manuellement.');
            }
        }
    });
});

// === SCROLL ANIMATIONS ===
let scrollObserver = null;

function initScrollAnimations() {
    if (scrollObserver) scrollObserver.disconnect();
    scrollObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    document.querySelectorAll('.project-detail, .skill-category, .research-card, .timeline-item').forEach(el => {
        if (el) {
            el.style.opacity = '0';
            el.style.transform = 'translateY(20px)';
            scrollObserver.observe(el);
        }
    });
}

function disableScrollAnimations() {
    if (scrollObserver) scrollObserver.disconnect();
    document.querySelectorAll('.project-detail, .skill-category, .research-card, .timeline-item').forEach(el => {
        if (el) {
            el.style.opacity = '1';
            el.style.transform = 'translateY(0)';
        }
    });
}

// === GESTION DU PANNEAU DE PARAMÈTRES (version renforcée) ===
const settingsToggle = document.getElementById('settings-toggle');
const settingsPanel = document.getElementById('settings-panel');
const settingsClose = document.getElementById('settings-close');

if (settingsToggle && settingsPanel) {
    // Supprimer d'anciens écouteurs (pour éviter les doublons)
    settingsToggle.removeEventListener('click', openPanel);
    if (settingsClose) settingsClose.removeEventListener('click', closePanel);
    document.removeEventListener('click', outsideClick);

    function openPanel(e) {
        e.stopPropagation();
        settingsPanel.classList.add('open');
        console.log('Panneau ouvert'); // Pour tester
    }

    function closePanel() {
        settingsPanel.classList.remove('open');
        console.log('Panneau fermé');
    }

    function outsideClick(e) {
        if (settingsPanel.classList.contains('open') &&
            !settingsPanel.contains(e.target) &&
            e.target !== settingsToggle) {
            closePanel();
        }
    }

    settingsToggle.addEventListener('click', openPanel);
    if (settingsClose) settingsClose.addEventListener('click', closePanel);
    document.addEventListener('click', outsideClick);
}

const primaryColorInput = document.getElementById('primary-color');
const secondaryColorInput = document.getElementById('secondary-color');
const particleCountInput = document.getElementById('particle-count');
const particleCountValue = document.getElementById('particle-count-value');
const feedSpeedInput = document.getElementById('feed-speed');
const feedSpeedValue = document.getElementById('feed-speed-value');
const themeToggle = document.getElementById('theme-toggle');
const themeStatus = document.getElementById('theme-status');
const particlesToggle = document.getElementById('particles-toggle');
const particlesStatus = document.getElementById('particles-status');
const earthSpeedInput = document.getElementById('earth-speed');
const earthSpeedValue = document.getElementById('earth-speed-value');
const scrollAnimationToggle = document.getElementById('scroll-animation-toggle');
const scrollAnimationStatus = document.getElementById('scroll-animation-status');
const resetBtn = document.getElementById('reset-settings');

function applyColors(primary, secondary) {
    document.documentElement.style.setProperty('--primary', primary);
    document.documentElement.style.setProperty('--secondary', secondary);
    localStorage.setItem('primary-color', primary);
    localStorage.setItem('secondary-color', secondary);
}

function applyParticleCount(count) {
    localStorage.setItem('particle-count', count);
    if (window.initParticles && window.resizeCanvas) {
        window.resizeCanvas();
        window.initParticles(parseInt(count));
        if (window.drawParticles) window.drawParticles();
    }
}

function applyFeedSpeed(speedSec) {
    localStorage.setItem('feed-speed', speedSec);
    if (window.globalFeedInterval) {
        clearInterval(window.globalFeedInterval);
        window.globalFeedInterval = setInterval(() => {
            if (window.globalMessages && window.addGlobalFeedItem) {
                const randomIndex = Math.floor(Math.random() * window.globalMessages.length);
                window.addGlobalFeedItem(window.globalMessages[randomIndex].msg);
            }
        }, speedSec * 1000);
    }
}

function applyTheme(isLight) {
    if (isLight) {
        document.body.classList.add('light-theme');
        if (themeStatus) themeStatus.innerText = 'Clair';
        localStorage.setItem('theme', 'light');
    } else {
        document.body.classList.remove('light-theme');
        if (themeStatus) themeStatus.innerText = 'Sombre';
        localStorage.setItem('theme', 'dark');
    }
}

function applyParticlesVisibility(enabled) {
    const canvas = document.getElementById('bg-canvas');
    if (canvas) {
        canvas.style.display = enabled ? 'block' : 'none';
    }
    localStorage.setItem('particles-enabled', enabled);
    if (particlesStatus) particlesStatus.innerText = enabled ? 'Activées' : 'Désactivées';
}

function applyEarthSpeed(speed) {
    if (window.earthRotationSpeed !== undefined) {
        window.earthRotationSpeed = parseFloat(speed);
    }
    localStorage.setItem('earth-speed', speed);
    if (earthSpeedValue) earthSpeedValue.innerText = speed;
}

function applyScrollAnimations(enabled) {
    if (enabled) {
        initScrollAnimations();
        localStorage.setItem('scroll-animations', 'true');
        if (scrollAnimationStatus) scrollAnimationStatus.innerText = 'Activées';
    } else {
        disableScrollAnimations();
        localStorage.setItem('scroll-animations', 'false');
        if (scrollAnimationStatus) scrollAnimationStatus.innerText = 'Désactivées';
    }
}

function loadSettings() {
    const primary = localStorage.getItem('primary-color') || '#00d2ff';
    const secondary = localStorage.getItem('secondary-color') || '#64ffda';
    const particleCount = localStorage.getItem('particle-count') || '120';
    const feedSpeed = localStorage.getItem('feed-speed') || '12';
    const theme = localStorage.getItem('theme') || 'dark';
    const particlesEnabled = localStorage.getItem('particles-enabled') !== 'false';
    const earthSpeed = localStorage.getItem('earth-speed') || '0.002';
    const scrollAnimationsEnabled = localStorage.getItem('scroll-animations') !== 'false';
    
    if (primaryColorInput) primaryColorInput.value = primary;
    if (secondaryColorInput) secondaryColorInput.value = secondary;
    if (particleCountInput) particleCountInput.value = particleCount;
    if (feedSpeedInput) feedSpeedInput.value = feedSpeed;
    if (particleCountValue) particleCountValue.innerText = particleCount;
    if (feedSpeedValue) feedSpeedValue.innerText = feedSpeed;
    if (earthSpeedInput) earthSpeedInput.value = earthSpeed;
    if (earthSpeedValue) earthSpeedValue.innerText = earthSpeed;
    
    applyColors(primary, secondary);
    applyParticleCount(parseInt(particleCount));
    applyFeedSpeed(parseInt(feedSpeed));
    applyTheme(theme === 'light');
    applyParticlesVisibility(particlesEnabled);
    applyEarthSpeed(earthSpeed);
    applyScrollAnimations(scrollAnimationsEnabled);
}

if (primaryColorInput && secondaryColorInput) {
    primaryColorInput.addEventListener('input', (e) => applyColors(e.target.value, secondaryColorInput.value));
    secondaryColorInput.addEventListener('input', (e) => applyColors(primaryColorInput.value, e.target.value));
}
if (particleCountInput && particleCountValue) {
    particleCountInput.addEventListener('input', (e) => {
        const val = e.target.value;
        particleCountValue.innerText = val;
        applyParticleCount(parseInt(val));
    });
}
if (feedSpeedInput && feedSpeedValue) {
    feedSpeedInput.addEventListener('input', (e) => {
        const val = e.target.value;
        feedSpeedValue.innerText = val;
        applyFeedSpeed(parseInt(val));
    });
}
if (themeToggle) {
    themeToggle.addEventListener('change', (e) => applyTheme(e.target.checked));
}
if (particlesToggle) {
    particlesToggle.addEventListener('change', (e) => applyParticlesVisibility(e.target.checked));
}
if (earthSpeedInput && earthSpeedValue) {
    earthSpeedInput.addEventListener('input', (e) => {
        const val = e.target.value;
        earthSpeedValue.innerText = val;
        applyEarthSpeed(val);
    });
}
if (scrollAnimationToggle) {
    scrollAnimationToggle.addEventListener('change', (e) => applyScrollAnimations(e.target.checked));
}
if (resetBtn) {
    resetBtn.addEventListener('click', () => {
        localStorage.clear();
        location.reload();
    });
}

document.addEventListener('DOMContentLoaded', () => {
    loadSettings();
});

// === NOUVEAUX AJOUTS ===
// Filtrage des projets
const filterBtns = document.querySelectorAll('.filter-btn');
const projects = document.querySelectorAll('.project-detail');

filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const filter = btn.dataset.filter;
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        projects.forEach(project => {
            if (filter === 'all' || project.classList.contains(filter)) {
                project.style.display = 'flex';
                setTimeout(() => project.style.opacity = '1', 10);
            } else {
                project.style.opacity = '0';
                setTimeout(() => project.style.display = 'none', 300);
            }
        });
    });
});

// Compteurs animés
const counters = document.querySelectorAll('.stat-number');
let animated = false;

function animateNumbers() {
    if (animated) return;
    counters.forEach(counter => {
        const target = parseInt(counter.dataset.target);
        let current = 0;
        const increment = target / 50;
        const update = setInterval(() => {
            current += increment;
            if (current >= target) {
                counter.innerText = target;
                clearInterval(update);
            } else {
                counter.innerText = Math.floor(current);
            }
        }, 30);
    });
    animated = true;
}

const statsSection = document.querySelector('.stats-grid');
if (statsSection) {
    const observerStats = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) animateNumbers();
    }, { threshold: 0.5 });
    observerStats.observe(statsSection);
}

// Calcul du nombre de jours depuis le début de la formation (modifiez la date si besoin)
const startDate = new Date('2023-09-01');
const today = new Date();
const daysSinceStart = Math.floor((today - startDate) / (1000 * 60 * 60 * 24));

const daysElement = document.getElementById('days-experience');
if (daysElement) {
    daysElement.setAttribute('data-target', daysSinceStart);
    daysElement.innerText = '0';
}

// Citation aléatoire
const quotes = [
    "La sécurité est un processus, pas un produit.",
    "Un bon hacker rend les choses complexes simples, jamais l'inverse.",
    "Le code, c'est comme l'humour. Quand on doit l'expliquer, c'est mauvais.",
    "Soyez le changement que vous voulez voir dans le code.",
    "Un bug n'est jamais une fatalité, c'est une opportunité d'apprendre.",
    "La simplicité est la sophistication ultime.",
    "Le meilleur pare-feu, c'est un développeur qui pense sécurité dès la première ligne.",
    "Ce n'est pas un bug, c'est une fonctionnalité non documentée.",
    "Le code propre ne ment pas.",
    "La cybersécurité n'est pas une destination, c'est un voyage.",
    "Le vrai hacker est celui qui construit, pas celui qui détruit.",
    "Plus le code est simple, moins il y a de place pour les failles.",
    "Un test automatisé vaut mille tests manuels.",
    "La documentation est comme le sexe : quand c'est bon, c'est bon. Quand c'est mauvais, c'est mieux que rien.",
    "Le premier devoir d'un ingénieur est d'éviter la complexité inutile.",
    "Le meilleur moment pour sécuriser un système, c'est avant la première ligne de code.",
    "Si vous pensez que la sécurité est chère, essayez la vulnérabilité.",
    "Un code sans commentaire, c'est comme un livre sans chapitres.",
    "Le développement, c'est écrire des histoires pour les machines.",
    "Un pentest réussi est celui qui ne trouve rien, mais qui prouve que tout a été vérifié.",
    "La vraie expertise, c'est savoir quand ne pas coder.",
    "La technologie que vous maîtrisez le mieux est celle que vous avez construite.",
    "Un bon développeur écrit du code que les humains comprennent.",
    "La sécurité par l'obscurité n'est pas une sécurité.",
    "Le plus grand risque, c'est de ne pas en prendre.",
    "Le refactoring, c'est la poésie du code.",
    "Un système bien conçu se défend tout seul.",
    "La meilleure façon de prédire l'avenir, c'est de le construire.",
    "Dans le monde du logiciel, la confiance se gagne en ligne de commande.",
    "Un développeur sans tests, c'est un funambule sans filet."
];

function updateQuote() {
    const random = Math.floor(Math.random() * quotes.length);
    document.getElementById('quote-text').innerText = quotes[random];
}
updateQuote();
setInterval(updateQuote, 10000);

// Easter egg : Konami code
const konami = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','KeyB','KeyA'];
let konamiIndex = 0;
window.addEventListener('keydown', (e) => {
    if (e.code === konami[konamiIndex]) {
        konamiIndex++;
        if (konamiIndex === konami.length) {
            document.body.style.animation = 'rainbow 0.5s infinite';
            setTimeout(() => document.body.style.animation = '', 3000);
            konamiIndex = 0;
            alert('🎉 Easter egg activé ! 🎉');
        }
    } else {
        konamiIndex = 0;
    }
});

// ===== GRAPHIQUES DE PROGRESSION =====
if (typeof Chart !== 'undefined') {
    const progressData = {
        gtb:    [30, 45, 60, 70, 80, 85],
        dorkls: [40, 55, 70, 80, 88, 90],
        sqli:   [50, 65, 80, 90, 98, 100],
        stockvison: [20, 35, 50, 65, 75, 80],
        ms17:   [25, 40, 55, 65, 72, 75],
        phpcompiler: [40, 60, 75, 88, 95, 100],
        covid: [30, 55, 75, 88, 95, 100]
    };
    const months = ['Oct', 'Nov', 'Déc', 'Jan', 'Fév', 'Mar'];

    function createChart(canvasId, data) {
        const ctx = document.getElementById(canvasId)?.getContext('2d');
        if (!ctx) return;
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: months,
                datasets: [{
                    label: 'Avancement (%)',
                    data: data,
                    borderColor: getComputedStyle(document.documentElement).getPropertyValue('--primary'),
                    backgroundColor: 'rgba(0, 210, 255, 0.05)',
                    tension: 0.3,
                    fill: true,
                    pointBackgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--secondary'),
                    pointRadius: 3
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: { display: false },
                    tooltip: { callbacks: { label: (ctx) => `${ctx.raw}%` } }
                },
                scales: {
                    y: { min: 0, max: 100, grid: { color: 'rgba(255,255,255,0.1)' }, ticks: { stepSize: 20, color: '#8892b0' } },
                    x: { ticks: { color: '#8892b0' } }
                }
            }
        });
    }

    createChart('chart-gtb', progressData.gtb);
    createChart('chart-dorkls', progressData.dorkls);
    createChart('chart-sqli', progressData.sqli);
    createChart('chart-stockvison', progressData.stockvison);
    createChart('chart-ms17', progressData.ms17);
    createChart('chart-phpcompiler', progressData.phpcompiler);
    createChart('chart-covid', progressData.covid);
}

// ===== GRAPHIQUE DES TECHNOLOGIES (donut) =====
if (typeof Chart !== 'undefined') {
    const techCtx = document.getElementById('techChart')?.getContext('2d');
    if (techCtx) {
        new Chart(techCtx, {
            type: 'doughnut',
            data: {
                labels: ['Java', 'C', 'JavaScript', 'PHP', 'Python', 'SQL'],
                datasets: [{
                    data: [45, 20, 15, 10, 5, 5],
                    backgroundColor: ['#00d2ff', '#64ffda', '#ff6b6b', '#ffbd2e', '#9b59b6', '#e67e22'],
                    borderWidth: 0,
                    hoverOffset: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: { color: '#e6f1ff', font: { size: 12 } }
                    },
                    tooltip: {
                        callbacks: {
                            label: (ctx) => `${ctx.label}: ${ctx.raw}%`
                        }
                    }
                },
                cutout: '60%'
            }
        });
    }
}

// ===== ANIMATION DES BARRES DE PROGRESSION (technologies) =====
const skillCards = document.querySelectorAll('.skill-card');
let skillsAnimated = false;

function animateSkills() {
    if (skillsAnimated) return;
    skillCards.forEach(card => {
        const progressBar = card.querySelector('.progress');
        const targetWidth = progressBar.style.width;
        if (targetWidth) {
            progressBar.style.width = '0';
            setTimeout(() => {
                progressBar.style.width = targetWidth;
            }, 50);
        }
    });
    skillsAnimated = true;
}

const techSection = document.querySelector('.tech-section');
if (techSection) {
    const observerSkills = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
            animateSkills();
            observerSkills.disconnect();
        }
    }, { threshold: 0.3 });
    observerSkills.observe(techSection);
}

// ===== TERMINAL INTERACTIF =====
const terminalInput = document.getElementById('terminal-input');
const terminalBody = document.getElementById('terminal-body');
let commandHistory = [];
let historyIndex = 0;

const commands = {
    help: () => {
        return `
Commandes disponibles :
  help      - Affiche cette aide
  projets   - Liste mes projets
  contact   - Affiche mes coordonnées
  cv        - Télécharge mon CV
  skills    - Mes compétences techniques
  clear     - Efface l'écran
  whoami    - Affiche mon identité
  date      - Affiche la date et l'heure
  github    - Ouvre mon GitHub
  linkedin  - Ouvre mon LinkedIn
  certif    - Affiche mes certifications
  live      - Accède à mes projets en direct
  ascii     - Affiche un logo ASCII
  hack      - Lance un mini‑jeu de hacking (easter egg)
`;
    },
    projets: () => {
        return `
Projets :
  • GTB – Gestion de Bibliothèque (Java/Oracle SQL)
  • DorkLS – Scanner de vulnérabilités web
  • SQLI Scanner – Détection et exploitation SQLi
  • StockVison – Gestion de stock avec DeepSeek
  • Recherche MS17-010 – Analyse d'EternalBlue
  • PHP Compiler – Analyseur lexical & syntaxique PHP
  • Analyse COVID-19 – Simulation épidémiologique en C (ABR)
`;
    },
    contact: () => {
        return `
Contact :
  Email : samoumegharba210@gmail.com
  GitHub : https://github.com/samou2
  LinkedIn : https://linkedin.com/in/samou-megharba
  Facebook : https://facebook.com/BertRand
`;
    },
    cv: () => {
        window.open('CV.pdf', '_blank');
        return "Téléchargement du CV en cours...";
    },
    skills: () => {
        return `
Compétences techniques :
  • Langages : Java, Python, C, JavaScript, SQL, PHP, Assembleur
  • Sécurité : Cybersécurité, Pentesting, WAF Bypass
  • Outils : Oracle DB, Linux, Git, Three.js, WiX Toolset, DeepSeek
`;
    },
    whoami: () => {
        return "MEGHARBA SAMOU – Ingénieur en Génie Logiciel & Expert Cybersécurité";
    },
    date: () => {
        return new Date().toLocaleString();
    },
    github: () => {
        window.open('https://github.com/samou2', '_blank');
        return "Ouverture de GitHub...";
    },
    linkedin: () => {
        window.open('https://linkedin.com/in/samou-megharba', '_blank');
        return "Ouverture de LinkedIn...";
    },
    certif: () => {
        return `
Certifications / Formations :
  • CompTIA Security+ (en cours)
  • Cisco Networking Essentials
  • Développement Java moderne avec JDK 25 (BellSoft)
  • (Liste non exhaustive)
`;
    },
    live: () => {
        window.location.href = '#recherche';
        return "Redirection vers la section Live Research...";
    },
    ascii: () => {
        return `
    ███╗   ███╗███████╗
    ████╗ ████║██╔════╝
    ██╔████╔██║███████╗
    ██║╚██╔╝██║╚════██║
    ██║ ╚═╝ ██║███████║
    ╚═╝     ╚═╝╚══════╝
`;
    },
    hack: () => {
        if (document.getElementById('hack-game')) {
            return "Un jeu est déjà en cours ! Tapez 'hack' pour le relancer.";
        }
        const gameDiv = document.createElement('div');
        gameDiv.id = 'hack-game';
        gameDiv.style.marginTop = '10px';
        gameDiv.style.borderTop = '1px solid rgba(255,255,255,0.2)';
        gameDiv.style.paddingTop = '10px';
        gameDiv.innerHTML = `
            <div style="margin-bottom: 10px;">
                <strong style="color: #64ffda;">🔓  JEU DE HACKING  🔓</strong>
                <p style="font-size:0.8rem; margin:5px 0;">Cliquez sur le bouton pour faire monter la jauge jusqu'à 100% !</p>
            </div>
            <div style="background:#1e1f24; border-radius:6px; height:20px; margin:10px 0;">
                <div id="hack-progress" style="width:0%; height:100%; background:linear-gradient(90deg,#00d2ff,#64ffda); border-radius:6px; transition:width 0.1s;"></div>
            </div>
            <button id="hack-clicker" style="background:#00d2ff; border:none; color:#0a192f; padding:8px 16px; border-radius:30px; cursor:pointer; font-weight:bold;">💥 HACK 💥</button>
            <p id="hack-message" style="margin-top:10px; font-size:0.8rem; color:#8892b0;"></p>
        `;
        terminalBody.appendChild(gameDiv);
        terminalBody.scrollTop = terminalBody.scrollHeight;

        let progress = 0;
        const progressBar = document.getElementById('hack-progress');
        const clicker = document.getElementById('hack-clicker');
        const messageEl = document.getElementById('hack-message');

        function updateProgress(increment) {
            progress = Math.min(100, progress + increment);
            progressBar.style.width = progress + '%';
            if (progress >= 100) {
                clicker.disabled = true;
                messageEl.innerHTML = '✅ Système compromis ! Bravo, vous avez réussi le hack !<br><span style="font-family: monospace;">' + asciiSuccess() + '</span>';
                messageEl.style.color = '#64ffda';
                setTimeout(() => {
                    gameDiv.remove();
                }, 8000);
            } else {
                messageEl.innerHTML = `Progression : ${progress}% – Encore ${100 - progress} clics !`;
            }
        }

        clicker.addEventListener('click', () => {
            updateProgress(10);
        });

        function asciiSuccess() {
            return `
    ╔══════════════════════════════╗
    ║   ██████╗  ██████╗  ██████╗  ║
    ║   ╚═══██╗ ██╔══██╗ ██╔══██╗ ║
    ║      ██║ ██║  ██║ ██║  ██║ ║
    ║     ██╔╝ ██║  ██║ ██║  ██║ ║
    ║     ╚═╝  ╚██████╔╝ ██████╔╝ ║
    ║          ╚═════╝  ╚═════╝  ║
    ╚══════════════════════════════╝`;
        }

        return "";
    },
    clear: () => {
        terminalBody.innerHTML = '';
        return '';
    }
};

function addTerminalLine(text, isOutput = true) {
    const line = document.createElement('div');
    line.className = 'terminal-line';
    if (isOutput) {
        line.innerHTML = text;
    } else {
        line.innerHTML = `<span class="prompt">$</span> ${text}`;
    }
    terminalBody.appendChild(line);
    terminalBody.scrollTop = terminalBody.scrollHeight;
}

function executeCommand(cmd) {
    const trimmed = cmd.trim().toLowerCase();
    if (trimmed === '') return;

    addTerminalLine(cmd, false);

    if (commands[trimmed]) {
        const result = commands[trimmed]();
        if (result) addTerminalLine(result);
    } else {
        addTerminalLine(`Commande inconnue : ${trimmed}. Tapez "help" pour la liste.`);
    }

    if (trimmed !== '') {
        commandHistory.push(trimmed);
        historyIndex = commandHistory.length;
    }
}

if (terminalInput && terminalBody) {
    terminalInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const cmd = terminalInput.value;
            executeCommand(cmd);
            terminalInput.value = '';
            e.preventDefault();
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (historyIndex > 0) {
                historyIndex--;
                terminalInput.value = commandHistory[historyIndex];
            }
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (historyIndex < commandHistory.length - 1) {
                historyIndex++;
                terminalInput.value = commandHistory[historyIndex];
            } else {
                historyIndex = commandHistory.length;
                terminalInput.value = '';
            }
        }
    });

    document.querySelector('.terminal-window').addEventListener('click', () => {
        terminalInput.focus();
    });
}
// === CHATBOT FLOTTANT ===
// === CHATBOT AMÉLIORÉ ===
const chatbotToggle = document.querySelector('.chatbot-toggle');
const chatbotWindow = document.querySelector('.chatbot-window');
const chatbotClose = document.querySelector('.chatbot-close');
const chatbotMessages = document.getElementById('chatbot-messages');
const chatbotInput = document.getElementById('chatbot-input');
const chatbotSend = document.getElementById('chatbot-send');
const suggestionBtns = document.querySelectorAll('.suggestion');

let conversationHistory = []; // pour mémoire simple

// Ouvrir/fermer
if (chatbotToggle && chatbotWindow) {
    chatbotToggle.addEventListener('click', () => {
        chatbotWindow.classList.toggle('open');
    });
    chatbotClose.addEventListener('click', () => {
        chatbotWindow.classList.remove('open');
    });
}

function addChatMessage(text, sender = 'user') {
    const msgDiv = document.createElement('div');
    msgDiv.classList.add('message', sender);
    msgDiv.innerText = text;
    chatbotMessages.appendChild(msgDiv);
    chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
    // Mémoriser l'historique (max 10)
    conversationHistory.push({ sender, text });
    if (conversationHistory.length > 10) conversationHistory.shift();
}

// Nettoyer le texte pour mieux détecter les intentions
function normalize(text) {
    return text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""); // enlève accents
}

function getBotResponse(userMessage) {
    let msg = normalize(userMessage);
    
    // Dictionnaire des réponses (intentions)
    const intents = {
        // Salutations
        'bonjour|salut|coucou|hello|hey': "Bonjour ! Comment puis-je vous aider ?",
        'ça va|comment allez-vous|comment ça va': "Très bien, merci ! Et vous ?",
        'merci|thanks': "Avec plaisir !",
        
        // Projets généraux
        'projets?|quels projets|vos projets|liste des projets': "Mes principaux projets : GTB (bibliothèque), DorkLS, SQLI Scanner, StockVison, PHP Compiler, Analyse COVID-19. Lequel vous intéresse ?",
        
        // Projet GTB
        'gtb|gestion de bibliothèque|bibliothèque': "GTB : gestion de bibliothèque avec carte numérique, détection de vol, base Oracle SQL. Voir site officiel.",
        
        // DorkLS
        'dorkls|scanner de vulnérabilités|dork': "DorkLS : scanner web multithreadé pour trouver des failles de sécurité via moteurs de recherche.",
        
        // SQLI Scanner
        'sqli|injection sql|scan sql': "SQLI Scanner : détection et exploitation des injections SQL avec contournement WAF.",
        
        // StockVison
        'stockvison|gestion de stock|deepseek': "StockVison : gestion de stock intelligente avec assistant DeepSeek.",
        
        // PHP Compiler
        'php compiler|analyseur php|compilateur php': "PHP Compiler : analyse lexicale et syntaxique de code PHP en temps réel.",
        
        // COVID-19
        'covid|covid-19|analyse covid|simulation épidémiologique': "Analyse COVID-19 : simulation en C avec arbres binaires de recherche et statistiques par âge.",
        
        // Compétences
        'compétences|skills|technologies|langages|outils': "Mes compétences : Java, Python, C, JavaScript, SQL, PHP, cybersécurité, Linux, Git, Three.js, DeepSeek.",
        
        // Contact
        'contact|email|mail|me contacter': "Vous pouvez m'écrire à samoumegharba210@gmail.com ou utiliser le formulaire de contact.",
        
        // CV
        'cv|télécharger cv|mon cv': "Mon CV est disponible en téléchargement dans le footer du site.",
        
        // À propos
        'qui es-tu|présentation|toi': "Je suis l'assistant virtuel du portfolio de Samou Megharba, ingénieur en génie logiciel.",
        
        // Aide
        'aide|help|que faire': "Vous pouvez me poser des questions sur les projets, compétences, contact, ou taper un nom de projet (GTB, DorkLS, etc.)."
    };
    
    // Parcours des intentions
    for (let pattern in intents) {
        const regex = new RegExp(pattern, 'i');
        if (regex.test(msg)) {
            return intents[pattern];
        }
    }
    
    // Vérifier si le message contient un nom de projet spécifique non capturé
    const projectKeywords = ['gtb', 'dorkls', 'sqli', 'stockvison', 'php', 'covid'];
    for (let kw of projectKeywords) {
        if (msg.includes(kw)) {
            return `Je peux vous parler du projet ${kw.toUpperCase()}. Que voulez-vous savoir exactement ?`;
        }
    }
    
    // Réponse par défaut
    return "Je n'ai pas compris. Essayez de me poser une question sur : projets, compétences, contact, ou le nom d'un projet (GTB, DorkLS, SQLI Scanner, StockVison, PHP Compiler, COVID-19).";
}

function sendMessage(message = null) {
    let userMessage = message || chatbotInput.value.trim();
    if (userMessage === '') return;
    addChatMessage(userMessage, 'user');
    if (!message) chatbotInput.value = '';
    
    // Simuler délai de réponse
    setTimeout(() => {
        const reply = getBotResponse(userMessage);
        addChatMessage(reply, 'bot');
    }, 400);
}

// Événements
chatbotSend.addEventListener('click', () => sendMessage());
chatbotInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
});

// Gestion des suggestions
suggestionBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const text = btn.innerText;
        sendMessage(text);
    });
}); 