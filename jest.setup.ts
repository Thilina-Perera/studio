import '@testing-library/jest-dom';
global.fetch = jest.fn();

const mockResponse = jest.fn(() => ({
  headers: {
    append: jest.fn(),
    delete: jest.fn(),
    get: jest.fn(),
    has: jest.fn(),
    set: jest.fn(),
    forEach: jest.fn(),
  },
  ok: true,
  redirected: false,
  status: 200,
  statusText: 'OK',
  type: 'basic',
  url: '',
  clone: jest.fn(),
  body: null,
  bodyUsed: false,
  arrayBuffer: jest.fn(),
  blob: jest.fn(),
  formData: jest.fn(),
  json: jest.fn(),
  text: jest.fn(),
}));

(mockResponse as any).error = jest.fn();
(mockResponse as any).redirect = jest.fn();
(mockResponse as any).json = jest.fn();

global.Response = mockResponse as any;
