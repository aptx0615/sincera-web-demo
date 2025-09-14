// ==========================================
// CART THRESHOLD MANAGER
// Quản lý hiển thị sections dựa trên giá trị giỏ hàng
// ==========================================

class CartThresholdManager {
    constructor(thresholdAmount = 339000) {
        this.thresholdAmount = thresholdAmount;
        this.hiddenSections = [];
        this.giftPopupShown = false;
        this.init();
        window.cartThresholdManager = this;
    }

    init() {
        // Ẩn sections ban đầu
        this.hideSections();
        
        // Lắng nghe sự kiện cart update
        this.setupEventListeners();
        
        // Hiện footer ngay khi init
        this.initProgressFooter();
        
        console.log(`🎯 CartThresholdManager initialized with threshold: ${new Intl.NumberFormat('vi-VN', {style: 'currency', currency: 'VND'}).format(this.thresholdAmount)}`);
    }

    hideSections() {
        this.hiddenSections.forEach(selector => {
            const section = document.querySelector(selector);
            if (section) {
                section.style.display = 'none';
                section.setAttribute('data-threshold-hidden', 'true');
                console.log(`🙈 Hiding section: ${selector}`);
            }
        });
    }

    showSections() {
        this.hiddenSections.forEach(selector => {
            const section = document.querySelector(selector);
            if (section && section.style.display === 'none') {
                section.style.display = 'block';
                section.removeAttribute('data-threshold-hidden');
                
                // Smooth reveal animation
                section.style.opacity = '0';
                section.style.transform = 'translateY(20px)';
                section.style.transition = 'all 0.6s ease';
                
                setTimeout(() => {
                    section.style.opacity = '1';
                    section.style.transform = 'translateY(0)';
                }, 50);
                
                console.log(`👁️ Showing section: ${selector}`);
            }
        });
    }

    setupEventListeners() {
        // Listen for custom cart update events
        document.addEventListener('cartUpdated', (event) => {
            this.checkThreshold(event.detail.cartTotal);
            
            // Nếu đang ở threshold và có thay đổi về free charm, update lại
            if (event.detail.cartTotal >= this.thresholdAmount) {
                this.showThresholdReached();
            }
        });

        // Listen for storage changes (if cart is synced across tabs)
        window.addEventListener('storage', (event) => {
            if (event.key === 'cart') {
                const cart = JSON.parse(event.newValue || '[]');
                const total = this.calculateCartTotal(cart);
                this.checkThreshold(total);
            }
        });
    }

    checkThreshold(cartTotal) {
        console.log(`🛒 Cart total: ${new Intl.NumberFormat('vi-VN', {style: 'currency', currency: 'VND'}).format(cartTotal)}`);
        
        if (cartTotal >= this.thresholdAmount) {
            console.log('✅ Threshold reached! Showing completion message...');
            this.showThresholdReached();
            this.showGiftWidget();
        } else {
            console.log('📊 Showing progress footer...');
            this.showProgressTeaser(cartTotal);
            // Ẩn widget nếu cart drop below threshold
            this.hideGiftWidget();
        }
    }

    showGiftWidget() {
        const widget = document.getElementById('gift-widget');
        if (widget) {
            widget.classList.add('show');
            console.log('🎁 Gift widget shown');
        }
    }    
    hideGiftWidget() {
        const widget = document.getElementById('gift-widget');
        if (widget) {
            widget.classList.remove('show');
            console.log('🎁 Gift widget hidden');
        }
    }
    closeGiftPopup() {
        const modal = document.getElementById('gift-charm-modal');
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    }

    showProgressTeaser(cartTotal) {
        const progressFooter = document.querySelector('#progress-footer');
        const progressText = document.querySelector('#progress-text');
        const progressFill = document.querySelector('#progress-mini-fill');
        const remainingAmountEl = document.querySelector('.remaining-amount');
        
        if (!progressFooter) return;
        
        const remaining = Math.max(0, this.thresholdAmount - cartTotal);
        const percentage = Math.min((cartTotal / this.thresholdAmount) * 100, 100);
        
        // FIX: Reset lại text về trạng thái "còn thiếu" khi cart < threshold
        if (progressText) {
            progressText.innerHTML = `Chỉ còn <span class="remaining-amount">${new Intl.NumberFormat('vi-VN', {style: 'currency', currency: 'VND'}).format(remaining)}</span> để nhận charm bạc miễn phí`;
        }
        
        // Update progress bar
        if (progressFill) {
            progressFill.style.width = percentage + '%';
        }
        
        // Luôn hiện footer
        progressFooter.style.display = 'block';
        
        console.log(`📊 Footer Progress: ${percentage.toFixed(1)}% | Remaining: ${new Intl.NumberFormat('vi-VN', {style: 'currency', currency: 'VND'}).format(remaining)}`);
    }
    initProgressFooter() {
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        const total = this.calculateCartTotal(cart);
        this.checkThreshold(total);
    }
    hasFreeCharmInCart() {
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        return cart.some(item => item.isFreePromo === true);
    }

    showThresholdReached() {
        const progressFooter = document.querySelector('#progress-footer');
        const progressText = document.querySelector('#progress-text');
        
        if (!progressFooter || !progressText) return;
        
        // Kiểm tra xem đã có free charm trong cart chưa
        const hasFreeCharm = this.hasFreeCharmInCart();
        
        if (hasFreeCharm) {
            // Đã chọn free charm - hiện message hoàn thành
            progressText.innerHTML = 'Charm miễn phí đã có ở giỏ hàng, từ giờ bạn có thể mua thêm charm theo ý thích';
        } else {
            // Chưa chọn free charm - mời chọn
            progressText.innerHTML = 'Mời bạn chọn charm miễn phí trong danh sách (số lượng: 1 charm)';
        }
        
        const progressFill = document.querySelector('#progress-mini-fill');
        if (progressFill) {
            progressFill.style.width = '100%';
        }
        
        progressFooter.style.display = 'block';
    }

    hideProgressTeaser() {
        const progressSection = document.querySelector('#progress-teaser');
        if (progressSection) {
            progressSection.style.display = 'none';
        }
    }

    showValueProps() {
        const valueSection = document.querySelector('#value-props');
        if (valueSection) {
            valueSection.style.display = 'block';
            valueSection.style.opacity = '0';
            valueSection.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                valueSection.style.opacity = '1';
                valueSection.style.transform = 'translateY(0)';
                valueSection.style.transition = 'all 0.6s ease';
            }, 50);
        }
    }

    hideValueProps() {
        const valueSection = document.querySelector('#value-props');
        if (valueSection) {
            valueSection.style.display = 'none';
        }
    }

    showThresholdNotification() {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 80px;
            right: 20px;
            background: linear-gradient(135deg, #4CAF50, #45a049);
            color: white;
            padding: 20px;
            border-radius: 12px;
            box-shadow: 0 6px 25px rgba(76, 175, 80, 0.3);
            z-index: 10001;
            font-weight: 500;
            max-width: 320px;
            transition: all 0.3s ease;
            transform: translateX(100%);
        `;
        
        notification.innerHTML = `
            <div style="display: flex; align-items: center; gap: 12px;">
                <span style="font-size: 24px;">🎁</span>
                <div>
                    <div style="font-weight: 600; margin-bottom: 4px;">Chúc mừng!</div>
                    <div style="font-size: 14px; opacity: 0.9;">Bạn đã đủ điều kiện nhận FREE CHARM!</div>
                </div>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => notification.remove(), 300);
        }, 5000);
    }

    showThresholdLostNotification() {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 80px;
            right: 20px;
            background: white;
            color: black;
            padding: 15px;
            border-radius: 12px;
            box-shadow: 0 6px 25px rgba(0, 0, 0, 0.15);
            z-index: 10001;
            font-weight: 500;
            max-width: 280px;
            transition: all 0.3s ease;
            transform: translateX(100%);
            border: 1px solid #e0e0e0;
        `;
        
        notification.innerHTML = `
            <div style="display: flex; align-items: center; gap: 12px;">
                <span style="font-size: 24px;">⚠️</span>
                <div>
                    <div style="font-weight: 600; margin-bottom: 4px;">Thông báo!</div>
                    <div style="font-size: 14px; opacity: 0.9;">Giỏ hàng dưới 339K - Không đủ điều kiện FREE CHARM</div>
                </div>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => notification.remove(), 300);
        }, 4000);
    }

    calculateCartTotal(cart) {
        return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    }

    checkCurrentCart() {
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        const total = this.calculateCartTotal(cart);
        this.checkThreshold(total);
    }

    updateThreshold(newAmount) {
        this.thresholdAmount = newAmount;
        console.log(`🎯 Threshold updated to: ${new Intl.NumberFormat('vi-VN', {style: 'currency', currency: 'VND'}).format(newAmount)}`);
        this.checkCurrentCart();
    }
        showGiftPopup() {
        console.log('🎁 Showing gift popup...');
        
        // Lấy free charms từ main.js
        const freeCharms = this.getFreeCharms();
        if (freeCharms.length === 0) {
            console.warn('⚠️ No free charms found');
            return;
        }
        
        // Render popup content
        this.renderGiftPopup(freeCharms);
        
        // Show modal
        const modal = document.getElementById('gift-charm-modal');
        if (modal) {
            modal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        }
    }
        getFreeCharms() {
            if (typeof window.CHARM_PRODUCTS !== 'undefined') {
                return window.CHARM_PRODUCTS.filter(charm => 
                    charm.price === 0 &&
                    charm.id && 
                    charm.name
                );
            }
            return [];
        }
        renderGiftPopup(charms) {
        const grid = document.getElementById('gift-charms-grid');
        if (!grid) {
            console.error('❌ Gift grid not found!');
            return;
        }

        grid.innerHTML = '';

        charms.forEach(charm => {
            const charmCard = document.createElement('div');
            charmCard.className = 'gift-charm-card';
            charmCard.setAttribute('data-charm-id', charm.id);
            
            const originalPrice = charm.originalPrice || charm.price || 150000;
            const formattedOriginalPrice = new Intl.NumberFormat('vi-VN', {
                style: 'currency', 
                currency: 'VND'
            }).format(originalPrice);
            
            charmCard.innerHTML = `
                <div class="gift-charm-image">
                    <img src="${charm.image}" alt="${charm.name}" 
                         onerror="this.style.display='none'; this.parentElement.innerHTML='<div style=\\'font-size: 60px; color: #4CAF50; display: flex; align-items: center; justify-content: center; height: 100%;\\'>💎</div>';">
                </div>
                <div class="gift-charm-info">
                    <h3 class="gift-charm-name">${charm.name}</h3>
                    <p class="gift-charm-description">${charm.description}</p>
                    <div class="gift-charm-price">
                        <span class="original-price">${formattedOriginalPrice}</span>
                        <span class="free-price">MIỄN PHÍ</span>
                    </div>
                </div>
            `;

            // Click event
            charmCard.addEventListener('click', () => {
                this.selectGiftCharm(charmCard, charm);
            });

            grid.appendChild(charmCard);
        });

        // Setup close events
        this.setupGiftPopupEvents();
    }

    // 6. THÊM FUNCTION selectGiftCharm:
    selectGiftCharm(cardElement, charm) {
        // Remove selected từ tất cả cards
        document.querySelectorAll('.gift-charm-card').forEach(card => {
            card.classList.remove('selected');
        });
        
        // Add selected cho card được chọn
        cardElement.classList.add('selected');
        
        // Enable confirm button
        const confirmBtn = document.getElementById('gift-confirm-btn');
        if (confirmBtn) {
            confirmBtn.disabled = false;
            confirmBtn.onclick = () => this.confirmGiftCharm(charm);
        }
        
        console.log('🎁 Selected gift charm:', charm.name);
    }

    // 7. THÊM FUNCTION confirmGiftCharm:
    confirmGiftCharm(charm) {
        if (charm.price !== 0) {
            console.error('FRAUD ATTEMPT: Trying to add paid charm as free!', charm);
            alert('Lỗi bảo mật: Charm này không miễn phí!');
            return;
        }

        this.removeAllFreeCharms();
        
        const freeCharm = {
            ...charm,
            price: 0, // FORCE price = 0
            isFreePromo: true
        };
        
        if (window.addToCart) {
            window.addToCart(freeCharm);
            this.closeGiftPopup();
            this.showSwapSuccessNotification(charm.name);
        } else {
            console.error('addToCart function not found');
        }
    }

    removeAllFreeCharms() {
        // Lấy cart hiện tại
        let cart = JSON.parse(localStorage.getItem('cart') || '[]');
        
        // Lọc bỏ tất cả items có isFreePromo = true
        const oldCart = [...cart];
        cart = cart.filter(item => item.isFreePromo !== true);
        
        // Lưu cart mới
        localStorage.setItem('cart', JSON.stringify(cart));
        
        // Dispatch event để update UI
        const removedItems = oldCart.filter(item => item.isFreePromo === true);
        if (removedItems.length > 0) {
            console.log('🗑️ Removed free charms:', removedItems.map(item => item.name));
            
            // Update cart UI
            if (window.updateCartIcon) window.updateCartIcon();
            if (window.updateCartSidebar) window.updateCartSidebar();
            
            // Dispatch cart update event
            const newCartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            const cartUpdateEvent = new CustomEvent('cartUpdated', {
                detail: {
                    cart: cart,
                    cartTotal: newCartTotal,
                    action: 'remove_free_charms',
                    removedItems: removedItems
                }
            });
            document.dispatchEvent(cartUpdateEvent);
        }
    }

    // 8. THÊM FUNCTION closeGiftPopup:
    closeGiftPopup() {
        const modal = document.getElementById('gift-charm-modal');
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    }

    setupGiftPopupEvents() {
        // Close on overlay click
        const overlay = document.querySelector('.gift-modal-overlay');
        if (overlay) {
            overlay.onclick = (e) => {
                if (e.target === overlay) {
                    window.closeGiftModal(); // Dùng global function
                }
            };
        }
    }

    // 10. THÊM FUNCTION showGiftSuccessNotification:
    showGiftSuccessNotification(charmName) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 80px;
            right: 20px;
            background: linear-gradient(135deg, #7a5000, #7a5000);
            color: white;
            padding: 20px;
            border-radius: 12px;
            box-shadow: 0 6px 25px rgba(76, 175, 80, 0.3);
            z-index: 10001;
            font-weight: 500;
            max-width: 320px;
            transition: all 0.3s ease;
            transform: translateX(100%);
        `;
        
        notification.innerHTML = `
            <div style="display: flex; align-items: center; gap: 12px;">
                <span style="font-size: 24px;">🎁</span>
                <div>
                    <div style="font-weight: 600; margin-bottom: 4px;">Đã thêm charm miễn phí!</div>
                    <div style="font-size: 14px; opacity: 0.9;">${charmName} đã được thêm vào giỏ hàng</div>
                </div>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => notification.remove(), 300);
        }, 4000);
    }

    removeAllFreeCharms() {
        let cart = JSON.parse(localStorage.getItem('cart') || '[]');
        const oldCart = [...cart];
        cart = cart.filter(item => item.isFreePromo !== true);
        localStorage.setItem('cart', JSON.stringify(cart));
        
        const removedItems = oldCart.filter(item => item.isFreePromo === true);
        if (removedItems.length > 0) {
            console.log('Removed free charms:', removedItems.map(item => item.name));
            if (window.updateCartIcon) window.updateCartIcon();
            if (window.updateCartSidebar) window.updateCartSidebar();
        }
    }

    getCurrentFreeCharm() {
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        return cart.find(item => item.isFreePromo === true) || null;
    }    
}

window.CartThresholdManager = CartThresholdManager;
window.skipGiftPopup = function() {
    const modal = document.getElementById('gift-charm-modal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
};
window.openGiftModal = function() {
    console.log('🎁 Opening gift modal...');
    
    // Access manager qua global reference
    const manager = window.cartThresholdManager;
    if (!manager) {
        console.error('❌ CartThresholdManager not found');
        return;
    }
    
    // Lấy free charms
    const freeCharms = manager.getFreeCharms();
    console.log('🎁 Free charms found:', freeCharms.length);
    
    if (freeCharms.length > 0) {
        // Render popup content
        manager.renderGiftPopup(freeCharms);
        
        // Show modal
        const modal = document.getElementById('gift-charm-modal');
        if (modal) {
            modal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
            console.log('✅ Gift modal opened');
        } else {
            console.error('❌ Gift modal element not found');
        }
    } else {
        console.warn('⚠️ No free charms available');
    }
};

window.closeGiftModal = function() {
    const modal = document.getElementById('gift-charm-modal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
        console.log('✅ Gift modal closed');
    }
};