import React, { useState, useEffect, useCallback } from 'react';
import { Button, Form, Table, Badge, Modal, Container, Card } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { useCompanyContext } from '../../../../components/common/context/CompanyContext';
import { ITdsRate, ITdsRateFormData, ITdsRateApiResponseItem } from '../interfaces/tds.types';
import { tdsService } from '../services/tds.service';
import '../styles/tax-setup.css';
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';

const deducteeTypes = [
    'Individual',
    'HUF',
    'Company',
    'Partnership Firm',
    'AOP/BOI',
    'Trust',
    'Others'
];

const initialFormData: ITdsRateFormData = {
    tdsSection: '',
    tdsDescription: '',
    paymentNature: '',
    deducteeType: '',
    thresholdAmount: 0,
    tdsRate: 0,
    surchargeRate: 0,
    ecessRate: 0,
    sheEcessRate: 0,
    effectiveFromDate: new Date(),
    effectiveToDate: undefined,
    isActive: true,
};

const TdsSetup: React.FC = () => {
    const { companyId } = useCompanyContext();
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState<ITdsRateFormData>(initialFormData);
    const [tdsRates, setTdsRates] = useState<ITdsRate[]>([]);
    const [isEditing, setIsEditing] = useState(false);
    const [currentId, setCurrentId] = useState<number | undefined>();
    const [searchTerm, setSearchTerm] = useState('');

    // Load TDS Rates
    const loadTdsRates = useCallback(async () => {
        if (!companyId) return;
        
        try {
            const response = await tdsService.getAll(companyId);
            // Check if response.data is array or single item
            const ratesData = Array.isArray(response.data) ? response.data : [response.data];
            
            // Transform API response to component format
            const transformedRates: ITdsRate[] = ratesData.map(rate => ({
                id: rate.tdsRateId,
                tdsSection: rate.sectionType || '',
                tdsDescription: rate.description || '',
                paymentNature: rate.paymentNature || '',
                deducteeType: rate.deducteeType || '',
                thresholdAmount: rate.thresholdAmount || 0,
                tdsRate: rate.rate || 0,
                surchargeRate: rate.surchargeRate || 0,
                ecessRate: rate.ecessRate || 0,
                sheEcessRate: rate.sheEcessRate || 0,
                effectiveFromDate: new Date(rate.effectiveDate || new Date()),
                effectiveToDate: rate.effectiveToDate ? new Date(rate.effectiveToDate) : undefined,
                isActive: rate.isActive !== undefined ? rate.isActive : true,
                companyId: rate.companyId || 0
            }));
            
            setTdsRates(transformedRates);
        } catch (error) {
            toast.error('Failed to load TDS rates');
            console.error('Error loading TDS rates:', error);
        }
    }, [companyId]);

    useEffect(() => {
        if (companyId) {
            loadTdsRates();
        }
    }, [companyId, loadTdsRates]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!companyId) return;

        try {
            if (isEditing && currentId !== undefined) {
                await tdsService.update(companyId, currentId, formData);
                toast.success('TDS rate updated successfully');
            } else {
                // Call the API to create a new TDS rate
                await tdsService.create(companyId, formData);
                toast.success('TDS rate created successfully');
            }

            handleCloseModal();
            loadTdsRates(); // Refresh the list after creating/updating
        } catch (error) {
            toast.error(isEditing ? 'Failed to update TDS rate' : 'Failed to create TDS rate');
            console.error('Error saving TDS rate:', error);
        }
    };

    const handleDelete = async (id: number | undefined) => {
        if (!id || !companyId || !window.confirm('Are you sure you want to delete this TDS rate?')) return;

        try {
            await tdsService.delete(companyId, id);
            toast.success('TDS rate deleted successfully');
            loadTdsRates();
        } catch (error) {
            toast.error('Failed to delete TDS rate');
            console.error('Error deleting TDS rate:', error);
        }
    };

    const handleEdit = (tdsRate: ITdsRate) => {
        setIsEditing(true);
        setCurrentId(tdsRate.id);
        setFormData({
            tdsSection: tdsRate.tdsSection,
            tdsDescription: tdsRate.tdsDescription,
            paymentNature: tdsRate.paymentNature,
            deducteeType: tdsRate.deducteeType,
            thresholdAmount: tdsRate.thresholdAmount,
            tdsRate: tdsRate.tdsRate,
            surchargeRate: tdsRate.surchargeRate,
            ecessRate: tdsRate.ecessRate,
            sheEcessRate: tdsRate.sheEcessRate,
            effectiveFromDate: new Date(tdsRate.effectiveFromDate),
            effectiveToDate: tdsRate.effectiveToDate ? new Date(tdsRate.effectiveToDate) : undefined,
            isActive: tdsRate.isActive,
        });
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setIsEditing(false);
        setCurrentId(undefined);
        setFormData(initialFormData);
    };

    const filteredTdsRates = tdsRates.filter(rate => 
        rate.tdsSection.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rate.tdsDescription.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rate.paymentNature.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rate.deducteeType.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="tax-setup-container">
            <div className="page-header">
                <h1><i className="fas fa-percent me-2"></i>TDS Rate Setup</h1>
                <p className="mb-0">Manage Tax Deducted at Source (TDS) Rates</p>
            </div>

            <Container>
                <Card className="mb-4">
                    <Card.Body>
                        <div className="heading-with-button">
                            <h2>TDS Rates</h2>
                            <Button 
                                variant="primary"
                                onClick={() => setShowModal(true)}
                                className="d-flex align-items-center"
                            >
                                <FaPlus className="me-2" /> Add TDS Rate
                            </Button>
                        </div>

                        <div className="search-box">
                            <Form.Control
                                type="text"
                                placeholder="Search TDS rates..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <Table responsive hover>
                            <thead>
                                <tr>
                                    <th>Section</th>
                                    <th>Description</th>
                                    <th>Payment Nature</th>
                                    <th>Deductee Type</th>
                                    <th className="text-end">Threshold</th>
                                    <th className="text-end">TDS Rate (%)</th>
                                    <th className="text-end">Surcharge (%)</th>
                                    <th className="text-end">E-Cess (%)</th>
                                    <th className="text-end">SHE-Cess (%)</th>
                                    <th>Status</th>
                                    <th className="text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredTdsRates.map((rate) => (
                                    <tr key={rate.id}>
                                        <td>{rate.tdsSection}</td>
                                        <td>{rate.tdsDescription}</td>
                                        <td>{rate.paymentNature}</td>
                                        <td>{rate.deducteeType}</td>
                                        <td className="text-end">₹{rate.thresholdAmount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
                                        <td className="text-end">{rate.tdsRate.toFixed(2)}</td>
                                        <td className="text-end">{rate.surchargeRate.toFixed(2)}</td>
                                        <td className="text-end">{rate.ecessRate.toFixed(2)}</td>
                                        <td className="text-end">{rate.sheEcessRate.toFixed(2)}</td>
                                        <td>
                                            <Badge bg={rate.isActive ? 'success' : 'danger'} className="status-badge">
                                                {rate.isActive ? 'Active' : 'Inactive'}
                                            </Badge>
                                        </td>
                                        <td className="text-center table-actions">
                                            <Button
                                                variant="outline-primary"
                                                size="sm"
                                                className="me-2"
                                                onClick={() => handleEdit(rate)}
                                            >
                                                <FaEdit />
                                            </Button>
                                            <Button
                                                variant="outline-danger"
                                                size="sm"
                                                onClick={() => handleDelete(rate.id)}
                                            >
                                                <FaTrash />
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </Card.Body>
                </Card>

                <Modal show={showModal} onHide={handleCloseModal} size="lg">
                    <Modal.Header closeButton>
                        <Modal.Title>{isEditing ? 'Edit TDS Rate' : 'Add New TDS Rate'}</Modal.Title>
                    </Modal.Header>
                    <Form onSubmit={handleSubmit}>
                        <Modal.Body>
                            <div className="row">
                                <div className="col-md-6">
                                    <Form.Group className="mb-3">
                                        <Form.Label className="required-field">TDS Section</Form.Label>
                                        <Form.Control
                                            type="text"
                                            value={formData.tdsSection}
                                            onChange={(e) => setFormData({ ...formData, tdsSection: e.target.value })}
                                            required
                                        />
                                    </Form.Group>
                                </div>
                                <div className="col-md-6">
                                    <Form.Group className="mb-3">
                                        <Form.Label>Payment Nature</Form.Label>
                                        <Form.Control
                                            type="text"
                                            value={formData.paymentNature}
                                            onChange={(e) => setFormData({ ...formData, paymentNature: e.target.value })}
                                        />
                                    </Form.Group>
                                </div>
                            </div>

                            <Form.Group className="mb-3">
                                <Form.Label className="required-field">Description</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={formData.tdsDescription}
                                    onChange={(e) => setFormData({ ...formData, tdsDescription: e.target.value })}
                                    required
                                />
                            </Form.Group>

                            <div className="row">
                                <div className="col-md-6">
                                    <Form.Group className="mb-3">
                                        <Form.Label className="required-field">Deductee Type</Form.Label>
                                        <Form.Select
                                            value={formData.deducteeType}
                                            onChange={(e) => setFormData({ ...formData, deducteeType: e.target.value })}
                                            required
                                        >
                                            <option value="">Select Type</option>
                                            {deducteeTypes.map(type => (
                                                <option key={type} value={type}>{type}</option>
                                            ))}
                                        </Form.Select>
                                    </Form.Group>
                                </div>
                                <div className="col-md-6">
                                    <Form.Group className="mb-3">
                                        <Form.Label>Threshold Amount (₹)</Form.Label>
                                        <Form.Control
                                            type="number"
                                            className="numeric-input"
                                            value={formData.thresholdAmount}
                                            onChange={(e) => setFormData({ ...formData, thresholdAmount: parseFloat(e.target.value) || 0 })}
                                            min="0"
                                            step="1"
                                        />
                                    </Form.Group>
                                </div>
                            </div>

                            <div className="row">
                                <div className="col-md-6">
                                    <Form.Group className="mb-3">
                                        <Form.Label className="required-field">TDS Rate (%)</Form.Label>
                                        <Form.Control
                                            type="number"
                                            className="numeric-input"
                                            value={formData.tdsRate}
                                            onChange={(e) => setFormData({ ...formData, tdsRate: parseFloat(e.target.value) || 0 })}
                                            min="0"
                                            max="100"
                                            step="0.01"
                                            required
                                        />
                                    </Form.Group>
                                </div>
                                <div className="col-md-6">
                                    <Form.Group className="mb-3">
                                        <Form.Label>Surcharge Rate (%)</Form.Label>
                                        <Form.Control
                                            type="number"
                                            className="numeric-input"
                                            value={formData.surchargeRate}
                                            onChange={(e) => setFormData({ ...formData, surchargeRate: parseFloat(e.target.value) || 0 })}
                                            min="0"
                                            max="100"
                                            step="0.01"
                                        />
                                    </Form.Group>
                                </div>
                            </div>

                            <div className="row">
                                <div className="col-md-6">
                                    <Form.Group className="mb-3">
                                        <Form.Label>E-Cess Rate (%)</Form.Label>
                                        <Form.Control
                                            type="number"
                                            className="numeric-input"
                                            value={formData.ecessRate}
                                            onChange={(e) => setFormData({ ...formData, ecessRate: parseFloat(e.target.value) || 0 })}
                                            min="0"
                                            max="100"
                                            step="0.01"
                                        />
                                    </Form.Group>
                                </div>
                                <div className="col-md-6">
                                    <Form.Group className="mb-3">
                                        <Form.Label>SHE-Cess Rate (%)</Form.Label>
                                        <Form.Control
                                            type="number"
                                            className="numeric-input"
                                            value={formData.sheEcessRate}
                                            onChange={(e) => setFormData({ ...formData, sheEcessRate: parseFloat(e.target.value) || 0 })}
                                            min="0"
                                            max="100"
                                            step="0.01"
                                        />
                                    </Form.Group>
                                </div>
                            </div>

                            <div className="row">
                                <div className="col-md-6">
                                    <Form.Group className="mb-3">
                                        <Form.Label className="required-field">Effective From</Form.Label>
                                        <Form.Control
                                            type="date"
                                            value={formData.effectiveFromDate.toISOString().split('T')[0]}
                                            onChange={(e) => setFormData({ ...formData, effectiveFromDate: new Date(e.target.value) })}
                                            required
                                        />
                                    </Form.Group>
                                </div>
                                <div className="col-md-6">
                                    <Form.Group className="mb-3">
                                        <Form.Label>Effective To</Form.Label>
                                        <Form.Control
                                            type="date"
                                            value={formData.effectiveToDate?.toISOString().split('T')[0] || ''}
                                            onChange={(e) => setFormData({ ...formData, effectiveToDate: e.target.value ? new Date(e.target.value) : undefined })}
                                            min={formData.effectiveFromDate.toISOString().split('T')[0]}
                                        />
                                    </Form.Group>
                                </div>
                            </div>

                            <Form.Group className="mb-3">
                                <Form.Check
                                    type="switch"
                                    id="isActive"
                                    label="Active"
                                    checked={formData.isActive}
                                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                />
                            </Form.Group>
                        </Modal.Body>
                        <Modal.Footer>
                            <Button variant="outline-secondary" onClick={handleCloseModal}>
                                Cancel
                            </Button>
                            <Button variant="primary" type="submit">
                                {isEditing ? 'Update' : 'Save'} TDS Rate
                            </Button>
                        </Modal.Footer>
                    </Form>
                </Modal>
            </Container>
        </div>
    );
};

export default TdsSetup;