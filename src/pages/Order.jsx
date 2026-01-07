import { useState } from "react";
import MainLayout from "../layout/MainLayout";
import PageHeader from "../components/PageHeader";
import "./Order.css";

const MEASUREMENTS = ["Shoulder", "Chest", "Waist", "Hem", "Length", "Sleeve"];

export default function Order() {
  const [image, setImage] = useState(null);
  const [zoom, setZoom] = useState(1);

  const [items, setItems] = useState([
    { size: "S", pcs: "", fabric: "", color: "", instruction: "" },
  ]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) setImage(URL.createObjectURL(file));
  };

  const addItem = () => {
    setItems([...items, { size: "", pcs: "", fabric: "", color: "", instruction: "" }]);
  };

  const deleteItem = (i) => {
    setItems(items.filter((_, index) => index !== i));
  };

  return (
    <MainLayout>
      <PageHeader title="Order Page" company="Pushpa Textile" />

      {/* PRODUCT NAME */}
      <input className="product-input" placeholder="Enter Product Name" />

      <div className="order-top">
        {/* IMAGE */}
        <div className="image-section">
          <div className="image-box">
            {image ? (
              <img
                src={image}
                alt="preview"
                style={{ transform: `scale(${zoom})` }}
              />
            ) : (
              <label>
                Select Image
                <input type="file" hidden onChange={handleImageChange} />
              </label>
            )}
          </div>

          <div className="zoom-controls">
            <button onClick={() => setZoom(z => Math.min(z + 0.1, 2))}>＋</button>
            <button onClick={() => setZoom(z => Math.max(z - 0.1, 0.5))}>－</button>
          </div>
        </div>

        {/* SIZE ITEMS */}
        <div className="items-box">
          <div className="items-header">
            <span>Size</span>
            <span>Pieces</span>
            <span>Fabric</span>
            <span>Color</span>
            <span>Instruction</span>
            <span>Action</span>
          </div>

          {items.map((item, i) => (
            <div className="items-row" key={i}>
              <input
                value={item.size}
                onChange={(e) => {
                  const copy = [...items];
                  copy[i].size = e.target.value;
                  setItems(copy);
                }}
              />
              <input />
              <input />
              <input />
              <input />
              <button className="delete-btn" onClick={() => deleteItem(i)}>✕</button>
            </div>
          ))}

          <button className="add-btn" onClick={addItem}>
            + Add More Items
          </button>
        </div>
      </div>

      {/* MEASUREMENT TABLE */}
      <div className="measurement-box">
        <h3>Measurement Chart</h3>

        <table>
          <thead>
            <tr>
              <th>Size</th>
              {items.filter(i => i.size).map((item, i) => (
                <th key={i}>{item.size}</th>
              ))}
            </tr>
          </thead>

          <tbody>
            {MEASUREMENTS.map((m, i) => (
              <tr key={i}>
                <td>{m}</td>
                {items.filter(i => i.size).map((_, j) => (
                  <td key={j}>
                    <input />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </MainLayout>
  );
}
