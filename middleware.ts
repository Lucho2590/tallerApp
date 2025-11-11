import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Rutas públicas que no requieren autenticación
const publicRoutes = ["/login", "/register"];

// Rutas que requieren autenticación
const protectedRoutes = ["/dashboard", "/clientes", "/vehiculos", "/agenda", "/presupuestos", "/trabajos", "/productos", "/caja"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Verificar si la ruta actual es pública
  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route));

  // Verificar si la ruta actual es protegida
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));

  // Por ahora, solo retornamos NextResponse.next()
  // La protección real la maneja el componente ProtectedRoute en el cliente
  // porque necesitamos acceso al AuthContext
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
