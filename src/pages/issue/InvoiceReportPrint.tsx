import React from "react";

interface InvoiceReportPrintProps {
  data: any; // Using any to handle the Issue object from IssueManagement
  id: string | number;
}

const InvoiceReportPrint: React.FC<InvoiceReportPrintProps> = ({ data, id }) => {
  if (!data) return null;

  const iss = data.issue || data;
  const dateStr = iss.billDate 
    ? new Date(iss.billDate).toLocaleDateString("en-GB") 
    : (iss.issueDate ? new Date(iss.issueDate).toLocaleDateString("en-GB") : "");

  // Grid Template: Sno(52) | Desc(1fr) | HSN(100) | Qty(70) | Amt(110)
  const gridTemplate = "52px 1fr 100px 70px 110px";

  return (
    <div id={`invoice-report-area-${id}`} style={{ backgroundColor: '#888', padding: '10px 0', minHeight: '100vh', display: 'flex', justifyContent: 'center' }}>
      <style>{`
        @media print {
          @page { size: A4; margin: 10mm 5mm; }
          body { background: white !important; padding: 0 !important; margin: 0 !important; }
          .sheet { box-shadow: none !important; margin: 0 !important; padding: 0 !important; width: 100% !important; border: none !important; }
          #invoice-report-area-${id} { background: white !important; padding: 0 !important; display: block !important; }
          .no-print { display: none !important; }
        }
        .grid-row { display: grid; grid-template-columns: ${gridTemplate}; border-bottom: 1px solid #000; }
        .grid-cell { padding: 8px 10px; border-right: 1px solid #000; font-size: 11.5px; }
        .grid-cell:last-child { border-right: none; }
      `}</style>
      
      <div className="sheet" style={{
        width: '750px',
        background: '#fff',
        boxShadow: '0 4px 24px rgba(0,0,0,.4)',
        padding: '0',
        margin: '0',
        fontFamily: 'Arial, sans-serif',
        fontSize: '12px',
        color: '#000'
      }}>
        {/* COMPANY HEADER */}
        <div style={{ textAlign: 'center', padding: '20px 20px 10px' }}>
          <div style={{ fontSize: '18px', fontWeight: '900', letterSpacing: '.5px', textTransform: 'uppercase', marginBottom: '6px' }}>
            JBS Mediitec India Private Limited
          </div>
          <div style={{ fontSize: '11px', lineHeight: '1.6', color: '#000' }}>
            Sri Ragavendra Tower, 3rd Floor, Site No-34 Co-Operative EColony,<br/>
            Vilankurichi, Coimbatore - 641035. Tamil Nadu.<br/>
            Phone - 0422-2665030, 2665031, 9443367915.<br/>
            Email: info@jbsmediitec.com.
          </div>
        </div>

        {/* INVOICE HEADING */}
        <div style={{ textAlign: 'center', fontSize: '14px', fontWeight: '700', letterSpacing: '2px', padding: '10px 0', textDecoration: 'underline', textUnderlineOffset: '4px' }}>
          INVOICE
        </div>

        {/* MAIN BORDERED SECTION */}
        <div style={{ border: '1px solid #000', borderBottom: 'none', margin: '0 14px' }}>
          {/* BILL TO + INV NO + DATE + BANK */}
          <div style={{ display: 'flex', borderBottom: '1px solid #000' }}>
            {/* Left: Billed To */}
            <div style={{ flex: 1, padding: '12px', borderRight: '1px solid #000', fontSize: '12px', lineHeight: '1.6' }}>
              <div style={{ fontWeight: '700', fontSize: '13px', marginBottom: '4px' }}>{iss.customerName}</div>
              <div style={{ whiteSpace: 'pre-wrap', maxWidth: '350px' }}>{iss.bookingAddress}</div>
              <div style={{ marginTop: '8px', fontSize: '11.5px' }}><strong>GSTIN NO:</strong> {iss.gstin || 'GST NO:'}</div>
            </div>

            {/* Right: Invoice No / Date / Bank */}
            <div style={{ width: '300px', display: 'flex', flexDirection: 'column', fontSize: '12px' }}>
              <div style={{ display: 'flex', borderBottom: '1px solid #000', padding: '8px 12px', gap: '8px' }}>
                <span style={{ fontSize: '12px', whiteSpace: 'nowrap' }}>Invoice No.</span>
                <span style={{ fontWeight: '700', fontSize: '12px' }}>{iss.billNo || iss.docId}</span>
              </div>
              <div style={{ display: 'flex', borderBottom: '1px solid #000', padding: '8px 12px', gap: '8px' }}>
                <span style={{ fontSize: '12px' }}>Date:</span>
                <span style={{ fontWeight: '700', fontSize: '12px' }}>{dateStr}</span>
              </div>
              <div style={{ padding: '8px 12px', fontSize: '11px', lineHeight: '1.6' }}>
                <div style={{ fontWeight: '700', fontSize: '11.5px', marginBottom: '4px' }}>Our Bank details for NEFT/RTGS</div>
                <div style={{ display: 'flex' }}><span style={{ width: '60px', fontWeight: '600' }}>Name</span><span>: M/s. JBS mediitec India (P) Ltd.,</span></div>
                <div style={{ display: 'flex' }}><span style={{ width: '60px', fontWeight: '600' }}>Banker</span><span>: Bank of India</span></div>
                <div style={{ display: 'flex' }}><span style={{ width: '60px', fontWeight: '600' }}>Branch</span><span>: Coimbatore Main Branch</span></div>
                <div style={{ display: 'flex' }}><span style={{ width: '60px', fontWeight: '600' }}>A/c No</span><span>: 820030110000018</span></div>
                <div style={{ display: 'flex' }}><span style={{ width: '60px', fontWeight: '600' }}>IFSC Code</span><span>: BKID0008200</span></div>
              </div>
            </div>
          </div>

          {/* TABLE COLUMN HEADERS */}
          <div className="grid-row" style={{ background: '#f5f5f5', fontWeight: '700' }}>
            <div className="grid-cell" style={{ textAlign: 'center' }}>S.No.</div>
            <div className="grid-cell">Description of Material</div>
            <div className="grid-cell" style={{ textAlign: 'center' }}>HSN Code</div>
            <div className="grid-cell" style={{ textAlign: 'center' }}>Qty</div>
            <div className="grid-cell" style={{ textAlign: 'right' }}>Amount</div>
          </div>

          {/* TABLE BODY */}
          <div style={{ minHeight: '320px' }}>
            <div className="grid-row">
              <div className="grid-cell" style={{ textAlign: 'center' }}>1</div>
              <div className="grid-cell">
                <div style={{ fontWeight: '700' }}>{iss.billingDescription || 'FREIGHT CHARGES'}</div>
                <div style={{ fontSize: '10.5px', color: '#444', marginTop: '2px' }}>
                  {iss.narration ? `(${iss.narration})` : ''}
                </div>
              </div>
              <div className="grid-cell" style={{ textAlign: 'center' }}>{iss.hsn || '9965'}</div>
              <div className="grid-cell" style={{ textAlign: 'center' }}>{iss.totalQty || 1}</div>
              <div className="grid-cell" style={{ textAlign: 'right', fontWeight: '700' }}>
                {Number(iss.billingAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
            </div>
            
            {/* Filler Rows to maintain box height */}
            {[...Array(7)].map((_, i) => (
              <div key={i} className="grid-row" style={{ height: '32px', borderBottom: i === 6 ? 'none' : '1px solid #f0f0f0' }}>
                <div className="grid-cell">&nbsp;</div>
                <div className="grid-cell">&nbsp;</div>
                <div className="grid-cell">&nbsp;</div>
                <div className="grid-cell">&nbsp;</div>
                <div className="grid-cell">&nbsp;</div>
              </div>
            ))}
          </div>

          {/* TOTAL ROW */}
          <div style={{ display: 'grid', gridTemplateColumns: "1fr 70px 110px", borderTop: '2px solid #000', borderBottom: '1px solid #000' }}>
            <div style={{ padding: '12px', fontSize: '12px', borderRight: '1px solid #000' }}>
              <strong>Rupees In Words :</strong> <span style={{ fontWeight: '400', textTransform: 'capitalize' }}>{iss.amountInWords || ''}</span>
            </div>
            <div style={{ padding: '12px 0', fontWeight: '900', fontSize: '12px', textAlign: 'center', borderRight: '1px solid #000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>TOTAL</div>
            <div style={{ padding: '12px', fontWeight: '900', fontSize: '14px', textAlign: 'right', background: '#f9f9f9' }}>
              {Number(iss.billingAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
          </div>
        </div>

        {/* NOTES */}
        <div style={{ padding: '12px 14px', border: '1px solid #000', borderTop: 'none', margin: '0 14px', fontSize: '11px', lineHeight: '1.7' }}>
          <div style={{ fontWeight: '700', fontSize: '12px', textDecoration: 'underline', marginBottom: '6px' }}>Note :</div>
          <div>1. Interest @ 18% per annum will be charged on bill if it not paid within 30 days.</div>
          <div>2. Subject to Coimbatore Jurisdiction.</div>
          <div>3. Payment should be given by Cheque/DD In Favour of JBS Mediitec India (P) Ltd.,</div>
        </div>

        {/* FOOTER: QR + Signature */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', padding: '14px 20px 24px', margin: '0 14px', border: '1px solid #000', borderTop: 'none' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '8px' }}>
            <svg width="86" height="86" viewBox="0 0 82 82" style={{ border: '1px solid #eee', padding: '4px' }}>
              <rect width="82" height="82" fill="white"/>
              <rect x="4" y="4" width="22" height="22" fill="black"/><rect x="7" y="7" width="16" height="16" fill="white"/><rect x="10" y="10" width="10" height="10" fill="black"/>
              <rect x="56" y="4" width="22" height="22" fill="black"/><rect x="59" y="7" width="16" height="16" fill="white"/><rect x="62" y="10" width="10" height="10" fill="black"/>
              <rect x="4" y="56" width="22" height="22" fill="black"/><rect x="7" y="59" width="16" height="16" fill="white"/><rect x="10" y="10" width="10" height="10" fill="black"/>
              <rect x="30" y="4" width="4" height="4" fill="black"/><rect x="36" y="4" width="4" height="4" fill="black"/>
              <rect x="30" y="30" width="4" height="4" fill="black"/><rect x="42" y="30" width="4" height="4" fill="black"/>
              <rect x="54" y="42" width="4" height="4" fill="black"/><rect x="62" y="42" width="4" height="4" fill="black"/>
              <rect x="30" y="74" width="4" height="4" fill="black"/><rect x="42" y="74" width="4" height="4" fill="black"/>
            </svg>
            <div style={{ fontSize: '9px', fontWeight: 'bold', color: '#000' }}>boim-820067810018@boi</div>
          </div>
          <div style={{ textAlign: 'right', fontSize: '11.5px' }}>
            <div style={{ fontWeight: '700', fontSize: '12.5px', marginBottom: '45px' }}>For &nbsp;JBS Mediitec India (P) Ltd.,</div>
            <div style={{ fontWeight: '700', fontSize: '11.5px', borderTop: '0px solid #000', display: 'inline-block', paddingTop: '4px' }}>Authorised Signatory</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceReportPrint;
