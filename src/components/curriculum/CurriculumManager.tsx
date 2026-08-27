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
} from "lucide-react";

export default function CurriculumManager({ baseUrl }) {
  const [activeTab, setActiveTab] = useState("courses"); // 'courses' | 'modules' | 'lessons'

  return (
    <div className="view-container">
      <div className="section-header">
        <div>
          <h2>Curriculum & Content Management</h2>
          <p className="text-muted">
            Manage reusable educational components: Courses, Modules, and Lessons.
          </p>
        </div>
      </div>

      {/* Curriculum Tabs */}
      <div className="tabs-nav">
        <button
          className={`tab-btn ${activeTab === "courses" ? "active" : ""}`}
          onClick={() => setActiveTab("courses")}
        >
          <BookOpen size={16} /> Courses
        </button>
        <button
          className={`tab-btn ${activeTab === "modules" ? "active" : ""}`}
          onClick={() => setActiveTab("modules")}
        >
          <FolderTree size={16} /> Modules
        </button>
        <button
          className={`tab-btn ${activeTab === "lessons" ? "active" : ""}`}
          onClick={() => setActiveTab("lessons")}
        >
          <Video size={16} /> Lessons
        </button>
      </div>

      <div className="tab-content mt-3">
        {activeTab === "courses" && <CoursesSection baseUrl={baseUrl} />}
        {activeTab === "modules" && <ModulesSection baseUrl={baseUrl} />}
        {activeTab === "lessons" && <LessonsSection baseUrl={baseUrl} />}
      </div>
    </div>
  );
}

// ----------------------------------------------------
// 1. COURSES SECTION
// ----------------------------------------------------
function CoursesSection({ baseUrl }) {
  const { data: courses = [], isLoading, refetch } = useGetCoursesQuery(baseUrl);
  const [createCourse, { isLoading: isCreating }] = useCreateCourseMutation();
  const [updateCourse, { isLoading: isUpdating }] = useUpdateCourseMutation();

  const [search, setSearch] = useState("");
  const [editingCourse, setEditingCourse] = useState(null); // null | 'create' | course
  const [managingModulesCourse, setManagingModulesCourse] = useState(null);

  const filtered = courses.filter(
    (c) =>
      c.title?.toLowerCase().includes(search.toLowerCase()) ||
      c.slug?.toLowerCase().includes(search.toLowerCase())
  );

  const handleSave = async (formData) => {
    if (editingCourse === "create") {
      await createCourse({ baseUrl, body: formData }).unwrap();
    } else {
      await updateCourse({ baseUrl, id: editingCourse.id, body: formData }).unwrap();
    }
    setEditingCourse(null);
  };

  return (
    <div>
      <div className="toolbar-card">
        <div className="search-input-wrapper">
          <Search size={16} className="text-muted" />
          <input
            type="text"
            placeholder="Search courses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex-center gap-2">
          <button className="btn-secondary" onClick={refetch}>
            <RefreshCw size={16} />
          </button>
          <button className="btn-primary" onClick={() => setEditingCourse("create")}>
            <Plus size={16} /> Add Course
          </button>
        </div>
      </div>

      <div className="panel-card mt-3">
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Title & Slug</th>
                <th>Status</th>
                <th>Active</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={4} className="text-center py-6 text-muted">Loading courses...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={4} className="text-center py-6 text-muted">No courses found.</td></tr>
              ) : (
                filtered.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <div className="font-semibold">{c.title}</div>
                      <div className="text-muted font-mono text-xs">/{c.slug} · ID: {c.id}</div>
                    </td>
                    <td><span className={`status-pill pill-${c.status?.toLowerCase()}`}>{c.status}</span></td>
                    <td>{c.isActive ? <span className="text-emerald font-semibold">Yes</span> : <span className="text-muted">No</span>}</td>
                    <td className="text-right">
                      <div className="flex-end gap-1">
                        <button
                          className="btn-accent-sm"
                          onClick={() => setManagingModulesCourse(c)}
                        >
                          <FolderTree size={14} /> Modules
                        </button>
                        <button className="btn-ghost-sm" onClick={() => setEditingCourse(c)}>
                          <Edit2 size={14} />
                        </button>
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

// ----------------------------------------------------
// 2. MODULES SECTION
// ----------------------------------------------------
function ModulesSection({ baseUrl }) {
  const { data: modules = [], isLoading, refetch } = useGetModulesQuery(baseUrl);
  const [createModule, { isLoading: isCreating }] = useCreateModuleMutation();
  const [updateModule, { isLoading: isUpdating }] = useUpdateModuleMutation();

  const [search, setSearch] = useState("");
  const [editingModule, setEditingModule] = useState(null);
  const [managingLessonsModule, setManagingLessonsModule] = useState(null);

  const filtered = modules.filter(
    (m) =>
      m.title?.toLowerCase().includes(search.toLowerCase()) ||
      m.slug?.toLowerCase().includes(search.toLowerCase())
  );

  const handleSave = async (formData) => {
    if (editingModule === "create") {
      await createModule({ baseUrl, body: formData }).unwrap();
    } else {
      await updateModule({ baseUrl, id: editingModule.id, body: formData }).unwrap();
    }
    setEditingModule(null);
  };

  return (
    <div>
      <div className="toolbar-card">
        <div className="search-input-wrapper">
          <Search size={16} className="text-muted" />
          <input
            type="text"
            placeholder="Search modules..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex-center gap-2">
          <button className="btn-secondary" onClick={refetch}>
            <RefreshCw size={16} />
          </button>
          <button className="btn-primary" onClick={() => setEditingModule("create")}>
            <Plus size={16} /> Add Module
          </button>
        </div>
      </div>

      <div className="panel-card mt-3">
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Module Title & Slug</th>
                <th>Status</th>
                <th>Active</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={4} className="text-center py-6 text-muted">Loading modules...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={4} className="text-center py-6 text-muted">No modules found.</td></tr>
              ) : (
                filtered.map((m) => (
                  <tr key={m.id}>
                    <td>
                      <div className="font-semibold">{m.title}</div>
                      <div className="text-muted font-mono text-xs">/{m.slug} · ID: {m.id}</div>
                    </td>
                    <td><span className={`status-pill pill-${m.status?.toLowerCase()}`}>{m.status}</span></td>
                    <td>{m.isActive ? <span className="text-emerald font-semibold">Yes</span> : <span className="text-muted">No</span>}</td>
                    <td className="text-right">
                      <div className="flex-end gap-1">
                        <button
                          className="btn-accent-sm"
                          onClick={() => setManagingLessonsModule(m)}
                        >
                          <Video size={14} /> Lessons
                        </button>
                        <button className="btn-ghost-sm" onClick={() => setEditingModule(m)}>
                          <Edit2 size={14} />
                        </button>
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

// ----------------------------------------------------
// 3. LESSONS SECTION
// ----------------------------------------------------
function LessonsSection({ baseUrl }) {
  const { data: lessons = [], isLoading, refetch } = useGetLessonsQuery(baseUrl);
  const [createLesson, { isLoading: isCreating }] = useCreateLessonMutation();
  const [updateLesson, { isLoading: isUpdating }] = useUpdateLessonMutation();

  const [search, setSearch] = useState("");
  const [editingLesson, setEditingLesson] = useState(null);

  const filtered = lessons.filter(
    (l) =>
      l.title?.toLowerCase().includes(search.toLowerCase()) ||
      l.slug?.toLowerCase().includes(search.toLowerCase())
  );

  const handleSave = async (formData) => {
    if (editingLesson === "create") {
      await createLesson({ baseUrl, body: formData }).unwrap();
    } else {
      await updateLesson({ baseUrl, id: editingLesson.id, body: formData }).unwrap();
    }
    setEditingLesson(null);
  };

  return (
    <div>
      <div className="toolbar-card">
        <div className="search-input-wrapper">
          <Search size={16} className="text-muted" />
          <input
            type="text"
            placeholder="Search lessons..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex-center gap-2">
          <button className="btn-secondary" onClick={refetch}>
            <RefreshCw size={16} />
          </button>
          <button className="btn-primary" onClick={() => setEditingLesson("create")}>
            <Plus size={16} /> Add Lesson
          </button>
        </div>
      </div>

      <div className="panel-card mt-3">
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Title & Slug</th>
                <th>Duration</th>
                <th>Video Link</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={5} className="text-center py-6 text-muted">Loading lessons...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-6 text-muted">No lessons found.</td></tr>
              ) : (
                filtered.map((l) => (
                  <tr key={l.id}>
                    <td>
                      <div className="font-semibold">{l.title}</div>
                      <div className="text-muted font-mono text-xs">/{l.slug} · ID: {l.id}</div>
                    </td>
                    <td>
                      {l.durationMinutes ? (
                        <span className="flex-center gap-1 text-xs">
                          <Clock size={14} className="text-muted" /> {l.durationMinutes} min
                        </span>
                      ) : "—"}
                    </td>
                    <td>
                      {l.videoUrl ? (
                        <a
                          href={l.videoUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="flex-center gap-1 text-primary text-xs"
                        >
                          <ExternalLink size={12} /> Link
                        </a>
                      ) : "—"}
                    </td>
                    <td><span className={`status-pill pill-${l.status?.toLowerCase()}`}>{l.status}</span></td>
                    <td className="text-right">
                      <button className="btn-ghost-sm" onClick={() => setEditingLesson(l)}>
                        <Edit2 size={14} /> Edit
                      </button>
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

// ----------------------------------------------------
// MODALS
// ----------------------------------------------------
function CourseModal({ course, isLoading, onClose, onSave }) {
  const isEditing = !!course;
  const [title, setTitle] = useState(course?.title || "");
  const [slug, setSlug] = useState(course?.slug || "");
  const [shortDescription, setShortDescription] = useState(course?.shortDescription || "");
  const [description, setDescription] = useState(course?.description || "");
  const [status, setStatus] = useState(course?.status || "DRAFT");
  const [isActive, setIsActive] = useState(course?.isActive ?? true);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ title, slug, shortDescription, description, status, isActive });
  };

  return (
    <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-container">
        <div className="modal-header">
          <h2>{isEditing ? "Edit Course" : "Create Course"}</h2>
          <button className="btn-icon" onClick={onClose}><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group span-2">
              <label>Course Title *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (!isEditing) setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""));
                }}
                required
              />
            </div>
            <div className="form-group span-2">
              <label>Slug *</label>
              <input type="text" value={slug} onChange={(e) => setSlug(e.target.value)} required />
            </div>
            {isEditing && (
              <div className="form-group">
                <label>Status</label>
                <select value={status} onChange={(e) => setStatus(e.target.value)}>
                  <option value="DRAFT">DRAFT</option>
                  <option value="PUBLISHED">PUBLISHED</option>
                  <option value="ARCHIVED">ARCHIVED</option>
                </select>
              </div>
            )}
            <div className="form-group span-2">
              <label>Short Description</label>
              <input type="text" value={shortDescription} onChange={(e) => setShortDescription(e.target.value)} />
            </div>
            <div className="form-group span-2">
              <label>Full Description</label>
              <textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
          </div>
          <div className="modal-footer mt-4">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Course"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function CourseModulesModal({ course, baseUrl, onClose }) {
  const { data: allModules = [] } = useGetModulesQuery(baseUrl);
  const { data: attached = [], isFetching } = useGetCourseModulesQuery({ baseUrl, id: course.id });
  const [attachModule] = useAttachCourseModuleMutation();
  const [detachModule] = useDetachCourseModuleMutation();

  const [selectedModuleId, setSelectedModuleId] = useState("");
  const [position, setPosition] = useState(
    attached.length > 0 ? Math.max(...attached.map((m) => m.position || 0)) + 1 : 1
  );

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!selectedModuleId) return;
    try {
      await attachModule({ baseUrl, courseId: course.id, moduleId: selectedModuleId, position: Number(position) }).unwrap();
      setSelectedModuleId("");
      setPosition((p) => Number(p) + 1);
    } catch (err) {
      alert("Failed: " + (err?.data?.error || err.message));
    }
  };

  const handleRemove = async (moduleId) => {
    if (!window.confirm("Detach this module from the course?")) return;
    try {
      await detachModule({ baseUrl, courseId: course.id, moduleId }).unwrap();
    } catch (err) {
      alert("Failed: " + (err?.data?.error || err.message));
    }
  };

  const sorted = [...attached].sort((a, b) => (a.position || 0) - (b.position || 0));

  return (
    <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-container-large">
        <div className="modal-header">
          <div>
            <h2>Course Modules: {course.title}</h2>
            <p className="text-muted text-xs">Organize and sequence modules inside this course.</p>
          </div>
          <button className="btn-icon" onClick={onClose}><X size={20} /></button>
        </div>
        <div className="modal-body-scroll">
          <form onSubmit={handleAdd} className="inline-add-form">
            <div className="form-group flex-2">
              <label>Select Module</label>
              <select value={selectedModuleId} onChange={(e) => setSelectedModuleId(e.target.value)} required>
                <option value="">— Select Module to Attach —</option>
                {allModules.map((m) => (
                  <option key={m.id} value={m.id} disabled={attached.some((a) => a.moduleId === m.id)}>
                    {m.title} ({m.slug})
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group flex-1">
              <label>Position #</label>
              <input type="number" min="1" value={position} onChange={(e) => setPosition(Number(e.target.value))} required />
            </div>
            <button type="submit" className="btn-primary align-self-end mb-1" disabled={!selectedModuleId}>
              <Plus size={16} /> Link Module
            </button>
          </form>

          <div className="attached-items-list mt-3">
            {isFetching ? (
              <div className="py-4 text-center text-muted">Loading modules...</div>
            ) : sorted.length === 0 ? (
              <div className="empty-state-box">No modules linked to this course yet.</div>
            ) : (
              sorted.map((item) => {
                const mod = allModules.find((m) => m.id === item.moduleId);
                return (
                  <div key={item.moduleId} className="sequence-item-card">
                    <div className="sequence-badge">#{item.position}</div>
                    <div className="sequence-info">
                      <h4>{mod ? mod.title : item.moduleId}</h4>
                      <span className="text-muted text-xs font-mono">ID: {item.moduleId}</span>
                    </div>
                    <button className="btn-danger-icon" onClick={() => handleRemove(item.moduleId)}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn-primary" onClick={onClose}>Done</button>
        </div>
      </div>
    </div>
  );
}

function ModuleModal({ moduleItem, isLoading, onClose, onSave }) {
  const isEditing = !!moduleItem;
  const [title, setTitle] = useState(moduleItem?.title || "");
  const [slug, setSlug] = useState(moduleItem?.slug || "");
  const [description, setDescription] = useState(moduleItem?.description || "");
  const [status, setStatus] = useState(moduleItem?.status || "DRAFT");
  const [isActive, setIsActive] = useState(moduleItem?.isActive ?? true);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ title, slug, description, status, isActive });
  };

  return (
    <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-container">
        <div className="modal-header">
          <h2>{isEditing ? "Edit Module" : "Create Module"}</h2>
          <button className="btn-icon" onClick={onClose}><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group span-2">
              <label>Module Title *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (!isEditing) setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""));
                }}
                required
              />
            </div>
            <div className="form-group span-2">
              <label>Slug *</label>
              <input type="text" value={slug} onChange={(e) => setSlug(e.target.value)} required />
            </div>
            {isEditing && (
              <div className="form-group">
                <label>Status</label>
                <select value={status} onChange={(e) => setStatus(e.target.value)}>
                  <option value="DRAFT">DRAFT</option>
                  <option value="PUBLISHED">PUBLISHED</option>
                  <option value="ARCHIVED">ARCHIVED</option>
                </select>
              </div>
            )}
            <div className="form-group span-2">
              <label>Description</label>
              <textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
          </div>
          <div className="modal-footer mt-4">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Module"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ModuleLessonsModal({ moduleItem, baseUrl, onClose }) {
  const { data: allLessons = [] } = useGetLessonsQuery(baseUrl);
  const { data: attached = [], isFetching } = useGetModuleLessonsQuery({ baseUrl, id: moduleItem.id });
  const [attachLesson] = useAttachModuleLessonMutation();
  const [detachLesson] = useDetachModuleLessonMutation();

  const [selectedLessonId, setSelectedLessonId] = useState("");
  const [position, setPosition] = useState(
    attached.length > 0 ? Math.max(...attached.map((l) => l.position || 0)) + 1 : 1
  );

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!selectedLessonId) return;
    try {
      await attachLesson({ baseUrl, moduleId: moduleItem.id, lessonId: selectedLessonId, position: Number(position) }).unwrap();
      setSelectedLessonId("");
      setPosition((p) => Number(p) + 1);
    } catch (err) {
      alert("Failed: " + (err?.data?.error || err.message));
    }
  };

  const handleRemove = async (lessonId) => {
    if (!window.confirm("Detach this lesson from the module?")) return;
    try {
      await detachLesson({ baseUrl, moduleId: moduleItem.id, lessonId }).unwrap();
    } catch (err) {
      alert("Failed: " + (err?.data?.error || err.message));
    }
  };

  const sorted = [...attached].sort((a, b) => (a.position || 0) - (b.position || 0));

  return (
    <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-container-large">
        <div className="modal-header">
          <div>
            <h2>Module Lessons: {moduleItem.title}</h2>
            <p className="text-muted text-xs">Organize lesson sequences inside this module.</p>
          </div>
          <button className="btn-icon" onClick={onClose}><X size={20} /></button>
        </div>
        <div className="modal-body-scroll">
          <form onSubmit={handleAdd} className="inline-add-form">
            <div className="form-group flex-2">
              <label>Select Lesson</label>
              <select value={selectedLessonId} onChange={(e) => setSelectedLessonId(e.target.value)} required>
                <option value="">— Select Lesson to Attach —</option>
                {allLessons.map((l) => (
                  <option key={l.id} value={l.id} disabled={attached.some((a) => a.lessonId === l.id)}>
                    {l.title} ({l.slug})
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group flex-1">
              <label>Position #</label>
              <input type="number" min="1" value={position} onChange={(e) => setPosition(Number(e.target.value))} required />
            </div>
            <button type="submit" className="btn-primary align-self-end mb-1" disabled={!selectedLessonId}>
              <Plus size={16} /> Link Lesson
            </button>
          </form>

          <div className="attached-items-list mt-3">
            {isFetching ? (
              <div className="py-4 text-center text-muted">Loading lessons...</div>
            ) : sorted.length === 0 ? (
              <div className="empty-state-box">No lessons linked to this module yet.</div>
            ) : (
              sorted.map((item) => {
                const les = allLessons.find((l) => l.id === item.lessonId);
                return (
                  <div key={item.lessonId} className="sequence-item-card">
                    <div className="sequence-badge">#{item.position}</div>
                    <div className="sequence-info">
                      <h4>{les ? les.title : item.lessonId}</h4>
                      <span className="text-muted text-xs font-mono">
                        {les?.durationMinutes ? `${les.durationMinutes} mins · ` : ""}ID: {item.lessonId}
                      </span>
                    </div>
                    <button className="btn-danger-icon" onClick={() => handleRemove(item.lessonId)}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn-primary" onClick={onClose}>Done</button>
        </div>
      </div>
    </div>
  );
}

function LessonModal({ lesson, isLoading, onClose, onSave }) {
  const isEditing = !!lesson;
  const [title, setTitle] = useState(lesson?.title || "");
  const [slug, setSlug] = useState(lesson?.slug || "");
  const [videoUrl, setVideoUrl] = useState(lesson?.videoUrl || "");
  const [durationMinutes, setDurationMinutes] = useState(lesson?.durationMinutes?.toString() || "");
  const [description, setDescription] = useState(lesson?.description || "");
  const [content, setContent] = useState(lesson?.content || "");
  const [status, setStatus] = useState(lesson?.status || "DRAFT");
  const [isActive, setIsActive] = useState(lesson?.isActive ?? true);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      title,
      slug,
      videoUrl: videoUrl || null,
      durationMinutes: durationMinutes ? Number(durationMinutes) : null,
      description,
      content,
      status,
      isActive,
    });
  };

  return (
    <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-container-large">
        <div className="modal-header">
          <h2>{isEditing ? "Edit Lesson" : "Create Lesson"}</h2>
          <button className="btn-icon" onClick={onClose}><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group span-2">
              <label>Lesson Title *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (!isEditing) setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""));
                }}
                required
              />
            </div>
            <div className="form-group">
              <label>Slug *</label>
              <input type="text" value={slug} onChange={(e) => setSlug(e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Duration (Minutes)</label>
              <input
                type="number"
                min="0"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(e.target.value)}
                placeholder="e.g. 15"
              />
            </div>
            <div className="form-group span-2">
              <label>Video URL (Stream / YouTube / Vimeo / MP4)</label>
              <input
                type="url"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="https://..."
              />
            </div>
            {isEditing && (
              <div className="form-group">
                <label>Status</label>
                <select value={status} onChange={(e) => setStatus(e.target.value)}>
                  <option value="DRAFT">DRAFT</option>
                  <option value="PUBLISHED">PUBLISHED</option>
                  <option value="ARCHIVED">ARCHIVED</option>
                </select>
              </div>
            )}
            <div className="form-group span-2">
              <label>Short Description</label>
              <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
            <div className="form-group span-2">
              <label>Lesson Content / Markdown Body</label>
              <textarea
                rows={5}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Notes, transcript, or markdown reading material..."
              />
            </div>
          </div>
          <div className="modal-footer mt-4">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Lesson"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
