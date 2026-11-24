"use client";
import React, { useEffect, useState, useMemo, useRef } from "react";
import { motion } from "framer-motion";
import { LiquidJellyOrb } from "./LiquidJellyOrb";
import { Sparkles, CheckCircle2, ArrowRight } from "lucide-react";

export function PhotoAbsorptionStage({
  isActive,
  totalPhotos,
  processedPhotos,
  photos,
  modelStage,
  modelProgress,
  aiProviderName = "Google Gemini Vision AI",
  onAnimationFinished,
}) {
  const [animStep, setAnimStep] = useState(1);
  const [pulseCount, setPulseCount] = useState(0);
  const [isDone, setIsDone] = useState(false);

  const startTimeRef = useRef(0);
  const bloomTriggeredRef = useRef(false);
  const onFinishRef = useRef(onAnimationFinished);

  useEffect(() => {
    onFinishRef.current = onAnimationFinished;
  }, [onAnimationFinished]);

  const normalizedProgress =
    totalPhotos > 0 ? Math.min(1, processedPhotos / totalPhotos) : 0;
  const isClassificationComplete =
    totalPhotos > 0 && processedPhotos >= totalPhotos;

  // Step 1 -> Step 2 progression + hard safety ceiling so UI can NEVER get stuck
  useEffect(() => {
    if (!isActive) {
      setAnimStep(1);
      setIsDone(false);
      bloomTriggeredRef.current = false;
      return;
    }

    setAnimStep(1);
    setIsDone(false);
    setPulseCount(0);
    bloomTriggeredRef.current = false;
    startTimeRef.current = Date.now();

    const step1Duration = totalPhotos <= 1 ? 750 : 1200;
    const step1Timer = setTimeout(() => {
      setAnimStep((prev) => (prev === 1 ? 2 : prev));
    }, step1Duration);

    // Hard safety timeout: never allow the absorption stage to block the screen longer than 5.5s
    const maxStageDuration = totalPhotos <= 1 ? 3400 : 5800;
    const safetyTimer = setTimeout(() => {
      setIsDone(true);
      onFinishRef.current?.();
    }, maxStageDuration);

    return () => {
      clearTimeout(step1Timer);
      clearTimeout(safetyTimer);
    };
  }, [isActive, totalPhotos]);

  // Pulse shockwave whenever photos are classified
  useEffect(() => {
    if (processedPhotos > 0) {
      setPulseCount((c) => c + 1);
    }
  }, [processedPhotos]);

  // Step 2 -> Step 3 (Ferrofluid Spike Bloom) -> Finish into Gallery
  // Uses a ref guard so setting animStep(3) does NOT cancel the inner finish timer!
  useEffect(() => {
    if (!isActive || !isClassificationComplete || bloomTriggeredRef.current) {
      return;
    }

    bloomTriggeredRef.current = true;
    const elapsed = Date.now() - startTimeRef.current;
    const targetMinWait = totalPhotos <= 1 ? 1100 : 2200;
    const waitBeforeBloom = Math.max(0, targetMinWait - elapsed);

    const bloomTimer = setTimeout(() => {
      setAnimStep(3);
    }, waitBeforeBloom);

    const finishDelay = waitBeforeBloom + (totalPhotos <= 1 ? 950 : 1350);
    const doneTimer = setTimeout(() => {
      setIsDone(true);
      onFinishRef.current?.();
    }, finishDelay);

    return () => {
      clearTimeout(bloomTimer);
      clearTimeout(doneTimer);
    };
  }, [isActive, isClassificationComplete, totalPhotos]);

  const currentPhase = useMemo(() => {
    if (animStep === 3) return 2.0;
    if (animStep === 2) return 1.0;
    return 0.0;
  }, [animStep]);

  const flyingPhotos = useMemo(() => {
    const sample = photos.slice(0, Math.min(16, Math.max(1, totalPhotos)));
    return sample.map((p, idx) => {
      const angle = (idx / Math.max(1, sample.length)) * Math.PI * 2;
      return {
        id: p.id,
        url: p.objectUrl,
        angle,
        distance: 260 + (idx % 3) * 50,
        delay: (idx * 0.12) % 1.4,
      };
    });
  }, [photos, totalPhotos]);

  if (!isActive || isDone) return null;

  return (
    <motion.div
      key="photo-absorption-stage"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-40 flex flex-col items-center justify-center overflow-hidden bg-white/88 dark:bg-[#070707]/90 backdrop-blur-3xl px-4 select-none"
    >
      {/* Ambient Radial Backlight Glow */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        <motion.div
          animate={{
            scale: animStep === 3 ? [1, 1.35, 1.15] : [0.95, 1.05, 0.95],
            opacity: animStep === 3 ? [0.4, 0.8, 0.5] : 0.45,
          }}
          transition={{
            duration: animStep === 3 ? 1.1 : 3.5,
            repeat: animStep === 3 ? 0 : Infinity,
            ease: "easeInOut",
          }}
          className="w-[560px] h-[560px] rounded-full bg-gradient-to-b from-neutral-300/40 via-neutral-400/10 to-transparent dark:from-neutral-700/35 dark:via-neutral-900/25 dark:to-transparent blur-3xl"
        />
      </div>

      {/* Central Liquid Jelly Orb Stage */}
      <div className="relative flex items-center justify-center">
        {animStep === 3 && (
          <motion.div
            initial={{ scale: 0.6, opacity: 0.9 }}
            animate={{ scale: 3.4, opacity: 0 }}
            transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
            className="absolute w-[240px] h-[240px] rounded-full border-2 border-black/40 dark:border-white/60 shadow-[0_0_60px_rgba(255,255,255,0.5)] pointer-events-none"
          />
        )}

        <motion.div
          animate={{
            scale:
              animStep === 3
                ? [1, 0.92, 1.16, 1.04]
                : animStep === 2
                ? [1, 1.03, 1]
                : 1,
          }}
          transition={{
            duration: animStep === 3 ? 1.1 : 2.6,
            repeat: animStep === 3 ? 0 : Infinity,
            ease: "easeInOut",
          }}
        >
          <LiquidJellyOrb
            phase={currentPhase}
            progress={normalizedProgress}
            pulseTrigger={pulseCount}
            size={320}
            isProcessing={true}
            className="drop-shadow-[0_30px_60px_rgba(0,0,0,0.65)]"
          />
        </motion.div>

        {animStep < 3 &&
          flyingPhotos.map((item, idx) => {
            const startX = Math.cos(item.angle) * item.distance;
            const startY = Math.sin(item.angle) * item.distance;
            return (
              <motion.div
                key={item.id}
                initial={{
                  x: startX,
                  y: startY,
                  scale: 0.85,
                  opacity: 0,
                  rotate: ((idx * 24) % 36) - 18,
                }}
                animate={{
                  x: [startX, startX * 0.45, 0],
                  y: [startY, startY * 0.45, 0],
                  scale: [0.85, 0.55, 0.02],
                  opacity: [0, 0.95, 0],
                  rotate: [((idx * 24) % 36) - 18, 0, (idx * 50) % 90],
                }}
                transition={{
                  duration: 1.6,
                  repeat: Infinity,
                  delay: item.delay,
                  ease: [0.32, 0, 0.24, 1],
                }}
                className="absolute z-20 w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border border-white/70 dark:border-white/25 shadow-2xl backdrop-blur-md pointer-events-none"
              >
                <img
                  src={item.url}
                  alt="Absorbing photo"
                  className="w-full h-full object-cover"
                />
              </motion.div>
            );
          })}
      </div>

      {/* Apple-Style Glassmorphism HUD */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, type: "spring", stiffness: 350, damping: 28 }}
        className="mt-8 flex flex-col items-center text-center space-y-3.5 z-30 max-w-md w-full px-4"
      >
        <div className="flex items-center gap-2 px-4 py-1.5 rounded-full border border-black/10 dark:border-white/15 bg-white/75 dark:bg-white/10 backdrop-blur-2xl shadow-sm text-xs uppercase tracking-widest font-mono text-black dark:text-white">
          {animStep === 3 && (
            <>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span>Step 3 • Ferrofluid Bloom • Categorized!</span>
            </>
          )}
          {animStep === 2 && (
            <>
              <span className="relative flex h-2 w-2 items-center justify-center">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.9)]" />
              </span>
              <span>Step 2 • Liquid Jelly AI Classification</span>
            </>
          )}
          {animStep === 1 && (
            <>
              <span className="relative flex h-2 w-2 items-center justify-center">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.9)]" />
              </span>
              <span>Step 1 • Absorbing Into Glossy Core</span>
            </>
          )}
        </div>

        <h2 className="text-xl sm:text-2xl font-light tracking-tight text-black dark:text-white">
          {animStep === 3
            ? "Categories Crystallized!"
            : animStep === 1
            ? `Absorbing ${totalPhotos} ${totalPhotos === 1 ? "Photo" : "Photos"}`
            : modelStage
            ? modelStage
            : `Analyzing ${processedPhotos} of ${totalPhotos} Photos`}
        </h2>

        <div className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-black/55 dark:text-white/55 font-mono">
          <Sparkles className="w-3.5 h-3.5 text-black dark:text-white" />
          <span>{aiProviderName}</span>
        </div>

        <div className="w-full max-w-xs h-1.5 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden mt-1 p-[1px]">
          <motion.div
            className="h-full bg-gradient-to-r from-black via-neutral-600 to-black dark:from-white dark:via-neutral-300 dark:to-white rounded-full"
            initial={{ width: 0 }}
            animate={{
              width:
                animStep === 3
                  ? "100%"
                  : animStep === 1
                  ? "30%"
                  : modelProgress !== undefined && modelStage
                  ? `${modelProgress}%`
                  : `${Math.max(30, Math.round(normalizedProgress * 100))}%`,
            }}
            transition={{ type: "spring", stiffness: 140, damping: 22 }}
          />
        </div>

        {/* Instant Skip / View Gallery Now button so the user is never blocked */}
        <button
          type="button"
          onClick={() => {
            setIsDone(true);
            onFinishRef.current?.();
          }}
          className="mt-2 inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[11px] uppercase font-mono tracking-wider border border-black/15 dark:border-white/20 bg-white/80 dark:bg-white/10 text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors"
        >
          <span>Skip to Gallery Now</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </motion.div>
    </motion.div>
  );
}
