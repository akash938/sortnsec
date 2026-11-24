# Sortn Sec — Photo Categorizer

A minimalist, high-performance in-browser photo categorizer built using **Clean Architecture principles**, powered by zero-shot CLIP classification, Web Workers, Next.js (App Router), Tailwind CSS, and Framer Motion.

---

## Clean Architecture Overview

The codebase is organized into strict concentric architectural layers following Clean Architecture principles:

```
src/
├── domain/                      # 1. Enterprise & Core Business Rules
│   ├── entities/
│   │   ├── photo.entity.ts      # PhotoItem, PhotoStatus, PhotoScore, Dimensions
│   │   ├── category.entity.ts   # CategoryDefinition, CategoryType, ALL_CATEGORIES
│   │   └── notification.entity.ts # Toast notice types
│   └── rules/
│       └── upload-policy.ts     # MAX_PHOTOS (100), BATCH_SIZE (4), file validation
│
├── application/                 # 2. Application Business Rules & Use Cases
│   ├── ports/
│   │   ├── image-classifier.port.ts   # Port for classification service
│   │   ├── image-preprocessor.port.ts # Port for canvas downscaling & metadata extraction
│   │   └── sample-generator.port.ts   # Port for test fixtures
│   └── use-cases/
│       ├── validate-files.use-case.ts       # Enforces 100 max, filters JPG/PNG/WEBP
│       ├── filter-photos.use-case.ts        # Category filtering & count aggregation
│       ├── group-photos-by-category.use-case.ts # Groups photos by primary/manual category
│       └── update-photo-category.use-case.ts # Manual category override logic
│
├── infrastructure/              # 3. External Adapters & Device Services
│   ├── classifier/
│   │   └── web-worker-classifier.adapter.ts # Adapter bridging to Web Worker
│   ├── image/
│   │   └── canvas-preprocessor.adapter.ts   # HTML5 Canvas 512px downscaler & aspect ratio
│   ├── fixtures/
│   │   └── canvas-sample-generator.adapter.ts # 100 sample photo canvas generator
│   └── storage/
│       └── local-storage-theme.adapter.ts   # Theme persistence
│
└── presentation/                # 4. Interface Adapters & UI
    ├── hooks/
    │   ├── usePhotoCategorizer.ts  # Application Controller / ViewModel hook
    │   └── useTheme.ts             # Theme state management
    └── components/
        ├── layout/
        │   └── Navbar.tsx          # Floating pill navbar with layoutId tab pill
        ├── upload/
        │   └── Dropzone.tsx        # Drag-and-drop & browse area + 100 sample button
        ├── gallery/
        │   ├── PhotoGrid.tsx       # Responsive masonry photo grid
        │   ├── PhotoCard.tsx       # Masonry photo item with badges & shared layoutId
        │   ├── GroupedCategoryView.tsx # "By category" grouped gallery sections
        │   └── CategoryFilter.tsx  # Filter row (All + detected categories with counts)
        ├── modal/
        │   └── PhotoModal.tsx      # Full-detail inspection dialog & manual editor
        └── feedback/
            ├── ProgressBar.tsx     # Real-time batch and model loading progress
            └── ToastNotice.tsx     # Floating notifications for limit and file warnings
```

> **Note on `/lib/categories.ts`**: As per specification, category definitions remain editable via [`/lib/categories.ts`](file:///Users/akash/sortsec/lib/categories.ts), which points directly into the domain layer.

---

## Features

- **100% In-Browser Execution**: Photos stay entirely in memory via Object URLs with zero backend, zero cloud uploads, and zero database storage.
- **Zero-Shot CLIP Classification**: Runs `@huggingface/transformers` in a dedicated Web Worker so the main UI thread never freezes.
- **Smart Image Pre-Processing**: Automatically measures natural aspect ratios to prevent layout shifts and downscales images (max 512px) before feeding to the model for ultra-fast processing.
- **Batch Processing & Progress**: Analyzes images in small batches with an animated progress bar and model preparation status (*"Preparing the model, one-time only"*).
- **Strict Upload Limits & File Filtering**:
  - Hard limit of 100 photos per selection with an elegant notice: *"Only the first 100 were added."*
  - Accepts `JPG`, `PNG`, and `WEBP`; rejects invalid formats gracefully with a toast notification.
- **22 Tuned Categories**:
  - **Aesthetic**: Minimalist, Dark Academia, Cinematic, Vintage Film, Cyberpunk, Streetwear, Luxury, Nature, Pastel, Brutalist, Cottagecore, Y2K.
  - **Subject**: Portrait, Food, Cars, Architecture, Animals, Fashion, Travel, Interior, Product, Sunset/Sky.
  - Each photo receives 1 primary category and up to 2 secondary tags with percentage confidence scores.
- **Dual Gallery Views**:
  - **Masonry Grid**: Fluid multi-column layout with category badges and confidence tags.
  - **By Category**: Grouped sections with category headings and photo counts.
- **Photo Detail Modal**:
  - Shared-element transition (`layoutId`) from photo card to full preview.
  - Full confidence breakdown and percentage score bars.
  - Manual category correction dropdown with instant badge and filter updates.
  - Keyboard accessible (`Esc` to close, `←` `→` arrow keys to navigate).
- **Strict Monochrome Design System**:
  - Palette of pure white (`#FFFFFF`), off-white (`#F5F5F5`), deep black (`#0A0A0A`), and subtle neutral greys.
  - Floating pill navigation bar with active tab indicator sliding via Framer Motion `layoutId`, shrinking dynamically on scroll.
  - Light & dark theme toggle saved in `localStorage`, defaulting to system preference.

---

## Getting Started

### 1. Install dependencies
```bash
npm install
```

### 2. Run the development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Run production build
```bash
npm run build
npm start
```

### 4. Run browser verification test
An automated headless Chrome suite tests the 100-photo batching, filtering, theme toggle, modal editing, and limit notices:
```bash
node scripts/verify-browser.mjs
```
