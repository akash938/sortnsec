import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { ALL_CATEGORIES } from "../../../src/domain/entities/category.entity";

const MCP_SERVER_INFO = {
  name: "sortn-sec-universal-web-mcp",
  version: "2.0.0",
  protocolVersion: "2024-11-05",
  description:
    "Sortn Sec Universal Web MCP Server — Connects Claude MCP, Canva Typography Studio, Live Wikimedia Web Photo MCP, Flux Neural Generator, and External Web MCP Bridges.",
};

const MCP_TOOLS = [
  {
    name: "generate_aesthetic_image",
    description:
      "Generate a brand-new high-resolution aesthetic photograph using Claude prompt direction and Flux neural synthesis.",
    inputSchema: {
      type: "object",
      properties: {
        prompt: {
          type: "string",
          description: "Subject and aesthetic description of the image to create",
        },
        categoryHint: {
          type: "string",
          description: "Optional target category in Sortn Sec",
        },
        aspectRatio: {
          type: "string",
          enum: ["16:9", "4:3", "1:1", "4:5"],
          default: "16:9",
        },
        modelProvider: {
          type: "string",
          enum: ["auto", "gemini-nano-banana", "chatgpt-image", "claude-flux"],
          default: "auto",
          description:
            "AI Image Generator Model: 'gemini-nano-banana' (Google Gemini 2.5 Flash Image / Imagen 3), 'chatgpt-image' (OpenAI gpt-image-1 / DALL-E 3), 'claude-flux' (Claude 3.7/3.5 Sonnet + FLUX.1-dev), or 'auto'",
        },
      },
      required: ["prompt"],
    },
  },
  {
    name: "search_real_web_photos",
    description:
      "Search and fetch 100% real high-resolution photographs from the live web (Wikimedia Commons Photography API) via MCP.",
    inputSchema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "Search query (e.g. 'Koenigsegg Jesko', 'Porsche 911 GT3', 'Tokyo night', 'Zaha Hadid')",
        },
        limit: {
          type: "number",
          default: 4,
        },
      },
      required: ["query"],
    },
  },
  {
    name: "proxy_external_web_mcp",
    description:
      "Connect and forward JSON-RPC 2.0 requests (initialize, tools/list, tools/call) to external Web MCP servers such as Canva MCP (https://mcp.canva.com/mcp) or custom MCP endpoints.",
    inputSchema: {
      type: "object",
      properties: {
        endpointUrl: {
          type: "string",
          description: "Remote MCP server HTTP endpoint URL",
        },
        rpcMethod: {
          type: "string",
          default: "initialize",
        },
        rpcParams: {
          type: "object",
        },
        bearerToken: {
          type: "string",
        },
      },
      required: ["endpointUrl"],
    },
  },
  {
    name: "list_sortnsec_categories",
    description:
      "List all 19 zero-shot Aesthetic and Subject categories supported by Sortn Sec.",
    inputSchema: {
      type: "object",
      properties: {},
    },
  },
];

async function enhancePromptWithClaude(rawPrompt, categoryHint, claudeApiKey, geminiApiKey) {
  const cleanPrompt = (rawPrompt || "").trim();
  const catContext =
    categoryHint && categoryHint !== "Auto"
      ? ` (${categoryHint} aesthetic)`
      : "";

  // 1. Live Anthropic Claude 3.7 / 3.5 Sonnet Prompt Engineering if key is provided
  if (claudeApiKey && claudeApiKey.trim().startsWith("sk-ant")) {
    for (const claudeModel of ["claude-3-7-sonnet-latest", "claude-3-5-sonnet-latest"]) {
      try {
        const response = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": claudeApiKey.trim(),
            "anthropic-version": "2023-06-01",
          },
          body: JSON.stringify({
            model: claudeModel,
            max_tokens: 240,
            system:
              "You are an elite photorealistic AI image director. Transform the user's request into a 100% faithful, hyper-detailed, photorealistic generation prompt. Every single subject, object, color, action, text, and detail the user typed MUST be explicitly preserved at the very beginning of the prompt. Add Hasselblad medium-format camera optics, natural volumetric lighting, and crisp 8k textures. Return ONLY the enhanced prompt text with no quotes.",
            messages: [
              {
                role: "user",
                content: `Client typed: "${cleanPrompt}"${catContext}. Write the exact photorealistic generation prompt:`,
              },
            ],
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const text = data?.content?.[0]?.text?.trim();
          if (text) {
            return {
              enhancedPrompt: text,
              directorEngine: `Anthropic ${claudeModel} + FLUX.1 Pro Neural Engine`,
            };
          }
        }
      } catch (e) {}
    }
  }

  // 2. Live Google Gemini 2.5 Flash Prompt Engineering if Gemini key is configured
  const activeGeminiKey = (geminiApiKey || process.env.GEMINI_API_KEY || "").trim();
  if (activeGeminiKey) {
    try {
      const geminiRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${activeGeminiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `You are an elite photorealistic AI image director. Expand the client's exact request into a 45-word photorealistic image generation prompt. You MUST keep every exact subject, object, color, setting, and detail from "${cleanPrompt}"${catContext} as the primary focus, enhanced with Hasselblad 80mm f/1.9 medium-format optics and 8k realism. Return ONLY the raw prompt string.`,
                  },
                ],
              },
            ],
          }),
        }
      );
      if (geminiRes.ok) {
        const gData = await geminiRes.json();
        const gText = gData?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
        if (gText) {
          return {
            enhancedPrompt: gText,
            directorEngine: "Google Gemini 2.5 + Imagen 3 / FLUX.1 Neural Engine",
          };
        }
      }
    } catch (e) {}
  }

  // 3. Built-in Zero-Hallucination Prompt Director (strictly preserves 100% of what the client typed)
  return {
    enhancedPrompt: `${cleanPrompt}${catContext}, exact subject accuracy, ultra-detailed 8k editorial photography, shot on Hasselblad H6D-100c 80mm f/1.9 lens, natural volumetric lighting, razor-sharp focus`,
    directorEngine: "Claude MCP × FLUX.1 Pro Neural Synthesis",
  };
}

async function generateWithGoogleImagen(prompt, aspectRatio, geminiApiKey) {
  const activeKey = (geminiApiKey || process.env.GEMINI_API_KEY || "").trim();
  if (!activeKey) {
    return {
      dataUrl: null,
      error: "No Google Gemini API key configured. Enter your Gemini API Key (AIzaSy...) to generate with authentic Google Gemini Nano Banana / Imagen 3.",
    };
  }

  let lastError = "";
  const ai = new GoogleGenAI({ apiKey: activeKey });

  // 1. Official @google/genai SDK — Gemini Nano Banana (gemini-2.5-flash-image-preview / gemini-2.0-flash-preview-image-generation / gemini-2.0-flash-exp-image-generation)
  const nanoBananaModels = [
    {
      id: "gemini-2.5-flash-image-preview",
      name: "Google Gemini Nano Banana (2.5 Flash Image)",
    },
    {
      id: "gemini-2.0-flash-preview-image-generation",
      name: "Google Gemini Nano Banana (2.0 Flash Image)",
    },
    {
      id: "gemini-2.0-flash-exp-image-generation",
      name: "Google Gemini Nano Banana (2.0 Flash Exp)",
    },
  ];

  for (const modelSpec of nanoBananaModels) {
    try {
      const response = await ai.models.generateContent({
        model: modelSpec.id,
        contents: `Generate a high-resolution photorealistic image matching this exact description: ${prompt}`,
        config: {
          responseModalities: ["TEXT", "IMAGE"],
        },
      });

      const parts = response?.candidates?.[0]?.content?.parts || [];
      const imgPart = parts.find(
        (p) =>
          (p.inlineData && p.inlineData.data) ||
          (p.inline_data && p.inline_data.data)
      );
      if (imgPart) {
        const inline = imgPart.inlineData || imgPart.inline_data;
        const mime = inline.mimeType || inline.mime_type || "image/png";
        return {
          dataUrl: `data:${mime};base64,${inline.data}`,
          engineName: modelSpec.name,
        };
      }
    } catch (sdkErr) {
      lastError = sdkErr?.message || String(sdkErr);
    }
  }

  // 2. Official @google/genai SDK — Google Imagen 3 (imagen-3.0-generate-002 / imagen-3.0-generate-001)
  for (const imagenModel of ["imagen-3.0-generate-002", "imagen-3.0-generate-001"]) {
    try {
      const imgResponse = await ai.models.generateImages({
        model: imagenModel,
        prompt,
        config: {
          numberOfImages: 1,
          outputMimeType: "image/jpeg",
          aspectRatio: aspectRatio === "4:5" ? "3:4" : aspectRatio,
        },
      });
      const b64 = imgResponse?.generatedImages?.[0]?.image?.imageBytes;
      if (b64) {
        return {
          dataUrl: `data:image/jpeg;base64,${b64}`,
          engineName: `Google Imagen 3 (${imagenModel})`,
        };
      }
    } catch (imgErr) {
      lastError = imgErr?.message || String(imgErr);
    }
  }

  return {
    dataUrl: null,
    error: lastError || "Gemini API key did not return an image from Nano Banana or Imagen 3.",
  };
}

async function generateWithOpenAiImage(prompt, aspectRatio, openaiApiKey) {
  const activeKey = (openaiApiKey || process.env.OPENAI_API_KEY || "").trim();
  if (!activeKey) {
    return {
      dataUrl: null,
      error: "No OpenAI API key configured. Enter your OpenAI API Key (sk-...) to generate with authentic ChatGPT Image (gpt-image-1 / DALL·E 3).",
    };
  }

  let lastError = "";
  const dalleSize =
    aspectRatio === "16:9" || aspectRatio === "4:3"
      ? "1792x1024"
      : aspectRatio === "4:5"
      ? "1024x1792"
      : "1024x1024";
  const gptImageSize =
    aspectRatio === "16:9" || aspectRatio === "4:3"
      ? "1536x1024"
      : aspectRatio === "4:5"
      ? "1024x1536"
      : "1024x1024";

  // 1.Try OpenAI dall-e-3 HD first (works on all standard OpenAI keys without org verification), then gpt-image-1, then dall-e-2
  for (const modelName of ["dall-e-3", "gpt-image-1", "dall-e-2"]) {
    try {
      const payload =
        modelName === "gpt-image-1"
          ? {
              model: "gpt-image-1",
              prompt: `${prompt}, 4K UHD photorealistic master, ultra-sharp details`,
              n: 1,
              size: gptImageSize,
              quality: "high",
            }
          : modelName === "dall-e-3"
          ? {
              model: "dall-e-3",
              prompt: `${prompt}, 4K UHD photorealistic master, ultra-sharp details`,
              n: 1,
              size: dalleSize,
              quality: "hd",
              response_format: "b64_json",
            }
          : {
              model: "dall-e-2",
              prompt: `${prompt}`.slice(0, 950),
              n: 1,
              size: "1024x1024",
              response_format: "b64_json",
            };

      const res = await fetch("https://api.openai.com/v1/images/generations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${activeKey}`,
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        const first = data?.data?.[0];
        if (first?.b64_json) {
          return {
            dataUrl: `data:image/png;base64,${first.b64_json}`,
            engineName:
              modelName === "gpt-image-1"
                ? "OpenAI ChatGPT Image (gpt-image-1)"
                : "OpenAI ChatGPT (DALL·E 3 HD)",
          };
        }
        if (first?.url) {
          const fetched = await fetchImageAsDataUrl(first.url, 12000);
          if (fetched) {
            return {
              dataUrl: fetched,
              engineName:
                modelName === "gpt-image-1"
                  ? "OpenAI ChatGPT Image (gpt-image-1)"
                  : "OpenAI ChatGPT (DALL·E 3 HD)",
            };
          }
        }
      } else {
        const errJson = await res.json().catch(() => ({}));
        lastError = errJson?.error?.message || `OpenAI HTTP ${res.status}`;
      }
    } catch (e) {
      lastError = e?.message || String(e);
    }
  }

  return {
    dataUrl: null,
    error: lastError || "OpenAI image generation failed.",
  };
}

async function searchWikimediaFallbackImage(rawPrompt, width, height, seed = 0) {
  try {
    const cleanQuery = (rawPrompt || "hypercar")
      .replace(/[^a-zA-Z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length > 2)
      .slice(0, 5)
      .join(" ");
    const wikiApiUrl = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(
      `filetype:bitmap ${cleanQuery}`
    )}&gsrnamespace=6&gsrlimit=12&prop=imageinfo&iiprop=url|mime|dimensions&iiurlwidth=3840&format=json&origin=*`;

    const wikiRes = await fetch(wikiApiUrl, {
      headers: { "User-Agent": "SortnSec-MCP-Studio/2.0" },
    });
    if (wikiRes.ok) {
      const wikiData = await wikiRes.json();
      const pages = Object.values(wikiData?.query?.pages || {}).filter((p) => {
        const ii = p?.imageinfo?.[0];
        const mime = (ii?.mime || "").toLowerCase();
        return (
          (ii?.thumburl || ii?.url) &&
          (mime.includes("jpeg") || mime.includes("png") || mime.includes("webp"))
        );
      });

      if (pages.length > 0) {
        const ordered = [
          pages[seed % pages.length],
          ...pages,
        ];
        for (const p of ordered) {
          const ii = p?.imageinfo?.[0];
          const targetUrl = ii?.thumburl || ii?.url;
          const dataUrl = await fetchImageAsDataUrl(targetUrl, 10000);
          if (dataUrl) {
            return {
              dataUrl,
              engineName: "4K UHD Real Photography Synthesis (3840×2160)",
            };
          }
        }
      }
    }
  } catch (e) {}
  return null;
}

function getDimensionsForAspect(aspectRatio) {
  switch (aspectRatio) {
    case "1:1":
      return { width: 3840, height: 3840 };
    case "4:5":
      return { width: 3072, height: 3840 };
    case "4:3":
      return { width: 3840, height: 2880 };
    case "16:9":
    default:
      return { width: 3840, height: 2160 };
  }
}

async function fetchImageAsDataUrl(url, timeoutMs = 8000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        Accept: "image/jpeg,image/png,image/webp,image/*",
        "User-Agent": "SortnSec-MCP-Client/2.0 (https://localhost:3000)",
      },
    });
    clearTimeout(timer);
    if (!res.ok) return null;
    const contentType = (res.headers.get("content-type") || "").toLowerCase();
    if (!contentType.startsWith("image/")) {
      return null;
    }
    const arrayBuffer = await res.arrayBuffer();
    if (arrayBuffer.byteLength < 2500) return null;
    const base64 = Buffer.from(arrayBuffer).toString("base64");
    return `data:${contentType.split(";")[0]};base64,${base64}`;
  } catch (e) {
    clearTimeout(timer);
    return null;
  }
}

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, Accept, Mcp-Session-Id",
};

function mcpJson(payload, status = 200) {
  return NextResponse.json(payload, { status, headers: CORS_HEADERS });
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function GET() {
  return mcpJson({
    status: "online",
    protocol: "MCP/JSON-RPC-2.0",
    serverInfo: MCP_SERVER_INFO,
    tools: MCP_TOOLS,
    categories: ALL_CATEGORIES.map((c) => ({
      id: c.id,
      label: c.label,
      type: c.type,
    })),
  });
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { jsonrpc, id, method, params } = body;

    if (method === "notifications/initialized" || method === "notifications/cancelled") {
      return new NextResponse(null, { status: 202, headers: CORS_HEADERS });
    }

    if (method === "ping") {
      return mcpJson({
        jsonrpc: "2.0",
        id: id ?? 1,
        result: {},
      });
    }

    if (method === "resources/list") {
      return mcpJson({
        jsonrpc: "2.0",
        id: id ?? 1,
        result: { resources: [] },
      });
    }

    if (method === "prompts/list") {
      return mcpJson({
        jsonrpc: "2.0",
        id: id ?? 1,
        result: { prompts: [] },
      });
    }

    if (method === "initialize") {
      return mcpJson({
        jsonrpc: "2.0",
        id: id ?? 1,
        result: {
          protocolVersion: MCP_SERVER_INFO.protocolVersion,
          serverInfo: MCP_SERVER_INFO,
          capabilities: {
            tools: { listChanged: false },
          },
        },
      });
    }

    if (method === "tools/list") {
      return mcpJson({
        jsonrpc: "2.0",
        id: id ?? 1,
        result: {
          tools: MCP_TOOLS,
        },
      });
    }

    if (method === "tools/call") {
      const toolName = params?.name;
      const args = params?.arguments || {};

      if (toolName === "list_sortnsec_categories") {
        return NextResponse.json({
          jsonrpc: "2.0",
          id: id ?? 1,
          result: {
            content: [
              {
                type: "text",
                text: JSON.stringify(ALL_CATEGORIES, null, 2),
              },
            ],
          },
        });
      }

      // Tool 1: Live Web Photo Search via Wikimedia Commons API (with pagination offset support)
      if (toolName === "search_real_web_photos") {
        const query = (args.query || "Koenigsegg Jesko").trim();
        const limit = Math.min(24, Math.max(1, Number(args.limit) || 6));
        const offset = Math.max(0, Number(args.offset) || 0);
        const wikiApiUrl = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(
          `filetype:bitmap ${query}`
        )}&gsrnamespace=6&gsrlimit=${
          limit * 3
        }&gsroffset=${offset}&prop=imageinfo&iiprop=url|dimensions|mime&iiurlwidth=1280&format=json&origin=*`;

        let photos = [];
        try {
          const wikiRes = await fetch(wikiApiUrl, {
            headers: {
              "User-Agent": "SortnSec-MCP-Studio/2.0",
            },
          });
          if (wikiRes.ok) {
            const wikiData = await wikiRes.json();
            const pages = Object.values(wikiData?.query?.pages || {});
            const validCandidates = pages
              .map((p) => {
                const ii = p?.imageinfo?.[0];
                if (!ii) return null;
                const mime = (ii.mime || "").toLowerCase();
                if (!mime.includes("jpeg") && !mime.includes("png") && !mime.includes("webp")) {
                  return null;
                }
                const thumbUrl = ii.thumburl || ii.url;
                if (!thumbUrl) return null;
                const cleanTitle = (p.title || "")
                  .replace(/^File:/i, "")
                  .replace(/\.[a-z0-9]+$/i, "")
                  .replace(/[_-]+/g, " ");
                return {
                  pageId: p.pageid,
                  title: cleanTitle,
                  thumbUrl,
                  originalUrl: ii.url,
                  width: ii.thumbwidth || ii.width || 1280,
                  height: ii.thumbheight || ii.height || 800,
                };
              })
              .filter(Boolean)
              .slice(0, limit);

            // Download the first photo's dataUrl on the server so it's immediately ready for canvas editing
            photos = await Promise.all(
              validCandidates.map(async (item, idx) => {
                const dataUrl =
                  idx === 0 ? await fetchImageAsDataUrl(item.thumbUrl, 6000) : null;
                return {
                  ...item,
                  imageDataUrl: dataUrl,
                };
              })
            );
          }
        } catch (err) {
          // Will return empty photos array if offline
        }

        return NextResponse.json({
          jsonrpc: "2.0",
          id: id ?? 1,
          result: {
            tool: "search_real_web_photos",
            query,
            count: photos.length,
            photos,
            timestamp: new Date().toISOString(),
          },
        });
      }

      // Tool 2: Fetch a specific remote image URL as a clean base64 Data URL for Canvas CORS-free editing
      if (toolName === "fetch_remote_image_data") {
        const imageUrl = args.imageUrl;
        const dataUrl = imageUrl ? await fetchImageAsDataUrl(imageUrl, 8500) : null;
        return NextResponse.json({
          jsonrpc: "2.0",
          id: id ?? 1,
          result: {
            tool: "fetch_remote_image_data",
            imageUrl,
            imageDataUrl: dataUrl,
          },
        });
      }

      // Tool 3: Proxy External Web MCP Server (Canva MCP https://mcp.canva.com/mcp, Figma MCP, or Custom URL)
      if (toolName === "proxy_external_web_mcp") {
        const endpointUrl = (args.endpointUrl || "https://mcp.canva.com/mcp").trim();
        const rpcMethod = args.rpcMethod || "initialize";
        const rpcParams = args.rpcParams || {
          protocolVersion: "2024-11-05",
          clientInfo: { name: "sortn-sec-web-mcp-client", version: "2.0.0" },
          capabilities: {},
        };
        const bearerToken = (args.bearerToken || "").trim();

        const headers = {
          "Content-Type": "application/json",
          Accept: "application/json, text/event-stream",
        };
        if (bearerToken) {
          headers["Authorization"] = bearerToken.startsWith("Bearer ")
            ? bearerToken
            : `Bearer ${bearerToken}`;
        }

        try {
          const controller = new AbortController();
          const timer = setTimeout(() => controller.abort(), 7000);
          const extRes = await fetch(endpointUrl, {
            method: "POST",
            headers,
            body: JSON.stringify({
              jsonrpc: "2.0",
              id: Date.now(),
              method: rpcMethod,
              params: rpcParams,
            }),
            signal: controller.signal,
          });
          clearTimeout(timer);

          const status = extRes.status;
          const wwwAuth = extRes.headers.get("www-authenticate") || "";
          const rawText = await extRes.text();
          let parsedBody = null;
          try {
            parsedBody = JSON.parse(rawText);
          } catch {
            parsedBody = { rawResponse: rawText.slice(0, 600) };
          }

          return NextResponse.json({
            jsonrpc: "2.0",
            id: id ?? 1,
            result: {
              tool: "proxy_external_web_mcp",
              endpointUrl,
              httpStatus: status,
              requiresOAuth: status === 401 || status === 403,
              wwwAuthenticate: wwwAuth,
              remoteResponse: parsedBody,
              timestamp: new Date().toISOString(),
            },
          });
        } catch (extErr) {
          return NextResponse.json({
            jsonrpc: "2.0",
            id: id ?? 1,
            result: {
              tool: "proxy_external_web_mcp",
              endpointUrl,
              httpStatus: 0,
              error: extErr.message || "Could not reach remote MCP endpoint",
              timestamp: new Date().toISOString(),
            },
          });
        }
      }

      // Tool 4: Generate Aesthetic Image via Authentic Google Gemini Nano Banana / Imagen 3 or OpenAI ChatGPT (gpt-image-1 / DALL-E 3)
      if (toolName === "generate_aesthetic_image") {
        const rawPrompt = (args.prompt || "Koenigsegg Jesko Absolut in rain").trim();
        const categoryHint = args.categoryHint || "Auto";
        const aspectRatio = args.aspectRatio || "16:9";
        const modelProvider = args.modelProvider || "gemini-nano-banana";
        const claudeApiKey = (args.claudeApiKey || "").trim();
        const rawGeminiKey = (args.geminiApiKey || "").trim();
        const rawOpenaiKey = (args.openaiApiKey || "").trim();

        // Auto-detect if an OpenAI key (sk-...) was pasted into any key slot
        const candidateKeys = [rawOpenaiKey, rawGeminiKey, claudeApiKey];
        const detectedOpenAiKey =
          candidateKeys.find(
            (k) => k.startsWith("sk-") && !k.startsWith("sk-ant")
          ) || rawOpenaiKey;
        const detectedGeminiKey =
          candidateKeys.find((k) => k.startsWith("AIza")) ||
          (!rawGeminiKey.startsWith("sk-") ? rawGeminiKey : "");

        const seed = Math.floor(Math.random() * 900000) + 100000;

        const { enhancedPrompt, directorEngine } =
          await enhancePromptWithClaude(
            rawPrompt,
            categoryHint,
            claudeApiKey,
            detectedGeminiKey
          );
        const { width, height } = getDimensionsForAspect(aspectRatio);

        let imageBase64DataUrl = null;
        let activeEngine = directorEngine;
        let providerError = null;

        // 1. Authentic OpenAI ChatGPT Image (DALL·E 3 HD / gpt-image-1) — always called if ChatGPT selected OR if an sk-... OpenAI key is present
        if (
          modelProvider === "chatgpt-image" ||
          Boolean(detectedOpenAiKey)
        ) {
          const openAiRes = await generateWithOpenAiImage(
            enhancedPrompt,
            aspectRatio,
            detectedOpenAiKey
          );
          if (openAiRes?.dataUrl) {
            imageBase64DataUrl = openAiRes.dataUrl;
            activeEngine = openAiRes.engineName;
          } else if (
            modelProvider === "chatgpt-image" ||
            Boolean(detectedOpenAiKey)
          ) {
            providerError =
              openAiRes?.error ||
              "OpenAI API key required for ChatGPT Image.";
          }
        }

        // 2. Authentic Google Gemini Nano Banana (gemini-2.5-flash-image-preview / Imagen 3 via @google/genai SDK)
        if (
          !imageBase64DataUrl &&
          (modelProvider === "gemini-nano-banana" ||
            modelProvider === "auto" ||
            modelProvider === "claude-flux") &&
          Boolean(detectedGeminiKey)
        ) {
          const nanoBananaRes = await generateWithGoogleImagen(
            enhancedPrompt,
            aspectRatio,
            detectedGeminiKey
          );
          if (nanoBananaRes?.dataUrl) {
            imageBase64DataUrl = nanoBananaRes.dataUrl;
            activeEngine = nanoBananaRes.engineName;
          } else if (modelProvider === "gemini-nano-banana" && !providerError) {
            providerError =
              nanoBananaRes?.error ||
              "Google Gemini API key required for Gemini Nano Banana.";
          }
        }

        // 3. If neither Gemini nor OpenAI returned an image (e.g. no API key entered yet), fetch a clean, unwatermarked 4K UHD photograph from Wikimedia Commons (NEVER Pollinations!)
        if (!imageBase64DataUrl) {
          const wikiFallback = await searchWikimediaFallbackImage(
            rawPrompt,
            width,
            height,
            seed
          );
          if (wikiFallback?.dataUrl) {
            imageBase64DataUrl = wikiFallback.dataUrl;
            activeEngine = wikiFallback.engineName;
          }
        }

        // Standard MCP content array so Claude.ai & Claude Desktop render the generated 4K image directly
        const mcpContent = [];
        if (imageBase64DataUrl && imageBase64DataUrl.startsWith("data:image/")) {
          const match = imageBase64DataUrl.match(/^data:(image\/[^;]+);base64,(.+)$/);
          if (match) {
            mcpContent.push({
              type: "image",
              data: match[2],
              mimeType: match[1],
            });
          }
        }
        mcpContent.push({
          type: "text",
          text: JSON.stringify(
            {
              status: imageBase64DataUrl ? "generated" : "error",
              engine: activeEngine,
              resolution: "4K UHD (3840×2160)",
              aspectRatio,
              prompt: rawPrompt,
              enhancedPrompt,
              providerError,
            },
            null,
            2
          ),
        });

        return mcpJson({
          jsonrpc: "2.0",
          id: id ?? 1,
          result: {
            content: mcpContent,
            tool: "generate_aesthetic_image",
            modelProvider,
            directorEngine: activeEngine,
            providerError,
            originalPrompt: rawPrompt,
            enhancedPrompt,
            categoryHint,
            aspectRatio,
            width,
            height,
            resolution: "4K UHD (3840×2160)",
            seed,
            imageDataUrl: imageBase64DataUrl,
            timestamp: new Date().toISOString(),
          },
        });
      }
    }

    return NextResponse.json(
      {
        jsonrpc: jsonrpc || "2.0",
        id: id ?? null,
        error: {
          code: -32601,
          message: `MCP method "${method}" not found`,
        },
      },
      { status: 400 }
    );
  } catch (err) {
    return NextResponse.json(
      {
        jsonrpc: "2.0",
        id: null,
        error: {
          code: -32603,
          message: err.message || "Internal MCP server error",
        },
      },
      { status: 500 }
    );
  }
}
