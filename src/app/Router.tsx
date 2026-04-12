import Layout from '@templates/layout';
import { lazy, Suspense } from 'react';
import { createBrowserRouter, createRoutesFromElements, Navigate, Route } from 'react-router-dom';

export const EngramDashboardPage = lazy(() => import('@pages/engram-dashboard'));
export const SessionDetailPage = lazy(() => import('@pages/session-detail'));

const Router = createBrowserRouter(
  createRoutesFromElements(
    <Route
      path='/'
      element={
        <Suspense fallback={<h1>Loading...</h1>}>
          <Layout />
        </Suspense>
      }
    >
      <Route index={true} element={<EngramDashboardPage />} />
      <Route path='sessions/:sessionId' element={<SessionDetailPage />} />
      <Route path='*' element={<Navigate replace={true} to='/' />} />
    </Route>
  )
);

export default Router;
