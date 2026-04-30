import React, { useState } from 'react';
import { Form, Card, Row, Col, Button } from 'react-bootstrap';

interface IAccountMapping {
    accountCode: string;
    accountName: string;
    statementType: 'balance-sheet' | 'income-statement' | 'cash-flow';
    category: string;
    subCategory: string;
    position: 'debit' | 'credit';
    displayOrder: number;
    grouping: string;
    isActive: boolean;
}

interface ISubCategories {
    [key: string]: string[];
}

const FinancialStatements: React.FC = () => {
    const [mappings, setMappings] = useState<IAccountMapping[]>([]);
    const [currentMapping, setCurrentMapping] = useState<IAccountMapping>({
        accountCode: '',
        accountName: '',
        statementType: 'balance-sheet',
        category: '',
        subCategory: '',
        position: 'debit',
        displayOrder: 0,
        grouping: '',
        isActive: true
    });

    const statementTypes = [
        { value: 'balance-sheet', label: 'Balance Sheet' },
        { value: 'income-statement', label: 'Income Statement' },
        { value: 'cash-flow', label: 'Cash Flow Statement' }
    ];

    const categories = {
        'balance-sheet': ['Assets', 'Liabilities', 'Equity'],
        'income-statement': ['Revenue', 'Cost of Sales', 'Expenses', 'Other Income', 'Other Expenses'],
        'cash-flow': ['Operating Activities', 'Investing Activities', 'Financing Activities']
    };

    const subCategories: ISubCategories = {
        'Assets': ['Current Assets', 'Non-Current Assets', 'Fixed Assets'],
        'Liabilities': ['Current Liabilities', 'Non-Current Liabilities'],
        'Equity': ['Share Capital', 'Reserves', 'Retained Earnings'],
        'Revenue': ['Operating Revenue', 'Other Revenue'],
        'Expenses': ['Operating Expenses', 'Administrative Expenses', 'Selling Expenses'],
        'Operating Activities': ['Cash from Operations', 'Working Capital Changes'],
        'Investing Activities': ['Fixed Assets', 'Investments'],
        'Financing Activities': ['Debt', 'Equity']
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setMappings([...mappings, currentMapping]);
        // Reset form
        setCurrentMapping({
            accountCode: '',
            accountName: '',
            statementType: 'balance-sheet',
            category: '',
            subCategory: '',
            position: 'debit',
            displayOrder: 0,
            grouping: '',
            isActive: true
        });
    };

    return (
        <div>
            <div className="mb-4 pb-2 border-bottom">
                <h5 className="fw-bold">Financial Statement Mapping</h5>
                <p className="text-muted small">Map accounts to financial statement categories</p>
            </div>

            <Card className="mb-4">
                <Card.Body>
                    <Form onSubmit={handleSubmit}>
                        <Row className="g-3">
                            <Col md={4}>
                                <Form.Group>
                                    <Form.Label>Account Code</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={currentMapping.accountCode}
                                        onChange={e => setCurrentMapping({...currentMapping, accountCode: e.target.value})}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={8}>
                                <Form.Group>
                                    <Form.Label>Account Name</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={currentMapping.accountName}
                                        onChange={e => setCurrentMapping({...currentMapping, accountName: e.target.value})}
                                        required
                                    />
                                </Form.Group>
                            </Col>

                            <Col md={4}>
                                <Form.Group>
                                    <Form.Label>Statement Type</Form.Label>
                                    <Form.Select
                                        value={currentMapping.statementType}
                                        onChange={e => setCurrentMapping({
                                            ...currentMapping,
                                            statementType: e.target.value as any,
                                            category: '',
                                            subCategory: ''
                                        })}
                                        required
                                    >
                                        {statementTypes.map(type => (
                                            <option key={type.value} value={type.value}>
                                                {type.label}
                                            </option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group>
                                    <Form.Label>Category</Form.Label>
                                    <Form.Select
                                        value={currentMapping.category}
                                        onChange={e => setCurrentMapping({
                                            ...currentMapping,
                                            category: e.target.value,
                                            subCategory: ''
                                        })}
                                        required
                                    >
                                        <option value="">Select Category</option>
                                        {categories[currentMapping.statementType]?.map(category => (
                                            <option key={category} value={category}>
                                                {category}
                                            </option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group>
                                    <Form.Label>Sub Category</Form.Label>
                                    <Form.Select
                                        value={currentMapping.subCategory}
                                        onChange={e => setCurrentMapping({...currentMapping, subCategory: e.target.value})}
                                        required
                                    >
                                        <option value="">Select Sub Category</option>
                                        {subCategories[currentMapping.category]?.map((subCategory: string) => (
                                            <option key={subCategory} value={subCategory}>
                                                {subCategory}
                                            </option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>
                            </Col>

                            <Col md={4}>
                                <Form.Group>
                                    <Form.Label>Position</Form.Label>
                                    <Form.Select
                                        value={currentMapping.position}
                                        onChange={e => setCurrentMapping({...currentMapping, position: e.target.value as any})}
                                        required
                                    >
                                        <option value="debit">Debit</option>
                                        <option value="credit">Credit</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group>
                                    <Form.Label>Display Order</Form.Label>
                                    <Form.Control
                                        type="number"
                                        min={0}
                                        value={currentMapping.displayOrder}
                                        onChange={e => setCurrentMapping({...currentMapping, displayOrder: parseInt(e.target.value)})}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group>
                                    <Form.Label>Grouping</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={currentMapping.grouping}
                                        onChange={e => setCurrentMapping({...currentMapping, grouping: e.target.value})}
                                        placeholder="Optional"
                                    />
                                </Form.Group>
                            </Col>

                            <Col md={12}>
                                <Form.Group>
                                    <Form.Check
                                        type="checkbox"
                                        label="Active"
                                        checked={currentMapping.isActive}
                                        onChange={e => setCurrentMapping({...currentMapping, isActive: e.target.checked})}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                        <div className="mt-4 text-end">
                            <Button variant="primary" type="submit">
                                Add Mapping
                            </Button>
                        </div>
                    </Form>
                </Card.Body>
            </Card>

            {/* Mappings List */}
            <Card>
                <Card.Body>
                    <h6 className="card-title mb-3">Financial Statement Mappings</h6>
                    <div className="table-responsive">
                        <table className="table table-bordered">
                            <thead>
                                <tr>
                                    <th>Account Code</th>
                                    <th>Account Name</th>
                                    <th>Statement</th>
                                    <th>Category</th>
                                    <th>Sub Category</th>
                                    <th>Position</th>
                                    <th>Order</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {mappings.map((mapping, index) => (
                                    <tr key={index}>
                                        <td>{mapping.accountCode}</td>
                                        <td>{mapping.accountName}</td>
                                        <td>{statementTypes.find(t => t.value === mapping.statementType)?.label}</td>
                                        <td>{mapping.category}</td>
                                        <td>{mapping.subCategory}</td>
                                        <td>{mapping.position}</td>
                                        <td>{mapping.displayOrder}</td>
                                        <td>
                                            <span className={`badge ${mapping.isActive ? 'bg-success' : 'bg-danger'}`}>
                                                {mapping.isActive ? 'Active' : 'Inactive'}
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
                                Preview Balance Sheet
                            </Button>
                        </Col>
                        <Col md={3}>
                            <Button variant="outline-info" className="w-100">
                                Preview Income Statement
                            </Button>
                        </Col>
                        <Col md={3}>
                            <Button variant="outline-success" className="w-100">
                                Preview Cash Flow
                            </Button>
                        </Col>
                        <Col md={3}>
                            <Button variant="outline-secondary" className="w-100">
                                Export Mappings
                            </Button>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>
        </div>
    );
};

export default FinancialStatements;