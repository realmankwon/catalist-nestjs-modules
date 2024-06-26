import { CHAINS } from '@catalist-nestjs/constants';

export const STAKING_ROUTER_CONTRACT_TOKEN = Symbol('stakingRouterContract');

export const STAKING_ROUTER_CONTRACT_ADDRESSES = {
  [CHAINS.Mainnet]: '0xFdDf38947aFB03C621C71b06C9C70bce73f12999',
  [CHAINS.Goerli]: '0xa3Dbd317E53D363176359E10948BA0b1c0A4c820',
  [CHAINS.Holesky]: '0xd6EbF043D30A7fe46D1Db32BA90a0A51207FE229',
  [CHAINS.Sepolia]: '0x4F36aAEb18Ab56A4e380241bea6ebF215b9cb12c',
  [CHAINS.EnduranceDevnet]: '0x7b6d791175eB131f66d4E7ed732b8FE5686ED668',
  [CHAINS.EnduranceMainnet]: '0x630941c45Cd3BC0B4FC843900C29c8432f4e935d',
};
