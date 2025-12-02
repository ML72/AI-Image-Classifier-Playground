import { useState } from 'react';
import { ThemeProvider, createTheme, useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
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
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  AlertTitle,
  Link,
  CircularProgress,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Divider,
  Drawer,
  IconButton,
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import ImageIcon from '@mui/icons-material/Image';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import KeyIcon from '@mui/icons-material/Key';
import BarChartIcon from '@mui/icons-material/BarChart';
import ErrorIcon from '@mui/icons-material/Error';
import MenuIcon from '@mui/icons-material/Menu';
import { prompts } from './util/prompts';
import { BrowserImageClassifier, ExperimentResults } from './util/browser_classifier';
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
  // Load in test images from public/images folder
  // Use import.meta.env.BASE_URL to handle GitHub Pages base path
  const baseUrl = import.meta.env.BASE_URL;
  const testImages: TestImage[] = [
    // AI images - diffusion models
    ...['diffusion1', 'diffusion2', 'diffusion3', 'diffusion4'].flatMap((type) =>
      Array.from({ length: 10 }, (_, i) => ({
        id: `${type}_${i + 1}`,
        url: `${baseUrl}images/ai/${type}_${i + 1}.jpg`,
        groundTruth: 'ai' as const,
        fileName: `${type}_${i + 1}.jpg`,
      }))
    ),
    // AI images - GAN
    ...Array.from({ length: 10 }, (_, i) => ({
      id: `gan_${i + 1}`,
      url: `${baseUrl}images/ai/gan_${i + 1}.jpg`,
      groundTruth: 'ai' as const,
      fileName: `gan_${i + 1}.jpg`,
    })),
    // Real images - various categories
    ...['animals', 'city', 'food', 'nature', 'people'].flatMap((category) =>
      Array.from({ length: 10 }, (_, i) => ({
        id: `${category}_${i + 1}`,
        url: `${baseUrl}images/real/${category}_${i + 1}.jpg`,
        groundTruth: 'real' as const,
        fileName: `${category}_${i + 1}.jpg`,
      }))
    ),
  ];

  // Initialize state
  const [customPrompt, setCustomPrompt] = useState(prompts.basic);
  const [selectedImages, setSelectedImages] = useState<string[]>(testImages.map((img) => img.id));
  const [filterType, setFilterType] = useState<'all' | 'ai' | 'real'>('all');
  const [openApiKey, setOpenApiKey] = useState('');
  const [apiKeyDialogOpen, setApiKeyDialogOpen] = useState(false);
  const [tempApiKey, setTempApiKey] = useState('');
  const [isRunningExperiment, setIsRunningExperiment] = useState(false);
  const [experimentProgress, setExperimentProgress] = useState({ current: 0, total: 0 });
  const [experimentResults, setExperimentResults] = useState<ExperimentResults | null>(null);
  const [experimentError, setExperimentError] = useState<string | null>(null);
  const [resultsDialogOpen, setResultsDialogOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('md'));

  // Handlers and utilities
  const filteredImages = testImages.filter((img) => {
    if (filterType === 'all') return true;
    return img.groundTruth === filterType;
  });

  const handleResetToBasic = () => {
    setCustomPrompt(prompts.basic);
  };

  const handleResetToDetailed = () => {
    setCustomPrompt(prompts.detailed);
  };

  const handleImageSelect = (imageId: string) => {
    setSelectedImages((prev) =>
      prev.includes(imageId)
        ? prev.filter((id) => id !== imageId)
        : [...prev, imageId]
    );
  };

  const handleRunExperiment = async () => {
    if (!openApiKey || selectedImages.length === 0) return;

    setIsRunningExperiment(true);
    setExperimentError(null);
    setExperimentResults(null);
    setExperimentProgress({ current: 0, total: selectedImages.length });

    try {
      const classifier = new BrowserImageClassifier(openApiKey);
      const selectedTestImages = testImages.filter(img => selectedImages.includes(img.id));

      const results = await classifier.runExperiment(
        selectedTestImages,
        customPrompt,
        1000, // 1 second delay between API calls
        (current, total) => {
          setExperimentProgress({ current, total });
        }
      );

      setExperimentResults(results);
    } catch (error) {
      setExperimentError(error instanceof Error ? error.message : 'An unknown error occurred');
    } finally {
      setIsRunningExperiment(false);
    }
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

  // Main render
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', bgcolor: 'background.default' }}>
        {/* Header */}
        <AppBar position="static" elevation={0} sx={{ bgcolor: 'white', borderBottom: '1px solid #e5e7eb', flexShrink: 0 }}>
          <Toolbar sx={{ py: 1 }}>
            <IconButton
              color="primary"
              aria-label="open drawer"
              edge="start"
              onClick={() => setMobileOpen(true)}
              sx={{ mr: 2, display: { md: 'none' } }}
            >
              <MenuIcon />
            </IconButton>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <ImageIcon sx={{ fontSize: 28, color: 'primary.main' }} />
              <Typography variant="h6" component="div" sx={{ color: 'text.primary', fontWeight: 700 }}>
                AI Image Classifier
              </Typography>
            </Box>
          </Toolbar>
        </AppBar>

        <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          {/* Left Panel - Prompt Editor */}
          {!isMobile && (
            <Box sx={{ 
              width: 400, 
              flexShrink: 0,
              borderRight: '1px solid #e5e7eb',
              bgcolor: 'white',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}>
            <Box sx={{ 
              flex: 1, 
              overflowY: 'auto',
              overflowX: 'hidden',
              p: 3,
              '&::-webkit-scrollbar': {
                width: '8px',
              },
              '&::-webkit-scrollbar-track': {
                background: 'transparent',
              },
              '&::-webkit-scrollbar-thumb': {
                background: '#cbd5e1',
                borderRadius: '10px',
                '&:hover': {
                  background: '#94a3b8',
                },
              },
            }}>
              <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
                Prompt Configuration
              </Typography>

              <Box sx={{ position: 'relative', mb: 2 }}>
                  <TextField
                    multiline
                    rows={16}
                    fullWidth
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    variant="outlined"
                    placeholder="Enter your classification prompt here..."
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        fontFamily: 'monospace',
                        fontSize: '0.875rem',
                        pb: 5,
                      },
                    }}
                  />
                  <Box
                    sx={{
                      position: 'absolute',
                      bottom: 8,
                      right: 8,
                      display: 'flex',
                      gap: 1,
                      zIndex: 1,
                    }}
                  >
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={handleResetToBasic}
                      sx={{
                        fontSize: '0.75rem',
                        py: 0.5,
                        px: 1.5,
                        minWidth: 'auto',
                        textTransform: 'none',
                        bgcolor: 'background.paper',
                        '&:hover': {
                          bgcolor: 'primary.main',
                          color: 'white',
                        },
                      }}
                    >
                      Reset to Basic
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={handleResetToDetailed}
                      sx={{
                        fontSize: '0.75rem',
                        py: 0.5,
                        px: 1.5,
                        minWidth: 'auto',
                        textTransform: 'none',
                        bgcolor: 'background.paper',
                        '&:hover': {
                          bgcolor: 'primary.main',
                          color: 'white',
                        },
                      }}
                    >
                      Reset to Detailed
                    </Button>
                  </Box>
                </Box>

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
                    startIcon={isRunningExperiment ? <CircularProgress size={20} color="inherit" /> : <PlayArrowIcon />}
                    onClick={handleRunExperiment}
                    disabled={selectedImages.length === 0 || !openApiKey || isRunningExperiment}
                  >
                    {isRunningExperiment ? `Processing ${experimentProgress.current}/${experimentProgress.total}...` : 'Run Experiment'}
                  </Button>

                  {/* Progress Bar */}
                  {isRunningExperiment && (
                    <LinearProgress 
                      variant="determinate" 
                      value={(experimentProgress.current / experimentProgress.total) * 100} 
                      sx={{ borderRadius: 1 }}
                    />
                  )}

                  {/* Error Display */}
                  {experimentError && (
                    <Alert severity="error" sx={{ fontSize: '0.875rem' }}>
                      <AlertTitle sx={{ fontSize: '0.875rem', fontWeight: 600 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <ErrorIcon fontSize="small" />
                          Error Running Experiment
                        </Box>
                      </AlertTitle>
                      {experimentError}
                    </Alert>
                  )}

                  {/* Results Summary */}
                  {experimentResults && (
                    <Card variant="outlined" sx={{ p: 2, bgcolor: 'background.default' }}>
                      <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
                        Experiment Results
                      </Typography>

                      <Stack spacing={1.5}>
                        {/* Accuracy */}
                        <Box>
                          <Typography variant="caption" color="text.secondary" display="block">
                            Accuracy
                          </Typography>
                          <Typography variant="h5" sx={{ fontWeight: 700, color: 'primary.main' }}>
                            {(experimentResults.accuracy * 100).toFixed(1)}%
                          </Typography>
                        </Box>

                        <Divider />

                        {/* Stats */}
                        <Box>
                          <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                            <Typography variant="caption" color="text.secondary">Correct</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: 'success.main' }}>
                              {experimentResults.correct}
                            </Typography>
                          </Stack>
                          <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                            <Typography variant="caption" color="text.secondary">Incorrect</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: 'error.main' }}>
                              {experimentResults.incorrect}
                            </Typography>
                          </Stack>
                          {experimentResults.unsure > 0 && (
                            <Stack direction="row" justifyContent="space-between">
                              <Typography variant="caption" color="text.secondary">Unsure</Typography>
                              <Typography variant="body2" sx={{ fontWeight: 600, color: 'warning.main' }}>
                                {experimentResults.unsure}
                              </Typography>
                            </Stack>
                          )}
                        </Box>

                        <Divider />

                        {/* Confusion Matrix Summary */}
                        <Box>
                          <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                            Confusion Matrix
                          </Typography>
                          <Stack spacing={0.5} sx={{ fontSize: '0.75rem' }}>
                            <Stack direction="row" justifyContent="space-between">
                              <Typography variant="caption">True Positive (AI→AI)</Typography>
                              <Typography variant="caption" sx={{ fontWeight: 600 }}>
                                {experimentResults.confusionMatrix.truePositive}
                              </Typography>
                            </Stack>
                            <Stack direction="row" justifyContent="space-between">
                              <Typography variant="caption">True Negative (Real→Real)</Typography>
                              <Typography variant="caption" sx={{ fontWeight: 600 }}>
                                {experimentResults.confusionMatrix.trueNegative}
                              </Typography>
                            </Stack>
                            <Stack direction="row" justifyContent="space-between">
                              <Typography variant="caption">False Positive (Real→AI)</Typography>
                              <Typography variant="caption" sx={{ fontWeight: 600 }}>
                                {experimentResults.confusionMatrix.falsePositive}
                              </Typography>
                            </Stack>
                            <Stack direction="row" justifyContent="space-between">
                              <Typography variant="caption">False Negative (AI→Real)</Typography>
                              <Typography variant="caption" sx={{ fontWeight: 600 }}>
                                {experimentResults.confusionMatrix.falseNegative}
                              </Typography>
                            </Stack>
                          </Stack>
                        </Box>

                        <Button
                          variant="outlined"
                          size="small"
                          fullWidth
                          startIcon={<BarChartIcon />}
                          onClick={() => setResultsDialogOpen(true)}
                          sx={{ mt: 1 }}
                        >
                          View Detailed Results
                        </Button>
                      </Stack>
                    </Card>
                  )}
                </Stack>
              </Box>
            </Box>
          )}

          {/* Mobile Drawer */}
          <Drawer
            anchor="left"
            open={mobileOpen}
            onClose={() => setMobileOpen(false)}
            ModalProps={{
              keepMounted: true,
            }}
            sx={{
              display: { xs: 'block', md: 'none' },
              '& .MuiDrawer-paper': { width: 320, boxSizing: 'border-box' },
            }}
          >
            <Box sx={{ 
              flex: 1, 
              overflowY: 'auto',
              overflowX: 'hidden',
              p: 3,
              '&::-webkit-scrollbar': {
                width: '8px',
              },
              '&::-webkit-scrollbar-track': {
                background: 'transparent',
              },
              '&::-webkit-scrollbar-thumb': {
                background: '#cbd5e1',
                borderRadius: '10px',
                '&:hover': {
                  background: '#94a3b8',
                },
              },
            }}>
              <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
                Prompt Configuration
              </Typography>

              <Box sx={{ position: 'relative', mb: 2 }}>
                  <TextField
                    multiline
                    rows={16}
                    fullWidth
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    variant="outlined"
                    placeholder="Enter your classification prompt here..."
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        fontFamily: 'monospace',
                        fontSize: '0.875rem',
                        pb: 5,
                      },
                    }}
                  />
                  <Box
                    sx={{
                      position: 'absolute',
                      bottom: 8,
                      right: 8,
                      display: 'flex',
                      gap: 1,
                      zIndex: 1,
                    }}
                  >
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={handleResetToBasic}
                      sx={{
                        fontSize: '0.75rem',
                        py: 0.5,
                        px: 1.5,
                        minWidth: 'auto',
                        textTransform: 'none',
                        bgcolor: 'background.paper',
                        '&:hover': {
                          bgcolor: 'primary.main',
                          color: 'white',
                        },
                      }}
                    >
                      Reset to Basic
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={handleResetToDetailed}
                      sx={{
                        fontSize: '0.75rem',
                        py: 0.5,
                        px: 1.5,
                        minWidth: 'auto',
                        textTransform: 'none',
                        bgcolor: 'background.paper',
                        '&:hover': {
                          bgcolor: 'primary.main',
                          color: 'white',
                        },
                      }}
                    >
                      Reset to Detailed
                    </Button>
                  </Box>
                </Box>

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
                    startIcon={isRunningExperiment ? <CircularProgress size={20} color="inherit" /> : <PlayArrowIcon />}
                    onClick={() => {
                      handleRunExperiment();
                      setMobileOpen(false);
                    }}
                    disabled={selectedImages.length === 0 || !openApiKey || isRunningExperiment}
                  >
                    {isRunningExperiment ? `Processing ${experimentProgress.current}/${experimentProgress.total}...` : 'Run Experiment'}
                  </Button>

                  {/* Progress Bar */}
                  {isRunningExperiment && (
                    <LinearProgress 
                      variant="determinate" 
                      value={(experimentProgress.current / experimentProgress.total) * 100} 
                      sx={{ borderRadius: 1 }}
                    />
                  )}

                  {/* Error Display */}
                  {experimentError && (
                    <Alert severity="error" sx={{ fontSize: '0.875rem' }}>
                      <AlertTitle sx={{ fontSize: '0.875rem', fontWeight: 600 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <ErrorIcon fontSize="small" />
                          Error Running Experiment
                        </Box>
                      </AlertTitle>
                      {experimentError}
                    </Alert>
                  )}

                  {/* Results Summary */}
                  {experimentResults && (
                    <Card variant="outlined" sx={{ p: 2, bgcolor: 'background.default' }}>
                      <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
                        Experiment Results
                      </Typography>

                      <Stack spacing={1.5}>
                        {/* Accuracy */}
                        <Box>
                          <Typography variant="caption" color="text.secondary" display="block">
                            Accuracy
                          </Typography>
                          <Typography variant="h5" sx={{ fontWeight: 700, color: 'primary.main' }}>
                            {(experimentResults.accuracy * 100).toFixed(1)}%
                          </Typography>
                        </Box>

                        <Divider />

                        {/* Stats */}
                        <Box>
                          <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                            <Typography variant="caption" color="text.secondary">Correct</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: 'success.main' }}>
                              {experimentResults.correct}
                            </Typography>
                          </Stack>
                          <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                            <Typography variant="caption" color="text.secondary">Incorrect</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: 'error.main' }}>
                              {experimentResults.incorrect}
                            </Typography>
                          </Stack>
                          {experimentResults.unsure > 0 && (
                            <Stack direction="row" justifyContent="space-between">
                              <Typography variant="caption" color="text.secondary">Unsure</Typography>
                              <Typography variant="body2" sx={{ fontWeight: 600, color: 'warning.main' }}>
                                {experimentResults.unsure}
                              </Typography>
                            </Stack>
                          )}
                        </Box>

                        <Divider />

                        {/* Confusion Matrix Summary */}
                        <Box>
                          <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                            Confusion Matrix
                          </Typography>
                          <Stack spacing={0.5} sx={{ fontSize: '0.75rem' }}>
                            <Stack direction="row" justifyContent="space-between">
                              <Typography variant="caption">True Positive (AI→AI)</Typography>
                              <Typography variant="caption" sx={{ fontWeight: 600 }}>
                                {experimentResults.confusionMatrix.truePositive}
                              </Typography>
                            </Stack>
                            <Stack direction="row" justifyContent="space-between">
                              <Typography variant="caption">True Negative (Real→Real)</Typography>
                              <Typography variant="caption" sx={{ fontWeight: 600 }}>
                                {experimentResults.confusionMatrix.trueNegative}
                              </Typography>
                            </Stack>
                            <Stack direction="row" justifyContent="space-between">
                              <Typography variant="caption">False Positive (Real→AI)</Typography>
                              <Typography variant="caption" sx={{ fontWeight: 600 }}>
                                {experimentResults.confusionMatrix.falsePositive}
                              </Typography>
                            </Stack>
                            <Stack direction="row" justifyContent="space-between">
                              <Typography variant="caption">False Negative (AI→Real)</Typography>
                              <Typography variant="caption" sx={{ fontWeight: 600 }}>
                                {experimentResults.confusionMatrix.falseNegative}
                              </Typography>
                            </Stack>
                          </Stack>
                        </Box>

                        <Button
                          variant="outlined"
                          size="small"
                          fullWidth
                          startIcon={<BarChartIcon />}
                          onClick={() => setResultsDialogOpen(true)}
                          sx={{ mt: 1 }}
                        >
                          View Detailed Results
                        </Button>
                      </Stack>
                    </Card>
                  )}
                </Stack>
              </Box>
          </Drawer>

          {/* Right Panel - Image Gallery */}
            <Box sx={{ flex: 1, overflowY: 'auto', bgcolor: 'background.default' }}>
              <Container maxWidth="xl" sx={{ py: { xs: 2, md: 4 }, px: { xs: 2, md: 3 } }}>
                {/* Page Title */}
                <Box sx={{ mb: { xs: 2, md: 4 } }}>
                  <Typography variant="h4" gutterBottom sx={{ fontSize: { xs: '1.75rem', md: '2.125rem' } }}>
                    Image Classification Playground
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Select test images and configure your prompt to classify AI-generated vs. real photographs! All images are processed directly in your browser using your OpenAI API key, with no data sent to any custom server.
                    Note that predictions made in the browser may slightly differ from predictions made directly from the terminal (instructions available in our source code).
                  </Typography>
                </Box>

                <Card sx={{ p: { xs: 2, md: 3 }, mb: { xs: 2, md: 3 } }}>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems={{ xs: 'stretch', sm: 'center' }} justifyContent="space-between">
                  <Stack direction="row" spacing={1} flexWrap="wrap">
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
                  gridTemplateColumns: {
                    xs: 'repeat(auto-fill, minmax(140px, 1fr))',
                    sm: 'repeat(auto-fill, minmax(160px, 1fr))',
                    md: 'repeat(auto-fill, minmax(180px, 1fr))',
                  },
                  gap: { xs: 1.5, md: 2 },
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
              </Container>
            </Box>
          </Box>

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

        {/* Detailed Results Dialog */}
        <Dialog
          open={resultsDialogOpen}
          onClose={() => setResultsDialogOpen(false)}
          maxWidth="lg"
          fullWidth
          scroll="paper"
        >
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <BarChartIcon />
              Detailed Experiment Results
            </Box>
          </DialogTitle>
          <DialogContent>
            {experimentResults && (
              <>
                {/* Summary Stats */}
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Summary
                  </Typography>
                  <Box sx={{ 
                    display: 'grid',
                    gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(4, 1fr)' },
                    gap: { xs: 2, sm: 3 },
                  }}>
                    <Card variant="outlined" sx={{ p: 2 }}>
                      <Typography variant="caption" color="text.secondary">Accuracy</Typography>
                      <Typography variant="h4" sx={{ color: 'primary.main', fontWeight: 700 }}>
                        {(experimentResults.accuracy * 100).toFixed(1)}%
                      </Typography>
                    </Card>
                    <Card variant="outlined" sx={{ p: 2 }}>
                      <Typography variant="caption" color="text.secondary">Total Images</Typography>
                      <Typography variant="h4" sx={{ fontWeight: 700 }}>
                        {experimentResults.totalImages}
                      </Typography>
                    </Card>
                    <Card variant="outlined" sx={{ p: 2 }}>
                      <Typography variant="caption" color="text.secondary">Correct</Typography>
                      <Typography variant="h4" sx={{ color: 'success.main', fontWeight: 700 }}>
                        {experimentResults.correct}
                      </Typography>
                    </Card>
                    <Card variant="outlined" sx={{ p: 2 }}>
                      <Typography variant="caption" color="text.secondary">Incorrect</Typography>
                      <Typography variant="h4" sx={{ color: 'error.main', fontWeight: 700 }}>
                        {experimentResults.incorrect}
                      </Typography>
                    </Card>
                  </Box>
                </Box>

                {/* Confusion Matrix */}
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Confusion Matrix
                  </Typography>
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell></TableCell>
                          <TableCell align="center" sx={{ fontWeight: 600 }}>Predicted AI</TableCell>
                          <TableCell align="center" sx={{ fontWeight: 600 }}>Predicted Real</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 600 }}>Actual AI</TableCell>
                          <TableCell align="center" sx={{ bgcolor: 'success.light', color: 'success.contrastText' }}>
                            {experimentResults.confusionMatrix.truePositive}
                          </TableCell>
                          <TableCell align="center" sx={{ bgcolor: 'error.light', color: 'error.contrastText' }}>
                            {experimentResults.confusionMatrix.falseNegative}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 600 }}>Actual Real</TableCell>
                          <TableCell align="center" sx={{ bgcolor: 'error.light', color: 'error.contrastText' }}>
                            {experimentResults.confusionMatrix.falsePositive}
                          </TableCell>
                          <TableCell align="center" sx={{ bgcolor: 'success.light', color: 'success.contrastText' }}>
                            {experimentResults.confusionMatrix.trueNegative}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>

                {/* Individual Results */}
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Individual Classifications
                  </Typography>
                  
                  {/* Correct Predictions */}
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" sx={{ mb: 1, color: 'success.main', fontWeight: 600 }}>
                      ✓ Correct ({experimentResults.correct})
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {experimentResults.results
                        .filter(r => r.correct && r.prediction !== 'Unsure')
                        .map(result => (
                          <Chip
                            key={result.imageId}
                            label={result.fileName}
                            size="small"
                            color="success"
                            variant="outlined"
                            sx={{ fontSize: '0.75rem' }}
                          />
                        ))}
                    </Box>
                  </Box>

                  {/* Incorrect Predictions */}
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" sx={{ mb: 1, color: 'error.main', fontWeight: 600 }}>
                      ✗ Incorrect ({experimentResults.incorrect})
                    </Typography>
                    <TableContainer component={Paper} variant="outlined">
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Image</TableCell>
                            <TableCell>Ground Truth</TableCell>
                            <TableCell>Prediction</TableCell>
                            <TableCell>Raw Response</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {experimentResults.results
                            .filter(r => !r.correct && r.prediction !== 'Unsure')
                            .map(result => (
                              <TableRow key={result.imageId}>
                                <TableCell>{result.fileName}</TableCell>
                                <TableCell>
                                  <Chip
                                    label={result.groundTruth === 'ai' ? 'AI' : 'Real'}
                                    size="small"
                                    color={result.groundTruth === 'ai' ? 'error' : 'success'}
                                  />
                                </TableCell>
                                <TableCell>
                                  <Chip
                                    label={result.prediction}
                                    size="small"
                                    color={result.prediction === 'Yes' ? 'error' : 'success'}
                                  />
                                </TableCell>
                                <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                                  {result.rawResponse}
                                </TableCell>
                              </TableRow>
                            ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Box>

                  {/* Unsure Predictions */}
                  {experimentResults.unsure > 0 && (
                    <Box>
                      <Typography variant="subtitle2" sx={{ mb: 1, color: 'warning.main', fontWeight: 600 }}>
                        ? Unsure ({experimentResults.unsure})
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {experimentResults.results
                          .filter(r => r.prediction === 'Unsure')
                          .map(result => (
                            <Tooltip key={result.imageId} title={result.error || 'No response'}>
                              <Chip
                                label={result.fileName}
                                size="small"
                                color="warning"
                                variant="outlined"
                                sx={{ fontSize: '0.75rem' }}
                              />
                            </Tooltip>
                          ))}
                      </Box>
                    </Box>
                  )}
                </Box>
              </>
            )}
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button onClick={() => setResultsDialogOpen(false)} variant="contained">
              Close
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </ThemeProvider>
  );
}

export default App;
