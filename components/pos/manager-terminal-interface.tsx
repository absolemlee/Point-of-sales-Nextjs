'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  BarChart3, 
  Users, 
  Settings, 
  DollarSign,
  Clock,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  Eye,
  EyeOff,
  RefreshCw,
  Shield,
  UserPlus,
  UserMinus,
  Edit,
  Trash2,
  Plus,
  Minus,
  Calculator,
  Receipt,
  Package,
  Star,
  Target
} from 'lucide-react';

interface ManagerStats {
  todayRevenue: number;
  todayOrders: number;
  averageOrderValue: number;
  customerSatisfaction: number;
  activeWorkers: number;
  pendingOrders: number;
  kitchenWaitTime: number;
  topProduct: string;
  hourlyRevenue: { hour: number; revenue: number }[];
}

interface WorkerOverride {
  workerId: string;
  workerName: string;
  currentHours: number;
  breaksTaken: number;
  status: 'ACTIVE' | 'ON_BREAK' | 'CLOCKED_OUT';
  permissions: string[];
}

interface ManagerTerminalProps {
  locationId: string;
  managerId: string;
}

export function ManagerTerminalInterface({ locationId, managerId }: ManagerTerminalProps) {
  const [stats, setStats] = useState<ManagerStats>({
    todayRevenue: 0,
    todayOrders: 0,
    averageOrderValue: 0,
    customerSatisfaction: 0,
    activeWorkers: 0,
    pendingOrders: 0,
    kitchenWaitTime: 0,
    topProduct: '',
    hourlyRevenue: []
  });
  
  const [workers, setWorkers] = useState<WorkerOverride[]>([]);
  const [selectedWorker, setSelectedWorker] = useState<string>('');
  const [showOverrideDialog, setShowOverrideDialog] = useState(false);
  const [showReportsDialog, setShowReportsDialog] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchManagerData();
    const interval = setInterval(fetchManagerData, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, [locationId]);

  const fetchManagerData = async () => {
    try {
      setLoading(true);
      const [statsResponse, workersResponse] = await Promise.all([
        fetch(`/api/manager/stats?locationId=${locationId}`),
        fetch(`/api/manager/workers?locationId=${locationId}`)
      ]);
      
      const statsData = await statsResponse.json();
      const workersData = await workersResponse.json();
      
      setStats(statsData.stats || stats);
      setWorkers(workersData.workers || []);
    } catch (error) {
      console.error('Error fetching manager data:', error);
    } finally {
      setLoading(false);
    }
  };

  const performWorkerAction = async (workerId: string, action: string, data?: any) => {
    try {
      await fetch(`/api/manager/worker-actions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workerId,
          action,
          data,
          managerId,
          locationId
        })
      });
      fetchManagerData();
    } catch (error) {
      console.error('Error performing worker action:', error);
    }
  };

  const processManagerOverride = async (type: string, data: any) => {
    try {
      await fetch(`/api/manager/overrides`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          data,
          managerId,
          locationId
        })
      });
      fetchManagerData();
    } catch (error) {
      console.error('Error processing manager override:', error);
    }
  };

  const DashboardTab = () => (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Today's Revenue</p>
                <p className="text-2xl font-bold">${stats.todayRevenue.toFixed(2)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Orders Today</p>
                <p className="text-2xl font-bold">{stats.todayOrders}</p>
              </div>
              <Receipt className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Order Value</p>
                <p className="text-2xl font-bold">${stats.averageOrderValue.toFixed(2)}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Customer Rating</p>
                <p className="text-2xl font-bold">{stats.customerSatisfaction.toFixed(1)}</p>
              </div>
              <Star className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Operations Status */}
      <div className="grid grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Current Operations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span>Active Workers:</span>
              <Badge variant="secondary">{stats.activeWorkers}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span>Pending Orders:</span>
              <Badge variant={stats.pendingOrders > 10 ? "destructive" : "secondary"}>
                {stats.pendingOrders}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span>Kitchen Wait Time:</span>
              <Badge variant={stats.kitchenWaitTime > 15 ? "destructive" : "secondary"}>
                {stats.kitchenWaitTime}m
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span>Top Product:</span>
              <span className="font-medium">{stats.topProduct}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Hourly Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {stats.hourlyRevenue.slice(-6).map((item, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span>{item.hour}:00</span>
                  <span className="font-medium">${item.revenue.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Manager Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <Button 
              variant="outline" 
              className="h-20 flex flex-col items-center gap-2"
              onClick={() => setShowOverrideDialog(true)}
            >
              <Shield className="h-6 w-6" />
              Manager Override
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex flex-col items-center gap-2"
              onClick={() => setShowReportsDialog(true)}
            >
              <BarChart3 className="h-6 w-6" />
              View Reports
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex flex-col items-center gap-2"
              onClick={() => setActiveTab('workers')}
            >
              <Users className="h-6 w-6" />
              Manage Staff
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const WorkersTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Staff Management</h3>
        <Button onClick={() => performWorkerAction('', 'refresh')}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <div className="grid gap-4">
        {workers.map((worker) => (
          <Card key={worker.workerId}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div>
                    <h4 className="font-medium">{worker.workerName}</h4>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      {worker.currentHours.toFixed(1)}h today
                      <span>•</span>
                      {worker.breaksTaken} breaks
                    </div>
                  </div>
                  <Badge variant={
                    worker.status === 'ACTIVE' ? 'default' :
                    worker.status === 'ON_BREAK' ? 'secondary' : 'outline'
                  }>
                    {worker.status.replace('_', ' ')}
                  </Badge>
                </div>
                
                <div className="flex gap-2">
                  {worker.status === 'ACTIVE' && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => performWorkerAction(worker.workerId, 'send_break')}
                    >
                      Send on Break
                    </Button>
                  )}
                  {worker.status === 'ON_BREAK' && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => performWorkerAction(worker.workerId, 'return_from_break')}
                    >
                      Return from Break
                    </Button>
                  )}
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => {
                      setSelectedWorker(worker.workerId);
                      setShowOverrideDialog(true);
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="mt-3 pt-3 border-t">
                <div className="text-xs text-muted-foreground">
                  Permissions: {worker.permissions.join(', ')}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const SettingsTab = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">Terminal Settings</h3>
      
      <div className="grid grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>POS Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span>Require Manager Approval for Refunds</span>
              <Button variant="outline" size="sm">
                Enabled
              </Button>
            </div>
            <div className="flex justify-between items-center">
              <span>Maximum Discount Percentage</span>
              <Input className="w-20" defaultValue="25" />
            </div>
            <div className="flex justify-between items-center">
              <span>Cash Drawer Auto-Open</span>
              <Button variant="outline" size="sm">
                Enabled
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Security Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span>Session Timeout (minutes)</span>
              <Input className="w-20" defaultValue="30" />
            </div>
            <div className="flex justify-between items-center">
              <span>Require PIN for Voids</span>
              <Button variant="outline" size="sm">
                Enabled
              </Button>
            </div>
            <div className="flex justify-between items-center">
              <span>Camera Recording</span>
              <Button variant="outline" size="sm">
                Active
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const OverrideDialog = () => (
    <Dialog open={showOverrideDialog} onOpenChange={setShowOverrideDialog}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Manager Override</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Override Type</label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select override type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="price_override">Price Override</SelectItem>
                <SelectItem value="discount_override">Discount Override</SelectItem>
                <SelectItem value="void_order">Void Order</SelectItem>
                <SelectItem value="refund_processing">Process Refund</SelectItem>
                <SelectItem value="comp_item">Comp Item</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="text-sm font-medium">Reason</label>
            <Input placeholder="Enter reason for override" />
          </div>
          
          <div>
            <label className="text-sm font-medium">Amount (if applicable)</label>
            <Input type="number" placeholder="0.00" />
          </div>
          
          <div className="flex gap-2 pt-4">
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={() => setShowOverrideDialog(false)}
            >
              Cancel
            </Button>
            <Button 
              className="flex-1"
              onClick={() => {
                // Process override
                setShowOverrideDialog(false);
              }}
            >
              Authorize
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Shield className="h-12 w-12 animate-pulse mx-auto mb-4" />
          <p>Loading manager terminal...</p>
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
            <Shield className="h-8 w-8" />
            <div>
              <h1 className="text-2xl font-bold">Manager Terminal</h1>
              <p className="text-primary-foreground/80">Location: {locationId}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <Badge variant="secondary" className="text-sm">
              Manager: {managerId}
            </Badge>
            <Button
              variant="secondary"
              size="sm"
              onClick={fetchManagerData}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="workers">Staff Management</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="dashboard" className="mt-6">
            <DashboardTab />
          </TabsContent>
          
          <TabsContent value="workers" className="mt-6">
            <WorkersTab />
          </TabsContent>
          
          <TabsContent value="settings" className="mt-6">
            <SettingsTab />
          </TabsContent>
        </Tabs>
      </div>

      <OverrideDialog />
    </div>
  );
}