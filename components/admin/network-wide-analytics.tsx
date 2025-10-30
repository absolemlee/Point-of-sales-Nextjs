'use client';
import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Activity,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  ShoppingCart,
  Package,
  RefreshCw
} from 'lucide-react';

interface NetworkStats {
  totalRevenue: number;
  revenueChange: number;
  activeUsers: number;
  totalOrders: number;
  ordersChange: number;
  inventoryItems: number;
  lowStockAlerts: number;
}

export function NetworkWideAnalytics() {
  const [stats, setStats] = useState<NetworkStats>({
    totalRevenue: 12840,
    revenueChange: 8.2,
    activeUsers: 23,
    totalOrders: 156,
    ordersChange: 12,
    inventoryItems: 342,
    lowStockAlerts: 5
  });
  
  const [isLoading, setIsLoading] = useState(false);

  const refreshData = async () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setStats(prev => ({
        ...prev,
        totalRevenue: prev.totalRevenue + Math.floor(Math.random() * 100),
        activeUsers: Math.floor(Math.random() * 30) + 15,
        totalOrders: prev.totalOrders + Math.floor(Math.random() * 5)
      }));
      setIsLoading(false);
    }, 1000);
  };

  useEffect(() => {
    // Auto-refresh every 30 seconds
    const interval = setInterval(refreshData, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-4 h-full">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-green-600" />
          <h3 className="font-semibold">Network Analytics</h3>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          className="text-xs"
          onClick={refreshData}
          disabled={isLoading}
        >
          <RefreshCw className={`h-3 w-3 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Key Performance Indicators */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-green-50 rounded-lg p-3 border border-green-200">
          <div className="flex items-center gap-2 mb-1">
            <DollarSign className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium">Total Revenue</span>
          </div>
          <div className="text-xl font-bold text-green-700">
            ${stats.totalRevenue.toLocaleString()}
          </div>
          <div className="flex items-center gap-1 text-xs">
            <TrendingUp className="h-3 w-3 text-green-600" />
            <span className="text-green-600">+{stats.revenueChange}%</span>
            <span className="text-muted-foreground">vs last week</span>
          </div>
        </div>

        <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
          <div className="flex items-center gap-2 mb-1">
            <Users className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium">Active Users</span>
          </div>
          <div className="text-xl font-bold text-blue-700">
            {stats.activeUsers}
          </div>
          <div className="text-xs text-muted-foreground">
            Across all locations
          </div>
        </div>
      </div>

      {/* Operational Metrics */}
      <div className="space-y-2">
        <div className="text-sm font-medium">Operational Overview</div>
        
        <div className="flex items-center justify-between p-2 rounded border">
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-4 w-4 text-orange-500" />
            <span className="text-sm">Orders Today</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold">{stats.totalOrders}</span>
            <Badge variant="secondary" className="text-xs">
              +{stats.ordersChange}
            </Badge>
          </div>
        </div>

        <div className="flex items-center justify-between p-2 rounded border">
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-purple-500" />
            <span className="text-sm">Inventory Items</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold">{stats.inventoryItems}</span>
            {stats.lowStockAlerts > 0 && (
              <Badge variant="destructive" className="text-xs">
                {stats.lowStockAlerts} low
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Performance Trend */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-3 border">
        <div className="text-sm font-medium mb-2">Performance Trend</div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Network Health</span>
          <Badge variant="default" className="bg-green-600">
            Excellent
          </Badge>
        </div>
        <div className="mt-2 text-xs text-muted-foreground">
          All systems operational • Revenue trending up • No critical alerts
        </div>
      </div>
    </div>
  );
}