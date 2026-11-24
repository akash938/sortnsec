"use client";
import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ShieldAlert, LogIn, Sparkles, ArrowRight, X } from "lucide-react";
import {
  APPLE_SPRING_SNAPPY,
  APPLE_SPRING_FLUID,
  APPLE_SPRING_BOUNCY,
  appleModalBackdropVariants,
  appleModalCardVariants,
} from "../../motion/apple-motion";

export function GuestStorageModal({
  isOpen,
  actionLabel = "upload or generate images",
  onContinueAsGuest,
  onCancel,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center pt-20 sm:pt-24 pb-6 px-4 select-none">
      {/* Clean White Backdrop in Light Mode / Deep Black in Dark Mode */}
      <motion.div
        variants={appleModalBackdropVariants}
        initial="initial"
        animate="animate"
        onClick={onCancel}
        className="fixed inset-0 bg-white/95 dark:bg-black/85 backdrop-blur-xl"
      />

      {/* Apple Liquid Glass Guest Storage Warning Dialog */}
      <motion.div
        variants={appleModalCardVariants}
        initial="initial"
        animate="animate"
        transition={APPLE_SPRING_FLUID}
        className="gpu-120hz relative z-10 w-full max-w-md rounded-[30px] border border-black/10 dark:border-white/15 bg-white dark:bg-[#111111]/95 backdrop-blur-2xl shadow-[0_28px_90px_rgba(0,0,0,0.16),0_6px_24px_rgba(0,0,0,0.06)] dark:shadow-[0_32px_100px_rgba(0,0,0,0.88)] p-7 space-y-5 text-center text-black dark:text-white"
        role="dialog"
        aria-modal="true"
        aria-label="Guest Storage Notice"
      >
        <div className="pointer-events-none absolute inset-x-8 top-0 h-[1px] bg-gradient-to-r from-transparent via-black/10 dark:via-white/25 to-transparent" />

        <motion.button
          type="button"
          whileHover={{ scale: 1.1, rotate: 90 }}
          whileTap={{ scale: 0.88 }}
          transition={APPLE_SPRING_BOUNCY}
          onClick={onCancel}
          aria-label="Close notice"
          className="absolute top-5 right-5 p-2 rounded-full bg-black/[0.05] dark:bg-white/[0.08] hover:bg-black/10 dark:hover:bg-white/15 text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </motion.button>

        <div className="w-12 h-12 mx-auto rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center">
          <ShieldAlert className="w-6 h-6 text-amber-600 dark:text-amber-400" />
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-widest bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/25">
            <span>Guest Mode • Temporary Memory</span>
          </div>

          <h3 className="text-xl font-medium tracking-tight text-black dark:text-white">
            Your images will not be stored after you exit the browser
          </h3>

          <p className="text-xs sm:text-sm text-black/60 dark:text-white/60 leading-relaxed">
            You are about to {actionLabel} without signing in. Anything you add
            or generate in Guest Mode stays only in temporary memory and will be
            lost once you close or refresh your browser.{" "}
            <strong className="text-black dark:text-white font-medium">
              Sign in to enable cloud storage.
            </strong>
          </p>
        </div>

        <div className="space-y-2.5 pt-1">
          <Link
            href="/login"
            className="liquid-glass-emerald w-full flex items-center justify-center gap-2 py-2.5 rounded-full text-xs font-semibold text-white"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign In for Storage</span>
          </Link>

          <motion.button
            type="button"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.96 }}
            transition={APPLE_SPRING_SNAPPY}
            onClick={onContinueAsGuest}
            className="liquid-glass-action w-full flex items-center justify-center gap-2 py-2.5 rounded-full text-xs font-medium text-black dark:text-white"
          >
            <span>Continue as Guest (Don&apos;t Store)</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </motion.button>
        </div>

        <div className="pt-2 border-t border-black/10 dark:border-white/10 flex items-center justify-center gap-1.5 text-xs text-black/55 dark:text-white/55">
          <span>Don&apos;t have an account?</span>
          <Link
            href="/signup"
            className="inline-flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
          >
            <Sparkles className="w-3 h-3" />
            <span>Sign Up Free</span>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
