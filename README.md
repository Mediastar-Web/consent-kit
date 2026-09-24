# @mediastar/consent

Il banner cookie dei siti Next.js Mediastar (App Router), su [c15t](https://c15t.com): banner e preferenze in italiano, strumenti di statistica e pubblicità caricati solo dopo il consenso, mappe e video che aspettano il consenso, e ogni scelta registrata nel servizio consensi centrale ([consent-service](https://github.com/Mediastar-Web/consent-service), `https://consent.mediastarweb.it`).

Le regole sono quelle del Garante (linee guida cookie 2021 e FAQ):

- opt-in per tutti: prima della scelta, solo cookie tecnici;
- una **X in alto a destra** che chiude il banner senza consenso, e «Rifiuta tutto» accanto ad «Accetta tutto» con lo stesso peso;
- nel banner, i collegamenti a privacy policy e cookie policy;
- scelta valida **185 giorni** (sei mesi di calendario sono da 181 a 184 giorni: 180 chiederebbe un giorno prima);
- il banner torna anche quando il sito aggiunge uno strumento: un nuovo terzo è proprio il caso in cui il Garante permette di chiedere di nuovo;
- la scelta si cambia in ogni momento dal piè di pagina.

I tag Google sono in Consent Mode «base»: prima della scelta a Google non parte nessuna richiesta.

## Strumenti supportati

| Chiave (`trackers`) | Strumento | Categoria |
|---|---|---|
| `ga4` | Google Analytics 4 (`G-…`) | Statistica |
| `clarity` | Microsoft Clarity | Statistica |
| `googleAds` | Google Ads (`AW-…`) | Marketing e profilazione |
| `metaPixel` | Meta Pixel | Marketing e profilazione |
| `tiktokPixel` | TikTok Pixel | Marketing e profilazione |
| `linkedin` | LinkedIn Insight Tag | Marketing e profilazione |

Contenuti esterni (`embeds`): `googleMaps`, `youtube`, `vimeo`, categoria «Contenuti esterni».

Il banner compare solo se c'è almeno uno strumento di statistica o di pubblicità. Mappe e video chiedono il consenso nel loro riquadro, al momento in cui servono (vedi `useExternalContent`): un sito che ha solo una mappa non mostra nessun banner.

Nomi, fornitori, finalità, cookie principali, informative e trasferimenti di ogni strumento stanno in `@mediastar/consent/vendors`: lo stesso catalogo da cui leggono banner e preferenze, da usare anche per scrivere la cookie policy del sito.

## Integrare un sito

### 1. Installa

```bash
pnpm add github:Mediastar-Web/consent-kit#v2.0.0
```

Il repo è pubblico e contiene già il codice compilato: niente token nel build Docker, niente `transpilePackages`.

### 2. CSS

Nel CSS globale del sito (es. `app/globals.css`), **in cima**:

```css
@import "@mediastar/consent/styles.css";
```

Con **Tailwind v4** mettilo dopo `@import "tailwindcss";`. Senza Tailwind, se il sito ha reset sugli elementi fuori da un layer, per esempio:

```css
button, input { font: inherit; color: inherit; }
```

spostali in `@layer base { … }`. Altrimenti battono gli stili del banner (che stanno in `@layer components`) e i pulsanti escono con il font di sistema o senza colori.

### 3. Layout

Nel root layout (`app/layout.tsx`), avvolgi il contenuto del `<body>`:

```tsx
import { ConsentManager } from "@mediastar/consent";
import { consentEnv, initialData } from "@mediastar/consent/server";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const env = consentEnv();
  return (
    <html lang="it">
      <body>
        <ConsentManager {...env} ssrData={initialData(env.backendURL)} cookiePolicyHref="/cookie-policy">
          {children}
        </ConsentManager>
      </body>
    </html>
  );
}
```

`consentEnv()` legge dall'ambiente `CONSENT_BACKEND_URL`, `GA4_MEASUREMENT_ID`, `CLARITY_PROJECT_ID`. Per gli altri strumenti passa `trackers` a mano: `trackers={{ ga4: "G-…", metaPixel: "123…" }}`.

`initialData()` chiede al registro, dal server, le regole di avvio e le tiene in cache un'ora: così il browser non fa una richiesta al registro a ogni pagina, e il registro sente il sito solo quando qualcuno sceglie. Legge le intestazioni della richiesta, quindi il layout diventa dinamico. Senza, tutto funziona lo stesso: il banner chiede le regole dal browser.

### 4. Footer

```tsx
import { PreferenzeCookie } from "@mediastar/consent";

<a href="/privacy">Privacy policy</a>
<PreferenzeCookie className="footer-link" />
```

È un `<button>` che riapre le preferenze: dagli la classe dei link del footer. Fuori da un `<ConsentManager>` non disegna niente, quindi può stare nel footer sempre.

### 5. Coolify e registro

- Nel sito imposta le variabili:
  ```
  CONSENT_BACKEND_URL=https://consent.mediastarweb.it/api/c15t
  GA4_MEASUREMENT_ID=G-…
  CLARITY_PROJECT_ID=…
  ```
- In `https://consent.mediastarweb.it/admin` aggiungi il dominio del sito (vale anche per `www.`). Senza, il servizio lo respinge e la scelta resta solo nel browser.

**Quando vengono lette le variabili.** Se il root layout è dinamico (usa `connection()`, `cookies()`, `headers()`, o `initialData()`) vengono lette a ogni richiesta: si cambiano su Coolify con un riavvio. Se è statico vengono lette al `next build`: su Coolify spunta anche "Build Variable" e fai il redeploy per cambiarle. Non sono segreti.

### 6. Cookie policy e privacy

La pagina `/cookie-policy` e la sezione cookie della privacy policy devono descrivere gli strumenti effettivamente attivi e il cookie tecnico che ricorda la scelta (185 giorni). I dati di ogni strumento sono in `@mediastar/consent/vendors`.

## Mappe e video

Un riquadro al posto della cornice, che la carica solo quando chi visita la chiede:

```tsx
"use client";
import { useExternalContent } from "@mediastar/consent";

function Mappa({ src }: { src: string }) {
  const esterni = useExternalContent(); // null fuori da un <ConsentManager embeds=…>
  if (esterni?.allowed) return <iframe src={src} title="Mappa" />;
  return <button onClick={() => esterni?.allow()}>Mostra la mappa</button>;
}
```

`allow()` registra la scelta «Contenuti esterni» per tutto il sito, come ogni altra scelta. Dichiara i servizi usati con `embeds={["googleMaps", "youtube"]}` sul `ConsentManager`: banner e preferenze li nominano. Attenzione all'idratazione: il server non conosce la scelta, quindi il primo disegno nel browser deve essere il riquadro, e la cornice arriva dopo (vedi `ContenutoEsterno` in sitofacile).

## Registro raggiunto dal dominio del sito

Chi serve molti siti, magari su domini che cambiano (sitofacile), può far passare le chiamate del banner dal proprio server invece di autorizzare ogni dominio nel registro: `backendURL="/api/c15t"` nel `ConsentManager`, e una rotta che inoltra `GET /init` e `POST /subjects` a `https://consent.mediastarweb.it/api/c15t`. Il registro sta dietro Cloudflare e vedrebbe l'indirizzo del server: la rotta gli passa quello del visitatore in `X-Consent-Client-IP`, con il segreto condiviso in `X-Consent-Proxy-Secret` (`PROXY_SECRET` sul consent-service). `initialData()` va chiamata comunque con l'indirizzo diretto del registro.

## Opzioni

| Prop | Default | |
|---|---|---|
| `backendURL` | da `consentEnv()` | Il registro. Vuoto: la scelta resta nel browser. |
| `ssrData` | nessuno | Le regole di avvio dal server: `initialData(backendURL)`. |
| `trackers` | da `consentEnv()` | Gli strumenti accesi, per ID. |
| `embeds` | `[]` | I servizi da cui le pagine prendono mappe e video. |
| `scripts` | `[]` | Altri script da bloccare fino al consenso, da `@c15t/scripts`, con la loro categoria. |
| `colors` | chiari con l'arancio Mediastar | Token colore di c15t: `primary`, `textOnPrimary`, `surface`, `text`, `textMuted`, `border`… |
| `radius` | quelli di c15t | `lg` per banner e preferenze, `md` per i pulsanti. |
| `colorScheme` | `"light"` | `"light"`, `"dark"`, `"system"`. |
| `fontFamily` | `"inherit"` | Il font del sito. Banner e preferenze stanno sotto `<body>`: un font dichiarato su un elemento interno non ci arriva, passa la famiglia vera. |
| `privacyPolicyHref` | `"/privacy"` | |
| `cookiePolicyHref` | nessuno | Se c'è, banner e preferenze hanno anche il link alla cookie policy. |
| `storageKey` | `"c15t"` | Nome del cookie che tiene la scelta. Uno per sito quando più siti condividono un dominio. Gli strumenti attivi vi si aggiungono in coda. |
| `messages` | testi italiani | Sovrascrive i testi (stessa forma di `DEFAULT_MESSAGES`). |

I testi di banner e preferenze nominano da soli gli strumenti attivi.

## Eventi GA4

```tsx
import { gtagEvent } from "@mediastar/consent";

gtagEvent("lead_contatti", { percorso: "privati" });
```

Finché il visitatore non accetta, GA4 non è caricato e la chiamata non fa niente: nessun controllo del consenso da ripetere nei componenti.

## Da 1.0 a 2.0

- `ga4Id`, `clarityId` e `categories` non ci sono più: gli strumenti passano da `trackers`, e le categorie si ricavano da lì. Chi usa `{...consentEnv()}` non deve cambiare niente.
- Il banner ha la X e i collegamenti a privacy e cookie policy (in 1.0 mancavano: c15t 2.2 non li mostra se non gli si dice quali).
- La scelta vale 185 giorni invece di 180, e il cookie ha cambiato nome (`c15t-…` con gli strumenti in coda): chi aveva già scelto se lo vede chiedere una volta.

## Sviluppo del pacchetto

```bash
pnpm install
pnpm build        # compila src/ in dist/: dist/ è committato, è ciò che i siti installano
```

Per una nuova versione: modifica, `pnpm build`, commit (con `dist/`), aggiorna `version` in `package.json`, tag `vX.Y.Z`, push del tag. Nei siti: `pnpm add github:Mediastar-Web/consent-kit#vX.Y.Z`.
