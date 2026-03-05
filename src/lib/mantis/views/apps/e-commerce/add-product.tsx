'use client';

import { useState } from 'react';

// next
import { useRouter } from 'next/navigation';

// material-ui
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

// project imports
import MainCard from 'components/MainCard';

// assets
import UploadOutlined from '@ant-design/icons/UploadOutlined';

// ==============================|| ADD NEW PRODUCT - MAIN ||============================== //

export default function AddNewProduct() {
  const router = useRouter();
  const prices = [
    {
      value: '1',
      label: '$ 100'
    },
    {
      value: '2',
      label: '$ 200'
    },
    {
      value: '3',
      label: '$ 300'
    },
    {
      value: '4',
      label: '$ 400'
    }
  ];

  const quantities = [
    {
      value: 'one',
      label: '1'
    },
    {
      value: 'two',
      label: '2'
    },
    {
      value: 'three',
      label: '3'
    }
  ];

  const statuss = [
    {
      value: 'in stock',
      label: 'In Stock'
    },
    {
      value: 'out of stock',
      label: 'Out of Stock'
    }
  ];

  const [quantity, setQuantity] = useState('one');
  const [price, setPrice] = useState('1');
  const [status, setStatus] = useState('in stock');

  const handlePrice = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPrice(event.target.value);
  };

  const handleQuantity = (event: React.ChangeEvent<HTMLInputElement>) => {
    setQuantity(event.target.value);
  };

  const handleStatus = (event: React.ChangeEvent<HTMLInputElement>) => {
    setStatus(event.target.value);
  };

  const handleCancel = () => {
    router.push(`/apps/e-commerce/products-list`);
  };

  return (
    <MainCard>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <MainCard>
            <Stack sx={{ gap: 2 }}>
              <Stack sx={{ gap: 1 }}>
                <InputLabel>Product Name</InputLabel>
                <TextField placeholder="Enter product name" fullWidth />
              </Stack>
              <Stack sx={{ gap: 1 }}>
                <InputLabel>Product Description</InputLabel>
                <TextField placeholder="Enter product description" fullWidth multiline rows={3} />
              </Stack>
              <Stack sx={{ gap: 1 }}>
                <InputLabel>Category</InputLabel>
                <TextField placeholder="Enter your category" fullWidth />
              </Stack>
              <Stack sx={{ gap: 1 }}>
                <InputLabel>Price</InputLabel>
                <TextField placeholder="Select Price" fullWidth select value={price} onChange={handlePrice}>
                  {prices.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Stack>
            </Stack>
          </MainCard>
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <MainCard>
            <Stack sx={{ gap: 2 }}>
              <Stack sx={{ gap: 1 }}>
                <InputLabel>Qty</InputLabel>
                <TextField placeholder="Select quantity" fullWidth select value={quantity} onChange={handleQuantity}>
                  {quantities.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Stack>
              <Stack sx={{ gap: 1 }}>
                <InputLabel>Status</InputLabel>
                <TextField placeholder="Select status" fullWidth select value={status} onChange={handleStatus}>
                  {statuss.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Stack>
              <Stack sx={{ gap: 1, alignItems: 'flex-start' }}>
                <Typography color="error.main">
                  *{' '}
                  <Typography component="span" color="text.secondary">
                    Recommended resolution is 640*640 with file size
                  </Typography>
                </Typography>
                <Button variant="outlined" color="secondary" startIcon={<UploadOutlined />} sx={{ textTransform: 'none' }}>
                  Click to Upload
                </Button>
              </Stack>

              <Stack direction="row" sx={{ gap: 2, alignItems: 'center', justifyContent: 'right', mt: 11 }}>
                <Button variant="outlined" color="secondary" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button variant="contained" sx={{ textTransform: 'none' }}>
                  Add new Product
                </Button>
              </Stack>
            </Stack>
          </MainCard>
        </Grid>
      </Grid>
    </MainCard>
  );
}
