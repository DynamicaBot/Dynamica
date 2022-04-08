import remove from "./scripts/remove";
import { config} from 'dotenv'
config();

(async () => {
  await remove()
})()