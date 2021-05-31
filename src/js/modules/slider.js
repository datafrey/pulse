import { tns } from "../../../node_modules/tiny-slider/src/tiny-slider";

function slider() {
  const slider = tns({
    container: '.carousel__inner',
    items: 1,
    slideBy: 'page',
    autoplay: true,
    speed: 1500,
    autoplayButtonOutput: false,
    controls: false,
    nav: false
  });

  document.querySelector('.prev').addEventListener('click', () => {
    slider.goTo('prev');
  });

  document.querySelector('.next').addEventListener('click', () => {
    slider.goTo('next');
  });
}

export default slider;