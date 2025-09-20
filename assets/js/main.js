document.addEventListener('DOMContentLoaded', () => {
    // CART THRESHOLD INTEGRATION
    let cartThresholdManager;
    
    // Initialize threshold manager
    cartThresholdManager = new CartThresholdManager(339000); // 339K threshold
    
    // Check current cart on page load
    cartThresholdManager.checkCurrentCart();
    // --- CART SYSTEM ---
    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    // CHAIN PRODUCTS - Đã thay id number thành UUID
    const CHAIN_PRODUCTS = [
    {
        name: "Dây Paperclip",
        price: 390000,
        description: "Bạc s925 | Nhiều size",
        image: "https://content.pancake.vn/2-25/2025/8/17/c2d906c079ec94dd7c5733d32cb08a2a54f8084a.jpg",
        video: "https://content.pancake.vn/2-25/2025/9/15/19f43e6531663a1dfd609bb24508a32d8b8bcef8.mp4",
        variants: [
            {
                id: "83aecf63-b696-4859-89da-105600e93b2a",
                name: "Size 1.7mm",
                price: 390000,
                description: "Bạc s925"
            },
            {
                id: "5255bb57-bede-4397-b35d-2725e45166f7", 
                name: "Size 2.5mm",
                price: 450000,
                description: "Bạc s925"
            },
            {
                id: "ce860650-f470-4a14-b693-c90a45f8f9fa", 
                name: "Size 3.5mm",
                price: 560000,
                description: "Bạc s925"
            },
            {
                id: "ec616bb4-5b9c-4369-9434-534dd946a410", 
                name: "Size 4.5mm",
                price: 690000,
                description: "Bạc s925"
            },
        ]
    },
    {
        name: "Dây Barley Corn",
        price: 330000,
        description: "Bạc s925 | Nhiều size",
        image: "https://content.pancake.vn/2-25/2025/8/17/3b9a852cfdcee5f5b018e0f3ead18f12f3f89412.jpg",
        video: "https://content.pancake.vn/2-25/2025/9/15/ba5c36e91b1b2d018497cefad178ed1ce0a0a968.mp4",
        variants: [
            {
                id: "33cc2dee-abd3-4d64-b32a-95a587399f97",
                name: "Size 1.0mm",
                price: 330000,
                description: "Bạc s925 | Xi Kim"
            },
            {
                id: "46272377-6902-45dc-81da-af4ad9c05272", 
                name: "Size 1.8mm",
                price: 370000,
                description: "Bạc s925"
            },
        ]
    },
    {
        id: "505398cd-5065-47cf-86ae-4271642ce2a5",
        name: "Dây Box",
        price: 360000,
        description: "Bạc s925 | Size 0.8mm",
        image: "https://content.pancake.vn/2-25/2025/8/17/b9901c386298d77ae693185f8bb0ae2caab1faac.jpg",
        video: "https://content.pancake.vn/2-25/2025/9/15/b3afcc57aa1edbbd84649019a7dceb17e101f7f1.mp4"
    },
    {
        id: "2976bcd0-8ed4-4640-94c0-08c620546356",
        name: "Dây Fish",
        price: 590000,
        description: "Bạc s925 | Size [xx] mm",
        image: "https://content.pancake.vn/2-25/2025/8/17/769b66c9f72eb1f3b00414426239d2ae9fd901d5.jpg",
        video: "https://content.pancake.vn/2-25/2025/9/15/f74597b578e9cfd05996a4de2b6948e1a394ccc5.mp4"

    },
    {
        id: "d9c35951-d1e6-4685-a797-00ffd02c1b63",
        name: "Dây Snake Chain",
        price: 580000,
        description: "Bạc s925 | Size 1.5mm",
        image: "https://content.pancake.vn/2-25/2025/8/17/9b5da9db46b5219575b01169eb05911f81d5bc11.jpg",
        video: "https://content.pancake.vn/2-25/2025/9/15/9499a00233e5879898dabd58de0eab0a841377e5.mp4"
    },
    {
        id: "f20aa9cb-b5a9-4ba2-af7f-cf5f46d78fb1",
        name: "Dây Box Belcher",
        price: 399000,
        description: "Bạc s925 | Size 1.5mm",
        image: "https://content.pancake.vn/2-25/2025/8/17/06c58609e74da8157a4dc26e028afb4f05f934b4.jpg",
        video: "https://content.pancake.vn/2-25/2025/9/15/9adfb72d8b5755be031d5ea545652d3aeda9688d.mp4"
    },
    {
        id: "1aa56d69-7ebe-4f45-a21d-284495ef8b53",
        name: "Dây Dot Hash",
        price: 325000,
        description: "Bạc s925 | Size 0.8mm",
        image: "https://content.pancake.vn/2-25/2025/8/17/7ccce87e0a30628b4973c8d5e4ddd9dec797c13f.jpg",
        video: "https://content.pancake.vn/2-25/2025/9/15/88ecffc364e2ec5e9b90a9a3e2e260aea794254d.mp4"
    },
    {
        id: "de9da097-3832-4f8e-84fa-75cb478a3235",
        name: "Dây Heart Link",
        price: 360000,
        description: "Bạc s925 | Size 2.4mm",
        image: "https://content.pancake.vn/2-25/2025/8/17/77f70c214718d6ff7fa1376de4a22822e8a97e42.jpg",
        video: "https://content.pancake.vn/2-25/2025/9/15/58079a07406f66dd39ddfe376c06b076bf2012de.mp4"
    },
    {
        name: "Dây Curb",
        price: 490000,
        description: "Bạc s925 | Nhiều size",
        image: "https://content.pancake.vn/2-25/2025/8/17/ddad2298244cd08fc177fdc0c80182ef03b03856.jpg",
        video: "https://content.pancake.vn/2-25/2025/9/15/1b46c1fc308f381205c794465a9bf99cabf45a07.mp4",
        variants: [
            {
                id: "26c0b07f-e1fa-4161-983b-a43fb2ba9ea3",
                name: "Size 1.7mm",
                price: 490000,
                description: "Bạc s925"
            },
            {
                id: "9d985fbd-af8c-4914-8d1b-eabdf826bc1a", 
                name: "Size 2.5mm",
                price: 499000,
                description: "Bạc s925"
            }
        ]
    },
    {
        id: "73b296d0-c747-4d3f-ae36-c582ba5260c4",
        name: "Dây Bạc Herring Bone",
        price: 0,
        description: "Bạc s925 | Size 2.0mm",
        image: "https://content.pancake.vn/2-25/2025/8/17/19b2704c5fcb707572bbabdc4ac68d7ac3d5604f.jpg",
        video: "https://content.pancake.vn/2-25/2025/9/15/58079a07406f66dd39ddfe376c06b076bf2012de.mp4"
    },
    {
        id: "e4e251ad-327a-4b47-baa9-ea2d1f1e94f5",
        name: "Dây Bird Eye",
        price: 570000,
        description: "Bạc s925 | Size 2.5mm",
        image: "https://content.pancake.vn/2-25/2025/8/17/028fa20a2e190951e90b88472202663877ae38f4.jpg",
        video: "https://content.pancake.vn/2-25/2025/9/15/4ccb4da6016b560331cddacc39d9ea03803d782b.mp4"
    },
    {
        id: "4357d4a2-fb71-484f-a009-c92bd9134cc8",
        name: "Dây Rolo",
        price: 690000,
        description: "Bạc s925 | Size 3.5mm",
        image: "https://content.pancake.vn/2-25/2025/8/17/80647390d3a8e00e144e775e0b822bb6f0951474.jpg",
        video: "https://content.pancake.vn/2-25/2025/9/15/49ad8cffd4ae56703aa2f678e3c518aaffab9d91.mp4"
    },
    {
        name: "Dây Sequin",
        price: 330000,
        description: "Bạc s925 | Nhiều size",
        image: "https://content.pancake.vn/2-25/2025/8/17/7552f1b46f01712b154fa54d4f3bd99f5c2f335e.jpg",
        video: "https://content.pancake.vn/2-25/2025/9/15/6565b42248baf0c3db736b231e8029a6eafa0079.mp4",
        variants: [
            {
                id: "31a2fb94-010e-4ec6-aa25-599d0cb57ab9",
                name: "Size 2.5mm",
                price: 380000,
                description: "Bạc s925 | Xi Kim"
            },
            {
                id: "46272377-6902-45dc-81da-af4ad9c05272", 
                name: "Size 2.7mm",
                price: 410000,
                description: "Bạc s925"
            },
        ]
    },
    {
        id: "6f3a5803-f7a7-4cf3-b345-0342fa233636",
        name: "Dây Bạc Sincera #2 | CBSCR02",
        price: 999000,
        description: "[Mẫu giới hạn] Dây Sincera #02",
        image: "https://content.pancake.vn/2-25/2025/8/17/3af76d6a118f32c911fa5befb25e405ecd725e09.jpg",
        video: "https://content.pancake.vn/2-25/2025/9/15/3ac3a26bbcd7fb507fe980e0ad96c610488d3edf.mp4"
    },
    {
        id: "20a9e9d3-03e6-4aed-88c0-00f7bf795505",
        name: "Dây Bạc Sincera #1 | CBSCR01",
        price: 690000,
        description: "[Mẫu giới hạn] Dây Sincera #01",
        image: "https://content.pancake.vn/2-25/2025/8/17/1157fce5de22ad69e752fc700004c0bff4be8e88.jpg",
        video: "https://content.pancake.vn/2-25/2025/9/15/f95030a7db5dee7a854b6316ff9db22cb4bfc471.mp4"
    },
    {
        id: "43aa9ea6-538f-40ed-a174-9c4be1bec273",
        name: "Dây Solid O",
        price: 330000,
        description: "Bạc s925 | Size 1.5mm",
        image: "https://content.pancake.vn/2-25/2025/8/17/0f4c54371260b93ee4b70bff59367135396a3add.jpg",
        video: "https://content.pancake.vn/2-25/2025/9/15/06edc76956cfe2fb3df00692efbdebd2dac2ff57.mp4"
    },
    {
        id: "1d57bd57-7251-4b0a-931a-d0ea120213d5",
        name: "Dây Basic O",
        price: 319000,
        description: "Bạc s925 | Size 1.5mm",
        image: "https://content.pancake.vn/2-25/2025/8/17/ddad2298244cd08fc177fdc0c80182ef03b03856.jpg"
    }
    ];

    // CLASP PRODUCTS
    const CLASP_PRODUCTS = [
    {
        id: "0180dc79-6fd1-4cb0-8b16-ecaf37b6d207",
        name: "Khóa Cài Cố Định O Basic 5mm",
        price: 0,
        description: "Bạc s925 | FREE & MẶC ĐỊNH cho mọi vòng nếu bạn không chọn khóa",
        image: "https://content.pancake.vn/2-25/2025/9/11/9f82378a71f66c6317d35ff803443bd22682c40c.jpg",
        video: "https://content.pancake.vn/2-25/2025/9/17/b53caf98400360c48241f0446b740ffb5d1de2df.mp4"
    },
    {
        id: "6453bd17-1d4d-4df2-aeda-5f19c838e5db",
        name: "Khóa Thay Charm S-Hook 2 10x5x1 mm",
        price: 60000,
        description: "Bạc s925 | Có Thể Thêm/ Bớt Charm Tùy Ý",
        image: "https://content.pancake.vn/2-25/2025/9/11/7a62746c0569e97d203d0b345f9fd94e7107d18e.jpg",
        video: "https://content.pancake.vn/2-25/2025/9/17/b53caf98400360c48241f0446b740ffb5d1de2df.mp4"
    },
    {
        id: "006c372b-264c-4412-8275-bdad8232f3aa",
        name: "Khóa Thay Charm S-Hook 1 14.2x5.3x5.8 mm",
        price: 60000,
        description: "Bạc s925 | Có Thể Thêm/ Bớt Charm Tùy Ý",
        image: "https://content.pancake.vn/2-25/2025/9/11/f99466a4c3cc98504f94384cfe9cb2876d6a062b.jpg",
        video: "https://content.pancake.vn/2-25/2025/9/17/b53caf98400360c48241f0446b740ffb5d1de2df.mp4"
    },
    {
        id: "1a9234d0-f565-4b0d-bdbf-83ef31359442",
        name: "Khóa Thay Charm Carabiner 14.8x8.38mm",
        price: 180000,
        description: "Bạc s925 | Có Thể Thêm/ Bớt Charm Tùy Ý | Cao Cấp Và Chắc Chắn",
        image: "https://content.pancake.vn/2-25/2025/9/11/996f7d1ec6cdb87846ac8506c76f75a08f8a790a.jpg",
        video: "https://content.pancake.vn/2-25/2025/9/17/b53caf98400360c48241f0446b740ffb5d1de2df.mp4"
    },
    {
        id: "f6e85bae-d285-4722-97c5-fbd7edd6bd47",
        name: "Khóa Thay Charm O Snap 9.2x1.8mm",
        price: 100000,
        description: "Bạc s925 | Có Thể Thêm/ Bớt Charm Tùy Ý | Cao Cấp Và Tinh Tế",
        image: "https://content.pancake.vn/2-25/2025/9/11/8ce769721f5db738bbf19dc3ae03fb6822ed6c06.jpg",
        video: "https://content.pancake.vn/2-25/2025/9/17/b53caf98400360c48241f0446b740ffb5d1de2df.mp4"
    },
    {
        id: "755ff0b4-14b3-4ea9-b3ed-0cdfdda1f897",
        name: "Khóa Thay Charm Heart Snap 16.2x12.3x2.5mm",
        price: 200000,
        description: "Bạc s925 | Có Thể Thêm/ Bớt Charm Tùy Ý | Cao Cấp Và Chắc Chắn",
        image: "https://content.pancake.vn/2-25/2025/9/11/d11440cf3c6f273aa6691a5b74976ce250bca302.jpg",
        video: "https://content.pancake.vn/2-25/2025/9/17/b53caf98400360c48241f0446b740ffb5d1de2df.mp4"
    },
    ];

    // CHARM PRODUCTS
    const CHARM_PRODUCTS = [
    {
        id: "70f9a957-bb9f-4c29-8cf3-5276cf977b1e",
        name: "Charm Nơ",
        price: 0,
        originalPrice: 65000,
        description: "Bạc s925",
        image: "https://content.pancake.vn/2-25/2025/9/13/504c96dfc212978ade6fb85b33e892caa64786f7.jpg"
    },
    {
        id: "cd81dda9-5362-4a66-8bc2-da8cea635163",
        name: "Charm Star Heart",
        price: 0,
        originalPrice: 65000,
        description: "Bạc s999",
        image: "https://content.pancake.vn/2-25/2025/9/13/0cb6c339d539cbb4ff7f6d8a815b23cb139d8084.jpg"
    },
    {
        id: "cfddc4cf-7c6d-4415-a2f3-9dd1934090bb",
        name: "Charm Keys",
        price: 0,
        originalPrice: 80000,
        description: "Bạc s925",
        image: "https://content.pancake.vn/2-25/2025/9/13/0b6243faed7533a7b70c04a65e801fb05a3f67b4.jpg"
    },
    {
        id: "0bc463e8-51dc-4955-83fe-c2fab891b7e9",
        name: "Charm Lock",
        price: 180000,
        originalPrice: 180000,
        description: "Premium | Bạc s925 | Đính Đá CZ",
        image: "https://content.pancake.vn/2-25/2025/9/13/6a4a4a3ce6dae79afc4a6fee2953a5a71425d3c4.jpg"
    },
    {
        id: "2e224df0-c1b2-4a6e-8b9c-dd89e59aee1e",
        name: "Charm Rabbit",
        price: 0,
        originalPrice: 70000,
        description: "Bạc s925 | 11*4.5*2.7mm",
        image: "https://content.pancake.vn/2-25/2025/9/13/c73a9d118778160bd81446c10daa9c3676ce1951.jpg"
    },
    {
        id: "1a2ee98a-82ed-4d97-9415-dbc9ca492a41",
        name: "Charm Carrot",
        price: 0,
        originalPrice: 70000,
        description: "Bạc s925 | 11*6*2.5mm",
        image: "https://content.pancake.vn/2-25/2025/9/13/8f3d6faf7e081e664505edd3b30c500679867921.jpg"
    },
        {
        id: "35b19737-7be7-44bf-b797-607bd78361a8",
        name: "Charm Angel's Heart",
        price: 99000,
        originalPrice: 99000,
        description: "Bạc s925 | 11*6*2.5mm",
        image: "https://content.pancake.vn/2-25/2025/9/13/1f0e6b9fcb756aa0db867b4a732e037addba106a.jpg"
    },
    {
        id: "4622373f-2a92-4e2a-97ee-df934f47fc33",
        name: "Charm Bell",
        price: 0,
        originalPrice: 99000,
        description: "Bạc s925 | 5mm",
        image: "https://content.pancake.vn/2-25/2025/9/13/ec3a0b75bd10d5a65874bb83b1adae70bf9c73d5.jpg"
    },
    {
        id: "035ce7f7-dc96-4e18-8611-2f3111d8b95e",
        name: "Charm Butterfly",
        price: 0,
        originalPrice: 65000,
        description: "Bạc s925 | 4mm (Cho vòng mảnh)",
        image: "https://content.pancake.vn/2-25/2025/9/13/a927c1e7002505a7ad3bdd81ce524ac79f8589ec.jpg"
    },
    ];

    // OFFER PRODUCTS
    const OFFER_PRODUCTS = [
    {
        id: "4dd5e24a-420c-4dd5-97ac-7a3b2d3e6ee1",
        name: "Vòng Sincera Infinity Heart",
        price: 550000,
        description: "Bạc s925 | Ảnh Đã Bao Gồm Free Charm",
        image: "https://content.pancake.vn/2-25/2025/9/16/a5acc95775954fc84e88d85e13034bdcefed1c32.jpg",
        title: "INFINITY LOVE",
        overlay_description: "Biểu tượng của tình yêu/ tình bạn vĩnh cửu"
    },
    {
        id: "477eec37-deaf-49aa-8e81-0afbed9d9424",
        name: "Nhẫn Sincera Infinity Love",
        price: 300000,
        description: "Bạc s925 | Theo Size Tay Cá Nhân",
        image: "https://content.pancake.vn/2-25/2025/9/16/ee931e4f3fc2e3815f7e11de3b3af7741bdd1968.jpg",
        title: "INFINITY RINGS",
        overlay_description: "Lời ước hẹn tay trong tay mãi mãi"
    },
    {
        id: "0c961708-f477-4a1e-a803-0ed5f2dbc50e",
        name: "Vòng Two As One", 
        price: 1250000,
        description: "Bạc s925 | Gồm 4 Charms Bạc Như Ảnh",
        image: "https://content.pancake.vn/2-25/2025/9/16/fea50fc478c864896203b5a005679809b45cf102.jpg",
        title: "TWO AS ONE",
        overlay_description: "Hai mảnh ghép tuy khác nhau, nhưng hoàn hảo không thể tách rời"
    },
    {
        id: "7c3a13fe-89f5-497b-85a2-fd234f6ad272",
        name: "Safety Pin - Lucky and Loving",
        price: 690000,
        description: "Bạc s925 | Gồm 4 Charm Như Ảnh",
        image: "https://content.pancake.vn/2-25/s600x600/2025/9/16/c5c3308c05bf80a7f1c28ab982ee2700661ea96e.jpg",
        title: "SAFETY TOGETHER",
        overlay_description: "Một chiếc ghim băng cùng 2 viên đá may mắn, lời nhắc nhở hãy luôn yêu thương bản thân",
    }
    ];

    // UNIVERSAL PRODUCT MAP for clean add to cart logic - FIXED
    const ALL_PRODUCTS = new Map();

    // Add all product types to map - SAFE MAPPING
    CHAIN_PRODUCTS.forEach(p => {
        if (p.id) {
            ALL_PRODUCTS.set(p.id.toString(), p);
        }
        // Also map variants if they exist
        if (p.variants) {
            p.variants.forEach(variant => {
                if (variant.id) {
                    ALL_PRODUCTS.set(variant.id.toString(), {
                        ...variant,
                        image: p.image // Use parent image
                    });
                }
            });
        }
    });

    CLASP_PRODUCTS.forEach(p => {
        if (p.id) {
            ALL_PRODUCTS.set(p.id.toString(), p);
        }
    });

    CHARM_PRODUCTS.forEach(p => {
        if (p.id) {
            ALL_PRODUCTS.set(p.id, p);
        }
    });

    OFFER_PRODUCTS.forEach(p => {
        if (p.id) {
            ALL_PRODUCTS.set(p.id, p);
        }
    });

    function updateCartIcon() {
        const cartIcon = document.getElementById('cart-icon');
        const cartBadge = document.getElementById('cart-badge');
        const mobileCartSection = document.getElementById('mobile-cart-section');
        const mobileCartBadge = document.getElementById('mobile-cart-badge');
        
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        
        // Desktop cart icon
        if (window.innerWidth > 768) {
            if (totalItems > 0) {
                cartIcon.classList.add('show');
                cartBadge.textContent = totalItems;
            } else {
                cartIcon.classList.remove('show');
                cartBadge.textContent = '0';
            }
            // Hide mobile cart
            if (mobileCartSection) {
                mobileCartSection.style.display = 'none';
            }
        } else {
            // Mobile: hide desktop cart, FORCE SHOW mobile cart
            cartIcon.classList.remove('show');
            if (mobileCartSection) {
                mobileCartSection.style.display = 'flex !important';
                mobileCartBadge.textContent = totalItems;
            }
        }
    }

    function updateCartSidebar() {
        const cartBody = document.getElementById('cart-body');
        const cartFooter = document.getElementById('cart-footer');
        const cartTotal = document.getElementById('cart-total');

        if (cart.length === 0) {
            cartBody.innerHTML = `
                <div class="cart-empty">
                    <div class="cart-empty-icon">🛒</div>
                    <p>Giỏ hàng của bạn đang trống</p>
                </div>
            `;
            cartFooter.style.display = 'none';
            return;
        }

        cartFooter.style.display = 'block';
        
        let cartHTML = '';
        let total = 0;

        cart.forEach((item, index) => {
            total += item.price * item.quantity;
            
            cartHTML += `
                <div class="cart-item">
                    <img src="${item.image}" alt="${item.name}" class="cart-item-image" onerror="this.style.display='none';">
                    <div class="cart-item-details">
                        <div class="cart-item-name">${item.name}</div>
                        <div class="cart-item-price">${new Intl.NumberFormat('vi-VN', {style: 'currency', currency: 'VND'}).format(item.price)}</div>
                        <div class="cart-item-controls">
                            <div class="qty-controls">
                                <button class="qty-btn" onclick="updateQuantity(${index}, -1)" ${item.quantity <= 1 ? 'disabled' : ''}>-</button>
                                <span class="qty-number">${item.quantity}</span>
                                <button class="qty-btn" onclick="updateQuantity(${index}, 1)">+</button>
                            </div>
                            <button class="remove-btn" onclick="removeFromCart(${index})" title="Xóa sản phẩm">🗑️</button>
                        </div>
                    </div>
                </div>
            `;
        });

        cartBody.innerHTML = cartHTML;
        cartTotal.textContent = new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(total);
    }

    function addToCart(product) {      
        // SPECIAL LOGIC FOR CHARMS: Free vs Paid charms are different items
        let existingIndex = -1;
        
        if (product.id && product.id.toString().startsWith('charm-')) {
            // For charms: match by id AND isFreePromo status
            existingIndex = cart.findIndex(item => 
                item.id === product.id && 
                item.isFreePromo === product.isFreePromo
            );
        } else {
            // For non-charms: use original logic
            existingIndex = cart.findIndex(item => item.id === product.id);
        }
        
        if (existingIndex >= 0) {
            cart[existingIndex].quantity += 1;
        } else {
            cart.push({
                ...product,
                quantity: 1
            });
        }
        
        localStorage.setItem('cart', JSON.stringify(cart));
        
        // Calculate new total
        const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        // Dispatch custom event for threshold manager
        const cartUpdateEvent = new CustomEvent('cartUpdated', {
            detail: {
                cart: cart,
                cartTotal: cartTotal,
                action: 'add',
                product: product,
                isFreeCharm: product.isFreePromo === true // Thêm flag để detect free charm
            }
        });
        document.dispatchEvent(cartUpdateEvent);
        
        updateCartIcon();
        updateCartSidebar();
        // Track add to cart event
        if (window.trackAddToCart) {
            window.trackAddToCart(product);
        }
        
        showNotification(`Đã thêm "${product.name}" vào giỏ hàng!`);
        
        // If added item was a charm, re-render charm selection
        if (product.isFreePromo === true || (product.id && product.id.toString().startsWith('charm-'))) {
            // Trigger charm re-render after a short delay
            if (window.charmSelection && window.charmSelection.rerender) {
                setTimeout(() => {
                    window.charmSelection.rerender();
                }, 100);
            }
        }
    }

// Cart Animation Effect
function animateToCart(productElement, product) {
    // Get product image
    const productImg = productElement.querySelector('img');
    if (!productImg) return;
    
    // Get cart icon position
    const cartIcon = window.innerWidth <= 768 ? 
        document.querySelector('#mobile-cart-section') : 
        document.querySelector('#cart-icon');
    
    if (!cartIcon) return;
    
    // Create animation element
    const animElement = document.createElement('div');
    animElement.className = 'cart-animation';
    animElement.innerHTML = `<img src="${productImg.src}" alt="${product.name}">`;
    
    // Get start position
    const startRect = productImg.getBoundingClientRect();
    const endRect = cartIcon.getBoundingClientRect();
    
    // Set initial position
    animElement.style.left = startRect.left + 'px';
    animElement.style.top = startRect.top + 'px';
    
    document.body.appendChild(animElement);
    
    // Animate to cart
    requestAnimationFrame(() => {
        animElement.style.left = endRect.left + 'px';
        animElement.style.top = endRect.top + 'px';
        animElement.style.transform = 'scale(0.3)';
        animElement.style.opacity = '0';
    });
    
    // Remove after animation
    setTimeout(() => {
        animElement.remove();
    }, 800);
}

    // Enhanced addToCart with animation
    function addToCart(product, sourceElement = null) {
        let existingIndex = -1;
        
        if (product.id && product.id.toString().startsWith('charm-')) {
            existingIndex = cart.findIndex(item => 
                item.id === product.id && 
                item.isFreePromo === product.isFreePromo
            );
        } else {
            existingIndex = cart.findIndex(item => item.id === product.id);
        }
        
        if (existingIndex >= 0) {
            cart[existingIndex].quantity += 1;
        } else {
            cart.push({
                ...product,
                quantity: 1
            });
        }
        
        localStorage.setItem('cart', JSON.stringify(cart));
        
        // Trigger animation if source element provided
        if (sourceElement) {
            animateToCart(sourceElement, product);
        }
        
        // Calculate new total
        const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        // Dispatch custom event
        const cartUpdateEvent = new CustomEvent('cartUpdated', {
            detail: {
                cart: cart,
                cartTotal: cartTotal,
                action: 'add',
                product: product,
                isFreeCharm: product.isFreePromo === true
            }
        });
        document.dispatchEvent(cartUpdateEvent);
        
        updateCartIcon();
        updateCartSidebar();
        
        if (window.trackAddToCart) {
            window.trackAddToCart(product);
        }
        
        // Cart icon shake effect
        const cartIconContainer = document.getElementById('cart-icon');
        if (cartIconContainer && window.innerWidth > 768) {
            cartIconContainer.style.animation = 'cartShake 0.6s ease';
            setTimeout(() => {
                cartIconContainer.style.animation = '';
            }, 600);
        }
        
        // Re-render charm selection if needed
        if (product.isFreePromo === true || (product.id && product.id.toString().startsWith('charm-'))) {
            if (window.charmSelection && window.charmSelection.rerender) {
                setTimeout(() => {
                    window.charmSelection.rerender();
                }, 100);
            }
        }
    }

    // GLOBAL CART FUNCTIONS
    window.openCart = function() {
        document.getElementById('cart-sidebar').classList.add('open');
        document.getElementById('cart-overlay').classList.add('show');
        document.body.style.overflow = 'hidden';
    };

    window.closeCart = function() {
        document.getElementById('cart-sidebar').classList.remove('open');
        document.getElementById('cart-overlay').classList.remove('show');
        document.body.style.overflow = 'auto';
    };

    window.updateQuantity = function(index, change) {
        if (cart[index]) {
            cart[index].quantity += change;
            if (cart[index].quantity <= 0) {
                cart.splice(index, 1);
            }
            localStorage.setItem('cart', JSON.stringify(cart));
            
            // FIX: Tính total SAU KHI đã update cart
            const newCartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            
            const cartUpdateEvent = new CustomEvent('cartUpdated', {
                detail: {
                    cart: cart,
                    cartTotal: newCartTotal, // Dùng newCartTotal thay vì biến cũ
                    action: 'update'
                }
            });
            document.dispatchEvent(cartUpdateEvent);
            
            updateCartIcon();
            updateCartSidebar();
            // Track remove from cart event  
            if (window.trackRemoveFromCart) {
                window.trackRemoveFromCart(removedItem);
            }
        }
    };

    window.removeFromCart = function(index) {
        const removedItem = cart[index];
        cart.splice(index, 1); // Xóa item trước
        localStorage.setItem('cart', JSON.stringify(cart));
        
        // FIX: Tính total SAU KHI đã xóa item
        const newCartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        const cartUpdateEvent = new CustomEvent('cartUpdated', {
            detail: {
                cart: cart,
                cartTotal: newCartTotal, // Dùng newCartTotal sau khi đã xóa
                action: 'remove',
                removedItem: removedItem
            }
        });
        document.dispatchEvent(cartUpdateEvent);
        
        updateCartIcon();
        updateCartSidebar();
        showNotification(`Đã xóa "${removedItem.name}" khỏi giỏ hàng!`, 'info');
        
        // If removed item was a free charm, re-render charm selection
        if (removedItem.isFreePromo === true) {
            if (window.charmSelection && window.charmSelection.rerender) {
                setTimeout(() => {
                    window.charmSelection.rerender();
                }, 100);
            }
        }
    };
    window.checkout = function() {
        if (cart.length === 0) {
            showNotification('Giỏ hàng trống!', 'error');
            return;
        }
        
        // Redirect to checkout info page
        window.location.href = 'checkout-info.html';
    };

    // RENDER OFFER PRODUCTS - FIXED VERSION
    function renderOfferProducts() {
        const offersGrid = document.querySelector('.offers-grid');
        if (!offersGrid) {
            console.error('Offers grid container not found');
            return;
        }

        offersGrid.innerHTML = '';

        OFFER_PRODUCTS.forEach((product, index) => {
            const formattedPrice = new Intl.NumberFormat('vi-VN', {
                style: 'currency',
                currency: 'VND'
            }).format(product.price);

            const offerCard = document.createElement('div');
            offerCard.className = 'offer-card';
            
            // Use proper ID from product.id or product["web-id"]
            const productId = product.id || product["web-id"];
            offerCard.setAttribute('data-id', productId);
            
            offerCard.innerHTML = `
                <div class="offer-image-container">
                    <div class="offer-image" style="background: url('${product.image}') center/cover;"></div>
                    <div class="offer-overlay">
                        <div class="offer-title">${product.title}</div>
                        <div class="offer-description">${product.overlay_description}</div>
                    </div>
                </div>         
                <div class="offer-info">
                    <h3 class="offer-name">${product.name}</h3>
                    <p class="offer-subtitle">${product.description}</p>
                    <div class="offer-price">${formattedPrice}</div>
                    <div class="add-to-cart-icon" data-product-id="${productId}">
                        <img src="images/add-to-cart.svg" alt="Add to cart" onerror="this.innerHTML='🛒';">
                    </div>                    
                </div>
            `;

            offersGrid.appendChild(offerCard);
        });
    }

    function renderStaticChainProducts() {
        const carouselTrack = document.querySelector('#products .carousel-track');
        if (!carouselTrack) return;

        carouselTrack.innerHTML = '';

        CHAIN_PRODUCTS.forEach((product, index) => {
            // CORRECTED DETECTION LOGIC
            const hasNoVariants = !product.variants || product.variants.length === 0;
            const isSingleVariant = product.variants && product.variants.length === 1;
            const isMultiVariant = product.variants && product.variants.length > 1;
            
            // PRICE DISPLAY LOGIC
            let priceDisplay, productName, productPrice;
            
            if (hasNoVariants) {
                // No variants - use product directly
                priceDisplay = new Intl.NumberFormat('vi-VN', {style: 'currency', currency: 'VND'}).format(product.price);
                productName = product.name;
                productPrice = product.price;
            } else if (isSingleVariant) {
                // Single variant - use variant price but product name
                priceDisplay = new Intl.NumberFormat('vi-VN', {style: 'currency', currency: 'VND'}).format(product.variants[0].price);
                productName = product.name;
                productPrice = product.variants[0].price;
            } else if (isMultiVariant) {
                // Multi variants - show "From XXX"
                const minPrice = Math.min(...product.variants.map(v => v.price));
                priceDisplay = `Từ ${new Intl.NumberFormat('vi-VN', {style: 'currency', currency: 'VND'}).format(minPrice)}`;
                productName = product.name;
                productPrice = minPrice;
            }

            const productCard = document.createElement('div');
            productCard.className = 'product-card';
            productCard.setAttribute('data-product-index', index);
            
            productCard.innerHTML = `
                <div class="product-image">
                    <img src="${product.image}" alt="${productName}" onerror="this.style.display='none'; this.parentElement.innerHTML='<div style=\\'font-size: 60px; color: #603b11; display: flex; align-items: center; justify-content: center; height: 100%;\\'>🔗</div>';">
                    ${product.video ? `<div class="play-video-icon" data-video-url="${product.video}"><img src="images/play.png" alt="Play video"></div>` : ''}
                    ${isMultiVariant ? `<div class="variant-badge">${product.variants.length} tùy chọn</div>` : ''}
                </div>
                <div class="product-info">
                    <h3 class="product-name">${productName}</h3>
                    <p class="product-description">${product.description}</p>
                    <div class="product-price">${priceDisplay}</div>
                    <div class="add-to-cart-icon" data-product-index="${index}">
                        <img src="images/add-to-cart.svg" alt="Add to cart" onerror="this.innerHTML='🛒';">
                    </div>
                </div>
            `;

            // Video event
            if (product.video) {
                const playVideoIcon = productCard.querySelector('.play-video-icon');
                playVideoIcon?.addEventListener('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    playProductVideo(product.video, productName);
                });
            }

            carouselTrack.appendChild(productCard);
        });

    }

    function renderClaspProducts() {
        const claspCarouselTrack = document.querySelector('#clasp-carousel-track');
        const claspCarouselControls = document.querySelector('#clasp-products .carousel-controls');

        if (!claspCarouselTrack) {
            return;
        }

        claspCarouselTrack.innerHTML = '';

        CLASP_PRODUCTS.forEach(product => {
            const formattedPrice = new Intl.NumberFormat('vi-VN', {
                style: 'currency',
                currency: 'VND'
            }).format(product.price);

            const productCard = document.createElement('div');
            productCard.className = 'product-card';
            productCard.setAttribute('data-id', product.id);
            
            productCard.innerHTML = `
                <div class="product-image">
                    <img src="${product.image}" alt="${product.name}" onerror="this.style.display='none'; this.parentElement.innerHTML='<div style=\\'font-size: 60px; color: #603b11; display: flex; align-items: center; justify-content: center; height: 100%;\\'>🔒</div>';">
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

            // PLAY VIDEO - SPECIFIC ICON CLICK ONLY
            const playVideoIcon = productCard.querySelector('.play-video-icon');
            playVideoIcon.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                const videoUrl = this.getAttribute('data-video-url');
                playProductVideo(videoUrl, product.name);
            });

            claspCarouselTrack.appendChild(productCard);
        });

        if (claspCarouselControls) claspCarouselControls.style.display = 'flex';
    }

    // PLAY VIDEO FUNCTION
    function playProductVideo(videoUrl, productName) {
        if (!videoUrl || videoUrl === "điền url video") {
            showNotification(`Video chưa có sẵn cho sản phẩm "${productName}"`, 'info');
            return;
        }        
        createVideoModal(videoUrl, productName);
    }

    function createVideoModal(videoUrl, productName) {
        const existingModal = document.getElementById('video-modal');
        if (existingModal) {
            existingModal.remove();
        }

        const videoModal = document.createElement('div');
        videoModal.id = 'video-modal';
        videoModal.innerHTML = `
            <div class="video-modal-overlay" onclick="closeVideoModal()"></div>
            <div class="video-modal-container">
                <div class="video-modal-header">
                    <h3>${productName}</h3>
                    <button class="video-modal-close" onclick="closeVideoModal()">✕</button>
                </div>
                <div class="video-modal-body">
                    <video controls autoplay style="width: 100%; height: auto; max-height: 70vh;">
                        <source src="${videoUrl}" type="video/mp4">
                        <p>Trình duyệt của bạn không hỗ trợ video.</p>
                    </video>
                </div>
            </div>
        `;
        document.body.appendChild(videoModal);
        document.body.style.overflow = 'hidden';
    }

    window.closeVideoModal = function() {
        const modal = document.getElementById('video-modal');
        if (modal) {
            modal.remove();
            document.body.style.overflow = 'auto';
        }
    };

    // NOTIFICATION FUNCTION
    function showNotification(message, type = 'success') {
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

    // UNIVERSAL ADD TO CART HANDLER - With Animation
    document.addEventListener('click', function(e) {
        if (e.target.closest('.add-to-cart-icon')) {
            e.preventDefault();
            e.stopPropagation();
            
            const icon = e.target.closest('.add-to-cart-icon');
            const productCard = icon.closest('.product-card') || icon.closest('.offer-card');
            const productIndex = icon.getAttribute('data-product-index');
            const productId = icon.getAttribute('data-product-id');
            
            // Rest of existing logic but pass productCard for animation
            if (productIndex !== null && productIndex !== undefined) {
                const product = CHAIN_PRODUCTS[parseInt(productIndex)];
                
                if (!product) {
                    console.error('Product not found at index:', productIndex);
                    return;
                }
                
                const hasNoVariants = !product.variants || product.variants.length === 0;
                const isSingleVariant = product.variants && product.variants.length === 1;
                const isMultiVariant = product.variants && product.variants.length > 1;
                
                if (hasNoVariants) {
                    if (!product.id) {
                        console.error('Product missing ID:', product);
                        return;
                    }
                    
                    addToCart({
                        id: product.id,
                        name: product.name,
                        price: product.price,
                        description: product.description,
                        image: product.image
                    }, productCard); // Pass element for animation
                    
                } else if (isSingleVariant) {
                    const variant = product.variants[0];
                    addToCart({
                        id: variant.id,
                        name: product.name,
                        price: variant.price,
                        description: variant.description,
                        image: product.image
                    }, productCard); // Pass element for animation
                    
                } else if (isMultiVariant) {
                    showVariantModal(product);
                }
            } 
            else if (productId) {
                const product = ALL_PRODUCTS.get(productId);
                if (product) {
                    addToCart(product, productCard); // Pass element for animation
                } else {
                    console.error('Product not found in ALL_PRODUCTS map:', productId);
                }
            }
        }
    });

    // VARIANT MODAL FUNCTIONS
    function showVariantModal(product) {
        const modal = document.getElementById('variant-modal');
        const title = document.getElementById('variant-modal-title');
        const body = document.getElementById('variant-modal-body');
        
        title.textContent = `Chọn phiên bản: ${product.name}`;
        
        let variantsHTML = '<div style="padding: 20px;">';
        
        product.variants.forEach(variant => {
            const formattedPrice = new Intl.NumberFormat('vi-VN', {
                style: 'currency',
                currency: 'VND'
            }).format(variant.price);
            
            variantsHTML += `
                <div class="variant-option" style="
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 15px;
                    border: 2px solid #e0e0e0;
                    border-radius: 8px;
                    margin-bottom: 10px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                " onclick="selectVariant('${variant.id}', '${variant.name}', ${variant.price}, '${product.image}', '${variant.description}')">
                    <div>
                        <div style="font-weight: 600; margin-bottom: 4px;">${variant.name}</div>
                        <div style="font-size: 0.9rem; color: #666;">${variant.description}</div>
                    </div>
                    <div style="font-weight: 600; color: #603b11;">${formattedPrice}</div>
                </div>
            `;
        });
        
        variantsHTML += '</div>';
        body.innerHTML = variantsHTML;
        
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }

    window.closeVariantModal = function() {
        const modal = document.getElementById('variant-modal');
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    };

    window.selectVariant = function(id, name, price, image, description) {
        const variantProduct = {
            id: id,
            name: name,
            price: price,
            image: image,
            description: description
        };
        
        addToCart(variantProduct);
        closeVariantModal();
    };

    const variantCSS = document.createElement('style');
    variantCSS.textContent = `
        #variant-modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 10000;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .variant-option:hover {
            border-color: #603b11 !important;
            background: #f8fff9 !important;
            transform: translateY(-1px);
        }
    `;
    document.head.appendChild(variantCSS);

// INITIALIZE CART ON PAGE LOAD
updateCartIcon();
updateCartSidebar();
renderStaticChainProducts();
renderClaspProducts();
    renderOfferProducts(); // Render offers from JS
    window.CHARM_PRODUCTS = CHARM_PRODUCTS;
    window.addToCart = addToCart;

    // GLOBAL FUNCTIONS FOR CHARM SELECTION
    window.checkFreeCharmInCart = function() {
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        return cart.some(item => item.isFreePromo === true);
    };

    // --- HERO CAROUSEL ---
    const heroCarousel = document.querySelector('.hero-carousel');
    if (heroCarousel) {
        const slides = heroCarousel.querySelectorAll('.hero-slide');
        const indicators = heroCarousel.querySelectorAll('.hero-indicators .indicator');
        let currentSlide = 0;
        let slideInterval;

        const goToSlide = (slideIndex) => {
            clearInterval(slideInterval);
            if (slides[currentSlide]) slides[currentSlide].classList.remove('active');
            if (indicators[currentSlide]) indicators[currentSlide].classList.remove('active');
            
            currentSlide = slideIndex;

            if (slides[currentSlide]) slides[currentSlide].classList.add('active');
            if (indicators[currentSlide]) indicators[currentSlide].classList.add('active');
            startSlideShow();
        };

        const startSlideShow = () => {
            slideInterval = setInterval(() => {
                const nextSlideIndex = (currentSlide + 1) % slides.length;
                goToSlide(nextSlideIndex);
            }, 5000);
        };

        indicators.forEach(indicator => {
            indicator.addEventListener('click', (e) => {
                const slideIndex = parseInt(e.target.getAttribute('data-slide-to'));
                if (!isNaN(slideIndex)) {
                    goToSlide(slideIndex);
                }
            });
        });

        if (slides.length > 0) {
            startSlideShow();
        }
    }

    // LOGIC CHO NÚT BẤM CỦA PRODUCT CAROUSEL - DÂY BẠC
    const productCarousel = document.querySelector('.carousel-section#products');
    if (productCarousel) {
        const track = productCarousel.querySelector('.carousel-track');
        const nextBtn = productCarousel.querySelector('.carousel-next');
        const prevBtn = productCarousel.querySelector('.carousel-prev');

        if(track && nextBtn && prevBtn) {
            nextBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                const cards = track.children;
                if (cards.length > 0) {
                    const cardWidth = cards[0].offsetWidth;
                    const gap = 30;
                    const scrollAmount = cardWidth + gap;
                    track.scrollLeft += scrollAmount;
                }
            });

            prevBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                const cards = track.children;
                if (cards.length > 0) {
                    const cardWidth = cards[0].offsetWidth;
                    const gap = 30;
                    const scrollAmount = cardWidth + gap;
                    track.scrollLeft -= scrollAmount;
                }
            });
        }
    }

    // LOGIC CHO NÚT BẤM CỦA CLASP CAROUSEL - KHÓA BẠC
    const claspCarousel = document.querySelector('#clasp-products');
    if (claspCarousel) {
        const track = claspCarousel.querySelector('.carousel-track');
        const nextBtn = claspCarousel.querySelector('#clasp-next');
        const prevBtn = claspCarousel.querySelector('#clasp-prev');

        if(track && nextBtn && prevBtn) {
            nextBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const cards = track.children;
                if (cards.length > 0) {
                    const cardWidth = cards[0].offsetWidth;
                    const gap = 30;
                    const scrollAmount = cardWidth + gap;
                    track.scrollLeft += scrollAmount;
                }
            });

            prevBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const cards = track.children;
                if (cards.length > 0) {
                    const cardWidth = cards[0].offsetWidth;
                    const gap = 30;
                    const scrollAmount = cardWidth + gap;
                    track.scrollLeft -= scrollAmount;
                }
            });
        }
    }

    // Touch swipe support for offers carousel on mobile
    const offersGrid = document.querySelector('.offers-grid');
    if (offersGrid && window.innerWidth <= 768) {
        let isDown = false;
        let startX;
        let scrollLeft;

        offersGrid.addEventListener('mousedown', (e) => {
            isDown = true;
            startX = e.pageX - offersGrid.offsetLeft;
            scrollLeft = offersGrid.scrollLeft;
        });

        offersGrid.addEventListener('mouseleave', () => {
            isDown = false;
        });

        offersGrid.addEventListener('mouseup', () => {
            isDown = false;
        });

        offersGrid.addEventListener('mousemove', (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - offersGrid.offsetLeft;
            const walk = (x - startX) * 2;
            offersGrid.scrollLeft = scrollLeft - walk;
        });
    }
    // Chat function
    window.toggleChatOptions = function() {
        const chatOptions = document.getElementById('chat-options');
        const isVisible = chatOptions.classList.contains('show');
        
        if (isVisible) {
            chatOptions.classList.remove('show');
        } else {
            chatOptions.classList.add('show');
            // Auto-hide after 5 seconds
            setTimeout(() => {
                chatOptions.classList.remove('show');
            }, 60000);
        }
    };

    window.trackChatClick = function(platform) {
        // Track chat click với platform info
        if (window.trackChatClick) {
            window.trackChatClick();
        }
        
        console.log(`📱 Chat opened via: ${platform}`);
        
        // Hide options after click
        const chatOptions = document.getElementById('chat-options');
        chatOptions.classList.remove('show');
    };

    // Close chat options when clicking outside
    document.addEventListener('click', function(e) {
        const chatContainer = document.getElementById('chat-button-container');
        const chatOptions = document.getElementById('chat-options');
        
        if (chatContainer && !chatContainer.contains(e.target)) {
            chatOptions.classList.remove('show');
        }
    });
});