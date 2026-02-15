import '@fortawesome/fontawesome-free/css/all.min.css';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import BackToTop from './components/BackToTop';
import FloatingContact from './components/FloatingContact';
import Footer from './components/Footer';
import Header from './components/Header';
import ScrollToTop from './components/ScrollToTop';
import { ToastProvider } from './components/Toast';
import AboutPage from './pages/AboutPage';
import CategoriesPage from './pages/CategoriesPage';
import ContactPage from './pages/ContactPage';
import DetailProduct from './pages/DetailProduct';
import GuidePage from './pages/GuidePage';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import OrderAdminPage from './pages/OrderAdminPage';
import OrderCreatePage from './pages/OrderCreatePage';
import ProductPage from './pages/ProductPage';
import ProductsAdminPage from './pages/ProductsAdminPage';
import ContactAdminPage from './pages/ContactAdminPage';
import RequestCallPage from './pages/RequestCallPage';
import ShopInfoPage from './pages/ShopInfoPage';
import UploadBannerPage from './pages/UploadBanner';
function App() {
    return (
        <ToastProvider>
            <BrowserRouter>
                <ScrollToTop />
                <div className="container__main">
                    <div className="container__main-header">
                        <Header />
                    </div>
                    <div className="container__main-content">
                        <Routes>
                            <Route path="/" element={<HomePage />} />
                            <Route path="/trang-chu" element={<HomePage />} />
                            <Route path="/gioi-thieu" element={<AboutPage />} />
                            <Route path="/lien-he" element={<ContactPage />} />
                            <Route path="/huong-dan" element={<GuidePage />} />
                            {/* Redirect old URLs to new Vietnamese URLs for SEO */}
                            <Route path="/about" element={<Navigate to="/gioi-thieu" replace />} />
                            <Route path="/contact" element={<Navigate to="/lien-he" replace />} />
                            <Route path="/guide" element={<Navigate to="/huong-dan" replace />} />
                            <Route path="/san-pham" element={<ProductPage />} />
                            <Route path="/san-pham/:id" element={<DetailProduct />} />
                            {/* Redirect old URLs to new Vietnamese URLs for SEO */}
                            <Route path="/products" element={<Navigate to="/san-pham" replace />} />
                            <Route path="/product/:id" element={<Navigate to="/san-pham/:id" replace />} />
                            <Route path="/order/create" element={<OrderCreatePage />} />
                            <Route path="/admin/login" element={<LoginPage />} />
                            <Route path="/admin/upload" element={<UploadBannerPage />} />
                            <Route path="/admin/shop-info" element={<ShopInfoPage />} />
                            <Route path="/admin/categories" element={<CategoriesPage />} />
                            <Route path="/admin/products" element={<ProductsAdminPage />} />
                            <Route path="/admin/orders" element={<OrderAdminPage />} />
                            <Route path="/admin/request-calls" element={<RequestCallPage />} />
                            <Route path="/admin/contact-messages" element={<ContactAdminPage />} />
                            <Route path="*" element={<Navigate to="/" />} />
                        </Routes>
                    </div>
                </div>
                <FloatingContact />
                <Footer />
                <BackToTop />
            </BrowserRouter>
        </ToastProvider>
    );
}

export default App;
