import MainLayout from "../layout/MainLayout";
import PageHeader from "../components/PageHeader";
import "./Cutting.css";

export default function Cutting() {
  return (
    <MainLayout>
      <PageHeader title="Cutting Department" company="Pushpa Textile" />

      {/* ORDER INFO */}
      <div className="cutting-card">
        <h3>Order Information</h3>

        <div className="cutting-grid">
          <div>
            <label>Order No</label>
            <input placeholder="ORD-1001" />
          </div>

          <div>
            <label>Style Name</label>
            <input placeholder="Men Shirt – Slim Fit" />
          </div>

          <div>
            <label>Fabric Type</label>
            <input placeholder="Cotton Twill" />
          </div>

          <div>
            <label>Fabric Color</label>
            <input placeholder="Navy Blue" />
          </div>
        </div>
      </div>

      {/* CUTTING PLAN */}
      <div className="cutting-card">
        <h3>Cutting Plan</h3>

        <div className="cutting-grid">
          <div>
            <label>No of Layers</label>
            <input type="number" placeholder="50" />
          </div>

          <div>
            <label>Marker Length (m)</label>
            <input placeholder="8.5" />
          </div>

          <div>
            <label>Fabric Consumption</label>
            <input placeholder="1.8 m / pc" />
          </div>

          <div>
            <label>Cutting Date</label>
            <input type="date" />
          </div>
        </div>
      </div>

      {/* SIZE WISE CUTTING */}
      <div className="cutting-card">
        <h3>Size-wise Cutting Quantity</h3>

        <table className="cutting-table">
          <thead>
            <tr>
              <th>Size</th>
              <th>Planned Qty</th>
              <th>Cut Qty</th>
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
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ACCESSORIES */}
      <div className="cutting-card">
        <h3>Accessories Check</h3>

        <div className="checkbox-grid">
          <label><input type="checkbox" /> Buttons</label>
          <label><input type="checkbox" /> Zipper</label>
          <label><input type="checkbox" /> Labels</label>
          <label><input type="checkbox" /> Interlining</label>
        </div>
      </div>

      {/* REMARKS & STATUS */}
      <div className="cutting-card">
        <h3>Status & Remarks</h3>

        <textarea placeholder="Any cutting remarks, wastage notes, issues..." />

        <div className="action-row">
          <button className="save-btn">Save Cutting</button>
          <button className="next-btn">Move to Stitching</button>
        </div>
      </div>
    </MainLayout>
  );
}
