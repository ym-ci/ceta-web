"use client";

import { ArrowRight, ChevronDown } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "~/components/ui/button";

function PopIn({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay }}
    >
      {children}
    </motion.div>
  );
}

function SlideUp({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
    >
      {children}
    </motion.div>
  );
}

export default function Hero() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden pt-20">
      <div className="container relative z-10 px-4 md:px-6">
        <div className="flex flex-col items-center gap-8 text-center">
          <PopIn>
            <div className="inline-flex items-center rounded-full border px-3 py-1 text-sm font-medium backdrop-blur-md border-red-400/30 bg-red-400/10 text-zinc-200">
              <span className="mr-2 flex h-2 w-2 animate-pulse rounded-full bg-zinc-300" />
              Registration is now closed
            </div>
            {/* <div className="inline-flex items-center rounded-full border px-3 py-1 text-sm font-medium backdrop-blur-md border-blue-600/30 bg-blue-600/30 text-zinc-200">
              <span className="mr-2 flex h-2 w-2 animate-pulse rounded-full bg-zinc-300" />
              Registration is now open
            </div> */}
          </PopIn>

          <div className="space-y-4">
            <PopIn delay={0.1}>
              <h1 className="text-5xl font-extrabold tracking-tight md:text-7xl lg:text-8xl">
                <span className="bg-linear-to-b from-zinc-100 via-zinc-300 to-zinc-400 bg-clip-text text-transparent drop-shadow-[0_0_18px_rgba(255,255,255,0.10)]">
                  CETA
                </span>
                <br />
                <span className="bg-linear-to-r from-zinc-300 via-zinc-200 to-zinc-400 bg-clip-text text-transparent drop-shadow-[0_0_22px_rgba(255,255,255,0.10)]">
                  Robotics Competition
                </span>
              </h1>
            </PopIn>

            <PopIn delay={0.2}>
              <p className="mx-auto max-w-175 text-lg font-medium text-zinc-400 md:text-xl">
                Build it, code it, race it! Showcase your skills in this robotics challenge!
              </p>
            </PopIn>
          </div>

          <SlideUp delay={0.3}>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row sm:flex-wrap">
              <Link
                href="#info"
                className="inline-flex h-12 w-56 items-center justify-center rounded-full bg-white px-8 font-semibold text-black transition-all hover:scale-105 hover:bg-slate-200"
              >
                Learn More
                <ChevronDown className="ml-2 h-4 w-4" />
              </Link>
              {/* Registration link CETA */}
              <Link
                href="https://forms.gle/2Rk444EKBbCQcWdZ7"
                target="_blank"
                className="inline-flex h-12 w-56 items-center justify-center rounded-full border border-white/10 bg-white/5 px-8 font-semibold text-white backdrop-blur-sm transition-all hover:scale-105 hover:bg-white/10 hover:text-white"
              >
                Register Now
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </SlideUp>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2"
      >
        <div className="flex flex-col items-center gap-2 text-slate-500">
          <span className="text-xs uppercase tracking-widest">Scroll</span>
          <div className="h-10 w-px bg-gradient-to-b from-slate-500 to-transparent" />
        </div>
      </motion.div>
    </div>
  );
}
