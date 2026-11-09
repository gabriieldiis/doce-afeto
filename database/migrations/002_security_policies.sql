-- ============================================
-- DOCE AFETO
-- 002 - Políticas de segurança
-- ============================================

-- Permite que visitantes visualizem
-- somente produtos ativos no catálogo.

CREATE POLICY "Publico pode visualizar produtos ativos"
ON public.produtos
FOR SELECT
TO anon, authenticated
USING (ativo = true);