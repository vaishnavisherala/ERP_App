import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import MainLayout from "../layout/MainLayout";
import PageHeader from "../components/PageHeader";
import "./Cutting.css"; // reuse same CSS

export default function Trimming() {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const [orderItems, setOrderItems] = useState([]);
  const [stitchingData, setStitchingData] = useState([]);
  const [trimmingRows, setTrimmingRows] = useState([]);

  /* ================= LOAD ORDERS FOR TRIMMING ================= */
  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("stage", "STITCHING_DONE")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      return;
    }

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

    /* STITCHING PRODUCTION (REFERENCE) */
    const { data: stitch } = await supabase
      .from("stitching_production")
      .select("*")
      .eq("order_id", order.id);

    setStitchingData(stitch || []);

    /* BUILD TRIMMING INPUT ROWS */
    const rows =
      stitch?.map((s) => ({
        product_name: s.product_name,
        size: s.size,
        ordered_qty: s.ordered_qty,
        stitched_qty: s.stitched_qty,
        trimmed_qty: s.stitched_qty, // default editable value
      })) || [];

    setTrimmingRows(rows);
  };

  /* ================= UPDATE INPUT ================= */
  const updateTrimQty = (index, value) => {
    const copy = [...trimmingRows];
    copy[index].trimmed_qty = value;
    setTrimmingRows(copy);
  };

  /* ================= SAVE TRIMMING ================= */
  const saveTrimming = async () => {
    if (!selectedOrder) return;

    /* DELETE OLD (SAFE RE-SAVE) */
    await supabase
      .from("trimming_production")
      .delete()
      .eq("order_id", selectedOrder.id);

    /* INSERT NEW */
    const payload = trimmingRows.map((r) => ({
      order_id: selectedOrder.id,
      product_name: r.product_name,
      size: r.size,
      ordered_qty: r.ordered_qty,
      stitched_qty: r.stitched_qty,
      trimmed_qty: Number(r.trimmed_qty || 0),
    }));

    const { error } = await supabase
      .from("trimming_production")
      .insert(payload);

    if (error) {
      alert("❌ Failed to save trimming");
      console.error(error);
      return;
    }

    /* UPDATE ORDER STAGE */
    await supabase
      .from("orders")
      .update({ stage: "TRIMMING_DONE" })
      .eq("id", selectedOrder.id);

    alert("✅ Trimming completed successfully");

    setSelectedOrder(null);
    loadOrders();
  };

  return (
    <MainLayout>
      <PageHeader title="Trimming" company="Pushpa Textile" />

      {/* ================= ORDER LIST ================= */}
      {!selectedOrder && (
        <div className="card">
          <h3>Orders for Trimming</h3>

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
            <p style={{ textAlign: "center", marginTop: 10 }}>
              ✅ No pending trimming orders
            </p>
          )}
        </div>
      )}

      {/* ================= ORDER VIEW ================= */}
      {selectedOrder && (
        <>
          <div className="card">
            <b>Order:</b> {selectedOrder.invoice_no} |{" "}
            {selectedOrder.company_name}
          </div>

          {/* ORDER ITEMS */}
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

          {/* STITCHING REFERENCE */}
          <div className="card">
            <h3>Stitching Production (Reference)</h3>
            <table className="order-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Size</th>
                  <th>Stitched Qty</th>
                </tr>
              </thead>
              <tbody>
                {stitchingData.map((s, i) => (
                  <tr key={i}>
                    <td>{s.product_name}</td>
                    <td>{s.size}</td>
                    <td>{s.stitched_qty}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* TRIMMING INPUT */}
          <div className="card">
            <h3>Trimming Production</h3>
            <table className="order-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Size</th>
                  <th>Ordered Qty</th>
                  <th>Stitched Qty</th>
                  <th>Trimmed Qty</th>
                </tr>
              </thead>
              <tbody>
                {trimmingRows.map((r, i) => (
                  <tr key={i}>
                    <td>{r.product_name}</td>
                    <td>{r.size}</td>
                    <td>{r.ordered_qty}</td>
                    <td>{r.stitched_qty}</td>
                    <td>
                      <input
                        type="number"
                        value={r.trimmed_qty}
                        onChange={(e) =>
                          updateTrimQty(i, e.target.value)
                        }
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <button className="save-btn" onClick={saveTrimming}>
              Save Trimming
            </button>
          </div>
        </>
      )}
    </MainLayout>
  );
}
