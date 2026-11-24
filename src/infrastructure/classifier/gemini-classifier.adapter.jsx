import { WebWorkerClassifierAdapter } from "./web-worker-classifier.adapter";
export class GeminiClassifierAdapter {
    fallbackWorker;
    callbacks = {};
    apiKey = "";
    constructor() {
        this.fallbackWorker = new WebWorkerClassifierAdapter();
    }
    setApiKey(key) {
        this.apiKey = key.trim();
    }
    getApiKey() {
        return this.apiKey;
    }
    hasApiKey() {
        return this.apiKey.length > 0;
    }
    initialize(callbacks) {
        this.callbacks = callbacks;
        // Also initialize local worker as immediate local engine or fallback
        this.fallbackWorker.initialize(callbacks);
    }
    async classifyBatch(items) {
        if (!this.hasApiKey()) {
            // Use local CLIP neural network directly
            this.fallbackWorker.classifyBatch(items);
            return;
        }
        try {
            this.callbacks.onInitProgress?.("Analyzing with Google Gemini Vision AI...", 50);
            const response = await fetch("/api/classify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    images: items,
                    apiKey: this.apiKey,
                }),
            });
            if (!response.ok) {
                console.warn("Gemini API call failed, falling back to local CLIP model.");
                this.fallbackWorker.classifyBatch(items);
                return;
            }
            const data = await response.json();
            if (!data.results || !Array.isArray(data.results)) {
                this.fallbackWorker.classifyBatch(items);
                return;
            }
            for (const res of data.results) {
                if (res.error) {
                    this.callbacks.onError?.(res.id, res.error);
                }
                else {
                    this.callbacks.onClassified?.(res);
                }
            }
            this.callbacks.onBatchComplete?.(items.length);
        }
        catch (err) {
            console.warn("Gemini classifier error, falling back to local CLIP model:", err);
            this.fallbackWorker.classifyBatch(items);
        }
    }
    terminate() {
        this.fallbackWorker.terminate();
    }
}
