import store from './data/store.json';

export const INVENTORY = store.inventory;

export const PRICE_RANGES = [
  { label: "Under $20", min: 0, max: 20 },
  { label: "$20 - $50", min: 20, max: 50 },
  { label: "$50 - $100", min: 50, max: 100 },
  { label: "$100+", min: 100, max: Infinity }
];

export const formatPrice = (price) => `$${price.toFixed(2)}`;
