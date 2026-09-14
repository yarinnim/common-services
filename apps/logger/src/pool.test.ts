import connectDb, { requestLogPool } from './pool';

// Mock the db module
jest.mock('./db', () => ({
  __esModule: true,
  default: jest.fn().mockResolvedValue({
    insertOne: jest.fn().mockResolvedValue({ insertedId: 'test-id' }),
    find: jest.fn().mockReturnValue({
      toArray: jest.fn().mockResolvedValue([]),
    }),
  }),
}));

// Mock constants
jest.mock('./constants', () => ({
  DB_HOST: 'localhost',
  DB_PORT: 27017,
  DB_USERNAME: 'admin',
  DB_PASSWORD: 'password',
  DB_DATABASE: 'logger_local',
  DB_MAX_POOL_SIZE: 20,
  DB_REQUEST_LOG_DB: 'request_log_local',
}));

describe('Pool Module', () => {
  const mockConnect = require('./db').default;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('connectDb function', () => {
    it('should connect to database with default collection name', () => {
      const collectionName = 'test-collection';

      return connectDb(collectionName)
        .then((result: any) => {
          expect(result).toBeDefined();
          expect(mockConnect).toHaveBeenCalledWith(
            {
              host: 'localhost',
              port: 27017,
              username: 'admin',
              password: 'password',
              database: 'logger_local',
              maxPoolSize: 20,
            },
            collectionName,
          );
        });
    });

    it('should handle different collection names', () => {
      const testCases = [
        'user-logs',
        'request-logs',
        'error-logs',
        'debug-logs',
        'test_collection',
        'collection-with-dashes',
        'collection_with_underscores',
      ];

      const promises = testCases.map((collectionName) => 
        connectDb(collectionName)
          .then((result: any) => {
            expect(result).toBeDefined();
            expect(mockConnect).toHaveBeenCalledWith(
              expect.any(Object),
              collectionName,
            );
            return result;
          }),
      );

      return Promise.all(promises);
    });

    it('should use default database configuration', () => {
      const collectionName = 'test-collection';

      connectDb(collectionName);

      expect(mockConnect).toHaveBeenCalledWith(
        {
          host: 'localhost',
          port: 27017,
          username: 'admin',
          password: 'password',
          database: 'logger_local',
          maxPoolSize: 20,
        },
        collectionName,
      );
    });

    it('should handle empty collection name', () => {
      const collectionName = '';

      return connectDb(collectionName)
        .then((result: any) => {
          expect(result).toBeDefined();
          expect(mockConnect).toHaveBeenCalledWith(
            expect.any(Object),
            collectionName,
          );
        });
    });

    it('should handle collection name with special characters', () => {
      const collectionName = 'test-collection-v1.0.0';

      return connectDb(collectionName)
        .then((result: any) => {
          expect(result).toBeDefined();
          expect(mockConnect).toHaveBeenCalledWith(
            expect.any(Object),
            collectionName,
          );
        });
    });

    it('should handle collection name with unicode characters', () => {
      const collectionName = '测试集合';

      return connectDb(collectionName)
        .then((result: any) => {
          expect(result).toBeDefined();
          expect(mockConnect).toHaveBeenCalledWith(
            expect.any(Object),
            collectionName,
          );
        });
    });
  });

  describe('requestLogPool function', () => {
    it('should connect to request log database with collection name', () => {
      const collectionName = 'request-logs';

      return requestLogPool(collectionName)
        .then((result: any) => {
          expect(result).toBeDefined();
          expect(mockConnect).toHaveBeenCalledWith(
            {
              host: 'localhost',
              port: 27017,
              username: 'admin',
              password: 'password',
              database: 'request_log_local',
              maxPoolSize: 20,
            },
            collectionName,
          );
        });
    });

    it('should use request log database instead of default database', () => {
      const collectionName = 'test-collection';

      requestLogPool(collectionName);

      expect(mockConnect).toHaveBeenCalledWith(
        {
          host: 'localhost',
          port: 27017,
          username: 'admin',
          password: 'password',
          database: 'request_log_local', // Different from default
          maxPoolSize: 20,
        },
        collectionName,
      );
    });

    it('should handle different collection names for request logs', () => {
      const testCases = [
        'api-requests',
        'user-requests',
        'payment-requests',
        'auth-requests',
        'request_logs',
        'requests_with_underscores',
      ];

      const promises = testCases.map((collectionName) => 
        requestLogPool(collectionName)
          .then((result: any) => {
            expect(result).toBeDefined();
            expect(mockConnect).toHaveBeenCalledWith(
              expect.objectContaining({
                database: 'request_log_local',
              }),
              collectionName,
            );
            return result;
          }),
      );

      return Promise.all(promises);
    });

    it('should handle empty collection name for request logs', () => {
      const collectionName = '';

      return requestLogPool(collectionName)
        .then((result: any) => {
          expect(result).toBeDefined();
          expect(mockConnect).toHaveBeenCalledWith(
            expect.any(Object),
            collectionName,
          );
        });
    });
  });

  describe('Connection Configuration', () => {
    it('should use correct database configuration for regular logs', () => {
      const collectionName = 'test-collection';

      connectDb(collectionName);

      expect(mockConnect).toHaveBeenCalledWith(
        {
          host: 'localhost',
          port: 27017,
          username: 'admin',
          password: 'password',
          database: 'logger_local',
          maxPoolSize: 20,
        },
        collectionName,
      );
    });

    it('should use correct database configuration for request logs', () => {
      const collectionName = 'test-collection';

      requestLogPool(collectionName);

      expect(mockConnect).toHaveBeenCalledWith(
        {
          host: 'localhost',
          port: 27017,
          username: 'admin',
          password: 'password',
          database: 'request_log_local',
          maxPoolSize: 20,
        },
        collectionName,
      );
    });

    it('should maintain same connection parameters except database', () => {
      const collectionName = 'test-collection';

      connectDb(collectionName);
      requestLogPool(collectionName);

      expect(mockConnect).toHaveBeenCalledTimes(2);
      
      const regularCall = mockConnect.mock.calls[0][0];
      const requestCall = mockConnect.mock.calls[1][0];

      expect(regularCall.host).toBe(requestCall.host);
      expect(regularCall.port).toBe(requestCall.port);
      expect(regularCall.username).toBe(requestCall.username);
      expect(regularCall.password).toBe(requestCall.password);
      expect(regularCall.maxPoolSize).toBe(requestCall.maxPoolSize);
      expect(regularCall.database).not.toBe(requestCall.database);
    });
  });

  describe('Error Handling', () => {
    it('should propagate connection errors from db module', () => {
      mockConnect.mockRejectedValue(new Error('Connection failed'));

      const collectionName = 'test-collection';

      return connectDb(collectionName)
        .then(() => {
          throw new Error('Should have thrown');
        })
        .catch((error: any) => {
          expect(error.message).toBe('Connection failed');
        })
        .finally(() => {
          // Reset mock to default behavior
          mockConnect.mockResolvedValue({});
        });
    });

    it('should propagate connection errors for request log pool', () => {
      mockConnect.mockRejectedValue(new Error('Request log connection failed'));

      const collectionName = 'test-collection';

      return requestLogPool(collectionName)
        .then(() => {
          throw new Error('Should have thrown');
        })
        .catch((error: any) => {
          expect(error.message).toBe('Request log connection failed');
        })
        .finally(() => {
          // Reset mock to default behavior
          mockConnect.mockResolvedValue({});
        });
    });
  });

  describe('Function Behavior', () => {
    it('should return promise from connectDb', () => {
      const collectionName = 'test-collection';
      const result = connectDb(collectionName);
      
      expect(result).toBeInstanceOf(Promise);
    });

    it('should return promise from requestLogPool', () => {
      const collectionName = 'test-collection';
      const result = requestLogPool(collectionName);
      
      expect(result).toBeInstanceOf(Promise);
    });

    it('should call db.connect with correct parameters', () => {
      const collectionName = 'test-collection';
      
      connectDb(collectionName);
      
      expect(mockConnect).toHaveBeenCalledWith(
        expect.objectContaining({
          host: expect.any(String),
          port: expect.any(Number),
          username: expect.any(String),
          password: expect.any(String),
          database: expect.any(String),
          maxPoolSize: expect.any(Number),
        }),
        collectionName,
      );
    });
  });
}); 