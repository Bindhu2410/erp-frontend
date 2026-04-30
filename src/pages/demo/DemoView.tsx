import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import {
  MdEdit,
  MdDelete,
  MdAdd,
  MdPhone,
  MdPerson,
  MdBusinessCenter,
  MdLocationOn,
  MdDateRange,
  MdOutlineMailOutline,
  MdUpload,
} from "react-icons/md";
import OpportunityProducts from "../opportunity/OpportunityProducts";
import Tab from "../../components/common/Tab";
import { ToWords } from "to-words";
import Modal from "../../components/common/Modal";
import { FaPrint, FaTrash, FaUpload } from "react-icons/fa";
import { BsThreeDotsVertical } from "react-icons/bs";
import DemoForm from "./DemoForm";
import ToWhomSoEverPrint from "./ToWhomSoEverPrint";
import EWayBill from "./EWayBill";
import api from "../../services/api";
import { format } from "path";
import { formatDate } from "../../components/lead/FormateDate";
import ConfirmBox from "../../components/common/ConfirmBox";
import { FiArrowLeft } from "react-icons/fi";

import { Product } from "../../types/product";
import { useUser } from "../../context/UserContext";

interface DemoData {
  id: number;
  userCreated: number;
  dateCreated: string;
  dateUpdated?: string;
  userUpdated: number | null;
  demoDate: string;
  demoTime: string;
  status: string;
  addressId: number;
  opportunityId: number;
  customerId: number;
  demoContact: string;
  customerName: string;
  demoName: string;
  demoApproach: string;
  demoOutcome: string;
  demoFeedback: string;
  comments: string;
  presenterName: number;
  presenterNames?: string[];
  products?: Array<{
    productCode: string;
    productName: string;
    description: string;
    category: string;
    make: string;
    model: string;
    uom: string;
    quantity: number;
    unitPrice: number;
    Amount?: number;
    status: string;
    tax?: number;
    id?: string;
  }>;
  address?:
  | string
  | {
    door_no?: string;
    street?: string;
    land_mark?: string;
    block?: string;
    area?: string;
    department?: string;
    city?: string;
    state?: string;
    pincode?: string;
  };
}

interface QuotationData {
  amendment: string;
  quotationId: string;
  leadName: string;
  quotationDate: string;
  amount: string;
  validTill: string;
  opportunityId: string;
  contactNo: string;
}

interface DealData {
  dealId: string;
  leadName: string;
  contactNo: string;
  po: string;
  poDate: string;
  oa: string;
  oaDate: string;
  closingDate: string;
  expectedRevenue: string;
  amount: string;
  opportunityId: string;
}

const toWords = new ToWords({
  localeCode: "en-IN",
  converterOptions: {
    currency: true,
    ignoreDecimal: false,
    ignoreZeroCurrency: false,
  },
});

const DemoView: React.FC = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);

  const id = searchParams.get("id");
  const [data, setData] = useState<DemoData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOpenPrint, setIsOpenPrint] = useState(false);
  const [showWhomPrint, setShowWhomPrint] = useState(false);
  const [quotationData, setQuotationData] = useState<QuotationData | null>({
    amendment: "Requested",
    leadName: "John Smith",
    quotationDate: "2024-02-15",
    quotationId: "QU001",
    validTill: "2024-03-15",
    opportunityId: "OPP-2023-001",
    contactNo: "9876543210",
    amount: "150000",
  });
  const [showEWayBillPrint, setShowEWayBillPrint] = useState(false);
  const [showDemoReport, setShowDemoReport] = useState(false);

  const [dealData, setDealData] = useState<DealData | null>(null);
  const [modal, setModal] = useState(false);
  const [error, setError] = useState("");
  const [oppUID, setOppUID] = useState("");
  const [oppID, setOppID] = useState("");
  const [originalData, setOriginalData] = useState<any>(null);
  const { user, role } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const [products, setProducts] = useState<any[]>([]);
  const [checklistNamesByItemId, setCheckListNamesByItemId] = useState<{
    [key: string]: string[];
  }>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  console.log(products, "Products in DemoView");
  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Print handler for ToWhomSoEverPrint
  const handlePrintWhom = () => {
    const printContents = document.getElementById("whom-print-area")?.innerHTML;
    if (printContents) {
      const printWindow = window.open("", "_blank", "width=800,height=600");
      printWindow?.document.write(`
        <html>
          <head>
            <title>Print</title>
            <link rel="stylesheet" href="/index.css" />
             <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
             <style>
                @media print {
                  body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                }
              </style>
          </head>
          <body>${printContents}</body>
        </html>
      `);
      printWindow?.document.close();
      printWindow?.focus();
      setTimeout(() => {
        printWindow?.print();
        printWindow?.close();
      }, 500);
    }
  };

  // Print handler for EWayBill
  const handlePrintEWayBill = () => {
    const printContents = document.getElementById(
      "ewaybill-print-area"
    )?.innerHTML;
    if (printContents) {
      const printWindow = window.open("", "_blank", "width=800,height=600");
      printWindow?.document.write(`
        <html>
          <head>
            <title>Print</title>
            <link rel="stylesheet" href="/index.css" />
             <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
             <style>
                @media print {
                  body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                }
              </style>
          </head>
          <body>${printContents}</body>
        </html>
      `);
      printWindow?.document.close();
      printWindow?.focus();
      setTimeout(() => {
        printWindow?.print();
        printWindow?.close();
      }, 500);
    }
  };

  // Print handler for Demo Report
  const handlePrintDemoReport = () => {
    const printContents = document.getElementById(
      "demo-report-area"
    )?.innerHTML;
    if (printContents) {
      const printWindow = window.open("", "_blank", "width=800,height=600");
      printWindow?.document.write(`
        <html>
          <head>
            <title>Demo Report</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; background-color: #f5f5f5; }
              .header { background-color: #d2691e; color: white; padding: 8px; text-align: center; font-weight: bold; margin-bottom: 10px; }
              .company-info { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; padding: 10px; border: 1px solid #ccc; }
              .logo { font-size: 24px; font-weight: bold; color: #228B22; }
              .report-title { text-align: center; font-size: 18px; font-weight: bold; margin: 20px 0; text-decoration: underline; }
              .date-field { text-align: right; margin-bottom: 20px; }
              .form-section { margin-bottom: 15px; }
              .form-row { display: flex; margin-bottom: 8px; align-items: center; }
              .form-label { width: 200px; font-weight: bold; }
              .form-input { flex: 1; border-bottom: 1px solid #000; min-height: 20px; padding: 2px; }
              .checkbox-group { display: flex; flex-wrap: wrap; gap: 15px; margin-left: 220px; }
              .checkbox-item { display: flex; align-items: center; gap: 5px; }
              .text-area { width: 100%; min-height: 60px; border: 1px solid #000; padding: 5px; margin-top: 5px; }
              .signature-section { display: flex; justify-content: space-between; margin-top: 40px; padding-top: 20px; }
              .signature-box { text-align: center; width: 45%; }
              .footer { background-color: #2F4F4F; color: white; padding: 8px; text-align: center; font-size: 12px; margin-top: 20px; }
              .address-footer { text-align: center; font-size: 10px; margin-top: 10px; }
              @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
            </style>
          </head>
          <body>${printContents}</body>
        </html>
      `);
      printWindow?.document.close();
      printWindow?.focus();
      setTimeout(() => {
        printWindow?.print();
        printWindow?.close();
      }, 500);
    }
  };

  const handleCreateDeal = () => {
    window.location.href = "/create-deal"; // Replace with your actual form route
  };

  const demoTab = [
    {
      label: "Activities",
      name: "activities",
      stage: "Demo",
      stageItemId: id ?? "",
    },
    {
      label: "External Comments",
      name: "externalComment",
      stage: "Demo",
      stageItemId: id ?? "",
    },
    {
      label: "Email",
      name: "email",
    },
    {
      label: "Summary",
      name: "summary",
      stageItemId: id ?? "",
    },
  ];

  useEffect(() => {
    const fetchDemo = async () => {
      try {
        const response = await api.get(`SalesDemo/${id}/with-items`);
        const rawData = response.data;
        setOriginalData(rawData);
        const demoObj = rawData.demo || {};
        setData(demoObj);
        setCheckListNamesByItemId(demoObj.checklistNamesByItemId || {});
        setProducts(rawData.items || []); // Set products from the 'items' property at the top level
      } catch (error: any) {
        if (error.response?.status === 404) {
          setError("No data found");
        } else {
          setError(
            error.response?.data?.message || "Failed to fetch lead data"
          );
        }
      } finally {
        setLoading(false);
      }
    };
    fetchDemo();
  }, [id]);

  useEffect(() => {
    // Only fetch if oppuserfrndID is not already set and we have an opportunityId
    if (data?.opportunityId) {
      const fetchOpportunityId = async () => {
        try {
          const oppIdToFetch = data?.opportunityId;
          if (!oppIdToFetch) return;

          const res = await api.get(`SalesOpportunity/with-items`);

          const opportunityData = res.data;

          if (!opportunityData) throw new Error("Failed to fetch opportunity");

          // Use `find` instead of `filter` to get the first matching item
          const found = opportunityData.find(
            (item: any) => item.opportunity?.id === oppIdToFetch
          );

          console.log("Found Opportunity:", found);
          if (found) {
            setOppUID(
              found.opportunity?.opportunity_id ||
              found.opportunity?.opportunityId
            );
            setOppID(found.opportunity?.id);
            console.log("Opportunity ID:", found.opportunity?.opportunity_id);
          }
        } catch (err) {
          console.error("Error fetching opportunity for oppuserfrndID:", err);
        }
      };

      fetchOpportunityId();
    }
  }, [data?.opportunityId]);

  // Format address if available

  const generalInfoSection = {
    title: data?.demoName,
    subTitle: data?.demoContact,
    status: data?.status,
    details: {
      mainInfo: [
        { label: "Lead Name", value: data?.customerName },
        { label: "Demo Type", value: data?.demoApproach },
        {
          label: "Demo Date",
          value: data?.demoDate,
        },
        {
          label: "Demo Time",
          value: data?.demoTime || "N/A",
        },
        { label: "Demo Contact", value: data?.demoContact },
        { label: "Presenter", value: data?.presenterNames?.join(", ") },

        { label: "Demo Outcome", value: data?.demoOutcome },
        { label: "Demo Feedback", value: data?.demoFeedback },
        {
          label: "Address",
          value:
            typeof data?.address === "object" && data?.address !== null
              ? Object.values(data.address).filter(Boolean).join(", ")
              : data?.address || "N/A",
        },
      ],
      dates: {
        created: new Date(data?.dateCreated || "").toLocaleDateString("en-GB"),
        updated: isNaN(new Date(data?.dateUpdated || "").getTime())
          ? "N/A"
          : new Date(data?.dateUpdated || "").toLocaleDateString("en-GB"),
      },
    },
  };

  const handleDeleteDemo = async () => {
    setShowConfirm(false);
    setLoading(true);
    try {
      const response = await api.delete(`SalesDemo/with-items/${id}`);
      if (response) {
        navigate(-1);
      }
    } catch (error: any) {
      console.error("Error deleting opportunity:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (status: string) => {
    if (!id) return;
    try {
      const cleanedFormData = originalData || data || {};
      const demoData = data;
      const formData = data || {};
      const productsArr = products || [];
      const getItemIdByName = (name: string) => {
        const found = productsArr.find((p: any) => p.itemName === name);
        return found ? found.itemId : undefined;
      };
      const demoPayload = {
        DemoName: cleanedFormData.demoName || "",
        Status: status,
        DemoDate: cleanedFormData.demoDate
          ? new Date(cleanedFormData.demoDate).toISOString()
          : new Date().toISOString(),
        DemoContact: cleanedFormData.demoContact || data?.demoContact || "",
        DemoApproach: cleanedFormData.demoApproach || data?.demoApproach || "",
        DemoOutcome: cleanedFormData.demoOutcome || data?.demoOutcome || "",
        DemoFeedback: cleanedFormData.demoFeedback || data?.demoFeedback || "",
        CustomerName: cleanedFormData.customerName || data?.customerName || "",
        Comments: cleanedFormData.comments || data?.comments || "",
        UserId: 1,
        Address:
          cleanedFormData.address ||
          cleanedFormData.Address ||
          data?.address ||
          "",
        AddressId: 1,
        OpportunityId:
          demoData?.opportunityId ||
          cleanedFormData.opportunityId ||
          data?.opportunityId ||
          "",
        ContactMobileNum: cleanedFormData.contactMobileNum || "",
        PresenterIds:
          cleanedFormData.presenterId || cleanedFormData.presenterIds || [],
        LeadId: 51,
      };
      const itemsPayload = productsArr.map((product: any) => {
        const IncludedChildItemIds = Array.isArray(product.productAccessories)
          ? product.productAccessories
            .map((acc: any) =>
              typeof acc === "object" && acc !== null && acc.itemName
                ? getItemIdByName(acc.itemName)
                : typeof acc === "string"
                  ? getItemIdByName(acc)
                  : undefined
            )
            .filter((id: any) => typeof id === "number")
          : [];
        return {
          Id: 0,
          UserCreated: user?.userId,
          DateCreated: new Date().toISOString(),
          UserUpdated: user?.userId,
          DateUpdated: new Date().toISOString(),
          Qty: product.qty || 0,
          Amount: product.amount || 0,
          IsActive: true,
          ItemId: product.itemId || 0,
          Stage: product.stage || "Demo",
          UnitPrice: product.unitPrice || 0,
          IncludedChildItemIds,
          AccessoriesIds: [],
        };
      });
      const requestBody = {
        Demo: demoPayload,
        Items: itemsPayload,
      };
      await api.put(`SalesDemo/with-items/${id}`, requestBody);
      setData((prev: any) => (prev ? { ...prev, status } : prev));
    } catch (err) {
      alert(`Failed to update status to ${status}`);
    }
  };

  const handleEditDemo = () => {
    setModal(true);
  };

  const handleUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      setLoading(true);
      try {
        for (const file of Array.from(files)) {
          const formData = new FormData();
          formData.append('file', file);

          const response = await fetch(`${api.getBaseUrl()}Storage/upload/Demo`, {
            method: 'POST',
            body: formData,
          });

          if (response.ok) {
            const result = await response.json();
            console.log('File uploaded:', result.fileName);
          }
        }
        alert('Files uploaded successfully!');
      } catch (error) {
        console.error('Upload failed:', error);
        alert('Upload failed. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-600">
          {error}
        </div>
      </div>
    );
  }

  //   if (!data) {
  //     return (
  //       <div className="flex items-center justify-center min-h-screen">
  //         <div className="text-gray-500">No lead data found</div>
  //       </div>
  //     );
  //   }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="sticky top-[64.16px] p-2 z-30 bg-white shadow flex justify-between items-center">
        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <FiArrowLeft
            className="text-xl text-gray-600 hover:text-orange-500"
            onClick={() => {
              navigate(-1);
            }}
          />
        </button>
        <h1 className="text-2xl font-bold text-slate-800">Demo Management</h1>

        <div
          className="flex justify-between gap-2 text-left items-center"
          ref={menuRef}
        >
          {/* Status Actio.n Buttons */}
          {/* <div className="flex gap-2 mr-4">
            <button
              className="px-3 py-2 rounded-md bg-yellow-500 text-white font-semibold hover:bg-yellow-600 transition-colors"
              onClick={() => handleStatusUpdate("Cancelled")}
              disabled={data?.status === "Cancelled"}
            >
              Cancel
            </button>
            <button
              className="px-3 py-2 rounded-md bg-green-600 text-white font-semibold hover:bg-green-700 transition-colors"
              onClick={() => handleStatusUpdate("Demo Scheduled")}
              disabled={data?.status === "Demo Scheduled"}
            >
              Approve
            </button>
            <button
              className="px-3 py-2 rounded-md bg-blue-700 text-white font-semibold hover:bg-blue-800 transition-colors"
              onClick={() => handleStatusUpdate("Demo Completed")}
              disabled={data?.status === "Demo Completed"}
            >
              Complete
            </button>
          </div> */}
          {/* Print, Edit, Delete Buttons */}
          <div className="relative flex gap-2">
            <button
              onClick={() => setIsOpenPrint((prev) => !prev)}
              className="p-2 hover:bg-gray-200"
            >
              <FaPrint className="w-5 h-5" />
            </button>
            {isOpenPrint && (
              <div className="absolute right-0 mt-2 w-40 bg-white border rounded shadow-lg z-50">
                <button
                  className="px-4 py-2 w-full rounded-lg hover:bg-sky-600 transition-colors duration-200 flex items-center justify-start gap-2"
                  onClick={() => {
                    setShowWhomPrint(true);
                    setIsOpenPrint(false);
                  }}
                >
                  <span>To Whom So Ever</span>
                </button>
                <button
                  className="px-4 py-2 w-full rounded-lg hover:bg-sky-600 transition-colors duration-200 flex items-center justify-start gap-2"
                  onClick={() => {
                    setShowEWayBillPrint(true);
                    setIsOpenPrint(false);
                  }}
                >
                  <span>EWay Bill</span>
                </button>
                <button
                  className="px-4 py-2 w-full rounded-lg hover:bg-sky-600 transition-colors duration-200 flex items-center justify-start gap-2"
                  onClick={() => {
                    setShowDemoReport(true);
                    setIsOpenPrint(false);
                  }}
                >
                  <span>Demo Report</span>
                </button>
              </div>
            )}
            <button
              onClick={handleUpload}
              className="flex items-center gap-1 px-3 py-2 rounded-md text-white bg-green-500 hover:bg-green-600"
            >
              <FaUpload className="text-lg" />
              Upload
            </button>
            <button
              onClick={handleEditDemo}
              className="flex items-center gap-1 px-3 py-2 rounded-md text-white bg-blue-500 hover:bg-blue-600"
            >
              <MdEdit className="text-lg" />
              Edit
            </button>
            {/* <button
              onClick={() => setShowConfirm(true)}
              className="flex items-center gap-1 px-3 py-2 rounded-md text-white bg-red-500 hover:bg-red-600"
            >
              <FaTrash className="text-lg" />
              Delete
            </button> */}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6 mt-[70px] mx-auto">
        <div className="space-y-6 relative z-10">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-2 border-b pb-2 border-blue-100">
            <div className="flex items-center gap-3 mb-2 sm:mb-0">
              <div>
                <h2 className="flex items-center gap-3 text-2xl font-extrabold tracking-tight">
                  <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 text-white shadow-lg">
                    <MdBusinessCenter className="text-2xl" />
                  </span>
                  <span className="text-blue-800">General Information</span>
                </h2>
                <div className="text-slate-800 font-semibold text-lg truncate">
                  {generalInfoSection.title || "—"}
                </div>
              </div>
            </div>
            {/* Status Tag with Tooltip */}
            <div className="mt-3 sm:mt-0 flex items-center gap-2 group relative">
              <span
                className={`px-4 py-1 rounded-full text-base font-bold shadow border border-blue-100 transition-colors duration-200 cursor-pointer
                         ${generalInfoSection.status === "Demo Scheduled"
                    ? "bg-green-100 text-green-700"
                    : generalInfoSection.status === "Demo Requested"
                      ? "bg-yellow-100 text-yellow-700"
                      : generalInfoSection.status === "In Progress"
                        ? "bg-blue-100 text-blue-700"
                        : generalInfoSection.status === "Lost" ||
                          generalInfoSection.status === "Failed"
                          ? "bg-red-100 text-red-700"
                          : "bg-slate-100 text-slate-700"
                  }
                       `}
              >
                {generalInfoSection.status || "—"}
              </span>
              <span className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-max bg-black text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 shadow-lg">
                Status of this opportunity
              </span>
            </div>
          </div>

          {/* Main Info Two-Column Layout */}
          <div className="bg-white border border-blue-100 rounded-xl p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
              {generalInfoSection.details.mainInfo.map((item, index) => (
                <div
                  key={index}
                  className="flex flex-col sm:flex-row sm:items-center mb-2"
                >
                  <span className="font-bold text-slate-800 min-w-[150px] sm:w-44 block">
                    {item.label}:
                  </span>
                  <span className="text-slate-700 text-base ml-0 sm:ml-2 mt-1 sm:mt-0">
                    {typeof item.value === "object"
                      ? Object.values(item.value).filter(Boolean).join(", ")
                      : item.value !== "null" &&
                        item.value !== undefined &&
                        item.value !== null
                        ? item.label.toLowerCase().includes("date")
                          ? new Date(item.value).toLocaleDateString("en-GB")
                          : item.value
                        : "N/A"}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Comments Section with Divider and Icon */}
          {data?.comments && (
            <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 mt-2">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-blue-500 text-lg">💬</span>
                <span className="text-sm font-semibold text-blue-700">
                  Comments
                </span>
                <span className="flex-1 border-t border-blue-200 ml-2" />
              </div>
              <p className="text-slate-700 text-sm mt-1">{data.comments}</p>
            </div>
          )}

          {/* Dates */}
          <div className="flex justify-between text-xs text-slate-400 mt-2">
            <div className="flex items-center gap-1">
              <MdDateRange className="inline-block mr-1 text-blue-300" />
              Created: {generalInfoSection.details.dates.created || "—"}
            </div>
            {generalInfoSection.details.dates.updated && (
              <div className="flex items-center gap-1">
                <MdDateRange className="inline-block mr-1 text-blue-300" />
                Updated: {generalInfoSection.details.dates.updated}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md border border-slate-200 mt-6">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-slate-800 mb-4">Products</h2>
          {products.length === 0 ? (
            <div className="text-gray-500 text-sm p-8 bg-gray-50 rounded-xl border border-dashed border-gray-300 text-center">
              No products found for this demo.
            </div>
          ) : (
            <div className="border rounded-xl overflow-hidden bg-white shadow-sm">
              <OpportunityProducts
                isEdit={false}
                product={{
                  items: products.map((item: any) => ({
                    ...item,
                    bomId: item.bomId || item.itemId || item.id,
                    bomName: item.bomName || item.itemName || item.name,
                    bomType: item.bomType || item.categoryName || "Product",
                    quantity: item.quantity || item.qty || 1,
                    bomChildItems: (item.bomChildItems || item.childItems || []).map((child: any) => ({
                      ...child,
                      id: child.id || child.childItemId || 0,
                      itemId: child.itemId || child.childItemId || child.id || 0,
                    })),
                    accessoryItems: (item.accessoryItems || item.accessoriesItems || []).map((acc: any) => ({
                      ...acc,
                      itemId: acc.itemId || acc.id || 0,
                      parentChildItemId: acc.parentChildItemId ?? null,
                    })),
                  }))
                }}
              />
            </div>
          )}
        </div>
      </div>

      {/* {renderStatusCards()} */}
      <div className="bg-white rounded-xl mt-6  shadow-lg overflow-hidden p-2">
        <Tab
          tabData={demoTab}
          borderColor="border-orange-500"
          textColor="text-orange-500"
          active={demoTab[0].label}
        />
      </div>
      <Modal isOpen={modal} onClose={() => setModal(false)} title="Demo">
        <DemoForm
          onClose={() => setModal(false)}
          demoData={{
            ...data,
            opportunityId: data?.opportunityId || oppUID || "",
            oppuserfrndID: oppUID,
            presenterName: data?.presenterNames,
          }}
          demogeneralData={data}
          product={products}
          options={products}
          checklistNamesByItemId={checklistNamesByItemId || {}}
          checklistsFromApi={
            Array.isArray((originalData as any)?.checklists)
              ? (originalData as any).checklists
              : Array.isArray((originalData as any)?.checklistsFromApi)
                ? (originalData as any).checklistsFromApi
                : Array.isArray((originalData as any)?.checklists)
                  ? (originalData as any).checklists
                  : Array.isArray((originalData as any)?.checklists)
                    ? (originalData as any).checklists
                    : []
          }
        />
      </Modal>

      {/* To Whom So Ever Print Modal */}
      <Modal isOpen={showWhomPrint} onClose={() => setShowWhomPrint(false)}>
        <div id="whom-print-area">
          <ToWhomSoEverPrint />
        </div>
        <div className="flex flex-col items-end mb-4">
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 mb-2"
            onClick={handlePrintWhom}
          >
            <FaPrint className="inline-block mr-2" /> Print
          </button>
        </div>
      </Modal>

      {/* EWay Bill Print Modal */}
      <Modal
        isOpen={showEWayBillPrint}
        onClose={() => setShowEWayBillPrint(false)}
      >
        <div id="ewaybill-print-area">
          <EWayBill />
        </div>
        <div className="flex flex-col items-end mb-4">
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 mb-2"
            onClick={handlePrintEWayBill}
          >
            <FaPrint className="inline-block mr-2" /> Print
          </button>
        </div>
      </Modal>

      {/* Demo Report Print Modal */}
      <Modal
        isOpen={showDemoReport}
        onClose={() => setShowDemoReport(false)}
        title="Demo Report"
      >
        <div id="demo-report-area" style={{ fontFamily: 'Arial, sans-serif', fontSize: '12px', lineHeight: '1.4', padding: '20px', backgroundColor: 'white', maxWidth: '800px', margin: '0 auto' }}>
          {/* Header */}
          <div style={{ backgroundColor: '#d2691e', color: 'white', padding: '8px', textAlign: 'center', fontWeight: 'bold', fontSize: '12px', marginBottom: '10px' }}>
            Laparoscope ■ Cystoscope ■ Ureteroscope ■ Fetal Monitor ■ S.I. PUMP
          </div>

          {/* Company Info */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px', padding: '10px', border: '1px solid #ccc' }}>
            <div style={{ fontSize: '11px', lineHeight: '1.4' }}>
              <div><strong>ALPHA</strong> - Cystoscopy, Hysteroscopy, APC, Saline-TUR</div>
              <div><strong>HOSPINZ</strong> - Laparoscope Instruments, VET, Saline</div>
              <div><strong>RICHARD WOLF</strong> - Germany - Urology</div>
            </div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#228B22' }}>
              JBS meditec India (P) Ltd.
            </div>
          </div>

          {/* Report Title and Date */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div style={{ textAlign: 'center', fontSize: '16px', fontWeight: 'bold', textDecoration: 'underline', flex: 1 }}>
              Demonstration Report
            </div>
            <div style={{ fontSize: '12px', fontWeight: 'bold' }}>
              Date : {data?.demoDate ? new Date(data.demoDate).toLocaleDateString('en-GB') : '_______________'}
            </div>
          </div>

          {/* Form Fields */}
          <div style={{ marginBottom: '15px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '15px' }}>
              <span style={{ fontWeight: 'bold', width: '180px', fontSize: '12px' }}>1. Customer Address</span>
              <span style={{ fontWeight: 'bold', marginRight: '10px' }}>:</span>
              <div style={{ flex: 1, borderBottom: '1px solid #000', minHeight: '18px', paddingLeft: '5px', fontSize: '11px' }}>
                {typeof data?.address === 'object' && data?.address !== null
                  ? Object.values(data.address).filter(Boolean).join(', ')
                  : data?.address || ''}
              </div>
            </div>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '15px' }}>
              <span style={{ fontWeight: 'bold', width: '180px', fontSize: '12px' }}>2. Product Details</span>
              <span style={{ fontWeight: 'bold', marginRight: '10px' }}>:</span>
              <div style={{ flex: 1, borderBottom: '1px solid #000', minHeight: '18px', paddingLeft: '5px', fontSize: '11px' }}>
                {products?.map(p => p.itemName).join(', ') || ''}
              </div>
            </div>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '15px' }}>
              <span style={{ fontWeight: 'bold', width: '180px', fontSize: '12px' }}>3. Unit Serial No</span>
              <span style={{ fontWeight: 'bold', marginRight: '10px' }}>:</span>
              <div style={{ flex: 1, borderBottom: '1px solid #000', minHeight: '18px', paddingLeft: '5px' }}></div>
            </div>
          </div>

          {/* Case Details */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ fontWeight: 'bold', fontSize: '12px', marginBottom: '8px' }}>4. Case Details</div>
            <div style={{ fontWeight: 'bold', fontSize: '12px', marginBottom: '8px', marginLeft: '20px' }}>(a) Case Speciality :</div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '5px 20px', marginLeft: '40px', fontSize: '11px', marginBottom: '15px' }}>
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

            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px', marginLeft: '20px' }}>
              <span style={{ fontWeight: 'bold', fontSize: '12px', width: '160px' }}>Any Other Pls Specify :</span>
              <div style={{ flex: 1, borderBottom: '1px solid #000', minHeight: '18px' }}></div>
            </div>

            <div style={{ fontWeight: 'bold', fontSize: '12px', marginBottom: '8px', marginLeft: '20px' }}>(b) Case Type :</div>
            <div style={{ display: 'flex', gap: '30px', marginLeft: '40px', fontSize: '11px', marginBottom: '15px' }}>
              <div>☐ Laparoscope</div>
              <div>☐ Endoscopy</div>
              <div>☐ Open Surgery</div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', marginLeft: '20px' }}>
              <span style={{ fontWeight: 'bold', fontSize: '12px', width: '200px' }}>(c) Case Duration (Time h/mins) :</span>
              <div style={{ flex: 1, borderBottom: '1px solid #000', minHeight: '18px' }}></div>
            </div>
          </div>

          {/* Demo Type */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ fontWeight: 'bold', fontSize: '12px', marginBottom: '8px' }}>5. Demo Type :</div>
            <div style={{ display: 'flex', gap: '30px', marginLeft: '40px', fontSize: '11px' }}>
              <div>☐ Case demo</div>
              <div>☐ Table demo</div>
              <div>☐ Tender demo</div>
            </div>
          </div>

          {/* Product Performance */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ fontWeight: 'bold', fontSize: '12px', marginBottom: '8px' }}>6. Product Performance :</div>
            <div style={{ display: 'flex', gap: '20px', marginLeft: '40px', fontSize: '11px' }}>
              <div>☐ Excellent</div>
              <div>☐ Satisfactory</div>
              <div>☐ Good</div>
              <div>☐ Not Satisfactory</div>
            </div>
          </div>

          {/* Customer Feedback */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ fontWeight: 'bold', fontSize: '12px', marginBottom: '5px' }}>7. Customer Utility Feedback:</div>
            <div style={{ border: '1px solid #000', minHeight: '60px', padding: '5px', fontSize: '11px' }}>
              {data?.demoFeedback || ''}
            </div>
          </div>

          {/* Executive Report */}
          <div style={{ marginBottom: '40px' }}>
            <div style={{ fontWeight: 'bold', fontSize: '12px', marginBottom: '5px' }}>8. Executive Report :</div>
            <div style={{ border: '1px solid #000', minHeight: '80px', padding: '5px', fontSize: '11px' }}>
              {data?.comments || ''}
            </div>
          </div>

          {/* Signatures */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '40px', marginBottom: '30px' }}>
            <div style={{ textAlign: 'center', width: '45%' }}>
              <div style={{ borderBottom: '1px solid #000', height: '60px', marginBottom: '10px' }}></div>
              <div style={{ fontWeight: 'bold', fontSize: '11px' }}>Seal & Signature of the Doctor</div>
            </div>
            <div style={{ textAlign: 'center', width: '45%' }}>
              <div style={{ borderBottom: '1px solid #000', height: '60px', marginBottom: '10px' }}></div>
              <div style={{ fontWeight: 'bold', fontSize: '11px' }}>Name & Signature of the Executive</div>
            </div>
          </div>

          {/* Address Footer */}
          <div style={{ textAlign: 'center', fontSize: '10px', marginBottom: '10px', fontWeight: 'bold' }}>
            Sri Ragavendra Tower, 3rd Floor, No.34, Co-operative E-colony, Villankarichal Road, Coimbatore – 641035<br />
            Ph: 9443367915, 9443367952, E-mail: info@jbsmeditec.com
          </div>

          {/* Footer */}
          <div style={{ backgroundColor: '#2F4F4F', color: 'white', padding: '8px', textAlign: 'center', fontSize: '11px' }}>
            Diathermy ■ Alligature ■ Argo Plasma Coagulator (APC) ■ Saline-TUR
          </div>
        </div>
        <div className="flex flex-col items-end mb-4">
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 mb-2"
            onClick={handlePrintDemoReport}
          >
            <FaPrint className="inline-block mr-2" /> Print
          </button>
        </div>
      </Modal>
      <ConfirmBox
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onDelete={handleDeleteDemo}
        title="Delete Demo"
        id={""}
      />

      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        style={{ display: 'none' }}
        multiple
        accept="*/*"
      />
    </div>
  );
};

export default DemoView;
