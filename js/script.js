import { initValidation } from './validation.js';

const form = document.querySelector('form');
const buttonReset = form.querySelector('.form__reset');
const inputElement = form.querySelector('.form__input');
const textElement = form.querySelector('.form__text-error');
const outputElement = document.querySelector('.main__output-text');
const button = document.querySelector('.form__button');

const onButtonResetClick = () => {
  inputElement.classList.remove('form__input--error');
  inputElement.value = '';
  textElement.classList.remove('form__text-error--active');
  outputElement.classList.add('main__output-text--hide')
};

initValidation({ form, inputElement, textElement, button })

buttonReset.addEventListener('click', onButtonResetClick)
