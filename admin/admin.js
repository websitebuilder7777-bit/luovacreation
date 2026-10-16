/**
 * LUOVA CREATION - ADMIN CONTROL CENTER
 * Pure Vanilla JavaScript Client-Side Engine
 * Features: Password security, GitHub REST API live syncing,
 * Gallery manager, Section creator, Theme palette editor, Text copy editor.
 */

// Global State
let siteData = null;
let activeServiceIndex = 0;
let ghConfig = {
    token: '',
    user: '',
    repo: '',
    branch: 'main',
    connected: false
};

const MASTER_PASSWORD = '123456789';

// ==================== AUTHENTICATION ====================
const loginScreen = document.getElementById('loginScreen');
const adminDashboard = document.getElementById('adminDashboard');
const loginForm = document.getElementById('loginForm');
const adminPasswordInput = document.getElementById('adminPasswordInput');
const loginError = document.getElementById('loginError');
const togglePasswordBtn = document.getElementById('togglePasswordBtn');
const logoutBtn = document.getElementById('logoutBtn');

function checkAuth() {
    const auth = sessionStorage.getItem('luova_admin_auth');
    if (auth === MASTER_PASSWORD) {
        loginScreen.style.display = 'none';
        adminDashboard.style.display = 'flex';
        initDashboard();
    } else {
        loginScreen.style.display = 'flex';
        adminDashboard.style.display = 'none';
    }
}

loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const entered = adminPasswordInput.value.trim();
    if (entered === MASTER_PASSWORD) {
        sessionStorage.setItem('luova_admin_auth', MASTER_PASSWORD);
        loginError.style.display = 'none';
        loginScreen.style.display = 'none';
        adminDashboard.style.display = 'flex';
        initDashboard();
    } else {
        loginError.style.display = 'block';
        adminPasswordInput.value = '';
        adminPasswordInput.focus();
    }
});

togglePasswordBtn.addEventListener('click', () => {
    const type = adminPasswordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    adminPasswordInput.setAttribute('type', type);
    togglePasswordBtn.textContent = type === 'password' ? '👁️' : '🔒';
});

logoutBtn.addEventListener('click', () => {
    sessionStorage.removeItem('luova_admin_auth');
    window.location.reload();
});

// ==================== TAB SWITCHING ====================
document.querySelectorAll('.sidebar-nav .nav-item').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.sidebar-nav .nav-item').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
        
        btn.classList.add('active');
        const tabId = btn.getAttribute('data-tab');
        const targetPane = document.getElementById(tabId);
        if (targetPane) targetPane.classList.add('active');
    });
});

// ==================== NOTIFICATIONS ====================
function showNotification(message, type = 'success') {
    const banner = document.getElementById('adminNotification');
    const textEl = banner.querySelector('.notification-text');
    banner.className = `notification-banner ${type}`;
    textEl.innerHTML = message;
    banner.style.display = 'flex';
    banner.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    setTimeout(() => {
        banner.style.display = 'none';
    }, 8000);
}

// ==================== INITIALIZATION ====================
async function initDashboard() {
    loadSavedGitHubConfig();
    await loadSiteData();
    populateAllFields();
    setupEventListeners();
    
    // If GitHub token was already saved, auto-verify connection
    if (ghConfig.token) {
        connectToGitHub(ghConfig.token, false);
    }
}

// ==================== DATA LOADING ====================
async function loadSiteData() {
    // 1. Try localStorage first (fastest local preview)
    const local = localStorage.getItem('luova_site_data');
    if (local) {
        try {
            siteData = JSON.parse(local);
            return;
        } catch (e) {
            console.warn('Corrupt local storage data', e);
        }
    }

    // 2. Fetch site-data.json
    try {
        const res = await fetch('../site-data.json?v=' + Date.now());
        if (res.ok) {
            siteData = await res.json();
            localStorage.setItem('luova_site_data', JSON.stringify(siteData));
            return;
        }
    } catch (e) {
        console.warn('Could not fetch site-data.json', e);
    }

    // 3. Fallback defaults if site-data.json not reachable
    siteData = getDefaultSiteData();
}

function getDefaultSiteData() {
    return {
        brand: { logoLetters: "LC", logoLine1: "LUOVA", logoLine2: "CREATION", logoImage: "" },
        theme: {
            colorLight: "#F9F9F6",
            colorBeige: "#E3DFD5",
            colorDark: "#2F3E46",
            colorGold: "#D4AF37",
            colorText: "#3a3a3a",
            colorTextMuted: "#7a7a7a",
            heroOverlay: "linear-gradient(135deg, rgba(47, 62, 70, 0.85) 0%, rgba(47, 62, 70, 0.6) 50%, rgba(47, 62, 70, 0.4) 100%)",
            consultationGradient: "linear-gradient(135deg, #2F3E46 0%, #1c262b 100%)"
        },
        contact: {
            phone: "+91 629 090 2501",
            phoneRaw: "+916290902501",
            whatsapp: "916290902501",
            whatsappMessage: "Hi Luova Creation, I'm interested in your interior design services.",
            instagram: "https://www.instagram.com/luova__creation_?igsh=c21md3lyamt3bGd1"
        },
        hero: {
            badge: "Premium Interior Design Studio",
            titleLine1: "Crafting Spaces",
            titleAccent: "That Inspire",
            subtitle: "Transform your home into a masterpiece of design. 20 years of excellence in creating breathtaking interiors that reflect your personality.",
            bgImage: "images/hero-bg.jpg",
            stats: [
                { number: 20, suffix: "+", label: "Years Experience" },
                { number: 500, suffix: "+", label: "Projects Delivered" },
                { number: 350, suffix: "+", label: "Happy Families" }
            ]
        },
        experience: {
            tag: "Our Story",
            titleLine1: "Two Decades of",
            titleAccent: "Transforming Spaces",
            desc: "Founded by <strong>Indranil Chatterjee</strong>, Luova Creation has been a pioneer in the interior design industry for over <strong>20 years</strong>. Our name \"Luova\" — meaning <em>creative</em> — embodies our philosophy of bringing innovative, personalized design solutions to every home.",
            founderName: "Indranil Chatterjee",
            founderRole: "Founder & Lead Designer",
            founderInitials: "IC"
        },
        services: [
            { id: "masterbedroom", name: "Master Bedroom", subtitle: "Luxurious sanctuaries designed for comfort and elegance", coverImage: "images/service-masterbedroom.jpg", images: [] },
            { id: "kitchen", name: "Kitchen", subtitle: "Modular kitchens that blend functionality with style", coverImage: "images/service-kitchen.jpg", images: [] },
            { id: "customized", name: "Customized Design", subtitle: "Bespoke solutions tailored to your unique vision", coverImage: "images/service-customized.jpg", images: [] },
            { id: "tvunit", name: "TV Unit", subtitle: "Sleek entertainment centres that become focal points", coverImage: "images/service-tvunit.jpg", images: [] },
            { id: "pujaunit", name: "Puja Unit", subtitle: "Sacred spaces designed with devotion and grace", coverImage: "images/service-pujaunit.jpg", images: [] },
            { id: "cruise", name: "Cruise Designs", subtitle: "Compact luxury interiors for premium cruise cabins", coverImage: "images/service-cruise.jpg", images: [] }
        ],
        consultation: {
            desc: "Ready to transform your home? Get a free consultation with our expert design team."
        },
        faqs: [],
        footer: {
            brandDesc: "Crafting extraordinary interiors for over 20 years.",
            copyright: "© 2026 Luova Creation. All Rights Reserved."
        }
    };
}

// ==================== GITHUB API INTEGRATION ====================
function loadSavedGitHubConfig() {
    const saved = localStorage.getItem('luova_gh_config');
    if (saved) {
        try {
            ghConfig = Object.assign(ghConfig, JSON.parse(saved));
            if (ghConfig.token) {
                document.getElementById('githubTokenInput').value = ghConfig.token;
            }
        } catch (e) {}
    }
}

async function connectToGitHub(token, showToast = true) {
    const btn = document.getElementById('connectGithubBtn');
    const spinner = btn.querySelector('.btn-spinner');
    if (spinner) spinner.style.display = 'inline-block';
    btn.disabled = true;

    try {
        // 1. Verify User
        const userRes = await fetch('https://api.github.com/user', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });

        if (!userRes.ok) {
            throw new Error('Invalid GitHub token. Please verify token permissions.');
        }

        const userData = await userRes.json();
        ghConfig.user = userData.login;
        ghConfig.token = token;

        // 2. Fetch User's Repositories
        const reposRes = await fetch('https://api.github.com/user/repos?per_page=100&sort=updated', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });

        const repos = await reposRes.json();
        const repoSelect = document.getElementById('ghRepoSelect');
        repoSelect.innerHTML = '';

        let matchedRepo = null;
        repos.forEach(repo => {
            const opt = document.createElement('option');
            opt.value = repo.full_name;
            opt.textContent = `${repo.name} (${repo.private ? '🔒 Private' : '🌐 Public'})`;
            repoSelect.appendChild(opt);

            // Auto-detect luova or creation repo
            const lower = repo.name.toLowerCase();
            if (!matchedRepo && (lower.includes('luova') || lower.includes('creation') || lower.includes('interior'))) {
                matchedRepo = repo;
            }
        });

        // Set selected repo
        if (ghConfig.repo) {
            repoSelect.value = ghConfig.repo;
        } else if (matchedRepo) {
            repoSelect.value = matchedRepo.full_name;
            ghConfig.repo = matchedRepo.full_name;
            ghConfig.branch = matchedRepo.default_branch || 'main';
        } else if (repos.length > 0) {
            repoSelect.value = repos[0].full_name;
            ghConfig.repo = repos[0].full_name;
            ghConfig.branch = repos[0].default_branch || 'main';
        }

        ghConfig.connected = true;
        localStorage.setItem('luova_gh_config', JSON.stringify(ghConfig));

        // Update UI
        document.getElementById('ghUserName').textContent = `@${ghConfig.user}`;
        document.getElementById('ghBranchInput').value = ghConfig.branch;
        document.getElementById('githubDetailsCard').style.display = 'block';

        const statusPill = document.getElementById('repoStatusPill');
        statusPill.classList.add('connected');
        document.getElementById('statusPillText').textContent = `Connected: ${ghConfig.repo}`;

        // Attempt to pull latest site-data.json from GitHub repo
        await pullSiteDataFromGitHub(false);

        if (showToast) {
            showNotification(`Connected to GitHub as <strong>@${ghConfig.user}</strong>. Repository: <strong>${ghConfig.repo}</strong>`);
        }
    } catch (err) {
        console.error(err);
        showNotification(err.message, 'error');
        ghConfig.connected = false;
        const statusPill = document.getElementById('repoStatusPill');
        statusPill.classList.remove('connected');
        document.getElementById('statusPillText').textContent = 'GitHub: Token Error';
    } finally {
        if (spinner) spinner.style.display = 'none';
        btn.disabled = false;
    }
}

// Fetch file SHA from GitHub (needed to update existing files)
async function getFileSha(path) {
    if (!ghConfig.connected || !ghConfig.token || !ghConfig.repo) return null;
    try {
        const url = `https://api.github.com/repos/${ghConfig.repo}/contents/${path}?ref=${ghConfig.branch}`;
        const res = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${ghConfig.token}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });
        if (res.ok) {
            const data = await res.json();
            return data.sha;
        }
    } catch (e) {}
    return null;
}

// Upload any file directly to the GitHub repo via API
async function uploadFileToGitHub(filePath, base64Content, commitMessage = 'Upload image from Admin Panel') {
    if (!ghConfig.connected || !ghConfig.token || !ghConfig.repo) {
        throw new Error('Please connect your GitHub token in the "GitHub Token" tab first.');
    }

    const sha = await getFileSha(filePath);
    const body = {
        message: commitMessage,
        content: base64Content,
        branch: ghConfig.branch
    };
    if (sha) body.sha = sha;

    const res = await fetch(`https://api.github.com/repos/${ghConfig.repo}/contents/${filePath}`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${ghConfig.token}`,
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    });

    if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(`GitHub Upload Failed: ${errData.message || res.statusText}`);
    }

    return await res.json();
}

// Pull site-data.json from GitHub
async function pullSiteDataFromGitHub(showToast = true) {
    if (!ghConfig.connected) return;
    try {
        const res = await fetch(`https://api.github.com/repos/${ghConfig.repo}/contents/site-data.json?ref=${ghConfig.branch}`, {
            headers: {
                'Authorization': `Bearer ${ghConfig.token}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });
        if (res.ok) {
            const fileData = await res.json();
            const decoded = decodeURIComponent(escape(atob(fileData.content)));
            siteData = JSON.parse(decoded);
            localStorage.setItem('luova_site_data', JSON.stringify(siteData));
            populateAllFields();
            if (showToast) {
                showNotification('Successfully synced latest content from GitHub repository!');
            }
        }
    } catch (e) {
        console.warn('Could not pull site-data.json from GitHub', e);
    }
}

// Publish site-data.json to GitHub
async function publishToGitHub() {
    gatherAllFields();

    const topBtn = document.getElementById('topPublishBtn');
    const mainBtn = document.getElementById('mainPublishBtn');
    [topBtn, mainBtn].forEach(b => {
        if (!b) return;
        b.disabled = true;
        const spin = b.querySelector('.btn-spinner');
        if (spin) spin.style.display = 'inline-block';
    });

    try {
        // Save locally first
        localStorage.setItem('luova_site_data', JSON.stringify(siteData));

        if (!ghConfig.connected || !ghConfig.token) {
            throw new Error('Please enter and connect your GitHub token in the "GitHub Token" tab to push live.');
        }

        const jsonStr = JSON.stringify(siteData, null, 2);
        const b64 = btoa(unescape(encodeURIComponent(jsonStr)));

        await uploadFileToGitHub('site-data.json', b64, 'Update website content & styling from Luova Admin Panel');

        showNotification('🚀 <strong>Published successfully to GitHub!</strong> Your live website will automatically update in ~30 seconds.');
        document.getElementById('unsavedChangesIndicator').textContent = '🟢 All changes published to GitHub!';
    } catch (err) {
        showNotification(err.message, 'error');
    } finally {
        [topBtn, mainBtn].forEach(b => {
            if (!b) return;
            b.disabled = false;
            const spin = b.querySelector('.btn-spinner');
            if (spin) spin.style.display = 'none';
        });
    }
}

// Convert HTML File object to raw base64 (without data:... prefix)
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const dataUrl = reader.result;
            const base64 = dataUrl.split(',')[1];
            resolve({ base64, dataUrl });
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

// ==================== POPULATE & GATHER UI ====================
function populateAllFields() {
    if (!siteData) return;

    // 1. BRAND & LOGO
    if (siteData.brand) {
        document.getElementById('logoLettersInput').value = siteData.brand.logoLetters || 'LC';
        document.getElementById('logoLine1Input').value = siteData.brand.logoLine1 || 'LUOVA';
        document.getElementById('logoLine2Input').value = siteData.brand.logoLine2 || 'CREATION';
        updateLogoPreview();
    }

    // 2. THEME & PALETTE
    if (siteData.theme) {
        setPaletteField('Light', siteData.theme.colorLight || '#F9F9F6');
        setPaletteField('Beige', siteData.theme.colorBeige || '#E3DFD5');
        setPaletteField('Dark', siteData.theme.colorDark || '#2F3E46');
        setPaletteField('Gold', siteData.theme.colorGold || '#D4AF37');
        setPaletteField('Text', siteData.theme.colorText || '#3a3a3a');
        setPaletteField('TextMuted', siteData.theme.colorTextMuted || '#7a7a7a');
        document.getElementById('heroOverlayInput').value = siteData.theme.heroOverlay || '';
        document.getElementById('consultationGradientInput').value = siteData.theme.consultationGradient || '';
        updateSwatchBar();
    }

    // 3. CONTACT & SOCIALS
    if (siteData.contact) {
        document.getElementById('contactWhatsappInput').value = siteData.contact.whatsapp || '';
        document.getElementById('contactWhatsappMsgInput').value = siteData.contact.whatsappMessage || '';
        document.getElementById('contactPhoneRawInput').value = siteData.contact.phoneRaw || '';
        document.getElementById('contactPhoneDisplayInput').value = siteData.contact.phone || '';
        document.getElementById('contactInstagramInput').value = siteData.contact.instagram || '';
    }

    // 4. HERO SECTION
    if (siteData.hero) {
        document.getElementById('textHeroBadge').value = siteData.hero.badge || '';
        document.getElementById('textHeroTitle1').value = siteData.hero.titleLine1 || '';
        document.getElementById('textHeroTitleAccent').value = siteData.hero.titleAccent || '';
        document.getElementById('textHeroSubtitle').value = siteData.hero.subtitle || '';
        if (siteData.hero.stats && siteData.hero.stats.length >= 3) {
            document.getElementById('stat1Number').value = siteData.hero.stats[0].number || 20;
            document.getElementById('stat1Label').value = siteData.hero.stats[0].label || '';
            document.getElementById('stat2Number').value = siteData.hero.stats[1].number || 500;
            document.getElementById('stat2Label').value = siteData.hero.stats[1].label || '';
            document.getElementById('stat3Number').value = siteData.hero.stats[2].number || 350;
            document.getElementById('stat3Label').value = siteData.hero.stats[2].label || '';
        }
    }

    // 5. EXPERIENCE
    if (siteData.experience) {
        document.getElementById('textExpTag').value = siteData.experience.tag || '';
        document.getElementById('textExpTitle').value = siteData.experience.titleLine1 || '';
        document.getElementById('textExpAccent').value = siteData.experience.titleAccent || '';
        document.getElementById('textExpDesc').value = siteData.experience.desc || '';
        document.getElementById('textFounderName').value = siteData.experience.founderName || '';
        document.getElementById('textFounderRole').value = siteData.experience.founderRole || '';
        document.getElementById('textFounderInitials').value = siteData.experience.founderInitials || 'IC';
    }

    // 6. CONSULTATION & FOOTER
    if (siteData.consultation) {
        document.getElementById('textConsultationDesc').value = siteData.consultation.desc || '';
    }
    if (siteData.footer) {
        document.getElementById('textFooterDesc').value = siteData.footer.brandDesc || '';
        document.getElementById('textFooterCopyright').value = siteData.footer.copyright || '';
    }

    // 7. SERVICES & GALLERIES
    renderServicesDropdown();
    renderActiveServiceGallery();

    // 8. FAQS
    renderFaqList();
}

function setPaletteField(name, hex) {
    const picker = document.getElementById(`pickerColor${name}`);
    const text = document.getElementById(`textColor${name}`);
    if (picker) picker.value = hex;
    if (text) text.value = hex.toUpperCase();
}

function updateSwatchBar() {
    const cLight = document.getElementById('pickerColorLight').value;
    const cBeige = document.getElementById('pickerColorBeige').value;
    const cDark = document.getElementById('pickerColorDark').value;
    const cGold = document.getElementById('pickerColorGold').value;

    const sLight = document.getElementById('swatchLight');
    const sBeige = document.getElementById('swatchBeige');
    const sDark = document.getElementById('swatchDark');
    const sGold = document.getElementById('swatchGold');

    if (sLight) { sLight.style.background = cLight; sLight.style.color = '#111'; }
    if (sBeige) { sBeige.style.background = cBeige; sBeige.style.color = '#111'; }
    if (sDark) { sDark.style.background = cDark; sDark.style.color = '#fff'; }
    if (sGold) { sGold.style.background = cGold; sGold.style.color = '#111'; }
}

function updateLogoPreview() {
    const letters = document.getElementById('logoLettersInput').value || 'LC';
    const line1 = document.getElementById('logoLine1Input').value || 'LUOVA';
    const line2 = document.getElementById('logoLine2Input').value || 'CREATION';

    document.getElementById('previewLogoLetters').textContent = letters;
    document.getElementById('previewLogoLine1').textContent = line1;
    document.getElementById('previewLogoLine2').textContent = line2;
}

function gatherAllFields() {
    if (!siteData) siteData = getDefaultSiteData();

    // Brand
    siteData.brand.logoLetters = document.getElementById('logoLettersInput').value.trim();
    siteData.brand.logoLine1 = document.getElementById('logoLine1Input').value.trim();
    siteData.brand.logoLine2 = document.getElementById('logoLine2Input').value.trim();

    // Theme
    siteData.theme.colorLight = document.getElementById('textColorLight').value.trim();
    siteData.theme.colorBeige = document.getElementById('textColorBeige').value.trim();
    siteData.theme.colorDark = document.getElementById('textColorDark').value.trim();
    siteData.theme.colorGold = document.getElementById('textColorGold').value.trim();
    siteData.theme.colorText = document.getElementById('textColorText').value.trim();
    siteData.theme.colorTextMuted = document.getElementById('textColorTextMuted').value.trim();
    siteData.theme.heroOverlay = document.getElementById('heroOverlayInput').value.trim();
    siteData.theme.consultationGradient = document.getElementById('consultationGradientInput').value.trim();

    // Contact
    siteData.contact.whatsapp = document.getElementById('contactWhatsappInput').value.trim();
    siteData.contact.whatsappMessage = document.getElementById('contactWhatsappMsgInput').value.trim();
    siteData.contact.phoneRaw = document.getElementById('contactPhoneRawInput').value.trim();
    siteData.contact.phone = document.getElementById('contactPhoneDisplayInput').value.trim();
    siteData.contact.instagram = document.getElementById('contactInstagramInput').value.trim();

    // Hero
    siteData.hero.badge = document.getElementById('textHeroBadge').value.trim();
    siteData.hero.titleLine1 = document.getElementById('textHeroTitle1').value.trim();
    siteData.hero.titleAccent = document.getElementById('textHeroTitleAccent').value.trim();
    siteData.hero.subtitle = document.getElementById('textHeroSubtitle').value.trim();
    siteData.hero.stats = [
        { number: parseInt(document.getElementById('stat1Number').value) || 20, suffix: '+', label: document.getElementById('stat1Label').value.trim() },
        { number: parseInt(document.getElementById('stat2Number').value) || 500, suffix: '+', label: document.getElementById('stat2Label').value.trim() },
        { number: parseInt(document.getElementById('stat3Number').value) || 350, suffix: '+', label: document.getElementById('stat3Label').value.trim() }
    ];

    // Experience
    siteData.experience.tag = document.getElementById('textExpTag').value.trim();
    siteData.experience.titleLine1 = document.getElementById('textExpTitle').value.trim();
    siteData.experience.titleAccent = document.getElementById('textExpAccent').value.trim();
    siteData.experience.desc = document.getElementById('textExpDesc').value.trim();
    siteData.experience.founderName = document.getElementById('textFounderName').value.trim();
    siteData.experience.founderRole = document.getElementById('textFounderRole').value.trim();
    siteData.experience.founderInitials = document.getElementById('textFounderInitials').value.trim();

    // Consultation & Footer
    siteData.consultation.desc = document.getElementById('textConsultationDesc').value.trim();
    siteData.footer.brandDesc = document.getElementById('textFooterDesc').value.trim();
    siteData.footer.copyright = document.getElementById('textFooterCopyright').value.trim();
}

// ==================== SERVICES & GALLERIES ====================
function renderServicesDropdown() {
    const select = document.getElementById('activeServiceSelect');
    select.innerHTML = '';
    if (!siteData.services) siteData.services = [];

    siteData.services.forEach((srv, idx) => {
        const opt = document.createElement('option');
        opt.value = idx;
        opt.textContent = `${srv.name} (${(srv.images || []).length} photos)`;
        select.appendChild(opt);
    });

    if (activeServiceIndex >= siteData.services.length) activeServiceIndex = 0;
    select.value = activeServiceIndex;
}

function renderActiveServiceGallery() {
    if (!siteData.services || !siteData.services[activeServiceIndex]) return;
    const current = siteData.services[activeServiceIndex];

    document.getElementById('currentSectionName').value = current.name || '';
    document.getElementById('currentSectionSubtitle').value = current.subtitle || '';

    // Cover image path handling
    const coverImg = document.getElementById('currentSectionCoverImg');
    coverImg.src = getResolvedImagePath(current.coverImage);

    // Gallery images
    const grid = document.getElementById('galleryAdminGrid');
    grid.innerHTML = '';
    const images = current.images || [];
    document.getElementById('galleryImageCount').textContent = images.length;

    images.forEach((imgSrc, imgIdx) => {
        const card = document.createElement('div');
        card.className = 'gallery-admin-card';
        card.innerHTML = `
            <img src="${getResolvedImagePath(imgSrc)}" alt="Photo ${imgIdx + 1}" loading="lazy">
            <button class="img-delete-btn" title="Remove photo" data-index="${imgIdx}">✕</button>
        `;
        card.querySelector('.img-delete-btn').addEventListener('click', () => {
            current.images.splice(imgIdx, 1);
            markUnsaved();
            renderActiveServiceGallery();
            renderServicesDropdown();
            showNotification(`Removed photo from ${current.name}`);
        });
        grid.appendChild(card);
    });
}

function getResolvedImagePath(path) {
    if (!path) return '';
    if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
        return path;
    }
    // Relative path like "images/..." from admin/ folder needs "../"
    return `../${path}`;
}

// Change Section Cover Image
document.getElementById('changeCoverFileInput').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const current = siteData.services[activeServiceIndex];
    showNotification(`Uploading cover image for ${current.name}...`, 'warning');

    try {
        const { base64, dataUrl } = await fileToBase64(file);
        const filename = `images/${current.id}-cover-${Date.now()}.${file.name.split('.').pop()}`;

        if (ghConfig.connected) {
            await uploadFileToGitHub(filename, base64, `Upload cover image for ${current.name}`);
            current.coverImage = filename;
            showNotification(`Cover photo uploaded & published to GitHub for <strong>${current.name}</strong>!`);
        } else {
            current.coverImage = dataUrl;
            showNotification(`Cover image updated locally. Connect GitHub to publish live!`, 'warning');
        }

        markUnsaved();
        renderActiveServiceGallery();
    } catch (err) {
        showNotification(err.message, 'error');
    }
});

// Add multiple images to gallery
document.getElementById('addGalleryImagesInput').addEventListener('change', async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    const current = siteData.services[activeServiceIndex];
    if (!current.images) current.images = [];

    showNotification(`Uploading ${files.length} images to ${current.name}...`, 'warning');

    let successCount = 0;
    for (const file of files) {
        try {
            const { base64, dataUrl } = await fileToBase64(file);
            const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
            const targetPath = `images/${current.id}-${Date.now()}-${safeName}`;

            if (ghConfig.connected) {
                await uploadFileToGitHub(targetPath, base64, `Add photo to ${current.name} gallery`);
                current.images.push(targetPath);
            } else {
                current.images.push(dataUrl);
            }
            successCount++;
        } catch (err) {
            console.error(err);
        }
    }

    markUnsaved();
    renderActiveServiceGallery();
    renderServicesDropdown();
    showNotification(`Successfully added <strong>${successCount}</strong> photos to <strong>${current.name}</strong>!`);
});

// Save Section Title/Subtitle
document.getElementById('saveSectionMetaBtn').addEventListener('click', () => {
    const current = siteData.services[activeServiceIndex];
    current.name = document.getElementById('currentSectionName').value.trim();
    current.subtitle = document.getElementById('currentSectionSubtitle').value.trim();
    markUnsaved();
    renderServicesDropdown();
    showNotification(`Updated section details for <strong>${current.name}</strong>`);
});

// Delete Current Section
document.getElementById('deleteCurrentSectionBtn').addEventListener('click', () => {
    const current = siteData.services[activeServiceIndex];
    if (siteData.services.length <= 1) {
        alert('You must have at least one section.');
        return;
    }
    if (confirm(`Are you sure you want to permanently delete the "${current.name}" section?`)) {
        siteData.services.splice(activeServiceIndex, 1);
        activeServiceIndex = 0;
        markUnsaved();
        renderServicesDropdown();
        renderActiveServiceGallery();
        showNotification(`Deleted section.`);
    }
});

// Section dropdown change
document.getElementById('activeServiceSelect').addEventListener('change', (e) => {
    activeServiceIndex = parseInt(e.target.value) || 0;
    renderActiveServiceGallery();
});

// ==================== ADD NEW SECTION ====================
document.getElementById('newSectionForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const title = document.getElementById('newSectionTitle').value.trim();
    let slug = document.getElementById('newSectionId').value.trim() || title.toLowerCase().replace(/[^a-z0-9]/g, '');
    const desc = document.getElementById('newSectionDesc').value.trim();
    const coverFile = document.getElementById('newSectionCoverInput').files[0];
    const galleryFiles = Array.from(document.getElementById('newSectionGalleryInput').files || []);

    if (!title || !coverFile) {
        alert('Please fill out the section title and select a cover image.');
        return;
    }

    showNotification(`Creating section "${title}" and uploading images...`, 'warning');

    try {
        // Upload cover
        const { base64: coverB64, dataUrl: coverUrl } = await fileToBase64(coverFile);
        const coverFilename = `images/${slug}-cover-${Date.now()}.${coverFile.name.split('.').pop()}`;
        let finalCover = coverUrl;

        if (ghConfig.connected) {
            await uploadFileToGitHub(coverFilename, coverB64, `Add cover for new section ${title}`);
            finalCover = coverFilename;
        }

        // Upload gallery files
        const galleryPaths = [];
        for (const gf of galleryFiles) {
            const { base64: gB64, dataUrl: gUrl } = await fileToBase64(gf);
            const gFilename = `images/${slug}-${Date.now()}-${gf.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
            if (ghConfig.connected) {
                await uploadFileToGitHub(gFilename, gB64, `Add gallery image to ${title}`);
                galleryPaths.push(gFilename);
            } else {
                galleryPaths.push(gUrl);
            }
        }

        const newSection = {
            id: slug,
            name: title,
            subtitle: desc,
            coverImage: finalCover,
            images: galleryPaths
        };

        siteData.services.push(newSection);
        activeServiceIndex = siteData.services.length - 1;

        markUnsaved();
        renderServicesDropdown();
        renderActiveServiceGallery();

        // Switch to services tab
        document.querySelector('[data-tab="tab-services"]').click();
        document.getElementById('newSectionForm').reset();

        showNotification(`🎉 Section <strong>${title}</strong> created successfully! Remember to click "Publish to Live Site".`);
    } catch (err) {
        showNotification(err.message, 'error');
    }
});

// Auto-generate slug as user types title
document.getElementById('newSectionTitle').addEventListener('input', (e) => {
    const slugInput = document.getElementById('newSectionId');
    if (!slugInput.dataset.manual) {
        slugInput.value = e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '');
    }
});
document.getElementById('newSectionId').addEventListener('input', () => {
    document.getElementById('newSectionId').dataset.manual = 'true';
});

// ==================== FAQS ====================
function renderFaqList() {
    const container = document.getElementById('faqListContainer');
    container.innerHTML = '';
    const faqs = siteData.faqs || [];

    faqs.forEach((faq, idx) => {
        const item = document.createElement('div');
        item.className = 'faq-admin-item';
        item.innerHTML = `
            <div class="faq-item-header">
                <span class="faq-item-num">Question #${idx + 1}</span>
                <button type="button" class="btn btn-danger btn-sm delete-faq-btn" data-index="${idx}">Delete FAQ</button>
            </div>
            <div class="form-group">
                <label>Question</label>
                <input type="text" class="faq-question-input" value="${escapeHtml(faq.question)}">
            </div>
            <div class="form-group" style="margin-bottom:0;">
                <label>Answer</label>
                <textarea rows="3" class="faq-answer-input">${escapeHtml(faq.answer)}</textarea>
            </div>
        `;

        item.querySelector('.faq-question-input').addEventListener('input', (e) => {
            faq.question = e.target.value;
            markUnsaved();
        });
        item.querySelector('.faq-answer-input').addEventListener('input', (e) => {
            faq.answer = e.target.value;
            markUnsaved();
        });
        item.querySelector('.delete-faq-btn').addEventListener('click', () => {
            siteData.faqs.splice(idx, 1);
            markUnsaved();
            renderFaqList();
        });

        container.appendChild(item);
    });
}

document.getElementById('addFaqBtn').addEventListener('click', () => {
    if (!siteData.faqs) siteData.faqs = [];
    siteData.faqs.push({
        question: 'New Question Here?',
        answer: 'Add your detailed answer here.'
    });
    markUnsaved();
    renderFaqList();
});

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// ==================== PALETTE SYNC ====================
['Light', 'Beige', 'Dark', 'Gold', 'Text', 'TextMuted'].forEach(name => {
    const picker = document.getElementById(`pickerColor${name}`);
    const text = document.getElementById(`textColor${name}`);

    if (picker && text) {
        picker.addEventListener('input', () => {
            text.value = picker.value.toUpperCase();
            updateSwatchBar();
            markUnsaved();
        });
        text.addEventListener('input', () => {
            if (/^#[0-9A-F]{6}$/i.test(text.value)) {
                picker.value = text.value;
                updateSwatchBar();
                markUnsaved();
            }
        });
    }
});

document.getElementById('resetPaletteBtn').addEventListener('click', () => {
    setPaletteField('Light', '#F9F9F6');
    setPaletteField('Beige', '#E3DFD5');
    setPaletteField('Dark', '#2F3E46');
    setPaletteField('Gold', '#D4AF37');
    setPaletteField('Text', '#3a3a3a');
    setPaletteField('TextMuted', '#7a7a7a');
    updateSwatchBar();
    markUnsaved();
    showNotification('Palette reset to default Luova Creation brand colors.');
});

// ==================== EVENT LISTENERS ====================
function setupEventListeners() {
    // Logo inputs live preview
    ['logoLettersInput', 'logoLine1Input', 'logoLine2Input'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('input', () => {
            updateLogoPreview();
            markUnsaved();
        });
    });

    // Inputs mark unsaved
    document.querySelectorAll('input, textarea, select').forEach(el => {
        el.addEventListener('change', markUnsaved);
    });

    // GitHub connect button
    document.getElementById('connectGithubBtn').addEventListener('click', () => {
        const token = document.getElementById('githubTokenInput').value.trim();
        if (!token) {
            alert('Please paste your GitHub Personal Access Token first.');
            return;
        }
        connectToGitHub(token, true);
    });

    // Repo selection change
    document.getElementById('ghRepoSelect').addEventListener('change', (e) => {
        ghConfig.repo = e.target.value;
        localStorage.setItem('luova_gh_config', JSON.stringify(ghConfig));
        document.getElementById('statusPillText').textContent = `Connected: ${ghConfig.repo}`;
        pullSiteDataFromGitHub(true);
    });

    // Branch change
    document.getElementById('ghBranchInput').addEventListener('change', (e) => {
        ghConfig.branch = e.target.value.trim() || 'main';
        localStorage.setItem('luova_gh_config', JSON.stringify(ghConfig));
    });

    // Pull from GitHub
    document.getElementById('syncFromGithubBtn').addEventListener('click', () => {
        pullSiteDataFromGitHub(true);
    });

    // Disconnect GitHub
    document.getElementById('disconnectGithubBtn').addEventListener('click', () => {
        if (confirm('Disconnect GitHub account?')) {
            localStorage.removeItem('luova_gh_config');
            ghConfig = { token: '', user: '', repo: '', branch: 'main', connected: false };
            document.getElementById('githubTokenInput').value = '';
            document.getElementById('githubDetailsCard').style.display = 'none';
            document.getElementById('repoStatusPill').classList.remove('connected');
            document.getElementById('statusPillText').textContent = 'GitHub: Not Connected';
            showNotification('GitHub disconnected.');
        }
    });

    // Publish buttons
    document.getElementById('topPublishBtn').addEventListener('click', publishToGitHub);
    document.getElementById('mainPublishBtn').addEventListener('click', publishToGitHub);

    // Save locally
    document.getElementById('saveLocalBtn').addEventListener('click', () => {
        gatherAllFields();
        localStorage.setItem('luova_site_data', JSON.stringify(siteData));
        document.getElementById('unsavedChangesIndicator').textContent = '🟢 All changes saved in local storage';
        showNotification('Saved locally! To push to live site, click "Publish to Live Site".');
    });

    // Download site-data.json
    document.getElementById('downloadBackupBtn').addEventListener('click', () => {
        gatherAllFields();
        const blob = new Blob([JSON.stringify(siteData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'site-data.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });
}

function markUnsaved() {
    const indicator = document.getElementById('unsavedChangesIndicator');
    if (indicator) {
        indicator.textContent = '🟡 Unsaved changes (Click "Publish to Live Site")';
    }
}

// Start
document.addEventListener('DOMContentLoaded', checkAuth);
