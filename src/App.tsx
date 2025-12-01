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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  AlertTitle,
  Link,
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import ImageIcon from '@mui/icons-material/Image';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import KeyIcon from '@mui/icons-material/Key';
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
  const [openApiKey, setOpenApiKey] = useState('');
  const [apiKeyDialogOpen, setApiKeyDialogOpen] = useState(false);
  const [tempApiKey, setTempApiKey] = useState('');

  // Real test images loaded from public/images folder
  const testImages: TestImage[] = [
    // AI images - diffusion models
    ...['diffusion1', 'diffusion2', 'diffusion3', 'diffusion4'].flatMap((type) =>
      Array.from({ length: 10 }, (_, i) => ({
        id: `${type}_${i + 1}`,
        url: `/images/ai/${type}_${i + 1}.jpg`,
        groundTruth: 'ai' as const,
        fileName: `${type}_${i + 1}.jpg`,
      }))
    ),
    // AI images - GAN
    ...Array.from({ length: 10 }, (_, i) => ({
      id: `gan_${i + 1}`,
      url: `/images/ai/gan_${i + 1}.jpg`,
      groundTruth: 'ai' as const,
      fileName: `gan_${i + 1}.jpg`,
    })),
    // Real images - various categories
    ...['animals', 'city', 'food', 'nature', 'people'].flatMap((category) =>
      Array.from({ length: 10 }, (_, i) => ({
        id: `${category}_${i + 1}`,
        url: `/images/real/${category}_${i + 1}.jpg`,
        groundTruth: 'real' as const,
        fileName: `${category}_${i + 1}.jpg`,
      }))
    ),
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

  const handleOpenApiKeyDialog = () => {
    setTempApiKey(openApiKey);
    setApiKeyDialogOpen(true);
  };

  const handleCloseApiKeyDialog = () => {
    setApiKeyDialogOpen(false);
    setTempApiKey('');
  };

  const handleSaveApiKey = () => {
    setOpenApiKey(tempApiKey);
    setApiKeyDialogOpen(false);
    setTempApiKey('');
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

                  {!openApiKey && (
                    <Alert severity="info" sx={{ fontSize: '0.875rem' }}>
                      <AlertTitle sx={{ fontSize: '0.875rem', fontWeight: 600 }}>API Key Required</AlertTitle>
                      Set your OpenAI API key to run experiments
                    </Alert>
                  )}

                  <Button
                    variant={openApiKey ? 'outlined' : 'contained'}
                    color={openApiKey ? 'success' : 'primary'}
                    size="large"
                    fullWidth
                    startIcon={<KeyIcon />}
                    onClick={handleOpenApiKeyDialog}
                  >
                    {openApiKey ? 'API Key Set' : 'Set API Key'}
                  </Button>

                  <Button
                    variant="contained"
                    size="large"
                    fullWidth
                    startIcon={<PlayArrowIcon />}
                    onClick={handleRunExperiment}
                    disabled={selectedImages.length === 0 || !openApiKey}
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
                      {/* Actual image */}
                      <Box
                        component="img"
                        src={image.url}
                        alt={image.fileName}
                        sx={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                        }}
                        loading="lazy"
                      />

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

        {/* API Key Dialog */}
        <Dialog 
          open={apiKeyDialogOpen} 
          onClose={handleCloseApiKeyDialog}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            OpenAI API Key
          </DialogTitle>
          <DialogContent>
            <Alert severity="info" sx={{ mb: 3 }}>
              <AlertTitle>Why is this needed?</AlertTitle>
              This application uses GPT-4o Vision to classify images as AI-generated or real. Your API key is required to authenticate requests to OpenAI.
            </Alert>

            <Alert severity="success" sx={{ mb: 3 }}>
              <AlertTitle>Privacy & Security</AlertTitle>
              Your API key is stored only in your browser's memory (local state) and is never sent to any server except OpenAI's API. 
              It will be cleared when you close or refresh the page.
            </Alert>

            <Alert severity="warning" sx={{ mb: 3 }}>
              <AlertTitle>Open Source</AlertTitle>
              This application is fully open source. You can review the code at{' '}
              <Link 
                href="https://github.com/ML72/AI-Image-Classifier-Playground" 
                target="_blank" 
                rel="noopener noreferrer"
                sx={{ fontWeight: 600 }}
              >
                github.com/ML72/AI-Image-Classifier-Playground
              </Link>
              {' '}to verify how your API key is handled.
            </Alert>

            <TextField
              autoFocus
              margin="dense"
              label="OpenAI API Key"
              type="password"
              fullWidth
              variant="outlined"
              value={tempApiKey}
              onChange={(e) => setTempApiKey(e.target.value)}
              placeholder="sk-..."
              helperText="Get your API key from platform.openai.com"
            />
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button onClick={handleCloseApiKeyDialog} color="inherit">
              Cancel
            </Button>
            <Button 
              onClick={handleSaveApiKey} 
              variant="contained"
              disabled={!tempApiKey.trim()}
            >
              Save API Key
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </ThemeProvider>
  );
}

export default App;
