// third-party
import { ReactCompareSlider, ReactCompareSliderImage, ReactCompareSliderHandle } from 'react-compare-slider';

// material-ui
import { useTheme } from '@mui/material/styles';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';

// project imports
import { withAlpha } from 'utils/colorUtils';
import useConfig from 'hooks/useConfig';

// ==============================|| LANDING - BROWSER  PAGE ||============================== //

export default function BrowserBlockPage() {
  const theme = useTheme();
  const { state } = useConfig();

  return (
    <Container maxWidth="lg">
      <Box
        sx={(theme) => ({
          my: '5%',
          position: 'relative',
          '& .ReactCompareSlider': {
            direction: theme.direction,
            overflow: 'visible !important',
            '& [data-rcs="handle-container"]': { height: '110% !important', top: '-5% !important' }
          }
        })}
      >
        <ReactCompareSlider
          className="ReactCompareSlider"
          handle={
            <ReactCompareSliderHandle
              buttonStyle={{
                backdropFilter: undefined,
                background: withAlpha(theme.vars.palette.background.paper, 0.6),
                border: 0,
                color: theme.vars.palette.text.primary,
                width: 40,
                height: 40
              }}
              linesStyle={{ color: theme.vars.palette.primary.main, width: 4 }}
            />
          }
          itemOne={<ReactCompareSliderImage src={`/assets/images/landing/${state.presetColor}-dark.png`} alt="Dark Dashboard" />}
          itemTwo={<ReactCompareSliderImage src={`/assets/images/landing/${state.presetColor}-light.png`} alt="Light Dashboard" />}
        />
      </Box>
    </Container>
  );
}
