import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import MainLayout from "../layout/MainLayout";
import PageHeader from "../components/PageHeader";
export default function StockRegister() {
  const [form, setForm] = useState({
    no: "",
    date: "",
    invoice_no: "",
    transport_name: "",
    party_name: "",
    client_name: "",
    issued_name: "",
    item_name: "",
    quantity: "",
    rate: "",
    text: "",
    sign: "",
  });

  const [data, setData] = useState([]);
  const [search, setSearch] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // 🔍 SEARCH HANDLER
  const handleSearch = (e) => {
    const value = e.target.value;
    setSearch(value);
    fetchData(value);
  };

  const saveData = async () => {
    const { error } = await supabase.from("stock_register").insert(form);
    if (error) {
      alert(error.message);
    } else {
      alert("Saved Successfully");
      fetchData(search);
    }
  };

  // 📥 FETCH DATA (SEARCH ANY FIELD)
  const fetchData = async (searchText = "") => {
    let query = supabase
      .from("stock_register")
      .select("*")
      .order("created_at", { ascending: false });

    if (searchText) {
       query = query.or(
      `item_name.ilike.%${searchText}%,party_name.ilike.%${searchText}%,client_name.ilike.%${searchText}%,invoice_no.ilike.%${searchText}%,transport_name.ilike.%${searchText}%,issued_name.ilike.%${searchText}%,text.ilike.%${searchText}%,sign.ilike.%${searchText}%`
    );
    }

    const { data, error } = await query;
    if (!error) {
      setData(data);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <MainLayout>
      <PageHeader title="Order Page" company="Pushpa Textile" />
      
      <div style={{ padding: 20 }}>
        <h2>Stock Register</h2>

       

        {/* FORM */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
          <input name="no" placeholder="No" onChange={handleChange} />
          <input type="date" name="date" onChange={handleChange} />
          <input name="invoice_no" placeholder="Invoice No" onChange={handleChange} />

          <input name="transport_name" placeholder="Transport Name" onChange={handleChange} />
          <input name="party_name" placeholder="Party Name" onChange={handleChange} />
          <input name="client_name" placeholder="Client Name" onChange={handleChange} />

          <input name="issued_name" placeholder="Issued Name" onChange={handleChange} />
          <input name="item_name" placeholder="Item Name" onChange={handleChange} />
          <input name="quantity" type="number" placeholder="Quantity" onChange={handleChange} />

          <input name="rate" type="number" placeholder="Rate" onChange={handleChange} />
          <input name="text" placeholder="Text / Remarks" onChange={handleChange} />
          <input name="sign" placeholder="Sign" onChange={handleChange} />
        </div>

        <br />
        <button onClick={saveData}>Save</button>

        <hr />
 {/* 🔍 SEARCH BAR */}
        <input
          type="text"
          placeholder="Search anything (item, party, invoice, client...)"
          value={search}
          onChange={handleSearch}
          style={{
            padding: "8px",
            width: "350px",
            marginBottom: "10px",
            borderRadius: "6px",
            border: "1px solid #ccc",
          }}
        />
        {/* TABLE */}
        <table border="1" width="100%" cellPadding="5">
          <thead>
            <tr>
              <th>No</th>
              <th>Date</th>
              <th>Invoice</th>
              <th>Transport</th>
              <th>Party</th>
              <th>Client</th>
              <th>Issued</th>
              <th>Item</th>
              <th>Qty</th>
              <th>Rate</th>
              <th>Text</th>
              <th>Sign</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr key={row.id}>
                <td>{row.no}</td>
                <td>{row.date}</td>
                <td>{row.invoice_no}</td>
                <td>{row.transport_name}</td>
                <td>{row.party_name}</td>
                <td>{row.client_name}</td>
                <td>{row.issued_name}</td>
                <td>{row.item_name}</td>
                <td>{row.quantity}</td>
                <td>{row.rate}</td>
                <td>{row.text}</td>
                <td>{row.sign}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </MainLayout>
  );
}
