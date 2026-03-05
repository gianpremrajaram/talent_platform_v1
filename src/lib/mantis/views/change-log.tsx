'use client';

import { Fragment, useEffect, useState, useTransition } from 'react';

// material-ui
import CardMedia from '@mui/material/CardMedia';
import Chip from '@mui/material/Chip';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

// project imports
import axiosServices from 'utils/axios';
import Loader from 'components/Loader';
import SectionTypeset from 'components/pages/SectionTypeset';

interface ChangeLogItem {
  version: string;
  date: string;
  title?: string;
  description?: string;
  features?: (string | Record<string, any[]>)[];
  banner?: string;
  conclusion?: string;
}

const commonTypo = { fontWeight: 400, fontSize: 16 };
const commonTtitleTypo = { color: 'text.secondary', fontSize: { xs: 16, md: 24 }, fontWeight: 600 };
const blockGap = { gap: { xs: 1.25, md: 2.5 } };

// ==============================|| CHANGE LOG - ITEM CARD ||============================== //

function ChangeLogItemCard({ version, date, title, description, features, banner, conclusion }: ChangeLogItem) {
  // helper function to get list style by level
  const getListStyleType = (level: number): React.CSSProperties['listStyleType'] => {
    const styles = ['disc', 'circle', 'square'];
    // cycle through the styles based on level
    return styles[(level - 1) % styles.length];
  };

  // Recursive render function
  const renderFeatures = (items: any[], level = 1) => (
    <List
      sx={{
        pl: 3,
        py: 0,
        listStyleType: getListStyleType(level),
        '& li': { display: 'list-item', '&::marker': { fontSize: `${1}rem` } }
      }}
    >
      {items.map((item, idx) => {
        // 1. String → render directly
        if (typeof item === 'string') {
          return (
            <ListItem key={idx} sx={{ display: 'list-item' }} disablePadding>
              <ListItemText primary={item} slotProps={{ primary: { sx: commonTypo } }} />
            </ListItem>
          );
        }

        // 2. Object → render key as parent, value recursively
        if (typeof item === 'object' && item !== null) {
          const [key, value] = Object.entries(item)[0];
          return (
            <ListItem key={idx} sx={{ display: 'list-item' }} disablePadding>
              <ListItemText primary={key} slotProps={{ primary: { sx: commonTypo } }} />
              {Array.isArray(value) && renderFeatures(value, level + 1)}
            </ListItem>
          );
        }

        return null;
      })}
    </List>
  );

  return (
    <Grid container spacing={{ xs: 3, md: 5 }}>
      <Grid size={{ xs: 12, sm: 3, md: 2 }}>
        <Stack sx={{ alignItems: 'center', gap: 1.25 }}>
          <Typography sx={commonTypo}>{date}</Typography>
          <Chip label={version} sx={{ fontSize: { xs: 14, md: 16 } }} />
        </Stack>
      </Grid>

      <Grid size={{ xs: 12, sm: 9, md: 10 }}>
        <Stack sx={{ gap: 5 }}>
          {banner && <CardMedia sx={{ borderRadius: { xs: 2, sm: 3, md: 5 }, maxHeight: 460 }} image={banner} component="img" />}

          <Stack sx={{ gap: 3.75 }}>
            {(title || description) && (
              <Stack sx={blockGap}>
                {title && <Typography sx={commonTtitleTypo}>{title}</Typography>}
                {description && <Typography sx={commonTypo}>{description}</Typography>}
              </Stack>
            )}

            <Stack sx={blockGap}>
              {features && features.length > 0 && (
                <Stack sx={blockGap}>
                  <Typography sx={commonTtitleTypo}>What’s New</Typography>
                  {renderFeatures(features)}
                </Stack>
              )}
              {conclusion && <Typography sx={commonTypo}>{conclusion}</Typography>}
            </Stack>
          </Stack>
        </Stack>
      </Grid>
    </Grid>
  );
}

// ==============================|| CHANGE LOG - MAIN ||============================== //

export default function ChangeLog() {
  const [isPending, startTransition] = useTransition();
  const [changeLogs, setChangeLogs] = useState<ChangeLogItem[]>([]);

  useEffect(() => {
    startTransition(async () => {
      try {
        const response = await axiosServices.get('api/change-log/mantis');
        setChangeLogs(response.data.changeLog?.length > 0 ? response.data.changeLog : []);
      } catch (error) {
        console.error('Error fetching changelog:', error);
      }
    });
  }, []);

  return isPending ? (
    <Loader />
  ) : (
    <Grid container sx={{ mt: { xs: 15, lg: 21 }, mb: { xs: 6.5, lg: 12 }, justifyContent: 'center' }}>
      <Container maxWidth="lg" sx={{ px: { xs: 2.5, sm: 2 } }}>
        <Stack sx={{ gap: { xs: 5, md: 7.5 } }}>
          <SectionTypeset
            caption="Highlights"
            heading="What’s New"
            description="We're constantly updating Mantis to keep you aligned with the latest trends. Check out the latest improvements, bug fixes, and new features here."
            descriptionProps={{ sx: { width: { xs: '95%', sm: '70%' }, alignSelf: 'center' } }}
          />
          {changeLogs.map((log, i) => (
            <Fragment key={i}>
              <ChangeLogItemCard
                version={log.version}
                date={log.date}
                banner={log.banner}
                title={log.title}
                description={log.description}
                features={log.features}
                conclusion={log.conclusion}
              />
              {i < changeLogs.length - 1 && <Divider sx={{ borderStyle: 'dashed', borderWidth: 1 }} />}
            </Fragment>
          ))}
        </Stack>
      </Container>
    </Grid>
  );
}
