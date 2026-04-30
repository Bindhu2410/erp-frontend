import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import DeliveryChallanModal from "./DeliveryChallanModal";
import Select from "react-select";
import api from "../../services/api";

interface Product {
  id: number;
  itemId: number;
  itemName: string;
  itemCode: string;
  qty: number;
  availableQty?: number;
  make?: string;
  model?: string;
  unitPrice: number;
  batchNumber?: string;
  serialNumber?: string;
  packagingDetails?: string;
  includedChildItems?: { id: number }[];
  accessoriesItems?: { id: number }[];
}

interface DeliveredFormProps {
  onClose: () => void;
  poId: any;
  products?: Product[];
  deliveryData?: any;
  onSuccess?: () => void;
}

export const DeliveryForm: React.FC<DeliveredFormProps> = ({
  onClose,
  deliveryData,
  poId,
  products = [],
  onSuccess,
}) => {
  const [contactError, setContactError] = useState<string>("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const isEdit = !!deliveryData;

  // Required fields configuration
  const requiredFields = [
    "deliveryDate",
    "poNumber",
    "dispatchLocation",
    "driverContact",
  ];

  // Validate a single field
  const validateField = (name: string, value: string) => {
    if (requiredFields.includes(name) && !value) {
      return `${name
        .replace(/([A-Z])/g, " $1")
        .replace(/^./, (str) => str.toUpperCase())} is required`;
    }
    if (name === "driverContact" && value && value.length !== 10) {
      return "Contact number must be exactly 10 digits";
    }
    return "";
  };

  // Handle blur event for validation
  const handleBlur = (
    e: React.FocusEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    const error = validateField(name, value);
    setFieldErrors((prev) => ({ ...prev, [name]: error }));

    // Special handling for contact number
    if (name === "driverContact") {
      handleContactBlur();
    }
  };

  // Fetch purchase order options from API
  const [poOptions, setPoOptions] = useState<
    { po_id: string; label: string }[]
  >([]);
  const [poLoading, setPoLoading] = useState(false);
  const [poError, setPoError] = useState<string | null>(null);
  const [product, setProducts] = useState<Product[]>(products || []);
  const [localProducts, setLocalProducts] = useState<Product[]>(products);
  function formatDateToYYYYMMDD(dateStr: string) {
    if (!dateStr) return "";
    // Accepts yyyy-mm-dd, dd-mm-yyyy, or yyyy-mm-ddTHH:mm:ss
    const [datePart] = dateStr.split("T");
    if (/^\d{4}-\d{2}-\d{2}$/.test(datePart)) return datePart;
    if (/^\d{2}-\d{2}-\d{4}$/.test(datePart)) {
      const [d, m, y] = datePart.split("-");
      return `${y}-${m}-${d}`;
    }
    return datePart;
  }

  const [formData, setFormData] = useState(() => {
    if (isEdit && deliveryData) {
      return {
        deliveryNumber:
          deliveryData.deliveryId || deliveryData.DeliveryId || "",
        deliveryDate: formatDateToYYYYMMDD(
          deliveryData.deliveryDate || deliveryData.DeliveryDate || "",
        ),
        salesOrderId:
          deliveryData.purchaseOrder.salesOrderId ||
          deliveryData.SalesOrderId ||
          "",
        poNumber: deliveryData.poId || deliveryData.PoId || poId || "",
        dispatchLocation:
          deliveryData.dispatchAddress || deliveryData.DispatchAddress || "",
        vehicleNumber: deliveryData.vehicleNo || deliveryData.VehicleNo || "",
        transporterName:
          deliveryData.transporterName || deliveryData.TransporterName || "",
        driverName: deliveryData.driverName || deliveryData.DriverName || "",
        driverContact:
          deliveryData.driverContact?.toString() ||
          deliveryData.DriverContact?.toString() ||
          "",
        modeOfDelivery:
          deliveryData.modeOfDelivery || deliveryData.ModeOfDelivery || "road",
        deliveryStatus:
          deliveryData.deliveryStatus ||
          deliveryData.DeliveryStatus ||
          "Pending",
        deliveryNotes:
          deliveryData.deliveryNotes || deliveryData.DeliveryNotes || "",
        acknowledgement:
          deliveryData.acknowledgement || deliveryData.Acknowledgement || "",
        Items: deliveryData.Items || deliveryData.items,
      };
    }
    const initialData = {
      deliveryNumber:
        "DEL-" +
        Math.floor(Math.random() * 10000)
          .toString()
          .padStart(4, "0"),
      deliveryDate: "",
      poNumber: poId || "",
      salesOrderId: "",
      dispatchLocation: "",
      vehicleNumber: "",
      transporterName: "",
      driverName: "",
      driverContact: "",
      modeOfDelivery: "road",
      deliveryStatus: "Pending",
      deliveryNotes: "",
      acknowledgement: "",
    };
    console.log("Initial form data with poId:", poId, initialData);
    return initialData;
  });

  // Sync formData with deliveryData in edit mode
  useEffect(() => {
    if (isEdit && deliveryData) {
      setFormData({
        deliveryNumber:
          deliveryData.deliveryId || deliveryData.DeliveryId || "",
        deliveryDate: formatDateToYYYYMMDD(
          deliveryData.deliveryDate || deliveryData.DeliveryDate || "",
        ),
        salesOrderId:
          deliveryData.purchaseOrder.salesOrderId ||
          deliveryData.SalesOrderId ||
          "",
        poNumber: deliveryData.poId || deliveryData.PoId || poId || "",
        dispatchLocation:
          deliveryData.dispatchAddress || deliveryData.DispatchAddress || "",
        vehicleNumber: deliveryData.vehicleNo || deliveryData.VehicleNo || "",
        transporterName:
          deliveryData.transporterName || deliveryData.TransporterName || "",
        driverName: deliveryData.driverName || deliveryData.DriverName || "",
        driverContact:
          deliveryData.driverContact?.toString() ||
          deliveryData.DriverContact?.toString() ||
          "",
        modeOfDelivery:
          deliveryData.modeOfDelivery || deliveryData.ModeOfDelivery || "road",
        deliveryStatus:
          deliveryData.deliveryStatus ||
          deliveryData.DeliveryStatus ||
          "Pending",
        deliveryNotes:
          deliveryData.deliveryNotes || deliveryData.DeliveryNotes || "",
        acknowledgement:
          deliveryData.acknowledgement || deliveryData.Acknowledgement || "",
        Items: deliveryData.Items || deliveryData.items,
      });
    }
  }, [isEdit, deliveryData, poId]);

  console.log(formData, "Form::??");

  const [selectedProductId, setSelectedProductId] = useState<number | null>(
    null,
  );
  const [deliveryItems, setDeliveryItems] = useState<Product[]>(() => {
    if (products && products.length > 0) {
      return products;
    }
    if (isEdit && deliveryData && Array.isArray(deliveryData.Items)) {
      // Support API structure where each item has an 'item' property
      return deliveryData.Items.map((itemObj: any, idx: number) => {
        const item = itemObj.item || itemObj;
        return {
          id: item.id || idx,
          itemId: item.itemId || item.id || "N/A",
          itemName: item.itemName || item.ItemName || item.product || "N/A",
          itemCode: item.itemCode || item.ItemCode || "N/A",
          qty: item.qty || item.Qty || 1,
          availableQty: item.qty || item.Qty || 1,
          make: item.make || item.Make || "",
          model: item.model || item.Model || "",
          unitPrice: item.unitPrice || item.UnitPrice || 0,
          batchNumber: item.batchNumber || item.BatchNumber || "",
          serialNumber: item.serialNumber || item.SerialNumber || "",
          packagingDetails:
            item.packagingDetails || item.PackagingDetails || "",
          includedChildItems: item.includedChildItems || [],
          accessoriesItems: item.accessoriesItems || [],
        };
      });
    }
    return [];
  });
  console.log(deliveryItems, "deli::::");
  const [selectedProductQty, setSelectedProductQty] = useState<number>(1);
  const [showChallan, setShowChallan] = useState(false);
  const [challanData, setChallanData] = useState<any>(null);

  // Get available products by filtering out products already in deliveryItems
  const availableProducts = localProducts.filter(
    (product) => !deliveryItems.some((item) => item.id === product.id),
  );

  const handleProductSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = parseInt(e.target.value);
    setSelectedProductId(id);
    const prod = localProducts.find((p) => p.id === id);
    setSelectedProductQty(prod ? Math.min(1, prod.qty) : 1);
  };

  const handleSelectedProductQtyChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    let val = Number(e.target.value);
    if (isNaN(val) || val < 1) val = 1;
    const prod = localProducts.find((p) => p.id === selectedProductId);
    if (prod && val > prod.qty) val = prod.qty;
    setSelectedProductQty(val);
  };

  // Add selected product to table
  const handleAddProduct = () => {
    if (selectedProductId == null) return;

    const existingItemIndex = deliveryItems.findIndex(
      (item) => item.id === selectedProductId,
    );

    if (existingItemIndex >= 0) {
      // If product already exists, update its quantity
      const updatedItems = [...deliveryItems];
      const availableQty =
        localProducts.find((p) => p.id === selectedProductId)?.qty || 0;
      const newQty = updatedItems[existingItemIndex].qty + selectedProductQty;

      if (newQty > availableQty) {
        toast.error(
          `Cannot add more than available quantity (${availableQty})`,
        );
        return;
      }

      updatedItems[existingItemIndex] = {
        ...updatedItems[existingItemIndex],
        qty: newQty,
      };
      setDeliveryItems(updatedItems);
    } else {
      // Add new product
      const prod = localProducts.find((p) => p.id === selectedProductId);
      if (prod) {
        setDeliveryItems((prev) => [
          ...prev,
          {
            ...prod,
            qty: selectedProductQty,
            availableQty: prod.qty,
          },
        ]);
      }
    }

    // Reset selection
    setSelectedProductId(null);
    setSelectedProductQty(1);
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleContactBlur = () => {
    const error = validateField("driverContact", formData.driverContact);
    setContactError(error);
    setFieldErrors((prev) => ({ ...prev, driverContact: error }));
  };

  const handleQuantityChange = (productId: number, newQty: number) => {
    setDeliveryItems((prev) =>
      prev.map((item) =>
        item.id === productId
          ? {
              ...item,
              qty: Math.min(newQty, item.availableQty || item.qty),
            }
          : item,
      ),
    );
  };

  const handleItemFieldChange = (
    productId: number,
    field: keyof Product,
    value: any,
  ) => {
    setDeliveryItems((prev) =>
      prev.map((item) =>
        item.id === productId ? { ...item, [field]: value } : item,
      ),
    );
  };

  const handleQtyKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "-" || e.key === "e" || e.key === "+") {
      e.preventDefault();
    }
  };

  const confirmDeliverySchedule = async () => {
    // Validate all required fields
    const errors: Record<string, string> = {};
    requiredFields.forEach((field) => {
      const error = validateField(
        field,
        formData[field as keyof typeof formData] as string,
      );
      if (error) {
        errors[field] = error;
      }
    });

    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      toast.error("Please fix all validation errors");
      return;
    }

    if (deliveryItems.length === 0) {
      toast.error("Please add at least one product to schedule delivery");
      return;
    }

    if (deliveryItems.some((item) => !item.qty || item.qty <= 0)) {
      toast.error("All items must have a delivery quantity greater than 0");
      return;
    }

    // Rest of your existing confirmDeliverySchedule logic...
    // Prepare API payload as per new spec
    const deliveryPayload = {
      UserCreated: 1,
      DateCreated:
        isEdit && deliveryData?.DateCreated
          ? deliveryData.DateCreated
          : new Date().toISOString(),
      UserUpdated: 1,
      DateUpdated: new Date().toISOString(),
      SalesOrderId: deliveryData?.SalesOrderId || "",
      PoId: formData.poNumber,
      DeliveryId: formData.deliveryNumber,
      DeliveryDate: formData.deliveryDate
        ? new Date(formData.deliveryDate).toISOString()
        : new Date().toISOString(),
      DeliveryStatus: formData.deliveryStatus,
      DispatchAddress: formData.dispatchLocation,
      Priority: deliveryData?.Priority || "Normal",
      TransporterName: formData.transporterName,
      VehicleNo: formData.vehicleNumber,
      DriverName: formData.driverName,
      DriverContact: Number(formData.driverContact),
      ModeOfDelivery: formData.modeOfDelivery,
      InvoiceId: deliveryData?.InvoiceId || null,
      Items: deliveryItems.map((item) => ({
        ItemId: item.itemId,
        UserCreated: 1,
        DateCreated:
          isEdit && deliveryData?.DateCreated
            ? deliveryData.DateCreated
            : new Date().toISOString(),
        UserUpdated: 1,
        DateUpdated: new Date().toISOString(),
        Qty: item.qty,
        Amount: (item.unitPrice || 0) * (item.qty || 1),
        IsActive: true,
        UnitPrice: item.unitPrice,
        IncludedChildItemIds:
          Array.isArray(item.includedChildItems) &&
          item.includedChildItems.length > 0
            ? item.includedChildItems.map((child) => child.id)
            : [],
        AccessoriesIds:
          Array.isArray(item.accessoriesItems) &&
          item.accessoriesItems.length > 0
            ? item.accessoriesItems.map((acc) => acc.id)
            : [],
      })),
    };

    try {
      let response;
      if (isEdit && deliveryData?.DeliveryId) {
        response = await api.put(
          `Delivery/${deliveryData.DeliveryId}`,
          deliveryPayload,
        );
      } else {
        response = await api.post("Delivery", deliveryPayload);
      }
      if (response.status >= 400) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      toast.success(
        isEdit
          ? "Delivery updated successfully. Opening delivery challan..."
          : "Delivery saved successfully. Opening delivery challan...",
      );
      onSuccess?.();
    } catch (error) {
      console.error("Error saving delivery:", error);
      toast.error("Failed to save delivery");
      return;
    }

    // Prepare challan data
    const challanDataObj = {
      challanNumber:
        "DC-" +
        Math.floor(Math.random() * 10000)
          .toString()
          .padStart(4, "0"),
      challanDate: new Date().toISOString().slice(0, 10),
      deliveryNumber: formData.deliveryNumber,
      poNumber: formData.poNumber,
      consigneeName: "",
      consigneeAddress: formData.dispatchLocation,
      consignorName: "",
      consignorAddress: "",
      gstinConsignor: "",
      gstinConsignee: "",
      itemDetails: deliveryItems.map((item) => ({
        itemCode: item.itemCode,
        description: item.itemName,
        quantityDispatched: item.qty,
        unitOfMeasure: "",
        batchSerialNo: item.batchNumber || item.serialNumber || "",
      })),
      purposeOfDelivery: "sale",
      transporterDetails: formData.transporterName,
      ewayBillNumber: "",
      signatureConsignor: "",
      signatureConsignee: "",
    };
    setChallanData(challanDataObj);
    setShowChallan(true);
    // Close the delivery form after showing the challan
    onClose();
  };

  // Handle saving challan (unchanged from your original code)
  const handleSaveChallan = async () => {
    try {
      const deliveryData = {
        ...formData,
        itemDetails: deliveryItems.map((item) => ({
          itemCode: item.itemCode,
          itemDescription: item.itemName,
          quantityDelivered: item.qty,
          batchNumber: item.batchNumber,
          serialNumber: item.serialNumber,
          packagingDetails: item.packagingDetails,
        })),
      };
      const response = await api.post("Delivery", deliveryData);
      if (response.status >= 400) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      await api.post("DeliveryChallan", challanData);
      toast.success(
        "Delivery and challan saved successfully. You can now print or close this challan.",
      );
      onSuccess?.();
    } catch (error) {
      console.error("Error saving delivery/challan:", error);
      toast.error("Failed to save delivery/challan");
    }
  };

  // Fetch PO details when PO number changes
  useEffect(() => {
    if (!formData.poNumber) return;

    api
      .post("purchaseorder/grid", {
        SearchText: formData.poNumber,
        CustomerNames: [],
        Statuses: [],
        PageNumber: 1,
        PageSize: 1,
        OrderBy: "date_created",
        OrderDirection: "DESC",
      })
      .then((response) => {
        const data = response.data;
        const poList = Array.isArray(data) ? data : data.results || [];
        const po = poList.find(
          (po: any) => po.purchaseOrder.poId === formData.poNumber,
        );
        if (po && Array.isArray(po.items)) {
          const mappedProducts = po.items.map((item: any) => ({
            id: item.id,
            itemId: item.itemId,
            itemName: item.itemName || item.product || "",
            itemCode: item.itemCode,
            qty: item.qty,
            availableQty: item.qty,
            make: item.make,
            model: item.model,
            unitPrice: item.unitPrice,
            batchNumber: item.batchNumber || "",
            serialNumber: item.serialNumber || "",
            packagingDetails: item.packagingDetails || "",
            includedChildItems: item.includedChildItems || [],
            accessoriesItems: item.accessoriesItems || [],
          }));

          // Only clear deliveryItems if not editing an existing delivery
          if (!isEdit) {
            setDeliveryItems([]);
            setSelectedProductId(null);
            setSelectedProductQty(1);
          }
          setLocalProducts(mappedProducts);
        }

        const address = po.leadAddress;
        console.log(address, "Address::??");
        const formattedAddress = [
          address.door_no,
          address.street,
          address.area,
          address.city,
          address.district,
          address.state,
          address.pincode,
        ]
          .filter(Boolean)
          .join(", ");

        setFormData((prev) => ({
          ...prev,
          dispatchLocation: formattedAddress,
          salesOrderId: po.purchaseOrder.salesOrderId || "N/A",
        }));
      })
      .catch((err) => {
        console.error("Error fetching PO details:", err);
      });
  }, [formData.poNumber, poId, isEdit]);

  // Helper function to render required field label
  const renderLabel = (name: string, label: string) => (
    <label className="block font-semibold mb-1">
      {label}
      {requiredFields.includes(name) && (
        <span className="text-red-500 ml-1">*</span>
      )}
    </label>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      {showChallan && challanData && (
        <DeliveryChallanModal
          challanData={challanData}
          onClose={() => {
            setShowChallan(false);
            onClose();
          }}
          onSave={handleSaveChallan}
        />
      )}
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl border border-gray-200 flex flex-col max-h-[90vh]">
        <div className="modal-header bg-white text-black rounded-t-2xl p-5 flex justify-between items-center shadow">
          <h5 className="font-bold flex items-center text-lg">
            <i className="fas fa-truck mr-2" />
            {isEdit ? "Edit Delivery" : "Schedule New Delivery"}
          </h5>
          <button
            className="text-white text-2xl hover:text-gray-200 transition"
            onClick={onClose}
          >
            ×
          </button>
        </div>
        <div className="modal-body p-8 space-y-8 overflow-y-auto flex-1">
          {/* Delivery Info Section */}
          <div>
            <h6 className="text-indigo-700 font-semibold mb-2 text-base border-b border-indigo-100 pb-1">
              Delivery Information
            </h6>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* <div>
                {renderLabel("deliveryNumber", "Delivery Number / Reference")}
                <input
                  type="text"
                  className="form-input rounded-lg border-2 border-gray-200 p-2 w-full bg-gray-50"
                  value={formData.deliveryNumber}
                  readOnly
                />
              </div> */}
              <div className="relative">
                {renderLabel("poNumber", "PO Number")}
                {poId ? (
                  <input
                    type="text"
                    className="form-input rounded-lg border-2  disabled:bg-gray-400 border-gray-200 p-2 w-full bg-gray-50"
                    value={poId}
                    disabled
                    readOnly
                  />
                ) : (
                  <Select
                    classNamePrefix="react-select"
                    className="w-full"
                    isLoading={poLoading}
                    name="poNumber"
                    options={poOptions}
                    value={
                      poOptions.find(
                        (opt) => opt.po_id === formData.poNumber,
                      ) || null
                    }
                    onChange={(selected) => {
                      setFormData((prev) => ({
                        ...prev,
                        poNumber: selected ? selected.po_id : "",
                      }));
                    }}
                    placeholder={poError ? poError : "Select PO Number"}
                    getOptionLabel={(option) => option.label}
                    getOptionValue={(option) => option.po_id}
                    isClearable
                    required
                  />
                )}
                {fieldErrors.poNumber && (
                  <div className="text-red-600 text-xs mt-1">
                    {fieldErrors.poNumber}
                  </div>
                )}
              </div>
              <div>
                {renderLabel("salesOrderId", "Sales Order ID")}
                <input
                  type="text"
                  className={`form-input rounded-lg border-2 disabled:bg-gray-400 ${
                    fieldErrors.salesOrderId
                      ? "border-red-500"
                      : "border-gray-200"
                  } p-2 w-full`}
                  name="deliveryDate"
                  value={formData.salesOrderId}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  disabled
                  required
                />
                {fieldErrors.deliveryDate && (
                  <div className="text-red-600 text-xs mt-1">
                    {fieldErrors.deliveryDate}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Dates & Locations Section */}
          <div>
            <h6 className="text-indigo-700 font-semibold mb-2 text-base border-b border-indigo-100 pb-1">
              Schedule & Locations
            </h6>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                {renderLabel("deliveryDate", "Delivery Date")}
                <input
                  type="date"
                  className={`form-input rounded-lg border-2 ${
                    fieldErrors.deliveryDate
                      ? "border-red-500"
                      : "border-gray-200"
                  } p-2 w-full`}
                  name="deliveryDate"
                  value={formData.deliveryDate}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  required
                />
                {fieldErrors.deliveryDate && (
                  <div className="text-red-600 text-xs mt-1">
                    {fieldErrors.deliveryDate}
                  </div>
                )}
              </div>

              <div>
                <label className="block font-semibold mb-1">
                  Vehicle Number
                </label>
                <input
                  type="text"
                  className="form-input rounded-lg border-2 border-gray-200 p-2 w-full"
                  name="vehicleNumber"
                  value={formData.vehicleNumber}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                {renderLabel("dispatchLocation", "Dispatch Location")}
                <textarea
                  className={`form-textarea rounded-lg border-2 ${
                    fieldErrors.dispatchLocation
                      ? "border-red-500"
                      : "border-gray-200"
                  } p-2 w-full resize-none`}
                  name="dispatchLocation"
                  value={formData.dispatchLocation}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  required
                  rows={3}
                />
                {fieldErrors.dispatchLocation && (
                  <div className="text-red-600 text-xs mt-1">
                    {fieldErrors.dispatchLocation}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Transport Section */}
          <div>
            <h6 className="text-indigo-700 font-semibold mb-2 text-base border-b border-indigo-100 pb-1">
              Transport Details
            </h6>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block font-semibold mb-1">
                  Transporter Name
                </label>
                <input
                  type="text"
                  className="form-input rounded-lg border-2 border-gray-200 p-2 w-full"
                  name="transporterName"
                  value={formData.transporterName}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Driver Name</label>
                <input
                  type="text"
                  className="form-input rounded-lg border-2 border-gray-200 p-2 w-full"
                  name="driverName"
                  value={formData.driverName}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                {renderLabel("driverContact", "Driver Contact")}
                <input
                  type="text"
                  className={`form-input rounded-lg border-2 ${
                    fieldErrors.driverContact
                      ? "border-red-500"
                      : "border-gray-200"
                  } p-2 w-full`}
                  name="driverContact"
                  value={formData.driverContact}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  maxLength={10}
                  inputMode="numeric"
                  pattern="[0-9]*"
                  aria-invalid={!!fieldErrors.driverContact}
                />
                {fieldErrors.driverContact && (
                  <div className="text-red-600 text-xs mt-1">
                    {fieldErrors.driverContact}
                  </div>
                )}
              </div>
              <div>
                <label className="block font-semibold mb-1">
                  Mode of Delivery
                </label>
                <select
                  className="form-select rounded-lg border-2 border-gray-200 p-2 w-full"
                  name="modeOfDelivery"
                  value={formData.modeOfDelivery}
                  onChange={handleInputChange}
                >
                  <option value="air">Air</option>
                  <option value="road">Road</option>
                  <option value="sea">Sea</option>
                </select>
              </div>
            </div>
          </div>

          {/* Item Details Section */}
          <div>
            <h6 className="text-indigo-700 font-semibold mb-2 text-base border-b border-indigo-100 pb-1">
              Item Details
            </h6>

            {/* Product Selection Section */}
            {availableProducts.length > 0 ? (
              <div className="mb-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                  <div className="md:col-span-6">
                    <label className="block font-semibold mb-2 text-gray-700">
                      Select Product
                    </label>
                    <Select
                      className="w-full text-sm"
                      classNamePrefix="select"
                      isClearable
                      isSearchable
                      placeholder="-- Select a product to add --"
                      value={
                        selectedProductId
                          ? availableProducts.find(
                              (p) => p.id === selectedProductId,
                            )
                          : null
                      }
                      onChange={(selected: any) =>
                        handleProductSelect({
                          target: { value: selected?.id || "" },
                        } as any)
                      }
                      options={availableProducts}
                      getOptionLabel={(option: Product) =>
                        `${option.itemName} - ${option.itemCode}`
                      }
                      getOptionValue={(option: Product) => option.id.toString()}
                      styles={{
                        control: (base) => ({
                          ...base,
                          minHeight: "38px",
                          border: "1px solid #D1D5DB",
                          borderRadius: "0.375rem",
                          "&:hover": {
                            borderColor: "#818CF8",
                          },
                          "&:focus-within": {
                            borderColor: "#6366F1",
                            boxShadow: "0 0 0 1px #6366F1",
                          },
                        }),
                        menu: (base) => ({
                          ...base,
                          zIndex: 100,
                          boxShadow:
                            "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                        }),
                        menuList: (base) => ({
                          ...base,
                          maxHeight: "200px",
                          overflowY: "auto",
                          "&::-webkit-scrollbar": {
                            width: "8px",
                          },
                          "&::-webkit-scrollbar-track": {
                            background: "#F3F4F6",
                          },
                          "&::-webkit-scrollbar-thumb": {
                            background: "#CBD5E0",
                            borderRadius: "4px",
                            border: "2px solid #F3F4F6",
                          },
                        }),
                        option: (base, state) => ({
                          ...base,
                          fontSize: "0.875rem",
                          padding: "8px 12px",
                          backgroundColor: state.isFocused
                            ? "#EEF2FF"
                            : "white",
                          color: "#111827",
                          "&:hover": {
                            backgroundColor: "#EEF2FF",
                          },
                        }),
                      }}
                    />
                  </div>

                  <div className="md:col-span-3">
                    <label className="block font-semibold mb-2 text-gray-700">
                      Quantity
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        className="form-control w-full px-3 py-2 border-2 border-gray-200 rounded-lg bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                        min={1}
                        max={(() => {
                          const prod = localProducts.find(
                            (p) => p.id === selectedProductId,
                          );
                          return prod ? prod.qty : 1;
                        })()}
                        value={selectedProductQty}
                        onChange={handleSelectedProductQtyChange}
                        onKeyDown={handleQtyKeyDown}
                        disabled={selectedProductId == null}
                      />
                      {selectedProductId != null && (
                        <span className="absolute -bottom-5 left-0 text-xs text-gray-500">
                          Available:{" "}
                          {localProducts.find((p) => p.id === selectedProductId)
                            ?.qty || 0}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="md:col-span-3">
                    <button
                      type="button"
                      className="w-full bg-blue-500 hover:bg-blue-600 text-white rounded-lg px-4 py-2 font-semibold transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      onClick={handleAddProduct}
                      disabled={selectedProductId == null}
                    >
                      <span className="text-lg">+</span>
                      {deliveryItems.some(
                        (item) => item.id === selectedProductId,
                      )
                        ? "Update Item"
                        : "Add Item"}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <h3 className="text-lg font-medium  text-center text-red-500 mb-2">
                No more products to add
              </h3>
            )}
            <div className="overflow-x-auto rounded-lg border border-gray-200 mt-2">
              <table className="table-auto w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left font-semibold">
                      Item Code
                    </th>
                    <th className="px-4 py-2 text-left font-semibold">
                      Item Description
                    </th>
                    <th className="px-4 py-2 text-left font-semibold">
                      Quantity Delivered
                    </th>
                    <th className="px-4 py-2 text-left font-semibold">
                      Batch/Lot Number
                    </th>
                    <th className="px-4 py-2 text-left font-semibold">
                      Serial Number
                    </th>
                    <th className="px-4 py-2 text-left font-semibold">
                      Packaging Details
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {deliveryItems.map((item, idx) => (
                    <tr
                      key={item.id}
                      className={
                        idx % 2 === 0
                          ? "bg-white"
                          : "bg-gray-50 hover:bg-indigo-50"
                      }
                    >
                      <td className="px-4 py-2">{item.itemCode}</td>
                      <td className="px-4 py-2">{item.itemName}</td>
                      <td className="px-4 py-2">
                        <input
                          type="number"
                          className="form-control form-control-sm w-20 px-2 py-1 border rounded"
                          min="1"
                          max={item.availableQty || item.qty}
                          value={item.qty}
                          onChange={(e) =>
                            handleQuantityChange(
                              item.id,
                              Number(e.target.value),
                            )
                          }
                          onKeyDown={handleQtyKeyDown}
                        />
                        <span className="ml-2 text-xs text-gray-500">
                          (Available: {item.availableQty || item.qty})
                        </span>
                      </td>
                      <td className="px-4 py-2">
                        <input
                          type="text"
                          className="form-control form-control-sm w-24 px-2 py-1 border rounded"
                          value={item.batchNumber}
                          onChange={(e) =>
                            handleItemFieldChange(
                              item.id,
                              "batchNumber",
                              e.target.value,
                            )
                          }
                        />
                      </td>
                      <td className="px-4 py-2">
                        <input
                          type="text"
                          className="form-control form-control-sm w-24 px-2 py-1 border rounded"
                          value={item.serialNumber}
                          onChange={(e) =>
                            handleItemFieldChange(
                              item.id,
                              "serialNumber",
                              e.target.value,
                            )
                          }
                        />
                      </td>
                      <td className="px-4 py-2">
                        <input
                          type="text"
                          className="form-control form-control-sm w-24 px-2 py-1 border rounded"
                          value={item.packagingDetails}
                          onChange={(e) =>
                            handleItemFieldChange(
                              item.id,
                              "packagingDetails",
                              e.target.value,
                            )
                          }
                        />
                      </td>
                    </tr>
                  ))}
                  {deliveryItems.length === 0 && (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-4 py-4 text-center text-gray-400 bg-white"
                      >
                        No items available for delivery
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Status & Notes Section */}
          <div>
            <h6 className="text-indigo-700 font-semibold mb-2 text-base border-b border-indigo-100 pb-1">
              Status & Notes
            </h6>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block font-semibold mb-1">
                  Delivery Status
                </label>
                <select
                  className="form-select rounded-lg border-2 border-gray-200 p-2 w-full"
                  name="deliveryStatus"
                  value={formData.deliveryStatus}
                  onChange={handleInputChange}
                >
                  <option value="Pending">Pending</option>
                  <option value="Shipped">Shipped</option>
                  <option value="In Transit">In Transit</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Returned">Returned</option>
                  <option value="Failed">Failed</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold mb-1">
                  Acknowledgement
                </label>
                <input
                  type="text"
                  className="form-input rounded-lg border-2 border-gray-200 p-2 w-full"
                  name="acknowledgement"
                  value={formData.acknowledgement}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <div className="mt-4">
              <label className="block font-semibold mb-1">
                Delivery Notes / Instructions
              </label>
              <textarea
                className="form-control rounded-lg border-2 border-gray-200 p-2 w-full"
                rows={2}
                name="deliveryNotes"
                value={formData.deliveryNotes}
                onChange={handleInputChange}
              ></textarea>
            </div>
          </div>
        </div>
        <div className="modal-footer flex flex-col md:flex-row justify-end gap-3 p-6 bg-gray-50 rounded-b-2xl border-t border-gray-100">
          <button
            className="bg-blue-600 hover:bg-blue-500 text-white rounded-full px-8 py-2 font-semibold shadow transition disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={confirmDeliverySchedule}
            disabled={deliveryItems.length === 0}
          >
            {isEdit ? "Update Delivery" : "Schedule Delivery"}
          </button>
          <button
            className="bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-full px-8 py-2 font-semibold shadow transition"
            onClick={onClose}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
