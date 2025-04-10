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

function Layout() {

  return (
    <div className="flex flex-col justify-between items-center min-h-screen bg-orange-50 px-10">
      <Header />
      <main className='pt-16 overflow-hidden m-auto'>
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
        path: '/oauth/authorize',
        element: <AuthCallback />
      }
    ],
  },
  {
    path: '/start',
    element: <StartPage />
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
