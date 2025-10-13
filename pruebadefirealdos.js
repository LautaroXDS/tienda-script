// descuento.js - insertar tal cual en tu repo y llamar con <script src="..."></script>
(function () {
  const DISCOUNT_FACTOR = 0.85; // <-- multiplicador (0.85 = 15% OFF). Cambialo si querés otra promo.
  const DEBOUNCE_MS = 150;

  // ---------------- utilidades ----------------
  function parsePriceString(str) {
    if (!str) return NaN;
    // si hay varios $numero en el texto, tomamos el último (precio visible actual)
    const moneyMatches = String(str).match(/\$\s*[\d\.\,]+/g);
    let candidate = moneyMatches && moneyMatches.length ? moneyMatches[moneyMatches.length - 1] : str;
    candidate = String(candidate).replace(/~~/g, ''); // quitar tildes Markdown si existieran
    // limpiar todo menos dígitos, punto y coma y coma
    let s = candidate.replace(/[^0-9\.,-]+/g, "");
    // formato AR típico: miles con '.' y decimales con ','
    if (s.indexOf(',') > -1 && s.indexOf('.') > -1) {
      s = s.replace(/\./g, '').replace(/,/g, '.'); // 20.999,00 -> 20999.00
    } else if (s.indexOf(',') > -1 && s.indexOf('.') === -1) {
      s = s.replace(/,/g, '.'); // 14999,50 -> 14999.50
    } else {
      s = s.replace(/\./g, ''); // 14.999 -> 14999
    }
    const n = parseFloat(s);
    return isNaN(n) ? NaN : n;
  }

  function formatARS(num) {
    if (isNaN(num)) return '';
    return num.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' });
  }

  // ---------------- crear/actualizar un bloque visual ----------------
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
    // si ya existe uno justo después (mismo target), lo reemplazamos
    const next = targetNode.nextElementSibling;
    if (next && next.matches && next.matches('.precio-transferencia')) {
      next.replaceWith(transferNode);
    } else {
      targetNode.insertAdjacentElement('afterend', transferNode);
    }
  }

  // ---------------- procesamiento de LISTADO (múltiples productos) ----------------
  function processProductList() {
    const products = document.querySelectorAll('.block-products-feed__product');
    if (!products || !products.length) return;
    products.forEach(product => {
      try {
        const priceContainer = product.querySelector('.block-products-feed__product-price');
        if (!priceContainer) return;

        // clonamos y sacamos <del> para quedarnos solo con el precio mostrado
        const clone = priceContainer.cloneNode(true);
        const delTag = clone.querySelector && clone.querySelector('del');
        if (delTag) delTag.remove();

        const raw = clone.textContent || '';
        const priceNum = parsePriceString(raw);
        if (isNaN(priceNum)) return;

        const transferencia = priceNum * DISCOUNT_FACTOR;

        const info = createTransferNode();
        info.textContent = `${formatARS(transferencia)} (con transferencia)`;

        // insertarlo una sola vez
        targetNode.insertAdjacentElement('beforebegin', transferNode);
      } catch (e) {
        // fail silently por si hay productos con estructura distinta
        console.warn('proc list error', e);
      }
    });
  }

  // ---------------- procesamiento FICHA de producto (single) ----------------
  function findBestPriceNodeSingle() {
    // 1) intentamos selectores frecuentes
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

    // 2) fallback general: buscar nodo cercano al "Agregar al carrito"
    const addBtn = Array.from(document.querySelectorAll('button, input, a')).find(n => {
      const t = (n.textContent || n.value || '').trim().toLowerCase();
      return /agregar al carrito|agregar al carrito/i.test(t) || /agregar al carrito/i.test(t);
    });

    // buscar nodos que contengan un patrón de precio
    const candidates = Array.from(document.querySelectorAll('div, span, p, h1,h2,h3')).filter(n => {
      const txt = (n.textContent || '').trim();
      return /\$\s*[\d\.,]+/.test(txt);
    });

    if (!candidates.length) return null;
    if (!addBtn) {
      // si no hay boton "Agregar", retornamos el primer candidato razonable
      return candidates[0];
    }

    // elegimos el candidato con menor distancia DOM al boton
    function ancestors(node) {
      const arr = [];
      let cur = node;
      while (cur) {
        arr.push(cur);
        cur = cur.parentElement;
      }
      return arr;
    }
    const addAnc = ancestors(addBtn);
    let best = candidates[0];
    let bestDistance = Infinity;
    candidates.forEach(cand => {
      const candAnc = ancestors(cand);
      // encontrar LCA
      let i = 0;
      while (i < candAnc.length && i < addAnc.length && candAnc[candAnc.length - 1 - i] === addAnc[addAnc.length - 1 - i]) {
        i++;
      }
      const dist = (candAnc.length - i) + (addAnc.length - i);
      if (dist < bestDistance) {
        bestDistance = dist;
        best = cand;
      }
    });
    return best;
  }

  function processSingleProduct() {
    const priceNode = findBestPriceNodeSingle();
    if (!priceNode) return;
    // clonamos y removemos <del> si existe
    const clone = priceNode.cloneNode(true);
    const del = clone.querySelector && clone.querySelector('del');
    if (del) del.remove();
    const rawText = clone.textContent || '';
    const priceNum = parsePriceString(rawText);
    if (isNaN(priceNum)) return;

    const transferencia = priceNum * DISCOUNT_FACTOR;

    // crear nodo y colocarlo después del priceNode
    const info = createTransferNode();
    info.textContent = `${formatARS(transferencia)} con transferencia`;

    ensureInsertAfter(priceNode, info);
  }

  // ---------------- observador + debounce ----------------
  let debounceTimer = null;
  function scheduleAllProcessing() {
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      processProductList();
      processSingleProduct();
    }, DEBOUNCE_MS);
  }

  // ejecutar al inicio
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', scheduleAllProcessing);
  } else {
    scheduleAllProcessing();
  }

  // observador general: si el DOM cambia (variaciones), re-procesamos
  const mo = new MutationObserver((mutations) => {
    let shouldRun = false;
    for (const m of mutations) {
      // si se agregan nodos nuevos o cambia texto, consideramos actualizar
      if (m.addedNodes && m.addedNodes.length) {
        shouldRun = true;
        break;
      }
      if (m.type === 'characterData') {
        shouldRun = true;
        break;
      }
    }
    if (shouldRun) scheduleAllProcessing();
  });
  mo.observe(document.body, { childList: true, subtree: true, characterData: true });

  // además escuchar interacciones del usuario (selects, clicks) que suelen cambiar variante
  ['change', 'click'].forEach(evt => {
    document.addEventListener(evt, function (e) {
      // filtramos un poco: si el evento viene de un select, input radio o elemento dentro de opciones de variantes
      const t = e.target;
      const tag = t && t.tagName ? t.tagName.toLowerCase() : '';
      if (tag === 'select' || tag === 'input' || t.closest && t.closest('.product-options, .product-variants, .variant, .product-attribute, .product-form')) {
        scheduleAllProcessing();
      } else {
        // igualmente, para seguridad ejecutamos si el click fue sobre un elemento que contiene precio (poco costoso)
        if (t && (t.textContent || '').indexOf('$') !== -1) scheduleAllProcessing();
      }
    }, { passive: true });
  });

  // run again por si algo carga lento
  setTimeout(scheduleAllProcessing, 800);
  setTimeout(scheduleAllProcessing, 2000);
})();