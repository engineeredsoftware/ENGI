'use client';

import React, { useState, useEffect } from 'react';
import { CheckCircleIcon, XCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/solid';

interface HealthCheck {
  name: string;
  status: 'healthy' | 'unhealthy' | 'degraded';
  responseTime?: number;
  error?: string;
  details?: Record<string, any>;
}

interface HealthStatus {
  status: 'healthy' | 'unhealthy' | 'degraded';
  timestamp: string;
  uptime: number;
  version: string;
  environment: string;
  services: HealthCheck[];
  summary: {
    total: number;
    healthy: number;
    unhealthy: number;
    degraded: number;
  };
}

const StatusIcon = ({ status }: { status: 'healthy' | 'unhealthy' | 'degraded' }) => {
  switch (status) {
    case 'healthy':
      return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
    case 'degraded':
      return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />;
    case 'unhealthy':
      return <XCircleIcon className="h-5 w-5 text-red-500" />;
  }
};

const StatusBadge = ({ status }: { status: 'healthy' | 'unhealthy' | 'degraded' }) => {
  const colors = {
    healthy: 'bg-green-100 text-green-800 border-green-200',
    degraded: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    unhealthy: 'bg-red-100 text-red-800 border-red-200'
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${colors[status]}`}>
      <StatusIcon status={status} />
      <span className="ml-1 capitalize">{status}</span>
    </span>
  );
};

const formatUptime = (seconds: number): string => {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (days > 0) return `${days}d ${hours}h ${minutes}m`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
};

export default function HealthDashboard() {
  const [healthData, setHealthData] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchHealthData = async () => {
    try {
      setError(null);
      const response = await fetch('/api/health');
      const data = await response.json();
      
      if (response.ok) {
        setHealthData(data);
        setLastUpdated(new Date());
      } else {
        setError(data.error || 'Failed to fetch health data');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealthData();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchHealthData, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-red-200 p-6">
        <div className="flex items-center text-red-600 mb-4">
          <XCircleIcon className="h-6 w-6 mr-2" />
          <h3 className="text-lg font-semibold">Health Check Error</h3>
        </div>
        <p className="text-red-700 mb-4">{error}</p>
        <button
          onClick={fetchHealthData}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!healthData) return null;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <StatusIcon status={healthData.status} />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">System Health</h2>
              <p className="text-sm text-gray-500">
                Last updated: {lastUpdated?.toLocaleTimeString()}
              </p>
            </div>
          </div>
          <StatusBadge status={healthData.status} />
        </div>
      </div>

      {/* Summary Stats */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="grid grid-cols-2 laptop:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{formatUptime(healthData.uptime)}</div>
            <div className="text-sm text-gray-500">Uptime</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{healthData.summary.healthy}</div>
            <div className="text-sm text-gray-500">Healthy</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">{healthData.summary.degraded}</div>
            <div className="text-sm text-gray-500">Degraded</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{healthData.summary.unhealthy}</div>
            <div className="text-sm text-gray-500">Unhealthy</div>
          </div>
        </div>
      </div>

      {/* Service Details */}
      <div className="px-6 py-4">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Service Status</h3>
        <div className="space-y-3">
          {healthData.services.map((service) => (
            <div key={service.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <StatusIcon status={service.status} />
                <div>
                  <div className="font-medium text-gray-900 capitalize">
                    {service.name.replace('_', ' ')}
                  </div>
                  {service.error && (
                    <div className="text-sm text-red-600">{service.error}</div>
                  )}
                  {service.details && (
                    <div className="text-xs text-gray-500">
                      {Object.entries(service.details).map(([key, value]) => (
                        <span key={key} className="mr-3">
                          {key}: {String(value)}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="text-right">
                <StatusBadge status={service.status} />
                {service.responseTime && (
                  <div className="text-xs text-gray-500 mt-1">
                    {service.responseTime}ms
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-200 px-6 py-3 bg-gray-50 rounded-b-lg">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Version: {healthData.version}</span>
          <span>Environment: {healthData.environment}</span>
          <button
            onClick={fetchHealthData}
            className="text-blue-600 hover:text-blue-800 transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>
    </div>
  );
}