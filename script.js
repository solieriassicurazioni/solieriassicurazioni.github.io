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
    // Usa l'API ufficiale wa.me che gestisce in automatico il redirect cross-platform
    const waLink = `https://wa.me/${CONTACT_CONFIG.WHATSAPP_NUMBER}?text=${encodeURIComponent(CONTACT_CONFIG.WHATSAPP_TEXT)}`;

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

// 5. Logic Handler: Mobile Menu Toggle
document.addEventListener('DOMContentLoaded', () => {
    const menuToggle = document.querySelector('.menu-toggle');
    const mainNav = document.getElementById('main-nav');

    if (menuToggle && mainNav) {
        menuToggle.addEventListener('click', () => {
            const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
            menuToggle.setAttribute('aria-expanded', !isExpanded);
            mainNav.classList.toggle('active');
        });

        // Close menu when a link is clicked
        const navLinks = mainNav.querySelectorAll('a');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                menuToggle.setAttribute('aria-expanded', 'false');
                mainNav.classList.remove('active');
            });
        });
    }
});

// 5b. Dropdown "I Nostri Prodotti": mouse (hover), tocco, tastiera
document.addEventListener('DOMContentLoaded', () => {
    const dropdown = document.querySelector('.dropdown');
    const btn = dropdown && dropdown.querySelector('.dropdown-btn');
    const menu = dropdown && dropdown.querySelector('.dropdown-content');
    if (!dropdown || !btn || !menu) return;

    const items = Array.from(menu.querySelectorAll('a'));

    const setOpen = (open) => {
        dropdown.classList.toggle('open', open);
        btn.setAttribute('aria-expanded', String(open));
    };

    // Il hover del mouse apre il menu; il primo clic successivo lo lascia aperto,
    // i clic seguenti (e tocco/tastiera) alternano apertura e chiusura
    let openedByHover = false;

    btn.addEventListener('click', () => {
        if (openedByHover) {
            openedByHover = false;
            return;
        }
        setOpen(!dropdown.classList.contains('open'));
    });

    dropdown.addEventListener('pointerenter', (e) => {
        if (e.pointerType !== 'mouse') return;
        openedByHover = !dropdown.classList.contains('open');
        setOpen(true);
    });
    dropdown.addEventListener('pointerleave', (e) => {
        if (e.pointerType !== 'mouse') return;
        openedByHover = false;
        setOpen(false);
    });

    // Tastiera: frecce per spostarsi, Esc per chiudere e tornare al pulsante
    btn.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setOpen(true);
            items[0].focus();
        }
    });
    menu.addEventListener('keydown', (e) => {
        const i = items.indexOf(document.activeElement);
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            items[(i + 1) % items.length].focus();
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (i <= 0) btn.focus(); else items[i - 1].focus();
        } else if (e.key === 'Home') {
            e.preventDefault();
            items[0].focus();
        } else if (e.key === 'End') {
            e.preventDefault();
            items[items.length - 1].focus();
        }
    });
    dropdown.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && dropdown.classList.contains('open')) {
            setOpen(false);
            btn.focus();
        }
    });

    // Si chiude con un clic/tocco fuori, con la scelta di una voce o uscendo col Tab
    document.addEventListener('click', (e) => {
        if (!dropdown.contains(e.target)) setOpen(false);
    });
    items.forEach(a => a.addEventListener('click', () => setOpen(false)));
    dropdown.addEventListener('focusout', (e) => {
        if (e.relatedTarget && !dropdown.contains(e.relatedTarget)) setOpen(false);
    });
});

// 6. Cookie Banner Logic
document.addEventListener('DOMContentLoaded', () => {
    const cookieBanner = document.getElementById('cookie-banner');
    const btnAcceptAll = document.getElementById('cookie-accept-all');
    const btnRejectOptional = document.getElementById('cookie-reject-optional');
    const btnOpenSettings = document.getElementById('open-cookie-settings');
    const mapFrame = document.getElementById('map-frame');
    const mapPlaceholder = document.getElementById('map-placeholder');
    const btnMapLoad = document.getElementById('map-load');

    const CONSENT_KEY = 'solieri_cookie_consent';
    const CONSENT_MAX_AGE_MS = 365 * 24 * 60 * 60 * 1000; // 12 mesi, come indicato nella Cookie Policy

    // Legge il consenso salvato; restituisce null se assente, scaduto o illeggibile
    const readConsent = () => {
        try {
            const saved = JSON.parse(localStorage.getItem(CONSENT_KEY));
            if (!saved || Date.now() - new Date(saved.timestamp).getTime() > CONSENT_MAX_AGE_MS) return null;
            return saved;
        } catch (e) {
            return null;
        }
    };

    const showBanner = () => {
        if (cookieBanner) cookieBanner.style.display = 'block';
    };

    // Contenuti di terze parti (Google Maps): caricati solo dopo consenso o clic esplicito
    const loadMap = () => {
        if (!mapFrame || mapFrame.getAttribute('src')) return;
        mapFrame.setAttribute('src', mapFrame.dataset.src);
        mapFrame.hidden = false;
        if (mapPlaceholder) mapPlaceholder.hidden = true;
    };

    const unloadMap = () => {
        if (!mapFrame) return;
        mapFrame.removeAttribute('src');
        mapFrame.hidden = true;
        if (mapPlaceholder) mapPlaceholder.hidden = false;
    };

    const saved = readConsent();
    if (saved) {
        if (saved.agreedToAll) loadMap();
    } else {
        localStorage.removeItem(CONSENT_KEY);
        setTimeout(showBanner, 800);
    }

    const saveConsent = (type) => {
        try {
            localStorage.setItem(CONSENT_KEY, JSON.stringify({
                agreedToAll: type === 'all',
                timestamp: new Date().toISOString()
            }));
        } catch (e) { /* storage non disponibile: la scelta vale solo per questa pagina */ }
        if (cookieBanner) cookieBanner.style.display = 'none';
        if (type === 'all') loadMap(); else unloadMap();
    };

    if (btnAcceptAll) btnAcceptAll.addEventListener('click', () => saveConsent('all'));
    if (btnRejectOptional) btnRejectOptional.addEventListener('click', () => saveConsent('necessary'));
    if (btnMapLoad) btnMapLoad.addEventListener('click', loadMap);

    const openCookieSettings = () => {
        localStorage.removeItem(CONSENT_KEY);
        showBanner();
    };

    if (btnOpenSettings) {
        btnOpenSettings.addEventListener('click', (e) => {
            e.preventDefault();
            openCookieSettings();
        });
    }

    // Raggiungibile dalla Cookie Policy tramite index.html#cookie-settings
    if (window.location.hash === '#cookie-settings') openCookieSettings();

    // Expose openCookieSettings globally
    window.openCookieSettings = openCookieSettings;
});

// 7. Recensioni Google: lette da assets/reviews.json (aggiornato con tools/update-reviews.mjs)
document.addEventListener('DOMContentLoaded', async () => {
    const section = document.getElementById('reviews-section');
    const track = document.getElementById('reviews-track');
    const dotsNav = document.getElementById('reviews-dots');
    if (!section || !track || !dotsNav) return;

    let data;
    try {
        const res = await fetch('assets/reviews.json', { cache: 'no-cache' });
        if (!res.ok) return;
        data = await res.json();
    } catch (e) {
        return; // nessun dato: la sezione resta nascosta
    }

    // Collegamenti a Google: solo URL https verso domini Google
    const isGoogleUrl = (u) => {
        try {
            const h = new URL(u).hostname;
            return new URL(u).protocol === 'https:' && /(^|\.)google\.[a-z.]+$/.test(h);
        } catch (e) { return false; }
    };

    if (data.placeId) {
        const write = document.getElementById('review-write');
        if (write) write.href = 'https://search.google.com/local/writereview?placeid=' + encodeURIComponent(data.placeId);
    }
    if (isGoogleUrl(data.mapsUri)) {
        const all = document.getElementById('reviews-all');
        if (all) all.href = data.mapsUri;
    }

    const reviews = (Array.isArray(data.reviews) ? data.reviews : [])
        .filter(r => r && r.text && Number(r.rating) >= 1)
        .slice(0, 8);
    if (!reviews.length) return;

    // Riepilogo valutazione
    const summary = document.getElementById('reviews-summary');
    if (summary && data.rating && data.userRatingCount) {
        const rating = Number(data.rating).toLocaleString('it-IT', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
        summary.textContent = `${rating} su 5 · ${data.userRatingCount} recensioni su Google`;

        // Stessa valutazione, in evidenza nella hero
        const heroRating = document.getElementById('hero-rating');
        const heroText = document.getElementById('hero-rating-text');
        if (heroRating && heroText) {
            heroText.textContent = `${rating} · ${data.userRatingCount} recensioni su Google`;
            heroRating.hidden = false;
        }
    }

    const el = (tag, cls, text) => {
        const n = document.createElement(tag);
        if (cls) n.className = cls;
        if (text !== undefined) n.textContent = text;
        return n;
    };

    reviews.forEach((r, i) => {
        const li = el('li', 'carousel-slide' + (i === 0 ? ' current-slide' : ''));
        li.setAttribute('aria-label', `Recensione ${i + 1} di ${reviews.length}`);
        const card = el('div', 'review-card glass-panel');
        const stars = el('div', 'review-stars', '★'.repeat(Math.round(r.rating)));
        stars.setAttribute('role', 'img');
        stars.setAttribute('aria-label', `${Math.round(r.rating)} stelle su 5`);
        card.append(stars, el('p', 'review-text', `“${r.text.trim()}”`));

        const author = el('div', 'review-author');
        const name = r.author || 'Cliente Google';
        if (isGoogleUrl(r.authorUrl)) {
            const a = el('a', 'review-author-link', name);
            a.href = r.authorUrl;
            a.target = '_blank';
            a.rel = 'noopener noreferrer';
            author.append(a);
        } else {
            author.append(name);
        }
        if (r.when) author.append(el('span', 'review-when', ' · ' + r.when));
        card.append(author);
        li.append(card);
        track.append(li);

        const dot = el('button', 'carousel-indicator' + (i === 0 ? ' current-indicator' : ''));
        dot.type = 'button';
        dot.setAttribute('aria-label', `Vai alla recensione ${i + 1}`);
        dotsNav.append(dot);
    });

    section.hidden = false;

    // --- Carosello ---
    const slides = Array.from(track.children);
    const dots = Array.from(dotsNav.children);
    const nextButton = document.querySelector('.carousel-btn.next');
    const prevButton = document.querySelector('.carousel-btn.prev');
    const carousel = document.querySelector('.reviews-carousel');
    let index = 0;

    const goTo = (target) => {
        index = (target + slides.length) % slides.length;
        track.style.transform = `translateX(-${index * 100}%)`; // in %: nessun ricalcolo al resize
        slides.forEach((s, i) => {
            s.classList.toggle('current-slide', i === index);
            s.setAttribute('aria-hidden', String(i !== index));
        });
        dots.forEach((d, i) => d.classList.toggle('current-indicator', i === index));
    };
    goTo(0);

    // Autoplay: non parte con "riduci movimento", si ferma con tab nascosta, hover o focus
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let timer = null;
    const stop = () => { clearInterval(timer); timer = null; };
    const start = () => {
        if (reduceMotion || slides.length < 2) return;
        stop();
        timer = setInterval(() => goTo(index + 1), 6000);
    };
    const restart = () => { stop(); start(); };

    if (nextButton) nextButton.addEventListener('click', () => { goTo(index + 1); restart(); });
    if (prevButton) prevButton.addEventListener('click', () => { goTo(index - 1); restart(); });
    dots.forEach((d, i) => d.addEventListener('click', () => { goTo(i); restart(); }));

    if (slides.length < 2) {
        [nextButton, prevButton].forEach(b => b && (b.hidden = true));
        dotsNav.hidden = true;
    }

    carousel.addEventListener('mouseenter', stop);
    carousel.addEventListener('mouseleave', start);
    carousel.addEventListener('focusin', stop);
    carousel.addEventListener('focusout', start);
    document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()));

    // Swipe su touch
    let startX = null;
    carousel.addEventListener('touchstart', (e) => { startX = e.touches[0].clientX; stop(); }, { passive: true });
    carousel.addEventListener('touchend', (e) => {
        if (startX !== null) {
            const dx = e.changedTouches[0].clientX - startX;
            if (Math.abs(dx) > 40) goTo(index + (dx < 0 ? 1 : -1));
        }
        startX = null;
        start();
    });

    start();

    // --- Recensione flottante: una alla volta, dopo la scelta sui cookie, chiudibile ---
    const TOAST_KEY = 'solieri_review_toast_closed';
    const readClosed = () => { try { return sessionStorage.getItem(TOAST_KEY) === '1'; } catch (e) { return false; } };
    if (readClosed()) return;

    const banner = document.getElementById('cookie-banner');
    const toast = el('aside', 'review-toast');
    toast.setAttribute('role', 'status');
    toast.setAttribute('aria-live', 'polite');
    const close = el('button', 'review-toast-close', '×');
    close.type = 'button';
    close.setAttribute('aria-label', 'Chiudi recensione');
    const tStars = el('div', 'review-stars');
    const tText = el('p', 'review-toast-text');
    const tAuthor = el('div', 'review-toast-author');
    const tLink = el('a', 'review-toast-link', 'Leggi tutte le recensioni');
    tLink.href = '#reviews-section';
    toast.append(close, tStars, tText, tAuthor, tLink);
    document.body.append(toast);

    let toastIdx = 0;
    let toastShown = 0;
    let toastTimer = null;
    let closed = false;
    const SHOW_MS = 8000;
    const GAP_MS = 4000;
    const MAX_SHOWN = Math.min(reviews.length, 5);

    const shortText = (t) => {
        const s = t.trim().replace(/\s+/g, ' ');
        return s.length > 150 ? s.slice(0, 147).replace(/\s+\S*$/, '') + '…' : s;
    };
    const bannerVisible = () => banner && getComputedStyle(banner).display !== 'none';

    const hideToast = () => toast.classList.remove('is-shown');

    const showNext = () => {
        if (closed || toastShown >= MAX_SHOWN) return;
        if (document.hidden || bannerVisible()) { // aspetta che l'utente risponda al banner cookie
            toastTimer = setTimeout(showNext, 1500);
            return;
        }
        const r = reviews[toastIdx % reviews.length];
        toastIdx++;
        toastShown++;
        tStars.textContent = '★'.repeat(Math.round(r.rating));
        tStars.setAttribute('aria-label', `${Math.round(r.rating)} stelle su 5`);
        tText.textContent = `“${shortText(r.text)}”`;
        tAuthor.textContent = `${r.author || 'Cliente Google'} · Google`;
        toast.classList.add('is-shown');
        toastTimer = setTimeout(() => {
            hideToast();
            toastTimer = setTimeout(showNext, GAP_MS);
        }, SHOW_MS);
    };

    close.addEventListener('click', () => {
        closed = true;
        clearTimeout(toastTimer);
        hideToast();
        try { sessionStorage.setItem(TOAST_KEY, '1'); } catch (e) { /* ignora */ }
    });
    tLink.addEventListener('click', hideToast);

    toastTimer = setTimeout(showNext, 6000);
});
