/* eslint-disable react/no-unescaped-entities */
'use client';
import { cn } from '@/lib/utils';
import React from 'react';
import { BentoGrid, BentoGridItem } from '../ui/bento-grid';
import {
  IconShield,
  IconClock,
  IconCloud,
  IconCalendarMonth,
  IconTableColumn,
  IconActivity,
  IconMapPin,
  IconSettings,
  IconDatabase,
  IconUsers
} from '@tabler/icons-react';
import DigitalClock from '../clock/clock';
import DateComponent from '../date/date';
import WeatherComponent from '../weather/weather';
import NetworkSpeed from '../networkspeed/networkspeed';
import { NetworkOverview } from '../admin/network-overview';
import { SystemMonitoring } from '../admin/system-monitoring';
import { SuperAdminQuickActions } from '../admin/superadmin-quick-actions';
import { LocationHealthDashboard } from '../admin/location-health-dashboard';
import { NetworkWideAnalytics } from '../admin/network-wide-analytics';

export function SuperAdminBentoGrid() {
  return (
    <BentoGrid className="w-full mx-auto md:auto-rows-[20rem]">
      {superAdminItems.map((item, i) => (
        <BentoGridItem
          key={i}
          title={item.title}
          description={item.description}
          header={item.header}
          className={cn('[&>p:text-lg]', item.className)}
          icon={item.icon}
        />
      ))}
    </BentoGrid>
  );
}

const superAdminItems = [
  {
    title: "Network Control Center",
    description: <span className="text-sm">Monitor and manage all network devices and approvals.</span>,
    header: <NetworkOverview />,
    className: 'md:col-span-2',
    icon: <IconShield className="h-4 w-4 text-blue-500" />,
  },
  {
    title: "Network Analytics",
    description: <span className="text-sm">Real-time performance metrics across all locations.</span>,
    header: <NetworkWideAnalytics />,
    className: 'md:col-span-2',
    icon: <IconTableColumn className="h-4 w-4 text-green-500" />,
  },
  {
    title: "SuperAdmin Controls",
    description: <span className="text-sm">Quick access to all administrative functions.</span>,
    header: <SuperAdminQuickActions />,
    className: 'md:col-span-2',
    icon: <IconSettings className="h-4 w-4 text-purple-500" />,
  },
  {
    title: "System Health Monitor",
    description: <span className="text-sm">Real-time system performance and alerts.</span>,
    header: <SystemMonitoring />,
    className: 'md:col-span-2',
    icon: <IconActivity className="h-4 w-4 text-red-500" />,
  },
  {
    title: "Location Operations",
    description: <span className="text-sm">Monitor all store locations and their operational status.</span>,
    header: <LocationHealthDashboard />,
    className: 'md:col-span-2',
    icon: <IconMapPin className="h-4 w-4 text-orange-500" />,
  },
  {
    title: "System Time",
    description: <span className="text-sm">Current time and operational hours.</span>,
    header: <DigitalClock />,
    className: 'md:col-span-1',
    icon: <IconClock className="h-4 w-4 text-blue-600" />,
  },
  {
    title: "Network Connectivity",
    description: <span className="text-sm">Monitor network performance and speed.</span>,
    header: <NetworkSpeed />,
    className: 'md:col-span-1',
    icon: <IconCloud className="h-4 w-4 text-cyan-500" />,
  },
  {
    title: "Current Date",
    description: <span className="text-sm">Today's date and calendar.</span>,
    header: <DateComponent />,
    className: 'md:col-span-1',
    icon: <IconCalendarMonth className="h-4 w-4 text-indigo-500" />,
  },
  {
    title: "Weather Status",
    description: <span className="text-sm">Environmental conditions for operations.</span>,
    header: <WeatherComponent />,
    className: 'md:col-span-1',
    icon: <IconCloud className="h-4 w-4 text-gray-500" />,
  },
];