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
      const response=await fetch(endpoint,{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        credentials:'include',
        body:JSON.stringify({username,password,area})
      });
      const data=await response.json().catch(()=>({}));
      if(!response.ok||!data.ok)throw new Error('login_failed');
      if(status){status.classList.add('success');status.textContent='Giriş başarılı, yönlendiriliyorsunuz…';}
      if(data.redirectUrl)window.location.assign(data.redirectUrl);
    }catch(_){
      if(status){status.classList.add('error');status.textContent='Kullanıcı adı veya şifre doğrulanamadı.';}
    }
  });
});
