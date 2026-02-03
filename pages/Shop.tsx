import React, { useState, useEffect, useRef } from 'react';
import { Search, Filter, CheckCircle, Plus, X, Star } from 'lucide-react';
import { INVENTORY, PRICE_RANGES, parsePrice } from '../data';

const getFocusableElements = (container) => {
  if (!container) return [];
  return Array.from(
    container.querySelectorAll(
      'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
    )
  ).filter((element) => !element.hasAttribute('disabled') && !element.getAttribute('aria-hidden'));
};

export const ShopPage = ({ onAddToCart }) => {
  const [activeCategory, setActiveCategory] = useState("Vapes");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("All");
  const [selectedPriceRange, setSelectedPriceRange] = useState("All");
  const [showFilters, setShowFilters] = useState(false);
  const [addedItem, setAddedItem] = useState(null);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const quickViewRef = useRef(null);
  const previouslyFocusedRef = useRef(null);

  useEffect(() => {
    setSelectedBrand("All");
    setSelectedPriceRange("All");
    setSearchTerm("");
    window.scrollTo(0,0);
  }, [activeCategory]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (!quickViewProduct) return;

    previouslyFocusedRef.current = document.activeElement;
    const focusables = getFocusableElements(quickViewRef.current);
    requestAnimationFrame(() => {
      focusables[0]?.focus();
    });

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        setQuickViewProduct(null);
        return;
      }

      if (event.key !== 'Tab') return;
      const container = quickViewRef.current;
      if (!container) return;
      const elements = getFocusableElements(container);
      if (elements.length === 0) return;

      const first = elements[0];
      const last = elements[elements.length - 1];
      const active = document.activeElement;

      if (event.shiftKey) {
        if (active === first || !container.contains(active)) {
          event.preventDefault();
          last.focus();
        }
      } else if (active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      if (previouslyFocusedRef.current instanceof HTMLElement) {
        previouslyFocusedRef.current.focus();
      }
    };
  }, [quickViewProduct]);

  const handleAdd = (item) => {
    onAddToCart(item);
    setAddedItem(item.name);
    setTimeout(() => setAddedItem(null), 1500);
  };

  const categoryItems = INVENTORY[activeCategory as keyof typeof INVENTORY];
  const brands = ["All", ...new Set(categoryItems.map(item => item.brand))];
  const filteredItems = categoryItems.filter(item => {
    const price = parsePrice(item.price);
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || item.brand.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesBrand = selectedBrand === "All" || item.brand === selectedBrand;
    let matchesPrice = true;
    if (selectedPriceRange !== "All") {
      const range = PRICE_RANGES.find(r => r.label === selectedPriceRange);
      if (range) matchesPrice = price >= range.min && price < range.max;
    }
    return matchesSearch && matchesBrand && matchesPrice;
  });

  return (
    <div className="min-h-screen pt-10 pb-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 pt-10">
          <h1 className="text-4xl md:text-6xl font-black brand-font mb-4 text-white">THE MENU</h1>
          <p className="text-gray-400">Live Inventory • Updated Daily</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-64 flex-shrink-0">
             <div className="sticky top-24 space-y-2 overflow-x-auto flex lg:flex-col lg:overflow-visible pb-4 lg:pb-0 bg-black/40 p-4 rounded-xl border border-white/10 backdrop-blur-md">
                {(Object.keys(INVENTORY) as string[]).map(cat => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`flex-shrink-0 px-4 py-3 rounded-xl text-left font-bold transition-all duration-200 whitespace-nowrap w-full ${
                      activeCategory === cat 
                        ? "bg-purple-600 text-white shadow-[0_0_15px_rgba(147,51,234,0.5)]" 
                        : "text-gray-400 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
             </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
             <div className="bg-white/5 rounded-2xl p-4 border border-white/10 mb-8 backdrop-blur-md">
                <div className="flex flex-col md:flex-row gap-4">
                   <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={20} />
                      <input 
                        type="text" 
                        placeholder={`Search ${activeCategory}...`} 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-black/50 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-purple-500 transition-colors"
                      />
                   </div>
                   <button 
                      onClick={() => setShowFilters(!showFilters)} 
                      className={`p-3 rounded-xl border border-white/10 transition-colors flex items-center gap-2 justify-center ${showFilters ? 'bg-purple-600 text-white border-purple-500' : 'bg-black/50 hover:bg-white/10 text-gray-400'}`}
                    >
                      <Filter size={20} /> <span className="md:hidden">Filters</span>
                   </button>
                </div>
                
                {showFilters && (
                  <div className="mt-4 pt-4 border-t border-white/10 grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-top-2">
                     <div>
                       <label className="text-xs text-purple-400 font-bold uppercase tracking-wider mb-2 block">Brand</label>
                       <div className="flex flex-wrap gap-2">
                         {brands.map(brand => (
                           <button 
                              key={brand}
                              onClick={() => setSelectedBrand(brand)}
                              className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${selectedBrand === brand ? 'bg-white text-black border-white' : 'bg-transparent border-white/20 text-gray-400 hover:border-white/50 hover:text-white'}`}
                           >
                             {brand}
                           </button>
                         ))}
                       </div>
                     </div>
                     <div>
                       <label className="text-xs text-purple-400 font-bold uppercase tracking-wider mb-2 block">Price</label>
                       <div className="flex flex-wrap gap-2">
                          <button onClick={() => setSelectedPriceRange("All")} className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${selectedPriceRange === "All" ? 'bg-white text-black border-white' : 'bg-transparent border-white/20 text-gray-400 hover:border-white/50 hover:text-white'}`}>All</button>
                         {PRICE_RANGES.map(range => (
                           <button key={range.label} onClick={() => setSelectedPriceRange(range.label)} className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${selectedPriceRange === range.label ? 'bg-white text-black border-white' : 'bg-transparent border-white/20 text-gray-400 hover:border-white/50 hover:text-white'}`}>{range.label}</button>
                         ))}
                       </div>
                     </div>
                  </div>
                )}
             </div>

             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredItems.map((item, idx) => (
                  <div 
                    key={idx} 
                    className="bg-white/5 rounded-xl p-4 border border-white/5 hover:border-purple-500/50 transition-all group relative hover:bg-white/10 cursor-pointer"
                    onClick={() => setQuickViewProduct(item)}
                  >
                    {item.tag && <div className="absolute top-2 right-2 bg-green-500 text-black text-[10px] font-bold px-2 py-0.5 rounded-full">{item.tag.toUpperCase()}</div>}
                    <div className="mb-4 h-40 rounded-lg overflow-hidden bg-black/40 flex items-center justify-center">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={`${item.brand} ${item.name}`}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                          loading="lazy"
                        />
                      ) : (
                        <span className="text-4xl">📦</span>
                      )}
                    </div>
                    <div className="mb-2">
                      <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">{item.brand}</p>
                      <h3 className="font-bold text-lg leading-tight">{item.name}</h3>
                    </div>
                    <div className="bg-black/30 rounded-lg p-2 mb-3">
                      <p className="text-sm text-gray-300"><span className="text-purple-400">Spec:</span> {item.flavor}</p>
                    </div>
                    <div className="flex items-center justify-between mt-auto">
                      <span className="font-mono text-xl text-white font-bold">{item.price}</span>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAdd(item);
                        }}
                        className={`p-2 rounded-lg transition-all font-bold flex items-center gap-1 text-sm transform active:scale-95 ${addedItem === item.name ? "bg-green-500 text-black" : "bg-white text-black hover:bg-purple-500 hover:text-white"}`}
                      >
                         {addedItem === item.name ? <CheckCircle size={16} /> : <Plus size={16} />}
                         {addedItem === item.name ? "ADDED" : "ADD"}
                      </button>
                    </div>
                  </div>
                ))}
             </div>
             {filteredItems.length === 0 && (
                <div className="text-center py-20 text-gray-500">
                  <Filter size={48} className="mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-bold">No items found.</p>
                </div>
              )}
          </div>
        </div>
      </div>

      {/* Quick View Modal */}
      {quickViewProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setQuickViewProduct(null)}>
          <div
            ref={quickViewRef}
            role="dialog"
            aria-modal="true"
            aria-label="Quick view"
            className="bg-[#111] border border-white/10 rounded-2xl max-w-2xl w-full p-6 relative overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
             <button onClick={() => setQuickViewProduct(null)} className="absolute top-4 right-4 text-gray-400 hover:text-white"><X size={24}/></button>
             
             <div className="flex flex-col md:flex-row gap-8">
               <div className="w-full md:w-1/2 h-64 bg-white/5 rounded-xl flex items-center justify-center text-6xl relative overflow-hidden group">
                 <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                 {quickViewProduct.image ? (
                   <img
                     src={quickViewProduct.image}
                     alt={`${quickViewProduct.brand} ${quickViewProduct.name}`}
                     className="h-full w-full object-cover"
                   />
                 ) : (
                   <span>📦</span>
                 )}
               </div>
               
               <div className="flex-1 flex flex-col">
                 <div className="mb-auto">
                    <span className="text-purple-400 font-bold text-xs uppercase tracking-wider">{quickViewProduct.brand}</span>
                    <h2 className="text-3xl font-black brand-font mb-2">{quickViewProduct.name}</h2>
                    <div className="flex items-center gap-2 mb-4">
                      <div className="flex text-green-400"><Star size={14} fill="currentColor" /><Star size={14} fill="currentColor" /><Star size={14} fill="currentColor" /><Star size={14} fill="currentColor" /><Star size={14} fill="currentColor" /></div>
                      <span className="text-xs text-gray-500">(24 Reviews)</span>
                    </div>
                    <p className="text-gray-300 text-sm leading-relaxed mb-4">
                      Premium quality {quickViewProduct.brand} product featuring {quickViewProduct.flavor} flavor profile. 
                      One of our top selling items for a reason.
                    </p>
                    <div className="bg-white/5 p-3 rounded-lg mb-4">
                      <p className="text-sm font-bold text-white"><span className="text-gray-500 font-normal">Flavor Profile:</span> {quickViewProduct.flavor}</p>
                    </div>
                 </div>
                 
                 <div className="flex items-center gap-4 mt-4">
                   <span className="text-3xl font-mono font-bold text-white">{quickViewProduct.price}</span>
                   <button 
                      onClick={() => {
                        handleAdd(quickViewProduct);
                        setQuickViewProduct(null);
                      }}
                      className="flex-1 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-black font-bold rounded-xl hover:shadow-[0_0_20px_rgba(34,197,94,0.4)] transition-all transform hover:scale-[1.02]"
                   >
                     ADD TO CART
                   </button>
                 </div>
               </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};
