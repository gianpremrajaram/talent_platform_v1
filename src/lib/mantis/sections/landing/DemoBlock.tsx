// material-ui
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Link from '@mui/material/Link';

// project imports
import DemoCard from './DemoCard';
import AnimateButton from 'components/@extended/AnimateButton';
import SectionTypeset from 'components/pages/SectionTypeset';
import { NextLink } from 'components/routes';

// assets
import SendOutlined from '@ant-design/icons/SendOutlined';
const imgdemo1 = '/assets/images/landing/img-demo1.jpg';
const imgdemo2 = '/assets/images/landing/img-demo2.jpg';
const imgdemo3 = '/assets/images/landing/img-demo3.jpg';

// ==============================|| LANDING - DEMO PAGE ||============================== //

export default function DemoBlock() {
  return (
    <Container>
      <Grid container spacing={2} sx={{ alignItems: 'center', justifyContent: 'center' }}>
        <Grid size={12}>
          <Grid container spacing={1} sx={{ justifyContent: 'center', mb: 4, textAlign: 'center' }}>
            <Grid size={{ sm: 10, md: 6 }}>
              <SectionTypeset
                heading="Complete Combo"
                description="Whether you are developer or designer, Mantis serve the need of all - No matter you are novice or expert"
                caption="Mantis for All"
              />
            </Grid>
          </Grid>
        </Grid>

        <Grid container sx={{ alignItems: 'start' }}>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <DemoCard
              title="Design Source File"
              description="Check the live preview of Mantis figma design file. Figma file included in Plus and Extended License only."
              action={
                <AnimateButton>
                  <Button
                    variant="outlined"
                    endIcon={<SendOutlined />}
                    size="large"
                    component={Link}
                    href="https://www.figma.com/file/NJGFukWMHgU0LVhS4qLP4A/Mantis?node-id=106412%3A169520"
                    target="_blank"
                  >
                    Preview Figma
                  </Button>
                </AnimateButton>
              }
              image={imgdemo1}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <DemoCard
              title="Components"
              description="Check the all components of Mantis in single place with search feature for easing your development while working."
              action={
                <AnimateButton>
                  <Button size="large" variant="contained" component={NextLink} href="/components-overview/buttons" target="_blank">
                    View All Components
                  </Button>
                </AnimateButton>
              }
              image={imgdemo2}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <DemoCard
              title="Documentation"
              description={
                'From Quick start to detailed installation with super easy navigation for find out solution of your queries with developer-friendly documentation guide.'
              }
              action={
                <AnimateButton>
                  <Button variant="outlined" size="large" component={Link} href="https://codedthemes.gitbook.io/mantis/" target="_blank">
                    Explore Documentation
                  </Button>
                </AnimateButton>
              }
              image={imgdemo3}
            />
          </Grid>
        </Grid>
      </Grid>
    </Container>
  );
}
