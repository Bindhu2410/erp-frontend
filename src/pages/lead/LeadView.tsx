import React, { useState, useEffect } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import api from "../../services/api";
import {
  FiArrowLeft,
  FiPrinter,
  FiMail,
  FiPhone,
  FiMoreVertical,
  FiChevronDown,
  FiBriefcase,
  FiFileText,
  FiMonitor,
  FiBox,
  FiMapPin,
  FiHome,
  FiSmartphone,
  FiStar,
} from "react-icons/fi";
import { CgWebsite } from "react-icons/cg";
import { FaBuilding, FaTrash } from "react-icons/fa";
import Tab from "../../components/common/Tab";
import { MdEdit, MdOutlineFax } from "react-icons/md";
import Modal from "../../components/common/Modal";
import DataTable from "../../components/common/DataTable";
import { toast } from "react-toastify";
import ConfirmBox from "../../components/common/ConfirmBox";

import LeadForm from "./LeadForm";
import OpportunityForm from "../opportunity/OpportunityForm";
import { setMonth } from "date-fns";
import axios from "axios";
import { appendFile } from "fs/promises";
const InfoCard: React.FC<{
  icon: React.ElementType | string;
  label: string;
  value: string;
  iconBg?: string;
  iconColor?: string;
}> = ({
  icon: Icon,
  label,
  value,
  iconBg = "bg-orange-100",
  iconColor = "text-orange-600",
}) => (
  <div className="flex items-center gap-3 p-3 bg-white rounded-lg transition-colors hover:shadow-md">
    <div className={`p-2 ${iconBg} rounded-full flex-shrink-0`}>
      {typeof Icon === "string" ? (
        <span
          className={`text-lg ${iconColor} font-bold flex items-center justify-center h-4 w-4`}
        >
          {Icon}
        </span>
      ) : (
        <Icon className={`w-4 h-4 ${iconColor}`} />
      )}
    </div>
    <div className="flex flex-col gap-1 min-w-0 flex-1">
      <span className="text-gray-500 text-xs">{label}</span>
      <span className="text-gray-800 font-medium break-all overflow-hidden text-ellipsis">
        {value}
      </span>
    </div>
  </div>
);

// Section component to reduce repetition
interface SectionProps {
  title: string;
  icon: React.ElementType;
  count?: number;
  children: React.ReactNode;
  isOpen: boolean;
  toggle: () => void;
  onSuccess?: () => void;
  leadData?: any;
}

const Section: React.FC<SectionProps> = ({
  title,
  icon: Icon,
  count,
  children,
  isOpen,
  leadData,
  toggle,
  onSuccess,
}) => {
  const [ismodelOpen, setISModelOpen] = useState<boolean>(false);

  return (
    <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 transition-all hover:shadow-xl group">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="p-1.5 sm:p-2 bg-orange-50 rounded-lg group-hover:bg-orange-100 transition-colors">
            <Icon className="w-5 h-5 text-orange-500" />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm sm:text-lg text-gray-800">{title}</span>
            {count !== undefined && (
              <span className="inline-flex items-center justify-center px-2 py-0.5 text-xs font-medium rounded-full bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700">
                {count}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1">
          {title === "Opportunity" && (
            <div className="relative group inline-block">
              <button
                className="bg-orange-500 px-2 py-1.5 sm:px-3 sm:py-2 text-xs sm:text-sm border rounded-md text-white disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed"
                onClick={() => setISModelOpen(true)}
                disabled={
                  leadData?.status?.toLowerCase() === "new" ||
                  leadData?.status?.toLowerCase() === "converted" ||
                  (React.isValidElement(children) &&
                  Array.isArray(children.props?.data)
                    ? children.props.data.length > 0
                    : false)
                }
              >
                Create Opportunity
              </button>
              {(leadData?.status?.toLowerCase() === "converted" ||
                leadData?.status?.toLowerCase() === "new" ||
                leadData?.status?.toLowerCase() === "disqualified") && (
                <span className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-max bg-black text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 shadow-lg whitespace-nowrap">
                  {leadData?.status?.toLowerCase() === "converted"
                    ? "Opportunity is already converted."
                    : leadData?.status?.toLowerCase() === "new"
                    ? "Qualify the lead before creating an opportunity."
                    : ""}
                </span>
              )}
            </div>
          )}
          <button
            onClick={toggle}
            className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-all"
          >
            <FiChevronDown
              className={`w-4 h-4 sm:w-5 sm:h-5 text-gray-500 transform transition-transform ${
                !isOpen ? "-rotate-180" : ""
              }`}
            />
          </button>
        </div>
      </div>
      {isOpen && children}
      <Modal
        isOpen={ismodelOpen}
        onClose={() => {
          setISModelOpen(false);
          onSuccess && onSuccess();
        }}
        title="Opportunity Details"
      >
        {(() => {
          const { comments, ...leadDataWithoutComments } = leadData || {};
          return (
            <OpportunityForm
              fromLead={true}
              opportunityData={{
                ...leadData,
                opportunityFor: "Lead",
                leadId: leadData.leadId,
                fields: { ...leadData.fields, leadId: leadData.leadId },
                ...(leadData.comments ? { comments: undefined } : {}),
                ...(leadData.status ? { status: "Identified" } : {}),
                ...(leadData.externalComment ? { externalComment: undefined } : {}),
              }}
              isNew={true}
              onClose={() => {
                setISModelOpen(false);
                onSuccess && onSuccess();
              }}
              onSuccess={onSuccess}
              isEdit={true}
            />
          );
        })()}
      </Modal>
    </div>
  );
};

const LeadView: React.FC = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const id = searchParams.get("id");
  const [leadData, setLeadData] = useState<any>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [opportunities, setOpportunities] = useState<any>({});
  const [demo, setDemo] = useState<any>([]);
  const [quotation, setQuotation] = useState<any>([]);
  const navigate = useNavigate();
  const [isModelOpen, setISModelOpen] = useState(false);
  const [leadStatus, setLeadStatus] = useState<string>("Lead");
  const fetchLeadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get(`SalesLead/${id}`);
      setLeadData(response.data);
      console.log("Lead data fetched successfully:", response.data);
    } catch (err: any) {
      let errorMessage = "An error occurred while fetching lead data";

      if (err.status === 404) {
        errorMessage = "No record found for this lead";
      } else if (err.data?.message) {
        errorMessage = err.data.message;
      }

      setError(errorMessage);
      toast.error(errorMessage);
      console.error("Error fetching lead data:", {
        status: err.status,
        message: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    fetchLeadData();
  }, [id]);
  // Fetch opportunity data and bind only the opportunity details (not items) to the DataTable
  const fetchOpportunityData = async (): Promise<void> => {
    try {
      const response = await api.post("SalesOpportunity/lead/by-leadid", {
        leadId: leadData.leadId,
      });
      console.log("Response from API:", response.data);
      const data = response.data;
      // If the response is in the format { opportunity: {...}, items: [...] }
      // Bind only the opportunity details (as an array) for the DataTable
      if (data && data.opportunity) {
        setOpportunities([data.opportunity]);
      } else if (Array.isArray(data.opportunity)) {
        setOpportunities(data.opportunity);
      } else {
        setOpportunities([]);
      }
    } catch (error) {
      console.error("Error fetching opportunities:", error);
      setOpportunities([]);
    }
  };

  useEffect(() => {
    fetchOpportunityData();
  }, [leadData.leadId]);

  console.log(opportunities, "opportunitiesxxx");
  useEffect(() => {
    if (!leadData.leadId) return;
    const fetchQuotationData = async () => {
      try {
        const response = await api.get(`SalesLead/${id}/quotations-with-items`);
        // Map the API response to extract the 'quotation' object from each item
        const mappedQuotations = (response.data || []).map((item: any) => ({
          id: item.quotation?.id,
          quotationId: item.quotation?.quotationId,
          quotationType: item.quotation?.quotationType,
          customerName: item.quotation?.customerName,
          quotationDate: item.quotation?.quotationDate
            ? new Date(item.quotation.quotationDate).toLocaleDateString("en-GB")
            : "",
          orderType: item.quotation?.orderType,
          salesOrderId: item.quotation?.salesOrderId,
          status: item.quotation?.status,
        }));
        setQuotation(mappedQuotations);
      } catch (error: any) {
        console.error("Error fetching leads:", error);
      }
    };

    fetchQuotationData();
  }, [leadData.leadId]);

  const [businessData, setBusinessData] = useState<any>({
    businessChallenge: [],
    product: [],
  });

  const leadtabs = [
    {
      label: "Contacts",
      name: "contacts",
      data: leadData ? leadData.contacts : "",
      leadId: id ?? "",
      stage: "Lead",
      stageItemId: id ?? "",
    },
    {
      label: "Addresses",
      name: "Address",
      data: leadData ? leadData.addresses : "",
      leadId: leadData.leadId ?? "",
      stage: "Lead",
      stageItemId: leadData.id ?? "",
    },
    {
      label: "Activities",
      name: "activities",
      stage: "Lead",
      stageItemId: id ?? "",
    },
    {
      label: "External Comments",
      name: "externalComment",
      stage: "Lead",
      stageItemId: id ?? "",
    },
    {
      label: "Email",
      name: "email",
      data: [{ email: leadData?.email }],
    },
    {
      label: "Summary",
      name: "summary",
      stageItemId: id ?? "",
    },
  ];

  // Unified state for section visibility
  const [visibleSections, setVisibleSections] = useState({
    deals: true,
    quotations: true,
    demos: true,
    opportunities: true,
  });

  const toggleSection = (section: keyof typeof visibleSections) => {
    setVisibleSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };
  const address = leadData
    ? [
        leadData.doorNo,
        leadData.street,
        leadData.landmark,
        leadData.city,
        leadData.district,
        leadData.state,
        leadData.pincode,
      ]
        .filter((part) => part && part.trim() !== "")
        .join(", ")
    : "";
  // Contact info items for the sidebar
  const contactInfoItems = [
    { icon: FiSmartphone, label: "Contact Name", value: leadData?.contactName },
    { icon: FiPhone, label: "Phone", value: leadData?.contactMobileNo },
    { icon: FiPhone, label: "Landline", value: leadData?.landLineNo },
    {
      icon: FiMail,
      label: "Email",
      value: leadData?.email,
    },

    { icon: FiHome, label: "Address", value: address },
  ];
  console.log("leadData", leadData);
  // Key info items for the sidebar
  const keyInfoItems = [
    { icon: "+", label: "Lead Type", value: leadData?.leadType },
    { icon: FiBriefcase, label: "Job Title", value: leadData?.jobTitle },
    { icon: FaBuilding, label: "Lead Source", value: leadData?.leadSource },
    { icon: FiMapPin, label: "Zone", value: leadData?.zone },
    { icon: MdOutlineFax, label: "Fax", value: leadData?.fax },
    { icon: CgWebsite, label: "Website", value: leadData?.website },
  ].filter((item) => item.value); // Only show items with values
  useEffect(() => {
    if (leadData) {
      setBusinessData({
        product: leadData.products,
        businessChallenge: leadData.businessChallenges,
      });
    }
  }, [leadData]);
  // Section definitions
  const sections: Array<{
    id: keyof typeof visibleSections;
    title: string;
    icon: React.ElementType;
    count?: number;
    columns: Array<string | { label: string; key: string }>;
    data: any[];
  }> = [
    {
      id: "quotations",
      title: "Quotation",
      icon: FiFileText,
      count: quotation.length,
      columns: [
        { label: "Quote ID", key: "quotationId" },
        { label: "Quotation Type", key: "quotationType" },
        { label: "Quotation Date", key: "quotationDate" },
        { label: "Customer Name", key: "customerName" },

        { label: "Status", key: "status" },
      ],
      data: quotation,
    },
    {
      id: "opportunities",
      title: "Opportunity",
      icon: FiBox,
      count: Array.isArray(opportunities) ? opportunities.length : 0,
      columns: [
        { label: "Opp ID", key: "opportunityId" },
        { label: "Opp For", key: "opportunityFor" },
        { label: "Opp Type", key: "opportunityType" },
        { label: "Contact Name", key: "contactName" },
        { label: "Contact No", key: "contactMobileNo" },
        { label: "Status", key: "status" },
      ],
      data: Array.isArray(opportunities) ? opportunities : [],
    },
  ];
  console.log("opportunities", sections);
  const [modal, setModal] = useState<boolean>(false);
  const EditLeadForm = () => {
    setModal(true);
  };
  const [showDropdown, setShowDropdown] = useState(false);
  const [leftPanelOpen, setLeftPanelOpen] = useState(false);

  const [selectedItem, setSelectedItem] = useState<string | number | null>(
    null
  );
  const openModel = () => {
    setSelectedItem(id);
    setISModelOpen(true);
  };

  const closeModel = () => {
    setISModelOpen(false);
    setSelectedItem(null);
  };

  const handleDelete = async () => {
    try {
      await api.delete(`SalesLead/${id || ""}`);
      toast.success("Lead deleted successfully");
      navigate(-1);
    } catch (error: any) {
      console.error("Error deleting lead:", error);
      toast.error(error.message || "Failed to delete lead");
    } finally {
      setISModelOpen(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-600">
          {error}
        </div>
      </div>
    );
  }

  if (!leadData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">No lead data found</div>
      </div>
    );
  }

  const getInitials = (fullName?: string | null): string => {
    if (!fullName || typeof fullName !== "string") return "";
    const salutations = [
      "mr",
      "mrs",
      "ms",
      "miss",
      "dr",
      "prof",
      "sir",
      "madam",
    ];

    // Split name, filter out salutations
    const names = fullName
      .trim()
      .split(" ")
      .filter(
        (word) => !salutations.includes(word.toLowerCase().replace(".", ""))
      );

    const firstInitial = names[0]?.charAt(0).toUpperCase() || "";
    const secondInitial = names[1]?.charAt(0).toUpperCase() || "";

    return firstInitial + secondInitial;
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <div className="bg-white px-3 sm:px-4 py-3 border-b shadow-sm sticky top-0 z-30">
        <div className="flex items-center justify-between max-w-screen-2xl mx-auto">
          <div className="flex items-center gap-2 sm:gap-4">
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors" onClick={() => navigate(-1)}>
              <FiArrowLeft className="text-xl text-gray-600 hover:text-orange-500" />
            </button>
            <h1 className="text-base sm:text-xl font-semibold text-gray-800">Lead Details</h1>
          </div>
          <div className="flex items-center gap-2">
            {/* Mobile: toggle left panel */}
            <button
              className="sm:hidden p-2 hover:bg-orange-50 rounded-lg border border-orange-200 text-orange-600 text-xs font-medium"
              onClick={() => setLeftPanelOpen((v) => !v)}
            >
              {leftPanelOpen ? "Hide Info" : "View Info"}
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <FiPrinter className="text-gray-600 w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <select className="border rounded-lg px-2 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-600">
              <option>Export</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col sm:flex-row flex-1 w-full mx-auto my-2 gap-2 p-2">
        {/* Left Panel — hidden on mobile unless toggled */}
        <div className={`w-full sm:w-1/4 sm:min-w-[18rem] lg:min-w-[20rem] bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl shadow-lg p-4 sm:p-6 h-fit border border-orange-200 flex-shrink-0 ${
          leftPanelOpen ? "block" : "hidden sm:block"
        }`}>
          {/* Avatar Section */}
          <div className="flex flex-col items-center mb-6 relative">
            <div className="absolute right-0 top-0">
              <button
                className="text-orange-400 hover:text-orange-600 transition-colors p-1"
                onClick={() => setShowDropdown(!showDropdown)}
              >
                <FiMoreVertical className="w-5 h-5" />
                {showDropdown && (
                  <div className="absolute top-10 right-2 bg-white shadow-md border rounded-lg w-36 z-10">
                    <button className="items-center w-full flex px-4 py-2 text-left hover:bg-gray-100 text-gray-700" onClick={EditLeadForm}>
                      <MdEdit className="w-4 h-4 text-orange-700 flex-shrink-0" />
                      <span className="pl-2 text-sm">Edit</span>
                    </button>
                    <button className="flex w-full px-4 py-2 items-center text-left hover:bg-gray-100 text-gray-700" onClick={openModel}>
                      <FaTrash className="w-4 h-4 text-orange-700 flex-shrink-0" />
                      <span className="pl-2 text-sm">Delete</span>
                    </button>
                  </div>
                )}
              </button>
            </div>
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-xl sm:text-2xl font-semibold text-white mb-3 shadow-md border-4 border-white">
              {getInitials(leadData.customerName)}
            </div>
            <h2 className="text-base sm:text-lg font-semibold text-gray-800 mb-1 text-center">{leadData.customerName}</h2>
            <h6 className="text-sm font-semibold text-gray-800 mb-1">{leadData.leadId}</h6>
            <p className="text-sm text-gray-600 mb-2">{leadData.company}</p>
            <div className="bg-orange-200 rounded-full px-3 py-1 text-xs font-medium text-orange-800 mb-3 flex items-center">
              <FiStar className="w-3 h-3 mr-1" />
              {leadData.status}
            </div>
            <div className="flex gap-3">
              {[FiMail, FiPhone].map((Icon, idx) => (
                <button key={idx} className="p-2.5 bg-white rounded-full hover:bg-orange-500 hover:text-white transition-all shadow-sm text-orange-500">
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              ))}
            </div>
          </div>

          {/* Contact Information */}
          <div className="mb-6">
            <h3 className="text-xs font-semibold text-orange-700 mb-3 uppercase tracking-wider flex items-center">
              <FiMail className="w-3 h-3 mr-2" />Contact Information
            </h3>
            <div className="space-y-2">
              {contactInfoItems.map((item, index) => (
                <InfoCard key={index} icon={item.icon} label={item.label} value={item.value} />
              ))}
            </div>
          </div>

          {/* Key Information */}
          {keyInfoItems.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-orange-700 mb-3 uppercase tracking-wider flex items-center">
                <FiBriefcase className="w-3 h-3 mr-2" />Key Information
              </h3>
              <div className="space-y-2">
                {keyInfoItems.map((item, index) => (
                  <InfoCard key={index} icon={item.icon} label={item.label} value={item.value} />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Panel */}
        <div className="flex-1 space-y-4 min-w-0">
          {sections.map((section) => (
            <Section
              key={section.id}
              title={section.title}
              icon={section.icon}
              count={section.data.length}
              isOpen={visibleSections[section.id]}
              toggle={() => toggleSection(section.id)}
              leadData={leadData}
              onSuccess={() => {
                fetchOpportunityData();
                fetchLeadData();
              }}
            >
              <DataTable columns={section.columns} data={section.data} />
            </Section>
          ))}

          {/* Tab Section */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden p-2">
            <Tab
              tabData={leadtabs}
              borderColor="border-orange-500"
              textColor="text-orange-500"
              active={leadtabs[0].label}
            />
          </div>
        </div>
      </div>
      <Modal
        isOpen={modal}
        onClose={() => setModal(false)}
        title={leadStatus === "Lead" ? "Lead" : "Opportunity"}
        setLeadStatus={setLeadStatus}
      >
        <LeadForm
          onClose={() => setModal(false)}
          leadData={leadData}
          leadId={id ?? undefined}
          onSuccess={() => {
            fetchOpportunityData();
            fetchLeadData();
          }}
          setLeadStatus={setLeadStatus}
        />
      </Modal>
      <ConfirmBox
        isOpen={isModelOpen}
        onClose={closeModel}
        onDelete={handleDelete}
        title={`lead ${leadData?.customerName || ""}`}
        id={selectedItem ?? ""}
      />
    </div>
  );
};

export default LeadView;
