import deploy from "./scripts/deploy";
import { config} from 'dotenv'
config();

(async () => {
  await deploy()
})()