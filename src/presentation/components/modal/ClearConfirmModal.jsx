"use client";
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, X } from "lucide-react";
import {
  APPLE_SPRING_SNAPPY,
  APPLE_SPRING_BOUNCY,
  appleModalBackdropVariants,
  appleModalCardVariants,
} from "../../motion/apple-motion";

export function ClearConfirmModal({
  isOpen,
  photoCount,
  mode = "all",
  onConfirm,
  onCancel,
}) {
  const isSelective = mode === "selected";

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center pt-20 sm:pt-24 pb-4 px-4">
          {/* Clean White Backdrop in Light Mode / Deep Black in Dark Mode */}
          <motion.div
            variants={appleModalBackdropVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            onClick={onCancel}
            className="fixed inset-0 bg-white/95 dark:bg-black/85 backdrop-blur-xl"
          />

          {/* Apple Minimalist Black & White Liquid Glass Modal Card */}
          <motion.div
            variants={appleModalCardVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="gpu-120hz relative w-full max-w-md rounded-[28px] border border-black/10 dark:border-white/15 bg-white dark:bg-[#111111]/95 backdrop-blur-2xl p-6 sm:p-7 shadow-[0_24px_80px_rgba(0,0,0,0.16),0_4px_20px_rgba(0,0,0,0.06)] dark:shadow-[0_28px_90px_rgba(0,0,0,0.85)] z-10 select-none text-black dark:text-white"
          >
            {/* Close button */}
            <motion.button
              whileHover={{ scale: 1.12, rotate: 90 }}
              whileTap={{ scale: 0.85 }}
              transition={APPLE_SPRING_BOUNCY}
              onClick={onCancel}
              aria-label="Close modal"
              className="absolute top-5 right-5 p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-black/55 dark:text-white/55 hover:text-black dark:hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </motion.button>

            {/* Icon Header */}
            <div className="flex items-center gap-3.5 mb-4">
              <motion.div
                initial={{ scale: 0.7, rotate: -15 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={APPLE_SPRING_BOUNCY}
                className="w-11 h-11 rounded-2xl bg-black/[0.06] dark:bg-white/[0.1] text-black dark:text-white flex items-center justify-center border border-black/10 dark:border-white/15"
              >
                <Trash2 className="w-5 h-5" />
              </motion.div>
              <div>
                <h3 className="text-lg font-medium text-black dark:text-white tracking-tight">
                  {isSelective
                    ? `Delete ${photoCount} selected ${
                        photoCount === 1 ? "photo" : "photos"
                      }?`
                    : "Clear all photos?"}
                </h3>
                <p className="text-xs uppercase font-mono tracking-widest text-black/50 dark:text-white/50">
                  {isSelective ? "Selective Memory Removal" : "Memory Reset"}
                </p>
              </div>
            </div>

            {/* Body description */}
            <p className="text-sm text-black/70 dark:text-white/70 leading-relaxed mb-6">
              {isSelective ? (
                <>
                  This will permanently remove the{" "}
                  <strong className="font-semibold text-black dark:text-white">
                    {photoCount} selected {photoCount === 1 ? "photo" : "photos"}
                  </strong>{" "}
                  from memory and release their Object URLs, while keeping the
                  rest of your categorized gallery intact.
                </>
              ) : (
                <>
                  This will remove all{" "}
                  <strong className="font-semibold text-black dark:text-white">
                    {photoCount} photos
                  </strong>{" "}
                  currently stored in memory. Object URLs will be released and
                  categorized tags will be reset.
                </>
              )}
            </p>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2 border-t border-black/10 dark:border-white/10">
              <motion.button
                type="button"
                whileHover={{ scale: 1.04, y: -1 }}
                whileTap={{ scale: 0.93 }}
                transition={APPLE_SPRING_SNAPPY}
                onClick={onCancel}
                className="px-4 py-2 text-xs uppercase tracking-wider font-medium rounded-full border border-black/15 dark:border-white/15 bg-black/[0.04] dark:bg-white/[0.08] text-black dark:text-white hover:bg-black/10 dark:hover:bg-white/15 transition-colors"
              >
                Cancel
              </motion.button>
              <motion.button
                type="button"
                whileHover={{ scale: 1.05, y: -1 }}
                whileTap={{ scale: 0.92 }}
                transition={APPLE_SPRING_BOUNCY}
                onClick={onConfirm}
                className="px-5 py-2 text-xs uppercase tracking-wider font-semibold rounded-full bg-black dark:bg-white text-white dark:text-black hover:opacity-90 transition-opacity shadow-sm"
              >
                {isSelective
                  ? `Delete ${photoCount} ${
                      photoCount === 1 ? "Photo" : "Photos"
                    }`
                  : "Yes, Clear Memory"}
              </motion.button>
            </div>
          </motion.div>
    </div>
  );
}
