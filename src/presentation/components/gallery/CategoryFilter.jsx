"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LayoutGrid, Layers, Search, ArrowUpDown, X } from "lucide-react";
import {
  APPLE_SPRING_SNAPPY,
  APPLE_SPRING_FLUID,
  APPLE_SPRING_BOUNCY,
} from "../../motion/apple-motion";

export function CategoryFilter({
  categoriesWithCounts,
  activeCategory,
  onSelectCategory,
  viewMode,
  onViewModeChange,
  totalPhotos,
  searchQuery = "",
  onSearchChange,
  sortBy = "newest",
  onSortChange,
}) {
  const [hoveredCategory, setHoveredCategory] = useState(null);

  return (
    <div className="w-full space-y-3 py-3.5 border-b border-black/10 dark:border-white/10 mb-8">
      {/* Row 1: Category Pills with 120Hz Sliding Active Pill & View Mode Switcher */}
      <div className="w-full flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
      <div
        onMouseLeave={() => setHoveredCategory(null)}
        className="flex items-center flex-nowrap md:flex-wrap gap-1.5 overflow-x-auto md:overflow-visible w-full lg:w-auto py-1.5 px-1 -mx-1 scrollbar-none"
      >
        <button
          type="button"
          onClick={() => onSelectCategory("all")}
          onMouseEnter={() => setHoveredCategory("all")}
          className={`relative px-3.5 py-1.5 rounded-full text-xs uppercase tracking-wider font-medium transition-colors shrink-0 select-none ${
            activeCategory === "all"
              ? "text-black dark:text-white"
              : "text-black/55 dark:text-white/55 hover:text-black dark:hover:text-white"
          }`}
        >
          {hoveredCategory === "all" && activeCategory !== "all" && (
            <motion.span
              layoutId="category-hover-pill"
              className="absolute inset-0 rounded-full bg-black/[0.05] dark:bg-white/[0.07]"
              transition={APPLE_SPRING_SNAPPY}
            />
          )}
          {activeCategory === "all" && (
            <motion.span
              layoutId="category-filter-pill"
              className="absolute inset-0 rounded-full border border-black dark:border-white bg-black/[0.07] dark:bg-white/[0.12] shadow-sm"
              transition={APPLE_SPRING_SNAPPY}
            />
          )}
          <motion.span
            whileTap={{ scale: 0.93 }}
            transition={APPLE_SPRING_SNAPPY}
            className="relative z-10 flex items-center gap-1.5"
          >
            <span>All</span>
            <motion.span
              key={totalPhotos}
              initial={{ scale: 0.8, opacity: 0.5 }}
              animate={{ scale: 1, opacity: 0.65 }}
              transition={APPLE_SPRING_BOUNCY}
              className="text-[10px] font-mono"
            >
              ({totalPhotos})
            </motion.span>
          </motion.span>
        </button>

        <AnimatePresence initial={false}>
          {categoriesWithCounts.map(({ label, count }) => {
            const isSelected =
              activeCategory.toLowerCase() === label.toLowerCase();
            const isHovered = hoveredCategory === label;

            return (
              <motion.button
                type="button"
                key={label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.85 }}
                transition={APPLE_SPRING_FLUID}
                onClick={() => onSelectCategory(label)}
                onMouseEnter={() => setHoveredCategory(label)}
                className={`relative px-3.5 py-1.5 rounded-full text-xs uppercase tracking-wider font-medium transition-colors shrink-0 select-none ${
                  isSelected
                    ? "text-black dark:text-white"
                    : "text-black/55 dark:text-white/55 hover:text-black dark:hover:text-white"
                }`}
              >
                {isHovered && !isSelected && (
                  <motion.span
                    layoutId="category-hover-pill"
                    className="absolute inset-0 rounded-full bg-black/[0.05] dark:bg-white/[0.07]"
                    transition={APPLE_SPRING_SNAPPY}
                  />
                )}
                {isSelected && (
                  <motion.span
                    layoutId="category-filter-pill"
                    className="absolute inset-0 rounded-full border border-black dark:border-white bg-black/[0.07] dark:bg-white/[0.12] shadow-sm"
                    transition={APPLE_SPRING_SNAPPY}
                  />
                )}
                <motion.span
                  whileTap={{ scale: 0.93 }}
                  transition={APPLE_SPRING_SNAPPY}
                  className="relative z-10 flex items-center gap-1.5"
                >
                  <span>{label}</span>
                  <motion.span
                    key={count}
                    initial={{ scale: 0.8, opacity: 0.5 }}
                    animate={{ scale: 1, opacity: 0.65 }}
                    transition={APPLE_SPRING_BOUNCY}
                    className="text-[10px] font-mono"
                  >
                    ({count})
                  </motion.span>
                </motion.span>
              </motion.button>
            );
          })}
        </AnimatePresence>
      </div>

      {/* View Mode Segmented Control: Grid vs By Category */}
      <div className="flex items-center gap-1 p-1 rounded-full border border-black/10 dark:border-white/10 bg-black/[0.03] dark:bg-white/[0.03] shrink-0 self-end lg:self-auto">
        <button
          type="button"
          onClick={() => onViewModeChange("grid")}
          className={`relative px-3.5 py-1.5 text-xs uppercase tracking-wider rounded-full transition-colors flex items-center gap-1.5 select-none ${
            viewMode === "grid"
              ? "text-black dark:text-white font-medium"
              : "text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white"
          }`}
          title="Masonry Grid View"
        >
          {viewMode === "grid" && (
            <motion.span
              layoutId="view-mode-pill"
              className="absolute inset-0 rounded-full bg-white dark:bg-white/15 shadow-sm border border-black/5 dark:border-white/10"
              transition={APPLE_SPRING_SNAPPY}
            />
          )}
          <motion.span
            whileTap={{ scale: 0.93 }}
            transition={APPLE_SPRING_SNAPPY}
            className="relative z-10 flex items-center gap-1.5"
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Grid</span>
          </motion.span>
        </button>

        <button
          type="button"
          onClick={() => onViewModeChange("by-category")}
          className={`relative px-3.5 py-1.5 text-xs uppercase tracking-wider rounded-full transition-colors flex items-center gap-1.5 select-none ${
            viewMode === "by-category"
              ? "text-black dark:text-white font-medium"
              : "text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white"
          }`}
          title="Group by Category View"
        >
          {viewMode === "by-category" && (
            <motion.span
              layoutId="view-mode-pill"
              className="absolute inset-0 rounded-full bg-white dark:bg-white/15 shadow-sm border border-black/5 dark:border-white/10"
              transition={APPLE_SPRING_SNAPPY}
            />
          )}
          <motion.span
            whileTap={{ scale: 0.93 }}
            transition={APPLE_SPRING_SNAPPY}
            className="relative z-10 flex items-center gap-1.5"
          >
            <Layers className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">By Category</span>
          </motion.span>
        </button>
      </div>
      </div>

      {/* Row 2: High-Speed Indexed Search, TypedArray Sort & Live Query Benchmark Badge */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1">
        <div className="relative flex-1 min-w-[200px] max-w-md flex items-center">
          <Search className="w-3.5 h-3.5 absolute left-3.5 text-black/40 dark:text-white/40 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange?.(e.target.value)}
            placeholder="Instant O(1) token search (filename, category, tags)..."
            className="liquid-glass-input w-full pl-9 pr-8 py-1.5 text-xs rounded-full text-black dark:text-white placeholder:text-black/40 dark:placeholder:text-white/40 focus:outline-none"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange?.("")}
              className="absolute right-2.5 p-0.5 rounded-full text-black/45 dark:text-white/45 hover:text-black dark:hover:text-white"
              aria-label="Clear search"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="liquid-glass-action flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs">
            <ArrowUpDown className="w-3.5 h-3.5 text-black/55 dark:text-white/55" />
            <span className="text-[10px] font-mono uppercase tracking-wider text-black/55 dark:text-white/55">
              Sort:
            </span>
            <select
              value={sortBy}
              onChange={(e) => onSortChange?.(e.target.value)}
              className="bg-transparent text-xs font-medium text-black dark:text-white focus:outline-none cursor-pointer"
            >
              <option value="newest" className="bg-white dark:bg-[#161616]">
                Newest First
              </option>
              <option
                value="confidence-desc"
                className="bg-white dark:bg-[#161616]"
              >
                Confidence (High → Low)
              </option>
              <option
                value="confidence-asc"
                className="bg-white dark:bg-[#161616]"
              >
                Confidence (Low → High)
              </option>
              <option value="size-desc" className="bg-white dark:bg-[#161616]">
                File Size (Largest)
              </option>
              <option value="name-asc" className="bg-white dark:bg-[#161616]">
                Filename (A → Z)
              </option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
