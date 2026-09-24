const API_KEY = "755c5bd38afa46bea89124627262409";
const API_URL = "https://api.weatherapi.com/v1/current.json";

const form = document.getElementById("search-form");
const cityInput = document.getElementById("city");
const button = document.getElementById("search-btn");
const statusEl = document.getElementById("status");
const result = document.getElementById("result");
const AIR_LABELS = {
  1: "Good",
  2: "Moderate",
  3: "Unhealthy for sensitive groups",
  4: "Unhealthy",
  5: "Very unhealthy",
  6: "Hazardous",
};

form.addEventListener("submit", (event) => {
  event.preventDefault(); 
  const city = cityInput.value.trim();
  if (city) loadWeather(city);
});

async function loadWeather(city) {
  setStatus("Loading...");
  button.disabled = true;

  try {
    const url = `${API_URL}?key=${API_KEY}&q=${encodeURIComponent(city)}&aqi=yes`;
    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      if (data.error && data.error.code === 1006) {
        throw new Error(`No city found for "${city}". Check the spelling and try again.`);
      }
      throw new Error("Could not get the weather. Check your API key and try again.");
    }

    showWeather(data);
    setStatus("");
  } catch (error) {
    result.hidden = true;
    const offline = error instanceof TypeError; 
    setStatus(offline ? "No internet connection. Check it and try again." : error.message, true);
  } finally {
    button.disabled = false;
  }
}

function showWeather(data) {
  const { location, current } = data;

  document.getElementById("place").textContent =
    `${location.name}, ${location.country}`;
  document.getElementById("local-time").textContent =
    `Local time ${location.localtime.split(" ")[1]}`;
  document.getElementById("temp").textContent = `${Math.round(current.temp_c)}°`;
  document.getElementById("condition-text").textContent = current.condition.text;

  const icon = document.getElementById("icon");
  icon.src = `https:${current.condition.icon}`;
  icon.alt = current.condition.text;

  document.getElementById("feels").textContent = `${Math.round(current.feelslike_c)}°C`;
  document.getElementById("humidity").textContent = `${current.humidity}%`;
  document.getElementById("wind").textContent = `${current.wind_kph} km/h`;

  const aqi = current.air_quality && current.air_quality["us-epa-index"];
  document.getElementById("air").textContent = aqi
    ? `${AIR_LABELS[aqi]} (PM2.5: ${current.air_quality.pm2_5.toFixed(1)})`
    : "Not available";

  setBackground(pickTheme(current));
  result.hidden = false;
}
function pickTheme(current) {
  if (!current.is_day) return "night";
  const code = current.condition.code;

  if ([1087, 1273, 1276, 1279, 1282].includes(code)) return "storm";
  if ([1066, 1114, 1117, 1210, 1213, 1216, 1219, 1222, 1225, 1255, 1258, 1261, 1264].includes(code)) return "snow";
  if (code >= 1150 && code <= 1201) return "rain";
  if ([1063, 1240, 1243, 1246, 1249, 1252].includes(code)) return "rain";
  if (code === 1000) return "clear";
  return "cloud";
}

function setStatus(message, isError = false) {
  statusEl.textContent = message;
  statusEl.className = isError ? "error" : "";
}

const VIDEOS = {
  home: "videos/mix.mp4",
  clear: "videos/sunny.mp4",
  cloud: "videos/cloudy.mp4",
  rain: "videos/rain.mp4",
  snow: "videos/snow.mp4",
  storm: "videos/storm.mp4",
  night: "videos/night.mp4",
};

const PARTICLES = {
  home: ["rain", 35],   
  rain: ["rain", 120],
  storm: ["rain", 200],
  snow: ["snow", 70],
  night: ["star", 50],
};

const video = document.getElementById("bg-video");
const scene = document.getElementById("scene");
const drops = document.getElementById("drops");

function setBackground(theme) {
  document.body.dataset.theme = theme;
  makeParticles(theme);
  setVideo(theme);
}

function makeParticles(theme) {
  drops.innerHTML = "";
  if (!PARTICLES[theme]) return;
  const [type, count] = PARTICLES[theme];

  for (let i = 0; i < count; i++) {
    const item = document.createElement("i");
    item.className = type;
    item.style.left = Math.random() * 100 + "%";

    if (type === "star") {
      item.style.top = Math.random() * 70 + "%";
      item.style.animationDelay = Math.random() * 3 + "s";
    } else {
      const seconds = type === "rain" ? 0.6 + Math.random() * 0.6 : 6 + Math.random() * 4;
      item.style.animationDuration = seconds + "s";
      item.style.animationDelay = -Math.random() * seconds + "s"; 
    }
    drops.appendChild(item);
  }
}

function setVideo(theme) {

  video.style.display = "none";
  scene.style.display = "block";

  video.onplaying = () => {
    video.style.display = "block";
    scene.style.display = "none";
  };
  video.onerror = () => {
    video.style.display = "none";
    scene.style.display = "block";
  };

  video.src = VIDEOS[theme];
  video.play().catch(() => {});
}

setBackground("home");