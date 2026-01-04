let works = [];

// Load images from gallery.json
fetch('images/gallery.json')
  .then(response => response.json())
  .then(data => {
    let id = 1;
    const categories = new Set(["All"]);
    
    data.categories.forEach(category => {
      categories.add(category.name);
      category.works.forEach(work => {
        if (work.file.endsWith('.JPG') || work.file.endsWith('.jpg')) {
          works.push({
            id: id++,
            title: work.file.replace(/\.(JPG|jpg)$/, ''),
            category: category.name,
            tags: [],
            src: `images/${work.file}`,
            alt: work.file.replace(/\.(JPG|jpg)$/, '')
          });
        }
      });
    });
    
    // Remove similar images (by filename pattern similarity)
    works = removeSimilarImages(works);
    
    // Shuffle images randomly
    works = shuffleArray(works);
    
    renderWorks();
  })
  .catch(error => {
    console.error('Error loading gallery:', error);
    // Fallback to default works
    works = [
      { id: 1, title: "Night Crossing", category: "Stills", tags: [], src: "images/_DSF0023.JPG", alt: "Night scene on a crosswalk" },
      { id: 2, title: "Quiet Room", category: "Stills", tags: [], src: "images/_DSF0041.JPG", alt: "Portrait in a quiet room" },
      { id: 3, title: "Harbor Mist", category: "Stills", tags: [], src: "images/_DSF0287.JPG", alt: "Harbor in mist" },
      { id: 4, title: "City Pulse", category: "Stills", tags: [], src: "images/_DSF0434.JPG", alt: "City street with lights" },
      { id: 5, title: "Golden Hour", category: "Stills", tags: [], src: "images/_DSF0699.JPG", alt: "Portrait in golden hour" },
      { id: 6, title: "Desert Line", category: "Stills", tags: [], src: "images/_DSF0723.JPG", alt: "Desert landscape with road" },
      { id: 7, title: "Lens Flare", category: "Stills", tags: [], src: "images/_DSF0585.JPG", alt: "Light flare abstract" },
      { id: 8, title: "Metro Wait", category: "Stills", tags: [], src: "images/_DSF0521.JPG", alt: "Person waiting in metro" },
      { id: 9, title: "Coastal Air", category: "Stills", tags: [], src: "images/_DSF0631.JPG", alt: "Coastal cliffs" },
    ];
    renderWorks();
  });

const grid = document.getElementById("grid");
const modal = document.getElementById("modal");
const modalImg = document.getElementById("modal-img");
const modalTitle = document.getElementById("modal-title");
const modalCategory = document.getElementById("modal-category");
const modalTags = document.getElementById("modal-tags");
const modalClose = document.getElementById("modal-close");
const modalPrev = document.getElementById("modal-prev");
const modalNext = document.getElementById("modal-next");
const modalExif = document.getElementById("modal-exif");
const imageCounter = document.getElementById("image-counter");

let currentIndex = -1;

// Remove similar images based on filename patterns
const removeSimilarImages = (images) => {
  const seen = new Set();
  const filtered = [];
  
  images.forEach(img => {
    // Extract base pattern (e.g., "_DSF0023" from "_DSF0023.JPG")
    const baseName = img.src.match(/([^\/]+)\.(jpg|JPG)$/i)?.[1] || '';
    
    // Check for sequential numbers (likely similar shots)
    const numberMatch = baseName.match(/(\d+)$/);
    if (numberMatch) {
      const number = parseInt(numberMatch[1]);
      const base = baseName.replace(/\d+$/, '');
      
      // Check if we've seen a similar image (within 5 numbers)
      let isSimilar = false;
      for (let i = number - 5; i <= number + 5; i++) {
        const similarKey = `${base}${i}`;
        if (seen.has(similarKey)) {
          isSimilar = true;
          break;
        }
      }
      
      if (!isSimilar) {
        seen.add(`${base}${number}`);
        filtered.push(img);
      }
    } else {
      // If no number pattern, just check exact match
      if (!seen.has(baseName)) {
        seen.add(baseName);
        filtered.push(img);
      }
    }
  });
  
  return filtered;
};

// Fisher-Yates shuffle for random order
const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};


const renderWorks = () => {
  if (works.length === 0) return;
  
  grid.innerHTML = "";
  
  // Show all works
  let filtered = works;
  
  filtered.forEach((work, index) => {
    const card = document.createElement("article");
    card.className = "card";
    card.tabIndex = 0;
    card.setAttribute("role", "button");
    card.setAttribute("aria-label", work.alt || work.title);
    card.style.animationDelay = `${index * 0.05}s`;

    const frame = document.createElement("div");
    frame.className = "frame";

    const img = document.createElement("img");
    img.alt = work.alt || work.title;
    img.loading = "lazy";
    img.decoding = "async";
    img.fetchPriority = index < 12 ? "high" : "low";
    
    // Use data-src for lazy loading
    img.setAttribute("data-src", work.src);
    
    img.onload = () => {
      img.classList.add("loaded");
      // 이미지 비율에 따라 자연스럽게 조정 (항상 1칸만 차지)
      const aspectRatio = img.naturalWidth / img.naturalHeight;
      frame.style.aspectRatio = `${aspectRatio} / 1`;
    };
    
    img.onerror = () => {
      img.alt = "Image failed to load";
      frame.style.background = "var(--mat)";
    };
    
    frame.appendChild(img);
    
    // Intersection Observer for lazy loading
    if ("IntersectionObserver" in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.getAttribute("data-src");
            observer.unobserve(img);
          }
        });
      }, {
        rootMargin: "50px"
      });
      observer.observe(img);
    } else {
      // Fallback for browsers without IntersectionObserver
      img.src = work.src;
    }

    card.appendChild(frame);
    
    card.addEventListener("click", () => openModal(work, filtered));
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openModal(work, filtered);
      }
    });
    grid.appendChild(card);
  });
};

// Focus trap for modal
let focusableElements;
let firstFocusableElement;
let lastFocusableElement;

const trapFocus = (e) => {
  if (e.key !== "Tab") return;
  
  if (e.shiftKey) {
    if (document.activeElement === firstFocusableElement) {
      e.preventDefault();
      lastFocusableElement.focus();
    }
  } else {
    if (document.activeElement === lastFocusableElement) {
      e.preventDefault();
      firstFocusableElement.focus();
    }
  }
};

// Extract EXIF data from image
const extractEXIF = (img, callback) => {
  // Reset EXIF data for the image
  if (img.exifdata) {
    delete img.exifdata;
  }
  
  try {
    EXIF.getData(img, function() {
      const exifData = {
        make: EXIF.getTag(this, "Make"),
        model: EXIF.getTag(this, "Model"),
        iso: EXIF.getTag(this, "ISO"),
        fNumber: EXIF.getTag(this, "FNumber"),
        exposureTime: EXIF.getTag(this, "ExposureTime"),
        focalLength: EXIF.getTag(this, "FocalLength"),
        dateTime: EXIF.getTag(this, "DateTimeOriginal") || EXIF.getTag(this, "DateTime"),
        lensModel: EXIF.getTag(this, "LensModel"),
        lensMake: EXIF.getTag(this, "LensMake")
      };
      callback(exifData);
    });
  } catch (error) {
    console.log("EXIF extraction error:", error);
    callback({});
  }
};

// Format EXIF data for display
const formatEXIF = (exifData) => {
  const parts = [];
  
  // Camera info
  if (exifData.make && exifData.model) {
    const make = exifData.make.trim();
    const model = exifData.model.trim();
    parts.push(`${make} ${model}`);
  } else if (exifData.make) {
    parts.push(exifData.make.trim());
  } else if (exifData.model) {
    parts.push(exifData.model.trim());
  }
  
  // Lens info
  if (exifData.lensModel) {
    parts.push(exifData.lensModel.trim());
  } else if (exifData.lensMake) {
    parts.push(exifData.lensMake.trim());
  }
  
  // Camera settings
  const settings = [];
  if (exifData.fNumber) {
    const fNum = typeof exifData.fNumber === 'number' ? exifData.fNumber : exifData.fNumber.numerator / exifData.fNumber.denominator;
    settings.push(`f/${fNum.toFixed(1)}`);
  }
  if (exifData.exposureTime) {
    const expTime = typeof exifData.exposureTime === 'number' 
      ? exifData.exposureTime 
      : exifData.exposureTime.numerator / exifData.exposureTime.denominator;
    if (expTime < 1) {
      settings.push(`1/${Math.round(1 / expTime)}s`);
    } else {
      settings.push(`${expTime.toFixed(1)}s`);
    }
  }
  if (exifData.iso) {
    settings.push(`ISO ${exifData.iso}`);
  }
  if (exifData.focalLength) {
    const focal = typeof exifData.focalLength === 'number'
      ? exifData.focalLength
      : exifData.focalLength.numerator / exifData.focalLength.denominator;
    settings.push(`${Math.round(focal)}mm`);
  }
  
  if (settings.length > 0) {
    parts.push(settings.join(" • "));
  }
  
  return parts;
};

const openModal = (work, list) => {
  modalImg.classList.remove("fade-in");
  modalImg.classList.add("fade-out");
  modalExif.innerHTML = "";
  imageCounter.textContent = "";
  
  setTimeout(() => {
    modalImg.src = work.src;
    modalImg.alt = work.alt || work.title;
    modalTitle.textContent = "";
    modalCategory.textContent = "";
    modalTags.textContent = "";
    modal.setAttribute("data-list", JSON.stringify(list.map(w => w.id)));
    currentIndex = list.findIndex(w => w.id === work.id);
    
    // Update navigation buttons visibility
    updateNavButtons(list.length);
    
    // Update ARIA labels for navigation
    if (list.length > 1) {
      modalPrev.setAttribute("aria-label", `Previous image (${currentIndex + 1} of ${list.length})`);
      modalNext.setAttribute("aria-label", `Next image (${currentIndex + 1} of ${list.length})`);
      imageCounter.textContent = `${currentIndex + 1} / ${list.length}`;
    } else {
      imageCounter.textContent = "";
    }
    
    const loadExif = () => {
      const imgForExif = new Image();
      imgForExif.crossOrigin = "anonymous";
      imgForExif.onload = () => {
        extractEXIF(imgForExif, (exifData) => {
          const exifParts = formatEXIF(exifData);
          if (exifParts.length > 0) {
            modalExif.innerHTML = exifParts.map(part => `<div class="exif-line">${part}</div>`).join("");
          } else {
            modalExif.innerHTML = "";
          }
        });
      };
      imgForExif.onerror = () => {
        // If CORS fails, try without crossOrigin
        const imgForExif2 = new Image();
        imgForExif2.onload = () => {
          extractEXIF(imgForExif2, (exifData) => {
            const exifParts = formatEXIF(exifData);
            if (exifParts.length > 0) {
              modalExif.innerHTML = exifParts.map(part => `<div class="exif-line">${part}</div>`).join("");
            } else {
              modalExif.innerHTML = "";
            }
          });
        };
        imgForExif2.src = work.src + (work.src.includes('?') ? '&' : '?') + 't=' + Date.now();
      };
      imgForExif.src = work.src + (work.src.includes('?') ? '&' : '?') + 't=' + Date.now();
    };
    
    modalImg.onload = () => {
      modalImg.classList.remove("fade-out");
      modalImg.classList.add("fade-in");
      loadExif();
    };
    
    if (modalImg.complete) {
      modalImg.classList.remove("fade-out");
      modalImg.classList.add("fade-in");
      loadExif();
    }
  }, 150);
  
  modal.classList.add("active");
  modal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
  
  // Set up focus trap
  focusableElements = modal.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  firstFocusableElement = focusableElements[0];
  lastFocusableElement = focusableElements[focusableElements.length - 1];
  modal.addEventListener("keydown", trapFocus);
  
  // Focus management for accessibility
  setTimeout(() => {
    modalClose.focus();
  }, 100);
};

const closeModal = () => {
  modal.classList.remove("active");
  modal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
  modal.removeEventListener("keydown", trapFocus);
  
  // Return focus to the card that opened the modal
  const activeCard = document.querySelector(".card:focus");
  if (activeCard) {
    setTimeout(() => activeCard.focus(), 100);
  }
  
  setTimeout(() => {
    modalImg.src = "";
    modalImg.classList.remove("fade-in", "fade-out");
    currentIndex = -1;
  }, 300);
};

const updateNavButtons = (total) => {
  if (total <= 1) {
    modalPrev.style.display = "none";
    modalNext.style.display = "none";
  } else {
    modalPrev.style.display = "flex";
    modalNext.style.display = "flex";
  }
};

const navigateModal = (dir) => {
  if (currentIndex < 0) return;
  const ids = JSON.parse(modal.getAttribute("data-list"));
  const list = ids.map(id => works.find(w => w.id === id)).filter(Boolean);
  if (list.length <= 1) return;
  currentIndex = (currentIndex + dir + list.length) % list.length;
  
  // Update image without full modal refresh
  modalImg.classList.remove("fade-in");
  modalImg.classList.add("fade-out");
  modalExif.innerHTML = "";
  imageCounter.textContent = "";
  
  const currentWork = list[currentIndex];
  
  setTimeout(() => {
    modalImg.src = currentWork.src;
    modalImg.alt = currentWork.alt || currentWork.title;
    
    // Update navigation buttons
    modalPrev.setAttribute("aria-label", `Previous image (${currentIndex + 1} of ${list.length})`);
    modalNext.setAttribute("aria-label", `Next image (${currentIndex + 1} of ${list.length})`);
    imageCounter.textContent = `${currentIndex + 1} / ${list.length}`;
    
    const loadExif = () => {
      const imgForExif = new Image();
      imgForExif.crossOrigin = "anonymous";
      imgForExif.onload = () => {
        extractEXIF(imgForExif, (exifData) => {
          const exifParts = formatEXIF(exifData);
          if (exifParts.length > 0) {
            modalExif.innerHTML = exifParts.map(part => `<div class="exif-line">${part}</div>`).join("");
          } else {
            modalExif.innerHTML = "";
          }
        });
      };
      imgForExif.onerror = () => {
        const imgForExif2 = new Image();
        imgForExif2.onload = () => {
          extractEXIF(imgForExif2, (exifData) => {
            const exifParts = formatEXIF(exifData);
            if (exifParts.length > 0) {
              modalExif.innerHTML = exifParts.map(part => `<div class="exif-line">${part}</div>`).join("");
            } else {
              modalExif.innerHTML = "";
            }
          });
        };
        imgForExif2.src = currentWork.src + (currentWork.src.includes('?') ? '&' : '?') + 't=' + Date.now();
      };
      imgForExif.src = currentWork.src + (currentWork.src.includes('?') ? '&' : '?') + 't=' + Date.now();
    };
    
    modalImg.onload = () => {
      modalImg.classList.remove("fade-out");
      modalImg.classList.add("fade-in");
      loadExif();
    };
    
    if (modalImg.complete) {
      modalImg.classList.remove("fade-out");
      modalImg.classList.add("fade-in");
      loadExif();
    }
  }, 150);
};


// Image zoom on double click
modalImg.addEventListener("dblclick", (e) => {
  e.preventDefault();
  modalImg.classList.toggle("zoomed");
  if (modalImg.classList.contains("zoomed")) {
    modalImg.style.transformOrigin = `${e.offsetX / modalImg.offsetWidth * 100}% ${e.offsetY / modalImg.offsetHeight * 100}%`;
  }
});

modalClose.addEventListener("click", closeModal);
modalPrev.addEventListener("click", () => navigateModal(-1));
modalNext.addEventListener("click", () => navigateModal(1));
modal.addEventListener("click", (e) => {
  if (e.target === modal) closeModal();
});

// Keyboard navigation
document.addEventListener("keydown", (e) => {
  // Modal navigation
  if (modal.classList.contains("active")) {
    if (e.key === "Escape") {
      e.preventDefault();
      closeModal();
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      navigateModal(1);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      navigateModal(-1);
    }
    return;
  }
  
  // Shuffle on 'S' key
  if ((e.key === "s" || e.key === "S") && e.target.tagName !== "INPUT" && e.target.tagName !== "TEXTAREA") {
    e.preventDefault();
    works = shuffleArray(works);
    grid.style.opacity = "0";
    setTimeout(() => {
      renderWorks();
      requestAnimationFrame(() => {
        grid.style.opacity = "1";
      });
    }, 300);
  }
});
