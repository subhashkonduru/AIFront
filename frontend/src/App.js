import React, { useState } from 'react';
import {
  Container,
  AppBar,
  Toolbar,
  Typography,
  Button,
  TextField,
  Paper,

  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Alert
} from '@mui/material';

import CodeIcon from '@mui/icons-material/Code';
import SecurityIcon from '@mui/icons-material/Security';
import GavelIcon from '@mui/icons-material/Gavel';
import BugReportIcon from '@mui/icons-material/BugReport';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';

import IconSet from './IconSet';
import AnalysisDisplay from './AnalysisDisplay';

function App() {
  const [code, setCode] = useState('');
  const [analysisResult, setAnalysisResult] = useState('');
  const [optimizedCode, setOptimizedCode] = useState('');
  const [explanation, setExplanation] = useState('');
  const [executionTime, setExecutionTime] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleAnalyzeCode = async () => {
    setAnalysisResult('');
    setOptimizedCode('');
    setExplanation('');
    setExecutionTime(0);
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
        try {
          let analysisContent = data.analysis;

          // Check if the analysis content is a markdown code block and extract the JSON
          const jsonBlockRegex = /```json\n([\s\S]*?)\n```/;
          const match = analysisContent.match(jsonBlockRegex);

          if (match && match[1]) {
            analysisContent = match[1];
          }

          const parsedAnalysis = JSON.parse(analysisContent);
          setAnalysisResult(parsedAnalysis.analysis || '');
          setOptimizedCode(parsedAnalysis.optimized_code || '');
          setExplanation(parsedAnalysis.explanation || '');
          setExecutionTime(data.execution_time || 0);
        } catch (parseError) {
          console.error('🔥 Error parsing analysis JSON:', parseError);
          // Fallback to display raw analysis content if parsing fails
          setAnalysisResult(data.analysis || '');
          setOptimizedCode('');
          setExplanation('');
          setExecutionTime(0);
        }
      } else {
        setError(data.detail || 'Unknown error from backend');
        setLoading(false);
      }
    } catch (err) {
      console.error('🔥 Error analyzing code:', err);
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
            <ListItemText primary="Deep Code Optimization" />
          </ListItem>
          <ListItem>
            <ListItemIcon><SecurityIcon color="primary" /></ListItemIcon>
            <ListItemText primary="AI-Powered Security Auditing" />
          </ListItem>
          <ListItem>
            <ListItemIcon><GavelIcon color="primary" /></ListItemIcon>
            <ListItemText primary="Compliance Enforcement" />
          </ListItem>
          <ListItem>
            <ListItemIcon><BugReportIcon color="primary" /></ListItemIcon>
            <ListItemText primary="Bug Identification" />
          </ListItem>
        </List>
        <Typography>
          Enter your code below to leverage these features!
        </Typography>
      </Paper>

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
            {typeof error === 'object' && error !== null
              ? (error.msg || JSON.stringify(error, null, 2))
              : error}
          </Alert>
        )}
      </Paper>

      {!loading && (analysisResult || optimizedCode || explanation || executionTime) && (
        <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
          <Typography variant="h5" gutterBottom color="primary">
            Analysis Results
          </Typography>

          <AnalysisDisplay
            analysis={analysisResult}
            optimizedCode={optimizedCode}
            explanation={explanation}
            executionTime={executionTime}
          />
        </Paper>
      )}
    </Container>
  );
}

export default App;
