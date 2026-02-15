import { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import '../assets/css/header.css';
import { API_BASE } from './Api_base';
import api from './axios-conf';

export default function Header() {
    const [shopInfo, setShopInfo] = useState(null);
    const [categories, setCategories] = useState([]);
    const [showCategoryMenu, setShowCategoryMenu] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchSuggestions, setSearchSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [allProducts, setAllProducts] = useState([]);
    const [headerCategories, setHeaderCategories] = useState([]);
    const [showMobileMenu, setShowMobileMenu] = useState(false);
    const [token, setToken] = useState(() => localStorage.getItem('token'));
    const navigate = useNavigate();

    useEffect(() => {
        const handleAuthChange = () => setToken(localStorage.getItem('token'));
        window.addEventListener('auth-change', handleAuthChange);
        return () => window.removeEventListener('auth-change', handleAuthChange);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        setToken(null);
        navigate('/');
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [shopInfoRes, categoriesRes, productsRes] = await Promise.all([
                    api.get('/api/shopInfo'),
                    api.get('/api/categories'),
                    api.get('/api/products'),
                ]);
                setShopInfo(shopInfoRes.data);
                setCategories(categoriesRes.data || []);
                setAllProducts(productsRes.data || []);
                setHeaderCategories(categoriesRes.data.slice(0, 3) || []);
            } catch (err) {
                console.error('Lỗi fetch data:', err);
            }
        };
        fetchData();
    }, []);

    const normalizeForSearch = (str) => {
        if (!str) return '';
        return String(str)
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase();
    };

    // Search functionality
    useEffect(() => {
        if (searchTerm.length > 0) {
            const q = normalizeForSearch(searchTerm);
            const suggestions = allProducts
                .filter(
                    (product) =>
                        normalizeForSearch(product.name).includes(q) ||
                        (product.code && normalizeForSearch(product.code).includes(q)),
                )
                .slice(0, 5);
            setSearchSuggestions(suggestions);
            setShowSuggestions(true);
        } else {
            setSearchSuggestions([]);
            setShowSuggestions(false);
        }
    }, [searchTerm, allProducts]);

    const handleHeaderSearch = (term) => {
        if (term.length > 0) {
            navigate(`/san-pham?search=${encodeURIComponent(term)}`);
        } else {
            navigate('/san-pham');
        }
        setSearchTerm('');
        setShowSuggestions(false);
    };

    const handleSuggestionClick = (product) => {
        navigate(`/san-pham/${product.id}`);
        setSearchTerm('');
        setShowSuggestions(false);
    };

    const toggleMobileMenu = () => {
        setShowMobileMenu(!showMobileMenu);
    };

    const closeMobileMenu = () => {
        setShowMobileMenu(false);
    };

    const handleMobileNavigation = (path) => {
        navigate(path);
        closeMobileMenu();
    };

    return (
        <>
            {/* PC Header */}
            <div className="header">
                <div className="header-item">
                    <a style={{ display: 'flex', flex: 1, justifyContent: 'center' }} href="/trang-chu">
                        <img
                            style={{ cursor: 'pointer' }}
                            src={`${API_BASE}${shopInfo?.logo_image}`}
                            alt="logo"
                            className="header-logo"
                        />
                    </a>
                    <div className="header-search-container">
                        <div className="header-search-box">
                            <input
                                type="text"
                                placeholder="Tìm kiếm sản phẩm..."
                                className="header-search"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                                onKeyPress={(e) => e.key === 'Enter' && handleHeaderSearch(searchTerm)}
                            />
                            <button
                                type="button"
                                className="header-search-button"
                                onClick={() => handleHeaderSearch(searchTerm)}
                                aria-label="Tìm kiếm"
                            >
                                <i className="fa-solid fa-search"></i>
                            </button>

                            {showSuggestions && searchSuggestions.length > 0 && (
                                <div className="header-search-suggestions">
                                    {searchSuggestions.map((product) => (
                                        <div
                                            key={product.id}
                                            className="header-suggestion-item"
                                            onClick={() => handleSuggestionClick(product)}
                                        >
                                            <img
                                                src={`${API_BASE}${
                                                    product.images?.[0]?.image_url || '/placeholder.jpg'
                                                }`}
                                                alt={product.name}
                                                className="header-suggestion-image"
                                            />
                                            <div className="header-suggestion-info">
                                                <div className="header-suggestion-name">{product.name}</div>
                                                <div className="header-suggestion-code">
                                                    Mã: {product.code || 'N/A'}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                    <div style={{ display: 'flex', flex: 1, justifyContent: 'center' }}>
                        {token ? (
                            <button
                                type="button"
                                className="header-admin-button header-logout-btn"
                                onClick={handleLogout}
                            >
                                Đăng xuất
                            </button>
                        ) : (
                            <NavLink className="header-admin-button" to="/admin/login">
                                Admin
                            </NavLink>
                        )}
                    </div>
                </div>
                <div className="header-item">
                    <div
                        className="header-category"
                        onMouseEnter={() => setShowCategoryMenu(true)}
                        onMouseLeave={() => setShowCategoryMenu(false)}
                    >
                        <i className="fa-solid fa-bars color-yellow"></i>
                        {/* <p className="header-link">Danh mục bánh sinh nhật</p> */}
                        <p className="header-link">Danh mục</p>
                        <i className="fa-solid fa-caret-down color-yellow"></i>

                        {showCategoryMenu && (
                            <div className="category-submenu">
                                {categories.map((category) => (
                                    <div
                                        key={category.id}
                                        className="category-submenu-item"
                                        onClick={() => navigate(`/products?category=${category.id}`)}
                                    >
                                        {category.name}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    <NavLink to="/trang-chu" className="header-link">
                        Trang chủ
                    </NavLink>
                    <NavLink to="/gioi-thieu" className="header-link">
                        Giới thiệu
                    </NavLink>
                    <NavLink to="/san-pham" className="header-link">
                        {/* Bánh sinh nhật */}
                        Sản phẩm
                    </NavLink>

                    {!token && (
                        <>
                            <NavLink to="/lien-he" className="header-link">
                                Liên hệ
                            </NavLink>
                            {/* <NavLink to="/huong-dan" className="header-link">
                                Hướng dẫn
                            </NavLink> */}
                        </>
                    )}

                    {!token &&
                        headerCategories.map((category) => (
                            <NavLink to={`/san-pham?category=${category.id}`} className="header-link">
                                {category.name}
                            </NavLink>
                        ))}
                    {token && (
                        <>
                            <NavLink to="/admin/upload" className="header-link">
                                Tải Banner
                            </NavLink>

                            <NavLink to="/admin/shop-info" className="header-link">
                                Thông tin cửa hàng
                            </NavLink>

                            <NavLink to="/admin/categories" className="header-link">
                                Danh mục
                            </NavLink>
                            <NavLink to="/admin/products" className="header-link">
                                Quản lý sản phẩm
                            </NavLink>
                            {/* <NavLink to="/admin/orders" className="header-link">
                                Đơn hàng
                            </NavLink> */}
                            <NavLink to="/admin/request-calls" className="header-link">
                                Yêu cầu gọi lại
                            </NavLink>
                            <NavLink to="/admin/contact-messages" className="header-link">
                                Tin nhắn liên hệ
                            </NavLink>
                        </>
                    )}
                </div>
            </div>

            {/* Mobile Header */}
            <div className="mobile-header">
                <div className="mobile-header-content">
                    <button className="mobile-menu-toggle" onClick={toggleMobileMenu}>
                        <i className="fa-solid fa-bars"></i>
                    </button>
                    <a
                        href="/trang-chu"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            textDecoration: 'none',
                        }}
                    >
                        <img
                            src={shopInfo?.logo_image ? `${API_BASE}${shopInfo.logo_image}` : '/default-logo.png'}
                            alt="logo"
                            className="mobile-logo"
                        />
                    </a>
                </div>
                <div className="mobile-search-container">
                    <input
                        type="text"
                        placeholder="Tìm kiếm sản phẩm..."
                        className="mobile-search"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleHeaderSearch(searchTerm)}
                    />
                    <button
                        type="button"
                        className="mobile-search-button"
                        onClick={() => handleHeaderSearch(searchTerm)}
                        aria-label="Tìm kiếm"
                    >
                        <i className="fa-solid fa-search"></i>
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {showMobileMenu && <div className="mobile-menu-overlay show" onClick={closeMobileMenu}></div>}
            <div className={`mobile-menu ${showMobileMenu ? 'show open' : ''}`} style={{ zIndex: '2000' }}>
                <div className="mobile-menu-header">
                    <img
                        src={shopInfo?.logo_image ? `${API_BASE}${shopInfo.logo_image}` : '/default-logo.png'}
                        alt="logo"
                        style={{ height: '40px' }}
                    />
                    <button className="mobile-menu-close" onClick={closeMobileMenu}>
                        <i className="fa-solid fa-times"></i>
                    </button>
                </div>

                <div className="mobile-menu-content">
                    <div className="mobile-menu-section">
                        <h3>Trang chủ</h3>
                        <button className="mobile-menu-link" onClick={() => handleMobileNavigation('/trang-chu')}>
                            <i className="fa-solid fa-home" style={{ marginRight: '10px' }}></i>
                            Trang chủ
                        </button>
                        <button className="mobile-menu-link" onClick={() => handleMobileNavigation('/gioi-thieu')}>
                            <i className="fa-solid fa-info-circle" style={{ marginRight: '10px' }}></i>
                            Giới thiệu
                        </button>
                        <button className="mobile-menu-link" onClick={() => handleMobileNavigation('/lien-he')}>
                            <i className="fa-solid fa-phone" style={{ marginRight: '10px' }}></i>
                            Liên hệ
                        </button>
                        {/* <button className="mobile-menu-link" onClick={() => handleMobileNavigation('/huong-dan')}>
                            <i className="fa-solid fa-book" style={{ marginRight: '10px' }}></i>
                            Hướng dẫn
                        </button> */}
                    </div>

                    <div className="mobile-menu-section">
                        <h3>Danh mục sản phẩm</h3>
                        <button className="mobile-menu-link" onClick={() => handleMobileNavigation('/san-pham')}>
                            <i className="fa-solid fa-th-large" style={{ marginRight: '10px' }}></i>
                            Tất cả sản phẩm
                        </button>
                        {categories.map((category) => (
                            <button
                                key={category.id}
                                className="mobile-menu-link"
                                onClick={() => handleMobileNavigation(`/san-pham?category=${category.id}`)}
                            >
                                <i className="fa-solid fa-box" style={{ marginRight: '10px' }}></i>
                                {category.name}
                            </button>
                        ))}
                    </div>

                    {/* {token && (
                        <div className="mobile-menu-section">
                            <h3>Quản trị</h3>
                            <button
                                className="mobile-menu-link"
                                onClick={() => handleMobileNavigation('/admin/upload')}
                            >
                                <i className="fa-solid fa-upload" style={{ marginRight: '10px' }}></i>
                                Tải Banner
                            </button>
                            <button
                                className="mobile-menu-link"
                                onClick={() => handleMobileNavigation('/admin/shop-info')}
                            >
                                <i className="fa-solid fa-store" style={{ marginRight: '10px' }}></i>
                                Thông tin cửa hàng
                            </button>
                            <button
                                className="mobile-menu-link"
                                onClick={() => handleMobileNavigation('/admin/categories')}
                            >
                                <i className="fa-solid fa-list" style={{ marginRight: '10px' }}></i>
                                Danh mục
                            </button>
                            <button
                                className="mobile-menu-link"
                                onClick={() => handleMobileNavigation('/admin/products')}
                            >
                                <i className="fa-solid fa-box" style={{ marginRight: '10px' }}></i>
                                Quản lý sản phẩm
                            </button>
                            <button
                                className="mobile-menu-link"
                                onClick={() => handleMobileNavigation('/admin/orders')}
                            >
                                <i className="fa-solid fa-receipt" style={{ marginRight: '10px' }}></i>
                                Đơn hàng
                            </button>
                            <button
                                className="mobile-menu-link"
                                onClick={() => handleMobileNavigation('/admin/request-calls')}
                            >
                                <i className="fa-solid fa-phone" style={{ marginRight: '10px' }}></i>
                                Yêu cầu gọi lại
                            </button>
                        </div>
                    )} */}
                </div>
            </div>
        </>
    );
}
