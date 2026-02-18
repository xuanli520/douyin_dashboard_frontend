/**
 * Logo点击彩蛋Hook
 * 5秒内连续点击5次触发主题切换
 */

import { useState, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import { useThemeStore } from '@/stores/themeStore';

interface UseEasterEggReturn {
  handleLogoClick: () => void;
  clickCount: number;
  isTriggered: boolean;
}

export function useEasterEgg(): UseEasterEggReturn {
  const [clickCount, setClickCount] = useState(0);
  const [isTriggered, setIsTriggered] = useState(false);
  const lastClickTimeRef = useRef<number>(0);
  const resetTimerRef = useRef<NodeJS.Timeout | null>(null);
  const { appTheme, toggleEasterEgg } = useThemeStore();

  const handleLogoClick = useCallback(() => {
    const now = Date.now();
    
    // 清除之前的重置定时器
    if (resetTimerRef.current) {
      clearTimeout(resetTimerRef.current);
    }

    // 检查是否在5秒内
    if (now - lastClickTimeRef.current > 5000) {
      // 超过5秒，重置计数
      setClickCount(1);
    } else {
      // 在5秒内，增加计数
      const newCount = clickCount + 1;
      setClickCount(newCount);
      
      // 检查是否达到5次点击
      if (newCount >= 5) {
        // 触发彩蛋
        toggleEasterEgg();
        setIsTriggered(true);
        setClickCount(0);
        
        // 显示提示
        const newTheme = appTheme === 'enterprise' ? 'cyberpunk' : 'enterprise';
        if (newTheme === 'cyberpunk') {
          toast.success('🎮 发现隐藏主题！赛博朋克风格已激活', {
            description: '点击Logo 5次可切换回企业主题',
            duration: 4000,
          });
        } else {
          toast.info('🏢 已切换回企业主题', {
            description: '点击Logo 5次可再次激活彩蛋主题',
            duration: 3000,
          });
        }
        
        // 3秒后重置触发状态
        setTimeout(() => {
          setIsTriggered(false);
        }, 3000);
        
        return;
      }
    }
    
    lastClickTimeRef.current = now;
    
    // 设置5秒后重置计数
    resetTimerRef.current = setTimeout(() => {
      setClickCount(0);
    }, 5000);
  }, [clickCount, appTheme, toggleEasterEgg]);

  return {
    handleLogoClick,
    clickCount,
    isTriggered,
  };
}
