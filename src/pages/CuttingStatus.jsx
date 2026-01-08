import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import MainLayout from "../layout/MainLayout";
import PageHeader from "../components/PageHeader";
import "./Cutting.css";

export default function CuttingStatus() {
  const [cuttings, setCuttings] = useState([]);

  useEffect(() => {
    loadStatus();
  }, []);

  const loadStatus = async () => {
    const { data: cuttingData } = await supabase
      .from("cutting")
      .select("*")
      .order("created_at", { ascending: false });

    if (!cuttingData) return;

    const ids = cuttingData.map((c) => c.id);

    const { data: sizeData } = await supabase
      .from("cutting_sizes")
      .select("*")
      .in("cutting_id", ids);

    const merged = cuttingData.map((c) => ({
      ...c,
      cutting_sizes: sizeData.filter((s) => s.cutting_id === c.id),
    }));

    setCuttings(merged);
  };

  const getStatus = (sizes) => {
    const planned = sizes.reduce((a, b) => a + Number(b.planned_qty || 0), 0);
    const cut = sizes.reduce((a, b) => a + Number(b.cut_qty || 0), 0);

    if (cut === 0) return "Not Started";
    if (cut < planned) return "In Progress";
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
              {c.cutting_sizes.length === 0 ? (
                <tr>
                  <td colSpan="4" className="empty-msg">
                    No cutting entry found
                  </td>
                </tr>
              ) : (
                c.cutting_sizes.map((s, i) => (
                  <tr key={i}>
                    <td>{s.size}</td>
                    <td>{s.planned_qty}</td>
                    <td>{s.cut_qty}</td>
                    <td>{s.balance_qty}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      ))}
    </MainLayout>
  );
}
