/* ConstruMarket - Versão Híbrida (Bootstrap + lógica completa)
   Autor: Vilander Costa
   Backend futuro: Node.js + PostgreSQL/MongoDB
*/

/* ---------- Dados de exemplo ---------- */
const sampleServices = [
  {
    id: "s1",
    title: "Reforma de banheiro - Pedro Construtor",
    category: "Pedreiro",
    city: "São Paulo",
    price: 1500,
    contact: "WhatsApp: +55 11 9xxxx-xxxx",
    description:
      "Reforma completa de banheiro, azulejos, hidráulica básica e assentamento.",
    createdAt: "2025-09-10",
    averageRating: 4.6,
    reviewsCount: 24,
  },
  {
    id: "s2",
    title: "Instalação elétrica residencial - Luz & Cia",
    category: "Eletricista",
    city: "Campinas",
    price: 450,
    contact: "Email: luz@exemplo.com",
    description:
      "Pequenas instalações, substituição de quadro, tomadas e interruptores.",
    createdAt: "2025-08-02",
    averageRating: 4.3,
    reviewsCount: 10,
  },
  {
    id: "s3",
    title: "Marcenaria sob medida - Oficina dos Móveis",
    category: "Marceneiro(a)",
    city: "São Paulo",
    price: 3200,
    contact: "WhatsApp: +55 11 9yyyy-yyyy",
    description:
      "Móveis planejados, armários e revestimentos em MDF e madeira maciça.",
    createdAt: "2025-10-01",
    averageRating: 4.9,
    reviewsCount: 45,
  },
];

/* ---------- Referências DOM ---------- */
const cardsContainer = document.getElementById("cardsContainer");
const countResults = document.getElementById("countResults");
const noResults = document.getElementById("noResults");
const searchInput = document.getElementById("searchInput");
const filterCategory = document.getElementById("filterCategory");
const filterCity = document.getElementById("filterCity");
const filterPrice = document.getElementById("filterPrice");
const sortBy = document.getElementById("sortBy");
const btnSearch = document.getElementById("btnSearch");
const btnPublish = document.getElementById("btnPublish");
const serviceForm = document.getElementById("serviceForm");
const yearSpan = document.getElementById("year");

yearSpan.textContent = new Date().getFullYear();

/* ---------- Armazenamento local (demo) ---------- */
const STORAGE_KEY = "cm_services_v1";

function loadServices() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) return JSON.parse(raw);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sampleServices));
  return sampleServices;
}

function saveServices(arr) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
}

/* ---------- Renderização ---------- */
function renderStars(avg) {
  const full = Math.round(avg);
  let out = "";
  for (let i = 1; i <= 5; i++) {
    out += i <= full ? "★" : "☆";
  }
  return `<span class="text-warning">${out}</span>`;
}

function renderCard(service) {
  const div = document.createElement("div");
  div.className = "col-md-6 col-lg-4";
  div.innerHTML = `
    <div class="card h-100 shadow-sm border-0">
      <div class="card-body d-flex flex-column">
        <div class="d-flex align-items-center mb-2">
          <div class="logo-circle me-2">${service.title
            .split(" ")[0]
            .slice(0, 2)
            .toUpperCase()}</div>
          <div>
            <h6 class="card-title mb-0">${service.title}</h6>
            <small class="text-muted">${service.category} • ${
    service.city
  }</small>
          </div>
        </div>

        <p class="card-text small flex-grow-1">${service.description}</p>

        <div class="d-flex justify-content-between align-items-center mb-2">
          <div>${renderStars(service.averageRating)}</div>
          <small class="text-muted">${service.reviewsCount} avaliações</small>
        </div>

        <div class="d-flex justify-content-between align-items-center">
          <strong class="text-marrom">R$ ${service.price.toLocaleString(
            "pt-BR"
          )}</strong>
          <div class="btn-group">
            <button class="btn btn-sm btn-laranja" onclick="openContact('${
              service.id
            }')">
              Contato
            </button>
            <button class="btn btn-sm btn-outline-secondary" onclick="openDetails('${
              service.id
            }')">
              Detalhes
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
  return div;
}

function renderList(services) {
  cardsContainer.innerHTML = "";
  if (!services.length) {
    noResults.hidden = false;
    countResults.textContent = 0;
    return;
  }
  noResults.hidden = true;
  countResults.textContent = services.length;
  services.forEach((s) => cardsContainer.appendChild(renderCard(s)));
}

/* ---------- Filtros e Ordenação ---------- */
function applyFiltersAndRender() {
  const q = searchInput.value.trim().toLowerCase();
  const cat = filterCategory.value;
  const city = filterCity.value.trim().toLowerCase();
  const priceRange = filterPrice.value;
  const sort = sortBy.value;

  let services = loadServices();

  // busca por texto
  if (q)
    services = services.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        s.contact.toLowerCase().includes(q)
    );

  if (cat) services = services.filter((s) => s.category === cat);
  if (city)
    services = services.filter((s) => s.city.toLowerCase().includes(city));

  // faixa de preço
  if (priceRange) {
    if (priceRange === "2000+")
      services = services.filter((s) => s.price >= 2000);
    else {
      const [min, max] = priceRange.split("-").map(Number);
      services = services.filter((s) => s.price >= min && s.price <= max);
    }
  }

  // ordenação
  if (sort === "ratingDesc")
    services.sort((a, b) => b.averageRating - a.averageRating);
  else if (sort === "priceAsc") services.sort((a, b) => a.price - b.price);
  else if (sort === "priceDesc") services.sort((a, b) => b.price - a.price);
  else if (sort === "newest")
    services.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  renderList(services);
}

/* ---------- Eventos ---------- */
btnSearch.addEventListener("click", applyFiltersAndRender);
searchInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") applyFiltersAndRender();
});
filterCategory.addEventListener("change", applyFiltersAndRender);
filterCity.addEventListener("input", applyFiltersAndRender);
filterPrice.addEventListener("change", applyFiltersAndRender);
sortBy.addEventListener("change", applyFiltersAndRender);

/* ---------- Modal: publicar serviço ---------- */
const modalElement = document.getElementById("modal");
const modalBootstrap = new bootstrap.Modal(modalElement);

btnPublish.addEventListener("click", () => modalBootstrap.show());

serviceForm.addEventListener("submit", (evt) => {
  evt.preventDefault();
  const form = new FormData(serviceForm);
  const newService = {
    id: "s" + Date.now(),
    title: form.get("title"),
    category: form.get("category"),
    city: form.get("city"),
    price: Number(form.get("price")) || 0,
    contact: form.get("contact"),
    description: form.get("description"),
    createdAt: new Date().toISOString().slice(0, 10),
    averageRating: 0,
    reviewsCount: 0,
  };
  const arr = loadServices();
  arr.unshift(newService);
  saveServices(arr);
  serviceForm.reset();
  modalBootstrap.hide();
  applyFiltersAndRender();
  alert(
    "Serviço salvo localmente (demo). Posteriormente, conecte com sua API Node.js."
  );
});

/* ---------- Detalhes e Contato ---------- */
window.openContact = function (id) {
  const services = loadServices();
  const s = services.find((x) => x.id === id);
  if (!s) return alert("Anúncio não encontrado");
  const msg = `Contato do anunciante:\n${s.contact}\n\nDescrição:\n${s.description}`;
  alert(msg);
};

window.openDetails = function (id) {
  const services = loadServices();
  const s = services.find((x) => x.id === id);
  if (!s) return alert("Anúncio não encontrado");

  const commentsKey = `cm_comments_${s.id}`;
  const comments = JSON.parse(localStorage.getItem(commentsKey) || "[]");
  let lines = `== ${s.title} ==\nCategoria: ${s.category}\nCidade: ${s.city}\nPreço: R$ ${s.price}\n\nComentários:\n`;
  if (!comments.length) lines += "Nenhum comentário ainda.";
  else
    comments.forEach((c) => {
      lines += `- ${c.name} (${c.stars}★): ${c.text}\n`;
    });

  if (confirm(lines + "\n\nDeseja adicionar um comentário?")) {
    const name = prompt("Seu nome (apenas para demo):") || "Anônimo";
    const stars = Number(prompt("Avaliação (1 a 5):", "5")) || 5;
    const text = prompt("Comentário:") || "";
    comments.unshift({ name, stars, text, date: new Date().toISOString() });
    localStorage.setItem(commentsKey, JSON.stringify(comments));

    const prevSum = s.averageRating * s.reviewsCount;
    s.reviewsCount += 1;
    s.averageRating = (prevSum + stars) / s.reviewsCount;

    const arr = loadServices();
    const idx = arr.findIndex((x) => x.id === s.id);
    arr[idx] = s;
    saveServices(arr);
    applyFiltersAndRender();
    alert(
      "Comentário salvo localmente (demo). No backend, envie para sua rota de reviews."
    );
  }
};

/* ---------- Inicialização ---------- */
(function init() {
  if (!localStorage.getItem(STORAGE_KEY)) saveServices(sampleServices);
  applyFiltersAndRender();
})();
