---
description: Component architecture rules for React Native screens and components in this project
---

# Component Rules

## 1. One component per file

Each file exports exactly one React component. No helper components defined in the same file.

```tsx
// BAD — StatsHeader defined inside History.tsx
const StatsHeader = () => { ... };
export const History = () => { ... };

// GOOD — split into separate files
// features/History/components/StatsHeader/StatsHeader.tsx
export const StatsHeader = () => { ... };

// features/History/History.tsx
import { StatsHeader } from './components/StatsHeader/StatsHeader';
export const History = () => { ... };
```

---

## 2. No inline component definitions

Never define a component inside another component's body or render scope. Components defined inline are re-created on every render and defeat React's reconciliation.

```tsx
// BAD
export const History = () => {
  const EmptyState = () => <Text>No items</Text>; // re-created every render
  return <FlatList ListEmptyComponent={<EmptyState />} />;
};

// GOOD — EmptyState lives in its own file or is defined at module scope (if truly trivial and file-private)
```

---

## 3. No logic in component files — always use a component hook

The component file contains only JSX. All data derivation, transformations, event handlers, query calls, store reads, and computed values belong in a `use<ComponentName>.ts` hook co-located next to the component.

```
features/History/
  History.tsx               ← only JSX + hook call
  hooks/
    useHistory.ts           ← query, pagination, derived state
```

```tsx
// BAD — logic in component body
export const History = () => {
  const { data } = useHistory();
  const items = data?.pages.flatMap(p => p.data) ?? [];  // derivation
  const handleEndReached = () => { if (hasNextPage) fetchNextPage(); }; // handler
  ...
};

// GOOD — all logic in hook
// hooks/useHistoryScreen.ts
export const useHistoryScreen = () => {
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useHistory();
  const items = data?.pages.flatMap(p => p.data) ?? [];
  const handleEndReached = () => { if (hasNextPage) fetchNextPage(); };
  return { items, isLoading, isFetchingNextPage, handleEndReached };
};

// History.tsx
export const History = () => {
  const { items, isLoading, isFetchingNextPage, handleEndReached } = useHistoryScreen();
  const { styles } = useHistoryTheme();
  ...
};
```

Pure formatting/utility functions (e.g. `formatAmount`, `formatSeconds`) belong in `utils/` or the hook file — never loose in the component file.

---

## 4. Always use project custom components over React Native primitives

When a custom component exists, always use it. Never reach for the bare RN primitive.

| Instead of                                 | Use                                                                         |
| ------------------------------------------ | --------------------------------------------------------------------------- |
| `<Text>` from `react-native`               | `<Text>` from `components/Text/Text`                                        |
| `<ActivityIndicator>` from `react-native`  | `<ActivityIndicator>` from `components/ActivityIndicator/ActivityIndicator` |
| `<TouchableOpacity>` for a labelled action | `<Button>` from `components/Button/Button`                                  |

```tsx
// BAD
import { Text, ActivityIndicator } from 'react-native';

// GOOD
import { Text } from 'components/Text/Text';
import { ActivityIndicator } from 'components/ActivityIndicator/ActivityIndicator';
```

---

## 5. Extract abstract components whenever a pattern repeats

If a UI pattern appears more than once, or is complex enough to reason about independently, extract it to `src/components/`. Prefer a reusable abstraction over copy-pasting structure.

Signs you should extract:

- Same visual structure used in two or more places
- A self-contained section inside a screen (empty state, list header, card)
- Any component with its own local state or animation

```
src/components/
  EmptyState/
    EmptyState.tsx
    theme/
      useEmptyStateTheme.ts
```

---

## 6. Props interface always named `<ComponentName>Props`

Every component has an explicitly typed props interface. No inline types or anonymous objects.

```tsx
// BAD
export const CycleCard = ({ item }: { item: HistoryItem }) => { ... };

// GOOD
interface CycleCardProps {
  item: HistoryItem;
}
export const CycleCard = ({ item }: CycleCardProps) => { ... };
```

---

## 7. Named exports only — no default exports

Consistent with the rest of the codebase. Named exports make refactoring and searching reliable.

```tsx
// BAD
export default function History() { ... }

// GOOD
export const History = () => { ... };
```

---

## 8. `renderItem` and `keyExtractor` defined in the hook, not inline

Inline arrow functions in `FlatList` props are recreated on every render. Define them in the component hook and pass stable references.

```tsx
// BAD
<FlatList
  renderItem={({ item }) => <CycleCard item={item} />}
  keyExtractor={item => item.id}
/>;

// GOOD — in the hook
const renderItem = useCallback(
  ({ item }: { item: HistoryItem }) => <CycleCard item={item} />,
  [],
);
const keyExtractor = useCallback((item: HistoryItem) => item.id, []);

// in the component
<FlatList renderItem={renderItem} keyExtractor={keyExtractor} />;
```

---

## 9. Empty, loading, and error states are named components

Never inline loading spinners or empty state copy directly in the component JSX. Give them a name — either as an imported component or, if used only once and trivially small, as a named constant in the hook's return value.

```tsx
// BAD
ListEmptyComponent={
  <View style={styles.empty}>
    <Text color="font-secondary">No tenés ciclos registrados aún.</Text>
  </View>
}

// GOOD — own file
// components/HistoryEmptyState/HistoryEmptyState.tsx
export const HistoryEmptyState = () => { ... };
```

---

## 10. Strings and labels always live in a dedicated `use[Component]Strings` hook

Never call `useTranslation` or `t()` inside a logic hook (e.g. `useMyScreen.ts`). All translated strings must be extracted into a separate `use[Component]Strings.ts` file co-located in the same `hooks/` folder. The logic hook imports from it.

```
features/MyFeature/hooks/
  useMyFeature.ts         ← logic only — no useTranslation
  useMyFeatureStrings.ts  ← all t() calls live here
```

```ts
// BAD — translation mixed into logic hook
export const useMyFeature = () => {
  const { t } = useTranslation('common');
  const title = t('myFeature.title');
  const [count, setCount] = useState(0);
  return { title, count };
};

// GOOD — strings isolated
// useMyFeatureStrings.ts
export const useMyFeatureStrings = () => {
  const { t } = useTranslation('common');
  return { title: t('myFeature.title') };
};

// useMyFeature.ts
export const useMyFeature = () => {
  const { title } = useMyFeatureStrings();
  const [count, setCount] = useState(0);
  return { title, count };
};
```

If a hook contains **only** translated strings and no logic, name the file `use[Component]Strings.ts` directly — do not create a separate empty logic hook.

---

## 11. No `any` in component props or hook return types

Use proper model types from `src/models/` or derive precise types from API responses. `any` in a prop type defeats TypeScript's value entirely.

```tsx
// BAD
const cycleSeconds = (machine as any).cycleRemainingSeconds as
  | number
  | undefined;

// GOOD — add the field to the Machine model
machine.cycleRemainingSeconds;
```
