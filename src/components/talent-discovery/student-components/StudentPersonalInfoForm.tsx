"use client";

import * as React from "react";
import dayjs, { Dayjs } from "dayjs";
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
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import {
  saveStudentPersonalInfoAction,
  saveStudentSocialLinksAction,
} from "@/app/talent-discovery-standalone/student-personal-information/action";
import StudentSocialLinksSection, { StudentSocialLink } from "./StudentSocials";

type StudentPersonalInfoFormValues = {
  firstName: string;
  lastName: string;
  email: string;
  dateOfBirth: Dayjs | null;
  gender: string;
  phoneCode: string;
  phoneNumber: string;
  designation: string;
  address1: string;
  address2: string;
  country: string;
  state: string;
  city: string;
  postalCode: string;
};

type StudentPersonalInfoInitialValues = {
  //this is the prop we will use to call from main page, because of DOB.
  firstName?: string;
  lastName?: string;
  email?: string;
  dateOfBirth?: string | null;
  gender?: string;
  phoneCode?: string;
  phoneNumber?: string;
  designation?: string;
  address1?: string;
  address2?: string;
  country?: string;
  state?: string;
  city?: string;
  postalCode?: string;
};

type StudentSocialLinkInitialValue = {
  id: string;
  platform: "LINKEDIN" | "FACEBOOK" | "GITHUB" | "TWITTER";
  url: string;
};

type StudentPersonalInfoFormProps = {
  userId: string;
  initialValues?: StudentPersonalInfoInitialValues;
  initialSocialLinks?: StudentSocialLinkInitialValue[];
  onCancel?: () => void;
  onSave?: (values: StudentPersonalInfoFormValues) => void;
};

type FormErrors = Partial<Record<keyof StudentPersonalInfoFormValues, string>>;

type EmptyStateCardProps = {
  title: string;
  description: string;
  buttonText: string;
  onClick: () => void;
};

const defaultValues: StudentPersonalInfoFormValues = {
  firstName: "",
  lastName: "",
  email: "",
  dateOfBirth: null,
  gender: "",
  phoneCode: "+44",
  phoneNumber: "",
  designation: "",
  address1: "",
  address2: "",
  country: "",
  state: "",
  city: "",
  postalCode: "",
};

const phoneCodes = ["+1", "+44", "+91", "+61", "+971"];
const genders = ["Male", "Female", "Other", "Prefer not to say"];

function hasPersonalInfo(values: StudentPersonalInfoFormValues) {
  return Boolean(
    values.firstName.trim() ||
    values.lastName.trim() ||
    values.email.trim() ||
    values.dateOfBirth ||
    values.gender.trim() ||
    values.phoneNumber.trim() ||
    values.designation.trim(),
  );
}
function mapPrismaPlatformToUi(
  platform: StudentSocialLinkInitialValue["platform"],
): StudentSocialLink["platform"] {
  switch (platform) {
    case "LINKEDIN":
      return "linkedin";
    case "FACEBOOK":
      return "facebook";
    case "GITHUB":
      return "github";
    case "TWITTER":
      return "twitter";
  }
}

function mapUiPlatformToPrisma(
  platform: StudentSocialLink["platform"],
): StudentSocialLinkInitialValue["platform"] {
  switch (platform) {
    case "linkedin":
      return "LINKEDIN";
    case "facebook":
      return "FACEBOOK";
    case "github":
      return "GITHUB";
    case "twitter":
      return "TWITTER";
  }
}

function hasAddressInfo(values: StudentPersonalInfoFormValues) {
  return Boolean(
    values.address1.trim() ||
    values.address2.trim() ||
    values.country.trim() ||
    values.state.trim() ||
    values.city.trim() ||
    values.postalCode.trim(),
  );
}

function validatePersonalInfo(
  values: StudentPersonalInfoFormValues,
): FormErrors {
  const errors: FormErrors = {};

  if (!values.firstName.trim()) errors.firstName = "First name is required";
  if (!values.lastName.trim()) errors.lastName = "Last name is required";

  if (!values.email.trim()) {
    errors.email = "Email is required";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
    errors.email = "Enter a valid email address";
  }

  if (!values.dateOfBirth) {
    errors.dateOfBirth = "Date of birth is required";
  } else if (values.dateOfBirth.isAfter(dayjs(), "day")) {
    errors.dateOfBirth = "Date of birth cannot be in the future";
  }

  if (!values.phoneNumber.trim()) {
    errors.phoneNumber = "Phone number is required";
  } else if (!/^[0-9+\-()\s]{7,20}$/.test(values.phoneNumber)) {
    errors.phoneNumber = "Enter a valid phone number";
  }

  return errors;
}

function validateAddressInfo(
  values: StudentPersonalInfoFormValues,
): FormErrors {
  const errors: FormErrors = {};

  if (!values.address1.trim()) errors.address1 = "Address line 1 is required";
  if (!values.country.trim()) errors.country = "Country is required";
  if (!values.state.trim()) errors.state = "State / Province is required";
  if (!values.city.trim()) errors.city = "City is required";

  if (!values.postalCode.trim()) {
    errors.postalCode = "Postal code is required";
  } else if (!/^[a-zA-Z0-9\s-]{3,12}$/.test(values.postalCode)) {
    errors.postalCode = "Enter a valid postal code";
  }

  return errors;
}

function EmptyStateCard({
  title,
  description,
  buttonText,
  onClick,
}: EmptyStateCardProps) {
  return (
    <Box
      sx={(theme) => ({
        border: `1px dashed ${theme.palette.divider}`,
        borderRadius: 2,
        px: 3,
        py: 5,
        textAlign: "center",
        backgroundColor: theme.palette.action.hover,
      })}
    >
      <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
        {title}
      </Typography>

      <Typography
        color="text.secondary"
        sx={{ mb: 2, maxWidth: 560, mx: "auto" }}
      >
        {description}
      </Typography>

      <Button variant="contained" onClick={onClick}>
        {buttonText}
      </Button>
    </Box>
  );
}

export default function StudentPersonalInfoForm({
  userId,
  initialValues,
  initialSocialLinks = [],
  onCancel,
  onSave,
}: StudentPersonalInfoFormProps) {
  const theme = useTheme();

  const mergedValues = React.useMemo<StudentPersonalInfoFormValues>(
    () => ({
      ...defaultValues,
      ...initialValues,
      dateOfBirth: initialValues?.dateOfBirth
        ? dayjs(initialValues.dateOfBirth)
        : null,
    }),
    [initialValues],
  );

  const mappedInitialSocialLinks = React.useMemo<StudentSocialLink[]>(
    () =>
      initialSocialLinks.map((link) => ({
        id: link.id,
        platform: mapPrismaPlatformToUi(link.platform),
        url: link.url,
      })),
    [initialSocialLinks],
  );

  const [values, setValues] =
    React.useState<StudentPersonalInfoFormValues>(mergedValues);
  const [savedValues, setSavedValues] =
    React.useState<StudentPersonalInfoFormValues>(mergedValues);
  const [errors, setErrors] = React.useState<FormErrors>({});

  const [isEditingPersonal, setIsEditingPersonal] = React.useState(false);
  const [isEditingAddress, setIsEditingAddress] = React.useState(false);

  React.useEffect(() => {
    setValues(mergedValues);
    setSavedValues(mergedValues);
    setErrors({});
    setIsEditingPersonal(false);
    setIsEditingAddress(false);
  }, [mergedValues]);

  const personalExists = hasPersonalInfo(savedValues);
  const addressExists = hasAddressInfo(savedValues);

  const handleChange =
    (field: keyof StudentPersonalInfoFormValues) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setValues((prev) => ({
        ...prev,
        [field]: event.target.value,
      }));

      if (errors[field]) {
        setErrors((prev) => ({
          ...prev,
          [field]: "",
        }));
      }
    };

  const handleDateChange = (value: unknown) => {
    const normalizedValue =
      value == null
        ? null
        : dayjs.isDayjs(value)
          ? value
          : dayjs(value as Date);

    setValues((prev) => ({
      ...prev,
      dateOfBirth: normalizedValue,
    }));

    if (errors.dateOfBirth) {
      setErrors((prev) => ({
        ...prev,
        dateOfBirth: "",
      }));
    }
  };

  const handleSavePersonal = async () => {
    const validationErrors = validatePersonalInfo(values);

    setErrors((prev) => ({
      ...prev,
      ...validationErrors,
    }));

    const personalFields: (keyof StudentPersonalInfoFormValues)[] = [
      "firstName",
      "lastName",
      "email",
      "dateOfBirth",
      "phoneNumber",
    ];

    const hasError = personalFields.some((field) => validationErrors[field]);

    if (hasError) return;

    await saveStudentPersonalInfoAction({
      userId,
      data: {
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        dateOfBirth: values.dateOfBirth
          ? values.dateOfBirth.toISOString()
          : null,
        gender: values.gender,
        phoneCode: values.phoneCode,
        phoneNumber: values.phoneNumber,
        designation: values.designation,
      },
    });

    const nextSavedValues = { ...savedValues, ...values };
    setSavedValues(nextSavedValues);
    setValues(nextSavedValues);
    setIsEditingPersonal(false);
    onSave?.(nextSavedValues);
  };

  const handleSaveAddress = async () => {
    const validationErrors = validateAddressInfo(values);

    setErrors((prev) => ({
      ...prev,
      ...validationErrors,
    }));

    const addressFields: (keyof StudentPersonalInfoFormValues)[] = [
      "address1",
      "country",
      "state",
      "city",
      "postalCode",
    ];

    const hasError = addressFields.some((field) => validationErrors[field]);

    if (hasError) return;

    await saveStudentPersonalInfoAction({
      userId,
      data: {
        address1: values.address1,
        address2: values.address2,
        country: values.country,
        state: values.state,
        city: values.city,
        postalCode: values.postalCode,
      },
    });

    const nextSavedValues = { ...savedValues, ...values };
    setSavedValues(nextSavedValues);
    setValues(nextSavedValues);
    setIsEditingAddress(false);
    onSave?.(nextSavedValues);
  };

  const handleCancelPersonal = () => {
    setValues((prev) => ({
      ...prev,
      firstName: savedValues.firstName,
      lastName: savedValues.lastName,
      email: savedValues.email,
      dateOfBirth: savedValues.dateOfBirth,
      gender: savedValues.gender,
      phoneCode: savedValues.phoneCode,
      phoneNumber: savedValues.phoneNumber,
      designation: savedValues.designation,
    }));

    setErrors((prev) => ({
      ...prev,
      firstName: "",
      lastName: "",
      email: "",
      dateOfBirth: "",
      gender: "",
      phoneCode: "",
      phoneNumber: "",
      designation: "",
    }));

    setIsEditingPersonal(false);
    onCancel?.();
  };

  const handleCancelAddress = () => {
    setValues((prev) => ({
      ...prev,
      address1: savedValues.address1,
      address2: savedValues.address2,
      country: savedValues.country,
      state: savedValues.state,
      city: savedValues.city,
      postalCode: savedValues.postalCode,
    }));

    setErrors((prev) => ({
      ...prev,
      address1: "",
      address2: "",
      country: "",
      state: "",
      city: "",
      postalCode: "",
    }));

    setIsEditingAddress(false);
    onCancel?.();
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

  const readOnlySx = {
    "& .MuiOutlinedInput-root": {
      borderRadius: 1.5,
      backgroundColor: theme.palette.action.hover,
    },
    "& .MuiInputBase-input.Mui-disabled": {
      WebkitTextFillColor: theme.palette.text.primary,
      opacity: 1,
      cursor: "default",
    },
    "& .MuiSvgIcon-root": {
      opacity: 0.5,
    },
  };

  const labelSx = {
    mb: 1,
    fontSize: "0.875rem",
    fontWeight: 500,
    color: theme.palette.text.secondary,
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
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
            Student Personal Information
          </Typography>
        </Box>

        <CardContent sx={{ p: 3 }}>
          {!personalExists && !isEditingPersonal ? (
            <EmptyStateCard
              title="No personal information added yet"
              description="Add your name, email, date of birth, phone number, and other basic details."
              buttonText="Add Personal Information"
              onClick={() => setIsEditingPersonal(true)}
            />
          ) : (
            <>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                flexWrap="wrap"
                gap={1.5}
                sx={{ mb: 2.5 }}
              >
                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                  Personal Information
                </Typography>

                {!isEditingPersonal && (
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => {
                      setErrors({});
                      setIsEditingPersonal(true);
                    }}
                  >
                    Edit
                  </Button>
                )}
              </Stack>

              <Grid container spacing={2.5}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography component="label" htmlFor="field-first-name" sx={labelSx}>First Name</Typography>
                  <TextField
                    id="field-first-name"
                    fullWidth
                    value={values.firstName}
                    onChange={handleChange("firstName")}
                    error={!!errors.firstName}
                    helperText={errors.firstName}
                    disabled={!isEditingPersonal}
                    sx={isEditingPersonal ? inputSx : readOnlySx}
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography component="label" htmlFor="field-last-name" sx={labelSx}>Last Name</Typography>
                  <TextField
                    id="field-last-name"
                    fullWidth
                    value={values.lastName}
                    onChange={handleChange("lastName")}
                    error={!!errors.lastName}
                    helperText={errors.lastName}
                    disabled={!isEditingPersonal}
                    sx={isEditingPersonal ? inputSx : readOnlySx}
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography component="label" htmlFor="field-email" sx={labelSx}>Email Address</Typography>
                  <TextField
                    id="field-email"
                    fullWidth
                    type="email"
                    value={values.email}
                    onChange={handleChange("email")}
                    error={!!errors.email}
                    helperText={errors.email}
                    disabled={!isEditingPersonal}
                    sx={isEditingPersonal ? inputSx : readOnlySx}
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography component="label" htmlFor="field-dob" sx={labelSx}>Date of Birth</Typography>
                  <DatePicker
                    value={values.dateOfBirth}
                    onChange={handleDateChange}
                    disabled={!isEditingPersonal}
                    disableFuture
                    format="DD/MM/YYYY"
                    slotProps={{
                      textField: {
                        id: "field-dob",
                        fullWidth: true,
                        error: !!errors.dateOfBirth,
                        helperText: errors.dateOfBirth,
                        sx: isEditingPersonal ? inputSx : readOnlySx,
                      },
                    }}
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography component="label" htmlFor="field-gender" sx={labelSx}>Gender</Typography>
                  <TextField
                    id="field-gender"
                    select
                    fullWidth
                    value={values.gender}
                    onChange={handleChange("gender")}
                    disabled={!isEditingPersonal}
                    sx={isEditingPersonal ? inputSx : readOnlySx}
                  >
                    {genders.map((gender) => (
                      <MenuItem key={gender} value={gender}>
                        {gender}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography sx={labelSx}>Phone Number</Typography>
                  <Stack direction="row" spacing={1.5}>
                    <TextField
                      id="field-phone-code"
                      select
                      label="Phone country code"
                      InputLabelProps={{
                        shrink: true,
                        sx: {
                          position: "absolute",
                          width: 1,
                          height: 1,
                          overflow: "hidden",
                          clip: "rect(0 0 0 0)",
                          clipPath: "inset(50%)",
                          whiteSpace: "nowrap",
                        },
                      }}
                      InputProps={{ notched: false }}
                      value={values.phoneCode}
                      onChange={handleChange("phoneCode")}
                      disabled={!isEditingPersonal}
                      sx={{
                        ...(isEditingPersonal ? inputSx : readOnlySx),
                        minWidth: 100,
                      }}
                    >
                      {phoneCodes.map((code) => (
                        <MenuItem key={code} value={code}>
                          {code}
                        </MenuItem>
                      ))}
                    </TextField>

                    <TextField
                      id="field-phone-number"
                      fullWidth
                      value={values.phoneNumber}
                      onChange={handleChange("phoneNumber")}
                      error={!!errors.phoneNumber}
                      helperText={errors.phoneNumber}
                      disabled={!isEditingPersonal}
                      inputProps={{ "aria-label": "Phone number" }}
                      sx={isEditingPersonal ? inputSx : readOnlySx}
                    />
                  </Stack>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography component="label" htmlFor="field-designation" sx={labelSx}>Designation</Typography>
                  <TextField
                    id="field-designation"
                    fullWidth
                    value={values.designation}
                    onChange={handleChange("designation")}
                    disabled={!isEditingPersonal}
                    sx={isEditingPersonal ? inputSx : readOnlySx}
                  />
                </Grid>
              </Grid>

              {isEditingPersonal && (
                <Stack
                  direction="row"
                  spacing={1.5}
                  justifyContent="flex-end"
                  sx={{ mt: 3 }}
                >
                  <Button
                    variant="outlined"
                    color="secondary"
                    onClick={handleCancelPersonal}
                  >
                    Cancel
                  </Button>
                  <Button variant="contained" onClick={handleSavePersonal}>
                    Save
                  </Button>
                </Stack>
              )}
            </>
          )}

          <Divider sx={{ my: 3 }} />

          {!addressExists && !isEditingAddress ? (
            <EmptyStateCard
              title="No address added yet"
              description="Add your current address details, including country, state or province, city, and postal code."
              buttonText="Add Address"
              onClick={() => setIsEditingAddress(true)}
            />
          ) : (
            <>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                flexWrap="wrap"
                gap={1.5}
                sx={{ mb: 2.5 }}
              >
                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                  Address
                </Typography>

                {!isEditingAddress && (
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => {
                      setErrors({});
                      setIsEditingAddress(true);
                    }}
                  >
                    Edit
                  </Button>
                )}
              </Stack>

              <Grid container spacing={2.5}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography component="label" htmlFor="field-address1" sx={labelSx}>Address Line 1</Typography>
                  <TextField
                    id="field-address1"
                    fullWidth
                    multiline
                    minRows={2}
                    value={values.address1}
                    onChange={handleChange("address1")}
                    error={!!errors.address1}
                    helperText={errors.address1}
                    disabled={!isEditingAddress}
                    sx={isEditingAddress ? inputSx : readOnlySx}
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography component="label" htmlFor="field-address2" sx={labelSx}>Address Line 2</Typography>
                  <TextField
                    id="field-address2"
                    fullWidth
                    multiline
                    minRows={2}
                    value={values.address2}
                    onChange={handleChange("address2")}
                    disabled={!isEditingAddress}
                    sx={isEditingAddress ? inputSx : readOnlySx}
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography component="label" htmlFor="field-country" sx={labelSx}>Country</Typography>
                  <TextField
                    id="field-country"
                    fullWidth
                    value={values.country}
                    onChange={handleChange("country")}
                    error={!!errors.country}
                    helperText={errors.country}
                    disabled={!isEditingAddress}
                    sx={isEditingAddress ? inputSx : readOnlySx}
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography component="label" htmlFor="field-state" sx={labelSx}>State / Province</Typography>
                  <TextField
                    id="field-state"
                    fullWidth
                    value={values.state}
                    onChange={handleChange("state")}
                    error={!!errors.state}
                    helperText={errors.state}
                    disabled={!isEditingAddress}
                    sx={isEditingAddress ? inputSx : readOnlySx}
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography component="label" htmlFor="field-city" sx={labelSx}>City</Typography>
                  <TextField
                    id="field-city"
                    fullWidth
                    value={values.city}
                    onChange={handleChange("city")}
                    error={!!errors.city}
                    helperText={errors.city}
                    disabled={!isEditingAddress}
                    sx={isEditingAddress ? inputSx : readOnlySx}
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography component="label" htmlFor="field-postal-code" sx={labelSx}>Postal Code</Typography>
                  <TextField
                    id="field-postal-code"
                    fullWidth
                    value={values.postalCode}
                    onChange={handleChange("postalCode")}
                    error={!!errors.postalCode}
                    helperText={errors.postalCode}
                    disabled={!isEditingAddress}
                    sx={isEditingAddress ? inputSx : readOnlySx}
                  />
                </Grid>
              </Grid>

              {isEditingAddress && (
                <Stack
                  direction="row"
                  spacing={1.5}
                  justifyContent="flex-end"
                  sx={{ mt: 3 }}
                >
                  <Button
                    variant="outlined"
                    color="secondary"
                    onClick={handleCancelAddress}
                  >
                    Cancel
                  </Button>
                  <Button variant="contained" onClick={handleSaveAddress}>
                    Save
                  </Button>
                </Stack>
              )}
            </>
          )}

          <StudentSocialLinksSection
            value={mappedInitialSocialLinks}
            onSave={async (links) => {
              await saveStudentSocialLinksAction({
                userId,
                links: links.map((link) => ({
                  platform: mapUiPlatformToPrisma(link.platform),
                  url: link.url,
                })),
              });
            }}
          />
        </CardContent>
      </Card>
    </LocalizationProvider>
  );
}
