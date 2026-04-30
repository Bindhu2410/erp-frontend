import React, { useEffect, useState } from "react";
import axios from "axios";
import Select, { StylesConfig } from "react-select";

interface TcDetail {
  id: number;
  tcId: number;
  sno: number;
  type: string;
  termsAndConditions: string;
}

interface TcTemplate {
  id: number;
  templateName: string;
  moduleName: string;
  templateDescription: string;
  details: TcDetail[];
}

interface SelectOption {
  value: TcTemplate;
  label: string;
}

type TermsProps = {
  data: Record<string, string>;
  onSave?: (terms: Record<string, string>) => Promise<void>;
  onChange?: (terms: Record<string, string>) => void;
  applyChanges?: boolean;
  tcTemplateId?: number;
  tcTemplateData?: TcTemplate | null;
};

const TermsAndConditions: React.FC<TermsProps> = ({
  data,
  onChange,
  applyChanges,
  tcTemplateId,
  tcTemplateData,
}) => {
  const [allTemplates, setAllTemplates] = useState<TcTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<TcTemplate | null>(null);
  const [editedTerms, setEditedTerms] = useState<Record<string, string>>({});

  // Fetch all templates for the dropdown
  useEffect(() => {
    axios
      .get("http://localhost:5104/api/TermsConditions")
      .then((res) => {
        const templates = Array.isArray(res.data) ? res.data : [];
        setAllTemplates(templates);
        if (tcTemplateId) {
          // Edit mode: auto-select matching template
          const matched = templates.find((t: TcTemplate) => t.id === tcTemplateId);
          if (matched) {
            setSelectedTemplate(matched);
            if (!tcTemplateData) applyTemplate(matched);
          }
        } else if (templates.length > 0) {
          // New mode: auto-select first template
          const first = templates[0];
          axios
            .get(`http://localhost:5104/api/TermsConditions/${first.id}`)
            .then((res) => applyTemplate(res.data))
            .catch(() => applyTemplate(first));
        }
      })
      .catch(() => setAllTemplates([]));
  }, [tcTemplateId]);

  // Apply template data when passed from parent (fills the text areas)
  useEffect(() => {
    if (tcTemplateData) {
      applyTemplate(tcTemplateData);
      // Also sync dropdown selection
      setSelectedTemplate(tcTemplateData);
    }
  }, [tcTemplateData]);

  const TERMS_ORDER = ["Taxes", "Freight Charges", "Delivery", "Payment", "Warranty"];

  const applyTemplate = (tpl: TcTemplate) => {
    setSelectedTemplate(tpl);
    const raw: Record<string, string> = {};
    (tpl.details || [])
      .sort((a, b) => a.sno - b.sno)
      .forEach((d) => { raw[d.type] = d.termsAndConditions || ""; });
    const terms: Record<string, string> = {};
    TERMS_ORDER.forEach((key) => { terms[key] = raw[key] ?? ""; });
    setEditedTerms(terms);
    if (applyChanges && onChange) onChange(terms);
  };

  const handleTemplateChange = (option: SelectOption | null) => {
    if (!option) {
      setSelectedTemplate(null);
      setEditedTerms({});
      if (applyChanges && onChange) onChange({});
      return;
    }
    // Fetch full template details by id
    axios
      .get(`http://localhost:5104/api/TermsConditions/${option.value.id}`)
      .then((res) => applyTemplate(res.data))
      .catch(() => applyTemplate(option.value));
  };

  const handleTermsChange = (key: string, value: string) => {
    setEditedTerms((prev) => {
      const updated = { ...prev, [key]: value };
      if (applyChanges && onChange) onChange(updated);
      return updated;
    });
  };

  const selectStyles: StylesConfig<SelectOption, false> = {
    menu: (provided) => ({ ...provided, zIndex: 9999 }),
    control: (provided) => ({
      ...provided,
      borderColor: "#E5E7EB",
      "&:hover": { borderColor: "#3B82F6" },
    }),
  };

  const templateOptions: SelectOption[] = allTemplates.map((t) => ({
    value: t,
    label: t.templateName,
  }));

  return (
    <div className="w-full mt-4 p-2 mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="p-4">
        <div className="border-b pb-4">
          <h2 className="text-2xl font-bold">Terms and Conditions*</h2>
        </div>

        {/* Template Selection */}
        <div className="mt-4">
          <div className="w-full bg-blue-50 p-4 rounded-lg border-2 border-blue-100">
            <label className="block text-base font-semibold text-blue-700 mb-2 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Select Terms Template
            </label>
            <Select<SelectOption>
              options={templateOptions}
              onChange={handleTemplateChange}
              value={templateOptions.find(opt => opt.value.id === selectedTemplate?.id) || null}
              className="w-[40%]"
              placeholder="Choose terms template..."
              styles={selectStyles}
              isClearable
            />
          </div>
        </div>

        {/* Terms Fields */}
        <div className="mt-4 space-y-4">
          {Object.entries(editedTerms).map(([key, value]) => (
            <div key={key} className="border-b pb-4">
              <h3 className="font-semibold text-lg mb-2">{key}</h3>
              <textarea
                className="w-full p-2 border rounded-md min-h-[100px] focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                value={value}
                onChange={(e) => handleTermsChange(key, e.target.value)}
                placeholder={`Enter ${key.toLowerCase()}...`}
              />
            </div>
          ))}
          {Object.keys(editedTerms).length === 0 && (
            <p className="text-gray-400 text-sm italic">Select a template to load terms and conditions.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default TermsAndConditions;
