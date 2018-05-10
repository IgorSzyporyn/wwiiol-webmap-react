import configureStoreDev from './dev'
import configureStoreProd from './prod'

export const configureStore =
  process.env.NODE_ENV === 'production' ? configureStoreProd : configureStoreDev
