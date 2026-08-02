import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground space-y-4">
      <h1 className="text-4xl font-bold">404 - Página Não Encontrada</h1>
      <p className="text-muted-foreground">A página que você está procurando não existe.</p>
      <Link href="/">
        <Button>Voltar ao Início</Button>
      </Link>
    </div>
  );
}
