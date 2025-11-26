"use client";

import { Package, Construction } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function ProductosPage() {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="relative">
                <Package className="h-20 w-20 text-muted-foreground/30" />
                <Construction className="h-10 w-10 text-primary absolute -bottom-2 -right-2" />
              </div>
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-bold">Productos</h2>
              <p className="text-muted-foreground">
                Esta sección está en construcción
              </p>
            </div>

            <div className="pt-4 text-sm text-muted-foreground">
              <p>Próximamente podrás:</p>
              <ul className="mt-2 space-y-1 text-left max-w-xs mx-auto">
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  Gestionar inventario de productos
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  Control de stock y precios
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  Categorías y proveedores
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
