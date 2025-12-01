import { useState } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Container,
  TextField,
  Button,
  Chip,
  Card,
  Stack,
  Tabs,
  Tab,
  Tooltip,
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import ImageIcon from '@mui/icons-material/Image';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { prompts } from './util/prompts';
import './App.css';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#2563eb',
    },
    success: {
      main: '#10b981',
    },
    error: {
      main: '#ef4444',
    },
    background: {
      default: '#f8fafc',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif',
    h4: {
      fontWeight: 700,
    },
    h6: {
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          padding: '10px 24px',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
          },
        },
      },
    },
  },
});

interface TestImage {
  id: string;
  url: string;
  groundTruth: 'ai' | 'real';
  fileName: string;
}

function App() {
  const [customPrompt, setCustomPrompt] = useState(prompts.basic);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [filterType, setFilterType] = useState<'all' | 'ai' | 'real'>('all');
  const [promptTab, setPromptTab] = useState(0);

  // Mock test images - in real implementation, these would be loaded from the data/images folder
  const testImages: TestImage[] = [
    // AI images
    ...Array.from({ length: 50 }, (_, i) => ({
      id: `ai-${i}`,
      url: `data/images/ai/image_${i}.jpg`,
      groundTruth: 'ai' as const,
      fileName: `ai_image_${i}.jpg`,
    })),
    // Real images
    ...Array.from({ length: 50 }, (_, i) => ({
      id: `real-${i}`,
      url: `data/images/real/image_${i}.jpg`,
      groundTruth: 'real' as const,
      fileName: `real_image_${i}.jpg`,
    })),
  ];

  const filteredImages = testImages.filter((img) => {
    if (filterType === 'all') return true;
    return img.groundTruth === filterType;
  });

  const handlePromptTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setPromptTab(newValue);
    if (newValue === 0) {
      setCustomPrompt(prompts.basic);
    } else if (newValue === 1) {
      setCustomPrompt(prompts.detailed);
    }
  };

  const handleImageSelect = (imageId: string) => {
    setSelectedImages((prev) =>
      prev.includes(imageId)
        ? prev.filter((id) => id !== imageId)
        : [...prev, imageId]
    );
  };

  const handleRunExperiment = () => {
    // TODO: Implement experiment execution
    console.log('Running experiment with:', {
      prompt: customPrompt,
      selectedImages: selectedImages.length > 0 ? selectedImages : 'all images',
    });
  };

  const handleSelectAll = () => {
    setSelectedImages(filteredImages.map((img) => img.id));
  };

  const handleDeselectAll = () => {
    setSelectedImages([]);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
        {/* Header */}
        <AppBar position="static" elevation={0} sx={{ bgcolor: 'white', borderBottom: '1px solid #e5e7eb' }}>
          <Toolbar sx={{ py: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <ImageIcon sx={{ fontSize: 28, color: 'primary.main' }} />
              <Typography variant="h6" component="div" sx={{ color: 'text.primary', fontWeight: 700 }}>
                AI Image Classifier
              </Typography>
            </Box>
          </Toolbar>
        </AppBar>

        <Container maxWidth="xl" sx={{ py: 4 }}>
          {/* Page Title */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" gutterBottom>
              Image Classification Experiment
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Select test images and configure your prompt to classify AI-generated vs. real photographs
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', lg: 'row' } }}>
            {/* Left Panel - Prompt Editor */}
            <Box sx={{ flex: '0 0 400px', minWidth: 0 }}>
              <Card sx={{ p: 3, position: 'sticky', top: 20 }}>
                <Typography variant="h6" gutterBottom>
                  Prompt Configuration
                </Typography>

                <Tabs
                  value={promptTab}
                  onChange={handlePromptTabChange}
                  sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}
                >
                  <Tab label="Basic" />
                  <Tab label="Detailed" />
                  <Tab label="Custom" />
                </Tabs>

                <TextField
                  multiline
                  rows={16}
                  fullWidth
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  variant="outlined"
                  sx={{
                    mb: 2,
                    '& .MuiOutlinedInput-root': {
                      fontFamily: 'monospace',
                      fontSize: '0.875rem',
                    },
                  }}
                />

                <Stack spacing={2}>
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Selected: {selectedImages.length} / {filteredImages.length} images
                    </Typography>
                  </Box>

                  <Button
                    variant="contained"
                    size="large"
                    fullWidth
                    startIcon={<PlayArrowIcon />}
                    onClick={handleRunExperiment}
                    disabled={selectedImages.length === 0}
                  >
                    Run Experiment
                  </Button>
                </Stack>
              </Card>
            </Box>

            {/* Right Panel - Image Gallery */}
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Card sx={{ p: 3, mb: 3 }}>
                <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between" flexWrap="wrap">
                  <Stack direction="row" spacing={1}>
                    <Chip
                      label="All"
                      onClick={() => setFilterType('all')}
                      color={filterType === 'all' ? 'primary' : 'default'}
                      variant={filterType === 'all' ? 'filled' : 'outlined'}
                    />
                    <Chip
                      label="AI Generated"
                      onClick={() => setFilterType('ai')}
                      color={filterType === 'ai' ? 'error' : 'default'}
                      variant={filterType === 'ai' ? 'filled' : 'outlined'}
                      icon={filterType === 'ai' ? <CancelIcon /> : undefined}
                    />
                    <Chip
                      label="Real Photos"
                      onClick={() => setFilterType('real')}
                      color={filterType === 'real' ? 'success' : 'default'}
                      variant={filterType === 'real' ? 'filled' : 'outlined'}
                      icon={filterType === 'real' ? <CheckCircleIcon /> : undefined}
                    />
                  </Stack>

                  <Stack direction="row" spacing={1}>
                    <Button size="small" onClick={handleSelectAll} variant="outlined">
                      Select All
                    </Button>
                    <Button size="small" onClick={handleDeselectAll} variant="outlined">
                      Deselect All
                    </Button>
                  </Stack>
                </Stack>
              </Card>

              {/* Image Grid */}
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                  gap: 2,
                }}
              >
                {filteredImages.map((image) => (
                  <Card
                    key={image.id}
                    onClick={() => handleImageSelect(image.id)}
                    sx={{
                      cursor: 'pointer',
                      position: 'relative',
                      border: selectedImages.includes(image.id) ? 3 : 1,
                      borderColor: selectedImages.includes(image.id) ? 'primary.main' : 'divider',
                      overflow: 'hidden',
                    }}
                  >
                    <Box
                      sx={{
                        position: 'relative',
                        paddingTop: '100%',
                        bgcolor: '#f1f5f9',
                        overflow: 'hidden',
                      }}
                    >
                      {/* Placeholder for actual image */}
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          bgcolor: image.groundTruth === 'ai' ? '#fef2f2' : '#f0fdf4',
                        }}
                      >
                        <ImageIcon sx={{ fontSize: 48, color: '#cbd5e1' }} />
                      </Box>

                      {/* Ground Truth Badge */}
                      <Chip
                        label={image.groundTruth === 'ai' ? 'AI' : 'Real'}
                        size="small"
                        color={image.groundTruth === 'ai' ? 'error' : 'success'}
                        sx={{
                          position: 'absolute',
                          top: 8,
                          right: 8,
                          fontWeight: 600,
                          fontSize: '0.75rem',
                        }}
                      />

                      {/* Selection Indicator */}
                      {selectedImages.includes(image.id) && (
                        <Box
                          sx={{
                            position: 'absolute',
                            top: 8,
                            left: 8,
                            bgcolor: 'primary.main',
                            color: 'white',
                            borderRadius: '50%',
                            width: 24,
                            height: 24,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <CheckCircleIcon sx={{ fontSize: 20 }} />
                        </Box>
                      )}
                    </Box>

                    {/* Image Info */}
                    <Box sx={{ p: 1.5 }}>
                      <Tooltip title={image.fileName}>
                        <Typography
                          variant="caption"
                          sx={{
                            display: 'block',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            color: 'text.secondary',
                          }}
                        >
                          {image.fileName}
                        </Typography>
                      </Tooltip>
                    </Box>
                  </Card>
                ))}
              </Box>
            </Box>
          </Box>
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default App;
