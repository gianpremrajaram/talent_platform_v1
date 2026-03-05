'use client';

import { ReactNode, SyntheticEvent, useState } from 'react';
import NextLink from 'next/link';

// material-ui
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionGroup from 'components/@extended/AccordionGroup';
import AccordionSummary from '@mui/material/AccordionSummary';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

// project imports
import SectionTypeset from 'components/pages/SectionTypeset';

// assets
import MinusOutlined from '@ant-design/icons/MinusOutlined';
import PlusOutlined from '@ant-design/icons/PlusOutlined';

const Strong = ({ children }: { children: ReactNode }) => (
  <Typography component="strong" sx={{ fontSize: { xs: 14, sm: 16 }, fontWeight: 600, color: 'secondary.600' }}>
    {children}
  </Typography>
);
const StyledLink = ({ href, children }: { href: string; children: ReactNode }) => (
  <Link href={href} target="_blank" sx={{ fontSize: { xs: 14, sm: 16 }, fontWeight: 600, textDecoration: 'none', color: 'primary.main' }}>
    {children}
  </Link>
);

// data
const faqData = {
  heading: 'Got Questions? We’ve Got Answers.',
  caption: 'Quick answers to your questions',
  description: 'Find quick answers to common questions about features, setup, licenses, refunds, and support.',
  defaultExpanded: 2,
  faqList: [
    {
      question: 'What is Mantis?',
      answer: (
        <>
          Mantis, in one word, is a masterpiece. Its minimalist and simplistic design aesthetic makes it an enterprise-grade React dashboard
          template. Built with <Strong>Material-UI (MUI)</Strong> — one of the most popular React component libraries — Mantis combines
          flexibility, performance, and modern design into one powerful template.
        </>
      )
    },
    {
      question: 'Is there a free template available to test the code before buying?',
      answer: (
        <>
          Yes! You can explore the{' '}
          <Strong>
            Mantis <StyledLink href="https://github.com/codedthemes/mantis-free-react-admin-template/">open-source</StyledLink> version
          </Strong>
          , which showcases the code quality and project structure. It’s a great way to evaluate before making a purchase.
        </>
      )
    },
    {
      question: 'Does Mantis support TypeScript?',
      answer: <>Yes. Mantis includes full TypeScript support out of the box, ensuring type safety and smoother development.</>
    },
    {
      question: 'Can I integrate Mantis with my backend?',
      answer: <>Absolutely! Mantis is frontend-only, so you can connect it to any backend (Node.js, Laravel, Django, .NET, etc.).</>
    },
    {
      question: 'Do you provide Figma/Design files with Mantis?',
      answer: <>Yes. We provide Figma files for faster design handoff. Please check the product page for details.</>
    },
    {
      question: 'Can I change the colors and styles?',
      answer: <>Definitely! Mantis is built with Material-UI theming, making it easy to adjust colors, typography, and overall styles.</>
    },
    {
      question: 'Is RTL (Right-to-Left) support included?',
      answer: <>Yes, Mantis supports RTL layouts, making it suitable for languages like Arabic, Hebrew, and Persian.</>
    },
    {
      question: 'Which browsers does Mantis support?',
      answer: (
        <>
          MUI components are optimized for the latest stable versions of major browsers —{' '}
          <Strong>Chrome, Firefox, Safari, and Edge.</Strong> <br /> ⚠️ <Strong>Note:</Strong>{' '}
          <Typography variant="body1" component="span" color="text.primary">
            {' '}
            Internet Explorer 11 is not supported.
          </Typography>
        </>
      )
    },
    {
      question: 'Which license fits my project?',
      answer: (
        <>
          Mantis offers 3 different license types tailored to various project needs. You can find detailed comparisons on the{' '}
          <StyledLink href="https://mui.com/store/license/">License Page</StyledLink> to ensure you choose the right one.
        </>
      )
    },
    {
      question: 'Can I use Mantis for commercial projects?',
      answer: (
        <>
          Yes. Depending on your license type, you can use Mantis in commercial, SaaS, or client projects. Check the{' '}
          <StyledLink href="https://mui.com/store/license/">License Page</StyledLink> for details.
        </>
      )
    },
    {
      question: 'What does “Lifetime License” mean?',
      answer: (
        <>
          The license is valid for a lifetime, meaning you can use Mantis forever. It includes <Strong>1 year of free updates</Strong> and{' '}
          <Strong>6 months of support</Strong>. After that, you can renew for continued updates and support.
        </>
      )
    },
    {
      question: 'What kind of support is included?',
      answer: (
        <>
          Support includes bug fixes, answering questions about setup, and minor guidance. It does not cover custom development or
          third-party integrations.
        </>
      )
    },
    {
      question: 'How do I get help if I face issues?',
      answer: (
        <>
          You can raise a support ticket via our <StyledLink href="https://codedthemes.support-hub.io/">support portal</StyledLink>, and our
          team usually responds within 1 business day.
        </>
      )
    },
    {
      question: 'How often is Mantis updated?',
      answer: (
        <>
          We regularly release updates with new features, bug fixes, and third-party library upgrades. You can follow the{' '}
          <StyledLink href="https://codedthemes.gitbook.io/mantis/changelog">changelog</StyledLink> for details.
        </>
      )
    },
    {
      question: 'Where can I check the changelog of Mantis?',
      answer: (
        <>
          The complete changelog is available on the{' '}
          <Strong>
            Mantis <StyledLink href="https://codedthemes.gitbook.io/mantis/changelog">changelog</StyledLink> Page
          </Strong>
          .
        </>
      )
    }
  ]
};

// ==============================|| FAQ PAGE ||============================== //

export default function Faq() {
  const [expanded, setExpanded] = useState<number | false>(faqData.defaultExpanded);

  const handleChange = (panel: number) => (_event: SyntheticEvent, isExpanded: boolean) => {
    setExpanded(isExpanded ? panel : false);
  };

  return (
    <Grid container spacing={12} justifyContent="center" alignItems="center" sx={{ mt: { xs: 15, lg: 21 }, mb: { xs: 6.5, lg: 12 } }}>
      <Grid size={{ xs: 12, sm: 10, lg: 9 }}>
        <Container maxWidth="lg" sx={{ px: { xs: 2.5, sm: 2 } }}>
          <Stack sx={{ gap: { xs: 3.75, sm: 5, lg: 6.25 } }}>
            <SectionTypeset
              caption={faqData.caption}
              heading={faqData.heading}
              description={faqData.description}
              headingProps={{ sx: { fontWeight: 700 } }}
            />
            <AccordionGroup
              sx={{
                gap: { xs: 1.5, sm: 2, lg: 2.5 },
                '& .MuiAccordion-root:not(:last-child)': { borderBottom: '1px solid', borderColor: 'divider' }
              }}
            >
              {faqData.faqList.map((faq, index) => (
                <Accordion key={index} expanded={expanded === index} onChange={handleChange(index)}>
                  <AccordionSummary
                    expandIcon={
                      expanded === index ? (
                        <Box sx={{ fontSize: { xs: 14, sm: 16, lg: 18 } }}>
                          <MinusOutlined style={{ transform: 'rotate(90deg)', fontSize: 'inherit' }} />
                        </Box>
                      ) : (
                        <Box sx={{ fontSize: { xs: 14, sm: 16, lg: 18 } }}>
                          <PlusOutlined style={{ fontSize: 'inherit' }} />
                        </Box>
                      )
                    }
                    sx={{ gap: 1 }}
                  >
                    <Typography variant="h4" sx={{ fontSize: { xs: 16, sm: 18, lg: 20 }, fontWeight: 500 }}>
                      {faq.question}
                    </Typography>
                  </AccordionSummary>

                  <AccordionDetails>
                    <Typography variant="h5" sx={{ color: 'text.secondary', fontSize: { xs: 14, sm: 16 }, fontWeight: 400 }}>
                      {faq.answer}
                    </Typography>
                  </AccordionDetails>
                </Accordion>
              ))}
            </AccordionGroup>
            <Stack sx={{ gap: { xs: 1.5, sm: 2, lg: 2.5 } }}>
              <Typography variant="h4" sx={{ fontSize: { xs: 16, sm: 18, lg: 20 }, fontWeight: 500 }}>
                Still have a question?
              </Typography>
              <Typography variant="h5" sx={{ fontSize: { xs: 14, sm: 16 }, fontWeight: 400 }}>
                If you can’t find the answer you’re looking for, please don’t hesitate to{' '}
                <Typography component={NextLink} href="/contact-us" target="_blank" sx={{ color: 'primary.main', textDecoration: 'none' }}>
                  Contact Us
                </Typography>{' '}
                — we’re always here to help!
              </Typography>
            </Stack>
          </Stack>
        </Container>
      </Grid>
    </Grid>
  );
}
