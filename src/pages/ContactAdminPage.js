import { useCallback, useEffect, useState } from 'react';
import '../assets/css/contact-admin.css';
import api from '../components/axios-conf';

const SUBJECT_LABELS = {
    product: 'Hỏi về sản phẩm',
    order: 'Hỏi về đơn hàng',
    shipping: 'Hỏi về giao hàng',
    complaint: 'Khiếu nại',
    suggest: 'Feedback',
    other: 'Khác',
};

export default function ContactAdminPage() {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewingMessage, setViewingMessage] = useState(null);
    const token = localStorage.getItem('token');

    const fetchMessages = useCallback(async () => {
        try {
            setLoading(true);
            const response = await api.get('/api/contact-messages', {
                headers: { Authorization: `Bearer ${token}` },
            });
            setMessages(response.data);
        } catch (error) {
            console.error('Lỗi khi lấy danh sách tin nhắn:', error);
            alert('Lỗi khi lấy danh sách tin nhắn');
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        fetchMessages();
    }, [fetchMessages]);

    const handleDelete = async (id) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa tin nhắn này?')) {
            try {
                await api.delete(`/api/contact-messages/${id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                alert('Xóa tin nhắn thành công');
                setViewingMessage(null);
                fetchMessages();
            } catch (error) {
                console.error('Lỗi khi xóa tin nhắn:', error);
                alert('Lỗi khi xóa tin nhắn');
            }
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString('vi-VN');
    };

    const getSubjectLabel = (subject) => {
        return SUBJECT_LABELS[subject] || subject;
    };

    const truncate = (str, len) => {
        if (!str) return '';
        return str.length > len ? str.substring(0, len) + '...' : str;
    };

    const todayCount = messages.filter((m) => {
        const today = new Date();
        const msgDate = new Date(m.created_at);
        return msgDate.toDateString() === today.toDateString();
    }).length;

    if (loading) {
        return (
            <div className="contact-admin-container">
                <div className="contact-admin-loading">Đang tải...</div>
            </div>
        );
    }

    return (
        <div className="contact-admin-container">
            <div className="contact-admin-header">
                <h1 className="contact-admin-title">Quản lý tin nhắn liên hệ</h1>
                <button className="contact-admin-refresh-btn" onClick={fetchMessages}>
                    Làm mới
                </button>
            </div>

            <div className="contact-admin-stats">
                <div className="contact-admin-stat-card">
                    <div className="contact-admin-stat-number">{messages.length}</div>
                    <div className="contact-admin-stat-label">Tổng tin nhắn</div>
                </div>
                <div className="contact-admin-stat-card">
                    <div className="contact-admin-stat-number">{todayCount}</div>
                    <div className="contact-admin-stat-label">Hôm nay</div>
                </div>
            </div>

            <div className="contact-admin-table-container">
                <table className="contact-admin-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Họ tên</th>
                            <th>Email</th>
                            <th>SĐT</th>
                            <th>Chủ đề</th>
                            <th>Nội dung</th>
                            <th>Ngày gửi</th>
                            <th>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {messages.length === 0 ? (
                            <tr>
                                <td colSpan="8" className="contact-admin-empty">
                                    Chưa có tin nhắn nào
                                </td>
                            </tr>
                        ) : (
                            messages.map((msg) => (
                                <tr key={msg.id}>
                                    <td className="contact-admin-id">#{msg.id}</td>
                                    <td className="contact-admin-name">{msg.name}</td>
                                    <td className="contact-admin-email">{msg.email}</td>
                                    <td className="contact-admin-phone">{msg.phone || '-'}</td>
                                    <td className="contact-admin-subject">{getSubjectLabel(msg.subject)}</td>
                                    <td className="contact-admin-message">{truncate(msg.message, 50)}</td>
                                    <td className="contact-admin-date">{formatDate(msg.created_at)}</td>
                                    <td className="contact-admin-actions">
                                        <button
                                            className="contact-admin-action-btn contact-admin-view-btn"
                                            onClick={() => setViewingMessage(msg)}
                                        >
                                            Xem
                                        </button>
                                        <button
                                            className="contact-admin-action-btn contact-admin-delete-btn"
                                            onClick={() => handleDelete(msg.id)}
                                        >
                                            Xóa
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {viewingMessage && (
                <ContactMessageViewModal
                    message={viewingMessage}
                    onClose={() => setViewingMessage(null)}
                    onDelete={() => handleDelete(viewingMessage.id)}
                />
            )}
        </div>
    );
}

function ContactMessageViewModal({ message, onClose, onDelete }) {
    const getSubjectLabel = (subject) => SUBJECT_LABELS[subject] || subject;

    const formatDate = (dateString) => new Date(dateString).toLocaleString('vi-VN');

    return (
        <div className="contact-admin-modal-overlay" onClick={onClose}>
            <div className="contact-admin-modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="contact-admin-modal-header">
                    <h2>Tin nhắn #{message.id}</h2>
                    <button className="contact-admin-modal-close" onClick={onClose}>
                        ×
                    </button>
                </div>

                <div className="contact-admin-modal-body contact-admin-modal-view-only">
                    <div className="contact-admin-form-group">
                        <label>Họ và tên</label>
                        <div className="contact-admin-form-value">{message.name}</div>
                    </div>
                    <div className="contact-admin-form-group">
                        <label>Email</label>
                        <div className="contact-admin-form-value">
                            <a href={`mailto:${message.email}`}>{message.email}</a>
                        </div>
                    </div>
                    <div className="contact-admin-form-group">
                        <label>Số điện thoại</label>
                        <div className="contact-admin-form-value">
                            {message.phone ? (
                                <a href={`tel:${message.phone}`}>{message.phone}</a>
                            ) : (
                                '-'
                            )}
                        </div>
                    </div>
                    <div className="contact-admin-form-group">
                        <label>Chủ đề</label>
                        <div className="contact-admin-form-value">{getSubjectLabel(message.subject)}</div>
                    </div>
                    <div className="contact-admin-form-group">
                        <label>Ngày gửi</label>
                        <div className="contact-admin-form-value">{formatDate(message.created_at)}</div>
                    </div>
                    <div className="contact-admin-form-group">
                        <label>Nội dung</label>
                        <div className="contact-admin-form-value contact-admin-form-message">{message.message}</div>
                    </div>

                    <div className="contact-admin-modal-actions">
                        <button type="button" className="contact-admin-btn-secondary" onClick={onClose}>
                            Đóng
                        </button>
                        <button type="button" className="contact-admin-btn-danger" onClick={onDelete}>
                            Xóa tin nhắn
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
