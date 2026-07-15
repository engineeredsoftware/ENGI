import {
  buildGetAuxillaryTemplatePreferencesRoute,
  buildPostAuxillaryTemplatePreferencesRoute,
} from '@bitcode/api/src/routes/auxillaries';
import {
  ENABLE_MOCKS,
  MOCK_USER_TEMPLATES,
  MOCK_USER_TEMPLATES_SCENARIO,
} from '@/config/featureFlags';
import userTemplatesDefaultMock from '@/mocks/user-template-preferences-default.json';
import userTemplatesEmptyMock from '@/mocks/user-template-preferences-empty.json';

const EMPTY_TEMPLATE_PREFERENCES = {
  shippable_templates: {},
  evidence_document_templates: {},
};

function getMockTemplatePreferences() {
  switch (MOCK_USER_TEMPLATES_SCENARIO) {
    case 'empty':
      return userTemplatesEmptyMock;
    default:
      return userTemplatesDefaultMock;
  }
}

export const runtime = 'nodejs';

const routeOptions = {
  useTemplateMock: () => ENABLE_MOCKS && MOCK_USER_TEMPLATES,
  mockTemplatePreferences: getMockTemplatePreferences,
};

export const GET = buildGetAuxillaryTemplatePreferencesRoute(routeOptions);
export const POST = buildPostAuxillaryTemplatePreferencesRoute(routeOptions);
