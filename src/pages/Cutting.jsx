import { useState } from "react";
import MainLayout from "../layout/MainLayout";
import PageHeader from "../components/PageHeader";
import { supabase } from "../supabaseClient";
import "./Cutting.css";

const SIZES = ["S", "M", "L", "XL"];
const ACCESSORIES = ["Buttons", "Zipper", "Labels", "Interlining"];

export default function Cutting() {
  const [orderInfo, setOrderInfo] = useState({
    order_no: "",
    style_name: "",
    fabric_type: "",
    fabric_color: "",
  });

  const [plan, setPlan] = useState({
    no_of_layers: "",
    marker_length: "",
    fabric_consumption: "",
    cutting_date: "",
  });

  const [sizes, setSizes] = useState(
    SIZES.map((s) => ({
      size: s,
      planned: "",
      cut: "",
      balance: "",
    }))
  );

  const [accessories, setAccessories] = useState(
    ACCESSORIES.map((a) => ({ name: a, checked: false }))
  );

  const [remarks, setRemarks] = useState("");

  /* SAVE CUTTING */
  const saveCutting = async () => {
    try {
      /* 1️⃣ CUTTING MASTER */
      const { data: cuttingData, error } = await supabase
        .from("cutting")
        .insert([
          {
            order_no: orderInfo.order_no,
            style_name: orderInfo.style_name,
            fabric_type: orderInfo.fabric_type,
            fabric_color: orderInfo.fabric_color,
            no_of_layers: plan.no_of_layers,
            marker_length: plan.marker_length,
            fabric_consumption: plan.fabric_consumption,
            cutting_date: plan.cutting_date,
            remarks,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      const cuttingId = cuttingData.id;

      /* 2️⃣ SIZE WISE DATA */
      await supabase.from("cutting_sizes").insert(
        sizes.map((s) => ({
          cutting_id: cuttingId,
          size: s.size,
          planned_qty: s.planned,
          cut_qty: s.cut,
          balance_qty: s.balance,
        }))
      );

      /* 3️⃣ ACCESSORIES */
      await supabase.from("cutting_accessories").insert(
        accessories.map((a) => ({
          cutting_id: cuttingId,
          accessory_name: a.name,
          is_available: a.checked,
        }))
      );

      alert("✅ Cutting saved successfully");
    } catch (err) {
      console.error(err);
      alert("❌ Failed to save cutting");
    }
  };

  return (
    <MainLayout>
      <PageHeader title="Cutting Department" company="Pushpa Textile" />

      {/* ORDER INFO */}
      <div className="cutting-card">
        <h3>Order Information</h3>
        <div className="cutting-grid">
          <input placeholder="Order No" onChange={(e) => setOrderInfo({ ...orderInfo, order_no: e.target.value })} />
          <input placeholder="Style Name" onChange={(e) => setOrderInfo({ ...orderInfo, style_name: e.target.value })} />
          <input placeholder="Fabric Type" onChange={(e) => setOrderInfo({ ...orderInfo, fabric_type: e.target.value })} />
          <input placeholder="Fabric Color" onChange={(e) => setOrderInfo({ ...orderInfo, fabric_color: e.target.value })} />
        </div>
      </div>

      {/* CUTTING PLAN */}
      <div className="cutting-card">
        <h3>Cutting Plan</h3>
        <div className="cutting-grid">
          <input type="number" placeholder="No of Layers" onChange={(e) => setPlan({ ...plan, no_of_layers: e.target.value })} />
          <input placeholder="Marker Length" onChange={(e) => setPlan({ ...plan, marker_length: e.target.value })} />
          <input placeholder="Fabric Consumption" onChange={(e) => setPlan({ ...plan, fabric_consumption: e.target.value })} />
          <input type="date" onChange={(e) => setPlan({ ...plan, cutting_date: e.target.value })} />
        </div>
      </div>

      {/* SIZE TABLE */}
      <div className="cutting-card">
        <h3>Size-wise Cutting Quantity</h3>
        <table className="cutting-table">
          <thead>
            <tr>
              <th>Size</th>
              <th>Planned</th>
              <th>Cut</th>
              <th>Balance</th>
            </tr>
          </thead>
          <tbody>
            {sizes.map((s, i) => (
              <tr key={i}>
                <td>{s.size}</td>
                <td><input onChange={(e) => {
                  const copy = [...sizes];
                  copy[i].planned = e.target.value;
                  setSizes(copy);
                }} /></td>
                <td><input onChange={(e) => {
                  const copy = [...sizes];
                  copy[i].cut = e.target.value;
                  copy[i].balance = copy[i].planned - copy[i].cut;
                  setSizes(copy);
                }} /></td>
                <td><input value={s.balance} disabled /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ACCESSORIES */}
      <div className="cutting-card">
        <h3>Accessories Check</h3>
        <div className="checkbox-grid">
          {accessories.map((a, i) => (
            <label key={i}>
              <input
                type="checkbox"
                checked={a.checked}
                onChange={() => {
                  const copy = [...accessories];
                  copy[i].checked = !copy[i].checked;
                  setAccessories(copy);
                }}
              />
              {a.name}
            </label>
          ))}
        </div>
      </div>

      {/* REMARKS */}
      <div className="cutting-card">
        <h3>Status & Remarks</h3>
        <textarea onChange={(e) => setRemarks(e.target.value)} />
        <div className="action-row">
          <button className="save-btn" onClick={saveCutting}>Save Cutting</button>
          <button className="next-btn">Move to Stitching</button>
        </div>
      </div>
    </MainLayout>
  );
}
