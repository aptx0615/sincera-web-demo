// ==========================================
// SINCERA TRACKING SDK - MAIN SYSTEM
// Free tracking solution with pixel integration
// ==========================================

class SinceraTracker {
    constructor() {
        this.config = null;
        this.sessionId = null;
        this.visitorId = null;
        this.startTime = Date.now();
        this.pageViews = [];
        this.events = [];
        this.productClicks = [];
        this.scrollDepthTracked = [];
        
        this.init();
    }

    async init() {
        try {
            // Load config
            await this.loadConfig();
            
            // Generate IDs
            this.generateIds();
            
            // Setup tracking
            this.setupEventListeners();
            this.trackPageView();
            this.startSessionTimer();
            
            console.log('🎯 Sincera Tracker initialized', {
                sessionId: this.sessionId,
                visitorId: this.visitorId
            });
        } catch (error) {
            console.error('❌ Tracker initialization failed:', error);
        }
    }

    async loadConfig() {
        try {
            const response = await fetch('/tracking-config.json');
            this.config = await response.json();
        } catch (error) {
            console.error('Config load failed:', error);
            // Fallback config
            this.config = {
                tracking: { enabled: true, debug: true },
                endpoints: { track: '/api/track' },
                events: { pageView: true, productClick: true, addToCart: true }
            };
        }
    }

    generateIds() {
        // Session ID (new mỗi session)
        this.sessionId = 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        
        // Visitor ID (persistent)
        this.visitorId = localStorage.getItem('sincera_visitor_id');
        if (!this.visitorId) {
            this.visitorId = 'visitor_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('sincera_visitor_id', this.visitorId);
        }
    }

    // ==========================================
    // TRAFFIC SOURCE TRACKING
    // ==========================================
    
    getTrafficSource() {
        const urlParams = new URLSearchParams(window.location.search);
        const referrer = document.referrer;
        
        return {
            // UTM Parameters
            utm_source: urlParams.get('utm_source'),
            utm_medium: urlParams.get('utm_medium'),
            utm_campaign: urlParams.get('utm_campaign'),
            utm_term: urlParams.get('utm_term'),
            utm_content: urlParams.get('utm_content'),
            
            // Referrer Analysis
            referrer: referrer,
            referrer_domain: referrer ? new URL(referrer).hostname : null,
            
            // Source Classification
            source_type: this.classifySource(referrer, urlParams),
            landing_page: window.location.pathname,
            landing_url: window.location.href
        };
    }

    classifySource(referrer, utmParams) {
        if (utmParams.get('utm_source')) return 'utm_campaign';
        if (!referrer) return 'direct';
        
        const domain = new URL(referrer).hostname.toLowerCase();
        
        if (domain.includes('facebook') || domain.includes('fb')) return 'facebook';
        if (domain.includes('google')) return 'google';
        if (domain.includes('instagram')) return 'instagram';
        if (domain.includes('tiktok')) return 'tiktok';
        if (domain.includes('zalo')) return 'zalo';
        
        return 'referral';
    }

    // ==========================================
    // DEVICE & BROWSER DETECTION
    // ==========================================
    
    getDeviceInfo() {
        const ua = navigator.userAgent;
        
        return {
            device_type: this.getDeviceType(),
            browser: this.getBrowser(ua),
            os: this.getOS(ua),
            screen_width: screen.width,
            screen_height: screen.height,
            viewport_width: window.innerWidth,
            viewport_height: window.innerHeight,
            language: navigator.language,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        };
    }

    getDeviceType() {
        if (/tablet|ipad|playbook|silk/i.test(navigator.userAgent)) return 'tablet';
        if (/mobile|iphone|ipod|android|blackberry|opera|mini|windows\sce|palm|smartphone|iemobile/i.test(navigator.userAgent)) return 'mobile';
        return 'desktop';
    }

    getBrowser(ua) {
        if (ua.includes('Chrome')) return 'Chrome';
        if (ua.includes('Firefox')) return 'Firefox';
        if (ua.includes('Safari')) return 'Safari';
        if (ua.includes('Edge')) return 'Edge';
        return 'Unknown';
    }

    getOS(ua) {
        if (ua.includes('Windows')) return 'Windows';
        if (ua.includes('Mac')) return 'macOS';
        if (ua.includes('Linux')) return 'Linux';
        if (ua.includes('Android')) return 'Android';
        if (ua.includes('iOS')) return 'iOS';
        return 'Unknown';
    }

    // ==========================================
    // EVENT TRACKING
    // ==========================================
    
    trackPageView() {
        const pageView = {
            event: 'page_view',
            timestamp: Date.now(),
            page: window.location.pathname,
            title: document.title,
            url: window.location.href,
            referrer: document.referrer
        };

        this.pageViews.push(pageView);
        this.sendEvent('page_view', pageView);
        this.log('📄 Page View:', pageView);
    }

    trackProductClick(productId, productName, productPrice) {
        const productClick = {
            event: 'product_click',
            timestamp: Date.now(),
            product_id: productId,
            product_name: productName,
            product_price: productPrice,
            page: window.location.pathname
        };

        this.productClicks.push(productClick);
        this.sendEvent('product_click', productClick);
        this.log('👆 Product Click:', productClick);
    }

    trackAddToCart(product) {
        const addToCart = {
            event: 'add_to_cart',
            timestamp: Date.now(),
            product_id: product.id,
            product_name: product.name,
            product_price: product.price,
            quantity: product.quantity || 1,
            cart_total: this.getCartTotal()
        };

        this.events.push(addToCart);
        this.sendEvent('add_to_cart', addToCart);
        this.log('🛒 Add to Cart:', addToCart);
    }

    trackRemoveFromCart(product) {
        const removeFromCart = {
            event: 'remove_from_cart',
            timestamp: Date.now(),
            product_id: product.id,
            product_name: product.name,
            cart_total: this.getCartTotal()
        };

        this.events.push(removeFromCart);
        this.sendEvent('remove_from_cart', removeFromCart);
        this.log('🗑️ Remove from Cart:', removeFromCart);
    }

    trackCheckout(cartData) {
        const checkout = {
            event: 'initiate_checkout',
            timestamp: Date.now(),
            cart_total: cartData.total,
            item_count: cartData.items.length,
            items: cartData.items
        };

        this.events.push(checkout);
        this.sendEvent('initiate_checkout', checkout);
        this.log('💳 Initiate Checkout:', checkout);
    }

    trackPurchase(orderData) {
        const purchase = {
            event: 'purchase',
            timestamp: Date.now(),
            order_id: orderData.id,
            order_total: orderData.total,
            items: orderData.items
        };

        this.events.push(purchase);
        this.sendEvent('purchase', purchase);
        this.log('✅ Purchase:', purchase);
    }

    trackChatClick() {
        const chatClick = {
            event: 'chat_click',
            timestamp: Date.now(),
            page: window.location.pathname,
            session_duration: Date.now() - this.startTime,
            pages_viewed: this.pageViews.length,
            products_clicked: this.productClicks.length,
            cart_total: this.getCartTotal()
        };

        this.events.push(chatClick);
        this.sendChatContext();
        this.log('💬 Chat Click:', chatClick);
    }

    // ==========================================
    // SCROLL DEPTH TRACKING
    // ==========================================
    
    trackScrollDepth() {
        const scrollPercent = Math.round(
            (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
        );

        const depths = this.config?.events?.scrollDepth || [25, 50, 75, 90];
        
        depths.forEach(depth => {
            if (scrollPercent >= depth && !this.scrollDepthTracked.includes(depth)) {
                this.scrollDepthTracked.push(depth);
                
                const scrollEvent = {
                    event: 'scroll_depth',
                    timestamp: Date.now(),
                    depth: depth,
                    page: window.location.pathname
                };

                this.events.push(scrollEvent);
                this.sendEvent('scroll_depth', scrollEvent);
                this.log(`📜 Scroll ${depth}%:`, scrollEvent);
            }
        });
    }

    // ==========================================
    // SESSION MANAGEMENT
    // ==========================================
    
    startSessionTimer() {
        // Track session every 30 seconds
        setInterval(() => {
            this.updateSession();
        }, 30000);

        // Track when user leaves
        window.addEventListener('beforeunload', () => {
            this.endSession();
        });
    }

    updateSession() {
        const sessionData = {
            session_id: this.sessionId,
            duration: Date.now() - this.startTime,
            pages_viewed: this.pageViews.length,
            events_count: this.events.length,
            last_activity: Date.now()
        };

        localStorage.setItem('sincera_session', JSON.stringify(sessionData));
    }

    endSession() {
        const sessionSummary = {
            event: 'session_end',
            timestamp: Date.now(),
            session_duration: Date.now() - this.startTime,
            pages_viewed: this.pageViews.length,
            total_events: this.events.length,
            bounce: this.pageViews.length === 1
        };

        this.sendEvent('session_end', sessionSummary);
        this.log('🏁 Session End:', sessionSummary);
    }

    // ==========================================
    // CART UTILITIES
    // ==========================================
    
    getCartTotal() {
        try {
            const cart = JSON.parse(localStorage.getItem('cart') || '[]');
            return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        } catch {
            return 0;
        }
    }

    getCartItems() {
        try {
            return JSON.parse(localStorage.getItem('cart') || '[]');
        } catch {
            return [];
        }
    }

    // ==========================================
    // EVENT LISTENERS SETUP
    // ==========================================
    
    setupEventListeners() {
        // Scroll tracking
        let scrollTimer;
        window.addEventListener('scroll', () => {
            clearTimeout(scrollTimer);
            scrollTimer = setTimeout(() => this.trackScrollDepth(), 150);
        });

        // Click tracking for products
        document.addEventListener('click', (e) => {
            this.handleProductClick(e);
            this.handleChatClick(e);
        });

        // Page visibility change
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.updateSession();
            }
        });
    }

    handleProductClick(e) {
        // Track product card clicks
        const productCard = e.target.closest('.product-card');
        if (productCard) {
            const productId = productCard.getAttribute('data-id') || 
                             productCard.getAttribute('data-product-id') ||
                             productCard.getAttribute('data-product-index');
            
            const productName = productCard.querySelector('.product-name')?.textContent || 'Unknown Product';
            const priceElement = productCard.querySelector('.product-price')?.textContent;
            const productPrice = priceElement ? this.extractPrice(priceElement) : 0;

            if (productId) {
                this.trackProductClick(productId, productName, productPrice);
            }
        }

        // Track offer card clicks
        const offerCard = e.target.closest('.offer-card');
        if (offerCard) {
            const offerId = offerCard.getAttribute('data-id');
            const offerName = offerCard.querySelector('.offer-name')?.textContent || 'Unknown Offer';
            const priceElement = offerCard.querySelector('.offer-price')?.textContent;
            const offerPrice = priceElement ? this.extractPrice(priceElement) : 0;

            if (offerId) {
                this.trackProductClick(offerId, offerName, offerPrice);
            }
        }
    }

    handleChatClick(e) {
        // Detect chat button clicks (you'll need to add chat button later)
        if (e.target.closest('.chat-button') || 
            e.target.closest('[onclick*="chat"]') ||
            e.target.id === 'chat-button') {
            this.trackChatClick();
        }
    }

    extractPrice(priceText) {
        const numbers = priceText.replace(/[^\d]/g, '');
        return numbers ? parseInt(numbers) : 0;
    }

    // ==========================================
    // DATA SENDING
    // ==========================================
    
    async sendEvent(eventType, eventData) {
        if (!this.config?.tracking?.enabled) return;

        try {
            const payload = {
                event_type: eventType,
                session_id: this.sessionId,
                visitor_id: this.visitorId,
                timestamp: Date.now(),
                source: this.getTrafficSource(),
                device: this.getDeviceInfo(),
                data: eventData
            };

            const endpoint = this.config?.endpoints?.track || '/api/track';
            
            await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

        } catch (error) {
            console.error('Failed to send event:', error);
        }
    }

    async sendChatContext() {
        const chatContext = {
            visitor_id: this.visitorId,
            session_id: this.sessionId,
            timestamp: Date.now(),
            
            // Traffic source
            source: this.getTrafficSource(),
            
            // Device info
            device: this.getDeviceInfo(),
            
            // Behavior data
            behavior: {
                session_duration: Date.now() - this.startTime,
                pages_viewed: this.pageViews.length,
                bounce: this.pageViews.length === 1,
                scroll_depth_max: Math.max(...this.scrollDepthTracked, 0),
                total_events: this.events.length
            },
            
            // Product interest
            products: {
                clicked_products: this.productClicks,
                cart_items: this.getCartItems(),
                cart_total: this.getCartTotal()
            },
            
            // Full journey
            page_journey: this.pageViews.map(pv => ({
                page: pv.page,
                timestamp: pv.timestamp,
                title: pv.title
            }))
        };

        // Send to webhook for inbox integration
        try {
            await fetch('/api/track', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    event_type: 'chat_context',
                    ...chatContext
                })
            });
        } catch (error) {
            console.error('Failed to send chat context:', error);
        }

        return chatContext;
    }

    // ==========================================
    // UTILITIES
    // ==========================================
    
    log(message, data = null) {
        if (this.config?.tracking?.debug) {
            console.log(message, data);
        }
    }

    // Public API methods
    track(eventName, data) {
        this.sendEvent(eventName, data);
    }

    getSessionData() {
        return {
            sessionId: this.sessionId,
            visitorId: this.visitorId,
            startTime: this.startTime,
            duration: Date.now() - this.startTime,
            pageViews: this.pageViews.length,
            events: this.events.length,
            cartTotal: this.getCartTotal()
        };
    }
}

// ==========================================
// GLOBAL INITIALIZATION
// ==========================================

// Initialize tracker when DOM is ready
let sinceraTracker;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTracker);
} else {
    initTracker();
}

function initTracker() {
    sinceraTracker = new SinceraTracker();
    
    // Make tracker globally available
    window.SinceraTracker = sinceraTracker;
    
    // Global tracking functions
    window.trackProduct = (id, name, price) => sinceraTracker.trackProductClick(id, name, price);
    window.trackAddToCart = (product) => sinceraTracker.trackAddToCart(product);
    window.trackRemoveFromCart = (product) => sinceraTracker.trackRemoveFromCart(product);
    window.trackCheckout = (cartData) => sinceraTracker.trackCheckout(cartData);
    window.trackPurchase = (orderData) => sinceraTracker.trackPurchase(orderData);
    window.trackChatClick = () => sinceraTracker.trackChatClick();
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SinceraTracker;
}