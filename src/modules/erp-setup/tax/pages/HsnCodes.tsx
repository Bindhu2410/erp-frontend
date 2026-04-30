import React, { useState, useEffect, useCallback } from 'react';
import { Button, Form, Table, Badge, Modal, Container, Card } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { useCompanyContext } from '../../../../components/common/context/CompanyContext';
import { IHsnCode, IHsnCodeFormData } from '../interfaces/hsn.types';
import { hsnService } from '../services/hsn.service';
import '../styles/tax-setup.css';
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';

const initialFormData: IHsnCodeFormData = {
    hsnCode: '',
    hsnDescription: '',
    gstRate: 0,
    igstRate: 0,
    cgstRate: 0,
    sgstRate: 0,
    utgstRate: 0,
    cessRate: 0,
    isActive: true,
};

const HsnCodes: React.FC = () => {
    const { companyId } = useCompanyContext();
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState<IHsnCodeFormData>(initialFormData);
    const [hsnCodes, setHsnCodes] = useState<IHsnCode[]>([]);
    const [isEditing, setIsEditing] = useState(false);
    const [currentId, setCurrentId] = useState<number | undefined>();
    const [searchTerm, setSearchTerm] = useState('');

    const handleCloseModal = useCallback(() => {
        setShowModal(false);
        setIsEditing(false);
        setCurrentId(undefined);
        setFormData(initialFormData);
    }, []);

    const loadHsnCodes = useCallback(async () => {
        if (!companyId) return;
        
        try {
            const response = await hsnService.getAll(companyId);
            
            // Check if response.data is array or single item
            const hsnData = Array.isArray(response.data) ? response.data : [response.data];
            
            // Transform API response to component format
            const transformedHsnCodes: IHsnCode[] = hsnData.map(item => ({
                id: item.hsnCodeId,
                hsnCode: item.code || '',
                hsnDescription: item.description || '',
                gstRate: item.defaultGstRate || 0,
                igstRate: item.igstRate || 0,
                cgstRate: item.cgstRate || 0,
                sgstRate: item.sgstRate || 0,
                utgstRate: item.utgstRate || 0,
                cessRate: item.cessRate || 0,
                isActive: item.isActive !== undefined ? item.isActive : true,
                companyId: item.companyId || 0
            }));
            
            setHsnCodes(transformedHsnCodes);
        } catch (error) {
            toast.error('Failed to load HSN codes');
            console.error('Error loading HSN codes:', error);
        }
    }, [companyId]);

    useEffect(() => {
        if (companyId) {
            loadHsnCodes();
        }
    }, [companyId, loadHsnCodes]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!companyId) {
            toast.error('Company ID is required');
            return;
        }

        try {
            if (isEditing && currentId !== undefined) {
                await hsnService.update(companyId, currentId, formData);
                toast.success('HSN code updated successfully');
            } else {
                await hsnService.create(companyId, formData);
                toast.success('HSN code created successfully');
            }

            handleCloseModal();
            loadHsnCodes();
        } catch (error) {
            toast.error(isEditing ? 'Failed to update HSN code' : 'Failed to create HSN code');
            console.error('Error saving HSN code:', error);
        }
    };

    const handleDelete = async (id: number | undefined) => {
        if (!id || !companyId) {
            toast.error('Cannot delete this HSN code');
            return;
        }

        if (!window.confirm('Are you sure you want to delete this HSN code?')) return;

        try {
            await hsnService.delete(companyId, id);
            toast.success('HSN code deleted successfully');
            loadHsnCodes();
        } catch (error) {
            toast.error('Failed to delete HSN code');
            console.error('Error deleting HSN code:', error);
        }
    };

    const handleEdit = useCallback((hsnCode: IHsnCode) => {
        setIsEditing(true);
        setCurrentId(hsnCode.id);
        setFormData({
            hsnCode: hsnCode.hsnCode,
            hsnDescription: hsnCode.hsnDescription,
            gstRate: hsnCode.gstRate,
            igstRate: hsnCode.igstRate,
            cgstRate: hsnCode.cgstRate,
            sgstRate: hsnCode.sgstRate,
            utgstRate: hsnCode.utgstRate,
            cessRate: hsnCode.cessRate,
            isActive: hsnCode.isActive,
        });
        setShowModal(true);
    }, []);

    const filteredHsnCodes = hsnCodes.filter(code => 
        code.hsnCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        code.hsnDescription.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="tax-setup-container">
            <div className="page-header">
                <h1><i className="fas fa-hashtag me-2"></i>HSN Code Master</h1>
                <p className="mb-0">Manage Harmonized System of Nomenclature (HSN) Codes</p>
            </div>

            <Container>
                <Card className="mb-4">
                    <Card.Body>
                        <div className="heading-with-button">
                            <h2>HSN Codes</h2>
                            <Button 
                                variant="primary"
                                onClick={() => setShowModal(true)}
                                className="d-flex align-items-center"
                            >
                                <FaPlus className="me-2" /> Add HSN Code
                            </Button>
                        </div>

                        <div className="search-box">
                            <Form.Control
                                type="text"
                                placeholder="Search HSN codes..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <Table responsive hover>
                            <thead>
                                <tr>
                                    <th>HSN Code</th>
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
                                {filteredHsnCodes.map((code) => (
                                    <tr key={code.id}>
                                        <td>{code.hsnCode}</td>
                                        <td>{code.hsnDescription}</td>
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
                        <Modal.Title>{isEditing ? 'Edit HSN Code' : 'Add New HSN Code'}</Modal.Title>
                    </Modal.Header>
                    <Form onSubmit={handleSubmit}>
                        <Modal.Body>
                            <Form.Group className="mb-3">
                                <Form.Label className="required-field">HSN Code</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={formData.hsnCode}
                                    onChange={(e) => setFormData({ ...formData, hsnCode: e.target.value })}
                                    required
                                />
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label className="required-field">Description</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={formData.hsnDescription}
                                    onChange={(e) => setFormData({ ...formData, hsnDescription: e.target.value })}
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
                                {isEditing ? 'Update' : 'Save'} HSN Code
                            </Button>
                        </Modal.Footer>
                    </Form>
                </Modal>
            </Container>
        </div>
    );
};

export default HsnCodes;