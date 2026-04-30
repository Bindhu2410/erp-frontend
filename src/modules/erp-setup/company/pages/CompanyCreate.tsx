import React, { useState } from "react";
import { toast } from "react-toastify";
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
  Nav,
  Tab,
} from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBuilding,
  faSave,
  faArrowLeft,
  faTimes,
  faInfoCircle,
  faMapMarkerAlt,
  faPhone,
  faFileInvoiceDollar,
  faCalculator,
} from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import {
  companyListService,
  ICompanyCreateRequest,
} from "../services/companyList.service";

interface ICompanyCreateForm {
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

const CompanyCreate: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<string>("basic");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});
  const [formData, setFormData] = useState<ICompanyCreateForm>({
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
    // Clear validation error for this field when user starts editing
    if (validationErrors[name]) {
      setValidationErrors((prev) => {
        const updated = { ...prev };
        delete updated[name];
        return updated;
      });
    }
    // Clear success message when user starts editing
    if (success) setSuccess(null);
  };

  const validateForm = (): Record<string, string> => {
    const errors: Record<string, string> = {};

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

  const renderMandatoryLabel = (label: string, isMandatory = false) => (
    <span>
      {label}
      {isMandatory && <span style={{ color: "#dc3545", marginLeft: "4px" }}>*</span>}
    </span>
  );

  const renderErrorMessage = (fieldName: string) =>
    validationErrors[fieldName] ? (
      <small
        style={{
          color: "#dc3545",
          fontSize: "12px",
          marginTop: "4px",
          display: "block",
        }}
      >
        {validationErrors[fieldName]}
      </small>
    ) : null;

  const tabFieldMap: Record<string, string[]> = {
    basic: ["legalCompanyName", "legalEntityType", "legalNameAsPerPanTan"],
    address: ["registeredAddressLine1", "city", "state", "pincode"],
    contact: ["emailAddress"],
    tax: ["pan", "tan", "gstin"],
    financial: ["baseCurrency", "financialYearStartDate", "financialYearEndDate"],
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setValidationErrors(newErrors);
      const firstErrorTab = Object.keys(tabFieldMap).find((tab) =>
        tabFieldMap[tab].some((field) => newErrors[field])
      );
      if (firstErrorTab) setActiveTab(firstErrorTab);
      toast.error("Please fix the validation errors before submitting");
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);
    setValidationErrors({});

    try {
      // Prepare the create request data
      const createData: ICompanyCreateRequest = {
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

      console.log("Creating company with data:", createData);

      // Call the API to create the company
      const response = await companyListService.createCompany(createData);
      console.log("Create response:", response);

      setSuccess("Company created successfully!");
      toast.success("🎉 Company created successfully!");

      // Redirect to companies list after successful creation
      setTimeout(() => {
        navigate("/erp-setup");
      }, 2000);
    } catch (error) {
      console.error("Error creating company:", error);
      const rawMessage =
        error instanceof Error
          ? error.message
          : "Failed to create company. Please try again.";

      let friendlyMessage = rawMessage;
      if (rawMessage.includes("duplicate key") || rawMessage.includes("23505")) {
        const constraintMatch = rawMessage.match(/unique constraint \"([^\"]+)\"/i);
        const constraint = constraintMatch ? constraintMatch[1] : "";
        const fieldMap: Record<string, string> = {
          cs_companies_pan_key: "PAN",
          cs_companies_tan_key: "TAN",
          cs_companies_gstin_key: "GSTIN",
          cs_companies_legal_company_name_key: "Legal Company Name",
          cs_companies_email_address_key: "Email Address",
        };
        const fieldName = Object.entries(fieldMap).find(([key]) =>
          constraint.toLowerCase().includes(key.toLowerCase())
        )?.[1] ?? constraint ?? "a field";
        friendlyMessage = `Duplicate value: "${fieldName}" already exists. Please use a different value.`;
      }

      setError(friendlyMessage);
      toast.error(friendlyMessage);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Container className="mt-3 mb-4">
      {/* Header */}
      <div className="mb-4">
        <Button
          variant="outline-secondary"
          onClick={() => navigate("/erp-setup")}
          className="mb-3"
          style={{
            fontSize: "13px",
            padding: "8px 12px",
            fontWeight: 500,
          }}
        >
          <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
          Back to Companies
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
              Create New Company
            </h1>
            <p
              style={{
                fontSize: "13px",
                color: "#6c757d",
                marginBottom: 0,
              }}
            >
              Add a new company to your organization
            </p>
          </div>
          <Badge
            style={{
              background: "linear-gradient(135deg, #0066ff 0%, #003d99 100%)",
              color: "#ffffff",
              fontSize: "12px",
              fontWeight: 600,
              padding: "8px 12px",
            }}
          >
            New Company
          </Badge>
        </div>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <Alert variant="success" className="mb-4" style={{ fontSize: "14px" }}>
          <FontAwesomeIcon icon={faSave} className="me-2" />
          {success}
        </Alert>
      )}

      {error && (
        <Alert variant="danger" className="mb-4" style={{ fontSize: "14px" }}>
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
              <div>
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
                        {renderMandatoryLabel("Legal Company Name", true)}
                      </Form.Label>
                      <Form.Control
                        type="text"
                        name="legalCompanyName"
                        value={formData.legalCompanyName}
                        onChange={handleInputChange}
                        required
                        placeholder="Enter company name"
                        style={{
                          borderRadius: "6px",
                          border: validationErrors.legalCompanyName
                            ? "1px solid #dc3545"
                            : "1px solid #dee2e6",
                          fontSize: "14px",
                          padding: "10px 12px",
                        }}
                      />
                      {renderErrorMessage("legalCompanyName")}
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
                        {renderMandatoryLabel("Legal Entity Type", true)}
                      </Form.Label>
                      <Form.Select
                        name="legalEntityType"
                        value={formData.legalEntityType}
                        onChange={handleInputChange}
                        required
                        style={{
                          borderRadius: "6px",
                          border: validationErrors.legalEntityType
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
                      {renderErrorMessage("legalEntityType")}
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
                        {renderMandatoryLabel(
                          "Legal Name as per PAN/TAN",
                          true,
                        )}
                      </Form.Label>
                      <Form.Control
                        type="text"
                        name="legalNameAsPerPanTan"
                        value={formData.legalNameAsPerPanTan}
                        onChange={handleInputChange}
                        required
                        placeholder="Enter legal name"
                        style={{
                          borderRadius: "6px",
                          border: validationErrors.legalNameAsPerPanTan
                            ? "1px solid #dc3545"
                            : "1px solid #dee2e6",
                          fontSize: "14px",
                          padding: "10px 12px",
                        }}
                      />
                      {renderErrorMessage("legalNameAsPerPanTan")}
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
                        {renderMandatoryLabel("Parent Company ID", false)}
                      </Form.Label>
                      <Form.Control
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
                      {renderErrorMessage("parentCompanyId")}
                    </Form.Group>
                  </Col>
                </Row>
              </div>
            </Tab.Pane>

            {/* Address Tab */}
            <Tab.Pane eventKey="address">
              <div>
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
                    {renderMandatoryLabel("Registered Address Line 1", true)}
                  </Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="registeredAddressLine1"
                    value={formData.registeredAddressLine1}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter street address"
                    style={{
                      borderRadius: "6px",
                      border: validationErrors.registeredAddressLine1
                        ? "1px solid #dc3545"
                        : "1px solid #dee2e6",
                      fontSize: "14px",
                      padding: "10px 12px",
                    }}
                  />
                  {renderErrorMessage("registeredAddressLine1")}
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
                    {renderMandatoryLabel(
                      "Registered Address Line 2",
                      false,
                    )}
                  </Form.Label>
                  <Form.Control
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
                  {renderErrorMessage("registeredAddressLine2")}
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
                        {renderMandatoryLabel("City", true)}
                      </Form.Label>
                      <Form.Control
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        required
                        placeholder="Enter city"
                        style={{
                          borderRadius: "6px",
                          border: validationErrors.city
                            ? "1px solid #dc3545"
                            : "1px solid #dee2e6",
                          fontSize: "14px",
                          padding: "10px 12px",
                        }}
                      />
                      {renderErrorMessage("city")}
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
                        {renderMandatoryLabel("State", true)}
                      </Form.Label>
                      <Form.Control
                        type="text"
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        required
                        placeholder="Enter state"
                        style={{
                          borderRadius: "6px",
                          border: validationErrors.state
                            ? "1px solid #dc3545"
                            : "1px solid #dee2e6",
                          fontSize: "14px",
                          padding: "10px 12px",
                        }}
                      />
                      {renderErrorMessage("state")}
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
                        {renderMandatoryLabel("Pincode", true)}
                      </Form.Label>
                      <Form.Control
                        type="text"
                        name="pincode"
                        value={formData.pincode}
                        onChange={handleInputChange}
                        required
                        maxLength={6}
                        placeholder="6 digit code"
                        style={{
                          borderRadius: "6px",
                          border: validationErrors.pincode
                            ? "1px solid #dc3545"
                            : "1px solid #dee2e6",
                          fontSize: "14px",
                          padding: "10px 12px",
                        }}
                      />
                      {renderErrorMessage("pincode")}
                    </Form.Group>
                  </Col>
                </Row>
              </div>
            </Tab.Pane>

            {/* Contact Tab */}
            <Tab.Pane eventKey="contact">
              <div>
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
                        {renderMandatoryLabel("Phone Number", false)}
                      </Form.Label>
                      <Form.Control
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
                      {renderErrorMessage("phoneNumber")}
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
                        {renderMandatoryLabel("Email Address", false)}
                      </Form.Label>
                      <Form.Control
                        type="email"
                        name="emailAddress"
                        value={formData.emailAddress}
                        onChange={handleInputChange}
                        placeholder="company@example.com"
                        style={{
                          borderRadius: "6px",
                          border: validationErrors.emailAddress
                            ? "1px solid #dc3545"
                            : "1px solid #dee2e6",
                          fontSize: "14px",
                          padding: "10px 12px",
                        }}
                      />
                      {renderErrorMessage("emailAddress")}
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
                    {renderMandatoryLabel("Website URL", false)}
                  </Form.Label>
                  <Form.Control
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
                  {renderErrorMessage("websiteUrl")}
                </Form.Group>
              </div>
            </Tab.Pane>

            {/* Tax Information Tab */}
            <Tab.Pane eventKey="tax">
              <div>
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
                        {renderMandatoryLabel(
                          "PAN (Permanent Account Number)",
                          true,
                        )}
                      </Form.Label>
                      <Form.Control
                        type="text"
                        name="pan"
                        value={formData.pan}
                        onChange={handleInputChange}
                        required
                        maxLength={10}
                        placeholder="10 character code"
                        style={{
                          borderRadius: "6px",
                          border: validationErrors.pan
                            ? "1px solid #dc3545"
                            : "1px solid #dee2e6",
                          fontSize: "14px",
                          padding: "10px 12px",
                          fontFamily: "monospace",
                          textTransform: "uppercase",
                        }}
                      />
                      <small style={{ color: "#6c757d", fontSize: "12px" }}>
                        e.g., ABCDE1234F
                      </small>
                      {renderErrorMessage("pan")}
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
                        {renderMandatoryLabel(
                          "TAN (Tax Deduction Account Number)",
                          true,
                        )}
                      </Form.Label>
                      <Form.Control
                        type="text"
                        name="tan"
                        value={formData.tan}
                        onChange={handleInputChange}
                        required
                        maxLength={10}
                        placeholder="10 character code"
                        style={{
                          borderRadius: "6px",
                          border: validationErrors.tan
                            ? "1px solid #dc3545"
                            : "1px solid #dee2e6",
                          fontSize: "14px",
                          padding: "10px 12px",
                          fontFamily: "monospace",
                          textTransform: "uppercase",
                        }}
                      />
                      <small style={{ color: "#6c757d", fontSize: "12px" }}>
                        e.g., AAAA12345A
                      </small>
                      {renderErrorMessage("tan")}
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
                    {renderMandatoryLabel(
                      "GSTIN (Goods & Services Tax Identification Number)",
                      true,
                    )}
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="gstin"
                    value={formData.gstin}
                    onChange={handleInputChange}
                    required
                    maxLength={15}
                    placeholder="15 character code"
                    style={{
                      borderRadius: "6px",
                      border: validationErrors.gstin
                        ? "1px solid #dc3545"
                        : "1px solid #dee2e6",
                      fontSize: "14px",
                      padding: "10px 12px",
                      fontFamily: "monospace",
                      textTransform: "uppercase",
                    }}
                  />
                  <small style={{ color: "#6c757d", fontSize: "12px" }}>
                    e.g., 27AABCT1234F1Z0
                  </small>
                  {renderErrorMessage("gstin")}
                </Form.Group>
              </div>
            </Tab.Pane>

            {/* Financial Tab */}
            <Tab.Pane eventKey="financial">
              <div>
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
                    {renderMandatoryLabel("Base Currency", true)}
                  </Form.Label>
                  <Form.Select
                    name="baseCurrency"
                    value={formData.baseCurrency}
                    onChange={handleInputChange}
                    required
                    style={{
                      borderRadius: "6px",
                      border: validationErrors.baseCurrency
                        ? "1px solid #dc3545"
                        : "1px solid #dee2e6",
                      fontSize: "14px",
                      padding: "10px 12px",
                    }}
                  >
                    <option value="INR">INR - Indian Rupee</option>
                    <option value="USD">USD - US Dollar</option>
                    <option value="EUR">EUR - Euro</option>
                    <option value="GBP">GBP - British Pound</option>
                  </Form.Select>
                  {renderErrorMessage("baseCurrency")}
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
                        {renderMandatoryLabel(
                          "Financial Year Start Date",
                          true,
                        )}
                      </Form.Label>
                      <Form.Control
                        type="date"
                        name="financialYearStartDate"
                        value={formData.financialYearStartDate}
                        onChange={handleInputChange}
                        required
                        style={{
                          borderRadius: "6px",
                          border: validationErrors.financialYearStartDate
                            ? "1px solid #dc3545"
                            : "1px solid #dee2e6",
                          fontSize: "14px",
                          padding: "10px 12px",
                        }}
                      />
                      {renderErrorMessage("financialYearStartDate")}
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
                        {renderMandatoryLabel("Financial Year End Date", true)}
                      </Form.Label>
                      <Form.Control
                        type="date"
                        name="financialYearEndDate"
                        value={formData.financialYearEndDate}
                        onChange={handleInputChange}
                        required
                        style={{
                          borderRadius: "6px",
                          border: validationErrors.financialYearEndDate
                            ? "1px solid #dc3545"
                            : "1px solid #dee2e6",
                          fontSize: "14px",
                          padding: "10px 12px",
                        }}
                      />
                      {renderErrorMessage("financialYearEndDate")}
                    </Form.Group>
                  </Col>
                </Row>
              </div>
            </Tab.Pane>
          </Tab.Content>
        </Tab.Container>

        {/* Action Buttons */}
        <Form onSubmit={handleSubmit}>
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
          <div className="d-flex gap-2">
              <Button
                type="submit"
                disabled={saving}
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
                }}
                className="text-white"
                onMouseEnter={(e) => {
                  const target = e.currentTarget as HTMLElement;
                  target.style.boxShadow = "0 4px 12px rgba(0, 102, 255, 0.3)";
                  target.style.transform = "translateY(-2px)";
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
                    Creating...
                  </>
                ) : (
                  <>
                    <FontAwesomeIcon icon={faSave} className="me-2" />
                    Create Company
                  </>
                )}
              </Button>
              <Button
                type="button"
                onClick={() => navigate("/erp-setup")}
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
                }}
                onMouseEnter={(e) => {
                  const target = e.currentTarget as HTMLElement;
                  target.style.background = "#e9ecef";
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
        </div>
        </Form>
      </Card>
    </Container>
  );
};

export default CompanyCreate;
