import React from "react";
import { motion } from "framer-motion";
import type { HeroAnimationMode } from "../../types";

interface HeroTitleProps {
  /** Animation mode: "enter" = letters fly in, "idle" = hover glow, "exit" = letters fly out */
  Hero_animationMode: HeroAnimationMode;
  /** Custom text to display (defaults to "CASTOVERLAY") */
  text?: string;
}

const LETTER_SPACING = "0.06em";
const BASE_DELAY = 0.06;
const ENTER_DURATION = 0.55;
const EXIT_DURATION = 0.4;

/**
 * Show the CastOverlay brand name with a per-letter fly-in,
 * soft shimmer / hover glow while idle, and a fly-out on exit.
 */
export const HeroTitle: React.FC<HeroTitleProps> = ({
  Hero_animationMode,
  text = "CASTOVERLAY",
}) => {
  const letters = text.split("");

  const getLetterAnim = (index: number) => {
    if (Hero_animationMode === "enter") {
      return {
        initial: { opacity: 0, y: -60, rotateX: 90, scale: 0.6 },
        animate: {
          opacity: [0, 1, 0.95, 1],
          y: [0, -6, 0],
          rotateX: 0,
          scale: 1,
        },
        transition: {
          duration: ENTER_DURATION,
          delay: index * BASE_DELAY,
          ease: [0.34, 1.56, 0.64, 1] as const,
          times: [0, 0.5, 0.8, 1],
        },
      };
    }

    if (Hero_animationMode === "exit") {
      return {
        initial: { opacity: 1, y: 0, scale: 1 },
        animate: {
          opacity: 1,
          y: [0, 4, 80],
          rotate: [0, 3 * (index - letters.length / 2), 18],
          scale: [1, 1.05, 0.3],
        },
        transition: {
          duration: EXIT_DURATION,
          delay: index * BASE_DELAY * 0.5,
          ease: "easeIn" as const,
          times: [0, 0.3, 1],
        },
      };
    }

    // idle
    const isEven = index % 2 === 0;
    return {
      initial: { opacity: 1, y: 0, scale: 1 },
      animate: {
        y: [0, isEven ? -1.5 : 1.5, 0],
        opacity: [1, 0.92, 1],
        textShadow: [
          "0 0 0px transparent",
          "0 0 6px rgba(6,182,212,0.35)",
          "0 0 0px transparent",
        ],
      },
      transition: {
        duration: 2.8,
        repeat: Infinity,
        ease: "easeInOut" as const,
        delay: index * 0.12,
      },
    };
  };

  return (
    <h1
      className="font-extrabold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 text-sm sm:text-base inline-flex select-none"
      style={{ perspective: "600px", letterSpacing: LETTER_SPACING }}
      aria-label={text}
    >
      {letters.map((letter, i) => {
        const anim = getLetterAnim(i);
        return (
          <motion.span
            key={`${letter}-${i}-${Hero_animationMode}`}
            {...(anim as typeof anim)}
            style={{ display: "inline-block" }}
          >
            {letter}
          </motion.span>
        );
      })}
    </h1>
  );
};
