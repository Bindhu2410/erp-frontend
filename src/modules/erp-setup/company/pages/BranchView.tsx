import React, { useState, useEffect } from "react";
import {
  Container, Row, Col, Card, Badge, Button, Spinner, Alert,
} from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSitemap, faMapMarkerAlt, faPhone, faEnvelope, faGlobe,
  faEdit, faArrowLeft, faBuilding, faClock, faGlobeAmericas,
  faHistory, faShieldAlt, faCheckCircle,
} from "@fortawesome/free-solid-svg-icons";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { branchService } from "../services/branch.service";
import { companyListService } from "../services/companyList.service";

const BranchView: React.FC = () => {
    const { branchId } = useParams<{ branchId: string }>();
    const [searchParams] = useSearchParams();
    const companyIdParam = searchParams.get("companyId");
    const navigate = useNavigate();
    const [branch, setBranch] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchBranch = async () => {
            if (!branchId) return;
            if (!companyIdParam) {
                setError("Company context is missing. Please open the branch from the branches list.");
                setLoading(false);
                return;
            }
            try {
                // Fetch branches for the exact company
                const parsedCompanyId = parseInt(companyIdParam);
                const response = await branchService.getBranches(parsedCompanyId);
                const foundBranch = response.data?.find((b: any) => b.branchId.toString() === branchId);
                if (foundBranch) {
                    setBranch(foundBranch);
                } else {
                    setError("Branch not found");
                }
            } catch (err) {
                setError("Failed to load branch details");
            } finally {
                setLoading(false);
            }
        };
        fetchBranch();
    }, [branchId, companyIdParam]);

    if (loading) return <div className="text-center py-5"><Spinner animation="border" variant="primary" /><p className="mt-2 text-muted">Loading branch profile...</p></div>;
    if (error || !branch) return (
        <Container className="jbs-view-container">
            <Alert variant="danger" className="border-0 shadow-sm rounded-xl">
                <h5 className="font-weight-bold">Error</h5>
                <p>{error || "Branch not found"}</p>
                <Button variant="outline-danger" onClick={() => navigate("/erp-setup/branch-setup")} className="rounded-lg">
                    <FontAwesomeIcon icon={faArrowLeft} className="me-2" /> Back to Branch Setup
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
                <Button variant="link" onClick={() => navigate("/erp-setup/branch-setup")} className="jbs-btn-ghost ps-0">
                    <FontAwesomeIcon icon={faArrowLeft} /> Back to Branches
                </Button>
                <div className="text-muted small">
                    Setup / Branch / <span className="text-dark font-weight-bold">View</span>
                </div>
            </div>

            {/* ── Header Section ────────────────────────────────────────────────── */}
            <div className="mb-5 d-flex flex-wrap justify-content-between align-items-end gap-4">
                <div className="d-flex align-items-center">
                    <div className="jbs-header-icon" style={{ background: 'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)' }}>
                        <FontAwesomeIcon icon={faSitemap} size="lg" />
                    </div>
                    <div>
                        <div className="d-flex align-items-center gap-2 mb-1">
                            <h1 className="h3 mb-0 font-weight-bold text-dark">{branch.branchName}</h1>
                            <Badge className="jbs-badge-pill bg-success-subtle text-success border border-success-subtle px-3 py-1.5">
                                {branch.isMainBranch ? "Main Branch" : "Satellite Branch"}
                            </Badge>
                        </div>
                        <p className="text-muted mb-0 small"><FontAwesomeIcon icon={faMapMarkerAlt} className="me-2 text-info" />{branch.area}, {branch.city}</p>
                    </div>
                </div>
                <div className="d-flex gap-2">
                    <Button className="jbs-btn-primary d-flex align-items-center gap-2" style={{ background: '#0d9488' }} onClick={() => navigate(`/erp-setup/branch-edit/${branch.branchId}?companyId=${companyIdParam}`)}>
                        <FontAwesomeIcon icon={faEdit} /> Edit Branch
                    </Button>
                </div>
            </div>

            <Row className="g-4">
                <Col lg={8}>
                    <Card className="jbs-card jbs-border-accent mb-4" style={{ borderColor: '#0d9488' }}>
                        <Card.Header className="bg-white border-0 pt-4 px-4 pb-1">
                            <h5 className="font-weight-bold text-dark h6 uppercase tracking-wide">Branch Identity & Location</h5>
                        </Card.Header>
                        <Card.Body className="p-4 pt-2">
                            <Row>
                                <DetailItem label="Branch Name" value={branch.branchName} icon={faBuilding} />
                                <DetailItem label="Management Type" value={branch.branchType || "Corporate Office"} icon={faShieldAlt} />
                                <DetailItem label="Establishment ID" value={<code className="bg-light px-2 py-1 rounded text-teal">#{branch.branchId}</code>} icon={faSitemap} />
                                <DetailItem label="Main Branch Status" value={branch.isMainBranch ? (<span className="text-success fw-bold"><FontAwesomeIcon icon={faCheckCircle} className="me-2" />Primary Entity</span>) : "Secondary Branch"} icon={faShieldAlt} />
                            </Row>
                        </Card.Body>
                    </Card>

                    <Card className="jbs-card mb-4" style={{ borderLeft: '4px solid #3b82f6' }}>
                        <Card.Header className="bg-white border-0 pt-4 px-4 pb-1">
                            <h5 className="font-weight-bold text-dark h6 uppercase tracking-wide">Contacts & Digital</h5>
                        </Card.Header>
                        <Card.Body className="p-4 pt-2">
                            <Row>
                                <DetailItem label="Branch Phone" value={branch.contactNumber} icon={faPhone} />
                                <DetailItem label="Branch Email" value={<a href={`mailto:${branch.emailAddress}`} className="text-primary text-decoration-none">{branch.emailAddress}</a>} icon={faEnvelope} />
                                <DetailItem label="Web Extension" value={branch.website || "shared-corporate-portal"} icon={faGlobe} col={12} />
                            </Row>
                        </Card.Body>
                    </Card>

                    <Card className="jbs-card mb-4" style={{ borderLeft: '4px solid #f59e0b' }}>
                        <Card.Header className="bg-white border-0 pt-4 px-4 pb-1">
                            <h5 className="font-weight-bold text-dark h6 uppercase tracking-wide">Geographic Details</h5>
                        </Card.Header>
                        <Card.Body className="p-4 pt-2">
                            <Row>
                                <DetailItem label="Region" value={branch.state} icon={faGlobeAmericas} />
                                <DetailItem label="City" value={branch.city} icon={faMapMarkerAlt} />
                                <DetailItem label="Operational Area" value={branch.area} icon={faMapMarkerAlt} col={12} />
                            </Row>
                        </Card.Body>
                    </Card>
                </Col>

                <Col lg={4}>
                    <div className="jbs-sidebar-card shadow-sm mb-4">
                        <h6 className="font-weight-bold mb-4 text-dark d-flex align-items-center">
                            <FontAwesomeIcon icon={faBuilding} className="me-2 text-primary" /> Corporate Association
                        </h6>
                        <div className="mb-4 p-3 bg-white rounded-xl border border-slate-100 shadow-sm">
                            <label className="jbs-label">Parent Company</label>
                            <div className="jbs-value text-primary">{branch.companyName || "Associated ERP Company"}</div>
                        </div>
                        <div className="p-3 bg-info-subtle text-info-emphasis rounded-xl border border-info-subtle small fw-bold text-center">
                            Branch ID: {branch.branchId}
                        </div>
                    </div>

                    <Card className="jbs-card bg-dark text-white shadow-lg overflow-hidden border-0">
                        <div style={{ position: 'absolute', top: '-20px', right: '-20px', opacity: 0.1, transform: 'rotate(20deg)' }}>
                            <FontAwesomeIcon icon={faHistory} size="10x" />
                        </div>
                        <Card.Body className="p-4 position-relative">
                            <h6 className="font-weight-bold mb-4 opacity-75 text-white">System Metadata</h6>
                            <div className="d-flex align-items-center gap-3 mb-4">
                                <div className="p-2 bg-white-subtle rounded-lg"><FontAwesomeIcon icon={faClock} /></div>
                                <div>
                                    <div className="jbs-label text-white-50 uppercase">Operational Status</div>
                                    <div className="small font-weight-bold text-success">Active & Online</div>
                                </div>
                            </div>
                            <div className="d-flex align-items-center gap-3 mb-0">
                                <div className="p-2 bg-white-subtle rounded-lg"><FontAwesomeIcon icon={faCheckCircle} /></div>
                                <div>
                                    <div className="jbs-label text-white-50 uppercase">Verified Location</div>
                                    <div className="small font-weight-bold">Geocoded & Confirmed</div>
                                </div>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <style>{`
                .bg-white-subtle { background: rgba(255, 255, 255, 0.1); }
                .bg-success-subtle { background: #d1fae5; }
                .bg-info-subtle { background: #e0f2fe; }
                .rounded-xl { border-radius: 12px; }
                .text-teal { color: #0d9488; }
            `}</style>
        </Container>
    );
};

export default BranchView;
