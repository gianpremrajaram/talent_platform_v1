import { ReactNode } from 'react';

// material-ui
import CardMedia from '@mui/material/CardMedia';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

// project imports
import MainCard from 'components/MainCard';
import Animation from './Animation';

interface DemoCardProps {
  title: ReactNode;
  description: ReactNode;
  action?: ReactNode;
  image?: string;
  contentSX?: Record<string, unknown>;
}

// ==============================|| DEMO - CARD ||============================== //

export default function DemoCard({ title, description, action, image, contentSX }: DemoCardProps) {
  return (
    <Animation variants={{ visible: { opacity: 1 }, hidden: { opacity: 0 } }}>
      <MainCard contentSX={{ p: 3, ...(contentSX || {}) }}>
        <Stack sx={{ gap: 3.25, mt: 2, alignItems: 'flex-start' }}>
          <Stack sx={{ gap: 1.25 }}>
            <Typography variant="h4">{title}</Typography>
            <Typography variant="body1" color="secondary">
              {description}
            </Typography>
          </Stack>
          {action}
          {image && (
            <Box sx={{ '& img': { mb: -3.75, width: `calc(100% + 28px)`, borderTopLeftRadius: 4 } }}>
              <CardMedia component="img" src={image} alt="feature" />
            </Box>
          )}
        </Stack>
      </MainCard>
    </Animation>
  );
}
