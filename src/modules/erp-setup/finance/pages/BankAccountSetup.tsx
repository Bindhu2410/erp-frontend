import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import {
  Container, Row, Col, Button, Card, Table, Badge,
  Form, InputGroup, ButtonGroup, Modal, Alert, Spinner,
} from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus, faSearch, faEdit, faEye, faList, faTh,
  faTrash, faExclamationTriangle, faFileInvoice, faSave,
} from "@fortawesome/free-solid-svg-icons";
import { BsBank } from "react-icons/bs";
import { useNavigate } from "react-router-dom";
import { companyListService } from "../../company/services/companyList.service";
import { bankAccountService } from "../services/bankaccount.service";
import { IBankAccountResponse, IBankAccountCreate } from "../interfaces/bankaccount.types";

const BankAccountSetup: React.FC = () => {
  const navigate = useNavigate();

  const [companies, setCompanies] = useState<Array<{ companyId: number; legalCompanyName: string }>>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<number | "">("");

  const [accounts, setAccounts] = useState<IBankAccountResponse[]>([]);
  const [filteredAccounts, setFilteredAccounts] = useState<IBankAccountResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "card">("list");

  // Delete modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<IBankAccountResponse | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Add/Edit Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<IBankAccountCreate>({
    CompanyId: 0,
    BankName: "",
    BankBranchName: "",
    AccountNumber: "",
    IFSCCode: "",
    SwiftCode: "",
    Purpose: "",
    Currency: "INR",
    IsActive: true
  });
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

  // Fetch bank accounts when company changes
  useEffect(() => {
    setAccounts([]);
    if (selectedCompanyId === "") {
      setFilteredAccounts([]);
      return;
    }
    fetchBankAccounts(selectedCompanyId as number);
  }, [selectedCompanyId]);

  const fetchBankAccounts = async (compId: number) => {
    setLoading(true);
    setError(null);
    try {
      // In a real scenario, we might pass compId to getBankAccounts
      // For now, we fetch all and filter if search/backend doesn't support direct filtering
      const data = await bankAccountService.getBankAccounts();
      const companyAccounts = data.filter(acc => acc.companyId === compId);
      setAccounts(companyAccounts);
      setFilteredAccounts(companyAccounts);
    } catch (err) {
      setError("Failed to fetch bank accounts");
    } finally {
      setLoading(false);
    }
  };

  // Search filter
  useEffect(() => {
    const filtered = accounts.filter(
      (acc) =>
        acc.bankName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        acc.accountNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        acc.bankBranchName.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredAccounts(filtered);
  }, [searchTerm, accounts]);

  // Delete handlers
  const handleDeleteClick = (acc: IBankAccountResponse) => {
    setItemToDelete(acc);
    setDeleteError(null);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await bankAccountService.deleteBankAccount(itemToDelete.bankAccountId);
      setAccounts((prev) => prev.filter((i) => i.bankAccountId !== itemToDelete.bankAccountId));
      setShowDeleteModal(false);
      setItemToDelete(null);
      toast.success("Bank account deleted successfully!");
    } catch (err: any) {
      const msg = err.message || "Failed to delete bank account.";
      setDeleteError(msg);
      toast.error(msg);
    } finally {
      setDeleting(false);
    }
  };

  // Add/Edit Handlers
  const handleOpenAdd = () => {
    setFormData({
      CompanyId: selectedCompanyId !== "" ? (selectedCompanyId as number) : 0,
      BankName: "",
      BankBranchName: "",
      AccountNumber: "",
      IFSCCode: "",
      SwiftCode: "",
      Purpose: "",
      Currency: "INR",
      IsActive: true
    });
    setIsEditMode(false);
    setEditingId(null);
    setFormError(null);
    setShowAddModal(true);
  };

  const handleOpenEdit = (acc: IBankAccountResponse) => {
    setFormData({
      CompanyId: acc.companyId,
      BankName: acc.bankName,
      BankBranchName: acc.bankBranchName,
      AccountNumber: acc.accountNumber,
      IFSCCode: acc.ifscCode,
      SwiftCode: acc.swiftCode || "",
      Purpose: acc.purpose || "",
      Currency: acc.currency,
      IsActive: acc.isActive
    });
    setEditingId(acc.bankAccountId);
    setIsEditMode(true);
    setFormError(null);
    setShowAddModal(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : (name === "CompanyId" ? parseInt(value) : value)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError(null);

    if (formData.CompanyId === 0) {
      setFormError("Please select a company.");
      setSubmitting(false);
      return;
    }

    try {
      if (isEditMode && editingId) {
        await bankAccountService.updateBankAccount(editingId, formData);
        toast.success("Bank account updated successfully!");
      } else {
        await bankAccountService.createBankAccount(formData);
        toast.success("Bank account created successfully!");
      }

      if (selectedCompanyId !== "") fetchBankAccounts(selectedCompanyId as number);

      setTimeout(() => {
        setShowAddModal(false);
      }, 1500);
    } catch (err: any) {
      const msg = err.message || "Failed to save bank account.";
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
                  <BsBank className="text-white" size="24" />
                </div>
                <div>
                  <h4 className="mb-0" style={{ fontWeight: 700, color: "#1a1a1a", fontSize: "19px" }}>Bank Accounts</h4>
                  <small className="text-muted" style={{ fontSize: "12px" }}>Financial Assets & Liquidity</small>
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
                    <Form.Control type="text" placeholder="Search bank or account..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} disabled={!selectedCompanyId} style={{ fontSize: "13px", borderLeft: "none", borderRadius: "0 6px 6px 0" }} />
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
        <div className="text-center py-5"><Spinner animation="border" variant="primary" /><p className="mt-2 text-muted">Loading accounts...</p></div>
      ) : error ? (
        <Alert variant="danger">{error}</Alert>
      ) : accounts.length === 0 ? (
        <Card className="text-center py-5 shadow-sm border-0" style={{ borderRadius: "10px" }}>
          <Card.Body className="py-5">
            <div className="d-flex justify-content-center mb-3">
              <BsBank size="60" className="text-muted opacity-25" />
            </div>
            <h5 className="text-muted mb-2">{!selectedCompanyId ? "Select a Company to Begin" : "No Bank Accounts Found"}</h5>
            <p className="text-muted small mx-auto" style={{ maxWidth: "350px" }}>{selectedCompanyId ? "You haven't registered any bank accounts for this company yet." : "Select a company from the dropdown to manage its corporate bank accounts."}</p>
          </Card.Body>
        </Card>
      ) : (
        <Card className="shadow-sm border-0 overflow-hidden" style={{ borderRadius: "10px" }}>
          <Card.Header className="bg-white border-bottom p-3 d-flex justify-content-between align-items-center">
            <h5 className="mb-0" style={{ fontSize: "15px", fontWeight: 600 }}>Accounts Overview</h5>
            <Badge bg="primary" style={{ borderRadius: "50px", padding: "5px 12px" }}>{filteredAccounts.length} Total</Badge>
          </Card.Header>
          <Card.Body className="p-0">
            {viewMode === "list" ? (
              <Table hover responsive className="mb-0 border-0">
                <thead style={{ background: "#f8f9fa" }}>
                  <tr style={{ fontSize: "12px", color: "#495057", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    <th className="px-4 py-3">Bank Name</th>
                    <th className="px-3 py-3">Account Number</th>
                    <th className="px-3 py-3">Branch</th>
                    <th className="px-3 py-3">Status</th>
                    <th className="px-4 py-3 text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.isArray(filteredAccounts) && filteredAccounts.map((acc) => (
                    <tr key={acc.bankAccountId} style={{ fontSize: "14px", verticalAlign: "middle" }}>
                      <td className="px-4 py-3">
                        <div style={{ fontWeight: 600, color: "#1a1a1a" }}>{acc.bankName}</div>
                        <div className="small text-muted">{acc.currency}</div>
                      </td>
                      <td className="px-3 py-3"><code className="px-2 py-1 rounded" style={{ background: "#eef2ff", color: "#4338ca", fontSize: "12px" }}>{acc.accountNumber}</code></td>
                      <td className="px-3 py-3 text-muted" style={{ fontSize: "13px" }}>{acc.bankBranchName}</td>
                      <td className="px-3 py-3">
                        <Badge bg={acc.isActive ? "success" : "secondary"} style={{ borderRadius: "4px", fontWeight: 500, padding: "5px 8px" }}>
                          {acc.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-end">
                        <div className="d-flex gap-2 justify-content-end">
                          <Button size="sm" onClick={() => navigate(`/erp-setup/bank-account-view/${acc.bankAccountId}`)} style={actionBtnStyle("#f0f7ff", "#0056b3")}><FontAwesomeIcon icon={faEye} /></Button>
                          <Button size="sm" onClick={() => handleOpenEdit(acc)} style={actionBtnStyle("#f8f9fa", "#343a40")}><FontAwesomeIcon icon={faEdit} /></Button>
                          <Button size="sm" onClick={() => handleDeleteClick(acc)} style={actionBtnStyle("#fff5f5", "#e03131")}><FontAwesomeIcon icon={faTrash} /></Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            ) : (
              <div className="p-4" style={{ background: "#f8f9fa" }}>
                <Row className="g-3">
                  {Array.isArray(filteredAccounts) && filteredAccounts.map((acc) => (
                    <Col md={6} lg={4} key={acc.bankAccountId}>
                      <Card className="h-100 border-0 shadow-sm bank-account-card" style={{ transition: "all 0.3s ease", borderRadius: "12px" }}>
                        <Card.Body className="p-4">
                          <div className="d-flex justify-content-between mb-3 border-bottom pb-2">
                            <span className="small text-muted font-weight-bold">{acc.currency}</span>
                            <Badge bg={acc.isActive ? "success" : "secondary"} className="rounded-pill">{acc.isActive ? "Active" : "Inactive"}</Badge>
                          </div>
                          <h6 className="mb-1" style={{ fontWeight: 700, fontSize: "16px" }}>{acc.bankName}</h6>
                          <code className="d-block mb-3 small text-primary">{acc.accountNumber}</code>

                          <div className="small text-muted mb-4">
                            <div className="d-flex align-items-center mb-1"><FontAwesomeIcon icon={faFileInvoice} className="me-2 text-primary" size="xs" /><span>IFSC: {acc.ifscCode}</span></div>
                            <div className="text-truncate" style={{ maxWidth: "100%" }}>{acc.bankBranchName}</div>
                          </div>

                          <div className="d-flex gap-2 mt-auto">
                            <Button className="flex-grow-1" size="sm" onClick={() => navigate(`/erp-setup/bank-account-view/${acc.bankAccountId}`)} variant="outline-primary" style={{ fontSize: "12px", borderRadius: "6px" }}><FontAwesomeIcon icon={faEye} className="me-1" /> View</Button>
                            <Button size="sm" onClick={() => handleOpenEdit(acc)} variant="outline-dark" style={{ fontSize: "12px", borderRadius: "6px" }}><FontAwesomeIcon icon={faEdit} /></Button>
                            <Button size="sm" onClick={() => handleDeleteClick(acc)} variant="outline-danger" style={{ fontSize: "12px", borderRadius: "6px" }}><FontAwesomeIcon icon={faTrash} /></Button>
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
          <p className="mb-0">Are you sure you want to delete account <strong>{itemToDelete?.accountNumber}</strong> at <strong>{itemToDelete?.bankName}</strong>?</p>
          <p className="text-muted small mt-2">This action cannot be undone. Any transaction templates using this account may be affected.</p>
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
                <BsBank size="18" />
              </div>
              {isEditMode ? "Update Bank Account" : "Register New Bank Account"}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="p-4 bg-light">
            {formError && <Alert variant="danger" className="border-0 shadow-sm">{formError}</Alert>}

            <Row className="g-3">
              <Col md={12}>
                <Card className="border-0 shadow-sm overflow-hidden h-100" style={{ borderRadius: "10px" }}>
                  <Card.Header className="bg-white border-bottom py-3">
                    <h6 className="mb-0" style={{ fontWeight: 600 }}>Account Details</h6>
                  </Card.Header>
                  <Card.Body className="p-4">
                    <Row className="g-3">
                      <Col md={12}>
                        <Form.Group className="mb-2">
                          <Form.Label style={{ fontSize: "13px", fontWeight: 600 }}>Company *</Form.Label>
                          <Form.Select name="CompanyId" value={formData.CompanyId} onChange={handleInputChange} required disabled={isEditMode}>
                            <option value={0}>Select Company</option>
                            {companies.map(c => <option key={c.companyId} value={c.companyId}>{c.legalCompanyName}</option>)}
                          </Form.Select>
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-2">
                          <Form.Label style={{ fontSize: "13px", fontWeight: 600 }}>Bank Name *</Form.Label>
                          <Form.Control name="BankName" value={formData.BankName} onChange={handleInputChange} required placeholder="e.g. HDFC Bank" />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-2">
                          <Form.Label style={{ fontSize: "13px", fontWeight: 600 }}>Account Number *</Form.Label>
                          <Form.Control name="AccountNumber" value={formData.AccountNumber} onChange={handleInputChange} required placeholder="Bank account number" />
                        </Form.Group>
                      </Col>
                      <Col md={12}>
                        <Form.Group className="mb-2">
                          <Form.Label style={{ fontSize: "13px", fontWeight: 600 }}>Branch Name *</Form.Label>
                          <Form.Control name="BankBranchName" value={formData.BankBranchName} onChange={handleInputChange} required placeholder="Area/Locality branch" />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-2">
                          <Form.Label style={{ fontSize: "13px", fontWeight: 600 }}>IFSC Code *</Form.Label>
                          <Form.Control name="IFSCCode" value={formData.IFSCCode} onChange={handleInputChange} required placeholder="11 character code" style={{ textTransform: "uppercase" }} />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-2">
                          <Form.Label style={{ fontSize: "13px", fontWeight: 600 }}>Swift/BIC Code</Form.Label>
                          <Form.Control name="SwiftCode" value={formData.SwiftCode} onChange={handleInputChange} placeholder="Optional global code" />
                        </Form.Group>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
              </Col>

              <Col md={12}>
                <Card className="border-0 shadow-sm overflow-hidden h-100" style={{ borderRadius: "10px" }}>
                  <Card.Header className="bg-white border-bottom py-3">
                    <h6 className="mb-0" style={{ fontWeight: 600 }}>Additional Info</h6>
                  </Card.Header>
                  <Card.Body className="p-4">
                    <Row className="g-3">
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label style={{ fontSize: "13px", fontWeight: 600 }}>Currency *</Form.Label>
                          <Form.Select name="Currency" value={formData.Currency} onChange={handleInputChange} required>
                            <option value="INR">INR - Indian Rupee</option>
                            <option value="USD">USD - US Dollar</option>
                            <option value="EUR">EUR - Euro</option>
                          </Form.Select>
                        </Form.Group>
                      </Col>
                      <Col md={6} className="d-flex align-items-end">
                        <Form.Check type="switch" id="active-switch-bank" label={formData.IsActive ? "Mark as Active" : "Mark as Inactive"} name="IsActive" checked={formData.IsActive} onChange={handleInputChange} className="mb-2" />
                      </Col>
                      <Col md={12}>
                        <Form.Group>
                          <Form.Label style={{ fontSize: "13px", fontWeight: 600 }}>Purpose</Form.Label>
                          <Form.Control as="textarea" rows={2} name="Purpose" value={formData.Purpose} onChange={handleInputChange} placeholder="e.g. Salary Payouts, Operations" />
                        </Form.Group>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
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
        .bank-account-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 25px rgba(0, 102, 255, 0.1) !important;
        }
      `}</style>
    </Container>
  );
};

export default BankAccountSetup;
