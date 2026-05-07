"use client";

import { AlertCircle, ArrowRight, Calendar, Clock, DollarSign, MapPin, Video } from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { Button } from "~/components/ui/button";

type InfoCardProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
};

function InfoCard({ children, className = "", delay = 0 }: InfoCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.5, delay }}
      className={`relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-md transition-all hover:bg-white/10 md:p-8 ${className}`}
    >
      {children}
    </motion.div>
  );
}

function TextLink({ href, children }: { href: string; children: ReactNode }) {
  const isExternal = href.startsWith("http");

  return (
    <Link
      href={href}
      target={isExternal ? "_blank" : undefined}
      rel={isExternal ? "noopener noreferrer" : undefined}
      className="inline-flex items-center p-0 text-lg text-zinc-200 hover:text-white"
    >
      {children}
      <ArrowRight className="ml-2 h-5 w-5" />
    </Link>
  );
}

export default function Info() {
  return (
    <section className="container mx-auto px-4 py-24">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:grid-rows-[auto_auto_auto] lg:gap-6">
        <InfoCard className="flex min-h-[300px] flex-col justify-between md:col-span-2 md:row-span-2" delay={0.1}>
          <div>
            <div className="mb-2 inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium bg-zinc-400/10 text-zinc-200 border-zinc-400/30">
              About the Event
            </div>

            <div className="mb-4 flex flex-col gap-4">
              <div className="flex justify-center">
                <div className="relative mb-4 h-24 w-24 md:h-32 md:w-32">
                  <Image
                    src="/assets/ceta/CETA-logo-v2025-light.png"
                    alt="CETA Logo"
                    fill
                    className="object-contain"
                    priority
                  />
                </div>
              </div>

              <h2 className="text-2xl font-bold leading-tight tracking-tight text-white whitespace-nowrap sm:text-3xl md:-mt-3 md:text-5xl lg:text-6xl">
                Discover the{" "}
                <span className="bg-gradient-to-r from-zinc-400 via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
                  Challenge
                </span>
              </h2>
            </div>

            <p className="max-w-xl text-lg leading-relaxed text-slate-300">
              Get ready to put your engineering skills to the test! This robotics competition invites students from Computer Engineering and other tech programs to design and build their own autonomous line-following robot. You’ll combine mechanical know-how, electrical design, and programming skills to create a robot that can sense its environment and navigate challenges with precision. Strong communication and teamwork are a must as you bring your ideas to life. The competition is open to all experience levels, whether you’re a beginner or a seasoned builder! Come showcase your creativity, problem-solving, and passion for robotics!
            </p>
          </div>

          <div className="mt-7">    
            <Link href="https://drive.google.com/file/d/1_ZirhW0QXu0W5Kt_R5A0C5A5oYDiESAW/view?usp=sharing" target="_blank"
              className="group inline-flex w-fit items-center gap-2 rounded-md bg-white px-5 py-3 text-base font-semibold text-black transition hover:bg-zinc-200 underline">
              Read more in the official documentation
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </InfoCard>

        <InfoCard className="md:col-span-1" delay={0.2}>
          <div className="flex h-full flex-col justify-center gap-6">
            <div className="flex items-center gap-4">
              <div className="rounded-2xl bg-purple-500/20 p-3 text-purple-400 ring-1 ring-purple-500/30">
                <Calendar className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Date</h3>
                <p className="text-slate-400">May 6th, 2026</p>
              </div>
            </div>

            <div className="h-px w-full bg-white/5" />

            <div className="flex items-center gap-4">
              <div className="rounded-2xl bg-pink-500/20 p-3 text-pink-400 ring-1 ring-pink-500/30">
                <Clock className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Time</h3>
                <p className="text-slate-400">8:15 AM - 3:15 PM</p>
                <p className="text-xs text-slate-500">Arrive by 8:15 AM</p>
              </div>
            </div>

            <div className="h-px w-full bg-white/5" />

            <div className="flex items-center gap-4">
              <div className="rounded-2xl bg-yellow-500/20 p-3 text-yellow-400 ring-1 ring-yellow-500/30">
                <DollarSign className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Price</h3>
                <p className="text-slate-400">$40 per team</p>
              </div>
            </div>
          </div>
        </InfoCard>

        <InfoCard className="md:col-span-1" delay={0.3}>
          <div className="flex h-full flex-col justify-center gap-6">
            <div className="flex items-center gap-4">
              <div className="rounded-2xl bg-emerald-500/20 p-3 text-emerald-400 ring-1 ring-emerald-500/30">
                <MapPin className="h-6 w-6" />
              </div>
              <div className="mt-5">  
                <h3 className="text-lg font-semibold text-white">Location</h3>
                <p className="text-slate-400">490 York Mills Rd, North York, ON M3B 1W6 - Exit #8 - Double Gym</p>
                <Link
                  href="https://drive.google.com/file/d/1GIbBJrXvU30nxl0EKxTppqx6k9XW4N0W/view?usp=sharing"
                  target="_blank"
                  className="group mt-6 inline-flex w-fit items-center gap-3 rounded-md bg-white px-5 py-3 text-base font-semibold text-black underline decoration-black/40 underline-offset-4 transition hover:bg-zinc-200 hover:decoration-black"
                >
                  See parking info here
                  <ArrowRight className="h-5 w-5 shrink-0 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </div>

            <div className="h-px w-full bg-white/5" />

            <div className="flex items-center gap-4">
              <div className="rounded-2xl bg-lime-500/20 p-3 text-lime-400 ring-1 ring-lime-500/30">
                <Video className="h-6 w-6" />
              </div>
              <div>  
                <h3 className="text-lg font-semibold text-white">Live Stream & Scores</h3>
                <Link
                  href="/live"
                  className="group mt-5 inline-flex w-fit items-center gap-3 rounded-md bg-white px-5 py-3 text-base font-semibold text-black underline decoration-black/40 underline-offset-4 transition hover:bg-zinc-200 hover:decoration-black"
                >
                  Watch now!
                  <ArrowRight className="h-5 w-5 shrink-0 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </div>
          </div>
        </InfoCard>
        {/* Registration CETA */}
        <InfoCard
          className="md:col-span-3 border-zinc-400/20 bg-gradient-to-r from-zinc-900/70 via-neutral-900/70 to-black/70"
          delay={0.4}
        >
          <div className="flex flex-col items-center justify-between gap-8 md:flex-row">
            <div className="flex flex-col items-center gap-5 md:flex-row">
              <div className="hidden rounded-2xl bg-white/10 p-4 text-zinc-200 ring-1 ring-white/20 md:flex">
                <AlertCircle className="h-8 w-8" />
              </div>

              <div className="text-center md:text-left">
                <h3 className="mb-2 text-2xl font-bold text-white">
                  Registration Deadline Approaching
                </h3>

                <p className="text-slate-300">
                  Sign up before{" "}
                  <span className="font-semibold text-white">April 22nd, 2026</span>{" "}
                  to secure your spot.
                </p>
              </div>
            </div>

            <Link
              href="https://forms.gle/Qi6wvBmajwB5B1J56"
              target="_blank"
              className="group inline-flex w-full items-center justify-center gap-3 rounded-md bg-white px-5 py-3 text-base font-semibold text-black decoration-black/40 underline-offset-4 transition hover:bg-zinc-200 hover:decoration-black md:w-fit"
            >
              Register Now
              <ArrowRight className="h-5 w-5 shrink-0 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </InfoCard>
      </div>
    </section>
  );
}
