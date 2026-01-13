import MainLayout from "../layout/MainLayout";
import PageHeader from "../components/PageHeader";
import "./Pressing.css";
import { useState } from "react";
import { supabase } from "../supabaseClient";

const SIZES = ["S", "M", "L", "XL"];
const MEASUREMENTS = ["Shoulder", "Chest", "Waist", "Hem", "Length", "Sleeve"];

const CHECKLIST = [
  "Proper crease",
  "No shine marks",
  "Collar pressed",
  "Sleeve pressed",
  "Button safe",
  "Final appearance OK",
];

export default function Pressing() {
  /* HEADER */
  const [orderNo, setOrderNo] = useState("");
  const [styleName, setStyleName] = useState("");
  const [garmentType, setGarmentType] = useState("");
  const [pressingDate, setPressingDate] = useState("");
  const [remarks, setRemarks] = useState("");

  /* SIZE QTY */
  const [sizeRows, setSizeRows] = useState(
    SIZES.map((s) => ({
      size: s,
      received_qty: "",
      pressed_qty: "",
      repress_qty: "",
    }))
  );

  /* CHECKLIST */
  const [checklist, setChecklist] = useState(
    CHECKLIST.map((c) => ({ item: c, checked: false }))
  );

  /* MEASUREMENTS */
  const [measurements, setMeasurements] = useState({});

  /* ================= SAVE PRESSING ================= */
  const savePressing = async () => {
    try {
      /* 1️⃣ HEADER */
      const { data: header, error: hErr } = await supabase
        .from("pressing_header")
        .insert({
          order_no: orderNo,
          style_name: styleName,
          garment_type: garmentType,
          pressing_date: pressingDate,
          remarks,
        })
        .select()
        .single();

      if (hErr) throw hErr;

      /* 2️⃣ SIZE QTY */
      await supabase.from("pressing_sizes").insert(
        sizeRows.map((r) => ({
          pressing_id: header.id,
          size: r.size,
          received_qty: Number(r.received_qty || 0),
          pressed_qty: Number(r.pressed_qty || 0),
          repress_qty: Number(r.repress_qty || 0),
          balance_qty:
            Number(r.received_qty || 0) -
            Number(r.pressed_qty || 0) -
            Number(r.repress_qty || 0),
        }))
      );

      /* 3️⃣ CHECKLIST */
      await supabase.from("pressing_checklist").insert(
        checklist.map((c) => ({
          pressing_id: header.id,
          item: c.item,
          checked: c.checked,
        }))
      );

      /* 4️⃣ MEASUREMENTS */
      const measurementRows = [];
      Object.keys(measurements).forEach((m) => {
        Object.keys(measurements[m]).forEach((s) => {
          measurementRows.push({
            pressing_id: header.id,
            measurement: m,
            size: s,
            value: measurements[m][s],
          });
        });
      });

      if (measurementRows.length) {
        await supabase.from("pressing_measurements").insert(measurementRows);
      }

      alert("✅ Pressing saved successfully");
    } catch (err) {
      console.error(err);
      alert("❌ Failed to save pressing");
    }
  };

  return (
    <MainLayout>
      <PageHeader title="Pressing Department" company="Pushpa Textile" />

      {/* ORDER INFO */}
      <div className="press-card">
        <h3>Order Information</h3>
        <div className="press-grid">
          <input placeholder="Order No" value={orderNo} onChange={(e) => setOrderNo(e.target.value)} />
          <input placeholder="Style Name" value={styleName} onChange={(e) => setStyleName(e.target.value)} />
          <input placeholder="Garment Type" value={garmentType} onChange={(e) => setGarmentType(e.target.value)} />
          <input type="date" value={pressingDate} onChange={(e) => setPressingDate(e.target.value)} />
        </div>
      </div>

      {/* SIZE QTY */}
      <div className="press-card">
        <h3>Size-wise Pressing Quantity</h3>
        <table className="press-table">
          <thead>
            <tr>
              <th>Size</th>
              <th>Received</th>
              <th>Pressed</th>
              <th>Re-Press</th>
              <th>Balance</th>
            </tr>
          </thead>
          <tbody>
            {sizeRows.map((r, i) => (
              <tr key={r.size}>
                <td>{r.size}</td>
                {["received_qty", "pressed_qty", "repress_qty"].map((f) => (
                  <td key={f}>
                    <input
                      type="number"
                      value={r[f]}
                      onChange={(e) => {
                        const copy = [...sizeRows];
                        copy[i][f] = e.target.value;
                        setSizeRows(copy);
                      }}
                    />
                  </td>
                ))}
                <td>
                  {(r.received_qty || 0) -
                    (r.pressed_qty || 0) -
                    (r.repress_qty || 0)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* CHECKLIST */}
      <div className="press-card">
        <h3>Pressing Quality Checklist</h3>
        <div className="checkbox-grid">
          {checklist.map((c, i) => (
            <label key={i}>
              <input
                type="checkbox"
                checked={c.checked}
                onChange={() => {
                  const copy = [...checklist];
                  copy[i].checked = !copy[i].checked;
                  setChecklist(copy);
                }}
              />{" "}
              {c.item}
            </label>
          ))}
        </div>
      </div>

      {/* MEASUREMENTS */}
      <div className="press-card">
        <h3>Final Size Measurement Check</h3>
        <table className="measurement-table">
          <thead>
            <tr>
              <th>Measurement</th>
              {SIZES.map((s) => <th key={s}>{s}</th>)}
            </tr>
          </thead>
          <tbody>
            {MEASUREMENTS.map((m) => (
              <tr key={m}>
                <td>{m}</td>
                {SIZES.map((s) => (
                  <td key={s}>
                    <input
                      placeholder="cm"
                      onChange={(e) =>
                        setMeasurements((prev) => ({
                          ...prev,
                          [m]: { ...prev[m], [s]: e.target.value },
                        }))
                      }
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* REMARKS */}
      <div className="press-card">
        <textarea
          placeholder="Pressing remarks..."
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
        />
        <button className="save-btn" onClick={savePressing}>
          Save Pressing
        </button>
      </div>
    </MainLayout>
  );
}
