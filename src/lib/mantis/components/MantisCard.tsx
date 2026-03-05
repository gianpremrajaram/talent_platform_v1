"use client";

import { ReactNode } from "react";
import { Card, CardHeader, CardContent, CardProps, Box } from "@mui/material";

interface MantisCardProps extends CardProps {
  title?: string;
  subtitle?: string;
  children?: ReactNode;
  divider?: boolean;
}

export default function MantisCard({
  title,
  subtitle,
  children,
  divider = true,
  sx = {},
  ...props
}: MantisCardProps) {
  return (
    <Card
      sx={{
        boxShadow: "0 2px 14px 0 rgba(32, 40, 45, 0.08)",
        borderRadius: "12px",
        ...sx,
      }}
      {...props}
    >
      {title && (
        <>
          <CardHeader
            title={title}
            subheader={subtitle}
            titleTypographyProps={{ variant: "h6" }}
          />
          {divider && <Box sx={{ borderTop: "1px solid #f0f0f0" }} />}
        </>
      )}
      <CardContent>{children}</CardContent>
    </Card>
  );
}
