/* Multi-language: Thai / English */
const I18N = {
  th: {
    nav_home: 'หน้าแรก',
    nav_about: 'เกี่ยวกับเรา',
    nav_products: 'สินค้า',
    nav_blog: 'บทความ',
    nav_contact: 'ติดต่อเรา',
    nav_cart: 'ตะกร้า',
    nav_inquiry: 'สอบถามสินค้า',
    hero_title: 'ความงามที่เปล่งประกาย',
    hero_desc: 'บริษัท ออร่า บิวตี้ จำกัด ผู้จำหน่ายเครื่องสำอางและผลิตภัณฑ์สกินแคร์คุณภาพสูง ครบทุกประเภท เพื่อผิวสวยและใบหน้าที่เปล่งปลั่งในทุกวัน',
    hero_btn_products: 'ดูสินค้าทั้งหมด',
    hero_btn_about: 'รู้จักเรา',
    cat_title: 'หมวดหมู่สินค้า',
    cat_desc: 'ครบทุกความต้องการด้านความงาม',
    why_title: 'ทำไมต้องเลือก ออร่า บิวตี้',
    cta_title: 'พร้อมเปล่งประกายความงามแล้วหรือยัง?',
    cta_desc: 'ติดต่อเราวันนี้ เพื่อรับคำแนะนำและโปรโมชั่นพิเศษจาก ออร่า บิวตี้',
    cta_btn: 'ติดต่อเราเลย',
    products_title: 'สินค้าทั้งหมด',
    search_placeholder: 'ค้นหาสินค้า...',
    filter_price: 'กรองราคา',
    price_all: 'ทุกราคา',
    price_low: 'ต่ำกว่า ฿300',
    price_mid: '฿300 – ฿800',
    price_high: 'มากกว่า ฿800',
    add_cart: 'ใส่ตะกร้า',
    inquire: 'สอบถาม',
    cart_title: 'ตะกร้าสินค้า',
    cart_empty: 'ยังไม่มีสินค้าในตะกร้า',
    cart_total: 'ยอดรวม',
    cart_checkout: 'สั่งซื้อ / สอบถาม',
    cart_clear: 'ล้างตะกร้า',
    cart_continue: 'เลือกสินค้าต่อ',
    order_note: 'กรอกข้อมูลเพื่อส่งคำสั่งซื้อ หรือแชทผ่าน Line / Shopee',
    blog_title: 'บทความ',
    blog_desc: 'เคล็ดลับแต่งหน้าและดูแลผิวจาก ออร่า บิวตี้',
    footer_rights: '© 2026 บริษัท ออร่า บิวตี้ จำกัด สงวนลิขสิทธิ์',
    shopee: 'สั่งซื้อ Shopee',
    lazada: 'สั่งซื้อ Lazada',
    line: 'แชท Line OA',
  },
  en: {
    nav_home: 'Home',
    nav_about: 'About',
    nav_products: 'Products',
    nav_blog: 'Blog',
    nav_contact: 'Contact',
    nav_cart: 'Cart',
    nav_inquiry: 'Inquiry',
    hero_title: 'Radiant Beauty',
    hero_desc: 'Aura Beauty Co., Ltd. offers premium cosmetics and skincare products of every type — for healthy skin and a glowing look every day.',
    hero_btn_products: 'Shop All',
    hero_btn_about: 'About Us',
    cat_title: 'Categories',
    cat_desc: 'Everything you need for beauty',
    why_title: 'Why Aura Beauty',
    cta_title: 'Ready to glow?',
    cta_desc: 'Contact us today for advice and exclusive offers from Aura Beauty.',
    cta_btn: 'Contact Us',
    products_title: 'All Products',
    search_placeholder: 'Search products...',
    filter_price: 'Price filter',
    price_all: 'All prices',
    price_low: 'Under ฿300',
    price_mid: '฿300 – ฿800',
    price_high: 'Over ฿800',
    add_cart: 'Add to Cart',
    inquire: 'Inquire',
    cart_title: 'Shopping Cart',
    cart_empty: 'Your cart is empty',
    cart_total: 'Total',
    cart_checkout: 'Order / Inquire',
    cart_clear: 'Clear Cart',
    cart_continue: 'Continue Shopping',
    order_note: 'Fill in your details to place an order, or chat via Line / Shopee',
    blog_title: 'Blog',
    blog_desc: 'Makeup tips and skincare advice from Aura Beauty',
    footer_rights: '© 2026 Aura Beauty Co., Ltd. All rights reserved',
    shopee: 'Buy on Shopee',
    lazada: 'Buy on Lazada',
    line: 'Chat on Line',
  }
};

let currentLang = localStorage.getItem('aura_lang') || 'th';

function setLang(lang) {
  currentLang = lang;
  localStorage.setItem('aura_lang', lang);
  document.documentElement.lang = lang === 'th' ? 'th' : 'en';
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (I18N[lang][key]) {
      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
        el.placeholder = I18N[lang][key];
      } else {
        el.textContent = I18N[lang][key];
      }
    }
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    if (I18N[lang][key]) el.placeholder = I18N[lang][key];
  });
  // Update lang toggle buttons
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === lang);
  });
  // Product names if present
  document.querySelectorAll('[data-name-th]').forEach(el => {
    el.textContent = lang === 'th' ? el.dataset.nameTh : (el.dataset.nameEn || el.dataset.nameTh);
  });
  document.querySelectorAll('[data-desc-th]').forEach(el => {
    el.textContent = lang === 'th' ? el.dataset.descTh : (el.dataset.descEn || el.dataset.descTh);
  });
}

document.addEventListener('DOMContentLoaded', () => setLang(currentLang));
