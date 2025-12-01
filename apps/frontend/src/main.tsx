import React from "react";
import { createRoot } from "react-dom/client";
import { Router } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import App from "./App";
import "./index.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      retry: 1, // Tentar apenas 1 vez
      retryDelay: 1000, // Aguardar 1 segundo entre tentativas
      staleTime: 30000, // Cache por 30 segundos
      gcTime: 5 * 60 * 1000, // Mantém cache por 5 minutos
      // Não lançar erro para não quebrar a aplicação
      throwOnError: false,
      // Timeout de 10 segundos para evitar travamentos
      refetchInterval: false,
    },
    mutations: {
      retry: 0,
      // Não lançar erro para não quebrar a aplicação
      throwOnError: false,
    }
  }
});

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <Router>
        <App />
      </Router>
    </QueryClientProvider>
  </React.StrictMode>
);