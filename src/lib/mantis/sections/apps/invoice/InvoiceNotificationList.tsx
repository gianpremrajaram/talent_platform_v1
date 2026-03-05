'use client';

import { useState } from 'react';

// next
import NextLink from 'next/link';

// material-ui
import { useTheme } from '@mui/material/styles';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Link from '@mui/material/Link';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

// project imports
import MainCard from 'components/MainCard';
import Avatar from 'components/@extended/Avatar';

// assets
import DownloadOutlined from '@ant-design/icons/DownloadOutlined';
import FileTextOutlined from '@ant-design/icons/FileTextOutlined';
import LinkOutlined from '@ant-design/icons/LinkOutlined';
import MoreOutlined from '@ant-design/icons/MoreOutlined';
import SettingOutlined from '@ant-design/icons/SettingOutlined';

// types
import { ColorProps } from 'types/extended';

interface NotificationItem {
  id: number;
  message: string;
  secondary: string;
  avatar: { alt: string; color?: ColorProps; icon?: React.ReactNode; text?: string };
  link?: { label: string; to: string };
}

const notifications: NotificationItem[] = [
  {
    id: 1,
    avatar: { alt: 'User 1', color: 'success', icon: <DownloadOutlined /> },
    message: 'Johnny sent you an invoice billed',
    link: { label: '$1,000.', to: '#' },
    secondary: '2 August'
  },
  {
    id: 2,
    avatar: { alt: 'User 2', icon: <FileTextOutlined /> },
    message: 'Sent an invoice to Aida Bugg amount of',
    link: { label: '$200.', to: '#' },
    secondary: '7 hours ago'
  },
  {
    id: 3,
    avatar: { alt: 'User 3', color: 'error', icon: <SettingOutlined /> },
    message: 'There was a failure to your setup',
    secondary: '7 hours ago'
  },
  {
    id: 4,
    avatar: { alt: 'User 4', text: 'C' },
    message: 'Cristina Danny invited you to join Meeting',
    secondary: '7 hours ago'
  },
  {
    id: 5,
    avatar: { alt: 'User 5', text: 'C' },
    message: 'Cristina Danny invited you to join Meeting',
    secondary: '7 hours ago'
  }
];

// ==============================|| INVOICE - NOTIFICATION LIST ||============================== //

export default function InvoiceNotificationList() {
  const theme = useTheme();
  const iconSX = { fontSize: '1rem', color: theme.vars.palette.text.secondary };
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const openMenu = Boolean(anchorEl);

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <MainCard
      content={false}
      title="Notification"
      secondary={
        <>
          <IconButton edge="end" aria-label="comments" color="secondary" onClick={handleMenuClick}>
            <MoreOutlined style={{ fontSize: '1.15rem' }} />
          </IconButton>
          <Menu
            id="fade-menu"
            slotProps={{ list: { 'aria-labelledby': 'fade-button' } }}
            anchorEl={anchorEl}
            open={openMenu}
            onClose={handleMenuClose}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          >
            <MenuItem>Mark all as Read</MenuItem>
          </Menu>
        </>
      }
    >
      <List disablePadding>
        {notifications.map((item, index) => (
          <Box key={item.id}>
            <ListItem component={ListItemButton} key={item.id} sx={{ px: 2.5, py: 1.5 }} secondaryAction={<LinkOutlined style={iconSX} />}>
              <ListItemAvatar>
                <Avatar {...item.avatar} sx={{ fontSize: '1.25rem' }}>
                  {item.avatar.icon || item.avatar.text}
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Typography variant="subtitle1">
                    {item.message}{' '}
                    {item.link && (
                      <Link component={NextLink} href={item.link.to} underline="hover">
                        {item.link.label}
                      </Link>
                    )}
                  </Typography>
                }
                secondary={
                  <Typography variant="caption" color="secondary">
                    {item.secondary}
                  </Typography>
                }
                sx={{ mr: 3 }}
              />
            </ListItem>
            {index < notifications.length - 1 && <Divider />}
          </Box>
        ))}
        <ListItem>
          <Button fullWidth variant="outlined" color="secondary">
            View All
          </Button>
        </ListItem>
      </List>
    </MainCard>
  );
}
