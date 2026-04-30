import React, { useState, useEffect } from 'react';
import { Card, Container, Row, Col, Button, Form, Badge, Table, Modal, Toast, ToastContainer } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faSearch, faRedoAlt, faFileInvoice, faEdit, faTrashAlt } from '@fortawesome/free-solid-svg-icons';

// Import common styles
import '../../styles/common.css';

// Import services and types
import { chartOfAccountsService } from '../services/chartofaccounts.service';
import { IChartOfAccountCreate, IChartOfAccountResponse } from '../interfaces/chartofaccounts.types';
import { companyListService } from '../../company/services/companyList.service';
import { ICompanyListItem } from '../../company/interfaces/companyList.types';

interface AccountWithLevel extends IChartOfAccountResponse {
    level: number;
}

const ChartOfAccounts: React.FC = () => {
    // Sample data for testing until API is fully connected
    const sampleAccounts: AccountWithLevel[] = [
        {
            accountId: 1,
            companyId: 1,
            companyName: 'Sample Company',
            parentAccountId: 0,
            parentAccountName: '',
            accountCode: '1000',
            accountName: 'Assets',
            accountType: 'Asset',
            isActive: true,
            costCentreAllocationRequired: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            level: 0,
            balance: 0
        },
        {
            accountId: 2,
            companyId: 1,
            companyName: 'Sample Company',
            parentAccountId: 1,
            parentAccountName: 'Assets',
            accountCode: '1100',
            accountName: 'Current Assets',
            accountType: 'Asset',
            isActive: true,
            costCentreAllocationRequired: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            level: 1,
            balance: 0
        }
    ];
    
    const [accounts, setAccounts] = useState<AccountWithLevel[]>(sampleAccounts);
    const [companies, setCompanies] = useState<ICompanyListItem[]>([
        {
            companyId: 1,
            legalCompanyName: 'Sample Company',
            parentCompanyId: null,
            registeredAddressLine1: '',
            registeredAddressLine2: '',
            city: '',
            state: '',
            pincode: '',
            phoneNumber: '',
            emailAddress: '',
            websiteUrl: '',
            companyLogoPath: '',
            baseCurrency: '',
            financialYearStartDate: '',
            financialYearEndDate: '',
            pan: '',
            tan: '',
            gstin: '',
            legalEntityType: '',
            legalNameAsPerPanTan: '',
            createdAt: '',
            updatedAt: '',
        }
    ]);
    const [showModal, setShowModal] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [toastVariant, setToastVariant] = useState<'success' | 'danger'>('success');
    const [editMode, setEditMode] = useState(false);
    const [currentAccount, setCurrentAccount] = useState<IChartOfAccountCreate>({
        AccountId: 0,
        CompanyId: 0,
        ParentAccountId: 0,
        AccountCode: '',
        AccountName: '',
        AccountType: 'Asset',
        IsActive: true,
        CostCentreAllocationRequired: false,
    });

    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [parentAccounts, setParentAccounts] = useState<AccountWithLevel[]>([]);
    
    // Fetch companies and accounts when component mounts
    useEffect(() => {
        fetchCompanies();
        fetchAccounts();
    }, []);
    
    const fetchCompanies = async () => {
        try {
            const response = await companyListService.getCompanies();
            if (response && response.data) {
                setCompanies(response.data);
            }
        } catch (error) {
            console.error('Error fetching companies:', error);
            setToastVariant('danger');
            setToastMessage('Failed to fetch companies');
            setShowToast(true);
        }
    };
    
    const fetchAccounts = async () => {
        try {
            const response = await chartOfAccountsService.getAccounts();
            if (response && response.data) {
                // Process accounts to add level information
                const processedAccounts = buildAccountHierarchy(response.data);
                setAccounts(processedAccounts);
                
                // Set parent accounts for dropdown
                setParentAccounts(processedAccounts);
            }
        } catch (error) {
            console.error('Error fetching chart of accounts:', error);
            setToastVariant('danger');
            setToastMessage('Failed to fetch chart of accounts');
            setShowToast(true);
        }
    };
    
    // Function to build account hierarchy and add level information
    const buildAccountHierarchy = (accounts: IChartOfAccountResponse[]): AccountWithLevel[] => {
        const accountMap: Map<number, AccountWithLevel> = new Map();
        const rootAccounts: AccountWithLevel[] = [];
        
        // First pass: create all account objects with default level 0
        accounts.forEach(account => {
            const accountWithLevel = { ...account, level: 0 };
            accountMap.set(account.accountId, accountWithLevel);
        });
        
        // Second pass: build hierarchy and set levels
        accounts.forEach(account => {
            const current = accountMap.get(account.accountId);
            
            if (current) {
                if (account.parentAccountId === 0) {
                    // Root level account
                    rootAccounts.push(current);
                } else {
                    // Child account, find parent
                    const parent = accountMap.get(account.parentAccountId);
                    if (parent) {
                        current.level = parent.level + 1;
                    }
                }
            }
        });
        
        return Array.from(accountMap.values());
    };
    
    const handleAddAccount = () => {
        setEditMode(false);
        setCurrentAccount({
            AccountId: 0,
            CompanyId: 0,
            ParentAccountId: 0,
            AccountCode: '',
            AccountName: '',
            AccountType: 'Asset',
            IsActive: true,
            CostCentreAllocationRequired: false,
        });
        setShowModal(true);
    };
    
    const handleEditAccount = (account: AccountWithLevel) => {
        setEditMode(true);
        setCurrentAccount({
            AccountId: account.accountId,
            CompanyId: account.companyId,
            ParentAccountId: account.parentAccountId,
            AccountCode: account.accountCode,
            AccountName: account.accountName,
            AccountType: account.accountType,
            IsActive: account.isActive,
            CostCentreAllocationRequired: account.costCentreAllocationRequired
        });
        setShowModal(true);
    };
    
    const handleDeleteAccount = async (accountId: number) => {
        if (window.confirm('Are you sure you want to delete this account?')) {
            try {
                await chartOfAccountsService.deleteAccount(accountId);
                fetchAccounts(); // Refresh the list
                setToastVariant('success');
                setToastMessage('Account deleted successfully');
                setShowToast(true);
            } catch (error) {
                console.error('Error deleting account:', error);
                setToastVariant('danger');
                setToastMessage('Failed to delete account');
                setShowToast(true);
            }
        }
    };
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        try {
            if (editMode) {
                await chartOfAccountsService.updateAccount(currentAccount.AccountId, currentAccount);
                setToastVariant('success');
                setToastMessage('Account updated successfully');
            } else {
                await chartOfAccountsService.createAccount(currentAccount);
                setToastVariant('success');
                setToastMessage('Account created successfully');
            }
            
            setShowToast(true);
            setShowModal(false);
            fetchAccounts(); // Refresh the list
        } catch (error) {
            console.error(`Error ${editMode ? 'updating' : 'creating'} account:`, error);
            setToastVariant('danger');
            setToastMessage(`Failed to ${editMode ? 'update' : 'create'} account`);
            setShowToast(true);
        }
    };

    return (
        <Container className="mt-4 mb-5">
            <div className="page-header mb-4">
                <Row className="align-items-center">
                    <Col md={8}>
                        <h1 className="page-title mb-2">Chart of Accounts</h1>
                        <p className="text-muted mb-0">Manage your organization's financial accounts structure</p>
                    </Col>
                    <Col md={4} className="text-md-end">
                        <Button variant="primary" onClick={handleAddAccount}>
                            <FontAwesomeIcon icon={faPlus} className="me-2" />
                            Add New Account
                        </Button>
                    </Col>
                </Row>
            </div>

            {/* Search and Filters */}
            <Card className="mb-4">
                <Card.Body>
                    <Row className="g-3 align-items-center">
                        <Col md={6}>
                            <div className="input-group">
                                <span className="input-group-text bg-white">
                                    <FontAwesomeIcon icon={faSearch} className="text-muted" />
                                </span>
                                <Form.Control
                                    type="text"
                                    placeholder="Search accounts..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </Col>
                        <Col md={4}>
                            <Form.Select
                                value={typeFilter}
                                onChange={(e) => setTypeFilter(e.target.value)}
                            >
                                <option value="">All Account Types</option>
                                <option value="Asset">Asset</option>
                                <option value="Liability">Liability</option>
                                <option value="Equity">Equity</option>
                                <option value="Revenue">Revenue</option>
                                <option value="Expense">Expense</option>
                            </Form.Select>
                        </Col>
                        <Col md={2} className="text-end">
                            <Button variant="outline-secondary" onClick={() => {
                                setSearchTerm('');
                                setTypeFilter('');
                            }}>
                                <FontAwesomeIcon icon={faRedoAlt} className="me-2" />
                                Reset
                            </Button>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            {/* Accounts Table */}
            <Card>
                <Card.Body>
                    <Table responsive hover className="align-middle">
                        <thead>
                            <tr>
                                <th style={{ width: '15%' }}>Account Code</th>
                                <th style={{ width: '25%' }}>Account Name</th>
                                <th style={{ width: '15%' }}>Type</th>
                                <th style={{ width: '20%' }}>Parent Account</th>
                                <th style={{ width: '15%' }}>Balance</th>
                                <th style={{ width: '10%' }}>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {accounts.map(account => (
                                <tr key={account.accountId}>
                                    <td>
                                        <div style={{ paddingLeft: `${account.level * 20}px` }}>
                                            <FontAwesomeIcon icon={faFileInvoice} className="me-2 text-muted" />
                                            {account.accountCode}
                                        </div>
                                    </td>
                                    <td>{account.accountName}</td>
                                    <td>{account.accountType}</td>
                                    <td>{account.parentAccountName || '-'}</td>
                                    <td className="text-end">₹ {(account.balance || 0).toLocaleString()}</td>
                                    <td>
                                        <Badge bg={account.isActive ? 'success' : 'warning'}>
                                            {account.isActive ? 'Active' : 'Inactive'}
                                        </Badge>
                                    </td>
                                    <td>
                                        <Button 
                                            variant="link" 
                                            className="btn-sm p-0 me-2"
                                            onClick={() => handleEditAccount(account)}
                                        >
                                            <FontAwesomeIcon icon={faEdit} className="text-primary" />
                                        </Button>
                                        <Button 
                                            variant="link" 
                                            className="btn-sm p-0"
                                            onClick={() => handleDeleteAccount(account.accountId)}
                                        >
                                            <FontAwesomeIcon icon={faTrashAlt} className="text-danger" />
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </Card.Body>
            </Card>
            
            {/* Toast Notifications */}
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
            
            {/* Account Form Modal */}
            <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
                <Form onSubmit={handleSubmit}>
                    <Modal.Header closeButton>
                        <Modal.Title>{editMode ? 'Edit Account' : 'Add New Account'}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Row className="g-3">
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label className="required-field">Company</Form.Label>
                                    <Form.Select
                                        value={currentAccount.CompanyId}
                                        onChange={(e) => {
                                            const value = parseInt(e.target.value);
                                            setCurrentAccount({...currentAccount, CompanyId: value});
                                        }}
                                        required
                                    >
                                        <option value="">Select Company</option>
                                        {companies.map(company => (
                                            <option key={company.companyId} value={company.companyId}>
                                                {company.legalCompanyName}
                                            </option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label>Parent Account</Form.Label>
                                    <Form.Select
                                        value={currentAccount.ParentAccountId}
                                        onChange={(e) => {
                                            const value = parseInt(e.target.value);
                                            setCurrentAccount({...currentAccount, ParentAccountId: value});
                                        }}
                                    >
                                        <option value="0">None (Root Account)</option>
                                        {parentAccounts.map(account => (
                                            <option key={account.accountId} value={account.accountId}>
                                                {account.accountCode} - {account.accountName}
                                            </option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>
                            </Col>

                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label className="required-field">Account Code</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={currentAccount.AccountCode}
                                        onChange={e => setCurrentAccount({...currentAccount, AccountCode: e.target.value})}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label className="required-field">Account Name</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={currentAccount.AccountName}
                                        onChange={e => setCurrentAccount({...currentAccount, AccountName: e.target.value})}
                                        required
                                    />
                                </Form.Group>
                            </Col>

                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label className="required-field">Account Type</Form.Label>
                                    <Form.Select
                                        value={currentAccount.AccountType}
                                        onChange={e => setCurrentAccount({...currentAccount, AccountType: e.target.value})}
                                        required
                                    >
                                        <option value="Asset">Asset</option>
                                        <option value="Liability">Liability</option>
                                        <option value="Equity">Equity</option>
                                        <option value="Revenue">Revenue</option>
                                        <option value="Expense">Expense</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="d-flex align-items-center mt-4">
                                    <Form.Check
                                        type="switch"
                                        id="cost-centre-allocation"
                                        label="Cost Centre Allocation Required"
                                        checked={currentAccount.CostCentreAllocationRequired}
                                        onChange={e => setCurrentAccount({...currentAccount, CostCentreAllocationRequired: e.target.checked})}
                                    />
                                </Form.Group>
                            </Col>
                            
                            <Col md={12}>
                                <Form.Group className="mt-2">
                                    <Form.Check
                                        type="switch"
                                        id="account-status"
                                        label="Active"
                                        checked={currentAccount.IsActive}
                                        onChange={e => setCurrentAccount({...currentAccount, IsActive: e.target.checked})}
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
                            {editMode ? 'Update' : 'Save'} Account
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </Container>
    );
};

export default ChartOfAccounts;