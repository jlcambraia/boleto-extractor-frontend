# Extrator de Código de Barras - Frontend React

Aplicação frontend em React para upload e extração automática de código de barras de boletos em PDF, consumindo uma API backend.

---

## 🚀 Funcionalidades

- Upload de arquivos PDF via drag & drop ou seleção manual
- Validação de formato e tamanho (apenas PDFs, max 10MB)
- Integração com backend para extração do código de barras
- Exibição do código extraído com opção de copiar para a área de transferência
- Histórico local das extrações salvas no navegador (localStorage)
- Interface responsiva, simples e amigável
- Notificações em popup para ações como cópia e limpeza do histórico

---

## 🛠️ Tecnologias utilizadas

- React.js (Hooks: useState, useEffect, useRef)
- Axios para chamadas HTTP
- CSS customizado para estilização
- API backend para processamento do PDF e extração do código

---

## 📋 Como funciona

- O usuário pode arrastar e soltar um arquivo PDF na área indicada ou clicar para selecionar manualmente.
- O arquivo é validado para garantir que seja PDF e que esteja dentro do limite de tamanho.
- Ao clicar em "Extrair Código de Barras", o arquivo é enviado para a API backend.
- A resposta retorna o código de barras extraído, que é exibido na tela.
- O usuário pode copiar o código para a área de transferência com um clique.
- Todo resultado extraído é salvo no histórico local, que pode ser consultado, copiado e limpado.

---

## 🖼️ Tela e interação

- Área de upload com feedback visual (drag over)
- Indicador de arquivo selecionado com nome e tamanho
- Botão para iniciar extração (desabilitado sem arquivo)
- Spinner e mensagem de “Processando...” durante requisição
- Mensagens de erro claras para formatos inválidos, PDFs protegidos ou código não encontrado
- Popup para feedbacks rápidos (ex: cópia para clipboard, limpeza de histórico)
- Modal para histórico com opção de limpar e copiar cada item

---

## ⚠️ Limitações

- Aceita apenas arquivos PDF
- Tamanho máximo de arquivo: 10MB
- Depende do backend estar funcionando para extração
- PDFs protegidos por senha não são suportados (avisos exibidos ao usuário)

---

## 📞 Contato

Para dúvidas, sugestões ou contribuições, abra uma issue ou envie um pull request.

---

## 📄 Licença

MIT License — livre para uso e modificações.

---

**Desenvolvido com ❤️ por João Luiz Cambraia**
