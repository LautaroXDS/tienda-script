function actualizarPrecioTransferencia() {
  // Buscamos el precio principal del producto
  const priceEl = document.querySelector(".product__price .product__price--regular, .product__price .product__price--offer, .product__price-value");
  if (!priceEl) return;

  // Eliminamos cualquier <del> si existe
  const clone = priceEl.cloneNode(true);
  const delTag = clone.querySelector("del");
  if (delTag) delTag.remove();

  // Obtenemos el texto del precio visible
  let raw = clone.textContent.trim();
  raw = raw.replace(/[^0-9,,-]+/g, "").replace(/\./g, "").replace(",", ".");
  const priceNum = parseFloat(raw);
  if (isNaN(priceNum)) return;

  // Calculamos el precio con transferencia
  const transferencia = priceNum * 0.85;

  // Si ya existe el bloque, lo actualizamos
  let info = document.querySelector(".precio-transferencia");
  if (!info) {
    info = document.createElement("div");
    info.className = "precio-transferencia";
    info.style.fontSize = "1.2em";
    info.style.marginTop = "5px";
    info.style.color = "#008000";
    const target = document.querySelector(".product-vip__price-value");
    if (target) {
        target.insertAdjacentElement("afterend", info);
    } else {
        priceEl.insertAdjacentElement("afterend", info); // fallback por si no existe
}

  }

  info.textContent =
    transferencia.toLocaleString("es-AR", {
      style: "currency",
      currency: "ARS",
    }) + " con transferencia";
}

// Ejecutar al cargar la página
document.addEventListener("DOMContentLoaded", () => {
  actualizarPrecioTransferencia();

  // Observar cambios en el bloque del precio (para detectar cambio de medida)
  const priceContainer = document.querySelector(".product__price");
  if (priceContainer) {
    const observer = new MutationObserver(() => {
      actualizarPrecioTransferencia();
    });
    observer.observe(priceContainer, { childList: true, subtree: true });
  }
});
