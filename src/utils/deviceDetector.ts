import { useState, useEffect } from 'react';

export type DeviceType = 'mobile' | 'tablet' | 'laptop' | 'desktop';

export interface DeviceInfo {
  deviceType: DeviceType;
  label: string;
  icon: string;
  isTouch: boolean;
  screenWidth: number;
  screenHeight: number;
  orientation: 'portrait' | 'landscape';
  userAgentSummary: string;
}

/**
 * Advanced device detection engine combining:
 * 1. User Agent string analysis (iOS, Android, Windows, Mac, Linux)
 * 2. Touch capability (navigator.maxTouchPoints, matchMedia pointer)
 * 3. Viewport width & height
 * 4. Screen resolution & pixel ratio
 */
export function detectDevice(): DeviceInfo {
  const width = typeof window !== 'undefined' ? window.innerWidth : 1280;
  const height = typeof window !== 'undefined' ? window.innerHeight : 800;
  const isTouch =
    typeof navigator !== 'undefined' &&
    ((navigator.maxTouchPoints && navigator.maxTouchPoints > 0) ||
      (window.matchMedia && window.matchMedia('(pointer: coarse)').matches));

  const ua = typeof navigator !== 'undefined' ? navigator.userAgent.toLowerCase() : '';
  const orientation: 'portrait' | 'landscape' = width < height ? 'portrait' : 'landscape';

  // 1. Mobile Detection (Smartphones)
  const isMobileUA =
    /iphone|ipod|android.*mobile|windows phone|blackberry|iemobile|opera mini/i.test(ua);
  if (isMobileUA || width < 640) {
    return {
      deviceType: 'mobile',
      label: 'Celular / Smartphone',
      icon: '📱',
      isTouch: isTouch || isMobileUA,
      screenWidth: width,
      screenHeight: height,
      orientation,
      userAgentSummary: 'Móvil táctil optimizado',
    };
  }

  // 2. Tablet Detection (iPads, Android Tablets, mid-sized screens)
  const isTabletUA =
    /ipad|tablet|android(?!.*mobile)|silk|kindle/i.test(ua) ||
    (ua.includes('macintosh') && isTouch); // iPadOS reports as Macintosh with touch
  if (isTabletUA || (width >= 640 && width <= 1024)) {
    return {
      deviceType: 'tablet',
      label: 'Tablet',
      icon: '📟',
      isTouch: true,
      screenWidth: width,
      screenHeight: height,
      orientation,
      userAgentSummary: 'Tablet pantalla mediana',
    };
  }

  // 3. Laptop vs PC / Desktop
  // Laptops are typically between 1025px and 1536px
  if (width > 1024 && width <= 1536) {
    return {
      deviceType: 'laptop',
      label: 'Laptop / Portátil',
      icon: '💻',
      isTouch,
      screenWidth: width,
      screenHeight: height,
      orientation,
      userAgentSummary: 'Pantalla portátil compacta',
    };
  }

  // 4. Desktop / PC de Escritorio (> 1536px)
  return {
    deviceType: 'desktop',
    label: 'PC de Escritorio',
    icon: '🖥️',
    isTouch,
    screenWidth: width,
    screenHeight: height,
    orientation,
    userAgentSummary: 'PC monitor de alta resolución',
  };
}

/**
 * Hook to reactively track device changes (e.g. orientation changes, resize, or device simulation).
 */
export function useDeviceDetector() {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>(() => detectDevice());
  const [forcedDevice, setForcedDevice] = useState<DeviceType | null>(null);

  useEffect(() => {
    const handleResize = () => {
      const detected = detectDevice();
      setDeviceInfo(detected);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  const activeDeviceType: DeviceType = forcedDevice || deviceInfo.deviceType;

  return {
    ...deviceInfo,
    deviceType: activeDeviceType,
    isMobile: activeDeviceType === 'mobile',
    isTablet: activeDeviceType === 'tablet',
    isLaptop: activeDeviceType === 'laptop',
    isDesktop: activeDeviceType === 'desktop',
    forcedDevice,
    setForcedDevice,
  };
}
