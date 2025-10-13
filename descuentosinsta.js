// descuento.js - versión ajustada: toma el SEGUNDO precio visible (no la cuota) y
// coloca el bloque debajo de la imagen en listado y junto al precio en ficha.
(function () {
  const DISCOUNT_FACTOR = 0.85; // 15% OFF -> 0.85
  const DEBOUNCE_MS = 120;

  // extrae el match adecuado: si hay >=2 matches toma la segunda desde la derecha,
  // si solo hay 1 toma esa.
  function pickPriceMatchFromText(text) {
    if (!text) return null;
    const matches = String(text).match(/\$\s*[\d\.\,]+/g);
    if (!matches || !matches.length) return null;
    if (matches.length >= 2) {
      // segundo precio visible (penúltimo en términos de array)
      return matches[matches.length - 2];
    }
    return matches[matches.length - 1];
  }

  function parsePriceString(str) {
    if (!str) return NaN;
    const candidate = pickPriceMatchFromText(str) || str;
    let s = String(candidate).replace(/[^0-9\.,-]+/g, "");
    if (s.indexOf(',') > -1 && s.indexOf('.') > -1) {
      s = s.replace(/\./g, '').replace(/,/g, '.');
    } else if (s.indexOf(',') > -1 && s.indexOf('.') === -1) {
      s = s.replace(/,/g, '.');
    } else {
      s = s.replace(/\./g, '');
    }
    const n = parseFloat(s);
    return isNaN(n) ? NaN : n;
  }

  function formatARS(num) {
    if (isNaN(num)) return '';
    return num.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' });
  }

  function createTransferNode() {
    const node = document.createElement('div');
    node.className = 'precio-transferencia';
    node.style.marginTop = '6px';
    node.style.fontWeight = '700';
    node.style.color = '#2e7d32';
    node.setAttribute('data-transfer-node', '1');
    return node;
  }

  function ensureInsertAfter(targetNode, transferNode) {
    const next = targetNode.nextElementSibling;
    if (next && next.matches && next.matches('.precio-transferencia')) {
      next.replaceWith(transferNode);
    } else {
      targetNode.insertAdjacentElement('afterend', transferNode);
    }
  }

  // Procesa listado: calcula precio a partir del contenedor de precio, pero inserta
  // debajo de la caja de media (imagen) si existe, para que no quede al final.
  function processProductList() {
    const products = document.querySelectorAll('.block-products-feed__product');
    if (!products || !products.length) return;
    products.forEach(product => {
      try {
        const priceContainer = product.querySelector('.block-products-feed__product-price');
        if (!priceContainer) return;

        // clonamos y removemos <del> si existe para quedarnos con precios visibles
        const clone = priceContainer.cloneNode(true);
        const delTag = clone.querySelector && clone.querySelector('del');
        if (delTag) delTag.remove();

        const raw = clone.textContent || '';
        const priceNum = parsePriceString(raw);
        if (isNaN(priceNum)) return;

        const transferencia = priceNum * DISCOUNT_FACTOR;
        const info = createTransferNode();
        info.textContent = `${formatARS(transferencia)} (con transferencia)`;

        // preferimos insertar justo después de la imagen del producto
        const media = product.querySelector('.block-products-feed__product-media');
        if (media) {
          // si ya hay un .precio-transferencia justo después de media, lo reemplaza
          const next = media.nextElementSibling;
          if (next && next.matches && next.matches('.precio-transferencia')) {
            next.replaceWith(info);
          } else {
            media.insertAdjacentElement('afterend', info);
          }
        } else {
          // fallback: insertar después del priceContainer
          ensureInsertAfter(priceContainer, info);
        }
      } catch (e) {
        console.warn('proc list error', e);
      }
    });
  }

  // Procesa ficha: encuentra el nodo de precio principal y lo usa como target.
  function findBestPriceNodeSingle() {
    const selectors = [
      '.product__price',
      '.product-price',
      '.product-page-price',
      '.product-detail-price',
      '.product_price',
      '.price',
      '.product-info .price',
      '.product-info'
    ];
    for (const sel of selectors) {
      const el = document.querySelector(sel);
      if (el && /\$/.test(el.textContent)) return el;
    }
    // fallback: primer nodo con patrón de precio cercano al botón de compra
    const candidates = Array.from(document.querySelectorAll('div, span, p, h1,h2,h3')).filter(n => {
      const txt = (n.textContent || '').trim();
      return /\$\s*[\d\.,]+/.test(txt);
    });
    return candidates.length ? candidates[0] : null;
  }

  function processSingleProduct() {
    const priceNode = findBestPriceNodeSingle();
    if (!priceNode) return;
    const clone = priceNode.cloneNode(true);
    const del = clone.querySelector && clone.querySelector('del');
    if (del) del.remove();
    const rawText = clone.textContent || '';
    const priceNum = parsePriceString(rawText);
    if (isNaN(priceNum)) return;

    const transferencia = priceNum * DISCOUNT_FACTOR;
    const info = createTransferNode();
    info.textContent = `${formatARS(transferencia)} con transferencia`;

    // insertar después del nodo de precio principal
    ensureInsertAfter(priceNode, info);
  }

  // debounce y observador
  let debounceTimer = null;
  function scheduleAllProcessing() {
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      processProductList();
      processSingleProduct();
    }, DEBOUNCE_MS);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', scheduleAllProcessing);
  } else {
    scheduleAllProcessing();
  }

  const mo = new MutationObserver((mutations) => {
    let shouldRun = false;
    for (const m of mutations) {
      if (m.addedNodes && m.addedNodes.length) { shouldRun = true; break; }
      if (m.type === 'characterData') { shouldRun = true; break; }
    }
    if (shouldRun) scheduleAllProcessing();
  });
  mo.observe(document.body, { childList: true, subtree: true, characterData: true });

  ['change', 'click'].forEach(evt => {
    document.addEventListener(evt, function (e) {
      const t = e.target;
      const tag = t && t.tagName ? t.tagName.toLowerCase() : '';
      if (tag === 'select' || tag === 'input' || (t.closest && t.closest('.product-options, .product-variants, .variant, .product-attribute, .product-form'))) {
        scheduleAllProcessing();
      } else {
        if (t && (t.textContent || '').indexOf('$') !== -1) scheduleAllProcessing();
      }
    }, { passive: true });
  });

  // re-ejecuciones por si carga lento
  setTimeout(scheduleAllProcessing, 700);
  setTimeout(scheduleAllProcessing, 2000);
})();
