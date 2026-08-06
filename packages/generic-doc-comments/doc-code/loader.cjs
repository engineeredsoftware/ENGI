"use strict";

const { transformDocCodeTools } = require("./transformDocCodeTools.cjs");

function docCodeToolLoader(source) {
  const options = this.getOptions() || {};

  if (options.test && !options.test.test(this.resourcePath)) {
    return source;
  }

  if (options.exclude?.some((pattern) => pattern.test(this.resourcePath))) {
    return source;
  }

  if (!source.includes("@doc-code-tool")) {
    return source;
  }

  try {
    return transformDocCodeTools(source, this.resourcePath);
  } catch (error) {
    this.emitError(error);
    return source;
  }
}

docCodeToolLoader.raw = false;

module.exports = docCodeToolLoader;
module.exports.default = docCodeToolLoader;
