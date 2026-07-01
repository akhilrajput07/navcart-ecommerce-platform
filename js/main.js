const defaultProducts = [
  {id:1,name:'Wireless Noise Cancelling Headphones',category:'electronics',categoryName:'Electronics',price:2499,originalPrice:4999,image:'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop',stock:45,rating:4.8,reviews:2341,badge:'-50%',views:1240},
  {id:2,name:'Premium Smart Watch Pro',category:'electronics',categoryName:'Electronics',price:3999,originalPrice:7999,image:'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop',stock:32,rating:4.6,reviews:1856,badge:'-50%',views:980},
  {id:3,name:'Designer Cotton T-Shirt',category:'fashion',categoryName:'Fashion',price:599,originalPrice:1299,image:'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop',stock:120,rating:4.4,reviews:987,badge:'-54%',views:750},
  {id:4,name:'Portable Bluetooth Speaker',category:'electronics',categoryName:'Electronics',price:1499,originalPrice:2999,image:'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400&h=400&fit=crop',stock:67,rating:4.7,reviews:1543,badge:'-50%',views:890},
  {id:5,name:'Professional Yoga Mat',category:'sports',categoryName:'Sports',price:899,originalPrice:1799,image:'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=400&h=400&fit=crop',stock:55,rating:4.5,reviews:765,badge:'-50%',views:620},
  {id:6,name:'Modern LED Desk Lamp',category:'home',categoryName:'Home',price:1299,originalPrice:2499,image:'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400&h=400&fit=crop',stock:38,rating:4.9,reviews:2109,badge:'-48%',views:1100},
  {id:7,name:'Running Shoes Ultra',category:'sports',categoryName:'Sports',price:2999,originalPrice:5999,image:'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop',stock:28,rating:4.7,reviews:3421,badge:'-50%',views:1350},
  {id:8,name:'Organic Skincare Set',category:'beauty',categoryName:'Beauty',price:999,originalPrice:1999,image:'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&h=400&fit=crop',stock:72,rating:4.6,reviews:1123,badge:'-50%',views:580}
];

function getProducts(){let s=localStorage.getItem('navcart_products');if(!s){localStorage.setItem('navcart_products',JSON.stringify(defaultProducts));return[...defaultProducts]}return JSON.parse(s)}
function setProducts(list){localStorage.setItem('navcart_products',JSON.stringify(list))}
function getAnalytics(){return JSON.parse(localStorage.getItem('navcart_analytics')||'[]')}
function trackEvent(name,data={}){let a=getAnalytics();a.push({event:name,data:data||{},time:Date.now()});localStorage.setItem('navcart_analytics',JSON.stringify(a))}
function getOrders(){return JSON.parse(localStorage.getItem('navcart_orders')||'[]')}
function saveOrders(o){localStorage.setItem('navcart_orders',JSON.stringify(o))}

function getDashboardStats(){
  const orders=getOrders(),products=getProducts(),sales=orders.reduce((s,o)=>s+(o.total||0),0);
  return{totalSales:orders.length,totalRevenue:sales,totalProducts:products.length,totalOrders:orders.length,totalCustomers:new Set(orders.map(o=>o.customer?.email||'guest')).size,lowStock:products.filter(p=>p.stock<10).length,recentOrders:orders.slice(-5).reverse()}
}

function trackView(pid){let h=JSON.parse(localStorage.getItem('navcart_history')||'[]');h=h.filter(id=>id!==pid);h.unshift(pid);if(h.length>12)h.pop();localStorage.setItem('navcart_history',JSON.stringify(h));trackEvent('product_view',{pid})}
function getRecommendations(){let all=getProducts(),history=JSON.parse(localStorage.getItem('navcart_history')||'[]'),cartIds=(JSON.parse(localStorage.getItem('navcart')||'[]')).map(c=>c.id),prefers=[...new Set([...history,...cartIds])];if(!prefers.length)return all.slice(0,4);return all.map(p=>({...p,score:(p.views||0)+(prefers.includes(p.id)?50:0)+(history.includes(p.id)?30:0)+(cartIds.includes(p.id)?20:0)})).sort((a,b)=>b.score-a.score).slice(0,4)}
function getTrending(){return getProducts().sort((a,b)=>(b.views||0)-(a.views||0)).slice(0,4)}
function getRecentlyViewed(){let h=JSON.parse(localStorage.getItem('navcart_history')||'[]');let all=getProducts();return h.slice(0,5).map(id=>all.find(p=>p.id===id)).filter(Boolean)}

// ===== CART =====
let cart=JSON.parse(localStorage.getItem('navcart'))||[];
function saveCart(){localStorage.setItem('navcart',JSON.stringify(cart));updateCartCount()}
function updateCartCount(){const count=cart.reduce((s,i)=>s+i.quantity,0);document.querySelectorAll('.cart-badge,.cart-count').forEach(b=>{b.textContent=count;b.style.display=count>0?'flex':'none'})}
function addToCart(pid){const p=getProducts().find(x=>x.id===pid);if(!p||p.stock<=0){showToast('Out of Stock','This product is unavailable.','error');return}const e=cart.find(i=>i.id===pid);if(e)e.quantity++;else cart.push({id:p.id,name:p.name,price:p.price,image:p.image,quantity:1});

function removeFromCart(pid){cart=cart.filter(i=>i.id!==pid);saveCart();if(typeof loadCartPage==='function')loadCartPage();showToast('Removed','Item removed.','warning')}
function updateQuantity(pid,change){const item=cart.find(i=>i.id===pid);if(!item)return;item.quantity+=change;if(item.quantity<=0){removeFromCart(pid);return}saveCart();if(typeof loadCartPage==='function')loadCartPage()}

function placeOrder(info) {
  if (!cart.length) return false;

  // FIXME: Temporary frontend checkout. Replace with Stripe/Razorpay backend API integration later.
  const orders = getOrders();
  const total = cart.reduce((s, i) => s + (i.price * i.quantity), 0);
  
// ===== PRODUCT CRUD =====
function addProduct(d){const products=getProducts();const id=Math.max(...products.map(p=>p.id),0)+1;const np={id:id,name:d.name,category:d.category,categoryName:d.categoryName||d.category,price:parseInt(d.price)||0,originalPrice:parseInt(d.originalPrice)||0,stock:parseInt(d.stock)||50,image:d.image||'https://images.unsplash.com/photo-1560393464-5c69a73c5770?w=400&fit=crop',rating:4.0,reviews:0,badge:d.badge||'',views:0};products.push(np);setProducts(products);trackEvent('product_added',{id});return np}
function updateProduct(id,upd){const products=getProducts();const idx=products.findIndex(p=>p.id===id);if(idx===-1)return false;products[idx]={...products[idx],...upd};setProducts(products);return true}
function deleteProduct(id){let p=getProducts().filter(x=>x.id!==id);setProducts(p);trackEvent('product_deleted',{id});return true}

// ===== SUPPLIER CRUD =====
function getSuppliers(){return JSON.parse(localStorage.getItem('navcart_suppliers')||'[]')}
function saveSuppliers(s){localStorage.setItem('navcart_suppliers',JSON.stringify(s))}
function addSupplier(s){const list=getSuppliers();s.id=Date.now();s.status=s.status||'Active';list.push(s);saveSuppliers(list)}
function updateSupplier(id,upd){const list=getSuppliers();const idx=list.findIndex(s=>s.id==id);if(idx!==-1){list[idx]={...list[idx],...upd};saveSuppliers(list)}}
function deleteSupplier(id){saveSuppliers(getSuppliers().filter(s=>s.id!=id))}

// ===== TOAST =====
function showToast(title,msg,type='success'){let c=document.querySelector('.toast-container');if(!c){c=document.createElement('div');c.className='toast-container';document.body.appendChild(c)}const t=document.createElement('div');t.className='toast '+type;t.innerHTML='<div class="toast-icon"><i class="fas fa-'+(type==='success'?'check':type==='error'?'times':'exclamation')+'"></i></div><div class="toast-content"><div class="toast-title">'+title+'</div><div class="toast-message">'+msg+'</div></div><div class="toast-close" onclick="this.parentElement.remove()"><i class="fas fa-times"></i></div>';c.appendChild(t);setTimeout(()=>{t.style.animation='slideInRight 0.3s ease-out reverse forwards';setTimeout(()=>t.remove(),300)},4000)}

// ===== SLIDER =====
let curSlide=0,slideTimer;
function initSlider(){const slides=document.querySelectorAll('.hero-slide'),dots=document.querySelectorAll('.slider-dot');if(!slides.length)return;function show(i){slides.forEach((s,j)=>s.classList.toggle('active',j===i));dots.forEach((d,j)=>d.classList.toggle('active',j===i));curSlide=i}function next(){show((curSlide+1)%slides.length)}function prev(){show((curSlide-1+slides.length)%slides.length)}slideTimer=setInterval(next,5000);const slider=document.querySelector('.hero-slider');if(slider){slider.addEventListener('mouseenter',()=>clearInterval(slideTimer));slider.addEventListener('mouseleave',()=>{slideTimer=setInterval(next,5000)})}window.nextSlide=next;window.prevSlide=prev;window.goToSlide=show}

// ===== MOBILE MENU =====
function toggleMobileMenu(){const m=document.getElementById('mobileMenu'),o=document.querySelector('.mobile-menu-overlay'),t=document.querySelector('.mobile-menu-toggle');m&&m.classList.toggle('open');o&&o.classList.toggle('open');t&&t.classList.toggle('active');document.body.style.overflow=(m&&m.classList.contains('open'))?'hidden':''}

// ===== SEARCH =====
function searchProducts(){const q=document.getElementById('searchInput')?.value.trim();if(q)window.location.href='products.html?search='+encodeURIComponent(q)}

// ===== RENDER =====
function renderStars(r){const f=Math.floor(r),h=r%1>=0.5;let html='';for(let i=0;i<f;i++)html+='<i class="fas fa-star"></i>';if(h)html+='<i class="fas fa-star-half-alt"></i>';return html}
function renderPrice(p){return'<span class="current-price">\u20B9'+p.price.toLocaleString()+'</span><span class="original-price">\u20B9'+p.originalPrice.toLocaleString()+'</span>'+(p.badge?'<span class="discount-badge">'+p.badge+'</span>':'')}
function productCardHTML(p){return`<div class="product-card" onclick="trackView(${p.id})"><div class="product-image"><img src="${p.image}" alt="${p.name}" loading="lazy">${p.badge?`<span class="product-badge">${p.badge}</span>`:''}<button class="product-wishlist" onclick="event.stopPropagation();toggleWishlist(${p.id})"><i class="fas fa-heart"></i></button></div><div class="product-info"><span class="product-category">${p.categoryName}</span><h3 class="product-name">${p.name}</h3><div class="product-rating"><div class="stars">${renderStars(p.rating)}</div><span class="rating-count">(${p.reviews?.toLocaleString()||0})</span></div><div class="product-price">${renderPrice(p)}</div><button class="add-to-cart" onclick="event.stopPropagation();addToCart(${p.id})"><i class="fas fa-cart-plus"></i> Add to Cart</button></div></div>`}

function renderProducts(id,list){const c=document.getElementById(id);if(c)c.innerHTML=list.map(productCardHTML).join('')}
function renderHorizontal(id,list){const c=document.getElementById(id);if(c)c.innerHTML=list.map(p=>`<div style="flex:0 0 280px;">${productCardHTML(p)}</div>`).join('')}

// ===== WISHLIST =====
let wishlist=JSON.parse(localStorage.getItem('navwishlist')||'[]');
function toggleWishlist(pid){const i=wishlist.indexOf(pid);if(i>-1){wishlist.splice(i,1);showToast('Removed','Removed from wishlist.','warning')}else{wishlist.push(pid);showToast('Added','Added to wishlist!','success')}localStorage.setItem('navwishlist',JSON.stringify(wishlist))}

// ===== COUNTDOWN =====
function initCountdown(){const el=document.getElementById('countdown');if(!el)return;let h=2,m=45,s=0;setInterval(()=>{s--;if(s<0){s=59;m--;if(m<0){m=59;h--;if(h<0)h=23}}el.textContent=String(h).padStart(2,'0')+':'+String(m).padStart(2,'0')+':'+String(s).padStart(2,'0')},1000)}

// ===== SCROLL & HEADER =====
function initHeaderScroll(){const header=document.querySelector('.header');if(!header)return;window.addEventListener('scroll',()=>{header.classList.toggle('scrolled',window.scrollY>50)})}
function initScrollAnimations(){const obs=new IntersectionObserver((entries)=>{entries.forEach(e=>{if(e.isIntersecting){e.target.style.animation='fadeInUp 0.6s ease-out forwards';obs.unobserve(e.target)}})},{threshold:0.1,rootMargin:'0px 0px -50px 0px'});document.querySelectorAll('.product-card,.category-card,.trust-item').forEach(el=>{el.style.opacity='0';obs.observe(el)})}

// ===== SECURITY =====
function sanitizeInput(i){return String(i).replace(/[<>\"']/g,'')}

// ===== AUTH =====
let currentAdmin = JSON.parse(localStorage.getItem('navcart_admin_session') || 'null');
function adminLogin(username, password) {
  const users = JSON.parse(localStorage.getItem('navcart_admins') || '[{"username":"admin","password":""Nav@Admin#2026"","role":"Owner"}]');
  const user = users.find(u => u.username === username && u.password === password);
  if (user) {
    currentAdmin = {username: user.username, role: user.role, loginTime: Date.now()};
    localStorage.setItem('navcart_admin_session', JSON.stringify(currentAdmin));
    return true;
  }
  return false;
}
function adminLogout() {
  currentAdmin = null;
  localStorage.removeItem('navcart_admin_session');
}
function checkAdminAuth() {
  if (!currentAdmin) {
    const saved = JSON.parse(localStorage.getItem('navcart_admin_session') || 'null');
    if (!saved) { window.location.href = 'admin-login.html'; return false; }
    currentAdmin = saved;
  }
  return true;
}

// ===== INIT =====
document.addEventListener('DOMContentLoaded',()=>{
  updateCartCount();initSlider();initScrollAnimations();initHeaderScroll();initCountdown();
  document.getElementById('searchInput')?.addEventListener('keypress',e=>{if(e.key==='Enter')searchProducts()});
  document.querySelector('.mobile-menu-overlay')?.addEventListener('click',toggleMobileMenu);
  renderProducts('productsGrid',getProducts());
  renderProducts('flashProducts',getProducts().slice(0,4));
  renderProducts('recommendedProducts',getRecommendations());
  renderProducts('trendingProducts',getTrending());
  renderProducts('recentlyViewed',getRecentlyViewed());
});
