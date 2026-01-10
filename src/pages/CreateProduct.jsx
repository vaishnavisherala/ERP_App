import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import MainLayout from "../layout/MainLayout";
import PageHeader from "../components/PageHeader";
import "./CreateProduct.css";
import { supabase } from "../supabaseClient";

/* CATEGORY → MEASUREMENTS */
const MEASUREMENT_TEMPLATES = {
  Shirt: ["Shoulder", "Chest", "Waist", "Hem", "Length", "Sleeve"],
  Pant: ["Waist", "Hip", "Thigh", "Knee", "Bottom", "Inseam", "Outseam"],
  Dungaree: ["Chest", "Waist", "Hip", "Bib Length", "Leg Length"],
  Kurta: ["Chest", "Waist", "Hip", "Length", "Sleeve"],
};

export default function CreateProduct() {
  const { id } = useParams();

  /* ---------------- STATES ---------------- */
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
  const [stockItems, setStockItems] = useState([]);

  const activeMeasurements =
    MEASUREMENT_TEMPLATES[product.category] ||
    MEASUREMENT_TEMPLATES["Shirt"];

  /* ---------------- IMAGE UPLOAD ---------------- */
  const uploadImage = async (file, prefix = "product") => {
    const fileName = `${prefix}-${Date.now()}-${file.name}`;

    const { error } = await supabase.storage
      .from("product-images")
      .upload(fileName, file);

    if (error) throw error;

    return supabase.storage
      .from("product-images")
      .getPublicUrl(fileName).data.publicUrl;
  };

  /* ---------------- FETCH STOCK ITEMS ---------------- */
  const fetchStockItems = async () => {
    const { data, error } = await supabase
      .from("stock_register")
      .select("item_name")
      .order("item_name", { ascending: true });

    if (error) {
      console.error(error);
      return;
    }

    const uniqueItems = [...new Set(data.map((d) => d.item_name))];
    setStockItems(uniqueItems);
  };

  /* ---------------- FETCH PRODUCT (EDIT) ---------------- */
  useEffect(() => {
    fetchStockItems();
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
    ms.forEach((r) => {
      if (!formatted[r.measurement]) formatted[r.measurement] = {};
      formatted[r.measurement][r.size] = r.value;
    });
    setMeasurements(formatted);
  };

  /* ---------------- VALIDATION ---------------- */
  const validateForm = () => {
    if (!product.company_name || !product.name || !product.style_code) {
      alert("❌ Product details required");
      return false;
    }

    if (requirements.length === 0) {
      alert("❌ At least one BOM item required");
      return false;
    }

    for (let r of requirements) {
      if (!r.item || !r.unit || !r.qty) {
        alert("❌ BOM item, unit & qty required");
        return false;
      }
    }

    return true;
  };

  /* ---------------- BOM ---------------- */
  const addRequirement = () =>
    setRequirements([...requirements, { item: "", unit: "", qty: "", image: null }]);

  const updateRequirement = (i, field, value) => {
    const copy = [...requirements];
    copy[i][field] = value;
    setRequirements(copy);
  };

  const removeRequirement = (i) =>
    setRequirements(requirements.filter((_, x) => x !== i));

  /* ---------------- SIZES ---------------- */
  const addSize = () => setSizes([...sizes, ""]);
  const updateSize = (i, value) => {
    const copy = [...sizes];
    copy[i] = value;
    setSizes(copy);
  };
  const removeSize = (i) => {
    if (sizes.length > 1) {
      const removed = sizes[i];
      setSizes(sizes.filter((_, x) => x !== i));

      setMeasurements((prev) => {
        const copy = { ...prev };
        Object.keys(copy).forEach((m) => delete copy[m][removed]);
        return copy;
      });
    }
  };

  /* ---------------- SAVE PRODUCT ---------------- */
  const saveProduct = async () => {
    if (!validateForm()) return;

    try {
      let imageUrl = productImage.preview;
      if (productImage.file) {
        imageUrl = await uploadImage(productImage.file, "product");
      }

      let productId = id || null;

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
          .select("id")
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
            value: Number(measurements[m]?.[s] || 0),
          });
        });
      });

      await supabase.from("product_measurements").insert(rows);

      alert(id ? "✅ Product updated" : "✅ Product created");
    } catch (err) {
      console.error(err);
      alert("❌ Error saving product");
    }
  };

  /* ---------------- UI ---------------- */
  return (
    <MainLayout>
      <PageHeader title="New Sales Item / Product Creation" company="Pushpa Textile" />

      {/* PRODUCT DETAILS */}
      <div className="card">
        <h3>Product Details</h3>

        <div className="product-grid">
          <div className="form-field">
            <label>Company Name</label>
            <input
              value={product.company_name}
              onChange={(e) =>
                setProduct({ ...product, company_name: e.target.value })
              }
            />
          </div>

          <div className="form-field">
            <label>Product Name</label>
            <input
              value={product.name}
              onChange={(e) =>
                setProduct({ ...product, name: e.target.value })
              }
            />
          </div>

          <div className="form-field">
            <label>Style Code</label>
            <input
              value={product.style_code}
              onChange={(e) =>
                setProduct({ ...product, style_code: e.target.value })
              }
            />
          </div>

          <div className="image-upload-box">
            {productImage.preview ? (
              <img src={productImage.preview} alt="product" />
            ) : (
              <label className="upload-placeholder">
                Upload Product Image
                <input
                  type="file"
                  hidden
                  accept="image/*"
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
              onChange={(e) => updateRequirement(i, "item", e.target.value)}
            >
              <option value="">Select Item</option>
              {stockItems.map((item, idx) => (
                <option key={idx} value={item}>
                  {item}
                </option>
              ))}
            </select>

            <input
              placeholder="Unit"
              value={req.unit}
              onChange={(e) => updateRequirement(i, "unit", e.target.value)}
            />

            <input
              type="number"
              placeholder="Qty"
              value={req.qty}
              onChange={(e) => updateRequirement(i, "qty", e.target.value)}
            />

            <div className="bom-image-box">
              {req.image ? (
                <img src={req.image} alt="bom" />
              ) : (
                <label className="bom-upload">
                  Upload Image
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files[0];
                      if (!file) return;
                      const url = await uploadImage(file, "bom");
                      updateRequirement(i, "image", url);
                    }}
                  />
                </label>
              )}
            </div>

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

        <div className="measurement-category">
          <label>Measurement Type</label>
          <select
            value={product.category}
            onChange={(e) =>
              setProduct({ ...product, category: e.target.value })
            }
          >
            {Object.keys(MEASUREMENT_TEMPLATES).map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div className="size-header">
          {sizes.map((s, i) => (
            <div className="size-chip" key={i}>
              <input value={s} onChange={(e) => updateSize(i, e.target.value)} />
              <span className="size-remove" onClick={() => removeSize(i)}>×</span>
            </div>
          ))}
          <button className="add-size-btn" onClick={addSize}>+ Add Size</button>
        </div>

        <table className="measurement-table">
          <thead>
            <tr>
              <th>Measurement</th>
              {sizes.map((s) => <th key={s}>{s}</th>)}
            </tr>
          </thead>
          <tbody>
            {activeMeasurements.map((m) => (
              <tr key={m}>
                <td>{m}</td>
                {sizes.map((s) => (
                  <td key={s}>
                    <input
                      placeholder="cm"
                      value={measurements[m]?.[s] || ""}
                      onChange={(e) =>
                        setMeasurements((prev) => ({
                          ...prev,
                          [m]: { ...prev[m], [s]: e.target.value },
                        }))
                      }
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card">
        <button className="save-btn" onClick={saveProduct}>
          Save Product
        </button>
      </div>
    </MainLayout>
  );
}
