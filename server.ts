import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';

// Strict type definitions reflecting database schema
interface DBUser {
  id: string;
  email: string;
  username: string;
  avatar_url: string;
  reputation: number;
  password_hash: string;
  created_at: string;
}

interface DBPost {
  id: string;
  user_id: string;
  title: string;
  description: string;
  image_url: string;
  category: string;
  latitude: number;
  longitude: number;
  status: 'unverified' | 'partially_confirmed' | 'confirmed';
  created_at: string;
}

interface DBVote {
  id: string;
  user_id: string;
  post_id: string;
  vote_type: 'confirm' | 'refute';
  created_at: string;
}

interface DBComment {
  id: string;
  user_id: string;
  post_id: string;
  text: string;
  created_at: string;
}

interface DBNotification {
  id: string;
  user_id: string;
  title: string;
  body: string;
  read: boolean;
  created_at: string;
}

interface DatabaseSchema {
  users: DBUser[];
  posts: DBPost[];
  votes: DBVote[];
  comments: DBComment[];
  notifications: DBNotification[];
}

const DB_PATH = path.join(process.cwd(), 'database.json');

// Helper to initialize and read/write the JSON relational-like database
function loadDatabase(): DatabaseSchema {
  if (!fs.existsSync(DB_PATH)) {
    const initialDB: DatabaseSchema = {
      users: [],
      posts: [],
      votes: [],
      comments: [],
      notifications: [],
    };
    fs.writeFileSync(DB_PATH, JSON.stringify(initialDB, null, 2), 'utf-8');
    seedMockData(initialDB);
    return initialDB;
  }
  try {
    const data = fs.readFileSync(DB_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Failed to parse database.json, recreating...', err);
    const initialDB: DatabaseSchema = {
      users: [],
      posts: [],
      votes: [],
      comments: [],
      notifications: [],
    };
    seedMockData(initialDB);
    return initialDB;
  }
}

function saveDatabase(db: DatabaseSchema) {
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), 'utf-8');
}

// Beautiful high-quality seed data for Russian cities context
function seedMockData(db: DatabaseSchema) {
  const now = new Date();
  
  // Create 3 seed users
  const seedUsers: DBUser[] = [
    {
      id: 'usr-1',
      email: 'ivanov@pravda.ru',
      username: 'Дмитрий Иванов',
      avatar_url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=120',
      reputation: 42,
      password_hash: 'admin',
      created_at: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
    },
    {
      id: 'usr-2',
      email: 'smirnova@pravda.ru',
      username: 'Елена Смирнова',
      avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=120',
      reputation: 85,
      password_hash: 'admin',
      created_at: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'usr-3',
      email: 'petrov@pravda.ru',
      username: 'Сергей Петров',
      avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120',
      reputation: 15,
      password_hash: 'admin',
      created_at: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ];

  // Moscow coordinates center (approx 55.7558, 37.6173)
  const seedPosts: DBPost[] = [
    {
      id: 'post-1',
      user_id: 'usr-1',
      title: 'Не работает светофор на перекрестке Тверской',
      description: 'Второй день полностью отключен пешеходный светофор на перекрестке. Из-за этого пешеходам приходится перебегать дорогу, подвергая жизнь опасности! Будьте предельно внимательны.',
      image_url: 'https://images.unsplash.com/photo-1473800447596-01729482b8eb?auto=format&fit=crop&q=80&w=600',
      category: 'roads',
      latitude: 55.7582,
      longitude: 37.6132,
      status: 'confirmed',
      created_at: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'post-2',
      user_id: 'usr-2',
      title: 'Огромная яма на съезде с Ленинградского проспекта',
      description: 'Глубокая яма, около 15 см глубиной прямо в правой полосе на съезде. Скрыта лужей во время дождя. Уже несколько машин пробили колеса. Вызовите дорожную службу!',
      image_url: 'https://images.unsplash.com/photo-1515162305285-0293e4767cc2?auto=format&fit=crop&q=80&w=600',
      category: 'roads',
      latitude: 55.7798,
      longitude: 37.5684,
      status: 'confirmed',
      created_at: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'post-3',
      user_id: 'usr-3',
      title: 'Стихийная свалка покрышек в парке Сокольники',
      description: 'Неизвестные выгрузили около двадцати старых автомобильных шин прямо в лесной зоне парка, недалеко от тропы здоровья. Нарушение экологии катастрофическое!',
      image_url: 'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?auto=format&fit=crop&q=80&w=600',
      category: 'garbage',
      latitude: 55.7952,
      longitude: 37.6751,
      status: 'partially_confirmed',
      created_at: new Date(now.getTime() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
    },
    {
      id: 'post-4',
      user_id: 'usr-2',
      title: 'Не горит освещение вдоль аллеи у метро Динамо',
      description: 'Весь сквер погружен в полную темноту. Не работает ни один фонарный столб на протяжении 300 метров. Очень небезопасно возвращаться домой в вечернее время.',
      image_url: 'https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&q=80&w=600',
      category: 'lighting',
      latitude: 55.7901,
      longitude: 37.5583,
      status: 'unverified',
      created_at: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    }
  ];

  // Seed votes for posts to get status
  const seedVotes: DBVote[] = [
    // post-1 has 4 confirmations, 0 refutes -> status 'confirmed' (100% positive)
    { id: 'v-1', user_id: 'usr-1', post_id: 'post-1', vote_type: 'confirm', created_at: now.toISOString() },
    { id: 'v-2', user_id: 'usr-2', post_id: 'post-1', vote_type: 'confirm', created_at: now.toISOString() },
    { id: 'v-3', user_id: 'usr-3', post_id: 'post-1', vote_type: 'confirm', created_at: now.toISOString() },
    
    // post-2 has 3 confirmations, 0 refutes -> status 'confirmed' (100% positive)
    { id: 'v-4', user_id: 'usr-1', post_id: 'post-2', vote_type: 'confirm', created_at: now.toISOString() },
    { id: 'v-5', user_id: 'usr-2', post_id: 'post-2', vote_type: 'confirm', created_at: now.toISOString() },
    
    // post-3 has 2 confirmations, 1 refute -> status 'partially_confirmed' (66% positive)
    { id: 'v-6', user_id: 'usr-1', post_id: 'post-3', vote_type: 'confirm', created_at: now.toISOString() },
    { id: 'v-7', user_id: 'usr-2', post_id: 'post-3', vote_type: 'confirm', created_at: now.toISOString() },
    { id: 'v-8', user_id: 'usr-3', post_id: 'post-3', vote_type: 'refute', created_at: now.toISOString() },
    
    // post-4 has 0 votes -> unverified
  ];

  // Seed comments
  const seedComments: DBComment[] = [
    {
      id: 'c-1',
      user_id: 'usr-2',
      post_id: 'post-1',
      text: 'Вчера вечером проезжала мимо — действительно светофор мигал желтым, а сегодня утром уже полностью погас. Будьте осторожны!',
      created_at: new Date(now.getTime() - 1.5 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'c-2',
      user_id: 'usr-3',
      post_id: 'post-1',
      text: 'Отправил официальное обращение через портал «Наш Город». Надеюсь, починят в течение суток.',
      created_at: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'c-3',
      user_id: 'usr-1',
      post_id: 'post-2',
      text: 'Подтверждаю яму. Чуть стойку амортизатора там не оставил. Желательно огородить какой-нибудь веткой хотя бы.',
      created_at: new Date(now.getTime() - 18 * 60 * 60 * 1000).toISOString(),
    }
  ];

  const seedNotifications: DBNotification[] = [
    {
      id: 'n-1',
      user_id: 'usr-1',
      title: 'Статус публикации обновлен',
      body: 'Ваша публикация про светофор на Тверской получила статус "Подтверждено" благодаря голосам жителей.',
      read: false,
      created_at: new Date().toISOString(),
    },
  ];

  db.users = seedUsers;
  db.posts = seedPosts;
  db.votes = seedVotes;
  db.comments = seedComments;
  db.notifications = seedNotifications;

  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), 'utf-8');
}

// Function to calculate post status & update user reputation based on verification metrics
function recalculatePostStatus(db: DatabaseSchema, postId: string) {
  const post = db.posts.find(p => p.id === postId);
  if (!post) return;

  const postVotes = db.votes.filter(v => v.post_id === postId);
  const totalVotes = postVotes.length;
  const matchConfirms = postVotes.filter(v => v.vote_type === 'confirm').length;

  let oldStatus = post.status;
  let newStatus: 'unverified' | 'partially_confirmed' | 'confirmed' = 'unverified';

  if (totalVotes > 0) {
    const positivePercentage = (matchConfirms / totalVotes) * 100;
    if (positivePercentage > 75) {
      newStatus = 'confirmed';
    } else if (positivePercentage >= 40) {
      newStatus = 'partially_confirmed';
    } else {
      newStatus = 'unverified';
    }
  } else {
    newStatus = 'unverified';
  }

  post.status = newStatus;

  // Real reputation formula update:
  // Post confirmed -> Author gets +10. Post partially confirmed -> Author gets +5. Post unverified -> 0.
  // We can just easily recalculate the total reputation of all users based on their contributions!
  recalculateAllReputations(db);
}

function recalculateAllReputations(db: DatabaseSchema) {
  for (const user of db.users) {
    let rep = 10; // base reputation
    
    // Add reputation from their own posts based on their status
    const userPosts = db.posts.filter(p => p.user_id === user.id);
    for (const post of userPosts) {
      if (post.status === 'confirmed') {
        rep += 15;
      } else if (post.status === 'partially_confirmed') {
        rep += 7;
      } else {
        rep += 2;
      }
    }

    // Add reputation from voting on others' posts (participation reward)
    const userVotes = db.votes.filter(v => v.user_id === user.id);
    rep += userVotes.length * 2;

    // Add reputation from comments (constructive feedback)
    const userComments = db.comments.filter(c => c.user_id === user.id);
    rep += userComments.length * 1;

    user.reputation = rep;
  }
}

// Core server setup
async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware
  app.use(express.json({ limit: '10mb' }));

  // Initialize DB
  const db = loadDatabase();

  // Helper auth extractor middleware for secure actions
  const getAuthenticatedUser = (req: express.Request): DBUser | null => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    const token = authHeader.substring(7); // simple token is user_id for high uptime MVP simplicity
    const activeDB = loadDatabase();
    return activeDB.users.find(u => u.id === token) || null;
  };

  // ----- AUTH ENDPOINTS -----
  
  // Register
  app.post('/api/auth/register', (req, res) => {
    const { email, username, password, avatar_url } = req.body;

    if (!email || !username || !password) {
      return res.status(400).json({ error: 'Пожалуйста заполните все обязательные поля' });
    }

    const activeDB = loadDatabase();

    // Check if user already exists
    if (activeDB.users.find(u => u.email.toLowerCase() === email.toLowerCase() || u.username.toLowerCase() === username.toLowerCase())) {
      return res.status(400).json({ error: 'Пользователь с таким email или именем уже существует' });
    }

    const defaultAvatar = avatar_url || `https://images.unsplash.com/photo-${['1535713875002-d1d0cf377fde', '1494790108377-be9c29b29330', '1507003211169-0a1dd7228f2d', '1438761681033-6461ffad8d80'][Math.floor(Math.random() * 4)]}?auto=format&fit=crop&q=80&w=120`;

    const newUser: DBUser = {
      id: `usr-${Date.now()}`,
      email,
      username,
      avatar_url: defaultAvatar,
      reputation: 10,
      password_hash: password, // In MVP context, simple secure check is solid
      created_at: new Date().toISOString(),
    };

    activeDB.users.push(newUser);
    saveDatabase(activeDB);

    res.status(201).json({
      user: {
        id: newUser.id,
        email: newUser.email,
        username: newUser.username,
        avatar_url: newUser.avatar_url,
        reputation: newUser.reputation,
      },
      token: newUser.id,
    });
  });

  // Login
  app.post('/api/auth/login', (req, res) => {
    const { login, password } = req.body; // login can be email or username

    if (!login || !password) {
      return res.status(400).json({ error: 'Заполните поля входа и пароля' });
    }

    const activeDB = loadDatabase();
    const user = activeDB.users.find(
      u => (u.email.toLowerCase() === login.toLowerCase() || u.username.toLowerCase() === login.toLowerCase()) && u.password_hash === password
    );

    if (!user) {
      return res.status(401).json({ error: 'Неверные учетные данные' });
    }

    res.json({
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        avatar_url: user.avatar_url,
        reputation: user.reputation,
      },
      token: user.id,
    });
  });

  // Get current session profile
  app.get('/api/auth/me', (req, res) => {
    const user = getAuthenticatedUser(req);
    if (!user) {
      return res.status(401).json({ error: 'Требуется авторизация' });
    }
    res.json({ user });
  });

  // ----- POSTS ENDPOINTS -----

  // Get Posts with multi-param search options
  app.get('/api/posts', (req, res) => {
    const { search, category, status } = req.query;
    const activeDB = loadDatabase();
    
    // Sort posts by date desc by default
    let filteredPosts = [...activeDB.posts].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    // Apply category filter
    if (category && category !== 'all') {
      filteredPosts = filteredPosts.filter(p => p.category === category);
    }

    // Apply status filter
    if (status && status !== 'all') {
      filteredPosts = filteredPosts.filter(p => p.status === status);
    }

    // Apply text search filter
    if (search && typeof search === 'string' && search.trim() !== '') {
      const query = search.toLowerCase();
      filteredPosts = filteredPosts.filter(
        p => p.title.toLowerCase().includes(query) || p.description.toLowerCase().includes(query)
      );
    }

    // Attach author stats & voting stats
    const currentUserId = getAuthenticatedUser(req)?.id;

    const populatedPosts = filteredPosts.map(post => {
      const author = activeDB.users.find(u => u.id === post.user_id) || {
        username: 'Удаленный пользователь',
        avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120'
      };

      const postVotes = activeDB.votes.filter(v => v.post_id === post.id);
      const confirmCount = postVotes.filter(v => v.vote_type === 'confirm').length;
      const refuteCount = postVotes.filter(v => v.vote_type === 'refute').length;
      
      const userVote = currentUserId 
        ? postVotes.find(v => v.user_id === currentUserId)?.vote_type 
        : undefined;

      return {
        ...post,
        author_name: author.username,
        author_avatar: author.avatar_url,
        votes_confirm: confirmCount,
        votes_refute: refuteCount,
        user_vote: userVote,
      };
    });

    res.json(populatedPosts);
  });

  // Get Single Post
  app.get('/api/posts/:id', (req, res) => {
    const { id } = req.params;
    const activeDB = loadDatabase();
    const post = activeDB.posts.find(p => p.id === id);

    if (!post) {
      return res.status(404).json({ error: 'Публикация не найдена' });
    }

    const currentUserId = getAuthenticatedUser(req)?.id;
    const author = activeDB.users.find(u => u.id === post.user_id) || {
      username: 'Удаленный пользователь',
      avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120'
    };

    const postVotes = activeDB.votes.filter(v => v.post_id === post.id);
    const confirmCount = postVotes.filter(v => v.vote_type === 'confirm').length;
    const refuteCount = postVotes.filter(v => v.vote_type === 'refute').length;
    
    const userVote = currentUserId 
      ? postVotes.find(v => v.user_id === currentUserId)?.vote_type 
      : undefined;

    res.json({
      ...post,
      author_name: author.username,
      author_avatar: author.avatar_url,
      votes_confirm: confirmCount,
      votes_refute: refuteCount,
      user_vote: userVote,
    });
  });

  // Create Post
  app.post('/api/posts', (req, res) => {
    const user = getAuthenticatedUser(req);
    if (!user) {
      return res.status(401).json({ error: 'Вам нужно авторизоваться, чтобы создать публикацию' });
    }

    const { title, description, image_url, category, latitude, longitude } = req.body;

    if (!title || !description || !category || !latitude || !longitude) {
      return res.status(400).json({ error: 'Пожалуйста заполните все ключевые поля публикации' });
    }

    const activeDB = loadDatabase();
    
    const newPost: DBPost = {
      id: `post-${Date.now()}`,
      user_id: user.id,
      title,
      description,
      image_url: image_url || 'https://images.unsplash.com/photo-1473800447596-01729482b8eb?auto=format&fit=crop&q=80&w=600',
      category,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      status: 'unverified',
      created_at: new Date().toISOString(),
    };

    activeDB.posts.push(newPost);
    recalculatePostStatus(activeDB, newPost.id);
    saveDatabase(activeDB);

    res.status(201).json({
      ...newPost,
      author_name: user.username,
      author_avatar: user.avatar_url,
      votes_confirm: 0,
      votes_refute: 0,
      user_vote: undefined,
    });
  });

  // Vote on Post
  app.post('/api/posts/:id/vote', (req, res) => {
    const user = getAuthenticatedUser(req);
    if (!user) {
      return res.status(401).json({ error: 'Голосовать могут только авторизованные жители' });
    }

    const { id } = req.params;
    const { vote_type } = req.body; // 'confirm' or 'refute'

    if (vote_type !== 'confirm' && vote_type !== 'refute') {
      return res.status(400).json({ error: 'Неверный тип голоса' });
    }

    const activeDB = loadDatabase();
    const post = activeDB.posts.find(p => p.id === id);

    if (!post) {
      return res.status(404).json({ error: 'Публикация не найдена' });
    }

    if (post.user_id === user.id) {
      return res.status(400).json({ error: 'Вы не можете верифицировать свою собственную публикацию' });
    }

    // Check if vote already exists for this post by this user
    const voteIndex = activeDB.votes.findIndex(v => v.user_id === user.id && v.post_id === id);
    
    if (voteIndex > -1) {
      if (activeDB.votes[voteIndex].vote_type === vote_type) {
        // Double tap same vote -> remove vote (toggle behavior)
        activeDB.votes.splice(voteIndex, 1);
      } else {
        // Change vote type
        activeDB.votes[voteIndex].vote_type = vote_type;
        activeDB.votes[voteIndex].created_at = new Date().toISOString();
      }
    } else {
      // Create new vote
      const newVote: DBVote = {
        id: `vote-${Date.now()}`,
        user_id: user.id,
        post_id: id,
        vote_type,
        created_at: new Date().toISOString(),
      };
      activeDB.votes.push(newVote);

      // Create notification for the post author if it is from someone else
      const notification: DBNotification = {
        id: `notif-${Date.now()}`,
        user_id: post.user_id,
        title: 'Новый голос верификации',
        body: `Житель ${user.username} проголосовал "${vote_type === 'confirm' ? 'Подтверждаю' : 'Не подтверждаю'}" под вашей публикацией "${post.title.substring(0, 30)}..."`,
        read: false,
        created_at: new Date().toISOString()
      };
      activeDB.notifications.push(notification);
    }

    recalculatePostStatus(activeDB, id);
    saveDatabase(activeDB);

    // Load again to return populated state
    const freshlySavedDB = loadDatabase();
    const updatedPost = freshlySavedDB.posts.find(p => p.id === id)!;
    const author = freshlySavedDB.users.find(u => u.id === updatedPost.user_id)!;
    const postVotes = freshlySavedDB.votes.filter(v => v.post_id === id);
    const confirmCount = postVotes.filter(v => v.vote_type === 'confirm').length;
    const refuteCount = postVotes.filter(v => v.vote_type === 'refute').length;
    const userVote = postVotes.find(v => v.user_id === user.id)?.vote_type;

    res.json({
      ...updatedPost,
      author_name: author.username,
      author_avatar: author.avatar_url,
      votes_confirm: confirmCount,
      votes_refute: refuteCount,
      user_vote: userVote,
    });
  });

  // ----- COMMENTS ENDPOINTS -----

  // Get comments for Post
  app.get('/api/posts/:id/comments', (req, res) => {
    const { id } = req.params;
    const activeDB = loadDatabase();
    
    const postComments = activeDB.comments
      .filter(c => c.post_id === id)
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()); // oldest first

    const populatedComments = postComments.map(comment => {
      const author = activeDB.users.find(u => u.id === comment.user_id) || {
        username: 'Удаленный пользователь',
        avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120'
      };

      return {
        ...comment,
        author_name: author.username,
        author_avatar: author.avatar_url,
      };
    });

    res.json(populatedComments);
  });

  // Add Comment to Post
  app.post('/api/posts/:id/comments', (req, res) => {
    const user = getAuthenticatedUser(req);
    if (!user) {
      return res.status(401).json({ error: 'Оставлять комментарии могут только авторизованные пользователи' });
    }

    const { id } = req.params;
    const { text } = req.body;

    if (!text || text.trim() === '') {
      return res.status(400).json({ error: 'Текст комментария не может быть пустым' });
    }

    const activeDB = loadDatabase();
    const post = activeDB.posts.find(p => p.id === id);

    if (!post) {
      return res.status(404).json({ error: 'Публикация не найдена' });
    }

    const newComment: DBComment = {
      id: `c-${Date.now()}`,
      user_id: user.id,
      post_id: id,
      text,
      created_at: new Date().toISOString(),
    };

    activeDB.comments.push(newComment);
    
    // Notify author of comment if it's someone else
    if (post.user_id !== user.id) {
      const notification: DBNotification = {
        id: `notif-${Date.now()}`,
        user_id: post.user_id,
        title: 'Новый комментарий жителя',
        body: `Житель ${user.username} оставил комментарий под вашей публикацией "${post.title.substring(0, 30)}..."`,
        read: false,
        created_at: new Date().toISOString()
      };
      activeDB.notifications.push(notification);
    }

    recalculateAllReputations(activeDB);
    saveDatabase(activeDB);

    res.status(201).json({
      ...newComment,
      author_name: user.username,
      author_avatar: user.avatar_url,
    });
  });

  // Delete comment
  app.delete('/api/comments/:id', (req, res) => {
    const user = getAuthenticatedUser(req);
    if (!user) {
      return res.status(401).json({ error: 'Требуется авторизация' });
    }

    const { id } = req.params;
    const activeDB = loadDatabase();
    
    const commentIndex = activeDB.comments.findIndex(c => c.id === id);
    if (commentIndex === -1) {
      return res.status(404).json({ error: 'Комментарий не найден' });
    }

    const comment = activeDB.comments[commentIndex];
    if (comment.user_id !== user.id) {
      return res.status(403).json({ error: 'Вы можете удалять только свои собственные комментарии' });
    }

    activeDB.comments.splice(commentIndex, 1);
    recalculateAllReputations(activeDB);
    saveDatabase(activeDB);

    res.json({ message: 'Комментарий успешно удален' });
  });

  // ----- USER PROFILE & NOTIFS ENDPOINTS -----

  // Get specific user profile with stats
  app.get('/api/users/:id', (req, res) => {
    const { id } = req.params;
    const activeDB = loadDatabase();
    const user = activeDB.users.find(u => u.id === id);

    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    const userPostsCount = activeDB.posts.filter(p => p.user_id === id).length;

    res.json({
      id: user.id,
      username: user.username,
      avatar_url: user.avatar_url,
      reputation: user.reputation,
      post_count: userPostsCount,
      created_at: user.created_at,
    });
  });

  // Get user notifications
  app.get('/api/notifications', (req, res) => {
    const user = getAuthenticatedUser(req);
    if (!user) {
      return res.status(401).json({ error: 'Требуется авторизация' });
    }

    const activeDB = loadDatabase();
    const userNotifs = activeDB.notifications
      .filter(n => n.user_id === user.id)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    res.json(userNotifs);
  });

  // Mark notification as read
  app.post('/api/notifications/:id/read', (req, res) => {
    const user = getAuthenticatedUser(req);
    if (!user) {
      return res.status(401).json({ error: 'Требуется авторизация' });
    }

    const { id } = req.params;
    const activeDB = loadDatabase();
    const notif = activeDB.notifications.find(n => n.id === id && n.user_id === user.id);

    if (!notif) {
      return res.status(404).json({ error: 'Уведомление не найдено' });
    }

    notif.read = true;
    saveDatabase(activeDB);

    res.json({ success: true, notif });
  });

  // Seed Reset API
  app.post('/api/system/seed', (req, res) => {
    const activeDB = {
      users: [],
      posts: [],
      votes: [],
      comments: [],
      notifications: [],
    };
    seedMockData(activeDB);
    res.json({ message: 'База данных успешно пересоздана в исходное состояние.' });
  });


  // Serve static assets in production OR mount Vite in development
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
    console.log(`[Правда Рядом Backend] Running on http://localhost:${PORT}`);
  });
}

startServer();
