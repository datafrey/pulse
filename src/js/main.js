import slider from './modules/slider';
import tabs from './modules/tabs';
import catalogItems from './modules/catalogItems';
import forms from './modules/forms';
import phoneMask from './modules/phoneMask';
import pageup from './modules/pageup';
import { WOW } from 'wowjs';

window.addEventListener('DOMContentLoaded', () => {
  slider();
  tabs();
  catalogItems();
  forms();
  phoneMask();
  pageup();
  
  new WOW().init();
});