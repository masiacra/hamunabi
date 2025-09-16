import { createInterface } from "node:readline/promises";

const readlineInterface = createInterface({
  input: process.stdin,
  output: process.stdout,
});
/**
 * общее количество зерна
 */
let harvest_total: number;
/**
 * сколько зерна принес один акр земли
 */
let harvest: number;
/**
 * зерно, чтобы накормить людей
 */
let food: number;
/**
 * номер года
 */
let year: number;
/**
 * число акров земли во владении
 */
let land: number;
/**
 * съедено крысами
 */
let rats: number;
/**
 * число умерших от голода в прошлом году
 */
let starved: number;
/**
 * население
 */
let population: number;
/**
 * сколько всего человек умерло от голода
 */
let died_total: number;
/**
 * средний процент умерших от голода за все годы
 */
let percent_died: number;
/**
 * число людей, прибывших в город в прошлом году
 */
let people_came: number;
/**
 * зерно в хранилищах
 */
let grain: number;

export const getRandomInteger = (min: number, max: number): number => {
  min = Math.ceil(min);
  max = Math.floor(max);

  return Math.floor(Math.random() * (max - min)) + min;
};

function quit(): void {
  console.log("\n\n\n До встречи.\n\n");
  readlineInterface.close();
  process.exit(1);
}

function prinNotEnoughGrain(): void {
  console.log(`Подумайте еще раз. У Вас всего ${grain} бушелей зерна.`);
}

function printNotEnoughLand(): void {
  console.log(`Подумайте еще, у Вас есть только ${land} акров земли.`);
}

function endGameBad(): void {
  console.log(
    "Ваше правление было ужасным, \n Вас объявили национальным предателем и изгнали из резиденции!!!\n"
  );
  quit();
}

function input(question: string): Promise<string> {
  return readlineInterface.question(question);
}

async function tradeLand(): Promise<void> {
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

async function feedPeople(): Promise<void> {
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
async function plantSeeds(): Promise<void> {
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

function ratsInvasion(): void {
  rats = 0;
  const chance = getRandomInteger(1, 6);

  if (chance % 2 === 0) {
    rats = Math.floor(grain / chance);
  }
  grain -= rats;
}

function harvestGrain(): void {
  grain = grain + harvest_total;
}

function changePopulation(): void {
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

function plague(): void {
  if (year > 1 && getRandomInteger(0, 99) < 15) {
    population = Math.floor(population * 0.5);
    console.log("\n Эпидемия чумы! Половина населения умерла.");
  }
}

function report(): void {
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

async function main(): Promise<void> {
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
