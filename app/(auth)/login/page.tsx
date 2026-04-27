import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Truck } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 bg-blue-500 rounded-2xl flex items-center justify-center mx-auto">
            <Truck className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">FlotaTrack</h1>
          <p className="text-slate-400 text-sm">Gestión de mantenimiento de flota</p>
        </div>

        <Card className="border-slate-700 bg-slate-800 text-white">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg text-white">Iniciar sesión</CardTitle>
            <CardDescription className="text-slate-400">
              Ingresá tus credenciales para continuar
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-slate-300">Usuario</Label>
              <Input
                placeholder="tu@email.com"
                defaultValue="encargado@flota.com"
                className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-500"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-300">Contraseña</Label>
              <Input
                type="password"
                defaultValue="••••••••"
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>
            <Link href="/dashboard" className="block">
              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                Ingresar
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
