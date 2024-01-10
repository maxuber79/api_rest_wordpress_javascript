console.log('%c<<< Start re-apirest js >>>', 'background: #fff3cd; color: #664d03; padding: 2px 5px;');

const d = document;
const w = window;
const $site = d.getElementById('site'),
			$posts = d.getElementById('posts'),
			$loader = d.querySelector('.loader'),
			$template = d.getElementById('post-template').content,
			$fragment = d.createDocumentFragment(),
			DOMAIN = 'http://localhost/elev',
			SITE = `${DOMAIN}/wp-json`,
			API_WP = `${SITE}/wp/v2`,
			POSTS = `${API_WP}/posts?_embed`, 
			PAGES = `${API_WP}/pages`,
			CATEGORIES = `${API_WP}/categories`;

const state = {
	page: 1,
	perPage: 5,
	totalPages: 3 
};

const pagesTotales = async() => {
	try {
		const totalPosts = await fetch(`${POSTS}&page=${state.page}&per_page=${state.perPage}`);
		if( totalPosts.status === 200) {
			const data = await totalPosts.json();
				console.log('%cHTTP request | All PAGES ==>', 'background:#fd7e14; color: #FFFFFF; padding: 2px 5px;', data);
				// Obtener el número total de páginas desde los encabezados de respuesta
        const totalPages = totalPosts.headers.get('X-WP-TotalPages');
				console.log('total de pages ===>',totalPages );		
		} else {

		}
	} catch (error) {
		if (error instanceof TypeError && error.message.includes("Failed to fetch")) {
        // Manejar errores de conexión (puede ser un problema CORS)
    } else {
        Swal.fire({
				title: 'Error!',
				text: 'Hay un error en obtener los page totales',
				icon: 'error',
				confirmButtonText: 'Salir'
			});
		console.error('hay un error en la api', error);
	}
	}
}
window.addEventListener('load', pagesTotales);

let observador = new IntersectionObserver( (posts, observador)=> {
const mensaje = d.querySelector('.d-none');
	console.log(posts);
	posts.forEach( el => {
		if(el.isIntersecting) {
			let totalPages = 3;
			if (state.page < totalPages) {
					state.page++;
					getPosts();
			} else {
				d.querySelector('.d-none').className += 'd-block';
			}
			/* state.page++;
			 getPosts(); */
		}
	})


}, {
	rootMargin: '0px 0px 0px 0px',
	threshold: 1
});

//console.log($site,$posts,$loader,DOMAIN,SITE,API_WP,POSTS,PAGES,CATEGORIES );
 const getSiteData = async() => {
	console.log('%c<<< Start function getSiteData >>>', 'background: #20c997; color: #fff; padding: 2px 5px;');
	try {
		const resp = await fetch(SITE);
		console.log('%c[DESPUES] HTTP request | resp:', 'background:#d1e7dd; color: #0a3622; padding: 2px 5px;', resp);

		if( resp.status === 200) {
			const data = await resp.json();
			console.log('%c[DESPUES] HTTP request | data:', 'background:#fd7e14; color: #FFFFFF; padding: 2px 5px;', data);
			

			$site.innerHTML = `<h1 class="display-5 fw-normal">Sitio Web</h1><h2><a href="${data.url}" target="_black">${data.name}</a></h2><p class="col-lg-8 mx-auto lead">${data.description}</p><p>${data.timezone_string}</p>`;



		} else if( resp.status === 401 ) {
			console.error('el error de conexión 401');
			Swal.fire({
				title: 'Error!',
				text: 'Hay un error 401 getSiteData',
				icon: 'error',
				confirmButtonText: 'Salir'
			});
		} else if(  resp.status === 404) {
			Swal.fire({
				title: 'Error!',
				text: 'Hay un error 404 getSiteData',
				icon: 'error',
				confirmButtonText: 'Salir'
			});
			console.error('la información no existe 404');
		} else {
			Swal.fire({
				title: 'Error!',
				text: 'Hubo un error y no se sabe que paso getSiteData',
				icon: 'error',
				confirmButtonText: 'Salir'
			});
			console.error('hubo un error y no se sabe que paso ');
		}

	} catch (error) {
		if (error instanceof TypeError && error.message.includes("Failed to fetch")) {
        // Manejar errores de conexión (puede ser un problema CORS)
    } else {
        Swal.fire({
				title: 'Error!',
				text: 'No hay conexión a la Api de Wordpress getSiteData',
				icon: 'error',
				confirmButtonText: 'Salir'
			});
		console.error('hay un error en la api', error);
    } 
	}
	
}
window.addEventListener('load', getSiteData);

const getPosts = async() => {
console.log('%c<<< Start function  getPosts >>>', 'background: #20c997; color: #fff; padding: 2px 5px;');

	try {
			const respPosts = await fetch(`${POSTS}&page=${state.page}&per_page=${state.perPage}`);
			
			console.log('%cHTTP request API POSTS ==>', 'background:#d1e7dd; color: #0a3622; padding: 2px 5px;', respPosts);
			
			if( respPosts.status === 200) {
				const data = await respPosts.json();
				console.log('%cHTTP request | All POSTS ==>', 'background:#fd7e14; color: #FFFFFF; padding: 2px 5px;', data);

				

				if( data.length >= 0 ) {
					data.forEach( el => {

						console.log('%cHTTP request | POST ==>', 'background:#d1e7dd; color: #0a3622; padding: 2px 5px;', el);

						let dataDinamic = {
							categories: '',
							tags: '',
						}

								el._embedded['wp:term'][0].forEach( el => dataDinamic.categories += `<li>${el.name}</li>`);
								el._embedded['wp:term'][1].forEach(el => dataDinamic.tags += `<li>${el.name}</li>`);

								$template.querySelector('.post-img').src = el._embedded['wp:featuredmedia'] ? el._embedded['wp:featuredmedia'][0].source_url : "";
								$template.querySelector('.post-img').alt = el.title.rendered;
								$template.querySelector('.post-title').innerHTML = el.title.rendered;
								$template.querySelector('.post-author').innerHTML =`
								<img src="${el._embedded.author[0].avatar_urls['48']}" alt="${el._embedded.author[0].name}">
								<figcaption></figcaption>
								`;
								$template.querySelector('.post-date').innerHTML = new Date(el.date).toLocaleDateString();
								$template.querySelector('.post-link').href = el.link;
								$template.querySelector('.post-excerpt').innerHTML = el.excerpt.rendered.replace('[&hellip;]', '...');


								$template.querySelector('.post-category').innerHTML = `
									<p>Categorías</p>
									<ul>${dataDinamic.categories}</ul>
								`;
								$template.querySelector('.post-tags').innerHTML = `
									<p>Etiquetas</p>
									<ul>${dataDinamic.tags}</ul>
								`;
								$template.querySelector('.post-content > article').innerHTML = el.content.rendered;

					let $clone = d.importNode($template, true);
					$fragment.appendChild($clone);	

					 

				});
					
				$posts.appendChild($fragment);
				const postsEnPantalla = document.querySelectorAll('.grid .grid-item');
				//console.log('postsEnPantalla ==>',postsEnPantalla);
				let ultimoPost = postsEnPantalla[postsEnPantalla.length - 1]
				console.log('ultimoPost ==>',ultimoPost);

				observador.observe(ultimoPost);

				masonryPosts()
				} else {
					alert('No hay post...')
					console.error('hubo un error , no hay datos');
				}
					
				



			} else if( respPosts.status === 401 ) {
				console.error('el error de conexión 401');
					Swal.fire({
						title: 'Error!',
						text: 'Hay un error de tipo 401 getPosts',
						icon: 'error',
						confirmButtonText: 'Salir'
					});
			} else if(  respPosts.status === 404) {
				Swal.fire({
						title: 'Error!',
						text: 'Hay un error de tipo 404 getPosts',
						icon: 'error',
						confirmButtonText: 'Salir'
					});
				console.error('la información no existe 404');
			} else {
				console.error('hubo un error y no se sabe que paso getPosts');
				Swal.fire({
						title: 'Error!',
						text: 'Hubo un error y no se sabe que paso getPosts',
						icon: 'error',
						confirmButtonText: 'Salir'
					});
			}

	} catch (error) {
		if (error instanceof TypeError && error.message.includes("Failed to fetch")) {
        // Manejar errores de conexión (puede ser un problema CORS)
    } else {
        Swal.fire({
				title: 'Error!',
				text: 'Hay un error en obtener los posts',
				icon: 'error',
				confirmButtonText: 'Salir'
			});
		console.error('hay un error en la api', error);
    } 
	
	}

}
window.addEventListener('load', getPosts);

function masonryPosts() {
	// Ejemplo de inicialización de Masonry
	var items = document.querySelector('.grid-item');
	console.log('items ==>', items)
	var grid = document.querySelector('.grid'); // Cambiado de '.grid' a '.posts'
	var masonry = new Masonry(grid, {
		itemSelector: '.grid-item',
		percentPosition: true 
		// Opciones adicionales según tus necesidades
	});

	// Llama a layout después de la carga de imágenes para garantizar que Masonry tenga las dimensiones correctas de los elementos
	imagesLoaded(grid, function () {
		masonry.layout();
	});
}



/* const srollInfinito = w.addEventListener('scroll', e => {
	console.log('%c<<< Start function  scroll >>>', 'background: #20c997; color: #fff; padding: 2px 5px;');
	//const elementoHtml = d.documentElement; 
	//const { scrollTop, clientHeight, scrollHeight } = elementoHtml;

	//if (scrollTop + clientHeight >= scrollHeight) {
	// console.log('cargar mas posts');
	//		state.page++; 
	//getPosts();
	//}  
});
window.addEventListener('load', srollInfinito); */




//getSiteData();  
/*  function getSiteData() {

	fetch(SITE).then(response => {
		if (response.ok) {
			return response.json();
		} else {
			return Promise.reject('Error en la respuesta de la solicitud fetch');
		}
	}).then(data => {
		console.log('%c[DESPUES] HTTP request getSiteData:', 'background:#fd7e14; color: #FFFFFF; padding: 2px 5px;', data.length);
		 if(data) {
			console.log('Es mayor a 0', data);
			$site.innerHTML = `<h1 class="display-5 fw-normal">Sitio Web</h1><h2><a href="${data.url}" target="_black">${data.name}</a></h2><p class="col-lg-8 mx-auto lead">${data.description}</p><p>${data.timezone_string}</p>`;
		 } else {
			console.log('Es menor a 0', data)
		 }
		}).catch(err => {
		console.error('Error al obtener los datos:', err.message);
		let message = err.statusText||'Ocurrio un error'; 
		$site.innerHTML = `<p>Error${err.statusText}:${message}</p>`;
		$loader.style.display = 'block';
	})
}
getSiteData()   */

/* const apiConfig = {
  DOMAIN: 'http://localhost/elev',
  SITE: 'https://comunidadmujer.cl/wp-json',
  API_WP: 'https://comunidadmujer.cl/wp-json/wp/v2',
  POSTS: 'https://comunidadmujer.cl/wp-json/wp/v2/posts?_embed',
  PAGES: 'https://comunidadmujer.cl/wp-json/wp/v2/pages',
  CATEGORIES: 'https://comunidadmujer.cl/wp-json/wp/v2/categories'
}; */

/* const elements = {
  site: document.getElementById('site'),
  posts: document.getElementById('posts'),
  loader: document.querySelector('.loader'),
  template: document.getElementById('post-template').content,
  fragment: document.createDocumentFragment(),
  grid: document.querySelector('.grid')
}; */

/* const 
				$site = d.getElementById('site'),
				$posts = d.getElementById('posts'),
				$loader = d.querySelector('.loader'),
				$template = d.getElementById('post-template').content,
				$fragment = d.createDocumentFragment(),
				DOMAIN = 'http://localhost/elev',
				SITE = `${DOMAIN}/wp-json`,
				API_WP = `${SITE}/wp/v2`,
				POSTS = `${API_WP}/posts?_embed=true`,
				PAGES = `${API_WP}/pages`,
				CATEGORIES = `${API_WP}/categories`; */