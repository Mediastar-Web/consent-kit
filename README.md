# @mediastar/consent

Il banner cookie dei siti Next.js Mediastar (App Router), su [c15t](https://c15t.com): banner e preferenze in italiano, **Google Analytics 4** e **Microsoft Clarity** caricati solo dopo il consenso, e ogni scelta registrata nel servizio consensi centrale ([consent-service](https://github.com/Mediastar-Web/consent-service), `https://consent.mediastarweb.it`).

Le regole sono quelle del Garante (linee guida cookie 2021): opt-in per tutti, "Rifiuta tutto" accanto ad "Accetta tutto" con lo stesso peso, scelta valida 180 giorni, modificabile in ogni momento dal footer. GA4 è in Consent Mode "base": prima della scelta a Google non parte nessuna richiesta.

## Integrare un sito (circa 15 minuti)

### 1. Installa

```bash
pnpm add github:Mediastar-Web/consent-kit#v1.0.0
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
import { consentEnv } from "@mediastar/consent/server";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it">
      <body>
        <ConsentManager {...consentEnv()} cookiePolicyHref="/cookie-policy">
          {children}
        </ConsentManager>
      </body>
    </html>
  );
}
```

`consentEnv()` legge dall'ambiente `CONSENT_BACKEND_URL`, `GA4_MEASUREMENT_ID`, `CLARITY_PROJECT_ID`.

### 4. Footer

```tsx
import { PreferenzeCookie } from "@mediastar/consent";

<a href="/privacy">Privacy policy</a>
<PreferenzeCookie className="footer-link" />
```

È un `<button>` che riapre le preferenze: dagli la classe dei link del footer.

### 5. Coolify e registro

- Nel sito imposta le variabili:
  ```
  CONSENT_BACKEND_URL=https://consent.mediastarweb.it/api/c15t
  GA4_MEASUREMENT_ID=G-…
  CLARITY_PROJECT_ID=…
  ```
- In `https://consent.mediastarweb.it/admin` aggiungi il dominio del sito (vale anche per `www.`). Senza, il servizio lo respinge e la scelta resta solo nel browser.

**Quando vengono lette le variabili.** Se il root layout è dinamico (usa `connection()`, `cookies()`, `headers()`…) vengono lette a ogni richiesta: si cambiano su Coolify con un riavvio. Se è statico vengono lette al `next build`: su Coolify spunta anche "Build Variable" e fai il redeploy per cambiarle. Non sono segreti.

### 6. Cookie policy e privacy

La pagina `/cookie-policy` e la sezione cookie della privacy policy devono descrivere gli strumenti effettivamente attivi (GA4, Clarity, il cookie tecnico `c15t` che ricorda la scelta, 180 giorni).

## Opzioni

| Prop | Default | |
|---|---|---|
| `backendURL`, `ga4Id`, `clarityId` | da `consentEnv()` | Vuoti: niente registro / niente GA4 / niente Clarity. |
| `categories` | `["measurement"]` | Aggiungi `"marketing"` su un sito con pubblicità. |
| `scripts` | `[]` | Altri script da bloccare fino al consenso, da `@c15t/scripts` (es. Meta Pixel), con la loro categoria. |
| `colors` | chiari con l'arancio Mediastar | Token colore di c15t: `primary`, `textOnPrimary`, `surface`, `text`, `textMuted`, `border`… |
| `colorScheme` | `"light"` | `"light"`, `"dark"`, `"system"`. |
| `fontFamily` | `"inherit"` | Il font del sito. |
| `privacyPolicyHref` | `"/privacy"` | |
| `cookiePolicyHref` | nessuno | Se c'è, il banner ha anche il link alla cookie policy. |
| `messages` | testi italiani | Sovrascrive i testi (stessa forma di `DEFAULT_MESSAGES`). |

Il testo del banner nomina da solo gli strumenti attivi: con solo GA4 dice "Google Analytics", con entrambi "Google Analytics e Microsoft Clarity".

## Eventi GA4

```tsx
import { gtagEvent } from "@mediastar/consent";

gtagEvent("lead_contatti", { percorso: "privati" });
```

Finché il visitatore non accetta, GA4 non è caricato e la chiamata non fa niente: nessun controllo del consenso da ripetere nei componenti.

## Sviluppo del pacchetto

```bash
pnpm install
pnpm build        # compila src/ in dist/ — dist/ è committato: è ciò che i siti installano
```

Per una nuova versione: modifica, `pnpm build`, commit (con `dist/`), aggiorna `version` in `package.json`, tag `vX.Y.Z`, push del tag. Nei siti: `pnpm add github:Mediastar-Web/consent-kit#vX.Y.Z`.
