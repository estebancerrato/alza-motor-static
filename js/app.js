import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

// --- GESTOR DE CARGA GLOBAL ---
const loadingManager = new THREE.LoadingManager();
const loaderElement = document.getElementById('loader');
const loaderText = document.getElementById('loader-text');




// --- MÓDULO DE LA ESCENA 3D ---
class Scene3D {
    constructor(containerId, modelPath, autoRotate = false) {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            console.error(`No se encontró el contenedor con el ID: ${containerId}`);
            return;
        }

        this.modelPath = modelPath;
        this.autoRotate = autoRotate;
        this.clock = new THREE.Clock();

        this.init();
    }

    init() {
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.renderer.setSize(this.container.offsetWidth, this.container.offsetHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.container.appendChild(this.renderer.domElement);

        const pmremGenerator = new THREE.PMREMGenerator(this.renderer);

        this.scene = new THREE.Scene();
        this.scene.environment = pmremGenerator.fromScene(new RoomEnvironment(this.renderer), 0.04).texture;
        
        this.camera = new THREE.PerspectiveCamera(75, this.container.offsetWidth / this.container.offsetHeight, 0.1, 1000);
        this.camera.position.set(0, 0.2, 2.5);

        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.autoRotate = this.autoRotate;
        this.controls.enableZoom = false; 
        this.controls.autoRotateSpeed = 3.2;

        this.addLights();
        this.loadModel();

        window.addEventListener('resize', this.onWindowResize.bind(this));
        this.animate();
    }
    
    addLights() {
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
        directionalLight.position.set(5, 5, 5).normalize();
        this.scene.add(directionalLight);
    }

    loadModel() {
        const stainlessSteelMaterial = new THREE.MeshStandardMaterial({
            color: 0xc9c9c9,
            metalness: 0.95,
            roughness: 0.3,
            envMapIntensity: 1.0
        });

        const loader = new GLTFLoader(loadingManager);
        loader.load(this.modelPath, (gltf) => {
            this.model = gltf.scene;
            this.model.traverse((child) => {
                if (child.isMesh) {
                    child.material = stainlessSteelMaterial;
                }
            });

            const box = new THREE.Box3().setFromObject(this.model);
            const center = box.getCenter(new THREE.Vector3());
            this.model.position.sub(center);
            this.scene.add(this.model);
        });
    }

    animate() {
        requestAnimationFrame(this.animate.bind(this));
        this.controls.update();

        if (!this.autoRotate && this.model) {
            const elapsedTime = this.clock.getElapsedTime();
            this.model.position.y = Math.sin(elapsedTime * 2) * 0.05;
        }

        this.renderer.render(this.scene, this.camera);
    }

    onWindowResize() {
        if (!this.container || this.container.offsetWidth === 0 || this.container.offsetHeight === 0) return;
        this.camera.aspect = this.container.offsetWidth / this.container.offsetHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(this.container.offsetWidth, this.container.offsetHeight);
    }
}


// ===== MÓDULO PARA EFECTO LINTERNA (SPOTLIGHT) =====
const spotlightEffect = {
    init() {
        const spotlight = document.getElementById('spotlight');
        if (!spotlight) return;

        const spotlightAnimation = anime({
            targets: spotlight,
            left: '0px',
            top: '0px',
            duration: 400,
            easing: 'easeOutQuad',
            autoplay: false,
        });

        window.addEventListener('mousemove', (e) => {
            spotlightAnimation.left = `${e.clientX}px`;
            spotlightAnimation.top = `${e.clientY}px`;
            spotlightAnimation.play();
        });
        
        document.body.addEventListener('mouseenter', () => {
             anime({ targets: spotlight, opacity: 1, duration: 500 });
        });

        document.body.addEventListener('mouseleave', () => {
            anime({ targets: spotlight, opacity: 0, duration: 500 });
        });
    }
};


// ===== LÓGICA PARA EL SELECTOR DE PRODUCTOS (CON AUTOPLAY) =====
function setupProductSelector() {
    const products = {
        'mesh': {
            name: 'Alza <br><span class="highlight">con Malla</span>',
            price: 'L.300',
            image: '/images/gallery/4.png',
            description: `
                 <ul class="product-spec-list">
                    <li><span><strong>Diseño Compacto:</strong> Solución discreta y efectiva.</span></li>
                    <li><span><strong>Filtro de Malla:</strong> Elimina códigos de error (CEL) de baja eficiencia.</span></li>
                    <li><span><strong>Material:</strong> Acero Inoxidable duradero y de mano de obra fina.</span></li>
                    <li><span><strong>Ajuste Universal:</strong> Para todos los vehículos con rosca M18x1.5.</span></li>
                </ul>
                `
        },
        'filter': {
            name: 'Alza Recto<br><span class="highlight">con Filtro</span>',
            price: 'L.500',
            image: '/images/gallery/6.png',
            description: `
                <ul class="product-spec-list">
                    <li><span><strong>Diseño Recto:</strong> Para una instalación directa y sencilla en la mayoría de vehículos.</span></li>
                    <li><span><strong>Micro-Filtro:</strong> Suprime eficazmente los códigos de error (CEL) del catalizador.</span></li>
                    <li><span><strong>Material:</strong> Fabricado en Acero Inoxidable de alta durabilidad.</span></li>
                    <li><span><strong>Ajuste Universal:</strong> Compatible con rosca estándar M18x1.5.</span></li>
                </ul>`
        },
        'l-filter': {
            name: 'Alza tipo L<br><span class="highlight">con Filtro</span>',
            price: 'L.600',
            image: '/images/gallery/3.png',
            description: `
                <ul class="product-spec-list">
                    <li><span><strong>Diseño en L:</strong> Ideal para sistemas de escape con espacio limitado.</span></li>
                    <li><span><strong>Micro-Filtro:</strong> Filtro catalítico integrado para eliminar códigos de error (CEL).</span></li>
                    <li><span><strong>Material:</strong> Acero Inoxidable de alta durabilidad y resistencia.</span></li>
                    <li><span><strong>Ajuste Universal:</strong> Compatible con rosca estándar M18x1.5.</span></li>
                </ul>`
        },
        '45-degree': {
            name: 'Alza Angular<br><span class="highlight">45 Grados con Filtro</span>',
            price: 'L.600',
            image: '/images/gallery/7.png',
            description: `
                <ul class="product-spec-list">
                    <li><span><strong>Diseño Angular:</strong> Perfecto para ángulos de escape complicados.</span></li>
                     <li><span><strong>Micro-Filtro:</strong> Contiene un filtro para eliminar códigos de error (CEL).</span></li>
                    <li><span><strong>Material:</strong> Fabricado en Acero Inoxidable de alta durabilidad.</span></li>
                    <li><span><strong>Ajuste Universal:</strong> Compatible con rosca de sensor O2 M18x1.5.</span></li>
                </ul>`
        }
    };

    const imageEl = document.getElementById('product-image');
    const detailsContainer = document.getElementById('product-details-content');
    const titleEl = document.getElementById('product-title');
    const ctaLinkEl = document.getElementById('cta-whatsapp-link');
    const selectorBtns = document.querySelectorAll('.product-selector-btn');
    const progressBar = document.querySelector('.autoplay-progress-bar');
    const progressBarContainer = document.querySelector('.autoplay-progress');
    
    if (!imageEl || !detailsContainer || selectorBtns.length === 0 || !progressBar) return;

    const productIds = Object.keys(products);
    const AUTOPLAY_DURATION = 6000;
    let currentIndex = 0;
    let autoPlayInterval = null;
    let progressBarAnimation = null;

    function updateProduct(productId) {
        const product = products[productId];
        if (!product) return;
        
        const contentElements = detailsContainer.children;
        const whatsAppBaseUrl = 'https://wa.me/50493143705?text=';

        anime.timeline({
            easing: 'easeOutQuad',
            duration: 400
        }).add({
            targets: [imageEl, ...contentElements],
            opacity: 0,
            translateY: (el, i) => i * 5 + 10,
            complete: () => {
                imageEl.src = product.image;
                titleEl.innerHTML = product.name;
                document.getElementById('product-price').textContent = product.price;
                document.getElementById('product-description-content').innerHTML = product.description;

                const productNameForMsg = product.name.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
                const message = `Hola Alza Motor, estoy interesado en el producto: ${productNameForMsg} (${product.price}). Me gustaría saber más.`;
                ctaLinkEl.href = whatsAppBaseUrl + encodeURIComponent(message);
            }
        }).add({
            targets: [imageEl, ...contentElements],
            opacity: 1,
            translateY: 0,
            delay: anime.stagger(50)
        });
    }
    
    function selectProduct(index) {
        currentIndex = index;
        const productId = productIds[currentIndex];
        
        updateProduct(productId);
        
        selectorBtns.forEach(b => b.classList.remove('active'));
        document.querySelector(`.product-selector-btn[data-product="${productId}"]`).classList.add('active');
        
        if (progressBarAnimation) {
             progressBarAnimation.restart();
        }
    }

    function startAutoPlay() {
        progressBarContainer.style.display = 'block';
        autoPlayInterval = setInterval(() => {
            currentIndex = (currentIndex + 1) % productIds.length;
            selectProduct(currentIndex);
        }, AUTOPLAY_DURATION);

        progressBarAnimation = anime({
            targets: progressBar,
            width: '100%',
            easing: 'linear',
            duration: AUTOPLAY_DURATION,
            loop: true
        });
    }

    function stopAutoPlay() {
        clearInterval(autoPlayInterval);
        if (progressBarAnimation) progressBarAnimation.pause();
        progressBarContainer.style.display = 'none';
    }

    selectorBtns.forEach((btn, index) => {
        btn.addEventListener('click', () => {
            stopAutoPlay();
            selectProduct(index);
        });
    });

    selectProduct(0);
    startAutoPlay();
}


// ===== CONTROLADOR DE ANIMACIONES =====
const animationController = {
    init() {
        this.setupHeroAnimation();
        this.setupScrollAnimations();
        this.setupScrollSpy(); // Añadido para el resaltado del menú
        setupProductSelector();
        this.setupInstallationDiagram();
        
        // Desactiva animaciones interactivas pesadas en celulares
        if (window.innerWidth > 768) {
            this.setupHoverAnimations();
            this.setupAtropos();
            this.setupNeatGradient();
        }
        
        if (window.innerWidth > 900) {
            spotlightEffect.init();
        }
    },

    setupHeroAnimation() {
        anime.timeline({ easing: 'easeOutExpo' })
            .add({
                targets: '.hero-main-logo',
                opacity: [0, 1],
                scale: [0.7, 1],
                duration: 1000
            })
            .add({
                targets: '.subtitle',
                opacity: [0, 1],
                translateY: [30, 0],
                duration: 800
            }, '-=600');
    },
    
    setupScrollAnimations() {
        const animateOnScroll = (selector, animationOptions, threshold = 0.25) => {
            const elements = document.querySelectorAll(selector);
            if (elements.length === 0) return;

            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        anime({
                            targets: entry.target,
                            ...animationOptions,
                            delay: anime.stagger(150, { from: 'first' })
                        });
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold });

            elements.forEach(el => observer.observe(el));
        };
        
        animateOnScroll('.animate-on-scroll', { opacity: [0, 1], translateY: [40, 0], duration: 1000, easing: 'easeOutExpo' });
        
        const gif = document.getElementById('check-engine-gif');
        if (gif) {
            const gifObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        gif.classList.add('visible');
                        const originalSrc = gif.src;
                        gif.src = '#';
                        gif.src = originalSrc;
                        gifObserver.unobserve(gif);
                    }
                });
            }, { threshold: 0.5 });
            gifObserver.observe(gif);
        }
    },
    
    setupHoverAnimations() {
        document.querySelectorAll('.nav-link').forEach(link => {
            const span = link.querySelector('span');
            if (span && !span.dataset.hoverReady) {
                span.dataset.hoverReady = true;
                const originalText = span.textContent;
                const letters = originalText.split('').map(letter => `<span>${letter}</span>`).join('');
                span.innerHTML = letters;

                link.addEventListener('mouseenter', () => {
                    anime.remove(span.children);
                    anime({
                        targets: span.children,
                        translateY: [0, -8, 0],
                        opacity: [1, 0.5, 1],
                        rotate: [0, 10, 0],
                        duration: 600,
                        delay: anime.stagger(40),
                        easing: 'easeOutQuad'
                    });
                });
            }
        });
    },

    setupNeatGradient() {
        if (window.ShaderGradient) {
            const gradient = new window.ShaderGradient();
            gradient.init();
        } else {
            console.error('ShaderGradient library not loaded or failed to initialize.');
        }
    },

    setupAtropos() {
        // Para la galería
        document.querySelectorAll('#gallery .atropos').forEach(el => {
            Atropos({
                el: el,
                activeOffset: 50,
                shadowScale: 1.07,
                rotateXMax: 25,
                rotateYMax: 25,
            });
        });

        // Para la imagen principal del producto
        const productAtroposEl = document.querySelector('#product-atropos');
        if (productAtroposEl) {
            Atropos({
                el: productAtroposEl,
                activeOffset: 40,
                shadow: true,
                highlight: true,
                rotateXMax: 25,
                rotateYMax: 25,
                stretchX: 30,
                stretchY: 30,
            });
        }

        // Para la tarjeta de detalles del producto (activa el parallax)
        const detailsAtroposEl = document.querySelector('#details-atropos');
        if (detailsAtroposEl) {
            Atropos({
                el: detailsAtroposEl,
                shadow: false,
                highlight: true,
                rotateXMax: 15,
                rotateYMax: 15,
                stretchX: 40,
                stretchY: 40,
            });
        }
    },

    setupScrollSpy() {
        const sections = document.querySelectorAll('section[id], footer[id]');
        const navLinks = document.querySelectorAll('.nav-link');

        const observer = new IntersectionObserver((entries) => {
            const visibleEntries = entries.filter(entry => entry.isIntersecting);

            if (visibleEntries.length > 0) {
                const currentEntry = visibleEntries[visibleEntries.length - 1];
                const activeId = currentEntry.target.id;

                navLinks.forEach(link => {
                    const linkId = link.getAttribute('href').substring(1);
                    if (linkId === activeId) {
                        link.classList.add('active');
                    } else {
                        link.classList.remove('active');
                    }
                });
            }
        }, {
            rootMargin: '-200px 0px -200px 0px'
        });

        sections.forEach(section => {
            observer.observe(section);
        });
    },

    setupInstallationDiagram() {
        const steps = [
            { text: "Paso 1: Localice el sensor de oxígeno secundario (post-catalizador)." },
            { text: "Paso 2: Use una llave para desconectar y desenroscar el sensor." },
            { text: "Paso 3: Enrosque firmemente la Alza en el puerto vacío del escape." },
            { text: "Paso 4: Finalmente, enrosque el sensor en la Alza y reconecte." },
            { text: "Paso 5: Borre los códigos de error con un escáner y conduzca el vehículo." }
        ];
        let currentStep = 0;
    
        const elements = {
            stepText: document.getElementById('diagram-step-text'),
            nextBtn: document.getElementById('next-step-btn'),
            prevBtn: document.getElementById('prev-step-btn'),
            sensor: document.getElementById('diag-sensor'),
            spacer: document.getElementById('diag-spacer'),
            wrench: document.getElementById('diag-wrench'),
            exhaust: document.getElementById('diag-exhaust-group'),
            cat: document.getElementById('diag-cat-group')
        };
    
        if (Object.values(elements).some(el => !el)) return;
    
        function updateButtonStates() {
            elements.prevBtn.disabled = currentStep === 0;
            elements.nextBtn.disabled = currentStep === steps.length - 1;
        }

        function runAnimation() {
            elements.nextBtn.disabled = true;
            elements.prevBtn.disabled = true;

            const tl = anime.timeline({ 
                easing: 'easeInOutSine', 
                duration: 1200,
                complete: updateButtonStates,
            });

            // Define el estado INICIAL de CADA paso para evitar saltos al retroceder
            switch(currentStep) {
                case 0:
                    anime.set(elements.sensor, { transform: 'translate(385, 60) rotate(0)', opacity: 1 });
                    anime.set(elements.spacer, { opacity: 0 });
                    anime.set(elements.wrench, { opacity: 0 });
                    anime.set([elements.exhaust, elements.cat], { opacity: 1 });

                    tl.add({ targets: [elements.exhaust, elements.cat], opacity: 0.4, duration: 500, })
                      .add({ targets: elements.sensor, scale: [1, 1.15, 1], filter: ['none', 'url(#glow)', 'none'], }, '-=500');
                    break;

                case 1:
                    anime.set(elements.sensor, { transform: 'translate(385, 60) rotate(0)', opacity: 1 });
                    anime.set(elements.spacer, { opacity: 0 });
                    anime.set(elements.wrench, { transform: 'translate(450, 40) rotate(30)', opacity: 0 });
                    anime.set([elements.exhaust, elements.cat], { opacity: 1 });

                    tl.add({ targets: [elements.cat], opacity: 0.4 })
                      .add({ targets: elements.wrench, translateX: 385, translateY: 45, rotate: -5, opacity: 1, duration: 600, })
                      .add({ targets: elements.wrench, rotate: '-=45', duration: 800, }, '+=100')
                      .add({ targets: elements.sensor, translateX: 450, translateY: 30, rotate: -180, duration: 800, }, '-=800')
                      .add({ targets: elements.wrench, opacity: 0, duration: 400, });
                    break;

                case 2:
                    anime.set(elements.sensor, { transform: 'translate(450, 30) rotate(-180)', opacity: 1 });
                    anime.set(elements.spacer, { transform: 'translate(385, 60)', opacity: 0 });
                    anime.set(elements.wrench, { opacity: 0 });
                    anime.set([elements.exhaust, elements.cat], { opacity: 1 });
                    
                    tl.add({ targets: [elements.cat, elements.sensor], opacity: 0.4 })
                      .add({ targets: elements.spacer, opacity: 1, easing: 'easeOutQuint', });
                    break;

                case 3:
                    anime.set(elements.sensor, { transform: 'translate(450, 30) rotate(0)', opacity: 1 });
                    anime.set(elements.spacer, { transform: 'translate(385, 60)', opacity: 1 });
                    anime.set([elements.exhaust, elements.cat], { opacity: 1 });
                    
                    tl.add({ targets: [elements.cat], opacity: 0.4 })
                      .add({ targets: elements.sensor, translateX: 385, translateY: 60, rotate: 180, easing: 'easeOutQuint', });
                    break;

                case 4:
                    anime.set(elements.sensor, { transform: 'translate(385, 60) rotate(180)', opacity: 1 });
                    anime.set(elements.spacer, { transform: 'translate(385, 60)', opacity: 1 });
                    anime.set([elements.exhaust, elements.cat], { opacity: 1 });
                    
                    tl.add({ targets: [elements.exhaust, elements.cat, elements.sensor, elements.spacer], opacity: 1 })
                      .add({ targets: [elements.sensor, elements.spacer], filter: ['none', 'url(#glow)', 'none'], duration: 1500, });
                    break;
            }
        }
    
        function updateStep() {
            elements.stepText.textContent = steps[currentStep].text;
            anime({ targets: elements.stepText, opacity: [0, 1], translateY: [10, 0], duration: 400, easing: 'easeOutQuad' });
            runAnimation();
        }
    
        elements.nextBtn.addEventListener('click', () => {
            if (!elements.nextBtn.disabled) {
                currentStep++;
                updateStep();
            }
        });
    
        elements.prevBtn.addEventListener('click', () => {
            if (!elements.prevBtn.disabled) {
                currentStep--;
                updateStep();
            }
        });
    
        updateStep();
    }
};

document.addEventListener('DOMContentLoaded', () => {
    animationController.init();

    if (document.getElementById('interactive-webgl-container-main')) {
        new Scene3D('interactive-webgl-container-main', 'models/alza.glb', true);
    }
    if (document.getElementById('interactive-webgl-container-secondary')) {
        new Scene3D('interactive-webgl-container-secondary', 'models/o2-adapter.glb');
    }
});