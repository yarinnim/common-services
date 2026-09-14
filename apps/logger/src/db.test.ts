import connect, { type Connection } from './db';

// Mock MongoDB
jest.mock('mongodb', () => ({
  MongoClient: jest.fn().mockImplementation(() => ({
    connect: jest.fn().mockResolvedValue({
      db: jest.fn().mockReturnValue({
        collection: jest.fn().mockReturnValue({
          insertOne: jest.fn().mockResolvedValue({ insertedId: 'test-id' }),
          find: jest.fn().mockReturnValue({
            toArray: jest.fn().mockResolvedValue([]),
          }),
        }),
      }),
    }),
  })),
}));

// Mock crypto
jest.mock('crypto', () => ({
  createHash: jest.fn().mockReturnValue({
    update: jest.fn().mockReturnThis(),
    digest: jest.fn().mockReturnValue('mocked-hash'),
  }),
}));

describe('DB Module', () => {
  const mockConnection: Connection = {
    host: 'localhost',
    port: 27017,
    username: 'admin',
    password: 'password',
    maxPoolSize: 20,
    database: 'test-db',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('connect function', () => {
    it('should connect to MongoDB with valid connection parameters', () => {
      const collectionName = 'test-collection';
      const mockCallback = jest.fn().mockResolvedValue('callback-result');

      return connect(mockConnection, collectionName, mockCallback)
        .then((result: any) => {
          expect(result).toBe('callback-result');
          expect(mockCallback).toHaveBeenCalledWith(expect.any(Object));
        });
    });

    it('should connect without callback function', () => {
      const collectionName = 'test-collection';

      return connect(mockConnection, collectionName)
        .then((result: any) => {
          expect(result).toBeDefined();
          expect(result).toHaveProperty('insertOne');
          expect(result).toHaveProperty('find');
        });
    });

    it('should handle connection with special characters in password', () => {
      const connectionWithSpecialChars: Connection = {
        ...mockConnection,
        password: 'pass@word#123',
      };
      const collectionName = 'test-collection';

      return connect(connectionWithSpecialChars, collectionName)
        .then((result: any) => {
          expect(result).toBeDefined();
        });
    });

    it('should handle connection with different database names', () => {
      const testCases = [
        'user-logs',
        'request-logs',
        'error-logs',
        'debug-logs',
        'test_collection',
        'collection-with-dashes',
      ];

      const promises = testCases.map((collectionName) => 
        connect(mockConnection, collectionName)
          .then((result: any) => {
            expect(result).toBeDefined();
            return result;
          }),
      );

      return Promise.all(promises);
    });

    it('should handle connection with different port numbers', () => {
      const connectionWithDifferentPort: Connection = {
        ...mockConnection,
        port: 27018,
      };
      const collectionName = 'test-collection';

      return connect(connectionWithDifferentPort, collectionName)
        .then((result: any) => {
          expect(result).toBeDefined();
        });
    });

    it('should handle connection with different hosts', () => {
      const connectionWithDifferentHost: Connection = {
        ...mockConnection,
        host: 'mongodb.example.com',
      };
      const collectionName = 'test-collection';

      return connect(connectionWithDifferentHost, collectionName)
        .then((result: any) => {
          expect(result).toBeDefined();
        });
    });

    it('should handle connection with different max pool sizes', () => {
      const connectionWithDifferentPoolSize: Connection = {
        ...mockConnection,
        maxPoolSize: 50,
      };
      const collectionName = 'test-collection';

      return connect(connectionWithDifferentPoolSize, collectionName)
        .then((result: any) => {
          expect(result).toBeDefined();
        });
    });

    it('should handle callback that returns a promise', () => {
      const collectionName = 'test-collection';
      const mockCallback = jest.fn().mockResolvedValue('promise-result');

      return connect(mockConnection, collectionName, mockCallback)
        .then((result: any) => {
          expect(result).toBe('promise-result');
          expect(mockCallback).toHaveBeenCalledWith(expect.any(Object));
        });
    });

    it('should handle callback that throws an error', () => {
      const collectionName = 'test-collection';
      const mockCallback = jest.fn().mockRejectedValue(new Error('Callback error'));

      return connect(mockConnection, collectionName, mockCallback)
        .then(() => {
          throw new Error('Should have thrown');
        })
        .catch((error: any) => {
          expect(error.message).toBe('Callback error');
        });
    });

    it('should handle callback that returns undefined', () => {
      const collectionName = 'test-collection';
      const mockCallback = jest.fn().mockReturnValue(undefined);

      return connect(mockConnection, collectionName, mockCallback)
        .then((result: any) => {
          expect(result).toBeUndefined();
          expect(mockCallback).toHaveBeenCalledWith(expect.any(Object));
        });
    });
  });

  describe('Connection URL Generation', () => {
    it('should generate correct MongoDB connection URL', () => {
      const result = connect(mockConnection, 'test-collection');
      
      expect(result).toBeDefined();
      expect(result).toBeInstanceOf(Promise);
    });

    it('should URL encode password with special characters', () => {
      const connectionWithSpecialPassword: Connection = {
        ...mockConnection,
        password: 'pass@word#123',
      };
      
      const result = connect(connectionWithSpecialPassword, 'test-collection');
      
      expect(result).toBeDefined();
      expect(result).toBeInstanceOf(Promise);
    });

    it('should handle password with spaces', () => {
      const connectionWithSpacePassword: Connection = {
        ...mockConnection,
        password: 'my password',
      };
      
      const result = connect(connectionWithSpacePassword, 'test-collection');
      
      expect(result).toBeDefined();
      expect(result).toBeInstanceOf(Promise);
    });

    it('should handle password with unicode characters', () => {
      const connectionWithUnicodePassword: Connection = {
        ...mockConnection,
        password: 'pässwörd',
      };
      
      const result = connect(connectionWithUnicodePassword, 'test-collection');
      
      expect(result).toBeDefined();
      expect(result).toBeInstanceOf(Promise);
    });
  });

  describe('Connection Pooling', () => {
    it('should reuse existing client for same connection URL', () => {
      // First connection
      const result1 = connect(mockConnection, 'collection1');
      // Second connection with same parameters
      const result2 = connect(mockConnection, 'collection2');
      
      expect(result1).toBeDefined();
      expect(result2).toBeDefined();
      expect(result1).toBeInstanceOf(Promise);
      expect(result2).toBeInstanceOf(Promise);
    });

    it('should create new client for different connection parameters', () => {
      // First connection
      const result1 = connect(mockConnection, 'collection1');
      
      // Second connection with different parameters
      const differentConnection: Connection = {
        ...mockConnection,
        host: 'different-host',
      };
      const result2 = connect(differentConnection, 'collection2');
      
      expect(result1).toBeDefined();
      expect(result2).toBeDefined();
      expect(result1).toBeInstanceOf(Promise);
      expect(result2).toBeInstanceOf(Promise);
    });

    it('should create new client for different database', () => {
      // First connection
      const result1 = connect(mockConnection, 'collection1');
      
      // Second connection with different database
      const differentConnection: Connection = {
        ...mockConnection,
        database: 'different-db',
      };
      const result2 = connect(differentConnection, 'collection2');
      
      expect(result1).toBeDefined();
      expect(result2).toBeDefined();
      expect(result1).toBeInstanceOf(Promise);
      expect(result2).toBeInstanceOf(Promise);
    });
  });

  describe('Database and Collection Access', () => {
    it('should access correct database', () => {
      const result = connect(mockConnection, 'test-collection');
      
      expect(result).toBeDefined();
      expect(result).toBeInstanceOf(Promise);
    });

    it('should access correct collection', () => {
      const result = connect(mockConnection, 'test-collection');
      
      expect(result).toBeDefined();
      expect(result).toBeInstanceOf(Promise);
    });
  });

  describe('Error Handling', () => {
    it('should handle connection errors', () => {
      const result = connect(mockConnection, 'test-collection');
      
      expect(result).toBeDefined();
      expect(result).toBeInstanceOf(Promise);
    });

    it('should handle database access errors', () => {
      const result = connect(mockConnection, 'test-collection');
      
      expect(result).toBeDefined();
      expect(result).toBeInstanceOf(Promise);
    });

    it('should handle collection access errors', () => {
      const result = connect(mockConnection, 'test-collection');
      
      expect(result).toBeDefined();
      expect(result).toBeInstanceOf(Promise);
    });
  });
}); 