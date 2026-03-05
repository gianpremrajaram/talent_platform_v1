import { ChangeEvent } from 'react';

// material-ui
import { Theme, useColorScheme } from '@mui/material/styles';
import CardMedia from '@mui/material/CardMedia';
import FormControlLabel from '@mui/material/FormControlLabel';
import Grid from '@mui/material/Grid';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

// project imports
import MainCard from 'components/MainCard';

import { ThemeMode } from 'config';

// assets
const defaultLayout = '/assets/images/customization/default.svg';
const darkLayout = '/assets/images/customization/dark.svg';
const systemLayout = '/assets/images/customization/system.svg';

// ==============================|| CUSTOMIZATION - MODE ||============================== //

export default function ThemeModeLayout() {
  const { mode, setMode } = useColorScheme();

  const handleModeChange = (event: ChangeEvent<HTMLInputElement>) => {
    setMode(event.target.value as ThemeMode);
  };

  const activeCardStyle = (theme: Theme) => ({
    bgcolor: 'primary.lighter',
    boxShadow: theme.vars.customShadows.primary,
    '&:hover': { boxShadow: theme.vars.customShadows.primary }
  });

  return (
    <RadioGroup row aria-label="payment-card" name="payment-card" value={mode} onChange={handleModeChange}>
      <Grid container spacing={2.5}>
        <Grid>
          <FormControlLabel
            control={<Radio value="light" sx={{ display: 'none' }} />}
            label={
              <MainCard
                content={false}
                border={false}
                boxShadow
                sx={(theme: Theme) => ({
                  bgcolor: 'secondary.lighter',
                  p: 1,
                  ...(mode === ThemeMode.LIGHT && { ...activeCardStyle(theme) })
                })}
              >
                <Stack sx={{ gap: 1.25, alignItems: 'center' }}>
                  <CardMedia component="img" src={defaultLayout} alt="Vertical" sx={{ borderRadius: 1, width: 64, height: 64 }} />
                  <Typography variant="caption">Light</Typography>
                </Stack>
              </MainCard>
            }
            sx={{ m: 0 }}
          />
        </Grid>
        <Grid>
          <FormControlLabel
            control={<Radio value="dark" sx={{ display: 'none' }} />}
            label={
              <MainCard
                content={false}
                border={false}
                boxShadow
                sx={(theme: Theme) => ({
                  bgcolor: 'secondary.lighter',
                  p: 1,
                  ...(mode == ThemeMode.DARK && { ...activeCardStyle(theme) })
                })}
              >
                <Stack sx={{ gap: 1.25, alignItems: 'center' }}>
                  <CardMedia component="img" src={darkLayout} alt="Vertical" sx={{ borderRadius: 1, width: 64, height: 64 }} />
                  <Typography variant="caption">Dark</Typography>
                </Stack>
              </MainCard>
            }
            sx={{ m: 0 }}
          />
        </Grid>
        <Grid>
          <FormControlLabel
            control={<Radio value="system" sx={{ display: 'none' }} />}
            label={
              <MainCard
                content={false}
                border={false}
                boxShadow
                sx={(theme: Theme) => ({
                  bgcolor: 'secondary.lighter',
                  p: 1,
                  ...(mode == ThemeMode.SYSTEM && { ...activeCardStyle(theme) })
                })}
              >
                <Stack sx={{ gap: 1.25, alignItems: 'center' }}>
                  <CardMedia component="img" src={systemLayout} alt="Vertical" sx={{ borderRadius: 1, width: 64, height: 64 }} />
                  <Typography variant="caption">System</Typography>
                </Stack>
              </MainCard>
            }
            sx={{ m: 0 }}
          />
        </Grid>
      </Grid>
    </RadioGroup>
  );
}
