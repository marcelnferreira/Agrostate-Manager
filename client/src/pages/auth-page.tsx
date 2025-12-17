import { useState } from "react";
import { useAuth } from "@/lib/mock-data";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import logoImg from "@assets/generated_images/minimalist_logo_icon_for_agrostate.png";
import heroImg from "@assets/generated_images/aerial_view_of_agricultural_land_and_farms.png";

export default function AuthPage() {
  const { login, register, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  
  // Login State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Register State
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regPass, setRegPass] = useState("");
  const [regConfirmPass, setRegConfirmPass] = useState("");
  const [terms, setTerms] = useState(false);
  const [privacy, setPrivacy] = useState(false);
  const [agreement, setAgreement] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(email);
    setLocation("/dashboard");
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (regPass !== regConfirmPass) {
      alert("As passwords não coincidem");
      return;
    }
    await register({ name: regName, email: regEmail, phone: regPhone });
    // Stay on page to show pending message or redirect to a 'check email' page
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
            <h2 className="text-4xl font-serif font-bold mb-4">A excelência na mediação agrícola.</h2>
            <p className="text-lg text-white/90 max-w-md">
              Conectamos proprietários e investidores no setor agroimobiliário com transparência e profissionalismo.
            </p>
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
              <TabsTrigger value="login">Entrar</TabsTrigger>
              <TabsTrigger value="register">Criar Conta</TabsTrigger>
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
                        onChange={(e) => setEmail(e.target.value)}
                        required 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <Input 
                        id="password" 
                        type="password" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required 
                      />
                      <div className="text-right">
                        <Button variant="link" className="px-0 text-xs text-muted-foreground">
                          Esqueceu-se da password?
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? "A entrar..." : "Entrar"}
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
                        onChange={(e) => setRegName(e.target.value)}
                        required 
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="reg-email">Email</Label>
                        <Input 
                          id="reg-email" 
                          type="email" 
                          value={regEmail}
                          onChange={(e) => setRegEmail(e.target.value)}
                          required 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="reg-phone">Telemóvel</Label>
                        <Input 
                          id="reg-phone" 
                          type="tel" 
                          value={regPhone}
                          onChange={(e) => setRegPhone(e.target.value)}
                          required 
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="reg-pass">Password</Label>
                        <Input 
                          id="reg-pass" 
                          type="password" 
                          value={regPass}
                          onChange={(e) => setRegPass(e.target.value)}
                          required 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="reg-confirm">Repetir Password</Label>
                        <Input 
                          id="reg-confirm" 
                          type="password" 
                          value={regConfirmPass}
                          onChange={(e) => setRegConfirmPass(e.target.value)}
                          required 
                        />
                      </div>
                    </div>

                    <div className="space-y-3 pt-4 border-t">
                      <div className="flex items-start space-x-2">
                        <Checkbox 
                          id="agreement" 
                          checked={agreement} 
                          onCheckedChange={(c) => setAgreement(c as boolean)} 
                          required
                        />
                        <Label htmlFor="agreement" className="text-xs leading-tight font-normal text-muted-foreground">
                          Li e aceito o <a href="#" className="underline text-primary">Acordo de Mediação e Partilha</a>
                        </Label>
                      </div>
                      <div className="flex items-start space-x-2">
                        <Checkbox 
                          id="terms" 
                          checked={terms} 
                          onCheckedChange={(c) => setTerms(c as boolean)} 
                          required
                        />
                        <Label htmlFor="terms" className="text-xs leading-tight font-normal text-muted-foreground">
                          Aceito os <a href="#" className="underline text-primary">Termos e Condições</a>
                        </Label>
                      </div>
                      <div className="flex items-start space-x-2">
                        <Checkbox 
                          id="privacy" 
                          checked={privacy} 
                          onCheckedChange={(c) => setPrivacy(c as boolean)} 
                          required
                        />
                        <Label htmlFor="privacy" className="text-xs leading-tight font-normal text-muted-foreground">
                          Aceito a <a href="#" className="underline text-primary">Política de Privacidade</a>
                        </Label>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button type="submit" className="w-full" disabled={!terms || !privacy || !agreement || isLoading}>
                      {isLoading ? "A submeter..." : "Criar Conta"}
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
