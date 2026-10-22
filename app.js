/**
 * PLANO INTERACTIVO - INDEPENDENCIA & TERUEL (MIRAFLORES)
 * Inspirado en el diseño minimalista de arquitectura y lujo de Illusione
 */

(function () {
  'use strict';

  // Configuración del proyecto
  const project = MAP_DATA.project;
  const projectCoords = [project.lat, project.lon];

  // Capas de mapas base 100% libres (sin API Key, sin 403, con zoom profundo hasta nivel 19)
  const mapViewport = document.getElementById('map-viewport');
  mapViewport.classList.add('map-theme-minimalist');

  const streetLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', {
    minZoom: 13,
    maxZoom: 19,
    maxNativeZoom: 19,
    attribution: '&copy; Esri, HERE, Garmin, OpenStreetMap'
  });

  const satelliteLayer = L.layerGroup([
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      minZoom: 13,
      maxZoom: 19,
      maxNativeZoom: 19,
      attribution: '&copy; Esri, DigitalGlobe, GeoEye'
    }),
    L.tileLayer('https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}', {
      minZoom: 13,
      maxZoom: 19,
      maxNativeZoom: 19,
      attribution: ''
    })
  ]);

  // Inicializar mapa
  const map = L.map('map-viewport', {
    center: projectCoords,
    zoom: 16,
    minZoom: 14,
    maxZoom: 19,
    zoomControl: false,
    layers: [streetLayer]
  });

  // Iconos por categoría
  const categoryIcons = {
    parques: '🌳',
    colegios: '🎓',
    salud: '🏥',
    supermercados: '🛒',
    restaurantes: '🍽️',
    cultura: '🏛️'
  };

  const categoryLabels = {
    parques: 'Parque / Área Verde',
    colegios: 'Colegio / Educación',
    salud: 'Salud & Bienestar',
    supermercados: 'Supermercado & Tienda',
    restaurantes: 'Gastronomía & Café',
    cultura: 'Cultura & Patrimonio'
  };

  // Grupos de capas
  let markersLayerGroup = L.layerGroup().addTo(map);
  let polygonsLayerGroup = L.layerGroup().addTo(map);
  let isochronesLayerGroup = L.layerGroup().addTo(map);

  let currentCategory = 'parques';
  let activeMarkersMap = new Map(); // id -> leaflet marker
  let showLabels = true;

  // 1. DIBUJAR MARCADOR PRINCIPAL DEL PROYECTO
  function setupProjectMarker() {
    const projectIcon = L.divIcon({
      className: 'project-marker-wrapper',
      html: `
        <div class="project-marker-container">
          <div class="project-pulse"></div>
          <div class="project-pin-core">★</div>
          <div class="project-label-pill">INDEPENDENCIA & TERUEL</div>
        </div>
      `,
      iconSize: [48, 48],
      iconAnchor: [24, 24]
    });

    const marker = L.marker(projectCoords, {
      icon: projectIcon,
      zIndexOffset: 10000
    }).addTo(map);

    const projectPopupHtml = `
      <div class="popup-card">
        <span class="popup-tag" style="color: #c5a059;">Ubicación Exclusiva</span>
        <h3 class="popup-title">Proyecto Independencia & Teruel</h3>
        <p style="font-size: 12px; color: #666; margin: 4px 0 8px 0;">
          Calle Teruel con Calle Independencia, Miraflores.<br>
          En el corazón residencial más cotizado entre Miraflores y San Isidro.
        </p>
        <div class="popup-walk-info">
          <span>Walk Score: 98/100 • Entorno 100% Caminable</span>
        </div>
        <a href="${project.googleMapsUrl}" target="_blank" class="popup-btn-gmaps">
          Ver en Google Maps & Street View
        </a>
      </div>
    `;

    marker.bindPopup(projectPopupHtml, { maxWidth: 280 });
  }

  // 2. DIBUJAR RADIOS DE CAMINABILIDAD (5 y 10 min)
  function setupIsochrones() {
    isochronesLayerGroup.clearLayers();

    // 5 min a pie (~400m)
    const circle5m = L.circle(projectCoords, {
      radius: 400,
      color: '#c5a059',
      weight: 1.5,
      dashArray: '5, 8',
      fillColor: '#c5a059',
      fillOpacity: 0.04,
      interactive: false
    });

    // 10 min a pie (~800m)
    const circle10m = L.circle(projectCoords, {
      radius: 800,
      color: '#999999',
      weight: 1.2,
      dashArray: '4, 8',
      fillColor: '#999999',
      fillOpacity: 0.02,
      interactive: false
    });

    isochronesLayerGroup.addLayer(circle10m);
    isochronesLayerGroup.addLayer(circle5m);
  }

  // 3. GENERAR CONTADORES EN LA BARRA LATERAL
  function updateCategoryCounters() {
    let totalAll = 0;
    for (const [catKey, items] of Object.entries(MAP_DATA.categories)) {
      const el = document.getElementById(`count-${catKey}`);
      if (el) {
        el.textContent = items.length;
      }
      totalAll += items.length;
    }
    const totalEl = document.getElementById('count-todos');
    if (totalEl) totalEl.textContent = totalAll;
  }

  // 4. CREAR MARCADOR CUSTOM PARA UN LUGAR
  function createPlaceMarker(item, catKey) {
    const iconSymbol = categoryIcons[catKey] || '📍';
    const isParks = catKey === 'parques';
    const highlightClass = isParks ? 'illuminated' : '';

    const labelHtml = showLabels 
      ? `<div class="poi-marker-label">${escapeHtml(item.name)}</div>`
      : '';

    const customIcon = L.divIcon({
      className: 'poi-custom-leaflet-icon',
      html: `
        <div class="poi-marker-wrap cat-${catKey} ${highlightClass}" id="poi-pin-${encodeId(item.name)}">
          <div class="poi-marker-icon">${iconSymbol}</div>
          ${labelHtml}
        </div>
      `,
      iconSize: [140, 50],
      iconAnchor: [70, 16],
      popupAnchor: [0, -18]
    });

    const marker = L.marker([item.lat, item.lon], { icon: customIcon });

    // Google directions link
    const directionsUrl = `https://www.google.com/maps/dir/?api=1&origin=${project.lat},${project.lon}&destination=${item.lat},${item.lon}&travelmode=walking`;

    const popupHtml = `
      <div class="popup-card">
        <span class="popup-tag">${categoryLabels[catKey] || catKey}</span>
        <h4 class="popup-title">${escapeHtml(item.name)}</h4>
        <div class="popup-walk-info">
          <svg viewBox="0 0 24 24"><circle cx="12" cy="5" r="2"/><path d="M10 22v-5l-2-2.5V11l4-3 3 2.5V17l-2 5"/></svg>
          <strong>A ${item.walkMin} min a pie</strong> • ${item.distance} metros
        </div>
        <a href="${directionsUrl}" target="_blank" class="popup-btn-gmaps">
          <span>Cómo llegar caminando</span>
        </a>
      </div>
    `;

    marker.bindPopup(popupHtml, { maxWidth: 260 });
    return marker;
  }

  // 5. RENDERIZAR CATEGORÍA EN EL MAPA CON ILUMINACIÓN
  function renderCategory(catKey, filterText = '') {
    markersLayerGroup.clearLayers();
    polygonsLayerGroup.clearLayers();
    activeMarkersMap.clear();

    let itemsToDisplay = [];

    if (catKey === 'todos') {
      for (const [key, items] of Object.entries(MAP_DATA.categories)) {
        items.forEach(it => itemsToDisplay.push({ ...it, actualCat: key }));
      }
    } else {
      const items = MAP_DATA.categories[catKey] || [];
      itemsToDisplay = items.map(it => ({ ...it, actualCat: catKey }));
    }

    // Filtrar por texto si hay búsqueda activa
    if (filterText.trim()) {
      const query = filterText.toLowerCase();
      itemsToDisplay = itemsToDisplay.filter(it => 
        it.name.toLowerCase().includes(query) ||
        (it.actualCat && it.actualCat.toLowerCase().includes(query))
      );
    }

    // Actualizar etiqueta del contador
    const activeLabel = document.getElementById('activeCountLabel');
    if (activeLabel) {
      activeLabel.textContent = `${itemsToDisplay.length} lugares`;
    }

    // 5.1 Iluminar Polígonos de Parques o Áreas Arqueológicas
    itemsToDisplay.forEach(item => {
      if (item.polygon && item.polygon.length > 2) {
        const isPark = item.actualCat === 'parques';
        const poly = L.polygon(item.polygon, {
          color: isPark ? '#2e7d32' : '#6a1b9a',
          weight: 2,
          opacity: 0.85,
          fillColor: isPark ? '#4caf50' : '#ab47bc',
          fillOpacity: isPark ? 0.35 : 0.25,
          className: 'illuminated-polygon'
        });

        poly.bindTooltip(`<strong>${escapeHtml(item.name)}</strong><br>${item.walkMin} min a pie`, {
          sticky: true,
          direction: 'top'
        });

        poly.on('click', () => {
          const marker = activeMarkersMap.get(item.name);
          if (marker) marker.openPopup();
        });

        polygonsLayerGroup.addLayer(poly);
      }
    });

    // 5.2 Añadir Marcadores con Nombres
    itemsToDisplay.forEach(item => {
      const marker = createPlaceMarker(item, item.actualCat);
      markersLayerGroup.addLayer(marker);
      activeMarkersMap.set(item.name, marker);
    });

    // 5.3 Actualizar Lista en la Barra Lateral
    renderSidebarList(itemsToDisplay);
  }

  // 6. RENDERIZAR LISTA EN LA BARRA LATERAL
  function renderSidebarList(items) {
    const container = document.getElementById('poiListContainer');
    if (!container) return;

    if (items.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 24px; color: #999; font-size: 13px;">
          No se encontraron lugares con ese criterio.
        </div>
      `;
      return;
    }

    let html = '';
    items.forEach(item => {
      const icon = categoryIcons[item.actualCat] || '📍';
      html += `
        <div class="poi-card" data-name="${escapeHtml(item.name)}">
          <div class="poi-info">
            <div class="poi-name" title="${escapeHtml(item.name)}">
              ${escapeHtml(item.name)}
            </div>
            <div class="poi-meta">
              <span>${icon} ${categoryLabels[item.actualCat] || item.actualCat}</span>
              <span>• ${item.distance}m</span>
            </div>
          </div>
          <div class="poi-walk-badge">
            ${item.walkMin} min
          </div>
        </div>
      `;
    });

    container.innerHTML = html;

    // Click handler en cada card
    container.querySelectorAll('.poi-card').forEach(card => {
      card.addEventListener('click', () => {
        const name = card.getAttribute('data-name');
        focusPlace(name);
      });
    });
  }

  // 7. ENFOCAR LUGAR Y ABRIR POPUP
  function focusPlace(placeName) {
    const marker = activeMarkersMap.get(placeName);
    if (marker) {
      const latlng = marker.getLatLng();
      map.flyTo(latlng, 17, { duration: 0.8 });
      marker.openPopup();

      // Cerrar drawer en móvil al seleccionar para ver el mapa
      if (window.innerWidth <= 768) {
        document.body.classList.remove('drawer-open');
      }

      // Highlight card in sidebar
      document.querySelectorAll('.poi-card').forEach(c => {
        if (c.getAttribute('data-name') === placeName) {
          c.classList.add('active');
          c.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        } else {
          c.classList.remove('active');
        }
      });
    }
  }

  // Funciones globales expuestas para móviles y clics directos
  window.selectCategory = function (catKey) {
    const catButtons = document.querySelectorAll('.category-btn');
    catButtons.forEach(b => {
      if (b.getAttribute('data-category') === catKey) {
        b.classList.add('active');
      } else {
        b.classList.remove('active');
      }
    });
    currentCategory = catKey;
    const searchInput = document.getElementById('searchInput');
    const searchVal = searchInput ? searchInput.value : '';
    renderCategory(currentCategory, searchVal);

    // En pantallas móviles, cerramos el cajón suavemente para ver el mapa iluminado
    if (window.innerWidth <= 768) {
      setTimeout(() => {
        document.body.classList.remove('drawer-open');
      }, 180);
    }
  };

  window.toggleMobileDrawer = function () {
    const sidebarPanel = document.getElementById('sidebarPanel');
    if (sidebarPanel) sidebarPanel.classList.remove('collapsed');
    document.body.classList.toggle('drawer-open');
  };

  window.closeMobileDrawer = function () {
    document.body.classList.remove('drawer-open');
  };

  // 8. EVENT LISTENERS & CONTROLES
  function setupEventListeners() {
    // Colapsar y expandir panel lateral / Mobile Drawer
    const sidebarPanel = document.getElementById('sidebarPanel');
    const btnCollapse = document.getElementById('btnCollapseSidebar');
    const btnToggle = document.getElementById('toggleSidebarBtn');
    const mobileDrawerTrigger = document.getElementById('mobileDrawerTrigger');
    const mobileDrawerBackdrop = document.getElementById('mobileDrawerBackdrop');
    const mobileDragHandle = document.getElementById('mobileDragHandle');

    if (btnCollapse) {
      btnCollapse.addEventListener('click', () => {
        if (sidebarPanel) sidebarPanel.classList.add('collapsed');
        document.body.classList.remove('drawer-open');
      });
    }

    if (btnToggle && sidebarPanel) {
      btnToggle.addEventListener('click', () => {
        sidebarPanel.classList.remove('collapsed');
      });
    }

    if (mobileDrawerTrigger) {
      mobileDrawerTrigger.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (sidebarPanel) sidebarPanel.classList.remove('collapsed');
        document.body.classList.toggle('drawer-open');
      });
    }

    if (mobileDrawerBackdrop) {
      mobileDrawerBackdrop.addEventListener('click', (e) => {
        e.preventDefault();
        document.body.classList.remove('drawer-open');
      });
    }

    if (mobileDragHandle) {
      mobileDragHandle.addEventListener('click', (e) => {
        e.preventDefault();
        document.body.classList.remove('drawer-open');
      });
    }

    // Categorías
    const catButtons = document.querySelectorAll('.category-btn');
    catButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        catButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentCategory = btn.getAttribute('data-category');
        
        const searchVal = document.getElementById('searchInput').value;
        renderCategory(currentCategory, searchVal);

        // En pantallas móviles, cerrar suavemente el cajón para revelar el mapa iluminado
        if (window.innerWidth <= 768) {
          setTimeout(() => {
            document.body.classList.remove('drawer-open');
          }, 200);
        }
      });
    });

    // Búsqueda en vivo
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        renderCategory(currentCategory, e.target.value);
      });
    }

    // Toggle Isochrones (5 y 10 min)
    const toggleIso = document.getElementById('toggleIsochrones');
    if (toggleIso) {
      toggleIso.addEventListener('change', (e) => {
        if (e.target.checked) {
          map.addLayer(isochronesLayerGroup);
          const legend = document.getElementById('walkingLegend');
          if (legend) legend.style.display = 'flex';
        } else {
          map.removeLayer(isochronesLayerGroup);
          const legend = document.getElementById('walkingLegend');
          if (legend) legend.style.display = 'none';
        }
      });
    }

    // Toggle Nombres en mapa
    const toggleNames = document.getElementById('toggleLabels');
    if (toggleNames) {
      toggleNames.addEventListener('change', (e) => {
        showLabels = e.target.checked;
        const searchVal = document.getElementById('searchInput').value;
        renderCategory(currentCategory, searchVal);
      });
    }

    // Centrar en el proyecto
    const btnCenter = document.getElementById('btnCenterProject');
    if (btnCenter) {
      btnCenter.addEventListener('click', () => {
        map.flyTo(projectCoords, 16, { duration: 1.0 });
      });
    }

    // Controles de zoom
    const btnZoomIn = document.getElementById('btnZoomIn');
    if (btnZoomIn) {
      btnZoomIn.addEventListener('click', () => map.zoomIn());
    }

    const btnZoomOut = document.getElementById('btnZoomOut');
    if (btnZoomOut) {
      btnZoomOut.addEventListener('click', () => map.zoomOut());
    }

    // Selector de estilo de mapa base (Minimalista Blanco, Calles Detalladas, Satelital)
    const styleChips = document.querySelectorAll('.style-chip');
    styleChips.forEach(chip => {
      chip.addEventListener('click', () => {
        styleChips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        const styleKey = chip.getAttribute('data-style');

        if (styleKey === 'positron') {
          // Minimalista Blanco: Street map con filtro gris arquitectónico
          map.removeLayer(satelliteLayer);
          if (!map.hasLayer(streetLayer)) {
            streetLayer.addTo(map);
          }
          streetLayer.bringToBack();
          mapViewport.className = 'map-theme-minimalist';
        } else if (styleKey === 'streets') {
          // Calles Detalladas: Street map a todo color sin filtro
          map.removeLayer(satelliteLayer);
          if (!map.hasLayer(streetLayer)) {
            streetLayer.addTo(map);
          }
          streetLayer.bringToBack();
          mapViewport.className = 'map-theme-streets';
        } else if (styleKey === 'satellite') {
          // Satelital: Fotos aéreas de alta resolución
          map.removeLayer(streetLayer);
          if (!map.hasLayer(satelliteLayer)) {
            satelliteLayer.addTo(map);
          }
          if (satelliteLayer.bringToBack) satelliteLayer.bringToBack();
          mapViewport.className = 'map-theme-satellite';
        }
      });
    });

    // Nav links
    const navEntorno = document.getElementById('nav-entorno');
    if (navEntorno) {
      navEntorno.addEventListener('click', (e) => {
        e.preventDefault();
        const btnTodos = document.querySelector('.category-btn[data-category="todos"]');
        if (btnTodos) btnTodos.click();
      });
    }

    const navUbicacion = document.getElementById('nav-ubicacion');
    if (navUbicacion) {
      navUbicacion.addEventListener('click', (e) => {
        e.preventDefault();
        map.flyTo(projectCoords, 17, { duration: 1.0 });
      });
    }

    const navEstiloVida = document.getElementById('nav-estilo-vida');
    if (navEstiloVida) {
      navEstiloVida.addEventListener('click', (e) => {
        e.preventDefault();
        const btnRest = document.querySelector('.category-btn[data-category="restaurantes"]');
        if (btnRest) btnRest.click();
      });
    }
  }

  // Funciones de utilidad
  function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>"']/g, function (m) {
      return ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      })[m];
    });
  }

  function encodeId(str) {
    return encodeURIComponent(str).replace(/%/g, '');
  }

  // Inicialización completa
  setupProjectMarker();
  setupIsochrones();
  updateCategoryCounters();
  setupEventListeners();

  // Renderizar Parques inicialmente (como solicita el usuario)
  renderCategory('parques');

})();
