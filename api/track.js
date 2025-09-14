// ==========================================
// SINCERA TRACKING API - VERCEL SERVERLESS
// Receives tracking data and processes analytics
// ==========================================

export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    try {
        if (req.method === 'POST') {
            await handleTrackingEvent(req, res);
        } else if (req.method === 'GET') {
            await getAnalytics(req, res);
        } else {
            res.status(405).json({ error: 'Method not allowed' });
        }
    } catch (error) {
        console.error('API Error:', error);
        res.status(500).json({ 
            error: 'Internal server error',
            message: error.message 
        });
    }
}

// ==========================================
// HANDLE TRACKING EVENTS
// ==========================================

async function handleTrackingEvent(req, res) {
    const { 
        event_type, 
        session_id, 
        visitor_id, 
        timestamp, 
        source, 
        device, 
        data 
    } = req.body;

    // Validate required fields
    if (!event_type || !session_id || !visitor_id) {
        return res.status(400).json({ 
            error: 'Missing required fields',
            required: ['event_type', 'session_id', 'visitor_id']
        });
    }

    // Process different event types
    switch (event_type) {
        case 'page_view':
            await processPageView(req.body);
            break;
        case 'product_click':
            await processProductClick(req.body);
            break;
        case 'add_to_cart':
            await processAddToCart(req.body);
            break;
        case 'remove_from_cart':
            await processRemoveFromCart(req.body);
            break;
        case 'initiate_checkout':
            await processCheckout(req.body);
            break;
        case 'purchase':
            await processPurchase(req.body);
            break;
        case 'chat_click':
            await processChatClick(req.body);
            break;
        case 'chat_context':
            await processChatContext(req.body);
            break;
        case 'session_end':
            await processSessionEnd(req.body);
            break;
        case 'scroll_depth':
            await processScrollDepth(req.body);
            break;
        default:
            await processGenericEvent(req.body);
    }

    // Store event in memory/database
    await storeEvent(req.body);

    // Update real-time analytics
    await updateAnalytics(req.body);

    res.status(200).json({ 
        success: true, 
        event_type: event_type,
        timestamp: timestamp
    });
}

// ==========================================
// EVENT PROCESSORS
// ==========================================

async function processPageView(eventData) {
    const { data, visitor_id, session_id, source, device } = eventData;
    
    // Update visitor stats
    await updateVisitorStats(visitor_id, {
        last_page: data.page,
        last_visit: data.timestamp,
        source: source,
        device: device
    });

    // Update page stats
    await updatePageStats(data.page, {
        views: 1,
        unique_visitors: [visitor_id]
    });

    console.log(`📄 Page View: ${data.page} by ${visitor_id}`);
}

async function processProductClick(eventData) {
    const { data } = eventData;
    
    // Update product click stats
    await updateProductStats(data.product_id, {
        clicks: 1,
        name: data.product_name,
        price: data.product_price,
        last_clicked: data.timestamp
    });

    console.log(`👆 Product Click: ${data.product_name} (${data.product_id})`);
}

async function processAddToCart(eventData) {
    const { data, visitor_id } = eventData;
    
    // Update conversion funnel
    await updateFunnelStats('add_to_cart', {
        product_id: data.product_id,
        cart_total: data.cart_total,
        visitor_id: visitor_id
    });

    console.log(`🛒 Add to Cart: ${data.product_name} by ${visitor_id}`);
}

async function processRemoveFromCart(eventData) {
    const { data, visitor_id } = eventData;
    
    console.log(`🗑️ Remove from Cart: ${data.product_name} by ${visitor_id}`);
}

async function processCheckout(eventData) {
    const { data, visitor_id } = eventData;
    
    // Update conversion funnel
    await updateFunnelStats('initiate_checkout', {
        cart_total: data.cart_total,
        item_count: data.item_count,
        visitor_id: visitor_id
    });

    console.log(`💳 Checkout Initiated: ${data.cart_total} VND by ${visitor_id}`);
}

async function processPurchase(eventData) {
    const { data, visitor_id } = eventData;
    
    // Update conversion funnel
    await updateFunnelStats('purchase', {
        order_id: data.order_id,
        order_total: data.order_total,
        visitor_id: visitor_id
    });

    console.log(`✅ Purchase Complete: ${data.order_total} VND by ${visitor_id}`);
}

async function processChatClick(eventData) {
    const { data, visitor_id, session_id } = eventData;
    
    // Update chat stats
    await updateChatStats({
        visitor_id: visitor_id,
        session_id: session_id,
        session_duration: data.session_duration,
        pages_viewed: data.pages_viewed,
        cart_total: data.cart_total
    });

    console.log(`💬 Chat Click by ${visitor_id} - Duration: ${data.session_duration}ms`);
}

async function processChatContext(eventData) {
    const { visitor_id, session_id, source, device, behavior, products } = eventData;
    
    // Send to inbox backend (customize this webhook URL)
    const inboxData = {
        visitor_id: visitor_id,
        session_id: session_id,
        timestamp: eventData.timestamp,
        
        // Traffic source
        utm_source: source.utm_source,
        utm_medium: source.utm_medium,
        utm_campaign: source.utm_campaign,
        referrer: source.referrer_domain,
        source_type: source.source_type,
        landing_page: source.landing_page,
        
        // Device info
        device_type: device.device_type,
        browser: device.browser,
        os: device.os,
        screen_size: `${device.screen_width}x${device.screen_height}`,
        
        // Behavior
        session_duration_minutes: Math.round(behavior.session_duration / 60000),
        pages_viewed: behavior.pages_viewed,
        is_bounce: behavior.bounce,
        scroll_engagement: behavior.scroll_depth_max,
        
        // E-commerce
        cart_value: products.cart_total,
        cart_items_count: products.cart_items.length,
        products_interest: products.clicked_products.map(p => ({
            name: p.product_name,
            price: p.product_price,
            clicks: 1
        })),
        
        // Journey
        page_flow: behavior.page_journey || []
    };

    // TODO: Send to your inbox backend
    await sendToInboxBackend(inboxData);
    
    console.log(`🎯 Chat Context sent for ${visitor_id}:`, inboxData);
}

async function processSessionEnd(eventData) {
    const { data, visitor_id, session_id } = eventData;
    
    await updateSessionStats(session_id, {
        end_time: data.timestamp,
        duration: data.session_duration,
        pages_viewed: data.pages_viewed,
        total_events: data.total_events,
        is_bounce: data.bounce
    });

    console.log(`🏁 Session End: ${session_id} - Duration: ${data.session_duration}ms`);
}

async function processScrollDepth(eventData) {
    const { data } = eventData;
    
    console.log(`📜 Scroll Depth: ${data.depth}% on ${data.page}`);
}

async function processGenericEvent(eventData) {
    console.log(`🎯 Generic Event: ${eventData.event_type}`);
}

// ==========================================
// ANALYTICS UPDATERS
// ==========================================

async function updateVisitorStats(visitorId, data) {
    const today = new Date().toISOString().split('T')[0];
    const statsKey = `visitor_stats_${today}`;
    
    // In a real app, this would update database
    // For now, we'll use global memory (resets on redeploy)
    if (!global.analytics) global.analytics = {};
    if (!global.analytics[statsKey]) global.analytics[statsKey] = {};
    
    global.analytics[statsKey][visitorId] = {
        ...global.analytics[statsKey][visitorId],
        ...data,
        updated_at: Date.now()
    };
}

async function updatePageStats(page, data) {
    const today = new Date().toISOString().split('T')[0];
    const statsKey = `page_stats_${today}`;
    
    if (!global.analytics) global.analytics = {};
    if (!global.analytics[statsKey]) global.analytics[statsKey] = {};
    if (!global.analytics[statsKey][page]) {
        global.analytics[statsKey][page] = { views: 0, unique_visitors: new Set() };
    }
    
    global.analytics[statsKey][page].views += data.views || 0;
    
    if (data.unique_visitors) {
        data.unique_visitors.forEach(visitor => {
            global.analytics[statsKey][page].unique_visitors.add(visitor);
        });
    }
}

async function updateProductStats(productId, data) {
    const today = new Date().toISOString().split('T')[0];
    const statsKey = `product_stats_${today}`;
    
    if (!global.analytics) global.analytics = {};
    if (!global.analytics[statsKey]) global.analytics[statsKey] = {};
    if (!global.analytics[statsKey][productId]) {
        global.analytics[statsKey][productId] = { 
            clicks: 0, 
            name: data.name,
            price: data.price
        };
    }
    
    global.analytics[statsKey][productId].clicks += data.clicks || 0;
    global.analytics[statsKey][productId].last_clicked = data.last_clicked;
}

async function updateFunnelStats(stage, data) {
    const today = new Date().toISOString().split('T')[0];
    const statsKey = `funnel_stats_${today}`;
    
    if (!global.analytics) global.analytics = {};
    if (!global.analytics[statsKey]) global.analytics[statsKey] = {};
    if (!global.analytics[statsKey][stage]) global.analytics[statsKey][stage] = [];
    
    global.analytics[statsKey][stage].push({
        ...data,
        timestamp: Date.now()
    });
}

async function updateChatStats(data) {
    const today = new Date().toISOString().split('T')[0];
    const statsKey = `chat_stats_${today}`;
    
    if (!global.analytics) global.analytics = {};
    if (!global.analytics[statsKey]) global.analytics[statsKey] = [];
    
    global.analytics[statsKey].push({
        ...data,
        timestamp: Date.now()
    });
}

async function updateSessionStats(sessionId, data) {
    const today = new Date().toISOString().split('T')[0];
    const statsKey = `session_stats_${today}`;
    
    if (!global.analytics) global.analytics = {};
    if (!global.analytics[statsKey]) global.analytics[statsKey] = {};
    
    global.analytics[statsKey][sessionId] = data;
}

async function storeEvent(eventData) {
    const today = new Date().toISOString().split('T')[0];
    const eventsKey = `events_${today}`;
    
    if (!global.analytics) global.analytics = {};
    if (!global.analytics[eventsKey]) global.analytics[eventsKey] = [];
    
    global.analytics[eventsKey].push({
        ...eventData,
        stored_at: Date.now()
    });
}

async function updateAnalytics(eventData) {
    // Update daily totals
    const today = new Date().toISOString().split('T')[0];
    const totalsKey = `daily_totals_${today}`;
    
    if (!global.analytics) global.analytics = {};
    if (!global.analytics[totalsKey]) {
        global.analytics[totalsKey] = {
            total_events: 0,
            unique_visitors: new Set(),
            unique_sessions: new Set(),
            page_views: 0,
            product_clicks: 0,
            add_to_carts: 0,
            checkouts: 0,
            purchases: 0,
            chat_clicks: 0
        };
    }
    
    const totals = global.analytics[totalsKey];
    totals.total_events++;
    totals.unique_visitors.add(eventData.visitor_id);
    totals.unique_sessions.add(eventData.session_id);
    
    // Increment specific counters
    switch (eventData.event_type) {
        case 'page_view':
            totals.page_views++;
            break;
        case 'product_click':
            totals.product_clicks++;
            break;
        case 'add_to_cart':
            totals.add_to_carts++;
            break;
        case 'initiate_checkout':
            totals.checkouts++;
            break;
        case 'purchase':
            totals.purchases++;
            break;
        case 'chat_click':
            totals.chat_clicks++;
            break;
    }
}

// ==========================================
// ANALYTICS GETTER
// ==========================================

async function getAnalytics(req, res) {
    const { date, metric } = req.query;
    const targetDate = date || new Date().toISOString().split('T')[0];
    
    if (!global.analytics) {
        return res.status(200).json({ 
            date: targetDate,
            message: 'No analytics data available yet',
            totals: {
                visitors: 0,
                sessions: 0,
                page_views: 0,
                events: 0
            }
        });
    }

    // Get daily totals
    const totalsKey = `daily_totals_${targetDate}`;
    const totals = global.analytics[totalsKey];
    
    if (!totals) {
        return res.status(200).json({
            date: targetDate,
            message: 'No data for this date',
            totals: {
                visitors: 0,
                sessions: 0,
                page_views: 0,
                events: 0
            }
        });
    }

    // Format response
    const response = {
        date: targetDate,
        totals: {
            visitors: totals.unique_visitors.size,
            sessions: totals.unique_sessions.size,
            page_views: totals.page_views,
            events: totals.total_events,
            product_clicks: totals.product_clicks,
            add_to_carts: totals.add_to_carts,
            checkouts: totals.checkouts,
            purchases: totals.purchases,
            chat_clicks: totals.chat_clicks
        },
        conversion_rates: {
            cart_conversion: totals.page_views > 0 ? (totals.add_to_carts / totals.page_views * 100).toFixed(2) + '%' : '0%',
            checkout_conversion: totals.add_to_carts > 0 ? (totals.checkouts / totals.add_to_carts * 100).toFixed(2) + '%' : '0%',
            purchase_conversion: totals.checkouts > 0 ? (totals.purchases / totals.checkouts * 100).toFixed(2) + '%' : '0%',
            chat_conversion: totals.unique_visitors.size > 0 ? (totals.chat_clicks / totals.unique_visitors.size * 100).toFixed(2) + '%' : '0%'
        }
    };

    // Add specific metric data if requested
    if (metric) {
        const metricKey = `${metric}_stats_${targetDate}`;
        response[metric] = global.analytics[metricKey] || {};
    }

    res.status(200).json(response);
}

// ==========================================
// INBOX INTEGRATION
// ==========================================

async function sendToInboxBackend(inboxData) {
    // TODO: Replace with your actual inbox webhook URL
    const INBOX_WEBHOOK_URL = process.env.INBOX_WEBHOOK_URL || 'https://your-inbox-backend.com/webhook/visitor';
    
    if (INBOX_WEBHOOK_URL.includes('your-inbox-backend.com')) {
        console.log('⚠️  Inbox webhook not configured. Data:', inboxData);
        return;
    }

    try {
        const response = await fetch(INBOX_WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.INBOX_API_KEY || ''}`
            },
            body: JSON.stringify(inboxData)
        });

        if (!response.ok) {
            throw new Error(`Inbox webhook failed: ${response.status}`);
        }

        console.log('📨 Inbox data sent successfully');
    } catch (error) {
        console.error('❌ Failed to send to inbox:', error);
    }
}