import Autocomplete from '@classes/Autocomplete';
import alias from './alias';
import general from './general';
import help from './help';
import info from './info';
import join from './join';
import template from './template';

interface AutocompleteInterface {
  [key: string]: Autocomplete;
}

const exports: AutocompleteInterface = {
  alias,
  general,
  help,
  info,
  join,
  template,
};

export default exports;
