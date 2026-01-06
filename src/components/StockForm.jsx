import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

export default function StockForm({ refresh }) {
  const [items, setItems] = useState([]);
  const [itemId, setItemId] = useState("");
  const [type, setType] = useState("IN");
  const [qty, setQty] = useState("");

  useEffect(() => {
    supabase.from("stock_items").select("*").then(({ data }) => {
      setItems(data);
    });
  }, []);

  const submit = async () => {
    await supabase.from("stock_transactions").insert({
      item_id: itemId,
      transaction_type: type,
      quantity: qty,
    });

    setQty("");
    refresh();
  };

  return (
    <div style={{ marginBottom: 20 }}>
      <h4>Stock Entry</h4>

      <select onChange={(e) => setItemId(e.target.value)}>
        <option>Select Item</option>
        {items.map((i) => (
          <option key={i.id} value={i.id}>
            {i.item_name}
          </option>
        ))}
      </select>

      <select onChange={(e) => setType(e.target.value)}>
        <option value="IN">IN</option>
        <option value="OUT">OUT</option>
      </select>

      <input
        type="number"
        placeholder="Quantity"
        value={qty}
        onChange={(e) => setQty(e.target.value)}
      />

      <button onClick={submit}>Save</button>
    </div>
  );
}
