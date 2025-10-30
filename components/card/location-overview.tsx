'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  MapPin, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  DollarSign,
  Package
} from 'lucide-react';

interface LocationMetrics {
  name: string;
  status: 'active' | 'busy' | 'closed';
  todayRevenue: number;
  trend: 'up' | 'down';
  staff: number;
  products: number;
}

const mockLocations: LocationMetrics[] = [
  {
    name: 'Downtown Store',
    status: 'active',
    todayRevenue: 15420,
    trend: 'up',
    staff: 8,
    products: 1247
  },
  {
    name: 'Mall Location',
    status: 'busy',
    todayRevenue: 22350,
    trend: 'up',
    staff: 12,
    products: 1456
  },
  {
    name: 'Airport Store',
    status: 'active',
    todayRevenue: 8750,
    trend: 'down',
    staff: 6,
    products: 892
  }
];

export function LocationOverview() {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'busy': return 'bg-yellow-100 text-yellow-800';
      case 'closed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const totalRevenue = mockLocations.reduce((sum, loc) => sum + loc.todayRevenue, 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-lg">Location Overview</h3>
          <p className="text-sm text-gray-600">Today's performance across all stores</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-green-600">
            ${totalRevenue.toLocaleString()}
          </div>
          <div className="text-xs text-gray-500">Total Revenue</div>
        </div>
      </div>

      <div className="space-y-3">
        {mockLocations.map((location, index) => (
          <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-100 hover:shadow-sm transition-shadow">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <MapPin className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <div className="font-medium text-sm">{location.name}</div>
                <div className="flex items-center space-x-2 mt-1">
                  <Badge className={`text-xs ${getStatusColor(location.status)}`}>
                    {location.status}
                  </Badge>
                  <div className="flex items-center space-x-1 text-xs text-gray-500">
                    <Users className="h-3 w-3" />
                    <span>{location.staff}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="text-right">
              <div className="flex items-center space-x-1">
                <span className="font-semibold text-sm">
                  ${location.todayRevenue.toLocaleString()}
                </span>
                {location.trend === 'up' ? 
                  <TrendingUp className="h-3 w-3 text-green-500" /> :
                  <TrendingDown className="h-3 w-3 text-red-500" />
                }
              </div>
              <div className="text-xs text-gray-500">
                {location.products} products
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}