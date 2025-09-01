import React, { useEffect, useRef, useState, useMemo } from "react";
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
  useSpring,
} from "framer-motion";
import { createPortal } from "react-dom";
import { ArrowUpRight, Menu, X } from "lucide-react";

/* ---------- Palette ---------- */
const palette = {
  bg: "#E8E4E2",
  ink: "#161616",
  mute: "#7E7E7E",
  card: "#FFFFFF",
  blue: "#0A3CC2",
  dark: "#1E1E1E",
};

/* ---------- Portal ---------- */
const Portal: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return createPortal(children, document.body);
};

/* ---------- Navigation ---------- */
type InternalItem = {
  type: "section";
  text: string;
  sectionId: "home" | "about" | "services" | "contact";
};
type ExternalItem = { type: "external"; text: string; href: string };
type NavItem = InternalItem | ExternalItem;

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [dims, setDims] = useState({ w: 420, h: 380 });

  const navItems: NavItem[] = [
    { type: "section", text: "Home", sectionId: "home" },
    { type: "section", text: "About", sectionId: "about" },
    { type: "section", text: "Services", sectionId: "services" },
    { type: "section", text: "Contacts", sectionId: "contact" },
    { type: "external", text: "instagram", href: "https://instagram.com" },
  ];

  const close = () => setIsMenuOpen(false);
  const toggle = () => setIsMenuOpen((v) => !v);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey, { passive: true });
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    const calc = () => {
      const isMobile = window.innerWidth < 768;
      const w = isMobile ? Math.min(window.innerWidth - 96, 320) : 420;
      const h = isMobile ? Math.min(window.innerHeight * 0.7, 420) : 380;
      setDims({ w, h });
    };
    calc();
    window.addEventListener("resize", calc, { passive: true });
    return () => window.removeEventListener("resize", calc);
  }, []);

  const scrollToSection = (id: InternalItem["sectionId"]) => {
    close();
    setTimeout(() => {
      const sectionOrder: InternalItem["sectionId"][] = ["home", "services", "about", "contact"];
      const idx = sectionOrder.indexOf(id);
      if (idx < 0) return;

      const root = document.getElementById("stackRoot");
      if (!root) {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
        return;
      }

      const rootTop = (window.scrollY || window.pageYOffset) + root.getBoundingClientRect().top;
      const vh = window.visualViewport?.height ?? window.innerHeight;

      let target = Math.round(rootTop + idx * vh);
      const max = Math.max(0, document.documentElement.scrollHeight - vh);
      target = Math.min(Math.max(target, 0), max);

      window.scrollTo({ top: target, behavior: "smooth" });

      try {
        history.replaceState(null, "", `#${id}`);
      } catch {}
    }, 80);
  };

  return (
    <>
      <div
        className="fixed z-50"
        style={{
          top: "calc(env(safe-area-inset-top) + 14px)",
          left: "1.5rem",
        }}
      >
        <button
          onPointerUp={toggle}
          aria-expanded={isMenuOpen}
          aria-controls="nav-panel"
          className={`flex items-center gap-3 px-6 py-3 rounded-full transition-all duration-300 ${
            isMenuOpen
              ? "opacity-0 pointer-events-none"
              : "bg-neutral-900 text-white hover:scale-105 hover:brightness-110"
          }`}
          style={{ WebkitTapHighlightColor: "transparent" }}
        >
          <span className="uppercase text-[11px] tracking-[0.4em] leading-none">menu</span>
          <span className="inline-flex">
            <Menu size={20} strokeWidth={2} />
          </span>
        </button>
      </div>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            key="nav-panel"
            id="nav-panel"
            role="dialog"
            aria-modal="true"
            className="fixed z-50"
            style={{
              top: "calc(env(safe-area-inset-top) + 12px)",
              left: "1.5rem",
              WebkitBackfaceVisibility: "hidden",
              backfaceVisibility: "hidden",
              WebkitTapHighlightColor: "transparent",
            }}
            initial={{ width: 56, height: 48, borderRadius: 9999, opacity: 0.98 }}
            animate={{ width: dims.w, height: dims.h, borderRadius: 24, opacity: 1 }}
            exit={{ width: 56, height: 48, borderRadius: 9999, opacity: 0 }}
            transition={{ type: "spring", stiffness: 240, damping: 26 }}
          >
            <div
              className="relative shadow-xl rounded-3xl overflow-hidden h-full w-full"
              style={{ background: palette.blue, color: "#fff" }}
            >
              <div
                className="px-5 py-4"
                style={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}
              >
                <div className="flex justify-between items-center">
                  <span className="uppercase text-[11px] tracking-[0.4em] leading-none">close</span>
                  <button
                    type="button"
                    onPointerUp={close}
                    aria-label="Close menu"
                    className="inline-flex items-center justify-center rounded-full"
                    style={{ WebkitTapHighlightColor: "transparent" }}
                  >
                    <X size={18} strokeWidth={2} />
                  </button>
                </div>
              </div>

              <nav className="h-[calc(100%-56px)] overflow-auto">
                <ul className="px-5 pb-4">
                  {navItems.map((item, i) => (
                    <motion.li
                      key={`${item.type}-${item.text}`}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.05 * i, duration: 0.3, ease: "easeOut" }}
                      className="border-b border-white/15 last:border-b-0"
                    >
                      {item.type === "external" ? (
                        <a
                          href={(item as ExternalItem).href}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={close}
                          className="flex items-center justify-between py-4 group"
                          style={{ WebkitTapHighlightColor: "transparent" }}
                        >
                          <span className="text-lg md:text-xl font-semibold tracking-wide">
                            {item.text}
                          </span>
                          <span className="text-xs uppercase tracking-[0.3em] opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                            go
                          </span>
                        </a>
                      ) : (
                        <button
                          type="button"
                          onPointerUp={() => scrollToSection((item as InternalItem).sectionId)}
                          className="w-full text-left flex items-center justify-between py-4 group"
                          style={{ WebkitTapHighlightColor: "transparent" }}
                        >
                          <span className="text-lg md:text-xl font-semibold tracking-wide">
                            {item.text}
                          </span>
                          <span className="text-xs uppercase tracking-[0.3em] opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                            go
                          </span>
                        </button>
                      )}
                    </motion.li>
                  ))}
                </ul>
              </nav>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

/* ---------- Detect iOS ---------- */
const useIsIOS = () => {
  const [isIOS, setIsIOS] = React.useState(false);
  React.useEffect(() => {
    const userAgent = navigator.userAgent || '';
    const platform = navigator.platform || '';
    const isIOSDevice =
      (/iPad|iPhone|iPod/.test(userAgent) || /iPad|iPhone|iPod/.test(platform)) &&
      !/Windows Phone|WinCE/.test(userAgent);
    setIsIOS(isIOSDevice);
  }, []);
  return isIOS;
};

/* ---------- Scene Stack (с фиксами) ---------- */
const useIsMobile = () => {
  const [m, setM] = React.useState(false);
  React.useEffect(() => {
    const mq = window.matchMedia?.("(max-width: 768px)");
    const on = () => setM(!!mq?.matches);
    on();
    mq?.addEventListener?.("change", on);
    return () => mq?.removeEventListener?.("change", on);
  }, []);
  return m;
};

export const SceneStack: React.FC<{ ids: string[]; children: React.ReactNode[] }> = ({
  ids,
  children,
}) => {
  const isMobile = useIsMobile();
  const isIOS = useIsIOS();
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const updateHeight = () => {
      if (containerRef.current) {
        const vh = window.visualViewport?.height ?? window.innerHeight;
        const totalH = children.length * vh;
        containerRef.current.style.height = `${totalH}px`;
      }
    };
    updateHeight();
    window.addEventListener('resize', updateHeight, { passive: true });
    window.visualViewport?.addEventListener?.('resize', updateHeight, { passive: true });
    return () => {
      window.removeEventListener('resize', updateHeight);
      window.visualViewport?.removeEventListener?.('resize', updateHeight);
    };
  }, [children.length]);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const smooth = useSpring(scrollYProgress, {
    stiffness: 160,
    damping: 48, // Увеличено для более плавной прокрутки
    mass: 0.6,
  });

  const count = children.length;

  return (
    <div
      id="stackRoot"
      ref={containerRef}
      className="relative"
      style={{ background: palette.bg, overflow: "hidden" }}
    >
      {children.map((child, i) => {
        const start = i / count;
        const end = (i + 1) / count;
        const isLast = i === count - 1;

        const baseIn = isMobile ? 0.1 : 0.12;
        const baseOut = isMobile ? 0.1 : 0.12;
        const heroIn = isMobile ? 0.16 : 0.2;
        const heroOut = isMobile ? 0.16 : 0.2;

        const fadeIn = i === 0 ? heroIn : baseIn;
        const fadeOut = i === 0 ? heroOut : baseOut;

        const opacity =
          i === 0
            ? useTransform(smooth, [start, end - fadeOut, end], [1, 1, 0])
            : isLast
            ? useTransform(smooth, [start, Math.min(end, start + fadeIn), 1], [0, 1, 1])
            : useTransform(smooth, [start, start + fadeIn, end - fadeOut, end], [0, 1, 1, 0]);

        const delta = isIOS ? 0 : (isMobile ? 6 : 10);
        const y =
          i === 0
            ? useTransform(smooth, [start, end], [0, -delta])
            : useTransform(smooth, [start, end], [delta, isLast ? 0 : -delta]);

        const z = count - i;

        if (isLast) {
          return (
            <section
              key={ids[i]}
              id={ids[i]}
              className="relative min-h-[100dvh] flex items-stretch"
              style={{ zIndex: z, background: palette.dark }}
            >
              <motion.div
                style={{
                  opacity,
                  y,
                  willChange: "opacity, transform",
                  WebkitBackfaceVisibility: "hidden",
                  backfaceVisibility: "hidden",
                }}
                className="w-full"
              >
                {child}
              </motion.div>
            </section>
          );
        }

        return (
          <section
            key={ids[i]}
            id={ids[i]}
            className="sticky top-0 h-[100dvh] flex items-center"
            style={{ zIndex: z, background: palette.bg }}
          >
            <motion.div
              style={{
                opacity,
                y,
                willChange: "opacity, transform",
                WebkitBackfaceVisibility: "hidden",
                backfaceVisibility: "hidden",
              }}
              className="w-full h-full flex items-center"
            >
              <div className="w-full">{child}</div>
            </motion.div>
          </section>
        );
      })}
    </div>
  );
};

/* ---------- Reusable tiles ---------- */
const Tile = ({ children, className = "", onClick }: any) => (
  <motion.div
    whileHover={{ y: -3 }}
    whileTap={{ scale: 0.99 }}
    className={`rounded-3xl bg-white/95 border border-black/5 ${className}`}
    onClick={onClick}
  >
    {children}
  </motion.div>
);

/* ------ ReadyTile ------ */
const ReadyTile = () => (
  <Tile className="h-full p-6 md:p-8 flex flex-col justify-between min-h-0">
    <div className="space-y-2">
      <p className="uppercase tracking-[0.2em] text-xs text-neutral-500">READY</p>
      <h3 className="text-2xl md:text-3xl font-medium" style={{ color: palette.ink }}>
        TO WORK
      </h3>
    </div>
    <div className="flex items-center justify-between">
      <motion.a
        href="#contact"
        onClick={(e) => {
          e.preventDefault();
          document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
        }}
        className="text-base md:text-lg font-medium hover:underline"
        style={{ color: palette.blue }}
        whileHover={{ x: 3 }}
      >
        WE TOO
      </motion.a>
      <motion.div
        initial={false}
        whileHover={{ rotate: 45 }}
        transition={{ type: "spring", stiffness: 200, damping: 12 }}
        className="rounded-2xl border border-black/10 p-3"
      >
        <ArrowUpRight />
      </motion.div>
    </div>
  </Tile>
);

const gradient = (i: number) =>
  `radial-gradient(1100px 540px at ${20 + (i % 5) * 18}% ${
    30 + ((i + 2) % 5) * 12
  }%, rgba(10,60,194,0.2), transparent 60%), linear-gradient(135deg, #ffffff, #f6f7fb)`;

/* ---------- Footer ---------- */
const CTAButton: React.FC = () => {
  const [active, setActive] = React.useState(false);
  return (
    <motion.a
      href="#contact"
      onClick={(e) => {
        e.preventDefault();
        document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
      }}
      className="relative inline-block isolate focus:outline-none"
      initial={false}
      animate={active ? "hover" : "rest"}
      whileTap={{ scale: 0.98 }}
      onMouseEnter={() => setActive(true)}
      onMouseLeave={() => setActive(false)}
      onPointerDown={() => setActive(true)}
      onPointerUp={() => setActive(false)}
      onPointerCancel={() => setActive(false)}
      onPointerLeave={() => setActive(false)}
      onFocus={() => setActive(true)}
      onBlur={() => setActive(false)}
      role="button"
      tabIndex={0}
      style={{ WebkitTapHighlightColor: "transparent", touchAction: "manipulation" }}
      variants={{ rest: {}, hover: {} }}
    >
      <motion.div
        className="relative z-10 px-8 sm:px-10 md:px-12 py-5 sm:py-5 md:py-6 border border-white/80 text-[10px] sm:text-[11px] font-medium tracking-[0.35em] sm:tracking-[0.4em] uppercase overflow-hidden"
        variants={{ rest: {}, hover: {} }}
      >
        <motion.span
          className="relative z-20"
          variants={{ rest: { color: "#FFFFFF" }, hover: { color: "#000000" } }}
          transition={{ duration: 0.35, ease: "easeOut" }}
        >
          Start Project
        </motion.span>
        <motion.span
          className="absolute inset-0 z-10 pointer-events-none"
          style={{ background: "#FFFFFF" }}
          variants={{ rest: { x: "-100%" }, hover: { x: "0%" } }}
          transition={{ duration: 0.35, ease: "easeOut" }}
        />
      </motion.div>
      <motion.span
        className="absolute inset-0 -z-10"
        style={{ background: "#FFFFFF" }}
        variants={{ rest: { scale: 0, opacity: 0 }, hover: { scale: 1, opacity: 0.15 } }}
        transition={{ duration: 0.25, ease: "easeOut" }}
      />
    </motion.a>
  );
};

export const FooterQuad = () => {
  const services = ["Complete Website", "UI/UX Design", "iOS Development", "Web Development"];
  const reveal = (delay = 0) => ({
    initial: { opacity: 0, y: 24 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.2, margin: "0px 0px -8% 0px" },
    transition: { duration: 0.7, ease: "easeOut" as const, delay },
  });
  return (
    <section
      id="contact"
      className="relative min-h-[100dvh] flex items-stretch overflow-hidden"
      style={{ background: palette.dark, color: "#FFF", paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="absolute inset-0 pointer-events-none select-none overflow-hidden opacity-5">
        <div className="absolute left-0 w-full h-full top-[8vh] sm:top-0">
          <div
            className="flex space-x-8"
            style={{ animation: "scroll-horizontal 80s linear infinite", width: "calc(400% + 128px)" }}
          >
            {Array(4)
              .fill("DESIGN BUREAU")
              .map((text, i) => (
                <span
                  key={i}
                  className="font-black whitespace-nowrap text-[clamp(3.5rem,18vw,6rem)] sm:text-[clamp(6rem,16vw,18rem)]"
                >
                  {text}
                </span>
              ))}
          </div>
        </div>
      </div>

      <div className="relative max-w-[1400px] mx-auto w-full px-4 sm:px-6 md:px-10 sm:py-14 md:py-16 flex flex-col justify-between min-h-[100dvh]">
        <div className="text-center mb-8 sm:mb-14 md:mb-16">
          <motion.h2
            {...reveal(0.1)}
            className="font-black leading-[0.9] mb-5 sm:mb-8 md:mb-10"
            style={{ fontSize: "clamp(3rem, 12vw, 9rem)" }}
          >
            <span className="block">Ready to work</span>
            <span className="block" style={{ color: palette.blue }}>
              with me?
            </span>
          </motion.h2>

          <motion.div {...reveal(0.22)} className="inline-block mt-1 sm:mt-0">
            <CTAButton />
          </motion.div>
        </div>

        <motion.div {...reveal(0.3)} className="text-center mb-6 sm:mb-12 md:mb-14">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6 md:gap-8 text-[10px] sm:text-xs font-medium tracking-[0.25em] sm:tracking-[0.3em] uppercase">
            {services.map((service, index) => (
              <motion.div
                key={service}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.18 }}
                transition={{ duration: 0.55, ease: "easeOut", delay: 0.38 + index * 0.06 }}
                className="group cursor-default"
              >
                <span className="relative">
                  {service}
                  <span className="absolute -bottom-1.5 left-0 w-full h-px bg-white/90 scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></span>
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          {...reveal(0.5)}
          className="pt-5 sm:pt-8 md:pt-10 border-t border-white/15 flex flex-col md:flex-row items-center justify-between gap-2 sm:gap-4"
        >
          <div className="uppercase text-[10px] sm:text-[11px] font-medium tracking-[0.32em] sm:tracking-[0.38em]">
            © {new Date().getFullYear()} DIGITAL FORGE
          </div>
          <nav className="flex items-center gap-5 sm:gap-8">
            {["Privacy", "Terms", "Instagram"].map((v) => (
              <a
                key={v}
                href="#"
                className="uppercase text-[10px] sm:text-[11px] font-medium tracking-[0.28em] sm:tracking-[0.32em] hover:opacity-100 opacity-90 transition-opacity"
              >
                {v}
              </a>
            ))}
          </nav>
        </motion.div>
      </div>
    </section>
  );
};

/* ---------- AwardsButton ---------- */
const useIsTouch = () => {
  const [isTouch, setIsTouch] = useState(false);
  useEffect(() => {
    const coarse = window.matchMedia?.("(pointer: coarse)")?.matches;
    const hasTouch =
      "ontouchstart" in window ||
      navigator.maxTouchPoints > 0 ||
      !!coarse;
    setIsTouch(!!hasTouch);
  }, []);
  return isTouch;
};

const AwardsButton: React.FC = () => {
  const [open, setOpen] = useState(false);
  const isTouch = useIsTouch();
  const rootRef = useRef<HTMLDivElement | null>(null);

  const dots = useMemo(
    () =>
      Array.from({ length: 6 }).map(() => ({
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
      })),
    []
  );

  useEffect(() => {
    const onDown = (e: PointerEvent) => {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onDown, { passive: true });
    return () => document.removeEventListener("pointerdown", onDown);
  }, []);

  const awards = [
    "Discovery & Scope",
    "UX Mapping",
    "Design Concepts",
    "Build & Integrations",
    "QA & Launch",
    "Support & Iteration",
  ];

  return (
    <div
      ref={rootRef}
      className="fixed z-50"
      style={{ right: "1.5rem", bottom: "calc(env(safe-area-inset-bottom) + 1.25rem)" }}
    >
      <button
        type="button"
        aria-expanded={open}
        aria-controls="process-list"
        onPointerDown={(e) => {
          if (isTouch) {
            e.preventDefault();
            setOpen((v) => !v);
          }
        }}
        onClick={() => {
          if (!isTouch) setOpen((v) => !v);
        }}
        {...(!isTouch
          ? {
              onMouseEnter: () => setOpen(true),
              onMouseLeave: () => setOpen(false),
            }
          : {})}
        className="group relative outline-none"
        style={{ WebkitTapHighlightColor: "transparent", touchAction: "manipulation" }}
      >
        <div
          className="
            relative z-10 w-16 h-16 rounded-full
            flex items-center justify-center
            font-black text-[10px] tracking-wider
            overflow-hidden transition-all duration-500
            group-hover:scale-110 text-white
          "
          style={{ background: palette.blue }}
        >
          <span className="relative z-10 transition-transform duration-300 group-hover:rotate-12">
            PROCESS
          </span>
          <div className="absolute inset-0 bg-white transform scale-0 group-hover:scale-100 transition-transform duration-300 rounded-full mix-blend-screen" />
        </div>

        <div
          id="process-list"
          className={`absolute bottom-20 right-0 space-y-2 transition-all duration-500 ${
            open ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 translate-y-2 pointer-events-none"
          }`}
        >
          {awards.map((award, i) => (
            <div
              key={award}
              className="
                px-4 py-2 text-xs font-medium tracking-[0.2em] uppercase whitespace-nowrap
                border rounded-xl bg-white/95 text-neutral-900 border-black/10
                backdrop-blur-sm shadow-sm
              "
              style={{
                transform: open ? "translateX(0)" : "translateX(16px)",
                transition: `transform 360ms cubic-bezier(0.4,0,0.2,1) ${i * 50}ms, opacity 360ms`,
              }}
            >
              {award}
            </div>
          ))}
        </div>

        <div className="absolute inset-0 pointer-events-none">
          {dots.map((pos, i) => (
            <div
              key={i}
              className={`absolute w-1 h-1 rounded-full transition-opacity duration-500 ${
                open ? "opacity-100" : "opacity-0"
              }`}
              style={{
                ...pos,
                background: palette.blue,
                animation: open ? `floatUp 2s ease-in-out ${i * 0.15}s infinite` : "none",
              }}
            />
          ))}
        </div>
      </button>

      <style>{`
        @keyframes floatUp {
          0%, 100% { transform: translateY(0) scale(1); opacity: 0.8; }
          50% { transform: translateY(-10px) scale(1.15); opacity: 1; }
      `}</style>
    </div>
  );
};

/* ---------- App ---------- */
export default function App() {
  useEffect(() => {
    document.documentElement.style.scrollBehavior = "smooth";

    // Динамическое обновление theme-color
    const updateThemeColor = () => {
      const scrollY = window.scrollY || window.pageYOffset;
      const vh = window.visualViewport?.height ?? window.innerHeight;
      const footer = document.getElementById("contact");
      if (!footer) return;

      const footerTop = footer.getBoundingClientRect().top + scrollY;
      const meta = document.querySelector('meta[name="theme-color"]');
      if (meta) {
        meta.setAttribute("content", scrollY >= footerTop - vh / 2 ? palette.dark : palette.bg);
      }
    };

    updateThemeColor();
    window.addEventListener("scroll", updateThemeColor, { passive: true });
    window.visualViewport?.addEventListener?.("resize", updateThemeColor, { passive: true });
    return () => {
      window.removeEventListener("scroll", updateThemeColor);
      window.visualViewport?.removeEventListener?.("resize", updateThemeColor);
    };
  }, []);

  const Hero = (
    <div className="px-4 md:px-8 w-full hero-safe" id="home">
      <motion.div
        initial="hidden"
        animate="show"
        variants={{
          hidden: { opacity: 1 },
          show: {
            opacity: 1,
            transition: { staggerChildren: 0.08, delayChildren: 0.08 },
          },
        }}
        className="grid grid-cols-12 md:grid-rows-2 gap-3 md:gap-5 max-w-[1600px] mx-auto md:h-[78vh]"
      >
        <Tile className="col-span-12 md:col-span-8 md:row-span-1 aspect-[2/1] md:aspect-auto md:h-full p-6 md:p-10 flex items-end">
          <motion.h1
            variants={{
              hidden: { opacity: 0, y: 14 },
              show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
            }}
            className="text-[10vw] md:text-[5.6vw] leading-[0.95] font-medium tracking-tight"
          >
            We create <span style={{ color: palette.blue }}>award</span> winning sites
          </motion.h1>
        </Tile>

        <motion.div
          variants={{
            hidden: { opacity: 0, y: 18 },
            show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
          }}
          className="col-span-6 md:col-span-4 md:row-span-2"
        >
          <Tile className="aspect-square md:aspect-auto md:h-full overflow-hidden">
            <div className="relative w-full h-full rounded-3xl" style={{ background: palette.blue }}>
              <span className="logoMark-vertical absolute font-medium text-white/95 select-none">
                DigitalForge®
              </span>
              <span className="logoMark-mobile absolute font-medium text-white/95 select-none">
                <span className="block">Digital</span>
                <span className="block">Forge®</span>
              </span>
            </div>
          </Tile>
        </motion.div>

        <motion.div
          variants={{
            hidden: { opacity: 0, y: 18 },
            show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
          }}
          className="col-span-6 md:col-span-3 md:row-span-1"
        >
          <ReadyTile />
        </motion.div>

        <motion.div
          variants={{
            hidden: { opacity: 0, y: 18 },
            show: { opacity: 1, y: 0, transition: { duration: 0.65, ease: "easeOut" } },
          }}
          className="col-span-12 md:col-span-5 md:row-span-1"
        >
          <Tile className="aspect-[16/10] md:aspect-auto md:h-full overflow-hidden">
            <motion.div
              initial={{ x: 24, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.7, ease: [0.19, 1, 0.22, 1], delay: 0.06 }}
              className="h-full w-full grid grid-cols-8 gap-2 p-2"
            >
              {Array.from({ length: 16 }).map((_, idx) => (
                <div key={idx} className="rounded-lg" style={{ background: gradient(idx) }} />
              ))}
            </motion.div>
          </Tile>
        </motion.div>
      </motion.div>

      <style>{`
        .logoMark-vertical {
          display: block;
          writing-mode: vertical-rl;
          text-orientation: mixed;
          right: 0.75rem;
          bottom: 0.75rem;
          font-size: clamp(40px, 8vw, 96px);
          line-height: 1;
          letter-spacing: -0.01em;
          white-space: nowrap;
        }
        .logoMark-mobile { display: none; }
        @media (max-width: 640px) {
          .logoMark-vertical { display: none; }
          .logoMark-mobile {
            display: block;
            left: 0.5rem;
            bottom: 0.5rem;
            text-align: left;
            line-height: 0.9;
            letter-spacing: -0.01em;
            font-size: clamp(24px, 11vw, 44px);
          }
        }
        @media (max-width: 360px) {
          .logoMark-mobile {
            left: 0.4rem;
            bottom: 0.4rem;
            font-size: clamp(20px, 12vw, 38px);
          }
        }
      `}</style>
    </div>
  );

  const Services = (
    <div className="px-4 md:px-8 w-full" id="services">
      <div className="relative max-w-[1600px] mx-auto w-full">
        <div className="grid grid-cols-2 grid-rows-2 min-h-[70svh] md:min-h-[80svh]">
          {[
            {
              title: "COMPLETE\nWEBSITE",
              sub: "MOODBOARD / WIREFRAMING / CONCEPTS IN ANIMATION / DESIGN / DEVELOPMENT",
            },
            { title: "UI\nDESIGN", sub: "MOODBOARD / DESIGN CONCEPTS / ANIMATION / WEBDESIGN" },
            { title: "UX\nDESIGN", sub: "WIREFRAMING / UX RESEARCH / WEBSITE AUDIT", accent: true },
            { title: "WEB\nDEVELOPMENT", sub: "DEVELOPMENT / WEBFLOW / E-COMMERCE" },
          ].map((s, i) => (
            <div key={i} className="relative flex items-center justify-center border border-black/10">
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: false, amount: 0.6 }}
                transition={{ duration: 0.6, delay: i * 0.05 }}
                className="text-center px-6 md:px-12"
              >
                <h3
                  className="whitespace-pre-line text-2xl md:text-4xl lg:text-5xl font-medium tracking-tight"
                  style={{ color: s.accent ? palette.blue : palette.ink }}
                >
                  {s.title}
                </h3>
                <p className="mt-3 md:mt-4 text-xs md:text-sm text-neutral-500 max-w-[40ch] mx-auto leading-relaxed">
                  {s.sub}
                </p>
              </motion.div>
            </div>
          ))}
        </div>

        <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <motion.div
            initial={{ scale: 0.6, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 100, damping: 12 }}
            style={{ background: palette.blue }}
            className="w-6 h-6 md:w-8 md:h-8 rounded-full shadow-[0_10px_30px_rgba(10,60,194,0.45)]"
          />
        </div>
      </div>
    </div>
  );

  const WhatWeDo = (
    <section id="about" className="relative overflow-x-hidden" style={{ color: palette.ink, background: palette.bg }}>
      <div className="absolute inset-0 pointer-events-none select-none opacity-5">
        <div className="absolute top-1/2 left-0 w-full -translate-y-1/2">
          <div
            className="flex space-x-16"
            style={{ animation: "scroll-horizontal 100s linear infinite", width: "calc(300% + 128px)" }}
          >
            {Array(3)
              .fill("CREATIVE DIGITAL EXPERIENCES")
              .map((text, index) => (
                <span key={index} className="text-[clamp(4rem,15vw,15rem)] font-black whitespace-nowrap">
                  {text}
                </span>
              ))}
          </div>
        </div>
      </div>

      <div className="relative px-4 md:px-8 w-full">
        <div className="max-w-[1600px] mx-auto">
          <div className="text-center pt-16 md:pt-24 mb-16 md:mb-20">
            <motion.h2
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25, margin: "0px 0px -10% 0px" }}
              transition={{ duration: 0.9, ease: "easeOut", delay: 0.1 }}
              className="text-[clamp(2rem,8vw,8rem)] font-black leading-[0.8] mb-10"
            >
              What I do
            </motion.h2>

            <motion.div
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25, margin: "0px 0px -10% 0px" }}
              transition={{ duration: 0.9, ease: "easeOut", delay: 0.25 }}
              className="w-24 h-px bg-current mx-auto mb-10"
            />

            <motion.p
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25, margin: "0px 0px -10% 0px" }}
              transition={{ duration: 0.9, ease: "easeOut", delay: 0.4 }}
              className="text-[clamp(1.2rem,3.8vw,2.2rem)] font-medium leading-tight max-w-5xl mx-auto text-neutral-800"
            >
              My goal is to transform your idea into a product where design meets effortless experience.
            </motion.p>
          </div>

          <div className="grid grid-cols-12 gap-4 items-stretch">
            <div className="col-span-12 lg:col-span-4">
              <Tile className="p-8 md:p-12 h-full flex flex-col justify-between">
                <div>
                  <p className="uppercase tracking-[0.2em] text-xs text-neutral-500">What We Do</p>
                  <h3 className="text-4xl md:text-5xl mt-3 font-medium">We make brands move.</h3>
                </div>
                <p className="text-neutral-600 mt-6 leading-relaxed max-w-prose">
                  Strategy → Visual identity → Web experiences. We combine design and engineering to ship fast, award-ready sites with measurable impact.
                </p>
              </Tile>
            </div>

            <div className="col-span-12 lg:col-span-8 grid grid-cols-2 gap-4">
              {[
                { h: "Design Systems", p: "Scalable UI kits and typography tuned for performance and craft." },
                { h: "Motion & Interactions", p: "Framer-Motion driven microinteractions, scroll scenes, and reveals." },
                { h: "Webflow / React", p: "Marketing sites or headless builds—SEO-ready, CMS-driven." },
                { h: "Perf & Accessibility", p: "Ship light, score high. Built to be beautiful and usable for all." },
              ].map((card, i) => (
                <motion.div
                  key={card.h}
                  initial={{ y: 10, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  viewport={{ once: false, amount: 0.5 }}
                  transition={{ delay: i * 0.05 }}
                  className="rounded-3xl border border-black/5 bg-white p-6 md:p-8"
                >
                  <h4 className="text-xl md:text-2xl font-medium mb-2" style={{ color: palette.ink }}>
                    {card.h}
                  </h4>
                  <p className="text-sm md:text-base text-neutral-600 leading-relaxed">{card.p}</p>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="text-center mt-16 md:mt-24 mb-16 md:mb-24">
            <motion.blockquote
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25, margin: "0px 0px -10% 0px" }}
              transition={{ duration: 0.9, ease: "easeOut", delay: 0.2 }}
              className="text-[clamp(1.1rem,3vw,2rem)] font-medium leading-relaxed max-w-4xl mx-auto italic text-neutral-800"
            >
              “Every detail is intentional, every motion is meaningful, every click leads somewhere.”
            </motion.blockquote>

            <motion.div
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25, margin: "0px 0px -10% 0px" }}
              transition={{ duration: 0.9, ease: "easeOut", delay: 0.35 }}
              className="mt-6 text-xs font-medium tracking-[0.3em] uppercase opacity-60"
            >
              — NOTE HERE
            </motion.div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes scroll-horizontal {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.333%); }
        }
      `}</style>
    </section>
  );

  return (
    <div style={{ background: palette.bg, color: palette.ink }} className="relative min-h-[100dvh]">
      <Portal><Navigation /></Portal>
      <SceneStack ids={["home", "services", "about", "contact"]}>
        {[Hero, Services, WhatWeDo, <FooterQuad key="f" />] as any}
      </SceneStack>
      <Portal><AwardsButton /></Portal>
      <style>{`
        html, body, #root {
          background: ${palette.bg} !important;
          height: 100%;
          min-height: -webkit-fill-available;
          overscroll-behavior: none;
        }
        body {
          overscroll-behavior-y: none;
          margin: 0;
        }
        * {
          -webkit-tap-highlight-color: transparent;
        }
        .hero-safe {
          padding-top: calc(env(safe-area-inset-top) + 72px);
        }
        @media (min-width: 768px) {
          .hero-safe {
            padding-top: 32px;
          }
        }
      `}</style>
    </div>
  );
}