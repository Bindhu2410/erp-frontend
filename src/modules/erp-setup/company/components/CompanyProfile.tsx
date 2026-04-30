import React from 'react';
import { Form, Row, Col, Button } from 'react-bootstrap';
import { ICompanyProfile } from '../interfaces/company.types';

interface Props {
    data: ICompanyProfile;
    onUpdate: (data: Partial<ICompanyProfile>) => void;
    onNext: () => void;
}

const CompanyProfile: React.FC<Props> = ({ data, onUpdate, onNext }) => {
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onNext();
    };

    return (
        <Form onSubmit={handleSubmit}>
            <div className="mb-4 pb-2 border-bottom">
                <h5 className="fw-bold">Basic Information</h5>
                <p className="text-muted small">Enter your company's basic information and contact details.</p>
            </div>

            <Row className="g-3 mb-4">
                <Col md={6}>
                    <Form.Group>
                        <Form.Label className="required-field">Legal Company Name</Form.Label>
                        <Form.Control
                            type="text"
                            value={data.LegalCompanyName}
                            onChange={(e) => onUpdate({ LegalCompanyName: e.target.value })}
                            required
                            placeholder="Enter legal company name"
                        />
                    </Form.Group>
                </Col>
                <Col md={6}>
                    <Form.Group>
                        <Form.Label className="required-field">Legal Entity Type</Form.Label>
                        <Form.Select 
                            value={data.LegalEntityType}
                            onChange={(e) => onUpdate({ LegalEntityType: e.target.value })}
                            required
                        >
                            <option value="">Select entity type</option>
                            <option value="private_limited">Private Limited</option>
                            <option value="public_limited">Public Limited</option>
                            <option value="partnership">Partnership</option>
                            <option value="proprietorship">Proprietorship</option>
                            <option value="llp">LLP</option>
                            <option value="trust">Trust</option>
                            <option value="society">Society</option>
                            <option value="other">Other</option>
                        </Form.Select>
                    </Form.Group>
                </Col>
            </Row>

            <Row className="g-3 mb-4">
                <Col md={12}>
                    <Form.Group>
                        <Form.Label className="required-field">Registered Address Line 1</Form.Label>
                        <Form.Control
                            type="text"
                            value={data.RegisteredAddressLine1}
                            onChange={(e) => onUpdate({ RegisteredAddressLine1: e.target.value })}
                            required
                            placeholder="Enter registered address line 1"
                        />
                    </Form.Group>
                </Col>
                <Col md={12}>
                    <Form.Group>
                        <Form.Label>Address Line 2</Form.Label>
                        <Form.Control
                            type="text"
                            value={data.RegisteredAddressLine2}
                            onChange={(e) => onUpdate({ RegisteredAddressLine2: e.target.value })}
                            placeholder="Enter address line 2 (optional)"
                        />
                    </Form.Group>
                </Col>
            </Row>

            <Row className="g-3 mb-4">
                <Col md={4}>
                    <Form.Group>
                        <Form.Label className="required-field">City</Form.Label>
                        <Form.Control
                            type="text"
                            value={data.City}
                            onChange={(e) => onUpdate({ City: e.target.value })}
                            required
                            placeholder="Enter city"
                        />
                    </Form.Group>
                </Col>
                <Col md={4}>
                    <Form.Group>
                        <Form.Label className="required-field">State</Form.Label>
                        <Form.Control
                            type="text"
                            value={data.State}
                            onChange={(e) => onUpdate({ State: e.target.value })}
                            required
                            placeholder="Enter state"
                        />
                    </Form.Group>
                </Col>
                <Col md={4}>
                    <Form.Group>
                        <Form.Label className="required-field">PIN Code</Form.Label>
                        <Form.Control
                            type="text"
                            value={data.Pincode}
                            onChange={(e) => onUpdate({ Pincode: e.target.value })}
                            required
                            placeholder="Enter PIN code"
                            maxLength={6}
                        />
                    </Form.Group>
                </Col>
            </Row>

            <Row className="g-3 mb-4">
                <Col md={4}>
                    <Form.Group>
                        <Form.Label>Phone Number</Form.Label>
                        <Form.Control
                            type="tel"
                            value={data.PhoneNumber}
                            onChange={(e) => onUpdate({ PhoneNumber: e.target.value })}
                            placeholder="Enter phone number"
                        />
                    </Form.Group>
                </Col>
                <Col md={4}>
                    <Form.Group>
                        <Form.Label>Email Address</Form.Label>
                        <Form.Control
                            type="email"
                            value={data.EmailAddress}
                            onChange={(e) => onUpdate({ EmailAddress: e.target.value })}
                            placeholder="Enter email address"
                        />
                    </Form.Group>
                </Col>
                <Col md={4}>
                    <Form.Group>
                        <Form.Label>Website URL</Form.Label>
                        <Form.Control
                            type="url"
                            value={data.WebsiteUrl}
                            onChange={(e) => onUpdate({ WebsiteUrl: e.target.value })}
                            placeholder="Enter website URL"
                        />
                    </Form.Group>
                </Col>
            </Row>

            <div className="text-end">
                <Button type="submit" variant="primary">
                    Next <i className="fas fa-arrow-right ms-2"></i>
                </Button>
            </div>
        </Form>
    );
};

export default CompanyProfile;