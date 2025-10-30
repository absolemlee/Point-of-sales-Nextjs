'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Calculator, 
  MapPin, 
  Package, 
  BarChart3, 
  Users, 
  ShoppingCart,
  ArrowRight 
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export function POSQuickAccess() {
  const router = useRouter();

  const quickActions = [
    {
      title: 'Point of Sale',
      icon: <Calculator className="h-5 w-5" />,
      path: '/pos',
      description: 'Process transactions',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Locations',
      icon: <MapPin className="h-5 w-5" />,
      path: '/locations',
      description: 'Manage stores',
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Products',
      icon: <Package className="h-5 w-5" />,
      path: '/product-management',
      description: 'Inventory control',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'Analytics',
      icon: <BarChart3 className="h-5 w-5" />,
      path: '/analytics',
      description: 'Performance insights',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    }
  ];

  return (
    <div className="space-y-3">
      {quickActions.map((action, index) => (
        <Button
          key={index}
          variant="ghost"
          className="w-full justify-start h-auto p-3 hover:bg-gray-50"
          onClick={() => router.push(action.path)}
        >
          <div className={`p-2 rounded-lg ${action.bgColor} mr-3`}>
            <div className={action.color}>
              {action.icon}
            </div>
          </div>
          <div className="flex-1 text-left">
            <div className="font-medium text-sm">{action.title}</div>
            <div className="text-xs text-gray-500">{action.description}</div>
          </div>
          <ArrowRight className="h-4 w-4 text-gray-400" />
        </Button>
      ))}
    </div>
  );
}