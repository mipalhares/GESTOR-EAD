/* ============================================================
   Sync — assistente de voz do PoloSync
   Reconhecimento de fala (Web Speech API) + interpretação de
   comandos simples em português. 100% no navegador, sem custo.
   ============================================================ */
(function(){
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;

  window.SyncAssistant = {
    supported: !!SR,
    recognition: null,
    listening: false,
    onResult: null,

    init(onResult){
      this.onResult = onResult;
      if(!SR) return;
      this.recognition = new SR();
      this.recognition.lang = 'pt-BR';
      this.recognition.continuous = false;
      this.recognition.interimResults = false;
      this.recognition.maxAlternatives = 1;
      this.recognition.onresult = (e) => {
        const texto = e.results[0][0].transcript;
        this.onResult(texto);
      };
      this.recognition.onend = () => {
        this.listening = false;
        document.dispatchEvent(new CustomEvent('sync-listen-end'));
      };
      this.recognition.onerror = () => {
        this.listening = false;
        document.dispatchEvent(new CustomEvent('sync-listen-end'));
      };
    },
    start(){
      if(!this.recognition || this.listening) return;
      this.listening = true;
      document.dispatchEvent(new CustomEvent('sync-listen-start'));
      try{ this.recognition.start(); }catch(e){ this.listening = false; }
    },
    speak(texto){
      if(!('speechSynthesis' in window)) return;
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(texto);
      u.lang = 'pt-BR';
      u.rate = 1.03;
      u.pitch = 1.0;
      document.dispatchEvent(new CustomEvent('sync-speak-start'));
      u.onend = () => document.dispatchEvent(new CustomEvent('sync-speak-end'));
      window.speechSynthesis.speak(u);
    },
  };

  /* ---- Interpretação de datas, horas, títulos e intenção ---- */
  const MESES = { janeiro:0, fevereiro:1, 'março':2, marco:2, abril:3, maio:4, junho:5, julho:6, agosto:7, setembro:8, outubro:9, novembro:10, dezembro:11 };
  const DIAS_SEMANA = { domingo:0, segunda:1, 'segunda-feira':1, 'terça':2, terca:2, 'terça-feira':2, quarta:3, 'quarta-feira':3, quinta:4, 'quinta-feira':4, sexta:5, 'sexta-feira':5, 'sábado':6, sabado:6 };
  function pad(n){ return String(n).padStart(2,'0'); }
  function fmtData(d){ return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`; }

  window.SyncParse = {
    data(textoOriginal){
      const t = textoOriginal.toLowerCase();
      const hoje = new Date();
      if(/depois de amanh[ãa]/.test(t)){ const d = new Date(hoje); d.setDate(d.getDate()+2); return fmtData(d); }
      if(/\bamanh[ãa]\b/.test(t)){ const d = new Date(hoje); d.setDate(d.getDate()+1); return fmtData(d); }
      if(/\bhoje\b/.test(t)){ return fmtData(hoje); }

      let m = t.match(/dia\s+(\d{1,2})\s+de\s+([a-zçã]+)/);
      if(m && MESES[m[2]] !== undefined){
        const dia = Number(m[1]);
        const mes = MESES[m[2]];
        let d = new Date(hoje.getFullYear(), mes, dia);
        if(d < new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate())) d.setFullYear(d.getFullYear()+1);
        return fmtData(d);
      }
      m = t.match(/dia\s+(\d{1,2})\b/);
      if(m){
        const dia = Number(m[1]);
        let d = new Date(hoje.getFullYear(), hoje.getMonth(), dia);
        if(d < new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate())) d.setMonth(d.getMonth()+1);
        return fmtData(d);
      }
      for(const nome in DIAS_SEMANA){
        if(t.includes(nome)){
          const alvo = DIAS_SEMANA[nome];
          const d = new Date(hoje);
          let diff = (alvo - d.getDay() + 7) % 7;
          if(diff === 0) diff = 7;
          d.setDate(d.getDate() + diff);
          return fmtData(d);
        }
      }
      return null;
    },
    hora(textoOriginal){
      const t = textoOriginal.toLowerCase();
      if(/meio[- ]dia/.test(t)) return '12:00';
      if(/meia[- ]noite/.test(t)) return '00:00';
      let m = t.match(/(\d{1,2})[:h](\d{2})/);
      if(m) return `${pad(m[1])}:${pad(m[2])}`;
      m = t.match(/(\d{1,2})\s*h(oras)?\b/);
      if(m) return `${pad(m[1])}:00`;
      m = t.match(/às\s+(\d{1,2})\b/);
      if(m) return `${pad(m[1])}:00`;
      return null;
    },
    titulo(textoOriginal){
      let t = textoOriginal;
      t = t.replace(/^\s*(sync|sink|cinc)[,]?\s*/i, '');
      t = t.replace(/^(marca|marque|agenda|agende|cria|crie|adiciona|adicione|coloca|coloque)\s*/i, '');
      t = t.replace(/^(o|a|um|uma)?\s*(compromisso|evento|prova|aula|reuni[aã]o|atendimento|visita|a[çc][ãa]o)\s*(de|com|para)?\s*/i, '');
      t = t.split(/\s+(dia|às|as|para o dia|na data|amanh[ãa]|hoje)\s+/i)[0];
      t = t.trim();
      return t ? t.charAt(0).toUpperCase() + t.slice(1) : '';
    },
    tipoEvento(textoOriginal){
      const t = textoOriginal.toLowerCase();
      if(/prova/.test(t)) return 'prova';
      if(/sala|espaço/.test(t)) return 'sala';
      return 'aula';
    },
    intent(textoOriginal){
      const t = textoOriginal.toLowerCase();
      if(/(marca|marque|agenda|agende|cria|crie|adiciona|adicione|coloca|coloque)/.test(t) &&
         /(compromisso|evento|prova|aula|reuni[ãa]o|atendimento|visita)/.test(t)){
        return 'criar_evento';
      }
      if(/nov[ao]\s+a[çc][ãa]o/.test(t) || (/abr[ae]/.test(t) && /a[çc][ãa]o/.test(t))) return 'abrir_nova_acao';
      if(/nov[ao]\s+evento/.test(t) || (/abr[ae]/.test(t) && /evento/.test(t) && !/a[çc][ãa]o/.test(t))) return 'abrir_novo_evento';
      if(/nov[ao]\s+lead/.test(t) || (/abr[ae]/.test(t) && /lead/.test(t))) return 'abrir_novo_lead';
      if(/nova\s+transa[çc][ãa]o/.test(t) || (/abr[ae]/.test(t) && /transa[çc][ãa]o/.test(t))) return 'abrir_nova_transacao';
      if(/urgente|priorit[áa]rio|prioridade|mais importante|resumo (do dia|de hoje)/.test(t)) return 'urgente_hoje';
      if(/gera(r)?\s+(o\s+)?pdf|baixa(r)?\s+(o\s+)?pdf/.test(t)) return 'gerar_pdf';
      if(/financeiro/.test(t)) return 'navegar_financeiro';
      if(/plano de a[çc][oõ]es/.test(t)) return 'navegar_plano';
      if(/relat[óo]rio/.test(t)) return 'navegar_relatorios';
      if(/agenda/.test(t) && !/marca|marque|agende/.test(t)) return 'navegar_agenda';
      if(/vendas|\bcrm\b/.test(t)) return 'navegar_vendas';
      return 'desconhecido';
    },
  };
})();
