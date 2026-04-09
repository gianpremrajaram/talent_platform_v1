// src/components/talent-discovery/student-components/JobOpeningsTable.tsx
"use client";

import { useMemo, useState } from "react";
import {
  Avatar,
  Box,
  InputAdornment,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import HighlightOffOutlinedIcon from "@mui/icons-material/HighlightOffOutlined";
import GoogleIcon from "@mui/icons-material/Google";
import {
  DataGrid,
  GridColDef,
  GridRenderCellParams,
  GridRowSelectionModel,
} from "@mui/x-data-grid";

type JobRow = {
  id: number;
  jobId: string;
  companyName: string;
  email: string;
  role: string;
  location: string;
  salary: string;
  status: "Applied" | "Not Applied";
};

const rows: JobRow[] = [
  //TODO: populate with real data from the datavbase.
  {
    id: 1,
    jobId: "#790841",
    companyName: "Carson Darrin",
    email: "carson.darrin@devias.io",
    role: "Hong Kong, China",
    location: "Hong Kong",
    salary: "100,000 $",
    status: "Not Applied",
  },
  {
    id: 2,
    jobId: "#790842",
    companyName: "Carson Darrin",
    email: "carson.darrin@devias.io",
    role: "North Canton, Ohio, USA",
    location: "Hong Kong",
    salary: "100,000 $",
    status: "Not Applied",
  },
  {
    id: 3,
    jobId: "#798699",
    companyName: "Carson Darrin",
    email: "carson.darrin@devias.io",
    role: "Madrid, Madrid, Spain",
    location: "Hong Kong",
    salary: "100,000 $",
    status: "Not Applied",
  },
  {
    id: 4,
    jobId: "#790752",
    companyName: "Carson Darrin",
    email: "carson.darrin@devias.io",
    role: "Murray, Utah, USA",
    location: "Hong Kong",
    salary: "100,000 $",
    status: "Applied",
  },
  {
    id: 5,
    jobId: "#790955",
    companyName: "Carson Darrin",
    email: "carson.darrin@devias.io",
    role: "Salt Lake City, Utah, USA",
    location: "Hong Kong",
    salary: "100,000 $",
    status: "Not Applied",
  },
  {
    id: 6,
    jobId: "#790843",
    companyName: "Carson Darrin",
    email: "carson.darrin@devias.io",
    role: "Murray, Utah, USA",
    location: "Hong Kong",
    salary: "100,000 $",
    status: "Not Applied",
  },
  {
    id: 7,
    jobId: "#790844",
    companyName: "Carson Darrin",
    email: "carson.darrin@devias.io",
    role: "Cleveland, Ohio, USA",
    location: "Hong Kong",
    salary: "100,000 $",
    status: "Not Applied",
  },
  {
    id: 8,
    jobId: "#790845",
    companyName: "Carson Darrin",
    email: "carson.darrin@devias.io",
    role: "Madrid, Madrid, Spain",
    location: "Hong Kong",
    salary: "100,000 $",
    status: "Not Applied",
  },
  {
    id: 9,
    jobId: "#790846",
    companyName: "Carson Darrin",
    email: "carson.darrin@devias.io",
    role: "San Diego, California, USA",
    location: "Hong Kong",
    salary: "100,000 $",
    status: "Not Applied",
  },
];

export default function JobOpeningsTable() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("default");
  const [selectionModel, setSelectionModel] = useState<GridRowSelectionModel>();

  const filteredRows = useMemo(() => {
    let data = [...rows];

    if (search.trim()) {
      const q = search.toLowerCase();
      data = data.filter(
        (row) =>
          row.companyName.toLowerCase().includes(q) ||
          row.role.toLowerCase().includes(q) ||
          row.jobId.toLowerCase().includes(q),
      );
    }

    if (statusFilter !== "all") {
      data = data.filter((row) =>
        statusFilter === "applied"
          ? row.status === "Applied"
          : row.status === "Not Applied",
      );
    }

    if (sortBy === "company") {
      data.sort((a, b) => a.companyName.localeCompare(b.companyName));
    } else if (sortBy === "jobId") {
      data.sort((a, b) => a.jobId.localeCompare(b.jobId));
    }

    return data;
  }, [search, statusFilter, sortBy]);

  const columns: GridColDef<JobRow>[] = [
    {
      field: "jobId",
      headerName: "Job Id",
      flex: 0.9,
      minWidth: 110,
    },
    {
      field: "companyName",
      headerName: "Company Name",
      flex: 1.8,
      minWidth: 220,
      sortable: true,
      renderCell: (params) => (
        <Stack
          direction="row"
          spacing={1.5}
          alignItems="center"
          sx={{
            height: "100%",
            width: "100%",
            overflow: "hidden",
          }}
        >
          {/* //TODO: replace with real company logo when available */}
          <Avatar sx={{ width: 30, height: 30 }} aria-hidden="true">
            <GoogleIcon />
          </Avatar>

          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              minWidth: 0,
            }}
          >
            <Typography
              variant="body2"
              sx={{
                fontWeight: 600,
                lineHeight: 1.2,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {params.row.companyName}
            </Typography>

            <Typography
              variant="caption"
              sx={{
                color: "text.secondary",
                lineHeight: 1.2,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {params.row.email}
            </Typography>
          </Box>
        </Stack>
      ),
    },
    {
      field: "role",
      headerName: "Role / Position",
      flex: 1.6,
      minWidth: 220,
    },
    {
      field: "location",
      headerName: "Location",
      flex: 1,
      minWidth: 130,
    },
    {
      field: "salary",
      headerName: "Salary Range",
      flex: 1,
      minWidth: 140,
    },
    {
      field: "status",
      headerName: "Application Status",
      flex: 1.3,
      minWidth: 190,
      renderCell: (params) => (
        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          sx={{ height: "100%" }}
        >
          {params.row.status === "Applied" ? (
            <CheckCircleOutlineIcon fontSize="small" color="success" aria-hidden="true" />
          ) : (
            <HighlightOffOutlinedIcon fontSize="small" color="error" aria-hidden="true" />
          )}
          <Typography variant="body2">{params.row.status}</Typography>
        </Stack>
      ),
    },
  ];

  return (
    <Box
      sx={{
        mt: 3,
        p: 2.5,
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 3,
        bgcolor: "background.paper",
      }}
    >
      <Box
        sx={{
          mb: 2,
          display: "flex",
          justifyContent: "space-between",
          gap: 2,
          flexWrap: "wrap",
        }}
      >
        <TextField
          placeholder="Search by company or job title"
          size="small"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ minWidth: 280 }}
          inputProps={{ "aria-label": "Search jobs" }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" aria-hidden="true" />
              </InputAdornment>
            ),
          }}
        />

        <Stack direction="row" spacing={2}>
          <TextField
            select
            label="Application status"
            InputLabelProps={{
              shrink: true,
              sx: {
                position: "absolute",
                width: 1,
                height: 1,
                overflow: "hidden",
                clip: "rect(0 0 0 0)",
                clipPath: "inset(50%)",
                whiteSpace: "nowrap",
              },
            }}
            InputProps={{ notched: false }}
            size="small"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            sx={{ minWidth: 140 }}
          >
            <MenuItem value="all">All Status</MenuItem>
            <MenuItem value="applied">Applied</MenuItem>
            <MenuItem value="not-applied">Not Applied</MenuItem>
          </TextField>

          <TextField
            select
            label="Sort by"
            InputLabelProps={{
              shrink: true,
              sx: {
                position: "absolute",
                width: 1,
                height: 1,
                overflow: "hidden",
                clip: "rect(0 0 0 0)",
                clipPath: "inset(50%)",
                whiteSpace: "nowrap",
              },
            }}
            InputProps={{ notched: false }}
            size="small"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            sx={{ minWidth: 140 }}
          >
            <MenuItem value="default">Sort by</MenuItem>
            <MenuItem value="company">Company</MenuItem>
            <MenuItem value="jobId">Job Id</MenuItem>
          </TextField>
        </Stack>
      </Box>

      <Box sx={{ height: 640, width: "100%" }}>
        <DataGrid
          rows={filteredRows}
          columns={columns}
          aria-label="Job openings"
          checkboxSelection
          disableRowSelectionOnClick
          rowHeight={78}
          pagination
          pageSizeOptions={[5, 10, 25]}
          initialState={{
            pagination: {
              paginationModel: { pageSize: 10, page: 0 },
            },
          }}
          sx={{
            border: 0,
            "& .MuiDataGrid-cell": {
              display: "flex",
              alignItems: "center",
              borderBottom: "1px solid",
              borderColor: "divider",
            },
            "& .MuiDataGrid-columnHeaders": {
              bgcolor: "#fafafa",
              borderBottom: "1px solid",
              borderColor: "divider",
            },
            "& .MuiDataGrid-columnHeaderTitle": {
              fontWeight: 600,
            },
          }}
        />
      </Box>
    </Box>
  );
}
