'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LocationBasedAnalytics } from '@/components/analytics/location-based-analytics';
import { Separator } from '@/components/ui/separator';
import { BarChart3, MapPin, Package, TrendingUp } from 'lucide-react';
import Link from 'next/link';

const Page = () => {
  return (
    <div className="w-full min-h-screen bg-gray-50">
      <Tabs defaultValue="overview" className="w-full">
        <div className="border-b bg-white px-6 py-4">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Analytics Dashboard</h1>
            <TabsList className="grid w-full max-w-2xl grid-cols-4">
              <TabsTrigger value="overview" className="flex items-center space-x-2">
                <BarChart3 className="h-4 w-4" />
                <span>Overview</span>
              </TabsTrigger>
              <TabsTrigger value="locations" className="flex items-center space-x-2">
                <MapPin className="h-4 w-4" />
                <span>Locations</span>
              </TabsTrigger>
              <TabsTrigger value="products" className="flex items-center space-x-2">
                <Package className="h-4 w-4" />
                <span>Products</span>
              </TabsTrigger>
              <TabsTrigger value="revenue" className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4" />
                <span>Revenue</span>
              </TabsTrigger>
            </TabsList>
          </div>
        </div>
        
        <TabsContent value="overview" className="mt-0">
          <div className="w-full h-full flex flex-col items-center p-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 w-full h-full">
        <Card className="w-full h-full flex flex-col">
          <CardHeader>
            <CardTitle>Product Analytics</CardTitle>
            <CardDescription>
              Discover insights and analytics about our diverse product range.
              Track sales performance and inventory levels.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-grow pt-5">
            <div className="p-4">
              <svg viewBox="0 0 100 50" className="w-full h-auto">
                <line
                  x1="0"
                  y1="45"
                  x2="100"
                  y2="45"
                  stroke="black"
                  strokeWidth="0.5"
                />
                <line
                  x1="5"
                  y1="0"
                  x2="5"
                  y2="50"
                  stroke="black"
                  strokeWidth="0.5"
                />
                <polyline
                  fill="none"
                  stroke="blue"
                  strokeWidth="0.5"
                  points="5,45 15,30 25,25 35,20 45,15 55,10 65,5 75,8 85,12 95,10"
                />
                <circle cx="5" cy="45" r="1" fill="blue" />
                <circle cx="15" cy="30" r="1" fill="blue" />
                <circle cx="25" cy="25" r="1" fill="blue" />
                <circle cx="35" cy="20" r="1" fill="blue" />
                <circle cx="45" cy="15" r="1" fill="blue" />
                <circle cx="55" cy="10" r="1" fill="blue" />
                <circle cx="65" cy="5" r="1" fill="blue" />
                <circle cx="75" cy="8" r="1" fill="blue" />
                <circle cx="85" cy="12" r="1" fill="blue" />
                <circle cx="95" cy="10" r="1" fill="blue" />
              </svg>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" asChild>
              <Link href={'/analytics/product'}>Go</Link>
            </Button>
          </CardFooter>
        </Card>

        <Card className="w-full h-full flex flex-col">
          <CardHeader>
            <CardTitle>Service Analytics</CardTitle>
            <CardDescription>
              Monitor service exchange performance, completion rates, and associate engagement.
              Track service delivery metrics across locations.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-grow pt-5">
            <div className="p-4">
              <svg viewBox="0 0 100 50" className="w-full h-auto">
                <line
                  x1="0"
                  y1="45"
                  x2="100"
                  y2="45"
                  stroke="black"
                  strokeWidth="0.5"
                />
                <line
                  x1="5"
                  y1="0"
                  x2="5"
                  y2="50"
                  stroke="black"
                  strokeWidth="0.5"
                />
                <polyline
                  fill="none"
                  stroke="green"
                  strokeWidth="0.5"
                  points="5,40 15,35 25,30 35,25 45,20 55,15 65,12 75,10 85,8 95,5"
                />
                <circle cx="5" cy="40" r="1" fill="green" />
                <circle cx="15" cy="35" r="1" fill="green" />
                <circle cx="25" cy="30" r="1" fill="green" />
                <circle cx="35" cy="25" r="1" fill="green" />
                <circle cx="45" cy="20" r="1" fill="green" />
                <circle cx="55" cy="15" r="1" fill="green" />
                <circle cx="65" cy="12" r="1" fill="green" />
                <circle cx="75" cy="10" r="1" fill="green" />
                <circle cx="85" cy="8" r="1" fill="green" />
                <circle cx="95" cy="5" r="1" fill="green" />
              </svg>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" asChild>
              <Link href={'/services'}>Go</Link>
            </Button>
          </CardFooter>
        </Card>

        <Card className="w-full h-full flex flex-col">
          <CardHeader>
            <CardTitle>Revenue Analytics</CardTitle>
            <CardDescription>
              Track revenue trends from both product sales and service exchanges.
              Monitor financial performance across all business streams.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-grow pt-5">
            <div className="p-4">
              <svg viewBox="0 0 100 50" className="w-full h-auto">
                <line
                  x1="0"
                  y1="45"
                  x2="100"
                  y2="45"
                  stroke="black"
                  strokeWidth="0.5"
                />
                <line
                  x1="5"
                  y1="0"
                  x2="5"
                  y2="50"
                  stroke="black"
                  strokeWidth="0.5"
                />
                <polyline
                  fill="none"
                  stroke="blue"
                  strokeWidth="0.5"
                  points="5,45 15,40 25,35 35,30 45,25 55,20 65,15 75,20 85,25 95,30"
                />
                <circle cx="5" cy="45" r="1" fill="blue" />
                <circle cx="15" cy="40" r="1" fill="blue" />
                <circle cx="25" cy="35" r="1" fill="blue" />
                <circle cx="35" cy="30" r="1" fill="blue" />
                <circle cx="45" cy="25" r="1" fill="blue" />
                <circle cx="55" cy="20" r="1" fill="blue" />
                <circle cx="65" cy="15" r="1" fill="blue" />
                <circle cx="75" cy="20" r="1" fill="blue" />
                <circle cx="85" cy="25" r="1" fill="blue" />
                <circle cx="95" cy="30" r="1" fill="blue" />
              </svg>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" asChild>
              <Link href={'/analytics/income'}>Go</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
          </div>
        </TabsContent>
        
        <TabsContent value="locations" className="mt-0">
          <LocationBasedAnalytics />
        </TabsContent>
        
        <TabsContent value="products" className="mt-0">
          <div className="p-6">
            <div className="max-w-7xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="w-full h-full flex flex-col">
                  <CardHeader>
                    <CardTitle>Total Products Sale</CardTitle>
                    <CardDescription>
                      Explore insights and analytics about our total product sales.
                      Click the button below to view detailed product analytics.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow pt-5">
                    <div className="p-4">
                      <svg viewBox="0 0 100 50" className="w-full h-auto">
                        <line
                          x1="0"
                          y1="45"
                          x2="100"
                          y2="45"
                          stroke="black"
                          strokeWidth="0.5"
                        />
                        <line
                          x1="5"
                          y1="0"
                          x2="5"
                          y2="50"
                          stroke="black"
                          strokeWidth="0.5"
                        />
                        <polyline
                          fill="none"
                          stroke="blue"
                          strokeWidth="0.5"
                          points="5,45 15,30 25,25 35,20 45,15 55,10 65,5 75,8 85,12 95,10"
                        />
                        <circle cx="5" cy="45" r="1" fill="blue" />
                        <circle cx="15" cy="30" r="1" fill="blue" />
                        <circle cx="25" cy="25" r="1" fill="blue" />
                        <circle cx="35" cy="20" r="1" fill="blue" />
                        <circle cx="45" cy="15" r="1" fill="blue" />
                        <circle cx="55" cy="10" r="1" fill="blue" />
                        <circle cx="65" cy="5" r="1" fill="blue" />
                        <circle cx="75" cy="8" r="1" fill="blue" />
                        <circle cx="85" cy="12" r="1" fill="blue" />
                        <circle cx="95" cy="10" r="1" fill="blue" />
                      </svg>
                    </div>
                    <Separator />
                    <div className="flex items-center p-4">
                      <div className="flex flex-col">
                        <span className="text-xs text-muted-foreground">
                          Total Sales
                        </span>
                        <span className="text-lg font-bold leading-none sm:text-3xl">
                          $1,234
                        </span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full" asChild>
                      <Link href={'/analytics/product'}>View Product Analytics</Link>
                    </Button>
                  </CardFooter>
                </Card>

                <Card className="w-full h-full flex flex-col">
                  <CardHeader>
                    <CardTitle>Product Favorites</CardTitle>
                    <CardDescription>
                      Discover the most popular and favorited products among customers.
                      Analyze trending items and customer preferences.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow pt-5">
                    <div className="p-4">
                      <svg viewBox="0 0 100 50" className="w-full h-auto">
                        <line
                          x1="0"
                          y1="45"
                          x2="100"
                          y2="45"
                          stroke="black"
                          strokeWidth="0.5"
                        />
                        <line
                          x1="5"
                          y1="0"
                          x2="5"
                          y2="50"
                          stroke="black"
                          strokeWidth="0.5"
                        />
                        <polyline
                          fill="none"
                          stroke="green"
                          strokeWidth="0.5"
                          points="5,40 15,35 25,30 35,25 45,28 55,20 65,15 75,18 85,10 95,5"
                        />
                        <circle cx="5" cy="40" r="1" fill="green" />
                        <circle cx="15" cy="35" r="1" fill="green" />
                        <circle cx="25" cy="30" r="1" fill="green" />
                        <circle cx="35" cy="25" r="1" fill="green" />
                        <circle cx="45" cy="28" r="1" fill="green" />
                        <circle cx="55" cy="20" r="1" fill="green" />
                        <circle cx="65" cy="15" r="1" fill="green" />
                        <circle cx="75" cy="18" r="1" fill="green" />
                        <circle cx="85" cy="10" r="1" fill="green" />
                        <circle cx="95" cy="5" r="1" fill="green" />
                      </svg>
                    </div>
                    <Separator />
                    <div className="flex items-center p-4">
                      <div className="flex flex-col">
                        <span className="text-xs text-muted-foreground">
                          Total Favorites
                        </span>
                        <span className="text-lg font-bold leading-none sm:text-3xl">
                          4,567
                        </span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full" asChild>
                      <Link href={'/analytics/product/favorites'}>View Favorites</Link>
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="revenue" className="mt-0">
          <div className="p-6">
            <div className="max-w-7xl mx-auto">
              <Card className="w-full">
                <CardHeader>
                  <CardTitle>Revenue Analytics</CardTitle>
                  <CardDescription>
                    Comprehensive revenue analysis and income tracking.
                    View detailed financial performance across all channels.
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-5">
                  <div className="p-4">
                    <svg viewBox="0 0 100 50" className="w-full h-auto">
                      <line
                        x1="0"
                        y1="45"
                        x2="100"
                        y2="45"
                        stroke="black"
                        strokeWidth="0.5"
                      />
                      <line
                        x1="5"
                        y1="0"
                        x2="5"
                        y2="50"
                        stroke="black"
                        strokeWidth="0.5"
                      />
                      <polyline
                        fill="none"
                        stroke="purple"
                        strokeWidth="0.5"
                        points="5,35 15,32 25,28 35,30 45,25 55,22 65,18 75,20 85,15 95,12"
                      />
                      <circle cx="5" cy="35" r="1" fill="purple" />
                      <circle cx="15" cy="32" r="1" fill="purple" />
                      <circle cx="25" cy="28" r="1" fill="purple" />
                      <circle cx="35" cy="30" r="1" fill="purple" />
                      <circle cx="45" cy="25" r="1" fill="purple" />
                      <circle cx="55" cy="22" r="1" fill="purple" />
                      <circle cx="65" cy="18" r="1" fill="purple" />
                      <circle cx="75" cy="20" r="1" fill="purple" />
                      <circle cx="85" cy="15" r="1" fill="purple" />
                      <circle cx="95" cy="12" r="1" fill="purple" />
                    </svg>
                  </div>
                  <Separator />
                  <div className="flex items-center p-4">
                    <div className="flex flex-col">
                      <span className="text-xs text-muted-foreground">
                        Total Revenue
                      </span>
                      <span className="text-lg font-bold leading-none sm:text-3xl">
                        $67,890
                      </span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full" asChild>
                    <Link href={'/analytics/income'}>View Revenue Details</Link>
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Page;
