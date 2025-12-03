// src/components/AdminDashboard.jsx
import { useEffect, useState } from "react";
import api from "../api";
import "./AdminDashboard.css";

function AdminDashboard({
  token,
  username,
  onLogout,
  onGoWarehouseLog,
  onGoDryDelivery,
}) {
  const [items, setItems] = useState([]); // inventory docs
  const [loading, setLoadingState] = useState(false);
  const [error, setError] = useState("");

  // Fetch current month inventory
  const fetchInventory = async () => {
    setLoadingState(true);
    setError("");

    try {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1); // “12”

      const res = await api.get("/inventory", {
        headers: { Authorization: `Bearer ${token}` },
        params: { year, month }, // backend can filter by year/month
      });

      setItems(res.data || []);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Error loading data");
    } finally {
      setLoadingState(false);
    }
  };

  useEffect(() => {
    fetchInventory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---- Warehouse labor total ----
  const getRecordLaborCost = (rec) => {
    if (!Array.isArray(rec.labors)) return 0;
    return rec.labors.reduce((sum, l) => {
      const v = Number(l.cost);
      return sum + (isNaN(v) ? 0 : v);
    }, 0);
  };

  const warehouseLaborTotal = items.reduce(
    (sum, rec) => sum + getRecordLaborCost(rec),
    0
  );

  // ---- Dry delivery monthly total (based on monthly count) ----
  // Each entry in stores[] is one dry delivery for that shop.
  const dryDeliveryCount = items.reduce((sum, rec) => {
    if (!Array.isArray(rec.stores)) return sum;
    const countForRecord = rec.stores.filter(
      (s) => (s.shop || "").trim() !== ""
    ).length;
    return sum + countForRecord;
  }, 0);

  const currentMonthLabel = (() => {
    const now = new Date();
    return now.toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
    });
  })();

  const handleWarehouseClick = () => {
    if (onGoWarehouseLog) onGoWarehouseLog();
  };

  const handleDryClick = () => {
    if (onGoDryDelivery) onGoDryDelivery();
  };

  return (
    <div className="app-card dashboard-card">
      <div className="top-bar">
        <div className="dashboard-user">
          Admin: <strong>{username}</strong>
        </div>
        <button
          type="button"
          className="btn btn-secondary small"
          onClick={onLogout}
        >
          Logout
        </button>
      </div>

      <h2 className="dashboard-title">Admin Dashboard</h2>
      <p className="help-text">
        Overview for <strong>{currentMonthLabel}</strong>.
      </p>

      {/* 2 main buttons */}
      <div className="admin-buttons-row">
        <button
          type="button"
          className="btn btn-primary admin-main-button"
          onClick={handleWarehouseClick}
        >
          Warehouse Log
        </button>
        <button
          type="button"
          className="btn btn-primary admin-main-button"
          onClick={handleDryClick}
        >
          Dry Delivery
        </button>
      </div>

      {loading && <div className="dashboard-status">Loading...</div>}
      {error && <div className="dashboard-error">{error}</div>}

      {!loading && !error && (
        <div className="dashboard-summary">
          <div className="summary-card">
            <div className="summary-label">
              Warehouse Labor Cost ({currentMonthLabel})
            </div>
            <div className="summary-value">
              {warehouseLaborTotal.toFixed(2)}
            </div>
          </div>

          <div className="summary-card summary-dry">
            <div className="summary-label">
              Dry Deliveries ({currentMonthLabel})
            </div>
            <div className="summary-value">{dryDeliveryCount}</div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
