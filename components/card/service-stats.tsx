'use client';
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { HandHeart, Clock, CheckCircle, AlertCircle, TrendingUp } from 'lucide-react';

interface ServiceStats {
  totalServices: number;
  activeOffers: number;
  completedAgreements: number;
  pendingApplications: number;
  totalRevenue: number;
  averageCompletionTime: number;
}

export function ServiceStatsCard() {
  const [stats, setStats] = useState<ServiceStats>({
    totalServices: 0,
    activeOffers: 0,
    completedAgreements: 0,
    pendingApplications: 0,
    totalRevenue: 0,
    averageCompletionTime: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServiceStats = async () => {
      try {
        // In a real implementation, these would be actual API calls
        // For now, we'll use fallback data
        const mockStats: ServiceStats = {
          totalServices: 15,
          activeOffers: 8,
          completedAgreements: 24,
          pendingApplications: 5,
          totalRevenue: 3250,
          averageCompletionTime: 2.5
        };

        // Simulate API calls
        setTimeout(() => {
          setStats(mockStats);
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Failed to fetch service stats:', error);
        setLoading(false);
      }
    };

    fetchServiceStats();
  }, []);

  if (loading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HandHeart className="h-5 w-5" />
            Service Exchange Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <HandHeart className="h-5 w-5 text-blue-600" />
          Service Exchange Overview
        </CardTitle>
        <CardDescription>
          Real-time service exchange metrics and performance indicators
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
              <HandHeart className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Services</p>
              <p className="text-lg font-semibold">{stats.totalServices}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Active Offers</p>
              <p className="text-lg font-semibold">{stats.activeOffers}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
              <CheckCircle className="h-4 w-4 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-lg font-semibold">{stats.completedAgreements}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center">
              <Clock className="h-4 w-4 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-lg font-semibold">{stats.pendingApplications}</p>
            </div>
          </div>
        </div>
        
        <div className="pt-2 border-t">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Service Revenue</span>
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              ${stats.totalRevenue.toLocaleString()}
            </Badge>
          </div>
          <div className="flex justify-between items-center mt-2">
            <span className="text-sm text-gray-600">Avg. Completion</span>
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              {stats.averageCompletionTime}h
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}