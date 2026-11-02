# FrameTrace Conventions

## Coordinate System
- Right-handed, Y-up (matches Three.js convention). +X points right, +Y points up, and +Z points towards the viewer

## Vectors and Matrices
- Column vectors: a point is transformed as p' = M · p.
- Composition: applying A, then B, then C gives M = C · B · A
(operations start from the rightmost component)
- Matrices are displayed row by row on screen.
(stored as columns)

## Rotation Direction
- A positive angle is counter-clockwise when looking from the positive end of the axis towards the origin. 
(right hand rule: thumb along positive axis, fingers curl in the positive direction)

## Units
- Angles are represented as degrees in the UI and as radians internally. Conversion happens via core/math/angles.ts

## Project Boundaries
src/core/ TypeScript math only.
src/scene/ Three.js classes. No React.
src/ui/ React components which manipulate scene classes but not Three.js