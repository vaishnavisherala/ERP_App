import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import MainLayout from "../layout/MainLayout";
import PageHeader from "../components/PageHeader";
import { useParams } from "react-router-dom";
import "./Order.css";

export default function CreateOrder() {
  const { id } = useParams(); // order id (edit mode)

  /* ---------------- HEADER ---------------- */
  const [companyName, setCompanyName] = useState("");
  const [invoiceNo, setInvoiceNo] = useState("");
  const [orderDate, setOrderDate] = useState("");

  /* ---------------- PRODUCTS ---------------- */
  const [products, setProducts] = useState([]);

  /* ---------------- ORDER ROWS ---------------- */
  const [rows, setRows] = useState([
    {
      productId: "",
      productName: "",
      hsn: "",
      sizes: [],
      size: "",
      qty: "",
    },
  ]);

  /* ---------------- BOM & STOCK ---------------- */
  const [bomItems, setBomItems] = useState([]);
  const [stockMap, setStockMap] = useState({});
  const [activeQty, setActiveQty] = useState(0);

  /* =========================================================
     LOAD MASTER DATA
  ========================================================= */
  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    const { data } = await supabase.from("products").select("*");
    setProducts(data || []);
  };

  /* =========================================================
     EDIT MODE LOAD
  ========================================================= */
  useEffect(() => {
    if (id && products.length) {
      loadOrderForEdit(id);
    }
  }, [id, products]);

  const loadOrderForEdit = async (orderId) => {
    /* ORDER */
    const { data: order } = await supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .single();

    if (!order) return;

    setCompanyName(order.company_name);
    setInvoiceNo(order.invoice_no);
    setOrderDate(order.order_date);

    /* ORDER ITEMS */
    const { data: items } = await supabase
      .from("order_items")
      .select("*")
      .eq("order_id", orderId);

    const filledRows = [];

    for (const item of items) {
      const product = products.find((p) => p.id === item.product_id);
      if (!product) continue;

      const { data: sizeData } = await supabase
        .from("product_sizes")
        .select("size")
        .eq("product_id", product.id);

      filledRows.push({
        productId: product.id,
        productName: product.name,
        hsn: product.style_code,
        sizes: sizeData ? sizeData.map((s) => s.size) : [],
        size: item.size,
        qty: item.quantity,
      });
    }

    setRows(filledRows);
    setActiveQty(Number(filledRows[0]?.qty || 0));

    /* BOM */
    const { data: bomData } = await supabase
      .from("product_bom")
      .select("item_name, unit, qty")
      .eq("product_id", filledRows[0].productId);

    setBomItems(bomData || []);
    await loadStockForBOM(bomData || [], orderId);
  };

  /* =========================================================
     STOCK (FIXED FOR UPDATE MODE)
  ========================================================= */
  const loadStockForBOM = async (bomData, orderId = null) => {
    if (!bomData.length) return;

    const itemNames = bomData.map((b) => b.item_name);

    /* CURRENT STOCK */
    const { data: stockRows } = await supabase
      .from("stock_register")
      .select("item_name, quantity")
      .in("item_name", itemNames);

    const map = {};
    stockRows?.forEach((r) => {
      map[r.item_name] = (map[r.item_name] || 0) + Number(r.quantity);
    });

    /* ADD BACK OLD CONSUMPTION (EDIT MODE) */
    if (orderId) {
      const { data: oldConsumption } = await supabase
        .from("order_bom_consumption")
        .select("item_name, total_required")
        .eq("order_id", orderId);

      oldConsumption?.forEach((c) => {
        map[c.item_name] =
          (map[c.item_name] || 0) + Number(c.total_required);
      });
    }

    setStockMap(map);
  };

  /* =========================================================
     ROW HANDLERS
  ========================================================= */
  const addRow = () =>
    setRows([
      ...rows,
      {
        productId: "",
        productName: "",
        hsn: "",
        sizes: [],
        size: "",
        qty: "",
      },
    ]);

  const deleteRow = (index) =>
    setRows(rows.filter((_, i) => i !== index));

  const updateRow = (i, field, value) => {
    const copy = [...rows];
    copy[i][field] = value;
    setRows(copy);
  };

  /* =========================================================
     PRODUCT SELECT
  ========================================================= */
  const onProductSelect = async (i, productId) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;

    const { data: sizeData } = await supabase
      .from("product_sizes")
      .select("size")
      .eq("product_id", product.id);

    const { data: bomData } = await supabase
      .from("product_bom")
      .select("item_name, unit, qty")
      .eq("product_id", product.id);

    setBomItems(bomData || []);
    await loadStockForBOM(bomData || [], id);

    const copy = [...rows];
    copy[i] = {
      ...copy[i],
      productId: product.id,
      productName: product.name,
      hsn: product.style_code,
      sizes: sizeData ? sizeData.map((s) => s.size) : [],
      size: "",
    };

    setRows(copy);
  };

  /* =========================================================
     SAVE / UPDATE ORDER
  ========================================================= */
  const saveOrder = async () => {
    if (!companyName || !invoiceNo || !orderDate) {
      alert("Company, Invoice & Date required");
      return;
    }

    try {
      let orderId = id;

      /* UPDATE MODE */
      if (id) {
        await supabase.from("orders").update({
          company_name: companyName,
          invoice_no: invoiceNo,
          order_date: orderDate,
        }).eq("id", id);

        await supabase.from("order_items").delete().eq("order_id", id);
        await supabase.from("order_bom_consumption").delete().eq("order_id", id);
        await supabase.from("stock_register")
          .delete()
          .eq("invoice_no", invoiceNo)
          .eq("sign", "OUT");
      }

      /* CREATE MODE */
      if (!id) {
        const { data } = await supabase
          .from("orders")
          .insert({
            company_name: companyName,
            invoice_no: invoiceNo,
            order_date: orderDate,
          })
          .select()
          .single();
        orderId = data.id;
      }

      /* ORDER ITEMS */
      await supabase.from("order_items").insert(
        rows.map((r) => ({
          order_id: orderId,
          product_id: r.productId,
          product_name: r.productName,
          hsn_code: r.hsn,
          size: r.size,
          quantity: Number(r.qty),
        }))
      );

      /* BOM CONSUMPTION */
      const bomConsumption = bomItems.map((b) => ({
        order_id: orderId,
        product_id: rows[0].productId,
        item_name: b.item_name,
        unit: b.unit,
        qty_per_piece: b.qty,
        total_required: Number(rows[0].qty) * Number(b.qty),
      }));

      await supabase.from("order_bom_consumption").insert(bomConsumption);

      /* STOCK OUT */
      await supabase.from("stock_register").insert(
        bomConsumption.map((b) => ({
          date: orderDate,
          invoice_no: invoiceNo,
          item_name: b.item_name,
          quantity: -Number(b.total_required),
          text: "Order Consumption",
          sign: "OUT",
        }))
      );

      alert(id ? "✅ Order Updated" : "✅ Order Created");
    } catch (err) {
      console.error(err);
      alert("❌ Error saving order");
    }
  };

  /* =========================================================
     UI (UNCHANGED)
  ========================================================= */
  return (
    <MainLayout>
      <PageHeader title="Create Order" company="Pushpa Textile" />

      {/* HEADER */}
      <div className="card">
        <div className="order-header-grid">
          <input value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="Company Name" />
          <input value={invoiceNo} onChange={(e) => setInvoiceNo(e.target.value)} placeholder="Invoice No" />
          <input type="date" value={orderDate} onChange={(e) => setOrderDate(e.target.value)} />
        </div>
      </div>

      {/* ORDER TABLE */}
      <div className="card">
        <table className="order-table">
          <thead>
            <tr>
              <th>Sr</th>
              <th>Product</th>
              <th>HSN</th>
              <th>Size</th>
              <th>Qty</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i}>
                <td>{i + 1}</td>
                <td>
                  <select value={r.productId} onChange={(e) => onProductSelect(i, e.target.value)}>
                    <option value="">Select Product</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </td>
                <td><input value={r.hsn} disabled /></td>
                <td>
                  <select value={r.size} disabled={!r.sizes.length} onChange={(e) => updateRow(i, "size", e.target.value)}>
                    <option value="">{r.sizes.length ? "Select Size" : "No Sizes"}</option>
                    {r.sizes.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </td>
                <td>
                  <input type="number" value={r.qty} onChange={(e) => {
                    updateRow(i, "qty", e.target.value);
                    setActiveQty(Number(e.target.value) || 0);
                  }} />
                </td>
                <td><button className="del-btn" onClick={() => deleteRow(i)}>✕</button></td>
              </tr>
            ))}
          </tbody>
        </table>
        <button onClick={addRow}>+ Add Product</button>
      </div>

      {/* BOM */}
      {bomItems.length > 0 && (
        <div className="card">
          <h3>Product Requirements (BOM)</h3>
          <table className="order-table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Unit</th>
                <th>Qty</th>
                <th>Total Qty</th>
                <th>Stock</th>
                <th>Required to Order</th>
              </tr>
            </thead>
            <tbody>
              {bomItems.map((b, i) => {
                const total = activeQty * Number(b.qty);
                const stock = stockMap[b.item_name] || 0;
                const req = stock - total;
                return (
                  <tr key={i}>
                    <td>{b.item_name}</td>
                    <td>{b.unit}</td>
                    <td>{b.qty}</td>
                    <td>{total}</td>
                    <td>{stock}</td>
                    <td style={{ fontWeight: "bold", color: req > 0 ? "green" : req < 0 ? "red" : "black" }}>{req}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <button className="save-btn" onClick={saveOrder}>
        {id ? "Update Order" : "Save Order"}
      </button>
    </MainLayout>
  );
}
