import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Nav, Container, Row, Col, Badge, ProgressBar, Toast, ToastContainer } from 'react-bootstrap';
import { ICompanySetup, ICompanyProfile, ITaxInformation, IFinancialSettings } from './interfaces/company.types';
import CompanyProfile from './components/CompanyProfile';
import TaxInformation from './components/TaxInformation';
import FinancialSettings from './components/FinancialSettings';
import ReviewSubmit from './components/ReviewSubmit';
import { companyService } from './services/company.service';
const CompanySetup: React.FC = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'profile' | 'tax' | 'financial' | 'review'>('profile');
    const [showToast, setShowToast] = useState(false);
    const [formData, setFormData] = useState<ICompanySetup>({
        profile: {
            LegalCompanyName: '',
            LegalEntityType: '',
            RegisteredAddressLine1: '',
            RegisteredAddressLine2: '',
            City: '',
            State: '',
            Pincode: '',
            PhoneNumber: '',
            EmailAddress: '',
            WebsiteUrl: ''
        },
        taxInfo: {
            LegalNameAsPerPANTAN: '',
            PAN: '',
            TAN: '',
            GSTIN: ''
        },
        financialSettings: {
            BaseCurrency: 'INR',
            FinancialYearStartDate: new Date().toISOString().split('T')[0],
            FinancialYearEndDate: new Date().toISOString().split('T')[0]
        }
    });

    const handleProfileUpdate = (profileData: Partial<ICompanyProfile>) => {
        setFormData(prev => ({
            ...prev,
            profile: { ...prev.profile, ...profileData }
        }));
    };

    const handleTaxUpdate = (taxData: Partial<ITaxInformation>) => {
        setFormData(prev => ({
            ...prev,
            taxInfo: { ...prev.taxInfo, ...taxData }
        }));
    };

    const handleFinancialUpdate = (financialData: Partial<IFinancialSettings>) => {
        setFormData(prev => ({
            ...prev,
            financialSettings: { ...prev.financialSettings, ...financialData }
        }));
    };

    const handleSubmit = async () => {
        try {
            const response = await companyService.createCompany(formData);
            setShowToast(true);
            setTimeout(() => {
                // Reset form or redirect after success
                navigate('/erp-setup/company-setup');
            }, 2000);
        } catch (error) {
            console.error('Error creating company:', error);
        }
    };

    const calculateProgress = () => {
        let totalFields = 0;
        let completedFields = 0;

        // Profile fields
        const profileFields = ['LegalCompanyName', 'LegalEntityType', 'RegisteredAddressLine1', 'City', 'State', 'Pincode'];
        totalFields += profileFields.length;
        completedFields += profileFields.filter(field => Boolean(formData.profile[field as keyof ICompanyProfile])).length;

        // Tax fields
        const taxFields = ['LegalNameAsPerPANTAN', 'PAN', 'TAN', 'GSTIN'];
        totalFields += taxFields.length;
        completedFields += taxFields.filter(field => Boolean(formData.taxInfo[field as keyof ITaxInformation])).length;

        // Financial fields
        const financialFields = ['BaseCurrency', 'FinancialYearStartDate', 'FinancialYearEndDate'];
        totalFields += financialFields.length;
        completedFields += financialFields.filter(field => Boolean(formData.financialSettings[field as keyof IFinancialSettings])).length;

        return Math.round((completedFields / totalFields) * 100);
    };

    return (
        <Container className="mt-4 mb-5">
            <ToastContainer className="p-3" position="top-end">
                <Toast 
                    show={showToast} 
                    onClose={() => setShowToast(false)}
                    bg="success"
                    delay={3000}
                    autohide
                >
                    <Toast.Header closeButton={false}>
                        <i className="fas fa-check-circle me-2"></i>
                        <strong className="me-auto">Success</strong>
                    </Toast.Header>
                    <Toast.Body className="text-white">
                        Company setup has been successfully saved!
                    </Toast.Body>
                </Toast>
            </ToastContainer>

            <div className="page-header mb-4">
                <Row className="align-items-center">
                    <Col md={8}>
                        <h1 className="page-title mb-2">Company Setup</h1>
                        <p className="text-muted mb-0">Configure your company's core information and tax details</p>
                    </Col>
                    <Col md={4} className="text-md-end">
                        <Badge bg="warning" text="dark" className="px-3 py-2">
                            <i className="fas fa-info-circle me-1"></i> Setup Incomplete
                        </Badge>
                    </Col>
                </Row>
            </div>

            <Card className="mb-4">
                <Card.Body>
                    <h5 className="card-title mb-3">Setup Progress</h5>
                    <ProgressBar
                        className="setup-progress mb-3"
                        now={calculateProgress()}
                        variant="success"
                    />
                    <div className="d-flex justify-content-between">
                        <small className="text-muted">
                            {Math.round(calculateProgress())}% Complete
                        </small>
                    </div>
                </Card.Body>
            </Card>

            <Card>
                <Card.Header className="p-0 bg-transparent">
                    <Nav className="nav-tabs" role="tablist">
                        <Nav.Item>
                            <Nav.Link
                                active={activeTab === 'profile'}
                                onClick={() => setActiveTab('profile')}
                            >
                                <i className="fas fa-building me-2"></i>Company Profile
                            </Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link
                                active={activeTab === 'tax'}
                                onClick={() => setActiveTab('tax')}
                            >
                                <i className="fas fa-file-invoice me-2"></i>Tax Information
                            </Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link
                                active={activeTab === 'financial'}
                                onClick={() => setActiveTab('financial')}
                            >
                                <i className="fas fa-chart-line me-2"></i>Financial Settings
                            </Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link
                                active={activeTab === 'review'}
                                onClick={() => setActiveTab('review')}
                            >
                                <i className="fas fa-check-circle me-2"></i>Review & Submit
                            </Nav.Link>
                        </Nav.Item>
                    </Nav>
                </Card.Header>
                <Card.Body className="p-4">
                    {activeTab === 'profile' && (
                        <CompanyProfile
                            data={formData.profile}
                            onUpdate={handleProfileUpdate}
                            onNext={() => setActiveTab('tax')}
                        />
                    )}
                    {activeTab === 'tax' && (
                        <TaxInformation
                            data={formData.taxInfo}
                            onUpdate={handleTaxUpdate}
                            onNext={() => setActiveTab('financial')}
                            onBack={() => setActiveTab('profile')}
                        />
                    )}
                    {activeTab === 'financial' && (
                        <FinancialSettings
                            data={formData.financialSettings}
                            onUpdate={handleFinancialUpdate}
                            onNext={() => setActiveTab('review')}
                            onBack={() => setActiveTab('tax')}
                        />
                    )}
                    {activeTab === 'review' && (
                        <ReviewSubmit
                            data={formData}
                            onEdit={(section) => setActiveTab(section)}
                            onSubmit={handleSubmit}
                            onBack={() => setActiveTab('financial')}
                        />
                    )}
                </Card.Body>
            </Card>
        </Container>
    );
};

export default CompanySetup;