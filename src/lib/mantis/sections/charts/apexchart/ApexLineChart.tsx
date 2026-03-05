'use client';

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
const lineChartOptions: ApexOptions = {
  chart: {
    height: 350,
    type: 'line',
    zoom: { enabled: false },
    background: 'transparent'
  },
  dataLabels: { enabled: false },
  stroke: { curve: 'straight' },
  xaxis: { categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'] }
};

// ==============================|| APEXCHART - LINE ||============================== //

export default function ApexLineChart() {
  const theme = useTheme();
  const { colorScheme } = useColorScheme();
  const {
    state: { fontFamily }
  } = useConfig();

  const line = theme.vars.palette.divider;
  const textPrimary = theme.vars.palette.text.primary;
  const primary700 = theme.vars.palette.primary[700];

  const [series] = useState([
    {
      name: 'Desktops',
      data: [10, 41, 35, 51, 49, 62, 69, 91, 148]
    }
  ]);

  const [options, setOptions] = useState(lineChartOptions);

  useEffect(() => {
    setOptions({
      ...lineChartOptions,
      chart: { ...lineChartOptions.chart, fontFamily: fontFamily },
      colors: [primary700],
      xaxis: { ...lineChartOptions.xaxis, labels: { style: { colors: textPrimary } } },
      yaxis: { labels: { style: { colors: textPrimary } } },
      grid: { borderColor: line },
      theme: { mode: colorScheme === ThemeMode.DARK ? 'dark' : 'light' }
    });
  }, [colorScheme, fontFamily, textPrimary, line, primary700]);

  return <ReactApexChart options={options} series={series} type="line" height={350} />;
}
