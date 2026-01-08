import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import CreateProduct from "./pages/CreateProduct";
import ProductList from "./pages/ProductList";
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

        {/* DEFAULT HOME ROUTE */}
        <Route path="/" element={<Navigate to="/dashboard" />} />

        {/* ACTIVE ROUTES */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/create-product" element={<CreateProduct />} />
        <Route path="/create-product/:id" element={<CreateProduct />} />
        <Route path="/products" element={<ProductList />} />

        {/* FUTURE ROUTES */}
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
