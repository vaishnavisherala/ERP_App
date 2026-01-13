import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import MainLayout from "../layout/MainLayout";
import PageHeader from "../components/PageHeader";

export default function OrdersList() {
  const [orders, setOrders] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error) setOrders(data || []);
  };

  return (
    <MainLayout>
      <PageHeader title="Orders" company="Pushpa Textile" />

      <div className="card">
        <table className="order-table">
          <thead>
            <tr>
              <th>Invoice</th>
              <th>Company</th>
              <th>Date</th>
              <th>Stage</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {orders.map((o) => (
              <tr key={o.id}>
                <td>{o.invoice_no}</td>
                <td>{o.company_name}</td>
                <td>{o.order_date}</td>
                <td>{o.stage}</td>
                <td>
                  <button onClick={() => navigate(`/orders/${o.id}`)}>
                    Open
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </MainLayout>
  );
}
