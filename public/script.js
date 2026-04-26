/* ============================================================
   TROPICANA FRESH — Premium Fruit Juice Website
   script.js
   ============================================================ */

   
// -------------------------
// 1. DOM Element References
// -------------------------
const navbar = document.getElementById('navbar');
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');
const allNavLinks = document.querySelectorAll('.nav-link');

// -------------------------
// 2. GSAP & ScrollTrigger Registration
// -------------------------
gsap.registerPlugin(ScrollTrigger);

// -------------------------
// 3. Navbar — Solid Background on Scroll
// -------------------------
window.addEventListener('scroll', () => {
    if (window.scrollY > 80) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// -------------------------
// 4. Mobile Hamburger Menu Toggle
// -------------------------
hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navLinks.classList.toggle('active');
});

// Close mobile menu when a nav link is clicked
allNavLinks.forEach((link) => {
    link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navLinks.classList.remove('active');
    });
});

// -------------------------
// 5. Active Nav Link on Scroll
// -------------------------
const sections = document.querySelectorAll('section[id]');

/**
 * Highlights the navbar link corresponding to the currently
 * visible section based on scroll position.
 */
function highlightActiveLink() {
    const scrollY = window.scrollY + 100;

    sections.forEach((section) => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        const sectionId = section.getAttribute('id');

        if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
            allNavLinks.forEach((link) => link.classList.remove('active'));

            const activeLink = document.querySelector(
                `.nav-link[href="#${sectionId}"]`
            );
            if (activeLink) {
                activeLink.classList.add('active');
            }
        }
    });
}

window.addEventListener('scroll', highlightActiveLink);

// -------------------------
// 6. GSAP — Hero Section Entrance Animations
// -------------------------
const heroTimeline = gsap.timeline({ defaults: { ease: 'power3.out' } });

heroTimeline
    .from('.hero-tagline', {
        y: 30,
        autoAlpha: 0,
        duration: 0.8,
        delay: 0.3,
    })
    .from(
        '.hero-title',
        {
            y: 50,
            autoAlpha: 0,
            duration: 1,
        },
        '-=0.5'
    )
    .from(
        '.hero-description',
        {
            y: 30,
            autoAlpha: 0,
            duration: 0.8,
        },
        '-=0.6'
    )
    .from(
        '.hero-cta',
        {
            y: 20,
            autoAlpha: 0,
            duration: 0.6,
        },
        '-=0.4'
    )
    .from(
        '.scroll-indicator',
        {
            y: 20,
            autoAlpha: 0,
            duration: 0.6,
        },
        '-=0.3'
    );

// -------------------------
// 7. GSAP — Section Headers (Scroll Triggered)
//    Using gsap.fromTo() so elements start visible and
//    only animate when ScrollTrigger fires.
// -------------------------
gsap.utils.toArray('.section-header').forEach((header) => {
    gsap.fromTo(
        header,
        { y: 60, autoAlpha: 0 },
        {
            y: 0,
            autoAlpha: 1,
            duration: 1,
            ease: 'power3.out',
            scrollTrigger: {
                trigger: header,
                start: 'top 85%',
                toggleActions: 'play none none none',
            },
        }
    );
});

// -------------------------
// 8. GSAP — Product Cards (Dynamic Fetch)
// -------------------------
async function fetchProducts() {
    try {
        const response = await fetch('/api/products');
        const data = await response.json();
        renderProducts(data.data);
    } catch (error) {
        console.error('Error fetching products:', error);
        document.getElementById('product-grid').innerHTML = '<p>Failed to load products.</p>';
    }
}

function renderProducts(products) {
    const grid = document.getElementById('product-grid');
    grid.innerHTML = '';
    
    products.forEach((product, i) => {
        const badgeHtml = product.badge ? `<div class="card-badge">${product.badge}</div>` : '';
        const card = document.createElement('div');
        card.className = 'product-card';
        card.dataset.flavor = product.flavor;
        card.dataset.id = product.id;
        
        card.innerHTML = `
            ${badgeHtml}
            <div class="card-image-wrapper">
                <img src="${product.image}" class="card-fruit-img" alt="${product.name}">
            </div>
            <div class="card-content">
                <h3 class="card-title">${product.name}</h3>
                <p class="card-description">${product.description}</p>
                <div class="card-footer">
                    <span class="card-price">$${product.price.toFixed(2)}</span>
                    <button class="btn btn-small add-to-cart-btn" data-id="${product.id}" data-name="${product.name}" data-price="${product.price}">Add to Cart</button>
                </div>
            </div>
        `;
        grid.appendChild(card);

        // GSAP Animations
        gsap.fromTo(card, { y: 80, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.8, delay: i * 0.15, ease: 'power3.out', scrollTrigger: { trigger: '.product-grid', start: 'top 80%', toggleActions: 'play none none none' } });
        
        const fruitImg = card.querySelector('.card-fruit-img');
        if (fruitImg) {
            gsap.fromTo(fruitImg, { y: -150, autoAlpha: 0, scale: 0.8 }, { y: 0, autoAlpha: 1, scale: 1, duration: 1.2, delay: (i * 0.15) + 0.3, ease: 'bounce.out', scrollTrigger: { trigger: '.product-grid', start: 'top 80%', toggleActions: 'play none none none' } });
        }
    });

    setupCartButtons();
}

// -------------------------
// 9. GSAP — About Section Content
// -------------------------
gsap.fromTo(
    '.about-content',
    { x: -60, autoAlpha: 0 },
    {
        x: 0,
        autoAlpha: 1,
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: {
            trigger: '.about-grid',
            start: 'top 80%',
            toggleActions: 'play none none none',
        },
    }
);

// -------------------------
// 10. GSAP — About Stats (Staggered Fade-In)
// -------------------------
const statCards = gsap.utils.toArray('.stat-card');

statCards.forEach((card, i) => {
    gsap.fromTo(
        card,
        { y: 50, autoAlpha: 0 },
        {
            y: 0,
            autoAlpha: 1,
            duration: 0.7,
            delay: i * 0.12,
            ease: 'power3.out',
            scrollTrigger: {
                trigger: '.about-stats',
                start: 'top 85%',
                toggleActions: 'play none none none',
            },
        }
    );
});

// -------------------------
// 11. Animated Number Counter for Stats
// -------------------------

/**
 * Animates a stat number from 0 to its data-target value.
 * Uses GSAP for smooth interpolation.
 *
 * @param {HTMLElement} el - The .stat-number element with data-target attribute.
 */
function animateCounter(el) {
    const target = parseInt(el.getAttribute('data-target'), 10);
    const counter = { value: 0 };

    gsap.to(counter, {
        value: target,
        duration: 2,
        ease: 'power2.out',
        scrollTrigger: {
            trigger: el,
            start: 'top 90%',
            toggleActions: 'play none none none',
        },
        onUpdate: () => {
            el.textContent = Math.round(counter.value);
        },
    });
}

document.querySelectorAll('.stat-number').forEach(animateCounter);

// -------------------------
// 12. GSAP — Footer Animation
// -------------------------
gsap.fromTo(
    '.footer-grid',
    { y: 40, autoAlpha: 0 },
    {
        y: 0,
        autoAlpha: 1,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: {
            trigger: '.footer',
            start: 'top 90%',
            toggleActions: 'play none none none',
        },
    }
);

// -------------------------
// 13. Product Card "Add to Cart" Interaction & Cart Logic
// -------------------------
let cart = [];

function setupCartButtons() {
    document.querySelectorAll('.add-to-cart-btn').forEach((button) => {
        button.addEventListener('click', async (e) => {
            const btn = e.target;
            const id = btn.dataset.id;
            const name = btn.dataset.name;
            const price = parseFloat(btn.dataset.price);
            
            // Add to frontend cart array
            const existing = cart.find(item => item.product_id == id);
            if (existing) {
                existing.quantity += 1;
            } else {
                cart.push({ product_id: id, name, price, quantity: 1 });
            }
            
            // Sync with backend
            try {
                await fetch('/api/cart', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ product_id: id, quantity: 1 })
                });
            } catch(err) { console.error('Cart sync error', err); }
            
            updateCartUI();

            // Quick pulse animation on click
            const card = btn.closest('.product-card');
            gsap.fromTo(
                card,
                { scale: 1 },
                { scale: 1.03, duration: 0.15, yoyo: true, repeat: 1, ease: 'power2.inOut' }
            );

            // Update button text temporarily
            const originalText = btn.textContent;
            btn.textContent = '✓ Added!';
            btn.style.background = 'linear-gradient(135deg, #4CAF50, #2E7D32)';

            setTimeout(() => {
                btn.textContent = originalText;
                btn.style.background = '';
            }, 1500);
        });
    });
}

// Cart UI Elements
const cartBtn = document.getElementById('cartBtn');
const cartModal = document.getElementById('cartModal');
const closeCart = document.getElementById('closeCart');
const cartCount = document.getElementById('cartCount');
const cartItemsContainer = document.getElementById('cartItems');
const cartTotalPrice = document.getElementById('cartTotalPrice');
const checkoutBtn = document.getElementById('checkoutBtn');

if(cartBtn) cartBtn.addEventListener('click', () => cartModal.classList.add('active'));
if(closeCart) closeCart.addEventListener('click', () => cartModal.classList.remove('active'));

async function loadInitialCart() {
    try {
        const res = await fetch('/api/cart');
        const data = await res.json();
        cart = data.data.map(item => ({
            cart_item_id: item.cart_item_id,
            product_id: item.product_id, // Fix mapping
            name: item.name,
            price: item.price,
            quantity: item.quantity
        }));
        updateCartUI();
    } catch(err) { console.error(err); }
}

function updateCartUI() {
    if(!cartCount) return;
    
    // Update count
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;
    
    // Update items
    cartItemsContainer.innerHTML = '';
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p class="empty-cart-msg">Your cart is empty.</p>';
        cartTotalPrice.textContent = '$0.00';
        return;
    }
    
    let total = 0;
    cart.forEach(item => {
        total += item.price * item.quantity;
        const div = document.createElement('div');
        div.className = 'cart-item';
        div.innerHTML = `
            <div class="cart-item-details">
                <h4>${item.name}</h4>
                <small>Qty: ${item.quantity}</small>
            </div>
            <div class="cart-item-price">$${(item.price * item.quantity).toFixed(2)}</div>
        `;
        cartItemsContainer.appendChild(div);
    });
    
    cartTotalPrice.textContent = '$' + total.toFixed(2);
}

if(checkoutBtn) {
    checkoutBtn.addEventListener('click', async () => {
        if (cart.length === 0) return alert('Cart is empty!');
        try {
            const res = await fetch('/api/checkout', { method: 'POST' });
            const data = await res.json();
            alert(data.message);
            cart = [];
            updateCartUI();
            cartModal.classList.remove('active');
        } catch(err) {
            alert('Checkout failed.');
        }
    });
}

// -------------------------
// 14. Smooth Scroll for All Anchor Links
// -------------------------
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = anchor.getAttribute('href');
        const targetSection = document.querySelector(targetId);

        if (targetSection) {
            const offsetTop =
                targetSection.getBoundingClientRect().top +
                window.pageYOffset -
                70;

            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth',
            });
        }
    });
});

// -------------------------
// 16. SerpApi Integration — Indian Juice Hotspots
// -------------------------

/**
 * Mock data for Indian Juice Centres (mimics SerpApi structure)
 */
const mockJuiceResults = [
    {
        title: "Haji Ali Juice Centre",
        rating: 4.6,
        reviews: 12540,
        address: "Lala Lajpatrai Marg, Mahalaxmi, Mumbai, Maharashtra 400026",
        thumbnail: "https://images.unsplash.com/photo-1546173159-315724a31696?auto=format&fit=crop&q=80&w=400",
        link: "https://www.hajialijuicecentre.in/"
    },
    {
        title: "Badshah Cold Drink",
        rating: 4.4,
        reviews: 8200,
        address: "Opposite Crawford Market, Mumbai, Maharashtra 400001",
        thumbnail: "https://images.unsplash.com/photo-1563227812-0ea4c22e6cc8?auto=format&fit=crop&q=80&w=400",
        link: "https://www.badshah.in/"
    },
    {
        title: "Juice Lounge",
        rating: 4.2,
        reviews: 1540,
        address: "Indiranagar, Bangalore, Karnataka 560038",
        thumbnail: "https://images.unsplash.com/photo-1497515114629-f71d768fd07c?auto=format&fit=crop&q=80&w=400",
        link: "http://www.juiceloungejuicebar.com/"
    }
];

/**
 * Fetches Indian juice locations from SerpApi or falls back to mock data.
 */
async function fetchJuiceLocations() {
    const grid = document.getElementById('juice-grid');

    // In a real scenario, you would use an API key and a proxy to avoid CORS
    // Replace 'YOUR_API_KEY' with a real key if available
    const apiKey = '';
    const query = 'Indian Fruit Juice Centre';
    const location = 'India';

    try {
        if (apiKey) {
            const url = `https://serpapi.com/search.json?q=${encodeURIComponent(query)}&location=${encodeURIComponent(location)}&api_key=${apiKey}`;
            const response = await fetch(url);
            const data = await response.json();
            renderJuiceCards(data.local_results || mockJuiceResults);
        } else {
            // Simulated delay for "fetching"
            setTimeout(() => {
                renderJuiceCards(mockJuiceResults);
            }, 1000);
        }
    } catch (error) {
        console.error('Error fetching juice locations:', error);
        renderJuiceCards(mockJuiceResults); // Fallback to mock on error
    }
}

/**
 * Renders the juice results into the UI.
 * @param {Array} results - List of location objects.
 */
function renderJuiceCards(results) {
    const grid = document.getElementById('juice-grid');
    grid.innerHTML = ''; // Clear loading state

    results.forEach((item, i) => {
        const card = document.createElement('div');
        card.className = 'juice-card';

        // Handle both SerpApi structure and mock structure
        const title = item.title;
        const rating = item.rating || 'N/A';
        const address = item.address || item.vicinity || 'Austin, TX';
        const image = item.thumbnail || 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&q=80&w=400';
        const link = item.link || '#';

        card.innerHTML = `
            <img src="${image}" alt="${title}" class="juice-image">
            <div class="juice-content">
                <h3 class="juice-title">${title}</h3>
                <div class="juice-rating">
                    <span>⭐ ${rating}</span>
                </div>
                <p class="juice-address">📍 ${address}</p>
                <a href="${link}" target="_blank" class="btn btn-small juice-btn">Visit Hub</a>
            </div>
        `;

        grid.appendChild(card);

        // GSAP animation for cards
        gsap.fromTo(
            card,
            { y: 30, autoAlpha: 0 },
            {
                y: 0,
                autoAlpha: 1,
                duration: 0.6,
                delay: i * 0.1,
                ease: 'power2.out',
                scrollTrigger: {
                    trigger: grid,
                    start: 'top 85%',
                    toggleActions: 'play none none none',
                },
            }
        );
    });
}

// Initialize fetching
window.addEventListener('load', () => {
    fetchJuiceLocations();
    fetchProducts();
    loadInitialCart();
});

// -------------------------
// 15. Refresh ScrollTrigger after page fully loads
// -------------------------
window.addEventListener('load', () => {
    ScrollTrigger.refresh();
});
