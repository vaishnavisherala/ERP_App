import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import StockForm from "../components/StockForm";

export default function Stock() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    fetchStock();
  }, []);

  const fetchStock = async () => {
    const { data, error } = await supabase
      .from("stock_items")
      .select(`
        id,
        item_name,
        category,
        unit,
        stock_balance(balance)
      `);

    if (!error) setItems(data);
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Stock Management</h2>

      <StockForm refresh={fetchStock} />

      <table border="1" width="100%" cellPadding="8">
        <thead>
          <tr>
            <th>Item</th>
            <th>Category</th>
            <th>Unit</th>
            <th>Balance</th>
          </tr>
        </thead>
        <tbody>
          {items.map((i) => (
            <tr key={i.id}>
              <td>{i.item_name}</td>
              <td>{i.category}</td>
              <td>{i.unit}</td>
              <td>{i.stock_balance?.[0]?.balance || 0}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
