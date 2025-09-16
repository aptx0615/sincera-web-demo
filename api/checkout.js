// ==========================================
// SECURE CHECKOUT API - BACKEND ONLY  
// API keys được bảo vệ trong Vercel Environment Variables
// ==========================================

export default async function handler(req, res) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        await handleCheckoutRequest(req, res);
    } catch (error) {
        console.error('💥 Checkout API Error:', error);
        res.status(500).json({ 
            error: 'Checkout failed',
            message: 'Internal server error'
        });
    }
}

// ==========================================
// SECURE CHECKOUT HANDLER
// ==========================================

async function handleCheckoutRequest(req, res) {
    // 🔐 API CREDENTIALS FROM ENVIRONMENT VARIABLES
    const SHOP_ID = process.env.PANCAKE_SHOP_ID || '1328295561';
    const API_KEY = process.env.PANCAKE_API_KEY || 'd7e2687c391244b590ea95b4ae34b386';
    const WAREHOUSE_ID = process.env.PANCAKE_WAREHOUSE_ID || 'KHO1';

    // Validate environment variables
    if (!SHOP_ID || !API_KEY) {
        console.error('❌ Missing environment variables');
        return res.status(500).json({
            error: 'Server configuration error',
            message: 'Missing required API credentials'
        });
    }

    const payload = req.body;
    console.log('📥 Received checkout payload:', JSON.stringify(payload, null, 2));

    // Validate payload structure
    if (!payload || !payload.items || !Array.isArray(payload.items) || payload.items.length === 0) {
        return res.status(400).json({
            error: 'Invalid payload',
            message: 'Items array is required and cannot be empty'
        });
    }

    if (!payload.bill_full_name || !payload.bill_phone_number) {
        return res.status(400).json({
            error: 'Missing customer info',
            message: 'Customer name and phone are required'
        });
    }

    // Build Pancake API payload
    const pancakePayload = {
        shop_id: parseInt(SHOP_ID),
        warehouse_id: WAREHOUSE_ID,
        
        // Customer billing info
        bill_full_name: payload.bill_full_name,
        bill_phone_number: payload.bill_phone_number,
        
        // Items - already in correct format from frontend
        items: payload.items,
        
        // Shipping address
        shipping_address: {
            full_name: payload.shipping_address?.full_name || payload.bill_full_name,
            phone_number: payload.shipping_address?.phone_number || payload.bill_phone_number,
            address: payload.shipping_address?.address || '',
            commune_id: payload.shipping_address?.commune_id || null,
            district_id: payload.shipping_address?.district_id || null,
            province_id: payload.shipping_address?.province_id || null,
            full_address: payload.shipping_address?.full_address || ''
        },
        
        // Fees and settings
        shipping_fee: payload.shipping_fee || 0,
        total_discount: payload.total_discount || 0,
        is_free_shipping: payload.is_free_shipping || false,
        received_at_shop: payload.received_at_shop || false,
        
        // Order notes
        note: payload.note || '',
        custom_id: payload.custom_id || `WEB_${Date.now()}`
    };

    console.log('📤 Sending to Pancake API:', JSON.stringify(pancakePayload, null, 2));

    try {
        // Call Pancake API
        const pancakeResponse = await createPancakeOrder(pancakePayload, API_KEY, SHOP_ID);
        
        if (pancakeResponse) {
            console.log('✅ Order created successfully:', pancakeResponse);
            
            // Track purchase for analytics
            await trackPurchaseEvent(payload.items, {
                name: payload.bill_full_name,
                phone: payload.bill_phone_number
            });
            
            res.status(200).json({
                success: true,
                order: pancakeResponse,
                message: 'Order created successfully'
            });
        } else {
            throw new Error('Pancake API returned null response');
        }
        
    } catch (error) {
        console.error('❌ Order creation failed:', error);
        res.status(500).json({
            error: 'Order creation failed',
            message: error.message || 'Please try again or contact support',
            details: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
}

// ==========================================
// PANCAKE API INTEGRATION
// ==========================================

async function createPancakeOrder(payload, apiKey, shopId) {
    const url = `https://pos.pancake.vn/api/v1/shops/${shopId}/orders?api_key=${encodeURIComponent(apiKey)}`;
    
    try {
        console.log('🔗 Calling Pancake API:', url);
        
        const response = await fetch(url, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'User-Agent': 'Sincera-Web/1.0'
            },
            body: JSON.stringify(payload)
        });
        
        const result = await response.json();
        console.log('📥 Pancake API response:', {
            status: response.status,
            success: result?.success,
            data: result?.data ? 'Present' : 'Missing',
            error: result?.error || result?.message
        });
        
        if (response.ok && result?.success !== false) {
            return result.data || result;
        } else {
            console.error('❌ Pancake API error:', { 
                status: response.status, 
                error: result 
            });
            throw new Error(`Pancake API error: ${result?.message || result?.error || 'Unknown error'}`);
        }
    } catch (error) {
        console.error('💥 Pancake API request failed:', error);
        throw error;
    }
}

// ==========================================
// ANALYTICS TRACKING
// ==========================================

async function trackPurchaseEvent(items, customerInfo) {
    try {
        const purchaseData = {
            event_type: 'purchase',
            session_id: `checkout_${Date.now()}`,
            visitor_id: `customer_${Date.now()}`,
            timestamp: Date.now(),
            data: {
                order_total: items.reduce((sum, item) => {
                    // Estimate price from variation_id (fallback logic)
                    const estimatedPrice = 300000; // Default price for calculation
                    return sum + (estimatedPrice * (item.quantity || 1));
                }, 0),
                items: items,
                customer_info: {
                    name: customerInfo.name,
                    phone: customerInfo.phone
                }
            }
        };

        // Send to tracking API (don't await to avoid blocking checkout)
        fetch('/api/track', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(purchaseData)
        }).catch(err => console.warn('⚠️ Purchase tracking failed:', err.message));
        
        console.log('📊 Purchase tracking initiated');
    } catch (error) {
        console.error('⚠️ Purchase tracking error:', error);
        // Don't fail checkout if tracking fails
    }
}