// Learn more: https://github.com/testing-library/jest-dom
import "@testing-library/jest-dom";

// Mock next-intl
jest.mock("next-intl", () => ({
  useTranslations: () => key => key,
  useLocale: () => "en",
  useFormatter: () => ({
    dateTime: date => date.toISOString(),
    number: value => value.toString(),
    relativeTime: date => date.toISOString(),
  }),
  NextIntlClientProvider: ({ children }) => children,
}));

// Mock Next.js router
jest.mock("next/router", () => ({
  useRouter() {
    return {
      route: "/",
      pathname: "/",
      query: {},
      asPath: "/",
      push: jest.fn(),
      replace: jest.fn(),
      reload: jest.fn(),
      back: jest.fn(),
      prefetch: jest.fn().mockResolvedValue(undefined),
      beforePopState: jest.fn(),
      events: {
        on: jest.fn(),
        off: jest.fn(),
        emit: jest.fn(),
      },
    };
  },
}));

// Mock Next.js navigation (App Router)
jest.mock("next/navigation", () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      refresh: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      prefetch: jest.fn(),
    };
  },
  useSearchParams() {
    return new URLSearchParams();
  },
  usePathname() {
    return "/";
  },
}));

// LINUX  this for linux for environment
// Minimal mock for next/server to provide NextRequest and NextResponse for tests
jest.mock("next/server", () => {
  class NextRequest {
    constructor(url, opts = {}) {
      this.url = url;
      this.method = opts.method || "GET";
      this._body = opts.body;
      const headersObj = opts.headers || {};
      // normalize headers to lower-case map
      const headerMap = new Map();
      Object.entries(headersObj).forEach(([k, v]) =>
        headerMap.set(k.toLowerCase(), v)
      );
      this.headers = {
        get: key => headerMap.get(key.toLowerCase()) ?? null,
      };

      // simple cookie parser
      const cookieMap = new Map();
      const cookieHeader = headersObj.Cookie || headersObj.cookie;
      if (cookieHeader && typeof cookieHeader === "string") {
        cookieHeader.split(";").forEach(pair => {
          const [name, ...rest] = pair.trim().split("=");
          cookieMap.set(name, { value: rest.join("=") });
        });
      }
      this.cookies = {
        get: name => cookieMap.get(name),
      };
    }

    async json() {
      try {
        return JSON.parse(this._body || "{}");
      } catch {
        return {};
      }
    }
  }

  class NextResponse {
    constructor(body) {
      this.body = body;
      this.status = 200;
      this._setCookies = [];
      this.headers = {
        // used by tests to read Set-Cookie values
        getSetCookie: () => this._setCookies,
        get: () => null,
      };
      this.cookies = {
        set: (name, value, opts = {}) => {
          // Very small serializer for assertions in tests. Include a Path and trailing semicolon
          const path = opts.path || "/";
          const cookieStr = `${name}=${value}; Path=${path}`;
          this._setCookies.push(cookieStr);
        },
      };
    }

    async json() {
      return this.body;
    }

    async text() {
      return typeof this.body === "string"
        ? this.body
        : JSON.stringify(this.body);
    }

    static json(body, opts = {}) {
      const r = new NextResponse(body);
      if (opts.status) r.status = opts.status;
      if (opts.headers) r._headers = opts.headers;
      return r;
    }
  }

  return { NextRequest, NextResponse };
});

// Provide a minimal global Response implementation used by tests when mocking fetch
if (typeof global.Response === "undefined") {
  global.Response = class Response {
    constructor(body, init = {}) {
      this._body = body;
      this.status = init.status ?? 200;
      this.headers = init.headers || {};
    }
    async json() {
      try {
        return JSON.parse(this._body);
      } catch {
        return null;
      }
    }
    async text() {
      return this._body;
    }
  };
}

// Ensure instance-level json() exists on NextResponse as well
// (in case the module mock above did not run early enough)
try {
  if (
    typeof global.NextResponse !== "undefined" &&
    !global.NextResponse.prototype.json
  ) {
    global.NextResponse.prototype.json = async function () {
      return this.body;
    };
  }
} catch (e) {
  // ignore
}
// end of linux

// Mock window.matchMedia
// Check if window exists before defining matchMedia
if (typeof window !== "undefined") {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });
}

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  observe() {
    return null;
  }
  disconnect() {
    return null;
  }
  unobserve() {
    return null;
  }
};

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  observe() {
    return null;
  }
  disconnect() {
    return null;
  }
  unobserve() {
    return null;
  }
};

// LINUX  this for linux for environment

// Mock scrollIntoView which is not implemented in some jsdom versions and causes
// libraries (e.g. cmdk) to throw during tests when they call it.
if (
  typeof global.HTMLElement !== "undefined" &&
  !global.HTMLElement.prototype.scrollIntoView
) {
  global.HTMLElement.prototype.scrollIntoView = jest.fn();
}

// Provide a lightweight localStorage mock for environments that don't have one
// This helps tests that intentionally request the Node environment to run
// without requiring Jest's CLI `--localstorage-file` flag.
if (typeof global.localStorage === "undefined") {
  (function () {
    let store = Object.create(null);

    Object.defineProperty(global, "localStorage", {
      configurable: true,
      enumerable: true,
      get() {
        return {
          getItem(key) {
            return Object.prototype.hasOwnProperty.call(store, key)
              ? store[key]
              : null;
          },
          setItem(key, value) {
            store[key] = String(value);
          },
          removeItem(key) {
            delete store[key];
          },
          clear() {
            store = Object.create(null);
          },
          key(idx) {
            return Object.keys(store)[idx] ?? null;
          },
          get length() {
            return Object.keys(store).length;
          },
        };
      },
    });
  })();
}

// end of linux
