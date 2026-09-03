import React, { useState, useEffect } from "react";
import {
  X,
  UserPlus,
  Edit3,
  Building2,
  GraduationCap,
  Phone,
  Mail,
  Flame,
  Sun,
  Snowflake,
  AlertTriangle,
  User,
  CheckCircle2,
} from "lucide-react";
import { useCreateLeadMutation, useUpdateLeadMutation } from "../../store";

interface LeadFormModalProps {
  lead?: any;
  baseUrl: string;
  onClose: () => void;
  onSuccess?: () => void;
  colleges?: Array<{ id: string; name: string }>;
  branches?: string[];
  teamMembers?: Array<{ id: string; name: string; phone: string; role: string }>;
}

export default function LeadFormModal({
  lead,
  baseUrl,
  onClose,
  onSuccess,
  colleges = [],
  branches = [],
  teamMembers = [],
}: LeadFormModalProps) {
  const [createLead, { isLoading: isCreating }] = useCreateLeadMutation();
  const [updateLead, { isLoading: isUpdating }] = useUpdateLeadMutation();

  const isEdit = Boolean(lead?.id);

  const [name, setName] = useState(lead?.name || "");
  const [phone, setPhone] = useState(lead?.phone || "");
  const [email, setEmail] = useState(lead?.email || "");
  const [collegeId, setCollegeId] = useState(lead?.collegeId || "");
  const [collegeName, setCollegeName] = useState(lead?.collegeName || "");
  const [branch, setBranch] = useState(lead?.branch || "");
  const [customBranch, setCustomBranch] = useState("");
  const [yearOfStudy, setYearOfStudy] = useState(lead?.yearOfStudy || "1st yr");
  const [assignedToUserId, setAssignedToUserId] = useState(lead?.assignedToUserId || "");
  const [quality, setQuality] = useState(lead?.quality || "WARM");
  const [status, setStatus] = useState(lead?.status || "NEW");
  const [source, setSource] = useState(lead?.source || "COLLEGE_DRIVE");
  const [notes, setNotes] = useState(lead?.notes || "");
  const [errorMsg, setErrorMsg] = useState("");

  const handleCollegeChange = (cid: string) => {
    setCollegeId(cid);
    const selected = colleges.find((c) => c.id === cid);
    if (selected) {
      setCollegeName(selected.name);
    } else {
      setCollegeName("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!name.trim()) {
      setErrorMsg("Lead name is required.");
      return;
    }
    if (!phone.trim()) {
      setErrorMsg("Phone number is required.");
      return;
    }

    const finalBranch = branch === "OTHER" ? customBranch.trim() : branch;

    const payload = {
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim() || undefined,
      collegeId: collegeId || undefined,
      collegeName: collegeName || undefined,
      branch: finalBranch || undefined,
      yearOfStudy: yearOfStudy || undefined,
      assignedToUserId: assignedToUserId || undefined,
      quality,
      status,
      source,
      notes: notes.trim() || undefined,
    };

    try {
      if (isEdit) {
        await updateLead({
          baseUrl,
          id: lead.id,
          data: payload,
        }).unwrap();
      } else {
        await createLead({
          baseUrl,
          data: payload,
        }).unwrap();
      }

      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.data?.message || err?.message || "Failed to save lead.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl max-w-xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-950/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
              {isEdit ? <Edit3 className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                {isEdit ? "Edit Lead Profile" : "Add New Student Lead"}
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {isEdit ? "Update lead contact and assignment details" : "Create a new lead in the CRM"}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 flex-1">
          {errorMsg && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 rounded-xl text-xs font-semibold">
              {errorMsg}
            </div>
          )}

          {/* Full Name & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="E.g. Ashima Choudhary"
                className="w-full px-3.5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-xs text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                Phone (WhatsApp) <span className="text-rose-500">*</span>
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 9805760385"
                className="w-full px-3.5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-xs text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
              Email Address (Optional)
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="student@example.com"
              className="w-full px-3.5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-xs text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          {/* College & Branch */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                College / Campus
              </label>
              <select
                value={collegeId}
                onChange={(e) => handleCollegeChange(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-xs text-zinc-900 dark:text-zinc-100"
              >
                <option value="">Select College...</option>
                {colleges.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                Branch / Degree
              </label>
              <select
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-xs text-zinc-900 dark:text-zinc-100"
              >
                <option value="">Select Branch...</option>
                {branches.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
                <option value="OTHER">Other (Custom)</option>
              </select>
            </div>
          </div>

          {branch === "OTHER" && (
            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                Specify Branch Name
              </label>
              <input
                type="text"
                value={customBranch}
                onChange={(e) => setCustomBranch(e.target.value)}
                placeholder="E.g. B.Tech AI & Data Science"
                className="w-full px-3.5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-xs text-zinc-900 dark:text-zinc-100"
              />
            </div>
          )}

          {/* Year & Assigned Counselor */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                Year of Study
              </label>
              <select
                value={yearOfStudy}
                onChange={(e) => setYearOfStudy(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-xs text-zinc-900 dark:text-zinc-100"
              >
                <option value="1st yr">1st Year</option>
                <option value="2nd yr">2nd Year</option>
                <option value="3rd yr">3rd Year</option>
                <option value="4th yr">4th Year</option>
                <option value="Final yr">Final Year</option>
                <option value="Graduated">Graduated / Working</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                Assign to Team Member
              </label>
              <select
                value={assignedToUserId}
                onChange={(e) => setAssignedToUserId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-xs text-zinc-900 dark:text-zinc-100"
              >
                <option value="">Unassigned</option>
                {teamMembers.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name || m.phone} ({m.role})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Lead Quality & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                Initial Lead Quality
              </label>
              <select
                value={quality}
                onChange={(e) => setQuality(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-xs text-zinc-900 dark:text-zinc-100"
              >
                <option value="HOT">🔥 Hot Lead (High Intent)</option>
                <option value="WARM">☀️ Warm Lead (Interested)</option>
                <option value="COLD">❄️ Cold Lead (Low Intent)</option>
                <option value="POOR">⚠️ Poor / Bad Fit</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                Pipeline Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-xs text-zinc-900 dark:text-zinc-100"
              >
                <option value="NEW">New Lead</option>
                <option value="ATTEMPTED">Call Attempted</option>
                <option value="CONTACTED">Contacted</option>
                <option value="INTERESTED">Interested</option>
                <option value="FOLLOW_UP_SCHEDULED">Follow-up Scheduled</option>
                <option value="DEMO_GIVEN">Demo / Counselling Given</option>
                <option value="CONVERTED">Converted / Enrolled</option>
                <option value="LOST">Lost</option>
                <option value="JUNK">Junk / Invalid</option>
              </select>
            </div>
          </div>

          {/* Source & Notes */}
          <div>
            <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
              Lead Source
            </label>
            <select
              value={source}
              onChange={(e) => setSource(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-xs text-zinc-900 dark:text-zinc-100"
            >
              <option value="COLLEGE_DRIVE">College Seminar / Drive</option>
              <option value="PRESENTATION_SESSION">Presentation Session QR</option>
              <option value="PAMPHLET_SCAN">Pamphlet QR Scan</option>
              <option value="WEBSITE_INQUIRY">Website Form / Inquiry</option>
              <option value="REFERRAL">Referral</option>
              <option value="MANUAL_IMPORT">Manual / Excel Import</option>
              <option value="OTHER">Other Source</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
              Notes & Background Information
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Initial details, student interest areas, career goals..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-xs text-zinc-900 dark:text-zinc-100"
            />
          </div>
        </form>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-950/50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={isCreating || isUpdating}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-all disabled:opacity-50 cursor-pointer"
          >
            {isCreating || isUpdating ? (
              <span>Saving...</span>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>{isEdit ? "Update Lead" : "Create Lead"}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
