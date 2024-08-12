$(document).ready(function() {
    const apiKey = '7b61835f65dad307f0d84d421d7aeeaa';
    const baseUrl = 'https://api.themoviedb.org/3';

    const initializeSlick = () => {
        $('.slick-carousel').each(function() {
            $(this).slick({
                slidesToShow: 4,
                slidesToScroll: 1,
                infinite: true,
                dots: true,
                arrows: true,
                responsive: [
                    { breakpoint: 1024, settings: { slidesToShow: 3 } },
                    { breakpoint: 768, settings: { slidesToShow: 2 } },
                    { breakpoint: 480, settings: { slidesToShow: 1 } }
                ]
            }).on('init', adjustDots)
              .on('afterChange', adjustDots);
        });
    };

    const adjustDots = () => {
        $('.slick-carousel').each(function() {
            const container = $(this);
            const dotsContainer = container.find('.slick-dots');
            if (dotsContainer.length) {
                const totalSlides = container.slick('getSlick').slideCount;
                const dotsToShow = Math.min(Math.ceil(totalSlides / 4), 20); 

                dotsContainer.find('li').each(function(index) {
                    if (index >= dotsToShow) {
                        $(this).hide();
                    } else {
                        $(this).show();
                    }
                });
            }
        });
    };

    const fetchTrending = async () => {
        try {
            const moviesResponse = await fetch(`${baseUrl}/trending/movie/day?api_key=${apiKey}`);
            const moviesData = await moviesResponse.json();
            displayTrending(moviesData.results, '.movies-container');

            const tvResponse = await fetch(`${baseUrl}/trending/tv/day?api_key=${apiKey}`);
            const tvData = await tvResponse.json();
            displayTrending(tvData.results, '.tv-container');
        } catch (error) {
            console.error('Error fetching trending data:', error);
        }
    };

    const displayTrending = (items, containerSelector) => {
        const container = $(containerSelector);
        container.empty();

        const limitedItems = items.slice(0, 20);

        limitedItems.forEach(item => {
            const slideHtml = `
                <div class="slick-slide" data-description="${item.overview}">
                    <img src="https://image.tmdb.org/t/p/w500${item.poster_path}" alt="${item.title || item.name}">
                    <h3>${item.title || item.name}</h3>
                </div>
            `;
            container.append(slideHtml);
        });

        if (container.hasClass('slick-initialized')) {
            container.slick('unslick');
        }

        container.slick({
            slidesToShow: 4,
            slidesToScroll: 1,
            dots: true,
            arrows: true,
            responsive: [
                { breakpoint: 1024, settings: { slidesToShow: 3 } },
                { breakpoint: 768, settings: { slidesToShow: 2 } },
                { breakpoint: 480, settings: { slidesToShow: 1 } }
            ]
        });
    };

    let currentModal;

    const showModal = (description) => {
        if (currentModal) {
            currentModal.remove();
        }
    
        $('body').append(`
            <div class="modal-overlay">
                <div class="modal-content">
                    <p>${description}</p>
                </div>
            </div>
        `);
    
        currentModal = $('.modal-overlay');
    
        $('.modal-overlay').on('click', function(event) {
            if ($(event.target).hasClass('modal-overlay')) {
                currentModal.remove();
                currentModal = null;
            }
        });
    };
    
    $(document).on('click', '.slick-slide', function() {
        const description = $(this).data('description');
        showModal(description);
    });

    const toggleButton = document.querySelector('.toggle-button');
    const modeIcon = document.getElementById('modeIcon');
    const header = document.querySelector('header'); 
    const body = document.body;
    let isDayMode = true;

    const updateBackgroundForCurrentMode = () => {
        if (body.classList.contains('night-mode')) {
            body.style.backgroundImage = 'url(images/interstellar.gif)';
            document.getElementById('about-container').style.backgroundColor = 'black';
        } else {
            body.style.backgroundImage = 'url(images/background.jpg)';
            document.getElementById('about-container').style.backgroundColor = 'white';
        }
    };

    body.classList.add('day-mode');
    toggleButton.style.backgroundImage = 'url("images/daymode.jpg")'; 
    toggleButton.style.backgroundSize = 'cover'; 
    header.style.backgroundImage = 'url("images/banner.jpg")'; 
    modeIcon.src = 'images/shield.png'; 

    toggleButton.addEventListener('click', () => {
        if (isDayMode) {
            body.classList.remove('day-mode');
            body.classList.add('night-mode');
            toggleButton.style.backgroundImage = 'url("images/nightmode.jpg")'; 
            toggleButton.style.backgroundSize = 'cover'; 
            header.style.backgroundImage = 'url("images/bannerdark.jpg")'; 
            document.getElementById('spiderman').src = 'images/spidermandark.png'; 
            document.getElementById('web').style.backgroundImage = 'url("images/webdark.png")'; 
            modeIcon.src = 'images/panther.png'; 
        } else {
            body.classList.remove('night-mode');
            body.classList.add('day-mode');
            toggleButton.style.backgroundImage = 'url("images/daymode.jpg")'; 
            header.style.backgroundImage = 'url("images/banner.jpg")'; 
            toggleButton.style.backgroundSize = 'cover'; 
            modeIcon.src = 'images/shield.png'; 
            document.getElementById('spiderman').src = 'images/spiderman.png'; 
            document.getElementById('web').style.backgroundImage = 'url("images/web.png")'; 
        }
        isDayMode = !isDayMode;
        updateBackgroundForCurrentMode();
    });

    const searchBar = document.getElementById('searchBar');

    searchBar.addEventListener('keypress', async (event) => {
        if (event.key === 'Enter') {
            event.preventDefault(); 
            const query = searchBar.value;
            if (query) {
                try {
                    document.getElementById('trending-results').style.display = 'none';
                    document.getElementById('about-container').style.display = 'none';
                    
                    const response = await fetch(`${baseUrl}/search/multi?api_key=${apiKey}&query=${query}`);
                    const data = await response.json();
                    displayTrending(data.results.slice(0, 20), '.movies-container');

                    document.getElementById('search-results').style.display = 'block';
                    document.getElementById('search-results').scrollIntoView({ behavior: 'smooth' });

                } catch (error) {
                    console.error('Error searching:', error);
                }
            } else {
                fetchTrending(); 
                document.getElementById('search-results').style.display = 'none'; 
            }
        }
    });

    const adjustSpiderManEffect = () => {
        const web = document.getElementById('web');
        const spiderman = document.getElementById('spiderman');

        if (spiderman && web) {
            window.addEventListener('scroll', () => {
                const scrollPosition = window.scrollY;
                web.style.height = (scrollPosition + 200) + 'px'; 
            });

            const initialScrollPosition = window.scrollY;
            web.style.height = (initialScrollPosition + 200) + 'px';
        }
    };

    $(document).ready(function() {
        const aboutContainer = $('#about-container');
        const searchContainer = $('.search-container');
        const aboutLink = $('#about');
        const homeLink = $('#home');
        const trendingResults = $('#trending-results');
        const searchResults = $('#search-results');
        const tv = $('.tv-container');
        const movies = $('.movies-container');
        const body = document.body;
    
        const updateBackgroundForCurrentMode = () => {
            if (body.classList.contains('night-mode')) {
                body.style.backgroundImage = 'url(images/interstellar.gif)';
                aboutContainer.css('backgroundColor', 'black');
            } else {
                body.style.backgroundImage = 'url(images/background.jpg)';
                aboutContainer.css('backgroundColor', 'white');
            }
        };
    
        aboutContainer.hide();
        searchResults.hide();
    
        aboutLink.on('click', function(event) {
            event.preventDefault(); 
    
            trendingResults.hide();
            searchResults.hide();
            searchContainer.hide();
            tv.hide();
            movies.hide();
            aboutContainer.show();
            updateBackgroundForCurrentMode(); 
        });
    
        homeLink.on('click', function(event) {
            event.preventDefault(); 
    
            fetchTrending(); 
            trendingResults.show();
            searchResults.hide();
            searchContainer.show();
            tv.show();
            movies.show();
            aboutContainer.hide();
            updateBackgroundForCurrentMode(); 
        });
    
        updateBackgroundForCurrentMode();
    });

    initializeSlick();
    fetchTrending();
    $(window).resize(adjustDots);
    adjustDots(); 
    adjustSpiderManEffect();
});