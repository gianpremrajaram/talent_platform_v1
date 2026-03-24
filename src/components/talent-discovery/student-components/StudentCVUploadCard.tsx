"use client";

import React, { useRef, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Fade,
  Grow,
  Alert,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { Add, Close } from "@mui/icons-material";
import UploadOutlined from "@ant-design/icons/UploadOutlined";
import { uploadStudentCVAction } from "@/app/talent-discovery-standalone/student-cv-functions/action";

const inputSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: 1.5,
    backgroundColor: "#fff",
  },
};

type Props = {
  userId: string;
};

export default function StudentCVUploadCard({ userId }: Props) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [cvName, setCvName] = useState("");
  const [versionNotes, setVersionNotes] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagDialogOpen, setTagDialogOpen] = useState(false);
  const [newTag, setNewTag] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleChooseFile = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setSelectedFile(file);
    setError(null);
    setSuccess(false);

    if (file && !cvName) {
      const fileNameWithoutExtension = file.name.replace(/\.[^/.]+$/, "");
      setCvName(fileNameWithoutExtension);
    }
  };

  const addTag = () => {
    const trimmed = newTag.trim();
    if (!trimmed) return;

    const exists = tags.some(
      (tag) => tag.toLowerCase() === trimmed.toLowerCase(),
    );
    if (!exists) {
      setTags((prev) => [...prev, trimmed]);
    }
    setNewTag("");
    setTagDialogOpen(false);
  };

  const removeTag = (tagToDelete: string) => {
    setTags((prev) => prev.filter((tag) => tag !== tagToDelete));
  };

  const resetForm = () => {
    setSelectedFile(null);
    setCvName("");
    setVersionNotes("");
    setTags([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSave = async () => {
    setError(null);
    setSuccess(false);

    if (!selectedFile) return setError("Please select a file to upload.");
    if (!cvName.trim()) return setError("CV name is required.");

    const formData = new FormData();
    formData.append("userId", userId);
    formData.append("file", selectedFile);
    formData.append("label", cvName);
    formData.append("notes", versionNotes);
    formData.append("tags", JSON.stringify(tags));

    setLoading(true);
    const result = await uploadStudentCVAction(formData);
    setLoading(false);

    if (!result.success) {
      setError(result.error ?? "Something went wrong. Please try again.");
      return;
    }

    setSuccess(true);
    resetForm();
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
        {/* ── Upload zone ── */}
        <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 0.5 }}>
            Upload your CV
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Add a new CV to your library
          </Typography>

          <Box
            sx={{
              mt: 3,
              border: "1px dashed",
              borderColor: "divider",
              borderRadius: 2,
              minHeight: 220,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#fcfcfd",
            }}
          >
            <Stack spacing={1.5} alignItems="center">
              <Box
                sx={{
                  width: 56,
                  height: 56,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "text.primary",
                  fontSize: 44,
                  lineHeight: 1,
                }}
              >
                <UploadOutlined />
              </Box>

              <Typography variant="body2" color="text.secondary">
                Drag and drop your CV here
              </Typography>

              <Button
                variant="contained"
                size="small"
                onClick={handleChooseFile}
              >
                Choose file
              </Button>

              {selectedFile && (
                <Fade in timeout={250}>
                  <Typography variant="caption" color="text.secondary">
                    Selected: {selectedFile.name}
                  </Typography>
                </Fade>
              )}

              <input
                ref={fileInputRef}
                type="file"
                hidden
                accept=".pdf,.doc,.docx"
                onChange={handleFileChange}
              />
            </Stack>
          </Box>
        </CardContent>

        <Divider />

        {/* ── CV Details ── */}
        <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 0.5 }}>
            CV Details
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Add information about this CV
          </Typography>

          <Stack spacing={2.5}>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "160px 1fr" },
                alignItems: "center",
                gap: 1.5,
              }}
            >
              <Typography variant="body2" color="text.secondary">
                CV Name :
              </Typography>
              <TextField
                fullWidth
                size="small"
                placeholder="example"
                value={cvName}
                onChange={(e) => setCvName(e.target.value)}
                sx={inputSx}
              />
            </Box>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "160px 1fr" },
                alignItems: "center",
                gap: 1.5,
              }}
            >
              <Typography variant="body2" color="text.secondary">
                Version/ Notes :
              </Typography>
              <TextField
                fullWidth
                size="small"
                placeholder="example"
                value={versionNotes}
                onChange={(e) => setVersionNotes(e.target.value)}
                sx={inputSx}
              />
            </Box>

            {/* ── Tags ── */}
            <Box sx={{ pt: 1 }}>
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                sx={{ mb: 1.5 }}
              >
                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                  CV Tags
                </Typography>

                <Button
                  variant="outlined"
                  startIcon={<Add />}
                  onClick={() => setTagDialogOpen(true)}
                  sx={{ px: 2.25, py: 1, minWidth: 160, borderRadius: 1.5 }}
                >
                  Add Tag
                </Button>
              </Stack>

              <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                {tags.map((tag, index) => (
                  <Grow
                    in
                    timeout={250 + index * 60}
                    key={tag}
                    style={{ transformOrigin: "0 0 0" }}
                  >
                    <Chip
                      label={tag}
                      onDelete={() => removeTag(tag)}
                      deleteIcon={<Close fontSize="small" />}
                      sx={{
                        borderRadius: 1,
                        height: 44,
                        backgroundColor: "#f3f4f6",
                        "& .MuiChip-label": {
                          px: 1.75,
                          fontSize: 15,
                          fontWeight: 500,
                        },
                        "& .MuiChip-deleteIcon": {
                          fontSize: 20,
                          color: "rgba(0,0,0,0.35)",
                        },
                      }}
                    />
                  </Grow>
                ))}
              </Stack>
            </Box>

            {/* ── Feedback banners ── */}
            {error && (
              <Alert severity="error" onClose={() => setError(null)}>
                {error} Please try again.
              </Alert>
            )}

            {success && (
              <Alert severity="success" onClose={() => setSuccess(false)}>
                CV uploaded successfully!
              </Alert>
            )}

            {/* ── Save button ── */}
            <Box sx={{ display: "flex", justifyContent: "flex-end", pt: 1 }}>
              <Button
                variant="contained"
                onClick={handleSave}
                disabled={loading}
                startIcon={
                  loading ? (
                    <CircularProgress size={16} color="inherit" />
                  ) : null
                }
              >
                {loading ? "Saving..." : "Save CV"}
              </Button>
            </Box>
          </Stack>
        </CardContent>
      </Card>

      {/* ── Add Tag dialog ── */}
      <Dialog
        open={tagDialogOpen}
        onClose={() => setTagDialogOpen(false)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>Add CV Tag</DialogTitle>
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
            placeholder="Type a tag for this CV"
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
    </>
  );
}
