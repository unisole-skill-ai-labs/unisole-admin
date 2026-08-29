import React, { useState } from "react";
import {
  useGetCollegesQuery,
  useCreateCollegeMutation,
  useUpdateCollegeMutation,
  useGetBranchesQuery,
  useCreateBranchMutation,
  useUpdateBranchMutation,
  useGetCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
} from "../../store";
import {
  GraduationCap,
  BookOpen,
  Tag,
  Plus,
  Edit2,
  Search,
  RefreshCw,
  Building2,
  CheckCircle,
  Layers,
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
            Manage partner universities, academic branches/specializations, and domain curriculum categories
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-zinc-100 dark:bg-zinc-900 rounded-2xl w-fit border border-zinc-200/80 dark:border-zinc-800">
        <button
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "colleges"
              ? "bg-white dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 shadow-xs"
              : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
          }`}
          onClick={() => setActiveTab("colleges")}
        >
          <GraduationCap className="w-4 h-4" /> Partner Colleges
        </button>
        <button
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "branches"
              ? "bg-white dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 shadow-xs"
              : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
          }`}
          onClick={() => setActiveTab("branches")}
        >
          <BookOpen className="w-4 h-4" /> Academic Branches
        </button>
        <button
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "categories"
              ? "bg-white dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 shadow-xs"
              : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
          }`}
          onClick={() => setActiveTab("categories")}
        >
          <Tag className="w-4 h-4" /> Domain Categories
        </button>
      </div>

      <div>
        {activeTab === "colleges" && <CollegesSection baseUrl={baseUrl} />}
        {activeTab === "branches" && <BranchesSection baseUrl={baseUrl} />}
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
          <Button
            variant="primary"
            size="sm"
            onClick={() => setEditingCollege("create")}
            icon={Plus}
          >
            Add College
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="p-12 text-center text-xs text-zinc-400">Loading partner colleges...</div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl">
          <Building2 className="w-8 h-8 mx-auto text-zinc-400 mb-2" />
          <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">No colleges found</p>
          <p className="text-[11px] text-zinc-400 mt-0.5">Add partner universities to populate the dropdown lists.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((college: any) => (
            <div
              key={college.id}
              className="p-5 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl shadow-xs hover:border-indigo-500/40 transition-all flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs">
                      {college.shortName || college.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 line-clamp-1">
                        {college.name}
                      </h3>
                      <p className="text-[10px] text-zinc-400 font-mono">{college.slug}</p>
                    </div>
                  </div>
                  <Badge variant={college.isActive ? "emerald" : "default"}>
                    {college.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
                {college.description && (
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2">
                    {college.description}
                  </p>
                )}
              </div>

              <div className="pt-4 mt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs text-zinc-400">
                <span className="font-mono text-[10px]">ID: {college.id}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditingCollege(college)}
                  icon={Edit2}
                >
                  Edit
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

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

// ─── 2. BRANCHES SECTION ───────────────────────────────────────────────────────
function BranchesSection({ baseUrl }: { baseUrl: string }) {
  const { data: branches = [], isLoading, refetch } = useGetBranchesQuery(baseUrl);
  const [createBranch, { isLoading: isCreating }] = useCreateBranchMutation();
  const [updateBranch, { isLoading: isUpdating }] = useUpdateBranchMutation();

  const [search, setSearch] = useState("");
  const [editingBranch, setEditingBranch] = useState<any>(null);

  const filtered = branches.filter(
    (b: any) =>
      b.name?.toLowerCase().includes(search.toLowerCase()) ||
      b.code?.toLowerCase().includes(search.toLowerCase())
  );

  const handleSave = async (formData: any) => {
    if (editingBranch === "create") {
      await createBranch({ baseUrl, body: formData }).unwrap();
    } else {
      await updateBranch({ baseUrl, id: editingBranch.id, body: formData }).unwrap();
    }
    setEditingBranch(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl shadow-xs">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Search branches by name or code (e.g. CSE, IT, AIML)..."
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
            onClick={() => setEditingBranch("create")}
            icon={Plus}
          >
            Add Branch
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="p-12 text-center text-xs text-zinc-400">Loading academic branches...</div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl">
          <BookOpen className="w-8 h-8 mx-auto text-zinc-400 mb-2" />
          <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">No branches found</p>
          <p className="text-[11px] text-zinc-400 mt-0.5">Add academic branches to populate the learner registration dropdowns.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((branch: any) => (
            <div
              key={branch.id}
              className="p-5 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl shadow-xs hover:border-indigo-500/40 transition-all flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xs font-mono">
                      {branch.code || branch.name.slice(0, 3).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 line-clamp-1">
                        {branch.name}
                      </h3>
                      {branch.code && (
                        <span className="text-[10px] text-zinc-400 font-mono uppercase">Code: {branch.code}</span>
                      )}
                    </div>
                  </div>
                  <Badge variant={branch.isActive ? "emerald" : "default"}>
                    {branch.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
                {branch.description && (
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2">
                    {branch.description}
                  </p>
                )}
              </div>

              <div className="pt-4 mt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs text-zinc-400">
                <span className="font-mono text-[10px]">ID: {branch.id}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditingBranch(branch)}
                  icon={Edit2}
                >
                  Edit
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {editingBranch && (
        <BranchModal
          branch={editingBranch === "create" ? null : editingBranch}
          isLoading={isCreating || isUpdating}
          onClose={() => setEditingBranch(null)}
          onSave={handleSave}
        />
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
          <Button
            variant="primary"
            size="sm"
            onClick={() => setEditingCategory("create")}
            icon={Plus}
          >
            Add Category
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="p-12 text-center text-xs text-zinc-400">Loading domain categories...</div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl">
          <Layers className="w-8 h-8 mx-auto text-zinc-400 mb-2" />
          <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">No categories found</p>
          <p className="text-[11px] text-zinc-400 mt-0.5">Create domain categories to group your learning pathways.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((cat: any) => (
            <div
              key={cat.id}
              className="p-5 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl shadow-xs hover:border-indigo-500/40 transition-all flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 line-clamp-1">
                      {cat.name}
                    </h3>
                    <p className="text-[10px] text-zinc-400 font-mono">{cat.slug}</p>
                  </div>
                  <Badge variant={cat.isActive ? "emerald" : "default"}>
                    {cat.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
                {cat.description && (
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2">
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
    <Modal isOpen={true} onClose={onClose} title={college ? "Edit College Partner" : "Add College Partner"} maxWidth="max-w-lg">
      <form onSubmit={(e) => { e.preventDefault(); onSave({ name, slug, shortName: shortName || null, description: description || null, isActive }); }} className="space-y-4">
        <Input label="College / University Name" value={name} onChange={(e) => handleNameChange(e.target.value)} required placeholder="e.g. Delhi Technological University" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Slug Identifier" value={slug} onChange={(e) => setSlug(e.target.value)} required placeholder="e.g. dtu-delhi" />
          <Input label="Short Code / Acronym" value={shortName} onChange={(e) => setShortName(e.target.value)} placeholder="e.g. DTU" />
        </div>
        <div>
          <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">Description (Optional)</label>
          <textarea rows={2} value={description} onChange={(e) => setDescription(e.target.value)} className="w-full px-3.5 py-2 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs text-zinc-900 dark:text-zinc-100" placeholder="Campus notes, location, or department..." />
        </div>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="clg-active"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500"
          />
          <label htmlFor="clg-active" className="text-xs font-bold text-zinc-700 dark:text-zinc-300 cursor-pointer">
            Active and visible in registration dropdowns
          </label>
        </div>
        <div className="pt-2 flex justify-end gap-2 border-t border-zinc-100 dark:border-zinc-800">
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="primary" size="sm" loading={isLoading}>Save College</Button>
        </div>
      </form>
    </Modal>
  );
}

function BranchModal({ branch, isLoading, onClose, onSave }: any) {
  const [name, setName] = useState(branch?.name || "");
  const [code, setCode] = useState(branch?.code || "");
  const [description, setDescription] = useState(branch?.description || "");
  const [isActive, setIsActive] = useState(branch ? !!branch.isActive : true);

  return (
    <Modal isOpen={true} onClose={onClose} title={branch ? "Edit Academic Branch" : "Add Academic Branch"} maxWidth="max-w-lg">
      <form onSubmit={(e) => { e.preventDefault(); onSave({ name, code: code || null, description: description || null, isActive }); }} className="space-y-4">
        <Input label="Branch / Specialization Name" value={name} onChange={(e) => setName(e.target.value)} required placeholder="e.g. Computer Science & Engineering" />
        <Input label="Branch Code / Acronym" value={code} onChange={(e) => setCode(e.target.value)} placeholder="e.g. CSE, AIML, ECE" />
        <div>
          <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">Description (Optional)</label>
          <textarea rows={2} value={description} onChange={(e) => setDescription(e.target.value)} className="w-full px-3.5 py-2 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs text-zinc-900 dark:text-zinc-100" placeholder="Branch overview, department info..." />
        </div>
        <div className="flex items-center gap-2">
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
          <textarea rows={2} value={description} onChange={(e) => setDescription(e.target.value)} className="w-full px-3.5 py-2 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs text-zinc-900 dark:text-zinc-100" />
        </div>
        <div className="flex items-center gap-2">
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
