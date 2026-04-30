import React from 'react';
import { useEffect, useState } from 'react';
import api from '../../services/api';
// filter panel UI is handled locally; no navigation needed here
import claimCard from '../configs/claim/claimCard.json';
import claimVoucherCardsService,{ClaimVoucherCards} from '../../services/ClaimVoucherCardsService';
import Cards from '../../components/common/Cards';
import ClaimVoucher from './ClaimVoucher';
import Modal from '../../components/common/Modal';
import CommonTable from '../../components/CommonTable';
import { FiPrinter } from 'react-icons/fi';
const claimCardConfig = claimCard as ClaimCardConfig[];

type ClaimCardField = keyof ClaimVoucherCards;

interface ClaimCardConfig {
  title: string;
  field: ClaimCardField;
  description: string;
  icon: string;
  displayFormat: "number" | "currency";
}
const formatDate = (dateStr?: string) =>
  dateStr ? new Date(dateStr).toLocaleDateString('en-IN') : '-';

const formatCurrency = (val?: number | string) =>
  val ? `₹${Number(val).toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '₹0.00';

 const handlePrint = () => {
    window.print();
  };
const ClaimVoucherList: React.FC = () => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cardData, setCardData] = useState<ClaimVoucherCards | null>(null);
const [cardLoading, setCardLoading] = useState(false);
const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
const [showNewVoucher, setShowNewVoucher] = useState(false);
const [filteredItems, setFilteredItems] = useState<any[]>([]);
const [currentPage, setCurrentPage] = useState(1);
const [pageSize, setPageSize] = useState(10); // records per page
  const [showExportMenu, setShowExportMenu] = useState(false);
const [showFilter, setShowFilter] = useState(false);

    const handleExport = (format: string) => {
    console.log("Exporting in format:", format);
    setShowExportMenu(false);
  };
// items are filtered first, then sorted in sortedFilteredItems
const startIndex = (currentPage - 1) * pageSize;
const endIndex = startIndex + pageSize;


  const fetchVouchers  = async () => {
      try {
        setLoading(true);
        const resp = await api.get('ClaimVouchers');
        const data = resp.data?.data ?? resp.data;
        if (Array.isArray(data)) {
          setItems(data);
          setFilteredItems(data);
        }
        else setItems([]);
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error('Failed to fetch claim vouchers', e);
        setError('Failed to load claim vouchers.');
      } finally {
        setLoading(false);
      }
    };
  // navigation not needed here
// formatted items will be derived from paginated items after filtering/sorting




useEffect(() => {
  setCurrentPage(1);
}, [sortOrder]);


  useEffect(() => {
  const fetchCardData = async () => {
    try {
      setCardLoading(true);
      const res = await claimVoucherCardsService.getClaimVoucherCards();
      if (res.success && res.data) {
        setCardData(res.data);
      }
    } catch (err) {
      console.error("Failed to fetch claim voucher cards", err);
    } finally {
      setCardLoading(false);
    }
  };

  fetchCardData();
}, []);

  useEffect(() => {
    fetchVouchers();
  }, []);

const [filters, setFilters] = useState({
  docId: "",
  status: "",
  fromDate: "",
  toDate: "",
});

const applyFilters = (updatedFilters: typeof filters) => {
  let result = [...items];

  if (updatedFilters.docId) {
    result = result.filter(item =>
      String(item.docId)
        .toLowerCase()
        .includes(updatedFilters.docId.toLowerCase())
    );
  }

  if (updatedFilters.status) {
    result = result.filter(item =>
      item.status?.toLowerCase().includes(updatedFilters.status.toLowerCase())
    );
  }

  if (updatedFilters.fromDate) {
    result = result.filter(item =>
      new Date(item.fromDate) >= new Date(updatedFilters.fromDate)
    );
  }

  if (updatedFilters.toDate) {
    result = result.filter(item =>
      new Date(item.toDate) <= new Date(updatedFilters.toDate)
    );
  }

  setFilteredItems(result);
  setCurrentPage(1);
};
const sortedFilteredItems = [...filteredItems].sort((a, b) => {
  const dateA = new Date(a.date).getTime();
  const dateB = new Date(b.date).getTime();
  return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
});

// paginate after sorting/filtering
const paginatedItems = sortedFilteredItems.slice(startIndex, endIndex);

const formattedItems = paginatedItems.map((item) => ({
  ...item,
  date: item.date ? formatDate(item.date) : "-",
  fromDate: item.fromDate ? formatDate(item.fromDate) : "-",
  toDate: item.toDate ? formatDate(item.toDate) : "-",
  totalAmount: item.totalAmount ? formatCurrency(item.totalAmount) : "₹0.00",
}));




  return (
     <div className="p-4">
      <h1 className="text-2xl font-semibold ">Claim Vouchers</h1>
    <div className="min-h-[60vh] bg-gray-50 py-6 px-4">
  <div className="flex items-center justify-between mb-4">
   <div aria-hidden />
          <div className="flex gap-2">
            <select
             value={sortOrder}
  onChange={(e) => setSortOrder(e.target.value as "asc" | "desc")}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#FF6B35]"
                  >
           <option value="desc">Sort by:Latest First </option>
          <option value="asc">Sort by:Oldest First </option></select>
          <button
                            onClick={handlePrint}
                            className="p-2 border border-gray-300 rounded-md hover:bg-gray-100 transition"
                            title="Print"
                          >
                            <FiPrinter size={18} />
                          </button>
                                     {/* Export */}
                          <div className="relative">
                            <button
                              onClick={() => setShowExportMenu(!showExportMenu)}
                              className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-100 flex items-center gap-2 transition"
                            >
                              Export as
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 9l-7 7-7-7"
                                />
                              </svg>
                            </button>
                            {showExportMenu && (
                              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-50 py-1 border border-gray-200">
                                {["PDF", "Excel", "CSV"].map((format) => (
                                  <button
                                    key={format}
                                    onClick={() => handleExport(format)}
                                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                  >
                                    {format}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
            <button   onClick={() => setShowNewVoucher(true)}  className="bg-orange-500 text-white px-4 py-2 rounded shadow hover:bg-orange-600 text-sm font-semibold">+ New Voucher</button>
          </div>
        </div>
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
  {claimCardConfig.map((card, index) => {
    const rawValue = cardData?.[card.field] ?? 0;

    const value =
      card.displayFormat === "currency"
        ? `₹${Number(rawValue).toLocaleString("en-IN")}`
        : Number(rawValue).toLocaleString("en-IN");

    return (
      <Cards
        key={card.title}
        title={card.title}
        value={cardLoading ? "—" : value}
        description={card.description}
        icon={card.icon}
        color={index}
      />
    );
  })}
</div>

      <div className=" mx-auto bg-white rounded-lg shadow p-6">
        {/* Filter panel */}
        {showFilter && (
          <div className="mb-4 p-4 border border-gray-200 rounded bg-white shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div>
                <label className="text-sm font-medium text-gray-600">Doc ID</label>
                <input
                  type="text"
                  value={filters.docId}
                  onChange={(e) => setFilters((prev) => ({ ...prev, docId: e.target.value }))}
                  className="w-full mt-1 border border-gray-300 rounded px-2 py-1 text-sm"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Status</label>
                <input
                  type="text"
                  value={filters.status}
                  onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value }))}
                  className="w-full mt-1 border border-gray-300 rounded px-2 py-1 text-sm"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">From Date</label>
                <input
                  type="date"
                  value={filters.fromDate}
                  onChange={(e) => setFilters((prev) => ({ ...prev, fromDate: e.target.value }))}
                  className="w-full mt-1 border border-gray-300 rounded px-2 py-1 text-sm"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">To Date</label>
                <input
                  type="date"
                  value={filters.toDate}
                  onChange={(e) => setFilters((prev) => ({ ...prev, toDate: e.target.value }))}
                  className="w-full mt-1 border border-gray-300 rounded px-2 py-1 text-sm"
                />
              </div>
            </div>
            <div className="mt-3 flex gap-2 justify-end">
              <button
                onClick={() => {
                  setFilters({ docId: "", status: "", fromDate: "", toDate: "" });
                  applyFilters({ docId: "", status: "", fromDate: "", toDate: "" });
                }}
                className="px-3 py-1 border rounded bg-white hover:bg-gray-50 text-sm"
              >
                Reset
              </button>
              <button
                onClick={() => applyFilters(filters)}
                className="px-3 py-1 bg-[#FF6B35] text-white rounded text-sm"
              >
                Apply
              </button>
              <button
                onClick={() => setShowFilter(false)}
                className="px-3 py-1 border rounded bg-white hover:bg-gray-50 text-sm"
              >
                Close
              </button>
            </div>
          </div>
        )}
       

        {loading ? (
          <div>Loading...</div>
        ) : error ? (
          <div className="text-red-500">{error}</div>
        ) : (
          <div className="overflow-x-auto ">
            {/* <table className="min-w-full border rounded-lg overflow-hidden">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-3 text-center text-lg font-bold text-gray-700">Doc Id</th>
                  <th className="px-4 py-3 text-center text-lg font-bold text-gray-700">Date</th>
                  <th className="px-4 py-3 text-center text-lg font-bold text-gray-700">From</th>
                  <th className="px-4 py-3 text-center text-lg font-bold text-gray-700">To</th>
                  <th className="px-4 py-3 text-center text-lg font-bold text-gray-700">Status</th>
                  <th className="px-4 py-3 text-center text-lg font-bold text-gray-700">Total</th>
                  <th className="px-4 py-3 text-center text-lg font-bold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedItems.map((it) => (
                  <tr key={it.id || it.docId || Math.random()} className="hover:bg-gray-50">
                    <td className="text-center py-3">{it.docId ?? '-'}</td>
                    <td className="text-center py-3">{it.date ? new Date(it.date).toLocaleDateString() : '-'}</td>
                    <td className="text-center py-3">{it.fromDate ? new Date(it.fromDate).toLocaleDateString() : '-'}</td>
                    <td className="text-center py-3">{it.toDate ? new Date(it.toDate).toLocaleDateString() : '-'}</td>
                    <td className="text-center py-3">{it.status ?? '-'}</td>
                    <td className="text-left py-3">{it.totalAmount ? `₹${Number(it.totalAmount).toFixed(2)}` : '-'}</td>
                    <td className="text-center py-3">
                      <div className="flex gap-2">
                        <button onClick={() => alert('View not implemented yet')} className="px-2 py-1 bg-blue-600 text-white rounded">View</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table> */}
       <CommonTable
 columns={[
  { key: "docId", title: "Doc ID", dataIndex: "docId" },
  { key: "status", title: "Status", dataIndex: "status" },
  { key: "date", title: "Date", dataIndex: "date" },
  { key: "fromDate", title: "From", dataIndex: "fromDate" },
  { key: "toDate", title: "To", dataIndex: "toDate" },
  { key: "totalAmount", title: "Total", dataIndex: "totalAmount" },
]}

  data={formattedItems}
  total={filteredItems.length}
  currentPage={currentPage}
  pagination
  onPageChange={(page, newPageSize) => {
    setCurrentPage(page);
    if (typeof newPageSize === 'number' && newPageSize !== pageSize) {
      setPageSize(newPageSize);
    }
  }}
  rowKey="docId"
  showFilter={showFilter}
  onToggleFilter={() => setShowFilter(prev => !prev)}
/>


     <Modal isOpen={showNewVoucher} onClose={() => setShowNewVoucher(false)} title="New Claim Voucher" type="max">
  <ClaimVoucher  
   onSaveSuccess={() => {
      setShowNewVoucher(false);
      fetchVouchers(); 
    }}
  />
</Modal>


            {items.length === 0 && <div className="p-4 text-gray-500">No claim vouchers found.</div>}
          </div>
        )}
      </div>
    </div>
    </div>
  );
};

export default ClaimVoucherList;
