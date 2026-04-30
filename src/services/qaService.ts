import type {
  QaSessionListItem,
  QaSessionDetail,
  QaSessionCreateRequest,
  QaInspectionItemUpdateRequest,
  QaChecklistSubmitRequest,
  QaPaymentFlagRequest,
  QaPaymentFlag,
  QaReportSummary,
  QaTemplate,
  QaChecklistItem,
  QaChecklistItemRequest,
} from "../types/qa";

// ─── STATIC MOCK DATA (remove when backend is ready) ─────────────────────────

const MOCK_TEMPLATES: QaTemplate[] = [
  { id: 1, templateName: "General Goods Inspection", description: "Standard checklist for incoming goods" },
  { id: 2, templateName: "Medical Device Inspection", description: "Regulatory checklist for medical items" },
];

const MOCK_CHECKLIST_ITEMS: Record<number, QaChecklistItem[]> = {
  1: [
    { id: 1, templateId: 1, checkPoint: "Packaging intact", description: "Outer carton undamaged", isRequired: true, sequence: 1 },
    { id: 2, templateId: 1, checkPoint: "Quantity matches invoice", description: "Physical count equals invoice qty", isRequired: true, sequence: 2 },
    { id: 3, templateId: 1, checkPoint: "Expiry date acceptable", description: "Min 12 months remaining shelf life", isRequired: true, sequence: 3 },
    { id: 4, templateId: 1, checkPoint: "Labeling correct", description: "Brand, model and lot number visible", isRequired: false, sequence: 4 },
  ],
  2: [
    { id: 5, templateId: 2, checkPoint: "CE/FDA marking present", description: "Regulatory marks visible on device", isRequired: true, sequence: 1 },
    { id: 6, templateId: 2, checkPoint: "Serial number matches DOC", description: "S/N on unit matches delivery order", isRequired: true, sequence: 2 },
    { id: 7, templateId: 2, checkPoint: "Sterilization intact", description: "Sterile barrier not compromised", isRequired: true, sequence: 3 },
    { id: 8, templateId: 2, checkPoint: "User manual included", description: "Manual in English present in box", isRequired: false, sequence: 4 },
  ],
};

const MOCK_SESSIONS: QaSessionListItem[] = [
  {
    id: 1, sessionNo: "QA-2026-001", grnId: 101, grnNo: "GRN-2026-0101",
    supplierName: "MedSupply Pvt Ltd", invoiceNo: "INV-MS-4501",
    sessionDate: "2026-04-01", status: "Pending", overallResult: "Pending",
    inspectorName: "Rajan Kumar", totalItems: 4, approvedItems: 0, failedItems: 0, missingItems: 0, wrongProductItems: 0,
    dateCreated: "2026-04-01",
  },
  {
    id: 2, sessionNo: "QA-2026-002", grnId: 102, grnNo: "GRN-2026-0102",
    supplierName: "PharmaCare Ltd", invoiceNo: "INV-PC-8823",
    sessionDate: "2026-04-02", status: "In-Progress", overallResult: "Pending",
    inspectorName: "Sunita Rao", totalItems: 3, approvedItems: 1, failedItems: 1, missingItems: 1, wrongProductItems: 0,
    dateCreated: "2026-04-02",
  },
  {
    id: 3, sessionNo: "QA-2026-003", grnId: 103, grnNo: "GRN-2026-0103",
    supplierName: "GlobalMed Imports", invoiceNo: "INV-GM-3312",
    sessionDate: "2026-04-03", status: "Completed", overallResult: "Approved",
    inspectorName: "Rajan Kumar", totalItems: 5, approvedItems: 5, failedItems: 0, missingItems: 0, wrongProductItems: 0,
    dateCreated: "2026-04-03",
  },
  {
    id: 4, sessionNo: "QA-2026-004", grnId: 104, grnNo: "GRN-2026-0104",
    supplierName: "MedSupply Pvt Ltd", invoiceNo: "INV-MS-4612",
    sessionDate: "2026-04-03", status: "Completed", overallResult: "Partial",
    inspectorName: "Anil Sharma", totalItems: 6, approvedItems: 4, failedItems: 1, missingItems: 1, wrongProductItems: 0,
    dateCreated: "2026-04-03",
  },
  {
    id: 5, sessionNo: "QA-2026-005", grnId: 105, grnNo: "GRN-2026-0105",
    supplierName: "MedTech Solutions", invoiceNo: "INV-MT-7701",
    sessionDate: "2026-04-04", status: "Completed", overallResult: "Failed",
    inspectorName: "Sunita Rao", totalItems: 4, approvedItems: 0, failedItems: 2, missingItems: 2, wrongProductItems: 1,
    dateCreated: "2026-04-04",
  },
];

const MOCK_SESSION_DETAIL: Record<number, QaSessionDetail> = {
  1: {
    id: 1, sessionNo: "QA-2026-001", grnId: 101, grnNo: "GRN-2026-0101",
    grnDate: "2026-03-31", invoiceNo: "INV-MS-4501", invoiceDate: "2026-03-30",
    invoiceAmount: 125000, sessionDate: "2026-04-01", status: "Pending", overallResult: "Pending",
    inspectorId: 10, inspectorName: "Rajan Kumar", remarks: "Received from warehouse",
    dateCreated: "2026-04-01",
    supplier: { id: 1, vendorName: "MedSupply Pvt Ltd", vendorCode: "VND-001", gstNumber: "27AABCU9603R1ZX", email: ["procurement@medsupply.in"], phone: ["+91 9876543210"] },
    inspectionItems: [
      {
        id: 11, qaSessionId: 1, grnItemId: 201, itemId: 301, itemCode: "ITM-001", itemName: "Surgical Gloves (Box)",
        itemType: "Main", parentItemId: null, expectedQty: 100, receivedQty: 100,
        isWrongProduct: false, status: "Pending", remarks: "", checklistResponses: [], subItems: [],
        checklistTemplate: { templateId: 1, templateName: "General Goods Inspection" },
      },
      {
        id: 12, qaSessionId: 1, grnItemId: 202, itemId: 302, itemCode: "ITM-002", itemName: "IV Cannula 18G",
        itemType: "Main", parentItemId: null, expectedQty: 500, receivedQty: 500,
        isWrongProduct: false, status: "Pending", remarks: "", checklistResponses: [], subItems: [],
        checklistTemplate: { templateId: 1, templateName: "General Goods Inspection" },
      },
    ],
    paymentFlag: undefined,
  },
  2: {
    id: 2, sessionNo: "QA-2026-002", grnId: 102, grnNo: "GRN-2026-0102",
    grnDate: "2026-04-01", invoiceNo: "INV-PC-8823", invoiceDate: "2026-03-29",
    invoiceAmount: 87500, sessionDate: "2026-04-02", status: "In-Progress", overallResult: "Pending",
    inspectorId: 11, inspectorName: "Sunita Rao", remarks: "",
    dateCreated: "2026-04-02",
    supplier: { id: 2, vendorName: "PharmaCare Ltd", vendorCode: "VND-002", gstNumber: "29AAFCP1234K1Z2", email: ["orders@pharmacare.in"], phone: ["+91 9988776655"] },
    inspectionItems: [
      {
        id: 21, qaSessionId: 2, grnItemId: 211, itemId: 311, itemCode: "ITM-011", itemName: "Paracetamol 500mg (Strip)",
        itemType: "Main", parentItemId: null, expectedQty: 1000, receivedQty: 1000,
        isWrongProduct: false, status: "Approved", remarks: "All good", checklistResponses: [], subItems: [],
        checklistTemplate: { templateId: 1, templateName: "General Goods Inspection" },
      },
      {
        id: 22, qaSessionId: 2, grnItemId: 212, itemId: 312, itemCode: "ITM-012", itemName: "Amoxicillin 250mg Cap",
        itemType: "Main", parentItemId: null, expectedQty: 500, receivedQty: 480,
        isWrongProduct: false, status: "Failed", remarks: "Short supply — 20 units missing", checklistResponses: [], subItems: [],
        checklistTemplate: { templateId: 1, templateName: "General Goods Inspection" },
      },
      {
        id: 23, qaSessionId: 2, grnItemId: 213, itemId: 313, itemCode: "ITM-013", itemName: "Saline 500ml Bag",
        itemType: "Main", parentItemId: null, expectedQty: 200, receivedQty: 0,
        isWrongProduct: false, status: "Missing", remarks: "Not received", checklistResponses: [], subItems: [],
        checklistTemplate: { templateId: 1, templateName: "General Goods Inspection" },
      },
    ],
    paymentFlag: undefined,
  },
  3: {
    id: 3, sessionNo: "QA-2026-003", grnId: 103, grnNo: "GRN-2026-0103",
    grnDate: "2026-04-02", invoiceNo: "INV-GM-3312", invoiceDate: "2026-04-01",
    invoiceAmount: 210000, sessionDate: "2026-04-03", status: "Completed", overallResult: "Approved",
    inspectorId: 10, inspectorName: "Rajan Kumar", remarks: "All items inspected and cleared",
    dateCreated: "2026-04-03",
    supplier: { id: 3, vendorName: "GlobalMed Imports", vendorCode: "VND-003", gstNumber: "07AADCG5432M1ZA", email: ["supply@globalmed.com"], phone: ["+91 8877665544"] },
    inspectionItems: [],
    paymentFlag: { id: 1, qaSessionId: 3, invoiceAmount: 210000, approvedAmount: 210000, holdAmount: 0, status: "FullApproved", reason: "All 5 items passed QA" },
  },
  4: {
    id: 4, sessionNo: "QA-2026-004", grnId: 104, grnNo: "GRN-2026-0104",
    grnDate: "2026-04-02", invoiceNo: "INV-MS-4612", invoiceDate: "2026-04-01",
    invoiceAmount: 95000, sessionDate: "2026-04-03", status: "Completed", overallResult: "Partial",
    inspectorId: 12, inspectorName: "Anil Sharma", remarks: "Partial approval — 2 items have issues",
    dateCreated: "2026-04-03",
    supplier: { id: 1, vendorName: "MedSupply Pvt Ltd", vendorCode: "VND-001", gstNumber: "27AABCU9603R1ZX", email: ["procurement@medsupply.in"], phone: ["+91 9876543210"] },
    inspectionItems: [],
    paymentFlag: { id: 2, qaSessionId: 4, invoiceAmount: 95000, approvedAmount: 70000, holdAmount: 25000, status: "PartialHold", reason: "1 item failed QA, 1 item missing" },
  },
  5: {
    id: 5, sessionNo: "QA-2026-005", grnId: 105, grnNo: "GRN-2026-0105",
    grnDate: "2026-04-03", invoiceNo: "INV-MT-7701", invoiceDate: "2026-04-02",
    invoiceAmount: 320000, sessionDate: "2026-04-04", status: "Completed", overallResult: "Failed",
    inspectorId: 11, inspectorName: "Sunita Rao", remarks: "Major discrepancies — full hold placed",
    dateCreated: "2026-04-04",
    supplier: { id: 4, vendorName: "MedTech Solutions", vendorCode: "VND-004", gstNumber: "24AACCM2211R1ZB", email: ["accounts@medtech.in"], phone: ["+91 7766554433"] },
    inspectionItems: [],
    paymentFlag: { id: 3, qaSessionId: 5, invoiceAmount: 320000, approvedAmount: 0, holdAmount: 320000, status: "FullHold", reason: "2 items failed, 2 items missing, 1 wrong product received" },
  },
};

const MOCK_REPORT_BASE: QaReportSummary = {
  sessionNo: "QA-2026-003",
  grnNo: "GRN-2026-0103",
  supplierName: "GlobalMed Imports",
  invoiceNo: "INV-GM-3312",
  summary: { totalItems: 5, totalSubItems: 0, approved: 5, failed: 0, missing: 0, wrongProduct: 0, pending: 0 },
  items: [],
  paymentRecommendation: "FullApproved",
  generatedAt: "2026-04-03T10:00:00",
};

let nextSessionId = 6;

// ─── QA Sessions ─────────────────────────────────────────────────────────────

export const qaSessionService = {
  getAll: async (): Promise<QaSessionListItem[]> => {
    return [...MOCK_SESSIONS];
  },

  getById: async (id: number): Promise<QaSessionDetail> => {
    const session = MOCK_SESSION_DETAIL[id];
    if (!session) throw new Error(`QA session ${id} not found`);
    return { ...session };
  },

  create: async (payload: QaSessionCreateRequest): Promise<QaSessionDetail> => {
    const newId = nextSessionId++;
    const newSession: QaSessionDetail = {
      id: newId,
      sessionNo: `QA-2026-00${newId}`,
      grnId: payload.grnId,
      grnNo: `GRN-2026-${String(payload.grnId).padStart(4, "0")}`,
      grnDate: new Date().toISOString().split("T")[0],
      invoiceNo: payload.invoiceNo,
      invoiceDate: payload.invoiceDate,
      invoiceAmount: payload.invoiceAmount,
      sessionDate: payload.sessionDate,
      status: "Pending",
      overallResult: "Pending",
      inspectorId: payload.inspectorId,
      inspectorName: "Inspector",
      remarks: payload.remarks,
      dateCreated: new Date().toISOString().split("T")[0],
      supplier: { id: 0, vendorName: "Supplier", vendorCode: "VND-000" },
      inspectionItems: [],
    };
    MOCK_SESSION_DETAIL[newId] = newSession;
    MOCK_SESSIONS.push({
      id: newId, sessionNo: newSession.sessionNo, grnId: payload.grnId,
      grnNo: newSession.grnNo, supplierName: "Supplier", invoiceNo: payload.invoiceNo,
      sessionDate: payload.sessionDate, status: "Pending", overallResult: "Pending",
      inspectorName: "Inspector", totalItems: 0, approvedItems: 0, failedItems: 0,
      missingItems: 0, wrongProductItems: 0, dateCreated: newSession.dateCreated,
    });
    return newSession;
  },

  updateStatus: async (id: number, status: string, overallResult: string): Promise<void> => {
    if (MOCK_SESSION_DETAIL[id]) {
      (MOCK_SESSION_DETAIL[id] as any).status = status;
      (MOCK_SESSION_DETAIL[id] as any).overallResult = overallResult;
    }
    const listItem = MOCK_SESSIONS.find((s) => s.id === id);
    if (listItem) {
      (listItem as any).status = status;
      (listItem as any).overallResult = overallResult;
    }
  },

  getReport: async (id: number): Promise<QaReportSummary> => {
    const session = MOCK_SESSION_DETAIL[id];
    if (!session) throw new Error(`QA session ${id} not found`);
    const allItems = session.inspectionItems.flatMap((i) => [i, ...(i.subItems ?? [])]);
    return {
      ...MOCK_REPORT_BASE,
      sessionNo: session.sessionNo,
      grnNo: session.grnNo,
      supplierName: session.supplier.vendorName,
      invoiceNo: session.invoiceNo,
      items: session.inspectionItems,
      summary: {
        totalItems: allItems.length,
        totalSubItems: allItems.filter((i) => i.itemType === "SubProduct").length,
        approved: allItems.filter((i) => i.status === "Approved").length,
        failed: allItems.filter((i) => i.status === "Failed").length,
        missing: allItems.filter((i) => i.status === "Missing").length,
        wrongProduct: allItems.filter((i) => i.status === "WrongProduct").length,
        pending: allItems.filter((i) => i.status === "Pending").length,
      },
      paymentRecommendation: session.paymentFlag?.status ?? "FullApproved",
      generatedAt: new Date().toISOString(),
    };
  },

  notifyVendor: async (_id: number, _type: string, _msg: string) => ({
    notified: true,
    vendorEmail: "vendor@example.com",
    sentAt: new Date().toISOString(),
  }),

  delete: async (id: number): Promise<void> => {
    const idx = MOCK_SESSIONS.findIndex((s) => s.id === id);
    if (idx !== -1) MOCK_SESSIONS.splice(idx, 1);
    delete MOCK_SESSION_DETAIL[id];
  },
};

// ─── QA Inspection Items ──────────────────────────────────────────────────────

export const qaInspectionService = {
  update: async (id: number, payload: QaInspectionItemUpdateRequest): Promise<void> => {
    for (const detail of Object.values(MOCK_SESSION_DETAIL)) {
      const item = detail.inspectionItems.find((i) => i.id === id);
      if (item) {
        Object.assign(item, payload);
        break;
      }
    }
  },

  submitChecklist: async (
    id: number,
    payload: QaChecklistSubmitRequest
  ): Promise<{ inspectionItemId: number; autoStatus: string }> => {
    const allPassed = payload.responses.every((r) => r.response === "Pass" || r.response === "NA");
    const anyFail = payload.responses.some((r) => r.response === "Fail");
    const autoStatus = anyFail ? "Failed" : allPassed ? "Approved" : "Pending";
    for (const detail of Object.values(MOCK_SESSION_DETAIL)) {
      const item = detail.inspectionItems.find((i) => i.id === id);
      if (item) {
        item.checklistResponses = payload.responses.map((r, idx) => ({ ...r, id: idx + 1, inspectionItemId: id }));
        (item as any).status = autoStatus;
        break;
      }
    }
    return { inspectionItemId: id, autoStatus };
  },
};

// ─── QA Payment Flag ──────────────────────────────────────────────────────────

export const qaPaymentService = {
  save: async (sessionId: number, payload: QaPaymentFlagRequest): Promise<QaPaymentFlag> => {
    const flag: QaPaymentFlag = { id: Date.now(), qaSessionId: sessionId, ...payload };
    if (MOCK_SESSION_DETAIL[sessionId]) {
      MOCK_SESSION_DETAIL[sessionId].paymentFlag = flag;
    }
    return flag;
  },
};

// ─── QA Templates & Checklist Items ──────────────────────────────────────────

export const qaTemplateService = {
  getAll: async (): Promise<QaTemplate[]> => [...MOCK_TEMPLATES],

  getChecklistItems: async (templateId: number): Promise<QaChecklistItem[]> =>
    MOCK_CHECKLIST_ITEMS[templateId] ?? [],

  addChecklistItem: async (templateId: number, payload: QaChecklistItemRequest): Promise<QaChecklistItem> => {
    const existing = MOCK_CHECKLIST_ITEMS[templateId] ?? [];
    const newItem: QaChecklistItem = {
      id: Date.now(),
      templateId,
      checkPoint: payload.checkPoint,
      description: payload.description,
      isRequired: payload.isRequired,
      sequence: payload.sequence ?? existing.length + 1,
    };
    if (!MOCK_CHECKLIST_ITEMS[templateId]) MOCK_CHECKLIST_ITEMS[templateId] = [];
    MOCK_CHECKLIST_ITEMS[templateId].push(newItem);
    return newItem;
  },

  updateChecklistItem: async (templateId: number, itemId: number, payload: Partial<QaChecklistItemRequest>): Promise<void> => {
    const items = MOCK_CHECKLIST_ITEMS[templateId] ?? [];
    const item = items.find((i) => i.id === itemId);
    if (item) Object.assign(item, payload);
  },

  deleteChecklistItem: async (templateId: number, itemId: number): Promise<void> => {
    if (MOCK_CHECKLIST_ITEMS[templateId]) {
      MOCK_CHECKLIST_ITEMS[templateId] = MOCK_CHECKLIST_ITEMS[templateId].filter((i) => i.id !== itemId);
    }
  },
};
