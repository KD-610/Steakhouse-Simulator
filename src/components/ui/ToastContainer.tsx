import React from 'react';
import { Bell, CheckCircle2, AlertCircle } from 'lucide-react';

export interface ToastMessage {
  id: string;
  text: string;
  type: 'info' | 'success' | 'error';
}

interface ToastContainerProps {
  toasts: ToastMessage[];
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts }) => {
  return (
    <div className="absolute bottom-6 right-6 z-50 pointer-events-none flex flex-col gap-2 max-w-sm">
      {toasts.map(toast => {
        let colors = 'bg-slate-900/95 border-white/10 text-white';
        let icon = <Bell className="w-4 h-4 text-amber-400 shrink-0" />;

        if (toast.type === 'success') {
          colors = 'bg-emerald-950/95 border-emerald-500/40 text-emerald-100';
          icon = <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />;
        } else if (toast.type === 'error') {
          colors = 'bg-red-950/95 border-red-500/40 text-red-100';
          icon = <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />;
        }

        return (
          <div
            key={toast.id}
            className={`glass-panel ${colors} px-4 py-3 rounded-2xl shadow-2xl border text-xs font-semibold flex items-center gap-2.5 transition-all duration-300 animate-in slide-in-from-bottom-2`}
          >
            {icon}
            <span className="leading-tight">{toast.text}</span>
          </div>
        );
      })}
    </div>
  );
};
