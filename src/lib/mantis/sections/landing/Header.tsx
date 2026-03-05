'use client';

// next
import NextLink from 'next/link';

// material-ui
import { useTheme } from '@mui/material/styles';
import Button from '@mui/material/Button';
import CardMedia from '@mui/material/CardMedia';
import Chip from '@mui/material/Chip';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

// third-party
import { motion } from 'framer-motion';

// project imports
import AnimateButton from 'components/@extended/AnimateButton';
import { withAlpha } from 'utils/colorUtils';

// assets
import EyeOutlined from '@ant-design/icons/EyeOutlined';
const headertechimg = '/assets/images/landing/img-headertech.svg';

// ==============================|| LANDING - HEADER PAGE ||============================== //

export default function HeaderPage() {
  const theme = useTheme();

  return (
    <Container sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center' }}>
      <Grid
        container
        spacing={2}
        sx={{ alignItems: 'center', justifyContent: 'space-between', pt: { md: 0, xs: 8 }, pb: { md: 0, xs: 5 } }}
      >
        <Grid size={{ xs: 12, lg: 5, md: 6 }}>
          <Grid
            container
            spacing={2}
            sx={(theme) => ({
              pr: { xs: 0, md: 10 },
              [theme.breakpoints.down('md')]: { textAlign: 'center', justifyContent: 'center', alignItems: 'center' }
            })}
          >
            <Grid size={12}>
              <Chip
                label={`✨ ${process.env.NEXT_PUBLIC_VERSION} Released`}
                variant="combined"
                size="large"
                sx={{
                  bgcolor: withAlpha(theme.vars.palette.secondary.A200!, 0.5),
                  borderColor: withAlpha(theme.vars.palette.secondary[600]!, 0.5),
                  color: 'secondary.light'
                }}
              />
            </Grid>
            <Grid size={12}>
              <motion.div
                initial={{ opacity: 0, translateY: 550 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ type: 'spring', stiffness: 150, damping: 30 }}
              >
                <Typography
                  variant="h1"
                  color="white"
                  sx={{
                    fontSize: { xs: '1.825rem', sm: '2rem', md: '2.5rem' },
                    fontWeight: 700,
                    lineHeight: { xs: 1.3, sm: 1.3, md: 1.3 }
                  }}
                >
                  <span>Carefully Crafted for your </span>
                  <Box component="span" sx={{ color: 'primary.main' }}>
                    <span>Caring React </span>
                  </Box>
                  <span>Project</span>
                </Typography>
              </motion.div>
            </Grid>
            <Grid size={12}>
              <motion.div
                initial={{ opacity: 0, translateY: 550 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ type: 'spring', stiffness: 150, damping: 30, delay: 0.2 }}
              >
                <Typography
                  variant="h6"
                  color={theme.vars.palette.secondary.light}
                  sx={{ fontSize: { xs: '0.875rem', md: '1rem' }, fontWeight: 400, lineHeight: { xs: 1.4, md: 1.4 } }}
                >
                  Mantis React is a blazing-fast dashboard template built using the MUI React library.
                </Typography>
              </motion.div>
            </Grid>
            <Grid sx={{ my: 3.25 }} size={12}>
              <motion.div
                initial={{ opacity: 0, translateY: 550 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ type: 'spring', stiffness: 150, damping: 30, delay: 0.4 }}
              >
                <Grid container spacing={2} sx={{ justifyContent: { xs: 'center', md: 'flex-start' } }}>
                  <Grid>
                    <AnimateButton>
                      <Button
                        component={NextLink}
                        href="https://github.com/codedthemes/mantis-free-react-admin-template"
                        target="_blank"
                        size="large"
                        color="primary"
                        variant="outlined"
                      >
                        Get Free Version
                      </Button>
                    </AnimateButton>
                  </Grid>
                  <Grid>
                    <AnimateButton>
                      <Button
                        component={NextLink}
                        href="/login"
                        target="_blank"
                        size="large"
                        color="primary"
                        variant="contained"
                        startIcon={<EyeOutlined style={{ fontSize: '1.15rem' }} />}
                      >
                        Live Preview
                      </Button>
                    </AnimateButton>
                  </Grid>
                </Grid>
              </motion.div>
            </Grid>
            <Grid size={{ xs: 'auto', md: 12 }}>
              <motion.div
                initial={{ opacity: 0, translateY: 550 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ type: 'spring', stiffness: 150, damping: 30, delay: 0.6 }}
              >
                <CardMedia component="img" sx={{ width: 'auto' }} src={headertechimg} alt="Mantis" style={{ zIndex: 9 }} />
              </motion.div>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Container>
  );
}
