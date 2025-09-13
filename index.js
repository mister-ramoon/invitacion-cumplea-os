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
  maxActiveImages: 30, // Máximo 30 imágenes activas en pantalla
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
    return { width: 180, height: 180 }; // Móvil pequeño
  } else if (isMobile && screenWidth <= 768) {
    return { width: 200, height: 200 }; // Móvil/tablet
  } else {
    return { width: 300, height: 300 }; // Desktop
  }
}

// Función para mezclar array (Fisher-Yates shuffle)
function shuffleArray(array) {
  const shuffled = [...array]; // Crear copia para no modificar el original
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Función para precargar imágenes de manera optimizada y aleatoria
async function preloadImages() {

  const { preloadCount } = OPTIMIZATION_CONFIG;
  
  // Mezclar las imágenes de manera aleatoria
  const shuffledImages = shuffleArray(images);
  const imagesToPreload = shuffledImages.slice(0, preloadCount);
  
  console.log(`🎲 Orden aleatorio de precarga: ${imagesToPreload.slice(0, 5).join(', ')}...`);

  // Precargar en lotes pequeños para no saturar la red
  for (let i = 0; i < imagesToPreload.length; i += 2) {
    const batch = imagesToPreload.slice(i, i + 2);
    const promises = batch.map((imageName) => loadImageOptimized(imageName));

    try {
      await Promise.allSettled(promises);
      console.log(`✅ Lote aleatorio ${Math.floor(i / 2) + 1} precargado: ${batch.join(', ')}`);
    } catch (error) {
      console.warn(`⚠️ Error en lote ${Math.floor(i / 2) + 1}:`, error);
    }

    // Pequeña pausa entre lotes para no bloquear el hilo principal
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  console.log("🎉 Precarga aleatoria completada");
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

// Formspree (Más simple)
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

// 🎨 SISTEMA DE BACKGROUND DINÁMICO CON COLLAGE MEJORADO
// ====================================================

// Pool de imágenes para el background (sin repetición)
let backgroundImagePool = [];
let currentBackgroundIndex = 0;
let preloadedBackgroundImages = new Map(); // Cache para imágenes de background
let isBackgroundChanging = false; // Flag para evitar cambios superpuestos

// Función para precargar imagen de background
async function preloadBackgroundImage(imageName) {
  return new Promise((resolve, reject) => {
    // Si ya está en cache, devolver inmediatamente
    if (preloadedBackgroundImages.has(imageName)) {
      resolve(preloadedBackgroundImages.get(imageName));
      return;
    }

    const img = new Image();
    
    img.onload = () => {
      const imageUrl = `url('photos/${imageName}')`;
      preloadedBackgroundImages.set(imageName, imageUrl);
      console.log(`📸 Background precargado: ${imageName}`);
      resolve(imageUrl);
    };

    img.onerror = () => {
      console.warn(`❌ Error precargando background: ${imageName}`);
      reject(new Error(`Failed to preload background ${imageName}`));
    };

    img.src = `photos/${imageName}`;
  });
}

// Función para obtener la siguiente imagen de background
function getNextBackgroundImage() {
  // Si el pool está vacío, rellenarlo con una mezcla aleatoria
  if (backgroundImagePool.length === 0) {
    backgroundImagePool = shuffleArray(images);
    currentBackgroundIndex = 0;
    console.log("🎲 Pool de background rellenado con orden aleatorio");
  }
  
  // Tomar la siguiente imagen del pool
  const image = backgroundImagePool[currentBackgroundIndex];
  currentBackgroundIndex = (currentBackgroundIndex + 1) % backgroundImagePool.length;
  
  return image;
}

// Función para cambiar el background dinámicamente (mejorada)
async function changeBackgroundImage() {
  // Evitar cambios superpuestos
  if (isBackgroundChanging) {
    console.log("⏳ Cambio de background ya en progreso, saltando...");
    return;
  }

  isBackgroundChanging = true;

  try {
    const nextImageName = getNextBackgroundImage();
    
    // Precargar la imagen antes de cambiarla
    console.log(`🔄 Precargando siguiente background: ${nextImageName}`);
    const imageUrl = await preloadBackgroundImage(nextImageName);
    
    // Aplicar la imagen solo cuando esté completamente cargada
    console.log(`🖼️ Cambiando background a: ${nextImageName}`);
    document.documentElement.style.setProperty('--dynamic-bg-image', imageUrl);
    
    // Precargar las próximas 2-3 imágenes de manera proactiva
    preloadNextBackgroundImages();
    
  } catch (error) {
    console.warn(`⚠️ Error cambiando background, intentando con la siguiente imagen:`, error);
    // Intentar con la siguiente imagen si falla
    setTimeout(() => {
      isBackgroundChanging = false;
      changeBackgroundImage();
    }, 1000);
    return;
  }

  isBackgroundChanging = false;
}

// Función para precargar proactivamente las siguientes imágenes
async function preloadNextBackgroundImages() {
  const preloadCount = 3; // Precargar las próximas 3 imágenes
  
  for (let i = 1; i <= preloadCount; i++) {
    const futureIndex = (currentBackgroundIndex + i - 1) % backgroundImagePool.length;
    const futureImageName = backgroundImagePool[futureIndex];
    
    if (futureImageName && !preloadedBackgroundImages.has(futureImageName)) {
      try {
        await preloadBackgroundImage(futureImageName);
      } catch (error) {
        console.warn(`⚠️ Error precargando imagen futura: ${futureImageName}`);
      }
    }
  }
}

// Función para inicializar el sistema de background dinámico (mejorada)
async function initializeDynamicBackground() {
  console.log("🎨 Inicializando sistema de background dinámico mejorado...");
  
  try {
    // Establecer la primera imagen inmediatamente (con precarga)
    await changeBackgroundImage();
    
    // Cambiar imagen cada 5 segundos
    setInterval(async () => {
      await changeBackgroundImage();
    }, 5000);
    
    console.log("✅ Sistema de background dinámico activado - cambio cada 5 segundos");
  } catch (error) {
    console.error("❌ Error inicializando background dinámico:", error);
    // Fallback: usar la primera imagen sin precarga
    const fallbackImage = images[0];
    const fallbackUrl = `url('photos/${fallbackImage}')`;
    document.documentElement.style.setProperty('--dynamic-bg-image', fallbackUrl);
    console.log("🆘 Usando imagen fallback para background");
  }
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

  // Crear explosión de imágenes aleatorias sin repetición
  const formExplosionPool = shuffleArray(images).slice(0, 10);
  
  for (let i = 0; i < 10; i++) {
    setTimeout(async () => {
      const randomImage = formExplosionPool[i]; // Sin repetición garantizada
      const explosion = await createFloatingImage(randomImage);
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
        submitBtn.innerHTML = " ¡CONFIRMAR ASISTENCIA!";
        submitBtn.style.animation = "buttonPulse 2s infinite";
        submitBtn.disabled = false;
      }, 4000);
    }, 2000);
  } catch (error) {

    setTimeout(() => {
      alert(
        `❌ Hubo un error, pero tu confirmación se guardó localmente. ¡Gracias ${name}!`
      );

      submitBtn.innerHTML = "⚠️ ¡ERROR PERO GUARDADO!";
      submitBtn.style.animation = "shake 0.5s infinite";

      setTimeout(() => {
        submitBtn.innerHTML = " ¡CONFIRMAR ASISTENCIA! ";
        submitBtn.style.animation = "buttonPulse 2s infinite";
        submitBtn.disabled = false;
      }, 4000);
    }, 2000);
  }
});

// Efectos adicionales en inputs
const inputs = document.querySelectorAll("input, select, textarea");
inputs.forEach((input) => {
  input.addEventListener("focus", async () => {
    // Crear pequeña explosión en el input con imagen aleatoria
    const rect = input.getBoundingClientRect();
    const randomImage = getNextRandomImage(); // Sin repetición
    const miniExplosion = await createFloatingImage(randomImage);

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
  console.log("🎉 ¡Iniciando sistema mejorado! 🎉");

  // Detectar capacidades del dispositivo
  const isMobile = isMobileDevice();
  const connectionSpeed = navigator.connection
    ? navigator.connection.effectiveType
    : "unknown";

  console.log(`📱 Dispositivo: ${isMobile ? "Móvil" : "Desktop"}`);
  console.log(`🌐 Conexión: ${connectionSpeed}`);

  // Inicializar sistema de background dinámico PRIMERO (con await)
  await initializeDynamicBackground();

  // Ajustar configuración según capacidades
  if (isMobile || connectionSpeed === "slow-2g" || connectionSpeed === "2g") {
    OPTIMIZATION_CONFIG.maxActiveImages = 8;
    OPTIMIZATION_CONFIG.preloadCount = 4;
    console.log("⚡ Modo de bajo rendimiento activado");
  }


  // Efectos especiales en el título
  const title = document.querySelector(".title");
  title.addEventListener("click", async () => {
    title.style.animation = "none";
    setTimeout(() => {
      title.style.animation = "titleBounce 0.5s infinite";
    }, 100);

    // Crear explosión masiva optimizada con imágenes aleatorias sin repetición
    const explosionCount = isMobile ? 8 : 15; // Menos explosiones en móviles
    
    // Crear un pool específico para esta explosión masiva
    const titleExplosionPool = shuffleArray(images).slice(0, explosionCount);

    for (let i = 0; i < explosionCount; i++) {
      setTimeout(async () => {
        try {
          const randomImage = titleExplosionPool[i]; // Sin repetición garantizada
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
});
