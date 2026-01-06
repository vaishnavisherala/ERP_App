import { BrowserRouter, Routes, Route } from "react-router-dom";
<<<<<<< HEAD
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
=======
import Dashboard from "./pages/Dashboard";
import Order from "./pages/Order";
// import Stock from "./pages/Stock";
// import Cutting from "./pages/Cutting";
// import Stitching from "./pages/Stitching";
// import Trimming from "./pages/Trimming";
// import Pressing from "./pages/Pressing";
// import Dispatch from "./pages/Dispatch";
>>>>>>> a9d6ad1b043bd31fafbdaa3807e19e2dac9af04a

function App() {
  return (
    <BrowserRouter>
      <Routes>
<<<<<<< HEAD
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
=======
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/order" element={<Order />} />
        {/* <Route path="/stock" element={<Stock />} />
        <Route path="/cutting" element={<Cutting />} />
        <Route path="/stitching" element={<Stitching />} />
        <Route path="/trimming" element={<Trimming />} />
        <Route path="/pressing" element={<Pressing />} />
        <Route path="/dispatch" element={<Dispatch />} /> */}
>>>>>>> a9d6ad1b043bd31fafbdaa3807e19e2dac9af04a
      </Routes>
    </BrowserRouter>
  );
}

export default App;
