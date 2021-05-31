import $ from 'jquery';

function catalogItems() {
  function toggleSlide(item) {
    $(item).each(function(i) {
      $(this).on('click', function(e) {
        e.preventDefault();
        $('.catalog-item__content')
          .eq(i).toggleClass('catalog-item__content_active');
        $('.catalog-item__list').eq(i).toggleClass('catalog-item__list_active');
      });
    });
  }

  toggleSlide('.catalog-item__link');
  toggleSlide('.catalog-item__back');
}

export default catalogItems;