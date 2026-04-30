import React, { useState, useEffect } from "react";
import {
  Container, Row, Col, Card, Form, Button, Alert, Spinner, InputGroup,
} from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft, faSave, faTimes, faBuilding, faUniversity,
  faKeyboard, faFileCode, faGlobe, faToggleOn, faCheckCircle,
} from "@fortawesome/free-solid-svg-icons";
import { BsBank } from "react-icons/bs";
import { useNavigate, useParams } from "react-router-dom";
import { bankAccountService } from "../services/bankaccount.service";
import { companyListService } from "../../company/services/companyList.service";
import { IBankAccountCreate, IBankAccountResponse } from "../interfaces/bankaccount.types";

const BankAccountEdit: React.FC = () => {
    const { bankAccountId } = useParams<{ bankAccountId: string }>();
    const isEdit = !!bankAccountId;
    const navigate = useNavigate();

    const [companies, setCompanies] = useState<any[]>([]);
    const [loading, setLoading] = useState(isEdit);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const [formData, setFormData] = useState<IBankAccountCreate>({
        CompanyId: 0,
        BankName: "",
        BankBranchName: "",
        AccountNumber: "",
        IFSCCode: "",
        SwiftCode: "",
        Purpose: "",
        Currency: "INR",
        IsActive: true
    });

    // Fetch initial data
    useEffect(() => {
        const loadInitialData = async () => {
            try {
                // 1. Load companies
                const comRes = await companyListService.getCompanies();
                setCompanies(comRes.data || []);

                // 2. Load account if editing
                if (isEdit) {
                    const id = parseInt(bankAccountId as string);
                    const res = await bankAccountService.getBankAccountById(id);
                    const data: IBankAccountResponse = (res as any).data || res;
                    setFormData({
                        CompanyId: data.companyId,
                        BankName: data.bankName,
                        BankBranchName: data.bankBranchName,
                        AccountNumber: data.accountNumber,
                        IFSCCode: data.ifscCode,
                        SwiftCode: data.swiftCode || "",
                        Purpose: data.purpose || "",
                        Currency: data.currency,
                        IsActive: data.isActive
                    });
                }
            } catch (err) {
                setError("Failed to load data.");
            } finally {
                setLoading(false);
            }
        };
        loadInitialData();
    }, [bankAccountId, isEdit]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;

        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : (name === 'CompanyId' ? parseInt(value) : value)
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);
        setSuccess(false);

        if (formData.CompanyId === 0) {
            setError("Please select a company.");
            setSubmitting(false);
            return;
        }

        try {
            if (isEdit) {
                await bankAccountService.updateBankAccount(parseInt(bankAccountId as string), formData);
            } else {
                await bankAccountService.createBankAccount(formData);
            }
            setSuccess(true);
            setTimeout(() => navigate("/erp-setup/bank-account"), 1500);
        } catch (err: any) {
            setError(err.message || "Something went wrong.");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="text-center py-5"><Spinner animation="border" variant="primary" /><p className="mt-2 text-muted">Loading...</p></div>;

    return (
        <Container className="mt-4 mb-5">
            <div className="mb-4 d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center">
                   <Button variant="link" onClick={() => navigate(-1)} className="text-muted p-0 me-3 text-decoration-none"><FontAwesomeIcon icon={faArrowLeft} /></Button>
                   <div>
                       <h4 className="mb-0" style={{ fontWeight: 700 }}>{isEdit ? "Edit Bank Account" : "Register New Bank Account"}</h4>
                       <small className="text-muted">Fill in the details to {isEdit ? "update the existing" : "add a new"} company bank record.</small>
                   </div>
                </div>
                <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "#f0f7ff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                   <BsBank className="text-primary" size="20" />
                </div>
            </div>

            {error && <Alert variant="danger" className="mb-4 border-0 shadow-sm">{error}</Alert>}
            {success && <Alert variant="success" className="mb-4 border-0 shadow-sm"><FontAwesomeIcon icon={faCheckCircle} className="me-2" /> Bank account {isEdit ? "updated" : "created"} successfully. Redirecting...</Alert>}

            <Form onSubmit={handleSubmit}>
                <Row className="g-4">
                    <Col lg={8}>
                        <Card className="border-0 shadow-sm" style={{ borderRadius: "15px" }}>
                            <Card.Header className="bg-white border-bottom py-3 px-4">
                                <h6 className="mb-0 d-flex align-items-center"><FontAwesomeIcon icon={faBuilding} className="me-2 text-primary" /> Core Information</h6>
                            </Card.Header>
                            <Card.Body className="p-4">
                                <Row className="g-3">
                                    <Col md={12}>
                                        <Form.Group className="mb-3">
                                            <Form.Label className="small text-muted fw-bold">Company *</Form.Label>
                                            <Form.Select name="CompanyId" value={formData.CompanyId} onChange={handleInputChange} required className="form-control-premium" disabled={isEdit}>
                                                <option value={0}>Select Company</option>
                                                {companies.map(c => <option key={c.companyId} value={c.companyId}>{c.legalCompanyName}</option>)}
                                            </Form.Select>
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label className="small text-muted fw-bold">Bank Name *</Form.Label>
                                            <InputGroup>
                                              <InputGroup.Text className="bg-light border-end-0"><FontAwesomeIcon icon={faUniversity} className="text-muted small" /></InputGroup.Text>
                                              <Form.Control name="BankName" value={formData.BankName} onChange={handleInputChange} required placeholder="e.g. HDFC Bank" className="border-start-0 ps-0" />
                                            </InputGroup>
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label className="small text-muted fw-bold">Account Number *</Form.Label>
                                            <InputGroup>
                                              <InputGroup.Text className="bg-light border-end-0"><FontAwesomeIcon icon={faKeyboard} className="text-muted small" /></InputGroup.Text>
                                              <Form.Control name="AccountNumber" value={formData.AccountNumber} onChange={handleInputChange} required placeholder="Full account digits" className="border-start-0 ps-0 text-primary-emphasis" style={{ letterSpacing: "1px" }} />
                                            </InputGroup>
                                        </Form.Group>
                                    </Col>
                                    <Col md={12}>
                                        <Form.Group className="mb-3">
                                            <Form.Label className="small text-muted fw-bold">Branch Name *</Form.Label>
                                            <Form.Control name="BankBranchName" value={formData.BankBranchName} onChange={handleInputChange} required placeholder="Area/Locality branch name" />
                                        </Form.Group>
                                    </Col>
                                </Row>
                            </Card.Body>
                        </Card>

                        <Card className="border-0 shadow-sm mt-4" style={{ borderRadius: "15px" }}>
                            <Card.Header className="bg-white border-bottom py-3 px-4">
                                <h6 className="mb-0 d-flex align-items-center"><FontAwesomeIcon icon={faFileCode} className="me-2 text-primary" /> Banking Codes</h6>
                            </Card.Header>
                            <Card.Body className="p-4">
                                <Row className="g-3">
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label className="small text-muted fw-bold">IFSC Code *</Form.Label>
                                            <Form.Control name="IFSCCode" value={formData.IFSCCode} onChange={handleInputChange} required placeholder="11 characters code" style={{ textTransform: "uppercase" }} />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label className="small text-muted fw-bold">Swift/BIC Code</Form.Label>
                                            <Form.Control name="SwiftCode" value={formData.SwiftCode} onChange={handleInputChange} placeholder="Optional global bank code" style={{ textTransform: "uppercase" }} />
                                        </Form.Group>
                                    </Col>
                                </Row>
                            </Card.Body>
                        </Card>
                    </Col>

                    <Col lg={4}>
                        <Card className="border-0 shadow-sm mb-4" style={{ borderRadius: "15px" }}>
                            <Card.Header className="bg-white border-bottom py-3 px-4">
                                <h6 className="mb-0 d-flex align-items-center"><FontAwesomeIcon icon={faGlobe} className="me-2 text-primary" /> Other Details</h6>
                            </Card.Header>
                            <Card.Body className="p-4">
                                <Form.Group className="mb-4">
                                    <Form.Label className="small text-muted fw-bold">Currency *</Form.Label>
                                    <Form.Select name="Currency" value={formData.Currency} onChange={handleInputChange} required className="form-control-premium">
                                        <option value="INR">INR - Indian Rupee</option>
                                        <option value="USD">USD - US Dollar</option>
                                        <option value="EUR">EUR - Euro</option>
                                        <option value="AED">AED - UAE Dirham</option>
                                    </Form.Select>
                                </Form.Group>

                                <Form.Group className="mb-4">
                                    <Form.Label className="small text-muted fw-bold">Account Purpose</Form.Label>
                                    <Form.Control as="textarea" rows={3} name="Purpose" value={formData.Purpose} onChange={handleInputChange} placeholder="e.g. Operational expenses, Salary payouts" style={{ fontSize: "13px" }} />
                                </Form.Group>

                                <hr className="my-4 opacity-10" />

                                <Form.Group className="d-flex justify-content-between align-items-center">
                                    <div>
                                        <div style={{ fontWeight: 600, fontSize: "14px" }}><FontAwesomeIcon icon={faToggleOn} className={`me-2 ${formData.IsActive ? 'text-success' : 'text-muted'}`} /> Active Status</div>
                                        <small className="text-muted small">Show this account in payments</small>
                                    </div>
                                    <Form.Check type="switch" id="active-switch" name="IsActive" checked={formData.IsActive} onChange={handleInputChange} />
                                </Form.Group>
                            </Card.Body>
                        </Card>

                        <div className="d-grid gap-2">
                             <Button type="submit" disabled={submitting} className="py-3 border-0 d-flex align-items-center justify-content-center shadow-lg" style={{ background: "linear-gradient(135deg, #0d6efd 0%, #0a58ca 100%)", borderRadius: "12px", fontWeight: 700 }}>
                                {submitting ? <Spinner animation="border" size="sm" className="me-2" /> : <FontAwesomeIcon icon={faSave} className="me-2" />}
                                {isEdit ? "Update Bank Account" : "Register Account"}
                             </Button>
                             <Button variant="outline-secondary" onClick={() => navigate(-1)} className="py-2 border-0" style={{ fontSize: "13px", fontWeight: 600 }}>
                                <FontAwesomeIcon icon={faTimes} className="me-2" />Cancel & Exit
                             </Button>
                        </div>
                    </Col>
                </Row>
            </Form>

            <style>{`
                .form-control-premium {
                    padding: 0.75rem 1rem;
                    border-color: #eee;
                    font-size: 14px;
                    border-radius: 8px;
                }
                .form-control-premium:focus {
                    box-shadow: 0 0 0 3px rgba(13, 110, 253, 0.1);
                    border-color: #0d6efd;
                }
            `}</style>
        </Container>
    );
};

export default BankAccountEdit;
