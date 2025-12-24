import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingSpinner: React.FC<{ className?: string; size?: 'sm' | 'md' | 'lg' }> = ({ className = '', size = 'md' }) => {
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  return <Loader2 className={`animate-spin ${sizes[size]} ${className}`} />;
};

const Loading: React.FC = () => {
  return (
    <div className="flex justify-center items-center h-screen">
      <LoadingSpinner size="lg" />
    </div>
  );
};

export { LoadingSpinner };
export default Loading;
