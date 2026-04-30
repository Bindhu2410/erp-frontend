import React, { useEffect, useRef, useState } from "react";
import api from "../../services/api";

// ─── Signature Pad Modal (no external deps) ───────────────────────────────────
const FONT_OPTIONS = [
  { label: "Script",  value: "italic 48px 'Brush Script MT', cursive" },
  { label: "Serif",   value: "italic bold 44px 'Palatino Linotype', Georgia, serif" },
  { label: "Cursive", value: "italic 48px 'Comic Sans MS', cursive" },
  { label: "Classic", value: "bold 44px 'Times New Roman', serif" },
];

const SignaturePad: React.FC<{ onSave: (b64: string) => void; onClose: () => void }> = ({
  onSave,
  onClose,
}) => {
  const [mode, setMode]         = useState<"draw" | "type" | "upload">("draw");
  const [color, setColor]       = useState("#000000");
  const [lineWidth, setLineWidth] = useState(2);
  const [typedName, setTypedName] = useState("");
  const [fontIdx, setFontIdx]   = useState(0);
  const canvasRef               = useRef<HTMLCanvasElement>(null);
  const drawingRef              = useRef(false);
  const lastPos                 = useRef({ x: 0, y: 0 });

  const getPos = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>,
    canvas: HTMLCanvasElement
  ) => {
    const rect   = canvas.getBoundingClientRect();
    const scaleX = canvas.width  / rect.width;
    const scaleY = canvas.height / rect.height;
    if ("touches" in e) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top)  * scaleY,
      };
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top)  * scaleY,
    };
  };

  const startDraw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (mode !== "draw") return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    drawingRef.current = true;
    lastPos.current = getPos(e, canvas);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!drawingRef.current || mode !== "draw") return;
    const canvas = canvasRef.current;
    const ctx    = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const pos = getPos(e, canvas);
    ctx.strokeStyle = color;
    ctx.lineWidth   = lineWidth;
    ctx.lineCap     = "round";
    ctx.lineJoin    = "round";
    ctx.beginPath();
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    lastPos.current = pos;
  };

  const stopDraw = () => { drawingRef.current = false; };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx    = canvas?.getContext("2d");
    if (canvas && ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const renderTyped = () => {
    const canvas = canvasRef.current;
    const ctx    = canvas?.getContext("2d");
    if (!canvas || !ctx || !typedName.trim()) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle    = color;
    ctx.font         = FONT_OPTIONS[fontIdx].value;
    ctx.textAlign    = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(typedName, canvas.width / 2, canvas.height / 2);
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const canvas = canvasRef.current;
    const ctx    = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img     = new Image();
      img.onload    = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const scale = Math.min(canvas.width / img.width, canvas.height / img.height);
        const x     = (canvas.width  - img.width  * scale) / 2;
        const y     = (canvas.height - img.height * scale) / 2;
        ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
      };
      img.src = ev.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const a  = document.createElement("a");
    a.href   = canvas.toDataURL("image/png");
    a.download = "signature.png";
    a.click();
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    onSave(canvas.toDataURL("image/png"));
  };

  const overlayStyle: React.CSSProperties = {
    position: "fixed", inset: 0,
    background: "rgba(0,0,0,0.6)",
    display: "flex", alignItems: "center", justifyContent: "center",
    zIndex: 99999,
  };
  const modalStyle: React.CSSProperties = {
    background: "#1a1a1a", borderRadius: 12, padding: 24, width: 500,
    boxShadow: "0 12px 40px rgba(0,0,0,0.6)",
  };
  const btnBase: React.CSSProperties = {
    padding: "6px 18px", borderRadius: 6, border: "1px solid #555",
    cursor: "pointer", fontSize: 13,
  };

  return (
    <div style={overlayStyle} onMouseDown={(e) => e.stopPropagation()}>
      <div style={modalStyle}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
          <div>
            <div style={{ color: "#fff", fontWeight: "bold", fontSize: 15 }}>Signature</div>
            <div style={{ color: "#888", fontSize: 12, marginTop: 2 }}>Marketing Co-Ordinator / Customer Seal</div>
          </div>
          <button onClick={onClose} style={{ ...btnBase, padding: "4px 10px", background: "transparent", color: "#aaa", border: "none", fontSize: 18, lineHeight: 1 }}>✕</button>
        </div>

        {/* Mode tabs */}
        <div style={{ display: "flex", gap: 6, margin: "12px 0" }}>
          {(["draw", "type", "upload"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              style={{
                ...btnBase,
                background: mode === m ? "#fff" : "transparent",
                color:      mode === m ? "#000" : "#ccc",
                fontWeight: mode === m ? "bold" : "normal",
                textTransform: "capitalize",
              }}
            >
              {m.charAt(0).toUpperCase() + m.slice(1)}
            </button>
          ))}
        </div>

        {/* Draw options */}
        {mode === "draw" && (
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
            <span style={{ color: "#aaa", fontSize: 12 }}>COLOR</span>
            {["#000000", "#22c55e", "#2563eb", "#dc2626"].map((c) => (
              <div
                key={c}
                onClick={() => setColor(c)}
                style={{
                  width: 22, height: 22, borderRadius: "50%", background: c,
                  border: `2px solid ${color === c ? "#fff" : "transparent"}`,
                  cursor: "pointer",
                }}
              />
            ))}
            <div style={{ width: 1, height: 18, background: "#555", margin: "0 4px" }} />
            <span style={{ color: "#aaa", fontSize: 12 }}>SIZE</span>
            <input
              type="range" min={1} max={8} value={lineWidth}
              onChange={(e) => setLineWidth(Number(e.target.value))}
              style={{ width: 80 }}
            />
          </div>
        )}

        {/* Type options */}
        {mode === "type" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 10 }}>
            <input
              value={typedName}
              onChange={(e) => setTypedName(e.target.value)}
              placeholder="Type your name…"
              style={{
                padding: "8px 12px", borderRadius: 6, border: "1px solid #555",
                background: "#2a2a2a", color: "#fff", fontSize: 14, outline: "none",
              }}
            />
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {FONT_OPTIONS.map((f, i) => (
                <button
                  key={f.label}
                  onClick={() => setFontIdx(i)}
                  style={{
                    ...btnBase,
                    background: fontIdx === i ? "#fff" : "transparent",
                    color:      fontIdx === i ? "#000" : "#ccc",
                  }}
                >
                  {f.label}
                </button>
              ))}
              <button
                onClick={renderTyped}
                style={{ ...btnBase, background: "#e84118", color: "#fff", border: "none", marginLeft: "auto" }}
              >
                Render
              </button>
            </div>
          </div>
        )}

        {/* Upload options */}
        {mode === "upload" && (
          <label
            style={{
              display: "flex", flexDirection: "column", alignItems: "center",
              justifyContent: "center", border: "2px dashed #555", borderRadius: 8,
              padding: "14px 0", cursor: "pointer", color: "#888", marginBottom: 10, fontSize: 13,
            }}
          >
            <input type="file" accept="image/png,image/jpeg,image/gif,image/webp" onChange={handleUpload} style={{ display: "none" }} />
            ☁ Click or drag &amp; drop a signature image (PNG / JPG)
          </label>
        )}

        {/* Canvas */}
        <canvas
          ref={canvasRef}
          width={452}
          height={160}
          onMouseDown={startDraw}
          onMouseMove={draw}
          onMouseUp={stopDraw}
          onMouseLeave={stopDraw}
          onTouchStart={startDraw}
          onTouchMove={draw}
          onTouchEnd={stopDraw}
          style={{
            width: "100%", display: "block", borderRadius: 8,
            background: "#fff", cursor: mode === "draw" ? "crosshair" : "default",
            touchAction: "none",
          }}
        />
        {mode === "draw" && (
          <div style={{ textAlign: "center", color: "#555", fontSize: 11, marginTop: 5 }}>
            Sign here using your mouse or finger
          </div>
        )}

        {/* Actions */}
        <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
          <button onClick={clearCanvas}    style={{ ...btnBase, background: "transparent", color: "#fff" }}>Clear</button>
          <button onClick={handleSave}     style={{ ...btnBase, background: "transparent", color: "#fff" }}>Use Signature</button>
          <button onClick={handleDownload} style={{ ...btnBase, background: "transparent", color: "#fff" }}>Download PNG</button>
        </div>
      </div>
    </div>
  );
};
// ──────────────────────────────────────────────────────────────────────────────

interface OrderAcceptancePrintTemplateProps {
  purchaseOrderId: string | number;
  soId?: string;
}

const OrderAcceptancePrintTemplate: React.FC<
  OrderAcceptancePrintTemplateProps
> = ({ purchaseOrderId, soId }) => {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [custSig, setCustSig] = useState<string | null>(null);
  const [showSigModal, setShowSigModal] = useState(false);

  useEffect(() => {
    if (!purchaseOrderId) return;
    setLoading(true);
    setError(null);

    Promise.all([
      api.post(`OrderAcceptance/create-from-po/${purchaseOrderId}`, {}),
      api.get(`purchaseorder/${purchaseOrderId}`),
    ])
      .then(([oaRes, poRes]) => {
        if (!oaRes || !poRes)
          throw new Error("Failed to fetch required data");

        // Merge PO data into the OA response data if available
        const mergedData = {
          ...(oaRes.data || {}),
          purchaseOrder: poRes.data || {},
        };
        setData(mergedData);
        console.log(mergedData, "mergedData");
      })
      .catch((err) => {
        setError(err.message || "Unknown error");
        setData(null);
      })
      .finally(() => setLoading(false));
  }, [purchaseOrderId]);

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );

  if (error)
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-red-600 bg-red-50 p-4 rounded-lg">
          Error: {error}
        </div>
      </div>
    );

  if (!data)
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-gray-600">No data found.</div>
      </div>
    );

  const get = (val: any) =>
    val !== undefined && val !== null && val !== "" ? val : "N/A";

  const parseTaxRate = (value: any) => {
    if (typeof value === "number") return value;
    if (typeof value === "string") {
      const match = value.match(/\d+(\.\d+)?/);
      return match ? Number(match[0]) : 0;
    }
    return 0;
  };

  const computeItemTaxable = (item: any) => {
    if (typeof item?.amount === "number" && item.amount > 0) return item.amount;
    const baseQty = Number(item?.quantity || 1);
    const children = item?.childItems || item?.bomChildItems || [];
    const childTotal = children.reduce((sum: number, child: any) => {
      const rate = Number(
        child?.quoteRate ?? child?.saleRate ?? child?.unitPrice ?? child?.price ?? 0
      );
      const qty = Number(child?.quantity || 1);
      return sum + rate * qty;
    }, 0);
    return childTotal * baseQty;
  };

  const numberToWordsIndian = (value: number) => {
    const n = Math.round(Number(value || 0));
    if (n === 0) return "Zero";
    const ones = [
      "",
      "One",
      "Two",
      "Three",
      "Four",
      "Five",
      "Six",
      "Seven",
      "Eight",
      "Nine",
      "Ten",
      "Eleven",
      "Twelve",
      "Thirteen",
      "Fourteen",
      "Fifteen",
      "Sixteen",
      "Seventeen",
      "Eighteen",
      "Nineteen",
    ];
    const tens = [
      "",
      "",
      "Twenty",
      "Thirty",
      "Forty",
      "Fifty",
      "Sixty",
      "Seventy",
      "Eighty",
      "Ninety",
    ];

    const twoDigits = (num: number) => {
      if (num < 20) return ones[num];
      return `${tens[Math.floor(num / 10)]}${num % 10 ? ` ${ones[num % 10]}` : ""}`;
    };

    const threeDigits = (num: number) => {
      if (num < 100) return twoDigits(num);
      return `${ones[Math.floor(num / 100)]} Hundred${
        num % 100 ? ` ${twoDigits(num % 100)}` : ""
      }`;
    };

    let num = n;
    const crore = Math.floor(num / 10000000);
    num %= 10000000;
    const lakh = Math.floor(num / 100000);
    num %= 100000;
    const thousand = Math.floor(num / 1000);
    num %= 1000;

    const parts = [];
    if (crore) parts.push(`${threeDigits(crore)} Crore`);
    if (lakh) parts.push(`${twoDigits(lakh)} Lakh`);
    if (thousand) parts.push(`${threeDigits(thousand)} Thousand`);
    if (num) parts.push(threeDigits(num));
    return parts.join(" ").trim();
  };

  const company = data.quotationInfo || {};
  const purchaseOrder = data.purchaseOrder || {};
  const items = data.items || purchaseOrder.items || data.quotationItems || data.quoteItems || [];
  const terms = data?.termsAndConditions || {};
  const leadAddress = data.leadAddress || {};

  // Flatten BOM childItems into individual rows for display
  const flatItems: any[] = [];
  items.forEach((bom: any) => {
    const children: any[] = bom.childItems || bom.bomChildItems || [];
    if (children.length > 0) {
      children.forEach((child: any) => {
        flatItems.push({
          itemName: child.itemName || `${child.make || ''} ${child.model || ''}`.trim() || '',
          qty: Number(child.quantity ?? 1),
          unitPrice: Number(child.quoteRate ?? child.saleRate ?? child.unitPrice ?? 0),
          taxPercentage: Number(child.tax ?? child.taxPercentage ?? 0),
        });
      });
    } else {
      flatItems.push(bom);
    }
  });

  // Calculate totals
  const subtotal = flatItems.reduce((sum: number, item: any) => {
    const rate = Number(item.unitPrice ?? item.quoteRate ?? item.saleRate ?? 0);
    const qty = Number(item.qty ?? item.quantity ?? 1);
    const tax = Number(item.taxPercentage ?? item.tax ?? 0);
    return sum + rate * qty * (1 + tax / 100);
  }, 0);
  const gstRate = parseTaxRate(company.taxes || company.tax);
  const taxAmount = (subtotal * gstRate) / 100;
  const discount = (subtotal * Number(company.discount || company.discount_amount || 0)) / 100;
  const freight = Number(company.freightCharge || company.freight_charge || company.freight_charges || 0);
  const total = subtotal + taxAmount + freight - discount;

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-IN");
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount || 0);
  };

  const orderRefNo = purchaseOrder.poId || purchaseOrder.id || purchaseOrder.orderNo || soId || "N/A";
  const orderRefDate = purchaseOrder.dateCreated || purchaseOrder.date || data.purchaseOrderDate;
  const quotationRefNo =
    company.quotationId || company.quotationNo || company.quoteId || purchaseOrder.quotationId || "N/A";
  const amountInWords =
    data.totalInWords || numberToWordsIndian(Math.round(Number(total || 0)));

  return (
    <div className="min-h-screen p-2 bg-gray-50 overflow-auto">
      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: Arial, sans-serif; font-size: 13px; color: #000; }
        .page { width: 794px; margin: 10px auto; background: #fff; box-shadow: 0 2px 14px rgba(0,0,0,0.2); min-height: 1123px; display: flex; flex-direction: column; }
        .top-banner { background-color: #e84118; color: #fff; text-align: center; padding: 7px 10px; font-size: 12.5px; font-weight: bold; }
        .top-banner .sep { margin: 0 7px; font-size: 10px; }
        .header-row { display: flex; align-items: flex-start; padding: 10px 16px 8px 14px; border-bottom: 1px solid #bbb; }
        .header-left { flex: 0 0 215px; font-size: 9.5px; color: #222; line-height: 1.65; padding-top: 4px; }
        .header-left ul { list-style: none; }
        .header-left ul li { display: flex; align-items: flex-start; gap: 3px; margin-bottom: 1px; }
        .header-left ul li::before { content: "•"; flex-shrink: 0; margin-top: 1px; }
        .header-center { flex: 1; display: flex; align-items: center; justify-content: center; }
        .jbs-logo-wrap { display: flex; align-items: center; gap: 8px; }
        .logo-text-block { display: flex; flex-direction: column; line-height: 1.15; }
        .logo-mediitec-line { font-family: Arial, sans-serif; font-size: 21px; font-weight: bold; color: #111; }
        .header-right { flex: 0 0 165px; font-size: 9.5px; color: #222; text-align: right; line-height: 1.9; padding-top: 4px; }
        .doc-title { text-align: center; font-size: 14.5px; font-weight: bold; text-decoration: underline; margin: 12px 0 10px; }
        .ref-date-row { display: flex; justify-content: space-between; padding: 0 18px 4px; font-size: 12.5px; }
        .to-section { padding: 6px 18px 0; font-size: 12.5px; line-height: 1.65; }
        .to-label { font-weight: bold; }
        .address { font-weight: bold; line-height: 1.7; margin-top: 2px; }
        .dear-line { padding: 10px 18px 1px; font-size: 12.5px; font-weight: bold; }
        .sub-line { padding: 1px 18px; font-size: 12.5px; }
        .order-ref-line { padding: 1px 18px; font-size: 12.5px; }
        .ref-no-line { padding: 1px 18px 3px; font-size: 12.5px; }
        .thank-you-line { padding: 5px 18px 7px; font-size: 12.5px; font-weight: bold; }
        .main-table { width: calc(100% - 36px); margin: 0 18px; border-collapse: collapse; font-size: 12px; }
        .main-table th { background: #f0f0f0; border: 1px solid #000; padding: 5px 8px; font-weight: bold; font-size: 12.5px; text-align: left; }
        .main-table th:nth-child(1) { width: 36px; text-align: center; }
        .main-table th:nth-child(3) { width: 50px; text-align: center; }
        .main-table th:nth-child(4) { width: 80px; text-align: right; }
        .main-table th:nth-child(5) { width: 90px; text-align: right; }
        .main-table td { border: 1px solid #000; padding: 5px 8px; vertical-align: top; }
        .main-table td:nth-child(1) { font-weight: bold; text-align: center; }
        .main-table td:nth-child(3) { text-align: center; }
        .main-table td:nth-child(4) { text-align: right; }
        .main-table td:nth-child(5) { font-weight: bold; text-align: right; white-space: nowrap; }
        .item-main { font-weight: bold; display: block; }
        .acc-heading { font-weight: bold; text-decoration: underline; display: block; margin-top: 4px; }
        .acc-list { line-height: 1.7; margin-top: 2px; }
        .acc-list div::before { content: "=>"; margin-right: 4px; }
        .totals-table { width: calc(100% - 36px); margin: 0 18px; border-collapse: collapse; font-size: 12.5px; }
        .totals-table td { border: 1px solid #000; padding: 4px 8px; }
        .totals-table .lbl { font-weight: bold; text-align: right; width: 78%; }
        .totals-table .val { text-align: right; }
        .grand-row td { font-weight: bold; }
        .terms-section { padding: 10px 18px 4px; font-size: 12px; }
        .terms-title { font-weight: bold; text-decoration: underline; margin-bottom: 5px; font-size: 12.5px; }
        .terms-table { width: 100%; border-collapse: collapse; font-size: 12px; }
        .terms-table td { padding: 2px 4px 3px 0; vertical-align: top; line-height: 1.55; }
        .terms-table .tlbl { font-weight: bold; white-space: nowrap; padding-right: 6px; width: 70px; }
        .note-section { padding: 6px 18px 3px; font-size: 12.5px; line-height: 1.6; }
        .note-ul { text-decoration: underline; font-weight: bold; }
        .confirm-line { padding: 5px 18px 3px; font-size: 12px; }
        .sig-row { display: flex; justify-content: space-between; padding: 10px 18px 4px; font-size: 12.5px; }
        .sig-labels { display: flex; justify-content: space-between; padding: 0 18px 20px; font-size: 12.5px; font-weight: bold; }
        .footer-address { text-align: center; font-size: 10px; font-weight: bold; border-top: 1px solid #aaa; padding: 5px 14px 4px; line-height: 1.55; margin-top: auto; }
        .bottom-banner { background: #3c3c3c; color: #fff; text-align: center; padding: 6px 10px; font-size: 12.5px; }
        .bottom-banner .sep { margin: 0 8px; opacity: 0.7; }
        .page-break { page-break-before: always; border-top: 3px solid #e84118; margin-top: 20px; }
        @media print {
          body { background: white !important; -webkit-print-color-adjust: exact; }
          .page { margin: 0 !important; box-shadow: none !important; width: 100% !important; }
          .no-print { display: none; }
        }
      `}</style>

      <div className="page">
        {/* TOP BANNER */}
        <div className="top-banner">
          Laparoscope <span className="sep">&#9632;</span> Colposcope <span className="sep">&#9632;</span> Hysteroscope <span className="sep">&#9632;</span> Fetal Monitor <span className="sep">&#9632;</span> Fluid Management System
        </div>

        {/* HEADER */}
        <div className="header-row">
          <div className="header-left">
            <ul>
              <li><span><b>proMIS</b> - Laparoscope, Colposcope, Hysteroscope</span></li>
              <li><span><b>ALAN</b> - Diathermy, Vessel Sealing System, APC, Saline-TUR</span></li>
              <li><span><b>HOSPIINZ</b> - Laparoscope Instruments, VET, Morcillator</span></li>
              <li><span>&#x2022; Fluid Management System</span></li>
            </ul>
          </div>

          <div className="header-center">
            <div className="jbs-logo-wrap">
              <svg width="105" height="66" viewBox="0 0 105 66" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block' }}>
                <text x="1" y="58" fontFamily="'Times New Roman', Times, serif" fontSize="60" fontWeight="bold" fill="#111111" letterSpacing="-1">J</text>
                <text x="32" y="58" fontFamily="'Times New Roman', Times, serif" fontSize="60" fontWeight="bold" fill="#111111" letterSpacing="-1">B</text>
                <text x="64" y="58" fontFamily="'Times New Roman', Times, serif" fontSize="60" fontWeight="bold" fill="#1d7a1d" letterSpacing="0">S</text>
                <path d="M64,61 Q79,70 95,60" stroke="#1d7a1d" strokeWidth="3.8" fill="none" strokeLinecap="round" />
              </svg>
              <div className="logo-text-block">
                <span className="logo-mediitec-line">mediitec India Private Limited.,</span>
              </div>
            </div>
          </div>

          <div className="header-right">
            PAN : AABCJ6645C<br />
            CIN : U33112TZ2006PTC012703<br />
            GST : 33AABCJ6645C1ZW
          </div>
        </div>

        {/* TITLE */}
        <div className="doc-title">Order Acceptance</div>

        {/* REF & DATE */}
        <div className="ref-date-row">
          <span>Ref: {get(data.orderAcceptanceId)}</span>
          <span>Date: {formatDate(data.dateCreated || purchaseOrder.dateCreated || company.quotationDate)}</span>
        </div>

        {/* TO ADDRESS */}
        <div className="to-section">
          <span className="to-label">To,</span>
          <div className="address">
            {[
              get(data.customerName),
              get(leadAddress.door_no),
              get(leadAddress.street),
              get(leadAddress.landmark),
              get(leadAddress.area),
              get(leadAddress.city),
              get(leadAddress.district),
              get(leadAddress.state),
              get(leadAddress.pincode),
            ].filter(v => v && v !== "N/A").map((line, i) => (
              <React.Fragment key={i}>
                {line}<br />
              </React.Fragment>
            ))}
          </div>
        </div>

        <div className="dear-line">Dear Doctor,</div>
        <div className="sub-line"><b>Sub:</b> Order Acceptance</div>
        <div className="order-ref-line"><b>Order Ref No:</b>&nbsp;{get(orderRefNo)} and Dated {formatDate(orderRefDate)}</div>
        <div className="ref-no-line"><b>Ref No:</b>&nbsp; Our Quotation Reference No {get(quotationRefNo)} and Dated {formatDate(company.quotationDate)}</div>
        <div className="thank-you-line">Thank you for placing the order and we will supply the following item as per terms &amp; conditions.</div>

        {/* ORDER TABLE */}
        <table className="main-table">
          <thead>
            <tr>
              <th>Sno</th>
              <th>Description</th>
              <th>Qty</th>
              <th>Tax (%)</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            {flatItems.map((item: any, idx: number) => {
              const rate = Number(item.unitPrice ?? item.quoteRate ?? item.saleRate ?? 0);
              const qty = Number(item.qty ?? item.quantity ?? 1);
              const tax = Number(item.taxPercentage ?? item.tax ?? 0);
              const amount = rate * qty * (1 + tax / 100);
              return (
                <tr key={idx}>
                  <td>{idx + 1}</td>
                  <td>{item.itemName || item.bomName || ''}</td>
                  <td>{qty.toFixed(2)}</td>
                  <td>{tax}%</td>
                  <td>{amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* FOOTER */}
        <div className="footer-address">
          Sri Ragavendra Tower, 3rd Floor, No-34, Co-operative E-colony, Behind Kumudham Nagar, Villankurichi Road, Coimbatore – 641035<br />
          Ph: 9443367915, 9443366752. E-mail: info@jbsmediitec.com
        </div>
        <div className="bottom-banner">
          Diathermy <span className="sep">&#9632;</span> Alligature <span className="sep">&#9632;</span> Argon Plasma Coagulator (APC) <span className="sep">&#9632;</span> Saline-TUR
        </div>
      </div>

      {/* PAGE 2 */}
      <div className="page page-break">
        {/* TOP BANNER */}
        <div className="top-banner">
          Laparoscope <span className="sep">&#9632;</span> Colposcope <span className="sep">&#9632;</span> Hysteroscope <span className="sep">&#9632;</span> Fetal Monitor <span className="sep">&#9632;</span> Fluid Management System
        </div>

        {/* HEADER PAGE 2 */}
        <div className="header-row">
          <div className="header-left">
            <ul>
              <li><span><b>proMIS</b> - Laparoscope, Colposcope, Hysteroscope</span></li>
              <li><span><b>ALAN</b> - Diathermy, Vessel Sealing System, APC, Saline-TUR</span></li>
              <li><span><b>HOSPIINZ</b> - Laparoscope Instruments, VET, Morcillator</span></li>
              <li><span>&#x2022; Fluid Management System</span></li>
            </ul>
          </div>
          <div className="header-center">
            <div className="jbs-logo-wrap">
              <svg width="105" height="66" viewBox="0 0 105 66" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block' }}>
                <text x="1" y="58" fontFamily="'Times New Roman', Times, serif" fontSize="60" fontWeight="bold" fill="#111111" letterSpacing="-1">J</text>
                <text x="32" y="58" fontFamily="'Times New Roman', Times, serif" fontSize="60" fontWeight="bold" fill="#111111" letterSpacing="-1">B</text>
                <text x="64" y="58" fontFamily="'Times New Roman', Times, serif" fontSize="60" fontWeight="bold" fill="#1d7a1d" letterSpacing="0">S</text>
                <path d="M64,61 Q79,70 95,60" stroke="#1d7a1d" strokeWidth="3.8" fill="none" strokeLinecap="round" />
              </svg>
              <div className="logo-text-block">
                <span className="logo-mediitec-line">mediitec India Private Limited.,</span>
              </div>
            </div>
          </div>
          <div className="header-right">
            PAN : AABCJ6645C<br />
            CIN : U33112TZ2006PTC012703<br />
            GST : 33AABCJ6645C1ZW
          </div>
        </div>

        {/* TOTALS */}
        <table className="totals-table" style={{ marginTop: '20px' }}>
          <tbody>
            <tr><td className="lbl">Total Taxable Amount</td><td className="val">{formatCurrency(subtotal)}</td></tr>
            <tr><td className="lbl">GST {gstRate}%</td><td className="val">{formatCurrency(taxAmount)}</td></tr>
            <tr><td className="lbl">Total Items Discount</td><td className="val">{formatCurrency(discount)}</td></tr>
            <tr><td className="lbl">RoundOff</td><td className="val">0.00</td></tr>
          </tbody>
        </table>

        {/* GRAND TOTAL */}
        <table className="totals-table" style={{ marginTop: '0' }}>
          <tbody>
            <tr className="grand-row">
              <td style={{ border: '1px solid #000', padding: '5px 8px', width: '8%' }}>Total:</td>
              <td style={{ border: '1px solid #000', padding: '5px 8px' }}>Rupees {amountInWords}</td>
              <td style={{ border: '1px solid #000', padding: '5px 8px', textAlign: 'right', whiteSpace: 'nowrap', width: '18%' }}>{formatCurrency(total)}</td>
            </tr>
          </tbody>
        </table>

        {/* TERMS */}
        <div className="terms-section">
          <div className="terms-title">Terms and Conditions:</div>
          <table className="terms-table">
            <tbody>
              <tr>
                <td className="tlbl">Taxes</td>
                <td>: {get(terms.taxes || terms.Taxes)}</td>
              </tr>
              <tr>
                <td className="tlbl">Delivery</td>
                <td>: {get(terms.delivery || terms.Delivery)}</td>
              </tr>
              <tr>
                <td className="tlbl">Payment</td>
                <td>: {get(terms.payment || terms.Payment)}</td>
              </tr>
              <tr>
                <td className="tlbl">Warranty</td>
                <td>: {get(terms.warranty || terms.Warranty)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* NOTE */}
        <div className="note-section">
          <span className="note-ul">Note :</span>&nbsp;&nbsp;<b>(1) Goods once sold will not be taken back.</b><br />
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;(2) No other terms and conditions shall apply on us.
        </div>

        {/* CONFIRM LINE */}
        <div className="confirm-line">
          Kindly confirm the receipt for this order acknowledgement by Mail or Letter with your seal and signature in this OA itself.
        </div>

        {/* SIGNATURE */}
        <div className="sig-row">
          <div>With best regards<br />for &nbsp;<b>M/s.JBS Mediitec India Private Limited,</b></div>
          <div></div>
        </div>
        <div className="sig-labels">
          <div>Marketing Co-Ordinator</div>
          {/* Customer Seal — digital signature */}
          <div style={{ textAlign: "right" }}>
            {custSig ? (
              <div>
                <img
                  src={custSig}
                  alt="Customer Signature"
                  style={{ maxWidth: 180, maxHeight: 70, marginBottom: 4, display: "block", marginLeft: "auto" }}
                />
                <button
                  className="no-print"
                  onClick={() => { setCustSig(null); setShowSigModal(true); }}
                  style={{
                    fontSize: 11, padding: "2px 10px", borderRadius: 4,
                    border: "1px solid #aaa", background: "transparent",
                    cursor: "pointer", color: "#555", marginTop: 2,
                  }}
                >
                  Re-sign
                </button>
              </div>
            ) : (
              <button
                className="no-print"
                onClick={() => setShowSigModal(true)}
                style={{
                  padding: "6px 18px", borderRadius: 6,
                  border: "2px dashed #bbb", background: "transparent",
                  cursor: "pointer", color: "#888", fontSize: 12,
                  marginBottom: 4,
                }}
              >
                ✍ Click to add Customer Signature
              </button>
            )}
            <div>Customer Seal and Signature</div>
          </div>
        </div>

        {/* Signature modal */}
        {showSigModal && (
          <SignaturePad
            onSave={(b64) => { setCustSig(b64); setShowSigModal(false); }}
            onClose={() => setShowSigModal(false)}
          />
        )}

        {/* FOOTER */}
        <div className="footer-address">
          Sri Ragavendra Tower, 3rd Floor, No-34, Co-operative E-colony, Behind Kumudham Nagar, Villankurichi Road, Coimbatore – 641035<br />
          Ph: 9443367915, 9443366752. E-mail: info@jbsmediitec.com
        </div>
        <div className="bottom-banner">
          Diathermy <span className="sep">&#9632;</span> Alligature <span className="sep">&#9632;</span> Argon Plasma Coagulator (APC) <span className="sep">&#9632;</span> Saline-TUR
        </div>
      </div>
    </div>
  );
};

export default OrderAcceptancePrintTemplate;
