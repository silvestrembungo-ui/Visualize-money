# Visualize-money
App de remoneração por visualização

# Visualize Money

Visualize Money é um protótipo de plataforma de vídeos remunerados (Play-and-Earn). Este repositório contém uma scaffold mínima (backend em Node + Express + SQLite via Sequelize) com modelos, rotas e páginas públicas de Política de Privacidade e Termos de Uso. Serve como ponto de partida para desenvolvimento e implantação.

Principais características implementadas no scaffold:
- Cadastro / Login (email + número telefónico de Angola + senha forte).
- Recuperação de senha por email ou número (fluxo básico).
- Áreas de Produtor e Visualizador (rotas API básicas).
- Upload de vídeo / incorporação (YouTube / Facebook / TikTok) com definição de orçamento (cada visualização válida custa 8 Kz).
- Fluxo de envio de comprovativo (referência: entidade 00579, referência: 461864531).
- Validação de visualização: mínimo 2 minutos, máximo 3 visualizações seguidas, espera de 2h se guardar.
- Ganho do visualizador: 2 Kz por visualização válida.
- Saques: 1x por mês, retenção de 20%, PIN para saque.
- Política de convite: 1% do saque do convidado durante 4 meses (esqueleto).
- Painéis (endpoints) para produtores e visualizadores (estatísticas básicas).
- Política básica de prevenção a fraude (stubs).

Aviso importante sobre credenciais de admin
- O app inicializa um utilizador admin com as credenciais fornecidas:
  - Email: silvestre.m.bifica@gmail.com
  - Senha: 921777754marla*
- Essas credenciais são inseridas no arquivo `.env` durante o seed (veja `.env.example`).
- Em produção: NÃO use credenciais em texto limpo; rode migrações, mude a senha e use secrets seguros.

Como usar (local)
1. Clone o repositório e cole os ficheiros neste repositório no GitHub.
2. Copie `.env.example` para `.env` e ajuste conforme necessário.
3. Instale dependências:
   - npm install
4. Execute migração/seed:
   - node src/seed.js
5. Inicie o servidor:
   - npm start
6. API disponível por padrão em: http://localhost:3000

Estrutura principal
- src/
  - app.js - servidor Express
  - models.js - modelos Sequelize (User, Video, View, Transaction, Invite)
  - seed.js - cria o admin e dados iniciais
  - routes/
    - auth.js
    - producer.js
    - viewer.js
  - utils/
    - fraud.js - stubs de prevenção de fraudes
- public/
  - privacy-policy.md
  - terms.md

Notas finais
- Este scaffold é um ponto de partida. Para produção: adicione HTTPS, validação completa de inputs, testes, serviço de armazenamento (S3), CDN, processamento de vídeo, worker para contagem de visualizações, monitorização e limites de taxa.
- A implementação aqui é intencionalmente simples para facilitar revisão e personalização.

Contato do projeto
- visualizemoney.sb@gmail.com
