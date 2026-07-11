"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Dock, DockIcon } from '@/components/bitcode/dock';
import {
  HomeIcon,
  ShoppingCartIcon,
  ChartBarIcon,
  CogIcon,
  BriefcaseIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/solid';
import { buildAuxillariesRoutePath } from '@/app/auxillaries/components/auxillary-pane-meta';
//import { useWeb3 } from '@/hooks/useWeb3';
//import { formatEther } from 'ethers';

interface DockContainerProps {
  className?: string;
}

export const DockContainer = ({ className }: DockContainerProps) => {
  const router = useRouter();
  const { account, bitcodeBalance } = { account: 'XXXX', bitcodeBalance: 100 }
  const [notifications, setNotifications] = useState(0);

  // Animation variants for the notification badge
  const badgeVariants = {
    initial: { scale: 0 },
    animate: { scale: 1 },
    exit: { scale: 0 }
  };

  const dockItems = [
    {
      icon: <HomeIcon className="w-6 h-6" />,
      label: "Home",
      path: "/",
      tooltip: "Home"
    },
    {
      icon: <ChartBarIcon className="w-6 h-6" />,
      label: "Dashboard",
      path: "/dashboard",
      tooltip: `Dashboard - ${bitcodeBalance ? bitcodeBalance : '0'} BTD`
    },
    {
      icon: <ShoppingCartIcon className="w-6 h-6" />,
      label: "Marketplace",
      path: "/marketplace",
      tooltip: "Marketplace"
    },
    {
      icon: <BriefcaseIcon className="w-6 h-6" />,
      label: "Projects",
      path: "/projects",
      tooltip: "Your Projects"
    },
    {
      icon: <ChatBubbleLeftRightIcon className="w-6 h-6" />,
      label: "Chat",
      path: "/chat",
      tooltip: `Messages ${notifications > 0 ? `(${notifications})` : ''}`
    },
    {
      icon: <CogIcon className="w-6 h-6" />,
      label: "Auxillaries",
      path: buildAuxillariesRoutePath('profile'),
      tooltip: account ? `Auxillaries • ${account.slice(0, 6)}...${account.slice(-4)}` : "Auxillaries"
    }
  ];

  useEffect(() => {
    // Example of how to fetch notifications
    const fetchNotifications = async () => {
      try {
        const response = await fetch('/api/auxillaries/notifications?unread_only=1');
        if (!response.ok) throw new Error('Failed to load notifications');
        const data = await response.json();
        const items = Array.isArray(data) ? data : [];
        setNotifications(items.length);
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
      }
    };

    if (account) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 30000); // Poll every 30 seconds
      return () => clearInterval(interval);
    }
  }, [account]);

  return (
    <Dock
      className={`fixed bottom-4 left-1/2 transform -translate-x-1/2 ${className}`}
      magnification={1.2}
      distance={80}
    >
      {dockItems.map((item, index) => (
        <div key={item.label} className="relative group">
          <DockIcon
            className="cursor-pointer transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg p-2"
            onClick={() => router.push(item.path)}
          >
            {item.icon}
            {item.label === 'Chat' && notifications > 0 && (
              <motion.div
                variants={badgeVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center"
              >
                {notifications}
              </motion.div>
            )}
          </DockIcon>
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            {item.tooltip}
          </div>
        </div>
      ))}
    </Dock>
  );
};
