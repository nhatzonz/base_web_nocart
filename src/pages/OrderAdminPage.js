import { useCallback, useEffect, useMemo, useState } from 'react';
import '../assets/css/order-admin.css';
import { API_BASE } from '../components/Api_base';
import api from '../components/axios-conf';

const STATUS_OPTIONS = [
    { value: '', label: 'Tất cả trạng thái' },
    { value: 'pending', label: 'Chờ xác nhận' },
    { value: 'confirmed', label: 'Đã xác nhận' },
    { value: 'shipped', label: 'Đang giao' },
    { value: 'completed', label: 'Hoàn thành' },
    { value: 'cancelled', label: 'Đã hủy' },
];

const PAYMENT_OPTIONS = [
    { value: '', label: 'Tất cả thanh toán' },
    { value: 'cod', label: 'Thanh toán khi nhận hàng' },
    { value: 'bank', label: 'Chuyển khoản' },
];

const DELIVERY_OPTIONS = [
    { value: '', label: 'Tất cả kiểu đặt' },
    { value: 'self', label: 'Đặt cho tôi' },
    { value: 'gift', label: 'Đặt đơn tặng' },
];

const DATE_RANGE_OPTIONS = [
    { value: '', label: 'Tất cả thời gian' },
    { value: 'today', label: 'Hôm nay' },
    { value: '7d', label: '7 ngày qua' },
    { value: '30d', label: '30 ngày qua' },
    { value: '90d', label: '90 ngày qua' },
];

const SORT_OPTIONS = [
    { value: 'created_desc', label: 'Ngày tạo mới nhất' },
    { value: 'created_asc', label: 'Ngày tạo cũ nhất' },
    { value: 'total_desc', label: 'Tổng tiền cao → thấp' },
    { value: 'total_asc', label: 'Tổng tiền thấp → cao' },
    { value: 'status', label: 'Theo trạng thái' },
];

function formatPrice(price) {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
    }).format(price);
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleString('vi-VN');
}

function getStatusColor(status) {
    const colors = {
        pending: '#f39c12',
        confirmed: '#3498db',
        shipped: '#9b59b6',
        completed: '#27ae60',
        cancelled: '#e74c3c',
    };
    return colors[status] || '#95a5a6';
}

function getStatusText(status) {
    const texts = {
        pending: 'Chờ xác nhận',
        confirmed: 'Đã xác nhận',
        shipped: 'Đang giao',
        completed: 'Hoàn thành',
        cancelled: 'Đã hủy',
    };
    return texts[status] || status;
}

function getProductCode(products, productId) {
    const p = products.find((pr) => pr.id === productId);
    return p?.code || 'Chưa có mã sp';
}

function getProductImageUrl(products, productId) {
    const p = products.find((pr) => pr.id === productId);
    const img = p?.images?.[0];
    return img ? `${API_BASE}${img.image_url}` : '';
}

function OrderRow({ order, productCode, productImageUrl, formatPrice, formatDate, getStatusColor, getStatusText, onEdit, onDelete }) {
    const firstProductId = order.items?.[0]?.product_id;

    return (
        <tr className="order-admin-row-hover">
            <td className="order-id">#{order.id}</td>
            <td className="order-image">
                {productImageUrl ? (
                    <img
                        style={{ width: '100px', height: '100px', objectFit: 'contain' }}
                        src={productImageUrl}
                        alt="ảnh sản phẩm"
                    />
                ) : (
                    <span className="order-admin-no-image">—</span>
                )}
            </td>
            <td className="order-customer">
                <div className="customer-name">{order.customer_name}</div>
                <div className="delivery-type">
                    {order.delivery_type === 'self' ? 'Đặt cho tôi' : 'Đặt đơn tặng'}
                </div>
                <div>{productCode}</div>
            </td>
            <td className="order-phone">{order.customer_phone}</td>
            <td className="order-items">
                {order.items?.map((item, index) => (
                    <div key={index} className="order-item">
                        <div className="item-name">{item.product_name}</div>
                        <div className="item-details">
                            SL: {item.quantity} - {formatPrice(item.price)}
                        </div>
                        {item.attribute_summary && (
                            <div className="item-attributes">{item.attribute_summary}</div>
                        )}
                    </div>
                ))}
            </td>
            <td className="order-total">{formatPrice(order.total)}</td>
            <td className="order-status">
                <span
                    className="status-badge"
                    style={{ backgroundColor: getStatusColor(order.status) }}
                >
                    {getStatusText(order.status)}
                </span>
            </td>
            <td className="order-date">{formatDate(order.created_at)}</td>
            <td className="order-actions">
                <div className="order-admin-action-menu">
                    <button
                        type="button"
                        className="action-btn edit-btn"
                        onClick={() => onEdit(order)}
                        aria-label="Sửa đơn hàng"
                    >
                        Sửa
                    </button>
                    <button
                        type="button"
                        className="action-btn delete-btn"
                        onClick={() => onDelete(order.id)}
                        aria-label="Xóa đơn hàng"
                    >
                        Xóa
                    </button>
                </div>
            </td>
        </tr>
    );
}

export default function OrderAdminPage() {
    const [orders, setOrders] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingOrder, setEditingOrder] = useState(null);
    const [showEditForm, setShowEditForm] = useState(false);

    // Filter & sort state (frontend only)
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [filterPayment, setFilterPayment] = useState('');
    const [filterDelivery, setFilterDelivery] = useState('');
    const [filterDateRange, setFilterDateRange] = useState('');
    const [sortBy, setSortBy] = useState('created_desc');

    const token = localStorage.getItem('token');

    const fetchOrders = useCallback(async () => {
        try {
            setLoading(true);
            const [response, productsRes] = await Promise.all([
                api.get('/api/orders', {
                    headers: { Authorization: `Bearer ${token}` },
                }),
                api.get('/api/products', {
                    headers: { Authorization: `Bearer ${token}` },
                }),
            ]);
            setOrders(response.data);
            setProducts(productsRes.data);
        } catch (error) {
            console.error('Lỗi khi lấy danh sách đơn hàng:', error);
            alert('Lỗi khi lấy danh sách đơn hàng');
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    const productMap = useMemo(() => {
        const map = new Map();
        products.forEach((p) => map.set(p.id, p));
        return map;
    }, [products]);

    const filteredAndSortedOrders = useMemo(() => {
        let result = [...orders];

        const q = searchQuery.trim().toLowerCase();
        if (q) {
            result = result.filter((order) => {
                const idStr = String(order.id);
                const name = (order.customer_name || '').toLowerCase();
                const phone = (order.customer_phone || '').replace(/\s/g, '');
                const productCodes = (order.items || []).map(
                    (item) => productMap.get(item.product_id)?.code || ''
                );
                const searchTerms = q.split(/\s+/);
                return searchTerms.some((term) => {
                    if (idStr.includes(term)) return true;
                    if (name.includes(term)) return true;
                    if (phone.includes(term.replace(/\s/g, ''))) return true;
                    return productCodes.some((code) => code.toLowerCase().includes(term));
                });
            });
        }

        if (filterStatus) result = result.filter((o) => o.status === filterStatus);
        if (filterPayment) result = result.filter((o) => (o.payment_method || 'cod') === filterPayment);
        if (filterDelivery) result = result.filter((o) => (o.delivery_type || 'self') === filterDelivery);

        if (filterDateRange) {
            const now = new Date();
            const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            result = result.filter((o) => {
                const d = new Date(o.created_at);
                switch (filterDateRange) {
                    case 'today':
                        return d >= todayStart;
                    case '7d':
                        return d >= new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                    case '30d':
                        return d >= new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                    case '90d':
                        return d >= new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
                    default:
                        return true;
                }
            });
        }

        switch (sortBy) {
            case 'created_asc':
                result.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
                break;
            case 'created_desc':
                result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
                break;
            case 'total_asc':
                result.sort((a, b) => Number(a.total) - Number(b.total));
                break;
            case 'total_desc':
                result.sort((a, b) => Number(b.total) - Number(a.total));
                break;
            case 'status':
                result.sort((a, b) => (a.status || '').localeCompare(b.status || ''));
                break;
            default:
                result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        }

        return result;
    }, [orders, searchQuery, filterStatus, filterPayment, filterDelivery, filterDateRange, sortBy, productMap]);

    const handleResetFilters = () => {
        setSearchQuery('');
        setFilterStatus('');
        setFilterPayment('');
        setFilterDelivery('');
        setFilterDateRange('');
        setSortBy('created_desc');
    };

    const handleDeleteOrder = async (id) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa đơn hàng này?')) return;

        try {
            await api.delete(`/api/orders/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            alert('Xóa đơn hàng thành công');
            fetchOrders();
        } catch (error) {
            console.error('Lỗi khi xóa đơn hàng:', error);
            alert('Lỗi khi xóa đơn hàng');
        }
    };

    const handleEditOrder = (order) => {
        setEditingOrder(order);
        setShowEditForm(true);
    };

    const handleUpdateOrder = async (updatedData) => {
        try {
            await api.put(`/api/orders/${editingOrder.id}`, updatedData, {
                headers: { Authorization: `Bearer ${token}` },
            });
            alert('Cập nhật đơn hàng thành công');
            setShowEditForm(false);
            setEditingOrder(null);
            fetchOrders();
        } catch (error) {
            console.error('Lỗi khi cập nhật đơn hàng:', error);
            alert('Lỗi khi cập nhật đơn hàng');
        }
    };

    if (loading) {
        return (
            <div className="order-admin-container">
                <div className="loading">Đang tải...</div>
            </div>
        );
    }

    return (
        <div className="order-admin-container">
            <header className="order-admin-header">
                <div className="order-admin-header-title-wrap">
                    <h1 className="order-admin-title">Quản lý đơn hàng</h1>
                    <p className="order-admin-subtitle">Theo dõi, tìm kiếm và xử lý đơn hàng</p>
                </div>
                <div className="order-admin-header-actions">
                    <button
                        type="button"
                        className="order-admin-refresh-btn"
                        onClick={fetchOrders}
                        aria-label="Làm mới danh sách"
                    >
                        Làm mới
                    </button>
                </div>
            </header>

            <div className="order-admin-stats">
                <div className="stat-card order-admin-stat-card">
                    <div className="stat-number">{orders.length}</div>
                    <div className="stat-label">Tổng đơn hàng</div>
                </div>
                <div className="stat-card order-admin-stat-card">
                    <div className="stat-number">{orders.filter((o) => o.status === 'pending').length}</div>
                    <div className="stat-label">Chờ xác nhận</div>
                </div>
                <div className="stat-card order-admin-stat-card">
                    <div className="stat-number">{orders.filter((o) => o.status === 'completed').length}</div>
                    <div className="stat-label">Hoàn thành</div>
                </div>
                <div className="stat-card order-admin-stat-card">
                    <div className="stat-number">
                        {formatPrice(orders.reduce((sum, o) => sum + Number(o.total), 0))}
                    </div>
                    <div className="stat-label">Tổng doanh thu</div>
                </div>
            </div>

            <div className="order-admin-filter-bar">
                <input
                    type="search"
                    className="order-admin-search-input"
                    placeholder="Tìm theo mã đơn, tên khách, số điện thoại, mã sản phẩm..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    aria-label="Tìm kiếm đơn hàng"
                />
                <select
                    className="order-admin-filter-select"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    aria-label="Lọc theo trạng thái"
                >
                    {STATUS_OPTIONS.map((o) => (
                        <option key={o.value || 'all'} value={o.value}>
                            {o.label}
                        </option>
                    ))}
                </select>
                <select
                    className="order-admin-filter-select"
                    value={filterPayment}
                    onChange={(e) => setFilterPayment(e.target.value)}
                    aria-label="Lọc theo phương thức thanh toán"
                >
                    {PAYMENT_OPTIONS.map((o) => (
                        <option key={o.value || 'all'} value={o.value}>
                            {o.label}
                        </option>
                    ))}
                </select>
                <select
                    className="order-admin-filter-select"
                    value={filterDelivery}
                    onChange={(e) => setFilterDelivery(e.target.value)}
                    aria-label="Lọc theo kiểu đặt đơn"
                >
                    {DELIVERY_OPTIONS.map((o) => (
                        <option key={o.value || 'all'} value={o.value}>
                            {o.label}
                        </option>
                    ))}
                </select>
                <select
                    className="order-admin-filter-select"
                    value={filterDateRange}
                    onChange={(e) => setFilterDateRange(e.target.value)}
                    aria-label="Lọc theo khoảng ngày"
                >
                    {DATE_RANGE_OPTIONS.map((o) => (
                        <option key={o.value || 'all'} value={o.value}>
                            {o.label}
                        </option>
                    ))}
                </select>
                <select
                    className="order-admin-sort-select"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    aria-label="Sắp xếp"
                >
                    {SORT_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>
                            {o.label}
                        </option>
                    ))}
                </select>
                <button
                    type="button"
                    className="order-admin-filter-btn"
                    aria-label="Áp dụng bộ lọc"
                >
                    Lọc
                </button>
                <button
                    type="button"
                    className="order-admin-reset-btn"
                    onClick={handleResetFilters}
                    aria-label="Đặt lại bộ lọc"
                >
                    Đặt lại
                </button>
            </div>

            <div className="order-admin-table-container order-admin-table-scroll">
                <table className="order-admin-table order-admin-table-sticky order-admin-table-zebra">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Ảnh sản phẩm</th>
                            <th>Khách hàng</th>
                            <th>Số điện thoại</th>
                            <th>Sản phẩm</th>
                            <th>Tổng tiền</th>
                            <th>Trạng thái</th>
                            <th>Ngày tạo</th>
                            <th>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredAndSortedOrders.length === 0 ? (
                            <tr>
                                <td colSpan="9" className="order-admin-empty-state">
                                    Không có đơn hàng phù hợp
                                </td>
                            </tr>
                        ) : (
                            filteredAndSortedOrders.map((order) => {
                                const firstProductId = order.items?.[0]?.product_id;
                                const productCode = firstProductId
                                    ? getProductCode(products, firstProductId)
                                    : 'Chưa có mã sp';
                                const productImageUrl = firstProductId
                                    ? getProductImageUrl(products, firstProductId)
                                    : '';

                                return (
                                    <OrderRow
                                        key={order.id}
                                        order={order}
                                        productCode={productCode}
                                        productImageUrl={productImageUrl}
                                        formatPrice={formatPrice}
                                        formatDate={formatDate}
                                        getStatusColor={getStatusColor}
                                        getStatusText={getStatusText}
                                        onEdit={handleEditOrder}
                                        onDelete={handleDeleteOrder}
                                    />
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {showEditForm && editingOrder && (
                <OrderEditModal
                    order={editingOrder}
                    onClose={() => {
                        setShowEditForm(false);
                        setEditingOrder(null);
                    }}
                    onSave={handleUpdateOrder}
                />
            )}
        </div>
    );
}

function OrderEditModal({ order, onClose, onSave }) {
    const [formData, setFormData] = useState({
        customer_name: order.customer_name || '',
        customer_phone: order.customer_phone || '',
        delivery_type: order.delivery_type || 'self',
        status: order.status || 'pending',
        delivery_time: order.delivery_time || '',
        message_on_cake: order.message_on_cake || '',
        district: order.district || '',
        ward: order.ward || '',
        province: order.province || '',
        address: order.address || '',
        pickup_branch: order.pickup_branch || '',
        note: order.note || '',
        payment_method: order.payment_method || 'cod',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    return (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="order-admin-modal-title">
            <div className="modal-content">
                <div className="modal-header">
                    <h2 id="order-admin-modal-title">Chỉnh sửa đơn hàng #{order.id}</h2>
                    <button
                        type="button"
                        className="modal-close"
                        onClick={onClose}
                        aria-label="Đóng"
                    >
                        ×
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="modal-form">
                    <section className="order-admin-modal-section">
                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="edit-customer_name">Tên khách hàng *</label>
                                <input
                                    id="edit-customer_name"
                                    type="text"
                                    name="customer_name"
                                    value={formData.customer_name}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="edit-customer_phone">Số điện thoại *</label>
                                <input
                                    id="edit-customer_phone"
                                    type="text"
                                    name="customer_phone"
                                    value={formData.customer_phone}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="edit-delivery_type">Phương thức đặt đơn</label>
                                <select
                                    id="edit-delivery_type"
                                    name="delivery_type"
                                    value={formData.delivery_type}
                                    onChange={handleChange}
                                >
                                    <option value="self">Đặt cho tôi</option>
                                    <option value="gift">Đặt đơn tặng</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label htmlFor="edit-status">Trạng thái</label>
                                <select
                                    id="edit-status"
                                    name="status"
                                    value={formData.status}
                                    onChange={handleChange}
                                >
                                    <option value="pending">Chờ xác nhận</option>
                                    <option value="confirmed">Đã xác nhận</option>
                                    <option value="shipped">Đang giao</option>
                                    <option value="completed">Hoàn thành</option>
                                    <option value="cancelled">Đã hủy</option>
                                </select>
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="edit-delivery_time">Thời gian nhận đơn</label>
                                <input
                                    id="edit-delivery_time"
                                    type="datetime-local"
                                    name="delivery_time"
                                    value={formData.delivery_time}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="edit-message_on_cake">Nội dung ghi trên đơn</label>
                                <input
                                    id="edit-message_on_cake"
                                    type="text"
                                    name="message_on_cake"
                                    value={formData.message_on_cake}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                    </section>

                    <section className="order-admin-modal-section">
                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="edit-province">Tỉnh/Thành phố</label>
                                <input
                                    id="edit-province"
                                    type="text"
                                    name="province"
                                    value={formData.province}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="edit-district">Quận/Huyện</label>
                                <input
                                    id="edit-district"
                                    type="text"
                                    name="district"
                                    value={formData.district}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="edit-ward">Xã/Phường</label>
                                <input
                                    id="edit-ward"
                                    type="text"
                                    name="ward"
                                    value={formData.ward}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="edit-address">Địa chỉ</label>
                                <input
                                    id="edit-address"
                                    type="text"
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="edit-pickup_branch">Nhận đơn ở</label>
                                <input
                                    id="edit-pickup_branch"
                                    type="text"
                                    name="pickup_branch"
                                    value={formData.pickup_branch}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="edit-payment_method">Phương thức thanh toán</label>
                                <select
                                    id="edit-payment_method"
                                    name="payment_method"
                                    value={formData.payment_method}
                                    onChange={handleChange}
                                >
                                    <option value="cod">Thanh toán khi nhận hàng</option>
                                    <option value="bank">Chuyển khoản</option>
                                </select>
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="edit-note">Ghi chú</label>
                            <textarea
                                id="edit-note"
                                name="note"
                                value={formData.note}
                                onChange={handleChange}
                                rows="3"
                            />
                        </div>
                    </section>

                    <div className="modal-actions order-admin-modal-footer-sticky">
                        <button type="button" className="btn-secondary" onClick={onClose}>
                            Hủy
                        </button>
                        <button type="submit" className="btn-primary">
                            Lưu thay đổi
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
