import React, { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  useGetCollegesQuery,
  useUpdateCollegeMutation,
  useDeleteCollegeMutation,
  useGetBranchesQuery,
  useCreateBranchMutation,
  useUpdateBranchMutation,
  useDeleteBranchMutation,
  useGetStudentsQuery,
  useCreateStudentMutation,
  useUpdateStudentMutation,
  useDeleteStudentMutation,
} from "../../store";
import {
  ArrowLeft,
  Building2,
  GitBranch,
  Users,
  Plus,
  Edit2,
  Trash2,
  Search,
  ChevronRight,
  AlertTriangle,
  GraduationCap,
  Sparkles,
  Phone,
  CheckCircle,
  Info,
  Layers,
  ArrowRight,
  UserPlus,
} from "lucide-react";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import Modal from "../../components/ui/Modal";
import Input from "../../components/ui/Input";

export default function CollegeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const baseUrl = useSelector((s: any) => s.settings.baseUrl);

  // Queries
  const { data: colleges = [], isLoading: isLoadingColleges, refetch: refetchColleges } = useGetCollegesQuery(baseUrl);
  const { data: branches = [], isLoading: isLoadingBranches, refetch: refetchBranches } = useGetBranchesQuery(
    { baseUrl, collegeId: id! },
    { skip: !id }
  );
  const { data: students = [], isLoading: isLoadingStudents, refetch: refetchStudents } = useGetStudentsQuery(
    { baseUrl, collegeId: id! },
    { skip: !id }
  );

  // Mutations
  const [updateCollege, { isLoading: isUpdatingCollege }] = useUpdateCollegeMutation();
  const [deleteCollege, { isLoading: isDeletingCollege }] = useDeleteCollegeMutation();
  const [createBranch, { isLoading: isCreatingBranch }] = useCreateBranchMutation();
  const [updateBranch, { isLoading: isUpdatingBranch }] = useUpdateBranchMutation();
  const [deleteBranch, { isLoading: isDeletingBranch }] = useDeleteBranchMutation();
  const [createStudent, { isLoading: isCreatingStudent }] = useCreateStudentMutation();
  const [updateStudent, { isLoading: isUpdatingStudent }] = useUpdateStudentMutation();
  const [deleteStudent, { isLoading: isDeletingStudent }] = useDeleteStudentMutation();

  // Find active college
  const currentCollege = useMemo(() => {
    return colleges.find((c: any) => c.id === id || c.slug === id) || null;
  }, [colleges, id]);

  // Tab State: "branches" | "students" | "overview"
  const [activeTab, setActiveTab] = useState<"branches" | "students" | "overview">("branches");

  // Selected Branch for Drilldown View
  const [selectedBranch, setSelectedBranch] = useState<any>(null);

  // Search & Filter
  const [branchSearch, setBranchSearch] = useState("");
  const [studentSearch, setStudentSearch] = useState("");
  const [selectedBranchFilter, setSelectedBranchFilter] = useState<string>("ALL");

  // Branch Modals
  const [isCreateBranchOpen, setIsCreateBranchOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<any>(null);
  const [deletingBranch, setDeletingBranch] = useState<any>(null);

  // Branch Form States
  const [branchName, setBranchName] = useState("");
  const [branchCode, setBranchCode] = useState("");
  const [branchDesc, setBranchDesc] = useState("");
  const [branchFormError, setBranchFormError] = useState("");

  // Student Modals
  const [isCreateStudentOpen, setIsCreateStudentOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<any>(null);
  const [deletingStudent, setDeletingStudent] = useState<any>(null);

  // Student Form States
  const [studentName, setStudentName] = useState("");
  const [studentPhone, setStudentPhone] = useState("");
  const [studentBranch, setStudentBranch] = useState("");
  const [studentFormError, setStudentFormError] = useState("");

  // College Edit/Delete Modals
  const [isEditCollegeOpen, setIsEditCollegeOpen] = useState(false);
  const [isDeleteCollegeOpen, setIsDeleteCollegeOpen] = useState(false);
  const [colName, setColName] = useState("");
  const [colShortName, setColShortName] = useState("");
  const [colSlug, setColSlug] = useState("");
  const [colDesc, setColDesc] = useState("");
  const [colFormError, setColFormError] = useState("");

  // Filtered branches
  const filteredBranches = useMemo(() => {
    if (!branchSearch.trim()) return branches;
    const q = branchSearch.toLowerCase();
    return branches.filter(
      (b: any) =>
        b.name?.toLowerCase().includes(q) ||
        b.code?.toLowerCase().includes(q) ||
        b.description?.toLowerCase().includes(q)
    );
  }, [branches, branchSearch]);

  // Students belonging to the currently selected branch (in drilldown)
  const branchStudents = useMemo(() => {
    if (!selectedBranch) return [];
    const bNameLower = selectedBranch.name.toLowerCase();
    const bCodeLower = (selectedBranch.code || "").toLowerCase();

    return students.filter((s: any) => {
      const sb = (s.branch || "").toLowerCase();
      if (!sb) return false;
      return (
        sb === bNameLower ||
        sb.includes(bNameLower) ||
        bNameLower.includes(sb) ||
        (bCodeLower && sb.includes(bCodeLower))
      );
    });
  }, [students, selectedBranch]);

  // Filtered students for Directory Tab
  const filteredDirectoryStudents = useMemo(() => {
    let list = students;
    if (selectedBranchFilter !== "ALL") {
      const bLower = selectedBranchFilter.toLowerCase();
      list = list.filter((s: any) => (s.branch || "").toLowerCase().includes(bLower));
    }
    if (studentSearch.trim()) {
      const q = studentSearch.toLowerCase();
      list = list.filter(
        (s: any) =>
          s.name?.toLowerCase().includes(q) ||
          s.phone?.includes(q) ||
          s.branch?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [students, selectedBranchFilter, studentSearch]);

  // -------------------------------------------------------------
  // Branch Handlers
  // -------------------------------------------------------------
  const handleOpenCreateBranch = () => {
    setBranchName("");
    setBranchCode("");
    setBranchDesc("");
    setBranchFormError("");
    setIsCreateBranchOpen(true);
  };

  const handleOpenEditBranch = (branch: any, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingBranch(branch);
    setBranchName(branch.name || "");
    setBranchCode(branch.code || "");
    setBranchDesc(branch.description || "");
    setBranchFormError("");
  };

  const handleSaveBranch = async (e: React.FormEvent) => {
    e.preventDefault();
    setBranchFormError("");

    if (!branchName.trim()) {
      setBranchFormError("Branch name is required.");
      return;
    }

    try {
      if (editingBranch) {
        await updateBranch({
          baseUrl,
          id: editingBranch.id,
          body: {
            collegeId: currentCollege?.id || id,
            name: branchName.trim(),
            code: branchCode.trim() || null,
            description: branchDesc.trim() || null,
          },
        }).unwrap();
        // Update selected branch reference if we are currently viewing it
        if (selectedBranch && selectedBranch.id === editingBranch.id) {
          setSelectedBranch({
            ...selectedBranch,
            name: branchName.trim(),
            code: branchCode.trim() || null,
            description: branchDesc.trim() || null,
          });
        }
        setEditingBranch(null);
      } else {
        if (!currentCollege) {
          setBranchFormError("Cannot create branch: Active institution not found. Please return to partner universities.");
          return;
        }
        await createBranch({
          baseUrl,
          body: {
            collegeId: currentCollege.id,
            name: branchName.trim(),
            code: branchCode.trim() || null,
            description: branchDesc.trim() || null,
          },
        }).unwrap();
        setIsCreateBranchOpen(false);
      }
      refetchBranches();
      refetchColleges();
    } catch (err: any) {
      setBranchFormError(err?.data?.error || err?.message || "Failed to save branch.");
    }
  };

  const handleDeleteBranch = async () => {
    if (!deletingBranch) return;
    try {
      await deleteBranch({ baseUrl, id: deletingBranch.id }).unwrap();
      if (selectedBranch && selectedBranch.id === deletingBranch.id) {
        setSelectedBranch(null);
      }
      setDeletingBranch(null);
      refetchBranches();
      refetchColleges();
    } catch (err: any) {
      alert(err?.data?.error || "Failed to delete branch.");
    }
  };

  // -------------------------------------------------------------
  // Student Handlers
  // -------------------------------------------------------------
  const handleOpenAddStudent = (preselectedBranchName?: string) => {
    setStudentName("");
    setStudentPhone("");
    setStudentBranch(preselectedBranchName || selectedBranch?.name || branches[0]?.name || "");
    setStudentFormError("");
    setIsCreateStudentOpen(true);
  };

  const handleOpenEditStudent = (student: any) => {
    setEditingStudent(student);
    setStudentName(student.name || "");
    setStudentPhone(student.phone || "");
    setStudentBranch(student.branch || branches[0]?.name || "");
    setStudentFormError("");
  };

  const handleSaveStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setStudentFormError("");

    if (!studentPhone.trim()) {
      setStudentFormError("Mobile phone number is required.");
      return;
    }

    try {
      if (!currentCollege) {
        setStudentFormError("Cannot save student: Active institution not found. Please return to partner universities.");
        return;
      }
      if (editingStudent) {
        await updateStudent({
          baseUrl,
          id: editingStudent.id,
          body: {
            name: studentName.trim() || null,
            phone: studentPhone.trim(),
            collegeId: currentCollege.id,
            collegeName: currentCollege.name,
            branch: studentBranch.trim() || null,
          },
        }).unwrap();
        setEditingStudent(null);
      } else {
        await createStudent({
          baseUrl,
          body: {
            name: studentName.trim() || null,
            phone: studentPhone.trim(),
            collegeId: currentCollege.id,
            collegeName: currentCollege.name,
            branch: studentBranch.trim() || null,
            role: "STUDENT",
          },
        }).unwrap();
        setIsCreateStudentOpen(false);
      }
      refetchStudents();
      refetchBranches();
      refetchColleges();
    } catch (err: any) {
      setStudentFormError(err?.data?.error || err?.message || "Failed to save student.");
    }
  };

  const handleDeleteStudent = async () => {
    if (!deletingStudent) return;
    try {
      await deleteStudent({ baseUrl, id: deletingStudent.id }).unwrap();
      setDeletingStudent(null);
      refetchStudents();
      refetchBranches();
      refetchColleges();
    } catch (err: any) {
      alert(err?.data?.error || "Failed to delete student.");
    }
  };

  // -------------------------------------------------------------
  // College Edit / Delete
  // -------------------------------------------------------------
  const handleOpenEditCollege = () => {
    if (!currentCollege) return;
    setColName(currentCollege.name || "");
    setColShortName(currentCollege.shortName || "");
    setColSlug(currentCollege.slug || "");
    setColDesc(currentCollege.description || "");
    setColFormError("");
    setIsEditCollegeOpen(true);
  };

  const handleSaveCollege = async (e: React.FormEvent) => {
    e.preventDefault();
    setColFormError("");
    if (!colName.trim() || !colSlug.trim()) {
      setColFormError("Name and slug are required.");
      return;
    }
    try {
      await updateCollege({
        baseUrl,
        id: currentCollege.id,
        body: {
          name: colName.trim(),
          shortName: colShortName.trim() || null,
          slug: colSlug.trim(),
          description: colDesc.trim() || null,
        },
      }).unwrap();
      setIsEditCollegeOpen(false);
      refetchColleges();
    } catch (err: any) {
      setColFormError(err?.data?.error || err?.message || "Failed to update college.");
    }
  };

  const handleDeleteCollege = async () => {
    if (!currentCollege) return;
    try {
      await deleteCollege({ baseUrl, id: currentCollege.id }).unwrap();
      navigate("/colleges");
    } catch (err: any) {
      alert(err?.data?.error || "Failed to delete college.");
    }
  };

  if (isLoadingColleges) {
    return (
      <div className="p-16 text-center text-zinc-400">
        <div className="inline-block w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-sm font-semibold text-zinc-600 dark:text-zinc-300">Loading university details...</p>
      </div>
    );
  }

  if (!currentCollege) {
    return (
      <div className="text-center py-20 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-8 max-w-lg mx-auto my-12 shadow-sm">
        <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center mx-auto mb-4 border border-amber-200/50">
          <AlertTriangle className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Partner University Not Found</h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2 mb-6">
          The institution with identifier <code className="font-mono text-xs px-1.5 py-0.5 bg-zinc-100 dark:bg-zinc-800 rounded text-rose-500">{id}</code> does not exist in the database or may have been deleted.
        </p>
        <Button onClick={() => navigate("/colleges")} className="bg-indigo-600 hover:bg-indigo-700 text-white">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Partner Universities
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto pb-16">
      {/* Top Breadcrumb & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/colleges")}
            className="p-2 rounded-xl text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-zinc-400">Partner University</span>
              <ChevronRight className="w-3.5 h-3.5 text-zinc-300 dark:text-zinc-600" />
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                {currentCollege?.shortName || "College Details"}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight flex items-center gap-2 mt-0.5">
              {currentCollege?.name || "University Portal"}
              {currentCollege?.shortName && (
                <span className="text-xs font-bold px-2 py-0.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/60">
                  {currentCollege.shortName}
                </span>
              )}
            </h1>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleOpenEditCollege}
            className="flex items-center gap-1.5 text-xs font-bold"
          >
            <Edit2 className="w-3.5 h-3.5" /> Edit Info
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsDeleteCollegeOpen(true)}
            className="flex items-center gap-1.5 text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 border-rose-200 dark:border-rose-900/50"
          >
            <Trash2 className="w-3.5 h-3.5" /> Delete University
          </Button>
        </div>
      </div>

      {/* College Description Card */}
      {currentCollege?.description && (
        <div className="bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/30 rounded-2xl p-4 flex items-start gap-3">
          <Building2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
          <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed font-medium">
            {currentCollege.description}
          </p>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-zinc-100 dark:bg-zinc-900 rounded-2xl w-fit border border-zinc-200/80 dark:border-zinc-800">
        <button
          onClick={() => {
            setActiveTab("branches");
            setSelectedBranch(null);
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === "branches"
              ? "bg-white dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 shadow-sm"
              : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
          }`}
        >
          <GitBranch className="w-4 h-4" />
          <span>Branches ({branches.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("students")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === "students"
              ? "bg-white dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 shadow-sm"
              : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
          }`}
        >
          <Users className="w-4 h-4" />
          <span>All Students ({students.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("overview")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === "overview"
              ? "bg-white dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 shadow-sm"
              : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
          }`}
        >
          <Info className="w-4 h-4" />
          <span>Overview</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: BRANCHES (List or Branch Drilldown) */}
      {/* ========================================================================= */}
      {activeTab === "branches" && (
        <div className="space-y-6">
          {/* BRANCH DRILLDOWN VIEW: STUDENTS FROM SELECTED BRANCH */}
          {selectedBranch ? (
            <div className="space-y-6 animate-fade-in">
              {/* Branch Header Banner */}
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl p-6 shadow-xs">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <button
                      onClick={() => setSelectedBranch(null)}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline mb-2"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" /> Back to all branches
                    </button>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold flex items-center justify-center">
                        <GitBranch className="w-5 h-5" />
                      </div>
                      <div>
                        <h2 className="text-xl font-black text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                          {selectedBranch.name}
                          {selectedBranch.code && (
                            <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                              {selectedBranch.code}
                            </span>
                          )}
                        </h2>
                        {selectedBranch.description && (
                          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                            {selectedBranch.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Branch & Student Action Buttons */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleOpenEditBranch(selectedBranch)}
                      className="text-xs font-bold flex items-center gap-1.5"
                    >
                      <Edit2 className="w-3.5 h-3.5" /> Rename Branch
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setDeletingBranch(selectedBranch)}
                      className="text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 border-rose-200 dark:border-rose-900/50 flex items-center gap-1.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete Branch
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleOpenAddStudent(selectedBranch.name)}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5"
                    >
                      <UserPlus className="w-3.5 h-3.5" /> Add Student
                    </Button>
                  </div>
                </div>
              </div>

              {/* Students in this branch */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                    <Users className="w-4 h-4 text-emerald-500" />
                    <span>Enrolled Students ({branchStudents.length})</span>
                  </h3>
                  <span className="text-xs text-zinc-400 font-medium">
                    Branch cohort registry
                  </span>
                </div>

                {isLoadingStudents ? (
                  <div className="p-8 text-center text-zinc-400">
                    <div className="inline-block w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mb-2" />
                    <p className="text-xs font-semibold">Loading enrolled students...</p>
                  </div>
                ) : branchStudents.length === 0 ? (
                  <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl p-12 text-center space-y-3">
                    <div className="w-12 h-12 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-400 flex items-center justify-center mx-auto">
                      <Users className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                        No students enrolled in this branch yet
                      </h4>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-sm mx-auto">
                        Add students to <strong>{selectedBranch.name}</strong> to manage their cohort details.
                      </p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleOpenAddStudent(selectedBranch.name)}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs"
                    >
                      <Plus className="w-3.5 h-3.5 mr-1" /> Add Student
                    </Button>
                  </div>
                ) : (
                  <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-xs">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-zinc-50 dark:bg-zinc-800/60 text-zinc-500 dark:text-zinc-400 border-b border-zinc-200/80 dark:border-zinc-800 uppercase tracking-wider font-mono text-[10px]">
                          <tr>
                            <th className="py-3 px-4">Student</th>
                            <th className="py-3 px-4">Contact Phone</th>
                            <th className="py-3 px-4">Role</th>
                            <th className="py-3 px-4">Status</th>
                            <th className="py-3 px-4 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/80">
                          {branchStudents.map((s: any) => (
                            <tr key={s.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/40 transition-colors">
                              <td className="py-3.5 px-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-600 text-white font-bold text-xs flex items-center justify-center">
                                    {(s.name || s.phone || "S").charAt(0).toUpperCase()}
                                  </div>
                                  <div>
                                    <p className="font-bold text-zinc-900 dark:text-zinc-100">
                                      {s.name || "Unnamed Student"}
                                    </p>
                                    <p className="text-[10px] text-zinc-400 font-mono">
                                      {s.id}
                                    </p>
                                  </div>
                                </div>
                              </td>
                              <td className="py-3.5 px-4 font-mono font-medium text-zinc-700 dark:text-zinc-300">
                                <div className="flex items-center gap-1.5">
                                  <Phone className="w-3 h-3 text-zinc-400" />
                                  {s.phone}
                                </div>
                              </td>
                              <td className="py-3.5 px-4">
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                                  {s.role || "STUDENT"}
                                </span>
                              </td>
                              <td className="py-3.5 px-4">
                                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Active
                                </span>
                              </td>
                              <td className="py-3.5 px-4 text-right">
                                <div className="flex items-center justify-end gap-1">
                                  <button
                                    title="Edit Student"
                                    onClick={() => handleOpenEditStudent(s)}
                                    className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    title="Delete Student"
                                    onClick={() => setDeletingStudent(s)}
                                    className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* ALL BRANCHES LIST VIEW */
            <div className="space-y-4">
              {/* Branch Toolbar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-zinc-900 p-2.5 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 shadow-xs">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={branchSearch}
                    onChange={(e) => setBranchSearch(e.target.value)}
                    placeholder="Search branches by name or code..."
                    className="w-full bg-transparent pl-9 pr-4 py-1.5 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none"
                  />
                </div>
                <Button
                  onClick={handleOpenCreateBranch}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" /> Add Branch
                </Button>
              </div>

              {/* Branches Grid / Cards */}
              {isLoadingBranches ? (
                <div className="p-12 text-center text-zinc-400">
                  <div className="inline-block w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mb-2" />
                  <p className="text-xs font-semibold">Loading academic branches...</p>
                </div>
              ) : filteredBranches.length === 0 ? (
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-3xl p-12 text-center space-y-3">
                  <div className="w-12 h-12 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-400 flex items-center justify-center mx-auto">
                    <GitBranch className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                      {branchSearch ? "No branches match your search" : "No academic branches yet"}
                    </h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-sm mx-auto">
                      Add departments and branches offered by this college to start enrolling students.
                    </p>
                  </div>
                  {!branchSearch && (
                    <Button
                      size="sm"
                      onClick={handleOpenCreateBranch}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs"
                    >
                      <Plus className="w-3.5 h-3.5 mr-1" /> Add First Branch
                    </Button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredBranches.map((branch: any) => (
                    <div
                      key={branch.id}
                      onClick={() => setSelectedBranch(branch)}
                      className="group bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 hover:border-indigo-500/50 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-100 dark:border-indigo-900/40 shadow-xs shrink-0">
                              <GraduationCap className="w-5 h-5" />
                            </div>
                            <div className="min-w-0">
                              <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
                                {branch.name}
                              </h4>
                              {branch.code && (
                                <span className="text-[10px] font-mono font-bold text-zinc-400 truncate block">
                                  Code: {branch.code}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {branch.description && (
                          <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 mt-2 leading-relaxed">
                            {branch.description}
                          </p>
                        )}
                      </div>

                      {/* Card Footer */}
                      <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between gap-2 mt-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400">
                          <Users className="w-3.5 h-3.5" />
                          {branch.studentsCount || 0} Students
                        </span>

                        <div className="flex items-center gap-1">
                          <button
                            title="Rename Branch"
                            onClick={(e) => handleOpenEditBranch(branch, e)}
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            title="Delete Branch"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeletingBranch(branch);
                            }}
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                          <div className="p-1 text-zinc-300 dark:text-zinc-600 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-transform group-hover:translate-x-0.5">
                            <ArrowRight className="w-4 h-4" />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: ALL STUDENTS DIRECTORY */}
      {/* ========================================================================= */}
      {activeTab === "students" && (
        <div className="space-y-4">
          {/* Filter Toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-zinc-900 p-2.5 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 shadow-xs">
            <div className="flex items-center gap-3 flex-1">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  placeholder="Search students by name, phone, or branch..."
                  className="w-full bg-transparent pl-9 pr-4 py-1.5 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none"
                />
              </div>

              {/* Branch Filter Dropdown */}
              <select
                value={selectedBranchFilter}
                onChange={(e) => setSelectedBranchFilter(e.target.value)}
                className="bg-zinc-100 dark:bg-zinc-800 border-none rounded-xl px-3 py-1.5 text-xs font-bold text-zinc-700 dark:text-zinc-300 focus:outline-none"
              >
                <option value="ALL">All Branches ({students.length})</option>
                {branches.map((b: any) => (
                  <option key={b.id} value={b.name}>
                    {b.name} ({b.studentsCount || 0})
                  </option>
                ))}
              </select>
            </div>

            <Button
              onClick={() => handleOpenAddStudent()}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5"
            >
              <UserPlus className="w-4 h-4" /> Add Student
            </Button>
          </div>

          {/* Students Directory Table */}
          {isLoadingStudents ? (
            <div className="p-12 text-center text-zinc-400">
              <div className="inline-block w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mb-2" />
              <p className="text-xs font-semibold">Loading students directory...</p>
            </div>
          ) : filteredDirectoryStudents.length === 0 ? (
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-3xl p-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-400 flex items-center justify-center mx-auto">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  {studentSearch || selectedBranchFilter !== "ALL"
                    ? "No students match your filter"
                    : "No students registered yet"}
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-sm mx-auto">
                  Add student accounts to assign them to branches and track cohort participation.
                </p>
              </div>
              {selectedBranchFilter === "ALL" && !studentSearch && (
                <Button
                  size="sm"
                  onClick={() => handleOpenAddStudent()}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" /> Add Student
                </Button>
              )}
            </div>
          ) : (
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-50 dark:bg-zinc-800/60 text-zinc-500 dark:text-zinc-400 border-b border-zinc-200/80 dark:border-zinc-800 uppercase tracking-wider font-mono text-[10px]">
                    <tr>
                      <th className="py-3 px-4">Student</th>
                      <th className="py-3 px-4">Branch</th>
                      <th className="py-3 px-4">Phone Number</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/80">
                    {filteredDirectoryStudents.map((s: any) => (
                      <tr key={s.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/40 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-600 text-white font-bold text-xs flex items-center justify-center">
                              {(s.name || s.phone || "S").charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-bold text-zinc-900 dark:text-zinc-100">
                                {s.name || "Unnamed Student"}
                              </p>
                              <p className="text-[10px] text-zinc-400 font-mono">{s.id}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-bold text-zinc-800 dark:text-zinc-200">
                            {s.branch || "General / Unassigned"}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-mono font-medium text-zinc-700 dark:text-zinc-300">
                          <div className="flex items-center gap-1.5">
                            <Phone className="w-3 h-3 text-zinc-400" />
                            {s.phone}
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Active
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              title="Edit Student"
                              onClick={() => handleOpenEditStudent(s)}
                              className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              title="Delete Student"
                              onClick={() => setDeletingStudent(s)}
                              className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: OVERVIEW & SETTINGS */}
      {/* ========================================================================= */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl p-6 shadow-xs space-y-4">
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                Institutional Partnership Profile
              </h3>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-zinc-400 font-medium">Institution Name</span>
                  <p className="font-bold text-zinc-900 dark:text-zinc-100 mt-0.5">
                    {currentCollege?.name}
                  </p>
                </div>
                <div>
                  <span className="text-zinc-400 font-medium">Short Code</span>
                  <p className="font-bold text-zinc-900 dark:text-zinc-100 mt-0.5">
                    {currentCollege?.shortName || "—"}
                  </p>
                </div>
                <div>
                  <span className="text-zinc-400 font-medium">URL Slug Identifier</span>
                  <p className="font-mono font-bold text-zinc-900 dark:text-zinc-100 mt-0.5">
                    {currentCollege?.slug}
                  </p>
                </div>
                <div>
                  <span className="text-zinc-400 font-medium">Partnership Status</span>
                  <p className="font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" /> Verified Partner
                  </p>
                </div>
              </div>

              {currentCollege?.description && (
                <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 text-xs">
                  <span className="text-zinc-400 font-medium">Campus Location / Bio</span>
                  <p className="text-zinc-700 dark:text-zinc-300 mt-1 leading-relaxed">
                    {currentCollege.description}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl p-6 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                Quick Statistics
              </h3>
              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/60">
                  <span className="text-zinc-500 font-medium">Total Branches</span>
                  <span className="font-black text-zinc-900 dark:text-zinc-100">
                    {branches.length}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/60">
                  <span className="text-zinc-500 font-medium">Total Enrolled Students</span>
                  <span className="font-black text-zinc-900 dark:text-zinc-100">
                    {students.length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODALS */}
      {/* ========================================================================= */}

      {/* Modal: Create/Edit Branch */}
      <Modal
        isOpen={isCreateBranchOpen || !!editingBranch}
        onClose={() => {
          setIsCreateBranchOpen(false);
          setEditingBranch(null);
        }}
        title={editingBranch ? "Rename / Edit Branch" : "Add Academic Branch"}
      >
        <form onSubmit={handleSaveBranch} className="space-y-4">
          {branchFormError && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400">
              {branchFormError}
            </div>
          )}

          <Input
            label="Branch / Department Name"
            placeholder="e.g. Computer Science & Engineering"
            value={branchName}
            onChange={(e) => setBranchName(e.target.value)}
            required
          />

          <Input
            label="Branch Code / Abbreviation"
            placeholder="e.g. CSE or AIDS"
            value={branchCode}
            onChange={(e) => setBranchCode(e.target.value)}
          />

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
              Description / Curriculum Focus (Optional)
            </label>
            <textarea
              rows={3}
              value={branchDesc}
              onChange={(e) => setBranchDesc(e.target.value)}
              placeholder="e.g. Algorithms, software systems, AI pipelines, and cloud computing..."
              className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-100 dark:border-zinc-800">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsCreateBranchOpen(false);
                setEditingBranch(null);
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              loading={isCreatingBranch || isUpdatingBranch}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
            >
              {editingBranch ? "Save Changes" : "Add Branch"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Confirm Delete Branch */}
      <Modal
        isOpen={!!deletingBranch}
        onClose={() => setDeletingBranch(null)}
        title="Delete Academic Branch"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 rounded-xl text-rose-700 dark:text-rose-400">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <div className="text-xs">
              <p className="font-bold">Permanent Removal</p>
              <p className="mt-0.5">
                Are you sure you want to remove <strong>{deletingBranch?.name}</strong> from this college?
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-100 dark:border-zinc-800">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeletingBranch(null)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              loading={isDeletingBranch}
              onClick={handleDeleteBranch}
              className="bg-rose-600 hover:bg-rose-700 text-white font-bold"
            >
              Delete Branch
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal: Create/Edit Student */}
      <Modal
        isOpen={isCreateStudentOpen || !!editingStudent}
        onClose={() => {
          setIsCreateStudentOpen(false);
          setEditingStudent(null);
        }}
        title={editingStudent ? "Edit Student Details" : "Add Student to Cohort"}
      >
        <form onSubmit={handleSaveStudent} className="space-y-4">
          {studentFormError && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400">
              {studentFormError}
            </div>
          )}

          <Input
            label="Student Full Name"
            placeholder="e.g. Aarav Sharma"
            value={studentName}
            onChange={(e) => setStudentName(e.target.value)}
          />

          <Input
            label="Mobile Phone Number"
            placeholder="e.g. +919811234501 or 9811234501"
            value={studentPhone}
            onChange={(e) => setStudentPhone(e.target.value)}
            required
          />

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
              Academic Branch
            </label>
            <select
              value={studentBranch}
              onChange={(e) => setStudentBranch(e.target.value)}
              className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-indigo-500"
            >
              {branches.map((b: any) => (
                <option key={b.id} value={b.name}>
                  {b.name} {b.code ? `(${b.code})` : ""}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-100 dark:border-zinc-800">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsCreateStudentOpen(false);
                setEditingStudent(null);
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              loading={isCreatingStudent || isUpdatingStudent}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
            >
              {editingStudent ? "Save Changes" : "Register Student"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Confirm Delete Student */}
      <Modal
        isOpen={!!deletingStudent}
        onClose={() => setDeletingStudent(null)}
        title="Remove Student from Branch"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 rounded-xl text-rose-700 dark:text-rose-400">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <div className="text-xs">
              <p className="font-bold">Student Removal</p>
              <p className="mt-0.5">
                Are you sure you want to remove <strong>{deletingStudent?.name || deletingStudent?.phone}</strong> from this branch?
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-100 dark:border-zinc-800">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeletingStudent(null)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              loading={isDeletingStudent}
              onClick={handleDeleteStudent}
              className="bg-rose-600 hover:bg-rose-700 text-white font-bold"
            >
              Remove Student
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal: Edit College Info */}
      <Modal
        isOpen={isEditCollegeOpen}
        onClose={() => setIsEditCollegeOpen(false)}
        title="Edit Partner University Details"
      >
        <form onSubmit={handleSaveCollege} className="space-y-4">
          {colFormError && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400">
              {colFormError}
            </div>
          )}

          <Input
            label="University / College Name"
            value={colName}
            onChange={(e) => setColName(e.target.value)}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Short Code / Acronym"
              value={colShortName}
              onChange={(e) => setColShortName(e.target.value)}
            />

            <Input
              label="Slug Identifier"
              value={colSlug}
              onChange={(e) => setColSlug(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
              Location / Campus Description
            </label>
            <textarea
              rows={3}
              value={colDesc}
              onChange={(e) => setColDesc(e.target.value)}
              className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-100 dark:border-zinc-800">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsEditCollegeOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              loading={isUpdatingCollege}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
            >
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Confirm Delete College */}
      <Modal
        isOpen={isDeleteCollegeOpen}
        onClose={() => setIsDeleteCollegeOpen(false)}
        title="Delete Partner University"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 rounded-xl text-rose-700 dark:text-rose-400">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <div className="text-xs">
              <p className="font-bold">Permanent Deletion Warning</p>
              <p className="mt-0.5">
                This will permanently delete <strong>{currentCollege?.name}</strong> and all associated branches and student assignments.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-100 dark:border-zinc-800">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDeleteCollegeOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              loading={isDeletingCollege}
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
