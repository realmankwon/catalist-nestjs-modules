# Fetch

NestJS Fetch for Catalist Finance projects.
Part of [Catalist NestJS Modules](https://github.com/blockarchivelabs/catalist-nestjs-modules/#readme)

The module is based on the [node-fetch](https://www.npmjs.com/package/node-fetch) package.

## Install

```bash
yarn add @catalist-nestjs/fetch
```

## Usage

### Basic usage

```ts
// Import
import { Module } from '@nestjs/common';
import { FetchModule } from '@catalist-nestjs/fetch';
import { MyService } from './my.service';

@Module({
  imports: [FetchModule.forFeature()],
  providers: [MyService],
  exports: [MyService],
})
export class MyModule {}

// Usage
import { FetchService } from '@catalist-nestjs/fetch';

export class MyService {
  constructor(private fetchService: FetchService) {}

  async myFetch() {
    return await this.fetchService.fetchJson('/url');
  }
}
```

The `fetchService` provides 2 methods: `fetchJson` and `fetchText`, which are based on a call to the `fetch` function followed by a call to `.json()` or `.text()`. Method arguments are compatible with the `fetch`.

### Global usage

```ts
import { Module } from '@nestjs/common';
import { FetchModule } from '@catalist-nestjs/fetch';

@Module({
  imports: [FetchModule.forRoot()],
})
export class MyModule {}
```

### Async usage

```ts
import { Module } from '@nestjs/common';
import { FetchModule } from '@catalist-nestjs/fetch';
import { ConfigModule, ConfigService } from './my.service';

@Module({
  imports: [
    ConfigModule,
    FetchModule.forRootAsync({
      async useFactory(configService: ConfigService) {
        return { baseUrls: configService.baseUrls };
      },
      inject: [ConfigService],
    }),
  ],
})
export class MyModule {}
```

### Module options

The `forRoot` and `forFeature` methods have the same options:

```ts
export interface FetchModuleOptions {
  baseUrls?: string[];
  retryPolicy?: RequestRetryPolicy;
}

export interface RequestRetryPolicy {
  delay?: number;
  attempts?: number;
}
```

| Option   | Default | Desc                                    |
| -------- | ------- | --------------------------------------- |
| baseUrls | []      | Array of base API URLs                  |
| delay    | 1000    | Number of milliseconds between attempts |
| attempts | 0       | Number of times the query is retried    |

#### Example

```ts
// Import
import { Module } from '@nestjs/common';
import { FetchModule } from '@catalist-nestjs/fetch';
import { MyService } from './my.service';

@Module({
  imports: [
    FetchModule.forFeature({
      baseUrls: ['https://my-api.com', 'https://my-fallback-api.com'],
      retryPolicy: {
        delay: 2000,
        attempts: 3,
      },
    }),
  ],
  providers: [MyService],
  exports: [MyService],
})
export class MyModule {}

// Usage
import { FetchService } from '@catalist-nestjs/fetch';

export class MyService {
  constructor(private fetchService: FetchService) {}

  async myFetch() {
    return await this.fetchService.fetchJson('/foo');
  }
}
```

If the provided API services are unavailable, the following happens:

- request to https://my-api.com/foo
- 2000 ms delay
- request to https://my-fallback-api.com/foo
- 2000 ms delay
- request to https://my-api.com/foo
- throw exception

### Local options

The `retryPolicy` for each query can be rewritten:

```ts
import { FetchService } from '@catalist-nestjs/fetch';

export class MyService {
  constructor(private fetchService: FetchService) {}

  async myFetch() {
    return await this.fetchService.fetchJson('/foo', {
      retryPolicy: {
        delay: 2000,
        attempts: 3,
      },
    });
  }
}
```
