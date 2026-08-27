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
} from "lucide-react";

export default function PathwayBuilderModal({ pathway, baseUrl, onClose }) {
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
      ? Math.max(...attachedCourses.map((c) => c.position || 0)) + 1
      : 1
  );
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [selectedCollegeId, setSelectedCollegeId] = useState("");
  const [notice, setNotice] = useState(null);

  const showNotification = (msg, type = "success") => {
    setNotice({ msg, type });
    setTimeout(() => setNotice(null), 4000);
  };

  const handleAddCourse = async (e) => {
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
      setCoursePosition((prev) => Number(prev) + 1);
    } catch (err) {
      showNotification(err?.data?.error || err?.data?.message || "Failed to link course", "error");
    }
  };

  const handleRemoveCourse = async (courseId) => {
    if (!window.confirm("Remove this course from the pathway?")) return;
    try {
      await detachCourse({
        baseUrl,
        pathwayId: pathway.id,
        courseId,
      }).unwrap();
      showNotification("Course detached.");
    } catch (err) {
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
    } catch (err) {
      showNotification(err?.data?.error || "Failed to attach category", "error");
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
      showNotification("College attached.");
      setSelectedCollegeId("");
    } catch (err) {
      showNotification(err?.data?.error || "Failed to attach college", "error");
    }
  };

  // Sort attached courses by position
  const sortedAttachedCourses = [...attachedCourses].sort(
    (a, b) => (a.position || 0) - (b.position || 0)
  );

  return (
    <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-container-large">
        <div className="modal-header">
          <div>
            <div className="flex-center gap-2">
              <Layers className="text-primary" size={22} />
              <h2>Pathway Builder: {pathway.title}</h2>
            </div>
            <p className="text-muted text-xs mt-1">
              Configure curriculum sequence, linked categories, and affiliated colleges.
            </p>
          </div>
          <button className="btn-icon" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {notice && (
          <div className={`alert-banner ${notice.type === "error" ? "alert-error" : "alert-success"}`}>
            {notice.type === "error" ? <AlertCircle size={16} /> : <Check size={16} />}
            <span>{notice.msg}</span>
          </div>
        )}

        <div className="modal-body-scroll">
          {/* Section 1: Attached Courses Sequence */}
          <div className="builder-section">
            <div className="section-title-row">
              <div className="flex-center gap-2">
                <BookOpen size={18} className="text-primary" />
                <h3>Curriculum Courses Sequence</h3>
              </div>
              <span className="badge-count">{attachedCourses.length} Courses Linked</span>
            </div>

            {/* Add Course Form */}
            <form onSubmit={handleAddCourse} className="inline-add-form">
              <div className="form-group flex-2">
                <label>Select Course</label>
                <select
                  value={selectedCourseId}
                  onChange={(e) => setSelectedCourseId(e.target.value)}
                  required
                >
                  <option value="">— Choose a Course to attach —</option>
                  {allCourses.map((c) => {
                    const isAlreadyAttached = attachedCourses.some((ac) => ac.courseId === c.id);
                    return (
                      <option key={c.id} value={c.id} disabled={isAlreadyAttached}>
                        {c.title} ({c.slug}) {isAlreadyAttached ? "— [Already Linked]" : ""}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div className="form-group flex-1">
                <label>Sequence Position #</label>
                <input
                  type="number"
                  min="1"
                  value={coursePosition}
                  onChange={(e) => setCoursePosition(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                className="btn-primary flex-center gap-1 align-self-end mb-1"
                disabled={isAttachingCourse || !selectedCourseId}
              >
                {isAttachingCourse ? <RefreshCw size={16} className="spin" /> : <Plus size={16} />}
                Add to Pathway
              </button>
            </form>

            {/* Courses List */}
            <div className="attached-items-list mt-3">
              {isCoursesLoading ? (
                <div className="py-4 text-center text-muted">Loading curriculum...</div>
              ) : sortedAttachedCourses.length === 0 ? (
                <div className="empty-state-box">
                  <BookOpen size={32} className="text-muted mb-2" />
                  <p>No courses attached to this pathway yet.</p>
                  <small>Use the dropdown above to add courses in ordered sequence.</small>
                </div>
              ) : (
                sortedAttachedCourses.map((item) => {
                  const courseDetail = allCourses.find((c) => c.id === item.courseId);
                  return (
                    <div key={item.courseId} className="sequence-item-card">
                      <div className="sequence-badge">#{item.position}</div>
                      <div className="sequence-info">
                        <h4>{courseDetail ? courseDetail.title : `Course: ${item.courseId}`}</h4>
                        <span className="text-muted text-xs font-mono">
                          ID: {item.courseId} · Status: {courseDetail?.status || "DRAFT"}
                        </span>
                      </div>
                      <button
                        className="btn-danger-icon"
                        title="Remove Course"
                        onClick={() => handleRemoveCourse(item.courseId)}
                        disabled={isDetachingCourse}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Section 2: Linked Categories & Colleges */}
          <div className="grid-2-col mt-4">
            {/* Categories Box */}
            <div className="builder-section">
              <div className="flex-center gap-2 mb-2">
                <Tag size={18} className="text-primary" />
                <h3>Affiliated Categories</h3>
              </div>

              <div className="inline-add-row">
                <select
                  value={selectedCategoryId}
                  onChange={(e) => setSelectedCategoryId(e.target.value)}
                  className="flex-1"
                >
                  <option value="">— Attach Category —</option>
                  {allCategories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={handleAddCategory}
                  disabled={isAttachingCat || !selectedCategoryId}
                >
                  Attach
                </button>
              </div>

              <p className="text-muted text-xs mt-2">
                Categories help students filter and discover this pathway.
              </p>
            </div>

            {/* Colleges Box */}
            <div className="builder-section">
              <div className="flex-center gap-2 mb-2">
                <GraduationCap size={18} className="text-primary" />
                <h3>Target Colleges / Universities</h3>
              </div>

              <div className="inline-add-row">
                <select
                  value={selectedCollegeId}
                  onChange={(e) => setSelectedCollegeId(e.target.value)}
                  className="flex-1"
                >
                  <option value="">— Attach College —</option>
                  {allColleges.map((clg) => (
                    <option key={clg.id} value={clg.id}>
                      {clg.name} ({clg.shortName || clg.slug})
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={handleAddCollege}
                  disabled={isAttachingClg || !selectedCollegeId}
                >
                  Attach
                </button>
              </div>

              <p className="text-muted text-xs mt-2">
                Map specific colleges that offer or recommend this learning pathway.
              </p>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-primary" onClick={onClose}>
            Done / Close Builder
          </button>
        </div>
      </div>
    </div>
  );
}
