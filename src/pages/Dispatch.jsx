import MainLayout from "../layout/MainLayout";
import PageHeader from "../components/PageHeader";
import "./Dispatch.css";
import { useState } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";

const SIZES = ["S", "M", "L", "XL"];

const CHECKLIST = [
  "Packing completed",
  "Size ratio verified",
  "Invoice generated",
  "Labels attached",
  "Buyer instructions followed",
];

export default function Dispatch() {
  const navigate = useNavigate();

  /* ================= HEADER ================= */
  const [orderNo, setOrderNo] = useState("");
  const [buyerName, setBuyerName] = useState("");
  const [styleName, setStyleName] = useState("");
  const [dispatchDate, setDispatchDate] = useState("");
  const [remarks, setRemarks] = useState("");

  /* ================= SIZE QTY ================= */
  const [sizeRows, setSizeRows] = useState(
    SIZES.map((s) => ({
      size: s,
      ready_qty: "",
      dispatched_qty: "",
    }))
  );

  /* ================= PACKING ================= */
  const [noOfCartons, setNoOfCartons] = useState("");
  const [packingType, setPackingType] = useState("");
  const [grossWeight, setGrossWeight] = useState("");
  const [netWeight, setNetWeight] = useState("");

  /* ================= TRANSPORT ================= */
  const [transporterName, setTransporterName] = useState("");
  const [vehicleNo, setVehicleNo] = useState("");
  const [lrNo, setLrNo] = useState("");
  const [invoiceNo, setInvoiceNo] = useState("");

  /* ================= CHECKLIST ================= */
  const [checklist, setChecklist] = useState(
    CHECKLIST.map((c) => ({ item: c, checked: false }))
  );

  /* =====================================================
     SAVE DISPATCH
  ===================================================== */
  const saveDispatch = async (complete = false) => {
    try {
      /* 1️⃣ HEADER */
      const { data: header, error: hErr } = await supabase
        .from("dispatch_header")
        .insert({
          order_no: orderNo,
          buyer_name: buyerName,
          style_name: styleName,
          dispatch_date: dispatchDate,
          remarks,
        })
        .select()
        .single();

      if (hErr) throw hErr;

      /* 2️⃣ SIZE QTY */
      await supabase.from("dispatch_sizes").insert(
        sizeRows.map((r) => ({
          dispatch_id: header.id,
          size: r.size,
          ready_qty: Number(r.ready_qty || 0),
          dispatched_qty: Number(r.dispatched_qty || 0),
          balance_qty:
            Number(r.ready_qty || 0) - Number(r.dispatched_qty || 0),
        }))
      );

      /* 3️⃣ PACKING */
      await supabase.from("dispatch_packing").insert({
        dispatch_id: header.id,
        no_of_cartons: Number(noOfCartons || 0),
        packing_type: packingType,
        gross_weight: Number(grossWeight || 0),
        net_weight: Number(netWeight || 0),
      });

      /* 4️⃣ TRANSPORT */
      await supabase.from("dispatch_transport").insert({
        dispatch_id: header.id,
        transporter_name: transporterName,
        vehicle_no: vehicleNo,
        lr_no: lrNo,
        invoice_no: invoiceNo,
      });

      /* 5️⃣ CHECKLIST */
      await supabase.from("dispatch_checklist").insert(
        checklist.map((c) => ({
          dispatch_id: header.id,
          item: c.item,
          checked: c.checked,
        }))
      );

      /* 6️⃣ UPDATE ORDER STAGE (OPTIONAL COMPLETE) */
      if (complete) {
        await supabase
          .from("orders")
          .update({ stage: "DISPATCH_DONE" })
          .eq("invoice_no", orderNo);
      }

      alert(complete ? "✅ Order Dispatched Successfully" : "✅ Dispatch Saved");

      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      alert("❌ Failed to save dispatch");
    }
  };

  return (
    <MainLayout>
      <PageHeader title="Dispatch Department" company="Pushpa Textile" />

      {/* ================= ORDER & BUYER ================= */}
      <div className="dispatch-card">
        <h3>Order & Buyer Information</h3>
        <div className="dispatch-grid">
          <input placeholder="Order No" value={orderNo} onChange={(e) => setOrderNo(e.target.value)} />
          <input placeholder="Buyer Name" value={buyerName} onChange={(e) => setBuyerName(e.target.value)} />
          <input placeholder="Style Name" value={styleName} onChange={(e) => setStyleName(e.target.value)} />
          <input type="date" value={dispatchDate} onChange={(e) => setDispatchDate(e.target.value)} />
        </div>
      </div>

      {/* ================= SIZE QTY ================= */}
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
            {sizeRows.map((r, i) => (
              <tr key={r.size}>
                <td>{r.size}</td>
                <td>
                  <input
                    type="number"
                    value={r.ready_qty}
                    onChange={(e) => {
                      const copy = [...sizeRows];
                      copy[i].ready_qty = e.target.value;
                      setSizeRows(copy);
                    }}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    value={r.dispatched_qty}
                    onChange={(e) => {
                      const copy = [...sizeRows];
                      copy[i].dispatched_qty = e.target.value;
                      setSizeRows(copy);
                    }}
                  />
                </td>
                <td>{(r.ready_qty || 0) - (r.dispatched_qty || 0)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ================= PACKING ================= */}
      <div className="dispatch-card">
        <h3>Packing Details</h3>
        <div className="dispatch-grid">
          <input type="number" placeholder="No of Cartons" value={noOfCartons} onChange={(e) => setNoOfCartons(e.target.value)} />
          <input placeholder="Packing Type" value={packingType} onChange={(e) => setPackingType(e.target.value)} />
          <input placeholder="Gross Weight" value={grossWeight} onChange={(e) => setGrossWeight(e.target.value)} />
          <input placeholder="Net Weight" value={netWeight} onChange={(e) => setNetWeight(e.target.value)} />
        </div>
      </div>

      {/* ================= TRANSPORT ================= */}
      <div className="dispatch-card">
        <h3>Transport Details</h3>
        <div className="dispatch-grid">
          <input placeholder="Transporter Name" value={transporterName} onChange={(e) => setTransporterName(e.target.value)} />
          <input placeholder="Vehicle No" value={vehicleNo} onChange={(e) => setVehicleNo(e.target.value)} />
          <input placeholder="LR / Tracking No" value={lrNo} onChange={(e) => setLrNo(e.target.value)} />
          <input placeholder="Invoice No" value={invoiceNo} onChange={(e) => setInvoiceNo(e.target.value)} />
        </div>
      </div>

      {/* ================= CHECKLIST ================= */}
      <div className="dispatch-card">
        <h3>Dispatch Checklist</h3>
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

      {/* ================= ACTIONS ================= */}
      <div className="dispatch-card">
        <textarea
          placeholder="Dispatch remarks..."
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
        />

        <div className="dispatch-actions">
          <button className="save-btn" onClick={() => saveDispatch(false)}>
            Save Dispatch
          </button>
          <button className="complete-btn" onClick={() => saveDispatch(true)}>
            Complete Order
          </button>
        </div>
      </div>
    </MainLayout>
  );
}
