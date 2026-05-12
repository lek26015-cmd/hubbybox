'use client';

import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      
      return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] px-8 text-center font-sans">
          <div className="w-20 h-20 bg-rose-50 rounded-[2rem] flex items-center justify-center text-rose-400 mb-6 shadow-sm border border-rose-100">
            <i className="fa-solid fa-bug text-[32px]" aria-hidden="true"></i>
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">เกิดข้อผิดพลาดที่ไม่คาดคิด</h2>
          <p className="text-sm font-medium text-slate-500 max-w-xs leading-relaxed mb-4">
            ขออภัย เกิดปัญหาบางอย่างขึ้น กรุณาลองรีเฟรชหน้านี้อีกครั้ง
          </p>
          <div className="bg-rose-50 border border-rose-100 rounded-xl p-3 mb-6 w-full max-w-xs text-left">
            <p className="text-[10px] font-bold text-rose-500 font-mono break-words">
              {this.state.error?.message || 'Unknown error'}
            </p>
          </div>
          <button
            onClick={() => {
              this.setState({ hasError: false, error: null });
              window.location.reload();
            }}
            className="bg-primary text-white font-bold py-3.5 px-8 rounded-xl shadow-lg shadow-primary/20 active:scale-95 transition-all flex items-center gap-2"
          >
            <i className="fa-solid fa-rotate-right" aria-hidden="true"></i>
            รีเฟรชหน้านี้
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
