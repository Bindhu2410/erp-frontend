import React, { useState, useEffect } from 'react';
import { Tooltip } from 'bootstrap';
import { dashboardService, IDashboardStats } from './services/dashboard.service';

// Define types for our components
type SetupCardProps = {
  icon: string;
  title: string;
  description: string;
  status: 'completed' | 'in-progress' | 'not-started';
  link: string;
};

type ProgressItemProps = {
  title: string;
  progress: number;
  status: 'completed' | 'in-progress' | 'not-started';
};

type QuickActionItem = {
  icon: string;
  iconColor: string;
  title: string;
  description: string;
  link: string;
};

type TimelineItem = {
  title: string;
  description: string;
  status: 'completed' | 'active' | 'pending';
  progress?: number;
};

const SetupDashboard: React.FC = () => {
  // State for the active company
  const [activeCompany, setActiveCompany] = useState('All Companies');
  
  // State for dashboard statistics
  const [dashboardStats, setDashboardStats] = useState<IDashboardStats>({
    totalCompanies: 0,
    completedSetups: 0,
    inProgressSetups: 0,
    pendingSetups: 0,
    setupProgress: 0
  });
  const [statsLoading, setStatsLoading] = useState(true);

  // State for the active tab in the modal
  const [activeTab, setActiveTab] = useState('overview');

  // Modal visibility state
  const [showSetupGuideModal, setShowSetupGuideModal] = useState(false);
  // Ref for modal
  const modalRef = React.useRef<HTMLDivElement>(null);

  // Reset tab when modal closes
  React.useEffect(() => {
    if (!showSetupGuideModal) {
      setActiveTab('overview');
    }
  }, [showSetupGuideModal]);

  // Close modal on backdrop or close button
  const handleModalClose = () => {
    setShowSetupGuideModal(false);
  };

  // Prevent Bootstrap data attributes from interfering
  React.useEffect(() => {
    if (showSetupGuideModal && modalRef.current) {
      modalRef.current.classList.add('show');
      modalRef.current.style.display = 'block';
      document.body.classList.add('modal-open');
    } else if (modalRef.current) {
      modalRef.current.classList.remove('show');
      modalRef.current.style.display = 'none';
      document.body.classList.remove('modal-open');
    }
    // Cleanup modal-open on unmount
    return () => {
      document.body.classList.remove('modal-open');
    };
  }, [showSetupGuideModal]);
  
  // Initialize tooltips
  useEffect(() => {
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map((tooltipTriggerEl) => new Tooltip(tooltipTriggerEl));
  }, []);

  // Fetch dashboard statistics
  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const stats = await dashboardService.getDashboardStats();
        setDashboardStats(stats);
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setStatsLoading(false);
      }
    };
    fetchDashboardStats();
  }, []);

  // Setup cards data
  const companySetupCards: SetupCardProps[] = [
    {
      icon: 'fas fa-building',
      title: 'Company Setup',
      description: 'Configure basic company information, tax registration, and financial settings.',
      status: 'completed',
      link: 'company-setup.html'
    },
    {
      icon: 'fas fa-map-marker-alt',
      title: 'Branch Setup',
      description: 'Create and manage branch locations for your company operations.',
      status: 'in-progress',
      link: 'branch-setup.html'
    },
    {
      icon: 'fas fa-exchange-alt',
      title: 'Intercompany Setup',
      description: 'Configure relationships between parent and subsidiary companies.',
      status: 'not-started',
      link: 'intercompany-setup.html'
    },
    {
      icon: 'fas fa-boxes',
      title: 'Warehouse Setup',
      description: 'Define warehouses and internal inventory locations.',
      status: 'not-started',
      link: 'warehouse-setup.html'
    },
    {
      icon: 'fas fa-tags',
      title: 'Cost Centre Setup',
      description: 'Create cost centres to track departmental expenses and revenue.',
      status: 'not-started',
      link: 'cost-centre-setup.html'
    },
    {
      icon: 'fas fa-university',
      title: 'Bank Account Setup',
      description: 'Manage bank accounts for payments and receivables.',
      status: 'not-started',
      link: 'bank-account-setup.html'
    }
  ];

  const financialSetupCards: SetupCardProps[] = [
    {
      icon: 'fas fa-sitemap',
      title: 'Chart of Accounts',
      description: 'Define your accounting structure with a comprehensive chart of accounts.',
      status: 'not-started',
      link: 'chart-of-accounts.html'
    },
    {
      icon: 'fas fa-calendar-alt',
      title: 'Accounting Periods',
      description: 'Configure fiscal years and accounting periods for financial reporting.',
      status: 'not-started',
      link: 'accounting-periods.html'
    },
    {
      icon: 'fas fa-link',
      title: 'Default Account Mapping',
      description: 'Map transaction types to default accounts for automated posting.',
      status: 'not-started',
      link: 'default-account-mapping.html'
    },
    {
      icon: 'fas fa-money-bill-wave',
      title: 'Currency Exchange Rates',
      description: 'Configure currencies and exchange rates for multi-currency operations.',
      status: 'not-started',
      link: 'currency-exchange-rates.html'
    }
  ];

  const taxSetupCards: SetupCardProps[] = [
    {
      icon: 'fas fa-percentage',
      title: 'GST Setup',
      description: 'Configure GST rates, registration details, and compliance settings.',
      status: 'not-started',
      link: 'gst-setup.html'
    },
    {
      icon: 'fas fa-hand-holding-usd',
      title: 'TDS Setup',
      description: 'Configure TDS sections, rates, and withholding tax settings.',
      status: 'not-started',
      link: 'tds-setup.html'
    },
    {
      icon: 'fas fa-boxes',
      title: 'HSN Codes',
      description: 'Set up Harmonized System of Nomenclature codes for products.',
      status: 'not-started',
      link: 'hsn-code-setup.html'
    },
    {
      icon: 'fas fa-concierge-bell',
      title: 'SAC Codes',
      description: 'Set up Service Accounting Codes for service offerings.',
      status: 'not-started',
      link: 'sac-code-setup.html'
    }
  ];

  const progressItems: ProgressItemProps[] = [
    {
      title: 'Company Profile',
      progress: 100,
      status: 'completed'
    },
    {
      title: 'Branch Setup',
      progress: 60,
      status: 'in-progress'
    },
    {
      title: 'Financial Setup',
      progress: 10,
      status: 'in-progress'
    },
    {
      title: 'User Management',
      progress: 0,
      status: 'not-started'
    }
  ];

  const quickActions: QuickActionItem[] = [
    {
      icon: 'fas fa-building',
      iconColor: 'bg-primary',
      title: 'Add New Company',
      description: 'Create a new legal entity',
      link: 'company-setup'
    },
    {
      icon: 'fas fa-map-marker-alt',
      iconColor: 'bg-danger',
      title: 'Add Branch Location',
      description: 'Define a new operational location',
      link: 'branch-setup.html'
    },
    {
      icon: 'fas fa-sitemap',
      iconColor: 'bg-success',
      title: 'Set Up Chart of Accounts',
      description: 'Define financial account structure',
      link: 'chart-of-accounts.html'
    },
    {
      icon: 'fas fa-network-wired',
      iconColor: 'bg-warning',
      title: 'Setup Intercompany',
      description: 'Configure multi-company relationships',
      link: 'intercompany-setup.html'
    },
    {
      icon: 'fas fa-users',
      iconColor: 'bg-info',
      title: 'Add Users',
      description: 'Create user accounts and roles',
      link: 'user-setup.html'
    }
  ];

  const timelineItems: TimelineItem[] = [
    {
      title: 'Company Setup',
      description: 'Basic company information',
      status: 'completed'
    },
    {
      title: 'Organization Structure',
      description: 'Branches, warehouses and cost centers',
      status: 'active',
      progress: 60
    },
    {
      title: 'Financial Configuration',
      description: 'Chart of accounts and currency settings',
      status: 'pending',
      progress: 10
    },
    {
      title: 'Tax Configuration',
      description: 'GST, TDS and tax codes',
      status: 'pending'
    },
    {
      title: 'Users & Security',
      description: 'Users, roles and permissions',
      status: 'pending'
    },
    {
      title: 'Setup Complete',
      description: 'All configurations done',
      status: 'pending'
    }
  ];

  // Component for setup cards
  const SetupCard: React.FC<SetupCardProps> = ({ icon, title, description, status, link }) => {
    let statusClass = '';
    let statusText = '';
    
    switch (status) {
      case 'completed':
        statusClass = 'bg-success';
        statusText = 'Completed';
        break;
      case 'in-progress':
        statusClass = 'bg-primary';
        statusText = 'In Progress';
        break;
      case 'not-started':
        statusClass = 'bg-secondary';
        statusText = 'Not Started';
        break;
    }
    
    return (
      <div className="card setup-card">
        <div className="card-body">
          <div className="setup-icon">
            <i className={icon}></i>
          </div>
          <h5 className="card-title">{title}</h5>
          <p className="card-text text-muted">{description}</p>
          
          <div className="d-flex justify-content-between align-items-center mt-auto">
            <span className={`badge ${statusClass}`}>{statusText}</span>
            <a href={link} className="btn btn-sm btn-outline-primary">
              <i className="fas fa-edit me-1"></i> {status === 'completed' ? 'View/Edit' : 'Configure'}
            </a>
          </div>
        </div>
      </div>
    );
  };

  // Component for progress items
  const ProgressItem: React.FC<ProgressItemProps> = ({ title, progress, status }) => {
    let iconClass = '';
    let icon = '';
    let progressColor = '';
    
    switch (status) {
      case 'completed':
        iconClass = 'bg-success text-white';
        icon = 'fas fa-check';
        progressColor = 'bg-success';
        break;
      case 'in-progress':
        iconClass = 'bg-primary text-white';
        icon = 'fas fa-spinner fa-spin';
        progressColor = 'bg-primary';
        break;
      case 'not-started':
        iconClass = 'bg-secondary bg-opacity-50 text-dark';
        icon = 'fas fa-clock';
        progressColor = 'bg-secondary';
        break;
    }
    
    return (
      <div className="card h-100 border-0 bg-light">
        <div className="card-body p-3">
          <div className="d-flex align-items-center">
            <div className="flex-shrink-0">
              <div className={`setup-status-icon ${iconClass}`}>
                <i className={icon}></i>
              </div>
            </div>
            <div className="flex-grow-1 ms-3">
              <h6 className="mb-0">{title}</h6>
              <div className="progress mt-2" style={{ height: '5px' }}>
                <div className={`progress-bar ${progressColor}`} role="progressbar" style={{ width: `${progress}%` }}></div>
              </div>
              <small className={`text-${status === 'completed' ? 'success' : status === 'in-progress' ? 'primary' : 'secondary'}`}>
                {status === 'completed' ? 'Completed' : status === 'in-progress' ? `In Progress (${progress}%)` : 'Not Started'}
              </small>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Component for quick action items
  const QuickActionItem: React.FC<QuickActionItem> = ({ icon, iconColor, title, description, link }) => (
    <a href={link} className="list-group-item list-group-item-action d-flex align-items-center p-3 border-0">
      <div className={`icon-circle ${iconColor} text-white me-3`}>
        <i className={icon}></i>
      </div>
      <div>
        <span>{title}</span>
        <small className="d-block text-muted">{description}</small>
      </div>
    </a>
  );

  // Component for timeline items
  const TimelineItem: React.FC<TimelineItem> = ({ title, description, status, progress }) => {
    let markerClass = '';
    let innerClass = '';
    let icon = '';
    
    switch (status) {
      case 'completed':
        markerClass = 'completed';
        innerClass = 'completed';
        icon = 'fas fa-check-circle text-success ms-2';
        break;
      case 'active':
        markerClass = 'active';
        innerClass = 'active';
        icon = 'fas fa-spinner fa-spin text-primary ms-2';
        break;
      case 'pending':
        markerClass = '';
        innerClass = '';
        icon = '';
        break;
    }
    
    return (
      <div className={`timeline-item ${status}`}>
        <div className="timeline-marker"></div>
        <div className="timeline-content">
          <div className="timeline-inner">
            <h5 className="mb-1">{title} {icon && <i className={icon}></i>}</h5>
            <p className="mb-0 text-muted">{description}</p>
            
            {progress !== undefined ? (
              <>
                <div className="progress mt-2" style={{ height: '6px', width: '80%' }}>
                  <div className={`progress-bar bg-${status === 'completed' ? 'success' : status === 'active' ? 'primary' : 'secondary'}`} 
                       role="progressbar" style={{ width: `${progress}%` }}></div>
                </div>
                <small className={`text-${status === 'completed' ? 'success' : status === 'active' ? 'primary' : 'secondary'}`}>
                  {status === 'completed' ? 'Completed' : status === 'active' ? `In Progress (${progress}%)` : 'Not Started'}
                </small>
              </>
            ) : (
              <span className={`badge bg-light text-secondary mt-2`}>Not Started</span>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="setup-dashboard">
      {/* Bootstrap Navbar */}


      {/* Content Container */}
      <div className="container mt-4 mb-5">
        {/* Dashboard Header with animated elements */}
        <div className="page-header mb-4" style={{ background: 'linear-gradient(135deg, #2c3e50, #3498db, #2980b9)', position: 'relative', overflow: 'hidden' }}>
          <div className="position-absolute top-0 end-0 mt-3 me-3 d-none d-md-block">
            <img src="https://cdn-icons-png.flaticon.com/512/1935/1935765.png" alt="Setup" style={{ width: '120px', height: 'auto', opacity: '0.2' }} />
          </div>
          <div className="position-absolute bottom-0 start-0" style={{ opacity: '0.1' }}>
            <i className="fas fa-cogs fa-5x"></i>
          </div>
          <div className="row align-items-center">
            <div className="col-md-8">
              <h1 className="page-title mb-2" style={{ fontWeight: '700', fontSize: '2.5rem' }}>Setup Dashboard</h1>
              <p className="text-light mb-3">Configure and manage your ERP system setup</p>
              <div className="d-flex gap-2">
                <button className="btn btn-light px-4 py-2" onClick={() => setShowSetupGuideModal(true)}>
                  <i className="fas fa-info-circle me-2"></i> Setup Guide
                </button>
                <a href="company-setup.html" className="btn btn-outline-light px-4 py-2">
                  <i className="fas fa-play-circle me-2"></i> Start Setup
                </a>
              </div>
            </div>
            <div className="col-md-4 text-md-end">
              <div className="setup-completion-circle d-inline-block position-relative" style={{ width: '120px', height: '120px' }}>
                <div className="position-absolute top-50 start-50 translate-middle text-center">
                  <h2 className="mb-0 text-white">{statsLoading ? '...' : `${dashboardStats.setupProgress}%`}</h2>
                  <small className="text-white">Complete</small>
                </div>
                <svg width="120" height="120" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="54" fill="none" stroke="#e0e0e0" strokeWidth="8" />
                  <circle cx="60" cy="60" r="54" fill="none" stroke="#2ecc71" strokeWidth="8" strokeDasharray="339.3" strokeDashoffset={statsLoading ? "339.3" : `${339.3 - (339.3 * dashboardStats.setupProgress / 100)}`} transform="rotate(-90 60 60)" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Company Selector for multi-company setup */}
        <div className="card mb-4 border-0 shadow-sm">
          <div className="card-body p-3">
            <div className="d-flex align-items-center justify-content-between flex-wrap">
              <div className="d-flex align-items-center mb-2 mb-md-0">
                <div className="me-3">
                  <div className="bg-primary bg-opacity-10 p-2 rounded-circle">
                    <i className="fas fa-building text-primary"></i>
                  </div>
                </div>
                <div>
                  <small className="text-muted d-block">Active Company Context</small>
                  <div className="dropdown">
                    <button className="btn btn-link text-dark p-0 text-decoration-none dropdown-toggle fw-bold" type="button" id="companyDropdown" data-bs-toggle="dropdown">
                      <span id="selectedCompany">{activeCompany}</span>
                    </button>
                    <ul className="dropdown-menu" aria-labelledby="companyDropdown">
                      <li>
                        <a className={`dropdown-item ${activeCompany === 'All Companies' ? 'active' : ''}`} 
                           href="#" onClick={(e) => { e.preventDefault(); setActiveCompany('All Companies'); }}>
                          <i className="fas fa-layer-group me-2 text-muted"></i>All Companies
                        </a>
                      </li>
                      <li><hr className="dropdown-divider" /></li>
                      <li><h6 className="dropdown-header">Holding Company</h6></li>
                      <li>
                        <a className={`dropdown-item ${activeCompany === 'Parent Corp Ltd' ? 'active' : ''}`} 
                           href="#" onClick={(e) => { e.preventDefault(); setActiveCompany('Parent Corp Ltd'); }}>
                          <i className="fas fa-building me-2 text-primary"></i>Parent Corp Ltd
                        </a>
                      </li>
                      <li><hr className="dropdown-divider" /></li>
                      <li><h6 className="dropdown-header">Subsidiaries</h6></li>
                      <li>
                        <a className={`dropdown-item ${activeCompany === 'Subsidiary A Pvt Ltd' ? 'active' : ''}`} 
                           href="#" onClick={(e) => { e.preventDefault(); setActiveCompany('Subsidiary A Pvt Ltd'); }}>
                          <i className="fas fa-building me-2 text-success"></i>Subsidiary A Pvt Ltd
                        </a>
                      </li>
                      <li>
                        <a className={`dropdown-item ${activeCompany === 'Subsidiary B Pvt Ltd' ? 'active' : ''}`} 
                           href="#" onClick={(e) => { e.preventDefault(); setActiveCompany('Subsidiary B Pvt Ltd'); }}>
                          <i className="fas fa-building me-2 text-warning"></i>Subsidiary B Pvt Ltd
                        </a>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
              <div className="d-flex align-items-center">
                <div className="badge bg-primary bg-opacity-10 text-primary me-3 px-3 py-2 d-none d-md-flex align-items-center">
                  <i className="fas fa-info-circle me-2"></i> 
                  <span>{statsLoading ? 'Loading...' : `${dashboardStats.totalCompanies} Companies Setup`}</span>
                </div>
                <a href="/erp-setup/companies-list" className="btn btn-primary">
                  <i className="fas fa-list me-2"></i> View All Companies
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Setup Progress Overview */}
        <div className="card mb-4 border-0 shadow-sm">
          <div className="card-header bg-white d-flex justify-content-between align-items-center">
            <h5 className="mb-0">
              <i className="fas fa-tasks me-2 text-primary"></i>
              Setup Progress
            </h5>
            <div className="d-flex align-items-center">
              <div className="setup-progress-pill me-2">
                <span className="badge rounded-pill bg-success px-3 py-2">{statsLoading ? '...' : `${dashboardStats.completedSetups} Completed`}</span>
              </div>
              <div className="setup-progress-pill me-2">
                <span className="badge rounded-pill bg-primary px-3 py-2">{statsLoading ? '...' : `${dashboardStats.inProgressSetups} In Progress`}</span>
              </div>
              <div className="setup-progress-pill">
                <span className="badge rounded-pill bg-secondary px-3 py-2">{statsLoading ? '...' : `${dashboardStats.pendingSetups} Pending`}</span>
              </div>
            </div>
          </div>
          <div className="card-body">
            {/* Progress Bar */}
            <div className="position-relative mb-4">
              <div className="progress" style={{ height: '12px', borderRadius: '6px' }}>
                <div className="progress-bar bg-success" role="progressbar" style={{ width: statsLoading ? '0%' : `${(dashboardStats.completedSetups / Math.max(dashboardStats.totalCompanies, 1)) * 100}%` }} aria-valuenow={dashboardStats.completedSetups} aria-valuemin={0} aria-valuemax={100}></div>
                <div className="progress-bar bg-primary" role="progressbar" style={{ width: statsLoading ? '0%' : `${(dashboardStats.inProgressSetups / Math.max(dashboardStats.totalCompanies, 1)) * 100}%` }} aria-valuenow={dashboardStats.inProgressSetups} aria-valuemin={0} aria-valuemax={100}></div>
                <div className="progress-bar bg-secondary" role="progressbar" style={{ width: statsLoading ? '100%' : `${(dashboardStats.pendingSetups / Math.max(dashboardStats.totalCompanies, 1)) * 100}%`, opacity: '0.2' }} aria-valuenow={dashboardStats.pendingSetups} aria-valuemin={0} aria-valuemax={100}></div>
              </div>
              <div className="position-absolute" style={{ top: '-10px', left: '40%', transform: 'translateX(-50%)' }}>
                <span className="badge rounded-pill bg-warning px-3 py-1">You are here</span>
              </div>
            </div>
            
            {/* Progress Details */}
            <div className="row g-3">
              {progressItems.map((item, index) => (
                <div className="col-md-3" key={index}>
                  <ProgressItem title={item.title} progress={item.progress} status={item.status} />
                </div>
              ))}
            </div>
          </div>
          <div className="card-footer bg-white text-center">
            <button className="btn btn-sm btn-outline-primary" onClick={() => setShowSetupGuideModal(true)}>
              <i className="fas fa-map-marker-alt me-2"></i> View My Setup Path
            </button>
          </div>
        </div>

        {/* Enhanced Recommended Next Steps */}
        <div className="mb-4">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h4 className="setup-section-title mb-0">Recommended Next Steps</h4>
            <div className="d-flex align-items-center">
              <small className="text-muted me-2">Customized for your setup</small>
              <i className="fas fa-info-circle text-primary" data-bs-toggle="tooltip" title="Based on your current setup progress"></i>
            </div>
          </div>
          
          <div className="row g-4">
            <div className="col-md-4">
              <div className="card h-100 border-0 shadow-sm position-relative gradient-card">
                <div className="position-absolute top-0 end-0 m-2">
                  <span className="badge bg-danger px-3 py-2">Required Next</span>
                </div>
                <div className="card-body p-4">
                  <div className="setup-icon-container mb-3">
                    <div className="setup-icon-large">
                      <i className="fas fa-map-marker-alt"></i>
                    </div>
                  </div>
                  <h5 className="card-title">Complete Branch Setup</h5>
                  <p className="card-text text-muted">Complete setting up your company's branches to define operational locations and hierarchies.</p>
                  <div className="mt-3 mb-4">
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <small className="text-muted">Progress</small>
                      <small className="text-primary fw-bold">60%</small>
                    </div>
                    <div className="progress" style={{ height: '6px' }}>
                      <div className="progress-bar bg-primary" role="progressbar" style={{ width: '60%' }} aria-valuenow={60} aria-valuemin={0} aria-valuemax={100}></div>
                    </div>
                  </div>
                  <div className="d-grid">
                    <a href="branch-setup.html" className="btn btn-primary btn-lg">
                      <i className="fas fa-arrow-right me-2"></i> Continue Setup
                    </a>
                  </div>
                </div>
                <div className="card-footer bg-white p-3 border-top-0">
                  <div className="d-flex justify-content-between align-items-center small">
                    <span><i className="fas fa-clock text-muted me-1"></i> Est. time: 10 min</span>
                    <span className="text-muted">2 of 5 steps complete</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="col-md-4">
              <div className="card h-100 border-0 shadow-sm position-relative gradient-card">
                <div className="position-absolute top-0 end-0 m-2">
                  <span className="badge bg-danger px-3 py-2">Required</span>
                </div>
                <div className="card-body p-4">
                  <div className="setup-icon-container mb-3">
                    <div className="setup-icon-large">
                      <i className="fas fa-sitemap"></i>
                    </div>
                  </div>
                  <h5 className="card-title">Chart of Accounts</h5>
                  <p className="card-text text-muted">Set up your company's chart of accounts structure to define financial reporting and transaction posting.</p>
                  <div className="mt-3 mb-4">
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <small className="text-muted">Progress</small>
                      <small className="text-primary fw-bold">10%</small>
                    </div>
                    <div className="progress" style={{ height: '6px' }}>
                      <div className="progress-bar bg-primary" role="progressbar" style={{ width: '10%' }} aria-valuenow={10} aria-valuemin={0} aria-valuemax={100}></div>
                    </div>
                  </div>
                  <div className="d-grid">
                    <a href="chart-of-accounts.html" className="btn btn-primary btn-lg">
                      <i className="fas fa-arrow-right me-2"></i> Continue Setup
                    </a>
                  </div>
                </div>
                <div className="card-footer bg-white p-3 border-top-0">
                  <div className="d-flex justify-content-between align-items-center small">
                    <span><i className="fas fa-clock text-muted me-1"></i> Est. time: 30 min</span>
                    <span className="text-muted">1 of 8 steps complete</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="col-md-4">
              <div className="card h-100 border-0 shadow-sm position-relative gradient-card">
                <div className="position-absolute top-0 end-0 m-2">
                  <span className="badge bg-warning text-dark px-3 py-2">Recommended</span>
                </div>
                <div className="card-body p-4">
                  <div className="setup-icon-container mb-3">
                    <div className="setup-icon-large">
                      <i className="fas fa-network-wired"></i>
                    </div>
                  </div>
                  <h5 className="card-title">Intercompany Setup</h5>
                  <p className="card-text text-muted">Configure relationships between parent and subsidiary companies for intercompany transactions.</p>
                  <div className="mt-3 mb-4">
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <small className="text-muted">Progress</small>
                      <small className="text-secondary fw-bold">Not Started</small>
                    </div>
                    <div className="progress" style={{ height: '6px' }}>
                      <div className="progress-bar bg-secondary" role="progressbar" style={{ width: '0%' }} aria-valuenow={0} aria-valuemin={0} aria-valuemax={100}></div>
                    </div>
                  </div>
                  <div className="d-grid">
                    <a href="intercompany-setup.html" className="btn btn-outline-primary btn-lg">
                      <i className="fas fa-arrow-right me-2"></i> Start Setup
                    </a>
                  </div>
                </div>
                <div className="card-footer bg-white p-3 border-top-0">
                  <div className="d-flex justify-content-between align-items-center small">
                    <span><i className="fas fa-clock text-muted me-1"></i> Est. time: 20 min</span>
                    <span className="text-muted">Multi-company feature</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Setup Categories */}
        <div className="row">
          {/* Left Side - Setup Categories */}
          <div className="col-md-8">
            {/* Company & Organization Setup */}
            <div className="mb-4">
              <h4 className="setup-section-title">Company & Organization Setup</h4>
              <div className="row row-cols-1 row-cols-md-2 g-4">
                {companySetupCards.map((card, index) => (
                  <div className="col" key={index}>
                    <SetupCard {...card} />
                  </div>
                ))}
              </div>
            </div>
            
            {/* Accounting Setup */}
            <div className="mb-4">
              <h4 className="setup-section-title">Financial & Accounting Setup</h4>
              <div className="row row-cols-1 row-cols-md-2 g-4">
                {financialSetupCards.map((card, index) => (
                  <div className="col" key={index}>
                    <SetupCard {...card} />
                  </div>
                ))}
              </div>
            </div>
            
            {/* Tax Setup */}
            <div className="mb-4">
              <h4 className="setup-section-title">Tax & Regulatory Setup</h4>
              <div className="row row-cols-1 row-cols-md-2 g-4">
                {taxSetupCards.map((card, index) => (
                  <div className="col" key={index}>
                    <SetupCard {...card} />
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Add Setup Flow Roadmap before sidebar */}
          <div className="col-12 mb-4">
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-white d-flex justify-content-between align-items-center">
                <h5 className="mb-0"><i className="fas fa-route me-2 text-primary"></i> Setup Roadmap</h5>
                <button className="btn btn-sm btn-outline-secondary" data-bs-toggle="tooltip" title="Print Roadmap">
                  <i className="fas fa-print"></i>
                </button>
              </div>
              <div className="card-body p-4">
                <div className="setup-roadmap">
                  <div className="timeline">
                    {timelineItems.map((item, index) => (
                      <TimelineItem key={index} {...item} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Quick Links and Info */}
          <div className="col-md-4">
            {/* Quick Links Card */}
            <div className="card mb-4 quick-links border-0 shadow-sm">
              <div className="card-header bg-primary text-white">
                <h5 className="mb-0"><i className="fas fa-bolt me-2"></i>Quick Actions</h5>
              </div>
              <div className="card-body p-0">
                <div className="list-group list-group-flush">
                  {quickActions.map((action, index) => (
                    <QuickActionItem key={index} {...action} />
                  ))}
                </div>
              </div>
            </div>
            
            {/* Setup Help Card */}
            <div className="card mb-4">
              <div className="card-header bg-primary text-white">
                <h5 className="mb-0"><i className="fas fa-question-circle me-2"></i>Setup Help</h5>
              </div>
              <div className="card-body">
                <p>Need help with your ERP setup? Our recommended setup sequence:</p>
                <ol className="ps-3">
                  <li className="mb-2"><strong>Company Profile</strong> - Set up your company details</li>
                  <li className="mb-2"><strong>Organizational Structure</strong> - Configure branches and departments</li>
                  <li className="mb-2"><strong>Financial Structure</strong> - Chart of accounts and currency settings</li>
                  <li className="mb-2"><strong>Tax Configuration</strong> - Set up tax registrations and rates</li>
                  <li className="mb-2"><strong>User Access</strong> - Define roles and permissions</li>
                </ol>
                <div className="mt-3">
                  <button className="btn btn-sm btn-primary w-100" onClick={() => setShowSetupGuideModal(true)}>
                    <i className="fas fa-book me-2"></i> View Complete Setup Guide
                  </button>
                </div>
              </div>
            </div>
            
            {/* Recent Activity */}
            <div className="card">
              <div className="card-header">
                <h5 className="mb-0"><i className="fas fa-history me-2 text-secondary"></i>Recent Setup Activity</h5>
              </div>
              <div className="card-body p-0">
                <ul className="list-group list-group-flush">
                  <li className="list-group-item">
                    <div className="d-flex w-100 justify-content-between">
                      <h6 className="mb-1">Company Profile Updated</h6>
                      <small>2 hours ago</small>
                    </div>
                    <small className="text-muted">Admin User updated Company Profile information</small>
                  </li>
                  <li className="list-group-item">
                    <div className="d-flex w-100 justify-content-between">
                      <h6 className="mb-1">New Branch Added</h6>
                      <small>Yesterday</small>
                    </div>
                    <small className="text-muted">Admin User added "Mumbai Branch"</small>
                  </li>
                  <li className="list-group-item">
                    <div className="d-flex w-100 justify-content-between">
                      <h6 className="mb-1">Setup Started</h6>
                      <small>2 days ago</small>
                    </div>
                    <small className="text-muted">ERP Setup process initiated by Admin User</small>
                  </li>
                </ul>
              </div>
              <div className="card-footer bg-white">
                <a href="audit-trail.html" className="btn btn-sm btn-outline-secondary w-100">
                  <i className="fas fa-list me-2"></i> View All Activity
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Setup Guide Modal */}
      {/* React-controlled Setup Guide Modal */}
      <div
        className={`modal fade${showSetupGuideModal ? ' show' : ''}`}
        id="setupGuideModal"
        tabIndex={-1}
        aria-labelledby="setupGuideModalLabel"
        aria-hidden={!showSetupGuideModal}
        ref={modalRef}
        style={{ display: showSetupGuideModal ? 'block' : 'none' }}
        onMouseDown={e => {
          // Only close if clicking on the backdrop, not inside the modal-dialog
          if (e.target === modalRef.current) {
            handleModalClose();
          }
        }}
      >
        <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
          <div className="modal-content border-0">
            <div className="modal-header" style={{ background: 'linear-gradient(135deg, #2c3e50, #3498db)', color: 'white', borderBottom: '0' }}>
              <h5 className="modal-title" id="setupGuideModalLabel">
                <i className="fas fa-map-signs me-2"></i> Interactive Setup Guide
              </h5>
              <button type="button" className="btn-close btn-close-white" onClick={handleModalClose} aria-label="Close"></button>
            </div>
            <div className="modal-body p-0">
              {/* Step Tabs */}
              <ul className="nav nav-tabs nav-fill setup-tabs" id="setupTabs" role="tablist">
                <li className="nav-item" role="presentation">
                  <button 
                    className={`nav-link ${activeTab === 'overview' ? 'active' : ''}`} 
                    onClick={() => setActiveTab('overview')}
                    type="button" 
                    role="tab"
                  >
                    <i className="fas fa-home"></i>
                    <span className="d-none d-md-inline ms-2">Overview</span>
                  </button>
                </li>
                <li className="nav-item" role="presentation">
                  <button 
                    className={`nav-link ${activeTab === 'company' ? 'active' : ''}`} 
                    onClick={() => setActiveTab('company')}
                    type="button" 
                    role="tab"
                  >
                    <i className="fas fa-building"></i>
                    <span className="d-none d-md-inline ms-2">Company</span>
                  </button>
                </li>
                <li className="nav-item" role="presentation">
                  <button 
                    className={`nav-link ${activeTab === 'organization' ? 'active' : ''}`} 
                    onClick={() => setActiveTab('organization')}
                    type="button" 
                    role="tab"
                  >
                    <i className="fas fa-sitemap"></i>
                    <span className="d-none d-md-inline ms-2">Organization</span>
                  </button>
                </li>
                <li className="nav-item" role="presentation">
                  <button 
                    className={`nav-link ${activeTab === 'financial' ? 'active' : ''}`} 
                    onClick={() => setActiveTab('financial')}
                    type="button" 
                    role="tab"
                  >
                    <i className="fas fa-chart-line"></i>
                    <span className="d-none d-md-inline ms-2">Financial</span>
                  </button>
                </li>
                <li className="nav-item" role="presentation">
                  <button 
                    className={`nav-link ${activeTab === 'tax' ? 'active' : ''}`} 
                    onClick={() => setActiveTab('tax')}
                    type="button" 
                    role="tab"
                  >
                    <i className="fas fa-percentage"></i>
                    <span className="d-none d-md-inline ms-2">Tax</span>
                  </button>
                </li>
                <li className="nav-item" role="presentation">
                  <button 
                    className={`nav-link ${activeTab === 'users' ? 'active' : ''}`} 
                    onClick={() => setActiveTab('users')}
                    type="button" 
                    role="tab"
                  >
                    <i className="fas fa-users"></i>
                    <span className="d-none d-md-inline ms-2">Users</span>
                  </button>
                </li>
              </ul>
              
              <div className="tab-content setup-tab-content" id="setupTabsContent">
                {/* Overview Tab */}
                <div className={`tab-pane fade ${activeTab === 'overview' ? 'show active' : ''} p-4`} id="overview" role="tabpanel">
                  <div className="row align-items-center mb-4">
                    <div className="col-lg-7">
                      <h4 className="mb-3">Complete ERP Setup Process</h4>
                      <p>Setting up your ERP system involves configuring multiple aspects of your organization's structure, financial processes, and compliance requirements. Follow this interactive guide to ensure a complete setup.</p>
                      
                      <div className="alert alert-info d-flex p-3">
                        <div className="flex-shrink-0 me-3">
                          <i className="fas fa-lightbulb fa-2x text-primary"></i>
                        </div>
                        <div>
                          <h6>Multi-Company Support</h6>
                          <p className="mb-0">For holding companies with subsidiaries, create the parent company first, then configure intercompany relationships for seamless operations across your business group.</p>
                        </div>
                      </div>
                    </div>
                    <div className="col-lg-5 mt-4 mt-lg-0 text-center">
                      <img src="https://cdn-icons-png.flaticon.com/512/1935/1935765.png" alt="Setup Process" style={{ width: '180px', height: 'auto' }} />
                      <div className="progress mt-4" style={{ height: '10px' }}>
                        <div className="progress-bar bg-success" role="progressbar" style={{ width: statsLoading ? '0%' : `${dashboardStats.setupProgress}%` }} aria-valuenow={dashboardStats.setupProgress} aria-valuemin={0} aria-valuemax={100}></div>
                      </div>
                      <p className="mt-2"><strong>{statsLoading ? 'Loading...' : `${dashboardStats.setupProgress}% Complete`}</strong> - {dashboardStats.setupProgress > 50 ? "You're making excellent progress!" : "You're making good progress!"}</p>
                    </div>
                  </div>
                  
                  <h5 className="border-bottom pb-2 mb-3">Setup Sequence Overview</h5>
                  <div className="row row-cols-1 row-cols-md-3 g-4 mb-4">
                    <div className="col">
                      <div className="card h-100 border-0 shadow-sm">
                        <div className="card-body p-3">
                          <div className="d-flex align-items-center mb-3">
                            <div className="setup-step-icon completed me-3">1</div>
                            <h6 className="mb-0">Company Profile</h6>
                          </div>
                          <p className="small text-muted mb-0">Basic company information, legal details, addresses</p>
                        </div>
                        <div className="card-footer bg-white border-top-0">
                          <div className="d-flex justify-content-between align-items-center">
                            <span className="badge bg-success">Completed</span>
                            <button className="btn btn-sm btn-outline-primary" onClick={() => setActiveTab('company')}>View Details</button>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="col">
                      <div className="card h-100 border-0 shadow-sm border-primary border-start border-3">
                        <div className="card-body p-3">
                          <div className="d-flex align-items-center mb-3">
                            <div className="setup-step-icon active me-3">2</div>
                            <h6 className="mb-0">Organization Structure</h6>
                          </div>
                          <p className="small text-muted mb-0">Branches, warehouses, cost centers, and intercompany setup</p>
                        </div>
                        <div className="card-footer bg-white border-top-0">
                          <div className="d-flex justify-content-between align-items-center">
                            <span className="badge bg-primary">In Progress</span>
                            <button className="btn btn-sm btn-outline-primary" onClick={() => setActiveTab('organization')}>Continue</button>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="col">
                      <div className="card h-100 border-0 shadow-sm">
                        <div className="card-body p-3">
                          <div className="d-flex align-items-center mb-3">
                            <div className="setup-step-icon me-3">3</div>
                            <h6 className="mb-0">Financial Configuration</h6>
                          </div>
                          <p className="small text-muted mb-0">Chart of accounts, fiscal years, default mappings</p>
                        </div>
                        <div className="card-footer bg-white border-top-0">
                          <div className="d-flex justify-content-between align-items-center">
                            <span className="badge bg-secondary">10% Done</span>
                            <button className="btn btn-sm btn-outline-secondary" onClick={() => setActiveTab('financial')}>View Details</button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-center mt-4">
                    <a href="branch-setup.html" className="btn btn-lg btn-primary px-5 py-2">
                      <i className="fas fa-arrow-right me-2"></i> Continue Your Setup
                    </a>
                  </div>
                </div>
                
                {/* Company Tab */}
                <div className={`tab-pane fade ${activeTab === 'company' ? 'show active' : ''} p-4`} id="company" role="tabpanel">
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <h4 className="mb-0">1. Company Profile Setup</h4>
                    <span className="badge bg-success px-3 py-2">Completed</span>
                  </div>
                  
                  <p>The foundation of your ERP system starts with setting up your company's basic information. This includes legal details, addresses, and financial year settings.</p>
                  
                  <div className="list-group mb-4">
                    <div className="list-group-item d-flex justify-content-between align-items-center">
                      <div>
                        <strong>Legal Entity Information</strong>
                        <p className="mb-0 text-muted small">Company name, registration numbers, legal type</p>
                      </div>
                      <span className="badge bg-success rounded-pill">Complete</span>
                    </div>
                    <div className="list-group-item d-flex justify-content-between align-items-center">
                      <div>
                        <strong>Address Information</strong>
                        <p className="mb-0 text-muted small">Registered & operational addresses</p>
                      </div>
                      <span className="badge bg-success rounded-pill">Complete</span>
                    </div>
                    <div className="list-group-item d-flex justify-content-between align-items-center">
                      <div>
                        <strong>Tax Registration Details</strong>
                        <p className="mb-0 text-muted small">GST, PAN, TAN information</p>
                      </div>
                      <span className="badge bg-success rounded-pill">Complete</span>
                    </div>
                    <div className="list-group-item d-flex justify-content-between align-items-center">
                      <div>
                        <strong>Financial Year & Currency</strong>
                        <p className="mb-0 text-muted small">Year start/end dates, base currency</p>
                      </div>
                      <span className="badge bg-success rounded-pill">Complete</span>
                    </div>
                  </div>
                  
                  <div className="d-flex justify-content-between">
                    <a href="company-setup.html" className="btn btn-primary">
                      <i className="fas fa-edit me-2"></i> View/Edit Company Details
                    </a>
                    <button className="btn btn-outline-primary" onClick={() => setActiveTab('organization')}>
                      Next Step: Organization Structure <i className="fas fa-arrow-right ms-2"></i>
                    </button>
                  </div>
                </div>
                
                {/* Organization Tab */}
                <div className={`tab-pane fade ${activeTab === 'organization' ? 'show active' : ''} p-4`} id="organization" role="tabpanel">
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <h4 className="mb-0">2. Organization Structure</h4>
                    <span className="badge bg-primary px-3 py-2">In Progress (60%)</span>
                  </div>
                  
                  <p>Define your organization's physical and operational structure, including branches, warehouses, and cost centers. For multi-company setups, configure intercompany relationships.</p>
                  
                  <div className="row mb-4">
                    <div className="col-md-6 mb-4">
                      <div className="card h-100 border-0 shadow-sm">
                        <div className="card-body">
                          <h5 className="card-title d-flex justify-content-between align-items-center">
                            <span><i className="fas fa-code-branch me-2 text-primary"></i> Branch Setup</span>
                            <span className="badge bg-primary">In Progress</span>
                          </h5>
                          <p className="card-text text-muted">Define branches for your company operations with addresses and contact details.</p>
                          <ul className="small mb-4">
                            <li>Create multiple branches for each operational location</li>
                            <li>Associate branches with specific companies</li>
                            <li>Define branch hierarchy if applicable</li>
                          </ul>
                          <a href="branch-setup.html" className="btn btn-primary">Continue Branch Setup</a>
                        </div>
                      </div>
                    </div>
                    
                    <div className="col-md-6 mb-4">
                      <div className="card h-100 border-0 shadow-sm">
                        <div className="card-body">
                          <h5 className="card-title d-flex justify-content-between align-items-center">
                            <span><i className="fas fa-warehouse me-2 text-warning"></i> Warehouse Setup</span>
                            <span className="badge bg-secondary">Not Started</span>
                          </h5>
                          <p className="card-text text-muted">Configure warehouses for inventory storage within your branches.</p>
                          <ul className="small mb-4">
                            <li>Associate warehouses with branches</li>
                            <li>Define storage locations within warehouses</li>
                            <li>Set inventory management parameters</li>
                          </ul>
                          <a href="warehouse-setup.html" className="btn btn-outline-secondary">Start Warehouse Setup</a>
                        </div>
                      </div>
                    </div>
                    
                    <div className="col-md-6 mb-4">
                      <div className="card h-100 border-0 shadow-sm">
                        <div className="card-body">
                          <h5 className="card-title d-flex justify-content-between align-items-center">
                            <span><i className="fas fa-tags me-2 text-success"></i> Cost Center Setup</span>
                            <span className="badge bg-secondary">Not Started</span>
                          </h5>
                          <p className="card-text text-muted">Define cost centers for tracking expenses and revenues by department.</p>
                          <ul className="small mb-4">
                            <li>Create department-based cost centers</li>
                            <li>Define cost center hierarchy</li>
                            <li>Configure cost center approval flows</li>
                          </ul>
                          <a href="cost-centre-setup.html" className="btn btn-outline-secondary">Start Cost Center Setup</a>
                        </div>
                      </div>
                    </div>
                    
                    <div className="col-md-6 mb-4">
                      <div className="card h-100 border-0 shadow-sm">
                        <div className="card-body">
                          <h5 className="card-title d-flex justify-content-between align-items-center">
                            <span><i className="fas fa-network-wired me-2 text-info"></i> Intercompany Setup</span>
                            <span className="badge bg-secondary">Not Started</span>
                          </h5>
                          <p className="card-text text-muted">Configure relationships between companies for intercompany transactions.</p>
                          <ul className="small mb-4">
                            <li>Define parent-subsidiary relationships</li>
                            <li>Configure intercompany transaction rules</li>
                            <li>Set up intercompany accounts</li>
                          </ul>
                          <a href="intercompany-setup.html" className="btn btn-outline-secondary">Start Intercompany Setup</a>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="d-flex justify-content-between">
                    <button className="btn btn-outline-secondary" onClick={() => setActiveTab('company')}>
                      <i className="fas fa-arrow-left me-2"></i> Previous: Company Profile
                    </button>
                    <button className="btn btn-outline-primary" onClick={() => setActiveTab('financial')}>
                      Next: Financial Configuration <i className="fas fa-arrow-right ms-2"></i>
                    </button>
                  </div>
                </div>
                
                {/* Financial Tab */}
                <div className={`tab-pane fade ${activeTab === 'financial' ? 'show active' : ''} p-4`} id="financial" role="tabpanel">
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <h4 className="mb-0">3. Financial Configuration</h4>
                    <span className="badge bg-secondary px-3 py-2">Just Started (10%)</span>
                  </div>
                  
                  <p>Configure the financial foundation of your ERP system including charts of accounts, fiscal periods, and default account mappings.</p>
                  
                  <div className="accordion mb-4" id="financialAccordion">
                    <div className="accordion-item border-0 shadow-sm mb-3">
                      <h2 className="accordion-header">
                        <button className="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#collapseOne">
                          <i className="fas fa-sitemap me-2 text-primary"></i> Chart of Accounts
                        </button>
                      </h2>
                      <div id="collapseOne" className="accordion-collapse collapse show" data-bs-parent="#financialAccordion">
                        <div className="accordion-body">
                          <p>Define the structure of your financial accounts for reporting and transaction posting.</p>
                          <ul className="mb-3">
                            <li>Configure account groups and subgroups</li>
                            <li>Create general ledger accounts</li>
                            <li>Set up account mappings to financial statements</li>
                          </ul>
                          <a href="chart-of-accounts.html" className="btn btn-sm btn-primary">Configure Chart of Accounts</a>
                        </div>
                      </div>
                    </div>
                    
                    <div className="accordion-item border-0 shadow-sm mb-3">
                      <h2 className="accordion-header">
                        <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseTwo">
                          <i className="fas fa-calendar-alt me-2 text-warning"></i> Accounting Periods
                        </button>
                      </h2>
                      <div id="collapseTwo" className="accordion-collapse collapse" data-bs-parent="#financialAccordion">
                        <div className="accordion-body">
                          <p>Define fiscal years and accounting periods for financial reporting.</p>
                          <ul className="mb-3">
                            <li>Set up your financial year</li>
                            <li>Configure monthly, quarterly, or custom periods</li>
                            <li>Define period opening and closing rules</li>
                          </ul>
                          <a href="accounting-periods.html" className="btn btn-sm btn-outline-secondary">Configure Accounting Periods</a>
                        </div>
                      </div>
                    </div>
                    
                    <div className="accordion-item border-0 shadow-sm mb-3">
                      <h2 className="accordion-header">
                        <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseThree">
                          <i className="fas fa-link me-2 text-info"></i> Default Account Mapping
                        </button>
                      </h2>
                      <div id="collapseThree" className="accordion-collapse collapse" data-bs-parent="#financialAccordion">
                        <div className="accordion-body">
                          <p>Map transaction types to default accounts for automated posting.</p>
                          <ul className="mb-3">
                            <li>Configure sales account mappings</li>
                            <li>Set up purchase account defaults</li>
                            <li>Define tax, inventory, and expense account mappings</li>
                          </ul>
                          <a href="default-account-mapping.html" className="btn btn-sm btn-outline-secondary">Configure Account Mappings</a>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="d-flex justify-content-between">
                    <button className="btn btn-outline-secondary" onClick={() => setActiveTab('organization')}>
                      <i className="fas fa-arrow-left me-2"></i> Previous: Organization Structure
                    </button>
                    <button className="btn btn-outline-secondary" onClick={() => setActiveTab('tax')}>
                      Next: Tax Configuration <i className="fas fa-arrow-right ms-2"></i>
                    </button>
                  </div>
                </div>
                
                {/* Tax Tab */}
                <div className={`tab-pane fade ${activeTab === 'tax' ? 'show active' : ''} p-4`} id="tax" role="tabpanel">
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <h4 className="mb-0">4. Tax Configuration</h4>
                    <span className="badge bg-secondary px-3 py-2">Not Started</span>
                  </div>
                  
                  <p>Configure tax settings for compliance with Indian tax regulations, including GST, TDS, and HSN/SAC codes.</p>
                  
                  <div className="row g-4 mb-4">
                    <div className="col-md-6">
                      <div className="card border-0 shadow-sm h-100">
                        <div className="card-body">
                          <h5><i className="fas fa-percentage me-2 text-danger"></i> GST Setup</h5>
                          <p className="text-muted small mb-4">Configure Goods and Services Tax settings for your company.</p>
                          <ul className="small mb-4">
                            <li>Set up GST registration details</li>
                            <li>Configure GST rates and calculations</li>
                            <li>Set up GST return filing parameters</li>
                          </ul>
                          <a href="gst-setup.html" className="btn btn-sm btn-outline-secondary">Configure GST</a>
                        </div>
                      </div>
                    </div>
                    
                    <div className="col-md-6">
                      <div className="card border-0 shadow-sm h-100">
                        <div className="card-body">
                          <h5><i className="fas fa-hand-holding-usd me-2 text-success"></i> TDS Setup</h5>
                          <p className="text-muted small mb-4">Set up Tax Deducted at Source parameters for vendor payments.</p>
                          <ul className="small mb-4">
                            <li>Configure TDS sections and rates</li>
                            <li>Set vendor TDS applicability</li>
                            <li>Define TDS certificates and returns</li>
                          </ul>
                          <a href="tds-setup.html" className="btn btn-sm btn-outline-secondary">Configure TDS</a>
                        </div>
                      </div>
                    </div>
                    
                    <div className="col-md-6">
                      <div className="card border-0 shadow-sm h-100">
                        <div className="card-body">
                          <h5><i className="fas fa-boxes me-2 text-warning"></i> HSN Codes</h5>
                          <p className="text-muted small mb-4">Set up Harmonized System of Nomenclature codes for products.</p>
                          <ul className="small mb-4">
                            <li>Import standard HSN code master</li>
                            <li>Map HSN codes to product categories</li>
                            <li>Configure tax rates for HSN codes</li>
                          </ul>
                          <a href="hsn-code-setup.html" className="btn btn-sm btn-outline-secondary">Configure HSN Codes</a>
                        </div>
                      </div>
                    </div>
                    
                    <div className="col-md-6">
                      <div className="card border-0 shadow-sm h-100">
                        <div className="card-body">
                          <h5><i className="fas fa-concierge-bell me-2 text-info"></i> SAC Codes</h5>
                          <p className="text-muted small mb-4">Set up Service Accounting Codes for services offered.</p>
                          <ul className="small mb-4">
                            <li>Import standard SAC code master</li>
                            <li>Map SAC codes to service categories</li>
                            <li>Configure tax rates for SAC codes</li>
                          </ul>
                          <a href="sac-code-setup.html" className="btn btn-sm btn-outline-secondary">Configure SAC Codes</a>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="d-flex justify-content-between">
                    <button className="btn btn-outline-secondary" onClick={() => setActiveTab('financial')}>
                      <i className="fas fa-arrow-left me-2"></i> Previous: Financial Configuration
                    </button>
                    <button className="btn btn-outline-secondary" onClick={() => setActiveTab('users')}>
                      Next: User Management <i className="fas fa-arrow-right ms-2"></i>
                    </button>
                  </div>
                </div>
                
                {/* Users Tab */}
                <div className={`tab-pane fade ${activeTab === 'users' ? 'show active' : ''} p-4`} id="users" role="tabpanel">
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <h4 className="mb-0">5. User Management & Security</h4>
                    <span className="badge bg-secondary px-3 py-2">Not Started</span>
                  </div>
                  
                  <p>Set up users, roles, and access controls to manage security and permissions within your ERP system.</p>
                  
                  <div className="row g-4 mb-4">
                    <div className="col-lg-4">
                      <div className="card border-0 shadow-sm h-100">
                        <div className="card-body text-center p-4">
                          <div className="display-3 text-primary mb-3">
                            <i className="fas fa-user-plus"></i>
                          </div>
                          <h5>User Setup</h5>
                          <p className="text-muted small">Create user accounts for employees who need access to the ERP system.</p>
                          <a href="user-setup.html" className="btn btn-outline-primary mt-3">Configure Users</a>
                        </div>
                      </div>
                    </div>
                    
                    <div className="col-lg-4">
                      <div className="card border-0 shadow-sm h-100">
                        <div className="card-body text-center p-4">
                          <div className="display-3 text-success mb-3">
                            <i className="fas fa-user-tag"></i>
                          </div>
                          <h5>Role Definition</h5>
                          <p className="text-muted small">Define roles with specific permissions and assign them to users.</p>
                          <a href="role-definition.html" className="btn btn-outline-primary mt-3">Configure Roles</a>
                        </div>
                      </div>
                    </div>
                    
                    <div className="col-lg-4">
                      <div className="card border-0 shadow-sm h-100">
                        <div className="card-body text-center p-4">
                          <div className="display-3 text-warning mb-3">
                            <i className="fas fa-project-diagram"></i>
                          </div>
                          <h5>Approval Hierarchy</h5>
                          <p className="text-muted small">Configure approval workflows for various transactions.</p>
                          <a href="approval-hierarchy.html" className="btn btn-outline-primary mt-3">Configure Approvals</a>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="alert alert-info d-flex p-3">
                    <div className="flex-shrink-0 me-3">
                      <i className="fas fa-shield-alt fa-2x text-primary"></i>
                    </div>
                    <div>
                      <h6>Security Best Practice</h6>
                      <p className="mb-0">Follow the principle of least privilege when assigning permissions. Users should only have access to the features and data necessary for their job functions.</p>
                    </div>
                  </div>
                  
                  <div className="d-flex justify-content-between">
                    <button className="btn btn-outline-secondary" onClick={() => setActiveTab('tax')}>
                      <i className="fas fa-arrow-left me-2"></i> Previous: Tax Configuration
                    </button>
                    <button className="btn btn-outline-secondary" onClick={() => setActiveTab('overview')}>
                      Back to Overview <i className="fas fa-home ms-2"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer bg-light">
              <button type="button" className="btn btn-secondary" onClick={handleModalClose}>Close</button>
              <button type="button" className="btn btn-primary">
                <i className="fas fa-download me-2"></i> Download Setup Checklist
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Footer */}
      <footer className="footer mt-auto py-4 bg-white border-top">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-md-6 mb-3 mb-md-0">
              <div className="d-flex align-items-center">
                <i className="fas fa-building text-primary me-2"></i>
                <span className="fw-bold">ERP System</span>
              </div>
              <p className="text-muted small mb-0 mt-1">Comprehensive business management solution for modern enterprises</p>
            </div>
            <div className="col-md-6">
              <div className="d-flex justify-content-md-end align-items-center">
                <a href="#" className="btn btn-sm btn-outline-secondary me-2">
                  <i className="fas fa-question-circle me-1"></i> Help Center
                </a>
                <a href="#" className="btn btn-sm btn-outline-primary">
                  <i className="fas fa-headset me-1"></i> Contact Support
                </a>
              </div>
              <p className="text-muted small text-md-end mb-0 mt-1">Version 2.0 &copy; 2025 ERP System</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default SetupDashboard;