(function () {
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
      showAllReveals();

      try {
        await html2pdf()
          .set({
            margin: [12, 12, 12, 12],
            filename: "Felipe-Destefani-Curriculo.pdf",
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
})();
