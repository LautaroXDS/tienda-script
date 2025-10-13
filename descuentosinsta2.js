(function () {
  const DISCOUNT_FACTOR = 0.85; // 15% OFF
  const DEBOUNCE_MS = 120;
  const SKIP_KEYWORDS = /cuota|cuotas|sin interes|sin interés|interes|interés|c/u;

  function pickNonCuotaMatchFromHtml(html) {
    if (!html) return null;
    const re = /\$\s*[\d\.\,]+/g;
    const matches = [];
    let m;
    while ((m = re.exec(html)) !== null) {
      const idx = m.index;
      const start = Math.max(0, idx - 80);
      const context = html.substring(start, Math.min(html.length, idx + 80));
      matches.push({ text: m[0], index: idx, context });
    }
    if (!matches.length) return null;
    // buscar de derecha a izquierda el primer match que NO tenga keywords de cuota en su context
    for (let i = matches.length - 1; i >= 0; i--) {
      const ctx = matches[i].context || '';
      if (!SKIP_KEYWORDS.test(ctx)) {
        return matches[i].text;
      }
    }
    // fallback: si todos están relacionados a cuotas, devolvemos el penúltimo si existe, sino el último
    if (matches.length >= 2) return matches[matches.length - 2].text;
    return matches[matches.length - 1].text;
  }

  function parsePriceString(str) {
    if (!str) return NaN;
    let s = String(str).replace(/[^0-9\.,-]+/g, "");
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

  function safeInsertAfter(targetNode, nodeToInsert) {
    if (!targetNode || !targetNode.parentNode) {
      // fallback: intentar insertar en body al inicio (no ideal)
      document.body.insertAdjacentElement('afterbegin', nodeToInsert);
      return;
    }
    const next = targetNode.nextElementSibling;
    if (next && next.matches && next.matches('.precio-transferencia')) {
      next.replaceWith(nodeToInsert);
    } else {
      targetNode.insertAdjacentElement('afterend', nodeToInsert);
    }
  }

  // ---- listado ----
  function processProductList() {
    const products = document.querySelectorAll('.block-products-feed__product');
    if (!products || !products.length) return;
    products.forEach(product => {
      try {
        const priceContainer = product.querySelector('.block-products-feed__product-price');
        const media = product.querySelector('.block-products-feed__product-media');

        if (!priceContainer) return;

        // tomamos innerHTML del contenedor (para detectar contexto de cuotas)
        const html = priceContainer.innerHTML || priceContainer.textContent || '';
        const pick = pickNonCuotaMatchFromHtml(html);
        if (!pick) return;
        const priceNum = parsePriceString(pick);
        if (isNaN(priceNum)) return;

        const transferencia = priceNum * DISCOUNT_FACTOR;
        const info = createTransferNode();
        info.textContent = `${formatARS(transferencia)} (con transferencia)`;

        // insertar preferentemente después de la media (imagen). Si no existe la media, lo hacemos junto al precio
        if (media) {
          const next = media.nextElementSibling;
          if (next && next.matches && next.matches('.precio-transferencia')) next.replaceWith(info);
          else media.insertAdjacentElement('afterend', info);
        } else {
          safeInsertAfter(priceContainer, info);
        }
      } catch (e) {
        console.warn('error proceso producto listado', e);
      }
    });
  }

  // ---- ficha single ----
  function findPriceContainerForSingle() {
    const selectors = [
      '.product__price',
      '.product-price',
      '.product-detail-price',
      '.product-page-price',
      '.product_price',
      '.price',
      '.product-info .price',
      '.product-info'
    ];
    for (const s of selectors) {
      const el = document.querySelector(s);
      if (el && /\$/.test(el.textContent)) return el;
    }
    // fallback: primer nodo con $ visible
    const candidates = Array.from(document.querySelectorAll('div, span, p, h1,h2,h3')).filter(n => /\$\s*[\d\.,]+/.test(n.textContent || ''));
    return candidates.length ? candidates[0] : null;
  }

  function processSingleProduct() {
    const priceNode = findPriceContainerForSingle();
    if (!priceNode) return;

    const html = priceNode.innerHTML || priceNode.textContent || '';
    const pick = pickNonCuotaMatchFromHtml(html);
    if (!pick) return;
    const priceNum = parsePriceString(pick);
    if (isNaN(priceNum)) return;

    const transferencia = priceNum * DISCOUNT_FACTOR;
    const info = createTransferNode();
    info.textContent = `${formatARS(transferencia)} con transferencia`;

    safeInsertAfter(priceNode, info);
  }

  // debounce + observer
  let timer = null;
  function schedule() {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      processProductList();
      processSingleProduct();
    }, DEBOUNCE_MS);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', schedule);
  else schedule();

  const mo = new MutationObserver((mutations) => {
    let run = false;
    for (const m of mutations) {
      if (m.addedNodes && m.addedNodes.length) { run = true; break; }
      if (m.type === 'characterData') { run = true; break; }
    }
    if (run) schedule();
  });
  mo.observe(document.body, { childList: true, subtree: true, characterData: true });

  ['change','click'].forEach(evt => {
    document.addEventListener(evt, function(e){
      const t = e.target;
      const tag = t && t.tagName ? t.tagName.toLowerCase() : '';
      if (tag === 'select' || tag === 'input' || (t.closest && t.closest('.product-options, .product-variants, .variant, .product-attribute, .product-form'))) {
        schedule();
      } else {
        if (t && (t.textContent || '').indexOf('$') !== -1) schedule();
      }
    }, {passive:true});
  });

  // reintentos
  setTimeout(schedule, 700);
  setTimeout(schedule, 2000);
})();
