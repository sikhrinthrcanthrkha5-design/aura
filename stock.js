/* Inventory / Stock management – localStorage */
const STOCK_KEY = 'aura_stock';
const STOCK_THRESHOLD_KEY = 'aura_stock_threshold';
const STOCK_ALERT_DISMISS_KEY = 'aura_stock_alert_dismiss';

const DEFAULT_STOCK = {
  p01: 15, p02: 40, p03: 25, p04: 50, p05: 45,
  p06: 20, p07: 60, p08: 35, p09: 30, p10: 55,
  p11: 40, p12: 50, p13: 70, p14: 65, p15: 28,
  p16: 48, p17: 55, p18: 42, p19: 38,
  p20: 30, p21: 31, p22: 32, p23: 33, p24: 34, p25: 35, p26: 36, p27: 37, p28: 38, p29: 39, p30: 40, p31: 41, p32: 42, p33: 43, p34: 44, p35: 45, p36: 46, p37: 47, p38: 48, p39: 49, p40: 30, p41: 31, p42: 32, p43: 33, p44: 34, p45: 35, p46: 36, p47: 37, p48: 38, p49: 39, p50: 40, p51: 41, p52: 42, p53: 43, p54: 44, p55: 45, p56: 46, p57: 47, p58: 48, p59: 49, p60: 30, p61: 31, p62: 32, p63: 33, p64: 34
};

function getStockThreshold() {
  const v = parseInt(localStorage.getItem(STOCK_THRESHOLD_KEY), 10);
  return isNaN(v) || v < 0 ? 5 : v;
}

function setStockThreshold(n) {
  const v = Math.max(0, parseInt(n, 10) || 0);
  localStorage.setItem(STOCK_THRESHOLD_KEY, String(v));
  return v;
}

function getAllStock() {
  try {
    const stored = JSON.parse(localStorage.getItem(STOCK_KEY) || '{}');
    return Object.assign({}, DEFAULT_STOCK, stored);
  } catch {
    return Object.assign({}, DEFAULT_STOCK);
  }
}

function getStock(id) {
  const all = getAllStock();
  return typeof all[id] === 'number' ? all[id] : 0;
}

function setStock(id, qty) {
  const all = getAllStock();
  all[id] = Math.max(0, parseInt(qty, 10) || 0);
  localStorage.setItem(STOCK_KEY, JSON.stringify(all));
  // clear dismiss so new low-stock alerts show
  localStorage.removeItem(STOCK_ALERT_DISMISS_KEY);
  return all[id];
}

function setAllStock(map) {
  localStorage.setItem(STOCK_KEY, JSON.stringify(map));
  localStorage.removeItem(STOCK_ALERT_DISMISS_KEY);
}

function decreaseStockForOrder(items) {
  const all = getAllStock();
  for (let i = 0; i < items.length; i++) {
    const it = items[i];
    const have = typeof all[it.id] === 'number' ? all[it.id] : 0;
    if (have < it.qty) return { ok: false, id: it.id, have: have, need: it.qty };
  }
  for (let i = 0; i < items.length; i++) {
    const it = items[i];
    all[it.id] = (all[it.id] || 0) - it.qty;
  }
  setAllStock(all);
  return { ok: true };
}

function stockLabel(qty) {
  const threshold = getStockThreshold();
  if (qty <= 0) return { text: 'หมดสต็อก', cls: 'stock-out' };
  if (qty <= threshold) return { text: 'เหลือ ' + qty + ' ชิ้น', cls: 'stock-low' };
  return { text: 'คงเหลือ ' + qty + ' ชิ้น', cls: 'stock-ok' };
}

/** List products that are low or out of stock */
function getLowStockItems(productMap) {
  const threshold = getStockThreshold();
  const all = getAllStock();
  const items = [];
  const ids = productMap ? Object.keys(productMap) : Object.keys(all);
  ids.forEach(function(id) {
    const qty = typeof all[id] === 'number' ? all[id] : 0;
    if (qty <= threshold) {
      const p = productMap && productMap[id];
      items.push({
        id: id,
        qty: qty,
        name: p ? (p.name_th || p.name || id) : id,
        image: p ? p.image : '',
        out: qty <= 0
      });
    }
  });
  items.sort(function(a, b) { return a.qty - b.qty; });
  return items;
}

function isStockAlertDismissed() {
  return localStorage.getItem(STOCK_ALERT_DISMISS_KEY) === '1';
}

function dismissStockAlert() {
  localStorage.setItem(STOCK_ALERT_DISMISS_KEY, '1');
}

function clearStockAlertDismiss() {
  localStorage.removeItem(STOCK_ALERT_DISMISS_KEY);
}

function refreshStockBadges() {
  document.querySelectorAll('.product-card[data-id]').forEach(function(card) {
    const id = card.getAttribute('data-id');
    const qty = getStock(id);
    const info = stockLabel(qty);
    let badge = card.querySelector('.stock-badge');
    if (!badge) {
      badge = document.createElement('span');
      badge.className = 'stock-badge';
      const body = card.querySelector('.product-body');
      if (body) body.insertBefore(badge, body.querySelector('.product-actions') || null);
    }
    badge.className = 'stock-badge ' + info.cls;
    badge.textContent = info.text;

    const btn = card.querySelector('.btn-cart');
    if (btn) {
      if (qty <= 0) {
        btn.disabled = true;
        btn.textContent = 'หมดสต็อก';
        btn.style.opacity = '0.5';
        btn.style.cursor = 'not-allowed';
      } else {
        btn.disabled = false;
        btn.style.opacity = '';
        btn.style.cursor = '';
        if (btn.textContent === 'หมดสต็อก') {
          const lang = localStorage.getItem('aura_lang') || 'th';
          btn.textContent = lang === 'en' ? 'Add to Cart' : 'ใส่ตะกร้า';
        }
      }
    }
  });
}


/* ========== Auto low-stock notifications ========== */
const STOCK_AUTO_NOTIFY_KEY = 'aura_stock_auto_notify';
const STOCK_NOTIFY_INTERVAL_KEY = 'aura_stock_notify_interval';
const STOCK_LAST_NOTIFY_KEY = 'aura_stock_last_notify';
const STOCK_NOTIFIED_IDS_KEY = 'aura_stock_notified_ids';

function isAutoNotifyEnabled() {
  const v = localStorage.getItem(STOCK_AUTO_NOTIFY_KEY);
  return v === null ? true : v === '1'; // default ON
}

function setAutoNotifyEnabled(on) {
  localStorage.setItem(STOCK_AUTO_NOTIFY_KEY, on ? '1' : '0');
}

/** Interval in minutes */
function getNotifyInterval() {
  const v = parseInt(localStorage.getItem(STOCK_NOTIFY_INTERVAL_KEY), 10);
  return isNaN(v) || v < 1 ? 30 : v;
}

function setNotifyInterval(mins) {
  const v = Math.max(1, Math.min(1440, parseInt(mins, 10) || 30));
  localStorage.setItem(STOCK_NOTIFY_INTERVAL_KEY, String(v));
  return v;
}

function getNotifiedIds() {
  try {
    return JSON.parse(localStorage.getItem(STOCK_NOTIFIED_IDS_KEY) || '[]');
  } catch { return []; }
}

function setNotifiedIds(ids) {
  localStorage.setItem(STOCK_NOTIFIED_IDS_KEY, JSON.stringify(ids));
}

async function requestNotifyPermission() {
  if (!('Notification' in window)) return 'unsupported';
  if (Notification.permission === 'granted') return 'granted';
  if (Notification.permission === 'denied') return 'denied';
  const result = await Notification.requestPermission();
  return result;
}

function showBrowserNotification(title, body, tag) {
  if (!('Notification' in window) || Notification.permission !== 'granted') return false;
  try {
    const n = new Notification(title, {
      body: body,
      icon: 'image/logo.png',
      tag: tag || 'aura-stock',
      requireInteraction: false
    });
    n.onclick = function() {
      window.focus();
      n.close();
    };
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Check low stock and send browser notification if needed.
 * - Only notifies for items newly low or still low after interval
 * - productMap optional (PRODUCTS from admin)
 */
function runAutoStockCheck(productMap) {
  if (!isAutoNotifyEnabled()) return { sent: false, reason: 'disabled' };
  if (!('Notification' in window) || Notification.permission !== 'granted') {
    return { sent: false, reason: 'no_permission' };
  }

  const items = getLowStockItems(productMap || null);
  if (!items.length) {
    setNotifiedIds([]);
    return { sent: false, reason: 'ok' };
  }

  const intervalMs = getNotifyInterval() * 60 * 1000;
  const last = parseInt(localStorage.getItem(STOCK_LAST_NOTIFY_KEY) || '0', 10);
  const prevIds = getNotifiedIds();
  const currentIds = items.map(function(x) { return x.id; });
  const newIds = currentIds.filter(function(id) { return prevIds.indexOf(id) === -1; });
  const hasNew = newIds.length > 0;
  const intervalPassed = Date.now() - last >= intervalMs;

  if (!hasNew && !intervalPassed) {
    return { sent: false, reason: 'cooldown' };
  }

  const out = items.filter(function(x) { return x.out; });
  const low = items.filter(function(x) { return !x.out; });
  let body = '';
  if (out.length) body += out.length + ' รายการหมดสต็อก';
  if (low.length) body += (body ? ' · ' : '') + low.length + ' รายการใกล้หมด';
  body += '\nเกณฑ์ ≤ ' + getStockThreshold() + ' ชิ้น';
  const names = items.slice(0, 3).map(function(x) { return x.name; }).join(', ');
  if (names) body += '\n' + names + (items.length > 3 ? '…' : '');

  const ok = showBrowserNotification('⚠️ Aura Beauty · สต็อกต่ำ', body, 'aura-stock-' + Date.now());
  if (ok) {
    localStorage.setItem(STOCK_LAST_NOTIFY_KEY, String(Date.now()));
    setNotifiedIds(currentIds);
  }
  return { sent: ok, count: items.length };
}

let _stockNotifyTimer = null;

function startAutoStockMonitor(productMap, intervalMinutes) {
  stopAutoStockMonitor();
  if (!isAutoNotifyEnabled()) return;
  // Check soon after start, then on interval
  setTimeout(function() { runAutoStockCheck(productMap); }, 2500);
  const ms = (intervalMinutes || getNotifyInterval()) * 60 * 1000;
  _stockNotifyTimer = setInterval(function() {
    runAutoStockCheck(productMap);
  }, ms);
}

function stopAutoStockMonitor() {
  if (_stockNotifyTimer) {
    clearInterval(_stockNotifyTimer);
    _stockNotifyTimer = null;
  }
}

document.addEventListener('DOMContentLoaded', function() {
  refreshStockBadges();
});
