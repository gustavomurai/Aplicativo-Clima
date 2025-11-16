const API_KEY = "aadde3d1e58c1e6d0eaa27a896818e4b";

const GEO_URL = "https://api.openweathermap.org/geo/1.0/direct";
const WEATHER_URL = "https://api.openweathermap.org/data/2.5/weather";
const FORECAST_URL = "https://api.openweathermap.org/data/2.5/forecast";

const STORAGE = {
  LAST_CITY: "weather_last_city",
  FAVORITES: "weather_favorites",
  UNIT: "weather_unit",
  THEME: "weather_theme"
};

function getPage() {
  return document.body.dataset.page || "";
}

function save(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function load(key, defaultValue = null) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return defaultValue;
    return JSON.parse(raw);
  } catch {
    return defaultValue;
  }
}

function toLocalDate(unix, tz) {
  return new Date((unix + tz) * 1000);
}

function formatHour(unix, tz) {
  return toLocalDate(unix, tz).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit"
  });
}

function formatDay(unix, tz) {
  return toLocalDate(unix, tz).toLocaleDateString("pt-BR", {
    weekday: "short",
    day: "2-digit",
    month: "short"
  });
}

function msToKmh(ms) {
  return Math.round(ms * 3.6);
}

function getUnit() {
  return load(STORAGE.UNIT, "metric");
}

function unitSymbol() {
  return getUnit() === "imperial" ? "°F" : "°C";
}

function applyTheme() {
  const theme = load(STORAGE.THEME, "dark");
  document.body.classList.remove("theme-dark", "theme-light");
  document.body.classList.add(theme === "light" ? "theme-light" : "theme-dark");
}

async function searchCity(name, limit = 5) {
  const url = `${GEO_URL}?q=${encodeURIComponent(name)}&limit=${limit}&appid=${API_KEY}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Erro ao buscar cidades");
  const data = await res.json();

  return data.map(c => ({
    name: c.name,
    state: c.state || "",
    country: c.country,
    lat: c.lat,
    lon: c.lon
  }));
}

async function fetchWeather(lat, lon) {
  const unit = getUnit();

  const [nowRes, forecastRes] = await Promise.all([
    fetch(`${WEATHER_URL}?lat=${lat}&lon=${lon}&units=${unit}&lang=pt_br&appid=${API_KEY}`),
    fetch(`${FORECAST_URL}?lat=${lat}&lon=${lon}&units=${unit}&lang=pt_br&appid=${API_KEY}`)
  ]);

  if (!nowRes.ok || !forecastRes.ok) throw new Error("Erro ao carregar clima");

  return {
    now: await nowRes.json(),
    forecast: await forecastRes.json()
  };
}

function iconUrl(code) {
  return `https://openweathermap.org/img/wn/${code}@2x.png`;
}

function favoritesList() {
  return load(STORAGE.FAVORITES, []);
}

function addFavorite(city) {
  const list = favoritesList();
  const exists = list.some(c => c.name === city.name && c.country === city.country);
  if (!exists) {
    list.push(city);
    save(STORAGE.FAVORITES, list);
  }
}

function removeFavorite(name, country) {
  const list = favoritesList().filter(c => !(c.name === name && c.country === country));
  save(STORAGE.FAVORITES, list);
}

function renderCurrent(city, now, tz) {
  const nameEl = document.getElementById("city-name");
  if (!nameEl) return;

  nameEl.textContent = `${city.name}, ${city.country}`;

  const tempEl = document.getElementById("current-temp");
  if (tempEl) tempEl.textContent = `${Math.round(now.main.temp)}${unitSymbol()}`;

  const dateEl = document.getElementById("current-date");
  if (dateEl) dateEl.textContent = formatDay(now.dt, tz);

  const iconEl = document.getElementById("current-icon");
  if (iconEl && now.weather && now.weather[0]) {
    iconEl.src = iconUrl(now.weather[0].icon);
  }
}

function renderHourly(forecast, tz) {
  const box = document.getElementById("hourly-list");
  if (!box) return;

  box.innerHTML = "";

  forecast.list.slice(0, 8).forEach(f => {
    const div = document.createElement("div");
    div.className = "hour-item";
    div.innerHTML = `
      <div class="hour-item-time">${formatHour(f.dt, tz)}</div>
      <img src="${iconUrl(f.weather[0].icon)}" class="hour-item-icon">
      <div class="hour-item-temp">${Math.round(f.main.temp)}${unitSymbol()}</div>
    `;
    box.appendChild(div);
  });
}

function buildDaily(forecast, tz) {
  const map = new Map();

  forecast.list.forEach(f => {
    const d = toLocalDate(f.dt, tz).toISOString().slice(0, 10);

    if (!map.has(d)) {
      map.set(d, {
        date: toLocalDate(f.dt, tz),
        min: f.main.temp,
        max: f.main.temp,
        icon: f.weather[0].icon,
        desc: f.weather[0].description
      });
    } else {
      const obj = map.get(d);
      obj.min = Math.min(obj.min, f.main.temp);
      obj.max = Math.max(obj.max, f.main.temp);
    }
  });

  return [...map.values()].slice(0, 7);
}

function renderWeek(forecast, tz) {
  const box = document.getElementById("week-list");
  if (!box) return;

  const days = buildDaily(forecast, tz);

  box.innerHTML = "";
  days.forEach((d, i) => {
    const div = document.createElement("div");
    div.className = "week-item";
    div.innerHTML = `
      <div class="week-left">
        <div class="week-day">
          ${i === 0 ? "Hoje" : d.date.toLocaleDateString("pt-BR", { weekday: "short" })}
        </div>
        <img src="${iconUrl(d.icon)}" class="week-icon">
        <div class="week-desc">${d.desc}</div>
      </div>
      <div class="week-right">
        <span class="week-temp-max">${Math.round(d.max)}${unitSymbol()}</span>
        <span class="week-temp-min">${Math.round(d.min)}${unitSymbol()}</span>
      </div>
    `;
    box.appendChild(div);
  });
}

function renderAir(now, forecast) {
  const feels = document.getElementById("air-real-feel");
  if (!feels) return;

  feels.textContent = `${Math.round(now.main.feels_like)}${unitSymbol()}`;
  document.getElementById("air-humidity").textContent = `${now.main.humidity}%`;
  document.getElementById("air-wind").textContent = `${msToKmh(now.wind.speed)} km/h`;

  const rain = forecast.list[0].pop ?? 0;
  document.getElementById("air-rain").textContent = `${Math.round(rain * 100)}%`;
}

function setupSearch() {
  const input = document.getElementById("search-input");
  const form = document.getElementById("search-form");
  const list = document.getElementById("suggestions");
  if (!input || !form || !list) return;

  let timer = null;

  input.addEventListener("input", () => {
    clearTimeout(timer);

    timer = setTimeout(async () => {
      const q = input.value.trim();
      if (q.length < 2) {
        list.style.display = "none";
        return;
      }

      const cities = await searchCity(q, 5);

      list.innerHTML = "";
      list.style.display = "block";

      cities.forEach(c => {
        const div = document.createElement("div");
        div.className = "suggestion-item";
        div.textContent = `${c.name}, ${c.state ? c.state + ", " : ""}${c.country}`;
        div.onclick = () => {
          input.value = c.name;
          list.style.display = "none";
          loadWeather(c);
        };
        list.appendChild(div);
      });
    }, 400);
  });

  form.addEventListener("submit", e => {
    e.preventDefault();
    if (input.value.trim() !== "") loadWeather(input.value.trim());
  });
}

async function loadWeather(cityInput) {
  let city = cityInput;

  if (typeof cityInput === "string") {
    const search = await searchCity(cityInput, 1);
    if (!search.length) {
      alert("Cidade não encontrada");
      return;
    }
    city = search[0];
  }

  save(STORAGE.LAST_CITY, city);
  addFavorite(city);

  const { now, forecast } = await fetchWeather(city.lat, city.lon);
  const tz = now.timezone || forecast.city.timezone;

  renderCurrent(city, now, tz);
  renderHourly(forecast, tz);
  renderWeek(forecast, tz);
  renderAir(now, forecast);
}

function renderCities() {
  const box = document.getElementById("cities-list");
  if (!box) return;

  const favs = favoritesList();
  if (!favs.length) {
    box.innerHTML = `<p class="helper-text">Nenhuma cidade salva.</p>`;
    return;
  }

  box.innerHTML = "";
  favs.forEach(c => {
    const row = document.createElement("div");
    row.className = "city-row";
    row.innerHTML = `
      <div class="city-row-main">
        <div class="city-row-name">${c.name}, ${c.country}</div>
        <div class="city-row-sub">${c.state || "Salvo"}</div>
      </div>
      <div class="city-row-actions">
        <button class="btn btn-primary">Usar</button>
        <button class="btn btn-danger">Remover</button>
      </div>
    `;

    const [useBtn, delBtn] = row.querySelectorAll("button");

    useBtn.onclick = () => {
      save(STORAGE.LAST_CITY, c);
      window.location.href = "index.html";
    };

    delBtn.onclick = () => {
      removeFavorite(c.name, c.country);
      renderCities();
    };

    box.appendChild(row);
  });
}

function renderMap() {
  const frame = document.getElementById("map-frame");
  if (!frame) return;

  const city = load(STORAGE.LAST_CITY, null);
  if (!city) {
    frame.outerHTML = `<p class="helper-text">Nenhuma cidade selecionada.</p>`;
    return;
  }

  const { lat, lon } = city;
  frame.src =
    `https://www.openstreetmap.org/export/embed.html?bbox=${lon - 0.2},${lat - 0.2},${lon + 0.2},${lat + 0.2}&layer=mapnik&marker=${lat},${lon}`;
}

function initSettings() {
  const unit = getUnit();
  const theme = load(STORAGE.THEME, "dark");

  document.getElementById("unit-metric").checked = unit === "metric";
  document.getElementById("unit-imperial").checked = unit === "imperial";
  document.getElementById("theme-dark").checked = theme === "dark";
  document.getElementById("theme-light").checked = theme === "light";

  const saveBtn = document.getElementById("settings-save");
  saveBtn.onclick = () => {
    const unitValue = document.querySelector('input[name="unit"]:checked').value;
    const themeValue = document.querySelector('input[name="theme"]:checked').value;

    save(STORAGE.UNIT, unitValue);
    save(STORAGE.THEME, themeValue);
    applyTheme();

    alert("Configurações salvas!");
  };
}

/* ==========================================================
   MENU MOBILE — LÓGICA DO BOTÃO, OVERLAY E FECHAMENTO
========================================================== */

function setupMobileMenu() {
  const btn = document.getElementById("mobile-menu-toggle");
  const overlay = document.getElementById("mobile-menu-overlay");
  const sidebar = document.querySelector(".sidebar");

  if (!btn || !overlay || !sidebar) return;

  function openMenu() {
    document.body.classList.add("menu-open");
  }

  function closeMenu() {
    document.body.classList.remove("menu-open");
  }

  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    document.body.classList.toggle("menu-open");
  });

  overlay.addEventListener("click", closeMenu);

  sidebar.addEventListener("click", (e) => {
    if (e.target.closest(".nav-item")) {
      closeMenu();
    }
  });
}

/* ========================================================== */

document.addEventListener("DOMContentLoaded", () => {
  applyTheme();

  const page = getPage();

  if (page === "dashboard") {
    setupSearch();
    const last = load(STORAGE.LAST_CITY, null);
    loadWeather(last || "Madrid");
  }

  if (page === "cities") renderCities();
  if (page === "map") renderMap();
  if (page === "settings") initSettings();

  setupMobileMenu();
});
