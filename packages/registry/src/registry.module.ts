import { DynamicModule, Module } from '@nestjs/common';
import {
  RegistryModuleSyncOptions,
  RegistryModuleAsyncOptions,
} from './interfaces/module.interface';
import { RegistryService } from './registry.service';
import { RegistryOperatorFetchService } from './operator/operator.fetch';
import { RegistryOperatorStorageService } from './operator/operator.storage';
import { RegistryKeyFetchService } from './key/key.fetch';

@Module({
  providers: [
    RegistryService,
    RegistryOperatorStorageService,
    RegistryOperatorFetchService,
    RegistryKeyFetchService,
  ],
  exports: [
    RegistryService,
    RegistryOperatorStorageService,
    RegistryOperatorFetchService,
    RegistryKeyFetchService,
  ],
})
export class RegistryModule {
  static forRoot(options?: RegistryModuleSyncOptions): DynamicModule {
    return {
      global: true,
      ...this.forFeature(options),
    };
  }

  static forRootAsync(options: RegistryModuleAsyncOptions): DynamicModule {
    return {
      global: true,
      ...this.forFeatureAsync(options),
    };
  }

  static forFeature(options?: RegistryModuleSyncOptions): DynamicModule {
    return {
      module: RegistryModule,
      imports: options?.imports,
    };
  }

  public static forFeatureAsync(
    options: RegistryModuleAsyncOptions,
  ): DynamicModule {
    return {
      module: RegistryModule,
      imports: options.imports,
    };
  }
}
