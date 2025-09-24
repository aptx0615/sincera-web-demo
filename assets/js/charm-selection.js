// ==========================================
// CHARM SELECTION SYSTEM - DYNAMIC PRICING
// Sử dụng CHARM_PRODUCTS từ main.js với dynamic pricing
// ==========================================

// CHARM SELECTION STATE
let charmSelections = {
    ring1: null,
    ring2: null
};

let currentActiveRing = 'ring1';
let currentCartTotal = 0;
let freeCharmUsed = false;
const FREE_CHARM_THRESHOLD = 339000;

function getFreeCharmIds() {
    // Tự động lấy charm có price: 0 từ CHARM_PRODUCTS
    if (typeof window.CHARM_PRODUCTS !== 'undefined' && window.CHARM_PRODUCTS.length > 0) {
        return window.CHARM_PRODUCTS
            .filter(charm => charm.price === 0)
            .map(charm => charm.id);
    }
    return [];
}

// LẤY CHARM PRODUCTS TỪ MAIN.JS
function getCharmProducts() {
    // Blank option luôn đầu tiên
    const blankCharm = {
        id: 'blank',
        name: 'Không gắn charm',
        price: 0,
        originalPrice: 0,
        description: 'Để vòng trơn, không gắn charm',
        image: null,
        id: 'blank-charm',
        isBlank: true
    };

    // Lấy CHARM_PRODUCTS từ main.js nếu có
    if (typeof window.CHARM_PRODUCTS !== 'undefined' && window.CHARM_PRODUCTS.length > 0) {
        // Add originalPrice field cho dynamic pricing
        const charmsWithOriginalPrice = window.CHARM_PRODUCTS.map(charm => ({
            ...charm,
            originalPrice: charm.originalPrice || 150000 // Default original price
        }));
        return [blankCharm, ...charmsWithOriginalPrice];
    }
    
    // Fallback nếu main.js chưa load hoặc không có data
    return [blankCharm];
}

// DYNAMIC PRICING LOGIC
function getDynamicCharmPrice(charm) {
    if (charm.isBlank) return 0;
    const freeCharmIds = getFreeCharmIds();
    if (currentCartTotal >= FREE_CHARM_THRESHOLD && 
        freeCharmIds.includes(charm.id) && 
        !hasAnyFreeCharmInCart()) {
        return charm.originalPrice || charm.price;
    }
    
    return charm.originalPrice || charm.price;
}

function isCharmFree(charm) {
    if (charm.isBlank) return false;
    
    // Luôn return false (đã fix trước đó)
    return false;
}
// MAIN CHARM SELECTION FUNCTIONS
function initCharmSelection() {
    updateCurrentCartTotal();
    setupCartListener(); 
    renderCharmCarousels();
    setupCharmEventListeners();
    updateProgressIndicator();
}

function updateCurrentCartTotal() {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    currentCartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
}

function setupCartListener() {
    document.addEventListener('cartUpdated', (event) => {
        const newTotal = event.detail.cartTotal;
        const oldTotal = currentCartTotal;
        
        if (newTotal !== oldTotal) {
            currentCartTotal = newTotal;
        }
        
        const cartHasFreeCharm = hasAnyFreeCharmInCart();
    });
}

// CHECK FREE CHARM IN CART
function hasAnyFreeCharmInCart() {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    return cart.some(item => item.isFreePromo === true);
}

function getFreeCharmCountInCart() {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    return cart.filter(item => item.isFreePromo === true).length;
}

function renderCharmCarousels() {
    renderCharmCarousel('ring1');
    renderCharmCarousel('ring2');
}

function renderCharmCarousel(ringId) {
    const track = document.querySelector(`#${ringId}-track`);
    if (!track) {
        console.error(`Track not found: #${ringId}-track`);
        return;
    }

    track.innerHTML = '';

    // Lấy charm products từ main.js
    const charmProducts = getCharmProducts();

    charmProducts.forEach(charm => {
        const productCard = createCharmCard(charm, ringId);
        track.appendChild(productCard);
    });
}

function createCharmCard(charm, ringId) {
    const dynamicPrice = getDynamicCharmPrice(charm);
    const isFree = isCharmFree(charm); // Sẽ luôn false sau khi fix
    
    const formattedPrice = new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(dynamicPrice);

    const productCard = document.createElement('div');
    productCard.className = `product-card ${charm.isBlank ? 'charm-blank' : ''}`; // REMOVE ${isFree ? 'charm-free' : ''}
    productCard.setAttribute('data-charm-id', charm.id);
    productCard.setAttribute('data-ring-id', ringId);

    if (charm.isBlank) {
        productCard.innerHTML = `
            <div class="product-image">
                <div class="blank-charm-icon">⭕</div>
                <div class="blank-charm-text">Không gắn charm</div>
            </div>
            <div class="product-info">
                <h3 class="product-name">${charm.name}</h3>
                <p class="product-description">${charm.description}</p>
                <div class="product-price">${formattedPrice}</div>
            </div>
        `;
    } else {
        // SIMPLE VERSION - Không có free badge và free price logic
        productCard.innerHTML = `
            <div class="product-image">
                <img src="${charm.image}" alt="${charm.name}" 
                     onerror="this.style.display='none'; this.parentElement.innerHTML='<div style=\\'font-size: 60px; color: #603b11; display: flex; align-items: center; justify-content: center; height: 100%;\\'>💎</div>';">
            </div>
            <div class="product-info">
                <h3 class="product-name">${charm.name}</h3>
                <p class="product-description">${charm.description}</p>
                <div class="product-price">${formattedPrice}</div>
                <div class="add-to-cart-icon" data-product-id="${charm.id}">
                    <img src="images/add-to-cart.svg" alt="Add to cart" onerror="this.innerHTML='🛒';">
                </div>
            </div>
        `;
    }

    // Add click event for selection (chỉ khi click vào card, không phải icon)
    productCard.addEventListener('click', (e) => {
        // Không trigger nếu click vào add-to-cart-icon
        if (e.target.closest('.add-to-cart-icon')) return;
        
        // Update charm với giá bình thường (không free)
        const charmWithDynamicPrice = {
            ...charm,
            price: dynamicPrice,
            isFreePromo: false // KHÔNG free từ carousel
        };
        selectCharmForRing(charmWithDynamicPrice, ringId);
    });

    // Add to cart functionality cho charm (nếu không phải blank)
    if (!charm.isBlank) {
        const addToCartIcon = productCard.querySelector('.add-to-cart-icon');
        addToCartIcon.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            const charmForCart = {
                ...charm,
                price: dynamicPrice, 
                isFreePromo: false,
                originalPrice: charm.originalPrice || charm.price
            };
            
            // Gọi addToCart function từ main.js
            if (window.addToCart) {
                window.addToCart(charmForCart);
            } else {
                console.error('addToCart function not found');
            }
        });
    }
    return productCard;
}
function selectCharmForRing(charm, ringId) {
    charmSelections[ringId] = charm;
    updateCharmSelection(ringId);    
    updateTabPreview(ringId);
}

function updateCharmSelection(ringId) {
    const track = document.querySelector(`#${ringId}-track`);
    const selectedCharm = charmSelections[ringId];

    track.querySelectorAll('.product-card').forEach(card => {
        const charmId = card.getAttribute('data-charm-id');
        if (charmId === selectedCharm?.id) {
            card.classList.add('selected');
        } else {
            card.classList.remove('selected');
        }
    });
}

function updateTabPreview(ringId) {
    const preview = document.querySelector(`#${ringId}-preview`);
    if (!preview) {
        console.error(`Preview element not found: #${ringId}-preview`);
        return;
    }
    
    const charm = charmSelections[ringId];

    if (charm && charm.id) {
        if (charm.isBlank) {
            preview.textContent = 'Không charm';
        } else {
            preview.textContent = charm.name;
        }
    } else {
        preview.textContent = 'Chưa chọn';
    }
}

function setupCharmEventListeners() {
    // Tab switching
    document.querySelectorAll('.charm-tab').forEach(tab => {
        tab.addEventListener('click', (e) => {
            const ringId = e.currentTarget.getAttribute('data-ring');
            switchCharmTab(ringId);
        });
    });

    // Carousel navigation
    setupCharmCarouselNavigation('ring1');
    setupCharmCarouselNavigation('ring2');
}

function switchCharmTab(ringId) {
    currentActiveRing = ringId;

    // Update tab visual states
    document.querySelectorAll('.charm-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelector(`[data-ring="${ringId}"]`).classList.add('active');

    // Update carousel visibility
    document.querySelectorAll('.charm-carousel-container').forEach(container => {
        container.classList.remove('active');
    });
    document.querySelector(`#${ringId}-carousel`).classList.add('active');
}

function setupCharmCarouselNavigation(ringId) {
    const track = document.querySelector(`#${ringId}-track`);
    const nextBtn = document.querySelector(`#${ringId}-carousel .carousel-next`);
    const prevBtn = document.querySelector(`#${ringId}-carousel .carousel-prev`);

    if (!track || !nextBtn || !prevBtn) {
        console.warn(`Navigation elements not found for ${ringId}`);
        return;
    }

    nextBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const cards = track.children;
        if (cards.length > 0) {
            const cardWidth = cards[0].offsetWidth;
            const gap = 30;
            track.scrollLeft += cardWidth + gap;
        }
    });

    prevBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const cards = track.children;
        if (cards.length > 0) {
            const cardWidth = cards[0].offsetWidth;
            const gap = 30;
            track.scrollLeft -= cardWidth + gap;
        }
    });
}

// PROGRESS INDICATOR
function updateProgressIndicator() {
}

// NOTIFICATION SYSTEM
function showCharmNotification(message, type = 'info') {
    // Reuse existing notification system
    if (window.showNotification) {
        window.showNotification(message, type);
    } else {
    }
}

// PUBLIC API cho external access
window.charmSelection = {
    getCurrentSelections: () => charmSelections,
    updateCartTotal: updateCurrentCartTotal,
    rerender: renderCharmCarousels
};

// INITIALIZE ON DOM READY
document.addEventListener('DOMContentLoaded', () => {
    // Only initialize if charm selection section exists
    if (document.querySelector('#charm-selection')) {
        initCharmSelection();
    }
});