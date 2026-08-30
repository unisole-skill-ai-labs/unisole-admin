import React from "react";
import {
  Sparkles,
  Users,
  Trophy,
  Flame,
  CheckCircle2,
  XCircle,
  Clock,
  BarChart3,
  Award,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Briefcase,
  Layers,
  Zap,
  GraduationCap,
  FileCheck,
  Compass,
  QrCode,
  Check,
  AlertTriangle,
  Lightbulb,
  Building2,
  Target,
  Code,
  Terminal,
  Database,
  Cpu,
  Search,
  BookOpen,
  ChevronRight,
  ExternalLink,
  Crown,
  Medal,
} from "lucide-react";

interface SlideRendererProps {
  slide: any;
  buildStep?: number;
  presentationTitle?: string;
  isProjector?: boolean;
  isLandscape?: boolean;
  quizState?: any;
  remainingTime?: number | null;
  leaderboard?: any[];
  onSelectOption?: (optionIndex: number) => void;
  selectedOption?: number | null;
  isSubmitted?: boolean;
}

function renderSlideContent({
  slide,
  buildStep = 999, // default to all revealed in static preview
  presentationTitle = "UNISOLE AI CAMPUS PROGRAM",
  isProjector = false,
  isLandscape = false,
  quizState = {},
  remainingTime = null,
  leaderboard = [],
  onSelectOption,
  selectedOption = null,
  isSubmitted = false,
}: SlideRendererProps) {
  if (!slide) return null;

  const currentStep = buildStep ?? 0;

  switch (slide.type) {
    // ==========================================
    // 1. COVER SLIDE
    // ==========================================
    case "COVER": {
      return (
        <div className="w-full max-w-5xl mx-auto text-center space-y-6 sm:space-y-8 animate-fade-in">
          {/* Badge */}
          <div
            className={`inline-flex items-center gap-2 px-4 sm:px-5 py-2 rounded-full bg-gradient-to-r from-indigo-500/20 to-violet-500/20 border border-indigo-500/40 text-xs sm:text-sm font-bold text-indigo-300 shadow-lg shadow-indigo-500/10 transition-all duration-300 ease-out ${
              currentStep >= 0 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
            }`}
          >
            <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse shrink-0" />
            <span className="truncate">{slide.badge || "INDUSTRIAL TRAINING & INTERNSHIP OPPORTUNITY PROGRAM"}</span>
          </div>

          {/* Main Title & Subtitle */}
          <div className="space-y-4">
            <h1 className="text-3xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-100 to-indigo-300 drop-shadow-sm">
              {slide.title || "UNISOLE AI CAMPUS PROGRAM"}
            </h1>
            <p
              className={`text-sm sm:text-2xl text-zinc-300 font-medium max-w-3xl mx-auto leading-relaxed transition-all duration-300 ease-out ${
                currentStep >= 1 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
              }`}
            >
              {slide.subtitle || "For College Students Across Himachal Pradesh"}
            </p>
          </div>

          {/* Org Pill */}
          <div
            className={`pt-2 transition-all duration-300 ease-out ${
              currentStep >= 2 ? "opacity-100 scale-100" : "opacity-0 scale-95"
            }`}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs font-mono text-zinc-400">
              <span className="w-2 h-2 rounded-full bg-indigo-500" />
              <span>{slide.org || "UNISOLE SKILL AI LABS"}</span>
            </div>
          </div>
        </div>
      );
    }

    // ==========================================
    // 2. FOUNDER PROFILE
    // ==========================================
    case "FOUNDER_BIO": {
      const creds = slide.credentials || [
        "NIT Hamirpur Alumnus",
        "NASA Space Apps Challenge",
        "3rd — National Startup Summit",
        "ICAR-IARI Incubation Grantee",
        "Speaker & Mentor on Applied AI",
      ];

      return (
        <div className="w-full max-w-5xl mx-auto space-y-6 animate-fade-in">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-xs font-bold text-indigo-300 uppercase tracking-wider">
              {slide.badge || "FOUNDER"}
            </span>
          </div>

          <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-center">
            {/* Left: Avatar & Credentials */}
            <div className="w-full lg:col-span-5 flex flex-col items-center text-center space-y-4">
              <div
                className={`w-32 h-32 sm:w-44 sm:h-44 rounded-3xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 p-1 shadow-2xl transition-all duration-300 ease-out ${
                  currentStep >= 0 ? "scale-100 opacity-100" : "scale-95 opacity-0"
                }`}
              >
                <div className="w-full h-full rounded-[22px] bg-zinc-950 flex flex-col items-center justify-center border border-white/10">
                  <span className="text-3xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-violet-200">
                    {slide.initials || "AM"}
                  </span>
                  <span className="text-[10px] uppercase font-mono tracking-widest text-zinc-400 mt-1">
                    Founder
                  </span>
                </div>
              </div>

              <div className="w-full">
                <h3 className="text-xl sm:text-3xl font-black text-white">{slide.title || "AJAY MOKTA"}</h3>
                <p className="text-xs sm:text-sm text-indigo-300 font-medium mt-0.5">
                  {slide.subtitle || "Founder, UNISOLE Skill AI Labs · B.Tech, NIT Hamirpur"}
                </p>
              </div>
            </div>

            {/* Right: Journey & Quote */}
            <div className="w-full lg:col-span-7 space-y-4 sm:space-y-5">
              <div
                className={`space-y-2.5 transition-all duration-300 ease-out ${
                  currentStep >= 1 ? "opacity-100 translate-x-0" : "opacity-0 translate-x-3"
                }`}
              >
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                  Track Record & Credentials
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {creds.map((c: string, idx: number) => (
                    <div
                      key={idx}
                      className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-2.5 text-xs text-zinc-200 shadow-sm"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span className="font-medium">{c}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div
                className={`p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-indigo-950/60 to-violet-950/60 border border-indigo-500/30 text-indigo-100 font-medium text-xs sm:text-sm leading-relaxed transition-all duration-300 ease-out shadow-xl ${
                  currentStep >= 2 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
                }`}
              >
                <p className="italic">
                  {slide.quote ||
                    "“A degree from any college in Himachal should be backed by skills that compete globally.”"}
                </p>
                <span className="block text-[11px] font-mono text-indigo-300 mt-2">
                  — Walked the Himachal college to deep-tech journey
                </span>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // ==========================================
    // 3. TEAM GRID
    // ==========================================
    case "TEAM_GRID": {
      const pillars = slide.pillars || [
        "INDUSTRY",
        "ENGINEERING",
        "RESEARCH",
        "ACADEMIC EXPOSURE",
      ];
      const members = slide.members || [
        { initials: "GG", name: "Girish Gaurav Sharma", role: "GoodSpace AI → Great Learning" },
        { initials: "SP", name: "Shabd Patel", role: "Software Engineer, BlackRock" },
        { initials: "K", name: "Kushal", role: "IIT Patna → Tech Mahindra" },
        { initials: "AK", name: "Aditya Kaushal", role: "M.Tech, IIT Delhi" },
        { initials: "DG", name: "Dishant Gupta", role: "Ex-Baker Hughes · Former ISRO Intern" },
      ];

      return (
        <div className="w-full max-w-6xl mx-auto space-y-5 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <span className="px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-xs font-bold text-indigo-300 uppercase tracking-wider">
                {slide.badge || "THE UNISOLE TEAM"}
              </span>
              <h2 className="text-xl sm:text-4xl font-black text-white mt-2">
                {slide.title || "BUILT BY PRACTITIONERS"}
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-sm">
              {slide.subtitle || "People who have built and shipped real systems."}
            </p>
          </div>

          {/* 4 Pillars Header Tags */}
          <div
            className={`flex flex-wrap gap-2 transition-all duration-300 ease-out ${
              currentStep >= 0 ? "opacity-100" : "opacity-0"
            }`}
          >
            {pillars.map((p: string, idx: number) => (
              <span
                key={idx}
                className="px-3 py-1 rounded-xl bg-white/5 border border-white/10 text-[10px] sm:text-[11px] font-mono font-bold text-indigo-300"
              >
                {p}
              </span>
            ))}
          </div>

          {/* Mentors Grid */}
          <div
            className={`grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 pt-1 transition-all duration-300 ease-out ${
              currentStep >= 1 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            {members.map((m: any, idx: number) => (
              <div
                key={idx}
                className="p-3.5 sm:p-4 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md text-center space-y-2 hover:border-indigo-500/40 transition-all shadow-lg"
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 to-violet-500 mx-auto flex items-center justify-center text-white font-black text-xs sm:text-sm shadow-md">
                  {m.initials}
                </div>
                <div>
                  <h4 className="font-extrabold text-xs sm:text-sm text-zinc-100">{m.name}</h4>
                  <p className="text-[10px] sm:text-[11px] text-indigo-300 font-medium mt-0.5 leading-tight">
                    {m.role}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <p
            className={`text-center text-xs text-zinc-400 pt-1 transition-all duration-300 ease-out ${
              currentStep >= 2 ? "opacity-100" : "opacity-0"
            }`}
          >
            Mentors & advisors from FAANG, tier-1 institutions, and top high-growth tech companies.
          </p>
        </div>
      );
    }

    // ==========================================
    // 4. BIG QUESTION ( आगे क्या सोचा है? )
    // ==========================================
    case "BIG_QUESTION": {
      return (
        <div className="w-full max-w-4xl mx-auto text-center space-y-6 sm:space-y-8 py-6 sm:py-10 animate-fade-in">
          <div
            className={`transition-all duration-500 ease-out transform py-2 ${
              currentStep >= 0 ? "opacity-100 scale-100" : "opacity-0 scale-95"
            }`}
          >
            <h1 className="text-4xl sm:text-7xl lg:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-500 drop-shadow-2xl font-serif leading-[1.3] sm:leading-[1.35] py-3 sm:py-6 px-2">
              {slide.title || "आगे क्या सोचा है?"}
            </h1>
          </div>

          <div
            className={`transition-all duration-300 ease-out ${
              currentStep >= 1 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
            }`}
          >
            <p className="text-sm sm:text-2xl text-zinc-300 font-medium max-w-2xl mx-auto leading-relaxed">
              {slide.subtitle ||
                "Not what your parents have decided. Not what your friends are doing. What have YOU thought about?"}
            </p>
          </div>

          {/* Pulsating Amber Cue Dot */}
          <div
            className={`pt-4 transition-all duration-300 ${
              currentStep >= 1 ? "opacity-100" : "opacity-0"
            }`}
          >
            <span className="inline-block w-3.5 h-3.5 rounded-full bg-amber-400 animate-ping" />
          </div>
        </div>
      );
    }

    // ==========================================
    // 5. PILLARS OVERVIEW (FOUR THINGS CHANGED)
    // ==========================================
    case "PILLARS_OVERVIEW": {
      const pillars = slide.pillars || [
        { number: "01", label: "The Job Market", revealedText: "Far More Graduates. A Different Map." },
        { number: "02", label: "Rise of Private Sector", revealedText: "An Economy That Did Not Exist in 1991." },
        { number: "03", label: "What People Get Wrong", revealedText: "The Fears are Real. They are Incomplete." },
        { number: "04", label: "Time & Opportunity Cost", revealedText: "What Can Two Years Change?" },
      ];

      return (
        <div className="w-full max-w-5xl mx-auto space-y-5 animate-fade-in">
          <div>
            <span className="px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-xs font-bold text-indigo-300 uppercase tracking-wider">
              {slide.badge || "THE LANDSCAPE"}
            </span>
            <h2 className="text-xl sm:text-4xl font-black text-white mt-2">
              {slide.title || "FOUR THINGS HAVE CHANGED"}
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400">
              {slide.subtitle || "THE WORLD YOU ARE ENTERING."}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
            {pillars.map((p: any, idx: number) => {
              const isRevealed = currentStep >= idx;
              return (
                <div
                  key={idx}
                  className={`p-4 sm:p-5 rounded-3xl border transition-all duration-300 ease-out shadow-lg ${
                    isRevealed
                      ? "bg-gradient-to-br from-indigo-950/60 to-zinc-900 border-indigo-500/40 opacity-100 translate-y-0"
                      : "bg-white/2 border-white/5 opacity-30 translate-y-2"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono font-bold text-indigo-400">
                      PILLAR {p.number}
                    </span>
                    <span className="w-2 h-2 rounded-full bg-indigo-400" />
                  </div>
                  <h3 className="text-base sm:text-lg font-black text-white mb-0.5">
                    {p.label}
                  </h3>
                  <p className="text-xs sm:text-sm text-zinc-300 font-medium leading-relaxed">
                    {isRevealed ? p.revealedText : "••••••••••••••••••••••••"}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    // ==========================================
    // 6. COMPARISON STATS (PILLAR 01)
    // ==========================================
    case "COMPARISON_STATS": {
      const s1 = slide.stat1 || {
        year: "1990-91",
        count: "49 lakh",
        label: "IN HIGHER EDUCATION",
        ratio: "~6% ENROLMENT RATIO",
      };
      const s2 = slide.stat2 || {
        year: "2023-24",
        count: "4.50 crore",
        label: "IN HIGHER EDUCATION",
        ratio: "30% ENROLMENT RATIO",
      };
      const comp = slide.statCompetition || {
        number: "193",
        label: "APPLICANTS PER VACANCY",
        detail: "SSC CGL 2025 — 28.15 lakh applicants for 15,118 posts",
      };

      return (
        <div className="w-full max-w-5xl mx-auto space-y-5 animate-fade-in">
          <div>
            <span className="px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-xs font-bold text-indigo-300 uppercase tracking-wider">
              {slide.badge || "PILLAR 01"}
            </span>
            <h2 className="text-xl sm:text-4xl font-black text-white mt-2">
              {slide.title || "THE JOB MARKET"}
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400">
              {slide.subtitle || "FAR MORE GRADUATES. A DIFFERENT MAP."}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-1">
            {/* Stat 1 */}
            <div
              className={`p-4 sm:p-5 rounded-3xl bg-white/5 border border-white/10 text-center space-y-1.5 transition-all duration-300 ease-out ${
                currentStep >= 0 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
              }`}
            >
              <span className="text-xs font-mono text-zinc-400 font-bold">{s1.year}</span>
              <div className="text-2xl sm:text-4xl font-black text-indigo-300">{s1.count}</div>
              <p className="text-xs font-bold text-zinc-300">{s1.label}</p>
              <span className="text-[10px] font-mono text-zinc-500 block">{s1.ratio}</span>
            </div>

            {/* Stat 2 */}
            <div
              className={`p-4 sm:p-5 rounded-3xl bg-gradient-to-b from-indigo-900/40 to-indigo-950/60 border border-indigo-500/40 text-center space-y-1.5 transition-all duration-300 ease-out shadow-xl ${
                currentStep >= 1 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
              }`}
            >
              <span className="text-xs font-mono text-indigo-400 font-bold">{s2.year}</span>
              <div className="text-2xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-300">
                {s2.count}
              </div>
              <p className="text-xs font-bold text-white">{s2.label}</p>
              <span className="text-[10px] font-mono text-emerald-400 block font-bold">
                {s2.ratio} (9x surge)
              </span>
            </div>

            {/* Competition ratio */}
            <div
              className={`p-4 sm:p-5 rounded-3xl bg-amber-500/10 border border-amber-500/30 text-center space-y-1.5 transition-all duration-300 ease-out shadow-xl ${
                currentStep >= 2 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
              }`}
            >
              <span className="text-xs font-mono text-amber-400 font-bold">COMPETITION</span>
              <div className="text-2xl sm:text-4xl font-black text-amber-300">{comp.number}</div>
              <p className="text-xs font-bold text-amber-200">{comp.label}</p>
              <span className="text-[10px] text-zinc-400 block leading-tight">{comp.detail}</span>
            </div>
          </div>

          {/* Empathy Insight Box */}
          <div
            className={`p-4 rounded-3xl bg-zinc-900/90 border border-amber-500/40 text-xs sm:text-sm text-zinc-200 leading-relaxed transition-all duration-300 ease-out shadow-xl ${
              currentStep >= 3 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
            }`}
          >
            <strong className="block font-bold text-amber-300 mb-0.5">
              {slide.insightBox?.title || "Government jobs are not a bad choice."}
            </strong>
            <p>
              {slide.insightBox?.text ||
                "They are a good choice that far more people are now making at once. The map has more roads than in 1996. Most students are shown one."}
            </p>
          </div>
        </div>
      );
    }

    // ==========================================
    // 7. TIMELINE EVOLUTION (PILLAR 02)
    // ==========================================
    case "TIMELINE_EVOLUTION": {
      const timeline = slide.timeline || [
        { year: "1991", label: "LIBERALISATION" },
        { year: "2000s", label: "IT REVOLUTION" },
        { year: "2010s", label: "SERVICES & BPO" },
        { year: "2016+", label: "STARTUPS" },
        { year: "2020s", label: "DIGITAL ECONOMY" },
        { year: "2025+", label: "AI ECONOMY" },
      ];
      const stats = slide.stats || [
        { value: "$315 bn", label: "Tech revenue, FY2026", sub: "124x since 1995-96" },
        { value: "~60 lakh", label: "Working in tech today", sub: "+2.36 mn in 2,117 GCCs" },
        { value: "2.35 lakh", label: "Recognised startups", sub: "23.36 lakh jobs created" },
      ];

      return (
        <div className="w-full max-w-5xl mx-auto space-y-5 animate-fade-in">
          <div>
            <span className="px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-xs font-bold text-indigo-300 uppercase tracking-wider">
              {slide.badge || "PILLAR 02"}
            </span>
            <h2 className="text-xl sm:text-4xl font-black text-white mt-2">
              {slide.title || "THE RISE OF THE PRIVATE SECTOR"}
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400">
              {slide.subtitle || "AN ECONOMY THAT DID NOT EXIST IN 1991."}
            </p>
          </div>

          {/* Timeline Step Bar */}
          <div
            className={`grid grid-cols-2 sm:grid-cols-6 gap-2 pt-1 transition-all duration-300 ease-out ${
              currentStep >= 0 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
            }`}
          >
            {timeline.map((t: any, idx: number) => (
              <div
                key={idx}
                className="p-2.5 rounded-2xl bg-white/5 border border-white/10 text-center space-y-0.5"
              >
                <div className="text-xs font-mono font-bold text-indigo-400">{t.year}</div>
                <div className="text-[10px] font-bold text-zinc-200 leading-tight">{t.label}</div>
              </div>
            ))}
          </div>

          {/* 3 Impact Numbers */}
          <div
            className={`grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 transition-all duration-300 ease-out ${
              currentStep >= 1 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
            }`}
          >
            {stats.map((s: any, idx: number) => (
              <div
                key={idx}
                className="p-4 sm:p-5 rounded-3xl bg-gradient-to-b from-indigo-950/60 to-zinc-900 border border-indigo-500/30 text-center space-y-1 shadow-lg"
              >
                <div className="text-2xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-white to-violet-300">
                  {s.value}
                </div>
                <div className="text-xs font-bold text-zinc-200">{s.label}</div>
                <div className="text-[10px] text-zinc-400 font-mono">{s.sub}</div>
              </div>
            ))}
          </div>

          <p
            className={`text-xs text-zinc-400 text-center pt-1 transition-all duration-300 ease-out ${
              currentStep >= 2 ? "opacity-100" : "opacity-0"
            }`}
          >
            Source: NASSCOM Strategic Review 2026 · DPIIT / Startup India
          </p>
        </div>
      );
    }

    // ==========================================
    // 8. MYTH VS FACT (PILLAR 03)
    // ==========================================
    case "MYTH_VS_FACT": {
      const myths = slide.myths || [
        "Private jobs are unstable.",
        "You can be replaced easily.",
        "Too many layoffs.",
        "What happens after 50?",
        "Only government is secure.",
      ];
      const facts = slide.facts || [
        { value: "+170 mn", label: "new roles by 2030, against 92 mn displaced" },
        { value: "39%", label: "of core skills change — churn opens doors too" },
        { value: "63%", label: "of employers say skills, not jobs, are the gap" },
        { value: "30-50%", label: "typical pay jump at a first switch" },
        { value: "2.36 mn", label: "already doing global work from India" },
      ];

      return (
        <div className="w-full max-w-5xl mx-auto space-y-5 animate-fade-in">
          <div>
            <span className="px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-xs font-bold text-indigo-300 uppercase tracking-wider">
              {slide.badge || "PILLAR 03"}
            </span>
            <h2 className="text-xl sm:text-4xl font-black text-white mt-2">
              {slide.title || "WHAT PEOPLE GET WRONG"}
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400">
              {slide.subtitle || "THE FEARS ARE REAL. THEY ARE ALSO INCOMPLETE."}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            {/* Left: Fears / Myths */}
            <div
              className={`p-4 sm:p-5 rounded-3xl bg-rose-950/20 border border-rose-500/30 space-y-2.5 transition-all duration-300 ease-out shadow-lg ${
                currentStep >= 0 ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-3"
              }`}
            >
              <div className="flex items-center gap-2 text-rose-400 text-xs font-bold uppercase tracking-wider">
                <AlertTriangle className="w-4 h-4" />
                <span>The Perception / Fear</span>
              </div>
              <ul className="space-y-2 text-xs sm:text-sm text-zinc-200">
                {myths.map((m: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-rose-400 font-bold shrink-0">✕</span>
                    <span>{m}</span>
                  </li>
                ))}
              </ul>
              <p className="text-[10px] text-zinc-400 italic pt-1 border-t border-rose-500/20">
                {slide.mythsFooter || "These come from watching real people lose real jobs."}
              </p>
            </div>

            {/* Right: Facts & Upside */}
            <div
              className={`p-4 sm:p-5 rounded-3xl bg-emerald-950/20 border border-emerald-500/30 space-y-2.5 transition-all duration-300 ease-out shadow-lg ${
                currentStep >= 1 ? "opacity-100 translate-x-0" : "opacity-0 translate-x-3"
              }`}
            >
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4" />
                <span>The Fuller Picture & Facts</span>
              </div>
              <ul className="space-y-2 text-xs sm:text-sm text-zinc-200">
                {facts.map((f: any, idx: number) => (
                  <li key={idx} className="flex items-start gap-2">
                    <strong className="text-emerald-400 font-mono font-bold shrink-0">{f.value}</strong>
                    <span>{f.label}</span>
                  </li>
                ))}
              </ul>
              <p className="text-[10px] text-zinc-400 italic pt-1 border-t border-emerald-500/20">
                {slide.factsFooter || "Mobility, remote work, global roles, entrepreneurship."}
              </p>
            </div>
          </div>

          {/* Key Takeaway */}
          <div
            className={`p-3.5 rounded-2xl bg-indigo-600/20 border border-indigo-500/40 text-center font-bold text-xs sm:text-sm text-indigo-200 transition-all duration-300 ease-out ${
              currentStep >= 2 ? "opacity-100 scale-100" : "opacity-0 scale-95"
            }`}
          >
            {slide.keyTakeaway || "The risk is real. Skills protect you — not the sector."}
          </div>
        </div>
      );
    }

    // ==========================================
    // 9. SCENARIO SPLIT (PILLAR 04)
    // ==========================================
    case "SCENARIO_SPLIT": {
      const scA = slide.scenarioA || {
        title: "SCENARIO A",
        subtitle: "Two years of full-time exam preparation",
        steps: ["Study", "Exam attempts", "Selection uncertainty", "Waiting period"],
        footer: "193 per vacancy · 933 UPSC posts",
      };
      const scB = slide.scenarioB || {
        title: "SCENARIO B",
        subtitle: "Two years building skills alongside your degree",
        steps: [
          { time: "MONTH 0-6", label: "Learn a real skill" },
          { time: "MONTH 6-12", label: "Build and ship projects" },
          { time: "MONTH 12-18", label: "Internship & Industry Exposure" },
          { time: "MONTH 18-24", label: "Entry role → first switch" },
        ],
        footer: "₹3.5-6 LPA entry · ₹8-12 LPA+ with a portfolio",
      };

      return (
        <div className="w-full max-w-5xl mx-auto space-y-5 animate-fade-in">
          <div>
            <span className="px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-xs font-bold text-indigo-300 uppercase tracking-wider">
              {slide.badge || "PILLAR 04"}
            </span>
            <h2 className="text-xl sm:text-4xl font-black text-white mt-2">
              {slide.title || "TIME & OPPORTUNITY COST"}
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400">
              {slide.subtitle || "WHAT CAN TWO YEARS CHANGE?"}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            {/* Scenario A */}
            <div
              className={`p-4 sm:p-5 rounded-3xl bg-white/5 border border-white/10 space-y-3 transition-all duration-300 ease-out shadow-lg ${
                currentStep >= 0 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
              }`}
            >
              <div>
                <span className="text-xs font-mono font-bold text-zinc-400">{scA.title}</span>
                <h4 className="text-sm sm:text-base font-bold text-white mt-0.5">{scA.subtitle}</h4>
              </div>
              <div className="space-y-1.5">
                {scA.steps.map((st: string, idx: number) => (
                  <div key={idx} className="p-2 rounded-xl bg-black/30 text-xs text-zinc-300">
                    {st}
                  </div>
                ))}
              </div>
              <div className="text-xs font-mono text-zinc-400 pt-1 border-t border-white/10">
                {scA.footer}
              </div>
            </div>

            {/* Scenario B */}
            <div
              className={`p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-indigo-950/70 to-zinc-900 border border-indigo-500/40 space-y-3 transition-all duration-300 ease-out shadow-xl ${
                currentStep >= 1 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
              }`}
            >
              <div>
                <span className="text-xs font-mono font-bold text-indigo-400">{scB.title}</span>
                <h4 className="text-sm sm:text-base font-bold text-white mt-0.5">{scB.subtitle}</h4>
              </div>
              <div className="space-y-1.5">
                {scB.steps.map((st: any, idx: number) => (
                  <div
                    key={idx}
                    className="p-2 rounded-xl bg-indigo-900/30 border border-indigo-500/20 flex items-center justify-between text-xs"
                  >
                    <span className="font-mono text-indigo-300 font-bold">{st.time}</span>
                    <span className="text-zinc-200 font-medium">{st.label}</span>
                  </div>
                ))}
              </div>
              <div className="text-xs font-mono text-emerald-400 font-bold pt-1 border-t border-indigo-500/20">
                {scB.footer}
              </div>
            </div>
          </div>

          <p
            className={`text-xs text-zinc-400 text-center italic transition-all duration-300 ease-out ${
              currentStep >= 2 ? "opacity-100" : "opacity-0"
            }`}
          >
            {slide.caveat ||
              "Illustrative — not a guaranteed outcome. Many students do both. Choose deliberately, not by default."}
          </p>
        </div>
      );
    }

    // ==========================================
    // 10. BENEFITS GRID
    // ==========================================
    case "BENEFITS_GRID": {
      const benefits = slide.benefits || [
        { title: "HYBRID & REMOTE WORK", value: "36%", sub: "work hybrid in India" },
        { title: "EARNING POTENTIAL", value: "₹3.5-40+", sub: "LPA fresher band" },
        { title: "GLOBAL OPPORTUNITIES", value: "2,117", sub: "GCCs in India" },
        { title: "PROFESSIONAL GROWTH", value: "85%", sub: "of employers upskilling" },
        { title: "NETWORK GROWTH", value: "20 lakh+", sub: "upskilled in AI, FY26" },
      ];

      return (
        <div className="w-full max-w-5xl mx-auto space-y-5 animate-fade-in">
          <div>
            <span className="px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-xs font-bold text-indigo-300 uppercase tracking-wider">
              {slide.badge || "CAREER POTENTIAL"}
            </span>
            <h2 className="text-xl sm:text-4xl font-black text-white mt-2">
              {slide.title || "THE OTHER SIDE OF THE LEDGER"}
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400">
              {slide.subtitle || "WHAT CAN A PRIVATE CAREER OFFER?"}
            </p>
          </div>

          <div
            className={`grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 pt-1 transition-all duration-300 ease-out ${
              currentStep >= 0 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
            }`}
          >
            {benefits.map((b: any, idx: number) => (
              <div
                key={idx}
                className="p-3.5 sm:p-4 rounded-3xl bg-white/5 border border-white/10 text-center space-y-1.5 hover:border-indigo-500/40 transition-all shadow-md min-w-0 overflow-hidden"
              >
                <span className="text-[10px] sm:text-xs font-mono text-zinc-400 font-bold block leading-tight truncate">
                  {b.title}
                </span>
                <div className="text-base sm:text-xl md:text-2xl font-black text-indigo-300 leading-tight break-words px-1">
                  {b.value}
                </div>
                <span className="text-[10px] sm:text-xs text-zinc-400 block leading-tight">{b.sub}</span>
              </div>
            ))}
          </div>

          <p
            className={`text-xs text-zinc-400 text-center italic transition-all duration-300 ease-out ${
              currentStep >= 1 ? "opacity-100" : "opacity-0"
            }`}
          >
            {slide.footer || "Depending on role, company and industry. None of it arrives without skills."}
          </p>
        </div>
      );
    }

    // ==========================================
    // 11. DEGREE MATRIX
    // ==========================================
    case "DEGREE_MATRIX": {
      const rows = slide.rows || [
        { branch: "CS / IT", degrees: "BCA · MCA · B.Sc CS · B.Tech", role: "Software / ML Engineer", range: "₹4-12 LPA", effort: "HIGH" },
        { branch: "SCIENCE", degrees: "Physics · Maths · Chemistry · Biology", role: "Data / Scientific Computing", range: "₹4-10 LPA", effort: "HIGH" },
        { branch: "COMMERCE / BBA", degrees: "B.Com · BBA · M.Com · Economics", role: "Business / Financial Analyst", range: "₹3.5-8 LPA", effort: "MED-HIGH" },
        { branch: "ARTS / OTHER", degrees: "BA · Humanities · others", role: "AI-enabled digital & research roles", range: "₹3-6 LPA", effort: "MEDIUM" },
      ];

      return (
        <div className="w-full max-w-5xl mx-auto space-y-5 animate-fade-in">
          <div>
            <span className="px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-xs font-bold text-indigo-300 uppercase tracking-wider">
              {slide.badge || "ACADEMIC ALIGNMENT"}
            </span>
            <h2 className="text-xl sm:text-4xl font-black text-white mt-2">
              {slide.title || "YOUR DEGREE, YOUR ENTRY POINT"}
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400">
              {slide.subtitle || "FOUR STARTING POINTS."}
            </p>
          </div>

          <div className="space-y-2 pt-1">
            {rows.map((r: any, idx: number) => {
              const isRevealed = currentStep >= idx;
              return (
                <div
                  key={idx}
                  className={`p-3.5 sm:p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 transition-all duration-300 ease-out shadow-md ${
                    isRevealed
                      ? "bg-white/5 border-white/10 opacity-100 translate-x-0"
                      : "bg-white/2 border-white/5 opacity-30 -translate-x-3"
                  }`}
                >
                  <div className="space-y-0.5">
                    <span className="text-xs font-mono font-bold text-indigo-400">{r.branch}</span>
                    <h4 className="font-bold text-xs sm:text-base text-white">{r.role}</h4>
                    <p className="text-[10px] sm:text-[11px] text-zinc-400">{r.degrees}</p>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <span className="text-xs font-mono font-black text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-xl border border-emerald-500/20">
                      {r.range}
                    </span>
                    <span className="text-[10px] font-mono font-bold text-zinc-400 bg-white/5 px-2 py-1 rounded-lg">
                      EFFORT: {r.effort}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Formula */}
          <div
            className={`p-3 rounded-2xl bg-indigo-950/60 border border-indigo-500/30 flex flex-wrap items-center justify-center gap-2 text-xs sm:text-sm font-black transition-all duration-300 ease-out shadow-lg ${
              currentStep >= 3 ? "opacity-100" : "opacity-0"
            }`}
          >
            <span className="text-indigo-300">DEGREE</span>
            <span className="text-zinc-500">+</span>
            <span className="text-indigo-300">SKILLS</span>
            <span className="text-zinc-500">+</span>
            <span className="text-indigo-300">PROJECTS</span>
            <span className="text-zinc-500">+</span>
            <span className="text-amber-400">EVIDENCE</span>
          </div>
        </div>
      );
    }

    // ==========================================
    // 12. THE GAP (GAP LAYER)
    // ==========================================
    case "GAP_LAYER": {
      const layers = slide.industryLayer || [
        "Practical Skills",
        "Projects",
        "Portfolio",
        "Communication",
        "Problem Solving",
        "Tools",
        "Industry Awareness",
      ];

      return (
        <div className="w-full max-w-5xl mx-auto space-y-5 animate-fade-in">
          <div>
            <span className="px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-xs font-bold text-indigo-300 uppercase tracking-wider">
              {slide.badge || "REALITY CHECK"}
            </span>
            <h2 className="text-xl sm:text-4xl font-black text-white mt-2">
              {slide.title || "THE GAP"}
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400">
              {slide.subtitle || "A DEGREE DOES NOT INCLUDE THESE."}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center pt-1">
            {/* Degree Foundation */}
            <div
              className={`lg:col-span-4 p-4 sm:p-5 rounded-3xl bg-white/5 border border-white/10 text-center space-y-2 transition-all duration-300 ease-out shadow-lg ${
                currentStep >= 0 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
              }`}
            >
              <span className="text-xs font-mono text-zinc-400 font-bold uppercase">THE FOUNDATION</span>
              <div className="w-12 h-12 rounded-2xl bg-indigo-600/30 border border-indigo-500/40 mx-auto flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-indigo-400" />
              </div>
              <h4 className="font-extrabold text-sm sm:text-base text-white">YOUR DEGREE</h4>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                Domain knowledge. Irreplaceable — and what every other graduate already has.
              </p>
            </div>

            {/* Industry Layer (Gap) */}
            <div
              className={`lg:col-span-8 p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-indigo-950/70 to-zinc-900 border border-indigo-500/40 space-y-3 transition-all duration-300 ease-out shadow-xl ${
                currentStep >= 1 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-indigo-400 uppercase">
                  THE MISSING INDUSTRY LAYER
                </span>
                <span className="text-xs text-amber-400 font-bold">Nobody hands you this</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {layers.map((l: string, idx: number) => (
                  <span
                    key={idx}
                    className="px-3 py-1 rounded-xl bg-indigo-500/20 border border-indigo-500/30 text-[11px] font-bold text-white shadow-sm"
                  >
                    {l}
                  </span>
                ))}
              </div>
              <div className="pt-2 flex items-center justify-between text-xs text-zinc-300 border-t border-white/10">
                <span>India Skills Report 2026:</span>
                <span className="font-mono font-bold text-amber-400">Only 56.4% assessed employable</span>
              </div>
            </div>
          </div>

          <p
            className={`text-center font-bold text-xs sm:text-sm text-indigo-300 transition-all duration-300 ease-out ${
              currentStep >= 2 ? "opacity-100" : "opacity-0"
            }`}
          >
            {slide.punchline || "The degree is the foundation. The layer on top is built on purpose."}
          </p>
        </div>
      );
    }

    // ==========================================
    // 13. THE ROADMAP (6 STEPS)
    // ==========================================
    case "ROADMAP_FLOW": {
      const steps = slide.steps || [
        { num: "01", title: "INDUSTRY-GRADE SKILLS" },
        { num: "02", title: "INDUSTRY-GRADE PROJECT" },
        { num: "03", title: "RESUME + PORTFOLIO" },
        { num: "04", title: "APPROACH COMPANIES" },
        { num: "05", title: "INTERVIEW" },
        { num: "06", title: "OPPORTUNITY" },
      ];

      return (
        <div className="w-full max-w-5xl mx-auto space-y-5 animate-fade-in">
          <div>
            <span className="px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-xs font-bold text-indigo-300 uppercase tracking-wider">
              {slide.badge || "THE BLUEPRINT"}
            </span>
            <h2 className="text-xl sm:text-4xl font-black text-white mt-2">
              {slide.title || "THE ROADMAP"}
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400">
              {slide.subtitle || "HOW DO YOU GET THERE?"}
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 pt-1">
            {steps.map((st: any, idx: number) => {
              const isRevealed = currentStep >= idx;
              return (
                <div
                  key={idx}
                  className={`p-3.5 rounded-3xl border text-center space-y-2 transition-all duration-300 ease-out shadow-lg ${
                    isRevealed
                      ? "bg-gradient-to-b from-indigo-900/40 to-zinc-900 border-indigo-500/40 opacity-100 scale-100"
                      : "bg-white/2 border-white/5 opacity-20 scale-95"
                  }`}
                >
                  <div className="w-7 h-7 rounded-xl bg-indigo-600/30 text-indigo-300 font-mono font-black text-xs mx-auto flex items-center justify-center border border-indigo-500/30">
                    {st.num}
                  </div>
                  <h4 className="font-extrabold text-[11px] text-white leading-tight min-h-[28px] flex items-center justify-center">
                    {st.title}
                  </h4>
                </div>
              );
            })}
          </div>

          <div
            className={`p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-center font-bold text-xs sm:text-sm text-amber-300 transition-all duration-300 ease-out ${
              currentStep >= 5 ? "opacity-100" : "opacity-0"
            }`}
          >
            {slide.punchline || "Most students try to jump from 01 directly to 06."}
          </div>
        </div>
      );
    }

    // ==========================================
    // 14. BUILD VS TUTORIAL
    // ==========================================
    case "BUILD_VS_TUTORIAL": {
      const tut = slide.tutorialChain || ["TUTORIAL", "COPY", "FINISH", "FORGET"];
      const proj = slide.projectSteps || [
        { step: 1, label: "PROBLEM" },
        { step: 2, label: "RESEARCH" },
        { step: 3, label: "BUILD" },
        { step: 4, label: "TEST" },
        { step: 5, label: "DEPLOY / PRESENT" },
        { step: 6, label: "EVIDENCE" },
      ];

      return (
        <div className="w-full max-w-5xl mx-auto space-y-5 animate-fade-in">
          <div>
            <span className="px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-xs font-bold text-indigo-300 uppercase tracking-wider">
              {slide.badge || "STEP 02 FOCUS"}
            </span>
            <h2 className="text-xl sm:text-4xl font-black text-white mt-2">
              {slide.title || "LEARNING IS NOT BUILDING."}
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400">
              {slide.subtitle || "A project is the only proof that you can apply what you know."}
            </p>
          </div>

          {/* Tutorial Trap */}
          <div
            className={`p-4 rounded-3xl bg-rose-950/20 border border-rose-500/30 space-y-1.5 transition-all duration-300 ease-out shadow-lg ${
              currentStep >= 0 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
            }`}
          >
            <span className="text-xs font-mono font-bold text-rose-400 uppercase">THE TUTORIAL TRAP</span>
            <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs font-mono font-bold">
              {tut.map((t: string, idx: number) => (
                <React.Fragment key={idx}>
                  <span className="px-2.5 py-1 rounded-xl bg-rose-500/20 text-rose-200 border border-rose-500/30">
                    {t}
                  </span>
                  {idx < tut.length - 1 && <span className="text-rose-400">→</span>}
                </React.Fragment>
              ))}
            </div>
            <p className="text-[10px] text-zinc-400 italic pt-0.5">
              {slide.tutorialNote || "The feeling of progress. None of the evidence."}
            </p>
          </div>

          {/* Real Project Cycle */}
          <div
            className={`p-4 rounded-3xl bg-emerald-950/20 border border-emerald-500/30 space-y-1.5 transition-all duration-300 ease-out shadow-lg ${
              currentStep >= 1 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
            }`}
          >
            <span className="text-xs font-mono font-bold text-emerald-400 uppercase">
              REAL PROJECT EVIDENCE
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 pt-1">
              {proj.map((p: any, idx: number) => (
                <div
                  key={idx}
                  className="p-2 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-center"
                >
                  <span className="text-[10px] font-mono text-emerald-400 block font-bold">0{p.step}</span>
                  <span className="text-xs font-bold text-white">{p.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* The Test */}
          <div
            className={`p-3.5 rounded-2xl bg-zinc-900 border border-white/10 text-xs sm:text-sm text-zinc-200 leading-relaxed transition-all duration-300 ease-out ${
              currentStep >= 2 ? "opacity-100" : "opacity-0"
            }`}
          >
            <strong className="text-indigo-400">The Test: </strong>
            {slide.theTest ||
              "Can someone else open it and see that it works — without you explaining it? If not, it is not yet evidence."}
          </div>
        </div>
      );
    }

    // ==========================================
    // 15. FUNNEL WAYS
    // ==========================================
    case "FUNNEL_WAYS": {
      const funnel = slide.funnel || [
        "SKILL",
        "PROJECT",
        "RESUME",
        "APPLICATION",
        "REFERRAL / NETWORK",
        "INTERVIEW",
        "OPPORTUNITY",
      ];
      const channels = slide.channels || [
        "Job portals",
        "Career pages",
        "Referrals",
        "LinkedIn",
        "Cold email",
        "Alumni",
        "Hackathons",
        "Direct outreach",
      ];

      return (
        <div className="w-full max-w-5xl mx-auto space-y-5 animate-fade-in">
          <div>
            <span className="px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-xs font-bold text-indigo-300 uppercase tracking-wider">
              {slide.badge || "STEPS 03 TO 06"}
            </span>
            <h2 className="text-xl sm:text-4xl font-black text-white mt-2">
              {slide.title || "GOOD SKILL ≠ GOOD OPPORTUNITY."}
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400">
              {slide.subtitle || "Every stage below skill is a communication problem."}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center pt-1">
            {/* Funnel Flow */}
            <div
              className={`lg:col-span-6 p-4 rounded-3xl bg-white/5 border border-white/10 space-y-1.5 transition-all duration-300 ease-out shadow-lg ${
                currentStep >= 0 ? "opacity-100" : "opacity-0"
              }`}
            >
              <span className="text-xs font-mono font-bold text-indigo-400 uppercase">
                THE 7-STAGE CONVERSION FUNNEL
              </span>
              <div className="space-y-1 pt-1">
                {funnel.map((f: string, idx: number) => (
                  <div
                    key={idx}
                    className="p-2 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between text-xs"
                  >
                    <span className="font-mono text-zinc-400 text-[10px]">0{idx + 1}</span>
                    <span className="font-bold text-white">{f}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 8 Channels */}
            <div
              className={`lg:col-span-6 p-4 rounded-3xl bg-gradient-to-br from-indigo-950/70 to-zinc-900 border border-indigo-500/40 space-y-2.5 transition-all duration-300 ease-out shadow-xl ${
                currentStep >= 1 ? "opacity-100" : "opacity-0"
              }`}
            >
              <span className="text-xs font-mono font-bold text-indigo-300 uppercase">
                8 CHANNELS TO REACH RECRUITERS
              </span>
              <div className="grid grid-cols-2 gap-2 pt-1">
                {channels.map((c: string, idx: number) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-xs font-bold text-zinc-100 text-center"
                  >
                    {c}
                  </div>
                ))}
              </div>
              <p className="text-xs text-amber-300 font-bold pt-1 border-t border-white/10 text-center">
                {slide.punchline || "Most students use only one of these eight."}
              </p>
            </div>
          </div>
        </div>
      );
    }

    // ==========================================
    // 16. PROGRAM PILLARS
    // ==========================================
    case "PROGRAM_PILLARS": {
      const comps = slide.components || [
        { title: "Industry Curriculum", desc: "Modern production-grade tools, stacks & patterns" },
        { title: "Practical Projects", desc: "Shipped live with real data, tests & end users" },
        { title: "Expert Sessions", desc: "Live masterclasses from senior engineers & founders" },
        { title: "Career Prep", desc: "Resume architecture, ATS optimization & mock interviews" },
        { title: "Portfolio", desc: "Verified proof and live deployments for recruiters" },
        { title: "Mentorship", desc: "Personal 1-on-1 code and career feedback on your work" },
        { title: "Opportunity Pathways", desc: "Direct talent pool & industry connections" },
      ];

      return (
        <div className="w-full max-w-5xl mx-auto space-y-5 animate-fade-in">
          <div>
            <span className="px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-xs font-bold text-indigo-300 uppercase tracking-wider">
              {slide.badge || "THE STRUCTURED SOLUTION"}
            </span>
            <h2 className="text-xl sm:text-4xl font-black text-white mt-2">
              {slide.title || "SO HOW DO YOU BUILD THIS?"}
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400">
              {slide.subtitle || "UNISOLE AI CAMPUS PROGRAM — Build skills, projects and professional evidence."}
            </p>
          </div>

          <div
            className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1 transition-all duration-300 ease-out ${
              currentStep >= 0 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
            }`}
          >
            {comps.map((c: any, idx: number) => (
              <div
                key={idx}
                className="p-4 rounded-3xl bg-white/5 border border-white/10 hover:border-indigo-500/40 transition-all shadow-md space-y-1"
              >
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-indigo-400" />
                  <h4 className="font-extrabold text-xs sm:text-sm text-white">{c.title}</h4>
                </div>
                <p className="text-xs text-zinc-300 font-medium leading-relaxed">{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      );
    }

    // ==========================================
    // 17. COURSE PATHWAYS (FEES & TRACKS)
    // ==========================================
    case "COURSE_PATHWAYS": {
      const groups = slide.groups || [
        {
          group: "GROUP 1",
          branch: "CS / IT",
          degrees: "BCA, MCA, B.Sc. CS/IT, PGDCA, B.Tech",
          courses: [
            { name: "Machine Learning in Production", price: "₹2,999" },
            { name: "Full Stack Web Development", price: "₹1,499" },
            { name: "AI Entrepreneurship & Innovation", price: "₹599" },
          ],
        },
        {
          group: "GROUP 2",
          branch: "SCIENCE",
          degrees: "B.Sc./M.Sc. Physics, Maths, Chem, Bio",
          courses: [
            { name: "Scientific ML / AI for Science", price: "₹2,000" },
            { name: "Mathematics + AI", price: "₹1,500" },
            { name: "AI Entrepreneurship & Innovation", price: "₹599" },
          ],
        },
        {
          group: "GROUP 3",
          branch: "COMMERCE / BBA",
          degrees: "B.Com, BBA, BBM, M.Com, Economics",
          courses: [
            { name: "Business Analytics + AI Entrep.", price: "₹2,000" },
            { name: "AI in Finance & FinTech + AI Entrep.", price: "₹2,000" },
            { name: "AI Entrepreneurship & Innovation", price: "₹599" },
          ],
        },
        {
          group: "GROUP 4",
          branch: "BA / OTHER",
          degrees: "BA, Humanities & other non-tech branches",
          courses: [
            { name: "AI Literacy, Prompting & Career Readiness", price: "₹999" },
          ],
        },
      ];

      return (
        <div className="w-full max-w-6xl mx-auto space-y-5 animate-fade-in">
          <div>
            <span className="px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-xs font-bold text-indigo-300 uppercase tracking-wider">
              {slide.badge || "CHOOSE YOUR TRACK"}
            </span>
            <h2 className="text-xl sm:text-4xl font-black text-white mt-2">
              {slide.title || "COURSE PATHWAYS"}
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400">
              {slide.subtitle || "FIND YOUR GROUP."}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
            {groups.map((g: any, idx: number) => {
              const isRevealed = currentStep >= idx;
              return (
                <div
                  key={idx}
                  className={`p-4 rounded-3xl border transition-all duration-300 ease-out flex flex-col justify-between shadow-lg ${
                    isRevealed
                      ? "bg-gradient-to-b from-indigo-950/60 to-zinc-900 border-indigo-500/40 opacity-100 translate-y-0"
                      : "bg-white/2 border-white/5 opacity-25 translate-y-2"
                  }`}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold text-indigo-400">{g.group}</span>
                      <span className="text-xs font-black text-white">{g.branch}</span>
                    </div>
                    <p className="text-[10px] text-zinc-400 leading-tight">{g.degrees}</p>

                    <div className="space-y-1.5 pt-2 border-t border-white/10">
                      {g.courses.map((c: any, cIdx: number) => (
                        <div
                          key={cIdx}
                          className="p-2 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between text-xs"
                        >
                          <span className="font-medium text-zinc-200 truncate mr-2 text-[11px]">{c.name}</span>
                          <span className="font-mono font-black text-amber-400 shrink-0 text-xs">{c.price}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 mt-1 border-t border-white/5 text-[9px] text-zinc-500 text-center font-mono">
                    Structured Curriculum + Projects
                  </div>
                </div>
              );
            })}
          </div>

          <p
            className={`text-center text-xs text-indigo-300 transition-all duration-300 ease-out ${
              currentStep >= 3 ? "opacity-100" : "opacity-0"
            }`}
          >
            {slide.note || "AI Entrepreneurship & Innovation is open to every group."}
          </p>
        </div>
      );
    }

    // ==========================================
    // 18. OPPORTUNITY PATHWAY
    // ==========================================
    case "OPPORTUNITY_PATHWAY": {
      const flow = slide.flow || ["TRAIN", "BUILD", "PERFORM", "GET IDENTIFIED", "TALENT POOL", "OPPORTUNITIES"];
      const opps = slide.opportunities || [
        "Advanced projects",
        "Hackathons",
        "Industry interaction",
        "Research projects",
        "Tutor roles",
        "Internships",
      ];

      return (
        <div className="w-full max-w-5xl mx-auto space-y-5 animate-fade-in">
          <div>
            <span className="px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-xs font-bold text-indigo-300 uppercase tracking-wider">
              {slide.badge || "CAREER PIPELINE"}
            </span>
            <h2 className="text-xl sm:text-4xl font-black text-white mt-2">
              {slide.title || "BEYOND THE TRAINING"}
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400">
              {slide.subtitle || "FROM TRAINING TO OPPORTUNITY"}
            </p>
          </div>

          {/* Flow pipeline */}
          <div
            className={`grid grid-cols-2 sm:grid-cols-6 gap-2 pt-1 transition-all duration-300 ease-out ${
              currentStep >= 0 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
            }`}
          >
            {flow.map((f: string, idx: number) => (
              <div
                key={idx}
                className="p-2.5 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 text-center text-xs font-black text-white shadow-sm"
              >
                {f}
              </div>
            ))}
          </div>

          {/* 6 Opportunities Grid */}
          <div
            className={`grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1 transition-all duration-300 ease-out ${
              currentStep >= 1 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
            }`}
          >
            {opps.map((o: string, idx: number) => (
              <div
                key={idx}
                className="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-center text-xs font-bold text-zinc-200 shadow-sm"
              >
                {o}
              </div>
            ))}
          </div>

          <div
            className={`p-3.5 rounded-2xl bg-zinc-900 border border-white/10 text-center space-y-0.5 transition-all duration-300 ease-out ${
              currentStep >= 2 ? "opacity-100" : "opacity-0"
            }`}
          >
            <p className="text-xs text-zinc-400 italic">
              {slide.disclaimer ||
                "Subject to performance, eligibility, availability and applicable selection procedures."}
            </p>
            <p className="text-xs sm:text-sm font-bold text-amber-300">
              {slide.punchline || "Nothing here is promised. Everything here is earned."}
            </p>
          </div>
        </div>
      );
    }

    // ==========================================
    // 19. MENTORSHIP DUAL
    // ==========================================
    case "MENTORSHIP_DUAL": {
      const pA = slide.panelA || {
        title: "INDUSTRY EXPERTS",
        points: ["Real professionals", "Real problems", "Real workflows", "Real career insight"],
        footer: "People currently doing the work — not describing it.",
      };
      const pB = slide.panelB || {
        title: "PERSONAL MENTORSHIP",
        points: ["Career direction", "Project guidance", "Resume & portfolio review", "Interview prep", "Communication coaching"],
        footer: "One-to-one, on your own work.",
      };

      return (
        <div className="w-full max-w-5xl mx-auto space-y-5 animate-fade-in">
          <div>
            <span className="px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-xs font-bold text-indigo-300 uppercase tracking-wider">
              {slide.badge || "EXPERIENCE"}
            </span>
            <h2 className="text-xl sm:text-4xl font-black text-white mt-2">
              {slide.title || "WHAT IT FEELS LIKE"}
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400">
              {slide.subtitle || "PEOPLE, NOT JUST CONTENT."}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            {/* Panel A */}
            <div
              className={`p-4 sm:p-5 rounded-3xl bg-white/5 border border-white/10 space-y-3 transition-all duration-300 ease-out shadow-lg ${
                currentStep >= 0 ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-3"
              }`}
            >
              <h3 className="text-sm sm:text-base font-black text-indigo-300">{pA.title}</h3>
              <ul className="space-y-1.5 text-xs text-zinc-200">
                {pA.points.map((pt: string, idx: number) => (
                  <li key={idx} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>
              <p className="text-xs text-zinc-400 italic pt-1 border-t border-white/10">{pA.footer}</p>
            </div>

            {/* Panel B */}
            <div
              className={`p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-indigo-950/60 to-zinc-900 border border-indigo-500/40 space-y-3 transition-all duration-300 ease-out shadow-xl ${
                currentStep >= 1 ? "opacity-100 translate-x-0" : "opacity-0 translate-x-3"
              }`}
            >
              <h3 className="text-sm sm:text-base font-black text-violet-300">{pB.title}</h3>
              <ul className="space-y-1.5 text-xs text-zinc-200">
                {pB.points.map((pt: string, idx: number) => (
                  <li key={idx} className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>
              <p className="text-xs text-indigo-300 font-bold pt-1 border-t border-indigo-500/20">{pB.footer}</p>
            </div>
          </div>
        </div>
      );
    }

    // ==========================================
    // 20. RESEARCH & INTERNSHIP EXPOSURE
    // ==========================================
    case "RESEARCH_INTERN": {
      const flow = slide.flow || ["TRAINING", "PROJECT", "PERFORMANCE", "IDENTIFICATION", "OPPORTUNITY"];
      const doors = slide.doors || [
        "Industry-linked projects",
        "Internship opportunities",
        "Advanced projects",
        "Research exposure",
        "Hackathons",
      ];

      return (
        <div className="w-full max-w-5xl mx-auto space-y-5 animate-fade-in">
          <div>
            <span className="px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-xs font-bold text-indigo-300 uppercase tracking-wider">
              {slide.badge || "ADVANCED PATHWAYS"}
            </span>
            <h2 className="text-xl sm:text-4xl font-black text-white mt-2">
              {slide.title || "WHERE STRONG PERFORMANCE LEADS"}
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400">
              {slide.subtitle || "INTERNSHIP & RESEARCH EXPOSURE"}
            </p>
          </div>

          <div
            className={`grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1 transition-all duration-300 ease-out ${
              currentStep >= 0 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
            }`}
          >
            {flow.map((f: string, idx: number) => (
              <div
                key={idx}
                className="p-2.5 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 text-center text-xs font-black text-white shadow-sm"
              >
                {f}
              </div>
            ))}
          </div>

          <div
            className={`grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 pt-1 transition-all duration-300 ease-out ${
              currentStep >= 1 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
            }`}
          >
            {doors.map((d: string, idx: number) => (
              <div
                key={idx}
                className="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-center text-xs font-bold text-zinc-200 shadow-sm"
              >
                {d}
              </div>
            ))}
          </div>

          <div
            className={`p-4 rounded-3xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200 leading-relaxed transition-all duration-300 ease-out ${
              currentStep >= 2 ? "opacity-100" : "opacity-0"
            }`}
          >
            <strong className="block font-bold text-amber-300 mb-0.5">RESEARCH-ORIENTED STUDENTS</strong>
            {slide.academicNote?.body ||
              "IAPT-linked and academic-network exposure is offered only where formally supported at the time. Nothing here is a guaranteed internship, research placement or IAPT selection — all subject to eligibility, institutional availability and selection procedures."}
          </div>
        </div>
      );
    }

    // ==========================================
    // 21. IMAGE BANNER
    // ==========================================
    case "IMAGE_BANNER": {
      return (
        <div className="w-full max-w-5xl mx-auto text-center space-y-5 animate-fade-in">
          <div>
            <span className="px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-xs font-bold text-indigo-300 uppercase tracking-wider">
              {slide.badge || "CAMPUS ROADSHOW"}
            </span>
            <h2 className="text-xl sm:text-5xl font-black text-white mt-2">
              {slide.title || "Empowering Himachal's Next-Gen Tech Talent"}
            </h2>
            <p className="text-xs sm:text-base text-zinc-400 font-medium mt-1">
              {slide.subtitle || "Hands-on AI skill labs across colleges"}
            </p>
          </div>

          <div className="rounded-3xl overflow-hidden border border-white/15 shadow-2xl max-h-[360px] mx-auto bg-black/40">
            <img
              src={slide.image}
              alt={slide.title}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      );
    }

    // ==========================================
    // 22. AMBASSADORS CTA
    // ==========================================
    case "AMBASSADORS_CTA": {
      const perks = slide.perks || [
        "Priority mentorship from the senior team",
        "Deeper career guidance & project reviews",
        "Exposure to industry professionals",
        "Leadership & communication development",
        "Early access to internships & hackathons",
        "Represent UNISOLE in your college",
        "Possible Talent Pool consideration",
      ];

      return (
        <div className="w-full max-w-6xl mx-auto space-y-5 animate-fade-in">
          <div className="flex items-center justify-between">
            <span className="px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-xs font-bold text-indigo-300 uppercase tracking-wider">
              {slide.badge || "A RECOGNITION PATHWAY"}
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
            {/* Left: Perks */}
            <div className="lg:col-span-7 space-y-3.5">
              <h2 className="text-xl sm:text-5xl font-black text-white leading-tight">
                {slide.title || "UNISOLE COLLEGE AMBASSADORS"}
              </h2>

              <div
                className={`grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 transition-all duration-300 ease-out ${
                  currentStep >= 0 ? "opacity-100" : "opacity-0"
                }`}
              >
                {perks.map((p: string, idx: number) => (
                  <div key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-zinc-200 font-medium">
                    <span className="text-amber-400 font-bold shrink-0">★</span>
                    <span>{p}</span>
                  </div>
                ))}
              </div>

              <p className="text-xs text-zinc-400 italic pt-1 border-t border-white/10">
                {slide.disclaimer || "A recognition and mentorship pathway — not a job, internship or placement."}
              </p>
            </div>

            {/* Right: Scan QR / Return of Big Question */}
            <div
              className={`lg:col-span-5 p-5 rounded-3xl bg-gradient-to-b from-indigo-950/80 to-zinc-900 border border-indigo-500/40 text-center space-y-3 shadow-xl transition-all duration-300 ease-out ${
                currentStep >= 1 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              }`}
            >
              <div className="p-2.5 bg-white rounded-2xl inline-block shadow-lg">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(
                    slide.targetUrl || "https://unisole.org/programs"
                  )}`}
                  alt="Scan QR"
                  className="w-28 h-28 sm:w-36 sm:h-36 object-contain"
                />
              </div>

              <div>
                <span className="text-xs font-bold text-indigo-300 uppercase tracking-widest block mb-0.5">
                  SIGN UP NOW
                </span>
                <p className="text-[11px] text-zinc-300 font-medium">
                  {slide.qrAction || "Scan to sign up or connect with your college coordinator"}
                </p>
              </div>

              {/* The Return Question in Step 2 */}
              <div
                className={`pt-1 transition-all duration-500 ease-out ${
                  currentStep >= 2 ? "opacity-100 scale-100" : "opacity-0 scale-95"
                }`}
              >
                <div className="text-lg sm:text-2xl font-black text-amber-300 font-serif">
                  {slide.finalQuestion || "आगे क्या सोचा है?"}
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // ==========================================
    // 23. LIVE POLL SLIDE (Audience Interactive + Projector)
    // ==========================================
    case "POLL": {
      return (
        <div className="w-full max-w-5xl mx-auto space-y-5 animate-fade-in text-center sm:text-left">
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider">
            <BarChart3 className="w-5 h-5" />
            <span>{slide.badge || "LIVE AUDIENCE POLL"}</span>
          </div>

          <h2 className="text-xl sm:text-4xl lg:text-5xl font-black text-white leading-tight">
            {slide.question || slide.title || "Live Audience Poll"}
          </h2>

          <div className={`grid ${isLandscape ? "grid-cols-2" : "grid-cols-1 sm:grid-cols-2"} gap-3 pt-2`}>
            {(slide.options || []).map((opt: string, optIdx: number) => {
              const count = quizState?.pollCounts?.[optIdx] || 0;
              const totalVotes = Object.values(quizState?.pollCounts || {}).reduce(
                (a: any, b: any) => a + b,
                0
              ) as number;
              const percent = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
              const isSelected = selectedOption === optIdx;

              return (
                <button
                  key={optIdx}
                  type="button"
                  disabled={isProjector || (!quizState?.isQuizActive && !isSubmitted)}
                  onClick={() => onSelectOption && onSelectOption(optIdx)}
                  className={`relative p-3.5 sm:p-5 rounded-2xl border transition-all duration-300 ease-out overflow-hidden shadow-lg text-left ${
                    isSelected
                      ? "ring-4 ring-cyan-400 bg-cyan-950/60 border-cyan-400"
                      : "bg-white/5 border-cyan-500/30 hover:border-cyan-400/60"
                  } ${!isProjector ? "cursor-pointer active:scale-98" : ""}`}
                >
                  {/* Fill Bar */}
                  <div
                    className="absolute inset-y-0 left-0 bg-cyan-500/20 transition-all duration-500 ease-out"
                    style={{ width: `${percent}%` }}
                  />

                  <div className="relative flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 sm:gap-3">
                      <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-cyan-500/20 text-cyan-300 flex items-center justify-center font-bold text-xs sm:text-sm shrink-0">
                        {String.fromCharCode(65 + optIdx)}
                      </span>
                      <span className="text-xs sm:text-base font-bold text-white leading-snug">{opt}</span>
                    </div>
                    <span className="text-sm sm:text-lg font-mono font-black text-cyan-400 shrink-0">
                      {percent}%
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      );
    }

    // ==========================================
    // 24. LIVE QUIZ SLIDE (Audience Interactive + Projector)
    // ==========================================
    case "QUIZ": {
      return (
        <div className="w-full max-w-5xl mx-auto space-y-5 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
              <Flame className="w-5 h-5" />
              <span>{slide.badge || "FAST-FINGER TECH CHALLENGE"}</span>
            </div>

            {remainingTime !== null && (
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-300 font-mono font-black text-base sm:text-lg shadow-lg">
                <Clock className="w-4 h-4 animate-spin" />
                <span>{remainingTime}s remaining</span>
              </div>
            )}
          </div>

          <h2 className="text-xl sm:text-4xl font-black text-white leading-tight">
            {slide.question || slide.title}
          </h2>

          <div className={`grid ${isLandscape ? "grid-cols-2" : "grid-cols-1 sm:grid-cols-2"} gap-3 pt-2`}>
            {(slide.options || []).map((opt: any, optIdx: number) => {
              const colors = [
                "bg-rose-500/20 border-rose-500/40 text-rose-100",
                "bg-blue-500/20 border-blue-500/40 text-blue-100",
                "bg-amber-500/20 border-amber-500/40 text-amber-100",
                "bg-emerald-500/20 border-emerald-500/40 text-emerald-100",
              ];
              const isCorrect = typeof opt === "object" ? opt.isCorrect : false;
              const text = typeof opt === "object" ? opt.text : opt;
              const isRevealed = quizState?.isAnswerRevealed;
              const isSelected = selectedOption === optIdx;

              return (
                <button
                  key={optIdx}
                  type="button"
                  disabled={isProjector || (!quizState?.isQuizActive && !isSubmitted)}
                  onClick={() => onSelectOption && onSelectOption(optIdx)}
                  className={`p-3.5 sm:p-5 rounded-2xl border transition-all duration-300 ease-out flex items-center justify-between gap-3 shadow-lg text-left ${
                    colors[optIdx % 4]
                  } ${
                    isSelected ? "ring-4 ring-amber-400 scale-102" : ""
                  } ${
                    isRevealed && isCorrect
                      ? "ring-4 ring-emerald-400 scale-102 bg-emerald-600/40"
                      : isRevealed
                      ? "opacity-40"
                      : ""
                  } ${!isProjector ? "cursor-pointer active:scale-98" : ""}`}
                >
                  <div className="flex items-center gap-2.5 sm:gap-3">
                    <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-white/20 flex items-center justify-center font-bold text-xs sm:text-sm shrink-0">
                      {String.fromCharCode(65 + optIdx)}
                    </span>
                    <span className="text-xs sm:text-base font-bold leading-snug">{text}</span>
                  </div>

                  {isRevealed && isCorrect && (
                    <span className="px-2.5 py-1 rounded-full bg-emerald-500 text-white font-bold text-xs flex items-center gap-1 shadow-md shrink-0">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Correct
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      );
    }

    // ==========================================
    // 25. STATS SLIDE
    // ==========================================
    case "STATS": {
      return (
        <div className="w-full max-w-5xl mx-auto space-y-5 animate-fade-in text-center sm:text-left">
          {slide.badge && (
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-xs font-bold text-indigo-300">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>{slide.badge}</span>
            </div>
          )}

          <h1 className="text-2xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            {slide.title || "Impact Stats"}
          </h1>

          {slide.subtitle && (
            <p className="text-sm sm:text-xl text-zinc-300 max-w-3xl leading-relaxed">
              {slide.subtitle}
            </p>
          )}

          {Array.isArray(slide.stats) && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
              {slide.stats.map((st: any, idx: number) => {
                const isRevealed = currentStep >= idx;
                return (
                  <div
                    key={idx}
                    className={`p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-white/10 to-white/5 border border-white/10 backdrop-blur-md text-center shadow-xl transition-all duration-300 ease-out ${
                      isRevealed ? "opacity-100 translate-y-0" : "opacity-20 translate-y-2"
                    }`}
                  >
                    <div className="text-3xl sm:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-300">
                      {st.value}
                    </div>
                    <div className="text-xs sm:text-base font-semibold text-zinc-300 mt-2">
                      {st.label}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      );
    }

    // ==========================================
    // 26. OFFER / CTA SLIDE
    // ==========================================
    case "OFFER_CTA": {
      return (
        <div className="w-full max-w-4xl mx-auto p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-indigo-900/60 to-violet-900/60 border border-indigo-500/40 backdrop-blur-xl space-y-4 shadow-2xl text-center sm:text-left animate-fade-in">
          <div className="inline-block px-3.5 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold text-xs">
            {slide.badge || "Special Roadshow Grant"}
          </div>
          <h3 className="text-xl sm:text-4xl font-black text-white leading-tight">
            {slide.title || "Exclusive Student Scholarship Available Now"}
          </h3>
          {slide.subtitle && (
            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed max-w-xl">
              {slide.subtitle}
            </p>
          )}
          {slide.couponCode && (
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <span className="text-xs text-zinc-300">Use Promo Code:</span>
              <span className="px-4 py-2 rounded-xl bg-black/40 border border-amber-400/50 text-amber-300 font-mono font-black text-base sm:text-lg tracking-wider shadow-inner">
                {slide.couponCode}
              </span>
            </div>
          )}
        </div>
      );
    }

    // ==========================================
    // 27. TEXT TRANSITION SLIDE
    // ==========================================
    case "TEXT_TRANSITION":
    case "TRANSITION": {
      return (
        <div className="w-full max-w-4xl mx-auto text-center space-y-6 sm:space-y-8 py-8 animate-fade-in">
          {slide.badge && (
            <div
              className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-xs font-bold text-indigo-300 transition-all duration-300 ease-out ${
                currentStep >= 0 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>{slide.badge}</span>
            </div>
          )}

          <div
            className={`transition-all duration-500 ease-out ${
              currentStep >= 0 ? "opacity-100 scale-100" : "opacity-0 scale-95"
            }`}
          >
            <h1 className="text-3xl sm:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-100 to-indigo-300 drop-shadow-lg leading-tight">
              {slide.title}
            </h1>
          </div>

          {slide.subtitle && (
            <div
              className={`transition-all duration-300 ease-out ${
                currentStep >= 1 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
              }`}
            >
              <p className="text-base sm:text-2xl text-zinc-300 font-medium max-w-2xl mx-auto leading-relaxed">
                {slide.subtitle}
              </p>
            </div>
          )}

          {Array.isArray(slide.cards) && (
            <div
              className={`grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 transition-all duration-300 ease-out ${
                currentStep >= 1 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
              }`}
            >
              {slide.cards.map((c: string, idx: number) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-xs font-bold text-indigo-200 text-center shadow-md hover:border-indigo-500/40 transition-all"
                >
                  {c}
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    // ==========================================
    // 28. ECOSYSTEM HUB
    // ==========================================
    case "ECOSYSTEM_HUB": {
      const items = slide.items || [];
      return (
        <div className="w-full max-w-5xl mx-auto space-y-6 animate-fade-in text-center">
          <div>
            <span className="px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-xs font-bold text-indigo-300 uppercase tracking-wider">
              {slide.badge || "THE LANDSCAPE"}
            </span>
            <h2 className="text-xl sm:text-4xl font-black text-white mt-2">
              {slide.title}
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1">
              {slide.subtitle}
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-gradient-to-b from-indigo-950/40 to-zinc-900/60 border border-indigo-500/30 backdrop-blur-xl shadow-2xl relative">
            <div
              className={`mb-6 inline-flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-black text-base sm:text-lg shadow-xl shadow-indigo-600/30 transition-all duration-300 ${
                currentStep >= 0 ? "opacity-100 scale-100" : "opacity-0 scale-90"
              }`}
            >
              <Target className="w-5 h-5 text-amber-300" />
              <span>{slide.centerLabel || "JOB MARKET"}</span>
            </div>

            <div
              className={`grid grid-cols-2 sm:grid-cols-5 gap-2.5 transition-all duration-300 ease-out ${
                currentStep >= 1 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
              }`}
            >
              {items.map((it: string, idx: number) => (
                <div
                  key={idx}
                  className="p-3 rounded-2xl bg-white/5 border border-white/10 hover:border-indigo-400/50 hover:bg-indigo-900/20 transition-all text-xs font-bold text-zinc-200 flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0" />
                  <span className="truncate">{it}</span>
                </div>
              ))}
            </div>
          </div>

          <div
            className={`p-3.5 rounded-2xl bg-indigo-600/20 border border-indigo-500/40 font-bold text-xs sm:text-sm text-indigo-200 transition-all duration-300 ${
              currentStep >= 2 ? "opacity-100 scale-100" : "opacity-0 scale-95"
            }`}
          >
            {slide.punchline || "Your degree is a starting point — not the entire career map."}
          </div>
        </div>
      );
    }

    // ==========================================
    // 29. THREE CARDS
    // ==========================================
    case "THREE_CARDS": {
      const cards = slide.cards || [];
      return (
        <div className="w-full max-w-5xl mx-auto space-y-6 animate-fade-in">
          <div>
            <span className="px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-xs font-bold text-indigo-300 uppercase tracking-wider">
              {slide.badge || "INFORMATION GAP"}
            </span>
            <h2 className="text-xl sm:text-4xl font-black text-white mt-2">
              {slide.title}
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1">
              {slide.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
            {cards.map((c: any, idx: number) => {
              const isRevealed = currentStep >= idx;
              return (
                <div
                  key={idx}
                  className={`p-5 rounded-3xl border transition-all duration-300 ease-out shadow-xl flex flex-col justify-between space-y-3 ${
                    isRevealed
                      ? "bg-gradient-to-b from-indigo-950/60 to-zinc-900 border-indigo-500/40 opacity-100 translate-y-0"
                      : "bg-white/2 border-white/5 opacity-25 translate-y-3"
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-black text-indigo-400">
                        {c.num || `0${idx + 1}`}
                      </span>
                      <span className="w-2 h-2 rounded-full bg-indigo-400" />
                    </div>
                    <h3 className="font-extrabold text-base text-white">{c.title}</h3>
                    <div className="space-y-1.5 pt-2 border-t border-white/10">
                      {(c.items || []).map((it: string, iIdx: number) => (
                        <div
                          key={iIdx}
                          className="p-2 rounded-xl bg-black/30 border border-white/5 text-xs text-zinc-200 font-medium flex items-center gap-2"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0" />
                          <span>{it}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {slide.punchline && (
            <div
              className={`p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-center font-bold text-xs sm:text-sm text-amber-300 transition-all duration-300 ${
                currentStep >= 2 ? "opacity-100" : "opacity-0"
              }`}
            >
              {slide.punchline}
            </div>
          )}
        </div>
      );
    }

    // ==========================================
    // 30. EDUCATION SHIFT
    // ==========================================
    case "EDUCATION_SHIFT": {
      const s1 = slide.stat1 || { year: "1990–91", count: "~49 LAKH", label: "Higher Education Enrolment", ratio: "GER ≈ 6%" };
      const s2 = slide.stat2 || { year: "2023–24", count: "~4.5 CRORE", label: "Higher Education Enrolment", ratio: "GER ≈ 30%" };

      return (
        <div className="w-full max-w-5xl mx-auto space-y-6 animate-fade-in text-center">
          <div>
            <span className="px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-xs font-bold text-indigo-300 uppercase tracking-wider">
              {slide.badge || "EDUCATION SHIFT"}
            </span>
            <h2 className="text-xl sm:text-4xl font-black text-white mt-2">
              {slide.title}
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1">
              {slide.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
            {/* 1990-91 */}
            <div
              className={`p-6 sm:p-8 rounded-3xl bg-white/5 border border-white/10 text-center space-y-3 transition-all duration-300 ease-out shadow-lg ${
                currentStep >= 0 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
              }`}
            >
              <span className="text-xs font-mono font-bold text-zinc-400">{s1.year}</span>
              <div className="text-3xl sm:text-5xl font-black text-indigo-300">{s1.count}</div>
              <p className="text-xs sm:text-sm font-bold text-zinc-200">{s1.label}</p>
              <div className="inline-block px-3 py-1 rounded-xl bg-white/5 border border-white/10 text-xs font-mono text-zinc-400">
                {s1.ratio}
              </div>
            </div>

            {/* 2023-24 */}
            <div
              className={`p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-indigo-950/70 to-zinc-900 border border-indigo-500/40 text-center space-y-3 transition-all duration-300 ease-out shadow-2xl ${
                currentStep >= 1 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
              }`}
            >
              <span className="text-xs font-mono font-bold text-indigo-400">{s2.year}</span>
              <div className="text-3xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-white to-violet-300">
                {s2.count}
              </div>
              <p className="text-xs sm:text-sm font-bold text-white">{s2.label}</p>
              <div className="inline-block px-3 py-1 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-xs font-mono font-bold text-emerald-400">
                {s2.ratio}
              </div>
            </div>
          </div>

          <div
            className={`p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 font-bold text-xs sm:text-base text-amber-300 transition-all duration-300 ${
              currentStep >= 2 ? "opacity-100 scale-100" : "opacity-0 scale-95"
            }`}
          >
            {slide.punchline || "More Graduates → More Competition. Degree alone is no longer enough to differentiate yourself."}
          </div>
        </div>
      );
    }

    // ==========================================
    // 31. GOV VS PRIVATE
    // ==========================================
    case "GOV_VS_PRIVATE": {
      const govFlow = slide.govFlow || ["Eligibility (Degree)", "Selection (Exam)", "Job (Defined Post)"];
      const privFlow = slide.privFlow || ["Role", "Skills", "Projects / Experience", "Interview", "Job"];

      return (
        <div className="w-full max-w-5xl mx-auto space-y-5 animate-fade-in">
          <div>
            <span className="px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-xs font-bold text-indigo-300 uppercase tracking-wider">
              {slide.badge || "HIRING COMPARISON"}
            </span>
            <h2 className="text-xl sm:text-4xl font-black text-white mt-2">
              {slide.title}
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1">
              {slide.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            {/* Government */}
            <div
              className={`p-5 rounded-3xl bg-white/5 border border-white/10 space-y-3 transition-all duration-300 ease-out shadow-lg ${
                currentStep >= 0 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
              }`}
            >
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-blue-400" />
                <h3 className="font-black text-sm uppercase tracking-wider text-blue-300">
                  Government Hiring
                </h3>
              </div>
              <div className="space-y-2">
                {govFlow.map((g: string, idx: number) => (
                  <div key={idx} className="flex items-center gap-2">
                    <div className="flex-1 p-2.5 rounded-xl bg-black/40 border border-white/5 text-xs font-medium text-zinc-200 text-center">
                      {g}
                    </div>
                    {idx < govFlow.length - 1 && <span className="text-blue-400 font-bold">↓</span>}
                  </div>
                ))}
              </div>
            </div>

            {/* Private */}
            <div
              className={`p-5 rounded-3xl bg-gradient-to-b from-indigo-950/70 to-zinc-900 border border-indigo-500/40 space-y-3 transition-all duration-300 ease-out shadow-2xl ${
                currentStep >= 1 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
              }`}
            >
              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-emerald-400" />
                <h3 className="font-black text-sm uppercase tracking-wider text-emerald-300">
                  Private Hiring
                </h3>
              </div>
              <div className="space-y-2">
                {privFlow.map((p: string, idx: number) => (
                  <div key={idx} className="flex items-center gap-2">
                    <div className="flex-1 p-2.5 rounded-xl bg-indigo-500/20 border border-indigo-500/30 text-xs font-bold text-white text-center shadow-sm">
                      {p}
                    </div>
                    {idx < privFlow.length - 1 && <span className="text-emerald-400 font-bold">↓</span>}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div
            className={`p-3.5 rounded-2xl bg-indigo-600/20 border border-indigo-500/40 text-center space-y-1 transition-all duration-300 ${
              currentStep >= 2 ? "opacity-100" : "opacity-0"
            }`}
          >
            <p className="font-bold text-xs sm:text-sm text-indigo-200">
              {slide.punchline || "Private hiring can be more role- and skill-oriented."}
            </p>
            {slide.disclaimer && (
              <p className="text-[11px] text-zinc-400 italic">{slide.disclaimer}</p>
            )}
          </div>
        </div>
      );
    }

    // ==========================================
    // 32. MYTH REALITY PAIRS
    // ==========================================
    case "MYTH_REALITY_PAIRS": {
      const pairs = slide.pairs || [];
      return (
        <div className="w-full max-w-5xl mx-auto space-y-5 animate-fade-in">
          <div>
            <span className="px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-xs font-bold text-indigo-300 uppercase tracking-wider">
              {slide.badge || "MYTH VS REALITY"}
            </span>
            <h2 className="text-xl sm:text-4xl font-black text-white mt-2">
              {slide.title}
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1">
              {slide.subtitle}
            </p>
          </div>

          <div className="space-y-3 pt-1">
            {pairs.map((pr: any, idx: number) => {
              const isRevealed = currentStep >= idx;
              return (
                <div
                  key={idx}
                  className={`p-4 sm:p-5 rounded-3xl border grid grid-cols-1 md:grid-cols-12 gap-3 items-center transition-all duration-300 ease-out shadow-lg ${
                    isRevealed
                      ? "bg-zinc-900/90 border-white/10 opacity-100 translate-x-0"
                      : "bg-white/2 border-white/5 opacity-25 -translate-x-3"
                  }`}
                >
                  {/* Myth */}
                  <div className="md:col-span-5 p-3 rounded-2xl bg-rose-950/30 border border-rose-500/30 space-y-1">
                    <span className="text-[10px] font-mono font-bold text-rose-400 uppercase tracking-wider block">
                      MYTH 0{idx + 1}
                    </span>
                    <p className="text-xs sm:text-sm font-bold text-rose-200">{pr.myth}</p>
                  </div>

                  <div className="hidden md:flex md:col-span-1 items-center justify-center text-zinc-400">
                    <ArrowRight className="w-5 h-5" />
                  </div>

                  {/* Reality */}
                  <div className="md:col-span-6 p-3 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 space-y-1">
                    <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-wider block">
                      INDUSTRY REALITY
                    </span>
                    <p className="text-xs sm:text-sm text-zinc-200 font-medium leading-relaxed">{pr.reality}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    // ==========================================
    // 33. CAREER OPTIONS HUB
    // ==========================================
    case "CAREER_OPTIONS_HUB": {
      const branches = slide.branches || [];
      return (
        <div className="w-full max-w-5xl mx-auto space-y-6 animate-fade-in text-center">
          <div>
            <span className="px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-xs font-bold text-indigo-300 uppercase tracking-wider">
              {slide.badge || "CAREER HORIZONS"}
            </span>
            <h2 className="text-xl sm:text-4xl font-black text-white mt-2">
              {slide.title}
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1">
              {slide.subtitle}
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-gradient-to-b from-indigo-950/50 to-zinc-900 border border-indigo-500/30 shadow-2xl relative space-y-5">
            <div
              className={`inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-black text-lg shadow-xl shadow-amber-500/25 transition-all duration-300 ${
                currentStep >= 0 ? "opacity-100 scale-100" : "opacity-0 scale-90"
              }`}
            >
              <GraduationCap className="w-6 h-6 text-white" />
              <span>{slide.hubLabel || "YOUR DEGREE"}</span>
            </div>

            <div
              className={`grid grid-cols-2 sm:grid-cols-5 gap-2.5 transition-all duration-300 ease-out ${
                currentStep >= 1 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
              }`}
            >
              {branches.map((b: string, idx: number) => (
                <div
                  key={idx}
                  className="p-3 rounded-2xl bg-white/5 border border-white/10 hover:border-indigo-400/50 text-xs font-bold text-zinc-200 shadow-sm"
                >
                  {b}
                </div>
              ))}
            </div>
          </div>

          <div
            className={`p-3.5 rounded-2xl bg-indigo-600/20 border border-indigo-500/40 font-bold text-xs sm:text-sm text-indigo-200 transition-all duration-300 ${
              currentStep >= 2 ? "opacity-100" : "opacity-0"
            }`}
          >
            {slide.punchline || "One degree can lead to multiple career paths."}
          </div>
        </div>
      );
    }

    // ==========================================
    // 34. STREAM ROLES
    // ==========================================
    case "STREAM_ROLES": {
      const roles = slide.roles || [];
      const primaryRoles = slide.primaryRoles || [];
      const rolesList = slide.rolesList || [];
      const secondaryRoles = slide.secondaryRoles || [];

      return (
        <div className="w-full max-w-5xl mx-auto space-y-5 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <span className="px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-xs font-bold text-indigo-300 uppercase tracking-wider">
                {slide.badge || slide.stream || "STREAM SPECIALIZATION"}
              </span>
              <h2 className="text-xl sm:text-3xl font-black text-white mt-2">
                {slide.title}
              </h2>
            </div>
            {slide.subtitle && (
              <p className="text-xs sm:text-sm text-zinc-400 max-w-md">
                {slide.subtitle}
              </p>
            )}
          </div>

          {roles.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {roles.map((r: any, idx: number) => {
                const isRevealed = currentStep >= idx;
                return (
                  <div
                    key={idx}
                    className={`p-4 rounded-3xl border transition-all duration-300 ease-out shadow-lg space-y-1.5 ${
                      isRevealed
                        ? "bg-gradient-to-b from-indigo-950/60 to-zinc-900 border-indigo-500/40 opacity-100 translate-y-0"
                        : "bg-white/2 border-white/5 opacity-25 translate-y-2"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-indigo-600/30 text-indigo-300 font-mono font-bold text-xs flex items-center justify-center border border-indigo-500/30">
                        {r.num || `0${idx + 1}`}
                      </span>
                      <h4 className="font-extrabold text-sm text-white">{r.title}</h4>
                    </div>
                    {r.desc && (
                      <p className="text-xs text-zinc-300 font-medium leading-relaxed pl-8">
                        {r.desc}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {primaryRoles.length > 0 && (
            <div className="space-y-4 pt-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {primaryRoles.map((pr: any, idx: number) => {
                  const isRevealed = currentStep >= idx;
                  return (
                    <div
                      key={idx}
                      className={`p-4 rounded-3xl border transition-all duration-300 ease-out shadow-lg space-y-1.5 ${
                        isRevealed
                          ? "bg-gradient-to-b from-indigo-950/70 to-zinc-900 border-indigo-500/40 opacity-100 translate-y-0"
                          : "bg-white/2 border-white/5 opacity-25 translate-y-2"
                      }`}
                    >
                      <span className="text-[10px] font-mono font-bold text-indigo-400 uppercase">
                        {pr.category}
                      </span>
                      <h4 className="font-extrabold text-sm text-white">{pr.role}</h4>
                      <p className="text-[11px] text-zinc-300 font-medium leading-tight">{pr.desc}</p>
                    </div>
                  );
                })}
              </div>

              {secondaryRoles.length > 0 && (
                <div
                  className={`p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1.5 transition-all duration-300 ${
                    currentStep >= 3 ? "opacity-100" : "opacity-0"
                  }`}
                >
                  <span className="text-[10px] font-mono text-zinc-400 uppercase font-bold">
                    Additional High-Growth Adjacent Domains:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {secondaryRoles.map((sr: string, sIdx: number) => (
                      <span
                        key={sIdx}
                        className="px-3 py-1 rounded-xl bg-indigo-500/20 border border-indigo-500/30 text-xs font-bold text-indigo-200"
                      >
                        {sr}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {rolesList.length > 0 && (
            <div className="space-y-2 pt-1">
              {rolesList.map((rl: string, idx: number) => {
                const isRevealed = currentStep >= idx;
                return (
                  <div
                    key={idx}
                    className={`p-3.5 rounded-2xl border flex items-center gap-3 transition-all duration-300 ease-out shadow-md ${
                      isRevealed
                        ? "bg-white/5 border-white/10 opacity-100 translate-x-0"
                        : "bg-white/2 border-white/5 opacity-25 -translate-x-3"
                    }`}
                  >
                    <span className="w-6 h-6 rounded-lg bg-indigo-600/30 text-indigo-300 font-mono font-bold text-xs flex items-center justify-center shrink-0 border border-indigo-500/30">
                      0{idx + 1}
                    </span>
                    <span className="text-xs sm:text-sm font-bold text-zinc-100">{rl}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      );
    }

    // ==========================================
    // 35. CAREER CAPITAL GRID
    // ==========================================
    case "CAREER_CAPITAL_GRID": {
      const blocks = slide.blocks || [];
      return (
        <div className="w-full max-w-5xl mx-auto space-y-5 animate-fade-in">
          <div>
            <span className="px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-xs font-bold text-indigo-300 uppercase tracking-wider">
              {slide.badge || "CAREER CAPITAL"}
            </span>
            <h2 className="text-xl sm:text-4xl font-black text-white mt-2">
              {slide.title}
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1">
              {slide.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-1">
            {blocks.map((b: any, idx: number) => {
              const isRevealed = currentStep >= idx;
              return (
                <div
                  key={idx}
                  className={`p-4 sm:p-5 rounded-3xl border transition-all duration-300 ease-out shadow-lg space-y-2 ${
                    isRevealed
                      ? "bg-gradient-to-b from-indigo-950/60 to-zinc-900 border-indigo-500/40 opacity-100 translate-y-0"
                      : "bg-white/2 border-white/5 opacity-25 translate-y-2"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-indigo-400">
                      {b.num || `0${idx + 1}`}
                    </span>
                    <span className="w-2 h-2 rounded-full bg-indigo-400" />
                  </div>
                  <h3 className="font-extrabold text-base text-white">{b.label}</h3>
                  <p className="text-xs text-zinc-300 font-medium leading-relaxed">{b.desc}</p>
                </div>
              );
            })}
          </div>

          {slide.punchline && (
            <div
              className={`p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-center font-bold text-xs sm:text-sm text-amber-300 transition-all duration-300 ${
                currentStep >= 3 ? "opacity-100" : "opacity-0"
              }`}
            >
              {slide.punchline}
            </div>
          )}
        </div>
      );
    }

    // ==========================================
    // 36. STAIRCASE FLOW
    // ==========================================
    case "STAIRCASE_FLOW": {
      const steps = slide.steps || [];
      return (
        <div className="w-full max-w-5xl mx-auto space-y-5 animate-fade-in">
          <div>
            <span className="px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-xs font-bold text-indigo-300 uppercase tracking-wider">
              {slide.badge || "THE STAIRCASE"}
            </span>
            <h2 className="text-xl sm:text-4xl font-black text-white mt-2">
              {slide.title}
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1">
              {slide.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
            {steps.map((st: string, idx: number) => {
              const isRevealed = currentStep >= idx;
              return (
                <div
                  key={idx}
                  className={`p-3.5 rounded-2xl border flex items-center gap-2.5 transition-all duration-300 ease-out shadow-md ${
                    isRevealed
                      ? "bg-gradient-to-b from-indigo-900/50 to-zinc-900 border-indigo-500/40 opacity-100 translate-y-0"
                      : "bg-white/2 border-white/5 opacity-25 translate-y-2"
                  }`}
                >
                  <span className="w-6 h-6 rounded-lg bg-indigo-500/20 text-indigo-300 font-mono font-bold text-xs flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <span className="text-xs font-bold text-white leading-tight">{st.replace(/^\d+\.\s*/, '')}</span>
                </div>
              );
            })}
          </div>

          <div
            className={`p-3.5 rounded-2xl bg-indigo-600/20 border border-indigo-500/40 text-center font-bold text-xs sm:text-sm text-indigo-200 transition-all duration-300 ${
              currentStep >= 3 ? "opacity-100" : "opacity-0"
            }`}
          >
            {slide.punchline || "Learn → Build → Prove → Apply"}
          </div>
        </div>
      );
    }

    // ==========================================
    // 37. DEDICATED ROADMAP
    // ==========================================
    case "DEDICATED_ROADMAP": {
      const foundation = slide.foundation || [];
      const industrySkills = slide.industrySkills || [];

      return (
        <div className="w-full max-w-5xl mx-auto space-y-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <div>
              <span className="px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-xs font-bold text-indigo-300 uppercase tracking-wider">
                {slide.badge || slide.stream || "DEDICATED ROADMAP"}
              </span>
              <h2 className="text-xl sm:text-3xl font-black text-white mt-1.5">
                {slide.title}
              </h2>
            </div>
          </div>

          <div className="space-y-2.5 pt-1">
            {/* Step 1: Foundation */}
            <div
              className={`p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1.5 transition-all duration-300 ease-out shadow-sm ${
                currentStep >= 0 ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-3"
              }`}
            >
              <span className="text-[10px] font-mono font-bold text-indigo-400 uppercase">
                01 • FOUNDATION
              </span>
              <div className="flex flex-wrap gap-1.5">
                {foundation.map((f: string, idx: number) => (
                  <span key={idx} className="px-2.5 py-0.5 rounded-lg bg-white/5 border border-white/10 text-xs font-bold text-zinc-200">
                    {f}
                  </span>
                ))}
              </div>
            </div>

            {/* Step 2: Industry Skills */}
            <div
              className={`p-3.5 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 space-y-1.5 transition-all duration-300 ease-out shadow-sm ${
                currentStep >= 1 ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-3"
              }`}
            >
              <span className="text-[10px] font-mono font-bold text-indigo-300 uppercase">
                02 • INDUSTRY SKILLS & TOOLS
              </span>
              <div className="flex flex-wrap gap-1.5">
                {industrySkills.map((s: string, idx: number) => (
                  <span key={idx} className="px-2.5 py-0.5 rounded-lg bg-indigo-500/20 border border-indigo-500/30 text-xs font-bold text-white">
                    {s}
                  </span>
                ))}
              </div>
            </div>

            {/* Step 3: Projects & Proof */}
            <div
              className={`grid grid-cols-1 sm:grid-cols-2 gap-2.5 transition-all duration-300 ease-out ${
                currentStep >= 2 ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-3"
              }`}
            >
              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                <span className="text-[10px] font-mono font-bold text-amber-400 uppercase">03 • REAL PROJECTS</span>
                <p className="text-xs text-zinc-200 font-medium">{slide.projects}</p>
              </div>
              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase">04 • PROOF OF WORK</span>
                <p className="text-xs text-zinc-200 font-medium">{slide.proof}</p>
              </div>
            </div>

            {/* Step 4: Opportunity */}
            <div
              className={`p-3 rounded-2xl bg-gradient-to-r from-emerald-950/60 to-indigo-950/60 border border-emerald-500/30 flex items-center justify-between text-xs font-bold transition-all duration-300 ${
                currentStep >= 3 ? "opacity-100" : "opacity-0"
              }`}
            >
              <span className="text-zinc-300">TARGET OPPORTUNITY:</span>
              <span className="text-emerald-300 font-mono font-black">{slide.opportunity}</span>
            </div>
          </div>
        </div>
      );
    }

    // ==========================================
    // 38. COURSE VS CAREER
    // ==========================================
    case "COURSE_VS_CAREER": {
      const normalCourse = slide.normalCourse || [];
      const careerProgram = slide.careerProgram || [];

      return (
        <div className="w-full max-w-5xl mx-auto space-y-5 animate-fade-in">
          <div>
            <span className="px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-xs font-bold text-indigo-300 uppercase tracking-wider">
              {slide.badge || "PARADIGM SHIFT"}
            </span>
            <h2 className="text-xl sm:text-4xl font-black text-white mt-2">
              {slide.title}
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1">
              {slide.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            {/* Normal Course */}
            <div
              className={`p-5 rounded-3xl bg-rose-950/20 border border-rose-500/30 space-y-3 transition-all duration-300 ease-out shadow-lg ${
                currentStep >= 0 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
              }`}
            >
              <span className="text-xs font-mono font-bold text-rose-400 uppercase tracking-wider block">
                NORMAL ONLINE COURSE
              </span>
              <div className="space-y-1.5">
                {normalCourse.map((c: string, idx: number) => (
                  <div key={idx} className="p-2 rounded-xl bg-black/40 border border-rose-500/20 text-xs text-rose-200 flex items-center gap-2">
                    <span className="text-rose-400 font-bold">✕</span>
                    <span>{c}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Career Oriented Program */}
            <div
              className={`p-5 rounded-3xl bg-gradient-to-b from-indigo-950/70 to-zinc-900 border border-indigo-500/40 space-y-3 transition-all duration-300 ease-out shadow-2xl ${
                currentStep >= 1 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
              }`}
            >
              <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider block">
                CAREER-ORIENTED PROGRAM
              </span>
              <div className="space-y-1.5">
                {careerProgram.map((c: string, idx: number) => (
                  <div key={idx} className="p-2 rounded-xl bg-indigo-500/20 border border-indigo-500/30 text-xs text-white font-bold flex items-center gap-2 shadow-sm">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>{c}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div
            className={`p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-center font-bold text-xs sm:text-sm text-amber-300 transition-all duration-300 ${
              currentStep >= 2 ? "opacity-100" : "opacity-0"
            }`}
          >
            {slide.punchline || "Certificate proves completion. Portfolio proves capability."}
          </div>
        </div>
      );
    }

    // ==========================================
    // 39. PROGRAM OVERVIEW
    // ==========================================
    case "PROGRAM_OVERVIEW": {
      const pillars = slide.pillars || [];
      return (
        <div className="w-full max-w-5xl mx-auto space-y-5 animate-fade-in text-center sm:text-left">
          <div>
            <span className="px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-xs font-bold text-indigo-300 uppercase tracking-wider">
              {slide.badge || "FLAGSHIP PROGRAM"}
            </span>
            <h2 className="text-xl sm:text-3xl lg:text-4xl font-black text-white mt-2">
              {slide.title}
            </h2>
            <div className="mt-2 inline-block px-4 py-1 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 font-mono font-black text-xs sm:text-sm">
              {slide.subtitle || "3-MONTH LIVE PROGRAM"}
            </div>
          </div>

          <div
            className={`grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 transition-all duration-300 ease-out ${
              currentStep >= 1 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
            }`}
          >
            {pillars.map((p: string, idx: number) => (
              <div
                key={idx}
                className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3 shadow-md hover:border-indigo-500/40 transition-all"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-xs sm:text-sm font-bold text-zinc-100">{p}</span>
              </div>
            ))}
          </div>
        </div>
      );
    }

    // ==========================================
    // 40. WHAT YOU GET
    // ==========================================
    case "WHAT_YOU_GET": {
      const cards = slide.cards || [];
      return (
        <div className="w-full max-w-5xl mx-auto space-y-5 animate-fade-in">
          <div>
            <span className="px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-xs font-bold text-indigo-300 uppercase tracking-wider">
              {slide.badge || "DELIVERABLES"}
            </span>
            <h2 className="text-xl sm:text-4xl font-black text-white mt-2">
              {slide.title || "What You Get"}
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1">
              {slide.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-1">
            {cards.map((c: any, idx: number) => {
              const isRevealed = currentStep >= idx;
              return (
                <div
                  key={idx}
                  className={`p-4 sm:p-5 rounded-3xl border transition-all duration-300 ease-out shadow-lg space-y-2 ${
                    isRevealed
                      ? "bg-gradient-to-b from-indigo-950/60 to-zinc-900 border-indigo-500/40 opacity-100 translate-y-0"
                      : "bg-white/2 border-white/5 opacity-25 translate-y-2"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="w-7 h-7 rounded-xl bg-indigo-600/30 text-indigo-300 font-mono font-black text-xs flex items-center justify-center border border-indigo-500/30">
                      {c.num || `0${idx + 1}`}
                    </span>
                    <span className="w-2 h-2 rounded-full bg-indigo-400" />
                  </div>
                  <h3 className="font-extrabold text-sm sm:text-base text-white">{c.title}</h3>
                  <p className="text-xs text-zinc-300 font-medium leading-relaxed">{c.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    // ==========================================
    // 41. PIPELINE FLOW
    // ==========================================
    case "PIPELINE_FLOW": {
      const stages = slide.stages || [];
      return (
        <div className="w-full max-w-5xl mx-auto space-y-6 animate-fade-in text-center">
          <div>
            <span className="px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-xs font-bold text-indigo-300 uppercase tracking-wider">
              {slide.badge || "METHODOLOGY"}
            </span>
            <h2 className="text-xl sm:text-4xl font-black text-white mt-2">
              {slide.title}
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1">
              {slide.subtitle}
            </p>
          </div>

          <div
            className={`grid grid-cols-2 sm:grid-cols-6 gap-2.5 pt-2 transition-all duration-300 ease-out ${
              currentStep >= 1 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
            }`}
          >
            {stages.map((st: string, idx: number) => (
              <div
                key={idx}
                className="p-3.5 rounded-2xl bg-gradient-to-b from-indigo-950/60 to-zinc-900 border border-indigo-500/30 text-center space-y-1.5 shadow-md"
              >
                <span className="w-6 h-6 rounded-lg bg-indigo-600/30 text-indigo-300 font-mono font-bold text-xs mx-auto flex items-center justify-center border border-indigo-500/30">
                  {idx + 1}
                </span>
                <p className="text-xs font-bold text-white leading-tight">{st}</p>
              </div>
            ))}
          </div>

          {slide.punchline && (
            <div
              className={`p-3.5 rounded-2xl bg-indigo-600/20 border border-indigo-500/40 font-bold text-xs sm:text-base text-indigo-200 transition-all duration-300 ${
                currentStep >= 2 ? "opacity-100" : "opacity-0"
              }`}
            >
              {slide.punchline}
            </div>
          )}
        </div>
      );
    }

    // ==========================================
    // 42. PROOF HIERARCHY
    // ==========================================
    case "PROOF_HIERARCHY": {
      const layers = slide.layers || [];
      return (
        <div className="w-full max-w-5xl mx-auto space-y-5 animate-fade-in">
          <div>
            <span className="px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-xs font-bold text-indigo-300 uppercase tracking-wider">
              {slide.badge || "EVIDENCE ARCHITECTURE"}
            </span>
            <h2 className="text-xl sm:text-4xl font-black text-white mt-2">
              {slide.title}
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1">
              {slide.subtitle}
            </p>
          </div>

          <div className="space-y-2 pt-1">
            {layers.map((ly: any, idx: number) => {
              const isRevealed = currentStep >= idx;
              return (
                <div
                  key={idx}
                  className={`p-3.5 sm:p-4 rounded-2xl border flex items-center justify-between gap-3 transition-all duration-300 ease-out shadow-md ${
                    isRevealed
                      ? "bg-white/5 border-white/10 opacity-100 translate-x-0"
                      : "bg-white/2 border-white/5 opacity-25 -translate-x-3"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 rounded-xl bg-indigo-500/20 text-indigo-300 font-mono font-black text-xs">
                      {ly.label}
                    </span>
                    <span className="text-xs sm:text-sm font-medium text-zinc-200">{ly.desc}</span>
                  </div>
                  {idx < layers.length - 1 && <span className="text-zinc-500 text-xs">↓</span>}
                </div>
              );
            })}
          </div>

          {slide.punchline && (
            <div
              className={`p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-center font-bold text-xs sm:text-sm text-amber-300 transition-all duration-300 ${
                currentStep >= 2 ? "opacity-100" : "opacity-0"
              }`}
            >
              {slide.punchline}
            </div>
          )}
        </div>
      );
    }

    // ==========================================
    // 43. CERTIFICATE SHOWCASE
    // ==========================================
    case "CERTIFICATE_SHOWCASE": {
      return (
        <div className="w-full max-w-4xl mx-auto space-y-6 animate-fade-in text-center py-6">
          <div>
            <span className="px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-xs font-bold text-amber-300 uppercase tracking-wider">
              {slide.badge || "OFFICIAL RECOGNITION"}
            </span>
          </div>

          <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-b from-amber-950/30 via-zinc-900 to-zinc-950 border-2 border-amber-500/40 shadow-2xl space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
              <Award className="w-48 h-48 text-amber-400" />
            </div>

            <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-500/40 mx-auto flex items-center justify-center shadow-lg">
              <Award className="w-8 h-8 text-amber-300" />
            </div>

            <div className="space-y-2">
              <h1 className="text-3xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-500 tracking-tight">
                {slide.title || "JOINT CERTIFICATE"}
              </h1>
              <h3 className="text-base sm:text-xl font-bold font-mono tracking-widest text-indigo-300">
                {slide.subtitle || "NIT HAMIRPUR × IAPT × UNISOLE"}
              </h3>
            </div>

            <p className="text-xs sm:text-sm text-zinc-300 max-w-md mx-auto italic">
              {slide.note || "Awarded upon successful completion of the industrial training & project milestones."}
            </p>
          </div>
        </div>
      );
    }

    // ==========================================
    // 44. TALENT POOL PIPELINE
    // ==========================================
    case "TALENT_POOL_PIPELINE": {
      const steps = slide.steps || [];
      return (
        <div className="w-full max-w-5xl mx-auto space-y-6 animate-fade-in text-center">
          <div>
            <span className="px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-xs font-bold text-indigo-300 uppercase tracking-wider">
              {slide.badge || "TALENT NETWORK"}
            </span>
            <h2 className="text-xl sm:text-4xl font-black text-white mt-2">
              {slide.title}
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1">
              {slide.subtitle}
            </p>
          </div>

          <div
            className={`grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2 transition-all duration-300 ease-out ${
              currentStep >= 1 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
            }`}
          >
            {steps.map((st: string, idx: number) => (
              <div
                key={idx}
                className="p-4 rounded-3xl bg-gradient-to-b from-indigo-950/60 to-zinc-900 border border-indigo-500/30 text-center space-y-2 shadow-lg"
              >
                <span className="w-7 h-7 rounded-xl bg-indigo-600/30 text-indigo-300 font-mono font-bold text-xs mx-auto flex items-center justify-center border border-indigo-500/30">
                  {idx + 1}
                </span>
                <h4 className="font-extrabold text-xs sm:text-sm text-white">{st}</h4>
              </div>
            ))}
          </div>

          {slide.disclaimer && (
            <p className="text-xs text-zinc-500 italic pt-2">
              {slide.disclaimer}
            </p>
          )}
        </div>
      );
    }

    // ==========================================
    // 45. BEFORE AFTER POLL
    // ==========================================
    case "BEFORE_AFTER_POLL": {
      return (
        <div className="w-full max-w-5xl mx-auto space-y-6 animate-fade-in text-center">
          <div>
            <span className="px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-xs font-bold text-indigo-300 uppercase tracking-wider">
              {slide.badge || "IMPACT ANALYSIS"}
            </span>
            <h2 className="text-xl sm:text-4xl font-black text-white mt-2">
              {slide.title || "Did Your Thinking Change?"}
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1">
              {slide.subtitle || "Awareness → Better Decisions"}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            {/* Before Today */}
            <div
              className={`p-6 rounded-3xl bg-white/5 border border-white/10 space-y-3 transition-all duration-300 ease-out shadow-lg ${
                currentStep >= 0 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
              }`}
            >
              <span className="text-xs font-mono font-bold text-zinc-400 uppercase">
                {slide.beforePollTitle || "BEFORE TODAY (POLL 01)"}
              </span>
              <p className="text-xs text-zinc-300">
                Baseline student preference before market breakdown.
              </p>
              <div className="p-3 rounded-2xl bg-black/40 border border-white/5 text-xs font-mono text-indigo-300">
                Live Data Captured in Session
              </div>
            </div>

            {/* After Today */}
            <div
              className={`p-6 rounded-3xl bg-gradient-to-b from-indigo-950/70 to-zinc-900 border border-indigo-500/40 space-y-3 transition-all duration-300 ease-out shadow-2xl ${
                currentStep >= 1 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
              }`}
            >
              <span className="text-xs font-mono font-bold text-emerald-400 uppercase">
                {slide.afterPollTitle || "AFTER TODAY (POLL 08)"}
              </span>
              <p className="text-xs text-zinc-200 font-medium">
                Informed decision-making based on skills & roadmap clarity.
              </p>
              <div className="p-3 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-xs font-mono font-bold text-emerald-300">
                Live Outcome Comparison
              </div>
            </div>
          </div>

          <div
            className={`p-3.5 rounded-2xl bg-indigo-600/20 border border-indigo-500/40 font-bold text-xs sm:text-base text-indigo-200 transition-all duration-300 ${
              currentStep >= 1 ? "opacity-100" : "opacity-0"
            }`}
          >
            {slide.punchline || "Awareness → Better Decisions"}
          </div>
        </div>
      );
    }

    // ==========================================
    // 46. ENROLLMENT CTA
    // ==========================================
    case "ENROLLMENT_CTA": {
      const actions = slide.actions || ["Choose Your Stream", "Explore the Roadmap", "Register / Enquire"];
      const targetUrl = slide.qrUrl || "https://unisole.org/programs";

      return (
        <div className="w-full max-w-5xl mx-auto space-y-6 animate-fade-in text-center">
          <div>
            <span className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-xs font-bold text-emerald-300 uppercase tracking-wider">
              {slide.badge || "ENROLLMENT"}
            </span>
            <h2 className="text-xl sm:text-4xl font-black text-white mt-2">
              {slide.title || "Your Next Step Starts Here"}
            </h2>
            <p className="text-xs sm:text-sm text-zinc-300 font-medium mt-1">
              {slide.subtitle || "3-Month Live Industrial Training cum Internship Opportunity Program"}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center pt-2">
            {/* Left: Action steps */}
            <div
              className={`md:col-span-6 space-y-3 text-left transition-all duration-300 ease-out ${
                currentStep >= 0 ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-3"
              }`}
            >
              <h3 className="font-extrabold text-base text-zinc-100">Explore & Get Started</h3>
              <div className="space-y-2">
                {actions.map((act: string, idx: number) => (
                  <div key={idx} className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3">
                    <span className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 font-mono font-bold text-xs flex items-center justify-center shrink-0">
                      0{idx + 1}
                    </span>
                    <span className="text-xs sm:text-sm font-bold text-zinc-200">{act}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: QR Code Frame */}
            <div
              className={`md:col-span-6 p-6 rounded-3xl bg-gradient-to-b from-indigo-950/80 to-zinc-900 border border-indigo-500/40 text-center space-y-3 shadow-2xl transition-all duration-300 ease-out ${
                currentStep >= 1 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
              }`}
            >
              <div className="p-3 bg-white rounded-2xl inline-block shadow-xl">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(targetUrl)}`}
                  alt="Scan QR"
                  className="w-36 h-36 sm:w-44 sm:h-44 object-contain"
                />
              </div>
              <p className="text-xs font-bold text-emerald-300">
                {slide.qrPrompt || "Scan QR Code to Explore Program & Register"}
              </p>
            </div>
          </div>
        </div>
      );
    }

    // ==========================================
    // 47. FINAL MESSAGE
    // ==========================================
    case "FINAL_MESSAGE": {
      return (
        <div className="w-full max-w-4xl mx-auto space-y-6 sm:space-y-8 animate-fade-in text-center py-8">
          <div
            className={`transition-all duration-500 ease-out ${
              currentStep >= 0 ? "opacity-100 scale-100" : "opacity-0 scale-95"
            }`}
          >
            <h1 className="text-3xl sm:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-100 to-indigo-300 tracking-tight leading-tight">
              {slide.title || "Your degree is not your destination."}
            </h1>
          </div>

          <div
            className={`transition-all duration-300 ease-out ${
              currentStep >= 1 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
            }`}
          >
            <p className="text-base sm:text-2xl text-amber-300 font-bold max-w-2xl mx-auto leading-relaxed">
              {slide.subtitle || "Your skills + projects + proof + decisions build your career."}
            </p>
          </div>

          <div
            className={`pt-4 transition-all duration-300 ${
              currentStep >= 1 ? "opacity-100" : "opacity-0"
            }`}
          >
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-2xl bg-white/5 border border-white/10 text-xs font-mono text-zinc-300">
              <span className="w-2 h-2 rounded-full bg-indigo-400" />
              <span>{slide.org || "UNISOLE Skill AI Labs"}</span>
            </div>
          </div>

          {slide.closingQuote && (
            <p className="text-xs sm:text-sm text-zinc-400 italic max-w-xl mx-auto pt-2">
              {slide.closingQuote}
            </p>
          )}
        </div>
      );
    }

    // ==========================================
    // 48. CONTENT (BULLETS) & OTHER DEFAULT
    // ==========================================
    case "CONTENT":
    default: {
      return (
        <div className="w-full max-w-5xl mx-auto space-y-5 animate-fade-in text-center sm:text-left">
          {slide.badge && (
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-xs font-bold text-indigo-300">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>{slide.badge}</span>
            </div>
          )}

          <h1 className="text-2xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            {slide.title || "Slide Title"}
          </h1>

          {slide.subtitle && (
            <p className="text-sm sm:text-xl text-zinc-300 max-w-3xl leading-relaxed">
              {slide.subtitle}
            </p>
          )}

          {Array.isArray(slide.bullets) && slide.bullets.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-2">
              {slide.bullets.map((bullet: string, idx: number) => {
                const isRevealed = currentStep >= idx;
                return (
                  <div
                    key={idx}
                    className={`p-4 sm:p-5 rounded-2xl border backdrop-blur-md flex items-start gap-3.5 shadow-md transition-all duration-300 ease-out ${
                      isRevealed
                        ? "bg-white/5 border-white/10 opacity-100 translate-y-0"
                        : "bg-white/2 border-white/5 opacity-20 translate-y-2"
                    }`}
                  >
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center text-white font-bold text-xs sm:text-sm shrink-0">
                      {idx + 1}
                    </div>
                    <p className="text-xs sm:text-base text-zinc-200 font-medium leading-relaxed">
                      {bullet}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      );
    }
  }
}

export default function SlideRenderer(props: SlideRendererProps) {
  const content = renderSlideContent(props);
  if (!content) return null;
  return (
    <div className="w-full min-w-[280px] max-w-5xl mx-auto flex flex-col justify-center shrink-0">
      {content}
    </div>
  );
}
