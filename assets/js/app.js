const API_BASE_URL = "https://thesimpsonsapi.com/api/characters";
const CDN_BASE_URL = "https://cdn.thesimpsonsapi.com/500";

let personajes = [];

const contenedorTarjetas = document.getElementById("contenedor-tarjetas");
const spinnerCarga = document.getElementById("spinner-carga");
const formBuscador = document.getElementById("form-buscador");
const inputBuscador = document.getElementById("input-buscador");
const btnLimpiarBusqueda = document.getElementById("btn-limpiar-busqueda");
const mensajeBusqueda = document.getElementById("mensaje-busqueda");
const modalBodyContenido = document.getElementById("modal-body-contenido");

async function obtenerListadoPersonajes() {
  try {
    mostrarSpinner(true);
 
    const respuesta = await fetch(API_BASE_URL);
 
    if (!respuesta.ok) {
      throw new Error(`La API respondió con estado ${respuesta.status}`);
    }
 
    const datos = await respuesta.json();
 
    // Caso de respuesta vacía o inesperada
    if (!datos.results || datos.results.length === 0) {
      throw new Error("La API no devolvió personajes.");
    }
 
    personajes = datos.results; // guardamos el arreglo de objetos
    renderizarTarjetas(personajes);
 
  } catch (error) {
    mostrarMensaje(
      `No se pudo cargar el listado de personajes. Intentá recargar la página. (${error.message})`,
      "danger"
    );
  } finally {
    mostrarSpinner(false);
  }
}

async function obtenerDetallePersonaje(id) {
  const respuesta = await fetch(`${API_BASE_URL}/${id}`);
 
  if (!respuesta.ok) {
    throw new Error(`No se encontró el personaje (estado ${respuesta.status})`);
  }
 
  const personaje = await respuesta.json();
 
  if (!personaje || !personaje.id) {
    throw new Error("La respuesta del personaje llegó vacía.");
  }
 
  return personaje;
}

function renderizarTarjetas(lista) {
  limpiarResultados();
 
  if (lista.length === 0) {
    mostrarMensaje("No se encontraron personajes con ese nombre.", "warning");
    return;
  }
 
  // Usamos un fragment para insertar todo de una vez (mejor performance)
  const fragmento = document.createDocumentFragment();
 
  lista.forEach((personaje) => {
    fragmento.appendChild(crearTarjetaPersonaje(personaje));
  });
 
  contenedorTarjetas.appendChild(fragmento);
}

function crearTarjetaPersonaje(personaje) {
  const columna = document.createElement("div");
  columna.className = "col-12 col-sm-6 col-md-4 col-lg-3 mb-4";
 
  const urlImagen = `${CDN_BASE_URL}${personaje.portrait_path}`;
  const esVivo = personaje.status === "Alive";
 
  columna.innerHTML = `
    <div class="card h-100 tarjeta-personaje shadow-sm">
      <img
        src="${urlImagen}"
        class="card-img-top"
        alt="${personaje.name}"
        loading="lazy"
      />
      <div class="card-body d-flex flex-column">
        <h5 class="card-title">${personaje.name}</h5>
        <p class="card-text mb-1">
          <strong>Ocupación:</strong> ${personaje.occupation || "Desconocida"}
        </p>
        <p class="card-text mb-3">
          <span class="badge ${esVivo ? "bg-success" : "bg-secondary"}">
            ${esVivo ? "Alive" : "Deceased"}
          </span>
        </p>
        <button
          class="btn btn-warning mt-auto btn-ver-detalle"
          data-id="${personaje.id}"
        >
          Ver detalle
        </button>
      </div>
    </div>
  `;
 
  return columna;
}