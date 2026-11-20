import { createClient } from '@supabase/supabase-js';

const TRANSFORMACAO_SUPABASE_URL = 'https://pltxhdpwjhnjgkfmneer.supabase.co';
const TRANSFORMACAO_SUPABASE_KEY = 'sb_publishable_Ev98L1E2NUKN0SIx6q2HbA_yHd8SlJh';

export const transformacaoDb = createClient(TRANSFORMACAO_SUPABASE_URL, TRANSFORMACAO_SUPABASE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
});

export const TABELA_INSCRICOES = 'inscricoes_projeto_transformacao';
