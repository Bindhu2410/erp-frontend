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
  faBoxes,
  faEdit,
  faEye,
  faList,
  faTh,
  faWarehouse,
  faTrash,
  faExclamationTriangle,
  faSave,
  faLayerGroup,
} from "@fortawesome/free-solid-svg-icons";


import { TbLocationCog } from "react-icons/tb";
import { useNavigate } from "react-router-dom";
import { companyListService } from "../services/companyList.service";
import {

  inventoryLocationService,
  IInventoryLocationDto,
} from "../services/inventoryLocation.service";
import { warehouseService } from "../services/warehouse.service";

const API_BASE_URL = "http://localhost:5104/api";

const CATEGORIES = [
  "Rack",
  "Shelf",
  "Bin",
  "Zone",
  "Aisle",
  "Floor",
  "Container",
];

const InventoryLocationSetup: React.FC = () => {
  const navigate = useNavigate();

  const [companies, setCompanies] = useState<
    Array<{ companyId: number; legalCompanyName: string }>
  >([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<number | "">("");
  const [branches, setBranches] = useState<
    Array<{ branchId: number; branchName: string; branchCode: string }>
  >([]);
  const [selectedBranchId, setSelectedBranchId] = useState<number | "">("");
  const [warehouses, setWarehouses] = useState<
    Array<{ warehouseId: number; warehouseName: string; warehouseCode: string }>
  >([]);
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<number | "">(
    "",
  );

  const [locations, setLocations] = useState<IInventoryLocationDto[]>([]);
  const [filteredLocations, setFilteredLocations] = useState<
    IInventoryLocationDto[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "card">("list");

  // Delete modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [locationToDelete, setLocationToDelete] =
    useState<IInventoryLocationDto | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Add/Edit modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [addFormData, setAddFormData] = useState<IInventoryLocationDto>({
    locationId: 0,
    warehouseId: 0,
    locationCode: "",
    locationName: "",
    locationCategory: "Rack",
    capacityWeight: 0,
    capacityWeightUom: "kg",
    capacityVolume: 0,
    capacityVolumeUom: "m3",
    capacityItemCount: 0,
  });
  const [isEditing, setIsEditing] = useState(false);
  const [addSubmitting, setAddSubmitting] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  // Fetch companies on mount
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const response = await companyListService.getCompanies();
        setCompanies(
          response.data.map((c) => ({
            companyId: c.companyId,
            legalCompanyName: c.legalCompanyName,
          })),
        );
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
    setSelectedWarehouseId("");
    setLocations([]);
    if (selectedCompanyId === "") return;
    const fetchBranches = async () => {
      try {
        const res = await fetch(
          `${API_BASE_URL}/CsBranch/company/${selectedCompanyId}?includeInactive=true`,
        );
        const data = await res.json();
        setBranches(
          (data.data || []).map((b: any) => ({
            branchId: b.branchId,
            branchName: b.branchName,
            branchCode: b.branchCode,
          })),
        );
      } catch (err) {
        console.error("Error fetching branches:", err);
      }
    };
    fetchBranches();
  }, [selectedCompanyId]);

  // Fetch warehouses when branch changes
  useEffect(() => {
    setWarehouses([]);
    setSelectedWarehouseId("");
    setLocations([]);
    if (selectedBranchId === "") return;
    const fetchWarehouses = async () => {
      try {
        // Using working warehouseService to avoid the 500 error on CsBranchWarehouse
        const response = await warehouseService.getWarehousesByBranch(
          selectedBranchId as number,
        );
        const mapped = (response.data || []).map((w: any) => ({
          warehouseId: w.warehouseId,
          warehouseName: w.warehouseName,
          warehouseCode: w.warehouseCode,
        }));
        setWarehouses(mapped);
      } catch (err) {
        console.error("Error fetching warehouses:", err);
      }
    };
    fetchWarehouses();
  }, [selectedBranchId]);

  // Fetch locations when warehouse changes
  useEffect(() => {
    setLocations([]);
    if (selectedWarehouseId === "") return;
    fetchLocations(selectedWarehouseId as number);
  }, [selectedWarehouseId]);

  const fetchLocations = async (whId: number) => {
    setLoading(true);
    setError(null);
    try {
      const response =
        await inventoryLocationService.getLocationsByWarehouse(whId);
      const data = response.data.data || [];
      setLocations(data);
      setFilteredLocations(data);
    } catch (err) {
      setError("Failed to fetch inventory locations");
    } finally {
      setLoading(false);
    }
  };

  // Search filter
  useEffect(() => {
    const filtered = locations.filter(
      (loc) =>
        loc.locationName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        loc.locationCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (loc.locationCategory || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase()),
    );
    setFilteredLocations(filtered);
  }, [searchTerm, locations]);

  // Delete handlers
  const handleDeleteClick = (loc: IInventoryLocationDto) => {
    setLocationToDelete(loc);
    setDeleteError(null);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!locationToDelete) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await inventoryLocationService.deleteLocation(
        locationToDelete.locationId,
      );
      setLocations((prev) =>
        prev.filter((l) => l.locationId !== locationToDelete.locationId),
      );
      setShowDeleteModal(false);
      setLocationToDelete(null);
      toast.success("Inventory location deleted successfully!");
    } catch (err: any) {
      const msg = err.message || "Failed to delete location. It might be in use.";
      setDeleteError(msg);
      toast.error(msg);
    } finally {
      setDeleting(false);
    }
  };

  // Add/Edit handlers
  const handleOpenAdd = () => {
    setAddFormData({
      locationId: 0,
      warehouseId:
        selectedWarehouseId !== "" ? (selectedWarehouseId as number) : 0,
      locationCode: "",
      locationName: "",
      locationCategory: "Rack",
      capacityWeight: 0,
      capacityWeightUom: "kg",
      capacityVolume: 0,
      capacityVolumeUom: "m3",
      capacityItemCount: 0,
    });
    setIsEditing(false);
    setAddError(null);
    setShowAddModal(true);
  };

  const handleOpenEdit = (loc: IInventoryLocationDto) => {
    setAddFormData({ ...loc });
    setIsEditing(true);
    setAddError(null);
    setShowAddModal(true);
  };

  const handleAddInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const numericFields = [
      "locationId",
      "warehouseId",
      "capacityWeight",
      "capacityVolume",
      "capacityItemCount",
    ];
    setAddFormData((prev) => ({
      ...prev,
      [name]: numericFields.includes(name)
        ? value === ""
          ? 0
          : parseFloat(value)
        : value,
    }));
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddSubmitting(true);
    setAddError(null);
    try {
      if (isEditing) {
        await inventoryLocationService.updateLocation(
          addFormData.locationId,
          addFormData,
        );
        toast.success("Location updated successfully!");
      } else {
        await inventoryLocationService.createLocation(addFormData);
        toast.success("Location created successfully!");
      }
      if (selectedWarehouseId !== "")
        fetchLocations(selectedWarehouseId as number);
      setTimeout(() => {
        setShowAddModal(false);
      }, 1500);
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "Failed to save location";
      setAddError(msg);
      toast.error(msg);
    } finally {
      setAddSubmitting(false);
    }
  };

  const actionBtnStyle = (bg: string, color: string) => ({
    background: bg,
    color,
    border: "none",
    fontSize: "12px",
    padding: "6px 10px",
    fontWeight: 500 as const,
    transition: "all 0.2s ease",
  });

  return (
    <Container className="mt-4 mb-5">
      {/* ── Header Card ─────────────────────────────────────────────────────── */}
      <Card
        className="mb-4 shadow-sm"
        style={{ border: "none", borderRadius: "8px" }}
      >
        <Card.Body className="p-3">
          <Row className="align-items-center g-3">
            <Col lg={3} md={12}>
              <div className="d-flex align-items-center">
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "8px",
                    background:
                      "linear-gradient(135deg, #0066ff 0%, #003d99 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: "12px",
                    flexShrink: 0,
                  }}
                >
                  <TbLocationCog className="text-white" size="24" />
                </div>
                <div>
                  <h4
                    className="mb-0"
                    style={{
                      fontWeight: 600,
                      color: "#1a1a1a",
                      fontSize: "18px",
                    }}
                  >
                    Locations
                  </h4>
                  <small className="text-muted" style={{ fontSize: "12px" }}>
                    Inventory Mapping
                  </small>
                </div>
              </div>
            </Col>

            <Col lg={6} md={12}>
              <Row className="g-2">
                <Col md={3}>
                  <Form.Select
                    size="sm"
                    value={selectedCompanyId}
                    onChange={(e) =>
                      setSelectedCompanyId(
                        e.target.value ? parseInt(e.target.value) : "",
                      )
                    }
                    style={{ fontSize: "12px" }}
                  >
                    <option value="">Select Company</option>
                    {companies.map((c) => (
                      <option key={c.companyId} value={c.companyId}>
                        {c.legalCompanyName}
                      </option>
                    ))}
                  </Form.Select>
                </Col>
                <Col md={3}>
                  <Form.Select
                    size="sm"
                    value={selectedBranchId}
                    onChange={(e) =>
                      setSelectedBranchId(
                        e.target.value ? parseInt(e.target.value) : "",
                      )
                    }
                    disabled={!selectedCompanyId}
                    style={{ fontSize: "12px" }}
                  >
                    <option value="">Select Branch</option>
                    {branches.map((b) => (
                      <option key={b.branchId} value={b.branchId}>
                        {b.branchName}
                      </option>
                    ))}
                  </Form.Select>
                </Col>
                <Col md={3}>
                  <Form.Select
                    size="sm"
                    value={selectedWarehouseId}
                    onChange={(e) =>
                      setSelectedWarehouseId(
                        e.target.value ? parseInt(e.target.value) : "",
                      )
                    }
                    disabled={!selectedBranchId}
                    style={{ fontSize: "12px" }}
                  >
                    <option value="">Select Warehouse</option>
                    {warehouses.map((w) => (
                      <option key={w.warehouseId} value={w.warehouseId}>
                        {w.warehouseName}
                      </option>
                    ))}
                  </Form.Select>
                </Col>
                <Col md={3}>
                  <InputGroup size="sm">
                    <InputGroup.Text style={{ background: "#f8f9fa" }}>
                      <FontAwesomeIcon icon={faSearch} className="text-muted" />
                    </InputGroup.Text>
                    <Form.Control
                      type="text"
                      placeholder="Search..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      disabled={!selectedWarehouseId}
                      style={{ fontSize: "12px" }}
                    />
                  </InputGroup>
                </Col>
              </Row>
            </Col>

            <Col
              lg={3}
              md={12}
              className="d-flex align-items-center gap-2 justify-content-lg-end"
            >
              <ButtonGroup size="sm">
                <Button
                  variant={
                    viewMode === "list" ? "primary" : "outline-secondary"
                  }
                  onClick={() => setViewMode("list")}
                  style={{ fontSize: "12px" }}
                >
                  <FontAwesomeIcon icon={faList} />
                </Button>
                <Button
                  variant={
                    viewMode === "card" ? "primary" : "outline-secondary"
                  }
                  onClick={() => setViewMode("card")}
                  style={{ fontSize: "12px" }}
                >
                  <FontAwesomeIcon icon={faTh} />
                </Button>
              </ButtonGroup>
              <Button
                onClick={handleOpenAdd}
                disabled={!selectedWarehouseId}
                style={{
                  background:
                    "linear-gradient(135deg, #0066ff 0%, #003d99 100%)",
                  border: "none",
                  borderRadius: "6px",
                  padding: "8px 16px",
                  fontWeight: 600,
                  fontSize: "13px",
                }}
                className="text-white"
              >
                <FontAwesomeIcon icon={faPlus} className="me-2" />
                Add Location
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Content Area */}
      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-2 text-muted">Loading locations...</p>
        </div>
      ) : error ? (
        <Alert variant="danger">{error}</Alert>
      ) : locations.length === 0 ? (
        <Card className="text-center py-5 shadow-sm border-0">
          <Card.Body>
            <TbLocationCog
              size="48"
              className="text-muted mb-3 d-block mx-auto"
            />
            <h5 className="text-muted mb-1">
              {!selectedWarehouseId
                ? "Select Warehouse to View Locations"
                : "No Locations Found"}
            </h5>
            <p className="text-muted small">
              {selectedWarehouseId &&
                "Start by adding your first inventory location."}
            </p>
          </Card.Body>
        </Card>
      ) : (
        <Card className="shadow-sm border-0 overflow-hidden">
          <Card.Header className="bg-white border-bottom p-3">
            <h5 className="mb-0" style={{ fontSize: "15px", fontWeight: 600 }}>
              Locations Management
            </h5>
          </Card.Header>
          <Card.Body className="p-0">
            {viewMode === "list" ? (
              <Table hover responsive className="mb-0">
                <thead style={{ background: "#f8f9fa" }}>
                  <tr style={{ fontSize: "12px", color: "#495057" }}>
                    <th className="px-3 py-2">Location Name</th>
                    <th className="px-3 py-2">Code</th>
                    <th className="px-3 py-2">Category</th>
                    <th className="px-3 py-2">Capacity</th>
                    <th className="px-3 py-2 text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLocations.map((loc) => (
                    <tr key={loc.locationId} style={{ fontSize: "14px" }}>
                      <td className="px-3 py-3 font-weight-bold">
                        {loc.locationName}
                      </td>
                      <td className="px-3 py-3">
                        <code className="text-primary">{loc.locationCode}</code>
                      </td>
                      <td className="px-3 py-3">
                        <Badge bg="light" text="dark" className="border">
                          {loc.locationCategory}
                        </Badge>
                      </td>
                      <td className="px-3 py-3">
                        <small className="text-muted d-block">
                          {loc.capacityWeight} {loc.capacityWeightUom}
                        </small>
                        <small className="text-muted">
                          {loc.capacityItemCount} items
                        </small>
                      </td>
                      <td className="px-3 py-3 text-end">
                        <div className="d-flex gap-1 justify-content-end">
                          <Button
                            size="sm"
                            onClick={() =>
                              navigate(
                                `/erp-setup/inventory-location-view/${loc.locationId}`,
                              )
                            }
                            style={actionBtnStyle("#f0f4ff", "#0066ff")}
                          >
                            <FontAwesomeIcon icon={faEye} />
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleOpenEdit(loc)}
                            style={actionBtnStyle("#f5f5f5", "#6c757d")}
                          >
                            <FontAwesomeIcon icon={faEdit} />
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleDeleteClick(loc)}
                            style={actionBtnStyle("#ffe6e6", "#dc3545")}
                          >
                            <FontAwesomeIcon icon={faTrash} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            ) : (
              <div className="p-3">
                <Row className="g-3">
                  {filteredLocations.map((loc) => (
                    <Col md={4} key={loc.locationId}>
                      <Card
                        className="h-100 border-0 shadow-sm location-card-hover"
                        style={{ transition: "all 0.3s ease" }}
                      >
                        <Card.Body>
                          <div className="d-flex justify-content-between mb-2">
                            <Badge
                              bg="purple"
                              style={{ backgroundColor: "#8b5cf6" }}
                            >
                              {loc.locationCategory}
                            </Badge>
                            <code className="small">{loc.locationCode}</code>
                          </div>
                          <h6 className="mb-3" style={{ fontWeight: 600 }}>
                            {loc.locationName}
                          </h6>
                          <div className="small text-muted mb-3 border-top pt-2">
                            <div className="d-flex justify-content-between mb-1">
                              <span>Weight:</span>
                              <span>
                                {loc.capacityWeight} {loc.capacityWeightUom}
                              </span>
                            </div>
                            <div className="d-flex justify-content-between mb-1">
                              <span>Items:</span>
                              <span>{loc.capacityItemCount}</span>
                            </div>
                          </div>
                          <div className="d-flex gap-1 mt-auto">
                            <Button
                              className="flex-grow-1"
                              size="sm"
                              onClick={() =>
                                navigate(
                                  `/erp-setup/inventory-location-view/${loc.locationId}`,
                                )
                              }
                              variant="outline-primary"
                              style={{ fontSize: "11px" }}
                            >
                              <FontAwesomeIcon icon={faEye} className="me-1" />{" "}
                              View
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleOpenEdit(loc)}
                              variant="outline-secondary"
                              style={{ fontSize: "11px" }}
                            >
                              <FontAwesomeIcon icon={faEdit} />
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleDeleteClick(loc)}
                              variant="outline-danger"
                              style={{ fontSize: "11px" }}
                            >
                              <FontAwesomeIcon icon={faTrash} />
                            </Button>
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
      <Modal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title style={{ fontSize: "16px" }}>
            <FontAwesomeIcon
              icon={faExclamationTriangle}
              className="text-danger me-2"
            />
            Confirm Delete
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="py-4">
          {deleteError && <Alert variant="danger">{deleteError}</Alert>}
          <p className="mb-0">
            Are you sure you want to delete{" "}
            <strong>{locationToDelete?.locationName}</strong>?
          </p>
          <small className="text-muted">
            This action cannot be undone and may fail if items are currently
            stored here.
          </small>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="light" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleDeleteConfirm}
            disabled={deleting}
          >
            {deleting ? "Deleting..." : "Delete Location"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Add/Edit Modal */}
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
            background: "linear-gradient(135deg, #0066ff 0%, #003d99 100%)",
          }}
          className="text-white"
        >
          <Modal.Title style={{ fontSize: "16px", fontWeight: 600 }}>
            {isEditing ? "Edit" : "Add"} Inventory Location
          </Modal.Title>
        </Modal.Header>
          <Modal.Body className="p-4">
            {addError && <Alert variant="danger">{addError}</Alert>}

            <Row className="g-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label style={{ fontSize: "13px", fontWeight: 600 }}>
                    Location Name *
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="locationName"
                    value={addFormData.locationName}
                    onChange={handleAddInputChange}
                    required
                    placeholder="e.g. Rack A1-01"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label style={{ fontSize: "13px", fontWeight: 600 }}>
                    Location Code *
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="locationCode"
                    value={addFormData.locationCode}
                    onChange={handleAddInputChange}
                    required
                    placeholder="e.g. RA101"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label style={{ fontSize: "13px", fontWeight: 600 }}>
                    Category
                  </Form.Label>
                  <Form.Select
                    name="locationCategory"
                    value={addFormData.locationCategory}
                    onChange={handleAddInputChange}
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col md={12} className="mt-4">
                <h6
                  className="border-bottom pb-2"
                  style={{ fontSize: "14px", fontWeight: 600 }}
                >
                  Capacity Details
                </h6>
              </Col>

              <Col md={4}>
                <Form.Group>
                  <Form.Label style={{ fontSize: "13px" }}>
                    Max Weight
                  </Form.Label>
                  <InputGroup size="sm">
                    <Form.Control
                      type="number"
                      name="capacityWeight"
                      value={addFormData.capacityWeight}
                      onChange={handleAddInputChange}
                    />
                    <Form.Select
                      name="capacityWeightUom"
                      value={addFormData.capacityWeightUom}
                      onChange={handleAddInputChange}
                      style={{ maxWidth: "80px" }}
                    >
                      <option value="kg">kg</option>
                      <option value="lb">lb</option>
                      <option value="ton">ton</option>
                    </Form.Select>
                  </InputGroup>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label style={{ fontSize: "13px" }}>
                    Max Volume
                  </Form.Label>
                  <InputGroup size="sm">
                    <Form.Control
                      type="number"
                      name="capacityVolume"
                      value={addFormData.capacityVolume}
                      onChange={handleAddInputChange}
                    />
                    <Form.Select
                      name="capacityVolumeUom"
                      value={addFormData.capacityVolumeUom}
                      onChange={handleAddInputChange}
                      style={{ maxWidth: "80px" }}
                    >
                      <option value="m3">m³</option>
                      <option value="ft3">ft³</option>
                    </Form.Select>
                  </InputGroup>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label style={{ fontSize: "13px" }}>
                    Max Item Count
                  </Form.Label>
                  <Form.Control
                    size="sm"
                    type="number"
                    name="capacityItemCount"
                    value={addFormData.capacityItemCount}
                    onChange={handleAddInputChange}
                  />
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer className="bg-light">
            <Button
              variant="outline-secondary"
              onClick={() => setShowAddModal(false)}
              disabled={addSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={addSubmitting}
              style={{
                background: "linear-gradient(135deg, #0066ff 0%, #003d99 100%)",
                border: "none",
              }}
              className="text-white px-4"
            >
              {addSubmitting ? (
                "Saving..."
              ) : (
                <>
                  <FontAwesomeIcon icon={faSave} className="me-2" />
                  Save Location
                </>
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      <style>{`
        .location-card-hover:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 20px rgba(109, 40, 217, 0.1) !important;
        }
      `}</style>
    </Container>
  );
};

export default InventoryLocationSetup;
