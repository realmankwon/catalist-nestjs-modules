import { CHAINS } from '@lido-nestjs/constants';

export const LIDO_LOCATOR_CONTRACT_TOKEN = Symbol('lidoLocatorContract');

export const LIDO_LOCATOR_CONTRACT_ADDRESSES = {
  [CHAINS.Mainnet]: '0xC1d0b3DE6792Bf6b4b37EccdcC24e45978Cfd2Eb',
  [CHAINS.Goerli]: '0x1eDf09b5023DC86737b59dE68a8130De878984f5',
  [CHAINS.Zhejiang]: '0x548C1ED5C83Bdf19e567F4cd7Dd9AC4097088589',
};
