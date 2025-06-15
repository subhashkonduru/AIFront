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
      const response = await fetch(`${process.env.REACT_APP_API_URL}/analyze-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });

      const data = await response.json();
      console.log("📦 Full response:", data);

      if (response.ok) {
        const rawAnalysis = data.analysis || '';
        console.log("🧾 Raw analysis field:", rawAnalysis);

        // 🧹 Step 1: Remove markdown formatting
        const cleanedText = rawAnalysis.replace(/^```json\s*|\s*```$/g, '').trim();
        console.log("🧹 Cleaned analysis text:", cleanedText);

        // 🎯 Step 2: Try to extract JSON content directly
        const jsonMatch = cleanedText.match(/{[\s\S]*}/);
        if (jsonMatch) {
          const jsonString = jsonMatch[0].trim();
          console.log("📤 Extracted JSON string:", jsonString);

          try {
            // 🛑 This will fail if `optimized_code` contains backticks
            const parsed = JSON.parse(jsonString);
            console.log("✅ Parsed JSON object:", parsed);

            setAnalysisResult(parsed.analysis || '');
            setOptimizedCode(parsed.optimized_code || '');
            setExplanation(parsed.explanation || '');
          } catch (err) {
            console.error("❌ JSON.parse failed:", err);

            // 🔍 Fallback: Use regex to extract values from cleaned text
            const analysisMatch = cleanedText.match(/"analysis"\s*:\s*"([^"]*)"/s);
            const optimizedCodeMatch = cleanedText.match(/"optimized_code"\s*:\s*`([^`]*)`/s);
            const explanationMatch = cleanedText.match(/"explanation"\s*:\s*"([^"]*)"/s);

            console.log("🪛 Fallback -> Analysis:", analysisMatch?.[1]);
            console.log("🛠️ Fallback -> Optimized Code:", optimizedCodeMatch?.[1]);
            console.log("📘 Fallback -> Explanation:", explanationMatch?.[1]);

            setAnalysisResult(analysisMatch?.[1] || '');
            setOptimizedCode(optimizedCodeMatch?.[1] || '');
            setExplanation(explanationMatch?.[1] || '');
          }
        } else {
          console.warn("⚠️ Could not extract JSON block. Falling back.");
          setAnalysisResult(data.analysis || '');
          setOptimizedCode(data.optimized_code || '');
          setExplanation(data.explanation || '');
        }
      } else {
        console.error("❌ Backend error:", data);
        setError(data.detail || 'Unknown error from backend');
      }
    } catch (error) {
      console.error('🔥 Network or unexpected error:', error);
      setError('Failed to connect to backend');
    } finally {
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

          {analysisResult && (
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
          )}

          {optimizedCode && (
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
          )}

          {explanation && (
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
          )}
        </Paper>
      )}

    </Container>
  );
}

export default App;
