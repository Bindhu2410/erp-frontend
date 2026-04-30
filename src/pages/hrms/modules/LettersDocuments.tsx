import React, { useState } from "react";
import {
  Mail, FileText, Eye, Download, CheckCircle, Clock,
  Plus, X, Printer, Building2
} from "lucide-react";
import { hrLetters, employees } from "../dummyData";
import { HRLetter } from "../types";

type LetterType = HRLetter["type"];

const letterTemplates: Record<LetterType, { description: string; color: string; bg: string }> = {
  "Offer Letter": {
    description: "Official offer of employment including role, compensation and start date.",
    color: "text-blue-700",
    bg: "bg-blue-50",
  },
  "Appointment Letter": {
    description: "Formal appointment confirming terms and conditions of employment.",
    color: "text-green-700",
    bg: "bg-green-50",
  },
  "Relieving Letter": {
    description: "Confirmation of employee's last working day and completion of notice period.",
    color: "text-orange-700",
    bg: "bg-orange-50",
  },
  "Experience Letter": {
    description: "Certificate of employment detailing tenure and role held by employee.",
    color: "text-purple-700",
    bg: "bg-purple-50",
  },
};

const generateLetterContent = (type: LetterType, employeeName: string, employeeId: string, dept: string, role: string, date: string): string => {
  const company = "JBS Tech Solutions Pvt. Ltd.";
  const today = date || new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });

  switch (type) {
    case "Offer Letter":
      return `Date: ${today}\n\nDear ${employeeName},\n\nWe are pleased to offer you the position of ${role} in the ${dept} department at ${company}.\n\nThis offer is subject to the terms and conditions outlined in our standard employment agreement. You will receive a detailed compensation structure upon joining.\n\nWe look forward to welcoming you to our team.\n\nYours sincerely,\nHR Department\n${company}`;
    case "Appointment Letter":
      return `Date: ${today}\n\nEmployee ID: ${employeeId}\n\nDear ${employeeName},\n\nThis is to formally confirm your appointment as ${role} in the ${dept} department at ${company}.\n\nYour terms of employment, benefits, and responsibilities are as outlined in the attached schedule. You are expected to adhere to the company's policies and code of conduct at all times.\n\nWelcome Aboard!\n\nHR Manager\n${company}`;
    case "Relieving Letter":
      return `Date: ${today}\n\nTo Whom It May Concern,\n\nThis is to certify that ${employeeName} (Employee ID: ${employeeId}) was employed with ${company} as ${role} in the ${dept} department.\n\n${employeeName} has been relieved from their duties effective ${today}, after successfully completing the notice period.\n\nWe wish them the very best in their future endeavors.\n\nHR Department\n${company}`;
    case "Experience Letter":
      return `Date: ${today}\n\nTo Whom It May Concern,\n\nThis is to certify that ${employeeName} (Employee ID: ${employeeId}) was employed with ${company} as ${role} in the ${dept} department.\n\nDuring their tenure, they demonstrated excellent professional conduct and made significant contributions to the organization.\n\nThis letter is issued on request and without prejudice.\n\nHR Manager\n${company}`;
  }
};

const LettersDocuments: React.FC = () => {
  const [letters, setLetters] = useState<HRLetter[]>(hrLetters);
  const [showGenModal, setShowGenModal] = useState(false);
  const [previewLetter, setPreviewLetter] = useState<{ type: LetterType; content: string; employee: string } | null>(null);
  const [genForm, setGenForm] = useState({ type: "Offer Letter" as LetterType, employeeId: "", date: "" });

  const getEmployee = (id: string) => employees.find(e => e.id === id);

  const handleGenerate = () => {
    const emp = getEmployee(genForm.employeeId);
    if (!emp) return;
    const content = generateLetterContent(genForm.type, emp.name, emp.id, emp.department, emp.role, genForm.date);
    setPreviewLetter({ type: genForm.type, content, employee: emp.name });

    // Add to records
    const newLetter: HRLetter = {
      id: `LTR${String(letters.length + 1).padStart(3, "0")}`,
      type: genForm.type,
      employeeId: emp.id,
      employeeName: emp.name,
      generatedDate: genForm.date || new Date().toISOString().split("T")[0],
      status: "Draft",
    };
    setLetters(prev => [newLetter, ...prev]);
    setShowGenModal(false);
  };

  const markAsIssued = (id: string) => {
    setLetters(prev => prev.map(l => l.id === id ? { ...l, status: "Issued" } : l));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Letters & Documents</h1>
          <p className="text-sm text-gray-500">Auto-generate and manage HR letters and certificates</p>
        </div>
        <button onClick={() => setShowGenModal(true)} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 font-medium text-sm">
          <Plus className="w-4 h-4" /> Generate Letter
        </button>
      </div>

      {/* Template Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {(Object.entries(letterTemplates) as [LetterType, any][]).map(([type, cfg]) => (
          <div key={type} className={`${cfg.bg} rounded-xl p-5 cursor-pointer hover:shadow-md transition-all border border-transparent hover:border-current`} onClick={() => { setGenForm(f => ({ ...f, type })); setShowGenModal(true); }}>
            <div className="flex items-center gap-3 mb-3">
              <FileText className={`w-6 h-6 ${cfg.color}`} />
              <h3 className={`font-semibold text-sm ${cfg.color}`}>{type}</h3>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">{cfg.description}</p>
            <button className={`mt-3 text-xs font-semibold ${cfg.color} flex items-center gap-1`}>
              Generate <Plus className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>

      {/* Letters Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100">
          <h2 className="font-semibold text-gray-800">Generated Letters</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {["Document ID", "Type", "Employee", "Generated Date", "Status", "Actions"].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {letters.map(letter => {
                const tpl = letterTemplates[letter.type];
                const emp = getEmployee(letter.employeeId);
                return (
                  <tr key={letter.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">{letter.id}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${tpl.bg} ${tpl.color}`}>
                        <FileText className="w-3 h-3" /> {letter.type}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xs font-bold">
                          {letter.employeeName.split(" ").map(n => n[0]).join("")}
                        </div>
                        <span className="font-medium text-gray-800">{letter.employeeName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{letter.generatedDate}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${letter.status === "Issued" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                        {letter.status === "Issued" ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                        {letter.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            if (emp) {
                              const content = generateLetterContent(letter.type, emp.name, emp.id, emp.department, emp.role, letter.generatedDate);
                              setPreviewLetter({ type: letter.type, content, employee: emp.name });
                            }
                          }}
                          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors" title="Preview"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded transition-colors" title="Download">
                          <Download className="w-4 h-4" />
                        </button>
                        {letter.status === "Draft" && (
                          <button onClick={() => markAsIssued(letter.id)} className="p-1.5 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded transition-colors" title="Mark as Issued">
                            <Mail className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Generate Modal */}
      {showGenModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-bold text-lg text-gray-800">Generate HR Letter</h2>
              <button onClick={() => setShowGenModal(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Letter Type</label>
                <select
                  value={genForm.type}
                  onChange={e => setGenForm(f => ({ ...f, type: e.target.value as LetterType }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 bg-white"
                >
                  {Object.keys(letterTemplates).map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Employee</label>
                <select
                  value={genForm.employeeId}
                  onChange={e => setGenForm(f => ({ ...f, employeeId: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 bg-white"
                >
                  <option value="">-- Select Employee --</option>
                  {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.name} ({emp.id})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  value={genForm.date}
                  onChange={e => setGenForm(f => ({ ...f, date: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
              <button onClick={() => setShowGenModal(false)} className="flex-1 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700">Cancel</button>
              <button onClick={handleGenerate} disabled={!genForm.employeeId} className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                <Printer className="w-4 h-4" /> Generate & Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewLetter && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-blue-700 rounded-t-2xl">
              <div className="text-white">
                <p className="font-bold">{previewLetter.type}</p>
                <p className="text-blue-200 text-sm">{previewLetter.employee}</p>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2 text-white hover:bg-blue-800 rounded-lg"><Printer className="w-4 h-4" /></button>
                <button className="p-2 text-white hover:bg-blue-800 rounded-lg"><Download className="w-4 h-4" /></button>
                <button onClick={() => setPreviewLetter(null)} className="p-2 text-white hover:bg-blue-800 rounded-lg"><X className="w-4 h-4" /></button>
              </div>
            </div>
            <div className="p-8">
              {/* Letter Header */}
              <div className="flex items-start justify-between mb-8 pb-4 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-700 rounded-xl flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-800">JBS Tech Solutions Pvt. Ltd.</p>
                    <p className="text-xs text-gray-500">123 Tech Park, Chennai, Tamil Nadu 600001</p>
                  </div>
                </div>
                <div className="text-right text-xs text-gray-500">
                  <p>HR Reference</p>
                  <p className="font-mono font-bold text-gray-700">LTR-2026-{Math.floor(Math.random() * 9000) + 1000}</p>
                </div>
              </div>
              {/* Letter Content */}
              <div className="bg-gray-50 rounded-xl p-6">
                <pre className="whitespace-pre-wrap font-sans text-sm text-gray-700 leading-relaxed">
                  {previewLetter.content}
                </pre>
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button onClick={() => setPreviewLetter(null)} className="px-5 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700">Close</button>
                <button className="px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center gap-2">
                  <Download className="w-4 h-4" /> Download PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LettersDocuments;
