"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, Sparkles, UploadCloud, CheckSquare, X, Wand2, RotateCcw } from "lucide-react";
import {
  Navbar,
  Dropzone,
  ProgressBar,
  CategoryFilter,
  PhotoGrid,
  GroupedCategoryView,
  PhotoModal,
  ToastNotice,
  PhotoAbsorptionStage,
  AiEngineModal,
  ClearConfirmModal,
  McpConnectModal,
  GuestStorageModal,
  useAuth,
  usePhotoCategorizer,
  APPLE_SPRING_SNAPPY,
  APPLE_SPRING_FLUID,
  APPLE_SPRING_BOUNCY,
  appleScreenVariants,
} from "../src/presentation";

export default function HomePage() {
  const { user, signOut } = useAuth();
  const {
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
    isSelectionMode,
    selectedPhotoIds,
    toggleSelectionMode,
    toggleSelectPhoto,
    selectAllFilteredPhotos,
    clearSelection,
    handleDeletePhoto,
    handleDeleteSelectedPhotos,
    canUndoDelete,
    lastDeletedCount,
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
  } = usePhotoCategorizer(user);

  const [confirmModalMode, setConfirmModalMode] = useState(null);
  const [isMcpOpen, setIsMcpOpen] = useState(false);
  const [claudeApiKey, setClaudeApiKey] = useState("");
  const [hasAcknowledgedGuestNotice, setHasAcknowledgedGuestNotice] = useState(false);
  const [guestPromptState, setGuestPromptState] = useState({
    isOpen: false,
    actionLabel: "upload or generate images",
    pendingAction: null,
  });

  // Guard any upload or AI image generation when browsing as a Guest (not signed in)
  const runWithGuestStorageGuard = (actionLabel, actionFn) => {
    if (user || hasAcknowledgedGuestNotice) {
      actionFn();
      return;
    }
    setGuestPromptState({
      isOpen: true,
      actionLabel,
      pendingAction: () => actionFn,
    });
  };

  useEffect(() => {
    try {
      setClaudeApiKey(localStorage.getItem("sortn-sec-claude-key") || "");
    } catch (e) {}
  }, []);

  const saveClaudeKey = (key) => {
    setClaudeApiKey(key);
    try {
      localStorage.setItem("sortn-sec-claude-key", key);
    } catch (e) {}
  };

  const allFilteredSelected =
    filteredPhotos.length > 0 &&
    filteredPhotos.every((p) => selectedPhotoIds.includes(p.id));

  // Switching to any screen/tab immediately dismisses all open modals/overlays
  const handleSelectNavTab = (tab) => {
    setIsMcpOpen(false);
    setIsSettingsOpen(false);
    setConfirmModalMode(null);
    setSelectedPhoto(null);
    setActiveTab(tab);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-primary)] text-[var(--fg-primary)]">
      {/* Floating Centered Navbar with Always-Online Green Indicator & AI Engine Selector */}
      <Navbar
        activeTab={
          isMcpOpen
            ? "mcp"
            : isSettingsOpen
            ? "ai"
            : activeTab
        }
        onTabChange={handleSelectNavTab}
        photoCount={photos.length}
        hasGeminiKey={geminiApiKey.trim().length > 0}
        onOpenAiSettings={() => {
          setIsMcpOpen(false);
          setConfirmModalMode(null);
          setSelectedPhoto(null);
          setIsSettingsOpen((prev) => !prev);
        }}
        onOpenMcp={() => {
          setIsSettingsOpen(false);
          setConfirmModalMode(null);
          setSelectedPhoto(null);
          if (isMcpOpen) {
            setIsMcpOpen(false);
          } else {
            runWithGuestStorageGuard("generate AI images", () =>
              setIsMcpOpen(true)
            );
          }
        }}
        user={user}
        onSignOut={signOut}
      />

      {/* Cinematic Black Jelly Orb Absorption Stage (Apple Glassmorphism Await Animation) */}
      <PhotoAbsorptionStage
        isActive={isAbsorptionActive}
        totalPhotos={totalInQueue}
        processedPhotos={processedCount}
        photos={photos}
        modelStage={modelStage}
        modelProgress={modelProgress}
        aiProviderName={activeAiProviderName}
        onAnimationFinished={handleAbsorptionComplete}
      />

      {/* Gemini AI Engine Configuration Modal */}
      <AiEngineModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        apiKey={geminiApiKey}
        onSaveKey={setGeminiApiKey}
      />

      {/* Main Content Container */}
      <main
        id="main-content"
        className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16"
      >
        {/* Progress Bar (visible outside absorption overlay if background work happens) */}
        {!isAbsorptionActive && (
          <ProgressBar
            total={totalInQueue}
            processed={processedCount}
            isProcessing={isProcessing}
            modelStage={modelStage}
            modelProgress={modelProgress}
          />
        )}

        {/* Screen 1: Upload / Hero Dropzone */}
        {!isMcpOpen && !isSettingsOpen && activeTab === "upload" && (
          <motion.section
            key="home-screen"
            aria-labelledby="hero-heading"
            variants={appleScreenVariants}
            initial="initial"
            animate="animate"
            className="gpu-120hz flex flex-col items-center justify-center min-h-[65vh] space-y-8"
          >
              {/* Semantic Hero Header with Staggered 120Hz Entrance */}
              <header className="text-center space-y-3 max-w-2xl mx-auto">
                <motion.p
                  initial={{ opacity: 0, y: 10, filter: "blur(6px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  transition={{ ...APPLE_SPRING_FLUID, delay: 0.04 }}
                  className="text-xs uppercase tracking-[0.25em] text-black/50 dark:text-white/50 font-mono"
                >
                  Multimodal Photo Categorizer
                </motion.p>
                <motion.h1
                  id="hero-heading"
                  initial={{ opacity: 0, y: 14, scale: 0.96, filter: "blur(8px)" }}
                  animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
                  transition={{ ...APPLE_SPRING_FLUID, delay: 0.08 }}
                  className="text-4xl sm:text-5xl md:text-6xl font-light tracking-tight text-black dark:text-white"
                >
                  Sortn Sec
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0, y: 12, filter: "blur(6px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  transition={{ ...APPLE_SPRING_FLUID, delay: 0.12 }}
                  className="text-sm sm:text-base text-black/60 dark:text-white/60 font-normal max-w-md mx-auto leading-relaxed"
                >
                  Drop photos to watch the liquid obsidian jelly orb absorb,
                  ripple, and categorize them using high-end Google Gemini
                  Vision AI or client-side CLIP.
                </motion.p>
              </header>

              {/* Interactive Dropzone with Obsidian Liquid Jelly Orb */}
              <Dropzone
                onFilesSelected={(files) =>
                  runWithGuestStorageGuard("upload photos", () =>
                    handleFiles(files)
                  )
                }
                isProcessing={isProcessing || isAbsorptionActive}
                onLoadSamples={() =>
                  runWithGuestStorageGuard("load aesthetic photos", () =>
                    handleLoadSamples()
                  )
                }
                onOpenMcp={() =>
                  runWithGuestStorageGuard("generate AI images", () =>
                    setIsMcpOpen(true)
                  )
                }
              />

              {/* Quick Link to Gallery if Photos Exist */}
              <AnimatePresence>
                {photos.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.95 }}
                    transition={APPLE_SPRING_FLUID}
                    className="flex items-center gap-4 text-xs tracking-wider uppercase text-black/50 dark:text-white/50"
                  >
                    <span>{photos.length} unique photos in memory</span>
                    <span>•</span>
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.04, x: 3 }}
                      whileTap={{ scale: 0.94 }}
                      transition={APPLE_SPRING_SNAPPY}
                      onClick={() => handleSelectNavTab("gallery")}
                      className="text-black dark:text-white underline underline-offset-4 hover:opacity-80"
                    >
                      View Categorized Gallery →
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.section>
          )}

          {/* Screen 2: Categorized Results Gallery (hidden when Canva & Claude MCP or AI Settings is active) */}
          {!isMcpOpen && !isSettingsOpen && activeTab === "gallery" && (
            <motion.section
              key="results-screen"
              aria-labelledby="gallery-heading"
              variants={appleScreenVariants}
              initial="initial"
              animate="animate"
              className="gpu-120hz space-y-6"
            >
              {photos.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.96, filter: "blur(8px)" }}
                  animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                  transition={APPLE_SPRING_FLUID}
                  className="flex flex-col items-center justify-center py-24 text-center space-y-4"
                >
                  <p className="text-sm uppercase tracking-widest text-black/50 dark:text-white/50">
                    No photos in memory yet
                  </p>
                  <div className="flex flex-wrap items-center justify-center gap-3">
                    {canUndoDelete && (
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.05, y: -1 }}
                        whileTap={{ scale: 0.93 }}
                        transition={APPLE_SPRING_SNAPPY}
                        onClick={handleUndoLastDelete}
                        className="flex items-center gap-1.5 px-5 py-2 text-xs uppercase tracking-wider font-medium rounded-full bg-emerald-600 hover:bg-emerald-500 text-white transition-colors shadow-sm"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>
                          Undo Delete ({lastDeletedCount})
                        </span>
                      </motion.button>
                    )}
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.05, y: -1 }}
                      whileTap={{ scale: 0.93 }}
                      transition={APPLE_SPRING_SNAPPY}
                      onClick={() => handleSelectNavTab("upload")}
                      className="px-5 py-2 text-xs uppercase tracking-wider font-medium rounded-full bg-black dark:bg-white text-white dark:text-black hover:opacity-90 transition-opacity"
                    >
                      Upload Photos
                    </motion.button>
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.05, y: -1 }}
                      whileTap={{ scale: 0.93 }}
                      transition={APPLE_SPRING_SNAPPY}
                      onClick={handleLoadSamples}
                      className="flex items-center gap-1.5 px-5 py-2 text-xs uppercase tracking-wider font-medium rounded-full border border-black/15 dark:border-white/15 text-black dark:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Add Real Aesthetic Photos</span>
                    </motion.button>
                  </div>
                </motion.div>
              ) : (
                <>
                  {/* Gallery Header & Action Bar with 120Hz Layout Morphing */}
                  <motion.header
                    layout
                    transition={APPLE_SPRING_FLUID}
                    className="flex flex-wrap items-center justify-between gap-4 pb-2"
                  >
                    <motion.div layout transition={APPLE_SPRING_FLUID}>
                      <h2
                        id="gallery-heading"
                        className="text-2xl font-light tracking-tight text-black dark:text-white"
                      >
                        Photo Gallery
                      </h2>
                      <p className="text-xs uppercase tracking-wider text-black/50 dark:text-white/50 font-mono flex items-center gap-1.5 flex-wrap">
                        <span>
                          {photos.length} unique photos categorized •{" "}
                          {activeAiProviderName}
                        </span>
                        <AnimatePresence mode="popLayout">
                          {selectedPhotoIds.length > 0 && (
                            <motion.span
                              key="selected-badge"
                              initial={{ opacity: 0, scale: 0.8, x: -6 }}
                              animate={{ opacity: 1, scale: 1, x: 0 }}
                              exit={{ opacity: 0, scale: 0.8, x: -6 }}
                              transition={APPLE_SPRING_BOUNCY}
                              className="px-2 py-0.5 rounded-full bg-black dark:bg-white text-white dark:text-black text-[10px]"
                            >
                              {selectedPhotoIds.length} selected
                            </motion.span>
                          )}
                        </AnimatePresence>
                      </p>
                    </motion.div>

                    <motion.div
                      layout
                      transition={APPLE_SPRING_FLUID}
                      className="flex flex-wrap items-center gap-2"
                    >
                      {/* Selective Multi-Select Controls with Smooth Spring Layout */}
                      <AnimatePresence mode="popLayout" initial={false}>
                        {isSelectionMode || selectedPhotoIds.length > 0 ? (
                          <motion.div
                            layout
                            key="selection-controls"
                            initial={{ opacity: 0, scale: 0.9, filter: "blur(6px)" }}
                            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                            exit={{ opacity: 0, scale: 0.9, filter: "blur(6px)" }}
                            transition={APPLE_SPRING_FLUID}
                            className="flex flex-wrap items-center gap-2"
                          >
                            <motion.button
                              layout
                              type="button"
                              whileHover={{ scale: 1.04, y: -1 }}
                              whileTap={{ scale: 0.93 }}
                              transition={APPLE_SPRING_SNAPPY}
                              onClick={selectAllFilteredPhotos}
                              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs uppercase tracking-wider rounded-full border border-black/15 dark:border-white/15 hover:bg-black/5 dark:hover:bg-white/5 text-black dark:text-white transition-colors"
                            >
                              <CheckSquare className="w-3.5 h-3.5" />
                              <span>
                                {allFilteredSelected
                                  ? "Deselect All"
                                  : "Select All"}
                              </span>
                            </motion.button>

                            <AnimatePresence mode="popLayout">
                              {selectedPhotoIds.length > 0 && (
                                <motion.button
                                  layout
                                  key="delete-selected-btn"
                                  type="button"
                                  initial={{ opacity: 0, scale: 0.8 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  exit={{ opacity: 0, scale: 0.8 }}
                                  whileHover={{ scale: 1.05, y: -1 }}
                                  whileTap={{ scale: 0.92 }}
                                  transition={APPLE_SPRING_BOUNCY}
                                  onClick={() => setConfirmModalMode("selected")}
                                  className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs uppercase tracking-wider font-medium rounded-full bg-red-600 hover:bg-red-700 text-white transition-colors shadow-sm"
                                  title="Delete selected photos from memory"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  <span>
                                    Delete Selected ({selectedPhotoIds.length})
                                  </span>
                                </motion.button>
                              )}
                            </AnimatePresence>

                            <motion.button
                              layout
                              type="button"
                              whileHover={{ scale: 1.04, y: -1 }}
                              whileTap={{ scale: 0.93 }}
                              transition={APPLE_SPRING_SNAPPY}
                              onClick={clearSelection}
                              className="flex items-center gap-1 px-3 py-1.5 text-xs uppercase tracking-wider rounded-full border border-black/10 dark:border-white/10 text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white transition-colors"
                            >
                              <X className="w-3.5 h-3.5" />
                              <span>Done</span>
                            </motion.button>
                          </motion.div>
                        ) : (
                          <motion.button
                            layout
                            key="enter-select-btn"
                            type="button"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            whileHover={{ scale: 1.04, y: -1 }}
                            whileTap={{ scale: 0.93 }}
                            transition={APPLE_SPRING_SNAPPY}
                            onClick={toggleSelectionMode}
                            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs uppercase tracking-wider rounded-full border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 text-black dark:text-white transition-colors"
                            title="Select multiple photos to delete from memory"
                          >
                            <CheckSquare className="w-3.5 h-3.5" />
                            <span>Select</span>
                          </motion.button>
                        )}
                      </AnimatePresence>

                      {canUndoDelete && (
                        <motion.button
                          layout
                          type="button"
                          whileHover={{ scale: 1.04, y: -1 }}
                          whileTap={{ scale: 0.93 }}
                          transition={APPLE_SPRING_SNAPPY}
                          onClick={handleUndoLastDelete}
                          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs uppercase tracking-wider font-medium rounded-full bg-emerald-600 hover:bg-emerald-500 text-white transition-colors shadow-sm"
                          title="Restore recently deleted photo(s) back to memory"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>
                            Undo Delete{lastDeletedCount > 1 ? ` (${lastDeletedCount})` : ""}
                          </span>
                        </motion.button>
                      )}

                      <motion.button
                        layout
                        type="button"
                        whileHover={{ scale: 1.04, y: -1 }}
                        whileTap={{ scale: 0.93 }}
                        transition={APPLE_SPRING_SNAPPY}
                        onClick={handleLoadSamples}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs uppercase tracking-wider rounded-full bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/15 text-black dark:text-white transition-colors"
                        title="Load another fresh batch of non-repeating aesthetic real photos"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>+ Add Real Photos</span>
                      </motion.button>

                      <motion.button
                        layout
                        type="button"
                        whileHover={{ scale: 1.04, y: -1 }}
                        whileTap={{ scale: 0.93 }}
                        transition={APPLE_SPRING_SNAPPY}
                        onClick={() => setIsMcpOpen(true)}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs uppercase tracking-wider rounded-full border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 text-black dark:text-white transition-colors"
                        title="Create a new image with Claude via MCP"
                      >
                        <Wand2 className="w-3.5 h-3.5" />
                        <span>Create with Claude</span>
                      </motion.button>

                      <motion.button
                        layout
                        type="button"
                        whileHover={{ scale: 1.04, y: -1 }}
                        whileTap={{ scale: 0.93 }}
                        transition={APPLE_SPRING_SNAPPY}
                        onClick={() => handleSelectNavTab("upload")}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs uppercase tracking-wider rounded-full border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 text-black dark:text-white transition-colors"
                      >
                        <UploadCloud className="w-3.5 h-3.5" />
                        <span>Upload</span>
                      </motion.button>

                      <motion.button
                        layout
                        type="button"
                        whileHover={{ scale: 1.05, y: -1 }}
                        whileTap={{ scale: 0.92 }}
                        transition={APPLE_SPRING_SNAPPY}
                        onClick={() => setConfirmModalMode("all")}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs uppercase tracking-wider text-black/50 dark:text-white/50 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                        title="Clear all memory"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Clear All</span>
                      </motion.button>
                    </motion.div>
                  </motion.header>

                  {/* Category Filter, O(1) Indexed Search, TypedArray Sort & View Mode Bar */}
                  <CategoryFilter
                    categoriesWithCounts={categoriesWithCounts}
                    activeCategory={activeCategory}
                    onSelectCategory={setActiveCategory}
                    viewMode={viewMode}
                    onViewModeChange={setViewMode}
                    totalPhotos={photos.length}
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    sortBy={sortBy}
                    onSortChange={setSortBy}
                  />

                  {/* View Switcher: Masonry Grid or Grouped By Category with 120Hz Continuity Blur-Morph */}
                  {viewMode === "grid" ? (
                    <motion.div
                      key="grid-view"
                      initial={{ opacity: 0, y: 12, filter: "blur(8px)" }}
                      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                      transition={APPLE_SPRING_FLUID}
                    >
                      <PhotoGrid
                        photos={filteredPhotos}
                        onSelectPhoto={setSelectedPhoto}
                        onDeletePhoto={handleDeletePhoto}
                        isSelectionMode={isSelectionMode}
                        selectedPhotoIds={selectedPhotoIds}
                        onToggleSelectPhoto={toggleSelectPhoto}
                      />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="grouped-view"
                      initial={{ opacity: 0, y: 12, filter: "blur(8px)" }}
                      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                      transition={APPLE_SPRING_FLUID}
                    >
                      <GroupedCategoryView
                        photos={filteredPhotos}
                        onSelectPhoto={setSelectedPhoto}
                        onDeletePhoto={handleDeletePhoto}
                        isSelectionMode={isSelectionMode}
                        selectedPhotoIds={selectedPhotoIds}
                        onToggleSelectPhoto={toggleSelectPhoto}
                      />
                    </motion.div>
                  )}
                </>
              )}
            </motion.section>
          )}
      </main>

      {/* Semantic SEO Footer */}
      <footer className="w-full py-6 border-t border-black/5 dark:border-white/5 text-center text-[11px] font-mono uppercase tracking-widest text-black/35 dark:text-white/35">
        Sortn Sec • Zero-Shot Multimodal Vision AI • 100% In-Memory Privacy
      </footer>

      {/* Photo Detail Modal with Shared Element Transition & Selective Delete */}
      <PhotoModal
        photo={selectedPhoto}
        photos={filteredPhotos}
        onClose={() => setSelectedPhoto(null)}
        onUpdateCategory={handleUpdateCategory}
        onSelectPhoto={setSelectedPhoto}
        onDeletePhoto={handleDeletePhoto}
      />

      {/* Confirmation Dialog for Selective or Full Memory Deletion */}
      <ClearConfirmModal
        isOpen={confirmModalMode !== null}
        mode={confirmModalMode || "all"}
        photoCount={
          confirmModalMode === "selected"
            ? selectedPhotoIds.length
            : photos.length
        }
        onConfirm={() => {
          if (confirmModalMode === "selected") {
            handleDeleteSelectedPhotos();
          } else {
            clearAllPhotos();
          }
          setConfirmModalMode(null);
        }}
        onCancel={() => setConfirmModalMode(null)}
      />

      {/* Claude MCP Image Studio */}
      <McpConnectModal
        isOpen={isMcpOpen}
        onClose={() => setIsMcpOpen(false)}
        claudeApiKey={claudeApiKey}
        onSaveClaudeKey={saveClaudeKey}
        onImageGenerated={(file) => {
          setIsMcpOpen(false);
          setActiveTab("gallery");
          handleFiles([file]);
        }}
      />

      {/* Guest Storage Warning Dialog (Shown when uploading or generating without login) */}
      <GuestStorageModal
        isOpen={guestPromptState.isOpen}
        actionLabel={guestPromptState.actionLabel}
        onContinueAsGuest={() => {
          const pending = guestPromptState.pendingAction;
          setHasAcknowledgedGuestNotice(true);
          setGuestPromptState({
            isOpen: false,
            actionLabel: "upload or generate images",
            pendingAction: null,
          });
          if (typeof pending === "function") {
            pending();
          }
        }}
        onCancel={() =>
          setGuestPromptState({
            isOpen: false,
            actionLabel: "upload or generate images",
            pendingAction: null,
          })
        }
      />

      {/* Floating Toast Notices */}
      <ToastNotice notices={notices} onDismiss={dismissNotice} />
    </div>
  );
}
