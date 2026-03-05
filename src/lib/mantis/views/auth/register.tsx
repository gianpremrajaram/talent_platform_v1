'use client';

// next
import NextLink from 'next/link';
import { getProviders, getCsrfToken, useSession } from 'next-auth/react';

// material-ui
import Grid from '@mui/material/Grid';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

// project imports
import AuthWrapper from 'sections/auth/AuthWrapper';
import AuthRegister from 'sections/auth/auth-forms/AuthRegister';

// ================================|| REGISTER ||================================ //

export default function Register() {
  const { data: session } = useSession();
  const csrfToken = getCsrfToken();
  const providers = getProviders();

  return (
    <AuthWrapper>
      <Grid container spacing={3}>
        <Grid size={12}>
          <Stack direction="row" sx={{ alignItems: 'baseline', justifyContent: 'space-between', mb: { xs: -0.5, sm: 0.5 } }}>
            <Typography variant="h3">Sign up</Typography>
            <Link
              component={NextLink}
              href={session ? '/pages/login' : '/login'}
              variant="body1"
              color="primary"
              sx={{ textDecoration: 'none' }}
            >
              Already have an account?
            </Link>
          </Stack>
        </Grid>
        <Grid size={12}>
          <AuthRegister providers={providers} csrfToken={csrfToken} />
        </Grid>
      </Grid>
    </AuthWrapper>
  );
}
