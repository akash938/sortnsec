export default function robots() {
    return {
        rules: [
            {
                userAgent: "*",
                allow: "/",
                disallow: ["/api/"],
            },
        ],
        sitemap: "https://sortnsec.com/sitemap.xml",
        host: "https://sortnsec.com",
    };
}
