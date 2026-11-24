"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  User,
  Mail,
  AtSign,
  FileText,
  Lock,
  Check,
  AlertCircle,
  ArrowLeft,
  LogIn,
  ShieldCheck,
  Sparkles,
  Image as ImageIcon,
} from "lucide-react";
import {
  Navbar,
  useAuth,
  APPLE_SPRING_BOUNCY,
  APPLE_SPRING_FLUID,
  APPLE_SPRING_SNAPPY,
} from "../../src/presentation";

export default function ProfilePage() {
  const router = useRouter();
  const {
    user,
    isAuthLoading,
    signOut,
    updateProfile,
    updatePassword,
  } = useAuth();

  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [profileNotice, setProfileNotice] = useState("");
  const [profileError, setProfileError] = useState("");
  const [passwordNotice, setPasswordNotice] = useState("");
  const [passwordError, setPasswordError] = useState("");

  useEffect(() => {
    if (user) {
      setFullName(user.user_metadata?.full_name || "");
      setUsername(user.user_metadata?.username || "");
      setBio(user.user_metadata?.bio || "");
      setAvatarUrl(user.user_metadata?.avatar_url || "");
    }
  }, [user]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (isSavingProfile) return;
    setIsSavingProfile(true);
    setProfileError("");
    setProfileNotice("");

    const res = await updateProfile({ fullName, username, bio, avatarUrl });
    setIsSavingProfile(false);

    if (res?.error) {
      setProfileError(res.error);
      return;
    }

    setProfileNotice("Profile updated and saved to your Supabase account!");
    setTimeout(() => setProfileNotice(""), 3500);
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (isSavingPassword) return;
    if (newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters.");
      return;
    }

    setIsSavingPassword(true);
    setPasswordError("");
    setPasswordNotice("");

    const res = await updatePassword({ newPassword });
    setIsSavingPassword(false);

    if (res?.error) {
      setPasswordError(res.error);
      return;
    }

    setNewPassword("");
    setPasswordNotice("Password updated successfully!");
    setTimeout(() => setPasswordNotice(""), 3500);
  };

  const displayInitials = (
    fullName ||
    user?.email ||
    "S"
  )
    .trim()
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-primary)] text-[var(--fg-primary)]">
      <Navbar
        activeTab="profile"
        onTabChange={(tab) => {
          router.push(tab === "gallery" ? "/?tab=gallery" : "/");
        }}
        photoCount={0}
        user={user}
        onSignOut={async () => {
          await signOut();
          router.push("/");
        }}
      />

      <main className="flex-1 flex items-start justify-center pt-28 pb-16 px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.97, filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
          transition={APPLE_SPRING_FLUID}
          className="gpu-120hz relative w-full max-w-2xl rounded-[32px] border border-black/10 dark:border-white/15 bg-white dark:bg-[#111111]/95 backdrop-blur-2xl shadow-[0_28px_90px_rgba(0,0,0,0.16),0_6px_24px_rgba(0,0,0,0.06)] dark:shadow-[0_32px_100px_rgba(0,0,0,0.88)] p-7 sm:p-9 space-y-6"
        >
          <div className="pointer-events-none absolute inset-x-8 top-0 h-[1px] bg-gradient-to-r from-transparent via-black/10 dark:via-white/25 to-transparent" />

          {/* Top Bar */}
          <div className="flex items-center justify-between gap-3 border-b border-black/10 dark:border-white/10 pb-4">
            <Link
              href="/"
              className="liquid-glass-action inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium text-black dark:text-white"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Studio</span>
            </Link>

            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono uppercase tracking-widest bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>{user ? "Signed-In Account" : "Guest Session"}</span>
            </span>
          </div>

          {isAuthLoading ? (
            <div className="py-12 text-center text-xs font-mono uppercase tracking-wider text-black/50 dark:text-white/50">
              Loading profile...
            </div>
          ) : !user ? (
            /* Guest View — Prompt to Sign In or Continue Exploring */
            <div className="py-8 text-center space-y-5 max-w-md mx-auto">
              <div className="w-16 h-16 mx-auto rounded-full bg-black/[0.05] dark:bg-white/[0.08] border border-black/10 dark:border-white/15 flex items-center justify-center">
                <ShieldCheck className="w-7 h-7 text-black/60 dark:text-white/60" />
              </div>
              <div className="space-y-2">
                <h1 className="text-2xl font-light tracking-tight text-black dark:text-white">
                  You are browsing as a Guest
                </h1>
                <p className="text-xs sm:text-sm text-black/60 dark:text-white/60 leading-relaxed">
                  Guest sessions do not save images or profile settings. Sign in
                  or create a free account to customize your profile and save
                  photos to Supabase Cloud.
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <Link
                  href="/login"
                  className="liquid-glass-emerald inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-semibold text-white"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </Link>
                <Link
                  href="/signup"
                  className="liquid-glass-action inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-medium text-black dark:text-white"
                >
                  <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Create Account</span>
                </Link>
              </div>
            </div>
          ) : (
            /* Signed-In Profile Editor */
            <div className="space-y-6">
              {/* Avatar & Identity Preview */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full overflow-hidden border border-black/15 dark:border-white/20 bg-black dark:bg-white text-white dark:text-black flex items-center justify-center text-lg font-semibold shrink-0 shadow-md">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={fullName || "Profile Avatar"}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span>{displayInitials}</span>
                  )}
                </div>
                <div className="min-w-0">
                  <h1 className="text-xl sm:text-2xl font-light tracking-tight text-black dark:text-white truncate">
                    {fullName || user.email?.split("@")[0]}
                  </h1>
                  <p className="text-xs font-mono text-black/55 dark:text-white/55 truncate">
                    {user.email}
                  </p>
                </div>
              </div>

              {/* Profile Details Form */}
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label
                      htmlFor="profile-fullname"
                      className="block text-[10px] font-mono uppercase tracking-wider text-black/60 dark:text-white/60"
                    >
                      Full Name
                    </label>
                    <div className="relative flex items-center">
                      <User className="w-4 h-4 absolute left-3.5 text-black/40 dark:text-white/40 pointer-events-none" />
                      <input
                        id="profile-fullname"
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Your name"
                        className="liquid-glass-input w-full pl-10 pr-4 py-2.5 text-xs rounded-2xl text-black dark:text-white placeholder:text-black/40 dark:placeholder:text-white/40 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label
                      htmlFor="profile-username"
                      className="block text-[10px] font-mono uppercase tracking-wider text-black/60 dark:text-white/60"
                    >
                      Username Handle
                    </label>
                    <div className="relative flex items-center">
                      <AtSign className="w-4 h-4 absolute left-3.5 text-black/40 dark:text-white/40 pointer-events-none" />
                      <input
                        id="profile-username"
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="akash_studio"
                        className="liquid-glass-input w-full pl-10 pr-4 py-2.5 text-xs rounded-2xl text-black dark:text-white placeholder:text-black/40 dark:placeholder:text-white/40 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor="profile-email"
                    className="block text-[10px] font-mono uppercase tracking-wider text-black/60 dark:text-white/60"
                  >
                    Account Email
                  </label>
                  <div className="relative flex items-center">
                    <Mail className="w-4 h-4 absolute left-3.5 text-black/35 dark:text-white/35 pointer-events-none" />
                    <input
                      id="profile-email"
                      type="email"
                      value={user.email || ""}
                      disabled
                      className="liquid-glass-input w-full pl-10 pr-4 py-2.5 text-xs rounded-2xl text-black/55 dark:text-white/55 opacity-75 cursor-not-allowed"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor="profile-avatar"
                    className="block text-[10px] font-mono uppercase tracking-wider text-black/60 dark:text-white/60"
                  >
                    Avatar Image URL (Optional)
                  </label>
                  <div className="relative flex items-center">
                    <ImageIcon className="w-4 h-4 absolute left-3.5 text-black/40 dark:text-white/40 pointer-events-none" />
                    <input
                      id="profile-avatar"
                      type="url"
                      value={avatarUrl}
                      onChange={(e) => setAvatarUrl(e.target.value)}
                      placeholder="https://..."
                      className="liquid-glass-input w-full pl-10 pr-4 py-2.5 text-xs rounded-2xl text-black dark:text-white placeholder:text-black/40 dark:placeholder:text-white/40 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor="profile-bio"
                    className="block text-[10px] font-mono uppercase tracking-wider text-black/60 dark:text-white/60"
                  >
                    Bio / Creative Focus
                  </label>
                  <div className="relative">
                    <FileText className="w-4 h-4 absolute left-3.5 top-3 text-black/40 dark:text-white/40 pointer-events-none" />
                    <textarea
                      id="profile-bio"
                      rows={3}
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Automotive photography, architecture & 4K AI visual direction..."
                      className="liquid-glass-input w-full pl-10 pr-4 py-2.5 text-xs rounded-2xl text-black dark:text-white placeholder:text-black/40 dark:placeholder:text-white/40 focus:outline-none resize-none"
                    />
                  </div>
                </div>

                {profileError && (
                  <div className="flex items-center gap-2 p-3 rounded-2xl border border-rose-500/30 bg-rose-500/10 text-xs text-rose-600 dark:text-rose-400">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{profileError}</span>
                  </div>
                )}

                {profileNotice && (
                  <div className="flex items-center gap-2 p-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 text-xs text-emerald-700 dark:text-emerald-300">
                    <Check className="w-4 h-4 shrink-0" />
                    <span>{profileNotice}</span>
                  </div>
                )}

                <div className="flex justify-end">
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.03, y: -1 }}
                    whileTap={{ scale: 0.95 }}
                    transition={APPLE_SPRING_BOUNCY}
                    disabled={isSavingProfile}
                    className="liquid-glass-emerald px-6 py-2.5 rounded-full text-xs font-semibold text-white disabled:opacity-50"
                  >
                    {isSavingProfile ? "Saving..." : "Save Profile Changes"}
                  </motion.button>
                </div>
              </form>

              {/* Change Password Section */}
              <form
                onSubmit={handleUpdatePassword}
                className="pt-5 border-t border-black/10 dark:border-white/10 space-y-3"
              >
                <h2 className="text-xs font-mono uppercase tracking-wider text-black/65 dark:text-white/65">
                  Security • Update Password
                </h2>

                <div className="flex flex-col sm:flex-row gap-2.5">
                  <div className="relative flex-1 flex items-center">
                    <Lock className="w-4 h-4 absolute left-3.5 text-black/40 dark:text-white/40 pointer-events-none" />
                    <input
                      type="password"
                      minLength={6}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="New password (min. 6 characters)"
                      className="liquid-glass-input w-full pl-10 pr-4 py-2.5 text-xs rounded-2xl text-black dark:text-white placeholder:text-black/40 dark:placeholder:text-white/40 focus:outline-none"
                    />
                  </div>
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.95 }}
                    transition={APPLE_SPRING_SNAPPY}
                    disabled={isSavingPassword || !newPassword}
                    className="liquid-glass-action px-5 py-2.5 rounded-2xl text-xs font-medium text-black dark:text-white disabled:opacity-45"
                  >
                    {isSavingPassword ? "Updating..." : "Update Password"}
                  </motion.button>
                </div>

                {passwordError && (
                  <p className="text-xs text-rose-600 dark:text-rose-400">
                    {passwordError}
                  </p>
                )}
                {passwordNotice && (
                  <p className="text-xs text-emerald-600 dark:text-emerald-400">
                    {passwordNotice}
                  </p>
                )}
              </form>
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
}
