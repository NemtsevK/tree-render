const PARENT_SYMBOL = '---+';
const BRANCH_SYMBOL = '|   ';
const EMPTY_SYMBOL = '    ';

const form = document.querySelector('form');

const onFormSubmit = (event) => {
  event.preventDefault();
  const inputTree = document.querySelector('.input');
  const outputTree = document.querySelector('.output');

  try {
    const tree = parseTree(inputTree.value);
    outputTree.textContent = renderTree(tree);
  } catch (error) {
    outputTree.textContent = 'Ошибка: ' + error.message;
  }
}

form.addEventListener('submit', onFormSubmit);

/**
 * формирование древа
 * @param elements
 * @returns {string}
 */
function renderTree(elements) {
  const matrix = transpose(changeMatrixElements(elements));

  let result = '';

  for (let i = 0; i < matrix.length; i++) {
    for (let j = 0; j < matrix[i].length; j++) {
      result += matrix[i][j];
    }
    result += '\n';
  }

  return result;
}

/**
 * Преобразование элементов матрицы
 * @param elements
 * @returns {*[]}
 */
function changeMatrixElements(elements) {
  const matrix = addParentsBranches(elements);

  for (let i = 0; i < matrix.length; i++) {
    let lastNonNullIndex = -1;
    let firstNonNullIndex = -1;

    //поиск первого не Null и последнего не Null элемента
    for (let j = 0; j < matrix[i].length; j++) {
      if (isNumeric(matrix[i][j]) || matrix[i][j] === PARENT_SYMBOL) {
        if (firstNonNullIndex === -1) {
          firstNonNullIndex = j;
        }
        lastNonNullIndex = j;
      }
    }

    for (let j = 0; j < matrix[i].length; j++) {
      //вставка пустых ячеек перед первой цифрой
      if (matrix[i][j] === null) {
        if (j < firstNonNullIndex) {
          matrix[i][j] = EMPTY_SYMBOL;
        }

        // Заменяем null после последнего числа на пробел
        if (j > lastNonNullIndex) {
          matrix[i][j] = EMPTY_SYMBOL;
        }
      }
    }

    for (let j = 0; j < matrix[i].length; j++) {
      if (matrix[i][j] === null) {
        if ((isNumeric(matrix[i][j - 1]) || matrix[i][j - 1] === BRANCH_SYMBOL) && matrix[i][j + 1] !== PARENT_SYMBOL) {
          matrix[i][j] = BRANCH_SYMBOL;
        } else {
          matrix[i][j] = EMPTY_SYMBOL;
        }
      }
    }

    const maxCountDigits = getMaxCountDigits(matrix, i)

    //Добавление символов в зависимости от максимального кол-ва цифр в числах массива
    for (let j = 0; j < matrix[i].length; j++) {
      const elementLength = matrix[i][j].toString().length;

      if (elementLength < maxCountDigits) {
        const symbol = (i < (matrix.length - 1) && matrix[i + 1][j] === PARENT_SYMBOL) ? '-' : '';
        matrix[i][j] += symbol.repeat(maxCountDigits - elementLength);

      } else {
        if (matrix[i][j] === BRANCH_SYMBOL || matrix[i][j] === EMPTY_SYMBOL) {
          matrix[i][j] += ' '.repeat(maxCountDigits - 1);
        }
      }
    }
  }

  return matrix;
}

/**
 * Добавление родительской ветви
 * @param elements
 * @return {*}
 */
function addParentsBranches(elements) {
  const matrix = convertToMatrix(elements);

  for (let i = 0; i < matrix.length; i++) {
    for (let j = 0; j < matrix[i].length; j++) {
      if (i < matrix.length - 1 && j < matrix[i].length - 1 && isNumeric(matrix[i][j]) && isNumeric(matrix[i + 1][j + 1])) {
        matrix[i + 1][j] = PARENT_SYMBOL;
      }
    }
  }
  return matrix;
}

/**
 * Нахождение максимальное кол-во цифр в числах массива
 * @param matrix
 * @param i
 * @return {*}
 */
function getMaxCountDigits(matrix, i) {
  let maxCountDigits = 0;

  for (let j = 0; j < matrix[i].length; j++) {
    const elementLength = matrix[i][j].toString().length;

    if (isNumeric(matrix[i][j]) && elementLength > maxCountDigits) {
      maxCountDigits = elementLength;
    }
  }

  return maxCountDigits;
}

/**
 * Преобразование массива в матрицу
 * @param elements
 * @returns {*[]}
 */
function convertToMatrix(elements) {
  const columns = elements.map(item => item.column);
  const countColumn = Math.max(...columns) + 1;
  let matrix = [];

  for (let i = 0; i < countColumn; i++) {
    matrix[i] = [];
    for (let j = 0; j < elements.length; j++) {
      if (elements[j].column === i) {
        matrix[i].push(elements[j].number);
      } else {
        matrix[i].push(null);
      }
    }
  }

  return matrix;
}

/**
 * Преобразование строки в массив с данными об узлах дерева
 * @param string
 * @returns {*[]}
 */
function parseTree(string) {
  let index = 0;

  function parseSubtree(result = [], level = 0) {

    while (index < string.length) {
      if (string[index] === '(') {
        index++;
        result = parseSubtree(result, level + 1);
      } else if (string[index] === ')') {
        index++;
        return result;
      } else if (string[index] === ' ') {
        index++;
      } else {
        let digit = '';

        while (index < string.length && (string[index].match(/[0-9-]/))) {
          digit += string[index];
          index++;
        }

        result.push({ number: Number(digit), column: level });
      }
    }
    return result;
  }

  if (string[0] === '(' && string[string.length - 1] === ')') {
    index = 1;
    return parseSubtree();
  } else {
    throw new Error('Неправильный формат');
  }
}

/**
 * Транспонирование матрицы
 * @param matrix
 * @returns {*[]}
 */
function transpose(matrix) {
  const rows = matrix.length;
  const cols = matrix[0].length;
  const transposed = [];

  for (let i = 0; i < cols; i++) {
    transposed[i] = [];

    for (let j = 0; j < rows; j++) {
      transposed[i][j] = matrix[j][i];
    }
  }

  return transposed;
}

/**
 * Проверка на число
 * @param value
 * @returns {boolean}
 */
function isNumeric(value) {
  return typeof value === 'number' && !isNaN(value);
}
