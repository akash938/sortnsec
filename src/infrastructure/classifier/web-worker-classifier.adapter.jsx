export class WebWorkerClassifierAdapter {
    worker = null;
    callbacks = {};
    initialize(callbacks) {
        this.callbacks = callbacks;
        if (typeof window === "undefined")
            return;
        this.worker = new Worker("/classifier-worker.js", {
            type: "module",
        });
        this.worker.onmessage = (e) => {
            const { type } = e.data;
            if (type === "INIT_PROGRESS") {
                this.callbacks.onInitProgress?.(e.data.stage, e.data.progress);
            }
            else if (type === "INIT_COMPLETE") {
                this.callbacks.onInitComplete?.();
            }
            else if (type === "CLASSIFY_SUCCESS") {
                this.callbacks.onClassified?.(e.data.result);
            }
            else if (type === "CLASSIFY_ERROR") {
                this.callbacks.onError?.(e.data.id, e.data.error);
            }
            else if (type === "BATCH_COMPLETE") {
                this.callbacks.onBatchComplete?.(e.data.processedCount);
            }
        };
        // Preload model in background
        this.worker.postMessage({ type: "INIT" });
    }
    classifyBatch(items) {
        if (!this.worker)
            return;
        this.worker.postMessage({
            type: "CLASSIFY_BATCH",
            items,
        });
    }
    terminate() {
        if (this.worker) {
            this.worker.terminate();
            this.worker = null;
        }
    }
}
