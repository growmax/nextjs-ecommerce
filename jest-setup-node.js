// Jest setup for Node environment tests
// Provides localStorage mock for Node.js environment

if (typeof localStorage === "undefined") {
  const store = {};

  global.localStorage = {
    getItem: key => store[key] || null,
    setItem: (key, value) => {
      store[key] = String(value);
    },
    removeItem: key => {
      delete store[key];
    },
    clear: () => {
      Object.keys(store).forEach(key => {
        delete store[key];
      });
    },
    key: index => {
      const keys = Object.keys(store);
      return keys[index] || null;
    },
    get length() {
      return Object.keys(store).length;
    },
  };
}
