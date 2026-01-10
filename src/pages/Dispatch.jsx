import MainLayout from "../layout/MainLayout";
import PageHeader from "../components/PageHeader";
import "./Dispatch.css";
import { useState } from "react";

const SIZES = ["S", "M", "L", "XL"];

export default function Dispatch() {
  const [remarks, setRemarks] = useState("");

  return (
    <MainLayout>
      <PageHeader title="Dispatch Department" company="Pushpa Textile" />

      {/* ORDER & BUYER INFO */}
      <div className="dispatch-card">
        <h3>Order & Buyer Information</h3>

        <div className="dispatch-grid">
          <div>
            <label>Order No</label>
            <input placeholder="ORD-1001" />
          </div>

          <div>
            <label>Buyer Name</label>
            <input placeholder="ABC Exports" />
          </div>

          <div>
            <label>Style Name</label>
            <input placeholder="Men Shirt – Slim Fit" />
          </div>

          <div>
            <label>Dispatch Date</label>
            <input type="date" />
          </div>
        </div>
      </div>

      {/* SIZE WISE DISPATCH */}
      <div className="dispatch-card">
        <h3>Size-wise Dispatch Quantity</h3>

        <table className="dispatch-table">
          <thead>
            <tr>
              <th>Size</th>
              <th>Ready Qty</th>
              <th>Dispatched Qty</th>
              <th>Balance</th>
            </tr>
          </thead>

          <tbody>
            {SIZES.map((size) => (
              <tr key={size}>
                <td>{size}</td>
                <td><input /></td>
                <td><input /></td>
                <td><input disabled /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* PACKING DETAILS */}
      <div className="dispatch-card">
        <h3>Packing Details</h3>

        <div className="dispatch-grid">
          <div>
            <label>No of Cartons</label>
            <input type="number" />
          </div>

          <div>
            <label>Packing Type</label>
            <input placeholder="Polybags / Boxes" />
          </div>

          <div>
            <label>Gross Weight (kg)</label>
            <input />
          </div>

          <div>
            <label>Net Weight (kg)</label>
            <input />
          </div>
        </div>
      </div>

      {/* TRANSPORT DETAILS */}
      <div className="dispatch-card">
        <h3>Transport Details</h3>

        <div className="dispatch-grid">
          <div>
            <label>Transporter Name</label>
            <input placeholder="XYZ Logistics" />
          </div>

          <div>
            <label>Vehicle No</label>
            <input placeholder="MH12 AB 1234" />
          </div>

          <div>
            <label>LR / Tracking No</label>
            <input />
          </div>

          <div>
            <label>Invoice No</label>
            <input />
          </div>
        </div>
      </div>

      {/* DISPATCH CHECKLIST */}
      <div className="dispatch-card">
        <h3>Dispatch Checklist</h3>

        <div className="checkbox-grid">
          <label><input type="checkbox" /> Packing completed</label>
          <label><input type="checkbox" /> Size ratio verified</label>
          <label><input type="checkbox" /> Invoice generated</label>
          <label><input type="checkbox" /> Labels attached</label>
          <label><input type="checkbox" /> Buyer instructions followed</label>
        </div>
      </div>

      {/* REMARKS & ACTION */}
      <div className="dispatch-card">
        <h3>Remarks & Final Status</h3>

        <textarea
          placeholder="Dispatch remarks, delivery notes, issues if any..."
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
        />

        <div className="dispatch-actions">
          <button className="save-btn">Save Dispatch</button>
          <button className="complete-btn">Complete Order</button>
        </div>
      </div>
    </MainLayout>
  );
}
