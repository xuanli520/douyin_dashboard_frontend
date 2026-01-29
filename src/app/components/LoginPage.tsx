'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, useInView } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import pigFishIcon from '@/assets/profile.jpg';
import oceanBg from '@/assets/backgrond.jpg';
import { handleAuthError } from '@/services/userService';
import { useUserStore } from '@/stores/userStore';
import RegisterPage from './RegisterPage';

interface LoginPageProps {
  onLogin?: () => void;
}

// 预生成的粒子配置 (避免 SSR/客户端 hydration 不匹配)
const PARTICLES = Array.from({ length: 15 }).map((_, i) => ({
  id: i,
  width: Math.random() * 2 + 1,
  height: Math.random() * 2 + 1,
  left: Math.random() * 100,
  top: Math.random() * 100,
  duration: Math.random() * 10 + 10,
  delay: Math.random() * 5,
}));

// 阿里云验证码2.0配置
const CAPTCHA_REGION = 'cn';
const CAPTCHA_PREFIX = '1fs7dl';
const CAPTCHA_SCENE_ID = '71tobb9u';

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { login: storeLogin, error: userError } = useUserStore();

  const captchaRef = useRef<any>(null);
  const [isCaptchaReady, setIsCaptchaReady] = useState(false);

  const formRef = useRef(null);
  const isMountedRef = useRef(true);
  const isInView = useInView(formRef, { once: true, amount: 0.3 });
  const router = useRouter();
  const searchParams = useSearchParams();
  const pendingCredentialsRef = useRef<{ username: string; password: string } | null>(null);
  const latestCredentialsRef = useRef<{ username: string; password: string }>({ username: '', password: '' });

  useEffect(() => {
    pendingCredentialsRef.current = null;
  }, []);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    latestCredentialsRef.current = { username, password };
  }, [username, password]);

  // 阿里云验证码2.0 初始化
  useEffect(() => {
    // 设置验证码配置
    (window as any).AliyunCaptchaConfig = {
      region: CAPTCHA_REGION,
      prefix: CAPTCHA_PREFIX,
    };

    // 动态加载验证码JS
    const loadCaptcha = () => {
      return new Promise<void>((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://o.alicdn.com/captcha-frontend/aliyunCaptcha/AliyunCaptcha.js';
        script.async = true;
        script.onload = () => resolve();
        document.head.appendChild(script);
      });
    };

    const initCaptcha = async () => {
      try {
        await loadCaptcha();

        // 等待DOM就绪
        await new Promise(resolve => setTimeout(resolve, 100));

        if (!(window as any).initAliyunCaptcha) {
          console.error('initAliyunCaptcha 未定义');
          return;
        }

        (window as any).initAliyunCaptcha({
          SceneId: CAPTCHA_SCENE_ID,
          mode: 'popup',
          element: '#captcha-element',
          button: '#login-button',
          success: async (captchaVerifyParam: string) => {
            const credentials = latestCredentialsRef.current;
            if (credentials.username && credentials.password) {
              await handleLoginLogic({
                username: credentials.username,
                password: credentials.password,
                captchaVerifyParam,
              });
            }
          },
          fail: (result: any) => {
            console.error('验证码失败:', result);
            toast.error('验证码验证失败，请重试');
          },
          getInstance: (instance: any) => {
            captchaRef.current = instance;
            setIsCaptchaReady(true);
          },
        });
      } catch (error) {
        console.error('验证码初始化失败:', error);
      }
    };

    initCaptcha();
  }, []);

  const handleLoginLogic = useCallback(
    async (params: { username: string; password: string; captchaVerifyParam?: string }) => {
      if (!params.username || !params.password) {
        pendingCredentialsRef.current = null;
        return;
      }

      setError(null);
      setLoading(true);

      try {
        const success = await storeLogin(params);
        if (!success) {
          setError(userError || '登录失败');
          toast.error('登录失败', {
            description: userError || '请检查账号和密码',
          });
          return;
        }
        if (onLogin) {
          onLogin();
        } else {
          const redirectPath = searchParams.get('redirect') || '/dashboard';
          router.push(redirectPath);
          toast.success('登录成功', {
            description: '欢迎回到猪鱼数据',
          });
        }
      } catch (err) {
        setError(handleAuthError(err));
        toast.error('登录失败', {
          description: handleAuthError(err),
        });
      } finally {
        setLoading(false);
        pendingCredentialsRef.current = null;
      }
    },
    [onLogin, router, searchParams, userError, storeLogin]
  );

  const handleLoginLogicRef = useRef(handleLoginLogic);

  useEffect(() => {
    handleLoginLogicRef.current = handleLoginLogic;
  }, [handleLoginLogic]);

  // 鼠标视差效果逻辑
  const handleMouseMove = (e: React.MouseEvent) => {
    const { clientX, clientY } = e;
    const moveX = clientX - window.innerWidth / 2;
    const moveY = clientY - window.innerHeight / 2;
    setMousePosition({ x: moveX, y: moveY });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setError('请输入用户名和密码');
      return;
    }

    // 必须通过验证码验证才能登录
    if (!captchaRef.current || !isCaptchaReady) {
      toast.error('验证码加载中，请稍候');
      return;
    }

    const credentials = { username, password };
    pendingCredentialsRef.current = credentials;

    // 触发验证码
    captchaRef.current.show();
  };

  if (isRegisterMode) {
    return (
      <RegisterPage
        onSwitchToLogin={() => setIsRegisterMode(false)}
        onRegisterSuccess={() => {
          setIsRegisterMode(false);
          toast.success('注册成功', {
            description: '请使用您的账号登录',
          });
        }}
      />
    );
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#050714]"
      onMouseMove={handleMouseMove}
    >
      {/* --- 背景层：深海沉浸感 --- */}

      {/* 1. 基础图片与覆盖层 */}
      <div className="absolute inset-0 z-0">
        <motion.div
          className="absolute inset-0 opacity-40 mix-blend-luminosity"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        >
          <img src={oceanBg.src} alt="" className="w-full h-full object-cover grayscale-[30%] contrast-125" />
        </motion.div>
        {/* 渐变遮罩 */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#020410] via-[#0a1525]/70 to-[#020410]/60" />
      </div>

      {/* 2. 极简的动态光斑 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          suppressHydrationWarning
          className="absolute -top-[20%] -left-[10%] w-[60vw] h-[60vw] bg-cyan-500/10 rounded-full blur-[120px]"
          animate={{ x: mousePosition.x * -0.02, y: mousePosition.y * -0.02 }}
        />
        <motion.div
          suppressHydrationWarning
          className="absolute top-[40%] -right-[10%] w-[50vw] h-[50vw] bg-indigo-600/10 rounded-full blur-[100px]"
          animate={{ x: mousePosition.x * -0.03, y: mousePosition.y * -0.03 }}
        />
      </div>

      {/* 3. 悬浮尘埃粒子 */}
      {PARTICLES.map((particle) => (
        <motion.div
          key={particle.id}
          suppressHydrationWarning
          className="absolute bg-white/20 rounded-full blur-[1px]"
          style={{
            width: `${particle.width}px`,
            height: `${particle.height}px`,
            left: `${particle.left}%`,
            top: `${particle.top}%`,
          }}
          animate={{
            y: [0, -100],
            opacity: [0, 0.5, 0],
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            ease: "linear",
            delay: particle.delay
          }}
        />
      ))}

      {/* --- 主内容区 --- */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 flex flex-col lg:flex-row items-center justify-between gap-12">

        {/* 左侧：品牌视觉 */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          className="hidden lg:flex flex-col items-center justify-center w-1/2 relative"
        >
          <div className="relative group perspective-1000">
            {/* 发光效果 */}
            <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/20 to-purple-500/20 rounded-full blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />

            <motion.img
              src={pigFishIcon.src}
              alt="Pig Fish"
              className="relative z-10 w-[480px] object-contain drop-shadow-2xl"
              animate={{
                y: [0, -15, 0],
                rotateZ: [0, 1, 0, -1, 0]
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              style={{
                filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.5))'
              }}
            />

          </div>

          <div className="mt-12 text-center space-y-2">
            <h2 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-100 to-white tracking-tight">
              猪鱼数据
            </h2>
            <p className="text-cyan-200/40 text-sm font-mono tracking-[0.3em] uppercase">
              Enterprise Neural Network v2.0
            </p>
          </div>
        </motion.div>

        {/* 右侧：登录卡片 */}
        <motion.div
          ref={formRef}
          initial={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
          animate={isInView ? { opacity: 1, scale: 1, filter: 'blur(0px)' } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="w-full max-w-[440px]"
        >
          <div
            className="relative overflow-hidden rounded-[32px] p-8 md:p-10 border border-white/[0.08]"
            style={{
              background: 'linear-gradient(145deg, rgba(15, 23, 42, 0.6) 0%, rgba(15, 23, 42, 0.4) 100%)',
              backdropFilter: 'blur(24px)',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), inset 0 1px 0 0 rgba(255, 255, 255, 0.1)'
            }}
          >
            {/* 顶部微光 */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent" />

            <div className="mb-10 text-left">
              <h1 className="text-3xl text-white font-medium tracking-wide mb-2">欢迎回来</h1>
              <p className="text-slate-400 text-sm font-light">请输入您的身份密钥以访问系统</p>
            </div>

            {/* 错误提示 */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-3 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center gap-2 text-red-400 text-sm"
              >
                <AlertCircle size={16} />
                <span>{error}</span>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-6">
                {/* 用户名 */}
                <div className="group relative">
                  <label className="block text-xs font-mono text-cyan-200/60 mb-2 uppercase tracking-wider ml-1">Identity / Email</label>
                  <input
                    type="email"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-[#0a0f1e]/60 border border-white/10 rounded-xl px-4 py-4 text-cyan-50 placeholder-slate-600 focus:outline-none focus:border-cyan-500/50 focus:bg-[#0a0f1e]/80 transition-all duration-300 font-light"
                    placeholder="name@enterprise.com"
                    disabled={loading}
                    required
                  />
                  <div className="absolute bottom-0 left-4 right-4 h-[1px] bg-cyan-500 scale-x-0 group-focus-within:scale-x-100 transition-transform duration-500 ease-out origin-left" />
                </div>

                {/* 密码 */}
                <div className="group relative">
                  <label className="block text-xs font-mono text-cyan-200/60 mb-2 uppercase tracking-wider ml-1">Security / Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-[#0a0f1e]/60 border border-white/10 rounded-xl px-4 py-4 pr-12 text-cyan-50 placeholder-slate-600 focus:outline-none focus:border-pink-500/50 focus:bg-[#0a0f1e]/80 transition-all duration-300 font-light tracking-widest"
                      placeholder="••••••••"
                      disabled={loading}
                      required
                      minLength={1}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-cyan-200 transition-colors"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  <div className="absolute bottom-0 left-4 right-4 h-[1px] bg-pink-500 scale-x-0 group-focus-within:scale-x-100 transition-transform duration-500 ease-out origin-left" />
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400 mt-2">
                <label className="flex items-center cursor-pointer hover:text-cyan-200 transition-colors">
                  <input type="checkbox" className="mr-2 rounded border-white/10 bg-white/5 checked:bg-cyan-500" />
                  <span>记住设备</span>
                </label>
                <a href="#" className="hover:text-cyan-200 transition-colors border-b border-transparent hover:border-cyan-200/30 pb-0.5">忘记密钥?</a>
              </div>

              {/* 阿里云验证码容器 */}
              <div id="captcha-element" style={{ display: 'none' }}></div>

              <motion.button
                id="login-button"
                whileHover={{ scale: loading || !isCaptchaReady ? 1 : 1.01 }}
                whileTap={{ scale: loading || !isCaptchaReady ? 1 : 0.99 }}
                type="submit"
                disabled={loading || !isCaptchaReady}
                className="w-full relative group overflow-hidden rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 p-[1px]"
              >
                <div className="relative bg-[#0b1221] group-hover:bg-opacity-90 transition-all rounded-[11px] py-4 flex items-center justify-center gap-2">
                  {loading ? (
                    <Loader2 size={18} className="animate-spin text-cyan-400" />
                  ) : !isCaptchaReady ? (
                    <span className="relative z-10 flex items-center justify-center gap-2 text-cyan-200/60 font-medium tracking-widest uppercase text-sm">
                      <Loader2 size={16} className="animate-spin" />
                      验证加载中
                    </span>
                  ) : (
                    <>
                      <span className="relative z-10 flex items-center justify-center gap-2 text-white font-medium tracking-widest uppercase text-sm">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                        接入系统
                      </span>
                    </>
                  )}
                </div>
                {!loading && isCaptchaReady && (
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-purple-500 to-cyan-500 opacity-20 group-hover:opacity-100 blur-md transition-opacity duration-500" />
                )}
              </motion.button>

              {/* 注册按钮 */}
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                type="button"
                onClick={() => setIsRegisterMode(true)}
                disabled={loading}
                className="w-full relative group overflow-hidden rounded-xl bg-gradient-to-r from-purple-600/80 to-indigo-600/80 p-[1px] mt-4"
              >
                <div className="relative bg-[#0b1221]/50 group-hover:bg-opacity-90 transition-all rounded-[11px] py-3 flex items-center justify-center gap-2">
                  <span className="relative z-10 flex items-center justify-center gap-2 text-white font-medium tracking-widest uppercase text-sm">
                    创建新账户
                  </span>
                </div>
              </motion.button>
            </form>

            <div className="mt-8 flex items-center gap-4 text-xs text-slate-500 justify-center font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
              SYSTEM OPERATIONAL 99.9%
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
