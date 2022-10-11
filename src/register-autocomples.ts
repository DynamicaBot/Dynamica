import { Container } from 'typedi';
import AliasAutocomplete from './autocompletes/AliasAutocomplete';
import GeneralAutocomplete from './autocompletes/GeneralAutocomplete';
import HelpAutocomplete from './autocompletes/HelpAutocomplete';
import InfoAutocomplete from './autocompletes/InfoAutocomplete';
import JoinAutocomplete from './autocompletes/JoinAutocomplete';
import TemplateAutocomplete from './autocompletes/TemplateAutocomplete';
import { AutocompleteToken } from './classes/Autocomplete';
import Autocompletes from './classes/Autocompletes';

const registerAutocompletes = () => {
  Container.import([
    AliasAutocomplete,
    GeneralAutocomplete,
    HelpAutocomplete,
    InfoAutocomplete,
    JoinAutocomplete,
    TemplateAutocomplete,
  ]);
  Container.getMany(AutocompleteToken).forEach((autocomplete) => {
    Container.get(Autocompletes).register(autocomplete);
  });
};

export default registerAutocompletes;
