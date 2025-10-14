import React, { createContext, useContext, useState, useCallback } from 'react';
import '../assets/css/toast.css';

const ToastContext = createContext();

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};

const Toast = ({ toast, onRemove }) => {
    React.useEffect(() => {
        const timer = setTimeout(() => {
            onRemove(toast.id);
        }, toast.duration || 3000);

        return () => clearTimeout(timer);
    }, [toast.id, toast.duration, onRemove]);

    return (
        <div className={`toast toast-${toast.type || 'info'}`}>
            <div className="toast-content">
                <div className="toast-icon">
                    {toast.type === 'success' && <i className="fas fa-check-circle"></i>}
                    {toast.type === 'error' && <i className="fas fa-exclamation-circle"></i>}
                    {toast.type === 'warning' && <i className="fas fa-exclamation-triangle"></i>}
                    {toast.type === 'info' && <i className="fas fa-info-circle"></i>}
                </div>
                <div className="toast-message">
                    <div className="toast-title">{toast.title}</div>
                    {toast.message && <div className="toast-description">{toast.message}</div>}
                </div>
                <button className="toast-close" onClick={() => onRemove(toast.id)}>
                    <i className="fas fa-times"></i>
                </button>
            </div>
        </div>
    );
};

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback((toast) => {
        const id = Date.now() + Math.random();
        setToasts(prev => [...prev, { ...toast, id }]);
    }, []);

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    }, []);

    const showSuccess = useCallback((title, message) => {
        addToast({ type: 'success', title, message });
    }, [addToast]);

    const showError = useCallback((title, message) => {
        addToast({ type: 'error', title, message });
    }, [addToast]);

    const showWarning = useCallback((title, message) => {
        addToast({ type: 'warning', title, message });
    }, [addToast]);

    const showInfo = useCallback((title, message) => {
        addToast({ type: 'info', title, message });
    }, [addToast]);

    const value = {
        addToast,
        removeToast,
        showSuccess,
        showError,
        showWarning,
        showInfo
    };

    return (
        <ToastContext.Provider value={value}>
            {children}
            <div className="toast-container">
                {toasts.map(toast => (
                    <Toast key={toast.id} toast={toast} onRemove={removeToast} />
                ))}
            </div>
        </ToastContext.Provider>
    );
};

export default Toast;
