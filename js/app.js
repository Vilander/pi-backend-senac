/* ConstruMarket - Versão Refatorada
   Autor: Vilander Costa
   Backend futuro: Node.js + PostgreSQL/MongoDB
*/

// ========== CONFIGURAÇÃO ==========
const CONFIG = {
  STORAGE_KEY: "cm_services_v1",
  COMMENTS_PREFIX: "cm_comments_",
};

// ========== DADOS DE EXEMPLO ==========
const sampleServices = [
  {
    id: "s1",
    title: "Reforma de banheiro - Pedro Construtor",
    categories: ["Pedreiro(a)", "Azulejista / Pisagista"],
    city: "São Paulo",
    contact: "WhatsApp: +55 11 9xxxx-xxxx",
    description:
      "Reforma completa de banheiro, azulejos, hidráulica básica e assentamento.",
    createdAt: "2025-09-10",
    averageRating: 4.6,
    reviewsCount: 24,
    averagePriceRating: 3,
  },
  {
    id: "s2",
    title: "Instalação elétrica residencial - Luz & Cia",
    categories: ["Eletricista"],
    city: "Campinas",
    contact: "Email: luz@exemplo.com",
    description:
      "Pequenas instalações, substituição de quadro, tomadas e interruptores.",
    createdAt: "2025-08-02",
    averageRating: 4.3,
    reviewsCount: 10,
    averagePriceRating: 2,
  },
  {
    id: "s3",
    title: "Marcenaria sob medida - Oficina dos Móveis",
    categories: ["Marceneiro(a)", "Montador(a) de Móveis"],
    city: "São Paulo",
    contact: "WhatsApp: +55 11 9yyyy-yyyy",
    description:
      "Móveis planejados, armários e revestimentos em MDF e madeira maciça.",
    createdAt: "2025-10-01",
    averageRating: 4.9,
    reviewsCount: 45,
    averagePriceRating: 4,
  },
];

// ========== STORAGE SERVICE ==========
const StorageService = {
  loadServices() {
    const raw = localStorage.getItem(CONFIG.STORAGE_KEY);
    if (raw) return JSON.parse(raw);
    this.saveServices(sampleServices);
    return sampleServices;
  },

  saveServices(services) {
    localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(services));
  },

  loadComments(serviceId) {
    const key = `${CONFIG.COMMENTS_PREFIX}${serviceId}`;
    return JSON.parse(localStorage.getItem(key) || "[]");
  },

  saveComments(serviceId, comments) {
    const key = `${CONFIG.COMMENTS_PREFIX}${serviceId}`;
    localStorage.setItem(key, JSON.stringify(comments));
  },

  findServiceById(id) {
    return this.loadServices().find((s) => s.id === id);
  },

  updateService(updatedService) {
    const services = this.loadServices();
    const index = services.findIndex((s) => s.id === updatedService.id);
    if (index !== -1) {
      services[index] = updatedService;
      this.saveServices(services);
    }
  },

  addService(service) {
    const services = this.loadServices();
    services.unshift(service);
    this.saveServices(services);
  },
};

// ========== RENDERIZAÇÃO ==========
const UIRenderer = {
  renderStars(average) {
    const fullStars = Math.round(average);
    let stars = "";
    for (let i = 1; i <= 5; i++) {
      stars += i <= fullStars ? "★" : "☆";
    }
    return `<span class="text-warning">${stars}</span>`;
  },

  renderPriceRating(priceRating) {
    if (!priceRating) return '<span class="text-muted">Sem avaliações</span>';

    let dollars = "";
    for (let i = 1; i <= 5; i++) {
      dollars += i <= priceRating ? "$" : '<span class="text-muted">$</span>';
    }
    return `<span class="text-success fw-bold">${dollars}</span>`;
  },

  renderCard(service) {
    const initials = service.title.split(" ")[0].slice(0, 2).toUpperCase();
    const priceInfo = service.averagePriceRating
      ? this.renderPriceRating(service.averagePriceRating)
      : '<span class="text-muted small">Sem avaliação de preço</span>';

    const div = document.createElement("div");
    div.className = "col-md-6 col-lg-4";
    div.innerHTML = `
      <div class="card h-100 shadow-sm border-0 card-service">
        <div class="card-body d-flex flex-column">
          <div class="d-flex align-items-center mb-2">
            <div class="logo-circle me-2">${initials}</div>
            <div class="flex-grow-1">
              <h6 class="card-title mb-0">${service.title}</h6>
              <small class="text-muted">${service.category} • ${
      service.city
    }</small>
            </div>
          </div>

          <p class="card-text small flex-grow-1">${service.description}</p>

          <div class="d-flex justify-content-between align-items-center mb-2">
            <div>${this.renderStars(service.averageRating)}</div>
            <small class="text-muted">${service.reviewsCount} avaliações</small>
          </div>

          <div class="d-flex justify-content-between align-items-center">
            <div>${priceInfo}</div>
            <div class="btn-group">
              <button class="btn btn-sm btn-laranja" data-action="contact" data-id="${
                service.id
              }">
                Contato
              </button>
              <button class="btn btn-sm btn-outline-secondary" data-action="details" data-id="${
                service.id
              }">
                Detalhes
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
    return div;
  },

  renderList(services) {
    const container = document.getElementById("cardsContainer");
    const countElement = document.getElementById("countResults");
    const noResultsElement = document.getElementById("noResults");

    container.innerHTML = "";

    if (!services.length) {
      noResultsElement.hidden = false;
      countElement.textContent = 0;
      return;
    }

    noResultsElement.hidden = true;
    countElement.textContent = services.length;
    services.forEach((service) => {
      container.appendChild(this.renderCard(service));
    });
  },
};

// ========== FILTROS E ORDENAÇÃO ==========
const FilterService = {
  applyFilters(services, filters) {
    let filtered = [...services];

    if (filters.query) {
      const q = filters.query.toLowerCase();
      filtered = filtered.filter(
        (s) =>
          s.title.toLowerCase().includes(q) ||
          s.description.toLowerCase().includes(q) ||
          s.category.toLowerCase().includes(q) ||
          s.city.toLowerCase().includes(q)
      );
    }

    if (filters.category) {
      filtered = filtered.filter((s) => s.category === filters.category);
    }

    if (filters.city) {
      const city = filters.city.toLowerCase();
      filtered = filtered.filter((s) => s.city.toLowerCase().includes(city));
    }

    if (filters.priceRange) {
      filtered = this.filterByPriceRange(filtered, filters.priceRange);
    }

    return filtered;
  },

  filterByPriceRange(services, range) {
    if (range === "0-100") {
      return services.filter((s) => s.averagePriceRating <= 1);
    } else if (range === "100-500") {
      return services.filter((s) => s.averagePriceRating === 2);
    } else if (range === "500-2000") {
      return services.filter((s) => s.averagePriceRating === 3);
    } else if (range === "2000+") {
      return services.filter((s) => s.averagePriceRating >= 4);
    }
    return services;
  },

  sortServices(services, sortBy) {
    const sorted = [...services];

    switch (sortBy) {
      case "ratingDesc":
        return sorted.sort((a, b) => b.averageRating - a.averageRating);
      case "priceAsc":
        return sorted.sort(
          (a, b) => (a.averagePriceRating || 0) - (b.averagePriceRating || 0)
        );
      case "priceDesc":
        return sorted.sort(
          (a, b) => (b.averagePriceRating || 0) - (a.averagePriceRating || 0)
        );
      case "newest":
        return sorted.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
      default:
        return sorted;
    }
  },
};

// ========== AVALIAÇÕES ==========
const ReviewService = {
  addReview(serviceId, review) {
    const comments = StorageService.loadComments(serviceId);
    comments.unshift({
      ...review,
      date: new Date().toISOString(),
    });
    StorageService.saveComments(serviceId, comments);

    this.updateServiceRatings(serviceId);
  },

  updateServiceRatings(serviceId) {
    const service = StorageService.findServiceById(serviceId);
    if (!service) return;

    const comments = StorageService.loadComments(serviceId);

    // Atualiza avaliação geral
    const totalStars = comments.reduce((sum, c) => sum + (c.stars || 0), 0);
    service.averageRating =
      comments.length > 0 ? totalStars / comments.length : 0;
    service.reviewsCount = comments.length;

    // Atualiza avaliação de preço (média das avaliações que têm priceRating)
    const priceRatings = comments
      .filter((c) => c.priceRating)
      .map((c) => c.priceRating);
    service.averagePriceRating =
      priceRatings.length > 0
        ? Math.round(
            priceRatings.reduce((sum, p) => sum + p, 0) / priceRatings.length
          )
        : null;

    StorageService.updateService(service);
  },

  formatCommentsForDisplay(comments) {
    if (!comments.length) return "Nenhum comentário ainda.";

    return comments
      .map((c) => {
        const priceInfo = c.priceRating
          ? ` | Preço: ${"$".repeat(c.priceRating)}`
          : "";
        return `- ${c.name} (${c.stars}★${priceInfo}): ${c.text}`;
      })
      .join("\n");
  },
};

// ========== MODAL E FORMULÁRIOS ==========
class ModalManager {
  constructor() {
    this.modalElement = document.getElementById("modal");
    this.modal = new bootstrap.Modal(this.modalElement);
    this.form = document.getElementById("serviceForm");
    this.setupEventListeners();
  }

  setupEventListeners() {
    this.form.addEventListener("submit", (e) => this.handleSubmit(e));
  }

  show() {
    this.modal.show();
  }

  hide() {
    this.modal.hide();
    this.form.reset();
  }

  handleSubmit(event) {
    event.preventDefault();

    const formData = new FormData(this.form);
    const newService = {
      id: "s" + Date.now(),
      title: formData.get("title"),
      category: formData.get("category"),
      city: formData.get("city"),
      contact: formData.get("contact"),
      description: formData.get("description"),
      createdAt: new Date().toISOString().slice(0, 10),
      averageRating: 0,
      reviewsCount: 0,
      averagePriceRating: null, // Será calculado quando houver avaliações
    };

    StorageService.addService(newService);
    this.hide();
    App.refresh();

    alert(
      "Serviço publicado com sucesso!\n\nA avaliação de preço será definida pelos clientes que utilizarem o serviço."
    );
  }
}

// ========== AÇÕES ==========
const ServiceActions = {
  showContact(serviceId) {
    const service = StorageService.findServiceById(serviceId);
    if (!service) {
      alert("Anúncio não encontrado");
      return;
    }

    alert(
      `📞 Contato do anunciante:\n${service.contact}\n\n📋 Descrição:\n${service.description}`
    );
  },

  showDetails(serviceId) {
    const service = StorageService.findServiceById(serviceId);
    if (!service) {
      alert("Anúncio não encontrado");
      return;
    }

    const comments = StorageService.loadComments(serviceId);
    const priceInfo = service.averagePriceRating
      ? "$".repeat(service.averagePriceRating)
      : "Sem avaliação ainda";

    const details = `
═══ ${service.title} ═══

📂 Categoria: ${service.category}
📍 Cidade: ${service.city}
💰 Faixa de preço: ${priceInfo}
⭐ Avaliação: ${service.averageRating.toFixed(1)} (${
      service.reviewsCount
    } avaliações)

💬 Comentários:
${ReviewService.formatCommentsForDisplay(comments)}
    `.trim();

    if (confirm(details + "\n\n❓ Deseja adicionar uma avaliação?")) {
      this.addReview(serviceId);
    }
  },

  addReview(serviceId) {
    const name = prompt("Seu nome:") || "Anônimo";
    const starsInput = prompt("Avaliação do serviço (1 a 5):", "5");
    const stars = Math.max(1, Math.min(5, Number(starsInput) || 5));

    const priceInput = prompt(
      "Como você avalia o preço?\n1$ = Muito barato\n2$$ = Barato\n3$$$ = Justo\n4$$$$ = Caro\n5$$$$$ = Muito caro\n\nDigite 1 a 5:",
      "3"
    );
    const priceRating = Math.max(1, Math.min(5, Number(priceInput) || 3));

    const text = prompt("Comentário (opcional):") || "";

    const review = { name, stars, priceRating, text };
    ReviewService.addReview(serviceId, review);

    App.refresh();
    alert(
      "✅ Avaliação salva com sucesso!\n\nSua avaliação de preço ajudará outros clientes."
    );
  },
};

// ========== APLICAÇÃO PRINCIPAL ==========
const App = {
  elements: {},
  modalManager: null,

  init() {
    this.cacheElements();
    this.modalManager = new ModalManager();
    this.setupEventListeners();
    this.initializeStorage();
    this.refresh();
  },

  cacheElements() {
    this.elements = {
      searchInput: document.getElementById("searchInput"),
      filterCategory: document.getElementById("filterCategory"),
      filterCity: document.getElementById("filterCity"),
      filterPrice: document.getElementById("filterPrice"),
      sortBy: document.getElementById("sortBy"),
      btnSearch: document.getElementById("btnSearch"),
      btnPublish: document.getElementById("btnPublish"),
      yearSpan: document.getElementById("year"),
    };

    this.elements.yearSpan.textContent = new Date().getFullYear();
  },

  setupEventListeners() {
    // Busca
    this.elements.btnSearch.addEventListener("click", () => this.refresh());
    this.elements.searchInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") this.refresh();
    });

    // Filtros
    this.elements.filterCategory.addEventListener("change", () =>
      this.refresh()
    );
    this.elements.filterCity.addEventListener("input", () => this.refresh());
    this.elements.filterPrice.addEventListener("change", () => this.refresh());
    this.elements.sortBy.addEventListener("change", () => this.refresh());

    // Publicar
    this.elements.btnPublish.addEventListener("click", () => {
      this.modalManager.show();
    });

    // Delegação de eventos para cards
    document.getElementById("cardsContainer").addEventListener("click", (e) => {
      const button = e.target.closest("button[data-action]");
      if (!button) return;

      const action = button.dataset.action;
      const id = button.dataset.id;

      if (action === "contact") {
        ServiceActions.showContact(id);
      } else if (action === "details") {
        ServiceActions.showDetails(id);
      }
    });
  },

  initializeStorage() {
    if (!localStorage.getItem(CONFIG.STORAGE_KEY)) {
      StorageService.saveServices(sampleServices);
    }
  },

  getFilters() {
    return {
      query: this.elements.searchInput.value.trim(),
      category: this.elements.filterCategory.value,
      city: this.elements.filterCity.value.trim(),
      priceRange: this.elements.filterPrice.value,
      sortBy: this.elements.sortBy.value,
    };
  },

  refresh() {
    const filters = this.getFilters();
    let services = StorageService.loadServices();

    services = FilterService.applyFilters(services, filters);
    services = FilterService.sortServices(services, filters.sortBy);

    UIRenderer.renderList(services);
  },
};

// ========== INICIALIZAÇÃO ==========
document.addEventListener("DOMContentLoaded", () => {
  App.init();
});
