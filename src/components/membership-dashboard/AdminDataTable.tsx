"use client";

import { ChangeEvent, KeyboardEvent, ReactNode, useEffect, useMemo, useState } from "react";
import {
  Box,
  SxProps,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Theme,
  Typography,
} from "@mui/material";

export type AdminTableColumn = {
  key: string;
  label: string;
  width?: string;
};

export type AdminTableCell = {
  key: string;
  content: ReactNode;
  sx?: SxProps<Theme>;
};

type AdminDataTableProps<T> = {
  columns: AdminTableColumn[];
  rows: T[];
  getRowKey: (row: T, index: number) => string;
  getCells: (row: T, index: number) => AdminTableCell[];
  getRowSx?: (row: T, index: number) => SxProps<Theme>;
  onRowClick?: (row: T, index: number) => void;
  emptyState?: ReactNode;
};

const DEFAULT_ROWS_PER_PAGE = 5;
const ROWS_PER_PAGE_OPTIONS = [5, 10, 25];

const defaultBodyCellSx: SxProps<Theme> = {
  py: 2,
  px: 1.2,
  fontSize: 12,
  color: "#1f2937",
  verticalAlign: "middle",
  whiteSpace: "normal",
  wordBreak: "break-word",
};

export default function AdminDataTable<T>({
  columns,
  rows,
  getRowKey,
  getCells,
  getRowSx,
  onRowClick,
  emptyState,
}: AdminDataTableProps<T>) {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(DEFAULT_ROWS_PER_PAGE);
  const [pageInput, setPageInput] = useState("1");

  const totalPages = Math.max(1, Math.ceil(rows.length / rowsPerPage));
  const maxPage = totalPages - 1;

  useEffect(() => {
    if (page > maxPage) {
      setPage(maxPage);
    }
  }, [page, maxPage]);

  useEffect(() => {
    setPageInput(String(page + 1));
  }, [page]);

  const pagedRows = useMemo(() => {
    const start = page * rowsPerPage;
    return rows.slice(start, start + rowsPerPage);
  }, [rows, page, rowsPerPage]);

  function handleChangePage(_event: unknown, nextPage: number) {
    setPage(nextPage);
  }

  function handleChangeRowsPerPage(event: ChangeEvent<HTMLInputElement>) {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  }

  function jumpToPage(rawValue: string) {
    if (!rawValue.trim()) {
      setPageInput(String(page + 1));
      return;
    }

    const parsed = Number(rawValue);
    if (!Number.isFinite(parsed)) {
      setPageInput(String(page + 1));
      return;
    }

    const targetPage = Math.min(maxPage, Math.max(0, Math.floor(parsed) - 1));
    setPage(targetPage);
    setPageInput(String(targetPage + 1));
  }

  return (
    <Box>
      <TableContainer sx={{ overflowX: "hidden" }}>
        <Table sx={{ width: "100%", tableLayout: "fixed" }}>
          <colgroup>
            {columns.map((column) => (
              <col key={column.key} style={column.width ? { width: column.width } : undefined} />
            ))}
          </colgroup>

          <TableHead>
            <TableRow sx={{ backgroundColor: "#111111" }}>
              {columns.map((column) => (
                <TableCell
                  key={column.key}
                  sx={{
                    color: "#fff",
                    fontSize: 10,
                    fontWeight: 600,
                    borderBottom: "none",
                    py: 1.15,
                    px: 1.2,
                    letterSpacing: "0.04em",
                  }}
                >
                  {column.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {rows.length === 0 ? (
              <TableRow
                sx={{
                  backgroundColor: "#ffffff",
                  "& td": {
                    borderBottom: "1px solid #ccd3dd",
                  },
                }}
              >
                <TableCell colSpan={columns.length} sx={{ py: 5, textAlign: "center" }}>
                  {emptyState}
                </TableCell>
              </TableRow>
            ) : null}

            {pagedRows.map((row, rowIndex) => {
              const absoluteIndex = page * rowsPerPage + rowIndex;
              const cells = getCells(row, absoluteIndex);
              const rowSx = getRowSx?.(row, absoluteIndex);
              const isClickable = typeof onRowClick === "function";

              return (
                <TableRow
                  key={getRowKey(row, absoluteIndex)}
                  hover={isClickable}
                  onClick={isClickable ? () => onRowClick(row, absoluteIndex) : undefined}
                  sx={[
                    {
                      backgroundColor: absoluteIndex % 2 === 0 ? "#ffffff" : "#f7f9fc",
                      "& td": {
                        borderBottom: "1px solid #ccd3dd",
                        color: "#1f2937",
                      },
                    },
                    isClickable ? { cursor: "pointer" } : {},
                    rowSx,
                  ]}
                >
                  {cells.map((cell) => (
                    <TableCell key={cell.key} sx={{ ...defaultBodyCellSx, ...cell.sx }}>
                      {cell.content}
                    </TableCell>
                  ))}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 1.5,
          borderTop: "1px solid #eceef2",
          pr: 1,
        }}
      >
        <TablePagination
          component="div"
          count={rows.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={ROWS_PER_PAGE_OPTIONS}
          showFirstButton={false}
          showLastButton={false}
          sx={{
            flex: 1,
            "& .MuiTablePagination-toolbar": {
              minHeight: 44,
              pl: 1,
              pr: 0.5,
            },
            "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows, & .MuiTablePagination-input":
              {
                fontSize: 12,
                color: "#6b7280",
              },
          }}
        />

        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography sx={{ fontSize: 12, color: "#6b7280", whiteSpace: "nowrap" }}>
            Go to page
          </Typography>
          <TextField
            size="small"
            value={pageInput}
            onChange={(event) => setPageInput(event.target.value)}
            onBlur={() => jumpToPage(pageInput)}
            onKeyDown={(event: KeyboardEvent<HTMLInputElement>) => {
              if (event.key === "Enter") {
                jumpToPage(pageInput);
              }
            }}
            inputProps={{
              min: 1,
              max: totalPages,
              inputMode: "numeric",
              pattern: "[0-9]*",
              style: { textAlign: "center" },
            }}
            sx={{
              width: 72,
              "& .MuiOutlinedInput-root": {
                height: 30,
                fontSize: 12,
                backgroundColor: "#fff",
              },
            }}
          />
          <Typography sx={{ fontSize: 12, color: "#6b7280", whiteSpace: "nowrap" }}>
            / {totalPages}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
