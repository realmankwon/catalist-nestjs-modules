import { Test } from '@nestjs/testing';
import { ExecutionModule, ExtendedJsonRpcBatchProvider } from '../src';
import { LoggerModule } from '@lido-nestjs/logger';

describe('Module initializing', () => {
  describe('For root', () => {
    let extendedJsonRpcBatchProvider: ExtendedJsonRpcBatchProvider;

    beforeEach(async () => {
      const moduleRef = await Test.createTestingModule({
        imports: [
          ExecutionModule.forRoot({
            imports: [LoggerModule.forRoot({})],
            urls: ['http://localhost'],
            network: 1,
          }),
        ],
      }).compile();

      extendedJsonRpcBatchProvider = moduleRef.get(
        ExtendedJsonRpcBatchProvider,
      );
    });

    test('Methods should be defined', async () => {
      expect(extendedJsonRpcBatchProvider.send).toBeDefined();
      expect(extendedJsonRpcBatchProvider.detectNetwork).toBeDefined();
    });
  });

  describe('For feature', () => {
    let extendedJsonRpcBatchProvider: ExtendedJsonRpcBatchProvider;

    beforeEach(async () => {
      const moduleRef = await Test.createTestingModule({
        imports: [
          ExecutionModule.forFeature({
            imports: [LoggerModule.forRoot({})],
            urls: ['http://localhost'],
            network: 1,
          }),
        ],
      }).compile();

      extendedJsonRpcBatchProvider = moduleRef.get(
        ExtendedJsonRpcBatchProvider,
      );
    });

    test('Methods should be defined', async () => {
      expect(extendedJsonRpcBatchProvider.send).toBeDefined();
      expect(extendedJsonRpcBatchProvider.detectNetwork).toBeDefined();
    });
  });
});
