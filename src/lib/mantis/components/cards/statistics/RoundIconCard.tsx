// material-ui
import Avatar from '@mui/material/Avatar';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

// project imports
import MainCard from 'components/MainCard';

// types
import { GenericCardProps } from 'types/root';

// ============================|| ROUND ICON CARD ||============================ //

interface Props {
  primary: string;
  secondary: string;
  content: string;
  iconPrimary: GenericCardProps['iconPrimary'];
  color: string;
  bgcolor: string;
}

export default function RoundIconCard({ primary, secondary, content, iconPrimary, color, bgcolor }: Props) {
  const IconPrimary = iconPrimary!;
  const primaryIcon = iconPrimary ? <IconPrimary fontSize="large" /> : null;

  return (
    <MainCard>
      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
        <Stack sx={{ gap: 1 }}>
          <Typography variant="h5" color="inherit">
            {primary}
          </Typography>
          <Typography variant="h3">{secondary}</Typography>
          <Typography variant="subtitle2" color="secondary">
            {content}
          </Typography>
        </Stack>
        <Avatar variant="rounded" sx={{ bgcolor, color, '& .MuiSvgIcon-root': { fontSize: '1.5rem' } }}>
          {primaryIcon}
        </Avatar>
      </Stack>
    </MainCard>
  );
}
