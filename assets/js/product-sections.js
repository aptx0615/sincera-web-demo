// ==========================================
// PRODUCT SECTIONS MANAGER
// Quản lý tất cả sections sản phẩm độc lập
// ==========================================

class ProductSectionManager {
    constructor() {
        this.sections = new Map();
    }

    // Tạo section mới
    createSection(config) {
        const section = new ProductSection(config);
        this.sections.set(config.id, section);
        return section;
    }

    // Render tất cả sections
    renderAll() {
        this.sections.forEach(section => section.render());
    }

    // Lấy section theo ID
    getSection(id) {
        return this.sections.get(id);
    }
}

class ProductSection {
    constructor(config) {
        this.id = config.id;
        this.title = config.title;
        this.subtitle = config.subtitle;
        this.products = config.products || [];
        this.containerSelector = config.containerSelector;
        this.onAddToCart = config.onAddToCart || (() => {});
        this.onPlayVideo = config.onPlayVideo || (() => {});
    }

    // Render section HTML
    render() {
        const container = document.querySelector(this.containerSelector);
        if (!container) {
            console.error(`Container not found: ${this.containerSelector}`);
            return;
        }

        // Create section HTML
        container.innerHTML = `
            <section class="carousel-section" id="${this.id}">
                <h2 class="section-title">${this.title}</h2>
                <p class="section-subtitle">${this.subtitle}</p>
                <div class="carousel-container">
                    <div class="carousel-track" id="${this.id}-track">
                        
                    </div>
                    <div class="carousel-controls">
                        <button class="carousel-btn carousel-prev" id="${this.id}-prev">❮</button>
                        <button class="carousel-btn carousel-next" id="${this.id}-next">❯</button>
                    </div>
                </div>
            </section>
        `;

        this.renderProducts();
        this.setupNavigation();
    }

    // Render products
    renderProducts() {
        const track = document.querySelector(`#${this.id}-track`);
        if (!track) return;

        track.innerHTML = '';

        this.products.forEach(product => {
            const productCard = this.createProductCard(product);
            track.appendChild(productCard);
        });

        console.log(`✅ Rendered ${this.products.length} products for section: ${this.id}`);
    }

    // Tạo product card
    createProductCard(product) {
        const formattedPrice = new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(product.price);

        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.setAttribute('data-id', product.id);
        
        productCard.innerHTML = `
            <div class="product-image">
                <img src="${product.image}" alt="${product.name}" onerror="this.style.display='none'; this.parentElement.innerHTML='<div style=\\'font-size: 60px; color: #603b11; display: flex; align-items: center; justify-content: center; height: 100%;\\'>📦</div>';">
                <div class="play-video-icon" data-video-url="${product.video}">
                    <img src="images/play.png" alt="Play video">
                </div>
            </div>
            <div class="product-info">
                <h3 class="product-name">${product.name}</h3>
                <p class="product-description">${product.description}</p>
                <div class="product-price">${formattedPrice}</div>
                <div class="add-to-cart-icon" data-product-id="${product.id}">
                    <img src="images/add-to-cart.svg" alt="Add to cart" onerror="this.innerHTML='🛒';">
                </div>
            </div>
        `;

        // Event listeners
        this.setupProductEvents(productCard, product);

        return productCard;
    }

    // Setup product events
    setupProductEvents(productCard, product) {
        // Add to cart
        const addToCartIcon = productCard.querySelector('.add-to-cart-icon');
        addToCartIcon.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.onAddToCart(product);
        });

        // Play video
        const playVideoIcon = productCard.querySelector('.play-video-icon');
        playVideoIcon.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const videoUrl = e.currentTarget.getAttribute('data-video-url');
            this.onPlayVideo(videoUrl, product.name);
        });
    }

    // Setup navigation
    setupNavigation() {
        const track = document.querySelector(`#${this.id}-track`);
        const nextBtn = document.querySelector(`#${this.id}-next`);
        const prevBtn = document.querySelector(`#${this.id}-prev`);

        if (!track || !nextBtn || !prevBtn) return;

        nextBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const cards = track.children;
            if (cards.length > 0) {
                const cardWidth = cards[0].offsetWidth;
                const gap = 30;
                track.scrollLeft += cardWidth + gap;
            }
        });

        prevBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const cards = track.children;
            if (cards.length > 0) {
                const cardWidth = cards[0].offsetWidth;
                const gap = 30;
                track.scrollLeft -= cardWidth + gap;
            }
        });
    }

    // Update products
    updateProducts(newProducts) {
        this.products = newProducts;
        this.renderProducts();
    }

    // Add single product
    addProduct(product) {
        this.products.push(product);
        this.renderProducts();
    }
}

// Export cho global scope
window.ProductSectionManager = ProductSectionManager;