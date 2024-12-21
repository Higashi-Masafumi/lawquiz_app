import { useState, useCallback, useEffect } from "react";

export type TypingStats = {
  speed: number;
  startTime: number | null;
  lastPauseTime: number | null;
  totalPauseTime: number;
  isTyping: boolean;
};

const TYPING_PAUSE_THRESHOLD = 2000; // 2 seconds pause threshold

export function useTypingSpeed() {
  const [stats, setStats] = useState<TypingStats>({
    speed: 0,
    startTime: null,
    lastPauseTime: null,
    totalPauseTime: 0,
    isTyping: false,
  });

  const resetStats = useCallback(() => {
    setStats({
      speed: 0,
      startTime: null,
      lastPauseTime: null,
      totalPauseTime: 0,
      isTyping: false,
    });
  }, []);

  const updateTypingSpeed = useCallback((text: string) => {
    const now = Date.now();

    setStats((prev) => {
      if (!prev.startTime) {
        return {
          ...prev,
          startTime: now,
          isTyping: true,
        };
      }

      // Calculate actual typing time excluding pauses
      const activeTypingTime = now - prev.startTime - prev.totalPauseTime;
      const charactersTyped = text.length;
      const minutesElapsed = activeTypingTime / 60000;
      const speed = Math.round(charactersTyped / minutesElapsed);

      return {
        ...prev,
        speed: speed || 0,
        isTyping: true,
        lastPauseTime: null,
      };
    });
  }, []);

  // Handle typing pauses
  useEffect(() => {
    let pauseTimer: number;

    if (stats.isTyping) {
      pauseTimer = window.setTimeout(() => {
        setStats((prev) => ({
          ...prev,
          isTyping: false,
          lastPauseTime: Date.now(),
        }));
      }, TYPING_PAUSE_THRESHOLD);
    } else if (stats.lastPauseTime) {
      setStats((prev) => ({
        ...prev,
        totalPauseTime:
          prev.totalPauseTime + (Date.now() - (prev.lastPauseTime || 0)),
      }));
    }

    return () => clearTimeout(pauseTimer);
  }, [stats.isTyping, stats.lastPauseTime]);

  return {
    typingSpeed: stats.speed,
    isTyping: stats.isTyping,
    resetTypingStats: resetStats,
    updateTypingSpeed,
  };
}
