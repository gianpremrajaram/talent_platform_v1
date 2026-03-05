// material-ui
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import Stack from '@mui/material/Stack';

// project imports
import MainCard from 'components/MainCard';

// ==============================|| BUTTON GROUPS ||============================== //

export default function ButtonGroups() {
  const buttons = [<Button key="one">One</Button>, <Button key="two">Two</Button>, <Button key="three">Three</Button>];

  return (
    <MainCard title="Button Group">
      <Stack sx={{ gap: 2 }}>
        <ButtonGroup disableElevation variant="contained" aria-label="outlined primary button group">
          {buttons}
        </ButtonGroup>
        <ButtonGroup variant="outlined" aria-label="outlined button group">
          {buttons}
        </ButtonGroup>
        <ButtonGroup variant="text" aria-label="text button group">
          {buttons}
        </ButtonGroup>
        <ButtonGroup color="warning" aria-label="medium secondary button group">
          {buttons}
        </ButtonGroup>
        <ButtonGroup orientation="vertical" aria-label="vertical outlined button group" sx={{ width: 'fit-content' }}>
          {buttons}
        </ButtonGroup>
      </Stack>
    </MainCard>
  );
}
