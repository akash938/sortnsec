"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Mail,
  Lock,
  User,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  Eye,
  EyeOff,
} from "lucide-react";
import {
  Navbar,
  useAuth,
  APPLE_SPRING_BOUNCY,
  APPLE_SPRING_FLUID,
  APPLE_SPRING_SNAPPY,
} from "../../src/presentation";

export default function SignupPage() {
  const router = useRouter();
  const { user, isAuthLoading, signUp } = useAuth();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    if (!isAuthLoading && user) {
      router.replace("/");
    }
  }, [user, isAuthLoading, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password || isSubmitting) return;
    if (password.length < 6) {
      setErrorMsg("Password must be at least 6 characters.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg("");
    setSuccessMsg("");

    const res = await signUp({ email, password, fullName });
    setIsSubmitting(false);

    if (res?.error) {
      setErrorMsg(res.error);
      return;
    }

    if (res?.needsEmailConfirmation) {
      setSuccessMsg(
        "Account created! Please check your email inbox to confirm your address, then sign in."
      );
      return;
    }

    router.push("/");
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-primary)] text-[var(--fg-primary)]">
      <Navbar
        activeTab="signup"
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
              <span>Unlock Cloud Photo Storage</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-light tracking-tight text-black dark:text-white">
              Create your account
            </h1>
            <p className="text-xs text-black/60 dark:text-white/60 leading-relaxed">
              Signed-in members get private Supabase Cloud storage for uploaded
              and 4K AI-generated images.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label
                htmlFor="signup-name"
                className="block text-[10px] font-mono uppercase tracking-wider text-black/60 dark:text-white/60"
              >
                Full Name
              </label>
              <div className="relative flex items-center">
                <User className="w-4 h-4 absolute left-3.5 text-black/40 dark:text-white/40 pointer-events-none" />
                <input
                  id="signup-name"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Akash"
                  className="liquid-glass-input w-full pl-10 pr-4 py-2.5 text-xs rounded-2xl text-black dark:text-white placeholder:text-black/40 dark:placeholder:text-white/40 focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="signup-email"
                className="block text-[10px] font-mono uppercase tracking-wider text-black/60 dark:text-white/60"
              >
                Email Address
              </label>
              <div className="relative flex items-center">
                <Mail className="w-4 h-4 absolute left-3.5 text-black/40 dark:text-white/40 pointer-events-none" />
                <input
                  id="signup-email"
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
              <label
                htmlFor="signup-password"
                className="block text-[10px] font-mono uppercase tracking-wider text-black/60 dark:text-white/60"
              >
                Password (min. 6 characters)
              </label>
              <div className="relative flex items-center">
                <Lock className="w-4 h-4 absolute left-3.5 text-black/40 dark:text-white/40 pointer-events-none" />
                <input
                  id="signup-password"
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a strong password"
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

            {successMsg && (
              <div className="flex items-start gap-2 p-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 text-xs text-emerald-700 dark:text-emerald-300">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{successMsg}</span>
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
              <span>{isSubmitting ? "Creating Account..." : "Sign Up & Enable Storage"}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </motion.button>
          </form>

          <div className="space-y-3 pt-2 border-t border-black/10 dark:border-white/10">
            <div className="flex items-center justify-between text-xs">
              <span className="text-black/60 dark:text-white/60">
                Already have an account?
              </span>
              <Link
                href="/login"
                className="font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
              >
                Sign In →
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
    </div>
  );
}
