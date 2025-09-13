// Lista de todas las imágenes disponibles con optimización
const images = [
  "4055544481f606c6ec99d28f3a72e2a0.jpg",
  "7d2fe4967c357932604df94eac070961.jpg",
  "bbdec40577c89f32f634f7a1f3982623.jpg",
  "cumpleaños-spiderman.gif",
  "d231430e8b4be63a510112fbbb80f223.jpg",
  "d3b035d62e23e3bdcfd329688aed994f.jpg",
  "Estos-son-los-capitulos-de-donde-salieron-los-mejores-memes-de-Los-Simpson.webp",
  "fotonoticia_20210513181308_1200.jpg",
  "Fv8OOrFWAA0LXa7.jpg",
  "images (1).jpeg",
  "images (2).jpeg",
  "images (3).jpeg",
  "images (4).jpeg",
  "images (5).jpeg",
  "images (6).jpeg",
  "images (7).jpeg",
  "images (8).jpeg",
  "images.jpeg",
  "m4r7p5k99yt81.webp",
  "Memes-de-Cumpleanos-1.jpg",
  "que-chingue-su-madre-el-cumpleañero-v0-j5j55ixlktzc1.webp",
  "shrek-funny-pictures-zwlt1e4d8wx8r1pb.jpg",
  "st,small,507x507-pad,600x600,f8f8f8.jpg",
  "The-Office-Michael-Scott-Celebrate.avif",
  "UJ4Y2XSLIRGPXARQ4WNS22RYYI.jpg",
  "x9zb2tkv4ml61.jpg",
];

// 🚀 SISTEMA DE OPTIMIZACIÓN DE IMÁGENES
// =======================================

// Cache de imágenes cargadas
const imageCache = new Map();
const loadedImages = new Set();
const failedImages = new Set();

// Configuración de optimización
const OPTIMIZATION_CONFIG = {
  maxConcurrentLoads: 3, // Máximo 3 imágenes cargando simultáneamente
  retryAttempts: 2, // Intentos de recarga si falla
  preloadCount: 8, // Precargar primeras 8 imágenes
  maxActiveImages: 15, // Máximo 15 imágenes activas en pantalla
  lazyLoadThreshold: 100, // Distancia en px para activar lazy loading
};

// Función para detectar si el dispositivo es móvil
function isMobileDevice() {
  return (
    window.innerWidth <= 768 ||
    /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    )
  );
}

// Función para obtener el tamaño óptimo de imagen según el dispositivo
function getOptimalImageSize() {
  const isMobile = isMobileDevice();
  const screenWidth = window.innerWidth;

  if (isMobile && screenWidth <= 480) {
    return { width: 80, height: 80 }; // Móvil pequeño
  } else if (isMobile && screenWidth <= 768) {
    return { width: 100, height: 100 }; // Móvil/tablet
  } else {
    return { width: 150, height: 150 }; // Desktop
  }
}

// Función para precargar imágenes de manera optimizada
async function preloadImages() {
  console.log("🖼️ Iniciando precarga optimizada de imágenes...");

  const { preloadCount } = OPTIMIZATION_CONFIG;
  const imagesToPreload = images.slice(0, preloadCount);

  // Precargar en lotes pequeños para no saturar la red
  for (let i = 0; i < imagesToPreload.length; i += 2) {
    const batch = imagesToPreload.slice(i, i + 2);
    const promises = batch.map((imageName) => loadImageOptimized(imageName));

    try {
      await Promise.allSettled(promises);
      console.log(`✅ Lote ${Math.floor(i / 2) + 1} precargado`);
    } catch (error) {
      console.warn(`⚠️ Error en lote ${Math.floor(i / 2) + 1}:`, error);
    }

    // Pequeña pausa entre lotes para no bloquear el hilo principal
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  console.log("🎉 Precarga completada");
}

// Función para cargar imagen de manera optimizada
function loadImageOptimized(imageName) {
  return new Promise((resolve, reject) => {
    // Verificar cache primero
    if (imageCache.has(imageName)) {
      resolve(imageCache.get(imageName));
      return;
    }

    // Verificar si ya falló antes
    if (failedImages.has(imageName)) {
      reject(new Error(`Imagen ${imageName} falló previamente`));
      return;
    }

    const img = new Image();

    img.onload = () => {
      imageCache.set(imageName, img);
      loadedImages.add(imageName);
      resolve(img);
    };

    img.onerror = () => {
      failedImages.add(imageName);
      console.warn(`❌ Error cargando imagen: ${imageName}`);
      reject(new Error(`Failed to load ${imageName}`));
    };

    img.src = `photos/${imageName}`;
  });
}

// Función para limpiar imágenes no visibles (garbage collection)
function cleanupInvisibleImages() {
  const allFloatingImages = document.querySelectorAll(".floating-image");
  const { maxActiveImages } = OPTIMIZATION_CONFIG;

  if (allFloatingImages.length > maxActiveImages) {
    // Remover imágenes más antiguas
    const imagesToRemove = Array.from(allFloatingImages).slice(
      0,
      allFloatingImages.length - maxActiveImages
    );

    imagesToRemove.forEach((img) => {
      img.style.transition = "opacity 0.5s ease-out";
      img.style.opacity = "0";
      setTimeout(() => {
        if (img.parentNode) {
          img.parentNode.removeChild(img);
        }
      }, 500);
    });

    console.log(`🧹 Limpieza: removidas ${imagesToRemove.length} imágenes`);
  }
}

// Función para verificar si una imagen está en viewport
function isInViewport(element) {
  const rect = element.getBoundingClientRect();
  const threshold = OPTIMIZATION_CONFIG.lazyLoadThreshold;

  return (
    rect.top >= -threshold &&
    rect.left >= -threshold &&
    rect.bottom <=
      (window.innerHeight || document.documentElement.clientHeight) +
        threshold &&
    rect.right <=
      (window.innerWidth || document.documentElement.clientWidth) + threshold
  );
}

// Monitor de rendimiento
const performanceMonitor = {
  loadTimes: [],
  errors: 0,

  recordLoadTime(time) {
    this.loadTimes.push(time);
    if (this.loadTimes.length > 10) {
      this.loadTimes.shift(); // Mantener solo las últimas 10
    }
  },

  recordError() {
    this.errors++;
  },

  getAverageLoadTime() {
    if (this.loadTimes.length === 0) return 0;
    return this.loadTimes.reduce((a, b) => a + b, 0) / this.loadTimes.length;
  },

  getStats() {
    return {
      avgLoadTime: this.getAverageLoadTime(),
      totalErrors: this.errors,
      cacheSize: imageCache.size,
      loadedCount: loadedImages.size,
      failedCount: failedImages.size,
    };
  },
};

// FUNCIONES DE GESTIÓN DE REGISTROS 📋
// =======================================

// Función para guardar un registro en localStorage
function saveRegistration(name) {
  try {
    // Obtener registros existentes
    const existingRegistrations = getRegistrations();

    // Crear nuevo registro
    const newRegistration = {
      id: Date.now(), // ID único basado en timestamp
      name: name.trim(),
      timestamp: new Date().toISOString(),
      date: new Date().toLocaleDateString("es-ES"),
      time: new Date().toLocaleTimeString("es-ES"),
    };

    // Agregar el nuevo registro
    existingRegistrations.push(newRegistration);

    // Guardar en localStorage
    localStorage.setItem(
      "birthday-rsvp",
      JSON.stringify(existingRegistrations)
    );

    console.log("🎉 Registro guardado:", newRegistration);
    return true;
  } catch (error) {
    console.error("❌ Error al guardar registro:", error);
    return false;
  }
}

// Función para obtener todos los registros
function getRegistrations() {
  try {
    const stored = localStorage.getItem("birthday-rsvp");
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error("❌ Error al obtener registros:", error);
    return [];
  }
}

// Función para exportar registros como CSV
function exportRegistrationsCSV() {
  const registrations = getRegistrations();

  if (registrations.length === 0) {
    alert("📝 No hay registros para exportar");
    return;
  }

  // Crear CSV
  let csvContent = "Nombre,Fecha de Registro,Hora de Registro,Timestamp\n";

  registrations.forEach((reg) => {
    csvContent += `"${reg.name}","${reg.date}","${reg.time}","${reg.timestamp}"\n`;
  });

  // Crear y descargar archivo
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute(
    "download",
    `invitados-cumpleanos-${new Date()
      .toLocaleDateString("es-ES")
      .replace(/\//g, "-")}.csv`
  );
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  console.log("📥 CSV exportado con", registrations.length, "registros");
}

// Función para exportar registros como JSON
function exportRegistrationsJSON() {
  const registrations = getRegistrations();

  if (registrations.length === 0) {
    alert("📝 No hay registros para exportar");
    return;
  }

  const blob = new Blob([JSON.stringify(registrations, null, 2)], {
    type: "application/json",
  });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute(
    "download",
    `invitados-cumpleanos-${new Date()
      .toLocaleDateString("es-ES")
      .replace(/\//g, "-")}.json`
  );
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  console.log("📥 JSON exportado con", registrations.length, "registros");
}

// Función para mostrar estadísticas en consola
function showRegistrationStats() {
  const registrations = getRegistrations();
  console.log("📊 ESTADÍSTICAS DE REGISTROS:");
  console.log("👥 Total de registros:", registrations.length);
  console.log("📝 Lista de invitados:");
  registrations.forEach((reg, index) => {
    console.log(`${index + 1}. ${reg.name} - ${reg.date} ${reg.time}`);
  });
}

// INTEGRACIÓN CON SERVICIOS EXTERNOS 🌐
// =======================================

// OPCIÓN 1: Google Sheets (Más potente)
async function sendToGoogleSheets(name) {
  try {
    // URL de tu Google Apps Script (debes crear uno)
    const SCRIPT_URL = "TU_URL_DE_GOOGLE_APPS_SCRIPT_AQUI";

    const data = {
      name: name,
      timestamp: new Date().toISOString(),
      date: new Date().toLocaleDateString("es-ES"),
      time: new Date().toLocaleTimeString("es-ES"),
      userAgent: navigator.userAgent,
    };

    const response = await fetch(SCRIPT_URL, {
      method: "POST",
      mode: "no-cors",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    console.log("📊 Datos enviados a Google Sheets");
    return true;
  } catch (error) {
    console.error("❌ Error enviando a Google Sheets:", error);
    return false;
  }
}

// OPCIÓN 2: EmailJS (Envío por email)
async function sendViaEmailJS(name) {
  try {
    // Inicializar EmailJS (necesitas registrarte en emailjs.com)
    emailjs.init("TU_USER_ID_DE_EMAILJS");

    const templateParams = {
      to_email: "tu_email@gmail.com", // Tu email donde recibirás las confirmaciones
      from_name: name,
      message: `Nueva confirmación de asistencia: ${name}`,
      date: new Date().toLocaleDateString("es-ES"),
      time: new Date().toLocaleTimeString("es-ES"),
    };

    await emailjs.send(
      "TU_SERVICE_ID", // Service ID de EmailJS
      "TU_TEMPLATE_ID", // Template ID de EmailJS
      templateParams
    );

    console.log("📧 Email enviado via EmailJS");
    return true;
  } catch (error) {
    console.error("❌ Error enviando email:", error);
    return false;
  }
}

// OPCIÓN 3: Formspree (Más simple)
async function sendToFormspree(name) {
  try {
    // URL de tu formulario Formspree (gratis hasta 50 envíos/mes)
    const FORMSPREE_URL = "https://formspree.io/f/mkgvevpw";

    const formData = new FormData();
    formData.append("name", name);
    formData.append("date", new Date().toLocaleDateString("es-ES"));
    formData.append("time", new Date().toLocaleTimeString("es-ES"));
    formData.append("timestamp", new Date().toISOString());

    const response = await fetch(FORMSPREE_URL, {
      method: "POST",
      body: formData,
      headers: {
        Accept: "application/json",
      },
    });

    if (response.ok) {
      console.log("🚀 Datos enviados a Formspree");
      return true;
    } else {
      throw new Error("Error en respuesta de Formspree");
    }
  } catch (error) {
    console.error("❌ Error enviando a Formspree:", error);
    return false;
  }
}

// OPCIÓN 4: Webhook genérico (para cualquier servicio)
async function sendToWebhook(name) {
  try {
    // URL de tu webhook (Zapier, Make.com, etc.)
    const WEBHOOK_URL = "TU_WEBHOOK_URL_AQUI";

    const data = {
      event: "birthday_rsvp",
      name: name,
      timestamp: new Date().toISOString(),
      date: new Date().toLocaleDateString("es-ES"),
      time: new Date().toLocaleTimeString("es-ES"),
      source: "birthday_invitation",
    };

    const response = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      console.log("🔗 Datos enviados al webhook");
      return true;
    } else {
      throw new Error("Error en webhook");
    }
  } catch (error) {
    console.error("❌ Error enviando al webhook:", error);
    return false;
  }
}

// Función principal para enviar a todos los servicios
async function submitRegistration(name) {
  try {
    // Guardar localmente primero (backup)
    saveRegistration(name);

    // Intentar enviar a servicios externos
    const promises = [
      // Descomenta el que quieras usar:
      // sendToGoogleSheets(name),
      // sendViaEmailJS(name),
      sendToFormspree(name), // ← Activamos Formspree por defecto (más fácil)
      // sendToWebhook(name)
    ];

    // Ejecutar todos en paralelo
    const results = await Promise.allSettled(promises);

    let successCount = results.filter(
      (result) => result.status === "fulfilled" && result.value
    ).length;

    console.log(`✅ Registro enviado a ${successCount} servicios externos`);

    return true;
  } catch (error) {
    console.error("❌ Error en submitRegistration:", error);
    return false;
  }
}

// =======================================

// Animaciones disponibles
const animations = [
  "spin",
  "bounce",
  "float",
  "shake",
  "pulse",
  "zigzag",
  "explode",
];

// Contenedor para el caos de fondo
const backgroundChaos = document.querySelector(".background-chaos");

// Función para obtener una posición aleatoria
function getRandomPosition() {
  return {
    x: Math.random() * (window.innerWidth - 100),
    y: Math.random() * (window.innerHeight - 100),
  };
}

// Función para obtener una animación aleatoria
function getRandomAnimation() {
  return animations[Math.floor(Math.random() * animations.length)];
}

// Función para crear una imagen flotante optimizada
async function createFloatingImage(imageName) {
  const startTime = performance.now();

  try {
    // Intentar cargar la imagen de manera optimizada
    const cachedImg = await loadImageOptimized(imageName);

    const container = document.createElement("div");
    container.className = "floating-image";

    const img = document.createElement("img");
    img.src = cachedImg.src;
    img.alt = "Meme épico";

    // Aplicar tamaño óptimo según dispositivo
    const optimalSize = getOptimalImageSize();
    container.style.width = optimalSize.width + "px";
    container.style.height = optimalSize.height + "px";

    // Posición aleatoria
    const position = getRandomPosition();
    container.style.left = position.x + "px";
    container.style.top = position.y + "px";

    // Animación aleatoria
    const animation = getRandomAnimation();
    container.classList.add(animation);

    // Duración de animación adaptativa (más lenta en móviles para mejor rendimiento)
    const baseDuration = isMobileDevice() ? 4 : 2;
    const duration = baseDuration + Math.random() * 3;
    container.style.animationDuration = duration + "s";

    // Delay aleatorio
    const delay = Math.random() * 2;
    container.style.animationDelay = delay + "s";

    // Intersection Observer para lazy loading/unloading
    if ("IntersectionObserver" in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.style.opacity = "0.8";
            } else {
              // Reducir opacidad cuando no está visible para ahorrar recursos
              entry.target.style.opacity = "0.3";
            }
          });
        },
        {
          threshold: 0.1,
          rootMargin: "50px",
        }
      );

      observer.observe(container);
    }

    container.appendChild(img);

    // Registrar tiempo de carga
    const loadTime = performance.now() - startTime;
    performanceMonitor.recordLoadTime(loadTime);

    return container;
  } catch (error) {
    performanceMonitor.recordError();
    console.warn(
      `⚠️ No se pudo cargar imagen ${imageName}, usando placeholder`
    );

    // Crear placeholder si la imagen falla
    return createPlaceholderImage(imageName);
  }
}

// Función para crear imagen placeholder en caso de error
function createPlaceholderImage(imageName) {
  const container = document.createElement("div");
  container.className = "floating-image placeholder";

  const placeholder = document.createElement("div");
  placeholder.style.cssText = `
    width: 100%;
    height: 100%;
    background: linear-gradient(45deg, #ff6b6b, #4ecdc4);
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    color: white;
    font-weight: bold;
    text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
  `;
  placeholder.textContent = "🎉";

  const optimalSize = getOptimalImageSize();
  container.style.width = optimalSize.width + "px";
  container.style.height = optimalSize.height + "px";

  // Posición aleatoria
  const position = getRandomPosition();
  container.style.left = position.x + "px";
  container.style.top = position.y + "px";

  // Animación aleatoria
  const animation = getRandomAnimation();
  container.classList.add(animation);

  const duration = 3 + Math.random() * 2;
  container.style.animationDuration = duration + "s";

  container.appendChild(placeholder);
  return container;
}

// Función para mover imagen a nueva posición
function moveToRandomPosition(element) {
  const position = getRandomPosition();
  element.style.transition = "all 3s ease-in-out";
  element.style.left = position.x + "px";
  element.style.top = position.y + "px";

  // Cambiar animación aleatoriamente
  setTimeout(() => {
    const currentAnimations = element.className
      .split(" ")
      .filter((cls) => !animations.includes(cls));
    element.className =
      currentAnimations.join(" ") + " " + getRandomAnimation();
  }, 1500);
}

// Función para crear el caos inicial optimizado
async function createChaos() {
  console.log("🎪 Iniciando caos optimizado...");

  // Limpiar el contenedor
  backgroundChaos.innerHTML = "";

  // Determinar cantidad de imágenes según dispositivo
  const isMobile = isMobileDevice();
  const maxImages = isMobile ? 8 : 15; // Menos imágenes en móviles
  const imagesToUse = images.slice(0, maxImages);

  // Carga progresiva: primero las imágenes más importantes
  const priorityImages = imagesToUse.slice(0, 5);
  const secondaryImages = imagesToUse.slice(5);

  // Fase 1: Cargar imágenes prioritarias inmediatamente
  console.log("📱 Cargando imágenes prioritarias...");
  for (let i = 0; i < priorityImages.length; i++) {
    const imageName = priorityImages[i];

    try {
      const floatingImage = await createFloatingImage(imageName);
      backgroundChaos.appendChild(floatingImage);

      // Configurar movimiento con throttling en móviles
      const moveInterval = isMobile ? 8000 : 5000; // Movimiento más lento en móviles
      setInterval(() => {
        if (isInViewport(floatingImage) || !isMobile) {
          moveToRandomPosition(floatingImage);
        }
      }, moveInterval + Math.random() * 3000);

      // Pequeña pausa entre cargas para no bloquear
      await new Promise((resolve) => setTimeout(resolve, 200));
    } catch (error) {
      console.warn(`⚠️ Error cargando imagen prioritaria ${imageName}:`, error);
    }
  }

  // Fase 2: Cargar imágenes secundarias gradualmente
  if (secondaryImages.length > 0) {
    console.log("🖼️ Cargando imágenes secundarias...");

    setTimeout(async () => {
      for (let i = 0; i < secondaryImages.length; i++) {
        const imageName = secondaryImages[i];

        // Verificar si no estamos sobrecargando
        const currentImages =
          document.querySelectorAll(".floating-image").length;
        if (currentImages >= OPTIMIZATION_CONFIG.maxActiveImages) {
          console.log("🛑 Límite de imágenes alcanzado, pausando carga");
          break;
        }

        try {
          const floatingImage = await createFloatingImage(imageName);
          backgroundChaos.appendChild(floatingImage);

          const moveInterval = isMobile ? 10000 : 6000;
          setInterval(() => {
            if (isInViewport(floatingImage) || !isMobile) {
              moveToRandomPosition(floatingImage);
            }
          }, moveInterval + Math.random() * 4000);

          // Pausa más larga entre imágenes secundarias
          await new Promise((resolve) => setTimeout(resolve, 500));
        } catch (error) {
          console.warn(
            `⚠️ Error cargando imagen secundaria ${imageName}:`,
            error
          );
        }
      }

      console.log("✅ Caos inicial completado");

      // Iniciar limpieza periódica
      setInterval(cleanupInvisibleImages, 30000); // Cada 30 segundos
    }, 2000); // Esperar 2 segundos antes de cargar secundarias
  }

  // Mostrar estadísticas de rendimiento
  setTimeout(() => {
    const stats = performanceMonitor.getStats();
    console.log("📊 Estadísticas de rendimiento:", stats);
  }, 5000);
}

// Función para hacer que las imágenes aparezcan y desaparezcan
function createAppearDisappearEffect() {
  setInterval(() => {
    const allImages = document.querySelectorAll(".floating-image");

    // Hacer desaparecer algunas imágenes aleatoriamente
    allImages.forEach((img) => {
      if (Math.random() < 0.1) {
        // 10% de probabilidad
        img.style.opacity = "0";
        img.style.transform = "scale(0) rotate(720deg)";

        // Hacerlas reaparecer después de un tiempo
        setTimeout(() => {
          img.style.opacity = "0.8";
          img.style.transform = "scale(1) rotate(0deg)";
          moveToRandomPosition(img);
        }, 2000 + Math.random() * 3000);
      }
    });
  }, 3000);
}

// Función optimizada para explosiones aleatorias
function createRandomExplosions() {
  const isMobile = isMobileDevice();
  const explosionInterval = isMobile ? 15000 : 8000; // Menos frecuentes en móviles

  setInterval(async () => {
    // Verificar si no tenemos demasiadas imágenes
    const currentImages = document.querySelectorAll(".floating-image").length;
    if (currentImages >= OPTIMIZATION_CONFIG.maxActiveImages) {
      return; // Skip si ya hay muchas imágenes
    }

    try {
      // Crear una imagen temporal que explote
      const randomImage = images[Math.floor(Math.random() * images.length)];
      const explosion = await createFloatingImage(randomImage);

      explosion.style.animation = "explode 1s ease-out";
      explosion.style.transform = "scale(2)";
      explosion.style.opacity = "1";

      backgroundChaos.appendChild(explosion);

      // Eliminar después de la explosión
      setTimeout(() => {
        if (explosion.parentNode) {
          explosion.remove();
        }
      }, 1000);
    } catch (error) {
      console.warn("⚠️ Error en explosión aleatoria:", error);
    }
  }, explosionInterval + Math.random() * 5000);
}

// Función optimizada para efectos de aparición/desaparición
function createAppearDisappearEffect() {
  const isMobile = isMobileDevice();
  const effectInterval = isMobile ? 5000 : 3000; // Menos frecuente en móviles

  setInterval(() => {
    const allImages = document.querySelectorAll(
      ".floating-image:not(.placeholder)"
    );

    // Hacer desaparecer algunas imágenes aleatoriamente
    allImages.forEach((img) => {
      // Probabilidad más baja en móviles para mejor rendimiento
      const probability = isMobile ? 0.05 : 0.1;

      if (Math.random() < probability) {
        img.style.opacity = "0";
        img.style.transform = "scale(0) rotate(720deg)";

        // Hacerlas reaparecer después de un tiempo
        setTimeout(() => {
          if (img.parentNode) {
            img.style.opacity = "0.8";
            img.style.transform = "scale(1) rotate(0deg)";

            // Solo mover si está en viewport o no es móvil
            if (isInViewport(img) || !isMobile) {
              moveToRandomPosition(img);
            }
          }
        }, 2000 + Math.random() * 3000);
      }
    });
  }, effectInterval);
}

// Manejo del formulario
const form = document.getElementById("rsvpForm");

form.addEventListener("submit", async function (e) {
  e.preventDefault();

  const name = document.getElementById("name").value.trim();

  // Validación básica
  if (!name) {
    alert("❌ Por favor escribe tu nombre");
    return;
  }

  // Efecto especial al enviar
  const submitBtn = document.querySelector(".submit-btn");
  submitBtn.innerHTML = "🎆 ¡ENVIANDO! 🎆";
  submitBtn.style.animation = "buttonExplode 0.3s infinite";
  submitBtn.disabled = true;

  // Crear explosión de imágenes
  for (let i = 0; i < 10; i++) {
    setTimeout(() => {
      const randomImage = images[Math.floor(Math.random() * images.length)];
      const explosion = createFloatingImage(randomImage);
      explosion.style.animation = "explode 2s ease-out";
      explosion.style.left = window.innerWidth / 2 - 50 + "px";
      explosion.style.top = window.innerHeight / 2 - 50 + "px";
      backgroundChaos.appendChild(explosion);

      setTimeout(() => explosion.remove(), 2000);
    }, i * 100);
  }

  try {
    // Enviar el registro a los servicios
    const success = await submitRegistration(name);

    setTimeout(() => {
      if (success) {
        alert(
          `🎉 ¡Gracias ${name}! Tu confirmación ha sido registrada exitosamente. ¡Nos vemos en la fiesta! 🎂`
        );

        submitBtn.innerHTML = "✅ ¡REGISTRADO! ✅";
        submitBtn.style.animation = "pulse 1s infinite";

        // Limpiar formulario
        document.getElementById("name").value = "";
      } else {
        alert(
          `⚠️ ${name}, tu confirmación se guardó localmente, pero hubo un problema enviándola. ¡No te preocupes, está registrada!`
        );

        submitBtn.innerHTML = "⚠️ ¡GUARDADO LOCALMENTE!";
        submitBtn.style.animation = "pulse 1s infinite";
      }

      // Resetear el botón después de un tiempo
      setTimeout(() => {
        submitBtn.innerHTML = "🚀 ¡CONFIRMAR ASISTENCIA! 🚀";
        submitBtn.style.animation = "buttonPulse 2s infinite";
        submitBtn.disabled = false;
      }, 4000);
    }, 2000);
  } catch (error) {
    console.error("❌ Error general:", error);

    setTimeout(() => {
      alert(
        `❌ Hubo un error, pero tu confirmación se guardó localmente. ¡Gracias ${name}!`
      );

      submitBtn.innerHTML = "⚠️ ¡ERROR PERO GUARDADO!";
      submitBtn.style.animation = "shake 0.5s infinite";

      setTimeout(() => {
        submitBtn.innerHTML = "🚀 ¡CONFIRMAR ASISTENCIA! 🚀";
        submitBtn.style.animation = "buttonPulse 2s infinite";
        submitBtn.disabled = false;
      }, 4000);
    }, 2000);
  }
});

// Efectos adicionales en inputs
const inputs = document.querySelectorAll("input, select, textarea");
inputs.forEach((input) => {
  input.addEventListener("focus", () => {
    // Crear pequeña explosión en el input
    const rect = input.getBoundingClientRect();
    const miniExplosion = createFloatingImage(
      images[Math.floor(Math.random() * images.length)]
    );

    miniExplosion.style.left = rect.left + rect.width / 2 + "px";
    miniExplosion.style.top = rect.top - 30 + "px";
    miniExplosion.style.transform = "scale(0.5)";
    miniExplosion.style.animation = "pulse 1s ease-out";

    backgroundChaos.appendChild(miniExplosion);

    setTimeout(() => miniExplosion.remove(), 1000);
  });
});

// Función para manejar redimensionamiento de ventana
function handleResize() {
  const allImages = document.querySelectorAll(".floating-image");
  allImages.forEach((img) => {
    moveToRandomPosition(img);
  });
}

window.addEventListener("resize", handleResize);

// Función para añadir más caos con el scroll
window.addEventListener("scroll", () => {
  const scrollPercent =
    window.scrollY / (document.body.scrollHeight - window.innerHeight);

  // Cambiar velocidad de animaciones basado en scroll
  const allImages = document.querySelectorAll(".floating-image");
  allImages.forEach((img) => {
    const currentDuration = parseFloat(img.style.animationDuration) || 3;
    img.style.animationDuration = currentDuration * (1 + scrollPercent) + "s";
  });
});

// Inicializar el caos cuando la página cargue - VERSIÓN OPTIMIZADA
document.addEventListener("DOMContentLoaded", async () => {
  console.log("🎉 ¡Iniciando el caos más épico OPTIMIZADO! 🎉");

  // Detectar capacidades del dispositivo
  const isMobile = isMobileDevice();
  const connectionSpeed = navigator.connection
    ? navigator.connection.effectiveType
    : "unknown";

  console.log(`📱 Dispositivo: ${isMobile ? "Móvil" : "Desktop"}`);
  console.log(`🌐 Conexión: ${connectionSpeed}`);

  // Ajustar configuración según capacidades
  if (isMobile || connectionSpeed === "slow-2g" || connectionSpeed === "2g") {
    OPTIMIZATION_CONFIG.maxActiveImages = 8;
    OPTIMIZATION_CONFIG.preloadCount = 4;
    console.log("⚡ Modo de bajo rendimiento activado");
  }

  // Precargar imágenes críticas
  try {
    await preloadImages();
  } catch (error) {
    console.warn("⚠️ Error en precarga, continuando de todas formas:", error);
  }

  // Crear el caos inicial
  await createChaos();

  // Iniciar efectos adicionales con delay escalonado
  setTimeout(() => {
    createAppearDisappearEffect();
    console.log("✨ Efectos de aparición/desaparición activados");
  }, 3000);

  setTimeout(() => {
    createRandomExplosions();
    console.log("💥 Explosiones aleatorias activadas");
  }, 5000);

  // Efectos especiales en el título
  const title = document.querySelector(".title");
  title.addEventListener("click", async () => {
    title.style.animation = "none";
    setTimeout(() => {
      title.style.animation = "titleBounce 0.5s infinite";
    }, 100);

    // Crear explosión masiva optimizada
    const explosionCount = isMobile ? 8 : 15; // Menos explosiones en móviles

    for (let i = 0; i < explosionCount; i++) {
      setTimeout(async () => {
        try {
          const randomImage = images[Math.floor(Math.random() * images.length)];
          const explosion = await createFloatingImage(randomImage);
          explosion.style.animation = "explode 2s ease-out";
          backgroundChaos.appendChild(explosion);

          setTimeout(() => {
            if (explosion.parentNode) {
              explosion.remove();
            }
          }, 2000);
        } catch (error) {
          console.warn("⚠️ Error en explosión del título:", error);
        }
      }, i * 50);
    }
  });

  // Monitor de rendimiento
  setInterval(() => {
    const imageCount = document.querySelectorAll(".floating-image").length;
    const memoryInfo = performance.memory
      ? {
          used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
          total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024),
        }
      : null;

    console.log(
      `📊 Rendimiento: ${imageCount} imágenes activas`,
      memoryInfo ? `| Memoria: ${memoryInfo.used}MB/${memoryInfo.total}MB` : ""
    );

    // Auto-cleanup si hay demasiadas imágenes
    if (imageCount > OPTIMIZATION_CONFIG.maxActiveImages * 1.5) {
      console.log("🧹 Limpieza automática activada");
      cleanupInvisibleImages();
    }
  }, 15000); // Cada 15 segundos

  // Listener para cambios de visibilidad de página
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      // Pausar animaciones cuando la página no es visible
      document.querySelectorAll(".floating-image").forEach((img) => {
        img.style.animationPlayState = "paused";
      });
      console.log("⏸️ Animaciones pausadas (página oculta)");
    } else {
      // Reanudar animaciones cuando la página vuelve a ser visible
      document.querySelectorAll(".floating-image").forEach((img) => {
        img.style.animationPlayState = "running";
      });
      console.log("▶️ Animaciones reanudadas");
    }
  });
});

// ¡Modo súper loco activado!
console.log("🚀 ¡MODO SÚPER LOCO ACTIVADO! 🚀");
console.log("🎂 ¡Prepárate para la fiesta más épica! 🎂");
