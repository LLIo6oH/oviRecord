import arenas from './arenas.js';

const GRETZKY_GOALS = 894;
const WASHINGTON_CAPITALS_TEAM_ID = "WSH";
const PROXY_URL = "http://localhost:3000";

const arenaTeamsElement = document.getElementById("arena-teams");
const score1Element = document.getElementById("score1");
const arenaNameElement = document.getElementById("arena-name");
const arenaDateElement = document.getElementById("arena-date");
const arenaAddressElement = document.getElementById("arena-address");
const currentArenaElement = document.getElementById("current-arena");
const pastArenaElements = [
    document.getElementById("past-arena1"),
    document.getElementById("past-arena2")
];
const futureArenaElements = [
    document.getElementById("future-arena1"),
    document.getElementById("future-arena2")
];

async function getOvechkinGoals() {
    try {
        const response = await fetch(`${PROXY_URL}/player/8471214`);
        const data = await response.json();
        return data.featuredStats?.regularSeason?.career?.goals || 0;
    } catch (error) {
        console.error("Ошибка при загрузке данных Овечкина:", error);
        return 0;
    }
}

async function getSchedule() {
    try {
        const response = await fetch(`${PROXY_URL}/club-schedule/${WASHINGTON_CAPITALS_TEAM_ID}`);
        const data = await response.json();
        return data.games || [];
    } catch (error) {
        console.error("Ошибка при загрузке расписания:", error);
        return [];
    }
}

// Находим игру, в которой Овечкин побьет рекорд
function findRecordBreakingGame(schedule, ovechkinGoals) {
    const goalsNeeded = GRETZKY_GOALS - ovechkinGoals;
    if (goalsNeeded <= 0) return null; // Рекорд уже побит

    // Текущая дата
    const currentDate = new Date();

    // Находим индекс ближайшей не прошедшей игры
    let nearestFutureGameIndex = -1;

    for (let i = 0; i < schedule.length; i++) {
        const gameDate = new Date(schedule[i].startTimeUTC);

        // Если игра еще не прошла
        if (gameDate >= currentDate) {
            nearestFutureGameIndex = i;
            break; // Нашли первую не прошедшую игру
        }
    }

    // Если не нашли ни одной не прошедшей игры
    if (nearestFutureGameIndex === -1) {
        return null;
    }

    // Вычисляем индекс игры, в которой Овечкин побьет рекорд
    const recordGameIndex = nearestFutureGameIndex + goalsNeeded - 1;

    // Проверяем, что такая игра существует
    if (recordGameIndex >= schedule.length) {
        return null; // Если матчей недостаточно
    }

    return schedule[recordGameIndex]; // Возвращаем игру, в которой он побьет рекорд
}

// Отображаем информацию о матче и карусель
async function displayGameInfo(recordGame, pastGames, upcomingGames) {
    if (!recordGame) {
        arenaNameElement.textContent = "Рекорд уже побит или матчей недостаточно!";
        arenaDateElement.textContent = "";
        arenaAddressElement.textContent = "";
        arenaTeamsElement.innerHTML = ""; // Очищаем логотипы
        return;
    }

    const arenaName = recordGame.venue?.default || "Unknown Arena";
    const gameDate = new Date(recordGame.startTimeUTC).toLocaleDateString();
    const arenaData = arenas[arenaName] || {
        address: "Адрес не найден",
        image: "arenas/default_arena.jpg"
    };

    // Обновляем информацию
    arenaNameElement.textContent = arenaName.toUpperCase();
    arenaDateElement.textContent = gameDate;
    arenaAddressElement.textContent = arenaData.address;
    currentArenaElement.querySelector("img").src = arenaData.image;

    // Логотипы команд
    const homeTeamLogo = recordGame.homeTeam.logo || "teams/default_logo.png";
    const awayTeamLogo = recordGame.awayTeam.logo || "teams/default_logo.png";

    arenaTeamsElement.innerHTML = `
        <img src="${homeTeamLogo}" alt="Home Team">
        <span style="font-size: 24px; font-weight: bold;">VS</span>
        <img src="${awayTeamLogo}" alt="Away Team">
    `;

    // Обновляем прошлые и будущие арены
    pastArenaElements.forEach((element, i) => {
        if (pastGames[i]) {
            const pastArenaData = arenas[pastGames[i].venue.default] || { image: "arenas/default_arena_past.jpg" };
            element.querySelector("img").src = pastArenaData.image;

            // Обновляем дату и имя арены
            const pastArenaDate = new Date(pastGames[i].startTimeUTC).toLocaleDateString();
            const pastArenaName = pastGames[i].venue.default || "Unknown Arena";
            element.querySelector(".arena-label-date").textContent = pastArenaDate;
            element.querySelector(".arena-label-name").textContent = pastArenaName;
        } else {
            element.querySelector("img").src = "arenas/default_arena_past.jpg"; // Заглушка, если данных нет
            element.querySelector(".arena-label-date").textContent = "";
            element.querySelector(".arena-label-name").textContent = "";
        }
    });

    futureArenaElements.forEach((element, i) => {
        if (upcomingGames[i]) {
            const futureArenaData = arenas[upcomingGames[i].venue.default] || { image: "arenas/default_arena_next.jpg" };
            element.querySelector("img").src = futureArenaData.image;

            // Обновляем дату и имя арены
            const futureArenaDate = new Date(upcomingGames[i].startTimeUTC).toLocaleDateString();
            const futureArenaName = upcomingGames[i].venue.default || "Unknown Arena";
            element.querySelector(".arena-label-date").textContent = futureArenaDate;
            element.querySelector(".arena-label-name").textContent = futureArenaName;
        } else {
            element.querySelector("img").src = "arenas/default_arena_next.jpg"; // Заглушка, если данных нет
            element.querySelector(".arena-label-date").textContent = "";
            element.querySelector(".arena-label-name").textContent = "";
        }
    });

    // Обновляем ссылку на билеты
    const ticketLinkElement = document.getElementById("ticket-link");
    if (recordGame.ticketsLink) {
        ticketLinkElement.href = recordGame.ticketsLink;
    } else {
        ticketLinkElement.style.display = "none"; // Скрыть кнопку, если ссылки нет
    }
}

async function main() {
    try {
        // Загружаем данные
        const [ovechkinGoals, schedule] = await Promise.all([
            getOvechkinGoals(),
            getSchedule()
        ]);

        // Обновляем счет Овечкина
        score1Element.textContent = ovechkinGoals;

        // Находим игру, в которой Овечкин побьет рекорд
        const recordGame = findRecordBreakingGame(schedule, ovechkinGoals);

        if (!recordGame) {
            // Если рекорд уже побит или матчей недостаточно
            displayGameInfo(null, [], []);
            return;
        }

        // Находим индекс игры, в которой Овечкин побьет рекорд
        const recordGameIndex = schedule.indexOf(recordGame);

        // Находим две предыдущие игры
        const pastGames = schedule.slice(Math.max(recordGameIndex - 2, 0), recordGameIndex);

        // Находим две следующие игры
        const upcomingGames = schedule.slice(recordGameIndex + 1, recordGameIndex + 3);

        // Отображаем информацию
        await displayGameInfo(recordGame, pastGames, upcomingGames);
    } catch (error) {
        console.error("Ошибка при загрузке данных:", error);
    }
}

main();