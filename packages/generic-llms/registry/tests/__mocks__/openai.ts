/**
 * Manual mock for the openai SDK (used by OpenAI + xAI providers under test).
 */
const create = jest.fn();

const OpenAI = jest.fn().mockImplementation(() => ({
  chat: {
    completions: {
      create,
    },
  },
}));

(OpenAI as any).__create = create;
module.exports = OpenAI;
module.exports.default = OpenAI;
