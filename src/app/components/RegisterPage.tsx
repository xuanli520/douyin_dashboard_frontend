'use client';

import { useState, useRef, useMemo } from 'react';
import { motion, useInView } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, AlertCircle, Loader2, UserPlus } from 'lucide-react';
import pigFishIcon from '@/assets/profile.jpg';
import oceanBg from '@/assets/backgrond.jpg';
import { register, handleAuthError, checkPasswordStrength } from '@/services/userService';

interface RegisterPageProps {
  onSwitchToLogin?: () => void;
  onRegisterSuccess?: () => void;
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

export default function RegisterPage({ onSwitchToLogin, onRegisterSuccess }: RegisterPageProps) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [passwordStrength, setPasswordStrength] = useState<ReturnType<typeof checkPasswordStrength> | null>(null);

  const formRef = useRef(null);
  const isInView = useInView(formRef, { once: true, amount: 0.3 });
  const router = useRouter();

  // 鼠标视差效果逻辑
  const handleMouseMove = (e: React.MouseEvent) => {
    const { clientX, clientY } = e;
    const moveX = clientX - window.innerWidth / 2;
    const moveY = clientY - window.innerHeight / 2;
    setMousePosition({ x: moveX, y: moveY });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== passwordConfirm) {
      setError('两次输入的密码不一致');
      return;
    }

    if (password.length < 8) {
      setError('密码长度至少为8位');
      return;
    }

    const strength = checkPasswordStrength(password);
    if (strength.score < 2) {
      setError('密码强度不足，请包含大小写字母、数字和特殊字符');
      return;
    }

    setLoading(true);

    try {
      await register({ username, email, password });
      if (onRegisterSuccess) {
        onRegisterSuccess();
      } else {
        router.push('/login');
      }
    } catch (err) {
      setError(handleAuthError(err));
    } finally {
      setLoading(false);
    }
  };

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

        {/* 右侧：注册卡片 */}
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
              <h1 className="text-3xl text-white font-medium tracking-wide mb-2">创建账户</h1>
              <p className="text-slate-400 text-sm font-light">加入猪鱼数据企业神经网络</p>
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

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-5">
                {/* 用户名 */}
                <div className="group relative">
                  <label className="block text-xs font-mono text-cyan-200/60 mb-2 uppercase tracking-wider ml-1">Identity / Username</label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-[#0a0f1e]/60 border border-white/10 rounded-xl px-4 py-4 text-cyan-50 placeholder-slate-600 focus:outline-none focus:border-cyan-500/50 focus:bg-[#0a0f1e]/80 transition-all duration-300 font-light"
                    placeholder="选择一个用户名"
                    disabled={loading}
                    required
                  />
                  <div className="absolute bottom-0 left-4 right-4 h-[1px] bg-cyan-500 scale-x-0 group-focus-within:scale-x-100 transition-transform duration-500 ease-out origin-left" />
                </div>

                {/* 邮箱 */}
                <div className="group relative">
                  <label className="block text-xs font-mono text-cyan-200/60 mb-2 uppercase tracking-wider ml-1">Email / Contact</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#0a0f1e]/60 border border-white/10 rounded-xl px-4 py-4 text-cyan-50 placeholder-slate-600 focus:outline-none focus:border-purple-500/50 focus:bg-[#0a0f1e]/80 transition-all duration-300 font-light"
                    placeholder="your@email.com"
                    disabled={loading}
                    required
                  />
                  <div className="absolute bottom-0 left-4 right-4 h-[1px] bg-purple-500 scale-x-0 group-focus-within:scale-x-100 transition-transform duration-500 ease-out origin-left" />
                </div>

                {/* 密码 */}
                <div className="group relative">
                  <label className="block text-xs font-mono text-cyan-200/60 mb-2 uppercase tracking-wider ml-1">Security / Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setPasswordStrength(checkPasswordStrength(e.target.value));
                      }}
                      className="w-full bg-[#0a0f1e]/60 border border-white/10 rounded-xl px-4 py-4 pr-12 text-cyan-50 placeholder-slate-600 focus:outline-none focus:border-pink-500/50 focus:bg-[#0a0f1e]/80 transition-all duration-300 font-light tracking-widest"
                      placeholder="••••••••"
                      disabled={loading}
                      required
                      minLength={8}
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

                  {/* 密码强度指示器 */}
                  {password && (
                    <div className="mt-3 space-y-2">
                      {/* 强度条 */}
                      <div className="h-1.5 rounded-full bg-slate-700 overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 ${passwordStrength?.color || 'bg-red-500'}`}
                          style={{ width: `${((passwordStrength?.score || 0) + 1) * 20}%` }}
                        />
                      </div>
                      {/* 强度文字 */}
                      <div className="flex items-center justify-between text-xs">
                        <span className={passwordStrength?.label === '弱' ? 'text-red-400' : passwordStrength?.label === '中等' ? 'text-yellow-400' : 'text-green-400'}>
                          强度: {passwordStrength?.label || '弱'}
                        </span>
                        <span className="text-slate-500">
                          {password.length}/8+ 字符
                        </span>
                      </div>
                      {/* 密码要求列表 */}
                      <div className="grid grid-cols-2 gap-1 text-xs text-slate-500">
                        <div className={`flex items-center gap-1 ${passwordStrength?.requirements.hasUppercase ? 'text-green-400' : ''}`}>
                          <span className={passwordStrength?.requirements.hasUppercase ? 'text-green-400' : 'text-slate-600'}>[A-Z]</span> 大写字母
                        </div>
                        <div className={`flex items-center gap-1 ${passwordStrength?.requirements.hasLowercase ? 'text-green-400' : ''}`}>
                          <span className={passwordStrength?.requirements.hasLowercase ? 'text-green-400' : 'text-slate-600'}>[a-z]</span> 小写字母
                        </div>
                        <div className={`flex items-center gap-1 ${passwordStrength?.requirements.hasNumber ? 'text-green-400' : ''}`}>
                          <span className={passwordStrength?.requirements.hasNumber ? 'text-green-400' : 'text-slate-600'}>[0-9]</span> 数字
                        </div>
                        <div className={`flex items-center gap-1 ${passwordStrength?.requirements.hasSpecial ? 'text-green-400' : ''}`}>
                          <span className={passwordStrength?.requirements.hasSpecial ? 'text-green-400' : 'text-slate-600'}>[!@#$]</span> 特殊字符
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* 确认密码 */}
                <div className="group relative">
                  <label className="block text-xs font-mono text-cyan-200/60 mb-2 uppercase tracking-wider ml-1">Confirm / Password</label>
                  <div className="relative">
                    <input
                      type={showPasswordConfirm ? 'text' : 'password'}
                      value={passwordConfirm}
                      onChange={(e) => setPasswordConfirm(e.target.value)}
                      className="w-full bg-[#0a0f1e]/60 border border-white/10 rounded-xl px-4 py-4 pr-12 text-cyan-50 placeholder-slate-600 focus:outline-none focus:border-emerald-500/50 focus:bg-[#0a0f1e]/80 transition-all duration-300 font-light tracking-widest"
                      placeholder="••••••••"
                      disabled={loading}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-cyan-200 transition-colors"
                    >
                      {showPasswordConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  <div className="absolute bottom-0 left-4 right-4 h-[1px] bg-emerald-500 scale-x-0 group-focus-within:scale-x-100 transition-transform duration-500 ease-out origin-left" />
                </div>
              </div>

              <motion.button
                whileHover={{ scale: loading ? 1 : 1.01 }}
                whileTap={{ scale: loading ? 1 : 0.99 }}
                type="submit"
                disabled={loading}
                className="w-full relative group overflow-hidden rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 p-[1px]"
              >
                <div className="relative bg-[#0b1221] group-hover:bg-opacity-90 transition-all rounded-[11px] py-4 flex items-center justify-center gap-2">
                  {loading ? (
                    <Loader2 size={18} className="animate-spin text-purple-400" />
                  ) : (
                    <>
                      <span className="relative z-10 flex items-center justify-center gap-2 text-white font-medium tracking-widest uppercase text-sm">
                        <UserPlus size={16} />
                        创建账户
                      </span>
                    </>
                  )}
                </div>
                {!loading && (
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-cyan-500 to-purple-500 opacity-20 group-hover:opacity-100 blur-md transition-opacity duration-500" />
                )}
              </motion.button>

              {/* 切换到登录 */}
              <div className="mt-6 text-center">
                <button
                  type="button"
                  onClick={onSwitchToLogin}
                  className="text-sm text-slate-400 hover:text-cyan-200 transition-colors"
                >
                  已有账户？<span className="text-cyan-400">立即登录</span>
                </button>
              </div>
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
