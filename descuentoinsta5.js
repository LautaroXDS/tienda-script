(function () {
  function getPrecioBase(container) {
    const del = container.querySelector("del");
    let text = container.textContent;
    if (del) text = text.replace(del.textContent, "");

    text = text.trim().replace(/[^0-9,.-]+/g, "").replace(/\./g, "").replace(",", ".");
    const num = parseFloat(text);
    return isNaN(num) ? null : num;
  }

  function actualizarPrecioTransferencia(container) {
    const base = getPrecioBase(container);
    if (!base) return;

    const descuento = base * 0.85;
    let info = container.parentElement.querySelector(".precio-transferencia");

    if (!info) {
      info = document.createElement("div");
      info.className = "precio-transferencia";
      info.style.fontSize = "0.9em";
      info.style.color = "#198754"; // verde tipo “precio con descuento”
      info.style.marginTop = "4px";
      info.style.fontWeight = "500";
      container.insertAdjacentElement("afterend", info);
    }

    info.textContent = `${descuento.toLocaleString("es-AR", {
      style: "currency",
      currency: "ARS",
    })} con transferencia`;
  }

  // Actualizar al cargar
  document.querySelectorAll(".block-products-feed__product-price, .product-price").forEach(container => {
    actualizarPrecioTransferencia(container);

    // Observar cambios del precio principal
    const observer = new MutationObserver(() => actualizarPrecioTransferencia(container));
    observer.observe(container, { childList: true, subtree: true });
  });
})();
