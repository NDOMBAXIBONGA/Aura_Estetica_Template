========================================================================
                      AURA ESTÉTICA - LANDING PAGE
========================================================================

Este é um template estático premium, responsivo e de alta performance desenvolvido para a clínica de estética "Aura Estética". O projeto foi otimizado para conversão de clientes por meio de um widget interativo de agendamento online e uma identidade visual luxuosa.

------------------------------------------------------------------------
1. ESTRUTURA DO PROJETO
------------------------------------------------------------------------

O repositório contém os seguintes arquivos e diretórios:

*   /index.html   -> Estrutura semântica principal do site (HTML5), tags SEO,
                     importação de bibliotecas externas e estrutura do widget.
*   /style.css    -> Estilos CSS customizados complementares, incluindo a
                     paleta de cores da marca, fontes premium (Cinzel e Outfit),
                     efeitos de glassmorphism e gradientes metálicos.
*   /script.js    -> Lógica interativa em JavaScript vanila para o widget de
                     agendamento (passo a passo), calendário dinâmico,
                     accordions do FAQ e animações de scroll do GSAP.
*   /assets/      -> Pasta contendo os recursos visuais gerados:
    - hero-clinic.png           (Imagem do ambiente luxuoso da clínica)
    - treatment-botox.png       (Imagem do tratamento de Toxina Botulínica)
    - treatment-fillers.png     (Imagem de Preenchimento)
    - treatment-collagen.png    (Imagem de Bioestimuladores)
    - treatment-facial.png      (Imagem de Limpeza de Pele)
    - professional-helena.png   (Retrato da Dra. Helena Vasconcelos)
    - professional-thiago.png   (Retrato do Dr. Thiago Mendes)
    - avatar-client-X.png       (Avatares simulados de prova social)

------------------------------------------------------------------------
2. TECNOLOGIAS UTILIZADAS
------------------------------------------------------------------------

Para manter o template leve, rápido e fácil de hospedar, utilizamos:
*   Tailwind CSS (via CDN) para estilização ágil e responsiva.
*   GSAP & ScrollTrigger (via CDN) para animações de rolagem e transições fluidas.
*   Lucide Icons (via CDN) para ícones minimalistas e modernos em SVG.
*   Google Fonts (Cinzel para sofisticação nos títulos e Outfit para legibilidade).

------------------------------------------------------------------------
3. COMO EXECUTAR LOCALMENTE
------------------------------------------------------------------------

Por ser um template estático puro (HTML/CSS/JS), você não precisa de banco de dados ou compilação complexa para rodar. Basta:

Opção A (Sem instalação):
Abra o arquivo `index.html` diretamente em qualquer navegador de internet.

Opção B (Servidor Local - Recomendado para testar animações de forma otimizada):
1. Abra o terminal na pasta do projeto.
2. Inicie um servidor web simples. Exemplo com Python:
   python -m http.server 8000
3. Abra seu navegador e acesse: http://localhost:8000

------------------------------------------------------------------------
4. COMO PERSONALIZAR E MODIFICAR O TEMPLATE
------------------------------------------------------------------------

Você pode customizar o template abrindo os arquivos em qualquer editor de código (como VS Code).

A. MODIFICAR TEXTOS E SEO (index.html)
   - Títulos e Meta Tags: Altere as tags <title> e <meta name="description"> localizadas dentro do <head> do arquivo `index.html` para otimizar o SEO local da sua clínica.
   - Textos da Hero/Serviços: Procure pelas seções correspondentes no HTML (ex: buscar por "Realce sua beleza natural") e substitua pelo texto desejado.

B. ALTERAR A PALETA DE CORES (index.html & style.css)
   - O projeto usa uma paleta sofisticada baseada em Tons de Areia (#FAF7F5), Dourado Rose (#C5A880) e Verde Sálvia (#6E8A78).
   - Para alterar globalmente no Tailwind: Vá no `index.html`, procure a tag <script> com `tailwind.config` e edite as cores sob `theme.extend.colors`.
   - Para alterar no CSS complementar: Vá no `style.css` e altere os valores hexadecimais declarados no escopo `:root`.

C. PERSONALIZAR OS PROFISSIONAIS (index.html & script.js)
   - No `index.html` (Passo 2 do Widget), altere os nomes, cargos e caminhos de imagens dos profissionais nos botões da classe `booking-professional-card`.
   - No `script.js`, altere o mapeamento de IDs sob a constante `profissionaisNomes` dentro da função `renderBookingSummary` para refletir os nomes corretos na tela de resumo.

D. EDITAR OU ADICIONAR TRATAMENTOS (index.html & script.js)
   - Para adicionar um novo tratamento: Crie um novo card de tratamento na seção de tratamentos do `index.html` com o botão `data-tratamento="seu-id"`.
   - Adicione também o botão correspondente no Passo 1 do widget (`data-value="seu-id"`).
   - No `script.js`, insira a tradução do ID do seu tratamento sob a constante `tratamentosNomes` para que apareça correto no resumo final.

E. CONECTAR O AGENDAMENTO COM WHATSAPP OU E-MAIL (script.js)
   Como o template é estático, o Passo 4 apenas exibe uma tela de sucesso simulada. Para que você receba de fato as mensagens dos clientes, pode optar por uma das duas abordagens no `script.js`:

   * Opção 1: Redirecionar para o WhatsApp com os dados preenchidos:
     No evento de clique do Passo 3 (`next-step-3`), você pode capturar as variáveis de `bookingState` e abrir uma nova aba do WhatsApp Web:
     
     const mensagem = `Olá, gostaria de agendar uma avaliação. Tratamento: ${bookingState.treatment}, Profissional: ${bookingState.professional}, Data: ${bookingState.date} às ${bookingState.time}. Meu nome: ${bookingState.clientName}.`;
     const url = `https://api.whatsapp.com/send?phone=SEUTELEFONE&text=${encodeURIComponent(mensagem)}`;
     window.open(url, '_blank');

   * Opção 2: Integrar com serviço de envio de e-mails (como EmailJS ou Formspree):
     Você pode fazer uma requisição POST com `fetch()` enviando os dados do formulário para o seu endpoint de e-mail ou API de agendamentos no Passo 3.

------------------------------------------------------------------------
5. SUPORTE E CRÉDITOS
------------------------------------------------------------------------

*   Imagens: As imagens em `/assets` são ilustrativas e de altíssima qualidade para uso livre no projeto da clínica.
*   Ícones: A biblioteca Lucide Icons é carregada dinamicamente via CDN. Você pode encontrar novos ícones e seus respectivos códigos em: https://lucide.dev
*   Animações: Para customizar as velocidades e efeitos das animações de rolagem, consulte a documentação oficial do GSAP: https://greensock.com/docs/

Desenvolvido para proporcionar requinte, conversão e a melhor experiência visual.

