// Privacy + cookie policy copy (EN/NL). Reflects the actual stack: Supabase (Frankfurt),
// Vercel (hosting), Resend (lead notifications), no analytics or marketing cookies.
// Items marked PENDING in PENDING.md: KvK/VAT, confirmed retention period, legal review.

export type LegalSection = { h: string; p?: string[]; list?: string[] };
export type LegalDoc = {
  title: string;
  /** Meta description (search results + link previews). */
  description: string;
  updated: string;
  intro: string;
  sections: LegalSection[];
};

const UPDATED = { en: "Last updated: 26 September 2026", nl: "Laatst bijgewerkt: 26 september 2026" };

export const legal: Record<"en" | "nl", { privacy: LegalDoc; cookies: LegalDoc }> = {
  en: {
    privacy: {
      title: "Privacy policy",
      description:
        "How Presence Hospitality handles the details you share when you request a demo: what we collect, why, who processes it, how long we keep it and your GDPR rights.",
      updated: UPDATED.en,
      intro:
        "This policy explains what personal data Presence Hospitality processes when you visit this website or request a demo, why we do so, and what rights you have.",
      sections: [
        {
          h: "Who we are",
          p: [
            "Presence Hospitality B.V., a company of [partner], Korte Leidsedwarsstraat 92-1, Amsterdam, the Netherlands, is the controller for the processing described here.",
          ],
        },
        {
          h: "What we collect",
          p: ["When you request a demo, we collect the details you enter in the form:"],
          list: [
            "First and last name, email address and phone number",
            "Your position and the name of your hotel",
            "The PMS you use (optional) and your message",
            "The language of the page you used, and the date and time you gave consent",
          ],
        },
        {
          h: "Why we use it",
          p: [
            "We use these details only to respond to your demo request, schedule and prepare the demo, and follow up on it. The legal basis is your consent (Article 6(1)(a) GDPR) and taking steps at your request before entering into a contract (Article 6(1)(b) GDPR).",
            "We don't use your details for advertising, we don't sell them, and we don't use analytics or tracking tools on this website.",
          ],
        },
        {
          h: "Who processes it for us",
          p: ["We use a small number of service providers, each bound by a data processing agreement:"],
          list: [
            "Supabase: stores demo requests in a database hosted in Frankfurt, Germany (EU).",
            "Vercel: hosts this website. Like any web server, it briefly processes technical data such as your IP address to deliver pages securely.",
            "Resend: sends our team an email notification with the details of a new demo request. Resend is based in the United States; transfers are covered by the EU Standard Contractual Clauses.",
          ],
        },
        {
          h: "How long we keep it",
          p: [
            "We keep demo requests for up to 24 months after our last contact with you, unless you become a client (then the client agreement applies). After that we delete them.",
          ],
        },
        {
          h: "Your rights",
          p: [
            "You can ask us at any time for access to, correction of or deletion of your data, ask us to restrict or stop processing it, or ask for a copy in a portable format. You can withdraw your consent at any time; this doesn't affect processing that already took place.",
            "To exercise these rights, email us at the address below. You also have the right to lodge a complaint with the Dutch Data Protection Authority (Autoriteit Persoonsgegevens).",
          ],
        },
        {
          h: "Security",
          p: [
            "Data is sent over encrypted connections. Access to demo requests is limited to authorised Presence Hospitality staff with a personal, password-protected account.",
          ],
        },
        {
          h: "Changes and contact",
          p: [
            "We may update this policy when our services change; the date at the top shows the latest version. Questions? Contact us using the details in the footer of this page.",
          ],
        },
      ],
    },
    cookies: {
      title: "Cookie policy",
      description:
        "Presence Hospitality uses no analytics, advertising or tracking cookies. Only a functional language cookie and, for staff, a sign-in cookie.",
      updated: UPDATED.en,
      intro:
        "This website uses as few cookies as possible. We don't use analytics, advertising or tracking cookies, so we don't ask for cookie consent.",
      sections: [
        {
          h: "Cookies we use",
          list: [
            "NEXT_LOCALE (functional): remembers whether you chose English or Dutch. Session cookie, deleted when you close your browser.",
            "sb-…-auth-token (strictly necessary): only set when a Presence Hospitality staff member signs in to the private leads dashboard. It keeps them signed in. Visitors of the public website never receive it.",
          ],
        },
        {
          h: "What we don't use",
          p: [
            "No Google Analytics or similar tools, no advertising pixels, no social media trackers and no fingerprinting. Fonts and scripts are served from our own domain.",
          ],
        },
        {
          h: "Managing cookies",
          p: [
            "You can delete or block cookies in your browser settings. The website keeps working without the language cookie; you'll simply see the language that matches your browser.",
          ],
        },
      ],
    },
  },
  nl: {
    privacy: {
      title: "Privacybeleid",
      description:
        "Hoe Presence Hospitality omgaat met je gegevens bij een demo-aanvraag: wat we verzamelen, waarom, wie ze verwerkt, hoe lang we ze bewaren en je rechten (AVG).",
      updated: UPDATED.nl,
      intro:
        "In dit beleid lees je welke persoonsgegevens Presence Hospitality verwerkt als je deze website bezoekt of een demo aanvraagt, waarom we dat doen en welke rechten je hebt.",
      sections: [
        {
          h: "Wie we zijn",
          p: [
            "Presence Hospitality B.V., een bedrijf van [partner], Korte Leidsedwarsstraat 92-1, Amsterdam, is verwerkingsverantwoordelijke voor de verwerking die hier wordt beschreven.",
          ],
        },
        {
          h: "Welke gegevens we verzamelen",
          p: ["Als je een demo aanvraagt, verzamelen we de gegevens die je in het formulier invult:"],
          list: [
            "Voor- en achternaam, e-mailadres en telefoonnummer",
            "Je functie en de naam van je hotel",
            "Het PMS dat je gebruikt (optioneel) en je bericht",
            "De taal van de pagina en de datum en tijd waarop je toestemming gaf",
          ],
        },
        {
          h: "Waarvoor we ze gebruiken",
          p: [
            "We gebruiken deze gegevens alleen om te reageren op je demo-aanvraag, de demo in te plannen en voor te bereiden, en daarna contact met je op te nemen. De grondslag is je toestemming (artikel 6 lid 1 sub a AVG) en het nemen van stappen op jouw verzoek voordat een overeenkomst wordt gesloten (artikel 6 lid 1 sub b AVG).",
            "We gebruiken je gegevens niet voor reclame, verkopen ze niet en gebruiken geen analyse- of trackingtools op deze website.",
          ],
        },
        {
          h: "Wie ze voor ons verwerkt",
          p: ["We werken met een klein aantal dienstverleners, elk gebonden aan een verwerkersovereenkomst:"],
          list: [
            "Supabase: slaat demo-aanvragen op in een database in Frankfurt, Duitsland (EU).",
            "Vercel: host deze website. Zoals elke webserver verwerkt Vercel kort technische gegevens, zoals je IP-adres, om pagina's veilig te leveren.",
            "Resend: stuurt ons team een e-mailmelding met de gegevens van een nieuwe demo-aanvraag. Resend is gevestigd in de Verenigde Staten; doorgifte valt onder de standaardcontractbepalingen van de EU.",
          ],
        },
        {
          h: "Hoe lang we ze bewaren",
          p: [
            "We bewaren demo-aanvragen tot 24 maanden na ons laatste contact met je, tenzij je klant wordt (dan geldt de klantovereenkomst). Daarna verwijderen we ze.",
          ],
        },
        {
          h: "Je rechten",
          p: [
            "Je kunt ons op elk moment vragen om inzage, correctie of verwijdering van je gegevens, om de verwerking te beperken of te stoppen, of om een kopie in een overdraagbaar formaat. Je kunt je toestemming altijd intrekken; dat heeft geen gevolgen voor verwerking die al heeft plaatsgevonden.",
            "Mail ons via het adres hieronder om deze rechten uit te oefenen. Je hebt ook het recht een klacht in te dienen bij de Autoriteit Persoonsgegevens.",
          ],
        },
        {
          h: "Beveiliging",
          p: [
            "Gegevens worden via versleutelde verbindingen verstuurd. Alleen bevoegde medewerkers van Presence Hospitality met een persoonlijk, met wachtwoord beveiligd account hebben toegang tot demo-aanvragen.",
          ],
        },
        {
          h: "Wijzigingen en contact",
          p: [
            "We kunnen dit beleid aanpassen als onze diensten veranderen; de datum bovenaan toont de nieuwste versie. Vragen? Neem contact op via de gegevens onderaan deze pagina.",
          ],
        },
      ],
    },
    cookies: {
      title: "Cookiebeleid",
      description:
        "Presence Hospitality gebruikt geen analytische, advertentie- of trackingcookies. Alleen een functionele taalcookie en, voor medewerkers, een inlogcookie.",
      updated: UPDATED.nl,
      intro:
        "Deze website gebruikt zo min mogelijk cookies. We gebruiken geen analytische, advertentie- of trackingcookies en vragen daarom geen cookietoestemming.",
      sections: [
        {
          h: "Cookies die we gebruiken",
          list: [
            "NEXT_LOCALE (functioneel): onthoudt of je voor Engels of Nederlands hebt gekozen. Sessiecookie, verdwijnt als je je browser sluit.",
            "sb-…-auth-token (strikt noodzakelijk): wordt alleen geplaatst als een medewerker van Presence Hospitality inlogt op het besloten leads-dashboard, zodat die ingelogd blijft. Bezoekers van de openbare website krijgen deze cookie nooit.",
          ],
        },
        {
          h: "Wat we niet gebruiken",
          p: [
            "Geen Google Analytics of vergelijkbare tools, geen advertentiepixels, geen social-media-trackers en geen fingerprinting. Lettertypen en scripts komen van ons eigen domein.",
          ],
        },
        {
          h: "Cookies beheren",
          p: [
            "Je kunt cookies verwijderen of blokkeren in de instellingen van je browser. De website blijft werken zonder de taalcookie; je ziet dan gewoon de taal die bij je browser past.",
          ],
        },
      ],
    },
  },
};
