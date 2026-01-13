import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import MainLayout from "../layout/MainLayout";
import PageHeader from "../components/PageHeader";
import "./Pressing.css";
import { useNavigate } from "react-router-dom";

const SIZES = ["S", "M", "L", "XL"];

const CHECKLIST = [
  "Proper crease",
  "No shine marks",
  "Collar pressed",
  "Sleeve pressed",
  "Button safe",
  "Final appearance OK",
];

export default function Pressing() {
  const navigate = useNavigate();

  /* ================= ORDER LIST ================= */
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);

  /* ================= HEADER ================= */
  const [orderNo, setOrderNo] = useState("");
  const [styleName, setStyleName] = useState("");
  const [garmentType, setGarmentType] = useState("");
  const [pressingDate, setPressingDate] = useState("");
  const [remarks, setRemarks] = useState("");

  /* ================= SIZE QTY ================= */
  const [sizeRows, setSizeRows] = useState([]);

  /* ================= CHECKLIST ================= */
  const [checklist, setChecklist] = useState(
    CHECKLIST.map((c) => ({ item: c, checked: false }))
  );

  /* =====================================================
     LOAD ORDERS FOR PRESSING (FROM TRIMMING)
  ===================================================== */
  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    const { data } = await supabase
      .from("orders")
      .select("*")
      .eq("stage", "TRIMMING_DONE")
      .order("created_at", { ascending: false });

    setOrders(data || []);
  };

  /* =====================================================
     OPEN ORDER → AUTO LOAD DATA
  ===================================================== */
  const openOrder = async (order) => {
    setSelectedOrder(order);

    setOrderNo(order.invoice_no);
    setStyleName(order.company_name || "");
    setGarmentType("");
    setPressingDate(new Date().toISOString().split("T")[0]);

    /* LOAD TRIMMING DATA */
    const { data: trimData } = await supabase
      .from("trimming_production")
      .select("size, trimmed_qty")
      .eq("order_id", order.id);

    const rows = SIZES.map((s) => {
      const found = trimData?.find((t) => t.size === s);
      const qty = found ? Number(found.trimmed_qty) : 0;

      return {
        size: s,
        received_qty: qty,
        pressed_qty: qty,
        repress_qty: 0,
      };
    });

    setSizeRows(rows);
  };

  /* =====================================================
     SAVE PRESSING
  ===================================================== */
  const savePressing = async () => {
    if (!selectedOrder) return;

    try {
      /* HEADER */
      const { data: header } = await supabase
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

      /* SIZE QTY */
      await supabase.from("pressing_sizes").insert(
        sizeRows.map((r) => ({
          pressing_id: header.id,
          size: r.size,
          received_qty: r.received_qty,
          pressed_qty: r.pressed_qty,
          repress_qty: r.repress_qty,
          balance_qty:
            r.received_qty - r.pressed_qty - r.repress_qty,
        }))
      );

      /* CHECKLIST */
      await supabase.from("pressing_checklist").insert(
        checklist.map((c) => ({
          pressing_id: header.id,
          item: c.item,
          checked: c.checked,
        }))
      );

      /* UPDATE ORDER STAGE */
      await supabase
        .from("orders")
        .update({ stage: "PRESSING_DONE" })
        .eq("id", selectedOrder.id);

      alert("✅ Pressing completed");
      navigate("/dispatch");
    } catch (err) {
      console.error(err);
      alert("❌ Failed to save pressing");
    }
  };

  return (
    <MainLayout>
      <PageHeader title="Pressing Department" company="Pushpa Textile" />

      {/* ================= ORDER LIST ================= */}
      {!selectedOrder && (
        <div className="card">
          <h3>Orders for Pressing</h3>

          <table className="order-table">
            <thead>
              <tr>
                <th>Order No</th>
                <th>Company</th>
                <th>Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id}>
                  <td>{o.invoice_no}</td>
                  <td>{o.company_name}</td>
                  <td>{o.order_date}</td>
                  <td>
                    <button onClick={() => openOrder(o)}>Open</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {orders.length === 0 && (
            <p style={{ textAlign: "center" }}>
              ✅ No pending pressing orders
            </p>
          )}
        </div>
      )}

      {/* ================= PRESSING FORM ================= */}
      {selectedOrder && (
        <>
          <div className="press-card">
            <h3>Order Information</h3>
            <div className="press-grid">
              <input value={orderNo} disabled />
              <input value={styleName} onChange={(e) => setStyleName(e.target.value)} />
              <input placeholder="Garment Type" value={garmentType} onChange={(e) => setGarmentType(e.target.value)} />
              <input type="date" value={pressingDate} onChange={(e) => setPressingDate(e.target.value)} />
            </div>
          </div>

          <div className="press-card">
            <h3>Size-wise Pressing</h3>
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
                            copy[i][f] = Number(e.target.value);
                            setSizeRows(copy);
                          }}
                        />
                      </td>
                    ))}
                    <td>
                      {r.received_qty - r.pressed_qty - r.repress_qty}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

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
        </>
      )}
    </MainLayout>
  );
}
