export const USERS_ERRORS = {
    LOGIN: {
        PASSWORD: {
            WRONG: {
                type: 'password',
                message: 'Неправильный пароль'
            }
        },
        USERNAME: {
            WRONG: {
                type: 'username',
                message: 'Неправильное имя пользователя'
            }
        },
        HASH: {
            SYSTEM: {
                type: 'system',
                message: 'Ошибка авторизации со стороны сервера'
            }
        }
    },
    SYSTEM: {
        SESSION: {
            ACCESS: {
                type: 'session',
                message: 'Некорректные данные сессии',
                description: 'Мы вынуждены выйти из системы с Вашего устройства. Повторите вход в систему снова.'
            }
        }
    }
}