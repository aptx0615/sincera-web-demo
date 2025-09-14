// ==========================================
// CHECKOUT-ONLY API SERVICE
// 100% web tĩnh - chỉ gọi API khi thanh toán
// ==========================================

// ======= CẤU HÌNH BẮT BUỘC =======
const SHOP_ID = '1328295561';
const API_KEY = 'd7e2687c391244b590ea95b4ae34b386';
const WAREHOUSE_ID = 'KHO1';

// ======= TẠO ĐƠN HÀNG CHO CHECKOUT =======
async function createPancakeOrder(orderData) {
  const url = `https://pos.pancake.vn/api/v1/shops/${SHOP_ID}/orders?api_key=${encodeURIComponent(API_KEY)}`;
  
  const payload = {
    shop_id: Number(SHOP_ID),
    warehouse_id: WAREHOUSE_ID,
    
    // Customer info từ checkout form
    bill_full_name: orderData?.customer?.name || '',
    bill_phone_number: orderData?.customer?.phone || '',
    
    // Items - Convert cart.id thành variation_id
    items: (orderData?.items || []).map(item => ({
      variation_id: String(item.id), // ✅ cart.id → variation_id
      quantity: Number(item.quantity) || 1,
      
      // Settings cho từng item
      discount_each_product: 0,
      is_bonus_product: item.isFreePromo || false, // FREE CHARM support
      is_discount_percent: false,
      is_wholesale: false,
      one_time_product: false
    })),
    
    // Shipping address từ checkout form
    shipping_address: {
      full_name: orderData?.customer?.name || '',
      phone_number: orderData?.customer?.phone || '',
      address: orderData?.customer?.address || '',
      commune_id: orderData?.customer?.commune_id || null,
      district_id: orderData?.customer?.district_id || null, 
      province_id: orderData?.customer?.province_id || null,
      full_address: orderData?.customer?.full_address || orderData?.customer?.address || ''
    },
    
    // Order settings
    shipping_fee: Number(orderData?.shipping_fee) || 0,
    total_discount: Number(orderData?.total_discount) || 0,
    is_free_shipping: (orderData?.shipping_fee || 0) === 0,
    received_at_shop: false,
    
    // Note bao gồm size info
    note: orderData?.note || '',
    
    // Custom order ID (optional)
    custom_id: orderData?.custom_id || null
  };

  try {
    console.log('[Checkout API] 📤 Tạo đơn hàng...');
    console.log('[Checkout API] 📋 Payload:', JSON.stringify(payload, null, 2));
    
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    const result = await response.json();
    
    if (response.ok && result?.success !== false) {
      console.log('[Checkout API] ✅ Đơn hàng tạo thành công!');
      console.log('[Checkout API] 📦 Order data:', result);
      return result.data || result; 
    } else {
      console.error('[Checkout API] ❌ Tạo đơn thất bại:', { 
        status: response.status, 
        error: result,
        payload: payload 
      });
      return null;
    }
  } catch (error) {
    console.error('[Checkout API] 💥 Lỗi hệ thống:', error);
    return null;
  }
}

// ======= HELPER FUNCTIONS =======
function buildOrderNote(sizeInfo, customerNote = '') {
  let note = '';
  
  // Thêm thông tin size
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
  
  // Thêm ghi chú khách hàng
  if (customerNote) {
    note += `\nGhi chú: ${customerNote}`;
  }
  
  return note.trim();
}

function formatOrderData(cart, customerInfo, sizeInfo, customNote = '') {
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shippingFee = subtotal >= 300000 ? 0 : 20000;
  
  return {
    customer: {
      name: customerInfo.fullName,
      phone: customerInfo.phoneNumber,
      address: customerInfo.detailAddress,
      full_address: `${customerInfo.detailAddress}, ${customerInfo.wardName || ''}, ${customerInfo.districtName || ''}, ${customerInfo.provinceName || ''}`.replace(/,\s*,/g, ',').trim(),
      province_id: customerInfo.province,
      district_id: customerInfo.district,
      commune_id: customerInfo.ward
    },
    items: cart,
    shipping_fee: shippingFee,
    total_discount: 0,
    note: buildOrderNote(sizeInfo, customNote),
    custom_id: `WEB_${Date.now()}` // Unique order ID
  };
}

// ======= TEST FUNCTION =======
async function testOrderCreation() {
  const testData = {
    customer: {
      name: "Test User",
      phone: "0999999999",
      address: "123 Test Street"
    },
    items: [
      { id: "1d57bd57-7251-4b0a-931a-d0ea120213d5", quantity: 1, isFreePromo: false }
    ],
    shipping_fee: 0,
    note: "Test order từ web"
  };
  
  console.log('🧪 Testing order creation...');
  const result = await createPancakeOrder(testData);
  
  if (result) {
    console.log('✅ Test thành công!', result);
  } else {
    console.log('❌ Test thất bại');
  }
  
  return result;
}

// ======= EXPORT FUNCTIONS =======
window.createPancakeOrder = createPancakeOrder;
window.formatOrderData = formatOrderData;
window.testOrderCreation = testOrderCreation;