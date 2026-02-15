import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../assets/css/contact.css';
import api from '../components/axios-conf';

// Link mạng xã hội (gắn thủ công)
const SOCIAL_LINKS = {
    facebook: 'https://www.facebook.com/share/1DKX2RouSB/?mibextid=wwXIfr',
    instagram: 'https://www.instagram.com/rosie_orderr',
    tiktok: 'https://www.tiktok.com/@rosie_orderr?_r=1&_t=ZS-93vxJ7ITI4z',
};

export default function ContactPage() {
    const navigate = useNavigate();
    const [shopInfo, setShopInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
    });

    const [selectedInfo, setSelectedInfo] = useState(null);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [submitError, setSubmitError] = useState('');
    const [mapCenter, setMapCenter] = useState({
        lat: 21.0285,
        lng: 105.8542,
    });

    useEffect(() => {
        fetchShopInfo();
    }, []);

    useEffect(() => {
        document.title = `Liên hệ | ${shopInfo?.name || 'Cửa hàng'}`;
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

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitError('');
        setSubmitLoading(true);
        try {
            await api.post('/api/contact-messages', formData);
            alert('Cảm ơn bạn đã liên hệ! Chúng tôi sẽ phản hồi sớm nhất có thể.');
            setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
        } catch (err) {
            const msg = err.response?.data?.message || err.message || 'Gửi tin nhắn thất bại. Vui lòng thử lại.';
            setSubmitError(msg);
        } finally {
            setSubmitLoading(false);
        }
    };

    const handleInfoClick = (infoType, data) => {
        setSelectedInfo({ type: infoType, data });

        // Cập nhật vị trí bản đồ dựa trên loại thông tin
        if (infoType === 'address') {
            // Tọa độ mẫu cho Hà Nội (có thể thay đổi theo địa chỉ thực tế)
            setMapCenter({ lat: 21.0285, lng: 105.8542 });
        }
    };

    const handlePhoneClick = (phone) => {
        window.open(`tel:${phone}`, '_self');
    };

    const handleEmailClick = (email) => {
        window.open(`mailto:${email}`, '_self');
    };

    const handleMapClick = () => {
        // Mở Google Maps với địa chỉ cửa hàng
        const address = shopInfo?.address || 'Chưa có dữ liệu';
        const encodedAddress = encodeURIComponent(address);
        window.open(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`, '_blank');
    };

    if (loading) {
        return (
            <div className="contact-page">
                <div className="contact-loading">Đang tải...</div>
            </div>
        );
    }

    return (
        <div className="contact-page">
            {/* Hero Section */}
            <section className="contact-hero">
                <div className="contact-hero-background">
                    <div className="contact-hero-overlay"></div>
                </div>
                <div className="contact-hero-content">
                    <h1 className="contact-hero-title">
                        Liên hệ với <span className="contact-highlight">{shopInfo?.name || 'Cửa hàng'}</span>
                    </h1>
                    <p className="contact-hero-subtitle">Chúng tôi luôn sẵn sàng lắng nghe và hỗ trợ bạn mọi lúc</p>
                </div>
            </section>

            {/* Contact Info Section */}
            <section className="contact-info-section">
                <div className="contact-container">
                    <h2 className="contact-section-title">Thông tin liên hệ</h2>

                    {/* Selected Info Modal */}
                    {selectedInfo && (
                        <div className="contact-info-modal" onClick={() => setSelectedInfo(null)}>
                            <div className="contact-info-modal-content" onClick={(e) => e.stopPropagation()}>
                                <button className="contact-info-modal-close" onClick={() => setSelectedInfo(null)}>
                                    <i className="fas fa-times"></i>
                                </button>
                                <div className="contact-info-modal-header">
                                    <i
                                        className={`fas fa-${
                                            selectedInfo.type === 'address'
                                                ? 'map-marker-alt'
                                                : selectedInfo.type === 'hours'
                                                  ? 'clock'
                                                  : 'info-circle'
                                        }`}
                                    ></i>
                                    <h3>
                                        {selectedInfo.type === 'address'
                                            ? 'Địa chỉ cửa hàng'
                                            : selectedInfo.type === 'hours'
                                              ? 'Giờ mở cửa'
                                              : 'Thông tin chi tiết'}
                                    </h3>
                                </div>
                                <div className="contact-info-modal-body">
                                    <p>{selectedInfo.data}</p>
                                    {selectedInfo.type === 'address' && (
                                        <div className="contact-info-modal-actions">
                                            <button
                                                className="contact-info-modal-btn"
                                                onClick={() => {
                                                    const encodedAddress = encodeURIComponent(selectedInfo.data);
                                                    window.open(
                                                        `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`,
                                                        '_blank',
                                                    );
                                                }}
                                            >
                                                <i className="fas fa-map-marker-alt"></i>
                                                Xem trên Google Maps
                                            </button>
                                            <button
                                                className="contact-info-modal-btn"
                                                onClick={() => {
                                                    navigator.clipboard.writeText(selectedInfo.data);
                                                    alert('Đã copy địa chỉ vào clipboard!');
                                                }}
                                            >
                                                <i className="fas fa-copy"></i>
                                                Copy địa chỉ
                                            </button>
                                        </div>
                                    )}
                                    {selectedInfo.type === 'hours' && (
                                        <div className="contact-info-modal-extra">
                                            <h4>Lưu ý:</h4>
                                            <ul>
                                                <li>Giờ mở cửa có thể thay đổi trong các ngày lễ</li>
                                                <li>Vui lòng gọi điện trước khi đến để đảm bảo cửa hàng đang mở</li>
                                                <li>Chúng tôi có thể phục vụ ngoài giờ nếu có đặt trước</li>
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                    <div className="contact-info-grid">
                        <div
                            className="contact-info-card contact-clickable"
                            onClick={() => handleInfoClick('address', shopInfo?.address || 'chưa có dữ liệu')}
                        >
                            <div className="contact-info-icon">
                                <i className="fas fa-map-marker-alt"></i>
                            </div>
                            <h3>Địa chỉ cửa hàng</h3>
                            <p>{shopInfo?.address || 'chưa có dữ liệu'}</p>
                            <div className="contact-info-action">
                                <i className="fas fa-external-link-alt"></i>
                                {/* <span>Xem trên bản đồ</span> */}
                            </div>
                        </div>
                        <div
                            className="contact-info-card contact-clickable"
                            onClick={() => handlePhoneClick(shopInfo?.phone || '0387556219')}
                        >
                            <div className="contact-info-icon">
                                <i className="fas fa-phone"></i>
                            </div>
                            <h3>Số điện thoại</h3>
                            <p>{shopInfo?.phone || 'chưa có dữ liệu'}</p>
                            <div className="contact-info-action">
                                <i className="fas fa-phone"></i>
                                {/* <span>Gọi ngay</span> */}
                            </div>
                        </div>
                        <div
                            className="contact-info-card contact-clickable"
                            onClick={() => handleEmailClick(shopInfo?.email || 'nhatzonz@gmail.com')}
                        >
                            <div className="contact-info-icon">
                                <i className="fas fa-envelope"></i>
                            </div>
                            <h3>Email</h3>
                            <p>{shopInfo?.email || 'chưa có dữ liệu'}</p>
                            <div className="contact-info-action">
                                <i className="fas fa-envelope"></i>
                                {/* <span>Gửi email</span> */}
                            </div>
                        </div>
                        <div
                            className="contact-info-card contact-clickable"
                            onClick={() =>
                                handleInfoClick('hours', shopInfo?.opening_hours || 'Thứ 2 - Chủ nhật: 8:00 - 22:00')
                            }
                        >
                            <div className="contact-info-icon">
                                <i className="fas fa-clock"></i>
                            </div>
                            <h3>Giờ mở cửa</h3>
                            <p>{shopInfo?.opening_hours || 'Thứ 2 - Chủ nhật: 8:00 - 22:00'}</p>
                            <div className="contact-info-action">
                                <i className="fas fa-info-circle"></i>
                                {/* <span>Xem chi tiết</span> */}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Contact Form & Map Section */}
            <section className="contact-form-map-section">
                <div className="contact-container">
                    <div className="contact-form-map-grid">
                        {/* Contact Form */}
                        <div className="contact-form-container">
                            <h3 className="contact-form-title">Gửi tin nhắn cho chúng tôi</h3>
                            <form className="contact-form" onSubmit={handleSubmit}>
                                <div className="contact-form-row">
                                    <div className="contact-form-group">
                                        <label htmlFor="name">Họ và tên *</label>
                                        <input
                                            type="text"
                                            id="name"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            required
                                            placeholder="Nhập họ và tên của bạn"
                                        />
                                    </div>
                                    <div className="contact-form-group">
                                        <label htmlFor="email">Email *</label>
                                        <input
                                            type="email"
                                            id="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            required
                                            placeholder="Nhập email của bạn"
                                        />
                                    </div>
                                </div>
                                <div className="contact-form-row">
                                    <div className="contact-form-group">
                                        <label htmlFor="phone">Số điện thoại</label>
                                        <input
                                            type="tel"
                                            id="phone"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleInputChange}
                                            placeholder="Nhập số điện thoại"
                                        />
                                    </div>
                                    <div className="contact-form-group">
                                        <label htmlFor="subject">Chủ đề *</label>
                                        <select
                                            id="subject"
                                            name="subject"
                                            value={formData.subject}
                                            onChange={handleInputChange}
                                            required
                                        >
                                            <option value="">Chọn chủ đề</option>
                                            <option value="product">Hỏi về sản phẩm</option>
                                            <option value="order">Hỏi về đơn hàng</option>
                                            <option value="shipping">Hỏi về giao hàng</option>
                                            <option value="complaint">Khiếu nại</option>
                                            <option value="suggest">Feedback</option>
                                            <option value="other">Khác</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="contact-form-group">
                                    <label htmlFor="message">Nội dung tin nhắn *</label>
                                    <textarea
                                        id="message"
                                        name="message"
                                        value={formData.message}
                                        onChange={handleInputChange}
                                        required
                                        rows="5"
                                        placeholder="Nhập nội dung tin nhắn của bạn..."
                                    ></textarea>
                                </div>
                                {submitError && (
                                    <div className="contact-form-error" style={{ color: '#c0392b', marginBottom: 12 }}>
                                        {submitError}
                                    </div>
                                )}
                                <button type="submit" className="contact-submit-btn" disabled={submitLoading}>
                                    <i className="fas fa-paper-plane"></i>
                                    {submitLoading ? 'Đang gửi...' : 'Gửi tin nhắn'}
                                </button>
                            </form>
                        </div>

                        {/* Map */}
                        <div className="contact-map-container">
                            <h3 className="contact-map-title">Vị trí cửa hàng</h3>
                            <div className="contact-map" onClick={handleMapClick}>
                                <iframe
                                    src={`https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3724.123456789!2d${
                                        mapCenter.lng
                                    }!3d${
                                        mapCenter.lat
                                    }!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjHCsDAxJzQyLjYiTiAxMDXCsDUxJzE1LjEiRQ!5e0!3m2!1svi!2s!4v1234567890123!5m2!1svi!2s&q=${encodeURIComponent(
                                        shopInfo?.address || 'chưa có dữ liệu',
                                    )}`}
                                    width="100%"
                                    height="400"
                                    style={{ border: 0 }}
                                    allowFullScreen=""
                                    loading="lazy"
                                    referrerPolicy="no-referrer-when-downgrade"
                                    title={`Vị trí ${shopInfo?.name || 'Cửa hàng'}`}
                                ></iframe>
                                <div className="contact-map-overlay">
                                    <div className="contact-map-info">
                                        <h4>{shopInfo?.name || 'Cửa hàng'}</h4>
                                        <p>{shopInfo?.address || 'chưa có dữ liệu'}</p>
                                        <button className="contact-map-btn">
                                            <i className="fas fa-external-link-alt"></i>
                                            Mở Google Maps
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Social Media Section */}
            <section className="contact-social-section">
                <div className="contact-container">
                    <h2 className="contact-section-title">Kết nối với chúng tôi</h2>
                    <p className="contact-social-subtitle">
                        Theo dõi chúng tôi trên các mạng xã hội để cập nhật thông tin mới nhất
                    </p>
                    <div className="contact-social-grid">
                        <a
                            href={SOCIAL_LINKS.facebook}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="contact-social-link contact-facebook"
                        >
                            <i className="fab fa-facebook-f"></i>
                            <span>Facebook</span>
                        </a>
                        <a
                            href={SOCIAL_LINKS.instagram}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="contact-social-link contact-instagram"
                        >
                            <i className="fab fa-instagram"></i>
                            <span>Instagram</span>
                        </a>
                        <a
                            href={SOCIAL_LINKS.tiktok}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="contact-social-link contact-tiktok"
                        >
                            <i className="fab fa-tiktok"></i>
                            <span>TikTok</span>
                        </a>
                        {/* <a href="#" className="contact-social-link contact-youtube">
                            <i className="fab fa-youtube"></i>
                            <span>YouTube</span>
                        </a> */}
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="contact-faq-section">
                <div className="contact-container">
                    <h2 className="contact-section-title">Câu hỏi thường gặp</h2>
                    <div className="contact-faq-grid">
                        <div className="contact-faq-item">
                            <h4>Làm thế nào để đặt hàng?</h4>
                            <p>
                                Bạn có thể đặt hàng trực tiếp trên website hoặc gọi điện thoại đến số hotline của chúng
                                tôi.
                            </p>
                        </div>
                        <div className="contact-faq-item">
                            <h4>Thời gian giao hàng là bao lâu?</h4>
                            <p>Chúng tôi giao hàng trong vòng 1-3 ngày làm việc tùy thuộc vào địa điểm giao hàng.</p>
                        </div>
                        <div className="contact-faq-item">
                            <h4>Có hỗ trợ đổi trả không?</h4>
                            <p>Có, chúng tôi hỗ trợ đổi trả trong vòng 7 ngày nếu sản phẩm còn nguyên vẹn.</p>
                        </div>
                        <div className="contact-faq-item">
                            <h4>Phương thức thanh toán nào được chấp nhận?</h4>
                            <p>Chúng tôi chấp nhận thanh toán bằng tiền mặt, chuyển khoản, và các loại thẻ tín dụng.</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
