import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  LuStore as Store,
  LuUser,
  LuBriefcase,
  LuFileText,
  LuPlus,
  LuTrash2,
  LuSave,
  LuX,
  LuSearch,
  LuPaperclip,
  LuLink,
  LuCalendar,
  LuPhone,
  LuMail,
  LuMapPin,
  LuGraduationCap,
  LuAward,
  LuBanknote,
  LuFileCheck,
  LuGlobe,
  LuUsers,
  LuBookOpen,
  LuChevronLeft,
  LuChevronRight,
  LuCurrency,
} from "react-icons/lu";
import api from "../../services/api";
import { toast } from "react-toastify";
import { EmployeeData, EmployeeResponse } from "../../types/employee";
import employeeService from "../../services/employeeService";
import { CgSoftwareUpload } from "react-icons/cg";
import departmentService from "../../services/DepartmentService";
import designationService from "../../services/DesignationService";
interface EmployeeProps {
  employee?: Record<string, any>;
  isEditMode?: boolean;
  onSuccess?: () => void;
  onCancel?: () => void;
  showHeader?: boolean;
}
interface FormOption {
  label: string;
  value: string | number;
  disabled?: boolean;
}

interface FormField {
  key: string;
  label: string;
  type:
  | "text"
  | "number"
  | "email"
  | "date"
  | "datetime-local"
  | "checkbox"
  | "select"
  | "textarea"
  | "password"
  | "tel"
  | "url"
  | "time";
  required?: boolean;
  placeholder?: string;
  options?: FormOption[];
  colSpan?: 1 | 2 | 3;
  disabled?: boolean;
  hidden?: boolean;
  readOnly?: boolean;
  min?: number;
  max?: number;
  step?: number;
  pattern?: string;
  rows?: number;
  defaultValue?: any;
  validation?: {
    pattern?: RegExp;
    message?: string;
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
    custom?: (value: any, formData: any) => string | boolean;
  };
  dependencies?: string[];
  computedValue?: (formData: any) => any;
  autoComplete?: string;
  helpText?: string;
}

interface TableColumn {
  key: string;
  label: string;
  type: "text" | "number" | "date" | "select" | "checkbox" | "email" | "tel" | "time";
  required?: boolean;
  options?: FormOption[];
  width?: string;
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number;
}

interface TableTab {
  id: string;
  label: string;
  type: "table";
  icon?: React.ReactNode;
  description?: string;
  columns: TableColumn[];
  canAddRows?: boolean;
  canDeleteRows?: boolean;
  canEditRows?: boolean;
  minRows?: number;
  maxRows?: number;
  actions?: TableAction[];

}
interface TableAction {
  key: string;
  label: string;
  type: string;   // ✅ change here
  icon?: string;
}

interface FormTab {
  id: string;
  label: string;
  type: "form";
  icon?: React.ReactNode;
  description?: string;
  fields: FormField[];
}

type Tab = FormTab | TableTab;


// JSON Configuration for all tabs matching the image
const TABS_CONFIG: Tab[] = [
  {
    id: "salaryDetails",
    label: "Salary Details",
    type: "form",
    icon: <LuCurrency size={18} />,
    fields: [

      {
        key: "salary",
        label: "Salary",
        type: "number",
        required: true,
        placeholder: "0",
        colSpan: 1,
        validation: {
          min: 0,
          message: "salary must be >= 0",
        },
      },
      {
        key: "basicSalary",
        label: "Basic Salary",
        type: "number",
        required: true,
        colSpan: 1,
        validation: {
          min: 0,
          message: "Basic salary must be >= 0",
        },
        computedValue: (formData: any) => {
          const salary = Number(formData.salary) || 0;
          return Number((salary * 0.6).toFixed(2));
        }
      },

      // HRA (allowance, depends on company policy - editable)
      {
        key: "hra",
        label: "HRA",
        type: "number",
        placeholder: "0",
        colSpan: 1,
        validation: {
          min: 0,
          message: "HRA must be >= 0",
        },
        computedValue: (formData: any) => {
          const salary = Number(formData.salary) || 0;
          return Number((salary * 0.3).toFixed(2));
        }

      },

      // Conveyance (allowance, editable)
      {
        key: "conveyance",
        label: "Conveyance",
        type: "number",
        colSpan: 1,
        validation: {
          min: 0,
          message: "Conveyance must be >= 0",
        },
        computedValue: (formData: any) => {
          const salary = Number(formData.salary) || 0;
          return Number((salary * 0.05).toFixed(2));
        }

      },

      // City Compensatory Allowance (editable)
      {
        key: "cityCompn",
        label: "City Compensatory Allowance (CCA)",
        type: "number",
        placeholder: "0",
        colSpan: 1,
        validation: {
          min: 0,
          message: "CCA must be >= 0",
        },
        computedValue: (formData: any) => {
          const salary = Number(formData.salary) || 0;
          return Number((salary * 0.05).toFixed(2));
        }
      },


      {
        key: "esiApp",
        label: "ESI Applicable",
        required: true,
        type: "select",
        options: [
          { label: "Select", value: "" },
          { label: "Yes", value: "yes" },
          { label: "No", value: "no" },
        ],
        colSpan: 1,

      },

      // ESI Number (conditional on esiApp = yes)
      {
        key: "esiNum",
        label: "ESI Number",
        type: "text",
        placeholder: "ESI123456",
        colSpan: 1,

      },

      // ESI Date
      {
        key: "esiDt",
        label: "ESI Date",
        type: "date",
        colSpan: 1,
      },

      // ESI Percentage (AUTO-CALCULATED, typically 0.75% or based on policy)
      {
        key: "esiPer",
        label: "ESI Percentage",
        type: "number",
        placeholder: "1.75",
        colSpan: 1,
        readOnly: true,
        computedValue: ({ esiApp }: any) =>
          esiApp === "yes" ? 0.75 : 0,
      },
      {
        key: "esiEmployee",
        label: "ESI Amount (1.75%)",
        type: "number",
        readOnly: true,
        colSpan: 1,
        computedValue: (formData: any) => {
          if (formData.esiApp !== "yes") return 0;
          const salary = Number(formData.salary) || 0;
          return Number((salary * 0.0075).toFixed(2));
        },
      },
      {
        key: "esiEmployeeamt",
        label: "ESI Amount",
        type: "number",
        readOnly: true,
        colSpan: 1,
        computedValue: ({ salary, esiApp }: any) =>
          esiApp === "yes"
            ? Number(((Number(salary) || 0) * 0.0075).toFixed(2))
            : 0,
      },


      // ESI computed amounts (employee & employer) based on totalSalary
      // {
      //   key: "esiEmployee",
      //   label: "ESI (Employee)",
      //   type: "number",
      //   placeholder: "0",
      //   colSpan: 1,
      //   readOnly: true,
      //   computedValue: (formData: any) => {
      //     const total = Number(formData.totalSalary) || 0;
      //     const pct = Number(formData.esiPercentage) || 0;
      //     return Number(((total * pct) / 100).toFixed(2));
      //   },
      // },

      // {
      //   key: "esiEmployer",
      //   label: "ESI (Employer)",
      //   type: "number",
      //   placeholder: "0",
      //   colSpan: 1,
      //   readOnly: true,
      //   computedValue: (formData: any) => {
      //     const total = Number(formData.totalSalary) || 0;
      //     // employer percent typically 3.25%
      //     const empPct = formData.esiApplicable === "yes" ? 3.25 : 0;
      //     return Number(((total * empPct) / 100).toFixed(2));
      //   },
      // },

      //     {
      //   key: "totalSalary",
      //   label: "Total Salary (Auto-Calculated)",
      //   type: "number",
      //   placeholder: "0",
      //   colSpan: 1,
      //   readOnly: true,

      //   computedValue: (formData: any) => {
      //     const basic = Number(formData.basicSalary) || 0;
      //     const hra = Number(formData.hra) || 0;
      //     const conv = Number(formData.conveyance) || 0;
      //     const cca = Number(formData.cityCompensatoryAllowance) || 0;
      //     return basic + hra + conv + cca;
      //   },
      // },


      // PF Applicable (Yes/No)
      {
        key: "pfApp",
        label: "PF Applicable",
        type: "select",
        required: true,
        options: [
          { label: "Select", value: "" },
          { label: "Yes", value: "yes" },
          { label: "No", value: "no" },
        ],
        colSpan: 1,

      },

      // PF Number (conditional on pfApp = yes)
      {
        key: "pfNum",
        label: "PF Number",
        type: "text",
        placeholder: "PF123456",
        colSpan: 1,
      },

      // PF Date
      {
        key: "pfDt",
        label: "PF Date",
        type: "date",
        colSpan: 1,
      },

      // PF Percentage (AUTO-CALCULATED, typically 12% employee + 3.67% employer)
      {
        key: "pfPer",
        label: "PF Percentage",
        type: "number",
        placeholder: "12",
        colSpan: 1,
        readOnly: true,
        computedValue: (formData: any) => {
          const basic = Number(formData.basicSalary) || 0;
          return formData.pfApp === "yes" ? 12 : 0;
        }
      },
      {
        key: "pfAmount",
        label: "PF Amount",
        type: "number",
        readOnly: true,
        colSpan: 1,
        computedValue: ({ basicSalary, pfApp }: any) =>
          pfApp === "yes"
            ? Number(((Number(basicSalary) || 0) * 0.12).toFixed(2))
            : 0,
      }
      ,

      // PF amount calculated on Basic salary
      // {
      //   key: "pfAmount",
      //   label: "PF Amount",
      //   type: "number",
      //   placeholder: "0",
      //   colSpan: 1,
      //   readOnly: true,
      //   computedValue: (formData: any) => {
      //     const basic = Number(formData.basicSalary) || 0;
      //     const pct = Number(formData.pfPercentage) || 0;
      //     return Number(((basic * pct) / 100).toFixed(2));
      //   },
      // },

      // TDS (Tax Deducted at Source - may be auto-calculated based on income slab)
      {
        key: "tds",
        label: "TDS",
        type: "number",
        placeholder: "0",
        colSpan: 1,
        validation: {
          min: 0,
          message: "TDS must be >= 0",
        },
      },

      // Effective From (required)
      {
        key: "effFrom",
        label: "Effective From",
        type: "date",
        required: true,
        colSpan: 1,
      },

      // Effective To (optional)
      {
        key: "effTo",
        label: "Effective To",
        type: "date",
        colSpan: 1,
      },

      // Active (Yes/No)
      {
        key: "active",
        label: "Active",
        type: "select",
        required: true,
        options: [
          { label: "Select", value: "" },
          { label: "Yes", value: "yes" },
          { label: "No", value: "no" },
        ],
        colSpan: 1,

      },
    ],
  },
  {
    id: "employment",
    label: "Assignement Details",
    type: "form",
    icon: <LuBriefcase size={18} />,
    description: "Employment history and organizational assignment",
    fields: [
      {
        key: "dateOfJoining",
        label: "Date of Joining",
        type: "date",
        required: true,
      },
      { key: "lastWorkingDate", label: "Last Working Date", type: "date" },
      {
        key: "departmentId",
        label: "Department",
        type: "select",
        required: true,
        options: []
      },
      {
        key: "designation", label: "Designation", type: "select", required: true,
        options: [{ label: "select", value: '' }]
      },
      {
        key: "employeeGrade", label: "Employee Grade", type: "text",
      },
      { key: "reportManager", label: "Report Manager", type: "text" },
      { key: "reportManagerCode", label: "Report Manager Code", type: "text" },
      {
        key: "reportingHeadMail",
        label: "Reporting Head Email",
        type: "email",
      },
      {
        key: "noticePeriod",
        label: "Notice Period (Days)",
        type: "number",
        min: 0,
        max: 90,
      },
      {
        key: "costCenter", label: "Cost Center", type: "text",
      },
      {
        key: "rejoineeDate",
        label: "Rejoinee Date",
        type: "date",
      },
      {
        key: "empInTime",
        label: "In Time",
        type: "time",
      },
      {
        key: "empOutTime",
        label: "Out Time",
        type: "time",
      },
      // {
      //   key: "TypeOfEmployment",
      //   label: "Employment Type",
      //   type: "select",
      //   options: [
      //     { label: "Select", value: "", disabled: true },
      //     { label: "Permanent", value: "permanent" },
      //     { label: "Contract", value: "contract" },
      //     { label: "Temporary", value: "temporary" },
      //   ],
      // },
      // {
      //   key: "IsExService",
      //   label: "Ex-Service Personnel",
      //   type: "select",
      //   options: [
      //     { label: "Yes", value: "true" },
      //     { label: "No", value: "false" },
      //   ],
      // },
      {
        key: "idCardNo",
        label: "Id Card Number",
        type: "text"
      },
      {
        key: "country",
        label: "Work Country",
        type: "text"
      },
      {
        key: "city",
        label: "Work City",
        type: "text"
      }
    ],
  },
  {
    id: "personal",
    label: "Personal Details",
    type: "form",
    icon: <LuUser size={18} />,
    fields: [
      {
        key: "birthPlace",
        label: "Birth Place",
        type: "text"
      },
      {
        key: "religion",
        label: "Religion",
        type: "text"
      },
      {
        key: "homeState",
        label: "Home State",
        type: "text"
      },
      {
        key: "nationality",
        label: "Nationality",
        type: "text"
      },
      {
        key: "countryBirth",
        label: "Country",
        type: "text"
      },
      {
        key: "isExService",
        label: "Is Ex Service",
        type: "select",
        options: [
          { label: "Select", value: "" },
          { label: "Yes", value: "yes" },
          { label: "No", value: "no" }
        ]
      },
      {
        key: "nominee",
        label: "Nominee",
        type: "text"
      },
      {
        key: "nomineeRelationship",
        label: "Relationship",
        type: "text"
      },
      {
        key: "recruiterName",
        label: "Recruiter Name",
        type: "text"
      },
      {
        key: "reference",
        label: "Reference",
        type: "text"
      },
    ]

  },
  {
    id: "languages",
    label: "Languages Known",
    type: "table",
    icon: <LuGlobe size={18} />,
    description: "Languages and communication skills",
    canAddRows: true,
    canDeleteRows: true,
    canEditRows: true,
    columns: [
      {
        key: "language",
        label: "Language",
        type: "text",
        required: true,
        placeholder: "English",
        width: "200px",
      },
      {
        key: "proficiency",
        label: "Proficiency Level",
        type: "select",
        required: true,
        options: [
          { label: "Select Level", value: "", disabled: true },
          { label: "Beginner", value: "beginner" },
          { label: "Intermediate", value: "intermediate" },
          { label: "Advanced", value: "advanced" },
          { label: "Native", value: "native" },
        ],
        width: "150px",
      },
      {
        key: "read",
        label: "Read",
        type: "checkbox",
        width: "80px",
      },
      {
        key: "write",
        label: "Write",
        type: "checkbox",
        width: "80px",
      },
      {
        key: "speak",
        label: "Speak",
        type: "checkbox",
        width: "80px",
      },
      {
        key: "understand",
        label: "Understand",
        type: "checkbox",
        width: "100px",
      },
    ],
  },
  {
    id: "Information",
    label: "Information",
    type: "form",
    icon: <LuFileCheck size={18} />,
    description: "Government ID and identification documents",
    fields: [
      {
        key: "passportNo",
        label: "Passport Number ",
        type: "text"
      },
      {
        key: "nameAsPerPassport",
        label: "Name as per Passport",
        type: "text"
      },
      {
        key: "passportExpiryDate",
        label: "Passport Expiry Date",
        type: "date"
      },
      {
        key: "passportIssuePlace",
        label: "Place of Issue",
        type: "text"
      },
      {
        key: "passportIssueDate",
        label: "Passport Issue Date",
        type: "date"
      },
      {
        key: "mothersMaidenName",
        label: "Mother’s Maiden Name",
        type: "text"
      },
      {
        key: "oldPassportNo",
        label: "Old Passport Number",
        type: "text",
      },
      {
        key: "insuranceName",
        label: "Insurance Name",
        type: "text"
      },
      {
        key: "insuranceNo",
        label: "Insurance Number",
        type: "text"
      },
      {
        key: "bankName",
        label: "Bank Name",
        type: "text"
      },
      {
        key: "branchName",
        label: "Branch Name",
        type: "text"
      },
      {
        key: "bankAcNo",
        label: "Bank Account Number",
        type: "text"
      },
      {
        key: "ifscCode",
        label: "IFSC Code",
        type: "text"
      },
      {
        key: "panNo",
        label: "PAN Number",
        type: "text"
      },
      {
        key: "esiNo",
        label: "ESI Number",
        type: "text"
      },
      {
        key: "esiEffDate",
        label: "Effective Date (ESI)",
        type: "date"
      },
      {
        key: "pfNo",
        label: "PF Number",
        type: "text"
      },
      {
        key: "pfEffDate",
        label: "Effective Date (PF)",
        type: "date"
      },
      {
        key: "voterId",
        label: "Voter ID Number",
        type: "text"
      },
      {
        key: "drivingLicenseNo",
        label: "Driving License Number",
        type: "text"
      },
      {
        key: "aadharNo",
        label: "Aadhaar Number",
        type: "number"
      },
    ],
  },
  {
    id: "addresses",
    label: "Contact Details",
    type: "form",
    icon: <LuMapPin size={18} />,
    description: "Permanent and correspondence addresses",
    fields: [
      {
        key: "permAddress",
        label: "Permanent Address",
        type: "textarea",
        rows: 2,
      },
      { key: "permCity", label: "Permanent City", type: "text" },
      { key: "permState", label: "Permanent State", type: "text" },
      { key: "permPincode", label: "Permanent Pincode", type: "text" },
      { key: "permCountry", label: "Permanent Country", type: "text" },
      { key: "permTelephone", label: "Permanent Telephone", type: "tel" },
      { key: "permMobile", label: "Permanent Mobile", type: "tel" },
      { key: "permEmail", label: "Permanent Email", type: "email" },
      {
        key: "permContactPerson",
        label: "Permanent Contact Person",
        type: "text",
      },
      {
        key: "commAddress",
        label: "Correspondence Address",
        type: "textarea",
        rows: 2,
      },
      { key: "commCity", label: "Correspondence City", type: "text" },
      { key: "commState", label: "Correspondence State", type: "text" },
      { key: "commPincode", label: "Correspondence Pincode", type: "text" },
      { key: "commCountry", label: "Correspondence Country", type: "text" },
      { key: "commTelephone", label: "Correspondence Telephone", type: "tel" },
      { key: "commMobile", label: "Correspondence Mobile", type: "tel" },
      { key: "commEmail", label: "Correspondence Email", type: "email" },
      {
        key: "commContactPerson",
        label: "Correspondence Contact Person",
        type: "text",
      },
    ],
  },
  {
    id: "family",
    label: "Family Details",
    type: "table",
    icon: <LuUsers size={18} />,
    description: "Family members information",
    canAddRows: true,
    canDeleteRows: true,
    canEditRows: true,
    columns: [
      { key: "familyName", label: "Name", type: "text", required: true },
      {
        key: "familyRelationship",
        label: "Relationship",
        type: "select",
        required: true,
        options: [
          { label: "Select", value: "" },
          { label: "Husband", value: "Husband" },
          { label: "Wife", value: "Wife" },
          { label: "Father", value: "Father" },
          { label: "Mother", value: "Mother" },
          { label: "Son", value: "Son" },
          { label: "Daughter", value: "Daughter" },
          { label: "Other", value: "Other" },
        ]
      },
      { key: "familyAge", label: "Age", type: "number", min: 0, max: 120 },
      { key: "familyOccupation", label: "Occupation", type: "text" },
      { key: "familyPrimaryContact", label: "Primary Contact", type: "checkbox" },
      { key: "familyContact", label: "Contact", type: "tel" },
      { key: "familyEmail", label: "Email", type: "email" },
    ],
  },
  {
    id: "education",
    label: "Education Skills",
    type: "table",
    icon: <LuGraduationCap size={18} />,
    description: "Educational qualifications and achievements",
    actions: [
      {
        key: "upload",
        label: "Upload",
        type: "button",
        icon: "upload"
      }
    ],
    canAddRows: true,
    canDeleteRows: true,
    canEditRows: true,
    columns: [
      { key: "eduCourse", label: "Course/Degree", type: "text", required: true },
      {
        key: "eduBoard",
        label: "Board/University",
        type: "text",
        required: true,
      },
      {
        key: "eduInstitution",
        label: "Institution",
        type: "text",
        required: true,
      },
      { key: "eduPassDate", label: "Completion Date", type: "text" },
      {
        key: "eduPercentage",
        label: "Percentage",
        type: "number",
        min: 0,
        max: 100,
      },
    ],
  },
  {
    id: "achievements",
    label: "Special Achievements",
    type: "table",
    icon: <LuAward size={18} />,
    description: "Awards, achievements, and recognitions",
    canAddRows: true,
    canDeleteRows: true,
    canEditRows: true,
    columns: [
      {
        key: "achievementWhat",
        label: "What",
        type: "text",
      },
      {
        key: "achievementWhen",
        label: "When",
        type: "date",
      },
      {
        key: "achievementWhere",
        label: "Where",
        type: "text",
      },
      {
        key: "achievementRemarks",
        label: "Remark",
        type: "text",
      },
    ],
  },
  {
    id: "previousEmployment",
    label: "Previous Employment",
    type: "table",
    icon: <LuBriefcase size={18} />,
    description: "Previous work experience",
    actions: [
      {
        key: "upload",
        label: "Upload",
        type: "button",
        icon: "upload"
      }
    ],
    canAddRows: true,
    canDeleteRows: true,
    canEditRows: true,
    columns: [
      {
        key: "prevCompanyName",
        label: "Company Name",
        type: "text",
        required: true,
      },
      {
        key: "prevLastDesignation",
        label: "last held designation",
        type: "text",
        required: true,
      },
      {
        key: "prevStartDate",
        label: "Start Date",
        type: "date",
        required: true,
      },
      { key: "prevEndDate", label: "End Date", type: "date" },
      {
        key: "prevRelevantExpYear",
        label: "Relevant Experience (Years)",
        type: "number",
        min: 0,
      },
      {
        key: "prevRelevantExpMonth",
        label: "Relevant Experience (Months)",
        type: "number",
        min: 0,
        max: 11,
      },
      { key: "prevPpfNo", label: "PF Number", type: "text" },
      { key: "prevPesiNo", label: "ESI Number", type: "text" },
    ],
  },
  {
    id: "employeeAllowances",
    label: "Allowances Details",
    type: "table",
    icon: <LuCurrency size={18} />,
    description: "Additional allowances and benefits",
    canAddRows: true,
    canDeleteRows: true,
    canEditRows: true,
    columns: [
      {
        key: "allowEffFrom",
        label: "Effective Date From",
        type: "date",
        required: true,
      },
      {
        key: "allowEffTo",
        label: "Effective Date To",
        type: "date",
      },
      {
        key: "allowanceType",
        label: "Allowance Type",
        type: "text",
        placeholder: "Travel, Food, etc.",
      },
      {
        key: "allowanceAmount",
        label: "Amount",
        type: "number",
        placeholder: "0.00",
        min: 0,
        step: 0.01,
      },
    ],
  }
];

interface TableRowData {
  id: string;
  [key: string]: any;
  isNew?: boolean;
}

const EmployeeInfoForm: React.FC<EmployeeProps> = ({
  employee,
  isEditMode = false,
  onSuccess,
  onCancel,
  showHeader = true,
}) => {
  const navigate = useNavigate();
  // State management
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [tableData, setTableData] = useState<Record<string, TableRowData[]>>(
    {}
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [activeTab, setActiveTab] = useState<string>("salaryDetails");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const tabsRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploadErrors, setUploadErrors] = useState<Record<string, string | null>>({});
  const [educationFiles, setEducationFiles] = useState<File[]>([]);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [departments, setDepartments] = useState<Array<{ label: string; value: string | number; disabled?: boolean }>>([]);
  const [designations, setDesignations] = useState<Array<{ label: string; value: string | number; disabled?: boolean }>>([]);
  const [loadingDropdowns, setLoadingDropdowns] = useState(true);




  // Fetch departments and designations on component mount
  useEffect(() => {
    const fetchDropdownData = async () => {
      setLoadingDropdowns(true);
      try {
        // Fetch departments
        const deptResponse = await departmentService.getDepartments();
        if (deptResponse.success && deptResponse.data) {
          const deptOptions = deptResponse.data.map((dept: any) => ({
            label: dept.name,
            value: dept.id,
          }));
          setDepartments([{ label: "Select Department", value: "", disabled: true }, ...deptOptions]);
        }

        // Fetch designations
        const desigResponse = await designationService.getDesignations();
        if (desigResponse.success && desigResponse.data) {
          const desigOptions = desigResponse.data.map((desig: any) => ({
            label: desig.name,
            value: desig.id,
          }));
          setDesignations([{ label: "Select Designation", value: "", disabled: true }, ...desigOptions]);
        }
      } catch (error) {
        console.error("Error fetching dropdown data:", error);
        toast.error("Failed to load departments or designations");
      } finally {
        setLoadingDropdowns(false);
      }
    };

    fetchDropdownData();
  }, []);

  // Get dynamic options for form fields based on fetched data
  const getFieldOptions = (fieldKey: string): FormOption[] => {
    switch (fieldKey) {
      case "departmentId":
        return departments;
      case "designation":
        return designations;
      default:
        return [];
    }
  };

  const handleDocumentUpload = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isImage = file.type.startsWith("image/");
    const IsPdf = file.type === "application/pdf";

    if (!IsPdf && !isImage) {
      e.target.value = "";
      setUploadErrors((prev) => ({
        ...prev,
        [activeTab]: "Only image or PDF files are allowed.",
      }));
      return;
    }

    const maxSize = 25 * 1024 * 1024;
    if (file.size > maxSize) {
      setUploadErrors((prev) => ({
        ...prev,
        [activeTab]: "File size must be less than 25 MB.",
      }));
      e.target.value = "";
      return;
    }

    if (activeTab === "education") {
      setEducationFiles((prev) => [...prev, file]);
    }
    setUploadErrors((prev) => ({
      ...prev,
      [activeTab]: null,
    }));
    e.target.value = "";
  };

  const uploadEducationFiles = async (employeeId?: string): Promise<string[]> => {
    const filePaths: string[] = [];
    if (educationFiles.length === 0) return filePaths;
    const empId = employeeId || formData.employeeId;
    const uploadUrl = empId
      ? `${process.env.REACT_APP_API_BASE_URL}/Storage/upload/EmployeeEducation?employeeId=${encodeURIComponent(empId)}`
      : `${process.env.REACT_APP_API_BASE_URL}/Storage/upload/EmployeeEducation`;
    for (const file of educationFiles) {
      try {
        const uploadFormData = new FormData();
        uploadFormData.append("file", file);
        const response = await fetch(uploadUrl, {
          method: "POST",
          body: uploadFormData,
        });
        if (response.ok) {
          const result = await response.json();
          filePaths.push(result.filePath);
          console.log("Education document uploaded:", result.fileName, "Path:", result.filePath);
        } else {
          console.error("Failed to upload education document:", file.name);
        }
      } catch (error) {
        console.error("Error uploading education document:", file.name, error);
      }
    }
    return filePaths;
  }


  // Initialize form data
  useEffect(() => {
    const initialFormData: Record<string, any> = {};
    TABS_CONFIG.forEach((tab) => {
      if (tab.type === "form") {
        tab.fields.forEach((field) => {
          if (field.defaultValue !== undefined) {
            initialFormData[field.key] = field.defaultValue;
          } else if (field.type === "checkbox") {
            initialFormData[field.key] = false;
          } else if (field.type === "select") {
            const defaultOption =
              field.options?.find((opt) => !opt.disabled)?.value || "";
            initialFormData[field.key] = defaultOption;
          } else {
            initialFormData[field.key] = "";
          }
        });
      }
    });

    // Set default values from image
    initialFormData.company = "MS MEDITEC INDIA PVT LTD";
    initialFormData.country = "India";
    initialFormData.nationality = "Indian";
    initialFormData.salesNote = "Value: 0.00";

    setFormData(initialFormData);
  }, []);

  // Initialize table data
  useEffect(() => {
    const initialTableData: Record<string, TableRowData[]> = {};
    TABS_CONFIG.forEach((tab) => {
      if (tab.type === "table") {
        initialTableData[tab.id] = []
      }
    });
    setTableData(initialTableData);
  }, []);

  // Load employee data in edit mode
  useEffect(() => {
    const loadEmployeeData = async () => {
      if (employee && isEditMode) {
        setIsLoading(true);
        try {
          let employeeData = employee || {};

          // 1️⃣ Fetch complete employee data from the backend
          if (employeeData.id) {
            const response = await employeeService.getEmployeeById(employeeData.id);
            if (response.success && response.data) {
              employeeData = response.data;
            }
          }

          // 2️⃣ Helper to normalize PascalCase/Mixed keys to camelCase and format dates
          const normalizeKeys = (obj: any) => {
            if (!obj || typeof obj !== 'object') return obj;
            const normalized: any = {};
            Object.keys(obj).forEach((key) => {
              const camelKey = key.charAt(0).toLowerCase() + key.slice(1);
              let val = obj[key];

              // Convert booleans to "yes"/"no" for UI selects
              const booleanFields = ["active", "esiApp", "pfApp", "isExService"];
              if (booleanFields.includes(camelKey)) {
                val = (val === true || val === "true") ? "yes" : "no";
              }

              // Format date strings for HTML5 date inputs (YYYY-MM-DD)
              if (val && typeof val === 'string' &&
                (key.toLowerCase().includes('date') ||
                  key.toLowerCase().includes('dt') ||
                  key.toLowerCase().includes('when') ||
                  key.toLowerCase().includes('efffrom') ||
                  key.toLowerCase().includes('effto'))) {
                const dateMatch = val.match(/^\d{4}-\d{2}-\d{2}/);
                if (dateMatch) {
                  val = dateMatch[0];
                }
              }

              // Ensure tel types are strings
              if (val !== undefined && val !== null &&
                (key.toLowerCase().includes('mobile') ||
                  key.toLowerCase().includes('tel') ||
                  key.toLowerCase().includes('contact') ||
                  key.toLowerCase().includes('phone'))) {
                val = String(val);
              }

              normalized[camelKey] = val;
            });
            return normalized;
          };

          const normalizedData = normalizeKeys(employeeData);

          // 3️⃣ Update form data
          setFormData((prev) => ({
            ...prev,
            ...normalizedData,
          }));

          // Set photo preview if imageUrl exists
          if (normalizedData.imageUrl) {
            setPhotoPreview(normalizedData.imageUrl);
          }

          // 4️⃣ Update table data (Family, Education, etc.)
          TABS_CONFIG.forEach((tab) => {
            if (tab.type === "table") {
              const tabValue = normalizedData[tab.id];

              if (tabValue && Array.isArray(tabValue)) {
                // Handle array-based data (e.g., employeeAllowances)
                setTableData((prev) => ({
                  ...prev,
                  [tab.id]: tabValue.map((item: any, index: number) => ({
                    id: `${tab.id}_${index}`,
                    ...normalizeKeys(item),
                  })),
                }));
              } else {
                // Reverse map flat fields to table structure for single-record API design
                const mappings: Record<string, string[]> = {
                  family: ["familyName", "familyAge", "familyRelationship", "familyOccupation", "familyPrimaryContact", "familyContact", "familyEmail"],
                  education: ["eduCourse", "eduBoard", "eduInstitution", "eduPassDate", "eduPercentage"],
                  achievements: ["achievementWhat", "achievementWhen", "achievementWhere", "achievementRemarks"],
                  previousEmployment: ["prevCompanyName", "prevLastDesignation", "prevRelevantExpYear", "prevRelevantExpMonth", "prevPpfNo", "prevPesiNo", "prevStartDate", "prevEndDate"],
                };

                if (mappings[tab.id]) {
                  const rowData: TableRowData = { id: `${tab.id}_0` };
                  let hasAnyData = false;
                  mappings[tab.id].forEach(field => {
                    let val = normalizedData[field];
                    if (field === "familyPrimaryContact") {
                      val = val === "Yes" || val === true;
                    }
                    if (val !== undefined && val !== null && val !== "") {
                      rowData[field] = val;
                      hasAnyData = true;
                    }
                  });
                  if (hasAnyData) {
                    setTableData(prev => ({ ...prev, [tab.id]: [rowData] }));
                  }
                }

                // Handle languages string to table mapping
                if (tab.id === "languages" && normalizedData.languageKnown) {
                  const langs = normalizedData.languageKnown.split(',').map((l: string, i: number) => ({
                    id: `languages_${i}`,
                    language: l.trim(),
                    proficiency: "intermediate",
                    read: true,
                    write: true,
                    speak: true,
                    understand: true
                  }));
                  setTableData(prev => ({ ...prev, languages: langs }));
                }
              }
            }
          });
        } catch (error) {
          console.error("Error loading employee data:", error);
          toast.error("Failed to load employee data");
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadEmployeeData();
  }, [employee, isEditMode]);

  // Handle form field changes
  const handleFormChange = (field: string, value: any) => {
    // Update form data and then apply any computed fields defined in TABS_CONFIG
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };

      // Apply computed values for form tabs in the order they appear in TABS_CONFIG.
      TABS_CONFIG.forEach((tab) => {
        if (tab.type === "form") {
          tab.fields.forEach((f) => {
            if (typeof f.computedValue === "function") {
              try {
                const computed = f.computedValue(updated);
                // Only overwrite if computed is not undefined
                if (computed !== undefined) {
                  updated[f.key] = computed;
                }
              } catch (err) {
                // ignore compute errors to avoid breaking UI
                console.error("Error computing field", f.key, err);
              }
            }
          });
        }
      });

      return updated;
    });

    setTouched((prev) => ({ ...prev, [field]: true }));
    setHasChanges(true);

    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // Handle table row changes
  const handleTableChange = (
    tabId: string,
    rowId: string,
    field: string,
    value: any
  ) => {
    setTableData((prev) => ({
      ...prev,
      [tabId]: prev[tabId].map((row) =>
        row.id === rowId ? { ...row, [field]: value } : row
      ),
    }));
    setHasChanges(true);

    // Clear error for this field
    const errorKey = `${tabId}_${rowId}_${field}`;
    if (errors[errorKey]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[errorKey];
        return newErrors;
      });
    }
  };

  // Add new row to table
  const handleAddRow = (tabId: string) => {
    const tab = TABS_CONFIG.find(
      (t) => t.id === tabId && t.type === "table"
    ) as TableTab;
    if (!tab) return;

    const newRow: TableRowData = {
      id: `${tabId}_${Date.now()}`,
      isNew: true,
    };

    // Initialize row with default values
    tab.columns.forEach((col) => {
      if (col.type === "checkbox") {
        newRow[col.key] = false;
      } else if (col.type === "select" && col.options) {
        const firstNonDisabled = col.options.find((opt) => !opt.disabled);
        newRow[col.key] = firstNonDisabled ? firstNonDisabled.value : "";
      } else {
        newRow[col.key] = "";
      }
    });

    setTableData((prev) => ({
      ...prev,
      [tabId]: [...prev[tabId], newRow],
    }));
    setHasChanges(true);
  };

  // Remove row from table
  const handleRemoveRow = (tabId: string, rowId: string) => {
    const tab = TABS_CONFIG.find(
      (t) => t.id === tabId && t.type === "table"
    ) as TableTab;
    if (!tab?.canDeleteRows) return;

    if (window.confirm("Are you sure you want to remove this row?")) {
      setTableData((prev) => ({
        ...prev,
        [tabId]: prev[tabId].filter((row) => row.id !== rowId),
      }));
      setHasChanges(true);
    }
  };

  // Validate a single form field
  const validateField = (field: FormField, value: any): string => {
    if (field.required && (!value || value.toString().trim() === "")) {
      return `${field.label} is required`;
    }

    if (value && value.toString().trim() !== "") {
      // Email validation
      if (field.type === "email") {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          return "Invalid email address";
        }
      }

      // Phone validation
      if (field.type === "tel") {
        const phoneRegex = /^[0-9]{10}$/;
        if (!phoneRegex.test(value.toString().replace(/\D/g, ""))) {
          return "Invalid phone number (10 digits required)";
        }
      }

      // Pattern validation
      if (field.validation?.pattern && !field.validation.pattern.test(value)) {
        return field.validation.message || "Invalid format";
      }

      // Number range validation
      if (field.type === "number") {
        const numValue = Number(value);
        if (!isNaN(numValue)) {
          if (field.min !== undefined && numValue < field.min) {
            return `Minimum value is ${field.min}`;
          }
          if (field.max !== undefined && numValue > field.max) {
            return `Maximum value is ${field.max}`;
          }
        }
      }

      // String length validation
      if (typeof value === "string") {
        if (
          field.validation?.minLength &&
          value.length < field.validation.minLength
        ) {
          return `Minimum ${field.validation.minLength} characters required`;
        }
        if (
          field.validation?.maxLength &&
          value.length > field.validation.maxLength
        ) {
          return `Maximum ${field.validation.maxLength} characters allowed`;
        }
      }

      // Custom validation
      if (field.validation?.custom) {
        const customResult = field.validation.custom(value, formData);
        if (typeof customResult === "string") {
          return customResult;
        }
      }
    }

    return "";
  };

  // Validate all data and return errors (do NOT mutate touched here)
  const validateAll = (): { isValid: boolean; errors: Record<string, string> } => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    // Validate general information fields
    const generalFields = ["firstName", "lastName"];
    generalFields.forEach((field) => {
      const value = formData[field];
      if (!value || value.toString().trim() === "") {
        newErrors[field] = "This field is required";
        isValid = false;
      }
    });

    // Validate all form tabs
    TABS_CONFIG.forEach((tab) => {
      if (tab.type === "form") {
        tab.fields.forEach((field) => {
          // If field is required and empty, short-circuit with message
          if (field.required) {
            const value = formData[field.key];
            if (!value || value.toString().trim() === "") {
              newErrors[field.key] = `${field.label} is required`;
              isValid = false;
              return;
            }
          }

          const error = validateField(field, formData[field.key]);
          if (error) {
            newErrors[field.key] = error;
            isValid = false;
          }
        });
      } else if (tab.type === "table") {
        // Validate table rows — skip rows where no required field has been filled
        const rows = tableData[tab.id] || [];
        rows.forEach((row) => {
          const requiredCols = tab.columns.filter((col) => col.required && col.key !== "actions");
          const hasAnyValue = requiredCols.some((col) => {
            const v = row[col.key];
            return v !== undefined && v !== null && v.toString().trim() !== "";
          });
          // Only validate if the row has at least one required field filled in
          if (!hasAnyValue) return;
          requiredCols.forEach((col) => {
            const value = row[col.key];
            if (!value || value.toString().trim() === "") {
              newErrors[`${tab.id}_${row.id}_${col.key}`] = `${col.label} is required`;
              isValid = false;
            }
          });
        });
      }
    });

    return { isValid, errors: newErrors };
  };

  // Check if save should be enabled
  const isSaveEnabled = (): boolean => {
    // Check general fields
    const generalFields = ["firstName", "lastName"];
    const generalValid = generalFields.every(
      (field) => formData[field] && formData[field].toString().trim() !== ""
    );

    if (!generalValid) return false;

    // Check all required form fields
    const formTabs = TABS_CONFIG.filter(
      (tab) => tab.type === "form"
    ) as FormTab[];
    for (const tab of formTabs) {
      for (const field of tab.fields) {
        if (field.required) {
          const value = formData[field.key];
          if (!value || value.toString().trim() === "") {
            return false;
          }
        }
      }
    }

    // Check all required table fields — skip entirely empty rows
    const tableTabs = TABS_CONFIG.filter(
      (tab) => tab.type === "table"
    ) as TableTab[];
    for (const tab of tableTabs) {
      const rows = tableData[tab.id] || [];
      for (const row of rows) {
        const requiredCols = tab.columns.filter((col) => col.required && col.key !== "actions");
        const hasAnyValue = requiredCols.some((col) => {
          const v = row[col.key];
          return v !== undefined && v !== null && v.toString().trim() !== "";
        });
        if (!hasAnyValue) continue;
        for (const col of requiredCols) {
          const value = row[col.key];
          if (!value || value.toString().trim() === "") {
            return false;
          }
        }
      }
    }

    return true;
  };

  // Handle form submission
  const handleSubmit = async () => {
    // Validate first and show inline errors
    const { isValid, errors: validationErrors } = validateAll();
    if (!isValid) {
      setErrors(validationErrors);

      // Mark touched for all invalid form fields so messages show
      setTouched((prev) => {
        const copy = { ...prev };
        Object.keys(validationErrors).forEach((k) => {
          // only mark simple form fields as touched (table errors are shown regardless)
          if (!k.includes("_")) copy[k] = true;
        });
        return copy;
      });

      // Activate the tab where the first error occurred
      const firstKey = Object.keys(validationErrors)[0];
      if (firstKey) {
        if (firstKey.includes("_")) {
          setActiveTab(firstKey.split("_")[0]);
        } else {
          const tabWithField = TABS_CONFIG.find(
            (t) => t.type === "form" && t.fields.some((f) => f.key === firstKey)
          ) as FormTab | undefined;
          if (tabWithField) setActiveTab(tabWithField.id);
        }

        // scroll to the field element if present
        const el = document.getElementById(`field-${firstKey}`);
        if (el) (el as HTMLElement).scrollIntoView({ behavior: "smooth", block: "center" });
      }

      toast.error("Please fill in all required fields before saving");
      return;
    }

    setIsSubmitting(true);
    const loadingToast = toast.loading(isEditMode ? "Saving employee..." : "Creating employee...");

    try {
      // 1️⃣ Helper function to convert date strings to UTC ISO strings
      const toUtc = (dateString?: string) => {
        if (!dateString) return null;
        const d = new Date(dateString);
        if (isNaN(d.getTime())) return null;
        return new Date(
          Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())
        ).toISOString();
      };

      // 2️⃣ Prepare form data
      const preparedFormData = { ...formData };

      // 3️⃣ Normalise boolean-like fields from "yes"/"no" or current value
      const booleanFields = ["active", "esiApp", "pfApp", "isExService"];
      booleanFields.forEach(field => {
        if (preparedFormData[field] !== undefined && preparedFormData[field] !== "") {
          preparedFormData[field] =
            preparedFormData[field] === "yes" || preparedFormData[field] === true;
        } else {
          preparedFormData[field] = false;
        }
      });

      // 4️⃣ Define all date fields to convert
      const dateFields = [
        "dateOfBirth",
        "dateOfJoining",
        "lastWorkingDate",
        "rejoineeDate",
        "effFrom",
        "effTo",
        "esiDt",
        "pfDt",
        "passportExpiryDate",
        "passportIssueDate",
        "esiEffDate",
        "pfEffDate",
        "achievementWhen",
      ];

      // 5️⃣ Convert all date fields in preparedFormData
      dateFields.forEach((field) => {
        if (preparedFormData[field]) {
          preparedFormData[field] = toUtc(preparedFormData[field]);
        }
      });

      // 5.5️⃣ Enforce numeric types for specific fields
      const numericFields = [
        "salary", "basicSalary", "hra", "conveyance", "cityCompn",
        "tds", "noticePeriod", "height", "weight", "eduPercentage",
        "familyAge", "prevRelevantExpYear", "prevRelevantExpMonth",
        "salary", "basicSalary", "hra", "conveyance", "cityCompn", "tds"
      ];
      numericFields.forEach(field => {
        if (preparedFormData[field] !== undefined && preparedFormData[field] !== "") {
          preparedFormData[field] = Number(preparedFormData[field]) || 0;
        }
      });

      // 6️⃣ Build final payload including table data mapping
      const { Photo, ...restOfFormData } = preparedFormData;
      const payload: any = {
        ...restOfFormData,
      };

      // Map Table Tabs to Flat Fields (API expects flat fields for these)
      const tableToFlatMappings: Record<string, string[]> = {
        family: ["familyName", "familyAge", "familyRelationship", "familyOccupation", "familyPrimaryContact", "familyContact", "familyEmail"],
        education: ["eduCourse", "eduBoard", "eduInstitution", "eduPassDate", "eduPercentage"],
        achievements: ["achievementWhat", "achievementWhen", "achievementWhere", "achievementRemarks"],
        previousEmployment: ["prevCompanyName", "prevLastDesignation", "prevRelevantExpYear", "prevRelevantExpMonth", "prevPpfNo", "prevPesiNo", "prevStartDate", "prevEndDate"],
      };

      Object.entries(tableToFlatMappings).forEach(([tabId, fields]) => {
        const rows = tableData[tabId] || [];
        const firstRow = rows[0] || {};
        fields.forEach(field => {
          let val = firstRow[field];
          // Handle specific types
          if (field === "familyPrimaryContact") {
            val = val ? "Yes" : "No";
          } else if (field === "eduPassDate" || field.toLowerCase().includes('date')) {
            val = toUtc(val);
          } else if (field.toLowerCase().includes('age') || field.toLowerCase().includes('exp') || field.toLowerCase().includes('percentage')) {
            val = Number(val) || 0;
          }
          payload[field] = val || (typeof val === 'number' ? 0 : "");
        });
      });

      // Map languages table back to comma-separated string
      if (tableData.languages && tableData.languages.length > 0) {
        payload.languageKnown = tableData.languages
          .map(row => row.language)
          .filter(Boolean)
          .join(", ");
      }

      // Special case for Allowances (Array expected by API)
      payload.employeeAllowances = (tableData.employeeAllowances || []).map(({ id, isNew, ...rowData }) => ({
        ...rowData,
        allowEffFrom: toUtc(rowData.allowEffFrom),
        allowEffTo: toUtc(rowData.allowEffTo),
        allowanceAmount: Number(rowData.allowanceAmount) || 0,
        active: true, // Default to active for new entries
      }));

      // 7️⃣ Call API (Two-step process: Upload Photo then Save Data)
      let result;

      // ── Sanitize payload: empty strings → null for date/int fields ──
      const intFields = ["departmentId", "designation", "noticePeriod", "familyAge",
        "prevRelevantExpYear", "prevRelevantExpMonth", "userCreated", "userUpdated", "userId"];
      const allDateFields = [
        "dateOfBirth", "dateOfJoining", "lastWorkingDate", "rejoineeDate",
        "effFrom", "effTo", "esiDt", "pfDt", "passportExpiryDate", "passportIssueDate",
        "esiEffDate", "pfEffDate", "achievementWhen", "prevStartDate", "prevEndDate",
      ];
      // Remove fields the backend doesn't expect
      delete payload.id;
      delete payload.photoPreview;
      // Keep employeeId in payload for create so the backend stores it;
      // remove it on update since it should not change after creation.
      if (isEditMode) {
        delete payload.employeeId;
      }

      intFields.forEach((f) => {
        if (payload[f] === "" || payload[f] === undefined) {
          payload[f] = null;
        } else if (payload[f] !== null) {
          payload[f] = Number(payload[f]) || null;
        }
      });
      allDateFields.forEach((f) => {
        if (payload[f] === "" || payload[f] === undefined || payload[f] === "Invalid Date") {
          payload[f] = null;
        }
      });
      // Convert decimal fields that might be strings
      const decimalFields = ["salary", "basicSalary", "hra", "conveyance", "cityCompn",
        "tds", "height", "weight", "esiPer", "pfPer", "eduPercentage"];
      decimalFields.forEach((f) => {
        if (payload[f] === "" || payload[f] === undefined) {
          payload[f] = null;
        } else if (payload[f] !== null) {
          payload[f] = Number(payload[f]) || 0;
        }
      });

      // Upload photo if a new one is selected
      if (preparedFormData.Photo instanceof File) {
        const empId = formData.employeeId || "";
        const uploadResult = await employeeService.uploadPhoto(preparedFormData.Photo, empId || undefined);
        if (uploadResult.success) {
          const storedFileName = uploadResult.data.storedFileName;
          const baseUrl = api.getBaseUrl().replace(/\/$/, "");
          const empIdParam = empId ? `?employeeId=${encodeURIComponent(empId)}` : "";
          payload.imageUrl = `${baseUrl}/Storage/download/EmployeePhoto/${storedFileName}${empIdParam}`;
        } else {
          toast.error("Photo upload failed. Saving without photo update.");
        }
      }

      console.log("Final payload:", JSON.stringify(payload, null, 2));

      // Save employee first to get the employee ID
      if (isEditMode && formData.id) {
        result = await employeeService.updateEmployee(formData.id, payload);
      } else {
        result = await employeeService.createEmployee(payload);
      }

      // 8️⃣ Success validation
      if (!result || !result.success) {
        throw new Error(result?.message || "Failed to save employee");
      }

      // Upload education documents after saving so we have the employee ID
      const savedEmployeeId: string =
        formData.employeeId ||
        result.data?.employeeId ||
        result.data?.EmployeeId ||
        "";
      await uploadEducationFiles(savedEmployeeId);

      toast.update(loadingToast, {
        render: isEditMode ? "Employee updated successfully!" : "Employee created successfully!",
        type: "success",
        isLoading: false,
        autoClose: 3000,
      });

      setHasChanges(false);
      if (onSuccess) {
        onSuccess();
      } else {
        navigate("/employees");
      }
    } catch (error: any) {
      console.error("Error saving employee:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to save employee";
      toast.update(loadingToast, {
        render: errorMessage,
        type: "error",
        isLoading: false,
        autoClose: 3000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle form reset
  const handleReset = () => {
    if (
      hasChanges &&
      !window.confirm(
        "Are you sure you want to reset? All changes will be lost."
      )
    ) {
      return;
    }

    // Reset form data
    const initialFormData: Record<string, any> = {};
    TABS_CONFIG.forEach((tab) => {
      if (tab.type === "form") {
        tab.fields.forEach((field) => {
          if (field.defaultValue !== undefined) {
            initialFormData[field.key] = field.defaultValue;
          } else if (field.type === "checkbox") {
            initialFormData[field.key] = false;
          } else if (field.type === "select") {
            const defaultOption =
              field.options?.find((opt) => !opt.disabled)?.value || "";
            initialFormData[field.key] = defaultOption;
          } else {
            initialFormData[field.key] = "";
          }
        });
      }
    });

    setFormData(initialFormData);
    setErrors({});
    setTouched({});
    setHasChanges(false);
    toast.info("Form has been reset");
  };

  // Handle cancel
  const handleCancel = () => {
    if (
      hasChanges &&
      !window.confirm(
        "You have unsaved changes. Are you sure you want to cancel?"
      )
    ) {
      return;
    }

    if (onCancel) {
      onCancel();
    }
  };

  // Render form tab
  const renderFormTab = (tab: FormTab) => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-6">
        {tab.fields.map((field) => {
          const hasError = errors[field.key] && touched[field.key];
          const isRequired = field.required;
          const spanClass =
            field.colSpan === 3
              ? "lg:col-span-3"
              : field.colSpan === 2
                ? "lg:col-span-2"
                : "";

          return (
            <div key={field.key} className={spanClass}>
              <label
                htmlFor={`field-${field.key}`}
                className={`block text-sm font-medium mb-1.5 ${hasError ? "text-red-600" : "text-gray-700"
                  }`}
              >
                {field.label}
                {isRequired && <span className="text-red-500 ml-1">*</span>}
              </label>

              {field.type === "select" ? (
                <select
                  id={`field-${field.key}`}
                  value={formData[field.key] || ""}
                  onChange={(e) => handleFormChange(field.key, e.target.value)}
                  onBlur={() => setTouched((p) => ({ ...p, [field.key]: true }))}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${hasError ? "border-red-500 bg-red-50" : "border-gray-300"
                    } ${field.readOnly ? "bg-gray-100 cursor-not-allowed" : ""}`}
                  disabled={field.disabled || field.readOnly}
                >
                  {(() => {
                    // Use dynamic options if available (for Department and Designation)
                    const dynamicOptions = getFieldOptions(field.key);
                    const optionsToUse = dynamicOptions.length > 0 ? dynamicOptions : (field.options || []);
                    return optionsToUse.map((option, index) => (
                      <option
                        key={option.value}
                        value={option.value}
                        disabled={option.disabled}
                        hidden={index === 0 && option.disabled}
                      >
                        {option.label}
                      </option>
                    ));
                  })()}
                </select>
              ) : field.type === "textarea" ? (
                <textarea
                  id={`field-${field.key}`}
                  value={formData[field.key] || ""}
                  onChange={(e) => handleFormChange(field.key, e.target.value)}
                  onBlur={() => setTouched((p) => ({ ...p, [field.key]: true }))}
                  rows={field.rows || 3}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${hasError ? "border-red-500 bg-red-50" : "border-gray-300"
                    } ${field.readOnly ? "bg-gray-100 cursor-not-allowed" : ""}`}
                  placeholder={field.placeholder}
                  disabled={field.disabled || field.readOnly}
                />
              ) : field.type === "checkbox" ? (
                <div className="flex items-center h-10">
                  <input
                    type="checkbox"
                    id={`field-${field.key}`}
                    checked={!!formData[field.key]}
                    onChange={(e) =>
                      handleFormChange(field.key, e.target.checked)
                    }
                    onBlur={() => setTouched((p) => ({ ...p, [field.key]: true }))}
                    className={`h-4 w-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 ${hasError ? "border-red-500" : "border-gray-300"
                      }`}
                    disabled={field.disabled}
                  />
                </div>
              ) : (
                <input
                  type={field.type}
                  id={`field-${field.key}`}
                  value={formData[field.key] || ""}
                  onChange={(e) => handleFormChange(field.key, e.target.value)}
                  onBlur={() => setTouched((p) => ({ ...p, [field.key]: true }))}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${hasError ? "border-red-500 bg-red-50" : "border-gray-300"
                    } ${field.readOnly ? "bg-gray-100 cursor-not-allowed" : ""}`}
                  placeholder={field.placeholder}
                  min={field.min}
                  max={field.max}
                  step={field.step}
                  disabled={field.disabled || field.readOnly}
                />
              )}

              {field.helpText && !hasError && (
                <p className="mt-1 text-xs text-gray-500">{field.helpText}</p>
              )}

              {hasError && (
                <p className="mt-1 text-sm text-red-600">{errors[field.key]}</p>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  // Render table tab
  const renderTableTab = (tab: TableTab) => {
    const rows = tableData[tab.id] || [];

    return (
      <div className="space-y-4">
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {tab.columns.map((column) => (
                  <th
                    key={column.key}
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    style={{ width: column.width }}
                  >
                    {column.label}
                    {column.required && (
                      <span className="text-red-500 ml-1">*</span>
                    )}
                  </th>
                ))}
                {tab.canDeleteRows && (
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {rows.map((row) => (
                <tr key={row.id} className={row.isNew ? "bg-blue-50" : ""}>
                  {tab.columns.map((column) => {
                    const errorKey = `${tab.id}_${row.id}_${column.key}`;
                    const hasError = errors[errorKey];

                    return (
                      <td key={column.key} className="px-4 py-3">
                        {column.type === "select" ? (
                          <select
                            value={row[column.key] || ""}
                            onChange={(e) =>
                              handleTableChange(
                                tab.id,
                                row.id,
                                column.key,
                                e.target.value
                              )
                            }
                            className={`w-full px-2 py-1 border rounded text-sm ${hasError
                              ? "border-red-500 bg-red-50"
                              : "border-gray-300"
                              }`}
                          >
                            {column.options?.map((option, index) => (
                              <option
                                key={option.value}
                                value={option.value}
                                disabled={option.disabled}
                                hidden={index === 0 && option.disabled}
                              >
                                {option.label}
                              </option>
                            ))}
                          </select>
                        ) : column.type === "checkbox" ? (
                          <div className="flex justify-center">
                            <input
                              type="checkbox"
                              checked={row[column.key] || false}
                              onChange={(e) =>
                                handleTableChange(
                                  tab.id,
                                  row.id,
                                  column.key,
                                  e.target.checked
                                )
                              }
                              className="h-4 w-4 text-blue-600 rounded"
                            />
                          </div>
                        ) : column.type === "date" ? (
                          <input
                            type="date"
                            value={row[column.key] || ""}
                            onChange={(e) =>
                              handleTableChange(
                                tab.id,
                                row.id,
                                column.key,
                                e.target.value
                              )
                            }
                            className={`w-full px-2 py-1 border rounded text-sm ${hasError
                              ? "border-red-500 bg-red-50"
                              : "border-gray-300"
                              }`}
                          />
                        ) : (
                          <input
                            type={column.type}
                            value={row[column.key] || ""}
                            onChange={(e) =>
                              handleTableChange(
                                tab.id,
                                row.id,
                                column.key,
                                e.target.value
                              )
                            }
                            className={`w-full px-2 py-1 border rounded text-sm ${hasError
                              ? "border-red-500 bg-red-50"
                              : "border-gray-300"
                              }`}
                            placeholder={column.placeholder}
                          />
                        )}
                        {hasError && (
                          <p className="mt-1 text-xs text-red-600">
                            {errors[errorKey]}
                          </p>
                        )}
                      </td>
                    );
                  })}
                  {tab.canDeleteRows && (
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => handleRemoveRow(tab.id, row.id)}
                        className="text-red-600 hover:text-red-900 p-1"
                        title="Delete row"
                      >
                        <LuTrash2 size={16} />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {tab.canAddRows && (
          <button
            type="button"
            onClick={() => handleAddRow(tab.id)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <LuPlus className="mr-2" size={16} />
            Add New Row
          </button>
        )}

        {rows.length === 0 && (
          <div className="text-center py-8 text-gray-500 border border-gray-200 rounded-lg">
            <LuFileText className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2">
              No data available. Click "Add New Row" to add entries.
            </p>
          </div>
        )}
      </div>
    );
  };

  // Get active tab
  const activeTabConfig = TABS_CONFIG.find((tab) => tab.id === activeTab);
  const isFormValid = isSaveEnabled();

  // Scroll handlers for tabs
  const scrollTabs = (direction: "left" | "right") => {
    if (!tabsRef.current) return;
    const amount = tabsRef.current.clientWidth * 0.5; // scroll half container width
    tabsRef.current.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading employee data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <style>{`.no-scrollbar::-webkit-scrollbar{display:none}.no-scrollbar{-ms-overflow-style:none;scrollbar-width:none}`}</style>
      <div className="max-w-7xl mx-auto p-2 md:p-4">
        {/* Header */}
        {showHeader && (
          <div className="mb-4 bg-white rounded-xl shadow-sm p-4 border border-gray-200">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
              <div>

                <h1 className="text-xl font-bold text-gray-800">
                  {isEditMode ? "Edit Employee" : "Create New Employee"}
                </h1>
                <p className="text-gray-600 mt-1 text-sm">
                  {isEditMode ? (
                    "Update employee information below. All changes will be saved."
                  ) : (
                    <>
                      Fill in the employee details below. Fields marked with{" "}
                      <span className="text-red-500 font-semibold">*</span> are required.
                    </>
                  )}
                </p>

              </div>
              <div className="flex items-center gap-3">

                <div
                  className={`px-3 py-1 rounded-full text-sm font-medium ${isEditMode
                    ? "bg-purple-100 text-purple-800"
                    : "bg-green-100 text-green-800"
                    }`}
                >

                  {isEditMode ? "Edit Mode" : "Create Mode"}
                </div>
                {hasChanges && (
                  <div className="px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                    Unsaved Changes
                  </div>
                )}

              </div>
            </div>
          </div>
        )}

        {/* General Information Section */}
        <div className="mb-4 bg-white rounded-xl shadow-sm border border-gray-200 p-3 md:p-4">
          <h2 className="text-base font-semibold text-gray-800 mb-3">
            General Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Employee ID */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Employee ID
              </label>
              <input
                type="text"
                readOnly
                value={formData.employeeId || ""}
                onChange={(e) => handleFormChange("employeeId", e.target.value)}
                placeholder="EMP-001"
                className={`w-full px-3 py-2 border rounded-md
             outline-none
            ${errors.employeeId
                    ? "border-red-500 bg-red-50"
                    : "border-gray-300"
                  }
             read-only:bg-gray-100
             read-only:text-gray-500
             read-only:cursor-not-allowed
             read-only:focus:ring-0
             read-only:focus:border-gray-300
             focus:ring-2 focus:ring-blue-500
               `}

              />

              {errors.employeeId && (
                <p className="mt-1 text-sm text-red-600">{errors.employeeId}</p>
              )}
            </div>

            {/* First Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                First Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.firstName || ""}
                onChange={(e) => handleFormChange("firstName", e.target.value)}
                placeholder="John"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.firstName
                  ? "border-red-500 bg-red-50"
                  : "border-gray-300"
                  }`}
              />
              {errors.firstName && (
                <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
              )}
            </div>

            {/* Last Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.lastName || ""}
                onChange={(e) => handleFormChange("lastName", e.target.value)}
                placeholder="Doe"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.lastName
                  ? "border-red-500 bg-red-50"
                  : "border-gray-300"
                  }`}
              />
              {errors.lastName && (
                <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
              )}
            </div>

            {/* Father's Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Father's Name
              </label>
              <input
                type="text"
                value={formData.fathersName || ""}
                onChange={(e) => handleFormChange("fathersName", e.target.value)}
                placeholder="Richard Doe"
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300"
              />
            </div>

            {/* Gender */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Gender
              </label>
              <select
                value={formData.gender || ""}
                onChange={(e) => handleFormChange("gender", e.target.value)}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300"
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Date of Birth */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date of Birth
              </label>
              <input
                type="date"
                value={formData.dateOfBirth || ""}
                onChange={(e) =>
                  handleFormChange("dateOfBirth", e.target.value)
                }
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300"
              />
            </div>

            {/* Identification */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Identification
              </label>
              <input
                type="textarea"
                value={formData.identification || ""}
                onChange={(e) =>
                  handleFormChange("identification", e.target.value)
                }
                placeholder="Enter identification number"
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300"
              />
            </div>

            {/* Disability */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Disability
              </label>
              <select
                value={formData.disability || ""}
                onChange={(e) => handleFormChange("disability", e.target.value)}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300"
              >
                <option value="">Select Disability</option>
                <option value="None">None</option>
                <option value="Physical">Physical</option>
                <option value="Visual">Visual</option>
                <option value="Hearing">Hearing</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Marital Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Marital Status
              </label>
              <select
                value={formData.maritalStatus || ""}
                onChange={(e) =>
                  handleFormChange("maritalStatus", e.target.value)
                }
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300"
              >
                <option value="">Select Marital Status</option>
                <option value="single">Single</option>
                <option value="married">Married</option>
                <option value="divorced">Divorced</option>
                <option value="widowed">Widowed</option>
              </select>
            </div>

            {/* Blood Group */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Blood Group
              </label>
              <select
                value={formData.bloodGroup || ""}
                onChange={(e) => handleFormChange("bloodGroup", e.target.value)}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300"
              >
                <option value="">Select Blood Group</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
              </select>
            </div>

            {/* Height (cm) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Height (cm)
              </label>
              <input
                type="number"
                value={formData.height || ""}
                onChange={(e) => handleFormChange("height", e.target.value)}
                placeholder="170"
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300"
                min={100}
                max={250}
                step={0.1}
              />
            </div>

            {/* Weight (kg) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Weight (kg)
              </label>
              <input
                type="number"
                value={formData.weight || ""}
                onChange={(e) => handleFormChange("weight", e.target.value)}
                placeholder="70"
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300"
                min={30}
                max={200}
                step={0.1}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Salary Debit Account
              </label>
              <input
                type="text"
                value={formData.salaryDebitAcc || ""}
                onChange={(e) => handleFormChange("salaryDebitAcc", e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.salaryDebitAcc
                  ? "border-red-500 bg-red-50"
                  : "border-gray-300"
                  }`}
              />
              {errors.salaryDebitAcc && (
                <p className="mt-1 text-sm text-red-600">{errors.salaryDebitAcc}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Salary Credit Account
              </label>
              <input
                type="text"
                value={formData.salaryCreditAcc || ""}
                onChange={(e) => handleFormChange("salaryCreditAcc", e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.salaryCreditAcc
                  ? "border-red-500 bg-red-50"
                  : "border-gray-300"
                  }`}
              />
              {errors.salaryCreditAcc && (
                <p className="mt-1 text-sm text-red-600">{errors.salaryCreditAcc}</p>
              )}
            </div>

            {/* Type of Employment */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type of Employment
              </label>
              <select
                value={formData.typeOfEmployment || ""}
                onChange={(e) => handleFormChange("typeOfEmployment", e.target.value)}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300"
              >
                <option value="">Select Type</option>
                <option value="Full-Time">Full-Time</option>
                <option value="Part-Time">Part-Time</option>
                <option value="Contract">Contract</option>
                <option value="Temporary">Temporary</option>
                <option value="Intern">Intern</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sales Man
              </label>
              <select
                value={formData.salesMan || ""}
                onChange={(e) => handleFormChange("salesMan", e.target.value)}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300"
              >
                <option value="">Select</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Photo
              </label>

              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];

                  if (!file) return;
                  if (!file.type.startsWith("image/")) {
                    setPhotoError("Only image files are allowed");
                    setPhotoPreview(null);
                    handleFormChange("Photo", null);
                    return;
                  }
                  setPhotoError(null);
                  handleFormChange("Photo", file);
                  setPhotoPreview(URL.createObjectURL(file));
                }}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${photoError ? "border-red-500 bg-red-50" : "border-gray-300"
                  }`}
              />


              {photoError && (
                <p className="mt-1 text-sm text-red-600">{photoError}</p>
              )}


              {photoPreview && !photoError && (
                <img
                  src={photoPreview}
                  alt=""
                  className="mt-3 h-32 w-32 object-cover rounded border"
                />
              )}
            </div>
          </div>
        </div>

        {/* Tabs Navigation - scrollable when overflow */}
        <div className="mb-4">
          <div className="relative">
            {/* Left scroll button */}
            <button
              type="button"
              aria-label="Scroll tabs left"
              onClick={() => scrollTabs("left")}
              className="flex items-center justify-center absolute -left-2 top-1/2 transform -translate-y-1/2 z-10 bg-white rounded-full p-1 shadow border border-gray-200"
            >
              <LuChevronLeft size={18} />
            </button>

            <div
              ref={tabsRef}
              className="flex items-center gap-1 overflow-x-auto no-scrollbar whitespace-nowrap px-2 py-2 bg-white rounded-lg border border-gray-200 shadow-sm"
              style={{ scrollBehavior: "smooth" }}
            >
              {TABS_CONFIG.map((tab) => {
                const isActive = activeTab === tab.id;
                const hasTabErrors = Object.keys(errors).some((key) =>
                  key.startsWith(`${tab.id}_`)
                );

                return (

                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`inline-flex items-center gap-2 px-4 py-3 mr-1 font-medium rounded-md transition-all ${isActive
                      ? "text-blue-600 bg-blue-50 border-b-2 border-blue-600"
                      : "text-gray-600 hover:text-gray-800 hover:bg-gray-100"
                      }`}
                  >
                    {tab.icon && (
                      <span
                        className={isActive ? "text-blue-600" : "text-gray-500"}
                      >
                        {tab.icon}
                      </span>
                    )}
                    <span className="whitespace-nowrap">{tab.label}</span>
                    {hasTabErrors && (
                      <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full">
                        !
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Right scroll button */}
            <button
              type="button"
              aria-label="Scroll tabs right"
              onClick={() => scrollTabs("right")}
              className="flex items-center justify-center absolute -right-2 top-1/2 transform -translate-y-1/2 z-10 bg-white rounded-full p-1 shadow border border-gray-200"
            >
              <LuChevronRight size={18} />
            </button>
          </div>

          {/* Tab Description */}
          {activeTabConfig?.description && (
            <div className="mt-3 bg-blue-50 border border-blue-100 rounded-lg p-4">
              <div className="flex items-start">
                <svg
                  className="w-5 h-5 text-blue-600 mt-0.5 mr-2 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
                <p className="text-sm text-blue-800">
                  {activeTabConfig.description}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Active Tab Content */}
        {activeTabConfig && (
          <div className="mb-4 bg-white rounded-xl shadow-sm border border-gray-200 p-3 md:p-4">
            <div className="mb-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">
                  {activeTabConfig.label}
                </h3>
                {activeTabConfig.type === "table" &&
                  activeTabConfig.actions?.map((action) => (

                    <button
                      key={action.key}
                      type="button"
                      className="bg-[#FF6B35] text-white px-4 py-2 rounded-lg
                   flex items-center gap-2 hover:bg-[#ff8657]
                   transition-colors"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <CgSoftwareUpload size={20} />
                      {action.label}
                    </button>
                  ))}
              </div>
              {uploadErrors[activeTab] && (
                <p className="mt-1 text-sm text-red-600 text-right">
                  {uploadErrors[activeTab]}
                </p>
              )}
              {activeTab === "education" && educationFiles.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {educationFiles.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-1 bg-blue-50 border border-blue-200 rounded px-2 py-1 text-sm text-blue-700"
                    >
                      <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span className="truncate max-w-[200px]">{file.name}</span>
                      <button
                        type="button"
                        onClick={() => setEducationFiles((prev) => prev.filter((_, i) => i !== index))}
                        className="ml-1 text-red-400 hover:text-red-600 font-bold leading-none"
                        title="Remove"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {activeTabConfig.type === "form"
              ? renderFormTab(activeTabConfig)
              : renderTableTab(activeTabConfig)}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-between items-center p-3 bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
            <span>Fields marked with <span className="text-red-500 font-semibold">*</span> are required</span>
          </div>

          <div className="flex gap-3">
            {/* <button
              type="button"
              onClick={handleReset}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              disabled={isSubmitting}
            >
              Reset
            </button> */}

            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              disabled={isSubmitting}
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleSubmit}
              className={`px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 bg-green-100 text-green-800 hover:bg-green-200 focus:ring-green-400 ${isFormValid && !isSubmitting
                ? "bg-blue-100 text-blue-800 hover:bg-blue-200 focus:ring-blue-400"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
            >
              {isSubmitting ? (
                <span className="flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Saving...
                </span>
              ) : (
                <span className="flex items-center">
                  <LuSave className="mr-2" size={16} />
                  {isEditMode ? "Update Employee" : "Save Employee"}
                </span>
              )}
            </button>
          </div>
        </div>
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*,application/pdf"
          className="hidden"
          onChange={handleDocumentUpload}
        />
      </div>
    </div>
  );
};

export default EmployeeInfoForm;