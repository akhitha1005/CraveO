import express from 'express';
import { createServer as createViteServer } from 'vite';
import fs from 'fs';
import path from 'path';
import {
  INITIAL_USERS,
  INITIAL_RESTAURANTS,
  INITIAL_FOOD_ITEMS,
  INITIAL_DELIVERY_PARTNERS,
  INITIAL_ORDERS,
  INITIAL_REVIEWS,
  INITIAL_COMPLAINTS,
} from './src/data/seedData';
import { User, Restaurant, FoodItem, DeliveryPartner, Order, Review, Complaint, OrderStatus } from './src/types';

const app = express();
const PORT = 3000;

app.use(express.json());

// Persistent store management
const DATA_DIR = path.resolve(process.cwd(), 'data');
const STORE_FILE = path.join(DATA_DIR, 'store.json');

interface AppData {
  users: User[];
  restaurants: Restaurant[];
  foodItems: FoodItem[];
  deliveryPartners: DeliveryPartner[];
  orders: Order[];
  reviews: Review[];
  complaints: Complaint[];
}

let db: AppData = {
  users: INITIAL_USERS,
  restaurants: INITIAL_RESTAURANTS,
  foodItems: INITIAL_FOOD_ITEMS,
  deliveryPartners: INITIAL_DELIVERY_PARTNERS,
  orders: INITIAL_ORDERS,
  reviews: INITIAL_REVIEWS,
  complaints: INITIAL_COMPLAINTS,
};

function loadStore() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(STORE_FILE)) {
      const data = fs.readFileSync(STORE_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      if (parsed.users && parsed.restaurants && parsed.foodItems) {
        db = parsed;
        console.log('[Store] Loaded database from disk.');
        return;
      }
    }
    saveStore();
  } catch (err) {
    console.error('[Store] Error loading store:', err);
  }
}

function saveStore() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(STORE_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.error('[Store] Error saving store:', err);
  }
}

loadStore();

// -------------------------------------------------------------
// REST API ROUTES
// -------------------------------------------------------------

// 1. Auth routes
app.post('/api/auth/login', (req, res) => {
  const { email, password, role } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  // Find user by email or demo role match
  let user = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  
  if (!user && role) {
    user = db.users.find((u) => u.role === role);
  }

  if (!user) {
    // If not found, create a demo session for the requested role
    const newUser: User = {
      id: `user_${Date.now()}`,
      name: email.split('@')[0],
      email: email.toLowerCase(),
      phone: '+1 (555) 000-1111',
      role: role || 'customer',
      status: 'active',
      createdAt: new Date().toISOString(),
    };
    db.users.push(newUser);
    saveStore();
    return res.json({ user: newUser, token: `token_${newUser.id}` });
  }

  if (user.status === 'suspended') {
    return res.status(403).json({ error: 'Your account has been suspended by the platform administrator.' });
  }

  res.json({ user, token: `token_${user.id}` });
});

app.post('/api/auth/register', (req, res) => {
  const { name, email, phone, role, restaurantName, vehicleType } = req.body;
  if (!name || !email || !role) {
    return res.status(400).json({ error: 'Name, email, and role are required' });
  }

  const existing = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return res.status(400).json({ error: 'An account with this email already exists' });
  }

  const userId = `user_${Date.now()}`;
  let restaurantId: string | undefined;
  let deliveryPartnerId: string | undefined;

  if (role === 'restaurant') {
    restaurantId = `rest_${Date.now()}`;
    const newRestaurant: Restaurant = {
      id: restaurantId,
      userId,
      name: restaurantName || `${name}'s Rasoi`,
      tagline: 'Authentic Desi Flavors & Fresh Cooking',
      description: 'Serving delicious chef-prepared Indian meals with fresh spices.',
      cuisine: ['North Indian', 'Biryani'],
      rating: 5.0,
      reviewCount: 1,
      deliveryTime: '25-35 mins',
      deliveryFee: 40.0,
      minOrder: 150.0,
      address: 'Shop 14, Main Road, Indiranagar, Bengaluru, Karnataka - 560038',
      phone: phone || '+91 98450 12345',
      image: '/src/assets/images/craveo_butter_chicken_naan_1794476290926.jpg',
      coverImage: '/src/assets/images/craveo_indian_feast_hero_1794476290274.jpg',
      status: 'open',
      isApproved: true,
      priceLevel: '$$',
    };
    db.restaurants.push(newRestaurant);
  } else if (role === 'delivery') {
    deliveryPartnerId = `dp_${Date.now()}`;
    const newPartner: DeliveryPartner = {
      id: deliveryPartnerId,
      userId,
      name,
      phone: phone || '+91 98765 43210',
      vehicleType: vehicleType || 'Bike',
      vehiclePlate: 'TS 09 EV ' + Math.floor(1000 + Math.random() * 9000),
      activeStatus: 'available',
      rating: 5.0,
      totalDeliveries: 0,
      totalEarnings: 0,
    };
    db.deliveryPartners.push(newPartner);
  }

  const newUser: User = {
    id: userId,
    name,
    email: email.toLowerCase(),
    phone: phone || '',
    role,
    status: 'active',
    restaurantId,
    deliveryPartnerId,
    createdAt: new Date().toISOString(),
  };

  db.users.push(newUser);
  saveStore();

  res.status(201).json({ user: newUser, token: `token_${newUser.id}` });
});

app.get('/api/auth/users', (_req, res) => {
  res.json({ users: db.users });
});

// 2. Restaurants routes
app.get('/api/restaurants', (req, res) => {
  const { search, cuisine } = req.query;
  let list = [...db.restaurants];

  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    list = list.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.cuisine.some((c) => c.toLowerCase().includes(q)) ||
        r.description.toLowerCase().includes(q)
    );
  }

  if (cuisine && typeof cuisine === 'string' && cuisine !== 'All') {
    list = list.filter((r) => r.cuisine.includes(cuisine));
  }

  res.json({ restaurants: list });
});

app.get('/api/restaurants/:id', (req, res) => {
  const { id } = req.params;
  const restaurant = db.restaurants.find((r) => r.id === id);
  if (!restaurant) {
    return res.status(404).json({ error: 'Restaurant not found' });
  }
  const foodItems = db.foodItems.filter((f) => f.restaurantId === id);
  const reviews = db.reviews.filter((rev) => rev.targetId === id);
  res.json({ restaurant, foodItems, reviews });
});

app.put('/api/restaurants/:id', (req, res) => {
  const { id } = req.params;
  const index = db.restaurants.findIndex((r) => r.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Restaurant not found' });
  }
  db.restaurants[index] = { ...db.restaurants[index], ...req.body };
  saveStore();
  res.json({ restaurant: db.restaurants[index] });
});

app.patch('/api/restaurants/:id/status', (req, res) => {
  const { id } = req.params;
  const { status, isApproved } = req.body;
  const index = db.restaurants.findIndex((r) => r.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Restaurant not found' });
  }
  if (status !== undefined) db.restaurants[index].status = status;
  if (isApproved !== undefined) db.restaurants[index].isApproved = isApproved;
  saveStore();
  res.json({ restaurant: db.restaurants[index] });
});

// 3. Food Items routes
app.get('/api/food-items', (req, res) => {
  const { restaurantId, search, category, isVeg } = req.query;
  let items = [...db.foodItems];

  if (restaurantId && typeof restaurantId === 'string') {
    items = items.filter((item) => item.restaurantId === restaurantId);
  }
  if (category && typeof category === 'string' && category !== 'All') {
    items = items.filter((item) => item.category === category);
  }
  if (isVeg === 'true') {
    items = items.filter((item) => item.isVeg);
  }
  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    items = items.filter((item) => item.name.toLowerCase().includes(q) || item.description.toLowerCase().includes(q));
  }

  res.json({ foodItems: items });
});

app.post('/api/food-items', (req, res) => {
  const { restaurantId, name, description, category, price, isVeg, image, isAvailable } = req.body;
  if (!restaurantId || !name || price === undefined) {
    return res.status(400).json({ error: 'restaurantId, name, and price are required' });
  }

  const newItem: FoodItem = {
    id: `food_${Date.now()}`,
    restaurantId,
    name,
    description: description || '',
    category: category || 'Main Course',
    price: parseFloat(price),
    isVeg: Boolean(isVeg),
    image: image || '/src/assets/images/craveo_featured_burger_1794475039922.jpg',
    isAvailable: isAvailable !== undefined ? Boolean(isAvailable) : true,
    rating: 5.0,
    prepTimeMinutes: 15,
  };

  db.foodItems.push(newItem);
  saveStore();
  res.status(201).json({ foodItem: newItem });
});

app.put('/api/food-items/:id', (req, res) => {
  const { id } = req.params;
  const index = db.foodItems.findIndex((item) => item.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Food item not found' });
  }

  db.foodItems[index] = {
    ...db.foodItems[index],
    ...req.body,
    price: req.body.price !== undefined ? parseFloat(req.body.price) : db.foodItems[index].price,
  };
  saveStore();
  res.json({ foodItem: db.foodItems[index] });
});

app.delete('/api/food-items/:id', (req, res) => {
  const { id } = req.params;
  const index = db.foodItems.findIndex((item) => item.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Food item not found' });
  }
  const deleted = db.foodItems.splice(index, 1)[0];
  saveStore();
  res.json({ success: true, deletedItem: deleted });
});

app.patch('/api/food-items/:id/availability', (req, res) => {
  const { id } = req.params;
  const item = db.foodItems.find((i) => i.id === id);
  if (!item) {
    return res.status(404).json({ error: 'Food item not found' });
  }
  item.isAvailable = !item.isAvailable;
  saveStore();
  res.json({ foodItem: item });
});

// 4. Orders routes
app.get('/api/orders', (req, res) => {
  const { customerId, restaurantId, deliveryPartnerId, status } = req.query;
  let orders = [...db.orders];

  if (customerId && typeof customerId === 'string') {
    orders = orders.filter((o) => o.customerId === customerId);
  }
  if (restaurantId && typeof restaurantId === 'string') {
    orders = orders.filter((o) => o.restaurantId === restaurantId);
  }
  if (deliveryPartnerId && typeof deliveryPartnerId === 'string') {
    orders = orders.filter((o) => o.deliveryPartnerId === deliveryPartnerId);
  }
  if (status && typeof status === 'string' && status !== 'all') {
    orders = orders.filter((o) => o.status === status);
  }

  // Sort latest first
  orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  res.json({ orders });
});

app.get('/api/orders/:id', (req, res) => {
  const { id } = req.params;
  const order = db.orders.find((o) => o.id === id || o.orderNumber === id);
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }
  res.json({ order });
});

app.post('/api/orders', (req, res) => {
  const {
    customerId,
    customerName,
    customerPhone,
    deliveryAddress,
    restaurantId,
    restaurantName,
    items,
    subtotal,
    deliveryFee,
    tax,
    tip,
    discount,
    totalAmount,
    paymentMethod,
  } = req.body;

  if (!customerId || !restaurantId || !items || !items.length) {
    return res.status(400).json({ error: 'Missing required order details' });
  }

  // Lookup restaurant to enrich
  const rest = db.restaurants.find((r) => r.id === restaurantId);

  // Auto assign an available delivery partner if available
  const availablePartner = db.deliveryPartners.find((p) => p.activeStatus === 'available');

  const orderNum = 'CRV-' + Math.floor(1000 + Math.random() * 9000);
  const newOrder: Order = {
    id: `order_${Date.now()}`,
    orderNumber: orderNum,
    customerId,
    customerName: customerName || 'Valued Foodie',
    customerPhone: customerPhone || '+91 98490 23456',
    deliveryAddress: deliveryAddress || {
      id: 'addr_auto',
      label: 'Home',
      street: 'Flat 402, Sai Residency, Road No. 12, Banjara Hills',
      city: 'Hyderabad',
      state: 'Telangana',
      zipCode: '500034',
      isDefault: true,
    },
    restaurantId,
    restaurantName: rest ? rest.name : restaurantName || 'Partner Restaurant',
    restaurantPhone: rest?.phone,
    restaurantAddress: rest?.address,
    deliveryPartnerId: availablePartner ? availablePartner.id : 'dp_1',
    deliveryPartnerName: availablePartner ? availablePartner.name : 'Ramesh Kumar',
    deliveryPartnerPhone: availablePartner ? availablePartner.phone : '+91 98765 43210',
    status: 'placed',
    items,
    subtotal: subtotal || 0,
    deliveryFee: deliveryFee || 0,
    tax: tax || 0,
    tip: tip || 0,
    discount: discount || 0,
    totalAmount: totalAmount || subtotal + deliveryFee + tax + tip - discount,
    paymentMethod: paymentMethod || 'card',
    paymentStatus: 'paid',
    transactionId: 'TXN_' + Math.floor(10000000 + Math.random() * 90000000),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    estimatedDeliveryMinutes: 30,
  };

  db.orders.unshift(newOrder);
  saveStore();
  res.status(201).json({ order: newOrder });
});

app.patch('/api/orders/:id/status', (req, res) => {
  const { id } = req.params;
  const { status, cancellationReason } = req.body;
  const order = db.orders.find((o) => o.id === id);
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }

  const validStatuses: OrderStatus[] = [
    'placed',
    'confirmed',
    'preparing',
    'out_for_delivery',
    'delivered',
    'cancelled',
  ];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid order status' });
  }

  order.status = status;
  order.updatedAt = new Date().toISOString();

  if (cancellationReason) {
    order.cancellationReason = cancellationReason;
  }

  // Update delivery partner earnings and count when delivered
  if (status === 'delivered' && order.deliveryPartnerId) {
    const partner = db.deliveryPartners.find((p) => p.id === order.deliveryPartnerId);
    if (partner) {
      partner.totalDeliveries += 1;
      partner.totalEarnings += order.deliveryFee + (order.tip || 0);
      partner.activeStatus = 'available';
    }
  }

  saveStore();
  res.json({ order });
});

app.patch('/api/orders/:id/assign-delivery', (req, res) => {
  const { id } = req.params;
  const { deliveryPartnerId } = req.body;
  const order = db.orders.find((o) => o.id === id);
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }

  const partner = db.deliveryPartners.find((p) => p.id === deliveryPartnerId);
  if (!partner) {
    return res.status(404).json({ error: 'Delivery partner not found' });
  }

  order.deliveryPartnerId = partner.id;
  order.deliveryPartnerName = partner.name;
  order.deliveryPartnerPhone = partner.phone;
  order.status = 'out_for_delivery';
  order.updatedAt = new Date().toISOString();

  partner.activeStatus = 'delivering';
  partner.currentOrderId = order.id;

  saveStore();
  res.json({ order, partner });
});

// 5. Delivery Partner routes
app.get('/api/delivery/partners', (_req, res) => {
  res.json({ partners: db.deliveryPartners });
});

app.patch('/api/delivery/partners/:id/status', (req, res) => {
  const { id } = req.params;
  const { activeStatus } = req.body;
  const partner = db.deliveryPartners.find((p) => p.id === id);
  if (!partner) {
    return res.status(404).json({ error: 'Delivery partner not found' });
  }

  partner.activeStatus = activeStatus;
  saveStore();
  res.json({ partner });
});

// 6. Reviews & Feedback
app.get('/api/reviews', (req, res) => {
  const { targetId } = req.query;
  let reviews = [...db.reviews];
  if (targetId && typeof targetId === 'string') {
    reviews = reviews.filter((r) => r.targetId === targetId);
  }
  res.json({ reviews });
});

app.post('/api/reviews', (req, res) => {
  const { userId, userName, targetType, targetId, orderId, rating, comment } = req.body;
  if (!targetId || !rating) {
    return res.status(400).json({ error: 'Target ID and rating are required' });
  }

  const newReview: Review = {
    id: `rev_${Date.now()}`,
    userId: userId || 'user_guest',
    userName: userName || 'Satisfied Foodie',
    targetType: targetType || 'restaurant',
    targetId,
    orderId: orderId || 'order_custom',
    rating: Number(rating),
    comment: comment || '',
    createdAt: new Date().toISOString(),
  };

  db.reviews.unshift(newReview);

  // Recalculate restaurant rating if targetType is restaurant
  if (targetType === 'restaurant') {
    const rest = db.restaurants.find((r) => r.id === targetId);
    if (rest) {
      const restReviews = db.reviews.filter((r) => r.targetId === targetId);
      const totalScore = restReviews.reduce((acc, curr) => acc + curr.rating, 0);
      rest.reviewCount = restReviews.length;
      rest.rating = parseFloat((totalScore / restReviews.length).toFixed(1));
    }
  }

  if (orderId) {
    const ord = db.orders.find((o) => o.id === orderId);
    if (ord) ord.reviewSubmitted = true;
  }

  saveStore();
  res.status(201).json({ review: newReview });
});

// 7. Complaints & Support (Admin)
app.get('/api/admin/complaints', (_req, res) => {
  res.json({ complaints: db.complaints });
});

app.post('/api/admin/complaints', (req, res) => {
  const { userId, userName, userEmail, userRole, orderId, subject, message, priority } = req.body;
  const newComplaint: Complaint = {
    id: `cmp_${Date.now()}`,
    userId: userId || 'guest',
    userName: userName || 'Anonymous',
    userEmail: userEmail || 'user@example.com',
    userRole: userRole || 'customer',
    orderId,
    subject: subject || 'Feedback',
    message: message || '',
    priority: priority || 'medium',
    status: 'open',
    createdAt: new Date().toISOString(),
  };

  db.complaints.unshift(newComplaint);
  saveStore();
  res.status(201).json({ complaint: newComplaint });
});

app.patch('/api/admin/complaints/:id', (req, res) => {
  const { id } = req.params;
  const { status, resolutionNotes } = req.body;
  const ticket = db.complaints.find((c) => c.id === id);
  if (!ticket) {
    return res.status(404).json({ error: 'Complaint ticket not found' });
  }

  if (status) ticket.status = status;
  if (resolutionNotes) ticket.resolutionNotes = resolutionNotes;
  saveStore();
  res.json({ complaint: ticket });
});

// 8. Admin Metrics & Overview
app.get('/api/admin/stats', (_req, res) => {
  const totalCustomers = db.users.filter((u) => u.role === 'customer').length;
  const totalRestaurants = db.restaurants.length;
  const totalDeliveryPartners = db.deliveryPartners.length;
  const totalOrders = db.orders.length;
  
  const totalRevenue = db.orders
    .filter((o) => o.status !== 'cancelled')
    .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  const activeOrdersCount = db.orders.filter(
    (o) => o.status !== 'delivered' && o.status !== 'cancelled'
  ).length;

  const orderStatusCounts: Record<string, number> = {
    placed: 0,
    confirmed: 0,
    preparing: 0,
    out_for_delivery: 0,
    delivered: 0,
    cancelled: 0,
  };

  db.orders.forEach((o) => {
    orderStatusCounts[o.status] = (orderStatusCounts[o.status] || 0) + 1;
  });

  res.json({
    totalCustomers,
    totalRestaurants,
    totalDeliveryPartners,
    totalOrders,
    totalRevenue: parseFloat(totalRevenue.toFixed(2)),
    activeOrdersCount,
    orderStatusCounts,
  });
});

app.patch('/api/admin/users/:id/status', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const user = db.users.find((u) => u.id === id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  user.status = status;
  saveStore();
  res.json({ user });
});

app.post('/api/admin/reset', (_req, res) => {
  db = {
    users: [...INITIAL_USERS],
    restaurants: [...INITIAL_RESTAURANTS],
    foodItems: [...INITIAL_FOOD_ITEMS],
    deliveryPartners: [...INITIAL_DELIVERY_PARTNERS],
    orders: [...INITIAL_ORDERS],
    reviews: [...INITIAL_REVIEWS],
    complaints: [...INITIAL_COMPLAINTS],
  };
  saveStore();
  res.json({ message: 'Store reset to defaults' });
});

// -------------------------------------------------------------
// VITE DEV SERVER / STATIC PRODUCTION MIDDLEWARE
// -------------------------------------------------------------
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[CraveO Server] Running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
