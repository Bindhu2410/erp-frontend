/**
 * Employee-related TypeScript interfaces and types
 * Provides type safety for employee data across the application
 */

// ============================================
// Main Employee Data Interface
// ============================================

export interface EmployeeData {
  // Personal Information
  FirstName?: string;
  LastName?: string;
  FathersName?: string;
  MothersMaidenName?: string;
  DateOfBirth?: string;
  Disability?: string;
  Identification?: string;
  BloodGroup?: string;
  Height?: number;
  Weight?: number;
  Religion?: string;
  Nationality?: string;
  CountryBirth?: string;
  BirthPlace?: string;

  // Employment Details
  TypeOfEmployment?: string;
  DateOfJoining?: string;
  DepartmentId?: number;
  Designation?: number;
  LastWorkingDate?: string;
  RejoineeDate?: string;
  EmployeeGrade?: string;
  ReportManager?: string;
  ReportManagerCode?: string;
  ReportingHeadMail?: string;
  NoticePeriod?: number;
  CostCenter?: string;
  IsExService?: boolean;
  Active?: boolean;

  // Compensation & Salary
  Salary?: number;
  BasicSalary?: number;
  Hra?: number;
  Conveyance?: number;
  CityCompn?: number;
  AllowanceType?: string;
  AllowanceAmount?: number;
  AllowEffFrom?: string;
  AllowEffTo?: string;
  SalaryDebitAcc?: string;
  SalaryCreditAcc?: string;
  EffFrom?: string;
  EffTo?: string;

  // Deductions
  EsiApp?: boolean;
  EsiNum?: string;
  EsiDt?: string;
  EsiPer?: number;
  PfApp?: boolean;
  PfNum?: string;
  PfDt?: string;
  PfPer?: number;
  Tds?: number;

  // Government IDs & Documents
  PassportNo?: string;
  NameAsPerPassport?: string;
  PassportExpiryDate?: string;
  PassportIssuePlace?: string;
  PassportIssueDate?: string;
  OldPassportNo?: string;
  PanNo?: string;
  VoterId?: string;
  DrivingLicenseNo?: string;
  AadharNo?: string;
  IdCardNo?: string;
  EsiNo?: string;
  EsiEffDate?: string;
  PfNo?: string;
  PfEffDate?: string;

  // Personal Contact & Address
  Country?: string;
  City?: string;
  HomeState?: string;

  // Permanent Address
  PermAddress?: string;
  PermCity?: string;
  PermState?: string;
  PermTelephone?: string;
  PermEmail?: string;
  PermContactPerson?: string;
  PermPincode?: string;
  PermCountry?: string;
  PermMobile?: string;

  // Communication Address
  CommAddress?: string;
  CommCity?: string;
  CommState?: string;
  CommTelephone?: string;
  CommEmail?: string;
  CommContactPerson?: string;
  CommPincode?: string;
  CommCountry?: string;
  CommMobile?: number;

  // Banking Details
  BankName?: string;
  BranchName?: string;
  BankAcNo?: string;
  IfscCode?: string;

  // Insurance
  InsuranceName?: string;
  InsuranceNo?: string;

  // Additional Information
  SalesMan?: string;
  ImageUrl?: string;
  Nominee?: string;
  NomineeRelationship?: string;
  RecruiterName?: string;
  Reference?: string;
  LanguageKnown?: string;

  // Family Information
  FamilyName?: string;
  FamilyAge?: number;
  FamilyRelationship?: string;
  FamilyOccupation?: string;
  FamilyPrimaryContact?: string;
  FamilyContact?: number;
  FamilyEmail?: string;

  // Education
  EduCourse?: string;
  EduBoard?: string;
  EduInstitution?: string;
  EduPassDate?: string;
  EduPercentage?: number;

  // Achievements
  AchievementWhat?: string;
  AchievementWhen?: string;
  AchievementWhere?: string;
  AchievementRemarks?: string;

  // Previous Employment
  PrevCompanyName?: string;
  PrevLastDesignation?: string;
  PrevRelevantExpYear?: number;
  PrevRelevantExpMonth?: number;
  PrevPpfNo?: string;
  PrevPesiNo?: string;
  PrevStartDate?: string;
  PrevEndDate?: string;

  // Metadata
  UserCreated?: number;

  // Dynamic fields
  [key: string]: any;
}

// ============================================
// API Response Interfaces
// ============================================

export interface EmployeeResponse extends EmployeeData {
  id?: number;
  employeeId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, any>;
  };
}

// ============================================
// Form-Related Types
// ============================================

export interface EmployeeFormData extends EmployeeData {
  id?: number;
}

export interface EmployeeFormState {
  data: EmployeeFormData;
  isLoading: boolean;
  isSaving: boolean;
  isDirty: boolean;
  errors: Record<string, string>;
  touchedFields: Set<string>;
}

// ============================================
// Filter & Search Types
// ============================================

export interface EmployeeFilter {
  search?: string;
  department?: number;
  designation?: number;
  grade?: string;
  active?: boolean;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface EmployeeSearchResult {
  employees: EmployeeResponse[];
  total: number;
  page: number;
}

// ============================================
// Validation Types
// ============================================

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  validate?: (value: any) => boolean | string;
}

export interface ValidationError {
  field: string;
  message: string;
}

// ============================================
// Department & Designation Types
// ============================================

export interface Department {
  id: number;
  name: string;
  description?: string;
  active: boolean;
}

export interface Designation {
  id: number;
  name: string;
  department?: string;
  description?: string;
  active: boolean;
}

// ============================================
// Salary & Compensation Types
// ============================================

export interface SalaryComponent {
  type:
    | "basic"
    | "hra"
    | "conveyance"
    | "city_compensation"
    | "allowance"
    | "other";
  amount: number;
  effectiveFrom: string;
  effectiveTo?: string;
}

export interface SalaryStructure {
  employeeId: number;
  totalSalary: number;
  components: SalaryComponent[];
  deductions: {
    esi: number;
    pf: number;
    tds: number;
    other?: number;
  };
  netSalary: number;
  effectiveFrom: string;
  effectiveTo?: string;
}

// ============================================
// Employment Status Types
// ============================================

export type EmploymentStatus =
  | "active"
  | "inactive"
  | "on_leave"
  | "terminated"
  | "retired";

export interface EmploymentStatusChange {
  employeeId: number;
  oldStatus: EmploymentStatus;
  newStatus: EmploymentStatus;
  reason?: string;
  effectiveDate: string;
  notes?: string;
}

// ============================================
// Document Types
// ============================================

export interface EmployeeDocument {
  id?: number;
  employeeId: number;
  type:
    | "passport"
    | "license"
    | "aadhar"
    | "pan"
    | "voter_id"
    | "certificate"
    | "other";
  documentNumber?: string;
  expiryDate?: string;
  issueDate?: string;
  fileUrl?: string;
  uploadedAt?: string;
}

// ============================================
// Audit Types
// ============================================

export interface AuditLog {
  id?: number;
  employeeId: number;
  action: "create" | "update" | "delete" | "view";
  changes?: Record<string, { old: any; new: any }>;
  changedBy: number;
  changedAt: string;
  reason?: string;
}

// ============================================
// Notification Types
// ============================================

export interface EmployeeNotification {
  id?: number;
  employeeId: number;
  type: "info" | "warning" | "error" | "success";
  title: string;
  message: string;
  read: boolean;
  createdAt?: string;
}

// ============================================
// Statistics Types
// ============================================

export interface EmployeeStatistics {
  totalEmployees: number;
  activeEmployees: number;
  inactiveEmployees: number;
  employeesByDepartment: Record<string, number>;
  employeesByGrade: Record<string, number>;
  employeesByStatus: Record<EmploymentStatus, number>;
}

// ============================================
// Utility Types
// ============================================

export type EmployeeField = keyof EmployeeData;

export interface ColumnConfig {
  field: EmployeeField;
  label: string;
  width?: string;
  sortable?: boolean;
  visible?: boolean;
  format?: (value: any) => string;
}

export interface TableConfig {
  columns: ColumnConfig[];
  pageSize: number;
  sortBy?: EmployeeField;
  sortOrder?: "asc" | "desc";
}

// ============================================
// Error Types
// ============================================

export class EmployeeApiError extends Error {
  constructor(
    public statusCode: number,
    public errorCode: string,
    message: string,
    public details?: Record<string, any>
  ) {
    super(message);
    this.name = "EmployeeApiError";
  }
}

// ============================================
// Constants
// ============================================

export const EMPLOYMENT_TYPES = [
  { label: "Full-Time", value: "full-time" },
  { label: "Part-Time", value: "part-time" },
  { label: "Contract", value: "contract" },
  { label: "Temporary", value: "temporary" },
  { label: "Internship", value: "internship" },
];

export const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];

export const EMPLOYEE_GRADES = [
  "A",
  "B",
  "C",
  "D",
  "E",
  "F",
  "G",
  "H",
  "I",
  "J",
];

export const DOCUMENT_TYPES = [
  { label: "Passport", value: "passport" },
  { label: "Driving License", value: "license" },
  { label: "Aadhar", value: "aadhar" },
  { label: "PAN", value: "pan" },
  { label: "Voter ID", value: "voter_id" },
  { label: "Certificate", value: "certificate" },
  { label: "Other", value: "other" },
];

export const RELATIONSHIP_TYPES = [
  "Spouse",
  "Son",
  "Daughter",
  "Father",
  "Mother",
  "Brother",
  "Sister",
  "Grandfather",
  "Grandmother",
  "Uncle",
  "Aunt",
  "Cousin",
  "Nephew",
  "Niece",
  "Other",
];
