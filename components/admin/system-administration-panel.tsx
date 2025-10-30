'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Shield, 
  Users, 
  Monitor, 
  Activity, 
  AlertTriangle,
  CheckCircle,
  Settings,
  Database,
  Server,
  Network,
  Key,
  UserCheck,
  Clock,
  MapPin,
  BarChart3,
  TrendingUp,
  Eye,
  Edit,
  Trash2,
  Plus,
  Search,
  Filter,
  User as UserIcon
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

interface SystemStats {
  totalUsers: number;
  activeDevices: number;
  pendingApprovals: number;
  activeLocations: number;
  totalSessions: number;
  systemUptime: string;
  apiRequests24h: number;
  errorRate: number;
}

interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  role: string;
  status: 'ACTIVE' | 'SUSPENDED' | 'PENDING';
  lastLogin?: Date;
  createdAt: Date;
  locations: string[];
  permissions: string[];
}

interface ApiEndpoint {
  path: string;
  method: string;
  status: 'HEALTHY' | 'WARNING' | 'ERROR';
  responseTime: number;
  requestCount24h: number;
  errorCount24h: number;
  lastAccessed: Date;
}

interface SystemAlert {
  id: string;
  type: 'ERROR' | 'WARNING' | 'INFO';
  message: string;
  timestamp: Date;
  resolved: boolean;
}

export function SystemAdministrationPanel() {
  const [stats, setStats] = useState<SystemStats>({
    totalUsers: 0,
    activeDevices: 0,
    pendingApprovals: 0,
    activeLocations: 0,
    totalSessions: 0,
    systemUptime: '0h 0m',
    apiRequests24h: 0,
    errorRate: 0
  });

  const [users, setUsers] = useState<User[]>([]);
  const [apiEndpoints, setApiEndpoints] = useState<ApiEndpoint[]>([]);
  const [systemAlerts, setSystemAlerts] = useState<SystemAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserDialog, setShowUserDialog] = useState(false);

  // Mock data for development
  useEffect(() => {
    const loadSystemData = async () => {
      setLoading(true);
      
      // Simulate API calls
      setTimeout(() => {
        setStats({
          totalUsers: 45,
          activeDevices: 12,
          pendingApprovals: 3,
          activeLocations: 8,
          totalSessions: 23,
          systemUptime: '15d 4h 23m',
          apiRequests24h: 15847,
          errorRate: 0.2
        });

        setUsers([
          {
            id: 'user-001',
            name: 'John Doe',
            username: 'john.doe',
            email: 'john.doe@example.com',
            role: 'MANAGER',
            status: 'ACTIVE',
            lastLogin: new Date('2025-10-30T10:30:00'),
            createdAt: new Date('2025-01-15T09:00:00'),
            locations: ['loc-001', 'loc-002'],
            permissions: ['pos:use', 'reports:view', 'staff:manage']
          },
          {
            id: 'user-002',
            name: 'Jane Smith',
            username: 'jane.smith',
            email: 'jane.smith@example.com',
            role: 'WORKER',
            status: 'ACTIVE',
            lastLogin: new Date('2025-10-30T08:15:00'),
            createdAt: new Date('2025-02-20T14:30:00'),
            locations: ['loc-001'],
            permissions: ['pos:use', 'timeclock:access']
          },
          {
            id: 'user-003',
            name: 'Mike Johnson',
            username: 'mike.johnson',
            email: 'mike.johnson@example.com',
            role: 'OWNER',
            status: 'PENDING',
            createdAt: new Date('2025-10-29T16:45:00'),
            locations: [],
            permissions: []
          }
        ]);

        setApiEndpoints([
          {
            path: '/api/device/auth',
            method: 'POST',
            status: 'HEALTHY',
            responseTime: 120,
            requestCount24h: 145,
            errorCount24h: 0,
            lastAccessed: new Date('2025-10-30T11:45:00')
          },
          {
            path: '/api/payment/process',
            method: 'POST',
            status: 'WARNING',
            responseTime: 850,
            requestCount24h: 1203,
            errorCount24h: 3,
            lastAccessed: new Date('2025-10-30T11:44:00')
          },
          {
            path: '/api/services',
            method: 'GET',
            status: 'HEALTHY',
            responseTime: 95,
            requestCount24h: 456,
            errorCount24h: 0,
            lastAccessed: new Date('2025-10-30T11:43:00')
          }
        ]);

        setSystemAlerts([
          {
            id: 'alert-001',
            type: 'WARNING',
            message: 'High response time detected on payment processing API',
            timestamp: new Date('2025-10-30T11:30:00'),
            resolved: false
          },
          {
            id: 'alert-002',
            type: 'INFO',
            message: 'New device registration pending approval',
            timestamp: new Date('2025-10-30T10:15:00'),
            resolved: false
          },
          {
            id: 'alert-003',
            type: 'ERROR',
            message: 'Database connection timeout - resolved',
            timestamp: new Date('2025-10-30T09:45:00'),
            resolved: true
          }
        ]);

        setLoading(false);
      }, 1000);
    };

    loadSystemData();
  }, []);

  const getStatusBadge = (status: string, type: 'user' | 'api' = 'user') => {
    if (type === 'user') {
      const variants: Record<string, any> = {
        'ACTIVE': 'default',
        'SUSPENDED': 'destructive',
        'PENDING': 'secondary'
      };
      return <Badge variant={variants[status] || 'outline'}>{status}</Badge>;
    } else {
      const variants: Record<string, any> = {
        'HEALTHY': 'default',
        'WARNING': 'secondary',
        'ERROR': 'destructive'
      };
      return <Badge variant={variants[status] || 'outline'}>{status}</Badge>;
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'ERROR':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'WARNING':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'INFO':
        return <CheckCircle className="h-4 w-4 text-blue-500" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6 py-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">System Administration</h1>
          <p className="text-muted-foreground">
            Monitor and control all aspects of your POS network
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Database className="h-4 w-4 mr-2" />
            Database Tools
          </Button>
          <Button>
            <Settings className="h-4 w-4 mr-2" />
            System Settings
          </Button>
        </div>
      </div>

      {/* System Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Uptime</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.systemUptime}</div>
            <p className="text-xs text-muted-foreground">All systems operational</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">API Requests (24h)</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.apiRequests24h.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Error rate: {stats.errorRate}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSessions}</div>
            <p className="text-xs text-muted-foreground">
              Across {stats.activeLocations} locations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Actions</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.pendingApprovals}</div>
            <p className="text-xs text-muted-foreground">Require attention</p>
          </CardContent>
        </Card>
      </div>

      {/* System Alerts */}
      {systemAlerts.filter(alert => !alert.resolved).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2 text-orange-500" />
              System Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {systemAlerts.filter(alert => !alert.resolved).map((alert) => (
                <Alert key={alert.id}>
                  <div className="flex items-center space-x-2">
                    {getAlertIcon(alert.type)}
                    <div className="flex-1">
                      <AlertDescription>{alert.message}</AlertDescription>
                      <p className="text-xs text-muted-foreground mt-1">
                        {alert.timestamp.toLocaleString()}
                      </p>
                    </div>
                    <Button size="sm" variant="outline">
                      Resolve
                    </Button>
                  </div>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content Tabs */}
      <Tabs defaultValue="users" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="users">User Management</TabsTrigger>
          <TabsTrigger value="api">API Monitoring</TabsTrigger>
          <TabsTrigger value="devices">Device Control</TabsTrigger>
          <TabsTrigger value="system">System Config</TabsTrigger>
        </TabsList>

        {/* User Management Tab */}
        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>User Management</CardTitle>
                  <CardDescription>
                    Manage user accounts, roles, and permissions
                  </CardDescription>
                </div>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add User
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* User Filters */}
                <div className="flex space-x-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search users..." className="pl-8" />
                  </div>
                  <Select defaultValue="all">
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Roles</SelectItem>
                      <SelectItem value="OWNER">Owner</SelectItem>
                      <SelectItem value="MANAGER">Manager</SelectItem>
                      <SelectItem value="WORKER">Worker</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select defaultValue="all">
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="ACTIVE">Active</SelectItem>
                      <SelectItem value="PENDING">Pending</SelectItem>
                      <SelectItem value="SUSPENDED">Suspended</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* User List */}
                <div className="space-y-2">
                  {users.map((user) => (
                    <div key={user.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <UserIcon className="h-5 w-5" />
                          </div>
                          <div>
                            <h3 className="font-semibold">{user.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              {user.email} • {user.role}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          {getStatusBadge(user.status)}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedUser(user);
                              setShowUserDialog(true);
                            }}
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            View
                          </Button>
                        </div>
                      </div>

                      <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                        <div>
                          <strong>Locations:</strong> {user.locations.length > 0 ? user.locations.join(', ') : 'None'}
                        </div>
                        <div>
                          <strong>Last Login:</strong> {user.lastLogin ? user.lastLogin.toLocaleDateString() : 'Never'}
                        </div>
                        <div>
                          <strong>Created:</strong> {user.createdAt.toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* API Monitoring Tab */}
        <TabsContent value="api" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>API Endpoint Monitoring</CardTitle>
              <CardDescription>
                Real-time monitoring of API performance and health
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {apiEndpoints.map((endpoint) => (
                  <div key={`${endpoint.method}-${endpoint.path}`} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Badge variant="outline">{endpoint.method}</Badge>
                        <code className="text-sm">{endpoint.path}</code>
                      </div>
                      {getStatusBadge(endpoint.status, 'api')}
                    </div>
                    
                    <div className="mt-2 grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <strong>Response Time:</strong> {endpoint.responseTime}ms
                      </div>
                      <div>
                        <strong>Requests (24h):</strong> {endpoint.requestCount24h.toLocaleString()}
                      </div>
                      <div>
                        <strong>Errors (24h):</strong> {endpoint.errorCount24h}
                      </div>
                      <div>
                        <strong>Last Accessed:</strong> {endpoint.lastAccessed.toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Device Control Tab */}
        <TabsContent value="devices" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Device Control Center</CardTitle>
              <CardDescription>
                Quick access to device management functions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button 
                  className="h-24 flex-col space-y-2"
                  variant="outline"
                  onClick={() => window.location.href = '/admin/devices'}
                >
                  <Monitor className="h-6 w-6" />
                  <span>Device Management</span>
                </Button>
                
                <Button className="h-24 flex-col space-y-2" variant="outline">
                  <UserCheck className="h-6 w-6" />
                  <span>Pending Approvals</span>
                </Button>
                
                <Button className="h-24 flex-col space-y-2" variant="outline">
                  <Network className="h-6 w-6" />
                  <span>Network Status</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* System Configuration Tab */}
        <TabsContent value="system" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Configuration</CardTitle>
              <CardDescription>
                Configure system-wide settings and preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button className="h-24 flex-col space-y-2" variant="outline">
                  <Database className="h-6 w-6" />
                  <span>Database Settings</span>
                </Button>
                
                <Button className="h-24 flex-col space-y-2" variant="outline">
                  <Key className="h-6 w-6" />
                  <span>API Keys</span>
                </Button>
                
                <Button className="h-24 flex-col space-y-2" variant="outline">
                  <Server className="h-6 w-6" />
                  <span>Server Configuration</span>
                </Button>
                
                <Button className="h-24 flex-col space-y-2" variant="outline">
                  <Shield className="h-6 w-6" />
                  <span>Security Settings</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* User Details Dialog */}
      <Dialog open={showUserDialog} onOpenChange={setShowUserDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
            <DialogDescription>
              Manage user account and permissions
            </DialogDescription>
          </DialogHeader>
          
          {selectedUser && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Name</Label>
                  <p className="text-sm">{selectedUser.name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Email</Label>
                  <p className="text-sm">{selectedUser.email}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Role</Label>
                  <p className="text-sm">{selectedUser.role}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  {getStatusBadge(selectedUser.status)}
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Permissions</Label>
                <div className="flex flex-wrap gap-1 mt-1">
                  {selectedUser.permissions.map((permission) => (
                    <Badge key={permission} variant="outline">
                      {permission}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setShowUserDialog(false)}>
                  Close
                </Button>
                <Button variant="outline">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit User
                </Button>
                {selectedUser.status === 'PENDING' && (
                  <Button>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}