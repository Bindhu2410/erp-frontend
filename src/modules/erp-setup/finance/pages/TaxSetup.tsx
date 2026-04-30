import React, { useState } from 'react';
import { Form, Card, Row, Col, Button, Nav, Tab } from 'react-bootstrap';

interface ITaxComponent {
    code: string;
    name: string;
    rate: number;
    type: 'GST' | 'TDS' | 'Other';
    category: string;
    accountCode: string;
    description: string;
    isActive: boolean;
    effectiveFrom: string;
    effectiveTo?: string;
}

const TaxSetup: React.FC = () => {
    const [activeTab, setActiveTab] = useState('gst');
    const [taxComponents, setTaxComponents] = useState<ITaxComponent[]>([]);
    const [currentComponent, setCurrentComponent] = useState<ITaxComponent>({
        code: '',
        name: '',
        rate: 0,
        type: 'GST',
        category: '',
        accountCode: '',
        description: '',
        isActive: true,
        effectiveFrom: new Date().toISOString().split('T')[0]
    });

    const gstCategories = ['IGST', 'CGST', 'SGST', 'UTGST'];
    const tdsCategories = ['Salary', 'Professional Fees', 'Commission', 'Rent', 'Contract'];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setTaxComponents([...taxComponents, currentComponent]);
        // Reset form
        setCurrentComponent({
            code: '',
            name: '',
            rate: 0,
            type: activeTab.toUpperCase() as any,
            category: '',
            accountCode: '',
            description: '',
            isActive: true,
            effectiveFrom: new Date().toISOString().split('T')[0]
        });
    };

    return (
        <div>
            <div className="mb-4 pb-2 border-bottom">
                <h5 className="fw-bold">Tax Setup</h5>
                <p className="text-muted small">Configure tax components and rates</p>
            </div>

            <Tab.Container activeKey={activeTab} onSelect={(k) => setActiveTab(k || 'gst')}>
                <Nav variant="tabs" className="mb-4">
                    <Nav.Item>
                        <Nav.Link eventKey="gst">GST Setup</Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                        <Nav.Link eventKey="tds">TDS Setup</Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                        <Nav.Link eventKey="other">Other Taxes</Nav.Link>
                    </Nav.Item>
                </Nav>

                <Tab.Content>
                    <Tab.Pane eventKey={activeTab}>
                        <Card className="mb-4">
                            <Card.Body>
                                <Form onSubmit={handleSubmit}>
                                    <Row className="g-3">
                                        <Col md={3}>
                                            <Form.Group>
                                                <Form.Label>Tax Code</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    value={currentComponent.code}
                                                    onChange={e => setCurrentComponent({...currentComponent, code: e.target.value})}
                                                    required
                                                />
                                            </Form.Group>
                                        </Col>
                                        <Col md={5}>
                                            <Form.Group>
                                                <Form.Label>Tax Name</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    value={currentComponent.name}
                                                    onChange={e => setCurrentComponent({...currentComponent, name: e.target.value})}
                                                    required
                                                />
                                            </Form.Group>
                                        </Col>
                                        <Col md={4}>
                                            <Form.Group>
                                                <Form.Label>Category</Form.Label>
                                                <Form.Select
                                                    value={currentComponent.category}
                                                    onChange={e => setCurrentComponent({...currentComponent, category: e.target.value})}
                                                    required
                                                >
                                                    <option value="">Select Category</option>
                                                    {(activeTab === 'gst' ? gstCategories : tdsCategories).map(category => (
                                                        <option key={category} value={category}>
                                                            {category}
                                                        </option>
                                                    ))}
                                                </Form.Select>
                                            </Form.Group>
                                        </Col>

                                        <Col md={4}>
                                            <Form.Group>
                                                <Form.Label>Rate (%)</Form.Label>
                                                <Form.Control
                                                    type="number"
                                                    step="0.01"
                                                    value={currentComponent.rate}
                                                    onChange={e => setCurrentComponent({...currentComponent, rate: parseFloat(e.target.value)})}
                                                    required
                                                />
                                            </Form.Group>
                                        </Col>
                                        <Col md={4}>
                                            <Form.Group>
                                                <Form.Label>Account Code</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    value={currentComponent.accountCode}
                                                    onChange={e => setCurrentComponent({...currentComponent, accountCode: e.target.value})}
                                                    required
                                                />
                                            </Form.Group>
                                        </Col>
                                        <Col md={4}>
                                            <Form.Group>
                                                <Form.Label>Effective From</Form.Label>
                                                <Form.Control
                                                    type="date"
                                                    value={currentComponent.effectiveFrom}
                                                    onChange={e => setCurrentComponent({...currentComponent, effectiveFrom: e.target.value})}
                                                    required
                                                />
                                            </Form.Group>
                                        </Col>

                                        <Col md={12}>
                                            <Form.Group>
                                                <Form.Label>Description</Form.Label>
                                                <Form.Control
                                                    as="textarea"
                                                    rows={2}
                                                    value={currentComponent.description}
                                                    onChange={e => setCurrentComponent({...currentComponent, description: e.target.value})}
                                                />
                                            </Form.Group>
                                        </Col>

                                        <Col md={6}>
                                            <Form.Group>
                                                <Form.Check
                                                    type="checkbox"
                                                    label="Active"
                                                    checked={currentComponent.isActive}
                                                    onChange={e => setCurrentComponent({...currentComponent, isActive: e.target.checked})}
                                                />
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                    <div className="mt-4 text-end">
                                        <Button variant="primary" type="submit">
                                            Add Tax Component
                                        </Button>
                                    </div>
                                </Form>
                            </Card.Body>
                        </Card>

                        {/* Tax Components List */}
                        <Card>
                            <Card.Body>
                                <h6 className="card-title mb-3">Tax Components</h6>
                                <div className="table-responsive">
                                    <table className="table table-bordered">
                                        <thead>
                                            <tr>
                                                <th>Code</th>
                                                <th>Name</th>
                                                <th>Category</th>
                                                <th>Rate</th>
                                                <th>Account Code</th>
                                                <th>Effective From</th>
                                                <th>Status</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {taxComponents
                                                .filter(tax => tax.type === activeTab.toUpperCase())
                                                .map((tax, index) => (
                                                <tr key={index}>
                                                    <td>{tax.code}</td>
                                                    <td>{tax.name}</td>
                                                    <td>{tax.category}</td>
                                                    <td>{tax.rate}%</td>
                                                    <td>{tax.accountCode}</td>
                                                    <td>{tax.effectiveFrom}</td>
                                                    <td>
                                                        <span className={`badge ${tax.isActive ? 'bg-success' : 'bg-danger'}`}>
                                                            {tax.isActive ? 'Active' : 'Inactive'}
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
                                    </table>
                                </div>
                            </Card.Body>
                        </Card>

                        {/* Quick Actions */}
                        <Card className="mt-4">
                            <Card.Body>
                                <h6 className="card-title mb-3">Quick Actions</h6>
                                <Row className="g-2">
                                    <Col md={3}>
                                        <Button variant="outline-primary" className="w-100">
                                            Import Tax Rates
                                        </Button>
                                    </Col>
                                    <Col md={3}>
                                        <Button variant="outline-info" className="w-100">
                                            Tax Summary Report
                                        </Button>
                                    </Col>
                                    <Col md={3}>
                                        <Button variant="outline-success" className="w-100">
                                            Export Configuration
                                        </Button>
                                    </Col>
                                    <Col md={3}>
                                        <Button variant="outline-secondary" className="w-100">
                                            Bulk Update
                                        </Button>
                                    </Col>
                                </Row>
                            </Card.Body>
                        </Card>
                    </Tab.Pane>
                </Tab.Content>
            </Tab.Container>
        </div>
    );
};

export default TaxSetup;