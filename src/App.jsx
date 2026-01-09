import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import CreateProduct from "./pages/CreateProduct";
import ProductList from "./pages/ProductList";
import StockRegister from "./pages/stockregister";
// import Cutting from "./pages/Cutting";
import CreateOrder from "./pages/CreateOrder";
import OrdersList from "./pages/OrderList";
import Stitching from "./pages/Stitching";
import Trimming from "./pages/Trimming";
import Pressing from "./pages/Pressing";
import Dispatch from "./pages/Dispatch";

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
        <Route path="/orderlist" element={<OrdersList />} />
        <Route path="/orders" element={<CreateOrder />} />
        <Route path="/orders/:id" element={<CreateOrder />} />
        <Route path="/stockregister" element={<StockRegister />} />
        <Route path="/stitching" element={<Stitching />} />
        <Route path="/trimming" element={<Trimming />} />
        <Route path="/pressing" element={<Pressing />} />
        <Route path="/dispatch" element={<Dispatch />} />

        {/* FUTURE ROUTES */}
        {/* <Route path="/stock" element={<Stock />} />
        <Route path="/cutting" element={<Cutting />} />
        */}

      </Routes>
    </BrowserRouter>
  );
}

export default App;
