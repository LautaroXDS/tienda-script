const productos = document.querySelectorAll(".products-feed__product");

productos.forEach(product => {
  // Buscar el precio tachado dentro de este producto
  const delEl = product.querySelector(".products-feed__product-price");
  if (!delEl) return;

  // Limpiar el texto y convertir a número
  let raw = delEl.textContent.trim();
  raw = raw.replace(/[^0-9,.-]+/g, "").replace(/\./g, "").replace(",", ".");
  const priceNum = parseFloat(raw);
  if (isNaN(priceNum)) return;

  // Calcular precio transferencia
  const transferencia = priceNum * 0.85; // <-- tu lógica

  // Crear un <div> para mostrarlo
  const info = document.createElement("div");
  info.className = "precio-transferencia";
  info.textContent =
    
    transferencia.toLocaleString("es-AR", {
      style: "currency",
      currency: "ARS",
    }) + " con transferencia"
    
    ;

  // 2️⃣ Insertar debajo de la foto
  const media = product.querySelector(".products-feed__product-price");
  if (media) {
    media.insertAdjacentElement("afterend", info);
  }
});


const products = document.querySelectorAll(".block-products-feed__product");

products.forEach(product => {
  // Buscar el precio tachado dentro de este producto
  const delEl = product.querySelector(".block-products-feed__product-price");
  if (!delEl) return;

  // Limpiar el texto y convertir a número
  let raw = delEl.textContent.trim();
  raw = raw.replace(/[^0-9,.-]+/g, "").replace(/\./g, "").replace(",", ".");
  const priceNum = parseFloat(raw);
  if (isNaN(priceNum)) return;

  // Calcular precio transferencia
  const transferencia = priceNum * 0.85; // <-- tu lógica

  // Crear un <div> para mostrarlo
  const info = document.createElement("div");
  info.className = "precio-transferencia";
  info.textContent =
  
    
    transferencia.toLocaleString("es-AR", {
      style: "currency",
      currency: "ARS",
    }) + " con transferencia "
    
    ;

  // 2️⃣ Insertar debajo de la foto
  const media = product.querySelector(".block-products-feed__product-price");
  if (media) {
    media.insertAdjacentElement("afterend", info);
  }
});


const product = document.querySelectorAll(".block-products-set__product-wrapper");

product.forEach(product => {
  // Buscar el precio tachado dentro de este producto
  const delEl = product.querySelector(".block-products-set__product-price");
  if (!delEl) return;

  // Limpiar el texto y convertir a número
  let raw = delEl.textContent.trim();
  raw = raw.replace(/[^0-9,.-]+/g, "").replace(/\./g, "").replace(",", ".");
  const priceNum = parseFloat(raw);
  if (isNaN(priceNum)) return;

  // Calcular precio transferencia
  const transferencia = priceNum * 0.85; // <-- tu lógica

  // Crear un <div> para mostrarlo
  const info = document.createElement("div");
  info.className = "precio-transferencia";
  info.textContent =
  
    
    transferencia.toLocaleString("es-AR", {
      style: "currency",
      currency: "ARS",
    }) + " con transferencia "
    
    ;

  // 2️⃣ Insertar debajo de la foto
  const media = product.querySelector(".block-products-set__product-price");
  if (media) {
    media.insertAdjacentElement("afterend", info);
  }
});
