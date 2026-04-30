import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import {
  Container,
  Row,
  Col,
  Button,
  Card,
  Table,
  Badge,
  Form,
  InputGroup,
  ButtonGroup,
  Modal,
  Alert,
  Spinner,
} from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faSearch,
  faCodeBranch,
  faEdit,
  faEye,
  faList,
  faTh,
  faMapMarkerAlt,
  faPhone,
  faEnvelope,
  faTrash,
  faExclamationTriangle,
  faSave,
} from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import { companyListService } from "../services/companyList.service";
import { branchService } from "../services/branch.service";
import {
  IBranchListItem,
  IBranchCreate,
  IBranchUpdate
} from "../interfaces/branch.types";

const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana",
  "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", "Delhi",
  "Jammu and Kashmir", "Ladakh", "Chandigarh", "Puducherry",
];

const BranchSetup: React.FC = () => {
  const navigate = useNavigate();
  const [branches, setBranches] = useState<IBranchListItem[]>([]);
  const [companies, setCompanies] = useState<
    Array<{ companyId: number; legalCompanyName: string }>
  >([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<number | "">("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredBranches, setFilteredBranches] = useState<IBranchListItem[]>([]);
  const [viewMode, setViewMode] = useState<"list" | "card">("list");

  // Delete modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [branchToDelete, setBranchToDelete] = useState<IBranchListItem | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Add Branch modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [addFormData, setAddFormData] = useState<IBranchCreate>({
    CompanyId: 0,
    BranchName: "",
    BranchCode: "",
    AddressLine1: "",
    AddressLine2: "",
    City: "",
    State: "",
    Pincode: "",
    PhoneNumber: "",
    EmailAddress: "",
    Gstin: "",
    IsHeadOffice: false,
    IsActive: true,
  });
  const [addSubmitting, setAddSubmitting] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Fetch companies on mount
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const response = await companyListService.getCompanies();
        setCompanies(
          response.data.map((c) => ({
            companyId: c.companyId,
            legalCompanyName: c.legalCompanyName,
          }))
        );
      } catch (err) {
        console.error("Error fetching companies:", err);
      }
    };
    fetchCompanies();
  }, []);

  // Fetch branches when company changes
  useEffect(() => {
    if (selectedCompanyId === "") {
      setBranches([]);
      setFilteredBranches([]);
      return;
    }
    fetchBranches(selectedCompanyId as number);
  }, [selectedCompanyId]);

  const fetchBranches = async (companyId: number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await branchService.getBranches(companyId);
      setBranches(response.data);
      setFilteredBranches(response.data);
    } catch (err) {
      console.error("Error fetching branches:", err);
      setError("Failed to fetch branches");
    } finally {
      setLoading(false);
    }
  };

  // Filter on search
  useEffect(() => {
    const filtered = branches.filter(
      (b) =>
        b.branchName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.branchCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.branchGstin.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredBranches(filtered);
  }, [searchTerm, branches]);

  // ── Delete handlers ──────────────────────────────────────────────────────────
  const handleDeleteClick = (branch: IBranchListItem) => {
    setBranchToDelete(branch);
    setShowDeleteModal(true);
    setDeleteError(null);
  };

  const handleDeleteConfirm = async () => {
    if (!branchToDelete) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await branchService.deleteBranch(branchToDelete.branchId, branchToDelete.companyId);
      const updated = branches.filter((b) => b.branchId !== branchToDelete.branchId);
      setBranches(updated);
      setShowDeleteModal(false);
      setBranchToDelete(null);
      toast.success("Branch deleted successfully!");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to delete branch";
      setDeleteError(msg);
      toast.error(msg);
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setBranchToDelete(null);
    setDeleteError(null);
  };

  // ── Add Branch handlers ───────────────────────────────────────────────────────
  const handleOpenAddModal = () => {
    setAddFormData({
      CompanyId: selectedCompanyId !== "" ? (selectedCompanyId as number) : 0,
      BranchName: "",
      BranchCode: "",
      AddressLine1: "",
      AddressLine2: "",
      City: "",
      State: "",
      Pincode: "",
      PhoneNumber: "",
      EmailAddress: "",
      Gstin: "",
      IsHeadOffice: false,
      IsActive: true,
    });
    setIsEditing(false);
    setEditingId(null);
    setAddError(null);
    setShowAddModal(true);
  };

  const handleOpenEditModal = (branch: IBranchListItem) => {
    setAddFormData({
      CompanyId: branch.companyId,
      BranchName: branch.branchName,
      BranchCode: branch.branchCode,
      AddressLine1: branch.branchAddressLine1,
      AddressLine2: branch.branchAddressLine2 || "",
      City: branch.city,
      State: branch.state,
      Pincode: branch.pincode,
      PhoneNumber: branch.branchPhoneNumber || "",
      EmailAddress: branch.branchEmailAddress || "",
      Gstin: branch.branchGstin || "",
      IsHeadOffice: branch.isHeadOffice,
      IsActive: branch.isActive,
    });
    setEditingId(branch.branchId);
    setIsEditing(true);
    setAddError(null);
    setShowAddModal(true);
  };

  const handleAddInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const target = e.target as HTMLInputElement;
    const { name, value, type } = target;
    const finalValue =
      type === "checkbox"
        ? target.checked
        : name === "CompanyId"
          ? parseInt(value)
          : value;
    setAddFormData((prev: IBranchCreate) => ({ ...prev, [name]: finalValue }));
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddSubmitting(true);
    setAddError(null);
    try {
      if (isEditing && editingId) {
        const payload: IBranchUpdate = {
          BranchId: editingId,
          CompanyId: addFormData.CompanyId,
          BranchName: addFormData.BranchName.trim(),
          BranchCode: addFormData.BranchCode.trim().toUpperCase(),
          AddressLine1: addFormData.AddressLine1.trim(),
          AddressLine2: addFormData.AddressLine2?.trim() || undefined,
          City: addFormData.City.trim(),
          State: addFormData.State.trim(),
          Pincode: addFormData.Pincode.trim(),
          PhoneNumber: addFormData.PhoneNumber?.trim() || undefined,
          EmailAddress: addFormData.EmailAddress?.trim() || undefined,
          Gstin: addFormData.Gstin.trim().toUpperCase() || "",
          IsHeadOffice: addFormData.IsHeadOffice,
          IsActive: addFormData.IsActive,
        };
        const response = await branchService.updateBranch(payload);
        toast.success(response.message || "Branch updated successfully!");
      } else {
        const payload: IBranchCreate = {
          CompanyId: addFormData.CompanyId,
          BranchName: addFormData.BranchName.trim(),
          BranchCode: addFormData.BranchCode.trim().toUpperCase(),
          AddressLine1: addFormData.AddressLine1.trim(),
          AddressLine2: addFormData.AddressLine2?.trim() || undefined,
          City: addFormData.City.trim(),
          State: addFormData.State.trim(),
          Pincode: addFormData.Pincode.trim(),
          PhoneNumber: addFormData.PhoneNumber?.trim() || undefined,
          EmailAddress: addFormData.EmailAddress?.trim() || undefined,
          Gstin: addFormData.Gstin.trim().toUpperCase() || "",
          IsHeadOffice: addFormData.IsHeadOffice,
          IsActive: addFormData.IsActive,
        };
        const response = await branchService.createBranch(payload);
        toast.success(response.message || "Branch created successfully!");
      }

      // Refresh list
      if (addFormData.CompanyId === selectedCompanyId) {
        await fetchBranches(addFormData.CompanyId);
      }
      setTimeout(() => {
        setShowAddModal(false);
      }, 1500);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to save branch";
      setAddError(msg);
      toast.error(msg);
    } finally {
      setAddSubmitting(false);
    }
  };

  return (
    <Container className="mt-4 mb-5">
      {/* ── Compact Header Section ──────────────────────────────────────────── */}
      <Card className="mb-4 shadow-sm" style={{ border: "none", borderRadius: "12px", overflow: "hidden" }}>
        <Card.Body className="p-0">
          <div style={{ background: "linear-gradient(135deg, #0061f2 0%, #003d99 100%)", padding: "20px 24px" }}>
            <Row className="align-items-center g-3">
              <Col lg={4} md={12}>
                <div className="d-flex align-items-center">
                  <div
                    style={{
                      width: "42px", height: "42px", borderRadius: "10px",
                      background: "rgba(255,255,255,0.2)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      marginRight: "16px", flexShrink: 0,
                    }}
                  >
                    <FontAwesomeIcon icon={faCodeBranch} className="text-white" size="lg" />
                  </div>
                  <div>
                    <h4 className="mb-0 text-white" style={{ fontWeight: 600, fontSize: "20px" }}>
                      Branch Management
                    </h4>
                    <p className="mb-0 text-white-50" style={{ fontSize: "13px" }}>Set up and configure company branches</p>
                  </div>
                </div>
              </Col>

              <Col lg={8} md={12} className="d-flex justify-content-lg-end align-items-center gap-2">
                <Button
                  variant="light"
                  onClick={handleOpenAddModal}
                  style={{ fontWeight: 600, padding: "8px 20px", borderRadius: "8px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                >
                  <FontAwesomeIcon icon={faPlus} className="me-2" />Add New Branch
                </Button>
              </Col>
            </Row>
          </div>
          <div className="p-3 bg-white border-bottom">
            <Row className="g-3 align-items-center">
              <Col md={4}>
                <Form.Select
                  size="sm"
                  value={selectedCompanyId}
                  onChange={(e) =>
                    setSelectedCompanyId(e.target.value ? parseInt(e.target.value) : "")
                  }
                  style={{ borderRadius: "8px", padding: "8px 12px" }}
                >
                  <option value="">Select Company</option>
                  {companies.map((c) => (
                    <option key={c.companyId} value={c.companyId}>
                      {c.legalCompanyName}
                    </option>
                  ))}
                </Form.Select>
              </Col>
              <Col md={5}>
                <InputGroup size="sm">
                  <InputGroup.Text className="bg-white border-end-0">
                    <FontAwesomeIcon icon={faSearch} className="text-muted" />
                  </InputGroup.Text>
                  <Form.Control
                    type="text"
                    placeholder="Search branches..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="border-start-0"
                    style={{ borderRadius: "0 8px 8px 0", padding: "8px" }}
                  />
                </InputGroup>
              </Col>
              <Col md={3} className="text-end">
                <ButtonGroup size="sm">
                  <Button variant={viewMode === "list" ? "primary" : "outline-secondary"} onClick={() => setViewMode("list")}>
                    <FontAwesomeIcon icon={faList} />
                  </Button>
                  <Button variant={viewMode === "card" ? "primary" : "outline-secondary"} onClick={() => setViewMode("card")}>
                    <FontAwesomeIcon icon={faTh} />
                  </Button>
                </ButtonGroup>
              </Col>
            </Row>
          </div>
        </Card.Body>
      </Card>

      {/* Stats Bar */}
      <Row className="mb-3">
        <Col xs={12}>
          <div className="d-flex align-items-center justify-content-between" style={{ padding: "0 8px" }}>
            <div>
              <span className="text-muted" style={{ fontSize: "13px" }}>
                Total: <strong>{filteredBranches.length}</strong> branches
                {selectedCompanyId === "" && (
                  <span className="ms-2 text-muted" style={{ fontSize: "12px" }}>
                    (Select a company to view branches)
                  </span>
                )}
              </span>
            </div>
            <Badge
              style={{
                background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                padding: "6px 12px", fontSize: "12px", fontWeight: 600,
              }}
            >
              {filteredBranches.filter((b) => b.isActive).length} Active
            </Badge>
          </div>
        </Col>
      </Row>

      {/* Loading / Error */}
      {loading && (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-2 text-muted">Loading branches...</p>
        </div>
      )}
      {error && !loading && <Alert variant="danger" className="mb-4">{error}</Alert>}

      {/* Branches Content */}
      {!loading && !error && (
        <Card className="shadow-sm" style={{ border: "none", borderRadius: "8px" }}>
          <Card.Header
            className="bg-white"
            style={{ borderBottom: "1px solid #e9ecef", borderRadius: "8px 8px 0 0" }}
          >
            <h5 className="mb-0" style={{ fontSize: "15px", fontWeight: 600, color: "#1a1a1a" }}>
              Branches {viewMode === "list" ? "List" : "Cards"}
            </h5>
          </Card.Header>
          <Card.Body className="p-0">
            {filteredBranches.length === 0 ? (
              <div className="text-center py-5">
                <FontAwesomeIcon icon={faCodeBranch} size="3x" className="text-muted mb-3" />
                <h5 className="text-muted">
                  {selectedCompanyId === "" ? "Select a company to view branches" : "No branches found"}
                </h5>
                <p className="text-muted">
                  {selectedCompanyId !== "" && searchTerm
                    ? "Try adjusting your search criteria"
                    : selectedCompanyId !== ""
                      ? "Start by adding your first branch"
                      : ""}
                </p>
              </div>
            ) : viewMode === "list" ? (
              /* ── List View ─────────────────────────────────────────────── */
              <div className="table-responsive">
                <Table className="mb-0" hover>
                  <thead style={{ background: "#f8f9fa", borderBottom: "2px solid #dee2e6" }}>
                    <tr>
                      {["Branch Name", "Branch Code", "Location", "GSTIN", "Type", "Status", "Actions"].map((h) => (
                        <th key={h} style={{ fontSize: "12px", fontWeight: 600, color: "#495057", padding: "12px" }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBranches.map((branch, idx) => (
                      <tr
                        key={branch.branchId}
                        style={{
                          borderBottom: "1px solid #e9ecef",
                          backgroundColor: idx % 2 === 0 ? "#ffffff" : "#f8f9fa",
                        }}
                      >
                        <td style={{ padding: "12px" }}>
                          <strong style={{ color: "#1a1a1a", fontSize: "14px" }}>{branch.branchName}</strong>
                          {branch.branchEmailAddress && (
                            <div className="small text-muted">{branch.branchEmailAddress}</div>
                          )}
                        </td>
                        <td style={{ padding: "12px" }}>
                          <code style={{ background: "#f0f4ff", color: "#0066ff", padding: "4px 8px", borderRadius: "4px", fontSize: "12px" }}>
                            {branch.branchCode}
                          </code>
                        </td>
                        <td style={{ padding: "12px" }}>
                          <div style={{ color: "#1a1a1a", fontSize: "14px" }}>{branch.city}</div>
                          <small className="text-muted">{branch.state} - {branch.pincode}</small>
                        </td>
                        <td style={{ padding: "12px" }}>
                          <code style={{ background: "#f0f4ff", color: "#0066ff", padding: "4px 8px", borderRadius: "4px", fontSize: "12px" }}>
                            {branch.branchGstin}
                          </code>
                        </td>
                        <td style={{ padding: "12px" }}>
                          {branch.isHeadOffice && (
                            <Badge style={{ background: "linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)", color: "#ffffff", fontSize: "11px", fontWeight: 600, padding: "6px 10px" }}>
                              Head Office
                            </Badge>
                          )}
                        </td>
                        <td style={{ padding: "12px" }}>
                          <Badge
                            style={{
                              background: branch.isActive
                                ? "linear-gradient(135deg, #10b981 0%, #059669 100%)"
                                : "linear-gradient(135deg, #6c757d 0%, #495057 100%)",
                              color: "#ffffff", fontSize: "11px", fontWeight: 600, padding: "6px 10px",
                            }}
                          >
                            {branch.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </td>
                        <td style={{ padding: "12px" }}>
                          <div className="d-flex gap-1">
                            {/* View */}
                            <Button
                              variant="light" size="sm" title="View Details"
                              onClick={() => navigate(`/erp-setup/branch-view/${branch.branchId}?companyId=${branch.companyId}`)}
                              style={{ background: "#f0f4ff", color: "#0066ff", border: "none", fontSize: "12px", padding: "6px 10px", fontWeight: 500, transition: "all 0.2s ease" }}
                              onMouseEnter={(e) => { const t = e.currentTarget as HTMLElement; t.style.background = "#0066ff"; t.style.color = "#ffffff"; }}
                              onMouseLeave={(e) => { const t = e.currentTarget as HTMLElement; t.style.background = "#f0f4ff"; t.style.color = "#0066ff"; }}
                            >
                              <FontAwesomeIcon icon={faEye} />
                            </Button>
                            {/* Edit */}
                            <Button
                              variant="light" size="sm" title="Edit Branch"
                              onClick={() => handleOpenEditModal(branch)}
                              style={{ background: "#f5f5f5", color: "#6c757d", border: "none", fontSize: "12px", padding: "6px 10px", fontWeight: 500, transition: "all 0.2s ease" }}
                              onMouseEnter={(e) => { const t = e.currentTarget as HTMLElement; t.style.background = "#6c757d"; t.style.color = "#ffffff"; }}
                              onMouseLeave={(e) => { const t = e.currentTarget as HTMLElement; t.style.background = "#f5f5f5"; t.style.color = "#6c757d"; }}
                            >
                              <FontAwesomeIcon icon={faEdit} />
                            </Button>
                            {/* Delete */}
                            <Button
                              variant="light" size="sm" title="Delete Branch"
                              onClick={() => handleDeleteClick(branch)}
                              style={{ background: "#ffe6e6", color: "#dc3545", border: "none", fontSize: "12px", padding: "6px 10px", fontWeight: 500, transition: "all 0.2s ease" }}
                              onMouseEnter={(e) => { const t = e.currentTarget as HTMLElement; t.style.background = "#dc3545"; t.style.color = "#ffffff"; }}
                              onMouseLeave={(e) => { const t = e.currentTarget as HTMLElement; t.style.background = "#ffe6e6"; t.style.color = "#dc3545"; }}
                            >
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
              /* ── Card View ─────────────────────────────────────────────── */
              <div className="p-4">
                <Row className="g-4">
                  {filteredBranches.map((branch) => (
                    <Col md={6} lg={4} key={branch.branchId}>
                      <Card
                        className="h-100"
                        style={{
                          border: "none", borderRadius: "10px", overflow: "hidden",
                          background: "#ffffff", boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                          transition: "all 0.3s cubic-bezier(0.4,0,0.2,1)", cursor: "pointer",
                          position: "relative", display: "flex", flexDirection: "column",
                        }}
                        onMouseEnter={(e) => { const t = e.currentTarget as HTMLElement; t.style.boxShadow = "0 8px 24px rgba(0,102,255,0.15)"; t.style.transform = "translateY(-4px)"; }}
                        onMouseLeave={(e) => { const t = e.currentTarget as HTMLElement; t.style.boxShadow = "0 1px 3px rgba(0,0,0,0.08)"; t.style.transform = "translateY(0)"; }}
                      >
                        <div style={{ height: "4px", background: "linear-gradient(135deg, #0066ff 0%, #003d99 100%)" }} />
                        <Card.Body style={{ padding: "16px", flex: "1 1 auto", display: "flex", flexDirection: "column" }}>
                          <div style={{ flex: "1 1 auto" }}>
                            <div className="d-flex justify-content-between align-items-center mb-3">
                              <Badge
                                style={{
                                  background: branch.isActive
                                    ? "linear-gradient(135deg, #10b981 0%, #059669 100%)"
                                    : "linear-gradient(135deg, #6c757d 0%, #495057 100%)",
                                  color: "#ffffff", fontSize: "11px", fontWeight: 600, padding: "6px 10px",
                                }}
                              >
                                {branch.isActive ? "Active" : "Inactive"}
                              </Badge>
                              {branch.isHeadOffice && (
                                <small style={{ color: "#6c757d", fontSize: "12px" }}>Head Office</small>
                              )}
                            </div>
                            <h5 style={{ fontSize: "16px", fontWeight: 600, color: "#1a1a1a", marginBottom: "12px", lineHeight: "1.4" }}>
                              {branch.branchName}
                            </h5>
                            <div style={{ marginBottom: "12px" }}>
                              <small style={{ color: "#6c757d", fontSize: "12px", display: "block", marginBottom: "6px" }}>
                                <span style={{ fontWeight: 600 }}>Code:</span> {branch.branchCode}
                              </small>
                              <small style={{ color: "#6c757d", fontSize: "12px", display: "block" }}>
                                <span style={{ fontWeight: 600 }}>GSTIN:</span> {branch.branchGstin}
                              </small>
                            </div>
                            <div style={{ marginBottom: "12px", paddingTop: "12px", borderTop: "1px solid #e9ecef" }}>
                              <small style={{ color: "#6c757d", fontSize: "12px", display: "block", marginBottom: "6px" }}>
                                <FontAwesomeIcon icon={faMapMarkerAlt} className="me-2" />
                                <span style={{ fontWeight: 600 }}>Address:</span>
                              </small>
                              <small style={{ color: "#6c757d", fontSize: "12px", lineHeight: "1.5" }}>
                                {branch.branchAddressLine1}
                                {branch.branchAddressLine2 && (<><br />{branch.branchAddressLine2}</>)}
                                <br />{branch.city}, {branch.state} - {branch.pincode}
                              </small>
                            </div>
                            <div style={{ marginBottom: "12px" }}>
                              {branch.branchPhoneNumber && (
                                <small style={{ color: "#6c757d", fontSize: "12px", display: "block", marginBottom: "3px" }}>
                                  <FontAwesomeIcon icon={faPhone} className="me-2" />{branch.branchPhoneNumber}
                                </small>
                              )}
                              {branch.branchEmailAddress && (
                                <small style={{ color: "#6c757d", fontSize: "12px", display: "block" }}>
                                  <FontAwesomeIcon icon={faEnvelope} className="me-2" />{branch.branchEmailAddress}
                                </small>
                              )}
                            </div>
                          </div>
                          <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", paddingTop: "12px", borderTop: "1px solid #e9ecef", marginTop: "12px", flex: "0 0 auto" }}>
                            <div className="d-flex gap-2">
                              <Button
                                variant="light" size="sm" title="View Details"
                                onClick={() => navigate(`/erp-setup/branch-view/${branch.branchId}?companyId=${branch.companyId}`)}
                                style={{ background: "#f0f4ff", color: "#0066ff", border: "none", fontSize: "12px", padding: "6px 10px", fontWeight: 500, transition: "all 0.2s ease" }}
                                onMouseEnter={(e) => { const t = e.currentTarget as HTMLElement; t.style.background = "#0066ff"; t.style.color = "#ffffff"; }}
                                onMouseLeave={(e) => { const t = e.currentTarget as HTMLElement; t.style.background = "#f0f4ff"; t.style.color = "#0066ff"; }}
                              >
                                <FontAwesomeIcon icon={faEye} />
                              </Button>
                              <Button
                                variant="light" size="sm" title="Edit Branch"
                                onClick={() => handleOpenEditModal(branch)}
                                style={{ background: "#f5f5f5", color: "#6c757d", border: "none", fontSize: "12px", padding: "6px 10px", fontWeight: 500, transition: "all 0.2s ease" }}
                                onMouseEnter={(e) => { const t = e.currentTarget as HTMLElement; t.style.background = "#6c757d"; t.style.color = "#ffffff"; }}
                                onMouseLeave={(e) => { const t = e.currentTarget as HTMLElement; t.style.background = "#f5f5f5"; t.style.color = "#6c757d"; }}
                              >
                                <FontAwesomeIcon icon={faEdit} />
                              </Button>
                              <Button
                                variant="light" size="sm" title="Delete Branch"
                                onClick={() => handleDeleteClick(branch)}
                                style={{ background: "#ffe6e6", color: "#dc3545", border: "none", fontSize: "12px", padding: "6px 10px", fontWeight: 500, transition: "all 0.2s ease" }}
                                onMouseEnter={(e) => { const t = e.currentTarget as HTMLElement; t.style.background = "#dc3545"; t.style.color = "#ffffff"; }}
                                onMouseLeave={(e) => { const t = e.currentTarget as HTMLElement; t.style.background = "#ffe6e6"; t.style.color = "#dc3545"; }}
                              >
                                <FontAwesomeIcon icon={faTrash} />
                              </Button>
                            </div>
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

      {/* ── Delete Confirmation Modal ──────────────────────────────────────── */}
      <Modal show={showDeleteModal} onHide={handleDeleteCancel} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <FontAwesomeIcon icon={faExclamationTriangle} className="text-danger me-2" />
            Confirm Delete
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {deleteError && <Alert variant="danger" className="mb-3">{deleteError}</Alert>}
          {branchToDelete && (
            <>
              <p>Are you sure you want to delete the following branch?</p>
              <Card className="mb-3">
                <Card.Body className="py-2">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <strong>{branchToDelete.branchName}</strong><br />
                      <small className="text-muted">{branchToDelete.city}, {branchToDelete.state}</small>
                    </div>
                    <div className="text-end">
                      <Badge bg="info" className="d-block mb-1">ID: {branchToDelete.branchId}</Badge>
                      <code className="small">{branchToDelete.branchCode}</code>
                    </div>
                  </div>
                </Card.Body>
              </Card>
              <Alert variant="warning" className="mb-0">
                <small>
                  <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" />
                  <strong>Warning:</strong> This action cannot be undone.
                </small>
              </Alert>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleDeleteCancel} disabled={deleting}>Cancel</Button>
          <Button variant="danger" onClick={handleDeleteConfirm} disabled={deleting}>
            {deleting ? (<><Spinner animation="border" size="sm" className="me-2" />Deleting...</>) : (<><FontAwesomeIcon icon={faTrash} className="me-2" />Delete Branch</>)}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* ── Add Branch Modal ────────────────────────────────────────────────── */}
      <Modal
        show={showAddModal}
        onHide={() => setShowAddModal(false)}
        size="lg"
        centered
        scrollable
        contentClassName="border-0 shadow-lg rounded-4"
      >
        <Form onSubmit={handleAddSubmit} style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
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
                <FontAwesomeIcon icon={faCodeBranch} size="sm" />
              </div>
              {isEditing ? "Update Branch" : "Add New Branch"}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="p-4 bg-light">
            {addError && <Alert variant="danger" className="border-0 shadow-sm">{addError}</Alert>}

            <Row className="g-3">
              {/* Basic Info */}
              <Col md={12}>
                <Card className="border-0 shadow-sm" style={{ borderRadius: "10px" }}>
                  <Card.Header className="bg-white border-bottom py-3">
                    <h6 className="mb-0" style={{ fontWeight: 600 }}>Branch Identity</h6>
                  </Card.Header>
                  <Card.Body className="p-4">
                    <Row className="g-3">
                      <Col md={12}>
                        <Form.Group>
                          <Form.Label style={{ fontSize: "13px", fontWeight: 600 }}>Company *</Form.Label>
                          <Form.Select name="CompanyId" value={addFormData.CompanyId} onChange={handleAddInputChange} required disabled={isEditing} style={{ borderRadius: "8px" }}>
                            <option value={0}>Select Company</option>
                            {companies.map(c => <option key={c.companyId} value={c.companyId}>{c.legalCompanyName}</option>)}
                          </Form.Select>
                        </Form.Group>
                      </Col>
                      <Col md={8}>
                        <Form.Group>
                          <Form.Label style={{ fontSize: "13px", fontWeight: 600 }}>Branch Name *</Form.Label>
                          <Form.Control name="BranchName" value={addFormData.BranchName} onChange={handleAddInputChange} required placeholder="Full name of the branch" style={{ borderRadius: "8px" }} />
                        </Form.Group>
                      </Col>
                      <Col md={4}>
                        <Form.Group>
                          <Form.Label style={{ fontSize: "13px", fontWeight: 600 }}>Branch Code *</Form.Label>
                          <Form.Control name="BranchCode" value={addFormData.BranchCode} onChange={handleAddInputChange} required placeholder="e.g. MUM-001" style={{ textTransform: "uppercase", borderRadius: "8px" }} />
                        </Form.Group>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
              </Col>

              {/* Address & Contact */}
              <Col md={12}>
                <Card className="border-0 shadow-sm" style={{ borderRadius: "10px" }}>
                  <Card.Header className="bg-white border-bottom py-3">
                    <h6 className="mb-0" style={{ fontWeight: 600 }}>Location & Contact</h6>
                  </Card.Header>
                  <Card.Body className="p-4">
                    <Row className="g-3">
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label style={{ fontSize: "13px", fontWeight: 600 }}>Address Line 1 *</Form.Label>
                          <Form.Control name="AddressLine1" value={addFormData.AddressLine1} onChange={handleAddInputChange} required style={{ borderRadius: "8px" }} />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label style={{ fontSize: "13px", fontWeight: 600 }}>Address Line 2</Form.Label>
                          <Form.Control name="AddressLine2" value={addFormData.AddressLine2} onChange={handleAddInputChange} style={{ borderRadius: "8px" }} />
                        </Form.Group>
                      </Col>
                      <Col md={4}>
                        <Form.Group>
                          <Form.Label style={{ fontSize: "13px", fontWeight: 600 }}>City *</Form.Label>
                          <Form.Control name="City" value={addFormData.City} onChange={handleAddInputChange} required style={{ borderRadius: "8px" }} />
                        </Form.Group>
                      </Col>
                      <Col md={4}>
                        <Form.Group>
                          <Form.Label style={{ fontSize: "13px", fontWeight: 600 }}>State *</Form.Label>
                          <Form.Select name="State" value={addFormData.State} onChange={handleAddInputChange} required style={{ borderRadius: "8px" }}>
                            <option value="">Select State</option>
                            {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                          </Form.Select>
                        </Form.Group>
                      </Col>
                      <Col md={4}>
                        <Form.Group>
                          <Form.Label style={{ fontSize: "13px", fontWeight: 600 }}>Pincode *</Form.Label>
                          <Form.Control name="Pincode" value={addFormData.Pincode} onChange={handleAddInputChange} required style={{ borderRadius: "8px" }} />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label style={{ fontSize: "13px", fontWeight: 600 }}>Email Address</Form.Label>
                          <Form.Control type="email" name="EmailAddress" value={addFormData.EmailAddress} onChange={handleAddInputChange} style={{ borderRadius: "8px" }} />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label style={{ fontSize: "13px", fontWeight: 600 }}>Phone Number</Form.Label>
                          <Form.Control name="PhoneNumber" value={addFormData.PhoneNumber} onChange={handleAddInputChange} style={{ borderRadius: "8px" }} />
                        </Form.Group>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
              </Col>

              {/* Settings */}
              <Col md={12}>
                <Card className="border-0 shadow-sm" style={{ borderRadius: "10px" }}>
                  <Card.Header className="bg-white border-bottom py-3">
                    <h6 className="mb-0" style={{ fontWeight: 600 }}>Tax & Status</h6>
                  </Card.Header>
                  <Card.Body className="p-4">
                    <Row className="g-3">
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label style={{ fontSize: "13px", fontWeight: 600 }}>GSTIN *</Form.Label>
                          <Form.Control name="Gstin" value={addFormData.Gstin} onChange={handleAddInputChange} required placeholder="15 digit code" style={{ textTransform: "uppercase", borderRadius: "8px" }} />
                        </Form.Group>
                      </Col>
                      <Col md={6} className="d-flex align-items-center gap-4">
                        <Form.Check type="switch" id="custom-switch-ho" label="Head Office" name="IsHeadOffice" checked={addFormData.IsHeadOffice} onChange={handleAddInputChange} style={{ fontSize: "14px", fontWeight: 500 }} />
                        <Form.Check type="switch" id="custom-switch-active" label={addFormData.IsActive ? "Active" : "Inactive"} name="IsActive" checked={addFormData.IsActive} onChange={handleAddInputChange} style={{ fontSize: "14px", fontWeight: 500 }} />
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer style={{ background: "#f8f9fa", borderTop: "1px solid #e9ecef", padding: "16px 24px" }}>
            <Button variant="light" onClick={() => setShowAddModal(false)} disabled={addSubmitting} style={{ fontWeight: 600, padding: "8px 20px", borderRadius: "8px" }}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={addSubmitting}
              style={{
                background: "linear-gradient(135deg, #0061f2 0%, #003d99 100%)",
                border: "none", borderRadius: "8px", padding: "8px 24px",
                fontWeight: 600, boxShadow: "0 4px 12px rgba(0, 97, 242, 0.2)"
              }}
              className="text-white"
            >
              {addSubmitting ? <Spinner animation="border" size="sm" /> : <><FontAwesomeIcon icon={faSave} className="me-2" />Save Record</>}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
};

export default BranchSetup;
