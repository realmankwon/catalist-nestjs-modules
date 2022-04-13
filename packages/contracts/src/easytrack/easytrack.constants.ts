import { CHAINS } from '@lido-nestjs/constants';

export const EASYTRACK_CONTRACT_TOKEN = Symbol('easyTrackContract');

export const EASYTRACK_CONTRACT_ADDRESSES = {
  [CHAINS.Mainnet]: '0xF0211b7660680B49De1A7E9f25C65660F0a13Fea',
  [CHAINS.Goerli]: '0xAf072C8D368E4DD4A9d4fF6A76693887d6ae92Af',
};
