"use client";
import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Sparkles,
  Terminal,
  Wand2,
  Copy,
  Check,
  Loader2,
  ArrowRight,
  Key,
  Layers,
  Code2,
  Type,
  Globe,
  Download,
  Search,
  Radio,
  Maximize2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Eye,
  Paintbrush,
  Film,
  LayoutGrid,
  Clapperboard,
  PlayCircle,
} from "lucide-react";
import { ALL_CATEGORIES } from "../../../domain/entities/category.entity";
import { ClaudeMcpAdapter } from "../../../infrastructure/mcp/claude-mcp.adapter";
import { drawSortsecWatermarkOnContext } from "../../../infrastructure/image/watermark-exporter.adapter";
import {
  APPLE_SPRING_SNAPPY,
  APPLE_SPRING_FLUID,
  APPLE_SPRING_BOUNCY,
  appleModalBackdropVariants,
  appleModalCardVariants,
} from "../../motion/apple-motion";

const PRESET_PROMPTS = [
  {
    label: "Koenigsegg Jesko Carbon",
    prompt:
      "Exposed carbon fiber Koenigsegg Jesko Absolut hypercar on wet obsidian asphalt at twilight",
    category: "Cars",
    headline: "KOENIGSEGG JESKO",
    subtitle: "01 // CARBON ABSOLUT • 1600 HP TWIN-TURBO V8",
    badge: "HYPERCAR SERIES",
  },
  {
    label: "Dark Academia Library",
    prompt:
      "Ancient candlelit Oxford gothic library with towering mahogany bookshelves and leather manuscripts",
    category: "Dark Academia",
    headline: "OXFORD ARCHIVES",
    subtitle: "BODLEIAN MANUSCRIPT COLLECTION • EST. 1602",
    badge: "DARK ACADEMIA",
  },
  {
    label: "Zaha Hadid Pavilion",
    prompt:
      "Futuristic Zaha Hadid parametric white concrete museum curving over reflective water",
    category: "Architecture",
    headline: "PARAMETRIC FORM",
    subtitle: "FLUID ARCHITECTURAL MONOLITH • CURATED SPACE",
    badge: "ARCHITECTURE",
  },
  {
    label: "Neo-Tokyo Cyberpunk",
    prompt:
      "Rain-slicked Blade Runner Neo-Tokyo alley glowing with holographic kanji reflections at night",
    category: "Cyberpunk",
    headline: "NEO-TOKYO 2099",
    subtitle: "SECTOR 09 // CHROMATIC RAIN & NEON HORIZON",
    badge: "CYBERPUNK",
  },
  {
    label: "Michelin Gastronomy",
    prompt:
      "Michelin three-star molecular gastronomy plating on handmade matte black ceramic stoneware",
    category: "Food",
    headline: "L'ATELIER NOIR",
    subtitle: "THREE-STAR TASTING MENU • AUTUMN WINTER",
    badge: "GASTRONOMY",
  },
  {
    label: "Obsidian Black Panther",
    prompt:
      "Close-up editorial wildlife portrait of a melanistic black panther with piercing emerald eyes",
    category: "Animals",
    headline: "SHADOW PREDATOR",
    subtitle: "MELANISTIC JAGUAR • NOCTURNAL RAINFOREST STUDY",
    badge: "WILDLIFE",
  },
];

const ASPECT_RATIOS = [
  { id: "16:9", label: "16:9 4K UHD", w: 3840, h: 2160 },
  { id: "4:3", label: "4:3 4K Editorial", w: 3840, h: 2880 },
  { id: "1:1", label: "1:1 4K Square", w: 3840, h: 3840 },
  { id: "4:5", label: "4:5 4K Poster", w: 3072, h: 3840 },
];

const FONT_STYLES = [
  { id: "modern", label: "Canva Sans", family: "Inter, -apple-system, BlinkMacSystemFont, sans-serif" },
  { id: "editorial", label: "Editorial Serif", family: "Georgia, 'Times New Roman', serif" },
  { id: "mono", label: "Tech Mono", family: "'JetBrains Mono', 'SF Mono', Menlo, monospace" },
  { id: "outline", label: "Hollow Outline", family: "Inter, -apple-system, BlinkMacSystemFont, sans-serif", outline: true },
];

const TEXT_POSITIONS = [
  { id: "bottom", label: "Bottom Editorial" },
  { id: "center", label: "Center Poster" },
  { id: "top", label: "Top Magazine" },
  { id: "minimal", label: "Minimal Corner" },
];

const TEXT_COLORS = [
  { id: "#FFFFFF", label: "Pure White" },
  { id: "#FBBF24", label: "Champagne Gold" },
  { id: "#34D399", label: "Emerald Neon" },
  { id: "#F87171", label: "Crimson Accent" },
  { id: "#0A0A0A", label: "Obsidian Ink" },
];

const EXTERNAL_MCP_SERVERS = [
  {
    name: "Canva Official MCP",
    url: "https://mcp.canva.com/mcp",
    desc: "Canva Design & Typography Model Context Protocol endpoint",
  },
  {
    name: "Sortn Sec Local MCP",
    url: "http://localhost:3000/api/mcp",
    desc: "Built-in JSON-RPC 2.0 Image & Web Search MCP Server",
  },
  {
    name: "Figma Dev Mode MCP",
    url: "https://mcp.figma.com/mcp",
    desc: "Figma Design Context & Layout MCP endpoint",
  },
];

const MOOD_CARDS = [
  {
    id: "airy-minimalist",
    title: "Airy Minimalist",
    image: "/samples/ceramic_vase_still_life.jpg",
    prompt: "Sunlit airy minimalist ceramic still life with warm morning shadows and clean linen",
    category: "Minimalist",
    headline: "AIRY MINIMALIST",
    subtitle: "SUNLIT EDITORIAL STILL LIFE • 4K UHD",
    badge: "MOOD • MINIMALIST",
  },
  {
    id: "night-lights",
    title: "Night Lights",
    image: "/samples/blade_runner_neo_tokyo.jpg",
    prompt: "Rain-slicked Neo-Tokyo street at midnight with neon reflections and cinematic bokeh",
    category: "Cyberpunk",
    headline: "NIGHT LIGHTS",
    subtitle: "RAIN & CHROMATIC REFLECTIONS • 4K UHD",
    badge: "MOOD • NIGHT",
  },
  {
    id: "carbon-hypercar",
    title: "Carbon Hypercar",
    image: "/samples/cars_koenigsegg_jesko_1.jpg",
    prompt: "Exposed carbon fiber Koenigsegg Jesko Absolut hypercar on wet obsidian asphalt at twilight",
    category: "Cars",
    headline: "CARBON ABSOLUT",
    subtitle: "KOENIGSEGG HYPERCAR SERIES • 4K UHD",
    badge: "MOOD • HYPERCAR",
  },
  {
    id: "dark-academia",
    title: "Dark Academia",
    image: "/samples/candlelit_desk_study.jpg",
    prompt: "Candlelit Oxford gothic desk study with vintage leather manuscripts and warm brass glow",
    category: "Dark Academia",
    headline: "OXFORD STUDY",
    subtitle: "MANUSCRIPT ARCHIVE • 4K UHD",
    badge: "MOOD • ACADEMIA",
  },
  {
    id: "alpine-horizon",
    title: "Alpine Horizon",
    image: "/samples/dolomites_mountain_lake.jpg",
    prompt: "Dramatic Dolomites emerald mountain lake at golden hour with crisp alpine reflections",
    category: "Nature",
    headline: "ALPINE HORIZON",
    subtitle: "DOLOMITES GOLDEN HOUR • 4K UHD",
    badge: "MOOD • NATURE",
  },
];

const COLLAGE_TEMPLATES = [
  {
    id: "oval-arch",
    title: "Oval Arch Frame",
    aspect: "4:5",
    image: "/samples/dolomites_mountain_lake.jpg",
    shapeClass: "rounded-full",
    headline: "ARCH EDITION",
    badge: "4:5 ARCH",
  },
  {
    id: "editorial-split",
    title: "Editorial Cinema",
    aspect: "16:9",
    image: "/samples/cinematic_portrait_woman.jpg",
    shapeClass: "rounded-2xl",
    headline: "CINEMA FRAME",
    badge: "16:9 WIDESCREEN",
  },
  {
    id: "square-gallery",
    title: "Minimal Square",
    aspect: "1:1",
    image: "/samples/brutalist_facade.jpg",
    shapeClass: "rounded-3xl",
    headline: "MONOLITH 01",
    badge: "1:1 SQUARE",
  },
];

export function McpConnectModal({
  isOpen,
  onClose,
  claudeApiKey,
  onSaveClaudeKey,
  onImageGenerated,
}) {
  const mcpAdapter = useMemo(() => new ClaudeMcpAdapter(), []);

  const [activeTab, setActiveTab] = useState("hub");
  const [filmStock, setFilmStock] = useState("true-color");
  const [sheetView, setSheetView] = useState("contact-sheet");
  const [stillsFilter, setStillsFilter] = useState("favorites");
  const [anchors, setAnchors] = useState([
    "akash.",
    "Kozhikode, IN",
    "Valentine's Day",
    "Hasselblad 907X",
  ]);
  const [countdown, setCountdown] = useState({
    days: 54,
    hours: 14,
    mins: 28,
    secs: 38,
  });

  const handleImageErrorFallback = useCallback((e, fallbackSrc) => {
    const img = e?.currentTarget;
    if (!img) return;
    img.onerror = null;
    img.src = fallbackSrc;
  }, []);

  // Real-time 1-Hour Rotating Copyright-Free Modern Aesthetic Wallpapers (Online Network + Offline Time-Sync Fallback)
  const [timelyWallpapers, setTimelyWallpapers] = useState([
    "/samples/bioluminescent_beach_waves.jpg",
    "/samples/dolomites_mountain_lake.jpg",
    "/samples/cinematic_portrait_woman.jpg",
    "/samples/candlelit_desk_study.jpg",
  ]);
  const [timelyThemeLabel, setTimelyThemeLabel] = useState("Hourly Cinema Sync");
  const [timelySourceMode, setTimelySourceMode] = useState("sync");
  const [minsToNextHour, setMinsToNextHour] = useState(60);
  const lastFetchedHourRef = useRef(-1);

  const getOfflineTimeTheme = useCallback((hour) => {
    if (hour >= 5 && hour <= 7) {
      return {
        label: "Dawn First Light",
        images: [
          "/samples/dolomites_mountain_lake.jpg",
          "/samples/ceramic_vase_still_life.jpg",
          "/samples/bioluminescent_beach_waves.jpg",
          "/samples/brutalist_facade.jpg",
        ],
      };
    }
    if (hour >= 8 && hour <= 11) {
      return {
        label: "Morning Minimalist",
        images: [
          "/samples/brutalist_facade.jpg",
          "/samples/ceramic_vase_still_life.jpg",
          "/samples/dolomites_mountain_lake.jpg",
          "/samples/calatrava_sculptural_bridge.jpg",
        ],
      };
    }
    if (hour >= 12 && hour <= 15) {
      return {
        label: "Solar Zenith Editorial",
        images: [
          "/samples/cars_koenigsegg_jesko_1.jpg",
          "/samples/calatrava_sculptural_bridge.jpg",
          "/samples/dolomites_mountain_lake.jpg",
          "/samples/brutalist_facade.jpg",
        ],
      };
    }
    if (hour >= 16 && hour <= 18) {
      return {
        label: "Golden Twilight",
        images: [
          "/samples/dolomites_mountain_lake.jpg",
          "/samples/cinematic_portrait_woman.jpg",
          "/samples/cars_koenigsegg_jesko_1.jpg",
          "/samples/bioluminescent_beach_waves.jpg",
        ],
      };
    }
    if (hour >= 19 && hour <= 22) {
      return {
        label: "Nocturne Cinema",
        images: [
          "/samples/blade_runner_neo_tokyo.jpg",
          "/samples/cars_koenigsegg_jesko_1.jpg",
          "/samples/cinematic_portrait_woman.jpg",
          "/samples/candlelit_desk_study.jpg",
        ],
      };
    }
    return {
      label: "Midnight Obsidian & Aurora",
      images: [
        "/samples/bioluminescent_beach_waves.jpg",
        "/samples/blade_runner_neo_tokyo.jpg",
        "/samples/cars_koenigsegg_jesko_1.jpg",
        "/samples/candlelit_desk_study.jpg",
      ],
    };
  }, []);

  const refreshTimelyWallpapers = useCallback(
    async (force = false) => {
      const now = new Date();
      const currentHour = now.getHours();
      const hourBucket = Math.floor(Date.now() / 3600000);
      setMinsToNextHour(Math.max(1, 60 - now.getMinutes()));

      if (!force && lastFetchedHourRef.current === hourBucket) return;
      lastFetchedHourRef.current = hourBucket;

      const offlineTheme = getOfflineTimeTheme(currentHour);
      setTimelyThemeLabel(offlineTheme.label);

      if (typeof navigator !== "undefined" && !navigator.onLine) {
        setTimelyWallpapers(offlineTheme.images);
        setTimelySourceMode("offline-time-sync");
        return;
      }

      try {
        const resp = await fetch(`/api/wallpaper?hour=${currentHour}`);
        if (!resp.ok) throw new Error("Wallpaper fetch failed");
        const data = await resp.json();
        if (Array.isArray(data?.wallpapers) && data.wallpapers.length >= 4) {
          setTimelyWallpapers(data.wallpapers.map((w) => w.url));
          setTimelyThemeLabel(data.themeName || offlineTheme.label);
          const hasNet = data.wallpapers.some((w) => w.source === "network");
          setTimelySourceMode(hasNet ? "network-cc0" : "offline-time-sync");
        } else {
          setTimelyWallpapers(offlineTheme.images);
          setTimelySourceMode("offline-time-sync");
        }
      } catch {
        setTimelyWallpapers(offlineTheme.images);
        setTimelySourceMode("offline-time-sync");
      }
    },
    [getOfflineTimeTheme]
  );

  useEffect(() => {
    if (!isOpen) return;
    refreshTimelyWallpapers(false);

    // Check every 30s so the exact top-of-hour change triggers immediately
    const hourlyWatcher = setInterval(() => {
      refreshTimelyWallpapers(false);
    }, 30000);

    const handleOnline = () => refreshTimelyWallpapers(true);
    window.addEventListener("online", handleOnline);

    return () => {
      clearInterval(hourlyWatcher);
      window.removeEventListener("online", handleOnline);
    };
  }, [isOpen, refreshTimelyWallpapers]);

  useEffect(() => {
    if (!isOpen || activeTab !== "hub") return;
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev.secs > 0) return { ...prev, secs: prev.secs - 1 };
        if (prev.mins > 0) return { ...prev, mins: prev.mins - 1, secs: 59 };
        if (prev.hours > 0)
          return { ...prev, hours: prev.hours - 1, mins: 59, secs: 59 };
        return {
          days: Math.max(0, prev.days - 1),
          hours: 23,
          mins: 59,
          secs: 59,
        };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen, activeTab]);
  const [prompt, setPrompt] = useState(PRESET_PROMPTS[0].prompt);
  const [categoryHint, setCategoryHint] = useState("Cars");
  const [aspectRatio, setAspectRatio] = useState("16:9");
  const [modelProvider, setModelProvider] = useState("gemini-nano-banana");
  const [syncPromptToCanvasType, setSyncPromptToCanvasType] = useState(true);

  // Live Canva-style Typography State
  const [enableCanvaType, setEnableCanvaType] = useState(true);
  const [isTypeDrawerOpen, setIsTypeDrawerOpen] = useState(false);
  const [showKeyPopover, setShowKeyPopover] = useState(true);
  const [headlineText, setHeadlineText] = useState(PRESET_PROMPTS[0].headline);
  const [subtitleText, setSubtitleText] = useState(PRESET_PROMPTS[0].subtitle);
  const [badgeText, setBadgeText] = useState(PRESET_PROMPTS[0].badge);
  const [fontStyle, setFontStyle] = useState("modern");
  const [textPosition, setTextPosition] = useState("bottom");
  const [textColor, setTextColor] = useState("#FFFFFF");
  const [scrimIntensity, setScrimIntensity] = useState(0.55);

  // Generation, ChatGPT-Style Progressive Reveal & 4K Timer State
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRevealing4K, setIsRevealing4K] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [lastCreationSeconds, setLastCreationSeconds] = useState("2.8");
  const [generationProgress, setGenerationProgress] = useState(0);
  const [mcpStatus, setMcpStatus] = useState("connecting");
  const [generatedResult, setGeneratedResult] = useState(null);
  const [baseImageEl, setBaseImageEl] = useState(null);
  const canvasRef = useRef(null);
  const canvasStageRef = useRef(null);
  const genStartRef = useRef(0);

  // Fullscreen Client Perspective & Zoom Inspection State for Claude / Canva Generated Images
  const [isFullscreenPreview, setIsFullscreenPreview] = useState(false);
  const [previewDataUrl, setPreviewDataUrl] = useState("");
  const [previewZoom, setPreviewZoom] = useState(1);
  const [previewPan, setPreviewPan] = useState({ x: 0, y: 0 });
  const [isPanningPreview, setIsPanningPreview] = useState(false);
  const [isLoupeActive, setIsLoupeActive] = useState(false);
  const [loupeCoords, setLoupeCoords] = useState({
    visible: false,
    xPct: 50,
    yPct: 50,
    pxX: 0,
    pxY: 0,
  });
  const panOriginRef = useRef({ x: 0, y: 0, panX: 0, panY: 0 });
  const fullscreenStageRef = useRef(null);

  const openClientFullscreenView = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    renderCanvaComposite();
    setPreviewDataUrl(canvas.toDataURL("image/jpeg", 0.96));
    setPreviewZoom(1);
    setPreviewPan({ x: 0, y: 0 });
    setIsFullscreenPreview(true);
  };

  const setClampedPreviewZoom = (val) => {
    const next = Math.max(1, Math.min(4, Number(val.toFixed(2))));
    setPreviewZoom(next);
    if (next <= 1) {
      setPreviewPan({ x: 0, y: 0 });
    }
  };

  // Live Web Photo Search MCP Tab State
  const [webSearchQuery, setWebSearchQuery] = useState("Koenigsegg Jesko");
  const [isSearchingWeb, setIsSearchingWeb] = useState(false);
  const [isLoadingMoreWeb, setIsLoadingMoreWeb] = useState(false);
  const [webPhotoOffset, setWebPhotoOffset] = useState(0);
  const [hasMoreWebPhotos, setHasMoreWebPhotos] = useState(true);
  const [showAllWebTopics, setShowAllWebTopics] = useState(false);
  const [webPhotos, setWebPhotos] = useState([]);
  const [loadingWebPhotoId, setLoadingWebPhotoId] = useState(null);

  // External Web MCP Connector Tab State
  const [externalMcpUrl, setExternalMcpUrl] = useState("https://mcp.canva.com/mcp");
  const [externalBearer, setExternalBearer] = useState("");
  const [isProbingMcp, setIsProbingMcp] = useState(false);
  const [probeResponse, setProbeResponse] = useState(null);

  // Trace & Config State
  const [rpcTrace, setRpcTrace] = useState(null);
  const [showTrace, setShowTrace] = useState(false);
  const [copiedConfig, setCopiedConfig] = useState(false);
  const [keyInput, setKeyInput] = useState(claudeApiKey || "");

  // Reset to Google Photos-style "Create" hub whenever reopened
  useEffect(() => {
    if (isOpen) {
      setActiveTab("hub");
    }
  }, [isOpen]);

  const handleLaunchStudioPreset = ({
    nextPrompt,
    nextCategory,
    nextHeadline,
    nextSubtitle,
    nextBadge,
    nextAspect = "16:9",
    autoGenerate = false,
  }) => {
    if (nextPrompt) setPrompt(nextPrompt);
    if (nextCategory) setCategoryHint(nextCategory);
    if (nextHeadline) setHeadlineText(nextHeadline);
    if (nextSubtitle) setSubtitleText(nextSubtitle);
    if (nextBadge) setBadgeText(nextBadge);
    if (nextAspect) setAspectRatio(nextAspect);
    setActiveTab("studio");
    if (autoGenerate && nextPrompt) {
      setTimeout(() => {
        handleGenerate();
      }, 150);
    }
  };
  const [geminiKeyInput, setGeminiKeyInput] = useState("");
  const [openaiKeyInput, setOpenaiKeyInput] = useState("");
  const [savedKeyNotice, setSavedKeyNotice] = useState("");

  useEffect(() => {
    setKeyInput(claudeApiKey || "");
    try {
      const savedGem = localStorage.getItem("sortn-sec-gemini-key") || "";
      const savedOai = localStorage.getItem("sortn-sec-openai-key") || "";
      if (savedOai.trim().startsWith("sk-")) {
        setOpenaiKeyInput(savedOai.trim());
        setModelProvider("chatgpt-image");
      } else if (
        savedGem.trim().startsWith("sk-") &&
        !savedGem.trim().startsWith("sk-ant")
      ) {
        // User pasted an OpenAI sk-... key into the Gemini slot earlier — auto-migrate it to OpenAI!
        setOpenaiKeyInput(savedGem.trim());
        localStorage.setItem("sortn-sec-openai-key", savedGem.trim());
        setModelProvider("chatgpt-image");
      } else {
        setOpenaiKeyInput(savedOai);
      }
      if (!savedGem.trim().startsWith("sk-")) {
        setGeminiKeyInput(savedGem);
      }
    } catch (e) {}
  }, [claudeApiKey, isOpen]);

  const handleSaveAllProviderKeys = () => {
    onSaveClaudeKey(keyInput.trim());
    try {
      if (geminiKeyInput.trim()) {
        localStorage.setItem("sortn-sec-gemini-key", geminiKeyInput.trim());
      }
      localStorage.setItem("sortn-sec-openai-key", openaiKeyInput.trim());
      setSavedKeyNotice("Saved API keys for Gemini Nano Banana, ChatGPT & Claude!");
      setTimeout(() => setSavedKeyNotice(""), 3200);
    } catch (e) {}
  };

  // Perform MCP JSON-RPC `initialize` handshake when modal opens
  useEffect(() => {
    if (!isOpen) return;
    let active = true;
    setMcpStatus("connecting");
    mcpAdapter
      .initializeSession()
      .then((handshake) => {
        if (!active) return;
        setMcpStatus("connected");
        setRpcTrace((prev) => prev || handshake);
      })
      .catch(() => {
        if (!active) return;
        setMcpStatus("connected");
      });
    return () => {
      active = false;
    };
  }, [isOpen, mcpAdapter]);

  // Load initial default preview image into the interactive Canva canvas when opened
  useEffect(() => {
    if (!isOpen || baseImageEl) return;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      setBaseImageEl(img);
      setGeneratedResult((prev) =>
        prev || {
          previewUrl: "/samples/cars_koenigsegg_jesko_1.jpg",
          source: "studio-ready",
          meta: {
            directorEngine: "AI MCP × Canva Live Typography Studio",
            originalPrompt: PRESET_PROMPTS[0].prompt,
            enhancedPrompt:
              "Exposed carbon fiber Koenigsegg Jesko Absolut hypercar, shot on Hasselblad 80mm f/1.9, ready for real-time Canva typography.",
            seed: 884920,
          },
        }
      );
    };
    img.src = "/samples/cars_koenigsegg_jesko_1.jpg";
  }, [isOpen, baseImageEl]);

  // Whenever generatedResult.previewUrl changes, load it into an HTMLImageElement for the live Canvas
  useEffect(() => {
    if (!generatedResult?.previewUrl) return;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      setBaseImageEl(img);
    };
    img.src = generatedResult.previewUrl;
  }, [generatedResult?.previewUrl]);

  // Real-time Canva Typography & Graphic Compositor on HTML5 <canvas> (True 4K UHD 3840px Container-Bounded Cover Format)
  const renderCanvaComposite = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !baseImageEl) return;

    // Render at true 4K UHD (3840px width) while matching the container's exact proportions for 100% cover format
    const stageEl = canvasStageRef.current;
    const rectW = stageEl?.clientWidth || 0;
    const rectH = stageEl?.clientHeight || 0;
    const width = 3840;
    const height =
      rectW > 0 && rectH > 0
        ? Math.round((width * rectH) / rectW)
        : 2160;

    if (canvas.width !== width) canvas.width = width;
    if (canvas.height !== height) canvas.height = height;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.clearRect(0, 0, width, height);

    // 1. Center-crop 4K UHD COVER draw of base image (fills 100% of container with zero letterbox bars)
    const imgW = baseImageEl.naturalWidth || baseImageEl.width || width;
    const imgH = baseImageEl.naturalHeight || baseImageEl.height || height;
    const scale = Math.max(width / imgW, height / imgH);
    const sw = width / scale;
    const sh = height / scale;
    const sx = (imgW - sw) / 2;
    const sy = (imgH - sh) / 2;

    ctx.drawImage(baseImageEl, sx, sy, sw, sh, 0, 0, width, height);

    if (!enableCanvaType) {
      drawSortsecWatermarkOnContext(ctx, width, height, "bottom-right");
      return;
    }

    // 2. Scrim gradient for typography legibility
    if (scrimIntensity > 0) {
      const grad = ctx.createLinearGradient(0, 0, 0, height);
      if (textPosition === "top") {
        grad.addColorStop(0, `rgba(0,0,0,${scrimIntensity * 1.15})`);
        grad.addColorStop(0.55, "rgba(0,0,0,0.1)");
        grad.addColorStop(1, "rgba(0,0,0,0.35)");
      } else if (textPosition === "center") {
        grad.addColorStop(0, `rgba(0,0,0,${scrimIntensity * 0.65})`);
        grad.addColorStop(0.5, `rgba(0,0,0,${scrimIntensity})`);
        grad.addColorStop(1, `rgba(0,0,0,${scrimIntensity * 0.75})`);
      } else {
        grad.addColorStop(0, "rgba(0,0,0,0.12)");
        grad.addColorStop(0.45, "rgba(0,0,0,0.18)");
        grad.addColorStop(1, `rgba(0,0,0,${scrimIntensity * 1.25})`);
      }
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);
    }

    const fontSpec =
      FONT_STYLES.find((f) => f.id === fontStyle) || FONT_STYLES[0];
    const padX = Math.round(width * 0.065);
    const padY = Math.round(height * 0.08);

    ctx.save();

    // Calculate anchor coordinates based on textPosition
    let anchorX = padX;
    let headlineY = height - padY - 38;
    let subtitleY = height - padY;
    let badgeY = height - padY - 125;

    if (textPosition === "center") {
      ctx.textAlign = "center";
      anchorX = width / 2;
      headlineY = height / 2 + 12;
      subtitleY = height / 2 + 56;
      badgeY = height / 2 - 72;
    } else if (textPosition === "top") {
      ctx.textAlign = "left";
      anchorX = padX;
      badgeY = padY;
      headlineY = padY + 86;
      subtitleY = padY + 124;
    } else if (textPosition === "minimal") {
      ctx.textAlign = "right";
      anchorX = width - padX;
      badgeY = height - padY - 96;
      headlineY = height - padY - 30;
      subtitleY = height - padY;
    } else {
      ctx.textAlign = "left";
    }

    // 3. Draw Badge Pill
    if (badgeText && badgeText.trim()) {
      const cleanBadge = badgeText.trim().toUpperCase();
      ctx.font = `600 ${Math.round(width * 0.014)}px 'JetBrains Mono', monospace`;
      const metrics = ctx.measureText(cleanBadge);
      const pillW = metrics.width + 28;
      const pillH = Math.round(width * 0.026);
      let pillX = anchorX;
      if (textPosition === "center") pillX = anchorX - pillW / 2;
      if (textPosition === "minimal") pillX = anchorX - pillW;

      ctx.fillStyle = "rgba(255, 255, 255, 0.16)";
      ctx.strokeStyle = "rgba(255, 255, 255, 0.45)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(pillX, badgeY - pillH + 6, pillW, pillH, pillH / 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = textColor;
      ctx.fillText(
        cleanBadge,
        textPosition === "center"
          ? anchorX
          : textPosition === "minimal"
          ? anchorX - 14
          : pillX + 14,
        badgeY
      );
    }

    // 4. Draw Main Headline Text (with automatic multi-line wrapping so long client prompts fit 100% inside the picture)
    if (headlineText && headlineText.trim()) {
      const rawHeadline = headlineText.trim();
      const maxWidth = width - padX * 2;
      const baseFontSize =
        textPosition === "minimal"
          ? Math.round(width * 0.038)
          : rawHeadline.length > 28
          ? Math.round(width * 0.042)
          : Math.round(width * 0.054);

      ctx.font = `800 ${baseFontSize}px ${fontSpec.family}`;
      ctx.shadowColor = "rgba(0,0,0,0.55)";
      ctx.shadowBlur = 18;
      ctx.shadowOffsetY = 4;

      // Word-wrap into up to 2 lines if wider than canvas
      const words = rawHeadline.split(/\s+/);
      const lines = [];
      let currentLine = "";
      for (const word of words) {
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        if (ctx.measureText(testLine).width > maxWidth && currentLine) {
          lines.push(currentLine);
          currentLine = word;
        } else {
          currentLine = testLine;
        }
      }
      if (currentLine) lines.push(currentLine);
      const visibleLines = lines.slice(0, 2);
      const lineHeight = Math.round(baseFontSize * 1.12);

      visibleLines.forEach((line, idx) => {
        const lineY =
          headlineY - (visibleLines.length - 1 - idx) * lineHeight;
        if (fontSpec.outline) {
          ctx.strokeStyle = textColor;
          ctx.lineWidth = 2.6;
          ctx.strokeText(line, anchorX, lineY);
        } else {
          ctx.fillStyle = textColor;
          ctx.fillText(line, anchorX, lineY);
        }
      });
    }

    // 5. Draw Subtitle / Spec Line
    if (subtitleText && subtitleText.trim()) {
      const subSize = Math.round(width * 0.016);
      ctx.font = `500 ${subSize}px 'JetBrains Mono', monospace`;
      ctx.shadowBlur = 8;
      ctx.fillStyle =
        textColor === "#0A0A0A"
          ? "rgba(10,10,10,0.78)"
          : "rgba(255,255,255,0.82)";
      ctx.fillText(subtitleText.trim(), anchorX, subtitleY);
    }

    ctx.restore();

    // Always stamp the official sortnsec.ai watermark on every canvas render & download
    drawSortsecWatermarkOnContext(
      ctx,
      width,
      height,
      textPosition === "minimal" ? "top-right" : "bottom-right"
    );
  }, [
    baseImageEl,
    aspectRatio,
    enableCanvaType,
    headlineText,
    subtitleText,
    badgeText,
    fontStyle,
    textPosition,
    textColor,
    scrimIntensity,
  ]);

  useEffect(() => {
    renderCanvaComposite();
  }, [renderCanvaComposite]);

  // Live 50ms precision timer during ChatGPT-style 4K image creation
  useEffect(() => {
    if (!isGenerating) return;
    genStartRef.current = performance.now();
    setElapsedSeconds(0);
    setGenerationProgress(4);

    const interval = setInterval(() => {
      const elapsed = (performance.now() - genStartRef.current) / 1000;
      setElapsedSeconds(elapsed);
      // Smooth asymptotic progress curve up to 96% while awaiting 4K synthesis
      const nextProg = Math.min(96, Math.round(100 * (1 - Math.exp(-elapsed / 1.4))));
      setGenerationProgress(nextProg);
    }, 60);

    return () => clearInterval(interval);
  }, [isGenerating]);

  const handleGenerate = async (e) => {
    if (e) e.preventDefault();
    if (!prompt.trim() || isGenerating) return;

    const startPerf = performance.now();
    setIsGenerating(true);
    setIsRevealing4K(false);

    try {
      const mcpPromise = mcpAdapter.generateImageViaMcp({
        prompt: prompt.trim(),
        categoryHint,
        aspectRatio,
        modelProvider,
        claudeApiKey: keyInput.trim(),
        geminiApiKey: geminiKeyInput.trim(),
        openaiApiKey: openaiKeyInput.trim(),
      });

      // Ensure at least 2.4s so the ChatGPT-style diffusion shimmer & live timer stages are visible
      const minVisualDelay = new Promise((resolve) => setTimeout(resolve, 2400));
      const [res] = await Promise.all([mcpPromise, minVisualDelay]);

      const totalSec = ((performance.now() - startPerf) / 1000).toFixed(1);
      setLastCreationSeconds(totalSec);
      setGenerationProgress(100);
      setGeneratedResult(res);
      setRpcTrace({
        rpcRequest: res.rpcRequest,
        rpcResponse: res.rpcResponse,
      });

      // Trigger ChatGPT-style top-to-bottom progressive 4K de-blur reveal
      setIsGenerating(false);
      setIsRevealing4K(true);
      setTimeout(() => {
        setIsRevealing4K(false);
      }, 1350);
    } catch (err) {
      console.error("[Claude MCP] Generation error:", err);
      setIsGenerating(false);
    }
  };

  // Export live 4K UHD Canva-composited <canvas> as a real JPEG File and absorb into Sortn Sec
  const handleAbsorbCanvasIntoGallery = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    renderCanvaComposite();
    const slug = (headlineText || prompt || "canva_mcp_design")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "")
      .slice(0, 28);
    const fileName = `canva_mcp_4k_${slug}_${Date.now().toString().slice(-5)}.jpg`;

    const dataUrl = canvas.toDataURL("image/jpeg", 0.97);
    const parts = dataUrl.split(",");
    const byteString = atob(parts[1] || "");
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    const blob = new Blob([ab], { type: "image/jpeg" });
    const file = new File([blob], fileName, {
      type: "image/jpeg",
      lastModified: Date.now(),
    });

    onClose();
    onImageGenerated(file);
  };

  const handleDownloadCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    renderCanvaComposite();
    const link = document.createElement("a");
    const slug = (headlineText || "canva_mcp_poster")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")
      .slice(0, 24);
    link.download = `${slug}_4k_sortnsec.jpg`;
    link.href = canvas.toDataURL("image/jpeg", 0.97);
    link.click();
  };

  // Search Real Web Photos via Wikimedia Commons MCP Tool
  const runWebPhotoQuery = async (queryText) => {
    const cleanQ = (queryText || webSearchQuery).trim();
    if (!cleanQ || isSearchingWeb) return;
    setIsSearchingWeb(true);
    setWebPhotoOffset(0);
    setHasMoreWebPhotos(true);
    try {
      const { photos, rpcRequest, rpcResponse } =
        await mcpAdapter.searchWebPhotosViaMcp({
          query: cleanQ,
          limit: 6,
          offset: 0,
        });
      setWebPhotos(photos);
      setWebPhotoOffset(photos.length || 6);
      setHasMoreWebPhotos(true);
      setRpcTrace({ rpcRequest, rpcResponse });
    } catch (err) {
      console.error("[Web MCP Search] Error:", err);
    } finally {
      setIsSearchingWeb(false);
    }
  };

  const handleWebPhotoSearch = async (e) => {
    if (e) e.preventDefault();
    await runWebPhotoQuery(webSearchQuery);
  };

  // Show More Web Photos (fetches next batch via MCP offset + curated fallback if needed)
  const handleLoadMoreWebPhotos = async () => {
    if (isLoadingMoreWeb || isSearchingWeb) return;
    setIsLoadingMoreWeb(true);
    try {
      const nextOffset = webPhotoOffset || webPhotos.length || 6;
      const { photos, rpcRequest, rpcResponse } =
        await mcpAdapter.searchWebPhotosViaMcp({
          query: webSearchQuery.trim() || "Koenigsegg Jesko",
          limit: 6,
          offset: nextOffset,
        });

      setRpcTrace({ rpcRequest, rpcResponse });

      const existingIds = new Set(webPhotos.map((p) => String(p.pageId)));
      let freshPhotos = (photos || []).filter(
        (p) => !existingIds.has(String(p.pageId))
      );

      // If remote returned fewer than 3 new photos, supplement from local high-res manifest so Show More always delivers fresh photos
      if (freshPhotos.length < 3) {
        try {
          const mRes = await fetch("/samples/manifest.json");
          if (mRes.ok) {
            const manifest = await mRes.json();
            const extra = manifest
              .filter((item) => !existingIds.has(`local-${item.id}`))
              .slice(0, 6 - freshPhotos.length)
              .map((item) => ({
                pageId: `local-${item.id}`,
                title: item.name
                  .replace(/\.[a-z0-9]+$/i, "")
                  .replace(/[_-]+/g, " "),
                thumbUrl: item.path,
                originalUrl: item.path,
                imageDataUrl: item.path,
                width: 1280,
                height: 800,
              }));
            freshPhotos = [...freshPhotos, ...extra];
          }
        } catch (e) {}
      }

      if (freshPhotos.length === 0) {
        setHasMoreWebPhotos(false);
      } else {
        setWebPhotos((prev) => [...prev, ...freshPhotos]);
        setWebPhotoOffset(nextOffset + 6);
      }
    } catch (err) {
      console.error("[Web MCP Show More] Error:", err);
    } finally {
      setIsLoadingMoreWeb(false);
    }
  };

  const handleLoadWebPhotoIntoCanva = async (photo) => {
    setLoadingWebPhotoId(photo.pageId);
    try {
      let dataUrl = photo.imageDataUrl;
      if (!dataUrl) {
        dataUrl = await mcpAdapter.fetchRemoteImageDataViaMcp(photo.thumbUrl);
      }
      if (dataUrl) {
        setGeneratedResult({
          previewUrl: dataUrl,
          source: "web-mcp",
          meta: {
            directorEngine: "Wikimedia Commons Live Web MCP",
            originalPrompt: photo.title,
            enhancedPrompt: `Real Web Photograph: "${photo.title}" (${photo.width}×${photo.height}) fetched via Sortn Sec Web MCP`,
            seed: photo.pageId,
          },
        });
        setHeadlineText(photo.title.slice(0, 22).toUpperCase());
        setSubtitleText(`LIVE WEB MCP // ${photo.width}×${photo.height} PX`);
        setBadgeText("WEB MCP PHOTO");
        setEnableCanvaType(true);
        setActiveTab("studio");
      }
    } finally {
      setLoadingWebPhotoId(null);
    }
  };

  const handleProbeExternalMcp = async (urlToProbe = externalMcpUrl) => {
    setIsProbingMcp(true);
    try {
      const { result, rpcRequest, rpcResponse } =
        await mcpAdapter.probeExternalMcpServer({
          endpointUrl: urlToProbe,
          rpcMethod: "initialize",
          bearerToken: externalBearer,
        });
      setProbeResponse(result);
      setRpcTrace({ rpcRequest, rpcResponse });
    } finally {
      setIsProbingMcp(false);
    }
  };

  const claudeDesktopConfigJson = useMemo(() => {
    const origin =
      typeof window !== "undefined"
        ? window.location.origin
        : "http://localhost:3000";
    return JSON.stringify(
      {
        mcpServers: {
          "sortn-sec-universal-mcp": {
            url: `${origin}/api/mcp`,
            transport: "http-jsonrpc",
            tools: [
              "generate_aesthetic_image",
              "search_real_web_photos",
              "proxy_external_web_mcp",
              "list_sortnsec_categories",
            ],
          },
          "canva-mcp": {
            url: "https://mcp.canva.com/mcp",
            transport: "http-jsonrpc",
          },
        },
      },
      null,
      2
    );
  }, []);

  const handleCopyConfig = () => {
    navigator.clipboard?.writeText(claudeDesktopConfigJson);
    setCopiedConfig(true);
    setTimeout(() => setCopiedConfig(false), 2200);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 sm:pt-24 pb-4 px-3 sm:px-6 select-none overflow-y-auto">
      {/* Clean White Backdrop in Light Mode / Deep Black in Dark Mode */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.18 }}
        onClick={onClose}
        className="fixed inset-0 bg-white/95 dark:bg-black/85 backdrop-blur-xl"
      />

      {/* Expansive Studio Workspace Dialog (Strictly Below Navbar with Elevated Depth Shadow) */}
      <motion.div
        initial={{ opacity: 0, scale: 0.97, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={APPLE_SPRING_FLUID}
        className="gpu-120hz relative z-10 w-full max-w-6xl min-h-[calc(100vh-8rem)] max-h-[calc(100vh-6.75rem)] overflow-y-auto rounded-[32px] border border-black/10 dark:border-white/15 bg-white dark:bg-[#111111]/95 backdrop-blur-2xl shadow-[0_28px_90px_rgba(0,0,0,0.18),0_6px_24px_rgba(0,0,0,0.08)] dark:shadow-[0_32px_100px_rgba(0,0,0,0.88)] p-6 sm:p-8 space-y-6 text-black dark:text-white"
        role="dialog"
        aria-modal="true"
        aria-label="Claude & Canva Web MCP Studio"
      >
        {/* Top Specular Liquid Glass Rim */}
        <div className="pointer-events-none absolute inset-x-6 top-0 h-[1px] bg-gradient-to-r from-transparent via-black/10 dark:via-white/25 to-transparent" />

        {/* Compact Apple Header + Liquid Glass Segmented Pill Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-black/10 dark:border-white/10 pb-3.5">
          <div className="flex items-center gap-2.5">
            <motion.div
              initial={{ scale: 0.8, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              whileHover={{ scale: 1.08, rotate: 6 }}
              whileTap={{ scale: 0.92 }}
              transition={APPLE_SPRING_BOUNCY}
              className="liquid-glass-action w-9 h-9 rounded-2xl flex items-center justify-center"
            >
              <Paintbrush className="w-4 h-4 text-black dark:text-white" />
            </motion.div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-medium tracking-tight text-black dark:text-white">
                  Create
                </h3>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-mono uppercase tracking-wider bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 shadow-[inset_0_1px_0.5px_rgba(255,255,255,0.6)]">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>{mcpStatus === "connected" ? "Live" : "Sync"}</span>
                </span>
              </div>
              <p className="text-[10px] text-black/55 dark:text-white/55 font-mono">
                Moods • Collages • 4K AI Studio • Claude MCP
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Apple Golden Gate Liquid Glass 4-Tab Segmented Switcher */}
            <div className="liquid-glass-well flex items-center gap-1 p-1 rounded-full">
              {[
                { id: "hub", label: "Create", icon: Paintbrush },
                { id: "studio", label: "4K Studio", icon: Type },
                { id: "web-search", label: "Web Photos", icon: Globe },
                { id: "bridge", label: "MCP Hub", icon: Terminal },
              ].map((t) => {
                const Icon = t.icon;
                const isActive = activeTab === t.id;
                return (
                  <motion.button
                    key={t.id}
                    type="button"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.94 }}
                    transition={APPLE_SPRING_SNAPPY}
                    onClick={() => {
                      setActiveTab(t.id);
                      if (t.id === "web-search" && webPhotos.length === 0) {
                        handleWebPhotoSearch();
                      }
                    }}
                    className={`relative px-3.5 py-1.5 text-[11px] rounded-full transition-colors flex items-center gap-1.5 ${
                      isActive
                        ? "text-white dark:text-black font-semibold"
                        : "text-black/65 dark:text-white/65 hover:text-black dark:hover:text-white"
                    }`}
                  >
                    {isActive && (
                      <motion.span
                        layoutId="mcp-top-tab-liquid-pill"
                        transition={APPLE_SPRING_BOUNCY}
                        className="liquid-glass-active-pill absolute inset-0 rounded-full"
                      />
                    )}
                    <Icon className="relative z-10 w-3 h-3" />
                    <span className="relative z-10">{t.label}</span>
                  </motion.button>
                );
              })}
            </div>

            <motion.button
              type="button"
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.88 }}
              transition={APPLE_SPRING_BOUNCY}
              onClick={onClose}
              className="liquid-glass-action p-2 rounded-full text-black/75 dark:text-white/75 hover:text-black dark:hover:text-white"
              aria-label="Close Create studio"
            >
              <X className="w-4 h-4" />
            </motion.button>
          </div>
        </div>

            {/* TAB 0: PHOTOS & STILLS STUDIO ("CREATE" SCREEN) */}
            {activeTab === "hub" && (
              <motion.div
                key="create-hub-tab"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={APPLE_SPRING_FLUID}
                className="space-y-6 pb-2"
              >
                {/* Centered Cinema Studio Hero Header */}
                <div className="text-center space-y-2.5 pt-1">
                  <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-[10px] font-mono uppercase tracking-[0.18em] border border-black/10 dark:border-white/15 bg-black/[0.04] dark:bg-white/[0.05] text-black/70 dark:text-white/75">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>CINEMA STUDIO SUITE // RAW 14-BIT PRO • 65mm Master</span>
                  </div>

                  <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-black dark:text-white">
                    Photos &amp; Stills Studio
                  </h2>

                  <p className="text-xs sm:text-sm text-black/60 dark:text-white/60 max-w-xl mx-auto leading-relaxed">
                    Curate optical captures, compose tactile contact sheets, and
                    prepare sequences for motion synthesis in 65mm tone.
                  </p>

                  {/* Anchors Tag Bar */}
                  <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1.5">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-black/45 dark:text-white/45 mr-1">
                      ANCHORS
                    </span>
                    {anchors.map((anchor) => (
                      <span
                        key={anchor}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono border border-black/10 dark:border-white/15 bg-black/[0.04] dark:bg-white/[0.06] text-black/80 dark:text-white/85"
                      >
                        <button
                          type="button"
                          onClick={() =>
                            handleLaunchStudioPreset({
                              nextPrompt: `65mm cinema still inspired by ${anchor}`,
                              nextHeadline: anchor.toUpperCase(),
                              nextBadge: "CINEMA ANCHOR",
                            })
                          }
                          className="hover:underline"
                        >
                          {anchor}
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setAnchors((prev) =>
                              prev.filter((a) => a !== anchor)
                            )
                          }
                          className="text-black/45 dark:text-white/45 hover:text-black dark:hover:text-white"
                          aria-label={`Remove ${anchor}`}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                    <button
                      type="button"
                      onClick={() => {
                        const candidates = [
                          "Koenigsegg Jesko",
                          "Tokyo 2099",
                          "Leica M11",
                          "35mm Grain",
                        ];
                        const next = candidates.find(
                          (c) => !anchors.includes(c)
                        );
                        if (next) setAnchors((prev) => [...prev, next]);
                      }}
                      className="px-3 py-1 rounded-full text-[11px] font-mono border border-dashed border-black/20 dark:border-white/25 text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white transition-colors"
                    >
                      + Add Anchor
                    </button>
                  </div>
                </div>

                {/* Cinema Cut — Soon by Blue Rose Cinema Banner */}
                <div className="liquid-glass-card rounded-[26px] p-5 sm:p-6 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
                  <div className="space-y-2.5 max-w-2xl">
                    <h4 className="text-lg sm:text-xl font-semibold tracking-tight text-black dark:text-white">
                      Cinema Cut{" "}
                      <span className="font-normal text-black/50 dark:text-white/50">
                        — Soon by Blue Rose Cinema
                      </span>
                    </h4>
                    <p className="text-xs text-black/65 dark:text-white/65 leading-relaxed">
                      The next-generation motion synthesizer that brings your
                      photo memories into full 65mm optical cinema cuts.
                      Seamless focal length interpolation, authentic grain
                      rendering, and spatial ambient soundscapes derived
                      directly from camera metadata.
                    </p>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-1 text-[10px] font-mono text-black/55 dark:text-white/55">
                      <span>• Dual-Sensor Parallax</span>
                      <span>• 35mm &amp; 65mm Grain Emulation</span>
                      <span>• Spatial Audio Synthesizer</span>
                      <span>• 100% Non-Destructive</span>
                    </div>
                  </div>

                  <div className="flex flex-col items-stretch sm:items-end gap-3 shrink-0 w-full lg:w-auto">
                    {/* Countdown Pill Box */}
                    <div className="flex items-center justify-center gap-3 px-5 py-2.5 rounded-2xl border border-black/10 dark:border-white/15 bg-black/[0.04] dark:bg-black/40 font-mono text-center">
                      {[
                        { v: countdown.days, l: "DAYS", highlight: false },
                        { v: countdown.hours, l: "HOURS", highlight: false },
                        { v: countdown.mins, l: "MINS", highlight: false },
                        { v: countdown.secs, l: "SEC", highlight: true },
                      ].map((unit, idx) => (
                        <React.Fragment key={unit.l}>
                          {idx > 0 && (
                            <span className="text-black/30 dark:text-white/30 text-sm">
                              :
                            </span>
                          )}
                          <div>
                            <div
                              className={`text-sm sm:text-base font-semibold tabular-nums ${
                                unit.highlight
                                  ? "text-cyan-600 dark:text-cyan-400"
                                  : "text-black dark:text-white"
                              }`}
                            >
                              {String(unit.v).padStart(2, "0")}
                            </div>
                            <div className="text-[8px] tracking-widest text-black/45 dark:text-white/45">
                              {unit.l}
                            </div>
                          </div>
                        </React.Fragment>
                      ))}
                    </div>

                    {/* Watch 65mm Reel + Green & Blue Combination Join Private Alpha Button */}
                    <div className="flex flex-wrap items-center gap-2.5">
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.03, y: -1 }}
                        whileTap={{ scale: 0.95 }}
                        transition={APPLE_SPRING_SNAPPY}
                        onClick={() =>
                          handleLaunchStudioPreset({
                            nextPrompt:
                              "65mm anamorphic cinema reel frame with natural film grain and volumetric twilight",
                            nextHeadline: "65MM CINEMA REEL",
                            nextBadge: "65MM OPTICAL CUT",
                            nextAspect: "16:9",
                          })
                        }
                        className="liquid-glass-action flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium text-black dark:text-white"
                      >
                        <PlayCircle className="w-3.5 h-3.5 text-black/75 dark:text-white/80" />
                        <span>Watch 65mm Reel</span>
                      </motion.button>

                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.04, y: -1 }}
                        whileTap={{ scale: 0.94 }}
                        transition={APPLE_SPRING_BOUNCY}
                        onClick={() => setActiveTab("studio")}
                        className="flex items-center gap-1.5 px-5 py-2 rounded-full text-xs font-semibold text-white bg-gradient-to-r from-emerald-500 via-teal-500 to-blue-600 hover:from-emerald-400 hover:via-teal-400 hover:to-blue-500 border border-white/25 shadow-[0_10px_28px_rgba(16,185,129,0.35),0_4px_16px_rgba(37,99,235,0.35),inset_0_1px_1px_rgba(255,255,255,0.5)] transition-all"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Join Private Alpha</span>
                      </motion.button>
                    </div>
                  </div>
                </div>

                {/* Curated Stills & Capsule Framing Header + Film Stock Profile Switcher */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                  <div className="flex items-center gap-2.5">
                    <Eye className="w-4 h-4 text-black/70 dark:text-white/70" />
                    <h4 className="text-sm sm:text-base font-semibold tracking-tight text-black dark:text-white">
                      Curated Stills &amp; Capsule Framing
                    </h4>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono border border-black/10 dark:border-white/15 bg-black/[0.04] dark:bg-white/[0.06] text-black/60 dark:text-white/60">
                      {timelyThemeLabel} • {timelySourceMode === "network-cc0" ? "CC0 Network" : "Offline Time-Sync"} • 1h Auto ({minsToNextHour}m)
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[11px] font-mono text-black/50 dark:text-white/50">
                      Film Stock Profile:
                    </span>
                    <div className="liquid-glass-well flex items-center gap-1 p-1 rounded-full">
                      {[
                        { id: "true-color", label: "Natural Color 65mm" },
                        { id: "silver-halide-400", label: "Silver Halide 400" },
                        { id: "cinestill-800t", label: "CineStill 800T" },
                      ].map((stock) => {
                        const active = filmStock === stock.id;
                        return (
                          <button
                            key={stock.id}
                            type="button"
                            onClick={() => setFilmStock(stock.id)}
                            className={`relative px-3 py-1 rounded-full text-[10px] font-mono transition-colors ${
                              active
                                ? "text-white dark:text-black font-semibold"
                                : "text-black/65 dark:text-white/65 hover:text-black dark:hover:text-white"
                            }`}
                          >
                            {active && (
                              <motion.span
                                layoutId="cinema-film-stock-pill"
                                transition={APPLE_SPRING_BOUNCY}
                                className="liquid-glass-active-pill absolute inset-0 rounded-full"
                              />
                            )}
                            <span className="relative z-10">{stock.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* 3-Column Optical Bento Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                  {/* Left Column (4 Cols): Vertical Capsule Framing */}
                  <div className="lg:col-span-4 liquid-glass-card rounded-[26px] p-4 flex flex-col justify-between space-y-3.5">
                    <div className="flex items-center justify-between text-[10px] font-mono text-black/55 dark:text-white/55">
                      <span>Vertical Capsule Framing</span>
                      <span>RAW-ARCH // 01</span>
                    </div>

                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.015 }}
                      whileTap={{ scale: 0.98 }}
                      transition={APPLE_SPRING_SNAPPY}
                      onClick={() =>
                        handleLaunchStudioPreset({
                          nextPrompt:
                            "Deep ocean freediver framed in 65mm vertical optical capsule, turquoise shafts of sunlight",
                          nextCategory: "Nature",
                          nextHeadline: "DEEP OCEAN DRIFT",
                          nextSubtitle: "KOZHIKODE MARINE TRENCH • 65MM RAW",
                          nextBadge: "RAW-ARCH // 01",
                          nextAspect: "4:5",
                        })
                      }
                      className="group relative h-72 w-full rounded-[32px] overflow-hidden border border-black/15 dark:border-white/20 bg-black text-left"
                    >
                      <img
                        src={timelyWallpapers[0]}
                        alt="Deep Ocean Drift"
                        onError={(e) =>
                          handleImageErrorFallback(
                            e,
                            "/samples/bioluminescent_beach_waves.jpg"
                          )
                        }
                        className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105"
                      />
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
                      <div className="absolute bottom-4 left-4 right-4 text-white">
                        <div className="text-sm font-semibold tracking-tight">
                          Deep Ocean Drift
                        </div>
                        <div className="text-[10px] font-mono text-white/70">
                          Kozhikode Marine Trench
                        </div>
                      </div>
                    </motion.button>

                    <div className="grid grid-cols-2 gap-2 p-3 rounded-2xl border border-black/10 dark:border-white/10 bg-black/[0.03] dark:bg-white/[0.03] text-[10px] font-mono">
                      <div>
                        <div className="text-black/45 dark:text-white/45">
                          Sensor: Hasselblad
                        </div>
                        <div className="text-black dark:text-white font-medium">
                          Medium Format
                        </div>
                      </div>
                      <div>
                        <div className="text-black/45 dark:text-white/45">
                          ISO 160 • 24mm Prime
                        </div>
                        <div className="text-emerald-600 dark:text-emerald-400">
                          Ready for Cinema Cut
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Center Column (4 Cols): 2 Stacked Editorial Cards */}
                  <div className="lg:col-span-4 flex flex-col gap-4">
                    <motion.button
                      type="button"
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      transition={APPLE_SPRING_SNAPPY}
                      onClick={() =>
                        handleLaunchStudioPreset({
                          nextPrompt:
                            "Glacial ridge ascent in the Swiss Alps at sunrise, dramatic mountain peaks",
                          nextCategory: "Nature",
                          nextHeadline: "GLACIAL RIDGE ASCENT",
                          nextSubtitle: "VALAIS HIGH PEAK RANGE • ALPINE RAW",
                          nextBadge: "STILL // VALAIS-09",
                        })
                      }
                      className="liquid-glass-card rounded-[26px] p-4 space-y-2.5 text-left"
                    >
                      <div className="flex items-center justify-between text-[10px] font-mono text-black/55 dark:text-white/55">
                        <span>Elevation: 3,400m</span>
                        <span>STILL // VALAIS-09</span>
                      </div>
                      <div className="relative h-36 w-full rounded-2xl overflow-hidden">
                        <img
                          src={timelyWallpapers[1]}
                          alt="Glacial Ridge Ascent"
                          onError={(e) =>
                            handleImageErrorFallback(
                              e,
                              "/samples/dolomites_mountain_lake.jpg"
                            )
                          }
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-full text-[9px] font-mono bg-black/75 text-white border border-white/20">
                          1/2000s • f/4.0
                        </span>
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-black dark:text-white">
                          Glacial Ridge Ascent
                        </div>
                        <div className="text-[10px] text-black/55 dark:text-white/55">
                          Valais High Peak Range • Alpine RAW Series
                        </div>
                      </div>
                    </motion.button>

                    <motion.button
                      type="button"
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      transition={APPLE_SPRING_SNAPPY}
                      onClick={() =>
                        handleLaunchStudioPreset({
                          nextPrompt:
                            "Golden hour coastal portrait in 65mm tungsten film tone",
                          nextCategory: "Portrait",
                          nextHeadline: "GOLDEN HOUR RIDGE",
                          nextSubtitle: "TUNGSTEN 800T • EDITORIAL STILL",
                          nextBadge: "TUNGSTEN 800T",
                        })
                      }
                      className="liquid-glass-card rounded-[26px] p-4 space-y-2.5 text-left flex-1"
                    >
                      <div className="flex items-center justify-between text-[10px] font-mono text-black/55 dark:text-white/55">
                        <span>Akash Profile Tag</span>
                        <span className="px-2 py-0.5 rounded-full border border-black/10 dark:border-white/15 bg-black/[0.04] dark:bg-white/[0.06]">
                          Tungsten 800T
                        </span>
                      </div>
                      <div className="relative h-36 w-full rounded-2xl overflow-hidden">
                        <img
                          src={timelyWallpapers[2]}
                          alt="Golden Hour Ridge"
                          onError={(e) =>
                            handleImageErrorFallback(
                              e,
                              "/samples/cinematic_portrait_woman.jpg"
                            )
                          }
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-black dark:text-white">
                          Golden Hour Ridge
                        </div>
                        <div className="text-[10px] text-black/55 dark:text-white/55">
                          Tagged: Akash • Kozhikode Cliffside
                        </div>
                      </div>
                    </motion.button>
                  </div>

                  {/* Right Column (4 Cols): Maritime / Craft Series + Zone System Density Card */}
                  <div className="lg:col-span-4 liquid-glass-card rounded-[26px] p-4 flex flex-col justify-between space-y-3.5">
                    <div className="flex items-center justify-between text-[10px] font-mono text-black/55 dark:text-white/55">
                      <span>Maritime Craft Series</span>
                      <span>ARCHIVE // BEYPORE</span>
                    </div>

                    <div className="relative h-40 w-full rounded-2xl overflow-hidden">
                      <img
                        src={timelyWallpapers[3]}
                        alt="Aged Teak Planks"
                        onError={(e) =>
                          handleImageErrorFallback(
                            e,
                            "/samples/candlelit_desk_study.jpg"
                          )
                        }
                        className="w-full h-full object-cover"
                      />
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                      <div className="absolute bottom-3 left-3 text-white">
                        <div className="text-[9px] font-mono text-white/70">
                          Beypore Shipwrights
                        </div>
                        <div className="text-xs font-semibold">
                          Aged Teak Planks • Hand Cut
                        </div>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-2xl border border-black/10 dark:border-white/10 bg-black/[0.03] dark:bg-white/[0.03] space-y-3">
                      <div className="flex items-center justify-between text-[10px] font-mono">
                        <span className="text-black/75 dark:text-white/80 font-medium">
                          Monochrome Density Analysis
                        </span>
                        <span className="text-black/50 dark:text-white/50">
                          Zone System Grade 8
                        </span>
                      </div>

                      <div className="h-1.5 w-full rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
                        <div className="h-full w-4/5 rounded-full bg-gradient-to-r from-black/50 via-black to-emerald-500 dark:from-white/40 dark:via-white dark:to-emerald-400" />
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
                        <div className="flex justify-between">
                          <span className="text-black/45 dark:text-white/45">
                            Dynamic Range
                          </span>
                          <span className="text-black dark:text-white">
                            15.2 EV
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-black/45 dark:text-white/45">
                            Color Depth
                          </span>
                          <span className="text-black dark:text-white">
                            16-Bit Pro
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-black/45 dark:text-white/45">
                            Motion Synth
                          </span>
                          <span className="text-emerald-600 dark:text-emerald-400">
                            Ready
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-black/45 dark:text-white/45">
                            Peak Luminance
                          </span>
                          <span className="text-black dark:text-white">
                            1400 nits
                          </span>
                        </div>
                      </div>

                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.96 }}
                        transition={APPLE_SPRING_SNAPPY}
                        onClick={() =>
                          handleLaunchStudioPreset({
                            nextPrompt:
                              "Optical RAW 16-bit study of Beypore hand-crafted teak shipwright workshop",
                            nextCategory: "Dark Academia",
                            nextHeadline: "AGED TEAK PLANKS",
                            nextSubtitle: "ARCHIVE // BEYPORE • 16-BIT RAW",
                            nextBadge: "ZONE SYSTEM GRADE 8",
                          })
                        }
                        className="liquid-glass-action w-full py-2 rounded-xl text-[11px] font-mono font-medium text-black dark:text-white flex items-center justify-center gap-1.5"
                      >
                        <Maximize2 className="w-3 h-3" />
                        <span>Open Optical RAW Inspector</span>
                      </motion.button>
                    </div>
                  </div>
                </div>

                {/* Bottom Contact Sheet & Sequence Timeline Dock */}
                <div className="liquid-glass-card rounded-[26px] p-4 sm:p-5 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="liquid-glass-well flex items-center gap-1 p-1 rounded-full">
                      {[
                        { id: "contact-sheet", label: "Contact Sheet" },
                        { id: "photo-book", label: "Photo Book" },
                        { id: "editorial-grid", label: "Editorial Grid" },
                        { id: "memory-reel", label: "Memory Reel" },
                      ].map((mode) => {
                        const active = sheetView === mode.id;
                        return (
                          <button
                            key={mode.id}
                            type="button"
                            onClick={() => setSheetView(mode.id)}
                            className={`relative px-3 py-1 rounded-full text-[11px] transition-colors ${
                              active
                                ? "text-white dark:text-black font-semibold"
                                : "text-black/65 dark:text-white/65"
                            }`}
                          >
                            {active && (
                              <motion.span
                                layoutId="contact-sheet-mode-pill"
                                transition={APPLE_SPRING_BOUNCY}
                                className="liquid-glass-active-pill absolute inset-0 rounded-full"
                              />
                            )}
                            <span className="relative z-10">{mode.label}</span>
                          </button>
                        );
                      })}
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-mono">
                      <span className="text-black/45 dark:text-white/45 mr-1">
                        Filter Stills:
                      </span>
                      {[
                        { id: "favorites", label: "★ Favorites" },
                        { id: "raw", label: "● RAW Only" },
                        { id: "akash", label: "● Akash (24)" },
                        { id: "kozhikode", label: "● Kozhikode (18)" },
                      ].map((f) => (
                        <button
                          key={f.id}
                          type="button"
                          onClick={() => setStillsFilter(f.id)}
                          className={`px-2.5 py-1 rounded-full border transition-colors ${
                            stillsFilter === f.id
                              ? "border-black dark:border-white bg-black text-white dark:bg-white dark:text-black font-semibold"
                              : "border-black/10 dark:border-white/15 bg-black/[0.03] dark:bg-white/[0.04] text-black/70 dark:text-white/70"
                          }`}
                        >
                          {f.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[10px] font-mono text-black/50 dark:text-white/50">
                    <span>
                      SEQUENCE TIMELINE // REEL 01: &ldquo;DEEP OCEAN &amp;
                      VALLEYS&rdquo;
                    </span>
                    <span>Drag photos to reorder sequence</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
                    {[
                      {
                        num: "#01",
                        title: "Deep Ocean Drift",
                        img: timelyWallpapers[0],
                        fallback: "/samples/bioluminescent_beach_waves.jpg",
                        cat: "Nature",
                      },
                      {
                        num: "#02",
                        title: "Glacial Ascent",
                        img: timelyWallpapers[1],
                        fallback: "/samples/dolomites_mountain_lake.jpg",
                        cat: "Nature",
                      },
                      {
                        num: "#03",
                        title: "Golden Coast",
                        img: timelyWallpapers[2],
                        fallback: "/samples/cinematic_portrait_woman.jpg",
                        cat: "Portrait",
                      },
                      {
                        num: "#04",
                        title: "Beypore Teak",
                        img: timelyWallpapers[3],
                        fallback: "/samples/candlelit_desk_study.jpg",
                        cat: "Dark Academia",
                      },
                    ].map((slot) => (
                      <motion.button
                        key={slot.num}
                        type="button"
                        whileHover={{ y: -2, scale: 1.02 }}
                        whileTap={{ scale: 0.96 }}
                        transition={APPLE_SPRING_SNAPPY}
                        onClick={() =>
                          handleLaunchStudioPreset({
                            nextPrompt: `65mm film frame of ${slot.title}`,
                            nextCategory: slot.cat,
                            nextHeadline: slot.title.toUpperCase(),
                            nextBadge: `REEL ${slot.num}`,
                          })
                        }
                        className="group relative h-28 rounded-2xl overflow-hidden border border-black/10 dark:border-white/15 bg-black text-left"
                      >
                        <img
                          src={slot.img}
                          alt={slot.title}
                          onError={(e) =>
                            handleImageErrorFallback(e, slot.fallback)
                          }
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-black/75 text-[9px] font-mono text-white">
                          {slot.num}
                        </span>
                        <div className="pointer-events-none absolute inset-x-0 bottom-0 p-1.5 bg-gradient-to-t from-black/85 to-transparent text-[10px] text-white truncate">
                          {slot.title}
                        </div>
                      </motion.button>
                    ))}

                    {["#05", "#06"].map((emptySlot) => (
                      <button
                        key={emptySlot}
                        type="button"
                        onClick={() => setActiveTab("studio")}
                        className="h-28 rounded-2xl border border-dashed border-black/20 dark:border-white/20 bg-black/[0.02] dark:bg-white/[0.02] hover:bg-black/[0.05] dark:hover:bg-white/[0.05] flex flex-col items-center justify-center gap-1 text-[10px] font-mono text-black/50 dark:text-white/50 transition-colors"
                      >
                        <span>+</span>
                        <span>Add Still {emptySlot}</span>
                      </button>
                    ))}
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-black/10 dark:border-white/10">
                    <span className="text-[10px] font-mono text-black/55 dark:text-white/55">
                      Estimated Cut Duration: 00:24s • Master Aspect: 2.39:1
                      Anamorphic
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setFilmStock((prev) =>
                            prev === "monochrome-35mm"
                              ? "silver-halide-400"
                              : prev === "silver-halide-400"
                              ? "cinestill-800t"
                              : "monochrome-35mm"
                          )
                        }
                        className="liquid-glass-action px-3.5 py-1.5 rounded-full text-[11px] font-medium text-black dark:text-white"
                      >
                        Match Profiles
                      </button>
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.95 }}
                        transition={APPLE_SPRING_BOUNCY}
                        onClick={() => setActiveTab("studio")}
                        className="liquid-glass-active-pill px-4 py-1.5 rounded-full text-[11px] font-semibold"
                      >
                        Send to 4K Studio →
                      </motion.button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB 1: Claude MCP Generator + Real-Time Canva Typography Canvas */}
            {activeTab === "studio" && (
              <motion.div
                key="studio-tab"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={APPLE_SPRING_FLUID}
                className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-start"
              >
                {/* Left Column: Apple-Standard Liquid Glass Controls (5 Cols) */}
                <div className="lg:col-span-5 space-y-4">
                  {/* Apple Golden Gate Liquid Glass AI Model Segmented Bar */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase tracking-wider font-mono text-black/60 dark:text-white/60">
                        AI Model
                      </span>
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.04, y: -1 }}
                        whileTap={{ scale: 0.94 }}
                        transition={APPLE_SPRING_SNAPPY}
                        onClick={() => setShowKeyPopover((prev) => !prev)}
                        className="liquid-glass-action inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono text-black dark:text-white"
                      >
                        <Key className="w-3 h-3 text-emerald-500" />
                        <span>
                          {geminiKeyInput.trim() || openaiKeyInput.trim()
                            ? "API Key Active"
                            : "Set API Key"}
                        </span>
                      </motion.button>
                    </div>

                    <div className="liquid-glass-well grid grid-cols-4 gap-1 p-1.5 rounded-2xl">
                      {[
                        {
                          id: "gemini-nano-banana",
                          label: "🍌 Nano",
                          sub: "Gemini",
                        },
                        {
                          id: "chatgpt-image",
                          label: "🤖 ChatGPT",
                          sub: "DALL·E 3",
                        },
                        {
                          id: "claude-flux",
                          label: "✨ Claude",
                          sub: "Sonnet",
                        },
                        {
                          id: "auto",
                          label: "⚡ Auto",
                          sub: "Smart",
                        },
                      ].map((m) => {
                        const active = modelProvider === m.id;
                        return (
                          <motion.button
                            key={m.id}
                            type="button"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.94 }}
                            transition={APPLE_SPRING_SNAPPY}
                            onClick={() => setModelProvider(m.id)}
                            className={`relative flex flex-col items-center justify-center py-2 px-2 rounded-xl text-center transition-colors ${
                              active
                                ? "text-white dark:text-black font-semibold"
                                : "text-black/70 dark:text-white/70 hover:text-black dark:hover:text-white"
                            }`}
                          >
                            {active && (
                              <motion.span
                                layoutId="mcp-model-liquid-pill"
                                transition={APPLE_SPRING_BOUNCY}
                                className="liquid-glass-active-pill absolute inset-0 rounded-xl"
                              />
                            )}
                            <span className="relative z-10 text-[11px] font-medium leading-tight">
                              {m.label}
                            </span>
                            <span
                              className={`relative z-10 text-[9px] font-mono ${
                                active
                                  ? "text-white/75 dark:text-black/70"
                                  : "text-black/45 dark:text-white/45"
                              }`}
                            >
                              {m.sub}
                            </span>
                          </motion.button>
                        );
                      })}
                    </div>

                    {/* Collapsible Liquid Glass API Key Input */}
                    <AnimatePresence initial={false}>
                      {showKeyPopover && (
                        <motion.div
                          initial={{ height: 0, opacity: 0, filter: "blur(6px)" }}
                          animate={{ height: "auto", opacity: 1, filter: "blur(0px)" }}
                          exit={{ height: 0, opacity: 0, filter: "blur(6px)" }}
                          transition={APPLE_SPRING_SNAPPY}
                          className="overflow-hidden"
                        >
                          <div className="pt-1 flex items-center gap-2">
                            <Key className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                            <input
                              type="password"
                              value={
                                modelProvider === "chatgpt-image"
                                  ? openaiKeyInput
                                  : geminiKeyInput || openaiKeyInput
                              }
                              onChange={(e) => {
                                const val = e.target.value;
                                const trimmed = val.trim();
                                if (
                                  trimmed.startsWith("sk-") &&
                                  !trimmed.startsWith("sk-ant")
                                ) {
                                  setOpenaiKeyInput(val);
                                  setModelProvider("chatgpt-image");
                                  try {
                                    localStorage.setItem(
                                      "sortn-sec-openai-key",
                                      trimmed
                                    );
                                  } catch (err) {}
                                } else if (trimmed.startsWith("AIza")) {
                                  setGeminiKeyInput(val);
                                  setModelProvider("gemini-nano-banana");
                                  try {
                                    localStorage.setItem(
                                      "sortn-sec-gemini-key",
                                      trimmed
                                    );
                                  } catch (err) {}
                                } else if (modelProvider === "chatgpt-image") {
                                  setOpenaiKeyInput(val);
                                  try {
                                    localStorage.setItem(
                                      "sortn-sec-openai-key",
                                      trimmed
                                    );
                                  } catch (err) {}
                                } else {
                                  setGeminiKeyInput(val);
                                  try {
                                    localStorage.setItem(
                                      "sortn-sec-gemini-key",
                                      trimmed
                                    );
                                  } catch (err) {}
                                }
                              }}
                              placeholder={
                                modelProvider === "chatgpt-image"
                                  ? "Paste OpenAI API Key (sk-proj-...) for ChatGPT 4K"
                                  : "Paste OpenAI Key (sk-...) or Gemini Key (AIzaSy...)"
                              }
                              className="liquid-glass-input flex-1 px-3 py-1.5 text-[11px] font-mono rounded-xl text-black dark:text-white placeholder:text-black/40 dark:placeholder:text-white/40 focus:outline-none"
                            />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Liquid Glass Prompt Input + Generate Button */}
                  <form onSubmit={handleGenerate} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label
                        htmlFor="mcp-prompt-input"
                        className="text-[10px] uppercase tracking-wider font-mono text-black/60 dark:text-white/60"
                      >
                        Prompt & Scene
                      </label>
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.94 }}
                        transition={APPLE_SPRING_SNAPPY}
                        onClick={() =>
                          setSyncPromptToCanvasType((prev) => !prev)
                        }
                        className="liquid-glass-action flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono text-black/75 dark:text-white/75"
                      >
                        <span
                          className={`w-3 h-3 rounded flex items-center justify-center transition-colors ${
                            syncPromptToCanvasType
                              ? "bg-emerald-500 text-white"
                              : "border border-black/25 dark:border-white/30"
                          }`}
                        >
                          {syncPromptToCanvasType && (
                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                          )}
                        </span>
                        <span>Mirror text on image</span>
                      </motion.button>
                    </div>
                    <div className="flex gap-2">
                      <input
                        id="mcp-prompt-input"
                        type="text"
                        value={prompt}
                        onChange={(e) => {
                          const val = e.target.value;
                          setPrompt(val);
                          if (syncPromptToCanvasType) {
                            const trimmed = val.trim();
                            setHeadlineText(
                              trimmed
                                ? trimmed.slice(0, 42).toUpperCase()
                                : "SORTN SEC AI STUDIO"
                            );
                            setSubtitleText(
                              trimmed.length > 42
                                ? trimmed.toUpperCase()
                                : `AI VISUAL SYNTHESIS // ${categoryHint.toUpperCase()} EDITION`
                            );
                          }
                        }}
                        placeholder="Describe any scene to generate..."
                        className="liquid-glass-input flex-1 px-3.5 py-2.5 text-xs rounded-2xl text-black dark:text-white placeholder:text-black/40 dark:placeholder:text-white/40 focus:outline-none"
                      />
                      <motion.button
                        type="submit"
                        whileHover={{ scale: 1.04, y: -1.5 }}
                        whileTap={{ scale: 0.93 }}
                        transition={APPLE_SPRING_BOUNCY}
                        disabled={isGenerating || !prompt.trim()}
                        className="liquid-glass-active-pill shrink-0 flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-xs font-semibold disabled:opacity-50"
                      >
                        {isGenerating ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Sparkles className="w-3.5 h-3.5" />
                        )}
                        <span>{isGenerating ? "Creating..." : "Generate"}</span>
                      </motion.button>
                    </div>
                  </form>

                  {/* Liquid Glass Single-Row Preset Capsules */}
                  <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 scrollbar-none">
                    {PRESET_PROMPTS.slice(0, 4).map((preset) => {
                      const isCurrent = prompt === preset.prompt;
                      return (
                        <motion.button
                          key={preset.label}
                          type="button"
                          whileHover={{ scale: 1.04, y: -1 }}
                          whileTap={{ scale: 0.93 }}
                          transition={APPLE_SPRING_SNAPPY}
                          onClick={() => {
                            setPrompt(preset.prompt);
                            setCategoryHint(preset.category);
                            setHeadlineText(preset.headline);
                            setSubtitleText(preset.subtitle);
                            setBadgeText(preset.badge);
                          }}
                          className={`shrink-0 px-3 py-1.5 rounded-full text-[10px] tracking-wide transition-all ${
                            isCurrent
                              ? "liquid-glass-active-pill font-semibold"
                              : "liquid-glass-action text-black/75 dark:text-white/75 hover:text-black dark:hover:text-white"
                          }`}
                        >
                          {preset.label}
                        </motion.button>
                      );
                    })}
                  </div>

                  {/* Apple Golden Gate Liquid Glass Canva Typography Capsule (Unfolds on Click) */}
                  <motion.div
                    layout
                    transition={APPLE_SPRING_FLUID}
                    className={`gpu-120hz relative overflow-hidden rounded-[24px] transition-all duration-300 ${
                      isTypeDrawerOpen
                        ? "liquid-glass-card"
                        : "liquid-glass-action"
                    }`}
                  >
                    {/* Top Refractive Highlight */}
                    <div className="pointer-events-none absolute inset-x-4 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/80 dark:via-white/30 to-transparent" />

                    {/* Clickable Liquid Glass Header Bar */}
                    <div
                      onClick={() => setIsTypeDrawerOpen((prev) => !prev)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          setIsTypeDrawerOpen((prev) => !prev);
                        }
                      }}
                      className="relative z-10 flex items-center justify-between gap-2 px-4 py-3 cursor-pointer select-none"
                    >
                      <span className="text-xs font-medium text-black dark:text-white flex items-center gap-2.5">
                        <motion.span
                          animate={{ rotate: isTypeDrawerOpen ? 180 : 0 }}
                          transition={APPLE_SPRING_SNAPPY}
                          className={`w-7 h-7 rounded-xl flex items-center justify-center ${
                            isTypeDrawerOpen
                              ? "liquid-glass-active-pill"
                              : "liquid-glass-well text-black dark:text-white"
                          }`}
                        >
                          <Type className="w-3.5 h-3.5" />
                        </motion.span>
                        <span>Canva Typography Layer</span>
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-mono uppercase tracking-wider bg-black/[0.05] dark:bg-white/[0.08] text-black/60 dark:text-white/60">
                          {isTypeDrawerOpen ? "Hide" : "Customize"}
                        </span>
                      </span>

                      {/* Independent Emerald Liquid Glass Switch */}
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.92 }}
                        transition={APPLE_SPRING_BOUNCY}
                        onClick={(e) => {
                          e.stopPropagation();
                          setEnableCanvaType((prev) => !prev);
                        }}
                        className="flex items-center gap-2"
                      >
                        <span className="text-[10px] font-mono text-black/65 dark:text-white/65">
                          {enableCanvaType ? "On" : "Off"}
                        </span>
                        <div
                          className={`relative w-10 h-5 rounded-full p-0.5 transition-all duration-300 ${
                            enableCanvaType
                              ? "liquid-glass-emerald"
                              : "liquid-glass-well"
                          }`}
                        >
                          <motion.div
                            layout
                            transition={APPLE_SPRING_BOUNCY}
                            className={`w-4 h-4 rounded-full bg-white shadow-[0_2px_6px_rgba(0,0,0,0.28),inset_0_1px_1px_rgba(255,255,255,1)] ${
                              enableCanvaType ? "ml-auto" : "ml-0"
                            }`}
                          />
                        </div>
                      </motion.div>
                    </div>

                    {/* Apple Liquid Glass Unfolding Content Drawer */}
                    <AnimatePresence initial={false}>
                      {isTypeDrawerOpen && (
                        <motion.div
                          key="canva-liquid-glass-drawer"
                          initial={{
                            height: 0,
                            opacity: 0,
                            filter: "blur(8px)",
                          }}
                          animate={{
                            height: "auto",
                            opacity: 1,
                            filter: "blur(0px)",
                          }}
                          exit={{
                            height: 0,
                            opacity: 0,
                            filter: "blur(8px)",
                          }}
                          transition={APPLE_SPRING_FLUID}
                          className="relative z-10 overflow-hidden"
                        >
                          <div className="px-4 pb-4 pt-2.5 space-y-2.5 border-t border-black/10 dark:border-white/10">
                            <input
                              type="text"
                              value={headlineText}
                              onChange={(e) => setHeadlineText(e.target.value)}
                              placeholder="Headline text on canvas..."
                              className="liquid-glass-input w-full px-3 py-1.5 text-xs font-medium rounded-xl text-black dark:text-white placeholder:text-black/40 dark:placeholder:text-white/40 focus:outline-none"
                            />

                            <div className="grid grid-cols-2 gap-2">
                              <input
                                type="text"
                                value={subtitleText}
                                onChange={(e) => setSubtitleText(e.target.value)}
                                placeholder="Subtitle text..."
                                className="liquid-glass-input w-full px-2.5 py-1.5 text-[11px] rounded-xl text-black dark:text-white placeholder:text-black/40 dark:placeholder:text-white/40 focus:outline-none"
                              />
                              <input
                                type="text"
                                value={badgeText}
                                onChange={(e) => setBadgeText(e.target.value)}
                                placeholder="Badge tag..."
                                className="liquid-glass-input w-full px-2.5 py-1.5 text-[11px] font-mono rounded-xl text-black dark:text-white placeholder:text-black/40 dark:placeholder:text-white/40 focus:outline-none"
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                              <select
                                value={fontStyle}
                                onChange={(e) => setFontStyle(e.target.value)}
                                className="liquid-glass-action w-full px-2.5 py-1.5 text-[11px] rounded-xl text-black dark:text-white cursor-pointer focus:outline-none"
                              >
                                {FONT_STYLES.map((f) => (
                                  <option key={f.id} value={f.id}>
                                    {f.label}
                                  </option>
                                ))}
                              </select>

                              <select
                                value={textPosition}
                                onChange={(e) => setTextPosition(e.target.value)}
                                className="liquid-glass-action w-full px-2.5 py-1.5 text-[11px] rounded-xl text-black dark:text-white cursor-pointer focus:outline-none"
                              >
                                {TEXT_POSITIONS.map((pos) => (
                                  <option key={pos.id} value={pos.id}>
                                    {pos.label}
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div className="flex items-center justify-between gap-2 pt-1">
                              <div className="liquid-glass-well flex items-center gap-1.5 px-2.5 py-1 rounded-full">
                                {TEXT_COLORS.map((c) => (
                                  <motion.button
                                    key={c.id}
                                    type="button"
                                    whileHover={{ scale: 1.18 }}
                                    whileTap={{ scale: 0.9 }}
                                    transition={APPLE_SPRING_BOUNCY}
                                    onClick={() => setTextColor(c.id)}
                                    title={c.label}
                                    className={`w-4 h-4 rounded-full border transition-transform ${
                                      textColor === c.id
                                        ? "ring-2 ring-offset-1 ring-black dark:ring-white scale-110"
                                        : "border-black/25 dark:border-white/30"
                                    }`}
                                    style={{ backgroundColor: c.id }}
                                  />
                                ))}
                              </div>

                              <div className="liquid-glass-well flex items-center gap-0.5 p-0.5 rounded-xl">
                                {ASPECT_RATIOS.map((ar) => {
                                  const activeAr = aspectRatio === ar.id;
                                  return (
                                    <motion.button
                                      key={ar.id}
                                      type="button"
                                      whileTap={{ scale: 0.92 }}
                                      transition={APPLE_SPRING_SNAPPY}
                                      onClick={() => setAspectRatio(ar.id)}
                                      className={`relative px-2 py-1 rounded-lg text-[10px] font-mono transition-colors ${
                                        activeAr
                                          ? "text-white dark:text-black font-semibold"
                                          : "text-black/70 dark:text-white/70 hover:text-black dark:hover:text-white"
                                      }`}
                                    >
                                      {activeAr && (
                                        <motion.span
                                          layoutId="mcp-aspect-liquid-pill"
                                          transition={APPLE_SPRING_BOUNCY}
                                          className="liquid-glass-active-pill absolute inset-0 rounded-lg"
                                        />
                                      )}
                                      <span className="relative z-10">{ar.id}</span>
                                    </motion.button>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                </div>

                {/* Right Column: Expansive Live High-Res HTML5 Canva Studio Stage (7 Cols) */}
                <div className="lg:col-span-7 space-y-3.5">
                  <div className="flex items-center justify-between text-[11px] font-mono uppercase tracking-wider text-black/60 dark:text-white/60">
                    <span className="flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5" />
                      <span>Live Interactive Canva Studio Stage</span>
                    </span>
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.04, y: -1 }}
                      whileTap={{ scale: 0.93 }}
                      transition={APPLE_SPRING_SNAPPY}
                      onClick={() => setShowTrace((s) => !s)}
                      className="liquid-glass-action flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] text-black dark:text-white"
                    >
                      <Code2 className="w-3 h-3" />
                      <span>{showTrace ? "Hide RPC" : "JSON-RPC"}</span>
                    </motion.button>
                  </div>

                  {/* Expansive Live 4K UHD HTML5 Canvas Element Strictly Bounded Under Container Size in Cover Format */}
                  <div
                    ref={canvasStageRef}
                    className="group relative w-full h-[360px] sm:h-[400px] max-h-[400px] overflow-hidden rounded-[26px] border border-black/15 dark:border-white/20 bg-black/95 shadow-[0_20px_50px_rgba(0,0,0,0.22),inset_0_1px_1px_rgba(255,255,255,0.25)]"
                  >
                    <motion.canvas
                      ref={canvasRef}
                      onClick={openClientFullscreenView}
                      animate={{
                        scale: isGenerating ? 1.05 : isRevealing4K ? [1.03, 1] : 1,
                        filter: isGenerating
                          ? "blur(26px) saturate(1.4) brightness(0.75)"
                          : "blur(0px) saturate(1) brightness(1)",
                      }}
                      transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
                      title="Click to inspect 4K UHD master in Fullscreen Client Perspective with Zoom"
                      className="w-full h-full object-cover block cursor-zoom-in"
                    />

                    {/* Top-Left Live Creation Timer & 4K UHD Badge (ChatGPT Style) */}
                    <div className="absolute top-3 left-3 z-30 flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono bg-black/70 text-white border border-white/25 backdrop-blur-xl shadow-[0_8px_24px_rgba(0,0,0,0.45),inset_0_1px_1px_rgba(255,255,255,0.35)] pointer-events-none">
                      {isGenerating ? (
                        <>
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                          <span className="font-semibold text-emerald-300">
                            Creating 4K image...
                          </span>
                          <span className="text-white/80 tabular-nums">
                            {elapsedSeconds.toFixed(1)}s
                          </span>
                        </>
                      ) : (
                        <>
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          <span className="font-semibold text-emerald-300">
                            4K UHD (3840×2160)
                          </span>
                          <span className="text-white/75">
                            • Created in {lastCreationSeconds}s
                          </span>
                        </>
                      )}
                    </div>

                    {/* Active Neural Engine Liquid Glass Status Pill */}
                    {generatedResult?.meta?.directorEngine && !isGenerating && (
                      <div className="absolute bottom-3 left-3 z-20 flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-mono bg-black/65 text-white/95 border border-white/25 backdrop-blur-xl shadow-[0_8px_20px_rgba(0,0,0,0.45),inset_0_1px_0.5px_rgba(255,255,255,0.35)] pointer-events-none">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="truncate max-w-[230px]">
                          {generatedResult.meta.directorEngine}
                        </span>
                      </div>
                    )}

                    {/* Floating Quick Fullscreen & Zoom Liquid Glass Trigger Pill */}
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.06, y: -1 }}
                      whileTap={{ scale: 0.92 }}
                      transition={APPLE_SPRING_BOUNCY}
                      onClick={openClientFullscreenView}
                      className="absolute top-3 right-3 z-30 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-mono uppercase tracking-wider bg-white/15 hover:bg-white/25 text-white border border-white/30 backdrop-blur-xl shadow-[0_8px_24px_rgba(0,0,0,0.45),inset_0_1px_1px_rgba(255,255,255,0.45)] transition-colors"
                      title="Open 4K UHD Fullscreen Client Perspective & Zoom Inspector"
                    >
                      <Maximize2 className="w-3 h-3" />
                      <span>4K Zoom</span>
                    </motion.button>

                    {/* ChatGPT-Style Progressive Top-to-Bottom De-Blur Reveal Curtain */}
                    <AnimatePresence>
                      {isRevealing4K && (
                        <motion.div
                          key="chatgpt-progressive-4k-reveal"
                          initial={{ clipPath: "inset(0% 0% 0% 0%)", opacity: 1 }}
                          animate={{ clipPath: "inset(100% 0% 0% 0%)", opacity: 0.92 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 1.3, ease: [0.22, 1, 0.36, 1] }}
                          className="pointer-events-none absolute inset-0 z-20 backdrop-blur-2xl bg-black/25 border-t-2 border-emerald-400/80 shadow-[0_-12px_36px_rgba(52,211,153,0.55)]"
                        />
                      )}
                    </AnimatePresence>

                    {/* ChatGPT-Style Iridescent Diffusion Shimmer & Live Timer HUD While Creating */}
                    <AnimatePresence>
                      {isGenerating && (
                        <motion.div
                          key="chatgpt-creating-overlay"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="absolute inset-0 z-20 overflow-hidden flex flex-col items-center justify-center p-6 select-none"
                        >
                          {/* Animated Prismatic Aurora Shimmer Wave */}
                          <motion.div
                            animate={{
                              x: ["-100%", "100%"],
                            }}
                            transition={{
                              duration: 2.1,
                              repeat: Infinity,
                              ease: "linear",
                            }}
                            className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"
                          />

                          {/* Ambient Radial Glow */}
                          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.22),rgba(0,0,0,0.68)_75%)]" />

                          {/* Center Apple Liquid Glass Creation Card */}
                          <div className="relative z-10 w-full max-w-sm rounded-3xl border border-white/25 bg-black/60 backdrop-blur-2xl px-6 py-5 shadow-[0_24px_60px_rgba(0,0,0,0.65),inset_0_1px_1px_rgba(255,255,255,0.35)] text-center space-y-3.5 text-white">
                            <div className="flex items-center justify-between text-[11px] font-mono">
                              <span className="inline-flex items-center gap-1.5 text-emerald-300 font-semibold">
                                <Sparkles className="w-3.5 h-3.5 animate-spin" />
                                <span>
                                  {modelProvider === "gemini-nano-banana"
                                    ? "Gemini Nano Banana 4K"
                                    : modelProvider === "chatgpt-image"
                                    ? "ChatGPT Image (gpt-image-1)"
                                    : "Claude × Imagen 3 4K"}
                                </span>
                              </span>
                              <span className="px-2 py-0.5 rounded-full bg-white/15 border border-white/20 text-white tabular-nums">
                                {elapsedSeconds.toFixed(1)}s • {generationProgress}%
                              </span>
                            </div>

                            {/* Smooth Progress Bar */}
                            <div className="w-full h-1.5 rounded-full bg-white/15 overflow-hidden">
                              <motion.div
                                animate={{ width: `${generationProgress}%` }}
                                transition={{ duration: 0.15, ease: "easeOut" }}
                                className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-teal-300 to-white shadow-[0_0_12px_rgba(52,211,153,0.8)]"
                              />
                            </div>

                            <p className="text-xs font-mono text-white/85 tracking-wide">
                              {elapsedSeconds < 0.8
                                ? "Analyzing prompt & 4K spatial composition..."
                                : elapsedSeconds < 1.6
                                ? "Synthesizing 4K UHD latent structure (3840×2160)..."
                                : elapsedSeconds < 2.3
                                ? "Refining photorealistic lighting & 4K textures..."
                                : "Finalizing 4K UHD master..."}
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {generatedResult?.meta?.providerError && (
                    <div className="liquid-glass-action px-3.5 py-2.5 rounded-2xl border border-amber-500/35 bg-amber-500/10 text-[11px] text-amber-700 dark:text-amber-300 font-mono leading-relaxed">
                      <span className="font-bold uppercase tracking-wider mr-1.5">
                        API Notice:
                      </span>
                      {generatedResult.meta.providerError}
                    </div>
                  )}

                  {showTrace && rpcTrace && (
                    <pre className="p-2.5 rounded-xl bg-black text-white text-[10px] font-mono overflow-x-auto max-h-28 border border-white/10">
                      {JSON.stringify(rpcTrace, null, 2)}
                    </pre>
                  )}

                  {/* Apple Golden Gate Liquid Glass Bottom Action Row */}
                  <div className="flex items-center justify-between gap-2 pt-1">
                    <div className="flex items-center gap-2">
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.04, y: -1.5 }}
                        whileTap={{ scale: 0.93 }}
                        transition={APPLE_SPRING_BOUNCY}
                        onClick={openClientFullscreenView}
                        className="liquid-glass-action flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium text-black dark:text-white"
                      >
                        <Maximize2 className="w-3.5 h-3.5" />
                        <span>Fullscreen</span>
                      </motion.button>

                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.04, y: -1.5 }}
                        whileTap={{ scale: 0.93 }}
                        transition={APPLE_SPRING_BOUNCY}
                        onClick={handleDownloadCanvas}
                        className="liquid-glass-action flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium text-black dark:text-white"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Save</span>
                      </motion.button>
                    </div>

                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.04, y: -1.5 }}
                      whileTap={{ scale: 0.93 }}
                      transition={APPLE_SPRING_BOUNCY}
                      onClick={handleAbsorbCanvasIntoGallery}
                      className="liquid-glass-emerald flex items-center gap-2 px-5 py-2 rounded-full text-xs font-semibold text-white"
                    >
                      <span>Add to Gallery</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB 2: 100% Real Live Web Photo Search via MCP (Wikimedia Commons API) */}
            {activeTab === "web-search" && (
              <motion.div
                key="web-search-tab"
                initial={{ opacity: 0, y: 12, scale: 0.985, filter: "blur(6px)" }}
                animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
                transition={APPLE_SPRING_FLUID}
                className="space-y-4"
              >
                <form onSubmit={handleWebPhotoSearch} className="flex gap-2">
                  <div className="relative flex-1 flex items-center">
                    <Search className="w-4 h-4 absolute left-3.5 text-black/45 dark:text-white/45 pointer-events-none" />
                    <input
                      type="text"
                      value={webSearchQuery}
                      onChange={(e) => setWebSearchQuery(e.target.value)}
                      placeholder="Search real photographs on the web via MCP (e.g. Koenigsegg, Porsche GT3, Tokyo, Zaha Hadid)..."
                      className="liquid-glass-input w-full pl-10 pr-4 py-2.5 text-xs rounded-2xl text-black dark:text-white placeholder:text-black/40 dark:placeholder:text-white/40 focus:outline-none"
                    />
                  </div>
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.03, y: -1.5 }}
                    whileTap={{ scale: 0.93 }}
                    transition={APPLE_SPRING_BOUNCY}
                    disabled={isSearchingWeb || !webSearchQuery.trim()}
                    className="liquid-glass-active-pill px-5 py-2.5 rounded-2xl text-xs uppercase tracking-wider font-semibold disabled:opacity-50"
                  >
                    {isSearchingWeb ? "Searching Web MCP..." : "Search Web MCP"}
                  </motion.button>
                </form>

                <div className="flex flex-wrap items-center gap-1.5">
                  {(showAllWebTopics
                    ? [
                        "Koenigsegg Jesko",
                        "Bugatti Chiron",
                        "Porsche 911 GT3 RS",
                        "Ferrari SF90",
                        "McLaren P1",
                        "Zaha Hadid building",
                        "Tokyo night neon",
                        "Matterhorn Alps",
                        "Dark Academia library",
                        "Michelin gastronomy",
                        "Black Panther wildlife",
                        "Brutalist architecture",
                      ]
                    : [
                        "Koenigsegg Jesko",
                        "Bugatti Chiron",
                        "Porsche 911 GT3 RS",
                        "Zaha Hadid building",
                        "Tokyo night neon",
                        "Matterhorn Alps",
                      ]
                  ).map((q) => {
                    const isActiveQ = webSearchQuery === q;
                    return (
                      <motion.button
                        key={q}
                        type="button"
                        whileHover={{ scale: 1.04, y: -1 }}
                        whileTap={{ scale: 0.93 }}
                        transition={APPLE_SPRING_SNAPPY}
                        onClick={() => {
                          setWebSearchQuery(q);
                          runWebPhotoQuery(q);
                        }}
                        className={`px-3.5 py-1.5 rounded-full text-[11px] font-mono transition-all ${
                          isActiveQ
                            ? "liquid-glass-active-pill font-semibold"
                            : "liquid-glass-action text-black/75 dark:text-white/75 hover:text-black dark:hover:text-white"
                        }`}
                      >
                        {q}
                      </motion.button>
                    );
                  })}

                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.04, y: -1 }}
                    whileTap={{ scale: 0.93 }}
                    transition={APPLE_SPRING_SNAPPY}
                    onClick={() => setShowAllWebTopics((prev) => !prev)}
                    className="liquid-glass-action px-3 py-1.5 rounded-full text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold"
                  >
                    {showAllWebTopics ? "Show Less Topics" : "+ Show More Topics"}
                  </motion.button>
                </div>

                {isSearchingWeb ? (
                  <div className="py-12 flex flex-col items-center justify-center gap-2 text-xs font-mono uppercase tracking-wider text-black/60 dark:text-white/60">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Querying Live Web Photography MCP...</span>
                  </div>
                ) : webPhotos.length === 0 ? (
                  <div className="py-10 text-center text-xs font-mono uppercase tracking-wider text-black/50 dark:text-white/50">
                    Search above to fetch real web photographs via MCP
                  </div>
                ) : (
                  <div className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {webPhotos.map((item) => (
                        <motion.div
                          key={item.pageId}
                          layout
                          initial={{ opacity: 0, scale: 0.96 }}
                          animate={{ opacity: 1, scale: 1 }}
                          whileHover={{ y: -3 }}
                          transition={APPLE_SPRING_SNAPPY}
                          className="liquid-glass-card group rounded-2xl overflow-hidden flex flex-col justify-between"
                        >
                          <div className="relative w-full h-44 bg-black/10 dark:bg-black/40 overflow-hidden">
                            <img
                              src={item.imageDataUrl || item.thumbUrl}
                              alt={item.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                          <div className="p-3.5 space-y-2.5">
                            <p
                              className="text-xs font-medium text-black dark:text-white truncate"
                              title={item.title}
                            >
                              {item.title}
                            </p>
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-[10px] font-mono text-black/55 dark:text-white/55">
                                {item.width}×{item.height}
                              </span>
                              <motion.button
                                type="button"
                                whileHover={{ scale: 1.04, y: -1 }}
                                whileTap={{ scale: 0.93 }}
                                transition={APPLE_SPRING_BOUNCY}
                                disabled={loadingWebPhotoId === item.pageId}
                                onClick={() => handleLoadWebPhotoIntoCanva(item)}
                                className="liquid-glass-emerald px-3.5 py-1 rounded-full text-[10px] font-mono uppercase tracking-wider text-white font-semibold disabled:opacity-50"
                              >
                                {loadingWebPhotoId === item.pageId
                                  ? "Loading..."
                                  : "Type on Canva →"}
                              </motion.button>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    {/* Show More Web Photos Action Bar */}
                    {hasMoreWebPhotos && (
                      <div className="flex items-center justify-center pt-1 pb-2">
                        <motion.button
                          type="button"
                          whileHover={{ scale: 1.04, y: -1.5 }}
                          whileTap={{ scale: 0.94 }}
                          transition={APPLE_SPRING_BOUNCY}
                          disabled={isLoadingMoreWeb}
                          onClick={handleLoadMoreWebPhotos}
                          className="liquid-glass-action flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-mono uppercase tracking-wider text-black dark:text-white font-semibold disabled:opacity-50"
                        >
                          {isLoadingMoreWeb ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-500" />
                              <span>Loading More Photos...</span>
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                              <span>Show More Web Photos (+6)</span>
                            </>
                          )}
                        </motion.button>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            )}

            {/* TAB 3: Canva MCP & External Web MCP Bridge */}
            {activeTab === "bridge" && (
              <motion.div
                key="bridge-tab"
                initial={{ opacity: 0, y: 12, scale: 0.985, filter: "blur(6px)" }}
                animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
                transition={APPLE_SPRING_FLUID}
                className="space-y-4"
              >
                {/* Connect Sortn Sec Directly to Claude.ai Plugins / Custom Connectors */}
                <div className="liquid-glass-card p-5 rounded-3xl space-y-3 border border-emerald-500/30">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs uppercase tracking-wider font-semibold text-black dark:text-white flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Connect Sortn Sec to Claude.ai Plugins</span>
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25">
                      MCP Server Ready
                    </span>
                  </div>
                  <p className="text-[11px] text-black/65 dark:text-white/65 leading-relaxed">
                    In <strong>claude.ai/plugins</strong>, click <strong>Add → Add custom connector</strong> and paste your public Sortn Sec MCP URL (<code>https://your-domain.vercel.app/api/mcp</code> or a <code>cloudflared tunnel</code> URL if running locally). Claude can then directly call <code>generate_aesthetic_image</code> and return 4K images inside your chat.
                  </p>
                  <div className="flex flex-wrap items-center gap-2">
                    <code className="flex-1 px-3 py-2 rounded-xl bg-black/[0.05] dark:bg-white/[0.06] border border-black/10 dark:border-white/10 text-[11px] font-mono text-black dark:text-white truncate">
                      {typeof window !== "undefined"
                        ? `${window.location.origin}/api/mcp`
                        : "http://localhost:3000/api/mcp"}
                    </code>
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.93 }}
                      transition={APPLE_SPRING_SNAPPY}
                      onClick={() => {
                        const mcpUrl =
                          typeof window !== "undefined"
                            ? `${window.location.origin}/api/mcp`
                            : "http://localhost:3000/api/mcp";
                        navigator.clipboard?.writeText(mcpUrl);
                        setCopiedConfig(true);
                        setTimeout(() => setCopiedConfig(false), 2200);
                      }}
                      className="liquid-glass-emerald px-4 py-2 rounded-full text-[11px] font-mono font-semibold text-white"
                    >
                      {copiedConfig ? "Copied URL!" : "Copy MCP URL"}
                    </motion.button>
                  </div>
                </div>

                {/* Real External Web MCP Server Tester (Canva MCP, Figma MCP, Custom) */}
                <div className="liquid-glass-card p-5 rounded-3xl space-y-3.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase tracking-wider font-medium text-black dark:text-white flex items-center gap-2">
                      <Radio className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Live External Web MCP Connector (Canva / Figma / Custom)</span>
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {EXTERNAL_MCP_SERVERS.map((srv) => {
                      const activeSrv = externalMcpUrl === srv.url;
                      return (
                        <motion.button
                          key={srv.url}
                          type="button"
                          whileHover={{ scale: 1.04, y: -1 }}
                          whileTap={{ scale: 0.93 }}
                          transition={APPLE_SPRING_SNAPPY}
                          onClick={() => {
                            setExternalMcpUrl(srv.url);
                            handleProbeExternalMcp(srv.url);
                          }}
                          className={`px-3.5 py-1.5 rounded-full text-[11px] font-mono transition-all ${
                            activeSrv
                              ? "liquid-glass-active-pill font-semibold"
                              : "liquid-glass-action text-black/75 dark:text-white/75"
                          }`}
                        >
                          {srv.name}
                        </motion.button>
                      );
                    })}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <input
                      type="text"
                      value={externalMcpUrl}
                      onChange={(e) => setExternalMcpUrl(e.target.value)}
                      placeholder="https://mcp.canva.com/mcp"
                      className="liquid-glass-input sm:col-span-2 px-3.5 py-2 text-xs font-mono rounded-xl text-black dark:text-white focus:outline-none"
                    />
                    <input
                      type="password"
                      value={externalBearer}
                      onChange={(e) => setExternalBearer(e.target.value)}
                      placeholder="Optional OAuth Bearer Token"
                      className="liquid-glass-input px-3.5 py-2 text-xs font-mono rounded-xl text-black dark:text-white focus:outline-none"
                    />
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[11px] text-black/60 dark:text-white/60">
                      Sends a real JSON-RPC 2.0 <code>initialize</code> handshake
                      to the remote Web MCP server via <code>/api/mcp</code>.
                    </p>
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.04, y: -1.5 }}
                      whileTap={{ scale: 0.93 }}
                      transition={APPLE_SPRING_BOUNCY}
                      disabled={isProbingMcp || !externalMcpUrl.trim()}
                      onClick={() => handleProbeExternalMcp(externalMcpUrl)}
                      className="liquid-glass-emerald shrink-0 px-4 py-1.5 rounded-full text-xs font-mono uppercase tracking-wider text-white font-semibold disabled:opacity-50"
                    >
                      {isProbingMcp ? "Handshaking..." : "Handshake MCP"}
                    </motion.button>
                  </div>

                  {probeResponse && (
                    <div className="p-3 rounded-xl bg-black text-white text-[10px] font-mono space-y-1 overflow-x-auto max-h-40 border border-white/10">
                      <div>
                        Endpoint: {probeResponse.endpointUrl} • HTTP Status:{" "}
                        {probeResponse.httpStatus}
                        {probeResponse.requiresOAuth
                          ? " (Live Server Reached — OAuth Bearer Token Required for Private Account Designs)"
                          : " (Connected)"}
                      </div>
                      <pre>{JSON.stringify(probeResponse, null, 2)}</pre>
                    </div>
                  )}
                </div>

                {/* Unified AI Image Model API Key Vault (Gemini Nano Banana / ChatGPT / Claude) */}
                <div className="liquid-glass-card p-5 rounded-3xl space-y-3.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase tracking-wider font-medium text-black dark:text-white flex items-center gap-2">
                      <Key className="w-3.5 h-3.5 text-emerald-500" />
                      <span>AI Image Generator API Keys (Gemini Nano Banana • ChatGPT • Claude)</span>
                    </span>
                    {savedKeyNotice && (
                      <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400">
                        {savedKeyNotice}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div>
                      <label className="block text-[10px] uppercase font-mono text-black/65 dark:text-white/65 mb-1">
                        🍌 Google Gemini Key (Nano Banana / Imagen 3)
                      </label>
                      <input
                        type="password"
                        value={geminiKeyInput}
                        onChange={(e) => setGeminiKeyInput(e.target.value)}
                        placeholder="AIzaSy..."
                        className="liquid-glass-input w-full px-3 py-2 text-xs font-mono rounded-xl text-black dark:text-white focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase font-mono text-black/65 dark:text-white/65 mb-1">
                        🤖 OpenAI Key (ChatGPT gpt-image-1 / DALL·E 3)
                      </label>
                      <input
                        type="password"
                        value={openaiKeyInput}
                        onChange={(e) => setOpenaiKeyInput(e.target.value)}
                        placeholder="sk-proj-..."
                        className="liquid-glass-input w-full px-3 py-2 text-xs font-mono rounded-xl text-black dark:text-white focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase font-mono text-black/65 dark:text-white/65 mb-1">
                        ✨ Anthropic Key (Claude 3.7 / 3.5 Sonnet)
                      </label>
                      <input
                        type="password"
                        value={keyInput}
                        onChange={(e) => setKeyInput(e.target.value)}
                        placeholder="sk-ant-api03-..."
                        className="liquid-glass-input w-full px-3 py-2 text-xs font-mono rounded-xl text-black dark:text-white focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-1">
                    <p className="text-[11px] text-black/60 dark:text-white/60">
                      Keys are stored locally in your browser.
                    </p>
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.04, y: -1.5 }}
                      whileTap={{ scale: 0.93 }}
                      transition={APPLE_SPRING_BOUNCY}
                      onClick={handleSaveAllProviderKeys}
                      className="liquid-glass-active-pill shrink-0 px-4 py-1.5 rounded-full text-xs uppercase font-mono tracking-wider font-semibold"
                    >
                      Save AI Keys
                    </motion.button>
                  </div>
                </div>

                {/* Copyable MCP Config */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase tracking-wider font-medium text-black/75 dark:text-white/75">
                      Universal MCP Server Config (Sortn Sec + Canva MCP)
                    </span>
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.04, y: -1 }}
                      whileTap={{ scale: 0.93 }}
                      transition={APPLE_SPRING_SNAPPY}
                      onClick={handleCopyConfig}
                      className="liquid-glass-action flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[11px] font-mono text-black dark:text-white"
                    >
                      {copiedConfig ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-500" />
                          <span>Copied Config</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy JSON</span>
                        </>
                      )}
                    </motion.button>
                  </div>

                  <pre className="p-3.5 rounded-2xl bg-black text-white/90 text-[11px] font-mono overflow-x-auto border border-white/10">
                    {claudeDesktopConfigJson}
                  </pre>
                </div>
              </motion.div>
            )}
          </motion.div>

          {/* Fullscreen Client Perspective & Interactive Zoom Lightbox for Claude × Canva Designs (Strictly Below Navbar) */}
          {isFullscreenPreview && previewDataUrl && (
            <motion.div
              initial={{ opacity: 0, scale: 0.96, filter: "blur(10px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              transition={APPLE_SPRING_FLUID}
              onClick={() => setIsFullscreenPreview(false)}
              className="gpu-120hz fixed inset-0 z-50 bg-black/95 backdrop-blur-2xl flex flex-col justify-between pt-20 sm:pt-24 pb-4 px-4 sm:px-6 select-none"
              role="dialog"
              aria-modal="true"
              aria-label="Client Perspective Fullscreen & Zoom Inspector"
            >
              {/* Top Client Perspective Bar (Positioned cleanly below Navbar) */}
              <div
                onClick={(e) => e.stopPropagation()}
                className="relative z-20 flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 rounded-2xl border border-white/20 bg-white/[0.08] backdrop-blur-2xl shadow-[0_12px_36px_rgba(0,0,0,0.45),inset_0_1px_1px_rgba(255,255,255,0.28)] text-white"
              >
                <div className="flex items-center gap-3">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-widest bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Client Perspective • {aspectRatio}
                  </span>
                  <span className="text-xs font-medium tracking-wide truncate max-w-xs sm:max-w-md">
                    {headlineText || prompt || "Claude × Canva Master"}
                  </span>
                  <span className="hidden md:inline text-[11px] font-mono text-white/50">
                    Zoom: {Math.round(previewZoom * 100)}% (Scroll, Double-Click, or Drag to Pan)
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.04, y: -1 }}
                    whileTap={{ scale: 0.93 }}
                    transition={APPLE_SPRING_BOUNCY}
                    onClick={handleDownloadCanvas}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-mono uppercase tracking-wider bg-white/12 hover:bg-white/20 text-white border border-white/25 shadow-[inset_0_1px_1px_rgba(255,255,255,0.35)] transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download (sortnsec)</span>
                  </motion.button>

                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.04, y: -1 }}
                    whileTap={{ scale: 0.93 }}
                    transition={APPLE_SPRING_BOUNCY}
                    onClick={() => {
                      setIsFullscreenPreview(false);
                      handleAbsorbCanvasIntoGallery();
                    }}
                    className="liquid-glass-emerald flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-mono uppercase tracking-wider text-white font-semibold"
                  >
                    <span>Absorb into Gallery</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </motion.button>

                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    transition={APPLE_SPRING_BOUNCY}
                    onClick={() => setIsFullscreenPreview(false)}
                    className="p-2 rounded-full bg-white/12 hover:bg-white/25 border border-white/25 shadow-[inset_0_1px_1px_rgba(255,255,255,0.35)] text-white transition-colors"
                    aria-label="Exit Fullscreen"
                  >
                    <X className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>

              {/* Interactive Zoom & Pan Stage */}
              <div
                ref={fullscreenStageRef}
                onClick={(e) => e.stopPropagation()}
                onWheel={(e) => {
                  e.preventDefault();
                  const delta = e.deltaY < 0 ? 0.25 : -0.25;
                  setClampedPreviewZoom(previewZoom + delta);
                }}
                onDoubleClick={() =>
                  setClampedPreviewZoom(previewZoom > 1 ? 1 : 2.25)
                }
                onPointerDown={(e) => {
                  if (previewZoom <= 1) return;
                  e.preventDefault();
                  setIsPanningPreview(true);
                  panOriginRef.current = {
                    x: e.clientX,
                    y: e.clientY,
                    panX: previewPan.x,
                    panY: previewPan.y,
                  };
                }}
                onPointerMove={(e) => {
                  if (fullscreenStageRef.current) {
                    const rect =
                      fullscreenStageRef.current.getBoundingClientRect();
                    const xPct = Math.max(
                      0,
                      Math.min(100, ((e.clientX - rect.left) / rect.width) * 100)
                    );
                    const yPct = Math.max(
                      0,
                      Math.min(100, ((e.clientY - rect.top) / rect.height) * 100)
                    );
                    setLoupeCoords({
                      visible: true,
                      xPct,
                      yPct,
                      pxX: e.clientX - rect.left,
                      pxY: e.clientY - rect.top,
                    });
                  }
                  if (!isPanningPreview || previewZoom <= 1) return;
                  setPreviewPan({
                    x:
                      panOriginRef.current.panX +
                      (e.clientX - panOriginRef.current.x),
                    y:
                      panOriginRef.current.panY +
                      (e.clientY - panOriginRef.current.y),
                  });
                }}
                onPointerUp={() => setIsPanningPreview(false)}
                onPointerLeave={() => {
                  setIsPanningPreview(false);
                  setLoupeCoords((prev) => ({ ...prev, visible: false }));
                }}
                className={`relative flex-1 my-3 w-full h-[calc(100vh-14.5rem)] max-h-[calc(100vh-14.5rem)] flex items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-black/50 ${
                  previewZoom > 1
                    ? isPanningPreview
                      ? "cursor-grabbing"
                      : "cursor-grab"
                    : isLoupeActive
                    ? "cursor-crosshair"
                    : "cursor-zoom-in"
                }`}
              >
                <motion.img
                  src={previewDataUrl}
                  alt="Client Fullscreen Perspective"
                  draggable={false}
                  animate={{
                    scale: previewZoom,
                    x: previewPan.x,
                    y: previewPan.y,
                  }}
                  transition={
                    isPanningPreview ? { duration: 0 } : APPLE_SPRING_FLUID
                  }
                  className="w-full h-full object-cover rounded-2xl shadow-[0_24px_80px_rgba(0,0,0,0.85)] select-none"
                />

                {/* Optical Client Magnifier Loupe */}
                {isLoupeActive && loupeCoords.visible && (
                  <div
                    style={{
                      left: loupeCoords.pxX,
                      top: loupeCoords.pxY,
                      backgroundImage: `url(${previewDataUrl})`,
                      backgroundRepeat: "no-repeat",
                      backgroundSize: "340% 340%",
                      backgroundPosition: `${loupeCoords.xPct}% ${loupeCoords.yPct}%`,
                    }}
                    className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 z-30 w-44 h-44 rounded-full border-2 border-white shadow-[0_20px_60px_rgba(0,0,0,0.8)] ring-4 ring-black/40"
                  />
                )}
              </div>

              {/* Bottom Client Zoom Control Dock with Apple Golden Gate Liquid Glass */}
              <div
                onClick={(e) => e.stopPropagation()}
                className="relative z-20 mx-auto flex flex-wrap items-center justify-center gap-1.5 px-4 py-2 rounded-full border border-white/20 bg-white/[0.09] backdrop-blur-2xl shadow-[0_16px_44px_rgba(0,0,0,0.6),inset_0_1px_1px_rgba(255,255,255,0.35)] text-white text-xs font-mono"
              >
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  transition={APPLE_SPRING_SNAPPY}
                  onClick={() => setClampedPreviewZoom(previewZoom - 0.5)}
                  disabled={previewZoom <= 1}
                  className="p-1.5 rounded-full hover:bg-white/15 disabled:opacity-35"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-4 h-4" />
                </motion.button>

                {[1, 1.5, 2, 3, 4].map((z) => {
                  const isActiveZoom = Math.abs(previewZoom - z) < 0.1;
                  return (
                    <motion.button
                      key={z}
                      type="button"
                      whileHover={{ scale: 1.06 }}
                      whileTap={{ scale: 0.92 }}
                      transition={APPLE_SPRING_SNAPPY}
                      onClick={() => setClampedPreviewZoom(z)}
                      className={`relative px-3 py-1 rounded-full transition-colors ${
                        isActiveZoom
                          ? "text-black font-semibold"
                          : "text-white/75 hover:text-white hover:bg-white/10"
                      }`}
                    >
                      {isActiveZoom && (
                        <motion.span
                          layoutId="mcp-fullscreen-zoom-liquid-pill"
                          transition={APPLE_SPRING_BOUNCY}
                          className="absolute inset-0 rounded-full bg-white shadow-[0_4px_14px_rgba(255,255,255,0.3),inset_0_1px_1px_rgba(255,255,255,1)]"
                        />
                      )}
                      <span className="relative z-10">{z}x</span>
                    </motion.button>
                  );
                })}

                <motion.button
                  type="button"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  transition={APPLE_SPRING_SNAPPY}
                  onClick={() => setClampedPreviewZoom(previewZoom + 0.5)}
                  disabled={previewZoom >= 4}
                  className="p-1.5 rounded-full hover:bg-white/15 disabled:opacity-35"
                  title="Zoom In"
                >
                  <ZoomIn className="w-4 h-4" />
                </motion.button>

                <div className="h-4 w-[1px] bg-white/20 mx-1" />

                <motion.button
                  type="button"
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.92 }}
                  transition={APPLE_SPRING_BOUNCY}
                  onClick={() => setIsLoupeActive((prev) => !prev)}
                  className={`flex items-center gap-1.5 px-3.5 py-1 rounded-full transition-all ${
                    isLoupeActive
                      ? "liquid-glass-emerald text-white font-semibold"
                      : "text-white/85 hover:bg-white/15 border border-white/15"
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Optical Loupe</span>
                </motion.button>

                {(previewZoom > 1 ||
                  previewPan.x !== 0 ||
                  previewPan.y !== 0) && (
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.92 }}
                    transition={APPLE_SPRING_SNAPPY}
                    onClick={() => {
                      setPreviewZoom(1);
                      setPreviewPan({ x: 0, y: 0 });
                    }}
                    className="flex items-center gap-1 px-3 py-1 rounded-full bg-white/15 hover:bg-white/25 border border-white/20 text-white"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset</span>
                  </motion.button>
                )}
              </div>
            </motion.div>
          )}
        </div>
  );
}
