// ===== NAVBAR SCROLL EFFECT =====
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
});

// ===== MOBILE NAV TOGGLE =====
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');

navToggle.addEventListener('click', () => {
    navToggle.classList.toggle('active');
    navLinks.classList.toggle('active');
    document.body.style.overflow = navLinks.classList.contains('active') ? 'hidden' : '';
});

// Close mobile nav on link click
navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
        navToggle.classList.remove('active');
        navLinks.classList.remove('active');
        document.body.style.overflow = '';
    });
});

// ===== STAT COUNTER ANIMATION =====
function animateCounters() {
    const counters = document.querySelectorAll('.stat-number[data-count]');
    counters.forEach(counter => {
        const target = parseInt(counter.getAttribute('data-count'));
        const duration = 2000;
        const startTime = Date.now();

        function update() {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // Ease out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            counter.textContent = Math.floor(eased * target);
            if (progress < 1) {
                requestAnimationFrame(update);
            } else {
                counter.textContent = target;
            }
        }
        update();
    });
}

// Trigger counter animation when hero stats are visible
const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            animateCounters();
            statsObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.5 });

const heroStats = document.querySelector('.hero-stats');
if (heroStats) statsObserver.observe(heroStats);

// ===== SCROLL REVEAL ANIMATIONS =====
function setupRevealAnimations() {
    const reveals = [
        '.experience-content',
        '.experience-visual',
        '.service-card',
        '.consultation-content',
        '.consultation-form-wrapper',
        '.faq-item',
        '.section-header'
    ];

    reveals.forEach(selector => {
        document.querySelectorAll(selector).forEach(el => {
            el.classList.add('reveal');
        });
    });

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                // Stagger the animations
                setTimeout(() => {
                    entry.target.classList.add('visible');
                }, index * 100);
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));
}

setupRevealAnimations();

// ===== SERVICE GALLERY MODAL =====
const galleryModal = document.getElementById('galleryModal');
const galleryClose = document.getElementById('galleryClose');
const galleryTitle = document.getElementById('galleryTitle');
const gallerySubtitle = document.getElementById('gallerySubtitle');
const galleryGrid = document.getElementById('galleryGrid');

const serviceNames = {
    masterbedroom: 'Master Bedroom',
    kitchen: 'Kitchen',
    customized: 'Customized Design',
    tvunit: 'TV Unit',
    pujaunit: 'Puja Unit',
    cruise: 'Cruise Designs'
};

const serviceDescriptions = {
    masterbedroom: 'Luxurious master bedroom designs crafted for ultimate comfort and elegance',
    kitchen: 'Modern modular kitchens blending functionality with stunning aesthetics',
    customized: 'Bespoke interior solutions tailored uniquely to your vision',
    tvunit: 'Sleek and modern TV entertainment units that become focal points',
    pujaunit: 'Sacred puja spaces designed with devotion, tradition, and grace',
    cruise: 'Compact luxury interiors designed for premium cruise experiences'
};

// Mapping categories to their respective images
const serviceImages = {
    masterbedroom: [
        'images/masterbedroom-1.jpg',
        'images/masterbedroom-2.jpg',
        'images/masterbedroom-3.jpg',
        'images/masterbedroom-4.jpg',
        'images/masterbedroom-5.jpg',
        'images/masterbedroom-6.jpg',
        'images/masterbedroom-7.jpg',
        'images/masterbedroom-8.jpg'
    ],
    kitchen: [
        'images/kitchen-1.jpg',
        'images/kitchen-2.jpg',
        'images/kitchen-3.jpg',
        'images/kitchen-4.jpg'
    ],
    customized: [
        'images/customized-1.jpg',
        'images/customized-2.jpg',
        'images/customized-3.jpg',
        'images/customized-4.jpg',
        'images/customized-5.jpg',
        'images/customized-6.jpg',
        'images/customized-7.jpg',
        'images/customized-8.jpg',
        'images/customized-9.jpg'
    ],
    tvunit: [
        'images/tvunit-1.jpg',
        'images/tvunit-2.jpg',
        'images/tvunit-3.jpg',
        'images/tvunit-4.jpg',
        'images/tvunit-5.jpg',
        'images/tvunit-6.jpg',
        'images/tvunit-7.jpg',
        'images/tvunit-8.jpg',
        'images/tvunit-9.jpg'
    ],
    pujaunit: [
        'images/pujaunit-1.jpg',
        'images/pujaunit-2.jpg',
        'images/pujaunit-3.jpg',
        'images/pujaunit-4.jpg',
        'images/pujaunit-5.jpg'
    ],
    cruise: [
        'images/cruise-1.jpg',
        'images/cruise-2.jpg',
        'images/cruise-3.jpg',
        'images/cruise-4.jpg',
        'images/cruise-5.jpg',
        'images/cruise-6.jpg',
        'images/cruise-7.jpg',
        'images/cruise-8.jpg',
        'images/cruise-9.jpg',
        'images/cruise-10.jpg'
    ]
};

// Lightbox elements
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightboxImg');
const lightboxClose = document.getElementById('lightboxClose');

function openLightbox(imgSrc) {
    lightboxImg.src = imgSrc;
    lightbox.classList.add('active');
}

lightboxClose.addEventListener('click', () => {
    lightbox.classList.remove('active');
});

lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) lightbox.classList.remove('active');
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        lightbox.classList.remove('active');
        closeGallery();
    }
});

// ===== DYNAMIC CONTENT & THEME LOADER =====
let activeSiteData = null;
let currentWhatsAppNumber = "916290902501";

function bindServiceCardClicks() {
    document.querySelectorAll('.service-card').forEach(card => {
        card.addEventListener('click', () => {
            const service = card.getAttribute('data-service');
            galleryTitle.textContent = serviceNames[service] || 'Gallery';
            gallerySubtitle.textContent = serviceDescriptions[service] || 'Our latest projects';

            const images = serviceImages[service];

            if (images && images.length > 0) {
                galleryGrid.innerHTML = images.map(imgSrc => `
                    <div class="gallery-item">
                        <img src="${imgSrc}" alt="${serviceNames[service] || 'Gallery'} Work" loading="lazy" onclick="openLightbox('${imgSrc}')">
                    </div>
                `).join('');
            } else {
                galleryGrid.innerHTML = `
                    <div class="gallery-placeholder">
                        <div class="gallery-placeholder-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                                <circle cx="8.5" cy="8.5" r="1.5"/>
                                <polyline points="21 15 16 10 5 21"/>
                            </svg>
                        </div>
                        <p>Portfolio images coming soon!</p>
                        <span>Contact us to see our full ${serviceNames[service] || ''} collection</span>
                        <a href="#consultation" class="btn btn-primary btn-sm gallery-cta" onclick="closeGallery()">Request Portfolio</a>
                    </div>
                `;
            }

            galleryModal.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    });
}

function bindFaqClicks() {
    document.querySelectorAll('.faq-question').forEach(btn => {
        btn.addEventListener('click', () => {
            const item = btn.parentElement;
            const isActive = item.classList.contains('active');

            document.querySelectorAll('.faq-item').forEach(faq => {
                faq.classList.remove('active');
                faq.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
            });

            if (!isActive) {
                item.classList.add('active');
                btn.setAttribute('aria-expanded', 'true');
            }
        });
    });
}

async function loadDynamicSiteContent() {
    try {
        const res = await fetch('site-data.json?v=' + Date.now());
        if (res.ok) {
            activeSiteData = await res.json();
            localStorage.setItem('luova_site_data', JSON.stringify(activeSiteData));
        } else {
            const cached = localStorage.getItem('luova_site_data');
            if (cached) activeSiteData = JSON.parse(cached);
        }
    } catch (e) {
        const cached = localStorage.getItem('luova_site_data');
        if (cached) {
            try { activeSiteData = JSON.parse(cached); } catch(err){}
        }
    }

    if (!activeSiteData) return;

    // 1. Theme / Colors & Gradients
    if (activeSiteData.theme) {
        const root = document.documentElement;
        if (activeSiteData.theme.colorLight) root.style.setProperty('--color-light', activeSiteData.theme.colorLight);
        if (activeSiteData.theme.colorBeige) root.style.setProperty('--color-beige', activeSiteData.theme.colorBeige);
        if (activeSiteData.theme.colorDark) root.style.setProperty('--color-dark', activeSiteData.theme.colorDark);
        if (activeSiteData.theme.colorGold) root.style.setProperty('--color-gold', activeSiteData.theme.colorGold);
        if (activeSiteData.theme.colorText) root.style.setProperty('--color-text', activeSiteData.theme.colorText);
        if (activeSiteData.theme.colorTextMuted) root.style.setProperty('--color-text-muted', activeSiteData.theme.colorTextMuted);

        if (activeSiteData.theme.heroOverlay) {
            const heroOverlay = document.querySelector('.hero-overlay');
            if (heroOverlay) heroOverlay.style.background = activeSiteData.theme.heroOverlay;
        }
        if (activeSiteData.theme.consultationGradient) {
            const consultSec = document.querySelector('.consultation');
            if (consultSec) consultSec.style.background = activeSiteData.theme.consultationGradient;
        }
    }

    // 2. Brand / Logo
    if (activeSiteData.brand) {
        document.querySelectorAll('.logo-letters').forEach(el => el.textContent = activeSiteData.brand.logoLetters || 'LC');
        document.querySelectorAll('.logo-text').forEach(el => {
            const spans = el.querySelectorAll('span');
            if (spans.length >= 2) {
                spans[0].textContent = activeSiteData.brand.logoLine1 || 'LUOVA';
                spans[1].textContent = activeSiteData.brand.logoLine2 || 'CREATION';
            }
        });
    }

    // 3. Contact & Socials
    if (activeSiteData.contact) {
        currentWhatsAppNumber = activeSiteData.contact.whatsapp || "916290902501";
        const waMsg = encodeURIComponent(activeSiteData.contact.whatsappMessage || "Hi Luova Creation, I'm interested in your interior design services.");
        const waLink = `https://wa.me/${currentWhatsAppNumber}?text=${waMsg}`;
        
        const floatWa = document.querySelector('.float-btn.whatsapp');
        if (floatWa) floatWa.href = waLink;

        const floatCall = document.querySelector('.float-btn.call');
        if (floatCall) floatCall.href = `tel:${activeSiteData.contact.phoneRaw || activeSiteData.contact.phone || '+916290902501'}`;

        const floatInsta = document.querySelector('.float-btn.instagram');
        if (floatInsta && activeSiteData.contact.instagram) floatInsta.href = activeSiteData.contact.instagram;

        const footerPhoneLink = document.querySelector('.footer-contact-item a');
        if (footerPhoneLink) {
            footerPhoneLink.href = `tel:${activeSiteData.contact.phoneRaw || activeSiteData.contact.phone}`;
            footerPhoneLink.textContent = activeSiteData.contact.phone || '+91 629 090 2501';
        }
        const footerInsta = document.querySelector('.footer-social a[aria-label="Instagram"]');
        if (footerInsta && activeSiteData.contact.instagram) footerInsta.href = activeSiteData.contact.instagram;
        const footerWa = document.querySelector('.footer-social a[aria-label="WhatsApp"]');
        if (footerWa) footerWa.href = `https://wa.me/${currentWhatsAppNumber}`;
    }

    // 4. Hero Texts
    if (activeSiteData.hero) {
        const badge = document.querySelector('.hero-badge');
        if (badge && activeSiteData.hero.badge) badge.textContent = activeSiteData.hero.badge;

        const title = document.querySelector('.hero-title');
        if (title && activeSiteData.hero.titleLine1) {
            title.innerHTML = `${activeSiteData.hero.titleLine1}<br><span class="hero-title-accent">${activeSiteData.hero.titleAccent || ''}</span>`;
        }

        const subtitle = document.querySelector('.hero-subtitle');
        if (subtitle && activeSiteData.hero.subtitle) subtitle.textContent = activeSiteData.hero.subtitle;

        if (activeSiteData.hero.stats && activeSiteData.hero.stats.length >= 3) {
            const statElements = document.querySelectorAll('.hero-stats .stat');
            activeSiteData.hero.stats.forEach((st, idx) => {
                if (statElements[idx]) {
                    const numEl = statElements[idx].querySelector('.stat-number');
                    const labelEl = statElements[idx].querySelector('.stat-label');
                    if (numEl) {
                        numEl.setAttribute('data-count', st.number);
                        numEl.textContent = st.number;
                    }
                    if (labelEl) labelEl.textContent = st.label;
                }
            });
        }
    }

    // 5. Experience Texts
    if (activeSiteData.experience) {
        const expTag = document.querySelector('.experience-content .section-tag');
        if (expTag && activeSiteData.experience.tag) expTag.textContent = activeSiteData.experience.tag;

        const expTitle = document.querySelector('.experience-content .section-title');
        if (expTitle && activeSiteData.experience.titleLine1) {
            expTitle.innerHTML = `${activeSiteData.experience.titleLine1}<br><span class="text-accent">${activeSiteData.experience.titleAccent || ''}</span>`;
        }

        const expDesc = document.querySelector('.experience-desc');
        if (expDesc && activeSiteData.experience.desc) expDesc.innerHTML = activeSiteData.experience.desc;

        const founderAvatar = document.querySelector('.founder-avatar');
        if (founderAvatar && activeSiteData.experience.founderInitials) founderAvatar.textContent = activeSiteData.experience.founderInitials;

        const founderName = document.querySelector('.founder-card strong');
        if (founderName && activeSiteData.experience.founderName) founderName.textContent = activeSiteData.experience.founderName;

        const founderRole = document.querySelector('.founder-card span');
        if (founderRole && activeSiteData.experience.founderRole) founderRole.textContent = activeSiteData.experience.founderRole;
    }

    // 6. Services & Dynamic Sections
    if (activeSiteData.services && activeSiteData.services.length) {
        activeSiteData.services.forEach(srv => {
            serviceNames[srv.id] = srv.name;
            serviceDescriptions[srv.id] = srv.subtitle;
            serviceImages[srv.id] = srv.images || [];
        });

        const servicesGrid = document.querySelector('.services-grid');
        if (servicesGrid) {
            servicesGrid.innerHTML = activeSiteData.services.map(s => `
                <div class="service-card" data-service="${s.id}" id="service-${s.id}">
                    <div class="service-image">
                        <img src="${s.coverImage}" alt="${s.name}" loading="lazy">
                        <div class="service-overlay">
                            <span class="service-explore">Explore Gallery →</span>
                        </div>
                    </div>
                    <div class="service-info">
                        <h3>${s.name}</h3>
                        <p>${s.subtitle}</p>
                    </div>
                </div>
            `).join('');

            bindServiceCardClicks();
        }

        const select = document.getElementById('userService');
        if (select) {
            select.innerHTML = `<option value="">Select a service</option>` +
                activeSiteData.services.map(s => `<option value="${s.id}">${s.name}</option>`).join('') +
                `<option value="full">Full Home Interior</option>`;
        }
    }

    // 7. FAQs
    if (activeSiteData.faqs && activeSiteData.faqs.length) {
        const faqGrid = document.querySelector('.faq-grid');
        if (faqGrid) {
            faqGrid.innerHTML = activeSiteData.faqs.map((f, i) => `
                <div class="faq-item ${i === 0 ? 'active' : ''}" id="faq-${i+1}">
                    <button class="faq-question" aria-expanded="${i === 0 ? 'true' : 'false'}" aria-controls="faq-answer-${i+1}">
                        <span>${f.question}</span>
                        <div class="faq-toggle"><span></span><span></span></div>
                    </button>
                    <div class="faq-answer" id="faq-answer-${i+1}">
                        <p>${f.answer}</p>
                    </div>
                </div>
            `).join('');
            bindFaqClicks();
        }
    }

    // 8. Footer
    if (activeSiteData.footer) {
        const fDesc = document.querySelector('.footer-brand p');
        if (fDesc && activeSiteData.footer.brandDesc) fDesc.textContent = activeSiteData.footer.brandDesc;

        const fCopy = document.querySelector('.footer-bottom p:first-child');
        if (fCopy && activeSiteData.footer.copyright) fCopy.textContent = activeSiteData.footer.copyright;
    }
}

// Initial bindings
bindServiceCardClicks();
bindFaqClicks();
loadDynamicSiteContent();


// ===== CONSULTATION FORM =====
const consultationForm = document.getElementById('consultationForm');
const formSuccess = document.getElementById('formSuccess');
const submitBtn = document.getElementById('submitBtn');

consultationForm.addEventListener('submit', (e) => {
    e.preventDefault();

    // Gather form details
    const name = document.getElementById('userName').value.trim();
    const email = document.getElementById('userEmail').value.trim();
    const phone = document.getElementById('userPhone').value.trim();
    const service = document.getElementById('userService').value;
    const message = document.getElementById('userMessage').value.trim();

    if (!name || !email || !phone) {
        return;
    }

    // Format the WhatsApp message
    const whatsappNumber = currentWhatsAppNumber || "916290902501";
    let waText = `*New Consultation Request*%0A%0A`;
    waText += `*Name:* ${name}%0A`;
    waText += `*Phone:* ${phone}%0A`;
    waText += `*Email:* ${email}%0A`;
    
    if (service) {
        const serviceSelect = document.getElementById('userService');
        const serviceText = serviceSelect.options[serviceSelect.selectedIndex].text;
        waText += `*Interested In:* ${serviceText}%0A`;
    }
    
    if (message) {
        waText += `*Message:* ${message}`;
    }

    // Animate button
    submitBtn.disabled = true;
    submitBtn.innerHTML = `
        <span>Redirecting to WhatsApp...</span>
        <svg class="spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10" stroke-dasharray="60" stroke-dashoffset="20"/>
        </svg>
    `;

    // Redirect to WhatsApp and show success message
    setTimeout(() => {
        window.open(`https://wa.me/${whatsappNumber}?text=${waText}`, '_blank');
        consultationForm.style.display = 'none';
        formSuccess.style.display = 'block';
        formSuccess.style.animation = 'fadeInUp 0.6s ease forwards';
    }, 1000);
});

// ===== SMOOTH SCROLL FOR ALL ANCHOR LINKS =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            e.preventDefault();
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});

// ===== ACTIVE NAV LINK HIGHLIGHTING =====
const sections = document.querySelectorAll('section[id]');
const navAnchors = document.querySelectorAll('.nav-links a[href^="#"]');

window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(section => {
        const sectionTop = section.offsetTop - 120;
        if (window.scrollY >= sectionTop) {
            current = section.getAttribute('id');
        }
    });

    navAnchors.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
});

// ===== PARALLAX EFFECT ON HERO =====
window.addEventListener('scroll', () => {
    const hero = document.querySelector('.hero-bg img');
    if (hero && window.scrollY < window.innerHeight) {
        hero.style.transform = `scale(${1.05 + window.scrollY * 0.0001}) translateY(${window.scrollY * 0.3}px)`;
    }
});

console.log('✨ Luova Creation — Website loaded successfully');
