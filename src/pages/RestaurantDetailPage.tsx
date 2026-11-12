import React, { useState, useEffect } from 'react';
import { Star, Clock, MapPin, Phone, ArrowLeft, Plus, Minus, ShoppingBag, ShieldCheck, Check, MessageSquare } from 'lucide-react';
import { Restaurant, FoodItem, Review } from '../types';
import { useCart } from '../context/CartContext';

interface RestaurantDetailPageProps {
  restaurantId: string;
  onBack: () => void;
}

export const RestaurantDetailPage: React.FC<RestaurantDetailPageProps> = ({
  restaurantId,
  onBack,
}) => {
  const { addToCart, items, updateQuantity, setIsCartOpen } = useCart();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [vegOnly, setVegOnly] = useState(false);
  const [activeTab, setActiveTab] = useState<'menu' | 'reviews'>('menu');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/restaurants/${restaurantId}`)
      .then((r) => r.json())
      .then((data) => {
        setRestaurant(data.restaurant);
        setFoodItems(data.foodItems || []);
        setReviews(data.reviews || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [restaurantId]);

  if (loading || !restaurant) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
      </div>
    );
  }

  const categories = ['All', ...Array.from(new Set(foodItems.map((f) => f.category)))];

  const filteredItems = foodItems.filter((item) => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesVeg = vegOnly ? item.isVeg : true;
    return matchesCategory && matchesVeg;
  });

  const getItemQuantity = (id: string) => {
    const found = items.find((i) => i.foodItem.id === id);
    return found ? found.quantity : 0;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8 pb-20">
      {/* Back button */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-orange-600 transition"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Restaurants
      </button>

      {/* Restaurant Header Card */}
      <div className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-md">
        <div className="relative h-48 sm:h-64 bg-slate-900 overflow-hidden">
          <img
            src={restaurant.coverImage || restaurant.image}
            alt={restaurant.name}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
          <div className="absolute bottom-6 left-6 right-6 text-white space-y-2">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="bg-orange-500 font-bold px-2.5 py-0.5 rounded-lg shadow-xs">
                {restaurant.status === 'open' ? 'Open Now' : 'Closed'}
              </span>
              <span>{restaurant.cuisine.join(' · ')}</span>
              <span>·</span>
              <span>{restaurant.priceLevel}</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              {restaurant.name}
            </h1>
            <p className="text-xs sm:text-sm text-slate-200 line-clamp-1">{restaurant.tagline}</p>
          </div>
        </div>

        {/* Info Badges Bar */}
        <div className="p-4 sm:p-6 bg-[#FFFDF9] flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 text-xs">
          <div className="flex flex-wrap items-center gap-6 text-slate-600">
            <div className="flex items-center gap-1.5 font-bold text-slate-900">
              <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
              <span>{restaurant.rating}</span>
              <span className="text-slate-400 font-normal">({restaurant.reviewCount} reviews)</span>
            </div>
            <div className="flex items-center gap-1.5 font-semibold">
              <Clock className="w-4 h-4 text-orange-500" />
              <span>{restaurant.deliveryTime}</span>
            </div>
            <div className="flex items-center gap-1.5 font-semibold">
              <MapPin className="w-4 h-4 text-orange-500" />
              <span>{restaurant.address}</span>
            </div>
            <div className="flex items-center gap-1.5 font-semibold">
              <Phone className="w-4 h-4 text-orange-500" />
              <span>{restaurant.phone}</span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-slate-700 font-medium">
            <span>Delivery: <strong className="font-mono text-orange-600">₹{restaurant.deliveryFee}</strong></span>
            <span>·</span>
            <span>Min Order: <strong className="font-mono">₹{restaurant.minOrder}</strong></span>
          </div>
        </div>
      </div>

      {/* Tabs: Menu vs Reviews */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setActiveTab('menu')}
            className={`text-sm font-bold pb-2 transition border-b-2 -mb-2.5 ${
              activeTab === 'menu'
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            Menu Items ({foodItems.length})
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`text-sm font-bold pb-2 transition border-b-2 -mb-2.5 ${
              activeTab === 'reviews'
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            Verified Reviews ({reviews.length})
          </button>
        </div>

        {activeTab === 'menu' && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setVegOnly(!vegOnly)}
              className={`px-3 py-1 rounded-xl text-xs font-bold border transition flex items-center gap-1.5 ${
                vegOnly
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>Pure Veg Only</span>
            </button>
          </div>
        )}
      </div>

      {activeTab === 'menu' ? (
        <div className="space-y-6">
          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-orange-500 text-white shadow-2xs'
                    : 'bg-white text-slate-700 border border-slate-200 hover:border-orange-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Food Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((food) => {
              const qty = getItemQuantity(food.id);
              return (
                <div
                  key={food.id}
                  className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-4"
                >
                  <div className="flex gap-4">
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`w-2 h-2 rounded-full shrink-0 ${
                            food.isVeg ? 'bg-emerald-500' : 'bg-red-500'
                          }`}
                          title={food.isVeg ? 'Vegetarian' : 'Non-Vegetarian'}
                        />
                        <h4 className="text-sm font-bold text-slate-900 leading-snug">
                          {food.name}
                        </h4>
                      </div>
                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                        {food.description}
                      </p>
                      <div className="pt-1 flex items-center gap-3 text-[11px] text-slate-400">
                        {food.calories && <span>{food.calories} kcal</span>}
                        {food.calories && <span>·</span>}
                        <span>{food.category}</span>
                      </div>
                    </div>

                    <div className="w-24 h-24 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200/60 relative">
                      <img
                        src={food.image}
                        alt={food.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-base font-extrabold text-slate-900 font-mono">
                      ₹{food.price}
                    </span>

                    {qty > 0 ? (
                      <div className="flex items-center gap-2 bg-orange-50 border border-orange-200 rounded-xl p-1">
                        <button
                          onClick={() => updateQuantity(food.id, -1)}
                          className="w-6 h-6 rounded flex items-center justify-center text-orange-700 hover:bg-orange-100"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-5 text-center text-xs font-bold text-orange-950 font-mono">
                          {qty}
                        </span>
                        <button
                          onClick={() => updateQuantity(food.id, 1)}
                          className="w-6 h-6 rounded flex items-center justify-center text-orange-700 hover:bg-orange-100"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          addToCart(food, restaurant);
                        }}
                        className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold shadow-xs transition flex items-center gap-1.5"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Reviews Tab */
        <div className="space-y-4">
          <div className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Guest Ratings & Feedback</h3>
              <p className="text-xs text-slate-500">Verified diners who ordered from {restaurant.name}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-3xl font-black text-slate-900 font-mono">{restaurant.rating}</span>
              <div>
                <div className="flex text-amber-400">
                  {'★'.repeat(Math.round(restaurant.rating))}
                </div>
                <p className="text-[11px] text-slate-400">{reviews.length} reviews</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {reviews.map((rev) => (
              <div key={rev.id} className="p-4 bg-white rounded-2xl border border-slate-100 shadow-2xs space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-700 font-bold flex items-center justify-center text-xs">
                      {rev.userName.charAt(0)}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">{rev.userName}</p>
                      <p className="text-[10px] text-slate-400">
                        {new Date(rev.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-amber-500 font-bold text-xs">
                    <Star className="w-3.5 h-3.5 fill-amber-500" />
                    <span>{rev.rating}</span>
                  </div>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{rev.comment}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Floating cart bar on mobile if items exist */}
      {items.length > 0 && (
        <div className="fixed bottom-4 left-4 right-4 md:hidden z-30">
          <button
            onClick={() => setIsCartOpen(true)}
            className="w-full py-3.5 px-4 bg-orange-500 text-white rounded-2xl shadow-xl font-bold text-xs flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4" />
              <span>{items.reduce((s, i) => s + i.quantity, 0)} items in basket</span>
            </div>
            <span>View Cart →</span>
          </button>
        </div>
      )}
    </div>
  );
};
