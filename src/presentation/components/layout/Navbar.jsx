"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence, useScroll } from "framer-motion";
import { Sun, Moon, UploadCloud, Images, Sparkles, Cpu, Paintbrush, LogIn, LogOut, UserCheck } from "lucide-react";
import { useTheme } from "../../hooks/useTheme";
import {
  APPLE_SPRING_SNAPPY,
  APPLE_SPRING_FLUID,
  APPLE_SPRING_BOUNCY,
  appleModalBackdropVariants,
  appleModalCardVariants,
} from "../../motion/apple-motion";

export function Navbar({
  activeTab,
  onTabChange,
  photoCount,
  hasGeminiKey = false,
  onOpenAiSettings,
  onOpenMcp,
  user = null,
  onSignOut,
}) {
  const { theme, toggleTheme, mounted } = useTheme();
  const { scrollY } = useScroll();
  const [isScrolled, setIsScrolled] = useState(false);
  const [hoveredTab, setHoveredTab] = useState(null);
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  useEffect(() => {
    return scrollY.on("change", (latest) => {
      setIsScrolled(latest > 20);
    });
  }, [scrollY]);

  const isDark =
    mounted &&
    (theme === "dark" || document.documentElement.classList.contains("dark"));

  return (
    <>
    <div className="fixed top-5 inset-x-0 z-[70] flex justify-center pointer-events-none px-4">
      <motion.nav
        aria-label="Main Navigation"
        initial={{ y: -28, opacity: 0, scale: 0.92, filter: "blur(10px)" }}
        animate={{
          y: 0,
          opacity: 1,
          scale: isScrolled ? 0.965 : 1,
          filter: "blur(0px)",
        }}
        transition={APPLE_SPRING_FLUID}
        onMouseLeave={() => setHoveredTab(null)}
        className="gpu-120hz pointer-events-auto flex items-center gap-2 sm:gap-2.5 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full border border-black/10 dark:border-white/15 bg-white/85 dark:bg-[#111111]/85 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.08)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.45)]"
      >
        {/* Brand / Logo with Always-Online Pulsing Green Indicator */}
        <motion.button
          type="button"
          onClick={() => onTabChange("upload")}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.94 }}
          transition={APPLE_SPRING_SNAPPY}
          className="flex items-center gap-2 px-2.5 py-1 text-xs tracking-[0.2em] uppercase font-medium text-black dark:text-white select-none"
          title="System Online"
        >
          <span className="relative flex h-2 w-2 items-center justify-center">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.9)]" />
          </span>
          <span>Sortn Sec</span>
        </motion.button>

        <div className="h-4 w-[1px] bg-black/10 dark:bg-white/15" />

        {/* Upload Tab */}
        <motion.button
          type="button"
          onClick={() => onTabChange("upload")}
          onMouseEnter={() => setHoveredTab("upload")}
          whileHover={{ scale: 1.04, y: -0.5 }}
          whileTap={{ scale: 0.93 }}
          transition={APPLE_SPRING_SNAPPY}
          className={`relative px-3 py-1 text-xs tracking-wider uppercase font-medium rounded-full transition-colors flex items-center gap-1.5 select-none ${
            activeTab === "upload"
              ? "text-black dark:text-white"
              : "text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white"
          }`}
        >
          {hoveredTab === "upload" && activeTab !== "upload" && (
            <motion.span
              layoutId="nav-hover-pill"
              className="absolute inset-0 rounded-full bg-black/[0.05] dark:bg-white/[0.07]"
              transition={APPLE_SPRING_SNAPPY}
            />
          )}
          {activeTab === "upload" && (
            <motion.span
              layoutId="nav-active-pill"
              className="absolute inset-0 rounded-full bg-black/[0.08] dark:bg-white/[0.14] border border-black/15 dark:border-white/20 shadow-sm"
              transition={APPLE_SPRING_SNAPPY}
            />
          )}
          <span className="relative z-10 flex items-center gap-1.5">
            <UploadCloud className="w-3.5 h-3.5" />
            <span>Upload</span>
          </span>
        </motion.button>

        {/* Gallery Tab with Animated Rolling Count Badge */}
        <motion.button
          type="button"
          onClick={() => onTabChange("gallery")}
          onMouseEnter={() => setHoveredTab("gallery")}
          whileHover={{ scale: 1.04, y: -0.5 }}
          whileTap={{ scale: 0.93 }}
          transition={APPLE_SPRING_SNAPPY}
          className={`relative px-3 py-1 text-xs tracking-wider uppercase font-medium rounded-full transition-colors flex items-center gap-1.5 select-none ${
            activeTab === "gallery"
              ? "text-black dark:text-white"
              : "text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white"
          }`}
        >
          {hoveredTab === "gallery" && activeTab !== "gallery" && (
            <motion.span
              layoutId="nav-hover-pill"
              className="absolute inset-0 rounded-full bg-black/[0.05] dark:bg-white/[0.07]"
              transition={APPLE_SPRING_SNAPPY}
            />
          )}
          {activeTab === "gallery" && (
            <motion.span
              layoutId="nav-active-pill"
              className="absolute inset-0 rounded-full bg-black/[0.08] dark:bg-white/[0.14] border border-black/15 dark:border-white/20 shadow-sm"
              transition={APPLE_SPRING_SNAPPY}
            />
          )}
          <span className="relative z-10 flex items-center gap-1.5">
            <Images className="w-3.5 h-3.5" />
            <span>Gallery</span>
            <AnimatePresence mode="popLayout">
              {photoCount > 0 && (
                <motion.span
                  key={photoCount}
                  initial={{ opacity: 0, y: 6, scale: 0.75 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.75 }}
                  transition={APPLE_SPRING_BOUNCY}
                  className="ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-black/10 dark:bg-white/15 text-black dark:text-white"
                >
                  {photoCount}
                </motion.span>
              )}
            </AnimatePresence>
          </span>
        </motion.button>

        {/* Claude MCP Image Studio */}
        {onOpenMcp && (
          <motion.button
            type="button"
            onClick={onOpenMcp}
            onMouseEnter={() => setHoveredTab("mcp")}
            whileHover={{ scale: 1.04, y: -0.5 }}
            whileTap={{ scale: 0.93 }}
            transition={APPLE_SPRING_SNAPPY}
            title="Create 4K images, Moods & Collages"
            className={`relative flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-mono rounded-full border transition-colors select-none ${
              activeTab === "mcp"
                ? "text-black dark:text-white border-transparent"
                : "border-black/10 dark:border-white/10 bg-black/[0.03] dark:bg-white/[0.04] text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white"
            }`}
          >
            {hoveredTab === "mcp" && activeTab !== "mcp" && (
              <motion.span
                layoutId="nav-hover-pill"
                className="absolute inset-0 rounded-full bg-black/[0.05] dark:bg-white/[0.07]"
                transition={APPLE_SPRING_SNAPPY}
              />
            )}
            {activeTab === "mcp" && (
              <motion.span
                layoutId="nav-active-pill"
                className="absolute inset-0 rounded-full bg-black/[0.08] dark:bg-white/[0.14] border border-black/15 dark:border-white/20 shadow-sm"
                transition={APPLE_SPRING_SNAPPY}
              />
            )}
            <span className="relative z-10 flex items-center gap-1.5">
              <Paintbrush className="w-3 h-3" />
              <span className="hidden sm:inline">Create</span>
            </span>
          </motion.button>
        )}

        {/* AI Engine Selector Pill */}
        {onOpenAiSettings && (
          <>
            <div className="h-4 w-[1px] bg-black/10 dark:bg-white/15" />
            <motion.button
              type="button"
              onClick={onOpenAiSettings}
              onMouseEnter={() => setHoveredTab("ai")}
              whileHover={{ scale: 1.04, y: -0.5 }}
              whileTap={{ scale: 0.93 }}
              transition={APPLE_SPRING_SNAPPY}
              title="Configure AI Vision Engine (Gemini / CLIP)"
              className={`relative flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-mono rounded-full border transition-colors select-none ${
                activeTab === "ai"
                  ? "text-black dark:text-white border-transparent"
                  : hasGeminiKey
                  ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                  : "border-black/10 dark:border-white/10 bg-black/[0.03] dark:bg-white/[0.04] text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white"
              }`}
            >
              {activeTab === "ai" && (
                <motion.span
                  layoutId="nav-active-pill"
                  className="absolute inset-0 rounded-full bg-black/[0.08] dark:bg-white/[0.14] border border-black/15 dark:border-white/20 shadow-sm"
                  transition={APPLE_SPRING_SNAPPY}
                />
              )}
              <span className="relative z-10 flex items-center gap-1.5">
              {hasGeminiKey ? (
                <>
                  <Sparkles className="w-3 h-3 text-emerald-500" />
                  <span className="hidden sm:inline">Gemini AI</span>
                </>
              ) : (
                <>
                  <Cpu className="w-3 h-3 text-neutral-500" />
                  <span className="hidden sm:inline">CLIP AI</span>
                </>
              )}
              </span>
            </motion.button>
          </>
        )}

        <div className="h-4 w-[1px] bg-black/10 dark:bg-white/15" />

        {/* Auth Status Pill: Guest Sign In Link OR Signed-In Account + Sign Out */}
        {activeTab !== "login" && activeTab !== "signup" && (
          <>
            {user ? (
              <div className="flex items-center gap-1.5">
                <Link
                  href="/profile"
                  title="Edit Profile & Account Settings"
                  className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 max-w-[140px] transition-colors"
                >
                  <UserCheck className="w-3 h-3 shrink-0" />
                  <span className="truncate">
                    {user.user_metadata?.full_name || user.email?.split("@")[0]}
                  </span>
                </Link>
                {onSignOut && (
                  <motion.button
                    type="button"
                    onClick={() => setShowSignOutConfirm(true)}
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.93 }}
                    transition={APPLE_SPRING_SNAPPY}
                    title="Sign Out (Switch to Guest Mode)"
                    className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-mono rounded-full border border-black/10 dark:border-white/10 bg-black/[0.03] dark:bg-white/[0.04] text-black/65 dark:text-white/65 hover:text-black dark:hover:text-white transition-colors"
                  >
                    <LogOut className="w-3 h-3" />
                    <span className="hidden sm:inline">Sign Out</span>
                  </motion.button>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                title="Guest Mode (Not Saved) — Sign In to Enable Cloud Storage"
                className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-mono rounded-full border border-black/15 dark:border-white/15 bg-black/[0.04] dark:bg-white/[0.06] text-black dark:text-white hover:bg-black/10 dark:hover:bg-white/15 transition-colors select-none"
              >
                <LogIn className="w-3 h-3 text-emerald-500" />
                <span>Sign In</span>
              </Link>
            )}
            <div className="h-4 w-[1px] bg-black/10 dark:bg-white/15" />
          </>
        )}

        {/* Theme Toggle with 180-degree ProMotion Spin */}
        <motion.button
          type="button"
          onClick={toggleTheme}
          whileHover={{ scale: 1.12, rotate: 12 }}
          whileTap={{ scale: 0.86, rotate: -25 }}
          transition={APPLE_SPRING_BOUNCY}
          aria-label="Toggle theme"
          className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-black/70 dark:text-white/70 hover:text-black dark:hover:text-white transition-colors overflow-hidden"
        >
          <AnimatePresence mode="wait" initial={false}>
            {mounted ? (
              <motion.div
                key={isDark ? "dark-icon" : "light-icon"}
                initial={{ rotate: -90, scale: 0.5, opacity: 0 }}
                animate={{ rotate: 0, scale: 1, opacity: 1 }}
                exit={{ rotate: 90, scale: 0.5, opacity: 0 }}
                transition={APPLE_SPRING_SNAPPY}
              >
                {isDark ? (
                  <Sun className="w-3.5 h-3.5" />
                ) : (
                  <Moon className="w-3.5 h-3.5" />
                )}
              </motion.div>
            ) : (
              <div className="w-3.5 h-3.5" />
            )}
          </AnimatePresence>
        </motion.button>
      </motion.nav>
    </div>

    {/* Sign Out Confirmation Dialog */}
    {showSignOutConfirm && (
      <div className="fixed inset-0 z-50 flex items-center justify-center pt-20 sm:pt-24 pb-6 px-4 select-none">
        <motion.div
          variants={appleModalBackdropVariants}
          initial="initial"
          animate="animate"
          onClick={() => !isSigningOut && setShowSignOutConfirm(false)}
          className="fixed inset-0 bg-white/95 dark:bg-black/85 backdrop-blur-xl"
        />

        <motion.div
          variants={appleModalCardVariants}
          initial="initial"
          animate="animate"
          transition={APPLE_SPRING_FLUID}
          className="gpu-120hz relative z-10 w-full max-w-sm rounded-[28px] border border-black/10 dark:border-white/15 bg-white dark:bg-[#111111]/95 backdrop-blur-2xl shadow-[0_28px_90px_rgba(0,0,0,0.16),0_6px_24px_rgba(0,0,0,0.06)] dark:shadow-[0_32px_100px_rgba(0,0,0,0.88)] p-6 space-y-5 text-center text-black dark:text-white"
          role="dialog"
          aria-modal="true"
          aria-label="Confirm Sign Out"
        >
          <div className="w-11 h-11 mx-auto rounded-2xl bg-black/[0.05] dark:bg-white/[0.08] border border-black/10 dark:border-white/15 flex items-center justify-center">
            <LogOut className="w-5 h-5 text-black dark:text-white" />
          </div>

          <div className="space-y-1.5">
            <h3 className="text-lg font-medium tracking-tight text-black dark:text-white">
              Are you sure you want to log out?
            </h3>
            <p className="text-xs text-black/60 dark:text-white/60 leading-relaxed">
              You will switch to Guest Mode. Your saved cloud photos remain
              safe in your account, and new guest uploads will not be stored.
            </p>
          </div>

          <div className="flex items-center justify-center gap-2.5 pt-1">
            <motion.button
              type="button"
              whileTap={{ scale: 0.94 }}
              transition={APPLE_SPRING_SNAPPY}
              disabled={isSigningOut}
              onClick={() => setShowSignOutConfirm(false)}
              className="liquid-glass-action flex-1 py-2.5 rounded-full text-xs font-medium text-black dark:text-white disabled:opacity-50"
            >
              Cancel
            </motion.button>

            <motion.button
              type="button"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.94 }}
              transition={APPLE_SPRING_BOUNCY}
              disabled={isSigningOut}
              onClick={async () => {
                setIsSigningOut(true);
                try {
                  await onSignOut?.();
                } finally {
                  setIsSigningOut(false);
                  setShowSignOutConfirm(false);
                }
              }}
              className="flex-1 py-2.5 rounded-full text-xs font-semibold bg-black dark:bg-white text-white dark:text-black hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {isSigningOut ? "Logging Out..." : "Yes, Log Out"}
            </motion.button>
          </div>
        </motion.div>
      </div>
    )}
    </>
  );
}
