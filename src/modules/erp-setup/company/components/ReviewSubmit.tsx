import React from 'react';
import { Card, Button } from 'react-bootstrap';
import { ICompanySetup } from '../interfaces/company.types';

interface Props {
    data: ICompanySetup;
    onEdit: (section: 'profile' | 'tax' | 'financial') => void;
    onSubmit: () => void;
    onBack: () => void;
}

const ReviewSubmit: React.FC<Props> = ({ data, onEdit, onSubmit, onBack }) => {
    return (
        <div>
            <div className="mb-4 pb-2 border-bottom">
                <h5 className="fw-bold">Review & Submit</h5>
                <p className="text-muted small">Review your company setup information before submitting.</p>
            </div>

            <Card className="mb-4">
                <Card.Body>
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <h6 className="mb-0">Company Profile</h6>
                        <Button variant="link" className="text-primary p-0" onClick={() => onEdit('profile')}>
                            <i className="fas fa-edit me-1"></i> Edit
                        </Button>
                    </div>
                    <div className="row">
                        <div className="col-md-6">
                            <div className="border-bottom pb-2 mb-2">
                                <small className="text-muted d-block">Legal Company Name</small>
                                <div className="fw-bold">{data.profile.LegalCompanyName || '--'}</div>
                            </div>
                        </div>
                        <div className="col-md-6">
                            <div className="border-bottom pb-2 mb-2">
                                <small className="text-muted d-block">Legal Entity Type</small>
                                <div className="fw-bold">{data.profile.LegalEntityType || '--'}</div>
                            </div>
                        </div>
                        <div className="col-md-12">
                            <div className="border-bottom pb-2 mb-2">
                                <small className="text-muted d-block">Registered Address</small>
                                <div className="fw-bold">
                                    {data.profile.RegisteredAddressLine1}, {data.profile.RegisteredAddressLine2}, {data.profile.City}, {data.profile.State}, {data.profile.Pincode}
                                </div>
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="border-bottom pb-2 mb-2">
                                <small className="text-muted d-block">Phone</small>
                                <div className="fw-bold">{data.profile.PhoneNumber || '--'}</div>
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="border-bottom pb-2 mb-2">
                                <small className="text-muted d-block">Email</small>
                                <div className="fw-bold">{data.profile.EmailAddress || '--'}</div>
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="border-bottom pb-2 mb-2">
                                <small className="text-muted d-block">Website</small>
                                <div className="fw-bold">{data.profile.WebsiteUrl || '--'}</div>
                            </div>
                        </div>
                    </div>
                </Card.Body>
            </Card>

            <Card className="mb-4">
                <Card.Body>
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <h6 className="mb-0">Tax Information</h6>
                        <Button variant="link" className="text-primary p-0" onClick={() => onEdit('tax')}>
                            <i className="fas fa-edit me-1"></i> Edit
                        </Button>
                    </div>
                    <div className="row">
                        <div className="col-md-12">
                            <div className="border-bottom pb-2 mb-2">
                                <small className="text-muted d-block">Legal Name as per PAN/TAN</small>
                                <div className="fw-bold">{data.taxInfo.LegalNameAsPerPANTAN || '--'}</div>
                            </div>
                        </div>
                        <div className="col-md-6">
                            <div className="border-bottom pb-2 mb-2">
                                <small className="text-muted d-block">PAN</small>
                                <div className="fw-bold">{data.taxInfo.PAN || '--'}</div>
                            </div>
                        </div>
                        <div className="col-md-6">
                            <div className="border-bottom pb-2 mb-2">
                                <small className="text-muted d-block">TAN</small>
                                <div className="fw-bold">{data.taxInfo.TAN || '--'}</div>
                            </div>
                        </div>
                        <div className="col-md-6">
                            <div className="border-bottom pb-2 mb-2">
                                <small className="text-muted d-block">GSTIN</small>
                                <div className="fw-bold">{data.taxInfo.GSTIN || '--'}</div>
                            </div>
                        </div>
                    </div>
                </Card.Body>
            </Card>

            <Card className="mb-4">
                <Card.Body>
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <h6 className="mb-0">Financial Settings</h6>
                        <Button variant="link" className="text-primary p-0" onClick={() => onEdit('financial')}>
                            <i className="fas fa-edit me-1"></i> Edit
                        </Button>
                    </div>
                    <div className="row">
                        <div className="col-md-6">
                            <div className="border-bottom pb-2 mb-2">
                                <small className="text-muted d-block">Base Currency</small>
                                <div className="fw-bold">{data.financialSettings.BaseCurrency || '--'}</div>
                            </div>
                        </div>
                        <div className="col-md-6">
                            <div className="border-bottom pb-2 mb-2">
                                <small className="text-muted d-block">Financial Year Start Date</small>
                                <div className="fw-bold">{data.financialSettings.FinancialYearStartDate || '--'}</div>
                            </div>
                        </div>
                        <div className="col-md-6">
                            <div className="border-bottom pb-2 mb-2">
                                <small className="text-muted d-block">Financial Year End Date</small>
                                <div className="fw-bold">{data.financialSettings.FinancialYearEndDate || '--'}</div>
                            </div>
                        </div>
                    </div>
                </Card.Body>
            </Card>

            <div className="text-end">
                <Button type="button" variant="outline-secondary" className="me-2" onClick={onBack}>
                    <i className="fas fa-arrow-left me-2"></i> Back
                </Button>
                <Button type="button" variant="primary" onClick={onSubmit}>
                    Submit <i className="fas fa-check ms-2"></i>
                </Button>
            </div>
        </div>
    );
};

export default ReviewSubmit;