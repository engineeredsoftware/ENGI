import type { Meta, StoryObj } from '@storybook/react';
import Select from 'react-select';
import { glassyStyles } from '@/components/bitcode/selects/glassy-select-styles';

const meta: Meta = {
  title: 'Base/GlassySelect',
};
export default meta;

export const Default: StoryObj = {
  render: () => (
    <div style={{ padding: 24, background: '#0a0f1c', height: 200 }}>
      <div style={{ width: 260 }}>
        <Select
          options={[
            { label: 'Option A', value: 'a' },
            { label: 'Option B', value: 'b' },
            { label: 'Option C', value: 'c' },
          ]}
          styles={glassyStyles}
          placeholder="Glassy Select"
          menuPlacement="auto"
          menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
          menuPosition="fixed"
        />
      </div>
    </div>
  )
};

