import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import {
  Container, Row, Col, Button, Card, Table, Badge,
  Form, InputGroup, ButtonGroup, Modal, Alert, Spinner,
  Dropdown,
} from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus, faSearch, faEdit, faEye, faList, faTh,
  faTrash, faExclamationTriangle, faSave, faSitemap,
} from "@fortawesome/free-solid-svg-icons";
import { TbCoinRupee } from "react-icons/tb";
import { useNavigate } from "react-router-dom";
import { companyListService } from "../services/companyList.service";
import { costCentreService } from "../services/costcentre.service";
import { ICostCentreResponse, ICostCentreCreate } from "../interfaces/costcentre.types";

const CostCentreSetup: React.FC = () => {
  const navigate = useNavigate();

  const [companies, setCompanies] = useState<Array<{ companyId: number; legalCompanyName: string }>>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<number | "">("");
  
  const [costCentres, setCostCentres] = useState<ICostCentreResponse[]>([]);
  const [filteredCostCentres, setFilteredCostCentres] = useState<ICostCentreResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "card">("list");

  // Delete modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<ICostCentreResponse | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Add/Edit modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState<ICostCentreCreate>({
    costCentreCode: "",
    costCentreName: "",
    isActive: true,
    companyId: 0,
    parentCostCentreId: null,
  });
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Fetch companies on mount
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const response = await companyListService.getCompanies();
        const companiesData = Array.isArray(response.data) ? response.data : [];
        setCompanies(companiesData.map((c: any) => ({ companyId: c.companyId, legalCompanyName: c.legalCompanyName })));
      } catch (err) {
        console.error("Error fetching companies:", err);
      }
    };
    fetchCompanies();
  }, []);

  // Fetch cost centres when company changes
  useEffect(() => {
    setCostCentres([]);
    if (selectedCompanyId === "") {
        setFilteredCostCentres([]);
        return;
    }
    fetchCostCentres(selectedCompanyId as number);
  }, [selectedCompanyId]);

  const fetchCostCentres = async (compId: number) => {
    setLoading(true);
    setError(null);
    try {
      const data = await costCentreService.getCostCentres(compId);
      setCostCentres(data);
      setFilteredCostCentres(data);
    } catch (err) {
      setError("Failed to fetch cost centres");
    } finally {
      setLoading(false);
    }
  };

  // Search filter
  useEffect(() => {
    const filtered = costCentres.filter(
      (cc) =>
        cc.costCentreName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cc.costCentreCode.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredCostCentres(filtered);
  }, [searchTerm, costCentres]);

  // Delete handlers
  const handleDeleteClick = (cc: ICostCentreResponse) => {
    setItemToDelete(cc);
    setDeleteError(null);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await costCentreService.deleteCostCentre(itemToDelete.costCentreId);
      setCostCentres((prev) => prev.filter((i) => i.costCentreId !== itemToDelete.costCentreId));
      setShowDeleteModal(false);
      setItemToDelete(null);
      toast.success("Cost centre deleted successfully!");
    } catch (err: any) {
      const msg = err.message || "Failed to delete cost centre.";
      setDeleteError(msg);
      toast.error(msg);
    } finally {
      setDeleting(false);
    }
  };

  // Add/Edit handlers
  const handleOpenAdd = () => {
    setFormData({
      costCentreCode: "",
      costCentreName: "",
      isActive: true,
      companyId: selectedCompanyId !== "" ? (selectedCompanyId as number) : 0,
      parentCostCentreId: null,
    });
    setIsEditMode(false);
    setFormError(null);
    setShowAddModal(true);
  };

  const handleOpenEdit = (cc: ICostCentreResponse) => {
    setFormData({
      costCentreCode: cc.costCentreCode,
      costCentreName: cc.costCentreName,
      isActive: cc.isActive,
      companyId: cc.companyId,
      parentCostCentreId: cc.parentCostCentreId,
    });
    setEditingId(cc.costCentreId);
    setIsEditMode(true);
    setFormError(null);
    setShowAddModal(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : (name === "parentCostCentreId" ? (value === "" ? null : parseInt(value)) : value),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError(null);
    try {
      if (isEditMode && editingId) {
        await costCentreService.updateCostCentre(editingId, formData);
        toast.success("Cost centre updated successfully!");
      } else {
        await costCentreService.createCostCentre(formData.companyId, formData);
        toast.success("Cost centre created successfully!");
      }
      if (selectedCompanyId !== "") fetchCostCentres(selectedCompanyId as number);
      setTimeout(() => {
        setShowAddModal(false);
      }, 1500);
    } catch (err: any) {
      const msg = err.message || "Failed to save cost centre";
      setFormError(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const actionBtnStyle = (bg: string, color: string) => ({
    background: bg, color, border: "none", fontSize: "12px",
    padding: "6px 10px", fontWeight: 500 as const, transition: "all 0.2s ease",
  });

  return (
    <Container className="mt-4 mb-5">
      {/* ── Header Card ─────────────────────────────────────────────────────── */}
      <Card className="mb-4 shadow-sm" style={{ border: "none", borderRadius: "10px" }}>
        <Card.Body className="p-3">
          <Row className="align-items-center g-3">
            <Col lg={4} md={12}>
              <div className="d-flex align-items-center">
                <div style={{ width: "45px", height: "45px", borderRadius: "10px", background: "linear-gradient(135deg, #0066ff 0%, #003d99 100%)", display: "flex", alignItems: "center", justifyContent: "center", marginRight: "12px", flexShrink: 0 }}>
                  <TbCoinRupee className="text-white" size="28" />
                </div>
                <div>
                  <h4 className="mb-0" style={{ fontWeight: 700, color: "#1a1a1a", fontSize: "19px" }}>Cost Centres</h4>
                  <small className="text-muted" style={{ fontSize: "12px" }}>Financial Responsibility Units</small>
                </div>
              </div>
            </Col>

            <Col lg={5} md={12}>
              <Row className="g-2">
                <Col md={6}>
                  <Form.Select size="sm" value={selectedCompanyId} onChange={(e) => setSelectedCompanyId(e.target.value ? parseInt(e.target.value) : "")} style={{ fontSize: "13px", borderRadius: "6px" }}>
                    <option value="">Select Company</option>
                    {Array.isArray(companies) && companies.map((c) => (<option key={c.companyId} value={c.companyId}>{c.legalCompanyName}</option>))}
                  </Form.Select>
                </Col>
                <Col md={6}>
                  <InputGroup size="sm">
                    <InputGroup.Text style={{ background: "#f8f9fa", borderRight: "none" }}><FontAwesomeIcon icon={faSearch} className="text-muted" /></InputGroup.Text>
                    <Form.Control type="text" placeholder="Search code or name..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} disabled={!selectedCompanyId} style={{ fontSize: "13px", borderLeft: "none", borderRadius: "0 6px 6px 0" }} />
                  </InputGroup>
                </Col>
              </Row>
            </Col>

            <Col lg={3} md={12} className="d-flex align-items-center gap-2 justify-content-lg-end">
              <ButtonGroup size="sm">
                <Button variant={viewMode === "list" ? "primary" : "outline-secondary"} onClick={() => setViewMode("list")}><FontAwesomeIcon icon={faList} /></Button>
                <Button variant={viewMode === "card" ? "primary" : "outline-secondary"} onClick={() => setViewMode("card")}><FontAwesomeIcon icon={faTh} /></Button>
              </ButtonGroup>
              <Button onClick={handleOpenAdd} disabled={!selectedCompanyId} style={{ background: "linear-gradient(135deg, #0066ff 0%, #003d99 100%)", border: "none", borderRadius: "8px", padding: "8px 16px", fontWeight: 600, fontSize: "13px" }} className="text-white shadow-sm">
                <FontAwesomeIcon icon={faPlus} className="me-2" />Add New
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Content Area */}
      {loading ? (
        <div className="text-center py-5"><Spinner animation="border" variant="primary" /><p className="mt-2 text-muted">Loading cost centres...</p></div>
      ) : error ? (
        <Alert variant="danger">{error}</Alert>
      ) : costCentres.length === 0 ? (
        <Card className="text-center py-5 shadow-sm border-0" style={{ borderRadius: "10px" }}>
          <Card.Body className="py-5">
            <div className="d-flex justify-content-center mb-3">
              <TbCoinRupee size="60" className="text-muted opacity-25" />
            </div>
            <h5 className="text-muted mb-2">{!selectedCompanyId ? "Select a Company to Begin" : "No Cost Centres Found"}</h5>
            <p className="text-muted small mx-auto" style={{ maxWidth: "300px" }}>{selectedCompanyId ? "You haven't added any cost centres for this company yet." : "Choose a company from the dropdown to manage its financial units."}</p>
          </Card.Body>
        </Card>
      ) : (
        <Card className="shadow-sm border-0 overflow-hidden" style={{ borderRadius: "10px" }}>
          <Card.Header className="bg-white border-bottom p-3 d-flex justify-content-between align-items-center">
            <h5 className="mb-0" style={{ fontSize: "15px", fontWeight: 600 }}>Records Overview</h5>
            <Badge bg="primary" style={{ borderRadius: "50px", padding: "5px 12px" }}>{filteredCostCentres.length} Total</Badge>
          </Card.Header>
          <Card.Body className="p-0">
            {viewMode === "list" ? (
              <Table hover responsive className="mb-0 border-0">
                <thead style={{ background: "#f8f9fa" }}>
                  <tr style={{ fontSize: "12px", color: "#495057", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    <th className="px-4 py-3">Cost Centre Name</th>
                    <th className="px-3 py-3">Code</th>
                    <th className="px-3 py-3">Status</th>
                    <th className="px-3 py-3">Hierarchy</th>
                    <th className="px-4 py-3 text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.isArray(filteredCostCentres) && filteredCostCentres.map((cc) => (
                    <tr key={cc.costCentreId} style={{ fontSize: "14px", verticalAlign: "middle" }}>
                      <td className="px-4 py-3 font-weight-bold" style={{ color: "#1a1a1a", fontWeight: 600 }}>{cc.costCentreName}</td>
                      <td className="px-3 py-3"><code className="px-2 py-1 rounded" style={{ background: "#eef2ff", color: "#4338ca", fontSize: "12px" }}>{cc.costCentreCode}</code></td>
                      <td className="px-3 py-3">
                        <Badge bg={cc.isActive ? "success" : "secondary"} style={{ borderRadius: "4px", fontWeight: 500, padding: "5px 8px" }}>
                            {cc.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </td>
                      <td className="px-3 py-3">
                        {cc.parentCostCentreName ? (
                            <small className="text-muted"><FontAwesomeIcon icon={faSitemap} className="me-2" />{cc.parentCostCentreName}</small>
                        ) : (
                            <small className="text-muted">Top Level</small>
                        )}
                      </td>
                      <td className="px-4 py-3 text-end">
                        <div className="d-flex gap-2 justify-content-end">
                          <Button size="sm" onClick={() => navigate(`/erp-setup/cost-centre-view/${cc.costCentreId}`)} style={actionBtnStyle("#f0f7ff", "#0056b3")}><FontAwesomeIcon icon={faEye} /></Button>
                          <Button size="sm" onClick={() => handleOpenEdit(cc)} style={actionBtnStyle("#f8f9fa", "#343a40")}><FontAwesomeIcon icon={faEdit} /></Button>
                          <Button size="sm" onClick={() => handleDeleteClick(cc)} style={actionBtnStyle("#fff5f5", "#e03131")}><FontAwesomeIcon icon={faTrash} /></Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            ) : (
              <div className="p-4" style={{ background: "#f8f9fa" }}>
                <Row className="g-3">
                  {Array.isArray(filteredCostCentres) && filteredCostCentres.map((cc) => (
                    <Col md={6} lg={4} key={cc.costCentreId}>
                      <Card className="h-100 border-0 shadow-sm cost-centre-card" style={{ transition: "all 0.3s ease", borderRadius: "12px" }}>
                        <Card.Body className="p-4">
                          <div className="d-flex justify-content-between mb-3 border-bottom pb-2">
                             <code className="small px-2 py-1 rounded bg-light text-primary">{cc.costCentreCode}</code>
                             <Badge bg={cc.isActive ? "success" : "secondary"} className="rounded-pill">{cc.isActive ? "Active" : "Inactive"}</Badge>
                          </div>
                          <h6 className="mb-3" style={{ fontWeight: 700, fontSize: "16px" }}>{cc.costCentreName}</h6>
                          <div className="small text-muted mb-4">
                            {cc.parentCostCentreName && (
                              <div className="d-flex align-items-center"><FontAwesomeIcon icon={faSitemap} className="me-2 text-primary" size="xs" /><span>Parent: {cc.parentCostCentreName}</span></div>
                            )}
                          </div>
                          <div className="d-flex gap-2 mt-auto">
                            <Button className="flex-grow-1" size="sm" onClick={() => navigate(`/erp-setup/cost-centre-view/${cc.costCentreId}`)} variant="outline-primary" style={{ fontSize: "12px", borderRadius: "6px" }}><FontAwesomeIcon icon={faEye} className="me-1"/> View</Button>
                            <Button size="sm" onClick={() => handleOpenEdit(cc)} variant="outline-dark" style={{ fontSize: "12px", borderRadius: "6px" }}><FontAwesomeIcon icon={faEdit} /></Button>
                            <Button size="sm" onClick={() => handleDeleteClick(cc)} variant="outline-danger" style={{ fontSize: "12px", borderRadius: "6px" }}><FontAwesomeIcon icon={faTrash} /></Button>
                          </div>
                        </Card.Body>
                      </Card>
                    </Col>
                  ))}
                </Row>
              </div>
            )}
          </Card.Body>
        </Card>
      )}

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton><Modal.Title style={{ fontSize: "17px", fontWeight: 700 }}><FontAwesomeIcon icon={faExclamationTriangle} className="text-danger me-2" />Confirm Deletion</Modal.Title></Modal.Header>
        <Modal.Body className="py-4">
          {deleteError && <Alert variant="danger">{deleteError}</Alert>}
          <p className="mb-0">Are you sure you want to delete <strong>{itemToDelete?.costCentreName}</strong>?</p>
          <p className="text-muted small mt-2">This will remove the cost centre permanently. Ensure no active transactions are linked to this unit.</p>
        </Modal.Body>
        <Modal.Footer className="bg-light">
          <Button variant="outline-secondary" onClick={() => setShowDeleteModal(false)} style={{ borderRadius: "6px" }}>Cancel</Button>
          <Button variant="danger" onClick={handleDeleteConfirm} disabled={deleting} style={{ borderRadius: "6px" }}>{deleting ? "Deleting..." : "Delete Permanently"}</Button>
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
              background: "linear-gradient(135deg, #0061f2 0%, #003d99 100%)", 
              color: "#fff", 
              border: "none",
              padding: "20px 24px"
            }}
          >
            <Modal.Title style={{ fontWeight: 600, fontSize: "18px", display: "flex", alignItems: "center" }}>
              <div style={{ 
                width: "32px", height: "32px", borderRadius: "6px", 
                background: "rgba(255,255,255,0.2)", 
                display: "flex", alignItems: "center", justifyContent: "center",
                marginRight: "12px"
              }}>
                <TbCoinRupee size="20" />
              </div>
              {isEditMode ? "Edit Cost Centre" : "Add New Cost Centre"}
            </Modal.Title>
          </Modal.Header>
            <Modal.Body className="p-4 bg-light">
              {formError && <Alert variant="danger" className="border-0 shadow-sm">{formError}</Alert>}
              
              <Card className="border-0 shadow-sm overflow-hidden mb-3">
                <Card.Header className="bg-white border-bottom py-3">
                  <h6 className="mb-0" style={{ fontWeight: 600 }}>Identify Cost Centre</h6>
                </Card.Header>
                <Card.Body className="p-4">
                  <Row className="g-3">
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label style={{ fontSize: "13px", fontWeight: 600 }}>Centre Name *</Form.Label>
                        <Form.Control name="costCentreName" value={formData.costCentreName} onChange={handleInputChange} required placeholder="e.g. Sales Department" />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label style={{ fontSize: "13px", fontWeight: 600 }}>Centre Code *</Form.Label>
                        <Form.Control name="costCentreCode" value={formData.costCentreCode} onChange={handleInputChange} required placeholder="e.g. SALES-01" />
                      </Form.Group>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>

              <Card className="border-0 shadow-sm overflow-hidden mb-3">
                <Card.Header className="bg-white border-bottom py-3">
                  <h6 className="mb-0" style={{ fontWeight: 600 }}>Organizational Placement</h6>
                </Card.Header>
                <Card.Body className="p-4">
                    <Row className="g-3">
                      <Col md={12}>
                        <Form.Group>
                          <Form.Label style={{ fontSize: "13px", fontWeight: 600 }}>Parent Cost Centre</Form.Label>
                          <Form.Select name="parentCostCentreId" value={formData.parentCostCentreId || ""} onChange={handleInputChange}>
                            <option value="">Top Level (No Parent)</option>
                            {costCentres
                              .filter(cc => !isEditMode || cc.costCentreId !== editingId)
                              .map(cc => <option key={cc.costCentreId} value={cc.costCentreId}>{cc.costCentreName} ({cc.costCentreCode})</option>)
                            }
                          </Form.Select>
                        </Form.Group>
                      </Col>
                      <Col md={12}>
                        <Form.Check type="switch" id="status-switch" label={formData.isActive ? "Mark as Active" : "Mark as Inactive"} name="isActive" checked={formData.isActive} onChange={handleInputChange} className="mt-2" style={{ fontWeight: 500 }} />
                      </Col>
                    </Row>
                </Card.Body>
              </Card>
            </Modal.Body>
            <Modal.Footer style={{ background: "#f8f9fa", borderTop: "1px solid #e9ecef", padding: "16px 24px" }}>
              <Button variant="light" onClick={() => setShowAddModal(false)} disabled={submitting} style={{ fontWeight: 600, padding: "8px 20px", borderRadius: "6px" }}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={submitting} 
                style={{ 
                  background: "linear-gradient(135deg, #0061f2 0%, #003d99 100%)", 
                  border: "none", borderRadius: "6px", padding: "8px 24px", 
                  fontWeight: 600, boxShadow: "0 4px 12px rgba(0, 97, 242, 0.2)" 
                }} 
                className="text-white"
              >
                {submitting ? <Spinner animation="border" size="sm" /> : <><FontAwesomeIcon icon={faSave} className="me-2" />Save Record</>}
              </Button>
            </Modal.Footer>
        </Form>
      </Modal>
      
      <style>{`
        .cost-centre-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 25px rgba(13, 110, 253, 0.1) !important;
        }
      `}</style>
    </Container>
  );
};

export default CostCentreSetup;
