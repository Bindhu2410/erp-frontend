import React, { useRef, useState } from "react";
import { LuPrinter as Printer } from "react-icons/lu";

const DeliveryNoteTemplate = () => {
  const printRef = useRef<HTMLDivElement>(null);
  const [deliveryData, setDeliveryData] = useState({
    company: {
      name: "JBS MEDIITEC INDIA PRIVATE LIMITED",
      gstin: "33AABCJ6645C1ZW",
      address: {
        line1: "Sri Ragavendra Tower, 3rd Floor, Site No- 34,",
        line2: "Co-Operative E-Colony, Behind Kumudham Nagar,",
        line3: "Vilankurichi, Coimbatore - 641035.",
        state: "Tamil Nadu",
        stateCode: "33",
      },
    },
    document: {
      docNo: "IS/24-25/0685",
      date: "02/09/2024",
    },
    customer: {
      name: "KRV NEW LIFE HOSPITAL",
      address: {
        line1: "NO -35, MELA VELLALAR STREET",
        line2: "JEYAMKONDON",
        pincode: "621802",
      },
      phone: "",
      gstin: "",
      placeOfSupply: "ANAND - JAYAMKONDAM",
    },
    reference: {
      ref: "Dr.",
      date: "",
    },
    items: [
      {
        slNo: 1,
        description: "HD CAMERA WITH RECORDING SYSTEM (C-101-R) HOSPIINZ",
        qty: "1 -Nos.",
        batchNo: "CSE000022/HIC-2042/C-103",
        hsnCode: "59018",
        accessories: [
          "POWER CORD - 1-Nos.",
          "CAMERA HEAD WITH COUPLER 18-35MM - 1-Nos.",
          "DVI - DVI CABLE - 1-Nos.",
          "HDMI TO HDMI CABLE 1.5MTR - 1-Nos.",
          "PEN DRIVE - 1-Nos.",
        ],
      },
      {
        slNo: 2,
        description: "HD LAPAROSCOPE 10MM 30 DEG HOSPIINZ",
        qty: "1 -Nos.",
        batchNo: "879102",
        hsnCode: "9018",
        accessories: [],
      },
      {
        slNo: 3,
        description: "HD LAPAROSCOPE 5MM 30 DEG HOSPIINZ",
        qty: "1 -Nos.",
        batchNo: "876465",
        hsnCode: "9018",
        accessories: [],
      },
      {
        slNo: 4,
        description: "LED LIGHT SOURCE (HI-LED-100) HOSPIINZ",
        qty: "1 -Nos.",
        batchNo: "1026",
        hsnCode: "9018",
        accessories: [
          "POWER CORD - 1-Nos.",
          "SPIKE BUSTER - 1-Nos.",
          "V-GUARD STABILISER 1 KV - 1-Nos.",
        ],
      },
      {
        slNo: 5,
        description: "FIBER OPTIC CABLE",
        qty: "1 -Nos.",
        batchNo: "",
        hsnCode: "9001",
        accessories: [],
      },
      {
        slNo: 6,
        description: 'LG PROFESIONAL MONITOR 27"',
        qty: "1 -Nos.",
        batchNo: "303NTC2DB235852",
        hsnCode: "8",
        accessories: [
          "POWER CORD - 1-Nos.",
          "POWER ADAPTOR - 1-Nos.",
          "HDMI TO HDMI CABLE - 1-Nos.",
        ],
      },
      {
        slNo: 7,
        description: "CO2 INSUFFLATOR 30LTR (HI-FLOW-30H) HOSPIINZ",
        qty: "1 -Nos.",
        batchNo: "1090",
        hsnCode: "9018",
        accessories: [
          "POWER CORD - 1-Nos.",
          "CO2 PRESSURE HOSE CYLINDER TO UNIT - BLUE - 1-Nos.",
          "CO2 REGULATOR FOR 30 LTR INSUFFLATOR HI - 1-Nos.",
          "SPANNER - 1-Nos.",
          "PATIENT HOSE WITH LUER LOCK+ADOPTOR FOR INSUFFLATOR - 1-Nos.",
          "CO2 KEY - 1-Nos.",
          "CO2 FILTER - 1-Nos.",
        ],
      },
      {
        slNo: 8,
        description: "CO2 CYLINDER WITH GAS - 7 KG",
        qty: "1 -Nos.",
        batchNo: "",
        hsnCode: "7311",
        accessories: [],
      },
    ],
    narration:
      "ITEMS SEND FOR DEMO PURPOSE. NOT FOR SALE. THERE IS NO COMMERCIAL VALUE INVOLVED IN THIS TRANSACTION",
    totalAmount: "1,508,800.00",
    purpose: "DEMO PURPOSE",
  });

  const handlePrint = () => {
    if (printRef.current) {
      const printContents = printRef.current.innerHTML;
      const printWindow = window.open("", "", "height=800,width=900");
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Print Delivery Note</title>
              <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
              <style>
                @media print {
                 @page {
        margin: 16mm !important;
      }
      body {
      padding:10px;
        background: white !important;
      }
      .print-border {
        border: 2px solid black !important;
      }
     
                }
              </style>
            </head>
            <body>${printContents}</body>
          </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
          printWindow.print();
          printWindow.close();
        }, 500);
      }
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white">
      {/* Print Button */}
      <div className="mb-4 no-print">
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          <Printer size={16} />
          Print Delivery Note
        </button>
      </div>
      <div className="max-w-3xl mx-auto p-6 bg-white" ref={printRef}>
        {/* Delivery Note Content */}
        <div className="border-2  border-black print:border-black">
          {/* Header */}
          <div className="text-center border-b-2 border-black p-4">
            <h1 className="text-xl font-bold">{deliveryData.company.name}</h1>
            <h2 className="text-lg font-semibold mt-2">DELIVERY NOTE</h2>
            <p className="text-sm mt-1">
              GSTIN NO : {deliveryData.company.gstin}
            </p>
          </div>

          {/* Document Info and Customer Details */}
          <div className="grid grid-cols-2 border-b-2 border-black">
            <div className="p-4 border-r-2 border-black">
              <div className="mb-4">
                <p>
                  <span className="font-semibold">Doc No.:</span>{" "}
                  {deliveryData.document.docNo}
                </p>
                <p>
                  <span className="font-semibold">Date:</span>{" "}
                  {deliveryData.document.date}
                </p>
              </div>
              <div>
                <p className="font-semibold">To,</p>
                <p className="font-semibold mt-2">
                  {deliveryData.customer.name}
                </p>
                <p>{deliveryData.customer.address.line1}</p>
                <p>{deliveryData.customer.address.line2}</p>
                <p>{deliveryData.customer.address.pincode}</p>
              </div>
            </div>
            <div className="p-4">
              <div className="mb-4">
                <p>
                  <span className="font-semibold">Phone No:</span>{" "}
                  {deliveryData.customer.phone}
                </p>
                <p>
                  <span className="font-semibold">GSTIN No:</span>{" "}
                  {deliveryData.customer.gstin}
                </p>
                <p>
                  <span className="font-semibold">Place of Supply:</span>{" "}
                  {deliveryData.customer.placeOfSupply}
                </p>
              </div>
              <div className="mt-8">
                <p>{deliveryData.purpose}</p>
                <div className="mt-4">
                  <p>{deliveryData.company.address.line1}</p>
                  <p>{deliveryData.company.address.line2}</p>
                  <p>{deliveryData.company.address.line3}</p>
                  <p>
                    {deliveryData.company.address.state}. State Code :
                    {deliveryData.company.address.stateCode}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Reference and Salutation */}
          <div className="p-4 border-b-2 border-black">
            <p>
              <span className="font-semibold">Ref:</span>{" "}
              {deliveryData.reference.ref}{" "}
              <span className="ml-8 font-semibold">Date:</span>{" "}
              {deliveryData.reference.date}
            </p>
            <p className="mt-2">Dear Sirs,</p>
            <p className="mt-2">
              We Request you to kindly receive the under mentioned goods in good
              conditions and in order.
            </p>
            <p>
              Please arrange to return the duplicate copy duly signed and
              sealed.
            </p>
          </div>

          {/* Items Table */}
          <div className="border-b-2 border-black">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-black">
                  <th className="border-r-2 border-black p-2 text-left text-sm">
                    Sl.No
                  </th>
                  <th className="border-r-2 border-black p-2 text-left text-sm">
                    Material Particulars
                  </th>
                  <th className="border-r-2 border-black p-2 text-left text-sm">
                    Qty
                  </th>
                  <th className="border-r-2 border-black p-2 text-left text-sm">
                    Batch No
                  </th>
                  <th className="p-2 text-left text-sm">HSN Code</th>
                </tr>
              </thead>
              <tbody>
                {deliveryData.items.map((item, index) => (
                  <tr key={index} className="border-b border-black">
                    <td className="border-r-2 border-black p-2 text-sm align-top">
                      {item.slNo}
                    </td>
                    <td className="border-r-2 border-black p-2 text-sm">
                      <div className="font-semibold">{item.description}</div>
                      {item.accessories.length > 0 && (
                        <div className="mt-1">
                          <div className="font-semibold text-xs">
                            ACCESSORIES :
                          </div>
                          {item.accessories.map((accessory, idx) => (
                            <div key={idx} className="text-xs ml-2">
                              ⇒ {accessory}
                            </div>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="border-r-2 border-black p-2 text-sm align-top">
                      {item.qty}
                    </td>
                    <td className="border-r-2 border-black p-2 text-sm align-top">
                      {item.batchNo}
                    </td>
                    <td className="p-2 text-sm align-top">{item.hsnCode}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Narration and Total */}
          <div className="p-4">
            <div className="mb-4">
              <p className="text-sm">
                <span className="font-semibold">Narration:</span>{" "}
                {deliveryData.narration}
              </p>
            </div>
            <div className="text-right mb-4">
              <p className="text-lg font-semibold">
                Total Amount: {deliveryData.totalAmount}
              </p>
            </div>
          </div>

          {/* Footer Signatures */}
          <div className="grid grid-cols-2 border-t-2 border-black">
            <div className="p-4 border-r-2 border-black">
              <p className="text-sm mb-8">
                Received the above mentioned goods in good condition and in
                order.
              </p>
              <p className="text-sm font-semibold">
                Receivers Signature with seal
              </p>
            </div>
            <div className="p-4 text-center">
              <p className="text-sm mb-8">for {deliveryData.company.name}</p>
              <p className="text-sm font-semibold">Authorised Signatory</p>
            </div>
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style>
        {`
    @media print {
      @page {
        margin: 16mm !important;
      }
      body {
        background: white !important;
      }
      .print-border {
        border: 2px solid black !important;
      }
    }
  `}
      </style>
    </div>
  );
};

export default DeliveryNoteTemplate;
