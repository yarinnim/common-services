import _dotenv from 'dotenv';

// Mock dotenv before importing constants
jest.mock('dotenv', () => ({
  __esModule: true,
  default: {
    config: jest.fn(),
  },
}));

describe('Constants Module', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('Environment Variable Loading', () => {
    it('should call dotenv.config on module load', () => {
      // Set required environment variables to avoid errors
      process.env = {
        APP_PORT: '3000',
        APP_ENV: 'development',
        APP_NAME: '@common-services/logger',
        DB_HOST: 'localhost',
        DB_PORT: '27017',
        DB_USERNAME: 'admin',
        DB_PASSWORD: 'password',
        DB_DATABASE: 'logger_local',
        DB_MAX_POOL_SIZE: '20',
        DB_REQUEST_LOG_DB: 'request_log_local',
        MQ_HOST: 'localhost',
        MQ_PORT: '5672',
        MQ_USER: 'rabbitmq',
        MQ_PASSWORD: 'rabbitmq',
        LOG_EXCHANGE: 'logger-service',
      };
      
      // Re-import to trigger the dotenv.config call
      jest.resetModules();
      require('./constants');
      
      // Check that dotenv.config was called (it should be called during module load)
      const mockDotenv = require('dotenv');
      expect(mockDotenv.default.config).toHaveBeenCalled();
    });

    it('should throw error when required environment variable is missing', () => {
      // Clear all environment variables
      process.env = {};
      
      expect(() => {
        jest.resetModules();
        require('./constants');
      }).toThrow('The APP_PORT environment variable is required');
    });

    it('should load all required environment variables successfully', () => {
      // Set all required environment variables
      process.env = {
        APP_PORT: '3000',
        APP_ENV: 'development',
        APP_NAME: '@common-services/logger',
        DB_HOST: 'localhost',
        DB_PORT: '27017',
        DB_USERNAME: 'admin',
        DB_PASSWORD: 'password',
        DB_DATABASE: 'logger_local',
        DB_MAX_POOL_SIZE: '20',
        DB_REQUEST_LOG_DB: 'request_log_local',
        MQ_HOST: 'localhost',
        MQ_PORT: '5672',
        MQ_USER: 'rabbitmq',
        MQ_PASSWORD: 'rabbitmq',
        LOG_EXCHANGE: 'logger-service',
      };

      jest.resetModules();
      const constants = require('./constants');

      expect(constants.APP_PORT).toBe('3000');
      expect(constants.APP_ENV).toBe('development');
      expect(constants.APP_NAME).toBe('@common-services/logger');
      expect(constants.DB_HOST).toBe('localhost');
      expect(constants.DB_PORT).toBe('27017');
      expect(constants.DB_USERNAME).toBe('admin');
      expect(constants.DB_PASSWORD).toBe('password');
      expect(constants.DB_DATABASE).toBe('logger_local');
      expect(constants.DB_MAX_POOL_SIZE).toBe('20');
      expect(constants.DB_REQUEST_LOG_DB).toBe('request_log_local');
      expect(constants.MQ_HOST).toBe('localhost');
      expect(constants.MQ_PORT).toBe('5672');
      expect(constants.MQ_USER).toBe('rabbitmq');
      expect(constants.MQ_PASSWORD).toBe('rabbitmq');
      expect(constants.LOG_EXCHANGE).toBe('logger-service');
    });

    it('should handle numeric environment variables correctly', () => {
      process.env = {
        APP_PORT: '3000',
        APP_ENV: 'development',
        APP_NAME: '@common-services/logger',
        DB_HOST: 'localhost',
        DB_PORT: '27017',
        DB_USERNAME: 'admin',
        DB_PASSWORD: 'password',
        DB_DATABASE: 'logger_local',
        DB_MAX_POOL_SIZE: '20',
        DB_REQUEST_LOG_DB: 'request_log_local',
        MQ_HOST: 'localhost',
        MQ_PORT: '5672',
        MQ_USER: 'rabbitmq',
        MQ_PASSWORD: 'rabbitmq',
        LOG_EXCHANGE: 'logger-service',
      };

      jest.resetModules();
      const constants = require('./constants');

      expect(constants.APP_PORT).toBe('3000');
      expect(constants.DB_PORT).toBe('27017'); // Should remain string as defined
      expect(constants.DB_MAX_POOL_SIZE).toBe('20');
      expect(constants.MQ_PORT).toBe('5672'); // Should remain string as defined
    });

    it('should throw specific error for each missing environment variable', () => {
      const requiredVars = [
        'APP_PORT', 'APP_ENV', 'APP_NAME',
        'DB_HOST', 'DB_PORT', 'DB_USERNAME', 'DB_PASSWORD',
        'DB_DATABASE', 'DB_MAX_POOL_SIZE', 'DB_REQUEST_LOG_DB',
        'MQ_HOST', 'MQ_PORT', 'MQ_USER', 'MQ_PASSWORD',
        'LOG_EXCHANGE',
      ];

      requiredVars.forEach((varName) => {
        process.env = {};
        process.env[varName] = 'test_value';
        
        expect(() => {
          jest.resetModules();
          require('./constants');
        }).toThrow(
          `The ${requiredVars.find((v) => !process.env[v])} environment variable is required`,
        );
      });
    });
  });
}); 
