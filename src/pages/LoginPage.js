import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../assets/css/login.css';
import { API_BASE } from '../components/Api_base';

const REMEMBER_USERNAME_KEY = 'remembered_username';
const REMEMBER_PASSWORD_KEY = 'U2FsdGVkX1+G4XkX7PZxk8dZ0q3YH1bXzY9M4u7Y8nQ=';

const encodePassword = (str) => {
    try {
        return btoa(unescape(encodeURIComponent(str || '')));
    } catch {
        return '';
    }
};

const decodePassword = (str) => {
    try {
        return decodeURIComponent(escape(atob(str || '')));
    } catch {
        return '';
    }
};

export default function LoginPage() {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const token = localStorage.getItem('token');

    useEffect(() => {
        const savedUser = localStorage.getItem(REMEMBER_USERNAME_KEY);
        const savedPass = localStorage.getItem(REMEMBER_PASSWORD_KEY);
        if (savedUser) {
            setUsername(savedUser);
            if (savedPass) setPassword(decodePassword(savedPass));
            setRememberMe(true);
        }
    }, []);

    useEffect(() => {
        if (token) {
            navigate('/');
        }
    }, [token, navigate]);

    const onSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/api/users/login/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data.message || 'Login thất bại');
            localStorage.setItem('token', data.token);
            if (rememberMe) {
                localStorage.setItem(REMEMBER_USERNAME_KEY, username);
                localStorage.setItem(REMEMBER_PASSWORD_KEY, encodePassword(password));
            } else {
                localStorage.removeItem(REMEMBER_USERNAME_KEY);
                localStorage.removeItem(REMEMBER_PASSWORD_KEY);
            }
            window.dispatchEvent(new CustomEvent('auth-change'));
            navigate('/');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <div className="login-header">
                    <h2 className="login-title">Đăng nhập Admin</h2>
                    <p className="login-subtitle">Vui lòng nhập tài khoản để truy cập khu vực quản trị</p>
                </div>
                <form onSubmit={onSubmit} className="login-form">
                    <div className="login-field">
                        <label className="login-label" htmlFor="login-username">
                            Tên đăng nhập
                        </label>
                        <input
                            id="login-username"
                            className="login-input"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Nhập tên đăng nhập"
                            required
                        />
                    </div>
                    <div className="login-field">
                        <label className="login-label" htmlFor="login-password">
                            Mật khẩu
                        </label>
                        <input
                            id="login-password"
                            className="login-input"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Nhập mật khẩu"
                            required
                        />
                    </div>
                    <label className="login-remember">
                        <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} />
                        <span>Ghi nhớ thông tin đăng nhập</span>
                    </label>
                    {error && <div className="login-error">{error}</div>}
                    <button className="login-btn" type="submit" disabled={loading}>
                        {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                    </button>
                </form>
            </div>
        </div>
    );
}
