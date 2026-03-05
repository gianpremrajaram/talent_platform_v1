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
const mixedChartOptions: ApexOptions = {
  chart: {
    type: 'line',
    stacked: false,
    height: 450,
    background: 'transparent'
  },
  dataLabels: { enabled: false },
  stroke: { width: [1, 1, 4] },
  xaxis: { categories: [2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016] },
  legend: {
    show: true,
    position: 'bottom',
    offsetX: 10,
    offsetY: 10,
    labels: { useSeriesColors: false },
    markers: { size: 6, shape: 'circle', strokeWidth: 0 },
    itemMargin: { horizontal: 12, vertical: 8 }
  }
};

// ==============================|| APEXCHART - MIXED ||============================== //

export default function ApexMixedChart() {
  const theme = useTheme();
  const { colorScheme } = useColorScheme();
  const {
    state: { fontFamily }
  } = useConfig();

  const line = theme.vars.palette.divider;
  const textPrimary = theme.vars.palette.text.primary;

  const primary700 = theme.vars.palette.primary[700];
  const primaryMain = theme.vars.palette.primary.main;
  const successMain = theme.vars.palette.success.main;

  const [series] = useState([
    { name: 'Income', type: 'column', data: [14, 2, 25, 15, 25, 28, 38, 46] },
    { name: 'Cashflow', type: 'column', data: [11, 3, 31, 4, 41, 49, 65, 85] },
    { name: 'Revenue', type: 'line', data: [20, 29, 37, 36, 44, 45, 55, 86] }
  ]);

  const [options, setOptions] = useState(mixedChartOptions);

  useEffect(() => {
    setOptions({
      ...mixedChartOptions,
      chart: { ...mixedChartOptions.chart, fontFamily: fontFamily },
      colors: [primary700, primaryMain, successMain],
      xaxis: { ...mixedChartOptions.xaxis, labels: { style: { colors: textPrimary } } },
      yaxis: { labels: { style: { colors: textPrimary } } },
      grid: { borderColor: line },
      legend: { ...mixedChartOptions.legend, labels: { ...mixedChartOptions.legend?.labels, colors: textPrimary } },
      theme: { mode: colorScheme === ThemeMode.DARK ? 'dark' : 'light' }
    });
  }, [colorScheme, fontFamily, textPrimary, line, primary700, primaryMain, successMain]);

  return <ReactApexChart options={options} series={series} type="line" />;
}
