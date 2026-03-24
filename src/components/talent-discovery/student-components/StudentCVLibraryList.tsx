"use client";

import React, { useState } from "react";
import { Stack, Typography } from "@mui/material";
import StudentCVLibraryCard from "./StudentCVLibraryCard";

type CV = {
  id: string;
  title: string;
  fileName: string;
  fileUrl: string;
  uploadedAt: string;
  tags: string[];
};

type Props = {
  initialCVs: CV[];
};

export default function StudentCVLibraryList({ initialCVs }: Props) {
  const [cvs, setCvs] = useState<CV[]>(initialCVs);

  const handleDeleted = (id: string) => {
    setCvs((prev) => prev.filter((cv) => cv.id !== id));
  };

  return (
    <>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
        You have {cvs.length} CV{cvs.length !== 1 ? "s" : ""} in your library:
      </Typography>

      <Stack spacing={3}>
        {cvs.map((cv) => (
          <StudentCVLibraryCard
            key={cv.id}
            id={cv.id}
            title={cv.title}
            fileName={cv.fileName}
            fileUrl={cv.fileUrl}
            uploadedAt={cv.uploadedAt}
            tags={cv.tags}
            onDeleted={handleDeleted}
          />
        ))}
      </Stack>
    </>
  );
}
