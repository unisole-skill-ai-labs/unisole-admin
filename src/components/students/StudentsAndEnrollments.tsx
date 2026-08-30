import React, { useState } from "react";
import {
  useGetStudentsQuery,
  useCreateStudentMutation,
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
  Phone,
  Calendar,
} from "lucide-react";
import Badge from "../ui/Badge";
import Button from "../ui/Button";
import Modal from "../ui/Modal";
import Input from "../ui/Input";

interface StudentsAndEnrollmentsProps {
  baseUrl: string;
}

export default function StudentsAndEnrollments({ baseUrl }: StudentsAndEnrollmentsProps) {
  const [activeTab, setActiveTab] = useState<"students" | "enrollments">("students");

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">
            Learners & Pathway Enrollments
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium mt-1">
            Manage student accounts, roles, access permissions, and pathway enrollments
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-zinc-100 dark:bg-zinc-900 rounded-2xl w-fit border border-zinc-200/80 dark:border-zinc-800">
        <button
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === "students"
              ? "bg-white dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 shadow-sm"
              : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
          }`}
          onClick={() => setActiveTab("students")}
        >
          <Users className="w-4 h-4" /> Learners & Accounts
        </button>
        <button
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === "enrollments"
              ? "bg-white dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 shadow-sm"
              : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
          }`}
          onClick={() => setActiveTab("enrollments")}
        >
          <GraduationCap className="w-4 h-4" /> Pathway Enrollments
        </button>
      </div>

      <div>
        {activeTab === "students" && <StudentsSection baseUrl={baseUrl} />}
        {activeTab === "enrollments" && <EnrollmentsSection baseUrl={baseUrl} />}
      </div>
    </div>
  );
}

// ─── 1. STUDENTS SECTION ───────────────────────────────────────────────────────
function StudentsSection({ baseUrl }: { baseUrl: string }) {
  const { data: students = [], isLoading, refetch } = useGetStudentsQuery(baseUrl);
  const [createStudent, { isLoading: isCreating }] = useCreateStudentMutation();
  const [updateStudent, { isLoading: isUpdating }] = useUpdateStudentMutation();
  const [deactivateStudent, { isLoading: isDeactivating }] = useDeactivateStudentMutation();

  const [search, setSearch] = useState("");
  const [sourceFilter, setSourceFilter] = useState<string>("ALL");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<any>(null);

  const filtered = students.filter((s: any) => {
    const matchesSearch =
      s.name?.toLowerCase().includes(search.toLowerCase()) ||
      s.phone?.includes(search) ||
      s.id?.toLowerCase().includes(search.toLowerCase()) ||
      s.collegeName?.toLowerCase().includes(search.toLowerCase()) ||
      s.branch?.toLowerCase().includes(search.toLowerCase()) ||
      s.signupSessionCode?.toLowerCase().includes(search.toLowerCase());

    const matchesSource =
      sourceFilter === "ALL" ||
      (sourceFilter === "PAMPHLET_QR" && (s.signupSource === "PAMPHLET_QR" || s.signupSource === "PAMPHLET")) ||
      (sourceFilter === "SESSION_QR" && (s.signupSource === "SESSION_QR" || !!s.signupSessionCode)) ||
      (sourceFilter === "NON_PAMPHLET" && (s.signupSource === "NON_PAMPHLET" || !s.signupSource));

    return matchesSearch && matchesSource;
  });

  const handleCreate = async (formData: any) => {
    try {
      await createStudent({ baseUrl, body: formData }).unwrap();
      setIsCreateModalOpen(false);
    } catch (err: any) {
      alert("Failed to create user: " + (err?.data?.error || err.message));
    }
  };

  const handleDeactivate = async (student: any) => {
    if (!window.confirm(`Deactivate account for ${student.name || student.phone}?`)) return;
    try {
      await deactivateStudent({ baseUrl, id: student.id }).unwrap();
    } catch (err: any) {
      alert("Failed to deactivate: " + (err?.data?.error || err.message));
    }
  };

  const handleSave = async (formData: any) => {
    try {
      await updateStudent({ baseUrl, id: editingStudent.id, body: formData }).unwrap();
      setEditingStudent(null);
    } catch (err: any) {
      alert("Failed to update student: " + (err?.data?.error || err.message));
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-3 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl shadow-xs">
        <div className="flex flex-col sm:flex-row items-center gap-2 flex-1">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Search by name, phone, session, college..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-hidden"
            />
          </div>

          {/* Source filter tabs */}
          <div className="flex items-center gap-1 p-1 bg-zinc-100 dark:bg-zinc-800/80 rounded-xl border border-zinc-200/60 dark:border-zinc-700/60 text-xs w-full sm:w-auto overflow-x-auto">
            {[
              { id: "ALL", label: "All Sources" },
              { id: "PAMPHLET_QR", label: "📰 Pamphlet QR" },
              { id: "SESSION_QR", label: "🏛️ Session QR" },
              { id: "NON_PAMPHLET", label: "🌐 Organic Web" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSourceFilter(tab.id)}
                className={`px-2.5 py-1 rounded-lg font-bold transition-colors whitespace-nowrap cursor-pointer text-[11px] ${
                  sourceFilter === tab.id
                    ? "bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-xs"
                    : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <Button variant="secondary" size="sm" onClick={refetch} icon={RefreshCw}>
            Refresh
          </Button>
          <Button variant="primary" size="sm" onClick={() => setIsCreateModalOpen(true)} icon={Plus}>
            Add User / Admin
          </Button>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/50 text-zinc-400 font-mono">
                <th className="py-3 px-4 font-semibold">Learner Info</th>
                <th className="py-3 px-4 font-semibold">Mobile Number</th>
                <th className="py-3 px-4 font-semibold">Acquisition Source</th>
                <th className="py-3 px-4 font-semibold">Campus & Branch</th>
                <th className="py-3 px-4 font-semibold">Role</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
              {isLoading ? (
                <tr><td colSpan={7} className="py-8 text-center text-zinc-400">Loading student accounts...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} className="py-8 text-center text-zinc-400">No learners found.</td></tr>
              ) : (
                filtered.map((s: any) => (
                  <tr key={s.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/40">
                    <td className="py-3.5 px-4">
                      <div className="font-extrabold text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-400 flex items-center justify-center text-[10px] font-bold">
                          {(s.name || s.phone || "S").charAt(0).toUpperCase()}
                        </div>
                        <span>{s.name || "Student"}</span>
                      </div>
                      <div className="text-[11px] text-zinc-400 font-mono mt-0.5">ID: {s.id}</div>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-semibold text-zinc-700 dark:text-zinc-300">
                      {s.phone ? `+91 ${s.phone}` : "—"}
                    </td>
                    <td className="py-3.5 px-4">
                      {s.signupSource === "PAMPHLET_QR" || s.signupSource === "PAMPHLET" ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 font-mono">
                          📰 Pamphlet QR
                        </span>
                      ) : s.signupSource === "SESSION_QR" || s.signupSessionCode ? (
                        <div className="space-y-0.5">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 font-mono">
                            🏛️ Session QR
                          </span>
                          {s.signupSessionCode && (
                            <div className="text-[10px] font-mono text-zinc-400">
                              Code: <strong className="text-zinc-700 dark:text-zinc-300">{s.signupSessionCode}</strong>
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700 font-mono">
                          🌐 Organic Web
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate max-w-[180px]">
                        {s.collegeName || s.signupCollegeName || "—"}
                      </div>
                      <div className="text-[11px] text-zinc-400 font-mono truncate max-w-[180px]">
                        {s.branch || "General"}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge variant={s.role === "ADMIN" ? "rose" : "brand"} size="sm">
                        {s.role || "STUDENT"}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`text-[10px] font-bold ${s.isActive !== false ? "text-emerald-500" : "text-rose-500"}`}>
                        {s.isActive !== false ? "ACTIVE" : "DEACTIVATED"}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button variant="ghost" size="sm" onClick={() => setEditingStudent(s)} icon={Edit2} />
                        <Button variant="ghost" size="sm" onClick={() => handleDeactivate(s)} icon={UserX} className="text-rose-500 hover:text-rose-700" />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isCreateModalOpen && (
        <CreateUserModal
          isLoading={isCreating}
          onClose={() => setIsCreateModalOpen(false)}
          onSave={handleCreate}
        />
      )}

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

// ─── 2. ENROLLMENTS SECTION ───────────────────────────────────────────────────
function EnrollmentsSection({ baseUrl }: { baseUrl: string }) {
  const { data: enrollments = [], isLoading, refetch } = useGetEnrollmentsQuery(baseUrl);
  const { data: students = [] } = useGetStudentsQuery(baseUrl);
  const { data: pathways = [] } = useGetPathwaysQuery(baseUrl);
  const [createEnrollment, { isLoading: isCreating }] = useCreateEnrollmentMutation();
  const [updateEnrollment, { isLoading: isUpdating }] = useUpdateEnrollmentMutation();

  const [search, setSearch] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingEnrollment, setEditingEnrollment] = useState<any>(null);

  const filtered = enrollments.filter(
    (e: any) =>
      e.userId?.toLowerCase().includes(search.toLowerCase()) ||
      e.pathwayId?.toLowerCase().includes(search.toLowerCase()) ||
      e.id?.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = async (formData: any) => {
    await createEnrollment({ baseUrl, body: formData }).unwrap();
    setShowCreateModal(false);
  };

  const handleUpdate = async (formData: any) => {
    await updateEnrollment({ baseUrl, id: editingEnrollment.id, body: formData }).unwrap();
    setEditingEnrollment(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl shadow-xs">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Search by learner ID or pathway ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-hidden"
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button variant="secondary" size="sm" onClick={refetch} icon={RefreshCw}>
            Refresh
          </Button>
          <Button variant="primary" size="sm" onClick={() => setShowCreateModal(true)} icon={Plus}>
            Grant Enrollment
          </Button>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/50 text-zinc-400 font-mono">
                <th className="py-3 px-4 font-semibold">Learner Name & ID</th>
                <th className="py-3 px-4 font-semibold">Enrolled Pathway</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold">Enrolled Date</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
              {isLoading ? (
                <tr><td colSpan={5} className="py-8 text-center text-zinc-400">Loading pathway enrollments...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={5} className="py-8 text-center text-zinc-400">No enrollments recorded yet.</td></tr>
              ) : (
                filtered.map((e: any) => {
                  const student = students.find((s: any) => s.id === e.userId);
                  const pathway = pathways.find((p: any) => p.id === e.pathwayId);
                  return (
                    <tr key={e.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/40">
                      <td className="py-3.5 px-4">
                        <div className="font-extrabold text-sm text-zinc-900 dark:text-zinc-100">
                          {student ? student.name : "Learner"}
                        </div>
                        <div className="text-[11px] text-zinc-400 font-mono mt-0.5">
                          {e.userId} · {student?.phone ? `+91 ${student.phone}` : ""}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-extrabold text-sm text-zinc-900 dark:text-zinc-100">
                          {pathway ? pathway.title : e.pathwayId}
                        </div>
                        <div className="text-[11px] text-zinc-400 font-mono mt-0.5">ID: {e.pathwayId}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge variant={e.status === "ACTIVE" ? "emerald" : "default"} size="sm">
                          {e.status}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 text-zinc-400 font-mono text-[11px]">
                        {e.enrolledAt ? new Date(e.enrolledAt).toLocaleDateString("en-IN") : "—"}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Button variant="ghost" size="sm" onClick={() => setEditingEnrollment(e)} icon={Edit2} />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showCreateModal && (
        <CreateEnrollmentModal
          students={students}
          pathways={pathways}
          isLoading={isCreating}
          onClose={() => setShowCreateModal(false)}
          onSave={handleCreate}
        />
      )}

      {editingEnrollment && (
        <EditEnrollmentModal
          enrollment={editingEnrollment}
          isLoading={isUpdating}
          onClose={() => setEditingEnrollment(null)}
          onSave={handleUpdate}
        />
      )}
    </div>
  );
}

function StudentModal({ student, isLoading, onClose, onSave }: any) {
  const [name, setName] = useState(student?.name || "");
  const [phone, setPhone] = useState(student?.phone || "");
  const [role, setRole] = useState(student?.role || "STUDENT");

  return (
    <Modal isOpen={true} onClose={onClose} title="Edit Learner Account" maxWidth="max-w-md">
      <form onSubmit={(e) => { e.preventDefault(); onSave({ name, phone, role }); }} className="space-y-4">
        <Input label="Learner Full Name" value={name} onChange={(e) => setName(e.target.value)} />
        <Input label="Phone Number" value={phone} onChange={(e) => setPhone(e.target.value)} required />
        <div>
          <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">User Role</label>
          <select value={role} onChange={(e) => setRole(e.target.value)} className="w-full px-3.5 py-2.5 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-semibold">
            <option value="STUDENT">STUDENT</option>
            <option value="ADMIN">ADMIN</option>
          </select>
        </div>
        <div className="pt-2 flex justify-end gap-2 border-t border-zinc-100 dark:border-zinc-800">
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="primary" size="sm" loading={isLoading}>Update Account</Button>
        </div>
      </form>
    </Modal>
  );
}

function CreateEnrollmentModal({ students, pathways, isLoading, onClose, onSave }: any) {
  const [userId, setUserId] = useState("");
  const [pathwayId, setPathwayId] = useState("");

  return (
    <Modal isOpen={true} onClose={onClose} title="Grant Pathway Access" maxWidth="max-w-md">
      <form onSubmit={(e) => { e.preventDefault(); onSave({ userId, pathwayId }); }} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">Select Learner</label>
          <select value={userId} onChange={(e) => setUserId(e.target.value)} className="w-full px-3.5 py-2.5 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs" required>
            <option value="">Choose learner account...</option>
            {students.map((s: any) => <option key={s.id} value={s.id}>{s.name || "Learner"} (+91 {s.phone})</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">Select Pathway</label>
          <select value={pathwayId} onChange={(e) => setPathwayId(e.target.value)} className="w-full px-3.5 py-2.5 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs" required>
            <option value="">Choose pathway curriculum...</option>
            {pathways.map((p: any) => <option key={p.id} value={p.id}>{p.title} (/{p.slug})</option>)}
          </select>
        </div>
        <div className="pt-2 flex justify-end gap-2 border-t border-zinc-100 dark:border-zinc-800">
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="primary" size="sm" loading={isLoading}>Grant Access</Button>
        </div>
      </form>
    </Modal>
  );
}

function EditEnrollmentModal({ enrollment, isLoading, onClose, onSave }: any) {
  const [status, setStatus] = useState(enrollment?.status || "ACTIVE");

  return (
    <Modal isOpen={true} onClose={onClose} title="Update Enrollment Status" maxWidth="max-w-md">
      <form onSubmit={(e) => { e.preventDefault(); onSave({ status }); }} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">Enrollment Status</label>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full px-3.5 py-2.5 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-semibold">
            <option value="ACTIVE">ACTIVE</option>
            <option value="EXPIRED">EXPIRED</option>
            <option value="CANCELLED">CANCELLED</option>
          </select>
        </div>
        <div className="pt-2 flex justify-end gap-2 border-t border-zinc-100 dark:border-zinc-800">
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="primary" size="sm" loading={isLoading}>Update Status</Button>
        </div>
      </form>
    </Modal>
  );
}

function CreateUserModal({ isLoading, onClose, onSave }: any) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("+91");
  const [role, setRole] = useState("STUDENT");
  const [isActive, setIsActive] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ name: name.trim() || undefined, phone: phone.trim(), role, isActive });
  };

  return (
    <Modal isOpen={true} onClose={onClose} title="Add New User / Admin" maxWidth="max-w-md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Full Name"
          placeholder="e.g. Rahul Sharma"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <div>
          <Input
            label="Mobile Number *"
            type="tel"
            placeholder="+919876543210"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />
          <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-1">
            E.164 format with country code (e.g. +919876543210)
          </p>
        </div>
        <div>
          <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
            System Role *
          </label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-semibold"
          >
            <option value="STUDENT">STUDENT (Learner)</option>
            <option value="MEMBER">MEMBER (Team Associate)</option>
            <option value="ADMIN">ADMIN (Platform Manager)</option>
            <option value="SUPER_ADMIN">SUPER_ADMIN (Co-Founder)</option>
          </select>
        </div>
        <div className="flex items-center gap-2 pt-1">
          <input
            type="checkbox"
            id="newUserActive"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="rounded border-zinc-300 dark:border-zinc-700 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
          />
          <label htmlFor="newUserActive" className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 cursor-pointer">
            Account Active immediately
          </label>
        </div>
        <div className="pt-2 flex justify-end gap-2 border-t border-zinc-100 dark:border-zinc-800">
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm" loading={isLoading} disabled={!phone}>
            Create Account
          </Button>
        </div>
      </form>
    </Modal>
  );
}
