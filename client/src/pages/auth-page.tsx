// AI_GENERATED_CODE_START
// Descrição: Adição de função helper para formatação de máscara internacional de telefone
// Gerado por: Cursor AI
// Versão: React 19.2.0
// AI_GENERATED_CODE_END
import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { authApi } from "@/lib/api";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import logoImg from "@assets/generated_images/minimalist_logo_icon_for_agrostate.png";
import heroImg from "@assets/generated_images/aerial_view_of_agricultural_land_and_farms.png";

// AI_GENERATED_CODE_START
// Descrição: Função para formatar número de telefone com máscara internacional
// Gerado por: Cursor AI
// Versão: React 19.2.0
// AI_GENERATED_CODE_END
const formatPhoneNumber = (value: string): string => {
  // Remove todos os caracteres não numéricos, exceto o +
  const cleaned = value.replace(/[^\d+]/g, '');
  
  // Se começar com +, mantém formato internacional
  if (cleaned.startsWith('+')) {
    // Remove o + temporariamente para processar apenas números
    const afterPlus = (cleaned as any).slice(1);
    const numbers = (afterPlus as any).replace(/\D/g, '');
    
    // Limita a 15 dígitos (padrão internacional E.164)
    const limitedNumbers = (numbers as any).slice(0, 15);
    
    if (limitedNumbers.length === 0) {
      return '+';
    }
    
    // Formata com espaços para melhor legibilidade
    // +351 912 345 678 (formato português)
    if (limitedNumbers.startsWith('351') && limitedNumbers.length >= 4) {
      const countryCode = (limitedNumbers as any).slice(0, 3);
      const rest = (limitedNumbers as any).slice(3);
      
      if (rest.length <= 3) {
        return `+${countryCode} ${rest}`;
      } else if (rest.length <= 6) {
        return `+${countryCode} ${rest.slice(0, 3)} ${rest.slice(3)}`;
      } else {
        return `+${countryCode} ${rest.slice(0, 3)} ${rest.slice(3, 6)} ${rest.slice(6, 9)}`;
      }
    }
    
    // Para outros países, formata de forma genérica
    if (limitedNumbers.length <= 3) {
      return `+${limitedNumbers}`;
    } else if (limitedNumbers.length <= 6) {
      return `+${limitedNumbers.slice(0, 3)} ${limitedNumbers.slice(3)}`;
    } else if (limitedNumbers.length <= 9) {
      return `+${limitedNumbers.slice(0, 3)} ${limitedNumbers.slice(3, 6)} ${limitedNumbers.slice(6)}`;
    } else {
      return `+${limitedNumbers.slice(0, 3)} ${limitedNumbers.slice(3, 6)} ${limitedNumbers.slice(6, 9)} ${limitedNumbers.slice(9)}`;
    }
  }
  
  // Se não começar com +, assume formato nacional e adiciona código de Portugal (+351)
  const numbers = (cleaned as any).replace(/\D/g, '');
  
  // Se o número começar com 0, remove o 0 e adiciona +351
  if (numbers.startsWith('0')) {
    const withoutZero = (numbers as any).slice(1).slice(0, 9);
    if (withoutZero.length === 0) {
      return '+351';
    } else if (withoutZero.length <= 3) {
      return `+351 ${withoutZero}`;
    } else if (withoutZero.length <= 6) {
      return `+351 ${withoutZero.slice(0, 3)} ${withoutZero.slice(3)}`;
    } else {
      return `+351 ${withoutZero.slice(0, 3)} ${withoutZero.slice(3, 6)} ${withoutZero.slice(6)}`;
    }
  }
  
  // Se já tiver 9 dígitos (formato português), adiciona +351
  if (numbers.length <= 9 && numbers.length > 0) {
    const limited = (numbers as any).slice(0, 9);
    if (limited.length <= 3) {
      return `+351 ${limited}`;
    } else if (limited.length <= 6) {
      return `+351 ${limited.slice(0, 3)} ${limited.slice(3)}`;
    } else {
      return `+351 ${limited.slice(0, 3)} ${limited.slice(3, 6)} ${limited.slice(6)}`;
    }
  }
  
  // Se já tiver mais de 9 dígitos, assume que já inclui código do país
  if (numbers.length > 9) {
    const limited = (numbers as any).slice(0, 15);
    if (limited.startsWith('351')) {
      const rest = (limited as any).slice(3).slice(0, 9);
      if (rest.length <= 3) {
        return `+351 ${rest}`;
      } else if (rest.length <= 6) {
        return `+351 ${rest.slice(0, 3)} ${rest.slice(3)}`;
      } else {
        return `+351 ${rest.slice(0, 3)} ${rest.slice(3, 6)} ${rest.slice(6)}`;
      }
    }
    return `+${limited}`;
  }
  
  return numbers;
};

export default function AuthPage() {
  const { login } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  // Login State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  // Register State
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regNif, setRegNif] = useState("");
  const [regPass, setRegPass] = useState("");
  const [regConfirmPass, setRegConfirmPass] = useState("");
  const [terms, setTerms] = useState(false);
  const [privacy, setPrivacy] = useState(false);
  const [agreement, setAgreement] = useState(false);
  const [registerLoading, setRegisterLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    try {
      await login(email, password);
      setLocation("/dashboard");
    } catch (error: any) {
      toast({
        title: "Erro ao entrar",
        description: error.message || "Erro desconhecido",
        variant: "destructive",
      });
    } finally {
      setLoginLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (regPass !== regConfirmPass) {
      toast({
        title: "Erro",
        description: "As passwords não coincidem",
        variant: "destructive",
      });
      return;
    }
    setRegisterLoading(true);
    try {
      await authApi.register({
        fullName: regName,
        email: regEmail,
        phone: regPhone,
        nif: regNif || undefined,
        password: regPass,
      });
      toast({
        title: "Conta criada com sucesso",
        description: "Aguarde aprovação do administrador para aceder à plataforma.",
      });
      // Clear form
      setRegName("");
      setRegEmail("");
      setRegPhone("");
      setRegNif("");
      setRegPass("");
      setRegConfirmPass("");
      setTerms(false);
      setPrivacy(false);
      setAgreement(false);
    } catch (error: any) {
      toast({
        title: "Erro ao criar conta",
        description: error.message || "Erro desconhecido",
        variant: "destructive",
      });
    } finally {
      setRegisterLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left Side - Visual */}
      <div className="hidden lg:block relative h-full">
        <div className="absolute inset-0 bg-primary/40 mix-blend-multiply z-10" />
        <img 
          src={heroImg} 
          alt="Agrostate Landscape" 
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="relative z-20 h-full flex flex-col justify-between p-12 text-white">
          <div className="flex items-center gap-3">
            <img src={logoImg} alt="Logo" className="w-10 h-10 bg-white rounded-full p-1" />
            <h1 className="text-2xl font-serif font-bold">Agrostate</h1>
          </div>
          <div>
            <h2 className="text-4xl font-serif font-bold mb-4">Somos um social marketplace focado em imóveis rústicos.</h2>
            <p className="text-lg text-white/90 max-w-md">
              Usamos redes sociais e portais imobiliários para dar máxima visibilidade ao mundo rural.
              </p>
              <p className="text-lg text-white/90 max-w-md">
              Produzimos vídeos promocionais que revelam o potencial económico de cada propriedade.
              </p>
              <p className="text-lg text-white/90 max-w-md">
              Atuamos como ligação entre mediadores, sustentados por uma rede sólida de parcerias.
              </p>
              <p>Objetivos:</p>
              <ul>
                <li>Visibilidade</li>
                <li>Propostas</li>
                <li>Vendas rápidas</li>
              </ul>
          </div>
        </div>
      </div>

      {/* Right Side - Forms */}
      <div className="flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md space-y-8">
          <div className="lg:hidden flex justify-center mb-8">
            <div className="flex items-center gap-3">
              <img src={logoImg} alt="Logo" className="w-10 h-10" />
              <h1 className="text-2xl font-serif font-bold text-primary">Agrostate</h1>
            </div>
          </div>

          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login" data-testid="tab-login">Entrar</TabsTrigger>
              <TabsTrigger value="register" data-testid="tab-register">Criar Conta</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <Card>
                <CardHeader>
                  <CardTitle>Bem-vindo de volta</CardTitle>
                  <CardDescription>Aceda à sua conta de mediador</CardDescription>
                </CardHeader>
                <form onSubmit={handleLogin}>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input 
                        id="email" 
                        type="email" 
                        placeholder="mediador@exemplo.com" 
                        value={email}
                        onChange={(e: any) => setEmail(e.target.value)}
                        required 
                        data-testid="input-email"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <Input 
                        id="password" 
                        type="password" 
                        value={password}
                        onChange={(e: any) => setPassword(e.target.value)}
                        required 
                        data-testid="input-password"
                      />
                      <div className="text-right">
                        <Button variant="link" className="px-0 text-xs text-muted-foreground">
                          Esqueceu-se da password?
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button type="submit" className="w-full" disabled={loginLoading} data-testid="button-login">
                      {loginLoading ? "A entrar..." : "Entrar"}
                    </Button>
                  </CardFooter>
                </form>
              </Card>
            </TabsContent>

            <TabsContent value="register">
              <Card>
                <CardHeader>
                  <CardTitle>Junte-se à Agrostate</CardTitle>
                  <CardDescription>Crie a sua conta de mediador profissional</CardDescription>
                </CardHeader>
                <form onSubmit={handleRegister}>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="reg-name">Nome Completo</Label>
                      <Input 
                        id="reg-name" 
                        value={regName} 
                        onChange={(e: any) => setRegName(e.target.value)}
                        required 
                        data-testid="input-name"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="reg-email">Email</Label>
                        <Input 
                          id="reg-email" 
                          type="email" 
                          value={regEmail}
                          onChange={(e: any) => setRegEmail(e.target.value)}
                          required 
                          data-testid="input-register-email"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="reg-phone">Telemóvel</Label>
                        <Input 
                          id="reg-phone" 
                          type="tel" 
                          placeholder="+351 912 345 678"
                          value={regPhone}
                          onChange={(e: any) => {
                            const formatted = formatPhoneNumber(e.target.value);
                            setRegPhone(formatted);
                          }}
                          required 
                          data-testid="input-phone"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reg-nif">NIF (opcional)</Label>
                      <Input 
                        id="reg-nif" 
                        value={regNif}
                        onChange={(e: any) => setRegNif(e.target.value)}
                        data-testid="input-nif"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="reg-pass">Password</Label>
                        <Input 
                          id="reg-pass" 
                          type="password" 
                          value={regPass}
                          onChange={(e: any) => setRegPass(e.target.value)}
                          required 
                          data-testid="input-register-password"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="reg-confirm">Repetir Password</Label>
                        <Input 
                          id="reg-confirm" 
                          type="password" 
                          value={regConfirmPass}
                          onChange={(e: any) => setRegConfirmPass(e.target.value)}
                          required 
                          data-testid="input-confirm-password"
                        />
                      </div>
                    </div>

                    <div className="space-y-3 pt-4 border-t">
                      <div className="flex items-start space-x-2">
                        <Checkbox 
                          id="agreement" 
                          checked={agreement} 
                          onCheckedChange={(c: any) => setAgreement(c as boolean)} 
                          required
                          data-testid="checkbox-agreement"
                        />
                        <Label htmlFor="agreement" className="text-xs leading-tight font-normal text-muted-foreground">
                          Li e aceito o <a href="#" className="underline text-primary">Acordo de Mediação e Partilha</a>
                        </Label>
                      </div>
                      <div className="flex items-start space-x-2">
                        <Checkbox 
                          id="terms" 
                          checked={terms} 
                          onCheckedChange={(c: any) => setTerms(c as boolean)} 
                          required
                          data-testid="checkbox-terms"
                        />
                        <Label htmlFor="terms" className="text-xs leading-tight font-normal text-muted-foreground">
                          Aceito os <a href="#" className="underline text-primary">Termos e Condições</a>
                        </Label>
                      </div>
                      <div className="flex items-start space-x-2">
                        <Checkbox 
                          id="privacy" 
                          checked={privacy} 
                          onCheckedChange={(c: any) => setPrivacy(c as boolean)} 
                          required
                          data-testid="checkbox-privacy"
                        />
                        <Label htmlFor="privacy" className="text-xs leading-tight font-normal text-muted-foreground">
                          Aceito a <a href="#" className="underline text-primary">Política de Privacidade</a>
                        </Label>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={!terms || !privacy || !agreement || registerLoading}
                      data-testid="button-register"
                    >
                      {registerLoading ? "A submeter..." : "Criar Conta"}
                    </Button>
                  </CardFooter>
                </form>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
