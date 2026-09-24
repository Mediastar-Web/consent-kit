// @mediastar/consent/vendors: what every supported tool is, for the banner, the preferences dialog
// and the site's own cookie policy. Plain data, no React: a Server Component can read it to write
// the cookie policy, and the banner reads the same names, so the two never describe different tools.
//
// THE COOKIE LISTS are the main cookies each vendor documents, not an exhaustive inventory: vendors
// rename and add cookies between versions, so every entry also links the vendor's own notice, which
// is the authoritative list (the Garante asks for exactly that link).

/** A consent category, as c15t names it. `necessary` needs no vendor and is never listed here. */
export type Category = "measurement" | "marketing" | "experience";

export type Vendor = {
  /** The tool's name, as a visitor knows it. */
  name: string;
  /** Who processes the data for visitors in the European Economic Area. */
  company: string;
  category: Category;
  /** What it is for, in one sentence (Italian): the cookie policy's description. */
  purpose: string;
  /** The main cookies, as the vendor documents them. Duration in Italian ("2 anni"). */
  cookies: readonly { name: string; duration: string }[];
  /** The vendor's privacy notice. */
  privacyPolicy: string;
  /** Transfers outside the EEA and the safeguard they rely on (Italian). */
  transfer: string;
  /** For some pixels the site and the vendor are joint controllers of the collection (CJEU
   *  C-40/17, Fashion ID), and the site's notice must say so. `terms` is the vendor's agreement,
   *  where it publishes one at a stable address. Absent: the vendor acts on its own. */
  jointController?: { terms?: string };
};

const DPF =
  "I dati possono essere trasferiti negli Stati Uniti, sulla base della decisione di adeguatezza UE-USA (Data Privacy Framework), a cui il fornitore aderisce.";

/** The tools a site switches on with an ID: analytics and advertising. */
export const TRACKERS = {
  ga4: {
    name: "Google Analytics",
    company: "Google Ireland Limited, Gordon House, Barrow Street, Dublino 4, Irlanda",
    category: "measurement",
    purpose:
      "Statistiche sulle visite: pagine viste, provenienza, dispositivo e interazioni, per capire come viene usato il sito.",
    cookies: [
      { name: "_ga", duration: "2 anni" },
      { name: "_ga_<ID>", duration: "2 anni" },
    ],
    privacyPolicy: "https://policies.google.com/privacy",
    transfer: DPF,
  },
  clarity: {
    name: "Microsoft Clarity",
    company:
      "Microsoft Ireland Operations Limited, One Microsoft Place, South County Business Park, Leopardstown, Dublino 18, Irlanda",
    category: "measurement",
    purpose:
      "Statistiche sull'uso delle pagine e registrazione anonima dell'interazione (movimenti, clic, scorrimento), per migliorare il sito.",
    cookies: [
      { name: "_clck", duration: "1 anno" },
      { name: "_clsk", duration: "1 giorno" },
    ],
    privacyPolicy: "https://privacy.microsoft.com/it-it/privacystatement",
    transfer: DPF,
  },
  googleAds: {
    name: "Google Ads",
    company: "Google Ireland Limited, Gordon House, Barrow Street, Dublino 4, Irlanda",
    category: "marketing",
    purpose:
      "Misura le conversioni degli annunci Google e permette di mostrare pubblicità in linea con i tuoi interessi (remarketing), anche su altri siti.",
    cookies: [{ name: "_gcl_au", duration: "90 giorni" }],
    privacyPolicy: "https://policies.google.com/privacy",
    transfer: DPF,
  },
  metaPixel: {
    name: "Meta Pixel",
    company: "Meta Platforms Ireland Limited, Merrion Road, Dublino 4, Irlanda",
    category: "marketing",
    purpose:
      "Misura l'efficacia degli annunci su Facebook e Instagram e permette di mostrarti pubblicità in linea con i tuoi interessi.",
    cookies: [
      { name: "_fbp", duration: "90 giorni" },
      { name: "_fbc", duration: "90 giorni" },
    ],
    privacyPolicy: "https://www.facebook.com/privacy/policy/",
    transfer: DPF,
    jointController: { terms: "https://www.facebook.com/legal/controller_addendum" },
  },
  tiktokPixel: {
    name: "TikTok Pixel",
    company: "TikTok Technology Limited, 10 Earlsfort Terrace, Dublino 2, Irlanda",
    category: "marketing",
    purpose:
      "Misura l'efficacia degli annunci su TikTok e permette di mostrarti pubblicità in linea con i tuoi interessi.",
    cookies: [
      { name: "_ttp", duration: "13 mesi" },
      { name: "_tt_enable_cookie", duration: "13 mesi" },
    ],
    privacyPolicy: "https://www.tiktok.com/legal/page/eea/privacy-policy/it",
    transfer:
      "Il fornitore trasferisce dati anche fuori dallo Spazio economico europeo, con le clausole contrattuali standard descritte nella sua informativa.",
    jointController: {},
  },
  linkedin: {
    name: "LinkedIn Insight Tag",
    company: "LinkedIn Ireland Unlimited Company, Wilton Plaza, Wilton Place, Dublino 2, Irlanda",
    category: "marketing",
    purpose:
      "Misura le conversioni degli annunci su LinkedIn e permette di mostrarti pubblicità in linea con i tuoi interessi professionali.",
    cookies: [
      { name: "li_sugr", duration: "90 giorni" },
      { name: "bcookie", duration: "1 anno" },
      { name: "lidc", duration: "1 giorno" },
      { name: "UserMatchHistory", duration: "30 giorni" },
    ],
    privacyPolicy: "https://it.linkedin.com/legal/privacy-policy",
    transfer: DPF,
  },
} as const satisfies Record<string, Vendor>;

export type TrackerId = keyof typeof TRACKERS;

/** The IDs a site gives its trackers, e.g. `{ ga4: "G-…", metaPixel: "123…" }`. Empty: off. */
export type Trackers = Partial<Record<TrackerId, string>>;

/** Content from other services embedded in the pages: loaded only once the visitor allows it. */
export const EMBEDS = {
  googleMaps: {
    name: "Google Maps",
    company: "Google Ireland Limited, Gordon House, Barrow Street, Dublino 4, Irlanda",
    category: "experience",
    purpose:
      "Mappe incorporate nelle pagine. Caricandole, Google riceve i tuoi dati di navigazione e può installare i suoi cookie.",
    cookies: [{ name: "NID", duration: "6 mesi" }],
    privacyPolicy: "https://policies.google.com/privacy",
    transfer: DPF,
  },
  youtube: {
    name: "YouTube",
    company: "Google Ireland Limited, Gordon House, Barrow Street, Dublino 4, Irlanda",
    category: "experience",
    purpose:
      "Video incorporati nelle pagine, in modalità a privacy avanzata. Guardandoli, Google riceve i tuoi dati di navigazione e può salvare dati nel browser.",
    cookies: [
      { name: "VISITOR_INFO1_LIVE", duration: "6 mesi" },
      { name: "YSC", duration: "fino alla chiusura del browser" },
    ],
    privacyPolicy: "https://policies.google.com/privacy",
    transfer: DPF,
  },
  vimeo: {
    name: "Vimeo",
    company: "Vimeo.com, Inc., 330 West 34th Street, New York, NY 10001, Stati Uniti",
    category: "experience",
    purpose:
      "Video incorporati nelle pagine. Guardandoli, Vimeo riceve i tuoi dati di navigazione e può installare i suoi cookie.",
    cookies: [{ name: "vuid", duration: "2 anni" }],
    privacyPolicy: "https://vimeo.com/privacy",
    transfer: DPF,
  },
} as const satisfies Record<string, Vendor>;

export type EmbedId = keyof typeof EMBEDS;

/** The trackers that are actually on: those with an ID. In catalogue order. */
export function activeTrackers(trackers: Trackers | undefined): TrackerId[] {
  return (Object.keys(TRACKERS) as TrackerId[]).filter((id) => Boolean(trackers?.[id]?.trim()));
}

/** "A", "A e B", "A, B e C". */
export function listOf(items: readonly string[]): string {
  return items.length <= 1 ? (items[0] ?? "") : `${items.slice(0, -1).join(", ")} e ${items.at(-1)}`;
}
