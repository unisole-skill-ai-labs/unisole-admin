import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  useGetCollegesQuery,
  useCreateCollegeMutation,
  useUpdateCollegeMutation,
  useDeleteCollegeMutation,
  useGetBranchesQuery,
  useCreateBranchMutation,
  useUpdateBranchMutation,
  useDeleteBranchMutation,
  useGetCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useGetPresentationsQuery,
  useGetSessionsQuery,
} from "../../store";
import {
  GraduationCap,
  BookOpen,
  Tag,
  Plus,
  Edit2,
  Trash2,
  Search,
  RefreshCw,
  Building2,
  CheckCircle,
  Layers,
  Sparkles,
  ExternalLink,
  ChevronRight,
  ShieldAlert,
  AlertTriangle,
  Play,
  Users,
} from "lucide-react";
import Badge from "../ui/Badge";
import Button from "../ui/Button";
import Modal from "../ui/Modal";
import Input from "../ui/Input";

interface CollegesAndCategoriesProps {
  baseUrl: string;
}

export default function CollegesAndCategories({ baseUrl }: CollegesAndCategoriesProps) {
  const [activeTab, setActiveTab] = useState<"colleges" | "branches" | "categories">("colleges");

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">
            Governance & Entity Metadata
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium mt-1">
            Manage partner universities, academic branches & departments, and domain pathway categories.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-2">
        <button
          onClick={() => setActiveTab("colleges")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "colleges"
              ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-sm"
              : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900"
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Partner Universities & Colleges</span>
        </button>

        <button
          onClick={() => setActiveTab("branches")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "branches"
              ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-sm"
              : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900"
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Academic Branches</span>
        </button>

        <button
          onClick={() => setActiveTab("categories")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "categories"
              ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-sm"
              : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900"
          }`}
        >
          <Tag className="w-4 h-4" />
          <span>Domain Categories</span>
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "colleges" && <CollegesSection baseUrl={baseUrl} />}
      {activeTab === "branches" && <BranchesSection baseUrl={baseUrl} />}
      {activeTab === "categories" && <CategoriesSection baseUrl={baseUrl} />}
    </div>
  );
}

// ─── 1. COLLEGES SECTION ───────────────────────────────────────────────────────
function CollegesSection({ baseUrl }: { baseUrl: string }) {
  const { data: colleges = [], isLoading, refetch } = useGetCollegesQuery(baseUrl);
  const { data: branches = [] } = useGetBranchesQuery(baseUrl);
  const { data: presRes } = useGetPresentationsQuery(baseUrl);
  const { data: sessRes } = useGetSessionsQuery({ baseUrl });

  const presentations = presRes?.data || [];
  const sessions = sessRes?.data || [];

  const [createCollege, { isLoading: isCreating }] = useCreateCollegeMutation();
  const [updateCollege, { isLoading: isUpdating }] = useUpdateCollegeMutation();
  const [deleteCollege, { isLoading: isDeleting }] = useDeleteCollegeMutation();

  const [search, setSearch] = useState("");
  const [editingCollege, setEditingCollege] = useState<any>(null);
  const [deletingCollege, setDeletingCollege] = useState<any>(null);

  const filtered = colleges.filter(
    (c: any) =>
      c.name?.toLowerCase().includes(search.toLowerCase()) ||
      c.shortName?.toLowerCase().includes(search.toLowerCase()) ||
      c.slug?.toLowerCase().includes(search.toLowerCase())
  );

  const handleSave = async (formData: any) => {
    if (editingCollege === "create") {
      await createCollege({ baseUrl, body: formData }).unwrap();
    } else {
      await updateCollege({ baseUrl, id: editingCollege.id, body: formData }).unwrap();
    }
    setEditingCollege(null);
  };

  const handleDelete = async () => {
    if (!deletingCollege) return;
    try {
      await deleteCollege({ baseUrl, id: deletingCollege.id }).unwrap();
      setDeletingCollege(null);
    } catch (err: any) {
      alert("Failed to delete college: " + (err?.data?.message || err.message));
    }
  };

  return (
    <div className="space-y-4">
      {/* Top action toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl shadow-xs">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Search universities by name, short code, or slug..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-hidden focus:border-indigo-500"
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button variant="secondary" size="sm" onClick={refetch} icon={RefreshCw}>
            Refresh
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setEditingCollege("create")}
            icon={Plus}
          >
            Add University Partner
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="p-16 text-center text-xs text-zinc-400 flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 rounded-full border-3 border-indigo-500/20 border-t-indigo-600 animate-spin" />
          <span>Loading partner universities...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-16 text-center bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-3xl space-y-3">
          <Building2 className="w-10 h-10 mx-auto text-zinc-400" />
          <p className="text-sm font-bold text-zinc-700 dark:text-zinc-300">No universities found</p>
          <p className="text-xs text-zinc-400 max-w-sm mx-auto">
            {search ? "No matching universities found for your search query." : "Add partner universities to start hosting campus sessions."}
          </p>
          <Button variant="primary" size="sm" onClick={() => setEditingCollege("create")} icon={Plus}>
            Add First University Partner
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((college: any) => {
            const collegeBranches = branches.filter((b: any) => b.collegeId === college.id);
            const collegeDecks = presentations.filter((p: any) => p.collegeId === college.id);
            const collegeSessions = sessions.filter(
              (s: any) => s.collegeId === college.id || s.collegeName === college.name
            );

            return (
              <div
                key={college.id}
                className="p-5 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-3xl shadow-xs hover:border-indigo-500/50 transition-all flex flex-col justify-between group"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white flex items-center justify-center font-black text-sm shadow-sm">
                        {college.shortName || college.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 line-clamp-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                          {college.name}
                        </h3>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] text-zinc-400 font-mono">{college.slug}</span>
                          <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
                            {college.shortName || "CAMPUS"}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Badge variant={college.isActive ? "emerald" : "default"}>
                      {college.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>

                  {college.description && (
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                      {college.description}
                    </p>
                  )}

                  {/* College Stats Pills */}
                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800/80">
                    <div className="p-2 rounded-xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-100 dark:border-zinc-800/60 text-center">
                      <span className="text-[10px] text-zinc-400 block font-semibold">Branches</span>
                      <span className="text-xs font-black text-zinc-800 dark:text-zinc-200 font-mono">
                        {collegeBranches.length}
                      </span>
                    </div>
                    <div className="p-2 rounded-xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-100 dark:border-zinc-800/60 text-center">
                      <span className="text-[10px] text-zinc-400 block font-semibold">Pitch Decks</span>
                      <span className="text-xs font-black text-indigo-600 dark:text-indigo-400 font-mono">
                        {collegeDecks.length}
                      </span>
                    </div>
                    <div className="p-2 rounded-xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-100 dark:border-zinc-800/60 text-center">
                      <span className="text-[10px] text-zinc-400 block font-semibold">Sessions</span>
                      <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 font-mono">
                        {collegeSessions.length}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between gap-2 text-xs">
                  <Link to={`/colleges/${college.id}`} className="flex-1">
                    <Button
                      variant="primary"
                      size="sm"
                      icon={Sparkles}
                      className="w-full justify-center text-xs font-bold"
                    >
                      Campus Hub
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingCollege(college)}
                    icon={Edit2}
                    className="p-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
                    title="Edit University"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDeletingCollege(college)}
                    icon={Trash2}
                    className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                    title="Delete University"
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit College Modal */}
      {editingCollege && (
        <CollegeModal
          college={editingCollege === "create" ? null : editingCollege}
          isLoading={isCreating || isUpdating}
          onClose={() => setEditingCollege(null)}
          onSave={handleSave}
        />
      )}

      {/* Delete College Confirmation Modal */}
      {deletingCollege && (
        <Modal
          isOpen={true}
          onClose={() => setDeletingCollege(null)}
          title="Delete University Partner"
          maxWidth="max-w-md"
        >
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              <div className="text-xs text-rose-700 dark:text-rose-300 leading-relaxed">
                <p className="font-bold mb-1">Destructive Action Alert</p>
                Are you sure you want to delete <span className="font-bold underline">{deletingCollege.name}</span>?
                This will automatically remove all associated branches, pitch decks, and roadshows under this college.
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2 border-t border-zinc-100 dark:border-zinc-800">
              <Button type="button" variant="ghost" size="sm" onClick={() => setDeletingCollege(null)}>
                Cancel
              </Button>
              <Button
                type="button"
                variant="danger"
                size="sm"
                loading={isDeleting}
                onClick={handleDelete}
                icon={Trash2}
              >
                Confirm Delete
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── 2. BRANCHES SECTION ───────────────────────────────────────────────────────
function BranchesSection({ baseUrl }: { baseUrl: string }) {
  const { data: colleges = [] } = useGetCollegesQuery(baseUrl);
  const [selectedCollegeFilter, setSelectedCollegeFilter] = useState<string>("ALL");
  const { data: branches = [], isLoading, refetch } = useGetBranchesQuery(
    selectedCollegeFilter !== "ALL" ? { baseUrl, collegeId: selectedCollegeFilter } : baseUrl
  );

  const [createBranch, { isLoading: isCreating }] = useCreateBranchMutation();
  const [updateBranch, { isLoading: isUpdating }] = useUpdateBranchMutation();
  const [deleteBranch, { isLoading: isDeleting }] = useDeleteBranchMutation();

  const [search, setSearch] = useState("");
  const [editingBranch, setEditingBranch] = useState<any>(null);
  const [deletingBranch, setDeletingBranch] = useState<any>(null);

  const collegeMap = new Map<string, string>(colleges.map((c: any) => [c.id, c.name]));

  const filtered = branches.filter((b: any) => {
    const matchesSearch =
      b.name?.toLowerCase().includes(search.toLowerCase()) ||
      b.code?.toLowerCase().includes(search.toLowerCase());
    const matchesCollege =
      selectedCollegeFilter === "ALL" || b.collegeId === selectedCollegeFilter;
    return matchesSearch && matchesCollege;
  });

  const handleSave = async (formData: any) => {
    if (editingBranch === "create") {
      await createBranch({ baseUrl, body: formData }).unwrap();
    } else {
      await updateBranch({ baseUrl, id: editingBranch.id, body: formData }).unwrap();
    }
    setEditingBranch(null);
  };

  const handleDelete = async () => {
    if (!deletingBranch) return;
    try {
      await deleteBranch({ baseUrl, id: deletingBranch.id }).unwrap();
      setDeletingBranch(null);
    } catch (err: any) {
      alert("Failed to delete branch: " + (err?.data?.message || err.message));
    }
  };

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl shadow-xs">
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:max-w-2xl">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Search branches by name or code..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-hidden"
            />
          </div>

          <select
            value={selectedCollegeFilter}
            onChange={(e) => setSelectedCollegeFilter(e.target.value)}
            className="w-full sm:w-auto px-3.5 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs text-zinc-800 dark:text-zinc-200 font-bold focus:outline-hidden"
          >
            <option value="ALL">All Partner Universities</option>
            {colleges.map((c: any) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.shortName || "CAMPUS"})
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button variant="secondary" size="sm" onClick={refetch} icon={RefreshCw}>
            Refresh
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setEditingBranch("create")}
            icon={Plus}
          >
            Add Branch
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="p-16 text-center text-xs text-zinc-400 flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 rounded-full border-3 border-emerald-500/20 border-t-emerald-600 animate-spin" />
          <span>Loading academic branches...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-16 text-center bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-3xl space-y-3">
          <BookOpen className="w-10 h-10 mx-auto text-zinc-400" />
          <p className="text-sm font-bold text-zinc-700 dark:text-zinc-300">No branches found</p>
          <p className="text-xs text-zinc-400 max-w-sm mx-auto">
            {search ? "No branches matching your filter criteria." : "Add college-specific branches to map student leads and intake accurately."}
          </p>
          <Button variant="primary" size="sm" onClick={() => setEditingBranch("create")} icon={Plus}>
            Add First Academic Branch
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((branch: any) => {
            const collegeName = collegeMap.get(branch.collegeId) || "Open / Unassigned College";

            return (
              <div
                key={branch.id}
                className="p-5 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-3xl shadow-xs hover:border-emerald-500/50 transition-all flex flex-col justify-between group"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-black text-xs font-mono shadow-xs">
                        {branch.code || branch.name.slice(0, 3).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 line-clamp-1 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                          {branch.name}
                        </h3>
                        <div className="flex items-center gap-2 mt-0.5">
                          {branch.code && (
                            <span className="text-[10px] text-zinc-400 font-mono uppercase">
                              Code: {branch.code}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <Badge variant={branch.isActive ? "emerald" : "default"}>
                      {branch.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>

                  {/* Associated College Tag */}
                  <div className="p-2.5 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800/80 flex items-center gap-2">
                    <Building2 className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                    <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300 truncate">
                      {collegeName}
                    </span>
                  </div>

                  {branch.description && (
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                      {branch.description}
                    </p>
                  )}
                </div>

                <div className="pt-4 mt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs text-zinc-400">
                  <span className="font-mono text-[10px]">ID: {branch.id}</span>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingBranch(branch)}
                      icon={Edit2}
                      className="p-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
                      title="Edit Branch"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeletingBranch(branch)}
                      icon={Trash2}
                      className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                      title="Delete Branch"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Branch Modal */}
      {editingBranch && (
        <BranchModal
          branch={editingBranch === "create" ? null : editingBranch}
          colleges={colleges}
          isLoading={isCreating || isUpdating}
          onClose={() => setEditingBranch(null)}
          onSave={handleSave}
        />
      )}

      {/* Delete Branch Confirmation Modal */}
      {deletingBranch && (
        <Modal
          isOpen={true}
          onClose={() => setDeletingBranch(null)}
          title="Delete Academic Branch"
          maxWidth="max-w-md"
        >
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              <div className="text-xs text-rose-700 dark:text-rose-300 leading-relaxed">
                <p className="font-bold mb-1">Confirm Branch Deletion</p>
                Are you sure you want to delete branch <span className="font-bold underline">{deletingBranch.name}</span>?
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2 border-t border-zinc-100 dark:border-zinc-800">
              <Button type="button" variant="ghost" size="sm" onClick={() => setDeletingBranch(null)}>
                Cancel
              </Button>
              <Button
                type="button"
                variant="danger"
                size="sm"
                loading={isDeleting}
                onClick={handleDelete}
                icon={Trash2}
              >
                Confirm Delete
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── 3. CATEGORIES SECTION ─────────────────────────────────────────────────────
function CategoriesSection({ baseUrl }: { baseUrl: string }) {
  const { data: categories = [], isLoading, refetch } = useGetCategoriesQuery(baseUrl);
  const [createCategory, { isLoading: isCreating }] = useCreateCategoryMutation();
  const [updateCategory, { isLoading: isUpdating }] = useUpdateCategoryMutation();

  const [search, setSearch] = useState("");
  const [editingCategory, setEditingCategory] = useState<any>(null);

  const filtered = categories.filter(
    (c: any) =>
      c.name?.toLowerCase().includes(search.toLowerCase()) ||
      c.slug?.toLowerCase().includes(search.toLowerCase())
  );

  const handleSave = async (formData: any) => {
    if (editingCategory === "create") {
      await createCategory({ baseUrl, body: formData }).unwrap();
    } else {
      await updateCategory({ baseUrl, id: editingCategory.id, body: formData }).unwrap();
    }
    setEditingCategory(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl shadow-xs">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Search domain categories..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-hidden"
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button variant="secondary" size="sm" onClick={refetch} icon={RefreshCw}>
            Refresh
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setEditingCategory("create")}
            icon={Plus}
          >
            Add Domain Category
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="p-16 text-center text-xs text-zinc-400 flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 rounded-full border-3 border-indigo-500/20 border-t-indigo-600 animate-spin" />
          <span>Loading domain categories...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-16 text-center bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-3xl space-y-3">
          <Layers className="w-10 h-10 mx-auto text-zinc-400" />
          <p className="text-sm font-bold text-zinc-700 dark:text-zinc-300">No categories found</p>
          <p className="text-xs text-zinc-400 max-w-sm mx-auto">Create domain categories to group your learning pathways.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((cat: any) => (
            <div
              key={cat.id}
              className="p-5 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-3xl shadow-xs hover:border-indigo-500/50 transition-all flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 line-clamp-1">
                      {cat.name}
                    </h3>
                    <p className="text-[10px] text-zinc-400 font-mono mt-0.5">{cat.slug}</p>
                  </div>
                  <Badge variant={cat.isActive ? "emerald" : "default"}>
                    {cat.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
                {cat.description && (
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                    {cat.description}
                  </p>
                )}
              </div>

              <div className="pt-4 mt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs text-zinc-400">
                <span className="font-mono text-[10px]">ID: {cat.id}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditingCategory(cat)}
                  icon={Edit2}
                >
                  Edit
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {editingCategory && (
        <CategoryModal
          category={editingCategory === "create" ? null : editingCategory}
          isLoading={isCreating || isUpdating}
          onClose={() => setEditingCategory(null)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}

// ─── MODALS ───────────────────────────────────────────────────────────────────

function CollegeModal({ college, isLoading, onClose, onSave }: any) {
  const [name, setName] = useState(college?.name || "");
  const [slug, setSlug] = useState(college?.slug || "");
  const [shortName, setShortName] = useState(college?.shortName || "");
  const [description, setDescription] = useState(college?.description || "");
  const [isActive, setIsActive] = useState(college ? !!college.isActive : true);

  const handleNameChange = (val: string) => {
    setName(val);
    if (!college) setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""));
  };

  return (
    <Modal isOpen={true} onClose={onClose} title={college ? "Edit College Partner" : "Add University Partner"} maxWidth="max-w-lg">
      <form onSubmit={(e) => { e.preventDefault(); onSave({ name, slug, shortName: shortName || null, description: description || null, isActive }); }} className="space-y-4">
        <Input label="College / University Name" value={name} onChange={(e) => handleNameChange(e.target.value)} required placeholder="e.g. Indian Institute of Technology Delhi" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Slug Identifier" value={slug} onChange={(e) => setSlug(e.target.value)} required placeholder="e.g. iit-delhi" />
          <Input label="Short Code / Acronym" value={shortName} onChange={(e) => setShortName(e.target.value)} placeholder="e.g. IIT Delhi" />
        </div>
        <div>
          <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">Description (Optional)</label>
          <textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} className="w-full px-3.5 py-2.5 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-xs text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:border-indigo-500" placeholder="Campus notes, location, or department..." />
        </div>
        <div className="flex items-center gap-2 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800">
          <input
            type="checkbox"
            id="clg-active"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500"
          />
          <label htmlFor="clg-active" className="text-xs font-bold text-zinc-700 dark:text-zinc-300 cursor-pointer">
            Active and visible in live registration dropdowns
          </label>
        </div>
        <div className="pt-2 flex justify-end gap-2 border-t border-zinc-100 dark:border-zinc-800">
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="primary" size="sm" loading={isLoading}>Save University</Button>
        </div>
      </form>
    </Modal>
  );
}

function BranchModal({ branch, colleges = [], isLoading, onClose, onSave }: any) {
  const [name, setName] = useState(branch?.name || "");
  const [code, setCode] = useState(branch?.code || "");
  const [collegeId, setCollegeId] = useState(branch?.collegeId || colleges[0]?.id || "");
  const [description, setDescription] = useState(branch?.description || "");
  const [isActive, setIsActive] = useState(branch ? !!branch.isActive : true);

  return (
    <Modal isOpen={true} onClose={onClose} title={branch ? "Edit Academic Branch" : "Add Academic Branch"} maxWidth="max-w-lg">
      <form onSubmit={(e) => { e.preventDefault(); onSave({ name, code: code || null, collegeId, description: description || null, isActive }); }} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
            Partner University / College <span className="text-rose-500">*</span>
          </label>
          <select
            value={collegeId}
            onChange={(e) => setCollegeId(e.target.value)}
            required
            className="w-full px-3.5 py-2.5 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-xs font-bold text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:border-indigo-500"
          >
            {colleges.map((c: any) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.shortName || "CAMPUS"})
              </option>
            ))}
          </select>
        </div>

        <Input label="Branch / Specialization Name" value={name} onChange={(e) => setName(e.target.value)} required placeholder="e.g. Computer Science & Engineering" />
        <Input label="Branch Code / Acronym" value={code} onChange={(e) => setCode(e.target.value)} placeholder="e.g. CSE, AIML, ECE" />
        <div>
          <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">Description (Optional)</label>
          <textarea rows={2} value={description} onChange={(e) => setDescription(e.target.value)} className="w-full px-3.5 py-2 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-xs text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:border-indigo-500" placeholder="Branch overview, department info..." />
        </div>
        <div className="flex items-center gap-2 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800">
          <input
            type="checkbox"
            id="brn-active"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500"
          />
          <label htmlFor="brn-active" className="text-xs font-bold text-zinc-700 dark:text-zinc-300 cursor-pointer">
            Active and visible in registration dropdowns
          </label>
        </div>
        <div className="pt-2 flex justify-end gap-2 border-t border-zinc-100 dark:border-zinc-800">
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="primary" size="sm" loading={isLoading}>Save Branch</Button>
        </div>
      </form>
    </Modal>
  );
}

function CategoryModal({ category, isLoading, onClose, onSave }: any) {
  const [name, setName] = useState(category?.name || "");
  const [slug, setSlug] = useState(category?.slug || "");
  const [description, setDescription] = useState(category?.description || "");
  const [isActive, setIsActive] = useState(category ? !!category.isActive : true);

  const handleNameChange = (val: string) => {
    setName(val);
    if (!category) setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""));
  };

  return (
    <Modal isOpen={true} onClose={onClose} title={category ? "Edit Category" : "Add Domain Category"} maxWidth="max-w-lg">
      <form onSubmit={(e) => { e.preventDefault(); onSave({ name, slug, description: description || null, isActive }); }} className="space-y-4">
        <Input label="Category Name" value={name} onChange={(e) => handleNameChange(e.target.value)} required />
        <Input label="Slug Identifier" value={slug} onChange={(e) => setSlug(e.target.value)} required />
        <div>
          <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">Description</label>
          <textarea rows={2} value={description} onChange={(e) => setDescription(e.target.value)} className="w-full px-3.5 py-2 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-xs text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:border-indigo-500" />
        </div>
        <div className="flex items-center gap-2 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800">
          <input
            type="checkbox"
            id="cat-active"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500"
          />
          <label htmlFor="cat-active" className="text-xs font-bold text-zinc-700 dark:text-zinc-300 cursor-pointer">
            Active
          </label>
        </div>
        <div className="pt-2 flex justify-end gap-2 border-t border-zinc-100 dark:border-zinc-800">
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="primary" size="sm" loading={isLoading}>Save Category</Button>
        </div>
      </form>
    </Modal>
  );
}
