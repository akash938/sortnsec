"use client";
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Info, X, RotateCcw } from "lucide-react";
import {
  APPLE_SPRING_FLUID,
  APPLE_SPRING_BOUNCY,
  APPLE_SPRING_SNAPPY,
  APPLE_EASE_OUT_EXPO,
} from "../../motion/apple-motion";

export function ToastNotice({ notices, onDismiss }) {
  return (
    <div className="fixed bottom-6 right-6 z-[80] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4">
      <AnimatePresence mode="popLayout">
        {notices.map((notice) => (
          <motion.div
            layout
            key={notice.id}
            initial={{ opacity: 0, y: 24, scale: 0.88, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
            exit={{
              opacity: 0,
              y: 12,
              scale: 0.88,
              filter: "blur(8px)",
              transition: { duration: 0.2, ease: APPLE_EASE_OUT_EXPO },
            }}
            transition={APPLE_SPRING_FLUID}
            className="gpu-120hz relative overflow-hidden pointer-events-auto flex items-center justify-between gap-3 px-4 py-3 rounded-2xl border border-black/10 dark:border-white/15 bg-white/95 dark:bg-[#141414]/95 backdrop-blur-2xl shadow-[0_12px_36px_rgba(0,0,0,0.14)] dark:shadow-[0_12px_36px_rgba(0,0,0,0.6)] text-xs tracking-wide"
          >
            <div className="flex items-center gap-2.5 text-black dark:text-white min-w-0">
              <motion.div
                initial={{ scale: 0.6, rotate: -15 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={APPLE_SPRING_BOUNCY}
              >
                <Info className="w-4 h-4 shrink-0 text-black/60 dark:text-white/60" />
              </motion.div>
              <span className="truncate">{notice.message}</span>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              {notice.actionLabel && notice.onAction && (
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.06 }}
                  whileTap={{ scale: 0.92 }}
                  transition={APPLE_SPRING_SNAPPY}
                  onClick={() => {
                    notice.onAction();
                    onDismiss(notice.id);
                  }}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-mono uppercase tracking-wider font-medium bg-black dark:bg-white text-white dark:text-black hover:opacity-90 transition-opacity shadow-sm"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>{notice.actionLabel}</span>
                </motion.button>
              )}

              <motion.button
                type="button"
                whileHover={{ scale: 1.15, rotate: 90 }}
                whileTap={{ scale: 0.85 }}
                transition={APPLE_SPRING_BOUNCY}
                onClick={() => onDismiss(notice.id)}
                className="p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </motion.button>
            </div>

            {/* Subtle 120Hz auto-dismiss progress line */}
            <motion.div
              initial={{ scaleX: 1 }}
              animate={{ scaleX: 0 }}
              transition={{ duration: (notice.durationMs || 4500) / 1000, ease: "linear" }}
              style={{ transformOrigin: "left" }}
              className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-black/15 dark:bg-white/20"
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
