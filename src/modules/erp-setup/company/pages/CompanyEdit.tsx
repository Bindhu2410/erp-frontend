import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Spinner,
  Alert,
  Badge,
  Modal,
  Nav,
  Tab,
} from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBuilding,
  faSave,
  faArrowLeft,
  faTimes,
  faExclamationTriangle,
  faInfoCircle,
  faMapMarkerAlt,
  faPhone,
  faFileInvoiceDollar,
  faCalculator,
} from "@fortawesome/free-solid-svg-icons";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  companyListService,
  ICompanyUpdateRequest,
} from "../services/companyList.service";
import { toast } from "react-toastify";

interface ICompanyEditForm {
  legalCompanyName: string;
  parentCompanyId: number | null;
  registeredAddressLine1: string;
  registeredAddressLine2: string;
  city: string;
  state: string;
  pincode: string;
  phoneNumber: string;
  emailAddress: string;
  websiteUrl: string;
  baseCurrency: string;
  financialYearStartDate: string;
  financialYearEndDate: string;
  pan: string;
  tan: string;
  gstin: string;
  legalEntityType: string;
  legalNameAsPerPanTan: string;
}

const CompanyEdit: React.FC = () => {
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id");
  const mode = searchParams.get("mode");
  void mode;
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<string>("basic");
  const [loading, setLoading] = useState(true);
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [formData, setFormData] = useState<ICompanyEditForm>({
    legalCompanyName: "",
    parentCompanyId: null,
    registeredAddressLine1: "",
    registeredAddressLine2: "",
    city: "",
    state: "",
    pincode: "",
    phoneNumber: "",
    emailAddress: "",
    websiteUrl: "",
    baseCurrency: "INR",
    financialYearStartDate: "",
    financialYearEndDate: "",
    pan: "",
    tan: "",
    gstin: "",
    legalEntityType: "private_limited",
    legalNameAsPerPanTan: "",
  });
  const [originalData, setOriginalData] = useState<ICompanyEditForm | null>(
    null,
  );
  const [showUnsavedModal, setShowUnsavedModal] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(
    null,
  );

  useEffect(() => {
    const fetchCompany = async () => {
      if (!id) {
        setError("Company ID is required");
        setLoading(false);
        return;
      }

      try {
        const response = await companyListService.getCompanies();
        const company = response.data?.find(
          (c) => c.companyId.toString() === id,
        );

        if (company) {
          const companyFormData = {
            legalCompanyName: company.legalCompanyName,
            parentCompanyId: company.parentCompanyId,
            registeredAddressLine1: company.registeredAddressLine1,
            registeredAddressLine2: company.registeredAddressLine2 || "",
            city: company.city,
            state: company.state,
            pincode: company.pincode,
            phoneNumber: company.phoneNumber,
            emailAddress: company.emailAddress,
            websiteUrl: company.websiteUrl || "",
            baseCurrency: company.baseCurrency,
            financialYearStartDate:
              company.financialYearStartDate.split("T")[0],
            financialYearEndDate: company.financialYearEndDate.split("T")[0],
            pan: company.pan,
            tan: company.tan,
            gstin: company.gstin,
            legalEntityType: company.legalEntityType,
            legalNameAsPerPanTan: company.legalNameAsPerPanTan,
          };
          setFormData(companyFormData);
          setOriginalData(companyFormData);
        } else {
          setError("Company not found");
        }
      } catch (error) {
        console.error("Error fetching company:", error);
        setError("Failed to load company details");
      } finally {
        setLoading(false);
      }
    };

    fetchCompany();
  }, [id]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "parentCompanyId" ? (value ? parseInt(value) : null) : value,
    }));
    // Clear success message when user starts editing
    if (success) setSuccess(null);
  };

  const hasChanges = () => {
    if (!originalData) return false;
    return JSON.stringify(formData) !== JSON.stringify(originalData);
  };

  const validateForm = () => {
    const errors: { [key: string]: string } = {};

    if (!formData.legalCompanyName.trim())
      errors.legalCompanyName = "Legal Company Name is required";
    if (!formData.registeredAddressLine1.trim())
      errors.registeredAddressLine1 = "Address Line 1 is required";
    if (!formData.city.trim()) errors.city = "City is required";
    if (!formData.state.trim()) errors.state = "State is required";
    if (!formData.pincode.trim()) errors.pincode = "Pincode is required";
    if (!formData.pan.trim()) errors.pan = "PAN is required";
    if (!formData.tan.trim()) errors.tan = "TAN is required";
    if (!formData.gstin.trim()) errors.gstin = "GSTIN is required";
    if (!formData.legalNameAsPerPanTan.trim())
      errors.legalNameAsPerPanTan = "Legal Name as per PAN/TAN is required";
    if (!formData.financialYearStartDate)
      errors.financialYearStartDate = "Financial Year Start Date is required";
    if (!formData.financialYearEndDate)
      errors.financialYearEndDate = "Financial Year End Date is required";

    // Validate PAN format (10 characters)
    if (formData.pan && formData.pan.length !== 10) {
      errors.pan = "PAN must be 10 characters long";
    }

    // Validate GSTIN format (15 characters)
    if (formData.gstin && formData.gstin.length !== 15) {
      errors.gstin = "GSTIN must be 15 characters long";
    }

    // Validate pincode (6 digits)
    if (formData.pincode && !/^\d{6}$/.test(formData.pincode)) {
      errors.pincode = "Pincode must be 6 digits";
    }

    // Validate email format if provided
    if (
      formData.emailAddress &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.emailAddress)
    ) {
      errors.emailAddress = "Please enter a valid email address";
    }

    // Validate financial year dates
    if (formData.financialYearStartDate && formData.financialYearEndDate) {
      const startDate = new Date(formData.financialYearStartDate);
      const endDate = new Date(formData.financialYearEndDate);
      if (startDate >= endDate) {
        errors.financialYearEndDate =
          "Financial Year End Date must be after Start Date";
      }
    }

    return errors;
  };

  const handleNavigation = (path: string) => {
    if (hasChanges()) {
      setPendingNavigation(path);
      setShowUnsavedModal(true);
    } else {
      navigate(path);
    }
  };

  const confirmNavigation = () => {
    if (pendingNavigation) {
      navigate(pendingNavigation);
    }
    setShowUnsavedModal(false);
    setPendingNavigation(null);
  };

  const cancelNavigation = () => {
    setShowUnsavedModal(false);
    setPendingNavigation(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setFormErrors(validationErrors);
      toast.error("Please fix all validation errors before saving!");

      // Navigate to first error tab and focus field
      const firstErrorField = Object.keys(validationErrors)[0];
      if (firstErrorField) {
        // Map field names to their tabs
        const fieldToTabMap: { [key: string]: string } = {
          legalCompanyName: "basic",
          legalEntityType: "basic",
          legalNameAsPerPanTan: "basic",
          parentCompanyId: "basic",
          registeredAddressLine1: "address",
          registeredAddressLine2: "address",
          city: "address",
          state: "address",
          pincode: "address",
          phoneNumber: "contact",
          emailAddress: "contact",
          websiteUrl: "contact",
          pan: "tax",
          tan: "tax",
          gstin: "tax",
          baseCurrency: "financial",
          financialYearStartDate: "financial",
          financialYearEndDate: "financial",
        };

        const tabId = fieldToTabMap[firstErrorField];
        if (tabId) {
          setActiveTab(tabId);
          // Scroll to field after tab change
          setTimeout(() => {
            const element = document.getElementById(`field-${firstErrorField}`);
            if (element) {
              element.scrollIntoView({ behavior: "smooth", block: "center" });
              element.focus();
            }
          }, 300);
        }
      }
      return;
    }

    setFormErrors({});

    // Check if there are any changes
    if (!hasChanges()) {
      toast.warning(
        "No changes detected. Please modify some fields before saving.",
      );
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      if (!id) {
        throw new Error("Company ID is required");
      }

      // Prepare the update request data
      const updateData: ICompanyUpdateRequest = {
        companyId: parseInt(id),
        legalCompanyName: formData.legalCompanyName.trim(),
        parentCompanyId: formData.parentCompanyId,
        registeredAddressLine1: formData.registeredAddressLine1.trim(),
        registeredAddressLine2:
          formData.registeredAddressLine2.trim() || undefined,
        city: formData.city.trim(),
        state: formData.state.trim(),
        pincode: formData.pincode.trim(),
        phoneNumber: formData.phoneNumber.trim() || undefined,
        emailAddress: formData.emailAddress.trim() || undefined,
        websiteUrl: formData.websiteUrl.trim() || undefined,
        companyLogoPath: "", // Default empty string
        baseCurrency: formData.baseCurrency,
        financialYearStartDate: formData.financialYearStartDate + "T00:00:00", // Add time component
        financialYearEndDate: formData.financialYearEndDate + "T00:00:00", // Add time component
        pan: formData.pan.trim().toUpperCase(),
        tan: formData.tan.trim().toUpperCase(),
        gstin: formData.gstin.trim().toUpperCase(),
        legalEntityType: formData.legalEntityType,
        legalNameAsPerPanTan: formData.legalNameAsPerPanTan.trim(),
      };

      console.log("Updating company with data:", updateData);

      // Call the API to update the company
      const response = await companyListService.updateCompany(updateData);
      console.log("Update response:", response);

      setSuccess("Company updated successfully!");
      toast.success("Company updated successfully! 🎉");

      // Update original data to reflect the changes
      setOriginalData({ ...formData });

      // Redirect to view page after successful update
      setTimeout(() => {
        navigate(`/erp-setup?id=${id}&mode=view`);
      }, 2000);
    } catch (error) {
      console.error("Error updating company:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to update company. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Container className="mt-4">
        <div className="text-center">
          <Spinner animation="border" variant="primary" />
          <p className="mt-2">Loading company details...</p>
        </div>
      </Container>
    );
  }

  if (error && !formData.legalCompanyName) {
    return (
      <Container className="mt-4">
        <Alert variant="danger">
          <h5>Error</h5>
          <p>{error}</p>
          <Button
            variant="outline-danger"
            onClick={() => navigate("/erp-setup")}
          >
            <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
            Back to Companies
          </Button>
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="mt-4 mb-5">
      {/* Header */}
      <div className="mb-4">
        <Button
          variant="outline-secondary"
          onClick={() => handleNavigation(`/erp-setup?id=${id}&mode=view`)}
          style={{
            fontSize: "13px",
            padding: "8px 12px",
            fontWeight: 500,
            border: "1px solid #e9ecef",
            color: "#6c757d",
            backgroundColor: "#ffffff",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => {
            const target = e.currentTarget as HTMLElement;
            target.style.backgroundColor = "#f8f9fa";
            target.style.borderColor = "#dee2e6";
          }}
          onMouseLeave={(e) => {
            const target = e.currentTarget as HTMLElement;
            target.style.backgroundColor = "#ffffff";
            target.style.borderColor = "#e9ecef";
          }}
          className="mb-3"
        >
          <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
          Back to View
        </Button>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <h1
              style={{
                fontSize: "24px",
                fontWeight: 600,
                color: "#1a1a1a",
                marginBottom: "4px",
              }}
            >
              <FontAwesomeIcon
                icon={faBuilding}
                className="me-2"
                style={{ color: "#0066ff" }}
              />
              Edit Company
            </h1>
            <p
              style={{
                fontSize: "13px",
                color: "#6c757d",
                marginBottom: 0,
              }}
            >
              Update company information
            </p>
          </div>
          <Badge
            style={{
              background: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
              color: "#ffffff",
              fontSize: "12px",
              fontWeight: 600,
              padding: "8px 12px",
            }}
          >
            ID: #{id}
          </Badge>
        </div>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <Alert variant="success" className="mb-4">
          <FontAwesomeIcon icon={faSave} className="me-2" />
          {success}
        </Alert>
      )}

      {error && (
        <Alert variant="danger" className="mb-4">
          {error}
        </Alert>
      )}

      <Card
        style={{
          border: "none",
          borderRadius: "12px",
          overflow: "hidden",
          background: "#ffffff",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
        }}
      >
        <Tab.Container
          activeKey={activeTab}
          onSelect={(k) => setActiveTab(k || "basic")}
        >
          {/* Tab Navigation */}
          <Nav
            variant="pills"
            className="d-flex flex-wrap gap-2"
            style={{
              background: "#f8f9fa",
              borderBottom: "1px solid #e9ecef",
              padding: "16px",
              margin: 0,
            }}
          >
            <Nav.Item>
              <Nav.Link
                eventKey="basic"
                style={{
                  borderRadius: "6px",
                  padding: "10px 16px",
                  fontSize: "14px",
                  fontWeight: 600,
                  backgroundColor:
                    activeTab === "basic" ? "#d9f0ff" : "transparent",
                  color: activeTab === "basic" ? "#0066ff" : "#6c757d",
                  border: "2px solid",
                  borderColor: activeTab === "basic" ? "#0066ff" : "#1a1a1a",
                  transition: "all 0.3s ease",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.backgroundColor = "#d9f0ff";
                  el.style.color = "#1a1a1a";
                  el.style.borderColor = "#1a1a1a";
                }}
                onMouseLeave={(e) => {
                  if (activeTab !== "basic") {
                    const el = e.currentTarget as HTMLElement;
                    el.style.backgroundColor = "transparent";
                    el.style.color = "#6c757d";
                    el.style.borderColor = "#1a1a1a";
                  }
                }}
              >
                <FontAwesomeIcon icon={faInfoCircle} className="me-2" />
                Basic Info
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link
                eventKey="address"
                style={{
                  borderRadius: "6px",
                  padding: "10px 16px",
                  fontSize: "14px",
                  fontWeight: 600,
                  backgroundColor:
                    activeTab === "address" ? "#d9f0ff" : "transparent",
                  color: activeTab === "address" ? "#0066ff" : "#6c757d",
                  border: "2px solid",
                  borderColor: activeTab === "address" ? "#0066ff" : "#1a1a1a",
                  transition: "all 0.3s ease",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.backgroundColor = "#d9f0ff";
                  el.style.color = "#1a1a1a";
                  el.style.borderColor = "#1a1a1a";
                }}
                onMouseLeave={(e) => {
                  if (activeTab !== "address") {
                    const el = e.currentTarget as HTMLElement;
                    el.style.backgroundColor = "transparent";
                    el.style.color = "#6c757d";
                    el.style.borderColor = "#1a1a1a";
                  }
                }}
              >
                <FontAwesomeIcon icon={faMapMarkerAlt} className="me-2" />
                Address
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link
                eventKey="contact"
                style={{
                  borderRadius: "6px",
                  padding: "10px 16px",
                  fontSize: "14px",
                  fontWeight: 600,
                  backgroundColor:
                    activeTab === "contact" ? "#d9f0ff" : "transparent",
                  color: activeTab === "contact" ? "#0066ff" : "#6c757d",
                  border: "2px solid",
                  borderColor: activeTab === "contact" ? "#0066ff" : "#1a1a1a",
                  transition: "all 0.3s ease",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.backgroundColor = "#d9f0ff";
                  el.style.color = "#1a1a1a";
                  el.style.borderColor = "#1a1a1a";
                }}
                onMouseLeave={(e) => {
                  if (activeTab !== "contact") {
                    const el = e.currentTarget as HTMLElement;
                    el.style.backgroundColor = "transparent";
                    el.style.color = "#6c757d";
                    el.style.borderColor = "#1a1a1a";
                  }
                }}
              >
                <FontAwesomeIcon icon={faPhone} className="me-2" />
                Contact
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link
                eventKey="tax"
                style={{
                  borderRadius: "6px",
                  padding: "10px 16px",
                  fontSize: "14px",
                  fontWeight: 600,
                  backgroundColor:
                    activeTab === "tax" ? "#d9f0ff" : "transparent",
                  color: activeTab === "tax" ? "#0066ff" : "#6c757d",
                  border: "2px solid",
                  borderColor: activeTab === "tax" ? "#0066ff" : "#1a1a1a",
                  transition: "all 0.3s ease",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.backgroundColor = "#d9f0ff";
                  el.style.color = "#1a1a1a";
                  el.style.borderColor = "#1a1a1a";
                }}
                onMouseLeave={(e) => {
                  if (activeTab !== "tax") {
                    const el = e.currentTarget as HTMLElement;
                    el.style.backgroundColor = "transparent";
                    el.style.color = "#6c757d";
                    el.style.borderColor = "#1a1a1a";
                  }
                }}
              >
                <FontAwesomeIcon icon={faFileInvoiceDollar} className="me-2" />
                Tax Info
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link
                eventKey="financial"
                style={{
                  borderRadius: "6px",
                  padding: "10px 16px",
                  fontSize: "14px",
                  fontWeight: 600,
                  backgroundColor:
                    activeTab === "financial" ? "#d9f0ff" : "transparent",
                  color: activeTab === "financial" ? "#0066ff" : "#6c757d",
                  border: "2px solid",
                  borderColor:
                    activeTab === "financial" ? "#0066ff" : "#1a1a1a",
                  transition: "all 0.3s ease",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.backgroundColor = "#d9f0ff";
                  el.style.color = "#1a1a1a";
                  el.style.borderColor = "#1a1a1a";
                }}
                onMouseLeave={(e) => {
                  if (activeTab !== "financial") {
                    const el = e.currentTarget as HTMLElement;
                    el.style.backgroundColor = "transparent";
                    el.style.color = "#6c757d";
                    el.style.borderColor = "#1a1a1a";
                  }
                }}
              >
                <FontAwesomeIcon icon={faCalculator} className="me-2" />
                Financial
              </Nav.Link>
            </Nav.Item>
          </Nav>

          {/* Tab Content */}
          <Tab.Content style={{ padding: "24px" }}>
            {/* Basic Information Tab */}
            <Tab.Pane eventKey="basic">
              <Form onSubmit={handleSubmit}>
                <h5
                  style={{
                    fontSize: "16px",
                    fontWeight: 600,
                    marginBottom: "20px",
                    color: "#1a1a1a",
                  }}
                >
                  <FontAwesomeIcon
                    icon={faInfoCircle}
                    className="me-2"
                    style={{ color: "#0066ff" }}
                  />
                  Basic Company Information
                </h5>
                <Row>
                  <Col lg={6}>
                    <Form.Group className="mb-4">
                      <Form.Label
                        style={{
                          fontSize: "13px",
                          fontWeight: 600,
                          color: "#495057",
                          marginBottom: "8px",
                        }}
                      >
                        Legal Company Name
                        <span style={{ color: "#dc3545", marginLeft: "4px" }}>
                          *
                        </span>
                      </Form.Label>
                      <Form.Control
                        id="field-legalCompanyName"
                        type="text"
                        name="legalCompanyName"
                        value={formData.legalCompanyName}
                        onChange={handleInputChange}
                        required
                        placeholder="Enter company name"
                        isInvalid={!!formErrors.legalCompanyName}
                        style={{
                          borderRadius: "6px",
                          border: formErrors.legalCompanyName
                            ? "1px solid #dc3545"
                            : "1px solid #dee2e6",
                          fontSize: "14px",
                          padding: "10px 12px",
                        }}
                      />
                      {formErrors.legalCompanyName && (
                        <div
                          style={{
                            color: "#dc3545",
                            fontSize: "12px",
                            marginTop: "4px",
                          }}
                        >
                          {formErrors.legalCompanyName}
                        </div>
                      )}
                    </Form.Group>
                  </Col>
                  <Col lg={6}>
                    <Form.Group className="mb-4">
                      <Form.Label
                        style={{
                          fontSize: "13px",
                          fontWeight: 600,
                          color: "#495057",
                          marginBottom: "8px",
                        }}
                      >
                        Legal Entity Type
                        <span style={{ color: "#dc3545", marginLeft: "4px" }}>
                          *
                        </span>
                      </Form.Label>
                      <Form.Select
                        id="field-legalEntityType"
                        name="legalEntityType"
                        value={formData.legalEntityType}
                        onChange={handleInputChange}
                        required
                        isInvalid={!!formErrors.legalEntityType}
                        style={{
                          borderRadius: "6px",
                          border: formErrors.legalEntityType
                            ? "1px solid #dc3545"
                            : "1px solid #dee2e6",
                          fontSize: "14px",
                          padding: "10px 12px",
                        }}
                      >
                        <option value="private_limited">Private Limited</option>
                        <option value="public_limited">Public Limited</option>
                        <option value="partnership">Partnership</option>
                        <option value="sole_proprietorship">
                          Sole Proprietorship
                        </option>
                        <option value="llp">
                          Limited Liability Partnership
                        </option>
                      </Form.Select>
                      {formErrors.legalEntityType && (
                        <div
                          style={{
                            color: "#dc3545",
                            fontSize: "12px",
                            marginTop: "4px",
                          }}
                        >
                          {formErrors.legalEntityType}
                        </div>
                      )}
                    </Form.Group>
                  </Col>
                </Row>
                <Row>
                  <Col lg={6}>
                    <Form.Group className="mb-4">
                      <Form.Label
                        style={{
                          fontSize: "13px",
                          fontWeight: 600,
                          color: "#495057",
                          marginBottom: "8px",
                        }}
                      >
                        Legal Name as per PAN/TAN
                        <span style={{ color: "#dc3545", marginLeft: "4px" }}>
                          *
                        </span>
                      </Form.Label>
                      <Form.Control
                        id="field-legalNameAsPerPanTan"
                        type="text"
                        name="legalNameAsPerPanTan"
                        value={formData.legalNameAsPerPanTan}
                        onChange={handleInputChange}
                        required
                        placeholder="Enter legal name"
                        isInvalid={!!formErrors.legalNameAsPerPanTan}
                        style={{
                          borderRadius: "6px",
                          border: formErrors.legalNameAsPerPanTan
                            ? "1px solid #dc3545"
                            : "1px solid #dee2e6",
                          fontSize: "14px",
                          padding: "10px 12px",
                        }}
                      />
                      {formErrors.legalNameAsPerPanTan && (
                        <div
                          style={{
                            color: "#dc3545",
                            fontSize: "12px",
                            marginTop: "4px",
                          }}
                        >
                          {formErrors.legalNameAsPerPanTan}
                        </div>
                      )}
                    </Form.Group>
                  </Col>
                  <Col lg={6}>
                    <Form.Group className="mb-4">
                      <Form.Label
                        style={{
                          fontSize: "13px",
                          fontWeight: 600,
                          color: "#495057",
                          marginBottom: "8px",
                        }}
                      >
                        Parent Company ID
                      </Form.Label>
                      <Form.Control
                        id="field-parentCompanyId"
                        type="number"
                        name="parentCompanyId"
                        value={formData.parentCompanyId || ""}
                        onChange={handleInputChange}
                        placeholder="Leave empty if no parent"
                        style={{
                          borderRadius: "6px",
                          border: "1px solid #dee2e6",
                          fontSize: "14px",
                          padding: "10px 12px",
                        }}
                      />
                    </Form.Group>
                  </Col>
                </Row>
              </Form>
            </Tab.Pane>

            {/* Address Tab */}
            <Tab.Pane eventKey="address">
              <Form onSubmit={handleSubmit}>
                <h5
                  style={{
                    fontSize: "16px",
                    fontWeight: 600,
                    marginBottom: "20px",
                    color: "#1a1a1a",
                  }}
                >
                  <FontAwesomeIcon
                    icon={faMapMarkerAlt}
                    className="me-2"
                    style={{ color: "#0066ff" }}
                  />
                  Address Information
                </h5>
                <Form.Group className="mb-4">
                  <Form.Label
                    style={{
                      fontSize: "13px",
                      fontWeight: 600,
                      color: "#495057",
                      marginBottom: "8px",
                    }}
                  >
                    Registered Address Line 1
                    <span style={{ color: "#dc3545", marginLeft: "4px" }}>
                      *
                    </span>
                  </Form.Label>
                  <Form.Control
                    id="field-registeredAddressLine1"
                    as="textarea"
                    rows={3}
                    name="registeredAddressLine1"
                    value={formData.registeredAddressLine1}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter street address"
                    isInvalid={!!formErrors.registeredAddressLine1}
                    style={{
                      borderRadius: "6px",
                      border: formErrors.registeredAddressLine1
                        ? "1px solid #dc3545"
                        : "1px solid #dee2e6",
                      fontSize: "14px",
                      padding: "10px 12px",
                    }}
                  />
                  {formErrors.registeredAddressLine1 && (
                    <div
                      style={{
                        color: "#dc3545",
                        fontSize: "12px",
                        marginTop: "4px",
                      }}
                    >
                      {formErrors.registeredAddressLine1}
                    </div>
                  )}
                </Form.Group>
                <Form.Group className="mb-4">
                  <Form.Label
                    style={{
                      fontSize: "13px",
                      fontWeight: 600,
                      color: "#495057",
                      marginBottom: "8px",
                    }}
                  >
                    Registered Address Line 2
                  </Form.Label>
                  <Form.Control
                    id="field-registeredAddressLine2"
                    as="textarea"
                    rows={3}
                    name="registeredAddressLine2"
                    value={formData.registeredAddressLine2}
                    onChange={handleInputChange}
                    placeholder="Additional address details (optional)"
                    style={{
                      borderRadius: "6px",
                      border: "1px solid #dee2e6",
                      fontSize: "14px",
                      padding: "10px 12px",
                    }}
                  />
                </Form.Group>
                <Row>
                  <Col md={4}>
                    <Form.Group className="mb-4">
                      <Form.Label
                        style={{
                          fontSize: "13px",
                          fontWeight: 600,
                          color: "#495057",
                          marginBottom: "8px",
                        }}
                      >
                        City
                        <span style={{ color: "#dc3545", marginLeft: "4px" }}>
                          *
                        </span>
                      </Form.Label>
                      <Form.Control
                        id="field-city"
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        required
                        placeholder="Enter city"
                        isInvalid={!!formErrors.city}
                        style={{
                          borderRadius: "6px",
                          border: formErrors.city
                            ? "1px solid #dc3545"
                            : "1px solid #dee2e6",
                          fontSize: "14px",
                          padding: "10px 12px",
                        }}
                      />
                      {formErrors.city && (
                        <div
                          style={{
                            color: "#dc3545",
                            fontSize: "12px",
                            marginTop: "4px",
                          }}
                        >
                          {formErrors.city}
                        </div>
                      )}
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-4">
                      <Form.Label
                        style={{
                          fontSize: "13px",
                          fontWeight: 600,
                          color: "#495057",
                          marginBottom: "8px",
                        }}
                      >
                        State
                        <span style={{ color: "#dc3545", marginLeft: "4px" }}>
                          *
                        </span>
                      </Form.Label>
                      <Form.Control
                        id="field-state"
                        type="text"
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        required
                        placeholder="Enter state"
                        isInvalid={!!formErrors.state}
                        style={{
                          borderRadius: "6px",
                          border: formErrors.state
                            ? "1px solid #dc3545"
                            : "1px solid #dee2e6",
                          fontSize: "14px",
                          padding: "10px 12px",
                        }}
                      />
                      {formErrors.state && (
                        <div
                          style={{
                            color: "#dc3545",
                            fontSize: "12px",
                            marginTop: "4px",
                          }}
                        >
                          {formErrors.state}
                        </div>
                      )}
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-4">
                      <Form.Label
                        style={{
                          fontSize: "13px",
                          fontWeight: 600,
                          color: "#495057",
                          marginBottom: "8px",
                        }}
                      >
                        Pincode
                        <span style={{ color: "#dc3545", marginLeft: "4px" }}>
                          *
                        </span>
                      </Form.Label>
                      <Form.Control
                        id="field-pincode"
                        type="text"
                        name="pincode"
                        value={formData.pincode}
                        onChange={handleInputChange}
                        required
                        maxLength={6}
                        placeholder="6 digit code"
                        isInvalid={!!formErrors.pincode}
                        style={{
                          borderRadius: "6px",
                          border: formErrors.pincode
                            ? "1px solid #dc3545"
                            : "1px solid #dee2e6",
                          fontSize: "14px",
                          padding: "10px 12px",
                        }}
                      />
                      {formErrors.pincode && (
                        <div
                          style={{
                            color: "#dc3545",
                            fontSize: "12px",
                            marginTop: "4px",
                          }}
                        >
                          {formErrors.pincode}
                        </div>
                      )}
                    </Form.Group>
                  </Col>
                </Row>
              </Form>
            </Tab.Pane>

            {/* Contact Tab */}
            <Tab.Pane eventKey="contact">
              <Form onSubmit={handleSubmit}>
                <h5
                  style={{
                    fontSize: "16px",
                    fontWeight: 600,
                    marginBottom: "20px",
                    color: "#1a1a1a",
                  }}
                >
                  <FontAwesomeIcon
                    icon={faPhone}
                    className="me-2"
                    style={{ color: "#0066ff" }}
                  />
                  Contact Information
                </h5>
                <Row>
                  <Col lg={6}>
                    <Form.Group className="mb-4">
                      <Form.Label
                        style={{
                          fontSize: "13px",
                          fontWeight: 600,
                          color: "#495057",
                          marginBottom: "8px",
                        }}
                      >
                        Phone Number
                      </Form.Label>
                      <Form.Control
                        id="field-phoneNumber"
                        type="tel"
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleInputChange}
                        placeholder="+91 or 10-digit number"
                        style={{
                          borderRadius: "6px",
                          border: "1px solid #dee2e6",
                          fontSize: "14px",
                          padding: "10px 12px",
                        }}
                      />
                    </Form.Group>
                  </Col>
                  <Col lg={6}>
                    <Form.Group className="mb-4">
                      <Form.Label
                        style={{
                          fontSize: "13px",
                          fontWeight: 600,
                          color: "#495057",
                          marginBottom: "8px",
                        }}
                      >
                        Email Address
                      </Form.Label>
                      <Form.Control
                        id="field-emailAddress"
                        type="email"
                        name="emailAddress"
                        value={formData.emailAddress}
                        onChange={handleInputChange}
                        placeholder="company@example.com"
                        isInvalid={!!formErrors.emailAddress}
                        style={{
                          borderRadius: "6px",
                          border: formErrors.emailAddress
                            ? "1px solid #dc3545"
                            : "1px solid #dee2e6",
                          fontSize: "14px",
                          padding: "10px 12px",
                        }}
                      />
                      {formErrors.emailAddress && (
                        <div
                          style={{
                            color: "#dc3545",
                            fontSize: "12px",
                            marginTop: "4px",
                          }}
                        >
                          {formErrors.emailAddress}
                        </div>
                      )}
                    </Form.Group>
                  </Col>
                </Row>
                <Form.Group className="mb-4">
                  <Form.Label
                    style={{
                      fontSize: "13px",
                      fontWeight: 600,
                      color: "#495057",
                      marginBottom: "8px",
                    }}
                  >
                    Website URL
                  </Form.Label>
                  <Form.Control
                    id="field-websiteUrl"
                    type="url"
                    name="websiteUrl"
                    value={formData.websiteUrl}
                    onChange={handleInputChange}
                    placeholder="https://example.com"
                    style={{
                      borderRadius: "6px",
                      border: "1px solid #dee2e6",
                      fontSize: "14px",
                      padding: "10px 12px",
                    }}
                  />
                </Form.Group>
              </Form>
            </Tab.Pane>

            {/* Tax Information Tab */}
            <Tab.Pane eventKey="tax">
              <Form onSubmit={handleSubmit}>
                <h5
                  style={{
                    fontSize: "16px",
                    fontWeight: 600,
                    marginBottom: "20px",
                    color: "#1a1a1a",
                  }}
                >
                  <FontAwesomeIcon
                    icon={faFileInvoiceDollar}
                    className="me-2"
                    style={{ color: "#0066ff" }}
                  />
                  Tax Information
                </h5>
                <Row>
                  <Col lg={6}>
                    <Form.Group className="mb-4">
                      <Form.Label
                        style={{
                          fontSize: "13px",
                          fontWeight: 600,
                          color: "#495057",
                          marginBottom: "8px",
                        }}
                      >
                        PAN (Permanent Account Number)
                        <span style={{ color: "#dc3545", marginLeft: "4px" }}>
                          *
                        </span>
                      </Form.Label>
                      <Form.Control
                        id="field-pan"
                        type="text"
                        name="pan"
                        value={formData.pan}
                        onChange={handleInputChange}
                        required
                        maxLength={10}
                        placeholder="10 character code"
                        isInvalid={!!formErrors.pan}
                        style={{
                          borderRadius: "6px",
                          border: formErrors.pan
                            ? "1px solid #dc3545"
                            : "1px solid #dee2e6",
                          fontSize: "14px",
                          padding: "10px 12px",
                          fontFamily: "monospace",
                          textTransform: "uppercase",
                        }}
                      />
                      {formErrors.pan && (
                        <div
                          style={{
                            color: "#dc3545",
                            fontSize: "12px",
                            marginTop: "4px",
                          }}
                        >
                          {formErrors.pan}
                        </div>
                      )}
                      <small style={{ color: "#6c757d", fontSize: "12px" }}>
                        e.g., ABCDE1234F
                      </small>
                    </Form.Group>
                  </Col>
                  <Col lg={6}>
                    <Form.Group className="mb-4">
                      <Form.Label
                        style={{
                          fontSize: "13px",
                          fontWeight: 600,
                          color: "#495057",
                          marginBottom: "8px",
                        }}
                      >
                        TAN (Tax Deduction Account Number)
                        <span style={{ color: "#dc3545", marginLeft: "4px" }}>
                          *
                        </span>
                      </Form.Label>
                      <Form.Control
                        id="field-tan"
                        type="text"
                        name="tan"
                        value={formData.tan}
                        onChange={handleInputChange}
                        required
                        maxLength={10}
                        placeholder="10 character code"
                        isInvalid={!!formErrors.tan}
                        style={{
                          borderRadius: "6px",
                          border: formErrors.tan
                            ? "1px solid #dc3545"
                            : "1px solid #dee2e6",
                          fontSize: "14px",
                          padding: "10px 12px",
                          fontFamily: "monospace",
                          textTransform: "uppercase",
                        }}
                      />
                      {formErrors.tan && (
                        <div
                          style={{
                            color: "#dc3545",
                            fontSize: "12px",
                            marginTop: "4px",
                          }}
                        >
                          {formErrors.tan}
                        </div>
                      )}
                      <small style={{ color: "#6c757d", fontSize: "12px" }}>
                        e.g., AAAA12345A
                      </small>
                    </Form.Group>
                  </Col>
                </Row>
                <Form.Group className="mb-4">
                  <Form.Label
                    style={{
                      fontSize: "13px",
                      fontWeight: 600,
                      color: "#495057",
                      marginBottom: "8px",
                    }}
                  >
                    GSTIN (Goods & Services Tax Identification Number)
                    <span style={{ color: "#dc3545", marginLeft: "4px" }}>
                      *
                    </span>
                  </Form.Label>
                  <Form.Control
                    id="field-gstin"
                    type="text"
                    name="gstin"
                    value={formData.gstin}
                    onChange={handleInputChange}
                    required
                    maxLength={15}
                    placeholder="15 character code"
                    isInvalid={!!formErrors.gstin}
                    style={{
                      borderRadius: "6px",
                      border: formErrors.gstin
                        ? "1px solid #dc3545"
                        : "1px solid #dee2e6",
                      fontSize: "14px",
                      padding: "10px 12px",
                      fontFamily: "monospace",
                      textTransform: "uppercase",
                    }}
                  />
                  {formErrors.gstin && (
                    <div
                      style={{
                        color: "#dc3545",
                        fontSize: "12px",
                        marginTop: "4px",
                      }}
                    >
                      {formErrors.gstin}
                    </div>
                  )}
                  <small style={{ color: "#6c757d", fontSize: "12px" }}>
                    e.g., 27AABCT1234F1Z0
                  </small>
                </Form.Group>
              </Form>
            </Tab.Pane>

            {/* Financial Tab */}
            <Tab.Pane eventKey="financial">
              <Form onSubmit={handleSubmit}>
                <h5
                  style={{
                    fontSize: "16px",
                    fontWeight: 600,
                    marginBottom: "20px",
                    color: "#1a1a1a",
                  }}
                >
                  <FontAwesomeIcon
                    icon={faCalculator}
                    className="me-2"
                    style={{ color: "#0066ff" }}
                  />
                  Financial Information
                </h5>
                <Form.Group className="mb-4">
                  <Form.Label
                    style={{
                      fontSize: "13px",
                      fontWeight: 600,
                      color: "#495057",
                      marginBottom: "8px",
                    }}
                  >
                    Base Currency
                    <span style={{ color: "#dc3545", marginLeft: "4px" }}>
                      *
                    </span>
                  </Form.Label>
                  <Form.Select
                    id="field-baseCurrency"
                    name="baseCurrency"
                    value={formData.baseCurrency}
                    onChange={handleInputChange}
                    required
                    style={{
                      borderRadius: "6px",
                      border: "1px solid #dee2e6",
                      fontSize: "14px",
                      padding: "10px 12px",
                    }}
                  >
                    <option value="INR">INR - Indian Rupee</option>
                    <option value="USD">USD - US Dollar</option>
                    <option value="EUR">EUR - Euro</option>
                    <option value="GBP">GBP - British Pound</option>
                  </Form.Select>
                </Form.Group>
                <Row>
                  <Col lg={6}>
                    <Form.Group className="mb-4">
                      <Form.Label
                        style={{
                          fontSize: "13px",
                          fontWeight: 600,
                          color: "#495057",
                          marginBottom: "8px",
                        }}
                      >
                        Financial Year Start Date
                        <span style={{ color: "#dc3545", marginLeft: "4px" }}>
                          *
                        </span>
                      </Form.Label>
                      <Form.Control
                        id="field-financialYearStartDate"
                        type="date"
                        name="financialYearStartDate"
                        value={formData.financialYearStartDate}
                        onChange={handleInputChange}
                        required
                        isInvalid={!!formErrors.financialYearStartDate}
                        style={{
                          borderRadius: "6px",
                          border: formErrors.financialYearStartDate
                            ? "1px solid #dc3545"
                            : "1px solid #dee2e6",
                          fontSize: "14px",
                          padding: "10px 12px",
                        }}
                      />
                      {formErrors.financialYearStartDate && (
                        <div
                          style={{
                            color: "#dc3545",
                            fontSize: "12px",
                            marginTop: "4px",
                          }}
                        >
                          {formErrors.financialYearStartDate}
                        </div>
                      )}
                    </Form.Group>
                  </Col>
                  <Col lg={6}>
                    <Form.Group className="mb-4">
                      <Form.Label
                        style={{
                          fontSize: "13px",
                          fontWeight: 600,
                          color: "#495057",
                          marginBottom: "8px",
                        }}
                      >
                        Financial Year End Date
                        <span style={{ color: "#dc3545", marginLeft: "4px" }}>
                          *
                        </span>
                      </Form.Label>
                      <Form.Control
                        id="field-financialYearEndDate"
                        type="date"
                        name="financialYearEndDate"
                        value={formData.financialYearEndDate}
                        onChange={handleInputChange}
                        required
                        isInvalid={!!formErrors.financialYearEndDate}
                        style={{
                          borderRadius: "6px",
                          border: formErrors.financialYearEndDate
                            ? "1px solid #dc3545"
                            : "1px solid #dee2e6",
                          fontSize: "14px",
                          padding: "10px 12px",
                        }}
                      />
                      {formErrors.financialYearEndDate && (
                        <div
                          style={{
                            color: "#dc3545",
                            fontSize: "12px",
                            marginTop: "4px",
                          }}
                        >
                          {formErrors.financialYearEndDate}
                        </div>
                      )}
                    </Form.Group>
                  </Col>
                </Row>
              </Form>
            </Tab.Pane>
          </Tab.Content>
        </Tab.Container>

        {/* Action Buttons */}
        <div
          style={{
            background: "#f8f9fa",
            borderTop: "1px solid #e9ecef",
            padding: "16px 24px",
            display: "flex",
            gap: "12px",
            justifyContent: "flex-end",
          }}
        >
          <Form onSubmit={handleSubmit}>
            <div className="d-flex gap-2">
              <Button
                type="submit"
                disabled={saving || !hasChanges()}
                style={{
                  background:
                    "linear-gradient(135deg, #0066ff 0%, #003d99 100%)",
                  border: "none",
                  borderRadius: "6px",
                  padding: "12px 24px",
                  fontWeight: 600,
                  fontSize: "14px",
                  boxShadow: "0 2px 6px rgba(0, 102, 255, 0.15)",
                  transition: "all 0.3s ease",
                  cursor: saving || !hasChanges() ? "not-allowed" : "pointer",
                  opacity: saving || !hasChanges() ? 0.6 : 1,
                }}
                className="text-white"
                onMouseEnter={(e) => {
                  if (!saving && hasChanges()) {
                    const target = e.currentTarget as HTMLElement;
                    target.style.boxShadow =
                      "0 4px 12px rgba(0, 102, 255, 0.3)";
                    target.style.transform = "translateY(-2px)";
                  }
                }}
                onMouseLeave={(e) => {
                  const target = e.currentTarget as HTMLElement;
                  target.style.boxShadow = "0 2px 6px rgba(0, 102, 255, 0.15)";
                  target.style.transform = "translateY(0)";
                }}
              >
                {saving ? (
                  <>
                    <Spinner animation="border" size="sm" className="me-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <FontAwesomeIcon icon={faSave} className="me-2" />
                    Update Changes{" "}
                    {/* {hasChanges() && (
                      <Badge bg="warning" className="ms-2">
                        *
                      </Badge>
                    )} */}
                  </>
                )}
              </Button>
              <Button
                type="button"
                onClick={() => handleNavigation(`/erp-setup?id=${id}&mode=view`)}
                disabled={saving}
                style={{
                  background: "#f5f5f5",
                  color: "#6c757d",
                  border: "1px solid #dee2e6",
                  borderRadius: "6px",
                  padding: "12px 24px",
                  fontWeight: 600,
                  fontSize: "14px",
                  transition: "all 0.2s ease",
                  cursor: saving ? "not-allowed" : "pointer",
                  opacity: saving ? 0.6 : 1,
                }}
                onMouseEnter={(e) => {
                  if (!saving) {
                    const target = e.currentTarget as HTMLElement;
                    target.style.background = "#e9ecef";
                  }
                }}
                onMouseLeave={(e) => {
                  const target = e.currentTarget as HTMLElement;
                  target.style.background = "#f5f5f5";
                }}
              >
                <FontAwesomeIcon icon={faTimes} className="me-2" />
                Cancel
              </Button>
            </div>
          </Form>
        </div>
      </Card>

      {/* Unsaved Changes Modal */}
      <Modal show={showUnsavedModal} onHide={cancelNavigation} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <FontAwesomeIcon
              icon={faExclamationTriangle}
              className="text-warning me-2"
            />
            Unsaved Changes
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            You have unsaved changes that will be lost if you leave this page.
          </p>
          <p>Are you sure you want to continue without saving?</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={cancelNavigation}>
            Stay on Page
          </Button>
          <Button variant="warning" onClick={confirmNavigation}>
            Leave Without Saving
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default CompanyEdit;
