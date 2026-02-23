/* ==========================================
   PORTAFOLIO VALE - JAVASCRIPT
   Interacciones y Animaciones Modernas
========================================== */

document.addEventListener('DOMContentLoaded', () => {
    // Inicializar todos los módulos
    Cursor.init();
    Navigation.init();
    ScrollEffects.init();
    Portfolio.init();
    Testimonials.init();
    ContactForm.init();
    Skills.init();
});



/* ==========================================
   CURSOR PERSONALIZADO
========================================== */
const Cursor = {
    init() {
        const cursor = document.querySelector('.cursor');
        const cursorFollower = document.querySelector('.cursor-follower');
        
        if (!cursor || !cursorFollower) return;
        
        // Solo activo en dispositivos con mouse
        if (window.matchMedia('(pointer: fine)').matches) {
            let mouseX = 0, mouseY = 0;
            let cursorX = 0, cursorY = 0;
            let followerX = 0, followerY = 0;
            
            document.addEventListener('mousemove', (e) => {
                mouseX = e.clientX;
                mouseY = e.clientY;
            });
            
            // Animación suave del cursor
            const animate = () => {
                // Cursor principal
                cursorX += (mouseX - cursorX) * 0.2;
                cursorY += (mouseY - cursorY) * 0.2;
                cursor.style.left = cursorX + 'px';
                cursor.style.top = cursorY + 'px';
                
                // Cursor seguidor
                followerX += (mouseX - followerX) * 0.1;
                followerY += (mouseY - followerY) * 0.1;
                cursorFollower.style.left = followerX + 'px';
                cursorFollower.style.top = followerY + 'px';
                
                requestAnimationFrame(animate);
            };
            animate();
            
            // Efectos hover
            const hoverElements = document.querySelectorAll('a, button, .work-card, .service-card-brutal');
            hoverElements.forEach(el => {
                el.addEventListener('mouseenter', () => {
                    cursorFollower.classList.add('hover');
                    cursor.style.transform = 'scale(1.5)';
                });
                el.addEventListener('mouseleave', () => {
                    cursorFollower.classList.remove('hover');
                    cursor.style.transform = 'scale(1)';
                });
            });
        }
    }
};

/* ==========================================
   NAVEGACIÓN
========================================== */
const Navigation = {
    init() {
        this.navbar = document.querySelector('.navbar');
        this.hamburger = document.querySelector('.hamburger');
        this.navLinks = document.querySelector('.nav-links');
        this.navItems = document.querySelectorAll('.nav-link');
        
        this.setupScrollEffect();
        this.setupMobileMenu();
        this.setupSmoothScroll();
        this.setupActiveLink();
    },
    
    setupScrollEffect() {
        let lastScroll = 0;
        
        window.addEventListener('scroll', () => {
            const currentScroll = window.pageYOffset;
            
            if (currentScroll > 50) {
                this.navbar.classList.add('scrolled');
            } else {
                this.navbar.classList.remove('scrolled');
            }
            
            lastScroll = currentScroll;
        });
    },
    
    setupMobileMenu() {
        this.hamburger.addEventListener('click', () => {
            this.hamburger.classList.toggle('active');
            this.navLinks.classList.toggle('active');
            document.body.style.overflow = this.navLinks.classList.contains('active') ? 'hidden' : 'auto';
        });
        
        // Cerrar menú al hacer click en un enlace
        this.navItems.forEach(item => {
            item.addEventListener('click', () => {
                this.hamburger.classList.remove('active');
                this.navLinks.classList.remove('active');
                document.body.style.overflow = 'auto';
            });
        });
    },
    
    setupSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    const headerOffset = 80;
                    const elementPosition = target.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                    
                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        });
    },
    
    setupActiveLink() {
        const sections = document.querySelectorAll('section[id]');
        
        window.addEventListener('scroll', () => {
            let current = '';
            
            sections.forEach(section => {
                const sectionTop = section.offsetTop - 100;
                const sectionHeight = section.clientHeight;
                
                if (window.pageYOffset >= sectionTop && window.pageYOffset < sectionTop + sectionHeight) {
                    current = section.getAttribute('id');
                }
            });
            
            this.navItems.forEach(item => {
                item.classList.remove('active');
                if (item.getAttribute('href') === `#${current}`) {
                    item.classList.add('active');
                }
            });
        });
    }
};

/* ==========================================
   EFECTOS DE SCROLL
========================================== */
const ScrollEffects = {
    init() {
        this.setupRevealAnimations();
        this.setupParallax();
    },
    
    setupRevealAnimations() {
        const reveals = document.querySelectorAll('.reveal-left, .reveal-right, .reveal-up');
        
        const revealOnScroll = () => {
            reveals.forEach(element => {
                const windowHeight = window.innerHeight;
                const elementTop = element.getBoundingClientRect().top;
                const revealPoint = 150;
                
                if (elementTop < windowHeight - revealPoint) {
                    element.classList.add('revealed');
                }
            });
        };
        
        window.addEventListener('scroll', revealOnScroll);
        revealOnScroll(); // Check on load
    },
    
    setupParallax() {
        const shapes = document.querySelectorAll('.shape');
        
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            
            shapes.forEach((shape, index) => {
                const speed = (index + 1) * 0.1;
                shape.style.transform = `translateY(${scrolled * speed}px)`;
            });
        });
    }
};

/* ==========================================
   WORK - MASONRY LAYOUT Y MODAL
========================================== */
const Portfolio = {
    projects: [],
    currentImageIndex: 0,
    currentProject: null,
    
    async init() {
        this.filterTabs = document.querySelectorAll('.work-tab');
        this.workGrid = document.getElementById('workGrid');
        this.modal = document.getElementById('projectModal');
        this.modalClose = document.querySelector('.modal-close');
        
        await this.loadProjects();
        this.setupFilters();
        this.setupModal();
        this.renderProjects('all');
    },
    
    async loadProjects() {
        try {
            const response = await fetch('projects.json');
            const data = await response.json();
            this.projects = data.projects;
        } catch (error) {
            console.error('Error loading projects:', error);
            this.projects = [];
        }
    },
    
    renderProjects(filter = 'all') {
        if (!this.workGrid) return;
        
        const filteredProjects = filter === 'all' 
            ? this.projects 
            : this.projects.filter(project => project.category === filter);
        
        this.workGrid.innerHTML = '';
        
        filteredProjects.forEach((project, index) => {
            const categoryColors = {
                'interiorismo': 'var(--mustard)',
                'mobiliario': 'var(--sky-blue)',
                'producto': 'var(--burnt-orange)',
                'app': 'var(--cream-dark)'
            };
            
            const projectHTML = `
                <div class="work-item" data-category="${project.category}">
                    <div class="work-card" data-project-id="${project.id}">
                        <div class="work-image">
                            <img src="${project.mainImage}" alt="${project.title}" loading="lazy" />
                        </div>
                        <div class="work-overlay">
                            <div class="work-expand-btn">
                                <i class="fas fa-plus"></i>
                            </div>
                        </div>
                        <div class="work-info">
                            <span class="work-category" style="background: ${categoryColors[project.category] || 'var(--gray-dark)'}">
                                ${project.category === 'interiorismo' ? 'Interiores' : 
                                  project.category === 'mobiliario' ? 'Mobiliario' :
                                  project.category === 'producto' ? 'Producto' : 'App'}
                            </span>
                            <h3 class="work-title">${project.title}</h3>
                            <p class="work-description">${project.shortDescription}</p>
                            <div class="work-tags">
                                ${project.details ? Object.entries(project.details).slice(0, 3).map(([key, value]) => 
                                    `<span class="work-tag">${value}</span>`
                                ).join('') : ''}
                            </div>
                        </div>
                    </div>
                </div>
            `;
            this.workGrid.insertAdjacentHTML('beforeend', projectHTML);
        });
        
        // Agregar event listeners a las nuevas cards
        this.setupCardListeners();
        this.setupHoverEffects();
        
        // Animación de entrada para las cards
        this.animateCardsIn();
    },
    
    animateCardsIn() {
        const workItems = document.querySelectorAll('.work-item');
        workItems.forEach((item, index) => {
            // Inicialmente ocultas
            item.style.opacity = '0';
            item.style.transform = 'translateY(30px)';
            
            // Animar con retraso escalonado
            setTimeout(() => {
                item.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
                item.style.opacity = '1';
                item.style.transform = 'translateY(0)';
            }, index * 100); // 100ms de retraso entre cada card
        });
    },
    
    setupCardListeners() {
        const cards = document.querySelectorAll('.work-card');
        cards.forEach(card => {
            card.addEventListener('click', (e) => {
                e.preventDefault();
                const projectId = parseInt(card.dataset.projectId);
                this.openProjectModal(projectId);
            });
        });
    },
    
    setupFilters() {
        this.filterTabs.forEach(btn => {
            btn.addEventListener('click', () => {
                // Remover clase active de todos los botones
                this.filterTabs.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                const filter = btn.dataset.filter;
                this.filterProjects(filter);
            });
        });
    },
    
    filterProjects(filter) {
        // Animación de salida suave antes de cambiar el contenido
        const workItems = document.querySelectorAll('.work-item');
        
        if (workItems.length > 0) {
            workItems.forEach(item => {
                item.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
                item.style.opacity = '0';
                item.style.transform = 'translateY(-20px)';
            });
            
            // Esperar a que termine la animación de salida
            setTimeout(() => {
                this.renderProjects(filter);
            }, 300);
        } else {
            // Si no hay cards, renderizar directamente
            this.renderProjects(filter);
        }
    },
    
    setupModal() {
        // Cerrar modal
        this.modalClose.addEventListener('click', () => this.closeModal());
        
        // Cerrar modal al hacer click fuera
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.closeModal();
            }
        });
        
        // Cerrar modal con ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modal.classList.contains('show')) {
                this.closeModal();
            }
        });
        
        // Navegación de galería
        document.querySelector('.prev-btn').addEventListener('click', () => {
            this.previousImage();
        });
        
        document.querySelector('.next-btn').addEventListener('click', () => {
            this.nextImage();
        });
    },
    
    openProjectModal(projectId) {
        this.currentProject = this.projects.find(p => p.id === projectId);
        if (!this.currentProject) return;
        
        this.currentImageIndex = 0;
        this.populateModal();
        this.modal.classList.add('show');
        document.body.style.overflow = 'hidden';
    },
    
    closeModal() {
        this.modal.classList.remove('show');
        document.body.style.overflow = 'auto';
    },
    
    populateModal() {
        const project = this.currentProject;
        
        // Título y tags
        document.getElementById('modalTitle').textContent = project.title;
        document.getElementById('modalDescription').textContent = project.fullDescription;
        
        // Tags
        const tagsContainer = document.getElementById('modalTags');
        tagsContainer.innerHTML = '';
        project.tags.forEach(tag => {
            const tagElement = document.createElement('span');
            tagElement.className = 'project-tag';
            tagElement.textContent = tag;
            tagsContainer.appendChild(tagElement);
        });
        
        // Galería de imágenes
        this.setupGallery();
        
        // Detalles del proyecto
        this.setupDetails();
    },
    
    setupGallery() {
        const project = this.currentProject;
        const mainImage = document.getElementById('mainImage');
        const thumbnailsContainer = document.getElementById('thumbnails');
        
        // Imagen principal
        mainImage.src = project.images[this.currentImageIndex];
        mainImage.alt = project.title;
        
        // Thumbnails
        thumbnailsContainer.innerHTML = '';
        project.images.forEach((image, index) => {
            const thumbnailHTML = `
                <div class="thumbnail ${index === this.currentImageIndex ? 'active' : ''}" data-index="${index}">
                    <img src="${image}" alt="${project.title} ${index + 1}" />
                </div>
            `;
            thumbnailsContainer.insertAdjacentHTML('beforeend', thumbnailHTML);
        });
        
        // Event listeners para thumbnails
        document.querySelectorAll('.thumbnail').forEach((thumb, index) => {
            thumb.addEventListener('click', () => {
                this.currentImageIndex = index;
                this.updateGallery();
            });
        });
    },
    
    setupDetails() {
        const project = this.currentProject;
        const detailsContainer = document.getElementById('modalDetails');
        
        detailsContainer.innerHTML = '';
        Object.entries(project.details).forEach(([key, value]) => {
            const detailHTML = `
                <div class="detail-item">
                    <span class="detail-label">${key}</span>
                    <span class="detail-value">${value}</span>
                </div>
            `;
            detailsContainer.insertAdjacentHTML('beforeend', detailHTML);
        });
    },
    
    updateGallery() {
        const project = this.currentProject;
        const mainImage = document.getElementById('mainImage');
        
        // Actualizar imagen principal
        mainImage.src = project.images[this.currentImageIndex];
        
        // Actualizar thumbnails activos
        document.querySelectorAll('.thumbnail').forEach((thumb, index) => {
            thumb.classList.toggle('active', index === this.currentImageIndex);
        });
    },
    
    nextImage() {
        if (this.currentImageIndex < this.currentProject.images.length - 1) {
            this.currentImageIndex++;
        } else {
            this.currentImageIndex = 0;
        }
        this.updateGallery();
    },
    
    previousImage() {
        if (this.currentImageIndex > 0) {
            this.currentImageIndex--;
        } else {
            this.currentImageIndex = this.currentProject.images.length - 1;
        }
        this.updateGallery();
    },
    
    setupHoverEffects() {
        const portfolioItems = document.querySelectorAll('.portfolio-card');
        
        portfolioItems.forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                
                const rotateX = (y - centerY) / 10;
                const rotateY = (centerX - x) / 10;
                
                card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-10px)`;
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0)';
            });
        });
    }
};

/* ==========================================
   TESTIMONIOS - SLIDER
========================================== */
const Testimonials = {
    init() {
        this.cards = document.querySelectorAll('.testimonial-card');
        this.dots = document.querySelectorAll('.dot');
        this.currentIndex = 0;
        
        if (this.cards.length === 0) return;
        
        this.setupDots();
        this.autoPlay();
    },
    
    setupDots() {
        this.dots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                this.goToSlide(index);
            });
        });
    },
    
    goToSlide(index) {
        this.cards.forEach(card => card.classList.remove('active'));
        this.dots.forEach(dot => dot.classList.remove('active'));
        
        this.cards[index].classList.add('active');
        this.dots[index].classList.add('active');
        this.currentIndex = index;
    },
    
    nextSlide() {
        this.currentIndex = (this.currentIndex + 1) % this.cards.length;
        this.goToSlide(this.currentIndex);
    },
    
    autoPlay() {
        setInterval(() => {
            this.nextSlide();
        }, 5000);
    }
};

/* ==========================================
   FORMULARIO DE CONTACTO
========================================== */
const ContactForm = {
    init() {
        this.form = document.getElementById('contact-form');
        
        if (!this.form) return;
        
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSubmit();
        });
    },
    
    handleSubmit() {
        const submitBtn = this.form.querySelector('.btn-submit');
        const originalText = submitBtn.innerHTML;
        
        // Simular envío
        submitBtn.innerHTML = '<span>Enviando...</span><i class="fas fa-spinner fa-spin"></i>';
        submitBtn.disabled = true;
        
        setTimeout(() => {
            submitBtn.innerHTML = '<span>¡Mensaje Enviado!</span><i class="fas fa-check"></i>';
            submitBtn.style.background = 'linear-gradient(135deg, #10B981 0%, #059669 100%)';
            
            // Resetear formulario
            setTimeout(() => {
                this.form.reset();
                submitBtn.innerHTML = originalText;
                submitBtn.style.background = '';
                submitBtn.disabled = false;
            }, 3000);
        }, 2000);
    }
};

/* ==========================================
   ANIMACIÓN DE SKILLS
========================================== */
const Skills = {
    init() {
        this.skillBars = document.querySelectorAll('.skill-progress');
        this.animated = false;
        
        this.setupObserver();
    },
    
    setupObserver() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !this.animated) {
                    this.animateSkills();
                    this.animated = true;
                }
            });
        }, { threshold: 0.5 });
        
        const skillsSection = document.querySelector('.skills');
        if (skillsSection) {
            observer.observe(skillsSection);
        }
    },
    
    animateSkills() {
        this.skillBars.forEach(bar => {
            const width = bar.dataset.width;
            setTimeout(() => {
                bar.style.width = `${width}%`;
            }, 200);
        });
    }
};

/* ==========================================
   EFECTOS ADICIONALES
========================================== */

// Typing Effect para el hero (opcional)
const TypeWriter = {
    init(element, words, wait = 3000) {
        this.element = document.querySelector(element);
        if (!this.element) return;
        
        this.words = words;
        this.wait = parseInt(wait, 10);
        this.wordIndex = 0;
        this.txt = '';
        this.isDeleting = false;
        this.type();
    },
    
    type() {
        const current = this.wordIndex % this.words.length;
        const fullTxt = this.words[current];
        
        if (this.isDeleting) {
            this.txt = fullTxt.substring(0, this.txt.length - 1);
        } else {
            this.txt = fullTxt.substring(0, this.txt.length + 1);
        }
        
        this.element.innerHTML = `<span class="txt">${this.txt}</span>`;
        
        let typeSpeed = 100;
        
        if (this.isDeleting) {
            typeSpeed /= 2;
        }
        
        if (!this.isDeleting && this.txt === fullTxt) {
            typeSpeed = this.wait;
            this.isDeleting = true;
        } else if (this.isDeleting && this.txt === '') {
            this.isDeleting = false;
            this.wordIndex++;
            typeSpeed = 500;
        }
        
        setTimeout(() => this.type(), typeSpeed);
    }
};

// Contador animado
const Counter = {
    init() {
        const counters = document.querySelectorAll('.counter');
        
        counters.forEach(counter => {
            const updateCount = () => {
                const target = +counter.getAttribute('data-target');
                const count = +counter.innerText;
                const increment = target / 100;
                
                if (count < target) {
                    counter.innerText = Math.ceil(count + increment);
                    setTimeout(updateCount, 20);
                } else {
                    counter.innerText = target;
                }
            };
            
            updateCount();
        });
    }
};

// Efecto Magnetic para botones
const MagneticButtons = {
    init() {
        const buttons = document.querySelectorAll('.btn-primary');
        
        buttons.forEach(btn => {
            btn.addEventListener('mousemove', (e) => {
                const rect = btn.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;
                
                btn.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
            });
            
            btn.addEventListener('mouseleave', () => {
                btn.style.transform = 'translate(0, 0)';
            });
        });
    }
};

// Inicializar efectos adicionales después del loader
window.addEventListener('load', () => {
    setTimeout(() => {
        MagneticButtons.init();
    }, 2500);
});

// Smooth scroll con GSAP-like easing (sin dependencias)
const smoothScroll = {
    lerp: (start, end, factor) => {
        return start + (end - start) * factor;
    },
    
    init() {
        let currentY = window.scrollY;
        let targetY = window.scrollY;
        
        window.addEventListener('scroll', () => {
            targetY = window.scrollY;
        });
        
        const update = () => {
            currentY = this.lerp(currentY, targetY, 0.1);
            requestAnimationFrame(update);
        };
        
        update();
    }
};
