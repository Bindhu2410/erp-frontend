import React, { useState, useEffect, useMemo } from "react";
import { getUserRoles } from '../../services/user.service';
import { FiX, FiPlus, FiTrash2, FiSearch } from "react-icons/fi";
import { toast } from "react-toastify";
import { DeliveryChallanRequest } from "../../types/deliveryChallan";
import deliveryChallanService from "../../services/deliveryChallanService";
import salesLeadService, { LeadsDropdownResult } from "../../services/salesLeadService";
import { getInventoryGroups, InventoryGroup } from "../../services/inventoryGroupService";
import { getSalesOrders, SalesOrderDropdown } from "../../services/salesOrderService";

// Removed hardcoded LOCATIONS; now loaded dynamically
// Removed SO_NOS; will fetch dynamically
// Removed hardcoded SALESMEN; will fetch dynamically
const DISPATCHED_BY = ["Travels", "Courier", "Direct", "DHL","Travel"];
const DELIVERY_AT = ["Customer Site", "Warehouse", "Branch Office", "Direct"];
const DOC_THROUGH = ["Direct", "DHL", "Professional"];
const MAKES = ["JBS", "Olympus", "Karl Storz", "Stryker", "Medtronic"];
const CATEGORIES = ["Laparoscopy", "Endoscopy", "Ortho", "Cardiology", "General Surgery"];
const PRODUCTS = ["HD Camera", "Light Source", "Trocar", "Grasper", "Scissors"];
const MODELS = ["C-101-R", "C-202", "LS-300", "TR-10", "GR-05"];
const ITEM_IDS = ["ITM-001", "ITM-002", "ITM-003", "ITM-004", "ITM-005"];
const EQUL_INS = ["Equipment", "Instrument", "Consumable", "Accessory"];
const UNITS = ["Nos", "Set", "Box", "Pair", "Kit"];

interface ItemRow {
  id: number;
  soNo: string;
  make: string;
  category: string;
  product: string;
  model: string;
  itemId: string;
  equlIns: string;
  matchNo: string;
  ordQty: number;
  currentStock: number;
  unit: string;
  qty: number;
  rate: number;
  amount: number;
}

interface Props {
  editId?: number;
  onClose: () => void;
  onSuccess?: () => void;
}

const inputCls = "mt-1 w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all";
const selectCls = "mt-1 w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all";
const cellSelectCls = "w-full px-2 py-1 border border-gray-300 rounded text-xs bg-white focus:outline-none focus:ring-1 focus:ring-blue-400";
const cellInputCls = "w-full px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-400";

const LeadNameDropdown = ({ leads, value, onChange }: { leads: LeadsDropdownResult[], value: string, onChange: (v: string) => void }) => (
  <select className={selectCls} value={value} onChange={e => onChange(e.target.value)}>
    <option value="">Select Party</option>
    {leads.map(lead => (
      <option key={lead.id} value={lead.id}>{lead.customerName} ({lead.leadId})</option>
    ))}
  </select>
);

const CreateDeliveryChallanModal: React.FC<Props> = ({ editId, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"item" | "footer">("item");
  const [leads, setLeads] = useState<LeadsDropdownResult[]>([]);
  const [salesmen, setSalesmen] = useState<{ userId: number, username: string }[]>([]);

  const [salesOrders, setSalesOrders] = useState<SalesOrderDropdown[]>([]);
  const [locations, setLocations] = useState<InventoryGroup[]>([]);
  // Fetch sales orders for dropdown
  const fetchSalesOrders = async () => {
    try {
      const data = await getSalesOrders();
      setSalesOrders(data);
    } catch {
      setSalesOrders([]);
    }
  };

  // Fetch inventory groups for Location dropdown
  const fetchLocations = async () => {
    try {
      const data = await getInventoryGroups();
      setLocations(data);
    } catch (err) {
      setLocations([]);
    }
  };

  useEffect(() => {
    document.body.style.overflow = "hidden";
    const fetchLeads = async () => {
      try {
        const response = await salesLeadService.getDropdown({ pageNumber: 1, pageSize: 100 });
        setLeads(response.results);
      } catch (error) {
        console.error("Failed to fetch leads:", error);
      }
    };

    const fetchChallan = async () => {
      if (!editId) return;
      setLoading(true);
      try {
        const data = await deliveryChallanService.getById(editId);
        setHeader({
          location: data.location || "STORE",
          docDate: data.deliveryDate ? new Date(data.deliveryDate).toISOString().split("T")[0] : "",
          docId: data.deliveryChallanId || "",
          party: data.partyId?.toString() || "",
          soNo: data.salesOrderId?.toString() || "",
          salesman: data.salesmanId?.toString() || "",
          dispatchedBy: data.dispatchedBy || "",
          deliveredBy: data.deliveredBy || "",
          goodsConsignFrom: data.goodsConsignFrom || "JSB MEDIITEC INDIA PVT LTD",
          goodsConsignTo: data.goodsConsignTo || "",
          bookingAddress: data.bookingAddress || "",
          bookingQty: data.bookingQty?.toString() || "",
          appValue: data.appValue?.toString() || "",
          deliveryAt: data.deliveryAt || "Customer Site",
          deliveryAdd1: data.deliveryAdd1 || "",
          deliveryAdd2: data.deliveryAdd2 || "",
          documentThrough: data.documentThrough || "Hand Delivery",
          invoiceNo: data.invoiceNo || "",
          invoiceDate: data.invoiceDate ? new Date(data.invoiceDate).toISOString().split("T")[0] : "",
        });

        if (data.itemDetails && data.itemDetails.length > 0) {
          setItems(data.itemDetails.map((item, idx) => ({
            id: idx + 1,
            soNo: item.soNo || "",
            make: item.make || "",
            category: item.category || "",
            product: item.product || "",
            model: item.model || "",
            itemId: item.visualItemId || "",
            equlIns: item.equlIns || "",
            matchNo: item.matchNo || "",
            ordQty: item.ordQty || 0,
            currentStock: item.currentStock || 0,
            unit: item.unit || "",
            qty: item.qty || 0,
            rate: item.unitPrice || 0,
            amount: item.amount || 0,
          })));
        }

        setFooter({
          gross: data.grossAmount || 0,
          net: data.netAmount || 0,
          totalQty: data.totalQty || 0,
          amountInWords: data.amountInWords || "",
          deliveryTo: data.deliveryTo || "",
          remarks: data.remarks || "",
          preparedBy: data.preparedBy || "",
          authorizedBy: data.authorizedBy || "",
          receivedBy: data.receivedBy || "",
          printAfterSave: true,
          sendEmail: false,
        });

      } catch (error) {
        toast.error("Failed to fetch delivery challan details");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeads();
    fetchChallan();
    fetchSalesOrders();
    // Fetch salesmen (users with role 'Sales Representative')
    (async () => {
      try {
        const res = await getUserRoles();
        if (res && Array.isArray(res.data)) {
          setSalesmen(res.data.filter((u: any) => u.roleName === "Sales Representative").map((u: any) => ({ userId: u.userId, username: u.username })));
        }
      } catch (err) {
        setSalesmen([]);
      }
    })();

    fetchLocations();

    return () => { document.body.style.overflow = ""; };
  }, [editId]);

  const [header, setHeader] = useState({
    location: "STORE", docDate: new Date().toISOString().split("T")[0], docId: "",
    party: "", soNo: "",
    salesman: "", dispatchedBy: "", deliveredBy: "", goodsConsignFrom: "JSB MEDIITEC INDIA PVT LTD",
    goodsConsignTo: "", bookingAddress: "", bookingQty: "", appValue: "",
    deliveryAt: "Customer Site", deliveryAdd1: "", deliveryAdd2: "", documentThrough: "Hand Delivery",
    invoiceNo: "", invoiceDate: "",
  });

  const [items, setItems] = useState<ItemRow[]>([{
    id: 1, soNo: "SO-1204", make: "JBS", category: "Laparoscopy",
    product: "HD Camera", model: "C-101-R", itemId: "ITM-001",
    equlIns: "Equipment", matchNo: "MN-01", ordQty: 2,
    currentStock: 12, unit: "Nos", qty: 1, rate: 85000, amount: 85000,
  }]);

  const [footer, setFooter] = useState({
    gross: 0, net: 0, totalQty: 0, amountInWords: "", deliveryTo: "",
    remarks: "", preparedBy: "", authorizedBy: "", receivedBy: "",
    printAfterSave: true, sendEmail: false,
  });

  const uh = (key: keyof typeof header, val: string) =>
    setHeader((p) => ({ ...p, [key]: val }));

  const uf = (key: keyof typeof footer, val: string | number | boolean) =>
    setFooter((p) => ({ ...p, [key]: val }));

  const updateItem = (id: number, key: keyof ItemRow, value: string | number) => {
    setItems((prev) => prev.map((item) => {
      if (item.id !== id) return item;
      const next = { ...item, [key]: value } as ItemRow;
      if (key === "qty" || key === "rate") {
        next.amount = Math.max(0, Number(key === "qty" ? value : next.qty) * Number(key === "rate" ? value : next.rate));
      }
      return next;
    }));
  };

  const addRow = () => {
    const nextId = Math.max(...items.map((i) => i.id)) + 1;
    setItems((p) => [...p, { id: nextId, soNo: "", make: "", category: "", product: "", model: "", itemId: "", equlIns: "", matchNo: "", ordQty: 0, currentStock: 0, unit: "", qty: 0, rate: 0, amount: 0 }]);
  };

  const removeRow = (id: number) => {
    if (items.length === 1) return;
    setItems((p) => p.filter((i) => i.id !== id));
  };

  const totalAmount = useMemo(() => items.reduce((s, i) => s + (Number(i.amount) || 0), 0), [items]);
  const totalQty = useMemo(() => items.reduce((s, i) => s + (Number(i.qty) || 0), 0), [items]);

  const handleSave = async () => {
    setLoading(true);
    try {
      const request: DeliveryChallanRequest = {
        deliveryDate: header.docDate,
        deliveryChallanId: header.docId || undefined,
        location: header.location,
        partyId: header.party ? parseInt(header.party) : undefined,
        salesOrderId: header.soNo ? parseInt(header.soNo) : undefined,
        salesmanId: header.salesman ? parseInt(header.salesman) : undefined,
        dispatchedBy: header.dispatchedBy,
        deliveredBy: header.deliveredBy,
        goodsConsignFrom: header.goodsConsignFrom,
        goodsConsignTo: header.goodsConsignTo,
        bookingAddress: header.bookingAddress,
        bookingQty: header.bookingQty ? parseFloat(header.bookingQty) : undefined,
        appValue: header.appValue ? parseFloat(header.appValue) : undefined,
        deliveryAt: header.deliveryAt,
        deliveryAdd1: header.deliveryAdd1,
        deliveryAdd2: header.deliveryAdd2,
        documentThrough: header.documentThrough,
        invoiceNo: header.invoiceNo,
        invoiceDate: header.invoiceDate || undefined,
        grossAmount: footer.gross || totalAmount,
        netAmount: footer.net || totalAmount,
        totalQty: footer.totalQty || totalQty,
        amountInWords: footer.amountInWords,
        deliveryTo: footer.deliveryTo,
        remarks: footer.remarks,
        preparedBy: footer.preparedBy,
        authorizedBy: footer.authorizedBy,
        receivedBy: footer.receivedBy,
        userCreated: 1,
        items: items.map(item => ({
          itemId: 1, // Reference ID
          qty: item.qty,
          unitPrice: item.rate,
          amount: item.amount,
          soNo: item.soNo,
          make: item.make,
          category: item.category,
          product: item.product,
          model: item.model,
          visualItemId: item.itemId,
          equlIns: item.equlIns,
          matchNo: item.matchNo,
          ordQty: item.ordQty,
          currentStock: item.currentStock,
          unit: item.unit
        }))
      };

      if (editId) {
        await deliveryChallanService.update(editId, request);
        toast.success("Delivery Challan updated successfully");
        onSuccess?.();
      } else {
        // Create and fetch the generated challan number
        const created = await deliveryChallanService.create(request);
        setHeader((prev) => ({ ...prev, docId: created.deliveryChallanId || "" }));
        toast.success(`Delivery Challan created: ${created.deliveryChallanId}`);
        // Close the modal after a short delay so user can see the number
        setTimeout(() => { onSuccess?.(); }, 1200);
      }
    } catch (error) {
      toast.error(editId ? "Failed to update Delivery Challan" : "Failed to create Delivery Challan");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
   

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center" style={{ backgroundColor: "rgba(107,114,128,0.6)" }}>
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-6xl border border-gray-200 my-6 mx-4 flex flex-col" style={{ maxHeight: "calc(100vh - 3rem)" }}>

        {/* Sticky Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 flex-shrink-0 rounded-t-2xl">
          <div>
            <h2 className="text-xl font-bold text-gray-800">{editId ? "Edit Delivery Challan" : "Create Delivery Challan"}</h2>
            <p className="text-sm text-gray-500">Header, items, and footer information</p>
          </div>
          <button className="text-gray-500 hover:text-gray-700 text-2xl" onClick={onClose} aria-label="Close">
            <FiX />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">

          {/* Header Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <label className="flex flex-col text-sm text-gray-700">Location*
              <select value={header.location} onChange={(e) => uh("location", e.target.value)} className={selectCls}>
                <option value="">-- Select Location --</option>
                {locations.map((loc: InventoryGroup) => (
                  <option key={loc.id} value={loc.name}>{loc.name}</option>
                ))}
              </select>
            </label>
            <label className="flex flex-col text-sm text-gray-700">Doc. Date*
              <input type="date" value={header.docDate} onChange={(e) => uh("docDate", e.target.value)} className={inputCls} />
            </label>
            <div className="flex flex-col text-sm text-gray-700">Party (Lead Name)*
              <LeadNameDropdown leads={leads} value={header.party} onChange={(v) => uh("party", v)} />
            </div>
            <label className="flex flex-col text-sm text-gray-700">Sales Order No*
              <select value={header.soNo} onChange={(e) => uh("soNo", e.target.value)} className={selectCls}>
                <option value="">-- Select SO --</option>
                {salesOrders.map((so) => (
                  <option key={so.id} value={so.id}>
                    {so.orderId} (ID: {so.id})
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col text-sm text-gray-700">Salesman*
              <select value={header.salesman} onChange={(e) => uh("salesman", e.target.value)} className={selectCls}>
                <option value="">-- Select Salesman --</option>
                {salesmen.map((s) => (
                  <option key={s.userId} value={s.userId}>{s.username}</option>
                ))}
              </select>
            </label>
            <label className="flex flex-col text-sm text-gray-700">Dispatched By
              <select value={header.dispatchedBy} onChange={(e) => uh("dispatchedBy", e.target.value)} className={selectCls}>
                <option value="">-- Select --</option>
                {DISPATCHED_BY.map((o) => <option key={o}>{o}</option>)}
              </select>
            </label>
            <label className="flex flex-col text-sm text-gray-700">Delivered By
              <input value={header.deliveredBy} onChange={(e) => uh("deliveredBy", e.target.value)} className={inputCls} />
            </label>
            <label className="flex flex-col text-sm text-gray-700">Goods Consign From
              <input value={header.goodsConsignFrom} onChange={(e) => uh("goodsConsignFrom", e.target.value)} className={inputCls} />
            </label>
            <label className="flex flex-col text-sm text-gray-700">Goods Consign To
              <input value={header.goodsConsignTo} onChange={(e) => uh("goodsConsignTo", e.target.value)} className={inputCls} />
            </label>
            <label className="flex flex-col text-sm text-gray-700">Booking Address
              <input value={header.bookingAddress} onChange={(e) => uh("bookingAddress", e.target.value)} className={inputCls} />
            </label>
            <label className="flex flex-col text-sm text-gray-700">Booking Qty
              <input type="number" value={header.bookingQty} onChange={(e) => uh("bookingQty", e.target.value)} className={inputCls} />
            </label>
            <label className="flex flex-col text-sm text-gray-700">App Value
              <input type="number" value={header.appValue} onChange={(e) => uh("appValue", e.target.value)} className={inputCls} />
            </label>
            <label className="flex flex-col text-sm text-gray-700">Delivery At
              <select value={header.deliveryAt} onChange={(e) => uh("deliveryAt", e.target.value)} className={selectCls}>
                <option value="">-- Select --</option>
                {DELIVERY_AT.map((o) => <option key={o}>{o}</option>)}
              </select>
            </label>
            <label className="flex flex-col text-sm text-gray-700">Delivery Add1
              <input value={header.deliveryAdd1} onChange={(e) => uh("deliveryAdd1", e.target.value)} className={inputCls} />
            </label>
            <label className="flex flex-col text-sm text-gray-700">Delivery Add2
              <input value={header.deliveryAdd2} onChange={(e) => uh("deliveryAdd2", e.target.value)} className={inputCls} />
            </label>
            <label className="flex flex-col text-sm text-gray-700">Document Through
              <select value={header.documentThrough} onChange={(e) => uh("documentThrough", e.target.value)} className={selectCls}>
                <option value="">-- Select --</option>
                {DOC_THROUGH.map((o) => <option key={o}>{o}</option>)}
              </select>
            </label>
            <label className="flex flex-col text-sm text-gray-700">Invoice No
              <input value={header.invoiceNo} onChange={(e) => uh("invoiceNo", e.target.value)} className={inputCls} />
            </label>
            <label className="flex flex-col text-sm text-gray-700">Invoice Date
              <input type="date" value={header.invoiceDate} onChange={(e) => uh("invoiceDate", e.target.value)} className={inputCls} />
            </label>
          </div>

          {/* Tabs */}
          <div>
            <div className="flex border-b border-gray-200">
              {(["item", "footer"] as const).map((tab) => (
                <button key={tab} type="button" onClick={() => setActiveTab(tab)}
                  className={`px-5 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
                    activeTab === tab ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}>
                  {tab === "item" ? "Item Detail" : "Footer"}
                </button>
              ))}
            </div>

            {activeTab === "item" && (
              <div className="border border-gray-200 rounded-b-lg rounded-tr-lg overflow-hidden">
                <div className="flex items-center justify-end px-4 py-3 bg-gray-50 border-b border-gray-200">
                  <button type="button" onClick={addRow}
                    className="px-3 py-1 bg-blue-600 text-white rounded-md text-xs font-semibold hover:bg-blue-700">
                    + Add Row
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-xs">
                    <thead className="bg-blue-50 text-gray-700">
                      <tr>
                        {["S.No","Sales Order No","Make","Category","Product","Model","Item ID","Equl/Ins","Match No","Ord.Qty","Current Stock","Unit","Qty*","Rate*","Amount",""].map((h) => (
                          <th key={h} className="px-3 py-2 text-left font-semibold whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((row, idx) => (
                        <tr key={row.id} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                          <td className="px-3 py-2 font-semibold">{idx + 1}</td>
                          <td className="px-2 py-1">
                            <select value={row.soNo} onChange={(e) => updateItem(row.id, "soNo", e.target.value)} className={cellSelectCls} style={{minWidth:100}}>
                              <option value="">--</option>
                              {salesOrders.map((so) => (
                                <option key={so.id} value={so.id}>
                                  {so.orderId} (ID: {so.id})
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="px-2 py-1"><select value={row.make} onChange={(e) => updateItem(row.id, "make", e.target.value)} className={cellSelectCls} style={{minWidth:90}}><option value="">--</option>{MAKES.map((o) => <option key={o}>{o}</option>)}</select></td>
                          <td className="px-2 py-1"><select value={row.category} onChange={(e) => updateItem(row.id, "category", e.target.value)} className={cellSelectCls} style={{minWidth:110}}><option value="">--</option>{CATEGORIES.map((o) => <option key={o}>{o}</option>)}</select></td>
                          <td className="px-2 py-1"><select value={row.product} onChange={(e) => updateItem(row.id, "product", e.target.value)} className={cellSelectCls} style={{minWidth:110}}><option value="">--</option>{PRODUCTS.map((o) => <option key={o}>{o}</option>)}</select></td>
                          <td className="px-2 py-1"><select value={row.model} onChange={(e) => updateItem(row.id, "model", e.target.value)} className={cellSelectCls} style={{minWidth:90}}><option value="">--</option>{MODELS.map((o) => <option key={o}>{o}</option>)}</select></td>
                          <td className="px-2 py-1"><select value={row.itemId} onChange={(e) => updateItem(row.id, "itemId", e.target.value)} className={cellSelectCls} style={{minWidth:90}}><option value="">--</option>{ITEM_IDS.map((o) => <option key={o}>{o}</option>)}</select></td>
                          <td className="px-2 py-1"><select value={row.equlIns} onChange={(e) => updateItem(row.id, "equlIns", e.target.value)} className={cellSelectCls} style={{minWidth:100}}><option value="">--</option>{EQUL_INS.map((o) => <option key={o}>{o}</option>)}</select></td>
                          <td className="px-2 py-1"><input value={row.matchNo} onChange={(e) => updateItem(row.id, "matchNo", e.target.value)} className={cellInputCls} style={{minWidth:80}} /></td>
                          <td className="px-2 py-1"><input type="number" value={row.ordQty} onChange={(e) => updateItem(row.id, "ordQty", Number(e.target.value))} className={cellInputCls} style={{minWidth:60}} /></td>
                          <td className="px-2 py-1"><input type="number" value={row.currentStock} onChange={(e) => updateItem(row.id, "currentStock", Number(e.target.value))} className={cellInputCls} style={{minWidth:80}} /></td>
                          <td className="px-2 py-1"><select value={row.unit} onChange={(e) => updateItem(row.id, "unit", e.target.value)} className={cellSelectCls} style={{minWidth:70}}><option value="">--</option>{UNITS.map((o) => <option key={o}>{o}</option>)}</select></td>
                          <td className="px-2 py-1"><input type="number" value={row.qty} onChange={(e) => updateItem(row.id, "qty", Number(e.target.value))} className={cellInputCls} style={{minWidth:60}} /></td>
                          <td className="px-2 py-1"><input type="number" value={row.rate} onChange={(e) => updateItem(row.id, "rate", Number(e.target.value))} className={cellInputCls} style={{minWidth:80}} /></td>
                          <td className="px-3 py-2 font-semibold text-right whitespace-nowrap">₹{row.amount.toLocaleString("en-IN")}</td>
                          <td className="px-3 py-2 text-center">
                            <button type="button" onClick={() => removeRow(row.id)} disabled={items.length === 1}
                              className="text-red-500 hover:text-red-700 text-xs disabled:opacity-30">✕</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-50 border-t border-gray-200">
                      <tr>
                        <td colSpan={12} className="px-3 py-2 text-right text-xs font-semibold text-gray-600">Total</td>
                        <td className="px-3 py-2 text-xs font-bold">{totalQty}</td>
                        <td />
                        <td className="px-3 py-2 text-right text-xs font-bold whitespace-nowrap">₹{totalAmount.toLocaleString("en-IN")}</td>
                        <td />
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            )}

            {activeTab === "footer" && (
              <div className="border border-gray-200 rounded-b-lg rounded-tr-lg p-6 space-y-5">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <label className="flex flex-col text-sm text-gray-700">Gross
                    <input type="number" value={footer.gross || totalAmount} onChange={(e) => uf("gross", Number(e.target.value))} className={inputCls} />
                  </label>
                  <label className="flex flex-col text-sm text-gray-700">Net
                    <input type="number" value={footer.net || totalAmount} onChange={(e) => uf("net", Number(e.target.value))} className={inputCls} />
                  </label>
                  <label className="flex flex-col text-sm text-gray-700">Total Qty
                    <input type="number" value={footer.totalQty || totalQty} onChange={(e) => uf("totalQty", Number(e.target.value))} className={inputCls} />
                  </label>
                </div>
                <label className="flex flex-col text-sm text-gray-700">Amount in Words
                  <input value={footer.amountInWords} placeholder="e.g. Rupees One Lakh only" onChange={(e) => uf("amountInWords", e.target.value)} className={inputCls} />
                </label>
                <label className="flex flex-col text-sm text-gray-700">Delivery To
                  <textarea value={footer.deliveryTo} onChange={(e) => uf("deliveryTo", e.target.value)}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 min-h-[70px]" />
                </label>
              </div>
            )}
          </div>
        </div>

        {/* Sticky Footer */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50 flex-shrink-0 rounded-b-2xl">
          <button type="button" onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-100">
            Cancel
          </button>
          <button type="button" onClick={handleSave} disabled={loading}
            className={`px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 ${loading ? "opacity-50 cursor-not-allowed" : ""}`}>
            {loading ? "Processing..." : editId ? "Update Challan" : "Save Challan"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateDeliveryChallanModal;
