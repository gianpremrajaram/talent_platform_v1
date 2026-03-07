"use client";

import React, { useState } from "react";
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
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import { Add, Close } from "@mui/icons-material";

const days = Array.from({ length: 31 }, (_, i) => i + 1);
const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const years = Array.from(
  { length: 10 },
  (_, i) => new Date().getFullYear() + i,
);

type CollegeForm = {
  universityName: string;
  fieldOfStudy: string;
  grade: string;
  degreeProgram: string;
  expectedDay: string;
  expectedMonth: string;
  expectedYear: string;
};

const emptyCollege: CollegeForm = {
  universityName: "",
  fieldOfStudy: "",
  grade: "",
  degreeProgram: "",
  expectedDay: "",
  expectedMonth: "",
  expectedYear: "",
};

const inputSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: 1.5,
    backgroundColor: "#fff",
  },
};

const selectSx = {
  borderRadius: 1.5,
  backgroundColor: "#fff",
};

export default function StudentAcademicInformationForm() {
  const theme = useTheme();

  const [colleges, setColleges] = useState<CollegeForm[]>([
    {
      universityName: "Stebin",
      fieldOfStudy: "Computer Science",
      grade: "Predicted Merit",
      degreeProgram: "Masters of Science",
      expectedDay: "30",
      expectedMonth: "January",
      expectedYear: "2026",
    },
  ]);

  const [achievements, setAchievements] = useState<string[]>([
    "Deans List 2025",
    "First Prize UCL Hackathon",
    "Fintech Society Head",
  ]);

  const [additionalInfo, setAdditionalInfo] = useState(
    "Include information like relevant courses being pursued and career aspirations",
  );

  const [tagDialogOpen, setTagDialogOpen] = useState(false);
  const [newTag, setNewTag] = useState("");

  const [collegeDialogOpen, setCollegeDialogOpen] = useState(false);
  const [newCollege, setNewCollege] = useState<CollegeForm>({
    ...emptyCollege,
  });

  const handleCollegeChange = (
    index: number,
    field: keyof CollegeForm,
    value: string,
  ) => {
    setColleges((prev) =>
      prev.map((college, i) =>
        i === index ? { ...college, [field]: value } : college,
      ),
    );
  };

  const handleNewCollegeChange = (field: keyof CollegeForm, value: string) => {
    setNewCollege((prev) => ({ ...prev, [field]: value }));
  };

  const openCollegeDialog = () => {
    setNewCollege({ ...emptyCollege });
    setCollegeDialogOpen(true);
  };

  const addCollege = () => {
    if (!newCollege.universityName.trim()) return;

    setColleges((prev) => [...prev, { ...newCollege }]);
    setNewCollege({ ...emptyCollege });
    setCollegeDialogOpen(false);
  };

  const removeCollege = (index: number) => {
    setColleges((prev) => prev.filter((_, i) => i !== index));
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

  const handleSave = () => {
    console.log({
      colleges,
      achievements,
      additionalInfo,
    });
  };

  return (
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

      {colleges.map((college, index) => (
        <Box key={index}>
          <CardContent sx={{ px: { xs: 2, md: 3 }, py: 3 }}>
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              sx={{ mb: 3 }}
            >
              <Typography variant="h4" sx={{ fontWeight: 500, fontSize: 24 }}>
                College {index + 1}
              </Typography>

              <Stack direction="row" spacing={1.5}>
                {index === 0 && (
                  <Button
                    variant="outlined"
                    startIcon={<Add />}
                    onClick={openCollegeDialog}
                  >
                    Add College
                  </Button>
                )}

                {colleges.length > 1 && (
                  <Button color="error" onClick={() => removeCollege(index)}>
                    Remove
                  </Button>
                )}
              </Stack>
            </Stack>

            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography
                  variant="subtitle1"
                  sx={{ mb: 1.1, fontWeight: 500 }}
                >
                  University Name
                </Typography>
                <TextField
                  fullWidth
                  value={college.universityName}
                  onChange={(e) =>
                    handleCollegeChange(index, "universityName", e.target.value)
                  }
                  sx={inputSx}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Typography
                  variant="subtitle1"
                  sx={{ mb: 1.1, fontWeight: 500 }}
                >
                  Field of Study
                </Typography>
                <TextField
                  fullWidth
                  value={college.fieldOfStudy}
                  onChange={(e) =>
                    handleCollegeChange(index, "fieldOfStudy", e.target.value)
                  }
                  sx={inputSx}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Typography
                  variant="subtitle1"
                  sx={{ mb: 1.1, fontWeight: 500 }}
                >
                  Grade Received / Expected
                </Typography>
                <TextField
                  fullWidth
                  value={college.grade}
                  onChange={(e) =>
                    handleCollegeChange(index, "grade", e.target.value)
                  }
                  sx={inputSx}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Typography
                  variant="subtitle1"
                  sx={{ mb: 1.1, fontWeight: 500 }}
                >
                  Degree Program
                </Typography>
                <TextField
                  fullWidth
                  value={college.degreeProgram}
                  onChange={(e) =>
                    handleCollegeChange(index, "degreeProgram", e.target.value)
                  }
                  sx={inputSx}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Typography
                  variant="subtitle1"
                  sx={{ mb: 1.1, fontWeight: 500 }}
                >
                  Expected Graduation
                </Typography>

                <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                  <FormControl fullWidth>
                    <InputLabel>Day</InputLabel>
                    <Select
                      label="Day"
                      value={college.expectedDay}
                      onChange={(e) =>
                        handleCollegeChange(
                          index,
                          "expectedDay",
                          String(e.target.value),
                        )
                      }
                      sx={selectSx}
                    >
                      {days.map((day) => (
                        <MenuItem key={day} value={String(day)}>
                          {day}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl fullWidth>
                    <InputLabel>Month</InputLabel>
                    <Select
                      label="Month"
                      value={college.expectedMonth}
                      onChange={(e) =>
                        handleCollegeChange(
                          index,
                          "expectedMonth",
                          String(e.target.value),
                        )
                      }
                      sx={selectSx}
                    >
                      {months.map((month) => (
                        <MenuItem key={month} value={month}>
                          {month}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl fullWidth>
                    <InputLabel>Year</InputLabel>
                    <Select
                      label="Year"
                      value={college.expectedYear}
                      onChange={(e) =>
                        handleCollegeChange(
                          index,
                          "expectedYear",
                          String(e.target.value),
                        )
                      }
                      sx={selectSx}
                    >
                      {years.map((year) => (
                        <MenuItem key={year} value={String(year)}>
                          {year}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Stack>
              </Grid>
            </Grid>
          </CardContent>

          {index !== colleges.length - 1 && <Divider />}
        </Box>
      ))}

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

      <Divider />

      <Box
        sx={{
          px: { xs: 2, md: 3 },
          py: 2.5,
          display: "flex",
          justifyContent: "flex-end",
          gap: 2,
        }}
      >
        <Button variant="outlined" color="inherit">
          Cancel
        </Button>
        <Button variant="contained" onClick={handleSave}>
          Save
        </Button>
      </Box>

      <Dialog
        open={collegeDialogOpen}
        onClose={() => setCollegeDialogOpen(false)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>Add New College</DialogTitle>
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

            <Grid size={{ xs: 12, md: 4 }}>
              <FormControl fullWidth>
                <InputLabel>Day</InputLabel>
                <Select
                  label="Day"
                  value={newCollege.expectedDay}
                  onChange={(e) =>
                    handleNewCollegeChange(
                      "expectedDay",
                      String(e.target.value),
                    )
                  }
                >
                  {days.map((day) => (
                    <MenuItem key={day} value={String(day)}>
                      {day}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <FormControl fullWidth>
                <InputLabel>Month</InputLabel>
                <Select
                  label="Month"
                  value={newCollege.expectedMonth}
                  onChange={(e) =>
                    handleNewCollegeChange(
                      "expectedMonth",
                      String(e.target.value),
                    )
                  }
                >
                  {months.map((month) => (
                    <MenuItem key={month} value={month}>
                      {month}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <FormControl fullWidth>
                <InputLabel>Year</InputLabel>
                <Select
                  label="Year"
                  value={newCollege.expectedYear}
                  onChange={(e) =>
                    handleNewCollegeChange(
                      "expectedYear",
                      String(e.target.value),
                    )
                  }
                >
                  {years.map((year) => (
                    <MenuItem key={year} value={String(year)}>
                      {year}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCollegeDialogOpen(false)} color="inherit">
            Cancel
          </Button>
          <Button onClick={addCollege} variant="contained">
            Add College
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
  );
}
