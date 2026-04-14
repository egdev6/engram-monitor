import { Moon, Sun, Wifi, WifiOff } from 'lucide-react';
import { type FC, useEffect, useState } from 'react';
import { cn } from 'tailwind-variants';
import { useEngramHealth } from '@hooks/use-engram';
import { useThemeStore } from '@hooks/use-theme';

const Header: FC = () => {
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isOnline, setIsOnline] = useState(false);
  const { data: health } = useEngramHealth();
  const { theme, toggleTheme } = useThemeStore((state) => ({
    theme: state.theme,
    toggleTheme: state.toggleTheme
  }));

  useEffect(() => {
    if (health?.status === 'ok') {
      setIsOnline(true);
      if (!lastUpdated) {
        setLastUpdated(new Date());
      }
    } else {
      setIsOnline(false);
    }
  }, [health]);

  return (
    <header className='w-full h-15 sm:h-20 py-0 px-6 sm:px-12 flex items-center justify-between fixed top-0 left-0 right-0 z-9 backdrop-blur-[10px]'>
      <div className='flex gap-4 items-center sm:items-end'>
        <div className='flex items-center gap-3'>
          <img src='/images/logo-only.svg' alt='Engram logo' className='min-w-8 min-h-8 mb-0.5' />
          <h1 className='text-h3 leading-none font-primary font-bold text-text-light dark:text-text-dark hidden sm:flex'>
            Engram Monitor
          </h1>
        </div>
        <p className='text-[12px] text-gray-light-600 dark:text-gray-dark-300 font-mono'>
          {lastUpdated ? `Updated ${lastUpdated.toLocaleTimeString()}` : 'polling every 2 s'}
        </p>
      </div>
      <div className='flex items-center gap-3'>
        <button
          type='button'
          onClick={toggleTheme}
          className='flex items-center justify-center w-8 h-8 rounded-full border border-gray-light-300 dark:border-gray-dark-700 text-gray-light-700 dark:text-gray-dark-300 hover:bg-gray-light-200 dark:hover:bg-gray-dark-800 transition-colors cursor-pointer'
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          aria-pressed={theme === 'dark'}
        >
          {theme === 'dark' ? (
            <Sun size={14} strokeWidth={1.5} aria-hidden='true' />
          ) : (
            <Moon size={14} strokeWidth={1.5} aria-hidden='true' />
          )}
        </button>
        <span
          className={cn(
            'flex items-center gap-1.5 text-[11px] font-mono px-2 py-1 rounded-full border',
            isOnline ? 'bg-green/10 text-green border-green/30' : 'bg-red-500/10 text-red-400 border-red-500/30'
          )}
        >
          {isOnline ? (
            <Wifi size={12} strokeWidth={1.5} className='animate-pulse' />
          ) : (
            <WifiOff size={12} strokeWidth={1.5} />
          )}
          {isOnline ? 'online' : 'offline'}
        </span>
      </div>
    </header>
  );
};

export default Header;
