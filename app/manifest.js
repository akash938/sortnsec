export default function manifest() {
    return {
        name: "Sortn Sec — AI Multimodal Photo Categorizer",
        short_name: "Sortn Sec",
        description: "Instant zero-shot AI photo categorization by aesthetic and subject using Google Gemini Vision AI and client-side OpenAI CLIP neural networks.",
        start_url: "/",
        display: "standalone",
        background_color: "#0A0A0A",
        theme_color: "#0A0A0A",
        icons: [
            {
                src: "/samples/koenigsegg_jesko_gims_hypercar.jpg",
                sizes: "512x512",
                type: "image/jpeg",
            },
        ],
    };
}
