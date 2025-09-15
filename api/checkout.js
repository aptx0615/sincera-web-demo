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

    // Validate environment variables
    if (!SHOP_ID || !API_KEY || !WAREHOUSE_ID) {
        console.error('❌ Missing environment variables');
        return res.status(500).json({
            error: 'Server configuration error',
            message: 'Missing required API credentials'
        });
    }

    const { cart, customerInfo, sizeInfo, note } = req.body;

    // Validate request data
    if (!cart || !customerInfo) {
        return res.status(400).json({
            error: 'Missing required data',
            required: ['cart', 'customerInfo']
        });
    }

    // Build order payload
    const orderPayload = {
        shop_id: Number(SHOP_ID),
        warehouse_id: WAREHOUSE_ID,
        
        // Customer info
        bill_full_name: customerInfo.fullName || '',
        bill_phone_number: customerInfo.phoneNumber || '',
        
        // Items - Convert cart items to Pancake format
        items: cart.map(item => ({
            variation_id: String(item.id),
            quantity: Number(item.quantity) || 1,
            discount_each_product: 0,
            is_bonus_product: item.isFreePromo || false,
            is_discount_percent: false,
            is_wholesale: false,
            one_time_product: false
        })),
        
        // Shipping address
        shipping_address: {
            full_name: customerInfo.fullName || '',
            phone_number: customerInfo.phoneNumber || '',
            address: customerInfo.detailAddress || '',
            commune_id: customerInfo.ward || null,
            district_id: customerInfo.district || null,
            province_id: customerInfo.province || null,
            full_address: buildFullAddress(customerInfo)
        },
        
        // Calculate shipping and totals
        shipping_fee: calculateShippingFee(cart),
        total_discount: 0,
        is_free_shipping: calculateShippingFee(cart) === 0,
        received_at_shop: false,
        
        // Order note with size info
        note: buildOrderNote(sizeInfo, note),
        
        // Custom order ID
        custom_id: `WEB_${Date.now()}`
    };

    try {
        console.log('📤 Creating Pancake order...');
        
        // Call Pancake API
        const pancakeResponse = await createPancakeOrder(orderPayload, API_KEY, SHOP_ID);
        
        if (pancakeResponse) {
            console.log('✅ Order created successfully');
            
            // Track purchase for analytics
            await trackPurchaseEvent(cart, customerInfo);
            
            res.status(200).json({
                success: true,
                order: pancakeResponse,
                message: 'Order created successfully'
            });
        } else {
            throw new Error('Pancake API returned null');
        }
        
    } catch (error) {
        console.error('❌ Order creation failed:', error);
        res.status(500).json({
            error: 'Order creation failed',
            message: 'Please try again or contact support'
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
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        
        const result = await response.json();
        
        if (response.ok && result?.success !== false) {
            return result.data || result;
        } else {
            console.error('❌ Pancake API error:', { 
                status: response.status, 
                error: result 
            });
            return null;
        }
    } catch (error) {
        console.error('💥 Pancake API request failed:', error);
        return null;
    }
}

// ==========================================
// HELPER FUNCTIONS
// ==========================================

function buildFullAddress(customerInfo) {
    const parts = [
        customerInfo.detailAddress,
        customerInfo.wardName,
        customerInfo.districtName,
        customerInfo.provinceName
    ].filter(Boolean);
    
    return parts.join(', ');
}

function buildOrderNote(sizeInfo, customerNote = '') {
    let note = '';
    
    if (sizeInfo) {
        if (sizeInfo.ring1?.size) {
            note += `Vòng 1: ${sizeInfo.ring1.size}cm`;
            if (sizeInfo.ring1.name) note += ` (${sizeInfo.ring1.name})`;
            note += '\n';
        }
        
        if (sizeInfo.ring2?.size) {
            note += `Vòng 2: ${sizeInfo.ring2.size}cm`;
            if (sizeInfo.ring2.name) note += ` (${sizeInfo.ring2.name})`;
            note += '\n';
        }
        
        if (sizeInfo.sameSize) {
            note += 'Ghi chú: Cả 2 vòng cùng size\n';
        }
    }
    
    if (customerNote) {
        note += `\nGhi chú khách hàng: ${customerNote}`;
    }
    
    return note.trim();
}

function calculateShippingFee(cart) {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    return subtotal >= 300000 ? 0 : 20000;
}

// ==========================================
// ANALYTICS TRACKING
// ==========================================

async function trackPurchaseEvent(cart, customerInfo) {
    try {
        const purchaseData = {
            event_type: 'purchase',
            session_id: `checkout_${Date.now()}`,
            visitor_id: `customer_${Date.now()}`,
            timestamp: Date.now(),
            data: {
                order_total: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
                items: cart,
                customer_info: {
                    name: customerInfo.fullName,
                    phone: customerInfo.phoneNumber
                }
            }
        };

        // Send to tracking API
        await fetch('/api/track', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(purchaseData)
        });
        
        console.log('📊 Purchase tracked');
    } catch (error) {
        console.error('⚠️ Purchase tracking failed:', error);
        // Don't fail checkout if tracking fails
    }
}