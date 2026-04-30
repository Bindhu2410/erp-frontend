import React from "react";

// Accepts a prop: data (the JSON structure from API)
interface QuotationPrintTemplateProps {
  data: any;
  titleOverride?: string;
}

const QuotationPrintTemplate: React.FC<QuotationPrintTemplateProps> = ({
  data,
  titleOverride,
}) => {
  console.log("data RRRR", data);
  // Map API data to template structure
  // Helper to flatten items with their accessories
  const flattenIncludedItems = (included: any[] = []) => {
    let result: any[] = [];
    included.forEach((child) => {
      result.push(child);
      if (child.childItems && Array.isArray(child.childItems)) {
        result = result.concat(flattenIncludedItems(child.childItems));
      }
      if (child.accessoryItems && Array.isArray(child.accessoryItems)) {
        result = result.concat(flattenIncludedItems(child.accessoryItems));
      }
    });
    return result;
  };

  const items = data.items.map((item: any, idx: number) => {
    const bomChildItems: any[] = item.bomChildItems || item.childItems || [];
    const accessoryItems: any[] = item.accessoryItems || [];
    const qty = Number(item.quantity || item.qty) || 1;

    // Calculate child items total for the BOM amount
    const childItemsList = bomChildItems.map((child: any) => {
      const childQty = Number(child.quantity || child.qty) || 1;
      const rate =
        Number(child.quoteRate || child.saleRate || child.unitPrice) || 0;
      const tax = Number(child.tax || child.taxPercentage) || 0;
      const subtotal = rate * childQty;
      const taxAmount = (subtotal * tax) / 100;
      return {
        description: child.itemName || child.product || "",
        qty: childQty,
        unitPrice: rate,
        taxPercentage: tax,
        tax: taxAmount,
        amount: subtotal + taxAmount,
        itemCode: child.itemCode || "",
        make: child.make || "",
        model: child.model || "",
        catNo: child.catNo || "",
      };
    });

    const accessoriesList = accessoryItems.map((acc: any) => {
      const accQty = Number(acc.quantity || acc.qty) || 1;
      const rate = Number(acc.quoteRate || acc.saleRate || acc.unitPrice) || 0;
      const tax = Number(acc.tax || acc.taxPercentage) || 0;
      const subtotal = rate * accQty;
      const taxAmount = (subtotal * tax) / 100;
      return {
        description: acc.itemName || acc.name || "",
        qty: accQty,
        unitPrice: rate,
        taxPercentage: tax,
        tax: taxAmount,
        amount: subtotal + taxAmount,
        catNo: acc.catNo || "",
      };
    });

    // BOM-level totals: sum of all child items * qty
    const bomTotal =
      childItemsList.reduce((sum: number, c: any) => sum + c.amount, 0) * qty +
      accessoriesList.reduce((sum: number, a: any) => sum + a.amount, 0);

    // For the main row: show BOM name, qty, and total
    const firstChildRate =
      childItemsList.length > 0 ? childItemsList[0].unitPrice : 0;
    const firstChildTax =
      childItemsList.length > 0 ? childItemsList[0].taxPercentage : 0;

    return {
      sno: idx + 1,
      description: item.bomName || item.bomId,
      bomType: item.bomType || "",
      qty,
      unitPrice: firstChildRate,
      taxPercentage: firstChildTax,
      tax: 0,
      amount: bomTotal,
      childItems: childItemsList,
      accessories: accessoriesList,
    };
  });

  // Compute pricing based on items
  const base_price = items.reduce(
    (sum: number, item: any) => sum + item.qty * item.unitPrice,
    0,
  );
  const gst = items.reduce((sum: number, item: any) => sum + item.tax, 0);
  const total = items.reduce((sum: number, item: any) => sum + item.amount, 0);
  const pricing = {
    base_price: base_price.toLocaleString("en-IN", {
      style: "currency",
      currency: "INR",
    }),
    gst: gst.toLocaleString("en-IN", {
      style: "currency",
      currency: "INR",
    }),
    total: total.toLocaleString("en-IN", {
      style: "currency",
      currency: "INR",
    }),
    total_words: "", // You can use a number-to-words library if needed
    final_offer: "", // Fill as needed
    contact: "", // Fill as needed
  };

  const TERMS_ORDER = [
    "Taxes",
    "Freight Charges",
    "Delivery",
    "Payment",
    "Warranty",
  ];
  const termsAndConditions = data.termsAndConditions || data.termsData || {};
  const termsArr = TERMS_ORDER.map((key) => ({
    term: key,
    description: termsAndConditions[key] || "",
  }));

  console.log(data, "TMS");

  const quotationData = {
    quotation_ref: data.quotationId || data.quotation?.quotationId,
    date:
      data.quotationDate || data.quotation?.quotationDate
        ? new Date(
            data.quotationDate || data.quotation.quotationDate,
          ).toLocaleDateString("en-GB")
        : new Date().toLocaleDateString("en-GB"),
    client: {
      name: data?.customerName || "Customer Name",
      address: [
        // Compose full address for 'To' section
        [
          data.leadAddress?.door_no,
          data.leadAddress?.street,
          data.leadAddress?.block
            ? `Block: ${data.leadAddress.block}`
            : undefined,
          data.leadAddress?.landmark,
        ]
          .filter(Boolean)
          .join(", "),
        [
          data.leadAddress?.area,
          data.leadAddress?.city,
          data.leadAddress?.state,
          data.leadAddress?.pincode
            ? `- ${data.leadAddress.pincode}`
            : undefined,
        ]
          .filter(Boolean)
          .join(", "),
      ].filter((line) => line && line.trim() !== "") || [
        "Address Line 1",
        "Address Line 2",
      ],
      salutation: "Dear Sir/Madam",
    },
    subject: data.quoteTitleName
      ? data.quoteTitleName
      : data.quoteTitle
        ? `Quotation for ${data.quoteTitle}`
        : data.quotation?.quotationType === "Standard"
          ? "Standard Quotation"
          : (data.quotation?.quotationType || "Quotation") +
            (items[0]?.description ? ` for ${items[0].description}` : ""),
    items,
    pricing,
    terms: termsArr,
    company: {
      name: "JBS meditec India Private Limited",
      representative: "", // Fill as needed
      address:
        "Sri RagavendraTower, 3rd Floor, No-34, Co-operative E-colony, VillankurichiRoad, Coimbatore–641035",
      contacts: ["Ph: 0422-2665030, 2665031", "E-mail: info@jbsmeditec.com"],
    },
    product_footer:
      "Diathermy • Alligature • Argon Plasma Coagulator (APC) • Saline-TUR",
  };

  return (
    <div className="max-w-4xl mx-auto shadow-md py-8 px-2">
      {/* Print Header */}
      <header
        className="border-b border-gray-300 pt-2 pb-2"
        style={{
          width: "100%",
          boxSizing: "border-box",
          padding: 0,
          height: "auto",
          position: "relative",
          zIndex: 1000,
        }}
      >
        <div className="w-full">
          {/* Product line bar */}
          <div className="w-full bg-blue-900 rounded-lg px-8 py-3 flex flex-wrap justify-center items-center">
            <span className="text-white text-base font-semibold mx-2">
              Laparoscope
            </span>
            <span className="text-white mx-2">•</span>
            <span className="text-white text-base font-semibold mx-2">
              Colposcope
            </span>
            <span className="text-white mx-2">•</span>
            <span className="text-white text-base font-semibold mx-2">
              Hysteroscope
            </span>
            <span className="text-white mx-2">•</span>
            <span className="text-white text-base font-semibold mx-2">
              Fetal Monitor
            </span>
            <span className="text-white mx-2">•</span>
            <span className="text-white text-base font-semibold mx-2">
              Fluid Management system
            </span>
          </div>
          <div className="flex-1 flex flex-row items-center justify-center mb-1">
            <span
              className="text-4xl font-bold"
              style={{
                color: "#388E3C",
                fontFamily: "serif",
                letterSpacing: "2px",
              }}
            >
              JBS
            </span>
            <span
              className="font-bold text-print-red text-xl"
              style={{ fontFamily: "sans-serif" }}
            >
              meditec India Private Limited
            </span>
          </div>
          {/* Company and product info section below */}
          <div className="w-full flex flex-row items-start mt-2 px-2">
            {/* Left: Product/brand info */}
            <div className="flex-1 text-xs text-[#212121] font-normal leading-tight flex flex-col justify-center">
              <div>
                <span className="font-bold">proMIS</span> - Laparoscope,
                Colposcope, Hysteroscope
              </div>
              <div>
                <span className="font-bold">ALAN</span> - Diathermy, Vessel
                Sealing System, APC, Saline-TUR
              </div>
              <div>
                <span className="font-bold">HOSPINZ</span> - Laparoscope
                Instruments, VET, Morcellator, Fluid Management system
              </div>
            </div>
            {/* Center: JBS meditec India Private Limited */}

            {/* Right: PAN, CIN, GST */}
            <div
              className="flex-1 text-xs text-[#212121] font-semibold flex flex-col justify-center items-end"
              style={{ lineHeight: "1.5" }}
            >
              <div>PAN : AABCJ6645C</div>
              <div>CIN : U33112TZ2006PTC012703</div>
              <div>
                <span className="font-bold">GST:33AABCJ6645C1ZW</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content (with print margin for header/footer) */}
      <main className="max-w-3xl mx-auto bg-white p-4 rounded-lg print:rounded-none">
        {/* Print Header (only visible in print) */}

        <div className="text-center text-2xl font-bold text-blue-900 uppercase tracking-wider my-2">
          {titleOverride ? titleOverride : "Quotation"}
        </div>
        <div className="flex justify-between pb-2 border-b border-blue-300">
          <div>
            <span className="font-semibold text-blue-900">Ref:</span>{" "}
            {quotationData.quotation_ref}
          </div>
          <div>
            <span className="font-semibold text-blue-900">Date:</span>{" "}
            {quotationData.date}
          </div>
        </div>
        {/* Client Address */}
        <div className="mb-6 leading-relaxed">
          <div className="font-semibold text-blue-900">To,</div>
          <div>{quotationData.client.name}</div>
          {quotationData.client.address.map((line, idx) => (
            <div key={idx}>{line}</div>
          ))}
          <div className="mt-3 text-bold">
            {quotationData.client.salutation},
          </div>
        </div>

        {/* Subject Line */}
        <div className="font-semibold my-6 text-blue-900 text-base">
          Sub:{" "}
          <span className="font-semibold my-6 text-black text-base">
            {quotationData.subject}
          </span>
        </div>

        {/* Products Table */}
        <div className="print:overflow-visible print:w-full">
          <table
            className="w-full border-collapse my-4 text-sm"
            style={{
              borderTop: "2px solid #1e3a8a",
              borderBottom: "1px solid #ccc",
            }}
          >
            <thead>
              <tr style={{ borderBottom: "2px solid #1e3a8a" }}>
                <th className="py-2 px-3 text-center font-bold text-gray-900 w-12">
                  SN
                </th>
                <th className="py-2 px-3 text-left font-bold text-gray-900">
                  Description
                </th>
                <th className="py-2 px-3 text-center font-bold text-gray-900 w-28">
                  Cat No.
                </th>
                <th className="py-2 px-3 text-center font-bold text-gray-900 w-16">
                  Qty
                </th>
                <th className="py-2 px-3 text-center font-bold text-gray-900 w-16">
                  Nos.
                </th>
              </tr>
            </thead>
            <tbody>
              {(() => {
                let sno = 0;
                return items.map((item: any, bomIdx: number) => (
                  <React.Fragment key={bomIdx}>
                    {/* BOM header row - bold, no serial number */}
                    <tr>
                      <td
                        colSpan={5}
                        className="py-2 px-3 font-bold text-gray-900 uppercase"
                      >
                        {item.description}
                        {item.bomType && item.bomType !== item.description && (
                          <span className="font-normal text-gray-600 text-xs ml-2 normal-case">
                            ({item.bomType})
                          </span>
                        )}
                      </td>
                    </tr>
                    {item.childItems.map((child: any, childIdx: number) => {
                      sno++;
                      return (
                        <tr key={childIdx} className="border-b border-gray-200">
                          <td className="py-1 px-3 text-center text-gray-700">
                            {sno}
                          </td>
                          <td className="py-1 px-3 text-gray-900">
                            {child.description}
                          </td>
                          <td className="py-1 px-3 text-center text-gray-500">
                            {child.catNo}
                          </td>
                          <td className="py-1 px-3 text-center text-gray-700">
                            {child.qty}
                          </td>
                          <td className="py-1 px-3 text-center text-gray-500">
                            Nos.
                          </td>
                        </tr>
                      );
                    })}
                    {item.accessories.length > 0 && (
                      <tr>
                        <td
                          colSpan={5}
                          className="py-1 px-3 font-bold text-gray-900 uppercase text-xs"
                          style={{ background: "#f1f5f9", letterSpacing: "1px" }}
                        >
                          CONSUMABLE ACCESSORIES
                        </td>
                      </tr>
                    )}
                    {item.accessories.map((acc: any, accIdx: number) => {
                      sno++;
                      return (
                        <tr
                          key={`acc-${accIdx}`}
                          className="border-b border-gray-200"
                        >
                          <td className="py-1 px-3 text-center text-gray-700">
                            {sno}
                          </td>
                          <td className="py-1 px-3 text-gray-900">
                            {acc.description}
                          </td>
                          <td className="py-1 px-3 text-center text-gray-500">
                            {acc.catNo}
                          </td>
                          <td className="py-1 px-3 text-center text-gray-700">
                            {acc.qty}
                          </td>
                          <td className="py-1 px-3 text-center text-gray-500">
                            Nos.
                          </td>
                        </tr>
                      );
                    })}
                  </React.Fragment>
                ));
              })()}
            </tbody>
          </table>

          {/* Totals */}
          {(() => {
            const baseTotal = items.reduce(
              (sum: number, item: any) =>
                sum +
                item.childItems.reduce(
                  (s: number, c: any) => s + c.unitPrice * c.qty,
                  0,
                ) +
                item.accessories.reduce(
                  (s: number, a: any) => s + a.unitPrice * a.qty,
                  0,
                ),
              0,
            );
            const gstTotal = items.reduce(
              (sum: number, item: any) =>
                sum +
                item.childItems.reduce((s: number, c: any) => s + c.tax, 0) +
                item.accessories.reduce((s: number, a: any) => s + a.tax, 0),
              0,
            );
            const grandTotal = baseTotal + gstTotal;
            const fmt = (n: number) => `Rs.${n.toLocaleString("en-IN")},00/-`;
            return (
              <table
                className="w-full text-sm"
                style={{ borderTop: "1px solid #ccc" }}
              >
                <tbody>
                  <tr>
                    <td colSpan={4} />
                    <td className="py-1 px-3 text-right">{fmt(baseTotal)}</td>
                  </tr>
                  <tr>
                    <td colSpan={3} />
                    <td className="py-1 px-3 text-right text-gray-700">
                      Add : GST tax
                    </td>
                    <td className="py-1 px-3 text-right">{fmt(gstTotal)}</td>
                  </tr>
                  <tr style={{ borderTop: "2px solid #1e3a8a" }}>
                    <td className="py-2 px-3 font-bold" colSpan={3}>
                      {/* words placeholder */}
                    </td>
                    <td className="py-2 px-3 text-right font-bold" />
                    <td
                      className="py-2 px-3 text-right font-bold"
                      style={{ borderTop: "2px solid #1e3a8a" }}
                    >
                      {fmt(grandTotal)}
                    </td>
                  </tr>
                </tbody>
              </table>
            );
          })()}
        </div>

        {/* Terms and Conditions */}
        <div className="mt-8 break-inside-avoid-page print:break-inside-avoid-page">
          <h3 className="text-blue-900 font-bold text-lg mb-3">
            Terms and Conditions:
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm break-inside-avoid-page print:break-inside-avoid-page">
              <tbody>
                {quotationData.terms.map((term: any, idx: number) => {
                  // Replace \n with <br /> and \t with &nbsp;&nbsp;&nbsp;&nbsp;
                  const formattedDescription = (term.description || "")
                    .replace(/\n/g, "<br />")
                    .replace(/\t/g, "&nbsp;&nbsp;&nbsp;&nbsp;");
                  return (
                    <tr key={idx} className="border-b border-gray-200">
                      <td className="font-semibold text-blue-900 w-1/5 py-3 px-4 align-top">
                        {term.term}:
                      </td>
                      <td className="py-3 px-4 align-top">
                        <span
                          dangerouslySetInnerHTML={{
                            __html: formattedDescription,
                          }}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Best Regards Message - always above footer, not split */}
        <div className="mt-10 mb-2 break-inside-avoid-page print:break-inside-avoid-page">
          <div className="font-semibold text-blue-900">With best regards,</div>
          <div className="font-semibold">
            For M/s. {quotationData.company.name},
          </div>
          <div>{quotationData.company.representative}</div>
        </div>
      </main>

      <footer className="print:border-t print:border-gray-300 print:pt-2 print:pb-2">
        <div className="max-w-5xl mx-auto">
          <div className="text-center text-[15px] font-semibold text-[#212121] leading-tight">
            {quotationData.company.address}
            <br />
            {quotationData.company.contacts.map((c: any, i: number) => (
              <span key={i}>
                {c}
                {i < quotationData.company.contacts.length - 1 ? " | " : ""}
              </span>
            ))}
          </div>
          <div className="mt-2 flex justify-center">
            <div
              className="bg-blue-900 text-white text-base px-6 py-1 rounded w-fit font-normal flex gap-6 items-center"
              style={{ letterSpacing: "0.5px" }}
            >
              {quotationData.product_footer
                .split("•")
                .map((item: any, idx: number, arr: any) => (
                  <React.Fragment key={idx}>
                    <span>{item.trim()}</span>
                    {idx < arr.length - 1 && <span className="mx-1">■</span>}
                  </React.Fragment>
                ))}
            </div>
          </div>
        </div>
      </footer>

      {/* Print CSS for page breaks and header/footer spacing */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @media print {
              @page {
                margin: 0.5in 0.5in 0.5in 0.5in;
                size: A4;
              }
              
              body { 
                margin: 0 !important;
                padding: 0 !important;
              }

              header {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                height: 100px;
              }

              footer {
                position: fixed;
                bottom: 0;
                left: 0;
                right: 0;
                height: 90px;
              }

              main {
                margin-top: 120px !important;
                margin-bottom: 100px !important;
              }

              /* Table specific rules */
              table { 
                width: 100% !important;
                page-break-inside: auto !important;
                border-collapse: collapse !important;
              }
              
              thead {
                display: table-header-group !important;
                background-color: #1e3a8a !important;
                color: white !important;
              }

              tbody {
                page-break-inside: auto !important;
              }

              tr {
                page-break-inside: avoid !important;
              }

              td, th { 
                page-break-inside: avoid !important;
              }

              /* Avoid page breaks inside these elements */
              .break-inside-avoid-page { 
                page-break-inside: avoid !important;
              }

              /* Footer on last page */
              footer.print\\:show-only-last-page {
                position: fixed !important;
                bottom: 0 !important;
              }

              /* Other print styles */
              .print\\:overflow-visible { overflow: visible !important; }
              .print\\:w-full { width: 100% !important; }
              .print\\:rounded-none { border-radius: 0 !important; }
              .shadow-2xl, .print\\:shadow-none, .shadow { box-shadow: none !important; }
            }

            /* Company name colors */
            .text-print-red {
              color: #B71C1C !important;
            }

            /* Table styles */
            table tr:nth-child(even) {
              background-color: #f9fafb;
            }

            table tr:hover {
              background-color: #f3f4f6;
            }
          `,
        }}
      />
    </div>
  );
};

export default QuotationPrintTemplate;
