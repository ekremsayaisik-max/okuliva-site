const header=document.querySelector('.site-header');const btn=document.querySelector('[data-menu-button]');const menu=document.querySelector('[data-menu]');if(btn&&menu){btn.addEventListener('click',()=>{const open=menu.classList.toggle('open');btn.setAttribute('aria-expanded',String(open))});menu.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>menu.classList.remove('open')))}const els=document.querySelectorAll('.reveal');if('IntersectionObserver'in window){const o=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');o.unobserve(e.target)}}),{threshold:.12});els.forEach(e=>o.observe(e))}else{els.forEach(e=>e.classList.add('visible'))}const y=document.getElementById('year');if(y)y.textContent=new Date().getFullYear();

document.querySelectorAll('[data-password-toggle]').forEach(toggle=>{
  toggle.addEventListener('click',()=>{
    const input=toggle.closest('.password-field')?.querySelector('input');
    if(!input)return;
    const show=input.type==='password';
    input.type=show?'text':'password';
    toggle.textContent=show?'Gizle':'Göster';
    toggle.setAttribute('aria-label',show?'Şifreyi gizle':'Şifreyi göster');
  });
});

document.querySelectorAll('[data-login-form]').forEach(form=>{
  form.addEventListener('submit',async event=>{
    event.preventDefault();
    const status=form.querySelector('[data-form-status]');
    const username=form.elements.username?.value.trim();
    const password=form.elements.password?.value;
    const area=form.dataset.area;
    if(status){status.className='form-status';status.textContent='';}
    if(!username||!password){
      if(status){status.classList.add('error');status.textContent='Kullanıcı adı ve şifre zorunludur.';}
      return;
    }

    const endpoint=window.OKULIVA_AUTH_ENDPOINT;
    if(!endpoint){
      if(status){status.classList.add('error');status.textContent='Güvenli giriş servisi henüz yapılandırılmadı. Kurulum için sistem yöneticinizle iletişime geçin.';}
      return;
    }

    try{
      const submit=form.querySelector('[type="submit"]');
      if(submit)submit.disabled=true;
      const response=await fetch(endpoint,{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        credentials:'include',
        body:JSON.stringify({username,password,area})
      });
      const data=await response.json().catch(()=>({}));
      if(!response.ok||!data.ok){
        const message=response.status===403?'Bu alan için hesabınızın yetkisi yok.':(data.error||'Kullanıcı adı veya şifre doğrulanamadı.');
        throw new Error(message);
      }
      if(status){status.classList.add('success');status.textContent='Giriş başarılı, yönlendiriliyorsunuz…';}
      if(data.redirectUrl)window.location.assign(data.redirectUrl);
      else throw new Error('Yönlendirme adresi bulunamadı.');
    }catch(error){
      if(status){status.classList.add('error');status.textContent=error instanceof Error?error.message:'Kullanıcı adı veya şifre doğrulanamadı.';}
    }finally{
      const submit=form.querySelector('[type="submit"]');
      if(submit)submit.disabled=false;
    }
  });
});

window.OkulivaAuth={
  logout:async()=>{
    const endpoint=window.OKULIVA_AUTH_ENDPOINT;
    if(!endpoint)return false;
    const response=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json'},credentials:'include',body:JSON.stringify({action:'logout'})});
    return response.ok;
  },
  session:async()=>{
    const endpoint=window.OKULIVA_AUTH_ENDPOINT;
    if(!endpoint)return null;
    const response=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json'},credentials:'include',body:JSON.stringify({action:'session'})});
    return response.ok?response.json():null;
  }
};

// The page itself contains no protected school data.  This small panel is only
// displayed after the server has validated the HttpOnly session cookie.
document.querySelectorAll('[data-login-form]').forEach(async form=>{
  const area=form.dataset.area;
  const card=form.closest('.auth-card');
  if(!card)return;
  try{
    const session=await window.OkulivaAuth.session();
    const allowed=session?.ok&&session.role==='admin'&&(area==='admin'||session.setupStatus==='setup_pending');
    if(!allowed)return;

    form.hidden=true;
    const support=card.querySelector('.support-link');
    if(support)support.hidden=true;
    const panel=document.createElement('div');
    panel.className='form-status success';
    panel.dataset.authenticatedPanel='true';
    panel.textContent=area==='setup'
      ? 'Kurulum oturumunuz açık. Kurulum işlemlerine devam edebilirsiniz.'
      : 'İdare Masası oturumunuz açık. Okulunuz için yetkili erişim sağlandı.';
    const logout=document.createElement('button');
    logout.type='button';
    logout.className='btn secondary login-submit';
    logout.textContent='Güvenli çıkış yap';
    logout.addEventListener('click',async()=>{
      logout.disabled=true;
      await window.OkulivaAuth.logout();
      window.location.reload();
    });
    card.append(panel,logout);
  }catch{
    // An unavailable session endpoint must not reveal a protected state.
  }
});
