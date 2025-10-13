(function () {
  const DISCOUNT_FACTOR = 0.85; // 15% OFF por transferencia
  const DEBOUNCE_MS = 150;

  // ---------------- UTILIDADES ----------------
  function parsePriceString(str) {
    if (!str) return NaN;
    // obtener todos los precios en formato $xx.xxx,xx
    const moneyMatches = String(str).match(/\$\s*[\d\.\,]+/g);
    if (!moneyMatches) return NaN;

    // ⚠️ tomamos el SEGUNDO precio visible si existe (evita tomar "cuotas")
    const candidate = moneyMatches.length > 1
      ? moneyMatches[1]
      : moneyMatches[0];

    let s = candidate.replace(/[^0-9\.,-]+/g, "");
    if (s.includes(",") && s.includes(".")) {
      s = s.replace(/\./g, "").replace(/,/g, ".");
    } else if (s.includes(",")) {
      s = s.replace(/,/g, ".");
    } else {
      s = s.replace(/\./g, "");
    }

    const n = parseFloat(s);
    return isNaN(n) ? NaN : n;
  }

  function formatARS(num) {
    if (isNaN(num)) return '';
    return num.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' });
  }

  // ---------------- CREAR BLOQUE VISUAL ----------------
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
    if (next && next.matches('.precio-transferencia')) {
      next.replaceWith(transferNode);
    } else {
      targetNode.insertAdjacentElement('afterend', transferNode);
    }
  }

  // ---------------- PROCESAR LISTADO (catálogo) ----------------
  function processProductList() {
    const products = document.querySelectorAll('.block-products-feed__product');
    products.forEach(product => {
      try {
        const priceContainer = product.querySelector('.block-products-feed__product-price');
        if (!priceContainer) return;

        // eliminar precios tachados
        const clone = priceContainer.cloneNode(true);
        const delTag = clone.querySelector('del');
        if (delTag) delTag.remove();

        const raw = clone.textContent || '';
        const priceNum = parsePriceString(raw);
        if (isNaN(priceNum)) return;

        const transferencia = priceNum * DISCOUNT_FACTOR;

        const info = createTransferNode();
        info.textContent = `${formatARS(transferencia)} con transferencia`;

        ensureInsertAfter(priceContainer, info);
      } catch (e) {
        console.warn('Error en processProductList', e);
      }
    });
  }

  // ---------------- PROCESAR FICHA (página del producto) ----------------
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

    // fallback: busca cerca del botón "Agregar al carrito"
    const addBtn = Array.from(document.querySelectorAll('button, a')).find(n =>
      /agregar al carrito/i.test(n.textContent || '')
    );

    const candidates = Array.from(document.querySelectorAll('div, span, p, h1, h2, h3')).filter(n =>
      /\$\s*[\d\.,]+/.test(n.textContent || '')
    );

    if (!candidates.length) return null;
    if (!addBtn) return candidates[0];

    // seleccionar el más cercano al botón
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
      let i = 0;
      while (
        i < candAnc.length &&
        i < addAnc.length &&
        candAnc[candAnc.length - 1 - i] === addAnc[addAnc.length - 1 - i]
      ) {
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

    // eliminar <del> si existe
    const clone = priceNode.cloneNode(true);
    const del = clone.querySelector('del');
    if (del) del.remove();

    const rawText = clone.textContent || '';
    const priceNum = parsePriceString(rawText);
    if (isNaN(priceNum)) return;

    const transferencia = priceNum * DISCOUNT_FACTOR;

    // crear o actualizar el nodo
    let info = document.querySelector('.precio-transferencia');
    if (!info) {
      info = createTransferNode();
      priceNode.insertAdjacentElement('afterend', info);
    }

    info.textContent = `${formatARS(transferencia)} con transferencia`;
  }

  // ---------------- EJECUCIÓN Y OBSERVADORES ----------------
  function scheduleAllProcessing() {
    processProductList();
    processSingleProduct();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', scheduleAllProcessing);
  } else {
    scheduleAllProcessing();
  }

  // Observador persistente (detecta cambios dinámicos)
  const mo = new MutationObserver(() => {
    scheduleAllProcessing();
  });

  mo.observe(document.body, { childList: true, subtree: true, characterData: true });

  // Reintenta cada 2 segundos (por si Empretienda actualiza dinámicamente)
  setInterval(scheduleAllProcessing, 2000);
})();
