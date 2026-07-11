# Deposits experience (`Deposits*`)

## Layout

```
deposits/
  README.md
  models/                 # pure route models, formatters, explainers
  DepositSourceSelection/
    DepositSourceSelection.tsx
    hooks/
    styles/
    __tests__/
  DepositObfuscationsPathIcons/
    DepositObfuscationsPathIcons.tsx
    ...
```

Page shell: `uapi/app/deposits/` (orchestration only).

Import Bitcode only. Co-locate new components as named directories.
