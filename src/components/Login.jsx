
import React, { useState } from 'react';
import { useAuthContext } from '@/hooks/useAuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Lock, Mail, AlertCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuthContext();
  const { toast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500));

      const result = login(email, password);
      
      if (!result.success) {
        toast({
          variant: "destructive",
          title: "Giriş Başarısız",
          description: result.message
        });
      } else {
        toast({
          title: "Hoşgeldiniz",
          description: `Başarıyla giriş yapıldı.`,
        });
        // Trigger custom event to notify auth context
        window.dispatchEvent(new CustomEvent('user-login', { detail: result.user }));
        // Small delay to ensure state propagates, then reload if needed
        setTimeout(() => {
          // Check if we're still on login page (auth didn't update)
          const currentUser = localStorage.getItem('currentUser');
          if (currentUser) {
            // Force page reload to ensure App component re-renders with new auth state
            window.location.reload();
          }
        }, 300);
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Bir sorun oluştu."
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#111827] flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-gray-800 bg-gray-900/50 backdrop-blur text-gray-100">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-500">
            StratejiPlus
          </CardTitle>
          <CardDescription className="text-gray-400">
            Kurumsal Performans Yönetim Sistemi
          </CardDescription>
          <div className="mt-4 space-y-3">
            {/* Company A */}
            <div className="p-3 bg-blue-900/20 border border-blue-800/30 rounded-lg">
              <p className="font-semibold mb-2 text-blue-300 text-sm">🏢 Company A (TechCorp A)</p>
              <div className="space-y-1.5 text-xs">
                <div className="flex items-center justify-between bg-blue-950/30 p-2 rounded">
                  <span className="text-blue-200">Admin:</span>
                  <div className="text-right">
                    <div className="text-blue-100 font-mono">ahmet@companya.com</div>
                    <div className="text-blue-300">admin123</div>
                  </div>
                </div>
                <div className="flex items-center justify-between bg-blue-950/30 p-2 rounded">
                  <span className="text-blue-200">Manager:</span>
                  <div className="text-right">
                    <div className="text-blue-100 font-mono">ayse@companya.com</div>
                    <div className="text-blue-300">user123</div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Company B */}
            <div className="p-3 bg-green-900/20 border border-green-800/30 rounded-lg">
              <p className="font-semibold mb-2 text-green-300 text-sm">🏭 Company B (Manufacturing B)</p>
              <div className="space-y-1.5 text-xs">
                <div className="flex items-center justify-between bg-green-950/30 p-2 rounded">
                  <span className="text-green-200">Admin:</span>
                  <div className="text-right">
                    <div className="text-green-100 font-mono">mehmet@companyb.com</div>
                    <div className="text-green-300">admin123</div>
                  </div>
                </div>
                <div className="flex items-center justify-between bg-green-950/30 p-2 rounded">
                  <span className="text-green-200">Manager:</span>
                  <div className="text-right">
                    <div className="text-green-100 font-mono">fatma@companyb.com</div>
                    <div className="text-green-300">user123</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-200">Kurumsal E-posta</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-5 w-5 text-gray-500" />
                <Input
                  id="email"
                  type="email"
                  placeholder="isim@kurum.com"
                  className="pl-10 bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus:ring-blue-500"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-200">Şifre</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-500" />
                <Input
                  id="password"
                  type="password"
                  className="pl-10 bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus:ring-blue-500"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              disabled={isLoading}
            >
              {isLoading ? "Giriş yapılıyor..." : "Giriş Yap"}
            </Button>

            <div className="mt-4 p-3 bg-blue-900/20 rounded-lg border border-blue-900/50 flex gap-2">
               <AlertCircle className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
               <div className="text-xs text-blue-200">
                  <p className="font-semibold mb-1">Varsayılan Yönetici Hesabı:</p>
                  <p>E-posta: <strong>admin@stratejiplus.com</strong></p>
                  <p>Şifre: <strong>admin123</strong></p>
               </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
