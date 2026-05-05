import '@material/web/list/list'
import '@material/web/list/list-item'
import '@material/web/icon/icon'
import '@material/web/button/filled-button'
import '@material/web/button/outlined-button'
import '@material/web/button/filled-tonal-button'
import '@material/web/iconbutton/icon-button'
import '@material/web/divider/divider'
import '@material/web/progress/linear-progress'
import '@material/web/select/outlined-select'
import '@material/web/select/select-option'
import '@material/web/textfield/outlined-text-field'
import '@material/web/chips/suggestion-chip'

import { registerNavigationApi } from './navigation';

export default function() {
  registerNavigationApi();
}
