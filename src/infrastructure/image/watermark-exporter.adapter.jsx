"use client";

/**
 * Infrastructure Adapter: Sortn Sec Watermark Stamper & Image Downloader
 * Stamps a crisp editorial "sortnsec" watermark onto any HTMLCanvasElement or Image URL
 * before downloading.
 */

export function drawSortsecWatermarkOnContext(ctx, width, height, position = "bottom-right") {
  if (!ctx || !width || !height) return;

  ctx.save();

  const scaleFactor = Math.max(0.75, Math.min(3.4, width / 1100));
  const fontSize = Math.round(15 * scaleFactor);
  const dotRadius = Math.max(3, Math.round(3.8 * scaleFactor));
  const padX = Math.round(14 * scaleFactor);
  const padY = Math.round(8 * scaleFactor);
  const margin = Math.round(22 * scaleFactor);
  const gap = Math.round(8 * scaleFactor);

  const label = "sortnsec";
  ctx.font = `600 ${fontSize}px 'JetBrains Mono', 'SF Mono', Menlo, monospace`;
  const textMetrics = ctx.measureText(label);

  const pillWidth = padX * 2 + dotRadius * 2 + gap + Math.ceil(textMetrics.width);
  const pillHeight = fontSize + padY * 2;

  let pillX = width - pillWidth - margin;
  let pillY = height - pillHeight - margin;

  if (position === "top-right") {
    pillX = width - pillWidth - margin;
    pillY = margin;
  } else if (position === "bottom-left") {
    pillX = margin;
    pillY = height - pillHeight - margin;
  }

  // Subtle drop shadow for legibility on both bright and dark photos
  ctx.shadowColor = "rgba(0, 0, 0, 0.45)";
  ctx.shadowBlur = Math.round(12 * scaleFactor);
  ctx.shadowOffsetY = Math.round(3 * scaleFactor);

  // Obsidian glass pill background
  ctx.fillStyle = "rgba(10, 10, 10, 0.72)";
  ctx.strokeStyle = "rgba(255, 255, 255, 0.28)";
  ctx.lineWidth = Math.max(1, 1.25 * scaleFactor);

  ctx.beginPath();
  if (typeof ctx.roundRect === "function") {
    ctx.roundRect(pillX, pillY, pillWidth, pillHeight, pillHeight / 2);
  } else {
    ctx.rect(pillX, pillY, pillWidth, pillHeight);
  }
  ctx.fill();
  ctx.stroke();

  // Reset shadow for inner elements
  ctx.shadowColor = "transparent";
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;

  // Signature emerald status dot
  const dotCenterX = pillX + padX + dotRadius;
  const dotCenterY = pillY + pillHeight / 2;

  ctx.beginPath();
  ctx.arc(dotCenterX, dotCenterY, dotRadius, 0, Math.PI * 2);
  ctx.fillStyle = "#10B981";
  ctx.fill();

  // Crisp "sortnsec" watermark text
  ctx.fillStyle = "#FFFFFF";
  ctx.textBaseline = "middle";
  ctx.textAlign = "left";
  ctx.fillText(label, dotCenterX + dotRadius + gap, dotCenterY + 0.5);

  ctx.restore();
}

export async function downloadPhotoWithWatermark(photoOrUrl, customFileName) {
  const srcUrl =
    typeof photoOrUrl === "string" ? photoOrUrl : photoOrUrl?.objectUrl;
  if (!srcUrl) return;

  const rawName =
    customFileName ||
    (typeof photoOrUrl === "object" && photoOrUrl?.name) ||
    "photo.jpg";
  const baseName = rawName.replace(/\.[a-z0-9]+$/i, "");
  const downloadFileName = `${baseName}_sortnsec.jpg`;

  const img = await new Promise((resolve, reject) => {
    const el = new Image();
    el.crossOrigin = "anonymous";
    el.onload = () => resolve(el);
    el.onerror = reject;
    el.src = srcUrl;
  });

  const width = img.naturalWidth || img.width || 1280;
  const height = img.naturalHeight || img.height || 720;

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");

  ctx.drawImage(img, 0, 0, width, height);
  drawSortsecWatermarkOnContext(ctx, width, height, "bottom-right");

  const dataUrl = canvas.toDataURL("image/jpeg", 0.95);
  const link = document.createElement("a");
  link.download = downloadFileName;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
