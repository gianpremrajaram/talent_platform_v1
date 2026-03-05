// next
import Image from 'next/image';

// material-ui
import { useTheme } from '@mui/material/styles';
import Button from '@mui/material/Button';
import CardMedia from '@mui/material/CardMedia';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';

// project imports
import useConfig from 'hooks/useConfig';
import SectionTypeset from 'components/pages/SectionTypeset';

// assets
import ArrowRightOutlined from '@ant-design/icons/ArrowRightOutlined';

const figmaIcon = '/assets/images/icons/landing-figma.svg';
const figmaBackground = '/assets/images/landing/figma-background.png';

// =============================|| LANDING - FIGMA PAGE ||============================= //

export default function FigmaBlock() {
  const theme = useTheme();
  const { state } = useConfig();

  return (
    <Box
      sx={(theme) => ({
        position: 'relative',
        overflow: 'hidden',
        bgcolor: 'secondary.800',
        py: 5,
        ...theme.applyStyles('dark', { bgcolor: 'grey.100' })
      })}
    >
      <Container maxWidth="lg">
        <Stack sx={{ alignItems: 'center', gap: 6 }}>
          <Stack gap={4}>
            <SectionTypeset
              heading="The Mantis Figma UI kit & Design system"
              description="Optimize your workflow with 100% Auto Layout, variables, smart variants, and WCAG accessibility. Enjoy super-smart global colors, typography, and effects styles + variables, crafted for seamless design efficiency!"
              headingProps={{ sx: { color: 'common.white' } }}
              descriptionProps={{ sx: { textAlign: 'center', maxWidth: 585 } }}
            />
            <Stack direction="row" gap={2} sx={{ justifyContent: 'center' }}>
              <Button variant="outlined" startIcon={<Image src={figmaIcon} width={20} height={20} alt="Figma" />}>
                Try the Free Kit
              </Button>
              <Button variant="contained" endIcon={<ArrowRightOutlined />}>
                Upgrade to Pro
              </Button>
            </Stack>
          </Stack>
          <Stack sx={{ position: 'relative', width: 1, alignItems: 'center' }}>
            <CardMedia component="img" src={figmaBackground} alt="Mantis figma back" />
            <Box sx={{ position: 'absolute', bottom: { xs: 15, sm: 25, md: 40, lg: 45 }, width: '64%' }}>
              <CardMedia
                component="img"
                src={`/assets/images/landing/figma-front-${state.presetColor}.png`}
                alt="Mantis Figma Dashboard"
                sx={{ zIndex: 2 }}
              />
            </Box>
          </Stack>
        </Stack>
      </Container>
      <Box
        sx={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '240px',
          background: `linear-gradient(to top, ${theme.palette.secondary.dark} 24%, ${theme.palette.secondary.dark} 0%,transparent 100%)`
        }}
      />
    </Box>
  );
}
