'use client';

// material ui
import { useColorScheme } from '@mui/material/styles';
import Grid from '@mui/material/Grid';

// third-party
import ReCAPTCHA from 'react-google-recaptcha';

// project imports
import MainCard from 'components/MainCard';

// ==============================|| PLUGIN - RECAPTCHA ||============================== //

export default function RecaptchaPage() {
  const { colorScheme } = useColorScheme();
  const handleOnChange = () => {};

  return (
    <Grid container spacing={3}>
      <Grid size={{ xs: 12, md: 12, lg: 6 }}>
        <MainCard title="ReCaptcha Example">
          <ReCAPTCHA key={colorScheme} sitekey="6LdzqbcaAAAAALrGEZWQHIHUhzJZc8O-KSTdTTh_" onChange={handleOnChange} theme={colorScheme} />
        </MainCard>
      </Grid>
    </Grid>
  );
}
