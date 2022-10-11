import { AutocompleteToken } from '@/classes/Autocomplete';
import { Service } from 'typedi';
import SecondaryAutocomplete from './SecondaryAutocomplete';

@Service({ id: AutocompleteToken, multiple: true })
export default class JoinAutocomplete extends SecondaryAutocomplete {
  name = 'join';
}
