import React, { useState, useRef, useEffect } from "react";
import GeneralInformation, {
  GeneralInformationRef,
} from "../../components/GeneralInformation";
import generalConfig from "../configs/opportunity/generalInfo.json";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { EnhancedProduct } from "../../types/product";
// import SalesEntityTable, {
//   EnhancedProduct,
// } from "../../components/common/SalesEntityTable";
import { useUser } from "../../context/UserContext";
import api from "../../services/api";
import OpportunityProducts from "./OpportunityProducts";

interface OppFormProps {
  onClose?: () => void;
  onSuccess?: () => void;
  opportunityData?: any;
  opportunityId?: string | undefined;
  fromLead?: boolean;
  isNew?: boolean;
  setLeadStatus?: (status: string) => void;
  isEdit?: boolean;
}

const OpportunityForm: React.FC<OppFormProps> = ({
  onClose,
  onSuccess,
  opportunityData,
  opportunityId,
  fromLead = false,
  isNew = true,
  setLeadStatus,
  isEdit = false, // New prop to indicate if this is an edit form
}) => {
  console.log("OpportunityForm mounted with data:", opportunityData);
  const navigate = useNavigate();
  const generalInfoRef = useRef<GeneralInformationRef>(null);
  const [opportunityStatus] = useState<string>("Identified");
  const { user, role } = useUser();
  const [formData, setFormData] = useState<Record<string, any>>(() => {
    const initialData = opportunityData || {};
    // If status is provided by API, use it; otherwise, default to 'Identified'
    const statusFromApi = initialData.status || initialData.Status;
    // Ensure customerName is always present (handle different casings)
    const customerName =
      initialData.customerName ||
      initialData.CustomerName ||
      (initialData.fields && initialData.fields.customerName) ||
      "";
    return {
      ...initialData,
      status: isNew ? "New" : statusFromApi || "Identified",
      customerName,
      fields: {
        ...initialData.fields,
        leadId: initialData.leadId || initialData.fields?.leadId,
        customerName,
      },
    };
  });

  // Helper to map item names to itemIds using productOptions
  const [productOptions, setProductOptions] = useState<any[]>([]);
  useEffect(() => {
    // Fetch product options for mapping names to ids
    const fetchProductOptions = async () => {
      try {
        const res = await fetch(
          "${process.env.REACT_APP_API_BASE_URL}/ProductDropdown/product-list"
        );
        if (!res.ok) throw new Error("Failed to fetch product options");
        const data = await res.json();
        setProductOptions(data);
      } catch (err) {
        setProductOptions([]);
      }
    };
    fetchProductOptions();
  }, []);

  const getItemIdByName = (name: string) => {
    const found = productOptions.find((p) => p.itemName === name);
    return found ? found.itemId : undefined;
  };

  const transformToEnhancedProducts = (apiItems: any[]): EnhancedProduct[] => {
    return apiItems
      .filter((item: any) => item.bomId && !/^\d+$/.test(String(item.bomId)))
      .map((item: any) => ({
      bomId: item.bomId ? String(item.bomId) : String(item.itemId || ''),
      bomName: item.bomName || item.itemName || '',
      bomType: item.bomType || item.category || item.categoryName || '',
      bomChildItems: Array.isArray(item.bomChildItems)
        ? item.bomChildItems.map((child: any) => ({
            id: child.id || child.childItemId || 0,
            itemId: child.itemId || child.childItemId || child.id || 0,
            make: child.make || '',
            model: child.model || '',
            product: child.product || '',
            itemName: child.itemName || '',
            itemCode: child.itemCode || '',
            unitPrice: child.unitPrice || child.price || 0,
            quoteRate: child.quoteRate || child.quotationRate || child.saleRate || child.unitPrice || 0,
            hsn: child.hsn || '',
            taxPercentage: child.taxPercentage || 0,
            categoryName: child.categoryName || child.category || '',
          }))
        : [],
      accessoryItemIds: item.accessoryItemIds || [],
      accessoryItems: Array.isArray(item.accessoryItems)
        ? item.accessoryItems
        : Array.isArray(item.accessoriesItems)
        ? item.accessoriesItems
        : [],
      quantity: item.quantity || item.qty || 1,
      itemId: item.itemId || 0,
      itemName: item.itemName || '',
      category: item.category || item.categoryName || '',
      unitPrice: item.unitPrice || 0,
      hsn: item.hsn || '',
      taxPercentage: item.taxPercentage || 0,
      make: item.make || '',
      model: item.model || '',
      userCreated: item.userCreated || 0,
      dateCreated: item.dateCreated || '',
      userUpdated: item.userUpdated || 0,
      dateUpdated: item.dateUpdated || '',
      isActive: item.isActive ?? true,
    }));
  };
  const [products, setProducts] = useState<EnhancedProduct[]>(
    Array.isArray(opportunityData?.products)
      ? transformToEnhancedProducts(opportunityData.products)
      : []
  );

  // Transform EnhancedProduct to BomItem
  const transformToBomItems = (products: EnhancedProduct[]) => {
    return products
      .filter((p) => p.bomId && !/^\d+$/.test(p.bomId))
      .map((p) => ({
      bomId: p.bomId,
      bomName: p.bomName,
      bomType: p.bomType,
      bomChildItems: p.bomChildItems,
      accessoryItemIds: p.accessoryItemIds,
      accessoryItems: p.accessoryItems,
      quantity: p.quantity,
      quoteRate: (p as any).quoteRate || 0,
    }));
  };
  console.log(products, "products in OpportunityForm");
  const [originalProducts, setOriginalProducts] = useState<EnhancedProduct[]>(
    []
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const id = searchParams.get("id");
  const RoutePath = location.pathname;
  const currentRouteRaw = RoutePath.split("/")[2];
  const currentRoute = currentRouteRaw
    ? currentRouteRaw.charAt(0).toUpperCase() + currentRouteRaw.slice(1)
    : "";

  console.log(opportunityData, "Opp");
  useEffect(() => {
    if (opportunityData) {
      // Ensure customerName is always present (handle different casings)
      const customerName =
        opportunityData.customerName ||
        opportunityData.CustomerName ||
        (opportunityData.fields && opportunityData.fields.customerName) ||
        "";
      setFormData((current) => ({
        ...current,
        ...opportunityData,
        customerName,
        fields: {
          ...current.fields,
          ...opportunityData.fields,
          leadId: opportunityData.leadId || opportunityData.fields?.leadId,
          customerName,
        },
      }));
    }
  }, [opportunityData]);
  console.log(formData, "formData");
  const handleCancel = () => {
    if (fromLead) {
      setLeadStatus?.("Lead");
      onClose?.();
      return;
    }
    if (formData.stageItemId) {
      toast.info(
        "Please save products before leaving. You've already saved the general information."
      );

      return;
    }
    navigate("/sales/opportunities");
    onClose?.();
  };

  useEffect(() => {
    const fetchOpportunityWithItems = async () => {
      if (!id) return;
      try {
        const res = await fetch(
          `${process.env.REACT_APP_API_BASE_URL}/SalesOpportunity/with-items/by-id/${id}`
        );
        if (!res.ok) throw new Error("Failed to fetch opportunity with items");
        const data = await res.json();
        if (data.Opportunity) {
          // Ensure customerName is always present (handle different casings)
          const customerName =
            data.Opportunity.customerName ||
            data.Opportunity.CustomerName ||
            (data.Opportunity.fields && data.Opportunity.fields.customerName) ||
            "";
          setFormData((current) => ({
            ...current,
            ...data.Opportunity,
            customerName,
            fields: {
              ...current.fields,
              ...data.Opportunity,
              leadId:
                data.Opportunity.leadId ||
                data.Opportunity.LeadId ||
                current.fields?.leadId,
              customerName,
            },
          }));
        }
        setProducts(
          Array.isArray(data.items)
            ? transformToEnhancedProducts(data.items)
            : []
        );
        setOriginalProducts(
          Array.isArray(data.items)
            ? transformToEnhancedProducts(data.items)
            : []
        );
      } catch (err) {
        console.error("Error fetching opportunity with items:", err);
        toast.error("Failed to load opportunity details");
      }
    };
    // Only call when route is exactly /opportunity and id exists and not isNew
    if (
      id &&
      !isNew &&
      location.pathname.toLowerCase().endsWith("/opportunity")
    ) {
      fetchOpportunityWithItems();
    }
  }, [id, isNew, location.pathname]);
  console.log(formData, "formData in OpportunityForm");
  const handleSave = async () => {
    if (!generalInfoRef.current?.validateForm()) {
      toast.error("Please fix the validation errors before saving.");
      return;
    }
    if (products.length === 0) {
      toast.error("Please add at least one product");
      return;
    }
    setIsSubmitting(true);
    try {
      const currentFormData = generalInfoRef.current?.getFormData() || formData;
      const isEdit =
        location.pathname.toLowerCase().includes("opportunity") && !!id;
      // Build Opportunity object to match required API structure
      const Opportunity = {
        Id: isEdit ? Number(id) : 0,
        UserCreated: user?.userId,
        DateCreated: new Date().toISOString(),
        UserUpdated: user?.userId,
        DateUpdated: new Date().toISOString(),
        Status: currentFormData.status || "",
        ExpectedCompletion:
          currentFormData.expectedCompletion || new Date().toISOString(),
        OpportunityType: currentFormData.opportunityType || "",
        OpportunityFor: currentFormData.opportunityFor || "",
        CustomerId: currentFormData.customerId || "",
        CustomerName: currentFormData.customerName || "",
        CustomerType: currentFormData.customerType || "",
        OpportunityName: currentFormData.opportunityName || "",
        OpportunityId: currentFormData.opportunityId || "",
        Comments: currentFormData.comments || "",
        IsActive: true,
        LeadId: currentFormData.leadId || "",
        SalesLeadsId: Number(currentFormData.salesLeadsId) || 0,
        SalesRepresentativeId:
          Number(currentFormData.salesRepresentativeId) || 0,
        ContactName: currentFormData.contactName || "",
        ContactMobileNo: currentFormData.contactMobileNo || "",
      };
      // Build Items array — filter out invalid items (no proper bomId)
      const Items = products
        .filter((product) => product.bomId && !/^\d+$/.test(product.bomId))
        .map((product) => ({
        BomId: product.bomId,
        AccessoryItemIds: product.accessoryItems.map((a: any) => a.itemId),
        AccessoryItems: product.accessoryItems.map((a: any) => ({
          AccessoryDetailId: a.itemId,
          AccessoriesName: a.itemName,
          Qty: a.quantity,
          ItemType: a.categoryName,
          ParentChildItemId: a.parentChildItemId ?? null,
        })),
        Quantity: product.quantity,
      }));
      const payload = {
        Opportunity,
        Items,
      };
      console.log("Payload to save:", payload);
      const url = isEdit
        ? `SalesOpportunity/with-items/${id}`
        : "SalesOpportunity/with-items";
      const response = await api[isEdit ? "put" : "post"](url, payload);
      if (response.status < 200 || response.status >= 300) {
        const errorData = await response.data.catch(() => null);
        throw new Error(
          errorData?.message || `Failed to save data: ${response.status}`
        );
      }
      toast.success("Opportunity and products saved successfully! 🎉");
      onSuccess?.();
      onClose?.();
      navigate("/sales/opportunities");
    } catch (error) {
      console.error("Error saving opportunity and products:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to save opportunity and products"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleProductChange = (updatedProducts: { items: any[] }) => {
    const enhancedProducts: EnhancedProduct[] = updatedProducts.items
      .filter((p: any) => p.bomId && !/^\d+$/.test(String(p.bomId)))
      .map((p: any) => ({
        bomId: p.bomId || "",
        bomName: p.bomName || "",
        bomType: p.bomType || "",
        bomChildItems: p.bomChildItems || [],
        accessoryItemIds: p.accessoryItemIds || [],
        accessoryItems: p.accessoryItems || [],
        quantity: p.quantity || 0,
      })
    );
    setProducts(enhancedProducts);
  };

  const [selectedBomId, setSelectedBomId] = useState<string>("");
  const [selectedAccessoryItemIds, setSelectedAccessoryItemIds] = useState<
    number[]
  >([]);
  const [selectedQuantity, setSelectedQuantity] = useState<number>(1);
  useEffect(() => {
    console.log(selectedBomId, "bomID");
  });
  return (
    <div className="p-4 bg-gray-100 min-h-screen">
      <div className="w-full flex flex-col gap-2">
        {/* Opportunity Form Section */}

        <div className="bg-white rounded-xl shadow-lg p-4 border border-gray-200 w-full flex flex-col gap-4">
          <GeneralInformation
            ref={generalInfoRef}
            config={(() => {
              // Use boolean condition to control disabled state for each field
              const configCopy = JSON.parse(JSON.stringify(generalConfig));
              for (const field of configCopy.fields) {
                // Example: disable 'leadId' and 'customerName' only in edit mode
                if (
                  field.id === "leadId" ||
                  field.id === "customerName" ||
                  field.id === "contactName" ||
                  field.id === "contactMobileNo" ||
                  field.id === "opportunityFor"
                ) {
                  field.disabled = isEdit; // disables if not new, enables if new
                }
                // You can add more conditions for other fields as needed
                // For all other fields, keep their default disabled state
              }
              return configCopy;
            })()}
            type="Opportunity"
            data={opportunityData}
            formData={formData}
            setFormData={setFormData}
            onSuccess={onSuccess}
          />

          <OpportunityProducts
            onProductChange={handleProductChange}
            product={{ items: transformToBomItems(products || []) }}

            // onProductsChange={(updatedProducts) =>
            //   setProducts(transformToEnhancedProducts(updatedProducts))
            // }
            // showActions={true}
            // showButton={true}
            // onSaveProducts={(
            //   products: any,
            //   bomId?: string,
            //   accessoryItemIds?: number[],
            //   quantity?: number
            // ) => {
            //   setSelectedBomId(bomId || "");
            //   setSelectedAccessoryItemIds(accessoryItemIds || []);
            //   setSelectedQuantity(quantity || 1);
            //   setProducts(transformToEnhancedProducts(products));
            //   console.log(
            //     "Saving products:",
            //     products,
            //     bomId,
            //     accessoryItemIds,
            //     quantity
            //   );
            // }}
            // products={products.map((product) => ({
            //   ...product,
            //   userCreated:
            //     typeof product.userCreated === "number"
            //       ? product.userCreated
            //       : 0,
            //   dateCreated:
            //     typeof product.dateCreated === "string"
            //       ? product.dateCreated
            //       : "",
            //   userUpdated:
            //     typeof product.userUpdated === "number"
            //       ? product.userUpdated
            //       : 0,
            //   dateUpdated:
            //     typeof product.dateUpdated === "string"
            //       ? product.dateUpdated
            //       : "",
            // }))}
          />
          {/* Save Button at the end of the page */}
          <div className="flex justify-end gap-4 mt-6">
            <button
              type="button"
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              onClick={handleSave}
              disabled={isSubmitting || products.length === 0}
            >
              {isSubmitting ? "Saving..." : "Save"}
            </button>
            <button
              type="button"
              className={`px-6 py-2 rounded ${
                isSubmitting
                  ? "bg-gray-200 cursor-not-allowed"
                  : "bg-gray-300 hover:bg-gray-400"
              }`}
              disabled={isSubmitting}
              onClick={handleCancel}
              title={
                formData.stageItemId
                  ? "Please save products before leaving"
                  : "Cancel"
              }
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OpportunityForm;
