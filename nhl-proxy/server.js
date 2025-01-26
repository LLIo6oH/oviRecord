const express = require("express");
const fetch = require("node-fetch");
const cors = require("cors");

const app = express();
const PORT = 3000;

// Разрешаем CORS для всех запросов
app.use(cors());

// Прокси для получения данных игрока
app.get("/player/:playerId", async (req, res) => {
    const { playerId } = req.params;
    const url = `https://api-web.nhle.com/v1/player/${playerId}/landing`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error("Ошибка при загрузке данных игрока:", error);
        res.status(500).json({ error: "Ошибка при загрузке данных" });
    }
});

// Прокси для получения расписания команды
app.get("/club-schedule/:teamId", async (req, res) => {
    const { teamId } = req.params;
    const url = `https://api-web.nhle.com/v1/club-schedule-season/${teamId}/20242025`; // Используем новый эндпоинт

    try {
        const response = await fetch(url);
        const data = await response.json();
        console.log("Ответ от NHL API:", data); // Логируем ответ
        res.json(data);
    } catch (error) {
        console.error("Ошибка при загрузке расписания:", error);
        res.status(500).json({ error: "Ошибка при загрузке данных" });
    }
});

app.listen(PORT, () => {
    console.log(`Прокси-сервер запущен на http://localhost:${PORT}`);
});