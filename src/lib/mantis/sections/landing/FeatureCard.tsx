// material-ui
import CardMedia from '@mui/material/CardMedia';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

// project imports
import Animation from './Animation';
import MainCard from 'components/MainCard';

interface FeatureCardProps {
  image: string;
  title: string;
  description: string;
  animationVariants?: any;
}

// ==============================|| FEATURE - FEATURE CARD ||============================== //

export default function FeatureCard({ image, title, description, animationVariants }: FeatureCardProps) {
  const variants = animationVariants || ({ hidden: { opacity: 0, translateY: 550 }, visible: { opacity: 1, translateY: 0 } } as any);

  return (
    <Animation variants={variants}>
      <MainCard contentSX={{ p: 3 }}>
        <Stack alignItems="flex-start" sx={{ gap: 1.25, width: 1 }}>
          <CardMedia component="img" sx={{ width: 'auto' }} src={image} alt="feature" />
          <Typography variant="h5" sx={{ fontWeight: 500, mt: 1.25 }}>
            {title}
          </Typography>
          <Typography variant="body1" color="secondary">
            {description}
          </Typography>
        </Stack>
      </MainCard>
    </Animation>
  );
}
