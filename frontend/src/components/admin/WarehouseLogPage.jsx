// src/components/admin/WarehouseLogPage.jsx
import { useEffect, useState } from "react";
import api from "../../api";
import "../AdminDashboard.css"; // reuse dashboard styles

function WarehouseLogPage({ token, username, onLogout, onBack }) {
  const [items, setItems] = useState([]);
  const [loading, setLoadingState] = useState(false);
  const [error, setError] = useState("");

  // month in "YYYY-MM"
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    return `${yyyy}-${mm}`;
  });

  // ====== API ======

  const fetchInventory = async (monthStr) => {
    setLoadingState(true);
    setError("");
    try {
      const value = monthStr || selectedMonth;

      let params = {};
      if (value) {
        const [y, m] = value.split("-");
        params = { year: y, month: m };
      }

      const res = await api.get("/inventory", {
        headers: { Authorization: `Bearer ${token}` },
        params,
      });
      setItems(res.data || []);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Error loading warehouse data");
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

  // ====== Calculations ======

  const getRecordLaborCost = (rec) => {
    if (!rec.labors || !Array.isArray(rec.labors)) return 0;
    return rec.labors.reduce((sum, l) => {
      const v = Number(l.cost);
      return sum + (isNaN(v) ? 0 : v);
    }, 0);
  };

  const groupedByDate = items.reduce((acc, it) => {
    if (!it.submittedDateTime) return acc;
    const d = new Date(it.submittedDateTime);
    const key = d.toISOString().slice(0, 10); // YYYY-MM-DD
    if (!acc[key]) acc[key] = [];
    acc[key].push(it);
    return acc;
  }, {});

  const sortedDates = Object.keys(groupedByDate).sort((a, b) =>
    a < b ? 1 : -1
  );

  const dateStats = sortedDates.map((dateKey) => {
    const rows = groupedByDate[dateKey];
    const dayLaborTotal = rows.reduce(
      (sum, rec) => sum + getRecordLaborCost(rec),
      0
    );
    return { dateKey, rows, dayLaborTotal };
  });

  const overallLaborTotal = dateStats.reduce(
    (sum, d) => sum + d.dayLaborTotal,
    0
  );

  const selectedMonthLabel = (() => {
    if (!selectedMonth) return "";
    const [y, m] = selectedMonth.split("-");
    const date = new Date(Number(y), Number(m) - 1, 1);
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
    });
  })();

  // ====== Export CSV ======

  const handleExportExcel = () => {
    if (!items || items.length === 0) {
      alert("No warehouse data to export for this month.");
      return;
    }

    const header = [
      "Date",
      "Labor No",
      "Labor Total Cost",
      "Start",
      "End",
      "Rec",
      "Loading",
    ];
    const rows = [header];

    items.forEach((it) => {
      const d = it.submittedDateTime ? new Date(it.submittedDateTime) : null;
      const dateStr = d ? d.toISOString().slice(0, 10) : "";

      const laborNo = it.laborCount || 0;
      const laborTotalCost = getRecordLaborCost(it).toFixed(2);
      const start = it.startTime || "";
      const end = it.endTime || "";

      const recText = (it.receiving || [])
        .map((r) => `${r.name || ""} (${r.qty || 0} ${r.unit || ""})`)
        .join("; ");

      const loadingText = (it.loading || [])
        .map((l) => `${l.name || ""} (${l.qty || 0} ${l.unit || ""})`)
        .join("; ");

      rows.push([
        dateStr,
        String(laborNo),
        laborTotalCost,
        start,
        end,
        recText,
        loadingText,
      ]);
    });

    const csvString = rows
      .map((row) =>
        row
          .map((cell) => {
            const value = cell == null ? "" : String(cell);
            const escaped = value.replace(/"/g, '""');
            return `"${escaped}"`;
          })
          .join(",")
      )
      .join("\r\n");

    const blob = new Blob([csvString], {
      type: "text/csv;charset=utf-8;",
    });

    const [y, m] = selectedMonth.split("-");
    const fileName = `warehouse_${y}_${m}.csv`;

    if (navigator.msSaveBlob) {
      navigator.msSaveBlob(blob, fileName);
    } else {
      const link = document.createElement("a");
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", fileName);
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    }
  };

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
            onClick={handleExportExcel}
          >
            Export Excel
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

      <h2 className="dashboard-title">Warehouse Log</h2>
      <p className="help-text">
        Showing warehouse records for{" "}
        <strong>{selectedMonthLabel || "selected month"}</strong>, grouped by
        date with labor cost totals.
      </p>

      {/* Monthly summary */}
      {!loading && !error && dateStats.length > 0 && (
        <div className="dashboard-summary">
          <div className="summary-card">
            <div className="summary-label">
              Total Labor Cost ({selectedMonthLabel})
            </div>
            <div className="summary-value">
              {overallLaborTotal.toFixed(2)}
            </div>
          </div>
        </div>
      )}

      {loading && <div className="dashboard-status">Loading...</div>}
      {error && <div className="dashboard-error">{error}</div>}

      {!loading && !error && dateStats.length === 0 && (
        <div className="dashboard-status">
          No warehouse data for this month.
        </div>
      )}

      {!loading && !error && dateStats.length > 0 && (
        <div className="dashboard-content">
          {dateStats.map(({ dateKey, rows, dayLaborTotal }) => {
            const niceDate = new Date(dateKey).toLocaleDateString(undefined, {
              year: "numeric",
              month: "short",
              day: "numeric",
            });

            return (
              <section className="dashboard-date-block" key={dateKey}>
                <div className="dashboard-date-header">
                  <div>
                    <span className="dashboard-date-label">📅 {niceDate}</span>
                    <span className="dashboard-date-count">
                      {" "}
                      · {rows.length} record
                      {rows.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                  <div className="dashboard-date-total">
                    Day Labor Cost:{" "}
                    <strong>{dayLaborTotal.toFixed(2)}</strong>
                  </div>
                </div>

                <div className="table-wrapper">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Time</th>
                        <th>Labor Count</th>
                        <th>Labor Cost</th>
                        <th>Start-End</th>
                        <th>Receiving</th>
                        <th>Loading</th>
                        <th>Remarks</th>
                      </tr>
                    </thead>
                    <tbody>
  {rows.map((it) => {
    const dt = it.submittedDateTime ? new Date(it.submittedDateTime) : null;
    const timeStr = dt
      ? dt.toLocaleTimeString(undefined, {
          hour: "2-digit",
          minute: "2-digit",
        })
      : "";

    const receivingText = (it.receiving || [])
      .map((r) => `${r.name || ""} (${r.qty || 0} ${r.unit || ""})`)
      .join(", ");

    const loadingText = (it.loading || [])
      .map((l) => `${l.name || ""} (${l.qty || 0} ${l.unit || ""})`)
      .join(", ");

    const recordLaborCost = getRecordLaborCost(it);

    return (
      <tr key={it._id}>
        <td>{timeStr}</td>
        <td>{it.laborCount}</td>
        <td>{recordLaborCost.toFixed(2)}</td>
        <td>
          {it.startTime} - {it.endTime}
        </td>
        <td>{receivingText}</td>
        <td>{loadingText}</td>
        <td>{it.remarks || "-"}</td> {/* 👈 NEW CELL */}
      </tr>
    );
  })}
</tbody>

                  </table>
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default WarehouseLogPage;
