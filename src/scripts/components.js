const categories = [
  { value: "social", label: "Social" },
  { value: "cultural", label: "Cultural" },
  { value: "language", label: "Language" },
  { value: "academic", label: "Academic" },
  { value: "sports", label: "Sports" },
  { value: "trips", label: "Trips" },
];

function setPageContent(contentMap) {
  Object.entries(contentMap).forEach(([id, value]) => {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  });
}

function createCategoryOptions(selectId, defaultLabel) {
  const select = document.getElementById(selectId);
  if (!select) return;
  select.innerHTML = "";
  const defaultOpt = document.createElement("option");
  defaultOpt.value = "";
  defaultOpt.textContent = defaultLabel;
  select.appendChild(defaultOpt);
  categories.forEach((cat) => {
    const opt = document.createElement("option");
    opt.value = cat.value;
    opt.textContent = cat.label;
    select.appendChild(opt);
  });
}

function createFilterTags(containerId, allLabel) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = "";
  const allBtn = document.createElement("button");
  allBtn.className = "filter-tag filter-tag--active";
  allBtn.textContent = allLabel;
  container.appendChild(allBtn);
  categories.forEach((cat) => {
    const btn = document.createElement("button");
    btn.className = "filter-tag";
    btn.textContent = cat.label;
    container.appendChild(btn);
  });
}

function createButton(href, variant, text) {
  const el = document.createElement("div");
  el.setAttribute("data-include", "components/button/button");
  el.dataset.href = href;
  el.dataset.variant = variant;
  el.dataset.text = text;
  return el;
}

function createBackButton(size, stroke) {
  const el = document.createElement("div");
  el.setAttribute("data-include", "components/back-button/back-button");
  el.dataset.size = String(size);
  el.dataset.stroke = String(stroke);
  return el;
}
