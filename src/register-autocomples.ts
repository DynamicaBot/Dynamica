import AliasAutocomplete from './autocompletes/AliasAutocomplete';
import GeneralAutocomplete from './autocompletes/GeneralAutocomplete';
import HelpAutocomplete from './autocompletes/HelpAutocomplete';
import InfoAutocomplete from './autocompletes/InfoAutocomplete';
import JoinAutocomplete from './autocompletes/JoinAutocomplete';
import TemplateAutocomplete from './autocompletes/TemplateAutocomplete';
import Autocompletes from './classes/Autocompletes';

const registerAutocompletes = () => {
  Autocompletes.register(new AliasAutocomplete());
  Autocompletes.register(new HelpAutocomplete());
  Autocompletes.register(new GeneralAutocomplete());
  Autocompletes.register(new InfoAutocomplete());
  Autocompletes.register(new JoinAutocomplete());
  Autocompletes.register(new TemplateAutocomplete());
};

export default registerAutocompletes;
