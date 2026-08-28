import React, { useState } from "react";
import {
  useGetCategoriesQuery,
  useGetCollegesQuery,
  useGetCoursesQuery,
  useGetPathwayCoursesQuery,
  useAttachPathwayCategoryMutation,
  useDetachPathwayCategoryMutation,
  useAttachPathwayCollegeMutation,
  useDetachPathwayCollegeMutation,
  useAttachPathwayCourseMutation,
  useDetachPathwayCourseMutation,
} from "../../store";
import {
  X,
  Plus,
  Trash2,
  BookOpen,
  Tag,
  GraduationCap,
  Layers,
  Check,
  AlertCircle,
  RefreshCw,
  Building2,
} from "lucide-react";
import Badge from "../ui/Badge";
import Button from "../ui/Button";
import Modal from "../ui/Modal";

interface PathwayBuilderModalProps {
  pathway: any;
  baseUrl: string;
  onClose: () => void;
}

export default function PathwayBuilderModal({ pathway, baseUrl, onClose }: PathwayBuilderModalProps) {
  const { data: allCategories = [] } = useGetCategoriesQuery(baseUrl);
  const { data: allColleges = [] } = useGetCollegesQuery(baseUrl);
  const { data: allCourses = [] } = useGetCoursesQuery(baseUrl);
  const { data: attachedCourses = [], isFetching: isCoursesLoading } = useGetPathwayCoursesQuery({
    baseUrl,
    id: pathway.id,
  });

  const [attachCategory, { isLoading: isAttachingCat }] = useAttachPathwayCategoryMutation();
  const [detachCategory, { isLoading: isDetachingCat }] = useDetachPathwayCategoryMutation();
  const [attachCollege, { isLoading: isAttachingClg }] = useAttachPathwayCollegeMutation();
  const [detachCollege, { isLoading: isDetachingClg }] = useDetachPathwayCollegeMutation();
  const [attachCourse, { isLoading: isAttachingCourse }] = useAttachPathwayCourseMutation();
  const [detachCourse, { isLoading: isDetachingCourse }] = useDetachPathwayCourseMutation();

  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [coursePosition, setCoursePosition] = useState(
    attachedCourses.length > 0
      ? Math.max(...attachedCourses.map((c: any) => c.position || 0)) + 1
      : 1
  );
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [selectedCollegeId, setSelectedCollegeId] = useState("");
  const [notice, setNotice] = useState<{ msg: string; type: string } | null>(null);

  const showNotification = (msg: string, type = "success") => {
    setNotice({ msg, type });
    setTimeout(() => setNotice(null), 4000);
  };

  const handleAddCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourseId) return;

    try {
      await attachCourse({
        baseUrl,
        pathwayId: pathway.id,
        courseId: selectedCourseId,
        position: Number(coursePosition) || 1,
      }).unwrap();
      showNotification("Course linked to pathway!");
      setSelectedCourseId("");
      setCoursePosition((prev: any) => Number(prev) + 1);
    } catch (err: any) {
      showNotification(err?.data?.error || err?.data?.message || "Failed to link course", "error");
    }
  };

  const handleRemoveCourse = async (courseId: string) => {
    if (!window.confirm("Remove this course from the pathway?")) return;
    try {
      await detachCourse({
        baseUrl,
        pathwayId: pathway.id,
        courseId,
      }).unwrap();
      showNotification("Course detached.");
    } catch (err: any) {
      showNotification(err?.data?.error || "Failed to remove course", "error");
    }
  };

  const handleAddCategory = async () => {
    if (!selectedCategoryId) return;
    try {
      await attachCategory({
        baseUrl,
        pathwayId: pathway.id,
        categoryId: selectedCategoryId,
      }).unwrap();
      showNotification("Category attached.");
      setSelectedCategoryId("");
    } catch (err: any) {
      showNotification(err?.data?.error || "Failed to attach category", "error");
    }
  };

  const handleRemoveCategory = async (categoryId: string) => {
    try {
      await detachCategory({
        baseUrl,
        pathwayId: pathway.id,
        categoryId,
      }).unwrap();
      showNotification("Category detached.");
    } catch (err: any) {
      showNotification(err?.data?.error || "Failed to detach category", "error");
    }
  };

  const handleAddCollege = async () => {
    if (!selectedCollegeId) return;
    try {
      await attachCollege({
        baseUrl,
        pathwayId: pathway.id,
        collegeId: selectedCollegeId,
      }).unwrap();
      showNotification("College partner linked.");
      setSelectedCollegeId("");
    } catch (err: any) {
      showNotification(err?.data?.error || "Failed to link college", "error");
    }
  };

  const handleRemoveCollege = async (collegeId: string) => {
    try {
      await detachCollege({
        baseUrl,
        pathwayId: pathway.id,
        collegeId,
      }).unwrap();
      showNotification("College unlinked.");
    } catch (err: any) {
      showNotification(err?.data?.error || "Failed to unlink college", "error");
    }
  };

  const attachedCategories = pathway.categories || [];
  const attachedColleges = pathway.colleges || [];

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={`Curriculum Sequencing: ${pathway.title}`}
      maxWidth="max-w-3xl"
    >
      <div className="space-y-6">
        {notice && (
          <div
            className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
              notice.type === "error"
                ? "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800"
                : "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
            }`}
          >
            {notice.type === "error" ? <AlertCircle className="w-4 h-4" /> : <Check className="w-4 h-4" />}
            <span>{notice.msg}</span>
          </div>
        )}

        {/* Section 1: Attached Courses & Sequencing */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 font-mono flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-indigo-500" />
              <span>Sequenced Courses in Pathway</span>
            </h4>
            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
              {attachedCourses.length} linked
            </span>
          </div>

          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {isCoursesLoading ? (
              <p className="text-xs text-zinc-400 py-4 text-center">Loading attached courses...</p>
            ) : attachedCourses.length === 0 ? (
              <p className="text-xs text-zinc-400 dark:text-zinc-600 italic py-3 text-center border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl">
                No courses linked to this pathway yet.
              </p>
            ) : (
              attachedCourses.map((c: any) => (
                <div
                  key={c.id || c.courseId}
                  className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-800"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 font-black text-xs flex items-center justify-center font-mono">
                      {c.position || 1}
                    </span>
                    <div>
                      <h5 className="font-extrabold text-xs text-zinc-900 dark:text-zinc-100">{c.title}</h5>
                      <span className="text-[10px] text-zinc-400 font-mono">/{c.slug}</span>
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveCourse(c.id || c.courseId)}
                    className="text-rose-500 hover:text-rose-700 p-1"
                    disabled={isDetachingCourse}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))
            )}
          </div>

          {/* Form to attach course */}
          <form onSubmit={handleAddCourse} className="flex flex-col sm:flex-row gap-2 pt-2">
            <select
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(e.target.value)}
              className="flex-1 px-3 py-2 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-semibold text-zinc-900 dark:text-zinc-100 focus:outline-hidden"
              required
            >
              <option value="">Select course to link...</option>
              {allCourses.map((c: any) => (
                <option key={c.id} value={c.id}>
                  {c.title} (/{c.slug})
                </option>
              ))}
            </select>

            <input
              type="number"
              min="1"
              value={coursePosition}
              onChange={(e) => setCoursePosition(Number(e.target.value))}
              placeholder="Pos"
              className="w-20 px-3 py-2 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-mono font-bold text-center text-zinc-900 dark:text-zinc-100 focus:outline-hidden"
              title="Sequence Position"
            />

            <Button
              type="submit"
              variant="primary"
              size="sm"
              loading={isAttachingCourse}
              icon={Plus}
            >
              Link Course
            </Button>
          </form>
        </div>

        {/* Section 2: Metadata Tagging (Categories & Colleges) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
          {/* Domain Categories */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 font-mono flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-indigo-500" />
              <span>Domain Categories</span>
            </h4>

            <div className="flex flex-wrap gap-1.5 min-h-[32px]">
              {attachedCategories.length === 0 ? (
                <span className="text-[11px] text-zinc-400 italic">No categories attached</span>
              ) : (
                attachedCategories.map((cat: any) => (
                  <span
                    key={cat.id || cat}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 text-xs font-bold border border-indigo-200/60 dark:border-indigo-800/60"
                  >
                    <span>{cat.name || cat}</span>
                    <button
                      onClick={() => handleRemoveCategory(cat.id || cat)}
                      className="hover:text-rose-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))
              )}
            </div>

            <div className="flex gap-1.5 pt-1">
              <select
                value={selectedCategoryId}
                onChange={(e) => setSelectedCategoryId(e.target.value)}
                className="flex-1 px-2.5 py-1.5 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs text-zinc-900 dark:text-zinc-100 focus:outline-hidden"
              >
                <option value="">Attach Category...</option>
                {allCategories.map((c: any) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleAddCategory}
                disabled={!selectedCategoryId || isAttachingCat}
              >
                Add
              </Button>
            </div>
          </div>

          {/* Partner Colleges */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 font-mono flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-indigo-500" />
              <span>Partner Colleges</span>
            </h4>

            <div className="flex flex-wrap gap-1.5 min-h-[32px]">
              {attachedColleges.length === 0 ? (
                <span className="text-[11px] text-zinc-400 italic">No colleges linked</span>
              ) : (
                attachedColleges.map((col: any) => (
                  <span
                    key={col.id || col}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-xs font-bold border border-zinc-200 dark:border-zinc-700"
                  >
                    <span>{col.shortName || col.name || col}</span>
                    <button
                      onClick={() => handleRemoveCollege(col.id || col)}
                      className="hover:text-rose-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))
              )}
            </div>

            <div className="flex gap-1.5 pt-1">
              <select
                value={selectedCollegeId}
                onChange={(e) => setSelectedCollegeId(e.target.value)}
                className="flex-1 px-2.5 py-1.5 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs text-zinc-900 dark:text-zinc-100 focus:outline-hidden"
              >
                <option value="">Link College Partner...</option>
                {allColleges.map((c: any) => (
                  <option key={c.id} value={c.id}>
                    {c.shortName || c.name}
                  </option>
                ))}
              </select>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleAddCollege}
                disabled={!selectedCollegeId || isAttachingClg}
              >
                Add
              </Button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 flex items-center justify-end border-t border-zinc-100 dark:border-zinc-800">
          <Button variant="outline" size="sm" onClick={onClose}>
            Done
          </Button>
        </div>
      </div>
    </Modal>
  );
}
