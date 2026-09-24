export interface CatalogOffering {
  id: string;
  title: string;
  group: string;
  itemType: "PATHWAY" | "WORKSHOP" | "COURSE" | "PROGRAM";
  slug: string;
  description?: string;
}

export const CANONICAL_CATALOG: CatalogOffering[] = [
  // ============================================================
  // GROUP 01: Computer Science & IT
  // ============================================================
  {
    id: "cs-genai",
    title: "Generative AI Engineering",
    group: "Group 01 • Computer Science & IT",
    itemType: "PATHWAY",
    slug: "cs-genai",
    description: "Data engineering, NLP, sequence models, Transformers, RAG, and Agentic AI systems",
  },
  {
    id: "cs-agentic",
    title: "AI Agent Engineering",
    group: "Group 01 • Computer Science & IT",
    itemType: "PATHWAY",
    slug: "cs-agentic",
    description: "Designing, building, evaluating, and deploying production-grade multi-agent systems",
  },
  {
    id: "cs-p1",
    title: "Machine Learning in Production: MLOps Engineering",
    group: "Group 01 • Computer Science & IT",
    itemType: "PATHWAY",
    slug: "cs-p1",
    description: "Data pipelines, experiment tracking, model deployment, monitoring, and cloud ML platforms",
  },

  // ============================================================
  // INCUBATOR TRACK
  // ============================================================
  {
    id: "cs-common",
    title: "AI Entrepreneurship & Business Innovation",
    group: "Incubator Track • CS & Commerce",
    itemType: "PATHWAY",
    slug: "cs-common",
    description: "Weekend incubator converting technical capability into validated commercial products",
  },

  // ============================================================
  // GROUP 02: Science & Mathematics
  // ============================================================
  {
    id: "sci-p1",
    title: "Scientific Machine Learning for Basic Sciences (BSc Physics | BSc Maths)",
    group: "Group 02 • Science & Mathematics",
    itemType: "PATHWAY",
    slug: "sci-p1",
    description: "PINNs, PyTorch autograd, differential equations, and forward/inverse scientific problems",
  },
  {
    id: "sci-p2",
    title: "Mathematics + AI / Computational Intelligence",
    group: "Group 02 • Science & Mathematics",
    itemType: "PATHWAY",
    slug: "sci-p2",
    description: "Mathematical proofs, optimization theory, statistical learning, and algorithms",
  },

  // ============================================================
  // GROUP 03: Commerce, BBA & Management
  // ============================================================
  {
    id: "mgmt-p1",
    title: "Business Analytics & Data Engineering",
    group: "Group 03 • Commerce & Management",
    itemType: "PATHWAY",
    slug: "mgmt-p1",
    description: "Excel, SQL, modern data pipelines (ETL, Parquet, DuckDB), Power BI, and Generative AI",
  },

  // ============================================================
  // GROUP 04: BA, Humanities & Non-Tech Disciplines
  // ============================================================
  {
    id: "arts-p1",
    title: "Applied AI for Humanities, Research & Careers",
    group: "Group 04 • BA & Humanities",
    itemType: "PATHWAY",
    slug: "arts-p1",
    description: "Prompt engineering, AI research methods, executive communication, and career mastery",
  },

  // ============================================================
  // WORKSHOPS & MASTERCLASSES
  // ============================================================
  {
    id: "AI_MASTERCLASS_2026",
    title: "AI Revolution & Agentic Engineering Masterclass",
    group: "Workshops & Masterclasses",
    itemType: "WORKSHOP",
    slug: "ai-masterclass",
    description: "2-Hour Live Interactive Masterclass: Foundation Literacy, 2026 Landscapes, Prompting",
  },
  {
    id: "ai-masterclass",
    title: "AI Revolution & Agentic Engineering Masterclass (Alias)",
    group: "Workshops & Masterclasses",
    itemType: "WORKSHOP",
    slug: "ai-masterclass",
  },
];

/**
 * Resolves a readable offering title for any enrollment item ID or pathway ID.
 */
export function resolveOfferingTitle(itemId?: string | null, dynamicPathways?: any[]): string {
  if (!itemId) return "Unknown Offering";
  const canonical = CANONICAL_CATALOG.find(
    (c) => c.id.toLowerCase() === itemId.toLowerCase() || c.slug.toLowerCase() === itemId.toLowerCase()
  );
  if (canonical) return canonical.title;

  if (dynamicPathways && Array.isArray(dynamicPathways)) {
    const dyn = dynamicPathways.find(
      (p) => p.id === itemId || p.slug === itemId
    );
    if (dyn) return dyn.title;
  }

  return itemId;
}
