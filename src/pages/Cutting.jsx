import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import MainLayout from "../layout/MainLayout";
import PageHeader from "../components/PageHeader";
import "./Cutting.css";

/* ================= OPERATIONS MASTER ================= */
const OPERATIONS = {
  Shirt: [
    "Neck band top stitch",
    "Collar making",
    "Collar pointed",
    "Pic ready",
    "Pic kinari",
    "Edge cutter",
    "Cuff hem",
    "Cuff making",
    "Cuff pointed",
    "Cuff pressing",
    "Sleeve small patti",
    "Sleeve big patti",
    "Sleeve diamond",
    "Main lable attach",
    "Back yoke attach",
    "Back yoke top stitch",
    "Button patti making",
    "Front placket making",
    "Pocket hem",
    "Pocket pressing",
    "Pocket attach",
    "Front back setting",
    "Shoulder joint",
    "Shoulder top stitch",
    "Collar attach",
    "Collar finish",
    "Sleeve setting",
    "Sleeve attach",
    "Harmol top stitch",
    "Side seam",
    "Cuff finish",
    "Bottom fold",
    "Washcare lable attach",
  ],
  Pant: [
    "Back Dart Marking",
    "Back Dart Making",
    "APW Pocket",
    "Back Pocket Side Locking",
    "Back Pocket Facing Attach",
    "Back Pocket Making",
    "Back Pocket Pointed",
    "Back Overlock",
    "Coin Pocket Ready",
    "Front Pocket Facing Attach",
    "Front Pocket Making",
    "Front Plate Making",
    "Side Pocket Attach",
    "Side Pocket Pointed",
    "Side Pocket Patch Attach",
    "Side Pocket Locking",
    "Single Fly Attach & Zipper",
    "Double Fly & Zipper Attach",
    "Front Rise with J Stitch",
    "Side Seam Attach",
    "Inseem Attach",
    "Belt Attach with Loopi",
    "Belt Mouth Finish",
    "Back Rise",
    "Belt Lock + Finish + Washcare attach",
    "Inner Loop Lock",
    "Loop Finish",
    "Bottom Overlock & Small part overlock",
    "Bottom Hem",
    "Loop Making",
    "Watch Pocket Making",
    "Right Side Belt Grip Attach",
    "Left Side Belt Grip Attach",
    "Front Overlock",
    "Belt Finish",
  ],
};

export default function Cutting() {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const [orderItems, setOrderItems] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [sizeQtyMap, setSizeQtyMap] = useState({});

  const [category, setCategory] = useState("");
  const [matrix, setMatrix] = useState({});

  /* ================= LOAD ONLY PENDING CUTTING ORDERS ================= */
  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("stage", "ORDER_CREATED") // 🔥 KEY FIX
      .order("created_at", { ascending: false });

    if (!error) setOrders(data || []);
  };

  /* ================= OPEN ORDER ================= */
  const openOrder = async (order) => {
    setSelectedOrder(order);
    setCategory("");
    setMatrix({});
    setOrderItems([]);
    setSizes([]);
    setSizeQtyMap({});

    const { data: items } = await supabase
      .from("order_items")
      .select("product_name, size, quantity")
      .eq("order_id", order.id);

    setOrderItems(items || []);

    const qtyMap = {};
    items.forEach((i) => {
      qtyMap[i.size] = i.quantity;
    });

    setSizeQtyMap(qtyMap);
    setSizes(Object.keys(qtyMap));
  };

  /* ================= CATEGORY CHANGE ================= */
  useEffect(() => {
    if (!category || sizes.length === 0) return;

    const temp = {};
    OPERATIONS[category].forEach((op) => {
      temp[op] = {};
      sizes.forEach((s) => {
        temp[op][s] = sizeQtyMap[s] || 0; // 🔥 AUTO FILL
      });
    });

    setMatrix(temp);
    loadSavedOperations(category);
  }, [category]);

  /* ================= LOAD SAVED OPS ================= */
  const loadSavedOperations = async (cat) => {
    const { data } = await supabase
      .from("order_operations")
      .select("*")
      .eq("order_id", selectedOrder.id)
      .eq("category", cat);

    if (!data || data.length === 0) return;

    const temp = {};
    data.forEach((r) => {
      if (!temp[r.operation_name]) temp[r.operation_name] = {};
      temp[r.operation_name][r.size] = r.qty;
    });

    setMatrix((prev) => ({ ...prev, ...temp }));
  };

  /* ================= UPDATE CELL ================= */
  const updateCell = (op, size, value) => {
    setMatrix((prev) => ({
      ...prev,
      [op]: { ...prev[op], [size]: value },
    }));
  };

  /* ================= SAVE OPERATIONS ================= */
  const saveOperations = async () => {
    if (!selectedOrder || !category) return;

    const rows = [];

    Object.keys(matrix).forEach((op) => {
      Object.keys(matrix[op]).forEach((s) => {
        rows.push({
          order_id: selectedOrder.id,
          category,
          operation_name: op,
          size: s,
          qty: Number(matrix[op][s] || 0),
        });
      });
    });

    await supabase
      .from("order_operations")
      .delete()
      .eq("order_id", selectedOrder.id)
      .eq("category", category);

    await supabase.from("order_operations").insert(rows);

    // 🔥 MARK CUTTING DONE
    await supabase
      .from("orders")
      .update({ stage: "CUTTING_DONE" })
      .eq("id", selectedOrder.id);

    alert("✅ Cutting completed");

    setSelectedOrder(null);
    loadOrders();
  };

  return (
    <MainLayout>
      <PageHeader title="Cutting" company="Pushpa Textile" />

      {/* ================= ORDERS LIST ================= */}
      {!selectedOrder && (
        <div className="card">
          <h3>Orders</h3>
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

      {/* ================= ORDER DETAILS ================= */}
      {selectedOrder && (
        <>
          <div className="card">
            <b>Order:</b> {selectedOrder.invoice_no} |{" "}
            {selectedOrder.company_name}
          </div>

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

          <div className="card">
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="">Select Category</option>
              <option value="Shirt">Shirt</option>
              <option value="Pant">Pant</option>
            </select>
          </div>

          {category && (
            <div className="card">
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
                  {OPERATIONS[category].map((op, i) => (
                    <tr key={op}>
                      <td>{i + 1}</td>
                      <td>{op}</td>
                      {sizes.map((s) => (
                        <td key={s}>
                          <input
                            type="number"
                            value={matrix[op]?.[s] || ""}
                            onChange={(e) =>
                              updateCell(op, s, e.target.value)
                            }
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>

              <button className="save-btn" onClick={saveOperations}>
                Save & Complete Cutting
              </button>
            </div>
          )}
        </>
      )}
    </MainLayout>
  );
}
