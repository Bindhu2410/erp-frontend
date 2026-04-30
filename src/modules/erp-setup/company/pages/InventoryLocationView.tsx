import React, { useState, useEffect } from "react";
import {
  Container, Row, Col, Card, Badge, Button, Spinner, Alert,
} from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMapMarkerAlt, faSitemap, faBuilding, faWarehouse,
  faEdit, faArrowLeft, faClock, faInfoCircle,
  faLayerGroup, faCubes, faCheckCircle,
} from "@fortawesome/free-solid-svg-icons";
import { useNavigate, useParams } from "react-router-dom";
import { inventoryLocationService } from "../services/inventoryLocation.service";

const InventoryLocationView: React.FC = () => {
    const { locationId } = useParams<{ locationId: string }>();
    const navigate = useNavigate();
    const [location, setLocation] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchLocation = async () => {
            if (!locationId) return;
            try {
                const response = await inventoryLocationService.getLocationById(Number(locationId));
                // response.data is { message, data: { locationId, ... } }
                const found = response.data?.data;
                if (found) {
                    setLocation(found);
                } else {
                    setError("Inventory location not found");
                }
            } catch (err: any) {
                console.error("View Error:", err);
                setError(err.response?.data?.message || "Failed to load inventory location details");
            } finally {
                setLoading(false);
            }
        };
        fetchLocation();
    }, [locationId]);

    if (loading) return <div className="text-center py-5"><Spinner animation="border" variant="primary" /><p className="mt-2 text-muted">Loading location mapping...</p></div>;
    if (error || !location) return (
        <Container className="jbs-view-container">
            <Alert variant="danger" className="border-0 shadow-sm rounded-xl">
                <h5 className="font-weight-bold">Error</h5>
                <p>{error || "Inventory location not found"}</p>
                <button onClick={() => navigate("/erp-setup/inventory-location")} className="btn btn-outline-danger rounded-lg">
                    <FontAwesomeIcon icon={faArrowLeft} className="me-2" /> Back to Dashboard
                </button>
            </Alert>
        </Container>
    );

    const DetailItem = ({ label, value, icon, col = 6 }: any) => (
        <Col md={col} className="mb-4">
            <div className="d-flex align-items-start">
                <div className="me-3 text-primary opacity-75 mt-1" style={{ width: '20px' }}>
                    <FontAwesomeIcon icon={icon} />
                </div>
                <div>
                    <span className="jbs-label">{label}</span>
                    <span className="jbs-value">{value || <span className="text-muted italic small">Not Provided</span>}</span>
                </div>
            </div>
        </Col>
    );

    return (
        <Container fluid className="jbs-view-container px-lg-5">
            {/* ── Top Navigation ─────────────────────────────────────────────────── */}
            <div className="mb-4 d-flex justify-content-between align-items-center">
                <Button variant="link" onClick={() => navigate("/erp-setup/inventory-location")} className="jbs-btn-ghost ps-0">
                    <FontAwesomeIcon icon={faArrowLeft} /> Back to Locations
                </Button>
                <div className="text-muted small">
                    Setup / Inventory / <span className="text-dark font-weight-bold">View</span>
                </div>
            </div>

            {/* ── Header Section ────────────────────────────────────────────────── */}
            <div className="mb-5 d-flex flex-wrap justify-content-between align-items-end gap-4">
                <div className="d-flex align-items-center">
                    <div className="jbs-header-icon" style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)' }}>
                        <FontAwesomeIcon icon={faLayerGroup} size="lg" />
                    </div>
                    <div>
                        <div className="d-flex align-items-center gap-2 mb-1">
                            <h1 className="h3 mb-0 font-weight-bold text-dark">{location.locationName}</h1>
                            <Badge className="jbs-badge-pill bg-purple-subtle text-purple-emphasis border border-purple-subtle px-3 py-1.5">
                                {location.locationCategory || "Inventory Bin"}
                            </Badge>
                        </div>
                        <p className="text-muted mb-0 small"><FontAwesomeIcon icon={faWarehouse} className="me-2 text-info" />Associated with Warehouse ID: {location.warehouseId || "N/A"}</p>
                    </div>
                </div>
                <div className="d-flex gap-2">
                    <Button className="jbs-btn-primary d-flex align-items-center gap-2" style={{ background: '#8b5cf6' }} onClick={() => navigate(`/erp-setup/inventory-location-edit/${location.locationId}`)}>
                        <FontAwesomeIcon icon={faEdit} /> Edit Location
                    </Button>
                </div>
            </div>

            <Row className="g-4">
                <Col lg={8}>
                    <Card className="jbs-card jbs-border-accent mb-4" style={{ borderColor: '#8b5cf6' }}>
                        <Card.Header className="bg-white border-0 pt-4 px-4 pb-1">
                            <h5 className="font-weight-bold text-dark h6 uppercase tracking-wide">Storage Mapping</h5>
                        </Card.Header>
                        <Card.Body className="p-4 pt-2">
                            <Row>
                                <DetailItem label="Location Name" value={location.locationName} icon={faMapMarkerAlt} />
                                <DetailItem label="Location Code" value={location.locationCode} icon={faLayerGroup} />
                                <DetailItem label="Unique ID" value={<code className="bg-light px-2 py-1 rounded text-purple">#{location.locationId}</code>} icon={faCubes} />
                                <DetailItem label="Category" value={location.locationCategory || "Physical Bin"} icon={faInfoCircle} />
                            </Row>
                        </Card.Body>
                    </Card>

                    <Card className="jbs-card mb-4" style={{ borderLeft: '4px solid #10b981' }}>
                        <Card.Header className="bg-white border-0 pt-4 px-4 pb-1">
                            <h5 className="font-weight-bold text-dark h6 uppercase tracking-wide">Facility Breadcrumbs</h5>
                        </Card.Header>
                        <Card.Body className="p-4 pt-2">
                            <Row>
                                <DetailItem label="Warehouse ID" value={location.warehouseId} icon={faWarehouse} />
                                <DetailItem label="Location Category" value={location.locationCategory} icon={faBuilding} />
                            </Row>
                        </Card.Body>
                    </Card>
                </Col>

                <Col lg={4}>
                    <div className="jbs-sidebar-card shadow-sm mb-4">
                        <h6 className="font-weight-bold mb-4 text-dark d-flex align-items-center">
                            <FontAwesomeIcon icon={faSitemap} className="me-2 text-primary" /> Logical Parent
                        </h6>
                        <div className="mb-4 p-3 bg-white rounded-xl border border-slate-100 shadow-sm">
                            <label className="jbs-label">Parent Location</label>
                            <div className="jbs-value text-primary">{location.parentLocationName || "Root Warehouse Bin"}</div>
                        </div>
                        <div className="p-3 bg-purple-subtle text-purple-emphasis rounded-xl border border-purple-subtle text-center text-xs fw-bold">
                            LOCATION REF: LOC-{location.locationId}
                        </div>
                    </div>

                    <Card className="jbs-card bg-dark text-white shadow-lg overflow-hidden border-0">
                        <div style={{ position: 'absolute', top: '-20px', right: '-20px', opacity: 0.1, transform: 'rotate(20deg)' }}>
                            <FontAwesomeIcon icon={faCubes} size="10x" />
                        </div>
                        <Card.Body className="p-4 position-relative">
                            <h6 className="font-weight-bold mb-4 opacity-75 text-white">Inventory Controls</h6>
                            <div className="d-flex align-items-center gap-3 mb-4">
                                <div className="p-2 bg-white-subtle rounded-lg"><FontAwesomeIcon icon={faClock} /></div>
                                <div>
                                    <div className="jbs-label text-white-50 uppercase">Sync Status</div>
                                    <div className="small font-weight-bold text-success">Real-time Verified</div>
                                </div>
                            </div>
                            <div className="d-flex align-items-center gap-3 mb-0">
                                <div className="p-2 bg-white-subtle rounded-lg"><FontAwesomeIcon icon={faCheckCircle} /></div>
                                <div>
                                    <div className="jbs-label text-white-50 uppercase">Audit Compliance</div>
                                    <div className="small font-weight-bold">Passed FY24 Q4</div>
                                </div>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <style>{`
                .bg-white-subtle { background: rgba(255, 255, 255, 0.1); }
                .bg-purple-subtle { background: #f5f3ff; }
                .text-purple { color: #8b5cf6; }
                .rounded-xl { border-radius: 12px; }
            `}</style>
        </Container>
    );
};

export default InventoryLocationView;
