import { useLocation } from "react-router-dom";

function PlaceholderPage() {
  const location = useLocation();

  const pageName = location.pathname
    .replace("/", "")
    .replaceAll("-", " ");

  const formattedName =
    pageName.charAt(0).toUpperCase() +
    pageName.slice(1);

  return (
    <div
      style={{
        minHeight: "calc(100vh - 76px)",
        padding: "40px",
        background: "#eef1f4",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          maxWidth: "900px",
          margin: "0 auto",
          padding: "50px",
          background: "#ffffff",
          border: "1px solid #e1e5ea",
          borderRadius: "16px",
          textAlign: "center",
          boxShadow:
            "0 6px 20px rgba(31, 41, 55, 0.045)",
        }}
      >
        <div
          style={{
            width: "55px",
            height: "55px",
            margin: "0 auto 18px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "14px",
            background: "#f1f4f7",
            color: "#536273",
            fontSize: "22px",
            fontWeight: "800",
          }}
        >
          ▣
        </div>

        <p
          style={{
            margin: "0 0 8px",
            fontSize: "11px",
            fontWeight: "800",
            letterSpacing: "1.5px",
            textTransform: "uppercase",
            color: "#7a8492",
          }}
        >
          BOUSSAKSOU CONSTRUCTION
        </p>

        <h1
          style={{
            margin: "0 0 10px",
            fontSize: "25px",
            color: "#18212f",
          }}
        >
          {formattedName}
        </h1>

        <p
          style={{
            margin: 0,
            color: "#7a8492",
            fontSize: "13px",
            lineHeight: 1.6,
          }}
        >
          Ce module sera développé prochainement.
        </p>
      </div>
    </div>
  );
}

export default PlaceholderPage;