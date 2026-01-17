import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import MainLayout from "../layout/MainLayout";
import PageHeader from "../components/PageHeader";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar, Pie } from "react-chartjs-2";

import "./Dashboard.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend
);

export default function Dashboard() {
  const [stats, setStats] = useState({
    total: 0,
    cutting: 0,
    stitching: 0,
    trimming: 0,
    pressing: 0,
    dispatch: 0,
    pending: 0,
  });

  const [qtyStats, setQtyStats] = useState({
    orderedQty: 0,
    stitchedQty: 0,
    trimmedQty: 0,
  });

  const [recentOrders, setRecentOrders] = useState([]);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    /* ================= ORDERS ================= */
    const { data: orders, error } = await supabase
      .from("orders")
      .select("id, invoice_no, company_name, stage, created_at");

    if (error) {
      console.error(error);
      return;
    }

    const total = orders.length;

    const cutting = orders.filter(o => o.stage === "CUTTING_DONE").length;
    const stitching = orders.filter(o => o.stage === "STITCHING_DONE").length;
    const trimming = orders.filter(o => o.stage === "TRIMMING_DONE").length;
    const pressing = orders.filter(o => o.stage === "PRESSING_DONE").length;
    const dispatch = orders.filter(o => o.stage === "DISPATCH_DONE").length;

    const pending = orders.filter(
      o => !o.stage || o.stage === "CREATED"
    ).length;

    setStats({
      total,
      cutting,
      stitching,
      trimming,
      pressing,
      dispatch,
      pending,
    });

    /* ================= ORDERED QTY ================= */
    const { data: orderItems } = await supabase
      .from("order_items")
      .select("quantity");

    const orderedQty =
      orderItems?.reduce((s, i) => s + Number(i.quantity || 0), 0) || 0;

    /* ================= STITCHED QTY ================= */
    const { data: stitched } = await supabase
      .from("stitching_production")
      .select("stitched_qty");

    const stitchedQty =
      stitched?.reduce((s, i) => s + Number(i.stitched_qty || 0), 0) || 0;

    /* ================= TRIMMED QTY ================= */
    const { data: trimmed } = await supabase
      .from("trimming_production")
      .select("trimmed_qty");

    const trimmedQty =
      trimmed?.reduce((s, i) => s + Number(i.trimmed_qty || 0), 0) || 0;

    setQtyStats({
      orderedQty,
      stitchedQty,
      trimmedQty,
    });

    /* ================= RECENT ORDERS ================= */
    setRecentOrders(
      orders
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 5)
    );
  };

  /* ================= CHART DATA ================= */

  const stagePieChart = {
    labels: [
      "Cutting",
      "Stitching",
      "Trimming",
      "Pressing",
      "Dispatch",
      "Pending",
    ],
    datasets: [
      {
        data: [
          stats.cutting,
          stats.stitching,
          stats.trimming,
          stats.pressing,
          stats.dispatch,
          stats.pending,
        ],
        backgroundColor: [
          "#2563eb", // Cutting
          "#22c55e", // Stitching
          "#06b6d4", // Trimming
          "#a855f7", // Pressing
          "#f97316", // Dispatch
          "#ef4444", // Pending
        ],
      },
    ],
  };

  const flowBarChart = {
    labels: ["Cutting", "Stitching", "Trimming", "Pressing", "Dispatch"],
    datasets: [
      {
        label: "Orders",
        data: [
          stats.cutting,
          stats.stitching,
          stats.trimming,
          stats.pressing,
          stats.dispatch,
        ],
        backgroundColor: "#1d4ed8",
      },
    ],
  };

  const qtyBarChart = {
    labels: ["Ordered", "Stitched", "Trimmed"],
    datasets: [
      {
        label: "Quantity",
        data: [
          qtyStats.orderedQty,
          qtyStats.stitchedQty,
          qtyStats.trimmedQty,
        ],
        backgroundColor: "#0ea5e9",
      },
    ],
  };

  return (
    <MainLayout>
      <PageHeader title="Dashboard" company="Pushpa Textile" />

      {/* ================= KPI CARDS ================= */}
      <div className="dashboard-grid">
        <div className="stat-card"><h4>Total Orders</h4><p>{stats.total}</p></div>
        <div className="stat-card"><h4>Cutting</h4><p>{stats.cutting}</p></div>
        <div className="stat-card"><h4>Stitching</h4><p>{stats.stitching}</p></div>
        <div className="stat-card"><h4>Trimming</h4><p>{stats.trimming}</p></div>
        <div className="stat-card"><h4>Pressing</h4><p>{stats.pressing}</p></div>
        <div className="stat-card"><h4>Dispatch</h4><p>{stats.dispatch}</p></div>
        <div className="stat-card"><h4>Pending</h4><p>{stats.pending}</p></div>
      </div>

      {/* ================= CHARTS ================= */}
      <div className="dashboard-charts">
        <div className="card">
          <h3 className="section-title">Orders by Stage</h3>
          <Pie data={stagePieChart} />
        </div>

        <div className="card">
          <h3 className="section-title">Production Flow</h3>
          <Bar data={flowBarChart} />
        </div>

        <div className="card">
          <h3 className="section-title">Quantity Flow</h3>
          <Bar data={qtyBarChart} />
        </div>
      </div>

      {/* ================= RECENT ORDERS ================= */}
      <div className="card">
        <h3 className="section-title">Recent Orders</h3>
        <table className="order-table">
          <thead>
            <tr>
              <th>Order No</th>
              <th>Company</th>
              <th>Stage</th>
            </tr>
          </thead>
          <tbody>
            {recentOrders.map(o => (
              <tr key={o.id}>
                <td>{o.invoice_no}</td>
                <td>{o.company_name}</td>
                <td>{o.stage || "CREATED"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </MainLayout>
  );
}
