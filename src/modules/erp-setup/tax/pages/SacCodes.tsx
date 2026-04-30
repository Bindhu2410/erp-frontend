import React, { useState, useEffect, useCallback } from 'react';
import { Button, Form, Table, Badge, Modal, Container, Card } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { useCompanyContext } from '../../../../components/common/context/CompanyContext';
import { ISacCode, ISacCodeFormData } from '../interfaces/sac.types';
import { sacService } from '../services/sac.service';
import '../styles/tax-setup.css';
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';

const initialFormData: ISacCodeFormData = {
    sacCode: '',
    sacDescription: '',
    gstRate: 0,
    igstRate: 0,
    cgstRate: 0,
    sgstRate: 0,
    utgstRate: 0,
    cessRate: 0,
    isActive: true,
};

const SacCodes: React.FC = () => {
    const { companyId } = useCompanyContext();
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState<ISacCodeFormData>(initialFormData);
    const [sacCodes, setSacCodes] = useState<ISacCode[]>([]);
    const [isEditing, setIsEditing] = useState(false);
    const [currentId, setCurrentId] = useState<number | undefined>();
    const [searchTerm, setSearchTerm] = useState('');

    const handleCloseModal = useCallback(() => {
        setShowModal(false);
        setIsEditing(false);
        setCurrentId(undefined);
        setFormData(initialFormData);
    }, []);

    // Load SAC Codes
    const loadSacCodes = useCallback(async () => {
        if (!companyId) return;
        
        try {
            const response = await sacService.getAll(companyId);
            
            // Check if response.data is array or single item
            const sacData = Array.isArray(response.data) ? response.data : [response.data];
            
            // Transform API response to component format
            const transformedSacCodes: ISacCode[] = sacData.map(item => ({
                id: item.sacCodeId,
                sacCode: item.sacCode || '',
                sacDescription: item.description || '',
                gstRate: item.defaultGstRate || 0,
                igstRate: item.igstRate || 0,
                cgstRate: item.cgstRate || 0,
                sgstRate: item.sgstRate || 0,
                utgstRate: item.utgstRate || 0,
                cessRate: item.cessRate || 0,
                isActive: item.isActive !== undefined ? item.isActive : true,
                companyId: item.companyId || 0
            }));
            
            setSacCodes(transformedSacCodes);
        } catch (error) {
            toast.error('Failed to load SAC codes');
            console.error('Error loading SAC codes:', error);
        }
    }, [companyId]);

    useEffect(() => {
        if (companyId) {
            loadSacCodes();
        }
    }, [companyId, loadSacCodes]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!companyId) {
            toast.error('Company ID is required');
            return;
        }

        try {
            if (isEditing && currentId !== undefined) {
                await sacService.update(companyId, currentId, formData);
                toast.success('SAC code updated successfully');
            } else {
                await sacService.create(companyId, formData);
                toast.success('SAC code created successfully');
            }

            handleCloseModal();
            loadSacCodes();
        } catch (error) {
            toast.error(isEditing ? 'Failed to update SAC code' : 'Failed to create SAC code');
            console.error('Error saving SAC code:', error);
        }
    };

    const handleDelete = async (id: number | undefined) => {
        if (!id || !companyId) {
            toast.error('Cannot delete this SAC code');
            return;
        }

        if (!window.confirm('Are you sure you want to delete this SAC code?')) return;

        try {
            await sacService.delete(companyId, id);
            toast.success('SAC code deleted successfully');
            loadSacCodes();
        } catch (error) {
            toast.error('Failed to delete SAC code');
            console.error('Error deleting SAC code:', error);
        }
    };

    const handleEdit = useCallback((sacCode: ISacCode) => {
        setIsEditing(true);
        setCurrentId(sacCode.id);
        setFormData({
            sacCode: sacCode.sacCode,
            sacDescription: sacCode.sacDescription,
            gstRate: sacCode.gstRate,
            igstRate: sacCode.igstRate,
            cgstRate: sacCode.cgstRate,
            sgstRate: sacCode.sgstRate,
            utgstRate: sacCode.utgstRate,
            cessRate: sacCode.cessRate,
            isActive: sacCode.isActive,
        });
        setShowModal(true);
    }, []);

    const filteredSacCodes = sacCodes.filter(code => 
        code.sacCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        code.sacDescription.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="tax-setup-container">
            <div className="page-header">
                <h1><i className="fas fa-hashtag me-2"></i>SAC Code Master</h1>
                <p className="mb-0">Manage Service Accounting Codes (SAC)</p>
            </div>

            <Container>
                <Card className="mb-4">
                    <Card.Body>
                        <div className="heading-with-button">
                            <h2>SAC Codes</h2>
                            <Button 
                                variant="primary"
                                onClick={() => setShowModal(true)}
                                className="d-flex align-items-center"
                            >
                                <FaPlus className="me-2" /> Add SAC Code
                            </Button>
                        </div>

                        <div className="search-box">
                            <Form.Control
                                type="text"
                                placeholder="Search SAC codes..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <Table responsive hover>
                            <thead>
                                <tr>
                                    <th>SAC Code</th>
                                    <th>Description</th>
                                    <th className="text-end">GST Rate (%)</th>
                                    <th className="text-end">IGST Rate (%)</th>
                                    <th className="text-end">CGST Rate (%)</th>
                                    <th className="text-end">SGST Rate (%)</th>
                                    <th className="text-end">UTGST Rate (%)</th>
                                    <th className="text-end">CESS Rate (%)</th>
                                    <th>Status</th>
                                    <th className="text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredSacCodes.map((code) => (
                                    <tr key={code.id}>
                                        <td>{code.sacCode}</td>
                                        <td>{code.sacDescription}</td>
                                        <td className="text-end">{code.gstRate.toFixed(2)}</td>
                                        <td className="text-end">{code.igstRate.toFixed(2)}</td>
                                        <td className="text-end">{code.cgstRate.toFixed(2)}</td>
                                        <td className="text-end">{code.sgstRate.toFixed(2)}</td>
                                        <td className="text-end">{code.utgstRate.toFixed(2)}</td>
                                        <td className="text-end">{code.cessRate.toFixed(2)}</td>
                                        <td>
                                            <Badge bg={code.isActive ? 'success' : 'danger'} className="status-badge">
                                                {code.isActive ? 'Active' : 'Inactive'}
                                            </Badge>
                                        </td>
                                        <td className="text-center table-actions">
                                            <Button
                                                variant="outline-primary"
                                                size="sm"
                                                className="me-2"
                                                onClick={() => handleEdit(code)}
                                            >
                                                <FaEdit />
                                            </Button>
                                            <Button
                                                variant="outline-danger"
                                                size="sm"
                                                onClick={() => handleDelete(code.id)}
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
                        <Modal.Title>{isEditing ? 'Edit SAC Code' : 'Add New SAC Code'}</Modal.Title>
                    </Modal.Header>
                    <Form onSubmit={handleSubmit}>
                        <Modal.Body>
                            <Form.Group className="mb-3">
                                <Form.Label className="required-field">SAC Code</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={formData.sacCode}
                                    onChange={(e) => setFormData({ ...formData, sacCode: e.target.value })}
                                    required
                                />
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label className="required-field">Description</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={formData.sacDescription}
                                    onChange={(e) => setFormData({ ...formData, sacDescription: e.target.value })}
                                    required
                                />
                            </Form.Group>

                            <div className="row">
                                <div className="col-md-4">
                                    <Form.Group className="mb-3">
                                        <Form.Label>GST Rate (%)</Form.Label>
                                        <Form.Control
                                            type="number"
                                            className="numeric-input"
                                            value={formData.gstRate}
                                            onChange={(e) => setFormData({ ...formData, gstRate: parseFloat(e.target.value) || 0 })}
                                            min="0"
                                            max="100"
                                            step="0.01"
                                        />
                                    </Form.Group>
                                </div>
                                <div className="col-md-4">
                                    <Form.Group className="mb-3">
                                        <Form.Label>IGST Rate (%)</Form.Label>
                                        <Form.Control
                                            type="number"
                                            className="numeric-input"
                                            value={formData.igstRate}
                                            onChange={(e) => setFormData({ ...formData, igstRate: parseFloat(e.target.value) || 0 })}
                                            min="0"
                                            max="100"
                                            step="0.01"
                                        />
                                    </Form.Group>
                                </div>
                                <div className="col-md-4">
                                    <Form.Group className="mb-3">
                                        <Form.Label>CGST Rate (%)</Form.Label>
                                        <Form.Control
                                            type="number"
                                            className="numeric-input"
                                            value={formData.cgstRate}
                                            onChange={(e) => setFormData({ ...formData, cgstRate: parseFloat(e.target.value) || 0 })}
                                            min="0"
                                            max="100"
                                            step="0.01"
                                        />
                                    </Form.Group>
                                </div>
                            </div>

                            <div className="row">
                                <div className="col-md-4">
                                    <Form.Group className="mb-3">
                                        <Form.Label>SGST Rate (%)</Form.Label>
                                        <Form.Control
                                            type="number"
                                            className="numeric-input"
                                            value={formData.sgstRate}
                                            onChange={(e) => setFormData({ ...formData, sgstRate: parseFloat(e.target.value) || 0 })}
                                            min="0"
                                            max="100"
                                            step="0.01"
                                        />
                                    </Form.Group>
                                </div>
                                <div className="col-md-4">
                                    <Form.Group className="mb-3">
                                        <Form.Label>UTGST Rate (%)</Form.Label>
                                        <Form.Control
                                            type="number"
                                            className="numeric-input"
                                            value={formData.utgstRate}
                                            onChange={(e) => setFormData({ ...formData, utgstRate: parseFloat(e.target.value) || 0 })}
                                            min="0"
                                            max="100"
                                            step="0.01"
                                        />
                                    </Form.Group>
                                </div>
                                <div className="col-md-4">
                                    <Form.Group className="mb-3">
                                        <Form.Label>CESS Rate (%)</Form.Label>
                                        <Form.Control
                                            type="number"
                                            className="numeric-input"
                                            value={formData.cessRate}
                                            onChange={(e) => setFormData({ ...formData, cessRate: parseFloat(e.target.value) || 0 })}
                                            min="0"
                                            max="100"
                                            step="0.01"
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
                                {isEditing ? 'Update' : 'Save'} SAC Code
                            </Button>
                        </Modal.Footer>
                    </Form>
                </Modal>
            </Container>
        </div>
    );
};

export default SacCodes;