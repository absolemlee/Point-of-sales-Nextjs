'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';
import { 
  MapPin, 
  TrendingUp, 
  DollarSign, 
  Users, 
  Package, 
  Clock,
  Target,
  Zap,
  ArrowUp,
  ArrowDown,
  Calendar,
  Download
} from 'lucide-react';

interface LocationAnalytics {
  locationId: string;
  locationName: string;
  type: string;
  sales: {
    total: number;
    growth: number;
    transactions: number;
    averageTransaction: number;
  };
  performance: {
    hourlyAverage: number;
    peakHour: string;
    conversionRate: number;
    customerSatisfaction: number;
  };
  inventory: {
    turnoverRate: number;
    stockAccuracy: number;
    wastePercentage: number;
  };
  staff: {
    productivity: number;
    utilization: number;
    satisfaction: number;
  };
}

interface SalesData {
  date: string;
  [locationId: string]: any;
}

interface ComparisonMetric {
  metric: string;
  [locationId: string]: any;
}

export function LocationBasedAnalytics() {
  const [selectedPeriod, setSelectedPeriod] = useState('7d');
  const [selectedComparison, setSelectedComparison] = useState('all');
  const [locationAnalytics, setLocationAnalytics] = useState<LocationAnalytics[]>([]);
  const [salesData, setSalesData] = useState<SalesData[]>([]);
  const [comparisonData, setComparisonData] = useState<ComparisonMetric[]>([]);

  const locations = [
    { id: 'loc-1', name: 'Downtown Coffee Shop', type: 'STATIC' },
    { id: 'loc-2', name: 'Mall Kiosk', type: 'POPUP' },
    { id: 'loc-3', name: 'University Partnership', type: 'VENUE_PARTNERSHIP' }
  ];

  // Mock data generation
  useEffect(() => {
    // Generate location analytics
    const analytics: LocationAnalytics[] = [
      {
        locationId: 'loc-1',
        locationName: 'Downtown Coffee Shop',
        type: 'STATIC',
        sales: { total: 32450.80, growth: 15.3, transactions: 1245, averageTransaction: 26.08 },
        performance: { hourlyAverage: 15.3, peakHour: '08:00', conversionRate: 78.5, customerSatisfaction: 4.6 },
        inventory: { turnoverRate: 12.5, stockAccuracy: 94.2, wastePercentage: 3.8 },
        staff: { productivity: 87.5, utilization: 82.3, satisfaction: 4.2 }
      },
      {
        locationId: 'loc-2',
        locationName: 'Mall Kiosk',
        type: 'POPUP',
        sales: { total: 21340.60, growth: 8.7, transactions: 892, averageTransaction: 23.93 },
        performance: { hourlyAverage: 12.1, peakHour: '14:00', conversionRate: 65.2, customerSatisfaction: 4.3 },
        inventory: { turnoverRate: 15.8, stockAccuracy: 91.7, wastePercentage: 5.2 },
        staff: { productivity: 79.2, utilization: 88.1, satisfaction: 4.0 }
      },
      {
        locationId: 'loc-3',
        locationName: 'University Partnership',
        type: 'VENUE_PARTNERSHIP',
        sales: { total: 15670.30, growth: 22.1, transactions: 654, averageTransaction: 23.97 },
        performance: { hourlyAverage: 9.5, peakHour: '10:00', conversionRate: 71.8, customerSatisfaction: 4.4 },
        inventory: { turnoverRate: 18.3, stockAccuracy: 89.5, wastePercentage: 4.1 },
        staff: { productivity: 92.1, utilization: 75.6, satisfaction: 4.5 }
      }
    ];
    setLocationAnalytics(analytics);

    // Generate sales data for charts
    const generateSalesData = () => {
      const days = [];
      for (let i = 7; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dayData: SalesData = {
          date: date.toISOString().split('T')[0],
          'loc-1': Math.floor(Math.random() * 1000) + 800,
          'loc-2': Math.floor(Math.random() * 800) + 500,
          'loc-3': Math.floor(Math.random() * 600) + 300
        };
        days.push(dayData);
      }
      return days;
    };
    setSalesData(generateSalesData());

    // Generate comparison data
    const comparison: ComparisonMetric[] = [
      { metric: 'Total Sales ($)', 'loc-1': 32450, 'loc-2': 21340, 'loc-3': 15670 },
      { metric: 'Transactions', 'loc-1': 1245, 'loc-2': 892, 'loc-3': 654 },
      { metric: 'Avg Transaction ($)', 'loc-1': 26.08, 'loc-2': 23.93, 'loc-3': 23.97 },
      { metric: 'Growth Rate (%)', 'loc-1': 15.3, 'loc-2': 8.7, 'loc-3': 22.1 },
      { metric: 'Customer Satisfaction', 'loc-1': 4.6, 'loc-2': 4.3, 'loc-3': 4.4 }
    ];
    setComparisonData(comparison);
  }, []);

  const getLocationColor = (index: number) => {
    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];
    return colors[index % colors.length];
  };

  const totalSales = locationAnalytics.reduce((sum, loc) => sum + loc.sales.total, 0);
  const totalTransactions = locationAnalytics.reduce((sum, loc) => sum + loc.sales.transactions, 0);
  const averageGrowth = locationAnalytics.reduce((sum, loc) => sum + loc.sales.growth, 0) / locationAnalytics.length;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Location Analytics</h1>
            <p className="text-gray-600 mt-1">Compare performance across all locations</p>
          </div>
          <div className="flex space-x-3">
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
                <SelectItem value="1y">Last year</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                  <p className="text-3xl font-bold text-green-600">
                    ${totalSales.toLocaleString()}
                  </p>
                  <p className="text-sm text-green-600 flex items-center mt-1">
                    <ArrowUp className="h-4 w-4 mr-1" />
                    +{averageGrowth.toFixed(1)}% growth
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Transactions</p>
                  <p className="text-3xl font-bold text-blue-600">
                    {totalTransactions.toLocaleString()}
                  </p>
                  <p className="text-sm text-blue-600 flex items-center mt-1">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    Across {locationAnalytics.length} locations
                  </p>
                </div>
                <Target className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Best Performer</p>
                  <p className="text-xl font-bold text-purple-600">
                    {locationAnalytics.find(l => l.sales.growth === Math.max(...locationAnalytics.map(loc => loc.sales.growth)))?.locationName}
                  </p>
                  <p className="text-sm text-purple-600 flex items-center mt-1">
                    <Zap className="h-4 w-4 mr-1" />
                    +{Math.max(...locationAnalytics.map(loc => loc.sales.growth)).toFixed(1)}% growth
                  </p>
                </div>
                <Users className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Locations</p>
                  <p className="text-3xl font-bold text-orange-600">
                    {locationAnalytics.length}
                  </p>
                  <p className="text-sm text-orange-600 flex items-center mt-1">
                    <MapPin className="h-4 w-4 mr-1" />
                    All operational
                  </p>
                </div>
                <Package className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Analytics Tabs */}
        <Tabs defaultValue="sales" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="sales">Sales Performance</TabsTrigger>
            <TabsTrigger value="comparison">Location Comparison</TabsTrigger>
            <TabsTrigger value="operations">Operations</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
          </TabsList>
          
          <TabsContent value="sales" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Sales Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={salesData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      {locations.map((location, index) => (
                        <Line
                          key={location.id}
                          type="monotone"
                          dataKey={location.id}
                          stroke={getLocationColor(index)}
                          strokeWidth={2}
                          name={location.name}
                        />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Revenue Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={locationAnalytics.map((loc, index) => ({
                          name: loc.locationName,
                          value: loc.sales.total,
                          fill: getLocationColor(index)
                        }))}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        label={(props: any) => `${props.name}: ${(props.percent * 100).toFixed(0)}%`}
                      />
                      <Tooltip formatter={(value: number) => [`$${value.toLocaleString()}`, 'Revenue']} />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Location Performance Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {locationAnalytics.map((location, index) => (
                    <div key={location.locationId} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-lg">{location.locationName}</h3>
                        <Badge style={{ backgroundColor: getLocationColor(index), color: 'white' }}>
                          {location.type}
                        </Badge>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Revenue:</span>
                          <span className="font-bold">${location.sales.total.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Growth:</span>
                          <span className={`font-bold ${location.sales.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {location.sales.growth >= 0 ? '+' : ''}{location.sales.growth}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Transactions:</span>
                          <span className="font-bold">{location.sales.transactions}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Avg. Transaction:</span>
                          <span className="font-bold">${location.sales.averageTransaction.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="comparison" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Location Comparison</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={comparisonData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="metric" />
                    <YAxis />
                    <Tooltip />
                    {locations.map((location, index) => (
                      <Bar
                        key={location.id}
                        dataKey={location.id}
                        fill={getLocationColor(index)}
                        name={location.name}
                      />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Performance Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {locationAnalytics.map((location, index) => (
                      <div key={location.locationId}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">{location.locationName}</span>
                          <Badge style={{ backgroundColor: getLocationColor(index), color: 'white' }}>
                            {location.type}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Conversion Rate:</span>
                            <span className="ml-2 font-semibold">{location.performance.conversionRate}%</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Peak Hour:</span>
                            <span className="ml-2 font-semibold">{location.performance.peakHour}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Satisfaction:</span>
                            <span className="ml-2 font-semibold">{location.performance.customerSatisfaction}/5</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Hourly Avg:</span>
                            <span className="ml-2 font-semibold">{location.performance.hourlyAverage} tx/hr</span>
                          </div>
                        </div>
                        {index < locationAnalytics.length - 1 && <hr className="mt-4" />}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Operational Efficiency</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {locationAnalytics.map((location, index) => (
                      <div key={location.locationId}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">{location.locationName}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Staff Productivity:</span>
                            <span className="ml-2 font-semibold">{location.staff.productivity}%</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Utilization:</span>
                            <span className="ml-2 font-semibold">{location.staff.utilization}%</span>
                          </div>
                          <div>  
                            <span className="text-gray-600">Inventory Turnover:</span>
                            <span className="ml-2 font-semibold">{location.inventory.turnoverRate}x</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Stock Accuracy:</span>
                            <span className="ml-2 font-semibold">{location.inventory.stockAccuracy}%</span>
                          </div>
                        </div>
                        {index < locationAnalytics.length - 1 && <hr className="mt-4" />}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="operations" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Inventory Health</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {locationAnalytics.map((location) => (
                      <div key={location.locationId} className="border-b pb-3 last:border-b-0">
                        <h4 className="font-medium mb-2">{location.locationName}</h4>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span>Turnover Rate:</span>
                            <span className="font-semibold">{location.inventory.turnoverRate}x</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Stock Accuracy:</span>
                            <span className="font-semibold">{location.inventory.stockAccuracy}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Waste:</span>
                            <span className="font-semibold text-red-600">{location.inventory.wastePercentage}%</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Staff Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {locationAnalytics.map((location) => (
                      <div key={location.locationId} className="border-b pb-3 last:border-b-0">
                        <h4 className="font-medium mb-2">{location.locationName}</h4>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span>Productivity:</span>
                            <span className="font-semibold">{location.staff.productivity}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Utilization:</span>
                            <span className="font-semibold">{location.staff.utilization}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Satisfaction:</span>
                            <span className="font-semibold">{location.staff.satisfaction}/5</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Customer Experience</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {locationAnalytics.map((location) => (
                      <div key={location.locationId} className="border-b pb-3 last:border-b-0">
                        <h4 className="font-medium mb-2">{location.locationName}</h4>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span>Satisfaction:</span>
                            <span className="font-semibold">{location.performance.customerSatisfaction}/5</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Conversion:</span>
                            <span className="font-semibold">{location.performance.conversionRate}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Peak Time:</span>
                            <span className="font-semibold">{location.performance.peakHour}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="insights" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Key Insights</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-green-50 rounded-lg border-l-4 border-green-400">
                      <h4 className="font-semibold text-green-800">Top Performer</h4>
                      <p className="text-green-700 text-sm mt-1">
                        University Partnership shows the highest growth rate at 22.1%, indicating strong market penetration in the education sector.
                      </p>
                    </div>
                    
                    <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                      <h4 className="font-semibold text-blue-800">Revenue Leader</h4>
                      <p className="text-blue-700 text-sm mt-1">
                        Downtown Coffee Shop generates the highest revenue at $32,450, leveraging prime location and consistent foot traffic.
                      </p>
                    </div>
                    
                    <div className="p-4 bg-orange-50 rounded-lg border-l-4 border-orange-400">
                      <h4 className="font-semibold text-orange-800">Optimization Opportunity</h4>
                      <p className="text-orange-700 text-sm mt-1">
                        Mall Kiosk shows lower conversion rate (65.2%) compared to other locations, suggesting potential for staff training or layout optimization.
                      </p>
                    </div>
                    
                    <div className="p-4 bg-purple-50 rounded-lg border-l-4 border-purple-400">
                      <h4 className="font-semibold text-purple-800">Operational Excellence</h4>
                      <p className="text-purple-700 text-sm mt-1">
                        University Partnership has the highest staff productivity (92.1%) and lowest waste percentage (4.1%).
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Recommended Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-semibold mb-2">🎯 Focus Areas</h4>
                      <ul className="text-sm space-y-1">
                        <li>• Implement Mall Kiosk conversion strategies at other locations</li>
                        <li>• Scale University Partnership model to similar venues</li>
                        <li>• Optimize Downtown shop's peak hour staffing</li>
                      </ul>
                    </div>
                    
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-semibold mb-2">📈 Growth Opportunities</h4>
                      <ul className="text-sm space-y-1">
                        <li>• Expand venue partnership program</li>
                        <li>• Introduce location-specific product offerings</li>
                        <li>• Implement dynamic pricing during peak hours</li>
                      </ul>
                    </div>
                    
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-semibold mb-2">⚡ Quick Wins</h4>
                      <ul className="text-sm space-y-1">
                        <li>• Cross-train staff on best practices from top performers</li>
                        <li>• Implement inventory optimization at Mall Kiosk</li>
                        <li>• Deploy customer feedback system across all locations</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}