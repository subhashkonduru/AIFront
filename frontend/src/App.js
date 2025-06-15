import React, { useState } from 'react';
import {
  Container, AppBar, Toolbar, Typography, Button, TextField,
  Paper, Box, List, ListItem, ListItemIcon, ListItemText,
  CircularProgress, Alert
} from '@mui/material';
import CodeIcon from '@mui/icons-material/Code';
import SecurityIcon from '@mui/icons-material/Security';
import GavelIcon from '@mui/icons-material/Gavel';
import BugReportIcon from '@mui/icons-material/BugReport';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import IconSet from './IconSet';

function App() {
  const [code, setCode] = useState('');
  const [analysisResult, setAnalysisResult] = useState('');
  const [optimizedCode, setOptimizedCode] = useState('');
  const [explanation, setExplanation] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

const handleAnalyzeCode = async () => {
    setAnalysisResult('');
    setOptimizedCode('');
    setExplanation('');
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('https://ai-backend-a0agdpdtfafhfcay.canadacentral-01.azurewebsites.net/analyze-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });

      const data = await response.json();

      if (response.ok) {
        let analysisText = data.analysis || '';

        // Step 1: Remove markdown-style backticks if present
        const cleanedText = analysisText.replace(/^```json\s*|\s*```$/g, '');

        // Step 2: Try to parse it
        try {
          const parsed = JSON.parse(cleanedText);
          console.log("✅ Parsed analysis JSON:", parsed);

          // Step 3: Set state if values are present
          setAnalysisResult(parsed.analysis || '');
          setOptimizedCode(parsed.optimized_code || '');
          setExplanation(parsed.explanation || '');
        } catch (err) {
          console.error("❌ Failed to parse analysis as JSON:", err);
          console.log("Raw analysis text:", analysisText);

          // Fallback to original fields (if parsing fails)
          setAnalysisResult(data.analysis || '');
          setOptimizedCode(data.optimized_code || '');
          setExplanation(data.explanation || '');
        }
      } else {
        setError(data.detail || 'Unknown error from backend');
        setLoading(false);
      }
    } catch (error) {
      console.error('🔥 Error analyzing code:', error);
      setError('Failed to connect to backend');
      setLoading(false);
    }
  };



  return (
    <Container maxWidth="lg">
      <AppBar position="static" color="primary" sx={{ mb: 4 }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            AI Code Optimizer
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Top Feature Description */}
      <Paper elevation={3} sx={{ p: 3, mb: 4, bgcolor: '#e3f2fd' }}>
        <Typography variant="h5" color="primary" gutterBottom>
          Enhanced Capabilities:
        </Typography>
        <Typography sx={{ mb: 2 }}>
          This AI Code Optimizer now provides advanced analysis for:
        </Typography>
        <List dense>
          <ListItem>
            <ListItemIcon><CodeIcon color="primary" /></ListItemIcon>
            <ListItemText primary="Deep Code Optimization: Suggestions for more efficient and readable code." />
          </ListItem>
          <ListItem>
            <ListItemIcon><SecurityIcon color="primary" /></ListItemIcon>
            <ListItemText primary="AI-Powered Security Auditing: Detection of high-risk vulnerabilities." />
          </ListItem>
          <ListItem>
            <ListItemIcon><GavelIcon color="primary" /></ListItemIcon>
            <ListItemText primary="Compliance Enforcement: Checks for GDPR, SOC2, ISO27001." />
          </ListItem>
          <ListItem>
            <ListItemIcon><BugReportIcon color="primary" /></ListItemIcon>
            <ListItemText primary="Bug Identification: Finds potential runtime errors." />
          </ListItem>
        </List>
        <Typography>
          Enter your code below to leverage these features!
        </Typography>
      </Paper>

      {/* Input and Button */}
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          Code Analysis & Optimization
        </Typography>
        <TextField
          label="Enter your code here..."
          multiline
          rows={10}
          value={code}
          onChange={(e) => setCode(e.target.value)}
          variant="outlined"
          fullWidth
          sx={{ mb: 2 }}
        />
        <Button
          variant="contained"
          color="primary"
          onClick={handleAnalyzeCode}
          startIcon={<PlayArrowIcon />}
          disabled={loading}
        >
          Analyze Code
        </Button>

        {loading && (
          <IconSet
            onFinish={() => {
              setLoading(false);
            }}
          />
        )}

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {typeof error === 'object' && error !== null ? (error.msg || JSON.stringify(error, null, 2)) : error}
          </Alert>
        )}
      </Paper>

      {/* Output Section */}
      {!loading && (analysisResult || optimizedCode || explanation) && (
        <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
          <Typography variant="h5" gutterBottom color="primary">
            Analysis Results
          </Typography>

          <Box my={2}>
            <Typography variant="subtitle1" fontWeight="bold">🔍 Analysis</Typography>
            <TextField
              multiline
              fullWidth
              value={analysisResult}
              InputProps={{ readOnly: true }}
              variant="outlined"
              sx={{ mt: 1 }}
            />
          </Box>

          <Box my={2}>
            <Typography variant="subtitle1" fontWeight="bold">🧠 Optimized Code</Typography>
            <TextField
              multiline
              fullWidth
              value={optimizedCode}
              InputProps={{ readOnly: true }}
              variant="outlined"
              sx={{ mt: 1 }}
            />
          </Box>

          <Box my={2}>
            <Typography variant="subtitle1" fontWeight="bold">📘 Explanation</Typography>
            <TextField
              multiline
              fullWidth
              value={explanation}
              InputProps={{ readOnly: true }}
              variant="outlined"
              sx={{ mt: 1 }}
            />
          </Box>
        </Paper>
      )}

    </Container>
  );
}

export default App;
