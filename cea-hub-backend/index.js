// =========================================================
//  MODULE IMPORTS (ES Module Syntax)
// =========================================================
import 'dotenv/config'; // Loads .env variables automatically
import express from 'express';
import { createClient } from '@supabase/supabase-js';
import cors from 'cors';
import multer from 'multer';

// =========================================================
//  APP & DATABASE SETUP
// =========================================================
const app = express();
const port = process.env.PORT || 3000;

// --- THIS IS THE CRITICAL FIX ---
// We must initialize the Supabase client with options suitable for a server environment.
// This tells the client not to use browser-specific features.
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);
// ------------------------------

// Multer setup for file uploads
const upload = multer({ storage: multer.memoryStorage() });

// =========================================================
//  MIDDLEWARE CONFIGURATION
// =========================================================

// --- CORS Configuration ---
const allowedOrigins = ['https://empowermenthub.onrender.com', 'http://localhost:5173'];
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization'],
};

// Handle preflight requests for all routes. This MUST come before other routes.
app.options('*', cors(corsOptions)); 
// Use the CORS configuration for all subsequent requests.
app.use(cors(corsOptions));

// --- Body Parser ---
app.use(express.json());

// --- Authentication Middleware ---
const getUserFromToken = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        if (!token) return res.status(401).json({ error: 'No token provided.' });
        const { data: { user }, error } = await supabase.auth.getUser(token);
        if (error) return res.status(401).json({ error: 'Invalid or expired token.', details: error.message });
        if (!user) return res.status(401).json({ error: 'User not found for this token.' });
        req.user = user;
        next();
    } catch (error) {
        res.status(500).json({ error: 'Internal server error in auth middleware.' });
    }
};

// --- Admin Role Check Middleware ---
const checkAdminRole = async (req, res, next) => {
    try {
        const { data: agent, error } = await supabase.from('agents').select('role').eq('id', req.user.id).single();
        if (error || !agent || agent.role !== 'admin') {
            return res.status(403).json({ error: 'Access Denied: Administrator privileges required.' });
        }
        next();
    } catch (error) {
        res.status(500).json({ error: 'Failed to verify admin role.' });
    }
};

// =================================================================
//  AGENT & PUBLIC API ROUTES
// =================================================================

// --- PUBLIC ROUTES (No Auth Required) ---

app.get('/api/public/all-agents', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('agents')
      .select('id, name, province, town, photo_url');
    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Error fetching all public agents:', error.message);
    res.status(500).json({ message: 'Error fetching agent data' });
  }
});

app.get('/api/public/agents', async (req, res) => {
  const { province } = req.query;
  if (!province) {
    return res.json([]);
  }
  try {
    const { data, error } = await supabase
      .from('agents')
      .select('id, name, province, town, about_me, contact_details, email, photo_url')
      .ilike('province', `%${province}%`);
    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Error fetching public agents:', error.message);
    res.status(500).json({ message: 'Error fetching agent data' });
  }
});

// --- AGENT-SPECIFIC ROUTES (Auth Required) ---

app.post('/api/register-agent', async (req, res) => {
  try {
    const { userId, name, email, contact_details, province, about_me, training_completed } = req.body;
    if (!userId || !name || !email) return res.status(400).json({ error: 'Core user details are required.' });
    const agentId = `CEA-${Date.now().toString().slice(-6)}`;
    const { data, error } = await supabase.from('agents').insert([{ id: userId, name, email, agent_id: agentId, role: 'consultant', contact_details, province, about_me, training_completed }]).select().single();
    if (error) throw error;
    res.status(201).json(data);
  } catch (error) { res.status(500).json({ error: 'Failed to create agent record.', details: error.message }); }
});

app.post('/api/log-sale', getUserFromToken, async (req, res) => {
  try {
    const { saleCount, saleNames } = req.body;
    if (!saleCount || !saleNames || isNaN(parseInt(saleCount)) || parseInt(saleCount) <= 0) {
      return res.status(400).json({ error: 'Valid saleCount (> 0) and saleNames are required.' });
    }
    const { data, error } = await supabase.from('sales').insert([{ agent_id: req.user.id, sale_count: parseInt(saleCount), sale_names: saleNames, status: 'pending' }]).select().single();
    if (error) throw error;
    res.status(201).json({ success: true, message: 'Sale logged successfully!', data });
  } catch (error) { res.status(500).json({ error: 'Failed to log sale.', details: error.message }); }
});

app.post('/api/request-payout', getUserFromToken, async (req, res) => {
  const agentId = req.user.id;
  try {
    const { data: salesToPay, error: salesError } = await supabase.from('sales').select('id, sale_count, sale_names').eq('agent_id', agentId).eq('status', 'confirmed');
    if (salesError) throw salesError;
    if (!salesToPay || salesToPay.length === 0) return res.status(400).json({ error: 'No confirmed sales are currently available for payout.' });

    const totalConfirmedSalesInRequest = salesToPay.reduce((acc, sale) => acc + sale.sale_count, 0);
    const rewardTier = totalConfirmedSalesInRequest >= 11 ? 400 : 200;
    const totalAmount = totalConfirmedSalesInRequest * rewardTier;
    const saleDetails = salesToPay.map(sale => `${sale.sale_names} (${sale.sale_count})`).join('; ');
    const saleIdsToUpdate = salesToPay.map(s => s.id);

    const { data: payoutRequest, error: payoutError } = await supabase.from('payout_requests').insert([{ agent_id: agentId, amount_requested: totalAmount, status: 'requested', sales_data: saleDetails, included_sale_ids: saleIdsToUpdate }]).select().single();
    if (payoutError) throw payoutError;

    await supabase.from('sales').update({ status: 'payout_pending' }).in('id', saleIdsToUpdate);
    res.json({ success: true, message: 'Payout request submitted successfully!' });
  } catch (error) {
    console.error('Critical error processing payout request:', error);
    res.status(500).json({ error: 'Failed to process payout request.', details: error.message });
  }
});

app.get('/api/get-agent-profile', getUserFromToken, async (req, res) => {
    try {
        const { data, error } = await supabase.from('agents').select('*').eq('id', req.user.id).single();
        if (error) throw error;
        res.json(data);
    } catch (error) { res.status(500).json({ error: 'Failed to fetch profile.', details: error.message }); }
});

app.put('/api/update-agent-profile/:agentId', getUserFromToken, async (req, res) => {
    try {
        if (req.user.id !== req.params.agentId) return res.status(403).json({ error: "Forbidden: You can only update your own profile." });
        const { name, about_me, province, town, address, contact_details } = req.body;
        const { data, error } = await supabase.from('agents').update({ name, about_me, province, town, address, contact_details }).eq('id', req.user.id).select().single();
        if (error) throw error;
        res.json(data);
    } catch (error) { res.status(500).json({ error: 'Failed to update profile.', details: error.message }); }
});

app.post('/api/upload-profile-picture', getUserFromToken, upload.single('profileImage'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'No file uploaded.' });
        const filePath = `public/${req.user.id}-${Date.now()}`;
        const { error: uploadError } = await supabase.storage.from('profile-pictures').upload(filePath, req.file.buffer, { contentType: req.file.mimetype, upsert: true });
        if (uploadError) throw uploadError;
        const { data: urlData } = supabase.storage.from('profile-pictures').getPublicUrl(filePath);
        const { error: dbError } = await supabase.from('agents').update({ photo_url: urlData.publicUrl }).eq('id', req.user.id);
        if (dbError) throw dbError;
        res.json({ success: true, photo_url: urlData.publicUrl });
    } catch (error) { res.status(500).json({ error: 'Failed to upload profile picture.', details: error.message }); }
});

app.get('/api/get-agent-sales/:agentId', getUserFromToken, async (req, res) => {
  try {
    const { agentId } = req.params;
    const { data: sales, error } = await supabase.from('sales').select('status, sale_count').eq('agent_id', agentId);
    if (error) throw error;
    let pendingSales = 0, confirmedSales = 0;
    if (sales) sales.forEach(s => s.status === 'pending' ? pendingSales += s.sale_count : (s.status === 'confirmed' ? confirmedSales += s.sale_count : 0));
    const reward = confirmedSales >= 11 ? 400 : 200;
    res.json({ period: new Date().toLocaleString('default', { month: 'long', year: 'numeric' }), pending_sales: pendingSales, confirmed_sales: confirmedSales, amount_earned: `R${(confirmedSales * reward).toFixed(2)}` });
  } catch (error) { res.status(500).json({ error: 'Failed to fetch agent sales.', details: error.message }); }
});

app.get('/api/get-top-performers', getUserFromToken, async (req, res) => {
  try {
    const { data, error } = await supabase.rpc('get_top_performers');
    if (error) throw error;
    res.json(data || []);
  } catch (error) { res.status(500).json({ error: 'Failed to fetch top performers.', details: error.message }); }
});

// =================================================================
//  ADMIN-ONLY API ROUTES
// =================================================================
const adminRouter = express.Router();
app.use('/api/admin', getUserFromToken, checkAdminRole, adminRouter);

adminRouter.get('/all-agents', async (req, res) => {
  try {
    const { data, error } = await supabase.from('agents').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    res.json(data);
  } catch (error) { res.status(500).json({ error: 'Failed to fetch all agents.', details: error.message }); }
});

adminRouter.get('/all-sales', async (req, res) => {
  try {
    const { data: sales, error: salesError } = await supabase.from('sales').select('*').order('created_at', { ascending: false });
    if (salesError) throw salesError;

    const { data: agents, error: agentsError } = await supabase.from('agents').select('id, name, agent_id');
    if (agentsError) throw agentsError;

    const agentMap = new Map(agents.map(agent => [agent.id, agent]));
    const combinedData = sales.map(sale => {
      const agentDetails = agentMap.get(sale.agent_id);
      return {
        ...sale,
        agent_name: agentDetails?.name || 'Unknown Agent',
        agent_internal_id: agentDetails?.agent_id || 'N/A'
      };
    });
    res.json(combinedData);
  } catch (error) {
    console.error('Error in /api/admin/all-sales:', error);
    res.status(500).json({ error: 'Failed to fetch all sales.', details: error.message });
  }
});

adminRouter.put('/approve-sale/:saleId', async (req, res) => {
  try {
    const { data, error } = await supabase.from('sales').update({ status: 'confirmed' }).eq('id', req.params.saleId).select().single();
    if (error) throw error;
    res.json(data);
  } catch (error) { res.status(500).json({ error: 'Failed to approve sale.', details: error.message }); }
});

adminRouter.put('/reject-sale/:saleId', async (req, res) => {
  try {
    const { data, error } = await supabase.from('sales').update({ status: 'rejected' }).eq('id', req.params.saleId).select().single();
    if (error) throw error;
    res.json(data);
  } catch (error) { res.status(500).json({ error: 'Failed to reject sale.', details: error.message }); }
});

adminRouter.get('/all-payouts', async (req, res) => {
  try {
    const { data, error } = await supabase.from('payout_requests').select(`*, agent:agents (name, email)`).order('created_at', { ascending: false });
    if (error) throw error;
    res.json(data);
  } catch (error) { res.status(500).json({ error: 'Failed to fetch payout requests.', details: error.message }); }
});

adminRouter.put('/approve-payout/:payoutId', async (req, res) => {
  try {
    const { data, error } = await supabase.from('payout_requests').update({ status: 'approved' }).eq('id', req.params.payoutId).select().single();
    if (error) throw error;
    res.json(data);
  } catch (error) { res.status(500).json({ error: 'Failed to update status.' }); }
});

adminRouter.put('/complete-payout/:payoutId', async (req, res) => {
  try {
    const { data, error } = await supabase.from('payout_requests').update({ status: 'completed' }).eq('id', req.params.payoutId).select().single();
    if (error) throw error;
    res.json(data);
  } catch (error) { res.status(500).json({ error: 'Failed to update status.' }); }
});

adminRouter.get('/get-agent-details/:agentId', async (req, res) => {
  try {
    const { data, error } = await supabase.from('agents').select('*').eq('id', req.params.agentId).single();
    if (error) throw error;
    res.json(data);
  } catch (error) { res.status(500).json({ error: 'Failed to fetch agent details.', details: error.message }); }
});

adminRouter.put('/update-agent-details/:agentId', async (req, res) => {
  try {
    const { data, error } = await supabase.from('agents').update(req.body).eq('id', req.params.agentId).select().single();
    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) { res.status(500).json({ error: 'Failed to update agent details.', details: error.message }); }
});

adminRouter.put('/update-agent-auth/:agentId', async (req, res) => {
  try {
    const { new_password } = req.body;
    if (!new_password || new_password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    const { error } = await supabase.auth.admin.updateUserById(req.params.agentId, { password: new_password });
    if (error) throw error;
    res.json({ success: true, message: "Agent's password changed." });
  } catch (error) { res.status(500).json({ error: 'Failed to update password.', details: error.message }); }
});

adminRouter.get('/search-agents', async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) return res.json([]);
    const searchTerm = `%${query.trim()}%`;
    const { data, error } = await supabase.from('agents').select('*').or(`name.ilike.${searchTerm},email.ilike.${searchTerm},contact_details.ilike.${searchTerm}`);
    if (error) throw error;
    res.json(data);
  } catch (error) { res.status(500).json({ error: 'Agent search failed.', details: error.message }); }
});


// =========================================================
//  SERVER START
// =========================================================
app.get('/', (req, res) => res.send('CEA Hub Backend is running!'));
app.listen(port, () => console.log(`CEA Hub Backend listening on http://localhost:${port}`));