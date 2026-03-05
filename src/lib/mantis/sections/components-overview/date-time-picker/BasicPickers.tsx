'use client';

import { useState } from 'react';

// material-ui
import Stack from '@mui/material/Stack';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { DesktopDatePicker } from '@mui/x-date-pickers/DesktopDatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { MobileDatePicker } from '@mui/x-date-pickers/MobileDatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';

// project imports
import MainCard from 'components/MainCard';

// assets
import CalendarOutlined from '@ant-design/icons/CalendarOutlined';
import ClockCircleOutlined from '@ant-design/icons/ClockCircleOutlined';

// ==============================|| DATE PICKER - BASIC ||============================== //

export default function BasicDateTimePickers() {
  const [value, setValue] = useState<Date | null>(new Date('2014-08-18T21:11:54'));

  const handleChange = (newValue: Date | null) => {
    setValue(newValue);
  };

  return (
    <MainCard title="Basic Picker">
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <Stack sx={{ gap: 3 }}>
          <DesktopDatePicker
            format="MM/dd/yyyy"
            value={value}
            onChange={handleChange}
            slots={{ openPickerIcon: () => <CalendarOutlined /> }}
          />
          <MobileDatePicker
            format="MM/dd/yyyy"
            value={value}
            onChange={handleChange}
            slots={{ openPickerIcon: () => <CalendarOutlined /> }}
          />
          <TimePicker value={value} onChange={handleChange} slots={{ openPickerIcon: () => <ClockCircleOutlined /> }} />
          <DateTimePicker value={value} onChange={handleChange} slots={{ openPickerIcon: () => <CalendarOutlined /> }} />
        </Stack>
      </LocalizationProvider>
    </MainCard>
  );
}
