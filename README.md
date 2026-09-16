# Site de currículo

Página única, design clean e responsivo — serve para qualquer área profissional.

## Seções

- **Início** — nome, cargo, foto, contatos rápidos
- **Sobre** — resumo e competências
- **Experiência profissional**
- **Formação acadêmica**
- **Cursos e qualificações**
- **Projetos** — sites que você desenvolveu
- **Idiomas**
- **Contato**

## Ver no navegador

Abra `index.html` ou rode:

```bash
python3 -m http.server 8080
```

## Editar o currículo (Admin + Supabase)

Abra `admin.html` (ou a aba **Admin** no menu). Sem o Supabase configurado, o site continua com o conteúdo do `index.html`.

1. Crie um projeto em [supabase.com](https://supabase.com).
2. No **SQL Editor**, cole e execute o arquivo `supabase/schema.sql`.
3. Em **Authentication → Users**, crie o usuário `felipedestefanidasilva@gmail.com` (ou use **Criar conta** no admin). Se pedir confirmação de e-mail, desative em **Authentication → Sign In / Providers → Email → Confirm email**, ou confirme a mensagem.
4. Depois de criar a conta, desative o cadastro público para ninguém mais se registrar.
5. Em **Project Settings → API**, copie a **Project URL** e a chave **anon public**.
6. No admin, cole esses dois dados, entre e edite cursos, idiomas, formação e o restante.
7. Clique em **Salvar no Supabase**. Atualize o site para ver as mudanças.

Só esse e-mail consegue gravar. A chave anon pode ficar no navegador: ela é pública; a proteção está nas regras do banco.

## Personalizar sem o admin

1. Edite os textos em `index.html` e em `js/defaults.js` (os dois precisam bater, se ainda não salvou no Supabase).
2. Foto: `foto.jpg` na pasta, ou envie outra no admin.
3. PDF: o botão «Baixar currículo (PDF)» gera o arquivo no navegador (precisa de internet na primeira vez). Alternativa: Ctrl+P / Cmd+P → Salvar como PDF.
4. Cores: variáveis no início de `styles.css` (`--accent`, etc.).

## Publicar

GitHub Pages, Netlify ou Vercel — envie os arquivos da pasta.
