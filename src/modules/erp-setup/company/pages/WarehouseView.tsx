import React, { useState, useEffect } from "react";
import {
    Container, Row, Col, Card, Badge, Button, Spinner, Alert,
} from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faWarehouse, faMapMarkerAlt, faPhone, faEnvelope, faBoxOpen,
    faEdit, faArrowLeft, faBuilding, faClock, faInfoCircle,
    faCubes, faTruckLoading, faShieldAlt, faGlobeAmericas,
} from "@fortawesome/free-solid-svg-icons";
import { useNavigate, useParams } from "react-router-dom";
import { warehouseService } from "../services/warehouse.service";

const WarehouseView: React.FC = () => {
    const { warehouseId } = useParams<{ warehouseId: string }>();
    const navigate = useNavigate();
    const [warehouse, setWarehouse] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchWarehouse = async () => {
            if (!warehouseId) return;
            try {
                const response = await warehouseService.getWarehouses();
                const found = response.data?.find((w: any) => w.warehouseId.toString() === warehouseId);
                if (found) {
                    setWarehouse(found);
                } else {
                    setError("Warehouse not found");
                }
            } catch (err) {
                setError("Failed to load warehouse details");
            } finally {
                setLoading(false);
            }
        };
        fetchWarehouse();
    }, [warehouseId]);

    if (loading) return <div className="text-center py-5"><Spinner animation="border" variant="primary" /><p className="mt-2 text-muted">Loading warehouse specifications...</p></div>;
    if (error || !warehouse) return (
        <Container className="jbs-view-container">
            <Alert variant="danger" className="border-0 shadow-sm rounded-xl">
                <h5 className="font-weight-bold">Error</h5>
                <p>{error || "Warehouse not found"}</p>
                <Button variant="outline-danger" onClick={() => navigate("/erp-setup/warehouse")} className="rounded-lg">
                    <FontAwesomeIcon icon={faArrowLeft} className="me-2" /> Back to Warehouses
                </Button>
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
                <Button variant="link" onClick={() => navigate("/erp-setup/warehouse")} className="jbs-btn-ghost ps-0">
                    <FontAwesomeIcon icon={faArrowLeft} /> Back to Warehouses
                </Button>
                <div className="text-muted small">
                    Setup / Warehouse / <span className="text-dark font-weight-bold">View</span>
                </div>
            </div>

            {/* ── Header Section ────────────────────────────────────────────────── */}
            <div className="mb-5 d-flex flex-wrap justify-content-between align-items-end gap-4">
                <div className="d-flex align-items-center">
                    <div className="jbs-header-icon" style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}>
                        <FontAwesomeIcon icon={faWarehouse} size="lg" />
                    </div>
                    <div>
                        <div className="d-flex align-items-center gap-2 mb-1">
                            <h1 className="h3 mb-0 font-weight-bold text-dark">{warehouse.warehouseName}</h1>
                            <Badge className="jbs-badge-pill bg-warning-subtle text-warning-emphasis border border-warning-subtle px-3 py-1.5">
                                {warehouse.isMainWarehouse ? "Distribution Hub" : "Storage Unit"}
                            </Badge>
                        </div>
                        <p className="text-muted mb-0 small"><FontAwesomeIcon icon={faMapMarkerAlt} className="me-2 text-info" />{warehouse.city}, {warehouse.state}</p>
                    </div>
                </div>
                <div className="d-flex gap-2">
                    <Button className="jbs-btn-primary d-flex align-items-center gap-2" style={{ background: '#f59e0b' }} onClick={() => navigate(`/erp-setup/warehouse-edit/${warehouse.warehouseId}`)}>
                        <FontAwesomeIcon icon={faEdit} /> Edit Warehouse
                    </Button>
                </div>
            </div>

            <Row className="g-4">
                <Col lg={8}>
                    <Card className="jbs-card jbs-border-accent mb-4" style={{ borderColor: '#f59e0b' }}>
                        <Card.Header className="bg-white border-0 pt-4 px-4 pb-1">
                            <h5 className="font-weight-bold text-dark h6 uppercase tracking-wide">Facility Information</h5>
                        </Card.Header>
                        <Card.Body className="p-4 pt-2">
                            <Row>
                                <DetailItem label="Warehouse Name" value={warehouse.warehouseName} icon={faWarehouse} />
                                <DetailItem label="Management Type" value={warehouse.warehouseType || "In-house Facility"} icon={faTruckLoading} />
                                <DetailItem label="Unique ID" value={<code className="bg-light px-2 py-1 rounded text-orange">#{warehouse.warehouseId}</code>} icon={faBoxOpen} />
                                <DetailItem label="Primary Status" value={warehouse.isMainWarehouse ? "Flagship Distribution Center" : "Satellite Storage"} icon={faInfoCircle} />
                            </Row>
                        </Card.Body>
                    </Card>

                    <Card className="jbs-card mb-4" style={{ borderLeft: '4px solid #3b82f6' }}>
                        <Card.Header className="bg-white border-0 pt-4 px-4 pb-1">
                            <h5 className="font-weight-bold text-dark h6 uppercase tracking-wide">Contact Details</h5>
                        </Card.Header>
                        <Card.Body className="p-4 pt-2">
                            <Row>
                                <DetailItem label="Facility Phone" value={warehouse.contactNumber} icon={faPhone} />
                                <DetailItem label="Support Email" value={<a href={`mailto:${warehouse.emailAddress}`} className="text-primary text-decoration-none">{warehouse.emailAddress}</a>} icon={faEnvelope} />
                            </Row>
                        </Card.Body>
                    </Card>

                    <Card className="jbs-card mb-4" style={{ borderLeft: '4px solid #10b981' }}>
                        <Card.Header className="bg-white border-0 pt-4 px-4 pb-1">
                            <h5 className="font-weight-bold text-dark h6 uppercase tracking-wide">Operational Location</h5>
                        </Card.Header>
                        <Card.Body className="p-4 pt-2">
                            <Row>
                                <DetailItem label="Region / State" value={warehouse.state} icon={faGlobeAmericas} />
                                <DetailItem label="City" value={warehouse.city} icon={faMapMarkerAlt} />
                                <DetailItem label="Full Address" value={warehouse.address || "Please refer to primary branch map"} icon={faMapMarkerAlt} col={12} />
                            </Row>
                        </Card.Body>
                    </Card>
                </Col>

                <Col lg={4}>
                    <div className="jbs-sidebar-card shadow-sm mb-4">
                        <h6 className="font-weight-bold mb-4 text-dark d-flex align-items-center">
                            <FontAwesomeIcon icon={faBuilding} className="me-2 text-primary" /> Entity Association
                        </h6>
                        <div className="mb-4 p-3 bg-white rounded-xl border border-slate-100 shadow-sm">
                            <label className="jbs-label">Associated Branch</label>
                            <div className="jbs-value text-primary">{warehouse.branchName || "Main Distribution Office"}</div>
                        </div>
                        <div className="p-3 bg-warning-subtle text-warning-emphasis rounded-xl border border-warning-subtle text-center text-xs fw-bold">
                            WAREHOUSE REF: WH-{warehouse.warehouseId}
                        </div>
                    </div>

                    <Card className="jbs-card bg-dark text-white shadow-lg overflow-hidden border-0">
                        <div style={{ position: 'absolute', top: '-20px', right: '-20px', opacity: 0.1, transform: 'rotate(20deg)' }}>
                            <FontAwesomeIcon icon={faCubes} size="10x" />
                        </div>
                        <Card.Body className="p-4 position-relative">
                            <h6 className="font-weight-bold mb-4 opacity-75 text-white">Logistics Metadata</h6>
                            <div className="d-flex align-items-center gap-3 mb-4">
                                <div className="p-2 bg-white-subtle rounded-lg"><FontAwesomeIcon icon={faClock} /></div>
                                <div>
                                    <div className="jbs-label text-white-50 uppercase">Operational Status</div>
                                    <div className="small font-weight-bold text-success">Active & Receiving</div>
                                </div>
                            </div>
                            <div className="d-flex align-items-center gap-3 mb-0">
                                <div className="p-2 bg-white-subtle rounded-lg"><FontAwesomeIcon icon={faShieldAlt} /></div>
                                <div>
                                    <div className="jbs-label text-white-50 uppercase">Security Tier</div>
                                    <div className="small font-weight-bold">Standard ERP Insured</div>
                                </div>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <style>{`
                .bg-white-subtle { background: rgba(255, 255, 255, 0.1); }
                .bg-warning-subtle { background: #fffbeb; }
                .rounded-xl { border-radius: 12px; }
                .text-orange { color: #f59e0b; }
            `}</style>
        </Container>
    );
};

export default WarehouseView;

