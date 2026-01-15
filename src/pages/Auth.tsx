import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, User, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { z } from 'zod';

const emailSchema = z.string().email('البريد الإلكتروني غير صالح');
const passwordSchema = z.string().min(6, 'كلمة المرور يجب أن تكون 6 أحرف على الأقل');

const Auth = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session?.user) {
          const mode = searchParams.get('mode');
          if (mode === 'online') {
            navigate('/online-lobby');
          } else {
            navigate('/');
          }
        }
        setCheckingAuth(false);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const mode = searchParams.get('mode');
        if (mode === 'online') {
          navigate('/online-lobby');
        } else {
          navigate('/');
        }
      }
      setCheckingAuth(false);
    });

    return () => subscription.unsubscribe();
  }, [navigate, searchParams]);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      emailSchema.parse(email);
      passwordSchema.parse(password);
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: 'خطأ في البيانات',
          description: error.errors[0].message,
          variant: 'destructive',
        });
        return;
      }
    }

    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: {
              full_name: username || email.split('@')[0],
            },
          },
        });
        if (error) throw error;
        
        toast({
          title: 'تم التسجيل بنجاح!',
          description: 'مرحباً بك في بلياردو 2026',
        });
      }
    } catch (error: any) {
      let message = 'حدث خطأ غير متوقع';
      if (error.message?.includes('Invalid login credentials')) {
        message = 'البريد الإلكتروني أو كلمة المرور غير صحيحة';
      } else if (error.message?.includes('User already registered')) {
        message = 'هذا البريد الإلكتروني مسجل بالفعل';
      } else if (error.message?.includes('Email not confirmed')) {
        message = 'يرجى تأكيد بريدك الإلكتروني أولاً';
      }
      
      toast({
        title: 'خطأ',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/online-lobby`,
        },
      });
      if (error) throw error;
    } catch (error: any) {
      toast({
        title: 'خطأ',
        description: 'فشل تسجيل الدخول عبر جوجل',
        variant: 'destructive',
      });
      setLoading(false);
    }
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gold" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background overflow-hidden flex flex-col items-center justify-center relative px-4">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-neon/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gold/10 rounded-full blur-3xl" />
      </div>

      {/* Back button */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="absolute top-6 right-6 z-20"
      >
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="text-gold hover:text-gold/80 gap-2"
        >
          <ArrowRight className="w-5 h-5" />
          رجوع
        </Button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gold mb-2">
            {isLogin ? 'تسجيل الدخول' : 'إنشاء حساب'}
          </h1>
          <p className="text-muted-foreground">
            {isLogin ? 'أدخل بياناتك للمتابعة' : 'أنشئ حسابك وابدأ اللعب'}
          </p>
        </div>

        {/* Form */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          onSubmit={handleEmailAuth}
          className="bg-card/50 backdrop-blur-sm border border-border rounded-2xl p-6 space-y-4"
        >
          {!isLogin && (
            <div className="relative">
              <User className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="اسم المستخدم"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="pr-10 bg-background/50 border-border text-right"
              />
            </div>
          )}
          
          <div className="relative">
            <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="email"
              placeholder="البريد الإلكتروني"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pr-10 bg-background/50 border-border text-right"
              required
            />
          </div>

          <div className="relative">
            <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="password"
              placeholder="كلمة المرور"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pr-10 bg-background/50 border-border text-right"
              required
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-12 text-lg font-bold bg-gradient-to-r from-neon to-green-400 text-background hover:from-green-400 hover:to-neon"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : isLogin ? (
              'دخول'
            ) : (
              'تسجيل'
            )}
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">أو</span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={handleGoogleAuth}
            disabled={loading}
            className="w-full h-12 text-lg border-border hover:bg-card gap-3"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            الدخول عبر جوجل
          </Button>

          <p className="text-center text-muted-foreground text-sm">
            {isLogin ? 'ليس لديك حساب؟' : 'لديك حساب بالفعل؟'}
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-gold hover:underline mr-1"
            >
              {isLogin ? 'سجل الآن' : 'سجل دخول'}
            </button>
          </p>
        </motion.form>
      </motion.div>
    </div>
  );
};

export default Auth;
