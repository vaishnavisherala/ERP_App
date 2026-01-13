import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import MainLayout from "../layout/MainLayout";
import PageHeader from "../components/PageHeader";
import "./Dispatch.css";
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

  /* ================= ORDER LIST ================= */
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);

  /* ================= HEADER ================= */
  const [orderNo, setOrderNo] = useState("");
  const [buyerName, setBuyerName] = useState("");
  const [styleName, setStyleName] = useState("");
  const [dispatchDate, setDispatchDate] = useState("");
  const [remarks, setRemarks] = useState("");

  /* ================= SIZE QTY ================= */
  const [sizeRows, setSizeRows] = useState([]);

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
     LOAD ORDERS FOR DISPATCH
  ===================================================== */
  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    const { data } = await supabase
      .from("orders")
      .select("*")
      .eq("stage", "PRESSING_DONE")
      .order("created_at", { ascending: false });

    setOrders(data || []);
  };

  /* =====================================================
     OPEN ORDER → AUTO LOAD DATA
  ===================================================== */
  const openOrder = async (order) => {
    setSelectedOrder(order);

    setOrderNo(order.invoice_no);
    setBuyerName(order.company_name || "");
    setStyleName(order.company_name || "");
    setDispatchDate(new Date().toISOString().split("T")[0]);

    /* LOAD PRESSING DATA */
    const { data: pressData } = await supabase
      .from("pressing_sizes")
      .select("size, pressed_qty, repress_qty")
      .eq(
        "pressing_id",
        supabase
          .from("pressing_header")
          .select("id")
          .eq("order_no", order.invoice_no)
          .limit(1)
      );

    /* FALLBACK METHOD (SAFE) */
    const { data: pressHeader } = await supabase
      .from("pressing_header")
      .select("id")
      .eq("order_no", order.invoice_no)
      .single();

    const { data: sizes } = await supabase
      .from("pressing_sizes")
      .select("size, pressed_qty, repress_qty")
      .eq("pressing_id", pressHeader.id);

    const rows = SIZES.map((s) => {
      const found = sizes?.find((x) => x.size === s);
      const ready =
        (found?.pressed_qty || 0) - (found?.repress_qty || 0);

      return {
        size: s,
        ready_qty: ready,
        dispatched_qty: 0,
      };
    });

    setSizeRows(rows);
  };

  /* =====================================================
     SAVE DISPATCH
  ===================================================== */
  const saveDispatch = async (complete = false) => {
    if (!selectedOrder) return;

    try {
      /* HEADER */
      const { data: header } = await supabase
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

      /* SIZE QTY */
      await supabase.from("dispatch_sizes").insert(
        sizeRows.map((r) => ({
          dispatch_id: header.id,
          size: r.size,
          ready_qty: r.ready_qty,
          dispatched_qty: r.dispatched_qty,
          balance_qty: r.ready_qty - r.dispatched_qty,
        }))
      );

      /* PACKING */
      await supabase.from("dispatch_packing").insert({
        dispatch_id: header.id,
        no_of_cartons: Number(noOfCartons || 0),
        packing_type: packingType,
        gross_weight: Number(grossWeight || 0),
        net_weight: Number(netWeight || 0),
      });

      /* TRANSPORT */
      await supabase.from("dispatch_transport").insert({
        dispatch_id: header.id,
        transporter_name: transporterName,
        vehicle_no: vehicleNo,
        lr_no: lrNo,
        invoice_no: invoiceNo,
      });

      /* CHECKLIST */
      await supabase.from("dispatch_checklist").insert(
        checklist.map((c) => ({
          dispatch_id: header.id,
          item: c.item,
          checked: c.checked,
        }))
      );

      /* UPDATE ORDER STAGE */
      if (complete) {
        await supabase
          .from("orders")
          .update({ stage: "DISPATCH_DONE" })
          .eq("id", selectedOrder.id);
      }

      alert("✅ Dispatch completed");
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      alert("❌ Failed to save dispatch");
    }
  };

  return (
    <MainLayout>
      <PageHeader title="Dispatch Department" company="Pushpa Textile" />

      {/* ================= ORDER LIST ================= */}
      {!selectedOrder && (
        <div className="card">
          <h3>Orders for Dispatch</h3>
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
              ✅ No pending dispatch orders
            </p>
          )}
        </div>
      )}

      {/* ================= DISPATCH FORM ================= */}
      {selectedOrder && (
        <>
          <div className="dispatch-card">
            <h3>Order & Buyer Information</h3>
            <div className="dispatch-grid">
              <input value={orderNo} disabled />
              <input value={buyerName} />
              <input value={styleName} />
              <input type="date" value={dispatchDate} />
            </div>
          </div>

          <div className="dispatch-card">
            <h3>Size-wise Dispatch Quantity</h3>
            <table className="dispatch-table">
              <thead>
                <tr>
                  <th>Size</th>
                  <th>Ready</th>
                  <th>Dispatched</th>
                  <th>Balance</th>
                </tr>
              </thead>
              <tbody>
                {sizeRows.map((r, i) => (
                  <tr key={r.size}>
                    <td>{r.size}</td>
                    <td>{r.ready_qty}</td>
                    <td>
                      <input
                        type="number"
                        value={r.dispatched_qty}
                        onChange={(e) => {
                          const copy = [...sizeRows];
                          copy[i].dispatched_qty = Number(e.target.value);
                          setSizeRows(copy);
                        }}
                      />
                    </td>
                    <td>{r.ready_qty - r.dispatched_qty}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

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
        </>
      )}
    </MainLayout>
  );
}
