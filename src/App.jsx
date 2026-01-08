import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login"
import Order from "./pages/Order";
import Cutting from "./pages/Cutting";
import Stitching from "./pages/Stitching";
import Trimming from "./pages/Trimming";
import Pressing from "./pages/Pressing";
import Dispatch from "./pages/Dispatch";
import Stock from "./pages/Stock";

function App() {
  return (
    <div>
     
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login/>}/>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/order" element={<Order />} />
        <Route path="/cutting" element={<Cutting />} />
        <Route path="Stitching" element={<Stitching/>}/>
        <Route path="Trimming" element={<Trimming/>}/>
        <Route path="Pressing" element={<Pressing/>}/>
        <Route path="Dispatch" element={<Dispatch/>}/>
        <Route path="/dispatch" element={<Dispatch />}/>
        <Route path="/Stock" element={<Stock />}/>
        {/* <Route path="/cutting-status" element={<CuttingStatus />} /> */}

        </Routes>
    </BrowserRouter>
    </div>
  );
}

export default App;
