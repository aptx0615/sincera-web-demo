export default async function handler(req, res) {
    // ✅ FIXED: Comprehensive CORS setup
    const origin = req.headers.origin;
    const allowedOrigins = [
        'https://your-domain.com',
        'https://sincera.vercel.app', 
        'http://localhost:3000',
        'http://127.0.0.1:5500',
        'http://localhost:5500'
    ];
    
    if (allowedOrigins.includes(origin) || !origin) {
        res.setHeader('Access-Control-Allow-Origin', origin || '*');
    }
    
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Max-Age', '86400');

    // ✅ FIXED: Handle preflight requests properly
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    // ✅ FIXED: Better error handling and logging
    try {
        console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`, {
            headers: req.headers,
            body: req.body ? JSON.stringify(req.body).substring(0, 200) : 'No body'
        });

        if (req.method === 'POST') {
            await handleTrackingEvent(req, res);
        } else if (req.method === 'GET') {
            await getAnalytics(req, res);
        } else {
            console.warn(`❌ Method ${req.method} not allowed`);
            res.status(405).json({ 
                error: 'Method not allowed',
                allowed: ['GET', 'POST', 'OPTIONS'],
                received: req.method 
            });
        }
    } catch (error) {
        console.error('💥 API Error:', error);
        res.status(500).json({ 
            error: 'Internal server error',
            message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong',
            timestamp: new Date().toISOString()
        });
    }
}
async function handleTrackingEvent(req, res) {
    try {
        // ✅ FIXED: Validate content type
        const contentType = req.headers['content-type'];
        if (!contentType || !contentType.includes('application/json')) {
            console.warn('⚠️ Invalid content type:', contentType);
            return res.status(400).json({
                error: 'Invalid content type',
                expected: 'application/json',
                received: contentType
            });
        }

        const { 
            event_type, 
            session_id, 
            visitor_id, 
            timestamp, 
            source, 
            device, 
            data 
        } = req.body || {};

        // ✅ FIXED: Better validation
        if (!event_type) {
            return res.status(400).json({ 
                error: 'Missing event_type',
                received: req.body
            });
        }

        if (!session_id || !visitor_id) {
            console.warn('⚠️ Missing session/visitor ID - creating fallbacks');
        }

        const eventData = {
            event_type,
            session_id: session_id || `fallback_session_${Date.now()}`,
            visitor_id: visitor_id || `fallback_visitor_${Date.now()}`,
            timestamp: timestamp || Date.now(),
            source: source || {},
            device: device || {},
            data: data || {},
            processed_at: Date.now(),
            ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
            user_agent: req.headers['user-agent']
        };

        // Process different event types
        await processEventByType(eventData);

        // Store event in memory/database  
        await storeEvent(eventData);

        // Update real-time analytics
        await updateAnalytics(eventData);

        console.log(`✅ Event processed: ${event_type}`, {
            visitor: visitor_id,
            session: session_id
        });

        res.status(200).json({ 
            success: true, 
            event_type: event_type,
            timestamp: eventData.timestamp,
            processed_at: eventData.processed_at
        });

    } catch (error) {
        console.error('❌ Event processing error:', error);
        res.status(500).json({
            error: 'Event processing failed',
            message: error.message
        });
    }
}

async function processEventByType(eventData) {
    const { event_type, data, visitor_id, session_id, source, device } = eventData;
    
    try {
        switch (event_type) {
            case 'page_view':
                await processPageView(eventData);
                break;
            case 'product_click':
                await processProductClick(eventData);
                break;
            case 'add_to_cart':
                await processAddToCart(eventData);
                break;
            case 'remove_from_cart':
                await processRemoveFromCart(eventData);
                break;
            case 'initiate_checkout':
                await processCheckout(eventData);
                break;
            case 'purchase':
                await processPurchase(eventData);
                break;
            case 'chat_click':
                await processChatClick(eventData);
                break;
            case 'chat_context':
                await processChatContext(eventData);
                break;
            case 'session_end':
                await processSessionEnd(eventData);
                break;
            case 'scroll_depth':
                await processScrollDepth(eventData);
                break;
            default:
                await processGenericEvent(eventData);
                console.log(`🎯 Generic Event: ${event_type}`, data);
        }
    } catch (error) {
        console.error(`❌ Failed to process ${event_type}:`, error);
        // Don't throw - just log the error
    }
}

async function processPageView(eventData) {
    try {
        const { data, visitor_id, session_id, source, device } = eventData;
        
        await updateVisitorStats(visitor_id, {
            last_page: data.page || '/',
            last_visit: data.timestamp || Date.now(),
            source: source,
            device: device
        });

        await updatePageStats(data.page || '/', {
            views: 1,
            unique_visitors: [visitor_id]
        });

        console.log(`📄 Page View: ${data.page} by ${visitor_id}`);
    } catch (error) {
        console.error('❌ processPageView error:', error);
    }
}

async function processProductClick(eventData) {
    try {
        const { data } = eventData;
        
        await updateProductStats(data.product_id, {
            clicks: 1,
            name: data.product_name,
            price: data.product_price,
            last_clicked: data.timestamp || Date.now()
        });

        console.log(`👆 Product Click: ${data.product_name} (${data.product_id})`);
    } catch (error) {
        console.error('❌ processProductClick error:', error);
    }
}

async function processAddToCart(eventData) {
    try {
        const { data, visitor_id } = eventData;
        
        await updateFunnelStats('add_to_cart', {
            product_id: data.product_id,
            cart_total: data.cart_total,
            visitor_id: visitor_id
        });

        console.log(`🛒 Add to Cart: ${data.product_name} by ${visitor_id}`);
    } catch (error) {
        console.error('❌ processAddToCart error:', error);
    }
}

async function processRemoveFromCart(eventData) {
    try {
        const { data, visitor_id } = eventData;
        console.log(`🗑️ Remove from Cart: ${data.product_name} by ${visitor_id}`);
    } catch (error) {
        console.error('❌ processRemoveFromCart error:', error);
    }
}

async function processCheckout(eventData) {
    try {
        const { data, visitor_id } = eventData;
        
        await updateFunnelStats('initiate_checkout', {
            cart_total: data.cart_total,
            item_count: data.item_count,
            visitor_id: visitor_id
        });

        console.log(`💳 Checkout Initiated: ${data.cart_total} VND by ${visitor_id}`);
    } catch (error) {
        console.error('❌ processCheckout error:', error);
    }
}

async function processPurchase(eventData) {
    try {
        const { data, visitor_id } = eventData;
        
        await updateFunnelStats('purchase', {
            order_id: data.order_id,
            order_total: data.order_total,
            visitor_id: visitor_id
        });

        console.log(`✅ Purchase Complete: ${data.order_total} VND by ${visitor_id}`);
    } catch (error) {
        console.error('❌ processPurchase error:', error);
    }
}

async function processChatClick(eventData) {
    try {
        const { data, visitor_id, session_id } = eventData;
        
        await updateChatStats({
            visitor_id: visitor_id,
            session_id: session_id,
            session_duration: data.session_duration,
            pages_viewed: data.pages_viewed,
            cart_total: data.cart_total
        });

        console.log(`💬 Chat Click by ${visitor_id} - Duration: ${data.session_duration}ms`);
    } catch (error) {
        console.error('❌ processChatClick error:', error);
    }
}

async function processChatContext(eventData) {
    try {
        const { visitor_id, session_id, source, device, behavior, products } = eventData;
        
        const inboxData = {
            visitor_id: visitor_id,
            session_id: session_id,
            timestamp: eventData.timestamp,
            
            // Traffic source
            utm_source: source?.utm_source,
            utm_medium: source?.utm_medium,
            utm_campaign: source?.utm_campaign,
            referrer: source?.referrer_domain,
            source_type: source?.source_type,
            landing_page: source?.landing_page,
            
            // Device info
            device_type: device?.device_type,
            browser: device?.browser,
            os: device?.os,
            screen_size: `${device?.screen_width}x${device?.screen_height}`,
            
            // Behavior
            session_duration_minutes: Math.round((behavior?.session_duration || 0) / 60000),
            pages_viewed: behavior?.pages_viewed || 0,
            is_bounce: behavior?.bounce || false,
            scroll_engagement: behavior?.scroll_depth_max || 0,
            
            // E-commerce
            cart_value: products?.cart_total || 0,
            cart_items_count: (products?.cart_items || []).length,
            products_interest: (products?.clicked_products || []).map(p => ({
                name: p.product_name,
                price: p.product_price,
                clicks: 1
            })),
            
            // Journey
            page_flow: behavior?.page_journey || []
        };

        await sendToInboxBackend(inboxData);
        
        console.log(`🎯 Chat Context sent for ${visitor_id}:`, {
            session_duration: inboxData.session_duration_minutes,
            pages_viewed: inboxData.pages_viewed,
            cart_value: inboxData.cart_value
        });
    } catch (error) {
        console.error('❌ processChatContext error:', error);
    }
}

async function processSessionEnd(eventData) {
    try {
        const { data, visitor_id, session_id } = eventData;
        
        await updateSessionStats(session_id, {
            end_time: data.timestamp || Date.now(),
            duration: data.session_duration,
            pages_viewed: data.pages_viewed,
            total_events: data.total_events,
            is_bounce: data.bounce
        });

        console.log(`🏁 Session End: ${session_id} - Duration: ${data.session_duration}ms`);
    } catch (error) {
        console.error('❌ processSessionEnd error:', error);
    }
}

async function processScrollDepth(eventData) {
    try {
        const { data } = eventData;
        console.log(`📜 Scroll Depth: ${data.depth}% on ${data.page}`);
    } catch (error) {
        console.error('❌ processScrollDepth error:', error);
    }
}

async function processGenericEvent(eventData) {
    try {
        console.log(`🎯 Generic Event: ${eventData.event_type}`, eventData.data);
    } catch (error) {
        console.error('❌ processGenericEvent error:', error);
    }
}

async function updateVisitorStats(visitorId, data) {
    const today = new Date().toISOString().split('T')[0];
    const statsKey = `visitor_stats_${today}`;
    
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

async function getAnalytics(req, res) {
    try {
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
    } catch (error) {
        console.error('❌ getAnalytics error:', error);
        res.status(500).json({
            error: 'Failed to get analytics',
            message: error.message
        });
    }
}

async function sendToInboxBackend(inboxData) {
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
            body: JSON.stringify(inboxData),
            timeout: 5000 // 5 second timeout
        });

        if (!response.ok) {
            throw new Error(`Inbox webhook failed: ${response.status} ${response.statusText}`);
        }

        console.log('📨 Inbox data sent successfully');
    } catch (error) {
        console.error('❌ Failed to send to inbox:', error.message);
        // Don't throw - just log the error
    }

    // Setup persistence ONLY ONCE
    if (!global.persistenceSetup) {
        global.persistenceSetup = true;
        
        // Auto-backup every 5 minutes
        setInterval(() => {
            if (global.analytics) {
                console.log('[ANALYTICS_BACKUP]', JSON.stringify({
                    timestamp: Date.now(),
                    keys: Object.keys(global.analytics),
                    totalEvents: Object.values(global.analytics).reduce((sum, data) => {
                        return sum + (Array.isArray(data) ? data.length : 0);
                    }, 0)
                }));
            }
        }, 5 * 60 * 1000);
        
        console.log('[SYSTEM] Analytics persistence setup completed');
    }

}

