import {
  Box,
  Button,
  Card,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";

type PartnerRow = {
  company: string;
  project: string;
  dateApplied: string;
  tier: string;
  status: "Pending" | "Active";
};

const rows: PartnerRow[] = [
  {
    company: "Google DeepMind",
    project: "UI/UX Designer",
    dateApplied: "Feb 07, 2026",
    tier: "Platinum",
    status: "Pending",
  },
  {
    company: "Microsoft Research",
    project: "Research Analyst",
    dateApplied: "Feb 07, 2026",
    tier: "Gold",
    status: "Active",
  },
  {
    company: "Spotify",
    project: "Product Designer",
    dateApplied: "Feb 07, 2026",
    tier: "Gold",
    status: "Active",
  },
  {
    company: "Tencent",
    project: "Data Scientist",
    dateApplied: "Feb 07, 2026",
    tier: "Silver",
    status: "Active",
  },
  {
    company: "BBC News",
    project: "Frontend Developer",
    dateApplied: "Feb 07, 2026",
    tier: "Gold",
    status: "Active",
  },
];

function statusColor(status: PartnerRow["status"]) {
  return status === "Pending" ? "#d29a00" : "#18a957";
}

export default function PartnersTable() {
  return (
    <Card
      sx={{
        borderRadius: "8px",
        border: "1px solid #e7e9ee",
        boxShadow: "none",
        overflow: "hidden",
      }}
    >
      <Box sx={{ px: 2, py: 1.6, borderBottom: "1px solid #eceef2" }}>
        <Typography sx={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>
          Partner Table
        </Typography>
      </Box>

      <Box
        sx={{
          px: 2,
          py: 1.5,
          display: "flex",
          alignItems: "center",
          gap: 1.2,
        }}
      >
        <TextField
          size="small"
          placeholder="Search 2000 records..."
          sx={{
            width: 180,
            "& .MuiOutlinedInput-root": {
              height: 34,
              fontSize: 12,
              backgroundColor: "#fff",
            },
          }}
        />

        <Button
          variant="contained"
          sx={{
            minWidth: 96,
            height: 34,
            borderRadius: "2px",
            boxShadow: "none",
            textTransform: "none",
            backgroundColor: "#1479e9",
          }}
        >
          Search
        </Button>
      </Box>

      <TableContainer sx={{ overflowX: "auto" }}>
        <Table sx={{ minWidth: 900 }}>
          <TableHead>
            <TableRow sx={{ backgroundColor: "#111111" }}>
              {[
                "COMPANY NAME",
                "PROJECT NAME",
                "DATE APPLIED",
                "TIER",
                "STATUS",
                "ACTION",
              ].map((head) => (
                <TableCell
                  key={head}
                  sx={{
                    color: "#fff",
                    fontSize: 10,
                    fontWeight: 600,
                    borderBottom: "none",
                    py: 1.5,
                  }}
                >
                  {head}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {rows.map((row) => (
              <TableRow key={`${row.company}-${row.project}`}>
                <TableCell sx={{ py: 1.8, fontSize: 12 }}>{row.company}</TableCell>
                <TableCell sx={{ py: 1.8, fontSize: 12 }}>{row.project}</TableCell>
                <TableCell sx={{ py: 1.8, fontSize: 12 }}>{row.dateApplied}</TableCell>
                <TableCell sx={{ py: 1.8, fontSize: 12 }}>{row.tier}</TableCell>
                <TableCell sx={{ py: 1.8, fontSize: 12, color: statusColor(row.status) }}>
                  {row.status}
                </TableCell>
                <TableCell sx={{ py: 1.8 }}>
                  {row.status === "Pending" ? (
                    <Stack direction="row" spacing={1}>
                      <Button
                        size="small"
                        sx={{
                          minWidth: 72,
                          height: 24,
                          borderRadius: "999px",
                          textTransform: "none",
                          fontSize: 11,
                          color: "#fff",
                          backgroundColor: "#46c338",
                          "&:hover": { backgroundColor: "#38aa2d" },
                        }}
                      >
                        Approve
                      </Button>

                      <Button
                        size="small"
                        sx={{
                          minWidth: 64,
                          height: 24,
                          borderRadius: "999px",
                          textTransform: "none",
                          fontSize: 11,
                          color: "#fff",
                          backgroundColor: "#ff2b2b",
                          "&:hover": { backgroundColor: "#e62121" },
                        }}
                      >
                        Reject
                      </Button>
                    </Stack>
                  ) : (
                    <Button
                      size="small"
                      sx={{
                        minWidth: 64,
                        height: 24,
                        borderRadius: "999px",
                        textTransform: "none",
                        fontSize: 11,
                        color: "#fff",
                        backgroundColor: "#1d39ff",
                        "&:hover": { backgroundColor: "#1630df" },
                      }}
                    >
                      Edit
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Box
        sx={{
          px: 2,
          py: 1.2,
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
          gap: 2,
          fontSize: 12,
          color: "#6b7280",
        }}
      >
        <Typography sx={{ fontSize: 12 }}>Row per page 5</Typography>
        <Typography sx={{ fontSize: 12 }}>1-5 of 13</Typography>
        <Typography sx={{ fontSize: 12 }}>{`<  >`}</Typography>
      </Box>
    </Card>
  );
}