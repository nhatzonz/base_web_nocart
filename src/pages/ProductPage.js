import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import '../assets/css/homepage.css';
import { API_BASE } from '../components/Api_base';
import api from '../components/axios-conf';

export default function ProductPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [categories, setCategories] = useState([]);
    const [products, setProducts] = useState({});
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchSuggestions, setSearchSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [searchFocused, setSearchFocused] = useState(false);
    const [allProducts, setAllProducts] = useState([]);
    const productsPerPage = 12;

    const normalizeForSearch = (str) => {
        if (!str) return '';
        return String(str)
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase();
    };

    useEffect(() => {
        document.title = 'Danh sách sản phẩm | Cửa hàng trực tuyến';
    }, []);

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        const categoryId = searchParams.get('category');
        const searchQuery = searchParams.get('search');

        if (searchQuery) {
            // Handle search from header
            setSearchTerm(searchQuery);
            const q = normalizeForSearch(searchQuery);
            const searchResults = allProducts.filter(
                (product) =>
                    normalizeForSearch(product.name).includes(q) ||
                    (product.code && normalizeForSearch(product.code).includes(q)),
            );
            setFilteredProducts(searchResults);
            setSelectedCategory(null);
        } else if (categoryId) {
            // Handle category filter
            const category = categories.find((cat) => cat.id === parseInt(categoryId));
            setSelectedCategory(category);
            const categoryProducts = products[categoryId] || [];
            setFilteredProducts(categoryProducts);
            setSearchTerm('');
        } else {
            // Show all products
            setSelectedCategory(null);
            setSearchTerm('');
            const allProductsList = Object.values(products).flat();
            setFilteredProducts(allProductsList);
        }
        setCurrentPage(1);
        // Scroll to top when changing category or search
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [searchParams, categories, products, allProducts]);

    // Search functionality - chỉ hiện gợi ý khi user đang focus/ghi vào ô search, không khi load từ URL
    useEffect(() => {
        if (searchTerm.length > 0 && searchFocused) {
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
    }, [searchTerm, allProducts, searchFocused]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [categoriesRes, productsRes] = await Promise.all([
                api.get('/api/categories'),
                api.get('/api/products'),
            ]);

            setCategories(categoriesRes.data || []);
            setAllProducts(productsRes.data || []);

            // Group products by category
            const groupedProducts = {};
            (productsRes.data || []).forEach((product) => {
                const categoryId = product.category_id;
                if (!groupedProducts[categoryId]) {
                    groupedProducts[categoryId] = [];
                }
                groupedProducts[categoryId].push(product);
            });
            setProducts(groupedProducts);
        } catch (error) {
            console.error('Lỗi khi tải dữ liệu:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleProductClick = (productId) => {
        navigate(`/san-pham/${productId}`);
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(price);
    };

    const handleCategoryClick = (categoryId) => {
        navigate(`/san-pham?category=${categoryId}`);
    };

    const handleShowAll = () => {
        navigate('/san-pham');
        setSearchTerm('');
    };

    const handleSearch = (term) => {
        setSearchFocused(false);
        setSearchTerm(term);
        if (term.length > 0) {
            const q = normalizeForSearch(term);
            const searchResults = allProducts.filter(
                (product) =>
                    normalizeForSearch(product.name).includes(q) ||
                    (product.code && normalizeForSearch(product.code).includes(q)),
            );
            setFilteredProducts(searchResults);
            setSelectedCategory(null);
        } else {
            const allProductsList = Object.values(products).flat();
            setFilteredProducts(allProductsList);
        }
        setCurrentPage(1);
        setShowSuggestions(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleSuggestionClick = (product) => {
        setSearchTerm(product.name);
        setFilteredProducts([product]);
        setSelectedCategory(null);
        setCurrentPage(1);
        setShowSuggestions(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handlePrevPage = () => {
        setCurrentPage((prev) => Math.max(1, prev - 1));
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleNextPage = () => {
        const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
        setCurrentPage((prev) => Math.min(totalPages, prev + 1));
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handlePageClick = (page) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const getCurrentPageProducts = () => {
        const startIndex = (currentPage - 1) * productsPerPage;
        const endIndex = startIndex + productsPerPage;
        return filteredProducts.slice(startIndex, endIndex);
    };

    const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

    // Generate page numbers for pagination
    const getPageNumbers = () => {
        const pages = [];
        const maxVisiblePages = 5;

        if (totalPages <= maxVisiblePages) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            const startPage = Math.max(1, currentPage - 2);
            const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

            for (let i = startPage; i <= endPage; i++) {
                pages.push(i);
            }
        }
        return pages;
    };

    if (loading) {
        return (
            <div className="home">
                <div className="loading">Đang tải...</div>
            </div>
        );
    }

    return (
        <div className="home">
            <div className="product-page-container">
                {/* Sidebar */}
                <div className="product-sidebar">
                    <div className="product-sidebar-section">
                        <h3 className="product-sidebar-title">Danh mục sản phẩm</h3>
                        <div className="product-category-list">
                            <div
                                className={`product-category-item ${!selectedCategory ? 'active' : ''}`}
                                onClick={handleShowAll}
                            >
                                <i className="fa-solid fa-th-large"></i>
                                Tất cả sản phẩm
                            </div>
                            {categories.map((category) => (
                                <div
                                    key={category.id}
                                    className={`product-category-item ${
                                        selectedCategory?.id === category.id ? 'active' : ''
                                    }`}
                                    onClick={() => handleCategoryClick(category.id)}
                                >
                                    <i className="fa-solid fa-box"></i>
                                    {category.name}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="product-main-content">
                    <div className="products-section">
                        <h1 className="page-title">
                            {searchTerm
                                ? `Kết quả tìm kiếm: "${searchTerm}"`
                                : selectedCategory
                                ? selectedCategory.name
                                : 'Tất cả sản phẩm'}
                        </h1>

                        {/* Search Bar */}
                        <div className="product-search-container">
                            <div className="product-search-box">
                                <input
                                    type="text"
                                    placeholder="Tìm kiếm sản phẩm theo tên hoặc mã..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    onFocus={() => setSearchFocused(true)}
                                    onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSearch(searchTerm)}
                                    className="product-search-input"
                                />
                                <button className="product-search-btn" onClick={() => handleSearch(searchTerm)}>
                                    <i className="fa-solid fa-search"></i>
                                </button>

                                {showSuggestions && searchSuggestions.length > 0 && (
                                    <div className="product-search-suggestions">
                                        {searchSuggestions.map((product) => (
                                            <div
                                                key={product.id}
                                                className="product-suggestion-item"
                                                onClick={() => handleSuggestionClick(product)}
                                            >
                                                <img
                                                    src={`${API_BASE}${
                                                        product.images?.[0]?.image_url || '/placeholder.jpg'
                                                    }`}
                                                    alt={product.name}
                                                    className="product-suggestion-image"
                                                />
                                                <div className="product-suggestion-info">
                                                    <div className="product-suggestion-name">{product.name}</div>
                                                    <div className="product-suggestion-code">
                                                        Mã: {product.code || 'N/A'}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Products Grid */}
                        <div className="products-grid-product-page">
                            {getCurrentPageProducts().map((product) => (
                                <div
                                    key={product.id}
                                    className="product-card"
                                    onClick={() => handleProductClick(product.id)}
                                    role="button"
                                    tabIndex={0}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' || e.key === ' ') {
                                            e.preventDefault();
                                            handleProductClick(product.id);
                                        }
                                    }}
                                >
                                    <div className="product-image-container">
                                        <img
                                            src={`${API_BASE}${product.images?.[0]?.image_url || '/placeholder.jpg'}`}
                                            alt={product.name}
                                            className="product-image"
                                        />
                                    </div>
                                    <div className="product-info">
                                        <h3 className="product-name">{product.name}</h3>
                                        <p className="product-code">Mã: {product.code || 'N/A'}</p>
                                        <p className="product-price">{formatPrice(product.price) || 'Giá liên hệ'}</p>
                                        <div className="order-btn">Mua ngay</div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="product-pagination">
                                <button
                                    className="product-pagination-btn"
                                    onClick={handlePrevPage}
                                    disabled={currentPage === 1}
                                >
                                    <i className="fa-solid fa-chevron-left"></i>
                                    Trước
                                </button>

                                <div className="product-pagination-numbers">
                                    {getPageNumbers().map((page) => (
                                        <button
                                            key={page}
                                            className={`product-pagination-number ${
                                                currentPage === page ? 'active' : ''
                                            }`}
                                            onClick={() => handlePageClick(page)}
                                        >
                                            {page}
                                        </button>
                                    ))}
                                </div>

                                <button
                                    className="product-pagination-btn"
                                    onClick={handleNextPage}
                                    disabled={currentPage === totalPages}
                                >
                                    Sau
                                    <i className="fa-solid fa-chevron-right"></i>
                                </button>
                            </div>
                        )}

                        {/* Results Info */}
                        <div className="product-results-info">
                            Hiển thị {getCurrentPageProducts().length} trong tổng số {filteredProducts.length} sản phẩm
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
