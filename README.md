# 🛡️ Solieri Assicurazioni — Agenzia Assicurativa

Sito web vetrina statico per l'agenzia **Solieri Assicurazioni**. Struttura ottimizzata per la SEO locale e progettata per massimizzare la velocità, l'affidabilità e la conversione dei contatti.

> "Consulenza assicurativa per auto, casa e aziende a Verona."

## 🚀 Sito Live

[https://solieriassicurazioni.github.io](https://solieriassicurazioni.github.io)

## 📁 Struttura

```text
Landing Solieri/
├── index.html              # Pagina principale (SEO, meta tag, dati strutturati JSON-LD)
├── style.css               # Stili e variabili CSS (nessun framework, nessuno stile inline)
├── script.js               # Menu, consenso cookie, mappa su consenso, recensioni Google
├── cookie-policy.html      # Cookie Policy
├── privacy-policy.html     # Privacy Policy
├── robots.txt, sitemap.xml, favicon.ico
├── assets/
│   ├── fonts/              # Public Sans ospitato in locale (nessuna richiesta a Google)
│   ├── reviews.json        # Recensioni Google mostrate nel sito (aggiornato dallo script sotto)
│   └── *.webp, *.png, *.jpg  # Immagini ottimizzate, icone, immagine Open Graph
├── tools/update-reviews.mjs            # Scarica le recensioni da Google (Places API)
└── .github/workflows/update-reviews.yml # Aggiornamento settimanale (da aggiungere a mano)
```

## ⭐ Recensioni Google

Il sito mostra le recensioni lette da `assets/reviews.json`; finché il file è vuoto la sezione resta nascosta.
Per popolarlo:

1. In Google Cloud crea una chiave API con **Places API (New)** abilitata (fatturazione attiva) e, se la usi solo
   per questo, limitala a quell'API.
2. In locale: `GOOGLE_MAPS_API_KEY=la_tua_chiave node tools/update-reviews.mjs`
   (trova l'agenzia da sola e salva anche il `placeId`, che attiva il pulsante "Scrivi una recensione" diretto).
3. Per l'aggiornamento automatico: nel repository GitHub aggiungi il secret `GOOGLE_MAPS_API_KEY`; il workflow
   `update-reviews.yml` gira ogni lunedì.

Google restituisce al massimo 5 recensioni e i termini della Places API permettono di tenerle in copia per **30
giorni al massimo**: tieni attivo l'aggiornamento periodico.

## ✨ Funzionalità e Ottimizzazioni

- **SEO Locale Avanzata:** Meta tag ottimizzati per indicizzazione su Verona, struttura semantica e Title/H1 mirati.
- **Servizi in Evidenza:** Griglia responsive con icone per le polizze Auto, Casa, Famiglia, Aziendali e RC Professionale.
- **Recensioni Google:** Carosello con le recensioni reali e invito a recensire (senza incentivi, come richiesto dalle linee guida di Google).
- **Contatti Rapidi (WhatsApp):** Call-to-action dirette per l'apertura immediata della chat WhatsApp aziendale, ottimizzando la user experience da mobile.
- **Ultra-Leggero e Veloce:** Sviluppato interamente in HTML, CSS e JS Vanilla. Nessun framework pesante, pronto e ottimizzato nativamente per GitHub Pages.
- **Design Responsivo:** Interfaccia fluida e pulita, perfettamente adattabile a ogni tipo di dispositivo (Desktop, Tablet, Mobile).
- **Mappa Integrata:** Google Maps embed per una facile geolocalizzazione dell'agenzia.
- **Conformità Legale:** Pagine Cookie Policy, Privacy Policy e banner di gestione del consenso implementati.
