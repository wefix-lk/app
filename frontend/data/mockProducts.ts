import { Product } from '../types';

export const mockProducts: Product[] = [
  {
    id: 'prod-1',
    name: 'Samsung 55" 4K LED TV Panel',
    description: 'Original Samsung 55-inch 4K LED display panel. Compatible with UN55*, UE55* models. High brightness, excellent color accuracy. 1-year warranty included.',
    price: 125000,
    currency: 'LKR',
    images: [
      'https://images.unsplash.com/photo-1593784991095-a205069470b6?w=800&auto=format&fit=crop',
    ],
    category: 'TV Panels',
    stock: 8,
    isInStock: true,
    createdAt: '2025-01-15T10:00:00Z'
  },
  {
    id: 'prod-2',
    name: 'LG T-CON Board (Universal)',
    description: 'Universal T-CON board compatible with LG 42"-55" LED TVs. Controls display timing and image processing. Easy installation with technical support.',
    price: 8500,
    currency: 'LKR',
    images: [
      'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop',
    ],
    category: 'T-CON Boards',
    stock: 15,
    isInStock: true,
    createdAt: '2025-01-16T10:00:00Z'
  },
  {
    id: 'prod-3',
    name: 'LED Backlight Strip Set (32")',
    description: 'Complete LED backlight strip replacement kit for 32-inch TVs. Includes 2 strips, adhesive tape, and installation guide. Universal compatibility.',
    price: 4500,
    currency: 'LKR',
    images: [
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&auto=format&fit=crop',
    ],
    category: 'Backlights',
    stock: 22,
    isInStock: true,
    createdAt: '2025-01-17T10:00:00Z'
  },
  {
    id: 'prod-4',
    name: 'Sony Main Board (Multiple Models)',
    description: 'Original Sony main board replacement for various 40"-50" models. Includes WiFi, USB, and HDMI ports. Pre-tested and guaranteed working.',
    price: 18500,
    currency: 'LKR',
    images: [
      'https://images.unsplash.com/photo-1585504198199-20277593b94f?w=800&auto=format&fit=crop',
    ],
    category: 'Main Boards',
    stock: 5,
    isInStock: true,
    createdAt: '2025-01-18T10:00:00Z'
  },
  {
    id: 'prod-5',
    name: 'Power Supply Board (Universal)',
    description: 'Universal power supply board for LED TVs 32"-43". Output: 12V, 5V. Overcurrent and overvoltage protection. Compatible with most brands.',
    price: 6200,
    currency: 'LKR',
    images: [
      'https://images.unsplash.com/photo-1593510987459-92d19971b61c?w=800&auto=format&fit=crop',
    ],
    category: 'Power Supply',
    stock: 12,
    isInStock: true,
    createdAt: '2025-01-19T10:00:00Z'
  }
];

export const tvBrands = [
  'Samsung',
  'LG',
  'Sony',
  'Panasonic',
  'TCL',
  'Hisense',
  'Abans',
  'Singer',
  'Other'
];

export const issueTypes = [
  { value: 'no-power', label: 'No Power / Won\'t Turn On' },
  { value: 'line-issue', label: 'Horizontal/Vertical Lines' },
  { value: 'panel-crack', label: 'Cracked/Damaged Panel' },
  { value: 'dim-light', label: 'Dim Display / Backlight Issue' },
  { value: 'no-picture', label: 'No Picture (Sound Only)' },
  { value: 'no-sound', label: 'No Sound' },
  { value: 'color-issue', label: 'Color Problems' },
  { value: 'hdmi-issue', label: 'HDMI/Port Issues' },
  { value: 'remote-issue', label: 'Remote Control Problem' },
  { value: 'other', label: 'Other Issue' }
];
