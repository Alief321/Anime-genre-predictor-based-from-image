import React, { Suspense } from 'react';
// import Navbar from '../components/Navbar';
// import Footer from '../components/Footer';
import Loading from '@/components/ui/loading';

interface MainLayoutProps {
  children: React.ReactNode;
  excludeLayout?: boolean;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <Suspense fallback={<Loading />}>
      <div className="min-h-screen w-full overflow-x-hidden flex flex-col justify-center items-center bg-gray-50">
        <main className="w-full md:px-20 px-6">{children}</main>
      </div>
    </Suspense>
  );
};

export default MainLayout;
