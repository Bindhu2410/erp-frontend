import React, { useState, useEffect } from "react";
import {
  Container, Row, Col, Card, Form, Button, Spinner, Alert, Tabs, Tab,
} from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSave, faArrowLeft, faInfoCircle, faSitemap, faShieldAlt,
} from "@fortawesome/free-solid-svg-icons";
import { TbCoinRupee } from "react-icons/tb";
import { useNavigate, useParams } from "react-router-dom";
import { costCentreService } from "../services/costcentre.service";
import { ICostCentreResponse, ICostCentreCreate } from "../interfaces/costcentre.types";

const CostCentreEdit: React.FC = () => {
  const { costCentreId } = useParams<{ costCentreId: string }>();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState<ICostCentreCreate | null>(null);
  const [parents, setParents] = useState<ICostCentreResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const id = parseInt(costCentreId as string);
        const [targetRes, allRes] = await Promise.all([
          costCentreService.getCostCentreById(id),
          costCentreService.getAllCostCentres()
        ]);
        
        const target = targetRes.data;
        setFormData({
          costCentreCode: target.costCentreCode,
          costCentreName: target.costCentreName,
          isActive: target.isActive,
          companyId: target.companyId,
          parentCostCentreId: target.parentCostCentreId,
        });
        
        // Filter out the current cost centre from the parent list to avoid self-referral
        setParents(allRes.filter((c: any) => c.costCentreId !== id && c.companyId === target.companyId));
      } catch (err) {
        setError("Failed to fetch cost centre details.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [costCentreId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    if (!formData) return;
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : (name === "parentCostCentreId" ? (value === "" ? null : parseInt(value)) : value),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      await costCentreService.updateCostCentre(parseInt(costCentreId as string), formData);
      setSuccess("Cost centre updated successfully!");
      setTimeout(() => navigate(`/erp-setup/cost-centre-view/${costCentreId}`), 1500);
    } catch (err: any) {
      setError(err.message || "Failed to update cost centre.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-center py-5"><Spinner animation="border" variant="primary" /><p className="mt-2 text-muted">Loading unit records...</p></div>;
  if (!formData) return <Container className="mt-4"><Alert variant="danger">Unit not found.</Alert></Container>;

  return (
    <Container className="mt-4 mb-5">
      <div className="mb-4 d-flex align-items-center justify-content-between">
        <div className="d-flex align-items-center">
            <Button variant="light" onClick={() => navigate(-1)} className="rounded-circle me-3 border"><FontAwesomeIcon icon={faArrowLeft} /></Button>
            <div>
                <h1 className="h3 mb-0" style={{ fontWeight: 800 }}>Edit Unit: {formData.costCentreName}</h1>
                <p className="text-muted small mb-0">Updating financial mapping and hierarchy for aggregator #{costCentreId}</p>
            </div>
        </div>
      </div>

      <Form onSubmit={handleSubmit}>
        <Row>
          <Col lg={8}>
            <Card className="border-0 shadow-sm mb-4" style={{ borderRadius: "12px", overflow: "hidden" }}>
              <Card.Body className="p-0">
                <Tabs defaultActiveKey="basic" className="custom-edit-tabs px-3 pt-2 bg-light border-bottom">
                  <Tab eventKey="basic" title={<><FontAwesomeIcon icon={faInfoCircle} className="me-2" />Basic Attributes</>}>
                    <div className="p-4">
                      <Row className="g-4">
                        <Col md={6}>
                          <Form.Group>
                            <Form.Label style={{ fontSize: "12px", fontWeight: 700, color: "#4b4b4b" }}>UNIT NAME *</Form.Label>
                            <Form.Control name="costCentreName" value={formData.costCentreName} onChange={handleInputChange} required style={{ padding: "12px", borderRadius: "8px" }} />
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group>
                            <Form.Label style={{ fontSize: "12px", fontWeight: 700, color: "#4b4b4b" }}>CENTRE CODE *</Form.Label>
                            <Form.Control name="costCentreCode" value={formData.costCentreCode} onChange={handleInputChange} required style={{ padding: "12px", borderRadius: "8px" }} />
                          </Form.Group>
                        </Col>
                        <Col md={12}>
                           <div className="p-3 rounded-2 bg-light border mt-2">
                              <Form.Check type="switch" id="active-switch" label={formData.isActive ? "Current Status: Active" : "Current Status: Inactive"} name="isActive" checked={formData.isActive} onChange={handleInputChange} style={{ fontWeight: 600 }} />
                              <small className="text-muted d-block mt-1 ps-5">Inactive units will be hidden from expense allocation dropdowns.</small>
                           </div>
                        </Col>
                      </Row>
                    </div>
                  </Tab>
                  <Tab eventKey="hierarchy" title={<><FontAwesomeIcon icon={faSitemap} className="me-2" />Structural Settings</>}>
                    <div className="p-4">
                      <Form.Group>
                        <Form.Label style={{ fontSize: "12px", fontWeight: 700, color: "#4b4b4b" }}>PARENT UNIT REPRESENTATION</Form.Label>
                        <Form.Select name="parentCostCentreId" value={formData.parentCostCentreId || ""} onChange={handleInputChange} style={{ padding: "12px", borderRadius: "8px" }}>
                          <option value="">Top Level (Independent Unit)</option>
                          {parents.map(p => <option key={p.costCentreId} value={p.costCentreId}>{p.costCentreName} ({p.costCentreCode})</option>)}
                        </Form.Select>
                        <Form.Text className="text-muted small mt-2 d-block">Defining a parent creates a tree structure for consolidated financial reporting.</Form.Text>
                      </Form.Group>
                    </div>
                  </Tab>
                </Tabs>
              </Card.Body>
            </Card>
          </Col>

          <Col lg={4}>
            <Card className="border-0 shadow-sm mb-4" style={{ borderRadius: "12px" }}>
              <Card.Header className="bg-white py-3 border-0"><h6 className="mb-0" style={{ fontWeight: 700 }}>Action Control</h6></Card.Header>
              <Card.Body className="p-4">
                {error && <Alert variant="danger" className="border-0 small mb-3">{error}</Alert>}
                {success && <Alert variant="success" className="border-0 small mb-3">{success}</Alert>}
                <Button
                  type="submit"
                  disabled={saving}
                  style={{ background: "linear-gradient(135deg, #0d6efd 0%, #0a58ca 100%)", border: "none", width: "100%", padding: "14px", fontWeight: 700, borderRadius: "10px" }}
                  className="text-white mb-3 shadow-sm"
                >
                  {saving ? <Spinner size="sm" className="me-2" /> : <FontAwesomeIcon icon={faSave} className="me-2" />}
                  Deploy Changes
                </Button>
                <Button variant="outline-secondary" className="w-100 py-2" style={{ fontWeight: 600, borderRadius: "8px" }} onClick={() => navigate(-1)}>Cancel Operation</Button>
              </Card.Body>
            </Card>

            <Card className="border-0 shadow-sm overflow-hidden" style={{ borderRadius: "12px", background: "#f8f9fa" }}>
              <Card.Body className="p-4">
                <div className="d-flex align-items-center mb-3">
                    <TbCoinRupee size="24" className="text-primary me-2" />
                    <h6 className="mb-0" style={{ fontWeight: 700 }}>Unit Stewardship</h6>
                </div>
                <p className="small text-muted mb-0">Modifying the cost centre will affect how operational expenses are tracked across the fiscal year. Changes are logged for audit purposes.</p>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Form>
      
      <style>{`
        .custom-edit-tabs .nav-link { border: none; color: #636e72; font-weight: 600; padding: 14px 24px; font-size: 13px; transition: all 0.2s; }
        .custom-edit-tabs .nav-link:hover { color: #0d6efd; background: rgba(13, 110, 253, 0.05); }
        .custom-edit-tabs .nav-link.active { color: #0d6efd; border-bottom: 3px solid #0d6efd; background: white; margin-bottom: -1px; }
      `}</style>
    </Container>
  );
};

export default CostCentreEdit;
