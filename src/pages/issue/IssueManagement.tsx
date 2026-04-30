import React, { useEffect, useState, useCallback, useRef } from "react";
import { FaEdit, FaTrash, FaPlus, FaSearch, FaEye, FaPrint, FaEllipsisV, FaReceipt } from "react-icons/fa";
import { toast } from "react-toastify";
import Modal from "../../components/common/Modal";
import IssueProduct from "./IssueProduct";
import issueService, { IssueResponse, IssuePayload } from "../../services/issueService";
import ToWhomSoEverPrint from "../demo/ToWhomSoEverPrint";
import EWayBill from "../demo/EWayBill";
import InvoiceReportPrint from "./InvoiceReportPrint";
import Receipt from "../receipt/Receipt";

/* ─── Local row type for the table ─── */
interface IssueRow {
  id: number;
  docId: string;
  issueTo: string;
  issTo: string;
  customerName: string;
  partyBranch: string;
  salesRepresentative: string;
  issueDate: string;
  refNo: string;
  refDate: string;
  bookingQty: number;
  bookingAddress: string;
  status: string;
  locationId: string;
  appValue: number;
  generateInvoice: string;
  billNo: string;
  billDate: string;
  billingAmount: number;
  // full payload for edit
  raw: IssueResponse;
}

/* ─── Status Badge ─── */
const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const s = (status ?? "").toUpperCase();
  const config: Record<string, { bg: string; text: string; dot: string }> = {
    ACTIVE: { bg: "bg-emerald-100", text: "text-emerald-700", dot: "bg-emerald-500" },
    INACTIVE: { bg: "bg-red-100", text: "text-red-700", dot: "bg-red-500" },
    PENDING: { bg: "bg-yellow-100", text: "text-yellow-700", dot: "bg-yellow-500" },
    CLOSED: { bg: "bg-gray-200", text: "text-gray-600", dot: "bg-gray-400" },
  };
  const c = config[s] ?? { bg: "bg-blue-100", text: "text-blue-700", dot: "bg-blue-500" };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${c.bg} ${c.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {status || "—"}
    </span>
  );
};

/* ─── Main Component ─── */
export const IssueManagement: React.FC = () => {
  const [allRows, setAllRows] = useState<IssueRow[]>([]);
  const [filtered, setFiltered] = useState<IssueRow[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [selectedRaw, setSelectedRaw] = useState<IssueResponse | null>(null);
  const [viewId, setViewId] = useState<number | null>(null);
  const [idToDelete, setIdToDelete] = useState<number | null>(null);
  const [receiptIssueId, setReceiptIssueId] = useState<number | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [activePrintRow, setActivePrintRow] = useState<IssueRow | null>(null);
  const [showPrintOptions, setShowPrintOptions] = useState<number | null>(null);
  const ITEMS_PER_PAGE = 10;

  /* ─── Map API response → table row ─── */
  const mapToRow = (item: any): IssueRow => {
    // Robust mapping: check if fields are in item.issue or at top-level
    const iss = item.issue || item;
    const id = iss.id || item.id || 0;

    return {
      id: id,
      docId: iss.docId || item.docId || `#${id}`,
      issueTo: iss.issueTo || item.issueTo || "",
      issTo: iss.issTo || item.issTo || "",
      customerName: item.partyName || item.PartyName || iss.customerName || item.customerName || "",
      partyBranch: iss.partyBranch || item.partyBranch || "",
      salesRepresentative: iss.salesRepresentative || item.salesRepresentative || "",
      issueDate: (iss.issueDate || item.issueDate) ? new Date(iss.issueDate || item.issueDate).toLocaleDateString("en-GB") : "",
      refNo: iss.refNo || item.refNo || "",
      refDate: (iss.refDate || item.refDate) ? new Date(iss.refDate || item.refDate).toLocaleDateString("en-GB") : "",
      bookingQty: iss.bookingQty ?? item.bookingQty ?? 0,
      bookingAddress: iss.bookingAddress || item.bookingAddress || "",
      status: iss.status || item.status || "",
      locationId: iss.locationId || item.locationId || "",
      appValue: iss.appValue ?? item.appValue ?? 0,
      generateInvoice: iss.generateInvoice || item.generateInvoice || "NO",
      billNo: iss.billNo || item.billNo || "",
      billDate: (iss.billDate || item.billDate) ? new Date(iss.billDate || item.billDate).toLocaleDateString("en-GB") : "",
      billingAmount: iss.billingAmount ?? item.billingAmount ?? 0,
      raw: item,
    };
  };

  /* ─── Fetch all issues ─── */
  const fetchAll = useCallback(async () => {
    setIsLoading(true);
    try {
      console.log("Fetching issues from API...");
      const data = await issueService.getAll();
      console.log("Raw API Response data:", data);

      if (!Array.isArray(data)) {
        console.warn("API did not return an array. Data:", data);
        setAllRows([]);
        setFiltered([]);
        return;
      }

      const rows = data.map(mapToRow);
      console.log("Mapped rows for UI:", rows);

      setAllRows(rows);
      setFiltered(rows);
    } catch (err) {
      console.error("Error fetching issues:", err);
      toast.error("Failed to fetch issues");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  /* ─── Search / filter ─── */
  useEffect(() => {
    const q = search.toLowerCase().trim();
    if (!q) {
      setFiltered(allRows);
    } else {
      setFiltered(
        allRows.filter(
          (r) =>
            r.docId.toLowerCase().includes(q) ||
            r.customerName.toLowerCase().includes(q) ||
            r.salesRepresentative.toLowerCase().includes(q) ||
            r.issueTo.toLowerCase().includes(q) ||
            r.refNo.toLowerCase().includes(q) ||
            r.status.toLowerCase().includes(q)
        )
      );
    }
    setCurrentPage(1);
  }, [search, allRows]);

  /* ─── Pagination ─── */
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  /* ─── CRUD Handlers ─── */
  const handleAdd = () => {
    setSelectedRaw(null);
    setIsFormOpen(true);
  };

  const handleEdit = (row: IssueRow) => {
    setSelectedRaw(row.raw);
    setIsFormOpen(true);
  };

  const handleView = (row: IssueRow) => {
    setViewId(row.id);
    setIsViewOpen(true);
  };
  
  const handleCreateReceipt = (row: IssueRow) => {
    setReceiptIssueId(row.id);
    setIsReceiptModalOpen(true);
  };

  const handlePrint = () => {
    window.print();
  };

  /* ─── Specialized Print Handlers ─── */
  const getWhomData = (row: IssueRow) => ({
    companyGSTIN: "33AABCJ6465C1ZW",
    date: row.issueDate,
    invoiceNo: row.docId,
    bookingThrough: row.salesRepresentative || row.issTo,
    bookingQty: `${row.bookingQty} BOX`,
    customerAddress: row.bookingAddress || row.customerName,
    customerGSTIN: row.raw.issue.customerName || "", // Use customerID/Name if GSTIN not in DTO
    transportMode: row.raw.issue.transporter || "Road",
    purpose: row.issueTo || "DEMO PURPOSE",
    remarks: row.raw.issue.comments || "It is not meant for sale. There is no commercial value involved in this transaction.",
    contactPhone: "9443366752",
    footerAddress: "Sri Ragavendra Tower, 3rd Floor, No-34, Co-operative E-colony, Behind Kumudham Nagar, Villankurichi Road, Coimbatore – 641035\nPh: 9443367915, 9443366752. E-mail: info@jbsmeditec.com"
  });

  const getEWayData = (row: IssueRow) => ({
    uniqueNo: row.raw.issue.ewayBillNo || "—",
    enteredDate: row.raw.issue.ewayBillDate ? new Date(row.raw.issue.ewayBillDate).toLocaleDateString("en-GB") : row.issueDate,
    enteredBy: row.raw.issue.deliveredBy || "ADMIN",
    gstinSupplier: "33AABCJ6465C1ZW",
    placeDispatch: "COIMBATORE",
    gstinRecipient: row.raw.issue.customerName || "—",
    placeDelivery: row.partyBranch || "—",
    documentNo: row.docId,
    documentDate: row.issueDate,
    transactionType: "Regular",
    valueGoods: row.appValue || 0,
    hsnCode: "9018",
    reasonTransport: "Demo/Trial",
    transporter: row.raw.issue.transporter || "Self",
    barcode: row.raw.issue.ewayBillNo || row.docId
  });

  const handlePrintWhom = (row: IssueRow) => {
    setActivePrintRow(row);
    // Logic to wait for render then print
    setTimeout(() => {
      const content = document.getElementById("whom-print-area")?.innerHTML;
      if (content) printContents(content);
    }, 300);
  };

  const handlePrintEWayBill = (row: IssueRow) => {
    setActivePrintRow(row);
    setTimeout(() => {
      const content = document.getElementById("ewaybill-print-area")?.innerHTML;
      if (content) printContents(content);
    }, 300);
  };

  const printContents = (html: string, title: string = "Print") => {
    const win = window.open("", "_blank", "width=900,height=700");
    win?.document.write(`
      <html>
        <head>
          <title>${title}</title>
          <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
          <style>
            @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
            body { font-family: sans-serif; }
          </style>
        </head>
        <body>${html}</body>
      </html>
    `);
    win?.document.close();
    win?.focus();
    setTimeout(() => {
      win?.print();
      win?.close();
    }, 500);
  };

  const handlePrintDemoReport = (row: IssueRow) => {
    const iss = row.raw.issue;
    const items = row.raw.bomDetails.map(b => b.bomName).join(", ");

    const html = `
      <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 800px; margin: 0 auto; background: white; color: #000;">
        <!-- Orange Top Banner -->
        <div style="background-color: #d2691e; color: white; padding: 8px; text-align: center; font-weight: bold; font-size: 12px; margin-bottom: 10px;">
          Laparoscope ■ Cystoscope ■ Ureteroscope ■ Fetal Monitor ■ S.I. PUMP
        </div>

        <!-- Company Brands & Logo -->
        <div style="display: flex; justify-content: space-between; align-items: flex-start; mb-4; padding: 10px; border: 1px solid #ccc; margin-bottom: 15px;">
          <div style="font-size: 11px; line-height: 1.4;">
            <div><strong>ALPHA</strong> - Cystoscopy, Hysteroscopy, APC, Saline-TUR</div>
            <div><strong>HOSPINZ</strong> - Laparoscope Instruments, VET, Saline</div>
            <div><strong>RICHARD WOLF</strong> - Germany - Urology</div>
          </div>
          <div style="font-size: 24px; font-weight: bold; color: #228B22;">
            JBS meditec India (P) Ltd.
          </div>
        </div>

        <!-- Title and Date -->
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
          <div style="text-align: center; font-size: 16px; font-weight: bold; text-decoration: underline; flex: 1;">
            Demonstration Report
          </div>
          <div style="font-size: 12px; font-weight: bold;">
            Date : ${row.issueDate}
          </div>
        </div>

        <!-- Sections -->
        <div style="margin-bottom: 10px;">
          <div style="display: flex; align-items: flex-start; margin-bottom: 10px;">
            <span style="font-weight: bold; width: 180px; font-size: 12px;">1. Customer Address</span>
            <span style="font-weight: bold; marginRight: 10px;">:</span>
            <div style="flex: 1; border-bottom: 1px solid #000; min-height: 18px; padding-left: 5px; font-size: 11px;">
              ${row.bookingAddress || row.customerName}
            </div>
          </div>
          <div style="display: flex; align-items: flex-start; margin-bottom: 10px;">
            <span style="font-weight: bold; width: 180px; font-size: 12px;">2. Product Details</span>
            <span style="font-weight: bold; marginRight: 10px;">:</span>
            <div style="flex: 1; border-bottom: 1px solid #000; min-height: 18px; padding-left: 5px; font-size: 11px;">
              ${items}
            </div>
          </div>
          <div style="display: flex; align-items: flex-start; margin-bottom: 15px;">
            <span style="font-weight: bold; width: 180px; font-size: 12px;">3. Unit Serial No</span>
            <span style="font-weight: bold; marginRight: 10px;">:</span>
            <div style="flex: 1; border-bottom: 1px solid #000; min-height: 18px; padding-left: 5px;">${iss.docId}</div>
          </div>
        </div>

        <!-- Case Details (Grid) -->
        <div style="margin-bottom: 20px;">
          <div style="font-weight: bold; font-size: 12px; margin-bottom: 8px;">4. Case Details</div>
          <div style="font-weight: bold; font-size: 12px; margin-bottom: 8px; margin-left: 20px;">(a) Case Speciality :</div>
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 5px 20px; margin-left: 40px; font-size: 11px; margin-bottom: 15px;">
            <div>☐ General Surgery</div>
            <div>☐ Paediatric</div>
            <div>☐ Neuro</div>
            <div>☐ Gynaecology</div>
            <div>☐ Cardiothoracic</div>
            <div>☐ Oncology</div>
            <div>☐ Plastic</div>
            <div>☐ Ortho</div>
            <div>☐ Microsurgery</div>
            <div>☐ Urology</div>
            <div>☐ ENT</div>
            <div>☐ Gastroenterology</div>
          </div>
          <div style="display: flex; align-items: center; margin-bottom: 10px; margin-left: 20px;">
            <span style="font-weight: bold; font-size: 12px; width: 160px;">Any Other Pls Specify :</span>
            <div style="flex: 1; border-bottom: 1px solid #000; min-height: 18px;"></div>
          </div>
          <div style="font-weight: bold; font-size: 12px; margin-bottom: 8px; margin-left: 20px;">(b) Case Type :</div>
          <div style="display: flex; gap: 30px; margin-left: 40px; font-size: 11px; margin-bottom: 10px;">
            <div>☐ Laparoscope</div>
            <div>☐ Endoscopy</div>
            <div>☐ Open Surgery</div>
          </div>
        </div>

        <!-- More Sections (Placeholders for UI consistency) -->
        <div style="margin-bottom: 15px;">
          <div style="font-weight: bold; font-size: 12px; margin-bottom: 8px;">5. Demo Type :</div>
          <div style="display: flex; gap: 30px; margin-left: 40px; font-size: 11px;">
            <div>☐ Case demo</div>
            <div>☐ Table demo</div>
            <div>☐ Tender demo</div>
          </div>
        </div>

        <div style="margin-bottom: 15px;">
          <div style="font-weight: bold; font-size: 12px; margin-bottom: 8px;">6. Product Performance :</div>
          <div style="display: flex; gap: 20px; margin-left: 40px; font-size: 11px;">
            <div>${iss.demoReport === 'EXCELLENT' ? '☑' : '☐'} Excellent</div>
            <div>${iss.demoReport === 'GOOD' ? '☑' : '☐'} Good</div>
            <div>${iss.demoReport === 'SATISFACTORY' ? '☑' : '☐'} Satisfactory</div>
            <div>${iss.demoReport === 'NOT_SATISFACTORY' ? '☑' : '☐'} Not Satisfactory</div>
          </div>
        </div>

        <div style="margin-bottom: 15px;">
          <div style="font-weight: bold; font-size: 12px; margin-bottom: 5px;">7. Customer Utility Feedback:</div>
          <div style="border: 1px solid #000; min-height: 50px; padding: 5px; font-size: 11px;">
            ${iss.demoRemarks || ''}
          </div>
        </div>

        <div style="margin-bottom: 25px;">
          <div style="font-weight: bold; font-size: 12px; margin-bottom: 5px;">8. Executive Report :</div>
          <div style="border: 1px solid #000; min-height: 60px; padding: 5px; font-size: 11px;">
            ${iss.comments || ''}
          </div>
        </div>

        <!-- Signatures -->
        <div style="display: flex; justify-content: space-between; margin-top: 30px; margin-bottom: 25px;">
          <div style="text-align: center; width: 45%;">
            <div style="border-bottom: 1px solid #000; height: 50px; margin-bottom: 8px;"></div>
            <div style="font-weight: bold; font-size: 11px;">Seal & Signature of the Doctor</div>
          </div>
          <div style="text-align: center; width: 45%;">
            <div style="border-bottom: 1px solid #000; height: 50px; margin-bottom: 8px;"></div>
            <div style="font-weight: bold; font-size: 11px;">Name & Signature of the Executive</div>
          </div>
        </div>

        <!-- Footer Address -->
        <div style="text-align: center; font-size: 10px; margin-bottom: 8px; font-weight: bold;">
          Sri Ragavendra Tower, 3rd Floor, No.34, Co-operative E-colony, Behind Kumudham Nagar,<br/>
          Villankurichi Road, Coimbatore – 641035. Ph: 9443367915, 9443366752. info@jbsmeditec.com
        </div>

        <!-- Footer Dark Banner -->
        <div style="background-color: #2F4F4F; color: white; padding: 6px; text-align: center; font-size: 11px; font-weight: bold;">
          Diathermy ■ Alligature ■ Argo Plasma Coagulator (APC) ■ Saline-TUR
        </div>
      </div>
    `;
    printContents(html, "Demo Report");
  };

  const handleDelete = (id: number) => {
    setIdToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!idToDelete) return;
    try {
      await issueService.delete(idToDelete);
      toast.success("Issue deleted successfully");
      fetchAll();
    } catch (err) {
      console.error("Error deleting issue:", err);
      toast.error("Failed to delete issue");
    } finally {
      setIsDeleteModalOpen(false);
      setIdToDelete(null);
    }
  };

  const handlePrintInvoice = (row: IssueRow) => {
    if (row.raw.issue.generateInvoice !== "YES") {
      toast.info("Invoice generation is not enabled for this issue.");
      return;
    }
    setActivePrintRow(row);
    setTimeout(() => {
      const content = document.getElementById(`invoice-report-area-${row.id}`)?.innerHTML;
      if (content) printContents(content, "Invoice Report");
    }, 300);
  };

  const handlePrintOption = (row: IssueRow) => {
    // Standard system print for the whole window or a summary
    window.print();
  };

  const handleSaved = () => {
    setIsFormOpen(false);
    fetchAll();
  };

  /* ─── Build IssueProduct data prop from raw response ─── */
  const buildEditData = (raw: IssueResponse) => ({
    issue: {
      id: raw.issue.id,
      userCreated: raw.issue.userCreated,
      dateCreated: raw.issue.dateCreated,
      userUpdated: raw.issue.userUpdated,
      dateUpdated: raw.issue.dateUpdated,
      locationId: raw.issue.locationId,
      bomIds: raw.issue.bomIds || [],
      issTo: raw.issue.issTo,
      issueTo: raw.issue.issueTo,
      customerName: raw.issue.customerName,
      salesRepresentative: raw.issue.salesRepresentative,
      demoFrom: raw.issue.demoFrom,
      demoReport: raw.issue.demoReport,
      docId: raw.issue.docId,
      issueDate: raw.issue.issueDate,
      refNo: raw.issue.refNo,
      refDate: raw.issue.refDate,
      bookingAddress: raw.issue.bookingAddress,
      bookingQty: raw.issue.bookingQty,
      comments: raw.issue.comments,
      narration: raw.issue.narration,
      partyBranch: raw.issue.partyBranch,
      status: raw.issue.status,
      goodsConsignFrom: raw.issue.goodsConsignFrom,
      goodsConsignTo: raw.issue.goodsConsignTo,
      deliveredBy: raw.issue.deliveredBy,
      appValue: raw.issue.appValue,
      receivedOn: raw.issue.receivedOn,
      demoRemarks: raw.issue.demoRemarks,
      generateInvoice: raw.issue.generateInvoice,
      billNo: raw.issue.billNo,
      billDate: raw.issue.billDate,
      doctorName: raw.issue.doctorName,
      billingDescription: raw.issue.billingDescription,
      billingAmount: raw.issue.billingAmount,
      gross: raw.issue.gross,
      totalQty: raw.issue.totalQty,
      amountInWords: raw.issue.amountInWords,
      ewayBillNo: raw.issue.ewayBillNo,
      ewayBillDate: raw.issue.ewayBillDate,
      transporter: raw.issue.transporter,
      vehicleNo: raw.issue.vehicleNo,
      optionalItems: (raw.issue.optionalItems as any) ?? [],
      issueItems: (raw.issue.issueItems as any) ?? [],
    },
    bomDetails: raw.bomDetails || [],
  });

  /* ─── Render ─── */
  return (
    <div className="p-6 min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Page Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <span className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </span>
            Issue Management
          </h1>
          <p className="text-sm text-gray-500 mt-1 ml-12">
            Manage all product issue records — create, view, edit, and delete
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              id="issue-search"
              type="text"
              placeholder="Search issues…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-60 transition"
            />
          </div>

          {/* Add Button */}
          <button
            id="add-issue-btn"
            onClick={handleAdd}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-semibold text-sm shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5"
          >
            <FaPlus size={14} /> Add Issue
          </button>

          {/* Print Dropdown */}
          {/* <div className="relative">
            <button
              onClick={() => setShowPrintOptions(showPrintOptions === -1 ? null : -1)}
              title="Print Options"
              className="p-2.5 rounded-xl border border-gray-200 text-gray-600 hover:text-blue-600 hover:bg-white hover:shadow-sm transition-all flex items-center gap-1"
            >
              <FaPrint size={18} />
              <FaEllipsisV size={10} className="text-gray-400" />
            </button>
            
            {showPrintOptions === -1 && (
              <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-100 rounded-xl shadow-xl z-[100] py-2">
                <div className="px-4 py-2 text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-50 mb-1">
                  Document Select
                </div>
                <button
                  onClick={() => { setShowPrintOptions(null); handlePrint(); }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition flex items-center gap-2"
                >
                   <FaPrint size={14} className="text-gray-400" /> Print Current List
                </button>
                <div className="border-t border-gray-50 my-1"></div>
                <p className="px-4 py-1 text-[10px] text-gray-400 italic">Select a row below for specific docs, or print list above.</p>
              </div>
            )}
          </div> */}
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Issues", value: allRows.length, color: "blue" },
          { label: "Active", value: allRows.filter(r => r.status?.toUpperCase() === "ACTIVE").length, color: "emerald" },
          { label: "Inactive", value: allRows.filter(r => r.status?.toUpperCase() === "INACTIVE").length, color: "red" },
          { label: "Showing", value: filtered.length, color: "violet" },
        ].map((stat) => (
          <div key={stat.label} className={`bg-white rounded-2xl border border-${stat.color}-100 shadow-sm p-4 flex items-center gap-3`}>
            <div className={`w-10 h-10 rounded-xl bg-${stat.color}-100 flex items-center justify-center`}>
              <span className={`text-${stat.color}-600 font-bold text-lg`}>{stat.value}</span>
            </div>
            <span className="text-sm text-gray-600 font-medium">{stat.label}</span>
          </div>
        ))}
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Table Header */}
        <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-blue-700 to-indigo-700 flex items-center justify-between">
          <h2 className="text-white font-bold text-sm tracking-wide uppercase">
            Issue Records
          </h2>
          <span className="text-blue-200 text-xs font-medium">
            {filtered.length} record{filtered.length !== 1 ? "s" : ""}
          </span>
        </div>

        {isLoading ? (
          /* Loading Skeleton */
          <div className="p-6 space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-12 bg-gray-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px]">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {["#", "Doc No", "Bill No", "Location", "Issued To", "Party Name", "Sales Rep", "Issue Date", "Ref No", "Qty", "Bill Amt", "Status", "Actions"].map((h) => (
                    <th
                      key={h}
                      className={`px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap ${
                        h === "Actions" ? "sticky right-0 bg-gray-50 z-10 shadow-[-4px_0_6px_-2px_rgba(0,0,0,0.1)]" : ""
                      }`}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {paginated.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="text-center py-20">
                      <div className="flex flex-col items-center gap-3 text-gray-400">
                        <svg className="w-14 h-14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p className="text-lg font-medium text-gray-500">No issues found</p>
                        <p className="text-sm text-gray-400">
                          {search ? "Try adjusting your search" : "Click 'Add Issue' to create the first record"}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginated.map((row, idx) => (
                    <tr
                      key={row.id}
                      className="hover:bg-blue-50/40 transition-colors group"
                    >
                      {/* # */}
                      <td className="px-4 py-3 text-xs text-gray-400 font-mono">
                        {(currentPage - 1) * ITEMS_PER_PAGE + idx + 1}
                      </td>
                      {/* Doc No */}
                      <td className="px-4 py-3">
                        <button
                          id={`view-doc-${row.id}`}
                          onClick={() => handleView(row)}
                          className="text-blue-600 hover:text-blue-800 font-semibold text-sm hover:underline"
                        >
                          {row.docId}
                        </button>
                      </td>
                      {/* Bill No */}
                      <td className="px-4 py-3">
                        {row.billNo ? (
                          <span className="text-sm font-semibold text-emerald-700 bg-emerald-50 px-2 py-1 rounded inline-block">
                            {row.billNo}
                          </span>
                        ) : (
                          <span className="text-gray-400 text-xs italic">N/A</span>
                        )}
                      </td>
                      {/* Location */}
                      <td className="px-4 py-3">
                        <span className="inline-block bg-violet-100 text-violet-700 text-xs font-semibold px-2 py-0.5 rounded-md">
                          {row.locationId || "—"}
                        </span>
                      </td>
                      {/* Issued To */}
                      <td className="px-4 py-3 text-sm text-gray-700">{row.issueTo || "—"}</td>
                      {/* Party Name */}
                      <td className="px-4 py-3 text-sm font-medium text-gray-800">{row.customerName || "—"}</td>
                      {/* Sales Rep */}
                      <td className="px-4 py-3 text-sm text-gray-600">{row.salesRepresentative || "—"}</td>
                      {/* Issue Date */}
                      <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{row.issueDate || "—"}</td>
                      {/* Ref No */}
                      <td className="px-4 py-3 text-sm text-gray-500">{row.refNo || "—"}</td>
                      {/* Booking Qty */}
                      <td className="px-4 py-3 text-sm font-bold text-gray-700 text-center">{row.bookingQty ?? "-"}</td>
                      {/* Bill Amt */}
                      <td className="px-4 py-3 text-sm font-bold text-indigo-700 text-right whitespace-nowrap">
                        {row.billingAmount > 0 ? `₹${row.billingAmount.toLocaleString("en-IN")}` : "—"}
                      </td>
                      {/* Status */}
                      <td className="px-4 py-3">
                        <StatusBadge status={row.status} />
                      </td>
                      {/* Actions */}
                      <td className="px-4 py-3 sticky right-0 bg-white group-hover:bg-blue-50 transition-colors z-10 shadow-[-4px_0_6px_-2px_rgba(0,0,0,0.1)]">
                        <div className="flex items-center gap-1.5">
                          <button
                            id={`view-btn-${row.id}`}
                            title="View"
                            onClick={() => handleView(row)}
                            className="p-1.5 rounded-lg text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-all border border-transparent hover:border-blue-100"
                          >
                            <FaEye size={15} />
                          </button>
                          <button
                            id={`edit-btn-${row.id}`}
                            title="Edit"
                            onClick={() => handleEdit(row)}
                            className="p-1.5 rounded-lg text-gray-500 hover:text-amber-600 hover:bg-amber-50 transition-all border border-transparent hover:border-amber-100"
                          >
                            <FaEdit size={15} />
                          </button>
                          <button
                            id={`receipt-btn-${row.id}`}
                            title="Create Receipt"
                            onClick={() => handleCreateReceipt(row)}
                            className="p-1.5 rounded-lg text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 transition-all border border-transparent hover:border-emerald-100"
                          >
                            <FaReceipt size={15} />
                          </button>
                          <button
                            id={`delete-btn-${row.id}`}
                            title="Delete"
                            onClick={() => handleDelete(row.id)}
                            className="p-1.5 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50 transition-all border border-transparent hover:border-red-100"
                          >
                            <FaTrash size={15} />
                          </button>

                          {/* Row Print Dropdown */}
                          <div className="relative inline-block ml-1">
                            <button
                              onClick={() => setShowPrintOptions(showPrintOptions === row.id ? null : row.id)}
                              className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-all"
                            >
                              <FaPrint size={15} />
                            </button>

                            {showPrintOptions === row.id && (
                              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-lg shadow-xl z-50 py-1 overflow-hidden">
                                <button
                                  onClick={() => { setShowPrintOptions(null); handlePrintWhom(row); }}
                                  className="w-full text-left px-4 py-2 text-xs text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition"
                                >
                                  To Whom So Ever
                                </button>
                                <button
                                  onClick={() => { setShowPrintOptions(null); handlePrintEWayBill(row); }}
                                  className="w-full text-left px-4 py-2 text-xs text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition"
                                >
                                  EWay Bill
                                </button>
                                <button
                                  onClick={() => { setShowPrintOptions(null); handlePrintDemoReport(row); }}
                                  className="w-full text-left px-4 py-2 text-xs text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition"
                                >
                                  Demo Report
                                </button>
                                <button
                                  onClick={() => { setShowPrintOptions(null); handlePrintInvoice(row); }}
                                  className="w-full text-left px-4 py-2 text-xs text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 transition border-t border-gray-50"
                                >
                                  Invoice Report
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/50">
            <span className="text-sm text-gray-500">
              Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)} of {filtered.length}
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm font-medium disabled:opacity-40 hover:bg-gray-100 transition"
              >
                ← Prev
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                .reduce<(number | "...")[]>((acc, p, idx, arr) => {
                  if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push("...");
                  acc.push(p);
                  return acc;
                }, [])
                .map((p, i) =>
                  p === "..." ? (
                    <span key={`dots-${i}`} className="px-2 text-gray-400">…</span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => setCurrentPage(p as number)}
                      className={`w-9 h-9 rounded-lg text-sm font-semibold transition ${currentPage === p
                        ? "bg-blue-600 text-white shadow-md"
                        : "border border-gray-200 hover:bg-gray-100 text-gray-700"
                        }`}
                    >
                      {p}
                    </button>
                  )
                )}
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm font-medium disabled:opacity-40 hover:bg-gray-100 transition"
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ADD / EDIT MODAL */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={selectedRaw ? "Edit Issue" : "Add New Issue"}
      >
        <IssueProduct
          isEdit={!!selectedRaw}
          data={selectedRaw ? (buildEditData(selectedRaw) as any) : undefined}
          onSave={handleSaved}
          onClose={() => setIsFormOpen(false)}
        />
      </Modal>

      {/* VIEW MODAL (read-only detail) */}
      <Modal
        isOpen={isViewOpen}
        onClose={() => setIsViewOpen(false)}
        title="Issue Details"
      >
        {viewId && (
          <IssueViewDetail
            id={viewId}
            onClose={() => setIsViewOpen(false)}
          />
        )}
      </Modal>

      {/* RECEIPT MODAL */}
      <Modal
        isOpen={isReceiptModalOpen}
        onClose={() => setIsReceiptModalOpen(false)}
        title="Create Receipt"
        type="max"
      >
        {receiptIssueId && (
          <Receipt
            initialIssueId={receiptIssueId}
            onClose={() => setIsReceiptModalOpen(false)}
            onSuccess={() => {
              setIsReceiptModalOpen(false);
              fetchAll();
            }}
          />
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Issue"
      >
        <div className="p-6 text-center">
          <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaTrash size={24} />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Are you sure?</h3>
          <p className="text-gray-500 mb-8">
            This action cannot be undone. This will permanently delete the issue
            record from the system.
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => setIsDeleteModalOpen(false)}
              className="px-6 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={confirmDelete}
              className="px-6 py-2.5 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 shadow-lg shadow-red-200 transition-all"
            >
              Yes, Delete
            </button>
          </div>
        </div>
      </Modal>

      {/* Hidden Print Areas for Content Capture */}
      <div style={{ display: 'none' }}>
        <div id="whom-print-area">
          {activePrintRow && <ToWhomSoEverPrint data={getWhomData(activePrintRow)} />}
        </div>
        <div id="ewaybill-print-area">
          {activePrintRow && <EWayBill data={getEWayData(activePrintRow)} />}
        </div>
        <div id={`invoice-report-area-${activePrintRow?.id}`}>
          {activePrintRow && <InvoiceReportPrint data={activePrintRow.raw} id={activePrintRow.id} />}
        </div>
      </div>
    </div>
  );
};

/* ─── Read-only View Detail ─── */
const IssueViewDetail: React.FC<{ id: number; onClose: () => void }> = ({ id, onClose }) => {
  const [data, setData] = useState<IssueResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPrintOptions, setShowPrintOptions] = useState(false);

  useEffect(() => {
    issueService.getById(id).then((d) => {
      setData(d);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="p-8 flex justify-center items-center">
      <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!data) return (
    <div className="p-8 text-center text-red-600">Failed to load issue details.</div>
  );

  const iss = data.issue;
  const field = (label: string, value: any) => (
    <div key={label} className="flex flex-col">
      <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-0.5">{label}</span>
      <span className="text-sm font-medium text-gray-800">{value || "—"}</span>
    </div>
  );

  /* ─── Print Handlers for View Modal ─── */
  const printContents = (html: string, title: string = "Print") => {
    const win = window.open("", "_blank", "width=900,height=700");
    win?.document.write(`
      <html>
        <head>
          <title>${title}</title>
          <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
          <style>
            @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
            body { font-family: sans-serif; }
          </style>
        </head>
        <body>${html}</body>
      </html>
    `);
    win?.document.close();
    win?.focus();
    setTimeout(() => {
      win?.print();
      win?.close();
    }, 500);
  };

  const mapToWhomData = (iss: any) => ({
    companyGSTIN: "33AABCJ6465C1ZW",
    date: iss.issueDate ? new Date(iss.issueDate).toLocaleDateString("en-GB") : "",
    invoiceNo: iss.docId,
    bookingThrough: iss.salesRepresentative || iss.issTo,
    bookingQty: `${iss.bookingQty} BOX`,
    customerAddress: iss.bookingAddress || iss.customerName,
    customerGSTIN: iss.customerName || "",
    transportMode: iss.transporter || "Road",
    purpose: iss.issueTo || "DEMO PURPOSE",
    remarks: iss.comments || "It is not meant for sale. There is no commercial value involved in this transaction.",
    contactPhone: "9443366752",
    footerAddress: "Sri Ragavendra Tower, 3rd Floor, No-34, Co-operative E-colony, Behind Kumudham Nagar, Villankurichi Road, Coimbatore – 641035\nPh: 9443367915, 9443366752. E-mail: info@jbsmeditec.com"
  });

  const mapToEWayData = (iss: any) => ({
    uniqueNo: iss.ewayBillNo || "—",
    enteredDate: iss.ewayBillDate ? new Date(iss.ewayBillDate).toLocaleDateString("en-GB") : (iss.issueDate ? new Date(iss.issueDate).toLocaleDateString("en-GB") : ""),
    enteredBy: iss.deliveredBy || "ADMIN",
    gstinSupplier: "33AABCJ6465C1ZW",
    placeDispatch: "COIMBATORE",
    gstinRecipient: iss.customerName || "—",
    placeDelivery: "—",
    documentNo: iss.docId,
    documentDate: iss.issueDate ? new Date(iss.issueDate).toLocaleDateString("en-GB") : "",
    transactionType: "Regular",
    valueGoods: iss.appValue || 0,
    hsnCode: "9018",
    reasonTransport: "Demo/Trial",
    transporter: iss.transporter || "Self",
    barcode: iss.ewayBillNo || iss.docId
  });

  const handlePrintWhom = () => {
    const content = document.getElementById(`whom-print-area-${id}`)?.innerHTML;
    if (content) printContents(content, "To Whom So Ever");
  };

  const handlePrintEWayBill = () => {
    const content = document.getElementById(`ewaybill-print-area-${id}`)?.innerHTML;
    if (content) printContents(content, "EWay Bill");
  };

  const handlePrintInvoice = () => {
    if (!data) return;
    if (data.issue.generateInvoice !== "YES") {
      toast.info("Invoice generation is not enabled for this issue.");
      return;
    }
    const content = document.getElementById(`invoice-report-area-${id}`)?.innerHTML;
    if (content) printContents(content, "Invoice Report");
  };

  const handlePrintOption = () => {
    window.print();
  };

  const handlePrintDemoReport = () => {
    if (!data) return;
    const iss = data.issue;
    const itemsList = data.bomDetails.map(b => b.bomName).join(", ");
    const dateStr = iss.issueDate ? new Date(iss.issueDate).toLocaleDateString("en-GB") : "";

    const html = `
      <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 800px; margin: 0 auto; background: white; color: #000;">
        <!-- Orange Top Banner -->
        <div style="background-color: #d2691e; color: white; padding: 8px; text-align: center; font-weight: bold; font-size: 12px; margin-bottom: 10px;">
          Laparoscope ■ Cystoscope ■ Ureteroscope ■ Fetal Monitor ■ S.I. PUMP
        </div>

        <!-- Company Brands & Logo -->
        <div style="display: flex; justify-content: space-between; align-items: flex-start; mb-4; padding: 10px; border: 1px solid #ccc; margin-bottom: 15px;">
          <div style="font-size: 11px; line-height: 1.4;">
            <div><strong>ALPHA</strong> - Cystoscopy, Hysteroscopy, APC, Saline-TUR</div>
            <div><strong>HOSPINZ</strong> - Laparoscope Instruments, VET, Saline</div>
            <div><strong>RICHARD WOLF</strong> - Germany - Urology</div>
          </div>
          <div style="font-size: 24px; font-weight: bold; color: #228B22;">
            JBS meditec India (P) Ltd.
          </div>
        </div>

        <!-- Title and Date -->
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
          <div style="text-align: center; font-size: 16px; font-weight: bold; text-decoration: underline; flex: 1;">
            Demonstration Report
          </div>
          <div style="font-size: 12px; font-weight: bold;">
            Date : ${dateStr}
          </div>
        </div>

        <!-- Sections -->
        <div style="margin-bottom: 10px;">
          <div style="display: flex; align-items: flex-start; margin-bottom: 10px;">
            <span style="font-weight: bold; width: 180px; font-size: 12px;">1. Customer Address</span>
            <span style="font-weight: bold; margin-right: 10px;">:</span>
            <div style="flex: 1; border-bottom: 1px solid #000; min-height: 18px; padding-left: 5px; font-size: 11px;">
              ${iss.bookingAddress || iss.customerName}
            </div>
          </div>
          <div style="display: flex; align-items: flex-start; margin-bottom: 10px;">
            <span style="font-weight: bold; width: 180px; font-size: 12px;">2. Product Details</span>
            <span style="font-weight: bold; margin-right: 10px;">:</span>
            <div style="flex: 1; border-bottom: 1px solid #000; min-height: 18px; padding-left: 5px; font-size: 11px;">
              ${itemsList}
            </div>
          </div>
          <div style="display: flex; align-items: flex-start; margin-bottom: 15px;">
            <span style="font-weight: bold; width: 180px; font-size: 12px;">3. Unit Serial No</span>
            <span style="font-weight: bold; margin-right: 10px;">:</span>
            <div style="flex: 1; border-bottom: 1px solid #000; min-height: 18px; padding-left: 5px;">${iss.docId}</div>
          </div>
        </div>

        <!-- Case Details (Grid) -->
        <div style="margin-bottom: 20px;">
          <div style="font-weight: bold; font-size: 12px; margin-bottom: 8px;">4. Case Details</div>
          <div style="font-weight: bold; font-size: 12px; margin-bottom: 8px; margin-left: 20px;">(a) Case Speciality :</div>
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 5px 20px; margin-left: 40px; font-size: 11px; margin-bottom: 15px;">
            <div>☐ General Surgery</div>
            <div>☐ Paediatric</div>
            <div>☐ Neuro</div>
            <div>☐ Gynaecology</div>
            <div>☐ Cardiothoracic</div>
            <div>☐ Oncology</div>
            <div>☐ Plastic</div>
            <div>☐ Ortho</div>
            <div>☐ Microsurgery</div>
            <div>☐ Urology</div>
            <div>☐ ENT</div>
            <div>☐ Gastroenterology</div>
          </div>
          <div style="display: flex; align-items: center; margin-bottom: 10px; margin-left: 20px;">
            <span style="font-weight: bold; font-size: 12px; width: 160px;">Any Other Pls Specify :</span>
            <div style="flex: 1; border-bottom: 1px solid #000; min-height: 18px;"></div>
          </div>
          <div style="font-weight: bold; font-size: 12px; margin-bottom: 8px; margin-left: 20px;">(b) Case Type :</div>
          <div style="display: flex; gap: 30px; margin-left: 40px; font-size: 11px; margin-bottom: 10px;">
            <div>☐ Laparoscope</div>
            <div>☐ Endoscopy</div>
            <div>☐ Open Surgery</div>
          </div>
        </div>

        <!-- More Sections -->
        <div style="margin-bottom: 15px;">
          <div style="font-weight: bold; font-size: 12px; margin-bottom: 8px;">5. Demo Type :</div>
          <div style="display: flex; gap: 30px; margin-left: 40px; font-size: 11px;">
            <div>☐ Case demo</div>
            <div>☐ Table demo</div>
            <div>☐ Tender demo</div>
          </div>
        </div>

        <div style="margin-bottom: 15px;">
          <div style="font-weight: bold; font-size: 12px; margin-bottom: 8px;">6. Product Performance :</div>
          <div style="display: flex; gap: 20px; margin-left: 40px; font-size: 11px;">
            <div>${iss.demoReport === 'EXCELLENT' ? '☑' : '☐'} Excellent</div>
            <div>${iss.demoReport === 'GOOD' ? '☑' : '☐'} Good</div>
            <div>${iss.demoReport === 'SATISFACTORY' ? '☑' : '☐'} Satisfactory</div>
            <div>${iss.demoReport === 'NOT_SATISFACTORY' ? '☑' : '☐'} Not Satisfactory</div>
          </div>
        </div>

        <div style="margin-bottom: 15px;">
          <div style="font-weight: bold; font-size: 12px; margin-bottom: 5px;">7. Customer Utility Feedback:</div>
          <div style="border: 1px solid #000; min-height: 50px; padding: 5px; font-size: 11px;">
            ${iss.demoRemarks || ''}
          </div>
        </div>

        <div style="margin-bottom: 25px;">
          <div style="font-weight: bold; font-size: 12px; margin-bottom: 5px;">8. Executive Report :</div>
          <div style="border: 1px solid #000; min-height: 60px; padding: 5px; font-size: 11px;">
            ${iss.comments || ''}
          </div>
        </div>

        <!-- Signatures -->
        <div style="display: flex; justify-content: space-between; margin-top: 30px; margin-bottom: 25px;">
          <div style="text-align: center; width: 45%;">
            <div style="border-bottom: 1px solid #000; height: 50px; margin-bottom: 8px;"></div>
            <div style="font-weight: bold; font-size: 11px;">Seal & Signature of the Doctor</div>
          </div>
          <div style="text-align: center; width: 45%;">
            <div style="border-bottom: 1px solid #000; height: 50px; margin-bottom: 8px;"></div>
            <div style="font-weight: bold; font-size: 11px;">Name & Signature of the Executive</div>
          </div>
        </div>

        <!-- Footer Address -->
        <div style="text-align: center; font-size: 10px; margin-bottom: 8px; font-weight: bold;">
          Sri Ragavendra Tower, 3rd Floor, No.34, Co-operative E-colony, Behind Kumudham Nagar,<br/>
          Villankurichi Road, Coimbatore – 641035. Ph: 9443367915, 9443366752. info@jbsmeditec.com
        </div>

        <!-- Footer Dark Banner -->
        <div style="background-color: #2F4F4F; color: white; padding: 6px; text-align: center; font-size: 11px; font-weight: bold;">
          Diathermy ■ Alligature ■ Argo Plasma Coagulator (APC) ■ Saline-TUR
        </div>
      </div>
    `;
    printContents(html, "Demo Report");
  };

  return (
    <div className="p-4 space-y-6 max-h-[75vh] overflow-y-auto">
      {/* Header Info */}
      <div className="flex items-center justify-between">
        <div>
          <div className="text-2xl font-bold text-blue-700">{iss.docId}</div>
          <div className="text-sm text-gray-500 mt-1">{iss.issueTo}</div>
        </div>

        <div className="flex items-center gap-3">
          {/* Print Dropdown in View */}
          <div className="relative">
            <button
              onClick={() => setShowPrintOptions(!showPrintOptions)}
              className="flex items-center gap-2 bg-indigo-50 text-indigo-700 px-4 py-2 rounded-xl font-bold text-sm hover:bg-indigo-100 transition shadow-sm border border-indigo-100"
            >
              <FaPrint size={14} /> Print
            </button>

            {showPrintOptions && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-2xl z-50 py-2 overflow-hidden animate-in fade-in zoom-in duration-200">
                <button
                  onClick={() => { setShowPrintOptions(false); handlePrintWhom(); }}
                  className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 transition flex items-center gap-2"
                >
                  To Whom So Ever
                </button>
                <button
                  onClick={() => { setShowPrintOptions(false); handlePrintEWayBill(); }}
                  className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 transition flex items-center gap-2"
                >
                  EWay Bill
                </button>
                <button
                  onClick={() => { setShowPrintOptions(false); handlePrintDemoReport(); }}
                  className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 transition flex items-center gap-2"
                >
                  Demo Report
                </button>
                <button
                  onClick={() => { setShowPrintOptions(false); handlePrintInvoice(); }}
                  className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 transition flex items-center gap-2 border-t border-gray-100"
                >
                  Invoice Report
                </button>
              </div>
            )}
          </div>
          <StatusBadge status={iss.status} />
        </div>
      </div>

      {/* Grid Fields */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 bg-gray-50 rounded-xl p-4">
        {field("Location", iss.locationId)}
        {field("Issue Date", iss.issueDate ? new Date(iss.issueDate).toLocaleDateString("en-GB") : "")}
        {field("Ref No", iss.refNo)}
        {field("Ref Date", iss.refDate ? new Date(iss.refDate).toLocaleDateString("en-GB") : "")}
        {field("Party Name", iss.customerName)}
        {field("Party Branch", iss.partyBranch)}
        {field("Sales Rep", iss.salesRepresentative)}
        {field("Booking Qty", iss.bookingQty)}
        {field("App Value", iss.appValue != null ? `₹${Number(iss.appValue).toLocaleString("en-IN")}` : "")}
        {field("Delivered By", iss.deliveredBy)}
        {field("Consign From", iss.goodsConsignFrom)}
        {field("Consign To", iss.goodsConsignTo)}
      </div>

      {/* Billing Details */}
      {(iss.generateInvoice === "YES" || iss.billNo) && (
        <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-4 space-y-4">
          <h3 className="text-sm font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            Billing Information
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {field("Bill No", iss.billNo)}
            {field("Bill Date", iss.billDate ? new Date(iss.billDate).toLocaleDateString("en-GB") : "")}
            {field("Billing Amt", iss.billingAmount != null ? `₹${Number(iss.billingAmount).toLocaleString("en-IN")}` : "")}
            {field("HSN Code", iss.hsn || "9018")}
            <div className="col-span-2 md:col-span-2">
              {field("Billing Description", iss.billingDescription)}
            </div>
            <div className="col-span-2 md:col-span-3">
              {field("Amount In Words", iss.amountInWords)}
            </div>
          </div>
        </div>
      )}

      {/* Issue Items */}
      {(iss.issueItems as any[] ?? []).length > 0 && (
        <div>
          <h3 className="text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">Issue Items</h3>
          <div className="overflow-x-auto rounded-xl border border-gray-200">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  {["#", "Item", "Batch No", "Unit", "Qty", "Rate", "Amount"].map((h) => (
                    <th key={h} className="px-3 py-2 text-left text-xs font-bold text-gray-500 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {(iss.issueItems as any[]).map((item: any, i: number) => (
                  <tr key={i} className="hover:bg-blue-50/30">
                    <td className="px-3 py-2 text-gray-500">{i + 1}</td>
                    <td className="px-3 py-2 font-medium">{item.item || item.Item}</td>
                    <td className="px-3 py-2">{item.batchNo || item.BatchNo}</td>
                    <td className="px-3 py-2">{item.unit || item.Unit}</td>
                    <td className="px-3 py-2 font-bold text-blue-700">{item.qty ?? item.Qty}</td>
                    <td className="px-3 py-2">₹{(item.rate ?? item.Rate ?? 0).toLocaleString("en-IN")}</td>
                    <td className="px-3 py-2 font-bold">₹{(item.amount ?? item.Amount ?? 0).toLocaleString("en-IN")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex justify-between items-center pt-4 border-t border-gray-100">
        <div className="text-sm text-gray-600">
          <span className="font-semibold">Gross Total:</span>{" "}
          <span className="text-lg font-bold text-indigo-700">
            ₹{Number(iss.gross || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </span>
        </div>
        <button
          onClick={onClose}
          className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold text-sm transition"
        >
          Close
        </button>
      </div>

      {/* Hidden Print Areas for this View Modal */}
      <div style={{ display: 'none' }}>
        <div id={`whom-print-area-${id}`}>
          <ToWhomSoEverPrint data={mapToWhomData(iss)} />
        </div>
        <div id={`ewaybill-print-area-${id}`}>
          <EWayBill data={mapToEWayData(iss)} />
        </div>
        <div id={`invoice-report-area-${id}`}>
          <InvoiceReportPrint data={data} id={id} />
        </div>
      </div>
    </div>
  );
};

export default IssueManagement;
