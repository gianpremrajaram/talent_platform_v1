// next
import NextLink from 'next/link';

// material-ui
import { useColorScheme } from '@mui/material/styles';
import CardMedia from '@mui/material/CardMedia';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

// third-party
import Slider from 'react-slick';

// project imports
import MainCard from 'components/MainCard';
import SectionTypeset from 'components/pages/SectionTypeset';
import { ThemeMode } from 'config';
import useAriaHidden from 'hooks/useAriaHidden';

// assets
import ArrowRightOutlined from '@ant-design/icons/ArrowRightOutlined';

interface apps {
  title: string;
  img: string;
  link: string;
}

const appsList: apps[] = [
  { title: 'Chat', img: 'chat', link: '/apps/chat' },
  { title: 'Calendar', img: 'calender', link: '/apps/calendar' },
  { title: 'Kanban', img: 'kanban', link: '/apps/kanban/board' },
  { title: 'Customer', img: 'customer', link: '/apps/customer/customer-list' },
  { title: 'Invoice', img: 'invoice', link: 'apps/invoice/dashboard' },
  { title: 'Profile', img: 'profile', link: '/apps/profiles/user/personal' },
  { title: 'E-Commerce', img: 'e-commerce', link: '/apps/e-commerce/products' }
];

// ==============================|| LANDING - ELEMENT PAGE ||============================== //

export default function ElementBlock() {
  const { colorScheme } = useColorScheme();
  const updateAriaHidden = useAriaHidden();
  const AppTheme = colorScheme === ThemeMode.DARK ? 'dark' : 'light';

  const sliderSettings = {
    infinite: true,
    autoplay: true,
    autoplaySpeed: 2500,
    speed: 600,
    slidesToShow: 3,
    slidesToScroll: 1,
    dots: true,
    arrows: false,
    responsive: [
      { breakpoint: 1024, settings: { slidesToShow: 2 } },
      { breakpoint: 765, settings: { slidesToShow: 1 } }
    ],
    afterChange: () => {
      // the custom hook to manage aria-hidden and inert attributes for anchor tags
      updateAriaHidden();
    }
  };

  return (
    <Container>
      <Stack
        sx={{
          position: 'relative',
          gap: 6,
          '& .slick-dots': {
            my: -2,
            '& button:before': { color: 'text.secondary' },
            '& .slick-active button:before': { color: 'primary.main' }
          }
        }}
      >
        <SectionTypeset
          heading="Seamless Web Apps for Everyday Work"
          description="Streamline your tasks with tools built for productivity and collaboration."
        />
        <Slider {...sliderSettings}>
          {appsList.map((app, index) => (
            <Box key={index} sx={{ px: 1.25 }}>
              <MainCard content={false}>
                <CardMedia component="img" image={`/assets/images/landing/img-${app.img}-${AppTheme}.png`} alt="Element" />
                <Stack
                  component={NextLink}
                  href={app.link}
                  direction="row"
                  target="_blank"
                  sx={{
                    color: 'text.secondary',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    p: 2.5,
                    bgcolor: 'background.paper',
                    textDecoration: 'none'
                  }}
                >
                  <Typography variant="h4" color="text.primary">
                    {app.title}
                  </Typography>
                  <ArrowRightOutlined style={{ fontSize: 20 }} />
                </Stack>
              </MainCard>
            </Box>
          ))}
        </Slider>
        <Box
          sx={(theme) => ({
            position: 'absolute',
            top: '60%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: { xs: 1, sm: 400 },
            maxWidth: 400,
            height: { xs: 200, sm: 240 },
            borderRadius: '50%',
            bgcolor: 'primary.light',
            opacity: 0.3,
            ...theme.applyStyles('dark', { opacity: 0.75 }),
            filter: 'blur(200px)',
            zIndex: -1
          })}
        />
      </Stack>
    </Container>
  );
}
