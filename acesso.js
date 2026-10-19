/* ============================================================
   Controle de acesso (assinatura) — PoloSync
   A trava de verdade está nas regras do Firestore; este módulo
   só mostra a tela amigável de "acesso bloqueado".
   ============================================================ */
import { doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

export async function verificarAcesso(db, user){
  let config = {};
  try{
    const c = await getDoc(doc(db, 'config', 'geral'));
    if(c.exists()) config = c.data();
  }catch(e){}
  const base = { contatoAdmin: config.contatoAdmin || '', mensagem: config.mensagemBloqueio || '' };

  try{
    const adm = await getDoc(doc(db, 'admins', user.uid));
    if(adm.exists()) return { liberado:true, admin:true, ...base };
  }catch(e){}

  try{
    const s = await getDoc(doc(db, 'assinaturas', user.uid));
    if(!s.exists()) return { liberado:false, admin:false, motivo:'pendente', ...base };
    const a = s.data();
    if(a.ativo !== true) return { liberado:false, admin:false, motivo:'suspenso', ...base };
    if(a.expiraEm){
      const exp = a.expiraEm.toDate ? a.expiraEm.toDate() : new Date(a.expiraEm);
      if(exp.getTime() < Date.now()) return { liberado:false, admin:false, motivo:'expirado', expiraEm:exp, ...base };
      return { liberado:true, admin:false, expiraEm:exp, ...base };
    }
    return { liberado:true, admin:false, ...base };
  }catch(e){
    return { liberado:false, admin:false, motivo:'erro', erro:e.message, ...base };
  }
}

// Guarda e-mail -> uid para que colegas possam ser adicionados a um polo
export async function garantirIndiceEmail(db, user){
  try{
    await setDoc(doc(db, 'emailIndex', user.email.toLowerCase()), { uid: user.uid });
    await setDoc(doc(db, 'usuarios', user.uid), { email: user.email }, { merge:true });
  }catch(e){}
}

export function removerTelaBloqueio(){
  const el = document.getElementById('tela-bloqueio');
  if(el) el.remove();
}

export function mostrarTelaBloqueio(acesso, user, onSair){
  removerTelaBloqueio();
  const textos = {
    pendente: ['⏳ Aguardando liberação', 'Sua conta foi criada com sucesso! Falta a liberação do seu acesso pelo administrador do PoloSync.'],
    expirado: ['📅 Assinatura vencida', 'O prazo da sua assinatura terminou. Renove para voltar a usar o PoloSync — seus dados continuam guardados.'],
    suspenso: ['⛔ Acesso suspenso', 'Seu acesso está suspenso no momento. Fale com o administrador para regularizar.'],
    erro:     ['⚠️ Não foi possível verificar', 'Houve um problema ao verificar seu acesso. Tente de novo em instantes.'],
  };
  const [titulo, texto] = textos[acesso.motivo] || textos.erro;
  const esc = s => String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const digitos = (acesso.contatoAdmin || '').replace(/\D/g, '');
  const msgWa = encodeURIComponent(`Olá! Quero liberar/renovar meu acesso ao PoloSync. Meu e-mail: ${user.email}`);
  const wa = digitos ? `<a href="https://wa.me/${digitos}?text=${msgWa}" target="_blank" rel="noopener" style="display:block;background:#25d366;color:#fff;text-decoration:none;padding:12px;border-radius:10px;font-weight:600;margin-top:16px;">💬 Falar com o administrador</a>` : '';

  const div = document.createElement('div');
  div.id = 'tela-bloqueio';
  div.style.cssText = 'position:fixed;inset:0;z-index:99999;background:#0f1722;display:flex;align-items:center;justify-content:center;padding:20px;font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;';
  div.innerHTML = `
    <div style="background:#fff;color:#1b2430;max-width:420px;width:100%;border-radius:16px;padding:28px;text-align:center;box-shadow:0 10px 40px rgba(0,0,0,.4);">
      <img src="icon-192.png" alt="PoloSync" style="width:72px;height:72px;border-radius:16px;">
      <h2 style="margin:14px 0 8px;font-size:20px;">${titulo}</h2>
      <p style="margin:0;color:#4a5668;line-height:1.5;font-size:14.5px;">${texto}</p>
      ${acesso.mensagem ? `<p style="margin:14px 0 0;padding:10px;background:#f1f4f8;border-radius:8px;font-size:13.5px;">${esc(acesso.mensagem)}</p>` : ''}
      <p style="margin:14px 0 0;font-size:12.5px;color:#7a8799;">Conta: ${esc(user.email)}</p>
      ${wa}
      <div style="display:flex;gap:10px;margin-top:12px;">
        <button id="bloq-recheck" style="flex:1;padding:11px;border:1px solid #cdd5df;background:#fff;border-radius:10px;cursor:pointer;font-size:14px;">🔄 Verificar de novo</button>
        <button id="bloq-sair" style="flex:1;padding:11px;border:1px solid #cdd5df;background:#fff;border-radius:10px;cursor:pointer;font-size:14px;">Sair</button>
      </div>
    </div>`;
  document.body.appendChild(div);
  document.getElementById('bloq-recheck').onclick = () => window.location.reload();
  document.getElementById('bloq-sair').onclick = () => onSair && onSair();
}
