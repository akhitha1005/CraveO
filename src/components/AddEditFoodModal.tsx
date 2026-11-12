import React, { useState, useEffect } from 'react';
import { X, Plus, Save, Image as ImageIcon } from 'lucide-react';
import { FoodItem } from '../types';

interface AddEditFoodModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: Partial<FoodItem>) => Promise<void>;
  initialItem?: FoodItem | null;
  restaurantId: string;
}

const PRESET_FOOD_IMAGES = [
  { label: 'Dum Biryani', url: '/src/assets/images/craveo_hyderabadi_biryani_1794476288251.jpg' },
  { label: 'Butter Chicken', url: '/src/assets/images/craveo_butter_chicken_naan_1794476290926.jpg' },
  { label: 'Masala Dosa', url: '/src/assets/images/craveo_south_indian_dosa_1794476289298.jpg' },
  { label: 'Royal Thali Feast', url: '/src/assets/images/craveo_indian_feast_hero_1794476290274.jpg' },
];

export const AddEditFoodModal: React.FC<AddEditFoodModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialItem,
  restaurantId,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('North Indian');
  const [price, setPrice] = useState('280');
  const [isVeg, setIsVeg] = useState(false);
  const [isAvailable, setIsAvailable] = useState(true);
  const [image, setImage] = useState(PRESET_FOOD_IMAGES[0].url);
  const [customImageUrl, setCustomImageUrl] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (initialItem) {
      setName(initialItem.name);
      setDescription(initialItem.description);
      setCategory(initialItem.category);
      setPrice(initialItem.price.toString());
      setIsVeg(initialItem.isVeg);
      setIsAvailable(initialItem.isAvailable);
      setImage(initialItem.image);
    } else {
      setName('');
      setDescription('');
      setCategory('North Indian');
      setPrice('280');
      setIsVeg(false);
      setIsAvailable(true);
      setImage(PRESET_FOOD_IMAGES[0].url);
      setCustomImageUrl('');
    }
  }, [initialItem, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price) return;
    setSaving(true);
    try {
      await onSave({
        id: initialItem?.id,
        restaurantId,
        name,
        description,
        category,
        price: parseFloat(price),
        isVeg,
        isAvailable,
        image: customImageUrl || image,
      });
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95">
        <div className="p-6 bg-[#FFFDF9] border-b border-orange-100 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              {initialItem ? 'Edit Dish Details' : 'Add New Food Item'}
            </h3>
            <p className="text-xs text-slate-500">
              Update menu items, pricing, and dietary tags.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Dish Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Truffle Mushroom Risotto"
              className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:border-orange-500 focus:outline-hidden"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Category *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:border-orange-500 focus:outline-hidden bg-white"
              >
                <option value="Biryani">Biryani</option>
                <option value="North Indian">North Indian</option>
                <option value="South Indian">South Indian</option>
                <option value="Tandoor & Starters">Tandoor & Starters</option>
                <option value="Breads & Naan">Breads & Naan</option>
                <option value="Desserts">Desserts</option>
                <option value="Beverages">Beverages</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Price (₹ INR) *</label>
              <input
                type="number"
                step="1"
                min="10"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="280"
                className="w-full px-3 py-2 text-xs font-mono border border-slate-200 rounded-xl focus:border-orange-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Description</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe flavors, key ingredients, and spices..."
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:border-orange-500 focus:outline-hidden"
            />
          </div>

          {/* Dietary & Availability Toggles */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200/60">
              <input
                type="checkbox"
                id="isVegCheckbox"
                checked={isVeg}
                onChange={(e) => setIsVeg(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
              />
              <label htmlFor="isVegCheckbox" className="text-xs font-semibold text-slate-800 cursor-pointer">
                Vegetarian Dish
              </label>
            </div>

            <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200/60">
              <input
                type="checkbox"
                id="isAvailableCheckbox"
                checked={isAvailable}
                onChange={(e) => setIsAvailable(e.target.checked)}
                className="w-4 h-4 text-orange-600 rounded border-slate-300 focus:ring-orange-500"
              />
              <label htmlFor="isAvailableCheckbox" className="text-xs font-semibold text-slate-800 cursor-pointer">
                In Stock & Available
              </label>
            </div>
          </div>

          {/* Image Selection */}
          <div className="space-y-2 pt-2">
            <label className="text-xs font-semibold text-slate-700 block">Food Photography Image</label>
            <div className="grid grid-cols-4 gap-2">
              {PRESET_FOOD_IMAGES.map((preset) => (
                <button
                  type="button"
                  key={preset.label}
                  onClick={() => {
                    setImage(preset.url);
                    setCustomImageUrl('');
                  }}
                  className={`relative rounded-xl overflow-hidden border-2 transition aspect-4/3 ${
                    image === preset.url && !customImageUrl
                      ? 'border-orange-500 ring-2 ring-orange-200'
                      : 'border-slate-200 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img
                    src={preset.url}
                    alt={preset.label}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-black/60 text-white text-[9px] py-0.5 text-center truncate px-1">
                    {preset.label}
                  </div>
                </button>
              ))}
            </div>

            <div className="pt-2">
              <div className="relative">
                <ImageIcon className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="url"
                  value={customImageUrl}
                  onChange={(e) => setCustomImageUrl(e.target.value)}
                  placeholder="Or enter custom food image URL..."
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:border-orange-500 focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-2.5 text-xs font-bold text-white bg-orange-500 hover:bg-orange-600 rounded-xl shadow-xs transition flex items-center justify-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : initialItem ? 'Save Changes' : 'Add Dish'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
