import React from "react";

function DateFlag({ date }) {
  const d = new Date(date);

  const day = d.toLocaleDateString(undefined, { day: "2-digit" });
  const month = d.toLocaleDateString(undefined, { month: "short" });
  const year = d.getFullYear();

  return (
    <div style={styles.flag}>
      <div style={styles.top}>
        <span>{day}</span>
        <span style={{ marginLeft: "4px" }}>{month.toLocaleUpperCase()}</span>
      </div>
      <div style={styles.bottom}>{year}</div>
    </div>
  );
}

const styles = {
  flag: {
    display: "inline-flex",
    flexDirection: "column",
    alignItems: "center",
    border: "1px solid #ccc",
    borderRadius: "6px",
    overflow: "hidden",
    fontFamily: "sans-serif",
    minWidth: "70px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
  },
  top: {
    backgroundColor: "#eee",
    padding: "4px",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: "0.8rem",
    width: "100%",
    borderBottom: "1px solid #ccc",
  },
  bottom: {
    padding: "4px",
    fontSize: "0.75rem",
    color: "#555",
  },
};

export default DateFlag;
