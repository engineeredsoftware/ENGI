# Cosmic Meteors Component

A naturalistic, elegant star traversal effect that simulates stars moving through the fabric of space.

## Features

- **Natural Distribution**: Uses Fibonacci distribution and Poisson disc sampling for realistic star placement
- **Varied Velocities**: Different meteor types move at different speeds based on their size and position
- **Elegant Rendering**: Smooth fade-in/fade-out with natural acceleration and deceleration
- **Multiple Meteor Types**:
  - Standard meteors (60%)
  - Distant stars (30%)
  - Bright comets (10%)
- **Background Elements**:
  - Star clusters with subtle twinkling effect
  - Cosmic dust particles for depth
- **Color Schemes**:
  - Default (white/blue)
  - Cosmic (green/teal)
  - Aurora (blue/cyan)
  - Nebula (pink/purple)

## Usage

```tsx
import { Meteors } from "@/components/magicui/meteors";

export default function MyComponent() {
  return (
    <div className="relative h-[40rem] w-full overflow-hidden rounded-lg border bg-black">
      {/* Your content */}
      <div className="relative z-10 flex h-full w-full flex-col items-center justify-center">
        <h1 className="text-4xl font-bold text-white">Your Content Here</h1>
      </div>
      
      {/* Meteors effect */}
      <Meteors 
        number={20} 
        colorScheme="cosmic"
      />
    </div>
  );
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `number` | number | 20 | Number of meteors to display |
| `className` | string | "" | Additional CSS classes |
| `style` | object | {} | Additional inline styles |
| `colorScheme` | "default" \| "cosmic" \| "aurora" \| "nebula" | "default" | Color scheme for meteors |
| `starClusters` | number | 50 | Number of background star clusters |
| `cosmicDust` | number | 100 | Number of cosmic dust particles |

## Advanced Usage

For more control, you can use the `CosmicMeteors` component directly:

```tsx
import { CosmicMeteors } from "@/components/magicui/cosmic-meteors";

export default function MyComponent() {
  return (
    <div className="relative h-[40rem] w-full overflow-hidden rounded-lg border bg-black">
      {/* Your content */}
      <div className="relative z-10 flex h-full w-full flex-col items-center justify-center">
        <h1 className="text-4xl font-bold text-white">Your Content Here</h1>
      </div>
      
      {/* Meteors effect with advanced configuration */}
      <CosmicMeteors 
        number={20} 
        colorScheme="cosmic"
        starClusters={80}
        cosmicDust={150}
      />
    </div>
  );
}
```

## Design Principles

1. **Naturalism**: The distribution, velocity, and appearance of meteors are designed to mimic natural phenomena
2. **Elegance**: Subtle animations and transitions create a refined, polished effect
3. **Minimalism**: Clean, simple visuals that enhance rather than distract from content
4. **Depth**: Multiple layers (dust, stars, meteors) create a sense of depth and dimension
5. **Performance**: Optimized rendering with will-change properties and efficient animations
