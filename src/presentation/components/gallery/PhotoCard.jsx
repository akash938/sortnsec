"use client";
import React, { useState, useRef } from "react";
import {
  motion,
  AnimatePresence,
  useReducedMotion,
  useMotionValue,
  useSpring,
  useTransform,
  useMotionTemplate,
} from "framer-motion";
import { Loader2, AlertTriangle, Trash2, Check, Download } from "lucide-react";
import { downloadPhotoWithWatermark } from "../../../infrastructure/image/watermark-exporter.adapter";
import {
  APPLE_SPRING_FLUID,
  APPLE_SPRING_SNAPPY,
  APPLE_SPRING_BOUNCY,
  APPLE_EASE_OUT_EXPO,
} from "../../motion/apple-motion";

export function PhotoCard({
  photo,
  onClick,
  index,
  onDeletePhoto,
  isSelectionMode = false,
  isSelected = false,
  onToggleSelect,
}) {
  const shouldReduceMotion = useReducedMotion();
  const [imageLoaded, setImageLoaded] = useState(false);
  const cardRef = useRef(null);

  const displayCategory =
    photo.manualCategory || photo.primaryCategory || "Classifying";
  const displayConfidence = photo.confidence ? `${photo.confidence}%` : null;

  // 120Hz ProMotion 3D Spatial Tilt & Specular Glare
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);
  const smoothX = useSpring(mouseX, { stiffness: 420, damping: 30, mass: 0.5 });
  const smoothY = useSpring(mouseY, { stiffness: 420, damping: 30, mass: 0.5 });

  const rotateX = useTransform(
    smoothY,
    [0, 1],
    shouldReduceMotion ? [0, 0] : [5, -5]
  );
  const rotateY = useTransform(
    smoothX,
    [0, 1],
    shouldReduceMotion ? [0, 0] : [-5, 5]
  );
  const glareX = useTransform(smoothX, [0, 1], ["0%", "100%"]);
  const glareY = useTransform(smoothY, [0, 1], ["0%", "100%"]);
  const glareBackground = useMotionTemplate`radial-gradient(280px circle at ${glareX} ${glareY}, rgba(255,255,255,0.22), transparent 70%)`;

  const handleMouseMove = (e) => {
    if (shouldReduceMotion || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    mouseX.set(Math.max(0, Math.min(1, x)));
    mouseY.set(Math.max(0, Math.min(1, y)));
  };

  const handleMouseLeave = () => {
    mouseX.set(0.5);
    mouseY.set(0.5);
  };

  const handleCardClick = () => {
    if (isSelectionMode && onToggleSelect) {
      onToggleSelect(photo.id);
    } else {
      onClick(photo);
    }
  };

  return (
    <div style={{ perspective: "900px" }}>
      <motion.div
        ref={cardRef}
        layout
        layoutId={`photo-card-${photo.id}`}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        initial={
          shouldReduceMotion
            ? { opacity: 0 }
            : { opacity: 0, y: 20, scale: 0.94, filter: "blur(8px)" }
        }
        animate={{
          opacity: 1,
          y: 0,
          scale: isSelected ? 0.985 : 1,
          filter: "blur(0px)",
        }}
        exit={
          shouldReduceMotion
            ? { opacity: 0 }
            : {
                opacity: 0,
                scale: 0.76,
                y: -12,
                filter: "blur(14px)",
                transition: { duration: 0.24, ease: APPLE_EASE_OUT_EXPO },
              }
        }
        transition={{
          ...APPLE_SPRING_FLUID,
          delay: Math.min(index * 0.018, 0.22),
        }}
        whileHover={
          shouldReduceMotion
            ? {}
            : {
                y: -5,
                scale: isSelected ? 0.995 : 1.018,
                transition: APPLE_SPRING_SNAPPY,
              }
        }
        whileTap={
          shouldReduceMotion
            ? {}
            : {
                scale: 0.955,
                transition: APPLE_SPRING_SNAPPY,
              }
        }
        style={{
          aspectRatio: photo.aspectRatio > 0 ? `${photo.aspectRatio}` : "4/3",
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
        }}
        onClick={handleCardClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleCardClick();
          }
        }}
        aria-label={`Photo categorized as ${displayCategory}${
          displayConfidence ? ` with ${displayConfidence} confidence` : ""
        }`}
        className={`gpu-120hz group relative cursor-pointer overflow-hidden rounded-2xl border transition-shadow duration-300 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white ${
          isSelected
            ? "border-black dark:border-white ring-2 ring-black dark:ring-white bg-black/[0.06] dark:bg-white/[0.08] shadow-xl"
            : "border-black/10 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.03] shadow-sm hover:shadow-[0_18px_40px_rgba(0,0,0,0.16)] dark:hover:shadow-[0_18px_40px_rgba(0,0,0,0.55)]"
        }`}
      >
        {!imageLoaded && (
          <div className="absolute inset-0 bg-black/5 dark:bg-white/5 animate-pulse" />
        )}

        <motion.img
          layoutId={`photo-img-${photo.id}`}
          src={photo.objectUrl}
          alt={`Photo classified as ${displayCategory}`}
          loading="lazy"
          onLoad={() => setImageLoaded(true)}
          animate={{
            scale: isSelected ? 0.955 : 1,
            borderRadius: isSelected ? "14px" : "0px",
          }}
          transition={APPLE_SPRING_SNAPPY}
          className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
        />

        {/* Dynamic 120Hz Specular Light Glare */}
        <motion.div
          style={{ background: glareBackground }}
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none mix-blend-overlay"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

        {/* Top Action Bar: Selective Checkbox (left) & Individual Delete from Memory (right) */}
        <div className="absolute top-2.5 left-2.5 right-2.5 z-10 flex items-center justify-between pointer-events-none">
          {onToggleSelect ? (
            <motion.button
              type="button"
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.84 }}
              transition={APPLE_SPRING_BOUNCY}
              onClick={(e) => {
                e.stopPropagation();
                onToggleSelect(photo.id);
              }}
              aria-label={
                isSelected ? `Deselect ${photo.name}` : `Select ${photo.name}`
              }
              title={isSelected ? "Selected for deletion" : "Select photo"}
              className={`pointer-events-auto w-7 h-7 rounded-full flex items-center justify-center transition-opacity backdrop-blur-md border ${
                isSelected
                  ? "opacity-100 bg-black dark:bg-white text-white dark:text-black border-black dark:border-white shadow-md"
                  : isSelectionMode
                  ? "opacity-100 bg-black/50 text-white/80 border-white/40 hover:bg-black/80"
                  : "opacity-0 group-hover:opacity-100 focus:opacity-100 bg-black/50 text-white/80 border-white/30 hover:bg-black/80"
              }`}
            >
              <motion.span
                initial={false}
                animate={{
                  scale: isSelected ? 1 : 0.72,
                  opacity: isSelected ? 1 : 0.65,
                }}
                transition={APPLE_SPRING_BOUNCY}
              >
                <Check className="w-3.5 h-3.5" />
              </motion.span>
            </motion.button>
          ) : (
            <span />
          )}

          <div className="flex items-center gap-1.5">
            <motion.button
              type="button"
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.84 }}
              transition={APPLE_SPRING_BOUNCY}
              onClick={(e) => {
                e.stopPropagation();
                downloadPhotoWithWatermark(photo);
              }}
              aria-label={`Download ${photo.name} with sortnsec watermark`}
              title="Download with sortnsec watermark"
              className="pointer-events-auto w-7 h-7 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 focus:opacity-100 transition-colors bg-black/65 hover:bg-black text-white/90 hover:text-white backdrop-blur-md border border-white/20 shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
            </motion.button>

            {onDeletePhoto && (
              <motion.button
                type="button"
                whileHover={{ scale: 1.16, rotate: -6 }}
                whileTap={{ scale: 0.82 }}
                transition={APPLE_SPRING_BOUNCY}
                onClick={(e) => {
                  e.stopPropagation();
                  onDeletePhoto(photo.id);
                }}
                aria-label={`Delete ${photo.name} from memory`}
                title="Delete this photo from memory"
                className="pointer-events-auto w-7 h-7 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 focus:opacity-100 transition-colors bg-black/65 hover:bg-red-600 text-white/90 hover:text-white backdrop-blur-md border border-white/20 hover:border-red-400 shadow-sm"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </motion.button>
            )}
          </div>
        </div>

        {/* Bottom Category & Confidence Pill with Spring Morph */}
        <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between gap-2 pointer-events-none">
          <AnimatePresence mode="wait" initial={false}>
            {photo.status === "processing" ? (
              <motion.span
                key="processing"
                initial={{ opacity: 0, y: 6, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.9 }}
                transition={APPLE_SPRING_SNAPPY}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] uppercase tracking-wider font-medium bg-black/75 dark:bg-white/90 text-white dark:text-black backdrop-blur-md"
              >
                <Loader2 className="w-3 h-3 animate-spin" />
                <span>Analyzing...</span>
              </motion.span>
            ) : photo.status === "error" ? (
              <motion.span
                key="error"
                initial={{ opacity: 0, y: 6, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.9 }}
                transition={APPLE_SPRING_SNAPPY}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] uppercase tracking-wider font-medium bg-black/80 dark:bg-white/90 text-white dark:text-black backdrop-blur-md"
              >
                <AlertTriangle className="w-3 h-3" />
                <span>Uncertain</span>
              </motion.span>
            ) : (
              <motion.div
                key={displayCategory}
                initial={{ opacity: 0, y: 6, scale: 0.9, filter: "blur(4px)" }}
                animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -4, scale: 0.9 }}
                transition={APPLE_SPRING_BOUNCY}
                className="flex items-center gap-2 px-2.5 py-1 rounded-full text-[11px] uppercase tracking-wider font-medium bg-black/75 dark:bg-black/85 text-white backdrop-blur-md border border-white/15 shadow-sm"
              >
                <span>{displayCategory}</span>
                {displayConfidence && (
                  <span className="font-mono text-[10px] text-white/70">
                    {displayConfidence}
                  </span>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {photo.manualCategory && (
              <motion.span
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.7 }}
                transition={APPLE_SPRING_BOUNCY}
                className="px-2 py-0.5 rounded-full text-[9px] uppercase tracking-wider font-mono bg-white/90 text-black border border-white/30"
              >
                Edited
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
