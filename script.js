// --- SCRIPT PER ANIMAZIONI E CONTATTI ---

// 1. Configurazioni di Contatto
const CONTACT_CONFIG = {
    EMAIL: "solieriassicurazioni@gmail.com",
    EMAIL_SUBJECT: "Richiesta Preventivo Online",
    EMAIL_BODY: "Salve, vorrei ricevere maggiori informazioni sulle vostre polizze.",

    // Il numero deve includere il prefisso internazionale, senza + o spazi
    WHATSAPP_NUMBER: "390458568483",
    WHATSAPP_TEXT: "Salve! Vi contatto dal vostro sito web. Vorrei alcune informazioni."
};

// 2. Logic Handler: Apri Mail
document.getElementById('btn-email').addEventListener('click', () => {
    const mailtoLink = `mailto:${CONTACT_CONFIG.EMAIL}?subject=${encodeURIComponent(CONTACT_CONFIG.EMAIL_SUBJECT)}&body=${encodeURIComponent(CONTACT_CONFIG.EMAIL_BODY)}`;
    window.location.href = mailtoLink;
});

// 3. Logic Handler: Apri WhatsApp
document.getElementById('btn-wa').addEventListener('click', () => {
    // Rileva se su mobile (per aprire l'app WA) o desktop (per aprire WA Web)
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const baseUrl = isMobile ? "whatsapp://send" : "https://web.whatsapp.com/send";
    const waLink = `${baseUrl}?phone=${CONTACT_CONFIG.WHATSAPP_NUMBER}&text=${encodeURIComponent(CONTACT_CONFIG.WHATSAPP_TEXT)}`;

    // Usa window.open(..., '_blank') per non abbandonare la landing page
    window.open(waLink, '_blank', 'noopener,noreferrer');
});

// 4. Animazioni "On Scroll" (Intersection Observer)
// Permette di attivare classi CSS quando l'utente scorre fino all'elemento
const setupScrollAnimations = () => {
    const observerOptions = {
        threshold: 0.1, // Attiva quando il 10% dell'elemento è visibile
        rootMargin: "0px 0px -50px 0px"
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Cerca gli elementi animabili all'interno del blocco osservato
                const targets = entry.target.querySelectorAll('.fade-up, .fade-in');

                targets.forEach(target => {
                    target.classList.add('is-visible');
                });

                // Non osservare più per evitare ricalcoli
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Seleziona tutte le sezioni che hanno animazioni interne
    document.querySelectorAll('.observer-section').forEach(section => {
        observer.observe(section);
    });
};

// Inizializza tutto al DOM Ready
document.addEventListener('DOMContentLoaded', () => {
    setupScrollAnimations();
});

// 5. Logic Handler: Nav Dropdown
document.addEventListener('click', (e) => {
    const isDropdownButton = e.target.matches('.dropdown-toggle') || e.target.closest('.dropdown-toggle');

    if (!isDropdownButton && e.target.closest('.dropdown') != null) return;

    let currentDropdown;
    if (isDropdownButton) {
        currentDropdown = e.target.closest('.dropdown');
        currentDropdown.querySelector('.dropdown-menu').classList.toggle('show');
        const toggleBtn = currentDropdown.querySelector('.dropdown-toggle');
        const expanded = toggleBtn.getAttribute('aria-expanded') === 'true';
        toggleBtn.setAttribute('aria-expanded', !expanded);
    }

    document.querySelectorAll('.dropdown-menu.show').forEach(dropdown => {
        if (currentDropdown && dropdown === currentDropdown.querySelector('.dropdown-menu')) return;
        dropdown.classList.remove('show');
        dropdown.closest('.dropdown').querySelector('.dropdown-toggle').setAttribute('aria-expanded', false);
    });
});

// 6. Cookie Banner Logic
document.addEventListener('DOMContentLoaded', () => {
    const cookieBanner = document.getElementById('cookie-banner');
    const btnAcceptAll = document.getElementById('cookie-accept-all');
    const btnRejectOptional = document.getElementById('cookie-reject-optional');
    const btnOpenSettings = document.getElementById('open-cookie-settings');

    if (!localStorage.getItem('solieri_cookie_consent')) {
        setTimeout(() => {
            if (cookieBanner) cookieBanner.style.display = 'block';
        }, 800);
    }

    const saveConsent = (type) => {
        localStorage.setItem('solieri_cookie_consent', JSON.stringify({
            agreedToAll: type === 'all',
            timestamp: new Date().toISOString()
        }));
        if (cookieBanner) cookieBanner.style.display = 'none';
    };

    if (btnAcceptAll) btnAcceptAll.addEventListener('click', () => saveConsent('all'));
    if (btnRejectOptional) btnRejectOptional.addEventListener('click', () => saveConsent('necessary'));

    if (btnOpenSettings) {
        btnOpenSettings.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('solieri_cookie_consent');
            if (cookieBanner) cookieBanner.style.display = 'block';
        });
    }

    // Expose openCookieSettings globally
    window.openCookieSettings = function () {
        localStorage.removeItem('solieri_cookie_consent');
        if (cookieBanner) cookieBanner.style.display = 'block';
    }
});
