// material-ui
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

// project imports
import MainCard from 'components/MainCard';

// third-party
import { motion } from 'framer-motion';

interface NumberItem {
  value: string;
  title: string;
  description: string;
  delay: number;
}

const numberItems: NumberItem[] = [
  {
    value: '128+',
    title: 'Pages',
    description: 'Comprehensive page templates for every use case',
    delay: 0.2
  },
  {
    value: '200+',
    title: 'MUI Components',
    description: 'Production-ready Material-UI components',
    delay: 0.4
  },
  {
    value: '150+',
    title: 'UI Elements',

    description: 'Perfect display on all devices and screen sizes',
    delay: 0.6
  },
  {
    value: '5+',
    title: 'Applications',
    description: 'Complete application demos and templates',
    delay: 0.8
  },
  {
    value: '50+',
    title: 'Icons',
    description: 'Diverse icon set for enhanced visual communication',
    delay: 0.8
  }
];

// ==============================|| LANDING - NUMBER BLOCK PAGE ||============================== //

export default function NumberBlock() {
  return (
    <Container>
      <Stack direction={{ xs: 'column', sm: 'row' }} sx={{ gap: 2.5, justifyContent: 'center', flexWrap: { sm: 'wrap', lg: 'nowrap' } }}>
        {numberItems.map((item, index) => (
          <MainCard key={index} sx={{ maxWidth: { sm: 240 } }}>
            <motion.div
              initial={{ opacity: 0, translateY: 100 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{
                type: 'spring',
                stiffness: 150,
                damping: 30,
                delay: item.delay
              }}
            >
              <Stack sx={{ gap: 2, textAlign: 'center' }}>
                <Typography variant="h1" sx={{ fontWeight: '700', fontSize: { xs: 32, md: 38 } }}>
                  {item.value}
                </Typography>
                <Stack sx={{ gap: 1 }}>
                  <Typography variant="h5" sx={{ fontWeight: '500' }}>
                    {item.title}
                  </Typography>
                  <Typography variant="body1" sx={{ color: 'secondary.main' }}>
                    {item.description}
                  </Typography>
                </Stack>
              </Stack>
            </motion.div>
          </MainCard>
        ))}
      </Stack>
    </Container>
  );
}
