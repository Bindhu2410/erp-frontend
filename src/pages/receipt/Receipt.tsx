import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import api from "../../services/api";
import config from "./receiptFormConfig.json";
import DropDown from "../../components/common/DropDown";
import InputField from "../../components/common/InputField";
import Modal from "../../components/common/Modal";
import { useUser } from "../../context/UserContext";
import { toast } from "react-toastify";
import salesLeadService from "../../services/salesLeadService";
import Swal from "sweetalert2";

interface ReceiptItem {
  sNo: number;
  make: string;
  category: string;
  product: string;
  model: string;
  item: string;
  issueNo: string;
  batchNo: string;
  accYN: string;
  quantity: number;
  unit: string;
  rate: number;
  amount: number;
  remarks: string;
  readonly?: boolean;
}

interface OptItem {
  sNo: number;
  make: string;
  category: string;
  product: string;
  model: string;
  item: string;
  description: string;
  quantity: number;
  rate: number;
  option: string;
}

interface Accessory {
  sNo: number;
  accessories: string;
  issAccQty: number;
  reAccQty: number;
}

interface HeaderFields {
  [key: string]: string;
}

const Receipt = ({ isEdit = false, data, onSuccess, onClose }: any) => {
  const [activeTab, setActiveTab] = useState("issueDetail");
  const [headerFields, setHeaderFields] = useState<HeaderFields>(() => {
    const obj: HeaderFields = {};
    config.headerFields.forEach((f) => {
      obj[f.name] = "";
    });
    return obj;
  });

  const [issueItems, setIssueItems] = useState<ReceiptItem[]>([]);
  const [optItems, setOptItems] = useState<OptItem[]>([]);
  const [accessories, setAccessories] = useState<Accessory[]>([]);
  const [loading, setLoading] = useState(false);
  const [apiOptions, setApiOptions] = useState<Record<string, any[]>>({});
  const fetchedFieldsRef = useRef<Set<string>>(new Set());
  const [loadingFields, setLoadingFields] = useState<Record<string, boolean>>({});
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const { user } = useUser();

  // Calculations
  const totals = useMemo(() => {
    const gross = issueItems.reduce((sum, item) => sum + (item.amount || 0), 0) +
                  optItems.reduce((sum, item) => sum + ((item.quantity || 0) * (item.rate || 0)), 0);
    const totalQty = issueItems.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0) +
                     optItems.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
    return { gross, totalQty };
  }, [issueItems, optItems]);

  useEffect(() => {
    if (totals.gross.toString() !== headerFields.gross || totals.totalQty.toString() !== headerFields.totalQty) {
      setHeaderFields(prev => ({ 
        ...prev, 
        gross: totals.gross.toString(),
        totalQty: totals.totalQty.toString()
      }));
    }
  }, [totals, headerFields.gross, headerFields.totalQty]);

  // Load existing data
  useEffect(() => {
    if (isEdit && data?.receipt) {
      const r = data.receipt;
      setHeaderFields({
        locationId: (r.locationId || r.LocationId || "").toString(),
        docId: r.docId || "",
        docDate: r.docDate?.split("T")[0] || "",
        receiptDate: r.receiptDate?.split("T")[0] || "",
        refNo: r.refNo || "",
        refDate: r.refDate?.split("T")[0] || "",
        receivedFrom: (r.receivedFrom || r.ReceivedFrom || "").toString(),
        customerName: (r.customerName || r.CustomerName || "").toString(),
        salesRepresentative: (r.salesRepresentative || r.salesman || "").toString(),
        hospitalName: r.hospitalName || "",
        status: r.status || "",
        gross: r.gross?.toString() || "0",
        totalQty: r.totalQty?.toString() || "0",
        narration: r.narration || "",
        amountInWords: r.amountInWords || "",
      });
      setIssueItems(r.items || []);
      setOptItems(r.optionalItems || []);
      setAccessories(r.accessories || []);
    }
  }, [isEdit, data?.receipt?.id]);

  const addOptItem = () => {
    setOptItems(prev => [
      ...prev,
      {
        sNo: prev.length + 1,
        make: "",
        category: "",
        product: "",
        model: "",
        item: "",
        description: "",
        quantity: 0,
        rate: 0,
        option: ""
      }
    ]);
  };

  const updateOptItem = (index: number, field: keyof OptItem, value: any) => {
    const updated = [...optItems];
    updated[index] = { ...updated[index], [field]: value };
    setOptItems(updated);
  };

  const addAccessory = () => {
    setAccessories(prev => [
      ...prev,
      {
        sNo: prev.length + 1,
        accessories: "",
        issAccQty: 0,
        reAccQty: 0
      }
    ]);
  };

  const updateAccessory = (index: number, field: keyof Accessory, value: any) => {
    const updated = [...accessories];
    updated[index] = { ...updated[index], [field]: value };
    setAccessories(updated);
  };

  const fetchOptions = useCallback(
    async (field: any) => {
      if (!field.URL || fetchedFieldsRef.current.has(field.name)) return;

      try {
        setLoadingFields((prev) => ({ ...prev, [field.name]: true }));
        const res = await api.get(field.URL);
        
        // Robust data extraction from various common API response structures
        const data = res.data;
        const rawData = Array.isArray(data) ? data : (data?.results || data?.value || data?.data || data?.items || []);
        
        const mappedOptions = rawData.map((item: any) => {
          // Resolve the internal issue object if exists (handle both casing)
          const nestedIssue = item.issue || item.Issue;

          // Robust label detection checking both camelCase and PascalCase variations
          const label = nestedIssue?.doc_id || nestedIssue?.docId || nestedIssue?.DocId ||
                        (item.customerName && item.leadId ? `${item.customerName} (${item.leadId})` : null) ||
                        (item.firstName ? `${item.firstName} ${item.lastName || ""}`.trim() : null) || 
                        item.locationName || item.LocationName ||
                        item.warehouseName || item.WarehouseName ||
                        item.vendorName || item.VendorName ||
                        item.customerName || item.CustomerName ||
                        item.docId || item.DocId || 
                        item.username || item.Username || 
                        item.name || item.Name || 
                        item.itemName || item.ItemName || "";

          // Robust value detection
          const value = (nestedIssue?.id || nestedIssue?.Id || item.id || item.Id || item.locationId || item.LocationId || item.value || item.Value || item.itemName || item.ItemName || "").toString();

          return { label, value };
        }).filter((opt: any) => opt.label && opt.value !== "");

        setApiOptions((prev) => ({
          ...prev,
          [field.name]: mappedOptions,
        }));
        fetchedFieldsRef.current.add(field.name);
      } catch (err) {
        console.error(`Error fetching ${field.name}:`, err);
      } finally {
        setLoadingFields((prev) => ({ ...prev, [field.name]: false }));
      }
    },
    [] // No dependency on fetchedFieldsRef
  );

  // Eager load critical dropdowns on mount (matching Issue module logic)
  useEffect(() => {
    // 1. Fetch SalesLeads for Party Name and Received From (using POST specialized service)
    const fetchLeads = async () => {
      if (fetchedFieldsRef.current.has("customerName")) return;
      try {
        const response = await salesLeadService.getDropdown({ pageNumber: 1, pageSize: 500 });
        const leads = response.results || [];
        const leadOptions = leads.map((lead: any) => ({
          label: `${lead.customerName} (${lead.leadId})`,
          value: lead.id.toString(),
        }));
        setApiOptions(prev => ({
          ...prev,
          customerName: leadOptions,
          receivedFrom: leadOptions,
        }));
        fetchedFieldsRef.current.add("customerName");
        fetchedFieldsRef.current.add("receivedFrom");
      } catch (err) {
        console.error("Error fetching leads:", err);
      }
    };

    const priorityFields = config.headerFields.filter(f => 
      ["locationId", "salesRepresentative"].includes(f.name)
    );
    priorityFields.forEach(f => fetchOptions(f));
    fetchLeads();

    // Fetch Accessories for the dc5 tab dropdown
    const fetchAccessoriesMaster = async () => {
      try {
        const res = await api.get("AccessoriesHeader");
        const data = Array.isArray(res.data) ? res.data : [];
        // Flatten to get unique accessory names
        const names = new Set <string> ();
        data.forEach((h: any) => {
          if (h.accessoriesDetails) {
            h.accessoriesDetails.forEach((d: any) => {
              if (d.accessoriesName) names.add(d.accessoriesName);
            });
          }
        });
        const options = Array.from(names).map(n => ({ label: n, value: n }));
        setApiOptions(prev => ({ ...prev, accessories: options }));
      } catch (err) {
        console.error("Error fetching accessories master:", err);
      }
    };
    fetchAccessoriesMaster();
  }, [fetchOptions]);

  const handleOptionChange = async (fieldName: string, value: string) => {
    setHeaderFields(prev => ({ ...prev, [fieldName]: value }));

    if (fieldName === "refNo" && value) {
      try {
        setLoading(true);
        const res = await api.get(`Issues/${value}`);
        const issue = res.data?.issue || res.data;
        
        if (issue) {
          setHeaderFields(prev => ({
            ...prev,
            refDate: issue.issueDate?.split("T")[0] || "",
            customerName: res.data?.partyName || issue.customerName || "",
          }));

          // Fill items
          const mappedItems = (issue.issueItems || []).map((ii: any, idx: number) => ({
            sNo: idx + 1,
            make: ii.make || "",
            category: ii.categoryName || ii.category || "",
            product: ii.product || "",
            model: ii.model || "",
            item: ii.itemName || ii.item || "",
            issueNo: issue.docId || "",
            batchNo: ii.batchNo || "",
            accYN: ii.accYN || "N",
            quantity: ii.qty || 0,
            unit: ii.unit || "",
            rate: ii.rate || ii.unitPrice || 0,
            amount: ii.amount || 0,
            remarks: "",
            readonly: true
          }));
          setIssueItems(mappedItems);

          const mappedOpts = (issue.optionalItems || []).map((oi: any, idx: number) => ({
            sNo: idx + 1,
            make: oi.make || "",
            category: oi.category || "",
            product: oi.product || "",
            model: oi.model || "",
            item: oi.item || "",
            description: oi.remarks || "",
            quantity: oi.qty || 0,
            rate: oi.rate || 0,
            option: ""
          }));
          setOptItems(mappedOpts);
          toast.success("Auto-filled details from Issue");
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to fetch issue details");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload: any = {
        ...headerFields,
        // Dual mapping to ensure backend property alignment
        salesRepresentative: headerFields.salesRepresentative,
        salesman: headerFields.salesRepresentative, 
        items: issueItems,
        optionalItems: optItems,
        accessories: accessories,
        gross: totals.gross,
        totalQty: totals.totalQty,
      };

      if (isEdit) {
        payload.id = data.receipt.id;
        await api.put(`Receipts/${data.receipt.id}`, payload);
        Swal.fire({
          icon: "success",
          title: "Updated!",
          text: "Receipt updated successfully.",
          showConfirmButton: false,
          timer: 2000,
        });
      } else {
        await api.post("Receipts", payload);
        Swal.fire({
          icon: "success",
          title: "Saved!",
          text: "Receipt saved successfully.",
          showConfirmButton: false,
          timer: 2000,
        });
      }
      onSuccess();
    } catch (err: any) {
      console.error("Submit Error:", err);
      const errMsg = err.response?.data?.message || err.message || "Save failed";
      setSubmitError(errMsg);
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: `Error: ${errMsg}`,
      });
    } finally {
      setLoading(false);
    }
  };

  const renderGrid = () => {
    switch (activeTab) {
      case "issueDetail":
        return (
          <div className="overflow-x-auto rounded-xl border border-gray-200">
            <table className="w-full text-sm text-left">
              <thead className="bg-blue-600 text-white uppercase text-xs">
                <tr>
                  {config.issueDetailColumns.map(col => <th key={col.key} className="px-4 py-3 font-semibold">{col.label}</th>)}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 italic font-medium">
                {issueItems.map((item, idx) => (
                  <tr key={idx} className="hover:bg-blue-50/50">
                    <td className="px-4 py-2 border-r">{item.sNo}</td>
                    <td className="px-4 py-2 border-r">{item.make}</td>
                    <td className="px-4 py-2 border-r">{item.category}</td>
                    <td className="px-4 py-2 border-r">{item.product}</td>
                    <td className="px-4 py-2 border-r">{item.model}</td>
                    <td className="px-4 py-2 border-r">{item.item}</td>
                    <td className="px-4 py-2 border-r">{item.issueNo}</td>
                    <td className="px-4 py-2 border-r">{item.batchNo}</td>
                    <td className="px-4 py-2 border-r">{item.accYN}</td>
                    <td className="px-4 py-2 border-r">{item.quantity}</td>
                    <td className="px-4 py-2 border-r">{item.unit}</td>
                    <td className="px-4 py-2 border-r">{item.rate}</td>
                    <td className="px-4 py-2 border-r font-bold text-blue-700">{item.amount}</td>
                    <td className="px-4 py-2 border-r"><input type="text" className="w-full border-0 focus:ring-1 focus:ring-blue-400 rounded bg-transparent" value={item.remarks} onChange={e => {
                      const newItems = [...issueItems];
                      newItems[idx].remarks = e.target.value;
                      setIssueItems(newItems);
                    }} /></td>
                  </tr>
                ))}
                {issueItems.length === 0 && <tr><td colSpan={14} className="text-center p-8 text-gray-400">No items available. Select an Issue No or add items.</td></tr>}
              </tbody>
            </table>
          </div>
        );
      case "optItem":
        return (
          <div className="space-y-4">
            <div className="flex justify-end">
              <button 
                type="button"
                onClick={addOptItem}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 transition-all flex items-center gap-2"
              >
                <span className="text-xl">+</span> Add Optional Item
              </button>
            </div>
            <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-inner">
              <table className="w-full text-sm text-left">
                <thead className="bg-indigo-600 text-white uppercase text-xs">
                  <tr>
                    {config.optionalItemColumns.map(col => <th key={col.key} className="px-4 py-3 font-semibold">{col.label}</th>)}
                    <th className="px-4 py-3 font-semibold text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {optItems.map((item, idx) => (
                    <tr key={idx} className="hover:bg-indigo-50/50 transition-colors">
                      <td className="px-4 py-2 border-r w-16">{item.sNo}</td>
                      {[
                        { key: "make", type: "text" },
                        { key: "category", type: "text" },
                        { key: "product", type: "text" },
                        { key: "model", type: "text" },
                        { key: "item", type: "text" },
                        { key: "description", type: "text" },
                        { key: "quantity", type: "number" },
                        { key: "rate", type: "number" },
                        { key: "option", type: "text" }
                      ].map(field => (
                        <td key={field.key} className="px-4 py-2 border-r min-w-[120px]">
                          <input 
                            type={field.type} 
                            className="w-full border-0 focus:ring-1 focus:ring-indigo-400 rounded bg-transparent p-1"
                            value={(item as any)[field.key]} 
                            onChange={e => updateOptItem(idx, field.key as keyof OptItem, field.type === "number" ? Number(e.target.value) : e.target.value)} 
                          />
                        </td>
                      ))}
                      <td className="px-4 py-2 text-center">
                        <button 
                          type="button"
                          onClick={() => setOptItems(prev => prev.filter((_, i) => i !== idx))}
                          className="text-red-500 hover:text-red-700 p-1"
                        >
                          ✕
                        </button>
                      </td>
                    </tr>
                  ))}
                  {optItems.length === 0 && <tr><td colSpan={11} className="text-center p-12 text-gray-400 italic">No optional items found. Click 'Add Optional Item' to begin.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        );
      case "dc5":
        return (
          <div className="space-y-4">
            <div className="flex justify-end">
              <button 
                type="button"
                onClick={addAccessory}
                className="px-4 py-2 bg-teal-600 text-white rounded-lg font-bold hover:bg-teal-700 transition-all flex items-center gap-2 shadow-md"
              >
                <span className="text-xl">+</span> Add Accessory
              </button>
            </div>
            <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-inner">
              <table className="w-full text-sm text-left">
                <thead className="bg-teal-600 text-white uppercase text-xs">
                  <tr>
                    {config.dc5Columns.map(col => <th key={col.key} className="px-4 py-3 font-semibold">{col.label}</th>)}
                    <th className="px-4 py-3 font-semibold text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {accessories.map((item, idx) => (
                    <tr key={idx} className="hover:bg-teal-50/50 transition-colors">
                      <td className="px-4 py-2 border-r w-16">{item.sNo}</td>
                      <td className="px-4 py-2 border-r min-w-[200px]">
                        <select 
                          className="w-full border-0 focus:ring-1 focus:ring-teal-400 rounded bg-transparent p-1"
                          value={item.accessories}
                          onChange={e => updateAccessory(idx, "accessories", e.target.value)}
                        >
                          <option value="">Select Accessory</option>
                          {(apiOptions.accessories || []).map((opt: any) => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-2 border-r w-32">
                        <input 
                          type="number" 
                          className="w-full border-0 focus:ring-1 focus:ring-teal-400 rounded bg-transparent p-1 text-center" 
                          value={item.issAccQty} 
                          onChange={e => updateAccessory(idx, "issAccQty", Number(e.target.value))} 
                        />
                      </td>
                      <td className="px-4 py-2 border-r w-32">
                        <input 
                          type="number" 
                          className="w-full border-0 focus:ring-1 focus:ring-teal-400 rounded bg-transparent p-1 text-center font-bold text-teal-700" 
                          value={item.reAccQty} 
                          onChange={e => updateAccessory(idx, "reAccQty", Number(e.target.value))} 
                        />
                      </td>
                      <td className="px-4 py-2 text-center w-20">
                        <button 
                          type="button"
                          onClick={() => setAccessories(prev => prev.filter((_, i) => i !== idx))}
                          className="text-red-500 hover:text-red-700 p-1"
                        >
                          ✕
                        </button>
                      </td>
                    </tr>
                  ))}
                  {accessories.length === 0 && <tr><td colSpan={5} className="text-center p-12 text-gray-400 italic">No accessories recorded. Click 'Add Accessory' to begin.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        );
      case "footer":
        return (
          <div className="grid grid-cols-2 gap-8 p-6 bg-yellow-50/30 rounded-2xl border border-yellow-200">
            <div className="space-y-4">
              <InputField FieldName="Gross" IdName="gross" Type="number" value={headerFields.gross} handleInputChange={(fn, v) => setHeaderFields(p => ({...p, [fn]: v}))} readonly />
              <InputField FieldName="Total Qty" IdName="totalQty" Type="number" value={headerFields.totalQty} handleInputChange={(fn, v) => setHeaderFields(p => ({...p, [fn]: v}))} readonly />
            </div>
            <div className="space-y-4">
              <InputField FieldName="Amount In Words" IdName="amountInWords" Type="text" value={headerFields.amountInWords} handleInputChange={(fn, v) => setHeaderFields(p => ({...p, [fn]: v}))} />
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-900">Narration</label>
                <textarea className="w-full rounded-xl border border-gray-300 p-3 h-24 focus:ring-2 focus:ring-blue-500" value={headerFields.narration || ""} onChange={e => setHeaderFields(p => ({...p, narration: e.target.value}))}></textarea>
              </div>
            </div>
          </div>
        );
      default: return null;
    }
  };

  const headerLeft = config.headerFields.filter((_, i) => i % 2 === 0);
  const headerRight = config.headerFields.filter((_, i) => i % 2 !== 0);

  return (
    <div className="w-full mx-auto p-4 max-w-[1600px] animate-fadeIn">
      <div className="bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-gray-100">
        <header className="bg-gradient-to-r from-blue-700 to-indigo-800 p-8 text-white">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
              <span className="bg-white text-blue-700 p-2 rounded-lg">RC</span>
              RECEIPTS
            </h1>
            <div className="flex gap-4">
              <button onClick={() => onClose?.()} className="px-6 py-2 rounded-xl bg-white/10 hover:bg-white/20 transition-all font-bold backdrop-blur-sm border border-white/20">Close</button>
            </div>
          </div>
        </header>

        <form onSubmit={handleSubmit} className="p-8 space-y-12">
          {/* Header Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-16 gap-y-6">
            <div className="space-y-6">
              {headerLeft.map((f: any) => (
                f.type === "dropdown" ? (
                  <DropDown key={f.name} FieldName={f.label} IdName={f.name} handleOptionChange={handleOptionChange} values={headerFields[f.name]} Options={f.options || apiOptions[f.name]} onFocus={() => fetchOptions(f)} required={f.required} />
                ) : (
                  <InputField key={f.name} FieldName={f.label} IdName={f.name} Name={f.name} Type={f.type} value={headerFields[f.name]} handleInputChange={(fn, v) => setHeaderFields(p => ({...p, [fn]: v}))} required={f.required} />
                )
              ))}
            </div>
            <div className="space-y-6">
              {headerRight.map((f: any) => (
                f.type === "dropdown" ? (
                  <DropDown key={f.name} FieldName={f.label} IdName={f.name} handleOptionChange={handleOptionChange} values={headerFields[f.name]} Options={f.options || apiOptions[f.name]} onFocus={() => fetchOptions(f)} required={f.required} />
                ) : (
                  <InputField key={f.name} FieldName={f.label} IdName={f.name} Name={f.name} Type={f.type} value={headerFields[f.name]} handleInputChange={(fn, v) => setHeaderFields(p => ({...p, [fn]: v}))} required={f.required} />
                )
              ))}
            </div>
          </div>

          {/* Tabs Section */}
          <div className="space-y-6">
            <div className="flex gap-2 p-1.5 bg-gray-100 rounded-2xl w-fit">
              {[
                { id: "issueDetail", label: "Issue Detail", color: "blue" },
                { id: "optItem", label: "Opt Item", color: "indigo" },
                { id: "footer", label: "Footer", color: "yellow" },
                { id: "dc5", label: "dc5", color: "teal" }
              ].map(tab => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-8 py-3 rounded-xl font-bold text-sm transition-all duration-300 ${
                    activeTab === tab.id 
                    ? `bg-white text-${tab.color}-700 shadow-md transform scale-105` 
                    : "text-gray-500 hover:text-gray-800 hover:bg-gray-50"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="min-h-[400px]">
              {renderGrid()}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-6 pt-6 border-t border-gray-100">
            <button
              type="submit"
              disabled={loading}
              className={`px-12 py-4 rounded-2xl font-black text-white shadow-xl transition-all hover:-translate-y-1 active:translate-y-0 ${
                loading ? "bg-gray-400" : "bg-gradient-to-br from-blue-600 to-indigo-700 hover:shadow-blue-200"
              }`}
            >
              {loading ? "SAVING..." : (isEdit ? "UPDATE RECEIPT" : "SAVE RECEIPT")}
            </button>
          </div>
        </form>

        <Modal isOpen={showSuccessModal} onClose={() => setShowSuccessModal(false)} title="SUCCESS">
          <div className="p-8 text-center space-y-4">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto text-green-500">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
            </div>
            <h2 className="text-2xl font-black text-gray-900">SAVED SUCCESSFULLY!</h2>
            <button onClick={() => {
              setShowSuccessModal(false);
              onSuccess?.();
            }} className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold hover:bg-gray-800 transition-all">DISMISS</button>
          </div>
        </Modal>

        {submitError && (
          <div className="fixed bottom-8 right-8 p-6 bg-red-600 text-white rounded-2xl shadow-2xl flex gap-4 items-center animate-slideInRight">
            <span className="font-bold">{submitError}</span>
            <button onClick={() => setSubmitError(null)} className="p-1 hover:bg-white/20 rounded">✕</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Receipt;
