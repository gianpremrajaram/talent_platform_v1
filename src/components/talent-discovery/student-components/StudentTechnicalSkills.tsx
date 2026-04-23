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
import {
  addStudentSkillAction,
  deleteStudentSkillAction,
} from "@/app/talent-discovery-standalone/student-skills-experience/action";

type SkillItem = {
  id: string;
  name: string;
};

export default function StudentTechnicalSkills({
  userId,
  initialTechnicalSkills,
}: {
  userId: string;
  initialTechnicalSkills: SkillItem[];
}) {
  const [skills, setSkills] = useState<SkillItem[]>(initialTechnicalSkills);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newSkill, setNewSkill] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addSkill = async () => {
    const trimmed = newSkill.trim();
    if (!trimmed || isSubmitting) return;

    const exists = skills.some(
      (skill) => skill.name.toLowerCase() === trimmed.toLowerCase(),
    );
    if (exists) {
      setNewSkill("");
      setDialogOpen(false);
      return;
    }

    setIsSubmitting(true);
    try {
      const created = await addStudentSkillAction(userId, trimmed);
      setSkills((prev) => [...prev, created]);
      setNewSkill("");
      setDialogOpen(false);
    } catch (error) {
      console.error("Failed to add skill:", error);
      // Keep dialog open on error so user can retry
    } finally {
      setIsSubmitting(false);
    }
  };

  const removeSkill = async (skillToDelete: SkillItem) => {
    setSkills((prev) => prev.filter((skill) => skill.id !== skillToDelete.id));

    try {
      await deleteStudentSkillAction(skillToDelete.id);
    } catch (error) {
      console.error("Failed to delete skill:", error);
      //if it errors restore the skill and preserve it.
      setSkills((prev) => [...prev, skillToDelete]);
    }
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
            Add Skills
          </Button>
        </Box>

        <Divider />

        <Box sx={{ px: 3, py: 3 }}>
          <Stack direction="row" spacing={2} useFlexGap flexWrap="wrap">
            {skills.map((skill) => (
              <Chip
                key={skill.id}
                label={skill.name}
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
          <Button
            onClick={() => setDialogOpen(false)}
            color="inherit"
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={addSkill}
            variant="contained"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Adding..." : "Add"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
