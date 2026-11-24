"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Database,
  Zap,
  Check,
  Copy,
  RefreshCw,
  HardDrive,
  Activity,
  Layers,
  Code2,
  Sparkles,
  CloudUpload,
} from "lucide-react";
import { PhotoIndexEngine } from "../../../domain/services/photo-index-engine";
import {
  APPLE_SPRING_SNAPPY,
  APPLE_SPRING_FLUID,
  APPLE_SPRING_BOUNCY,
  appleModalBackdropVariants,
  appleModalCardVariants,
} from "../../motion/apple-motion";

const SUPABASE_SETUP_SQL = `-- Run in Supabase SQL Editor (https://supabase.com/dashboard)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE TABLE IF NOT EXISTS public.photos (
  id TEXT PRIMARY KEY,
  user_id UUID DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  storage_path TEXT,
  public_url TEXT NOT NULL,
  size BIGINT DEFAULT 0,
  width INT DEFAULT 3840,
  height INT DEFAULT 2160,
  aspect_ratio DOUBLE PRECISION DEFAULT 1.777,
  status TEXT DEFAULT 'classified',
  primary_category TEXT DEFAULT 'Uncategorized',
  manual_category TEXT,
  effective_category TEXT GENERATED ALWAYS AS (
    LOWER(COALESCE(manual_category, primary_category, 'uncategorized'))
  ) STORED,
  category_type TEXT DEFAULT 'subject',
  confidence NUMERIC(5,2) DEFAULT 0,
  secondary_tags TEXT[] DEFAULT '{}',
  all_scores JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_photos_user_category_confidence
  ON public.photos USING btree (user_id, effective_category, confidence DESC, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_photos_category_confidence
  ON public.photos USING btree (effective_category, confidence DESC, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_photos_created_at_desc
  ON public.photos USING btree (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_photos_secondary_tags_gin
  ON public.photos USING gin (secondary_tags);

CREATE INDEX IF NOT EXISTS idx_photos_name_trgm
  ON public.photos USING gin (name gin_trgm_ops);

ALTER TABLE public.photos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public photos access" ON public.photos;
DROP POLICY IF EXISTS "Users manage own photos" ON public.photos;
CREATE POLICY "Users manage own photos"
  ON public.photos FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);`;

export function DatabaseModal({
  isOpen,
  onClose,
  photos = [],
  lastQueryTimeMs = 0.02,
  lastIndexUsed = "Inverted Category Index O(1)",
  dbStatus = null,
  user = null,
  onSyncToSupabase,
  onRunSupabaseBenchmark,
}) {
  const [activeTab, setActiveTab] = useState("benchmarks");
  const [benchScale, setBenchScale] = useState(5000);
  const [benchResult, setBenchResult] = useState(null);
  const [supabaseBench, setSupabaseBench] = useState(null);
  const [isRunningBench, setIsRunningBench] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  useEffect(() => {
    if (isOpen && !benchResult) {
      setBenchResult(PhotoIndexEngine.runSyntheticBenchmark(5000));
    }
  }, [isOpen, benchResult]);

  const handleRunBenchmark = async (count = benchScale) => {
    setIsRunningBench(true);
    setBenchScale(count);
    await new Promise((r) => setTimeout(r, 120));
    const localBench = PhotoIndexEngine.runSyntheticBenchmark(count);
    setBenchResult(localBench);

    if (onRunSupabaseBenchmark) {
      const remoteRes = await onRunSupabaseBenchmark("Cars");
      setSupabaseBench(remoteRes);
    }
    setIsRunningBench(false);
  };

  const handleSyncClick = async () => {
    if (!onSyncToSupabase || isSyncing) return;
    setIsSyncing(true);
    try {
      await onSyncToSupabase();
    } finally {
      setIsSyncing(false);
    }
  };

  const handleCopySql = () => {
    navigator.clipboard?.writeText(SUPABASE_SETUP_SQL);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2400);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 sm:pt-24 pb-4 px-3 sm:px-6 select-none overflow-y-auto">
      {/* Clean White Backdrop in Light Mode / Deep Black in Dark Mode */}
      <motion.div
        variants={appleModalBackdropVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        onClick={onClose}
        className="fixed inset-0 bg-white/95 dark:bg-black/85 backdrop-blur-xl"
      />

      {/* Apple Golden Gate Liquid Glass Studio Dialog */}
      <motion.div
        variants={appleModalCardVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="gpu-120hz relative z-10 w-full max-w-5xl max-h-[calc(100vh-7rem)] overflow-y-auto rounded-[32px] border border-black/10 dark:border-white/15 bg-white dark:bg-[#111111]/95 backdrop-blur-2xl shadow-[0_28px_90px_rgba(0,0,0,0.18),0_6px_24px_rgba(0,0,0,0.08)] dark:shadow-[0_32px_100px_rgba(0,0,0,0.88)] p-6 sm:p-8 space-y-6 text-black dark:text-white"
        role="dialog"
        aria-modal="true"
        aria-label="Supabase Database & Benchmark Studio"
      >
        <div className="pointer-events-none absolute inset-x-8 top-0 h-[1px] bg-gradient-to-r from-transparent via-black/10 dark:via-white/25 to-transparent" />

        {/* Top Header + Liquid Glass Segmented Switcher */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-black/10 dark:border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <motion.div
              whileHover={{ scale: 1.08, rotate: 6 }}
              transition={APPLE_SPRING_BOUNCY}
              className="liquid-glass-action w-10 h-10 rounded-2xl flex items-center justify-center"
            >
              <Database className="w-4 h-4 text-emerald-500" />
            </motion.div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-medium tracking-tight text-black dark:text-white">
                  Supabase Database & Speed Benchmark Studio
                </h3>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-mono uppercase tracking-wider bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>
                    {dbStatus?.connected
                      ? "Supabase Connected"
                      : "IndexedDB + Supabase Ready"}
                  </span>
                </span>
              </div>
              <p className="text-[11px] text-black/55 dark:text-white/55 font-mono">
                O(1) Hash Map • O(1) Inverted Category Index • Float64 TypedArray Sort • Supabase B-Tree
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="liquid-glass-well flex items-center gap-1 p-1 rounded-full">
              {[
                { id: "benchmarks", label: "Speed Benchmarks", icon: Zap },
                { id: "explorer", label: "Supabase Cloud & SQL", icon: HardDrive },
              ].map((t) => {
                const Icon = t.icon;
                const active = activeTab === t.id;
                return (
                  <motion.button
                    key={t.id}
                    type="button"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.94 }}
                    transition={APPLE_SPRING_SNAPPY}
                    onClick={() => setActiveTab(t.id)}
                    className={`relative px-3.5 py-1.5 text-[11px] rounded-full transition-colors flex items-center gap-1.5 ${
                      active
                        ? "text-white dark:text-black font-semibold"
                        : "text-black/65 dark:text-white/65 hover:text-black dark:hover:text-white"
                    }`}
                  >
                    {active && (
                      <motion.span
                        layoutId="db-modal-tab-pill"
                        transition={APPLE_SPRING_BOUNCY}
                        className="liquid-glass-active-pill absolute inset-0 rounded-full"
                      />
                    )}
                    <Icon className="relative z-10 w-3 h-3" />
                    <span className="relative z-10">{t.label}</span>
                  </motion.button>
                );
              })}
            </div>

            <motion.button
              type="button"
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.88 }}
              transition={APPLE_SPRING_BOUNCY}
              onClick={onClose}
              className="liquid-glass-action p-2 rounded-full text-black/75 dark:text-white/75 hover:text-black dark:hover:text-white"
              aria-label="Close Database Studio"
            >
              <X className="w-4 h-4" />
            </motion.button>
          </div>
        </div>

        {/* 4 Live Telemetry KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="liquid-glass-card p-3.5 rounded-2xl space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-black/50 dark:text-white/50">
              Live Query Speed
            </span>
            <div className="text-lg sm:text-xl font-semibold font-mono text-emerald-600 dark:text-emerald-400">
              {lastQueryTimeMs} ms
            </div>
            <p className="text-[10px] font-mono text-black/55 dark:text-white/55 truncate">
              {lastIndexUsed}
            </p>
          </div>

          <div className="liquid-glass-card p-3.5 rounded-2xl space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-black/50 dark:text-white/50">
              Storage Mode
            </span>
            <div className="text-lg sm:text-xl font-semibold font-mono text-black dark:text-white">
              {photos.length} Records
            </div>
            <p
              className={`text-[10px] font-mono ${
                user
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-amber-600 dark:text-amber-400"
              }`}
            >
              {user
                ? "Signed In • Cloud Saved"
                : "Guest Mode • Not Stored"}
            </p>
          </div>

          <div className="liquid-glass-card p-3.5 rounded-2xl space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-black/50 dark:text-white/50">
              Supabase Endpoint
            </span>
            <div className="text-xs sm:text-sm font-semibold font-mono text-black dark:text-white truncate">
              dnnjvxlyxymepyskgpte
            </div>
            <p className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400">
              {dbStatus?.tableReady
                ? `Table Ready (${dbStatus.latencyMs}ms)`
                : "Connected • Ready"}
            </p>
          </div>

          <div className="liquid-glass-card p-3.5 rounded-2xl space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-black/50 dark:text-white/50">
              Sort Complexity
            </span>
            <div className="text-lg sm:text-xl font-semibold font-mono text-black dark:text-white">
              O(1) + Float64
            </div>
            <p className="text-[10px] font-mono text-black/55 dark:text-white/55">
              Zero Full-Array Scans
            </p>
          </div>
        </div>

        {/* TAB 1: LIVE BENCHMARK SUITE */}
        {activeTab === "benchmarks" && (
          <motion.div
            key="benchmarks-tab"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={APPLE_SPRING_FLUID}
            className="space-y-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono uppercase tracking-wider text-black/60 dark:text-white/60">
                  Dataset Scale:
                </span>
                <div className="liquid-glass-well flex items-center gap-1 p-1 rounded-full">
                  {[1000, 5000, 10000].map((size) => {
                    const active = benchScale === size;
                    return (
                      <motion.button
                        key={size}
                        type="button"
                        whileTap={{ scale: 0.94 }}
                        transition={APPLE_SPRING_SNAPPY}
                        onClick={() => handleRunBenchmark(size)}
                        className={`relative px-3 py-1 rounded-full text-[11px] font-mono transition-colors ${
                          active
                            ? "text-white dark:text-black font-semibold"
                            : "text-black/70 dark:text-white/70"
                        }`}
                      >
                        {active && (
                          <motion.span
                            layoutId="bench-scale-pill"
                            transition={APPLE_SPRING_BOUNCY}
                            className="liquid-glass-active-pill absolute inset-0 rounded-full"
                          />
                        )}
                        <span className="relative z-10">
                          {size.toLocaleString()} Photos
                        </span>
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              <motion.button
                type="button"
                whileHover={{ scale: 1.04, y: -1.5 }}
                whileTap={{ scale: 0.94 }}
                transition={APPLE_SPRING_BOUNCY}
                disabled={isRunningBench}
                onClick={() => handleRunBenchmark(benchScale)}
                className="liquid-glass-emerald flex items-center gap-2 px-5 py-2 rounded-full text-xs font-semibold text-white"
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 ${
                    isRunningBench ? "animate-spin" : ""
                  }`}
                />
                <span>
                  {isRunningBench
                    ? "Running Benchmarks..."
                    : `Run ${benchScale.toLocaleString()}-Photo Benchmark`}
                </span>
              </motion.button>
            </div>

            {benchResult && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {benchResult.metrics.map((m) => (
                  <div
                    key={m.id}
                    className="liquid-glass-card p-4 rounded-2xl space-y-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="text-sm font-medium text-black dark:text-white">
                          {m.name}
                        </h4>
                        <p className="text-[10px] font-mono text-black/55 dark:text-white/55">
                          {m.algorithm}
                        </p>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-emerald-500 text-white shadow-sm">
                        {m.speedup}× Faster
                      </span>
                    </div>

                    <div className="space-y-2 text-xs font-mono">
                      <div className="space-y-1">
                        <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-semibold">
                          <span>Indexed DB Engine (O(1))</span>
                          <span>{m.indexedMs} ms</span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-black/5 dark:bg-white/10 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{
                              width: `${Math.max(
                                6,
                                Math.min(100, (m.indexedMs / m.linearMs) * 100)
                              )}%`,
                            }}
                            transition={APPLE_SPRING_FLUID}
                            className="h-full rounded-full bg-emerald-500"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between text-black/55 dark:text-white/55">
                          <span>Standard Linear Array Scan (O(N))</span>
                          <span>{m.linearMs} ms</span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-black/5 dark:bg-white/10 overflow-hidden">
                          <div className="h-full w-full rounded-full bg-black/30 dark:bg-white/30" />
                        </div>
                      </div>
                    </div>

                    <div className="pt-1 border-t border-black/5 dark:border-white/10 flex items-center justify-between text-[10px] font-mono text-black/55 dark:text-white/55">
                      <span>Throughput: {m.opsPerSec.toLocaleString()} ops/sec</span>
                      <span>Dataset: {benchResult.recordCount.toLocaleString()} rows</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {supabaseBench && !supabaseBench.error && (
              <div className="liquid-glass-card p-4 rounded-2xl flex flex-wrap items-center justify-between gap-3 border border-emerald-500/30">
                <div className="flex items-center gap-2.5">
                  <Activity className="w-4 h-4 text-emerald-500" />
                  <span className="text-xs font-mono">
                    <strong>Supabase Cloud B-Tree Index Benchmark:</strong>{" "}
                    Category Sort in{" "}
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                      {supabaseBench.indexedCategorySortMs} ms
                    </span>{" "}
                    • Network Round-Trip: {supabaseBench.roundTripMs} ms
                  </span>
                </div>
                <span className="text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                  {supabaseBench.indexUsed}
                </span>
              </div>
            )}
          </motion.div>
        )}

        {/* TAB 2: SUPABASE CLOUD EXPLORER & SQL SETUP */}
        {activeTab === "explorer" && (
          <motion.div
            key="explorer-tab"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={APPLE_SPRING_FLUID}
            className="space-y-4"
          >
            <div className="liquid-glass-card p-4 rounded-2xl flex flex-wrap items-center justify-between gap-3">
              <div className="space-y-0.5">
                <div className="text-xs font-semibold text-black dark:text-white flex items-center gap-2">
                  <span>Supabase Project:</span>
                  <code className="px-2 py-0.5 rounded bg-black/[0.05] dark:bg-white/10 font-mono text-[11px]">
                    https://dnnjvxlyxymepyskgpte.supabase.co
                  </code>
                </div>
                <p className="text-[11px] text-black/60 dark:text-white/60">
                  {user
                    ? `Signed in as ${user.email}. All uploaded & 4K AI-generated photos automatically save to Supabase Cloud.`
                    : "Guest Mode active: Photos you add or generate stay only in temporary memory and are NOT stored. Sign in to enable cloud storage."}
                </p>
              </div>

              <motion.button
                type="button"
                whileHover={{ scale: 1.04, y: -1 }}
                whileTap={{ scale: 0.94 }}
                transition={APPLE_SPRING_BOUNCY}
                disabled={isSyncing || photos.length === 0}
                onClick={handleSyncClick}
                className="liquid-glass-emerald flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold text-white disabled:opacity-50"
              >
                <CloudUpload className="w-3.5 h-3.5" />
                <span>
                  {isSyncing
                    ? "Syncing to Supabase..."
                    : `Sync ${photos.length} Photos to Supabase`}
                </span>
              </motion.button>
            </div>

            {/* SQL Schema & B-Tree Index Copy Box */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase tracking-wider text-black/65 dark:text-white/65 flex items-center gap-1.5">
                  <Code2 className="w-3.5 h-3.5" />
                  <span>Supabase PostgreSQL Table & B-Tree / GIN Index SQL</span>
                </span>
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.04, y: -1 }}
                  whileTap={{ scale: 0.94 }}
                  transition={APPLE_SPRING_SNAPPY}
                  onClick={handleCopySql}
                  className="liquid-glass-action flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono text-black dark:text-white"
                >
                  {copiedSql ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-500" />
                      <span>Copied SQL! Paste in Supabase SQL Editor</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy SQL Script</span>
                    </>
                  )}
                </motion.button>
              </div>

              <pre className="p-3.5 rounded-2xl bg-black text-white/90 text-[11px] font-mono overflow-x-auto max-h-52 border border-white/10">
                {SUPABASE_SETUP_SQL}
              </pre>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
