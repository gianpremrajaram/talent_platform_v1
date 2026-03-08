"use client";

import React, { useState } from "react";
import {
  Box,
  Typography,
  Stack,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Card,
  CardContent,
  IconButton,
} from "@mui/material";
import { Add, Delete } from "@mui/icons-material";

type WorkExperience = {
  id: number;
  role: string;
  company: string;
  startDate: string;
  endDate: string;
  description: string;
};

export default function StudentWorkExperience() {
  const [experiences, setExperiences] = useState<WorkExperience[]>([
    {
      id: 1,
      role: "Software Engineering Intern",
      company: "Cisco Systems",
      startDate: "Aug 2023",
      endDate: "Aug 2025",
      description:
        "Developed RESTful APIs and implemented frontend features using React. Collaborated with the team on agile development practices.",
    },
    {
      id: 2,
      role: "Software Engineering II",
      company: "Microsoft",
      startDate: "Aug 2023",
      endDate: "Aug 2025",
      description:
        "Assisted in NLP research projects, processing and analyzing large datasets for sentiment analysis and machine learning workflows.",
    },
  ]);

  const [dialogOpen, setDialogOpen] = useState(false);

  const [newExp, setNewExp] = useState<WorkExperience>({
    id: 0,
    role: "",
    company: "",
    startDate: "",
    endDate: "",
    description: "",
  });

  const handleAdd = () => {
    if (!newExp.role.trim()) return;

    setExperiences((prev) => [...prev, { ...newExp, id: Date.now() }]);

    setNewExp({
      id: 0,
      role: "",
      company: "",
      startDate: "",
      endDate: "",
      description: "",
    });

    setDialogOpen(false);
  };

  const removeExp = (id: number) => {
    setExperiences((prev) => prev.filter((e) => e.id !== id));
  };

  return (
    <>
      <Card
        elevation={0}
        sx={{
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 2,
          overflow: "hidden",
          backgroundColor: "#fff",
        }}
      >
        <Box
          sx={{
            px: 3,
            py: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "1px solid",
            borderColor: "divider",
          }}
        >
          <Typography variant="h5" sx={{ fontWeight: 500 }}>
            Work Experience
          </Typography>

          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setDialogOpen(true)}
            sx={{
              borderRadius: 1.5,
              px: 2.5,
              py: 1,
              textTransform: "none",
              boxShadow: "none",
            }}
          >
            Add Experience
          </Button>
        </Box>

        <Box sx={{ p: 3 }}>
          <Stack spacing={2.5}>
            {experiences.map((exp) => (
              <Card
                key={exp.id}
                elevation={0}
                sx={{
                  border: "1px solid",
                  borderColor: "#d9d9d9",
                  borderRadius: 1.5,
                  backgroundColor: "#fff",
                }}
              >
                <CardContent sx={{ p: 2.5 }}>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="flex-start"
                    spacing={2}
                  >
                    <Box sx={{ flex: 1 }}>
                      <Typography
                        variant="h6"
                        sx={{ fontWeight: 700, mb: 0.5 }}
                      >
                        {exp.role}
                      </Typography>

                      <Typography
                        variant="body1"
                        color="text.secondary"
                        sx={{ mb: 0.5 }}
                      >
                        {exp.company}
                      </Typography>

                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 1.5 }}
                      >
                        {exp.startDate} — {exp.endDate}
                      </Typography>

                      <Typography
                        variant="body1"
                        sx={{
                          color: "text.primary",
                          lineHeight: 1.7,
                        }}
                      >
                        {exp.description}
                      </Typography>
                    </Box>

                    <IconButton color="error" onClick={() => removeExp(exp.id)}>
                      <Delete />
                    </IconButton>
                  </Stack>
                </CardContent>
              </Card>
            ))}
          </Stack>
        </Box>
      </Card>

      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Add Work Experience</DialogTitle>

        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Role"
              fullWidth
              value={newExp.role}
              onChange={(e) => setNewExp({ ...newExp, role: e.target.value })}
            />

            <TextField
              label="Company"
              fullWidth
              value={newExp.company}
              onChange={(e) =>
                setNewExp({ ...newExp, company: e.target.value })
              }
            />

            <TextField
              label="Start Date"
              placeholder="Aug 2023"
              fullWidth
              value={newExp.startDate}
              onChange={(e) =>
                setNewExp({ ...newExp, startDate: e.target.value })
              }
            />

            <TextField
              label="End Date"
              placeholder="Aug 2025"
              fullWidth
              value={newExp.endDate}
              onChange={(e) =>
                setNewExp({ ...newExp, endDate: e.target.value })
              }
            />

            <TextField
              label="Description"
              multiline
              minRows={4}
              fullWidth
              value={newExp.description}
              onChange={(e) =>
                setNewExp({ ...newExp, description: e.target.value })
              }
            />
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} color="inherit">
            Cancel
          </Button>

          <Button variant="contained" onClick={handleAdd}>
            Add Experience
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
