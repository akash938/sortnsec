import { NextResponse } from "next/server";
import { ALL_CATEGORIES } from "../../../src/domain/entities/category.entity";
export async function POST(req) {
    try {
        const body = await req.json();
        const { images, apiKey: clientApiKey } = body;
        const apiKey = (clientApiKey || process.env.GEMINI_API_KEY || "").trim();
        if (!apiKey) {
            return NextResponse.json({ error: "No Gemini API key configured.", fallbackToLocal: true }, { status: 400 });
        }
        if (!images || !Array.isArray(images) || images.length === 0) {
            return NextResponse.json({ error: "No images provided." }, { status: 400 });
        }
        const categoryList = ALL_CATEGORIES.map((c) => `- ${c.label} (${c.type}): ${c.prompt}`).join("\n");
        const results = [];
        // Process images in parallel chunks of 3 for speed
        const CHUNK_SIZE = 3;
        for (let i = 0; i < images.length; i += CHUNK_SIZE) {
            const chunk = images.slice(i, i + CHUNK_SIZE);
            const chunkResults = await Promise.all(chunk.map(async (item) => {
                try {
                    // Extract pure base64 data and mime type
                    const matches = item.imageDataUrl.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
                    const mimeType = matches ? matches[1] : "image/jpeg";
                    const base64Data = matches ? matches[2] : item.imageDataUrl;
                    const prompt = `You are a world-class computer vision and aesthetic classifier for photo curation.
Analyze the image content and aesthetic with extreme human-level precision.

ACCURACY RULES:
1. Roads, highways, roundabouts, motorways, intersections, traffic, cars, or sports vehicles MUST be classified as "Cars", "Architecture", or "Travel". NEVER classify roads or transportation as "Food".
2. "Food" is strictly reserved for edible meals, dishes, snacks, cooking, or groceries.
3. Pick EXACTLY 1 Primary Category and 2 Secondary Tags from the list below.

TAXONOMY:
${categoryList}

Return ONLY valid JSON matching this exact structure:
{
  "primaryCategory": "<string matching a category label exactly>",
  "categoryType": "<'subject' or 'aesthetic'>",
  "confidence": <integer percentage between 75 and 99>,
  "secondaryTags": [
    { "label": "<string>", "categoryType": "<'subject' or 'aesthetic'>", "percentage": <integer between 50 and 90> },
    { "label": "<string>", "categoryType": "<'subject' or 'aesthetic'>", "percentage": <integer between 40 and 80> }
  ]
}`;
                    // Call Gemini 2.5 Flash / 1.5 Flash via REST endpoint
                    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
                    const response = await fetch(geminiUrl, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            contents: [
                                {
                                    parts: [
                                        {
                                            inline_data: {
                                                mime_type: mimeType,
                                                data: base64Data,
                                            },
                                        },
                                        { text: prompt },
                                    ],
                                },
                            ],
                            generationConfig: {
                                response_mime_type: "application/json",
                                temperature: 0.1,
                            },
                        }),
                    });
                    if (!response.ok) {
                        // Fallback to gemini-1.5-flash if 2.5-flash is not available for this key
                        const fallbackUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
                        const fallbackResp = await fetch(fallbackUrl, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                contents: [
                                    {
                                        parts: [
                                            {
                                                inline_data: {
                                                    mime_type: mimeType,
                                                    data: base64Data,
                                                },
                                            },
                                            { text: prompt },
                                        ],
                                    },
                                ],
                                generationConfig: {
                                    response_mime_type: "application/json",
                                    temperature: 0.1,
                                },
                            }),
                        });
                        if (!fallbackResp.ok) {
                            const errText = await fallbackResp.text();
                            throw new Error(`Gemini API Error: ${errText}`);
                        }
                        const data = await fallbackResp.json();
                        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
                        const parsed = JSON.parse(text);
                        return formatResult(item.id, parsed);
                    }
                    const data = await response.json();
                    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
                    const parsed = JSON.parse(text);
                    return formatResult(item.id, parsed);
                }
                catch (err) {
                    console.error(`Gemini classification error for item ${item.id}:`, err);
                    return {
                        id: item.id,
                        error: err.message || "Gemini vision analysis failed",
                    };
                }
            }));
            results.push(...chunkResults);
        }
        return NextResponse.json({
            success: true,
            provider: "gemini",
            results,
        });
    }
    catch (error) {
        console.error("API /api/classify error:", error);
        return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
    }
}
function formatResult(id, parsed) {
    const primaryCategory = parsed.primaryCategory || "Architecture";
    const categoryType = parsed.categoryType || "subject";
    const confidence = Math.min(99, Math.max(65, parsed.confidence || 90));
    const secondaryTags = (parsed.secondaryTags || []).map((t) => ({
        label: t.label,
        categoryType: t.categoryType || "subject",
        score: (t.percentage || 60) / 100,
        percentage: Math.min(95, Math.max(40, t.percentage || 60)),
    }));
    const allScores = [
        {
            label: primaryCategory,
            categoryType,
            score: confidence / 100,
            percentage: confidence,
        },
        ...secondaryTags,
    ];
    return {
        id,
        primaryCategory,
        categoryType,
        confidence,
        secondaryTags,
        allScores,
    };
}
