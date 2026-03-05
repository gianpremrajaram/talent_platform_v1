// material-ui
import Masonry from '@mui/lab/Masonry';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import Rating from '@mui/material/Rating';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

// project imports
import Avatar from 'components/@extended/Avatar';
import MainCard from 'components/MainCard';
import SectionTypeset from 'components/pages/SectionTypeset';

interface Props {
  item: { image?: string; title: string; review: string; rating: number; client: string };
}

// ================================|| TESTIMONIAL - ITEMS ||================================ //

function Item({ item }: Props) {
  return (
    <MainCard content={false} sx={{ p: 3.75, borderRadius: 2 }}>
      <Stack sx={{ gap: 2 }}>
        <Typography variant="body1" color="secondary.dark">
          {item.review}
        </Typography>

        <Typography component="a" href="#!" sx={{ color: 'primary.main', textDecoration: 'none', fontWeight: 500 }}>
          {item.title}
        </Typography>
        <Divider sx={{ my: 0.5 }} />
        <Stack direction="row" sx={{ gap: 2, alignItems: 'center' }}>
          <Avatar size="lg" src={item.image ? `/assets/images/landing/clients/${item.image}` : undefined} alt={item.client}>
            {item.client.slice(0, 1)}
          </Avatar>
          <Stack sx={{ gap: 0.5 }}>
            <Typography variant="h5" sx={{ fontWeight: 500, color: 'grey.800' }}>
              {item.client}
            </Typography>
            <Rating name="read-only" readOnly value={item.rating} size="small" precision={0.5} />
          </Stack>
        </Stack>
      </Stack>
    </MainCard>
  );
}

// ==============================|| LANDING - TESTIMONIAL PAGE ||============================== //

export default function TestimonialBlock() {
  const items = [
    {
      title: 'Design Quality',
      review:
        'Mantis dashboard template is the best! Its clean design shortened the app development time. It provides various components so I could easily implement the UI I wanted, and the community is active so I could solve problems quickly. I highly recommend it!!',
      rating: 5,
      client: 'TAEJIN J.'
    },
    {
      title: 'Customizability',
      review:
        'I am very grateful for this template both code and design as well as customer service. It has really helped de-mystify and accelerate the process immensely. Thank you!',
      rating: 5,
      client: 'Emma M.'
    },
    {
      image: 'brandons.jpeg',
      title: 'Customer Support',
      review: 'A beautiful template and amazing, fast support team to go with it!',
      rating: 5,
      client: 'Brandon S.'
    },
    {
      image: 'yingchun.jpeg',
      title: 'Customer Support',
      review:
        'I strongly recommend mantis react theme, that is very usefully, can help more and more productivity for our internal project, BTW my license have expired, my computer break, i lost my mantis code, i contact the mantis team, it send my a new download link, Thank you very much to them for their professional service',
      rating: 4,
      client: 'yingchun t.'
    },
    {
      title: 'Customer Support',
      review:
        "I have been using the mantis for almost 2 years now and I have to say the support has been excellent. whenever i’ve had questions or ran into issues, the developer has always responded with the right resolution. It's rare to find such reliable and ongoing support over time - really appreciate it.",
      rating: 5,
      client: 'Abbey S.'
    },
    {
      image: 'prajwal.jpeg',
      title: 'Design Quality',
      review: 'Very satisfied so far! Great team work',
      rating: 5,
      client: 'Prajwal S.'
    },
    {
      title: 'Code Quality',
      review:
        'Excellent work. Project and code are clean. I bought Standard Plus to get figma file. However, the design system like list of basic components like button, input, colors, text not present so it difficult to create another design.',
      rating: 5,
      client: 'Chansothea K.'
    },
    {
      image: 'atishay.jpeg',
      title: 'Customizability',
      review: 'A really nice to have theme, It checks all the boxes of the perfect react theme built on top of material UI',
      rating: 5,
      client: 'Atishay J.'
    },
    {
      title: 'Flexibility',
      review: 'Excellent theme guys. Loving simplicity and code structure so far. Keep it up.',
      rating: 5,
      client: 'Tash M.'
    }
  ];

  return (
    <Box sx={{ overflowX: 'hidden' }}>
      <Container>
        <Grid container spacing={6.25} sx={{ alignItems: 'center', justifyContent: 'center' }}>
          <SectionTypeset
            heading="Voices of Our Customers"
            description="Genuine reviews from real users who trust our dashboard solutions for performance, design, and support."
            caption="Testimonials"
            descriptionProps={{ width: { lg: 600 } }}
          />
          <Box
            sx={{
              maskImage: (theme) =>
                `linear-gradient(to bottom, ${theme.palette.background.default} 0%, ${theme.palette.background.default} 50%, transparent 100%)`
            }}
          >
            <Masonry columns={{ xs: 1, sm: 2, md: 3 }} spacing={2.5} sx={{ m: 0, mt: -1 }}>
              {items.map((item, index) => (
                <Item key={index} item={item} />
              ))}
            </Masonry>
          </Box>
        </Grid>
      </Container>
    </Box>
  );
}
