// ─── U-Shop Shared Constants ─────────────────────────────────────

// Tech product categories
export const CATEGORIES = [
  { name: 'Laptops', slug: 'laptops' },
  { name: 'Phones', slug: 'phones' },
  { name: 'Tablets', slug: 'tablets' },
  { name: 'Accessories', slug: 'accessories' },
  { name: 'Components', slug: 'components' },
  { name: 'Networking', slug: 'networking' },
  { name: 'Storage', slug: 'storage' },
  { name: 'Audio', slug: 'audio' },
  { name: 'Gaming', slug: 'gaming' },
  { name: 'Peripherals', slug: 'peripherals' },
] as const;

// 6-tier condition grading system
export const CONDITIONS = {
  NEW: { label: 'New', description: 'Factory sealed, never opened' },
  LIKE_NEW: { label: 'Like New', description: 'Opened but unused, no visible wear' },
  EXCELLENT: { label: 'Excellent', description: 'Minimal signs of use, fully functional' },
  GOOD: { label: 'Good', description: 'Normal wear, fully functional' },
  FAIR: { label: 'Fair', description: 'Noticeable wear, functional with cosmetic issues' },
  FOR_PARTS: { label: 'For Parts', description: 'Not fully functional, sold as-is' },
} as const;

// Order status labels
export const ORDER_STATUS_LABELS = {
  PENDING_PAYMENT: 'Pending Payment',
  PAYMENT_RECEIVED: 'Payment Received',
  DISPATCHED: 'Dispatched',
  DELIVERED: 'Delivered',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
  REFUNDED: 'Refunded',
} as const;

// Platform fee rates
export const FEES = {
  STUDENT_SELLER: 0.05,  // 5%
  RESELLER: 0.08,        // 8%
  MIN_PAYOUT: 20.00,     // GH₵ 20 minimum payout
} as const;

// Store handle validation
export const HANDLE_RULES = {
  MIN_LENGTH: 3,
  MAX_LENGTH: 24,
  PATTERN: /^[a-z0-9][a-z0-9-]*[a-z0-9]$/,
} as const;

// Reserved handles that cannot be used as store slugs
export const RESERVED_HANDLES = new Set([
  'admin', 'api', 'auth', 'app', 'about',
  'blog', 'buy', 'browse',
  'cart', 'checkout', 'contact', 'categories',
  'dashboard', 'developer', 'docs',
  'explore',
  'faq', 'feed',
  'help', 'home',
  'inbox',
  'jobs',
  'legal', 'login', 'logout', 'listings',
  'messages', 'marketplace',
  'notifications', 'new',
  'orders',
  'privacy', 'profile', 'pricing',
  'register', 'reviews',
  'search', 'settings', 'store', 'stores', 'support', 'status', 'signup',
  'terms', 'trending',
  'user', 'users', 'ushop',
  'verify',
  'wallet', 'webhooks',
]);

// University email domains for auto-verification
export const STUDENT_EMAIL_DOMAINS = [
  'ug.edu.gh',           // University of Ghana
  'st.ug.edu.gh',        // UG student subdomain
  'knust.edu.gh',        // KNUST
  'st.knust.edu.gh',     // KNUST student subdomain
  'ucc.edu.gh',          // University of Cape Coast
  'uew.edu.gh',          // University of Education, Winneba
  'uds.edu.gh',          // University for Development Studies
  'ashesi.edu.gh',       // Ashesi University
  'gctu.edu.gh',         // Ghana Communication Technology Uni
  'upsa.edu.gh',         // University of Professional Studies
  'gimpa.edu.gh',        // GIMPA
  'central.edu.gh',      // Central University
  'pentvars.edu.gh',     // Pentecost University
  'atu.edu.gh',          // Accra Technical University
  'ttu.edu.gh',          // Takoradi Technical University
  'ktu.edu.gh',          // Kumasi Technical University
  'umat.edu.gh',         // University of Mines and Technology
  'uhas.edu.gh',         // University of Health and Allied Sciences
  'uenr.edu.gh',         // University of Energy and Natural Resources
  'wiuc-ghana.edu.gh',   // Wisconsin International University
];

// Return policy options
export const RETURN_WINDOWS = [
  { value: 'NO_RETURNS', label: 'No Returns' },
  { value: '24H', label: '24 Hours' },
  { value: '3D', label: '3 Days' },
  { value: '7D', label: '7 Days' },
  { value: '14D', label: '14 Days' },
  { value: '30D', label: '30 Days' },
] as const;

export const WARRANTY_PERIODS = [
  { value: 'NONE', label: 'No Warranty' },
  { value: '7D', label: '7 Days' },
  { value: '30D', label: '30 Days' },
  { value: '90D', label: '90 Days' },
  { value: 'MANUFACTURER', label: 'Manufacturer Warranty Only' },
] as const;
