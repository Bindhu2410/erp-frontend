import React, { useState } from 'react';
import { Form, Card, Row, Col, Button } from 'react-bootstrap';

interface IDefaultAccount {
    transactionType: string;
    accountCode: string;
    accountName: string;
    description: string;
    isActive: boolean;
    isSystem: boolean;
    category: 'sales' | 'purchase' | 'inventory' | 'banking' | 'tax' | 'other';
}

const DefaultAccounts: React.FC = () => {
    const [accounts, setAccounts] = useState<IDefaultAccount[]>([]);
    const [currentAccount, setCurrentAccount] = useState<IDefaultAccount>({
        transactionType: '',
        accountCode: '',
        accountName: '',
        description: '',
        isActive: true,
        isSystem: false,
        category: 'other'
    });

    const categories = ['sales', 'purchase', 'inventory', 'banking', 'tax', 'other'];
    const transactionTypes = {
        sales: ['Sales Revenue', 'Sales Returns', 'Sales Discount', 'Customer Advances'],
        purchase: ['Purchase Account', 'Purchase Returns', 'Purchase Discount', 'Vendor Advances'],
        inventory: ['Inventory', 'Cost of Goods Sold', 'Stock Adjustments', 'Work in Progress'],
        banking: ['Bank Charges', 'Bank Interest Income', 'Bank Interest Expense', 'Petty Cash'],
        tax: ['Input GST', 'Output GST', 'TDS Payable', 'TDS Receivable'],
        other: ['Exchange Rate Difference', 'Rounding Account', 'Retained Earnings']
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setAccounts([...accounts, currentAccount]);
        // Reset form
        setCurrentAccount({
            transactionType: '',
            accountCode: '',
            accountName: '',
            description: '',
            isActive: true,
            isSystem: false,
            category: 'other'
        });
    };

    return (
        <div>
            <div className="mb-4 pb-2 border-bottom">
                <h5 className="fw-bold">Default Accounts</h5>
                <p className="text-muted small">Configure default accounts for various transaction types</p>
            </div>

            <Card className="mb-4">
                <Card.Body>
                    <Form onSubmit={handleSubmit}>
                        <Row className="g-3">
                            <Col md={4}>
                                <Form.Group>
                                    <Form.Label>Category</Form.Label>
                                    <Form.Select
                                        value={currentAccount.category}
                                        onChange={e => setCurrentAccount({
                                            ...currentAccount,
                                            category: e.target.value as any,
                                            transactionType: ''
                                        })}
                                        required
                                    >
                                        <option value="">Select Category</option>
                                        {categories.map(category => (
                                            <option key={category} value={category}>
                                                {category.charAt(0).toUpperCase() + category.slice(1)}
                                            </option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group>
                                    <Form.Label>Transaction Type</Form.Label>
                                    <Form.Select
                                        value={currentAccount.transactionType}
                                        onChange={e => setCurrentAccount({...currentAccount, transactionType: e.target.value})}
                                        required
                                    >
                                        <option value="">Select Transaction Type</option>
                                        {currentAccount.category && transactionTypes[currentAccount.category].map(type => (
                                            <option key={type} value={type}>
                                                {type}
                                            </option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group>
                                    <Form.Label>Account Code</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={currentAccount.accountCode}
                                        onChange={e => setCurrentAccount({...currentAccount, accountCode: e.target.value})}
                                        required
                                    />
                                </Form.Group>
                            </Col>

                            <Col md={12}>
                                <Form.Group>
                                    <Form.Label>Account Name</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={currentAccount.accountName}
                                        onChange={e => setCurrentAccount({...currentAccount, accountName: e.target.value})}
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
                                        value={currentAccount.description}
                                        onChange={e => setCurrentAccount({...currentAccount, description: e.target.value})}
                                    />
                                </Form.Group>
                            </Col>

                            <Col md={6}>
                                <Form.Group>
                                    <Form.Check
                                        type="checkbox"
                                        label="Active"
                                        checked={currentAccount.isActive}
                                        onChange={e => setCurrentAccount({...currentAccount, isActive: e.target.checked})}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Check
                                        type="checkbox"
                                        label="System Account"
                                        checked={currentAccount.isSystem}
                                        onChange={e => setCurrentAccount({...currentAccount, isSystem: e.target.checked})}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                        <div className="mt-4 text-end">
                            <Button variant="primary" type="submit">
                                Add Default Account
                            </Button>
                        </div>
                    </Form>
                </Card.Body>
            </Card>

            {/* Default Accounts List */}
            <Card>
                <Card.Body>
                    <h6 className="card-title mb-3">Default Accounts List</h6>
                    <div className="table-responsive">
                        <table className="table table-bordered">
                            <thead>
                                <tr>
                                    <th>Category</th>
                                    <th>Transaction Type</th>
                                    <th>Account Code</th>
                                    <th>Account Name</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {accounts.map((account, index) => (
                                    <tr key={index}>
                                        <td>{account.category}</td>
                                        <td>{account.transactionType}</td>
                                        <td>{account.accountCode}</td>
                                        <td>{account.accountName}</td>
                                        <td>
                                            <span className={`badge ${account.isActive ? 'bg-success' : 'bg-danger'}`}>
                                                {account.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                            {account.isSystem && (
                                                <span className="badge bg-info ms-1">System</span>
                                            )}
                                        </td>
                                        <td>
                                            <Button variant="link" size="sm" className="text-primary">
                                                <i className="fas fa-edit"></i>
                                            </Button>
                                            <Button 
                                                variant="link" 
                                                size="sm" 
                                                className="text-danger"
                                                disabled={account.isSystem}
                                            >
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

            {/* Category Filter */}
            <Card className="mt-4">
                <Card.Body>
                    <h6 className="card-title mb-3">Filter by Category</h6>
                    <Row className="g-2">
                        {categories.map(category => (
                            <Col key={category} md={2}>
                                <Button
                                    variant="outline-secondary"
                                    className="w-100"
                                >
                                    {category.charAt(0).toUpperCase() + category.slice(1)}
                                </Button>
                            </Col>
                        ))}
                    </Row>
                </Card.Body>
            </Card>
        </div>
    );
};

export default DefaultAccounts;