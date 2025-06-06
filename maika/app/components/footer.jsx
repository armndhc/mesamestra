import { Box, Container, Link, Typography, TextField, Button, IconButton, MenuItem, Select } from '@mui/material';
import { Facebook, Twitter, YouTube } from '@mui/icons-material';
import Grid from "@mui/material/Grid2";
import Image from 'next/image';

export default function Footer() {
    return (
        <Box sx={{ bgcolor: '#f8f9fa', p: 8, mt: 4 }}>
            <Grid container spacing={4}>
                <Grid xs={12} md={3}>
                    <Typography variant="h6" component="div" gutterBottom>
                        <Box
                            sx={{
                                borderRadius: 50,
                                overflow: "hidden",
                                width: 100,
                                height: 100
                            }}
                        >
                            <Image
                                src="/mesamaestralogo.png"
                                alt="logo"
                                width={100}
                                height={100}
                            />
                        </Box>
                    </Typography>
                </Grid>

                <Grid xs={6} md={2}>
                    <Typography variant="subtitle1" gutterBottom>
                        Our Services
                    </Typography>
                    <Link href="#" variant="body2" display="block" color="textSecondary">Menu</Link>
                    <Link href="#" variant="body2" display="block" color="textSecondary">Reservations</Link>
                    <Link href="#" variant="body2" display="block" color="textSecondary">Inventory</Link>
                </Grid>

                <Grid xs={6} md={2}>
                    <Typography variant="subtitle1" gutterBottom>
                        Resources
                    </Typography>
                    <Link href="#" variant="body2" display="block" color="textSecondary">Tables and Orders</Link>
                    <Link href="#" variant="body2" display="block" color="textSecondary">Users and Roles</Link>
                </Grid>

                <Grid xs={6} md={2}>
                    <Typography variant="subtitle1" gutterBottom>
                        Contact
                    </Typography>
                    <Typography variant="h7" display="block" color="textSecondary">55 78 66 99 41</Typography>
                    <Typography variant="h7" display="block" color="textSecondary">contact@mesamaestra.com</Typography>
                </Grid>

                <Grid xs={12} ml="auto">
                    <Typography variant="subtitle1" gutterBottom>
                        Send us a message
                    </Typography>
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                        Ask us anything or share feedback
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <TextField
                            variant="outlined"
                            placeholder="Write your message..."
                            size="small"
                            sx={{ mr: 1, flexGrow: 1 }}
                            multiline
                            maxRows={4}
                        />
                        <Button 
                            variant="contained"
                            sx={{ 
                                backgroundColor: '#2c2f48',
                                color: 'white',
                                "&:hover": {
                                    backgroundColor: '#5188a7',
                                    color: 'white',
                                    transform: "scale(1.2)",
                                    transition: "transform 0.3s ease-in-out",
                                },
                            }}
                        >
                            Send
                        </Button>
                    </Box>
                </Grid>
            </Grid>

            <Box sx={{ borderTop: 1, borderColor: '#e0e0e0', mt: 4, pt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Select defaultValue="English" size="small" sx={{ minWidth: 100 }}>
                    <MenuItem value="English">English</MenuItem>
                    <MenuItem value="Spanish">Spanish</MenuItem>
                </Select>
                <Typography variant="body2" color="textSecondary">
                    © 2025 MesaMestra, Inc. • <Link href="#">Privacy</Link> • <Link href="#">Terms</Link> • <Link href="#">Sitemap</Link>
                </Typography>
                <Box>
                    <IconButton
                        href="https://twitter.com"
                        color="inherit"
                        sx={{
                            "&:hover": {
                                backgroundColor: "#e3f2fd",
                                color: "#1DA1F2",
                                transform: "scale(1.2)",
                                transition: "transform 0.3s ease-in-out",
                            },
                        }}
                    >
                        <Twitter />
                    </IconButton>
                    <IconButton
                        href="https://facebook.com"
                        color="inherit"
                        sx={{
                            "&:hover": {
                                backgroundColor: "#e3f2fd",
                                color: "#1DA1F2",
                                transform: "scale(1.2)",
                                transition: "transform 0.3s ease-in-out",
                            },
                        }}
                    >
                        <Facebook />
                    </IconButton>
                    <IconButton
                        href="https://youtube.com"
                        color="inherit"
                        sx={{
                            "&:hover": {
                                backgroundColor: "#e3f2fd",
                                color: "#FF0000",
                                transform: "scale(1.2)",
                                transition: "transform 0.3s ease-in-out",
                            },
                        }}
                    >
                        <YouTube />
                    </IconButton>
                </Box>
            </Box>
        </Box>
    );
}
