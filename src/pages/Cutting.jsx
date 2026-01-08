import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import MainLayout from "../layout/MainLayout";
import PageHeader from "../components/PageHeader";

export default function CuttingStatus() {
  const [cuttings, setCuttings] = useState([]);

  useEffect(() => {
    loadStatus();
  }, []);

  const loadStatus = async () => {
    const { data } = await supabase
      .from("cutting")
      .select(`
        id,
        order_no,
        style_name,
        cutting_sizes (
          size,
          planned_qty,
          cut_qty,
          balance_qty
        )
      `)
      .order("created_at", { ascending: false });

    setCuttings(data || []);
  };

  const getStatus = (sizes) => {
    const totalPlanned = sizes.reduce((a, b) => a + Number(b.planned_qty || 0), 0);
    const totalCut = sizes.reduce((a, b) => a + Number(b.cut_qty || 0), 0);

    if (totalCut === 0) return "Not Started";
    if (totalCut < totalPlanned) return "In Progress";
    return "Completed";
  };

  return (
    <MainLayout>
      <PageHeader title="Cutting Status" company="Pushpa Textile" />

      {cuttings.map((c) => (
        <div key={c.id} className="cutting-card">
          <h3>{c.order_no} – {c.style_name}</h3>
          <p>Status: <b>{getStatus(c.cutting_sizes)}</b></p>

          <table className="cutting-table">
            <thead>
              <tr>
                <th>Size</th>
                <th>Planned</th>
                <th>Cut</th>
                <th>Balance</th>
              </tr>
            </thead>
            <tbody>
              {c.cutting_sizes.map((s, i) => (
                <tr key={i}>
                  <td>{s.size}</td>
                  <td>{s.planned_qty}</td>
                  <td>{s.cut_qty}</td>
                  <td>{s.balance_qty}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </MainLayout>
  );
}
