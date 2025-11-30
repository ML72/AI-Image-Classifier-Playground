import { useState, ChangeEvent } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import {
  Container,
  AppBar,
  Toolbar,
  Typography,
  Box,
  Paper,
  Button,
  Card,
  CardContent,
  CardActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Alert,
  CircularProgress,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import ImageIcon from '@mui/icons-material/Image';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

interface ClassificationResult {
  prediction: string;
  promptType: string;
  imageName: string;
}

function App() {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [promptType, setPromptType] = useState<'basic' | 'detailed'>('basic');
  const [result, setResult] = useState<ClassificationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const handleImageSelect = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      setResult(null);
      setError('');
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePromptTypeChange = (event: SelectChangeEvent) => {
    setPromptType(event.target.value as 'basic' | 'detailed');
  };

  const handleClassify = async () => {
    if (!selectedImage) {
      setError('Please select an image first');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      // TODO: Implement API call to backend for image classification
      // For now, this is a placeholder
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setResult({
        prediction: 'Yes',
        promptType,
        imageName: selectedImage.name,
      });
    } catch (err) {
      setError('Failed to classify image. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ flexGrow: 1 }}>
        <AppBar position="static">
          <Toolbar>
            <ImageIcon sx={{ mr: 2 }} />
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              AI Image Classifier
            </Typography>
          </Toolbar>
        </AppBar>

        <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
          <Paper elevation={3} sx={{ p: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom>
              Detect AI-Generated Images
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              Upload an image to determine if it's AI-generated or a real photograph using GPT-4o Vision.
            </Typography>

            <Box sx={{ mt: 3, mb: 3 }}>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel id="prompt-type-label">Prompt Type</InputLabel>
                <Select
                  labelId="prompt-type-label"
                  id="prompt-type"
                  value={promptType}
                  label="Prompt Type"
                  onChange={handlePromptTypeChange}
                >
                  <MenuItem value="basic">Basic</MenuItem>
                  <MenuItem value="detailed">Detailed</MenuItem>
                </Select>
              </FormControl>

              <Button
                component="label"
                variant="contained"
                startIcon={<CloudUploadIcon />}
                fullWidth
                size="large"
              >
                Upload Image
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handleImageSelect}
                />
              </Button>
            </Box>

            {imagePreview && (
              <Card sx={{ mt: 3, mb: 3 }}>
                <Box
                  component="img"
                  sx={{
                    width: '100%',
                    maxHeight: 400,
                    objectFit: 'contain',
                  }}
                  src={imagePreview}
                  alt="Preview"
                />
                <CardContent>
                  <Typography variant="body2" color="text.secondary">
                    {selectedImage?.name}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                    onClick={handleClassify}
                    disabled={loading}
                  >
                    {loading ? <CircularProgress size={24} /> : 'Classify Image'}
                  </Button>
                </CardActions>
              </Card>
            )}

            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}

            {result && (
              <Alert
                severity={result.prediction === 'Yes' ? 'warning' : 'success'}
                sx={{ mt: 2 }}
              >
                <Typography variant="h6">
                  {result.prediction === 'Yes'
                    ? '🤖 AI-Generated'
                    : '📸 Real Photograph'}
                </Typography>
                <Typography variant="body2">
                  Prompt type: {result.promptType}
                </Typography>
              </Alert>
            )}
          </Paper>
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default App;
