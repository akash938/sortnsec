"use client";

/**
 * Infrastructure Adapter: Universal Web MCP Client (Claude MCP + Canva Studio + Live Web Photo Search + External Web MCP Proxy)
 * Communicates with `/api/mcp` using JSON-RPC 2.0 (`initialize`, `tools/list`, `tools/call`).
 */
export class ClaudeMcpAdapter {
  async initializeSession() {
    const rpcRequest = {
      jsonrpc: "2.0",
      id: Date.now(),
      method: "initialize",
      params: {
        protocolVersion: "2024-11-05",
        clientInfo: {
          name: "sortn-sec-web-mcp-host",
          version: "2.0.0",
        },
      },
    };

    const res = await fetch("/api/mcp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(rpcRequest),
    });

    if (!res.ok) {
      throw new Error("Failed to initialize MCP session");
    }

    const data = await res.json();
    return {
      rpcRequest,
      rpcResponse: data,
    };
  }

  async searchWebPhotosViaMcp({ query, limit = 6, offset = 0 }) {
    const rpcRequest = {
      jsonrpc: "2.0",
      id: Date.now(),
      method: "tools/call",
      params: {
        name: "search_real_web_photos",
        arguments: { query, limit, offset },
      },
    };

    const res = await fetch("/api/mcp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(rpcRequest),
    });

    if (!res.ok) {
      throw new Error(`Web MCP photo search failed (${res.status})`);
    }

    const rpcResponse = await res.json();
    return {
      photos: rpcResponse?.result?.photos || [],
      rpcRequest,
      rpcResponse,
    };
  }

  async fetchRemoteImageDataViaMcp(imageUrl) {
    const rpcRequest = {
      jsonrpc: "2.0",
      id: Date.now(),
      method: "tools/call",
      params: {
        name: "fetch_remote_image_data",
        arguments: { imageUrl },
      },
    };

    const res = await fetch("/api/mcp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(rpcRequest),
    });

    if (!res.ok) return null;
    const data = await res.json();
    return data?.result?.imageDataUrl || null;
  }

  async probeExternalMcpServer({
    endpointUrl,
    rpcMethod = "initialize",
    bearerToken = "",
  }) {
    const rpcRequest = {
      jsonrpc: "2.0",
      id: Date.now(),
      method: "tools/call",
      params: {
        name: "proxy_external_web_mcp",
        arguments: {
          endpointUrl,
          rpcMethod,
          bearerToken,
        },
      },
    };

    const res = await fetch("/api/mcp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(rpcRequest),
    });

    const rpcResponse = await res.json();
    return {
      result: rpcResponse?.result,
      rpcRequest,
      rpcResponse,
    };
  }

  async generateImageViaMcp({
    prompt,
    categoryHint = "Auto",
    aspectRatio = "16:9",
    modelProvider = "auto",
    claudeApiKey = "",
    geminiApiKey = "",
    openaiApiKey = "",
  }) {
    const activeGeminiKey =
      geminiApiKey ||
      (typeof window !== "undefined"
        ? localStorage.getItem("sortn-sec-gemini-key") || ""
        : "");
    const activeOpenAiKey =
      openaiApiKey ||
      (typeof window !== "undefined"
        ? localStorage.getItem("sortn-sec-openai-key") || ""
        : "");

    const rpcRequest = {
      jsonrpc: "2.0",
      id: Date.now(),
      method: "tools/call",
      params: {
        name: "generate_aesthetic_image",
        arguments: {
          prompt,
          categoryHint,
          aspectRatio,
          modelProvider,
          claudeApiKey,
          geminiApiKey: activeGeminiKey,
          openaiApiKey: activeOpenAiKey,
        },
      },
    };

    const res = await fetch("/api/mcp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(rpcRequest),
    });

    if (!res.ok) {
      throw new Error(`MCP call failed with status ${res.status}`);
    }

    const rpcResponse = await res.json();
    const result = rpcResponse?.result;
    if (!result) {
      throw new Error(rpcResponse?.error?.message || "Invalid MCP response");
    }

    const slug = (prompt || "claude_mcp_creation")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "")
      .slice(0, 32);
    const fileName = `claude_mcp_${slug}_${result.seed}.jpg`;

    // 1. If server already fetched verified image bytes (from Google Gemini Nano Banana / Imagen 3, OpenAI ChatGPT gpt-image-1 / DALL·E 3, or Wikimedia Commons):
    if (result.imageDataUrl && result.imageDataUrl.startsWith("data:image/")) {
      const blob = await (await fetch(result.imageDataUrl)).blob();
      const file = new File([blob], fileName, {
        type: "image/jpeg",
        lastModified: Date.now(),
      });
      return {
        file,
        previewUrl: result.imageDataUrl,
        rpcRequest,
        rpcResponse,
        meta: result,
        source: "generated",
      };
    }

    // 2. Try live Wikimedia Web Photo Search for the prompt before falling back to local manifest (Zero Pollinations watermarks!)
    try {
      const webSearch = await this.searchWebPhotosViaMcp({
        query: prompt,
        limit: 2,
      });
      const firstWithData = webSearch.photos.find((p) =>
        p.imageDataUrl?.startsWith("data:image/")
      );
      if (firstWithData) {
        const blob = await (await fetch(firstWithData.imageDataUrl)).blob();
        const file = new File([blob], fileName, {
          type: "image/jpeg",
          lastModified: Date.now(),
        });
        return {
          file,
          previewUrl: firstWithData.imageDataUrl,
          rpcRequest,
          rpcResponse,
          meta: {
            ...result,
            directorEngine: `${result.directorEngine} + Wikimedia Commons Live Web MCP`,
          },
          source: "web-mcp",
        };
      }
    } catch (e) {}

    // 3. Local Studio Synthesis (matches prompt/category to curated 71 real high-aesthetic assets — 4K UHD 3840x2160, zero third-party watermarks)
    const { file, previewUrl } = await this.synthesizeLocalStudioImage({
      prompt,
      categoryHint,
      width: result.width || 3840,
      height: result.height || 2160,
      seed: result.seed || Date.now(),
      fileName,
    });

    return {
      file,
      previewUrl,
      rpcRequest,
      rpcResponse,
      meta: result,
      source: "studio-master",
    };
  }

  async synthesizeLocalStudioImage({
    prompt,
    categoryHint,
    width,
    height,
    seed,
    fileName,
  }) {
    let manifest = [];
    try {
      const mRes = await fetch("/samples/manifest.json");
      if (mRes.ok) {
        manifest = await mRes.json();
      }
    } catch (e) {}

    const lowerPrompt = (prompt || "").toLowerCase();
    let matchedEntry = null;

    const keywordMap = [
      { kw: ["koenigsegg", "jesko", "agera", "car", "hypercar", "supercar", "bugatti", "ferrari", "porsche", "mclaren", "f1", "bmw", "gt3"], cat: "Cars" },
      { kw: ["cyberpunk", "neon", "tokyo", "blade runner", "futuristic", "sci-fi", "synth"], cat: "Cyberpunk" },
      { kw: ["dark academia", "library", "gothic", "oxford", "book", "candle", "scholar", "vintage"], cat: "Dark Academia" },
      { kw: ["architecture", "zaha", "brutalist", "building", "museum", "villa", "concrete", "pavilion"], cat: "Architecture" },
      { kw: ["food", "michelin", "ramen", "sushi", "wagyu", "espresso", "dessert", "cuisine", "dish"], cat: "Food" },
      { kw: ["animal", "panther", "wolf", "leopard", "owl", "eagle", "tiger", "fox", "wildlife"], cat: "Animals" },
      { kw: ["nature", "mountain", "forest", "waterfall", "glacier", "alps", "patagonia", "lake"], cat: "Nature" },
      { kw: ["sunset", "sky", "aurora", "clouds", "golden hour", "twilight", "galaxy"], cat: "Sunset/Sky" },
      { kw: ["fashion", "couture", "runway", "vogue", "editorial"], cat: "Fashion" },
      { kw: ["portrait", "face", "model", "studio", "headshot"], cat: "Portrait" },
      { kw: ["minimal", "zen", "monochrome", "clean", "geometric"], cat: "Minimalist" },
      { kw: ["travel", "amalfi", "kyoto", "santorini", "venice", "cappadocia"], cat: "Travel" },
    ];

    let targetCategory =
      categoryHint && categoryHint !== "Auto" ? categoryHint : null;

    if (!targetCategory) {
      for (const rule of keywordMap) {
        if (rule.kw.some((k) => lowerPrompt.includes(k))) {
          targetCategory = rule.cat;
          break;
        }
      }
    }

    if (manifest.length > 0) {
      const directMatches = manifest.filter((item) =>
        lowerPrompt
          .split(/\s+/)
          .some((word) => word.length > 3 && item.name.toLowerCase().includes(word))
      );

      if (directMatches.length > 0) {
        matchedEntry = directMatches[seed % directMatches.length];
      } else if (targetCategory) {
        const catMatches = manifest.filter(
          (item) => item.category.toLowerCase() === targetCategory.toLowerCase()
        );
        if (catMatches.length > 0) {
          matchedEntry = catMatches[seed % catMatches.length];
        }
      }

      if (!matchedEntry) {
        matchedEntry = manifest[seed % manifest.length];
      }
    }

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
    }

    if (matchedEntry) {
      try {
        const img = await new Promise((resolve, reject) => {
          const el = new Image();
          el.crossOrigin = "anonymous";
          el.onload = () => resolve(el);
          el.onerror = reject;
          el.src = matchedEntry.path;
        });

        const scale = Math.max(width / img.width, height / img.height);
        const sw = width / scale;
        const sh = height / scale;
        const sx = (img.width - sw) / 2;
        const sy = (img.height - sh) / 2;

        ctx.filter = "contrast(1.06) saturate(1.08)";
        ctx.drawImage(img, sx, sy, sw, sh, 0, 0, width, height);
        ctx.filter = "none";
      } catch (e) {
        ctx.fillStyle = "#111111";
        ctx.fillRect(0, 0, width, height);
      }
    }

    const dataUrl = canvas.toDataURL("image/jpeg", 0.96);
    const blob = await (await fetch(dataUrl)).blob();
    const file = new File([blob], fileName, {
      type: "image/jpeg",
      lastModified: Date.now(),
    });

    return { file, previewUrl: dataUrl };
  }
}
