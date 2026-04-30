import React from 'react';
import { Form, Row, Col, Button, Card } from 'react-bootstrap';
import { IFinancialSettings } from '../interfaces/company.types';

interface Props {
    data: IFinancialSettings;
    onUpdate: (data: Partial<IFinancialSettings>) => void;
    onNext: () => void;
    onBack: () => void;
}

const FinancialSettings: React.FC<Props> = ({ data, onUpdate, onNext, onBack }) => {
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onNext();
    };

    return (
        <Form onSubmit={handleSubmit}>
            <div className="mb-4 pb-2 border-bottom">
                <h5 className="fw-bold">Financial Configuration</h5>
                <p className="text-muted small">Configure your company's financial and accounting settings.</p>
            </div>

            <Row className="g-3 mb-4">
                <Col md={4}>
                    <Form.Group>
                        <Form.Label className="required-field">Base Currency</Form.Label>
                        <Form.Select
                            value={data.BaseCurrency}
                            onChange={(e) => onUpdate({ BaseCurrency: e.target.value })}
                            required
                        >
                            <option value="">Select currency</option>
                            <option value="INR">Indian Rupee (INR)</option>
                            <option value="USD">US Dollar (USD)</option>
                            <option value="EUR">Euro (EUR)</option>
                            <option value="GBP">British Pound (GBP)</option>
                        </Form.Select>
                    </Form.Group>
                </Col>
            </Row>

            <Row className="g-3 mb-4">
                <Col md={6}>
                    <Form.Group>
                        <Form.Label className="required-field">Financial Year Start Date</Form.Label>
                        <Form.Control
                            type="date"
                            value={data.FinancialYearStartDate}
                            onChange={(e) => onUpdate({ FinancialYearStartDate: e.target.value })}
                            required
                        />
                    </Form.Group>
                </Col>
                <Col md={6}>
                    <Form.Group>
                        <Form.Label className="required-field">Financial Year End Date</Form.Label>
                        <Form.Control
                            type="date"
                            value={data.FinancialYearEndDate}
                            onChange={(e) => onUpdate({ FinancialYearEndDate: e.target.value })}
                            required
                        />
                    </Form.Group>
                </Col>
            </Row>

            <Card className="bg-light mb-4">
                <Card.Body>
                    <h6 className="card-title">
                        <i className="fas fa-exclamation-triangle text-warning me-2"></i>
                        Important Note
                    </h6>
                    <p className="card-text small mb-0">
                        Please ensure the financial year dates are correctly set as they cannot be changed once the company is created. The dates will be used for all financial reporting and compliance purposes.
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

export default FinancialSettings;