// Purple glassy select styles (react-select) inspired by inline template menus

export const glassyPillStyles = {
  minHeight: '28px',
  display: 'flex',
  alignItems: 'center',
  backgroundColor: 'rgba(24,18,35,0.8)',
  border: '1px solid rgba(167,139,250,0.18)',
  borderRadius: '9999px',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  padding: '0 6px',
  ':hover': {
    borderColor: 'rgba(216,180,254,0.35)',
    backgroundColor: 'rgba(167,139,250,0.06)',
    boxShadow: '0 0 12px rgba(167,139,250,0.15)',
  },
} as const;

export const glassyStyles = {
  menuPortal: (base: any) => ({ ...base, zIndex: 9999 }),
  input: (base: any) => ({ ...base, color: '#fff', fontSize: '0.75rem', '::placeholder': { color: '#9ca3af' } }),
  control: (base: any, state: any) => ({
    ...base,
    ...glassyPillStyles,
    ...(state.isFocused && { boxShadow: '0 0 12px rgba(167,139,250,0.25)' }),
    ...(state.isDisabled && {
      borderColor: 'rgba(167,139,250,0.08)', opacity: 0.5, cursor: 'not-allowed',
      ':hover': { borderColor: 'rgba(167,139,250,0.08)', backgroundColor: 'rgba(24,18,35,0.8)', boxShadow: 'none' },
    }),
  }),
  valueContainer: (base: any) => ({ ...base, padding: 0 }),
  placeholder: (base: any) => ({ ...base, color: '#9ca3af', fontSize: '0.75rem' }),
  singleValue: (base: any) => ({ ...base, color: '#fff', fontSize: '0.75rem', fontWeight: 500 }),
  dropdownIndicator: (base: any, state: any) => ({
    ...base,
    color: state.isDisabled ? 'rgba(167,139,250,0.25)' : state.isFocused ? 'rgba(216,180,254,0.9)' : 'rgba(167,139,250,0.6)',
    transition: 'all 0.2s ease-in-out', ':hover': !state.isDisabled && { color: '#d8b4fe' }, svg: { width: '12px', height: '12px' }, padding: 0, marginRight: '4px',
  }),
  indicatorSeparator: () => ({ display: 'none' }),
  menu: (base: any) => ({
    ...base,
    backgroundColor: 'rgba(10,12,20,0.98)', backdropFilter: 'blur(12px)',
    border: '1px solid rgba(167,139,250,0.16)', borderRadius: 12,
    boxShadow: '0 10px 40px rgba(0,0,0,0.45), 0 0 0 1px rgba(167,139,250,0.08), inset 0 0 24px rgba(167,139,250,0.04)',
    marginTop: '6px', padding: '6px', overflow: 'hidden',
  }),
  menuList: (base: any) => ({ ...base, padding: 0 }),
  option: (base: any, state: any) => ({
    ...base, fontSize: '0.75rem', backgroundColor: 'transparent', color: state.isDisabled ? '#666' : state.isFocused ? '#fff' : '#a3a3a3', padding: '8px 12px', cursor: state.isDisabled ? 'not-allowed' : 'pointer', borderRadius: 6, margin: '1px 0', transition: 'all 0.2s ease', position: 'relative',
    '::before': { content: '""', position: 'absolute', inset: 0, borderRadius: 6, padding: 1, background: state.isFocused ? 'linear-gradient(120deg, rgba(167,139,250,0.2), rgba(216,180,254,0.3))' : 'transparent', WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)', WebkitMaskComposite: 'xor', maskComposite: 'exclude', opacity: state.isFocused ? 1 : 0, transition: 'all 0.2s ease' },
    '::after': { content: '""', position: 'absolute', inset: 0, borderRadius: 6, background: state.isFocused ? 'linear-gradient(120deg, rgba(167,139,250,0.08), rgba(216,180,254,0.02))' : 'transparent', opacity: state.isFocused ? 1 : 0, transition: 'all 0.2s ease' },
    ':active': { transform: state.isDisabled ? 'none' : 'scale(0.98)' }, ':hover': !state.isDisabled && { color: '#fff', backgroundColor: 'rgba(167,139,250,0.06)' },
  }),
  multiValue: (base: any) => ({ ...base, backgroundColor: 'rgba(24,18,35,0.7)', borderRadius: 9999, border: '1px solid rgba(167,139,250,0.35)', boxShadow: '0 0 8px rgba(167,139,250,0.15)', padding: '1px 5px', margin: '2px 3px', fontSize: '0.7rem', color: '#d8b4fe', backdropFilter: 'blur(4px)', transition: 'all 0.2s ease', ':hover': { border: '1px solid rgba(216,180,254,0.5)', backgroundColor: 'rgba(167,139,250,0.08)', boxShadow: '0 0 12px rgba(216,180,254,0.2)', transform: 'scale(1.02)' } }),
  multiValueRemove: (base: any) => ({ ...base, color: '#d8b4fe', fontSize: '0.65rem', ':hover': { backgroundColor: 'rgba(216,180,254,0.12)', color: '#d8b4fe', transform: 'scale(1.1)' } }),
  clearIndicator: (base: any) => ({ ...base, color: 'rgba(167,139,250,0.6)', ':hover': { color: '#d8b4fe' }, padding: 0 }),
  loadingIndicator: (base: any) => ({ ...base, color: '#d8b4fe', display: 'none' }),
} as const;

