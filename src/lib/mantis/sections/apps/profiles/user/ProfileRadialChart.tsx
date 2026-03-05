import { useEffect, useState } from 'react';

// material-ui
import { useColorScheme, useTheme } from '@mui/material/styles';

// third-party
import { ApexOptions } from 'apexcharts';
import ReactApexChart from 'react-apexcharts';

// project imports
import { ThemeMode } from 'config';
import useConfig from 'hooks/useConfig';

// chart options
const redialBarChartOptions: ApexOptions = {
  chart: { background: 'transparent' },
  plotOptions: {
    radialBar: {
      hollow: { margin: 0, size: '75%' },
      track: { margin: 0 },
      dataLabels: { name: { show: false }, value: { fontSize: '1rem', fontWeight: 600, offsetY: 5 } }
    }
  },
  labels: ['Vimeo']
};

// ==============================|| TOP CARD - RADIAL BAR CHART ||============================== //

export default function ProfileRadialChart() {
  const theme = useTheme();
  const { colorScheme } = useColorScheme();
  const {
    state: { fontFamily }
  } = useConfig();

  const [series] = useState<number[]>([30]);
  const [options, setOptions] = useState(redialBarChartOptions);

  const textPrimary = theme.vars.palette.text.primary;
  const primaryMain = theme.vars.palette.primary.main;
  const trackColor = colorScheme === ThemeMode.DARK ? theme.vars.palette.grey[200] : theme.vars.palette.grey[0];

  useEffect(() => {
    setOptions({
      ...redialBarChartOptions,
      chart: { ...redialBarChartOptions.chart, fontFamily: fontFamily },
      colors: [primaryMain],
      plotOptions: {
        ...redialBarChartOptions.plotOptions,
        radialBar: {
          ...redialBarChartOptions.plotOptions?.radialBar,
          track: { background: trackColor },
          dataLabels: {
            ...redialBarChartOptions.plotOptions?.radialBar?.dataLabels,
            value: { ...redialBarChartOptions.plotOptions?.radialBar?.dataLabels?.value, color: textPrimary }
          }
        }
      },
      theme: { mode: colorScheme === ThemeMode.DARK ? 'dark' : 'light' }
    });
  }, [colorScheme, fontFamily, primaryMain, textPrimary, trackColor]);

  return <ReactApexChart options={options} series={series} type="radialBar" width={112} height={112} />;
}
