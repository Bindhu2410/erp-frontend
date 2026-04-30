import React from "react";

interface DemoReportData {
  demoDate?: string;
  address?: string;
  customerName?: string;
  products?: string;
  demoFeedback?: string;
  comments?: string;
}

interface DemoReportPrintProps {
  data?: DemoReportData;
}

const DemoReportPrint: React.FC<DemoReportPrintProps> = ({ data }) => {
  return (
    <div id="demo-report-area" style={{ fontFamily: 'Arial, sans-serif', fontSize: '12px', lineHeight: '1.4', padding: '20px', backgroundColor: 'white', maxWidth: '800px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ backgroundColor: '#d2691e', color: 'white', padding: '8px', textAlign: 'center', fontWeight: 'bold', fontSize: '12px', marginBottom: '10px' }}>
        Laparoscope ■ Cystoscope ■ Ureteroscope ■ Fetal Monitor ■ S.I. PUMP
      </div>

      {/* Company Info */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px', padding: '10px', border: '1px solid #ccc' }}>
        <div style={{ fontSize: '11px', lineHeight: '1.4' }}>
          <div><strong>ALPHA</strong> - Cystoscopy, Hysteroscopy, APC, Saline-TUR</div>
          <div><strong>HOSPINZ</strong> - Laparoscope Instruments, VET, Saline</div>
          <div><strong>RICHARD WOLF</strong> - Germany - Urology</div>
        </div>
        <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#228B22' }}>
          JBS meditec India (P) Ltd.
        </div>
      </div>

      {/* Report Title and Date */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div style={{ textAlign: 'center', fontSize: '16px', fontWeight: 'bold', textDecoration: 'underline', flex: 1 }}>
          Demonstration Report
        </div>
        <div style={{ fontSize: '12px', fontWeight: 'bold' }}>
          Date : {data?.demoDate ? new Date(data.demoDate).toLocaleDateString('en-GB') : '_______________'}
        </div>
      </div>

      {/* Form Fields */}
      <div style={{ marginBottom: '15px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '15px' }}>
          <span style={{ fontWeight: 'bold', width: '180px', fontSize: '12px' }}>1. Customer Address</span>
          <span style={{ fontWeight: 'bold', marginRight: '10px' }}>:</span>
          <div style={{ flex: 1, borderBottom: '1px solid #000', minHeight: '18px', paddingLeft: '5px', fontSize: '11px' }}>
            {data?.address || ''}
          </div>
        </div>
      </div>

      <div style={{ marginBottom: '15px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '15px' }}>
          <span style={{ fontWeight: 'bold', width: '180px', fontSize: '12px' }}>2. Product Details</span>
          <span style={{ fontWeight: 'bold', marginRight: '10px' }}>:</span>
          <div style={{ flex: 1, borderBottom: '1px solid #000', minHeight: '18px', paddingLeft: '5px', fontSize: '11px' }}>
            {data?.products || ''}
          </div>
        </div>
      </div>

      <div style={{ marginBottom: '15px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '15px' }}>
          <span style={{ fontWeight: 'bold', width: '180px', fontSize: '12px' }}>3. Unit Serial No</span>
          <span style={{ fontWeight: 'bold', marginRight: '10px' }}>:</span>
          <div style={{ flex: 1, borderBottom: '1px solid #000', minHeight: '18px', paddingLeft: '5px' }}></div>
        </div>
      </div>

      {/* Case Details */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ fontWeight: 'bold', fontSize: '12px', marginBottom: '8px' }}>4. Case Details</div>
        <div style={{ fontWeight: 'bold', fontSize: '12px', marginBottom: '8px', marginLeft: '20px' }}>(a) Case Speciality :</div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '5px 20px', marginLeft: '40px', fontSize: '11px', marginBottom: '15px' }}>
          <div>☐ General Surgery</div>
          <div>☐ Paediatric</div>
          <div>☐ Neuro</div>
          <div>☐ Gynaecology</div>
          <div>☐ Cardiothoracic</div>
          <div>☐ Oncology</div>
          <div>☐ Plastic</div>
          <div>☐ Ortho</div>
          <div>☐ Microsurgery</div>
          <div>☐ Urology</div>
          <div>☐ ENT</div>
          <div>☐ Gastroenterology</div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px', marginLeft: '20px' }}>
          <span style={{ fontWeight: 'bold', fontSize: '12px', width: '160px' }}>Any Other Pls Specify :</span>
          <div style={{ flex: 1, borderBottom: '1px solid #000', minHeight: '18px' }}></div>
        </div>

        <div style={{ fontWeight: 'bold', fontSize: '12px', marginBottom: '8px', marginLeft: '20px' }}>(b) Case Type :</div>
        <div style={{ display: 'flex', gap: '30px', marginLeft: '40px', fontSize: '11px', marginBottom: '15px' }}>
          <div>☐ Laparoscope</div>
          <div>☐ Endoscopy</div>
          <div>☐ Open Surgery</div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', marginLeft: '20px' }}>
          <span style={{ fontWeight: 'bold', fontSize: '12px', width: '200px' }}>(c) Case Duration (Time h/mins) :</span>
          <div style={{ flex: 1, borderBottom: '1px solid #000', minHeight: '18px' }}></div>
        </div>
      </div>

      {/* Demo Type */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ fontWeight: 'bold', fontSize: '12px', marginBottom: '8px' }}>5. Demo Type :</div>
        <div style={{ display: 'flex', gap: '30px', marginLeft: '40px', fontSize: '11px' }}>
          <div>☐ Case demo</div>
          <div>☐ Table demo</div>
          <div>☐ Tender demo</div>
        </div>
      </div>

      {/* Product Performance */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ fontWeight: 'bold', fontSize: '12px', marginBottom: '8px' }}>6. Product Performance :</div>
        <div style={{ display: 'flex', gap: '20px', marginLeft: '40px', fontSize: '11px' }}>
          <div>☐ Excellent</div>
          <div>☐ Satisfactory</div>
          <div>☐ Good</div>
          <div>☐ Not Satisfactory</div>
        </div>
      </div>

      {/* Customer Feedback */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ fontWeight: 'bold', fontSize: '12px', marginBottom: '5px' }}>7. Customer Utility Feedback:</div>
        <div style={{ border: '1px solid #000', minHeight: '60px', padding: '5px', fontSize: '11px' }}>
          {data?.demoFeedback || ''}
        </div>
      </div>

      {/* Executive Report */}
      <div style={{ marginBottom: '40px' }}>
        <div style={{ fontWeight: 'bold', fontSize: '12px', marginBottom: '5px' }}>8. Executive Report :</div>
        <div style={{ border: '1px solid #000', minHeight: '80px', padding: '5px', fontSize: '11px' }}>
          {data?.comments || ''}
        </div>
      </div>

      {/* Signatures */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '40px', marginBottom: '30px' }}>
        <div style={{ textAlign: 'center', width: '45%' }}>
          <div style={{ borderBottom: '1px solid #000', height: '60px', marginBottom: '10px' }}></div>
          <div style={{ fontWeight: 'bold', fontSize: '11px' }}>Seal & Signature of the Doctor</div>
        </div>
        <div style={{ textAlign: 'center', width: '45%' }}>
          <div style={{ borderBottom: '1px solid #000', height: '60px', marginBottom: '10px' }}></div>
          <div style={{ fontWeight: 'bold', fontSize: '11px' }}>Name & Signature of the Executive</div>
        </div>
      </div>

      {/* Address Footer */}
      <div style={{ textAlign: 'center', fontSize: '10px', marginBottom: '10px', fontWeight: 'bold' }}>
        Sri Ragavendra Tower, 3rd Floor, No.34, Co-operative E-colony, Villankarichal Road, Coimbatore – 641035<br />
        Ph: 9443367915, 9443367952, E-mail: info@jbsmeditec.com
      </div>

      {/* Footer */}
      <div style={{ backgroundColor: '#2F4F4F', color: 'white', padding: '8px', textAlign: 'center', fontSize: '11px' }}>
        Diathermy ■ Alligature ■ Argo Plasma Coagulator (APC) ■ Saline-TUR
      </div>
    </div>
  );
};

export default DemoReportPrint;
