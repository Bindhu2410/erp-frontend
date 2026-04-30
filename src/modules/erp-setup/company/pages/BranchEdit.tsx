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
  faCodeBranch,
  faSave,
  faArrowLeft,
  faExclamationTriangle,
  faInfoCircle,
  faMapMarkerAlt,
  faPhone,
  faFileInvoice,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";

const API_BASE_URL = "http://localhost:5104/api";

const INDIAN_STATES = [
  "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh",
  "Goa","Gujarat","Haryana","Himachal Pradesh","Jharkhand","Karnataka",
  "Kerala","Madhya Pradesh","Maharashtra","Manipur","Meghalaya","Mizoram",
  "Nagaland","Odisha","Punjab","Rajasthan","Sikkim","Tamil Nadu","Telangana",
  "Tripura","Uttar Pradesh","Uttarakhand","West Bengal","Delhi",
  "Jammu and Kashmir","Ladakh","Chandigarh","Puducherry",
];

interface IBranchEditForm {
  branchName: string;
  branchCode: string;
  branchAddressLine1: string;
  branchAddressLine2: string;
  city: string;
  state: string;
  pincode: string;
  branchPhoneNumber: string;
  branchEmailAddress: string;
  branchGstin: string;
  isHeadOffice: boolean;
  isActive: boolean;
}

const emptyForm: IBranchEditForm = {
  branchName: "", branchCode: "", branchAddressLine1: "", branchAddressLine2: "",
  city: "", state: "", pincode: "", branchPhoneNumber: "", branchEmailAddress: "",
  branchGstin: "", isHeadOffice: false, isActive: true,
};

const BranchEdit: React.FC = () => {
  const { branchId } = useParams<{ branchId: string }>();
  const [searchParams] = useSearchParams();
  const companyId = searchParams.get("companyId");
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<string>("basic");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [showUnsavedModal, setShowUnsavedModal] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null);
  const [formData, setFormData] = useState<IBranchEditForm>(emptyForm);
  const [originalData, setOriginalData] = useState<IBranchEditForm | null>(null);

  useEffect(() => {
    const fetchBranch = async () => {
      if (!companyId) {
        setError("Company ID is missing. Please navigate from the branch list.");
        setLoading(false);
        return;
      }
      try {
        // GET /api/CsBranch/company/{companyId} then filter by branchId
        const res = await fetch(
          `${API_BASE_URL}/CsBranch/company/${companyId}?includeInactive=true`
        );
        if (!res.ok) throw new Error(`API error: ${res.status}`);
        const data = await res.json();
        const list: any[] = data.data || data || [];
        const b = list.find((item: any) => String(item.branchId) === String(branchId));
        if (!b) throw new Error("Branch not found");

        const mapped: IBranchEditForm = {
          branchName: b.branchName || "",
          branchCode: b.branchCode || "",
          branchAddressLine1: b.branchAddressLine1 || "",
          branchAddressLine2: b.branchAddressLine2 || "",
          city: b.city || "",
          state: b.state || "",
          pincode: b.pincode || "",
          branchPhoneNumber: b.branchPhoneNumber || "",
          branchEmailAddress: b.branchEmailAddress || "",
          branchGstin: b.branchGstin || "",
          isHeadOffice: b.isHeadOffice || false,
          isActive: b.isActive !== undefined ? b.isActive : true,
        };
        setFormData(mapped);
        setOriginalData(mapped);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch branch details");
      } finally {
        setLoading(false);
      }
    };
    fetchBranch();
  }, [branchId, companyId]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const target = e.target as HTMLInputElement;
    const { name, value, type } = target;
    const finalValue = type === "checkbox" ? target.checked : value;
    setFormData((prev) => ({ ...prev, [name]: finalValue }));
    if (success) setSuccess(null);
  };

  const hasChanges = () => {
    if (!originalData) return false;
    return JSON.stringify(formData) !== JSON.stringify(originalData);
  };

  const validateForm = () => {
    const errors: { [key: string]: string } = {};
    if (!formData.branchName.trim()) errors.branchName = "Branch Name is required";
    if (!formData.branchCode.trim()) errors.branchCode = "Branch Code is required";
    if (!formData.branchAddressLine1.trim()) errors.branchAddressLine1 = "Address Line 1 is required";
    if (!formData.city.trim()) errors.city = "City is required";
    if (!formData.state.trim()) errors.state = "State is required";
    if (!formData.pincode.trim()) errors.pincode = "Pincode is required";
    if (!formData.branchGstin.trim()) errors.branchGstin = "GSTIN is required";
    if (formData.pincode && !/^\d{6}$/.test(formData.pincode))
      errors.pincode = "Pincode must be 6 digits";
    if (formData.branchEmailAddress && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.branchEmailAddress))
      errors.branchEmailAddress = "Please enter a valid email address";
    if (formData.branchGstin && formData.branchGstin.length !== 15)
      errors.branchGstin = "GSTIN must be 15 characters";
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setFormErrors(validationErrors);
      const fieldToTabMap: { [key: string]: string } = {
        branchName: "basic", branchCode: "basic", isHeadOffice: "basic", isActive: "basic",
        branchAddressLine1: "address", branchAddressLine2: "address",
        city: "address", state: "address", pincode: "address",
        branchPhoneNumber: "contact", branchEmailAddress: "contact",
        branchGstin: "tax",
      };
      const firstErr = Object.keys(validationErrors)[0];
      const tab = fieldToTabMap[firstErr];
      if (tab) {
        setActiveTab(tab);
        setTimeout(() => {
          const el = document.getElementById(`field-${firstErr}`);
          if (el) { el.scrollIntoView({ behavior: "smooth", block: "center" }); el.focus(); }
        }, 300);
      }
      return;
    }
    setFormErrors({});
    if (!hasChanges()) return;

    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      // PUT /api/CsBranch — field names must match UpdateCsBranchDto exactly
      const payload = {
        BranchId: parseInt(branchId!),
        BranchName: formData.branchName.trim(),
        BranchCode: formData.branchCode.trim().toUpperCase(),
        AddressLine1: formData.branchAddressLine1.trim(),
        AddressLine2: formData.branchAddressLine2.trim() || null,
        City: formData.city.trim(),
        State: formData.state.trim(),
        Pincode: formData.pincode.trim(),
        PhoneNumber: formData.branchPhoneNumber.trim() || null,
        EmailAddress: formData.branchEmailAddress.trim() || null,
        Gstin: formData.branchGstin.trim().toUpperCase() || null,
        IsHeadOffice: formData.isHeadOffice,
        IsActive: formData.isActive,
      };
      const res = await fetch(`${API_BASE_URL}/CsBranch`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const resData = await res.json().catch(() => ({}));
      if (!res.ok) {
        // Show the server's error message
        const errMsg =
          resData?.message ||
          (resData?.errors ? Object.values(resData.errors).flat().join(", ") : null) ||
          `Server error ${res.status}`;
        throw new Error(errMsg);
      }
      setSuccess(resData?.message || "Branch updated successfully!");
      setOriginalData({ ...formData });
      setTimeout(() => {
        navigate(`/erp-setup/branch-view/${branchId}?companyId=${companyId}`);
      }, 1800);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update branch");
    } finally {
      setSaving(false);
    }
  };

  // ── helpers ──────────────────────────────────────────────────────────────────
  const inputStyle = (fieldName: string): React.CSSProperties => ({
    borderRadius: "6px",
    border: formErrors[fieldName] ? "1px solid #dc3545" : "1px solid #dee2e6",
    fontSize: "14px",
    padding: "10px 12px",
  });

  const renderTabNavLink = (key: string, icon: any, label: string) => (
    <Nav.Item key={key}>
      <Nav.Link
        eventKey={key}
        style={{
          borderRadius: "6px", padding: "10px 16px", fontSize: "14px", fontWeight: 600,
          backgroundColor: activeTab === key ? "#d9f0ff" : "transparent",
          color: activeTab === key ? "#0066ff" : "#6c757d",
          border: "2px solid", borderColor: activeTab === key ? "#0066ff" : "#1a1a1a",
          transition: "all 0.3s ease", cursor: "pointer",
        }}
        onMouseEnter={(e) => { const el=e.currentTarget as HTMLElement; el.style.backgroundColor="#d9f0ff"; el.style.color="#1a1a1a"; el.style.borderColor="#1a1a1a"; }}
        onMouseLeave={(e) => { if (activeTab !== key) { const el=e.currentTarget as HTMLElement; el.style.backgroundColor="transparent"; el.style.color="#6c757d"; el.style.borderColor="#1a1a1a"; } }}
      >
        <FontAwesomeIcon icon={icon} className="me-2" />{label}
      </Nav.Link>
    </Nav.Item>
  );

  const renderField = (id: string, label: string, children: React.ReactNode, required = false) => (
    <Form.Group className="mb-4">
      <Form.Label style={{ fontSize: "13px", fontWeight: 600, color: "#495057", marginBottom: "8px" }}>
        {label}{required && <span style={{ color: "#dc3545", marginLeft: "4px" }}>*</span>}
      </Form.Label>
      {children}
      {formErrors[id] && <div style={{ color: "#dc3545", fontSize: "12px", marginTop: "4px" }}>{formErrors[id]}</div>}
    </Form.Group>
  );

  const SaveBar = () => (
    <div className="d-flex gap-3 pt-3" style={{ borderTop: "1px solid #e9ecef" }}>
      <Button
        type="submit" disabled={saving}
        style={{ background: "linear-gradient(135deg, #0066ff 0%, #003d99 100%)", border: "none", borderRadius: "6px", padding: "10px 20px", fontWeight: 600, fontSize: "14px", boxShadow: "0 2px 6px rgba(0,102,255,0.15)", transition: "all 0.3s ease" }}
        className="text-white"
        onMouseEnter={(e) => { const t=e.currentTarget as HTMLElement; t.style.boxShadow="0 4px 12px rgba(0,102,255,0.3)"; t.style.transform="translateY(-2px)"; }}
        onMouseLeave={(e) => { const t=e.currentTarget as HTMLElement; t.style.boxShadow="0 2px 6px rgba(0,102,255,0.15)"; t.style.transform="translateY(0)"; }}
      >
        {saving ? (<><Spinner animation="border" size="sm" className="me-2" />Saving...</>) : (<><FontAwesomeIcon icon={faSave} className="me-2" />Save Changes</>)}
      </Button>
      <Button
        type="button" variant="outline-secondary"
        onClick={() => handleNavigation(`/erp-setup/branch-setup`)}
        style={{ borderRadius: "6px", padding: "10px 20px", fontWeight: 600, fontSize: "14px" }}
      >
        <FontAwesomeIcon icon={faTimes} className="me-2" />Cancel
      </Button>
    </div>
  );

  // ── Loading / Error ──────────────────────────────────────────────────────────
  if (loading) {
    return (
      <Container className="mt-4">
        <div className="text-center">
          <Spinner animation="border" variant="primary" />
          <p className="mt-2">Loading branch details...</p>
        </div>
      </Container>
    );
  }

  if (error && !formData.branchName) {
    return (
      <Container className="mt-4">
        <Alert variant="danger">
          <h5>Error</h5>
          <p>{error}</p>
          <Button variant="outline-danger" onClick={() => navigate("/erp-setup/branch-setup")}>
            <FontAwesomeIcon icon={faArrowLeft} className="me-2" />Back to Branches
          </Button>
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="mt-4 mb-5">
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="mb-4">
        <Button
          variant="outline-secondary"
          onClick={() => handleNavigation(`/erp-setup/branch-setup`)}
          style={{ fontSize: "13px", padding: "8px 12px", fontWeight: 500, border: "1px solid #e9ecef", color: "#6c757d", backgroundColor: "#ffffff", transition: "all 0.2s ease" }}
          onMouseEnter={(e) => { const t=e.currentTarget as HTMLElement; t.style.backgroundColor="#f8f9fa"; t.style.borderColor="#dee2e6"; }}
          onMouseLeave={(e) => { const t=e.currentTarget as HTMLElement; t.style.backgroundColor="#ffffff"; t.style.borderColor="#e9ecef"; }}
          className="mb-3"
        >
          <FontAwesomeIcon icon={faArrowLeft} className="me-2" />Back to Branches
        </Button>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h1 style={{ fontSize: "24px", fontWeight: 600, color: "#1a1a1a", marginBottom: "4px" }}>
              <FontAwesomeIcon icon={faCodeBranch} className="me-2" style={{ color: "#0066ff" }} />
              Edit Branch
            </h1>
            <p style={{ fontSize: "13px", color: "#6c757d", marginBottom: 0 }}>Update branch information</p>
          </div>
          <Badge style={{ background: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)", color: "#ffffff", fontSize: "12px", fontWeight: 600, padding: "8px 12px" }}>
            ID: #{branchId}
          </Badge>
        </div>
      </div>

      {success && <Alert variant="success" className="mb-4"><FontAwesomeIcon icon={faSave} className="me-2" />{success}</Alert>}
      {error && <Alert variant="danger" className="mb-4">{error}</Alert>}

      <Card style={{ border: "none", borderRadius: "12px", overflow: "hidden", background: "#ffffff", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
        <Tab.Container activeKey={activeTab} onSelect={(k) => setActiveTab(k || "basic")}>
          {/* Tab Navigation */}
          <Nav
            variant="pills"
            className="d-flex flex-wrap gap-2"
            style={{ background: "#f8f9fa", borderBottom: "1px solid #e9ecef", padding: "16px", margin: 0 }}
          >
            {renderTabNavLink("basic", faInfoCircle, "Basic Info")}
            {renderTabNavLink("address", faMapMarkerAlt, "Address")}
            {renderTabNavLink("contact", faPhone, "Contact")}
            {renderTabNavLink("tax", faFileInvoice, "Tax Info")}
          </Nav>

          <Tab.Content style={{ padding: "24px" }}>
            {/* ── Basic Info Tab ────────────────────────────────────────────── */}
            <Tab.Pane eventKey="basic">
              <Form onSubmit={handleSubmit}>
                <h5 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "20px", color: "#1a1a1a" }}>
                  <FontAwesomeIcon icon={faInfoCircle} className="me-2" style={{ color: "#0066ff" }} />
                  Basic Branch Information
                </h5>
                <Row>
                  <Col lg={6}>
                    {renderField("branchName", "Branch Name",
                      <Form.Control id="field-branchName" type="text" name="branchName" value={formData.branchName} onChange={handleInputChange} required placeholder="e.g. Mumbai Branch" isInvalid={!!formErrors.branchName} style={inputStyle("branchName")} />,
                      true
                    )}
                  </Col>
                  <Col lg={6}>
                    {renderField("branchCode", "Branch Code",
                      <Form.Control id="field-branchCode" type="text" name="branchCode" value={formData.branchCode} onChange={handleInputChange} required placeholder="e.g. MUM-001" isInvalid={!!formErrors.branchCode} style={inputStyle("branchCode")} />,
                      true
                    )}
                  </Col>
                  <Col lg={6}>
                    <Form.Group className="mb-4">
                      <Form.Label style={{ fontSize: "13px", fontWeight: 600, color: "#495057", marginBottom: "8px" }}>Head Office</Form.Label>
                      <div style={{ padding: "10px 14px", border: "1px solid #dee2e6", borderRadius: "6px", background: "#f8f9fa" }}>
                        <Form.Check id="field-isHeadOffice" type="switch" name="isHeadOffice" label="This branch is the Head Office" checked={formData.isHeadOffice} onChange={handleInputChange} style={{ fontSize: "14px" }} />
                      </div>
                    </Form.Group>
                  </Col>
                  <Col lg={6}>
                    <Form.Group className="mb-4">
                      <Form.Label style={{ fontSize: "13px", fontWeight: 600, color: "#495057", marginBottom: "8px" }}>Status</Form.Label>
                      <div style={{ padding: "10px 14px", border: "1px solid #dee2e6", borderRadius: "6px", background: "#f8f9fa" }}>
                        <Form.Check id="field-isActive" type="switch" name="isActive" label="Branch is Active" checked={formData.isActive} onChange={handleInputChange} style={{ fontSize: "14px" }} />
                      </div>
                    </Form.Group>
                  </Col>
                </Row>
                <SaveBar />
              </Form>
            </Tab.Pane>

            {/* ── Address Tab ────────────────────────────────────────────────── */}
            <Tab.Pane eventKey="address">
              <Form onSubmit={handleSubmit}>
                <h5 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "20px", color: "#1a1a1a" }}>
                  <FontAwesomeIcon icon={faMapMarkerAlt} className="me-2" style={{ color: "#10b981" }} />Address Information
                </h5>
                <Row>
                  <Col lg={12}>
                    {renderField("branchAddressLine1", "Address Line 1",
                      <Form.Control id="field-branchAddressLine1" type="text" name="branchAddressLine1" value={formData.branchAddressLine1} onChange={handleInputChange} required placeholder="Street address" isInvalid={!!formErrors.branchAddressLine1} style={inputStyle("branchAddressLine1")} />,
                      true
                    )}
                  </Col>
                  <Col lg={12}>
                    {renderField("branchAddressLine2", "Address Line 2",
                      <Form.Control id="field-branchAddressLine2" type="text" name="branchAddressLine2" value={formData.branchAddressLine2} onChange={handleInputChange} placeholder="Landmark, Area (optional)" style={inputStyle("branchAddressLine2")} />
                    )}
                  </Col>
                  <Col lg={4}>
                    {renderField("city", "City",
                      <Form.Control id="field-city" type="text" name="city" value={formData.city} onChange={handleInputChange} required placeholder="City" isInvalid={!!formErrors.city} style={inputStyle("city")} />,
                      true
                    )}
                  </Col>
                  <Col lg={4}>
                    {renderField("state", "State",
                      <Form.Select id="field-state" name="state" value={formData.state} onChange={handleInputChange} required isInvalid={!!formErrors.state} style={inputStyle("state")}>
                        <option value="">Select State</option>
                        {INDIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                      </Form.Select>,
                      true
                    )}
                  </Col>
                  <Col lg={4}>
                    {renderField("pincode", "Pincode",
                      <Form.Control id="field-pincode" type="text" name="pincode" value={formData.pincode} onChange={handleInputChange} required placeholder="6-digit pincode" maxLength={6} isInvalid={!!formErrors.pincode} style={inputStyle("pincode")} />,
                      true
                    )}
                  </Col>
                </Row>
                <SaveBar />
              </Form>
            </Tab.Pane>

            {/* ── Contact Tab ────────────────────────────────────────────────── */}
            <Tab.Pane eventKey="contact">
              <Form onSubmit={handleSubmit}>
                <h5 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "20px", color: "#1a1a1a" }}>
                  <FontAwesomeIcon icon={faPhone} className="me-2" style={{ color: "#0066ff" }} />Contact Information
                </h5>
                <Row>
                  <Col lg={6}>
                    {renderField("branchPhoneNumber", "Phone Number",
                      <Form.Control id="field-branchPhoneNumber" type="tel" name="branchPhoneNumber" value={formData.branchPhoneNumber} onChange={handleInputChange} placeholder="Phone number" style={inputStyle("branchPhoneNumber")} />
                    )}
                  </Col>
                  <Col lg={6}>
                    {renderField("branchEmailAddress", "Email Address",
                      <Form.Control id="field-branchEmailAddress" type="email" name="branchEmailAddress" value={formData.branchEmailAddress} onChange={handleInputChange} placeholder="branch@company.com" isInvalid={!!formErrors.branchEmailAddress} style={inputStyle("branchEmailAddress")} />
                    )}
                  </Col>
                </Row>
                <SaveBar />
              </Form>
            </Tab.Pane>

            {/* ── Tax Info Tab ────────────────────────────────────────────────── */}
            <Tab.Pane eventKey="tax">
              <Form onSubmit={handleSubmit}>
                <h5 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "20px", color: "#1a1a1a" }}>
                  <FontAwesomeIcon icon={faFileInvoice} className="me-2" style={{ color: "#f59e0b" }} />Tax Information
                </h5>
                <Row>
                  <Col lg={6}>
                    {renderField("branchGstin", "GSTIN",
                      <>
                        <Form.Control id="field-branchGstin" type="text" name="branchGstin" value={formData.branchGstin} onChange={handleInputChange} required placeholder="15-character GSTIN" maxLength={15} isInvalid={!!formErrors.branchGstin} style={inputStyle("branchGstin")} />
                        <Form.Text className="text-muted" style={{ fontSize: "12px" }}>Format: 27AAAAA0000A1Z5</Form.Text>
                      </>,
                      true
                    )}
                  </Col>
                </Row>
                <SaveBar />
              </Form>
            </Tab.Pane>
          </Tab.Content>
        </Tab.Container>
      </Card>

      {/* ── Unsaved Changes Modal ─────────────────────────────────────────────── */}
      <Modal show={showUnsavedModal} onHide={() => setShowUnsavedModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <FontAwesomeIcon icon={faExclamationTriangle} className="text-warning me-2" />
            Unsaved Changes
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>You have unsaved changes. Are you sure you want to leave without saving?</p>
          <Alert variant="warning" className="mb-0">
            <small>
              <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" />
              Your changes will be lost if you proceed without saving.
            </small>
          </Alert>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowUnsavedModal(false)}>Stay &amp; Continue Editing</Button>
          <Button variant="danger" onClick={() => { if (pendingNavigation) navigate(pendingNavigation); setShowUnsavedModal(false); }}>Leave Without Saving</Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default BranchEdit;
