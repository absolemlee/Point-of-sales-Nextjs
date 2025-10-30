'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Clock, 
  Users, 
  UserCheck, 
  UserX, 
  Coffee, 
  Timer, 
  DollarSign,
  TrendingUp,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

interface ShiftEmployee {
  id: string;
  name: string;
  role: 'cashier' | 'supervisor' | 'manager';
  clockInTime: string;
  breakTime?: string;
  status: 'active' | 'on_break' | 'clocked_out';
  hoursWorked: number;
  sales: number;
  transactions: number;
}

interface ShiftMetrics {
  totalSales: number;
  totalTransactions: number;
  averageTicket: number;
  hourlyRate: number;
  rushPeriods: { time: string; transactions: number }[];
}

export function IntegratedShiftManager() {
  const [currentShift, setCurrentShift] = useState<any>(null);
  const [showClockInDialog, setShowClockInDialog] = useState(false);
  const [showBreakDialog, setShowBreakDialog] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<string>('');

  const mockEmployees: ShiftEmployee[] = [
    {
      id: 'emp-1',
      name: 'Sarah Wilson',
      role: 'cashier',
      clockInTime: '08:00',
      status: 'active',
      hoursWorked: 4.5,
      sales: 450.75,
      transactions: 23
    },
    {
      id: 'emp-2',
      name: 'Mike Johnson',
      role: 'cashier',
      clockInTime: '09:00',
      status: 'on_break',
      breakTime: '12:30',
      hoursWorked: 3.5,
      sales: 320.50,
      transactions: 18
    },
    {
      id: 'emp-3',
      name: 'Alex Chen',
      role: 'supervisor',
      clockInTime: '08:30',
      status: 'active',
      hoursWorked: 4.0,
      sales: 680.25,
      transactions: 31
    }
  ];

  const shiftMetrics: ShiftMetrics = {
    totalSales: 1451.50,
    totalTransactions: 72,
    averageTicket: 20.16,
    hourlyRate: 362.88,
    rushPeriods: [
      { time: '09:00', transactions: 12 },
      { time: '12:00', transactions: 18 },
      { time: '15:00', transactions: 8 }
    ]
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'on_break': return <Coffee className="h-4 w-4 text-yellow-500" />;
      case 'clocked_out': return <UserX className="h-4 w-4 text-gray-500" />;
      default: return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'on_break': return 'bg-yellow-100 text-yellow-800';
      case 'clocked_out': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Shift Overview */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              <div>
                <div className="text-2xl font-bold">${shiftMetrics.totalSales.toFixed(2)}</div>
                <div className="text-sm text-gray-500">Total Sales</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-blue-600" />
              <div>
                <div className="text-2xl font-bold">{shiftMetrics.totalTransactions}</div>
                <div className="text-sm text-gray-500">Transactions</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-purple-600" />
              <div>
                <div className="text-2xl font-bold">${shiftMetrics.averageTicket.toFixed(2)}</div>
                <div className="text-sm text-gray-500">Avg Ticket</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-orange-600" />
              <div>
                <div className="text-2xl font-bold">${shiftMetrics.hourlyRate.toFixed(2)}</div>
                <div className="text-sm text-gray-500">Per Hour</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Staff Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>Staff on Duty</span>
            </CardTitle>
            <div className="flex space-x-2">
              <Dialog open={showClockInDialog} onOpenChange={setShowClockInDialog}>
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline">
                    <UserCheck className="h-4 w-4 mr-2" />
                    Clock In
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Clock In Employee</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="employee">Select Employee</Label>
                      <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose employee" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="new-emp-1">Jessica Brown</SelectItem>
                          <SelectItem value="new-emp-2">David Lee</SelectItem>
                          <SelectItem value="new-emp-3">Emily Davis</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="role">Role</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cashier">Cashier</SelectItem>
                          <SelectItem value="supervisor">Supervisor</SelectItem>
                          <SelectItem value="manager">Manager</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button className="w-full">Clock In</Button>
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog open={showBreakDialog} onOpenChange={setShowBreakDialog}>
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline">
                    <Coffee className="h-4 w-4 mr-2" />
                    Manage Breaks
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Break Management</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Employee on Break</Label>
                      <div className="mt-2">
                        {mockEmployees.filter(emp => emp.status === 'on_break').map(emp => (
                          <div key={emp.id} className="flex items-center justify-between p-2 border rounded">
                            <span>{emp.name}</span>
                            <div className="flex space-x-2">
                              <Badge variant="outline">Break since {emp.breakTime}</Badge>
                              <Button size="sm">Return</Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {mockEmployees.map((employee) => (
              <div key={employee.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(employee.status)}
                  <div>
                    <div className="font-medium">{employee.name}</div>
                    <div className="text-sm text-gray-500">
                      {employee.role} • Clocked in: {employee.clockInTime}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="text-sm font-medium">${employee.sales.toFixed(2)}</div>
                    <div className="text-xs text-gray-500">{employee.transactions} trans</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">{employee.hoursWorked}h</div>
                    <div className="text-xs text-gray-500">worked</div>
                  </div>
                  <Badge className={getStatusColor(employee.status)}>
                    {employee.status.replace('_', ' ')}
                  </Badge>
                  
                  <div className="flex space-x-1">
                    {employee.status === 'active' && (
                      <Button size="sm" variant="outline">
                        <Coffee className="h-4 w-4" />
                      </Button>
                    )}
                    <Button size="sm" variant="outline">
                      <UserX className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Rush Hour Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Timer className="h-5 w-5" />
            <span>Rush Period Analysis</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            {shiftMetrics.rushPeriods.map((period, index) => (
              <div key={index} className="p-4 bg-blue-50 rounded-lg">
                <div className="text-lg font-bold text-blue-800">{period.time}</div>
                <div className="text-sm text-blue-600">{period.transactions} transactions</div>
                <div className="text-xs text-blue-500">
                  {period.transactions > 15 ? 'High Rush' : period.transactions > 10 ? 'Medium Rush' : 'Low Activity'}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}