const TESTIMONIAL_DATA = [
    {
        id: 1,
        text: "Perfect length. Your products are very easy to navigate and use. I'm very satisfied with my purchase!",
        product: "925 Sterling Silver Chain",
        image: "https://content.pancake.vn/2-25/2025/8/17/ddad2298244cd08fc177fdc0c80182ef03b03856.jpg",
        customer: {
            name: "Sonya C.",
            location: "Wardona, WA",
            avatar: "SC"
        },
        rating: 4,
        date: "5 DAYS AGO"
    },
    {
        id: 2,
        text: "It's soft enough to go around sea glass without scratching it. Great quality and fast shipping!",
        product: "925 Sterling Silver Wire",
        image: "https://content.pancake.vn/2-25/2025/9/13/504c96dfc212978ade6fb85b33e892caa64786f7.jpg",
        customer: {
            name: "Margaret H.",
            location: "Sydney, NSW",
            avatar: "MH"
        },
        rating: 5,
        date: "6 DAYS AGO"
    },
    {
        id: 3,
        text: "Advice, suggestions & help to resolve my problem. Customer service was exceptional!",
        product: "925 Sterling Silver Clasp",
        image: "https://content.pancake.vn/2-25/2025/9/13/0cb6c339d539cbb4ff7f6d8a815b23cb139d8084.jpg",
        customer: {
            name: "Sherif I.",
            location: "Düsseldorf, Germany",
            avatar: "SI"
        },
        rating: 5,
        date: "6 DAYS AGO"
    },
    {
        id: 4,
        text: "Despite it took more than three weeks to deliver, items as promised with good quality. Worth the wait!",
        product: "925 Sterling Silver Charm",
        image: "https://content.pancake.vn/2-25/2025/8/17/19b2704c5fcb707572bbabdc4ac68d7ac3d5604f.jpg",
        customer: {
            name: "Alec B.",
            location: "Wallaville, QLD",
            avatar: "AB"
        },
        rating: 5,
        date: "6 DAYS AGO"
    },
    {
        id: 5,
        text: "Works great! Beautiful design and excellent craftsmanship. Highly recommend!",
        product: "925 Sterling Silver Bracelet",
        image: "https://content.pancake.vn/2-25/2025/8/17/ddad2298244cd08fc177fdc0c80182ef03b03856.jpg",
        customer: {
            name: "Jessica M.",
            location: "Melbourne, VIC",
            avatar: "JM"
        },
        rating: 5,
        date: "1 WEEK AGO"
    },
    {
        id: 6,
        text: "Amazing quality and fast delivery. The charm is exactly as described. Love it!",
        product: "Heart Charm Silver",
        image: "https://content.pancake.vn/2-25/2025/9/13/0cb6c339d539cbb4ff7f6d8a815b23cb139d8084.jpg",
        customer: {
            name: "David L.",
            location: "Perth, WA",
            avatar: "DL"
        },
        rating: 4,
        date: "1 WEEK AGO"
    },
    {
        id: 7,
        text: "Perfect for my jewelry making project. Great value for money and excellent service!",
        product: "Silver Wire 0.8mm",
        image: "https://content.pancake.vn/2-25/2025/9/13/504c96dfc212978ade6fb85b33e892caa64786f7.jpg",
        customer: {
            name: "Emma T.",
            location: "Auckland, NZ",
            avatar: "ET"
        },
        rating: 5,
        date: "2 WEEKS AGO"
    },
    {
        id: 8,
        text: "Beautiful silver chain, exactly what I was looking for. Will definitely order again!",
        product: "Snake Chain Silver",
        image: "https://content.pancake.vn/2-25/2025/8/17/9b5da9db46b5219575b01169eb05911f81d5bc11.jpg",
        customer: {
            name: "Michael R.",
            location: "Brisbane, QLD",
            avatar: "MR"
        },
        rating: 5,
        date: "2 WEEKS AGO"
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
            <div class="testimonial-product">Product: ${testimonial.product}</div>
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