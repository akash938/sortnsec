"use client";
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";
export function ProgressBar({ total, processed, isProcessing, modelStage, modelProgress, }) {
    if (!isProcessing && !modelStage)
        return null;
    const percentage = total > 0 ? Math.min(100, Math.round((processed / total) * 100)) : 0;
    return (<AnimatePresence>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="w-full max-w-xl mx-auto my-6 p-4 rounded-2xl border border-black/10 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.02] backdrop-blur-sm">
        <div className="flex items-center justify-between text-xs tracking-wider uppercase font-medium mb-2.5 text-black/80 dark:text-white/80">
          <div className="flex items-center gap-2">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-black/50 dark:text-white/50"/>
            <span>
              {modelStage ? modelStage : `Analyzing ${processed} / ${total}`}
            </span>
          </div>
          <span className="font-mono text-black/60 dark:text-white/60">
            {modelProgress !== undefined && modelStage
            ? `${modelProgress}%`
            : `${percentage}%`}
          </span>
        </div>

        <div className="h-1.5 w-full bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
          <motion.div className="h-full bg-black dark:bg-white rounded-full" initial={{ width: 0 }} animate={{
            width: modelProgress !== undefined && modelStage
                ? `${modelProgress}%`
                : `${percentage}%`,
        }} transition={{ type: "spring", stiffness: 100, damping: 20 }}/>
        </div>

        {modelStage && (<p className="mt-2 text-[11px] text-black/50 dark:text-white/50 tracking-wide text-center">
            Zero-shot CLIP model runs client-side in a Web Worker. Cached after download.
          </p>)}
      </motion.div>
    </AnimatePresence>);
}
