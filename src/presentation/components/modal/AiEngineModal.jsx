"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Sparkles,
  Key,
  Check,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  Cpu,
} from "lucide-react";
import {
  APPLE_SPRING_SNAPPY,
  APPLE_SPRING_BOUNCY,
  appleModalBackdropVariants,
  appleModalCardVariants,
} from "../../motion/apple-motion";

export function AiEngineModal({ isOpen, onClose, apiKey, onSaveKey }) {
  const [inputKey, setInputKey] = useState(apiKey || "");
  const [selectedMode, setSelectedMode] = useState(
    apiKey?.trim() ? "gemini" : "local"
  );
  const [testStatus, setTestStatus] = useState("idle");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    setInputKey(apiKey || "");
    setSelectedMode(apiKey?.trim() ? "gemini" : "local");
  }, [apiKey, isOpen]);

  const handleTestKey = async () => {
    if (!inputKey.trim()) {
      setTestStatus("error");
      setErrorMessage("Please paste your Google Gemini key first.");
      return;
    }
    setTestStatus("testing");
    setErrorMessage("");
    try {
      const testImage =
        "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=";
      const resp = await fetch("/api/classify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          images: [{ id: "test", imageDataUrl: testImage }],
          apiKey: inputKey.trim(),
        }),
      });
      const data = await resp.json();
      if (resp.ok && data.success) {
        setTestStatus("success");
        onSaveKey(inputKey.trim());
      } else {
        setTestStatus("error");
        setErrorMessage(data.error || "Could not verify this key.");
      }
    } catch (err) {
      setTestStatus("error");
      setErrorMessage(err.message || "Network error connecting to Google AI.");
    }
  };

  const handleSave = () => {
    if (selectedMode === "local") {
      onSaveKey("");
    } else {
      onSaveKey(inputKey.trim());
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pt-20 pb-6 px-4 sm:px-6 select-none overflow-y-auto">
      {/* Clean White Backdrop in Light Mode / Deep Black in Dark Mode */}
      <motion.div
        variants={appleModalBackdropVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        onClick={onClose}
        className="fixed inset-0 bg-white/95 dark:bg-black/85 backdrop-blur-xl"
      />

      {/* Apple-Standard Balanced Dialog Card with Elevated Depth Shadow */}
      <motion.div
        variants={appleModalCardVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="gpu-120hz relative z-10 w-full max-w-2xl rounded-[32px] border border-black/10 dark:border-white/15 bg-white dark:bg-[#111111]/95 backdrop-blur-2xl shadow-[0_28px_90px_rgba(0,0,0,0.16),0_6px_24px_rgba(0,0,0,0.06)] dark:shadow-[0_32px_100px_rgba(0,0,0,0.88)] p-7 sm:p-9 space-y-6 text-black dark:text-white"
        role="dialog"
        aria-modal="true"
        aria-label="Choose Photo Sorting Mode"
      >
        <div className="pointer-events-none absolute inset-x-8 top-0 h-[1px] bg-gradient-to-r from-transparent via-black/10 dark:via-white/25 to-transparent" />

        {/* Close Button in Top-Right */}
        <motion.button
          type="button"
          whileHover={{ scale: 1.1, rotate: 90 }}
          whileTap={{ scale: 0.88 }}
          transition={APPLE_SPRING_BOUNCY}
          onClick={onClose}
          aria-label="Close modal"
          className="absolute top-6 right-6 p-2 rounded-full bg-black/[0.05] dark:bg-white/[0.08] hover:bg-black/10 dark:hover:bg-white/15 text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </motion.button>

        {/* Centered Minimalist Header */}
        <div className="text-center space-y-2 max-w-md mx-auto pt-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono uppercase tracking-widest bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Smart Photo Sorter</span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-light tracking-tight text-black dark:text-white">
            How should we sort your photos?
          </h3>
          <p className="text-xs sm:text-sm text-black/60 dark:text-white/60 leading-relaxed">
            Choose between instant private sorting on your device or ultra-smart
            Google AI sorting.
          </p>
        </div>

        {/* 2 Simple Side-by-Side Cards for Non-Technical Users */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Option 1: Built-in Instant AI (No setup needed) */}
          <motion.button
            type="button"
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            transition={APPLE_SPRING_SNAPPY}
            onClick={() => setSelectedMode("local")}
            className={`text-left p-5 rounded-3xl border transition-all flex flex-col justify-between gap-4 ${
              selectedMode === "local"
                ? "border-black dark:border-white bg-black/[0.04] dark:bg-white/[0.08] shadow-md"
                : "border-black/10 dark:border-white/15 bg-black/[0.015] dark:bg-white/[0.02] hover:border-black/25 dark:hover:border-white/25"
            }`}
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-2xl bg-black/[0.06] dark:bg-white/10 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 text-black dark:text-white" />
                </div>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider ${
                    selectedMode === "local"
                      ? "bg-emerald-500 text-white font-semibold"
                      : "bg-black/[0.06] dark:bg-white/10 text-black/60 dark:text-white/60"
                  }`}
                >
                  {selectedMode === "local" ? "Active" : "Free & Ready"}
                </span>
              </div>

              <div>
                <h4 className="text-base font-medium text-black dark:text-white">
                  On-Device Smart Sort
                </h4>
                <p className="text-xs text-black/60 dark:text-white/60 mt-1 leading-relaxed">
                  Works immediately with zero setup. Your photos never leave
                  your computer.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-[11px] font-mono text-black/55 dark:text-white/55 pt-2 border-t border-black/5 dark:border-white/10">
              <Cpu className="w-3.5 h-3.5" />
              <span>100% Private • No Key Needed</span>
            </div>
          </motion.button>

          {/* Option 2: Google Gemini Pro AI */}
          <motion.button
            type="button"
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            transition={APPLE_SPRING_SNAPPY}
            onClick={() => setSelectedMode("gemini")}
            className={`text-left p-5 rounded-3xl border transition-all flex flex-col justify-between gap-4 ${
              selectedMode === "gemini"
                ? "border-black dark:border-white bg-black/[0.04] dark:bg-white/[0.08] shadow-md"
                : "border-black/10 dark:border-white/15 bg-black/[0.015] dark:bg-white/[0.02] hover:border-black/25 dark:hover:border-white/25"
            }`}
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-2xl bg-black/[0.06] dark:bg-white/10 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-black dark:text-white" />
                </div>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider ${
                    selectedMode === "gemini"
                      ? "bg-emerald-500 text-white font-semibold"
                      : "bg-black/[0.06] dark:bg-white/10 text-black/60 dark:text-white/60"
                  }`}
                >
                  {selectedMode === "gemini" ? "Selected" : "Pro Accuracy"}
                </span>
              </div>

              <div>
                <h4 className="text-base font-medium text-black dark:text-white">
                  Google Gemini Cloud AI
                </h4>
                <p className="text-xs text-black/60 dark:text-white/60 mt-1 leading-relaxed">
                  Deeply understands supercars, architecture, meals, and subtle
                  visual moods.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-[11px] font-mono text-black/55 dark:text-white/55 pt-2 border-t border-black/5 dark:border-white/10">
              <Key className="w-3.5 h-3.5" />
              <span>Uses Free Google AI Key</span>
            </div>
          </motion.button>
        </div>

        {/* Smooth Unfolding Key Box ONLY when Google Gemini Cloud AI is selected */}
        <AnimatePresence initial={false}>
          {selectedMode === "gemini" && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={APPLE_SPRING_SNAPPY}
              className="overflow-hidden"
            >
              <div className="p-4 rounded-2xl border border-black/10 dark:border-white/15 bg-black/[0.025] dark:bg-white/[0.04] space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-black dark:text-white">
                    Paste your Google Gemini Key
                  </label>
                  <a
                    href="https://aistudio.google.com/app/apikey"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium hover:underline"
                  >
                    <span>Get a free key in 1 click</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <div className="relative flex items-center">
                  <Key className="w-4 h-4 absolute left-3.5 text-black/40 dark:text-white/40 pointer-events-none" />
                  <input
                    type="password"
                    value={inputKey}
                    onChange={(e) => {
                      setInputKey(e.target.value);
                      setTestStatus("idle");
                    }}
                    placeholder="Paste key starting with AIzaSy..."
                    className="w-full pl-10 pr-24 py-2.5 text-xs font-mono rounded-xl border border-black/15 dark:border-white/15 bg-white dark:bg-[#161616] text-black dark:text-white placeholder:text-black/40 dark:placeholder:text-white/40 focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
                  />
                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.94 }}
                    transition={APPLE_SPRING_SNAPPY}
                    onClick={handleTestKey}
                    disabled={testStatus === "testing" || !inputKey.trim()}
                    className="absolute right-1.5 px-3.5 py-1.5 rounded-lg text-[11px] font-medium bg-black dark:bg-white text-white dark:text-black hover:opacity-85 disabled:opacity-40 transition-opacity"
                  >
                    {testStatus === "testing" ? "Checking..." : "Verify"}
                  </motion.button>
                </div>

                {testStatus === "success" && (
                  <p className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400">
                    <Check className="w-3.5 h-3.5" />
                    <span>Connected! Google Gemini AI is ready to sort your photos.</span>
                  </p>
                )}

                {testStatus === "error" && (
                  <p className="flex items-center gap-1.5 text-xs text-rose-500">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{errorMessage}</span>
                  </p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Clean Aligned Footer Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-black/10 dark:border-white/10">
          <span className="text-xs text-black/50 dark:text-white/50">
            {selectedMode === "local"
              ? "Active: Private On-Device Sorting"
              : inputKey.trim()
              ? "Active: Google Gemini Cloud AI"
              : "Paste a key above or choose On-Device Sort"}
          </span>

          <div className="flex items-center gap-2.5">
            <motion.button
              type="button"
              whileTap={{ scale: 0.94 }}
              transition={APPLE_SPRING_SNAPPY}
              onClick={onClose}
              className="px-4 py-2 rounded-full text-xs font-medium border border-black/15 dark:border-white/15 bg-black/[0.04] dark:bg-white/[0.08] text-black dark:text-white hover:bg-black/10 dark:hover:bg-white/15 transition-colors"
            >
              Cancel
            </motion.button>
            <motion.button
              type="button"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.94 }}
              transition={APPLE_SPRING_BOUNCY}
              onClick={handleSave}
              className="px-6 py-2 rounded-full text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-white shadow-[0_6px_20px_rgba(16,185,129,0.3)] transition-colors"
            >
              Done
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
