import web3 from './web3';
import { abi } from './build/CampaignFactory.json';

const instance = new web3.eth.Contract(abi, '0x9fb7838faaBB8A22DcfFe84944eE7fA258D9A2e1');

export default instance;
