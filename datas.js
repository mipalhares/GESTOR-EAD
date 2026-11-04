// Datas comemorativas — usado pela agenda (lembrete) e pela aba "Materiais para Redes"
const FIXAS = [
  [1,1,'Confraternização Universal (Ano Novo)','🎆'],
  [8,3,'Dia Internacional da Mulher','💜'],
  [15,3,'Dia do Consumidor','🛍️'],
  [22,3,'Dia Mundial da Água','💧'],
  [7,4,'Dia Mundial da Saúde','🩺'],
  [7,4,'Dia do Jornalista','📰'],
  [19,4,'Dia dos Povos Indígenas','🪶'],
  [21,4,'Tiradentes','🇧🇷'],
  [22,4,'Dia da Terra','🌎'],
  [25,4,'Dia do Contador','🧮'],
  [28,4,'Dia da Educação','📚'],
  [1,5,'Dia do Trabalhador','👷'],
  [12,5,'Dia do Enfermeiro','🩺'],
  [15,5,'Dia do Assistente Social','🤝'],
  [20,5,'Dia do Pedagogo','🎓'],
  [5,6,'Dia Mundial do Meio Ambiente','🌱'],
  [12,6,'Dia dos Namorados','❤️'],
  [22,8,'Dia do Folclore','🎭'],
  [27,8,'Dia do Psicólogo','🧠'],
  [7,9,'Independência do Brasil','🇧🇷'],
  [8,9,'Dia Internacional da Alfabetização','✏️'],
  [9,9,'Dia do Administrador','📊'],
  [10,9,'Dia Mundial de Prevenção do Suicídio','💛'],
  [21,9,'Dia da Árvore','🌳'],
  [1,10,'Dia do Idoso','👵'],
  [12,10,'Dia das Crianças','🧸'],
  [15,10,'Dia do Professor','🍎'],
  [28,10,'Dia do Servidor Público','🏛️'],
  [31,10,'Dia da Reforma Protestante','📖'],
  [2,11,'Finados','🕯️'],
  [15,11,'Proclamação da República','🇧🇷'],
  [20,11,'Dia da Consciência Negra','✊🏾'],
  [1,12,'Dia Mundial de Luta contra a AIDS','🎗️'],
  [10,12,'Dia dos Direitos Humanos','🕊️'],
  [25,12,'Natal','🎄'],
  [31,12,'Réveillon','🥂'],
];
const MES_CAMPANHA = {1:'Janeiro Branco (saúde mental)',5:'Maio Amarelo (trânsito seguro)',8:'Agosto Dourado (aleitamento)',9:'Setembro Amarelo (valorização da vida)',10:'Outubro Rosa (câncer de mama)',11:'Novembro Azul (saúde do homem)',12:'Dezembro Vermelho (prevenção ao HIV/AIDS)'};

function pascoa(ano){
  const a=ano%19,b=Math.floor(ano/100),c=ano%100,d=Math.floor(b/4),e=b%4,f=Math.floor((b+8)/25),g=Math.floor((b-f+1)/3);
  const h=(19*a+b-d-g+15)%30,i=Math.floor(c/4),k=c%4,l=(32+2*e+2*i-h-k)%7,m=Math.floor((a+11*h+22*l)/451);
  const mes=Math.floor((h+l-7*m+114)/31),dia=((h+l-7*m+114)%31)+1;
  return new Date(ano,mes-1,dia);
}
function somar(d,n){ const x=new Date(d.getFullYear(),d.getMonth(),d.getDate()); x.setDate(x.getDate()+n); return x; }
function enesimoDiaSemana(ano,mes,dow,n){ // n-ésimo dia da semana (0=dom) do mês
  const d=new Date(ano,mes,1); const off=(dow-d.getDay()+7)%7; return new Date(ano,mes,1+off+7*(n-1));
}
function datasDoAno(ano){
  const lista = FIXAS.map(([d,m,nome,ico]) => ({data:new Date(ano,m-1,d),nome,ico}));
  const p = pascoa(ano);
  lista.push({data:somar(p,-47),nome:'Carnaval',ico:'🎭'});
  lista.push({data:somar(p,-2),nome:'Sexta-feira Santa',ico:'✝️'});
  lista.push({data:p,nome:'Páscoa',ico:'🐰'});
  lista.push({data:somar(p,60),nome:'Corpus Christi',ico:'⛪'});
  lista.push({data:enesimoDiaSemana(ano,4,0,2),nome:'Dia das Mães',ico:'👩‍👧'});
  lista.push({data:enesimoDiaSemana(ano,7,0,2),nome:'Dia dos Pais',ico:'👨‍👧'});
  lista.push({data:enesimoDiaSemana(ano,10,5,4),nome:'Black Friday',ico:'🏷️'});
  return lista;
}
export function inicioDia(d){ return new Date(d.getFullYear(),d.getMonth(),d.getDate()); }
export function datasEntre(ini,fim){
  const a=inicioDia(ini), b=inicioDia(fim), out=[];
  for(let ano=a.getFullYear(); ano<=b.getFullYear(); ano++){
    datasDoAno(ano).forEach(x=>{ if(x.data>=a && x.data<=b) out.push(x); });
  }
  return out.sort((x,y)=>x.data-y.data);
}
// Segunda a domingo da semana seguinte
export function proximaSemana(hoje=new Date()){
  const h=inicioDia(hoje); const dow=h.getDay(); // 0=dom
  const ate=(8-dow)%7||7;
  const ini=somar(h,ate); return {ini, fim:somar(ini,6)};
}
export function campanhaDoMes(d=new Date()){ return MES_CAMPANHA[d.getMonth()+1]||''; }
const DIAS=['dom','seg','ter','qua','qui','sex','sáb'];
export function fmtDM(d){ return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}`; }
export function fmtDiaSemana(d){ return DIAS[d.getDay()]; }
export function ideiasDe(nome){
  return [
    {t:'Post', d:`Arte simples com a mensagem de "${nome}" e o convite para conhecer os cursos EAD do polo.`},
    {t:'Stories', d:`Enquete ou caixinha de perguntas ligada a "${nome}" + link para falar com o polo.`},
    {t:'Reels', d:`Vídeo curto (15–30 s) de um aluno, professor ou da equipe falando sobre "${nome}" e estudar com flexibilidade.`},
  ];
}
export function legendaBase(nome, polo){
  return `Hoje é dia de lembrar: ${nome}! ✨\n\nNa educação adventista a gente acredita em transformar vidas por meio do conhecimento. Quer estudar com flexibilidade e apoio de perto? Fale com o polo${polo?' '+polo:''} e conheça nossos cursos EAD. 📚\n\n#EAD #EducaçãoAdventista #UNASP #Polo`;
}
