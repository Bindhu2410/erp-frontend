import React from 'react';
import { Form, Row, Col, Button, Card } from 'react-bootstrap';
import { ITaxInformation } from '../interfaces/company.types';

interface Props {
    data: ITaxInformation;
    onUpdate: (data: Partial<ITaxInformation>) => void;
    onNext: () => void;
    onBack: () => void;
}

const TaxInformation: React.FC<Props> = ({ data, onUpdate, onNext, onBack }) => {
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onNext();
    };

    return (
        <Form onSubmit={handleSubmit}>
            <div className="mb-4 pb-2 border-bottom">
                <h5 className="fw-bold">Tax Registration Details</h5>
                <p className="text-muted small">Enter your company's tax registration details required for compliance.</p>
            </div>

            <Row className="g-3 mb-4">
                <Col md={12}>
                    <Form.Group>
                        <Form.Label className="required-field">Legal Name as per PAN/TAN</Form.Label>
                        <Form.Control
                            type="text"
                            value={data.LegalNameAsPerPANTAN}
                            onChange={(e) => onUpdate({ LegalNameAsPerPANTAN: e.target.value })}
                            required
                            placeholder="Enter legal name as per PAN/TAN"
                        />
                    </Form.Group>
                </Col>
            </Row>

            <Row className="g-3 mb-4">
                <Col md={6}>
                    <Form.Group>
                        <Form.Label className="required-field">Permanent Account Number (PAN)</Form.Label>
                        <Form.Control
                            type="text"
                            value={data.PAN}
                            onChange={(e) => onUpdate({ PAN: e.target.value.toUpperCase() })}
                            required
                            pattern="[A-Z]{5}[0-9]{4}[A-Z]{1}"
                            maxLength={10}
                            placeholder="Enter 10-digit PAN"
                            className="text-uppercase"
                        />
                        <Form.Text>Format: ABCDE1234F</Form.Text>
                    </Form.Group>
                </Col>
                <Col md={6}>
                    <Form.Group>
                        <Form.Label className="required-field">Tax Deduction Account Number (TAN)</Form.Label>
                        <Form.Control
                            type="text"
                            value={data.TAN}
                            onChange={(e) => onUpdate({ TAN: e.target.value.toUpperCase() })}
                            required
                            pattern="[A-Z]{4}[0-9]{5}[A-Z]{1}"
                            maxLength={10}
                            placeholder="Enter 10-digit TAN"
                            className="text-uppercase"
                        />
                        <Form.Text>Format: ABLE12345F</Form.Text>
                    </Form.Group>
                </Col>
            </Row>

            <Row className="g-3 mb-4">
                <Col md={6}>
                    <Form.Group>
                        <Form.Label className="required-field">GST Number (GSTIN)</Form.Label>
                        <Form.Control
                            type="text"
                            value={data.GSTIN}
                            onChange={(e) => onUpdate({ GSTIN: e.target.value.toUpperCase() })}
                            required
                            pattern="[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}[Z]{1}[0-9A-Z]{1}"
                            maxLength={15}
                            placeholder="Enter 15-digit GSTIN"
                            className="text-uppercase"
                        />
                        <Form.Text>Format: 27AAAAA0000A1Z5</Form.Text>
                    </Form.Group>
                </Col>
            </Row>

            <Card className="bg-light mb-4">
                <Card.Body>
                    <h6 className="card-title">
                        <i className="fas fa-info-circle text-primary me-2"></i>
                        Additional GST Information
                    </h6>
                    <p className="card-text small mb-0">
                        If your company has multiple GSTINs for different branches/states, you can add them when setting up individual branches in the Branch Setup section.
                    </p>
                </Card.Body>
            </Card>

            <div className="text-end">
                <Button type="button" variant="outline-secondary" className="me-2" onClick={onBack}>
                    <i className="fas fa-arrow-left me-2"></i> Back
                </Button>
                <Button type="submit" variant="primary">
                    Next <i className="fas fa-arrow-right ms-2"></i>
                </Button>
            </div>
        </Form>
    );
};

export default TaxInformation;