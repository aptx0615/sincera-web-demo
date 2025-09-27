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
    const SHOP_ID = process.env.PANCAKE_SHOP_ID;
    const API_KEY = process.env.PANCAKE_API_KEY;
    const WAREHOUSE_ID = process.env.PANCAKE_WAREHOUSE_ID;

    console.log('🔍 Environment check:', {
        SHOP_ID: SHOP_ID ? 'Present' : 'Missing',
        API_KEY: API_KEY ? 'Present' : 'Missing', 
        WAREHOUSE_ID: WAREHOUSE_ID ? 'Present' : 'Missing'
    });

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
        console.error('❌ Invalid payload structure:', payload);
        return res.status(400).json({
            error: 'Invalid payload',
            message: 'Items array is required and cannot be empty'
        });
    }

    if (!payload.bill_full_name || !payload.bill_phone_number) {
        console.error('❌ Missing customer info:', {
            name: payload.bill_full_name,
            phone: payload.bill_phone_number
        });
        return res.status(400).json({
            error: 'Missing customer info',
            message: 'Customer name and phone are required'
        });
    }

    // Build Pancake API payload matching your pos.json structure
    const pancakePayload = {
        shop_id: parseInt(SHOP_ID),
        warehouse_id: WAREHOUSE_ID,
        
        // Customer billing info
        bill_full_name: payload.bill_full_name,
        bill_phone_number: payload.bill_phone_number,
        
        // Transform items to match Pancake API format
        items: payload.items.map(item => ({
            variation_id: item.variation_id,
            quantity: parseInt(item.quantity) || 1,
            discount_each_product: item.discount_each_product || 0,
            is_bonus_product: item.is_bonus_product || false,
            is_discount_percent: item.is_discount_percent || false,
            is_wholesale: item.is_wholesale || false,
            one_time_product: item.one_time_product || false
        })),
        
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
        shipping_fee: parseInt(payload.shipping_fee) || 0,
        total_discount: parseInt(payload.total_discount) || 0,
        is_free_shipping: payload.is_free_shipping || false,
        received_at_shop: payload.received_at_shop || false,
        
        prepaid: 0,
        cod: parseInt(payload.cod) + parseInt(payload.prepaid) || 0,
        pending_prepaid: parseInt(payload.prepaid) || 0,
        
        // Order notes
        note: payload.note || '',
        custom_id: payload.custom_id || `WEB_${Date.now()}`
    };

    console.log('📤 Pancake payload prepared:', JSON.stringify(pancakePayload, null, 2));

    try {
        // Step 1: Create Pancake order
        const pancakeResponse = await createPancakeOrder(pancakePayload, API_KEY, SHOP_ID);
        
        if (pancakeResponse) {
            console.log('✅ Order created successfully:', pancakeResponse);
            
            // Step 2: Get tracking URL if order has prepaid amount
            let paymentUrl = null;
            if (pancakePayload.prepaid > 0 && pancakeResponse.system_id) {
                console.log('🔗 Getting tracking URL for system_id:', pancakeResponse.system_id);
                paymentUrl = await getTrackingUrl(pancakeResponse.system_id, API_KEY, SHOP_ID);
            }
            
            // Step 3: Track purchase event
            await trackPurchaseEvent(pancakePayload.items, {
                name: pancakePayload.bill_full_name,
                phone: pancakePayload.bill_phone_number
            });
            
            // Step 4: Return response with payment URL
            const response = {
                success: true,
                order: pancakeResponse,
                message: 'Order created successfully'
            };
            
            // Add payment URL if available
            if (paymentUrl) {
                response.payment_url = paymentUrl;
                console.log('💳 Payment URL included:', paymentUrl);
            }
            
            res.status(200).json(response);
        } else {
            throw new Error('Pancake API returned null response');
        }
        
    } catch (error) {
        console.error('❌ Order creation failed:', {
            message: error.message,
            stack: error.stack,
            response: error.response
        });
        
        res.status(500).json({
            error: 'Order creation failed',
            message: error.message || 'Please try again or contact support',
            debug: process.env.NODE_ENV === 'development' ? {
                stack: error.stack,
                payload: pancakePayload
            } : undefined
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
// GET TRACKING URL FOR PAYMENT
// ==========================================

async function getTrackingUrl(systemId, apiKey, shopId) {
    const url = `https://pos.pancake.vn/api/v1/shops/${shopId}/orders/get_tracking_url?api_key=${encodeURIComponent(apiKey)}`;
    
    try {
        console.log('🔗 Getting tracking URL for system_id:', systemId);
        
        const response = await fetch(url, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'User-Agent': 'Sincera-Web/1.0'
            },
            body: JSON.stringify({
                system_id: parseInt(systemId)
            })
        });
        
        const result = await response.json();
        console.log('📥 Tracking URL response:', {
            status: response.status,
            success: result?.success,
            url: result?.url ? 'Present' : 'Missing'
        });
        
        if (response.ok && result?.success && result?.url) {
            console.log('✅ Tracking URL retrieved:', result.url);
            return result.url;
        } else {
            console.warn('⚠️ Failed to get tracking URL:', result);
            return null; // Don't fail the entire order if tracking URL fails
        }
    } catch (error) {
        console.error('💥 Tracking URL request failed:', error);
        return null; // Don't fail the entire order if tracking URL fails
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
                    const price = item.price || 300000;
                    return sum + (price * (item.quantity || 1));
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
