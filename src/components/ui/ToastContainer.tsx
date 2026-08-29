"use client";

import React from "react";
import { useToastStore } from "@/hooks/useToast";
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function ToastContainer() {
  const { toasts, removeToast } = useToastStore();

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="pointer-events-auto flex items-center justify-between p-3.5 rounded-xl border border-slate-800 bg-[#0F172A]/90 backdrop-blur-md shadow-2xl text-xs font-medium text-slate-200"
          >
            <div className="flex items-center gap-2.5">
              {toast.type === "success" && (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              )}
              {toast.type === "warning" && (
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
              )}
              {toast.type === "error" && (
                <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
              )}
              {toast.type === "info" && (
                <Info className="w-4 h-4 text-cyan-400 shrink-0" />
              )}
              <span>{toast.message}</span>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-slate-100 p-1 rounded-md transition-colors ml-3"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
