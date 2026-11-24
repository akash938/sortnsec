"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Mail,
  Lock,
  ArrowRight,
  Sparkles,
  AlertCircle,
  ShieldCheck,
  Eye,
  EyeOff,
  KeyRound,
  X,
} from "lucide-react";
import {
  Navbar,
  useAuth,
  APPLE_SPRING_BOUNCY,
  APPLE_SPRING_FLUID,
  APPLE_SPRING_SNAPPY,
  appleModalBackdropVariants,
  appleModalCardVariants,
} from "../../src/presentation";

export default function LoginPage() {
  const router = useRouter();
  const { user, isAuthLoading, signIn } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isForgotOpen, setIsForgotOpen] = useState(false);
  const [forgotMethod, setForgotMethod] = useState("reset-link");
  const [forgotEmail, setForgotEmail] = useState("");

  useEffect(() => {
    if (!isAuthLoading && user) {
      router.replace("/");
    }
  }, [user, isAuthLoading, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password || isSubmitting) return;
    setIsSubmitting(true);
    setErrorMsg("");

    const res = await signIn({ email, password });
    setIsSubmitting(false);

    if (res?.error) {
      setErrorMsg(res.error);
      return;
    }

    router.push("/");
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-primary)] text-[var(--fg-primary)]">
      <Navbar
        activeTab="login"
        onTabChange={(tab) => {
          router.push(tab === "gallery" ? "/?tab=gallery" : "/");
        }}
        photoCount={0}
      />

      <main className="flex-1 flex items-center justify-center pt-28 pb-12 px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.97, filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
          transition={APPLE_SPRING_FLUID}
          className="gpu-120hz relative w-full max-w-md rounded-[32px] border border-black/10 dark:border-white/15 bg-white dark:bg-[#111111]/95 backdrop-blur-2xl shadow-[0_28px_90px_rgba(0,0,0,0.16),0_6px_24px_rgba(0,0,0,0.06)] dark:shadow-[0_32px_100px_rgba(0,0,0,0.88)] p-7 sm:p-9 space-y-6"
        >
          <div className="pointer-events-none absolute inset-x-8 top-0 h-[1px] bg-gradient-to-r from-transparent via-black/10 dark:via-white/25 to-transparent" />

          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono uppercase tracking-widest bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Supabase Cloud Storage</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-light tracking-tight text-black dark:text-white">
              Sign in to Sortn Sec
            </h1>
            <p className="text-xs text-black/60 dark:text-white/60 leading-relaxed">
              Sign in to save your uploaded photos and 4K AI creations to
              Supabase Cloud. Or explore freely as a guest without saving.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label
                htmlFor="login-email"
                className="block text-[10px] font-mono uppercase tracking-wider text-black/60 dark:text-white/60"
              >
                Email Address
              </label>
              <div className="relative flex items-center">
                <Mail className="w-4 h-4 absolute left-3.5 text-black/40 dark:text-white/40 pointer-events-none" />
                <input
                  id="login-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="liquid-glass-input w-full pl-10 pr-4 py-2.5 text-xs rounded-2xl text-black dark:text-white placeholder:text-black/40 dark:placeholder:text-white/40 focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="login-password"
                  className="block text-[10px] font-mono uppercase tracking-wider text-black/60 dark:text-white/60"
                >
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setForgotEmail(email);
                    setIsForgotOpen(true);
                  }}
                  className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 hover:underline"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative flex items-center">
                <Lock className="w-4 h-4 absolute left-3.5 text-black/40 dark:text-white/40 pointer-events-none" />
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="liquid-glass-input w-full pl-10 pr-10 py-2.5 text-xs rounded-2xl text-black dark:text-white placeholder:text-black/40 dark:placeholder:text-white/40 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 text-black/45 dark:text-white/45 hover:text-black dark:hover:text-white"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {errorMsg && (
              <div className="flex items-start gap-2 p-3 rounded-2xl border border-rose-500/30 bg-rose-500/10 text-xs text-rose-600 dark:text-rose-400">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            <motion.button
              type="submit"
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.96 }}
              transition={APPLE_SPRING_BOUNCY}
              disabled={isSubmitting}
              className="liquid-glass-emerald w-full flex items-center justify-center gap-2 py-2.5 rounded-full text-xs font-semibold text-white disabled:opacity-50"
            >
              <span>{isSubmitting ? "Signing In..." : "Sign In & Enable Storage"}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </motion.button>
          </form>

          <div className="space-y-3 pt-2 border-t border-black/10 dark:border-white/10">
            <div className="flex items-center justify-between text-xs">
              <span className="text-black/60 dark:text-white/60">
                New to Sortn Sec?
              </span>
              <Link
                href="/signup"
                className="font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3" />
                <span>Create Free Account</span>
              </Link>
            </div>

            <motion.div whileTap={{ scale: 0.97 }} transition={APPLE_SPRING_SNAPPY}>
              <Link
                href="/"
                className="liquid-glass-action w-full flex items-center justify-center gap-2 py-2.5 rounded-full text-xs font-medium text-black/80 dark:text-white/80"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-black/55 dark:text-white/55" />
                <span>Continue Exploring as Guest (No Storage)</span>
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </main>

      {/* Forgot Password Dialog Box (UI + Recovery Options Only) */}
      {isForgotOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center pt-20 sm:pt-24 pb-6 px-4 select-none">
          <motion.div
            variants={appleModalBackdropVariants}
            initial="initial"
            animate="animate"
            onClick={() => setIsForgotOpen(false)}
            className="fixed inset-0 bg-white/95 dark:bg-black/85 backdrop-blur-xl"
          />

          <motion.div
            variants={appleModalCardVariants}
            initial="initial"
            animate="animate"
            transition={APPLE_SPRING_FLUID}
            className="gpu-120hz relative z-10 w-full max-w-md rounded-[30px] border border-black/10 dark:border-white/15 bg-white dark:bg-[#111111]/95 backdrop-blur-2xl shadow-[0_28px_90px_rgba(0,0,0,0.16),0_6px_24px_rgba(0,0,0,0.06)] dark:shadow-[0_32px_100px_rgba(0,0,0,0.88)] p-7 space-y-5 text-black dark:text-white"
            role="dialog"
            aria-modal="true"
            aria-label="Forgot Password Options"
          >
            <div className="pointer-events-none absolute inset-x-8 top-0 h-[1px] bg-gradient-to-r from-transparent via-black/10 dark:via-white/25 to-transparent" />

            <motion.button
              type="button"
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.88 }}
              transition={APPLE_SPRING_BOUNCY}
              onClick={() => setIsForgotOpen(false)}
              aria-label="Close forgot password dialog"
              className="absolute top-5 right-5 p-2 rounded-full bg-black/[0.05] dark:bg-white/[0.08] hover:bg-black/10 dark:hover:bg-white/15 text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </motion.button>

            <div className="text-center space-y-2 pt-1">
              <div className="w-11 h-11 mx-auto rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
                <KeyRound className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h2 className="text-xl font-medium tracking-tight text-black dark:text-white">
                Reset your password
              </h2>
              <p className="text-xs text-black/60 dark:text-white/60 leading-relaxed">
                Choose how you would like to recover access to your Sortn Sec
                account.
              </p>
            </div>

            {/* Recovery Option Dialog Boxes */}
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setForgotMethod("reset-link")}
                className={`text-left p-3.5 rounded-2xl border transition-all ${
                  forgotMethod === "reset-link"
                    ? "border-black dark:border-white bg-black/[0.04] dark:bg-white/[0.08] shadow-sm"
                    : "border-black/10 dark:border-white/15 bg-black/[0.015] dark:bg-white/[0.02]"
                }`}
              >
                <div className="text-xs font-semibold text-black dark:text-white">
                  Reset Link
                </div>
                <div className="text-[10px] text-black/55 dark:text-white/55 mt-0.5">
                  Send password reset link to email
                </div>
              </button>

              <button
                type="button"
                onClick={() => setForgotMethod("magic-code")}
                className={`text-left p-3.5 rounded-2xl border transition-all ${
                  forgotMethod === "magic-code"
                    ? "border-black dark:border-white bg-black/[0.04] dark:bg-white/[0.08] shadow-sm"
                    : "border-black/10 dark:border-white/15 bg-black/[0.015] dark:bg-white/[0.02]"
                }`}
              >
                <div className="text-xs font-semibold text-black dark:text-white">
                  One-Time Code
                </div>
                <div className="text-[10px] text-black/55 dark:text-white/55 mt-0.5">
                  Sign in via 6-digit email OTP
                </div>
              </button>
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="forgot-email-input"
                className="block text-[10px] font-mono uppercase tracking-wider text-black/60 dark:text-white/60"
              >
                Account Email Address
              </label>
              <div className="relative flex items-center">
                <Mail className="w-4 h-4 absolute left-3.5 text-black/40 dark:text-white/40 pointer-events-none" />
                <input
                  id="forgot-email-input"
                  type="email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="liquid-glass-input w-full pl-10 pr-4 py-2.5 text-xs rounded-2xl text-black dark:text-white placeholder:text-black/40 dark:placeholder:text-white/40 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center gap-2.5 pt-1">
              <motion.button
                type="button"
                whileTap={{ scale: 0.95 }}
                transition={APPLE_SPRING_SNAPPY}
                onClick={() => setIsForgotOpen(false)}
                className="liquid-glass-action flex-1 py-2.5 rounded-full text-xs font-medium text-black dark:text-white"
              >
                Cancel
              </motion.button>
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.95 }}
                transition={APPLE_SPRING_BOUNCY}
                onClick={() => setIsForgotOpen(false)}
                className="liquid-glass-emerald flex-1 py-2.5 rounded-full text-xs font-semibold text-white"
              >
                {forgotMethod === "reset-link"
                  ? "Send Reset Link"
                  : "Send One-Time Code"}
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
