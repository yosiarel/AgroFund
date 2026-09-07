import { BigIntInterceptor } from './bigint.interceptor';
import { CallHandler, ExecutionContext } from '@nestjs/common';
import { of } from 'rxjs';

describe('BigIntInterceptor', () => {
  let interceptor: BigIntInterceptor;

  beforeEach(() => {
    interceptor = new BigIntInterceptor();
  });

  it('should transform BigInt to string in an object', (done) => {
    const mockContext = {} as ExecutionContext;
    const mockCallHandler: CallHandler = {
      handle: () => of({ amount: 500000n, status: 'SUCCESS' }),
    };

    interceptor.intercept(mockContext, mockCallHandler).subscribe((result) => {
      expect(result).toEqual({ amount: '500000', status: 'SUCCESS' });
      done();
    });
  });

  it('should transform BigInt in nested objects and arrays', (done) => {
    const mockContext = {} as ExecutionContext;
    const mockCallHandler: CallHandler = {
      handle: () =>
        of({
          data: [
            { id: 1, val: 100n },
            { id: 2, val: 200n },
          ],
          meta: { total: 300n },
        }),
    };

    interceptor.intercept(mockContext, mockCallHandler).subscribe((result) => {
      expect(result).toEqual({
        data: [
          { id: 1, val: '100' },
          { id: 2, val: '200' },
        ],
        meta: { total: '300' },
      });
      done();
    });
  });

  it('should handle null and undefined', (done) => {
    const mockContext = {} as ExecutionContext;
    const mockCallHandler: CallHandler = {
      handle: () => of(null),
    };

    interceptor.intercept(mockContext, mockCallHandler).subscribe((result) => {
      expect(result).toBeNull();
      done();
    });
  });
});
