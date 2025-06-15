import React, { useState } from 'react';
import { Container, AppBar, Toolbar, Typography, Button, TextField, Paper, Box, List, ListItem, ListItemIcon, ListItemText, CircularProgress, Alert } from '@mui/material';
import CodeIcon from '@mui/icons-material/Code';
import SecurityIcon from '@mui/icons-material/Security';
import GavelIcon from '@mui/icons-material/Gavel';
import BugReportIcon from '@mui/icons-material/BugReport';
import SearchIcon from '@mui/icons-material/Search';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import SaveIcon from '@mui/icons-material/Save';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ReactMarkdown from 'react-markdown';

function App() {
  const [code, setCode] = useState('');
  const [analysisResult, setAnalysisResult] = useState(null);
  const [searchResult, setSearchResult] = useState(null);
  const [optimizedCode, setOptimizedCode] = useState('');
  const [explanation, setExplanation] = useState('');
  const [embedding, setEmbedding] = useState([]);
  const [queryEmbedding, setQueryEmbedding] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleAnalyzeCode = async () => {
    setLoading(true);
    setError(null);
    setAnalysisResult(null);
    setOptimizedCode('');
    setExplanation('');
    setEmbedding([]);

    try {
      const response = await fetch('http://localhost:8000/analyze-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      });
      const data = await response.json();
      if (response.ok) {
        setAnalysisResult(data);
        setOptimizedCode(data.optimized_code || '');
        setExplanation(data.explanation || '');
        // Assuming embedding is part of the analysis result if needed for storage
        // setEmbedding(data.embedding || []);
      } else {
        setError(data.detail || 'An unknown error occurred during analysis.');
      }
    } catch (error) {
      console.error('Error analyzing code:', error);
      setError('Failed to connect to the backend. Please ensure it is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleStoreSnippet = async () => {
    try {
      const response = await fetch('http://localhost:8000/store-snippet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code: optimizedCode, explanation, embedding }),
      });
      const data = await response.json();
      if (response.ok) {
        alert(data.message);
      } else {
        alert(data.detail || 'Failed to store snippet.');
      }
    } catch (error) {
      console.error('Error storing snippet:', error);
      alert('Failed to store snippet.');
    }
  };

  const handleSearchSnippets = async () => {
    setLoading(true);
    setError(null);
    setSearchResult(null);
    try {
      const response = await fetch('http://localhost:8000/search-snippets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: queryEmbedding }),
      });
      const data = await response.json();
      if (response.ok) {
        setSearchResult(data);
      } else {
        setError(data.detail || 'An unknown error occurred during search.');
      }
    } catch (error) {
      console.error('Error searching snippets:', error);
      setError('Failed to connect to the backend for search. Please ensure it is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="lg">
      <AppBar position="static" color="primary" sx={{ mb: 4 }}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            AI Code Optimizer
          </Typography>
        </Toolbar>
      </AppBar>

      <Paper elevation={3} sx={{ p: 3, mb: 4, bgcolor: '#e3f2fd' }}>
        <Typography variant="h5" component="h2" gutterBottom color="primary">
          Enhanced Capabilities:
        </Typography>
        <Typography variant="body1" sx={{ mb: 2 }}>
          This AI Code Optimizer now provides advanced analysis for:
        </Typography>
        <List dense>
          <ListItem>
            <ListItemIcon><CodeIcon color="primary" /></ListItemIcon>
            <ListItemText primary="Deep Code Optimization: Suggestions for more efficient and readable code." />
          </ListItem>
          <ListItem>
            <ListItemIcon><SecurityIcon color="primary" /></ListItemIcon>
            <ListItemText primary="AI-Powered Security Auditing: Detection of high-risk vulnerabilities like SQL Injection, XSS, and misconfigurations." />
          </ListItem>
          <ListItem>
            <ListItemIcon><GavelIcon color="primary" /></ListItemIcon>
            <ListItemText primary="Compliance Enforcement: Analysis for adherence to GDPR, SOC2, and ISO27001 principles." />
          </ListItem>
          <ListItem>
            <ListItemIcon><BugReportIcon color="primary" /></ListItemIcon>
            <ListItemText primary="Bug Identification: Pinpointing potential errors and issues in your code." />
          </ListItem>
        </List>
        <Typography variant="body1">
          Simply enter your code below to leverage these powerful features!
        </Typography>
      </Paper>

      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h5" component="h2" gutterBottom>
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
          {loading ? <CircularProgress size={24} color="inherit" /> : 'Analyze Code'}
        </Button>

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {typeof error === 'object' && error !== null ? (error.msg || JSON.stringify(error, null, 2)) : error}
          </Alert>
        )}

        {analysisResult && (
          <Box sx={{ mt: 3, p: 2, bgcolor: '#f5f5f5', borderRadius: '4px', border: '1px solid #eee' }}>
            <Typography variant="h6" gutterBottom>
              Analysis Result:
            </Typography>
            <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all', backgroundColor: '#e9e9e9', padding: '10px', borderRadius: '4px', overflowX: 'auto' }}>
              {analysisResult && analysisResult.analysis && (
                <ReactMarkdown>{analysisResult.analysis}</ReactMarkdown>
              )}
            </div>
            {optimizedCode && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Optimized Code:
                </Typography>
                <pre style={{ backgroundColor: '#e9e9e9', padding: '10px', borderRadius: '4px', overflowX: 'auto' }}>{optimizedCode}</pre>
              </Box>
            )}
            {explanation && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Explanation:
                </Typography>
                <Typography variant="body1">{explanation}</Typography>
                <Button
                  variant="contained"
                  color="success"
                  onClick={handleStoreSnippet}
                  startIcon={<SaveIcon />}
                  sx={{ mt: 2 }}
                >
                  Store Optimized Snippet
                </Button>
              </Box>
            )}
          </Box>
        )}
      </Paper>

      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h5" component="h2" gutterBottom>
          Semantic Code Retrieval
        </Typography>
        <TextField
          label="Enter your search query here..."
          multiline
          rows={4}
          value={queryEmbedding}
          onChange={(e) => setQueryEmbedding(e.target.value)}
          variant="outlined"
          fullWidth
          sx={{ mb: 2 }}
        />
        <Button
          variant="contained"
          color="primary"
          onClick={handleSearchSnippets}
          startIcon={<SearchIcon />}
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : 'Search Snippets'}
        </Button>

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {typeof error === 'object' && error !== null ? (error.msg || JSON.stringify(error, null, 2)) : error}
          </Alert>
        )}

        {searchResult && (
          <Box sx={{ mt: 3, p: 2, bgcolor: '#f5f5f5', borderRadius: '4px', border: '1px solid #eee' }}>
            <Typography variant="h6" gutterBottom>
              Search Result:
            </Typography>
            <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all', backgroundColor: '#e9e9e9', padding: '10px', borderRadius: '4px' }}>
              {typeof searchResult === 'object' && searchResult !== null ? (
                <ReactMarkdown>{JSON.stringify(searchResult, null, 2)}</ReactMarkdown>
              ) : (
                searchResult
              )}
            </div>
          </Box>
        )}
      </Paper>

      <Paper elevation={3} sx={{ p: 3, mb: 4, bgcolor: '#fff3e0' }}>
        <Typography variant="h5" component="h2" gutterBottom color="secondary">
          Performance Dashboard & Compliance Findings
        </Typography>
        <List dense>
          <ListItem>
            <ListItemIcon><DashboardIcon color="secondary" /></ListItemIcon>
            <ListItemText primary="Detailed metrics on code performance and efficiency."
            />
          </ListItem>
          <ListItem>
            <ListItemIcon><GavelIcon color="secondary" /></ListItemIcon>
            <ListItemText primary="Comprehensive reports on compliance with GDPR, SOC2, and ISO27001."
            />
          </ListItem>
        </List>
        <Typography variant="body1">
          (This section is a placeholder for future integration with real-time dashboards and compliance engines.)
        </Typography>
      </Paper>
    </Container>
  );
}

export default App;