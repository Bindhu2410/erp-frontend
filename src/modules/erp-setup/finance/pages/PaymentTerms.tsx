import React, { useState, useEffect } from 'react';
import { Form, Card, Row, Col, Button, Table, Toast, ToastContainer, Modal, Spinner } from 'react-bootstrap';

interface IPaymentTerm {
    termId?: number;
    companyId: number;
    companyName: string;
    termName: string;
    calculationType: string;
    dueDays: number;
    discountPercentage?: number;
    discountDays?: number;
    totalRecords?: number;
    createdAt?: string;
    updatedAt?: string;
}

const PaymentTerms: React.FC = () => {
    const [terms, setTerms] = useState<IPaymentTerm[]>([]);
    const [loading, setLoading] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [toastVariant, setToastVariant] = useState<'success' | 'danger'>('success');
    const [editMode, setEditMode] = useState(false);
    const [showModal, setShowModal] = useState(false);

    // For demo, hardcode companyId and companyName
    const [currentTerm, setCurrentTerm] = useState<IPaymentTerm & { termId?: number }>({
        companyId: 5,
        companyName: 'Digital Solutions India Pvt Ltd',
        termName: '',
        calculationType: '',
        dueDays: 30,
        discountPercentage: 0,
        discountDays: 0,
        totalRecords: 0
    });

    const fetchTerms = async () => {
        setLoading(true);
        try {
            const res = await fetch('${process.env.REACT_APP_API_BASE_URL}/CsPaymentTerm/all');
            const data = await res.json();
            setTerms(data.data || []);
        } catch {
            setToastVariant('danger');
            setToastMessage('Failed to load payment terms');
            setShowToast(true);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchTerms();
    }, []);

    const handleAddTerm = () => {
        setEditMode(false);
        setCurrentTerm({
            companyId: 5,
            companyName: 'Digital Solutions India Pvt Ltd',
            termName: '',
            calculationType: '',
            dueDays: 30,
            discountPercentage: 0,
            discountDays: 0,
            totalRecords: 0
        });
        setShowModal(true);
    };

    const handleEditTerm = (term: IPaymentTerm) => {
        setEditMode(true);
        setCurrentTerm({ ...term });
        setShowModal(true);
    };

    const handleDeleteTerm = async (termId?: number) => {
        if (!termId) return;
        setLoading(true);
        try {
            await fetch(`${process.env.REACT_APP_API_BASE_URL}/CsPaymentTerm/${termId}`, { method: 'DELETE' });
            setToastVariant('success');
            setToastMessage('Payment term deleted successfully');
            setShowToast(true);
            fetchTerms();
        } catch {
            setToastVariant('danger');
            setToastMessage('Failed to delete payment term');
            setShowToast(true);
        }
        setLoading(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        // Build query string
        const params = new URLSearchParams({
            CompanyId: String(currentTerm.companyId),
            CompanyName: currentTerm.companyName,
            TermName: currentTerm.termName,
            CalculationType: currentTerm.calculationType,
            DueDays: String(currentTerm.dueDays),
            DiscountPercentage: String(currentTerm.discountPercentage ?? 0),
            DiscountDays: String(currentTerm.discountDays ?? 0),
            TotalRecords: String(currentTerm.totalRecords ?? 0)
        });
        try {
            await fetch(`${process.env.REACT_APP_API_BASE_URL}/CsPaymentTerm?${params.toString()}`, { method: 'POST' });
            setShowModal(false);
            setToastVariant('success');
            setToastMessage('Payment term created successfully');
            setShowToast(true);
            fetchTerms();
        } catch {
            setToastVariant('danger');
            setToastMessage('Failed to create payment term');
            setShowToast(true);
        }
        setLoading(false);
    };

    return (
        <div>
            <ToastContainer className="p-3" position="top-end">
                <Toast 
                    show={showToast} 
                    onClose={() => setShowToast(false)}
                    bg={toastVariant}
                    delay={3000}
                    autohide
                >
                    <Toast.Header closeButton={false}>
                        <i className={`fas fa-${toastVariant === 'success' ? 'check' : 'exclamation'}-circle me-2`}></i>
                        <strong className="me-auto">{toastVariant === 'success' ? 'Success' : 'Error'}</strong>
                    </Toast.Header>
                    <Toast.Body className="text-white">
                        {toastMessage}
                    </Toast.Body>
                </Toast>
            </ToastContainer>

            <div className="mb-4 pb-2 border-bottom">
                <h5 className="fw-bold">Payment Terms Setup</h5>
                <p className="text-muted small">Configure payment terms and conditions for invoices</p>
            </div>

            <Card className="mb-4">
                <Card.Body className="d-flex justify-content-between align-items-center">
                    <div>
                        <h6 className="mb-0">Manage Payment Terms</h6>
                        <p className="text-muted small mb-0">Add or modify payment terms for your company</p>
                    </div>
                    <Button variant="primary" onClick={handleAddTerm}>
                        <i className="fas fa-plus me-2"></i>Add Payment Term
                    </Button>
                </Card.Body>
            </Card>

            {/* Payment Term Form Modal */}
            <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
                <Form onSubmit={handleSubmit}>
                    <Modal.Header closeButton>
                        <Modal.Title>{editMode ? 'Edit Payment Term' : 'Add New Payment Term'}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Row className="g-3">
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label className="required-field">Term Name</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={currentTerm.termName}
                                        onChange={e => setCurrentTerm({...currentTerm, termName: e.target.value})}
                                        required
                                        placeholder="e.g., Net 30"
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label className="required-field">Calculation Type</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={currentTerm.calculationType}
                                        onChange={e => setCurrentTerm({...currentTerm, calculationType: e.target.value})}
                                        required
                                        placeholder="e.g., Fixed Days, Discount Days"
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group>
                                    <Form.Label className="required-field">Due Days</Form.Label>
                                    <Form.Control
                                        type="number"
                                        min={0}
                                        value={currentTerm.dueDays}
                                        onChange={e => setCurrentTerm({...currentTerm, dueDays: parseInt(e.target.value)})}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group>
                                    <Form.Label>Discount Percentage</Form.Label>
                                    <Form.Control
                                        type="number"
                                        min={0}
                                        max={100}
                                        step={0.01}
                                        value={currentTerm.discountPercentage}
                                        onChange={e => setCurrentTerm({...currentTerm, discountPercentage: parseFloat(e.target.value)})}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group>
                                    <Form.Label>Discount Days</Form.Label>
                                    <Form.Control
                                        type="number"
                                        min={0}
                                        value={currentTerm.discountDays}
                                        onChange={e => setCurrentTerm({...currentTerm, discountDays: parseInt(e.target.value)})}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowModal(false)}>
                            Cancel
                        </Button>
                        <Button variant="primary" type="submit">
                            {editMode ? 'Update' : 'Save'} Payment Term
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>

            <Card>
                <Card.Body>
                    <h6 className="card-title mb-3">Payment Terms</h6>
                    <div className="table-responsive">
                        <Table bordered hover>
                            <thead>
                                <tr>
                                    <th>Term Name</th>
                                    <th>Calculation Type</th>
                                    <th>Due Days</th>
                                    <th>Discount %</th>
                                    <th>Discount Days</th>
                                    <th>Company</th>
                                    <th>Created</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {terms.length > 0 ? (
                                    terms.map((term) => (
                                        <tr key={term.termId}>
                                            <td>{term.termName}</td>
                                            <td>{term.calculationType}</td>
                                            <td>{term.dueDays}</td>
                                            <td>{term.discountPercentage ?? '-'}</td>
                                            <td>{term.discountDays ?? '-'}</td>
                                            <td>{term.companyName}</td>
                                            <td>{term.createdAt ? new Date(term.createdAt).toLocaleDateString() : '-'}</td>
                                            <td>
                                                <Button 
                                                    variant="link" 
                                                    size="sm" 
                                                    className="text-primary"
                                                    onClick={() => handleEditTerm(term)}
                                                >
                                                    <i className="fas fa-edit"></i>
                                                </Button>
                                                <Button 
                                                    variant="link" 
                                                    size="sm" 
                                                    className="text-danger"
                                                    onClick={() => {
                                                        if (window.confirm('Are you sure you want to delete this payment term?')) {
                                                            handleDeleteTerm(term.termId);
                                                        }
                                                    }}
                                                >
                                                    <i className="fas fa-trash"></i>
                                                </Button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={8} className="text-center py-3">
                                            No payment terms found. Click "Add Payment Term" to create one.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </Table>
                        {loading && <div className="text-center py-4"><Spinner animation="border" /></div>}
                    </div>
                </Card.Body>
            </Card>
        </div>
    );
};

export default PaymentTerms;