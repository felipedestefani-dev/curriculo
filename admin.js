(function () {
  const app = document.getElementById("app");
  const logoutBtn = document.getElementById("logout");
  const tabs = [
    ["perfil", "Perfil"],
    ["sobre", "Sobre"],
    ["experiencia", "Experiência"],
    ["formacao", "Formação"],
    ["cursos", "Cursos"],
    ["projetos", "Projetos"],
    ["idiomas", "Idiomas"],
    ["contato", "Contato"],
  ];

  let resume = structuredClone(window.DEFAULT_RESUME);
  let active = "perfil";
  let status = { text: "", kind: "" };

  function clone(value) {
    return structuredClone(value);
  }

  function client() {
    return window.getSupabaseClient();
  }

  function configured() {
    return Boolean(window.SITE_CONFIG.supabaseUrl && window.SITE_CONFIG.supabaseAnonKey);
  }

  function setStatus(text, kind) {
    status = { text, kind };
    const node = document.getElementById("status");
    if (!node) return;
    node.textContent = text;
    node.className = kind === "ok" ? "status-ok" : kind === "error" ? "status-error" : "";
  }

  function field(label, value, onInput, options) {
    const opts = options || {};
    const wrap = document.createElement("label");
    wrap.className = "field";
    const span = document.createElement("span");
    span.textContent = label;
    const input = document.createElement(opts.textarea ? "textarea" : "input");
    if (!opts.textarea) input.type = opts.type || "text";
    input.value = value ?? "";
    if (opts.placeholder) input.placeholder = opts.placeholder;
    input.addEventListener("input", () => onInput(input.value));
    wrap.append(span, input);
    return wrap;
  }

  function cardShell(title, onRemove, onUp, onDown) {
    const card = document.createElement("article");
    card.className = "editor-card";
    const heading = document.createElement("h3");
    heading.textContent = title;
    card.append(heading);
    const body = document.createElement("div");
    card.append(body);
    const actions = document.createElement("div");
    actions.className = "card-actions";
    const up = document.createElement("button");
    up.type = "button";
    up.textContent = "Subir";
    up.addEventListener("click", onUp);
    const down = document.createElement("button");
    down.type = "button";
    down.textContent = "Descer";
    down.addEventListener("click", onDown);
    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "danger";
    remove.textContent = "Remover";
    remove.addEventListener("click", onRemove);
    actions.append(up, down, remove);
    card.append(actions);
    return { card, body };
  }

  function addButton(label, onClick) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "admin-btn admin-btn-secondary";
    button.textContent = label;
    button.addEventListener("click", onClick);
    return button;
  }

  function move(list, index, direction) {
    const next = index + direction;
    if (next < 0 || next >= list.length) return;
    const [item] = list.splice(index, 1);
    list.splice(next, 0, item);
    draw();
  }

  function renderPerfil(root) {
    const profile = resume.profile;
    root.append(
      field("Nome no menu", profile.logoName, (value) => {
        profile.logoName = value;
      }),
      field("Nome completo", profile.fullName, (value) => {
        profile.fullName = value;
      }),
      field("Iniciais da foto", profile.initials, (value) => {
        profile.initials = value;
      }),
      field("Texto acima do nome", profile.greeting, (value) => {
        profile.greeting = value;
      }),
      field("Linha abaixo do nome", profile.headline, (value) => {
        profile.headline = value;
      }),
      field("Cidade", profile.location, (value) => {
        profile.location = value;
      })
    );
    const grid = document.createElement("div");
    grid.className = "grid-2";
    grid.append(
      field("E-mail", profile.email, (value) => {
        profile.email = value;
      }, { type: "email" }),
      field("Telefone visível", profile.phoneDisplay, (value) => {
        profile.phoneDisplay = value;
      }),
      field("Telefone para ligação", profile.phoneTel, (value) => {
        profile.phoneTel = value;
      }, { placeholder: "+5519989599014" }),
      field("Foto (URL ou foto.jpg)", profile.photoUrl, (value) => {
        profile.photoUrl = value;
      })
    );
    root.append(grid);

    const upload = document.createElement("label");
    upload.className = "field";
    upload.innerHTML = "<span>Enviar nova foto</span>";
    const file = document.createElement("input");
    file.type = "file";
    file.accept = "image/*";
    file.addEventListener("change", () => uploadPhoto(file.files[0]));
    upload.append(file);
    root.append(upload);
  }

  async function uploadCertificate(file, item) {
    if (!file) return;
    const supabase = client();
    if (!supabase) return setStatus("Conecte o Supabase antes de enviar o certificado.", "error");
    setStatus("Enviando certificado…");
    const ext = (file.name.split(".").pop() || "pdf").toLowerCase();
    const path = "certificates/" + Date.now() + "." + ext;
    const { error } = await supabase.storage.from("photos").upload(path, file, {
      cacheControl: "3600",
      upsert: false,
    });
    if (error) {
      setStatus("Não foi possível enviar o certificado. " + error.message, "error");
      return;
    }
    const { data } = supabase.storage.from("photos").getPublicUrl(path);
    item.certificateUrl = data.publicUrl;
    if (!item.certificateLabel) item.certificateLabel = "Ver certificado";
    setStatus("Certificado enviado. Clique em Salvar para publicar.", "ok");
    draw();
  }

  async function uploadPhoto(file) {
    if (!file) return;
    const supabase = client();
    if (!supabase) return setStatus("Conecte o Supabase antes de enviar a foto.", "error");
    setStatus("Enviando foto…");
    const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
    const path = "profile-" + Date.now() + "." + ext;
    const { error } = await supabase.storage.from("photos").upload(path, file, {
      cacheControl: "3600",
      upsert: false,
    });
    if (error) {
      setStatus("Não foi possível enviar a foto. Rode o SQL do Supabase e tente de novo. " + error.message, "error");
      return;
    }
    const { data } = supabase.storage.from("photos").getPublicUrl(path);
    resume.profile.photoUrl = data.publicUrl;
    setStatus("Foto enviada. Clique em Salvar para publicar.", "ok");
    draw();
  }

  function renderSobre(root) {
    root.append(
      field("Texto sobre você", (resume.about.paragraphs || []).join("\n\n"), (value) => {
        resume.about.paragraphs = value.split(/\n\s*\n/).map((item) => item.trim()).filter(Boolean);
      }, { textarea: true })
    );
    (resume.about.skills || []).forEach((skill, index) => {
      const { card, body } = cardShell(
        "Competência " + (index + 1),
        () => {
          resume.about.skills.splice(index, 1);
          draw();
        },
        () => move(resume.about.skills, index, -1),
        () => move(resume.about.skills, index, 1)
      );
      body.append(
        field("Nome", skill, (value) => {
          resume.about.skills[index] = value;
        })
      );
      root.append(card);
    });
    root.append(
      addButton("Adicionar competência", () => {
        resume.about.skills.push("Nova competência");
        draw();
      })
    );
  }

  function renderExperiencia(root) {
    root.append(
      field("Texto quando não houver experiência", resume.experience.emptyMessage, (value) => {
        resume.experience.emptyMessage = value;
      })
    );
    resume.experience.items.forEach((item, index) => {
      const { card, body } = cardShell(
        item.title || "Experiência " + (index + 1),
        () => {
          resume.experience.items.splice(index, 1);
          draw();
        },
        () => move(resume.experience.items, index, -1),
        () => move(resume.experience.items, index, 1)
      );
      body.append(
        field("Cargo", item.title, (value) => {
          item.title = value;
        }),
        field("Empresa", item.organization, (value) => {
          item.organization = value;
        }),
        field("Período", item.date, (value) => {
          item.date = value;
        }),
        field("Cidade", item.location, (value) => {
          item.location = value;
        }),
        field("Observação", item.note, (value) => {
          item.note = value;
        }),
        field("Atividades (uma por linha)", (item.bullets || []).join("\n"), (value) => {
          item.bullets = value.split("\n").map((line) => line.trim()).filter(Boolean);
        }, { textarea: true }),
        field("Texto do botão", item.actionLabel, (value) => {
          item.actionLabel = value;
        }),
        field("Link do botão", item.actionHref, (value) => {
          item.actionHref = value;
        }, { placeholder: "#projetos ou https://" })
      );
      root.append(card);
    });
    root.append(
      addButton("Adicionar experiência", () => {
        resume.experience.items.push({
          title: "Nova experiência",
          organization: "",
          date: "",
          location: "",
          note: "",
          bullets: [],
          actionLabel: "",
          actionHref: "",
        });
        draw();
      })
    );
  }

  function renderFormacao(root) {
    resume.education.forEach((item, index) => {
      const { card, body } = cardShell(
        item.title || "Formação " + (index + 1),
        () => {
          resume.education.splice(index, 1);
          draw();
        },
        () => move(resume.education, index, -1),
        () => move(resume.education, index, 1)
      );
      body.append(
        field("Curso", item.title, (value) => {
          item.title = value;
        }),
        field("Instituição", item.institution, (value) => {
          item.institution = value;
        }),
        field("Detalhes", item.note, (value) => {
          item.note = value;
        }),
        field("Selo (ex.: Pretensão futura)", item.badge, (value) => {
          item.badge = value;
        })
      );
      const check = document.createElement("label");
      check.className = "check";
      const box = document.createElement("input");
      box.type = "checkbox";
      box.checked = Boolean(item.future);
      box.addEventListener("change", () => {
        item.future = box.checked;
      });
      check.append(box, document.createTextNode("Marcar como pretensão futura"));
      body.append(check);
      root.append(card);
    });
    root.append(
      addButton("Adicionar formação", () => {
        resume.education.push({
          title: "Novo curso",
          institution: "",
          note: "",
          future: false,
          badge: "",
        });
        draw();
      })
    );
  }

  function renderCursos(root) {
    root.append(
      field("Texto ao lado do título", resume.courses.titleExtra, (value) => {
        resume.courses.titleExtra = value;
      }),
      field("Introdução", resume.courses.intro, (value) => {
        resume.courses.intro = value;
      }, { textarea: true })
    );
    resume.courses.items.forEach((item, index) => {
      const { card, body } = cardShell(
        item.title || "Curso " + (index + 1),
        () => {
          resume.courses.items.splice(index, 1);
          draw();
        },
        () => move(resume.courses.items, index, -1),
        () => move(resume.courses.items, index, 1)
      );
      body.append(
        field("Tipo", item.type, (value) => {
          item.type = value;
        }, { placeholder: "Curso, Certificação, App" }),
        field("Nome", item.title, (value) => {
          item.title = value;
        }),
        field("Ano", item.year, (value) => {
          item.year = value;
        }),
        field("Instituição", item.institution, (value) => {
          item.institution = value;
        }),
        field("Detalhes", item.detail, (value) => {
          item.detail = value;
        }, { textarea: true }),
        field("Texto do certificado", item.certificateLabel || "", (value) => {
          item.certificateLabel = value;
        }, { placeholder: "Ver certificado" }),
        field("Link do certificado", item.certificateUrl || "", (value) => {
          item.certificateUrl = value;
        }, { placeholder: "https:// ou envie o arquivo abaixo" })
      );
      const upload = document.createElement("label");
      upload.className = "field";
      const uploadLabel = document.createElement("span");
      uploadLabel.textContent = "Enviar certificado (PDF ou imagem)";
      const file = document.createElement("input");
      file.type = "file";
      file.accept = "application/pdf,image/*";
      file.addEventListener("change", () => uploadCertificate(file.files[0], item));
      upload.append(uploadLabel, file);
      body.append(upload);
      root.append(card);
    });
    root.append(
      addButton("Adicionar curso", () => {
        resume.courses.items.push({
          type: "Curso",
          title: "Novo curso",
          year: "",
          institution: "",
          detail: "",
          certificateLabel: "Ver certificado",
          certificateUrl: "",
        });
        draw();
      })
    );
  }

  function renderProjetos(root) {
    const check = document.createElement("label");
    check.className = "check";
    const box = document.createElement("input");
    box.type = "checkbox";
    box.checked = Boolean(resume.projects.visible);
    box.addEventListener("change", () => {
      resume.projects.visible = box.checked;
    });
    check.append(box, document.createTextNode("Mostrar a aba Projetos no menu"));
    root.append(
      check,
      field("Introdução", resume.projects.lead, (value) => {
        resume.projects.lead = value;
      })
    );
    resume.projects.items.forEach((item, index) => {
      const { card, body } = cardShell(
        item.title || "Projeto " + (index + 1),
        () => {
          resume.projects.items.splice(index, 1);
          draw();
        },
        () => move(resume.projects.items, index, -1),
        () => move(resume.projects.items, index, 1)
      );
      body.append(
        field("Nome", item.title, (value) => {
          item.title = value;
        }),
        field("Link", item.url, (value) => {
          item.url = value;
        }),
        field("Descrição", item.description, (value) => {
          item.description = value;
        }, { textarea: true }),
        field("Tecnologias (separadas por vírgula)", (item.tags || []).join(", "), (value) => {
          item.tags = value.split(",").map((tag) => tag.trim()).filter(Boolean);
        })
      );
      root.append(card);
    });
    root.append(
      addButton("Adicionar projeto", () => {
        resume.projects.items.push({
          title: "Novo projeto",
          url: "",
          description: "",
          tags: [],
        });
        draw();
      })
    );
  }

  function renderIdiomas(root) {
    resume.languages.forEach((item, index) => {
      const { card, body } = cardShell(
        item.name || "Idioma " + (index + 1),
        () => {
          resume.languages.splice(index, 1);
          draw();
        },
        () => move(resume.languages, index, -1),
        () => move(resume.languages, index, 1)
      );
      body.append(
        field("Idioma", item.name, (value) => {
          item.name = value;
        }),
        field("Nível", item.level, (value) => {
          item.level = value;
        }, { placeholder: "Básico, Intermediário, Avançado, Nativo" }),
        field("Barra (0 a 100)", item.percent, (value) => {
          item.percent = Number(value);
        }, { type: "number" })
      );
      root.append(card);
    });
    root.append(
      addButton("Adicionar idioma", () => {
        resume.languages.push({ name: "Novo idioma", level: "Básico", percent: 20 });
        draw();
      })
    );
  }

  function renderContato(root) {
    root.append(
      field("Texto de introdução", resume.contact.intro, (value) => {
        resume.contact.intro = value;
      }, { textarea: true })
    );
    const note = document.createElement("p");
    note.className = "panel-lead";
    note.textContent = "E-mail e telefone vêm da aba Perfil. Aqui você edita LinkedIn, GitHub, Instagram e outros links.";
    root.append(note);
    resume.contact.links.forEach((item, index) => {
      const { card, body } = cardShell(
        item.label || "Link " + (index + 1),
        () => {
          resume.contact.links.splice(index, 1);
          draw();
        },
        () => move(resume.contact.links, index, -1),
        () => move(resume.contact.links, index, 1)
      );
      body.append(
        field("Nome", item.label, (value) => {
          item.label = value;
        }),
        field("Texto visível", item.value, (value) => {
          item.value = value;
        }),
        field("Link", item.href, (value) => {
          item.href = value;
        })
      );
      root.append(card);
    });
    root.append(
      addButton("Adicionar link", () => {
        resume.contact.links.push({ label: "Novo link", value: "Abrir", href: "https://" });
        draw();
      })
    );
  }

  const panels = {
    perfil: renderPerfil,
    sobre: renderSobre,
    experiencia: renderExperiencia,
    formacao: renderFormacao,
    cursos: renderCursos,
    projetos: renderProjetos,
    idiomas: renderIdiomas,
    contato: renderContato,
  };

  function draw() {
    app.innerHTML = "";
    const main = document.createElement("main");
    main.className = "admin-main";

    const nav = document.createElement("nav");
    nav.className = "admin-tabs";
    nav.setAttribute("aria-label", "Seções do currículo");
    tabs.forEach(([id, label]) => {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = label;
      button.setAttribute("aria-selected", String(id === active));
      button.addEventListener("click", () => {
        active = id;
        draw();
      });
      nav.append(button);
    });

    const panel = document.createElement("section");
    panel.className = "panel";
    const title = tabs.find((tab) => tab[0] === active)[1];
    const heading = document.createElement("h2");
    heading.textContent = title;
    panel.append(heading);
    panels[active](panel);

    const bar = document.createElement("div");
    bar.className = "save-bar";
    const message = document.createElement("p");
    message.id = "status";
    message.textContent = status.text;
    message.className = status.kind === "ok" ? "status-ok" : status.kind === "error" ? "status-error" : "";
    const actions = document.createElement("div");
    actions.className = "inline-actions";
    const save = document.createElement("button");
    save.type = "button";
    save.className = "admin-btn";
    save.textContent = "Salvar";
    save.addEventListener("click", saveResume);
    actions.append(save);
    bar.append(message, actions);

    main.append(nav, panel, bar);
    app.append(main);
    logoutBtn.hidden = false;
  }

  async function saveResume() {
    const supabase = client();
    if (!supabase) return setStatus("Configure a conexão com o Supabase primeiro.", "error");
    const { data: userData } = await supabase.auth.getUser();
    const email = userData.user?.email || "";
    if (email.toLowerCase() !== window.SITE_CONFIG.adminEmail.toLowerCase()) {
      return setStatus("Só a conta " + window.SITE_CONFIG.adminEmail + " pode salvar.", "error");
    }
    setStatus("Salvando…");
    const { error } = await supabase.from("site_content").upsert({
      id: 1,
      data: resume,
      updated_at: new Date().toISOString(),
    });
    if (error) {
      setStatus("Não salvou. Rode o arquivo supabase/schema.sql no SQL Editor. " + error.message, "error");
      return;
    }
    setStatus("Salvo.", "ok");
  }

  function showSetup() {
    logoutBtn.hidden = true;
    app.innerHTML = "";
    const wrap = document.createElement("div");
    wrap.className = "auth-wrap";
    const card = document.createElement("section");
    card.className = "panel auth-card";
    card.innerHTML =
      "<h2>Conectar Supabase</h2>" +
      "<ol class=\"steps\">" +
      "<li>Crie um projeto em supabase.com.</li>" +
      "<li>Abra SQL Editor e rode o arquivo supabase/schema.sql.</li>" +
      "<li>Em Authentication, crie o usuário felipedestefanidasilva@gmail.com.</li>" +
      "<li>Em Project Settings → API, copie a URL e a chave anon.</li>" +
      "</ol>";
    const url = field("URL do projeto", window.SITE_CONFIG.supabaseUrl, () => {}, {
      placeholder: "https://xxxx.supabase.co",
    });
    const key = field("Chave anon", window.SITE_CONFIG.supabaseAnonKey, () => {}, {
      placeholder: "eyJhbGciOi...",
    });
    const button = document.createElement("button");
    button.type = "button";
    button.className = "admin-btn";
    button.textContent = "Continuar";
    button.addEventListener("click", () => {
      const urlInput = url.querySelector("input").value.trim();
      const keyInput = key.querySelector("input").value.trim();
      if (!urlInput || !keyInput) return;
      window.saveSupabaseConfig(urlInput, keyInput);
      boot();
    });
    card.append(url, key, button);
    wrap.append(card);
    app.append(wrap);
  }

  function showLogin() {
    logoutBtn.hidden = true;
    app.innerHTML = "";
    const wrap = document.createElement("div");
    wrap.className = "auth-wrap";
    const card = document.createElement("section");
    card.className = "panel auth-card";
    const heading = document.createElement("h2");
    heading.textContent = "Entrar";
    const lead = document.createElement("p");
    lead.className = "panel-lead";
    lead.textContent = window.SITE_CONFIG.adminEmail;
    const email = field("E-mail", window.SITE_CONFIG.adminEmail, () => {}, { type: "email" });
    const password = field("Senha", "", () => {}, { type: "password" });
    const message = document.createElement("p");
    message.id = "login-status";
    const enter = document.createElement("button");
    enter.type = "button";
    enter.className = "admin-btn";
    enter.textContent = "Entrar";
    const create = document.createElement("button");
    create.type = "button";
    create.className = "text-btn";
    create.textContent = "Criar conta";
    const change = document.createElement("button");
    change.type = "button";
    change.className = "text-btn";
    change.textContent = "Trocar conexão";
    change.addEventListener("click", () => {
      window.saveSupabaseConfig("", "");
      showSetup();
    });

    async function auth(mode) {
      const supabase = client();
      const emailValue = email.querySelector("input").value.trim();
      const passwordValue = password.querySelector("input").value;
      message.className = "status-error";
      if (emailValue.toLowerCase() !== window.SITE_CONFIG.adminEmail.toLowerCase()) {
        message.textContent = "Use o e-mail autorizado: " + window.SITE_CONFIG.adminEmail;
        return;
      }
      if (passwordValue.length < 6) {
        message.textContent = "A senha precisa ter pelo menos 6 caracteres.";
        return;
      }
      message.className = "";
      message.textContent = "Aguarde…";
      const result =
        mode === "signup"
          ? await supabase.auth.signUp({
              email: emailValue,
              password: passwordValue,
              options: { emailRedirectTo: location.href },
            })
          : await supabase.auth.signInWithPassword({ email: emailValue, password: passwordValue });
      if (result.error) {
        message.className = "status-error";
        message.textContent =
          result.error.message === "Failed to fetch"
            ? "Não consegui conectar ao Supabase. Abra o site por http://localhost ou pelo GitHub Pages, não clicando duas vezes no arquivo. Se acabou de atualizar, recarregue com Cmd+Shift+R."
            : result.error.message;
        return;
      }
      if (!result.data.session) {
        message.className = "status-ok";
        message.textContent = "Conta criada. Confirme o e-mail e depois entre. No Supabase, você pode desativar a confirmação de e-mail em Authentication → Providers.";
        return;
      }
      await openEditor();
    }

    enter.addEventListener("click", () => auth("login"));
    create.addEventListener("click", () => auth("signup"));
    password.querySelector("input").addEventListener("keydown", (event) => {
      if (event.key === "Enter") auth("login");
    });

    const actions = document.createElement("div");
    actions.className = "inline-actions";
    actions.append(enter, create, change);
    card.append(heading, lead, email, password, message, actions);
    wrap.append(card);
    app.append(wrap);
  }

  function normalize(data) {
    const base = clone(window.DEFAULT_RESUME);
    const incoming = data || {};
    return {
      profile: { ...base.profile, ...(incoming.profile || {}) },
      about: {
        paragraphs: incoming.about?.paragraphs || base.about.paragraphs,
        skills: incoming.about?.skills || base.about.skills,
      },
      experience: {
        emptyMessage: incoming.experience?.emptyMessage || base.experience.emptyMessage,
        items: incoming.experience?.items || [],
      },
      education: incoming.education || [],
      courses: {
        titleExtra: incoming.courses?.titleExtra ?? base.courses.titleExtra,
        intro: incoming.courses?.intro ?? base.courses.intro,
        emptyMessage: incoming.courses?.emptyMessage || base.courses.emptyMessage,
        items: incoming.courses?.items || [],
      },
      projects: {
        visible: Boolean(incoming.projects?.visible),
        lead: incoming.projects?.lead ?? base.projects.lead,
        items: incoming.projects?.items || [],
      },
      languages: incoming.languages || [],
      contact: {
        intro: incoming.contact?.intro ?? base.contact.intro,
        links: incoming.contact?.links || [],
      },
    };
  }

  async function openEditor() {
    const supabase = client();
    setStatus("Carregando currículo…", "");
    const { data, error } = await supabase.from("site_content").select("data").eq("id", 1).maybeSingle();
    if (error) {
      resume = clone(window.DEFAULT_RESUME);
      setStatus("Não li o banco. Rode supabase/schema.sql. " + error.message, "error");
    } else if (data?.data?.profile) {
      resume = normalize(data.data);
      setStatus("", "");
    } else {
      resume = clone(window.DEFAULT_RESUME);
      setStatus("Nenhum currículo salvo ainda. Revise e clique em Salvar.", "");
    }
    draw();
  }

  async function boot() {
    if (!window.supabase?.createClient) {
      app.innerHTML = "<main class=\"admin-main\"><section class=\"panel\"><h2>Sem internet</h2><p>O admin precisa carregar a biblioteca do Supabase. Abra esta página com internet.</p></section></main>";
      return;
    }
    if (!configured()) {
      showSetup();
      return;
    }
    const supabase = client();
    const { data } = await supabase.auth.getSession();
    if (data.session?.user?.email?.toLowerCase() === window.SITE_CONFIG.adminEmail.toLowerCase()) {
      await openEditor();
      return;
    }
    showLogin();
  }

  logoutBtn.addEventListener("click", async () => {
    await client()?.auth.signOut();
    showLogin();
  });

  boot();
})();
