import React, { createContext, useContext, useState, useCallback } from 'react';
import { FaCheckCircle, FaExclamationCircle, FaInfoCircle, FaTimes } from 'react-icons/fa';

interface Toast {
    id: string;
    type: 'success' | 'error' | 'info';
    message: string;
}

interface ToastContextType {
    showToast: (type: Toast['type'], message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within ToastProvider');
    }
    return context;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const showToast = useCallback((type: Toast['type'], message: string) => {
        const id = Math.random().toString(36).substr(2, 9);
        const newToast: Toast = { id, type, message };

        setToasts((prev) => [...prev, newToast]);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 5000);
    }, []);

    const removeToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}

            {/* Toast Container */}
            <div className="fixed bottom-8 right-8 z-[200] space-y-4 max-w-md">
                {toasts.map((toast) => (
                    <div
                        key={toast.id}
                        className={`
              flex items-start gap-4 p-5 rounded-2xl shadow-2xl backdrop-blur-sm
              animate-slideUp border-2
              ${toast.type === 'success' ? 'bg-green-500/90 border-green-400 text-white' : ''}
              ${toast.type === 'error' ? 'bg-red-500/90 border-red-400 text-white' : ''}
              ${toast.type === 'info' ? 'bg-blue-500/90 border-blue-400 text-white' : ''}
            `}
                    >
                        <div className="flex-shrink-0 mt-0.5">
                            {toast.type === 'success' && <FaCheckCircle size={20} />}
                            {toast.type === 'error' && <FaExclamationCircle size={20} />}
                            {toast.type === 'info' && <FaInfoCircle size={20} />}
                        </div>

                        <p className="flex-1 font-bold text-sm leading-relaxed">
                            {toast.message}
                        </p>

                        <button
                            onClick={() => removeToast(toast.id)}
                            className="flex-shrink-0 hover:opacity-70 transition-opacity"
                        >
                            <FaTimes size={16} />
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
};
