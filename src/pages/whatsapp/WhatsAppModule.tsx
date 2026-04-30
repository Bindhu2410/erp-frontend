import React, { useState, useEffect, useRef } from "react";
import "./WhatsAppModule.css";
import whatsappService, { WhatsAppLead, WhatsAppMessage, WhatsAppAccount } from "../../services/whatsappService";
import api from "../../services/api";
import { 
  FiSearch, 
  FiMoreVertical, 
  FiPaperclip, 
  FiSend, 
  FiSmile, 
  FiCheck,
  FiUser,
  FiChevronLeft,
  FiSettings,
  FiDatabase,
  FiPlus
} from "react-icons/fi";
import { toast } from "react-toastify";
import { useUser } from "../../context/UserContext";

const WhatsAppModule: React.FC = () => {
  const { user } = useUser();
  const userId = user?.userId;

  // State
  const [leads, setLeads] = useState<WhatsAppLead[]>([]);
  const [selectedLead, setSelectedLead] = useState<WhatsAppLead | null>(null);
  const [messages, setMessages] = useState<WhatsAppMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [lookupName, setLookupName] = useState("");
  const [lookupPhone, setLookupPhone] = useState("");
  const [isLoadingLeads, setIsLoadingLeads] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [mobileView, setMobileView] = useState<"list" | "chat">("list");
  const [showPanel, setShowPanel] = useState(false);
  const [panelTab, setPanelTab] = useState<"info" | "settings">("info");

  // Account State
  const [accounts, setAccounts] = useState<WhatsAppAccount[]>([]);
  const [isLoadingAccounts, setIsLoadingAccounts] = useState(false);
  const [showRegForm, setShowRegForm] = useState(false);
  const [accountForm, setAccountForm] = useState({
    phoneNumberId: "",
    phoneNumber: "",
    accessToken: "",
    wabaId: "",
    displayName: ""
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch leads and accounts on mount
  useEffect(() => {
    if (!userId) return;

    const initData = async () => {
      setIsLoadingLeads(true);
      setIsLoadingAccounts(true);
      try {
        // Fetch accounts first
        const accs = await whatsappService.getAccounts(userId);
        setAccounts(accs);

        if (accs.length === 0) {
          setPanelTab("settings");
          setShowPanel(true);
          setShowRegForm(true);
          toast.info("Please register your WhatsApp API credentials first.");
        }

        // Fetch leads
        let data = await whatsappService.getWhatsAppLeads(userId);
        if (data.length === 0) {
          const res = await api.post("SalesLead/grid", {
            pageNumber: 1,
            pageSize: 50,
            orderBy: "id",
            orderDirection: "DESC"
          });
          if (res.data && res.data.results) {
            data = res.data.results.map((l: any) => ({
              leadId: l.leadId,
              customerName: l.customerName,
              phoneNumber: l.contactMobileNo || "",
              status: l.status
            }));
          }
        }
        setLeads(data);
      } catch (error: any) {
        console.error("Initialization failed:", error);
        if (error.response?.status === 400 && error.response?.data?.message?.includes("relation")) {
           toast.warning("Database tables missing. Please click 'Initialize DB' in settings.");
           setPanelTab("settings");
           setShowPanel(true);
        }
      } finally {
        setIsLoadingLeads(false);
        setIsLoadingAccounts(false);
      }
    };
    initData();
  }, [userId]);

  // Fetch conversation when lead is selected
  useEffect(() => {
    if (selectedLead && selectedLead.phoneNumber && userId) {
      const fetchHistory = async () => {
        try {
          const history = await whatsappService.getConversation(selectedLead.phoneNumber, userId);
          setMessages(history);
        } catch (error) {
          console.error("Failed to fetch history:", error);
          setMessages([]);
        }
      };
      fetchHistory();
    }
  }, [selectedLead, userId]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputText.trim() || !selectedLead || !userId) return;

    if (accounts.length === 0) {
      toast.error("No active WhatsApp account found. Please register one in Settings.");
      setPanelTab("settings");
      setShowPanel(true);
      return;
    }

    const newMsg: WhatsAppMessage = {
      id: Date.now(),
      messageText: inputText,
      senderId: "me",
      senderName: "Me",
      dateCreated: new Date().toISOString(),
      messageType: "out"
    };

    setMessages([...messages, newMsg]);
    const textToSend = inputText;
    setInputText("");
    setIsSending(true);

    try {
      await whatsappService.sendMessage(selectedLead.phoneNumber, textToSend, userId);
    } catch (error: any) {
      console.error("Failed to send message:", error);
      toast.error(error.response?.data?.message || "Failed to send WhatsApp message");
    } finally {
      setIsSending(false);
    }
  };

  const lookupCustomer = async () => {
    try {
      const res = await api.post("SalesLead/grid", {
        searchText: lookupName || lookupPhone,
        pageNumber: 1,
        pageSize: 1
      });

      if (res.data && res.data.results && res.data.results.length > 0) {
        const lead = res.data.results[0];
        const mappedLead: WhatsAppLead = {
          leadId: lead.leadId,
          customerName: lead.customerName,
          phoneNumber: lead.contactMobileNo || "",
          status: lead.status
        };
        setSelectedLead(mappedLead);
        setMobileView("chat");
        setLookupName(mappedLead.customerName);
        setLookupPhone(mappedLead.phoneNumber);
        toast.success("Customer found!");
      } else {
        toast.info("No customer found");
      }
    } catch (error) {
      console.error("Lookup failed:", error);
    }
  };

  const applyPrompt = (promptText: string) => {
    let msg = promptText;
    const name = selectedLead?.customerName || "Customer";
    msg = msg.replace("[NAME]", name)
             .replace("[DATE]", new Date().toLocaleDateString())
             .replace("[TIME]", new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))
             .replace("[ID]", selectedLead?.leadId || "N/A");
    setInputText(msg);
  };

  // Account Registration
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;

    try {
      await whatsappService.registerAccount({ ...accountForm, userId });
      toast.success("WhatsApp account registered successfully!");
      setShowRegForm(false);
      const accs = await whatsappService.getAccounts(userId);
      setAccounts(accs);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Registration failed");
    }
  };

  const handleInitDb = async () => {
    try {
      await whatsappService.initDb();
      toast.success("Database initialized successfully!");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Database initialization failed");
    }
  };

  const filteredLeads = leads.filter(l => 
    l.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.phoneNumber.includes(searchTerm)
  );

  const selectLead = (lead: WhatsAppLead) => {
    setSelectedLead(lead);
    if (window.innerWidth <= 768) {
      setMobileView("chat");
    }
  };

  const prompts = [
    { label: "📦 Order status update", text: "Hello [NAME], your order [ID] has been dispatched and will arrive by [DATE]. Tracking ID: [ID]. Thank you!" },
    { label: "⌛ Appointment reschedule", text: "Hello [NAME], your appointment has been rescheduled to [DATE] at [TIME]. Please let us know if this works." },
    { label: "📋 Send invoice / receipt", text: "Hi [NAME], please find your invoice #[ID] for your recent purchase attached. Thank you!" },
    { label: "✅ Payment confirmation", text: "We have received your payment successfully, [NAME]. Transaction ID: [ID]. Thank you!" },
    { label: "🛒 Product enquiry reply", text: "Thank you for your interest, [NAME]! The product you asked about is available. Would you like to place an order?" },
    { label: "🚧 Service escalation", text: "We apologize for the inconvenience, [NAME]. Your issue [ID] has been escalated and will be resolved within 24 hours." },
    { label: "🌟 Service Follow-up", text: "Hi [NAME], we hope your recent experience was satisfactory. We would love your feedback! Rate us: [LINK]" }
  ];

  return (
    <div className={`wa-app-outer ${selectedLead ? 'chat-selected' : ''} view-${mobileView}`}>
      <div className="wa-sidebar">
        <div className="wa-sidebar-header">
          <div className="wa-avatar av-me">{user?.username.charAt(0) || 'U'}</div>
          <div className="wa-sidebar-icons">
            <button className="wa-icon-btn" onClick={() => { setPanelTab("settings"); setShowPanel(true); }}><FiSettings /></button>
            <button className="wa-icon-btn"><FiMoreVertical /></button>
          </div>
        </div>
        <div className="wa-search-container">
          <div className="wa-search-input-wrapper">
            <FiSearch color="#667781" />
            <input 
              placeholder="Search leads..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="wa-chat-list scrollbar-thin">
          {isLoadingLeads ? (
            <div className="p-4 text-center text-gray-500 text-sm">Loading leads...</div>
          ) : filteredLeads.map((lead, idx) => (
            <div 
              key={lead.leadId} 
              className={`wa-chat-item ${selectedLead?.leadId === lead.leadId ? 'active' : ''}`}
              onClick={() => selectLead(lead)}
            >
              <div className={`wa-avatar av-${(idx % 4) + 1}`}>
                {lead.customerName.charAt(0)}
              </div>
              <div className="wa-chat-info">
                <div className="wa-chat-name">{lead.customerName}</div>
                <div className="wa-chat-preview">{lead.phoneNumber}</div>
              </div>
              <div className="wa-chat-meta">
                <div className="wa-chat-time">{lead.status}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="wa-main">
        {selectedLead ? (
          <>
            <div className="wa-chat-header">
              <button className="wa-back-btn" onClick={() => setMobileView("list")}>
                <FiChevronLeft />
              </button>
              <div className="wa-avatar av-1" style={{width: 38, height: 38, fontSize: 13}}>
                {selectedLead.customerName.charAt(0)}
              </div>
              <div className="flex-1 min-w-0" onClick={() => { setPanelTab("info"); setShowPanel(true); }} style={{cursor: 'pointer'}}>
                <div className="wa-chat-name truncate">{selectedLead.customerName}</div>
                <div className="wa-chat-status truncate">{selectedLead.phoneNumber} • Online</div>
              </div>
              <div className="wa-chat-header-right">
                <button><FiSearch /></button>
                <button onClick={() => { setPanelTab("info"); setShowPanel(!showPanel); }} className={(showPanel && panelTab === 'info') ? 'active' : ''}><FiUser /></button>
                <button onClick={() => { setPanelTab("settings"); setShowPanel(!showPanel); }} className={(showPanel && panelTab === 'settings') ? 'active' : ''}><FiSettings /></button>
              </div>
            </div>

            <div className="wa-messages-container scrollbar-thin">
              <div className="wa-date-label">History</div>
              {messages.length === 0 ? (
                <div className="text-center py-10 text-gray-400 text-sm">No messages yet with this customer</div>
              ) : messages.map((msg) => (
                <div key={msg.id} className={`wa-msg ${msg.messageType === 'in' ? 'wa-msg-in' : 'wa-msg-out'}`}>
                  {msg.messageText}
                  <div className="wa-msg-time">
                    {new Date(msg.dateCreated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    {msg.messageType === 'out' && <span className="wa-tick">✓✓</span>}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <div className="wa-input-area">
              <button className="wa-send-btn"><FiSmile /></button>
              <button className="wa-send-btn"><FiPaperclip /></button>
              <div className="wa-input-wrapper">
                <input 
                  placeholder="Type a message" 
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                />
              </div>
              <button 
                className={`wa-send-btn ${inputText.trim() ? 'active' : ''}`}
                onClick={handleSendMessage}
                disabled={isSending}
              >
                <FiSend />
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-10 bg-gray-50">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6">
              <img 
                src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" 
                alt="WhatsApp" 
                className="w-12 h-12 opacity-50"
              />
            </div>
            <h2 className="text-2xl font-light text-gray-600 mb-2">WhatsApp for Web</h2>
            <p className="max-w-xs text-gray-500 text-sm">
              Select a lead from the sidebar or lookup a customer to start messaging.
            </p>
            {accounts.length === 0 && (
              <button 
                className="wa-lookup-btn mt-6" 
                style={{maxWidth: 200}}
                onClick={() => { setPanelTab("settings"); setShowPanel(true); setShowRegForm(true); }}
              >
                Setup Meta API
              </button>
            )}
          </div>
        )}
      </div>

      <div className={`wa-right-panel ${showPanel ? 'show' : ''}`}>
        <div className="wa-panel-header">
           <button className="wa-panel-close lg:hidden" onClick={() => setShowPanel(false)}>
             <FiChevronLeft /> 
           </button>
           <div className="wa-tab-header">
              <button className={`wa-tab-btn ${panelTab === 'info' ? 'active' : ''}`} onClick={() => setPanelTab("info")}>Contact</button>
              <button className={`wa-tab-btn ${panelTab === 'settings' ? 'active' : ''}`} onClick={() => setPanelTab("settings")}>Settings</button>
           </div>
        </div>
        <div className="wa-panel-body scrollbar-thin">
          {panelTab === 'info' ? (
            <>
              <div className="wa-panel-section">
                <label>Customer Name</label>
                <input 
                  className="wa-panel-input" 
                  placeholder="e.g. Ravi Kumar" 
                  value={lookupName}
                  onChange={(e) => setLookupName(e.target.value)}
                />
              </div>
              <div className="wa-panel-section">
                <label>Phone Number</label>
                <input 
                  className="wa-panel-input" 
                  placeholder="+91 XXXXX XXXXX" 
                  value={lookupPhone}
                  onChange={(e) => setLookupPhone(e.target.value)}
                />
                <button className="wa-lookup-btn" onClick={lookupCustomer}>
                  <FiSearch style={{marginRight: 6}} /> Lookup Customer
                </button>
              </div>

              {selectedLead && (
                <div className="wa-customer-card">
                  <div className="c-name">{selectedLead.customerName}</div>
                  <div className="c-phone">{selectedLead.phoneNumber}</div>
                  <div style={{fontSize: 12, color: '#555', marginTop: 8}}>
                    Lead ID: {selectedLead.leadId}
                  </div>
                  <span className="wa-c-status">{selectedLead.status || 'Active'}</span>
                </div>
              )}

              <div className="wa-panel-section">
                <label>Quick Prompts</label>
                <div className="wa-prompt-section">
                  {prompts.map((p, idx) => (
                    <button key={idx} className="wa-prompt-chip" onClick={() => applyPrompt(p.text)}>
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
              <button 
                className="wa-send-panel-btn" 
                onClick={handleSendMessage}
                disabled={!selectedLead || !inputText.trim()}
              >
                <FiSend style={{marginRight: 8}} /> Send Message
              </button>
            </>
          ) : (
            <div className="wa-settings-view">
              <div className="wa-panel-section">
                <label>Registered Accounts</label>
                {accounts.length === 0 ? (
                  <p className="text-sm text-gray-500 mb-2">No accounts registered yet.</p>
                ) : (
                  <div className="wa-acc-list">
                    {accounts.map(acc => (
                      <div key={acc.id} className="wa-acc-item">
                        <div className="wa-acc-name">{acc.displayName || acc.phoneNumber}</div>
                        <div className="wa-acc-id text-xs text-gray-400">ID: {acc.phoneNumberId}</div>
                      </div>
                    ))}
                  </div>
                )}
                {!showRegForm && (
                  <button className="wa-lookup-btn" onClick={() => setShowRegForm(true)}>
                    <FiPlus style={{marginRight: 6}} /> Add Meta Account
                  </button>
                )}
              </div>

              {showRegForm && (
                <form onSubmit={handleRegister} className="wa-reg-form">
                  <div className="wa-panel-section">
                    <label>Display Name</label>
                    <input 
                      required
                      className="wa-panel-input"
                      value={accountForm.displayName}
                      onChange={e => setAccountForm({...accountForm, displayName: e.target.value})}
                      placeholder="My Business Number"
                    />
                  </div>
                  <div className="wa-panel-section">
                    <label>WhatsApp Number</label>
                    <input 
                      required
                      className="wa-panel-input"
                      value={accountForm.phoneNumber}
                      onChange={e => setAccountForm({...accountForm, phoneNumber: e.target.value})}
                      placeholder="+91..."
                    />
                  </div>
                  <div className="wa-panel-section">
                    <label>Meta Phone Number ID</label>
                    <input 
                      required
                      className="wa-panel-input"
                      value={accountForm.phoneNumberId}
                      onChange={e => setAccountForm({...accountForm, phoneNumberId: e.target.value})}
                      placeholder="1029384756..."
                    />
                  </div>
                  <div className="wa-panel-section">
                    <label>WABA ID</label>
                    <input 
                      required
                      className="wa-panel-input"
                      value={accountForm.wabaId}
                      onChange={e => setAccountForm({...accountForm, wabaId: e.target.value})}
                      placeholder="WhatsApp Business Account ID"
                    />
                  </div>
                  <div className="wa-panel-section">
                    <label>Graph API Access Token</label>
                    <textarea 
                      required
                      className="wa-panel-input"
                      style={{height: 100, resize: 'none'}}
                      value={accountForm.accessToken}
                      onChange={e => setAccountForm({...accountForm, accessToken: e.target.value})}
                      placeholder="EAAG...."
                    />
                  </div>
                  <div className="flex gap-2">
                    <button type="submit" className="wa-send-panel-btn flex-1">Save Account</button>
                    <button type="button" className="wa-lookup-btn" onClick={() => setShowRegForm(false)}>Cancel</button>
                  </div>
                </form>
              )}

              <div className="wa-panel-section mt-10 p-4 bg-gray-50 rounded-lg">
                <label className="text-red-500!"><FiDatabase style={{marginRight: 6}} /> System Maintenance</label>
                <p className="text-xs text-gray-500 mb-4">Ensures all required database tables are created correctly.</p>
                <button className="wa-lookup-btn border-red-200! text-red-500!" onClick={handleInitDb}>
                   Initialize Database
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WhatsAppModule;
