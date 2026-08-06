const styleProxy = new Proxy(
  {},
  {
    get: (_target, prop) => {
      if (prop === '__esModule') return true;
      if (prop === 'default') return styleProxy;
      return String(prop);
    },
  },
);

module.exports = styleProxy;
module.exports.default = styleProxy;
