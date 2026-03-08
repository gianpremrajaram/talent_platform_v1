import { Box, Card, Typography } from "@mui/material";

const cards = [
  {
    title: "Total Active Students",
    value: "11293",
    tag: "↗ 70.5%",
    tagColor: "#74b94a",
    chart: "bars-blue",
  },
  {
    title: "Pending Approvals",
    value: "12",
    tag: "↘ 70.5%",
    tagColor: "#ff6b6b",
    chart: "line-red",
  },
  {
    title: "Active Partners",
    value: "293",
    tag: "↗ 70.5%",
    tagColor: "#f6b31f",
    chart: "bars-yellow",
  },
  {
    title: "Placement Rate",
    value: "11333",
    tag: "↗ 70.5%",
    tagColor: "#6ba8ff",
    chart: "line-blue",
  },
];

function MiniChart({ type }: { type: string }) {
  if (type === "bars-blue") {
    return (
      <Box sx={{ display: "flex", alignItems: "flex-end", gap: "3px", height: 48 }}>
        {[34, 38, 31, 28, 26, 22, 20, 18, 24, 29, 33, 35, 30, 24, 18, 15, 21, 29, 26].map(
          (h, i) => (
            <Box
              key={i}
              sx={{
                width: 4,
                height: h,
                borderRadius: "2px 2px 0 0",
                backgroundColor: "#2f7df6",
              }}
            />
          )
        )}
      </Box>
    );
  }

  if (type === "bars-yellow") {
    return (
      <Box sx={{ display: "flex", alignItems: "flex-end", gap: "3px", height: 48 }}>
        {[38, 34, 36, 31, 28, 25, 27, 24, 20, 18, 22, 26, 29, 31, 34, 28, 24, 19, 21].map(
          (h, i) => (
            <Box
              key={i}
              sx={{
                width: 4,
                height: h,
                borderRadius: "2px 2px 0 0",
                backgroundColor: "#f4b21a",
              }}
            />
          )
        )}
      </Box>
    );
  }

  return (
    <Box sx={{ position: "relative", height: 48, mt: 1 }}>
      <svg width="100%" height="48" viewBox="0 0 180 48" preserveAspectRatio="none">
        <path
          d={
            type === "line-red"
              ? "M0 10 C12 4, 24 20, 36 18 S60 30, 72 28 S96 24, 108 32 S132 18, 144 24 S168 30, 180 20"
              : "M0 36 C12 20, 24 10, 36 24 S60 38, 72 26 S96 14, 108 22 S132 18, 144 28 S168 16, 180 30"
          }
          fill="none"
          stroke={type === "line-red" ? "#ff5f5f" : "#4a90ff"}
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>
    </Box>
  );
}

export default function AdminStatsCards() {
  return (
    <Box sx={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 1.8 }}>
      {cards.map((card) => (
        <Card
          key={card.title}
          sx={{
            borderRadius: "8px",
            border: "1px solid #e8eaef",
            boxShadow: "none",
            px: 1.2,
            py: 1.1,
          }}
        >
          <Typography sx={{ fontSize: 11, color: "#9ca3af", mb: 0.75 }}>
            {card.title}
          </Typography>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography sx={{ fontSize: 26, fontWeight: 700, color: "#1f2937" }}>
              {card.value}
            </Typography>

            <Box
              sx={{
                px: 0.8,
                py: 0.15,
                borderRadius: "4px",
                fontSize: 10,
                color: card.tagColor,
                border: `1px solid ${card.tagColor}55`,
                lineHeight: 1.2,
              }}
            >
              {card.tag}
            </Box>
          </Box>

          <Box sx={{ mt: 1 }}>
            <MiniChart type={card.chart} />
          </Box>
        </Card>
      ))}
    </Box>
  );
}