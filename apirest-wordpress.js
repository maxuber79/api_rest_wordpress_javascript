console.log('%c<<< Start re-apirest js >>>', 'background: #fff3cd; color: #664d03; padding: 2px 5px;');

const d = document;
const w = window;
const $site = d.getElementById('site'),
			$posts = d.getElementById('posts'),
			$loader = d.querySelector('.loader'), 
			$template = d.getElementById('posts'),
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

var totalPages = '';
let post = '';
let ultimoPost;



/* const getLogo = () => {
	//'http://tu-sitio.com/wp-json/wp/v2/tipo_de_contenido/ID_del_post'
	fetch(SITE)
  .then(response => response.json())
  .then(data => {
    // Accede a la URL del logo del sitio desde el objeto de medios destacados
    const featuredMediaUrl = data._links['wp:featuredmedia'][0].href;

		//let logo = data._links['wp:featuredmedia'][0].href; 
			console.log('site_logo', featuredMediaUrl) 

    // Haz otra solicitud para obtener los detalles del medio destacado
    return fetch(featuredMediaUrl);
  })
  .then(response => response.json())
  .then(mediaData => {
    // Accede a la URL del archivo del medio destacado (logo del sitio)
    const logoUrl = mediaData.media_details.sizes.full.source_url;
		
    // Haz algo con la URL del logo, por ejemplo, imprímelo en la consola
    console.log('URL del logo del sitio:', logoUrl);


		$site.innerHTML = `<img src="${logoUrl}" alt="" class="">`;


  })
  .catch(error => console.error('Error al obtener la URL del logo:', error));

}
window.addEventListener('DOMContentLoaded', getLogo); */

const pagesTotales = async() => {
	console.log('%c<<< Start function pagesTotales >>>', 'background: #20c997; color: #fff; padding: 2px 5px;');
	try {
		const totalPosts = await fetch(`${POSTS}&page=${state.page}&per_page=${state.perPage}`);


		if( totalPosts.status === 200) {
			const data = await totalPosts.json();
			// Obtener el número total de páginas desde los encabezados de respuesta
				console.log('%cHTTP request | All PAGES ==>', 'background:#fd7e14; color: #FFFFFF; padding: 2px 5px;', data);
        totalPages = totalPosts.headers.get('X-WP-TotalPages');
				console.info('%ctotal de pages ===>', 'background:#0d6efd; color: #fff; padding: 2px 5px;',totalPages );		
		} else {
			alertaSwal('Error!', 'hay un error en la api', 'error', 'Salir');	
			console.error('hay un error en la api', error.message);
		}
	} catch (error) {
		if (error instanceof TypeError && error.message.includes("Failed to fetch")) {
        // Manejar errores de conexión (puede ser un problema CORS)
				alertaSwal('Error!', 'Failed to fetch', 'error', 'Salir');
    } else {
			alertaSwal('Error!', 'Failed to fetch', 'error', 'Salir');	
      /*   Swal.fire({
				title: 'Error!',
				text: 'Hay un error en obtener los page totales',
				icon: 'error',
				confirmButtonText: 'Salir'
			}); */
		console.error('hay un error en la api', error.message);
	}
	}
}
//window.addEventListener('DOMContentLoaded', pagesTotales);

let observador = new IntersectionObserver( (posts, observador)=> {
const mensaje = d.querySelector('.d-none');
	console.log(posts);
	posts.forEach( el => {
		if(el.isIntersecting) { 
			if (state.page < totalPages) {
					state.page++;
					getPosts();
			} else {
				d.querySelector('.d-none').className += 'd-block';
			} 
		}
	});
}, {
	root: null, // default, use viewport
   rootMargin: '100px 0px 100px 0px',
  threshold: 0.5 // half of item height  
	 /* rootMargin: '0px 0px 0px 0px',
	threshold: 1   */
});

const getSiteData = async () => {
    console.log('%c<<< Start function getSiteData >>>', 'background: #20c997; color: #fff; padding: 2px 5px;');
    
    try {
        const resp = await fetch(SITE);
				console.log('%c[DESPUES] HTTP request | resp:', 'background:#d1e7dd; color: #0a3622; padding: 2px 5px;', resp);

        if (resp.status === 200) {
            const data = await resp.json();
            console.log('%c[DESPUES] HTTP request | data:', 'background:#d1e7dd; color: #0a3622; padding: 2px 5px;', data);

            // Obtener info site_logo
            const featuredMediaUrl = data._links['wp:featuredmedia'][0].href;
            console.log('json data site_logo ===>', featuredMediaUrl);

            const mediaResponse = await fetch(featuredMediaUrl);

            if (mediaResponse.ok) {
                const mediaData = await mediaResponse.json();
                const logoUrl = mediaData.media_details.sizes.full.source_url;
                console.log('json data mediaData ===>', logoUrl);

                $site.innerHTML = `<img src="${logoUrl}" alt="" class="" style="display: inline-block;height: 100px;margin: 1rem 0;"><h1 class="display-5 fw-normal">Sitio Web</h1><h2><a href="${data.url}" target="_black">${data.name}</a></h2><p class="col-lg-8 mx-auto lead">${data.description}</p><p>${data.timezone_string}</p>`;
            } else {
                alertaSwal('Error!', 'Hubo un error al llamar a la info site_logo', 'error', 'Salir');
            }

        } else if (resp.status === 401) {
            console.error('Error de conexión 401');
            alertaSwal('Error!', 'Hay un error 401 getSiteData', 'error', 'Salir');

        } else if (resp.status === 404) {
            alertaSwal('Error!', 'Hay un error 404 getSiteData', 'error', 'Salir');
            console.error('La información no existe 404');

        } else {
            alertaSwal('Error!', 'Hubo un error y no se sabe qué pasó getSiteData', 'error', 'Salir');
            console.error('Hubo un error y no se sabe qué pasó');
        }
    } catch (error) {
        if (error instanceof TypeError && error.message.includes("Failed to fetch")) {
            // Manejar errores de conexión (puede ser un problema CORS)
        } else {
					alertaSwal('Error!', 'No hay conexión a la Api de Wordpress getSiteData', 'error', 'Salir');
					console.error('Hay un error en la API', error);
        }
    }
}
//window.addEventListener('DOMContentLoaded', getSiteData);

const getPosts = async() => {
console.log('%c<<< Start function  getPosts >>>', 'background: #20c997; color: #fff; padding: 2px 5px;');

	try {
			const respPosts = await fetch(`${POSTS}&page=${state.page}&per_page=${state.perPage}`);
			
			console.log('%cHTTP request API POSTS ==>', 'background:#d1e7dd; color: #0a3622; padding: 2px 5px;', respPosts);
			
			if( respPosts.status === 200) {
				const data = await respPosts.json();
				console.log('%cHTTP request | All POSTS ==>', 'background:#fd7e14; color: #FFFFFF; padding: 2px 5px;', data);

				

				if( data.length >= 0 ) {
					
					
					data.forEach( element => {

						console.log('%cHTTP request | POST ==>', 'background:#d1e7dd; color: #0a3622; padding: 2px 5px;', element);

						let dataDinamic = {
							categories: '',
							tags: '',
						}

						element._embedded['wp:term'][0].forEach( el => dataDinamic.categories += `<a class="---" href="" alt="">${el.name}</a>, `);
						element._embedded['wp:term'][1].forEach(tags => {
							dataDinamic.tags?dataDinamic.tags += `<a class="---" href="" alt="">${tags.name}</a>`: 'no hay tags';
						});
						let prueba = element._links.self[0].href;
						console.log('Obteniendo link', prueba)
						let fechaPublicacion = new Date(element.date).toLocaleDateString();

						post += `
							<div class="grid-item col-sm-12 col-md-3 my-3 animate__animated animate__fadeIn">
								<div class="card shadow-sm">
									<img src="${element._embedded['wp:featuredmedia'] ? element._embedded['wp:featuredmedia'][0].source_url : ""}" alt="" class="card-img-top post-img">
									<div class="card-body">
										<figure class="post-author d-inline">
											<img class=" rounded-circle" src="${element._embedded.author[0].avatar_urls['48']}" alt="${element._embedded.author[0].name}"> 
										</figure>
										<span class="blog-post-meta">by <a href="#">${element._embedded.author[0].name}</a></span>
										<h5 class="card-title post-title">${element.title.rendered}</h5>
										<div class="mb-1 text-body-secondary post-date"><i class="bi bi-calendar-event-fill"></i> ${fechaPublicacion}</div>
										
										<div class="post-category">
										<small class="text-muted">
										<i class="bi bi-calendar-event-fill"></i> ${fechaPublicacion}
										<i class="bi bi-bookmark-fill"></i> ${dataDinamic.categories} 
										<i class="bi bi-tags-fill"></i> ${dataDinamic.tags ? dataDinamic.tags += `<a class="---" href="" alt="">${tags.name}</a>`: '...'}</small></div>
										<div class="post-tags"></div>
										<p class="card-text post-excerpt">${element.excerpt.rendered.replace('[&hellip;]', '...')}</p>
										<a href="" class="btn btn-primary post-link btn-sm">Ver Publicación Original</a>
										<details class="post-content">
											<summary>Full contenido del post</summary>
											<article>${element.content.rendered}</article>
										</details>					
									</div>
									<div class="card-footer text-body-secondary">
										<div class="d-flex justify-content-between align-items-center">
											<div class="btn-group">
												<a href="${element.link}" alt="${element.title.rendered}" class="btn btn-sm btn-outline-secondary">Ver más</a>
												<a href="${prueba}" class="btn btn-sm btn-outline-secondary">Editar</a>
										  
											</div>
											<small class="text-body-secondary">9 mins</small>
										</div>
									</div>
								</div>
							</div>
							`;
							$template.innerHTML = post;

							

							if(ultimoPost) {
								observador.unobserve(ultimoPost)
							}

							const postsEnPantalla = document.querySelectorAll('.grid .grid-item');
							console.log('postsEnPantalla ==>',postsEnPantalla);
								ultimoPost = postsEnPantalla[postsEnPantalla.length - 1]
							console.log('ultimoPost ==>',ultimoPost);

							observador.observe(ultimoPost);
						});
						masonryPosts()
				} else {
					alert('No hay post...')
					console.error('hubo un error , no hay datos');
				}
					
				


			} else if( respPosts.status === 401 ) {
				alertaSwal('Error!', 'Hay un error de tipo 401 getPosts', 'error', 'Salir');
				console.error('el error de conexión 401');
			} else if(  respPosts.status === 404) {
				alertaSwal('Error!', 'Hay un error de tipo 404 getPosts', 'error', 'Salir');
				console.error('la información no existe 404');
			} else {
				alertaSwal('Error!', 'Hay un error en obtener los posts', 'error', 'Salir');
				console.error('hubo un error y no se sabe que paso getPosts');
			}

	} catch (error) {
		if (error instanceof TypeError && error.message.includes("Failed to fetch")) {
        // Manejar errores de conexión (puede ser un problema CORS)
    } else {
			alertaSwal('Error!', 'Hay un error en obtener los posts', 'error', 'Salir');
			console.error('hay un error en la api', error);
    } 
	
	}

}
//window.addEventListener('DOMContentLoaded', getPosts);

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

function alertaSwal(title, mensaje, icono, button) {
	Swal.fire({
		title: title,
		text: mensaje,
		icon: icono,
		confirmButtonText: button
	})
}
d.addEventListener('DOMContentLoaded', e => {		
	pagesTotales();			
	getSiteData();
	getPosts(); 
})
