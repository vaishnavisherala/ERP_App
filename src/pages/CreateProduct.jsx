import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import MainLayout from "../layout/MainLayout";
import PageHeader from "../components/PageHeader";
import "./CreateProduct.css";
import { supabase } from "../supabaseClient";

/* MASTER DATA */
const REQUIREMENT_ITEMS = [
  { id: 1, name: "Button", unit: "Nos" },
  { id: 2, name: "Zipper", unit: "Nos" },
  { id: 3, name: "Thread", unit: "Meter" },
  { id: 4, name: "Label", unit: "Nos" },
  { id: 5, name: "Elastic", unit: "Meter" },
];

/* CATEGORY → MEASUREMENTS */
const MEASUREMENT_TEMPLATES = {
  Shirt: ["Shoulder", "Chest", "Waist", "Hem", "Length", "Sleeve"],
  Pant: ["Waist", "Hip", "Thigh", "Knee", "Bottom", "Inseam", "Outseam"],
  Dungaree: ["Chest", "Waist", "Hip", "Bib Length", "Leg Length"],
  Kurta: ["Chest", "Waist", "Hip", "Length", "Sleeve"],
};

export default function CreateProduct() {
  const { id } = useParams();

  /* PRODUCT STATE */
  const [product, setProduct] = useState({
    company_name: "",
    name: "",
    category: "Shirt",
    style_code: "",
  });

  const [productImage, setProductImage] = useState({
    preview: null,
    file: null,
  });

  const [requirements, setRequirements] = useState([]);
  const [sizes, setSizes] = useState(["S", "M", "L"]);
  const [measurements, setMeasurements] = useState({});

  const activeMeasurements =
    MEASUREMENT_TEMPLATES[product.category] ||
    MEASUREMENT_TEMPLATES["Shirt"];

  /* ---------- IMAGE UPLOAD ---------- */
  const uploadImage = async (file) => {
    const fileName = `product-${Date.now()}-${file.name}`;
    const { error } = await supabase.storage
      .from("product-images")
      .upload(fileName, file);
    if (error) throw error;

    return supabase.storage
      .from("product-images")
      .getPublicUrl(fileName).data.publicUrl;
  };

  /* ---------- FETCH PRODUCT (EDIT) ---------- */
  useEffect(() => {
    if (id) fetchProduct(id);
  }, [id]);

  const fetchProduct = async (productId) => {
    const { data: p } = await supabase
      .from("products")
      .select("*")
      .eq("id", productId)
      .single();

    setProduct({
      company_name: p.company_name || "",
      name: p.name,
      category: p.category || "Shirt",
      style_code: p.style_code,
    });

    setProductImage({ preview: p.image_url, file: null });

    const { data: bom } = await supabase
      .from("product_bom")
      .select("*")
      .eq("product_id", productId);

    setRequirements(
      bom.map((b) => ({
        item: b.item_name,
        unit: b.unit,
        qty: b.qty,
        image: b.image_url,
      }))
    );

    const { data: sz } = await supabase
      .from("product_sizes")
      .select("size")
      .eq("product_id", productId);

    setSizes(sz.map((s) => s.size));

    const { data: ms } = await supabase
      .from("product_measurements")
      .select("*")
      .eq("product_id", productId);

    const formatted = {};
    ms.forEach((row) => {
      if (!formatted[row.measurement]) formatted[row.measurement] = {};
      formatted[row.measurement][row.size] = row.value;
    });
    setMeasurements(formatted);
  };

  /* ---------- VALIDATION ---------- */
  const validateForm = () => {
    if (
      !product.company_name ||
      !product.name ||
      !product.category ||
      !product.style_code
    ) {
      alert("❌ Product Details are required");
      return false;
    }

    if (requirements.length === 0) {
      alert("❌ At least one BOM item is required");
      return false;
    }

    for (let r of requirements) {
      if (!r.item || !r.qty || Number(r.qty) <= 0) {
        alert("❌ BOM item and quantity required");
        return false;
      }
    }

    for (let s of sizes) {
      if (!s) {
        alert("❌ Size cannot be empty");
        return false;
      }
      for (let m of activeMeasurements) {
        if (!measurements[m]?.[s]) {
          alert(`❌ ${m} is required for size ${s}`);
          return false;
        }
      }
    }

    return true;
  };

  /* ---------- BOM ---------- */
  const addRequirement = () =>
    setRequirements([...requirements, { item: "", unit: "", qty: "", image: null }]);

  const updateRequirement = (i, field, value) => {
    const copy = [...requirements];
    copy[i][field] = value;
    setRequirements(copy);
  };

  const removeRequirement = (i) =>
    setRequirements(requirements.filter((_, x) => x !== i));

  /* ---------- SIZES ---------- */
  const addSize = () => setSizes([...sizes, ""]);
  const updateSize = (i, value) => {
    const copy = [...sizes];
    copy[i] = value;
    setSizes(copy);
  };
  const removeSize = (i) => {
    if (sizes.length > 1) setSizes(sizes.filter((_, x) => x !== i));
  };

  /* ---------- SAVE ---------- */
  const saveOrder = async () => {
    if (!validateForm()) return;

    try {
      let imageUrl = productImage.preview;
      if (productImage.file) imageUrl = await uploadImage(productImage.file);

      let productId = id;

      if (id) {
        await supabase
          .from("products")
          .update({ ...product, image_url: imageUrl })
          .eq("id", id);

        await supabase.from("product_bom").delete().eq("product_id", id);
        await supabase.from("product_sizes").delete().eq("product_id", id);
        await supabase.from("product_measurements").delete().eq("product_id", id);
      }

      if (!id) {
        const { data } = await supabase
          .from("products")
          .insert({ ...product, image_url: imageUrl })
          .select()
          .single();
        productId = data.id;
      }

      await supabase.from("product_bom").insert(
        requirements.map((r) => ({
          product_id: productId,
          item_name: r.item,
          unit: r.unit,
          qty: Number(r.qty),
          image_url: r.image,
        }))
      );

      await supabase.from("product_sizes").insert(
        sizes.map((s) => ({ product_id: productId, size: s }))
      );

      const rows = [];
      activeMeasurements.forEach((m) => {
        sizes.forEach((s) => {
          rows.push({
            product_id: productId,
            measurement: m,
            size: s,
            value: Number(measurements[m][s]),
          });
        });
      });

      await supabase.from("product_measurements").insert(rows);

      alert(id ? "✅ Product updated successfully" : "✅ Product created successfully");
    } catch (err) {
      console.error(err);
      alert("❌ Error saving product");
    }
  };

  return (
    <MainLayout>
      <PageHeader title="New Sales Item / Order Creation" company="Pushpa Textile" />

      {/* PRODUCT DETAILS */}
      <div className="card">
        <h3>Product Details</h3>

        <div className="product-grid">
          <div>
            <label>Company Name</label>
            <input
              value={product.company_name}
              onChange={(e) =>
                setProduct({ ...product, company_name: e.target.value })
              }
            />
          </div>

          <div>
            <label>Product Name</label>
            <input
              value={product.name}
              onChange={(e) =>
                setProduct({ ...product, name: e.target.value })
              }
            />
          </div>

          <div>
            <label>Style Code</label>
            <input
              value={product.style_code}
              onChange={(e) =>
                setProduct({ ...product, style_code: e.target.value })
              }
            />
          </div>

          <div className="image-box">
            {productImage.preview ? (
              <img src={productImage.preview} alt="product" />
            ) : (
              <label>
                Upload Product Image
                <input
                  type="file"
                  hidden
                  onChange={(e) =>
                    setProductImage({
                      preview: URL.createObjectURL(e.target.files[0]),
                      file: e.target.files[0],
                    })
                  }
                />
              </label>
            )}
          </div>
        </div>
      </div>

      {/* BOM */}
      <div className="card">
        <h3>Sealing / Requirement Items (BOM)</h3>

        {requirements.map((req, i) => (
          <div className="req-row" key={i}>
            <select
              value={req.item}
              onChange={(e) => {
                const sel = REQUIREMENT_ITEMS.find(
                  (r) => r.name === e.target.value
                );
                updateRequirement(i, "item", sel.name);
                updateRequirement(i, "unit", sel.unit);
              }}
            >
              <option value="">Select Item</option>
              {REQUIREMENT_ITEMS.map((r) => (
                <option key={r.id}>{r.name}</option>
              ))}
            </select>

            <input value={req.unit} disabled />
            <input
              type="number"
              value={req.qty}
              onChange={(e) => updateRequirement(i, "qty", e.target.value)}
            />
            <button onClick={() => removeRequirement(i)}>✕</button>
          </div>
        ))}

        <button className="add-btn" onClick={addRequirement}>
          + Add Requirement Item
        </button>
      </div>

      {/* MEASUREMENTS */}
      <div className="card">
        <h3>Size Measurement Chart</h3>

        {/* CATEGORY CONTROLS MEASUREMENTS */}
        <div className="measurement-category">
          <label>Measurement Type</label>
          <select
            value={product.category}
            onChange={(e) =>
              setProduct({ ...product, category: e.target.value })
            }
          >
            <option value="Shirt">Shirt</option>
            <option value="Pant">Pant</option>
            <option value="Dungaree">Dungaree</option>
            <option value="Kurta">Kurta</option>
          </select>
        </div>

        <div className="size-header">
          {sizes.map((s, i) => (
            <div key={i} className="size-input">
              <input value={s} onChange={(e) => updateSize(i, e.target.value)} />
              <button onClick={() => removeSize(i)}>✕</button>
            </div>
          ))}
          <button onClick={addSize}>+ Add Size</button>
        </div>

        <table className="measurement-table">
          <thead>
            <tr>
              <th>Measurement</th>
              {sizes.map((s, i) => (
                <th key={i}>{s}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {activeMeasurements.map((m) => (
              <tr key={m}>
                <td>{m}</td>
                {sizes.map((s) => (
                  <td key={s}>
                    <input
                      value={measurements[m]?.[s] || ""}
                      onChange={(e) =>
                        setMeasurements((prev) => ({
                          ...prev,
                          [m]: { ...prev[m], [s]: e.target.value },
                        }))
                      }
                      placeholder="cm"
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card">
        <button className="save-btn" onClick={saveOrder}>
          Save Order
        </button>
      </div>
    </MainLayout>
  );
}
