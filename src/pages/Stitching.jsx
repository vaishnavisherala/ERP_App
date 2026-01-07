import MainLayout from "../layout/MainLayout";
import PageHeader from "../components/PageHeader";
import "./Stitching.css";
import { useState } from "react";

const COMMON_OPERATIONS = [
  "Side seam",
  "Armhole top stitch",
  "Shoulder join",
  "Shoulder top stitch",
  "Button attach",
  "Button hole",
  "Bottom hem",
  "Final inspection"
];

const SHIRT_OPERATIONS = [
  "Neck band top stitch",
  "Collar making",
  "Collar attach",
  "Cuff attach",
  "Cuff finish",
  "Sleeve attach",
  "Front placket making",
  "Pocket attach"
];

const PANT_OPERATIONS = [
  "Back dart making",
  "Back pocket making",
  "Front pocket making",
  "Fly & zipper attach",
  "Inseam attach",
  "Outseam attach",
  "Waist band attach",
  "Belt loop attach"
];

export default function Stitching() {
  const [garment, setGarment] = useState("Shirt");

  const operations =
    garment === "Shirt"
      ? [...COMMON_OPERATIONS, ...SHIRT_OPERATIONS]
      : [...COMMON_OPERATIONS, ...PANT_OPERATIONS];

  return (
    <MainLayout>
      <PageHeader title="Stitching Department" company="Pushpa Textile" />

      {/* GARMENT SELECT */}
      <div className="stitching-card">
        <label>Garment Type</label>
        <select
          value={garment}
          onChange={(e) => setGarment(e.target.value)}
        >
          <option value="Shirt">Shirt</option>
          <option value="Pant">Pant</option>
        </select>
      </div>

      {/* OPERATIONS TABLE */}
      <div className="stitching-card">
        <h3>{garment} Stitching Operations</h3>

        <table className="stitching-table">
          <thead>
            <tr>
              <th>Sr No</th>
              <th>Operation</th>
              <th>Target</th>
              <th>Rate</th>
              <th>Total</th>
            </tr>
          </thead>

          <tbody>
            {operations.map((op, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>{op}</td>
                <td><input type="number" /></td>
                <td><input type="number" step="0.01" /></td>
                <td><input type="number" disabled /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ACTIONS */}
      <div className="stitching-actions">
        <button className="save-btn">Save Stitching Data</button>
        <button className="next-btn">Move to Trimming</button>
      </div>
    </MainLayout>
  );
}
