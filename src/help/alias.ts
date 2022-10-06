import Help from '@classes/Help';
import { bold } from '@discordjs/builders';

export default new Help(
  'Adds an alternative name for a game that replaces the default one in the channel name.',
  `The alias command allows you to shorten the name of a game in the channel's title. This can be helpful for shortening the names of some games or, if your group has another name they refer to a game by.
  
  ${bold('add')}
  The add command adds a new alias. So if you were playing "F1 2021" /alias add "F1 2021" "F1" every time the channel name updates instead of F1 2021 F1 would appear.
  
  ${bold('remove')}
  This does exactly as you would expect, it removes an alias for a given activity. For example /alias remove "F1 2021" would remove the alias that we set before for F1 2021.
  
  ${bold('list')}
  Lists the aliases that you've created for the channel you are in.`
);
