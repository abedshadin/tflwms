// src/components/admin/DryDeliveryPage.jsx
import { useEffect, useState } from "react";
import api from "../../api";
import "../AdminDashboard.css";

function DryDeliveryPage({ token, username, onLogout, onBack }) {
  const [items, setItems] = useState([]); // inventory docs
  const [loading, setLoadingState] = useState(false);
  const [error, setError] = useState("");

  // month in "YYYY-MM"
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    return `${yyyy}-${mm}`;
  });

  // ====== FETCH INVENTORY BY MONTH ======

  const fetchInventory = async (monthStr) => {
    setLoadingState(true);
    setError("");

    try {
      const value = monthStr || selectedMonth;
      let params = {};
      if (value) {
        const [y, m] = value.split("-");
        params = { year: y, month: m }; // backend filter
      }

      const res = await api.get("/inventory", {
        headers: { Authorization: `Bearer ${token}` },
        params,
      });

      setItems(res.data || []);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Error loading dry delivery data");
    } finally {
      setLoadingState(false);
    }
  };

  useEffect(() => {
    fetchInventory(selectedMonth);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleMonthChange = (e) => {
    const value = e.target.value; // "YYYY-MM"
    setSelectedMonth(value);
    fetchInventory(value);
  };

  // ====== HELPERS ======

  const getRecordDeliveryCount = (rec) => {
    if (!Array.isArray(rec.stores)) return 0;
    return rec.stores.filter((s) => (s.shop || "").trim() !== "").length;
  };

  const getRecordTotalQty = (rec) => {
    if (!Array.isArray(rec.stores)) return 0;
    return rec.stores.reduce((sum, s) => {
      const v = Number(s.qty);
      return sum + (isNaN(v) ? 0 : v);
    }, 0);
  };

  // MONTH TOTALS
  const monthDeliveryCount = items.reduce(
    (sum, rec) => sum + getRecordDeliveryCount(rec),
    0
  );

  const monthTotalQty = items.reduce(
    (sum, rec) => sum + getRecordTotalQty(rec),
    0
  );

  // Monthly shop summary
  const monthlyShopMap = {};
  items.forEach((rec) => {
    (rec.stores || []).forEach((s) => {
      const shopName = (s.shop || "").trim();
      if (!shopName) return;
      const q = Number(s.qty);
      if (!monthlyShopMap[shopName]) {
        monthlyShopMap[shopName] = { deliveries: 0, totalQty: 0 };
      }
      monthlyShopMap[shopName].deliveries += 1;
      monthlyShopMap[shopName].totalQty += isNaN(q) ? 0 : q;
    });
  });
  const monthlyShopEntries = Object.entries(monthlyShopMap);

  const selectedMonthLabel = (() => {
    if (!selectedMonth) return "";
    const [y, m] = selectedMonth.split("-");
    const date = new Date(Number(y), Number(m) - 1, 1);
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
    });
  })();

  // GROUP BY DATE
  const groupedByDate = items.reduce((acc, rec) => {
    if (!rec.submittedDateTime) return acc;
    const d = new Date(rec.submittedDateTime);
    const key = d.toISOString().slice(0, 10); // YYYY-MM-DD
    if (!acc[key]) acc[key] = [];
    acc[key].push(rec);
    return acc;
  }, {});
  const sortedDates = Object.keys(groupedByDate).sort((a, b) =>
    a < b ? 1 : -1
  );

  return (
    <div className="app-card dashboard-card">
      {/* Top bar */}
      <div className="top-bar">
        <div className="dashboard-user">
          Admin: <strong>{username}</strong>
        </div>
        <div className="dashboard-top-actions">
          <button
            type="button"
            className="btn btn-secondary small"
            onClick={onBack}
          >
            ← Dashboard
          </button>
          <div className="dashboard-month-picker">
            <label className="month-label">Month</label>
            <input
              type="month"
              value={selectedMonth}
              onChange={handleMonthChange}
            />
          </div>
          <button
            type="button"
            className="btn btn-secondary small"
            onClick={() => fetchInventory()}
          >
            Refresh
          </button>
          <button
            type="button"
            className="btn btn-secondary small"
            onClick={onLogout}
          >
            Logout
          </button>
        </div>
      </div>

      <h2 className="dashboard-title">Dry Delivery</h2>
      <p className="help-text">
        Using <code>stores[&#123; shop, qty &#125;]</code> from inventory. Day-wise
        and shop-wise analytics for{" "}
        <strong>{selectedMonthLabel || "selected month"}</strong>.
      </p>

      {/* MONTH SUMMARY CARDS */}
      {!loading && !error && items.length > 0 && (
        <div className="dashboard-summary">
          <div className="summary-card summary-dry">
            <div className="summary-label">
              Total Dry Deliveries ({selectedMonthLabel})
            </div>
            <div className="summary-value">{monthDeliveryCount}</div>
          </div>
          <div className="summary-card">
            <div className="summary-label">
              Total Dry Qty ({selectedMonthLabel})
            </div>
            <div className="summary-value">{monthTotalQty.toFixed(2)}</div>
          </div>
        </div>
      )}

      {loading && <div className="dashboard-status">Loading...</div>}
      {error && <div className="dashboard-error">{error}</div>}
      {!loading && !error && items.length === 0 && (
        <div className="dashboard-status">
          No dry delivery data for this month.
        </div>
      )}

      {/* MONTHLY SHOP SUMMARY */}
      {!loading && !error && monthlyShopEntries.length > 0 && (
        <div className="dashboard-content">
          <section className="dashboard-date-block">
            <h3 className="dashboard-subtitle">Monthly Shop Summary</h3>
            <div className="table-wrapper" style={{ marginBottom: 12 }}>
              <table className="table table-compact">
                <thead>
                  <tr>
                    <th>Shop</th>
                    <th>Deliveries</th>
                    <th>Total Qty</th>
                  </tr>
                </thead>
                <tbody>
                  {monthlyShopEntries.map(([shopName, info]) => (
                    <tr key={shopName}>
                      <td>{shopName}</td>
                      <td>{info.deliveries}</td>
                      <td>{info.totalQty.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      )}

      {/* DAY-WISE DETAILS */}
      {!loading && !error && sortedDates.length > 0 && (
        <div className="dashboard-content">
          {sortedDates.map((dateKey) => {
            const records = groupedByDate[dateKey];
            const niceDate = new Date(dateKey).toLocaleDateString(undefined, {
              year: "numeric",
              month: "short",
              day: "numeric",
            });

            // day totals
            const dayDeliveryCount = records.reduce(
              (sum, rec) => sum + getRecordDeliveryCount(rec),
              0
            );
            const dayTotalQty = records.reduce(
              (sum, rec) => sum + getRecordTotalQty(rec),
              0
            );

            // store-wise per day
            const storeMap = {};
            records.forEach((rec) => {
              (rec.stores || []).forEach((s) => {
                const shopName = (s.shop || "").trim();
                if (!shopName) return;
                const q = Number(s.qty);
                if (!storeMap[shopName]) {
                  storeMap[shopName] = { deliveries: 0, totalQty: 0 };
                }
                storeMap[shopName].deliveries += 1;
                storeMap[shopName].totalQty += isNaN(q) ? 0 : q;
              });
            });
            const storeEntries = Object.entries(storeMap);

            // detail rows: one per store row
            const detailRows = [];
            records.forEach((rec) => {
              const dt = rec.submittedDateTime
                ? new Date(rec.submittedDateTime)
                : null;
              const timeStr = dt
                ? dt.toLocaleTimeString(undefined, {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "";

              (rec.stores || []).forEach((s, idx) => {
                const shopName = (s.shop || "").trim();
                if (!shopName) return;
                const q = Number(s.qty);
                detailRows.push({
                  key: `${rec._id}_${idx}`,
                  time: timeStr,
                  shop: shopName,
                  qty: isNaN(q) ? 0 : q,
                });
              });
            });

            return (
              <section className="dashboard-date-block" key={dateKey}>
                {/* Day header */}
                <div className="dashboard-date-header">
                  <div>
                    <span className="dashboard-date-label">📦 {niceDate}</span>
                    <span className="dashboard-date-count">
                      {" "}
                      · {dayDeliveryCount} delivery
                      {dayDeliveryCount !== 1 ? "ies" : ""}
                    </span>
                  </div>
                  <div className="dashboard-date-total">
                    Day Total Qty:{" "}
                    <strong>{dayTotalQty.toFixed(2)}</strong>
                  </div>
                </div>

                {/* Store-wise summary (day) */}
                <div className="table-wrapper" style={{ marginBottom: 8 }}>
                  <table className="table table-compact">
                    <thead>
                      <tr>
                        <th>Shop</th>
                        <th>Deliveries</th>
                        <th>Total Qty</th>
                      </tr>
                    </thead>
                    <tbody>
                      {storeEntries.map(([shopName, info]) => (
                        <tr key={shopName}>
                          <td>{shopName}</td>
                          <td>{info.deliveries}</td>
                          <td>{info.totalQty.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Detail rows per store-delivery */}
                {/* <div className="table-wrapper">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Time</th>
                        <th>Shop</th>
                        <th>Qty</th>
                      </tr>
                    </thead>
                    <tbody>
                      {detailRows.map((row) => (
                        <tr key={row.key}>
                          <td>{row.time}</td>
                          <td>{row.shop}</td>
                          <td>{row.qty.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div> */}
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default DryDeliveryPage;
