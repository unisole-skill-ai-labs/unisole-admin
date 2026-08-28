import React, { useState } from "react";
import {
  useGetPathwaysQuery,
  useCreatePathwayMutation,
  useUpdatePathwayMutation,
} from "../../store";
import PathwayBuilderModal from "./PathwayBuilderModal";
import {
  Plus,
  Compass,
  Edit2,
  Layers,
  Search,
  CheckCircle,
  XCircle,
  AlertCircle,
  DollarSign,
  Eye,
  RefreshCw,
  X,
  Building2,
  Sparkles,
} from "lucide-react";
import Badge from "../ui/Badge";
import Button from "../ui/Button";
import Modal from "../ui/Modal";
import Input from "../ui/Input";

interface PathwaysManagerProps {
  baseUrl: string;
}

export default function PathwaysManager({ baseUrl }: PathwaysManagerProps) {
  const { data: pathways = [], isLoading, refetch } = useGetPathwaysQuery(baseUrl);
  const [createPathway, { isLoading: isCreating }] = useCreatePathwayMutation();
  const [updatePathway, { isLoading: isUpdating }] = useUpdatePathwayMutation();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [editingPathway, setEditingPathway] = useState<any>(null); // null | 'create' | pathwayObj
  const [buildingPathway, setBuildingPathway] = useState<any>(null); // null | pathwayObj
  const [errorNotice, setErrorNotice] = useState<string | null>(null);

  const filteredPathways = pathways.filter((p: any) => {
    const matchesSearch =
      p.title?.toLowerCase().includes(search.toLowerCase()) ||
      p.slug?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleSavePathway = async (formData: any) => {
    setErrorNotice(null);
    try {
      if (editingPathway === "create") {
        await createPathway({
          baseUrl,
          body: {
            title: formData.title,
            slug: formData.slug,
            shortDescription: formData.shortDescription,
            description: formData.description,
            pricePaise: Math.round(Number(formData.priceRupees || 0) * 100),
          },
        }).unwrap();
      } else {
        await updatePathway({
          baseUrl,
          id: editingPathway.id,
          body: {
            title: formData.title,
            slug: formData.slug,
            shortDescription: formData.shortDescription,
            description: formData.description,
            pricePaise: Math.round(Number(formData.priceRupees || 0) * 100),
            status: formData.status,
            isActive: formData.isActive,
          },
        }).unwrap();
      }
      setEditingPathway(null);
    } catch (err: any) {
      setErrorNotice(err?.data?.error || err?.data?.message || "Failed to save pathway");
    }
  };

  const handleToggleActive = async (pathway: any) => {
    try {
      await updatePathway({
        baseUrl,
        id: pathway.id,
        body: { isActive: !pathway.isActive },
      }).unwrap();
    } catch (err: any) {
      alert("Failed to toggle status: " + (err?.data?.error || err.message));
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">
            Pathways Management
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium mt-1">
            Design, price, publish, and sequence multi-course educational pathways
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={refetch} icon={RefreshCw}>
            Refresh
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setEditingPathway("create")}
            icon={Plus}
          >
            Create Pathway
          </Button>
        </div>
      </div>

      {/* Toolbar & Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl shadow-xs">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Search pathways by title or slug..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-semibold text-zinc-700 dark:text-zinc-300 focus:outline-hidden"
          >
            <option value="ALL">All Statuses</option>
            <option value="PUBLISHED">PUBLISHED</option>
            <option value="DRAFT">DRAFT</option>
            <option value="ARCHIVED">ARCHIVED</option>
          </select>
        </div>
      </div>

      {/* Pathways Table */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/50 text-zinc-400 font-mono">
                <th className="py-3 px-4 font-semibold">Title & Slug</th>
                <th className="py-3 px-4 font-semibold">Pricing</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold">Active</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-zinc-400">
                    Loading pathways catalog...
                  </td>
                </tr>
              ) : filteredPathways.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-zinc-400">
                    No pathways found matching your filters.
                  </td>
                </tr>
              ) : (
                filteredPathways.map((p: any) => {
                  const priceRupees = (Number(p.pricePaise) || 0) / 100;
                  return (
                    <tr key={p.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/40">
                      <td className="py-3.5 px-4">
                        <div className="font-extrabold text-sm text-zinc-900 dark:text-zinc-100">
                          {p.title}
                        </div>
                        <div className="text-[11px] text-zinc-500 dark:text-zinc-400 font-mono mt-0.5">
                          /{p.slug} · ID: {p.id}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-black text-sm text-zinc-900 dark:text-zinc-100">
                        {priceRupees === 0 ? "Free" : `₹${priceRupees.toLocaleString("en-IN")}`}
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge
                          variant={
                            p.status === "PUBLISHED"
                              ? "emerald"
                              : p.status === "DRAFT"
                              ? "amber"
                              : "default"
                          }
                          size="sm"
                        >
                          {p.status}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => handleToggleActive(p)}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold transition-all ${
                            p.isActive
                              ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
                              : "bg-zinc-100 dark:bg-zinc-800 text-zinc-400 border border-zinc-200 dark:border-zinc-700"
                          }`}
                        >
                          {p.isActive ? "ENABLED" : "DISABLED"}
                        </button>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => setBuildingPathway(p)}
                            icon={Layers}
                            className="text-xs"
                          >
                            Courses & Tracks
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingPathway(p)}
                            icon={Edit2}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pathway Edit/Create Modal */}
      {editingPathway && (
        <PathwayFormModal
          pathway={editingPathway === "create" ? null : editingPathway}
          isLoading={isCreating || isUpdating}
          error={errorNotice}
          onClose={() => {
            setEditingPathway(null);
            setErrorNotice(null);
          }}
          onSave={handleSavePathway}
        />
      )}

      {/* Pathway Structure & Sequencing Modal */}
      {buildingPathway && (
        <PathwayBuilderModal
          pathway={buildingPathway}
          baseUrl={baseUrl}
          onClose={() => setBuildingPathway(null)}
        />
      )}
    </div>
  );
}

// ─── Pathway Form Modal Component ───────────────────────────────────────────
function PathwayFormModal({
  pathway,
  isLoading,
  error,
  onClose,
  onSave,
}: {
  pathway: any;
  isLoading: boolean;
  error: string | null;
  onClose: () => void;
  onSave: (data: any) => void;
}) {
  const [title, setTitle] = useState(pathway?.title || "");
  const [slug, setSlug] = useState(pathway?.slug || "");
  const [shortDescription, setShortDescription] = useState(pathway?.shortDescription || "");
  const [description, setDescription] = useState(pathway?.description || "");
  const [priceRupees, setPriceRupees] = useState(
    pathway ? ((Number(pathway.pricePaise) || 0) / 100).toString() : "0"
  );
  const [status, setStatus] = useState(pathway?.status || "DRAFT");
  const [isActive, setIsActive] = useState(pathway ? !!pathway.isActive : true);

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!pathway) {
      setSlug(
        val
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "")
      );
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      title,
      slug,
      shortDescription,
      description,
      priceRupees: Number(priceRupees) || 0,
      status,
      isActive,
    });
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={pathway ? `Edit Pathway: ${pathway.title}` : "Create New Pathway"}
      maxWidth="max-w-xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-400 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <Input
          label="Pathway Title"
          type="text"
          placeholder="e.g. AI & Machine Learning Engineering Pathway"
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          required
        />

        <Input
          label="URL Slug"
          type="text"
          placeholder="e.g. ai-ml-engineering-pathway"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          required
          helperText="Unique URL identifier for learner enrollment"
        />

        <div>
          <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
            Short Description
          </label>
          <textarea
            rows={2}
            value={shortDescription}
            onChange={(e) => setShortDescription(e.target.value)}
            placeholder="Brief 1-2 sentence overview for catalog cards..."
            className="w-full px-3.5 py-2.5 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
            Comprehensive Syllabus Description
          </label>
          <textarea
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Detailed learning objectives, prerequisites, and track breakdown..."
            className="w-full px-3.5 py-2.5 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Price (INR ₹)"
            type="number"
            min="0"
            step="1"
            value={priceRupees}
            onChange={(e) => setPriceRupees(e.target.value)}
            required
            helperText="Set 0 for free open access"
          />

          <div>
            <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
              Publication Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs sm:text-sm font-semibold text-zinc-900 dark:text-zinc-100 focus:outline-hidden"
            >
              <option value="DRAFT">DRAFT (Hidden)</option>
              <option value="PUBLISHED">PUBLISHED (Live in Catalog)</option>
              <option value="ARCHIVED">ARCHIVED (Disabled)</option>
            </select>
          </div>
        </div>

        <div className="pt-2 flex items-center justify-end gap-2 border-t border-zinc-100 dark:border-zinc-800">
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm" loading={isLoading}>
            {pathway ? "Save Changes" : "Create Pathway"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
