import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import FloatingButtons from './components/FloatingButtons';
import Home from './pages/Home';
import ProductCatalog from './pages/ProductCatalog';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsConditions from './pages/TermsConditions';
import DataDeletion from './pages/DataDeletion';
import RefundPolicy from './pages/RefundPolicy';
import ContactUs from './pages/ContactUs';
import ProductDetail from './pages/ProductDetail';
import AdminLogin from './admin/AdminLogin';
import AdminLayout from './admin/AdminLayout';
import AdminProducts from './admin/AdminProducts';
import AdminCategories from './admin/AdminCategories';
import AdminPrompt from './admin/AdminPrompt';
import AdminSettings from './admin/AdminSettings';
import AdminChats from './admin/AdminChats';
import AdminCron from './admin/AdminCron';
import AdminAnnouncements from './admin/AdminAnnouncements';

const LEGAL_PATHS = ['/privacy-policy', '/terms-conditions', '/data-deletion', '/refund-policy', '/contact'];
const ADMIN_PATHS = ['/admin'];

function AppInner() {
  const location = useLocation();
  const isLegalPage = LEGAL_PATHS.includes(location.pathname);
  const isAdminPage = location.pathname.startsWith('/admin');

  if (isAdminPage) {
    return (
      <Routes>
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="products" element={<AdminProducts />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="prompt" element={<AdminPrompt />} />
          <Route path="settings" element={<AdminSettings />} />
          <Route path="chats" element={<AdminChats />} />
          <Route path="announcements" element={<AdminAnnouncements />} />
          <Route path="cron" element={<AdminCron />} />
        </Route>
      </Routes>
    );
  }

  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<ProductCatalog />} />
        <Route path="/products/:productId" element={<ProductDetail />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms-conditions" element={<TermsConditions />} />
        <Route path="/data-deletion" element={<DataDeletion />} />
        <Route path="/refund-policy" element={<RefundPolicy />} />
        <Route path="/contact" element={<ContactUs />} />
      </Routes>
      {!isLegalPage && <Footer />}
      <FloatingButtons />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#ffffff',
            color: '#111827',
            border: '1px solid #e5e7eb',
            fontSize: '14px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
          },
        }}
      />
      <AppInner />
    </BrowserRouter>
  );
}
