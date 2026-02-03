import React, { useState, useEffect, useRef } from 'react';
import { ShoppingBag, X, Menu, ShieldCheck, ShoppingCart, Trash2, Minus, Plus, Instagram, Heart, Share2 } from 'lucide-react';
import { parsePrice } from './data';

const getFocusableElements = (container) => {
  if (!container) return [];
  return Array.from(
    container.querySelectorAll(
      'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
    )
  ).filter((element) => !element.hasAttribute('disabled') && !element.getAttribute('aria-hidden'));
};

// --- Navbar ---
export const Navbar = ({ cartCount, onToggleCart, currentRoute, onNavigate }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const NavLink = ({ route, children }) => (
    <button 
      onClick={() => { onNavigate(route); setMobileMenuOpen(false); }} 
      className={`cursor-pointer px-3 py-2 rounded-md text-sm font-bold transition-colors uppercase tracking-wider ${currentRoute === route ? 'text-green-400 bg-white/5' : 'text-gray-300 hover:text-green-400'}`}
    >
      {children}
    </button>
  );

  return (
    <nav className="sticky top-0 w-full z-40 border-b border-white/10 glass-panel backdrop-blur-md bg-black/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex-shrink-0 cursor-pointer group flex items-center gap-3" onClick={() => onNavigate('home')}>
            {/* Logo Image - ensure ds_logo.png is in your public folder */}
            <img 
              src="/ds_logo.png" 
              alt="DS Smoke" 
              className="h-12 w-12 rounded-full object-contain shadow-[0_0_10px_rgba(147,51,234,0.3)] group-hover:shadow-[0_0_20px_rgba(34,197,94,0.5)] transition-all duration-300 border border-white/10"
            />
            <span className="text-2xl font-black brand-font text-white tracking-widest group-hover:neon-text transition-all duration-300 hidden sm:block">
              DS <span className="text-purple-500">SMOKE</span>
            </span>
          </div>
          
          {/* Desktop Menu */}
          <div className="hidden md:flex items-center">
            <div className="ml-10 flex items-baseline space-x-8">
              <NavLink route="home">Home</NavLink>
              <NavLink route="shop">Shop Menu</NavLink>
              <NavLink route="location">Location & About</NavLink>
            </div>
            <div className="ml-8 flex items-center gap-4">
               <button 
                onClick={onToggleCart}
                className="relative p-2 text-gray-300 hover:text-green-400 transition-colors"
               >
                  <ShoppingBag size={24} />
                  {cartCount > 0 && (
                    <span className="absolute top-0 right-0 bg-purple-600 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border border-black animate-bounce">
                      {cartCount}
                    </span>
                  )}
               </button>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-4">
            <button 
               onClick={onToggleCart}
               className="relative p-2 text-gray-300"
            >
                <ShoppingBag size={24} />
                {cartCount > 0 && (
                  <span className="absolute top-0 right-0 bg-purple-600 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border border-black">
                    {cartCount}
                  </span>
                )}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-gray-300 hover:text-white p-2"
            >
              {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden glass-panel border-b border-white/10 absolute w-full bg-black/95">
          <div className="px-4 pt-2 pb-6 space-y-2 flex flex-col items-center">
            <NavLink route="home">Home</NavLink>
            <NavLink route="shop">Shop Menu</NavLink>
            <NavLink route="location">Location</NavLink>
          </div>
        </div>
      )}
    </nav>
  );
};

// --- Footer ---
export const Footer = () => (
  <footer id="contact" className="border-t border-white/10 bg-[#020202] py-16">
    <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-8">
      <div className="text-center md:text-left">
        <div className="flex flex-col md:flex-row items-center gap-4 mb-4 justify-center md:justify-start">
            <img 
              src="/ds_logo.png" 
              alt="DS Smoke Logo" 
              className="h-16 w-16 rounded-full border border-white/10 shadow-[0_0_20px_rgba(147,51,234,0.2)]"
            />
            <h2 className="text-3xl font-black brand-font text-white tracking-widest">DS SMOKE</h2>
        </div>
        <p className="text-gray-500 text-sm max-w-xs mx-auto md:mx-0">
          Premium Smoke & Vapor Shop in Houston, TX. <br/>
          Elevating the culture since 2023.
        </p>
      </div>
      
      <div className="flex gap-6">
        <SocialLink icon={<Instagram />} />
        <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-gray-500 hover:bg-blue-600 hover:text-white transition-all cursor-pointer">
           <i className="fab fa-facebook-f text-xl"></i>
        </div>
        <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-gray-500 hover:bg-black hover:text-white transition-all cursor-pointer">
           <i className="fab fa-tiktok text-xl"></i>
        </div>
      </div>
    </div>
    <div className="max-w-7xl mx-auto px-4 mt-12 pt-8 border-t border-white/5 text-center md:text-left flex flex-col md:flex-row justify-between text-xs text-gray-600">
      <p>© {new Date().getFullYear()} DS Smoke & Vapor. All rights reserved.</p>
      <p>Must be 21+ to purchase. Please enjoy responsibly.</p>
    </div>
  </footer>
);

const SocialLink = ({ icon }) => (
  <a href="#" className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:bg-purple-600 hover:text-white hover:scale-110 transition-all duration-300">
    {icon}
  </a>
);

// --- Cart Drawer ---
export const CartDrawer = ({ isOpen, onClose, cartItems, onRemove, onUpdateQty }) => {
  const subtotal = cartItems.reduce((acc, item) => acc + (parsePrice(item.price) * item.quantity), 0);
  const drawerRef = useRef(null);
  const previouslyFocusedRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    previouslyFocusedRef.current = document.activeElement;
    const focusables = getFocusableElements(drawerRef.current);
    requestAnimationFrame(() => {
      focusables[0]?.focus();
    });

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== 'Tab') return;

      const container = drawerRef.current;
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
  }, [isOpen, onClose]);

  return (
    <>
      <div 
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />
      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label="Shopping cart"
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-[#0a0a0a] border-l border-white/10 shadow-2xl z-50 transform transition-transform duration-300 ease-out flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-purple-900/10">
          <h2 className="text-2xl font-black brand-font flex items-center gap-2">
            YOUR STASH <ShoppingBag className="text-purple-500" />
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {cartItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center text-gray-500">
              <ShoppingCart size={64} className="mb-4 opacity-20" />
              <h3 className="text-xl font-bold text-gray-300 mb-2">Your stash is empty</h3>
              <p className="text-sm">Time to load up on some fire supplies.</p>
              <button onClick={onClose} className="mt-6 text-purple-400 font-bold hover:text-white transition-colors">
                Start Shopping
              </button>
            </div>
          ) : (
            cartItems.map((item, idx) => (
              <div key={idx} className="flex gap-4 bg-white/5 p-4 rounded-xl border border-white/5 animate-in slide-in-from-right-4 duration-300 fill-mode-backwards" style={{animationDelay: `${idx * 50}ms`}}>
                <div className="w-20 h-20 bg-black/40 rounded-lg flex items-center justify-center text-3xl flex-shrink-0">
                  📦
                </div>
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start">
                      <h4 className="font-bold text-sm line-clamp-1">{item.name}</h4>
                      <button onClick={() => onRemove(item.name)} className="text-gray-500 hover:text-red-500 transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <p className="text-xs text-gray-400">{item.brand}</p>
                  </div>
                  <div className="flex justify-between items-end">
                    <p className="font-mono text-green-400 font-bold">{item.price}</p>
                    <div className="flex items-center gap-3 bg-black/40 rounded-lg p-1">
                      <button 
                        onClick={() => onUpdateQty(item.name, -1)}
                        className="p-1 hover:bg-white/10 rounded-md text-gray-400 hover:text-white disabled:opacity-30"
                        disabled={item.quantity <= 1}
                      >
                        <Minus size={14} />
                      </button>
                      <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                      <button 
                         onClick={() => onUpdateQty(item.name, 1)}
                         className="p-1 hover:bg-white/10 rounded-md text-gray-400 hover:text-white"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        {cartItems.length > 0 && (
          <div className="p-6 border-t border-white/10 bg-black/40">
            <div className="flex justify-between items-center mb-6">
              <span className="text-gray-400">Subtotal</span>
              <span className="text-2xl font-mono font-bold text-white">${subtotal.toFixed(2)}</span>
            </div>
            <button 
              className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl font-bold text-black text-lg hover:shadow-[0_0_20px_rgba(34,197,94,0.4)] transition-all active:scale-[0.98]"
              onClick={() => alert("Checkout initiated! (Demo Mode)")}
            >
              SECURE CHECKOUT
            </button>
            <p className="text-center text-[10px] text-gray-500 mt-4 uppercase tracking-widest">
              Secure Encrypted Transaction
            </p>
          </div>
        )}
      </div>
    </>
  );
};

// --- Age Gate ---
export const AgeGate = ({ onVerify }) => {
  const modalRef = useRef(null);
  const previouslyFocusedRef = useRef(null);
  const handleExit = () => {
    window.location.href = 'https://www.google.com';
  };

  useEffect(() => {
    previouslyFocusedRef.current = document.activeElement;
    const focusables = getFocusableElements(modalRef.current);
    requestAnimationFrame(() => {
      focusables[0]?.focus();
    });

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        handleExit();
        return;
      }

      if (event.key !== 'Tab') return;
      const container = modalRef.current;
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
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-95 backdrop-blur-md">
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-label="Age verification"
        className="max-w-md w-full p-8 rounded-2xl border border-purple-500/30 bg-gray-900/80 text-center shadow-[0_0_50px_rgba(191,0,255,0.3)] mx-4"
      >
        <div className="mb-6 flex justify-center">
          <ShieldCheck className="w-16 h-16 text-green-400 animate-pulse" />
        </div>
        <h2 className="text-3xl font-bold mb-2 brand-font text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-green-400">
          AGE VERIFICATION
        </h2>
        <p className="text-gray-400 mb-8 font-light">You must be 21 years or older to enter this site. Please verify your age.</p>
        
        <div className="flex flex-col gap-4">
          <button 
            onClick={onVerify}
            className="w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl font-bold text-white hover:scale-105 transition-transform duration-300 shadow-lg tracking-wider border border-purple-400/30 cursor-pointer"
          >
            I AM 21 OR OLDER
          </button>
          <button 
            onClick={handleExit}
            className="w-full py-4 bg-gray-800/50 hover:bg-gray-800 rounded-xl font-bold text-gray-400 transition-colors border border-gray-700 cursor-pointer"
          >
            EXIT
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Announcement Bar ---
export const AnnouncementBar = () => (
  <div className="bg-purple-900 overflow-hidden py-2 border-b border-purple-500/30 relative z-50">
    <div className="whitespace-nowrap flex animate-scroll">
      {[...Array(10)].map((_, i) => (
        <span key={i} className="mx-8 font-bold text-xs md:text-sm tracking-widest text-green-400">
          🔥 NEW STOCK EVERY FRIDAY • 20% OFF GLASSWARE THIS WEEK • DS SMOKE & VAPOR 🔥
        </span>
      ))}
    </div>
  </div>
);

// --- 3D Tilt Card ---
export const TiltCard = ({ children, className, onClick }) => {
  const cardRef = useRef(null);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateX = ((y - centerY) / centerY) * -10; 
    const rotateY = ((x - centerX) / centerX) * 10;

    setRotation({ x: rotateX, y: rotateY });
  };

  const handleMouseLeave = () => {
    setRotation({ x: 0, y: 0 });
    setIsHovered(false);
  };

  return (
    <div 
      className={`perspective-1000 ${className}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
    >
      <div 
        ref={cardRef}
        className="w-full h-full transition-transform duration-100 ease-linear preserve-3d relative overflow-hidden"
        style={{ 
          transform: isHovered 
            ? `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) scale(1.05)` 
            : 'rotateX(0deg) rotateY(0deg) scale(1)' 
        }}
      >
        {children}
        {/* Holographic Sheen on Hover */}
        <div 
          className="absolute inset-0 pointer-events-none holographic-sheen opacity-0 transition-opacity duration-300"
          style={{ opacity: isHovered ? 0.4 : 0, transform: `translateX(${-rotation.y * 5}%)` }}
        />
      </div>
    </div>
  );
};
