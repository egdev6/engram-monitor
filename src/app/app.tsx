import queryClient from '@config/react-query';
import { useTheme } from '@hooks/use-theme';
import { QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from 'react-router-dom';
import Router from './Router';

const App = () => {
  useTheme();
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={Router} />
    </QueryClientProvider>
  );
};

export default App;
