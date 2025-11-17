/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Cores da identidade Aletheia
        aletheia: {
          orange: "#FF6B35", // Laranja vibrante da logo
          emerald: "#10B981", // Verde esmeralda do "A"
          blue: "#3B82F6", // Azul médio do texto
          dark: "#1E293B", // Cor escura para textos
          light: "#F8FAFC" // Cor clara para backgrounds
        },
        primary: "#FF6B35",
        secondary: "#10B981",
        tertiary: "#3B82F6",
        success: "#10B981",
        warning: "#F59E0B",
        error: "#EF4444",
        neutral: "#6B7280"
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui"],
        mono: ["JetBrains Mono", "ui-monospace", "SFMono-Regular"],
        serif: ["Georgia", "Times New Roman", "serif"] // Para o texto "Aletheia"
      }
    }
  },
  plugins: []
};