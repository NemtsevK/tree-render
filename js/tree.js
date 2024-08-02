const START_SYMBOL = '(';
const END_SYMBOL = ')';
const PARENT_SYMBOL = '-';
const BRANCH_SYMBOL = '|';
const EMPTY_SYMBOL = ' ';

const PARENT_STRING = PARENT_SYMBOL.repeat(3) + '+';
const BRANCH_STRING = BRANCH_SYMBOL + EMPTY_SYMBOL.repeat(3);
const EMPTY_STRING = EMPTY_SYMBOL.repeat(4);

/**
 *
 * @param inputElement
 * @param textElement
 */
function initTree(inputElement, textElement) {
  const outputElement = document.querySelector('.main__output-text');

  try {
    inputElement.classList.remove('form__input--error');
    const tree = parseTree(inputElement.value);
    outputElement.textContent = renderTree(tree);
    outputElement.classList.remove('main__output-text--hide');
  } catch (error) {
    inputElement.classList.add('form__input--error');
    textElement.classList.add('form__text-error--active');
    textElement.textContent = 'Ошибка: ' + error.message;
    console.log(error);
  }
}

/**
 * формирование древа
 * @param elements
 * @returns {string}
 */
function renderTree(elements) {
  const matrix = transpose(changeMatrixElements(elements));

  let result = '';

  for (let col = 0; col < matrix.length; col++) {
    for (let row = 0; row < matrix[col].length; row++) {
      result += matrix[col][row];
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

  for (let col = 0; col < matrix.length; col++) {
    let lastNonNullIndex = -1;
    let firstNonNullIndex = -1;

    //поиск первого не Null и последнего не Null элемента
    for (let row = 0; row < matrix[col].length; row++) {
      if (isNumeric(matrix[col][row]) || matrix[col][row] === PARENT_STRING) {
        if (firstNonNullIndex === -1) {
          firstNonNullIndex = row;
        }
        lastNonNullIndex = row;
      }
    }

    for (let row = 0; row < matrix[col].length; row++) {
      //вставка пустых ячеек перед первой цифрой
      if (matrix[col][row] === null) {
        if (row < firstNonNullIndex) {
          matrix[col][row] = EMPTY_STRING;
        }

        // Заменяем null после последнего числа на пробел
        if (row > lastNonNullIndex) {
          matrix[col][row] = EMPTY_STRING;
        }
      }
    }

    //заполнение пустых ячеек
    for (let row = 0; row < matrix[col].length; row++) {
      if (matrix[col][row] === null) {
        matrix[col][row] = findNumberRows(matrix, col, row) === true ? BRANCH_STRING : EMPTY_STRING;
      }
    }

    const maxCountDigits = getMaxCountDigits(matrix, col);

    //Добавление символов в зависимости от максимального кол-ва цифр в числах массива
    for (let row = 0; row < matrix[col].length; row++) {
      const currentElementLength = matrix[col][row].toString().length;

      //если у текущего элемента цифр меньше максимального и это не пустая строка
      if (currentElementLength < maxCountDigits && matrix[col][row] !== EMPTY_STRING) {
        const symbol = (col < (matrix.length - 1) && matrix[col + 1][row] === PARENT_STRING) ? PARENT_SYMBOL : ' ';
        matrix[col][row] += symbol.repeat(maxCountDigits - currentElementLength);
      } else {
        //если текущий элемент является строкой ветки или пустой строкой
        if (matrix[col][row] === BRANCH_STRING || matrix[col][row] === EMPTY_STRING) {
          matrix[col][row] += EMPTY_SYMBOL.repeat(maxCountDigits - 1);
        }
      }
    }
  }

  return matrix;
}

/**
 * поиск ячеек далее по строкам
 * @param matrix
 * @param col
 * @param row
 * @return {boolean}
 */
function findNumberRows(matrix, col, row) {
  let find = false;

  for (let i = 0; i < (matrix[col].length - row); i++) {
    const nextRow = row + i

    //если следующая ячейка является числом
    if (isNumeric(matrix[col][nextRow])) {
      find = true;
      break;
    }

    //если следующая ячейка является PARENT_STRING
    if (matrix[col][nextRow] === PARENT_STRING) {
      find = false;
      break;
    }
  }

  return find;
}

/**
 * Добавление родительской ветви
 * @param elements
 * @return {*}
 */
function addParentsBranches(elements) {
  const matrix = convertToMatrix(elements);

  for (let col = 0; col < matrix.length; col++) {
    for (let row = 0; row < matrix[col].length; row++) {
      //если текущий элемент не является последним
      //и текущий элемент и следующий элемент по диагонали являются числами
      if (col < matrix.length - 1 && row < matrix[col].length - 1 && isNumeric(matrix[col][row]) && isNumeric(matrix[col + 1][row + 1])) {
        matrix[col + 1][row] = PARENT_STRING;
      }
    }
  }
  return matrix;
}

/**
 * Нахождение максимального кол-ва цифр в числах массива
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

  for (let col = 0; col < countColumn; col++) {
    matrix[col] = [];

    for (let j = 0; j < elements.length; j++) {
      const cell = elements[j].column === col ? elements[j].number : null;
      matrix[col].push(cell);
    }
  }

  return matrix;
}

/* вытащить функцию parseSubtree во внешнюю область*/
/**
 * Преобразование строки в массив с данными об узлах дерева
 * @param string
 * @returns {*[]}
 */
function parseTree(string) {
  let index = 0;

  function parseSubtree(result = [], level = 0) {

    while (index < string.length) {
      if (string[index] === START_SYMBOL) {
        index++;
        result = parseSubtree(result, level + 1);
      } else if (string[index] === END_SYMBOL) {
        index++;
        return result;
      } else if (string[index] === EMPTY_SYMBOL) {
        index++;
      } else {
        let digit = '';

        while (index < string.length && string[index].match(/[0-9]/)) {
          digit += string[index];
          index++;
        }

        result.push({ number: Number(digit), column: level });
      }
    }
    return result;
  }

  if (string[0] === START_SYMBOL && string[string.length - 1] === END_SYMBOL) {
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

export { initTree }

//(1 (299 (10) 5 6 (4 5858 6 (7 1 2 1) 108 9 (9)) 3 (9 2 3 4 5 (1 2))) 2  3 5 3 3 5 5 (1(2(3 1 22542515))) 6 (1 (2 (3 (4)))))
