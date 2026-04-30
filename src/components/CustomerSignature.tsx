import React, { useState } from "react";

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
  const canvasRef               = React.useRef<HTMLCanvasElement>(null);
  const drawingRef              = React.useRef(false);
  const lastPos                 = React.useRef({ x: 0, y: 0 });

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

interface CustomerSignatureProps {
  signature: string | null;
  onSignatureChange: (signature: string | null) => void;
  label?: string;
}

const CustomerSignature: React.FC<CustomerSignatureProps> = ({
  signature,
  onSignatureChange,
  label = "Customer Seal and Signature"
}) => {
  const [showModal, setShowModal] = useState(false);

  return (
    <div style={{ textAlign: "right" }}>
      {signature ? (
        <div>
          <img
            src={signature}
            alt="Customer Signature"
            style={{ maxWidth: 180, maxHeight: 70, marginBottom: 4, display: "block", marginLeft: "auto" }}
          />
          <button
            className="no-print"
            onClick={() => { onSignatureChange(null); setShowModal(true); }}
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
          onClick={() => setShowModal(true)}
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
      <div>{label}</div>

      {showModal && (
        <SignaturePad
          onSave={(b64) => { onSignatureChange(b64); setShowModal(false); }}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
};

export default CustomerSignature;