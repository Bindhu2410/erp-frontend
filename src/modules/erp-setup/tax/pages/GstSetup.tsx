import React, { useState, useEffect, useCallback } from 'react';
import { Card, Container, Row, Col, Button, Form, Badge, Table, Modal } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faSearch, faRedoAlt, faPercent, faEdit, faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import { useCompanyContext } from '../../../../components/common/context/CompanyContext';
import { IGstRate, IGstRateFormData } from '../interfaces/gst.types';
import { gstService } from '../services/gst.service';
import { toast } from 'react-toastify';
import { companyListService } from '../../company/services/companyList.service';
import { ICompanyListItem } from '../../company/interfaces/companyList.types';

// Import common styles
import '../../styles/common.css';
import '../styles/tax-setup.css';

const initialFormData: IGstRateFormData = {
    code: '',
    description: '',
    cgstRate: 0,
    sgstRate: 0,
    igstRate: 0,
    status: 'active',
    applicableFrom: new Date().toISOString().split('T')[0],
    hsnSacCode: '',
    isHsn: true
};

const GstSetup: React.FC = () => {
    const { companyId: contextCompanyId } = useCompanyContext();
    const [companyList, setCompanyList] = useState<ICompanyListItem[]>([]);
    const [selectedCompanyId, setSelectedCompanyId] = useState<number | undefined>(contextCompanyId);
    const [gstRates, setGstRates] = useState<IGstRate[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState<IGstRateFormData>(initialFormData);
    const [isEditing, setIsEditing] = useState(false);
    const [currentId, setCurrentId] = useState<number | undefined>();

    useEffect(() => {
        async function fetchCompanies() {
            try {
                const res = await companyListService.getCompanies();
                setCompanyList(res.data || []);
                if (!selectedCompanyId && res.data && res.data.length > 0) {
                    setSelectedCompanyId(res.data[0].companyId);
                }
            } catch (error) {
                toast.error('Failed to load company list');
            }
        }
        fetchCompanies();
    }, []);

    const loadGstRates = useCallback(async () => {
        if (!selectedCompanyId) return;
        try {
            const response = await gstService.getAll(selectedCompanyId);
            const gstData = Array.isArray(response.data) ? response.data : [response.data];
            const transformedGstRates: IGstRate[] = gstData.map(item => ({
                id: item.gstRateId,
                code: item.hsnSacCode,
                description: item.description || `GST Rate ${item.gstRate}%`,
                cgstRate: item.cgstRate || item.gstRate / 2,
                sgstRate: item.sgstRate || item.gstRate / 2,
                igstRate: item.gstRate,
                status: item.isActive ? 'active' : 'inactive',
                applicableFrom: item.effectiveDate,
                companyId: item.companyId,
                hsnSacCode: item.hsnSacCode,
                isHsn: item.isHsn
            }));
            setGstRates(transformedGstRates);
        } catch (error) {
            toast.error('Failed to load GST rates');
            console.error('Error loading GST rates:', error);
        }
    }, [selectedCompanyId]);

    useEffect(() => {
        if (selectedCompanyId) {
            loadGstRates();
        }
    }, [selectedCompanyId, loadGstRates]);

    const handleAddGstRate = () => {
        setIsEditing(false);
        setCurrentId(undefined);
        setFormData(initialFormData);
        setShowModal(true);
    };

    const handleEditGstRate = (rate: IGstRate) => {
        setIsEditing(true);
        setCurrentId(rate.id as number);
        setFormData({
            code: rate.code,
            description: rate.description,
            cgstRate: rate.cgstRate,
            sgstRate: rate.sgstRate,
            igstRate: rate.igstRate,
            status: rate.status,
            applicableFrom: new Date(rate.applicableFrom).toISOString().split('T')[0],
            hsnSacCode: rate.hsnSacCode || rate.code,
            isHsn: rate.isHsn !== undefined ? rate.isHsn : true
        });
        setShowModal(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedCompanyId) {
            toast.error('Company ID is required');
            return;
        }
        try {
            if (isEditing && currentId !== undefined) {
                await gstService.update(currentId, selectedCompanyId, formData);
                toast.success('GST rate updated successfully');
            } else {
                await gstService.create(selectedCompanyId, formData);
                toast.success('GST rate created successfully');
            }
            handleCloseModal();
            loadGstRates();
        } catch (error) {
            toast.error(isEditing ? 'Failed to update GST rate' : 'Failed to create GST rate');
            console.error('Error saving GST rate:', error);
        }
    };

    const handleDeleteGstRate = async (id: number | string) => {
        if (!selectedCompanyId) return;
        if (!window.confirm('Are you sure you want to delete this GST rate?')) return;
        try {
            await gstService.delete(id as number, selectedCompanyId);
            toast.success('GST rate deleted successfully');
            loadGstRates();
        } catch (error) {
            toast.error('Failed to delete GST rate');
            console.error('Error deleting GST rate:', error);
        }
    };

    const filteredGstRates = gstRates.filter(rate => {
        const matchesSearch = searchTerm === '' || 
            rate.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
            rate.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === '' || rate.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const handleCloseModal = useCallback(() => {
        setShowModal(false);
        setIsEditing(false);
        setCurrentId(undefined);
        setFormData(initialFormData);
    }, []);

    return (
        <Container className="mt-4 mb-5 tax-setup-container">
            <div className="page-header mb-4">
                <Row className="align-items-center">
                    <Col md={6}>
                        <h1 className="page-title mb-2">GST Setup</h1>
                        <p className="text-muted mb-0">Configure GST rates and rules for your organization</p>
                    </Col>
                    <Col md={3}>
                        <Form.Select
                            value={selectedCompanyId || ''}
                            onChange={e => setSelectedCompanyId(Number(e.target.value))}
                            aria-label="Select Company"
                        >
                            <option value="">Select Company</option>
                            {companyList.map(company => (
                                <option key={company.companyId} value={company.companyId}>
                                    {company.legalCompanyName}
                                </option>
                            ))}
                        </Form.Select>
                    </Col>
                    <Col md={3} className="text-md-end">
                        <Button variant="primary" onClick={handleAddGstRate}>
                            <FontAwesomeIcon icon={faPlus} className="me-2" />
                            Add New Rate
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
                                    placeholder="Search GST rates..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </Col>
                        <Col md={4}>
                            <Form.Select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >
                                <option value="">All Status</option>
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </Form.Select>
                        </Col>
                        <Col md={2} className="text-end">
                            <Button variant="outline-secondary" onClick={() => {
                                setSearchTerm('');
                                setStatusFilter('');
                            }}>
                                <FontAwesomeIcon icon={faRedoAlt} className="me-2" />
                                Reset
                            </Button>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            {/* GST Rates Table */}
            <Card>
                <Card.Body>
                    <Table responsive hover className="align-middle">
                        <thead>
                            <tr>
                                <th>Code</th>
                                <th>Description</th>
                                <th>CGST Rate</th>
                                <th>SGST Rate</th>
                                <th>IGST Rate</th>
                                <th>Applicable From</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredGstRates.length > 0 ? (
                                filteredGstRates.map(rate => (
                                    <tr key={rate.id}>
                                        <td>
                                            <FontAwesomeIcon icon={faPercent} className="me-2 text-muted" />
                                            {rate.code}
                                        </td>
                                        <td>{rate.description}</td>
                                        <td>{rate.cgstRate}%</td>
                                        <td>{rate.sgstRate}%</td>
                                        <td>{rate.igstRate}%</td>
                                        <td>{new Date(rate.applicableFrom).toLocaleDateString()}</td>
                                        <td>
                                            <Badge bg={rate.status === 'active' ? 'success' : 'warning'}>
                                                {rate.status.charAt(0).toUpperCase() + rate.status.slice(1)}
                                            </Badge>
                                        </td>
                                        <td>
                                            <Button 
                                                variant="link" 
                                                className="btn-sm p-0 me-2" 
                                                onClick={() => handleEditGstRate(rate)}
                                            >
                                                <FontAwesomeIcon icon={faEdit} className="text-primary" />
                                            </Button>
                                            <Button 
                                                variant="link" 
                                                className="btn-sm p-0"
                                                onClick={() => handleDeleteGstRate(rate.id!)}
                                            >
                                                <FontAwesomeIcon icon={faTrashAlt} className="text-danger" />
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={8} className="text-center py-4">
                                        No GST rates found. {searchTerm || statusFilter ? 'Try adjusting your filters.' : 'Add a new rate to get started.'}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </Table>
                </Card.Body>
            </Card>

            {/* Add/Edit GST Rate Modal */}
            <Modal show={showModal} onHide={handleCloseModal} backdrop="static" keyboard={false} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>{isEditing ? 'Edit GST Rate' : 'Add New GST Rate'}</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleSubmit}>
                    <Modal.Body>
                        <Row className="mb-3">
                            <Col md={6}>
                                <Form.Group controlId="formHsnSacCode">
                                    <Form.Label>HSN/SAC Code</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Enter HSN/SAC code"
                                        value={formData.hsnSacCode}
                                        onChange={(e) => setFormData({...formData, hsnSacCode: e.target.value, code: e.target.value})}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group controlId="formIsHsn">
                                    <Form.Label>Code Type</Form.Label>
                                    <Form.Select
                                        value={formData.isHsn ? "hsn" : "sac"}
                                        onChange={(e) => setFormData({...formData, isHsn: e.target.value === "hsn"})}
                                        required
                                    >
                                        <option value="hsn">HSN Code</option>
                                        <option value="sac">SAC Code</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                        </Row>

                        <Form.Group className="mb-3" controlId="formDescription">
                            <Form.Label>Description</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={2}
                                placeholder="Enter description"
                                value={formData.description}
                                onChange={(e) => setFormData({...formData, description: e.target.value})}
                                required
                            />
                        </Form.Group>

                        <Row className="mb-3">
                            <Col md={4}>
                                <Form.Group controlId="formCgstRate">
                                    <Form.Label>CGST Rate (%)</Form.Label>
                                    <Form.Control
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        max="100"
                                        placeholder="Enter CGST rate"
                                        value={formData.cgstRate}
                                        onChange={(e) => {
                                            const cgstRate = parseFloat(e.target.value);
                                            const sgstRate = formData.sgstRate;
                                            setFormData({
                                                ...formData, 
                                                cgstRate, 
                                                igstRate: cgstRate + sgstRate
                                            });
                                        }}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group controlId="formSgstRate">
                                    <Form.Label>SGST Rate (%)</Form.Label>
                                    <Form.Control
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        max="100"
                                        placeholder="Enter SGST rate"
                                        value={formData.sgstRate}
                                        onChange={(e) => {
                                            const sgstRate = parseFloat(e.target.value);
                                            const cgstRate = formData.cgstRate;
                                            setFormData({
                                                ...formData, 
                                                sgstRate,
                                                igstRate: cgstRate + sgstRate
                                            });
                                        }}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group controlId="formIgstRate">
                                    <Form.Label>IGST Rate (%)</Form.Label>
                                    <Form.Control
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        max="100"
                                        placeholder="Enter IGST rate"
                                        value={formData.igstRate}
                                        disabled
                                        required
                                    />
                                    <Form.Text className="text-muted">
                                        Auto-calculated (CGST + SGST)
                                    </Form.Text>
                                </Form.Group>
                            </Col>
                        </Row>

                        <Row className="mb-3">
                            <Col md={6}>
                                <Form.Group controlId="formApplicableFrom">
                                    <Form.Label>Applicable From</Form.Label>
                                    <Form.Control
                                        type="date"
                                        value={formData.applicableFrom}
                                        onChange={(e) => setFormData({...formData, applicableFrom: e.target.value})}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group controlId="formStatus">
                                    <Form.Label>Status</Form.Label>
                                    <Form.Select
                                        value={formData.status}
                                        onChange={(e) => setFormData({...formData, status: e.target.value as 'active' | 'inactive'})}
                                        required
                                    >
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                        </Row>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={handleCloseModal}>
                            Cancel
                        </Button>
                        <Button variant="primary" type="submit">
                            {isEditing ? 'Update' : 'Save'}
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </Container>
    );
};

export default GstSetup;