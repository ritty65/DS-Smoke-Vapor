import React, { useState, useEffect } from 'react';
import { MapPin, Clock, Phone, MessageSquare, Send, ChevronDown } from 'lucide-react';

export const LocationPage = () => {
  const [openIndex, setOpenIndex] = useState(0);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const faqs = [
    { q: "Do you verify ID?", a: "Yes. We strictly adhere to federal and state laws. You must be 21+ with a valid government-issued ID to purchase anything in the store." },
    { q: "What is your return policy?", a: "Due to the nature of our products, all sales on consumables (e-liquid, disposables) are final. Hardware may have a limited warranty depending on the manufacturer." },
    { q: "Do you have parking?", a: "Absolutely! We have plenty of free parking right in front of the shop at our Old Spanish Trail location." },
    { q: "Do you sell Delta-8/THC-A?", a: "Yes, we carry a wide selection of lab-tested hemp-derived products compliant with local regulations." }
  ];

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-16">
           <h1 className="text-4xl md:text-6xl font-black brand-font mb-4 text-white">LOCATION & ABOUT</h1>
           <div className="h-1 w-24 bg-green-500 mx-auto rounded-full shadow-[0_0_10px_#22c55e]"></div>
        </div>

        {/* Location Card */}
        <div className="glass-panel rounded-3xl overflow-hidden flex flex-col lg:flex-row shadow-[0_0_50px_rgba(191,0,255,0.1)] border border-purple-500/20 mb-20">
          <div className="p-8 md:p-12 lg:w-1/2 flex flex-col">
            <h2 className="text-3xl font-black brand-font mb-2 text-white">VISIT <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-green-400">DS SMOKE</span></h2>
            <p className="text-gray-400 mb-8">Stop by and see why we're Houston's #1 rated smoke shop.</p>
            
            <div className="space-y-8 mb-10">
              <div className="flex items-start gap-4 group">
                <div className="bg-purple-600/20 p-4 rounded-xl text-purple-400 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                  <MapPin size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-lg mb-1 text-white">The Spot</h4>
                  <p className="text-gray-300">3929 Old Spanish Trl STE #90</p>
                  <p className="text-gray-300">Houston, TX 77021</p>
                  <a href="https://maps.google.com/?q=3929+Old+Spanish+Trail+STE+90,+Houston,+TX+77021" target="_blank" className="text-sm text-green-400 mt-2 inline-block hover:underline">Open in Maps</a>
                </div>
              </div>

              <div className="flex items-start gap-4 group">
                <div className="bg-pink-600/20 p-4 rounded-xl text-pink-400 group-hover:bg-pink-600 group-hover:text-white transition-colors">
                  <Clock size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-lg mb-1 text-white">Hours</h4>
                  <div className="grid grid-cols-2 gap-x-8 text-gray-300 text-sm">
                    <span className="text-gray-400">Mon - Thu</span><span>10:00 AM - 10:00 PM</span>
                    <span className="text-gray-400">Fri - Sat</span><span className="text-green-400 font-bold">10:00 AM - 11:00 PM</span>
                    <span className="text-gray-400">Sun</span><span>11:00 AM - 9:00 PM</span>
                  </div>
                </div>
              </div>
              
               <div className="flex items-start gap-4 group">
                <div className="bg-blue-600/20 p-4 rounded-xl text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <Phone size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-lg mb-1 text-white">Call Us</h4>
                  <a href="tel:+15551234567" className="text-gray-300 hover:text-white transition-colors">(555) 123-4567</a>
                </div>
              </div>
            </div>

            <div className="mt-auto bg-white/5 p-6 rounded-xl border border-white/10">
              <h4 className="font-bold mb-4 flex items-center gap-2"><MessageSquare size={18} /> Quick Question?</h4>
              <p className="text-sm text-gray-400 mb-3">Online questions are coming soon. For now, please call or stop by and we’ll help right away.</p>
              <div className="flex gap-2 opacity-60">
                <input type="text" placeholder="Email capture coming soon" className="flex-1 bg-black/50 border border-white/20 rounded-lg px-4 py-2 text-sm cursor-not-allowed" disabled />
                <button className="bg-purple-600 text-white p-2 rounded-lg cursor-not-allowed" aria-label="Send quick question (coming soon)" disabled>
                  <Send size={18} />
                </button>
              </div>
            </div>
          </div>

          <div className="lg:w-1/2 h-96 lg:h-auto relative">
            <iframe 
              title="DS Smoke & Vapor location map"
              width="100%" height="100%" 
              style={{border:0, filter: 'invert(90%) hue-rotate(180deg) contrast(120%)'}} 
              loading="lazy" allowFullScreen
              src="https://maps.google.com/maps?q=3929%20Old%20Spanish%20Trail%20STE%2090%2C%20Houston%2C%20TX%2077021&t=m&z=15&output=embed&iwloc=near"
            ></iframe>
            <div className="absolute inset-0 pointer-events-none bg-purple-900/30 mix-blend-overlay"></div>
            <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-black to-transparent pointer-events-none"></div>
          </div>
        </div>

        {/* About Section */}
        <div className="flex flex-col md:flex-row gap-12 items-center mb-20">
           <div className="md:w-1/2">
             <h2 className="text-3xl md:text-5xl font-black brand-font mb-6 leading-tight">MORE THAN JUST A <span className="text-purple-500">SMOKE SHOP</span></h2>
             <div className="space-y-6 text-gray-400 leading-relaxed">
               <p>Established in 2023, DS Smoke & Vapor was born from a simple idea: Houston deserves a smoke shop that feels like a destination, not just a convenience store.</p>
               <p>We curated a space where culture meets quality. Whether you're a glass connoisseur looking for American-made functional art, or just need a reliable vape for the weekend, we treat every customer like family.</p>
             </div>
           </div>
           <div className="md:w-1/2 relative h-64 w-full rounded-3xl overflow-hidden glass-panel border border-white/10 group">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-black to-green-900 opacity-60"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                 <h3 className="text-4xl md:text-6xl font-black text-white/10 transform -rotate-12 select-none">THE CULTURE</h3>
              </div>
           </div>
        </div>

        {/* FAQ */}
        <div className="max-w-3xl mx-auto">
           <h2 className="text-3xl font-black brand-font mb-10 text-center">FAQ</h2>
           <div className="space-y-4">
             {faqs.map((faq, i) => (
               <div key={i} className="glass-panel rounded-xl overflow-hidden">
                 <button onClick={() => setOpenIndex(openIndex === i ? null : i)} className="w-full flex justify-between items-center p-6 text-left hover:bg-white/5 transition-colors">
                   <span className="font-bold text-lg">{faq.q}</span>
                   <ChevronDown className={`transform transition-transform ${openIndex === i ? 'rotate-180 text-purple-400' : 'text-gray-500'}`} />
                 </button>
                 <div className={`overflow-hidden transition-all duration-300 ${openIndex === i ? 'max-h-48' : 'max-h-0'}`}>
                   <div className="p-6 pt-0 text-gray-400 border-t border-white/5">{faq.a}</div>
                 </div>
               </div>
             ))}
           </div>
        </div>

      </div>
    </div>
  );
};
