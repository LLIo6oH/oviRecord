// api/proxy.js
const fetch = require('node-fetch');

module.exports = async (req, res) => {
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