import { initTree } from './tree.js';

export const SPACES = /^[\s\n\t]+$/;

export const inputOption = {
  id: 'tree-input',
  pattern: {
    string: /^\([0-9\s()]*\)$/,
    name: 'Введён неправильный формат! Шаблон: (1 2 (3) 4)',
  },
  max: 1000,
  required: true,
};

/**
 * Инициализация валидации
 */
function initValidation({ form, inputElement, textElement, button }) {
  let enableButton = isEnableButton(inputElement)

  inputElement.addEventListener('input', () => onElementInput(inputElement, textElement, button))

  button.addEventListener('enable-button', () => enableButton = isEnableButton(inputElement));

  form.addEventListener('submit', (event) => onFormSubmit(event, enableButton, inputElement, textElement));
}

/**
 * установка стилей для поля ввода и блока информации
 * @param inputElement
 * @param textElement
 */
function setValidInputField(inputElement, textElement) {
  const inputErrorClass = 'form__input--error';
  const textErrorClass = 'form__text-error--active';
  const inputValue = inputElement.value;
  const { required, max, pattern } = inputOption;

  let textError = '';
  let isValid = true;

  if (inputValue === '' && inputOption.required === true) {
    textError = 'Поле обязательное для заполнения';
    isValid = false;
  } else if (inputValue.length > max) {
    textError = `Кол-во символов не должно быть больше чем ${max}`;
    isValid = false;
  } else if (pattern.string.test(inputValue) === false && (inputValue !== '' && required === false || required === true)) {
    // проверка на регулярное выражение
    textError = pattern.name;
    isValid = false;
  } else if (SPACES.test(inputValue)) {
    textError = 'Запрщены одни пробелы';
    isValid = false;
  }

  if (isValid === true) {
    inputElement.classList.remove(inputErrorClass);
    textElement.classList.remove(textErrorClass);
  } else {
    inputElement.classList.add(inputErrorClass);
    textElement.classList.add(textErrorClass);
  }

  textElement.innerText = textError;
}

/**
 * проверка доступности кнопки
 * @param inputElement
 * @return boolean
 */
function isEnableButton(inputElement) {
  const { required, max, pattern } = inputOption;
  const value = inputElement.value;

  return (
    pattern.string.test(value)
    && value.length <= max
    && SPACES.test(value) === false
    && (value !== '' && required === true || required === false)/*проверить в company*/
    || value === '' && required === false
  );
}

function onElementInput(inputElement, textElement, button) {
  setValidInputField(inputElement, textElement);
  button.dispatchEvent(new Event('enable-button'));
}

function onFormSubmit(event, enableButton, inputElement, textElement) {
  event.preventDefault();

  if (enableButton === true) {
    initTree(inputElement, textElement)
  } else {
    setValidInputField(inputElement, textElement);
  }
}

export { initValidation }
