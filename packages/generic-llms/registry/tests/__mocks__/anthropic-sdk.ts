/**
 * Manual mock for @anthropic-ai/sdk under test.
 */
const create = jest.fn();

const Anthropic = jest.fn().mockImplementation(() => ({
  messages: {
    create,
  },
}));

(Anthropic as any).__create = create;
module.exports = Anthropic;
module.exports.default = Anthropic;
