// ─── Status Types ──────────────────────────────────────────────────────────
export type QaItemStatus =
  | "Approved"
  | "Failed"
  | "Pending"
  | "Missing"
  | "WrongProduct";

export type QaSessionStatus = "Pending" | "In-Progress" | "Completed";

export type QaOverallResult = "Approved" | "Failed" | "Partial" | "Pending";

export type QaPaymentStatus = "FullApproved" | "PartialHold" | "FullHold";

// ─── Checklist ──────────────────────────────────────────────────────────────
export interface QaChecklistItem {
  id: number;
  templateId: number;
  templateName?: string;
  checkPoint: string;
  description?: string;
  isRequired: boolean;
  sequence: number;
}

export interface QaChecklistResponse {
  id?: number;
  inspectionItemId?: number;
  checklistItemId: number;
  checkPoint?: string;
  response: "Pass" | "Fail" | "NA" | "";
  remarks?: string;
}

// ─── Inspection Item ─────────────────────────────────────────────────────────
export interface QaInspectionItem {
  id: number;
  qaSessionId: number;
  grnItemId: number;
  itemId: number;
  itemCode: string;
  itemName: string;
  itemType: "Main" | "SubProduct";
  parentItemId: number | null;
  expectedQty: number;
  receivedQty: number;
  isWrongProduct: boolean;
  wrongProductItemId?: number | null;
  wrongProductItemName?: string | null;
  status: QaItemStatus;
  remarks: string;
  checklistTemplate?: {
    templateId: number;
    templateName: string;
  };
  checklistResponses: QaChecklistResponse[];
  subItems: QaInspectionItem[];
}

// ─── Payment Flag ─────────────────────────────────────────────────────────────
export interface QaPaymentFlag {
  id?: number;
  qaSessionId?: number;
  invoiceAmount: number;
  approvedAmount: number;
  holdAmount: number;
  status: QaPaymentStatus;
  reason: string;
}

// ─── Session Detail (full) ────────────────────────────────────────────────────
export interface QaSessionSupplier {
  id: number;
  vendorName: string;
  vendorCode: string;
  gstNumber?: string;
  email?: string[];
  phone?: string[];
}

export interface QaSessionDetail {
  id: number;
  sessionNo: string;
  grnId: number;
  grnNo: string;
  grnDate: string;
  supplier: QaSessionSupplier;
  invoiceNo: string;
  invoiceDate?: string;
  invoiceAmount?: number;
  sessionDate: string;
  status: QaSessionStatus;
  overallResult: QaOverallResult;
  inspectorId: number;
  inspectorName?: string;
  remarks?: string;
  inspectionItems: QaInspectionItem[];
  paymentFlag?: QaPaymentFlag;
  dateCreated: string;
}

// ─── Session List Item (summary row) ──────────────────────────────────────────
export interface QaSessionListItem {
  id: number;
  sessionNo: string;
  grnId: number;
  grnNo: string;
  supplierName: string;
  invoiceNo: string;
  sessionDate: string;
  status: QaSessionStatus;
  overallResult: QaOverallResult;
  inspectorName: string;
  totalItems: number;
  approvedItems: number;
  failedItems: number;
  missingItems: number;
  wrongProductItems: number;
  dateCreated: string;
}

// ─── Create / Update Requests ─────────────────────────────────────────────────
export interface QaSessionCreateRequest {
  grnId: number;
  invoiceNo: string;
  invoiceDate?: string;
  invoiceAmount?: number;
  sessionDate: string;
  inspectorId: number;
  remarks?: string;
}

export interface QaInspectionItemUpdateRequest {
  receivedQty: number;
  isWrongProduct: boolean;
  wrongProductItemId?: number | null;
  status: QaItemStatus;
  remarks: string;
}

export interface QaChecklistSubmitRequest {
  responses: {
    checklistItemId: number;
    response: "Pass" | "Fail" | "NA";
    remarks?: string;
  }[];
}

export interface QaPaymentFlagRequest {
  invoiceAmount: number;
  approvedAmount: number;
  holdAmount: number;
  status: QaPaymentStatus;
  reason: string;
}

// ─── Report ───────────────────────────────────────────────────────────────────
export interface QaReportSummary {
  sessionNo: string;
  grnNo: string;
  supplierName: string;
  invoiceNo: string;
  summary: {
    totalItems: number;
    totalSubItems: number;
    approved: number;
    failed: number;
    missing: number;
    wrongProduct: number;
    pending: number;
  };
  items: QaInspectionItem[];
  paymentRecommendation: QaPaymentStatus;
  generatedAt: string;
}

// ─── Template ─────────────────────────────────────────────────────────────────
export interface QaTemplate {
  id: number;
  templateName: string;
  description?: string;
  checklistItems?: QaChecklistItem[];
}

export interface QaChecklistItemRequest {
  checkPoint: string;
  description?: string;
  isRequired: boolean;
  sequence: number;
  createdBy: number;
}
