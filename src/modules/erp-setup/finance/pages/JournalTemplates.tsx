import React, { useState } from 'react';
import { Form, Card, Row, Col, Button, Table } from 'react-bootstrap';

interface IJournalTemplate {
    name: string;
    description: string;
    debitAccount: string;
    creditAccount: string;
    type: 'Standard' | 'Recurring' | 'Accrual' | 'Reversal';
    frequency?: 'Daily' | 'Weekly' | 'Monthly' | 'Quarterly' | 'Yearly';
    isActive: boolean;
}

const JournalTemplates: React.FC = () => {
    const [templates, setTemplates] = useState<IJournalTemplate[]>([]);
    const [currentTemplate, setCurrentTemplate] = useState<IJournalTemplate>({
        name: '',
        description: '',
        debitAccount: '',
        creditAccount: '',
        type: 'Standard',
        isActive: true
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setTemplates([...templates, currentTemplate]);
        setCurrentTemplate({
            name: '',
            description: '',
            debitAccount: '',
            creditAccount: '',
            type: 'Standard',
            isActive: true
        });
    };

    return (
        <div>
            <div className="mb-4 pb-2 border-bottom">
                <h5 className="fw-bold">Journal Entry Templates</h5>
                <p className="text-muted small">Configure templates for recurring journal entries</p>
            </div>

            <Card className="mb-4">
                <Card.Body>
                    <Form onSubmit={handleSubmit}>
                        <Row className="g-3">
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label>Template Name</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={currentTemplate.name}
                                        onChange={e => setCurrentTemplate({...currentTemplate, name: e.target.value})}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label>Type</Form.Label>
                                    <Form.Select
                                        value={currentTemplate.type}
                                        onChange={e => setCurrentTemplate({...currentTemplate, type: e.target.value as IJournalTemplate['type']})}
                                        required
                                    >
                                        <option value="Standard">Standard</option>
                                        <option value="Recurring">Recurring</option>
                                        <option value="Accrual">Accrual</option>
                                        <option value="Reversal">Reversal</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>

                            <Col md={12}>
                                <Form.Group>
                                    <Form.Label>Description</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={2}
                                        value={currentTemplate.description}
                                        onChange={e => setCurrentTemplate({...currentTemplate, description: e.target.value})}
                                        required
                                    />
                                </Form.Group>
                            </Col>

                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label>Debit Account</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={currentTemplate.debitAccount}
                                        onChange={e => setCurrentTemplate({...currentTemplate, debitAccount: e.target.value})}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label>Credit Account</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={currentTemplate.creditAccount}
                                        onChange={e => setCurrentTemplate({...currentTemplate, creditAccount: e.target.value})}
                                        required
                                    />
                                </Form.Group>
                            </Col>

                            {currentTemplate.type === 'Recurring' && (
                                <Col md={6}>
                                    <Form.Group>
                                        <Form.Label>Frequency</Form.Label>
                                        <Form.Select
                                            value={currentTemplate.frequency}
                                            onChange={e => setCurrentTemplate({...currentTemplate, frequency: e.target.value as IJournalTemplate['frequency']})}
                                            required
                                        >
                                            <option value="Daily">Daily</option>
                                            <option value="Weekly">Weekly</option>
                                            <option value="Monthly">Monthly</option>
                                            <option value="Quarterly">Quarterly</option>
                                            <option value="Yearly">Yearly</option>
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                            )}

                            <Col md={12}>
                                <Form.Group>
                                    <Form.Check
                                        type="checkbox"
                                        label="Active"
                                        checked={currentTemplate.isActive}
                                        onChange={e => setCurrentTemplate({...currentTemplate, isActive: e.target.checked})}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                        <div className="mt-4 text-end">
                            <Button variant="primary" type="submit">
                                Add Template
                            </Button>
                        </div>
                    </Form>
                </Card.Body>
            </Card>

            <Card>
                <Card.Body>
                    <h6 className="card-title mb-3">Journal Templates</h6>
                    <div className="table-responsive">
                        <Table bordered hover>
                            <thead>
                                <tr>
                                    <th>Template Name</th>
                                    <th>Type</th>
                                    <th>Debit Account</th>
                                    <th>Credit Account</th>
                                    <th>Frequency</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {templates.map((template, index) => (
                                    <tr key={index}>
                                        <td>{template.name}</td>
                                        <td>{template.type}</td>
                                        <td>{template.debitAccount}</td>
                                        <td>{template.creditAccount}</td>
                                        <td>{template.frequency || '-'}</td>
                                        <td>
                                            <span className={`badge ${template.isActive ? 'bg-success' : 'bg-danger'}`}>
                                                {template.isActive ? 'Active' : 'Inactive'}
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
        </div>
    );
};

export default JournalTemplates;