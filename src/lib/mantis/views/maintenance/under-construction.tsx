// material-ui
import Button from '@mui/material/Button';
import CardMedia from '@mui/material/CardMedia';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

// project imports
import { APP_DEFAULT_PATH } from 'config';
import { NextLink } from 'components/routes';

// assets
const construction = '/assets/images/maintenance/under-construction.svg';

// ==============================|| UNDER CONSTRUCTION - MAIN ||============================== //

export default function UnderConstruction() {
  return (
    <Stack sx={{ alignItems: 'center', justifyContent: 'center', minHeight: '100vh', py: 2, gap: 2 }}>
      <Box sx={{ width: { xs: 300, sm: 480 }, my: 2 }}>
        <CardMedia component="img" src={construction} alt="mantis" sx={{ height: 'auto' }} />
      </Box>
      <Typography align="center" variant="h1">
        Under Construction
      </Typography>
      <Typography color="text.secondary" align="center" sx={{ width: '85%' }}>
        Hey! Please check out this site later. We are doing some maintenance on it right now.
      </Typography>
      <Button component={NextLink} href={APP_DEFAULT_PATH} variant="contained">
        Back To Home
      </Button>
    </Stack>
  );
}
