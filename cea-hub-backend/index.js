import express from 'express';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import multer from 'multer';
import cors from 'cors';

const allowedOrigins = ['https://empowermenthub.onrender.com'];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json());
// --- END OF CORS CONFIGURATION ---
app.use(express.json());

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const upload = multer({ storage: multer.memoryStorage() });

// --- MIDDLEWARE ---
const getUserFromToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token provided.' });
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) return res.status(401).json({ error: 'Invalid or expired token.' });
    req.user = user;
    next();
  } catch (error) { res.status(500).json({ error: 'Internal server error in auth middleware.' });}
};

const checkAdminRole = async (req, res, next) => {
    try {
        const { data: agent, error } = await supabase.from('agents').select('role').eq('id', req.user.id).single();
        if (error || !agent || agent.role !== 'admin') {
            return res.status(403).json({ error: 'Access Denied: Administrator privileges required.' });
        }
        next();
    } catch (error) { res.status(500).json({ error: 'Failed to verify admin role.' }); }
};

// =================================================================
// --- AGENT & PUBLIC ENDPOINTS ---
// =================================================================

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

app.get('/api/get-agent-sales/:agentId', async (req, res) => {
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

app.get('/api/get-top-performers', async (req, res) => {
  try {
    const { data, error } = await supabase.rpc('get_top_performers');
    if (error) throw error;
    res.json(data || []);
  } catch (error) { res.status(500).json({ error: 'Failed to fetch top performers.', details: error.message }); }
});

// =================================================================
// --- ADMIN-ONLY ENDPOINTS ---
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
    // Step 1: Fetch ALL sales records, ordered by most recent. This is a simple, stable query.
    const { data: sales, error: salesError } = await supabase
      .from('sales')
      .select('*')
      .order('created_at', { ascending: false });

    if (salesError) {
      console.error("CRITICAL: Error fetching from 'sales' table:", salesError);
      throw salesError;
    }

    // Step 2: Fetch ALL agents to create a reference map. This is also a simple, stable query.
    const { data: agents, error: agentsError } = await supabase
      .from('agents')
      .select('id, name, agent_id');

    if (agentsError) {
      console.error("CRITICAL: Error fetching from 'agents' table:", agentsError);
      throw agentsError;
    }

    // Step 3: Create an easy-to-use map for matching agents to sales.
    const agentMap = new Map(agents.map(agent => [agent.id, agent]));

    // Step 4: Combine the data in JavaScript. This is immune to database join issues.
    const combinedData = sales.map(sale => {
      const agentDetails = agentMap.get(sale.agent_id);
      return {
        ...sale,
        // Safely add agent details, or provide a default if the agent is missing.
        agent_name: agentDetails?.name || 'Unknown Agent',
        agent_internal_id: agentDetails?.agent_id || 'N/A'
      };
    });

    res.json(combinedData);

  } catch (error) {
    // This will now catch any error from either query and send a detailed response.
    console.error('CRITICAL: Final error in /api/admin/all-sales endpoint:', error);
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

// --- SERVER START ---
app.get('/', (req, res) => res.send('CEA Hub Backend is running!'));
app.listen(port, () => console.log(`CEA Hub Backend listening on http://localhost:${port}`));