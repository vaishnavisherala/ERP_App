const Topbar = () => {
  return (
    <div className="flex justify-between items-center bg-white p-4 shadow">
      <h2 className="text-xl font-semibold">Dashboard</h2>

      <div className="flex items-center gap-4">
        <button className="relative">
          🔔
          <span className="absolute -top-1 -right-1 bg-red-500 text-xs text-white px-1 rounded">
            3
          </span>
        </button>
        <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
      </div>
    </div>
  );
};

export default Topbar;
