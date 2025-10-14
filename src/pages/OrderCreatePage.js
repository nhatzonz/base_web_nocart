import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../assets/css/order.css';
import { API_BASE } from '../components/Api_base';

export default function OrderCreatePage() {
    const { state } = useLocation();
    const navigate = useNavigate();
    useEffect(() => {
        document.title = 'Thông tin đặt hàng | Cửa hàng trực tuyến';
    }, []);

    if (!state) {
        return (
            <div className="container">
                <p>Không có dữ liệu đơn hàng. Vui lòng chọn sản phẩm lại.</p>
                <button onClick={() => navigate('/trang-chu')}>Về trang chủ</button>
            </div>
        );
    }

    const { product_id, name, code, category, main_image, attributes, quantity, unit_price, total } = state;

    return (
        <div className="order-container">
            <h2 className="order-title">Thông tin đặt hàng</h2>

            {/* Product Summary - Always at top */}
            <div className="order-summary-card">
                {main_image && <img src={`${API_BASE}${main_image}`} alt={name} className="order-summary-image" />}
                <div className="order-summary-name">{name}</div>
                <div className="order-summary-muted">Mã sản phẩm: {code || '—'}</div>
                <div className="order-summary-muted">Danh mục: {category?.name || 'Chưa phân loại'}</div>
                <ul className="order-attrs">
                    {attributes.map((a, i) => (
                        <li key={i}>
                            {a.attribute_name}: {a.value}
                            {a.extra_price > 0 && ` (+${a.extra_price.toLocaleString('vi-VN')}đ)`}
                        </li>
                    ))}
                </ul>
                <div className="order-line">
                    Đơn giá: <span className="order-strong">{unit_price.toLocaleString('vi-VN')} đ</span>
                </div>
                <div className="order-line">
                    Số lượng: <span className="order-strong">{quantity}</span>
                </div>
                <div className="order-line">
                    Thành tiền: <span className="order-strong">{total.toLocaleString('vi-VN')} đ</span>
                </div>
            </div>

            {/* Order Form */}
            <OrderFormSummary summary={{ product_id, name, code, category, attributes, quantity, unit_price, total }} />
        </div>
    );
}

function OrderFormSummary({ summary }) {
    const navigate = useNavigate();

    // State cho tỉnh, huyện, xã
    const [provinces, setProvinces] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [wards, setWards] = useState([]);
    const [selectedProvince, setSelectedProvince] = useState('');
    const [selectedDistrict, setSelectedDistrict] = useState('');
    const [selectedWard, setSelectedWard] = useState('');

    // State cho thông tin cá nhân (để lưu và fill lại)
    const [customerInfo, setCustomerInfo] = useState({
        customer_name: '',
        customer_phone: '',
        address: '',
        delivery_time: '',
        message_on_product: '',
        provinces: '',
        districts: '',
        wards: '',
    });

    // Lấy dữ liệu từ localStorage khi load trang
    useEffect(() => {
        const savedInfo = localStorage.getItem('customer_info');
        if (savedInfo) {
            try {
                const parsed = JSON.parse(savedInfo);
                setCustomerInfo(parsed);
                setSelectedProvince(parsed.selectedProvince || '');
                setSelectedDistrict(parsed.selectedDistrict || '');
                setSelectedWard(parsed.selectedWard || '');
            } catch {
                console.warn('customer_info không hợp lệ trong localStorage');
            }
        }
    }, []);

    // Fetch tỉnh
    useEffect(() => {
        fetch('https://provinces.open-api.vn/api/p/')
            .then((res) => res.json())
            .then((data) => setProvinces(data));
    }, []);

    useEffect(() => {
        if (selectedProvince) {
            fetch(`https://provinces.open-api.vn/api/p/${selectedProvince}?depth=2`)
                .then((res) => res.json())
                .then((data) => setDistricts(data.districts || []));
        } else {
            setDistricts([]);
            setWards([]);
        }
    }, [selectedProvince]);

    useEffect(() => {
        if (selectedDistrict) {
            fetch(`https://provinces.open-api.vn/api/d/${selectedDistrict}?depth=2`)
                .then((res) => res.json())
                .then((data) => setWards(data.wards || []));
        } else {
            setWards([]);
        }
    }, [selectedDistrict]);

    async function submit(e) {
        e.preventDefault();
        const form = new FormData(e.currentTarget);
        const payload = {
            customer_name: form.get('customer_name') || '',
            customer_phone: form.get('customer_phone') || '',
            delivery_type: form.get('delivery_type') || 'self',
            delivery_time: form.get('delivery_time') || null,
            message_on_product: form.get('message_on_cake') || null,
            province: provinces.find((p) => p.code === selectedProvince)?.name || null,
            district: districts.find((d) => d.code === selectedDistrict)?.name || null,
            ward: wards.find((w) => w.code === selectedWard)?.name || null,
            address: form.get('address') || null,
            pickup_branch: form.get('pickup_branch') || null,
            note: form.get('note') || null,
            payment_method: 'cod',
            total: Number(summary.total || 0),
            items: [
                {
                    product_id: summary.product_id,
                    product_name: summary.name,
                    attribute_summary: summary.attributes.map((a) => `${a.attribute_name}: ${a.value}`).join('; '),
                    quantity: summary.quantity,
                    price: summary.unit_price,
                    total: summary.total,
                },
            ],
        };

        const res = await fetch(`${API_BASE}/api/orders/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
            },
            body: JSON.stringify(payload),
        });

        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
            alert(data.message || 'Tạo đơn thất bại');
            return;
        }
        alert('Tạo đơn thành công!');
        navigate('/trang-chu');
    }

    // Hàm lưu thông tin cá nhân
    function saveCustomerInfo() {
        const fullInfo = {
            ...customerInfo,
            selectedProvince,
            selectedDistrict,
            selectedWard,
        };
        localStorage.setItem('customer_info', JSON.stringify(fullInfo));
        alert('Thông tin cá nhân đã được lưu!');
    }

    return (
        <form className="order-form" onSubmit={submit}>
            <div className="order-section-title">Thông tin thanh toán</div>

            <div className="order-row">
                <label>Họ & tên *</label>
                <input
                    name="customer_name"
                    className="order-input"
                    placeholder="Nhập họ và tên"
                    required
                    value={customerInfo.customer_name}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, customer_name: e.target.value })}
                />
            </div>
            <div className="order-row">
                <label>Điện thoại *</label>
                <input
                    name="customer_phone"
                    className="order-input"
                    placeholder="Nhập số điện thoại"
                    required
                    value={customerInfo.customer_phone}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, customer_phone: e.target.value })}
                />
            </div>
            <div className="order-row">
                <label>Phương thức đặt đơn</label>
                <div className="order-radio-group">
                    <label className="order-radio">
                        <input type="radio" name="delivery_type" value="self" defaultChecked />
                        Đặt cho tôi
                    </label>
                    <label className="order-radio">
                        <input type="radio" name="delivery_type" value="gift" />
                        Đặt đơn tặng
                    </label>
                </div>
            </div>

            {/* Thời gian & Nội dung sản phẩm */}
            <div className="order-row">
                <label>Thời gian nhận đơn</label>
                <input
                    type="datetime-local"
                    name="delivery_time"
                    className="order-input"
                    value={customerInfo.delivery_time}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, delivery_time: e.target.value })}
                />
            </div>
            <div className="order-row">
                <label>Nội dung ghi trên sản phẩm</label>
                <input
                    name="message_on_cake"
                    className="order-input"
                    placeholder="Ví dụ: Ghi chú đặc biệt..."
                    value={customerInfo.message_on_product}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, message_on_product: e.target.value })}
                />
            </div>

            {/* Chọn tỉnh/huyện/xã */}
            <div className="order-row">
                <label>Tỉnh/ Thành phố</label>
                <select value={selectedProvince} onChange={(e) => setSelectedProvince(e.target.value)}>
                    <option value="">Chọn Tỉnh/ Thành phố</option>
                    {provinces.map((p) => (
                        <option key={p.code} value={p.code}>
                            {p.name}
                        </option>
                    ))}
                </select>
            </div>
            <div className="order-row">
                <label>Quận/ Huyện</label>
                <select value={selectedDistrict} onChange={(e) => setSelectedDistrict(e.target.value)}>
                    <option value="">Chọn Quận/ Huyện</option>
                    {districts.map((d) => (
                        <option key={d.code} value={d.code}>
                            {d.name}
                        </option>
                    ))}
                </select>
            </div>
            <div className="order-row">
                <label>Xã/ Phường</label>
                <select name="ward" value={selectedWard} onChange={(e) => setSelectedWard(e.target.value)}>
                    <option value="">Chọn Xã/ Phường</option>
                    {wards.map((w) => (
                        <option key={w.code} value={w.code}>
                            {w.name}
                        </option>
                    ))}
                </select>
            </div>

            <div className="order-row">
                <label>Địa chỉ nhận đơn *</label>
                <input
                    name="address"
                    className="order-input"
                    placeholder="Nhập địa chỉ nhận đơn"
                    required
                    value={customerInfo.address}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, address: e.target.value })}
                />
            </div>

            <div className="order-row">
                <label>Nhận đơn ở:</label>
                <select name="pickup_branch" className="order-select">
                    <option value="">Chọn địa điểm nhận đơn</option>
                    <option value="Nhận tại quán">Nhận tại cửa hàng</option>
                    <option value="Nhận tại nhà">Nhận tại nhà</option>
                </select>
            </div>

            <div className="order-section-title">Thông tin bổ sung</div>
            <div className="order-row">
                <label>Ghi chú đơn hàng</label>
                <textarea name="note" className="order-textarea" placeholder="Ghi chú thêm nếu cần..."></textarea>
            </div>

            <div className="order-actions">
                <button type="button" className="order-btn secondary" onClick={() => navigate(-1)}>
                    Quay lại
                </button>
                <button type="button" className="order-btn secondary" onClick={saveCustomerInfo}>
                    Lưu thông tin cho lần sau
                </button>
                <button type="submit" className="order-btn">
                    Xác nhận đặt hàng
                </button>
            </div>
        </form>
    );
}
