import React, { useState } from "react";
import {
  Building2,
  Plus,
  Edit2,
  Trash2,
  Users,
  Shield,
  Layers,
  Search,
} from "lucide-react";
import Modal from "../ui/Modal";
import Button from "../ui/Button";
import { DepartmentModal } from "./DepartmentModal";
import {
  useGetDepartmentsQuery,
  useDeleteDepartmentMutation,
  useGetTeamMembersQuery,
} from "../../store";
import { cn } from "../../lib/utils";

export interface DepartmentsManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  baseUrl: string;
}

export const DepartmentsManagerModal: React.FC<DepartmentsManagerModalProps> = ({
  isOpen,
  onClose,
  baseUrl,
}) => {
  const { data: deptRes, refetch: refetchDepts, isLoading } = useGetDepartmentsQuery(baseUrl);
  const departments: any[] = deptRes?.data || [];

  const { data: teamRes } = useGetTeamMembersQuery({ baseUrl });
  const teamMembers: any[] = teamRes?.data || [];

  const [deleteDepartment] = useDeleteDepartmentMutation();

  const [search, setSearch] = useState("");
  const [selectedDeptForEdit, setSelectedDeptForEdit] = useState<any | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const filteredDepartments = departments.filter((d) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      (d.name && d.name.toLowerCase().includes(q)) ||
      (d.code && d.code.toLowerCase().includes(q)) ||
      (d.description && d.description.toLowerCase().includes(q))
    );
  });

  const handleOpenCreate = () => {
    setSelectedDeptForEdit(null);
    setIsEditModalOpen(true);
  };

  const handleOpenEdit = (dept: any) => {
    setSelectedDeptForEdit(dept);
    setIsEditModalOpen(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete the "${name}" department?`)) return;
    try {
      await deleteDepartment({ baseUrl, id }).unwrap();
      refetchDepts();
    } catch (err: any) {
      alert(err?.data?.error || "Failed to delete department.");
    }
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Manage Team Departments"
        size="lg"
      >
        <div className="space-y-4">
          {/* Top Bar: Search + Create Button */}
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search departments..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <Button
              onClick={handleOpenCreate}
              variant="primary"
              size="sm"
              className="text-xs font-bold"
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              New Department
            </Button>
          </div>

          {/* Departments Grid */}
          <div className="max-h-[60vh] overflow-y-auto pr-1 space-y-2.5">
            {isLoading ? (
              <div className="py-12 text-center text-xs text-zinc-400">Loading departments...</div>
            ) : filteredDepartments.length === 0 ? (
              <div className="py-12 text-center border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl">
                <Building2 className="w-8 h-8 text-zinc-300 dark:text-zinc-600 mx-auto mb-2" />
                <p className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                  {search ? "No departments matching search." : "No departments created yet."}
                </p>
                <button
                  type="button"
                  onClick={handleOpenCreate}
                  className="mt-2 text-xs text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
                >
                  + Create First Department
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {filteredDepartments.map((dept) => {
                  const deptLead = teamMembers.find((m) => m.id === dept.leadId);
                  const memberCount = teamMembers.filter((m) => m.departmentId === dept.id).length;

                  return (
                    <div
                      key={dept.id}
                      className="p-3.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/80 shadow-xs hover:border-zinc-300 dark:hover:border-zinc-700 transition-all flex flex-col justify-between"
                    >
                      <div>
                        {/* Header: Color & Code */}
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: dept.color || "#6366f1" }}
                            />
                            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400">
                              {dept.code}
                            </span>
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(dept)}
                              className="p-1.5 text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
                              title="Edit Department"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(dept.id, dept.name)}
                              className="p-1.5 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-colors cursor-pointer"
                              title="Delete Department"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Department Name */}
                        <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                          {dept.name}
                        </h4>

                        {dept.description && (
                          <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 mt-1">
                            {dept.description}
                          </p>
                        )}
                      </div>

                      {/* Footer Meta: Lead & Members */}
                      <div className="mt-3 pt-2.5 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-[11px] text-zinc-400">
                        <div className="flex items-center gap-1 truncate max-w-[140px]">
                          {deptLead ? (
                            <>
                              <Shield className="w-3 h-3 text-indigo-500 shrink-0" />
                              <span className="text-zinc-700 dark:text-zinc-300 font-medium truncate">
                                {deptLead.name || deptLead.phone}
                              </span>
                            </>
                          ) : (
                            <span className="italic text-zinc-400 text-[10px]">No lead</span>
                          )}
                        </div>

                        <div className="flex items-center gap-1 font-mono text-[10px]">
                          <Users className="w-3 h-3" />
                          <span>{memberCount} staff</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="flex justify-end pt-2 border-t border-zinc-100 dark:border-zinc-800">
            <Button onClick={onClose} variant="outline" size="sm" className="text-xs">
              Close
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit / Create Single Department Modal */}
      <DepartmentModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        department={selectedDeptForEdit}
        baseUrl={baseUrl}
        onSuccess={() => refetchDepts()}
      />
    </>
  );
};
