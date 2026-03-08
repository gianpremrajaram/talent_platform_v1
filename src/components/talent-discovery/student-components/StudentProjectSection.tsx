"use client";

import React, { useState } from "react";
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

type ProjectItem = {
  id: number;
  title: string;
  timeline: string;
  githubLink: string;
  description: string;
};

export default function StudentProjectsSection() {
  const [projects, setProjects] = useState<ProjectItem[]>([
    {
      id: 1,
      title: "E-commerce Platform",
      timeline: "Aug 2023 - Aug 2025",
      githubLink: "https://github.com/example/ecommerce-platform",
      description:
        "Built a full-stack e-commerce platform with React, Node.js, and PostgreSQL. Implemented user authentication, payment processing, and order management.",
    },
    {
      id: 2,
      title: "ML Stock Predictor",
      timeline: "Aug 2023 - Aug 2025",
      githubLink: "https://github.com/example/ml-stock-predictor",
      description:
        "Developed a machine learning model to predict stock prices using LSTM neural networks with 85% accuracy on test data.",
    },
  ]);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [newProject, setNewProject] = useState<Omit<ProjectItem, "id">>({
    title: "",
    timeline: "",
    githubLink: "",
    description: "",
  });

  const handleChange = (
    field: keyof Omit<ProjectItem, "id">,
    value: string,
  ) => {
    setNewProject((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddProject = () => {
    if (!newProject.title.trim()) return;

    setProjects((prev) => [
      ...prev,
      {
        id: Date.now(),
        ...newProject,
      },
    ]);

    setNewProject({
      title: "",
      timeline: "",
      githubLink: "",
      description: "",
    });
    setDialogOpen(false);
  };

  const handleRemoveProject = (id: number) => {
    setProjects((prev) => prev.filter((project) => project.id !== id));
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

                      <Typography
                        variant="body1"
                        color="text.primary"
                        sx={{ mb: 1.25 }}
                      >
                        {project.timeline}
                      </Typography>

                      {project.githubLink && (
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
                            href={project.githubLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            underline="hover"
                            sx={{ fontSize: 14 }}
                          >
                            View GitHub Repository
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
              label="Timeline"
              placeholder="Aug 2023 - Aug 2025"
              fullWidth
              value={newProject.timeline}
              onChange={(e) => handleChange("timeline", e.target.value)}
            />

            <TextField
              label="GitHub Link"
              placeholder="https://github.com/username/project"
              fullWidth
              value={newProject.githubLink}
              onChange={(e) => handleChange("githubLink", e.target.value)}
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
          <Button variant="contained" onClick={handleAddProject}>
            Add Project
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
