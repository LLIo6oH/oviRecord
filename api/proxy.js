// api/proxy.js
const fetch = require('node-fetch');

module.exports = async (req, res) => {
    // Разрешаем запросы с любого домена (или укажите конкретный домен)
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Обрабатываем OPTIONS-запросы для CORS
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const { path } = req.query; // Получаем путь из запроса

    if (!path) {
        return res.status(400).json({ error: "Path is required" });
    }

    try {
        const apiUrl = `https://api-web.nhle.com${path}`;
        const response = await fetch(apiUrl);
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error("Ошибка при запросе к NHL API:", error);
        res.status(500).json({ error: "Ошибка при запросе к NHL API" });
    }
};