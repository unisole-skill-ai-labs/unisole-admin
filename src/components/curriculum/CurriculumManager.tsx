import React, { useState } from "react";
import {
  useGetCoursesQuery,
  useCreateCourseMutation,
  useUpdateCourseMutation,
  useGetCourseModulesQuery,
  useAttachCourseModuleMutation,
  useDetachCourseModuleMutation,
  useGetModulesQuery,
  useCreateModuleMutation,
  useUpdateModuleMutation,
  useGetModuleLessonsQuery,
  useAttachModuleLessonMutation,
  useDetachModuleLessonMutation,
  useGetLessonsQuery,
  useCreateLessonMutation,
  useUpdateLessonMutation,
} from "../../store";
import {
  BookOpen,
  FolderTree,
  Video,
  Plus,
  Edit2,
  Trash2,
  Search,
  Layers,
  X,
  Clock,
  ExternalLink,
  RefreshCw,
  AlertCircle,
  Code2,
} from "lucide-react";
import Badge from "../ui/Badge";
import Button from "../ui/Button";
import Modal from "../ui/Modal";
import Input from "../ui/Input";

interface CurriculumManagerProps {
  baseUrl: string;
}

export default function CurriculumManager({ baseUrl }: CurriculumManagerProps) {
  const [activeTab, setActiveTab] = useState<"courses" | "modules" | "lessons">("courses");

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">
            Curriculum & Content Hierarchy
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium mt-1">
            Build and sequence reusable modular components: Courses, Modules, and Lessons
          </p>
        </div>
      </div>

      {/* Curriculum Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-zinc-100 dark:bg-zinc-900 rounded-2xl w-fit border border-zinc-200/80 dark:border-zinc-800">
        <button
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === "courses"
              ? "bg-white dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 shadow-sm"
              : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
          }`}
          onClick={() => setActiveTab("courses")}
        >
          <BookOpen className="w-4 h-4" /> Courses
        </button>
        <button
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === "modules"
              ? "bg-white dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 shadow-sm"
              : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
          }`}
          onClick={() => setActiveTab("modules")}
        >
          <FolderTree className="w-4 h-4" /> Modules
        </button>
        <button
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === "lessons"
              ? "bg-white dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 shadow-sm"
              : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
          }`}
          onClick={() => setActiveTab("lessons")}
        >
          <Video className="w-4 h-4" /> Lessons & Video Notes
        </button>
      </div>

      <div>
        {activeTab === "courses" && <CoursesSection baseUrl={baseUrl} />}
        {activeTab === "modules" && <ModulesSection baseUrl={baseUrl} />}
        {activeTab === "lessons" && <LessonsSection baseUrl={baseUrl} />}
      </div>
    </div>
  );
}

// ─── 1. COURSES SECTION ───────────────────────────────────────────────────────
function CoursesSection({ baseUrl }: { baseUrl: string }) {
  const { data: courses = [], isLoading, refetch } = useGetCoursesQuery(baseUrl);
  const [createCourse, { isLoading: isCreating }] = useCreateCourseMutation();
  const [updateCourse, { isLoading: isUpdating }] = useUpdateCourseMutation();

  const [search, setSearch] = useState("");
  const [editingCourse, setEditingCourse] = useState<any>(null);
  const [managingModulesCourse, setManagingModulesCourse] = useState<any>(null);

  const filtered = courses.filter(
    (c: any) =>
      c.title?.toLowerCase().includes(search.toLowerCase()) ||
      c.slug?.toLowerCase().includes(search.toLowerCase())
  );

  const handleSave = async (formData: any) => {
    if (editingCourse === "create") {
      await createCourse({ baseUrl, body: formData }).unwrap();
    } else {
      await updateCourse({ baseUrl, id: editingCourse.id, body: formData }).unwrap();
    }
    setEditingCourse(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl shadow-xs">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Search courses by title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-hidden"
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button variant="secondary" size="sm" onClick={refetch} icon={RefreshCw}>
            Refresh
          </Button>
          <Button variant="primary" size="sm" onClick={() => setEditingCourse("create")} icon={Plus}>
            Add Course
          </Button>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/50 text-zinc-400 font-mono">
                <th className="py-3 px-4 font-semibold">Course Title & Slug</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold">Active</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
              {isLoading ? (
                <tr><td colSpan={4} className="py-8 text-center text-zinc-400">Loading courses...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={4} className="py-8 text-center text-zinc-400">No courses found.</td></tr>
              ) : (
                filtered.map((c: any) => (
                  <tr key={c.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/40">
                    <td className="py-3.5 px-4">
                      <div className="font-extrabold text-sm text-zinc-900 dark:text-zinc-100">{c.title}</div>
                      <div className="text-[11px] text-zinc-500 dark:text-zinc-400 font-mono mt-0.5">/{c.slug} · ID: {c.id}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge variant={c.status === "PUBLISHED" ? "emerald" : "default"} size="sm">{c.status}</Badge>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`text-[10px] font-bold ${c.isActive ? "text-emerald-500" : "text-zinc-400"}`}>
                        {c.isActive ? "ACTIVE" : "INACTIVE"}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => setManagingModulesCourse(c)}
                          icon={FolderTree}
                          className="text-xs"
                        >
                          Modules
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => setEditingCourse(c)} icon={Edit2} />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {editingCourse && (
        <CourseModal
          course={editingCourse === "create" ? null : editingCourse}
          isLoading={isCreating || isUpdating}
          onClose={() => setEditingCourse(null)}
          onSave={handleSave}
        />
      )}

      {managingModulesCourse && (
        <CourseModulesModal
          course={managingModulesCourse}
          baseUrl={baseUrl}
          onClose={() => setManagingModulesCourse(null)}
        />
      )}
    </div>
  );
}

// ─── 2. MODULES SECTION ───────────────────────────────────────────────────────
function ModulesSection({ baseUrl }: { baseUrl: string }) {
  const { data: modules = [], isLoading, refetch } = useGetModulesQuery(baseUrl);
  const [createModule, { isLoading: isCreating }] = useCreateModuleMutation();
  const [updateModule, { isLoading: isUpdating }] = useUpdateModuleMutation();

  const [search, setSearch] = useState("");
  const [editingModule, setEditingModule] = useState<any>(null);
  const [managingLessonsModule, setManagingLessonsModule] = useState<any>(null);

  const filtered = modules.filter(
    (m: any) =>
      m.title?.toLowerCase().includes(search.toLowerCase()) ||
      m.slug?.toLowerCase().includes(search.toLowerCase())
  );

  const handleSave = async (formData: any) => {
    if (editingModule === "create") {
      await createModule({ baseUrl, body: formData }).unwrap();
    } else {
      await updateModule({ baseUrl, id: editingModule.id, body: formData }).unwrap();
    }
    setEditingModule(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl shadow-xs">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Search modules..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-hidden"
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button variant="secondary" size="sm" onClick={refetch} icon={RefreshCw}>
            Refresh
          </Button>
          <Button variant="primary" size="sm" onClick={() => setEditingModule("create")} icon={Plus}>
            Add Module
          </Button>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/50 text-zinc-400 font-mono">
                <th className="py-3 px-4 font-semibold">Module Title & Slug</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold">Active</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
              {isLoading ? (
                <tr><td colSpan={4} className="py-8 text-center text-zinc-400">Loading modules...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={4} className="py-8 text-center text-zinc-400">No modules found.</td></tr>
              ) : (
                filtered.map((m: any) => (
                  <tr key={m.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/40">
                    <td className="py-3.5 px-4">
                      <div className="font-extrabold text-sm text-zinc-900 dark:text-zinc-100">{m.title}</div>
                      <div className="text-[11px] text-zinc-500 dark:text-zinc-400 font-mono mt-0.5">/{m.slug} · ID: {m.id}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge variant={m.status === "PUBLISHED" ? "emerald" : "default"} size="sm">{m.status}</Badge>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`text-[10px] font-bold ${m.isActive ? "text-emerald-500" : "text-zinc-400"}`}>
                        {m.isActive ? "ACTIVE" : "INACTIVE"}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => setManagingLessonsModule(m)}
                          icon={Video}
                          className="text-xs"
                        >
                          Lessons
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => setEditingModule(m)} icon={Edit2} />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {editingModule && (
        <ModuleModal
          moduleItem={editingModule === "create" ? null : editingModule}
          isLoading={isCreating || isUpdating}
          onClose={() => setEditingModule(null)}
          onSave={handleSave}
        />
      )}

      {managingLessonsModule && (
        <ModuleLessonsModal
          moduleItem={managingLessonsModule}
          baseUrl={baseUrl}
          onClose={() => setManagingLessonsModule(null)}
        />
      )}
    </div>
  );
}

// ─── 3. LESSONS SECTION ───────────────────────────────────────────────────────
function LessonsSection({ baseUrl }: { baseUrl: string }) {
  const { data: lessons = [], isLoading, refetch } = useGetLessonsQuery(baseUrl);
  const [createLesson, { isLoading: isCreating }] = useCreateLessonMutation();
  const [updateLesson, { isLoading: isUpdating }] = useUpdateLessonMutation();

  const [search, setSearch] = useState("");
  const [editingLesson, setEditingLesson] = useState<any>(null);

  const filtered = lessons.filter(
    (l: any) =>
      l.title?.toLowerCase().includes(search.toLowerCase()) ||
      l.slug?.toLowerCase().includes(search.toLowerCase())
  );

  const handleSave = async (formData: any) => {
    if (editingLesson === "create") {
      await createLesson({ baseUrl, body: formData }).unwrap();
    } else {
      await updateLesson({ baseUrl, id: editingLesson.id, body: formData }).unwrap();
    }
    setEditingLesson(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl shadow-xs">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Search lessons by title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-hidden"
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button variant="secondary" size="sm" onClick={refetch} icon={RefreshCw}>
            Refresh
          </Button>
          <Button variant="primary" size="sm" onClick={() => setEditingLesson("create")} icon={Plus}>
            Add Lesson
          </Button>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/50 text-zinc-400 font-mono">
                <th className="py-3 px-4 font-semibold">Lesson Title & Slug</th>
                <th className="py-3 px-4 font-semibold">Duration</th>
                <th className="py-3 px-4 font-semibold">Media Type</th>
                <th className="py-3 px-4 font-semibold">Active</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
              {isLoading ? (
                <tr><td colSpan={5} className="py-8 text-center text-zinc-400">Loading lessons...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={5} className="py-8 text-center text-zinc-400">No lessons found.</td></tr>
              ) : (
                filtered.map((l: any) => (
                  <tr key={l.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/40">
                    <td className="py-3.5 px-4">
                      <div className="font-extrabold text-sm text-zinc-900 dark:text-zinc-100">{l.title}</div>
                      <div className="text-[11px] text-zinc-500 dark:text-zinc-400 font-mono mt-0.5">/{l.slug} · ID: {l.id}</div>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-zinc-700 dark:text-zinc-300">
                      {l.durationMinutes ? `${l.durationMinutes}m` : "—"}
                    </td>
                    <td className="py-3.5 px-4">
                      {l.videoUrl ? (
                        <Badge variant="brand" size="sm">Video Lesson</Badge>
                      ) : (
                        <Badge variant="default" size="sm">Reading / Code</Badge>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`text-[10px] font-bold ${l.isActive ? "text-emerald-500" : "text-zinc-400"}`}>
                        {l.isActive ? "ACTIVE" : "INACTIVE"}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Button variant="ghost" size="sm" onClick={() => setEditingLesson(l)} icon={Edit2} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {editingLesson && (
        <LessonModal
          lesson={editingLesson === "create" ? null : editingLesson}
          isLoading={isCreating || isUpdating}
          onClose={() => setEditingLesson(null)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}

// ─── Modals: Course, CourseModules, Module, ModuleLessons, Lesson ─────────────

function CourseModal({ course, isLoading, onClose, onSave }: any) {
  const [title, setTitle] = useState(course?.title || "");
  const [slug, setSlug] = useState(course?.slug || "");
  const [shortDescription, setShortDescription] = useState(course?.shortDescription || "");
  const [description, setDescription] = useState(course?.description || "");
  const [status, setStatus] = useState(course?.status || "DRAFT");
  const [isActive, setIsActive] = useState(course ? !!course.isActive : true);

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!course) setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""));
  };

  return (
    <Modal isOpen={true} onClose={onClose} title={course ? "Edit Course" : "Add New Course"} maxWidth="max-w-lg">
      <form onSubmit={(e) => { e.preventDefault(); onSave({ title, slug, shortDescription, description, status, isActive }); }} className="space-y-4">
        <Input label="Course Title" value={title} onChange={(e) => handleTitleChange(e.target.value)} required />
        <Input label="Slug" value={slug} onChange={(e) => setSlug(e.target.value)} required />
        <div>
          <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">Overview</label>
          <textarea rows={2} value={shortDescription} onChange={(e) => setShortDescription(e.target.value)} className="w-full px-3.5 py-2 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs" />
        </div>
        <div className="pt-2 flex justify-end gap-2 border-t border-zinc-100 dark:border-zinc-800">
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="primary" size="sm" loading={isLoading}>Save Course</Button>
        </div>
      </form>
    </Modal>
  );
}

function CourseModulesModal({ course, baseUrl, onClose }: any) {
  const { data: allModules = [] } = useGetModulesQuery(baseUrl);
  const { data: attachedModules = [] } = useGetCourseModulesQuery({ baseUrl, id: course.id });
  const [attachModule, { isLoading: isAttaching }] = useAttachCourseModuleMutation();
  const [detachModule] = useDetachCourseModuleMutation();

  const [selectedModuleId, setSelectedModuleId] = useState("");
  const [position, setPosition] = useState(attachedModules.length + 1);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedModuleId) return;
    await attachModule({ baseUrl, courseId: course.id, moduleId: selectedModuleId, position: Number(position) }).unwrap();
    setSelectedModuleId("");
    setPosition((p: number) => Number(p) + 1);
  };

  return (
    <Modal isOpen={true} onClose={onClose} title={`Modules in Course: ${course.title}`} maxWidth="max-w-2xl">
      <div className="space-y-4">
        <div className="space-y-2 max-h-56 overflow-y-auto">
          {attachedModules.length === 0 ? (
            <p className="text-xs text-zinc-400 py-3 text-center">No modules linked to this course yet.</p>
          ) : (
            attachedModules.map((m: any) => (
              <div key={m.id || m.moduleId} className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-800 rounded-xl">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-bold text-xs flex items-center justify-center font-mono">{m.position || 1}</span>
                  <div><h5 className="font-extrabold text-xs text-zinc-900 dark:text-zinc-100">{m.title}</h5><span className="text-[10px] text-zinc-400 font-mono">/{m.slug}</span></div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => detachModule({ baseUrl, courseId: course.id, moduleId: m.id || m.moduleId })} className="text-rose-500 hover:text-rose-700 p-1"><Trash2 className="w-4 h-4" /></Button>
              </div>
            ))
          )}
        </div>
        <form onSubmit={handleAdd} className="flex gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
          <select value={selectedModuleId} onChange={(e) => setSelectedModuleId(e.target.value)} className="flex-1 px-3 py-2 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs" required>
            <option value="">Select module to link...</option>
            {allModules.map((m: any) => <option key={m.id} value={m.id}>{m.title} (/{m.slug})</option>)}
          </select>
          <input type="number" min="1" value={position} onChange={(e) => setPosition(Number(e.target.value))} className="w-20 px-3 py-2 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-mono text-center" />
          <Button type="submit" variant="primary" size="sm" loading={isAttaching} icon={Plus}>Link</Button>
        </form>
      </div>
    </Modal>
  );
}

function ModuleModal({ moduleItem, isLoading, onClose, onSave }: any) {
  const [title, setTitle] = useState(moduleItem?.title || "");
  const [slug, setSlug] = useState(moduleItem?.slug || "");
  const [description, setDescription] = useState(moduleItem?.description || "");
  const [status, setStatus] = useState(moduleItem?.status || "DRAFT");
  const [isActive, setIsActive] = useState(moduleItem ? !!moduleItem.isActive : true);

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!moduleItem) setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""));
  };

  return (
    <Modal isOpen={true} onClose={onClose} title={moduleItem ? "Edit Module" : "Add New Module"} maxWidth="max-w-lg">
      <form onSubmit={(e) => { e.preventDefault(); onSave({ title, slug, description, status, isActive }); }} className="space-y-4">
        <Input label="Module Title" value={title} onChange={(e) => handleTitleChange(e.target.value)} required />
        <Input label="Slug" value={slug} onChange={(e) => setSlug(e.target.value)} required />
        <div>
          <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">Description</label>
          <textarea rows={2} value={description} onChange={(e) => setDescription(e.target.value)} className="w-full px-3.5 py-2 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs" />
        </div>
        <div className="pt-2 flex justify-end gap-2 border-t border-zinc-100 dark:border-zinc-800">
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="primary" size="sm" loading={isLoading}>Save Module</Button>
        </div>
      </form>
    </Modal>
  );
}

function ModuleLessonsModal({ moduleItem, baseUrl, onClose }: any) {
  const { data: allLessons = [] } = useGetLessonsQuery(baseUrl);
  const { data: attachedLessons = [] } = useGetModuleLessonsQuery({ baseUrl, id: moduleItem.id });
  const [attachLesson, { isLoading: isAttaching }] = useAttachModuleLessonMutation();
  const [detachLesson] = useDetachModuleLessonMutation();

  const [selectedLessonId, setSelectedLessonId] = useState("");
  const [position, setPosition] = useState(attachedLessons.length + 1);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLessonId) return;
    await attachLesson({ baseUrl, moduleId: moduleItem.id, lessonId: selectedLessonId, position: Number(position) }).unwrap();
    setSelectedLessonId("");
    setPosition((p: number) => Number(p) + 1);
  };

  return (
    <Modal isOpen={true} onClose={onClose} title={`Lessons in Module: ${moduleItem.title}`} maxWidth="max-w-2xl">
      <div className="space-y-4">
        <div className="space-y-2 max-h-56 overflow-y-auto">
          {attachedLessons.length === 0 ? (
            <p className="text-xs text-zinc-400 py-3 text-center">No lessons linked to this module yet.</p>
          ) : (
            attachedLessons.map((l: any) => (
              <div key={l.id || l.lessonId} className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-800 rounded-xl">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-bold text-xs flex items-center justify-center font-mono">{l.position || 1}</span>
                  <div><h5 className="font-extrabold text-xs text-zinc-900 dark:text-zinc-100">{l.title}</h5><span className="text-[10px] text-zinc-400 font-mono">/{l.slug}</span></div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => detachLesson({ baseUrl, moduleId: moduleItem.id, lessonId: l.id || l.lessonId })} className="text-rose-500 hover:text-rose-700 p-1"><Trash2 className="w-4 h-4" /></Button>
              </div>
            ))
          )}
        </div>
        <form onSubmit={handleAdd} className="flex gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
          <select value={selectedLessonId} onChange={(e) => setSelectedLessonId(e.target.value)} className="flex-1 px-3 py-2 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs" required>
            <option value="">Select lesson to link...</option>
            {allLessons.map((l: any) => <option key={l.id} value={l.id}>{l.title} (/{l.slug})</option>)}
          </select>
          <input type="number" min="1" value={position} onChange={(e) => setPosition(Number(e.target.value))} className="w-20 px-3 py-2 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-mono text-center" />
          <Button type="submit" variant="primary" size="sm" loading={isAttaching} icon={Plus}>Link</Button>
        </form>
      </div>
    </Modal>
  );
}

function LessonModal({ lesson, isLoading, onClose, onSave }: any) {
  const [title, setTitle] = useState(lesson?.title || "");
  const [slug, setSlug] = useState(lesson?.slug || "");
  const [videoUrl, setVideoUrl] = useState(lesson?.videoUrl || "");
  const [durationMinutes, setDurationMinutes] = useState(lesson?.durationMinutes?.toString() || "");
  const [description, setDescription] = useState(lesson?.description || "");
  const [content, setContent] = useState(lesson?.content || "");
  const [status, setStatus] = useState(lesson?.status || "DRAFT");
  const [isActive, setIsActive] = useState(lesson ? !!lesson.isActive : true);

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!lesson) setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""));
  };

  return (
    <Modal isOpen={true} onClose={onClose} title={lesson ? `Edit Lesson: ${lesson.title}` : "Add New Lesson"} maxWidth="max-w-2xl">
      <form onSubmit={(e) => { e.preventDefault(); onSave({ title, slug, videoUrl: videoUrl || null, durationMinutes: durationMinutes ? Number(durationMinutes) : null, description, content, status, isActive }); }} className="space-y-4">
        <Input label="Lesson Title" value={title} onChange={(e) => handleTitleChange(e.target.value)} required />
        <Input label="Slug" value={slug} onChange={(e) => setSlug(e.target.value)} required />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Video Stream URL (YouTube or MP4)" value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} placeholder="https://www.youtube.com/watch?v=..." />
          <Input label="Duration (Minutes)" type="number" min="0" value={durationMinutes} onChange={(e) => setDurationMinutes(e.target.value)} placeholder="e.g. 15" />
        </div>
        <div>
          <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">Overview / Abstract</label>
          <textarea rows={2} value={description} onChange={(e) => setDescription(e.target.value)} className="w-full px-3.5 py-2 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs" />
        </div>
        <div>
          <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5 flex items-center gap-1.5">
            <Code2 className="w-3.5 h-3.5 text-indigo-500" /> Study Notes & Code Snippets
          </label>
          <textarea rows={6} value={content} onChange={(e) => setContent(e.target.value)} placeholder="Enter markdown or code notes..." className="w-full px-3.5 py-2 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-mono" />
        </div>
        <div className="pt-2 flex justify-end gap-2 border-t border-zinc-100 dark:border-zinc-800">
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="primary" size="sm" loading={isLoading}>Save Lesson</Button>
        </div>
      </form>
    </Modal>
  );
}
