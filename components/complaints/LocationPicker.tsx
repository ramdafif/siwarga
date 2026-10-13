'use client';

import React, { useState } from 'react';
import { MapPin, Navigation, Check } from 'lucide-react';

interface LocationPickerProps {
  address: string;
  onChangeAddress: (addr: string) => void;
  latitude?: number;
  longitude?: number;
  onChangeCoordinates: (lat?: number, lng?: number) => void;
}

const LANDMARK_PRESETS = [
  { name: 'Pos Ronda RT 01 / RW 01', lat: -6.2912, lng: 106.7934 },
  { name: 'Lapangan Bulutangkis RW 01', lat: -6.2918, lng: 106.7942 },
  { name: 'Balai Warga RW 01', lat: -6.2925, lng: 106.7951 },
  { name: 'Masjid Al-Ikhlas RW 01', lat: -6.2905, lng: 106.7928 },
  { name: 'Saluran Air Jl. Melati No. 12', lat: -6.2931, lng: 106.7939 },
  { name: 'Tempat Pembuangan Sampah RT 03', lat: -6.294, lng: 106.796 },
];

export const LocationPicker: React.FC<LocationPickerProps> = ({
  address,
  onChangeAddress,
  latitude,
  longitude,
  onChangeCoordinates,
}) => {
  const [detectingGps, setDetectingGps] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      setGpsError('Browser tidak mendukung pendeteksian GPS.');
      return;
    }
    setDetectingGps(true);
    setGpsError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        onChangeCoordinates(pos.coords.latitude, pos.coords.longitude);
        if (!address) {
          onChangeAddress(`Koordinat: ${pos.coords.latitude.toFixed(5)}, ${pos.coords.longitude.toFixed(5)}`);
        }
        setDetectingGps(false);
      },
      (err) => {
        console.warn('Geolocation error:', err);
        setGpsError('Tidak dapat mengakses lokasi. Silakan pilih patokan wilayah atau ketik manual.');
        setDetectingGps(false);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const handleSelectPreset = (preset: (typeof LANDMARK_PRESETS)[0]) => {
    onChangeAddress(preset.name);
    onChangeCoordinates(preset.lat, preset.lng);
  };

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1">
          Alamat atau Titik Lokasi Kejadian <span className="text-rose-500">*</span>
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <MapPin className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={address}
            onChange={(e) => onChangeAddress(e.target.value)}
            placeholder="Contoh: Depan Pos Kamling RT 01 / Jl. Melati Blok B4..."
            className="w-full pl-9 pr-24 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all placeholder:text-slate-400"
            required
          />
          <button
            type="button"
            onClick={handleGetCurrentLocation}
            disabled={detectingGps}
            className="absolute inset-y-1.5 right-1.5 px-2.5 py-1 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg flex items-center gap-1 transition-colors disabled:opacity-50"
            title="Deteksi Lokasi GPS"
          >
            <Navigation className={`w-3.5 h-3.5 ${detectingGps ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">{detectingGps ? 'Mencari...' : 'GPS'}</span>
          </button>
        </div>
      </div>

      {gpsError && <p className="text-[11px] text-amber-700 bg-amber-50 p-2 rounded-lg">{gpsError}</p>}

      {/* Preset Landmarks */}
      <div>
        <span className="text-[11px] font-medium text-slate-500 block mb-1.5">
          Pilih cepat titik patokan wilayah terdekat:
        </span>
        <div className="flex flex-wrap gap-1.5">
          {LANDMARK_PRESETS.map((preset) => {
            const isSelected = address === preset.name;
            return (
              <button
                key={preset.name}
                type="button"
                onClick={() => handleSelectPreset(preset)}
                className={`text-xs px-2.5 py-1 rounded-lg border transition-colors flex items-center gap-1 ${
                  isSelected
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-800 font-medium'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {isSelected && <Check className="w-3 h-3 text-emerald-600" />}
                <span>{preset.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Coordinate status */}
      {latitude && longitude && (
        <div className="p-2 bg-slate-100 rounded-lg text-[11px] font-mono text-slate-600 flex items-center justify-between">
          <span>
            Koordinat: {latitude.toFixed(5)}, {longitude.toFixed(5)}
          </span>
          <span className="text-emerald-700 font-sans font-medium">Titik Terdeteksi ✓</span>
        </div>
      )}
    </div>
  );
};
