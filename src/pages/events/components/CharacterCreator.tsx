import { useState, useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { BRAND, HOODIE_COLORS } from '../constants';
import type { AvatarConfig } from '../types';
import { SheepModel } from './sheep/SheepModel';

interface CharacterCreatorProps {
  onEnter: (name: string, avatar: AvatarConfig) => void;
  existingName?: string | null;
  existingAvatar?: AvatarConfig | null;
  onContinue?: () => void;
}

export function CharacterCreator({ onEnter, existingName, existingAvatar, onContinue }: CharacterCreatorProps) {
  const [name, setName] = useState(existingName || '');
  const [avatar, setAvatar] = useState<AvatarConfig>(
    existingAvatar || { hoodie: HOODIE_COLORS[0], glasses: 'pixel', hat: 'none', gender: 'm' }
  );
  const [error, setError] = useState('');

  const handleEnter = () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setError('Enter your name to continue');
      return;
    }
    setError('');
    onEnter(trimmed, avatar);
  };

  const optionBtn = (isActive: boolean) => ({
    background: isActive ? BRAND.accent : BRAND.surfaceMuted,
    color: isActive ? '#ffffff' : BRAND.textPrimary,
    border: isActive ? `1px solid ${BRAND.accent}` : `1px solid ${BRAND.border}`,
  });

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ background: BRAND.bgLight }}>
      <div className="flex flex-col lg:flex-row items-center justify-center flex-1 gap-8 p-6 overflow-y-auto">
        {/* 3D Preview */}
        <div className="w-full lg:w-1/2 h-[40vh] lg:h-[70vh] max-h-[500px] lg:max-h-none rounded-2xl overflow-hidden" style={{ background: BRAND.surfaceMuted }}>
          <Canvas camera={{ position: [0, 0.7, 3], fov: 32 }} dpr={[1, 1.5]}>
            <ambientLight intensity={0.7} />
            <directionalLight position={[3, 5, 3]} intensity={1.4} />
            <directionalLight position={[-2, 3, -1]} intensity={0.4} color="#e0e7ff" />
            <Suspense fallback={null}>
              <SheepPreview avatar={avatar} />
            </Suspense>
          </Canvas>
        </div>

        {/* Controls Panel */}
        <div className="w-full lg:w-[420px] flex flex-col gap-5">
          <h1 className="text-2xl lg:text-3xl font-bold text-center lg:text-left" style={{ color: BRAND.textPrimary }}>
            Create your <span style={{ color: BRAND.accent }}>Vibecoder</span>
          </h1>
          <p className="text-sm -mt-3" style={{ color: BRAND.textSecondary }}>
            Customize your character and join the fair.
          </p>

          {/* Hoodie color */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider mb-2 block" style={{ color: BRAND.textSecondary }}>Hoodie color</label>
            <div className="flex gap-3">
              {HOODIE_COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setAvatar((a) => ({ ...a, hoodie: c }))}
                  className="rounded-full transition-all duration-200 shadow-sm"
                  style={{
                    width: 40,
                    height: 40,
                    backgroundColor: c,
                    border: avatar.hoodie === c ? `3px solid ${BRAND.textPrimary}` : '3px solid transparent',
                    transform: avatar.hoodie === c ? 'scale(1.15)' : 'scale(1)',
                  }}
                />
              ))}
            </div>
          </div>

          {/* Glasses */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider mb-2 block" style={{ color: BRAND.textSecondary }}>Glasses</label>
            <div className="flex gap-2">
              {(['pixel', 'round', 'none'] as const).map((g) => (
                <button
                  key={g}
                  onClick={() => setAvatar((a) => ({ ...a, glasses: g }))}
                  className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                  style={optionBtn(avatar.glasses === g)}
                >
                  {g === 'pixel' ? 'Pixel' : g === 'round' ? 'Round' : 'None'}
                </button>
              ))}
            </div>
          </div>

          {/* Hat */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider mb-2 block" style={{ color: BRAND.textSecondary }}>Hat</label>
            <div className="flex gap-2">
              {(['none', 'beanie', 'cap'] as const).map((h) => (
                <button
                  key={h}
                  onClick={() => setAvatar((a) => ({ ...a, hat: h }))}
                  className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                  style={optionBtn(avatar.hat === h)}
                >
                  {h === 'none' ? 'None' : h === 'beanie' ? 'Beanie' : 'Cap'}
                </button>
              ))}
            </div>
          </div>

          {/* Style */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider mb-2 block" style={{ color: BRAND.textSecondary }}>Style</label>
            <div className="flex gap-2">
              {(['m', 'f'] as const).map((g) => (
                <button
                  key={g}
                  onClick={() => setAvatar((a) => ({ ...a, gender: g }))}
                  className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                  style={optionBtn(avatar.gender === g)}
                >
                  {g === 'm' ? 'Neutral' : 'Feminine'}
                </button>
              ))}
            </div>
          </div>

          {/* Name input */}
          <div>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value.slice(0, 16))}
              placeholder="Your vibecoder name"
              maxLength={16}
              className="w-full px-4 py-3 rounded-xl font-medium outline-none transition-all duration-200 focus:ring-2"
              style={{
                background: BRAND.surface,
                color: BRAND.textPrimary,
                border: `1px solid ${BRAND.border}`,
              }}
              onFocus={(e) => (e.target.style.borderColor = BRAND.accent)}
              onBlur={(e) => (e.target.style.borderColor = BRAND.border)}
            />
            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
            <p className="text-xs mt-1 text-right" style={{ color: BRAND.textSecondary }}>{name.length}/16</p>
          </div>

          {/* Enter button */}
          <button
            onClick={handleEnter}
            className="w-full py-4 rounded-xl text-white font-bold text-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-lg"
            style={{ background: BRAND.accent }}
          >
            Enter the fair
          </button>

          {/* Continue as existing */}
          {existingName && onContinue && (
            <button
              onClick={onContinue}
              className="text-sm font-medium transition-colors hover:underline"
              style={{ color: BRAND.textSecondary }}
            >
              Continue as {existingName}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function SheepPreview({ avatar }: { avatar: AvatarConfig }) {
  const groupRef = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.5;
    }
  });
  return (
    <group ref={groupRef}>
      <SheepModel
        avatar={avatar}
        position={[0, -0.5, 0]}
        scale={1.2}
        showName={false}
      />
    </group>
  );
}
