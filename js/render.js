(function () {
  function esc(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function safeHref(href) {
    const value = String(href || "").trim();
    if (/^(https?:|mailto:|tel:|#)/i.test(value)) return value;
    return "#";
  }

  function externalAttrs(href) {
    return /^https?:/i.test(href) ? ' target="_blank" rel="noopener noreferrer"' : "";
  }

  window.renderResume = function (data) {
    if (!data?.profile) return;
    const profile = data.profile;

    document.title = profile.fullName + " | Currículo";
    document.body.dataset.pdfName = (profile.fullName || "Curriculo")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, "-") + "-Curriculo.pdf";

    const logo = document.querySelector(".logo");
    if (logo) logo.textContent = profile.logoName || profile.fullName;

    const greeting = document.querySelector(".hero-greeting");
    if (greeting) greeting.textContent = profile.greeting || "";

    const title = document.querySelector(".hero-content h1");
    if (title) title.textContent = profile.fullName || "";

    const role = document.querySelector(".hero-role");
    if (role) role.textContent = profile.headline || "";

    const footerName = document.getElementById("footer-name");
    if (footerName) footerName.textContent = profile.fullName || "";

    const photoWrap = document.querySelector(".hero-photo-wrap");
    if (photoWrap) {
      const alt = profile.photoAlt || "Foto de " + (profile.fullName || "");
      if (profile.photoUrl) {
        photoWrap.innerHTML =
          '<img class="hero-photo" src="' +
          esc(profile.photoUrl) +
          '" alt="' +
          esc(alt) +
          '" width="180" height="180" />';
      } else {
        photoWrap.innerHTML =
          '<div class="hero-photo-placeholder" aria-hidden="true">' +
          esc(profile.initials || "FD") +
          "</div>";
      }
    }

    const info = document.querySelector(".hero-info");
    if (info) {
      const rows = [];
      if (profile.location) {
        rows.push(
          "<li><svg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" aria-hidden=\"true\"><path d=\"M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z\"/><circle cx=\"12\" cy=\"10\" r=\"3\"/></svg>" +
            esc(profile.location) +
            "</li>"
        );
      }
      if (profile.email) {
        rows.push(
          "<li><svg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" aria-hidden=\"true\"><path d=\"M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z\"/><polyline points=\"22,6 12,13 2,6\"/></svg><a href=\"mailto:" +
            esc(profile.email) +
            "\">" +
            esc(profile.email) +
            "</a></li>"
        );
      }
      if (profile.phoneDisplay) {
        rows.push(
          "<li><svg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" aria-hidden=\"true\"><path d=\"M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z\"/></svg><a href=\"tel:" +
            esc(profile.phoneTel || "") +
            "\">" +
            esc(profile.phoneDisplay) +
            "</a></li>"
        );
      }
      info.innerHTML = rows.join("");
    }

    const prose = document.getElementById("sobre-prose");
    if (prose) {
      prose.innerHTML = (data.about?.paragraphs || [])
        .filter(Boolean)
        .map((paragraph) => "<p>" + esc(paragraph) + "</p>")
        .join("");
    }

    const skills = document.getElementById("sobre-skills");
    if (skills) {
      skills.innerHTML = (data.about?.skills || [])
        .filter(Boolean)
        .map((skill) => "<li>" + esc(skill) + "</li>")
        .join("");
    }

    const experience = document.getElementById("experiencia-list");
    if (experience) {
      const items = data.experience?.items || [];
      if (!items.length) {
        experience.outerHTML =
          '<p class="empty-state" id="experiencia-list">' +
          esc(data.experience?.emptyMessage || "Sem experiência") +
          "</p>";
      } else {
        if (experience.tagName !== "OL") {
          experience.outerHTML = '<ol class="entries" id="experiencia-list"></ol>';
        }
        const list = document.getElementById("experiencia-list");
        list.className = "entries";
        list.innerHTML = items
          .map((item, index) => {
            const action =
              item.actionLabel && item.actionHref
                ? '<a class="btn btn-outline"' +
                  (item.actionHref === "#projetos" && index === 0 ? ' id="ver-projetos"' : "") +
                  ' href="' +
                  esc(safeHref(item.actionHref)) +
                  '">' +
                  esc(item.actionLabel) +
                  "</a>"
                : "";
            const bullets = (item.bullets || []).filter(Boolean);
            return (
              "<li class=\"entry\"><div class=\"entry-header\"><div><h3>" +
              esc(item.title) +
              "</h3>" +
              (item.organization ? '<p class="entry-org">' + esc(item.organization) + "</p>" : "") +
              "</div>" +
              (item.date ? '<time class="entry-date">' + esc(item.date) + "</time>" : "") +
              action +
              "</div>" +
              (item.location ? '<p class="entry-location">' + esc(item.location) + "</p>" : "") +
              (item.note ? '<p class="entry-note">' + esc(item.note) + "</p>" : "") +
              (bullets.length
                ? "<ul class=\"entry-list\">" +
                  bullets.map((bullet) => "<li>" + esc(bullet) + "</li>").join("") +
                  "</ul>"
                : "") +
              "</li>"
            );
          })
          .join("");
      }
    }

    const education = document.getElementById("formacao-list");
    if (education) {
      const items = data.education || [];
      education.innerHTML = items.length
        ? items
            .map((item) => {
              return (
                '<li class="entry' +
                (item.future ? " entry-future" : "") +
                '"><div class="entry-header"><div><h3>' +
                esc(item.title) +
                "</h3>" +
                (item.institution ? '<p class="entry-org">' + esc(item.institution) + "</p>" : "") +
                "</div>" +
                (item.badge ? '<span class="entry-badge">' + esc(item.badge) + "</span>" : "") +
                "</div>" +
                (item.note ? '<p class="entry-note">' + esc(item.note) + "</p>" : "") +
                "</li>"
              );
            })
            .join("")
        : '<li class="entry"><p class="empty-state">Nenhuma formação cadastrada.</p></li>';
    }

    const extra = document.getElementById("cursos-extra");
    if (extra) extra.textContent = data.courses?.titleExtra || "";

    const intro = document.getElementById("cursos-intro");
    if (intro) intro.textContent = data.courses?.intro || "";

    const courses = document.getElementById("cursos-list");
    if (courses) {
      const items = data.courses?.items || [];
      courses.innerHTML = items.length
        ? items
            .map((item) => {
              const certHref = item.certificateUrl ? safeHref(item.certificateUrl) : "";
              const cert =
                certHref && certHref !== "#"
                  ? '<a class="qualification-cert" href="' +
                    esc(certHref) +
                    '" data-title="' +
                    esc(item.title || "Certificado") +
                    '">' +
                    esc(item.certificateLabel || "Ver certificado") +
                    "</a>"
                  : "";
              return (
                '<li class="qualification"><div class="qualification-main">' +
                (item.type ? '<span class="qualification-badge">' + esc(item.type) + "</span>" : "") +
                '<div class="qualification-header"><h3>' +
                esc(item.title) +
                "</h3>" +
                (item.year ? '<time class="qualification-date">' + esc(item.year) + "</time>" : "") +
                "</div>" +
                (item.institution ? '<p class="qualification-org">' + esc(item.institution) + "</p>" : "") +
                (item.detail ? '<p class="qualification-detail">' + esc(item.detail) + "</p>" : "") +
                "</div>" +
                cert +
                "</li>"
              );
            })
            .join("")
        : '<li class="qualification"><p class="empty-state">' +
          esc(data.courses?.emptyMessage || "Nenhum curso no momento.") +
          "</p></li>";
    }

    const projectsSection = document.getElementById("projetos");
    const projectsLink = document.querySelector('.nav a[href="#projetos"]');
    const visible = Boolean(data.projects?.visible);
    if (projectsSection) projectsSection.hidden = !visible;
    if (projectsLink) projectsLink.hidden = !visible;

    const lead = document.getElementById("projetos-lead");
    if (lead) lead.textContent = data.projects?.lead || "";

    const projects = document.getElementById("projetos-list");
    if (projects) {
      projects.innerHTML = (data.projects?.items || [])
        .map((item) => {
          const href = safeHref(item.url);
          return (
            '<li class="project-card"><div class="project-card-info"><div class="project-card-top"><h3 class="project-title">' +
            esc(item.title) +
            "</h3>" +
            (item.url
              ? '<a href="' +
                esc(href) +
                '" class="project-link"' +
                externalAttrs(href) +
                '>Ver site<span aria-hidden="true">↗</span></a>'
              : "") +
            '</div><p class="project-desc">' +
            esc(item.description) +
            "</p></div><ul class=\"project-tags\" aria-label=\"Tecnologias\">" +
            (item.tags || []).filter(Boolean).map((tag) => "<li>" + esc(tag) + "</li>").join("") +
            "</ul></li>"
          );
        })
        .join("");
    }

    const languages = document.getElementById("idiomas-list");
    if (languages) {
      languages.innerHTML = (data.languages || [])
        .map((item) => {
          const percent = Math.max(0, Math.min(100, Number(item.percent) || 0));
          return (
            '<li class="language-card"><div class="language-name"><span>' +
            esc(item.name) +
            '</span><span class="language-level">' +
            esc(item.level) +
            '</span></div><div class="language-bar" role="presentation"><span style="width: ' +
            percent +
            '%"></span></div></li>'
          );
        })
        .join("");
    }

    const contactIntro = document.getElementById("contato-intro");
    if (contactIntro) contactIntro.textContent = data.contact?.intro || "";

    const contact = document.getElementById("contato-list");
    if (contact) {
      const cards = [];
      if (profile.email) {
        cards.push({ label: "E-mail", value: profile.email, href: "mailto:" + profile.email });
      }
      if (profile.phoneDisplay) {
        cards.push({
          label: "Telefone",
          value: profile.phoneDisplay,
          href: "tel:" + (profile.phoneTel || ""),
        });
      }
      (data.contact?.links || []).forEach((link) => cards.push(link));
      contact.innerHTML = cards
        .map((card) => {
          const href = safeHref(card.href);
          return (
            "<li><a href=\"" +
            esc(href) +
            '" class="contact-card"' +
            externalAttrs(href) +
            '><span class="contact-label">' +
            esc(card.label) +
            '</span><span class="contact-value">' +
            esc(card.value) +
            "</span></a></li>"
          );
        })
        .join("");
    }
  };
})();
