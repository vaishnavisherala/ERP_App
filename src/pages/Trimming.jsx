import MainLayout from "../layout/MainLayout";
import PageHeader from "../components/PageHeader";
import "./Trimming.css";
import { useState } from "react";

export default function Trimming() {
  const [defects, setDefects] = useState("");

  return (
    <MainLayout>
      <PageHeader title="Trimming Department" company="Pushpa Textile" />

      {/* ORDER INFO */}
      <div className="trim-card">
        <h3>Order Information</h3>

        <div className="trim-grid">
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
            <label>Trimming Date</label>
            <input type="date" />
          </div>
        </div>
      </div>

      {/* SIZE WISE TRIMMING */}
      <div className="trim-card">
        <h3>Size-wise Trimming Quantity</h3>

        <table className="trim-table">
          <thead>
            <tr>
              <th>Size</th>
              <th>Received Qty</th>
              <th>Trimmed Qty</th>
              <th>Rejected Qty</th>
              <th>Balance</th>
            </tr>
          </thead>

          <tbody>
            {["S", "M", "L", "XL"].map((size) => (
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

      {/* TRIMMING OPERATIONS */}
      <div className="trim-card">
        <h3>Trimming Operations Checklist</h3>

        <div className="checkbox-grid">
          <label><input type="checkbox" /> Thread cutting</label>
          <label><input type="checkbox" /> Button checking</label>
          <label><input type="checkbox" /> Label fixing</label>
          <label><input type="checkbox" /> Loose stitch removal</label>
          <label><input type="checkbox" /> Garment cleaning</label>
          <label><input type="checkbox" /> Iron touch-up</label>
        </div>
      </div>

      {/* DEFECTS & REMARKS */}
      <div className="trim-card">
        <h3>Defects & Remarks</h3>

        <textarea
          placeholder="Mention defects, rework notes, or quality issues..."
          value={defects}
          onChange={(e) => setDefects(e.target.value)}
        />

        <div className="trim-actions">
          <button className="save-btn">Save Trimming</button>
          <button className="next-btn">Move to Finishing</button>
        </div>
      </div>
    </MainLayout>
  );
}
