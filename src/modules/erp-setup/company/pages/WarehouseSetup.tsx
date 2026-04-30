import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import {
  Container, Row, Col, Button, Card, Table, Badge,
  Form, InputGroup, ButtonGroup, Modal, Alert, Spinner,
} from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus, faSearch, faWarehouse, faEdit, faEye, faList, faTh,
  faMapMarkerAlt, faPhone, faEnvelope, faTrash, faExclamationTriangle, faSave,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import { companyListService } from "../services/companyList.service";
import { warehouseService } from "../services/warehouse.service";
import { IWarehouseItem, IWarehouseCreateRequest, IWarehouseUpdateRequest } from "../interfaces/warehouse.types";

const INDIAN_STATES = [
  "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh",
  "Goa","Gujarat","Haryana","Himachal Pradesh","Jharkhand","Karnataka",
  "Kerala","Madhya Pradesh","Maharashtra","Manipur","Meghalaya","Mizoram",
  "Nagaland","Odisha","Punjab","Rajasthan","Sikkim","Tamil Nadu","Telangana",
  "Tripura","Uttar Pradesh","Uttarakhand","West Bengal","Delhi",
  "Jammu and Kashmir","Ladakh","Chandigarh","Puducherry",
];

interface IAddWarehouseForm {
  warehouseId: number;
  companyId: number;
  branchId: number;
  warehouseCode: string;
  warehouseName: string;
  description: string;
  warehouseAddressLine1: string;
  warehouseAddressLine2: string;
  city: string;
  state: string;
  pincode: string;
  contactPerson: string;
  contactNumber: string;
  email: string;
  isActive: boolean;
}

const emptyAddForm = (companyId = 0, branchId = 0): IAddWarehouseForm => ({
  warehouseId: 0,
  companyId: companyId,
  branchId: branchId,
  warehouseCode: "",
  warehouseName: "",
  description: "",
  warehouseAddressLine1: "",
  warehouseAddressLine2: "",
  city: "",
  state: "",
  pincode: "",
  contactPerson: "",
  contactNumber: "",
  email: "",
  isActive: true,
});

const WarehouseSetup: React.FC = () => {
  const navigate = useNavigate();

  const [companies, setCompanies] = useState<Array<{ companyId: number; legalCompanyName: string }>>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<number | "">("");
  const [branches, setBranches] = useState<Array<{ branchId: number; branchName: string; branchCode: string }>>([]);
  const [selectedBranchId, setSelectedBranchId] = useState<number | "">("");
  const [warehouses, setWarehouses] = useState<IWarehouseItem[]>([]);
  const [filteredWarehouses, setFilteredWarehouses] = useState<IWarehouseItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "card">("list");

  // Delete modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [warehouseToDelete, setWarehouseToDelete] = useState<IWarehouseItem | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Add/Edit modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [addFormData, setAddFormData] = useState<IAddWarehouseForm>(emptyAddForm());
  const [isEditing, setIsEditing] = useState(false);
  const [addSubmitting, setAddSubmitting] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  // Fetch companies
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const response = await companyListService.getCompanies();
        setCompanies(response.data.map((c) => ({ companyId: c.companyId, legalCompanyName: c.legalCompanyName })));
      } catch (err) {
        console.error("Error fetching companies:", err);
      }
    };
    fetchCompanies();
  }, []);

  // Fetch branches when company changes
  useEffect(() => {
    setBranches([]);
    setSelectedBranchId("");
    setWarehouses([]);
    setFilteredWarehouses([]);
    if (selectedCompanyId === "") return;
    const fetchBranches = async () => {
      try {
        const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/CsBranch/company/${selectedCompanyId}?includeInactive=true`);
        const data = await res.json();
        setBranches((data.data || []).map((b: any) => ({
          branchId: b.branchId,
          branchName: b.branchName,
          branchCode: b.branchCode,
        })));
      } catch (err) {
        console.error("Error fetching branches:", err);
      }
    };
    fetchBranches();
  }, [selectedCompanyId]);

  // Fetch warehouses when branch changes
  useEffect(() => {
    setWarehouses([]);
    setFilteredWarehouses([]);
    if (selectedBranchId === "") return;
    fetchWarehouses(selectedBranchId as number);
  }, [selectedBranchId]);

  const fetchWarehouses = async (branchId: number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await warehouseService.getWarehousesByBranch(branchId);
      setWarehouses(response.data || []);
      setFilteredWarehouses(response.data || []);
    } catch (err: any) {
      setError(err.message || "Failed to fetch warehouses");
    } finally {
      setLoading(false);
    }
  };

  // Search filter
  useEffect(() => {
    const filtered = warehouses.filter(
      (w) =>
        w.warehouseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        w.warehouseCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        w.city.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredWarehouses(filtered);
  }, [searchTerm, warehouses]);

  // ── Delete ────────────────────────────────────────────────────────────────────
  const handleDeleteClick = (w: IWarehouseItem) => {
    setWarehouseToDelete(w);
    setShowDeleteModal(true);
    setDeleteError(null);
  };

  const handleDeleteConfirm = async () => {
    if (!warehouseToDelete) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await warehouseService.deleteWarehouse(warehouseToDelete.warehouseId);
      setWarehouses((prev) => prev.filter((w) => w.warehouseId !== warehouseToDelete.warehouseId));
      setShowDeleteModal(false);
      setWarehouseToDelete(null);
      toast.success("Warehouse deleted successfully!");
    } catch (err: any) {
      const msg = err.message || "Failed to delete warehouse";
      setDeleteError(msg);
      toast.error(msg);
    } finally {
      setDeleting(false);
    }
  };

  // ── Add / Edit ────────────────────────────────────────────────────────────────
  const handleOpenAdd = () => {
    setAddFormData(emptyAddForm(
      selectedCompanyId !== "" ? (selectedCompanyId as number) : 0,
      selectedBranchId !== "" ? (selectedBranchId as number) : 0
    ));
    setIsEditing(false);
    setAddError(null);
    setShowAddModal(true);
  };

  const handleOpenEdit = (w: IWarehouseItem) => {
    setAddFormData({
      warehouseId: w.warehouseId,
      companyId: w.companyId,
      branchId: w.branchId,
      warehouseCode: w.warehouseCode,
      warehouseName: w.warehouseName,
      description: w.description || "",
      warehouseAddressLine1: w.warehouseAddressLine1,
      warehouseAddressLine2: w.warehouseAddressLine2 || "",
      city: w.city,
      state: w.state,
      pincode: w.pincode,
      contactPerson: w.contactPerson || "",
      contactNumber: w.contactNumber || "",
      email: w.email || "",
      isActive: w.isActive,
    });
    setIsEditing(false); // Modal header logic uses isEditing, but we'll stick to a clearer logic if possible. wait, line 100 says isEditing state.
    setIsEditing(true);
    setAddError(null);
    setShowAddModal(true);
  };

  const handleAddInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const target = e.target as HTMLInputElement;
    const { name, value, type } = target;
    const numericFields = ["branchId", "warehouseId", "companyId"];
    const finalValue =
      type === "checkbox"
        ? target.checked
        : numericFields.includes(name)
        ? parseInt(value) || 0
        : value;
    setAddFormData((prev) => ({ ...prev, [name]: finalValue }));
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddSubmitting(true);
    setAddError(null);
    try {
      const nullIfEmpty = (v: string | undefined) => (v && v.trim() === "") ? undefined : v?.trim();
      
      if (isEditing) {
        const payload: IWarehouseUpdateRequest = {
          warehouseId: addFormData.warehouseId,
          companyId: addFormData.companyId,
          branchId: addFormData.branchId,
          warehouseCode: addFormData.warehouseCode.trim().toUpperCase(),
          warehouseName: addFormData.warehouseName.trim(),
          description: nullIfEmpty(addFormData.description),
          warehouseAddressLine1: addFormData.warehouseAddressLine1.trim(),
          warehouseAddressLine2: nullIfEmpty(addFormData.warehouseAddressLine2),
          city: addFormData.city.trim(),
          state: addFormData.state.trim(),
          pincode: addFormData.pincode.trim(),
          contactPerson: nullIfEmpty(addFormData.contactPerson),
          contactNumber: nullIfEmpty(addFormData.contactNumber),
          email: nullIfEmpty(addFormData.email),
          isActive: addFormData.isActive,
        };
        const response = await warehouseService.updateWarehouse(payload);
        toast.success(response.message || "Warehouse updated successfully!");
      } else {
        const payload: IWarehouseCreateRequest = {
          companyId: addFormData.companyId,
          branchId: addFormData.branchId,
          warehouseCode: addFormData.warehouseCode.trim().toUpperCase(),
          warehouseName: addFormData.warehouseName.trim(),
          description: nullIfEmpty(addFormData.description),
          warehouseAddressLine1: addFormData.warehouseAddressLine1.trim(),
          warehouseAddressLine2: nullIfEmpty(addFormData.warehouseAddressLine2),
          city: addFormData.city.trim(),
          state: addFormData.state.trim(),
          pincode: addFormData.pincode.trim(),
          contactPerson: nullIfEmpty(addFormData.contactPerson),
          contactNumber: nullIfEmpty(addFormData.contactNumber),
          email: nullIfEmpty(addFormData.email),
          isActive: addFormData.isActive,
        };
        const response = await warehouseService.createWarehouse(payload);
        toast.success(response.message || "Warehouse created successfully!");
      }

      if (selectedBranchId !== "") await fetchWarehouses(selectedBranchId as number);
      setTimeout(() => { setShowAddModal(false); }, 1500);
    } catch (err: any) {
      const msg = err.message || "Failed to save warehouse";
      setAddError(msg);
      toast.error(msg);
    } finally {
      setAddSubmitting(false);
    }
  };

  // ── helpers ──────────────────────────────────────────────────────────────────
  const actionBtnStyle = (bg: string, color: string) => ({
    background: bg, color, border: "none", fontSize: "12px",
    padding: "6px 10px", fontWeight: 500 as const, transition: "all 0.2s ease",
  });

  return (
    <Container className="mt-4 mb-5">
      {/* ── Header Card ─────────────────────────────────────────────────────── */}
      <Card className="mb-4 shadow-sm" style={{ border: "none", borderRadius: "8px" }}>
        <Card.Body className="p-3">
          <Row className="align-items-center g-3">
            <Col lg={3} md={12}>
              <div className="d-flex align-items-center">
                <div style={{ width: "40px", height: "40px", borderRadius: "8px", background: "linear-gradient(135deg, #0066ff 0%, #003d99 100%)", display: "flex", alignItems: "center", justifyContent: "center", marginRight: "12px", flexShrink: 0 }}>
                  <FontAwesomeIcon icon={faWarehouse} className="text-white" size="lg" />
                </div>
                <div>
                  <h4 className="mb-0" style={{ fontWeight: 600, color: "#1a1a1a", fontSize: "18px" }}>Warehouses</h4>
                  <small className="text-muted" style={{ fontSize: "12px" }}>Management</small>
                </div>
              </div>
            </Col>

            <Col lg={5} md={12}>
              <Row className="g-2">
                <Col md={4}>
                  <Form.Select size="sm" value={selectedCompanyId} onChange={(e) => setSelectedCompanyId(e.target.value ? parseInt(e.target.value) : "")} style={{ border: "1px solid #dee2e6", fontSize: "14px" }}>
                    <option value="">Select Company</option>
                    {companies.map((c) => (<option key={c.companyId} value={c.companyId}>{c.legalCompanyName}</option>))}
                  </Form.Select>
                </Col>
                <Col md={4}>
                  <Form.Select size="sm" value={selectedBranchId} onChange={(e) => setSelectedBranchId(e.target.value ? parseInt(e.target.value) : "")} disabled={!selectedCompanyId} style={{ border: "1px solid #dee2e6", fontSize: "14px" }}>
                    <option value="">Select Branch</option>
                    {branches.map((b) => (<option key={b.branchId} value={b.branchId}>{b.branchName} ({b.branchCode})</option>))}
                  </Form.Select>
                </Col>
                <Col md={4}>
                  <InputGroup size="sm">
                    <InputGroup.Text style={{ background: "#f8f9fa", border: "1px solid #dee2e6" }}>
                      <FontAwesomeIcon icon={faSearch} className="text-muted" />
                    </InputGroup.Text>
                    <Form.Control type="text" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} disabled={!selectedBranchId} style={{ border: "1px solid #dee2e6", fontSize: "14px" }} />
                  </InputGroup>
                </Col>
              </Row>
            </Col>

            <Col lg={4} md={12} className="d-flex align-items-center gap-2 justify-content-lg-end">
              <ButtonGroup size="sm">
                <Button variant={viewMode === "list" ? "primary" : "outline-secondary"} onClick={() => setViewMode("list")} className="d-none d-sm-block" style={{ fontSize: "12px", padding: "6px 12px", fontWeight: 500 }}>
                  <FontAwesomeIcon icon={faList} className="me-1" />List
                </Button>
                <Button variant={viewMode === "card" ? "primary" : "outline-secondary"} onClick={() => setViewMode("card")} className="d-none d-sm-block" style={{ fontSize: "12px", padding: "6px 12px", fontWeight: 500 }}>
                  <FontAwesomeIcon icon={faTh} className="me-1" />Cards
                </Button>
              </ButtonGroup>
              <Button
                onClick={handleOpenAdd}
                style={{ background: "linear-gradient(135deg, #0066ff 0%, #003d99 100%)", border: "none", borderRadius: "6px", padding: "8px 16px", fontWeight: 600, fontSize: "13px", boxShadow: "0 2px 6px rgba(0,102,255,0.15)", transition: "all 0.3s ease", whiteSpace: "nowrap" as const }}
                onMouseEnter={(e) => { const t=e.currentTarget as HTMLElement; t.style.boxShadow="0 4px 12px rgba(0,102,255,0.3)"; t.style.transform="translateY(-2px)"; }}
                onMouseLeave={(e) => { const t=e.currentTarget as HTMLElement; t.style.boxShadow="0 2px 6px rgba(0,102,255,0.15)"; t.style.transform="translateY(0)"; }}
                className="text-white"
              >
                <FontAwesomeIcon icon={faPlus} className="me-2" />Add Warehouse
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
              Total: <strong>{filteredWarehouses.length}</strong> warehouses
              {!selectedBranchId && <span className="ms-2 text-muted" style={{ fontSize: "12px" }}>(Select a company &amp; branch to view warehouses)</span>}
            </span>
            <Badge style={{ background: "linear-gradient(135deg, #10b981 0%, #059669 100%)", padding: "6px 12px", fontSize: "12px", fontWeight: 600 }}>
              {filteredWarehouses.filter((w) => w.isActive).length} Active
            </Badge>
          </div>
        </Col>
      </Row>

      {loading && <div className="text-center py-5"><Spinner animation="border" variant="primary" /><p className="mt-2 text-muted">Loading warehouses...</p></div>}
      {error && !loading && <Alert variant="danger" className="mb-4">{error}</Alert>}

      {/* ── Content ────────────────────────────────────────────────────────── */}
      {!loading && !error && (
        <Card className="shadow-sm" style={{ border: "none", borderRadius: "8px" }}>
          <Card.Header className="bg-white" style={{ borderBottom: "1px solid #e9ecef", borderRadius: "8px 8px 0 0" }}>
            <h5 className="mb-0" style={{ fontSize: "15px", fontWeight: 600, color: "#1a1a1a" }}>
              Warehouses {viewMode === "list" ? "List" : "Cards"}
            </h5>
          </Card.Header>
          <Card.Body className="p-0">
            {filteredWarehouses.length === 0 ? (
              <div className="text-center py-5">
                <FontAwesomeIcon icon={faWarehouse} size="3x" className="text-muted mb-3" />
                <h5 className="text-muted">
                  {!selectedCompanyId ? "Select a company to start" : !selectedBranchId ? "Select a branch to view warehouses" : "No warehouses found"}
                </h5>
                <p className="text-muted">{selectedBranchId && !searchTerm ? "Start by adding your first warehouse" : ""}</p>
              </div>
            ) : viewMode === "list" ? (
              /* ── List View ─────────────────────────────────────── */
              <div className="table-responsive">
                <Table className="mb-0" hover>
                  <thead style={{ background: "#f8f9fa", borderBottom: "2px solid #dee2e6" }}>
                    <tr>
                      {["Warehouse Name","Code","Location","Contact","Status","Actions"].map((h) => (
                        <th key={h} style={{ fontSize: "12px", fontWeight: 600, color: "#495057", padding: "12px" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredWarehouses.map((w, idx) => (
                      <tr key={w.warehouseId} style={{ borderBottom: "1px solid #e9ecef", backgroundColor: idx % 2 === 0 ? "#ffffff" : "#f8f9fa" }}>
                        <td style={{ padding: "12px" }}>
                          <strong style={{ color: "#1a1a1a", fontSize: "14px" }}>{w.warehouseName}</strong>
                          {w.description && <div className="small text-muted">{w.description}</div>}
                        </td>
                        <td style={{ padding: "12px" }}>
                          <code style={{ background: "#f0f4ff", color: "#0066ff", padding: "4px 8px", borderRadius: "4px", fontSize: "12px" }}>{w.warehouseCode}</code>
                        </td>
                        <td style={{ padding: "12px" }}>
                          <div style={{ fontSize: "14px", color: "#1a1a1a" }}>{w.city}</div>
                          <small className="text-muted">{w.state} - {w.pincode}</small>
                        </td>
                        <td style={{ padding: "12px" }}>
                          {w.contactPerson && <div className="small text-muted"><FontAwesomeIcon icon={faUser} className="me-1" />{w.contactPerson}</div>}
                          {w.contactNumber && <div className="small text-muted"><FontAwesomeIcon icon={faPhone} className="me-1" />{w.contactNumber}</div>}
                          {!w.contactPerson && !w.contactNumber && <span className="text-muted small">—</span>}
                        </td>
                        <td style={{ padding: "12px" }}>
                          <Badge style={{ background: w.isActive ? "linear-gradient(135deg, #10b981 0%, #059669 100%)" : "linear-gradient(135deg, #6c757d 0%, #495057 100%)", color: "#ffffff", fontSize: "11px", fontWeight: 600, padding: "6px 10px" }}>
                            {w.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </td>
                        <td style={{ padding: "12px" }}>
                          <div className="d-flex gap-1">
                            <Button variant="light" size="sm" title="View Details"
                              onClick={() => navigate(`/erp-setup/warehouse-view/${w.warehouseId}`)}
                              style={actionBtnStyle("#f0f4ff", "#0066ff")}
                              onMouseEnter={(e) => { const t=e.currentTarget as HTMLElement; t.style.background="#0066ff"; t.style.color="#ffffff"; }}
                              onMouseLeave={(e) => { const t=e.currentTarget as HTMLElement; t.style.background="#f0f4ff"; t.style.color="#0066ff"; }}
                            ><FontAwesomeIcon icon={faEye} /></Button>
                            <Button variant="light" size="sm" title="Edit Warehouse"
                              onClick={() => handleOpenEdit(w)}
                              style={actionBtnStyle("#f5f5f5", "#6c757d")}
                              onMouseEnter={(e) => { const t=e.currentTarget as HTMLElement; t.style.background="#6c757d"; t.style.color="#ffffff"; }}
                              onMouseLeave={(e) => { const t=e.currentTarget as HTMLElement; t.style.background="#f5f5f5"; t.style.color="#6c757d"; }}
                            ><FontAwesomeIcon icon={faEdit} /></Button>
                            <Button variant="light" size="sm" title="Delete Warehouse"
                              onClick={() => handleDeleteClick(w)}
                              style={actionBtnStyle("#ffe6e6", "#dc3545")}
                              onMouseEnter={(e) => { const t=e.currentTarget as HTMLElement; t.style.background="#dc3545"; t.style.color="#ffffff"; }}
                              onMouseLeave={(e) => { const t=e.currentTarget as HTMLElement; t.style.background="#ffe6e6"; t.style.color="#dc3545"; }}
                            ><FontAwesomeIcon icon={faTrash} /></Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            ) : (
              /* ── Card View ─────────────────────────────────────── */
              <div className="p-4">
                <Row className="g-4">
                  {filteredWarehouses.map((w) => (
                    <Col md={6} lg={4} key={w.warehouseId}>
                      <Card className="h-100" style={{ border: "none", borderRadius: "10px", overflow: "hidden", background: "#ffffff", boxShadow: "0 1px 3px rgba(0,0,0,0.08)", transition: "all 0.3s cubic-bezier(0.4,0,0.2,1)", display: "flex", flexDirection: "column" }}
                        onMouseEnter={(e) => { const t=e.currentTarget as HTMLElement; t.style.boxShadow="0 8px 24px rgba(0,102,255,0.15)"; t.style.transform="translateY(-4px)"; }}
                        onMouseLeave={(e) => { const t=e.currentTarget as HTMLElement; t.style.boxShadow="0 1px 3px rgba(0,0,0,0.08)"; t.style.transform="translateY(0)"; }}
                      >
                        <div style={{ height: "4px", background: "linear-gradient(135deg, #0066ff 0%, #003d99 100%)" }} />
                        <Card.Body className="p-4 d-flex flex-column" style={{ flex: "1 1 auto" }}>
                            <h5 style={{ fontSize: "16px", fontWeight: 600, color: "#1a1a1a", marginBottom: "12px" }}>{w.warehouseName}</h5>
                            {w.description && <small className="text-muted d-block mb-2">{w.description}</small>}
                            <div style={{ marginBottom: "12px", paddingTop: "12px", borderTop: "1px solid #e9ecef" }}>
                              <small style={{ color: "#6c757d", fontSize: "12px", display: "block", marginBottom: "4px" }}>
                                <FontAwesomeIcon icon={faMapMarkerAlt} className="me-2" /><strong>Address:</strong>
                              </small>
                              <small style={{ color: "#6c757d", fontSize: "12px", lineHeight: "1.5", display: "block" }}>
                                {w.warehouseAddressLine1}{w.warehouseAddressLine2 && <><br />{w.warehouseAddressLine2}</>}
                                <br />{w.city}, {w.state} - {w.pincode}
                              </small>
                            </div>
                            {(w.contactPerson || w.contactNumber || w.email) && (
                              <div style={{ marginBottom: "12px" }}>
                                {w.contactPerson && <small style={{ color: "#6c757d", fontSize: "12px", display: "block", marginBottom: "3px" }}><FontAwesomeIcon icon={faUser} className="me-2" />{w.contactPerson}</small>}
                                {w.contactNumber && <small style={{ color: "#6c757d", fontSize: "12px", display: "block", marginBottom: "3px" }}><FontAwesomeIcon icon={faPhone} className="me-2" />{w.contactNumber}</small>}
                                {w.email && <small style={{ color: "#6c757d", fontSize: "12px", display: "block" }}><FontAwesomeIcon icon={faEnvelope} className="me-2" />{w.email}</small>}
                              </div>
                            )}
                          <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", paddingTop: "12px", borderTop: "1px solid #e9ecef", marginTop: "12px", flex: "0 0 auto" }}>
                            <Button variant="light" size="sm" title="View Details"
                              onClick={() => navigate(`/erp-setup/warehouse-view/${w.warehouseId}`)}
                              style={actionBtnStyle("#f0f4ff", "#0066ff")}
                              onMouseEnter={(e) => { const t=e.currentTarget as HTMLElement; t.style.background="#0066ff"; t.style.color="#ffffff"; }}
                              onMouseLeave={(e) => { const t=e.currentTarget as HTMLElement; t.style.background="#f0f4ff"; t.style.color="#0066ff"; }}
                            ><FontAwesomeIcon icon={faEye} /></Button>
                            <Button variant="light" size="sm" title="Edit Warehouse"
                              onClick={() => handleOpenEdit(w)}
                              style={actionBtnStyle("#f5f5f5", "#6c757d")}
                              onMouseEnter={(e) => { const t=e.currentTarget as HTMLElement; t.style.background="#6c757d"; t.style.color="#ffffff"; }}
                              onMouseLeave={(e) => { const t=e.currentTarget as HTMLElement; t.style.background="#f5f5f5"; t.style.color="#6c757d"; }}
                            ><FontAwesomeIcon icon={faEdit} /></Button>
                            <Button variant="light" size="sm" title="Delete Warehouse"
                              onClick={() => handleDeleteClick(w)}
                              style={actionBtnStyle("#ffe6e6", "#dc3545")}
                              onMouseEnter={(e) => { const t=e.currentTarget as HTMLElement; t.style.background="#dc3545"; t.style.color="#ffffff"; }}
                              onMouseLeave={(e) => { const t=e.currentTarget as HTMLElement; t.style.background="#ffe6e6"; t.style.color="#dc3545"; }}
                            ><FontAwesomeIcon icon={faTrash} /></Button>
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

      {/* ── Delete Modal ──────────────────────────────────────────────────────── */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title><FontAwesomeIcon icon={faExclamationTriangle} className="text-danger me-2" />Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {deleteError && <Alert variant="danger" className="mb-3">{deleteError}</Alert>}
          {warehouseToDelete && (
            <>
              <p>Are you sure you want to delete this warehouse?</p>
              <Card className="mb-3">
                <Card.Body className="py-2">
                    <div>
                      <strong>{warehouseToDelete.warehouseName}</strong><br />
                      <small className="text-muted">{warehouseToDelete.city}, {warehouseToDelete.state}</small>
                    </div>
                      <div className="text-end">
                        <Badge bg="info" className="d-block mb-1">ID: {warehouseToDelete.warehouseId}</Badge>
                        <code className="small">{warehouseToDelete.warehouseCode}</code>
                      </div>
                    </Card.Body>
              </Card>
              <Alert variant="warning" className="mb-0">
                <small><FontAwesomeIcon icon={faExclamationTriangle} className="me-2" /><strong>Warning:</strong> This action cannot be undone.</small>
              </Alert>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)} disabled={deleting}>Cancel</Button>
          <Button variant="danger" onClick={handleDeleteConfirm} disabled={deleting}>
            {deleting ? (<><Spinner animation="border" size="sm" className="me-2" />Deleting...</>) : (<><FontAwesomeIcon icon={faTrash} className="me-2" />Delete Warehouse</>)}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* ── Add / Edit Modal ──────────────────────────────────────────────────── */}
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
            style={{ background: "linear-gradient(135deg, #0066ff 0%, #003d99 100%)", color: "#fff" }}
          >
            <Modal.Title style={{ fontWeight: 600, fontSize: "16px" }}>
              <FontAwesomeIcon icon={faWarehouse} className="me-2" />
              {isEditing ? "Edit Warehouse" : "Add New Warehouse"}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body style={{ padding: "24px" }}>
            {addError && <Alert variant="danger" className="mb-3">{addError}</Alert>}
            <Row className="g-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label style={{ fontSize: "13px", fontWeight: 600, color: "#495057" }}>Warehouse Name <span style={{ color: "#dc3545" }}>*</span></Form.Label>
                  <Form.Control type="text" name="warehouseName" value={addFormData.warehouseName} onChange={handleAddInputChange} required placeholder="e.g. Central Warehouse" style={{ fontSize: "14px", borderRadius: "6px" }} />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label style={{ fontSize: "13px", fontWeight: 600, color: "#495057" }}>Warehouse Code <span style={{ color: "#dc3545" }}>*</span></Form.Label>
                  <Form.Control type="text" name="warehouseCode" value={addFormData.warehouseCode} onChange={handleAddInputChange} required placeholder="e.g. WH-001" style={{ fontSize: "14px", borderRadius: "6px" }} />
                </Form.Group>
              </Col>
              <Col md={12}>
                <Form.Group>
                  <Form.Label style={{ fontSize: "13px", fontWeight: 600, color: "#495057" }}>Branch <span style={{ color: "#dc3545" }}>*</span></Form.Label>
                  <Form.Select name="branchId" value={addFormData.branchId} onChange={handleAddInputChange} required style={{ fontSize: "14px", borderRadius: "6px" }}>
                    <option value={0}>Select Branch</option>
                    {branches.map((b) => (<option key={b.branchId} value={b.branchId}>{b.branchName} ({b.branchCode})</option>))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={12}>
                <Form.Group>
                  <Form.Label style={{ fontSize: "13px", fontWeight: 600, color: "#495057" }}>Description</Form.Label>
                  <Form.Control as="textarea" rows={2} name="description" value={addFormData.description} onChange={handleAddInputChange} placeholder="Optional description" style={{ fontSize: "14px", borderRadius: "6px" }} />
                </Form.Group>
              </Col>
              <Col md={12}>
                <Form.Group>
                  <Form.Label style={{ fontSize: "13px", fontWeight: 600, color: "#495057" }}>Address Line 1 <span style={{ color: "#dc3545" }}>*</span></Form.Label>
                  <Form.Control type="text" name="warehouseAddressLine1" value={addFormData.warehouseAddressLine1} onChange={handleAddInputChange} required placeholder="Street address" style={{ fontSize: "14px", borderRadius: "6px" }} />
                </Form.Group>
              </Col>
              <Col md={12}>
                <Form.Group>
                  <Form.Label style={{ fontSize: "13px", fontWeight: 600, color: "#495057" }}>Address Line 2</Form.Label>
                  <Form.Control type="text" name="warehouseAddressLine2" value={addFormData.warehouseAddressLine2} onChange={handleAddInputChange} placeholder="Landmark, Area (optional)" style={{ fontSize: "14px", borderRadius: "6px" }} />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label style={{ fontSize: "13px", fontWeight: 600, color: "#495057" }}>City <span style={{ color: "#dc3545" }}>*</span></Form.Label>
                  <Form.Control type="text" name="city" value={addFormData.city} onChange={handleAddInputChange} required placeholder="City" style={{ fontSize: "14px", borderRadius: "6px" }} />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label style={{ fontSize: "13px", fontWeight: 600, color: "#495057" }}>State <span style={{ color: "#dc3545" }}>*</span></Form.Label>
                  <Form.Select name="state" value={addFormData.state} onChange={handleAddInputChange} required style={{ fontSize: "14px", borderRadius: "6px" }}>
                    <option value="">Select State</option>
                    {INDIAN_STATES.map((s) => (<option key={s} value={s}>{s}</option>))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label style={{ fontSize: "13px", fontWeight: 600, color: "#495057" }}>Pincode <span style={{ color: "#dc3545" }}>*</span></Form.Label>
                  <Form.Control type="text" name="pincode" value={addFormData.pincode} onChange={handleAddInputChange} required placeholder="6-digit" maxLength={6} style={{ fontSize: "14px", borderRadius: "6px" }} />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label style={{ fontSize: "13px", fontWeight: 600, color: "#495057" }}>Contact Person</Form.Label>
                  <Form.Control type="text" name="contactPerson" value={addFormData.contactPerson} onChange={handleAddInputChange} placeholder="Contact name" style={{ fontSize: "14px", borderRadius: "6px" }} />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label style={{ fontSize: "13px", fontWeight: 600, color: "#495057" }}>Contact Number</Form.Label>
                  <Form.Control type="tel" name="contactNumber" value={addFormData.contactNumber} onChange={handleAddInputChange} placeholder="Phone number" style={{ fontSize: "14px", borderRadius: "6px" }} />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label style={{ fontSize: "13px", fontWeight: 600, color: "#495057" }}>Email</Form.Label>
                  <Form.Control type="email" name="email" value={addFormData.email} onChange={handleAddInputChange} placeholder="email@company.com" style={{ fontSize: "14px", borderRadius: "6px" }} />
                </Form.Group>
              </Col>
              <Col md={12}>
                <div style={{ padding: "10px 14px", border: "1px solid #dee2e6", borderRadius: "6px", background: "#f8f9fa" }}>
                  <Form.Check type="switch" name="isActive" label="Warehouse is Active" checked={addFormData.isActive} onChange={handleAddInputChange} style={{ fontSize: "14px" }} />
                </div>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer style={{ borderTop: "1px solid #e9ecef" }}>
            <Button variant="outline-secondary" onClick={() => setShowAddModal(false)} disabled={addSubmitting} style={{ borderRadius: "6px", fontWeight: 600 }}>Cancel</Button>
            <Button type="submit" disabled={addSubmitting} style={{ background: "linear-gradient(135deg, #0066ff 0%, #003d99 100%)", border: "none", borderRadius: "6px", padding: "8px 20px", fontWeight: 600 }} className="text-white">
              {addSubmitting ? (<><Spinner animation="border" size="sm" className="me-2" />{isEditing ? "Updating..." : "Creating..."}</>) : (<><FontAwesomeIcon icon={faSave} className="me-2" />{isEditing ? "Update Warehouse" : "Save Warehouse"}</>)}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
};

export default WarehouseSetup;