"use client";

import * as React from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  Grid,
  MenuItem,
  Stack,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";

type StudentPersonalInfoFormValues = {
  firstName: string;
  lastName: string;
  email: string;
  birthDay: string;
  birthMonth: string;
  birthYear: string;
  phoneCode: string;
  phoneNumber: string;
  designation: string;
  address1: string;
  address2: string;
  country: string;
  city: string;
  description: string;
};

type StudentPersonalInfoFormProps = {
  initialValues?: StudentPersonalInfoFormValues;
  onCancel?: () => void;
  onSave?: (values: StudentPersonalInfoFormValues) => void;
};

const defaultValues: StudentPersonalInfoFormValues = {
  firstName: "Stebin",
  lastName: "Ben",
  email: "stebin.b0029@gmail.com",
  birthDay: "30",
  birthMonth: "January",
  birthYear: "2021",
  phoneCode: "+44",
  phoneNumber: "123-456-789",
  designation: "UI/UX Designer",
  address1: "3801 Chalk Butte Rd, Cut Bank, MT 59427, United States",
  address2: "3801 Chalk Butte Rd, Cut Bank, MT 59427, United States",
  country: "USA",
  city: "California",
  description:
    "Lorem Ipsum is simply dummy text of the printing and typesetting industry.",
};

const days = Array.from({ length: 31 }, (_, i) => String(i + 1));
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
const years = Array.from({ length: 60 }, (_, i) => String(2025 - i));
const phoneCodes = ["+1", "+44", "+91", "+61", "+971"];

export default function StudentPersonalInfoForm({
  initialValues = defaultValues,
  onCancel,
  onSave,
}: StudentPersonalInfoFormProps) {
  const theme = useTheme();
  const [values, setValues] =
    React.useState<StudentPersonalInfoFormValues>(initialValues);

  const handleChange =
    (field: keyof StudentPersonalInfoFormValues) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setValues((prev) => ({
        ...prev,
        [field]: event.target.value,
      }));
    };

  const inputSx = {
    "& .MuiOutlinedInput-root": {
      borderRadius: 1.5,
      backgroundColor: theme.palette.background.paper,
    },
    "& .MuiInputBase-input": {
      paddingTop: "12px",
      paddingBottom: "12px",
    },
  };

  const labelSx = {
    mb: 1,
    fontSize: "0.875rem",
    fontWeight: 500,
    color: theme.palette.text.secondary,
  };

  return (
    <Card
      elevation={0}
      sx={{
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 2,
        boxShadow: "none",
        backgroundColor: theme.palette.background.paper,
      }}
    >
      <Box
        sx={{
          px: 3,
          py: 2,
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          Personal Information
        </Typography>
      </Box>

      <CardContent sx={{ p: 3 }}>
        <Grid container spacing={2.5}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography sx={labelSx}>First Name</Typography>
            <TextField
              fullWidth
              value={values.firstName}
              onChange={handleChange("firstName")}
              sx={inputSx}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Typography sx={labelSx}>Last Name</Typography>
            <TextField
              fullWidth
              value={values.lastName}
              onChange={handleChange("lastName")}
              sx={inputSx}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Typography sx={labelSx}>Email Address</Typography>
            <TextField
              fullWidth
              value={values.email}
              onChange={handleChange("email")}
              sx={inputSx}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Typography sx={labelSx}>Date of Birth</Typography>
            <Stack direction="row" spacing={1.5}>
              <TextField
                select
                fullWidth
                value={values.birthDay}
                onChange={handleChange("birthDay")}
                sx={inputSx}
              >
                {days.map((day) => (
                  <MenuItem key={day} value={day}>
                    {day}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                select
                fullWidth
                value={values.birthMonth}
                onChange={handleChange("birthMonth")}
                sx={inputSx}
              >
                {months.map((month) => (
                  <MenuItem key={month} value={month}>
                    {month}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                select
                fullWidth
                value={values.birthYear}
                onChange={handleChange("birthYear")}
                sx={inputSx}
              >
                {years.map((year) => (
                  <MenuItem key={year} value={year}>
                    {year}
                  </MenuItem>
                ))}
              </TextField>
            </Stack>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Typography sx={labelSx}>Phone Number</Typography>
            <Stack direction="row" spacing={1.5}>
              <TextField
                select
                value={values.phoneCode}
                onChange={handleChange("phoneCode")}
                sx={{ ...inputSx, minWidth: 96 }}
              >
                {phoneCodes.map((code) => (
                  <MenuItem key={code} value={code}>
                    {code}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                fullWidth
                value={values.phoneNumber}
                onChange={handleChange("phoneNumber")}
                sx={inputSx}
              />
            </Stack>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Typography sx={labelSx}>Designation</Typography>
            <TextField
              fullWidth
              value={values.designation}
              onChange={handleChange("designation")}
              sx={inputSx}
            />
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        <Typography variant="h5" sx={{ fontWeight: 600, mb: 2.5 }}>
          Address
        </Typography>

        <Grid container spacing={2.5}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography sx={labelSx}>Address 01</Typography>
            <TextField
              fullWidth
              multiline
              minRows={2}
              value={values.address1}
              onChange={handleChange("address1")}
              sx={inputSx}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Typography sx={labelSx}>Address 02</Typography>
            <TextField
              fullWidth
              multiline
              minRows={2}
              value={values.address2}
              onChange={handleChange("address2")}
              sx={inputSx}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Typography sx={labelSx}>Country</Typography>
            <TextField
              fullWidth
              value={values.country}
              onChange={handleChange("country")}
              sx={inputSx}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Typography sx={labelSx}>City</Typography>
            <TextField
              fullWidth
              value={values.city}
              onChange={handleChange("city")}
              sx={inputSx}
            />
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        <Box>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 2.5 }}>
            Description
          </Typography>
          <TextField
            fullWidth
            multiline
            minRows={5}
            value={values.description}
            onChange={handleChange("description")}
            sx={{
              ...inputSx,
              "& .MuiOutlinedInput-root": {
                borderRadius: 1.5,
                backgroundColor: theme.palette.background.paper,
                alignItems: "flex-start",
              },
            }}
          />
        </Box>

        <Stack
          direction="row"
          spacing={1.5}
          justifyContent="flex-end"
          sx={{ mt: 3 }}
        >
          <Button variant="outlined" color="secondary" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant="contained" onClick={() => onSave?.(values)}>
            Save
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
}
