const fs = require('fs');
const path = require('path');

const DB_FILE = path.join(__dirname, 'data.json');

const sampleBusinesses = [
  {
    id: "biz-royal-spice",
    slug: "royal-spice",
    name: "The Royal Spice Bistro",
    type: "restaurant",
    categoryName: "Restaurant & Fine Dining",
    tagline: "Authentic Flavors, Royal Hospitality & Rewards",
    phone: "+91 98765 43210",
    email: "contact@royalspice.com",
    city: "New Delhi",
    address: "Shop 12-14, Gourmet Boulevard, MG Road, New Delhi",
    googleReviewUrl: "https://search.google.com/local/writereview?placeid=ChIJN1t_tDeuEmsRUsoyG83frY4",
    googlePlaceName: "The Royal Spice Bistro & Cafe",
    googleRating: "4.9",
    totalGoogleReviews: 1482,
    plan: "pro_bundle",
    billingCycle: "annual",
    adminPin: "1234",
    antiCheatEnabled: true,
    megaOffer: {
      title: "🏆 VIP BUMPER REWARD: FLAT 50% OFF!",
      discount: "FLAT 50% OFF (Max ₹750)",
      code: "ROYAL-BUMPER-50",
      description: "Congratulations on completing all 5 stamps! Enjoy 50% off on your entire food bill on your next visit.",
      validDays: 30,
      terms: "Valid on all dine-in orders above ₹499. One time use only."
    },
    scratchOffers: [
      {
        id: "off-1",
        title: "Flat 15% OFF",
        type: "discount",
        code: "FLAT15ROYAL",
        badge: "🎉 Instant Discount",
        description: "Get 15% off on your total food bill today!",
        probability: 25,
        icon: "fa-percent",
        active: true
      },
      {
        id: "off-2",
        title: "Free Royal Mocktail 🍹",
        type: "freebie",
        code: "FREEDRINK",
        badge: "🍹 Free Drink",
        description: "Enjoy any gourmet mocktail or fresh lemonade free!",
        probability: 20,
        icon: "fa-glass-water",
        active: true
      },
      {
        id: "off-3",
        title: "Flat ₹100 Cashback/Off",
        type: "cashback",
        code: "ROYAL100",
        badge: "💵 ₹100 Off",
        description: "Flat ₹100 deduction on orders above ₹400.",
        probability: 15,
        icon: "fa-tags",
        active: true
      },
      {
        id: "off-4",
        title: "Free Sizzling Brownie 🍨",
        type: "freebie",
        code: "BROWNIEFREE",
        badge: "🍨 Sweet Treat",
        description: "Complimentary Hot Sizzling Brownie with Vanilla Ice Cream!",
        probability: 15,
        icon: "fa-ice-cream",
        active: true
      },
      {
        id: "off-5",
        title: "Better Luck Next Time 🍀",
        type: "waste",
        code: "TRYAGAIN",
        badge: "🍀 Keep Stamping!",
        description: "No discount this time, but your Stamp has been added! 5 stamps unlock the 50% Grand Offer!",
        probability: 25,
        icon: "fa-clover",
        active: true
      }
    ],
    customers: [
      {
        id: "cust-1",
        name: "Rohit Sharma",
        mobile: "9876543210",
        dob: "1994-06-15",
        address: "Sector 14, Gurugram",
        deviceFingerprint: "fp_demo_device_1",
        stamps: 4,
        visits: 4,
        lastVisit: new Date(Date.now() - 86400000 * 2).toISOString(),
        registeredAt: new Date(Date.now() - 86400000 * 14).toISOString(),
        wonCoupons: [
          { code: "FLAT15ROYAL", title: "Flat 15% OFF", date: new Date(Date.now() - 86400000 * 2).toISOString(), redeemed: false },
          { code: "FREEDRINK", title: "Free Royal Mocktail", date: new Date(Date.now() - 86400000 * 7).toISOString(), redeemed: true }
        ]
      },
      {
        id: "cust-2",
        name: "Pooja Verma",
        mobile: "9811223344",
        dob: "1998-11-22",
        address: "Lajpat Nagar, New Delhi",
        deviceFingerprint: "fp_demo_device_2",
        stamps: 6,
        visits: 6,
        lastVisit: new Date(Date.now() - 86400000).toISOString(),
        registeredAt: new Date(Date.now() - 86400000 * 25).toISOString(),
        wonCoupons: [
          { code: "ROYAL-BUMPER-50", title: "🏆 VIP BUMPER: FLAT 50% OFF", date: new Date(Date.now() - 86400000).toISOString(), redeemed: false, isMega: true }
        ]
      }
    ],
    reviews: [
      {
        id: "rev-1",
        customerName: "Aman Gupta",
        rating: 5,
        date: "2 days ago",
        text: "The Dal Makhani and Butter Naan were simply divine! Extremely welcoming staff and warm royal vibes. 5/5 stars!",
        relativeTime: "2 days ago",
        avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=faces"
      },
      {
        id: "rev-2",
        customerName: "Sneha Reddy",
        rating: 5,
        date: "4 days ago",
        text: "Loved the scratch card reward! Got a free sizzling brownie and the food quality was exceptional. Will come back with family!",
        relativeTime: "4 days ago",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=faces"
      }
    ]
  },
  {
    id: "biz-cafe-bliss",
    slug: "cafe-bliss",
    name: "Cafe Bliss & Artisanal Roastery",
    type: "cafe",
    categoryName: "Cafe & Coffee Roastery",
    tagline: "Handcrafted Coffees, Fresh Pastries & Good Vibes",
    phone: "+91 98111 22334",
    email: "hello@cafebliss.in",
    city: "Bengaluru",
    address: "100 Feet Road, Indiranagar, Bengaluru",
    googleReviewUrl: "https://search.google.com/local/writereview?placeid=ChIJN1t_tDeuEmsRUsoyG83frY4",
    googlePlaceName: "Cafe Bliss Indiranagar",
    googleRating: "4.8",
    totalGoogleReviews: 940,
    plan: "pro_bundle",
    billingCycle: "monthly",
    adminPin: "1234",
    antiCheatEnabled: true,
    megaOffer: {
      title: "🏆 6TH STAMP BUMPER: FREE SOURDOUGH PIZZA + COFFEE!",
      discount: "100% FREE MEAL COMBO",
      code: "BLISS-BUMPER-VIP",
      description: "Woohoo! 5 stamps completed. Your 6th stamp earns a Free Gourmet Pizza & Pour-over Coffee on your next cafe visit!",
      validDays: 30,
      terms: "Valid on all dine-in visits. One time use only."
    },
    scratchOffers: [
      {
        id: "cb-1",
        title: "Free Caramel Latte ☕",
        type: "freebie",
        code: "FREELATTE",
        badge: "☕ Free Coffee",
        description: "Enjoy a hot Caramel Latte on the house!",
        probability: 25,
        icon: "fa-mug-hot",
        active: true
      },
      {
        id: "cb-2",
        title: "Flat 20% OFF Bakery 🥐",
        type: "discount",
        code: "BAKE20",
        badge: "🥐 20% Off",
        description: "20% off on all fresh croissants, bagels & cakes!",
        probability: 25,
        icon: "fa-cookie-bite",
        active: true
      },
      {
        id: "cb-3",
        title: "Better Luck Next Time 🍀",
        type: "waste",
        code: "TRYAGAIN",
        badge: "🍀 Stamp Added!",
        description: "No discount today, but your Visit Stamp is added! 6th stamp unlocks Free Sourdough Pizza!",
        probability: 50,
        icon: "fa-clover",
        active: true
      }
    ],
    customers: [
      {
        id: "cust-cb-1",
        name: "Ananya Iyer",
        mobile: "9845012345",
        dob: "1997-03-14",
        address: "Indiranagar, Bengaluru",
        deviceFingerprint: "fp_demo_cb_1",
        stamps: 3,
        visits: 3,
        lastVisit: new Date().toISOString(),
        registeredAt: new Date(Date.now() - 86400000 * 10).toISOString(),
        wonCoupons: [
          { code: "FREELATTE", title: "Free Caramel Latte ☕", date: new Date().toISOString(), redeemed: false }
        ]
      }
    ],
    reviews: [
      {
        id: "rev-cb-1",
        customerName: "Rohan Kapoor",
        rating: 5,
        date: "Yesterday",
        text: "The pour-over coffee and hazelnut croissant are out of this world! Perfect work-friendly vibe and soothing playlist. ⭐⭐⭐⭐⭐",
        relativeTime: "Yesterday",
        avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=faces"
      }
    ]
  },
  {
    id: "biz-grand-regency",
    slug: "grand-regency",
    name: "The Grand Regency Luxury Hotel & Suites",
    type: "hotel",
    categoryName: "Hotel & Hospitality",
    tagline: "Unparalleled Luxury, World-Class Dining & Pampering",
    phone: "+91 99887 76655",
    email: "concierge@grandregency.com",
    city: "Mumbai",
    address: "Juhu Beachfront, Mumbai",
    googleReviewUrl: "https://search.google.com/local/writereview?placeid=ChIJN1t_tDeuEmsRUsoyG83frY4",
    googlePlaceName: "The Grand Regency Juhu",
    googleRating: "4.9",
    totalGoogleReviews: 2410,
    plan: "pro_bundle",
    billingCycle: "annual",
    adminPin: "1234",
    antiCheatEnabled: true,
    megaOffer: {
      title: "🏆 6TH VISIT BUMPER: FLAT 50% OFF ON LUXURY STAY OR SPA!",
      discount: "FLAT 50% OFF (Max ₹3000)",
      code: "REGENCY-50-VIP",
      description: "Congratulations! Your 6th visit unlocks 50% discount on your next suite booking or wellness spa session.",
      validDays: 60,
      terms: "Valid on room booking or spa session. Prior reservation required."
    },
    scratchOffers: [
      {
        id: "gr-1",
        title: "Complimentary High Tea 🫖",
        type: "freebie",
        code: "ROYALTEA",
        badge: "🫖 High Tea",
        description: "Enjoy chef's luxury royal high tea platter for 2!",
        probability: 30,
        icon: "fa-mug-saucer",
        active: true
      },
      {
        id: "gr-2",
        title: "Flat ₹500 Off Dine-in 🍽️",
        type: "cashback",
        code: "REGENCY500",
        badge: "💵 ₹500 Off",
        description: "Flat ₹500 discount on poolside restaurant buffet.",
        probability: 30,
        icon: "fa-tag",
        active: true
      },
      {
        id: "gr-3",
        title: "Better Luck Next Time 🍀",
        type: "waste",
        code: "TRYAGAIN",
        badge: "🍀 Stamp Added!",
        description: "Stamp added to your VIP passport! 6th stamp gives 50% off stay!",
        probability: 40,
        icon: "fa-clover",
        active: true
      }
    ],
    customers: [],
    reviews: []
  },
  {
    id: "biz-glam-studio",
    slug: "glam-studio",
    name: "Glam & Glow Luxury Salon & Spa",
    type: "salon",
    categoryName: "Salon, Spa & Wellness",
    tagline: "Couture Hair Styling, Organic Facials & Body Spa",
    phone: "+91 97766 55443",
    email: "book@glamglow.in",
    city: "Pune",
    address: "Lane 7, Koregaon Park, Pune",
    googleReviewUrl: "https://search.google.com/local/writereview?placeid=ChIJN1t_tDeuEmsRUsoyG83frY4",
    googlePlaceName: "Glam & Glow Salon Pune",
    googleRating: "4.9",
    totalGoogleReviews: 680,
    plan: "loyalty_only",
    billingCycle: "monthly",
    adminPin: "1234",
    antiCheatEnabled: true,
    megaOffer: {
      title: "🏆 6TH VISIT BUMPER: FLAT 50% OFF ON ANY SPA / HAIR TREATMENT!",
      discount: "FLAT 50% OFF (Max ₹1200)",
      code: "GLAM-BUMPER-50",
      description: "Congratulations! 5 visits complete. Get 50% off on premium hair botox, balayage, or luxury facial on your next appointment.",
      validDays: 45,
      terms: "Valid on all salon services above ₹999."
    },
    scratchOffers: [
      {
        id: "gg-1",
        title: "Free Moroccan Hair Spa 💆",
        type: "freebie",
        code: "FREESPA",
        badge: "💆 Free Spa",
        description: "Complimentary deep hydration hair spa treatment!",
        probability: 25,
        icon: "fa-spa",
        active: true
      },
      {
        id: "gg-2",
        title: "Flat ₹200 Off Any Service 💅",
        type: "cashback",
        code: "GLAM200",
        badge: "💵 ₹200 Off",
        description: "Flat ₹200 off on nail art or facial services.",
        probability: 30,
        icon: "fa-heart",
        active: true
      },
      {
        id: "gg-3",
        title: "Better Luck Next Time 🍀",
        type: "waste",
        code: "TRYAGAIN",
        badge: "🍀 Stamp Added!",
        description: "Keep shining! Visit stamp added towards your 50% Grand Bumper!",
        probability: 45,
        icon: "fa-clover",
        active: true
      }
    ],
    customers: [],
    reviews: []
  }
];

function readDb() {
  try {
    if (!fs.existsSync(DB_FILE)) {
      const initial = { businesses: sampleBusinesses };
      fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), 'utf-8');
      return initial;
    }
    const content = fs.readFileSync(DB_FILE, 'utf-8');
    if (!content.trim()) {
      const initial = { businesses: sampleBusinesses };
      fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), 'utf-8');
      return initial;
    }
    const data = JSON.parse(content);
    if (!data.businesses || !Array.isArray(data.businesses)) {
      data.businesses = sampleBusinesses;
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    }
    return data;
  } catch (err) {
    console.error('Error reading db:', err);
    return { businesses: sampleBusinesses };
  }
}

function writeDb(data) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Error writing db:', err);
    return false;
  }
}

// Multi-tenant Helper
function getBusinessBySlug(slug) {
  const db = readDb();
  if (!slug) slug = 'royal-spice';
  return db.businesses.find(b => b.slug.toLowerCase() === slug.toLowerCase()) || db.businesses[0];
}

function getAllBusinesses() {
  const db = readDb();
  return db.businesses.map(b => ({
    id: b.id,
    slug: b.slug,
    name: b.name,
    type: b.type,
    categoryName: b.categoryName,
    tagline: b.tagline,
    phone: b.phone,
    email: b.email,
    city: b.city,
    googleRating: b.googleRating,
    totalGoogleReviews: b.totalGoogleReviews,
    plan: b.plan,
    billingCycle: b.billingCycle,
    createdAt: b.createdAt
  }));
}

function createBusiness(bizData) {
  const db = readDb();
  const slug = (bizData.slug || bizData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || `biz-${Date.now()}`);
  
  // Ensure unique slug
  let uniqueSlug = slug;
  let counter = 1;
  while (db.businesses.some(b => b.slug === uniqueSlug)) {
    uniqueSlug = `${slug}-${counter++}`;
  }

  const categoryDefaults = {
    restaurant: {
      categoryName: "Restaurant & Dining",
      megaTitle: "🏆 6TH VISIT BUMPER: FLAT 50% OFF ENTIRE BILL!",
      megaDiscount: "FLAT 50% OFF (Max ₹750)",
      megaCode: `${uniqueSlug.toUpperCase().slice(0, 5)}-BUMPER-50`
    },
    cafe: {
      categoryName: "Cafe & Bakery",
      megaTitle: "🏆 6TH VISIT BUMPER: FREE ARTISANAL COMBO MEAL!",
      megaDiscount: "FREE GOURMET COMBO",
      megaCode: `${uniqueSlug.toUpperCase().slice(0, 5)}-VIP-FREE`
    },
    hotel: {
      categoryName: "Hotel & Resort",
      megaTitle: "🏆 6TH STAY BUMPER: FLAT 50% OFF NEXT BOOKING!",
      megaDiscount: "FLAT 50% OFF (Max ₹2500)",
      megaCode: `${uniqueSlug.toUpperCase().slice(0, 5)}-HOTEL-50`
    },
    salon: {
      categoryName: "Salon, Spa & Beauty",
      megaTitle: "🏆 6TH VISIT BUMPER: FLAT 50% OFF ANY LUXURY TREATMENT!",
      megaDiscount: "FLAT 50% OFF (Max ₹1000)",
      megaCode: `${uniqueSlug.toUpperCase().slice(0, 5)}-GLAM-50`
    },
    retail: {
      categoryName: "Retail Store & Boutique",
      megaTitle: "🏆 6TH SHOPPING BUMPER: FLAT ₹500 VOUCHER!",
      megaDiscount: "FLAT ₹500 OFF",
      megaCode: `${uniqueSlug.toUpperCase().slice(0, 5)}-SHOP-500`
    },
    clinic: {
      categoryName: "Clinic & Healthcare",
      megaTitle: "🏆 6TH VISIT BUMPER: FREE COMPREHENSIVE CONSULTATION!",
      megaDiscount: "FREE CONSULTATION",
      megaCode: `${uniqueSlug.toUpperCase().slice(0, 5)}-HEALTH-VIP`
    }
  };

  const defaults = categoryDefaults[bizData.type] || categoryDefaults.restaurant;

  const newBiz = {
    id: `biz-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    slug: uniqueSlug,
    name: bizData.name.trim(),
    type: bizData.type || 'restaurant',
    categoryName: defaults.categoryName,
    tagline: bizData.tagline || 'Experience Excellence & Loyalty Rewards',
    phone: bizData.phone || '',
    email: bizData.email || '',
    city: bizData.city || 'Delhi NCR',
    address: bizData.address || '',
    googleReviewUrl: bizData.googleReviewUrl || 'https://search.google.com/local/writereview',
    googlePlaceName: bizData.googlePlaceName || bizData.name,
    googleRating: bizData.googleRating || "4.9",
    totalGoogleReviews: parseInt(bizData.totalGoogleReviews, 10) || 120,
    plan: bizData.plan || 'pro_bundle', // loyalty_only | review_only | pro_bundle
    billingCycle: bizData.billingCycle || 'monthly', // monthly | annual
    adminPin: bizData.adminPin || '1234',
    antiCheatEnabled: true,
    createdAt: new Date().toISOString(),
    megaOffer: {
      title: defaults.megaTitle,
      discount: defaults.megaDiscount,
      code: defaults.megaCode,
      description: `Congratulations on completing all 5 visits! Enjoy your grand bumper offer on your 6th visit.`,
      validDays: 30,
      terms: "Valid on all services/orders. One time use only."
    },
    scratchOffers: [
      {
        id: "off-std-1",
        title: "Flat 15% OFF",
        type: "discount",
        code: `${uniqueSlug.toUpperCase().slice(0, 4)}15`,
        badge: "🎉 15% Discount",
        description: "Enjoy 15% off on your bill today!",
        probability: 25,
        icon: "fa-percent",
        active: true
      },
      {
        id: "off-std-2",
        title: "Flat ₹100 Cashback/Off",
        type: "cashback",
        code: `${uniqueSlug.toUpperCase().slice(0, 4)}100`,
        badge: "💵 ₹100 Off",
        description: "Flat ₹100 discount on your bill today!",
        probability: 25,
        icon: "fa-tags",
        active: true
      },
      {
        id: "off-std-3",
        title: "Free Surprise Perk 🎁",
        type: "freebie",
        code: "FREEPERK",
        badge: "🎁 Free Perk",
        description: "Complimentary beverage or treat on the house!",
        probability: 15,
        icon: "fa-gift",
        active: true
      },
      {
        id: "off-std-4",
        title: "Better Luck Next Time 🍀",
        type: "waste",
        code: "TRYAGAIN",
        badge: "🍀 Visit Stamp Added!",
        description: "No instant discount today, but your Visit Stamp is added! 6th stamp unlocks the 50% Grand Bumper!",
        probability: 35,
        icon: "fa-clover",
        active: true
      }
    ],
    customers: [],
    reviews: []
  };

  db.businesses.unshift(newBiz);
  writeDb(db);
  return newBiz;
}

function updateBusiness(slug, updateData) {
  const db = readDb();
  const idx = db.businesses.findIndex(b => b.slug.toLowerCase() === slug.toLowerCase());
  if (idx < 0) return null;

  db.businesses[idx] = { ...db.businesses[idx], ...updateData };
  writeDb(db);
  return db.businesses[idx];
}

module.exports = {
  readDb,
  writeDb,
  getAllBusinesses,
  getBusinessBySlug,
  createBusiness,
  updateBusiness,

  // Backward compatibility methods (defaults to royal-spice or requested biz)
  getSettings(slug) {
    const biz = getBusinessBySlug(slug);
    return {
      restaurantName: biz.name,
      tagline: biz.tagline,
      phone: biz.phone,
      address: biz.address,
      googleReviewUrl: biz.googleReviewUrl,
      googlePlaceName: biz.googlePlaceName,
      googleRating: biz.googleRating,
      totalGoogleReviews: biz.totalGoogleReviews,
      antiCheatEnabled: biz.antiCheatEnabled,
      plan: biz.plan,
      slug: biz.slug,
      type: biz.type
    };
  },
  updateSettings(newSettings, slug) {
    const biz = getBusinessBySlug(slug);
    if (!biz) return null;
    if (newSettings.restaurantName) biz.name = newSettings.restaurantName;
    if (newSettings.tagline) biz.tagline = newSettings.tagline;
    if (newSettings.phone) biz.phone = newSettings.phone;
    if (newSettings.address) biz.address = newSettings.address;
    if (newSettings.googleReviewUrl) biz.googleReviewUrl = newSettings.googleReviewUrl;
    if (newSettings.googlePlaceName) biz.googlePlaceName = newSettings.googlePlaceName;
    if (newSettings.googleRating) biz.googleRating = newSettings.googleRating;
    if (newSettings.antiCheatEnabled !== undefined) biz.antiCheatEnabled = newSettings.antiCheatEnabled;
    return updateBusiness(biz.slug, biz);
  },
  getMegaOffer(slug) {
    const biz = getBusinessBySlug(slug);
    return biz.megaOffer;
  },
  updateMegaOffer(newMega, slug) {
    const biz = getBusinessBySlug(slug);
    biz.megaOffer = { ...biz.megaOffer, ...newMega };
    updateBusiness(biz.slug, biz);
    return biz.megaOffer;
  },
  getOffers(slug) {
    const biz = getBusinessBySlug(slug);
    return biz.scratchOffers || [];
  },
  setOffers(offers, slug) {
    const biz = getBusinessBySlug(slug);
    biz.scratchOffers = offers;
    updateBusiness(biz.slug, biz);
    return biz.scratchOffers;
  },
  getCustomers(slug) {
    const biz = getBusinessBySlug(slug);
    return biz.customers || [];
  },
  getCustomerById(id, slug) {
    const biz = getBusinessBySlug(slug);
    return (biz.customers || []).find(c => c.id === id);
  },
  getCustomerByMobile(mobile, slug) {
    const biz = getBusinessBySlug(slug);
    const cleanMobile = String(mobile).replace(/\D/g, '').slice(-10);
    return (biz.customers || []).find(c => {
      const cMobile = String(c.mobile).replace(/\D/g, '').slice(-10);
      return cMobile === cleanMobile;
    });
  },
  getCustomerByDevice(deviceFingerprint, slug) {
    if (!deviceFingerprint) return null;
    const biz = getBusinessBySlug(slug);
    return (biz.customers || []).find(c => c.deviceFingerprint === deviceFingerprint);
  },
  saveCustomer(customer, slug) {
    const biz = getBusinessBySlug(slug);
    if (!biz.customers) biz.customers = [];
    const idx = biz.customers.findIndex(c => c.id === customer.id);
    if (idx >= 0) {
      biz.customers[idx] = customer;
    } else {
      biz.customers.unshift(customer);
    }
    updateBusiness(biz.slug, biz);
    return customer;
  },
  deleteCustomer(id, slug) {
    const biz = getBusinessBySlug(slug);
    if (!biz.customers) return false;
    biz.customers = biz.customers.filter(c => c.id !== id);
    updateBusiness(biz.slug, biz);
    return true;
  },
  getReviews(slug) {
    const biz = getBusinessBySlug(slug);
    return biz.reviews || [];
  },
  addReview(review, slug) {
    const biz = getBusinessBySlug(slug);
    if (!biz.reviews) biz.reviews = [];
    biz.reviews.unshift(review);
    updateBusiness(biz.slug, biz);
    return review;
  }
};
