import React, { useState, useEffect } from "react";
import {
  Container, Row, Col, Card, Form, Button, Spinner, Alert, Tabs, Tab,
} from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSave, faArrowLeft, faInfoCircle, faWeightHanging,
} from "@fortawesome/free-solid-svg-icons";
import { TbLocationCog } from "react-icons/tb";
import { useNavigate, useParams } from "react-router-dom";
import { inventoryLocationService, IInventoryLocationDto } from "../services/inventoryLocation.service";

const CATEGORIES = ["Rack", "Shelf", "Bin", "Zone", "Aisle", "Floor", "Container"];

const InventoryLocationEdit: React.FC = () => {
  const { locationId } = useParams<{ locationId: string }>();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<IInventoryLocationDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const fetchLocation = async () => {
      try {
        const res = await inventoryLocationService.getLocationById(parseInt(locationId as string));
        setFormData(res.data.data);
      } catch (err) {
        setError("Failed to fetch location details");
      } finally {
        setLoading(false);
      }
    };
    fetchLocation();
  }, [locationId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    if (!formData) return;
    const { name, value } = e.target;
    const numericFields = ["capacityWeight", "capacityVolume", "capacityItemCount"];
    setFormData({
      ...formData,
      [name]: numericFields.includes(name) ? (value === "" ? 0 : parseFloat(value)) : value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      await inventoryLocationService.updateLocation(formData.locationId, formData);
      setSuccess("Changes saved successfully!");
      setTimeout(() => navigate(`/erp-setup/inventory-location-view/${formData.locationId}`), 1500);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to update location");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-center py-5"><Spinner animation="border" variant="primary" /><p className="mt-2 text-muted">Loading location data...</p></div>;
  if (!formData) return <Container className="mt-4"><Alert variant="danger">Location not found</Alert></Container>;

  return (
    <Container className="mt-4 mb-5">
      <div className="mb-4">
        <Button
          variant="outline-secondary"
          onClick={() => navigate(-1)}
          className="mb-3 border-0 bg-transparent ps-0 text-muted"
          style={{ fontSize: "13px", fontWeight: 500 }}
        >
          <FontAwesomeIcon icon={faArrowLeft} className="me-2" />Back
        </Button>
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h1 style={{ fontSize: "24px", fontWeight: 700, color: "#1a1a1a", marginBottom: "4px" }}>
              Edit Location: {formData.locationName}
            </h1>
            <p style={{ fontSize: "13px", color: "#6c757d", marginBottom: 0 }}>Update inventory coordinates and capacity limits</p>
          </div>
        </div>
      </div>

      <Form onSubmit={handleSubmit}>
        <Row>
          <Col lg={8}>
            <Card className="border-0 shadow-sm mb-4" style={{ borderRadius: "10px" }}>
              <Card.Body className="p-0">
                <Tabs defaultActiveKey="basic" className="custom-tabs px-3 pt-2">
                  <Tab eventKey="basic" title={<><FontAwesomeIcon icon={faInfoCircle} className="me-2" />Basic Info</>}>
                    <div className="p-4">
                      <Row className="g-3">
                        <Col md={6}>
                          <Form.Group>
                            <Form.Label style={{ fontSize: "13px", fontWeight: 600 }}>Location Name *</Form.Label>
                            <Form.Control name="locationName" value={formData.locationName} onChange={handleInputChange} required />
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group>
                            <Form.Label style={{ fontSize: "13px", fontWeight: 600 }}>Location Code *</Form.Label>
                            <Form.Control name="locationCode" value={formData.locationCode} onChange={handleInputChange} required />
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group>
                            <Form.Label style={{ fontSize: "13px", fontWeight: 600 }}>Category</Form.Label>
                            <Form.Select name="locationCategory" value={formData.locationCategory || ""} onChange={handleInputChange}>
                              <option value="">Select Category</option>
                              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                            </Form.Select>
                          </Form.Group>
                        </Col>
                      </Row>
                    </div>
                  </Tab>
                  <Tab eventKey="capacity" title={<><FontAwesomeIcon icon={faWeightHanging} className="me-2" />Capacity Limits</>}>
                    <div className="p-4">
                      <Row className="g-3">
                        <Col md={6}>
                          <Form.Group>
                            <Form.Label style={{ fontSize: "13px", fontWeight: 600 }}>Max Weight</Form.Label>
                            <div className="d-flex gap-2">
                              <Form.Control type="number" name="capacityWeight" value={formData.capacityWeight} onChange={handleInputChange} />
                              <Form.Select name="capacityWeightUom" value={formData.capacityWeightUom || "kg"} onChange={handleInputChange} style={{ width: "100px" }}>
                                <option value="kg">kg</option><option value="lb">lb</option>
                              </Form.Select>
                            </div>
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group>
                            <Form.Label style={{ fontSize: "13px", fontWeight: 600 }}>Max Volume</Form.Label>
                            <div className="d-flex gap-2">
                              <Form.Control type="number" name="capacityVolume" value={formData.capacityVolume} onChange={handleInputChange} />
                              <Form.Select name="capacityVolumeUom" value={formData.capacityVolumeUom || "m3"} onChange={handleInputChange} style={{ width: "100px" }}>
                                <option value="m3">m³</option><option value="ft3">ft³</option>
                              </Form.Select>
                            </div>
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group>
                            <Form.Label style={{ fontSize: "13px", fontWeight: 600 }}>Max Item Count</Form.Label>
                            <Form.Control type="number" name="capacityItemCount" value={formData.capacityItemCount} onChange={handleInputChange} />
                          </Form.Group>
                        </Col>
                      </Row>
                    </div>
                  </Tab>
                </Tabs>
              </Card.Body>
            </Card>
          </Col>

          <Col lg={4}>
            <Card className="border-0 shadow-sm mb-4" style={{ borderRadius: "10px" }}>
              <Card.Header className="bg-white py-3 border-0"><h6 className="mb-0" style={{ fontWeight: 600 }}>Publishing</h6></Card.Header>
              <Card.Body>
                {error && <Alert variant="danger" className="py-2 small">{error}</Alert>}
                {success && <Alert variant="success" className="py-2 small">{success}</Alert>}
                <Button
                  type="submit"
                  disabled={saving}
                  style={{ background: "linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)", border: "none", width: "100%", padding: "12px", fontWeight: 600, borderRadius: "8px" }}
                  className="text-white mb-2"
                >
                  {saving ? <Spinner size="sm" className="me-2" /> : <FontAwesomeIcon icon={faSave} className="me-2" />}
                  Save Changes
                </Button>
                <Button variant="outline-secondary" style={{ width: "100%", padding: "10px", fontWeight: 600 }} onClick={() => navigate(-1)}>Cancel</Button>
              </Card.Body>
            </Card>

            <Card className="border-0 shadow-sm" style={{ borderRadius: "10px", background: "#f8f9fa" }}>
              <Card.Body className="p-4">
                <TbLocationCog style={{ color: "#8b5cf6" }} className="mb-3" size="24" />
                <h6 style={{ fontWeight: 600, fontSize: "14px" }}>Organization Context</h6>
                <p className="small text-muted mb-0">Changes to capacity metrics will affect inventory allocation logic immediately.</p>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Form>
      
      <style>{`
        .custom-tabs .nav-link { border: none; color: #6c757d; font-weight: 500; padding: 12px 20px; font-size: 14px; }
        .custom-tabs .nav-link.active { color: #8b5cf6; border-bottom: 3px solid #8b5cf6; background: transparent; }
      `}</style>
    </Container>
  );
};

export default InventoryLocationEdit;
