/* Shopping Cart + Payment – localStorage */
const CART_KEY = 'aura_cart';
const ORDER_KEY = 'aura_last_order';
const ORDERS_KEY = 'aura_orders';

function getCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY)) || [];
  } catch {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartBadge();
}

function addToCart(item) {
  const lang = localStorage.getItem('aura_lang') || 'th';
  const stock = typeof getStock === 'function' ? getStock(item.id) : 999;
  if (stock <= 0) {
    showToast(lang === 'en' ? 'Out of stock' : 'สินค้าหมดสต็อก');
    return;
  }
  const cart = getCart();
  const existing = cart.find(c => c.id === item.id);
  const newQty = existing ? existing.qty + 1 : 1;
  if (newQty > stock) {
    showToast(lang === 'en' ? 'Only ' + stock + ' left in stock' : 'เหลือในสต็อกเพียง ' + stock + ' ชิ้น');
    return;
  }
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push(Object.assign({}, item, { qty: 1 }));
  }
  saveCart(cart);
  showToast((lang === 'en' ? 'Added to cart: ' : 'เพิ่มลงตะกร้าแล้ว: ') + item.name);
}

function removeFromCart(id) {
  saveCart(getCart().filter(c => c.id !== id));
  renderCartPage();
}

function setQty(id, qty) {
  const cart = getCart();
  const item = cart.find(c => c.id === id);
  if (!item) return;
  const stock = typeof getStock === 'function' ? getStock(id) : 999;
  if (qty > stock) {
    showToast('เหลือในสต็อกเพียง ' + stock + ' ชิ้น');
    item.qty = Math.max(1, stock);
  } else {
    item.qty = Math.max(1, qty);
  }
  saveCart(cart);
  renderCartPage();
}

function clearCart() {
  saveCart([]);
  renderCartPage();
}

function cartTotal() {
  return getCart().reduce((sum, c) => sum + c.price * c.qty, 0);
}

function updateCartBadge() {
  const count = getCart().reduce((s, c) => s + c.qty, 0);
  document.querySelectorAll('.cart-badge').forEach(el => {
    el.textContent = count;
    el.style.display = count > 0 ? 'flex' : 'none';
  });
}

function showToast(msg) {
  let t = document.getElementById('aura-toast');
  if (!t) {
    t = document.createElement('div');
    t.id = 'aura-toast';
    t.className = 'aura-toast';
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2200);
}

function renderCartPage() {
  const container = document.getElementById('cartItems');
  const empty = document.getElementById('cartEmpty');
  const summary = document.getElementById('cartSummary');
  if (!container) return;

  const cart = getCart();
  if (cart.length === 0) {
    container.innerHTML = '';
    if (empty) empty.style.display = 'block';
    if (summary) summary.style.display = 'none';
    return;
  }
  if (empty) empty.style.display = 'none';
  if (summary) summary.style.display = 'block';

  container.innerHTML = cart.map(c => `
    <div class="cart-item">
      <img src="${c.image}" alt="${c.name}" class="cart-item-img" />
      <div class="cart-item-info">
        <h3>${c.name}</h3>
        <p class="cart-item-price">฿${c.price.toLocaleString()}</p>
      </div>
      <div class="cart-item-qty">
        <button type="button" onclick="setQty('${c.id}', ${c.qty - 1})">−</button>
        <span>${c.qty}</span>
        <button type="button" onclick="setQty('${c.id}', ${c.qty + 1})">+</button>
      </div>
      <div class="cart-item-sub">฿${(c.price * c.qty).toLocaleString()}</div>
      <button type="button" class="cart-item-remove" onclick="removeFromCart('${c.id}')" aria-label="Remove">×</button>
    </div>
  `).join('');

  const total = cartTotal();
  const totalEl = document.getElementById('cartTotalAmount');
  if (totalEl) totalEl.textContent = '฿' + total.toLocaleString();
  const payAmt = document.getElementById('payBtnAmount');
  if (payAmt) payAmt.textContent = total.toLocaleString();
}

function generateOrderId() {
  const d = new Date();
  const date = d.toISOString().slice(0, 10).replace(/-/g, '');
  const rand = String(Math.floor(Math.random() * 9000) + 1000);
  return 'AB' + date + rand;
}

function processPayment(e) {
  e.preventDefault();
  const cart = getCart();
  if (!cart.length) {
    alert('ตะกร้าว่าง');
    return;
  }

  const name = document.getElementById('orderName').value.trim();
  const phone = document.getElementById('orderPhone').value.trim();
  const email = (document.getElementById('orderEmail') && document.getElementById('orderEmail').value.trim()) || '';
  const address = document.getElementById('orderAddress').value.trim();
  const note = (document.getElementById('orderNote') && document.getElementById('orderNote').value.trim()) || '';
  const methodEl = document.querySelector('input[name="payMethod"]:checked');
  const method = methodEl ? methodEl.value : 'promptpay';

  if (!name || !phone || !address) {
    alert('กรุณากรอกข้อมูลให้ครบ');
    return;
  }

  const btn = document.getElementById('payBtn');
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = method === 'cod' ? 'กำลังยืนยันออเดอร์...' : 'กำลังดำเนินการ...';
  }

  setTimeout(function() {
    // Stock check & decrease
    if (typeof decreaseStockForOrder === 'function') {
      const result = decreaseStockForOrder(cart);
      if (!result.ok) {
        alert('สินค้าบางรายการสต็อกไม่พอ (เหลือ ' + result.have + ' ชิ้น)');
        if (btn) { btn.disabled = false; btn.innerHTML = 'ชำระเงิน ฿' + cartTotal().toLocaleString(); }
        return;
      }
    }
    const labels = { promptpay: 'PromptPay', transfer: 'โอนผ่านธนาคาร', card: 'บัตรเครดิต / เดบิต', cod: 'ชำระปลายทาง (COD)' };
    const order = {
      orderId: generateOrderId(),
      date: new Date().toISOString(),
      dateDisplay: new Date().toLocaleString('th-TH', {
        year: 'numeric', month: 'long', day: 'numeric',
        hour: '2-digit', minute: '2-digit'
      }),
      customer: { name: name, phone: phone, email: email, address: address, note: note },
      method: method,
      methodLabel: labels[method] || method,
      items: cart.map(function(c) {
        return {
          id: c.id,
          name: c.name,
          price: c.price,
          qty: c.qty,
          image: c.image,
          subtotal: c.price * c.qty
        };
      }),
      total: cartTotal(),
      status: method === 'cod' ? 'cod' : 'paid'
    };

    localStorage.setItem(ORDER_KEY, JSON.stringify(order));
    // Save to order history for admin
    try {
      var history = JSON.parse(localStorage.getItem(ORDERS_KEY) || '[]');
      if (!Array.isArray(history)) history = [];
      history.unshift(order);
      localStorage.setItem(ORDERS_KEY, JSON.stringify(history));
    } catch (err) {}
    saveCart([]);
    window.location.href = 'receipt.html';
  }, 1200);
}

document.addEventListener('DOMContentLoaded', function() {
  updateCartBadge();
  renderCartPage();
});
