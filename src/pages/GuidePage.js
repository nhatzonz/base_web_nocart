import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../assets/css/guide.css';
import api from '../components/axios-conf';

export default function GuidePage() {
    const navigate = useNavigate();
    const [shopInfo, setShopInfo] = useState(null);
    const [activeStep, setActiveStep] = useState(0);
    const [currentSection, setCurrentSection] = useState('overview');

    useEffect(() => {
        const fetchShopInfo = async () => {
            try {
                const res = await api.get('/api/shopInfo');
                setShopInfo(res.data);
            } catch (err) {
                console.error('Lỗi fetch shopInfo:', err);
            }
        };
        fetchShopInfo();
    }, []);

    useEffect(() => {
        document.title = `Hướng dẫn đặt hàng | ${shopInfo?.name || 'Cửa hàng'}`;
    }, [shopInfo?.name]);

    const steps = [
        {
            id: 'browse',
            title: 'Tìm kiếm',
            description: 'Khám phá các sản phẩm đa dạng tìm theo tên hoặc mã',
            icon: 'fas fa-search-plus',
            details: [
                'Truy cập trang "Trang chủ" từ menu chính',
                'Sử dụng thanh tìm kiếm để tìm sản phẩm mong muốn',
                'Nhập tên sản phẩm hoặc mã sản phẩm',
                'Xem chi tiết sản phẩm bằng cách click vào ảnh hoặc tên sản phẩm',
            ],
            image: '/api/placeholder/400/300',
            color: '#4CAF50',
        },
        {
            id: 'select',
            title: 'Chọn sản phẩm',
            description: 'Xem chi tiết và chọn sản phẩm phù hợp',
            icon: 'fas fa-eye-dropper',
            details: [
                'Xem ảnh sản phẩm từ nhiều góc độ khác nhau',
                'Đọc mô tả chi tiết về nguyên liệu hoặc chất liệu miêu tả về sản phẩm',
                'Kiểm tra giá cả và các thông tin khác có sẵn như kích thước, màu sắc, số lượng,...',
                'Chọn mua ngay hoặc đặt hàng ngay',
            ],
            image: '/api/placeholder/400/300',
            color: '#2196F3',
        },
        {
            id: 'customize',
            title: 'Đặt hàng',
            description: 'Kiểm tra thông tin đặt hàng và thanh toán',
            icon: 'fas fa-magic',
            details: [
                'Kiểm tra tên sản phẩm và các thuộc tính như kích thước, màu sắc, số lượng,...',
                'Kiểm tra đơn giá, số lượng, tổng tiền của sản phẩm',
                'Thêm thông tin thanh toán như tên, số điện thoại, email, địa chỉ,...',
                'Chọn Lưu thông tin cho lần sau để lưu lại thông tin thanh toán cho các lần mua sắm tiếp theo tại cửa hàng. Quý khách sẽ không cần nhập lại thông tin thanh toán cho các lần mua sắm tiếp theo.',
                'Chọn xác nhận đơn hàng để hoàn tất đặt đơn hàng',
                'Hiển thị thông báo đặt hàng thành công là thành công',
            ],
            image: '/api/placeholder/400/300',
            color: '#FF9800',
        },
        {
            id: 'payment',
            title: 'Thanh toán',
            description: 'Thực hiện thanh toán an toàn',
            icon: 'fas fa-shield-alt',
            details: [
                'Thanh toán khi nhận hàng (COD)',
                'Chuyển khoản trước qua ngân hàng vào tài khoản của cửa hàng',
                'Lưu ý chỉ thanh toán khi đặt hàng thành công và cần cọc, thông tin sẽ được cung cấp đúng theo số điện thoại trên shop, không nhận các cuộc gọi bên ngoài',
                'Nhận hóa đơn và biên lai thanh toán(Liên hệ cửa hàng trước nếu có)',
            ],
            image: '/api/placeholder/400/300',
            color: '#F44336',
        },
        {
            id: 'delivery',
            title: 'Giao hàng',
            description: 'Nhận hàng tận nơi an toàn',
            icon: 'fas fa-shipping-fast',
            details: [
                'Nhận đơn tại nhà hoặc tại cửa hàng theo thông tin đặt hàng',
                'Khi sản phẩm đã được giao, quý khách vui lòng kiểm tra sản phẩm và thanh toán',
                'Nếu có vấn đề về chất lượng, quý khách vui lòng liên hệ cửa hàng để được hỗ trợ',
                'Nếu có thắc mắc về trạng thái đơn hàng, quý khách vui lòng liên hệ cửa hàng để được hỗ trợ',
                'Đơn hàng được hoàn thành từ vài tiếng cho tới vài ngày tuỳ thuộc vào số lượng sản phẩm và địa điểm',
            ],
            image: '/api/placeholder/400/300',
            color: '#607D8B',
        },
        {
            id: 'finish',
            title: 'Cảm ơn quý khách',
            description: 'Quý khách đã đặt hàng thành công',
            icon: 'fas fa-heart',
            details: [
                'Cảm ơn quý khách đã đặt hàng tại cửa hàng',
                'Chúc quý khách có những trải nghiệm tuyệt vời tại cửa hàng',
            ],
            image: '/api/placeholder/400/300',
            color: '#FF9800',
        },
    ];

    const sections = [
        {
            id: 'overview',
            title: 'Tổng quan',
            icon: 'fas fa-info-circle',
        },
        {
            id: 'step-by-step',
            title: 'Từng bước chi tiết',
            icon: 'fas fa-list-ol',
        },
        {
            id: 'tips',
            title: 'Mẹo hay',
            icon: 'fas fa-lightbulb',
        },
        {
            id: 'faq',
            title: 'Câu hỏi thường gặp',
            icon: 'fas fa-question-circle',
        },
    ];

    const tips = [
        {
            title: 'Đặt hàng sớm',
            description: 'Đặt hàng trước 2-3 ngày để đảm bảo có sản phẩm',
            icon: 'fas fa-clock',
        },
        {
            title: 'Chọn loại sản phẩm phù hợp',
            description: 'Chọn kích cỡ, mẫu mã, màu sắc, ... phù hợp với nhu cầu của quý khách',
            icon: 'fas fa-ruler',
        },
        {
            title: 'Cung cấp địa chỉ chính xác',
            description: 'Ghi rõ số nhà, tên đường, quận/huyện',
            icon: 'fas fa-map-marker-alt',
        },
        {
            title: 'Kiểm tra hàng trước khi nhận',
            description: 'Đảm bảo bánh còn nguyên vẹn và đúng loại',
            icon: 'fas fa-check-circle',
        },
    ];

    const faqs = [
        {
            question: 'Tôi có thể đặt hàng trực tuyến không?',
            answer: 'Có, bạn có thể đặt hàng trực tuyến qua website hoặc gọi điện trực tiếp đến hotline của chúng tôi.',
        },
        {
            question: 'Thời gian giao hàng là bao lâu?',
            answer: 'Chúng tôi giao hàng trong vòng 1-3 ngày làm việc tùy thuộc vào địa điểm và loại sản phẩm.',
        },
        {
            question: 'Có thể hủy đơn hàng không?',
            answer: 'Bạn có thể hủy đơn hàng trong vòng 2 giờ sau khi đặt bằng cách gọi cho cửa hàng. Sau thời gian này, đơn hàng đã được chuẩn bị và không thể hủy.',
        },
        {
            question: 'Phí giao hàng là bao nhiêu?',
            answer: 'Miễn phí giao hàng cho đơn hàng từ 500.000đ trong bán kính 10km. Các khu vực khác có phí giao hàng từ 20.000-50.000đ.',
        },
        {
            question: 'Có thể tùy chỉnh sản phẩm theo yêu cầu không?',
            answer: 'Có, chúng tôi nhận tùy chỉnh sản phẩm theo yêu cầu đặc biệt. Vui lòng liên hệ trước để thảo luận chi tiết.',
        },
    ];

    const handleStepClick = (stepIndex) => {
        setActiveStep(stepIndex);
        setCurrentSection('step-by-step');
    };

    const nextStep = () => {
        if (activeStep < steps.length - 1) {
            setActiveStep(activeStep + 1);
        }
    };

    const prevStep = () => {
        if (activeStep > 0) {
            setActiveStep(activeStep - 1);
        }
    };

    return (
        <div className="guide-page">
            {/* Hero Section */}
            <section className="guide-hero">
                <div className="guide-hero-background">
                    <div className="guide-hero-overlay"></div>
                </div>
                <div className="guide-hero-content">
                    <h1 className="guide-hero-title">
                        Hướng dẫn đặt hàng <span className="guide-highlight">{shopInfo?.name || 'Cửa hàng'}</span>
                    </h1>
                    <p className="guide-hero-subtitle">
                        Hướng dẫn chi tiết từng bước để đặt mua hàng dễ dàng và nhanh chóng
                    </p>
                    <div className="guide-hero-actions">
                        <button className="guide-btn-secondary" onClick={() => navigate('/san-pham')}>
                            <i className="fas fa-plus"></i>
                            Đặt hàng ngay
                        </button>
                    </div>
                </div>
            </section>

            {/* Navigation Tabs */}
            <section className="guide-nav-section">
                <div className="guide-container">
                    <div className="guide-nav-tabs">
                        {sections.map((section) => (
                            <button
                                key={section.id}
                                className={`guide-nav-tab ${currentSection === section.id ? 'active' : ''}`}
                                onClick={() => setCurrentSection(section.id)}
                            >
                                <i className={section.icon}></i>
                                <span>{section.title}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* Overview Section */}
            {currentSection === 'overview' && (
                <section className="guide-overview-section">
                    <div className="guide-container">
                        <h2 className="guide-section-title">Quy trình đặt hàng đơn giản</h2>
                        <div className="guide-overview-grid">
                            {steps.map((step, index) => (
                                <div
                                    key={step.id}
                                    className="guide-overview-card"
                                    onClick={() => handleStepClick(index)}
                                >
                                    <div className="guide-overview-number">{index + 1}</div>
                                    <div className="guide-overview-icon" style={{ backgroundColor: step.color }}>
                                        <i className={step.icon}></i>
                                    </div>
                                    <h3>{step.title}</h3>
                                    <p>{step.description}</p>
                                    <div className="guide-overview-arrow">
                                        <i className="fas fa-arrow-right"></i>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Step by Step Section */}
            {currentSection === 'step-by-step' && (
                <section className="guide-steps-section">
                    <div className="guide-container">
                        <div className="guide-steps-header">
                            <h2 className="guide-section-title">Hướng dẫn từng bước chi tiết</h2>
                            <div className="guide-steps-navigation">
                                <button className="guide-nav-btn" onClick={prevStep} disabled={activeStep === 0}>
                                    <i className="fas fa-chevron-left"></i>
                                    Trước
                                </button>
                                <span className="guide-steps-counter">
                                    Bước {activeStep + 1} / {steps.length}
                                </span>
                                <button
                                    className="guide-nav-btn"
                                    onClick={nextStep}
                                    disabled={activeStep === steps.length - 1}
                                >
                                    Sau
                                    <i className="fas fa-chevron-right"></i>
                                </button>
                            </div>
                        </div>

                        <div className="guide-step-content">
                            <div className="guide-step-main">
                                <div className="guide-step-image">
                                    <div
                                        className="guide-step-image-placeholder"
                                        style={{ backgroundColor: steps[activeStep].color }}
                                    >
                                        <i className={steps[activeStep].icon}></i>
                                    </div>
                                </div>
                                <div className="guide-step-info">
                                    <div className="guide-step-header">
                                        <div
                                            className="guide-step-icon"
                                            style={{ backgroundColor: steps[activeStep].color }}
                                        >
                                            <i className={steps[activeStep].icon}></i>
                                        </div>
                                        <div>
                                            <h3>{steps[activeStep].title}</h3>
                                            <p>{steps[activeStep].description}</p>
                                        </div>
                                    </div>
                                    <div className="guide-step-details">
                                        <h4>Các bước thực hiện:</h4>
                                        <ul>
                                            {steps[activeStep].details.map((detail, index) => (
                                                <li key={index}>
                                                    <i className="fas fa-check"></i>
                                                    {detail}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            <div className="guide-step-sidebar">
                                <h4>Danh sách các bước:</h4>
                                <div className="guide-step-list">
                                    {steps.map((step, index) => (
                                        <div
                                            key={step.id}
                                            className={`guide-step-item ${activeStep === index ? 'active' : ''}`}
                                            onClick={() => setActiveStep(index)}
                                        >
                                            <div className="guide-step-item-number">{index + 1}</div>
                                            <div className="guide-step-item-content">
                                                <h5>{step.title}</h5>
                                                <p>{step.description}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* Tips Section */}
            {currentSection === 'tips' && (
                <section className="guide-tips-section">
                    <div className="guide-container">
                        <h2 className="guide-section-title">Mẹo hay khi đặt hàng</h2>
                        <div className="guide-tips-grid">
                            {tips.map((tip, index) => (
                                <div key={index} className="guide-tip-card">
                                    <div className="guide-tip-icon">
                                        <i className={tip.icon}></i>
                                    </div>
                                    <h3>{tip.title}</h3>
                                    <p>{tip.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* FAQ Section */}
            {currentSection === 'faq' && (
                <section className="guide-faq-section">
                    <div className="guide-container">
                        <h2 className="guide-section-title">Câu hỏi thường gặp</h2>
                        <div className="guide-faq-list">
                            {faqs.map((faq, index) => (
                                <div key={index} className="guide-faq-item">
                                    <h4 className="guide-faq-question">
                                        <i className="fas fa-question-circle"></i>
                                        {faq.question}
                                    </h4>
                                    <p className="guide-faq-answer">{faq.answer}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* CTA Section */}
            <section className="guide-cta-section">
                <div className="guide-container">
                    <div className="guide-cta-content">
                        <h2>Bạn đã sẵn sàng đặt hàng?</h2>
                        <p>Hãy bắt đầu trải nghiệm mua sắm tuyệt vời tại {shopInfo?.name || 'Cửa hàng'}</p>
                        <div className="guide-cta-buttons">
                            <button className="guide-btn-primary" onClick={() => navigate('/san-pham')}>
                                <i className="fas fa-shopping-bag"></i>
                                Xem sản phẩm
                            </button>
                            <button className="guide-btn-outline" onClick={() => navigate('/order/create')}>
                                <i className="fas fa-plus"></i>
                                Đặt hàng ngay
                            </button>
                            <button className="guide-btn-outline" onClick={() => navigate('/lien-he')}>
                                <i className="fas fa-phone"></i>
                                Liên hệ hỗ trợ
                            </button>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
