document.addEventListener('DOMContentLoaded', () => {
    initializeCheckoutInfo();
    loadCartSummary();
    setupFormValidation();
    loadAddressData();
    setupPaymentMethodSelection();
});

let addressData = {};
let currentTotal = 0;

async function loadAddressData() {
    try {
        const response = await fetch('address-data.json');
        addressData = await response.json();
        console.log('📍 Address data loaded successfully');
        populateProvinces();
        setupAddressSelects();
    } catch (error) {
        console.error('Error loading address data:', error);
        setupAddressSelects();
    }
}

function populateProvinces() {
    const provinceSelect = document.getElementById('province');
    provinceSelect.innerHTML = '<option value="">Chọn tỉnh/thành phố</option>';
    
    Object.keys(addressData).forEach(provinceCode => {
        const province = addressData[provinceCode];
        const option = document.createElement('option');
        option.value = provinceCode;
        option.textContent = province.name_with_type;
        provinceSelect.appendChild(option);
    });
}

function initializeCheckoutInfo() {
    console.log('🏪 Checkout Info Page initialized');
    
    loadSavedData();
    setupAutoSave();
    
    const cart = getCartFromStorage();
    if (!cart || cart.length === 0) {
        showNotification('Giỏ hàng trống! Chuyển về trang chủ...', 'error');
        setTimeout(() => {
            window.location.href = '/';
        }, 2000);
        return;
    }
}

function getCartFromStorage() {
    try {
        return JSON.parse(localStorage.getItem('cart') || '[]');
    } catch (error) {
        console.error('Error parsing cart data:', error);
        return [];
    }
}

function toggleSizeGuide() {
    const guide = document.getElementById('sizeGuide');
    const icon = document.querySelector('.toggle-icon');
    
    if (guide.style.display === 'none') {
        guide.style.display = 'block';
        icon.classList.add('rotated');
    } else {
        guide.style.display = 'none';
        icon.classList.remove('rotated');
    }
}

function toggleSameSize() {
    const checkbox = document.getElementById('sameSize');
    const ring1Size = document.getElementById('ring1-size');
    const ring2Size = document.getElementById('ring2-size');
    const ring1Name = document.getElementById('ring1-name');
    const ring2Name = document.getElementById('ring2-name');
    
    if (checkbox.checked) {
        ring2Size.value = ring1Size.value;
        ring2Name.value = ring1Name.value;
        
        ring1Size.addEventListener('input', syncRingSizes);
        ring1Name.addEventListener('input', syncRingNames);
        
        ring2Size.disabled = true;
        ring2Name.disabled = true;
    } else {
        ring1Size.removeEventListener('input', syncRingSizes);
        ring1Name.removeEventListener('input', syncRingNames);
        
        ring2Size.disabled = false;
        ring2Name.disabled = false;
    }
}

function syncRingSizes() {
    if (document.getElementById('sameSize').checked) {
        document.getElementById('ring2-size').value = document.getElementById('ring1-size').value;
    }
}

function syncRingNames() {
    if (document.getElementById('sameSize').checked) {
        document.getElementById('ring2-name').value = document.getElementById('ring1-name').value;
    }
}

function loadCartSummary() {
    const cart = getCartFromStorage();
    const cartSummary = document.getElementById('cartSummary');
    const subtotalEl = document.getElementById('subtotal');
    const finalTotalEl = document.getElementById('finalTotal');
    
    if (!cart || cart.length === 0) {
        cartSummary.innerHTML = '<p>Giỏ hàng trống</p>';
        subtotalEl.textContent = '0₫';
        finalTotalEl.textContent = '0₫';
        currentTotal = 0;
        updatePaymentAmounts();
        return;
    }
    
    let total = 0;
    let cartHTML = '';
    
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        
        const formattedPrice = new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(itemTotal);
        
        cartHTML += `
            <div class="cart-item-summary">
                <img src="${item.image}" alt="${item.name}" class="item-image" 
                     onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIHZpZXdCb3g9IjAgMCA1MCA1MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjUwIiBoZWlnaHQ9IjUwIiBmaWxsPSIjRjBGMEYwIi8+Cjx0ZXh0IHg9IjI1IiB5PSIzMCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjIwIiBmaWxsPSIjNENBRjUwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj7wn5OSPC90ZXh0Pgo8L3N2Zz4K';">
                <div class="item-details">
                    <div class="item-name">${item.name}</div>
                    <div class="item-quantity">Số lượng: ${item.quantity}</div>
                </div>
                <div class="item-price">${formattedPrice}</div>
            </div>
        `;
    });
    
    // Calculate shipping fee
    const shippingFee = total >= 300000 ? 0 : 20000;
    const finalTotal = total + shippingFee;
    
    // Store current total for payment calculations
    currentTotal = finalTotal;
    
    const formattedSubtotal = new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(total);
    
    const formattedShipping = new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(shippingFee);
    
    const formattedFinalTotal = new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(finalTotal);
    
    cartSummary.innerHTML = cartHTML;
    subtotalEl.textContent = formattedSubtotal;
    finalTotalEl.textContent = formattedFinalTotal;
    
    // Update shipping fee display
    const shippingEl = document.querySelector('.shipping-fee');
    if (shippingEl) {
        shippingEl.textContent = shippingFee === 0 ? 'MIỄN PHÍ' : formattedShipping;
    }
    
    // Update payment amounts based on total
    updatePaymentAmounts();
    
    console.log(`📦 Cart summary loaded: ${cart.length} items, Subtotal: ${formattedSubtotal}, Shipping: ${formattedShipping}, Total: ${formattedFinalTotal}`);
}

// SETUP PAYMENT METHOD SELECTION
function setupPaymentMethodSelection() {
    const paymentOptions = document.querySelectorAll('input[name="paymentMethod"]');
    
    paymentOptions.forEach(option => {
        option.addEventListener('change', () => {
            updatePaymentAmounts();
            console.log(`💳 Payment method selected: ${option.value}`);
        });
    });
    
    // Initial update
    updatePaymentAmounts();
}

// UPDATE PAYMENT AMOUNTS BASED ON TOTAL AND SELECTED METHOD
function updatePaymentAmounts() {
    if (currentTotal === 0) return;
    
    const selectedMethod = document.querySelector('input[name="paymentMethod"]:checked');
    if (!selectedMethod) return;
    
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };
    
    if (selectedMethod.value === 'deposit50') {
        // 50% deposit + 50% COD
        const depositAmount = Math.round(currentTotal * 0.5);
        const codAmount = currentTotal - depositAmount;
        
        const depositEl = document.querySelector('.deposit-amount');
        const codEl = document.querySelector('.cod-amount');
        
        if (depositEl) depositEl.textContent = formatCurrency(depositAmount);
        if (codEl) codEl.textContent = formatCurrency(codAmount);
        
    } else if (selectedMethod.value === 'banking100') {
        // 100% banking
        const bankingEl = document.querySelector('.banking-amount');
        if (bankingEl) bankingEl.textContent = formatCurrency(currentTotal);
    }

    // THÊM: Update tất cả amounts luôn để đảm bảo hiển thị đúng
    const depositEl = document.querySelector('.deposit-amount');
    const codEl = document.querySelector('.cod-amount');
    const bankingEl = document.querySelector('.banking-amount');

    const depositAmount = Math.round(currentTotal * 0.5);
    const codAmount = currentTotal - depositAmount;

    if (depositEl) depositEl.textContent = formatCurrency(depositAmount);
    if (codEl) codEl.textContent = formatCurrency(codAmount);
    if (bankingEl) bankingEl.textContent = formatCurrency(currentTotal);
}

function setupFormValidation() {
    const form = document.getElementById('shippingForm');
    const inputs = form.querySelectorAll('input[required], select[required], textarea[required]');
    
    inputs.forEach(input => {
        input.addEventListener('blur', validateField);
        input.addEventListener('input', validateField);
    });
    
    const phoneInput = document.getElementById('phoneNumber');
    phoneInput.addEventListener('input', formatPhoneNumber);
}

function validateField(event) {
    const field = event.target;
    const value = field.value.trim();
    
    field.classList.remove('error');
    
    let isValid = true;
    
    if (field.hasAttribute('required') && !value) {
        isValid = false;
    }
    
    if (field.type === 'tel' && value) {
        const phoneRegex = /^[0-9]{10,11}$/;
        isValid = phoneRegex.test(value.replace(/\s/g, ''));
    }
    
    if (field.type === 'email' && value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        isValid = emailRegex.test(value);
    }
    
    if (!isValid) {
        field.classList.add('error');
    }
    
    updateCheckoutButtonState();
    return isValid;
}

function formatPhoneNumber(event) {
    let value = event.target.value.replace(/\D/g, '');
    if (value.length > 10) value = value.substring(0, 11);
    event.target.value = value;
}

function updateCheckoutButtonState() {
    const checkoutBtn = document.querySelector('.btn-checkout');
    const isValid = validateAllFields();
    
    checkoutBtn.disabled = !isValid;
    checkoutBtn.style.opacity = isValid ? '1' : '0.6';
}

function validateAllFields() {
    const requiredFields = document.querySelectorAll('input[required], select[required], textarea[required]');
    
    for (let field of requiredFields) {
        if (!field.value.trim()) {
            return false;
        }
    }
    
    const phone = document.getElementById('phoneNumber').value.replace(/\s/g, '');
    if (!/^[0-9]{10,11}$/.test(phone)) {
        return false;
    }
    
    return true;
}

function setupAddressSelects() {
    const provinceSelect = document.getElementById('province');
    const districtSelect = document.getElementById('district');
    const wardSelect = document.getElementById('ward');
    
    provinceSelect.addEventListener('change', function() {
        const selectedProvinceCode = this.value;
        
        districtSelect.innerHTML = '<option value="">Chọn quận/huyện</option>';
        wardSelect.innerHTML = '<option value="">Chọn phường/xã</option>';
        districtSelect.disabled = !selectedProvinceCode;
        wardSelect.disabled = true;
        
        if (selectedProvinceCode && addressData[selectedProvinceCode]) {
            const districts = addressData[selectedProvinceCode]['quan-huyen'];
            Object.keys(districts).forEach(districtCode => {
                const district = districts[districtCode];
                const option = document.createElement('option');
                option.value = districtCode;
                option.textContent = district.name_with_type;
                districtSelect.appendChild(option);
            });
            districtSelect.disabled = false;
        }
        
        updateCheckoutButtonState();
    });
    
    districtSelect.addEventListener('change', function() {
        const selectedProvinceCode = provinceSelect.value;
        const selectedDistrictCode = this.value;
        
        wardSelect.innerHTML = '<option value="">Chọn phường/xã</option>';
        wardSelect.disabled = true;
        
        if (selectedProvinceCode && selectedDistrictCode && addressData[selectedProvinceCode]) {
            const wards = addressData[selectedProvinceCode]['quan-huyen'][selectedDistrictCode]['xa-phuong'];
            Object.keys(wards).forEach(wardCode => {
                const ward = wards[wardCode];
                const option = document.createElement('option');
                option.value = wardCode;
                option.textContent = ward.name_with_type;
                wardSelect.appendChild(option);
            });
            wardSelect.disabled = false;
        }
        
        updateCheckoutButtonState();
    });
    
    wardSelect.addEventListener('change', updateCheckoutButtonState);
}

function setupAutoSave() {
    const inputs = document.querySelectorAll('input, select, textarea');
    
    inputs.forEach(input => {
        input.addEventListener('input', saveFormData);
        input.addEventListener('change', saveFormData);
    });
}

function saveFormData() {
    const selectedPaymentMethod = document.querySelector('input[name="paymentMethod"]:checked');
    
    const formData = {
        ring1Size: document.getElementById('ring1-size').value,
        ring1Name: document.getElementById('ring1-name').value,
        ring2Size: document.getElementById('ring2-size').value,
        ring2Name: document.getElementById('ring2-name').value,
        sameSize: document.getElementById('sameSize').checked,
        
        fullName: document.getElementById('fullName').value,
        phoneNumber: document.getElementById('phoneNumber').value,
        detailAddress: document.getElementById('detailAddress').value,
        province: document.getElementById('province').value,
        district: document.getElementById('district').value,
        ward: document.getElementById('ward').value,
        orderNote: document.getElementById('orderNote') ? document.getElementById('orderNote').value : '',
        
        // Save payment method selection
        paymentMethod: selectedPaymentMethod ? selectedPaymentMethod.value : 'deposit50',
        
        timestamp: Date.now()
    };
    
    localStorage.setItem('checkoutFormData', JSON.stringify(formData));
}

function loadSavedData() {
    const savedData = localStorage.getItem('checkoutFormData');
    if (!savedData) return;
    
    try {
        const data = JSON.parse(savedData);
        
        if (data.ring1Size) document.getElementById('ring1-size').value = data.ring1Size;
        if (data.ring1Name) document.getElementById('ring1-name').value = data.ring1Name;
        if (data.ring2Size) document.getElementById('ring2-size').value = data.ring2Size;
        if (data.ring2Name) document.getElementById('ring2-name').value = data.ring2Name;
        if (data.sameSize) document.getElementById('sameSize').checked = data.sameSize;
        
        if (data.fullName) document.getElementById('fullName').value = data.fullName;
        if (data.phoneNumber) document.getElementById('phoneNumber').value = data.phoneNumber;
        if (data.detailAddress) document.getElementById('detailAddress').value = data.detailAddress;
        if (data.province) document.getElementById('province').value = data.province;
        if (data.district) document.getElementById('district').value = data.district;
        if (data.ward) document.getElementById('ward').value = data.ward;
        if (data.orderNote && document.getElementById('orderNote')) document.getElementById('orderNote').value = data.orderNote;
        
        // Restore payment method selection
        if (data.paymentMethod) {
            const paymentMethodRadio = document.getElementById(data.paymentMethod);
            if (paymentMethodRadio) {
                paymentMethodRadio.checked = true;
            }
        }
        
        console.log('📝 Loaded saved form data');
    } catch (error) {
        console.error('Error loading saved data:', error);
    }
}

function goBackToCart() {
    saveFormData();
    window.history.back();
}

async function proceedToPayment() {
    if (!validateAllFields()) {
        showNotification('Vui lòng điền đầy đủ thông tin!', 'error');
        return;
    }
    
    const cart = getCartFromStorage();
    if (!cart || cart.length === 0) {
        showNotification('Giỏ hàng trống!', 'error');
        return;
    }

    // Get selected payment method
    const selectedPaymentMethod = document.querySelector('input[name="paymentMethod"]:checked');
    if (!selectedPaymentMethod) {
        showNotification('Vui lòng chọn phương thức thanh toán!', 'error');
        return;
    }

    try {
        showNotification('Đang xử lý đơn hàng...', 'info');
        
        // Build complete payload với payment method
        const payload = buildCheckoutPayload(cart, selectedPaymentMethod.value);
        
        console.log('📤 Sending checkout payload:', payload);
        
        // Call backend API
        const response = await fetch('https://couple.sincera.vn/api/checkout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const result = await response.json();
        console.log('📥 Checkout response:', result);

        if (response.ok && result.success) {
            // Track purchase success
            if (window.trackPurchase) {
                window.trackPurchase({
                    total: currentTotal,
                    items: cart,
                    order_id: result.order?.id,
                    payment_method: selectedPaymentMethod.value
                });
            }

            // Clear cart and saved data
            localStorage.removeItem('cart');
            localStorage.removeItem('checkoutFormData');
            
            // Redirect based on payment method
            if (selectedPaymentMethod.value === 'deposit50' || selectedPaymentMethod.value === 'banking100') {
                // Redirect to Pancake payment page
                if (result.payment_url) {
                    showNotification('🔄 Chuyển đến trang thanh toán...', 'info');
                    setTimeout(() => {
                        window.location.href = result.payment_url;
                    }, 1500);
                } else {
                    // Fallback to success page if no payment URL
                    showNotification('✅ Đặt hàng thành công!', 'success');
                    setTimeout(() => {
                        window.location.href = `success.html?order=${result.order?.id || 'completed'}`;
                    }, 2000);
                }
            }
            
        } else {
            throw new Error(result.message || result.error || 'Checkout failed');
        }
        
    } catch (error) {
        console.error('❌ Checkout error:', error);
        showNotification('❌ Đặt hàng thất bại: ' + error.message, 'error');
    }
}

// BUILD CHECKOUT PAYLOAD với payment method
function buildCheckoutPayload(cart, paymentMethod) {
    // Calculate payment amounts
    let prepaidAmount = 0;
    let codAmount = 0;
    
    if (paymentMethod === 'deposit50') {
        prepaidAmount = Math.round(currentTotal * 0.5);
        codAmount = currentTotal - prepaidAmount;
    } else if (paymentMethod === 'banking100') {
        prepaidAmount = currentTotal;
        codAmount = 0;
    }
    
    // Transform cart items theo đúng format Pancake API
    const items = cart.map(item => ({
        variation_id: String(item.id), // ID sản phẩm từ pos.json
        quantity: Number(item.quantity) || 1,
        discount_each_product: 0,
        is_bonus_product: Boolean(item.isFreePromo), // Free charm
        is_discount_percent: false,
        is_wholesale: false,
        one_time_product: false
    }));

    // Tính toán
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shippingFee = subtotal >= 300000 ? 0 : 20000;

    // Lấy thông tin từ form
    const customerInfo = {
        fullName: document.getElementById('fullName').value.trim(),
        phoneNumber: document.getElementById('phoneNumber').value.trim(),
        detailAddress: document.getElementById('detailAddress').value.trim(),
        province: document.getElementById('province').value,
        district: document.getElementById('district').value,
        ward: document.getElementById('ward').value,
        provinceName: document.getElementById('province').selectedOptions[0]?.text || '',
        districtName: document.getElementById('district').selectedOptions[0]?.text || '',
        wardName: document.getElementById('ward').selectedOptions[0]?.text || ''
    };

    const fullAddress = [
        customerInfo.detailAddress,
        customerInfo.wardName,
        customerInfo.districtName,
        customerInfo.provinceName
    ].filter(Boolean).join(', ');

    // Combine notes
    const sizeNote = buildSizeNote();
    const orderNote = buildOrderNote();
    const fullNote = [sizeNote, orderNote].filter(Boolean).join('\n\n');

    // Payload theo đúng format payload-api.js với payment info
    return {
        bill_full_name: customerInfo.fullName,
        bill_phone_number: customerInfo.phoneNumber,
        
        items: items,
        
        shipping_address: {
            full_name: customerInfo.fullName,
            phone_number: customerInfo.phoneNumber,
            address: customerInfo.detailAddress,
            commune_id: customerInfo.ward,
            district_id: customerInfo.district, 
            province_id: customerInfo.province,
            full_address: fullAddress
        },
        
        shipping_fee: shippingFee,
        total_discount: 0,
        is_free_shipping: shippingFee === 0,
        received_at_shop: false,
        
        // PAYMENT FIELDS
        prepaid: prepaidAmount,
        cod: codAmount,
        payment_method: paymentMethod,
        
        note: fullNote,
        custom_id: `WEB_${Date.now()}_${paymentMethod.toUpperCase()}`
    };
}

// BUILD SIZE NOTE FROM FORM
function buildSizeNote() {
    const ring1Size = document.getElementById('ring1-size').value.trim();
    const ring1Name = document.getElementById('ring1-name').value.trim();
    const ring2Size = document.getElementById('ring2-size').value.trim();
    const ring2Name = document.getElementById('ring2-name').value.trim();
    const sameSize = document.getElementById('sameSize').checked;
    
    let note = '';
    
    if (ring1Size) {
        note += `Vòng 1: ${ring1Size}cm`;
        if (ring1Name) note += ` (${ring1Name})`;
        note += '\n';
    }
    
    if (ring2Size) {
        note += `Vòng 2: ${ring2Size}cm`;
        if (ring2Name) note += ` (${ring2Name})`;
        note += '\n';
    }
    
    if (sameSize) {
        note += 'Ghi chú: Cả 2 vòng cùng size\n';
    }
    
    return note.trim();
}

// BUILD ORDER NOTE FROM FORM
function buildOrderNote() {
    const orderNote = document.getElementById('orderNote');
    if (orderNote && orderNote.value.trim()) {
        return `Ghi chú đơn hàng: ${orderNote.value.trim()}`;
    }
    return '';
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.15);
        z-index: 10001;
        font-weight: 500;
        transition: all 0.3s ease;
        max-width: 300px;
        word-wrap: break-word;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

const errorCSS = document.createElement('style');
errorCSS.textContent = `
    .input-group input.error,
    .input-group textarea.error,
    .input-group select.error {
        border-color: #f44336 !important;
        background-color: #ffebee;
    }
    .toggle-icon.rotated {
        transform: rotate(180deg);
    }
`;
document.head.appendChild(errorCSS);
