"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.integrationOptions = void 0;
exports.integrationOptions = [
    {
        label: 'Notion',
        value: 'notion',
        type: 'integration',
        options: [
            {
                label: 'Product Roadmap',
                value: 'notion-db-product-roadmap',
                type: 'notion-db',
                subLabel: 'Product Planning Database',
                options: [
                    {
                        value: 'notion-1',
                        label: 'Q1 Features',
                        type: 'notion-db-entry',
                        metadata: {
                            database: 'Product Roadmap',
                            entry: 'Q1 Features',
                            lastEdited: '2h ago'
                        }
                    },
                    {
                        value: 'notion-2',
                        label: 'Authentication Redesign',
                        parentLabel: 'Product Roadmap',
                        subLabel: 'Last edited yesterday',
                        type: 'notion-db-entry',
                        metadata: {
                            database: 'Product Roadmap',
                            entry: 'Authentication Redesign',
                            lastEdited: 'yesterday'
                        }
                    },
                    {
                        label: 'Engineering Specs',
                        value: 'notion-db-engineering-specs',
                        type: 'notion-db',
                        subLabel: 'Technical Documentation Database',
                        isDisabled: true
                    },
                    {
                        value: 'notion-3',
                        label: 'API Documentation',
                        parentLabel: 'Engineering Specs',
                        subLabel: 'Last edited 3d ago',
                        type: 'notion-db-entry',
                        metadata: {
                            database: 'Engineering Specs',
                            entry: 'API Documentation',
                            lastEdited: '3d ago'
                        }
                    },
                    {
                        value: 'notion-4',
                        label: 'System Architecture',
                        parentLabel: 'Engineering Specs',
                        subLabel: 'Last edited 1w ago',
                        type: 'notion-db-entry',
                        metadata: {
                            database: 'Engineering Specs',
                            entry: 'System Architecture',
                            lastEdited: '1w ago'
                        }
                    }
                ]
            }
        ]
    },
    {
        label: 'Figma',
        value: 'figma',
        type: 'integration',
        options: [
            {
                label: 'Design System',
                value: 'figma-project-design-system',
                type: 'figma-project',
                subLabel: 'Design System Project',
                isDisabled: true
            },
            {
                value: 'figma-1',
                label: 'Components',
                parentLabel: 'Design System',
                subLabel: 'Frame • 1920x1080',
                type: 'figma-frame',
                metadata: {
                    project: 'Design System',
                    frame: 'Components',
                    dimensions: '1920x1080'
                }
            },
            {
                value: 'figma-2',
                label: 'Color Palette',
                parentLabel: 'Design System',
                subLabel: 'Frame • 1440x900',
                type: 'figma-frame',
                metadata: {
                    project: 'Design System',
                    frame: 'Color Palette',
                    dimensions: '1440x900'
                }
            },
            {
                label: 'Mobile App',
                value: 'figma-project-mobile-app',
                type: 'figma-project',
                subLabel: 'Mobile interface project',
                isDisabled: true
            },
            {
                value: 'figma-3',
                label: 'Home Screen',
                parentLabel: 'Mobile App',
                subLabel: 'Frame • 375x812',
                type: 'figma-frame',
                metadata: {
                    project: 'Mobile App',
                    frame: 'Home Screen',
                    dimensions: '375x812'
                }
            },
            {
                value: 'figma-4',
                label: 'Settings Flow',
                parentLabel: 'Mobile App',
                subLabel: 'Frame • 375x812',
                type: 'figma-frame',
                metadata: {
                    project: 'Mobile App',
                    frame: 'Settings Flow',
                    dimensions: '375x812'
                }
            }
        ]
    }
];
