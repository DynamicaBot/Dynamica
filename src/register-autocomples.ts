import AliasAutocomplete from './autocompletes/alias';
import GeneralAutocomplete from './autocompletes/general';
import HelpAutocomplete from './autocompletes/help';
import InfoAutocomplete from './autocompletes/info';
import JoinAutocomplete from './autocompletes/join';
import TemplateAutocomplete from './autocompletes/template';
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
