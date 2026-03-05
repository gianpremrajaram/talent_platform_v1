'use client';

// material-ui
import { Theme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import CardMedia from '@mui/material/CardMedia';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

// project imports
import { APP_DEFAULT_PATH } from 'config';
import { NextLink } from 'components/routes';

// assets
const error500 = '/assets/images/maintenance/Error500.png';

// ==============================|| ERROR 500 - MAIN ||============================== //

export default function Error500() {
  const downSM = useMediaQuery((theme: Theme) => theme.breakpoints.down('sm'));

  return (
    <Stack sx={{ alignItems: 'center', justifyContent: 'center', minHeight: '100vh', textAlign: 'center', px: 2 }}>
      <Box sx={{ width: { xs: 350, sm: 396 }, my: 2 }}>
        <CardMedia component="img" src={error500} alt="mantis" />
      </Box>
      <Typography variant={downSM ? 'h2' : 'h1'}>Internal Server Error</Typography>
      <Typography color="text.secondary" variant="body2" sx={{ width: { xs: '73%', sm: '70%' }, mt: 1 }}>
        Server error 500. we fixing the problem. please try again at a later stage.
      </Typography>
      <Button component={NextLink} href={APP_DEFAULT_PATH} variant="contained" sx={{ textTransform: 'none', mt: 4 }}>
        Back To Home
      </Button>
    </Stack>
  );
}
