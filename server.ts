import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';
import cors from 'cors';

const app = express();
const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'ai-nepal-secret-2024';
const DB_PATH = path.join(process.cwd(), 'database.json');

// Initialize database if it doesn't exist with more collections
if (!fs.existsSync(DB_PATH)) {
  fs.writeFileSync(DB_PATH, JSON.stringify({ 
    users: [], 
    projects: [], 
    games: [], 
    chat_sessions: [], 
    messages: [],
    ai_models: [
      { id: 'gemini-2-flash', provider: 'Google', name: 'Gemini 2.0 Flash', version: '2.0', logo: 'https://www.gstatic.com/lamda/images/favicon_v2_196x196.png', description: 'Ultra-fast, high-reasoning multimodal model.', status: 'active', createdAt: new Date().toISOString() },
      { id: 'gpt-4o', provider: 'OpenAI', name: 'GPT-4o', version: 'Omni', logo: 'https://openai.com/favicon.ico', description: 'Advanced reasoning and creative writing.', status: 'inactive', createdAt: new Date().toISOString() },
      { id: 'claude-3.5', provider: 'Anthropic', name: 'Claude 3.5 Sonnet', version: '3.5', logo: 'https://www.anthropic.com/favicon.ico', description: 'Superior nuance and coding capabilities.', status: 'inactive', createdAt: new Date().toISOString() },
      { id: 'llama-3', provider: 'Meta', name: 'Llama 3', version: '70B', logo: 'https://meta.ai/favicon.ico', description: 'State-of-the-art open source intelligence.', status: 'inactive', createdAt: new Date().toISOString() }
    ],
    settings: {
      primaryAdmin: 'udayarajkhanal25@gmail.com'
    }
  }, null, 2));
}

app.use(express.json());
app.use(cookieParser());
app.use(cors());

// Helper to read/write DB
const getDB = () => JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
const saveDB = (data: any) => fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));

// Auth Middleware
const authenticate = (req: any, res: any, next: any) => {
  const token = req.cookies.auth_token;
  if (!token) return res.status(401).json({ message: 'Not authenticated' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

const isAdmin = (req: any, res: any, next: any) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Forbidden: Admin access required' });
  }
};

// API Routes
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { email, password, displayName } = req.body;
    const db = getDB();

    if (db.users.find((u: any) => u.email === email)) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const settings = db.settings || { primaryAdmin: 'udayarajkhanal25@gmail.com' };
    const isAdmin = email === settings.primaryAdmin;

    const newUser = {
      uid: Date.now().toString(),
      email,
      password: hashedPassword,
      displayName: displayName || email.split('@')[0],
      role: isAdmin ? 'admin' : 'user',
      subscription: isAdmin ? 'premium' : 'free',
      tokensUsed: 0,
      createdAt: new Date().toISOString()
    };

    db.users.push(newUser);
    saveDB(db);

    const token = jwt.sign({ uid: newUser.uid, role: newUser.role }, JWT_SECRET, { expiresIn: '7d' });
    res.cookie('auth_token', token, { httpOnly: true, secure: true, sameSite: 'strict' });
    
    const { password: _, ...userWithoutPassword } = newUser;
    res.json(userWithoutPassword);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const db = getDB();
    let user = db.users.find((u: any) => u.email === email);

    // Auto-create for the primary admin if they don't exist
    const primaryAdmin = 'udayarajkhanal25@gmail.com';
    const adminPass = 'Udayaraj35@';

    if (!user && email === primaryAdmin && password === adminPass) {
      const hashedPassword = await bcrypt.hash(password, 10);
      user = {
        uid: Date.now().toString(),
        email,
        password: hashedPassword,
        displayName: 'Udaya Raj Khanal',
        role: 'admin',
        subscription: 'premium',
        tokensUsed: 0,
        createdAt: new Date().toISOString()
      };
      db.users.push(user);
      saveDB(db);
    }

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Invalid credentials. Please make sure you signed up first.' });
    }

    const token = jwt.sign({ uid: user.uid, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    res.cookie('auth_token', token, { httpOnly: true, secure: true, sameSite: 'strict' });

    const { password: _, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.get('/api/auth/me', async (req, res) => {
  const token = req.cookies.auth_token;
  if (!token) return res.status(401).json({ message: 'Not authenticated' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const db = getDB();
    const user = db.users.find((u: any) => u.uid === decoded.uid);

    if (!user) return res.status(404).json({ message: 'User not found' });

    const { password: _, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
});

app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('auth_token');
  res.json({ message: 'Logged out' });
});

// Admin Settings
app.get('/api/admin/settings', authenticate, isAdmin, (req, res) => {
  const db = getDB();
  res.json(db.settings || { primaryAdmin: 'udayarajkhanal25@gmail.com' });
});

app.post('/api/admin/settings', authenticate, isAdmin, (req, res) => {
  const { primaryAdmin } = req.body;
  const db = getDB();
  if (!db.settings) db.settings = {};
  if (primaryAdmin) db.settings.primaryAdmin = primaryAdmin;
  saveDB(db);
  res.json(db.settings);
});

// AI Model Orchestration
app.get('/api/admin/models', authenticate, (req, res) => {
  const db = getDB();
  res.json(db.ai_models || []);
});

app.post('/api/admin/models', authenticate, isAdmin, (req, res) => {
  const { provider, name, version, logo, description, status } = req.body;
  const db = getDB();
  const newModel = {
    id: Math.random().toString(36).substr(2, 9),
    provider,
    name,
    version,
    logo,
    description,
    status: status || 'active',
    createdAt: new Date().toISOString()
  };
  if (!db.ai_models) db.ai_models = [];
  db.ai_models.push(newModel);
  saveDB(db);
  res.status(201).json(newModel);
});

app.patch('/api/admin/models/:id', authenticate, isAdmin, (req, res) => {
  const db = getDB();
  const modelIndex = db.ai_models.findIndex((m: any) => m.id === req.params.id);
  if (modelIndex === -1) return res.status(404).json({ error: 'Model not found' });
  
  db.ai_models[modelIndex] = { ...db.ai_models[modelIndex], ...req.body };
  saveDB(db);
  res.json(db.ai_models[modelIndex]);
});

app.delete('/api/admin/models/:id', authenticate, isAdmin, (req, res) => {
  const db = getDB();
  db.ai_models = db.ai_models.filter((m: any) => m.id !== req.params.id);
  saveDB(db);
  res.status(204).send();
});

// Admin endpoints
app.get('/api/admin/users', authenticate, isAdmin, (req, res) => {
  const db = getDB();
  const users = db.users.map(({ password: _, ...u }: any) => u);
  res.json(users);
});

app.post('/api/admin/users/:uid/role', authenticate, isAdmin, (req, res) => {
  const { uid } = req.params;
  const { role } = req.body;

  const db = getDB();
  const userIndex = db.users.findIndex((u: any) => u.uid === uid);
  if (userIndex === -1) return res.status(404).json({ message: 'User not found' });

  db.users[userIndex].role = role;
  saveDB(db);
  res.json({ message: 'Role updated' });
});

// --- Projects ---
app.get('/api/projects', authenticate, (req: any, res) => {
  const db = getDB();
  const userProjects = db.projects.filter((p: any) => p.ownerId === req.user.uid);
  res.json(userProjects);
});

app.post('/api/projects', authenticate, (req: any, res) => {
  const { title, description } = req.body;
  const db = getDB();
  const newProject = {
    id: Math.random().toString(36).substr(2, 9),
    title,
    description,
    ownerId: req.user.uid,
    createdAt: new Date().toISOString(),
    itemCount: 0
  };
  db.projects.push(newProject);
  saveDB(db);
  res.status(201).json(newProject);
});

app.delete('/api/projects/:id', authenticate, (req: any, res) => {
  const db = getDB();
  const index = db.projects.findIndex((p: any) => p.id === req.params.id && p.ownerId === req.user.uid);
  if (index === -1) return res.status(404).json({ error: 'Project not found' });
  
  db.projects.splice(index, 1);
  saveDB(db);
  res.status(204).send();
});

// --- Games ---
app.get('/api/games', authenticate, (req: any, res) => {
  const db = getDB();
  const userGames = db.games.filter((g: any) => g.ownerId === req.user.uid);
  res.json(userGames);
});

app.post('/api/games', authenticate, (req: any, res) => {
  const { title, description, category } = req.body;
  const db = getDB();
  const newGame = {
    id: Math.random().toString(36).substr(2, 9),
    title,
    description,
    category,
    ownerId: req.user.uid,
    createdAt: new Date().toISOString(),
    stats: { players: 0, rating: 0 }
  };
  db.games.push(newGame);
  saveDB(db);
  res.status(201).json(newGame);
});

// --- Chat ---
app.get('/api/chat/sessions', authenticate, (req: any, res) => {
  const db = getDB();
  const sessions = db.chat_sessions.filter((s: any) => s.userId === req.user.uid);
  res.json(sessions);
});

app.get('/api/chat/sessions/:id/messages', authenticate, (req: any, res) => {
  const db = getDB();
  const messages = db.messages.filter((m: any) => m.sessionId === req.params.id);
  res.json(messages);
});

app.post('/api/chat/sessions', authenticate, (req: any, res) => {
  const { title } = req.body;
  const db = getDB();
  const newSession = {
    id: Math.random().toString(36).substr(2, 9),
    userId: req.user.uid,
    title: title || 'New Chat',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  db.chat_sessions.push(newSession);
  saveDB(db);
  res.status(201).json(newSession);
});

app.patch('/api/chat/sessions/:id', authenticate, (req: any, res) => {
  const { title } = req.body;
  const db = getDB();
  const session = db.chat_sessions.find((s: any) => s.id === req.params.id && s.userId === req.user.uid);
  if (!session) return res.status(404).json({ error: 'Session not found' });
  
  if (title) session.title = title;
  session.updatedAt = new Date().toISOString();
  saveDB(db);
  res.json(session);
});

app.post('/api/chat/sessions/:id/messages', authenticate, (req: any, res) => {
  const { role, content } = req.body;
  const db = getDB();
  const newMessage = {
    id: Math.random().toString(36).substr(2, 9),
    sessionId: req.params.id,
    role,
    content,
    createdAt: new Date().toISOString()
  };
  db.messages.push(newMessage);
  
  // Update session updatedAt
  const session = db.chat_sessions.find((s: any) => s.id === req.params.id);
  if (session) session.updatedAt = new Date().toISOString();
  
  saveDB(db);
  res.status(201).json(newMessage);
});

// Profile Update
app.patch('/api/auth/profile', authenticate, (req: any, res) => {
  const { displayName, photoURL } = req.body;
  const db = getDB();
  const user = db.users.find((u: any) => u.uid === req.user.uid);
  if (!user) return res.status(404).json({ error: 'User not found' });
  
  if (displayName) user.displayName = displayName;
  if (photoURL) user.photoURL = photoURL;
  
  saveDB(db);
  const { password: _, ...userWithoutPassword } = user;
  res.json(userWithoutPassword);
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
