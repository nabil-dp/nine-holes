import { useEffect } from 'react';
import { X } from 'lucide-react';

const Modal = ({ isOpen, onClose, title, children, className = '' }) => {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className={`relative bg-white rounded-2xl shadow-xl w-full mx-4 ${className}`} style={{ maxWidth: 480 }}>
        {(title || onClose) && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            {title && <h3 className="font-semibold text-gray-800 text-lg">{title}</h3>}
            {onClose && (
              <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 text-gray-500">
                <X size={18} />
              </button>
            )}
          </div>
        )}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};

export default Modal;
