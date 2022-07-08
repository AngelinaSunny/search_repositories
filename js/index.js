const appWrapper = document.querySelector('.app');
const input = document.querySelector('.input');
const hintList = document.querySelector('.hint-list');

const URL = 'https://api.github.com/search/repositories';

const repositList = document.querySelector('.repo-list');
const repoTemplate = document.querySelector('#repo').content;
const btnClose = document.querySelector('.repo-list__item-close');

let valueInput;
let checkArr = [];

////Создаем карточку репозитория/////
function creatCardRepo(item) {
  let card = repoTemplate.cloneNode(true);
  const repoTextName = card.querySelector('.repo-list__text-name');
  const repoTextOwner = card.querySelector('.repo-list__text-owner');
  const repoTextStars = card.querySelector('.repo-list__text-stars');

  repoTextName.textContent = item.name;
  repoTextOwner.textContent = item.owner.login;
  repoTextStars.textContent = item['stargazers_count'];
  repositList.appendChild(card);
}

//////удаляем карточку репозитория по клику
repositList.addEventListener('click', (e) => {
  if (e.target.className != 'repo-list__img-close') return;
  let itemRepo = e.target.closest('.repo-list__item');
  let itemName = itemRepo.querySelector('.repo-list__text-name').textContent;

  checkArr = checkArr.filter(item => item != String(itemName));
  console.log(checkArr);
  itemRepo.remove();
})

///   ВВОД ТЕКСТА В ИНПУТ  ///

/// фиксирую значение инпута///
function onChange() {
  valueInput = input.value;
}

input.addEventListener('keyup', onChange);

///очищаем инпут и убираем подсказки///
function clearSearch() {
  let hintListItems = document.querySelectorAll('.hint-list__item');
  hintListItems.forEach(item => {
    item.remove();
  });
}

///получаем данные сервера и обрабатываем их///
async function getRepositories(value) {
  try {
    return await fetch(`${URL}?q=${value}&per_page=5`)
      .then(response => response.json())
      .then(reposit => {

        //// формируем подсказки ////
        function createSearch() {
          reposit.items.forEach((item) => {
            if (hintList.childNodes.length < 6) {
              const hintElem = document.createElement('li');
              hintElem.classList.add('hint-list__item');
              hintList.appendChild(hintElem);
              hintElem.textContent = item.name;

              ////слушаем клики для добавления репозитория из подсказок///
              hintElem.addEventListener('click', () => {
                if (!checkArr.includes(item.name)) {
                  creatCardRepo(item);
                  checkArr.push(item.name);
                  input.value = "";
                  clearSearch();
                }
              });
            } else {
              clearSearch();
              createSearch();
            }
          })
        }
        createSearch();
      });
  } catch (err) {
    throw new Error(err);
  }
}

//регулируем количество отправляемых запросов, создаем задержку
const debounce = (fn, ms) => {
  let timeout;
  return function(...arg) {
    const fnCall = () => { fn.apply(this, arg) };
    clearTimeout(timeout);

    timeout = setTimeout(fnCall, ms);
  };
}

getRepositories = debounce(getRepositories, 500);

input.addEventListener('keyup', () => {
  getRepositories(valueInput);
});