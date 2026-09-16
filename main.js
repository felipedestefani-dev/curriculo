(function () {
  window.initCurriculumPage = function () {
  const header = document.getElementById("header");
  const navToggle = document.getElementById("nav-toggle");
  const navMenu = document.getElementById("nav-menu");
  const navLinks = navMenu.querySelectorAll("a");
  const yearEl = document.getElementById("year");

  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  function closeNav() {
    navMenu.classList.remove("open");
    navToggle.setAttribute("aria-expanded", "false");
    document.body.classList.remove("nav-open");
  }

  navToggle.addEventListener("click", () => {
    const open = navMenu.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", String(open));
    document.body.classList.toggle("nav-open", open);
  });

  navLinks.forEach((link) => {
    link.addEventListener("click", closeNav);
  });

  window.addEventListener(
    "scroll",
    () => {
      header.classList.toggle("scrolled", window.scrollY > 8);
    },
    { passive: true }
  );

  const sections = document.querySelectorAll("section[id]");
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const id = entry.target.id;
        navLinks.forEach((link) => {
          link.classList.toggle("active", link.getAttribute("href") === "#" + id);
        });
      });
    },
    { rootMargin: "-35% 0px -55% 0px" }
  );

  sections.forEach((section) => sectionObserver.observe(section));

  const revealEls = document.querySelectorAll(
    ".section-title, .prose, .tags-list, .empty-state, .entry, .qualification, .project-card, .language-card, .contact-grid"
  );

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("visible");
        revealObserver.unobserve(entry.target);
      });
    },
    { threshold: 0.08 }
  );

  revealEls.forEach((el) => {
    el.classList.add("reveal");
    revealObserver.observe(el);
  });

  const projetosSection = document.getElementById("projetos");
  const projetosNavLink = navMenu.querySelector('a[href="#projetos"]');
  const verProjetosBtn = document.getElementById("ver-projetos");

  function showProjetos() {
    if (projetosSection) projetosSection.hidden = false;
    if (projetosNavLink) projetosNavLink.hidden = false;
    projetosSection?.querySelectorAll(".reveal").forEach((el) => el.classList.add("visible"));
  }

  verProjetosBtn?.addEventListener("click", showProjetos);
  projetosNavLink?.addEventListener("click", showProjetos);

  if (location.hash === "#projetos") {
    showProjetos();
  }

  const certModal = document.getElementById("cert-modal");
  const certTitle = document.getElementById("cert-modal-title");
  const certImage = document.getElementById("cert-image");
  const certFrame = document.getElementById("cert-frame");
  const certStage = document.getElementById("cert-stage");
  const certZoom = document.getElementById("cert-zoom");
  const certZoomLabel = document.getElementById("cert-zoom-label");
  const certHint = document.getElementById("cert-hint");
  let certScale = 1;
  let certX = 0;
  let certY = 0;
  let certDrag = null;

  function isPdf(url) {
    return /\.pdf($|\?|#)/i.test(url);
  }

  function applyCertTransform() {
    const transform = "translate(" + certX + "px, " + certY + "px) scale(" + certScale + ")";
    certImage.style.transform = transform;
    certFrame.style.transform = transform;
    if (certZoomLabel) certZoomLabel.textContent = Math.round(certScale * 100) + "%";
  }

  function setCertZoom(next) {
    certScale = Math.min(4, Math.max(1, next));
    if (certScale === 1) {
      certX = 0;
      certY = 0;
    }
    applyCertTransform();
  }

  function closeCert() {
    if (!certModal || certModal.hidden) return;
    certModal.hidden = true;
    document.body.classList.remove("cert-open");
    certImage.removeAttribute("src");
    certFrame.removeAttribute("src");
    certImage.hidden = true;
    certFrame.hidden = true;
  }

  function openCert(url, title) {
    if (!certModal) return;
    certTitle.textContent = title || "Certificado";
    certScale = 1;
    certX = 0;
    certY = 0;
    const pdf = isPdf(url);
    certImage.hidden = pdf;
    certFrame.hidden = !pdf;
    certZoom.hidden = pdf;
    certHint.textContent = pdf
      ? "Certificado em PDF."
      : "Use os botões ou a roda do mouse para ampliar. Arraste para mover.";
    if (pdf) certFrame.src = url;
    else certImage.src = url;
    certImage.alt = title || "Certificado";
    applyCertTransform();
    certModal.hidden = false;
    document.body.classList.add("cert-open");
  }

  document.addEventListener("click", (event) => {
    const link = event.target.closest(".qualification-cert");
    if (link) {
      event.preventDefault();
      openCert(link.getAttribute("href"), link.dataset.title);
      return;
    }
    if (event.target.closest("[data-cert-close]")) closeCert();
  });

  certZoom?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-zoom]");
    if (!button) return;
    setCertZoom(certScale + (button.dataset.zoom === "in" ? 0.25 : -0.25));
  });

  certStage?.addEventListener(
    "wheel",
    (event) => {
      if (certModal.hidden || certImage.hidden) return;
      event.preventDefault();
      setCertZoom(certScale + (event.deltaY < 0 ? 0.15 : -0.15));
    },
    { passive: false }
  );

  certStage?.addEventListener("pointerdown", (event) => {
    if (certModal.hidden || certScale <= 1 || event.button !== 0) return;
    certDrag = { id: event.pointerId, x: event.clientX, y: event.clientY, originX: certX, originY: certY };
    certStage.classList.add("is-dragging");
    certStage.setPointerCapture(event.pointerId);
  });

  certStage?.addEventListener("pointermove", (event) => {
    if (!certDrag || certDrag.id !== event.pointerId) return;
    certX = certDrag.originX + event.clientX - certDrag.x;
    certY = certDrag.originY + event.clientY - certDrag.y;
    applyCertTransform();
  });

  function endCertDrag(event) {
    if (!certDrag || certDrag.id !== event.pointerId) return;
    certDrag = null;
    certStage.classList.remove("is-dragging");
  }

  certStage?.addEventListener("pointerup", endCertDrag);
  certStage?.addEventListener("pointercancel", endCertDrag);

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeCert();
  });

  const downloadBtn = document.getElementById("download-pdf");
  const main = document.getElementById("main");

  function showAllReveals() {
    document.querySelectorAll(".reveal").forEach((el) => el.classList.add("visible"));
  }

  if (downloadBtn && main) {
    downloadBtn.addEventListener("click", async () => {
      if (typeof html2pdf === "undefined") {
        window.print();
        return;
      }

      downloadBtn.disabled = true;
      const label = downloadBtn.textContent;
      downloadBtn.textContent = "Gerando PDF…";
      document.body.classList.add("pdf-export");
      showProjetos();
      showAllReveals();

      try {
        await html2pdf()
          .set({
            margin: [12, 12, 12, 12],
            filename: document.body.dataset.pdfName || "Felipe-Destefani-Curriculo.pdf",
            image: { type: "jpeg", quality: 0.95 },
            html2canvas: {
              scale: 2,
              useCORS: true,
              scrollY: -window.scrollY,
              windowWidth: document.documentElement.offsetWidth,
            },
            jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
            pagebreak: { mode: ["css", "legacy"] },
          })
          .from(main)
          .save();
      } catch (err) {
        console.error(err);
        alert(
          "Não foi possível gerar o PDF automaticamente. Use Ctrl+P (ou Cmd+P) e escolha «Salvar como PDF»."
        );
      } finally {
        document.body.classList.remove("pdf-export");
        downloadBtn.disabled = false;
        downloadBtn.textContent = label;
      }
    });
  }
  };

  if (!window.SITE_BOOTSTRAP) {
    document.addEventListener("DOMContentLoaded", window.initCurriculumPage);
  }
})();
