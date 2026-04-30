import React, { useState, useEffect } from "react";
import ClaimTaskCard from "../../components/claims/ClaimTaskCard";
import ClaimDetailsModal from "../../components/claims/ClaimDetailsModal";
import api from "../../services/api";
import { FaEye, FaPrint, FaList, FaTh, FaFilter, FaDownload } from "react-icons/fa";

// no router navigation needed here

interface Task {
  id: number;
  createdAt: string;
  updatedAt: string;
  userCreated: number | null;
  userUpdated: number | null;
  taskId: string | null;
  taskName: string;
  parentTaskId: string | null;
  description: string;
  taskType: string;
  status: string;
  priority: string;
  dueDate: string | null;
  stage: string;
  stageItemId: string;
  ownerId: number;
  assigneeId: number;
  ownerName: string | null;
  assigneeName: string | null;
}

interface ClaimTask {
  id: number;
  claimNo: string;
  claimDate: string;
  userName: string;
  claimType: string;
  totalAmount: number;
  status: "pending" | "approved" | "rejected";
  description: string;
  priority: string;
  taskId: number;
}
interface ClaimItem {
  expenseType: string;
  amount: number;
  fromPlace?: string;
  toPlace?: string;
  modeOfTravel?: string;
  actualKm?: number;
  billUrl?: string;
  date?: string;
  details?: string;
}


const ClaimsTasksPage: React.FC = () => {
 
  // tasks list is not stored separately; we derive claims directly
  const [claims, setClaims] = useState<ClaimTask[]>([]);
  const [filteredClaims, setFilteredClaims] = useState<ClaimTask[]>([]);
  const [selectedClaim, setSelectedClaim] = useState<ClaimTask | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'cards' | 'list'>('cards');
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());
  const [showFilters, setShowFilters] = useState(false);

  const [newClaimIds, setNewClaimIds] = useState<Set<number>>(new Set());
  interface Toast { id: number; message: string; type?: 'success' | 'error' | 'info' }
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  };

  const removeToast = (id: number) => setToasts(prev => prev.filter(t => t.id !== id));

  // const navigation = useNavigate();
  const [filters, setFilters] = useState({
    username: '',
    fromDate: '',
    toDate: '',
    status: '',
    priority: ''
  });

  


  const fetchTasks = React.useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get<Task[]>("Task");
      
  const claimTasks = response.data.filter(task => task.stage === "Claim");
      
      const transformedClaims: ClaimTask[] = claimTasks.map(task => ({
        id: task.id,
        claimNo: task.taskName.replace("Review Claim: ", ""),
        claimDate: task.createdAt,
        userName: task.description.split(" | ")[0].replace("Claim submitted by ", ""),
        claimType: "Expense",
        totalAmount: 0,
        status: task.status.toLowerCase() as "pending" | "approved" | "rejected",
        description: task.description,
        priority: task.priority,
        taskId: task.id
      }));

      setClaims(transformedClaims);
      // detect new claims since last visit
      try {
        const lastSeen = localStorage.getItem('claims_last_seen');
        const lastSeenDate = lastSeen ? new Date(lastSeen) : null;
        const newOnes = transformedClaims.filter(c => lastSeenDate ? new Date(c.claimDate) > lastSeenDate : false);
        if (newOnes.length > 0) {
          setNewClaimIds(new Set(newOnes.map(c => c.id)));
          const names = newOnes.map(c => c.claimNo).slice(0, 3).join(', ');
          const more = newOnes.length > 3 ? '...' : '';
          showToast(`${newOnes.length} new claim(s): ${names}${more}`, 'info');
        }
        // update last seen timestamp
        localStorage.setItem('claims_last_seen', new Date().toISOString());
      } catch (err) {
        console.error('Error checking new claims', err);
      }
      
    } catch (err: any) {
      setError(err.message || "Failed to fetch tasks");
    } finally {
      setLoading(false);
    }
  }, []);

  // fetch tasks on mount
  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const applyFilters = React.useCallback(() => {
    let filtered = [...claims];

    if (filters.username) {
      filtered = filtered.filter(claim => 
        claim.userName.toLowerCase().includes(filters.username.toLowerCase())
      );
    }

    if (filters.fromDate) {
      filtered = filtered.filter(claim => 
        new Date(claim.claimDate) >= new Date(filters.fromDate)
      );
    }

    if (filters.toDate) {
      filtered = filtered.filter(claim => 
        new Date(claim.claimDate) <= new Date(filters.toDate)
      );
    }

    if (filters.status) {
      filtered = filtered.filter(claim => claim.status === filters.status);
    }

    if (filters.priority) {
      filtered = filtered.filter(claim => claim.priority === filters.priority);
    }

    setFilteredClaims(filtered);
  }, [claims, filters]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const handleViewClaim = (claim: ClaimTask) => {
    setSelectedClaim(claim);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedClaim(null);
  };

  const handleApprove = async (claimId: number) => {
    try {
      await api.patch(`Task/${claimId}`, { status: "Approved" });
      setClaims(prev => 
        prev.map(claim => 
          claim.id === claimId ? { ...claim, status: "approved" as const } : claim
        )
      );
      handleCloseModal();
    } catch (err) {
      console.error("Failed to approve claim:", err);
    }
  };

  const handleReject = async (claimId: number) => {
    try {
      await api.patch(`Task/${claimId}`, { status: "Rejected" });
      setClaims(prev => 
        prev.map(claim => 
          claim.id === claimId ? { ...claim, status: "rejected" as const } : claim
        )
      );
      handleCloseModal();
    } catch (err) {
      console.error("Failed to reject claim:", err);
    }
  };

  const handleSelectAll = () => {
    if (selectedItems.size === filteredClaims.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(filteredClaims.map(claim => claim.id)));
    }
  };

  const handleDownload = async (claim: ClaimTask) => {
    try {
      const claimId = parseInt(claim.description.split("Claim ID: ")[1]);
      const response = await api.get<any[]>("Claims");
      const claimDetails = response.data.find(c => c.id === claimId);
      
      if (claimDetails?.items) {
        for (const item of claimDetails.items) {
          if (item.billUrl) {
            const fileName = item.billUrl.split('/').pop();
            const token = localStorage.getItem('access_token') || localStorage.getItem('token');
            const downloadUrl = `${api.getBaseUrl()}Storage/download/claims/${fileName}?token=${token}`;
            
            // Force download using window.open
            window.open(downloadUrl, '_blank');
          }
        }
      }
    } catch (err) {
      console.error('Failed to download attachments:', err);
      alert('Failed to download attachments');
    }
  };

  const handleSelectItem = (id: number) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedItems(newSelected);
  };

  const handlePrintColumn = (columnName: string, columnData: string[]) => {
    const printContent = `
      <html>
        <head>
          <title>${columnName} Report</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            h1 { color: #333; }
          </style>
        </head>
        <body>
          <h1>${columnName} Report</h1>
          <p>Generated on: ${new Date().toLocaleDateString()}</p>
          <table>
            <thead>
              <tr><th>${columnName}</th></tr>
            </thead>
            <tbody>
              ${columnData.map(data => `<tr><td>${data}</td></tr>`).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `;
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const handlePrint = async () => {
    const selectedClaims = filteredClaims.filter(claim => selectedItems.has(claim.id));
    
    try {
      const response = await api.get<any[]>("Claims");
      const allClaimsData = response.data;
      
      const claimsWithDetails = selectedClaims.map(claim => {
        const claimId = parseInt(claim.description.split("Claim ID: ")[1]);
        const claimDetails = allClaimsData.find(c => c.id === claimId);
        return {
          ...claim,
          details: claimDetails,
          totalAmount: claimDetails?.items?.reduce((total: number, item: any) => total + item.amount, 0) || 0
        };
      });

      const printContent = `
        <html>
          <head>
            <title>Claims Report</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; font-size: 12px; }
              table { width: 100%; border-collapse: collapse; margin: 20px 0; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background-color: #f2f2f2; font-weight: bold; }
              .total-row { font-weight: bold; background-color: #f5f5f5; }
            </style>
          </head>
          <body>
            <h1>Claims Summary Report</h1>
            <p>Generated on: ${new Date().toLocaleDateString()}</p>
            <table>
              <thead>
                <tr>
                  <th>Claim No</th>
                  <th>Employee</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Priority</th>
                  <th>Total Amount</th>
                </tr>
              </thead>
              <tbody>
                ${claimsWithDetails.map(claim => `
                  <tr>
                    <td>${claim.claimNo}</td>
                    <td>${claim.userName}</td>
                    <td>${new Date(claim.claimDate).toLocaleDateString()}</td>
                    <td>${claim.status}</td>
                    <td>${claim.priority}</td>
                    <td>₹${claim.totalAmount.toFixed(2)}</td>
                  </tr>
                `).join('')}
                <tr class="total-row">
                  <td colspan="5">Grand Total</td>
                  <td>₹${claimsWithDetails.reduce((sum, claim) => sum + claim.totalAmount, 0).toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
          </body>
        </html>
      `;
      
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(printContent);
        printWindow.document.close();
        printWindow.print();
      }
    } catch (err) {
      console.error('Failed to fetch claims data for printing:', err);
    }
  };

  const handlePrintClaim = async (claimId: number, taskClaim: ClaimTask) => {
    try {
    const response = await api.get<any>(`Claims/${claimId}`);
    const claimDetails = response.data; 
      if (!claimDetails) {
        console.error('Claim not found');
        return;
      } 
     const formatDate = (value: any) =>
  value ? new Date(value).toLocaleDateString("en-IN") : "";

         const claimDate = new Date(claimDetails.claimDate);
          const toDate = new Date(claimDate);
          toDate.setDate(toDate.getDate() + 5);
       
const getDisplayValue = (value: any): string => {
  if (value == null) return "";

  if (typeof value === "object") {
    return (
      value.name ??
      value.label ??
      value.value ??
      value.url ??
      ""
    );
  }

  return String(value);
};

const normalizeExpenseType = (type: string) =>
  type
    .toLowerCase()
    .replace(/expenses?/g, "")
    .replace(/\s+/g, " ")
    .trim();


const EXPENSE_LABEL_MAP: Record<string, string> = {
  "printing and stationery": "Printing and Stationery",
  "printing stationery": "Printing and Stationery",
  "printing and stationary": "Printing and Stationery",
  "daily allowance": "Daily Allowance",
  "daily allowances": "Daily Allowance",
  "summer allowance": "Summer Allowance",
  "summer": "Summer Allowance",
  "booking": "Booking",
  "booking expenses": "Booking",
  "tollgate": "Tollgate",
  "tollgate expenses": "Tollgate",
  "travelling": "Travelling",
  "lodging": "Lodging",
};

const expenseSummary: Record<string, number> = {};

(claimDetails.items as ClaimItem[]).forEach(item => {
  const normalized = normalizeExpenseType(item.expenseType || '');
  const label = EXPENSE_LABEL_MAP[normalized] ?? (item.expenseType ? item.expenseType.replace(/\b\w/g, c => c.toUpperCase()) : 'Others');
  expenseSummary[label] = (expenseSummary[label] || 0) + (item.amount || 0);
});



       const expenseRows = Object.entries(expenseSummary)
       .map(
          ([type, amount], index) => `
      <tr>
        <td class="center">${index + 1}</td>
        <td>${type.replace(/\b\w/g, c => c.toUpperCase())}</td>

        <td class="right">${amount.toFixed(2)}</td>
      </tr>
      `).join("");
    const totalAmount = Object.values(expenseSummary)
  .reduce((sum, amt) => sum + amt, 0);
const columnFieldMap: Record<string, keyof ClaimItem> = {
  expenseType: "expenseType",
  Date: "date",
  FromPlace: "fromPlace",
  ToPlace: "toPlace",
  ModeOfTravel: "modeOfTravel",
  ActualKm: "actualKm",
  billUrl: "billUrl",
   Details: "details", 
  Amount: "amount"
};
const EXPENSE_CATEGORY_MAP: Record<string, string> = {
  // Travel
  "travel": "travel",
  "car": "travel",
  "auto": "travel",
  "bus": "travel",
  "train": "travel",
  "travelling": "travel",
  "travelling expenses": "travel",

  // Conveyance
  "local conveyance": "conveyance",
  "conveyance": "conveyance",

  // Boarding
  "boarding": "boarding",
  "lodging": "boarding",
  "hotel": "boarding",

  // Sundries
  "printing and stationery": "sundries",
  "printing stationery": "sundries",
  "printing and stationary": "sundries",
  "tollgate": "sundries",
  "tollgate expenses": "sundries",
  "summer allowance": "sundries",
  "summer": "sundries",
  "daily allowance": "sundries",
  "daily allowances": "sundries",
  "booking": "sundries",
  "booking expenses": "sundries",
  "others": "sundries"
};

const expensesByType: Record<string, ClaimItem[]> = {};

(claimDetails.items as ClaimItem[]).forEach(item => {
  const normalized = normalizeExpenseType(item.expenseType || '');
  const category = EXPENSE_CATEGORY_MAP[normalized] ?? 'sundries';

  if (!expensesByType[category]) {
    expensesByType[category] = [];
  }

  expensesByType[category].push(item);
});


const renderExpensesTable = (
  title: string,
  category: string,
  columns: string[]
) => {
  const items = expensesByType[category];
  if (!items || items.length === 0) return "";
let categoryTotal =0;
  const rows = items.map((item, index) =>{
    categoryTotal += Number(item.amount || 0);
    return `
    <tr>
      <td>${index + 1}</td>
      ${columns.map(col => {
        const field = columnFieldMap[col];
      
const raw =
  field && item[field] !== undefined && item[field] !== null && item[field] !== ""
    ? item[field]
    : "-";

let display = "-";

if (col === "Amount") {
  display = raw === "-" ? "0.00" : Number(raw).toFixed(2);
} else if (col === "ActualKm") {
  display = raw === "-" ? "-" : `${raw}`;
} else if (col === "Date") {
  display = raw === "-" ? "-" : formatDate(raw as string);
} else if (col === "expenseType") {
  const normalized = normalizeExpenseType(String(raw));
  display = EXPENSE_LABEL_MAP[normalized] ?? getDisplayValue(raw);
} else {
  display = getDisplayValue(raw);
}

        return `<td>${display}</td>`;
      }).join("")}
    </tr>
  `;
}).join("");

  return `
    <h3>${title}</h3>
    <table class="expense-table">
      <thead>
        <tr>
          <th>SL No</th>
          ${columns.map(c => `<th>${c}</th>`).join("")}
        </tr>
      </thead>
      <tbody>
        ${rows}
        <tr class="total-row">
           <td colspan ="${columns.length}"><strong>Total</strong></td>  
           <td class="right"><strong>${categoryTotal.toFixed(2)}</strong></td>  
        </tr>
      </tbody>
    </table>
  `;
};






const travelTable = renderExpensesTable(
  "Travel Expenses",
  "travel",
  ["Date", "expenseType","FromPlace", "ToPlace", "ModeOfTravel", "ActualKm", "Amount"]
);

const conveyanceTable = renderExpensesTable(
  "Local Conveyance",
  "conveyance",
  ["Date",  "expenseType","FromPlace", "ToPlace", "Details", "Amount"]
);

const boardingTable = renderExpensesTable(
  "Boarding Charges",
  "boarding",
  ["Date",  "expenseType","Details", "Amount"]
);

const sundriesTable = renderExpensesTable(
  "Sundries",
  "sundries",
  ["expenseType","Date", "FromPlace", "ToPlace", "Details", "Amount"]
);


const expenseTables = [
  travelTable,
  conveyanceTable,
  boardingTable,
  sundriesTable
].filter(Boolean).join("");




const expensesHtml = expenseTables
  ? `
    <div class="page-break"></div>
    <div class="pagetable">
      ${expenseTables}
    </div>
  `
  : "";


      
      const printContent = `
       <!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Expense Claim Statement</title>

  <style>
    body {
      font-family: "Times New Roman", serif;
      font-size: 13px;
      margin: 0;
      padding: 25px;
    }

    /* Outer Border */
    .page {
      border: 2px solid #000;
      padding: 15px;
    }
   .page-break {
  page-break-before: always;
  break-before: page;
}
  .pagetable {
  page-break-inside: avoid;
}


    /* Header */
    .header {
      text-align: center;
      margin-bottom: 10px;
    }

    .company-name {
      font-size: 20px;
      font-weight: bold;
    }

    .company-address {
      font-size: 13px;
      line-height: 1.4;
      margin-top: 5px;
    }


    .info-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 15px;
      margin-bottom: 10px;
    }

    .info-table td {
      padding: 4px 6px;
      vertical-align: top;
    }

    .label {
      width: 140px;
    }

    .colon {
      width: 10px;
    }

    .value {
      font-weight: bold;
    }

    .right-label {
      width: 110px;
    }

    .expense-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 10px;
    }

    .expense-table th,
    .expense-table td {
      border: 1px solid #000;
      padding: 6px;
    }

    .expense-table th {
      font-weight: bold;
      text-align: center;
    }

    .center {
      text-align: center;
    }

    .right {
      text-align: right;
    }

    .total-row td {
      font-weight: bold;
    }

    /* Declaration */
    .declaration {
      margin-top: 60px;
      font-size: 13px;
      line-height: 1.5;
    }

    /* Signature Section */
    .signature-table {
      width: 100%;
      margin-top: 50px;
    }

    .signature-line {
      border-bottom: 1px solid #000;
      width: 200px;
      display: inline-block;
    }
  </style>
</head>

<body>
 <div class="header">
    <div class="company-name">JBS Meditec India Private Limited</div>
    <div class="company-address">
      No-34, 3rd Floor,<br>
      Co-Operative E-Colony,<br>
      Vilankurichi, Coimbatore - 641035.<br>
      Tamil Nadu. &nbsp; State Code : 33<br>
      Phone - 0422 2245268, 2248368.
    </div>
  </div>
<div class="page">
  <table class="info-table">
    <tr>
      <td class="label">Executive Name</td><td class="colon">:</td>
      <td class="value">${claimDetails.userName}</td>


      <td class="right-label">From (Date)</td><td class="colon">:</td>
     <td class="value">${formatDate(claimDetails.claimDate)}</td>
    </tr>
    <tr>
      <td class="label">Designation</td><td class="colon">:</td>
      <td class="value">Sales Executive</td>

      <td class="right-label">To (Date)</td><td class="colon">:</td>
    
      <td class="value">${formatDate(toDate)}</td>


    </tr>
    <tr>
      <td class="label">Department</td><td class="colon">:</td>
      <td class="value">SALES AND MARKETING</td>
      <td colspan="3"></td>
    </tr>
  </table>

  <!-- Expense Table -->
  <table class="expense-table">
    <thead>
              <tr>
                <th style="width:80px;">SL No</th>
                <th>Details Of Expenditure</th>
                <th style="width:150px;">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${expenseRows}
              <tr class="total-row">
                <td></td>
                <td class="center">Total Expenditure</td>
                <td class="right">${totalAmount.toFixed(2)}</td>
              </tr>
            </tbody>
  </table>

  <!-- Declaration -->
  <div class="declaration">
    I do hereby certify that the above statement of expenditure is correct and the said
    expenditure has been incurred by me for the purpose of the business of the company.
  </div>

  <!-- Signatures -->
  <table class="signature-table">
    <tr>
      <td>
        Date : <span class="signature-line"></span>
      </td>
      <td style="text-align:right;">
        Signature : <span class="signature-line"></span>
      </td>
    </tr>
    <tr>
      <td colspan="2" style="padding-top:60px;">
        Signature of Department Head
      </td>
    </tr>
  </table>

</div>
${expensesHtml}


</body>
</html>

      `;
      
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(printContent);
        printWindow.document.close();
        printWindow.print();
      }
    } catch (err) {
      console.error('Failed to fetch claim details for printing:', err);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-yellow-100 text-yellow-800";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Error: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Toast Container */}
      <div className="fixed top-4 right-4 z-[9999] space-y-2">
        {toasts.map((toast) => (
          <div key={toast.id} className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg transform transition-all duration-300 ease-in-out ${toast.type === 'success' ? 'bg-green-500 text-white' : toast.type === 'error' ? 'bg-red-500 text-white' : 'bg-blue-500 text-white'}`}>
            <div className="flex-1 font-medium">{toast.message}</div>
            <button onClick={() => removeToast(toast.id)} className="text-white hover:text-gray-200">×</button>
          </div>
        ))}
      </div>
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">Claims Tasks</h1>
              {newClaimIds.size > 0 && (
                <div className="bg-red-600 text-white text-sm font-semibold px-2 py-1 rounded-full">
                  {newClaimIds.size} New
                </div>
              )}
            </div>
            <p className="text-gray-600">Review and approve pending claims ({filteredClaims.length} tasks)</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              <FaFilter className="mr-2" />
              Filters
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`p-2 rounded-lg ${viewMode === 'cards' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
            >
              <FaTh />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
            >
              <FaList />
            </button>
          </div>
        </div>

        {showFilters && (
          <div className="bg-gray-50 p-4 rounded-lg mb-4">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <input
                type="text"
                placeholder="Username"
                value={filters.username}
                onChange={(e) => setFilters({...filters, username: e.target.value})}
                className="border rounded-lg px-3 py-2"
              />
              <input
                type="date"
                value={filters.fromDate}
                onChange={(e) => setFilters({...filters, fromDate: e.target.value})}
                className="border rounded-lg px-3 py-2"
              />
              <input
                type="date"
                value={filters.toDate}
                onChange={(e) => setFilters({...filters, toDate: e.target.value})}
                className="border rounded-lg px-3 py-2"
              />
              <select
                value={filters.status}
                onChange={(e) => setFilters({...filters, status: e.target.value})}
                className="border rounded-lg px-3 py-2"
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
              <select
                value={filters.priority}
                onChange={(e) => setFilters({...filters, priority: e.target.value})}
                className="border rounded-lg px-3 py-2"
              >
                <option value="">All Priority</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
          </div>
        )}

        {viewMode === 'list' && (
          <div className="flex gap-2 mb-4">
            <button
              onClick={handleSelectAll}
              className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"
            >
              {selectedItems.size === filteredClaims.length ? 'Deselect All' : 'Select All'}
            </button>
            <button
              onClick={handlePrint}
              disabled={selectedItems.size === 0}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300"
            >
              <FaPrint className="mr-2" />
              Print Selected ({selectedItems.size})
            </button>
          </div>
        )}
      </div>

      {viewMode === 'cards' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClaims.map((claim) => (
            <ClaimTaskCard
              key={claim.id}
              claim={claim}
              onView={() => handleViewClaim(claim)}
              onDownload={() => handleDownload(claim)}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedItems.size === filteredClaims.length && filteredClaims.length > 0}
                    onChange={handleSelectAll}
                    className="rounded"
                  />
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">
                  <div className="flex items-center justify-between">
                    Claim No
                    <button
                      onClick={() => handlePrintColumn('Claim No', filteredClaims.map(c => c.claimNo))}
                      className="ml-2 text-gray-400 hover:text-gray-600"
                      title="Print Claim Numbers"
                    >
                      <FaPrint className="text-xs" />
                    </button>
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Employee</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Date</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Status</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Priority</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredClaims.map((claim) => (
                <tr key={claim.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedItems.has(claim.id)}
                      onChange={() => handleSelectItem(claim.id)}
                      className="rounded"
                    />
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{claim.claimNo}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{claim.userName}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{formatDate(claim.claimDate)}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(claim.status)}`}>
                      {claim.status.charAt(0).toUpperCase() + claim.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      claim.priority === "High" ? "bg-red-100 text-red-800" :
                      claim.priority === "Medium" ? "bg-yellow-100 text-yellow-800" :
                      "bg-green-100 text-green-800"
                    }`}>
                      {claim.priority}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleViewClaim(claim)}
                        className="text-blue-600 hover:text-blue-800"
                        title="View Details"
                      >
                        <FaEye />
                      </button>
                      <button
                        onClick={() => handleDownload(claim)}
                        className="text-purple-600 hover:text-purple-800"
                        title="Download Attachments"
                      >
                        <FaDownload />
                      </button>
                      <button
                        onClick={() => {
                          const claimId = parseInt(claim.description.split("Claim ID: ")[1]);
                          handlePrintClaim(claimId, claim);
                        }}
                        className="text-green-600 hover:text-green-800"
                        title="Print Claim"
                      >
                        <FaPrint />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {filteredClaims.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No claims found matching your filters</p>
        </div>
      )}

      <ClaimDetailsModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        claimId={selectedClaim?.taskId ? parseInt(selectedClaim.description.split("Claim ID: ")[1]) : null}
        onApprove={handleApprove}
        onReject={handleReject}
      />
    </div>
  );
};

export default ClaimsTasksPage;