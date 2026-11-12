import React, { useState, useEffect } from 'react';
import { Search, Star, Clock, Filter, UtensilsCrossed, ArrowRight } from 'lucide-react';
import { Restaurant } from '../types';

interface RestaurantsPageProps {
  initialSearch?: string;
  onSelectRestaurant: (id: string) => void;
}

export const RestaurantsPage: React.FC<RestaurantsPageProps> = ({
  initialSearch = '',
  onSelectRestaurant,
}) => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [search, setSearch] = useState(initialSearch);
  const [cuisine, setCuisine] = useState('All');
  const [sortBy, setSortBy] = useState<'rating' | 'deliveryTime' | 'deliveryFee'>('rating');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/restaurants')
      .then((r) => r.json())
      .then((data) => {
        setRestaurants(data.restaurants || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const cuisines = ['All', 'Hyderabadi', 'North Indian', 'South Indian', 'Mughlai', 'Pure Veg'];

  const filtered = restaurants
    .filter((r) => {
      const matchesSearch =
        r.name.toLowerCase().includes(search.toLowerCase()) ||
        r.cuisine.some((c) => c.toLowerCase().includes(search.toLowerCase())) ||
        r.description.toLowerCase().includes(search.toLowerCase());
      const matchesCuisine = cuisine === 'All' || r.cuisine.includes(cuisine);
      return matchesSearch && matchesCuisine;
    })
    .sort((a, b) => {
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'deliveryFee') return a.deliveryFee - b.deliveryFee;
      return a.deliveryTime.localeCompare(b.deliveryTime);
    });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold text-slate-900">Explore Restaurants</h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Discover top artisan eateries and kitchens delivering straight to your location.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          {/* Search Input */}
          <div className="md:col-span-6 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by restaurant name, cuisine or food type..."
              className="w-full pl-10 pr-4 py-2 text-xs border border-slate-200 rounded-xl focus:border-orange-500 focus:outline-hidden"
            />
          </div>

          {/* Cuisine Pill Tabs */}
          <div className="md:col-span-4 flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            {cuisines.map((c) => (
              <button
                key={c}
                onClick={() => setCuisine(c)}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl transition whitespace-nowrap ${
                  cuisine === c
                    ? 'bg-orange-500 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          {/* Sort By Dropdown */}
          <div className="md:col-span-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-hidden focus:border-orange-500 bg-white"
            >
              <option value="rating">Top Rated (★)</option>
              <option value="deliveryFee">Lowest Delivery Fee</option>
              <option value="deliveryTime">Fastest Delivery</option>
            </select>
          </div>
        </div>
      </div>

      {/* Restaurant Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="h-64 rounded-2xl bg-slate-100 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-100 p-8 space-y-3">
          <UtensilsCrossed className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No restaurants match your filters</h3>
          <p className="text-xs text-slate-500">Try searching for "pizza", "burger", or switch cuisine to "All".</p>
          <button
            onClick={() => {
              setSearch('');
              setCuisine('All');
            }}
            className="px-4 py-2 bg-orange-500 text-white rounded-xl text-xs font-bold shadow-xs"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((rest) => (
            <div
              key={rest.id}
              onClick={() => onSelectRestaurant(rest.id)}
              className="group bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition duration-200 cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="relative aspect-16/10 bg-slate-100 overflow-hidden">
                  <img
                    src={rest.image}
                    alt={rest.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                  <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-xs px-2 py-1 rounded-lg text-xs font-bold text-slate-900 flex items-center gap-1 shadow-xs">
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    <span>{rest.rating}</span>
                    <span className="text-slate-400 font-normal">({rest.reviewCount})</span>
                  </div>
                  <div className="absolute bottom-3 left-3 bg-slate-900/80 backdrop-blur-xs px-2.5 py-1 rounded-lg text-[11px] font-semibold text-white flex items-center gap-1">
                    <Clock className="w-3 h-3 text-orange-400" />
                    <span>{rest.deliveryTime}</span>
                  </div>
                </div>

                <div className="p-5 space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-orange-600 transition">
                      {rest.name}
                    </h3>
                    <span className="text-xs font-bold text-slate-400">{rest.priceLevel}</span>
                  </div>
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {rest.description}
                  </p>
                </div>
              </div>

              <div className="p-5 pt-0">
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-600">{rest.cuisine.join(' · ')}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-orange-600 font-mono">
                      ₹{rest.deliveryFee} delivery
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-orange-500 group-hover:translate-x-1 transition" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
