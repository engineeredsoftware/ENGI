export const pillStyles = {
  minHeight: '28px',
  display: 'flex',
  alignItems: 'center',
  backgroundColor: 'rgba(3,8,22,0.9)',
  border: '1px solid rgba(103,254,183,0.1)',
  borderRadius: '9999px',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  padding: '0 6px',
  ':hover': {
    borderColor: 'rgba(103,254,183,0.3)',
    backgroundColor: 'rgba(103,254,183,0.05)',
    boxShadow: '0 0 12px rgba(103,254,183,0.15)',
  },
};

export const borderlessPillStyles = {
  minHeight: '28px',
  display: 'flex',
  alignItems: 'center',
  backgroundColor: 'rgba(3,8,22,0.6)',
  border: '1px solid transparent',
  borderRadius: '9999px',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  padding: '0 6px',
  ':hover': {
    backgroundColor: 'rgba(103,254,183,0.08)',
    boxShadow: '0 0 12px rgba(103,254,183,0.15)',
  },
};

export const customStyles = {
  menuPortal: (base: any) => ({
    ...base,
    zIndex: 9999,
  }),

  input: (base: any) => ({
    ...base,
    color: '#fff',
    fontSize: '0.75rem',
    '::placeholder': {
      color: '#6b7280',
    },
  }),

  control: (base: any, state: any) => ({
    ...base,
    ...pillStyles,
    ...(state.isFocused && {
      boxShadow: '0 0 12px rgba(103,254,183,0.2)',
    }),
    ...(state.isDisabled && {
      borderColor: 'rgba(103,254,183,0.05)',
      opacity: 0.5,
      cursor: 'not-allowed',
      ':hover': {
        borderColor: 'rgba(103,254,183,0.05)',
        backgroundColor: 'rgba(3,8,22,0.9)',
        boxShadow: 'none',
      },
    }),
  }),

  valueContainer: (base: any) => ({
    ...base,
    padding: 0,
  }),

  placeholder: (base: any) => ({
    ...base,
    color: '#6b7280',
    fontSize: '0.75rem',
  }),

  singleValue: (base: any) => ({
    ...base,
    color: '#fff',
    fontSize: '0.75rem',
    fontWeight: 500,
  }),

  dropdownIndicator: (base: any, state: any) => ({
    ...base,
    color: state.isDisabled
      ? 'rgba(103,254,183,0.15)'
      : state.isFocused
      ? 'rgba(103,254,183,0.8)'
      : 'rgba(103,254,183,0.4)',
    transition: 'all 0.2s ease-in-out',
    ':hover': !state.isDisabled && {
      color: '#67feb7',
    },
    svg: {
      width: '12px',
      height: '12px',
    },
    padding: '0',
    marginRight: '4px',
  }),

  indicatorSeparator: () => ({
    display: 'none',
  }),

  menu: (base: any) => ({
    ...base,
    backgroundColor: 'rgba(3,8,22,0.98)',
    backdropFilter: 'blur(12px)',
    border: '1px solid rgba(103,254,183,0.12)',
    borderRadius: 'var(--radius)',
    boxShadow: `
      0 4px 12px rgba(0,0,0,0.4),
      0 0 0 1px rgba(103,254,183,0.06),
      inset 0 0 12px rgba(103,254,183,0.02)
    `,
    marginTop: '6px',
    padding: '6px',
    overflow: 'hidden',
  }),

  menuList: (base: any) => ({
    ...base,
    padding: '0',
  }),

  option: (base: any, state: any) => ({
    ...base,
    fontSize: '0.75rem',
    backgroundColor: 'transparent',
    color: state.isDisabled ? '#666' : state.isFocused ? '#fff' : '#999',
    padding: '8px 12px',
    cursor: state.isDisabled ? 'not-allowed' : 'pointer',
    borderRadius: '6px',
    margin: '1px 0',
    transition: 'all 0.2s ease',
    position: 'relative',
    '::before': {
      content: '""',
      position: 'absolute',
      inset: 0,
      borderRadius: '6px',
      padding: '1px',
      background: state.isFocused ?
        'linear-gradient(120deg, rgba(103,254,183,0.2), rgba(103,254,183,0.3))' :
        'transparent',
      WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
      WebkitMaskComposite: 'xor',
      maskComposite: 'exclude',
      opacity: state.isFocused ? 1 : 0,
      transition: 'all 0.2s ease',
    },
    '::after': {
      content: '""',
      position: 'absolute',
      inset: 0,
      borderRadius: '6px',
      background: state.isFocused ?
        'linear-gradient(120deg, rgba(103,254,183,0.08), rgba(103,254,183,0.02))' :
        'transparent',
      opacity: state.isFocused ? 1 : 0,
      transition: 'all 0.2s ease',
    },
    ':active': {
      transform: state.isDisabled ? 'none' : 'scale(0.98)',
    },
    ':hover': !state.isDisabled && {
      color: '#fff',
      backgroundColor: 'rgba(103,254,183,0.03)',
    },
  }),

  multiValue: (base: any) => ({
    ...base,
    backgroundColor: 'rgba(3,8,22,0.8)',
    borderRadius: '9999px',
    border: '1px solid rgba(103,254,183,0.3)',
    boxShadow: '0 0 8px rgba(103,254,183,0.1)',
    padding: '1px 5px',
    margin: '2px 3px',
    fontSize: '0.7rem',
    color: '#67feb7',
    backdropFilter: 'blur(4px)',
    transition: 'all 0.2s ease',
    ':hover': {
      border: '1px solid rgba(103,254,183,0.5)',
      backgroundColor: 'rgba(103,254,183,0.05)',
      boxShadow: '0 0 12px rgba(103,254,183,0.15)',
      transform: 'scale(1.02)',
    },
  }),

  multiValueRemove: (base: any) => ({
    ...base,
    color: '#67feb7',
    fontSize: '0.65rem',
    ':hover': {
      backgroundColor: 'rgba(103,254,183,0.1)',
      color: '#67feb7',
      transform: 'scale(1.1)',
    },
  }),

  clearIndicator: (base: any) => ({
    ...base,
    color: 'rgba(103,254,183,0.4)',
    ':hover': {
      color: '#67feb7',
    },
    padding: 0,
  }),

  loadingIndicator: (base: any) => ({
    ...base,
    color: '#67feb7',
    display: 'none',
  }),
};
