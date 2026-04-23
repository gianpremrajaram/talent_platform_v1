"use client";

import { useState } from "react";
import { Box, ButtonBase, Typography } from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";

export default function CoverLetterPreview({ text }: { text: string }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Box
      sx={{
        bgcolor: "grey.50",
        borderRadius: 1.5,
        p: 1.5,
        fontSize: 13,
      }}
    >
      <Typography
        variant="body2"
        sx={{
          whiteSpace: "pre-wrap",
          color: "text.primary",
          fontSize: 13,
          overflow: "hidden",
          display: "-webkit-box",
          WebkitLineClamp: expanded ? "unset" : 1,
          WebkitBoxOrient: "vertical",
        }}
      >
        {text}
      </Typography>

      <ButtonBase
        onClick={() => setExpanded((prev) => !prev)}
        sx={{
          mt: 0.75,
          display: "flex",
          alignItems: "center",
          gap: 0.25,
          color: "text.secondary",
          fontSize: 12,
          fontWeight: 600,
          "&:hover": { color: "text.primary" },
        }}
        disableRipple
      >
        {expanded ? (
          <>
            Show less <KeyboardArrowUpIcon sx={{ fontSize: 16 }} />
          </>
        ) : (
          <>
            Show more <KeyboardArrowDownIcon sx={{ fontSize: 16 }} />
          </>
        )}
      </ButtonBase>
    </Box>
  );
}
