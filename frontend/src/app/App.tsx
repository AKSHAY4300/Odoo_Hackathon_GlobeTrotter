import React, { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { QueryProvider } from './providers/QueryProvider';
import { ToastProvider } from './providers/ToastProvider';
import { router } from './routes';
import { useAuthStore } from '../stores/authStore';

export const App: React.FC = () => {
  const { checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <QueryProvider>
      <RouterProvider router={router} />
      <ToastProvider />
    </QueryProvider>
  );
};

export default App;
