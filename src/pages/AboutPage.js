import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../assets/css/about.css';
import { API_BASE } from '../components/Api_base';
import api from '../components/axios-conf';

export default function AboutPage() {
    const navigate = useNavigate();
    const [shopInfo, setShopInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [counters, setCounters] = useState({
        customers: 0,
        products: 0,
        orders: 0,
        years: 0,
    });

    useEffect(() => {
        fetchShopInfo();

        // Add class to body and html for overflow fix
        document.body.classList.add('about-page-active');
        document.documentElement.classList.add('about-page-active');

        // Cleanup on unmount
        return () => {
            document.body.classList.remove('about-page-active');
            document.documentElement.classList.remove('about-page-active');
        };
    }, []);

    useEffect(() => {
        document.title = `Giới thiệu | ${shopInfo?.name || 'Cửa hàng'}`;
    }, [shopInfo?.name]);

    const fetchShopInfo = async () => {
        try {
            const response = await api.get('/api/shopInfo');
            setShopInfo(response.data);
        } catch (err) {
            console.error('Lỗi fetch shopInfo:', err);
        } finally {
            setLoading(false);
        }
    };

    // Counter animation effect
    useEffect(() => {
        const animateCounters = () => {
            const targetCounters = {
                customers: 500,
                products: 200,
                orders: 1000,
                years: 5,
            };

            const duration = 2000; // 2 seconds
            const steps = 60;
            const stepDuration = duration / steps;

            let currentStep = 0;
            const timer = setInterval(() => {
                currentStep++;
                const progress = currentStep / steps;
                const easeOut = 1 - Math.pow(1 - progress, 3);

                setCounters({
                    customers: Math.floor(targetCounters.customers * easeOut),
                    products: Math.floor(targetCounters.products * easeOut),
                    orders: Math.floor(targetCounters.orders * easeOut),
                    years: Math.floor(targetCounters.years * easeOut),
                });

                if (currentStep >= steps) {
                    clearInterval(timer);
                }
            }, stepDuration);
        };

        // Start animation after component mounts
        const timer = setTimeout(animateCounters, 500);
        return () => clearTimeout(timer);
    }, []);

    if (loading) {
        return (
            <div className="about-page">
                <div className="about-loading">Đang tải...</div>
            </div>
        );
    }

    return (
        <div className="about-page">
            {/* Hero Section */}
            <section className="about-hero">
                <div className="about-hero-background">
                    <div className="about-hero-overlay"></div>
                </div>
                <div className="about-hero-content">
                    <div className="about-hero-text">
                        <h1 className="about-hero-title">
                            Chào mừng đến với <span className="about-highlight">{shopInfo?.name || 'Cửa hàng'}</span>
                        </h1>
                        <p className="about-hero-subtitle">
                            Nơi hội tụ những sản phẩm chất lượng cao, phục vụ tận tâm với tình yêu thương
                        </p>
                        <div className="about-hero-buttons">
                            <button className="about-btn-primary" onClick={() => navigate('/huong-dan')}>
                                Hướng dẫn đặt hàng
                            </button>
                            <button className="about-btn-secondary" onClick={() => navigate('/san-pham')}>
                                Đặt hàng ngay
                            </button>
                        </div>
                    </div>
                    <div className="about-hero-image">
                        <div className="about-floating-card about-card-1">
                            <i className="fas fa-star"></i>
                            <span>Chất lượng 5 sao</span>
                        </div>
                        <div className="about-floating-card about-card-2">
                            <i className="fas fa-shipping-fast"></i>
                            <span>Giao hàng nhanh</span>
                        </div>
                        <div className="about-floating-card about-card-3">
                            <i className="fas fa-heart"></i>
                            <span>Yêu thương khách hàng</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="about-stats-section">
                <div className="about-container">
                    <h2 className="about-section-title">Con số biết nói</h2>
                    <div className="about-stats-grid">
                        <div className="about-stat-item">
                            <div className="about-stat-icon">
                                <i className="fas fa-users"></i>
                            </div>
                            <div className="about-stat-number" data-target={counters.customers}>
                                {counters.customers.toLocaleString()}+
                            </div>
                            <div className="about-stat-label">Khách hàng tin tưởng</div>
                        </div>
                        <div className="about-stat-item">
                            <div className="about-stat-icon">
                                <i className="fas fa-box"></i>
                            </div>
                            <div className="about-stat-number" data-target={counters.products}>
                                {counters.products}+
                            </div>
                            <div className="about-stat-label">Sản phẩm đa dạng</div>
                        </div>
                        <div className="about-stat-item">
                            <div className="about-stat-icon">
                                <i className="fas fa-shopping-cart"></i>
                            </div>
                            <div className="about-stat-number" data-target={counters.orders}>
                                {counters.orders.toLocaleString()}+
                            </div>
                            <div className="about-stat-label">Đơn hàng thành công</div>
                        </div>
                        <div className="about-stat-item">
                            <div className="about-stat-icon">
                                <i className="fas fa-calendar-alt"></i>
                            </div>
                            <div className="about-stat-number" data-target={counters.years}>
                                {counters.years}+
                            </div>
                            <div className="about-stat-label">Năm kinh nghiệm</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* About Story Section */}
            <section className="about-story">
                <div className="about-container">
                    <div className="about-story-content">
                        <div className="about-story-text">
                            <h2 className="about-section-title">Câu chuyện của chúng tôi</h2>
                            <div className="about-story-paragraphs">
                                <p>
                                    {shopInfo?.name || 'Cửa hàng'} được thành lập với tầm nhìn mang đến những sản phẩm chất lượng cao và
                                    dịch vụ chuyên nghiệp cho mọi khách hàng. Từ những ngày đầu với niềm đam mê và tình
                                    yêu thương, chúng tôi đã không ngừng phát triển và hoàn thiện.
                                </p>
                                <p>
                                    Với đội ngũ nhân viên tận tâm và giàu kinh nghiệm, chúng tôi cam kết mang đến trải
                                    nghiệm mua sắm tuyệt vời nhất. Mỗi sản phẩm đều được chọn lọc kỹ lưỡng, đảm bảo chất
                                    lượng và giá trị tốt nhất cho khách hàng.
                                </p>
                                <p>
                                    Chúng tôi tin rằng, thành công không chỉ đến từ sản phẩm chất lượng mà còn từ sự tin
                                    tưởng và hài lòng của khách hàng. Đó chính là động lực để chúng tôi không ngừng cải
                                    thiện và phát triển.
                                </p>
                            </div>
                        </div>
                        <div className="about-story-image">
                            <div className="about-image-container">
                                <img
                                    src={`${API_BASE}${shopInfo?.logo_image || '/default-logo.png'}`}
                                    alt={`${shopInfo?.name || 'Cửa hàng'} - Câu chuyện`}
                                    className="about-story-img"
                                />
                                <div className="about-image-overlay">
                                    <div className="about-overlay-content">
                                        <i className="fas fa-quote-left"></i>
                                        <p>"Chất lượng là ưu tiên hàng đầu"</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Values Section */}
            <section className="about-values-section">
                <div className="about-container">
                    <h2 className="about-section-title">Giá trị cốt lõi</h2>
                    <div className="about-values-grid">
                        <div className="about-value-item">
                            <div className="about-value-icon">
                                <i className="fas fa-gem"></i>
                            </div>
                            <h3>Chất lượng cao</h3>
                            <p>
                                Mỗi sản phẩm đều được kiểm tra kỹ lưỡng, đảm bảo chất lượng tốt nhất trước khi đến tay
                                khách hàng.
                            </p>
                        </div>
                        <div className="about-value-item">
                            <div className="about-value-icon">
                                <i className="fas fa-handshake"></i>
                            </div>
                            <h3>Tin cậy</h3>
                            <p>Xây dựng mối quan hệ lâu dài với khách hàng thông qua sự trung thực và minh bạch.</p>
                        </div>
                        <div className="about-value-item">
                            <div className="about-value-icon">
                                <i className="fas fa-heart"></i>
                            </div>
                            <h3>Tận tâm</h3>
                            <p>Phục vụ khách hàng với tất cả tình yêu thương và sự chăm sóc chu đáo nhất.</p>
                        </div>
                        <div className="about-value-item">
                            <div className="about-value-icon">
                                <i className="fas fa-rocket"></i>
                            </div>
                            <h3>Đổi mới</h3>
                            <p>Không ngừng cải tiến và phát triển để mang đến trải nghiệm tốt nhất cho khách hàng.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Google Reviews Section */}
            <section className="about-reviews-section">
                <div className="about-container">
                    <h2 className="about-section-title">Đánh giá từ khách hàng</h2>
                    <div className="about-google-reviews">
                        <div className="about-reviews-header">
                            <div className="about-google-logo">
                                <i className="fab fa-google"></i>
                                <span>Google Reviews</span>
                            </div>
                            <div className="about-rating-summary">
                                <div className="about-rating-stars">
                                    <i className="fas fa-star"></i>
                                    <i className="fas fa-star"></i>
                                    <i className="fas fa-star"></i>
                                    <i className="fas fa-star"></i>
                                    <i className="fas fa-star"></i>
                                </div>
                                <div className="about-rating-score">4.9/5</div>
                                <div className="about-rating-count">Dựa trên 127 đánh giá</div>
                            </div>
                        </div>
                        <div className="about-reviews-grid">
                            <div className="about-review-card">
                                <div className="about-review-header">
                                    <div className="about-reviewer-info">
                                        <div className="about-reviewer-avatar">N</div>
                                        <div className="about-reviewer-details">
                                            <div className="about-reviewer-name">Nhat_z286</div>
                                            <div className="about-review-date">2 tuần trước</div>
                                        </div>
                                    </div>
                                    <div className="about-review-rating">
                                        <i className="fas fa-star"></i>
                                        <i className="fas fa-star"></i>
                                        <i className="fas fa-star"></i>
                                        <i className="fas fa-star"></i>
                                        <i className="fas fa-star"></i>
                                    </div>
                                </div>
                                <div className="about-review-content">
                                    "Sản phẩm chất lượng tuyệt vời, giao hàng nhanh chóng. Nhân viên tư vấn rất nhiệt
                                    tình. Sẽ ủng hộ lâu dài!"
                                </div>
                            </div>
                            <div className="about-review-card">
                                <div className="about-review-header">
                                    <div className="about-reviewer-info">
                                        <div className="about-reviewer-avatar">L</div>
                                        <div className="about-reviewer-details">
                                            <div className="about-reviewer-name">Linhnt_@37z2</div>
                                            <div className="about-review-date">1 tháng trước</div>
                                        </div>
                                    </div>
                                    <div className="about-review-rating">
                                        <i className="fas fa-star"></i>
                                        <i className="fas fa-star"></i>
                                        <i className="fas fa-star"></i>
                                        <i className="fas fa-star"></i>
                                        <i className="fas fa-star"></i>
                                    </div>
                                </div>
                                <div className="about-review-content">
                                    "Cửa hàng rất chuyên nghiệp, sản phẩm đa dạng và giá cả hợp lý. Đặc biệt là dịch vụ
                                    chăm sóc khách hàng rất tốt."
                                </div>
                            </div>
                            <div className="about-review-card">
                                <div className="about-review-header">
                                    <div className="about-reviewer-info">
                                        <div className="about-reviewer-avatar">T</div>
                                        <div className="about-reviewer-details">
                                            <div className="about-reviewer-name">Tuấn Lê Quốc</div>
                                            <div className="about-review-date">3 tuần trước</div>
                                        </div>
                                    </div>
                                    <div className="about-review-rating">
                                        <i className="fas fa-star"></i>
                                        <i className="fas fa-star"></i>
                                        <i className="fas fa-star"></i>
                                        <i className="fas fa-star"></i>
                                        <i className="fas fa-star"></i>
                                    </div>
                                </div>
                                <div className="about-review-content">
                                    "Tôi đã mua sắm ở đây nhiều lần và luôn hài lòng. Sản phẩm chất lượng, bao bì đẹp,
                                    giao hàng đúng hẹn."
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="about-cta-section">
                <div className="about-container">
                    <div className="about-cta-content">
                        <h2>Bạn đã sẵn sàng trải nghiệm?</h2>
                        <p>Hãy để chúng tôi mang đến cho bạn những sản phẩm chất lượng nhất</p>
                        <div className="about-cta-buttons">
                            <button className="about-btn-primary" onClick={() => navigate('/san-pham')}>
                                Xem sản phẩm ngay
                            </button>
                            <button className="about-btn-outline" onClick={() => navigate('/huong-dan')}>
                                Xem hướng dẫn
                            </button>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
