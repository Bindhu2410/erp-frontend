import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import {
  Card,
  Container,
  Row,
  Col,
  Button,
  Badge,
  Modal,
  Alert,
  Spinner,
  Nav,
  Tab,
  Form,
  InputGroup,
  ButtonGroup,
  Table,
} from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faSearch,
  faBuilding,
  faMapMarkerAlt,
  faPhone,
  faEnvelope,
  faGlobe,
  faEye,
  faEdit,
  faTrash,
  faExclamationTriangle,
  faSave,
  faInfoCircle,
  faFileInvoiceDollar,
  faCalculator,
  faList,
  faTh,
} from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import { companyListService, ICompanyUpdateRequest, ICompanyCreateRequest } from "../services/companyList.service";
import { ICompanyListItem } from "../interfaces/companyList.types";

interface ICompanyForm {
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

const CompanyList: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [companies, setCompanies] = useState<ICompanyListItem[]>([]);
  const [filteredCompanies, setFilteredCompanies] = useState<ICompanyListItem[]>([]);
  const [viewMode, setViewMode] = useState<"list" | "card">("list");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [companyToDelete, setCompanyToDelete] =
    useState<ICompanyListItem | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

   // Add/Edit Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<string>("basic");
  const [formData, setFormData] = useState<ICompanyForm>({
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
    financialYearStartDate: new Date().toISOString().split('T')[0],
    financialYearEndDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
    pan: "",
    tan: "",
    gstin: "",
    legalEntityType: "private_limited",
    legalNameAsPerPanTan: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const response = await companyListService.getCompanies();
        setCompanies(response.data);
      } catch (error) {
        console.error("Error fetching companies:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCompanies();
  }, []);

  useEffect(() => {
    const filtered = companies.filter(
      (company) =>
        company.legalCompanyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.state.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.pan.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.gstin.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredCompanies(filtered);
  }, [searchTerm, companies]);

  const handleDeleteClick = (company: ICompanyListItem) => {
    setCompanyToDelete(company);
    setShowDeleteModal(true);
    setDeleteError(null);
  };

  const handleDeleteConfirm = async () => {
    if (!companyToDelete) return;

    setDeleting(true);
    setDeleteError(null);

    try {
      await companyListService.deleteCompany(companyToDelete.companyId);

      // Remove the deleted company from the local state
      const updatedCompanies = companies.filter(
        (c) => c.companyId !== companyToDelete.companyId,
      );
      setCompanies(updatedCompanies);

      // Close modal and reset state
      setShowDeleteModal(false);
      setCompanyToDelete(null);
      toast.success("Company deleted successfully!");
    } catch (error) {
      console.error("Error deleting company:", error);
      const msg = error instanceof Error ? error.message : "Failed to delete company";
      setDeleteError(msg);
      toast.error(msg);
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setCompanyToDelete(null);
    setDeleteError(null);
  };

  const handleOpenAdd = () => {
    setFormData({
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
      financialYearStartDate: new Date().toISOString().split('T')[0],
      financialYearEndDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
      pan: "",
      tan: "",
      gstin: "",
      legalEntityType: "private_limited",
      legalNameAsPerPanTan: "",
    });
    setIsEditMode(false);
    setEditingId(null);
    setActiveTab("basic");
    setFormError(null);
    setShowAddModal(true);
  };

  const handleOpenEdit = (company: ICompanyListItem) => {
    setFormData({
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
      financialYearStartDate: company.financialYearStartDate?.split("T")[0] || "",
      financialYearEndDate: company.financialYearEndDate?.split("T")[0] || "",
      pan: company.pan,
      tan: company.tan,
      gstin: company.gstin,
      legalEntityType: company.legalEntityType,
      legalNameAsPerPanTan: company.legalNameAsPerPanTan,
    });
    setEditingId(company.companyId);
    setIsEditMode(true);
    setActiveTab("basic");
    setFormError(null);
    setShowAddModal(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev: ICompanyForm) => ({
      ...prev,
      [name]: name === "parentCompanyId" ? (value ? parseInt(value) : null) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError(null);

    try {
      if (isEditMode && editingId) {
        const updateData: ICompanyUpdateRequest = {
          ...formData,
          companyId: editingId,
          companyLogoPath: "",
          financialYearStartDate: formData.financialYearStartDate + "T00:00:00",
          financialYearEndDate: formData.financialYearEndDate + "T00:00:00",
        };
        await companyListService.updateCompany(updateData);
        toast.success("Company updated successfully!");
      } else {
        const createData: ICompanyCreateRequest = {
          ...formData,
          companyLogoPath: "",
          financialYearStartDate: formData.financialYearStartDate + "T00:00:00",
          financialYearEndDate: formData.financialYearEndDate + "T00:00:00",
        };
        await companyListService.createCompany(createData);
        toast.success("Company created successfully!");
      }
      
      const response = await companyListService.getCompanies();
      setCompanies(response.data);
      
      setTimeout(() => {
        setShowAddModal(false);
      }, 1500);
    } catch (err: any) {
      const msg = err.message || "Failed to save company details.";
      setFormError(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Container className="mt-4">
        <div className="text-center py-5">
           <Spinner animation="border" variant="primary" />
           <p className="mt-2 text-muted">Loading companies...</p>
        </div>
      </Container>
    );
  }

  return (
    <Container className="mt-4 mb-5">
      {/* Search and Controls Header */}
      <Card className="mb-4 shadow-sm" style={{ border: "none", borderRadius: "8px" }}>
        <Card.Body className="p-3">
          <Row className="align-items-center g-3">
            <Col lg={3} md={12}>
              <div className="d-flex align-items-center">
                <div style={{ width: "40px", height: "40px", borderRadius: "8px", background: "linear-gradient(135deg, #0061f2 0%, #003d99 100%)", display: "flex", alignItems: "center", justifyContent: "center", marginRight: "12px", flexShrink: 0 }}>
                  <FontAwesomeIcon icon={faBuilding} className="text-white" size="lg" />
                </div>
                <div>
                  <h4 className="mb-0" style={{ fontWeight: 600, color: "#1a1a1a", fontSize: "18px" }}>Companies</h4>
                  <small className="text-muted" style={{ fontSize: "12px" }}>Setup & Configuration</small>
                </div>
              </div>
            </Col>

            <Col lg={5} md={12}>
              <InputGroup size="sm" style={{ borderRadius: "6px", overflow: "hidden" }}>
                <InputGroup.Text style={{ background: "#f8f9fa", border: "1px solid #dee2e6" }}>
                  <FontAwesomeIcon icon={faSearch} className="text-muted" />
                </InputGroup.Text>
                <Form.Control 
                  type="text" 
                  placeholder="Search by name, city, PAN, GSTIN..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ border: "1px solid #dee2e6", fontSize: "14px" }} 
                />
              </InputGroup>
            </Col>

            <Col lg={4} md={12} className="d-flex align-items-center gap-2 justify-content-lg-end">
              <ButtonGroup size="sm">
                <Button variant={viewMode === "list" ? "primary" : "outline-secondary"} onClick={() => setViewMode("list")} style={{ fontSize: "12px", padding: "6px 12px", fontWeight: 500 }}>
                  <FontAwesomeIcon icon={faList} className="me-1" /> List
                </Button>
                <Button variant={viewMode === "card" ? "primary" : "outline-secondary"} onClick={() => setViewMode("card")} style={{ fontSize: "12px", padding: "6px 12px", fontWeight: 500 }}>
                  <FontAwesomeIcon icon={faTh} className="me-1" /> Cards
                </Button>
              </ButtonGroup>
              <Button
                onClick={handleOpenAdd}
                style={{ background: "linear-gradient(135deg, #0061f2 0%, #003d99 100%)", border: "none", borderRadius: "6px", padding: "8px 16px", fontWeight: 600, fontSize: "13px", boxShadow: "0 2px 6px rgba(0, 97, 242, 0.15)", transition: "all 0.3s ease", whiteSpace: "nowrap" }}
                className="text-white"
              >
                <FontAwesomeIcon icon={faPlus} className="me-2" /> Add Company
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Stats Bar */}
      <Row className="mb-3">
        <Col xs={12}>
          <div className="d-flex align-items-center justify-content-between" style={{ padding: "0 8px" }}>
            <span className="text-muted" style={{ fontSize: "13px" }}>
              Total: <strong>{filteredCompanies.length}</strong> companies found
            </span>
            <Badge style={{ background: "linear-gradient(135deg, #10b981 0%, #059669 100%)", padding: "6px 12px", fontSize: "12px", fontWeight: 600 }}>
              {filteredCompanies.length} Active
            </Badge>
          </div>
        </Col>
      </Row>

      {error && <Alert variant="danger" className="border-0 shadow-sm">{error}</Alert>}

      {!error && (
        <Card className="shadow-sm" style={{ border: "none", borderRadius: "8px" }}>
          {filteredCompanies.length === 0 ? (
            <div className="text-center py-5">
              <FontAwesomeIcon icon={faBuilding} size="3x" className="text-muted mb-3 opacity-25" />
              <h5 className="text-muted">No companies found</h5>
              <p className="text-muted small">Try adjusting your search criteria</p>
            </div>
          ) : viewMode === "list" ? (
            <div className="table-responsive">
              <Table hover className="mb-0">
                <thead style={{ background: "#f8f9fa", borderBottom: "2px solid #dee2e6" }}>
                  <tr>
                    <th style={{ fontSize: "12px", fontWeight: 600, color: "#495057", padding: "12px" }}>Company Details</th>
                    <th style={{ fontSize: "12px", fontWeight: 600, color: "#495057", padding: "12px" }}>Location</th>
                    <th style={{ fontSize: "12px", fontWeight: 600, color: "#495057", padding: "12px" }}>PAN / GSTIN</th>
                    <th style={{ fontSize: "12px", fontWeight: 600, color: "#495057", padding: "12px" }}>Currency</th>
                    <th style={{ fontSize: "12px", fontWeight: 600, color: "#495057", padding: "12px" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCompanies.map((company, idx) => (
                    <tr key={company.companyId} style={{ borderBottom: "1px solid #e9ecef", backgroundColor: idx % 2 === 0 ? "#ffffff" : "#f8f9fa" }}>
                      <td style={{ padding: "12px" }}>
                        <strong style={{ color: "#1a1a1a", fontSize: "14px" }}>{company.legalCompanyName}</strong>
                        <div className="text-muted small">{company.emailAddress}</div>
                      </td>
                      <td style={{ padding: "12px" }}>
                        <div style={{ color: "#1a1a1a", fontSize: "14px" }}>{company.city}</div>
                        <small className="text-muted">{company.state}</small>
                      </td>
                      <td style={{ padding: "12px" }}>
                        <div className="small">PAN: <code className="text-primary">{company.pan}</code></div>
                        <div className="small">GST: <code className="text-primary">{company.gstin}</code></div>
                      </td>
                      <td style={{ padding: "12px" }}>
                        <Badge bg="info" style={{ fontSize: "11px", fontWeight: 600 }}>{company.baseCurrency}</Badge>
                      </td>
                      <td style={{ padding: "12px" }}>
                        <div className="d-flex gap-2">
                           <Button variant="light" size="sm" onClick={() => navigate(`/erp-setup/company-view/${company.companyId}`)} title="View Details" style={{ background: "#f0f4ff", color: "#0061f2", border: "none" }}>
                             <FontAwesomeIcon icon={faEye} />
                           </Button>
                           <Button variant="light" size="sm" onClick={() => handleOpenEdit(company)} title="Edit" style={{ background: "#f5f5f5", color: "#6c757d", border: "none" }}>
                             <FontAwesomeIcon icon={faEdit} />
                           </Button>
                           <Button variant="light" size="sm" onClick={() => handleDeleteClick(company)} title="Delete" style={{ background: "#ffe6e6", color: "#dc3545", border: "none" }}>
                             <FontAwesomeIcon icon={faTrash} />
                           </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          ) : (
            <Card.Body className="p-4 bg-light">
              <Row className="g-4">
                {filteredCompanies.map((company) => (
                  <Col lg={4} md={6} key={company.companyId}>
                    <Card 
                      className="h-100 border-0 shadow-sm" 
                      style={{ borderRadius: "10px", transition: "all 0.3s ease" }}
                      onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 0.125rem 0.25rem rgba(0,0,0,0.075)'; }}
                    >
                      <div style={{ height: "4px", background: "linear-gradient(90deg, #0061f2, #003d99)", borderTopLeftRadius: "10px", borderTopRightRadius: "10px" }} />
                      <Card.Body>
                        <div className="d-flex justify-content-between align-items-start mb-3">
                          <FontAwesomeIcon icon={faBuilding} className="text-primary" size="lg" />
                          <Badge bg="light" text="dark" className="border">{company.legalEntityType.replace("_", " ")}</Badge>
                        </div>
                        <h6 className="mb-3" style={{ fontWeight: 700, fontSize: "16px" }}>{company.legalCompanyName}</h6>
                        
                        <div className="mb-3 small text-muted">
                           <div className="mb-1"><FontAwesomeIcon icon={faMapMarkerAlt} className="me-2" />{company.city}, {company.state}</div>
                           <div className="mb-1"><FontAwesomeIcon icon={faPhone} className="me-2" />{company.phoneNumber}</div>
                           <div className="mb-1"><FontAwesomeIcon icon={faEnvelope} className="me-2" />{company.emailAddress}</div>
                        </div>

                        <div className="pt-3 border-top d-flex justify-content-between align-items-center">
                          <div className="small">
                            <span className="fw-bold">PAN:</span> {company.pan}
                          </div>
                          <div className="d-flex gap-2">
                             <Button variant="light" size="sm" onClick={() => navigate(`/erp-setup/company-view/${company.companyId}`)} style={{ background: "#f0f4ff", color: "#0061f2", border: "none" }} title="View Details"><FontAwesomeIcon icon={faEye} /></Button>
                             <Button variant="light" size="sm" onClick={() => handleOpenEdit(company)} style={{ background: "#f5f5f5", color: "#6c757d", border: "none" }} title="Edit"><FontAwesomeIcon icon={faEdit} /></Button>
                             <Button variant="light" size="sm" onClick={() => handleDeleteClick(company)} style={{ background: "#ffe6e6", color: "#dc3545", border: "none" }} title="Delete"><FontAwesomeIcon icon={faTrash} /></Button>
                          </div>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>
            </Card.Body>
          )}
        </Card>
      )}

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={handleDeleteCancel} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <FontAwesomeIcon
              icon={faExclamationTriangle}
              className="text-danger me-2"
            />
            Confirm Delete
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {deleteError && (
            <Alert variant="danger" className="mb-3">
              {deleteError}
            </Alert>
          )}

          {companyToDelete && (
            <>
              <p>Are you sure you want to delete the following company?</p>
              <Card className="mb-3">
                <Card.Body className="py-2">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <strong>{companyToDelete.legalCompanyName}</strong>
                      <br />
                      <small className="text-muted">
                        {companyToDelete.city}, {companyToDelete.state}
                      </small>
                    </div>
                    <div className="text-end">
                      <Badge bg="info" className="d-block mb-1">
                        ID: {companyToDelete.companyId}
                      </Badge>
                      <code className="small">{companyToDelete.pan}</code>
                    </div>
                  </div>
                </Card.Body>
              </Card>
              <Alert variant="warning" className="mb-0">
                <small>
                  <FontAwesomeIcon
                    icon={faExclamationTriangle}
                    className="me-2"
                  />
                  <strong>Warning:</strong> This action cannot be undone. All
                  data associated with this company will be permanently deleted.
                </small>
              </Alert>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={handleDeleteCancel}
            disabled={deleting}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleDeleteConfirm}
            disabled={deleting}
          >
            {deleting ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Deleting...
              </>
            ) : (
              <>
                <FontAwesomeIcon icon={faTrash} className="me-2" />
                Delete Company
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal 
        show={showAddModal} 
        onHide={() => setShowAddModal(false)} 
        size="lg" 
        centered 
        scrollable
        contentClassName="border-0 shadow-lg rounded-4"
      >
        <Form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
          <Modal.Header 
            closeButton
            closeVariant="white"
            style={{ 
              background: "#0061f2", 
              color: "#fff", 
              border: "none",
              padding: "20px 24px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between"
            }}
          >
            <Modal.Title style={{ fontWeight: 600, fontSize: "18px", display: "flex", alignItems: "center" }}>
              <div style={{ 
                width: "32px", height: "32px", borderRadius: "6px", 
                background: "rgba(255,255,255,0.2)", 
                display: "flex", alignItems: "center", justifyContent: "center",
                marginRight: "12px"
              }}>
                <FontAwesomeIcon icon={faBuilding} size="sm" />
              </div>
              {isEditMode ? "Edit Company Details" : "Add New Company"}
            </Modal.Title>
          </Modal.Header>
            <Modal.Body className="p-4" style={{ backgroundColor: "#fff" }}>
              {formError && <Alert variant="danger" className="border-0 shadow-sm mb-4">{formError}</Alert>}
              
              <div className="form-sections">
                {/* Basic Info Section */}
                <div className="mb-4">
                  <h6 style={{ color: "#0061f2", fontWeight: 700, fontSize: "14px", marginBottom: "16px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Basic Information</h6>
                  <Row className="g-3">
                    <Col md={12}>
                      <Form.Group>
                        <Form.Label style={{ fontSize: "13px", color: "#495057", fontWeight: 500 }}>Legal Company Name <span className="text-danger">*</span></Form.Label>
                        <Form.Control name="legalCompanyName" value={formData.legalCompanyName} onChange={handleInputChange} required placeholder="e.g. Acme Corp India Pvt Ltd" style={{ borderRadius: "8px", padding: "10px 15px", border: "1px solid #d1d9e6" }} />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label style={{ fontSize: "13px", color: "#495057", fontWeight: 500 }}>Legal Entity Type <span className="text-danger">*</span></Form.Label>
                        <Form.Select name="legalEntityType" value={formData.legalEntityType} onChange={handleInputChange} required style={{ borderRadius: "8px", padding: "10px 15px", border: "1px solid #d1d9e6" }}>
                          <option value="private_limited">Private Limited</option>
                          <option value="public_limited">Public Limited</option>
                          <option value="partnership">Partnership</option>
                          <option value="proprietorship">Proprietorship</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label style={{ fontSize: "13px", color: "#495057", fontWeight: 500 }}>Legal Name as per PAN/TAN <span className="text-danger">*</span></Form.Label>
                        <Form.Control name="legalNameAsPerPanTan" value={formData.legalNameAsPerPanTan} onChange={handleInputChange} required placeholder="Full name as on PAN" style={{ borderRadius: "8px", padding: "10px 15px", border: "1px solid #d1d9e6" }} />
                      </Form.Group>
                    </Col>
                    <Col md={12}>
                      <Form.Group>
                        <Form.Label style={{ fontSize: "13px", color: "#495057", fontWeight: 500 }}>Parent Company (if any)</Form.Label>
                        <Form.Select name="parentCompanyId" value={formData.parentCompanyId || ""} onChange={handleInputChange} style={{ borderRadius: "8px", padding: "10px 15px", border: "1px solid #d1d9e6" }}>
                          <option value="">No Parent (Self)</option>
                          {companies.filter(c => c.companyId !== editingId).map(c => <option key={c.companyId} value={c.companyId}>{c.legalCompanyName}</option>)}
                        </Form.Select>
                      </Form.Group>
                    </Col>
                  </Row>
                </div>

                <hr style={{ margin: "24px 0", opacity: 0.1 }} />

                {/* Address Section */}
                <div className="mb-4">
                  <h6 style={{ color: "#0061f2", fontWeight: 700, fontSize: "14px", marginBottom: "16px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Registered Address</h6>
                  <Row className="g-3">
                    <Col md={12}>
                      <Form.Group>
                        <Form.Label style={{ fontSize: "13px", color: "#495057", fontWeight: 500 }}>Address Line 1 <span className="text-danger">*</span></Form.Label>
                        <Form.Control name="registeredAddressLine1" value={formData.registeredAddressLine1} onChange={handleInputChange} required placeholder="Street address, building etc." style={{ borderRadius: "8px", padding: "10px 15px", border: "1px solid #d1d9e6" }} />
                      </Form.Group>
                    </Col>
                    <Col md={12}>
                      <Form.Group>
                        <Form.Label style={{ fontSize: "13px", color: "#495057", fontWeight: 500 }}>Address Line 2</Form.Label>
                        <Form.Control name="registeredAddressLine2" value={formData.registeredAddressLine2} onChange={handleInputChange} placeholder="Landmark, Area (optional)" style={{ borderRadius: "8px", padding: "10px 15px", border: "1px solid #d1d9e6" }} />
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Group>
                        <Form.Label style={{ fontSize: "13px", color: "#495057", fontWeight: 500 }}>City <span className="text-danger">*</span></Form.Label>
                        <Form.Control name="city" value={formData.city} onChange={handleInputChange} required placeholder="City" style={{ borderRadius: "8px", padding: "10px 15px", border: "1px solid #d1d9e6" }} />
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Group>
                        <Form.Label style={{ fontSize: "13px", color: "#495057", fontWeight: 500 }}>State <span className="text-danger">*</span></Form.Label>
                        <Form.Control name="state" value={formData.state} onChange={handleInputChange} required placeholder="State" style={{ borderRadius: "8px", padding: "10px 15px", border: "1px solid #d1d9e6" }} />
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Group>
                        <Form.Label style={{ fontSize: "13px", color: "#495057", fontWeight: 500 }}>Pincode <span className="text-danger">*</span></Form.Label>
                        <Form.Control name="pincode" value={formData.pincode} onChange={handleInputChange} required placeholder="6-digit ZIP" style={{ borderRadius: "8px", padding: "10px 15px", border: "1px solid #d1d9e6" }} />
                      </Form.Group>
                    </Col>
                  </Row>
                </div>

                <hr style={{ margin: "24px 0", opacity: 0.1 }} />

                {/* Contact Section */}
                <div className="mb-4">
                  <h6 style={{ color: "#0061f2", fontWeight: 700, fontSize: "14px", marginBottom: "16px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Contact Details</h6>
                  <Row className="g-3">
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label style={{ fontSize: "13px", color: "#495057", fontWeight: 500 }}>Phone Number <span className="text-danger">*</span></Form.Label>
                        <Form.Control name="phoneNumber" value={formData.phoneNumber} onChange={handleInputChange} required placeholder="Contact phone" style={{ borderRadius: "8px", padding: "10px 15px", border: "1px solid #d1d9e6" }} />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label style={{ fontSize: "13px", color: "#495057", fontWeight: 500 }}>Email Address <span className="text-danger">*</span></Form.Label>
                        <Form.Control type="email" name="emailAddress" value={formData.emailAddress} onChange={handleInputChange} required placeholder="Official email" style={{ borderRadius: "8px", padding: "10px 15px", border: "1px solid #d1d9e6" }} />
                      </Form.Group>
                    </Col>
                    <Col md={12}>
                      <Form.Group>
                        <Form.Label style={{ fontSize: "13px", color: "#495057", fontWeight: 500 }}>Website URL</Form.Label>
                        <Form.Control name="websiteUrl" value={formData.websiteUrl} onChange={handleInputChange} placeholder="https://www.example.com" style={{ borderRadius: "8px", padding: "10px 15px", border: "1px solid #d1d9e6" }} />
                      </Form.Group>
                    </Col>
                  </Row>
                </div>

                <hr style={{ margin: "24px 0", opacity: 0.1 }} />

                {/* Tax Section */}
                <div className="mb-4">
                  <h6 style={{ color: "#0061f2", fontWeight: 700, fontSize: "14px", marginBottom: "16px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Tax & Statutory</h6>
                  <Row className="g-3">
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label style={{ fontSize: "13px", color: "#495057", fontWeight: 500 }}>PAN Number <span className="text-danger">*</span></Form.Label>
                        <Form.Control name="pan" value={formData.pan} onChange={handleInputChange} required placeholder="10-digit PAN" style={{ borderRadius: "8px", padding: "10px 15px", border: "1px solid #d1d9e6", textTransform: "uppercase" }} />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label style={{ fontSize: "13px", color: "#495057", fontWeight: 500 }}>TAN Number <span className="text-danger">*</span></Form.Label>
                        <Form.Control name="tan" value={formData.tan} onChange={handleInputChange} required placeholder="10-digit TAN" style={{ borderRadius: "8px", padding: "10px 15px", border: "1px solid #d1d9e6", textTransform: "uppercase" }} />
                      </Form.Group>
                    </Col>
                    <Col md={12}>
                      <Form.Group>
                        <Form.Label style={{ fontSize: "13px", color: "#495057", fontWeight: 500 }}>GSTIN Number <span className="text-danger">*</span></Form.Label>
                        <Form.Control name="gstin" value={formData.gstin} onChange={handleInputChange} required placeholder="15-character GSTIN" style={{ borderRadius: "8px", padding: "10px 15px", border: "1px solid #d1d9e6", textTransform: "uppercase" }} />
                      </Form.Group>
                    </Col>
                  </Row>
                </div>

                <hr style={{ margin: "24px 0", opacity: 0.1 }} />

                {/* Financial Section */}
                <div className="mb-2">
                  <h6 style={{ color: "#0061f2", fontWeight: 700, fontSize: "14px", marginBottom: "16px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Financial Details</h6>
                  <Row className="g-3">
                    <Col md={12}>
                      <Form.Group>
                        <Form.Label style={{ fontSize: "13px", color: "#495057", fontWeight: 500 }}>Base Currency <span className="text-danger">*</span></Form.Label>
                        <Form.Select name="baseCurrency" value={formData.baseCurrency} onChange={handleInputChange} required style={{ borderRadius: "8px", padding: "10px 15px", border: "1px solid #d1d9e6" }}>
                          <option value="INR">INR - Indian Rupee</option>
                          <option value="USD">USD - US Dollar</option>
                          <option value="EUR">EUR - Euro</option>
                          <option value="GBP">GBP - British Pound</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label style={{ fontSize: "13px", color: "#495057", fontWeight: 500 }}>FY Start Date <span className="text-danger">*</span></Form.Label>
                        <Form.Control type="date" name="financialYearStartDate" value={formData.financialYearStartDate} onChange={handleInputChange} required style={{ borderRadius: "8px", padding: "10px 15px", border: "1px solid #d1d9e6" }} />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label style={{ fontSize: "13px", color: "#495057", fontWeight: 500 }}>FY End Date <span className="text-danger">*</span></Form.Label>
                        <Form.Control type="date" name="financialYearEndDate" value={formData.financialYearEndDate} onChange={handleInputChange} required style={{ borderRadius: "8px", padding: "10px 15px", border: "1px solid #d1d9e6" }} />
                      </Form.Group>
                    </Col>
                  </Row>
                </div>
              </div>
            </Modal.Body>
            <Modal.Footer className="bg-light border-top-0 px-4 py-3" style={{ borderBottomLeftRadius: "12px", borderBottomRightRadius: "12px" }}>
              <Button 
                variant="outline-secondary" 
                onClick={() => setShowAddModal(false)} 
                disabled={submitting} 
                className="px-4" 
                style={{ borderRadius: "8px", fontWeight: 600, fontSize: "14px", border: "1px solid #d1d9e6", color: "#6c757d" }}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={submitting} 
                style={{ 
                  background: "#0061f2", 
                  border: "none", 
                  borderRadius: "8px", 
                  padding: "10px 30px", 
                  fontWeight: 600, 
                  fontSize: "14px",
                  boxShadow: "0 4px 12px rgba(0, 97, 242, 0.2)"
                }} 
                className="text-white font-weight-bold"
              >
                {submitting ? (
                  <><Spinner animation="border" size="sm" className="me-2" />Processing...</>
                ) : (
                  <><FontAwesomeIcon icon={faSave} className="me-2" /> {isEditMode ? "Update Company" : "Save Company"}</>
                )}
              </Button>
            </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
};

export default CompanyList;
