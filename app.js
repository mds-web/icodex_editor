window.Icodex = {
  dataPageType: "home",       // default awal
  currentFilePath: "",        // editor only
};



class Navbar {
  constructor(container) {
    if (!(container instanceof Element)) {
      throw new TypeError(
        "Navbar requires a valid DOM element as the first argument.\n" +
        "❌ [ID] container harus berupa elemen DOM yang valid."
      );
    }

    this.container = container;
    this.el = document.createElement("div");
    this.el.className = "navbar";

    this.render();
  }

  render() {
    this.el.innerHTML = ""; // Bersihkan isi

    const inner = document.createElement("div");
    inner.className = "container";

    // Tombol toggle sidebar
    const toggler = document.createElement("span");
    toggler.setAttribute("role", "button");
    toggler.setAttribute("type", "button");
    toggler.setAttribute("aria-label", "sidebar-open");
    toggler.className = "toggler-menu btn";
    toggler.innerHTML = `<i class="bi bi-list"></i>`;
    inner.appendChild(toggler);

    // Ambil dari state global
    const pageType = Icodex.dataPageType;

    if (pageType === "settings" || pageType === "project") {
      const title = document.createElement("span");
      title.className = "page-title";
      title.textContent = pageType.charAt(0).toUpperCase() + pageType.slice(1);
      inner.appendChild(title);
    }
 
    if (pageType === "editor") {
      // Pagination
      const pagination = document.createElement("div");
      pagination.className = "pagination-tab landscape-only";
      ["arrow-left", "arrow-right"].forEach(icon => {
        const span = document.createElement("span");
        span.setAttribute("role", "button");
        span.className = "btn";
        span.innerHTML = `<i class="icodex icodex-${icon}"></i>`;
        pagination.appendChild(span);
      });
      inner.appendChild(pagination);

      // Breadcrumb
      const breadcrumb = document.createElement("ul");
      breadcrumb.className = "breadcrumb";
      breadcrumb.id = "breadcrumb";
      inner.appendChild(breadcrumb);

      // Toolbar
      const toolbar = document.createElement("div");
      toolbar.className = "toolbar-buttons";

      const icons = [
        "icodex icodex-search",
        "icodex icodex-player-play-filled",
        "icodex-sidebar-expand"
      ];

      icons.forEach((icon, i) => {
        const btn = document.createElement("span");
        btn.setAttribute("role", "button");
        btn.className = "btn";
        if (i === 2) btn.classList.add("landscape-only");

        const el = document.createElement(
          icon.startsWith("icodex icodex-") ? "i" : "span"
        );
        el.className = icon;
        btn.appendChild(el);
        toolbar.appendChild(btn);
      });

      inner.appendChild(toolbar);
    }

    this.el.appendChild(inner);
    this.container.appendChild(this.el);

    if (pageType === "editor") {
      this.updateBreadcrumb(Icodex.currentFilePath);
    }
  }

  /**
   * Buat breadcrumb berdasarkan path file
   */
  updateBreadcrumb(path) {
    const breadcrumb = this.el.querySelector("#breadcrumb");
    if (!breadcrumb || !path) return;

    breadcrumb.innerHTML = "";

    const parts = path.replace(/^\/+/, "").split("/");

    const iconMap = {
      css: "devicon-css3-plain colored",
      js: "devicon-javascript-plain colored",
      html: "devicon-html5-plain colored",
      json: "icon-json",
      txt: "icon-txt",
      md: "icon-markdown",
      default: ""
    };

    let cumulative = "";
    parts.forEach((part, index) => {
      cumulative += "/" + part;

      const li = document.createElement("li");
      li.className = "breadcrumb-item";
      li.dataset.index = index;

      const a = document.createElement("a");

      const isLast = index === parts.length - 1;
      const isSingle = parts.length === 1;

      if (isLast) {
        a.classList.add("last");

        const ext = part.includes(".") ? part.split(".").pop() : "";
        const iconClass = iconMap[ext] || iconMap.default;

        const icon = document.createElement("i");
        icon.className = ` ${iconClass}`;

        const span = document.createElement("span");
        span.textContent = part;

        a.appendChild(icon);
        a.appendChild(span);
      } else {
        a.textContent = part;
        if (!isSingle) {
          const chevron = document.createElement("i");
          chevron.className = "icodex icodex-chevron-right";
          a.appendChild(chevron);
        }
      }

      li.appendChild(a);
      breadcrumb.appendChild(li);
    });
  }
}


// Inisialisasi global state
window.Icodex = {
  dataPageType: "editor", // atau "settings"
  currentFilePath: "/ace/src-noconflict/snippets/apache_conf.js"
};

document.addEventListener("DOMContentLoaded", () => {
  const navbar = new Navbar(document.body);
});


const data = [
{
  name: "indri",
  umur: "30",
  isDeat: true //benar
},
{
  name: "indra",
  umur: 22,
  isDeat: true //salah
},
{
  name: "rafael",
  umur: "14",
  isDeat: false //salah
},

]

console.log(data[0])














const nama = 'indri'

/**
 * @repeat = @ulangi 50 kali
 */
console.table(nama.repeat(50))