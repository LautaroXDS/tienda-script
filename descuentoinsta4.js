(function() {
  function calcularYMostrarDescuento() {
    const priceContainers = document.querySelectorAll(".block-products-feed__product-price");
    priceContainers.forEach(container => {
      // Evitar duplicados
      if (container.nextElementSibling?.classList.contains("precio-transferencia")) return;

      // Buscar el último precio visible que no esté dentro de <del>
      const del = container.querySelector("del");
      let priceText = container.textContent;
      if (del) {
        // Eliminar texto tachado del contenido
        priceText = priceText.replace(del.textContent, "");
      }

      // Limpiar y convertir a número
      priceText = priceText.trim().replace(/[^0-9,.-]+/g, "").replace(/\./g, "").replace(",", ".");
      const price = parseFloat(priceText);
      if (isNaN(price)) return;

      // Calcular precio con 15% de descuento
      const descuento = price * 0.85;

      // Crear elemento visual
      const info = document.createElement("div");
      info.className = "precio-transferencia";
      info.textContent = `${descuento.toLocaleString("es-AR", {
        style: "currency",
        currency: "ARS"
      })} con transferencia`;

      // Insertar debajo del precio original
      container.insertAdjacentElement("afterend", info);
    });
  }

  // Ejecutar al inicio
  calcularYMostrarDescuento();

  // Observar cambios solo en los nodos de precios
  const observer = new MutationObserver(mutations => {
    let cambioDetectado = false;
    for (const mutation of mutations) {
      if (
        mutation.type === "childList" &&
        mutation.target instanceof Element && // 👈 Solución al error
        mutation.target.classList.contains("block-products-feed__product-price")
      ) {
        cambioDetectado = true;
      }
    }

    if (cambioDetectado) {
      setTimeout(() => {
        document.querySelectorAll(".precio-transferencia").forEach(el => el.remove());
        calcularYMostrarDescuento();
      }, 100);
    }
  });

  // Activar el observer
  document.querySelectorAll(".block-products-feed__product-price").forEach(node => {
    observer.observe(node, { childList: true, subtree: true });
  });
})();
