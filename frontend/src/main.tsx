import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom'
import './index.css'
import LoginPage from './pages/LoginPage.tsx';
import DemoPage from './pages/DemoPage.tsx'
import Header from './components/Header.tsx';
import Footer from './components/Footer.tsx';
import { AuthCallback } from './components/Auth.tsx';
import LandingPage from './pages/LandingPage.tsx';
import StartPage from './pages/StartPage.tsx';
import FeaturesPage from './pages/FeaturesPage.tsx';
import FuturePage from './pages/FuturePage.tsx';
import NotFoundPage from './pages/NotFoundPage.tsx';
import CalendarPage from './pages/CalendarPage.tsx';

// https://feathericons.com/
function Layout() {

  return (
    <div className="flex flex-col min-h-screen justify-center items-center bg-orange-50 px-10">
      <Header />
      <main className='flex-grow flex items-center justify-center px-10 pt-16 overflow-hidden'>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        path: '/',
        element: <LandingPage />
      },
      {
        path: '/demo',
        element: <DemoPage />,
      },
      {
        path: '/features',
        element: <FeaturesPage />
      },
      {
        path: '/future',
        element: <FuturePage />
      },
      {
        path: '/login',
        element: <LoginPage />
      },
      {
        path: '/start',
        element: <StartPage />
      },
      {
        path: '/oauth/authorize',
        element: <AuthCallback />
      }
    ],
  },

  {
    path: '/calendars/:calendarId',
    element: <CalendarPage />
  },
  {
    path: '*',
    element: <NotFoundPage />
  }
])
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router}/>
  </StrictMode>,
)
