import React, { useState, useEffect } from "react";
import {
  Form,
  Card,
  Row,
  Col,
  Button,
  Toast,
  ToastContainer,
  Container,
  Modal,
  Badge,
  Dropdown,
} from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faSearch,
  faRedoAlt,
  faLayerGroup,
  faBuilding,
  faSitemap,
  faEdit,
  faTrashAlt,
} from "@fortawesome/free-solid-svg-icons";
import { costCentreService } from "../services/costcentre.service";
import { companyListService } from "../services/companyList.service";
import {
  ICostCentreCreate,
  ICostCentreResponse,
} from "../interfaces/costcentre.types";

interface ICostCentreForm {
  costCentreCode: string;
  costCentreName: string;
  isActive: boolean;
  companyId: number;
  parentCostCentreId: number | null;
}

const CostCentre: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [costCentres, setCostCentres] = useState<ICostCentreResponse[]>([]);
  const [companies, setCompanies] = useState<
    Array<{ companyId: number; legalCompanyName: string }>
  >([]);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastVariant, setToastVariant] = useState<"success" | "danger">(
    "success"
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [companyFilter, setCompanyFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [currentCostCentre, setCurrentCostCentre] = useState<ICostCentreForm>({
    costCentreCode: "",
    costCentreName: "",
    isActive: true,
    companyId: 0,
    parentCostCentreId: null,
  });

  // Fetch companies when component mounts
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const response = await companyListService.getCompanies();
        if (response && response.data) {
          setCompanies(
            response.data.map((company) => ({
              companyId: company.companyId,
              legalCompanyName: company.legalCompanyName,
            }))
          );
        }
      } catch (error) {
        console.error("Error fetching companies:", error);
        setToastVariant("danger");
        setToastMessage("Failed to fetch companies");
        setShowToast(true);
      }
    };

    fetchCompanies();
  }, []);

  // Fetch all cost centres when component mounts
  useEffect(() => {
    const fetchAllCostCentres = async () => {
      try {
        const response = await costCentreService.getAllCostCentres();
        setCostCentres(response);
      } catch (error) {
        console.error("Error fetching cost centres:", error);
        setToastVariant("danger");
        setToastMessage("Failed to fetch cost centres");
        setShowToast(true);
      }
    };

    fetchAllCostCentres();
  }, []);

  // Fetch cost centres when company filter is selected (for modal dropdown)
  useEffect(() => {
    const fetchCostCentres = async () => {
      if (currentCostCentre.companyId) {
        try {
          const response = await costCentreService.getCostCentres(
            currentCostCentre.companyId
          );
          // This is used for the parent cost centre dropdown, not for displaying in the grid
        } catch (error) {
          console.error("Error fetching cost centres:", error);
        }
      }
    };

    fetchCostCentres();
  }, [currentCostCentre.companyId]);

  const handleAddCostCentre = () => {
    setShowModal(true);
  };

  const [isEditMode, setIsEditMode] = useState(false);

  const handleEditCostCentre = (costCentreId: number) => {
    // Find the cost centre to edit
    const costCentreToEdit = costCentres.find(
      (centre) => centre.costCentreId === costCentreId
    );

    if (costCentreToEdit) {
      setCurrentCostCentre({
        costCentreCode: costCentreToEdit.costCentreCode,
        costCentreName: costCentreToEdit.costCentreName,
        isActive: costCentreToEdit.isActive,
        companyId: costCentreToEdit.companyId,
        parentCostCentreId: costCentreToEdit.parentCostCentreId,
      });
      setIsEditMode(true);
      setShowModal(true);
    }
  };

  const handleDeleteCostCentre = async (costCentreId: number) => {
    if (window.confirm("Are you sure you want to delete this cost centre?")) {
      try {
        await costCentreService.deleteCostCentre(costCentreId);

        // Remove the deleted cost centre from the list
        setCostCentres(
          costCentres.filter((centre) => centre.costCentreId !== costCentreId)
        );

        setToastVariant("success");
        setToastMessage("Cost centre deleted successfully");
        setShowToast(true);
      } catch (error) {
        console.error("Error deleting cost centre:", error);
        setToastVariant("danger");
        setToastMessage("Failed to delete cost centre");
        setShowToast(true);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentCostCentre.companyId) {
      setToastVariant("danger");
      setToastMessage("Please select a company");
      setShowToast(true);
      return;
    }

    try {
      const costCentreData: ICostCentreCreate = {
        companyId: currentCostCentre.companyId,
        costCentreCode: currentCostCentre.costCentreCode,
        costCentreName: currentCostCentre.costCentreName,
        isActive: currentCostCentre.isActive,
        parentCostCentreId: currentCostCentre.parentCostCentreId,
      };

      let response: ICostCentreResponse;

      if (isEditMode) {
        // Update existing cost centre
        const costCentreToEdit = costCentres.find(
          (centre) =>
            centre.costCentreCode === currentCostCentre.costCentreCode &&
            centre.companyId === currentCostCentre.companyId
        );

        if (costCentreToEdit) {
          response = await costCentreService.updateCostCentre(
            costCentreToEdit.costCentreId,
            costCentreData
          );

          // Update the cost centre in the list
          setCostCentres(
            costCentres.map((centre) =>
              centre.costCentreId === costCentreToEdit.costCentreId
                ? response
                : centre
            )
          );

          setToastVariant("success");
          setToastMessage("Cost centre updated successfully");
        }
      } else {
        // Create new cost centre
        response = await costCentreService.createCostCentre(
          currentCostCentre.companyId,
          costCentreData
        );

        // Add the new cost centre to the list
        setCostCentres([...costCentres, response]);

        setToastVariant("success");
        setToastMessage("Cost centre created successfully");
      }

      setShowToast(true);
      setShowModal(false);
      setIsEditMode(false);

      // Reset form but keep the selected company
      setCurrentCostCentre({
        costCentreCode: "",
        costCentreName: "",
        isActive: true,
        companyId: currentCostCentre.companyId,
        parentCostCentreId: null,
      });
    } catch (error) {
      console.error(
        `Error ${isEditMode ? "updating" : "creating"} cost centre:`,
        error
      );
      setToastVariant("danger");
      setToastMessage(
        `Failed to ${isEditMode ? "update" : "create"} cost centre`
      );
      setShowToast(true);
    }
  };

  return (
    <Container className="mt-4 mb-5">
      <ToastContainer className="p-3" position="top-end">
        <Toast
          show={showToast}
          onClose={() => setShowToast(false)}
          bg={toastVariant}
          delay={3000}
          autohide
        >
          <Toast.Header closeButton={false}>
            <i
              className={`fas fa-${
                toastVariant === "success" ? "check" : "exclamation"
              }-circle me-2`}
            ></i>
            <strong className="me-auto">
              {toastVariant === "success" ? "Success" : "Error"}
            </strong>
          </Toast.Header>
          <Toast.Body className="text-white">{toastMessage}</Toast.Body>
        </Toast>
      </ToastContainer>

      <div className="page-header mb-4">
        <Row className="align-items-center">
          <Col md={8}>
            <h1 className="page-title mb-2">Cost Centre Setup</h1>
            <p className="text-muted mb-0">
              Configure and manage your organization's cost centres
            </p>
          </Col>
          <Col md={4} className="text-md-end">
            <Button variant="primary" onClick={handleAddCostCentre}>
              <FontAwesomeIcon icon={faPlus} className="me-2" />
              Add New Cost Centre
            </Button>
          </Col>
        </Row>
      </div>

      {/* Search and Filters */}
      <Card className="mb-4">
        <Card.Body>
          <Row className="g-3 align-items-center">
            <Col md={5}>
              <div className="input-group">
                <span className="input-group-text bg-white">
                  <FontAwesomeIcon icon={faSearch} className="text-muted" />
                </span>
                <Form.Control
                  type="text"
                  placeholder="Search cost centres..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </Col>
            <Col md={3}>
              <Form.Select
                value={companyFilter}
                onChange={(e) => setCompanyFilter(e.target.value)}
              >
                <option value="">All Companies</option>
                {companies.map((company) => (
                  <option key={company.companyId} value={company.companyId}>
                    {company.legalCompanyName}
                  </option>
                ))}
              </Form.Select>
            </Col>
            <Col md={2}>
              <Form.Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </Form.Select>
            </Col>
            <Col md={2} className="text-end">
              <Button
                variant="outline-secondary"
                onClick={() => {
                  setSearchTerm("");
                  setCompanyFilter("");
                  setStatusFilter("");
                }}
              >
                <FontAwesomeIcon icon={faRedoAlt} className="me-2" />
                Reset
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Cost Centre Form Modal */}
      <Modal
        show={showModal}
        onHide={() => {
          setShowModal(false);
          setIsEditMode(false);
          // Reset form
          setCurrentCostCentre({
            costCentreCode: "",
            costCentreName: "",
            isActive: true,
            companyId: 0,
            parentCostCentreId: null,
          });
        }}
        size="lg"
      >
        <Form onSubmit={handleSubmit}>
          <Modal.Header closeButton>
            <Modal.Title>
              {isEditMode ? "Edit Cost Centre" : "Add New Cost Centre"}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Row className="g-3">
              <Col md={12}>
                <Form.Group>
                  <Form.Label className="required-field">Company</Form.Label>
                  <Form.Select
                    value={currentCostCentre.companyId}
                    onChange={(e) => {
                      const value = parseInt(e.target.value);
                      setCurrentCostCentre({
                        ...currentCostCentre,
                        companyId: value,
                      });
                    }}
                    required
                  >
                    <option value="">Select Company</option>
                    {companies.map((company) => (
                      <option key={company.companyId} value={company.companyId}>
                        {company.legalCompanyName}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="required-field">
                    Cost Centre Code
                  </Form.Label>
                  <Form.Control
                    type="text"
                    value={currentCostCentre.costCentreCode}
                    onChange={(e) =>
                      setCurrentCostCentre({
                        ...currentCostCentre,
                        costCentreCode: e.target.value,
                      })
                    }
                    required
                    placeholder="Enter cost centre code"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="required-field">
                    Cost Centre Name
                  </Form.Label>
                  <Form.Control
                    type="text"
                    value={currentCostCentre.costCentreName}
                    onChange={(e) =>
                      setCurrentCostCentre({
                        ...currentCostCentre,
                        costCentreName: e.target.value,
                      })
                    }
                    required
                    placeholder="Enter cost centre name"
                  />
                </Form.Group>
              </Col>
              <Col md={12}>
                <Form.Group>
                  <Form.Label>Parent Cost Centre</Form.Label>
                  <Form.Select
                    value={
                      currentCostCentre.parentCostCentreId?.toString() || ""
                    }
                    onChange={(e) => {
                      const value = e.target.value
                        ? parseInt(e.target.value)
                        : null;
                      setCurrentCostCentre({
                        ...currentCostCentre,
                        parentCostCentreId: value,
                      });
                    }}
                  >
                    <option value="">None</option>
                    {costCentres.map((costCentre) => (
                      <option
                        key={costCentre.costCentreId}
                        value={costCentre.costCentreId}
                      >
                        {costCentre.costCentreName}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={12}>
                <Form.Check
                  type="switch"
                  id="cost-centre-status"
                  label="Active"
                  checked={currentCostCentre.isActive}
                  onChange={(e) =>
                    setCurrentCostCentre({
                      ...currentCostCentre,
                      isActive: e.target.checked,
                    })
                  }
                />
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              {isEditMode ? "Update Cost Centre" : "Save Cost Centre"}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Cost Centres Grid */}
      <Row className="g-4">
        {costCentres
          .filter(
            (costCentre) =>
              // Filter by search term
              (searchTerm === "" ||
                costCentre.costCentreCode
                  .toLowerCase()
                  .includes(searchTerm.toLowerCase()) ||
                costCentre.costCentreName
                  .toLowerCase()
                  .includes(searchTerm.toLowerCase())) &&
              // Filter by company
              (companyFilter === "" ||
                costCentre.companyId.toString() === companyFilter) &&
              // Filter by status
              (statusFilter === "" ||
                (statusFilter === "active" && costCentre.isActive) ||
                (statusFilter === "inactive" && !costCentre.isActive))
          )
          .map((costCentre) => (
            <Col md={6} lg={4} key={costCentre.costCentreId}>
              <Card className="h-100">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <Badge bg={costCentre.isActive ? "success" : "danger"}>
                      {costCentre.isActive ? "Active" : "Inactive"}
                    </Badge>
                    <Dropdown>
                      <Dropdown.Toggle variant="light" size="sm">
                        <i className="fas fa-ellipsis-v"></i>
                      </Dropdown.Toggle>
                      <Dropdown.Menu align="end">
                        <Dropdown.Item
                          onClick={() =>
                            handleEditCostCentre(costCentre.costCentreId)
                          }
                        >
                          <FontAwesomeIcon icon={faEdit} className="me-2" />
                          Edit
                        </Dropdown.Item>
                        <Dropdown.Item
                          onClick={() =>
                            handleDeleteCostCentre(costCentre.costCentreId)
                          }
                        >
                          <FontAwesomeIcon icon={faTrashAlt} className="me-2" />
                          Delete
                        </Dropdown.Item>
                      </Dropdown.Menu>
                    </Dropdown>
                  </div>
                  <h5 className="card-title">{costCentre.costCentreName}</h5>
                  <div className="text-muted mb-3">
                    <span className="d-block">
                      <FontAwesomeIcon icon={faLayerGroup} className="me-2" />
                      <strong>Cost Centre Code:</strong>{" "}
                      {costCentre.costCentreCode}
                    </span>
                    {costCentre.parentCostCentreName && (
                      <span className="d-block mt-1">
                        <FontAwesomeIcon icon={faSitemap} className="me-2" />
                        <strong>Parent Cost Centre:</strong>{" "}
                        {costCentre.parentCostCentreName}
                      </span>
                    )}
                  </div>
                  <div className="d-flex align-items-center mt-3">
                    <FontAwesomeIcon
                      icon={faBuilding}
                      className="me-2 text-secondary"
                    />
                    <span className="text-muted">
                      Company ID: {costCentre.companyId}
                    </span>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
      </Row>
    </Container>
  );
};

export default CostCentre;
