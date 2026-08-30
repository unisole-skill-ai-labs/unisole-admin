import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  useGetCollegesQuery,
  useCreateCollegeMutation,
  useUpdateCollegeMutation,
  useDeleteCollegeMutation,
} from "../../store";
import {
  GraduationCap,
  Plus,
  Trash2,
  Edit2,
  Search,
  Building2,
  Users,
  GitBranch,
  ArrowRight,
  Sparkles,
  AlertTriangle,
  Layers,
} from "lucide-react";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import Modal from "../../components/ui/Modal";
import Input from "../../components/ui/Input";

export default function CollegesPage() {
  const baseUrl = useSelector((s: any) => s.settings.baseUrl);
  const navigate = useNavigate();

  const { data: colleges = [], isLoading, refetch } = useGetCollegesQuery(baseUrl);
  const [createCollege, { isLoading: isCreating }] = useCreateCollegeMutation();
  const [updateCollege, { isLoading: isUpdating }] = useUpdateCollegeMutation();
  const [deleteCollege, { isLoading: isDeleting }] = useDeleteCollegeMutation();

  // Search & Filter
  const [search, setSearch] = useState("");

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingCollege, setEditingCollege] = useState<any>(null);
  const [deletingCollege, setDeletingCollege] = useState<any>(null);

  // Create/Edit form state
  const [name, setName] = useState("");
  const [shortName, setShortName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [formError, setFormError] = useState("");

  // Quick Stats
  const totalBranches = useMemo(() => {
    return colleges.reduce((acc: number, c: any) => acc + (c.branchesCount || 0), 0);
  }, [colleges]);

  const totalStudents = useMemo(() => {
    return colleges.reduce((acc: number, c: any) => acc + (c.studentsCount || 0), 0);
  }, [colleges]);

  const filteredColleges = useMemo(() => {
    if (!search.trim()) return colleges;
    const q = search.toLowerCase();
    return colleges.filter(
      (c: any) =>
        c.name?.toLowerCase().includes(q) ||
        c.shortName?.toLowerCase().includes(q) ||
        c.slug?.toLowerCase().includes(q) ||
        c.description?.toLowerCase().includes(q)
    );
  }, [colleges, search]);

  const handleOpenCreate = () => {
    setName("");
    setShortName("");
    setSlug("");
    setDescription("");
    setFormError("");
    setIsCreateOpen(true);
  };

  const handleOpenEdit = (college: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingCollege(college);
    setName(college.name || "");
    setShortName(college.shortName || "");
    setSlug(college.slug || "");
    setDescription(college.description || "");
    setFormError("");
  };

  const handleNameChange = (val: string) => {
    setName(val);
    if (!editingCollege) {
      const generated = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      setSlug(generated);
    }
  };

  const handleSaveCollege = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!name.trim()) {
      setFormError("University/College name is required.");
      return;
    }
    if (!slug.trim()) {
      setFormError("Slug identifier is required.");
      return;
    }

    try {
      if (editingCollege) {
        await updateCollege({
          baseUrl,
          id: editingCollege.id,
          body: {
            name: name.trim(),
            shortName: shortName.trim() || undefined,
            slug: slug.trim(),
            description: description.trim() || undefined,
          },
        }).unwrap();
        setEditingCollege(null);
      } else {
        await createCollege({
          baseUrl,
          body: {
            name: name.trim(),
            shortName: shortName.trim() || undefined,
            slug: slug.trim(),
            description: description.trim() || undefined,
          },
        }).unwrap();
        setIsCreateOpen(false);
      }
      refetch();
    } catch (err: any) {
      setFormError(err?.data?.error || err?.message || "Failed to save college. Please try again.");
    }
  };

  const handleDeleteCollege = async () => {
    if (!deletingCollege) return;
    try {
      await deleteCollege({ baseUrl, id: deletingCollege.id }).unwrap();
      setDeletingCollege(null);
      refetch();
    } catch (err: any) {
      alert(err?.data?.error || "Failed to delete college");
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto pb-12">
      {/* Top Banner & Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-1">
            <GraduationCap className="w-4 h-4" />
            <span>Academic Ecosystem</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">
            Partner Universities & Colleges
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Manage partner institutions, academic branches, and enrolled student cohorts.
          </p>
        </div>

        <Button
          onClick={handleOpenCreate}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2.5 rounded-xl shadow-sm self-start md:self-auto flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Partner College</span>
        </Button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 p-4 rounded-2xl shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Partner Institutions</span>
            <p className="text-2xl font-black text-zinc-900 dark:text-zinc-100">{colleges.length}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 p-4 rounded-2xl shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
            <GitBranch className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Academic Branches</span>
            <p className="text-2xl font-black text-zinc-900 dark:text-zinc-100">{totalBranches}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 p-4 rounded-2xl shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Enrolled Students</span>
            <p className="text-2xl font-black text-zinc-900 dark:text-zinc-100">{totalStudents}</p>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-3 bg-white dark:bg-zinc-900 p-2 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 shadow-xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search colleges by name, short code, or location..."
            className="w-full bg-transparent pl-10 pr-4 py-2 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none"
          />
        </div>
        {search && (
          <button
            onClick={() => setSearch("")}
            className="text-xs font-semibold text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 px-2 py-1"
          >
            Clear
          </button>
        )}
      </div>

      {/* College List */}
      {isLoading ? (
        <div className="p-12 text-center text-zinc-400">
          <div className="inline-block w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mb-2" />
          <p className="text-xs font-semibold">Loading partner institutions...</p>
        </div>
      ) : filteredColleges.length === 0 ? (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-3xl p-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-400 flex items-center justify-center mx-auto">
            <Building2 className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              {search ? "No matching colleges found" : "No partner colleges yet"}
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-sm mx-auto">
              {search
                ? `No universities match "${search}". Try adjusting your search query.`
                : "Add your first partnering university to start managing branches and students."}
            </p>
          </div>
          {!search && (
            <Button
              onClick={handleOpenCreate}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2 rounded-xl text-xs"
            >
              <Plus className="w-4 h-4 mr-1.5" /> Add Partner College
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredColleges.map((college: any) => (
            <div
              key={college.id}
              onClick={() => navigate(`/colleges/${college.id}`)}
              className="group bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 hover:border-indigo-500/50 dark:hover:border-indigo-500/50 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
            >
              <div>
                {/* Card Top */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-black text-sm flex items-center justify-center border border-indigo-100 dark:border-indigo-900/40">
                      {(college.shortName || college.name || "U").substring(0, 3).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-zinc-900 dark:text-zinc-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-1">
                        {college.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        {college.shortName && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
                            {college.shortName}
                          </span>
                        )}
                        <span className="text-[10px] font-mono text-zinc-400">
                          {college.slug}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Description */}
                {college.description && (
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 mb-4 leading-relaxed">
                    {college.description}
                  </p>
                )}
              </div>

              {/* Card Bottom / Footer */}
              <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between gap-2 mt-2">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                    <GitBranch className="w-3 h-3 text-indigo-500" />
                    {college.branchesCount || 0} Branches
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                    <Users className="w-3 h-3 text-emerald-500" />
                    {college.studentsCount || 0} Students
                  </span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1">
                  <button
                    title="Edit College Info"
                    onClick={(e) => handleOpenEdit(college, e)}
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    title="Delete College"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeletingCollege(college);
                    }}
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <div className="p-1.5 text-zinc-300 dark:text-zinc-600 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-transform group-hover:translate-x-0.5">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Create/Edit College */}
      <Modal
        isOpen={isCreateOpen || !!editingCollege}
        onClose={() => {
          setIsCreateOpen(false);
          setEditingCollege(null);
        }}
        title={editingCollege ? "Edit Partner University" : "Add Partner University"}
      >
        <form onSubmit={handleSaveCollege} className="space-y-4">
          {formError && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400">
              {formError}
            </div>
          )}

          <Input
            label="University / College Name"
            placeholder="e.g. Delhi Technological University"
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Short Code / Acronym"
              placeholder="e.g. DTU or IIT-D"
              value={shortName}
              onChange={(e) => setShortName(e.target.value)}
            />

            <Input
              label="Slug Identifier"
              placeholder="e.g. delhi-technological-university"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
              Location / Campus Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Shahbad Daulatpur, Bawana Road, Rohini, Delhi"
              className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-100 dark:border-zinc-800">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsCreateOpen(false);
                setEditingCollege(null);
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              loading={isCreating || isUpdating}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
            >
              {editingCollege ? "Save Changes" : "Create University"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Confirm Delete College */}
      <Modal
        isOpen={!!deletingCollege}
        onClose={() => setDeletingCollege(null)}
        title="Delete Partner University"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 rounded-xl text-rose-700 dark:text-rose-400">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <div className="text-xs">
              <p className="font-bold">Permanent Deletion Warning</p>
              <p className="mt-0.5">
                This will permanently delete <strong>{deletingCollege?.name}</strong> along with all associated branches and student assignments.
              </p>
            </div>
          </div>

          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Are you sure you want to remove this college from the partnership directory?
          </p>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-100 dark:border-zinc-800">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeletingCollege(null)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              loading={isDeleting}
              onClick={handleDeleteCollege}
              className="bg-rose-600 hover:bg-rose-700 text-white font-bold"
            >
              Delete University
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
