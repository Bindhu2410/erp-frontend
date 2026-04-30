import React, { useState, useEffect } from "react";
import {
  Container, Row, Col, Card, Badge, Button, Spinner, Alert,
} from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBuilding, faMapMarkerAlt, faPhone, faEnvelope, faGlobe,
  faEdit, faArrowLeft, faFileInvoice, faClock, faGlobeAmericas,
  faUniversity, faMoneyBillWave, faShieldAlt, faCreditCard, faCalculator,
} from "@fortawesome/free-solid-svg-icons";
import { useNavigate, useParams } from "react-router-dom";
import { companyListService } from "../services/companyList.service";
import { ICompanyListItem } from "../interfaces/companyList.types";

const CompanyView: React.FC = () => {
  const { companyId } = useParams<{ companyId: string }>();
  const navigate = useNavigate();
  const [company, setCompany] = useState<ICompanyListItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCompany = async () => {
      if (!companyId) {
        setError("Company ID is required");
        setLoading(false);
        return;
      }
      try {
        const response = await companyListService.getCompanyById(Number(companyId));
        if (response.data) {
          setCompany(response.data);
        } else {
          setError("Company not found");
        }
      } catch (error) {
        console.error("Error fetching company:", error);
        setError("Failed to load company details");
      } finally {
        setLoading(false);
      }
    };
    fetchCompany();
  }, [companyId]);

  if (loading) return <div className="text-center py-5"><Spinner animation="border" variant="primary" /><p className="mt-2 text-muted">Loading company profile...</p></div>;
  if (error || !company) return (
    <Container className="mt-5">
      <Alert variant="danger" className="border-0 shadow-sm rounded-3">
        <h5 className="font-weight-bold">Error</h5>
        <p>{error || "Company not found"}</p>
        <Button variant="outline-danger" onClick={() => navigate("/erp-setup")} className="rounded-2">
          <FontAwesomeIcon icon={faArrowLeft} className="me-2" /> Back to Dashboard
        </Button>
      </Alert>
    </Container>
  );

  const DetailItem = ({ label, value, icon, col = 6 }: any) => (
    <Col md={col} className="mb-4">
      <div className="d-flex align-items-center">
        <div className="me-3 text-primary opacity-50" style={{ width: '24px', textAlign: 'center' }}>
          <FontAwesomeIcon icon={icon} size="lg" />
        </div>
        <div>
          <div className="text-muted" style={{ fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>{label}</div>
          <div style={{ fontSize: "15px", fontWeight: 600, color: "#1a1a1a" }}>{value || <span className="text-muted fw-normal small">Not Provided</span>}</div>
        </div>
      </div>
    </Col>
  );

  return (
    <Container className="mt-4 mb-5">
      {/* ── Header ────────────────────────────────────────────────────────── */}
      <Card className="mb-4 shadow-sm" style={{ border: "none", borderRadius: "12px", overflow: "hidden" }}>
        <Card.Body className="p-0">
          <div style={{ background: "linear-gradient(135deg, #0061f2 0%, #003d99 100%)", padding: "24px 32px" }}>
            <Row className="align-items-center g-3">
              <Col md={8}>
                <div className="d-flex align-items-center">
                  <div
                    style={{
                      width: "52px", height: "52px", borderRadius: "12px",
                      background: "rgba(255,255,255,0.2)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      marginRight: "20px", flexShrink: 0,
                    }}
                  >
                    <FontAwesomeIcon icon={faBuilding} className="text-white" size="xl" />
                  </div>
                  <div>
                    <h3 className="mb-1 text-white" style={{ fontWeight: 700, letterSpacing: "-0.5px" }}>
                      {company.legalCompanyName}
                    </h3>
                    <div className="d-flex gap-2">
                      <Badge bg="white" text="primary" style={{ fontWeight: 600, fontSize: "11px" }}>{company.legalEntityType.replace("_", " ").toUpperCase()}</Badge>
                      <Badge bg="transparent" className="border border-white-50 text-white-50" style={{ fontWeight: 500, fontSize: "11px" }}>#{company.companyId}</Badge>
                    </div>
                  </div>
                </div>
              </Col>
              <Col md={4} className="text-md-end">
                <Button
                  variant="light"
                  onClick={() => navigate("/erp-setup")}
                  className="me-2"
                  style={{ fontWeight: 600, borderRadius: "8px", padding: "8px 16px" }}
                >
                  <FontAwesomeIcon icon={faArrowLeft} className="me-2" />Dashboard
                </Button>
                <Button
                  style={{ background: "rgba(255,255,255,0.2)", border: "none", color: "#fff", fontWeight: 600, borderRadius: "8px", padding: "8px 16px" }}
                  onClick={() => navigate(`/erp-setup?id=${company.companyId}&mode=edit`)}
                >
                  <FontAwesomeIcon icon={faEdit} className="me-2" />Edit Profile
                </Button>
              </Col>
            </Row>
          </div>
        </Card.Body>
      </Card>

      <Row className="g-4">
        {/* ── Column 1: Core Info ─────────────────────────────────────────── */}
        <Col lg={8}>
          <Card className="border-0 shadow-sm mb-4" style={{ borderRadius: "12px" }}>
            <Card.Header className="bg-white border-0 py-3 px-4">
              <h5 className="mb-0" style={{ fontSize: "15px", fontWeight: 700, color: "#1a1a1a" }}>Registration & Legal Profile</h5>
            </Card.Header>
            <Card.Body className="px-4 pb-4 pt-1">
              <Row className="g-4">
                <DetailItem label="Legal Entity Name" value={company.legalCompanyName} icon={faBuilding} />
                <DetailItem label="Company Type" value={company.legalEntityType.replace("_", " ")} icon={faShieldAlt} />
                <DetailItem label="PAN Number" value={<span className="font-monospace text-primary">{company.pan}</span>} icon={faFileInvoice} />
                <DetailItem label="TAN Registration" value={<span className="font-monospace text-primary">{company.tan}</span>} icon={faCalculator} />
                <DetailItem label="Base Currency" value={company.baseCurrency} icon={faMoneyBillWave} />
                <DetailItem label="Legal Name on PAN" value={company.legalNameAsPerPanTan} icon={faShieldAlt} />
              </Row>
            </Card.Body>
          </Card>

          <Card className="border-0 shadow-sm mb-4" style={{ borderRadius: "12px" }}>
            <Card.Header className="bg-white border-0 py-3 px-4">
              <h5 className="mb-0" style={{ fontSize: "15px", fontWeight: 700, color: "#1a1a1a" }}>Address & Digital Presence</h5>
            </Card.Header>
            <Card.Body className="px-4 pb-4 pt-1">
              <Row>
                <Col md={12} className="mb-4">
                  <div className="p-3 bg-light rounded-3 d-flex align-items-start gap-3">
                    <div className="p-2 bg-white rounded-2 shadow-sm text-primary">
                      <FontAwesomeIcon icon={faMapMarkerAlt} size="lg" />
                    </div>
                    <div>
                      <div className="text-muted mb-1" style={{ fontSize: "11px", fontWeight: 600, textTransform: "uppercase" }}>Registered Office Address</div>
                      <div style={{ fontSize: "15px", color: "#1a1a1a" }}>
                        {company.registeredAddressLine1}<br />
                        {company.registeredAddressLine2 && <>{company.registeredAddressLine2}<br /></>}
                        {company.city}, {company.state} - <strong className="text-primary">{company.pincode}</strong>
                      </div>
                    </div>
                  </div>
                </Col>
                <DetailItem label="Official Email" value={<a href={`mailto:${company.emailAddress}`} className="text-primary text-decoration-none">{company.emailAddress}</a>} icon={faEnvelope} />
                <DetailItem label="Phone Number" value={company.phoneNumber} icon={faPhone} />
                <DetailItem label="Website / Domain" value={<a href={company.websiteUrl} target="_blank" rel="noreferrer" className="text-info text-decoration-none">{company.websiteUrl}</a>} icon={faGlobe} col={12} />
              </Row>
            </Card.Body>
          </Card>
        </Col>

        {/* ── Column 2: Sidebar Stats ────────────────────────────────────── */}
        <Col lg={4}>
          <Card className="border-0 shadow-sm mb-4" style={{ borderRadius: "12px", background: "#f8f9fa" }}>
            <Card.Body className="p-4">
              <h5 className="mb-4" style={{ fontSize: "14px", fontWeight: 700, color: "#1a1a1a" }}>
                <FontAwesomeIcon icon={faFileInvoice} className="me-2 text-primary" /> Tax Identifiers
              </h5>
              <div className="mb-4">
                <label className="text-muted d-block mb-1" style={{ fontSize: "11px", fontWeight: 600, textTransform: "uppercase" }}>GSTIN (Primary)</label>
                <div className="p-3 bg-white border border-light shadow-sm rounded-3 font-monospace text-primary text-center fw-bold" style={{ fontSize: "16px" }}>
                  {company.gstin}
                </div>
              </div>

              <div style={{ padding: "16px", background: "rgba(0,97,242,0.05)", borderRadius: "12px", border: "1px dashed rgba(0,97,242,0.2)" }}>
                <div className="d-flex align-items-center gap-3 mb-3">
                  <div className="p-2 bg-white rounded-2 text-primary shadow-sm"><FontAwesomeIcon icon={faClock} /></div>
                  <div>
                    <div className="text-muted" style={{ fontSize: "11px", fontWeight: 600 }}>FINANCIAL YEAR END</div>
                    <div className="small fw-bold">{new Date(company.financialYearEndDate).toLocaleDateString(undefined, { month: 'long', day: 'numeric' })}</div>
                  </div>
                </div>
                <div className="d-flex align-items-center gap-3">
                  <div className="p-2 bg-white rounded-2 text-primary shadow-sm"><FontAwesomeIcon icon={faUniversity} /></div>
                  <div>
                    <div className="text-muted" style={{ fontSize: "11px", fontWeight: 600 }}>BASE CURRENCY</div>
                    <div className="small fw-bold">{company.baseCurrency} - Indian Rupee</div>
                  </div>
                </div>
              </div>
            </Card.Body>
          </Card>

          <Card className="bg-dark text-white border-0 shadow-lg overflow-hidden mb-4" style={{ borderRadius: "12px" }}>
            <Card.Body className="p-4 position-relative">
              <div style={{ position: 'absolute', top: '-10px', right: '-10px', opacity: 0.1, transform: 'rotate(20deg)' }}>
                <FontAwesomeIcon icon={faClock} size="6x" />
              </div>
              <h6 className="mb-4 opacity-50" style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px" }}>System Metadata</h6>
              <div className="d-flex align-items-start gap-3">
                <div className="p-2 rounded-2" style={{ background: "rgba(255,255,255,0.1)" }}><FontAwesomeIcon icon={faShieldAlt} /></div>
                <div>
                  <div className="small fw-bold">Active & Compliant</div>
                  <div style={{ fontSize: "11px", opacity: 0.6 }}>Last updated on {new Date().toLocaleDateString()}</div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default CompanyView;