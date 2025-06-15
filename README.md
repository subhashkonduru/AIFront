# AI-Powered Intelligent Code Optimization Suite

This project aims to create a scalable AI-powered code optimization suite that automates debugging, refactoring, performance tuning, and security auditing using multi-agent workflows.

## Technologies Used:
- **FastAPI**: Backend API for code analysis and optimization.
- **React.js**: Interactive frontend for code input and optimization insights.
- **Material-UI (MUI)**: React component library for a modern and responsive UI.
- **Trae AI IDE**: For building and managing multi-agent workflows.
- **Novita.ai**: APIs for code analysis, bug detection, and optimization suggestions.
- **Qdrant**: Vector database for storing and retrieving optimized code snippets.

## Project Structure:

```
.qodo/
backend/
  main.py
  requirements.txt
frontend/
  public/
    index.html
  src/
    App.js
    index.js
README.md
```

## Setup and Installation:

### Backend (FastAPI)
1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Run the FastAPI application:
   ```bash
   uvicorn main:app --reload
   ```

### Frontend (React.js)
1. Navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install dependencies (if not already installed by `create-react-app`):
   ```bash
   npm install
   ```
3. Start the React development server:
   ```bash
   npm start
   ```

## Current Features:
- **Code Analysis & Optimization**: Utilizes Novita.ai to analyze code for optimization, explanation, potential bugs, and security vulnerabilities.
- **Semantic Search**: Stores and retrieves optimized code snippets using Qdrant, allowing for semantic search of past optimizations.
- **Responsive UI**: The frontend features a responsive design with beautified display boxes for analysis results, adapting to different screen sizes.
- **Clear Error Handling**: Provides clear feedback for API errors and connection issues.
- **Interactive Loading State**: Displays an interactive loading animation during code analysis.