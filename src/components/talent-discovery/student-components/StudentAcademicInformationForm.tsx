"use client";

import React, { useState, startTransition } from "react";
import dayjs, { Dayjs } from "dayjs";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  Stack,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import { Add, Close } from "@mui/icons-material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import {
  addStudentUniversityAction,
  deleteStudentUniversityAction,
} from "../../../app/talent-discovery-standalone/student-academic-information/action";

type CollegeForm = {
  id?: string;
  universityName: string;
  fieldOfStudy: string;
  grade: string;
  degreeProgram: string;
  startDate: Dayjs | null;
  endDate: Dayjs | null;
};

type UniversityFromServer = {
  id: string;
  universityName: string;
  fieldOfStudy: string;
  grade: string;
  degreeProgram: string;
  startDate: string | null;
  endDate: string | null;
};

type StudentAcademicInformationFormProps = {
  userId: string;
  university: UniversityFromServer[];
};

const emptyCollege: CollegeForm = {
  id: "",
  universityName: "",
  fieldOfStudy: "",
  grade: "",
  degreeProgram: "",
  startDate: null,
  endDate: null,
};

const inputSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: 1.5,
    backgroundColor: "#fff",
  },
};

function formatMonthYear(date: Dayjs | null) {
  if (!date) return "Not specified";
  return date.format("MMMM YYYY");
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <Box>
      <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>
        {label}
      </Typography>
      <Typography variant="body1" sx={{ fontWeight: 500 }}>
        {value || "—"}
      </Typography>
    </Box>
  );
}

export default function StudentAcademicInformationForm({
  userId,
  university,
}: StudentAcademicInformationFormProps) {
  const theme = useTheme();

  const [colleges, setColleges] = useState<CollegeForm[]>(
    university.map((uni) => ({
      id: uni.id,
      universityName: uni.universityName,
      fieldOfStudy: uni.fieldOfStudy,
      grade: uni.grade ?? "",
      degreeProgram: uni.degreeProgram,
      startDate: uni.startDate ? dayjs(uni.startDate) : null,
      endDate: uni.endDate ? dayjs(uni.endDate) : null,
    })),
  );

  const [achievements, setAchievements] = useState<string[]>([]);
  const [additionalInfo, setAdditionalInfo] = useState("");
  const [tagDialogOpen, setTagDialogOpen] = useState(false);
  const [newTag, setNewTag] = useState("");
  const [collegeDialogOpen, setCollegeDialogOpen] = useState(false);
  const [newCollege, setNewCollege] = useState<CollegeForm>({
    ...emptyCollege,
  });
  const [editingCollegeIndex, setEditingCollegeIndex] = useState<number | null>(
    null,
  );
  const [isSubmittingCollege, setIsSubmittingCollege] = useState(false);

  const handleNewCollegeChange = <K extends keyof CollegeForm>(
    field: K,
    value: CollegeForm[K],
  ) => {
    setNewCollege((prev) => ({ ...prev, [field]: value }));
  };

  const openAddCollegeDialog = () => {
    setEditingCollegeIndex(null);
    setNewCollege({ ...emptyCollege });
    setCollegeDialogOpen(true);
  };

  const openEditCollegeDialog = (index: number) => {
    setEditingCollegeIndex(index);
    setNewCollege({ ...colleges[index] });
    setCollegeDialogOpen(true);
  };

  const handleCollegeSubmit = async () => {
    if (!newCollege.universityName.trim()) return;

    try {
      setIsSubmittingCollege(true);

      if (editingCollegeIndex !== null) {
        setColleges((prev) =>
          prev.map((college, index) =>
            index === editingCollegeIndex ? { ...newCollege } : college,
          ),
        );
      } else {
        await addStudentUniversityAction({
          userId,
          universityName: newCollege.universityName.trim(),
          fieldOfStudy: newCollege.fieldOfStudy.trim(),
          degreeProgram: newCollege.degreeProgram.trim(),
          grade: newCollege.grade.trim() || undefined,
          startDate: newCollege.startDate
            ? newCollege.startDate.toISOString()
            : null,
          endDate: newCollege.endDate ? newCollege.endDate.toISOString() : null,
        });

        setColleges((prev) => [...prev, { ...newCollege }]);
      }

      setNewCollege({ ...emptyCollege });
      setEditingCollegeIndex(null);
      setCollegeDialogOpen(false);
    } catch (error) {
      console.error("Failed to save university:", error);
    } finally {
      setIsSubmittingCollege(false);
    }
  };

  const removeCollege = (id: string) => {
    startTransition(async () => {
      await deleteStudentUniversityAction(id);

      setColleges((prev) => prev.filter((college) => college.id !== id));
    });
  };

  const addTag = () => {
    const trimmed = newTag.trim();
    if (!trimmed) return;

    if (
      achievements.some((tag) => tag.toLowerCase() === trimmed.toLowerCase())
    ) {
      setNewTag("");
      setTagDialogOpen(false);
      return;
    }

    setAchievements((prev) => [...prev, trimmed]);
    setNewTag("");
    setTagDialogOpen(false);
  };

  const removeTag = (tagToDelete: string) => {
    setAchievements((prev) => prev.filter((tag) => tag !== tagToDelete));
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
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
            borderBottom: `1px solid ${theme.palette.divider}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            Academic Information
          </Typography>
        </Box>

        <Divider />

        <CardContent sx={{ px: { xs: 2, md: 3 }, py: 3 }}>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            sx={{ mb: 2.5 }}
          >
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              Universities
            </Typography>

            <Button
              variant="outlined"
              startIcon={<Add />}
              onClick={openAddCollegeDialog}
            >
              Add University
            </Button>
          </Stack>

          <Stack spacing={2}>
            {colleges.length === 0 ? (
              <Box
                sx={{
                  border: "1px dashed",
                  borderColor: "divider",
                  borderRadius: 2,
                  p: 3,
                  textAlign: "center",
                }}
              >
                <Typography variant="body1" color="text.secondary">
                  No universities added yet.
                </Typography>
              </Box>
            ) : (
              colleges.map((college, index) => (
                <Card
                  key={`${college.universityName}-${index}`}
                  elevation={0}
                  sx={{
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 2,
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Stack
                      direction={{ xs: "column", sm: "row" }}
                      alignItems={{ xs: "flex-start", sm: "center" }}
                      justifyContent="space-between"
                      spacing={2}
                      sx={{ mb: 2.5 }}
                    >
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 700 }}>
                          {college.universityName}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          University {index + 1}
                        </Typography>
                      </Box>

                      <Stack direction="row" spacing={1.5}>
                        <Button
                          variant="outlined"
                          onClick={() => openEditCollegeDialog(index)}
                        >
                          Edit
                        </Button>
                        <Button
                          color="error"
                          onClick={() =>
                            college.id && removeCollege(college.id)
                          }
                        >
                          Delete
                        </Button>
                      </Stack>
                    </Stack>

                    <Grid container spacing={3}>
                      <Grid size={{ xs: 12, md: 6 }}>
                        <InfoRow
                          label="Field of Study"
                          value={college.fieldOfStudy}
                        />
                      </Grid>

                      <Grid size={{ xs: 12, md: 6 }}>
                        <InfoRow
                          label="Degree Program"
                          value={college.degreeProgram}
                        />
                      </Grid>

                      <Grid size={{ xs: 12, md: 6 }}>
                        <InfoRow
                          label="Grade Received / Expected"
                          value={college.grade}
                        />
                      </Grid>

                      <Grid size={{ xs: 12, md: 6 }}>
                        <InfoRow
                          label="Start Date"
                          value={formatMonthYear(college.startDate)}
                        />
                      </Grid>

                      <Grid size={{ xs: 12, md: 6 }}>
                        <InfoRow
                          label="End Date / Expected Date"
                          value={formatMonthYear(college.endDate)}
                        />
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              ))
            )}
          </Stack>
        </CardContent>

        <Divider />

        <CardContent sx={{ px: { xs: 2, md: 3 }, py: 3 }}>
          <Box sx={{ mt: 0 }}>
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              sx={{ mb: 1.5 }}
            >
              <Typography variant="h5" sx={{ fontWeight: 600 }}>
                Achievement Tags
              </Typography>

              <Button
                variant="outlined"
                startIcon={<Add />}
                onClick={() => setTagDialogOpen(true)}
                sx={{ px: 2.25, py: 1 }}
              >
                Add Tag
              </Button>
            </Stack>

            <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
              {achievements.map((achievement) => (
                <Chip
                  key={achievement}
                  label={achievement}
                  onDelete={() => removeTag(achievement)}
                  deleteIcon={<Close fontSize="small" />}
                  sx={{
                    borderRadius: 1,
                    backgroundColor: "#f3f4f6",
                    "& .MuiChip-label": { px: 1.5 },
                    "& .MuiChip-deleteIcon": { fontSize: 18 },
                  }}
                />
              ))}
            </Stack>
          </Box>

          <Box sx={{ mt: 4 }}>
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              Additional Academic Information
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
              Include information like relevant courses being pursued and career
              aspirations
            </Typography>
            <TextField
              fullWidth
              multiline
              minRows={4}
              value={additionalInfo}
              onChange={(e) => setAdditionalInfo(e.target.value)}
              sx={inputSx}
            />
          </Box>
        </CardContent>

        <Dialog
          open={collegeDialogOpen}
          onClose={() => {
            if (isSubmittingCollege) return;
            setCollegeDialogOpen(false);
            setEditingCollegeIndex(null);
            setNewCollege({ ...emptyCollege });
          }}
          fullWidth
          maxWidth="md"
        >
          <DialogTitle>
            {editingCollegeIndex !== null
              ? "Edit University"
              : "Add University"}
          </DialogTitle>

          <DialogContent>
            <Grid container spacing={3} sx={{ mt: 0.5 }}>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="University Name"
                  value={newCollege.universityName}
                  onChange={(e) =>
                    handleNewCollegeChange("universityName", e.target.value)
                  }
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Field of Study"
                  value={newCollege.fieldOfStudy}
                  onChange={(e) =>
                    handleNewCollegeChange("fieldOfStudy", e.target.value)
                  }
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Grade Received / Expected"
                  value={newCollege.grade}
                  onChange={(e) =>
                    handleNewCollegeChange("grade", e.target.value)
                  }
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Degree Program"
                  value={newCollege.degreeProgram}
                  onChange={(e) =>
                    handleNewCollegeChange("degreeProgram", e.target.value)
                  }
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <DatePicker
                  label="Start Date"
                  views={["year", "month"]}
                  value={newCollege.startDate}
                  onChange={(value) =>
                    handleNewCollegeChange(
                      "startDate",
                      value ? dayjs(value) : null,
                    )
                  }
                  format="MMMM YYYY"
                  slotProps={{
                    textField: {
                      fullWidth: true,
                    },
                  }}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <DatePicker
                  label="End Date / Expected Date"
                  views={["year", "month"]}
                  value={newCollege.endDate}
                  onChange={(value) =>
                    handleNewCollegeChange(
                      "endDate",
                      value ? dayjs(value) : null,
                    )
                  }
                  format="MMMM YYYY"
                  slotProps={{
                    textField: {
                      fullWidth: true,
                    },
                  }}
                />
              </Grid>
            </Grid>
          </DialogContent>

          <DialogActions>
            <Button
              onClick={() => {
                setCollegeDialogOpen(false);
                setEditingCollegeIndex(null);
                setNewCollege({ ...emptyCollege });
              }}
              color="inherit"
              disabled={isSubmittingCollege}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCollegeSubmit}
              variant="contained"
              disabled={isSubmittingCollege}
            >
              {isSubmittingCollege
                ? "Saving..."
                : editingCollegeIndex !== null
                  ? "Save Changes"
                  : "Add University"}
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog
          open={tagDialogOpen}
          onClose={() => setTagDialogOpen(false)}
          fullWidth
          maxWidth="xs"
        >
          <DialogTitle>Add Academic Achievement</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              fullWidth
              margin="dense"
              label="New Tag"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addTag();
                }
              }}
              placeholder="Type a new achievement tag"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setTagDialogOpen(false)} color="inherit">
              Cancel
            </Button>
            <Button onClick={addTag} variant="contained">
              Add
            </Button>
          </DialogActions>
        </Dialog>
      </Card>
    </LocalizationProvider>
  );
}
