import IMask from "imask";

function phoneMask() {
  const phoneInputs = document.querySelectorAll('input[name="phone"]');
  const maskOptions = {
    mask: '+7 (000) 000-00-00'
  };

  phoneInputs.forEach(input => {
    IMask(input, maskOptions);
  });
}

export default phoneMask;