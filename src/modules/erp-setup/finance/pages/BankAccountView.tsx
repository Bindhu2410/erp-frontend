import React, { useState, useEffect } from "react";
import {
  Container, Row, Col, Card, Button, Spinner, Alert, Badge,
} from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft, faEdit, faInfoCircle, faBuilding,
  faMoneyBillWave, faShieldAlt, faClock, faGlobe, faSitemap,
  faHistory, faCheckCircle,
} from "@fortawesome/free-solid-svg-icons";
import { BsBank } from "react-icons/bs";
import { useNavigate, useParams } from "react-router-dom";
import { bankAccountService } from "../services/bankaccount.service";
import { IBankAccountResponse } from "../interfaces/bankaccount.types";

const BankAccountView: React.FC = () => {
    const { bankAccountId } = useParams<{ bankAccountId: string }>();
    const navigate = useNavigate();
    const [account, setAccount] = useState<IBankAccountResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                const id = parseInt(bankAccountId as string);
                const res = await bankAccountService.getBankAccountById(id);
                // The service already handles wrapped vs unwrapped
                setAccount(res);
            } catch (err) {
                setError("Failed to fetch bank account details");
            } finally {
                setLoading(false);
            }
        };
        fetchDetails();
    }, [bankAccountId]);

    if (loading) return <div className="text-center py-5"><Spinner animation="border" variant="primary" /><p className="mt-2 text-muted">Securing bank connection...</p></div>;
    if (error || !account) return (
        <Container className="jbs-view-container">
            <Alert variant="danger" className="border-0 shadow-sm rounded-xl">
                <h5 className="font-weight-bold">Error</h5>
                <p>{error || "Account not found"}</p>
                <Button variant="outline-danger" onClick={() => navigate(-1)} className="rounded-lg">
                    <FontAwesomeIcon icon={faArrowLeft} className="me-2" /> Back to List
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
                <Button variant="link" onClick={() => navigate("/erp-setup/bank-account")} className="jbs-btn-ghost ps-0">
                    <FontAwesomeIcon icon={faArrowLeft} /> Back to Accounts
                </Button>
                <div className="text-muted small">
                    Setup / Finance / <span className="text-dark font-weight-bold">View Account</span>
                </div>
            </div>

            {/* ── Header Section ────────────────────────────────────────────────── */}
            <div className="mb-5 d-flex flex-wrap justify-content-between align-items-end gap-4">
                <div className="d-flex align-items-center">
                    <div className="jbs-header-icon" style={{ background: 'linear-gradient(135deg, #0d6efd 0%, #0a58ca 100%)' }}>
                        <BsBank size="24" />
                    </div>
                    <div>
                        <div className="d-flex align-items-center gap-2 mb-1">
                            <h1 className="h3 mb-0 font-weight-bold text-dark">{account.bankName}</h1>
                            <Badge className="jbs-badge-pill bg-primary-subtle text-primary border border-primary-subtle px-3 py-1.5">
                                {account.isActive ? "Operational" : "Inactive"}
                            </Badge>
                        </div>
                        <p className="text-muted mb-0 small"><FontAwesomeIcon icon={faMoneyBillWave} className="me-2 text-info" />Account Number: <code className="text-primary-emphasis fw-bold">{account.accountNumber}</code></p>
                    </div>
                </div>
                <div className="d-flex gap-2">
                    <Button className="jbs-btn-primary d-flex align-items-center gap-2" onClick={() => navigate(`/erp-setup/bank-account-edit/${account.bankAccountId}`)}>
                        <FontAwesomeIcon icon={faEdit} /> Edit Bank Details
                    </Button>
                </div>
            </div>

            <Row className="g-4">
                <Col lg={8}>
                    <Card className="jbs-card jbs-border-accent mb-4">
                        <Card.Header className="bg-white border-0 pt-4 px-4 pb-1">
                            <h5 className="font-weight-bold text-dark h6 uppercase tracking-wide">Banking Identification</h5>
                        </Card.Header>
                        <Card.Body className="p-4 pt-2">
                            <Row>
                                <DetailItem label="Bank Name" value={account.bankName} icon={faBuilding} />
                                <DetailItem label="Account Number" value={<code className="bg-light px-2 py-1 rounded text-primary">#{account.accountNumber}</code>} icon={faMoneyBillWave} />
                                <DetailItem label="IFSC Code" value={account.ifscCode} icon={faShieldAlt} />
                                <DetailItem label="Currency" value={account.currency} icon={faGlobe} />
                            </Row>
                        </Card.Body>
                    </Card>

                    <Card className="jbs-card mb-4" style={{ borderLeft: '4px solid #10b981' }}>
                        <Card.Header className="bg-white border-0 pt-4 px-4 pb-1">
                            <h5 className="font-weight-bold text-dark h6 uppercase tracking-wide">Branch & Location</h5>
                        </Card.Header>
                        <Card.Body className="p-4 pt-2">
                            <Row>
                                <DetailItem label="Branch Name" value={account.bankBranchName} icon={faSitemap} />
                                <DetailItem label="Swift/BIC Code" value={account.swiftCode || "N/A (Domestic Only)"} icon={faGlobe} />
                                <DetailItem label="Operational Purpose" value={account.purpose} icon={faInfoCircle} col={12} />
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
                            <label className="jbs-label">Company Account Owner</label>
                            <div className="jbs-value text-primary font-weight-bold">{account.companyName || "Associated Group Company"}</div>
                        </div>
                        <div className="p-3 bg-primary-subtle text-primary-emphasis rounded-xl border border-primary-subtle text-center text-xs fw-bold font-mono">
                            CORE-ID: BNK-{account.bankAccountId}
                        </div>
                    </div>

                    <Card className="jbs-card bg-dark text-white shadow-lg overflow-hidden border-0">
                        <div style={{ position: 'absolute', top: '-20px', right: '-20px', opacity: 0.1, transform: 'rotate(20deg)' }}>
                            <BsBank size="180" />
                        </div>
                        <Card.Body className="p-4 position-relative">
                            <h6 className="font-weight-bold mb-4 opacity-75 text-white">Security & Audit</h6>
                            <div className="d-flex align-items-center gap-3 mb-4">
                                <div className="p-2 bg-white-subtle rounded-lg"><FontAwesomeIcon icon={faClock} /></div>
                                <div>
                                    <div className="jbs-label text-white-50 uppercase">Sync Frequency</div>
                                    <div className="small font-weight-bold text-success">Daily (Automatic)</div>
                                </div>
                            </div>
                            <div className="d-flex align-items-center gap-3 mb-0">
                                <div className="p-2 bg-white-subtle rounded-lg"><FontAwesomeIcon icon={faHistory} /></div>
                                <div>
                                    <div className="jbs-label text-white-50 uppercase">Encryption Tier</div>
                                    <div className="small font-weight-bold">AES-256 Financial Grade</div>
                                </div>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <style>{`
                .bg-white-subtle { background: rgba(255, 255, 255, 0.1); }
                .bg-primary-subtle { background: #eff6ff; }
                .rounded-xl { border-radius: 12px; }
            `}</style>
        </Container>
    );
};

export default BankAccountView;
