import MainLayout from "../layout/MainLayout";
import PageHeader from "../components/PageHeader";
import "./Stock.css";
import { useState } from "react";

export default function Stock() {
  const [activeTab, setActiveTab] = useState("raw");

  return (
    <MainLayout>
      <PageHeader title="Stock & Inventory Department" company="Pushpa Textile" />

      {/* TAB SWITCH */}
      <div className="stock-tabs">
        <button
          className={activeTab === "raw" ? "active" : ""}
          onClick={() => setActiveTab("raw")}
        >
          Raw Material Stock
        </button>

        <button
          className={activeTab === "finished" ? "active" : ""}
          onClick={() => setActiveTab("finished")}
        >
          Finished Goods Stock
        </button>
      </div>

      {activeTab === "raw" && <RawMaterialStock />}
      {activeTab === "finished" && <FinishedGoodsStock />}
    </MainLayout>
  );
}

/* RAW MATERIAL STOCK */
function RawMaterialStock() {
  return (
    <div className="stock-card">
      <h3>Raw Material Stock</h3>

      <table className="stock-table">
        <thead>
          <tr>
            <th>Item Name</th>
            <th>Category</th>
            <th>Available Qty</th>
            <th>Unit</th>
            <th>Issue Qty</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          <tr>
            <td>Cotton Fabric</td>
            <td>Fabric</td>
            <td>1200</td>
            <td>Meter</td>
            <td><input /></td>
            <td><button className="issue-btn">Issue</button></td>
          </tr>

          <tr>
            <td>Buttons</td>
            <td>Trim</td>
            <td>5000</td>
            <td>Nos</td>
            <td><input /></td>
            <td><button className="issue-btn">Issue</button></td>
          </tr>

          <tr>
            <td>Zipper</td>
            <td>Trim</td>
            <td>2000</td>
            <td>Nos</td>
            <td><input /></td>
            <td><button className="issue-btn">Issue</button></td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

/* FINISHED GOODS STOCK */
function FinishedGoodsStock() {
  return (
    <div className="stock-card">
      <h3>Finished Goods Stock</h3>

      <table className="stock-table">
        <thead>
          <tr>
            <th>Product</th>
            <th>Size</th>
            <th>Available Qty</th>
            <th>Reserved</th>
            <th>Dispatch Qty</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {["S", "M", "L", "XL"].map((size) => (
            <tr key={size}>
              <td>Men Shirt</td>
              <td>{size}</td>
              <td>250</td>
              <td>40</td>
              <td><input /></td>
              <td>
                <button className="dispatch-btn">Dispatch</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
