"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.vercelCheckDomainAvailabilityTool = exports.vercelBuyDomainTool = exports.vercelDeployProjectTool = exports.vercelSearchDocumentationTool = exports.vercelGetDeploymentBuildLogsTool = exports.vercelGetDeploymentEventsTool = exports.vercelGetDeploymentTool = exports.vercelListDeploymentsTool = exports.vercelGetProjectTool = exports.vercelListProjectsTool = exports.vercelListTeamsTool = void 0;
function createTool(handler) {
    return {
        async execute(input) {
            return handler(input);
        }
    };
}
exports.vercelListTeamsTool = createTool(() => ({
    teams: [{ id: 'team_bitcode', name: 'Bitcode Builders' }]
}));
exports.vercelListProjectsTool = createTool(() => ({
    projects: [{ id: 'prj_Yapper', name: 'Yapper', framework: 'nextjs' }]
}));
exports.vercelGetProjectTool = createTool(() => ({
    id: 'prj_Yapper',
    name: 'Yapper',
    targets: ['production'],
    links: [{ rel: 'repo', href: 'https://github.com/bitcode-labs/yapper' }]
}));
exports.vercelListDeploymentsTool = createTool(() => ({
    deployments: [{ id: 'dep_1', readyState: 'READY', target: 'production' }]
}));
exports.vercelGetDeploymentTool = createTool(() => ({
    id: 'dep_1',
    readyState: 'READY',
    name: 'yapper-production'
}));
exports.vercelGetDeploymentEventsTool = createTool(() => ({
    events: [{ type: 'BUILDING', createdAt: new Date().toISOString() }]
}));
exports.vercelGetDeploymentBuildLogsTool = createTool(() => ({
    logs: ['Log line 1', 'Log line 2']
}));
exports.vercelSearchDocumentationTool = createTool(() => ({
    hits: [{ title: 'Mock doc', url: 'https://vercel.com/docs/mock' }]
}));
exports.vercelDeployProjectTool = createTool(() => ({
    id: 'dep_mock',
    readyState: 'BUILDING',
    inspectorUrl: 'https://vercel.com/mock'
}));
exports.vercelBuyDomainTool = createTool(() => ({
    domain: 'yapper.app',
    status: 'PENDING'
}));
exports.vercelCheckDomainAvailabilityTool = createTool(() => ({
    available: true,
    domain: 'yapper.app'
}));
