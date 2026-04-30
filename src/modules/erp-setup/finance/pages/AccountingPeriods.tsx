import React, { useState } from 'react';
import { Form, Card, Row, Col, Button } from 'react-bootstrap';

interface IAccountingPeriod {
    periodCode: string;
    periodName: string;
    startDate: string;
    endDate: string;
    fiscalYear: string;
    status: 'open' | 'closed' | 'locked';
    description: string;
    isAdjustmentPeriod: boolean;
}

const AccountingPeriods: React.FC = () => {
    const [periods, setPeriods] = useState<IAccountingPeriod[]>([]);
    const [currentPeriod, setCurrentPeriod] = useState<IAccountingPeriod>({
        periodCode: '',
        periodName: '',
        startDate: '',
        endDate: '',
        fiscalYear: '',
        status: 'open',
        description: '',
        isAdjustmentPeriod: false
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setPeriods([...periods, currentPeriod]);
        // Reset form
        setCurrentPeriod({
            periodCode: '',
            periodName: '',
            startDate: '',
            endDate: '',
            fiscalYear: '',
            status: 'open',
            description: '',
            isAdjustmentPeriod: false
        });
    };

    return (
        <div>
            <div className="mb-4 pb-2 border-bottom">
                <h5 className="fw-bold">Accounting Periods</h5>
                <p className="text-muted small">Set up and manage fiscal years and accounting periods</p>
            </div>

            <Card className="mb-4">
                <Card.Body>
                    <Form onSubmit={handleSubmit}>
                        <Row className="g-3">
                            <Col md={4}>
                                <Form.Group>
                                    <Form.Label>Period Code</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={currentPeriod.periodCode}
                                        onChange={e => setCurrentPeriod({...currentPeriod, periodCode: e.target.value})}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group>
                                    <Form.Label>Period Name</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={currentPeriod.periodName}
                                        onChange={e => setCurrentPeriod({...currentPeriod, periodName: e.target.value})}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group>
                                    <Form.Label>Fiscal Year</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={currentPeriod.fiscalYear}
                                        onChange={e => setCurrentPeriod({...currentPeriod, fiscalYear: e.target.value})}
                                        required
                                        placeholder="e.g., 2025-26"
                                    />
                                </Form.Group>
                            </Col>

                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label>Start Date</Form.Label>
                                    <Form.Control
                                        type="date"
                                        value={currentPeriod.startDate}
                                        onChange={e => setCurrentPeriod({...currentPeriod, startDate: e.target.value})}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label>End Date</Form.Label>
                                    <Form.Control
                                        type="date"
                                        value={currentPeriod.endDate}
                                        onChange={e => setCurrentPeriod({...currentPeriod, endDate: e.target.value})}
                                        required
                                    />
                                </Form.Group>
                            </Col>

                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label>Status</Form.Label>
                                    <Form.Select
                                        value={currentPeriod.status}
                                        onChange={e => setCurrentPeriod({...currentPeriod, status: e.target.value as 'open' | 'closed' | 'locked'})}
                                        required
                                    >
                                        <option value="open">Open</option>
                                        <option value="closed">Closed</option>
                                        <option value="locked">Locked</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>

                            <Col md={6}>
                                <Form.Group>
                                    <Form.Check
                                        type="checkbox"
                                        label="Adjustment Period"
                                        checked={currentPeriod.isAdjustmentPeriod}
                                        onChange={e => setCurrentPeriod({...currentPeriod, isAdjustmentPeriod: e.target.checked})}
                                    />
                                </Form.Group>
                            </Col>

                            <Col md={12}>
                                <Form.Group>
                                    <Form.Label>Description</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={2}
                                        value={currentPeriod.description}
                                        onChange={e => setCurrentPeriod({...currentPeriod, description: e.target.value})}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                        <div className="mt-4 text-end">
                            <Button variant="primary" type="submit">
                                Add Period
                            </Button>
                        </div>
                    </Form>
                </Card.Body>
            </Card>

            {/* Periods List */}
            <Card>
                <Card.Body>
                    <h6 className="card-title mb-3">Accounting Periods</h6>
                    <div className="table-responsive">
                        <table className="table table-bordered">
                            <thead>
                                <tr>
                                    <th>Code</th>
                                    <th>Name</th>
                                    <th>Fiscal Year</th>
                                    <th>Start Date</th>
                                    <th>End Date</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {periods.map((period, index) => (
                                    <tr key={index}>
                                        <td>{period.periodCode}</td>
                                        <td>{period.periodName}</td>
                                        <td>{period.fiscalYear}</td>
                                        <td>{period.startDate}</td>
                                        <td>{period.endDate}</td>
                                        <td>
                                            <span className={`badge ${
                                                period.status === 'open' ? 'bg-success' :
                                                period.status === 'closed' ? 'bg-warning' :
                                                'bg-danger'
                                            }`}>
                                                {period.status.charAt(0).toUpperCase() + period.status.slice(1)}
                                            </span>
                                            {period.isAdjustmentPeriod && (
                                                <span className="badge bg-info ms-1">Adjustment</span>
                                            )}
                                        </td>
                                        <td>
                                            <Button variant="link" size="sm" className="text-primary">
                                                <i className="fas fa-edit"></i>
                                            </Button>
                                            <Button variant="link" size="sm" className="text-danger">
                                                <i className="fas fa-trash"></i>
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card.Body>
            </Card>
        </div>
    );
};

export default AccountingPeriods;