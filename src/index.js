import SimpleLightbox from "simplelightbox";
import "simplelightbox/dist/simple-lightbox.min.css";
import Notiflix from 'notiflix';
import { fetchImages, page, perPage, resetPage } from './js/fetchImages';
import { onTop, onScroll } from './js/button';


const form = document.querySelector(".search-form");
const input = document.querySelector(".input");
const gallery = document.querySelector(".gallery");
const buttonLM = document.querySelector(".load-more");

form.addEventListener("submit", onSubmit);
buttonLM.addEventListener("click", onNextImagesAdd);

let searchValue = '';

const optionsSL = {
    overlayOpacity: 0.3,
    captionsData: "alt",
    captionDelay: 250,
};
let simpleLightbox;

onScroll();
onTop();

async function onSubmit(event) {
    event.preventDefault();

    searchValue = input.value.trim();
    if (searchValue === '') {
        clearAll();
        btnHidden();
        Notiflix.Notify.info('Search is not possible with an empty field, try again.');
        return;
    } else {
        try {
            resetPage();
            const result = await fetchImages(searchValue);
            if (result.hits < 1) {
                form.reset();
                clearAll();
                btnHidden();
                Notiflix.Notify.failure('Sorry, there are no images matching your search query. Please try again.');
            } else {
                form.reset();
                gallery.innerHTML = imageCreate(result.hits);
                simpleLightbox = new SimpleLightbox(".gallery a", optionsSL).refresh();
                btnUnHidden();

                Notiflix.Notify.success(`Hooray! We found ${result.totalHits} images.`);
            };
        } catch (error) {
            ifError();
        };
    };
};

async function onNextImagesAdd() {

    simpleLightbox.destroy();
    try {
        const result = await fetchImages(searchValue);
        const totalPages = page * perPage;
            if (result.totalHits <= totalPages) {
              btnHidden();
              Notiflix.Report.info('The search is over');
            }
        gallery.insertAdjacentHTML('beforeend', imageCreate(result.hits));
        smothScroll();
        simpleLightbox = new SimpleLightbox(".gallery a", optionsSL).refresh();
    } catch (error) {
        ifError();
    };
};

function ifError() {
    clearAll();
    btnHidden();
    Notiflix.Report.info('Something went wrong. Try again.');
};

function clearAll() {
    gallery.innerHTML = '';
};

function btnHidden() {
    buttonLM.classList.add("hidden");
};

function btnUnHidden() {
  buttonLM.classList.remove("hidden");
};

function smothScroll() {
    const { height: cardHeight } =
        document.querySelector(".gallery--card").firstElementChild.getBoundingClientRect();
    window.scrollBy({
    top: cardHeight * 3.9,
    behavior: "smooth",
});
};


function imageCreate(images) {
  return images.map((image) => 
      `<div class="gallery--card">
          <a href="${image.largeImageURL}">
            <img src="${image.webformatURL}" alt="${image.tags}" loading="lazy"
            class="gallery--image" />
          </a>
          <div class="galery--info">
              <p class="galery--item">${image.likes}
              <b>Likes</b>
              </p>
              <p class="galery--item">${image.views}
              <b>Views</b>
              </p>
              <p class="galery--item">${image.comments}
              <b>Comments</b>
              </p>
              <p class="galery--item">${image.downloads}
              <b>Downloads</b>
              </p>
          </div>
      </div>`).join("");
};