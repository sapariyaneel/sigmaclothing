import React from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Divider,
} from '@mui/material';
import { motion } from 'framer-motion';

const About = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
      },
    },
  };

  return (
    <Container maxWidth="xl">
      {/* Hero Section */}
      <Box
        component={motion.div}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        sx={{
          textAlign: 'center',
          py: { xs: 6, md: 10 },
        }}
      >
        <motion.div variants={itemVariants}>
          <Typography
            variant="h1"
            gutterBottom
            sx={{
              fontSize: { xs: '2.5rem', md: '3.5rem' },
              fontWeight: 700,
            }}
          >
            About Sigma Clothing
          </Typography>
        </motion.div>
        <motion.div variants={itemVariants}>
          <Typography
            variant="h5"
            color="text.secondary"
            sx={{ maxWidth: '800px', mx: 'auto', mb: 6 }}
          >
            Elevating everyday fashion with premium quality and timeless designs
          </Typography>
        </motion.div>
      </Box>

      {/* Our Story Section */}
      <Box
        component={motion.div}
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        sx={{ mb: 10 }}
      >
        <Grid container spacing={4} alignItems="center">
          <Grid item xs={12} md={6}>
            <motion.div variants={itemVariants}>
              <Typography variant="h3" gutterBottom>
                Our Story
              </Typography>
              <Typography variant="body1" paragraph>
                Founded in 2024, Sigma Clothing emerged from a vision to create a fashion brand that combines modern aesthetics with sustainable practices. Our journey began with a simple idea: to provide high-quality, stylish clothing that stands the test of time.
              </Typography>
              <Typography variant="body1" paragraph>
                We believe that great fashion shouldn't come at the expense of our planet. That's why we carefully select our materials and partner with manufacturers who share our commitment to ethical production and environmental responsibility.
              </Typography>
            </motion.div>
          </Grid>
          <Grid item xs={12} md={6}>
            <motion.div variants={itemVariants}>
              <Box
                component="img"
                src="https://via.placeholder.com/600x400"
                alt="Our Story"
                sx={{
                  width: '100%',
                  height: 'auto',
                  borderRadius: 2,
                }}
              />
            </motion.div>
          </Grid>
        </Grid>
      </Box>

      {/* Values Section */}
      <Box
        component={motion.div}
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        sx={{ mb: 10 }}
      >
        <Typography variant="h3" gutterBottom textAlign="center">
          Our Values
        </Typography>
        <Grid container spacing={4} sx={{ mt: 2 }}>
          {[
            {
              title: 'Quality First',
              description: 'We never compromise on quality, ensuring each piece meets our high standards.',
            },
            {
              title: 'Sustainable Fashion',
              description: 'Committed to reducing our environmental impact through responsible practices.',
            },
            {
              title: 'Customer Focus',
              description: 'Your satisfaction is our priority, from product selection to after-sales service.',
            },
            {
              title: 'Innovation',
              description: 'Constantly evolving and adapting to bring you the latest in fashion and technology.',
            },
          ].map((value, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <motion.div variants={itemVariants}>
                <Card
                  elevation={0}
                  sx={{
                    height: '100%',
                    bgcolor: 'background.paper',
                    border: 1,
                    borderColor: 'divider',
                  }}
                >
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {value.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {value.description}
                    </Typography>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Team Section */}
      <Box
        component={motion.div}
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        sx={{ mb: 10 }}
      >
        <Typography variant="h3" gutterBottom textAlign="center">
          Meet Our Team
        </Typography>
        <Grid container spacing={4} sx={{ mt: 2 }}>
          {[
            {
              name: 'John Doe',
              role: 'Founder & CEO',
              image: 'https://via.placeholder.com/300x400',
              bio: 'With over 15 years in fashion retail, John brings his expertise and vision to Sigma Clothing.',
            },
            {
              name: 'Jane Smith',
              role: 'Creative Director',
              image: 'https://via.placeholder.com/300x400',
              bio: 'Jane leads our design team, bringing contemporary trends to our collections.',
            },
          ].map((member, index) => (
            <Grid item xs={12} sm={6} md={6} key={index}>
              <motion.div variants={itemVariants}>
                <Card
                  elevation={0}
                  sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' },
                    bgcolor: 'background.paper',
                    border: 1,
                    borderColor: 'divider',
                  }}
                >
                  <CardMedia
                    component="img"
                    image={member.image}
                    alt={member.name}
                    sx={{
                      width: { xs: '100%', sm: 200 },
                      height: { xs: 300, sm: 'auto' },
                      objectFit: 'cover',
                    }}
                  />
                  <CardContent>
                    <Typography variant="h5" gutterBottom>
                      {member.name}
                    </Typography>
                    <Typography
                      variant="subtitle1"
                      color="text.secondary"
                      gutterBottom
                    >
                      {member.role}
                    </Typography>
                    <Typography variant="body2">{member.bio}</Typography>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Contact Section */}
      <Box
        component={motion.div}
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        sx={{ mb: 6 }}
      >
        <Divider sx={{ mb: 6 }} />
        <Grid container spacing={4} alignItems="center">
          <Grid item xs={12} md={6}>
            <motion.div variants={itemVariants}>
              <Typography variant="h3" gutterBottom>
                Get in Touch
              </Typography>
              <Typography variant="body1" paragraph>
                We'd love to hear from you! Whether you have questions about our products, want to collaborate, or just want to say hello, feel free to reach out.
              </Typography>
              <Typography variant="body1" paragraph>
                Email: contact@sigmaclothing.com<br />
                Phone: +91 1234567890<br />
                Address: 123 Fashion Street, Mumbai, India
              </Typography>
            </motion.div>
          </Grid>
          <Grid item xs={12} md={6}>
            <motion.div variants={itemVariants}>
              <Box
                component="img"
                src="https://via.placeholder.com/600x400"
                alt="Contact Us"
                sx={{
                  width: '100%',
                  height: 'auto',
                  borderRadius: 2,
                }}
              />
            </motion.div>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default About; 