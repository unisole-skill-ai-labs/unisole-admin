import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  useGetPresentationQuery,
  useUpdatePresentationMutation,
  useGetCollegesQuery,
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
  Building2,
  Clock,
  Award,
  Zap,
  RotateCcw,
  FileText,
  Smartphone,
  Monitor,
  Eye,
  Sliders,
  X,
  TrendingUp,
  ShieldCheck,
  Briefcase,
  GraduationCap,
  FileCheck,
  Compass,
  QrCode,
  Flame,
  Search,
  LayoutTemplate,
  Info,
} from "lucide-react";
import Button from "../ui/Button";
import SlideRenderer from "./SlideRenderer";
import { UNISOLE_AI_CAMPUS_DECK_SLIDES } from "../../data/aiCampusDeck";

interface PresentationBuilderProps {
  baseUrl: string;
}

interface SlideTemplate {
  type: string;
  title: string;
  desc: string;
  icon: any;
  badge: string;
  defaultData: Record<string, any>;
}

interface TemplateCategory {
  id: string;
  label: string;
  templates: SlideTemplate[];
}

// Available Template Definitions
const TEMPLATE_CATEGORIES: TemplateCategory[] = [
  {
    id: "hero",
    label: "Story & Hook",
    templates: [
      {
        type: "COVER",
        title: "Cover / Title Slide",
        desc: "High-impact opening hero with badge, title, subtitle & org pill",
        icon: Sparkles,
        badge: "Hero",
        defaultData: {
          badge: "INDUSTRIAL TRAINING & INTERNSHIP OPPORTUNITY PROGRAM",
          title: "UNISOLE AI CAMPUS PROGRAM",
          subtitle: "For College Students Across Himachal Pradesh",
          org: "UNISOLE SKILL AI LABS",
          maxBuildSteps: 3,
        },
      },
      {
        type: "FOUNDER_BIO",
        title: "Founder Bio & Journey",
        desc: "Personal story, credentials badge, track record & quote",
        icon: Award,
        badge: "Story",
        defaultData: {
          badge: "FOUNDER",
          title: "AJAY MOKTA",
          subtitle: "Founder, UNISOLE Skill AI Labs · B.Tech, NIT Hamirpur",
          initials: "AM",
          credentials: [
            "NIT Hamirpur Alumnus",
            "NASA Space Apps Challenge",
            "3rd — National Startup Summit",
            "ICAR-IARI Incubation Grantee",
            "Speaker & Mentor on Applied AI",
          ],
          quote: "“A degree from any college in Himachal should be backed by skills that compete globally.”",
          maxBuildSteps: 3,
        },
      },
      {
        type: "BIG_QUESTION",
        title: "Big Question (आगे क्या सोचा है?)",
        desc: "Deep emotional hook question with pulsating cue dot",
        icon: HelpCircle,
        badge: "Hook",
        defaultData: {
          title: "आगे क्या सोचा है?",
          subtitle: "Not what your parents have decided. Not what your friends are doing. What have YOU thought about?",
          maxBuildSteps: 2,
        },
      },
      {
        type: "IMAGE_BANNER",
        title: "Campus Showcase Banner",
        desc: "Full-width featured photo with title & badge",
        icon: Compass,
        badge: "Visual",
        defaultData: {
          badge: "CAMPUS ROADSHOW",
          title: "Empowering Himachal's Next-Gen Tech Talent",
          subtitle: "Hands-on AI skill labs across colleges",
          image: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=1200&auto=format&fit=crop&q=80",
          maxBuildSteps: 1,
        },
      },
    ],
  },
  {
    id: "market",
    label: "Market Trends & Data",
    templates: [
      {
        type: "PILLARS_OVERVIEW",
        title: "Four Things Changed",
        desc: "4 Macro market shift pillars with progressive card reveals",
        icon: Layers,
        badge: "Pillars",
        defaultData: {
          badge: "THE LANDSCAPE",
          title: "FOUR THINGS HAVE CHANGED",
          subtitle: "THE WORLD YOU ARE ENTERING.",
          pillars: [
            { number: "01", label: "The Job Market", revealedText: "Far More Graduates. A Different Map." },
            { number: "02", label: "Rise of Private Sector", revealedText: "An Economy That Did Not Exist in 1991." },
            { number: "03", label: "What People Get Wrong", revealedText: "The Fears are Real. They are Incomplete." },
            { number: "04", label: "Time & Opportunity Cost", revealedText: "What Can Two Years Change?" },
          ],
          maxBuildSteps: 4,
        },
      },
      {
        type: "COMPARISON_STATS",
        title: "Job Market Comparison Stats",
        desc: "1991 vs 2026 graduate volume, competition ratio & insight box",
        icon: BarChart2,
        badge: "Stats",
        defaultData: {
          badge: "PILLAR 01",
          title: "THE JOB MARKET",
          subtitle: "FAR MORE GRADUATES. A DIFFERENT MAP.",
          stat1: { year: "1990-91", count: "49 lakh", label: "IN HIGHER EDUCATION", ratio: "~6% ENROLMENT RATIO" },
          stat2: { year: "2023-24", count: "4.50 crore", label: "IN HIGHER EDUCATION", ratio: "30% ENROLMENT RATIO" },
          statCompetition: { number: "193", label: "APPLICANTS PER VACANCY", detail: "SSC CGL 2025 — 28.15 lakh applicants for 15,118 posts" },
          insightBox: {
            title: "Government jobs are not a bad choice.",
            text: "They are a good choice that far more people are now making at once. The map has more roads than in 1996.",
          },
          maxBuildSteps: 4,
        },
      },
      {
        type: "TIMELINE_EVOLUTION",
        title: "Timeline Evolution",
        desc: "1991 to 2025+ timeline stages & tech revenue metrics",
        icon: TrendingUp,
        badge: "Timeline",
        defaultData: {
          badge: "PILLAR 02",
          title: "THE RISE OF THE PRIVATE SECTOR",
          subtitle: "AN ECONOMY THAT DID NOT EXIST IN 1991.",
          timeline: [
            { year: "1991", label: "LIBERALISATION" },
            { year: "2000s", label: "IT REVOLUTION" },
            { year: "2010s", label: "SERVICES & BPO" },
            { year: "2016+", label: "STARTUPS" },
            { year: "2020s", label: "DIGITAL ECONOMY" },
            { year: "2025+", label: "AI ECONOMY" },
          ],
          stats: [
            { value: "$315 bn", label: "Tech revenue, FY2026", sub: "124x since 1995-96" },
            { value: "~60 lakh", label: "Working in tech today", sub: "+2.36 mn in 2,117 GCCs" },
            { value: "2.35 lakh", label: "Recognised startups", sub: "23.36 lakh jobs created" },
          ],
          maxBuildSteps: 3,
        },
      },
      {
        type: "MYTH_VS_FACT",
        title: "Myth vs Fact Breakdown",
        desc: "Two-panel comparison of perceptions vs real industry data",
        icon: ShieldCheck,
        badge: "Debate",
        defaultData: {
          badge: "PILLAR 03",
          title: "WHAT PEOPLE GET WRONG",
          subtitle: "THE FEARS ARE REAL. THEY ARE ALSO INCOMPLETE.",
          myths: ["Private jobs are unstable.", "You can be replaced easily.", "Too many layoffs.", "What happens after 50?", "Only government is secure."],
          facts: [
            { value: "+170 mn", label: "new roles by 2030, against 92 mn displaced" },
            { value: "39%", label: "of core skills change — churn opens doors too" },
            { value: "63%", label: "of employers say skills, not jobs, are the gap" },
            { value: "30-50%", label: "typical pay jump at a first switch" },
            { value: "2.36 mn", label: "already doing global work from India" },
          ],
          keyTakeaway: "The risk is real. Skills protect you — not the sector.",
          maxBuildSteps: 3,
        },
      },
      {
        type: "SCENARIO_SPLIT",
        title: "Scenario Split: 2-Year Cost",
        desc: "Side-by-side comparison of 2 years exam prep vs 2 years skill building",
        icon: Sliders,
        badge: "Decision",
        defaultData: {
          badge: "PILLAR 04",
          title: "TIME & OPPORTUNITY COST",
          subtitle: "WHAT CAN TWO YEARS CHANGE?",
          scenarioA: {
            title: "SCENARIO A",
            subtitle: "Two years of full-time exam preparation",
            steps: ["Study", "Exam attempts", "Selection uncertainty", "Waiting period"],
            footer: "193 per vacancy · 933 UPSC posts",
          },
          scenarioB: {
            title: "SCENARIO B",
            subtitle: "Two years building skills alongside your degree",
            steps: [
              { time: "MONTH 0-6", label: "Learn a real skill" },
              { time: "MONTH 6-12", label: "Build and ship projects" },
              { time: "MONTH 12-18", label: "Internship & Industry Exposure" },
              { time: "MONTH 18-24", label: "Entry role → first switch" },
            ],
            footer: "₹3.5-6 LPA entry · ₹8-12 LPA+ with a portfolio",
          },
          caveat: "Illustrative — not a guaranteed outcome. Choose deliberately, not by default.",
          maxBuildSteps: 3,
        },
      },
      {
        type: "BENEFITS_GRID",
        title: "Private Career Potential",
        desc: "5 key advantages: Remote work, salary bands, GCCs, upskilling",
        icon: Briefcase,
        badge: "Career",
        defaultData: {
          badge: "CAREER POTENTIAL",
          title: "THE OTHER SIDE OF THE LEDGER",
          subtitle: "WHAT CAN A PRIVATE CAREER OFFER?",
          benefits: [
            { title: "HYBRID & REMOTE WORK", value: "36%", sub: "work hybrid in India" },
            { title: "EARNING POTENTIAL", value: "₹3.5-40+", sub: "LPA fresher band" },
            { title: "GLOBAL OPPORTUNITIES", value: "2,117", sub: "GCCs in India" },
            { title: "PROFESSIONAL GROWTH", value: "85%", sub: "of employers upskilling" },
            { title: "NETWORK GROWTH", value: "20 lakh+", sub: "upskilled in AI, FY26" },
          ],
          footer: "Depending on role, company and industry. None of it arrives without skills.",
          maxBuildSteps: 2,
        },
      },
    ],
  },
  {
    id: "academic",
    label: "Degree Alignment & Gaps",
    templates: [
      {
        type: "DEGREE_MATRIX",
        title: "Degree Entry Points Matrix",
        desc: "CS/IT, Science, Commerce, Arts alignment with salary bands and effort",
        icon: GraduationCap,
        badge: "Degrees",
        defaultData: {
          badge: "ACADEMIC ALIGNMENT",
          title: "YOUR DEGREE, YOUR ENTRY POINT",
          subtitle: "FOUR STARTING POINTS.",
          rows: [
            { branch: "CS / IT", degrees: "BCA · MCA · B.Sc CS · B.Tech", role: "Software / ML Engineer", range: "₹4-12 LPA", effort: "HIGH" },
            { branch: "SCIENCE", degrees: "Physics · Maths · Chemistry · Biology", role: "Data / Scientific Computing", range: "₹4-10 LPA", effort: "HIGH" },
            { branch: "COMMERCE / BBA", degrees: "B.Com · BBA · M.Com · Economics", role: "Business / Financial Analyst", range: "₹3.5-8 LPA", effort: "MED-HIGH" },
            { branch: "ARTS / OTHER", degrees: "BA · Humanities · others", role: "AI-enabled digital & research roles", range: "₹3-6 LPA", effort: "MEDIUM" },
          ],
          maxBuildSteps: 4,
        },
      },
      {
        type: "GAP_LAYER",
        title: "The Missing Industry Gap Layer",
        desc: "Degree foundation vs the practical layer nobody hands you",
        icon: Layers,
        badge: "Reality",
        defaultData: {
          badge: "REALITY CHECK",
          title: "THE GAP",
          subtitle: "A DEGREE DOES NOT INCLUDE THESE.",
          industryLayer: [
            "Practical Skills",
            "Projects",
            "Portfolio",
            "Communication",
            "Problem Solving",
            "Tools",
            "Industry Awareness",
          ],
          punchline: "The degree is the foundation. The layer on top is built on purpose.",
          maxBuildSteps: 3,
        },
      },
    ],
  },
  {
    id: "blueprint",
    label: "Strategy & Methodology",
    templates: [
      {
        type: "ROADMAP_FLOW",
        title: "6-Step Career Roadmap",
        desc: "Sequential progression from skill to shipped project to recruiter interview",
        icon: Compass,
        badge: "Roadmap",
        defaultData: {
          badge: "THE BLUEPRINT",
          title: "THE ROADMAP",
          subtitle: "HOW DO YOU GET THERE?",
          steps: [
            { num: "01", title: "INDUSTRY-GRADE SKILLS" },
            { num: "02", title: "INDUSTRY-GRADE PROJECT" },
            { num: "03", title: "RESUME + PORTFOLIO" },
            { num: "04", title: "APPROACH COMPANIES" },
            { num: "05", title: "INTERVIEW" },
            { num: "06", title: "OPPORTUNITY" },
          ],
          punchline: "Most students try to jump from 01 directly to 06.",
          maxBuildSteps: 6,
        },
      },
      {
        type: "BUILD_VS_TUTORIAL",
        title: "Tutorial Trap vs Real Building",
        desc: "Contrast between passive tutorials and real problem-research-build cycle",
        icon: Zap,
        badge: "Proof",
        defaultData: {
          badge: "STEP 02 FOCUS",
          title: "LEARNING IS NOT BUILDING.",
          subtitle: "A project is the only proof that you can apply what you know.",
          tutorialChain: ["TUTORIAL", "COPY", "FINISH", "FORGET"],
          tutorialNote: "The feeling of progress. None of the evidence.",
          projectSteps: [
            { step: 1, label: "PROBLEM" },
            { step: 2, label: "RESEARCH" },
            { step: 3, label: "BUILD" },
            { step: 4, label: "TEST" },
            { step: 5, label: "DEPLOY / PRESENT" },
            { step: 6, label: "EVIDENCE" },
          ],
          theTest: "Can someone else open it and see that it works — without you explaining it? If not, it is not yet evidence.",
          maxBuildSteps: 3,
        },
      },
      {
        type: "FUNNEL_WAYS",
        title: "7-Stage Funnel & 8 Outreach Channels",
        desc: "Why good skill ≠ opportunity without proper distribution channels",
        icon: Sliders,
        badge: "Funnel",
        defaultData: {
          badge: "STEPS 03 TO 06",
          title: "GOOD SKILL ≠ GOOD OPPORTUNITY.",
          subtitle: "Every stage below skill is a communication problem.",
          funnel: ["SKILL", "PROJECT", "RESUME", "APPLICATION", "REFERRAL / NETWORK", "INTERVIEW", "OPPORTUNITY"],
          channels: ["Job portals", "Career pages", "Referrals", "LinkedIn", "Cold email", "Alumni", "Hackathons", "Direct outreach"],
          punchline: "Most students use only one of these eight.",
          maxBuildSteps: 2,
        },
      },
    ],
  },
  {
    id: "curricula",
    label: "Curricula & Offerings",
    templates: [
      {
        type: "PROGRAM_PILLARS",
        title: "Program Pillars Grid",
        desc: "7 elements: Curriculum, practical projects, expert sessions, portfolio",
        icon: Layers,
        badge: "Solution",
        defaultData: {
          badge: "THE STRUCTURED SOLUTION",
          title: "SO HOW DO YOU BUILD THIS?",
          subtitle: "UNISOLE AI CAMPUS PROGRAM — Build skills, projects and professional evidence.",
          components: [
            { title: "Industry Curriculum", desc: "Modern production-grade tools, stacks & patterns" },
            { title: "Practical Projects", desc: "Shipped live with real data, tests & end users" },
            { title: "Expert Sessions", desc: "Live masterclasses from senior engineers & founders" },
            { title: "Career Prep", desc: "Resume architecture, ATS optimization & mock interviews" },
            { title: "Portfolio", desc: "Verified proof and live deployments for recruiters" },
            { title: "Mentorship", desc: "Personal 1-on-1 code and career feedback on your work" },
            { title: "Opportunity Pathways", desc: "Direct talent pool & industry connections" },
          ],
          maxBuildSteps: 1,
        },
      },
      {
        type: "COURSE_PATHWAYS",
        title: "4-Stream Course Pathways & Pricing",
        desc: "CS/IT, Science, Commerce, and Arts course modules with transparent fees",
        icon: GraduationCap,
        badge: "Pricing",
        defaultData: {
          badge: "CHOOSE YOUR TRACK",
          title: "COURSE PATHWAYS",
          subtitle: "FIND YOUR GROUP.",
          groups: [
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
          ],
          note: "AI Entrepreneurship & Innovation is open to every group.",
          maxBuildSteps: 4,
        },
      },
      {
        type: "OPPORTUNITY_PATHWAY",
        title: "Beyond Training: Opportunity Pipeline",
        desc: "Pipeline from performance to talent pool to internships & hackathons",
        icon: Briefcase,
        badge: "Pipeline",
        defaultData: {
          badge: "CAREER PIPELINE",
          title: "BEYOND THE TRAINING",
          subtitle: "FROM TRAINING TO OPPORTUNITY",
          flow: ["TRAIN", "BUILD", "PERFORM", "GET IDENTIFIED", "TALENT POOL", "OPPORTUNITIES"],
          opportunities: [
            "Advanced projects",
            "Hackathons",
            "Industry interaction",
            "Research projects",
            "Tutor roles",
            "Internships",
          ],
          disclaimer: "Subject to performance, eligibility, availability and selection procedures.",
          punchline: "Nothing here is promised. Everything here is earned.",
          maxBuildSteps: 3,
        },
      },
      {
        type: "MENTORSHIP_DUAL",
        title: "Dual Mentorship Experience",
        desc: "Industry practitioners + personal 1-on-1 career & code feedback",
        icon: Award,
        badge: "Mentors",
        defaultData: {
          badge: "EXPERIENCE",
          title: "WHAT IT FEELS LIKE",
          subtitle: "PEOPLE, NOT JUST CONTENT.",
          panelA: {
            title: "INDUSTRY EXPERTS",
            points: ["Real professionals", "Real problems", "Real workflows", "Real career insight"],
            footer: "People currently doing the work — not describing it.",
          },
          panelB: {
            title: "PERSONAL MENTORSHIP",
            points: ["Career direction", "Project guidance", "Resume & portfolio review", "Interview prep", "Communication coaching"],
            footer: "One-to-one, on your own work.",
          },
          maxBuildSteps: 2,
        },
      },
      {
        type: "RESEARCH_INTERN",
        title: "Research & Internship Pathways",
        desc: "Pathways for academic research, IAPT-linked projects and industry roles",
        icon: FileCheck,
        badge: "Research",
        defaultData: {
          badge: "ADVANCED PATHWAYS",
          title: "WHERE STRONG PERFORMANCE LEADS",
          subtitle: "INTERNSHIP & RESEARCH EXPOSURE",
          flow: ["TRAINING", "PROJECT", "PERFORMANCE", "IDENTIFICATION", "OPPORTUNITY"],
          doors: [
            "Industry-linked projects",
            "Internship opportunities",
            "Advanced projects",
            "Research exposure",
            "Hackathons",
          ],
          academicNote: {
            title: "RESEARCH-ORIENTED STUDENTS",
            body: "IAPT-linked and academic-network exposure is offered only where formally supported at the time. Nothing here is a guaranteed internship.",
          },
          maxBuildSteps: 3,
        },
      },
    ],
  },
  {
    id: "social_proof",
    label: "Social Proof & CTAs",
    templates: [
      {
        type: "TEAM_GRID",
        title: "Built by Practitioners (Team Grid)",
        desc: "Mentors from FAANG & tier-1 universities across 4 industry pillars",
        icon: Award,
        badge: "Team",
        defaultData: {
          badge: "THE UNISOLE TEAM",
          title: "BUILT BY PRACTITIONERS",
          subtitle: "People who have built and shipped real systems.",
          pillars: ["INDUSTRY", "ENGINEERING", "RESEARCH", "ACADEMIC EXPOSURE"],
          members: [
            { initials: "GG", name: "Girish Gaurav Sharma", role: "GoodSpace AI → Great Learning" },
            { initials: "SP", name: "Shabd Patel", role: "Software Engineer, BlackRock" },
            { initials: "K", name: "Kushal", role: "IIT Patna → Tech Mahindra" },
            { initials: "AK", name: "Aditya Kaushal", role: "M.Tech, IIT Delhi" },
            { initials: "DG", name: "Dishant Gupta", role: "Ex-Baker Hughes · Former ISRO Intern" },
          ],
          maxBuildSteps: 3,
        },
      },
      {
        type: "AMBASSADORS_CTA",
        title: "Campus Ambassadors & Fast-Pass QR",
        desc: "Ambassador recognition pathway with instant QR signup code",
        icon: QrCode,
        badge: "Community",
        defaultData: {
          badge: "A RECOGNITION PATHWAY",
          title: "UNISOLE COLLEGE AMBASSADORS",
          perks: [
            "Priority mentorship from the senior team",
            "Deeper career guidance & project reviews",
            "Exposure to industry professionals",
            "Leadership & communication development",
            "Early access to internships & hackathons",
            "Represent UNISOLE in your college",
          ],
          disclaimer: "A recognition and mentorship pathway — not a job, internship or placement.",
          qrAction: "Scan to sign up or connect with your college coordinator",
          targetUrl: "https://unisole.org/programs",
          finalQuestion: "आगे क्या सोचा है?",
          maxBuildSteps: 3,
        },
      },
      {
        type: "OFFER_CTA",
        title: "Exclusive Scholarship / Offer CTA",
        desc: "Promo coupon code with instant direct link to Unisole programs",
        icon: Sparkles,
        badge: "Offer",
        defaultData: {
          badge: "Special Roadshow Grant",
          title: "Exclusive Student Scholarship Available Now",
          subtitle: "Claim your campus roadshow grant before registration closes!",
          couponCode: "CAMPUS40",
          buttonText: "Explore Unisole Programs",
          targetUrl: "https://unisole.org/programs",
          maxBuildSteps: 1,
        },
      },
      {
        type: "STATS",
        title: "Impact & Placement Stats",
        desc: "Large prominent metric numbers (e.g. 94%, 18 LPA, 450+)",
        icon: BarChart2,
        badge: "Impact",
        defaultData: {
          badge: "ALUMNI RECORD",
          title: "Unisole Impact & Alumni Reach",
          subtitle: "Numbers backed by real placement offers and real portfolio projects.",
          stats: [
            { value: "94%", label: "Placement Rate" },
            { value: "18 LPA", label: "Highest CTC" },
            { value: "450+", label: "Hiring Partners" },
          ],
          maxBuildSteps: 3,
        },
      },
      {
        type: "CONTENT",
        title: "Numbered Highlights / Bullets",
        desc: "Clean 2-column numbered feature card grid",
        icon: FileText,
        badge: "Content",
        defaultData: {
          badge: "PROGRAM HIGHLIGHTS",
          title: "Core Program Highlights",
          subtitle: "Structured roadmap for ambitious undergraduates",
          bullets: [
            "Live 1-on-1 industry mentorship from FAANG / Top Unicorn leads",
            "Production-grade capstone projects built in modern stacks",
            "Dedicated placement drive with 200+ hiring partners",
            "Lifelong access to Unisole AI Labs community",
          ],
          maxBuildSteps: 4,
        },
      },
    ],
  },
  {
    id: "interactive",
    label: "Live Audience Engagement",
    templates: [
      {
        type: "POLL",
        title: "Live Pulse Poll",
        desc: "Live audience voting with instant animated percentage fill bars",
        icon: BarChart2,
        badge: "Live Poll",
        defaultData: {
          badge: "LIVE AUDIENCE PULSE",
          title: "Live Audience Poll",
          question: "Which career track are you most interested in pursuing?",
          options: [
            "Full-Stack Web & Cloud Systems",
            "AI, Machine Learning & LLMs",
            "Data Engineering & Analytics",
            "Cybersecurity & DevSecOps",
          ],
          maxBuildSteps: 1,
        },
      },
      {
        type: "QUIZ",
        title: "Fast-Finger Kahoot Quiz",
        desc: "Timed speed challenge (5-120s) with 4 tactile color buttons & scoring",
        icon: Flame,
        badge: "Live Quiz",
        defaultData: {
          badge: "FAST-FINGER TECH CHALLENGE",
          title: "Fast-Finger Tech Challenge",
          question: "According to WEF Future of Jobs 2025, what is the #1 skill employers prioritize?",
          timeLimit: 20,
          points: 1000,
          options: [
            { text: "Analytical & Problem-Solving Thinking", isCorrect: true },
            { text: "Memorizing code syntax", isCorrect: false },
            { text: "High college test scores alone", isCorrect: false },
            { text: "Collecting generic online certificates", isCorrect: false },
          ],
          maxBuildSteps: 1,
        },
      },
    ],
  },
];

export default function PresentationBuilder({ baseUrl }: PresentationBuilderProps) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: presRes, isLoading } = useGetPresentationQuery(
    { baseUrl, id: id! },
    { skip: !id }
  );
  const { data: colleges = [] } = useGetCollegesQuery(baseUrl);
  const [updatePresentation, { isLoading: isSaving }] =
    useUpdatePresentationMutation();

  const [title, setTitle] = useState("");
  const [collegeId, setCollegeId] = useState("");
  const [description, setDescription] = useState("");
  const [theme, setTheme] = useState("dark");
  const [slides, setSlides] = useState<any[]>([]);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [previewMode, setPreviewMode] = useState<"projector" | "mobile">("projector");
  const [stepTestIndex, setStepTestIndex] = useState<number>(999);
  const [templateDrawerOpen, setTemplateDrawerOpen] = useState(false);
  const [templateCategory, setTemplateCategory] = useState("hero");
  const [templateSearch, setTemplateSearch] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (presRes?.data) {
      const d = presRes.data;
      setTitle(d.title || "");
      setCollegeId(d.collegeId || "");
      setDescription(d.description || "");
      setTheme(d.theme || "dark");
      setSlides(Array.isArray(d.slides) ? d.slides : []);
    }
  }, [presRes]);

  const activeSlide = slides[activeSlideIndex] || null;
  const maxSteps = activeSlide?.maxBuildSteps ?? 0;

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
    setStepTestIndex(999);
  };

  const handleInsertTemplate = (template: any) => {
    const newSlide = {
      id: `slide_${Date.now()}`,
      type: template.type,
      notes: "Presenter notes and speaking cues...",
      ...template.defaultData,
    };

    const updated = [...slides, newSlide];
    setSlides(updated);
    setActiveSlideIndex(updated.length - 1);
    setTemplateDrawerOpen(false);
    setStepTestIndex(999);
  };

  const handleDuplicateSlide = (index: number) => {
    const target = slides[index];
    if (!target) return;
    const duplicated = {
      ...JSON.parse(JSON.stringify(target)),
      id: `slide_${Date.now()}`,
      title: `${target.title || "Slide"} (Copy)`,
    };
    const updated = [...slides];
    updated.splice(index + 1, 0, duplicated);
    setSlides(updated);
    setActiveSlideIndex(index + 1);
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
          collegeId: collegeId || undefined,
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

  const filteredTemplates = TEMPLATE_CATEGORIES.flatMap((c) => c.templates).filter(
    (t) =>
      !templateSearch ||
      t.title.toLowerCase().includes(templateSearch.toLowerCase()) ||
      t.desc.toLowerCase().includes(templateSearch.toLowerCase()) ||
      t.type.toLowerCase().includes(templateSearch.toLowerCase())
  );

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
            title="Back to Presentations List"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Presentation Deck Title"
                className="text-lg sm:text-xl font-black text-zinc-900 dark:text-zinc-100 bg-transparent border-b border-transparent hover:border-zinc-300 dark:hover:border-zinc-700 focus:border-indigo-500 focus:outline-hidden px-1 transition-colors"
              />
              {collegeId && (
                <select
                  value={collegeId}
                  onChange={(e) => setCollegeId(e.target.value)}
                  className="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/60 dark:border-indigo-800/60 rounded-lg text-xs font-bold text-indigo-700 dark:text-indigo-300 focus:outline-hidden"
                >
                  {colleges.map((c: any) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.shortName || "CAMPUS"})
                    </option>
                  ))}
                </select>
              )}
            </div>
            <span className="text-[11px] text-zinc-400 block px-1 mt-0.5">
              {slides.length} slides • Animated Pitch Deck & Live Roadshow Arena
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Dual Preview Switcher */}
          <div className="flex items-center bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl border border-zinc-200 dark:border-zinc-700">
            <button
              onClick={() => setPreviewMode("projector")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                previewMode === "projector"
                  ? "bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-xs"
                  : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300"
              }`}
              title="Preview Desktop / Auditorium Projector View"
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>Projector (16:9)</span>
            </button>
            <button
              onClick={() => setPreviewMode("mobile")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                previewMode === "mobile"
                  ? "bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-xs"
                  : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300"
              }`}
              title="Preview Student Mobile View"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Mobile Phone (9:16)</span>
            </button>
          </div>

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

            <button
              onClick={() => setTemplateDrawerOpen(true)}
              className="px-2.5 py-1 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1 shadow-sm transition-all cursor-pointer"
              title="Add a new slide from 28+ rich templates"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Slide</span>
            </button>
          </div>

          <div className="space-y-2 max-h-[640px] overflow-y-auto pr-1">
            {slides.map((s, idx) => {
              const isCurrent = idx === activeSlideIndex;
              return (
                <div
                  key={s.id || idx}
                  onClick={() => {
                    setActiveSlideIndex(idx);
                    setStepTestIndex(999);
                  }}
                  className={`group relative p-3 rounded-2xl border transition-all cursor-pointer ${
                    isCurrent
                      ? "border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30 shadow-xs ring-2 ring-indigo-500/20"
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
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDuplicateSlide(idx);
                      }}
                      className="p-1 rounded-md text-zinc-400 hover:text-indigo-500"
                      title="Duplicate Slide"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMoveSlide(idx, "up");
                      }}
                      className="p-1 rounded-md text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 disabled:opacity-30"
                      title="Move Up"
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
                      title="Move Down"
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
                      title="Delete Slide"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Center: Live Slide Canvas Preview (Projector or Smartphone) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5" />
              <span>{previewMode === "mobile" ? "Student Mobile Mirror" : "Presenter Auditorium Canvas"}</span>
            </span>

            {/* Interactive Step Tester Bar */}
            {maxSteps > 0 && (
              <div className="flex items-center gap-1.5 bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs">
                <span className="text-[10px] font-mono text-zinc-400 font-bold">Step:</span>
                {[...Array(maxSteps + 1)].map((_, stepIdx) => (
                  <button
                    key={stepIdx}
                    onClick={() => setStepTestIndex(stepIdx)}
                    className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold transition-colors cursor-pointer ${
                      stepTestIndex === stepIdx
                        ? "bg-indigo-600 text-white"
                        : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200"
                    }`}
                    title={`Preview Reveal at Step ${stepIdx}`}
                  >
                    {stepIdx}
                  </button>
                ))}
                <button
                  onClick={() => setStepTestIndex(999)}
                  className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold transition-colors cursor-pointer ${
                    stepTestIndex === 999
                      ? "bg-emerald-600 text-white"
                      : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200"
                  }`}
                  title="Show All Steps Revealed"
                >
                  All
                </button>
              </div>
            )}
          </div>

          {activeSlide ? (
            previewMode === "projector" ? (
              /* ================= 16:9 PROJECTOR PREVIEW ================= */
              <div className="aspect-video w-full rounded-3xl bg-zinc-950 text-white p-6 sm:p-8 flex flex-col justify-center shadow-2xl border border-zinc-800 relative overflow-hidden">
                {/* Glow lights */}
                <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-violet-600/15 rounded-full blur-3xl pointer-events-none" />

                <div className="relative z-10 max-h-full overflow-y-auto pr-1">
                  <SlideRenderer
                    key={`preview-${activeSlideIndex}-${stepTestIndex}`}
                    slide={activeSlide}
                    buildStep={stepTestIndex}
                    presentationTitle={title}
                    isProjector={true}
                  />
                </div>
              </div>
            ) : (
              /* ================= 9:16 SMARTPHONE PHONE BEZEL PREVIEW ================= */
              <div className="flex justify-center py-2">
                <div className="w-[310px] h-[580px] bg-zinc-900 border-[7px] border-zinc-800 rounded-[44px] shadow-2xl overflow-hidden flex flex-col relative">
                  {/* Phone Notch / Camera Pill */}
                  <div className="absolute top-2 left-1/2 -translate-x-1/2 w-24 h-4 bg-zinc-950 rounded-full z-40 flex items-center justify-center">
                    <span className="w-2 h-2 rounded-full bg-zinc-800" />
                  </div>

                  {/* Phone Screen Canvas */}
                  <div className="w-full h-full bg-zinc-950 text-white flex flex-col justify-between overflow-y-auto pt-7 pb-3 px-3 relative font-sans">
                    {/* Header bar */}
                    <div className="flex items-center justify-between pb-2 border-b border-white/10 text-[10px] text-zinc-400 font-mono">
                      <div className="flex items-center gap-1 text-emerald-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                        <span className="font-bold">LIVE MIRROR</span>
                      </div>
                      <span>Slide {activeSlideIndex + 1}/{slides.length}</span>
                    </div>

                    {/* Mobile Slide Body */}
                    <div className="flex-1 flex flex-col justify-center py-3">
                      <SlideRenderer
                        key={`mobile-preview-${activeSlideIndex}-${stepTestIndex}`}
                        slide={activeSlide}
                        buildStep={stepTestIndex}
                        presentationTitle={title}
                        isProjector={false}
                      />
                    </div>

                    {/* Mobile Bottom Emoji Bar Mockup */}
                    <div className="pt-2 border-t border-white/10 flex items-center justify-around text-base">
                      <span>🔥</span>
                      <span>👏</span>
                      <span>🚀</span>
                      <span>❤️</span>
                      <span>💡</span>
                    </div>
                  </div>
                </div>
              </div>
            )
          ) : (
            <div className="aspect-video w-full rounded-3xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-zinc-400 text-xs">
              Select or add a slide to preview
            </div>
          )}
        </div>

        {/* Right: Comprehensive Slide Property Editor */}
        <div className="lg:col-span-4 space-y-4 bg-white dark:bg-zinc-900/80 border border-zinc-200/80 dark:border-zinc-800/80 rounded-3xl p-5 shadow-xs">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-indigo-500" />
              <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                Slide Configuration
              </span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold">
              {activeSlide?.type}
            </span>
          </div>

          {activeSlide && (
            <div className="space-y-4 text-xs max-h-[640px] overflow-y-auto pr-1">
              {/* Common Fields */}
              <div className="space-y-2.5">
                <div>
                  <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    Badge / Tagline
                  </label>
                  <input
                    type="text"
                    value={activeSlide.badge || ""}
                    onChange={(e) =>
                      handleUpdateActiveSlide({ badge: e.target.value })
                    }
                    placeholder="e.g. PILLAR 01, LIVE AUDIENCE PULSE, FOUNDER"
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-900 dark:text-zinc-100 font-medium focus:outline-hidden focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    Slide Headline / Question
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
                    Subtitle / Context
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

                <div>
                  <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    Build Step Clicks (Progressive Reveal)
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

                <div>
                  <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    Presenter Script & Teleprompter Notes (Key 'N')
                  </label>
                  <textarea
                    rows={3}
                    value={activeSlide.notes || ""}
                    onChange={(e) =>
                      handleUpdateActiveSlide({ notes: e.target.value })
                    }
                    placeholder="Speaking script, timing cues, caveats and questions to ask students..."
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-900 dark:text-zinc-100 font-mono text-[11px] focus:outline-hidden focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* ================= SPECIALIZED TEMPLATE EDITORS ================= */}

              {/* 1. COVER */}
              {activeSlide.type === "COVER" && (
                <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800 space-y-2">
                  <label className="block font-bold text-zinc-700 dark:text-zinc-300">
                    Organization Pill Text
                  </label>
                  <input
                    type="text"
                    value={activeSlide.org || ""}
                    onChange={(e) =>
                      handleUpdateActiveSlide({ org: e.target.value })
                    }
                    placeholder="e.g. UNISOLE SKILL AI LABS"
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-900 dark:text-zinc-100 font-medium"
                  />
                </div>
              )}

              {/* 2. FOUNDER BIO */}
              {activeSlide.type === "FOUNDER_BIO" && (
                <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800 space-y-2.5">
                  <label className="block font-bold text-zinc-700 dark:text-zinc-300">
                    Founder Credentials (1 per line)
                  </label>
                  <textarea
                    rows={4}
                    value={(activeSlide.credentials || []).join("\n")}
                    onChange={(e) =>
                      handleUpdateActiveSlide({
                        credentials: e.target.value.split("\n").filter(Boolean),
                      })
                    }
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-900 dark:text-zinc-100"
                  />
                  <div>
                    <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                      Founder Quote
                    </label>
                    <textarea
                      rows={2}
                      value={activeSlide.quote || ""}
                      onChange={(e) =>
                        handleUpdateActiveSlide({ quote: e.target.value })
                      }
                      className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-900 dark:text-zinc-100"
                    />
                  </div>
                </div>
              )}

              {/* 3. TEAM GRID */}
              {activeSlide.type === "TEAM_GRID" && (
                <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800 space-y-2.5">
                  <label className="block font-bold text-zinc-700 dark:text-zinc-300">
                    Industry Pillars (Comma separated)
                  </label>
                  <input
                    type="text"
                    value={(activeSlide.pillars || []).join(", ")}
                    onChange={(e) =>
                      handleUpdateActiveSlide({
                        pillars: e.target.value.split(",").map((s: string) => s.trim()),
                      })
                    }
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-900 dark:text-zinc-100"
                  />
                </div>
              )}

              {/* 4. MYTH VS FACT */}
              {activeSlide.type === "MYTH_VS_FACT" && (
                <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800 space-y-2.5">
                  <label className="block font-bold text-zinc-700 dark:text-zinc-300">
                    Perception Myths (1 per line)
                  </label>
                  <textarea
                    rows={3}
                    value={(activeSlide.myths || []).join("\n")}
                    onChange={(e) =>
                      handleUpdateActiveSlide({
                        myths: e.target.value.split("\n").filter(Boolean),
                      })
                    }
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-900 dark:text-zinc-100"
                  />
                  <div>
                    <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                      Key Takeaway Banner
                    </label>
                    <input
                      type="text"
                      value={activeSlide.keyTakeaway || ""}
                      onChange={(e) =>
                        handleUpdateActiveSlide({ keyTakeaway: e.target.value })
                      }
                      className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-900 dark:text-zinc-100"
                    />
                  </div>
                </div>
              )}

              {/* 5. GAP LAYER */}
              {activeSlide.type === "GAP_LAYER" && (
                <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800 space-y-2.5">
                  <label className="block font-bold text-zinc-700 dark:text-zinc-300">
                    Missing Industry Skills Tag Cloud (1 per line)
                  </label>
                  <textarea
                    rows={4}
                    value={(activeSlide.industryLayer || []).join("\n")}
                    onChange={(e) =>
                      handleUpdateActiveSlide({
                        industryLayer: e.target.value.split("\n").filter(Boolean),
                      })
                    }
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-900 dark:text-zinc-100"
                  />
                </div>
              )}

              {/* 6. CONTENT (BULLETS) */}
              {activeSlide.type === "CONTENT" && (
                <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800 space-y-2">
                  <label className="block font-bold text-zinc-700 dark:text-zinc-300">
                    Bullet Points (1 per line)
                  </label>
                  <textarea
                    rows={4}
                    value={(activeSlide.bullets || []).join("\n")}
                    onChange={(e) =>
                      handleUpdateActiveSlide({
                        bullets: e.target.value.split("\n").filter(Boolean),
                      })
                    }
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-900 dark:text-zinc-100"
                  />
                </div>
              )}

              {/* 7. LIVE POLL */}
              {activeSlide.type === "POLL" && (
                <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800 space-y-2.5">
                  <label className="block font-bold text-zinc-700 dark:text-zinc-300">
                    Poll Question & Options
                  </label>
                  <input
                    type="text"
                    value={activeSlide.question || ""}
                    onChange={(e) =>
                      handleUpdateActiveSlide({ question: e.target.value })
                    }
                    placeholder="Poll question..."
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-900 dark:text-zinc-100 font-medium"
                  />
                  <textarea
                    rows={4}
                    value={(activeSlide.options || []).join("\n")}
                    onChange={(e) =>
                      handleUpdateActiveSlide({
                        options: e.target.value.split("\n").filter(Boolean),
                      })
                    }
                    placeholder="Option A\nOption B\nOption C\nOption D"
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-900 dark:text-zinc-100 font-medium focus:outline-hidden focus:border-indigo-500"
                  />
                </div>
              )}

              {/* 8. TIMED KAHOOT QUIZ */}
              {activeSlide.type === "QUIZ" && (
                <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800 space-y-3">
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
                      placeholder="Challenge question..."
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
                      4 Option Cards (Select radio for correct answer)
                    </label>
                    <div className="space-y-2">
                      {(activeSlide.options || []).map((opt: any, optIdx: number) => (
                        <div
                          key={optIdx}
                          className="flex items-center gap-2 p-2 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800"
                        >
                          <input
                            type="radio"
                            name="correctAnswer"
                            checked={Boolean(opt.isCorrect)}
                            onChange={() => {
                              const newOpts = activeSlide.options.map((o: any, i: number) => ({
                                ...o,
                                isCorrect: i === optIdx,
                              }));
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
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* 9. OFFER CTA */}
              {activeSlide.type === "OFFER_CTA" && (
                <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800 space-y-2.5">
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
                      Target Destination URL
                    </label>
                    <input
                      type="url"
                      value={activeSlide.targetUrl || ""}
                      onChange={(e) =>
                        handleUpdateActiveSlide({
                          targetUrl: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-900 dark:text-zinc-100 text-xs"
                    />
                  </div>
                </div>
              )}

              {/* 10. IMAGE BANNER */}
              {activeSlide.type === "IMAGE_BANNER" && (
                <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800 space-y-2.5">
                  <label className="block font-bold text-zinc-700 dark:text-zinc-300">
                    Image Banner URL
                  </label>
                  <input
                    type="url"
                    value={activeSlide.image || ""}
                    onChange={(e) =>
                      handleUpdateActiveSlide({ image: e.target.value })
                    }
                    placeholder="https://..."
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-900 dark:text-zinc-100 text-xs"
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ================= COMPREHENSIVE 28+ TEMPLATE LIBRARY MODAL ================= */}
      {templateDrawerOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-fade-in">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 w-full max-w-4xl max-h-[85vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <LayoutTemplate className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-zinc-900 dark:text-zinc-100">
                    Slide Templates Library
                  </h3>
                  <p className="text-xs text-zinc-500">
                    Choose from 28+ pre-designed animated templates for colleges and investors
                  </p>
                </div>
              </div>

              <button
                onClick={() => setTemplateDrawerOpen(false)}
                className="p-2 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Category Tabs & Search */}
            <div className="px-6 py-3 border-b border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-zinc-50/50 dark:bg-zinc-950/50">
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
                {TEMPLATE_CATEGORIES.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => {
                      setTemplateCategory(c.id);
                      setTemplateSearch("");
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                      templateCategory === c.id && !templateSearch
                        ? "bg-indigo-600 text-white shadow-xs"
                        : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800"
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>

              <div className="relative">
                <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={templateSearch}
                  onChange={(e) => setTemplateSearch(e.target.value)}
                  placeholder="Search template..."
                  className="w-full sm:w-48 pl-9 pr-3 py-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-hidden focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Template Cards Grid */}
            <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {(templateSearch
                ? filteredTemplates
                : TEMPLATE_CATEGORIES.find((c) => c.id === templateCategory)?.templates || []
              ).map((t: any) => {
                const IconComp = t.icon || Sparkles;
                return (
                  <div
                    key={t.type}
                    onClick={() => handleInsertTemplate(t)}
                    className="group p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 hover:border-indigo-500 dark:hover:border-indigo-500 bg-white dark:bg-zinc-950/60 hover:bg-indigo-50/30 dark:hover:bg-indigo-950/20 transition-all cursor-pointer shadow-xs hover:shadow-lg flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                          <IconComp className="w-4 h-4" />
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-500">
                          {t.badge}
                        </span>
                      </div>

                      <div>
                        <h4 className="font-extrabold text-sm text-zinc-900 dark:text-zinc-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                          {t.title}
                        </h4>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed">
                          {t.desc}
                        </p>
                      </div>
                    </div>

                    <div className="pt-3 mt-2 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
                      <span>Insert Slide</span>
                      <Plus className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
