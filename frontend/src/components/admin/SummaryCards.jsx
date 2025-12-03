// src/components/admin/SummaryCards.jsx
function SummaryCards({ selectedMonthLabel, overallLaborTotal, dryDeliveryCount }) {
  return (
    <div className="dashboard-summary">
      <div className="summary-card">
        <div className="summary-label">
          Warehouse Labor Cost ({selectedMonthLabel})
        </div>
        <div className="summary-value">
          {overallLaborTotal.toFixed(2)}
        </div>
      </div>

      <div className="summary-card summary-dry">
        <div className="summary-label">
          Dry Deliveries ({selectedMonthLabel})
        </div>
        <div className="summary-value">
          {dryDeliveryCount}
        </div>
      </div>
    </div>
  );
}

export default SummaryCards;
