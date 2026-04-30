import React, { useState, useEffect } from "react";
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
  faBuilding,
  faEdit,
  faEye,
  faList,
  faTh,
  faMapMarkerAlt,
  faPhone,
  faEnvelope,
  faGlobe,
  faTrash,
  faExclamationTriangle,
} from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import { companyListService } from "../services/companyList.service";
import { apiTestService } from "../services/apiTest.service";
import { ICompanyListItem } from "../interfaces/companyList.types";

const CompaniesListView: React.FC = () => {
  const navigate = useNavigate();
  const [companies, setCompanies] = useState<ICompanyListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredCompanies, setFilteredCompanies] = useState<
    ICompanyListItem[]
  >([]);
  const [viewMode, setViewMode] = useState<"list" | "card">("list");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [companyToDelete, setCompanyToDelete] =
    useState<ICompanyListItem | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        console.log("Fetching companies from API...");

        // First, test endpoints to find the working one
        const testResult = await apiTestService.testEndpoints();
        if (testResult) {
          console.log("Using working endpoint:", testResult.endpoint);
          // If we found a working endpoint, use its data
          const companiesData = testResult.data.data || testResult.data || [];
          setCompanies(companiesData);
          setFilteredCompanies(companiesData);
          setError(null);
        } else {
          // Fallback to original service
          const response = await companyListService.getCompanies();
          console.log("API Response:", response);
          setCompanies(response.data || []);
          setFilteredCompanies(response.data || []);
          setError(null);
        }
      } catch (error) {
        console.error("Error fetching companies:", error);
        setError(
          error instanceof Error ? error.message : "Failed to fetch companies",
        );
      } finally {
        setLoading(false);
      }
    };
    fetchCompanies();
  }, []);

  useEffect(() => {
    const filtered = companies.filter(
      (company) =>
        company.legalCompanyName
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        company.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.state.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.pan.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.gstin.toLowerCase().includes(searchTerm.toLowerCase()),
    );
    setFilteredCompanies(filtered);
  }, [searchTerm, companies]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-GB");
  };

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
      setFilteredCompanies(
        updatedCompanies.filter(
          (company) =>
            company.legalCompanyName
              .toLowerCase()
              .includes(searchTerm.toLowerCase()) ||
            company.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
            company.state.toLowerCase().includes(searchTerm.toLowerCase()) ||
            company.pan.toLowerCase().includes(searchTerm.toLowerCase()) ||
            company.gstin.toLowerCase().includes(searchTerm.toLowerCase()),
        ),
      );

      // Close modal and reset state
      setShowDeleteModal(false);
      setCompanyToDelete(null);
    } catch (error) {
      console.error("Error deleting company:", error);
      setDeleteError(
        error instanceof Error ? error.message : "Failed to delete company",
      );
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setCompanyToDelete(null);
    setDeleteError(null);
  };

  if (loading) {
    return (
      <Container className="mt-4">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading companies...</p>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="mt-4">
        <div className="text-center">
          <div className="alert alert-danger" role="alert">
            <FontAwesomeIcon
              icon={faBuilding}
              size="2x"
              className="text-danger mb-3"
            />
            <h5>Error Loading Companies</h5>
            <p>{error}</p>
            <Button variant="primary" onClick={() => window.location.reload()}>
              Retry
            </Button>
          </div>
        </div>
      </Container>
    );
  }

  return (
    <Container className="mt-4 mb-5">
      {/* Compact Header Section - Redesigned */}
      <Card
        className="mb-4 shadow-sm"
        style={{ border: "none", borderRadius: "8px" }}
      >
        <Card.Body className="p-3">
          <Row className="align-items-center g-3">
            {/* Title Section */}
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
                  <FontAwesomeIcon
                    icon={faBuilding}
                    className="text-white"
                    size="lg"
                  />
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
                    Companies
                  </h4>
                  <small className="text-muted" style={{ fontSize: "12px" }}>
                    Management
                  </small>
                </div>
              </div>
            </Col>

            {/* Search Bar */}
            <Col lg={5} md={12}>
              <InputGroup
                size="sm"
                style={{ borderRadius: "6px", overflow: "hidden" }}
              >
                <InputGroup.Text
                  style={{ background: "#f8f9fa", border: "1px solid #dee2e6" }}
                >
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

            {/* Add New Company Button & View Toggle */}
            <Col
              lg={4}
              md={12}
              className="d-flex align-items-center gap-2 justify-content-lg-end justify-content-md-between"
            >
              <ButtonGroup size="sm">
                <Button
                  variant={
                    viewMode === "list" ? "primary" : "outline-secondary"
                  }
                  onClick={() => setViewMode("list")}
                  className="d-none d-sm-block"
                  style={{
                    fontSize: "12px",
                    padding: "6px 12px",
                    fontWeight: 500,
                  }}
                >
                  <FontAwesomeIcon icon={faList} className="me-1" />
                  List
                </Button>
                <Button
                  variant={
                    viewMode === "card" ? "primary" : "outline-secondary"
                  }
                  onClick={() => setViewMode("card")}
                  className="d-none d-sm-block"
                  style={{
                    fontSize: "12px",
                    padding: "6px 12px",
                    fontWeight: 500,
                  }}
                >
                  <FontAwesomeIcon icon={faTh} className="me-1" />
                  Cards
                </Button>
              </ButtonGroup>

              {/* Modern Add Button */}
              <Button
                onClick={() => navigate("/erp-setup/company-create")}
                style={{
                  background:
                    "linear-gradient(135deg, #0066ff 0%, #003d99 100%)",
                  border: "none",
                  borderRadius: "6px",
                  padding: "8px 16px",
                  fontWeight: 600,
                  fontSize: "13px",
                  boxShadow: "0 2px 6px rgba(0, 102, 255, 0.15)",
                  transition: "all 0.3s ease",
                  whiteSpace: "nowrap",
                }}
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
                className="text-white"
              >
                <FontAwesomeIcon icon={faPlus} className="me-2" />
                Add Company
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Stats Bar */}
      <Row className="mb-3">
        <Col xs={12}>
          <div
            className="d-flex align-items-center justify-content-between"
            style={{ padding: "0 8px" }}
          >
            <div>
              <span className="text-muted" style={{ fontSize: "13px" }}>
                Total: <strong>{filteredCompanies.length}</strong> companies
              </span>
            </div>
            <Badge
              style={{
                background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                padding: "6px 12px",
                fontSize: "12px",
                fontWeight: 600,
              }}
            >
              {filteredCompanies.length} Active
            </Badge>
          </div>
        </Col>
      </Row>

      {/* Companies Content */}
      <Card
        className="shadow-sm"
        style={{ border: "none", borderRadius: "8px" }}
      >
        <Card.Header
          className="bg-white"
          style={{
            borderBottom: "1px solid #e9ecef",
            borderRadius: "8px 8px 0 0",
          }}
        >
          <h5
            className="mb-0"
            style={{ fontSize: "15px", fontWeight: 600, color: "#1a1a1a" }}
          >
            Companies {viewMode === "list" ? "List" : "Cards"}
          </h5>
        </Card.Header>
        <Card.Body className="p-0">
          {filteredCompanies.length === 0 ? (
            <div className="text-center py-5">
              <FontAwesomeIcon
                icon={faBuilding}
                size="3x"
                className="text-muted mb-3"
              />
              <h5 className="text-muted">No companies found</h5>
              <p className="text-muted">
                {searchTerm
                  ? "Try adjusting your search criteria"
                  : "Start by adding your first company"}
              </p>
            </div>
          ) : viewMode === "list" ? (
            <div className="table-responsive">
              <Table className="mb-0" hover>
                <thead
                  style={{
                    background: "#f8f9fa",
                    borderBottom: "2px solid #dee2e6",
                  }}
                >
                  <tr>
                    <th
                      style={{
                        fontSize: "12px",
                        fontWeight: 600,
                        color: "#495057",
                        padding: "12px",
                      }}
                    >
                      Company Name
                    </th>
                    <th
                      style={{
                        fontSize: "12px",
                        fontWeight: 600,
                        color: "#495057",
                        padding: "12px",
                      }}
                    >
                      Legal Entity Type
                    </th>
                    <th
                      style={{
                        fontSize: "12px",
                        fontWeight: 600,
                        color: "#495057",
                        padding: "12px",
                      }}
                    >
                      Location
                    </th>
                    <th
                      style={{
                        fontSize: "12px",
                        fontWeight: 600,
                        color: "#495057",
                        padding: "12px",
                      }}
                    >
                      PAN
                    </th>
                    <th
                      style={{
                        fontSize: "12px",
                        fontWeight: 600,
                        color: "#495057",
                        padding: "12px",
                      }}
                    >
                      GSTIN
                    </th>
                    <th
                      style={{
                        fontSize: "12px",
                        fontWeight: 600,
                        color: "#495057",
                        padding: "12px",
                      }}
                    >
                      Currency
                    </th>
                    <th
                      style={{
                        fontSize: "12px",
                        fontWeight: 600,
                        color: "#495057",
                        padding: "12px",
                      }}
                    >
                      Created Date
                    </th>
                    <th
                      style={{
                        fontSize: "12px",
                        fontWeight: 600,
                        color: "#495057",
                        padding: "12px",
                      }}
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCompanies.map((company, idx) => (
                    <tr
                      key={company.companyId}
                      style={{
                        borderBottom: "1px solid #e9ecef",
                        backgroundColor: idx % 2 === 0 ? "#ffffff" : "#f8f9fa",
                      }}
                    >
                      <td style={{ padding: "12px" }}>
                        <div>
                          <strong
                            style={{ color: "#1a1a1a", fontSize: "14px" }}
                          >
                            {company.legalCompanyName}
                          </strong>
                          {company.emailAddress && (
                            <div className="small text-muted">
                              {company.emailAddress}
                            </div>
                          )}
                        </div>
                      </td>
                      <td style={{ padding: "12px" }}>
                        <Badge
                          style={{
                            background:
                              "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
                            color: "#ffffff",
                            fontSize: "11px",
                            fontWeight: 600,
                            padding: "6px 10px",
                            textTransform: "capitalize",
                          }}
                        >
                          {company.legalEntityType.replace("_", " ")}
                        </Badge>
                      </td>
                      <td style={{ padding: "12px" }}>
                        <div>
                          <div style={{ color: "#1a1a1a", fontSize: "14px" }}>
                            {company.city}
                          </div>
                          <small className="text-muted">
                            {company.state} - {company.pincode}
                          </small>
                        </div>
                      </td>
                      <td style={{ padding: "12px" }}>
                        <code
                          style={{
                            background: "#f0f4ff",
                            color: "#0066ff",
                            padding: "4px 8px",
                            borderRadius: "4px",
                            fontSize: "12px",
                            fontFamily: "monospace",
                          }}
                        >
                          {company.pan}
                        </code>
                      </td>
                      <td style={{ padding: "12px" }}>
                        <code
                          style={{
                            background: "#f0f4ff",
                            color: "#0066ff",
                            padding: "4px 8px",
                            borderRadius: "4px",
                            fontSize: "12px",
                            fontFamily: "monospace",
                          }}
                        >
                          {company.gstin}
                        </code>
                      </td>
                      <td style={{ padding: "12px" }}>
                        <Badge
                          style={{
                            background:
                              "linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)",
                            color: "#ffffff",
                            fontSize: "11px",
                            fontWeight: 600,
                            padding: "6px 10px",
                          }}
                        >
                          {company.baseCurrency}
                        </Badge>
                      </td>
                      <td style={{ padding: "12px" }}>
                        <small style={{ color: "#6c757d", fontSize: "13px" }}>
                          {formatDate(company.createdAt)}
                        </small>
                      </td>
                      <td style={{ padding: "12px" }}>
                        <div className="d-flex gap-1">
                          <Button
                            variant="light"
                            size="sm"
                            title="View Details"
                            onClick={() =>
                              navigate(
                                `/erp-setup?id=${company.companyId}&mode=view`,
                              )
                            }
                            style={{
                              background: "#f0f4ff",
                              color: "#0066ff",
                              border: "none",
                              fontSize: "12px",
                              padding: "6px 10px",
                              fontWeight: 500,
                              transition: "all 0.2s ease",
                            }}
                            onMouseEnter={(e) => {
                              const target = e.currentTarget as HTMLElement;
                              target.style.background = "#0066ff";
                              target.style.color = "#ffffff";
                            }}
                            onMouseLeave={(e) => {
                              const target = e.currentTarget as HTMLElement;
                              target.style.background = "#f0f4ff";
                              target.style.color = "#0066ff";
                            }}
                          >
                            <FontAwesomeIcon icon={faEye} />
                          </Button>
                          <Button
                            variant="light"
                            size="sm"
                            title="Edit Company"
                            onClick={() =>
                              navigate(
                                `/erp-setup?id=${company.companyId}&mode=edit`,
                              )
                            }
                            style={{
                              background: "#f5f5f5",
                              color: "#6c757d",
                              border: "none",
                              fontSize: "12px",
                              padding: "6px 10px",
                              fontWeight: 500,
                              transition: "all 0.2s ease",
                            }}
                            onMouseEnter={(e) => {
                              const target = e.currentTarget as HTMLElement;
                              target.style.background = "#6c757d";
                              target.style.color = "#ffffff";
                            }}
                            onMouseLeave={(e) => {
                              const target = e.currentTarget as HTMLElement;
                              target.style.background = "#f5f5f5";
                              target.style.color = "#6c757d";
                            }}
                          >
                            <FontAwesomeIcon icon={faEdit} />
                          </Button>
                          <Button
                            variant="light"
                            size="sm"
                            title="Delete Company"
                            onClick={() => handleDeleteClick(company)}
                            style={{
                              background: "#ffe6e6",
                              color: "#dc3545",
                              border: "none",
                              fontSize: "12px",
                              padding: "6px 10px",
                              fontWeight: 500,
                              transition: "all 0.2s ease",
                            }}
                            onMouseEnter={(e) => {
                              const target = e.currentTarget as HTMLElement;
                              target.style.background = "#dc3545";
                              target.style.color = "#ffffff";
                            }}
                            onMouseLeave={(e) => {
                              const target = e.currentTarget as HTMLElement;
                              target.style.background = "#ffe6e6";
                              target.style.color = "#dc3545";
                            }}
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
            <div className="p-4">
              <Row className="g-4">
                {filteredCompanies.map((company) => (
                  <Col md={6} lg={4} key={company.companyId}>
                    <Card
                      className="company-card h-100"
                      style={{
                        border: "none",
                        borderRadius: "10px",
                        overflow: "hidden",
                        background: "#ffffff",
                        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.08)",
                        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                        cursor: "pointer",
                        position: "relative",
                        display: "flex",
                        flexDirection: "column",
                      }}
                      onMouseEnter={(e) => {
                        const target = e.currentTarget as HTMLElement;
                        target.style.boxShadow =
                          "0 8px 24px rgba(0, 102, 255, 0.15)";
                        target.style.transform = "translateY(-4px)";
                      }}
                      onMouseLeave={(e) => {
                        const target = e.currentTarget as HTMLElement;
                        target.style.boxShadow =
                          "0 1px 3px rgba(0, 0, 0, 0.08)";
                        target.style.transform = "translateY(0)";
                      }}
                    >
                      {/* Card Top Border */}
                      <div
                        style={{
                          height: "4px",
                          background:
                            "linear-gradient(135deg, #0066ff 0%, #003d99 100%)",
                        }}
                      />

                      <Card.Body
                        style={{
                          padding: "16px",
                          flex: "1 1 auto",
                          display: "flex",
                          flexDirection: "column",
                        }}
                      >
                        <div style={{ flex: "1 1 auto" }}>
                          <div className="d-flex justify-content-between align-items-center mb-3">
                            <Badge
                              style={{
                                background:
                                  "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                                color: "#ffffff",
                                fontSize: "11px",
                                fontWeight: 600,
                                padding: "6px 10px",
                              }}
                            >
                              Active
                            </Badge>
                            <small
                              style={{
                                color: "#6c757d",
                                fontSize: "12px",
                                textTransform: "capitalize",
                              }}
                            >
                              {company.legalEntityType.replace("_", " ")}
                            </small>
                          </div>

                          <h5
                            className="card-title"
                            style={{
                              fontSize: "16px",
                              fontWeight: 600,
                              color: "#1a1a1a",
                              marginBottom: "12px",
                              lineHeight: "1.4",
                            }}
                          >
                            {company.legalCompanyName}
                          </h5>

                          <div style={{ marginBottom: "12px" }}>
                            <small
                              style={{
                                color: "#6c757d",
                                fontSize: "12px",
                                display: "block",
                                marginBottom: "6px",
                              }}
                            >
                              <span style={{ fontWeight: 600 }}>PAN:</span>{" "}
                              {company.pan}
                            </small>
                            <small
                              style={{
                                color: "#6c757d",
                                fontSize: "12px",
                                display: "block",
                              }}
                            >
                              <span style={{ fontWeight: 600 }}>GSTIN:</span>{" "}
                              {company.gstin}
                            </small>
                          </div>

                          <div
                            style={{
                              marginBottom: "12px",
                              paddingTop: "12px",
                              borderTop: "1px solid #e9ecef",
                            }}
                          >
                            <small
                              style={{
                                color: "#6c757d",
                                fontSize: "12px",
                                display: "block",
                                marginBottom: "6px",
                              }}
                            >
                              <FontAwesomeIcon
                                icon={faMapMarkerAlt}
                                className="me-2"
                              />
                              <span style={{ fontWeight: 600 }}>Address:</span>
                            </small>
                            <small
                              style={{
                                color: "#6c757d",
                                fontSize: "12px",
                                lineHeight: "1.5",
                              }}
                            >
                              {company.registeredAddressLine1}
                              {company.registeredAddressLine2 && (
                                <>
                                  <br />
                                  {company.registeredAddressLine2}
                                </>
                              )}
                              <br />
                              {company.city}, {company.state} -{" "}
                              {company.pincode}
                            </small>
                          </div>

                          <div style={{ marginBottom: "12px" }}>
                            <small
                              style={{
                                color: "#6c757d",
                                fontSize: "12px",
                                display: "block",
                                marginBottom: "3px",
                              }}
                            >
                              <FontAwesomeIcon
                                icon={faPhone}
                                className="me-2"
                              />
                              {company.phoneNumber}
                            </small>
                            <small
                              style={{
                                color: "#6c757d",
                                fontSize: "12px",
                                display: "block",
                                marginBottom: "3px",
                              }}
                            >
                              <FontAwesomeIcon
                                icon={faEnvelope}
                                className="me-2"
                              />
                              {company.emailAddress}
                            </small>
                            {company.websiteUrl && (
                              <small
                                style={{
                                  color: "#6c757d",
                                  fontSize: "12px",
                                  display: "block",
                                }}
                              >
                                <FontAwesomeIcon
                                  icon={faGlobe}
                                  className="me-2"
                                />
                                <a
                                  href={company.websiteUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  style={{
                                    color: "#0066ff",
                                    textDecoration: "none",
                                  }}
                                >
                                  {company.websiteUrl}
                                </a>
                              </small>
                            )}
                          </div>
                        </div>

                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            paddingTop: "12px",
                            borderTop: "1px solid #e9ecef",
                            marginTop: "12px",
                            flex: "0 0 auto",
                          }}
                        >
                          <div>
                            <Badge
                              style={{
                                background:
                                  "linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)",
                                color: "#ffffff",
                                fontSize: "11px",
                                fontWeight: 600,
                                padding: "6px 10px",
                              }}
                            >
                              {company.baseCurrency}
                            </Badge>
                          </div>
                          <div className="d-flex gap-2">
                            <Button
                              variant="light"
                              size="sm"
                              title="View Details"
                              onClick={() =>
                                navigate(
                                  `/erp-setup?id=${company.companyId}&mode=view`,
                                )
                              }
                              style={{
                                background: "#f0f4ff",
                                color: "#0066ff",
                                border: "none",
                                fontSize: "12px",
                                padding: "6px 10px",
                                fontWeight: 500,
                                transition: "all 0.2s ease",
                              }}
                              onMouseEnter={(e) => {
                                const target = e.currentTarget as HTMLElement;
                                target.style.background = "#0066ff";
                                target.style.color = "#ffffff";
                              }}
                              onMouseLeave={(e) => {
                                const target = e.currentTarget as HTMLElement;
                                target.style.background = "#f0f4ff";
                                target.style.color = "#0066ff";
                              }}
                            >
                              <FontAwesomeIcon icon={faEye} />
                            </Button>
                            <Button
                              variant="light"
                              size="sm"
                              title="Edit Company"
                              onClick={() =>
                                navigate(
                                  `/erp-setup?id=${company.companyId}&mode=edit`,
                                )
                              }
                              style={{
                                background: "#f5f5f5",
                                color: "#6c757d",
                                border: "none",
                                fontSize: "12px",
                                padding: "6px 10px",
                                fontWeight: 500,
                                transition: "all 0.2s ease",
                              }}
                              onMouseEnter={(e) => {
                                const target = e.currentTarget as HTMLElement;
                                target.style.background = "#6c757d";
                                target.style.color = "#ffffff";
                              }}
                              onMouseLeave={(e) => {
                                const target = e.currentTarget as HTMLElement;
                                target.style.background = "#f5f5f5";
                                target.style.color = "#6c757d";
                              }}
                            >
                              <FontAwesomeIcon icon={faEdit} />
                            </Button>
                            <Button
                              variant="light"
                              size="sm"
                              title="Delete Company"
                              onClick={() => handleDeleteClick(company)}
                              style={{
                                background: "#ffe6e6",
                                color: "#dc3545",
                                border: "none",
                                fontSize: "12px",
                                padding: "6px 10px",
                                fontWeight: 500,
                                transition: "all 0.2s ease",
                              }}
                              onMouseEnter={(e) => {
                                const target = e.currentTarget as HTMLElement;
                                target.style.background = "#dc3545";
                                target.style.color = "#ffffff";
                              }}
                              onMouseLeave={(e) => {
                                const target = e.currentTarget as HTMLElement;
                                target.style.background = "#ffe6e6";
                                target.style.color = "#dc3545";
                              }}
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
    </Container>
  );
};

export default CompaniesListView;
