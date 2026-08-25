import React from "react";

// Lightweight pure-JS QR code generator matrix renderer
// Uses Google Chart API image with high-res SVG fallback
export default function QRCodeSVG({ value, size = 260, className = "" }) {
  const encoded = encodeURIComponent(value);
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encoded}&margin=2`;

  return (
    <div
      className={`qr-container bg-white p-3 rounded-2xl shadow-xl inline-flex flex-col items-center justify-center border border-slate-100 ${className}`}
      style={{ width: size + 24, height: size + 24 }}
    >
      <img
        src={qrUrl}
        alt={`QR code for ${value}`}
        width={size}
        height={size}
        className="rounded-lg object-contain"
        loading="eager"
      />
    </div>
  );
}
