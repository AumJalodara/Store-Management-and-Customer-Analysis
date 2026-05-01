import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import LoginPage     from './pages/LoginPage';
import MainLayout    from './layouts/MainLayout';
import DashboardPage from './pages/DashboardPage';
import ProductsPage  from './pages/ProductsPage';
import InventoryPage from './pages/InventoryPage';
import SalesPage     from './pages/SalesPage';
import CustomersPage from './pages/CustomersPage';
import TransfersPage from './pages/TransfersPage';
import AnalyticsPage from './pages/AnalyticsPage';
import ReportsPage   from './pages/ReportsPage';
import ExpiryPage    from './pages/ExpiryPage';
import AddCustomerPage from './pages/AddCustomerPage';

const PAGES = {
  dashboard:   DashboardPage,
  products:    ProductsPage,
  inventory:   InventoryPage,
  sales:       SalesPage,
  customers:   CustomersPage,
  transfers:   TransfersPage,
  analytics:   AnalyticsPage,
  reports:     ReportsPage,
  expiry:      ExpiryPage,
  addCustomer: AddCustomerPage,
};

export default function App() {
  const { user, loading } = useAuth();
  const [page, setPage]   = useState('dashboard');

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-orange-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return <LoginPage />;

  const Page = PAGES[page] || DashboardPage;
  return (
    <MainLayout activePage={page} onNavigate={setPage}>
      <Page onBack={() => setPage('customers')} onNavigate={setPage} />
    </MainLayout>
  );
}
