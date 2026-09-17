# Painel do Polo — versão Firebase

Mesma ferramenta (login, vendas/CRM, agenda), mas usando Firebase em vez de
Supabase — já que você tem conta lá.

## O que tem aqui
- `index.html` — o site inteiro
- `firestore.rules` — regras de segurança do banco
- `README.md` — este guia

## Passo 1 — Ativar Authentication
1. No [Firebase Console](https://console.firebase.google.com), abra seu projeto
2. Vá em **Build > Authentication** → **Get started**
3. Na aba **Sign-in method**, ative o provedor **E-mail/senha**

## Passo 2 — Criar o Firestore
1. Vá em **Build > Firestore Database** → **Create database**
2. Escolha o modo **produção** e a região mais próxima (ex: `southamerica-east1`)

## Passo 3 — Colar as regras de segurança
1. Ainda no Firestore, vá na aba **Regras**
2. Apague o conteúdo padrão, cole todo o `firestore.rules` e clique em **Publicar**

## Passo 4 — Pegar a configuração do app
1. Vá em **Configurações do projeto** (ícone de engrenagem) → aba **Geral**
2. Em "Seus apps", clique em **</>** (Web) pra criar um app da Web, se ainda não tiver
3. Copie o objeto `firebaseConfig` que aparece
4. Abra `index.html`, procure a seção `CONFIGURAÇÃO` no topo do script e cole
   os valores:
```js
const firebaseConfig = {
  apiKey: "...",
  authDomain: "...",
  projectId: "...",
  storageBucket: "...",
  messagingSenderId: "...",
  appId: "...",
};
```

## Passo 5 — Subir pro GitHub e publicar com GitHub Pages
1. Crie um repositório novo no GitHub (pode ser privado)
2. Suba `index.html` e `firestore.rules`
3. **Settings** → **Pages** → Source: branch principal, pasta `/root` → Save
4. O GitHub te dá um link tipo `https://seuusuario.github.io/nome-do-repo/`
5. Compartilhe esse link com os colegas gestores pelo WhatsApp Business

*(Alternativa: como você já está no Firebase, também dá pra publicar com
**Firebase Hosting** em vez do GitHub Pages — se preferir esse caminho, me avise
que eu te passo o passo a passo.)*

## Módulo de Relatórios Mensais (fotos + texto)
Um terceiro arquivo, `relatorios.html`, foi adicionado com um formulário de
relatório mensal (seções fixas: Infraestrutura, Eventos do mês, Ocorrências,
Observações gerais), permitindo anexar fotos com legenda em cada seção e
gerar um PDF pronto pra baixar e enviar. O histórico de meses anteriores fica
salvo e pode ser reaberto a qualquer momento.

**Sobre o arquivo `storage.rules`:** ele não é mais necessário. O Firebase
passou a exigir cartão de crédito (plano Blaze) para usar o Storage, então as
fotos são guardadas comprimidas direto no Firestore (que continua 100% de
graça). Pode ignorar esse arquivo — não precisa configurar Storage no
Firebase Console.

Passos de configuração:
1. Abra `relatorios.html`, procure a seção `CONFIGURAÇÃO` e cole o **mesmo**
   `firebaseConfig` que você já colou em `index.html`
2. Suba `relatorios.html` junto com os outros arquivos pro mesmo repositório
   do GitHub
3. As regras do `firestore.rules` foram atualizadas pra liberar acesso aos
   relatórios — se você já tinha publicado uma versão anterior desse arquivo
   no Firebase, copie o conteúdo novo e publique de novo

O botão "Relatórios" já foi adicionado no topo do `index.html`, ao lado de
"Vendas" e "Agenda" — leva direto pra essa nova página, mantendo o polo
selecionado.

**Limitação da compressão de fotos:** as imagens são redimensionadas
automaticamente no navegador antes de salvar, pra caber nos limites do banco
gratuito. Ficam ótimas pra visualizar na tela e no PDF, mas não servem pra
impressão em alta qualidade. Recomendo no máximo 6-8 fotos por relatório.

## Novidades inspiradas na Frontzapp (versão gratuita)
Analisei o https://frontzapp.com.br/ — é uma plataforma paga de automação
de WhatsApp (API oficial, IA de atendimento, disparos em massa). Essas
partes exigem infraestrutura paga que já decidimos não usar. Mas 3 ideias
boas de lá foram trazidas de graça pro nosso CRM:

- **Campo "Responsável pelo lead"** e **"Campanha/Anúncio"** no formulário
  de lead — pra saber quem está tocando cada negociação e de qual anúncio
  ela veio
- **📊 Raio-X da Operação** (aba Conversão): desempenho por gestor — total
  de leads, matriculados, taxa de conversão e tempo médio até o primeiro
  contato
- **♻️ Leads pra reativar** (aba Conversão): lista automática de leads
  encerrados por motivos "reversíveis" (adiou, não concluiu, preço,
  documentação), com botão "Reativar" que já devolve o lead pro funil

## Integração: Plano de Ações ↔ Relatórios
Ao registrar uma ação no relatório mensal, agora dá pra vincular a um item
do Plano de Ações (campo "Vincular a um item do Plano de Ações"). Ao
salvar com o vínculo:
- O item do Plano de Ações é marcado automaticamente como **"Concluída"**
- No Plano de Ações, aquele item ganha um aviso "📷 Registrada no relatório
  de [mês/ano]" com um botão **"Ver relatório"** que abre direto o
  relatório correspondente

Não é obrigatório vincular — dá pra continuar registrando ações do relatório
sem relação com o plano, como antes. É só uma forma de ligar "o que foi
planejado" com "o que de fato aconteceu, com fotos e detalhes".

## Novo módulo: Financeiro (`financeiro.html`)
Controle de repasses recebidos, receita do polo e despesas mensais, com o
resultado líquido calculado automaticamente e um gráfico dos últimos 6 meses.

- **Repasse recebido**: o valor que a rede repassa ao polo
- **Receita do polo**: dinheiro que o polo gerou (mensalidades, taxas, etc.)
- **Despesa**: por categoria (aluguel, salários, marketing, manutenção,
  material didático, contas, outros)
- **Líquido do mês** = repasses + receita − despesas

Mesma configuração dos outros arquivos: cole o `firebaseConfig` no início do
script, suba o arquivo pro GitHub junto com os demais, e publique o
`firestore.rules` atualizado (nova permissão pra coleção `financeiro`).

## Atualização: funil oficial de vendas + novos módulos
O funil de vendas mudou para as 9 etapas do processo oficial da rede (Lead
novo → Contato efetivo → Qualificado → Link enviado → Inscrição concluída →
Aprovado no sistema → Contrato assinado → Matriculado → Encerrado). **Leads
já cadastrados no funil antigo precisam ser reclassificados manualmente** —
abra cada um e escolha a etapa correspondente no novo funil.

Também foram adicionados:
- **Origem em lista fixa** (fontes oficiais) e **motivo de encerramento**
  obrigatório ao mover um lead para "Encerrado"
- **Alerta de SLA** (2h) para leads aprovados sem contrato/matrícula
- **Botão "📅 Cadência"** no lead, sugerindo a próxima data de follow-up
  conforme a cadência oficial (D0, D+1, D+2, D+4, D+7, D+14, D+21)
- **Aba "Conversão"**: funil com %, conversão por fonte, motivos de
  encerramento
- **Aba "Roteiros"**: mensagens prontas de WhatsApp pra cada momento do
  processo, com botão de copiar
- **Novo módulo "Plano de Ações"** (`plano-de-acoes.html`): planejamento
  anual por frente de atuação (Captação, Rematrícula, Relacionamento com
  igrejas/escolas, Rotina de gestão), com responsável, prazo, indicador,
  meta, resultado e status

Suba os 4 arquivos (`index.html`, `relatorios.html`, `plano-de-acoes.html`,
mais o `firestore.rules` atualizado colado no Firebase Console) e cole o
mesmo `firebaseConfig` no `plano-de-acoes.html`, igual fez nos outros.

## Como convidar um colega gestor
1. O colega cria a própria conta primeiro, na tela de login ("Criar conta")
2. Você abre "Gerenciar polos" → digita o e-mail dele → "Adicionar"
3. No próximo login dele, o polo aparece no seletor

## Segurança, em resumo
- Ninguém acessa nenhum dado sem login
- Um gestor só vê os polos aos quais foi adicionado — isso é garantido pelas
  regras em `firestore.rules`, não pelo código da tela (então não dá pra
  burlar só mexendo no HTML)
- A chave de configuração do Firebase que fica visível no código é normal e
  esperada ficar pública — quem protege os dados de verdade são as regras do
  Firestore, não o segredo da chave

## Limitações desta primeira versão
- Sem recuperação de senha configurada na tela (o Firebase suporta, mas o
  fluxo de e-mail de redefinição precisa ser adicionado à parte)
- Sem painel central pra ver todos os polos de uma rede maior — cada gestor
  só enxerga os polos aos quais foi adicionado, por design
- O quick-add do WhatsApp continua sendo "colar texto e revisar", não uma
  sincronização automática (isso exigiria a API oficial do WhatsApp Business)
