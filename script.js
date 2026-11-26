const form = document.getElementById("search-form");
const cityInput = document.getElementById("city-input");
const suggestionsList = document.getElementById("suggestions-list");
const statusMsg = document.getElementById("status-msg");
const weatherPanel = document.getElementById("weather-panel");
const effectsLayer = document.getElementById("weather-effects");

const introScreen = document.getElementById("intro-screen");
const introTypingEl = document.getElementById("intro-typing");
const enterBtn = document.getElementById("enter-btn");
const skipBtn = document.getElementById("skip-btn");
const reopenIntroBtn = document.getElementById("reopen-intro-btn");

const countryFlagEl = document.getElementById("country-flag");
const cityNameEl = document.getElementById("city-name");
const countryNameEl = document.getElementById("country-name");
const coordsDisplayEl = document.getElementById("coords-display");
const temperatureEl = document.getElementById("temperature");
const weatherDescEl = document.getElementById("weather-desc");
const feelsLikeEl = document.getElementById("feels-like");
const humidityEl = document.getElementById("humidity");
const windSpeedEl = document.getElementById("wind-speed");
const dayNightEl = document.getElementById("day-night");
const hourlyGridEl = document.getElementById("hourly-grid");

let typingTimer = null;
const fraseIntro = "Monitoramento atmosférico global em tempo real via satélites Open-Meteo.";
// ================= WEB AUDIO API (EFEITOS SCI-FI) =================
let audioCtx = null;

function obterAudioContext() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === "suspended") {
    audioCtx.resume();
  }
  return audioCtx;
}

// Som ascendente de "boot" ao inicializar o sistema
function tocarSomInicializacao() {
  const ctx = obterAudioContext();
  if (!ctx) return;

  const agora = ctx.currentTime;
  const notas = [261.63, 392.0, 523.25, 783.99]; // Dó4, Sol4, Dó5, Sol5

  notas.forEach((freq, idx) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "triangle";
    const inicio = agora + idx * 0.065;
    osc.frequency.setValueAtTime(freq, inicio);

    gain.gain.setValueAtTime(0.001, inicio);
    gain.gain.exponentialRampToValueAtTime(0.09, inicio + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, inicio + 0.14);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(inicio);
    osc.stop(inicio + 0.15);
  });
}

// Bip duplo rápido estilo radar ao escanear uma cidade
function tocarSomEscaneamento() {
  const ctx = obterAudioContext();
  if (!ctx) return;

  const agora = ctx.currentTime;
  const bips = [
    { freq: 880, offset: 0, duracao: 0.06 },
    { freq: 1174.66, offset: 0.075, duracao: 0.08 }
  ];

  bips.forEach(({ freq, offset, duracao }) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    const inicio = agora + offset;
    osc.frequency.setValueAtTime(freq, inicio);

    gain.gain.setValueAtTime(0.001, inicio);
    gain.gain.exponentialRampToValueAtTime(0.08, inicio + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, inicio + duracao);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(inicio);
    osc.stop(inicio + duracao + 0.01);
  });
}

function iniciarDigitacaoIntro() {
  clearTimeout(typingTimer);
  introTypingEl.textContent = "";
  let i = 0;

  function escrever() {
    if (i < fraseIntro.length) {
      introTypingEl.textContent += fraseIntro.charAt(i);
      i++;
      typingTimer = setTimeout(escrever, 32);
    }
  }

  escrever();
}

function fecharIntro() {
  tocarSomInicializacao();
  clearTimeout(typingTimer);
  introScreen.classList.add("intro-hidden");
}

function abrirIntro() {
  introScreen.classList.remove("intro-hidden");
  iniciarDigitacaoIntro();
}

enterBtn.addEventListener("click", fecharIntro);
skipBtn.addEventListener("click", fecharIntro);
reopenIntroBtn.addEventListener("click", abrirIntro);

function traduzirClima(code) {
  if (code === 0) return "Céu limpo";
  if ([1, 2].includes(code)) return "Parcialmente nublado";
  if (code === 3) return "Nublado";
  if ([45, 48].includes(code)) return "Neblina";
  if ([51, 53, 55, 56, 57].includes(code)) return "Garoa";
  if ([61, 63, 65, 66, 67].includes(code)) return "Chuva";
  if ([71, 73, 75, 77].includes(code)) return "Neve";
  if ([80, 81, 82].includes(code)) return "Pancadas de chuva";
  if ([95, 96, 99].includes(code)) return "Tempestade";
  return `Clima (${code})`;
}

function getFlagUrl(countryCode) {
  if (!countryCode) return "";
  return `https://flagcdn.com/w40/${countryCode.toLowerCase()}.png`;
}

function atualizarEfeitosVisuais(code, isDay) {
  effectsLayer.innerHTML = "";
  document.body.classList.remove("theme-rain", "theme-night");

  const estaChovendo = [51, 53, 55, 61, 63, 65, 80, 81, 82, 95, 96, 99].includes(code);

  if (estaChovendo) {
    document.body.classList.add("theme-rain");
    for (let i = 0; i < 45; i++) {
      const drop = document.createElement("span");
      drop.classList.add("raindrop");
      drop.style.left = `${Math.random() * 100}%`;
      drop.style.animationDuration = `${0.55 + Math.random() * 0.55}s`;
      drop.style.animationDelay = `${Math.random() * 1.5}s`;
      effectsLayer.appendChild(drop);
    }
  } else if (isDay === 0) {
    document.body.classList.add("theme-night");
  }
}

function renderizarProximasHoras(hourly, horaAtualIso) {
  hourlyGridEl.innerHTML = "";
  const horaBase = horaAtualIso.slice(0, 13);
  let indexInicial = hourly.time.findIndex((t) => t.startsWith(horaBase));
  if (indexInicial === -1) indexInicial = 0;

  for (let i = 1; i <= 6; i++) {
    const idx = indexInicial + i;
    if (!hourly.time[idx]) break;

    const horaTexto = hourly.time[idx].slice(11, 16);
    const tempHora = Math.round(hourly.temperature_2m[idx]);
    const descHora = traduzirClima(hourly.weather_code[idx]);

    const card = document.createElement("div");
    card.classList.add("hour-card");
    card.innerHTML = `
      <span class="hour-time">${horaTexto}</span>
      <span class="hour-temp">${tempHora}°C</span>
      <span class="hour-desc">${descHora}</span>
    `;
    hourlyGridEl.appendChild(card);
  }
}

async function carregarClimaDeLocal(local) {
  suggestionsList.classList.add("hidden");
  statusMsg.textContent = `Sincronizando telemetria de ${local.name}...`;
  statusMsg.classList.remove("hidden");
  weatherPanel.classList.add("hidden");

  try {
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${local.latitude}&longitude=${local.longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code,wind_speed_10m&hourly=temperature_2m,weather_code&forecast_days=2&timezone=auto`;
    const weatherRes = await fetch(weatherUrl);
    const weatherData = await weatherRes.json();
    const atual = weatherData.current;

    countryFlagEl.src = getFlagUrl(local.country_code);
    countryFlagEl.alt = `Bandeira ${local.country}`;
    cityNameEl.textContent = local.name;
    countryNameEl.textContent = local.admin1 ? `${local.admin1} • ${local.country}` : local.country;
    coordsDisplayEl.textContent = `LAT: ${local.latitude.toFixed(2)}° | LON: ${local.longitude.toFixed(2)}°`;

    temperatureEl.textContent = Math.round(atual.temperature_2m);
    weatherDescEl.textContent = traduzirClima(atual.weather_code);
    feelsLikeEl.textContent = `${Math.round(atual.apparent_temperature)} °C`;
    humidityEl.textContent = `${atual.relative_humidity_2m} %`;
    windSpeedEl.textContent = `${Math.round(atual.wind_speed_10m)} km/h`;
    dayNightEl.textContent = atual.is_day === 1 ? "MODO DIA ☀️" : "MODO NOITE 🌙";

    renderizarProximasHoras(weatherData.hourly, atual.time);
    atualizarEfeitosVisuais(atual.weather_code, atual.is_day);

    statusMsg.classList.add("hidden");
    weatherPanel.classList.remove("hidden");
  } catch (erro) {
    console.error(erro);
    statusMsg.textContent = "Falha de comunicação com os satélites meteorológicos.";
  }
}

async function buscarSugestoesCidades(termo) {
  statusMsg.textContent = `Escaneando coordenadas de "${termo}"...`;
  statusMsg.classList.remove("hidden");

  try {
    const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(termo)}&count=5&language=pt&format=json`;
    const geoRes = await fetch(geoUrl);
    const geoData = await geoRes.json();

    if (!geoData.results || geoData.results.length === 0) {
      suggestionsList.classList.add("hidden");
      statusMsg.textContent = `Cidade "${termo}" não encontrada no radar.`;
      return;
    }

    if (geoData.results.length === 1) {
      carregarClimaDeLocal(geoData.results[0]);
      return;
    }

    suggestionsList.innerHTML = "";
    geoData.results.forEach((local) => {
      const li = document.createElement("li");
      const estado = local.admin1 ? `, ${local.admin1}` : "";
      li.innerHTML = `
        <img class="suggestion-flag" src="${getFlagUrl(local.country_code)}" alt="${local.country}" />
        <span><strong>${local.name}</strong>${estado} — ${local.country}</span>
      `;
      li.addEventListener("click", () => {
        cityInput.value = local.name;
        carregarClimaDeLocal(local);
        tocarSomEscaneamento();
      });
      suggestionsList.appendChild(li);
    });

    suggestionsList.classList.remove("hidden");
    statusMsg.textContent = "Selecione a localização exata na lista acima:";
  } catch (erro) {
    console.error(erro);
    statusMsg.textContent = "Erro ao consultar satélite de geolocalização.";
  }
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const termo = cityInput.value.trim();
  if (termo) {
    tocarSomEscaneamento();
    buscarSugestoesCidades(termo);
  }
});

// Inicia digitação da intro e já carrega Cuiabá em segundo plano
iniciarDigitacaoIntro();
carregarClimaDeLocal({
  name: "Cuiabá",
  admin1: "Mato Grosso",
  country: "Brasil",
  country_code: "BR",
  latitude: -15.6014,
  longitude: -56.0979
});