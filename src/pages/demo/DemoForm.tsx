import React, { useState, useRef, useEffect } from "react";
import { FaShoppingCart as ShoppingCart } from "react-icons/fa";
import GeneralInformation, {
  GeneralInformationRef,
} from "../../components/GeneralInformation";
import generalConfig from "../configs/demo/generalInfo.json";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Product } from "../../types/product";
import OpportunityProducts from "../opportunity/OpportunityProducts";
import { useUser } from "../../context/UserContext";
import api from "../../services/api";

// Interface for product options (from user JSON)
interface DemoFormProps {
  onClose?: () => void;
  demoData?: any;
  demoId?: string | undefined;
  demogeneralData?: any;
  product?: Product[];
  options?: Product[];
  checklistNamesByItemId?: { [key: string]: string[] };
  checklistsFromApi?: any[];
  opportunityNumericId?: string;
}

const DemoForm: React.FC<DemoFormProps> = ({
  onClose,
  demoData,
  demoId,
  demogeneralData,
  product,
  checklistNamesByItemId,
  options = [],
  checklistsFromApi = [],
  opportunityNumericId,
}) => {
  console.log(product, "demoData in DemoForm");
  const [oppId, setOpportunityId] = useState<string | null>(demoData?.opportunityId || null);
  const navigate = useNavigate();
  const generalInfoRef = useRef<GeneralInformationRef>(null);
  const [formData, setFormData] = useState<Record<string, any>>(demoData || {});
  const [products, setProducts] = useState<any[]>(product || []);
  const [isLoadingItems, setIsLoadingItems] = useState(false);
  // Checklist state: store selected checklist items from DemoProducts
  const [selectedChecklist, setSelectedChecklist] = useState<
    { checklist_name: string; is_active: boolean }[]
  >([]);
  console.log(formData, "Products in DemoForm");
  const { user, role } = useUser();
  // Only initialize products from props once (on mount), never reset from props after
  // This prevents deleted products from being restored if parent re-renders or props change
  // Remove any useEffect that resets products from product prop

  // Remove manual product selection - items are auto-loaded from opportunity
  // const [productOptions, setProductOptions] = useState<Product[]>([]);


  // Auto-fetch items when opportunity ID changes
  const handleOpportunityChange = async (opportunityId: string) => {
    console.log("handleOpportunityChange called with ID:", opportunityId);
    if (!opportunityId || isLoadingItems) {
      setProducts([]);
      return;
    }

    setIsLoadingItems(true);
    try {
      // 0. Fetch Opportunity details to get leadId for address auto-fill
      try {
        console.log("Fetching opportunity details for address...");
        const oppRes = await api.get(`SalesOpportunity/with-items/by-id/${opportunityId}`);
        console.log("Opportunity details response:", oppRes.data);

        const oppData = oppRes.data?.opportunity;
        // Try to get numeric lead ID. If leadId is "LD00003", numeric part is "3"
        const rawLeadId = oppData?.salesLeadsId || oppData?.leadId;
        let leadIdToFetch = null;

        if (rawLeadId) {
          if (typeof rawLeadId === 'number') {
            leadIdToFetch = rawLeadId;
          } else {
            // Extract numbers from string IDs like "LD00003"
            const numericPart = rawLeadId.toString().replace(/[^0-9]/g, '');
            leadIdToFetch = numericPart ? parseInt(numericPart, 10) : rawLeadId;
          }
        }

        console.log("Identifying lead ID for fetch. Raw:", rawLeadId, "-> To Fetch:", leadIdToFetch);

        if (leadIdToFetch) {
          console.log(`Fetching lead details for address from SalesLead/${leadIdToFetch}...`);
          const leadRes = await api.get(`SalesLead/${leadIdToFetch}`);
          console.log("Lead details response:", leadRes.data);

          if (leadRes.data) {
            const lead = leadRes.data;
            const addrParts = [
              lead.doorNo,
              lead.street,
              lead.landmark,
              lead.area,
              lead.city,
              lead.district,
              lead.state,
              lead.pincode
            ].filter(p => p && String(p).trim() !== "");

            const formattedAddr = addrParts.join(", ");
            console.log("Formatted address:", formattedAddr);

            setFormData(prev => {
              const updated = {
                ...prev,
                address: formattedAddr,
                customerName: lead.customerName || oppData.customerName || prev.customerName,
                demoContact: lead.contactName || oppData.contactName || prev.demoContact,
                contactMobileNum: lead.contactMobileNo || oppData.contactMobileNo || prev.contactMobileNum
              };
              console.log("Updating formData with Lead/Opp details:", {
                customerName: updated.customerName,
                demoContact: updated.demoContact,
                contactMobileNum: updated.contactMobileNum
              });
              return updated;
            });
          }
        }
      } catch (err) {
        console.error("Error fetching lead address:", err);
      }

      // 1. Try the new endpoint requested by the user
      try {
        console.log("Fetching products from SalesActivityTask...");
        const userReqRes = await api.get(`SalesActivityTask/stage/Opportunity/${opportunityId}`);
        if (userReqRes && userReqRes.data && Array.isArray(userReqRes.data) && userReqRes.data.length > 0) {
          const mappedProducts = userReqRes.data.map((item: any) => ({
            ...item,
            itemId: item.itemId || item.id,
            itemName: item.itemName || item.name || item.product,
            quantity: item.qty || item.quantity || 1,
            bomId: item.bomId || item.itemId || item.id
          }));
          setProducts(mappedProducts);
          toast.success(`Loaded ${mappedProducts.length} items!`);
          setIsLoadingItems(false);
          return;
        }
      } catch (e) {
        console.log("SalesActivityTask endpoint failed or returned no items, trying fallbacks...");
      }

      // 2. Try the primary endpoint (same as OpportunityView)
      const res = await api.get(`SalesOpportunity/with-items/by-id/${opportunityId}`);

      if (res && res.data && res.data.items && Array.isArray(res.data.items)) {
        const mappedProducts = res.data.items.map((item: any) => ({
          ...item,
          itemId: item.itemId || item.id,
          itemName: item.itemName || item.name || item.product,
          quantity: item.qty || item.quantity || 1,
          bomId: item.bomId || item.itemId || item.id
        }));
        setProducts(mappedProducts);
        toast.success(`Loaded ${mappedProducts.length} items from opportunity!`);
      } else {
        // 3. Try alternative endpoint
        try {
          const altRes = await api.get(`SalesProducts/stage/Opportunity/${opportunityId}`);
          if (altRes && altRes.data && Array.isArray(altRes.data)) {
            const mappedProducts = altRes.data.map((item: any) => ({
              ...item,
              itemId: item.itemId || item.id,
              itemName: item.itemName || item.name || item.product,
              quantity: item.qty || item.quantity || 1,
              bomId: item.bomId || item.itemId || item.id
            }));
            setProducts(mappedProducts);
            toast.success(`Loaded ${mappedProducts.length} items from opportunity!`);
          } else {
            setProducts([]);
            console.log('No items found for opportunity:', opportunityId);
          }
        } catch (altError) {
          setProducts([]);
          console.log('No items found for opportunity:', opportunityId);
        }
      }
    } catch (err: any) {
      console.error("Error fetching opportunity data:", err);
      setProducts([]);
      // Only show error if it's not a 404 (opportunity might not have items yet)
      if (err.response?.status !== 404) {
        toast.error("Failed to load opportunity items");
      }
    } finally {
      setIsLoadingItems(false);
    }
  };

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [savedDemoId, setSavedDemoId] = useState<string | null>(null);
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const id = searchParams.get("id");
  const RoutePath = location.pathname;
  const currentRouteRaw = RoutePath.split("/")[2];
  const currentRoute = currentRouteRaw
    ? currentRouteRaw.charAt(0).toUpperCase() + currentRouteRaw.slice(1)
    : "";
  console.log(demoData, " formData");
  // Auto-fetch products when opportunity ID is available (consolidated effect)
  useEffect(() => {
    const targetId = opportunityNumericId || formData.opportunityId;
    if (targetId && targetId !== oppId) {
      // Extract numeric ID if the ID contains letters (e.g., OPP00047 -> 47)
      const numericId = targetId.toString().replace(/[^0-9]/g, '');
      const idToUse = numericId || targetId;
      setOpportunityId(targetId); // Update the tracked ID
      handleOpportunityChange(idToUse);
    }
  }, [opportunityNumericId, formData.opportunityId, oppId]);
  console.log(demoData, " formData");

  const getItemIdByName = (name: string) => {
    // Remove this function as productOptions is no longer used
    return undefined;
  };

  const handleSaveDemoWithProducts = async () => {
    if (!generalInfoRef.current?.validateForm()) {
      toast.error("Please fill all required fields before saving the demo.");
      return;
    }
    if (products.length === 0) {
      toast.error("Please add at least one product before saving.");
      return;
    }
    setIsSubmitting(true);
    try {
      const currentFormData = generalInfoRef.current?.getFormData() || formData;
      const {
        title,
        fields,
        countryId,
        userId,
        addressId,
        opportunityId,
        ...cleanedFormData
      } = currentFormData;
      const isEdit =
        Boolean(id) &&
        !(
          currentRouteRaw &&
          currentRouteRaw.toLowerCase().includes("opportunity")
        );
      // Always send demoDate as yyyy-MM-dd string, normalize if user input is dd-MM-yyyy
      let demoDateStr = "";
      if (cleanedFormData.demoDate) {
        if (
          typeof cleanedFormData.demoDate === "string" &&
          cleanedFormData.demoDate.length === 10
        ) {
          // Check if format is dd-MM-yyyy (e.g. 02-08-2025)
          const ddmmyyyy = cleanedFormData.demoDate.match(
            /^(\d{2})-(\d{2})-(\d{4})$/
          );
          if (ddmmyyyy) {
            // Convert to yyyy-MM-dd
            demoDateStr = `${ddmmyyyy[3]}-${ddmmyyyy[2]}-${ddmmyyyy[1]}`;
          } else {
            demoDateStr = cleanedFormData.demoDate; // assume yyyy-MM-dd
          }
        } else {
          // fallback: format as yyyy-MM-dd
          const d = new Date(cleanedFormData.demoDate);
          demoDateStr = d.toISOString().split("T")[0];
        }
      } else {
        demoDateStr = new Date().toISOString().split("T")[0];
      }

      // Build the demo object with correct field names (camelCase)
      const demo = {
        userCreated: user?.userId || 0,
        demoName: cleanedFormData.demoName || "",
        status:
          cleanedFormData.status === "New"
            ? "Demo Requested"
            : cleanedFormData.status || "",
        demoDate: demoDateStr,
        demoContact: cleanedFormData.demoContact || "",
        demoApproach: cleanedFormData.demoApproach || "",
        demoOutcome: cleanedFormData.demoOutcome || "",
        demoFeedback: cleanedFormData.demoFeedback || "",
        comments: cleanedFormData.comments || "",
        userId: user?.userId || 0,
        address: cleanedFormData.address || cleanedFormData.Address || "",
        opportunityId:
          demoData?.opportunityId ||
          formData.opportunityId ||
          cleanedFormData.opportunityId ||
          "",
        contactMobileNum: cleanedFormData.contactMobileNum || "",
        presenterIds:
          cleanedFormData.presenterId || cleanedFormData.presenterIds || [],
        leadId: cleanedFormData.leadId || "",
        customerName: cleanedFormData.customerName || "",
        demoTime: cleanedFormData.demoTime || "",
      };

      // Transform products to match the required items structure with BOM details
      const items = products.map((product) => ({
        bomId: product.bomId || product.itemId,
        quantity: product.quantity || 1,
        // Include accessory items if available
        accessoryItemIds: product.accessoryItemIds || []
      }));

      // Transform checklists to match the required structure
      const checklists = (selectedChecklist || [])
        .filter((item) => item.is_active)
        .map((item) => ({
          checklistName: item.checklist_name,
          isActive: true,
        }));

      const requestBody = {
        demo,
        items,
        stage: "Demo",
        checklists,
      };
      let apiUrl = "SalesDemo/with-items";
      let method = "POST";
      if (isEdit) {
        apiUrl = `SalesDemo/with-items/${id}`;
        method = "PUT";
      }
      let response;
      if (method === "POST") {
        response = await api.post(apiUrl, requestBody);
      } else {
        response = await api.put(apiUrl, requestBody);
      }
      if (!response || response.status < 200 || response.status >= 300) {
        const errorData = response?.data || null;
        throw new Error(
          errorData?.message ||
          `Failed to save demo with products: ${response?.status}`
        );
      }
      toast.success("Demo and products saved successfully! 🎉");
      onClose?.();
      navigate("/sales/demos");
    } catch (error) {
      console.error("Error saving demo with products:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to save demo with products"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  console.log(formData, "sssss:::");
  const handleCancel = () => {
    navigate("/sales/opportunities");
    onClose?.();
  };

  // Dynamically add Demo Outcome and Feedback fields in edit mode only
  const isEditMode =
    location.pathname.includes("demo") &&
    Boolean(demoId || (demoData && demoData.id));
  let dynamicConfig = {
    ...generalConfig,
    fields: generalConfig.fields.map((f) =>
      f.id === "customerName" ? { ...f, disabled: true } : f
    ),
  };
  if (isEditMode) {
    dynamicConfig = {
      ...dynamicConfig,
      fields: [
        ...dynamicConfig.fields,
        {
          fieldName: "Demo Outcome",
          id: "demoOutcome",
          type: "text",
          required: false,
        },
        {
          fieldName: "Feedback",
          id: "demoFeedback",
          type: "text",
          required: false,
        },
      ],
    };
  }

  // In create mode, set status to read-only and autofill with 'Demo Requested'
  useEffect(() => {
    if (!isEditMode) {
      setFormData((prev) => {
        if (prev.status !== "Demo Requested") {
          return { ...prev, status: "New" };
        }
        return prev;
      });
    }
  }, [isEditMode, setFormData]);
  if (!isEditMode) {
    dynamicConfig = {
      ...dynamicConfig,
      fields: dynamicConfig.fields.map((f) =>
        f.id === "status" ? { ...f, readOnly: true } : f
      ),
    };
  }

  useEffect(() => {
    // Patch: Bind presenterName and presenterId arrays in edit mode if presenterNames or presenterIds are present in demoData
    if (demoData) {
      setFormData((prev: any) => {
        let updated = { ...prev, ...demoData };
        // If presenterNames (array of usernames) is present but presenterName is not, set presenterName
        if (Array.isArray(demoData.presenterNames) && !prev.presenterName) {
          updated.presenterName = demoData.presenterNames;
        }
        // If presenterIds (array of ids) is present but presenterId is not, set presenterId
        if (Array.isArray(demoData.presenterIds) && !prev.presenterId) {
          updated.presenterId = demoData.presenterIds.map(String);
        }
        return updated;
      });
    }
  }, [demoData]);

  return (
    <div className="p-8 bg-gray-100">
      <div className="relative top-0 right-0 "></div>{" "}
      <div className="bg-white rounded-xl shadow-lg p-4 border border-gray-200 w-full flex flex-col gap-4">
        {/* General Information Section */}

        <GeneralInformation
          ref={generalInfoRef}
          config={dynamicConfig}
          type="Demo"
          data={demoData}
          formData={formData}
          setFormData={setFormData}
        />


        {/* Auto-loaded Items Info */}
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-2">
            {isLoadingItems ? (
              <svg className="w-5 h-5 text-blue-600 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
            <span className="text-sm font-medium text-blue-800">
              {isLoadingItems ? "Loading items from opportunity..." : "Items are automatically loaded from the selected opportunity"}
            </span>
          </div>
          <p className="text-xs text-blue-600 mt-1">
            {isLoadingItems ? "Please wait..." : "Select an opportunity ID in the form above to automatically populate items"}
          </p>
        </div>

        {/* Hierarchical View of Items from Opportunity */}
        <div className="mb-4">
          <h4 className="font-semibold mb-4 text-gray-800 flex items-center gap-2">
            <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            Items from Opportunity
          </h4>

          {products.length === 0 ? (
            <div className="text-gray-500 text-sm p-8 bg-gray-50 rounded-xl border border-dashed border-gray-300 text-center">
              <ShoppingCart className="mx-auto mb-3 text-gray-300" size={40} />
              <p>No items loaded. Please select an opportunity ID to automatically load items.</p>
            </div>
          ) : (
            <div className="border rounded-xl overflow-hidden bg-white shadow-sm">
              <OpportunityProducts
                isEdit={false}
                product={{
                  items: products.map(item => ({
                    ...item,
                    // Ensure basic BOM structure if not present
                    bomId: item.bomId || item.itemId || item.id,
                    bomName: item.bomName || item.itemName || item.name || item.product,
                    bomType: item.bomType || item.categoryName || 'Product',
                    quantity: item.quantity || item.qty || 1,
                    bomChildItems: item.bomChildItems || item.childItems || item.ChildItems || [],
                    accessoryItems: item.accessoryItems || item.accessoriesItems || []
                  }))
                }}
              />
            </div>
          )}
        </div>
        <div className="flex justify-end gap-4 mt-2">
          <button
            type="button"
            className={`px-6 py-2 rounded ${formData.stageItemId
                ? "bg-gray-200 cursor-not-allowed"
                : "bg-gray-300 hover:bg-gray-400"
              }`}
            disabled={formData.stageItemId}
            onClick={handleCancel}
            title={
              formData.stageItemId
                ? "Please save products before leaving"
                : "Cancel"
            }
          >
            Cancel
          </button>
          <button
            type="button"
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            onClick={handleSaveDemoWithProducts}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Saving..." : "Save Demo & Products"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DemoForm;
