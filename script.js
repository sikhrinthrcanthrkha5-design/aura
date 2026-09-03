// Header scroll effect
const header = document.getElementById('header');
if (header) {
  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 20);
  });
}

// Mobile menu
const menuToggle = document.getElementById('menuToggle');
const navLinks = document.getElementById('navLinks');
if (menuToggle && navLinks) {
  menuToggle.addEventListener('click', () => {
    menuToggle.classList.toggle('open');
    navLinks.classList.toggle('open');
  });

  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      menuToggle.classList.remove('open');
      navLinks.classList.remove('open');
    });
  });
}

// Smooth pill indicator
function updateNavIndicator() {
  const indicator = document.getElementById('navIndicator');
  const links = document.querySelectorAll('.nav-links a');
  if (!indicator || !links.length) return;

  const active = document.querySelector('.nav-links a.active') || links[0];
  const parent = active.parentElement; // li
  const list = parent.parentElement; // ul

  const left = parent.offsetLeft;
  const width = parent.offsetWidth;

  indicator.style.width = width + 'px';
  indicator.style.transform = 'translateX(' + left + 'px)';
}

// Run on load and resize
window.addEventListener('load', updateNavIndicator);
window.addEventListener('resize', updateNavIndicator);

// Hover moves indicator temporarily
document.querySelectorAll('.nav-links a').forEach(link => {
  link.addEventListener('mouseenter', () => {
    const indicator = document.getElementById('navIndicator');
    if (!indicator) return;
    const parent = link.parentElement;
    indicator.style.width = parent.offsetWidth + 'px';
    indicator.style.transform = 'translateX(' + parent.offsetLeft + 'px)';
  });
});

const navList = document.getElementById('navLinks');
if (navList) {
  navList.addEventListener('mouseleave', updateNavIndicator);
}

// Product category filter
const catBtns = document.querySelectorAll('.cat-btn');
const productCards = document.querySelectorAll('.product-card[data-cat]');
const catTitle = document.getElementById('catTitle');

const catNames = {
  all: 'สินค้าทั้งหมด',
  brush: 'แปรงแต่งหน้า',
  eyeliner: 'อายไลเนอร์',
  foundation: 'รองพื้น',
  blush: 'บลัชออน',
  powder: 'แป้ง & คุชชั่น',
  lipstick: 'ลิปสติก'
};

if (catBtns.length) {
  catBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const cat = btn.dataset.cat;

      catBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      if (catTitle) catTitle.textContent = catNames[cat] || 'สินค้าทั้งหมด';

      productCards.forEach(card => {
        if (cat === 'all' || card.dataset.cat === cat) {
          card.classList.remove('hidden');
        } else {
          card.classList.add('hidden');
        }
      });
    });
  });
}


// Product search + price filter
function filterProducts() {
  const q = (document.getElementById('productSearch')?.value || '').toLowerCase().trim();
  const activePrice = document.querySelector('#priceFilter button.active')?.dataset.price || 'all';
  const activeCat = document.querySelector('.cat-btn.active')?.dataset.cat || 'all';

  document.querySelectorAll('.product-card[data-cat]').forEach(card => {
    const name = (card.dataset.name || '').toLowerCase();
    const price = parseInt(card.dataset.price, 10);
    const cat = card.dataset.cat;

    let okCat = activeCat === 'all' || cat === activeCat;
    let okSearch = !q || name.includes(q);
    let okPrice = true;
    if (activePrice === 'low') okPrice = price < 300;
    else if (activePrice === 'mid') okPrice = price >= 300 && price <= 800;
    else if (activePrice === 'high') okPrice = price > 800;

    card.classList.toggle('hidden', !(okCat && okSearch && okPrice));
  });
}

const searchInput = document.getElementById('productSearch');
if (searchInput) {
  searchInput.addEventListener('input', filterProducts);
}

document.querySelectorAll('#priceFilter button').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('#priceFilter button').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    filterProducts();
  });
});

// Hook category filter to also run product filter
document.querySelectorAll('.cat-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    setTimeout(filterProducts, 0);
  });
});
