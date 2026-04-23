"use client";

import React, { useState, useTransition } from "react";
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
import {
  addWorkExperienceAction,
  deleteWorkExperienceAction,
} from "../../../app/talent-discovery-standalone/student-skills-experience/action";
//TODO: show confirmation for delete action!
type WorkExperience = {
  id: string;
  role: string;
  company: string;
  startDate: string;
  endDate: string;
  description: string;
};

type Props = {
  userId: string;
  initialExperiences?: WorkExperience[];
};

function formatMonth(dateString: string) {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });
}

export default function StudentWorkExperience({
  userId,
  initialExperiences = [],
}: Props) {
  const [experiences, setExperiences] =
    useState<WorkExperience[]>(initialExperiences);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [newExp, setNewExp] = useState({
    role: "",
    company: "",
    startDate: "", // yyyy-mm
    endDate: "", // yyyy-mm
    description: "",
  });

  const handleAdd = () => {
    if (!newExp.role.trim() || !newExp.company.trim()) return;

    startTransition(async () => {
      const created = await addWorkExperienceAction(userId, {
        title: newExp.role,
        company: newExp.company,
        description: newExp.description || undefined,
        startDate: newExp.startDate || undefined,
        endDate: newExp.endDate || undefined,
      });

      setExperiences((prev) => [created, ...prev]);

      setNewExp({
        role: "",
        company: "",
        startDate: "",
        endDate: "",
        description: "",
      });

      setDialogOpen(false);
    });
  };

  const handleRemoveExperience = (id: string) => {
    startTransition(async () => {
      await deleteWorkExperienceAction(id);
      setExperiences((prev) => prev.filter((exp) => exp.id !== id));
    });
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
            variant="outlined"
            startIcon={<Add />}
            onClick={() => setDialogOpen(true)}
            sx={{
              borderRadius: 1.5,
              px: 2.5,
              py: 1,
              textTransform: "none",
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
                        {formatMonth(exp.startDate)}
                        {exp.endDate ? ` — ${formatMonth(exp.endDate)}` : ""}
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

                    <IconButton
                      color="error"
                      onClick={() => handleRemoveExperience(exp.id)}
                      disabled={isPending}
                    >
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
              type="month"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={newExp.startDate}
              onChange={(e) =>
                setNewExp({ ...newExp, startDate: e.target.value })
              }
            />

            <TextField
              label="End Date"
              type="month"
              fullWidth
              InputLabelProps={{ shrink: true }}
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

          <Button variant="contained" onClick={handleAdd} disabled={isPending}>
            {isPending ? "Saving..." : "Add Experience"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
