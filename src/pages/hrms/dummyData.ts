import { Employee, AttendanceRecord, TimesheetEntry, PayrollRecord, PerformanceGoal, HRLetter, AssetRecord } from "./types";

export const employees: Employee[] = [
  { id: "EMP001", name: "Arjun Sharma", department: "Engineering", role: "Senior Developer", email: "arjun.sharma@company.com", phone: "+91 98765 43210", status: "Active", joinDate: "2021-03-15", salary: 95000 },
  { id: "EMP002", name: "Priya Nair", department: "HR", role: "HR Manager", email: "priya.nair@company.com", phone: "+91 87654 32109", status: "Active", joinDate: "2020-07-01", salary: 80000 },
  { id: "EMP003", name: "Rahul Verma", department: "Sales", role: "Sales Executive", email: "rahul.verma@company.com", phone: "+91 76543 21098", status: "Active", joinDate: "2022-01-10", salary: 60000 },
  { id: "EMP004", name: "Sneha Patel", department: "Finance", role: "Finance Analyst", email: "sneha.patel@company.com", phone: "+91 65432 10987", status: "On Leave", joinDate: "2021-09-20", salary: 72000 },
  { id: "EMP005", name: "Vikram Singh", department: "Engineering", role: "DevOps Engineer", email: "vikram.singh@company.com", phone: "+91 54321 09876", status: "Active", joinDate: "2020-11-05", salary: 90000 },
  { id: "EMP006", name: "Meera Iyer", department: "Marketing", role: "Marketing Manager", email: "meera.iyer@company.com", phone: "+91 43210 98765", status: "Active", joinDate: "2019-05-12", salary: 85000 },
  { id: "EMP007", name: "Kiran Reddy", department: "Engineering", role: "Frontend Developer", email: "kiran.reddy@company.com", phone: "+91 32109 87654", status: "Active", joinDate: "2023-02-01", salary: 70000 },
  { id: "EMP008", name: "Ananya Kumar", department: "Operations", role: "Operations Lead", email: "ananya.kumar@company.com", phone: "+91 21098 76543", status: "Inactive", joinDate: "2018-08-30", salary: 78000 },
  { id: "EMP009", name: "Deepak Menon", department: "Finance", role: "Accountant", email: "deepak.menon@company.com", phone: "+91 10987 65432", status: "Active", joinDate: "2022-06-15", salary: 65000 },
  { id: "EMP010", name: "Kavya Bhat", department: "HR", role: "HR Executive", email: "kavya.bhat@company.com", phone: "+91 09876 54321", status: "Active", joinDate: "2023-09-01", salary: 55000 },
];

const today = new Date();
export const attendanceRecords: AttendanceRecord[] = [
  { date: "2026-03-31", employeeId: "EMP001", employeeName: "Arjun Sharma", status: "Present", checkIn: "09:02", checkOut: "18:15", hours: 9.2 },
  { date: "2026-03-31", employeeId: "EMP002", employeeName: "Priya Nair", status: "Present", checkIn: "08:55", checkOut: "17:45", hours: 8.8 },
  { date: "2026-03-31", employeeId: "EMP003", employeeName: "Rahul Verma", status: "Late", checkIn: "10:30", checkOut: "18:00", hours: 7.5 },
  { date: "2026-03-31", employeeId: "EMP004", employeeName: "Sneha Patel", status: "Leave" },
  { date: "2026-03-31", employeeId: "EMP005", employeeName: "Vikram Singh", status: "Present", checkIn: "09:10", checkOut: "19:00", hours: 9.8 },
  { date: "2026-03-31", employeeId: "EMP006", employeeName: "Meera Iyer", status: "Present", checkIn: "09:00", checkOut: "18:00", hours: 9.0 },
  { date: "2026-03-31", employeeId: "EMP007", employeeName: "Kiran Reddy", status: "Absent" },
  { date: "2026-03-31", employeeId: "EMP008", employeeName: "Ananya Kumar", status: "Present", checkIn: "08:45", checkOut: "17:30", hours: 8.75 },
  { date: "2026-03-31", employeeId: "EMP009", employeeName: "Deepak Menon", status: "Present", checkIn: "09:05", checkOut: "18:05", hours: 9.0 },
  { date: "2026-03-31", employeeId: "EMP010", employeeName: "Kavya Bhat", status: "Half Day", checkIn: "09:00", checkOut: "13:00", hours: 4.0 },
];

export const timesheetEntries: TimesheetEntry[] = [
  {
    id: "TS001", employeeId: "EMP001", employeeName: "Arjun Sharma", weekStart: "2026-03-25",
    project: "JBS ERP Module", task: "Frontend Development",
    hours: { mon: 8, tue: 8, wed: 7, thu: 8, fri: 8, sat: 0, sun: 0 },
    status: "Approved", totalHours: 39, managerComment: "Good work this week."
  },
  {
    id: "TS002", employeeId: "EMP003", employeeName: "Rahul Verma", weekStart: "2026-03-25",
    project: "Q2 Sales Campaign", task: "Client Outreach",
    hours: { mon: 7, tue: 8, wed: 8, thu: 6, fri: 5, sat: 4, sun: 0 },
    status: "Pending", totalHours: 38, managerComment: ""
  },
  {
    id: "TS003", employeeId: "EMP005", employeeName: "Vikram Singh", weekStart: "2026-03-25",
    project: "Cloud Infrastructure", task: "CI/CD Pipeline Setup",
    hours: { mon: 8, tue: 8, wed: 8, thu: 8, fri: 8, sat: 0, sun: 0 },
    status: "Approved", totalHours: 40, managerComment: "Excellent execution."
  },
  {
    id: "TS004", employeeId: "EMP007", employeeName: "Kiran Reddy", weekStart: "2026-03-25",
    project: "JBS ERP Module", task: "UI Component Development",
    hours: { mon: 4, tue: 8, wed: 8, thu: 7, fri: 8, sat: 0, sun: 0 },
    status: "Rejected", totalHours: 35, managerComment: "Please add detailed task breakdown."
  },
];

export const payrollRecords: PayrollRecord[] = [
  { employeeId: "EMP001", employeeName: "Arjun Sharma", department: "Engineering", month: "March 2026", basic: 57000, hra: 22800, transportAllowance: 3200, medicalAllowance: 2000, otherAllowances: 10000, providentFund: 6840, professionalTax: 200, incomeTax: 8500, otherDeductions: 0, netSalary: 79460, status: "Processed" },
  { employeeId: "EMP002", employeeName: "Priya Nair", department: "HR", month: "March 2026", basic: 48000, hra: 19200, transportAllowance: 2800, medicalAllowance: 2000, otherAllowances: 8000, providentFund: 5760, professionalTax: 200, incomeTax: 6200, otherDeductions: 0, netSalary: 67840, status: "Processed" },
  { employeeId: "EMP003", employeeName: "Rahul Verma", department: "Sales", month: "March 2026", basic: 36000, hra: 14400, transportAllowance: 2400, medicalAllowance: 1500, otherAllowances: 5700, providentFund: 4320, professionalTax: 200, incomeTax: 3200, otherDeductions: 0, netSalary: 52280, status: "Pending" },
  { employeeId: "EMP005", employeeName: "Vikram Singh", department: "Engineering", month: "March 2026", basic: 54000, hra: 21600, transportAllowance: 3000, medicalAllowance: 2000, otherAllowances: 9400, providentFund: 6480, professionalTax: 200, incomeTax: 7800, otherDeductions: 0, netSalary: 75520, status: "Processed" },
  { employeeId: "EMP006", employeeName: "Meera Iyer", department: "Marketing", month: "March 2026", basic: 51000, hra: 20400, transportAllowance: 2800, medicalAllowance: 2000, otherAllowances: 8800, providentFund: 6120, professionalTax: 200, incomeTax: 7000, otherDeductions: 0, netSalary: 71680, status: "On Hold" },
];

export const performanceGoals: PerformanceGoal[] = [
  { id: "PG001", employeeId: "EMP001", employeeName: "Arjun Sharma", goal: "Complete ERP Frontend Module", kpi: "Module delivery on time", weightage: 30, targetDate: "2026-06-30", selfRating: 4, managerRating: 4, status: "On Track", managerFeedback: "Great progress, keep it up." },
  { id: "PG002", employeeId: "EMP001", employeeName: "Arjun Sharma", goal: "Reduce bug count by 40%", kpi: "Bug reduction rate", weightage: 20, targetDate: "2026-06-30", selfRating: 5, managerRating: 4, status: "On Track", managerFeedback: "Significant improvement noted." },
  { id: "PG003", employeeId: "EMP002", employeeName: "Priya Nair", goal: "Complete HR Policy Documentation", kpi: "Policy documents published", weightage: 25, targetDate: "2026-04-30", selfRating: 4, managerRating: 5, status: "Completed", managerFeedback: "Excellent work, well structured." },
  { id: "PG004", employeeId: "EMP003", employeeName: "Rahul Verma", goal: "Achieve Q2 Sales Target", kpi: "Revenue: ₹50L", weightage: 40, targetDate: "2026-06-30", selfRating: 3, managerRating: 3, status: "At Risk", managerFeedback: "Needs more focus on enterprise clients." },
  { id: "PG005", employeeId: "EMP005", employeeName: "Vikram Singh", goal: "Migrate 100% infra to cloud", kpi: "Cloud migration completion", weightage: 35, targetDate: "2026-05-31", selfRating: 5, managerRating: 5, status: "On Track", managerFeedback: "Outstanding performance." },
];

export const hrLetters: HRLetter[] = [
  { id: "LTR001", type: "Offer Letter", employeeId: "EMP010", employeeName: "Kavya Bhat", generatedDate: "2023-08-15", status: "Issued" },
  { id: "LTR002", type: "Appointment Letter", employeeId: "EMP007", employeeName: "Kiran Reddy", generatedDate: "2023-01-28", status: "Issued" },
  { id: "LTR003", type: "Experience Letter", employeeId: "EMP008", employeeName: "Ananya Kumar", generatedDate: "2026-01-15", status: "Draft" },
  { id: "LTR004", type: "Relieving Letter", employeeId: "EMP008", employeeName: "Ananya Kumar", generatedDate: "2026-01-15", status: "Draft" },
  { id: "LTR005", type: "Offer Letter", employeeId: "EMP009", employeeName: "Deepak Menon", generatedDate: "2022-06-01", status: "Issued" },
];

export const assetRecords: AssetRecord[] = [
  { assetId: "AST001", assetName: "MacBook Pro 14\"", category: "Laptop", assignedTo: "Arjun Sharma", employeeId: "EMP001", assignedDate: "2021-03-20", status: "Assigned", serialNumber: "C02X1234ABCD" },
  { assetId: "AST002", assetName: "Dell Monitor 27\"", category: "Monitor", assignedTo: "Arjun Sharma", employeeId: "EMP001", assignedDate: "2021-03-20", status: "Assigned", serialNumber: "CN-02345-678" },
  { assetId: "AST003", assetName: "iPhone 15 Pro", category: "Mobile", assignedTo: "Priya Nair", employeeId: "EMP002", assignedDate: "2022-01-10", status: "Assigned", serialNumber: "F17HX2345678" },
  { assetId: "AST004", assetName: "HP LaserJet Pro", category: "Printer", assignedTo: "Unassigned", assignedDate: "", status: "Available", serialNumber: "VNB3C12345" },
  { assetId: "AST005", assetName: "ThinkPad X1 Carbon", category: "Laptop", assignedTo: "Vikram Singh", employeeId: "EMP005", assignedDate: "2020-12-01", status: "Assigned", serialNumber: "PF1234ABCDE" },
  { assetId: "AST006", assetName: "Cisco IP Phone", category: "Phone", assignedTo: "Meera Iyer", employeeId: "EMP006", assignedDate: "2019-06-01", status: "Assigned", serialNumber: "FCH2104A23B" },
  { assetId: "AST007", assetName: "Dell Latitude 5520", category: "Laptop", assignedTo: "Unassigned", assignedDate: "", status: "Under Maintenance", serialNumber: "7XYZABCD1234" },
  { assetId: "AST008", assetName: "Samsung Galaxy S24", category: "Mobile", assignedTo: "Kiran Reddy", employeeId: "EMP007", assignedDate: "2023-02-10", status: "Assigned", serialNumber: "R3CR101ABHIJ" },
];
