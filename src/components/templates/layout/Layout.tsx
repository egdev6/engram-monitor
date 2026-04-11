import Footer from '@organisms/footer';
import Header from '@organisms/header';
import type { FC, JSX } from 'react';
import { Outlet } from 'react-router-dom';

const Layout: FC = (): JSX.Element | null => {
  return (
    <div className='w-full min-h-dvh bg-background-light dark:bg-background-dark'>
      <Header />
      <div className='w-full h-full pt-20 min-h-[calc(100dvh-130px)] relative bg-transparent'>
        <div className='w-full h-auto min-h-[calc(100dvh-130px)] max-w-312 px-6 sm:px-6 py-6 sm:py-12 mx-auto flex flex-col items-center justify-start'>
          <Outlet />
        </div>
        <Footer />
      </div>
    </div>
  );
};

export default Layout;
