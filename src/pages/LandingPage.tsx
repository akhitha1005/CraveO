import React, { useState, useEffect } from 'react';
import { Search, MapPin, Clock, Star, ArrowRight, ShieldCheck, Sparkles, ChefHat, Bike, CheckCircle2, Utensils } from 'lucide-react';
import { Restaurant, FoodItem } from '../types';
import { useCart } from '../context/CartContext';

interface LandingPageProps {
  onNavigate: (view: string, param?: string) => void;
  onSelectRestaurant: (restaurantId: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate, onSelectRestaurant }) => {
  const { addToCart, setIsCartOpen } = useCart();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [popularFoods, setPopularFoods] = useState<FoodItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCuisine, setSelectedCuisine] = useState('All');

  useEffect(() => {
    fetch('/api/restaurants')
      .then((r) => r.json())
      .then((data) => setRestaurants(data.restaurants || []))
      .catch((e) => console.error(e));

    fetch('/api/food-items')
      .then((r) => r.json())
      .then((data) => {
        const items: FoodItem[] = data.foodItems || [];
        setPopularFoods(items.slice(0, 4));
      })
      .catch((e) => console.error(e));
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNavigate('restaurants', searchQuery);
  };

  const cuisines = ['All', 'Hyderabadi', 'North Indian', 'South Indian', 'Mughlai', 'Pure Veg'];

  const filteredRestaurants = restaurants.filter((r) => {
    if (selectedCuisine === 'All') return true;
    return r.cuisine.includes(selectedCuisine);
  });

  return (
    <div className="space-y-16 pb-20">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#FFFDF9] via-[#FFF9F0] to-[#FFFDF9] pt-8 pb-16 lg:py-20 border-b border-orange-100/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100/80 text-orange-800 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-orange-600" />
                <span>Good Food, Delivered Fresh · Royal Indian Cuisines · 25-35 Min Average</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#0F172A] tracking-tight leading-[1.12]">
                Your Favourite Food, <br className="hidden sm:inline" />
                <span className="text-orange-500">Delivered</span> to Your Doorstep.
              </h1>

              <p className="text-base sm:text-lg text-slate-600 max-w-xl leading-relaxed">
                Explore handpicked royal dum biryani spots, rich Punjabi curries with buttery tandoori naans, and crispy South Indian ghee roast dosas. Piping hot, fresh, and tracked in real-time.
              </p>

              {/* Search Bar */}
              <form onSubmit={handleSearchSubmit} className="max-w-xl pt-2">
                <div className="p-2 bg-white rounded-2xl shadow-xl shadow-orange-950/5 border border-orange-200/60 flex flex-col sm:flex-row gap-2">
                  <div className="flex-1 flex items-center px-3 gap-2 border-b sm:border-b-0 sm:border-r border-slate-100 py-1.5 sm:py-0">
                    <Search className="w-4 h-4 text-orange-500 shrink-0" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search dishes (e.g. Hyderabadi Dum Biryani, Butter Chicken, Masala Dosa)..."
                      className="w-full text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-orange-500/25 transition flex items-center justify-center gap-2 shrink-0"
                  >
                    <span>Find Food</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>

              {/* Action Buttons & Quick Trust Badges */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  onClick={() => onNavigate('restaurants')}
                  className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs sm:text-sm font-bold transition shadow-xs flex items-center gap-2"
                >
                  <Utensils className="w-4 h-4" />
                  <span>Explore Restaurants</span>
                </button>
                <div className="flex items-center gap-3 text-xs text-slate-600">
                  <span className="flex items-center gap-1 font-semibold text-slate-800">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" /> 100% Contactless
                  </span>
                  <span>·</span>
                  <span className="flex items-center gap-1 font-semibold text-slate-800">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Live Kitchen Updates
                  </span>
                </div>
              </div>
            </div>

            {/* Right Hero Image Card */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-slate-100 aspect-4/3 lg:aspect-auto lg:h-[460px]">
                <img
                  src="/src/assets/images/craveo_indian_feast_hero_1794476290274.jpg"
                  alt="Delicious Indian royal thali feast"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-6">
                  <div className="bg-white/95 backdrop-blur-md rounded-2xl p-4 w-full shadow-lg border border-white/50 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-bold text-orange-600 uppercase tracking-wider">Today's Trending</p>
                      <h4 className="text-sm font-extrabold text-slate-900">Royal Dum Biryani & Makhani Thalis</h4>
                      <p className="text-xs text-slate-500 mt-0.5">Over 3,500 meals delivered fresh today across cities</p>
                    </div>
                    <button
                      onClick={() => onNavigate('restaurants')}
                      className="px-3 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold transition shadow-xs shrink-0"
                    >
                      Order Now
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. FEATURED RESTAURANTS (Note: Simple 4-Step Process removed as requested) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-orange-600">Curated Indian Kitchens</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Featured Restaurants</h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">Verified partner restaurants serving authentic regional flavors.</p>
          </div>

          {/* Cuisine filter buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 sm:pb-0">
            {cuisines.map((c) => (
              <button
                key={c}
                onClick={() => setSelectedCuisine(c)}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl transition whitespace-nowrap ${
                  selectedCuisine === c
                    ? 'bg-orange-500 text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:border-orange-200'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredRestaurants.map((rest) => (
            <div
              key={rest.id}
              onClick={() => onSelectRestaurant(rest.id)}
              className="group bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition duration-200 cursor-pointer flex flex-col"
            >
              <div className="relative aspect-4/3 bg-slate-100 overflow-hidden">
                <img
                  src={rest.image}
                  alt={rest.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                />
                <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-xs px-2 py-1 rounded-lg text-xs font-bold text-slate-900 flex items-center gap-1 shadow-xs">
                  <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  <span>{rest.rating}</span>
                </div>
                <div className="absolute bottom-3 left-3 bg-slate-900/80 backdrop-blur-xs px-2.5 py-1 rounded-lg text-[11px] font-semibold text-white flex items-center gap-1">
                  <Clock className="w-3 h-3 text-orange-400" />
                  <span>{rest.deliveryTime}</span>
                </div>
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-orange-600 transition">
                    {rest.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                    {rest.tagline}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span className="font-medium text-slate-700">{rest.cuisine.join(' · ')}</span>
                  <span className="font-semibold text-orange-600 font-mono">₹{rest.deliveryFee} delivery</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center pt-4">
          <button
            onClick={() => onNavigate('restaurants')}
            className="px-6 py-2.5 text-xs font-bold text-orange-600 hover:text-white bg-orange-50 hover:bg-orange-500 rounded-xl transition border border-orange-200"
          >
            View All Partner Kitchens →
          </button>
        </div>
      </section>

      {/* 3. POPULAR FOOD ITEMS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-orange-600">Crowd Favorites</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Popular Indian Delicacies</h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">Directly order crave-worthy dishes loved by foodies.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {popularFoods.map((food) => {
            const parentRest = restaurants.find((r) => r.id === food.restaurantId) || restaurants[0];
            return (
              <div
                key={food.id}
                className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  <div className="relative aspect-4/3 bg-slate-100 overflow-hidden">
                    <img
                      src={food.image}
                      alt={food.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2.5 left-2.5">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs ${
                          food.isVeg
                            ? 'bg-emerald-600 text-white'
                            : 'bg-red-600 text-white'
                        }`}
                      >
                        {food.isVeg ? 'Veg' : 'Non-Veg'}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 space-y-1">
                    <p className="text-[10px] font-bold text-orange-600 uppercase tracking-wider">
                      {food.category}
                    </p>
                    <h4 className="text-sm font-bold text-slate-900">{food.name}</h4>
                    <p className="text-xs text-slate-500 line-clamp-2">{food.description}</p>
                  </div>
                </div>

                <div className="p-4 pt-0 flex items-center justify-between">
                  <span className="text-base font-extrabold text-slate-900 font-mono">
                    ₹{food.price}
                  </span>
                  <button
                    onClick={() => {
                      if (parentRest) {
                        addToCart(food, parentRest);
                        setIsCartOpen(true);
                      }
                    }}
                    className="px-3.5 py-1.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold shadow-xs transition"
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. ABOUT US / VALUE PROPOSITION */}
      <section id="about-us" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#0F172A] rounded-3xl p-8 sm:p-12 text-white relative overflow-hidden">
          <div className="max-w-2xl space-y-4 relative z-10">
            <span className="text-xs font-bold text-orange-400 uppercase tracking-widest">About CraveO India</span>
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              Delivering royal taste & authentic culinary heritage.
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              CraveO connects diners with legendary biryani houses, tandoor artisans, and tiffin centers across India. With heated insulated delivery bags, zero deceptive markups, and strict hygiene protocols, your food arrives steaming hot and full of aroma.
            </p>
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-800 text-left">
              <div>
                <p className="text-2xl font-black text-orange-400 font-mono">100%</p>
                <p className="text-[11px] text-slate-400">Fresh Dum Sealed</p>
              </div>
              <div>
                <p className="text-2xl font-black text-orange-400 font-mono">24 Min</p>
                <p className="text-[11px] text-slate-400">Average Transit Time</p>
              </div>
              <div>
                <p className="text-2xl font-black text-orange-400 font-mono">4.9 ★</p>
                <p className="text-[11px] text-slate-400">Foodie Rating</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
