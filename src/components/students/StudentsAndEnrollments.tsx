import React, { useState } from "react";
import {
  useGetStudentsQuery,
  useUpdateStudentMutation,
  useDeactivateStudentMutation,
  useGetEnrollmentsQuery,
  useCreateEnrollmentMutation,
  useUpdateEnrollmentMutation,
  useGetPathwaysQuery,
} from "../../store";
import {
  Users,
  GraduationCap,
  Plus,
  Edit2,
  UserX,
  Search,
  CheckCircle,
  XCircle,
  Shield,
  X,
  RefreshCw,
} from "lucide-react";

export default function StudentsAndEnrollments({ baseUrl }) {
  const [activeTab, setActiveTab] = useState("students"); // 'students' | 'enrollments'

  return (
    <div className="view-container">
      <div className="section-header">
        <div>
          <h2>Learners & Pathway Enrollments</h2>
          <p className="text-muted">
            Manage user accounts, roles, access rights, and pathway enrollments.
          </p>
        </div>
      </div>

      <div className="tabs-nav">
        <button
          className={`tab-btn ${activeTab === "students" ? "active" : ""}`}
          onClick={() => setActiveTab("students")}
        >
          <Users size={16} /> Learners & Accounts
        </button>
        <button
          className={`tab-btn ${activeTab === "enrollments" ? "active" : ""}`}
          onClick={() => setActiveTab("enrollments")}
        >
          <GraduationCap size={16} /> Pathway Enrollments
        </button>
      </div>

      <div className="tab-content mt-3">
        {activeTab === "students" && <StudentsSection baseUrl={baseUrl} />}
        {activeTab === "enrollments" && <EnrollmentsSection baseUrl={baseUrl} />}
      </div>
    </div>
  );
}

// ----------------------------------------------------
// 1. STUDENTS SECTION
// ----------------------------------------------------
function StudentsSection({ baseUrl }) {
  const { data: students = [], isLoading, refetch } = useGetStudentsQuery(baseUrl);
  const [updateStudent, { isLoading: isUpdating }] = useUpdateStudentMutation();
  const [deactivateStudent, { isLoading: isDeactivating }] = useDeactivateStudentMutation();

  const [search, setSearch] = useState("");
  const [editingStudent, setEditingStudent] = useState(null);

  const filtered = students.filter(
    (s) =>
      s.name?.toLowerCase().includes(search.toLowerCase()) ||
      s.phone?.includes(search) ||
      s.id?.toLowerCase().includes(search.toLowerCase())
  );

  const handleDeactivate = async (student) => {
    if (!window.confirm(`Deactivate account for ${student.name || student.phone}?`)) return;
    try {
      await deactivateStudent({ baseUrl, id: student.id }).unwrap();
    } catch (err) {
      alert("Failed to deactivate: " + (err?.data?.error || err.message));
    }
  };

  const handleSave = async (formData) => {
    try {
      await updateStudent({ baseUrl, id: editingStudent.id, body: formData }).unwrap();
      setEditingStudent(null);
    } catch (err) {
      alert("Failed to update student: " + (err?.data?.error || err.message));
    }
  };

  return (
    <div>
      <div className="toolbar-card">
        <div className="search-input-wrapper">
          <Search size={16} className="text-muted" />
          <input
            type="text"
            placeholder="Search learners by name, phone (+91...), or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex-center gap-2">
          <button className="btn-secondary" onClick={refetch}>
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      <div className="panel-card mt-3">
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Learner Name & ID</th>
                <th>Phone</th>
                <th>System Role</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={5} className="text-center py-6 text-muted">Loading learners...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-6 text-muted">No learners found.</td></tr>
              ) : (
                filtered.map((s) => (
                  <tr key={s.id}>
                    <td>
                      <div className="font-semibold">{s.name || "Learner"}</div>
                      <div className="text-muted font-mono text-xs">ID: {s.id}</div>
                    </td>
                    <td className="font-mono text-xs">{s.phone}</td>
                    <td>
                      <span className={`status-pill ${s.role === "ADMIN" ? "pill-admin" : "pill-student"}`}>
                        {s.role === "ADMIN" ? <Shield size={12} className="inline mr-1" /> : null}
                        {s.role}
                      </span>
                    </td>
                    <td>
                      {s.isActive ? (
                        <span className="status-pill pill-active">Active</span>
                      ) : (
                        <span className="status-pill pill-inactive">Deactivated</span>
                      )}
                    </td>
                    <td className="text-right">
                      <div className="flex-end gap-1">
                        <button className="btn-ghost-sm" onClick={() => setEditingStudent(s)} title="Edit">
                          <Edit2 size={14} />
                        </button>
                        {s.isActive && s.role !== "ADMIN" && (
                          <button
                            className="btn-danger-sm"
                            onClick={() => handleDeactivate(s)}
                            disabled={isDeactivating}
                            title="Deactivate account"
                          >
                            <UserX size={14} /> Deactivate
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {editingStudent && (
        <StudentModal
          student={editingStudent}
          isLoading={isUpdating}
          onClose={() => setEditingStudent(null)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}

// ----------------------------------------------------
// 2. ENROLLMENTS SECTION
// ----------------------------------------------------
function EnrollmentsSection({ baseUrl }) {
  const { data: enrollments = [], isLoading, refetch } = useGetEnrollmentsQuery(baseUrl);
  const { data: students = [] } = useGetStudentsQuery(baseUrl);
  const { data: pathways = [] } = useGetPathwaysQuery(baseUrl);
  const [createEnrollment, { isLoading: isCreating }] = useCreateEnrollmentMutation();
  const [updateEnrollment, { isLoading: isUpdating }] = useUpdateEnrollmentMutation();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [isGrantModalOpen, setIsGrantModalOpen] = useState(false);
  const [editingEnrollment, setEditingEnrollment] = useState(null);

  const filtered = enrollments.filter((e) => {
    const matchesStatus = statusFilter === "ALL" || e.status === statusFilter;
    const matchesSearch =
      e.userId?.toLowerCase().includes(search.toLowerCase()) ||
      e.pathwayId?.toLowerCase().includes(search.toLowerCase()) ||
      e.id?.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleGrant = async (formData) => {
    try {
      await createEnrollment({ baseUrl, body: formData }).unwrap();
      setIsGrantModalOpen(false);
    } catch (err) {
      alert("Failed to grant enrollment: " + (err?.data?.error || err.message));
    }
  };

  const handleSave = async (formData) => {
    try {
      await updateEnrollment({ baseUrl, id: editingEnrollment.id, body: formData }).unwrap();
      setEditingEnrollment(null);
    } catch (err) {
      alert("Failed to update enrollment: " + (err?.data?.error || err.message));
    }
  };

  return (
    <div>
      <div className="toolbar-card">
        <div className="search-input-wrapper">
          <Search size={16} className="text-muted" />
          <input
            type="text"
            placeholder="Search by Learner ID or Pathway ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="filter-select"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">ACTIVE</option>
            <option value="PENDING">PENDING</option>
            <option value="EXPIRED">EXPIRED</option>
            <option value="CANCELLED">CANCELLED</option>
          </select>
          <button className="btn-secondary" onClick={refetch}>
            <RefreshCw size={16} />
          </button>
          <button className="btn-primary" onClick={() => setIsGrantModalOpen(true)}>
            <Plus size={16} /> Grant Enrollment
          </button>
        </div>
      </div>

      <div className="panel-card mt-3">
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Enrollment ID</th>
                <th>Learner</th>
                <th>Pathway</th>
                <th>Status</th>
                <th>Enrolled At</th>
                <th>Expires At</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={7} className="text-center py-6 text-muted">Loading enrollments...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-6 text-muted">No enrollments match the filter.</td></tr>
              ) : (
                filtered.map((e) => {
                  const student = students.find((s) => s.id === e.userId);
                  const pathway = pathways.find((p) => p.id === e.pathwayId);
                  return (
                    <tr key={e.id}>
                      <td className="font-mono text-xs font-semibold">{e.id}</td>
                      <td>
                        <div className="font-semibold">{student ? student.name : "Learner"}</div>
                        <div className="text-muted font-mono text-xs">{e.userId} · {student?.phone}</div>
                      </td>
                      <td>
                        <div className="font-semibold">{pathway ? pathway.title : "Pathway"}</div>
                        <div className="text-muted font-mono text-xs">{e.pathwayId}</div>
                      </td>
                      <td>
                        <span className={`status-pill pill-${e.status?.toLowerCase()}`}>{e.status}</span>
                      </td>
                      <td className="text-muted text-xs">
                        {e.enrolledAt ? new Date(e.enrolledAt).toLocaleDateString() : "—"}
                      </td>
                      <td className="text-muted text-xs">
                        {e.expiresAt ? new Date(e.expiresAt).toLocaleDateString() : "Never"}
                      </td>
                      <td className="text-right">
                        <button className="btn-ghost-sm" onClick={() => setEditingEnrollment(e)}>
                          <Edit2 size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isGrantModalOpen && (
        <GrantEnrollmentModal
          students={students}
          pathways={pathways}
          isLoading={isCreating}
          onClose={() => setIsGrantModalOpen(false)}
          onSave={handleGrant}
        />
      )}

      {editingEnrollment && (
        <EditEnrollmentModal
          enrollment={editingEnrollment}
          isLoading={isUpdating}
          onClose={() => setEditingEnrollment(null)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}

// ----------------------------------------------------
// MODALS
// ----------------------------------------------------
function StudentModal({ student, isLoading, onClose, onSave }) {
  const [name, setName] = useState(student.name || "");
  const [phone, setPhone] = useState(student.phone || "");
  const [role, setRole] = useState(student.role || "STUDENT");
  const [isActive, setIsActive] = useState(student.isActive ?? true);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ name, phone, role, isActive });
  };

  return (
    <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-container">
        <div className="modal-header">
          <h2>Edit Learner Profile</h2>
          <button className="btn-icon" onClick={onClose}><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group span-2">
              <label>Full Name *</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="form-group span-2">
              <label>Mobile Number *</label>
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required />
            </div>
            <div className="form-group span-2">
              <label>Role</label>
              <select value={role} onChange={(e) => setRole(e.target.value)}>
                <option value="STUDENT">STUDENT</option>
                <option value="ADMIN">ADMIN</option>
              </select>
            </div>
            <div className="form-group span-2 checkbox-row">
              <input type="checkbox" id="userActive" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
              <label htmlFor="userActive">Account Active</label>
            </div>
          </div>
          <div className="modal-footer mt-4">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function GrantEnrollmentModal({ students, pathways, isLoading, onClose, onSave }) {
  const [userId, setUserId] = useState("");
  const [pathwayId, setPathwayId] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ userId, pathwayId });
  };

  return (
    <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-container">
        <div className="modal-header">
          <h2>Grant Manual Enrollment</h2>
          <button className="btn-icon" onClick={onClose}><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group span-2">
              <label>Select Learner *</label>
              <select value={userId} onChange={(e) => setUserId(e.target.value)} required>
                <option value="">— Choose Learner —</option>
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.phone}) · ID: {s.id}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group span-2">
              <label>Select Pathway *</label>
              <select value={pathwayId} onChange={(e) => setPathwayId(e.target.value)} required>
                <option value="">— Choose Pathway —</option>
                {pathways.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title} ({p.status})
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="modal-footer mt-4">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={isLoading || !userId || !pathwayId}>
              {isLoading ? "Granting..." : "Grant Access"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function EditEnrollmentModal({ enrollment, isLoading, onClose, onSave }) {
  const [status, setStatus] = useState(enrollment.status || "ACTIVE");
  const [expiresAt, setExpiresAt] = useState(enrollment.expiresAt || "");

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ status, expiresAt: expiresAt || null });
  };

  return (
    <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-container">
        <div className="modal-header">
          <h2>Update Enrollment #{enrollment.id}</h2>
          <button className="btn-icon" onClick={onClose}><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group span-2">
              <label>Enrollment Status</label>
              <select value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="ACTIVE">ACTIVE</option>
                <option value="PENDING">PENDING</option>
                <option value="EXPIRED">EXPIRED</option>
                <option value="CANCELLED">CANCELLED</option>
              </select>
            </div>
            <div className="form-group span-2">
              <label>Expiry Date (ISO)</label>
              <input
                type="text"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                placeholder="YYYY-MM-DD or leave empty for lifetime"
              />
            </div>
          </div>
          <div className="modal-footer mt-4">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Enrollment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
