// общие функции
const getRange = length => [...Array(length).keys()]
// получаем массив без последнего элемента
const getWithoutLastElement = array => array.slice(0, array.length - 1)
// если числа очень близки, то считаем их равными
const areEqual = (one, another) => Math.abs(one - another) < 0.00000000001
// случайный элемент из массива (для еды)
const getRandomFrom = array => array[Math.floor(Math.random() * array.length)]
// последний элемент мвссива (для головы) так как змею делали с конца
const getLastElement = array => array[array.length - 1]
// #крайний регион

// #геометрия области
// 
class Vector {
  constructor(x, y) {// массив координат
    this.x = x
    this.y = y
  }
// возвращаем новое значение вектора длягоовы
  subtract({ x, y }) {// Из одного вектора вычисляем другой
    return new Vector(this.x - x, this.y - y) // и возвращаем новое значение вектора
  }

  add({ x, y }) {
    return new Vector(this.x + x, this.y + y)
  }
// массштабируем вектор для тела
  scaleBy(number) {// умножаем компоненты на число
    return new Vector(this.x * number, this.y * number)
  }

  length() {
    return Math.hypot(this.x, this.y)
  }

  normalize() {
    return this.scaleBy(1 / this.length())
  }
// противоположны ли два вектора
  isOpposite(vector) {
    const { x, y } = this.add(vector)
    return areEqual(x, 0) && areEqual(y, 0)
  }

  equalTo({ x, y }) {
    return areEqual(this.x, x) && areEqual(this.y, y)
  }
}

class Segment {// змеякак массив точек (узлов)
  constructor(start, end) {// усли у змеи 5 узлов(это значит у неё 4сегмента)
    this.start = start// начало вектора
    this.end = end// конецвектора
  }

  getVector() {// получаем длинну отрезка
    return this.end.subtract(this.start)// из конечного отнимаем начальное
  }

  length() {// длинна отрезка
    return this.getVector().length()
  }

  isPointInside(point) {// 
    const first = new Segment(this.start, point)// точка начала сегмента
    const second = new Segment(point, this.end)// точка конца сегмента
    return areEqual(this.length(), first.length() + second.length())// находим эту точку
  }

  getProjectedPoint({ x, y }) {
    const { start, end } = this
    const { x: px, y: py } = end.subtract(start)
    const u = ((x - start.x) * px + (y - start.y) * py) / (px * px + py * py)
    return new Vector(start.x + u * px, start.y + u * py)
  }
}
// возвращаем сегменты из векторов
// получаем массив векторов
const getSegmentsFromVectors = vectors => getWithoutLastElement(vectors)
// берём текущиё и следующий и передаём в конструктор
  .map((one, index) => new Segment(one, vectors[index + 1]))

// время вызова setInterval
const UPDATE_EVERY = 1000 / 60

// векторное направление змеи клавишами
const DIRECTION = {
  TOP: new Vector(0, -1),
  RIGHT: new Vector(1, 0),
  DOWN: new Vector(0, 1),
  LEFT: new Vector(-1, 0)
}
// Начальные параметры
const DEFAULT_GAME_CONFIG = {
  width: 10,// ширина
  height: 10,// высота
  speed: 0.005,// скорость прохожденияклеток
  initialSnakeLength: 2,// длина змеи
  initialDirection: DIRECTION.RIGHT// направление вправо
}
// ключи клавиш клавиатуры (направления)
const MOVEMENT_KEYS = {
  TOP: [87, 38],
  RIGHT: [68, 39],
  DOWN: [83, 40],
  LEFT: [65, 37]
}
// пробел (остановка игры)
const STOP_KEY = 32

// расположение еды (чтоб еда не совпадала с телом змеи)
const getFood = (width, height, snake) => {
  const allPositions = getRange(width).map(x => 
    getRange(height).map(y => new Vector(x + 0.5, y + 0.5))// проходим по периметру поля
  ).flat()
  const segments = getSegmentsFromVectors(snake)
  const freePositions = allPositions
  // проверяем несовпадает ли еда со змеёй
    .filter(point => segments.every(segment => !segment.isPointInside(point)))
  return getRandomFrom(freePositions)
}

// 
// config (содержит настройки игры)
// состояние игры с полученными параметрпми
const getGameInitialState = (config = {}) => {
  const {
    width,// ширина
    height,// высота
    speed,// скорость 
    initialSnakeLength,// длина змеи 
    initialDirection// начальное направление движения (вправо)
  } = { ...config, ...DEFAULT_GAME_CONFIG }// делаем config по умолчанию
  const head = new Vector(// нахожим координату головы
    Math.round(width / 2) - 0.5,
    Math.round(height / 2) - 0.5
  )
//   находим координаты хвоста (относительно головы)
  const tailtip = head.subtract(initialDirection.scaleBy(initialSnakeLength))
  const snake = [tailtip, head]// создаём змею от хвоста к голове
  const food = getFood(width, height, snake)// координаты еды (передаём ширину, высоту (поля) и расположение змеи)
// возвращаем значения дляпереопределения змеи
  return {
    width,
    height,
    speed,
    initialSnakeLength,
    initialDirection,
    snake,
    direction: initialDirection,
    food,
    score: 0
  }
}
// создаём хвост (старая змея и расстояние)
const getNewTail = (oldSnake, distance) => {
  const { tail } = getWithoutLastElement(oldSnake).reduce((acc, point, index) => {
    if (acc.tail.length !== 0) {
      return {
        ...acc,
        tail: [...acc.tail, point]
      }
    }
    const next = oldSnake[index + 1]
    const segment = new Segment(point, next)
    const length = segment.length()
    if (length >= distance) {
      const vector = segment.getVector().normalize().scaleBy(acc.distance)
      return {
        distance: 0,
        tail: [...acc.tail, point.add(vector)]
      }
    } else {
      return {
        ...acc,
        distance: acc.distance - length
      }
    }
  }, { distance, tail: [] })
  return tail
}
// получаем направление
const getNewDirection = (oldDirection, movement) => {
  const newDirection = DIRECTION[movement] //задаём новое направление
  // новое направление отличается от старого
  const shouldChange = newDirection && !oldDirection.isOpposite(newDirection)
  return shouldChange ? newDirection : oldDirection//если направление сменилось, то возвращаем его, если нет, то прежнее
}
// обрабатываем тело змеи
const getStateAfterMoveProcessing = (state, movement, distance) => {
  const newTail = getNewTail(state.snake, distance)
  const oldHead = getLastElement(state.snake)
  const newHead = oldHead.add(state.direction.scaleBy(distance))// если движемся прямо
  const newDirection = getNewDirection(state.direction, movement)// если изменили направление
  if (!state.direction.equalTo(newDirection)) {
    const { x: oldX, y: oldY } = oldHead
    const [
      oldXRounded,
      oldYRounded,
      newXRounded,
      newYRounded
    ] = [oldX, oldY, newHead.x, newHead.y].map(Math.round)
    const getStateWithBrokenSnake = (old, oldRounded, newRounded, getBreakpoint) => {
      const breakpointComponent = oldRounded + (newRounded > oldRounded ? 0.5 : -0.5)
      const breakpoint = getBreakpoint(breakpointComponent)
      const vector = newDirection.scaleBy(distance - Math.abs(old - breakpointComponent))
      const head = breakpoint.add(vector)
      return {
        ...state,
        direction: newDirection,
        snake: [...newTail, breakpoint, head]
      }
    }
    if (oldXRounded !== newXRounded) {
      return getStateWithBrokenSnake(
        oldX,
        oldXRounded,
        newXRounded,
        x => new Vector(x, oldY)
      )
    }
    if (oldYRounded !== newYRounded) {
      return getStateWithBrokenSnake(
        oldY,
        oldYRounded,
        newYRounded,
        y => new Vector(oldX, y)
      )
    }
  }
  return {
    ...state,
    snake: [...newTail, newHead]
  }
}

const getStateAfterFoodProcessing = (state) => {
  const headSegment = new Segment(
    getLastElement(getWithoutLastElement(state.snake)),
    getLastElement(state.snake)
  )
  if (!headSegment.isPointInside(state.food)) return state

  const [tailEnd, beforeTailEnd, ...restOfSnake] = state.snake
  const tailSegment = new Segment(beforeTailEnd, tailEnd)
  const newTailEnd = tailEnd.add(tailSegment.getVector().normalize())
  const snake = [newTailEnd, beforeTailEnd, ...restOfSnake]
  const food = getFood(state.width, state.height, snake)
  return {
    ...state,
    snake,
    score: state.score + 1,
    food
  }
}

const isGameOver = ({ snake, width, height }) => {
  const { x, y } = getLastElement(snake)
  if (x < 0 || x > width || y < 0 || y > height) {
    return true
  }
  if (snake.length < 5) return false

  const [head, ...tail] = snake.slice().reverse()
  return getSegmentsFromVectors(tail).slice(2).find(segment => {
    const projected = segment.getProjectedPoint(head)
    if (!segment.isPointInside(projected)) {
      return false
    }
    const distance = new Segment(head, projected).length()
    return distance < 0.5
  })
}
// получение нового состояние процесса игры
const getNewGameState = (state, movement, timespan) => {
  const distance = state.speed * timespan// сколько змея прошла за заданное время
  const stateAfterMove = getStateAfterMoveProcessing(state, movement, distance)
  // если змея пересекла еду, то увеличиваем её и генерируем новое положение еды
  const stateAfterFood = getStateAfterFoodProcessing(stateAfterMove)
  if (isGameOver(stateAfterFood)) {// проверяем состояние игры
    // если закончилась, то генерируем начальное состояние
    return getGameInitialState(state)
  }
  return stateAfterFood// если не закончилась, то возвращаем состояние после обработки еды
}

// Находим по id игровое поле
const getContainer = () => document.getElementById('container')
// размер контейнера
const getContainerSize = () => {
  const { width, height } = getContainer().getBoundingClientRect()
  return { width, height }// возвращаем размер контейнера
}
// очистка значений контейнера
const clearContainer = () => {
  const container = getContainer()//берём его значение
  const [child] = container.children//дочерний элемент
  if (child) {
    container.removeChild(child)//передаём ему размер контейнера
  }
}
// вывод игры на экран
const getProjectors = (containerSize, game) => {
  const widthRatio = containerSize.width / game.width
  const heightRatio = containerSize.height / game.height
  const unitOnScreen = Math.min(widthRatio, heightRatio)// ячейка-единица измерения
// 
  return {// узнаём расстояние ()
    projectDistance: distance => distance * unitOnScreen,
    projectPosition: position => position.scaleBy(unitOnScreen)
  }
}
// принимаем размеры 
const getContext = (width, height) => {
    // берём 'tvtyn контейнера
  const [existing] = document.getElementsByTagName('canvas')
//   проверяем есть ли canvas
  const canvas = existing || document.createElement('canvas')
  if (!existing) {// если нет canvas. то добавляем его
    getContainer().appendChild(canvas)
  }
  const context = canvas.getContext('2d')// получаем контекст из поля
//   очищаем поле
  context.clearRect(0, 0, canvas.width, canvas.height)
//   усттанавливаем width и height
  canvas.setAttribute('width', width)
  canvas.setAttribute('height', height)
  return context
}
// прозрачность ячеен поля
// const renderCells = (context, cellSide, width, height) => {
//   context.globalAlpha = 0
//   getRange(width).forEach(column => getRange(height).forEach(row => {
//     if ((column + row) % 2 === 1) {
//       context.fillRect(column * cellSide, row * cellSide, cellSide, cellSide)
//     }
//   }))
//   context.globalAlpha = 1
// }
// параметры еды
const renderFood = (context, cellSide, { x, y }) => {
  context.beginPath()
  context.arc(x, y, cellSide / 2.5, 0, 2 * Math.PI)
  context.fillStyle = 'red' // цвет
  context.fill()
}
// параметры змеи
const renderSnake = (context, cellSide, snake) => {
  context.lineWidth = cellSide
  context.strokeStyle = 'silver'
  context.beginPath()
  snake.forEach(({ x, y }) => context.lineTo(x, y))
  context.stroke()
}
// выводим результары
const renderScores = (score, bestScore) => {
  document.getElementById('current-score').innerText = score
  document.getElementById('best-score').innerText = bestScore
}

const render = ({
  game: {
    width,
    height,
    food,// еда
    snake,// змея
    score
  },
  bestScore,// функция расстояния
  projectDistance,// вектора
  projectPosition
}) => {
    // поле в рикселях
  const [viewWidth, viewHeight] = [width, height].map(projectDistance)
//  возвращаем контекст 
  const context = getContext(viewWidth, viewHeight)
  const cellSide = viewWidth / width//делим ширину экрана на ширину поля
  // renderCells(context, cellSide, width, height)
  renderFood(context, cellSide, projectPosition(food))//для еды
  renderSnake(context, cellSide, snake.map(projectPosition))// позиция для змеи
  renderScores(score, bestScore)//текущий лучший результат
}

// 
const getInitialState = () => {
  const game = getGameInitialState()// состояние игры (размер, счёт, координата змеии)
  const containerSize = getContainerSize() // размер поля игры
  return {
    game,
    bestScore: parseInt(localStorage.bestScore) || 0,// если результат 0, то берём результат из localStorage
    ...containerSize,// удаляем контейнер (чтоб получить ширину и высоту)
    ...getProjectors(containerSize, game)// возвращаем координату и расстояние
  }
}
// закончилась ли игра
const getNewStatePropsOnTick = (oldState) => {
  if (oldState.stopTime) return oldState// если игра закончилась
  const lastUpdate = Date.now() // возвращаем последнее обновление
  if (oldState.lastUpdate) {// если не закончилась
    const game = getNewGameState(// возвращаем обновение в реальном времени
      oldState.game,
      oldState.movement,
      lastUpdate - oldState.lastUpdate
    )
    const newProps = {
      game,
      lastUpdate
    }
    // проверяем не стал ли счет больше чем лучший результат
    if (game.score > oldState.bestScore) {
      // если результат лучше, обновляем localStorage
      localStorage.setItem('bestScore', game.score)
      return {
        ...newProps,
        bestScore: game.score// возвращаем обновлённый результат
      }
    }
    return newProps
  }

  return {
    lastUpdate
  }
}
// 
const startGame = () => {
  let state = getInitialState()// переменная состояния
  const updateState = props => {
    state = { ...state, ...props } // получаем объект и меняем состояние
  }
// изменение размера окна (обработчик событий)
  window.addEventListener('resize', () => {
    clearContainer()//удаляем размеры
    const containerSize = getContainerSize()
    // адаптируем поле в зависимости от размера экрана
    updateState({ ...containerSize, ...getProjectors(containerSize, state.game) })
    tick()
  })
  // при нажатии и удерживании клавиши 
  window.addEventListener('keydown', ({ which }) => {
    const entries = Object.entries(MOVEMENT_KEYS)
    // получаем ключи клавиш
    const [movement] = entries.find(([, keys]) => keys.includes(which)) || [undefined]
    updateState({ movement })//если клавиша нажата, то 
  })
  // при нажатии клавиши вверх
  window.addEventListener('keyup', ({ which }) => {
    updateState({ movement: undefined })
    if (which === STOP_KEY) {// если нажат пробел
      const now = Date.now()
      if (state.stopTime) {// если время существует, то игрок хочет продолжить игру
        updateState({ stopTime: undefined, lastUpdate: state.time + now - state.lastUpdate })
      } else { 
        updateState({ stopTime: now })
      }
    }
  })
// обновление состояния
  const tick = () => {
    const newProps = getNewStatePropsOnTick(state) // получаем новые свойства для состояния
    updateState(newProps)
    render(state)// для рендеренга
  }
  setInterval(tick, UPDATE_EVERY)
}
// #endregion

startGame()