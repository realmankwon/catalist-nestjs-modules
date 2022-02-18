import { BaseProvider, Formatter } from '@ethersproject/providers';
import { SimpleFallbackProviderConfig } from '../interfaces/simple-fallback-provider-config';
import { ExtendedJsonRpcBatchProvider } from './extended-json-rpc-batch-provider';
import { Network } from '@ethersproject/networks';
import { Injectable, LoggerService } from '@nestjs/common';
import { retrier } from '../common/retrier';
import { FallbackProvider } from '../interfaces/fallback-provider';
import { BlockTag } from '../ethers/block-tag';
import { BigNumber, BigNumberish } from '@ethersproject/bignumber';
import { Deferrable } from '@ethersproject/properties';
import { TransactionRequest } from '@ethersproject/abstract-provider/src.ts/index';
import { FormatterWithEIP1898 } from '../ethers/formatter-with-eip1898';

/**
 * EIP-1898 support
 * https://eips.ethereum.org/EIPS/eip-1898
 */
declare module '@ethersproject/providers' {
  export interface BaseProvider {
    getBalance(
      addressOrName: string | Promise<string>,
      blockTag?: BlockTag | Promise<BlockTag>,
    ): Promise<BigNumber>;
    getTransactionCount(
      addressOrName: string | Promise<string>,
      blockTag?: BlockTag | Promise<BlockTag>,
    ): Promise<number>;
    getCode(
      addressOrName: string | Promise<string>,
      blockTag?: BlockTag | Promise<BlockTag>,
    ): Promise<string>;
    getStorageAt(
      addressOrName: string | Promise<string>,
      position: BigNumberish | Promise<BigNumberish>,
      blockTag?: BlockTag | Promise<BlockTag>,
    ): Promise<string>;
    call(
      transaction: Deferrable<TransactionRequest>,
      blockTag?: BlockTag | Promise<BlockTag>,
    ): Promise<string>;
  }
}

@Injectable()
export class SimpleFallbackJsonRpcBatchProvider extends BaseProvider {
  protected config: SimpleFallbackProviderConfig;
  protected logger: LoggerService;
  protected fallbackProviders: [FallbackProvider];
  protected activeFallbackProviderIndex: number;

  public constructor(
    config: SimpleFallbackProviderConfig,
    logger: LoggerService,
  ) {
    super(config.network);
    this.config = {
      maxRetries: 3,
      minBackoffMs: 500,
      maxBackoffMs: 5000,
      logRetries: true,
      ...config,
    };
    this.logger = logger;

    const conns = config.urls.filter((url) => {
      if (!url) {
        return false;
      }

      if (typeof url === 'object' && !url.url) {
        return false;
      }

      return true;
    });

    if (conns.length < 1) {
      throw new Error('No valid URLs or Connections were provided');
    }

    this.fallbackProviders = <[FallbackProvider]>conns.map((conn, index) => {
      const provider = new ExtendedJsonRpcBatchProvider(
        conn,
        undefined,
        config.requestPolicy,
        config.fetchMiddlewares ?? [],
      );
      return {
        valid: false,
        network: null,
        provider,
        index,
      };
    });
    this.activeFallbackProviderIndex = 0;
  }

  static _formatter: Formatter | null = null;

  static getFormatter(): Formatter {
    if (this._formatter == null) {
      this._formatter = new FormatterWithEIP1898();
    }
    return this._formatter;
  }

  protected get provider(): FallbackProvider {
    if (this.activeFallbackProviderIndex > this.fallbackProviders.length - 1) {
      this.activeFallbackProviderIndex = 0;
    }

    let variant = this.fallbackProviders[this.activeFallbackProviderIndex];
    let attempt = 0;

    while (!variant.valid || attempt < this.fallbackProviders.length) {
      variant = this.fallbackProviders[this.activeFallbackProviderIndex];

      if (!variant.valid) {
        this.activeFallbackProviderIndex++;
      }

      attempt++;
    }

    if (!variant.valid) {
      // this likely will never happen
      throw new Error(
        'No valid providers (all fallback endpoints unreachable)',
      );
    }

    return variant;
  }

  protected switchToNextProvider() {
    if (this.fallbackProviders.length === 1) {
      this.logger.warn(
        'Will not switch to next provider. No valid backup provider provided.',
      );
      return;
    }
    this.activeFallbackProviderIndex++;
    this.logger.log(`Switched to next provider for execution layer`);
  }

  public async perform(
    method: string,
    params: { [name: string]: unknown },
  ): Promise<unknown> {
    const retry = retrier(
      this.logger,
      this.config.maxRetries,
      this.config.minBackoffMs,
      this.config.maxBackoffMs,
      this.config.logRetries,
    );

    let attempt = 0;

    // will perform maximum `this.config.maxRetries` retries for fetching data with single provider
    // after failure will switch to next provider
    // maximum number of switching is limited to total fallback provider count
    while (attempt < this.fallbackProviders.length) {
      try {
        attempt++;
        // awaiting is extremely important here
        // without it, the error will not be caught in current try-catch scope
        return await retry(() =>
          this.provider.provider.perform(method, params),
        );
      } catch (e) {
        this.logger.error(
          'Error while doing ETH1 RPC request. Will try to switch to another provider',
        );
        this.logger.error(e);
        this.switchToNextProvider();
      }
    }

    throw new Error('All attempts failed');
  }

  public async detectNetwork(): Promise<Network> {
    const results = await Promise.allSettled(
      this.fallbackProviders.map((c) => c.provider.getNetwork()),
    );

    results.forEach((result, i) => {
      if (result.status === 'fulfilled') {
        this.fallbackProviders[i].valid = true;
        this.fallbackProviders[i].network = result.value;
      } else {
        this.fallbackProviders[i].valid = false;
        this.fallbackProviders[i].network = null;
      }
    });

    let previousNetwork: Network | null = null;

    this.fallbackProviders.forEach((variant) => {
      if (!variant.network || !variant.valid) {
        return;
      }

      if (previousNetwork) {
        // Make sure the network matches the previous networks
        if (
          !(
            previousNetwork.name === variant.network.name &&
            previousNetwork.chainId === variant.network.chainId &&
            (previousNetwork.ensAddress === variant.network.ensAddress ||
              (previousNetwork.ensAddress == null &&
                variant.network.ensAddress == null))
          )
        ) {
          throw new Error('Provider networks mismatch');
        }
      } else {
        previousNetwork = variant.network;
      }
    });

    if (!previousNetwork) {
      throw new Error(
        'No valid fallback providers found (all fallback endpoints unreachable)',
      );
    }

    return previousNetwork;
  }
}
