'use client';

// material-ui
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Box from '@mui/material/Box';

// project imports
import MainCard from 'components/MainCard';

// third-party
import { List, RowComponentProps } from 'react-window';

// ==============================|| SCROLLABLE - ITEMS ||============================== //

function RowComponent({ index, style }: RowComponentProps) {
  return (
    <ListItem sx={style} key={index} disablePadding divider>
      <ListItemButton>
        <ListItemText primary={`Item ${index + 1}`} />
      </ListItemButton>
    </ListItem>
  );
}

// ==============================|| LIST - SCROLLABLE ||============================== //

export default function ScrollableList() {
  return (
    <MainCard content={false}>
      <Box sx={{ width: '100%', height: 400, bgcolor: 'background.paper' }}>
        <List rowComponent={RowComponent} rowProps={{ style: {} }} style={{ height: 400, width: '100%' }} rowCount={200} rowHeight={46} />
      </Box>
    </MainCard>
  );
}
