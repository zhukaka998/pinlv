import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-[#1a0b2e] text-slate-200 font-sans selection:bg-pink-500/30 flex justify-center overflow-hidden relative">
      {/* Background Effects */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-purple-900/20 blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-pink-900/10 blur-[120px]"></div>
      </div>
      
      <div className="w-full max-w-md md:max-w-2xl lg:max-w-3xl h-screen flex flex-col relative z-10">
        {children}
      </div>
    </div>
  );
};

export default Layout;
