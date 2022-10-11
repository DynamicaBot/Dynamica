import { AutocompleteToken } from '@/classes/Autocomplete';
import { Service } from 'typedi';
import PrimaryAutocomplete from './PrimaryAutocomplete';

@Service({ id: AutocompleteToken, multiple: true })
export default class TemplateAutocomplete extends PrimaryAutocomplete {
  name = 'template';
}
