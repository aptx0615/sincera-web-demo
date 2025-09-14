document.addEventListener('DOMContentLoaded', () => {
    initializeCheckoutInfo();
    loadCartSummary();
    setupFormValidation();
    loadAddressData();
});

let addressData = {};

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
    
    console.log(`📦 Cart summary loaded: ${cart.length} items, Subtotal: ${formattedSubtotal}, Shipping: ${formattedShipping}, Total: ${formattedFinalTotal}`);
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
        
        console.log('📝 Loaded saved form data');
    } catch (error) {
        console.error('Error loading saved data:', error);
    }
}

function goBackToCart() {
    saveFormData();
    window.location.href = '/';
}

function proceedToPayment() {
    if (!validateAllFields()) {
        showNotification('Vui lòng điền đầy đủ thông tin!', 'error');
        return;
    }
    
    const orderData = {
        cart: getCartFromStorage(),
        sizeInfo: {
            ring1: {
                size: document.getElementById('ring1-size').value,
                name: document.getElementById('ring1-name').value
            },
            ring2: {
                size: document.getElementById('ring2-size').value,
                name: document.getElementById('ring2-name').value
            },
            sameSize: document.getElementById('sameSize').checked
        },
        shippingInfo: {
            fullName: document.getElementById('fullName').value,
            phoneNumber: document.getElementById('phoneNumber').value,
            detailAddress: document.getElementById('detailAddress').value,
            province: document.getElementById('province').value,
            district: document.getElementById('district').value,
            ward: document.getElementById('ward').value
        },
        timestamp: Date.now()
    };
    
    localStorage.setItem('orderData', JSON.stringify(orderData));
    
    const cart = orderData.cart;
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shippingFee = subtotal >= 300000 ? 0 : 20000;
    const total = subtotal + shippingFee;
    // Track checkout initiation
    if (window.trackCheckout) {
        window.trackCheckout({
            total: total,
            items: cart
        });
    }    
    console.log('💰 Proceeding to payment:', {
        subtotal: subtotal,
        shippingFee: shippingFee,
        totalAmount: total,
        itemCount: cart.length,
        sizeInfo: orderData.sizeInfo,
        shippingInfo: orderData.shippingInfo
    });
    
    showNotification('Đang chuyển đến trang thanh toán...', 'success');
    
    setTimeout(() => {
        window.location.href = 'payment.html';
    }, 1500);
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