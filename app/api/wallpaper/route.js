import { NextResponse } from "next/server";

const TIME_OF_DAY_THEMES = [
  {
    name: "Midnight Obsidian & Aurora",
    hours: [23, 0, 1, 2, 3, 4],
    queries: [
      "aurora borealis night sky mountain",
      "milky way night landscape alps",
      "tokyo night street neon rain",
      "night architecture modern reflection",
    ],
    fallbackImages: [
      "/samples/bioluminescent_beach_waves.jpg",
      "/samples/blade_runner_neo_tokyo.jpg",
      "/samples/cars_koenigsegg_jesko_1.jpg",
      "/samples/candlelit_desk_study.jpg",
    ],
  },
  {
    name: "Dawn First Light",
    hours: [5, 6, 7],
    queries: [
      "dolomites sunrise misty mountains",
      "minimalist morning light architecture",
      "calm ocean sunrise golden horizon",
      "alpine lake dawn mist",
    ],
    fallbackImages: [
      "/samples/dolomites_mountain_lake.jpg",
      "/samples/ceramic_vase_still_life.jpg",
      "/samples/bioluminescent_beach_waves.jpg",
      "/samples/brutalist_facade.jpg",
    ],
  },
  {
    name: "Morning Minimalist",
    hours: [8, 9, 10, 11],
    queries: [
      "zaha hadid modern architecture concrete",
      "minimalist interior sunlight shadows",
      "modernist museum architecture clean",
      "swiss alps clear morning lake",
    ],
    fallbackImages: [
      "/samples/brutalist_facade.jpg",
      "/samples/ceramic_vase_still_life.jpg",
      "/samples/dolomites_mountain_lake.jpg",
      "/samples/calatrava_sculptural_bridge.jpg",
    ],
  },
  {
    name: "Solar Zenith Editorial",
    hours: [12, 13, 14, 15],
    queries: [
      "koenigsegg hypercar modern",
      "dramatic canyon desert sunlight",
      "aerial turquoise ocean cliffs",
      "parametric futuristic building",
    ],
    fallbackImages: [
      "/samples/cars_koenigsegg_jesko_1.jpg",
      "/samples/calatrava_sculptural_bridge.jpg",
      "/samples/dolomites_mountain_lake.jpg",
      "/samples/brutalist_facade.jpg",
    ],
  },
  {
    name: "Golden Twilight",
    hours: [16, 17, 18],
    queries: [
      "golden hour mountain ridge sunset",
      "twilight sports car wet asphalt",
      "sunset coastal cliff silhouette",
      "golden hour editorial portrait",
    ],
    fallbackImages: [
      "/samples/dolomites_mountain_lake.jpg",
      "/samples/cinematic_portrait_woman.jpg",
      "/samples/cars_koenigsegg_jesko_1.jpg",
      "/samples/bioluminescent_beach_waves.jpg",
    ],
  },
  {
    name: "Nocturne Cinema",
    hours: [19, 20, 21, 22],
    queries: [
      "cyberpunk neon city night rain",
      "modern glass skyscraper twilight blue hour",
      "dramatic moody car night lights",
      "candlelit dark academia library",
    ],
    fallbackImages: [
      "/samples/blade_runner_neo_tokyo.jpg",
      "/samples/cars_koenigsegg_jesko_1.jpg",
      "/samples/cinematic_portrait_woman.jpg",
      "/samples/candlelit_desk_study.jpg",
    ],
  },
];

function getThemeForHour(hour) {
  const h = ((Number(hour) || 0) % 24 + 24) % 24;
  return (
    TIME_OF_DAY_THEMES.find((t) => t.hours.includes(h)) ||
    TIME_OF_DAY_THEMES[0]
  );
}

async function fetchCopyrightFreeWallpaper(query, hourSeed) {
  try {
    const offset = (hourSeed % 4) * 3;
    const wikiUrl = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(
      `filetype:bitmap ${query}`
    )}&gsrnamespace=6&gsrlimit=10&gsroffset=${offset}&prop=imageinfo&iiprop=url|mime|extmetadata&iiurlwidth=1920&format=json&origin=*`;

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(wikiUrl, {
      signal: controller.signal,
      headers: { "User-Agent": "SortnSec-TimelyWallpaper/1.0" },
    });
    clearTimeout(timer);

    if (!res.ok) return null;
    const data = await res.json();
    const pages = Object.values(data?.query?.pages || {}).filter((p) => {
      const ii = p?.imageinfo?.[0];
      const mime = (ii?.mime || "").toLowerCase();
      if (!ii?.thumburl && !ii?.url) return false;
      if (
        !mime.includes("jpeg") &&
        !mime.includes("png") &&
        !mime.includes("webp")
      ) {
        return false;
      }
      // Filter for copyright-free / Creative Commons / Public Domain licenses
      const license = (
        ii?.extmetadata?.LicenseShortName?.value || ""
      ).toLowerCase();
      if (license && license.includes("copyrighted")) return false;
      return true;
    });

    if (pages.length === 0) return null;
    const startIdx = hourSeed % pages.length;
    for (let offsetIdx = 0; offsetIdx < Math.min(4, pages.length); offsetIdx++) {
      const chosen = pages[(startIdx + offsetIdx) % pages.length];
      const ii = chosen.imageinfo[0];
      const candidateUrl = ii.thumburl || ii.url;
      if (!candidateUrl) continue;

      // Verify the image URL actually responds 200 OK with an image/* content-type so zero broken images reach the UI
      try {
        const checkCtrl = new AbortController();
        const checkTimer = setTimeout(() => checkCtrl.abort(), 3000);
        const headRes = await fetch(candidateUrl, {
          method: "HEAD",
          signal: checkCtrl.signal,
          headers: { "User-Agent": "SortnSec-TimelyWallpaper/1.0" },
        });
        clearTimeout(checkTimer);
        const cType = (headRes.headers.get("content-type") || "").toLowerCase();
        if (!headRes.ok || !cType.startsWith("image/")) {
          continue;
        }
      } catch {
        continue;
      }

      return {
        url: candidateUrl,
        title: (chosen.title || "")
          .replace(/^File:/i, "")
          .replace(/\.[a-z0-9]+$/i, "")
          .replace(/[_-]+/g, " "),
        license:
          ii?.extmetadata?.LicenseShortName?.value || "Public Domain / CC",
      };
    }
    return null;
  } catch {
    return null;
  }
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const hourParam = searchParams.get("hour");
  const now = new Date();
  const hour =
    hourParam !== null ? Number(hourParam) : now.getHours();
  const hourEpoch = Math.floor(Date.now() / 3600000);
  const theme = getThemeForHour(hour);

  const fetched = await Promise.all(
    theme.queries.map((q, idx) =>
      fetchCopyrightFreeWallpaper(q, hourEpoch + idx)
    )
  );

  const wallpapers = theme.fallbackImages.map((fallbackUrl, idx) => {
    const net = fetched[idx];
    return {
      slot: idx,
      url: net?.url || fallbackUrl,
      title: net?.title || theme.name,
      license: net?.license || "CC0 / Royalty-Free",
      source: net?.url ? "network" : "local-fallback",
    };
  });

  return NextResponse.json({
    hour,
    hourEpoch,
    themeName: theme.name,
    wallpapers,
    updatedAt: now.toISOString(),
  });
}
