'use client';

// material-ui
import { useColorScheme, useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import Avatar from '@mui/material/Avatar';
import AvatarGroup from '@mui/material/AvatarGroup';
import Button from '@mui/material/Button';
import InputAdornment from '@mui/material/InputAdornment';
import Link from '@mui/material/Link';
import OutlinedInput from '@mui/material/OutlinedInput';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

// project imports
import { ThemeMode } from 'config';
import { withAlpha } from 'utils/colorUtils';

// assets
import DiscordFilled from '@ant-design/icons/DiscordFilled';
import FacebookFilled from '@ant-design/icons/FacebookFilled';
import InstagramFilled from '@ant-design/icons/InstagramFilled';
import XOutlined from '@ant-design/icons/XOutlined';

const avatar5 = '/assets/images/users/avatar-5.png';
const avatar6 = '/assets/images/users/avatar-6.png';
const avatar7 = '/assets/images/users/avatar-7.png';
const avatar8 = '/assets/images/users/avatar-8.png';
const avatar9 = '/assets/images/users/avatar-9.png';
const avatar10 = '/assets/images/users/avatar-10.png';

const socialIcons = [
  { icon: FacebookFilled, link: 'https://www.facebook.com/codedthemes/' },
  { icon: InstagramFilled, link: 'https://www.instagram.com/codedthemes' },
  { icon: XOutlined, link: 'https://x.com/codedthemes/' },
  { icon: DiscordFilled, link: 'https://dribbble.com/codedthemes' }
];

// ==============================|| JOIN WAITLIST - MAIN ||============================== //

export default function JoinWaitList() {
  const theme = useTheme();
  const downSm = useMediaQuery((theme) => theme.breakpoints.down('sm'));
  const { colorScheme } = useColorScheme();

  const isDark = colorScheme === ThemeMode.DARK;

  const iconButtonSx = {
    fontSize: { xs: 22, sm: 25 },
    color: 'secondary.main',
    opacity: 0.6,
    '&:hover': { color: 'secondary.darker', opacity: 1 }
  };

  const background = `radial-gradient(${downSm ? 'circle' : 'ellipse'} at center, ${withAlpha(
    theme.vars.palette.primary[isDark ? 400 : 200]!,
    0.7
  )} 20%, ${withAlpha(theme.vars.palette.background.default, 0.4)} 70%, ${theme.vars.palette.background.default} 100%)`;

  return (
    <Stack
      sx={{ position: 'relative', minHeight: '100vh', overflow: 'hidden', background, alignItems: 'center', justifyContent: 'center' }}
    >
      <Stack
        sx={{
          gap: 10,
          alignItems: 'center',
          justifyContent: 'center',
          top: { xs: -60, sm: -80, md: -95 },
          zIndex: 1,
          position: 'relative'
        }}
      >
        <Stack sx={{ gap: { xs: 4, sm: 5 }, m: { xs: 2.5, sm: 3 }, alignItems: 'center', justifyContent: 'center' }}>
          <Stack sx={{ gap: { xs: 1.5, sm: 2.5 }, alignItems: 'center', justifyContent: 'center' }}>
            <Typography sx={{ fontSize: { xs: 30, sm: 45, md: 50, lg: 54 }, fontWeight: 700, textAlign: 'center', lineHeight: 1.2 }}>
              Join Our Waiting List
            </Typography>
            <Typography align="center" sx={{ fontSize: { xs: 16, sm: 18, lg: 20 }, maxWidth: 508, color: 'text.secondary' }}>
              We’re going to be here soon, stay tuned and get regular updates!
            </Typography>
          </Stack>

          <OutlinedInput
            type="email"
            placeholder="Enter your email"
            fullWidth
            sx={{
              maxWidth: { xs: 320, sm: 390 },
              pr: 0,
              '.MuiOutlinedInput-notchedOutline': { borderColor: withAlpha(theme.vars.palette.primary.darker, 0.4) },
              '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: withAlpha(theme.vars.palette.primary.dark, 0.9) },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: theme.vars.palette.primary.main }
            }}
            endAdornment={
              <InputAdornment position="end" sx={{ ml: 0 }}>
                <Button variant="contained" sx={{ height: 41, borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}>
                  Get Notified
                </Button>
              </InputAdornment>
            }
          />

          <Stack sx={{ gap: 1.25, justifyContent: 'center' }}>
            <AvatarGroup max={6}>
              {[avatar5, avatar6, avatar7, avatar8, avatar9, avatar10].map((src, idx) => (
                <Avatar key={idx} src={src} alt={`User ${idx + 1}`} />
              ))}
            </AvatarGroup>
            <Typography color="text.secondary" sx={{ textAlign: 'center' }}>
              Join a waitlist of 2000+ members!
            </Typography>
          </Stack>
        </Stack>
      </Stack>

      <Stack
        sx={{
          position: 'absolute',
          bottom: { xl: '-750px', lg: '-754px', md: '-770px', sm: '-570px', xs: '-250px' },
          left: '50%',
          transform: 'translateX(-50%)',
          width: '120vw',
          height: '100vw',
          maxHeight: '1000px',
          opacity: isDark ? 0.7 : 1,
          bgcolor: 'background.default',
          borderRadius: '50%',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 0,
          '&::before': {
            content: '""',
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            padding: '2px',
            background: `linear-gradient(to right,${theme.vars.palette.background.default} 0%, ${theme.vars.palette.background.default} 15%, ${isDark ? theme.vars.palette.grey[900] : theme.vars.palette.primary.main} 50%, ${theme.vars.palette.background.default} 85%, ${theme.vars.palette.background.default} 100%)`,
            mask: `linear-gradient(${theme.vars.palette.grey[900]} 0 0) content-box, linear-gradient(${theme.vars.palette.grey[900]} 0 0)`,
            maskComposite: 'exclude'
          }
        }}
      >
        <Stack
          direction="row"
          sx={{
            gap: { xs: 2.5, sm: 3.5 },
            position: 'relative',
            top: { lg: '-300px', md: '-320px', sm: '-235px', xs: '-100px' }
          }}
        >
          {socialIcons.map(({ icon: Icon, link }, idx) => (
            <Link key={idx} href={link} underline="none" target="_blank" sx={iconButtonSx}>
              <Icon />
            </Link>
          ))}
        </Stack>
      </Stack>
    </Stack>
  );
}
