'use client';

import { useState, useEffect } from 'react';

// material-ui
import { useColorScheme, useTheme } from '@mui/material/styles';

// third-party
import { Feature, FeatureCollection, Point } from 'geojson';
import { RMap, RSource, RLayer } from 'maplibre-react-components';

// project imports
import { withAlpha } from 'utils/colorUtils';

type EarthquakeFeature = Feature<Point, { time: number; mag: number; [key: string]: any }>;

type EarthquakeFeatureCollection = FeatureCollection<Point, EarthquakeFeature['properties']>;

// ==============================|| HEAT MAP ||============================== //

export default function Heatmap() {
  const theme = useTheme();
  const { colorScheme } = useColorScheme();

  const scheme = colorScheme ?? 'light';
  const schemeTheme = theme.colorSchemes?.[scheme];

  const currentPalette = schemeTheme ? schemeTheme.palette : theme.palette;

  const level1: string = scheme === 'dark' ? currentPalette.primary.dark : currentPalette.primary.light;
  const level2: string = scheme === 'dark' ? currentPalette.primary.darker : currentPalette.primary.lighter;
  const level3: string = scheme === 'dark' ? currentPalette.error.dark : currentPalette.error.light;
  const level4: string = scheme === 'dark' ? currentPalette.warning.dark : currentPalette.warning.light;
  const backColor: string = scheme === 'dark' ? currentPalette.secondary.dark : currentPalette.secondary.light;

  const [earthquakes, setEarthquakes] = useState<EarthquakeFeatureCollection | null>(null);

  useEffect(() => {
    fetch('https://maplibre.org/maplibre-gl-js/docs/assets/earthquakes.geojson')
      .then((resp) => resp.json())
      .then((json: EarthquakeFeatureCollection) => {
        const validFeatures = json.features.filter(
          (f) => f.properties && typeof f.properties.time === 'number' && typeof f.properties.mag === 'number'
        );

        setEarthquakes({
          type: 'FeatureCollection',
          features: validFeatures
        });
      })
      .catch((e) => console.error('Failed to load data', e));
  }, []);

  return (
    <RMap initialZoom={3} initialCenter={[-110, 30]} mapStyle="https://tiles.openfreemap.org/styles/bright">
      {earthquakes && <RSource id="earthquakes" type="geojson" data={earthquakes} />}
      {earthquakes && (
        <RLayer
          id="earthquakes-heat"
          type="heatmap"
          source="earthquakes"
          paint={{
            'heatmap-weight': ['interpolate', ['linear'], ['get', 'mag'], 0, 0, 6, 1],
            'heatmap-intensity': ['interpolate', ['linear'], ['zoom'], 0, 1, 9, 3],
            'heatmap-color': [
              'interpolate',
              ['linear'],
              ['heatmap-density'],
              0,
              withAlpha(backColor, 0),
              0.2,
              level1,
              0.4,
              level2,
              0.6,
              level3,
              0.8,
              currentPalette.error.main,
              0.9,
              level4
            ],
            'heatmap-radius': ['interpolate', ['linear'], ['zoom'], 0, 2, 9, 20],
            'heatmap-opacity': ['interpolate', ['linear'], ['zoom'], 7, 1, 9, 0]
          }}
        />
      )}
    </RMap>
  );
}
