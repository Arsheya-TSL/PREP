import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { WorldClockConfig } from '../../lib/utilityTypes';

interface WorldClockWidgetProps {
  config: WorldClockConfig;
  size: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export default function WorldClockWidget({ config, size, className = '' }: WorldClockWidgetProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const { cities, format, showDate, showBadges, tickMs } = config;
  
  // Update time every tickMs
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, tickMs);
    
    return () => clearInterval(interval);
  }, [tickMs]);
  
  // Format time based on config
  const formatTime = (timezone: string) => {
    const options: Intl.DateTimeFormatOptions = {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: timezone,
      hour12: format.includes('A')
    };
    
    if (format.includes('ss')) {
      options.second = '2-digit';
    }
    
    return new Intl.DateTimeFormat('en-GB', options).format(currentTime);
  };
  
  // Format date
  const formatDate = (timezone: string) => {
    return new Intl.DateTimeFormat('en-GB', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      timeZone: timezone
    }).format(currentTime);
  };
  
  // Check if it's day or night
  const isDayTime = (timezone: string) => {
    const hour = parseInt(new Intl.DateTimeFormat('en-GB', {
      hour: '2-digit',
      timeZone: timezone,
      hour12: false
    }).format(currentTime));
    
    return hour >= 6 && hour < 18;
  };
  
  // Get size-specific styling
  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return {
          container: 'p-4',
          title: 'text-lg font-semibold',
          time: 'text-2xl font-bold',
          city: 'text-sm',
          grid: 'grid-cols-2 gap-3'
        };
      case 'md':
        return {
          container: 'p-5',
          title: 'text-xl font-semibold',
          time: 'text-3xl font-bold',
          city: 'text-base',
          grid: 'grid-cols-3 gap-4'
        };
      case 'lg':
        return {
          container: 'p-6',
          title: 'text-2xl font-semibold',
          time: 'text-4xl font-bold',
          city: 'text-lg',
          grid: 'grid-cols-4 gap-5'
        };
      case 'xl':
        return {
          container: 'p-8',
          title: 'text-3xl font-semibold',
          time: 'text-5xl font-bold',
          city: 'text-xl',
          grid: 'grid-cols-2 gap-6'
        };
    }
  };
  
  const styles = getSizeStyles();
  
  return (
    <Card className="bg-card border border-border">
      <CardHeader className={`${styles.container} pb-3`}>
        <CardTitle className={`${styles.title} text-neutral-800 flex items-center justify-between`}>
          <span>World Clock</span>
          <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
            AI created
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className={`${styles.container} pt-0 flex-1`}>
        <div className={`${styles.grid} h-full`}>
          {cities.map((city, index) => (
            <div key={index} className="flex flex-col items-center justify-center text-center space-y-2">
              <div className={`${styles.city} font-medium text-neutral-600`}>
                {city.label}
              </div>
              
              <div className={`${styles.time} text-neutral-900`}>
                {formatTime(city.tz)}
              </div>
              
              {showDate && (
                <div className="text-xs text-neutral-500">
                  {formatDate(city.tz)}
                </div>
              )}
              
              {showBadges && (
                <Badge 
                  variant="outline" 
                  className={`text-xs ${
                    isDayTime(city.tz) 
                      ? 'bg-yellow-50 text-yellow-700 border-yellow-200' 
                      : 'bg-blue-50 text-blue-700 border-blue-200'
                  }`}
                >
                  {isDayTime(city.tz) ? '☀️ Day' : '🌙 Night'}
                </Badge>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
} 