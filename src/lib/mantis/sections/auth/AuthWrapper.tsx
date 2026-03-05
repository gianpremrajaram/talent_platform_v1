import { ReactNode } from 'react';

// material-ui
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';

// project imports
import AuthCard from './AuthCard';
import AuthBackground from './AuthBackground';
import AuthFooter from 'components/cards/AuthFooter';
import Logo from 'components/logo';

interface Props {
  children: ReactNode;
}

// ==============================|| AUTHENTICATION - WRAPPER ||============================== //

export default function AuthWrapper({ children }: Props) {
  return (
    <Box sx={{ minHeight: '100vh' }}>
      <AuthBackground />
      <Stack sx={{ minHeight: '100vh', justifyContent: 'flex-end' }}>
        <Box sx={{ px: 3, mt: 3 }}>
          <Logo to="/" />
        </Box>
        <Box>
          <Grid
            container
            sx={{
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: { xs: 'calc(100vh - 210px)', sm: 'calc(100vh - 134px)', md: 'calc(100vh - 132px)' }
            }}
            size={12}
          >
            <Grid>
              <AuthCard>{children}</AuthCard>
            </Grid>
          </Grid>
        </Box>
        <Box sx={{ p: 3 }}>
          <AuthFooter />
        </Box>
      </Stack>
    </Box>
  );
}
