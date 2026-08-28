import React, { useState } from "react";
import {
  useGetCollegesQuery,
  useCreateCollegeMutation,
  useUpdateCollegeMutation,
  useGetCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
} from "../../store";
import {
  GraduationCap,
  Tag,
  Plus,
  Edit2,
  Search,
  X,
  RefreshCw,
  Building2,
  CheckCircle,
} from "lucide-react";
import Badge from "../ui/Badge";
import Button from "../ui/Button";
import Modal from "../ui/Modal";
import Input from "../ui/Input";

interface CollegesAndCategoriesProps {
  baseUrl: string;
}

export default function CollegesAndCategories({ baseUrl }: CollegesAndCategoriesProps) {
  const [activeTab, setActiveTab] = useState<"colleges" | "categories">("colleges");

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">
            Governance & Entity Metadata
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium mt-1">
            Manage partner universities, colleges, and domain curriculum categories
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-zinc-100 dark:bg-zinc-900 rounded-2xl w-fit border border-zinc-200/80 dark:border-zinc-800">
        <button
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === "colleges"
              ? "bg-white dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 shadow-sm"
              : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
          }`}
          onClick={() => setActiveTab("colleges")}
        >
          <GraduationCap className="w-4 h-4" /> Partner Colleges
        </button>
        <button
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === "categories"
              ? "bg-white dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 shadow-sm"
              : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
          }`}
          onClick={() => setActiveTab("categories")}
        >
          <Tag className="w-4 h-4" /> Domain Categories
        </button>
      </div>

      <div>
        {activeTab === "colleges" && <CollegesSection baseUrl={baseUrl} />}
        {activeTab === "categories" && <CategoriesSection baseUrl={baseUrl} />}
      </div>
    </div>
  );
}

// ─── 1. COLLEGES SECTION ───────────────────────────────────────────────────────
function CollegesSection({ baseUrl }: { baseUrl: string }) {
  const { data: colleges = [], isLoading, refetch } = useGetCollegesQuery(baseUrl);
  const [createCollege, { isLoading: isCreating }] = useCreateCollegeMutation();
  const [updateCollege, { isLoading: isUpdating }] = useUpdateCollegeMutation();

  const [search, setSearch] = useState("");
  const [editingCollege, setEditingCollege] = useState<any>(null);

  const filtered = colleges.filter(
    (c: any) =>
      c.name?.toLowerCase().includes(search.toLowerCase()) ||
      c.slug?.toLowerCase().includes(search.toLowerCase()) ||
      c.shortName?.toLowerCase().includes(search.toLowerCase())
  );

  const handleSave = async (formData: any) => {
    if (editingCollege === "create") {
      await createCollege({ baseUrl, body: formData }).unwrap();
    } else {
      await updateCollege({ baseUrl, id: editingCollege.id, body: formData }).unwrap();
    }
    setEditingCollege(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl shadow-xs">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Search colleges by name or code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-hidden"
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button variant="secondary" size="sm" onClick={refetch} icon={RefreshCw}>
            Refresh
          </Button>
          <Button variant="primary" size="sm" onClick={() => setEditingCollege("create")} icon={Plus}>
            Add College
          </Button>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/50 text-zinc-400 font-mono">
                <th className="py-3 px-4 font-semibold">College Name & Code</th>
                <th className="py-3 px-4 font-semibold">Slug Identifier</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
              {isLoading ? (
                <tr><td colSpan={4} className="py-8 text-center text-zinc-400">Loading colleges...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={4} className="py-8 text-center text-zinc-400">No partner colleges found.</td></tr>
              ) : (
                filtered.map((c: any) => (
                  <tr key={c.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/40">
                    <td className="py-3.5 px-4">
                      <div className="font-extrabold text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-indigo-500" />
                        <span>{c.name}</span>
                        {c.shortName && (
                          <Badge variant="brand" size="sm">
                            {c.shortName}
                          </Badge>
                        )}
                      </div>
                      <div className="text-[11px] text-zinc-400 font-mono mt-0.5">ID: {c.id}</div>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-semibold text-zinc-600 dark:text-zinc-400">
                      /{c.slug}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`text-[10px] font-bold ${c.isActive ? "text-emerald-500" : "text-zinc-400"}`}>
                        {c.isActive ? "ACTIVE" : "INACTIVE"}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Button variant="ghost" size="sm" onClick={() => setEditingCollege(c)} icon={Edit2} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {editingCollege && (
        <CollegeModal
          college={editingCollege === "create" ? null : editingCollege}
          isLoading={isCreating || isUpdating}
          onClose={() => setEditingCollege(null)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}

// ─── 2. CATEGORIES SECTION ────────────────────────────────────────────────────
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
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl shadow-xs">
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
          <Button variant="primary" size="sm" onClick={() => setEditingCategory("create")} icon={Plus}>
            Add Category
          </Button>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/50 text-zinc-400 font-mono">
                <th className="py-3 px-4 font-semibold">Category Name</th>
                <th className="py-3 px-4 font-semibold">Slug Identifier</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
              {isLoading ? (
                <tr><td colSpan={4} className="py-8 text-center text-zinc-400">Loading categories...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={4} className="py-8 text-center text-zinc-400">No domain categories found.</td></tr>
              ) : (
                filtered.map((c: any) => (
                  <tr key={c.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/40">
                    <td className="py-3.5 px-4">
                      <div className="font-extrabold text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                        <Tag className="w-3.5 h-3.5 text-indigo-500" />
                        <span>{c.name}</span>
                      </div>
                      <div className="text-[11px] text-zinc-400 font-mono mt-0.5">ID: {c.id}</div>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-semibold text-zinc-600 dark:text-zinc-400">
                      /{c.slug}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`text-[10px] font-bold ${c.isActive ? "text-emerald-500" : "text-zinc-400"}`}>
                        {c.isActive ? "ACTIVE" : "INACTIVE"}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Button variant="ghost" size="sm" onClick={() => setEditingCategory(c)} icon={Edit2} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

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

function CollegeModal({ college, isLoading, onClose, onSave }: any) {
  const [name, setName] = useState(college?.name || "");
  const [slug, setSlug] = useState(college?.slug || "");
  const [shortName, setShortName] = useState(college?.shortName || "");
  const [logoUrl, setLogoUrl] = useState(college?.logoUrl || "");
  const [isActive, setIsActive] = useState(college ? !!college.isActive : true);

  const handleNameChange = (val: string) => {
    setName(val);
    if (!college) setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""));
  };

  return (
    <Modal isOpen={true} onClose={onClose} title={college ? "Edit College Partner" : "Add College Partner"} maxWidth="max-w-lg">
      <form onSubmit={(e) => { e.preventDefault(); onSave({ name, slug, shortName: shortName || null, logoUrl: logoUrl || null, isActive }); }} className="space-y-4">
        <Input label="College / University Name" value={name} onChange={(e) => handleNameChange(e.target.value)} required />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Slug Identifier" value={slug} onChange={(e) => setSlug(e.target.value)} required />
          <Input label="Short Code / Acronym" value={shortName} onChange={(e) => setShortName(e.target.value)} placeholder="e.g. IITD" />
        </div>
        <Input label="Logo Image URL (Optional)" value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} placeholder="https://..." />
        <div className="pt-2 flex justify-end gap-2 border-t border-zinc-100 dark:border-zinc-800">
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="primary" size="sm" loading={isLoading}>Save College</Button>
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
          <textarea rows={2} value={description} onChange={(e) => setDescription(e.target.value)} className="w-full px-3.5 py-2 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs" />
        </div>
        <div className="pt-2 flex justify-end gap-2 border-t border-zinc-100 dark:border-zinc-800">
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="primary" size="sm" loading={isLoading}>Save Category</Button>
        </div>
      </form>
    </Modal>
  );
}
