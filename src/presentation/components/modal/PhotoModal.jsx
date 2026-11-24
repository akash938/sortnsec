"use client";
import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ALL_CATEGORIES } from "../../../domain/entities/category.entity";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Check,
  Trash2,
  Download,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  RotateCcw,
  Eye,
} from "lucide-react";
import { downloadPhotoWithWatermark } from "../../../infrastructure/image/watermark-exporter.adapter";
import {
  APPLE_SPRING_FLUID,
  APPLE_SPRING_SNAPPY,
  APPLE_SPRING_BOUNCY,
  appleModalBackdropVariants,
  appleModalCardVariants,
} from "../../motion/apple-motion";

export function PhotoModal({
  photo,
  photos,
  onClose,
  onUpdateCategory,
  onSelectPhoto,
  onDeletePhoto,
}) {
  const [zoomScale, setZoomScale] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isDraggingPan, setIsDraggingPan] = useState(false);
  const [isFullScreenInspect, setIsFullScreenInspect] = useState(false);
  const [isLoupeEnabled, setIsLoupeEnabled] = useState(false);
  const [loupeState, setLoupeState] = useState({
    active: false,
    xPercent: 50,
    yPercent: 50,
    clientX: 0,
    clientY: 0,
  });

  const dragStartRef = useRef({ x: 0, y: 0, originX: 0, originY: 0 });
  const stageRef = useRef(null);

  // Reset zoom & pan whenever photo changes
  useEffect(() => {
    setZoomScale(1);
    setPanOffset({ x: 0, y: 0 });
    setLoupeState((prev) => ({ ...prev, active: false }));
  }, [photo?.id]);

  const handleZoomChange = (nextZoom) => {
    const clamped = Math.max(1, Math.min(4, Number(nextZoom.toFixed(2))));
    setZoomScale(clamped);
    if (clamped <= 1) {
      setPanOffset({ x: 0, y: 0 });
    }
  };

  const handleResetView = () => {
    setZoomScale(1);
    setPanOffset({ x: 0, y: 0 });
  };

  const handleWheelZoom = (e) => {
    e.preventDefault();
    const delta = e.deltaY < 0 ? 0.25 : -0.25;
    handleZoomChange(zoomScale + delta);
  };

  const handlePointerDown = (e) => {
    if (zoomScale <= 1) return;
    e.preventDefault();
    setIsDraggingPan(true);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      originX: panOffset.x,
      originY: panOffset.y,
    };
  };

  const handlePointerMove = (e) => {
    if (stageRef.current) {
      const rect = stageRef.current.getBoundingClientRect();
      const xPercent = Math.max(
        0,
        Math.min(100, ((e.clientX - rect.left) / rect.width) * 100)
      );
      const yPercent = Math.max(
        0,
        Math.min(100, ((e.clientY - rect.top) / rect.height) * 100)
      );
      setLoupeState({
        active: true,
        xPercent,
        yPercent,
        clientX: e.clientX - rect.left,
        clientY: e.clientY - rect.top,
      });
    }

    if (!isDraggingPan || zoomScale <= 1) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    setPanOffset({
      x: dragStartRef.current.originX + dx,
      y: dragStartRef.current.originY + dy,
    });
  };

  const handlePointerUp = () => {
    setIsDraggingPan(false);
  };

  useEffect(() => {
    if (!photo) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        if (isFullScreenInspect) {
          setIsFullScreenInspect(false);
        } else {
          onClose();
        }
      } else if (e.key === "ArrowLeft") {
        const currentIndex = photos.findIndex((p) => p.id === photo.id);
        if (currentIndex > 0) {
          onSelectPhoto(photos[currentIndex - 1]);
        }
      } else if (e.key === "ArrowRight") {
        const currentIndex = photos.findIndex((p) => p.id === photo.id);
        if (currentIndex < photos.length - 1) {
          onSelectPhoto(photos[currentIndex + 1]);
        }
      } else if (e.key === "+" || e.key === "=") {
        handleZoomChange(zoomScale + 0.5);
      } else if (e.key === "-") {
        handleZoomChange(zoomScale - 0.5);
      } else if (e.key === "0") {
        handleResetView();
      } else if (e.key === "f" || e.key === "F") {
        setIsFullScreenInspect((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [photo, photos, onClose, onSelectPhoto, isFullScreenInspect, zoomScale]);

  const currentIndex = photo
    ? photos.findIndex((p) => p.id === photo.id)
    : -1;
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex >= 0 && currentIndex < photos.length - 1;
  const currentCategory = photo
    ? photo.manualCategory || photo.primaryCategory || "Uncategorized"
    : "";

  if (!photo) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center pt-20 sm:pt-24 pb-4 px-4 sm:px-6 md:px-10 overflow-y-auto">
          <motion.div
            variants={appleModalBackdropVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            onClick={onClose}
            className="fixed inset-0 bg-white/95 dark:bg-black/85 backdrop-blur-xl"
          />

          <motion.div
            layoutId={`photo-card-${photo.id}`}
            variants={appleModalCardVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={APPLE_SPRING_FLUID}
            className={`gpu-120hz relative z-10 overflow-hidden border border-black/10 dark:border-white/15 bg-white dark:bg-[#111111]/95 backdrop-blur-2xl shadow-[0_24px_80px_rgba(0,0,0,0.16),0_4px_20px_rgba(0,0,0,0.06)] dark:shadow-[0_28px_90px_rgba(0,0,0,0.85)] flex flex-col md:flex-row transition-all duration-300 text-black dark:text-white ${
              isFullScreenInspect
                ? "w-[96vw] h-[calc(100vh-7rem)] max-w-none max-h-none rounded-[26px]"
                : "w-full max-w-4xl max-h-[calc(100vh-7rem)] rounded-[28px]"
            }`}
            role="dialog"
            aria-modal="true"
            aria-label={`Photo details: ${currentCategory}`}
          >
            {/* Floating Exit + Close controls ONLY when in full-bleed Client Fullscreen mode */}
            {isFullScreenInspect && (
              <div className="absolute top-4 right-4 z-30 flex items-center gap-2">
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.06 }}
                  whileTap={{ scale: 0.92 }}
                  transition={APPLE_SPRING_SNAPPY}
                  onClick={() => setIsFullScreenInspect(false)}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[11px] font-mono uppercase tracking-wider bg-black/80 text-white backdrop-blur-md border border-white/20 hover:bg-black transition-colors shadow-lg"
                  title="Exit Client Fullscreen View (F)"
                >
                  <Minimize2 className="w-3.5 h-3.5" />
                  <span>Exit Fullscreen</span>
                </motion.button>

                <motion.button
                  type="button"
                  whileHover={{ scale: 1.12, rotate: 90 }}
                  whileTap={{ scale: 0.86 }}
                  transition={APPLE_SPRING_BOUNCY}
                  onClick={onClose}
                  aria-label="Close modal"
                  className="p-2 rounded-full bg-black/80 hover:bg-black text-white border border-white/20 transition-colors shadow-lg"
                >
                  <X className="w-4 h-4" />
                </motion.button>
              </div>
            )}

            <div
              ref={stageRef}
              onWheel={handleWheelZoom}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerLeave={() => {
                handlePointerUp();
                setLoupeState((prev) => ({ ...prev, active: false }));
              }}
              onDoubleClick={() =>
                handleZoomChange(zoomScale > 1 ? 1 : 2.25)
              }
              className={`relative ${
                isFullScreenInspect ? "w-full h-full" : "md:w-3/5"
              } bg-black/[0.04] dark:bg-black/60 flex items-center justify-center min-h-[340px] sm:min-h-[440px] md:min-h-[520px] max-h-[calc(100vh-7rem)] overflow-hidden select-none ${
                zoomScale > 1
                  ? isDraggingPan
                    ? "cursor-grabbing"
                    : "cursor-grab"
                  : isLoupeEnabled
                  ? "cursor-crosshair"
                  : "cursor-zoom-in"
              }`}
            >
              {/* Client Perspective Interactive Zoom & Loupe HUD Bar */}
              <div
                onClick={(e) => e.stopPropagation()}
                className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/80 dark:bg-black/85 text-white border border-white/15 backdrop-blur-xl shadow-xl text-[11px] font-mono"
              >
                <button
                  type="button"
                  onClick={() => handleZoomChange(zoomScale - 0.5)}
                  disabled={zoomScale <= 1}
                  className="p-1 rounded-full hover:bg-white/15 disabled:opacity-35 transition-opacity"
                  title="Zoom Out (-)"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>

                {[1, 1.5, 2, 3].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => handleZoomChange(preset)}
                    className={`px-2 py-0.5 rounded-full transition-colors ${
                      Math.abs(zoomScale - preset) < 0.1
                        ? "bg-white text-black font-semibold"
                        : "text-white/75 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    {preset}x
                  </button>
                ))}

                <button
                  type="button"
                  onClick={() => handleZoomChange(zoomScale + 0.5)}
                  disabled={zoomScale >= 4}
                  className="p-1 rounded-full hover:bg-white/15 disabled:opacity-35 transition-opacity"
                  title="Zoom In (+)"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>

                <div className="h-3.5 w-[1px] bg-white/20 mx-0.5" />

                <button
                  type="button"
                  onClick={() => setIsLoupeEnabled((prev) => !prev)}
                  className={`flex items-center gap-1 px-2 py-0.5 rounded-full transition-colors ${
                    isLoupeEnabled
                      ? "bg-emerald-500 text-black font-semibold"
                      : "text-white/75 hover:text-white hover:bg-white/10"
                  }`}
                  title="Toggle Client Optical Loupe Magnifier"
                >
                  <Eye className="w-3 h-3" />
                  <span className="hidden sm:inline">Loupe</span>
                </button>

                {(zoomScale > 1 || panOffset.x !== 0 || panOffset.y !== 0) && (
                  <button
                    type="button"
                    onClick={handleResetView}
                    className="p-1 rounded-full hover:bg-white/15 text-white/80 hover:text-white"
                    title="Reset Zoom (0)"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {hasPrev && (
                <motion.button
                  whileHover={{ scale: 1.12, x: -2 }}
                  whileTap={{ scale: 0.88 }}
                  transition={APPLE_SPRING_SNAPPY}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectPhoto(photos[currentIndex - 1]);
                  }}
                  aria-label="Previous photo"
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full bg-white/80 dark:bg-black/80 hover:bg-white dark:hover:bg-black text-black dark:text-white transition-colors shadow-md backdrop-blur-md"
                >
                  <ChevronLeft className="w-5 h-5" />
                </motion.button>
              )}

              {hasNext && (
                <motion.button
                  whileHover={{ scale: 1.12, x: 2 }}
                  whileTap={{ scale: 0.88 }}
                  transition={APPLE_SPRING_SNAPPY}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectPhoto(photos[currentIndex + 1]);
                  }}
                  aria-label="Next photo"
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full bg-white/80 dark:bg-black/80 hover:bg-white dark:hover:bg-black text-black dark:text-white transition-colors shadow-md backdrop-blur-md"
                >
                  <ChevronRight className="w-5 h-5" />
                </motion.button>
              )}

              <AnimatePresence mode="wait" initial={false}>
                <motion.img
                  key={photo.id}
                  layoutId={`photo-img-${photo.id}`}
                  initial={{ opacity: 0, scale: 0.94, filter: "blur(8px)" }}
                  animate={{
                    opacity: 1,
                    scale: zoomScale,
                    x: panOffset.x,
                    y: panOffset.y,
                    filter: "blur(0px)",
                  }}
                  exit={{ opacity: 0, scale: 0.94, filter: "blur(8px)" }}
                  transition={
                    isDraggingPan
                      ? { duration: 0 }
                      : APPLE_SPRING_FLUID
                  }
                  src={photo.objectUrl}
                  alt={`Full preview categorized as ${currentCategory}`}
                  draggable={false}
                  className="w-full h-full object-cover select-none"
                />
              </AnimatePresence>

              {/* Floating Optical Loupe Lens for Client Perspective Detail Inspection */}
              {isLoupeEnabled && loupeState.active && (
                <div
                  style={{
                    left: Math.max(
                      90,
                      Math.min(
                        (stageRef.current?.clientWidth || 500) - 90,
                        loupeState.clientX
                      )
                    ),
                    top: Math.max(
                      90,
                      Math.min(
                        (stageRef.current?.clientHeight || 400) - 90,
                        loupeState.clientY
                      )
                    ),
                    backgroundImage: `url(${photo.objectUrl})`,
                    backgroundRepeat: "no-repeat",
                    backgroundSize: "320% 320%",
                    backgroundPosition: `${loupeState.xPercent}% ${loupeState.yPercent}%`,
                  }}
                  className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 z-30 w-40 h-40 rounded-full border-2 border-white/90 shadow-[0_16px_48px_rgba(0,0,0,0.65)] ring-4 ring-black/30"
                />
              )}
            </div>

            {!isFullScreenInspect && (
            <div className="md:w-2/5 p-6 md:p-8 flex flex-col justify-between overflow-y-auto max-h-[50vh] md:max-h-[85vh] space-y-6">
              <div className="space-y-6">
                {/* Dedicated Top Header Bar so buttons never overlap Photo Counter, Dimensions, or Title */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between gap-2 pb-2 border-b border-black/10 dark:border-white/10">
                    <span className="text-[11px] font-mono uppercase tracking-widest text-black/55 dark:text-white/55">
                      Photo {currentIndex + 1} of {photos.length} • {photo.width} × {photo.height}
                    </span>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.92 }}
                        transition={APPLE_SPRING_SNAPPY}
                        onClick={() => setIsFullScreenInspect(true)}
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono uppercase tracking-wider bg-black/[0.06] dark:bg-white/[0.1] hover:bg-black/15 dark:hover:bg-white/20 text-black dark:text-white border border-black/10 dark:border-white/15 transition-colors"
                        title="Open Client Perspective Fullscreen View (F)"
                      >
                        <Maximize2 className="w-3 h-3" />
                        <span>Client Fullscreen</span>
                      </motion.button>

                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.12, rotate: 90 }}
                        whileTap={{ scale: 0.86 }}
                        transition={APPLE_SPRING_BOUNCY}
                        onClick={onClose}
                        aria-label="Close modal"
                        className="p-1.5 rounded-full bg-black/[0.06] dark:bg-white/[0.1] hover:bg-black/15 dark:hover:bg-white/20 text-black dark:text-white transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </motion.button>
                    </div>
                  </div>

                  <motion.h2
                    key={photo.name}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={APPLE_SPRING_SNAPPY}
                    className="text-xl font-light text-black dark:text-white truncate"
                    title={photo.name}
                  >
                    {photo.name}
                  </motion.h2>
                </div>

                <div className="p-4 rounded-2xl border border-black/10 dark:border-white/15 bg-black/[0.03] dark:bg-white/[0.04] space-y-2">
                  <label
                    htmlFor="category-override"
                    className="block text-xs uppercase tracking-wider font-medium text-black/65 dark:text-white/65"
                  >
                    Primary Category
                  </label>
                  <select
                    id="category-override"
                    value={currentCategory}
                    onChange={(e) => onUpdateCategory(photo.id, e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-black/15 dark:border-white/15 bg-white dark:bg-[#1a1a1a] text-black dark:text-white focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white transition-colors cursor-pointer"
                  >
                    <optgroup label="Aesthetic">
                      {ALL_CATEGORIES.filter((c) => c.type === "aesthetic").map(
                        (cat) => (
                          <option key={cat.id} value={cat.label}>
                            {cat.label}
                          </option>
                        )
                      )}
                    </optgroup>
                    <optgroup label="Subject">
                      {ALL_CATEGORIES.filter((c) => c.type === "subject").map(
                        (cat) => (
                          <option key={cat.id} value={cat.label}>
                            {cat.label}
                          </option>
                        )
                      )}
                    </optgroup>
                  </select>
                  {photo.manualCategory && (
                    <p className="text-[11px] text-black/45 dark:text-white/45 italic">
                      Manually corrected from original ({photo.primaryCategory})
                    </p>
                  )}
                </div>

                <div>
                  <h4 className="text-xs uppercase tracking-wider font-medium text-black/65 dark:text-white/65 mb-3">
                    CLIP Confidence & Tag Breakdown
                  </h4>

                  {photo.allScores && photo.allScores.length > 0 ? (
                    <div className="space-y-2.5">
                      {photo.allScores.slice(0, 6).map((score, idx) => {
                        const isPrimary = score.label === currentCategory;
                        return (
                          <div key={score.label} className="space-y-1">
                            <div className="flex items-center justify-between text-xs tracking-wide">
                              <span
                                className={`flex items-center gap-1.5 ${
                                  isPrimary
                                    ? "font-medium text-black dark:text-white"
                                    : "text-black/70 dark:text-white/70"
                                }`}
                              >
                                {isPrimary && (
                                  <Check className="w-3 h-3 text-black dark:text-white" />
                                )}
                                <span>{score.label}</span>
                                <span className="text-[10px] text-black/45 dark:text-white/45 uppercase">
                                  ({score.categoryType})
                                </span>
                              </span>
                              <span className="font-mono text-[11px] text-black/65 dark:text-white/65">
                                {score.percentage}%
                              </span>
                            </div>
                            <div className="h-1.5 w-full bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
                              <motion.div
                                key={`${photo.id}-${score.label}`}
                                initial={{ width: 0 }}
                                animate={{ width: `${score.percentage}%` }}
                                transition={{
                                  ...APPLE_SPRING_FLUID,
                                  delay: idx * 0.035,
                                }}
                                className={`h-full rounded-full ${
                                  isPrimary
                                    ? "bg-black dark:bg-white"
                                    : "bg-black/40 dark:bg-white/40"
                                }`}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-xs text-black/45 dark:text-white/45 italic">
                      Confidence data still processing or unavailable.
                    </p>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-black/10 dark:border-white/10 space-y-2.5">
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.95 }}
                  transition={APPLE_SPRING_SNAPPY}
                  onClick={() => downloadPhotoWithWatermark(photo)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs uppercase tracking-wider font-semibold bg-black dark:bg-white text-white dark:text-black hover:opacity-90 transition-opacity shadow-sm"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Photo (sortnsec)</span>
                </motion.button>
                {onDeletePhoto && (
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.02, y: -1 }}
                    whileTap={{ scale: 0.95 }}
                    transition={APPLE_SPRING_SNAPPY}
                    onClick={() => onDeletePhoto(photo.id)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs uppercase tracking-wider font-medium border border-black/15 dark:border-white/15 bg-black/[0.04] dark:bg-white/[0.06] hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black text-black dark:text-white transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Photo from Memory</span>
                  </motion.button>
                )}
                <div className="text-[11px] text-black/45 dark:text-white/45 flex items-center justify-between">
                  <span>Scroll or double-click image to zoom</span>
                  <span>Press F for Fullscreen</span>
                </div>
              </div>
            </div>
            )}
          </motion.div>
    </div>
  );
}
