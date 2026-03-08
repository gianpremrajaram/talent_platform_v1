"use client";

import React, { useState } from "react";
import {
  Box,
  Button,
  Card,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { Add, Close } from "@mui/icons-material";

export default function StudentTechnicalSkills() {
  const [skills, setSkills] = useState<string[]>([
    "UI/UX",
    "CSS",
    "HTML",
    "JS",
    "Figma",
    "Angular",
    "Jquery",
    "Adobe XD",
    "Adobe Photoshop",
    "Animation",
    "SVG",
    "React",
  ]);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [newSkill, setNewSkill] = useState("");

  const addSkill = () => {
    const trimmed = newSkill.trim();
    if (!trimmed) return;

    const exists = skills.some(
      (skill) => skill.toLowerCase() === trimmed.toLowerCase(),
    );
    if (exists) {
      setNewSkill("");
      setDialogOpen(false);
      return;
    }

    setSkills((prev) => [...prev, trimmed]);
    setNewSkill("");
    setDialogOpen(false);
  };

  const removeSkill = (skillToDelete: string) => {
    setSkills((prev) => prev.filter((skill) => skill !== skillToDelete));
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
          }}
        >
          <Typography variant="h5" sx={{ fontWeight: 500 }}>
            Technical skills
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
            Add Skills
          </Button>
        </Box>

        <Divider />

        <Box sx={{ px: 3, py: 3 }}>
          <Stack direction="row" spacing={2} useFlexGap flexWrap="wrap">
            {skills.map((skill) => (
              <Chip
                key={skill}
                label={skill}
                onDelete={() => removeSkill(skill)}
                deleteIcon={<Close fontSize="small" />}
                sx={{
                  height: 36,
                  borderRadius: 1,
                  border: "1px solid #d9d9d9",
                  backgroundColor: "#fff",
                  "& .MuiChip-label": {
                    px: 1.5,
                    fontSize: 14,
                    fontWeight: 500,
                  },
                  "& .MuiChip-deleteIcon": {
                    fontSize: 18,
                    color: "rgba(0,0,0,0.45)",
                    mr: 0.5,
                  },
                }}
              />
            ))}
          </Stack>
        </Box>
      </Card>

      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>Add Technical Skill</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            margin="dense"
            label="Skill"
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addSkill();
              }
            }}
            placeholder="Type a new skill"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} color="inherit">
            Cancel
          </Button>
          <Button onClick={addSkill} variant="contained">
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
