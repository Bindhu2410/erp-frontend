import React from "react";

interface PurchaseOrderPrintProps {
  data: any;
}

const PurchaseOrderPrint: React.FC<PurchaseOrderPrintProps> = ({ data }) => {
  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB");
  };

  // Handle different data structures - from PO view vs Quotation view
  const purchaseOrder = data?.purchaseOrder || data;
  const quotationInfo = data?.quotationInfo || data?.quotation;
  const leadAddress = data?.leadAddress;
  const items = data?.items || [];

  // Safely access nested properties
  const poId = purchaseOrder?.poId || "";
  const dateCreated = purchaseOrder?.dateCreated || purchaseOrder?.dateUpdated || new Date().toISOString();
  const customerName = quotationInfo?.customer_name || quotationInfo?.customerName || "";
  const gstNo = quotationInfo?.gst_no || quotationInfo?.gstNo || "";
  const deliveryWithin = quotationInfo?.deliveryWithin || "WITH 15 DAYS";

  // Flatten BOM childItems into a single list for display
  const flatItems: any[] = React.useMemo(() => {
    const bomItems: any[] = items || [];
    const out: any[] = [];
    bomItems.forEach((bom: any) => {
      const children: any[] = bom.childItems || bom.bomChildItems || [];
      children.forEach((child: any) => {
        out.push({
          itemName: child.itemName || "",
          itemCode: child.catNo || child.itemCode || "",
          qty: Number(child.quantity ?? 1),
          unitPrice: Number(child.quoteRate ?? child.saleRate ?? child.unitPrice ?? 0),
          taxPercentage: Number(child.tax ?? child.taxPercentage ?? 0),
          hsn: child.hsn || "",
          uom: child.uomName || child.uom || "",
        });
      });
    });
    return out;
  }, [items]);

  const calculateItemTotal = (item: any) => {
    const subtotal = item.qty * item.unitPrice;
    const taxAmount = (subtotal * (item.taxPercentage || 0)) / 100;
    return subtotal + taxAmount;
  };

  const calculateGrandTotal = () => {
    return flatItems.reduce((sum, item) => sum + calculateItemTotal(item), 0);
  };

  return (
    <div className="po-container">
      <style>{`
        @page {
          margin: 0mm;
        }

        *, *::before, *::after { 
          margin:0; 
          padding:0; 
          box-sizing:border-box; 
          -webkit-print-color-adjust: exact; 
          print-color-adjust: exact; 
        }

        .po-main-wrapper {
          width: 794px;
          margin: 0 auto;
          background: #fff;
          font-family: "Times New Roman", Times, serif;
          position: relative;
        }

        /* Fixed positions ONLY for print repetition */
        @media print {
          .page-header {
             position: fixed !important;
             top: 0;
             width: 794px;
             background: #fff;
             z-index: 1000;
          }

          .page-footer {
            position: fixed !important;
            bottom: 0px;
            width: 794px;
            background: #fff;
            z-index: 1000;
          }
          
          .po-main-table thead .spacer-cell {
            height: 145px; /* Height of header content */
          }

          .po-main-table tfoot .spacer-cell {
             height: 160px; /* Height of footer content */
          }
        }

        /* Natural flow for Modal/Web view (Screen) */
        @media screen {
          .page-header, .page-footer {
            position: static !important;
            width: 100% !important;
          }
          .po-main-table thead .spacer-cell,
          .po-main-table tfoot .spacer-cell {
            height: 0 !important;
            display: none !important;
          }
        }
        
        .po-main-table thead {
           display: table-header-group;
        }

        .po-main-table tfoot {
           display: table-footer-group;
        }

        .top-banner {
          background: #E40309 !important;
          color: #ffffff !important;
          font-size: 12px;
          font-weight: bold;
          letter-spacing: 0.3px;
          padding: 7px 10px;
          display: flex !important;
          align-items: center;
          justify-content: center;
          gap: 0;
          white-space: nowrap;
        }
        .top-banner .item { padding: 0 8px; }
        .top-banner .sep  { color: rgba(255,255,255,0.65); font-size:14px; font-weight:400; }

        .po-report-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          padding: 11px 18px 10px 16px;
          border-bottom: 1.5px solid #aaa;
          gap: 10px;
        }

        .h-left { display:flex; flex-direction:column; gap:6px; min-width:255px; }
        .brand-list { font-size:10px; color:#111; line-height:1.85; list-style: none; }
        .brand-list li { list-style:disc; margin-left:15px; }
        .brand-list li strong { font-weight:bold; }

        .exa-wrap { display:flex; align-items:center; gap:4px; margin-top:1px; }
        .exa-dot  { color:#888; font-size:14px; margin-right:2px; }
        .exa-badge {
          display: inline-flex;
          align-items: stretch;
          border: 2px solid #E40309;
          border-radius: 3px;
          overflow: hidden;
          font-family: Arial, "Helvetica Neue", sans-serif;
          font-weight: 900;
          font-size: 13.5px;
          line-height: 1;
        }
        .exa-e { color:#E40309; padding:3px 2px 3px 6px; background:#fff; }
        .exa-x { color:#0055CC; padding:3px 0;           background:#fff; font-weight:900; }
        .exa-a { color:#E40309; padding:3px 5px 3px 1px; background:#fff; }
        .exa-dark {
          background: #3a3a3a;
          color: #fff;
          font-size: 8.5px;
          font-weight: bold;
          padding: 3px 4px;
          display: flex;
          align-items: center;
          letter-spacing: 0.4px;
        }
        .exa-slash { background:#3a3a3a; color:#ccc; font-size:10px; padding:3px 1px; display:flex; align-items:center; }

        .h-right { text-align:right; }
        .logo-row {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 5px;
          margin-bottom: 4px;
        }
        .jbs-j { font-size: 34px; font-weight: 900; font-style: italic; color: #0D8202; line-height: 1; letter-spacing: -1px; }
        .jbs-b { font-size: 34px; font-weight: 900; font-style: italic; color: #0D8202; line-height: 1; letter-spacing: -2px; }
        .jbs-s { font-size: 34px; font-weight: 900; font-style: italic; color: #B2171D; line-height: 1; }
        .company-name { font-size: 15px; font-weight: bold; color: #0D8202; letter-spacing: 0.1px; line-height: 1; }
        .company-sub { font-size: 9.5px; color: #333; line-height: 1.75; text-align: right; margin-top: 3px; }

        .title-row { display: flex; align-items: baseline; padding: 12px 20px 3px; }
        .title-spacer { flex:1; }
        .po-title { flex: 2; text-align: center; font-size: 16px; font-weight: bold; text-decoration: underline; }
        .po-date { flex: 1; text-align: right; font-size: 11.5px; font-weight: bold; }

        .to-block { padding: 8px 20px 4px; font-size: 11.5px; color: #111; line-height: 2; }
        .to-row { display:flex; align-items:baseline; }
        .to-label { font-weight:bold; min-width:92px; }
        .to-colon { font-weight:bold; margin-right:10px; }
        .to-val   { font-weight:bold; }
        .addr-ind { padding-left:102px; font-weight:bold; }
        .sub-row { display:flex; align-items:baseline; gap:5px; font-size:11.5px; margin-top:1px; }
        .sub-ref { color:#E40309; font-weight:bold; }

        .rel-head { padding: 6px 20px 9px; font-size: 12.5px; font-weight: bold; }

        .tbl-wrap { padding: 0 20px; }
        table.items-tbl { width:100%; border-collapse:collapse; font-size:11.5px; color:#111; }
        table.items-tbl thead tr { border-top: 2px solid #111; border-bottom: 2px solid #111; }
        table.items-tbl thead th { padding:7px 8px; font-weight:bold; text-align:left; }
        table.items-tbl thead th.r { text-align:right; }
        table.items-tbl tbody tr   { 
          border-bottom:1px solid #ccc;
          page-break-inside: avoid;
          break-inside: avoid;
        }
        table.items-tbl tbody td   { padding:8px 8px; vertical-align: top; }
        table.items-tbl tbody td.r { text-align:right; }
        table.items-tbl tbody td.c { text-align:center; }
        table.items-tbl tfoot td { padding:7px 8px; border-top:2px solid #111; border-bottom: none; font-weight:bold; font-size:12px; }
        table.items-tbl tfoot td.r { text-align:right; }

        .summary-block { padding: 15px 0; }

        .del-wrap  { padding:0 20px; }
        .del-inner { border-top: 2px solid #111; padding: 8px 0 7px; font-size:11.5px; color:#111; line-height:1.85; }
        .del-head { font-weight:bold; text-decoration:underline; margin-bottom:4px; font-size:12px; }
        .del-note { font-weight:bold; margin-top:6px; font-size:12px; }

        .signoff { padding:10px 20px 5px; font-size:11.5px; color:#111; line-height:1.9; }
        .signoff .b { font-weight:bold; }

        .foot-addr { text-align:center; font-size:9.5px; color:#444; padding:5px 20px 5px; border-top:1.5px solid #aaa; line-height:1.7; }

        .bot-banner {
          background: #6E6568 !important;
          color: #ffffff !important;
          font-size: 12px;
          font-weight: bold;
          letter-spacing: 0.3px;
          padding: 7px 10px;
          display: flex !important;
          align-items: center;
          justify-content: center;
          gap: 0;
          white-space: nowrap;
          width: 100%;
        }
        .bot-banner .item { padding:0 8px; }
        .bot-banner .sep  { color:rgba(255,255,255,0.55); font-size:14px; font-weight:400; }

        @media print {
          body { background:#fff; padding:0; }
          .po-main-wrapper { width:100%; }
          .no-print { display: none !important; }
        }
      `}</style>

      <div className="po-main-wrapper">
        {/* Actual fixed Header for print repetition */}
        <header className="page-header">
           <div className="top-banner">
              <span className="item">Laparoscope</span>
              <span className="sep">▪</span>
              <span className="item">Colposcope</span>
              <span className="sep">▪</span>
              <span className="item">Hysteroscope</span>
              <span className="sep">▪</span>
              <span className="item">Fetal Monitor</span>
              <span className="sep">▪</span>
              <span className="item">Fluid Management System</span>
           </div>

           <div className="po-report-header">
              <div className="h-left">
                 <ul className="brand-list">
                    <li><strong>ALAN-</strong> Diathermy, Vessel Sealing System, APC, Salin-TURP</li>
                    <li><strong>HOSPIINZ-</strong> Laparoscopy Equipments &amp; Instruments, VET,<br />
                       &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Morcellator, Fluid Management System</li>
                 </ul>
                 <div className="exa-wrap">
                    <span className="exa-dot">·</span>
                    <span className="exa-badge">
                       <span className="exa-e">e</span>
                       <span className="exa-x">X</span>
                       <span className="exa-a">a</span>
                       <span className="exa-dark">4K</span>
                       <span className="exa-slash">/</span>
                       <span className="exa-dark" style={{ paddingLeft: '1px' }}>HD</span>
                    </span>
                 </div>
              </div>

              <div className="h-right">
                 <div className="logo-row">
                    <span className="jbs-j">J</span>
                    <span className="jbs-b">B</span>
                    <span className="jbs-s">S</span>
                    <span className="company-name">mediitec India Private Limited.,</span>
                 </div>
                 <div className="company-sub">
                    PAN : AABCJ6645C<br />
                    CIN : U33112TZ2006PTC012703<br />
                    GST : 33AABCJ6645C1ZW
                 </div>
              </div>
           </div>
        </header>

        <table className="po-main-table">
          <thead>
            <tr>
              <td className="spacer-cell"></td>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                {/* PO TITLE & DATE */}
                <div className="title-row">
                  <div className="title-spacer"></div>
                  <div className="po-title">Purchase order</div>
                  <div className="po-date">Date:&nbsp;&nbsp;{formatDate(dateCreated)}</div>
                </div>

                {/* TO / PARTY */}
                <div className="to-block">
                  <div style={{ fontWeight: 'bold', marginBottom: '1px' }}>To</div>
                  <div className="to-row">
                    <span className="to-label">Party Name</span>
                    <span className="to-colon">&nbsp;:</span>
                    <span className="to-val">{customerName}</span>
                  </div>
                  <div className="to-row">
                    <span className="to-label">Address</span>
                    <span className="to-colon">&nbsp;:</span>
                    <span className="to-val">
                       {leadAddress ? (
                         `${leadAddress.door_no || ''} ${leadAddress.street || ''}`.trim()
                       ) : (
                         quotationInfo?.address || ''
                       )}
                    </span>
                  </div>
                  <div className="addr-ind">
                    {leadAddress ? (
                      `${leadAddress.area || ''} ${leadAddress.city || ''} ${leadAddress.state || ''} ${leadAddress.pincode || ''}`.trim()
                    ) : ''}
                  </div>
                  <div className="to-row">
                    <span className="to-label">GST NO</span>
                    <span className="to-colon">&nbsp;:</span>
                    <span className="to-val">{gstNo}</span>
                  </div>

                  <div style={{ fontSize: '11.5px', marginTop: '8px' }}>Dear Sir,</div>

                  <div className="sub-row">
                    <strong>Sub :</strong>
                    <span>Purchase Order</span>
                    <span className="sub-ref">{poId} /</span>
                    <span>{formatDate(dateCreated)}</span>
                  </div>
                </div>

                {/* RELEASE HEADING */}
                <div className="rel-head">We are releasing Purchase order for the following</div>

                {/* ITEMS TABLE */}
                <div className="tbl-wrap">
                  <table className="items-tbl">
                    <thead>
                      <tr>
                        <th style={{ width: '7%' }}>SL No.</th>
                        <th>Item Id</th>
                        <th className="r" style={{ width: '9%' }}>Qty</th>
                        <th className="r" style={{ width: '14%' }}>Tax (%)</th>
                        <th className="r" style={{ width: '13%' }}>Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {flatItems.map((item: any, index: number) => (
                        <tr key={index}>
                          <td className="c">{index + 1}</td>
                          <td>{item.itemName}</td>
                          <td className="r">{(item.qty ?? 0).toFixed(2)}</td>
                          <td className="r">{item.taxPercentage != null ? `${item.taxPercentage}%` : ''}</td>
                          <td className="r">{calculateItemTotal(item).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td colSpan={3}></td>
                        <td className="r">Total</td>
                        <td className="r">{calculateGrandTotal().toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                {/* SUMMARY & DELIVERY (at the end of content) */}
                <div className="summary-block">
                  <div className="del-wrap">
                    <div className="del-inner">
                      <div className="del-head">Delivery address:</div>
                      "JBS Mediitec India Private Ltd"<br />
                      Sri Ragavendra Tower, 3rd Floor, No-34, Co-operative E-colony,<br />
                      Behind Kumudham Nagar, Villankurichi Road, Coimbatore – 641035<br />
                      Ph: 9443367915, 9443366752<br />
                      GST NO: 33AABCJ6645C1ZW
                      <div className="del-note">DELIVERY : {deliveryWithin}</div>
                    </div>
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
          <tfoot>
             <tr>
               <td className="spacer-cell"></td>
             </tr>
          </tfoot>
        </table>

        {/* Actual fixed Footer for print repetition */}
        <footer className="page-footer">
           <div className="signoff">
              Thanking you,<br />
              <span className="b">For JBS Mediitec India (P) Ltd</span>
              <div style={{ marginTop: '12px' }} className="b">Sasikala .D</div>
           </div>

           <div className="foot-addr">
              Sri Ragavendra Tower, 3rd Floor, No-34, Co-operative E-colony, Villankurichi Road, Coimbatore - 641035<br />
              Ph: 0422- 2665030, 0422-2665031 &nbsp;&nbsp; E-mail : info@jbsmeditec.com
           </div>

           <div className="bot-banner">
              <span className="item">Diathermy</span>
              <span className="sep">▪</span>
              <span className="item">VesselSealingSystem</span>
              <span className="sep">▪</span>
              <span className="item">ArgonPlasmaCoagulator(APC)</span>
              <span className="sep">▪</span>
              <span className="item">Saline-TUR</span>
           </div>
        </footer>
      </div>
    </div>
  );
};

export default PurchaseOrderPrint;
