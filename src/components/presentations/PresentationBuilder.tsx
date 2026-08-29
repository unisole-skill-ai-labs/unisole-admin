import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  useGetPresentationQuery,
  useUpdatePresentationMutation,
} from "../../store";
import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  Copy,
  ChevronUp,
  ChevronDown,
  Sparkles,
  Play,
  HelpCircle,
  BarChart2,
  CheckCircle2,
  Layers,
  Clock,
  Award,
  Zap,
  RotateCcw,
  FileText,
} from "lucide-react";
import Button from "../ui/Button";
import SlideRenderer from "./SlideRenderer";
import { UNISOLE_AI_CAMPUS_DECK_SLIDES } from "../../data/aiCampusDeck";

interface PresentationBuilderProps {
  baseUrl: string;
}

export default function PresentationBuilder({ baseUrl }: PresentationBuilderProps) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: presRes, isLoading } = useGetPresentationQuery(
    { baseUrl, id: id! },
    { skip: !id }
  );
  const [updatePresentation, { isLoading: isSaving }] =
    useUpdatePresentationMutation();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [theme, setTheme] = useState("dark");
  const [slides, setSlides] = useState<any[]>([]);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (presRes?.data) {
      const d = presRes.data;
      setTitle(d.title || "");
      setDescription(d.description || "");
      setTheme(d.theme || "dark");
      setSlides(Array.isArray(d.slides) ? d.slides : []);
    }
  }, [presRes]);

  const activeSlide = slides[activeSlideIndex] || null;

  const handleLoadCampusTemplate = () => {
    if (
      slides.length > 0 &&
      !window.confirm(
        "Are you sure you want to load the complete 28-slide UNISOLE AI Campus Program Animated Template? This will replace current slides."
      )
    ) {
      return;
    }
    setTitle("UNISOLE AI Campus Program (Animated)");
    setDescription(
      "Interactive 28-slide animated roadshow presentation for college students across Himachal Pradesh with real-time live pulse polls and fast-finger quizzes."
    );
    setSlides(UNISOLE_AI_CAMPUS_DECK_SLIDES);
    setActiveSlideIndex(0);
  };

  const handleAddSlide = (type: string) => {
    const newId = `slide_${Date.now()}`;
    let newSlide: any = {
      id: newId,
      type,
      title: "New Slide Title",
      subtitle: "Add descriptive subtext or context here",
      maxBuildSteps: 1,
      notes: "Presenter notes for this slide...",
    };

    if (type === "COVER") {
      newSlide.badge = "INDUSTRIAL TRAINING & INTERNSHIP OPPORTUNITY PROGRAM";
      newSlide.title = title || "UNISOLE AI CAMPUS PROGRAM";
      newSlide.subtitle = "For College Students Across Himachal Pradesh";
      newSlide.org = "UNISOLE SKILL AI LABS";
      newSlide.maxBuildSteps = 3;
    } else if (type === "FOUNDER_BIO") {
      newSlide.badge = "FOUNDER";
      newSlide.title = "AJAY MOKTA";
      newSlide.subtitle = "Founder, UNISOLE Skill AI Labs · B.Tech, NIT Hamirpur";
      newSlide.initials = "AM";
      newSlide.credentials = [
        "NIT Hamirpur Alumnus",
        "NASA Space Apps Challenge",
        "3rd — National Startup Summit",
        "ICAR-IARI Incubation Grantee",
        "Speaker & Mentor on Applied AI",
      ];
      newSlide.quote = "“A degree from any college in Himachal should be backed by skills that compete globally.”";
      newSlide.maxBuildSteps = 3;
    } else if (type === "BIG_QUESTION") {
      newSlide.title = "आगे क्या सोचा है?";
      newSlide.subtitle = "Not what your parents have decided. What have YOU thought about?";
      newSlide.maxBuildSteps = 2;
    } else if (type === "CONTENT") {
      newSlide.title = "Core Program Highlights";
      newSlide.bullets = [
        "Live 1-on-1 industry mentorship from FAANG / Top Unicorn leads",
        "Production-grade capstone projects built in modern stacks",
        "Dedicated placement drive with 200+ hiring partners",
      ];
      newSlide.maxBuildSteps = 3;
    } else if (type === "STATS") {
      newSlide.title = "Unisole Impact & Alumni Reach";
      newSlide.stats = [
        { value: "94%", label: "Placement Rate" },
        { value: "18 LPA", label: "Highest CTC" },
        { value: "450+", label: "Hiring Partners" },
      ];
      newSlide.maxBuildSteps = 3;
    } else if (type === "POLL") {
      newSlide.badge = "LIVE AUDIENCE PULSE";
      newSlide.title = "Live Audience Poll";
      newSlide.question = "Which career track are you most interested in?";
      newSlide.options = [
        "Full-Stack Web3 / Cloud",
        "AI, Machine Learning & LLMs",
        "Data Engineering & Analytics",
        "Cybersecurity & DevSecOps",
      ];
      newSlide.maxBuildSteps = 1;
    } else if (type === "QUIZ") {
      newSlide.badge = "FAST-FINGER TECH CHALLENGE";
      newSlide.title = "Fast-Finger Tech Challenge";
      newSlide.question = "According to WEF Future of Jobs 2025, what is the #1 skill employers prioritize?";
      newSlide.timeLimit = 20;
      newSlide.points = 1000;
      newSlide.options = [
        { text: "Analytical & Problem-Solving Thinking", isCorrect: true },
        { text: "Memorizing code syntax", isCorrect: false },
        { text: "High college test scores alone", isCorrect: false },
        { text: "Collecting generic online certificates", isCorrect: false },
      ];
      newSlide.maxBuildSteps = 1;
    } else if (type === "OFFER_CTA") {
      newSlide.title = "Claim Your Exclusive College Grant";
      newSlide.subtitle = "Scan or visit Unisole to claim your special roadshow scholarship!";
      newSlide.badge = "Limited Time Offer";
      newSlide.couponCode = "CAMPUS40";
      newSlide.buttonText = "Explore Programs on Unisole";
      newSlide.targetUrl = "https://unisole.org/programs";
    }

    const updated = [...slides, newSlide];
    setSlides(updated);
    setActiveSlideIndex(updated.length - 1);
  };

  const handleUpdateActiveSlide = (fields: Partial<any>) => {
    if (!activeSlide) return;
    const updated = [...slides];
    updated[activeSlideIndex] = {
      ...updated[activeSlideIndex],
      ...fields,
    };
    setSlides(updated);
  };

  const handleDeleteSlide = (index: number) => {
    if (slides.length <= 1) return;
    const updated = slides.filter((_, i) => i !== index);
    setSlides(updated);
    setActiveSlideIndex(Math.max(0, index - 1));
  };

  const handleMoveSlide = (index: number, direction: "up" | "down") => {
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === slides.length - 1)
    )
      return;
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    const updated = [...slides];
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;
    setSlides(updated);
    setActiveSlideIndex(targetIdx);
  };

  const handleSave = async () => {
    try {
      await updatePresentation({
        baseUrl,
        id: id!,
        body: {
          title,
          description,
          theme,
          slides,
        },
      }).unwrap();
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (err) {
      console.error("Failed to save presentation", err);
    }
  };

  if (isLoading) {
    return (
      <div className="h-[70vh] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-3 border-indigo-500/20 border-t-indigo-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-4 sm:px-6 shadow-xs">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/presentations")}
            className="text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 p-2"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Presentation Deck Title"
              className="text-lg sm:text-xl font-black text-zinc-900 dark:text-zinc-100 bg-transparent border-b border-transparent hover:border-zinc-300 dark:hover:border-zinc-700 focus:border-indigo-500 focus:outline-hidden px-1 transition-colors"
            />
            <span className="text-[11px] text-zinc-400 block px-1">
              {slides.length} slides • Animated Visual Deck Builder
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleLoadCampusTemplate}
            className="border-indigo-500/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 flex items-center gap-1.5"
            title="Load the complete UNISOLE AI Campus Program Animated presentation"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Load AI Campus Template</span>
          </Button>

          {saveSuccess && (
            <span className="text-xs text-emerald-500 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" /> Saved
            </span>
          )}
          <Button
            variant="primary"
            size="sm"
            onClick={handleSave}
            disabled={isSaving}
            className="bg-indigo-600 hover:bg-indigo-500 shadow-sm flex items-center gap-1.5"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? "Saving..." : "Save Deck"}</span>
          </Button>
        </div>
      </div>

      {/* Main Builder Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Slide Thumbnails List */}
        <div className="lg:col-span-3 space-y-3 bg-white dark:bg-zinc-900/80 border border-zinc-200/80 dark:border-zinc-800/80 rounded-3xl p-4 shadow-xs">
          <div className="flex items-center justify-between px-2 pb-2 border-b border-zinc-100 dark:border-zinc-800">
            <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
              Slides ({slides.length})
            </span>

            {/* Add Slide Dropdown */}
            <div className="relative group">
              <button className="px-2.5 py-1 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 text-xs font-bold flex items-center gap-1 hover:bg-indigo-100 transition-colors">
                <Plus className="w-3.5 h-3.5" />
                <span>Add Slide</span>
              </button>

              <div className="absolute left-0 mt-1 w-52 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl p-1.5 hidden group-hover:block group-focus-within:block z-30 space-y-0.5 animate-fade-in max-h-72 overflow-y-auto">
                <button
                  onClick={() => handleAddSlide("COVER")}
                  className="w-full text-left px-3 py-1.5 text-xs font-semibold rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                >
                  Cover / Title Slide
                </button>
                <button
                  onClick={() => handleAddSlide("FOUNDER_BIO")}
                  className="w-full text-left px-3 py-1.5 text-xs font-semibold rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                >
                  Founder Bio Slide
                </button>
                <button
                  onClick={() => handleAddSlide("BIG_QUESTION")}
                  className="w-full text-left px-3 py-1.5 text-xs font-semibold rounded-lg hover:bg-amber-50 dark:hover:bg-amber-950/40 text-amber-600 dark:text-amber-400"
                >
                  आगे क्या सोचा है? (Reflection)
                </button>
                <button
                  onClick={() => handleAddSlide("CONTENT")}
                  className="w-full text-left px-3 py-1.5 text-xs font-semibold rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                >
                  Feature / Bullets Slide
                </button>
                <button
                  onClick={() => handleAddSlide("STATS")}
                  className="w-full text-left px-3 py-1.5 text-xs font-semibold rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                >
                  Stats / Impact Grid
                </button>
                <button
                  onClick={() => handleAddSlide("POLL")}
                  className="w-full text-left px-3 py-1.5 text-xs font-semibold rounded-lg hover:bg-cyan-50 dark:hover:bg-cyan-950/40 text-cyan-600 dark:text-cyan-400 font-bold"
                >
                  📊 Live Pulse Poll
                </button>
                <button
                  onClick={() => handleAddSlide("QUIZ")}
                  className="w-full text-left px-3 py-1.5 text-xs font-semibold rounded-lg hover:bg-amber-50 dark:hover:bg-amber-950/40 text-amber-600 dark:text-amber-400 font-bold"
                >
                  ⚡ Timed Kahoot Quiz
                </button>
                <button
                  onClick={() => handleAddSlide("OFFER_CTA")}
                  className="w-full text-left px-3 py-1.5 text-xs font-semibold rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                >
                  🎁 Offer / CTA Slide
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
            {slides.map((s, idx) => {
              const isCurrent = idx === activeSlideIndex;
              return (
                <div
                  key={s.id || idx}
                  onClick={() => setActiveSlideIndex(idx)}
                  className={`group relative p-3 rounded-2xl border transition-all cursor-pointer ${
                    isCurrent
                      ? "border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30 shadow-xs"
                      : "border-zinc-200/80 dark:border-zinc-800/80 hover:border-zinc-300 dark:hover:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-900/50"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md bg-zinc-200/70 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                      #{idx + 1}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                        s.type === "QUIZ"
                          ? "bg-amber-500/10 text-amber-500"
                          : s.type === "POLL"
                          ? "bg-cyan-500/10 text-cyan-500"
                          : s.type === "OFFER_CTA"
                          ? "bg-emerald-500/10 text-emerald-500"
                          : "bg-zinc-200/50 dark:bg-zinc-800 text-zinc-500"
                      }`}
                    >
                      {s.type}
                    </span>
                  </div>

                  <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200 truncate">
                    {s.title || "Untitled Slide"}
                  </p>

                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-end gap-1 mt-2 pt-1 border-t border-zinc-200/40 dark:border-zinc-800/40">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMoveSlide(idx, "up");
                      }}
                      className="p-1 rounded-md text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 disabled:opacity-30"
                    >
                      <ChevronUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={idx === slides.length - 1}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMoveSlide(idx, "down");
                      }}
                      className="p-1 rounded-md text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 disabled:opacity-30"
                    >
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={slides.length <= 1}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteSlide(idx);
                      }}
                      className="p-1 rounded-md text-zinc-400 hover:text-rose-500 disabled:opacity-30"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Center: Live Slide Canvas Preview */}
        <div className="lg:col-span-6 space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
              Canvas Live Preview
            </span>
            <span className="text-xs text-indigo-400 font-medium">
              Slide {activeSlideIndex + 1} of {slides.length}
            </span>
          </div>

          {activeSlide ? (
            <div className="aspect-video w-full rounded-3xl bg-zinc-950 text-white p-6 sm:p-8 flex flex-col justify-center shadow-2xl border border-zinc-800 relative overflow-hidden">
              {/* Glow lights */}
              <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-violet-600/15 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10 max-h-full overflow-y-auto pr-1">
                <SlideRenderer
                  slide={activeSlide}
                  buildStep={999}
                  presentationTitle={title}
                  isProjector={false}
                />
              </div>
            </div>
          ) : (
            <div className="aspect-video w-full rounded-3xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-zinc-400 text-xs">
              Select or add a slide to preview
            </div>
          )}
        </div>

        {/* Right: Slide Property Editor */}
        <div className="lg:col-span-3 space-y-4 bg-white dark:bg-zinc-900/80 border border-zinc-200/80 dark:border-zinc-800/80 rounded-3xl p-5 shadow-xs">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800">
            <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
              Slide Configuration
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold">
              {activeSlide?.type}
            </span>
          </div>

          {activeSlide && (
            <div className="space-y-3.5 text-xs max-h-[600px] overflow-y-auto pr-1">
              <div>
                <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  Badge / Label
                </label>
                <input
                  type="text"
                  value={activeSlide.badge || ""}
                  onChange={(e) =>
                    handleUpdateActiveSlide({ badge: e.target.value })
                  }
                  placeholder="e.g. PILLAR 01, LIVE AUDIENCE PULSE"
                  className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-900 dark:text-zinc-100 font-medium focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  Slide Headline
                </label>
                <input
                  type="text"
                  value={activeSlide.title || ""}
                  onChange={(e) =>
                    handleUpdateActiveSlide({ title: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-900 dark:text-zinc-100 font-medium focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  Subtitle / Subtext
                </label>
                <textarea
                  rows={2}
                  value={activeSlide.subtitle || ""}
                  onChange={(e) =>
                    handleUpdateActiveSlide({ subtitle: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-900 dark:text-zinc-100 font-medium focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              {/* Build steps count */}
              <div>
                <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  Progressive Build Clicks / Steps
                </label>
                <input
                  type="number"
                  min={0}
                  max={10}
                  value={activeSlide.maxBuildSteps ?? 1}
                  onChange={(e) =>
                    handleUpdateActiveSlide({
                      maxBuildSteps: Number(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-900 dark:text-zinc-100 font-medium focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              {/* Presenter Notes / Cue Script */}
              <div>
                <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  Presenter Script & Cues (Press 'N' during live)
                </label>
                <textarea
                  rows={4}
                  value={activeSlide.notes || ""}
                  onChange={(e) =>
                    handleUpdateActiveSlide({ notes: e.target.value })
                  }
                  placeholder="Presenter script, speaking cues, time limits and caveats..."
                  className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-900 dark:text-zinc-100 font-mono text-[11px] focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              {/* Bullet points editor */}
              {activeSlide.type === "CONTENT" && (
                <div>
                  <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    Bullet Points (1 per line)
                  </label>
                  <textarea
                    rows={4}
                    value={(activeSlide.bullets || []).join("\n")}
                    onChange={(e) =>
                      handleUpdateActiveSlide({
                        bullets: e.target.value.split("\n"),
                      })
                    }
                    placeholder="Enter each bullet point on a new line..."
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-900 dark:text-zinc-100 font-medium focus:outline-hidden focus:border-indigo-500"
                  />
                </div>
              )}

              {/* Poll options editor */}
              {activeSlide.type === "POLL" && (
                <div>
                  <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    Poll Question & Choices (1 per line)
                  </label>
                  <input
                    type="text"
                    value={activeSlide.question || ""}
                    onChange={(e) =>
                      handleUpdateActiveSlide({ question: e.target.value })
                    }
                    placeholder="Poll question..."
                    className="w-full px-3 py-2 mb-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-900 dark:text-zinc-100 font-medium"
                  />
                  <textarea
                    rows={4}
                    value={(activeSlide.options || []).join("\n")}
                    onChange={(e) =>
                      handleUpdateActiveSlide({
                        options: e.target.value.split("\n"),
                      })
                    }
                    placeholder="Option A\nOption B\nOption C\nOption D"
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-900 dark:text-zinc-100 font-medium focus:outline-hidden focus:border-indigo-500"
                  />
                </div>
              )}

              {/* Quiz choices & correct answer editor */}
              {activeSlide.type === "QUIZ" && (
                <div className="space-y-3">
                  <div>
                    <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                      Quiz Question
                    </label>
                    <input
                      type="text"
                      value={activeSlide.question || ""}
                      onChange={(e) =>
                        handleUpdateActiveSlide({ question: e.target.value })
                      }
                      placeholder="Quiz challenge question..."
                      className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-900 dark:text-zinc-100 font-medium"
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                        Time Limit (Seconds)
                      </label>
                      <input
                        type="number"
                        min={5}
                        max={120}
                        value={activeSlide.timeLimit || 20}
                        onChange={(e) =>
                          handleUpdateActiveSlide({
                            timeLimit: Number(e.target.value),
                          })
                        }
                        className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-900 dark:text-zinc-100 font-medium"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-2">
                      Options & Correct Answer
                    </label>
                    <div className="space-y-2">
                      {(activeSlide.options || []).map(
                        (opt: any, optIdx: number) => (
                          <div
                            key={optIdx}
                            className="flex items-center gap-2 p-2 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800"
                          >
                            <input
                              type="radio"
                              name="correctAnswer"
                              checked={Boolean(opt.isCorrect)}
                              onChange={() => {
                                const newOpts = activeSlide.options.map(
                                  (o: any, i: number) => ({
                                    ...o,
                                    isCorrect: i === optIdx,
                                  })
                                );
                                handleUpdateActiveSlide({ options: newOpts });
                              }}
                              title="Mark as correct answer"
                              className="accent-emerald-500 w-4 h-4 cursor-pointer"
                            />
                            <input
                              type="text"
                              value={opt.text}
                              onChange={(e) => {
                                const newOpts = [...activeSlide.options];
                                newOpts[optIdx] = {
                                  ...newOpts[optIdx],
                                  text: e.target.value,
                                };
                                handleUpdateActiveSlide({ options: newOpts });
                              }}
                              className="flex-1 bg-transparent text-zinc-900 dark:text-zinc-100 text-xs font-medium focus:outline-hidden"
                            />
                          </div>
                        )
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Offer CTA editor */}
              {activeSlide.type === "OFFER_CTA" && (
                <div className="space-y-3">
                  <div>
                    <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                      Coupon Code
                    </label>
                    <input
                      type="text"
                      value={activeSlide.couponCode || ""}
                      onChange={(e) =>
                        handleUpdateActiveSlide({
                          couponCode: e.target.value.toUpperCase(),
                        })
                      }
                      className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-900 dark:text-zinc-100 font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                      Button Text & URL
                    </label>
                    <input
                      type="text"
                      value={activeSlide.buttonText || ""}
                      onChange={(e) =>
                        handleUpdateActiveSlide({
                          buttonText: e.target.value,
                        })
                      }
                      placeholder="Claim Offer"
                      className="w-full px-3 py-2 mb-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-900 dark:text-zinc-100"
                    />
                    <input
                      type="url"
                      value={activeSlide.targetUrl || ""}
                      onChange={(e) =>
                        handleUpdateActiveSlide({
                          targetUrl: e.target.value,
                        })
                      }
                      placeholder="https://unisole.org/programs"
                      className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-900 dark:text-zinc-100 text-xs"
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
