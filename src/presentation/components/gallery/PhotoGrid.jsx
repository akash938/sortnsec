"use client";
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PhotoCard } from "./PhotoCard";
import { APPLE_SPRING_FLUID, APPLE_EASE_OUT_EXPO } from "../../motion/apple-motion";

export function PhotoGrid({
  photos,
  onSelectPhoto,
  onDeletePhoto,
  isSelectionMode = false,
  selectedPhotoIds = [],
  onToggleSelectPhoto,
}) {
  if (photos.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12, filter: "blur(6px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={APPLE_SPRING_FLUID}
        className="py-20 text-center"
      >
        <p className="text-sm uppercase tracking-widest text-black/40 dark:text-white/40">
          No photos match the selected filter
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div layout transition={APPLE_SPRING_FLUID} className="w-full">
      <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
        <AnimatePresence mode="popLayout">
          {photos.map((photo, index) => (
            <motion.div
              layout
              key={photo.id}
              initial={{ opacity: 0, scale: 0.9, filter: "blur(8px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              exit={{
                opacity: 0,
                scale: 0.76,
                filter: "blur(12px)",
                transition: { duration: 0.22, ease: APPLE_EASE_OUT_EXPO },
              }}
              transition={APPLE_SPRING_FLUID}
              className="break-inside-avoid"
            >
              <PhotoCard
                photo={photo}
                onClick={onSelectPhoto}
                index={index}
                onDeletePhoto={onDeletePhoto}
                isSelectionMode={isSelectionMode}
                isSelected={selectedPhotoIds.includes(photo.id)}
                onToggleSelect={onToggleSelectPhoto}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
