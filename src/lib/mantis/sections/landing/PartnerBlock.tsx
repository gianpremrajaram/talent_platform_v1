// material-ui
import { useColorScheme, useTheme } from '@mui/material/styles';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

// third-party
import Marquee from 'react-fast-marquee';

// project imports
import Animation from './Animation';
import MainCard from 'components/MainCard';
import SectionTypeset from 'components/pages/SectionTypeset';

import { ThemeDirection, ThemeMode } from 'config';
import { withAlpha } from 'utils/colorUtils';

// assets
const techCI = '/assets/images/landing/technology/tech-ci.png';
const techAngular = '/assets/images/landing/technology/tech-angular.png';
const techBootstrap = '/assets/images/landing/technology/tech-bootstrap.png';
const techDotnet = '/assets/images/landing/technology/tech-dot-net.png';
const techVue = '/assets/images/landing/technology/tech-vue.png';

const techCIDark = '/assets/images/landing/technology/tech-ci-dark.png';
const techAngularDark = '/assets/images/landing/technology/tech-angular-dark.png';
const techBootstrapDark = '/assets/images/landing/technology/tech-bootstrap-dark.png';
const techDotnetDark = '/assets/images/landing/technology/tech-dot-net-dark.png';
const techVueDark = '/assets/images/landing/technology/tech-vue-dark.png';

// ================================|| SLIDER - ITEMS ||================================ //

function Item({ item }: { item: { text: string; highlight?: boolean } }) {
  const { colorScheme } = useColorScheme();
  const customShadow = colorScheme === ThemeMode.DARK ? '#000' : `${withAlpha('#000', 0.1)}`;

  return (
    <MainCard
      content={false}
      border={false}
      sx={{
        py: { xs: 1.25, sm: 2.5 },
        px: { xs: 2.5, sm: 5 },
        '&:hover': { boxShadow: `0px 4px 6px ${customShadow}`, bgcolor: 'background.paper' }
      }}
    >
      <Typography
        variant="h3"
        sx={{
          cursor: 'pointer',
          fontWeight: 500,
          transition: 'all 0.3s ease-in-out',
          opacity: item.highlight ? 0.75 : 0.4,
          '&:hover': { opacity: '1' }
        }}
      >
        {item.text}
      </Typography>
    </MainCard>
  );
}

// ==============================|| LANDING - PARTNER PAGE ||============================== //

export default function PartnerBlock() {
  const theme = useTheme();
  const { colorScheme } = useColorScheme();

  const partnerimage = [
    {
      image: colorScheme === ThemeMode.DARK ? techCIDark : techCI,
      link: 'https://codedthemes.com/item/mantis-codeigniter-admin-template/'
    },
    {
      image: colorScheme === ThemeMode.DARK ? techAngularDark : techAngular,
      link: 'https://codedthemes.com/item/mantis-angular-admin-template/'
    },
    {
      image: colorScheme === ThemeMode.DARK ? techBootstrapDark : techBootstrap,
      link: 'https://codedthemes.com/item/mantis-bootstrap-admin-dashboard/'
    },
    {
      image: colorScheme === ThemeMode.DARK ? techDotnetDark : techDotnet,
      link: 'https://codedthemes.com/item/mantis-dotnet-bootstrap-dashboard-template/'
    },
    {
      image: colorScheme === ThemeMode.DARK ? techVueDark : techVue,
      link: 'https://codedthemes.com/item/mantis-vue-admin-template/'
    }
  ];

  const items = [
    { text: 'Auth Methods' },
    { text: '128+ Pages' },
    { text: '6+ Preset Colors' },
    { text: '200+ Widgets' },
    { text: 'Best User Experience' },
    { text: 'Live Customizer' },
    { text: '5+ Apps' },
    { text: 'MUI v7' },
    { text: 'Highly Flexible' },
    { text: 'Always Updated' },
    { text: 'Professional Design' },
    { text: 'TypeScript Support' },
    { text: 'Figma Design' },
    { text: 'Dark Layout' },
    { text: 'RTL Support' },
    { text: 'Retina Ready' },
    { text: 'Prettier Code' },
    { text: 'i18n Support' }
  ];

  return (
    <Container>
      <MainCard content={false} sx={{ py: 5, mt: 5 }}>
        <Stack sx={{ gap: 6.25 }}>
          <SectionTypeset
            heading="Available Technology"
            description={
              <>
                Mantis is available in multiple technologies. Simply click to dive in and discover the perfect solution for your needs. Each
                sold{' '}
                <Link href="#!" underline="hover">
                  separately.
                </Link>
              </>
            }
            caption="Multiple Tech Stack"
            descriptionProps={{ maxWidth: 600, mx: 'auto' }}
          />
          <Grid container spacing={2.5} sx={{ mb: '-6px', textAlign: 'center', justifyContent: 'center', flexWrap: 'wrap' }}>
            {partnerimage.map((item, index) => (
              <Grid key={index}>
                <Animation
                  variants={{
                    visible: { opacity: 1 },
                    hidden: { opacity: 0 }
                  }}
                >
                  <Link href={item.link} target="_blank">
                    <Box
                      component="img"
                      src={item.image}
                      alt="feature"
                      sx={{
                        transition: 'transform 0.3s ease, opacity 0.3s ease',
                        '&:hover': {
                          transform: 'scale(1.1)',
                          opacity: 0.8
                        }
                      }}
                    />
                  </Link>
                </Animation>
              </Grid>
            ))}
          </Grid>
          <Divider sx={{ borderStyle: 'dashed', borderColor: 'secondary.light' }} />

          <Box sx={{ position: 'relative' }}>
            <Grid container spacing={1.75}>
              <Grid sx={{ direction: theme.direction, overflow: 'hidden' }} size={12}>
                <Marquee pauseOnHover direction={theme.direction === ThemeDirection.RTL ? 'right' : 'left'}>
                  {items.map((item, index) => (
                    <Box sx={{ mx: 0.875 }} key={index}>
                      <Item key={index} item={item} />
                    </Box>
                  ))}
                </Marquee>
              </Grid>
              <Grid sx={{ direction: theme.direction, overflow: 'hidden' }} size={12}>
                <Marquee pauseOnHover direction={theme.direction === ThemeDirection.RTL ? 'left' : 'right'}>
                  {items.map((item, index) => (
                    <Box sx={{ mx: 0.875 }} key={index}>
                      <Item key={index} item={item} />
                    </Box>
                  ))}
                </Marquee>
              </Grid>
              <Grid sx={{ direction: theme.direction, overflow: 'hidden' }} size={12}>
                <Marquee pauseOnHover direction={theme.direction === ThemeDirection.RTL ? 'right' : 'left'}>
                  {items.map((item, index) => (
                    <Box sx={{ mx: 0.875 }} key={index}>
                      <Item key={index} item={item} />
                    </Box>
                  ))}
                </Marquee>
              </Grid>
            </Grid>
            <Box
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: 1,
                height: 1,
                borderRadius: '50%',
                bgcolor: 'secondary.light',
                opacity: { xs: 1, sm: 0.6 },
                ...theme.applyStyles('dark', {
                  bgcolor: 'secondary.main',
                  opacity: 0.25
                }),
                filter: { xs: 'blur(170px)', sm: 'blur(250px)' }
              }}
            />
          </Box>
        </Stack>
      </MainCard>
    </Container>
  );
}
