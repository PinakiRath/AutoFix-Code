const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// In-memory storage as fallback
let inMemoryProjects = [];
let inMemoryAttempts = [];
let inMemoryFiles = [];

// DeepSeek API configuration
const deepseekApi = axios.create({
  baseURL: process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com/v1',
  headers: {
    'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
    'Content-Type': 'application/json',
  },
});

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// MongoDB connection (optional - will work without it)
if (process.env.MONGODB_URI) {
  mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('✅ MongoDB connected successfully'))
    .catch(err => {
      console.warn('⚠️  MongoDB connection failed, using in-memory storage:', err.message);
    });
} else {
  console.log('📝 No MongoDB URI provided, using in-memory storage');
}

// MongoDB Schemas
const projectSchema = new mongoose.Schema({
  name: String,
  source_path: String,
  source_type: String,
  language: String,
  framework: String,
  status: String,
  created_at: { type: Date, default: Date.now }
});

const repairAttemptSchema = new mongoose.Schema({
  project_id: String,
  iteration: Number,
  command: String,
  exit_code: Number,
  stdout: String,
  stderr: String,
  error_detected: Boolean,
  ai_prompt: String,
  ai_response: mongoose.Schema.Types.Mixed,
  success: Boolean,
  created_at: { type: Date, default: Date.now }
});

const modifiedFileSchema = new mongoose.Schema({
  attempt_id: String,
  file_path: String,
  old_content: String,
  new_content: String,
  created_at: { type: Date, default: Date.now }
});

const Project = mongoose.model('Project', projectSchema);
const RepairAttempt = mongoose.model('RepairAttempt', repairAttemptSchema);
const ModifiedFile = mongoose.model('ModifiedFile', modifiedFileSchema);

// Routes
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'AutoFix API is running',
    timestamp: new Date().toISOString()
  });
});

// Analyze project endpoint
app.post('/api/analyze-project', async (req, res) => {
  try {
    const { packageJson, files } = req.body;
    
    // Simple analysis based on package.json
    const dependencies = Object.keys(packageJson.dependencies || {});
    const devDependencies = Object.keys(packageJson.devDependencies || {});
    
    let language = 'JavaScript';
    let framework = null;
    let recommendedCommand = 'npm start';
    
    // Detect language
    if (devDependencies.includes('typescript') || dependencies.includes('typescript')) {
      language = 'TypeScript';
    }
    
    // Detect framework
    if (dependencies.includes('react')) {
      framework = 'React';
      recommendedCommand = 'npm run dev';
    } else if (dependencies.includes('vue')) {
      framework = 'Vue';
      recommendedCommand = 'npm run dev';
    } else if (dependencies.includes('angular')) {
      framework = 'Angular';
      recommendedCommand = 'ng serve';
    } else if (dependencies.includes('express')) {
      framework = 'Express';
      recommendedCommand = 'npm start';
    }
    
    // Detect build tool
    if (devDependencies.includes('vite')) {
      recommendedCommand = 'npm run dev';
    } else if (devDependencies.includes('webpack')) {
      recommendedCommand = 'npm run build';
    }
    
    const analysis = {
      language,
      framework,
      dependencies,
      devDependencies,
      recommendedCommand,
      potentialIssues: []
    };
    
    res.json(analysis);
  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({ error: 'Analysis failed' });
  }
});

// AI repair endpoint with DeepSeek integration
app.post('/api/ai-repair', async (req, res) => {
  try {
    const { errorLog, fileTree, relevantFiles, openaiApiKey, iteration } = req.body;
    
    if (!process.env.DEEPSEEK_API_KEY) {
      return res.status(400).json({ 
        error: 'DeepSeek API key not configured',
        fixes: [],
        analysis: 'DeepSeek API key is required for AI repair functionality'
      });
    }
    
    // Prepare the context for DeepSeek
    const filesContext = relevantFiles.map(file => 
      `File: ${file.path}\n\`\`\`\n${file.content}\n\`\`\``
    ).join('\n\n');
    
    const prompt = `You are an expert code repair assistant. Analyze the following error and provide fixes for the code.

ERROR LOG:
${errorLog}

PROJECT STRUCTURE:
${fileTree.slice(0, 50).join('\n')}

RELEVANT FILES:
${filesContext}

TASK:
1. Analyze the error and identify the root cause
2. Provide specific code fixes for the files that need changes
3. Return ONLY a JSON response with this exact structure:

{
  "fixes": [
    {
      "path": "file/path.js",
      "content": "complete fixed file content here",
      "explanation": "brief explanation of what was fixed"
    }
  ],
  "analysis": "detailed analysis of the error and solution"
}

IMPORTANT:
- Only include files that actually need changes in the fixes array
- Provide the complete file content, not just the changed parts
- Focus on fixing the specific error mentioned in the error log
- If no fixes are needed, return an empty fixes array
- Keep explanations concise but informative`;

    console.log('Sending request to DeepSeek API...');
    
    const response = await deepseekApi.post('/chat/completions', {
      model: 'deepseek-coder',
      messages: [
        {
          role: 'system',
          content: 'You are an expert code repair assistant. Always respond with valid JSON only.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.1,
      max_tokens: 4000,
    });

    const aiResponse = response.data.choices[0].message.content;
    console.log('DeepSeek response received');
    
    // Try to parse the JSON response
    let parsedResponse;
    try {
      // Clean the response in case it has markdown formatting
      const cleanedResponse = aiResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      parsedResponse = JSON.parse(cleanedResponse);
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      console.log('Raw AI response:', aiResponse);
      
      // Fallback response
      parsedResponse = {
        fixes: [],
        analysis: `AI analysis completed but response format was invalid. Raw response: ${aiResponse.substring(0, 500)}...`
      };
    }
    
    // Ensure the response has the expected structure
    const result = {
      fixes: Array.isArray(parsedResponse.fixes) ? parsedResponse.fixes : [],
      analysis: parsedResponse.analysis || 'Analysis completed'
    };
    
    console.log(`Returning ${result.fixes.length} fixes`);
    res.json(result);
    
  } catch (error) {
    console.error('AI repair error:', error);
    
    if (error.response) {
      console.error('DeepSeek API error:', error.response.data);
      res.status(500).json({ 
        error: `DeepSeek API error: ${error.response.data.error?.message || 'Unknown error'}`,
        fixes: [],
        analysis: 'Failed to get AI analysis due to API error'
      });
    } else {
      res.status(500).json({ 
        error: 'AI repair failed',
        fixes: [],
        analysis: `Error: ${error.message}`
      });
    }
  }
});

// Project CRUD
app.post('/api/projects', async (req, res) => {
  try {
    const project = new Project(req.body);
    const savedProject = await project.save();
    res.json(savedProject);
  } catch (error) {
    console.error('Save project error:', error);
    res.status(500).json({ error: 'Failed to save project' });
  }
});

app.get('/api/projects', async (req, res) => {
  try {
    const projects = await Project.find().sort({ created_at: -1 });
    res.json(projects);
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({ error: 'Failed to get projects' });
  }
});

// Repair attempts CRUD
app.post('/api/repair-attempts', async (req, res) => {
  try {
    const attempt = new RepairAttempt(req.body);
    const savedAttempt = await attempt.save();
    res.json(savedAttempt);
  } catch (error) {
    console.error('Save repair attempt error:', error);
    res.status(500).json({ error: 'Failed to save repair attempt' });
  }
});

// Modified files CRUD
app.post('/api/modified-files', async (req, res) => {
  try {
    const file = new ModifiedFile(req.body);
    const savedFile = await file.save();
    res.json(savedFile);
  } catch (error) {
    console.error('Save modified file error:', error);
    res.status(500).json({ error: 'Failed to save modified file' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 AutoFix server running on http://localhost:${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
});