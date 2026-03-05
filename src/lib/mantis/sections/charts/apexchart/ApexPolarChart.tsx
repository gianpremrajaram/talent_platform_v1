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
const polarChartOptions: ApexOptions = {
  chart: {
    width: 450,
    height: 450,
    type: 'polarArea',
    background: 'transparent'
  },
  fill: { opacity: 1 },
  legend: {
    show: true,
    offsetX: 10,
    offsetY: 10,
    labels: { useSeriesColors: false },
    markers: { size: 6, shape: 'circle', strokeWidth: 0 },
    itemMargin: { horizontal: 25, vertical: 4 }
  },
  responsive: [
    {
      breakpoint: 450,
      options: { chart: { width: 280, height: 280 }, legend: { show: false } }
    }
  ]
};

// ==============================|| APEXCHART - POLAR ||============================== //

export default function ApexPolarChart() {
  const theme = useTheme();
  const { colorScheme } = useColorScheme();
  const {
    state: { fontFamily }
  } = useConfig();

  const line = theme.vars.palette.divider;
  const textPrimary = theme.vars.palette.text.primary;
  const backColor = theme.vars.palette.background.paper;

  const [series] = useState<number[]>([13.5, 18, 11, 5, 10]);
  const [options, setOptions] = useState(polarChartOptions);

  const primary400 = theme.vars.palette.primary[400];
  const primaryMain = theme.vars.palette.primary.main;
  const successMain = theme.vars.palette.success.main;
  const errorMain = theme.vars.palette.error.main;
  const warningMain = theme.vars.palette.warning.main;

  useEffect(() => {
    setOptions({
      ...polarChartOptions,
      chart: { ...polarChartOptions.chart, fontFamily: fontFamily },
      colors: [errorMain, primaryMain, warningMain, successMain, primary400],
      yaxis: { labels: { style: { colors: textPrimary } } },
      grid: { borderColor: line },
      legend: { ...polarChartOptions.legend, labels: { ...polarChartOptions.legend?.labels, colors: textPrimary } },
      stroke: { colors: [backColor] },
      plotOptions: { polarArea: { rings: { strokeColor: line }, spokes: { connectorColors: line } } },
      theme: { mode: colorScheme === ThemeMode.DARK ? 'dark' : 'light' }
    });
  }, [colorScheme, fontFamily, textPrimary, line, backColor, primary400, primaryMain, successMain, errorMain, warningMain]);

  return <ReactApexChart options={options} series={series} type="polarArea" />;
}
