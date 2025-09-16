// @ts-check
import { createInterface } from "node:readline/promises";

const readlineInterface = createInterface({
  input: process.stdin,
  output: process.stdout,
});
/**
 * общее количество зерна
 * @type {number}
 */
let harvest_total;
/**
 * сколько зерна принес один акр земли
 * @type {number}
 */
let harvest;
/**
 * зерно, чтобы накормить людей
 * @type {number}
 */
let food;
/**
 * номер года
 * @type {number}
 */
let year;
/**
 * число акров земли во владении
 * @type {number}
 */
let land;
/**
 * съедено крысами
 * @type {number}
 */
let rats;
/**
 * число умерших от голода в прошлом году
 * @type {number}
 */
let starved;
/**
 * население
 * @type {number}
 */
let population;
/**
 * сколько всего человек умерло от голода
 * @type {number}
 */
let died_total;
/**
 * средний процент умерших от голода за все годы
 * @type {number}
 */
let percent_died;
/**
 * число людей, прибывших в город в прошлом году
 * @type {number}
 */
let people_came;
/**
 * зерно в хранилищах
 * @type {number}
 */
let grain;

/**
 *
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
export const getRandomInteger = (min, max) => {
  min = Math.ceil(min);
  max = Math.floor(max);

  return Math.floor(Math.random() * (max - min)) + min;
};

function quit() {
  console.log("\n\n\n До встречи.\n\n");
  readlineInterface.close();
  process.exit(1);
}

function prinNotEnoughGrain() {
  console.log(`Подумайте еще раз. У Вас всего ${grain} бушелей зерна.`);
}

function printNotEnoughLand() {
  console.log(`Подумайте еще, у Вас есть только ${land} акров земли.`);
}

function endGameBad() {
  console.log(
    "Ваше правление было ужасным, \n Вас объявили национальным предателем и изгнали из резиденции!!!\n"
  );
  quit();
}

/**
 *
 * @param {string} question
 */
function input(question) {
  return readlineInterface.question(question);
}

async function tradeLand() {
  let cost = getRandomInteger(17, 27);
  console.log(`Стоимость земли сейчас составляет ${cost} бушелей за акр.`);
  let byusell = 0;

  while (true) {
    byusell = Number(
      await input("Сколько акров вы хотите купить или продать? ")
    );

    if (byusell < 0 && -byusell > land) {
      printNotEnoughLand();
      continue;
    }

    // вместо денег используется зерно, поэтому смотрим, сколько у игрока зерна
    if (byusell > 0 && cost * byusell > grain) {
      prinNotEnoughGrain();
      continue;
    }

    break;
  }

  land = land + byusell;
  grain = grain - cost * byusell;
}

async function feedPeople() {
  console.log("");
  while (true) {
    food = Number(
      await input("Сколько бушелей зерна Вы потратите, чтобы накормить людей? ")
    );

    if (food < 0) {
      continue;
    }

    if (food <= grain) {
      break;
    }

    prinNotEnoughGrain();
  }

  grain -= food;
}

/**
 * сколько зерна будет посеяно
 */
async function plantSeeds() {
  console.log("");
  let plant = 0;

  while (true) {
    plant = Number(await input("Сколько акров земли Вы хотите засеять? "));

    if (plant < 0) {
      continue;
    }

    if (plant > land) {
      printNotEnoughLand();
      continue;
    }

    if (plant / 2 > grain) {
      prinNotEnoughGrain();
      continue;
    }
    if (plant > 10 * population) {
      console.log(`У Вас только ${population} человек для работы на полях!`);
      continue;
    }

    break;
  }

  grain = grain - Math.floor(plant / 2);
  harvest = getRandomInteger(1, 6);

  harvest_total = plant * harvest;
}

function ratsInvasion() {
  rats = 0;
  const chance = getRandomInteger(1, 6);

  if (chance % 2 === 0) {
    rats = Math.floor(grain / chance);
  }
  grain -= rats;
}

function harvestGrain() {
  grain = grain + harvest_total;
}

function changePopulation() {
  people_came =
    Math.floor(
      Math.floor((getRandomInteger(1, 6) * (20 * land + grain)) / population) /
        100
    ) + 1;
  starved = population - Math.floor(food / 20);

  if (starved <= 0) {
    starved = 0;
  } else {
    if (starved > 0.45 * population) {
      console.log(`\nЗа год умерло ${starved} человек!!!`);
      endGameBad();
    }

    percent_died = Math.floor(
      Math.floor((year - 1) * percent_died + (starved * 100) / population) /
        year
    );
    population -= starved;
    died_total += starved;
  }
  population += people_came;
}

function plague() {
  if (year > 1 && getRandomInteger(0, 99) < 15) {
    population = Math.floor(population * 0.5);
    console.log("\n Эпидемия чумы! Половина населения умерла.");
  }
}

function report() {
  console.log("\nХаммурапи, сообщаю Вам, ");
  console.log(
    `в прошлом ${year} году ${starved} людей умерли от голода, ${people_came} прибыло в город.`
  );
  console.log(`Всего в городе живет ${population} человек.`);
  console.log(`Город владеет ${land} акров земли.`);
  console.log(`Вы собрали ${harvest} бушелей с акра земли.`);
  console.log(`Крысы съели ${rats} бушелей зерна.`);
  console.log(`Сейчас у Вас ${grain} бушелей в хранилище.\n`);
}

function final() {
  console.log(`За прошедшие десять лет в среднем ${percent_died} процентов`);
  console.log(
    `населения в год умирало от голода. Всего умерло ${died_total} человек!!!`
  );
  const L = Math.floor(land / population);

  console.log("В начале правления у Вас было 10 акров земли на человека, ");
  console.log(`а в конце стало ${L} акров на человека. \n`);

  if (percent_died > 33 || L < 7) {
    endGameBad();
  } else if (percent_died > 10 || L < 9) {
    console.log("Своим жестким руководством Вы переплюнули Ивана Грозного. ");
    console.log("Оставшиеся люди долго будут ненавидеть Вас!!!");
  } else if (percent_died > 3 || L < 10) {
    console.log("Ваше правление было не самым плохим.");
    console.log(
      `Хотя ${getRandomInteger(0, Math.round(population * 0.8))} человек`
    );
    console.log(
      "предпочли бы, чтобы Ваша жизнь закончилась в результате покушения."
    );
  } else {
    console.log("Фантастический результат!!! Даже Карл Великий и");
    console.log("Петр Первый не смогли бы лучше!");
  }
}

console.log("\t\t\t\tХАММУРАППИ");
console.log("\n\n\nПопробуйте управлять древним шумерским государством");
console.log("в течение 10 лет. \n");

year = 0;
starved = 0;
population = 100;
rats = 200;
harvest_total = 3000;
grain = harvest_total - rats;
harvest = 3;
land = Math.floor(harvest_total / harvest);
people_came = 5;
percent_died = 0;
died_total = 0;

async function main() {
  while (true) {
    year += 1;
    plague();
    report();
    if (year === 11) {
      break;
    }
    await tradeLand();
    await feedPeople();
    await plantSeeds();
    ratsInvasion();
    harvestGrain();
    changePopulation();
  }
  final();
  quit();
}

main();
