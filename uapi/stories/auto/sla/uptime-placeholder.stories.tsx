/**
 * Source: public-docs/sla.md (Uptime Monitoring section)
 * Screenshot: uptime-placeholder.png
 */
import React from 'react';
import HealthDashboard from '@/components/bitcode/health/HealthDashboard/HealthDashboard';

export default {
  title: 'Docs/AutoScreenshots/Sla/Uptime',
  parameters: { layout: 'fullscreen' },
};

export const Uptime = {
  render: () => (
    <div style={{
      background: '#0f0f0f',
      width: '100vw',
      height: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '2rem',
      boxSizing: 'border-box',
    }}>
      <div style={{ 
        width: '100%', 
        maxWidth: '1200px',
        height: 'auto'
      }}>
        <HealthDashboard />
      </div>
    </div>
  ),
};
