"use client";

import React, { useState, useTransition } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Link,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { Add, Delete, GitHub } from "@mui/icons-material";
import {
  addStudentProjectAction,
  deleteProjectAction,
} from "@/app/talent-discovery-standalone/student-skills-experience/action";
//TODO: show confirmation for delete action!
type ProjectItem = {
  id: string;
  title: string;
  startDate?: Date | string;
  endDate?: Date | string;
  description: string;
  projectLink?: string;
};

type Props = {
  userId: string;
  initialExperiences?: ProjectItem[];
};

export default function StudentProjectsSection({
  userId,
  initialStudentProjects = [],
}: {
  userId: string;
  initialStudentProjects?: ProjectItem[];
}) {
  const [isPending, startTransition] = useTransition();
  const [projects, setProjects] = useState<ProjectItem[]>(
    initialStudentProjects,
  );

  const [dialogOpen, setDialogOpen] = useState(false);
  const [newProject, setNewProject] = useState<Omit<ProjectItem, "id">>({
    title: "",
    startDate: undefined,
    endDate: undefined,
    description: "",
    projectLink: undefined,
  });

  const handleChange = (
    field: keyof Omit<ProjectItem, "id">,
    value: string,
  ) => {
    setNewProject((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddProject = () => {
    startTransition(async () => {
      const created = await addStudentProjectAction(userId, {
        title: newProject.title,
        description: newProject.description,
        startDate: newProject.startDate as string | undefined,
        endDate: newProject.endDate as string | undefined,
        projectLink: newProject.projectLink,
      });

      setProjects((prev) => [...prev, created as ProjectItem]);
      setDialogOpen(false);
      setNewProject({
        title: "",
        startDate: undefined,
        endDate: undefined,
        description: "",
        projectLink: undefined,
      });
    });
  };

  const handleRemoveProject = (id: string) => {
    startTransition(async () => {
      await deleteProjectAction(id);
      setProjects((prev) => prev.filter((project) => project.id !== id));
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
            Projects
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
            Add Project
          </Button>
        </Box>

        <Box sx={{ p: 3 }}>
          <Stack spacing={2.5}>
            {projects.map((project) => (
              <Card
                key={project.id}
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
                        sx={{ fontWeight: 700, mb: 0.75 }}
                      >
                        {project.title}
                      </Typography>

                      {(project.startDate || project.endDate) && (
                        <Typography
                          variant="body1"
                          color="text.primary"
                          sx={{ mb: 1.25 }}
                        >
                          {project.startDate &&
                          typeof project.startDate === "string"
                            ? project.startDate
                            : project.startDate instanceof Date
                              ? project.startDate.toLocaleDateString()
                              : ""}{" "}
                          {project.endDate &&
                          typeof project.endDate === "string"
                            ? `- ${project.endDate}`
                            : project.endDate instanceof Date
                              ? `- ${project.endDate.toLocaleDateString()}`
                              : ""}
                        </Typography>
                      )}

                      {project.projectLink && (
                        <Stack
                          direction="row"
                          spacing={0.75}
                          alignItems="center"
                          sx={{ mb: 1.5 }}
                        >
                          <GitHub
                            sx={{ fontSize: 18, color: "text.secondary" }}
                          />
                          <Link
                            href={project.projectLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            underline="hover"
                            sx={{ fontSize: 14 }}
                          >
                            View Project
                          </Link>
                        </Stack>
                      )}

                      <Typography
                        variant="body1"
                        sx={{
                          color: "text.primary",
                          lineHeight: 1.7,
                          whiteSpace: "pre-line",
                        }}
                      >
                        {project.description}
                      </Typography>
                    </Box>

                    <IconButton
                      color="error"
                      onClick={() => handleRemoveProject(project.id)}
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
        <DialogTitle>Add Project</DialogTitle>

        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Project Title"
              fullWidth
              value={newProject.title}
              onChange={(e) => handleChange("title", e.target.value)}
            />

            <TextField
              label="Start Date"
              placeholder="2023-08"
              fullWidth
              value={newProject.startDate || ""}
              onChange={(e) => handleChange("startDate", e.target.value)}
            />

            <TextField
              label="End Date"
              placeholder="2025-08"
              fullWidth
              value={newProject.endDate || ""}
              onChange={(e) => handleChange("endDate", e.target.value)}
            />

            <TextField
              label="Project Link"
              placeholder="https://github.com/username/project"
              fullWidth
              value={newProject.projectLink || ""}
              onChange={(e) => handleChange("projectLink", e.target.value)}
            />

            <TextField
              label="Description"
              multiline
              minRows={4}
              fullWidth
              value={newProject.description}
              onChange={(e) => handleChange("description", e.target.value)}
            />
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} color="inherit">
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleAddProject}
            disabled={isPending}
          >
            {isPending ? "Adding..." : "Add Project"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
