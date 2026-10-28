// Aggiorna assets/reviews.json con le recensioni Google dell'agenzia (Places API "New").
//
// Uso:   GOOGLE_MAPS_API_KEY=... node tools/update-reviews.mjs
// Opzioni (variabili d'ambiente):
//   PLACE_ID      ID del luogo; se assente viene cercato e poi salvato in reviews.json
//   PLACE_QUERY   testo di ricerca (default: nome e indirizzo dell'agenzia)
//
// Note:
// - Google restituisce al massimo 5 recensioni ("più pertinenti") e i termini della Places API
//   consentono di conservarle in cache per 30 giorni al massimo: va eseguito almeno ogni mese
//   (vedi .github/workflows/update-reviews.yml).
// - La chiave va creata in Google Cloud con "Places API (New)" abilitata e fatturazione attiva.
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const OUT = fileURLToPath(new URL('../assets/reviews.json', import.meta.url));
const KEY = process.env.GOOGLE_MAPS_API_KEY;
const QUERY = process.env.PLACE_QUERY || 'Solieri Assicurazioni Via Belfiore 66 Cadidavid Verona';

if (!KEY) {
    console.error('Manca GOOGLE_MAPS_API_KEY.');
    process.exit(1);
}

const call = async (url, { fieldMask, body } = {}) => {
    const res = await fetch(url, {
        method: body ? 'POST' : 'GET',
        headers: {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': KEY,
            'X-Goog-FieldMask': fieldMask
        },
        body: body ? JSON.stringify(body) : undefined
    });
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}: ${await res.text()}`);
    return res.json();
};

let previous = {};
try { previous = JSON.parse(await readFile(OUT, 'utf8')); } catch { /* primo avvio */ }

let placeId = process.env.PLACE_ID || previous.placeId;
if (!placeId) {
    const found = await call('https://places.googleapis.com/v1/places:searchText', {
        fieldMask: 'places.id,places.displayName,places.formattedAddress',
        body: { textQuery: QUERY, languageCode: 'it', regionCode: 'IT' }
    });
    const first = found.places?.[0];
    if (!first) throw new Error('Nessun luogo trovato per: ' + QUERY);
    placeId = first.id;
    console.log(`Luogo trovato: ${first.displayName?.text} - ${first.formattedAddress} (${placeId})`);
}

const place = await call(`https://places.googleapis.com/v1/places/${placeId}?languageCode=it`, {
    fieldMask: 'id,displayName,rating,userRatingCount,googleMapsUri,reviews'
});

const reviews = (place.reviews || []).map(r => ({
    author: r.authorAttribution?.displayName || '',
    authorUrl: r.authorAttribution?.uri || '',
    rating: r.rating,
    text: (r.originalText?.text || r.text?.text || '').trim(),
    when: r.relativePublishTimeDescription || '',
    publishTime: r.publishTime || ''
})).filter(r => r.text);

const out = {
    updated: new Date().toISOString(),
    placeId,
    rating: place.rating ?? null,
    userRatingCount: place.userRatingCount ?? null,
    mapsUri: place.googleMapsUri || '',
    reviews
};
await writeFile(OUT, JSON.stringify(out, null, 2) + '\n');
console.log(`Salvate ${reviews.length} recensioni (valutazione ${out.rating}, ${out.userRatingCount} totali) in assets/reviews.json`);
