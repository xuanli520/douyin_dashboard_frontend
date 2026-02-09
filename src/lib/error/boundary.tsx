'use client';

import { Component, ErrorInfo, ReactNode } from 'react';
import { CyberButton } from '@/components/ui/cyber/CyberButton';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';
import { AppError, ErrorCategory } from './types';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, info: ErrorInfo) => void;
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
  
  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info);
    this.props.onError?.(error, info);
    
    // 上报错误
    if (process.env.NODE_ENV === 'production') {
      // TODO: 发送到错误监控服务
      console.log('Reporting error to monitoring service:', {
        error,
        componentStack: info.componentStack,
        timestamp: new Date().toISOString(),
      });
    }
  }
  
  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };
  
  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <div className="max-w-md w-full text-center space-y-6">
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-destructive" />
              </div>
            </div>
            
            <h1 className="text-2xl font-bold text-foreground">
              页面出错了
            </h1>
            
            <p className="text-muted-foreground">
              抱歉，页面遇到了意外错误。请尝试刷新页面或返回首页。
            </p>
            
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="text-left p-4 bg-muted rounded-lg overflow-auto max-h-48">
                <pre className="text-xs text-destructive whitespace-pre-wrap">
                  {this.state.error.message}
                  {'\n'}
                  {this.state.error.stack}
                </pre>
              </div>
            )}
            
            <div className="flex gap-3 justify-center">
              <CyberButton 
                variant="outline" 
                onClick={this.handleReset}
                className="gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                重试
              </CyberButton>
              
              <Link href="/">
                <CyberButton className="gap-2">
                  <Home className="w-4 h-4" />
                  返回首页
                </CyberButton>
              </Link>
            </div>
          </div>
        </div>
      );
    }
    
    return this.props.children;
  }
}

// HOC 包装器
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  boundaryProps?: Omit<Props, 'children'>
) {
  return function WithErrorBoundary(props: P) {
    return (
      <ErrorBoundary {...boundaryProps}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
}
