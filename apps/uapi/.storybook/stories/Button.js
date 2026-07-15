"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Button = void 0;
const react_1 = __importDefault(require("react"));
require("./button.css");
/**
 * Primary UI component for user interaction
 */
const Button = ({ primary = false, size = 'medium', backgroundColor, label, ...props }) => {
    const mode = primary ? 'storybook-button--primary' : 'storybook-button--secondary';
    return (<button type="button" className={['storybook-button', `storybook-button--${size}`, mode].join(' ')} style={{ backgroundColor }} {...props}>
      {label}
    </button>);
};
exports.Button = Button;
