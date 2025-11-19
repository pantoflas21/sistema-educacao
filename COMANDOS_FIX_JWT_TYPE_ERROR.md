# 🔧 CORREÇÃO DO ERRO DE TIPO NO JWT

## ❌ ERRO

```
apps/backend/src/auth/jwt.ts(6,5): erro TS2322: O tipo 'string' não é atribuível ao tipo 'number | StringValue'.
```

## ✅ CORREÇÃO APLICADA

**Arquivo:** `apps/backend/src/auth/jwt.ts`

O código foi corrigido para usar type assertion `as any` nas opções do JWT, pois o TypeScript strict mode tem conflito com o tipo `StringValue` interno do jsonwebtoken.

**Código corrigido:**
```typescript
export function signToken(payload: any) {
  const expiresIn: string = String(env.JWT_EXPIRES_IN);
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn } as any);
}
```

## 📋 COMANDOS PARA SUBIR A CORREÇÃO

**Copie e cole UM POR VEZ:**

### COMANDO 1: Adicionar arquivo corrigido

```powershell
git add apps/backend/src/auth/jwt.ts
```

### COMANDO 2: Fazer commit

```powershell
git commit -m "FIX: Corrige erro TypeScript no jwt.ts - Usa type assertion para expiresIn"
```

### COMANDO 3: Push

```powershell
git push -u origin main
```

---

**A correção já está aplicada no código!** Execute os comandos acima para subir a correção.



