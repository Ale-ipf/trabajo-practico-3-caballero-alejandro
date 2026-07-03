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

const modalDetalle = new bootstrap.Modal(document.getElementById("modalDetalle"));

async function obtenerListadoPersonajes() {
  try {
    mostrarSpinner(true);

    const respuesta = await fetch(API_BASE_URL);

    if (!respuesta.ok) {
      throw new Error(`La API respondió con estado ${respuesta.status}`);
    }

    const datos = await respuesta.json();

    if (!datos.results || datos.results.length === 0) {
      throw new Error("La API no devolvió personajes.");
    }

    personajes = datos.results;
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

function limpiarResultados() {
  contenedorTarjetas.innerHTML = "";
  mensajeBusqueda.classList.add("d-none");
  mensajeBusqueda.textContent = "";
}

function mostrarMensaje(texto, tipo = "info") {
  mensajeBusqueda.className = `text-center mt-3 alert alert-${tipo}`;
  mensajeBusqueda.textContent = texto;
  mensajeBusqueda.classList.remove("d-none");
}

function mostrarSpinner(mostrar) {
  spinnerCarga.classList.toggle("d-none", !mostrar);
}

function filtrarPersonajes(termino) {
  const texto = termino.trim().toLowerCase();

  const resultados = personajes.filter((personaje) =>
    personaje.name.toLowerCase().includes(texto)
  );

  renderizarTarjetas(resultados);
}

async function mostrarModalDetalle(id) {
  // Estado de carga dentro del modal
  modalBodyContenido.innerHTML = `
    <div class="text-center py-4">
      <div class="spinner-border text-warning" role="status">
        <span class="visually-hidden">Cargando...</span>
      </div>
    </div>
  `;
  modalDetalle.show();

  try {
    const personaje = await obtenerDetallePersonaje(id);
    modalBodyContenido.innerHTML = generarContenidoModal(personaje);
  } catch (error) {
    modalBodyContenido.innerHTML = `
      <div class="alert alert-danger mb-0">
        No se pudo obtener el detalle del personaje. (${error.message})
      </div>
    `;
  }
}

function generarContenidoModal(personaje) {
  const urlImagen = `${CDN_BASE_URL}${personaje.portrait_path}`;
  const frase =
    personaje.phrases && personaje.phrases.length > 0
      ? personaje.phrases[0]
      : "Este personaje no tiene frases registradas.";

  const edad = personaje.age !== null && personaje.age !== undefined
    ? personaje.age
    : "Desconocida";

  const fechaNacimiento = personaje.birthdate || "Desconocida";

  return `
    <div class="row g-3 align-items-start">
      <div class="col-4">
        <img src="${urlImagen}" alt="${personaje.name}" />
      </div>
      <div class="col-8">
        <h4>${personaje.name}</h4>
        <p class="mb-1"><strong>Edad:</strong> ${edad}</p>
        <p class="mb-1"><strong>Fecha de nacimiento:</strong> ${fechaNacimiento}</p>
        <p class="mb-1"><strong>Género:</strong> ${personaje.gender}</p>
        <p class="mb-1"><strong>Ocupación:</strong> ${personaje.occupation || "Desconocida"}</p>
        <p class="mb-2"><strong>Estado:</strong> ${personaje.status}</p>
        <p class="fst-italic mb-0">"${frase}"</p>
      </div>
    </div>
  `;
}

formBuscador.addEventListener("submit", (evento) => {
  evento.preventDefault();
  const texto = inputBuscador.value;

  if (texto.trim() === "") {
    mostrarMensaje("Escribí un nombre para buscar.", "warning");
    return;
  }

  filtrarPersonajes(texto);
});

btnLimpiarBusqueda.addEventListener("click", () => {
  inputBuscador.value = "";
  renderizarTarjetas(personajes);
});

contenedorTarjetas.addEventListener("click", (evento) => {
  const boton = evento.target.closest(".btn-ver-detalle");
  if (!boton) return;

  const id = boton.dataset.id;
  mostrarModalDetalle(id);
});

document.addEventListener("DOMContentLoaded", obtenerListadoPersonajes);