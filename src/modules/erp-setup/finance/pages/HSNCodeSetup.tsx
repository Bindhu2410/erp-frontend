import React, { useState } from 'react';
import { Form, Card, Row, Col, Button, Table } from 'react-bootstrap';

interface IHSNCode {
    code: string;
    description: string;
    category: string;
    gstRate: number;
    cessRate: number;
    effectiveFrom: string;
    effectiveTo?: string;
    isActive: boolean;
}

const HSNCodeSetup: React.FC = () => {
    const [hsnCodes, setHSNCodes] = useState<IHSNCode[]>([]);
    const [currentCode, setCurrentCode] = useState<IHSNCode>({
        code: '',
        description: '',
        category: '',
        gstRate: 0,
        cessRate: 0,
        effectiveFrom: new Date().toISOString().split('T')[0],
        isActive: true
    });

    const categories = [
        'Raw Materials',
        'Finished Goods',
        'Services',
        'Capital Goods',
        'Packaging Materials'
    ];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setHSNCodes([...hsnCodes, currentCode]);
        // Reset form
        setCurrentCode({
            code: '',
            description: '',
            category: '',
            gstRate: 0,
            cessRate: 0,
            effectiveFrom: new Date().toISOString().split('T')[0],
            isActive: true
        });
    };

    return (
        <div>
            <div className="mb-4 pb-2 border-bottom">
                <h5 className="fw-bold">HSN Code Setup</h5>
                <p className="text-muted small">Manage Harmonized System Nomenclature codes for GST compliance</p>
            </div>

            <Card className="mb-4">
                <Card.Body>
                    <Form onSubmit={handleSubmit}>
                        <Row className="g-3">
                            <Col md={3}>
                                <Form.Group>
                                    <Form.Label>HSN Code</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={currentCode.code}
                                        onChange={e => setCurrentCode({...currentCode, code: e.target.value})}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={5}>
                                <Form.Group>
                                    <Form.Label>Description</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={currentCode.description}
                                        onChange={e => setCurrentCode({...currentCode, description: e.target.value})}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group>
                                    <Form.Label>Category</Form.Label>
                                    <Form.Select
                                        value={currentCode.category}
                                        onChange={e => setCurrentCode({...currentCode, category: e.target.value})}
                                        required
                                    >
                                        <option value="">Select Category</option>
                                        {categories.map(category => (
                                            <option key={category} value={category}>
                                                {category}
                                            </option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>
                            </Col>

                            <Col md={3}>
                                <Form.Group>
                                    <Form.Label>GST Rate (%)</Form.Label>
                                    <Form.Control
                                        type="number"
                                        step="0.01"
                                        value={currentCode.gstRate}
                                        onChange={e => setCurrentCode({...currentCode, gstRate: parseFloat(e.target.value)})}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={3}>
                                <Form.Group>
                                    <Form.Label>Cess Rate (%)</Form.Label>
                                    <Form.Control
                                        type="number"
                                        step="0.01"
                                        value={currentCode.cessRate}
                                        onChange={e => setCurrentCode({...currentCode, cessRate: parseFloat(e.target.value)})}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={3}>
                                <Form.Group>
                                    <Form.Label>Effective From</Form.Label>
                                    <Form.Control
                                        type="date"
                                        value={currentCode.effectiveFrom}
                                        onChange={e => setCurrentCode({...currentCode, effectiveFrom: e.target.value})}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={3}>
                                <Form.Group>
                                    <Form.Label>Effective To (Optional)</Form.Label>
                                    <Form.Control
                                        type="date"
                                        value={currentCode.effectiveTo}
                                        onChange={e => setCurrentCode({...currentCode, effectiveTo: e.target.value})}
                                    />
                                </Form.Group>
                            </Col>

                            <Col md={12}>
                                <Form.Group>
                                    <Form.Check
                                        type="checkbox"
                                        label="Active"
                                        checked={currentCode.isActive}
                                        onChange={e => setCurrentCode({...currentCode, isActive: e.target.checked})}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                        <div className="mt-4 text-end">
                            <Button variant="primary" type="submit">
                                Add HSN Code
                            </Button>
                        </div>
                    </Form>
                </Card.Body>
            </Card>

            {/* HSN Codes List */}
            <Card>
                <Card.Body>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <h6 className="card-title mb-0">HSN Codes List</h6>
                        <div>
                            <Button variant="outline-primary" size="sm" className="me-2">
                                <i className="fas fa-file-import me-1"></i> Import
                            </Button>
                            <Button variant="outline-success" size="sm">
                                <i className="fas fa-file-export me-1"></i> Export
                            </Button>
                        </div>
                    </div>
                    
                    <div className="table-responsive">
                        <Table bordered hover>
                            <thead>
                                <tr>
                                    <th>HSN Code</th>
                                    <th>Description</th>
                                    <th>Category</th>
                                    <th>GST Rate</th>
                                    <th>Cess Rate</th>
                                    <th>Effective From</th>
                                    <th>Effective To</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {hsnCodes.map((code, index) => (
                                    <tr key={index}>
                                        <td>{code.code}</td>
                                        <td>{code.description}</td>
                                        <td>{code.category}</td>
                                        <td>{code.gstRate}%</td>
                                        <td>{code.cessRate}%</td>
                                        <td>{code.effectiveFrom}</td>
                                        <td>{code.effectiveTo || '-'}</td>
                                        <td>
                                            <span className={`badge ${code.isActive ? 'bg-success' : 'bg-danger'}`}>
                                                {code.isActive ? 'Active' : 'Inactive'}
                                            </span>
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
                        </Table>
                    </div>
                </Card.Body>
            </Card>

            {/* Quick Actions Card */}
            <Card className="mt-4">
                <Card.Body>
                    <h6 className="card-title mb-3">Quick Actions</h6>
                    <Row className="g-2">
                        <Col md={3}>
                            <Button variant="outline-primary" className="w-100">
                                Bulk Update Rates
                            </Button>
                        </Col>
                        <Col md={3}>
                            <Button variant="outline-info" className="w-100">
                                HSN Summary Report
                            </Button>
                        </Col>
                        <Col md={3}>
                            <Button variant="outline-success" className="w-100">
                                Download Template
                            </Button>
                        </Col>
                        <Col md={3}>
                            <Button variant="outline-secondary" className="w-100">
                                View History
                            </Button>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>
        </div>
    );
};

export default HSNCodeSetup;