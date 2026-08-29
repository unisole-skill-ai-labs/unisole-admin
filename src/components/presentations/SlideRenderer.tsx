import React from "react";
import {
  Sparkles,
  Users,
  Trophy,
  Flame,
  CheckCircle2,
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
} from "lucide-react";

interface SlideRendererProps {
  slide: any;
  buildStep?: number;
  presentationTitle?: string;
  isProjector?: boolean;
  quizState?: any;
  remainingTime?: number | null;
  leaderboard?: any[];
}

export default function SlideRenderer({
  slide,
  buildStep = 999, // default to all revealed in static preview
  presentationTitle = "UNISOLE AI CAMPUS PROGRAM",
  isProjector = false,
  quizState = {},
  remainingTime = null,
  leaderboard = [],
}: SlideRendererProps) {
  if (!slide) return null;

  const currentStep = buildStep;

  switch (slide.type) {
    // ==========================================
    // 1. COVER SLIDE
    // ==========================================
    case "COVER": {
      return (
        <div className="w-full max-w-5xl mx-auto text-center space-y-6 sm:space-y-8 animate-fade-in">
          {/* Badge */}
          <div
            className={`inline-flex items-center gap-2 px-5 py-2 rounded-full bg-gradient-to-r from-indigo-500/20 to-violet-500/20 border border-indigo-500/40 text-xs sm:text-sm font-bold text-indigo-300 shadow-lg shadow-indigo-500/10 transition-all duration-700 ${
              currentStep >= 1 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse" />
            <span>{slide.badge || "INDUSTRIAL TRAINING & INTERNSHIP OPPORTUNITY PROGRAM"}</span>
          </div>

          {/* Main Title & Subtitle */}
          <div className="space-y-4">
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-100 to-indigo-300 drop-shadow-sm">
              {slide.title || "UNISOLE AI CAMPUS PROGRAM"}
            </h1>
            <p
              className={`text-lg sm:text-2xl text-zinc-300 font-medium max-w-3xl mx-auto leading-relaxed transition-all duration-700 ${
                currentStep >= 2 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              }`}
            >
              {slide.subtitle || "For College Students Across Himachal Pradesh"}
            </p>
          </div>

          {/* Bottom Lab Tagline */}
          <div
            className={`pt-6 transition-all duration-700 ${
              currentStep >= 3 ? "opacity-100 scale-100" : "opacity-0 scale-95"
            }`}
          >
            <div className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md text-xs sm:text-sm font-bold tracking-widest uppercase text-indigo-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>{slide.org || "UNISOLE SKILL AI LABS"}</span>
            </div>
          </div>
        </div>
      );
    }

    // ==========================================
    // 2. FOUNDER BIO SLIDE
    // ==========================================
    case "FOUNDER_BIO": {
      return (
        <div className="w-full max-w-6xl mx-auto space-y-6 animate-fade-in">
          {/* Header */}
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-xs font-bold text-indigo-300 uppercase tracking-wider">
              {slide.badge || "FOUNDER"}
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left: Avatar / Bio Profile */}
            <div
              className={`lg:col-span-5 p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-white/10 to-white/5 border border-white/10 backdrop-blur-xl space-y-4 text-center sm:text-left transition-all duration-700 ${
                currentStep >= 0 ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-6"
              }`}
            >
              <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white text-3xl font-black shadow-xl shadow-indigo-500/20 mx-auto sm:mx-0">
                {slide.initials || "AM"}
              </div>
              <div>
                <h2 className="text-2xl sm:text-3xl font-black text-white">{slide.title || "AJAY MOKTA"}</h2>
                <p className="text-xs sm:text-sm text-indigo-300 font-medium mt-1">
                  {slide.subtitle || "Founder, UNISOLE Skill AI Labs · B.Tech, NIT Hamirpur"}
                </p>
              </div>
            </div>

            {/* Right: Credentials & Quote */}
            <div className="lg:col-span-7 space-y-6">
              {/* Credentials List */}
              <div
                className={`grid grid-cols-1 sm:grid-cols-2 gap-3 transition-all duration-700 ${
                  currentStep >= 1 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
                }`}
              >
                {(slide.credentials || [
                  "NIT Hamirpur Alumnus",
                  "NASA Space Apps Challenge",
                  "3rd — National Startup Summit",
                  "ICAR-IARI Incubation Grantee",
                  "Speaker & Mentor on Applied AI",
                ]).map((cred: string, idx: number) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3 text-xs sm:text-sm text-zinc-200 font-medium"
                  >
                    <div className="w-2 h-2 rounded-full bg-indigo-400 shrink-0" />
                    <span>{cred}</span>
                  </div>
                ))}
              </div>

              {/* Quote Card */}
              <div
                className={`p-6 rounded-3xl bg-gradient-to-r from-indigo-950/60 to-violet-950/60 border border-indigo-500/30 text-indigo-100 text-sm sm:text-base italic font-medium leading-relaxed transition-all duration-700 ${
                  currentStep >= 2 ? "opacity-100 scale-100" : "opacity-0 scale-95"
                }`}
              >
                {slide.quote ||
                  "“A degree from any college in Himachal should be backed by skills that compete globally.”"}
              </div>
            </div>
          </div>
        </div>
      );
    }

    // ==========================================
    // 3. TEAM GRID SLIDE
    // ==========================================
    case "TEAM_GRID": {
      const members = slide.members || [
        { initials: "GG", name: "Girish Gaurav Sharma", role: "GoodSpace AI → Great Learning" },
        { initials: "SP", name: "Shabd Patel", role: "Software Engineer, BlackRock" },
        { initials: "K", name: "Kushal", role: "IIT Patna → Tech Mahindra" },
        { initials: "AK", name: "Aditya Kaushal", role: "M.Tech, IIT Delhi" },
        { initials: "DG", name: "Dishant Gupta", role: "Ex-Baker Hughes · Former ISRO Intern" },
      ];

      return (
        <div className="w-full max-w-6xl mx-auto space-y-6 animate-fade-in">
          <div className="flex items-center justify-between">
            <span className="px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-xs font-bold text-indigo-300 uppercase tracking-wider">
              {slide.badge || "MENTORS & ADVISORS"}
            </span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
            {slide.title || "THE UNISOLE TEAM"}
          </h2>

          {/* 4 Pillars Ribbon */}
          <div
            className={`flex flex-wrap items-center gap-2 sm:gap-4 py-2 transition-all duration-700 ${
              currentStep >= 0 ? "opacity-100" : "opacity-0"
            }`}
          >
            {["INDUSTRY", "ENGINEERING", "RESEARCH", "ACADEMIC EXPOSURE"].map((p, idx) => (
              <React.Fragment key={p}>
                <span className="px-3 py-1 rounded-xl bg-white/10 text-indigo-300 text-xs sm:text-sm font-bold tracking-wider">
                  {p}
                </span>
                {idx < 3 && <span className="text-zinc-500 font-bold">+</span>}
              </React.Fragment>
            ))}
          </div>

          {/* Mentors Cards Grid */}
          <div
            className={`grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 transition-all duration-700 ${
              currentStep >= 1 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
            }`}
          >
            {members.map((m: any, idx: number) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-white/5 border border-white/10 text-center space-y-3 hover:border-indigo-500/40 transition-colors shadow-lg"
              >
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 to-violet-500 text-white font-black text-sm flex items-center justify-center mx-auto shadow-md">
                  {m.initials}
                </div>
                <div>
                  <div className="font-bold text-xs sm:text-sm text-white leading-snug">{m.name}</div>
                  <div className="text-[10px] sm:text-xs text-indigo-300 mt-1 font-medium leading-tight">
                    {m.role}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Closing Line */}
          <div
            className={`pt-2 transition-all duration-700 ${
              currentStep >= 2 ? "opacity-100" : "opacity-0"
            }`}
          >
            <p className="text-sm sm:text-base font-semibold text-zinc-300 border-l-2 border-indigo-400 pl-3">
              {slide.subtitle || "People who have built and shipped real systems."}
            </p>
          </div>
        </div>
      );
    }

    // ==========================================
    // 4. BIG QUESTION SLIDE ("आगे क्या सोचा है?")
    // ==========================================
    case "BIG_QUESTION": {
      return (
        <div className="w-full max-w-4xl mx-auto text-center space-y-8 py-12 animate-fade-in">
          <div
            className={`transition-all duration-1000 ${
              currentStep >= 0 ? "opacity-100 scale-100" : "opacity-0 scale-90"
            }`}
          >
            <h1 className="text-5xl sm:text-8xl lg:text-9xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-500 drop-shadow-2xl font-serif">
              {slide.title || "आगे क्या सोचा है?"}
            </h1>
          </div>

          {/* Pulsating reflective dot / subtext */}
          <div
            className={`transition-all duration-700 flex flex-col items-center gap-4 ${
              currentStep >= 1 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            <div className="w-4 h-4 rounded-full bg-amber-400 shadow-lg shadow-amber-400/50 animate-ping" />
            {slide.subtitle && (
              <p className="text-base sm:text-xl text-zinc-400 max-w-xl mx-auto italic font-medium">
                {slide.subtitle}
              </p>
            )}
          </div>
        </div>
      );
    }

    // ==========================================
    // 5. PILLARS OVERVIEW SLIDE
    // ==========================================
    case "PILLARS_OVERVIEW": {
      const pillars = slide.pillars || [
        { number: "01", label: "The Job Market", revealedText: "Far More Graduates. A Different Map." },
        { number: "02", label: "Rise of Private Sector", revealedText: "An Economy That Did Not Exist in 1991." },
        { number: "03", label: "What People Get Wrong", revealedText: "The Fears are Real. They are Incomplete." },
        { number: "04", label: "Time & Opportunity Cost", revealedText: "What Can Two Years Change?" },
      ];

      return (
        <div className="w-full max-w-6xl mx-auto space-y-8 animate-fade-in">
          <div>
            <span className="px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-xs font-bold text-indigo-300 uppercase tracking-wider">
              {slide.badge || "THE LANDSCAPE"}
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-white mt-3 leading-tight">
              {slide.title || "FOUR THINGS HAVE CHANGED"}
            </h2>
            <p className="text-sm sm:text-lg text-zinc-400 font-medium mt-1">
              {slide.subtitle || "THE WORLD YOU ARE ENTERING."}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {pillars.map((p: any, idx: number) => {
              const isRevealed = currentStep >= idx;
              return (
                <div
                  key={idx}
                  className={`p-6 rounded-3xl border transition-all duration-700 space-y-4 shadow-xl ${
                    isRevealed
                      ? "bg-gradient-to-b from-indigo-950/50 to-zinc-900 border-indigo-500/50 translate-y-0 opacity-100"
                      : "bg-white/5 border-white/10 opacity-30 translate-y-4"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-black text-indigo-400">
                      PILLAR {p.number}
                    </span>
                    <span className="w-7 h-7 rounded-xl bg-indigo-500/20 text-indigo-300 text-xs font-bold flex items-center justify-center">
                      {isRevealed ? <Check className="w-4 h-4" /> : "?"}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-lg sm:text-xl font-bold text-white">
                      {isRevealed ? p.label : "Pillar " + p.number}
                    </h3>
                    <p className="text-xs sm:text-sm text-zinc-400 font-medium leading-relaxed">
                      {isRevealed ? p.revealedText : "Locked"}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    // ==========================================
    // 6. COMPARISON STATS (PILLAR 01: JOB MARKET)
    // ==========================================
    case "COMPARISON_STATS": {
      return (
        <div className="w-full max-w-6xl mx-auto space-y-6 animate-fade-in">
          <div>
            <span className="px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-xs font-bold text-cyan-300 uppercase tracking-wider">
              {slide.badge || "PILLAR 01"}
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-white mt-2">
              {slide.title || "THE JOB MARKET"}
            </h2>
            <p className="text-sm sm:text-base text-zinc-400 font-semibold mt-1">
              {slide.subtitle || "FAR MORE GRADUATES. A DIFFERENT MAP."}
            </p>
          </div>

          {/* Stats Comparison Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* 1990-91 Box */}
            <div
              className={`p-6 rounded-3xl bg-white/5 border border-white/10 space-y-3 transition-all duration-700 ${
                currentStep >= 0 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              }`}
            >
              <span className="text-xs font-mono font-bold text-zinc-400">1990-91</span>
              <div className="text-3xl sm:text-4xl font-black text-zinc-200">
                {slide.stat1?.count || "49 lakh"}
              </div>
              <div className="text-xs text-zinc-400 font-medium uppercase">
                {slide.stat1?.label || "IN HIGHER EDUCATION"}
              </div>
              <div className="text-xs font-bold text-zinc-500">{slide.stat1?.ratio || "~6% ENROLMENT RATIO"}</div>
            </div>

            {/* 2023-24 Box */}
            <div
              className={`p-6 rounded-3xl bg-gradient-to-b from-cyan-950/60 to-zinc-900 border border-cyan-500/40 space-y-3 transition-all duration-700 shadow-xl ${
                currentStep >= 1 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              }`}
            >
              <span className="text-xs font-mono font-bold text-cyan-400">2023-24 (9x Surge)</span>
              <div className="text-3xl sm:text-4xl font-black text-cyan-300">
                {slide.stat2?.count || "4.50 crore"}
              </div>
              <div className="text-xs text-cyan-200/80 font-medium uppercase">
                {slide.stat2?.label || "IN HIGHER EDUCATION"}
              </div>
              <div className="text-xs font-bold text-cyan-400">{slide.stat2?.ratio || "30% ENROLMENT RATIO"}</div>
            </div>

            {/* Competition Multiplier */}
            <div
              className={`p-6 rounded-3xl bg-gradient-to-b from-rose-950/50 to-zinc-900 border border-rose-500/40 space-y-3 transition-all duration-700 shadow-xl ${
                currentStep >= 2 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              }`}
            >
              <span className="text-xs font-mono font-bold text-rose-400">COMPETITION REALITY</span>
              <div className="text-3xl sm:text-4xl font-black text-rose-300">
                {slide.statCompetition?.number || "193"}
              </div>
              <div className="text-xs text-rose-200/80 font-medium uppercase">
                {slide.statCompetition?.label || "APPLICANTS PER VACANCY"}
              </div>
              <div className="text-[11px] text-zinc-400 leading-snug">
                {slide.statCompetition?.detail || "SSC CGL 2025 — 28.15 lakh for 15,118 posts"}
              </div>
            </div>
          </div>

          {/* Amber Insight Box */}
          <div
            className={`p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs sm:text-sm font-medium leading-relaxed transition-all duration-700 flex items-start gap-3.5 ${
              currentStep >= 3 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            <Lightbulb className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <strong className="block font-bold text-amber-300 mb-0.5">
                {slide.insightBox?.title || "Government jobs are not a bad choice."}
              </strong>
              <span>
                {slide.insightBox?.text ||
                  "They are a good choice that far more people are now making at once. The map has more roads than in 1996. Most students are shown one."}
              </span>
            </div>
          </div>

          {slide.source && (
            <p className="text-[10px] text-zinc-500 font-mono">{slide.source}</p>
          )}
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
        <div className="w-full max-w-6xl mx-auto space-y-6 animate-fade-in">
          <div>
            <span className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-xs font-bold text-emerald-300 uppercase tracking-wider">
              {slide.badge || "PILLAR 02"}
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-white mt-2">
              {slide.title || "THE RISE OF THE PRIVATE SECTOR"}
            </h2>
            <p className="text-sm sm:text-base text-zinc-400 font-semibold mt-1">
              {slide.subtitle || "AN ECONOMY THAT DID NOT EXIST IN 1991."}
            </p>
          </div>

          {/* Timeline Bar */}
          <div
            className={`grid grid-cols-3 sm:grid-cols-6 gap-2 pt-2 transition-all duration-700 ${
              currentStep >= 0 ? "opacity-100" : "opacity-0"
            }`}
          >
            {timeline.map((item: any, idx: number) => (
              <div
                key={idx}
                className="p-3 rounded-2xl bg-white/5 border border-white/10 text-center space-y-1"
              >
                <div className="text-[10px] font-mono text-emerald-400 font-bold">{item.year}</div>
                <div className="text-xs font-bold text-zinc-200 leading-tight">{item.label}</div>
              </div>
            ))}
          </div>

          {/* 3 Metric Cards */}
          <div
            className={`grid grid-cols-1 sm:grid-cols-3 gap-5 transition-all duration-700 ${
              currentStep >= 1 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
            }`}
          >
            {stats.map((st: any, idx: number) => (
              <div
                key={idx}
                className="p-6 rounded-3xl bg-gradient-to-b from-white/10 to-white/5 border border-white/10 backdrop-blur-xl text-center space-y-2 shadow-xl"
              >
                <div className="text-3xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">
                  {st.value}
                </div>
                <div className="text-xs sm:text-sm font-bold text-zinc-200">{st.label}</div>
                {st.sub && <div className="text-[11px] text-zinc-400 font-medium">{st.sub}</div>}
              </div>
            ))}
          </div>

          {slide.source && (
            <p className="text-[10px] text-zinc-500 font-mono">{slide.source}</p>
          )}
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
        <div className="w-full max-w-6xl mx-auto space-y-6 animate-fade-in">
          <div>
            <span className="px-3 py-1 rounded-full bg-violet-500/20 border border-violet-500/40 text-xs font-bold text-violet-300 uppercase tracking-wider">
              {slide.badge || "PILLAR 03"}
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-white mt-2">
              {slide.title || "WHAT PEOPLE GET WRONG"}
            </h2>
            <p className="text-sm sm:text-base text-zinc-400 font-semibold mt-1">
              {slide.subtitle || "THE FEARS ARE REAL. THEY ARE ALSO INCOMPLETE."}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left: The Perception */}
            <div
              className={`p-6 rounded-3xl bg-rose-950/30 border border-rose-500/30 space-y-4 transition-all duration-700 ${
                currentStep >= 0 ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-6"
              }`}
            >
              <div className="flex items-center gap-2 text-rose-400 text-xs font-bold uppercase tracking-wider">
                <AlertTriangle className="w-4 h-4" />
                <span>THE PERCEPTION</span>
              </div>
              <div className="space-y-2.5">
                {myths.map((m: string, idx: number) => (
                  <div key={idx} className="flex items-center gap-2 text-xs sm:text-sm text-zinc-300 font-medium">
                    <span className="text-rose-400 font-bold">“</span>
                    <span>{m}</span>
                  </div>
                ))}
              </div>
              <p className="text-[11px] text-zinc-400 italic pt-2 border-t border-white/10">
                {slide.mythsFooter || "These come from watching real people lose real jobs."}
              </p>
            </div>

            {/* Right: The Fuller Picture */}
            <div
              className={`p-6 rounded-3xl bg-emerald-950/30 border border-emerald-500/30 space-y-4 transition-all duration-700 ${
                currentStep >= 1 ? "opacity-100 translate-x-0" : "opacity-0 translate-x-6"
              }`}
            >
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4" />
                <span>THE FULLER PICTURE</span>
              </div>
              <div className="space-y-2.5">
                {facts.map((f: any, idx: number) => (
                  <div key={idx} className="flex items-baseline gap-2 text-xs sm:text-sm text-zinc-200">
                    <span className="font-mono font-black text-emerald-400 shrink-0">{f.value}</span>
                    <span className="text-zinc-300 font-medium">{f.label}</span>
                  </div>
                ))}
              </div>
              <p className="text-[11px] text-emerald-300 font-medium pt-2 border-t border-white/10">
                {slide.factsFooter || "Mobility, remote work, global roles, entrepreneurship — all real here."}
              </p>
            </div>
          </div>

          {/* Key Takeaway */}
          <div
            className={`p-4 rounded-2xl bg-indigo-600/20 border border-indigo-500/40 text-center text-sm sm:text-base font-bold text-indigo-200 transition-all duration-700 ${
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
      return (
        <div className="w-full max-w-6xl mx-auto space-y-6 animate-fade-in">
          <div>
            <span className="px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-xs font-bold text-amber-300 uppercase tracking-wider">
              {slide.badge || "PILLAR 04"}
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-white mt-2">
              {slide.title || "TIME & OPPORTUNITY COST"}
            </h2>
            <p className="text-sm sm:text-base text-zinc-400 font-semibold mt-1">
              {slide.subtitle || "WHAT CAN TWO YEARS CHANGE?"}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Scenario A */}
            <div
              className={`p-6 rounded-3xl bg-white/5 border border-white/10 space-y-4 transition-all duration-700 ${
                currentStep >= 0 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
              }`}
            >
              <div className="space-y-1">
                <span className="text-xs font-bold text-zinc-400 font-mono">SCENARIO A</span>
                <h3 className="text-base sm:text-lg font-bold text-white">
                  Two years of full-time exam preparation
                </h3>
              </div>
              <div className="space-y-2 py-2">
                {["Study", "Exam attempts", "Selection uncertainty", "Waiting period"].map((s, idx) => (
                  <div key={idx} className="flex items-center gap-3 text-xs sm:text-sm text-zinc-300">
                    <div className="w-5 h-5 rounded-lg bg-zinc-800 flex items-center justify-center text-[10px] font-bold text-zinc-400">
                      {idx + 1}
                    </div>
                    <span>{s}</span>
                  </div>
                ))}
              </div>
              <div className="p-3 rounded-xl bg-black/40 text-xs text-zinc-400 font-mono">
                193 per vacancy · 933 UPSC posts
              </div>
            </div>

            {/* Scenario B */}
            <div
              className={`p-6 rounded-3xl bg-gradient-to-b from-indigo-950/60 to-zinc-900 border border-indigo-500/40 space-y-4 transition-all duration-700 shadow-xl ${
                currentStep >= 1 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
              }`}
            >
              <div className="space-y-1">
                <span className="text-xs font-bold text-indigo-400 font-mono">SCENARIO B</span>
                <h3 className="text-base sm:text-lg font-bold text-white">
                  Two years building skills alongside your degree
                </h3>
              </div>
              <div className="space-y-2 py-2">
                {[
                  { time: "MONTH 0-6", label: "Learn a real skill" },
                  { time: "MONTH 6-12", label: "Build and ship projects" },
                  { time: "MONTH 12-18", label: "Internship & Industry Exposure" },
                  { time: "MONTH 18-24", label: "Entry role → first switch" },
                ].map((s, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs sm:text-sm">
                    <span className="text-[10px] font-mono font-bold text-indigo-400">{s.time}</span>
                    <span className="text-zinc-200 font-medium">{s.label}</span>
                  </div>
                ))}
              </div>
              <div className="p-3 rounded-xl bg-indigo-950/60 border border-indigo-500/30 text-xs text-indigo-300 font-bold font-mono">
                ₹3.5-6 LPA entry · ₹8-12 LPA+ with a portfolio
              </div>
            </div>
          </div>

          <div
            className={`text-xs text-zinc-400 text-center italic transition-all duration-700 ${
              currentStep >= 2 ? "opacity-100" : "opacity-0"
            }`}
          >
            {slide.caveat ||
              "Illustrative — not a guaranteed outcome. Many students do both. Choose deliberately, not by default."}
          </div>
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
        <div className="w-full max-w-6xl mx-auto space-y-6 animate-fade-in">
          <div>
            <span className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-xs font-bold text-emerald-300 uppercase tracking-wider">
              {slide.badge || "CAREER POTENTIAL"}
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-white mt-2">
              {slide.title || "THE OTHER SIDE OF THE LEDGER"}
            </h2>
            <p className="text-sm sm:text-base text-zinc-400 font-semibold mt-1">
              {slide.subtitle || "WHAT CAN A PRIVATE CAREER OFFER?"}
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 pt-2">
            {benefits.map((b: any, idx: number) => {
              const isVisible = currentStep >= Math.floor(idx / 2);
              return (
                <div
                  key={idx}
                  className={`p-5 rounded-3xl bg-white/5 border border-white/10 text-center space-y-2 transition-all duration-700 shadow-xl ${
                    isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
                  }`}
                >
                  <div className="text-xs font-bold text-indigo-400 uppercase tracking-wider leading-tight">
                    {b.title}
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-white">{b.value}</div>
                  <div className="text-[11px] text-zinc-400">{b.sub}</div>
                </div>
              );
            })}
          </div>

          <p className="text-xs text-zinc-400 text-center">
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
        <div className="w-full max-w-6xl mx-auto space-y-6 animate-fade-in">
          <div>
            <span className="px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-xs font-bold text-indigo-300 uppercase tracking-wider">
              {slide.badge || "ACADEMIC ALIGNMENT"}
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-white mt-2">
              {slide.title || "YOUR DEGREE, YOUR ENTRY POINT"}
            </h2>
            <p className="text-sm sm:text-base text-zinc-400 font-semibold mt-1">
              {slide.subtitle || "FOUR STARTING POINTS."}
            </p>
          </div>

          {/* Matrix Rows */}
          <div className="space-y-3">
            {rows.map((r: any, idx: number) => {
              const isVisible = currentStep >= idx;
              return (
                <div
                  key={idx}
                  className={`p-4 rounded-2xl border transition-all duration-700 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 ${
                    isVisible
                      ? "bg-white/5 border-white/15 opacity-100 translate-x-0 shadow-md"
                      : "bg-white/2 border-white/5 opacity-20 -translate-x-4"
                  }`}
                >
                  <div className="space-y-0.5 sm:w-1/3">
                    <span className="text-xs font-black text-indigo-400 font-mono">{r.branch}</span>
                    <p className="text-[11px] text-zinc-400">{r.degrees}</p>
                  </div>
                  <div className="sm:w-1/3">
                    <span className="text-xs sm:text-sm font-bold text-white block">{r.role}</span>
                  </div>
                  <div className="flex items-center gap-4 sm:w-1/3 justify-between sm:justify-end">
                    <span className="font-mono font-bold text-emerald-400 text-xs sm:text-sm">{r.range}</span>
                    <span className="px-2.5 py-1 rounded-lg bg-white/10 text-[10px] font-black text-zinc-300 font-mono">
                      {r.effort}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Equation Formula */}
          <div
            className={`p-4 rounded-2xl bg-gradient-to-r from-indigo-950/60 to-violet-950/60 border border-indigo-500/40 text-center transition-all duration-700 ${
              currentStep >= 4 ? "opacity-100 scale-100" : "opacity-0 scale-95"
            }`}
          >
            <div className="flex flex-wrap items-center justify-center gap-2 text-xs sm:text-sm font-black text-indigo-200">
              <span>DEGREE</span>
              <span className="text-indigo-400">+</span>
              <span>SKILLS</span>
              <span className="text-indigo-400">+</span>
              <span>PROJECTS</span>
              <span className="text-indigo-400">+</span>
              <span>EVIDENCE</span>
            </div>
          </div>
        </div>
      );
    }

    // ==========================================
    // 12. GAP LAYER
    // ==========================================
    case "GAP_LAYER": {
      const industrySkills = slide.industryLayer || [
        "Practical Skills",
        "Projects",
        "Portfolio",
        "Communication",
        "Problem Solving",
        "Tools",
        "Industry Awareness",
      ];

      return (
        <div className="w-full max-w-6xl mx-auto space-y-6 animate-fade-in">
          <div>
            <span className="px-3 py-1 rounded-full bg-rose-500/20 border border-rose-500/40 text-xs font-bold text-rose-300 uppercase tracking-wider">
              {slide.badge || "REALITY CHECK"}
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-white mt-2">
              {slide.title || "THE GAP"}
            </h2>
            <p className="text-sm sm:text-base text-zinc-400 font-semibold mt-1">
              {slide.subtitle || "A DEGREE DOES NOT INCLUDE THESE."}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Foundation Layer */}
            <div
              className={`p-6 rounded-3xl bg-white/5 border border-white/10 space-y-4 transition-all duration-700 ${
                currentStep >= 0 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
              }`}
            >
              <span className="text-xs font-mono font-bold text-zinc-400">THE FOUNDATION</span>
              <h3 className="text-2xl font-black text-white">YOUR DEGREE</h3>
              <p className="text-xs sm:text-sm text-indigo-300 font-bold">DOMAIN KNOWLEDGE</p>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Irreplaceable — and what every other student here already has.
              </p>
            </div>

            {/* Industry Layer */}
            <div
              className={`p-6 rounded-3xl bg-gradient-to-b from-indigo-950/60 to-zinc-900 border border-indigo-500/40 space-y-4 transition-all duration-700 shadow-xl ${
                currentStep >= 1 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
              }`}
            >
              <span className="text-xs font-mono font-bold text-indigo-400">+ THE INDUSTRY LAYER</span>
              <div className="flex flex-wrap gap-2">
                {industrySkills.map((s: string, idx: number) => (
                  <span
                    key={idx}
                    className="px-3 py-1.5 rounded-xl bg-white/10 text-xs font-bold text-zinc-200"
                  >
                    {s}
                  </span>
                ))}
              </div>
              <p className="text-xs text-indigo-300 font-bold italic pt-2">Nobody hands you this.</p>
            </div>
          </div>

          {/* Employability Stat */}
          <div
            className={`p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-between gap-4 transition-all duration-700 ${
              currentStep >= 2 ? "opacity-100" : "opacity-0"
            }`}
          >
            <div>
              <div className="text-2xl sm:text-3xl font-black text-rose-400">56.4%</div>
              <div className="text-[11px] text-zinc-300 font-semibold uppercase">ASSESSED EMPLOYABLE (India Skills Report 2026)</div>
            </div>
            <div className="text-xs sm:text-sm text-zinc-300 font-medium max-w-sm text-right">
              {slide.punchline || "The degree is the foundation. The layer on top is built on purpose."}
            </div>
          </div>
        </div>
      );
    }

    // ==========================================
    // 13. ROADMAP FLOW
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
        <div className="w-full max-w-6xl mx-auto space-y-8 animate-fade-in">
          <div>
            <span className="px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-xs font-bold text-indigo-300 uppercase tracking-wider">
              {slide.badge || "THE BLUEPRINT"}
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-white mt-2">
              {slide.title || "THE ROADMAP"}
            </h2>
            <p className="text-sm sm:text-base text-zinc-400 font-semibold mt-1">
              {slide.subtitle || "HOW DO YOU GET THERE?"}
            </p>
          </div>

          {/* Steps Chain */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {steps.map((st: any, idx: number) => {
              const isRevealed = currentStep >= idx;
              return (
                <div
                  key={idx}
                  className={`p-4 rounded-2xl border transition-all duration-500 space-y-2 text-center ${
                    isRevealed
                      ? "bg-indigo-950/40 border-indigo-500/60 scale-102 shadow-lg"
                      : "bg-white/5 border-white/10 opacity-30"
                  }`}
                >
                  <div className="text-xs font-mono font-black text-indigo-400">{st.num}</div>
                  <div className="text-xs font-bold text-white leading-snug">{st.title}</div>
                </div>
              );
            })}
          </div>

          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-center text-xs sm:text-sm font-bold text-amber-300">
            {slide.punchline || "Most students try to jump from 01 directly to 06."}
          </div>
        </div>
      );
    }

    // ==========================================
    // 14. BUILD VS TUTORIAL
    // ==========================================
    case "BUILD_VS_TUTORIAL": {
      return (
        <div className="w-full max-w-6xl mx-auto space-y-6 animate-fade-in">
          <div>
            <span className="px-3 py-1 rounded-full bg-rose-500/20 border border-rose-500/40 text-xs font-bold text-rose-300 uppercase tracking-wider">
              {slide.badge || "STEP 02 FOCUS"}
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-white mt-2">
              {slide.title || "LEARNING IS NOT BUILDING."}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Tutorial Trap */}
            <div
              className={`p-6 rounded-3xl bg-rose-950/30 border border-rose-500/30 space-y-4 transition-all duration-700 ${
                currentStep >= 0 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
              }`}
            >
              <span className="text-xs font-bold font-mono text-rose-400">THE TUTORIAL TRAP</span>
              <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-zinc-300">
                <span>TUTORIAL</span>
                <span>›</span>
                <span>COPY</span>
                <span>›</span>
                <span>FINISH</span>
                <span>›</span>
                <span>FORGET</span>
              </div>
              <p className="text-xs text-rose-300 italic">The feeling of progress. None of the evidence.</p>
            </div>

            {/* Project Engineering Cycle */}
            <div
              className={`p-6 rounded-3xl bg-emerald-950/30 border border-emerald-500/30 space-y-4 transition-all duration-700 ${
                currentStep >= 1 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
              }`}
            >
              <span className="text-xs font-bold font-mono text-emerald-400">REAL PROJECT ENGINEERING</span>
              <div className="grid grid-cols-3 gap-2 text-center text-xs font-bold">
                {["1. PROBLEM", "2. RESEARCH", "3. BUILD", "4. TEST", "5. DEPLOY", "6. EVIDENCE"].map((s) => (
                  <div key={s} className="p-2 rounded-xl bg-white/10 text-emerald-200">
                    {s}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* The Test */}
          <div
            className={`p-5 rounded-2xl bg-amber-500/10 border border-amber-500/40 space-y-1 transition-all duration-700 ${
              currentStep >= 2 ? "opacity-100 scale-100" : "opacity-0 scale-95"
            }`}
          >
            <div className="text-xs font-bold text-amber-400 uppercase tracking-wider">THE TEST</div>
            <p className="text-xs sm:text-sm text-zinc-200 font-medium">
              {slide.theTest ||
                "Can someone else open it and see that it works — without you explaining it? If not, it is not yet evidence."}
            </p>
          </div>
        </div>
      );
    }

    // ==========================================
    // 15. FUNNEL WAYS
    // ==========================================
    case "FUNNEL_WAYS": {
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
        <div className="w-full max-w-6xl mx-auto space-y-6 animate-fade-in">
          <div>
            <span className="px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-xs font-bold text-indigo-300 uppercase tracking-wider">
              {slide.badge || "STEPS 03 TO 06"}
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-white mt-2">
              {slide.title || "GOOD SKILL ≠ GOOD OPPORTUNITY."}
            </h2>
            <p className="text-sm sm:text-base text-zinc-400 font-semibold mt-1">
              {slide.subtitle || "Every stage below skill is a communication problem."}
            </p>
          </div>

          {/* Funnel Channels Grid */}
          <div className="space-y-3">
            <span className="text-xs font-bold text-zinc-400 font-mono uppercase">8 Ways In</span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {channels.map((ch: string, idx: number) => {
                const isRevealed = currentStep >= Math.floor(idx / 2);
                return (
                  <div
                    key={idx}
                    className={`p-3.5 rounded-2xl border text-xs font-bold transition-all duration-500 flex items-center gap-2 ${
                      isRevealed
                        ? "bg-white/10 border-indigo-500/40 text-white"
                        : "bg-white/5 border-white/5 text-zinc-500 opacity-40"
                    }`}
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0" />
                    <span>{ch}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-indigo-950/60 border border-indigo-500/30 text-center text-xs sm:text-sm font-bold text-indigo-200">
            {slide.punchline || "Most students use only one of these eight."}
          </div>
        </div>
      );
    }

    // ==========================================
    // 16. PROGRAM PILLARS
    // ==========================================
    case "PROGRAM_PILLARS": {
      const components = slide.components || [
        { title: "Industry Curriculum", desc: "Modern production-grade tools, stacks & patterns" },
        { title: "Practical Projects", desc: "Shipped live with real data, tests & end users" },
        { title: "Expert Sessions", desc: "Live masterclasses from senior engineers & founders" },
        { title: "Career Prep", desc: "Resume architecture, ATS optimization & mock interviews" },
        { title: "Portfolio", desc: "Verified proof and live deployments for recruiters" },
        { title: "Mentorship", desc: "Personal 1-on-1 code and career feedback on your work" },
        { title: "Opportunity Pathways", desc: "Direct talent pool & industry connections" },
      ];

      return (
        <div className="w-full max-w-6xl mx-auto space-y-6 animate-fade-in">
          <div>
            <span className="px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-xs font-bold text-indigo-300 uppercase tracking-wider">
              {slide.badge || "THE STRUCTURED SOLUTION"}
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-white mt-2">
              {slide.title || "SO HOW DO YOU BUILD THIS?"}
            </h2>
            <p className="text-sm sm:text-base text-zinc-400 font-semibold mt-1">
              {slide.subtitle || "UNISOLE AI CAMPUS PROGRAM — Build skills, projects and professional evidence."}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
            {components.map((c: any, idx: number) => {
              const isRevealed = currentStep >= Math.floor(idx / 3);
              return (
                <div
                  key={idx}
                  className={`p-5 rounded-3xl border transition-all duration-700 space-y-1.5 ${
                    isRevealed
                      ? "bg-white/5 border-indigo-500/40 translate-y-0 opacity-100 shadow-lg"
                      : "bg-white/2 border-white/5 translate-y-4 opacity-20"
                  }`}
                >
                  <div className="text-xs font-black text-indigo-400 font-mono uppercase">0{idx + 1}</div>
                  <h3 className="text-sm sm:text-base font-bold text-white">{c.title}</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">{c.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    // ==========================================
    // 17. COURSE PATHWAYS
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
        <div className="w-full max-w-6xl mx-auto space-y-6 animate-fade-in">
          <div>
            <span className="px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-xs font-bold text-indigo-300 uppercase tracking-wider">
              {slide.badge || "CHOOSE YOUR TRACK"}
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-white mt-2">
              {slide.title || "COURSE PATHWAYS"}
            </h2>
            <p className="text-sm sm:text-base text-zinc-400 font-semibold mt-1">
              {slide.subtitle || "FIND YOUR GROUP."}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {groups.map((g: any, idx: number) => {
              const isRevealed = currentStep >= idx;
              return (
                <div
                  key={idx}
                  className={`p-5 rounded-3xl border transition-all duration-700 space-y-4 ${
                    isRevealed
                      ? "bg-gradient-to-b from-indigo-950/40 to-zinc-900 border-indigo-500/40 shadow-xl opacity-100"
                      : "bg-white/5 border-white/5 opacity-20"
                  }`}
                >
                  <div className="space-y-0.5 border-b border-white/10 pb-3">
                    <span className="text-[10px] font-mono font-black text-indigo-400">{g.group}</span>
                    <h3 className="text-base font-black text-white">{g.branch}</h3>
                    <p className="text-[10px] text-zinc-400">{g.degrees}</p>
                  </div>

                  <div className="space-y-2.5">
                    {g.courses.map((c: any, cIdx: number) => (
                      <div key={cIdx} className="flex items-center justify-between text-xs gap-2">
                        <span className="text-zinc-300 font-medium leading-tight">{c.name}</span>
                        <span className="font-mono font-black text-emerald-400 shrink-0">{c.price}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          <p className="text-xs text-indigo-300 text-center font-semibold">
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
      const opportunities = slide.opportunities || [
        "Advanced projects",
        "Hackathons",
        "Industry interaction",
        "Research projects",
        "Tutor roles",
        "Internships",
      ];

      return (
        <div className="w-full max-w-6xl mx-auto space-y-6 animate-fade-in">
          <div>
            <span className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-xs font-bold text-emerald-300 uppercase tracking-wider">
              {slide.badge || "CAREER PIPELINE"}
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-white mt-2">
              {slide.title || "BEYOND THE TRAINING"}
            </h2>
            <p className="text-sm sm:text-base text-zinc-400 font-semibold mt-1">
              {slide.subtitle || "FROM TRAINING TO OPPORTUNITY"}
            </p>
          </div>

          {/* Flow Ribbon */}
          <div
            className={`grid grid-cols-2 sm:grid-cols-6 gap-2 transition-all duration-700 ${
              currentStep >= 0 ? "opacity-100" : "opacity-0"
            }`}
          >
            {flow.map((f: string, idx: number) => (
              <div key={idx} className="p-3 rounded-2xl bg-white/5 border border-white/10 text-center">
                <span className="text-xs font-bold text-emerald-300">{f}</span>
              </div>
            ))}
          </div>

          {/* Opportunities Badges */}
          <div
            className={`grid grid-cols-2 sm:grid-cols-3 gap-3 transition-all duration-700 ${
              currentStep >= 1 ? "opacity-100" : "opacity-0"
            }`}
          >
            {opportunities.map((opp: string, idx: number) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/40 to-teal-950/40 border border-emerald-500/30 flex items-center gap-3 text-xs sm:text-sm font-bold text-emerald-100"
              >
                <div className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>{opp}</span>
              </div>
            ))}
          </div>

          <div
            className={`p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200 font-medium transition-all duration-700 ${
              currentStep >= 2 ? "opacity-100" : "opacity-0"
            }`}
          >
            <strong>Disclaimer:</strong> {slide.disclaimer || "Subject to performance, eligibility, availability and applicable selection procedures."}
            <div className="text-sm font-bold text-amber-300 mt-1">
              {slide.punchline || "Nothing here is promised. Everything here is earned."}
            </div>
          </div>
        </div>
      );
    }

    // ==========================================
    // 19. MENTORSHIP DUAL
    // ==========================================
    case "MENTORSHIP_DUAL": {
      return (
        <div className="w-full max-w-6xl mx-auto space-y-6 animate-fade-in">
          <div>
            <span className="px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-xs font-bold text-indigo-300 uppercase tracking-wider">
              {slide.badge || "EXPERIENCE"}
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-white mt-2">
              {slide.title || "WHAT IT FEELS LIKE"}
            </h2>
            <p className="text-sm sm:text-base text-zinc-400 font-semibold mt-1">
              {slide.subtitle || "PEOPLE, NOT JUST CONTENT."}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Industry Experts */}
            <div
              className={`p-6 rounded-3xl bg-white/5 border border-white/10 space-y-4 transition-all duration-700 ${
                currentStep >= 0 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
              }`}
            >
              <h3 className="text-lg font-black text-white">INDUSTRY EXPERTS</h3>
              <div className="space-y-2">
                {["Real professionals", "Real problems", "Real workflows", "Real career insight"].map((pt, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs sm:text-sm text-zinc-200">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                    <span>{pt}</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-indigo-300 font-semibold pt-2 border-t border-white/10">
                People currently doing the work — not describing it.
              </p>
            </div>

            {/* Personal Mentorship */}
            <div
              className={`p-6 rounded-3xl bg-gradient-to-b from-indigo-950/60 to-zinc-900 border border-indigo-500/40 space-y-4 transition-all duration-700 shadow-xl ${
                currentStep >= 1 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
              }`}
            >
              <h3 className="text-lg font-black text-white">PERSONAL MENTORSHIP</h3>
              <div className="space-y-2">
                {["Career direction", "Project guidance", "Resume & portfolio review", "Interview prep", "Communication coaching"].map((pt, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs sm:text-sm text-zinc-200">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span>{pt}</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-emerald-300 font-semibold pt-2 border-t border-white/10">
                One-to-one, on your own work.
              </p>
            </div>
          </div>
        </div>
      );
    }

    // ==========================================
    // 20. RESEARCH & INTERN
    // ==========================================
    case "RESEARCH_INTERN": {
      const doors = slide.doors || [
        "Industry-linked projects",
        "Internship opportunities",
        "Advanced projects",
        "Research exposure",
        "Hackathons",
      ];

      return (
        <div className="w-full max-w-6xl mx-auto space-y-6 animate-fade-in">
          <div>
            <span className="px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-xs font-bold text-indigo-300 uppercase tracking-wider">
              {slide.badge || "ADVANCED PATHWAYS"}
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-white mt-2">
              {slide.title || "WHERE STRONG PERFORMANCE LEADS"}
            </h2>
            <p className="text-sm sm:text-base text-zinc-400 font-semibold mt-1">
              {slide.subtitle || "INTERNSHIP & RESEARCH EXPOSURE"}
            </p>
          </div>

          <div
            className={`grid grid-cols-2 sm:grid-cols-5 gap-3 transition-all duration-700 ${
              currentStep >= 0 ? "opacity-100" : "opacity-0"
            }`}
          >
            {doors.map((d: string, idx: number) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-white/5 border border-white/10 text-center text-xs font-bold text-zinc-200 shadow-md"
              >
                {d}
              </div>
            ))}
          </div>

          <div
            className={`p-5 rounded-3xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200 leading-relaxed transition-all duration-700 ${
              currentStep >= 1 ? "opacity-100" : "opacity-0"
            }`}
          >
            <strong className="block font-bold text-amber-300 mb-1">RESEARCH-ORIENTED STUDENTS</strong>
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
        <div className="w-full max-w-5xl mx-auto text-center space-y-6 animate-fade-in">
          <div>
            <span className="px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-xs font-bold text-indigo-300 uppercase tracking-wider">
              {slide.badge || "CAMPUS ROADSHOW"}
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-white mt-2">
              {slide.title || "Empowering Himachal's Next-Gen Tech Talent"}
            </h2>
            <p className="text-sm sm:text-base text-zinc-400 font-medium mt-1">
              {slide.subtitle || "Hands-on AI skill labs across colleges"}
            </p>
          </div>

          <div className="rounded-3xl overflow-hidden border border-white/15 shadow-2xl max-h-[420px] mx-auto bg-black/40">
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
        <div className="w-full max-w-6xl mx-auto space-y-6 animate-fade-in">
          <div className="flex items-center justify-between">
            <span className="px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-xs font-bold text-indigo-300 uppercase tracking-wider">
              {slide.badge || "A RECOGNITION PATHWAY"}
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left: Perks */}
            <div className="lg:col-span-7 space-y-4">
              <h2 className="text-3xl sm:text-5xl font-black text-white leading-tight">
                {slide.title || "UNISOLE COLLEGE AMBASSADORS"}
              </h2>

              <div
                className={`grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 transition-all duration-700 ${
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

              <p className="text-xs text-zinc-400 italic pt-2 border-t border-white/10">
                {slide.disclaimer || "A recognition and mentorship pathway — not a job, internship or placement."}
              </p>
            </div>

            {/* Right: Scan QR / Return of Big Question */}
            <div
              className={`lg:col-span-5 p-6 rounded-3xl bg-gradient-to-b from-indigo-950/80 to-zinc-900 border border-indigo-500/40 text-center space-y-4 shadow-2xl transition-all duration-700 ${
                currentStep >= 1 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
              }`}
            >
              <div className="p-3 bg-white rounded-2xl inline-block shadow-xl">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(
                    slide.targetUrl || "https://unisole.org/programs"
                  )}`}
                  alt="Scan QR"
                  className="w-36 h-36 object-contain"
                />
              </div>

              <div>
                <span className="text-xs font-bold text-indigo-300 uppercase tracking-widest block mb-1">
                  SIGN UP NOW
                </span>
                <p className="text-xs text-zinc-300 font-medium">
                  {slide.qrAction || "Scan to sign up or connect with your college coordinator"}
                </p>
              </div>

              {/* The Return Question in Step 2 */}
              <div
                className={`pt-2 transition-all duration-1000 ${
                  currentStep >= 2 ? "opacity-100 scale-100" : "opacity-0 scale-95"
                }`}
              >
                <div className="text-xl sm:text-2xl font-black text-amber-300 font-serif">
                  {slide.finalQuestion || "आगे क्या सोचा है?"}
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // ==========================================
    // 23. LIVE POLL SLIDE
    // ==========================================
    case "POLL": {
      return (
        <div className="w-full max-w-5xl mx-auto space-y-6 animate-fade-in text-center sm:text-left">
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider">
            <BarChart3 className="w-5 h-5" />
            <span>{slide.badge || "LIVE AUDIENCE POLL"}</span>
          </div>

          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white leading-tight">
            {slide.question || slide.title || "Live Audience Poll"}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
            {(slide.options || []).map((opt: string, optIdx: number) => {
              const count = quizState?.pollCounts?.[optIdx] || 0;
              const totalVotes = Object.values(quizState?.pollCounts || {}).reduce(
                (a: any, b: any) => a + b,
                0
              ) as number;
              const percent = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;

              return (
                <div
                  key={optIdx}
                  className="relative p-5 rounded-2xl bg-white/5 border border-cyan-500/30 overflow-hidden shadow-lg"
                >
                  {/* Fill Bar */}
                  <div
                    className="absolute inset-y-0 left-0 bg-cyan-500/20 transition-all duration-700 ease-out"
                    style={{ width: `${percent}%` }}
                  />

                  <div className="relative flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-300 flex items-center justify-center font-bold text-sm">
                        {String.fromCharCode(65 + optIdx)}
                      </span>
                      <span className="text-sm sm:text-base font-bold text-white">{opt}</span>
                    </div>
                    <span className="text-base sm:text-lg font-mono font-black text-cyan-400">
                      {percent}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    // ==========================================
    // 24. LIVE QUIZ SLIDE
    // ==========================================
    case "QUIZ": {
      return (
        <div className="w-full max-w-5xl mx-auto space-y-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
              <Flame className="w-5 h-5" />
              <span>{slide.badge || "FAST-FINGER TECH CHALLENGE"}</span>
            </div>

            {remainingTime !== null && (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-300 font-mono font-black text-lg shadow-lg">
                <Clock className="w-4 h-4 animate-spin" />
                <span>{remainingTime}s remaining</span>
              </div>
            )}
          </div>

          <h2 className="text-2xl sm:text-4xl font-black text-white leading-tight">
            {slide.question || slide.title}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
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

              return (
                <div
                  key={optIdx}
                  className={`p-5 rounded-2xl border transition-all duration-500 flex items-center justify-between gap-3 shadow-lg ${
                    colors[optIdx % 4]
                  } ${
                    isRevealed && isCorrect
                      ? "ring-4 ring-emerald-400 scale-102 bg-emerald-600/40"
                      : isRevealed
                      ? "opacity-40"
                      : ""
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center font-bold text-sm">
                      {String.fromCharCode(65 + optIdx)}
                    </span>
                    <span className="text-sm sm:text-base font-bold">{text}</span>
                  </div>

                  {isRevealed && isCorrect && (
                    <span className="px-3 py-1 rounded-full bg-emerald-500 text-white font-bold text-xs flex items-center gap-1 shadow-md">
                      <CheckCircle2 className="w-4 h-4" /> Correct Answer
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    // ==========================================
    // 25. CONTENT (BULLETS) & OTHER DEFAULT
    // ==========================================
    case "CONTENT":
    default: {
      return (
        <div className="w-full max-w-5xl mx-auto space-y-6 animate-fade-in text-center sm:text-left">
          {slide.badge && (
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-xs font-bold text-indigo-300">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>{slide.badge}</span>
            </div>
          )}

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            {slide.title || "Slide Title"}
          </h1>

          {slide.subtitle && (
            <p className="text-base sm:text-xl text-zinc-300 max-w-3xl leading-relaxed">
              {slide.subtitle}
            </p>
          )}

          {Array.isArray(slide.bullets) && slide.bullets.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
              {slide.bullets.map((bullet: string, idx: number) => {
                const isRevealed = currentStep >= idx;
                return (
                  <div
                    key={idx}
                    className={`p-5 rounded-2xl border backdrop-blur-md flex items-start gap-4 shadow-lg transition-all duration-700 ${
                      isRevealed
                        ? "bg-white/5 border-white/10 opacity-100 translate-y-0"
                        : "bg-white/2 border-white/5 opacity-20 translate-y-4"
                    }`}
                  >
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
                      {idx + 1}
                    </div>
                    <p className="text-sm sm:text-base text-zinc-200 font-medium leading-relaxed">
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
