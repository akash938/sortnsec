"use client";
import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { UPLOAD_POLICY } from "../../domain/rules/upload-policy";
import { validateUploadFiles } from "../../application/use-cases/validate-files.use-case";
import { filterPhotosByCategory, computeCategoryCounts, } from "../../application/use-cases/filter-photos.use-case";
import { updatePhotoCategory } from "../../application/use-cases/update-photo-category.use-case";
import { deletePhotosFromMemory } from "../../application/use-cases/delete-photos.use-case";
import { GeminiClassifierAdapter } from "../../infrastructure/classifier/gemini-classifier.adapter";
import { CanvasPreprocessorAdapter } from "../../infrastructure/image/canvas-preprocessor.adapter";
import { CanvasSampleGeneratorAdapter } from "../../infrastructure/fixtures/canvas-sample-generator.adapter";
import { SupabasePhotoAdapter } from "../../infrastructure/database/supabase-photo.adapter";
import { PhotoIndexEngine } from "../../domain/services/photo-index-engine";
export function usePhotoCategorizer(user = null) {
    const [activeTab, setActiveTabState] = useState("upload");
    const [photos, setPhotos] = useState([]);
    const [selectedPhoto, setSelectedPhoto] = useState(null);
    const [activeCategory, setActiveCategory] = useState("all");
    const [viewMode, setViewMode] = useState("grid");
    const [searchQuery, setSearchQuery] = useState("");
    const [sortBy, setSortBy] = useState("newest");
    const [dbStatus, setDbStatus] = useState(null);
    // Multi-select & selective memory deletion state
    const [isSelectionMode, setIsSelectionMode] = useState(false);
    const [selectedPhotoIds, setSelectedPhotoIds] = useState([]);
    // Processing & Absorption Animation state
    const [isProcessing, setIsProcessing] = useState(false);
    const [isAbsorptionActive, setIsAbsorptionActive] = useState(false);
    const setActiveTab = useCallback((tab) => {
        setIsAbsorptionActive(false);
        setSelectedPhoto(null);
        setActiveTabState(tab);
    }, []);
    const [processedCount, setProcessedCount] = useState(0);
    const [totalInQueue, setTotalInQueue] = useState(0);
    const [modelStage, setModelStage] = useState(null);
    const [modelProgress, setModelProgress] = useState(undefined);
    // Gemini API Configuration
    const [geminiApiKey, setGeminiApiKeyState] = useState("");
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    // Notifications
    const [notices, setNotices] = useState([]);
    // Adapters
    const classifierAdapterRef = useRef(null);
    const watchdogRef = useRef(null);
    useEffect(() => () => {
        if (watchdogRef.current)
            clearTimeout(watchdogRef.current);
    }, []);
    const preprocessor = useMemo(() => new CanvasPreprocessorAdapter(), []);
    const sampleGenerator = useMemo(() => new CanvasSampleGeneratorAdapter(), []);
    const supabaseDb = useMemo(() => new SupabasePhotoAdapter(), []);
    const userRef = useRef(user);
    const prevUserIdRef = useRef(null);

    useEffect(() => {
        userRef.current = user;
    }, [user]);

    // Check Supabase connection + enforce Guest (ephemeral) vs Signed-In (persistent) storage
    useEffect(() => {
        let active = true;
        const currentUserId = user?.id || null;
        const prevUserId = prevUserIdRef.current;

        supabaseDb.checkConnection().then((status) => {
            if (active) setDbStatus(status);
        });

        // If user just signed out (or switched accounts), clear previous account photos from memory
        if (prevUserId && prevUserId !== currentUserId) {
            setPhotos([]);
            setSelectedPhoto(null);
            setSelectedPhotoIds([]);
            setUndoHistory([]);
            sampleGenerator.reset();
        }
        prevUserIdRef.current = currentUserId;

        // GUEST MODE: Never load or store photos in database/IndexedDB
        if (!currentUserId) {
            return () => {
                active = false;
            };
        }

        // SIGNED-IN MODE: Load this user's saved photos from Supabase PostgreSQL + IndexedDB
        supabaseDb.loadAllPhotos(currentUserId).then((loaded) => {
            if (active && Array.isArray(loaded) && loaded.length > 0) {
                setPhotos((prev) => {
                    const existingIds = new Set(prev.map((p) => p.id));
                    const merged = [...prev];
                    for (const item of loaded) {
                        if (!existingIds.has(item.id)) {
                            merged.push(item);
                        }
                    }
                    return merged;
                });
            }
        });
        return () => {
            active = false;
        };
    }, [supabaseDb, user?.id, sampleGenerator]);
    // Load saved Gemini Key from localStorage on mount
    useEffect(() => {
        try {
            const savedKey = localStorage.getItem("sortn-sec-gemini-key") || "";
            if (savedKey) {
                setGeminiApiKeyState(savedKey);
                classifierAdapterRef.current?.setApiKey(savedKey);
            }
        }
        catch (e) { }
    }, []);
    const setGeminiApiKey = useCallback((key) => {
        setGeminiApiKeyState(key);
        classifierAdapterRef.current?.setApiKey(key);
        try {
            localStorage.setItem("sortn-sec-gemini-key", key.trim());
        }
        catch (e) { }
    }, []);
    const addNotice = useCallback((message, type = "info", options = {}) => {
        const id = Math.random().toString(36).substring(2, 9);
        const durationMs = options.durationMs || (options.onAction ? 7500 : 4500);
        setNotices((prev) => [
            ...prev,
            {
                id,
                message,
                type,
                actionLabel: options.actionLabel,
                onAction: options.onAction,
                durationMs,
            },
        ]);
        setTimeout(() => {
            setNotices((prev) => prev.filter((n) => n.id !== id));
        }, durationMs);
    }, []);
    const dismissNotice = useCallback((id) => {
        setNotices((prev) => prev.filter((n) => n.id !== id));
    }, []);
    // Initialize Classifier Port Adapter
    useEffect(() => {
        const classifier = new GeminiClassifierAdapter();
        const savedKey = localStorage.getItem("sortn-sec-gemini-key") || "";
        if (savedKey) {
            classifier.setApiKey(savedKey);
        }
        classifier.initialize({
            onInitProgress: (stage, progress) => {
                setModelStage(stage);
                setModelProgress(progress);
            },
            onInitComplete: () => {
                setModelStage(null);
                setModelProgress(undefined);
            },
            onClassified: (res) => {
                setPhotos((prev) => prev.map((p) => {
                    if (p.id !== res.id) return p;
                    const updated = {
                        ...p,
                        status: "classified",
                        primaryCategory: res.primaryCategory,
                        categoryType: res.categoryType,
                        confidence: res.confidence,
                        secondaryTags: res.secondaryTags,
                        allScores: res.allScores,
                    };
                    if (userRef.current?.id) {
                        supabaseDb.savePhoto(updated, userRef.current.id);
                    }
                    return updated;
                }));
                setProcessedCount((c) => c + 1);
            },
            onError: (id, error) => {
                setPhotos((prev) => prev.map((p) => p.id === id
                    ? {
                        ...p,
                        status: "error",
                        errorMessage: error,
                        primaryCategory: "Uncertain",
                        confidence: 50,
                    }
                    : p));
                setProcessedCount((c) => c + 1);
            },
        });
        classifierAdapterRef.current = classifier;
        return () => {
            classifier.terminate();
        };
    }, []);
    // Keep selectedPhoto synchronized with live classifications
    useEffect(() => {
        if (selectedPhoto) {
            const updated = photos.find((p) => p.id === selectedPhoto.id);
            if (updated)
                setSelectedPhoto(updated);
        }
    }, [photos, selectedPhoto]);
    // Clean up object URLs
    const cleanUpUrls = useCallback(() => {
        photos.forEach((p) => {
            try {
                URL.revokeObjectURL(p.objectUrl);
            }
            catch (e) { }
        });
    }, [photos]);
    // Undo deletion stack so any deleted photo(s) can be restored into memory
    const [undoHistory, setUndoHistory] = useState([]);
    const restoreDeletedBatch = useCallback((batchId) => {
        setUndoHistory((prev) => {
            const targetBatch = batchId
                ? prev.find((b) => b.batchId === batchId)
                : prev[0];
            if (!targetBatch)
                return prev;
            setPhotos((currentPhotos) => {
                const existingIds = new Set(currentPhotos.map((p) => p.id));
                const next = [...currentPhotos];
                const sortedEntries = [...targetBatch.entries].sort((a, b) => a.index - b.index);
                for (const entry of sortedEntries) {
                    if (!existingIds.has(entry.photo.id)) {
                        const insertAt = Math.min(entry.index, next.length);
                        next.splice(insertAt, 0, entry.photo);
                    }
                }
                return next;
            });
            setActiveTabState("gallery");
            return prev.filter((b) => b.batchId !== targetBatch.batchId);
        });
        addNotice("Restored deleted photo(s) back to memory", "info");
    }, [addNotice]);
    const handleUndoLastDelete = useCallback(() => {
        restoreDeletedBatch( null );
    }, [restoreDeletedBatch]);
    const clearAllPhotos = useCallback(() => {
        if (photos.length === 0)
            return;
        const batchId = `undo-all-${Date.now()}`;
        const entries = photos.map((photo, index) => ({ photo, index }));
        setUndoHistory((prev) => [{ batchId, entries, timestamp: Date.now() }, ...prev.slice(0, 9)]);
        sampleGenerator.reset();
        if (userRef.current?.id) {
            supabaseDb.clearAllPhotos(userRef.current.id);
        }
        setPhotos([]);
        setSelectedPhoto(null);
        setSelectedPhotoIds([]);
        setIsSelectionMode(false);
        setProcessedCount(0);
        setTotalInQueue(0);
        setActiveCategory("all");
        setActiveTab("upload");
        setIsAbsorptionActive(false);
        addNotice(`Cleared ${entries.length} ${entries.length === 1 ? "photo" : "photos"} from memory`, "info", {
            actionLabel: "Undo",
            onAction: () => restoreDeletedBatch(batchId),
            durationMs: 8000,
        });
    }, [photos, addNotice, sampleGenerator, restoreDeletedBatch, setActiveTab]);
    const handleDeletePhoto = useCallback((photoId) => {
        const target = photos.find((p) => p.id === photoId);
        if (!target)
            return;
        const { remainingPhotos, deletedPhotos, deletedNames } = deletePhotosFromMemory(photos, [photoId], { revokeUrls: false });
        const batchId = `undo-${Date.now()}-${photoId}`;
        setUndoHistory((prev) => [{ batchId, entries: deletedPhotos, timestamp: Date.now() }, ...prev.slice(0, 9)]);
        sampleGenerator.releaseNames(deletedNames);
        if (userRef.current?.id) {
            supabaseDb.deletePhotos([photoId], userRef.current.id);
        }
        setPhotos(remainingPhotos);
        setSelectedPhotoIds((prev) => prev.filter((id) => id !== photoId));
        if (selectedPhoto && selectedPhoto.id === photoId) {
            const currentIdx = photos.findIndex((p) => p.id === photoId);
            const nextPhoto = remainingPhotos[currentIdx] || remainingPhotos[currentIdx - 1] || null;
            setSelectedPhoto(nextPhoto);
        }
        addNotice(`Deleted "${target.name}" from memory`, "info", {
            actionLabel: "Undo",
            onAction: () => restoreDeletedBatch(batchId),
            durationMs: 8000,
        });
    }, [photos, selectedPhoto, sampleGenerator, addNotice, restoreDeletedBatch]);
    const handleDeleteSelectedPhotos = useCallback(() => {
        if (selectedPhotoIds.length === 0)
            return;
        const { remainingPhotos, deletedPhotos, deletedNames, deletedCount } = deletePhotosFromMemory(photos, selectedPhotoIds, { revokeUrls: false });
        const batchId = `undo-batch-${Date.now()}`;
        setUndoHistory((prev) => [{ batchId, entries: deletedPhotos, timestamp: Date.now() }, ...prev.slice(0, 9)]);
        sampleGenerator.releaseNames(deletedNames);
        if (userRef.current?.id) {
            supabaseDb.deletePhotos([photoId], userRef.current.id);
        }
        setPhotos(remainingPhotos);
        if (selectedPhoto && selectedPhotoIds.includes(selectedPhoto.id)) {
            setSelectedPhoto(null);
        }
        setSelectedPhotoIds([]);
        setIsSelectionMode(false);
        addNotice(`Deleted ${deletedCount} ${deletedCount === 1 ? "photo" : "photos"} from memory`, "info", {
            actionLabel: "Undo",
            onAction: () => restoreDeletedBatch(batchId),
            durationMs: 8000,
        });
    }, [photos, selectedPhotoIds, selectedPhoto, sampleGenerator, addNotice, restoreDeletedBatch]);
    const toggleSelectionMode = useCallback(() => {
        setIsSelectionMode((prev) => {
            if (prev) {
                setSelectedPhotoIds([]);
            }
            return !prev;
        });
    }, []);
    const toggleSelectPhoto = useCallback((photoId) => {
        setSelectedPhotoIds((prev) => {
            const exists = prev.includes(photoId);
            return exists ? prev.filter((id) => id !== photoId) : [...prev, photoId];
        });
    }, []);
    const clearSelection = useCallback(() => {
        setSelectedPhotoIds([]);
        setIsSelectionMode(false);
    }, []);
    // Upload & Classification pipeline orchestration with Absorption Stage
    const handleFiles = useCallback(async (rawFiles) => {
        if (rawFiles.length === 0)
            return;
        const { acceptedFiles: validatedFiles, rejectedCount, limitExceeded } = validateUploadFiles(rawFiles);
        if (rejectedCount > 0) {
            addNotice(`${rejectedCount} non-supported ${rejectedCount === 1 ? "file was" : "files were"} ignored. Accepted: JPG, PNG, WEBP.`, "warning");
        }
        // Deduplicate against photos already in memory & within the batch itself (zero copy images)
        const existingNames = new Set(photos.map((p) => p.name));
        const batchSeen = new Set();
        const acceptedFiles = validatedFiles.filter((file) => {
            if (existingNames.has(file.name) || batchSeen.has(file.name)) {
                return false;
            }
            batchSeen.add(file.name);
            return true;
        });
        const skippedCopies = validatedFiles.length - acceptedFiles.length;
        if (skippedCopies > 0 && acceptedFiles.length > 0) {
            addNotice(`${skippedCopies} duplicate ${skippedCopies === 1 ? "image" : "images"} skipped.`, "info");
        }
        if (acceptedFiles.length === 0) {
            if (skippedCopies > 0) {
                addNotice("Those photos are already in memory. Try adding new photos!", "info");
            }
            return;
        }
        if (limitExceeded) {
            addNotice("Only the first 100 were added.", "info");
        }
        // Activate the Apple-Style Black Jelly Orb Absorption Stage immediately!
        setIsProcessing(true);
        setIsAbsorptionActive(true);
        setProcessedCount(0);
        setTotalInQueue(acceptedFiles.length);
        // Parallel chunk preprocessing to extract aspect ratios and 512px canvas data
        const newItems = [];
        const CHUNK_SIZE = 10;
        for (let i = 0; i < acceptedFiles.length; i += CHUNK_SIZE) {
            const slice = acceptedFiles.slice(i, i + CHUNK_SIZE);
            const processedSlice = await Promise.all(slice.map(async (file, idx) => {
                const objectUrl = URL.createObjectURL(file);
                const id = `${Date.now()}-${i + idx}-${Math.random().toString(36).substring(2, 7)}`;
                try {
                    const meta = await preprocessor.preprocess(file, UPLOAD_POLICY.MAX_IMAGE_DIMENSION);
                    const item = {
                        id,
                        file,
                        objectUrl,
                        name: file.name,
                        size: file.size,
                        width: meta.width,
                        height: meta.height,
                        aspectRatio: meta.aspectRatio,
                        status: "pending",
                        timestamp: Date.now(),
                    };
                    return { item, downscaledDataUrl: meta.downscaledDataUrl };
                }
                catch (err) {
                    const item = {
                        id,
                        file,
                        objectUrl,
                        name: file.name,
                        size: file.size,
                        width: 800,
                        height: 600,
                        aspectRatio: 4 / 3,
                        status: "error",
                        errorMessage: "Failed to read image",
                        timestamp: Date.now(),
                    };
                    return { item, downscaledDataUrl: "" };
                }
            }));
            newItems.push(...processedSlice);
        }
        const addedPhotos = newItems.map((n) => n.item);
        setPhotos((prev) => [...addedPhotos, ...prev]);
        const classifier = classifierAdapterRef.current;
        if (!classifier) {
            setProcessedCount(acceptedFiles.length);
            setIsProcessing(false);
            return;
        }
        // Items that failed preprocessing are never sent to the classifier — count them as done now
        const unsendableCount = newItems.filter((n) => n.downscaledDataUrl.length === 0).length;
        if (unsendableCount > 0) {
            setProcessedCount((c) => c + unsendableCount);
        }
        // Batch dispatch to classifier (Gemini Vision API if key configured, or local CLIP neural worker)
        try {
            for (let i = 0; i < newItems.length; i += UPLOAD_POLICY.BATCH_SIZE) {
                const batch = newItems.slice(i, i + UPLOAD_POLICY.BATCH_SIZE);
                const batchPayload = batch
                    .filter((b) => b.downscaledDataUrl.length > 0)
                    .map((b) => ({
                    id: b.item.id,
                    imageDataUrl: b.downscaledDataUrl,
                }));
                if (batchPayload.length === 0)
                    continue;
                setPhotos((prev) => prev.map((p) => batchPayload.some((b) => b.id === p.id)
                    ? { ...p, status: "processing" }
                    : p));
                await classifier.classifyBatch(batchPayload);
                await new Promise((resolve) => setTimeout(resolve, 40));
            }
        }
        catch (err) {
            console.warn("[Sortn Sec] Classifier dispatch failed:", err);
        }
        // Watchdog: if the classifier never reports back for some photos, release the UI
        // instead of leaving the absorption overlay stuck forever.
        const batchIds = new Set(addedPhotos.map((p) => p.id));
        const total = acceptedFiles.length;
        if (watchdogRef.current)
            clearTimeout(watchdogRef.current);
        watchdogRef.current = setTimeout(() => {
            setPhotos((prev) => prev.map((p) => batchIds.has(p.id) && (p.status === "processing" || p.status === "pending")
                ? { ...p, status: "error", errorMessage: "Classification timed out", primaryCategory: "Uncertain", confidence: 50 }
                : p));
            setProcessedCount((c) => Math.max(c, total));
        }, 20000 + total * 1500);
        setIsProcessing(false);
    }, [addNotice, photos, preprocessor]);
    // Triggered when the Ferrofluid Spike Bloom finishes playing on the Jelly Orb
    const handleAbsorptionComplete = useCallback(() => {
        setIsAbsorptionActive(false);
        setActiveTab("gallery");
        // Remaining classifications (if any) keep running in the background with per-card "Analyzing..." pills
    }, []);
    const handleLoadSamples = useCallback(async () => {
        addNotice("Loading fresh curated aesthetic photos (zero duplicates)...", "info");
        const existingNames = photos.map((p) => p.name);
        const samples = await sampleGenerator.generate(16, existingNames);
        if (samples.length === 0) {
            addNotice("All curated photos are already in memory!", "info");
            return;
        }
        handleFiles(samples);
    }, [addNotice, handleFiles, photos, sampleGenerator]);
    const handleUpdateCategory = useCallback((photoId, newCategory) => {
        setPhotos((prev) => {
            const next = updatePhotoCategory(prev, photoId, newCategory);
            const updatedPhoto = next.find((p) => p.id === photoId);
            if (updatedPhoto && userRef.current?.id) {
                supabaseDb.savePhoto(updatedPhoto, userRef.current.id);
            }
            return next;
        });
    }, [supabaseDb]);

    // High-Efficiency O(1) Multi-Index Engine (Hash + Inverted Category + Token + TypedArray Sort)
    const indexEngine = useMemo(() => new PhotoIndexEngine(photos), [photos]);

    const queryResult = useMemo(
        () =>
            indexEngine.query({
                category: activeCategory,
                search: searchQuery,
                sortBy,
            }),
        [indexEngine, activeCategory, searchQuery, sortBy]
    );

    const filteredPhotos = queryResult.photos;
    const lastQueryTimeMs = queryResult.queryTimeMs;
    const lastIndexUsed = queryResult.indexUsed;

    const selectAllFilteredPhotos = useCallback(() => {
        const filteredIds = filteredPhotos.map((p) => p.id);
        const allSelected = filteredIds.length > 0 && filteredIds.every((id) => selectedPhotoIds.includes(id));
        if (allSelected) {
            setSelectedPhotoIds((prev) => prev.filter((id) => !filteredIds.includes(id)));
        }
        else {
            setSelectedPhotoIds((prev) => Array.from(new Set([...prev, ...filteredIds])));
        }
    }, [filteredPhotos, selectedPhotoIds]);

    const categoriesWithCounts = useMemo(
        () => indexEngine.getCategoryCounts(),
        [indexEngine]
    );

    const handleSyncToSupabase = useCallback(async () => {
        if (!userRef.current?.id) {
            addNotice("Guest mode does not store photos. Sign in to save to Supabase.", "warning");
            return;
        }
        await supabaseDb.savePhotosBatch(photos, userRef.current.id);
        const status = await supabaseDb.checkConnection();
        setDbStatus(status);
        addNotice(`Synced ${photos.length} photos with your Supabase Cloud account`, "info");
    }, [supabaseDb, photos, addNotice]);

    const handleRunSupabaseBenchmark = useCallback(
        async (targetCategory = "Cars") => {
            return await supabaseDb.runLiveSupabaseBenchmark(targetCategory);
        },
        [supabaseDb]
    );

    const activeAiProviderName = useMemo(() => {
        if (geminiApiKey.trim().length > 0) {
            return "Google Gemini 2.5 Vision AI";
        }
        return "OpenAI CLIP ViT-B/32 Neural Engine";
    }, [geminiApiKey]);
    return {
        activeTab,
        setActiveTab,
        photos,
        selectedPhoto,
        setSelectedPhoto,
        activeCategory,
        setActiveCategory,
        viewMode,
        setViewMode,
        searchQuery,
        setSearchQuery,
        sortBy,
        setSortBy,
        lastQueryTimeMs,
        lastIndexUsed,
        dbStatus,
        handleSyncToSupabase,
        handleRunSupabaseBenchmark,
        isSelectionMode,
        selectedPhotoIds,
        toggleSelectionMode,
        toggleSelectPhoto,
        selectAllFilteredPhotos,
        clearSelection,
        handleDeletePhoto,
        handleDeleteSelectedPhotos,
        canUndoDelete: undoHistory.length > 0,
        lastDeletedCount: undoHistory[0]?.entries?.length || 0,
        handleUndoLastDelete,
        isProcessing,
        isAbsorptionActive,
        handleAbsorptionComplete,
        processedCount,
        totalInQueue,
        modelStage,
        modelProgress,
        geminiApiKey,
        setGeminiApiKey,
        isSettingsOpen,
        setIsSettingsOpen,
        activeAiProviderName,
        notices,
        dismissNotice,
        handleFiles,
        handleLoadSamples,
        handleUpdateCategory,
        clearAllPhotos,
        filteredPhotos,
        categoriesWithCounts,
    };
}
