import MainLayout from "../layout/MainLayout";
import PageHeader from "../components/PageHeader";
import "./Pressing.css";
import { useState } from "react";

const SIZES = ["S", "M", "L", "XL"];
const MEASUREMENTS = ["Shoulder", "Chest", "Waist", "Hem", "Length", "Sleeve"];

export default function Pressing() {
  const [remarks, setRemarks] = useState("");

  return (
    <MainLayout>
      <PageHeader title="Pressing Department" company="Pushpa Textile" />

      {/* ORDER INFO */}
      <div className="press-card">
        <h3>Order Information</h3>

        <div className="press-grid">
          <div>
            <label>Order No</label>
            <input placeholder="ORD-1001" />
          </div>

          <div>
            <label>Style Name</label>
            <input placeholder="Men Shirt – Slim Fit" />
          </div>

          <div>
            <label>Garment Type</label>
            <input placeholder="Shirt / Pant" />
          </div>

          <div>
            <label>Pressing Date</label>
            <input type="date" />
          </div>
        </div>
      </div>

      {/* SIZE WISE PRESSING */}
      <div className="press-card">
        <h3>Size-wise Pressing Quantity</h3>

        <table className="press-table">
          <thead>
            <tr>
              <th>Size</th>
              <th>Received Qty</th>
              <th>Pressed Qty</th>
              <th>Re-Press Qty</th>
              <th>Balance</th>
            </tr>
          </thead>

          <tbody>
            {SIZES.map((size) => (
              <tr key={size}>
                <td>{size}</td>
                <td><input /></td>
                <td><input /></td>
                <td><input /></td>
                <td><input disabled /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* PRESSING CHECKLIST */}
      <div className="press-card">
        <h3>Pressing Quality Checklist</h3>

        <div className="checkbox-grid">
          <label><input type="checkbox" /> Proper crease</label>
          <label><input type="checkbox" /> No shine marks</label>
          <label><input type="checkbox" /> Collar pressed</label>
          <label><input type="checkbox" /> Sleeve pressed</label>
          <label><input type="checkbox" /> Button safe</label>
          <label><input type="checkbox" /> Final appearance OK</label>
        </div>
      </div>

      {/* SIZE MEASUREMENT TABLE */}
      <div className="press-card">
        <h3>Final Size Measurement Check</h3>

        <table className="measurement-table">
          <thead>
            <tr>
              <th>Measurement</th>
              {SIZES.map((s) => (
                <th key={s}>{s}</th>
              ))}
            </tr>
          </thead>

          <tbody>
            {MEASUREMENTS.map((m) => (
              <tr key={m}>
                <td className="measure-name">{m}</td>
                {SIZES.map((s) => (
                  <td key={s}>
                    <input placeholder="cm" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* REMARKS & ACTIONS */}
      <div className="press-card">
        <h3>Remarks & Status</h3>

        <textarea
          placeholder="Pressing issues, re-press notes, quality remarks..."
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
        />

        <div className="press-actions">
          <button className="save-btn">Save Pressing</button>
          <button className="next-btn">Move to Packing</button>
        </div>
      </div>
    </MainLayout>
  );
}
