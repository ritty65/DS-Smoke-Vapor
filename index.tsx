import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { Navbar, Footer, AgeGate, AnnouncementBar, CartDrawer } from './components';
import { HomePage } from './pages/Home';
import { ShopPage } from './pages/Shop';
import { LocationPage } from './pages/Location';

const App = () => {
  const [isAgeVerified, setIsAgeVerified] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  // Routing state: 'home', 'shop', 'location'
  const [currentRoute, setCurrentRoute] = useState('home');

  useEffect(() => {
    const verified = localStorage.getItem('age-verified');
    if (verified === 'true') {
      setIsAgeVerified(true);
    }
  }, []);

  const handleVerification = () => {
    localStorage.setItem('age-verified', 'true');
    setIsAgeVerified(true);
  };

  const addToCart = (product) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.name === product.name);
      if (existing) {
        return prev.map(item => item.name === product.name ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productName) => {
    setCartItems(prev => prev.filter(item => item.name !== productName));
  };

  const updateQuantity = (productName, change) => {
    setCartItems(prev => prev.map(item => {
      if (item.name === productName) {
        const newQty = item.quantity + change;
        return newQty > 0 ? { ...item, quantity: newQty } : item;
      }
      return item;
    }));
  };

  if (!isAgeVerified) {
    return <AgeGate onVerify={handleVerification} />;
  }

  // Page Routing Logic
  const renderPage = () => {
    switch (currentRoute) {
      case 'shop':
        return <ShopPage onAddToCart={addToCart} />;
      case 'location':
        return <LocationPage />;
      case 'home':
      default:
        return <HomePage onNavigate={setCurrentRoute} onAddToCart={addToCart} />;
    }
  };

  return (
    <div className="min-h-screen relative bg-[#050505] text-white selection:bg-purple-500 selection:text-white flex flex-col">
      
      {/* Film Grain Texture Overlay */}
      <div className="bg-noise"></div>

      {/* Background Smoke Animation */}
      <div className="fog-container fixed inset-0 z-0 pointer-events-none">
        <div className="fog-img"></div>
        <div className="fog-img-2"></div>
      </div>

      <div className="relative z-10 flex-1 flex flex-col">
        <AnnouncementBar />
        <Navbar 
          cartCount={cartItems.reduce((acc, item) => acc + item.quantity, 0)} 
          onToggleCart={() => setCartOpen(!cartOpen)}
          currentRoute={currentRoute}
          onNavigate={setCurrentRoute}
        />
        
        {/* Main Content Area */}
        <main className="flex-1">
          {renderPage()}
        </main>

        <Footer />
      </div>

      {/* Cart Drawer */}
      <CartDrawer 
        isOpen={cartOpen} 
        onClose={() => setCartOpen(false)} 
        cartItems={cartItems} 
        onRemove={removeFromCart}
        onUpdateQty={updateQuantity}
      />
    </div>
  );
};

const root = createRoot(document.getElementById('root'));
root.render(<App />);