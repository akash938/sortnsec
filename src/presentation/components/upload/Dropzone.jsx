"use client";
import React, { useRef, useState } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useMotionTemplate,
} from "framer-motion";
import { Sparkles, UploadCloud, Image as ImageIcon, Paintbrush } from "lucide-react";
import { UPLOAD_POLICY } from "../../../domain/rules/upload-policy";
import { LiquidJellyOrb } from "../animation/LiquidJellyOrb";
import {
  APPLE_SPRING_SNAPPY,
  APPLE_SPRING_FLUID,
  APPLE_SPRING_BOUNCY,
} from "../../motion/apple-motion";

export function Dropzone({
  onFilesSelected,
  isProcessing,
  onLoadSamples,
  onOpenMcp,
}) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [hoverPulse, setHoverPulse] = useState(0);
  const inputRef = useRef(null);
  const cardRef = useRef(null);

  // 120Hz Spatial 3D Tilt & Cursor Specular Spotlight
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);
  const smoothX = useSpring(mouseX, { stiffness: 320, damping: 28, mass: 0.6 });
  const smoothY = useSpring(mouseY, { stiffness: 320, damping: 28, mass: 0.6 });

  const rotateX = useTransform(smoothY, [0, 1], [3.5, -3.5]);
  const rotateY = useTransform(smoothX, [0, 1], [-3.5, 3.5]);
  const glareX = useTransform(smoothX, [0, 1], ["0%", "100%"]);
  const glareY = useTransform(smoothY, [0, 1], ["0%", "100%"]);
  const spotlightBg = useMotionTemplate`radial-gradient(520px circle at ${glareX} ${glareY}, rgba(255,255,255,0.12), transparent 65%)`;

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
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

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragOver) {
      setIsDragOver(true);
      setHoverPulse((p) => p + 1);
    }
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const filesArray = Array.from(e.dataTransfer.files);
      onFilesSelected(filesArray);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      onFilesSelected(filesArray);
    }
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  return (
    <div
      className="w-full max-w-2xl mx-auto flex flex-col items-center"
      style={{ perspective: "1200px" }}
    >
      {/* Master Glassmorphic Hero Drop Container with 120Hz Spatial Tilt */}
      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        onMouseEnter={() => setHoverPulse((p) => p + 1)}
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
        }}
        animate={{
          scale: isDragOver ? 1.025 : 1,
        }}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.985 }}
        transition={APPLE_SPRING_FLUID}
        className={`gpu-120hz w-full group relative cursor-pointer flex flex-col items-center justify-center px-6 py-8 sm:px-12 sm:py-12 rounded-[32px] border ${
          isDragOver
            ? "border-black dark:border-white bg-black/[0.04] dark:bg-white/[0.06] shadow-2xl"
            : "border-black/10 dark:border-white/10 bg-white/75 dark:bg-[#111111]/75 hover:border-black/25 dark:hover:border-white/25 shadow-xl hover:shadow-2xl"
        } backdrop-blur-2xl transition-colors duration-300 overflow-hidden`}
        role="button"
        tabIndex={0}
        aria-label="Upload photos area"
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={UPLOAD_POLICY.ACCEPTED_EXTENSIONS.join(",")}
          className="hidden"
          onChange={handleFileInput}
        />

        {/* Cursor-Tracking Specular Glass Highlight */}
        <motion.div
          style={{ background: spotlightBg }}
          className="absolute inset-0 rounded-[32px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        />

        {/* Ambient Inner Glass Reflection */}
        <div className="absolute inset-0 rounded-[32px] bg-gradient-to-b from-white/30 dark:from-white/5 to-transparent pointer-events-none" />

        {/* Apple-grade Liquid Jelly Orb Hero Centerpiece */}
        <div
          className="relative mb-6 flex items-center justify-center"
          style={{ transform: "translateZ(24px)" }}
        >
          <motion.div
            animate={{
              scale: isDragOver ? 1.1 : 1,
              y: isDragOver ? -6 : [0, -5, 0],
            }}
            whileHover={{ scale: 1.06 }}
            transition={{
              y: { duration: 4.2, repeat: Infinity, ease: "easeInOut" },
              scale: APPLE_SPRING_BOUNCY,
            }}
            className="relative z-10 flex items-center justify-center"
          >
            <LiquidJellyOrb
              phase={isDragOver ? 1.0 : 0.0}
              pulseTrigger={hoverPulse}
              size={196}
              className="transition-transform duration-300"
            />
          </motion.div>
        </div>

        {/* Main Instruction & Typography */}
        <div
          className="relative z-10 flex flex-col items-center text-center space-y-2 max-w-md"
          style={{ transform: "translateZ(14px)" }}
        >
          <motion.div
            whileHover={{ scale: 1.04 }}
            transition={APPLE_SPRING_SNAPPY}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] uppercase font-mono tracking-widest bg-black/[0.05] dark:bg-white/[0.07] text-black/70 dark:text-white/70 border border-black/5 dark:border-white/10"
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span>Drop Photos to Absorb & Categorize</span>
          </motion.div>

          <h3 className="text-xl sm:text-2xl font-light tracking-tight text-black dark:text-white">
            Drag & drop up to 100 photos
          </h3>

          <p className="text-xs sm:text-sm text-black/55 dark:text-white/55 font-normal leading-relaxed">
            or{" "}
            <span className="text-black dark:text-white underline underline-offset-4 font-medium group-hover:opacity-80">
              browse from your computer
            </span>{" "}
            to watch the black liquid jelly absorb them
          </p>
        </div>

        {/* Action Controls & Format Pills */}
        <div
          className="relative z-10 mt-6 pt-5 w-full flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-black/5 dark:border-white/5 text-xs"
          style={{ transform: "translateZ(18px)" }}
        >
          {/* Format Badges */}
          <div className="flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wider text-black/40 dark:text-white/40">
            <ImageIcon className="w-3.5 h-3.5 opacity-60" />
            <span>JPG • PNG • WEBP • Max 100</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {onOpenMcp && (
              <motion.button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenMcp();
                }}
                whileHover={{ scale: 1.05, y: -1 }}
                whileTap={{ scale: 0.92 }}
                transition={APPLE_SPRING_SNAPPY}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium tracking-wide border border-black/15 dark:border-white/15 bg-white/80 dark:bg-white/[0.06] text-black dark:text-white hover:bg-black/5 dark:hover:bg-white/15 shadow-sm transition-colors"
              >
                <Paintbrush className="w-3.5 h-3.5" />
                <span>Create</span>
              </motion.button>
            )}

            {/* Quick Demo Sample Button with ProMotion Spring Tap */}
            {onLoadSamples && (
              <motion.button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onLoadSamples();
                }}
                whileHover={{ scale: 1.05, y: -1 }}
                whileTap={{ scale: 0.92 }}
                transition={APPLE_SPRING_SNAPPY}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-medium tracking-wide bg-black/[0.07] dark:bg-white/[0.12] text-black dark:text-white hover:bg-black/15 dark:hover:bg-white/20 border border-black/10 dark:border-white/15 shadow-sm transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Add Real Aesthetic Photos</span>
              </motion.button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
