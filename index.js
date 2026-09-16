// =======================================
// 🍍 INVITACIÓN DE CUMPLEAÑOS · EDICIÓN 2026
// =======================================

const $ = (selector, root = document) => root.querySelector(selector);
const prefersReducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)",
).matches;

const page = $("#page");
const gate = $("#gate");
const music = $("#music");

// =======================================
// 🎬 GIFS
// Son videos MP4 cortos (pesan ~95% menos que un GIF).
// Solo se descargan y reproducen cuando están en pantalla.
// =======================================

const blockedVideos = new Set();

function playVideo(video) {
  if (!video.hasAttribute("src")) video.src = video.dataset.src;
  video.play().catch((error) => {
    // En modo ahorro de energía (iPhone) el navegador pide un toque antes de reproducir
    if (error.name === "NotAllowedError") blockedVideos.add(video);
  });
}

function retryBlockedVideos() {
  blockedVideos.forEach((video) => {
    blockedVideos.delete(video);
    playVideo(video);
  });
}

const videoObserver =
  "IntersectionObserver" in window &&
  new IntersectionObserver(
    (entries) => {
      entries.forEach(({ target: video, isIntersecting }) => {
        if (isIntersecting) {
          playVideo(video);
        } else {
          blockedVideos.delete(video);
          if (!video.paused) video.pause();
        }
      });
    },
    { rootMargin: "200px 0px" },
  );

document.querySelectorAll("video[data-src]").forEach((video) => {
  // Los de ventanas y mensajes se reproducen cuando aparecen
  if (video.closest("#troll, #party, #rsvp-status")) return;
  if (videoObserver) videoObserver.observe(video);
  else playVideo(video);
});

["click", "touchend", "keydown"].forEach((type) =>
  document.addEventListener(type, retryBlockedVideos, { passive: true }),
);

// =======================================
// 🎵 MÚSICA: Jellyfish Jam. No se puede quitar 🙃
// =======================================

let musicStarted = false;

function playMusic() {
  if (!musicStarted) return;
  music.play().catch(() => {
    // Si el navegador la bloquea, arranca con el siguiente toque
    document.addEventListener("click", playMusic, { once: true });
  });
}

function startMusic() {
  musicStarted = true;
  playMusic();
}

// Si la pausan desde el celular, los audífonos o el sistema: vuelve a sonar
music.addEventListener("pause", () => {
  setTimeout(() => {
    if (music.paused && !document.hidden) playMusic();
  }, 400);
});

// En segundo plano se pausa (ahorra batería) y al regresar sigue la fiesta
document.addEventListener("visibilitychange", () => {
  if (!musicStarted) return;
  if (document.hidden) music.pause();
  else playMusic();
});

// Precarga la canción cuando lo demás ya cargó, para que suene al instante al entrar
window.addEventListener("load", () => {
  if (!musicStarted && !navigator.connection?.saveData) music.preload = "auto";
});

if ("mediaSession" in navigator) {
  navigator.mediaSession.metadata = new MediaMetadata({
    title: "Jellyfish Jam",
    artist: "Bob Esponja",
    album: "Mi cumpleaños · Edición 2026",
    artwork: [
      {
        src: "assets/gifs/fiesta-techno.webp",
        sizes: "360x270",
        type: "image/webp",
      },
    ],
  });

  // El botón de pausa de la pantalla de bloqueo tampoco funciona
  ["pause", "stop"].forEach((action) => {
    try {
      navigator.mediaSession.setActionHandler(action, playMusic);
    } catch {
      // Acción no soportada en este navegador
    }
  });
}

// =======================================
// 🔇 BOTÓN DE "QUITAR LA MÚSICA" (spoiler: no la quita)
// =======================================

const troll = $("#troll");
const trollVideo = $("video", troll);
const trollMessages = ["¿Quitar la música? JAJA no", "¿Seguro?", "no se puede"];
let muteAttempts = 0;
let trollTimer;

$("#dj-mute").addEventListener("click", () => {
  muteAttempts += 1;
  $("#troll-text").textContent =
    trollMessages[muteAttempts - 1] ??
    `Intento #${muteAttempts}. Sigue sonando 🎶`;
  troll.hidden = false;
  playVideo(trollVideo);

  // Castigo: la canción se acelera un ratito
  music.preservesPitch = false;
  music.webkitPreservesPitch = false;
  music.playbackRate = 1.35;
  if (music.paused) playMusic();

  clearTimeout(trollTimer);
  trollTimer = setTimeout(() => {
    music.playbackRate = 1;
    troll.hidden = true;
    trollVideo.pause();
  }, 3200);
});

// =======================================
// 🚪 PORTADA: el toque para entrar es lo que deja arrancar la música
// =======================================

page.inert = true;

$("#gate-open").addEventListener("click", () => {
  startMusic(); // Tiene que ir dentro del toque para que el navegador deje sonar
  retryBlockedVideos();

  page.inert = false;
  document.documentElement.classList.remove("gate-open");
  $("#title").focus({ preventScroll: true });

  if (prefersReducedMotion) {
    gate.remove();
    return;
  }
  gate.addEventListener("animationend", (event) => {
    if (event.target === gate) gate.remove();
  });
  gate.classList.add("gate--leaving");
});

// =======================================
// ✨ TÍTULO CON LETRAS BAILARINAS
// =======================================

function splitIntoLetters(element) {
  const text = element.textContent.trim();
  const letters = document.createElement("span");
  letters.setAttribute("aria-hidden", "true");

  let index = 0;
  text.split(" ").forEach((word, wordIndex) => {
    if (wordIndex > 0) letters.append(" ");
    const wordElement = document.createElement("span");
    wordElement.className = "title__word";
    for (const char of word) {
      const letter = document.createElement("span");
      letter.className = "title__letter";
      letter.style.setProperty("--i", index++);
      letter.textContent = char;
      wordElement.append(letter);
    }
    letters.append(wordElement);
  });

  // Los lectores de pantalla leen el texto completo, no letra por letra
  const label = document.createElement("span");
  label.className = "sr-only";
  label.textContent = text;
  element.replaceChildren(label, letters);
}

const title = $("#title");
splitIntoLetters(title);

title.addEventListener("click", () => {
  title.classList.remove("title--boing");
  void title.offsetWidth; // Reinicia la animación
  title.classList.add("title--boing");
});

// =======================================
// 📝 FORMULARIO (Formspree)
// =======================================

const form = $("#rsvp-form");
const nameInput = $("#name");
const submitButton = $("#rsvp-submit");
const statusBox = $("#rsvp-status");
const statusVideo = $("video", statusBox);
const SUBMIT_LABEL = submitButton.textContent;

form.noValidate = true; // Usamos nuestros propios mensajes (con GIF, obvio)

function showStatus(message, { gif = false } = {}) {
  $("p", statusBox).textContent = message;
  statusBox.classList.add("rsvp__status--error");
  statusBox.classList.toggle("rsvp__status--gif", gif);
  statusBox.hidden = false;
  if (gif) playVideo(statusVideo);
}

function hideStatus() {
  statusBox.hidden = true;
  $("p", statusBox).textContent = "";
  statusVideo.pause();
  nameInput.removeAttribute("aria-invalid");
}

async function sendConfirmation(name) {
  const now = new Date();
  const data = new FormData();
  data.append("name", name);
  data.append("date", now.toLocaleDateString("es-ES"));
  data.append("time", now.toLocaleTimeString("es-ES"));
  data.append("timestamp", now.toISOString());

  const response = await fetch(form.action, {
    method: "POST",
    body: data,
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout?.(15000),
  });
  if (!response.ok) throw new Error(`Formspree respondió ${response.status}`);
}

nameInput.addEventListener("input", () => {
  if (!statusBox.hidden) hideStatus();
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (submitButton.disabled) return;

  const name = nameInput.value.trim().replace(/\s+/g, " ");
  if (!name) {
    nameInput.setAttribute("aria-invalid", "true");
    showStatus("¿En serio? Primero escribe tu nombre 🙄", { gif: true });
    nameInput.focus();
    return;
  }

  hideStatus();
  submitButton.disabled = true;
  submitButton.textContent = "🦀 ENVIANDO…";

  try {
    await sendConfirmation(name);
    form.reset();
    celebrate(name);
    submitButton.textContent = "✅ ¡CONFIRMADO!";
    setTimeout(() => {
      submitButton.textContent = SUBMIT_LABEL;
      submitButton.disabled = false;
    }, 4000);
  } catch (error) {
    console.error("❌ No se pudo enviar la confirmación:", error);
    showStatus(
      "😵 No se pudo enviar. Revisa tu internet e inténtalo otra vez.",
    );
    submitButton.textContent = SUBMIT_LABEL;
    submitButton.disabled = false;
  }
});

// =======================================
// 🎉 CELEBRACIÓN AL CONFIRMAR
// =======================================

const party = $("#party");
const partyVideo = $("video", party);
const confettiLayer = $(".party__confetti", party);
const CONFETTI = ["🍍", "🎉", "🎂", "🍔", "🎈", "⭐", "🥳", "🍕"];

function launchConfetti() {
  if (prefersReducedMotion) return;
  const pieces = Array.from({ length: 36 }, (_, i) => {
    const piece = document.createElement("span");
    piece.textContent = CONFETTI[i % CONFETTI.length];
    piece.style.setProperty(
      "--x",
      `${Math.round((Math.random() - 0.5) * 100)}vw`,
    );
    piece.style.setProperty("--y", `${Math.round(-15 - Math.random() * 60)}vh`);
    piece.style.setProperty(
      "--r",
      `${Math.round((Math.random() - 0.5) * 720)}deg`,
    );
    piece.style.setProperty("--delay", `${(Math.random() * 0.25).toFixed(2)}s`);
    return piece;
  });
  confettiLayer.replaceChildren(...pieces);
}

function celebrate(name) {
  if (typeof party.showModal !== "function") {
    alert(`🎉 ¡Listo, ${name}! Ya estás en la lista.`);
    return;
  }
  $("#party-name").textContent = name;
  party.showModal();
  playVideo(partyVideo);
  launchConfetti();
}

party.addEventListener("close", () => {
  partyVideo.pause();
  confettiLayer.replaceChildren();
});

// Cerrar tocando fuera de la tarjeta
party.addEventListener("click", (event) => {
  if (event.target === party) party.close();
});
