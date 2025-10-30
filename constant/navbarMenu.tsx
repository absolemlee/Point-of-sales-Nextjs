import {
  Home,
  Package,
  ShoppingCart,
  Archive,
  Settings,
  Star,
  MapPin,
  Users,
  HandHeart,
  Calculator,
  Clock,
  Shield,
  Monitor,
} from 'lucide-react';
import { NavItem } from '@/types/Navbar';

export const NAVBAR_ITEMS: NavItem[] = [
  {
    title: 'Home',
    path: '/home',
    icon: <Home className="h-4 w-4" />,
  },
  {
    title: 'Locations',
    path: '/locations',
    icon: <MapPin className="h-4 w-4" />,
  },
  {
    title: 'Personnel',
    path: '/personnel',
    icon: <Users className="h-4 w-4" />,
  },
  {
    title: 'Services',
    path: '/services',
    icon: <HandHeart className="h-4 w-4" />,
  },
  {
    title: 'POS',
    path: '/pos',
    icon: <Calculator className="h-4 w-4" />,
  },
  {
    title: 'Shift Management',
    path: '/pos/shift-management',
    icon: <Clock className="h-4 w-4" />,
  },
  {
    title: 'Orders',
    path: '/orders',
    icon: <ShoppingCart className="h-4 w-4" />,
  },
  {
    title: 'Product Management',
    path: '/product-management',
    icon: <Package className="h-4 w-4" />,
  },
  {
    title: 'Records',
    path: '/records',
    icon: <Archive className="h-4 w-4" />,
  },
  {
    title: 'Settings',
    path: '/settings',
    icon: <Settings className="h-4 w-4" />,
  },
  {
    title: 'Technologies',
    path: '/technologies',
    icon: <Star className="h-4 w-4" />,
  },
  {
    title: 'System Admin',
    path: '/admin',
    icon: <Shield className="h-4 w-4" />,
  },
  {
    title: 'Device Management',
    path: '/admin/devices',
    icon: <Monitor className="h-4 w-4" />,
  },
];
