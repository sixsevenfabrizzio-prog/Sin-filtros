import React, { useState } from 'react';
import { Smartphone, Tablet, Laptop, Monitor, Sparkles, Check, ChevronDown } from 'lucide-react';
import { DeviceType, DeviceInfo } from '../utils/deviceDetector.ts';

interface DeviceDetectorBadgeProps {
  deviceInfo: DeviceInfo;
  currentDevice: DeviceType;
  forcedDevice: DeviceType | null;
  onSetForcedDevice: (dev: DeviceType | null) => void;
}

export const DeviceDetectorBadge: React.FC<DeviceDetectorBadgeProps> = ({
  deviceInfo,
  currentDevice,
  forcedDevice,
  onSetForcedDevice,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const getDeviceIcon = (type: DeviceType) => {
    switch (type) {
      case 'mobile':
        return <Smartphone className="w-3.5 h-3.5 text-purple-400" />;
      case 'tablet':
        return <Tablet className="w-3.5 h-3.5 text-blue-400" />;
      case 'laptop':
        return <Laptop className="w-3.5 h-3.5 text-emerald-400" />;
      case 'desktop':
        return <Monitor className="w-3.5 h-3.5 text-amber-400" />;
    }
  };

  const getDeviceLabel = (type: DeviceType) => {
    switch (type) {
      case 'mobile':
        return 'Celular';
      case 'tablet':
        return 'Tablet';
      case 'laptop':
        return 'Laptop';
      case 'desktop':
        return 'PC';
    }
  };

  return (
    <div className="relative select-none">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#1c1c1c] hover:bg-[#282828] border border-[#333333] text-xs transition-colors"
        title="Detector de dispositivo inteligente"
      >
        {getDeviceIcon(currentDevice)}
        <span className="font-semibold text-neutral-200 hidden sm:inline">
          {getDeviceLabel(currentDevice)}
        </span>
        {forcedDevice && (
          <span className="text-[9px] px-1 rounded bg-purple-500/20 text-purple-300">
            Forzado
          </span>
        )}
        <ChevronDown className="w-3 h-3 text-neutral-400" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-[#1f1f1f] border border-[#383838] rounded-2xl shadow-2xl p-3 z-50 text-white text-xs">
          <div className="pb-2 mb-2 border-b border-[#303030]">
            <p className="font-bold text-purple-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Adaptación por Dispositivo
            </p>
            <p className="text-[11px] text-[#aaaaaa] mt-0.5">
              Detectado: <strong>{deviceInfo.label}</strong> ({deviceInfo.screenWidth}x{deviceInfo.screenHeight}px)
            </p>
            <p className="text-[10px] text-neutral-400 mt-0.5">
              {deviceInfo.isTouch ? 'Modo Táctil activado' : 'Modo Ratón y Teclado'}
            </p>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider">
              Vista Adaptativa
            </span>

            {/* Auto (Real detection) */}
            <button
              type="button"
              onClick={() => {
                onSetForcedDevice(null);
                setIsOpen(false);
              }}
              className={`w-full px-2.5 py-1.5 rounded-lg flex items-center justify-between transition-colors ${
                forcedDevice === null
                  ? 'bg-purple-600 text-white font-semibold'
                  : 'hover:bg-[#2b2b2b] text-neutral-300'
              }`}
            >
              <span className="flex items-center gap-2">
                <span>⚡</span>
                <span>Auto ({deviceInfo.label})</span>
              </span>
              {forcedDevice === null && <Check className="w-3.5 h-3.5" />}
            </button>

            {/* Celular */}
            <button
              type="button"
              onClick={() => {
                onSetForcedDevice('mobile');
                setIsOpen(false);
              }}
              className={`w-full px-2.5 py-1.5 rounded-lg flex items-center justify-between transition-colors ${
                forcedDevice === 'mobile'
                  ? 'bg-purple-600 text-white font-semibold'
                  : 'hover:bg-[#2b2b2b] text-neutral-300'
              }`}
            >
              <span className="flex items-center gap-2">
                <Smartphone className="w-3.5 h-3.5 text-purple-400" />
                <span>Celular (Barra inferior móvil)</span>
              </span>
              {forcedDevice === 'mobile' && <Check className="w-3.5 h-3.5" />}
            </button>

            {/* Tablet */}
            <button
              type="button"
              onClick={() => {
                onSetForcedDevice('tablet');
                setIsOpen(false);
              }}
              className={`w-full px-2.5 py-1.5 rounded-lg flex items-center justify-between transition-colors ${
                forcedDevice === 'tablet'
                  ? 'bg-purple-600 text-white font-semibold'
                  : 'hover:bg-[#2b2b2b] text-neutral-300'
              }`}
            >
              <span className="flex items-center gap-2">
                <Tablet className="w-3.5 h-3.5 text-blue-400" />
                <span>Tablet (Mini riel lateral)</span>
              </span>
              {forcedDevice === 'tablet' && <Check className="w-3.5 h-3.5" />}
            </button>

            {/* Laptop */}
            <button
              type="button"
              onClick={() => {
                onSetForcedDevice('laptop');
                setIsOpen(false);
              }}
              className={`w-full px-2.5 py-1.5 rounded-lg flex items-center justify-between transition-colors ${
                forcedDevice === 'laptop'
                  ? 'bg-purple-600 text-white font-semibold'
                  : 'hover:bg-[#2b2b2b] text-neutral-300'
              }`}
            >
              <span className="flex items-center gap-2">
                <Laptop className="w-3.5 h-3.5 text-emerald-400" />
                <span>Laptop (Grid 3 columnas)</span>
              </span>
              {forcedDevice === 'laptop' && <Check className="w-3.5 h-3.5" />}
            </button>

            {/* PC Desktop */}
            <button
              type="button"
              onClick={() => {
                onSetForcedDevice('desktop');
                setIsOpen(false);
              }}
              className={`w-full px-2.5 py-1.5 rounded-lg flex items-center justify-between transition-colors ${
                forcedDevice === 'desktop'
                  ? 'bg-purple-600 text-white font-semibold'
                  : 'hover:bg-[#2b2b2b] text-neutral-300'
              }`}
            >
              <span className="flex items-center gap-2">
                <Monitor className="w-3.5 h-3.5 text-amber-400" />
                <span>PC de Escritorio (Grid 4-5 col)</span>
              </span>
              {forcedDevice === 'desktop' && <Check className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
