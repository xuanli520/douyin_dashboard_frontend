'use client';

import Image from 'next/image';
import p0 from '@/assets/p0.png';
import p0_n from '@/assets/p0_n.png';
import p1 from '@/assets/p1.png';
import p1_n from '@/assets/p1_n.png';
import p2 from '@/assets/p2.png';
import p2_n from '@/assets/p2_n.png';
import p3 from '@/assets/p3.png';
import p3_n from '@/assets/p3_n.png';
import p4 from '@/assets/p4.png';
import p4_n from '@/assets/p4_n.png';
import p5 from '@/assets/p5.png';
import p5_n from '@/assets/p5_n.png';
import p6 from '@/assets/p6.png';
import p6_n from '@/assets/p6_n.png';
import p7 from '@/assets/p7.png';
import p7_n from '@/assets/p7_n.png';
import p8 from '@/assets/p8.png';
import p8_n from '@/assets/p8_n.png';
import p9 from '@/assets/p9.png';
import p9_n from '@/assets/p9_n.png';
import p10 from '@/assets/p10.png';
import p10_n from '@/assets/p10_n.png';
import p11 from '@/assets/p11.png';
import p11_n from '@/assets/p11_n.png';
import p12 from '@/assets/p12.png';
import p12_n from '@/assets/p12_n.png';
import p13 from '@/assets/p13.png';
import p13_n from '@/assets/p13_n.png';
import p14 from '@/assets/p14.png';
import p14_n from '@/assets/p14_n.png';
import p15 from '@/assets/p15.png';
import p15_n from '@/assets/p15_n.png';

const icons: Record<string, { light: any; dark: any }> = {
  '0': { light: p0, dark: p0_n },
  '1': { light: p1, dark: p1_n },
  '2': { light: p2, dark: p2_n },
  '3': { light: p3, dark: p3_n },
  '4': { light: p4, dark: p4_n },
  '5': { light: p5, dark: p5_n },
  '6': { light: p6, dark: p6_n },
  '7': { light: p7, dark: p7_n },
  '8': { light: p8, dark: p8_n },
  '9': { light: p9, dark: p9_n },
  '10': { light: p10, dark: p10_n },
  '11': { light: p11, dark: p11_n },
  '12': { light: p12, dark: p12_n },
  '13': { light: p13, dark: p13_n },
  '14': { light: p14, dark: p14_n },
  '15': { light: p15, dark: p15_n },
};

interface RiskLevelIconProps {
  level: string; // e.g. "P0", "0", "P15"
  className?: string;
  width?: number;
  height?: number;
}

export function RiskLevelIcon({ level, className = "", width = 24, height = 24 }: RiskLevelIconProps) {
  // Extract number from string (e.g. "P0" -> "0")
  const levelNum = level.replace(/[^0-9]/g, '');
  const iconSet = icons[levelNum];

  if (!iconSet) {
    // Fallback if level not found
    return <span className={`font-mono font-bold ${className}`}>{level}</span>;
  }

  return (
    <div className={`relative inline-block ${className}`} style={{ width, height }}>
      <Image
        src={iconSet.light}
        alt={`Risk Level ${level}`}
        width={width}
        height={height}
        className="block dark:hidden object-contain"
      />
      <Image
        src={iconSet.dark}
        alt={`Risk Level ${level}`}
        width={width}
        height={height}
        className="hidden dark:block object-contain"
      />
    </div>
  );
}
