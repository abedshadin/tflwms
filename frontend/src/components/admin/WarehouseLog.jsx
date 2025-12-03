// src/components/admin/WarehouseLog.jsx

function WarehouseLog({ dateStats, getRecordLaborCost }) {
  if (!dateStats || dateStats.length === 0) {
    return (
      <div className="dashboard-status">
        No warehouse data for this month.
      </div>
    );
  }

  return (
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
                  · {rows.length} record{rows.length !== 1 ? "s" : ""}
                </span>
              </div>
              <div className="dashboard-date-total">
                Day Labor Cost: <strong>{dayLaborTotal.toFixed(2)}</strong>
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
                  </tr>
                </thead>
                <tbody>
                  {rows.map((it) => {
                    const dt = it.submittedDateTime
                      ? new Date(it.submittedDateTime)
                      : null;
                    const timeStr = dt
                      ? dt.toLocaleTimeString(undefined, {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "";

                    const receivingText = (it.receiving || [])
                      .map(
                        (r) =>
                          `${r.name || ""} (${r.qty || 0} ${
                            r.unit || ""
                          })`
                      )
                      .join(", ");

                    const loadingText = (it.loading || [])
                      .map(
                        (l) =>
                          `${l.name || ""} (${l.qty || 0} ${
                            l.unit || ""
                          })`
                      )
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
  );
}

export default WarehouseLog;
