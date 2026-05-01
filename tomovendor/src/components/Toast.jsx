import React, { useState, useEffect } from 'react';

export const useToast = () => {
  const [toasts, setToasts] = useState([]);

  const showToast = (message, type = 'success', duration = 3000) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);

    if (duration) {
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, duration);
    }

    return id;
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return { toasts, showToast, removeToast };
};

export const Toast = ({ toasts, onRemove }) => {
  return (
    <div style={{
      position: 'fixed',
      top: 20,
      right: 20,
      zIndex: 2000,
      display: 'flex',
      flexDirection: 'column',
      gap: '12px'
    }}>
      {toasts.map(toast => (
        <ToastItem key={toast.id} toast={toast} onClose={() => onRemove(toast.id)} />
      ))}
    </div>
  );
};

const ToastItem = ({ toast, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const typeStyles = {
    success: { bg: '#f0fdf4', border: '#22c55e', text: '#16a34a', icon: 'fa-check-circle' },
    error: { bg: '#fef2f2', border: '#ef4444', text: '#dc2626', icon: 'fa-exclamation-circle' },
    warning: { bg: '#fffbeb', border: '#f59e0b', text: '#d97706', icon: 'fa-warning' },
    info: { bg: '#eff6ff', border: '#3b82f6', text: '#2563eb', icon: 'fa-info-circle' }
  };

  const style = typeStyles[toast.type] || typeStyles.success;

  return (
    <div style={{
      background: style.bg,
      border: `1px solid ${style.border}`,
      borderRadius: '8px',
      padding: '16px',
      display: 'flex',
      gap: '12px',
      alignItems: 'center',
      minWidth: '300px',
      color: style.text,
      fontSize: '14px',
      fontWeight: '500',
      animation: 'slideDown 0.2s ease'
    }}>
      <i style={{ fontSize: '18px' }} className={`fas ${style.icon}`}></i>
      <span style={{ flex: 1 }}>{toast.message}</span>
      <button
        onClick={onClose}
        style={{
          background: 'none',
          border: 'none',
          color: 'inherit',
          cursor: 'pointer',
          fontSize: '18px',
          padding: 0,
          opacity: 0.7
        }}
      >
        ×
      </button>
    </div>
  );
};
