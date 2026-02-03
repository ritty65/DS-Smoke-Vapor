export const INVENTORY = {
  "Vapes": [
    { name: "GeekBar Pulse 15k", brand: "GeekBar", price: "$24.99", flavor: "F**king Fab", tag: "Best Seller" },
    { name: "Lost Mary MT15000", brand: "Lost Mary", price: "$23.99", flavor: "Nana Coconut", tag: "New" },
    { name: "Raz TN9000", brand: "Raz", price: "$21.99", flavor: "Dragon Fruit", tag: "Hot" },
    { name: "North 12000", brand: "North", price: "$19.99", flavor: "Cactus Jack", tag: "" },
    { name: "Tyson 2.0 Iron Mike", brand: "Tyson", price: "$22.99", flavor: "Frozen Grape", tag: "" },
    { name: "Fifty Bar", brand: "Fifty", price: "$18.99", flavor: "Milky Loops", tag: "USA Made" },
    { name: "GeekBar Pulse X", brand: "GeekBar", price: "$25.99", flavor: "Sour Apple", tag: "New" },
    { name: "Elf Bar BC5000", brand: "Elf Bar", price: "$16.99", flavor: "Watermelon Ice", tag: "Classic" },
  ],
  "Glass": [
    { name: "Gravity Infuser", brand: "Stündenglass", price: "$599.00", flavor: "Black", tag: "Premium" },
    { name: "Beaker Bong 12\"", brand: "Medicali", price: "$149.99", flavor: "Clear", tag: "Classic" },
    { name: "Peak Pro", brand: "Puffco", price: "$420.00", flavor: "Pearl", tag: "Tech" },
    { name: "Carta 2", brand: "Focus V", price: "$350.00", flavor: "Midnight", tag: "" },
    { name: "Hammer Bubbler", brand: "Grav", price: "$44.99", flavor: "Smoke", tag: "" },
    { name: "Mini Rig", brand: "MJ Arsenal", price: "$69.99", flavor: "Claude", tag: "" },
    { name: "Straight Tube", brand: "Roor", price: "$320.00", flavor: "18 inch", tag: "German Glass" },
    { name: "Ash Catcher", brand: "Pulsar", price: "$35.00", flavor: "14mm 45deg", tag: "" },
  ],
  "THC-A / Delta": [
    { name: "Haymaker Blend", brand: "Torch", price: "$34.99", flavor: "3.5g Disposable", tag: "Potent" },
    { name: "Wreck'd Gummies", brand: "Looper", price: "$29.99", flavor: "Sour Belts", tag: "Edible" },
    { name: "Liquid Badder", brand: "Urb", price: "$32.99", flavor: "Funky Monkey", tag: "" },
    { name: "Snowballs", brand: "ElfTHC", price: "$45.99", flavor: "3.5g Flower", tag: "Top Shelf" },
    { name: "Adios Blend", brand: "Exodus", price: "$39.99", flavor: "7g Disposable", tag: "Huge" },
    { name: "Mushroom Gummies", brand: "Tre House", price: "$24.99", flavor: "Magic Mango", tag: "Nootropic" },
    { name: "Pre-Rolls 5pk", brand: "Cutleaf", price: "$25.99", flavor: "Gelato", tag: "" },
    { name: "Delta 9 Syrup", brand: "Enjoy", price: "$19.99", flavor: "Blue Razz", tag: "Liquid" },
  ],
  "Accessories": [
    { name: "Classic Papers", brand: "Raw", price: "$2.99", flavor: "King Size", tag: "Essential" },
    { name: "Grinder 63mm", brand: "Santa Cruz", price: "$24.99", flavor: "Purple", tag: "Durable" },
    { name: "Butane Torch", brand: "Blazer", price: "$59.99", flavor: "Big Shot", tag: "Tools" },
    { name: "Rolling Tray", brand: "Cookies", price: "$14.99", flavor: "Red V2", tag: "" },
    { name: "Odor Spray", brand: "Ozium", price: "$6.99", flavor: "Original", tag: "" },
    { name: "Quartz Banger", brand: "Bear Quartz", price: "$29.99", flavor: "14mm Male", tag: "" },
    { name: "Iso Stations", brand: "Glob Mops", price: "$15.99", flavor: "Cotton Swabs", tag: "Cleaning" },
    { name: "Lighter Leash", brand: "Generic", price: "$3.99", flavor: "Black", tag: "Handy" },
  ]
};

export const PRICE_RANGES = [
  { label: "Under $20", min: 0, max: 20 },
  { label: "$20 - $50", min: 20, max: 50 },
  { label: "$50 - $100", min: 50, max: 100 },
  { label: "$100+", min: 100, max: Infinity }
];

export const parsePrice = (priceStr) => parseFloat(priceStr.replace(/[^0-9.]/g, ''));
