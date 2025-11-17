// Zet huidig jaar in footer
document.addEventListener('DOMContentLoaded', function(){
	const yearEl = document.getElementById('year');
	if (yearEl) yearEl.textContent = new Date().getFullYear();

	// eenvoudige mobile menu toggle
	const toggle = document.getElementById('menuToggle');
	const navList = document.getElementById('navList');
	if (toggle && navList) {
		toggle.addEventListener('click', function(){
			const open = navList.style.display === 'flex' || navList.style.display === 'block';
			navList.style.display = open ? 'none' : 'block';
			toggle.setAttribute('aria-expanded', String(!open));
		});
	}

		// Site-wide page navigation: prev/next buttons, keyboard arrows and wheel scroll
		(function(){
			const pageOrder = ['index.html','home.html','about.html','projects.html','contact.html'];
			let current = window.location.pathname.split('/').pop();
			if (!current) current = 'index.html';
			let idx = pageOrder.indexOf(current);
			// if the file isn't in list, try mapping common aliases
			if (idx === -1) {
				if (current === 'index.htm' || current === 'index') idx = 0;
				else if (current === 'main.html') idx = 0;
			}

			if (idx === -1) return; // not a page we manage

			function navigateWithFade(href){
				// add fade-out class then navigate after transition
				document.body.classList.add('page-fade-out');
				setTimeout(function(){ window.location.href = href; }, 320);
			}

			function goTo(i){
				if (i < 0 || i >= pageOrder.length) return;
				const href = pageOrder[i];
				navigateWithFade(href);
			}

			function goNext(){ if (idx < pageOrder.length -1) goTo(idx+1); }
			function goPrev(){ if (idx > 0) goTo(idx-1); }

			// create controls
			const wrap = document.createElement('div'); wrap.className = 'page-nav';
			const btnPrev = document.createElement('button'); btnPrev.className = 'page-nav-btn prev'; btnPrev.title = 'Vorige pagina'; btnPrev.innerHTML = '‹';
			const btnNext = document.createElement('button'); btnNext.className = 'page-nav-btn next'; btnNext.title = 'Volgende pagina'; btnNext.innerHTML = '›';
			if (idx <= 0) btnPrev.setAttribute('disabled','');
			if (idx >= pageOrder.length -1) btnNext.setAttribute('disabled','');
			btnPrev.addEventListener('click', goPrev);
			btnNext.addEventListener('click', goNext);
			wrap.appendChild(btnPrev);
			wrap.appendChild(btnNext);
			document.body.appendChild(wrap);

			// ensure fade-in on load: mark preload then animate
			document.body.classList.add('page-preload');
			requestAnimationFrame(function(){
				setTimeout(function(){
					document.body.classList.add('page-animated');
					document.body.classList.remove('page-preload');
				}, 30);
			});

			// intercept internal link clicks for fade navigation
			function isInternalLink(a){
				if (!a || !a.href) return false;
				try{ return new URL(a.href).origin === location.origin; }catch(e){return false}
			}
			document.addEventListener('click', function(e){
				const a = e.target.closest && e.target.closest('a');
				if (!a) return;
				if (a.target === '_blank' || a.hasAttribute('download')) return;
				if (!isInternalLink(a)) return;
				const href = a.getAttribute('href');
				if (!href) return;
				// only handle html navigations
				if (href.indexOf('.html') === -1 && href.indexOf('/') !== 0) return;
				e.preventDefault();
				navigateWithFade(href);
			});

			// keyboard support
			document.addEventListener('keydown', function(e){
				if (e.key === 'ArrowRight') goNext();
				if (e.key === 'ArrowLeft') goPrev();
			});

			// wheel support: direct navigeren (geen scrollen binnen pagina)
			let navLocked = false;
			function lockNav(){ navLocked = true; setTimeout(()=> navLocked = false, 900); }
			document.addEventListener('wheel', function(e){
				// ignore when user is typing in an input or textarea
				const ae = document.activeElement && document.activeElement.tagName;
				if (ae === 'INPUT' || ae === 'TEXTAREA' || ae === 'SELECT' || ae === 'BUTTON') return;
				if (navLocked) return;
				
				if (e.deltaY > 60) { 
					goNext(); 
					lockNav(); 
				} else if (e.deltaY < -60) { 
					goPrev(); 
					lockNav(); 
				}
			}, {passive:true});

			// touch support: direct navigeren (geen scrollen binnen pagina)
			let touchStartY = null;
			document.addEventListener('touchstart', function(e){ 
				touchStartY = e.touches ? e.touches[0].clientY : null; 
			}, {passive:true});
			document.addEventListener('touchend', function(e){
				if (touchStartY === null) return;
				const endY = (e.changedTouches && e.changedTouches[0] && e.changedTouches[0].clientY) || null;
				if (endY === null) return;
				const diff = touchStartY - endY;
				
				if (Math.abs(diff) > 80) {
					if (diff > 0) { 
						goNext(); 
					} else { 
						goPrev(); 
					}
				}
				touchStartY = null;
			}, {passive:true});
		})();

		// Lightbox handlers for project screenshots
		(function(){
			const lightbox = document.getElementById('lightbox');
			const lightboxImg = document.getElementById('lightboxImg');
			const lbClose = document.querySelector('.lb-close');
			const lbPrev = document.querySelector('.lb-prev');
			const lbNext = document.querySelector('.lb-next');
			const triggers = Array.from(document.querySelectorAll('.lightbox-trigger'));
			if (!lightbox || !lightboxImg || triggers.length === 0) return;

			let currentIndex = 0;

			function openAt(i){
				if (i < 0 || i >= triggers.length) return;
				currentIndex = i;
				const src = triggers[i].getAttribute('src') || triggers[i].dataset.src;
				lightboxImg.setAttribute('src', src);
				lightbox.classList.add('open');
				lightbox.setAttribute('aria-hidden','false');
			}

			function close(){
				lightbox.classList.remove('open');
				lightbox.setAttribute('aria-hidden','true');
				lightboxImg.setAttribute('src','');
			}

			function next(){ openAt((currentIndex+1) % triggers.length); }
			function prev(){ openAt((currentIndex-1+triggers.length) % triggers.length); }

			triggers.forEach(function(img,i){
				img.style.cursor = 'zoom-in';
				img.addEventListener('click', function(e){ e.preventDefault(); openAt(i); });
			});

			if (lbClose) lbClose.addEventListener('click', close);
			if (lbPrev) lbPrev.addEventListener('click', function(e){ e.stopPropagation(); prev(); });
			if (lbNext) lbNext.addEventListener('click', function(e){ e.stopPropagation(); next(); });

			lightbox.addEventListener('click', function(e){ if (e.target === lightbox) close(); });
			document.addEventListener('keydown', function(e){
				if (!lightbox.classList.contains('open')) return;
				if (e.key === 'Escape') close();
				if (e.key === 'ArrowRight') next();
				if (e.key === 'ArrowLeft') prev();
			});

			// touch swipe inside lightbox
			let startX = null;
			lightbox.addEventListener('touchstart', function(e){ startX = e.touches && e.touches[0] && e.touches[0].clientX; }, {passive:true});
			lightbox.addEventListener('touchend', function(e){
				if (startX === null) return;
				const endX = e.changedTouches && e.changedTouches[0] && e.changedTouches[0].clientX;
				const diff = startX - endX;
				if (Math.abs(diff) > 50){ if (diff > 0) next(); else prev(); }
				startX = null;
			}, {passive:true});
		})();
});
