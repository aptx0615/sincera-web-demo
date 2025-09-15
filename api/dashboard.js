// ==========================================
// SECURE ANALYTICS DASHBOARD - PASSWORD PROTECTED
// ==========================================

export default async function handler(req, res) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    try {
        if (req.method === 'GET') {
            await serveDashboardHTML(req, res);
        } else if (req.method === 'POST') {
            await handleDashboardAPI(req, res);
        } else {
            res.status(405).json({ error: 'Method not allowed' });
        }
    } catch (error) {
        console.error('Dashboard Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

// ==========================================
// SERVE DASHBOARD HTML
// ==========================================

async function serveDashboardHTML(req, res) {
    const dashboardHTML = `
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SINCERA Analytics Dashboard</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #f5f7fa; 
            color: #2c3e50;
        }
        .login-container {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        .login-box, .dashboard {
            background: white;
            border-radius: 12px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.1);
            padding: 30px;
            max-width: 1200px;
            width: 100%;
        }
        .login-box { max-width: 400px; }
        .header { text-align: center; margin-bottom: 30px; }
        .header h1 { color: #2c3e50; font-size: 1.8rem; margin-bottom: 8px; }
        .header p { color: #7f8c8d; }
        .form-group { margin-bottom: 20px; }
        .form-group label { display: block; margin-bottom: 8px; font-weight: 500; }
        .form-group input, .form-group select {
            width: 100%;
            padding: 12px 15px;
            border: 2px solid #e0e0e0;
            border-radius: 8px;
            font-size: 1rem;
        }
        .form-group input:focus, .form-group select:focus {
            outline: none;
            border-color: #3498db;
        }
        .btn {
            width: 100%;
            padding: 12px;
            background: #3498db;
            color: white;
            border: none;
            border-radius: 8px;
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
            transition: background 0.3s;
        }
        .btn:hover { background: #2980b9; }
        .btn:disabled { background: #bdc3c7; cursor: not-allowed; }
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        .stat-card {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px;
            border-radius: 12px;
            text-align: center;
        }
        .stat-number { font-size: 2rem; font-weight: bold; margin-bottom: 5px; }
        .stat-label { font-size: 0.9rem; opacity: 0.9; }
        .data-section {
            background: #f8f9fa;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 20px;
        }
        .data-section h3 { margin-bottom: 15px; color: #2c3e50; }
        .data-table {
            width: 100%;
            border-collapse: collapse;
            background: white;
            border-radius: 8px;
            overflow: hidden;
        }
        .data-table th, .data-table td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #eee;
        }
        .data-table th { background: #f8f9fa; font-weight: 600; }
        .error { color: #e74c3c; background: #ffebee; padding: 15px; border-radius: 8px; margin: 15px 0; }
        .success { color: #27ae60; background: #e8f5e8; padding: 15px; border-radius: 8px; margin: 15px 0; }
        .controls { display: flex; gap: 15px; align-items: center; margin-bottom: 20px; }
        .controls input, .controls select { flex: 1; max-width: 200px; }
        .hidden { display: none; }
        .logout-btn {
            background: #e74c3c;
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 6px;
            cursor: pointer;
            float: right;
        }
    </style>
</head>
<body>
    <div id="loginContainer" class="login-container">
        <div class="login-box">
            <div class="header">
                <h1>🔐 SINCERA Analytics</h1>
                <p>Secure Dashboard Access</p>
            </div>
            <form id="loginForm">
                <div class="form-group">
                    <label for="password">Password:</label>
                    <input type="password" id="password" required placeholder="Enter dashboard password">
                </div>
                <button type="submit" class="btn">Access Dashboard</button>
            </form>
            <div id="loginError" class="error hidden">Invalid password</div>
        </div>
    </div>

    <div id="dashboardContainer" class="hidden">
        <div class="dashboard">
            <div class="header">
                <h1>📊 SINCERA Analytics Dashboard</h1>
                <button class="logout-btn" onclick="logout()">Logout</button>
                <div class="controls">
                    <input type="date" id="dateSelector" onchange="loadData()">
                    <button class="btn" onclick="downloadLogs()" style="max-width: 150px;">Download Logs</button>
                </div>
            </div>

            <div id="dashboardContent">
                <div class="stats-grid" id="statsGrid">
                    <!-- Stats will be loaded here -->
                </div>

                <div class="data-section">
                    <h3>📈 Analytics Summary</h3>
                    <div id="summaryContent">Loading...</div>
                </div>

                <div class="data-section">
                    <h3>🛒 E-commerce Funnel</h3>
                    <div id="funnelContent">Loading...</div>
                </div>

                <div class="data-section">
                    <h3>📱 Recent Events</h3>
                    <div id="eventsContent">Loading...</div>
                </div>
            </div>
        </div>
    </div>

    <script>
        let currentPassword = '';
        
        // Set default date to today
        document.getElementById('dateSelector').value = new Date().toISOString().split('T')[0];

        // Login handler
        document.getElementById('loginForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const password = document.getElementById('password').value;
            
            try {
                const response = await fetch('/api/dashboard', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action: 'login', password })
                });
                
                const result = await response.json();
                
                if (result.success) {
                    currentPassword = password;
                    document.getElementById('loginContainer').classList.add('hidden');
                    document.getElementById('dashboardContainer').classList.remove('hidden');
                    loadData();
                } else {
                    document.getElementById('loginError').classList.remove('hidden');
                }
            } catch (error) {
                document.getElementById('loginError').classList.remove('hidden');
            }
        });

        // Load dashboard data
        async function loadData() {
            const date = document.getElementById('dateSelector').value;
            
            try {
                const response = await fetch('/api/dashboard', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        action: 'getData', 
                        password: currentPassword,
                        date: date 
                    })
                });
                
                const data = await response.json();
                
                if (data.success) {
                    renderStats(data.analytics);
                    renderSummary(data.analytics);
                    renderFunnel(data.analytics);
                    renderEvents(data.events);
                } else {
                    console.error('Failed to load data');
                }
            } catch (error) {
                console.error('Error loading data:', error);
            }
        }

        // Render functions
        function renderStats(analytics) {
            const statsGrid = document.getElementById('statsGrid');
            const stats = analytics.totals || {};
            
            statsGrid.innerHTML = \`
                <div class="stat-card">
                    <div class="stat-number">\${stats.visitors || 0}</div>
                    <div class="stat-label">Visitors</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">\${stats.sessions || 0}</div>
                    <div class="stat-label">Sessions</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">\${stats.page_views || 0}</div>
                    <div class="stat-label">Page Views</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">\${stats.purchases || 0}</div>
                    <div class="stat-label">Purchases</div>
                </div>
            \`;
        }

        function renderSummary(analytics) {
            const content = document.getElementById('summaryContent');
            const rates = analytics.conversion_rates || {};
            
            content.innerHTML = \`
                <table class="data-table">
                    <tr><td>Cart Conversion</td><td>\${rates.cart_conversion || '0%'}</td></tr>
                    <tr><td>Checkout Conversion</td><td>\${rates.checkout_conversion || '0%'}</td></tr>
                    <tr><td>Purchase Conversion</td><td>\${rates.purchase_conversion || '0%'}</td></tr>
                    <tr><td>Chat Conversion</td><td>\${rates.chat_conversion || '0%'}</td></tr>
                </table>
            \`;
        }

        function renderFunnel(analytics) {
            const content = document.getElementById('funnelContent');
            const totals = analytics.totals || {};
            
            content.innerHTML = \`
                <table class="data-table">
                    <tr><td>Page Views</td><td>\${totals.page_views || 0}</td></tr>
                    <tr><td>Product Clicks</td><td>\${totals.product_clicks || 0}</td></tr>
                    <tr><td>Add to Carts</td><td>\${totals.add_to_carts || 0}</td></tr>
                    <tr><td>Checkouts</td><td>\${totals.checkouts || 0}</td></tr>
                    <tr><td>Purchases</td><td>\${totals.purchases || 0}</td></tr>
                </table>
            \`;
        }

        function renderEvents(events) {
            const content = document.getElementById('eventsContent');
            
            if (!events || events.length === 0) {
                content.innerHTML = '<p>No recent events</p>';
                return;
            }
            
            const recentEvents = events.slice(-10).reverse();
            const eventsHTML = recentEvents.map(event => \`
                <tr>
                    <td>\${new Date(event.timestamp).toLocaleTimeString()}</td>
                    <td>\${event.event_type}</td>
                    <td>\${event.visitor_id?.substring(0, 8) || 'N/A'}</td>
                    <td>\${JSON.stringify(event.data || {}).substring(0, 50)}...</td>
                </tr>
            \`).join('');
            
            content.innerHTML = \`
                <table class="data-table">
                    <thead>
                        <tr><th>Time</th><th>Event</th><th>Visitor</th><th>Data</th></tr>
                    </thead>
                    <tbody>\${eventsHTML}</tbody>
                </table>
            \`;
        }

        // Download logs
        async function downloadLogs() {
            const date = document.getElementById('dateSelector').value;
            
            try {
                const response = await fetch('/api/dashboard', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        action: 'download', 
                        password: currentPassword,
                        date: date 
                    })
                });
                
                if (response.ok) {
                    const blob = await response.blob();
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = \`sincera_logs_\${date}.json\`;
                    a.click();
                    window.URL.revokeObjectURL(url);
                } else {
                    alert('Download failed');
                }
            } catch (error) {
                alert('Download error: ' + error.message);
            }
        }

        // Logout
        function logout() {
            currentPassword = '';
            document.getElementById('loginContainer').classList.remove('hidden');
            document.getElementById('dashboardContainer').classList.add('hidden');
            document.getElementById('password').value = '';
            document.getElementById('loginError').classList.add('hidden');
        }
    </script>
</body>
</html>`;

    res.setHeader('Content-Type', 'text/html');
    res.status(200).send(dashboardHTML);
}

// ==========================================
// HANDLE DASHBOARD API
// ==========================================

async function handleDashboardAPI(req, res) {
    const { action, password, date } = req.body;
    
    // 🔐 VERIFY PASSWORD
    const DASHBOARD_PASSWORD = process.env.DASHBOARD_PASSWORD || 'sincera_admin_2024';
    
    if (password !== DASHBOARD_PASSWORD) {
        // Anti brute force delay
        await new Promise(resolve => setTimeout(resolve, 2000));
        return res.status(401).json({ error: 'Invalid password' });
    }

    const targetDate = date || new Date().toISOString().split('T')[0];

    try {
        switch (action) {
            case 'login':
                res.status(200).json({ success: true, message: 'Login successful' });
                break;
                
            case 'getData':
                const analytics = await getAnalyticsData(targetDate);
                const events = await getEventsData(targetDate);
                res.status(200).json({ 
                    success: true, 
                    analytics, 
                    events,
                    date: targetDate 
                });
                break;
                
            case 'download':
                const logData = await generateFullLogs(targetDate);
                const fileName = `sincera_logs_${targetDate}.json`;
                
                res.setHeader('Content-Type', 'application/json');
                res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
                res.status(200).json(logData);
                break;
                
            default:
                res.status(400).json({ error: 'Invalid action' });
        }
    } catch (error) {
        console.error('Dashboard API error:', error);
        res.status(500).json({ error: 'Internal error' });
    }
}

// ==========================================
// DATA RETRIEVAL FUNCTIONS
// ==========================================

async function getAnalyticsData(date) {
    if (!global.analytics) {
        return {
            date: date,
            totals: { visitors: 0, sessions: 0, page_views: 0, events: 0 },
            conversion_rates: { cart_conversion: '0%', checkout_conversion: '0%', purchase_conversion: '0%', chat_conversion: '0%' }
        };
    }

    const totalsKey = `daily_totals_${date}`;
    const totals = global.analytics[totalsKey];

    if (!totals) {
        return {
            date: date,
            totals: { visitors: 0, sessions: 0, page_views: 0, events: 0 },
            conversion_rates: { cart_conversion: '0%', checkout_conversion: '0%', purchase_conversion: '0%', chat_conversion: '0%' }
        };
    }

    return {
        date: date,
        totals: {
            visitors: totals.unique_visitors?.size || 0,
            sessions: totals.unique_sessions?.size || 0,
            page_views: totals.page_views || 0,
            events: totals.total_events || 0,
            product_clicks: totals.product_clicks || 0,
            add_to_carts: totals.add_to_carts || 0,
            checkouts: totals.checkouts || 0,
            purchases: totals.purchases || 0,
            chat_clicks: totals.chat_clicks || 0
        },
        conversion_rates: {
            cart_conversion: totals.page_views > 0 ? ((totals.add_to_carts / totals.page_views) * 100).toFixed(2) + '%' : '0%',
            checkout_conversion: totals.add_to_carts > 0 ? ((totals.checkouts / totals.add_to_carts) * 100).toFixed(2) + '%' : '0%',
            purchase_conversion: totals.checkouts > 0 ? ((totals.purchases / totals.checkouts) * 100).toFixed(2) + '%' : '0%',
            chat_conversion: totals.unique_visitors?.size > 0 ? ((totals.chat_clicks / totals.unique_visitors.size) * 100).toFixed(2) + '%' : '0%'
        }
    };
}

async function getEventsData(date) {
    if (!global.analytics) return [];
    
    const eventsKey = `events_${date}`;
    return global.analytics[eventsKey] || [];
}

async function generateFullLogs(date) {
    const analytics = await getAnalyticsData(date);
    const events = await getEventsData(date);
    
    return {
        meta: {
            date: date,
            generated_at: new Date().toISOString(),
            version: '1.0',
            source: 'SINCERA Analytics Dashboard'
        },
        analytics: analytics,
        events: events,
        raw_data: global.analytics ? Object.keys(global.analytics)
            .filter(key => key.includes(date))
            .reduce((obj, key) => {
                obj[key] = JSON.parse(JSON.stringify(global.analytics[key], (k, v) => 
                    v instanceof Set ? Array.from(v) : v
                ));
                return obj;
            }, {}) : {}
    };
}