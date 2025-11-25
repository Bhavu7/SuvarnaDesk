import React from "react";
import { motion } from "framer-motion";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  text?: string;
  overlay?: boolean;
}

const sizePxMap: Record<NonNullable<LoadingSpinnerProps["size"]>, number> = {
  sm: 56,
  md: 88,
  lg: 120,
};

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = "md",
  text = "Loading...",
  overlay = false,
}) => {
  const iconSize = sizePxMap[size];

  const LoaderIcon = () => (
    <div
      className="flex items-center justify-center"
      style={{ width: iconSize, height: iconSize }}
    >
      <motion.svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 120 120"
        className="overflow-visible"
        initial="initial"
        animate="animate"
      >
        {/* ===== Gradients (gold & silver) ===== */}
        <defs>
          <linearGradient id="goldGradient" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor="#B7791F" />
            <stop offset="50%" stopColor="#D4AF37" />
            <stop offset="100%" stopColor="#FACC15" />
          </linearGradient>
          <linearGradient id="silverGradient" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor="#6B7280" />
            <stop offset="50%" stopColor="#9CA3AF" />
            <stop offset="100%" stopColor="#E5E7EB" />
          </linearGradient>
        </defs>

        {/* ===== Outer rounded frame (modern thin stroke) ===== */}
        <motion.rect
          x="16"
          y="16"
          width="88"
          height="88"
          rx="18"
          fill="none"
          stroke="#2563EB" // blue-600
          strokeWidth="2"
          variants={{
            initial: { opacity: 0, scale: 0.9 },
            animate: {
              opacity: 1,
              scale: 1,
              transition: { duration: 0.4, ease: "easeOut" },
            },
          }}
        />

        {/* ===== Base line (ground) – grows from left, bottom-aligned ===== */}
        <motion.line
          x1="26"
          y1="90"
          x2="94"
          y2="90"
          stroke="#60A5FA" // blue-400
          strokeWidth="2"
          strokeLinecap="round"
          variants={{
            initial: { scaleX: 0, originX: 0 },
            animate: {
              scaleX: [0, 1],
              transition: { duration: 0.4, ease: "easeOut", delay: 0.1 },
            },
          }}
        />

        {/* ===== 3 vertical bars (gold / silver / blue), filling bottom → top in loop ===== */}
        {[
          { x: 32, maxH: 26, fill: "url(#goldGradient)", delay: 0.0 },
          { x: 52, maxH: 36, fill: "url(#silverGradient)", delay: 0.12 },
          { x: 72, maxH: 48, fill: "#2563EB", delay: 0.24 }, // blue-600
        ].map((bar, idx) => (
          <motion.rect
            key={idx}
            x={bar.x}
            y={90 - bar.maxH}
            width="10"
            height={bar.maxH}
            rx="4"
            fill={bar.fill}
            style={{ transformOrigin: "50% 100%" }} // bottom
            variants={{
              initial: { scaleY: 0 },
              animate: {
                scaleY: [0, 1, 0.4, 1],
                transition: {
                  duration: 1.4,
                  delay: 0.2 + bar.delay,
                  repeat: Infinity,
                  ease: "easeInOut",
                },
              },
            }}
          />
        ))}

        {/* ===== Line chart (inside frame) – drawn from left → right, anchored low ===== */}
        <motion.path
          d="M30 78 L44 70 L58 64 L72 56 L86 52"
          fill="none"
          stroke="#EFF6FF" // blue-50
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="72"
          variants={{
            initial: { strokeDashoffset: 72 },
            animate: {
              strokeDashoffset: [72, 0, 72],
              transition: {
                duration: 1.6,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.3,
              },
            },
          }}
        />

        {/* ===== Arrow head – rises slightly from bottom when line finishes ===== */}
        <motion.polygon
          points="86,52 92,49 88,57"
          fill="#EFF6FF"
          variants={{
            initial: { opacity: 0, y: 6 },
            animate: {
              opacity: [0, 1, 0.4, 1],
              y: [6, 0, 2, 0],
              transition: {
                duration: 1.6,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.4,
              },
            },
          }}
        />

        {/* ===== Overlapping rings (gold & silver) – slide up into place from lower Y ===== */}
        <motion.circle
          cx="44"
          cy="46"
          r="7"
          stroke="url(#goldGradient)"
          strokeWidth="2"
          fill="none"
          variants={{
            initial: { opacity: 0, cy: 64 },
            animate: {
              opacity: [0, 1],
              cy: [64, 46],
              transition: { duration: 0.4, delay: 0.25, ease: "easeOut" },
            },
          }}
        />
        <motion.circle
          cx="54"
          cy="40"
          r="7"
          stroke="url(#silverGradient)"
          strokeWidth="2"
          fill="none"
          variants={{
            initial: { opacity: 0, cy: 60 },
            animate: {
              opacity: [0, 1],
              cy: [60, 40],
              transition: { duration: 0.4, delay: 0.3, ease: "easeOut" },
            },
          }}
        />

        {/* ===== Rupee symbol – rises from bottom & then subtle breathing ===== */}
        <motion.text
          x="68"
          y="44"
          fontSize="10"
          fill="#EFF6FF"
          fontWeight={600}
          variants={{
            initial: { opacity: 0, y: 10 },
            animate: {
              opacity: [0, 1, 0.9, 1],
              y: [54, 44, 46, 44],
              transition: {
                duration: 1.4,
                ease: "easeOut",
                repeat: Infinity,
                repeatType: "mirror",
                delay: 0.35,
              },
            },
          }}
        >
          ₹
        </motion.text>
      </motion.svg>
    </div>
  );

  const spinner = (
    <div className="flex flex-col items-center justify-center">
      <LoaderIcon />
      {text && (
        <motion.p
          className="mt-3 text-sm text-center text-gray-600"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {text}
        </motion.p>
      )}
    </div>
  );

  if (overlay) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        {spinner}
      </div>
    );
  }

  return spinner;
};

export default LoadingSpinner;
