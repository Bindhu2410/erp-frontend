import React from "react";
import toWhomSoEverData from "../../components/json/toWhomSoEver.json";

interface ToWhomSoEverProps {
  data?: any;
}

const ToWhomSoEverPrint: React.FC<ToWhomSoEverProps> = ({ data: propData }) => {
  const data = propData || toWhomSoEverData;

  return (
    <div>
      <style>{`
        .twse-page {
          width: 794px;
          margin: 10px auto;
          background: #fff;
          box-shadow: 0 2px 14px rgba(0,0,0,0.15);
          min-height: 1050px;
          display: flex;
          flex-direction: column;
          font-family: "Times New Roman", Times, serif;
          font-size: 13px;
          color: #000;
        }
        .twse-top-banner {
          background: #e8400a;
          color: #fff;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 6px 10px;
          font-size: 12px;
          font-weight: bold;
          font-family: Arial, sans-serif;
        }
        .twse-top-banner .tbitem { padding: 0 10px; }
        .twse-top-banner .tbsep { color: rgba(255,255,255,0.7); font-size: 10px; }
        .twse-header-row {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          padding: 6px 14px 4px;
          border-bottom: 1px solid #999;
        }
        .twse-brands {
          font-size: 10px;
          color: #111;
          line-height: 1.7;
          font-family: Arial, sans-serif;
        }
        .twse-brands span { display: block; }
        .twse-logo-area {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .twse-logo-letters {
          display: flex;
          align-items: baseline;
          font-family: "Times New Roman", Times, serif;
        }
        .twse-logo-j { font-size: 52px; font-weight: bold; color: #111; line-height: 1; }
        .twse-logo-b { font-size: 52px; font-weight: bold; color: #111; line-height: 1; }
        .twse-logo-s-wrap { position: relative; display: inline-flex; flex-direction: column; align-items: center; }
        .twse-logo-s { font-size: 52px; font-weight: bold; color: #1a7a1a; line-height: 1; }
        .twse-logo-curve { width: 36px; height: 10px; margin-top: -4px; }
        .twse-logo-text {
          font-family: Arial, sans-serif;
          font-size: 19px;
          font-weight: bold;
          color: #111;
          white-space: nowrap;
          line-height: 1.1;
        }
        .twse-gstin-row {
          padding: 5px 14px 0;
          font-size: 12px;
          font-weight: bold;
          font-family: Arial, sans-serif;
        }
        .twse-date-row {
          text-align: right;
          padding: 18px 22px 0;
          font-size: 13px;
        }
        .twse-body { padding: 6px 30px 10px; flex: 1; }
        .twse-title {
          text-align: center;
          font-size: 13.5px;
          font-weight: bold;
          text-decoration: underline;
          margin: 14px 0 8px;
          letter-spacing: 0.3px;
        }
        .twse-intro { font-size: 13px; margin-bottom: 14px; }
        .twse-form-row {
          display: flex;
          align-items: flex-start;
          margin-bottom: 6px;
          font-size: 13px;
          line-height: 1.6;
        }
        .twse-form-label { width: 120px; flex-shrink: 0; color: #111; }
        .twse-form-colon { width: 16px; flex-shrink: 0; text-align: center; }
        .twse-form-value { flex: 1; font-weight: bold; white-space: pre-line; color: #111; }
        .twse-gstin-inline { font-weight: bold; font-size: 13px; margin-left: 40px; white-space: nowrap; }
        .twse-remarks { font-size: 13px; line-height: 1.7; margin: 10px 0 6px 0; white-space: pre-line; }
        .twse-sign { margin-top: 18px; font-size: 13px; line-height: 1.9; }
        .twse-sign .co { font-weight: bold; }
        .twse-footer {
          border-top: 1px solid #888;
          text-align: center;
          font-size: 10.5px;
          font-weight: bold;
          color: #111;
          padding: 6px 14px;
          white-space: pre-line;
          line-height: 1.6;
          font-family: Arial, sans-serif;
        }
        .twse-bottom-banner {
          background: #222;
          color: #fff;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 6px 10px;
          font-size: 12px;
          font-weight: bold;
          font-family: Arial, sans-serif;
        }
        .twse-bottom-banner .bbitem { padding: 0 10px; }
        .twse-bottom-banner .bbsep { color: rgba(255,255,255,0.5); font-size: 10px; }
        @media print {
          .twse-page { box-shadow: none !important; margin: 0 !important; width: 100% !important; }
        }
      `}</style>

      <div className="twse-page">

        <div className="twse-top-banner">
          <span className="tbitem">Laparoscope</span>
          <span className="tbsep">&#9632;</span>
          <span className="tbitem">Colposcope</span>
          <span className="tbsep">&#9632;</span>
          <span className="tbitem">Hysteroscope</span>
          <span className="tbsep">&#9632;</span>
          <span className="tbitem">Fetal Monitor</span>
          <span className="tbsep">&#9632;</span>
          <span className="tbitem">S. I. PUMP</span>
        </div>

        <div className="twse-header-row">
          <div className="twse-brands">
            <span><b>proMIS</b>  -  Laparoscope, Colposcope, Hysteroscope</span>
            <span><b>ALAN</b>  -  Diathermy, Alligature, APC, Saline-TUR</span>
            <span><b>HOSPIINZ</b>  -  Laparoscope Instruments, VET, S.I.Pump</span>
            <span><b>RICHARD WOLF</b>  -  Germany - Urology</span>
          </div>
          <div className="twse-logo-area">
            <div className="twse-logo-letters">
              <span className="twse-logo-j">J</span>
              <span className="twse-logo-b">B</span>
              <div className="twse-logo-s-wrap">
                <span className="twse-logo-s">S</span>
                <svg className="twse-logo-curve" viewBox="0 0 36 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M2 2 Q18 14 34 2" stroke="#1a7a1a" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                </svg>
              </div>
            </div>
            <div className="twse-logo-text">mediitec India (P) Ltd.,</div>
          </div>
        </div>

        <div className="twse-gstin-row">GSTIN NO :{data.companyGSTIN}</div>
        <div className="twse-date-row">Date :&nbsp;&nbsp;{data.date}</div>

        <div className="twse-body">
          <div className="twse-title">TO WHOMSOEVER IT MAY CONCERN</div>
          <div className="twse-intro">
            This is to certify that we are sending <b>Medical Equipments/Instruments</b>vide our
          </div>

          <div className="twse-form-row">
            <span className="twse-form-label">Dc.No/Inv No.</span>
            <span className="twse-form-colon">:</span>
            <span className="twse-form-value">{data.invoiceNo}</span>
          </div>

          <div className="twse-form-row">
            <span className="twse-form-label">Booking Through</span>
            <span className="twse-form-colon">:</span>
            <span className="twse-form-value" style={{ flex: "0 0 auto", marginRight: "auto" }}>{data.bookingThrough}</span>
            <span className="twse-gstin-inline">GSTIN NO:</span>
          </div>

          <div className="twse-form-row">
            <span className="twse-form-label">Booking Qty</span>
            <span className="twse-form-colon">:</span>
            <span className="twse-form-value">{data.bookingQty}</span>
          </div>

          <div className="twse-form-row">
            <span className="twse-form-label">Customer Address</span>
            <span className="twse-form-colon">:</span>
            <span className="twse-form-value">
              {data.customerAddress}
              {"\n"}<span style={{ fontWeight: "normal" }}>GSTIN NO :&nbsp;</span><span style={{ color: "#c04000" }}>{data.customerGSTIN}</span>
            </span>
          </div>

          <div className="twse-form-row">
            <span className="twse-form-label">Mode of Transport</span>
            <span className="twse-form-colon">:</span>
            <span className="twse-form-value">{data.transportMode}</span>
          </div>

          <div className="twse-form-row">
            <span className="twse-form-label">Purpose</span>
            <span className="twse-form-colon">:</span>
            <span className="twse-form-value">{data.purpose}</span>
          </div>

          <div className="twse-remarks">{data.remarks}</div>

          <div className="twse-sign">
            <div>Thanking You,</div>
            <div>For &nbsp;<span className="co">JBS Mediitec India (P) Ltd</span></div>
            <div style={{ marginTop: "16px" }}>
              OPD &amp; Store Incharge.<br />
              Ph: {data.contactPhone}
            </div>
          </div>
        </div>

        <div className="twse-footer">{data.footerAddress}</div>

        <div className="twse-bottom-banner">
          <span className="bbitem">Diathermy</span>
          <span className="bbsep">&#9632;</span>
          <span className="bbitem">Alligature</span>
          <span className="bbsep">&#9632;</span>
          <span className="bbitem">Argon Plasma Coagulator (APC)</span>
          <span className="bbsep">&#9632;</span>
          <span className="bbitem">Saline-TUR</span>
        </div>

      </div>
    </div>
  );
};

export default ToWhomSoEverPrint;
