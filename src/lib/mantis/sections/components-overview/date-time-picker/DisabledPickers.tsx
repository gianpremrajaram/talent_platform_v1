'use client';

import { useState } from 'react';

// material-ui
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';

// project imports
import MainCard from 'components/MainCard';

// assets
import CalendarOutlined from '@ant-design/icons/CalendarOutlined';
import ClockCircleOutlined from '@ant-design/icons/ClockCircleOutlined';

// ==============================|| DATE PICKER - DISABLED ||============================== //

export default function DisabledPickers() {
  const [value, setValue] = useState<Date | null>(null);

  return (
    <MainCard title="Disabled Pickers">
      <Stack sx={{ gap: 3 }}>
        <Typography variant="h6">Date Picker</Typography>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <DatePicker
            disabled
            value={value}
            onChange={(newValue: any) => {
              setValue(newValue);
            }}
          />
          <DatePicker
            readOnly
            value={value}
            onChange={(newValue: any) => {
              setValue(newValue);
            }}
          />
        </LocalizationProvider>

        <Typography variant="h6">Date Time Picker</Typography>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <DateTimePicker
            disabled
            value={value}
            onChange={(newValue: any) => {
              setValue(newValue);
            }}
            slots={{ openPickerIcon: () => <CalendarOutlined /> }}
          />
          <DateTimePicker
            readOnly
            value={value}
            onChange={(newValue: any) => {
              setValue(newValue);
            }}
            slots={{ openPickerIcon: () => <CalendarOutlined /> }}
          />

          <Typography variant="h6">Time Picker</Typography>
          <TimePicker
            disabled
            value={value}
            onChange={(newValue: any) => {
              setValue(newValue);
            }}
            slots={{ openPickerIcon: () => <ClockCircleOutlined /> }}
          />
          <TimePicker
            readOnly
            value={value}
            onChange={(newValue: any) => {
              setValue(newValue);
            }}
            slots={{ openPickerIcon: () => <ClockCircleOutlined /> }}
          />
        </LocalizationProvider>
      </Stack>
    </MainCard>
  );
}
