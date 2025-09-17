const TESTIMONIAL_DATA = [
    {
        id: 1,
        text: "Shop ơi cảm ơn vì đã kiên nhẫn tư vấn dù mình hỏi rất nhiều ạ. Sản phẩm đẹp lắm ạ, giao hàng nhanh nữa.",
        product: "Vòng Tay Infinity Heart",
        image: "https://content.pancake.vn/2-25/2025/9/17/4a63eb21952f0251351522295f1aa4c6c074829b.jpg",
        customer: {
            name: "@Niep****",
            location: "Ha Tinh",
            avatar: "NP"
        },
        rating: 5,
        date: "15/08/2025"
    },
    {
        id: 2,
        text: "Mình cần gấp cho anni. SG-HN 3 ngày trộm vía vẫn giao kịp, cảm ơn shop nhiều ạaaaaa",
        product: "Vòng Sincera Couple Paperclip x Charm Keys & Lock",
        image: "https://content.pancake.vn/2-25/2025/9/17/46b82dc95f07a44731fb81031d518c8728de936f.jpg",
        customer: {
            name: "@Minnie.H**",
            location: "Ha Noi",
            avatar: "MH"
        },
        rating: 5,
        date: "20/07/2025"
    },
    {
        id: 3,
        text: "Người yêu mình thích lắm, hi vọng tình cảm của tụi mình sẽ \"forever\" như vòng này ạ hehe",
        product: "Vòng Tay Sincera Infinity Heart",
        image: "https://content.pancake.vn/2-25/2025/9/17/c088111aedea635280719788a141f23c1ccb06e1.jpg",
        customer: {
            name: "maika.fo**",
            location: "Tp. Ho Chi Minh",
            avatar: "MF"
        },
        rating: 5,
        date: "06/05/2025"
    },
    {
        id: 4,
        text: "Shop rep tin nhắn hơi chậm nhưng bù lại sản phẩm rất đẹp, hỗ trợ mình đổi dây theo yêu cầu.",
        product: "Vòng Sincera Couple Infinity Heart",
        image: "https://content.pancake.vn/2-25/2025/9/17/073dc0f98f6988e9b6434877ffdfac9085106a8f.jpg",
        customer: {
            name: "T.Bun**",
            location: "Tp. Ho Chi Minh",
            avatar: "TB"
        },
        rating: 4,
        date: "12/09/2025"
    },
    {
        id: 5,
        text: "Cảm ơn shop vì làm cho em mẫu vòng thật ý nghĩa, bạn trai em rất thích luôn ạ!",
        product: "Sincera rolo Chain x Carabiner Lock",
        image: "https://content.pancake.vn/2-25/2025/9/17/843bd19fed37f6d1bc3ab11d31bf738d916dd1a5.jpg",
        customer: {
            name: "Hannie**",
            location: "Vung Tau",
            avatar: "HL"
        },
        rating: 5,
        date: "20/08/2025"
    },
    {
        id: 6,
        text: "Shop ơi vòng đẹp lắm, vừa y luôn. Có bạn bè mua mình sẽ giới thiệu shop ạ. Cảm ơn shop nhiều.",
        product: "Vòng Sincera Paper Clip x Charm Keys & Lock",
        image: "https://content.pancake.vn/2-25/2025/9/17/37ca40161bc7cac76b7b4fd797d039b80ff44b6c.jpg",
        customer: {
            name: "Jasm**",
            location: "Hung Yen",
            avatar: "JM"
        },
        rating: 5,
        date: "13/08/2025"
    },
    {
        id: 7,
        text: "Dây bên ngoài lấp lánh em up story mà không cần chỉnh gì luôn ạ 😍😍😍",
        product: "Vòng Sincera Safety Pin Charm Bạc x Đá Tự Nhiên",
        image: "https://content.pancake.vn/2-25/2025/9/17/f83bdbaa5a73aa5b52b8bd8c4014b1e62be9852f.jpg",
        customer: {
            name: "Huong Ng**",
            location: "Binh Duong",
            avatar: "HN"
        },
        rating: 5,
        date: "08/09/2025"
    },
    {
        id: 8,
        text: "Em tỏ tình thành công rồi shop ơi!!! Bạn ý rất thích mẫu shop tư vấn cho em luôn ạaa",
        product: "Vòng Tay/ Nhẫn Sincera Infinity",
        image: "https://content.pancake.vn/2-25/2025/9/17/b151ab89767fa7edc9d783c4fb686c5db9bac953.jpg",
        customer: {
            name: "Lieu.M**",
            location: "Tp. Ho Chi Minh",
            avatar: "LM"
        },
        rating: 5,
        date: "31/03/2025"
    }
];

// TESTIMONIAL RENDERING
function renderTestimonials() {
    const track = document.getElementById('testimonial-track');
    if (!track) {
        console.error('Testimonial track not found');
        return;
    }

    // Duplicate data để tạo hiệu ứng infinite scroll
    const duplicatedData = [...TESTIMONIAL_DATA, ...TESTIMONIAL_DATA];
    
    track.innerHTML = '';

    duplicatedData.forEach(testimonial => {
        const card = createTestimonialCard(testimonial);
        track.appendChild(card);
    });

    console.log(`✅ Rendered ${duplicatedData.length} testimonial cards`);
}

// CREATE TESTIMONIAL CARD
function createTestimonialCard(testimonial) {
    const card = document.createElement('div');
    card.className = 'testimonial-card';
    
    // Generate stars
    const starsHTML = generateStars(testimonial.rating);
    
    card.innerHTML = `
        <div class="testimonial-date">${testimonial.date}</div>
        <div class="testimonial-stars">
            ${starsHTML}
        </div>
        <div class="testimonial-content">
            <p class="testimonial-text">"${testimonial.text}"</p>
            ${testimonial.image ? `<img src="${testimonial.image}" alt="${testimonial.product}" class="testimonial-image" onerror="this.style.display='none';">` : ''}
            <div class="testimonial-product">Sản phẩm: ${testimonial.product}</div>
        </div>
        <div class="testimonial-customer">
            <div class="customer-avatar">
                ${testimonial.customer.avatar}
            </div>
            <div class="customer-info">
                <div class="customer-name">${testimonial.customer.name}</div>
                <div class="customer-location">${testimonial.customer.location}</div>
            </div>
        </div>
    `;
    
    return card;
}

// GENERATE STAR RATING
function generateStars(rating) {
    let starsHTML = '';
    for (let i = 1; i <= 5; i++) {
        if (i <= rating) {
            starsHTML += '<span class="star">★</span>';
        } else {
            starsHTML += '<span class="star empty">★</span>';
        }
    }
    return starsHTML;
}

// INITIALIZE TESTIMONIALS
function initTestimonials() {
    console.log('🌟 Initializing Testimonials...');
    renderTestimonials();
}

// AUTO-INITIALIZE ON DOM READY
document.addEventListener('DOMContentLoaded', () => {
    // Only initialize if testimonial section exists
    if (document.querySelector('.testimonial-section')) {
        initTestimonials();
    }
});

// EXPORT FOR GLOBAL ACCESS
window.initTestimonials = initTestimonials;
window.TESTIMONIAL_DATA = TESTIMONIAL_DATA;