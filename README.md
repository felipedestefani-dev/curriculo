# Site de currículo

Página única, design clean e responsivo — serve para qualquer área profissional.

## Seções

- **Início** — nome, cargo, foto, contatos rápidos
- **Sobre** — resumo e competências
- **Experiência profissional**
- **Formação acadêmica**
- **Cursos e qualificações**
- **Idiomas**
- **Contato**

## Ver no navegador

Abra `index.html` ou rode:

```bash
python3 -m http.server 8080
```

## Personalizar

1. Edite os textos em `index.html`.
2. Foto: salve como `foto.jpg` e altere `src=""` para `src="foto.jpg"`.
3. PDF: o botão «Baixar currículo (PDF)» gera o arquivo automaticamente no navegador (requer internet na primeira vez, para carregar a biblioteca). Alternativa: Ctrl+P / Cmd+P → Salvar como PDF.
4. Cores: variáveis no início de `styles.css` (`--accent`, etc.).
5. Idiomas: ajuste o texto do nível e a largura da barra (`style="width: X%"`).

## Publicar

GitHub Pages, Netlify ou Vercel — envie os arquivos da pasta.
