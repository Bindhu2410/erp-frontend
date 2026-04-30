import React, { useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import generalConfig from "../configs/invoice/generalInfo.json";
import GeneralInformation, {
  GeneralInformationRef,
} from "../../components/GeneralInformation";
// import QuotationProducts from "../quotation/QuotationProducts";
import { Product } from "../../types/product";

interface InvoiceItem {
  id: string;
  product: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

interface InvoiceFormProps {
  onClose?: () => void;
  invoiceData?: any;
  invoiceId?: string | undefined;
  onSuccess?: () => void;
}

const InvoiceForm: React.FC<InvoiceFormProps> = ({
  onClose,
  invoiceData,
  invoiceId,
  onSuccess,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const generalInfoRef = useRef<GeneralInformationRef>(null);
  const [invoiceStatus, setInvoiceStatus] = useState<string>("Draft");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([]);
  const searchParams = new URLSearchParams(location.search);
  const id = searchParams.get("id");

  const handleProductsChange = (products: any[]) => {
    const items = products.map((p) => ({
      id: String(p.id), // Ensure id is string
      product: p.itemName,
      quantity: p.qty || 1,
      unitPrice: p.unitPrice || 0,
      totalPrice: (p.qty || 1) * (p.unitPrice || 0),
    }));
    setInvoiceItems(items);

    // Update form totals
    const subTotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
    const taxRate = formData.taxRate || 0;
    const taxAmount = (subTotal * taxRate) / 100;
    const totalAmount = subTotal + taxAmount;

    setFormData((prev) => ({
      ...prev,
      subTotal,
      taxAmount,
      totalAmount,
    }));
  };

  const handleSave = async () => {
    if (!generalInfoRef.current?.validateForm()) {
      toast.error("Please fix the validation errors before saving.");
      return;
    }

    setIsSubmitting(true);
    try {
      const currentFormData = generalInfoRef.current?.getFormData() || formData;
      const { title, fields, ...cleanedFormData } = currentFormData;

      const transformedData = {
        ...cleanedFormData,
        status: invoiceStatus,
        items: invoiceItems,
        isActive: true,
        createdAt: new Date().toISOString(),
      };

      const isEdit = Boolean(id);
      const endpoint = `${process.env.REACT_APP_API_BASE_URL}/Invoice${
        isEdit ? `/${id}` : ""
      }`;
      const method = isEdit ? "PUT" : "POST";

      console.log("Transformed Data:", transformedData);
      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(transformedData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          errorData?.message || `Failed to save data: ${response.status}`
        );
      }

      let responseData = {};
      const contentLength = response.headers.get("Content-Length");
      if (response.status !== 204 && contentLength !== "0") {
        try {
          responseData = await response.json();
        } catch (error) {
          console.error("Error parsing response:", error);
        }
      }

      toast.success(
        isEdit
          ? "Invoice updated successfully! ✅"
          : "Invoice created successfully! 🎉",
        { autoClose: 2000 }
      );

      if (onSuccess) {
        await onSuccess();
        await new Promise((resolve) => setTimeout(resolve, 500));
      }

      onClose?.();
      navigate("/invoices");
    } catch (error) {
      console.error("Error saving invoice:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to save invoice"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    onClose?.();
  };

  return (
    <div className="p-8 bg-gray-100">
      <div className="relative top-0 right-0">
        <div className="bg-gradient-to-r from-white to-gray-50 shadow-md p-4 mb-2">
          <div className="relative flex items-center justify-center">
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight uppercase mx-auto">
              Invoice
            </h2>
            <div className="absolute right-0 flex items-center gap-2">
              <span className="text-gray-600 text-sm font-medium">Status:</span>
              <div
                className={`text-sm px-4 py-1.5 rounded-full shadow-sm min-w-[140px] text-center ${
                  invoiceStatus === "Paid"
                    ? "bg-green-100 text-green-700"
                    : invoiceStatus === "Partial"
                    ? "bg-blue-100 text-blue-700"
                    : invoiceStatus === "Draft"
                    ? "bg-gray-100 text-gray-700"
                    : invoiceStatus === "Pending"
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {invoiceStatus}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div>
        <GeneralInformation
          ref={generalInfoRef}
          config={generalConfig}
          type="Invoice"
          data={invoiceData}
          formData={formData}
          setFormData={setFormData}
        />

        <div className="mt-6">
          {/* <QuotationProducts
            onProductsChange={handleProductsChange}
            products={invoiceData?.items || []}
          /> */}
        </div>

        <div className="mt-6 flex justify-end gap-4">
          <button
            type="button"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            onClick={handleSave}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Saving..." : "Save"}
          </button>
          <button
            type="button"
            className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded"
            onClick={handleCancel}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default InvoiceForm;
