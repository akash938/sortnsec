"use client";
import React, { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { groupPhotosByCategory } from "../../../application/use-cases/group-photos-by-category.use-case";
import { PhotoCard } from "./PhotoCard";
import {
  APPLE_SPRING_FLUID,
  APPLE_SPRING_BOUNCY,
  APPLE_EASE_OUT_EXPO,
} from "../../motion/apple-motion";

export function GroupedCategoryView({
  photos,
  onSelectPhoto,
  onDeletePhoto,
  isSelectionMode = false,
  selectedPhotoIds = [],
  onToggleSelectPhoto,
}) {
  const groups = useMemo(() => groupPhotosByCategory(photos), [photos]);

  if (photos.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12, filter: "blur(6px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={APPLE_SPRING_FLUID}
        className="py-20 text-center"
      >
        <p className="text-sm uppercase tracking-widest text-black/40 dark:text-white/40">
          No photos found
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div layout transition={APPLE_SPRING_FLUID} className="space-y-12">
      <AnimatePresence mode="popLayout">
        {groups.map(({ category, photos: categoryPhotos }, groupIdx) => (
          <motion.section
            layout
            key={category}
            initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{
              opacity: 0,
              scale: 0.94,
              filter: "blur(10px)",
              transition: { duration: 0.22, ease: APPLE_EASE_OUT_EXPO },
            }}
            transition={{
              ...APPLE_SPRING_FLUID,
              delay: Math.min(groupIdx * 0.04, 0.2),
            }}
            className="space-y-4"
          >
            <div className="flex items-baseline justify-between border-b border-black/10 dark:border-white/10 pb-3">
              <h3 className="text-xl font-light tracking-tight text-black dark:text-white flex items-center gap-3">
                <span>{category}</span>
                <motion.span
                  key={categoryPhotos.length}
                  initial={{ scale: 0.8, opacity: 0.5 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={APPLE_SPRING_BOUNCY}
                  className="text-xs uppercase font-mono tracking-widest text-black/40 dark:text-white/40 px-2.5 py-0.5 rounded-full border border-black/10 dark:border-white/10"
                >
                  {categoryPhotos.length}{" "}
                  {categoryPhotos.length === 1 ? "photo" : "photos"}
                </motion.span>
              </h3>
            </div>

            <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
              <AnimatePresence mode="popLayout">
                {categoryPhotos.map((photo, index) => (
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
          </motion.section>
        ))}
      </AnimatePresence>
    </motion.div>
  );
}
