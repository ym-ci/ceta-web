"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";
import { MenuToggle } from "./menu-toggle";

export const navItems = [
  { href: "/", label: "CETA" },
  { href: "#info", label: "Details" },
];

function navClass(isActive: boolean) {
  return [
    "rounded-full px-5 py-2 text-sm font-medium text-slate-300 transition-all hover:bg-white/10 hover:text-white",
    isActive ? "bg-white/10 text-white" : "",
  ].join(" ");
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState("/");
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);

    handleScroll();
    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavClick = (href: string) => {
    setActive(href);
    setMobileOpen(false);
  };

  return (
    <header
      className={`fixed left-0 right-0 top-0 z-50 flex justify-center transition-all duration-300 ${
        scrolled ? "py-4" : "py-6"
      }`}
    >
      <div className="hidden md:block">
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className={`flex items-center gap-3 rounded-full border border-white/10 bg-black/20 px-4 py-2 backdrop-blur-xl transition-all duration-300 ${
            scrolled ? "bg-black/40 shadow-lg shadow-indigo-500/10" : ""
          }`}
        >
          <Link
            href="https://ymci.ca/"
            className="rounded-full px-4 py-2 text-sm font-bold text-slate-300 transition-colors hover:bg-white/20"
          >
            YMCI
          </Link>

          <nav className="flex items-center gap-3" aria-label="Main navigation">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => handleNavClick(item.href)}
                className={navClass(active === item.href)}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="mx-1 h-8 w-px bg-white/10" />

          <Link href="/live" target="_blank" className="rounded-full bg-lime-600 px-5 py-2 text-sm font-semibold text-white transition-all hover:scale-105 hover:bg-lime-500">
            Watch
          </Link>
        </motion.div>
      </div>

      <div className="absolute right-4 top-4 md:hidden">
        <motion.div initial={false} animate={mobileOpen ? "open" : "closed"}>
          <MenuToggle toggle={() => setMobileOpen((open) => !open)} />
        </motion.div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="absolute left-4 right-4 top-20 rounded-3xl border border-white/10 bg-black/70 p-4 shadow-2xl backdrop-blur-xl md:hidden"
          >
            <nav className="flex flex-col gap-2" aria-label="Mobile navigation">
              {[{ href: "https://ymci.ca/", label: "YMCI" }, ...navItems, { href: "/ceta", label: "Watch" }].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => handleNavClick(item.href)}
                  className="rounded-2xl px-4 py-3 text-sm font-semibold text-slate-200 hover:bg-white/10"
                  target={item.href === "/live" ? "_blank" : undefined}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
