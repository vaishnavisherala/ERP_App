const StatCard = ({ title, value }) => {
  return (
    <div className="bg-white p-4 rounded shadow">
      <p className="text-gray-500 text-sm">{title}</p>
      <h3 className="text-xl font-bold">{value}</h3>
    </div>
  );
};

export default StatCard;
