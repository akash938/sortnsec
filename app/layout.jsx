import "./globals.css";
export const viewport = {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
    themeColor: [
        { media: "(prefers-color-scheme: light)", color: "#FFFFFF" },
        { media: "(prefers-color-scheme: dark)", color: "#0A0A0A" },
    ],
};
export const metadata = {
    metadataBase: new URL("https://sortnsec.com"),
    title: {
        default: "Sortn Sec — AI Multimodal Photo Categorizer & Aesthetic Curations",
        template: "%s | Sortn Sec",
    },
    description: "Categorize up to 100 photos instantly in the browser by aesthetic (Minimalist, Cyberpunk, Dark Academia, Brutalist) and subject (Cars, Architecture, Food, Animals) using Google Gemini Vision AI and OpenAI CLIP.",
    keywords: [
        "AI photo categorizer",
        "zero-shot image classification",
        "CLIP browser vision",
        "Google Gemini Vision AI",
        "aesthetic photo sorter",
        "Sortn Sec",
        "sortnsec",
        "multimodal image tagging",
        "privacy-first photo organizer",
        "Koenigsegg car classification",
        "photography curation tool",
    ],
    authors: [{ name: "Sortn Sec Engineering", url: "https://sortnsec.com" }],
    creator: "Sortn Sec",
    publisher: "Sortn Sec",
    category: "Photography & AI Utilities",
    alternates: {
        canonical: "/",
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            "max-video-preview": -1,
            "max-image-preview": "large",
            "max-snippet": -1,
        },
    },
    openGraph: {
        type: "website",
        locale: "en_US",
        url: "https://sortnsec.com",
        siteName: "Sortn Sec",
        title: "Sortn Sec — Instant AI Photo Categorizer & Aesthetic Sorter",
        description: "Drop up to 100 photos to watch the liquid obsidian jelly orb absorb and classify them by aesthetic and subject using Gemini Vision AI or client-side CLIP.",
        images: [
            {
                url: "/samples/koenigsegg_jesko_gims_hypercar.jpg",
                width: 1200,
                height: 630,
                alt: "Sortn Sec — AI Multimodal Photo Categorizer",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: "Sortn Sec — Instant AI Photo Categorizer",
        description: "Zero-shot aesthetic & subject photo classification in your browser powered by Google Gemini Vision AI and OpenAI CLIP.",
        images: ["/samples/koenigsegg_jesko_gims_hypercar.jpg"],
    },
};
const JSON_LD_SCHEMA = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Sortn Sec",
    url: "https://sortnsec.com",
    applicationCategory: "MultimediaApplication",
    operatingSystem: "Any (Web Browser)",
    description: "Instant zero-shot multimodal photo categorization by aesthetic and subject using Google Gemini Vision AI and local Web Worker CLIP neural networks.",
    offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
    },
    featureList: [
        "Zero-shot image classification across 22 aesthetic and subject categories",
        "Dual AI engine: Google Gemini Vision API and client-side OpenAI CLIP ViT-B/32",
        "100% privacy-first in-memory object URL processing",
        "Interactive WebGL raymarched liquid obsidian jelly orb animation",
    ],
};
export default function RootLayout({ children, }) {
    return (<html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{
            __html: `
              try {
                const storedTheme = localStorage.getItem('sortn-sec-theme');
                const supportDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
                if (storedTheme === 'dark' || (!storedTheme && supportDarkMode)) {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              } catch (e) {}
            `,
        }}/>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD_SCHEMA) }}/>
      </head>
      <body className="min-h-screen bg-[var(--bg-primary)] text-[var(--fg-primary)] font-sans antialiased transition-colors duration-200">
        {children}
      </body>
    </html>);
}
