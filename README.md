# Plano Interactivo - CC17 | Independencia & Teruel (Miraflores)

Aplicación web interactiva desarrollada para **CC17**, adaptada para la ubicación exacta de **Calle Teruel con Calle Independencia, Miraflores** (límite con San Isidro).

---

## 🚀 ¿Cómo abrir y usar el mapa?

1. **Abrir directamente:**
   - Haz doble clic en el archivo [`index.html`](file:///c:/Users/acyza/OneDrive/Documents/PLANO%20INTERACTIVO/index.html) para abrirlo en cualquier navegador (Google Chrome, Microsoft Edge, Safari o Firefox).
   - **No requiere instalación de servidores ni configuraciones previas.** Funciona 100% de forma autónoma.

2. **O servirlo localmente (opcional):**
   ```bash
   npx serve .
   # o con python:
   python -m http.server 8080
   ```

---

## ✨ Características y Funcionalidades

- **Diseño Arquitectónico Minimalista:** Estética en tonos grises claros y tipografía de lujo idéntica al estilo de *Illusione*.
- **Ubicación Exacta del Proyecto:** Marcador distintivo con efecto radar en la esquina de **Calle Teruel y Calle Independencia** (junto al Óvalo Gutiérrez, Parque El Olivar y Huaca Pucllana).
- **Iluminación Dinámica por Categorías:**
  - 🌳 **Parques:** Los polígonos de las áreas verdes (Parque Fermín Tangüis, Parque El Olivar, Parque Pucllana, etc.) se iluminan en verde esmeralda y muestran sus nombres claramente en el mapa.
  - 🎓 **Colegios:** Ilumina instituciones educativas cercanas (Santander, Headway, María Reina Marianistas, etc.) con sus nombres en etiquetas flotantes legibles.
  - 🏥 **Salud:** Destaca clínicas y centros médicos de prestigio (Clínica Delgado Auna, Policlínico Suárez, Anglo Americana, FAP, etc.).
  - 🛒 **Supermercados:** Muestra Wong Óvalo Gutiérrez, Vivanda Conquistadores, Tottus, tiendas orgánicas y más.
  - 🍽️ **Restaurantes:** Huaca Pucllana Restaurante, El 10, Astrid & Gastón, cafeterías de especialidad y bistrós.
  - 🏛️ **Cultura & Ocio:** Huaca Pucllana y Museo de Sitio, Cineplanet Alcázar, centros culturales.
  - ✨ **Ver Todo:** Visualización global del entorno.
- **Buscador en Tiempo Real:** Filtra cualquier lugar o referencia escribiendo su nombre.
- **Tiempos y Distancias de Caminata:** Cada punto calcula automáticamente los minutos a pie y metros de distancia desde el proyecto.
- **Anillos de Caminabilidad (5 y 10 minutos a pie):** Radios isócronos peatonales concéntricos de 400 m y 800 m.
- **Selector de Estilo de Mapa:** Alterna entre *Minimalista Blanco*, *Urbano Suave* y *Satelital HD*.
- **Enlaces a Google Maps:** Cada punto cuenta con un botón directo para trazar la ruta a pie en Google Maps.
