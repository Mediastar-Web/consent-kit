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
    cookies: readonly {
        name: string;
        duration: string;
    }[];
    /** The vendor's privacy notice. */
    privacyPolicy: string;
    /** Transfers outside the EEA and the safeguard they rely on (Italian). */
    transfer: string;
    /** For some pixels the site and the vendor are joint controllers of the collection (CJEU
     *  C-40/17, Fashion ID), and the site's notice must say so. `terms` is the vendor's agreement,
     *  where it publishes one at a stable address. Absent: the vendor acts on its own. */
    jointController?: {
        terms?: string;
    };
};
/** The tools a site switches on with an ID: analytics and advertising. */
export declare const TRACKERS: {
    readonly ga4: {
        readonly name: "Google Analytics";
        readonly company: "Google Ireland Limited, Gordon House, Barrow Street, Dublino 4, Irlanda";
        readonly category: "measurement";
        readonly purpose: "Statistiche sulle visite: pagine viste, provenienza, dispositivo e interazioni, per capire come viene usato il sito.";
        readonly cookies: readonly [{
            readonly name: "_ga";
            readonly duration: "2 anni";
        }, {
            readonly name: "_ga_<ID>";
            readonly duration: "2 anni";
        }];
        readonly privacyPolicy: "https://policies.google.com/privacy";
        readonly transfer: "I dati possono essere trasferiti negli Stati Uniti, sulla base della decisione di adeguatezza UE-USA (Data Privacy Framework), a cui il fornitore aderisce.";
    };
    readonly clarity: {
        readonly name: "Microsoft Clarity";
        readonly company: "Microsoft Ireland Operations Limited, One Microsoft Place, South County Business Park, Leopardstown, Dublino 18, Irlanda";
        readonly category: "measurement";
        readonly purpose: "Statistiche sull'uso delle pagine e registrazione anonima dell'interazione (movimenti, clic, scorrimento), per migliorare il sito.";
        readonly cookies: readonly [{
            readonly name: "_clck";
            readonly duration: "1 anno";
        }, {
            readonly name: "_clsk";
            readonly duration: "1 giorno";
        }];
        readonly privacyPolicy: "https://privacy.microsoft.com/it-it/privacystatement";
        readonly transfer: "I dati possono essere trasferiti negli Stati Uniti, sulla base della decisione di adeguatezza UE-USA (Data Privacy Framework), a cui il fornitore aderisce.";
    };
    readonly googleAds: {
        readonly name: "Google Ads";
        readonly company: "Google Ireland Limited, Gordon House, Barrow Street, Dublino 4, Irlanda";
        readonly category: "marketing";
        readonly purpose: "Misura le conversioni degli annunci Google e permette di mostrare pubblicità in linea con i tuoi interessi (remarketing), anche su altri siti.";
        readonly cookies: readonly [{
            readonly name: "_gcl_au";
            readonly duration: "90 giorni";
        }];
        readonly privacyPolicy: "https://policies.google.com/privacy";
        readonly transfer: "I dati possono essere trasferiti negli Stati Uniti, sulla base della decisione di adeguatezza UE-USA (Data Privacy Framework), a cui il fornitore aderisce.";
    };
    readonly metaPixel: {
        readonly name: "Meta Pixel";
        readonly company: "Meta Platforms Ireland Limited, Merrion Road, Dublino 4, Irlanda";
        readonly category: "marketing";
        readonly purpose: "Misura l'efficacia degli annunci su Facebook e Instagram e permette di mostrarti pubblicità in linea con i tuoi interessi.";
        readonly cookies: readonly [{
            readonly name: "_fbp";
            readonly duration: "90 giorni";
        }, {
            readonly name: "_fbc";
            readonly duration: "90 giorni";
        }];
        readonly privacyPolicy: "https://www.facebook.com/privacy/policy/";
        readonly transfer: "I dati possono essere trasferiti negli Stati Uniti, sulla base della decisione di adeguatezza UE-USA (Data Privacy Framework), a cui il fornitore aderisce.";
        readonly jointController: {
            readonly terms: "https://www.facebook.com/legal/controller_addendum";
        };
    };
    readonly tiktokPixel: {
        readonly name: "TikTok Pixel";
        readonly company: "TikTok Technology Limited, 10 Earlsfort Terrace, Dublino 2, Irlanda";
        readonly category: "marketing";
        readonly purpose: "Misura l'efficacia degli annunci su TikTok e permette di mostrarti pubblicità in linea con i tuoi interessi.";
        readonly cookies: readonly [{
            readonly name: "_ttp";
            readonly duration: "13 mesi";
        }, {
            readonly name: "_tt_enable_cookie";
            readonly duration: "13 mesi";
        }];
        readonly privacyPolicy: "https://www.tiktok.com/legal/page/eea/privacy-policy/it";
        readonly transfer: "Il fornitore trasferisce dati anche fuori dallo Spazio economico europeo, con le clausole contrattuali standard descritte nella sua informativa.";
        readonly jointController: {};
    };
    readonly linkedin: {
        readonly name: "LinkedIn Insight Tag";
        readonly company: "LinkedIn Ireland Unlimited Company, Wilton Plaza, Wilton Place, Dublino 2, Irlanda";
        readonly category: "marketing";
        readonly purpose: "Misura le conversioni degli annunci su LinkedIn e permette di mostrarti pubblicità in linea con i tuoi interessi professionali.";
        readonly cookies: readonly [{
            readonly name: "li_sugr";
            readonly duration: "90 giorni";
        }, {
            readonly name: "bcookie";
            readonly duration: "1 anno";
        }, {
            readonly name: "lidc";
            readonly duration: "1 giorno";
        }, {
            readonly name: "UserMatchHistory";
            readonly duration: "30 giorni";
        }];
        readonly privacyPolicy: "https://it.linkedin.com/legal/privacy-policy";
        readonly transfer: "I dati possono essere trasferiti negli Stati Uniti, sulla base della decisione di adeguatezza UE-USA (Data Privacy Framework), a cui il fornitore aderisce.";
    };
};
export type TrackerId = keyof typeof TRACKERS;
/** The IDs a site gives its trackers, e.g. `{ ga4: "G-…", metaPixel: "123…" }`. Empty: off. */
export type Trackers = Partial<Record<TrackerId, string>>;
/** Content from other services embedded in the pages: loaded only once the visitor allows it. */
export declare const EMBEDS: {
    readonly googleMaps: {
        readonly name: "Google Maps";
        readonly company: "Google Ireland Limited, Gordon House, Barrow Street, Dublino 4, Irlanda";
        readonly category: "experience";
        readonly purpose: "Mappe incorporate nelle pagine. Caricandole, Google riceve i tuoi dati di navigazione e può installare i suoi cookie.";
        readonly cookies: readonly [{
            readonly name: "NID";
            readonly duration: "6 mesi";
        }];
        readonly privacyPolicy: "https://policies.google.com/privacy";
        readonly transfer: "I dati possono essere trasferiti negli Stati Uniti, sulla base della decisione di adeguatezza UE-USA (Data Privacy Framework), a cui il fornitore aderisce.";
    };
    readonly youtube: {
        readonly name: "YouTube";
        readonly company: "Google Ireland Limited, Gordon House, Barrow Street, Dublino 4, Irlanda";
        readonly category: "experience";
        readonly purpose: "Video incorporati nelle pagine, in modalità a privacy avanzata. Guardandoli, Google riceve i tuoi dati di navigazione e può salvare dati nel browser.";
        readonly cookies: readonly [{
            readonly name: "VISITOR_INFO1_LIVE";
            readonly duration: "6 mesi";
        }, {
            readonly name: "YSC";
            readonly duration: "fino alla chiusura del browser";
        }];
        readonly privacyPolicy: "https://policies.google.com/privacy";
        readonly transfer: "I dati possono essere trasferiti negli Stati Uniti, sulla base della decisione di adeguatezza UE-USA (Data Privacy Framework), a cui il fornitore aderisce.";
    };
    readonly vimeo: {
        readonly name: "Vimeo";
        readonly company: "Vimeo.com, Inc., 330 West 34th Street, New York, NY 10001, Stati Uniti";
        readonly category: "experience";
        readonly purpose: "Video incorporati nelle pagine. Guardandoli, Vimeo riceve i tuoi dati di navigazione e può installare i suoi cookie.";
        readonly cookies: readonly [{
            readonly name: "vuid";
            readonly duration: "2 anni";
        }];
        readonly privacyPolicy: "https://vimeo.com/privacy";
        readonly transfer: "I dati possono essere trasferiti negli Stati Uniti, sulla base della decisione di adeguatezza UE-USA (Data Privacy Framework), a cui il fornitore aderisce.";
    };
};
export type EmbedId = keyof typeof EMBEDS;
/** The trackers that are actually on: those with an ID. In catalogue order. */
export declare function activeTrackers(trackers: Trackers | undefined): TrackerId[];
/** "A", "A e B", "A, B e C". */
export declare function listOf(items: readonly string[]): string;
