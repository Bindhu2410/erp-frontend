import React, { useState } from 'react';
import { Form, Card, Row, Col, Button, Container, Badge, Dropdown, Modal } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faPlus, 
    faSearch, 
    faRedoAlt,
    faEdit,
    faTrashAlt,
    faWarehouse,
    faMapMarkerAlt,
    faBoxes,
    faLayerGroup
} from '@fortawesome/free-solid-svg-icons';

interface IInventoryLocation {
    id?: string;
    locationCode: string;
    locationName: string;
    warehouseId: string;
    warehouseName: string;
    locationType: 'rack' | 'shelf' | 'bin' | 'zone' | 'aisle';
    capacity: string;
    isActive: boolean;
    isRestricted: boolean;
    parentLocationId?: string;
    parentLocationName?: string;
    description: string;
    dimension?: {
        length: number;
        width: number;
        height: number;
        unit: string;
    };
    temperature?: {
        min: number;
        max: number;
        unit: string;
    };
    humidity?: {
        min: number;
        max: number;
        unit: string;
    };
}

const InventoryLocation: React.FC = () => {
    const [locations, setLocations] = useState<IInventoryLocation[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [warehouseFilter, setWarehouseFilter] = useState('');
    const [locationTypeFilter, setLocationTypeFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [currentLocation, setCurrentLocation] = useState<IInventoryLocation>({
        locationCode: '',
        locationName: '',
        warehouseId: '',
        warehouseName: '',
        locationType: 'rack',
        capacity: '',
        isActive: true,
        isRestricted: false,
        description: '',
        dimension: {
            length: 0,
            width: 0,
            height: 0,
            unit: 'meters'
        },
        temperature: {
            min: 20,
            max: 25,
            unit: 'celsius'
        },
        humidity: {
            min: 45,
            max: 55,
            unit: 'percentage'
        }
    });

    const locationTypes = ['rack', 'shelf', 'bin', 'zone', 'aisle'];
    const dimensionUnits = ['meters', 'feet', 'inches'];
    const temperatureUnits = ['celsius', 'fahrenheit'];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setLocations([...locations, currentLocation]);
        setShowModal(false);
        resetForm();
    };

    const resetForm = () => {
        setCurrentLocation({
            locationCode: '',
            locationName: '',
            warehouseId: '',
            warehouseName: '',
            locationType: 'rack',
            capacity: '',
            isActive: true,
            isRestricted: false,
            description: '',
            dimension: {
                length: 0,
                width: 0,
                height: 0,
                unit: 'meters'
            },
            temperature: {
                min: 20,
                max: 25,
                unit: 'celsius'
            },
            humidity: {
                min: 45,
                max: 55,
                unit: 'percentage'
            }
        });
    };

    return (
        <Container className="mt-4 mb-5">
            <div className="page-header mb-4">
                <Row className="align-items-center">
                    <Col md={8}>
                        <h1 className="page-title mb-2">Inventory Location Setup</h1>
                        <p className="text-muted mb-0">Create and manage inventory locations within warehouses</p>
                    </Col>
                    <Col md={4} className="text-md-end">
                        <Button variant="primary" onClick={() => setShowModal(true)}>
                            <FontAwesomeIcon icon={faPlus} className="me-2" />
                            Add New Location
                        </Button>
                    </Col>
                </Row>
            </div>

            {/* Search and Filters */}
            <Card className="mb-4">
                <Card.Body>
                    <Row className="g-3 align-items-center">
                        <Col md={4}>
                            <div className="input-group">
                                <span className="input-group-text bg-white">
                                    <FontAwesomeIcon icon={faSearch} className="text-muted" />
                                </span>
                                <Form.Control
                                    type="text"
                                    placeholder="Search locations..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </Col>
                        <Col md={2}>
                            <Form.Select
                                value={warehouseFilter}
                                onChange={(e) => setWarehouseFilter(e.target.value)}
                            >
                                <option value="">All Warehouses</option>
                                <option value="WH1">Warehouse 1</option>
                                <option value="WH2">Warehouse 2</option>
                            </Form.Select>
                        </Col>
                        <Col md={2}>
                            <Form.Select
                                value={locationTypeFilter}
                                onChange={(e) => setLocationTypeFilter(e.target.value)}
                            >
                                <option value="">All Types</option>
                                {locationTypes.map(type => (
                                    <option key={type} value={type}>
                                        {type.charAt(0).toUpperCase() + type.slice(1)}
                                    </option>
                                ))}
                            </Form.Select>
                        </Col>
                        <Col md={2}>
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
                                setWarehouseFilter('');
                                setLocationTypeFilter('');
                                setStatusFilter('');
                            }}>
                                <FontAwesomeIcon icon={faRedoAlt} className="me-2" />
                                Reset
                            </Button>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            {/* Location Form Modal */}
            <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
                <Form onSubmit={handleSubmit}>
                    <Modal.Header closeButton>
                        <Modal.Title>Add New Location</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Row className="g-3">
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label className="required-field">Location Code</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={currentLocation.locationCode}
                                        onChange={e => setCurrentLocation({...currentLocation, locationCode: e.target.value})}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label className="required-field">Location Name</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={currentLocation.locationName}
                                        onChange={e => setCurrentLocation({...currentLocation, locationName: e.target.value})}
                                        required
                                    />
                                </Form.Group>
                            </Col>

                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label className="required-field">Warehouse</Form.Label>
                                    <Form.Select
                                        value={currentLocation.warehouseId}
                                        onChange={e => setCurrentLocation({...currentLocation, warehouseId: e.target.value})}
                                        required
                                    >
                                        <option value="">Select Warehouse</option>
                                        <option value="WH1">Warehouse 1</option>
                                        <option value="WH2">Warehouse 2</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>

                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label className="required-field">Location Type</Form.Label>
                                    <Form.Select
                                        value={currentLocation.locationType}
                                        onChange={e => setCurrentLocation({...currentLocation, locationType: e.target.value as any})}
                                        required
                                    >
                                        {locationTypes.map(type => (
                                            <option key={type} value={type}>
                                                {type.charAt(0).toUpperCase() + type.slice(1)}
                                            </option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>
                            </Col>

                            <Col md={12}>
                                <Form.Group>
                                    <Form.Label>Parent Location</Form.Label>
                                    <Form.Select
                                        value={currentLocation.parentLocationId || ''}
                                        onChange={e => setCurrentLocation({...currentLocation, parentLocationId: e.target.value})}
                                    >
                                        <option value="">Select Parent Location (Optional)</option>
                                        {locations.map(loc => (
                                            <option key={loc.id} value={loc.id}>
                                                {loc.locationName}
                                            </option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>
                            </Col>

                            <Col md={12}>
                                <Card className="bg-light">
                                    <Card.Body>
                                        <h6 className="card-title mb-3">Dimensions</h6>
                                        <Row className="g-3">
                                            <Col md={3}>
                                                <Form.Group>
                                                    <Form.Label>Length</Form.Label>
                                                    <Form.Control
                                                        type="number"
                                                        value={currentLocation.dimension?.length}
                                                        onChange={e => setCurrentLocation({
                                                            ...currentLocation,
                                                            dimension: {
                                                                ...currentLocation.dimension!,
                                                                length: parseFloat(e.target.value)
                                                            }
                                                        })}
                                                    />
                                                </Form.Group>
                                            </Col>
                                            <Col md={3}>
                                                <Form.Group>
                                                    <Form.Label>Width</Form.Label>
                                                    <Form.Control
                                                        type="number"
                                                        value={currentLocation.dimension?.width}
                                                        onChange={e => setCurrentLocation({
                                                            ...currentLocation,
                                                            dimension: {
                                                                ...currentLocation.dimension!,
                                                                width: parseFloat(e.target.value)
                                                            }
                                                        })}
                                                    />
                                                </Form.Group>
                                            </Col>
                                            <Col md={3}>
                                                <Form.Group>
                                                    <Form.Label>Height</Form.Label>
                                                    <Form.Control
                                                        type="number"
                                                        value={currentLocation.dimension?.height}
                                                        onChange={e => setCurrentLocation({
                                                            ...currentLocation,
                                                            dimension: {
                                                                ...currentLocation.dimension!,
                                                                height: parseFloat(e.target.value)
                                                            }
                                                        })}
                                                    />
                                                </Form.Group>
                                            </Col>
                                            <Col md={3}>
                                                <Form.Group>
                                                    <Form.Label>Unit</Form.Label>
                                                    <Form.Select
                                                        value={currentLocation.dimension?.unit}
                                                        onChange={e => setCurrentLocation({
                                                            ...currentLocation,
                                                            dimension: {
                                                                ...currentLocation.dimension!,
                                                                unit: e.target.value
                                                            }
                                                        })}
                                                    >
                                                        {dimensionUnits.map(unit => (
                                                            <option key={unit} value={unit}>
                                                                {unit.charAt(0).toUpperCase() + unit.slice(1)}
                                                            </option>
                                                        ))}
                                                    </Form.Select>
                                                </Form.Group>
                                            </Col>
                                        </Row>
                                    </Card.Body>
                                </Card>
                            </Col>

                            <Col md={12}>
                                <Card className="bg-light">
                                    <Card.Body>
                                        <h6 className="card-title mb-3">Environmental Controls</h6>
                                        <Row className="g-3">
                                            <Col md={6}>
                                                <Card>
                                                    <Card.Body>
                                                        <h6 className="card-subtitle mb-3">Temperature Range</h6>
                                                        <Row className="g-3">
                                                            <Col md={4}>
                                                                <Form.Group>
                                                                    <Form.Label>Min</Form.Label>
                                                                    <Form.Control
                                                                        type="number"
                                                                        value={currentLocation.temperature?.min}
                                                                        onChange={e => setCurrentLocation({
                                                                            ...currentLocation,
                                                                            temperature: {
                                                                                ...currentLocation.temperature!,
                                                                                min: parseFloat(e.target.value)
                                                                            }
                                                                        })}
                                                                    />
                                                                </Form.Group>
                                                            </Col>
                                                            <Col md={4}>
                                                                <Form.Group>
                                                                    <Form.Label>Max</Form.Label>
                                                                    <Form.Control
                                                                        type="number"
                                                                        value={currentLocation.temperature?.max}
                                                                        onChange={e => setCurrentLocation({
                                                                            ...currentLocation,
                                                                            temperature: {
                                                                                ...currentLocation.temperature!,
                                                                                max: parseFloat(e.target.value)
                                                                            }
                                                                        })}
                                                                    />
                                                                </Form.Group>
                                                            </Col>
                                                            <Col md={4}>
                                                                <Form.Group>
                                                                    <Form.Label>Unit</Form.Label>
                                                                    <Form.Select
                                                                        value={currentLocation.temperature?.unit}
                                                                        onChange={e => setCurrentLocation({
                                                                            ...currentLocation,
                                                                            temperature: {
                                                                                ...currentLocation.temperature!,
                                                                                unit: e.target.value
                                                                            }
                                                                        })}
                                                                    >
                                                                        {temperatureUnits.map(unit => (
                                                                            <option key={unit} value={unit}>
                                                                                {unit.charAt(0).toUpperCase() + unit.slice(1)}
                                                                            </option>
                                                                        ))}
                                                                    </Form.Select>
                                                                </Form.Group>
                                                            </Col>
                                                        </Row>
                                                    </Card.Body>
                                                </Card>
                                            </Col>
                                            <Col md={6}>
                                                <Card>
                                                    <Card.Body>
                                                        <h6 className="card-subtitle mb-3">Humidity Range (%)</h6>
                                                        <Row className="g-3">
                                                            <Col md={6}>
                                                                <Form.Group>
                                                                    <Form.Label>Min</Form.Label>
                                                                    <Form.Control
                                                                        type="number"
                                                                        value={currentLocation.humidity?.min}
                                                                        onChange={e => setCurrentLocation({
                                                                            ...currentLocation,
                                                                            humidity: {
                                                                                ...currentLocation.humidity!,
                                                                                min: parseFloat(e.target.value)
                                                                            }
                                                                        })}
                                                                    />
                                                                </Form.Group>
                                                            </Col>
                                                            <Col md={6}>
                                                                <Form.Group>
                                                                    <Form.Label>Max</Form.Label>
                                                                    <Form.Control
                                                                        type="number"
                                                                        value={currentLocation.humidity?.max}
                                                                        onChange={e => setCurrentLocation({
                                                                            ...currentLocation,
                                                                            humidity: {
                                                                                ...currentLocation.humidity!,
                                                                                max: parseFloat(e.target.value)
                                                                            }
                                                                        })}
                                                                    />
                                                                </Form.Group>
                                                            </Col>
                                                        </Row>
                                                    </Card.Body>
                                                </Card>
                                            </Col>
                                        </Row>
                                    </Card.Body>
                                </Card>
                            </Col>

                            <Col md={12}>
                                <Form.Group>
                                    <Form.Label>Description</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={3}
                                        value={currentLocation.description}
                                        onChange={e => setCurrentLocation({...currentLocation, description: e.target.value})}
                                        placeholder="Enter location description"
                                    />
                                </Form.Group>
                            </Col>

                            <Col md={6}>
                                <Form.Check
                                    type="switch"
                                    id="location-restricted"
                                    label="Restricted Access"
                                    checked={currentLocation.isRestricted}
                                    onChange={e => setCurrentLocation({...currentLocation, isRestricted: e.target.checked})}
                                />
                            </Col>
                            <Col md={6}>
                                <Form.Check
                                    type="switch"
                                    id="location-status"
                                    label="Active"
                                    checked={currentLocation.isActive}
                                    onChange={e => setCurrentLocation({...currentLocation, isActive: e.target.checked})}
                                />
                            </Col>
                        </Row>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowModal(false)}>
                            Cancel
                        </Button>
                        <Button variant="primary" type="submit">
                            Save Location
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>

            {/* Locations Grid */}
            <Row className="g-4">
                {locations.map((location, index) => (
                    <Col md={6} lg={4} key={index}>
                        <Card className="location-card h-100">
                            <Card.Body>
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                    <Badge bg={location.isActive ? 'success' : 'warning'}>
                                        {location.isActive ? 'Active' : 'Inactive'}
                                    </Badge>
                                    <Dropdown>
                                        <Dropdown.Toggle variant="light" size="sm">
                                            <i className="fas fa-ellipsis-v"></i>
                                        </Dropdown.Toggle>
                                        <Dropdown.Menu align="end">
                                            <Dropdown.Item href="#">
                                                <FontAwesomeIcon icon={faEdit} className="me-2" />
                                                Edit
                                            </Dropdown.Item>
                                            <Dropdown.Item href="#" className="text-danger">
                                                <FontAwesomeIcon icon={faTrashAlt} className="me-2" />
                                                Delete
                                            </Dropdown.Item>
                                        </Dropdown.Menu>
                                    </Dropdown>
                                </div>

                                <h5 className="card-title">{location.locationName}</h5>
                                <div className="text-muted mb-3">
                                    <span className="d-block">
                                        <FontAwesomeIcon icon={faWarehouse} className="me-2" />
                                        <strong>Code:</strong> {location.locationCode}
                                    </span>
                                    <span className="d-block mt-1">
                                        <FontAwesomeIcon icon={faBoxes} className="me-2" />
                                        <strong>Warehouse:</strong> {location.warehouseName}
                                    </span>
                                </div>

                                <div className="text-muted mb-3">
                                    <span className="d-block">
                                        <FontAwesomeIcon icon={faMapMarkerAlt} className="me-2" />
                                        <strong>Type:</strong> {location.locationType}
                                    </span>
                                    {location.parentLocationName && (
                                        <span className="d-block mt-1">
                                            <FontAwesomeIcon icon={faLayerGroup} className="me-2" />
                                            <strong>Parent:</strong> {location.parentLocationName}
                                        </span>
                                    )}
                                </div>

                                {location.description && (
                                    <div className="text-muted small mb-3">
                                        {location.description}
                                    </div>
                                )}

                                <div className="d-flex flex-wrap gap-2 mt-3">
                                    {location.dimension && (
                                        <Badge bg="info" text="dark">
                                            {`${location.dimension.length} × ${location.dimension.width} × ${location.dimension.height} ${location.dimension.unit}`}
                                        </Badge>
                                    )}
                                    {location.temperature && (
                                        <Badge bg="secondary">
                                            {`${location.temperature.min}°${location.temperature.unit.charAt(0).toUpperCase()} - ${location.temperature.max}°${location.temperature.unit.charAt(0).toUpperCase()}`}
                                        </Badge>
                                    )}
                                    {location.humidity && (
                                        <Badge bg="secondary">
                                            {`${location.humidity.min}% - ${location.humidity.max}% RH`}
                                        </Badge>
                                    )}
                                    {location.isRestricted && (
                                        <Badge bg="warning" text="dark">
                                            Restricted
                                        </Badge>
                                    )}
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>
        </Container>
    );
};

export default InventoryLocation;