# AutoFix-Code 🔧

**AI-Powered Code Repair System for JavaScript and TypeScript Projects**

AutoFix-Code is an intelligent code repair tool that uses DeepSeek's advanced AI models to automatically analyze and fix errors in your JavaScript and TypeScript projects. Simply paste your error logs, and watch as AI provides targeted fixes for your code.

![AutoFix-Code Demo](https://img.shields.io/badge/Status-Active-brightgreen) ![License](https://img.shields.io/badge/License-MIT-blue) ![Node](https://img.shields.io/badge/Node.js-18+-green) ![React](https://img.shields.io/badge/React-18+-blue)

## ✨ Features

### 🤖 AI-Powered Repair
- **DeepSeek Coder Integration**: Leverages state-of-the-art AI for intelligent code analysis
- **Context-Aware Fixes**: Analyzes your entire project structure for accurate repairs
- **Multi-Iteration Repair**: Automatically runs multiple repair cycles until issues are resolved
- **Smart File Detection**: Identifies relevant files based on error context

### 🎯 Project Analysis
- **Automatic Detection**: Identifies language, framework, and build tools
- **File System Access**: Direct integration with your local project files
- **Demo Mode**: Test functionality without file system access
- **Project Structure Mapping**: Comprehensive analysis of your codebase

### 🛠️ Developer Experience
- **Sample Error Library**: Pre-built common errors for testing
- **Real-Time Progress**: Live updates during the repair process
- **Before/After Comparison**: Visual diff of all changes made
- **Copy-to-Clipboard**: Easy sharing of fixes and error logs

### 📊 Data Management
- **MongoDB Integration**: Persistent storage of projects and repair attempts
- **Repair History**: Track all repair sessions and their outcomes
- **File Modification Tracking**: Complete audit trail of changes

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ 
- **MongoDB** (local or Atlas)
- **DeepSeek API Key** ([Get one here](https://platform.deepseek.com/))
- **Modern Browser** (Chrome/Edge recommended for file system access)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/PinakiRath/AutoFix-Code.git
   cd autofix-code
   ```

2. **Install dependencies**
   ```bash
   # Install frontend dependencies
   npm install
   
   # Install backend dependencies
   cd server
   npm install
   cd ..
   ```

3. **Configure environment variables**
   
   Create `server/.env`:
   ```env
   # Database
   MONGODB_URI=mongodb://localhost:27017/autofix
   # Or use MongoDB Atlas:
   # MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/autofix
   
   # Server
   PORT=3001
   NODE_ENV=development
   
   # DeepSeek API
   DEEPSEEK_API_KEY=your-deepseek-api-key-here
   DEEPSEEK_BASE_URL=https://api.deepseek.com/v1
   ```

4. **Start the application**
   ```bash
   # Terminal 1: Start backend server
   cd server
   npm run dev
   
   # Terminal 2: Start frontend (in project root)
   npm run dev
   ```

5. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3001

## 📖 Usage Guide

### Getting Started

1. **Select Your Project**
   - **Option A**: Click "Select Directory" to choose a local project folder
   - **Option B**: Click "Try Demo Project" to test with a sample React project

2. **Analyze Your Project**
   - AutoFix automatically detects your project's language, framework, and dependencies
   - Review the analysis results to ensure accuracy

3. **Submit Error Logs**
   - Use one of the provided sample errors for testing
   - Or paste your own build errors, runtime errors, or test failures
   - Click "Start Auto-Repair" to begin the AI analysis

4. **Review AI Fixes**
   - Watch real-time progress as AI analyzes your code
   - Review suggested fixes and explanations
   - See before/after comparisons for all modified files

### Sample Error Types Supported

- **TypeScript Type Errors**: Incorrect type assignments, missing types
- **React Hook Errors**: Invalid hook usage, dependency issues
- **Import/Export Errors**: Missing modules, incorrect paths
- **Build Tool Errors**: Vite, Webpack, and other bundler issues
- **Runtime Errors**: Null reference, undefined variables
- **Linting Errors**: ESLint rule violations

### Project Structure Support

AutoFix-Code works with various project types:

- **React** (Create React App, Vite, Next.js)
- **Vue** (Vue CLI, Nuxt.js)
- **Angular** (Angular CLI)
- **Node.js** (Express, Fastify)
- **TypeScript** (Any TS project)
- **Vanilla JavaScript** (ES6+)

## 🏗️ Architecture

### Frontend (React + TypeScript + Vite)
```
src/
├── components/          # React components
│   ├── ProjectInput.tsx    # Project selection
│   ├── ErrorInput.tsx      # Error log input
│   ├── SampleErrors.tsx    # Sample error templates
│   ├── AnalysisDisplay.tsx # Project analysis results
│   ├── RepairProgress.tsx  # Real-time progress
│   └── FixedFiles.tsx      # File diff display
├── lib/                 # Utilities and services
│   ├── api.ts             # API client
│   ├── api-config.ts      # API configuration
│   └── fileSystem.ts      # File system operations
├── types/               # TypeScript definitions
└── App.tsx             # Main application
```

### Backend (Node.js + Express + MongoDB)
```
server/
├── index.js            # Main server file
├── package.json        # Dependencies
└── .env               # Environment variables

API Endpoints:
├── GET  /api/health           # Health check
├── POST /api/analyze-project  # Project analysis
├── POST /api/ai-repair        # AI code repair
├── POST /api/projects         # Save project
├── POST /api/repair-attempts  # Save repair attempt
└── POST /api/modified-files   # Save file changes
```

### Database Schema (MongoDB)
```javascript
// Projects Collection
{
  name: String,
  source_path: String,
  source_type: String,
  language: String,
  framework: String,
  status: String,
  created_at: Date
}

// Repair Attempts Collection
{
  project_id: String,
  iteration: Number,
  command: String,
  stderr: String,
  error_detected: Boolean,
  ai_response: Object,
  success: Boolean,
  created_at: Date
}

// Modified Files Collection
{
  attempt_id: String,
  file_path: String,
  old_content: String,
  new_content: String,
  created_at: Date
}
```

## 🔧 Configuration

### DeepSeek API Configuration

AutoFix-Code uses DeepSeek's Coder model for optimal code repair results:

```javascript
// Default configuration
{
  model: 'deepseek-coder',
  temperature: 0.1,        // Low temperature for consistent code fixes
  max_tokens: 4000,        // Sufficient for complex repairs
  baseURL: 'https://api.deepseek.com/v1'
}
```

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/autofix` |
| `PORT` | Server port | `3001` |
| `NODE_ENV` | Environment mode | `development` |
| `DEEPSEEK_API_KEY` | Your DeepSeek API key | Required |
| `DEEPSEEK_BASE_URL` | DeepSeek API endpoint | `https://api.deepseek.com/v1` |

### Frontend Configuration

Create `.env` in the project root:
```env
VITE_API_URL=http://localhost:3001/api
```

## 🧪 Testing

### Manual Testing

1. **Start the application** following the Quick Start guide
2. **Use Demo Project** to test without file system access
3. **Try Sample Errors** provided in the interface
4. **Verify AI Responses** by checking the generated fixes

### API Testing

Test the backend endpoints:

```bash
# Health check
curl http://localhost:3001/api/health

# Test project analysis
curl -X POST http://localhost:3001/api/analyze-project \
  -H "Content-Type: application/json" \
  -d '{"packageJson": {"name": "test"}, "files": ["src/App.js"]}'
```

## 🚀 Deployment

### Frontend Deployment (Vercel/Netlify)

1. **Build the frontend**
   ```bash
   npm run build
   ```

2. **Deploy to Vercel**
   ```bash
   npm install -g vercel
   vercel --prod
   ```

3. **Set environment variables**
   ```env
   VITE_API_URL=https://your-backend-url.com/api
   ```

### Backend Deployment (Railway/Render/Heroku)

1. **Prepare for deployment**
   ```bash
   cd server
   npm run build  # If using TypeScript
   ```

2. **Set environment variables** on your hosting platform:
   ```env
   MONGODB_URI=your-mongodb-atlas-connection-string
   DEEPSEEK_API_KEY=your-deepseek-api-key
   NODE_ENV=production
   PORT=3001
   ```

3. **Deploy using your preferred platform**

## 🤝 Contributing

We welcome contributions! Here's how to get started:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes**
4. **Add tests** if applicable
5. **Commit your changes**
   ```bash
   git commit -m 'Add amazing feature'
   ```
6. **Push to the branch**
   ```bash
   git push origin feature/amazing-feature
   ```
7. **Open a Pull Request**

### Development Guidelines

- Follow TypeScript best practices
- Use meaningful commit messages
- Add JSDoc comments for functions
- Test your changes thoroughly
- Update documentation as needed

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **DeepSeek** for providing excellent AI models for code analysis
- **MongoDB** for reliable data storage
- **Vite** for fast development experience
- **React** for the user interface framework

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/autofix-code/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/autofix-code/discussions)
- **Email**: support@autofix-code.com

## 🔮 Roadmap

- [ ] **VS Code Extension**: Direct integration with VS Code
- [ ] **GitHub Integration**: Automatic PR creation with fixes
- [ ] **More AI Models**: Support for Claude, GPT-4, and others
- [ ] **Team Features**: Shared repair sessions and collaboration
- [ ] **Custom Rules**: User-defined repair patterns
- [ ] **Performance Metrics**: Detailed analytics and reporting

---

**Made with ❤️ by developers, for developers**

*AutoFix-Code - Because life's too short for manual debugging!*