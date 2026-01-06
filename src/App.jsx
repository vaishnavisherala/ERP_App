import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Order from "./pages/Order";
// import Stock from "./pages/Stock";
// import Cutting from "./pages/Cutting";
// import Stitching from "./pages/Stitching";
// import Trimming from "./pages/Trimming";
// import Pressing from "./pages/Pressing";
// import Dispatch from "./pages/Dispatch";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/order" element={<Order />} />
        {/* <Route path="/stock" element={<Stock />} />
        <Route path="/cutting" element={<Cutting />} />
        <Route path="/stitching" element={<Stitching />} />
        <Route path="/trimming" element={<Trimming />} />
        <Route path="/pressing" element={<Pressing />} />
        <Route path="/dispatch" element={<Dispatch />} /> */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
