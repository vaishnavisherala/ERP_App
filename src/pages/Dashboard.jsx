import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import StatCard from "../components/StatCard";

const Dashboard = () => {
  return (
    <div className="flex bg-gray-100 min-h-screen">
      <Sidebar />

      <div className="flex-1">
        <Topbar />

        <div className="p-6 space-y-6">
          {/* Top Stat Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <StatCard title="Total Order" value="3" />
            <StatCard title="Running Order" value="3" />
            <StatCard title="Pending Order" value="0" />
            <StatCard title="Weekly Value" value="$10,000" />
            <StatCard title="Monthly Value" value="$25,000" />
            <StatCard title="Yearly Value" value="$25,000" />
          </div>

          {/* Second Row */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <StatCard title="Cash Balance" value="$5,000" />
            <StatCard title="Bank Balance" value="$11,000" />
            <StatCard title="Supplier Due" value="$4,500" />
            <StatCard title="Monthly Expense" value="$1,000" />
          </div>

          {/* Charts + Orders */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white p-4 rounded shadow">
              <h3 className="font-semibold mb-3">Income vs Expense</h3>
              <div className="h-64 flex items-center justify-center text-gray-400">
                Chart Placeholder
              </div>
            </div>

            <div className="bg-white p-4 rounded shadow">
              <h3 className="font-semibold mb-3">New Orders</h3>
              <ul className="space-y-2">
                <li className="flex justify-between">
                  <span>Men's T-Shirt</span>
                  <span className="text-blue-600">Approved</span>
                </li>
                <li className="flex justify-between">
                  <span>T-Shirt</span>
                  <span className="text-blue-600">Approved</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-4 rounded shadow">
              Sales Ratio (Chart)
            </div>
            <div className="bg-white p-4 rounded shadow">
              Sales by Country (Chart)
            </div>
            <div className="bg-white p-4 rounded shadow">
              Top Buyers
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
