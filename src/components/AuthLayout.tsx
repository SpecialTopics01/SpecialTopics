import React from 'react';
interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  userType: 'citizen' | 'admin';
}
export function AuthLayout({
  children,
  title,
  subtitle,
  userType
}: AuthLayoutProps) {
  const accentColor = userType === 'citizen' ? 'bg-red-600' : 'bg-blue-600';
  const accentText = userType === 'citizen' ? 'text-red-600' : 'text-blue-600';
  return <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className={`${accentColor} py-4 px-6`}>
        <h1 className="text-white text-2xl font-bold">
          {userType === 'citizen' ? '🚨 Emergency Connect' : '👮 Admin Portal'}
        </h1>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-center mb-8">
              <h2 className={`text-3xl font-bold ${accentText} mb-2`}>
                {title}
              </h2>
              {subtitle && <p className="text-gray-600">{subtitle}</p>}
            </div>

            {children}
          </div>
        </div>
      </div>
    </div>;
}