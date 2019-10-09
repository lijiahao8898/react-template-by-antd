import * as menu from './menu/action'
import * as config from './config/action'
import * as statusCode from './statusCode/action'

export default {
    ...menu,
    ...config,
    ...statusCode
}
