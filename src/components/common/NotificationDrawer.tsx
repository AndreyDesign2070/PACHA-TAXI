import React, { useState } from 'react';
import { Bell, Check, X, Calendar, Package, AlertCircle, Trash2 } from 'lucide-react';
import { AppNotification } from '../../types';
import { PachaStorage } from '../../services/storage';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: AppNotification[];
  onSelectNotification?: (notif: AppNotification) => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  notifications,
  onSelectNotification
}) => {
  const [showConfirmClear, setShowConfirmClear] = useState(false);

  if (!isOpen) return null;

  const handleMarkAll = () => {
    PachaStorage.markAllNotificationsRead();
  };

  const handleClearAll = () => {
    PachaStorage.clearAllNotifications();
    setShowConfirmClear(false);
  };

  const handleDeleteOne = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    PachaStorage.deleteNotification(id);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'BOOKING':
        return <Calendar className="w-4 h-4 text-amber-400" />;
      case 'SHIPMENT':
        return <Package className="w-4 h-4 text-sky-400" />;
      default:
        return <AlertCircle className="w-4 h-4 text-emerald-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-md bg-[#0B192C] border-l border-amber-500/20 text-white h-full flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Bell className="w-5 h-5 text-amber-400" />
            <div>
              <h2 className="text-base font-bold text-white">Notificaciones</h2>
              <span className="text-[11px] text-slate-400">
                {notifications.length} {notifications.length === 1 ? 'mensaje' : 'mensajes'}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            {notifications.length > 0 && (
              <>
                <button
                  id="btn-mark-all-read"
                  onClick={handleMarkAll}
                  className="text-xs text-slate-300 hover:text-amber-400 flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 transition"
                  title="Marcar todas como leídas"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Leídas</span>
                </button>
                <button
                  id="btn-clear-all-notifications"
                  onClick={() => setShowConfirmClear(true)}
                  className="text-xs text-red-300 hover:text-red-200 flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 transition"
                  title="Limpiar todas las notificaciones"
                >
                  <Trash2 className="w-3.5 h-3.5 text-red-400" />
                  <span>Limpiar</span>
                </button>
              </>
            )}
            <button
              id="btn-close-notifications"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Confirmation banner to clear all */}
        {showConfirmClear && (
          <div className="p-3 bg-red-950/80 border-b border-red-500/30 flex items-center justify-between gap-2 text-xs">
            <span className="text-red-200 font-medium">¿Deseas borrar todas las notificaciones?</span>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                id="btn-confirm-clear-notifications"
                onClick={handleClearAll}
                className="px-2.5 py-1 rounded-md bg-red-600 hover:bg-red-500 text-white font-bold text-xs"
              >
                Sí, limpiar
              </button>
              <button
                onClick={() => setShowConfirmClear(false)}
                className="px-2 py-1 rounded-md bg-slate-800 text-slate-300 hover:text-white text-xs"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center text-slate-400">
              <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mb-3">
                <Bell className="w-7 h-7 text-slate-600" />
              </div>
              <p className="text-sm font-bold text-slate-300">Bandeja de notificaciones vacía</p>
              <p className="text-xs text-slate-500 mt-1 max-w-xs">
                Has limpiado todas las notificaciones. Los nuevos avisos de tus viajes y encomiendas aparecerán aquí.
              </p>
            </div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => {
                  PachaStorage.markNotificationRead(notif.id);
                  if (onSelectNotification) onSelectNotification(notif);
                }}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer relative group ${
                  notif.read
                    ? 'bg-slate-900/50 border-slate-800/80 text-slate-300 hover:border-slate-700'
                    : 'bg-[#112240] border-amber-500/30 text-white shadow-md hover:border-amber-400/50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-slate-800/90 shrink-0 mt-0.5">
                    {getIcon(notif.type)}
                  </div>
                  <div className="flex-1 min-w-0 pr-6">
                    <div className="flex items-center justify-between gap-1">
                      <h4 className="text-xs font-bold text-amber-300 truncate">{notif.title}</h4>
                      <span className="text-[10px] text-slate-400 shrink-0 font-mono">
                        {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">{notif.message}</p>
                  </div>
                </div>

                {/* Individual delete button */}
                <button
                  onClick={(e) => handleDeleteOne(e, notif.id)}
                  className="absolute top-2.5 right-2.5 p-1 rounded-lg text-slate-500 hover:text-red-400 hover:bg-slate-800/80 transition opacity-70 hover:opacity-100"
                  title="Eliminar esta notificación"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
