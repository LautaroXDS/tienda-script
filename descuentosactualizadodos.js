const productos = document.querySelectorAll(".products-feed__product");

productos.forEach(product => {
  // Seleccionamos el contenedor de precio
  const priceContainer = product.querySelector(".products-feed__product-price");
  if (!priceContainer) return;

  // Clonamos el contenedor para poder eliminar el <del> sin afectar el DOM original
  const clone = priceContainer.cloneNode(true);
  const delTag = clone.querySelector("del");
  if (delTag) delTag.remove(); // Eliminamos el tachado

  // Ahora obtenemos solo el texto limpio (sin el precio tachado)
  let raw = clone.textContent.trim();

  // Limpiamos el texto y lo convertimos a número
  raw = raw.replace(/[^0-9,.-]+/g, "").replace(/\./g, "").replace(",", ".");
  const priceNum = parseFloat(raw);
  if (isNaN(priceNum)) return;

  // Calculamos el precio por transferencia
  const transferencia = priceNum * 0.85; // <-- tu lógica

  // Creamos el <div> con el nuevo precio
  const info = document.createElement("div");
  info.className = "precio-transferencia";
  info.textContent =
    transferencia.toLocaleString("es-AR", {
      style: "currency",
      currency: "ARS",
    }) + " con transferencia";

  // Insertamos el nuevo elemento debajo del bloque de precio
  priceContainer.insertAdjacentElement("afterend", info);
});

/**********************************************************************************************************/

const products = document.querySelectorAll(".block-products-feed__product");

products.forEach(product => {
  // Seleccionamos el contenedor de precio
  const priceContainer = product.querySelector(".block-products-feed__product-price");
  if (!priceContainer) return;

  // Clonamos el contenedor para poder eliminar el <del> sin afectar el DOM original
  const clone = priceContainer.cloneNode(true);
  const delTag = clone.querySelector("del");
  if (delTag) delTag.remove(); // Eliminamos el tachado

  // Ahora obtenemos solo el texto limpio (sin el precio tachado)
  let raw = clone.textContent.trim();

  // Limpiamos el texto y lo convertimos a número
  raw = raw.replace(/[^0-9,.-]+/g, "").replace(/\./g, "").replace(",", ".");
  const priceNum = parseFloat(raw);
  if (isNaN(priceNum)) return;

  // Calculamos el precio por transferencia
  const transferencia = priceNum * 0.85; // <-- tu lógica

  // Creamos el <div> con el nuevo precio
  const info = document.createElement("div");
  info.className = "precio-transferencia";
  info.textContent =
    transferencia.toLocaleString("es-AR", {
      style: "currency",
      currency: "ARS",
    }) + " con transferencia";

  // Insertamos el nuevo elemento debajo del bloque de precio
  priceContainer.insertAdjacentElement("afterend", info);
});

/**********************************************************************************************************/

const product = document.querySelectorAll(".block-products-set__product-wrapper");

product.forEach(product => {
  // Seleccionamos el contenedor de precio
  const priceContainer = product.querySelector(".block-products-set__product-price");
  if (!priceContainer) return;

  // Clonamos el contenedor para poder eliminar el <del> sin afectar el DOM original
  const clone = priceContainer.cloneNode(true);
  const delTag = clone.querySelector("del");
  if (delTag) delTag.remove(); // Eliminamos el tachado

  // Ahora obtenemos solo el texto limpio (sin el precio tachado)
  let raw = clone.textContent.trim();

  // Limpiamos el texto y lo convertimos a número
  raw = raw.replace(/[^0-9,.-]+/g, "").replace(/\./g, "").replace(",", ".");
  const priceNum = parseFloat(raw);
  if (isNaN(priceNum)) return;

  // Calculamos el precio por transferencia
  const transferencia = priceNum * 0.85; // <-- tu lógica

  // Creamos el <div> con el nuevo precio
  const info = document.createElement("div");
  info.className = "precio-transferencia";
  info.textContent =
    transferencia.toLocaleString("es-AR", {
      style: "currency",
      currency: "ARS",
    }) + " con transferencia";

  // Insertamos el nuevo elemento debajo del bloque de precio
  priceContainer.insertAdjacentElement("afterend", info);
});


/**********************************************************************************************************/

function actualizarPrecioTransferencia() {
  const priceContainer = document.querySelector(".product__price");
  if (!priceContainer) return;

  // Clonamos y eliminamos el <del> si existe
  const clone = priceContainer.cloneNode(true);
  const delTag = clone.querySelector("del");
  if (delTag) delTag.remove();

  // Obtenemos el precio actual visible
  let raw = clone.textContent.trim();
  raw = raw.replace(/[^0-9,.-]+/g, "").replace(/\./g, "").replace(",", ".");
  const priceNum = parseFloat(raw);
  if (isNaN(priceNum)) return;

  // Calculamos el precio transferencia
  const transferencia = priceNum * 0.85;

  // Buscamos si ya existe el div, si no, lo creamos
  let info = document.querySelector(".precio-transferencia");
  if (!info) {
    info = document.createElement("div");
    info.className = "precio-transferencia";
    priceContainer.insertAdjacentElement("afterend", info);
  }

  // Actualizamos su contenido
  info.textContent =
    transferencia.toLocaleString("es-AR", {
      style: "currency",
      currency: "ARS",
    }) + " con transferencia";
}

// Ejecutar al cargar la página
document.addEventListener("DOMContentLoaded", () => {
  actualizarPrecioTransferencia();

  // Crear un observador para detectar cambios en el precio
  const priceContainer = document.querySelector(".product__price");
  if (priceContainer) {
    const observer = new MutationObserver(() => {
      actualizarPrecioTransferencia();
    });

    observer.observe(priceContainer, { childList: true, subtree: true });
  }
});
