import React, { useState, useRef } from "react";
import {
  X,
  UploadCloud,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  Building2,
  Users,
  Sun,
  Flame,
  FileText,
} from "lucide-react";
import { useBulkImportLeadsMutation } from "../../store";

interface LeadImportModalProps {
  baseUrl: string;
  onClose: () => void;
  onSuccess?: () => void;
  colleges?: Array<{ id: string; name: string }>;
  teamMembers?: Array<{ id: string; name: string; phone: string; role: string }>;
  initialCollegeId?: string;
  initialCollegeName?: string;
  initialBranch?: string;
}

export default function LeadImportModal({
  baseUrl,
  onClose,
  onSuccess,
  colleges = [],
  teamMembers = [],
  initialCollegeId,
  initialCollegeName,
  initialBranch,
}: LeadImportModalProps) {
  const [bulkImport, { isLoading }] = useBulkImportLeadsMutation();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [fileName, setFileName] = useState("");
  const [parsedLeads, setParsedLeads] = useState<any[]>([]);
  const [defaultCollegeId, setDefaultCollegeId] = useState(initialCollegeId || "");
  const [defaultCollegeName, setDefaultCollegeName] = useState(initialCollegeName || "");
  const [defaultBranch, setDefaultBranch] = useState(initialBranch || "");
  const [defaultAssignedTo, setDefaultAssignedTo] = useState("");
  const [defaultQuality, setDefaultQuality] = useState("WARM");
  const [errorMsg, setErrorMsg] = useState("");
  const [importResult, setImportResult] = useState<any | null>(null);

  const handleCollegeChange = (cid: string) => {
    setDefaultCollegeId(cid);
    const sel = colleges.find((c) => c.id === cid);
    setDefaultCollegeName(sel ? sel.name : "");
  };

  const parseCSV = (text: string) => {
    const lines = text
      .split(/\r\n|\n/)
      .map((l) => l.trim())
      .filter(Boolean);
    if (lines.length < 2) {
      throw new Error("CSV file does not contain enough data.");
    }

    // Parse CSV line taking quotes into account
    const parseLine = (line: string): string[] => {
      const result: string[] = [];
      let current = "";
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"' || char === "'") {
          inQuotes = !inQuotes;
        } else if (char === "," && !inQuotes) {
          result.push(current.trim().replace(/^["']|["']$/g, ""));
          current = "";
        } else {
          current += char;
        }
      }
      result.push(current.trim().replace(/^["']|["']$/g, ""));
      return result;
    };

    const headers = parseLine(lines[0]).map((h) => h.toLowerCase());
    const nameIdx = headers.findIndex((h) => h.includes("name") || h.includes("student"));
    const phoneIdx = headers.findIndex((h) => h.includes("phone") || h.includes("whatsapp") || h.includes("mobile") || h.includes("contact"));
    const emailIdx = headers.findIndex((h) => h.includes("email") || h.includes("mail"));
    const branchIdx = headers.findIndex((h) => h.includes("branch") || h.includes("course") || h.includes("stream") || h.includes("department"));
    const yearIdx = headers.findIndex((h) => h.includes("year") || h.includes("study") || h.includes("semester"));

    if (phoneIdx === -1) {
      throw new Error("Could not find a 'Phone' or 'WhatsApp' column in the CSV.");
    }

    const rows: any[] = [];
    for (let i = 1; i < lines.length; i++) {
      const cols = parseLine(lines[i]);
      const name = nameIdx !== -1 && cols[nameIdx] ? cols[nameIdx] : `Lead #${i}`;
      const phone = cols[phoneIdx] || "";
      const email = emailIdx !== -1 && cols[emailIdx] ? cols[emailIdx] : "";
      const branch = branchIdx !== -1 && cols[branchIdx] && cols[branchIdx] !== "Not Specified" ? cols[branchIdx] : "";
      const year = yearIdx !== -1 && cols[yearIdx] && cols[yearIdx] !== "Not Specified" ? cols[yearIdx] : "";

      if (phone && phone.length >= 8) {
        rows.push({
          name,
          phone,
          email: email || undefined,
          branch: branch || undefined,
          yearOfStudy: year || undefined,
        });
      }
    }

    return rows;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg("");
    setImportResult(null);
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const leads = parseCSV(text);
        setParsedLeads(leads);
      } catch (err: any) {
        setErrorMsg(err.message || "Failed to parse CSV file.");
      }
    };
    reader.readAsText(file);
  };

  const handleImportSubmit = async () => {
    if (parsedLeads.length === 0) {
      setErrorMsg("Please upload a valid CSV file first.");
      return;
    }

    const preparedLeads = parsedLeads.map((item) => ({
      ...item,
      collegeId: defaultCollegeId || undefined,
      collegeName: defaultCollegeName || undefined,
      assignedToUserId: defaultAssignedTo || undefined,
      quality: defaultQuality,
      source: "MANUAL_IMPORT",
    }));

    try {
      const res = await bulkImport({
        baseUrl,
        leads: preparedLeads,
      }).unwrap();

      setImportResult(res.data);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setErrorMsg(err?.data?.message || err?.message || "Failed to import leads.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-950/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                Bulk Import Leads (CSV)
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Upload session/college drive exports or lead spreadsheets
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
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {errorMsg && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 rounded-xl text-xs font-semibold">
              {errorMsg}
            </div>
          )}

          {importResult && (
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-sm">
                <CheckCircle2 className="w-5 h-5" />
                <span>Import Completed Successfully!</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                <div className="p-2 bg-white/60 dark:bg-zinc-900/60 rounded-lg">
                  <span className="text-emerald-500 block text-lg font-bold">{importResult.imported}</span>
                  <span>New Leads Added</span>
                </div>
                <div className="p-2 bg-white/60 dark:bg-zinc-900/60 rounded-lg">
                  <span className="text-indigo-500 block text-lg font-bold">{importResult.updated}</span>
                  <span>Updated Existing</span>
                </div>
                <div className="p-2 bg-white/60 dark:bg-zinc-900/60 rounded-lg">
                  <span className="text-zinc-400 block text-lg font-bold">{importResult.failed}</span>
                  <span>Skipped / Invalid</span>
                </div>
              </div>
            </div>
          )}

          {/* Upload Box */}
          {!importResult && (
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="hidden"
              />

              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-zinc-300 dark:border-zinc-700 hover:border-indigo-500 dark:hover:border-indigo-500 rounded-2xl p-6 text-center cursor-pointer bg-zinc-50 dark:bg-zinc-950/40 transition-colors"
              >
                <FileSpreadsheet className="w-10 h-10 text-indigo-500 mx-auto mb-2" />
                <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                  {fileName ? fileName : "Click to select a CSV file"}
                </p>
                <p className="text-[11px] text-zinc-500 mt-1">
                  Supports columns: Full Name, WhatsApp Phone, Email, Branch, Year of Study
                </p>
              </div>
            </div>
          )}

          {/* Batch Defaults */}
          {parsedLeads.length > 0 && !importResult && (
            <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800 space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 font-mono block">
                Batch Import Defaults ({parsedLeads.length} leads detected)
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-zinc-600 dark:text-zinc-400 block mb-1">
                    Assign College
                  </label>
                  <select
                    value={defaultCollegeId}
                    onChange={(e) => handleCollegeChange(e.target.value)}
                    className="w-full text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200"
                  >
                    <option value="">None / Keep Blank</option>
                    {colleges.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-zinc-600 dark:text-zinc-400 block mb-1">
                    Assign Counselor
                  </label>
                  <select
                    value={defaultAssignedTo}
                    onChange={(e) => setDefaultAssignedTo(e.target.value)}
                    className="w-full text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200"
                  >
                    <option value="">Unassigned</option>
                    {teamMembers.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name || m.phone}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-zinc-600 dark:text-zinc-400 block mb-1">
                    Default Quality
                  </label>
                  <select
                    value={defaultQuality}
                    onChange={(e) => setDefaultQuality(e.target.value)}
                    className="w-full text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200"
                  >
                    <option value="HOT">🔥 Hot</option>
                    <option value="WARM">☀️ Warm</option>
                    <option value="COLD">❄️ Cold</option>
                    <option value="POOR">⚠️ Poor</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Preview Table */}
          {parsedLeads.length > 0 && !importResult && (
            <div>
              <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-2">
                Preview First {Math.min(5, parsedLeads.length)} Records
              </span>
              <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-100 dark:bg-zinc-800/80 text-zinc-500 font-bold uppercase text-[10px]">
                    <tr>
                      <th className="p-2">Name</th>
                      <th className="p-2">Phone</th>
                      <th className="p-2">Branch</th>
                      <th className="p-2">Year</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                    {parsedLeads.slice(0, 5).map((r, i) => (
                      <tr key={i} className="text-zinc-800 dark:text-zinc-200">
                        <td className="p-2 font-semibold">{r.name}</td>
                        <td className="p-2 font-mono">{r.phone}</td>
                        <td className="p-2">{r.branch || "—"}</td>
                        <td className="p-2">{r.yearOfStudy || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-950/50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            {importResult ? "Close" : "Cancel"}
          </button>

          {!importResult && (
            <button
              type="button"
              onClick={handleImportSubmit}
              disabled={isLoading || parsedLeads.length === 0}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-all disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? (
                <span>Importing {parsedLeads.length} Leads...</span>
              ) : (
                <>
                  <UploadCloud className="w-4 h-4" />
                  <span>Import {parsedLeads.length} Leads</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
