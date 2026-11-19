import { createBrowserRouter, Navigate } from 'react-router';
import { LoginPage } from '../features/auth/LoginPage';
import { RedirectIfAuthenticated } from '../features/auth/RedirectIfAuthenticated';
import { RegisterPage } from '../features/auth/RegisterPage';
import { RequireAuth } from '../features/auth/RequireAuth';
import { MapPage } from '../features/locations/MapPage';
import { UploadPage } from '../features/locations/UploadPage';
import { RouteErrorPage } from '../shared/ui/RouteErrorPage';
import { AppLayout } from './AppLayout';
import { ROUTES } from './routes';

export const router = createBrowserRouter([
  {
    errorElement: <RouteErrorPage />,
    children: [
      {
        element: <RedirectIfAuthenticated />,
        children: [
          { path: ROUTES.login, element: <LoginPage /> },
          { path: ROUTES.register, element: <RegisterPage /> },
        ],
      },
      {
        element: <RequireAuth />,
        children: [
          {
            element: <AppLayout />,
            children: [
              { path: ROUTES.map, element: <MapPage /> },
              { path: ROUTES.upload, element: <UploadPage /> },
            ],
          },
        ],
      },
      { path: '*', element: <Navigate to={ROUTES.map} replace /> },
    ],
  },
]);
