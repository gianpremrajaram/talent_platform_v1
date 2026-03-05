'use client';

import { useState } from 'react';

// material-ui
import Accordion from '@mui/material/Accordion';
import Stack from '@mui/material/Stack';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

// project imports
import MainCard from 'components/MainCard';
import AccordionGroup from 'components/@extended/AccordionGroup';

// assets
import MinusOutlined from '@ant-design/icons/MinusOutlined';
import PlusOutlined from '@ant-design/icons/PlusOutlined';

// ==============================|| ACCORDION - CUSTOMIZED ||============================== //

export default function CustomizedAccordion2() {
  const [expandedPanels, setExpandedPanels] = useState<{ [key: string]: boolean }>({
    panel1: false,
    panel2: true,
    panel3: false,
    panel4: false
  });

  const handleToggle = (panel: string) => () => {
    setExpandedPanels((prev) => ({
      ...prev,
      [panel]: !prev[panel]
    }));
  };

  return (
    <MainCard title="Customized 2">
      <AccordionGroup>
        <Accordion expanded={expandedPanels.panel1} onChange={handleToggle('panel1')}>
          <AccordionSummary
            expandIcon={
              expandedPanels.panel1 ? (
                <Box sx={{ fontSize: { xs: 14, sm: 16, lg: 18 } }}>
                  <MinusOutlined style={{ transform: 'rotate(90deg)', fontSize: 'inherit' }} />
                </Box>
              ) : (
                <Box sx={{ fontSize: { xs: 14, sm: 16, lg: 18 } }}>
                  <PlusOutlined style={{ fontSize: 'inherit' }} />
                </Box>
              )
            }
          >
            <Typography variant="h4" sx={{ fontSize: { xs: 16, sm: 18, lg: 20 }, fontWeight: 500 }}>
              Accordion 01
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Stack sx={{ gap: 2 }}>
              <Typography color="text.secondary" sx={{ fontSize: { xs: 14, sm: 16 }, fontWeight: 400 }}>
                Lorem ipsum dolor sit amet,
              </Typography>
              <Typography color="text.secondary" sx={{ fontSize: { xs: 14, sm: 16 }, fontWeight: 400 }}>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse malesuada lacus ex, sit amet blandit leo lobortis eget.
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse malesuada lacus ex, sit amet blandit leo lobortis eget.
              </Typography>
              <Typography color="text.secondary" sx={{ fontSize: { xs: 14, sm: 16 }, fontWeight: 400 }}>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse malesuada lacus ex, sit amet blandit leo lobortis eget.
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse malesuada lacus ex, sit amet blandit leo lobortis eget.
              </Typography>
            </Stack>
          </AccordionDetails>
        </Accordion>

        <Accordion expanded={expandedPanels.panel2} onChange={handleToggle('panel2')}>
          <AccordionSummary
            expandIcon={
              expandedPanels.panel2 ? (
                <Box sx={{ fontSize: { xs: 14, sm: 16, lg: 18 } }}>
                  <MinusOutlined style={{ transform: 'rotate(90deg)', fontSize: 'inherit' }} />
                </Box>
              ) : (
                <Box sx={{ fontSize: { xs: 14, sm: 16, lg: 18 } }}>
                  <PlusOutlined style={{ fontSize: 'inherit' }} />
                </Box>
              )
            }
          >
            <Typography sx={{ fontSize: { xs: 16, sm: 18, lg: 20 }, fontWeight: 500 }}>Accordion 02</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography color="text.secondary" sx={{ fontSize: { xs: 14, sm: 16 }, fontWeight: 400 }}>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse malesuada lacus ex, sit amet blandit leo lobortis eget.
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse malesuada lacus ex, sit amet blandit leo lobortis eget.
            </Typography>
          </AccordionDetails>
        </Accordion>

        <Accordion expanded={expandedPanels.panel3} onChange={handleToggle('panel3')}>
          <AccordionSummary
            expandIcon={
              expandedPanels.panel3 ? (
                <Box sx={{ fontSize: { xs: 14, sm: 16, lg: 18 } }}>
                  <MinusOutlined style={{ transform: 'rotate(90deg)', fontSize: 'inherit' }} />
                </Box>
              ) : (
                <Box sx={{ fontSize: { xs: 14, sm: 16, lg: 18 } }}>
                  <PlusOutlined style={{ fontSize: 'inherit' }} />
                </Box>
              )
            }
          >
            <Typography sx={{ fontSize: { xs: 16, sm: 18, lg: 20 }, fontWeight: 500 }}>Accordion 03</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography color="text.secondary" sx={{ fontSize: { xs: 14, sm: 16 }, fontWeight: 400 }}>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse malesuada lacus ex, sit amet blandit leo lobortis eget.
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse malesuada lacus ex, sit amet blandit leo lobortis eget.
            </Typography>
          </AccordionDetails>
        </Accordion>

        <Accordion expanded={expandedPanels.panel4} onChange={handleToggle('panel4')}>
          <AccordionSummary
            expandIcon={
              expandedPanels.panel4 ? (
                <Box sx={{ fontSize: { xs: 14, sm: 16, lg: 18 } }}>
                  <MinusOutlined style={{ transform: 'rotate(90deg)', fontSize: 'inherit' }} />
                </Box>
              ) : (
                <Box sx={{ fontSize: { xs: 14, sm: 16, lg: 18 } }}>
                  <PlusOutlined style={{ fontSize: 'inherit' }} />
                </Box>
              )
            }
          >
            <Typography sx={{ fontSize: { xs: 16, sm: 18, lg: 20 }, fontWeight: 500 }}>Accordion 04</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography color="text.secondary" sx={{ fontSize: { xs: 14, sm: 16 }, fontWeight: 400 }}>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse malesuada lacus ex, sit amet blandit leo lobortis eget.
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse malesuada lacus ex, sit amet blandit leo lobortis eget.
            </Typography>
          </AccordionDetails>
        </Accordion>
      </AccordionGroup>
    </MainCard>
  );
}
