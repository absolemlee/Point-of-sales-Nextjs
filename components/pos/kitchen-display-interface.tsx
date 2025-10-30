'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  XCircle,
  Play,
  Pause,
  ChefHat,
  Timer,
  Bell,
  RotateCcw,
  Users,
  Utensils
} from 'lucide-react';

interface OrderItem {
  id: string;
  productName: string;
  quantity: number;
  customizations: string[];
  specialInstructions?: string;
  preparationTime: number;
  allergens?: string[];
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
}

interface KitchenOrder {
  id: string;
  orderNumber: string;
  orderType: 'DINE_IN' | 'TAKEOUT' | 'DELIVERY' | 'DRIVE_THRU';
  customerName?: string;
  items: OrderItem[];
  orderTime: string;
  estimatedCompletionTime: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'READY' | 'COMPLETED' | 'CANCELLED';
  assignedCook?: string;
  station: string;
  totalItems: number;
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  notes?: string;
}

interface KitchenStats {
  activeOrders: number;
  completedToday: number;
  averageTime: number;
  overdueOrders: number;
  currentWaitTime: number;
}

interface KitchenDisplayProps {
  locationId: string;
  stationId?: string;
  workerId?: string;
}

export function KitchenDisplayInterface({ locationId, stationId, workerId }: KitchenDisplayProps) {
  const [orders, setOrders] = useState<KitchenOrder[]>([]);
  const [stats, setStats] = useState<KitchenStats>({
    activeOrders: 0,
    completedToday: 0,
    averageTime: 0,
    overdueOrders: 0,
    currentWaitTime: 0
  });
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'IN_PROGRESS' | 'READY'>('ALL');
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    fetchOrders();
    fetchStats();
    
    if (autoRefresh) {
      const interval = setInterval(() => {
        fetchOrders();
        fetchStats();
      }, 30000); // Refresh every 30 seconds
      
      return () => clearInterval(interval);
    }
  }, [locationId, stationId, autoRefresh]);

  const fetchOrders = async () => {
    try {
      const response = await fetch(`/api/kitchen/orders?locationId=${locationId}&stationId=${stationId || ''}`);
      const data = await response.json();
      setOrders(data.orders || []);
    } catch (error) {
      console.error('Error fetching kitchen orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch(`/api/kitchen/stats?locationId=${locationId}`);
      const data = await response.json();
      setStats(data.stats || stats);
    } catch (error) {
      console.error('Error fetching kitchen stats:', error);
    }
  };

  const updateOrderStatus = async (orderId: string, status: KitchenOrder['status']) => {
    try {
      await fetch(`/api/kitchen/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, workerId })
      });
      fetchOrders();
      fetchStats();
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  const getOrderPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT': return 'destructive';
      case 'HIGH': return 'destructive';
      case 'NORMAL': return 'secondary';
      case 'LOW': return 'outline';
      default: return 'secondary';
    }
  };

  const getOrderTypeIcon = (type: string) => {
    switch (type) {
      case 'DINE_IN': return '🍽️';
      case 'TAKEOUT': return '🥡';
      case 'DELIVERY': return '🚚';
      case 'DRIVE_THRU': return '🚗';
      default: return '📋';
    }
  };

  const getTimeSinceOrder = (orderTime: string): string => {
    const minutes = Math.floor((Date.now() - new Date(orderTime).getTime()) / 60000);
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ${minutes % 60}m`;
  };

  const isOrderOverdue = (orderTime: string, estimatedTime: string): boolean => {
    return new Date(estimatedTime) < new Date();
  };

  const filteredOrders = orders.filter(order => {
    if (filter === 'ALL') return order.status !== 'COMPLETED' && order.status !== 'CANCELLED';
    return order.status === filter;
  });

  const KitchenStatsHeader = () => (
    <div className="grid grid-cols-5 gap-4 p-4 bg-muted/50">
      <Card>
        <CardContent className="p-3 text-center">
          <div className="text-2xl font-bold text-blue-600">{stats.activeOrders}</div>
          <div className="text-xs text-muted-foreground">Active Orders</div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-3 text-center">
          <div className="text-2xl font-bold text-green-600">{stats.completedToday}</div>
          <div className="text-xs text-muted-foreground">Completed Today</div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-3 text-center">
          <div className="text-2xl font-bold text-orange-600">{stats.averageTime}m</div>
          <div className="text-xs text-muted-foreground">Avg Time</div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-3 text-center">
          <div className="text-2xl font-bold text-red-600">{stats.overdueOrders}</div>
          <div className="text-xs text-muted-foreground">Overdue</div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-3 text-center">
          <div className="text-2xl font-bold text-purple-600">{stats.currentWaitTime}m</div>
          <div className="text-xs text-muted-foreground">Current Wait</div>
        </CardContent>
      </Card>
    </div>
  );

  const OrderCard = ({ order }: { order: KitchenOrder }) => {
    const isOverdue = isOrderOverdue(order.orderTime, order.estimatedCompletionTime);
    const timeSince = getTimeSinceOrder(order.orderTime);

    return (
      <Card 
        className={`cursor-pointer transition-all ${
          selectedOrder === order.id ? 'ring-2 ring-primary' : ''
        } ${isOverdue ? 'border-red-500 bg-red-50' : ''} ${
          order.priority === 'URGENT' ? 'border-red-600 shadow-lg' : ''
        }`}
        onClick={() => setSelectedOrder(selectedOrder === order.id ? null : order.id)}
      >
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg">{getOrderTypeIcon(order.orderType)}</span>
              <div>
                <CardTitle className="text-lg">#{order.orderNumber}</CardTitle>
                {order.customerName && (
                  <p className="text-sm text-muted-foreground">{order.customerName}</p>
                )}
              </div>
            </div>
            <div className="text-right">
              <Badge variant={getOrderPriorityColor(order.priority)}>
                {order.priority}
              </Badge>
              <div className={`text-sm mt-1 ${isOverdue ? 'text-red-600 font-bold' : 'text-muted-foreground'}`}>
                {timeSince}
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          <div className="space-y-2">
            {order.items.map((item, index) => (
              <div key={index} className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {item.quantity}x
                    </Badge>
                    <span className="font-medium">{item.productName}</span>
                  </div>
                  {item.customizations.length > 0 && (
                    <div className="text-xs text-muted-foreground ml-8">
                      {item.customizations.join(', ')}
                    </div>
                  )}
                  {item.specialInstructions && (
                    <div className="text-xs text-orange-600 ml-8 italic">
                      Note: {item.specialInstructions}
                    </div>
                  )}
                  {item.allergens && item.allergens.length > 0 && (
                    <div className="text-xs text-red-600 ml-8 font-medium">
                      ⚠️ Allergens: {item.allergens.join(', ')}
                    </div>
                  )}
                </div>
                <div className="text-xs text-muted-foreground">
                  {item.preparationTime}m
                </div>
              </div>
            ))}
          </div>

          {order.notes && (
            <div className="p-2 bg-yellow-50 border border-yellow-200 rounded text-sm">
              <strong>Kitchen Notes:</strong> {order.notes}
            </div>
          )}

          <Separator />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              Est: {new Date(order.estimatedCompletionTime).toLocaleTimeString()}
              {order.assignedCook && (
                <>
                  <ChefHat className="h-4 w-4 ml-2" />
                  {order.assignedCook}
                </>
              )}
            </div>
            <div className="flex gap-2">
              {order.status === 'PENDING' && (
                <Button 
                  size="sm" 
                  onClick={(e) => {
                    e.stopPropagation();
                    updateOrderStatus(order.id, 'IN_PROGRESS');
                  }}
                >
                  <Play className="h-4 w-4 mr-1" />
                  Start
                </Button>
              )}
              {order.status === 'IN_PROGRESS' && (
                <Button 
                  size="sm" 
                  onClick={(e) => {
                    e.stopPropagation();
                    updateOrderStatus(order.id, 'READY');
                  }}
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Ready
                </Button>
              )}
              {order.status === 'READY' && (
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    updateOrderStatus(order.id, 'COMPLETED');
                  }}
                >
                  <Bell className="h-4 w-4 mr-1" />
                  Complete
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <ChefHat className="h-12 w-12 animate-pulse mx-auto mb-4" />
          <p>Loading kitchen display...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <div className="bg-primary text-primary-foreground p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <ChefHat className="h-8 w-8" />
            <div>
              <h1 className="text-2xl font-bold">Kitchen Display</h1>
              <p className="text-primary-foreground/80">
                {stationId ? `Station: ${stationId}` : 'All Stations'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setAutoRefresh(!autoRefresh)}
              className="flex items-center gap-2"
            >
              {autoRefresh ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              Auto Refresh
            </Button>
            
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                fetchOrders();
                fetchStats();
              }}
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Dashboard */}
      <KitchenStatsHeader />

      {/* Filter Tabs */}
      <div className="border-b bg-background">
        <div className="flex gap-1 p-2">
          {['ALL', 'PENDING', 'IN_PROGRESS', 'READY'].map((status) => (
            <Button
              key={status}
              variant={filter === status ? "default" : "ghost"}
              size="sm"
              onClick={() => setFilter(status as any)}
              className="flex items-center gap-2"
            >
              {status === 'PENDING' && <Clock className="h-4 w-4" />}
              {status === 'IN_PROGRESS' && <Timer className="h-4 w-4" />}
              {status === 'READY' && <CheckCircle className="h-4 w-4" />}
              {status === 'ALL' && <Utensils className="h-4 w-4" />}
              {status.replace('_', ' ')}
              <Badge variant="secondary" className="ml-1">
                {status === 'ALL' 
                  ? filteredOrders.length 
                  : orders.filter(o => o.status === status).length
                }
              </Badge>
            </Button>
          ))}
        </div>
      </div>

      {/* Orders Grid */}
      <div className="flex-1 overflow-auto">
        {filteredOrders.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-muted-foreground">
              <ChefHat className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg">No orders to display</p>
              <p className="text-sm">Orders will appear here when they're ready for the kitchen</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4">
            {filteredOrders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        )}
      </div>

      {/* Bottom Status Bar */}
      <div className="border-t bg-muted/50 p-2">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-4">
            <span>Last updated: {new Date().toLocaleTimeString()}</span>
            {workerId && <span>Cook: {workerId}</span>}
          </div>
          <div className="flex items-center gap-4">
            <span>{filteredOrders.length} orders displayed</span>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>System Online</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}