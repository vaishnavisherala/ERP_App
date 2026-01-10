import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import MainLayout from "../layout/MainLayout";
import PageHeader from "../components/PageHeader";
import "./Cutting.css";

export default function Stitching() {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const [orderItems, setOrderItems] = useState([]);
  const [operations, setOperations] = useState([]);

  const [sizes, setSizes] = useState([]);
  const [opMatrix, setOpMatrix] = useState({});

  const [stitchingRows, setStitchingRows] = useState([]);

  /* ================= LOAD ORDERS ================= */
  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    const { data } = await supabase
      .from("orders")
      .select("*")
      .eq("stage", "CUTTING_DONE")
      .order("created_at", { ascending: false });

    setOrders(data || []);
  };

  /* ================= OPEN ORDER ================= */
  const openOrder = async (order) => {
    setSelectedOrder(order);

    /* ORDER ITEMS */
    const { data: items } = await supabase
      .from("order_items")
      .select("product_name, size, quantity")
      .eq("order_id", order.id);

    setOrderItems(items || []);

    /* UNIQUE SIZES */
    const uniqueSizes = [...new Set(items.map((i) => i.size))];
    setSizes(uniqueSizes);

    /* STITCHING INPUT TABLE */
    setStitchingRows(
      items.map((i) => ({
        product_name: i.product_name,
        size: i.size,
        ordered_qty: i.quantity,
        stitched_qty: "",
      }))
    );

    /* CUTTING OPERATIONS */
    const { data: ops } = await supabase
      .from("order_operations")
      .select("*")
      .eq("order_id", order.id);

    setOperations(ops || []);
    buildOperationMatrix(ops || [], uniqueSizes);
  };

  /* ================= BUILD OPERATION MATRIX ================= */
  const buildOperationMatrix = (ops, sizes) => {
    const temp = {};
    ops.forEach((o) => {
      if (!temp[o.operation_name]) temp[o.operation_name] = {};
      temp[o.operation_name][o.size] = o.qty;
    });
    setOpMatrix(temp);
  };

  /* ================= UPDATE STITCHING QTY ================= */
  const updateStitchQty = (index, value) => {
    const copy = [...stitchingRows];
    copy[index].stitched_qty = value;
    setStitchingRows(copy);
  };

  /* ================= SAVE STITCHING ================= */
const saveStitching = async () => {
  if (!selectedOrder) return;

  try {
    /* 1️⃣ PREPARE ROWS */
    const rows = stitchingRows.map((r) => ({
      order_id: selectedOrder.id,
      product_name: r.product_name,
      size: r.size,
      ordered_qty: Number(r.ordered_qty),
      stitched_qty: Number(r.stitched_qty || 0),
    }));

    /* 2️⃣ DELETE OLD STITCHING (AVOID DUPLICATE) */
    const { error: deleteErr } = await supabase
      .from("stitching_production")
      .delete()
      .eq("order_id", selectedOrder.id);

    if (deleteErr) throw deleteErr;

    /* 3️⃣ INSERT NEW STITCHING DATA */
    const { error: insertErr } = await supabase
      .from("stitching_production")
      .insert(rows);

    if (insertErr) throw insertErr;

    /* 4️⃣ UPDATE ORDER STAGE */
    const { error: stageErr } = await supabase
      .from("orders")
      .update({ stage: "STITCHING_DONE" })
      .eq("id", selectedOrder.id);

    if (stageErr) throw stageErr;

    alert("✅ Stitching saved & stage updated");

    /* 5️⃣ RESET PAGE */
    setSelectedOrder(null);
    loadOrders();

  } catch (err) {
    console.error(err);
    alert("❌ Failed to save stitching");
  }
};


  return (
    <MainLayout>
      <PageHeader title="Stitching" company="Pushpa Textile" />

      {/* ================= ORDER LIST ================= */}
      {!selectedOrder && (
        <div className="card">
          <h3>Orders for Stitching</h3>

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
        </div>
      )}

      {/* ================= ORDER VIEW ================= */}
      {selectedOrder && (
        <>
          <div className="card">
            <b>Order:</b> {selectedOrder.invoice_no} |{" "}
            {selectedOrder.company_name}
          </div>

          {/* ================= ORDER ITEMS ================= */}
          <div className="card">
            <h3>Order Details</h3>
            <table className="order-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Size</th>
                  <th>Qty</th>
                </tr>
              </thead>
              <tbody>
                {orderItems.map((i, idx) => (
                  <tr key={idx}>
                    <td>{i.product_name}</td>
                    <td>{i.size}</td>
                    <td>{i.quantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ================= CUTTING OPERATIONS (REFERENCE) ================= */}
          <div className="card">
            <h3>Cutting Operations (Reference)</h3>

            <table className="order-table">
              <thead>
                <tr>
                  <th>Sr</th>
                  <th>Operation</th>
                  {sizes.map((s) => (
                    <th key={s}>{s}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Object.keys(opMatrix).map((op, i) => (
                  <tr key={op}>
                    <td>{i + 1}</td>
                    <td>{op}</td>
                    {sizes.map((s) => (
                      <td key={s}>{opMatrix[op]?.[s] || "-"}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ================= STITCHING PRODUCTION ================= */}
          <div className="card">
            <h3>Stitching Production</h3>

            <table className="order-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Size</th>
                  <th>Ordered Qty</th>
                  <th>Stitched Qty</th>
                </tr>
              </thead>
              <tbody>
                {stitchingRows.map((r, i) => (
                  <tr key={i}>
                    <td>{r.product_name}</td>
                    <td>{r.size}</td>
                    <td>{r.ordered_qty}</td>
                    <td>
                      <input
                        type="number"
                        value={r.stitched_qty}
                        onChange={(e) =>
                          updateStitchQty(i, e.target.value)
                        }
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <button className="save-btn" onClick={saveStitching}>
              Save Stitching
            </button>
          </div>
        </>
      )}
    </MainLayout>
  );
}
