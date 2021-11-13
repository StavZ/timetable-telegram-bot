# Автоматическая рассылка расписания
Телеграм бот, который автоматически отправляет расписание с сайта [колледжа](https://ppkslavyanova.ru/), как только оно там появляется.

**Telegram: [@ppkslavyanovabot](https://t.me/ppkslavyanovabot)**

# Используемые библиотеки
- [telegraf](https://github.com/telegraf/telegraf) - Telegram Bot API фреймворк.
- [@discordjs/collections](https://github.com/discordjs/collection) - Структура хранения команд бота.
- [mongoose](https://github.com/Automattic/mongoose) - Библиотека для работы с базой данных бота.
- [moment-timezone](https://github.com/moment/moment-timezone) - Утилита для работы с датой внутри бота.
- [node-fetch](https://github.com/node-fetch/node-fetch) - Взаимодействие с Fetch API.
- [jsdom](https://github.com/jsdom/jsdom) - Имитация DOM элементов в Node.js. Нужна для парсера расписания.

Полный список используемых библиотек Вы сможете найти в [package.json](https://github.com/StavZ/timetable-telegram-bot/blob/master/package.json).
