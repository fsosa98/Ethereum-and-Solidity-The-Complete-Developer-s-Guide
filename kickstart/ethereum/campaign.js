import web3 from './web3';
import { abi } from './build/Campaign.json';

export default (address) => {
  return new web3.eth.Contract(abi, address);
};
