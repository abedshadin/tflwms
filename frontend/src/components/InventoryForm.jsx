import { useState, useEffect } from "react";
import api from "../api";
import "./InventoryForm.css";

function InventoryForm({ token, username, onLogout }) {
  const [submittedDateTime, setSubmittedDateTime] = useState("");
  const [submittedDisplay, setSubmittedDisplay] = useState("");
  const [laborCount, setLaborCount] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [remarks, setRemarks] = useState("");

  const [labors, setLabors] = useState([]); // { name, cost }
  const [receiving, setReceiving] = useState([{ name: "", unit: "", qty: "" }]);
  const [loading, setLoading] = useState([{ name: "", unit: "", qty: "" }]);
  const [stores, setStores] = useState([{ shop: "", qty: "" }]);

  const [message, setMessage] = useState("");

  useEffect(() => {
    resetSubmittedTime();
  }, []);

  const resetSubmittedTime = () => {
    const now = new Date();
    setSubmittedDateTime(now.toISOString());
    setSubmittedDisplay(now.toLocaleString());
  };

  const updateArrayItem = (arr, setter, index, field, value) => {
    const copy = [...arr];
    copy[index] = { ...copy[index], [field]: value };
    setter(copy);
  };

  const addRow = (arr, setter, template) => {
    setter([...arr, template]);
  };

  const removeRow = (arr, setter, index) => {
    if (arr.length === 1) {
      setter([arr[0]]);
      return;
    }
    setter(arr.filter((_, i) => i !== index));
  };

  const anyLoadingItemFilled = loading.some((l) => l.name.trim() !== "");

  const handleLaborCountChange = (e) => {
    const value = e.target.value;
    setLaborCount(value);

    const n = parseInt(value, 10);
    if (isNaN(n) || n <= 0) {
      setLabors([]);
      return;
    }

    setLabors((prev) => {
      const copy = [...prev];
      if (copy.length < n) {
        while (copy.length < n) {
          copy.push({ name: "", cost: "" });
        }
      } else if (copy.length > n) {
        copy.length = n;
      }
      return copy;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    alert("Saved Data");

    if (!token) {
      setMessage("You must be logged in.");
      return;
    }

  const payload = {
  submittedDateTime,
  laborCount,
  startTime,
  endTime,
  remarks, // 👈 NEW
  labors,
  receiving,
  loading,
  stores: anyLoadingItemFilled ? stores : [],
};


    try {
      const res = await api.post("/inventory", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage("Saved: " + res.data.message);

      setLaborCount("");
      setLabors([]);
      setStartTime("");
      setEndTime("");
      setRemarks("");

      setReceiving([{ name: "", unit: "", qty: "" }]);
      setLoading([{ name: "", unit: "", qty: "" }]);
      setStores([{ shop: "", qty: "" }]);
      resetSubmittedTime();
    } catch (err) {
      console.error(err);
      setMessage("Error: " + (err.response?.data?.message || "Server error"));
    }
  };

  const unitOptions = ["", "KG", "Carton", "Packet"];

  const laborSuggestions = [
    "Labor 1",
    "Labor 2",
    "Labor 3",
    "Labor 4",
    "Labor 5",
  ];

  const shopOptions = ["", "Shop A", "Shop B", "Shop C"];

  return (
    <div className="app-card inventory-card">
      <div className="top-bar">
        <div className="inventory-user">
          Logged in as: <strong>{username}</strong>
        </div>
        <button
          type="button"
          className="btn btn-secondary small"
          onClick={onLogout}
        >
          Logout
        </button>
      </div>

      <form onSubmit={handleSubmit} className="inventory-form">
       {/* Top grid */}
<section className="section">
  <h2 className="section-title">Basic Info</h2>

  {/* 3-up row on desktop, stacks on mobile */}
  <div className="section-body basic-row">
    <div className="field">
      <label>No of Labor</label>
      <input
        type="number"
        value={laborCount}
        onChange={handleLaborCountChange}
        min="0"
        placeholder="e.g. 2"
        required
      />
   
    </div>

    <div className="field">
      <label>Starting Time</label>
      <input
        type="time"
        value={startTime}
        onChange={(e) => setStartTime(e.target.value)}
        required
      />
    </div>

    <div className="field">
      <label>Ending Time</label>
      <input
        type="time"
        value={endTime}
        onChange={(e) => setEndTime(e.target.value)}
        required
      />
    </div>
  </div>

  {/* keep the submitted time hidden; no need to render visibly here */}
  <input type="hidden" value={submittedDisplay} />
</section>

        {/* Labor */}
        <section className="section">
          <h2 className="section-title">Labor</h2>
          <p className="help-text">
            Rows are controlled by <strong>No of Labor</strong>. You can select
            a suggested name or type manually.
          </p>

          <datalist id="laborSuggestions">
            {laborSuggestions.map((name) => (
              <option key={name} value={name} />
            ))}
          </datalist>

          <div className="item-rows">
            {labors.map((l, idx) => (
              <div className="item-row" key={idx}>
                <div className="field">
                  <label>Labor #{idx + 1}</label>
                  <input
                    list="laborSuggestions"
                    type="text"
                    placeholder="Labor name"
                    value={l.name}
                    onChange={(e) =>
                      updateArrayItem(
                        labors,
                        setLabors,
                        idx,
                        "name",
                        e.target.value
                      )
                    }
                  />
                </div>

                <div className="field">
                  <label>Cost</label>
                  <input
                    type="number"
                    placeholder="Cost"
                    min="0"
                    step="0.01"
                    value={l.cost}
                    onChange={(e) =>
                      updateArrayItem(
                        labors,
                        setLabors,
                        idx,
                        "cost",
                        e.target.value
                      )
                    }
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Receiving */}
        <section className="section">
          <div className="section-header">
            <h2 className="section-title">Receiving</h2>
            <button
              type="button"
              className="btn btn-secondary small"
              onClick={() =>
                addRow(receiving, setReceiving, {
                  name: "",
                  unit: "",
                  qty: "",
                })
              }
            >
              + Add Receiving Item
            </button>
          </div>
          <p className="help-text">Add separate row for each receiving item.</p>

          <div className="item-rows">
            {receiving.map((r, idx) => (
              <div className="item-row" key={idx}>
                <div className="field">
                  <label>Item Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Potato"
                    value={r.name}
                    onChange={(e) =>
                      updateArrayItem(
                        receiving,
                        setReceiving,
                        idx,
                        "name",
                        e.target.value
                      )
                    }
                  />
                </div>

                <div className="field">
                  <label>Unit</label>
                  <select
                    value={r.unit}
                    onChange={(e) =>
                      updateArrayItem(
                        receiving,
                        setReceiving,
                        idx,
                        "unit",
                        e.target.value
                      )
                    }
                  >
                    {unitOptions.map((u) => (
                      <option key={u} value={u}>
                        {u || "Select unit"}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="field">
                  <label>Quantity</label>
                  <input
                    type="number"
                    placeholder="Qty"
                    min="0"
                    step="0.01"
                    value={r.qty}
                    onChange={(e) =>
                      updateArrayItem(
                        receiving,
                        setReceiving,
                        idx,
                        "qty",
                        e.target.value
                      )
                    }
                  />
                </div>

                <div className="field field-remove">
                  <button
                    type="button"
                    className="btn btn-secondary small"
                    onClick={() => removeRow(receiving, setReceiving, idx)}
                  >
                    X
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Loading */}
        <section className="section">
          <div className="section-header">
            <h2 className="section-title">Loading</h2>
            <button
              type="button"
              className="btn btn-secondary small"
              onClick={() =>
                addRow(loading, setLoading, { name: "", unit: "", qty: "" })
              }
            >
              + Add Loading Item
            </button>
          </div>
          <p className="help-text">
            Store/Shop breakdown will appear when any loading item is filled.
          </p>

          <div className="item-rows">
            {loading.map((r, idx) => (
              <div className="item-row" key={idx}>
                <div className="field">
                  <label>Item Name</label>
                  <input
                    type="text"
                    placeholder="Item name"
                    value={r.name}
                    onChange={(e) =>
                      updateArrayItem(
                        loading,
                        setLoading,
                        idx,
                        "name",
                        e.target.value
                      )
                    }
                  />
                </div>

                <div className="field">
                  <label>Unit</label>
                  <select
                    value={r.unit}
                    onChange={(e) =>
                      updateArrayItem(
                        loading,
                        setLoading,
                        idx,
                        "unit",
                        e.target.value
                      )
                    }
                  >
                    {unitOptions.map((u) => (
                      <option key={u} value={u}>
                        {u || "Select unit"}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="field">
                  <label>Quantity</label>
                  <input
                    type="number"
                    placeholder="Qty"
                    min="0"
                    step="0.01"
                    value={r.qty}
                    onChange={(e) =>
                      updateArrayItem(
                        loading,
                        setLoading,
                        idx,
                        "qty",
                        e.target.value
                      )
                    }
                  />
                </div>

                <div className="field field-remove">
                  <button
                    type="button"
                    className="btn btn-secondary small"
                    onClick={() => removeRow(loading, setLoading, idx)}
                  >
                    X
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Stores */}
        {anyLoadingItemFilled && (
          <section className="section">
            <div className="section-header">
              <h2 className="section-title">Loading by Store / Shop</h2>
              <button
                type="button"
                className="btn btn-secondary small"
                onClick={() =>
                  addRow(stores, setStores, {
                    shop: "",
                    qty: "",
                  })
                }
              >
                + Add Store
              </button>
            </div>
            <p className="help-text">
              Select shop and quantity for each portion of the loading.
            </p>

            <div className="store-rows">
              {stores.map((s, idx) => (
                <div className="store-row" key={idx}>
                  <div className="field">
                    <label>Shop</label>
                    <select
                      value={s.shop}
                      onChange={(e) =>
                        updateArrayItem(
                          stores,
                          setStores,
                          idx,
                          "shop",
                          e.target.value
                        )
                      }
                    >
                      {shopOptions.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt === "" ? "Select shop" : opt}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="field">
                    <label>Quantity</label>
                    <input
                      type="number"
                      placeholder="Qty for this shop"
                      min="0"
                      step="0.01"
                      value={s.qty}
                      onChange={(e) =>
                        updateArrayItem(
                          stores,
                          setStores,
                          idx,
                          "qty",
                          e.target.value
                        )
                      }
                    />
                  </div>

                  <div className="field field-remove">
                    <button
                      type="button"
                      className="btn btn-secondary small"
                      onClick={() => removeRow(stores, setStores, idx)}
                    >
                      X
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
<section className="section">
  <h2 className="section-title">Remarks</h2>
  <div className="field">
    <textarea
      className="textarea"
      placeholder="Write any notes or remarks here…"
      value={remarks}
      onChange={(e) => setRemarks(e.target.value)}
      rows={3}
    ></textarea>
  </div>
</section>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary">
            Submit
          </button>
          {message && (
            <span className="form-message">
              {message}
            </span>
          )}
        </div>
      </form>
    </div>
  );
}

export default InventoryForm;
