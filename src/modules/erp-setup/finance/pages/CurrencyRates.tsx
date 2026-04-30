import React, { useState } from 'react';
import { Form, Card, Row, Col, Button } from 'react-bootstrap';

interface ICurrencyRate {
    fromCurrency: string;
    toCurrency: string;
    exchangeRate: number;
    effectiveDate: string;
    isActive: boolean;
    lastUpdated: string;
    source: string;
    notes: string;
}

const CurrencyRates: React.FC = () => {
    const [rates, setRates] = useState<ICurrencyRate[]>([]);
    const [currentRate, setCurrentRate] = useState<ICurrencyRate>({
        fromCurrency: '',
        toCurrency: '',
        exchangeRate: 1,
        effectiveDate: '',
        isActive: true,
        lastUpdated: new Date().toISOString().split('T')[0],
        source: '',
        notes: ''
    });

    // Common currencies for demo
    const commonCurrencies = [
        'INR', 'USD', 'EUR', 'GBP', 'AUD', 'CAD', 'SGD', 'AED'
    ];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setRates([...rates, currentRate]);
        // Reset form
        setCurrentRate({
            fromCurrency: '',
            toCurrency: '',
            exchangeRate: 1,
            effectiveDate: '',
            isActive: true,
            lastUpdated: new Date().toISOString().split('T')[0],
            source: '',
            notes: ''
        });
    };

    return (
        <div>
            <div className="mb-4 pb-2 border-bottom">
                <h5 className="fw-bold">Currency Exchange Rates</h5>
                <p className="text-muted small">Manage exchange rates for multi-currency transactions</p>
            </div>

            <Card className="mb-4">
                <Card.Body>
                    <Form onSubmit={handleSubmit}>
                        <Row className="g-3">
                            <Col md={4}>
                                <Form.Group>
                                    <Form.Label>From Currency</Form.Label>
                                    <Form.Select
                                        value={currentRate.fromCurrency}
                                        onChange={e => setCurrentRate({...currentRate, fromCurrency: e.target.value})}
                                        required
                                    >
                                        <option value="">Select Currency</option>
                                        {commonCurrencies.map(currency => (
                                            <option key={currency} value={currency}>
                                                {currency}
                                            </option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group>
                                    <Form.Label>To Currency</Form.Label>
                                    <Form.Select
                                        value={currentRate.toCurrency}
                                        onChange={e => setCurrentRate({...currentRate, toCurrency: e.target.value})}
                                        required
                                    >
                                        <option value="">Select Currency</option>
                                        {commonCurrencies.map(currency => (
                                            <option key={currency} value={currency}>
                                                {currency}
                                            </option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group>
                                    <Form.Label>Exchange Rate</Form.Label>
                                    <Form.Control
                                        type="number"
                                        step="0.0001"
                                        min="0"
                                        value={currentRate.exchangeRate}
                                        onChange={e => setCurrentRate({...currentRate, exchangeRate: parseFloat(e.target.value)})}
                                        required
                                    />
                                </Form.Group>
                            </Col>

                            <Col md={4}>
                                <Form.Group>
                                    <Form.Label>Effective Date</Form.Label>
                                    <Form.Control
                                        type="date"
                                        value={currentRate.effectiveDate}
                                        onChange={e => setCurrentRate({...currentRate, effectiveDate: e.target.value})}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group>
                                    <Form.Label>Last Updated</Form.Label>
                                    <Form.Control
                                        type="date"
                                        value={currentRate.lastUpdated}
                                        onChange={e => setCurrentRate({...currentRate, lastUpdated: e.target.value})}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group>
                                    <Form.Label>Source</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={currentRate.source}
                                        onChange={e => setCurrentRate({...currentRate, source: e.target.value})}
                                        placeholder="e.g., RBI, ECB"
                                        required
                                    />
                                </Form.Group>
                            </Col>

                            <Col md={12}>
                                <Form.Group>
                                    <Form.Label>Notes</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={2}
                                        value={currentRate.notes}
                                        onChange={e => setCurrentRate({...currentRate, notes: e.target.value})}
                                    />
                                </Form.Group>
                            </Col>

                            <Col md={12}>
                                <Form.Group>
                                    <Form.Check
                                        type="checkbox"
                                        label="Active"
                                        checked={currentRate.isActive}
                                        onChange={e => setCurrentRate({...currentRate, isActive: e.target.checked})}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                        <div className="mt-4 text-end">
                            <Button variant="primary" type="submit">
                                Add Exchange Rate
                            </Button>
                        </div>
                    </Form>
                </Card.Body>
            </Card>

            {/* Exchange Rates List */}
            <Card>
                <Card.Body>
                    <h6 className="card-title mb-3">Exchange Rates List</h6>
                    <div className="table-responsive">
                        <table className="table table-bordered">
                            <thead>
                                <tr>
                                    <th>From</th>
                                    <th>To</th>
                                    <th>Rate</th>
                                    <th>Effective Date</th>
                                    <th>Source</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rates.map((rate, index) => (
                                    <tr key={index}>
                                        <td>{rate.fromCurrency}</td>
                                        <td>{rate.toCurrency}</td>
                                        <td>{rate.exchangeRate.toFixed(4)}</td>
                                        <td>{rate.effectiveDate}</td>
                                        <td>{rate.source}</td>
                                        <td>
                                            <span className={`badge ${rate.isActive ? 'bg-success' : 'bg-danger'}`}>
                                                {rate.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td>
                                            <Button variant="link" size="sm" className="text-primary">
                                                <i className="fas fa-edit"></i>
                                            </Button>
                                            <Button variant="link" size="sm" className="text-danger">
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

            {/* Quick Rate Calculator */}
            <Card className="mt-4">
                <Card.Body>
                    <h6 className="card-title mb-3">Quick Rate Calculator</h6>
                    <Row className="g-3">
                        <Col md={3}>
                            <Form.Group>
                                <Form.Label>From Currency</Form.Label>
                                <Form.Select>
                                    <option value="">Select Currency</option>
                                    {commonCurrencies.map(currency => (
                                        <option key={currency} value={currency}>
                                            {currency}
                                        </option>
                                    ))}
                                </Form.Select>
                            </Form.Group>
                        </Col>
                        <Col md={3}>
                            <Form.Group>
                                <Form.Label>To Currency</Form.Label>
                                <Form.Select>
                                    <option value="">Select Currency</option>
                                    {commonCurrencies.map(currency => (
                                        <option key={currency} value={currency}>
                                            {currency}
                                        </option>
                                    ))}
                                </Form.Select>
                            </Form.Group>
                        </Col>
                        <Col md={3}>
                            <Form.Group>
                                <Form.Label>Amount</Form.Label>
                                <Form.Control type="number" min="0" step="0.01" />
                            </Form.Group>
                        </Col>
                        <Col md={3}>
                            <Form.Group>
                                <Form.Label>Converted Amount</Form.Label>
                                <Form.Control type="text" readOnly />
                            </Form.Group>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>
        </div>
    );
};

export default CurrencyRates;