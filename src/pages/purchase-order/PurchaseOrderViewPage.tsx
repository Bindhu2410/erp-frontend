import React, { useEffect, useRef, useState } from "react";
import InvoiceForm from "./InvoiceForm";

import api from "../../services/api";
import { useLocation, useNavigate } from "react-router-dom";
import { InvoiceList } from "./InvoiceList";
import { DeliveryManagement } from "./DeliveryManagement";
import axios from "axios";
import Modal from "../../components/common/Modal";
import PurchaseOrderPrint from "./POPrintTemplate";
import { DeliveryForm } from "./DeliveryForm";
import { toast } from "react-toastify";
import OrderAcceptancePrintTemplate from "../quotation/OrderAcceptancePrintTemplate";
import { FaPrint } from "react-icons/fa";
import { error } from "console";
import purchaseOrderService from "../../services/purchaseOrderService";
import { IoMdSend } from "react-icons/io";
import { FiUpload } from "react-icons/fi";

// Demo Invoice Template Component
function DemoInvoiceTemplate() {
  return (
    <div
      className="demo-invoice-container"
      style={{
        padding: "20px",
        fontSize: "12px",
        fontFamily: "Arial, sans-serif",
        lineHeight: "1.5",
        width: "100%",
        maxWidth: "210mm",
        margin: "0 auto",
        backgroundColor: "#fff",
        color: "#000",
      }}
    >
      {/* Header */}
      <div
        style={{
          textAlign: "center",
          marginBottom: "15px",
          borderBottom: "2px solid #000",
          paddingBottom: "10px",
        }}
      >
        <h2
          style={{
            margin: "0 0 3px 0",
            fontWeight: "bold",
            fontSize: "16px",
            lineHeight: "1.2",
          }}
        >
          JBS MEDITEC INDIA PRIVATE LIMITED
        </h2>
        <p style={{ margin: "2px 0", fontSize: "10px" }}>
          Sri Ragavendra Tower, 3rd Floor, Site No-34 Co-Operative EColony,
        </p>
        <p style={{ margin: "2px 0", fontSize: "10px" }}>
          Vilankurichi, Coimbatore - 641035. Tamil Nadu.
        </p>
        <p style={{ margin: "2px 0", fontSize: "10px" }}>
          Phone - 0422-2665030, 2665031, 9443367915.
        </p>
        <p style={{ margin: "2px 0", fontSize: "10px" }}>
          Email: info@jbsmediitec.com
        </p>
      </div>

      {/* Invoice Title */}
      <h3
        style={{
          textAlign: "center",
          fontSize: "18px",
          fontWeight: "bold",
          margin: "12px 0",
          letterSpacing: "2px",
        }}
      >
        INVOICE
      </h3>

      {/* Customer and Invoice Details - Two Column Layout */}
      <table
        style={{
          width: "100%",
          marginBottom: "15px",
          borderCollapse: "collapse",
          tableLayout: "fixed",
        }}
      >
        <tbody>
          <tr>
            <td
              style={{
                border: "1px solid #000",
                padding: "8px",
                width: "50%",
                verticalAlign: "top",
              }}
            >
              <p
                style={{
                  margin: "0 0 5px 0",
                  fontWeight: "bold",
                  fontSize: "11px",
                }}
              >
                M/s. ARUN HOSPITAL-ERODE
              </p>
              <p style={{ margin: "2px 0", fontSize: "10px" }}>
                NEAR MUNICIPAL COLONY,
              </p>
              <p style={{ margin: "2px 0", fontSize: "10px" }}>
                EDAYANKATTUVALASU,
              </p>
              <p style={{ margin: "2px 0", fontSize: "10px" }}>ERODE-638011</p>
              <p style={{ margin: "5px 0 0 0", fontSize: "9px" }}>
                <strong>GSTIN NO:</strong> GST NO:
              </p>
            </td>
            <td
              style={{
                border: "1px solid #000",
                padding: "8px",
                width: "50%",
                verticalAlign: "top",
              }}
            >
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  tableLayout: "fixed",
                }}
              >
                <tbody>
                  <tr>
                    <td
                      style={{
                        fontWeight: "bold",
                        fontSize: "10px",
                        width: "40%",
                        paddingBottom: "3px",
                      }}
                    >
                      Invoice No.
                    </td>
                    <td
                      style={{
                        textAlign: "right",
                        fontSize: "10px",
                        paddingBottom: "3px",
                      }}
                    >
                      RD/25-26/037
                    </td>
                  </tr>
                  <tr>
                    <td
                      style={{
                        fontWeight: "bold",
                        fontSize: "10px",
                        paddingBottom: "3px",
                      }}
                    >
                      Date:
                    </td>
                    <td
                      style={{
                        textAlign: "right",
                        fontSize: "10px",
                        paddingBottom: "3px",
                      }}
                    >
                      22/12/2025
                    </td>
                  </tr>
                  <tr>
                    <td
                      colSpan={2}
                      style={{
                        paddingTop: "8px",
                        paddingBottom: "3px",
                        fontWeight: "bold",
                        fontSize: "9px",
                      }}
                    >
                      Our Bank details for NEFT/RTGS
                    </td>
                  </tr>
                  <tr>
                    <td
                      colSpan={2}
                      style={{ paddingBottom: "2px", fontSize: "9px" }}
                    >
                      <strong>Name</strong> : M/s.JBS mediitec India (P) Ltd.,
                    </td>
                  </tr>
                  <tr>
                    <td
                      colSpan={2}
                      style={{ paddingBottom: "2px", fontSize: "9px" }}
                    >
                      <strong>Banker</strong> : Bank of India
                    </td>
                  </tr>
                  <tr>
                    <td
                      colSpan={2}
                      style={{ paddingBottom: "2px", fontSize: "9px" }}
                    >
                      <strong>Branch</strong> : Coimbatore Main Branch
                    </td>
                  </tr>
                  <tr>
                    <td
                      colSpan={2}
                      style={{ paddingBottom: "2px", fontSize: "9px" }}
                    >
                      <strong>A/c No</strong> : 820030110000018
                    </td>
                  </tr>
                  <tr>
                    <td colSpan={2} style={{ fontSize: "9px" }}>
                      <strong>IFSC Code</strong> : BKID0008200
                    </td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>
        </tbody>
      </table>

      {/* Items Table */}
      <table
        style={{
          width: "100%",
          marginBottom: "15px",
          borderCollapse: "collapse",
          tableLayout: "fixed",
        }}
      >
        <thead>
          <tr style={{ backgroundColor: "#f0f0f0" }}>
            <th
              style={{
                border: "1px solid #000",
                padding: "6px",
                textAlign: "center",
                fontWeight: "bold",
                fontSize: "10px",
                width: "6%",
              }}
            >
              S.No.
            </th>
            <th
              style={{
                border: "1px solid #000",
                padding: "6px",
                textAlign: "left",
                fontWeight: "bold",
                fontSize: "10px",
                width: "46%",
              }}
            >
              Description of Material
            </th>
            <th
              style={{
                border: "1px solid #000",
                padding: "6px",
                textAlign: "center",
                fontWeight: "bold",
                fontSize: "10px",
                width: "12%",
              }}
            >
              HSN Code
            </th>
            <th
              style={{
                border: "1px solid #000",
                padding: "6px",
                textAlign: "center",
                fontWeight: "bold",
                fontSize: "10px",
                width: "10%",
              }}
            >
              Qty
            </th>
            <th
              style={{
                border: "1px solid #000",
                padding: "6px",
                textAlign: "right",
                fontWeight: "bold",
                fontSize: "10px",
                width: "16%",
              }}
            >
              Amount
            </th>
          </tr>
        </thead>
        <tbody>
          <tr style={{ height: "50px" }}>
            <td
              style={{
                border: "1px solid #000",
                padding: "6px",
                textAlign: "center",
                fontSize: "10px",
                verticalAlign: "top",
              }}
            >
              1
            </td>
            <td
              style={{
                border: "1px solid #000",
                padding: "6px",
                fontSize: "10px",
                verticalAlign: "top",
              }}
            >
              <strong>FREIGHT CHARGES</strong>
              <br />
              <span style={{ fontSize: "9px", color: "#333" }}>
                (Full Set of Laparoscopy Equipment Set 201R with diathermy)
              </span>
            </td>
            <td
              style={{
                border: "1px solid #000",
                padding: "6px",
                textAlign: "center",
                fontSize: "10px",
                verticalAlign: "top",
              }}
            >
              9965
            </td>
            <td
              style={{
                border: "1px solid #000",
                padding: "6px",
                textAlign: "center",
                fontSize: "10px",
                verticalAlign: "top",
              }}
            >
              1
            </td>
            <td
              style={{
                border: "1px solid #000",
                padding: "6px",
                textAlign: "right",
                fontSize: "10px",
                fontWeight: "bold",
                verticalAlign: "top",
              }}
            >
              3,000.00
            </td>
          </tr>
        </tbody>
      </table>

      {/* Totals Row */}
      <table
        style={{
          width: "100%",
          marginBottom: "15px",
          borderCollapse: "collapse",
          tableLayout: "fixed",
        }}
      >
        <tbody>
          <tr style={{ height: "auto" }}>
            <td
              style={{
                border: "1px solid #000",
                padding: "8px",
                fontWeight: "bold",
                fontSize: "10px",
                width: "34%",
              }}
            >
              Rupees In Words :
            </td>
            <td
              style={{
                border: "1px solid #000",
                padding: "8px",
                fontSize: "10px",
                width: "34%",
              }}
            >
              Rupees Three Thousand only
            </td>
            <td
              style={{
                border: "1px solid #000",
                padding: "8px",
                fontWeight: "bold",
                textAlign: "center",
                fontSize: "10px",
                width: "16%",
              }}
            >
              TOTAL
            </td>
            <td
              style={{
                border: "1px solid #000",
                padding: "8px",
                fontWeight: "bold",
                textAlign: "right",
                fontSize: "10px",
                width: "16%",
              }}
            >
              3,000.00
            </td>
          </tr>
        </tbody>
      </table>

      {/* Notes Section */}
      <div
        style={{
          marginBottom: "15px",
          border: "1px solid #000",
          padding: "8px",
        }}
      >
        <h4
          style={{ margin: "0 0 5px 0", fontWeight: "bold", fontSize: "10px" }}
        >
          Note :
        </h4>
        <ol
          style={{
            margin: "0",
            paddingLeft: "18px",
            fontSize: "9px",
            lineHeight: "1.4",
          }}
        >
          <li>
            Interest @ 18% per annum will be charged on bill if it not paid
            within 30 days.
          </li>
          <li>Subject to Coimbatore Jurisdiction.</li>
          <li>
            Payment should be given by Cheque/DD In Favour of JBS Mediitec
            India(P) Ltd..
          </li>
        </ol>
      </div>

      {/* Footer Section */}
      <table
        style={{
          width: "100%",
          marginTop: "20px",
          borderCollapse: "collapse",
          tableLayout: "fixed",
        }}
      >
        <tbody>
          <tr style={{ verticalAlign: "top" }}>
            <td
              style={{
                width: "50%",
                textAlign: "center",
                paddingRight: "10px",
              }}
            >
              <div
                style={{
                  border: "1px solid #000",
                  padding: "10px",
                  minHeight: "60px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <img
                  src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAZQAAAGWCAYAAABqqAeMAAAIRklEQVR4nO3dQW/bOBCG4cL//4XbXhNgSRqH7mV2kdvOImWZdqaKzpzRxyMIkchlOYgMh5QV+/KUW2A7AAfk0DKEE7VDSDOEm51X6xkMIEFKpMj1RY2GMaBnURwYqVOKhC/5QrGQK98BXiQK8CJRgBeJArxIFOBFogAvEgV4kSjAi0QBXiQK8CJRgBeJArxIFOBFogAvEgV4kSjAi0QBXiQK8CJRgBeJArxIFOBFogAvEgV4kSjAi0QBXiQK8CJRgBeJArxIFOBFogAvEgV4kSjAi0QBXiQK8CJRgBeJArxIFOBFogAvEgV4kSjAi0QBXiQK8CJRgBeJArxIFOBFogAvEgV4kSjAi0QBXiQK8CJRgBeJArxIFOBFogAvEgV4kSjAi0QBXiQK8CJRgBeJArxIFOBFogAvEgV4kSjAi0QBXiQK8CJRgBeJArxIFOBFogAvEgV4kSjAi0QBXiQK8CJRgBeJArxIFOBFogAvEgV4kSjAi0QBXiQK8CJRgBeJArxIFOBFogAvEgV4kSjAi0QBXiQK8CJRgBeJArxIFOBFogAvEgV4kSjAi0QBXiQK8CJRgBeJArxIFOBFogAvEgV4kSjAi0QBXiQK8CJRgBeJArxIFOBFogAvEgV4kSjAi0QBXiQK8CJRgBeJArxIFOBFogAvEgV4kSjAi0QBXiQK8CJRgBeJArxIFOBFogAvEgV4kSjAi0QBXiQK8CJRgBeJArxIFOBFogAvEgV4kSjAi0QBXiQK8CJRgBeJArxIFOBFogAvEgV4kSjAi0QBXiQK8CJRgBeJArxIFOBFogAvEgV4kSjAi0QBXiQK8CJRgBeJArxIFOBFogAvEgV4kSjAi0QBXiQK8CJRgBeJArxIFOBFogAvEgV4kSjAi0QBXiQK8CJRgBeJArxIFOBFogAvEgV4kSjAi0QBXiQK8CJRgBeJArxIFOBFogAvEgV4kSjAi0QBXiQK8CJRgBeJArxIFOBFogAvEgV4kSjAi0QBXiQK8CJRgBeJArxIFOBFogAvEgV4kSjAi0QBXiQK8CJRgBeJArxIFOBFogAvEgV4kSjAi0QBXiQK8CJRgBeJArxIFOBFogAvEgV4kSjAi0QBXiQK8CJRgBeJArxIFOBFogAvEgV4kSjAi0QBXiQK8CJRgBeJArxIFOBFogAvEgV4kSjAi0QBXiQK8CJRgBeJArxIFOBFogAvEgV4kSjAi0QBXiQK8CJRgBeJArxIFOBFogAvEgV4kSjAi0QBXiQK8CJRgBeJArxIFOBFogAvEgV4kSjAi0QBXiQK8CJRgBeJArxIFOBFogAvEgV4kSjAi0QBXiQK8CJRgBeJArxIFOBFogAvEgV4kSjAi0QBXiQK8CJRgBeJArxIFOBFogAvEgV4kSjAi0QBXiQK8CJRgBeJArxIFOBFogAvEgV4kSjAi0QBXiQK8CJRgBeJArxIFOBFogAvEgV4kSjAi0QBXiQK8CJRgBeJArxIFOBFogAvEgV4kSjAi0QBXiQK8CJRgBeJArxIFOBFogAvEgV4kSjAi0QBXiQK8CJRgBeJArxIFOBFogAvEgV4kSjAi0QBXiQK8CJRgBeJArxIFOBFogAvEgV4kSjAi0QBXiQK8CJRgBeJArxIFOBFogAvEgV4kSjAi0QBXiQK8CJRgBeJArxIFOBFogAvEgV4kSjAi0QBXiQK8CJRgBeJArxIFOBFogAvEgV4kSjAi0QBXiQK8CJRgBeJArxIFOBFogAvEgV4kSjAi0QBXiQK8CJRgBeJArxIFOBFogAvEgV4kSjAi0QBXiQK8CJRgBeJArxIFOBFogAvEgV4kSjAi0QBXiQK8CJRgBeJArxIFOBFogAvEgV4kSjAi0QBXiQK8CJRgBeJArxIFOBFogAvEgV4kSjAi0QBXiQK8CJRgBeJArxIFOBFogAvEgV4kSjAi0QBXiQK8CJRgBeJArxIFOBFogAvEgV4kSjAi0QBXiQK8CJRgBeJArxIFOBFogAvEgV4kSjAi0QBXiQK8CJRgBeJArxIFOBFogAvEgV4kSjAi0QBXiQK8CJRgBeJArxIFOBFogAvEgV4kSjAi0QBXiQK8CJRgBeJArxIFOBFogAvEgV4kSjAi0QBXiQK8CJRgBeJArxIFOBFogAvEgV4kSjAi0QBXiQK8CJRgBeJArxIFOBFogAvEgV4kSjAi0QBXiQK8CJRgBeJArxIFOBFogAvEgV4kSjAi0QBXiQK8CJRgBeJArxIFOBFogAvEgV4kSjAi0QBXiQK8CJRgBeJArxIFOBFogAvEgV4kSjAi0QBXiQK8CJRgBeJArxIFOBFogAvEgV4kSjAi0QBXiQK8CJRgBeJArxIFOBFogAvEgV4kSjAi0QBXiQK8CJRgBeJArxIFOBFogAvEgV4kSjAi0QBXiQK8CJRgBeJArxIFOBFogAvEgV4kSjAi0QBXiQK8CJRgBeJArxIFOBFogAvEgV4kSjAi0QBXiQK8CJRgBeJArxIFOBFogAvEgV4kSjAi0QBXiQK8CJRgBeJArxIFOBFogAvEgV4kSjAi0QBXiQK8CJRgBeJArxIFOBFogAvEgV4kSjAi0QBXiQK8CJRgBeJArxIFOBFogAvEgV4kSjAi0QBXiQK8CJRgBeJArxIFOBFogAvEgV4kSjAi0QBXv4H6GHRKvW/H6YAAAAASUVORK5CYII="
                  alt="QR Code"
                  style={{
                    width: "70px",
                    height: "70px",
                    objectFit: "contain",
                  }}
                />
              </div>
            </td>
            <td style={{ width: "50%", paddingLeft: "10px" }}>
              <div style={{ paddingTop: "0px" }}>
                <p
                  style={{
                    margin: "5px 0",
                    fontWeight: "bold",
                    fontSize: "10px",
                    textAlign: "center",
                  }}
                >
                  For JBS Meditec India (P) Ltd.,
                </p>
                <div style={{ marginTop: "30px", marginBottom: "5px" }}>
                  <p
                    style={{
                      margin: "0",
                      textAlign: "center",
                      fontSize: "9px",
                      borderTop: "1px solid #000",
                      paddingTop: "3px",
                      letterSpacing: "3px",
                    }}
                  >
                    ___________________
                  </p>
                </div>
                <p
                  style={{
                    margin: "5px 0 0 0",
                    fontWeight: "bold",
                    fontSize: "9px",
                    textAlign: "center",
                  }}
                >
                  Authorised Signatory
                </p>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

const tabs = [
  { id: "overview", label: "Overview" },
  { id: "salesorder", label: "Sales Order" },

  { id: "items", label: "Line Items" },
  { id: "deliveries", label: "Deliveries" },
  { id: "invoices", label: "Invoices" },
];

export default function PurchaseOrderViewPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [orderData, setOrderData] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [invoiceLoading, setInvoiceLoading] = useState(false);
  const [openPO, setOpenPo] = useState(false);
  const [orderAcceptanceId, setOrderAcceptanceId] = useState<string | null>(
    null,
  );
  const [refreshDeliveries, setRefreshDeliveries] = useState(0); // Counter to trigger delivery refresh
  const [showSalesOrderModal, setShowSalesOrderModal] = useState(false);
  const [salesOrderData, setSalesOrderData] = useState<any>(null);
  const [salesOrderLoading, setSalesOrderLoading] = useState(false);
  const [salesOrderError, setSalesOrderError] = useState<string | null>(null);
  // Track if sales order has been auto-generated to avoid duplicate calls
  const [autoGeneratedSO, setAutoGeneratedSO] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [showDemoInvoiceModal, setShowDemoInvoiceModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Fetch sales order by PO when tab is active

  const [purchaseOrderMessage, setPurchaseOrderMessage] = useState<
    string | null
  >(null);
  const [invoiceMessage, setInvoiceMessage] = useState<string | null>(null);
  const navigate = useNavigate();
  // Dummy handlers
  const createInvoice = () => setShowInvoiceModal(true);
  const scheduleDelivery = () => setShowDeliveryModal(true);
  const viewComparison = async () => {
    if (!purchaseOrder?.poId) return;
    if (purchaseOrder?.status === "Accepted") {
      navigate(`/sales/comparison?id=${purchaseOrderId}`);
      return;
    }
    await purchaseOrderService.updateStatus(
      Number(purchaseOrderId),
      "Under Review",
    );
    navigate(`/sales/comparison?id=${purchaseOrderId}`);
  };

  const exportReport = () => { };
  const confirmDeliverySchedule = () => setShowDeliveryModal(false);
  const showDeliveryMap = () => { };
  const initializeTracking = () => { };
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);

  const purchaseOrderId = searchParams.get("id");
  useEffect(() => {
    if (!purchaseOrderId) return; // Prevents invalid API call
    setLoading(true);
    api
      .get(`purchaseorder/${purchaseOrderId}`)
      .then((res) => {
        setOrderData(res.data);
      })
      .catch((err) => {
        if (err.status === 404) {
          toast.error("Purchase order not found.");
          setOrderData({});
        } else {
          toast.error("Failed to fetch purchase order.");
        }
      })
      .finally(() => setLoading(false));
  }, [purchaseOrderId]);
  const purchaseOrder = orderData?.purchaseOrder;
  console.log(purchaseOrder, "po");
  const fetchSalesOrder = async () => {
    if (activeTab !== "salesorder") return; // Avoid fetching if OA just created
    setSalesOrderLoading(true);
    try {
      const res = await api.get(`SalesOrder/by-po/${purchaseOrderId}`);
      if (res.data && !res.data.message) {
        setSalesOrderData(res.data);
        setSalesOrderError(null);
      } else {
        setSalesOrderData(null);
        setSalesOrderError("No sales order found.");
      }
    } catch (err: any) {
      if (err.status === 404) {
        setSalesOrderError("Sales order not found.");
      } else {
        setSalesOrderError(
          `Failed to fetch sales order: ${err.response?.data?.message || err.message
          }`,
        );
        toast.error("Failed to fetch sales order.");
      }
    } finally {
      setSalesOrderLoading(false);
    }
  };
  // Fetch and auto-generate sales order when status is Approved
  useEffect(() => {
    if (activeTab !== "salesorder") return;
    fetchSalesOrder();
  }, [activeTab]);

  // Separate effect for generating SO when PO is approved
  useEffect(() => {
    const generateSalesOrder = async () => {
      if (
        !purchaseOrder?.poId ||
        purchaseOrder.status !== "Approved" ||
        salesOrderData !== null
      )
        return;

      try {
        const soRes = await api.post("SalesOrder/from-purchase-order", {
          purchaseOrderId: purchaseOrder.poId,
          poId: purchaseOrder.poId,
        });
        if (soRes.data) {
          setSalesOrderData(soRes.data);
          setSalesOrderError(null);
          setActiveTab("salesorder");
          toast.success("Sales Order generated successfully!");
        } else {
          throw new Error("No data received from sales order generation");
        }
      } catch (err: any) {
        console.error("Sales order generation error:", err.response);
        const alreadyCreatedMsg =
          "A sales order has already been created for this purchase order";
        const apiMsg = err.response?.data?.message || "";
        console.log(apiMsg, "apiMSG");
        if (err.status === 404) {
          setSalesOrderError("Sales order not found.");
          toast.error("Sales order not found.");
        } else if (apiMsg.startsWith(alreadyCreatedMsg)) {
          // Do not show toast, but you can optionally set error or ignore
          setSalesOrderError(apiMsg);
        } else {
          setSalesOrderError(
            `Failed to auto-generate sales order: ${apiMsg || err.message}`,
          );
          if (salesOrderData !== null) {
            toast.error(
              "Failed to generate Sales Order. Please try again later.",
            );
          }
        }
      }
    };

    generateSalesOrder();
    fetchSalesOrder();
  }, [purchaseOrder?.status]);
  // Fetch invoices when Invoices tab is active
  const printRef = useRef<HTMLDivElement>(null);
  const quotation = orderData?.quotation;
  const quotationItems = orderData?.quotationItems || [];
  const termsAndConditions = orderData?.termsAndConditions?.[0] || {};
  // Calculate total order value from all product amounts in orderData.items
  const itemsTotal =
    orderData?.items && orderData.items.length > 0
      ? orderData.items.reduce((sum: number, bom: any) => {
        const children: any[] = bom.childItems || [];
        const bomTotal =
          children.reduce((s: number, c: any) => {
            const rate = Number(c.quoteRate || c.saleRate || 0);
            const qty = Number(c.quantity || 1);
            const tax = Number(c.tax || 0);
            return s + rate * qty * (1 + tax / 100);
          }, 0) * Number(bom.quantity || 1);
        return sum + bomTotal;
      }, 0)
      : 0;
  const total = itemsTotal;
  useEffect(() => {
    const fetchAndGenerateInvoice = async () => {
      if (
        activeTab === "invoices" &&
        purchaseOrderId &&
        orderData?.quotation?.quotationId &&
        purchaseOrder?.status === "Approved"
      ) {
        setInvoiceLoading(true);
        try {
          console.log("Fetching invoices for PO:", purchaseOrder.poId);
          const res = await api.get(`Invoice/by-po/${purchaseOrder.poId}`);

          if (res.data) {
            // Ensure the data is in array format
            const invoiceData = Array.isArray(res.data) ? res.data : [res.data];
            setInvoices(invoiceData);
            console.log("Existing invoices:", invoiceData);
          } else {
            // No invoices found, generate a new one
            console.log("No invoices found, generating new invoice");
            try {
              const newInvoice = await api.post("Invoice/generate", {
                purchaseOrderId: purchaseOrder.poId,
                poId: purchaseOrder.poId,
                quotationId: orderData.quotation.quotationId,
              });

              if (newInvoice.data) {
                setInvoices([newInvoice.data]);
                toast.success("Invoice generated successfully!");
                console.log("New invoice generated:", newInvoice.data);
              }
            } catch (genError: any) {
              if (genError.is404) return;
              console.error("Invoice generation error:", genError);
              console.error("Error details:", genError.response?.data);

              setInvoices([]);
            }
          }
        } catch (error: any) {
          console.error("Invoice fetch error:", error);
          console.error("Error details:", error.response?.data);
          setInvoices([]);
          // Only show error toast if it's not a 404 error
          if (error.is404) return;
          toast.error("Failed to fetch invoices");
        } finally {
          setInvoiceLoading(false);
        }
      }
    };

    fetchAndGenerateInvoice();
  }, [activeTab, purchaseOrder, quotation, purchaseOrderId, orderData]);

  // Fetch order processing summary
  useEffect(() => {
    const fetchOrderSummary = async () => {
      try {
        const response = await axios.post(
          "http://localhost:5104/api/OrderProcessing/summary/message",
          `"${purchaseOrder?.poId}"`,
          {
            headers: {
              "Content-Type": "application/json",
            }, // assuming this is the PO number you want to query
          },
        );
        if (response.data && response.data.messages) {
          // Process messages array and format dates
          const processedMessages = response.data.messages.map(
            (message: string) => {
              // Extract date from message and format it
              const dateMatch = message.match(/(\d{4}-\d{2}-\d{2})/);
              if (dateMatch) {
                const originalDate = dateMatch[1];
                const [year, month, day] = originalDate.split("-");
                const formattedDate = `${day}-${month}-${year}`;
                return message.replace(originalDate, formattedDate);
              }
              return message;
            },
          );

          // Set the first message as purchase order message
          setPurchaseOrderMessage(processedMessages[0] || "No data available.");
          setInvoiceMessage(response.data.invoiceMessage || "");
        } else if (response.data) {
          // Fallback for old response format
          setPurchaseOrderMessage(
            response.data.message || "No data available.",
          );
          setInvoiceMessage(response.data.invoiceMessage || "");
        }
      } catch (error: any) {
        if (error.response?.status === 404) {
          console.warn("No data available for this PO.");
          setPurchaseOrderMessage("No data available.");
          setInvoiceMessage("No data available.");
        } else {
          console.error("Error fetching order summary:", error);
        }
      }
    };

    if (purchaseOrder?.poId) {
      fetchOrderSummary();
    }
  }, [purchaseOrder?.poId]);

  const handleOrderAcceptance = async () => {
    if (!purchaseOrder?.poId) return;
    try {
      const now = new Date();
      const body = {
        Id: 0,
        OrderAcceptanceId: "",
        UserCreated: 1,
        DateCreated: now.toISOString(),
        UserUpdated: 1,
        DateUpdated: now.toISOString(),
        Subject: "Order Acceptance for Medical Equipment Supply",
        PurchaseOrderId: purchaseOrder.poId,
        SalesOrderId: "string",
        Comments: "",
        FileUrl: "",
        FileName: "",
        QuotationId: "",
      };
      const payload = {
        purchaseOrderId: purchaseOrderId,
      };
      const res = await api.post(
        `OrderAcceptance/create-from-po/${purchaseOrderId}`,
        payload,
      );
      if (res.data && res.data) {
        // setOrderAcceptanceId(res.data.OrderAcceptance.orderAcceptanceId);
        setShowPrintModal(true);
      } else {
        toast.error("Order Acceptance could not be generated.");
      }
    } catch (err) {
      toast.error("Order Acceptance could not be generated.");
    }
  };

  const handlePrint = () => {
    if (printRef.current) {
      const printContents = printRef.current.innerHTML;
      const printWindow = window.open("", "", "height=800,width=900");
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>${"Order Acceptance Print"}</title>
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
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
          printWindow.print();
          printWindow.close();
        }, 500);
      }
    }
  };
  console.log(salesOrderData, "salesOrderData");
  const sendInvoice = () => {
    const to = "brindha@magnusvista.com";
    const subject = "PO from JBS Meditec";
    const fileUrl = `${window.location.origin}/Quotation Print.pdf`; // file in /public
    const body = `Dear Customer,\n\nPlease find your PO attached.Best regards,\nJBS Meditec`;

    window.open(
      `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(
        to,
      )}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`,
      "_blank",
    );
  };

  const handleViewPO = async () => {
    const poId = purchaseOrder?.poId || purchaseOrderId;
    if (!poId) {
      toast.error('Purchase Order ID not found.');
      return;
    }

    // Convert PO/26-27/03 to PO_26-27_03 to match the stored filename pattern
    const sanitizedPoId = poId.replace(/[/\\:*?"<>|]/g, '_');
    
    try {
      // Since files are stored in C:\JBS\Documents\PurchaseOrders
      // Try the backend endpoint for PO documents
      const downloadUrl = `${api.getBaseUrl()}Storage/download/PurchaseOrders/${sanitizedPoId}`;
      
      try {
        // Try to access the file directly with GET request
        const response = await fetch(downloadUrl);
        
        if (response.ok) {
          // File exists, open it in new tab
          window.open(downloadUrl, '_blank');
          return;
        }
      } catch (error) {
        console.log('Direct access failed:', error);
      }
      
      // If direct access fails, try with common extensions
      const extensions = ['pdf', 'doc', 'docx'];
      
      for (const ext of extensions) {
        const fileUrl = `${api.getBaseUrl()}Storage/download/PurchaseOrders/${sanitizedPoId}.${ext}`;
        try {
          const testResponse = await fetch(fileUrl);
          if (testResponse.ok) {
            window.open(fileUrl, '_blank');
            return;
          }
        } catch (error) {
          continue;
        }
      }
      
      // If no files found, show error
      toast.error(`No uploaded PO document found. Searched for files with pattern: ${sanitizedPoId}`);
      
    } catch (error: any) {
      console.error('Error accessing PO file:', error);
      toast.error('Failed to access uploaded PO document.');
    }
  };

  const handleFileUpload = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf,.doc,.docx,.jpg,.jpeg,.png';
    input.onchange = async (event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (!file) return;

      // Validate file type
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/jpg', 'image/png'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Only PDF, DOC, DOCX, JPG, JPEG, and PNG files are allowed.');
        return;
      }

      // Validate file size (25MB max)
      const maxSize = 25 * 1024 * 1024;
      if (file.size > maxSize) {
        toast.error('File size must be less than 25 MB.');
        return;
      }

      const poId = purchaseOrder?.poId || purchaseOrderId;
      if (!poId) {
        toast.error('Purchase Order ID not found. Cannot upload file.');
        return;
      }

      try {
        const loadingToast = toast.loading('Uploading PO document...');

        // Create FormData for file upload
        const formData = new FormData();

        // Get file extension and original name
        const fileExtension = file.name.split('.').pop() || '';
        const originalName = file.name.replace(`.${fileExtension}`, '');

        // Sanitize PO ID for filename (replace invalid characters)
        const sanitizedPoId = poId.replace(/[/\\:*?"<>|]/g, '_');

        // Create filename with PO ID first: PO_ID_originalname.ext
        // Backend will add GUID, resulting in: PO_ID_GUID_originalname.ext
        const newFileName = `${sanitizedPoId}_${originalName}.${fileExtension}`;

        // Create a new file with the modified name
        const renamedFile = new File([file], newFileName, { type: file.type });
        formData.append('file', renamedFile);

        // Upload to PurchaseOrders folder
        const uploadUrl = `Storage/upload/PurchaseOrders`;
        const response = await api.post(uploadUrl, formData);

        if (response.data) {
          setSelectedFile(file);
          const finalFileName = response.data.storedFileName || response.data.fileName || newFileName;
          toast.update(loadingToast, {
            render: `File uploaded successfully as: ${finalFileName}`,
            type: 'success',
            isLoading: false,
            autoClose: 4000,
          });
          console.log('PO document uploaded:', {
            originalName: file.name,
            sentAs: newFileName,
            storedAs: finalFileName,
            path: response.data.filePath
          });
        } else {
          throw new Error('Upload failed');
        }
      } catch (error: any) {
        console.error('Error uploading PO document:', error);
        const errorMessage = error.response?.data?.message || error.message || 'Failed to upload file';
        toast.error(`Upload failed: ${errorMessage}`);
      }
    };
    input.click();
  };
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Header */}
      <div className="flex justify-end gap-2 p-2 mb-2">
        <button
          className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-xl shadow-md hover:shadow-lg hover:bg-blue-700 transition-all duration-200"
          onClick={handleViewPO}
        >
          View PO
        </button>

        <button
          className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-xl shadow-md hover:shadow-lg hover:bg-green-700 transition-all duration-200"
          onClick={handleFileUpload}
        >
          <FiUpload size={18} />
          Upload PO
        </button>

        {purchaseOrder?.status === "Approved" && (
          <button
            className={`p-2 rounded-md bg-green-500 text-white hover:bg-green-700 border border-green-500 ${!purchaseOrder?.poId ? "opacity-50 cursor-not-allowed" : ""
              }`}
            onClick={handleOrderAcceptance}
            title="Order Acceptance"
            disabled={!purchaseOrder?.poId}
          >
            Print OA
          </button>
        )}

        {/* Show Generate Sales Order button only if not Approved and no sales order exists */}
        {/* Sales Order is auto-generated when status is Approved */}
      </div>
      {/* Sales Order is now auto-generated when status is Approved */}
      {/* Sales Order Tab */}

      <div className="po-overview-header bg-white shadow-lg text-black p-4 rounded-xl mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Purchase Order {purchaseOrder?.poId}
            </h1>
            <p className="opacity-75 ">
              Customer: {quotation?.customerName} | Created:
              {new Date(purchaseOrder?.dateCreated).toLocaleDateString("en-GB")}
            </p>
          </div>
          <div className="text-right mt-4 md:mt-0">
            <span
              className={`status-badge status-processing bg-cyan-600 text-white px-4 py-2 rounded-full font-semibold ${purchaseOrder?.status === "Approved"
                  ? "bg-green-600 hover:bg-green-700"
                  : purchaseOrder?.status === "Rejected"
                    ? "bg-red-600 hover:bg-red-700"
                    : purchaseOrder?.status === "Under Review"
                      ? "bg-yellow-600 hover:bg-yellow-700"
                      : "bg-gray-500 hover:bg-gray-600"
                }`}
            >
              {purchaseOrder?.status}
            </span>
            <div className="mt-2">
              <h3 className="text-2xl font-bold mb-0">
                {total.toLocaleString("en-IN", {
                  style: "currency",
                  currency: "INR",
                })}
              </h3>
              <small className="opacity-75">Total Order Value</small>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      {purchaseOrder?.status !== "Approved" && (
        <div className="action-buttons sticky top-16 z-10 bg-white p-4 rounded-xl shadow mb-8 flex flex-wrap justify-between">
          <div>
            <>
              <button
                className="btn-custom bg-cyan-600 text-white rounded-full px-6 py-3 font-semibold mr-2 mb-2"
                onClick={viewComparison}
              >
                <i className="fas fa-balance-scale mr-2" />
                Compare PO & Quotation
              </button>
            </>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="mb-8">
        <ul className="flex border-b">
          {tabs.map((tab) => (
            <li key={tab.id}>
              <button
                className={`px-6 py-3 font-semibold rounded-t-xl mr-2 focus:outline-none ${activeTab === tab.id
                    ? "bg-orange-500 text-white"
                    : "bg-gray-100 text-gray-600"
                  }`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            </li>
          ))}
        </ul>
        <div className="tab-content mt-8">
          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Stat cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">
                    PO Number
                  </p>
                  <p className="text-base font-black text-orange-500">
                    {purchaseOrder?.poId || "—"}
                  </p>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">
                    Status
                  </p>
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${purchaseOrder?.status === "Approved"
                        ? "bg-green-100 text-green-700"
                        : purchaseOrder?.status === "Open"
                          ? "bg-blue-100 text-blue-700"
                          : purchaseOrder?.status === "Under Review"
                            ? "bg-yellow-100 text-yellow-700"
                            : purchaseOrder?.status === "Cancelled"
                              ? "bg-red-100 text-red-700"
                              : "bg-gray-100 text-gray-600"
                      }`}
                  >
                    {purchaseOrder?.status || "—"}
                  </span>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">
                    Customer
                  </p>
                  <p className="text-sm font-bold text-gray-800">
                    {orderData?.quotationInfo?.customer_name ||
                      quotation?.customerName ||
                      "—"}
                  </p>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">
                    Total Value
                  </p>
                  <p className="text-sm font-black text-orange-600">
                    ₹
                    {total.toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                    })}
                  </p>
                </div>
              </div>

              {/* Order Details + Quotation Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <h5 className="text-sm font-bold text-orange-600 uppercase tracking-wide mb-4 pb-2 border-b border-orange-100">
                    Order Details
                  </h5>
                  <div className="space-y-3">
                    {[
                      { label: "PO Number", value: purchaseOrder?.poId },
                      {
                        label: "Customer",
                        value:
                          orderData?.quotationInfo?.customer_name ||
                          quotation?.customerName,
                      },
                      {
                        label: "GST No.",
                        value:
                          orderData.quotationInfo?.gst_no ||
                          quotation?.gstNo ||
                          "",
                      },
                      {
                        label: "Order Date",
                        value: purchaseOrder?.dateCreated
                          ? new Date(
                            purchaseOrder.dateCreated,
                          ).toLocaleDateString("en-GB")
                          : "N/A",
                      },
                      {
                        label: "Delivery Date",
                        value: purchaseOrder?.deliveryDate
                          ? new Date(
                            purchaseOrder.deliveryDate,
                          ).toLocaleDateString("en-GB")
                          : "N/A",
                      },
                      {
                        label: "Description",
                        value: purchaseOrder?.description,
                      },
                    ].map((row, i) => (
                      <div
                        key={i}
                        className="flex justify-between text-sm border-b border-gray-50 pb-2"
                      >
                        <span className="font-semibold text-gray-500">
                          {row.label}
                        </span>
                        <span className="text-gray-800 font-medium text-right max-w-[60%]">
                          {row.value || "N/A"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <h5 className="text-sm font-bold text-orange-600 uppercase tracking-wide mb-4 pb-2 border-b border-orange-100">
                    Quotation Info
                  </h5>
                  <div className="space-y-3">
                    {[
                      {
                        label: "Quotation ID",
                        value: orderData?.quotationInfo?.quotation_id,
                      },
                      {
                        label: "Quotation Type",
                        value: orderData?.quotationInfo?.quotation_type,
                      },
                      {
                        label: "Quotation Date",
                        value: orderData?.quotationInfo?.quotation_date
                          ? new Date(
                            orderData.quotationInfo.quotation_date,
                          ).toLocaleDateString("en-GB")
                          : "N/A",
                      },
                      {
                        label: "Valid Till",
                        value: orderData?.quotationInfo?.valid_till
                          ? new Date(
                            orderData.quotationInfo.valid_till,
                          ).toLocaleDateString("en-GB")
                          : "N/A",
                      },
                      {
                        label: "Lead ID",
                        value: orderData?.quotationInfo?.lead_id,
                      },
                      {
                        label: "Opportunity ID",
                        value: orderData?.quotationInfo?.opportunity_id,
                      },
                    ].map((row, i) => (
                      <div
                        key={i}
                        className="flex justify-between text-sm border-b border-gray-50 pb-2"
                      >
                        <span className="font-semibold text-gray-500">
                          {row.label}
                        </span>
                        <span className="text-gray-800 font-medium text-right">
                          {row.value || "N/A"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Delivery Address */}
              {orderData?.leadAddress && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <h5 className="text-sm font-bold text-orange-600 uppercase tracking-wide mb-3 pb-2 border-b border-orange-100">
                    Delivery Address
                  </h5>
                  <p className="text-sm text-gray-700">
                    {[
                      orderData.leadAddress.door_no,
                      orderData.leadAddress.street,
                      orderData.leadAddress.area,
                      orderData.leadAddress.city,
                      orderData.leadAddress.district,
                      orderData.leadAddress.state,
                      orderData.leadAddress.pincode,
                    ]
                      .filter(Boolean)
                      .join(", ") || "N/A"}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Invoices Tab */}
          {activeTab === "invoices" && (
            <div className="section-card bg-white rounded-xl shadow p-6">
              <div className="section-header flex justify-between items-center border-b-2 border-orange-200 pb-4 mb-6">
                <h4 className="font-bold text-lg flex items-center text-orange-600">
                  <i className="fas fa-file-invoice-dollar mr-2 text-orange-400" />
                  Invoice Management
                </h4>
                <button
                  className="text-orange-600 hover:text-orange-700 transition text-lg"
                  title="demo invoice"
                  onClick={() => setShowDemoInvoiceModal(true)}
                >
                  <FaPrint />
                </button>
              </div>
              {invoiceLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mb-4"></div>
                  <div className="text-gray-600">
                    {invoices.length === 0
                      ? "Generating invoice..."
                      : "Loading invoices..."}
                  </div>
                </div>
              ) : (
                <>
                  {invoices.length === 0 &&
                    purchaseOrder?.status !== "Approved" ? (
                    <div className="text-center py-8 text-gray-500">
                      Invoices will be automatically generated when the Purchase
                      Order is approved.
                    </div>
                  ) : (
                    <InvoiceList invoices={invoices} />
                  )}
                </>
              )}
            </div>
          )}

          {/* Deliveries Tab */}
          {activeTab === "deliveries" && (
            <div className="section-card bg-white rounded-xl  m-3 shadow p-6 overflow-auto  mt-10">
              <div className="section-header flex justify-between items-center border-b-2 border-orange-200 pb-4 mb-6">
                <h4 className="font-bold text-lg flex items-center text-orange-600">
                  <i className="fas fa-truck mr-2 text-orange-400" />
                  Delivery Management
                </h4>
                <button
                  className="bg-blue-600 text-white rounded-full px-6 py-3 font-semibold"
                  onClick={scheduleDelivery}
                >
                  <i className="fas fa-plus mr-2" />
                  Schedule New Delivery
                </button>
              </div>

              <DeliveryManagement
                purchaseOrderId={orderData.purchaseOrder.poId}
                lineItems={orderData.items || []}
                key={refreshDeliveries} // This will cause the component to remount when refreshDeliveries changes
              />
            </div>
          )}

          {/* Line Items Tab */}
          {activeTab === "items" && (
            <div className="section-card bg-white rounded-xl shadow p-6">
              <div className="section-header border-b-2 border-orange-200 pb-4 mb-6">
                <h4 className="font-bold text-lg flex items-center text-orange-600">
                  <i className="fas fa-list mr-2 text-orange-400" />
                  Purchase Order Line Items
                </h4>
              </div>
              {orderData?.items?.length > 0 ? (
                orderData.items.map((bom: any, bi: number) => {
                  const children: any[] = bom.childItems || [];
                  const bomTotal =
                    children.reduce((s: number, c: any) => {
                      const rate = Number(c.quoteRate || c.saleRate || 0);
                      const qty = Number(c.quantity || 1);
                      const tax = Number(c.tax || 0);
                      return s + rate * qty * (1 + tax / 100);
                    }, 0) * Number(bom.quantity || 1);
                  return (
                    <div key={bi} className="mb-8 last:mb-0">
                      {/* BOM header */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-gray-800">
                            {bom.bomName}
                          </span>
                          <span className="px-2 py-0.5 bg-orange-100 text-orange-700 rounded text-xs font-medium">
                            {bom.bomType}
                          </span>
                        </div>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="table-auto w-full text-sm">
                          <thead className="bg-gray-100">
                            <tr>
                              <th className="px-4 py-2 text-left">Item Code</th>
                              <th className="px-4 py-2 text-left">Item Name</th>
                              <th className="px-4 py-2 text-left">
                                Make / Model
                              </th>
                              <th className="px-4 py-2 text-center">Qty</th>
                              <th className="px-4 py-2 text-center">HSN</th>
                              <th className="px-4 py-2 text-center">Tax %</th>
                              <th className="px-4 py-2 text-right">Rate</th>
                              <th className="px-4 py-2 text-right">Amount</th>
                            </tr>
                          </thead>
                          <tbody>
                            {children.map((c: any, ci: number) => {
                              const rate = Number(
                                c.quoteRate || c.saleRate || 0,
                              );
                              const qty = Number(c.quantity || 1);
                              const tax = Number(c.tax || 0);
                              const amt = rate * qty * (1 + tax / 100);
                              return (
                                <tr
                                  key={ci}
                                  className="hover:bg-gray-50 border-t"
                                >
                                  <td className="px-4 py-2 font-semibold">
                                    {c.itemCode || "N/A"}
                                  </td>
                                  <td className="px-4 py-2">
                                    {c.itemName || "N/A"}
                                  </td>
                                  <td className="px-4 py-2 text-gray-500">
                                    {[c.make, c.model]
                                      .filter(Boolean)
                                      .join(" / ") || "N/A"}
                                  </td>
                                  <td className="px-4 py-2 text-center">
                                    {qty}
                                  </td>
                                  <td className="px-4 py-2 text-center text-gray-500">
                                    {c.hsn || "—"}
                                  </td>
                                  <td className="px-4 py-2 text-center">
                                    {tax}%
                                  </td>
                                  <td className="px-4 py-2 text-right">
                                    ₹
                                    {rate.toLocaleString("en-IN", {
                                      minimumFractionDigits: 2,
                                    })}
                                  </td>
                                  <td className="px-4 py-2 text-right font-semibold">
                                    ₹
                                    {amt.toLocaleString("en-IN", {
                                      minimumFractionDigits: 2,
                                    })}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                          <tfoot className="bg-orange-50">
                            <tr className="border-t-2 border-orange-200">
                              <th colSpan={7} className="px-4 py-2 text-right">
                                Total
                              </th>
                              <th className="px-4 py-2 text-right text-orange-600">
                                ₹
                                {bomTotal.toLocaleString("en-IN", {
                                  minimumFractionDigits: 2,
                                })}
                              </th>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8 text-gray-400">
                  No line items available.
                </div>
              )}
            </div>
          )}

          {/* Real-time Tracking Tab */}
          {activeTab === "tracking" && (
            <div className="grid grid-cols-1 md:grid-cols-8 gap-8">
              <div className="md:col-span-5">
                <div className="section-card bg-white rounded-xl shadow p-6">
                  <div className="section-header border-b-2 border-gray-100 pb-4 mb-6">
                    <h4 className="font-bold text-lg flex items-center">
                      <i className="fas fa-satellite-dish mr-2" />
                      Real-time Order Tracking
                    </h4>
                  </div>

                  <div className="delivery-map h-72 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center mb-4">
                    <div className="text-center">
                      <i className="fas fa-globe fa-3x text-primary mb-3" />
                      <p className="text-muted">
                        Live tracking map showing all active deliveries
                      </p>
                      <button
                        className="btn btn-primary"
                        onClick={initializeTracking}
                      >
                        <i className="fas fa-play mr-2" />
                        Start Live Tracking
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="card border-warning rounded-xl overflow-hidden">
                      <div className="bg-warning text-dark p-4 rounded-t-xl">
                        <h6 className="font-bold mb-0">
                          <i className="fas fa-truck mr-2" />
                          DEL-002 - In Transit
                        </h6>
                      </div>
                      <div className="p-4">
                        <p>
                          <strong>Tracking:</strong> 1Z999AA1234567890
                        </p>
                        <p>
                          <strong>Carrier:</strong> UPS Ground
                        </p>
                        <p>
                          <strong>Location:</strong> Chicago, IL
                        </p>
                        <p>
                          <strong>ETA:</strong> Mar 22, 2024 2:00 PM
                        </p>
                        <div className="progress">
                          <div
                            className="progress-bar bg-warning"
                            style={{ width: "75%" }}
                          />
                        </div>
                        <small className="text-muted">
                          Last updated: 2 hours ago
                        </small>
                      </div>
                    </div>

                    <div className="card border-primary rounded-xl overflow-hidden">
                      <div className="bg-primary text-white p-4 rounded-t-xl">
                        <h6 className="font-bold mb-0">
                          <i className="fas fa-box mr-2" />
                          DEL-003 - Ready to Ship
                        </h6>
                      </div>
                      <div className="p-4">
                        <p>
                          <strong>Tracking:</strong> Pending
                        </p>
                        <p>
                          <strong>Carrier:</strong> DHL Express
                        </p>
                        <p>
                          <strong>Location:</strong> Warehouse A
                        </p>
                        <p>
                          <strong>Scheduled:</strong> Mar 25, 2024 9:00 AM
                        </p>
                        <div className="progress">
                          <div
                            className="progress-bar bg-primary"
                            style={{ width: "25%" }}
                          />
                        </div>
                        <small className="text-muted">Awaiting pickup</small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="md:col-span-3 space-y-8">
                <div className="section-card bg-white rounded-xl shadow p-6">
                  <div className="section-header border-b-2 border-gray-100 pb-4 mb-6">
                    <h5 className="font-bold flex items-center">
                      <i className="fas fa-bell mr-2" />
                      Live Notifications
                    </h5>
                  </div>

                  <div className="alert alert-info rounded-lg p-3 mb-2 flex items-center">
                    <small className="text-muted">
                      <strong>DEL-002:</strong> Package scanned in Chicago
                    </small>
                  </div>

                  <div className="alert alert-warning rounded-lg p-3 mb-2 flex items-center">
                    <small className="text-muted">
                      1 hour ago
                      <br />
                      <strong>INV-002:</strong> Payment reminder sent
                    </small>
                  </div>

                  <div className="alert alert-success rounded-lg p-3 flex items-center">
                    <small className="text-muted">
                      3 hours ago
                      <br />
                      <strong>DEL-003:</strong> Ready for dispatch
                    </small>
                  </div>
                </div>

                <div className="section-card bg-white rounded-xl shadow p-6">
                  <div className="section-header border-b-2 border-gray-100 pb-4 mb-6">
                    <h5 className="font-bold flex items-center">
                      <i className="fas fa-chart-pie mr-2" />
                      Status Summary
                    </h5>
                  </div>

                  <div className="mb-3">
                    <div className="d-flex justify-content-between">
                      <span>Delivered</span>
                      <span className="text-success">40%</span>
                    </div>
                    <div className="progress">
                      <div
                        className="progress-bar bg-success"
                        style={{ width: "40%" }}
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <div className="d-flex justify-content-between">
                      <span>In Transit</span>
                      <span className="text-warning">35%</span>
                    </div>
                    <div className="progress">
                      <div
                        className="progress-bar bg-warning"
                        style={{ width: "35%" }}
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <div className="d-flex justify-content-between">
                      <span>Pending</span>
                      <span className="text-secondary">25%</span>
                    </div>
                    <div className="progress">
                      <div
                        className="progress-bar bg-secondary"
                        style={{ width: "25%" }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "salesorder" && (
            <div className="section-card bg-white rounded-xl shadow p-8 max-w-2xl mx-auto">
              <div className="section-header border-b-2 border-orange-200 pb-4 mb-6 flex items-center justify-between">
                <h4 className="font-bold text-2xl flex items-center text-orange-600">
                  <i className="fas fa-file-contract mr-2 text-orange-400 text-2xl" />
                  Sales Order Details
                </h4>
                {salesOrderData?.soId && (
                  <button
                    className="text-blue-700 underline font-semibold hover:text-blue-900 transition"
                    onClick={() => {
                      navigate(`/salesorder/${salesOrderData.soId}`);
                    }}
                  >
                    View Sales Order
                  </button>
                )}
              </div>
              {salesOrderLoading ? (
                <div className="text-center text-gray-400 py-8 text-lg">
                  <i className="fas fa-spinner fa-spin mr-2" />
                  Loading sales order...
                </div>
              ) : salesOrderError ? (
                <div className="text-center text-red-600 py-8 text-lg">
                  {salesOrderError}
                </div>
              ) : salesOrderData ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="mb-3">
                      <span className="font-semibold text-gray-700">
                        Sales Order ID:
                      </span>{" "}
                      <button
                        className="text-blue-700 underline hover:text-blue-900 transition"
                        onClick={() =>
                          navigate(
                            `/salesorderDetail?id=${salesOrderData.salesOrder.id}`,
                          )
                        }
                      >
                        {salesOrderData.salesOrder.orderId || "N/A"}
                      </button>
                    </div>
                    <div className="mb-3">
                      <span className="font-semibold text-gray-700">
                        Customer:
                      </span>{" "}
                      {salesOrderData.customerName ||
                        quotation?.customerName ||
                        "N/A"}
                    </div>
                    <div className="mb-3">
                      <span className="font-semibold text-gray-700">
                        Status:
                      </span>{" "}
                      <span className="inline-block px-3 py-1 rounded-full bg-blue-100 text-blue-800 font-semibold text-xs">
                        {salesOrderData.salesOrder.status || "N/A"}
                      </span>
                    </div>
                    <div className="mb-3">
                      <span className="font-semibold text-gray-700">
                        Order Date:
                      </span>{" "}
                      {salesOrderData.dateCreated
                        ? new Date(
                          salesOrderData.dateCreated,
                        ).toLocaleDateString("en-GB")
                        : "N/A"}
                    </div>
                    <div className="mb-3">
                      <span className="font-semibold text-gray-700">
                        Total Amount:
                      </span>{" "}
                      <span className="font-bold text-green-700">
                        {salesOrderData.totalAmount?.toLocaleString("en-IN", {
                          style: "currency",
                          currency: "INR",
                        }) || "-"}
                      </span>
                    </div>
                  </div>
                  <div>
                    <div className="mb-3">
                      <span className="font-semibold text-gray-700">
                        Quotation Ref:
                      </span>{" "}
                      {salesOrderData.quotationId ||
                        quotation?.quotationId ||
                        "N/A"}
                    </div>
                    <div className="mb-3">
                      <span className="font-semibold text-gray-700">
                        PO Number:
                      </span>{" "}
                      {salesOrderData.poId || purchaseOrder?.poId || "N/A"}
                    </div>
                    <div className="mb-3">
                      <span className="font-semibold text-gray-700">
                        Delivery Date:
                      </span>{" "}
                      {salesOrderData.deliveryDate
                        ? new Date(
                          salesOrderData.deliveryDate,
                        ).toLocaleDateString("en-GB")
                        : "N/A"}
                    </div>
                    <div className="mb-3">
                      <span className="font-semibold text-gray-700">
                        Remarks:
                      </span>{" "}
                      {salesOrderData.remarks || "-"}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-400 py-8 text-lg">
                  No sales order data available.
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Create Invoice Modal */}
      {showInvoiceModal && (
        <InvoiceForm onClose={() => setShowInvoiceModal(false)} />
      )}

      {/* Schedule Delivery Modal */}
      {showDeliveryModal && (
        <DeliveryForm
          onClose={() => setShowDeliveryModal(false)}
          products={orderData.items || []}
          poId={purchaseOrder.poId}
          onSuccess={() => {
            // Increment refresh counter to trigger delivery list update
            setRefreshDeliveries((prev) => prev + 1);
          }}
        />
      )}

      <Modal
        isOpen={showPrintModal}
        title="Order Acceptance"
        onClose={() => setShowPrintModal(false)}
      >
        <div className="">
          <div className="p-4" ref={printRef}>
            <OrderAcceptancePrintTemplate
              purchaseOrderId={purchaseOrderId ?? ""}
              soId={salesOrderData?.salesOrder?.orderId}
            />
          </div>
          <div className="flex flex-col items-center gap-2 p-4 border-t">
            <button
              className={`px-4 py-2 rounded text-white ${"bg-orange-600 hover:bg-orange-700"}`}
              onClick={() => handlePrint()}
            >
              Print
            </button>
          </div>
        </div>
      </Modal>
      <Modal
        isOpen={showDemoInvoiceModal}
        onClose={() => setShowDemoInvoiceModal(false)}
        title="Demo Invoice"
      >
        <DemoInvoiceTemplate />
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginBottom: 16,
            marginTop: 16,
          }}
        >
          <button
            onClick={() => {
              const printContents = document.querySelector(
                ".demo-invoice-container",
              )?.outerHTML;
              if (!printContents) {
                toast.error("Could not find print content.");
                return;
              }
              const printWindow = window.open("", "", "height=900,width=1200");
              if (!printWindow) return;

              printWindow.document.write(
                "<html><head><title>Demo Invoice</title>",
              );
              printWindow.document.write(
                `<style>
                  body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
                  table { width: 100%; border-collapse: collapse; }
                  th, td { border: 1px solid #000; padding: 10px; text-align: left; }
                  th { background-color: #f0f0f0; font-weight: bold; }
                  .header { text-align: center; margin-bottom: 20px; }
                  .section { margin: 20px 0; }
                  .notes { margin-top: 20px; }
                  @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
                </style>`,
              );
              printWindow.document.write("</head><body>");
              printWindow.document.write(printContents);
              printWindow.document.write("</body></html>");
              printWindow.document.close();

              printWindow.onload = () => {
                printWindow.focus();
                setTimeout(() => {
                  printWindow.print();
                  printWindow.close();
                }, 500);
              };
            }}
            className="border rounded-md bg-orange-500 p-2 text-white"
            style={{ fontWeight: 600, fontSize: 16 }}
          >
            Print
          </button>
        </div>
      </Modal>

      <Modal
        isOpen={openPO}
        onClose={() => setOpenPo(false)}
        title="Purchase Order Details"
      >
        {orderData?.purchaseOrder ? (
          <PurchaseOrderPrint data={orderData} />
        ) : (
          <div className="text-center py-8 text-gray-500">Loading...</div>
        )}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginBottom: 16,
          }}
        >
          <button
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md shadow hover:bg-blue-700 transition-all font-semibold mr-2"
            onClick={sendInvoice}
          >
            <IoMdSend size={18} />
            Send PO
          </button>
          <button
            onClick={() => {
              // Print only the modal content
              const printContents =
                document.querySelector(".po-container")?.outerHTML ||
                document.querySelector(".po-main-wrapper")?.outerHTML ||
                document.querySelector(".po-main-table")?.outerHTML;
              if (!printContents) {
                toast.error("Could not find print content.");
                return;
              }
              const printWindow = window.open("", "", "height=900,width=1200");
              if (!printWindow) return;

              // Extract internal style if present
              const styleMatch = printContents.match(
                /<style[^>]*>([\s\S]*?)<\/style>/,
              );
              const internalStyle = styleMatch ? styleMatch[1] : "";
              const cleanContents = printContents.replace(
                /<style[^>]*>[\s\S]*?<\/style>/,
                "",
              );

              printWindow.document.write(
                "<html><head><title>Print Purchase Order</title>",
              );
              if (internalStyle) {
                printWindow.document.write(`<style>${internalStyle}</style>`);
              }
              printWindow.document.write(
                `<style>@media print { .print-hide { display: none !important; } }</style>`,
              );
              Array.from(document.styleSheets).forEach((styleSheet) => {
                try {
                  if (styleSheet.href) {
                    printWindow.document.write(
                      `<link rel="stylesheet" href="${styleSheet.href}">`,
                    );
                  } else if (
                    styleSheet.ownerNode &&
                    styleSheet.ownerNode.textContent
                  ) {
                    printWindow.document.write(
                      `<style>${styleSheet.ownerNode.textContent}</style>`,
                    );
                  }
                } catch (e) { }
              });
              printWindow.document.write("</head><body>");
              printWindow.document.write(cleanContents);
              printWindow.document.write("</body></html>");
              printWindow.document.close();

              printWindow.onload = () => {
                printWindow.focus();
                printWindow.print();
                printWindow.close();
              };

              // Fallback if onload doesn't fire
              setTimeout(() => {
                if (printWindow && !printWindow.closed) {
                  printWindow.focus();
                  printWindow.print();
                  printWindow.close();
                }
              }, 1000);
            }}
            className="border rounded-md bg-orange-500 p-2 text-white print-hide"
            style={{ fontWeight: 600, fontSize: 16 }}
          >
            Print
          </button>
        </div>
      </Modal>
    </div>
  );
}
