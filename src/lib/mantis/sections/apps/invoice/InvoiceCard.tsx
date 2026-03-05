// material-ui
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

// project imports
import MainCard from 'components/MainCard';
import Avatar from 'components/@extended/Avatar';

// assets
import CloseCircleFilled from '@ant-design/icons/CloseCircleFilled';
import DollarCircleFilled from '@ant-design/icons/DollarCircleFilled';
import FileTextFilled from '@ant-design/icons/FileTextFilled';
import HourglassFilled from '@ant-design/icons/HourglassFilled';
import ReconciliationFilled from '@ant-design/icons/ReconciliationFilled';
import ShoppingFilled from '@ant-design/icons/ShoppingFilled';

// types
import { ColorProps } from 'types/extended';

interface InvoiceItem {
  label: string;
  icon: React.ReactNode;
  color?: ColorProps;
}

const invoiceItems: InvoiceItem[] = [
  { label: 'All Invoices', icon: <FileTextFilled /> },
  { label: 'Reports', icon: <ReconciliationFilled />, color: 'info' },
  { label: 'Paid', icon: <DollarCircleFilled />, color: 'success' },
  { label: 'Pending', icon: <HourglassFilled />, color: 'warning' },
  { label: 'Cancelled', icon: <CloseCircleFilled />, color: 'error' },
  { label: 'Draft', icon: <ShoppingFilled /> }
];

// ==============================|| INVOICE - ICONS ||============================== //

export default function InvoiceCard() {
  return (
    <MainCard sx={{ height: 1 }}>
      <Grid container spacing={3}>
        {invoiceItems.map((item, index) => (
          <Grid key={index} size={{ xs: 4, sm: 2, lg: 6 }}>
            <MainCard sx={{ py: 2.5, cursor: 'pointer', '&:hover': { boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.05)' } }} content={false}>
              <Stack sx={{ gap: 2, alignItems: 'center' }}>
                <Avatar size="md" type="filled" color={item.color}>
                  {item.icon}
                </Avatar>
                <Typography variant="subtitle1" color="secondary" sx={{ textAlign: 'center' }}>
                  {item.label}
                </Typography>
              </Stack>
            </MainCard>
          </Grid>
        ))}
      </Grid>
    </MainCard>
  );
}
