import React, { useRef } from 'react';
import * as THREE from 'three';
import { useThree, useFrame, ReactThreeFiber } from 'react-three-fiber';

export interface Dom3DElementProps {
  opacity: number;
  x: number;
  y: number;
  scale: number;
}

interface Dom3DProps {
  position: ReactThreeFiber.Vector3;
  scale: number;
  setElementProps: (props: Dom3DElementProps) => void;
}

export default function Dom3D({ position, scale, setElementProps }: Dom3DProps) {
  const { camera, size } = useThree();
  const group = useRef<THREE.Object3D>();
  const vector = new THREE.Vector3();
  const vector4 = new THREE.Vector4();
  const oldVector = useRef(new THREE.Vector3(1, 1, 0));
  const epsilon = 0.001;

  function updatePosition(group: THREE.Object3D, epsilon: number) {
    vector.setFromMatrixPosition(group.matrixWorld);

    // See Vector3.project() but we need to keep Vector4.w
    vector.applyMatrix4(camera.matrixWorldInverse);
    vector4.set(vector.x, vector.y, vector.z, 1);
    vector4.applyMatrix4(camera.projectionMatrix);

    // Project
    const w = 1 / Math.abs(vector4.w || 1);
    vector.set(w * vector4.x, w * vector4.y, w * vector4.z);

    const widthHalf = size.width / 2;
    const heightHalf = size.height / 2;
    vector.x = vector.x * widthHalf + widthHalf;
    vector.y = -(vector.y * heightHalf) + heightHalf;

    if (Math.abs(oldVector.current.x - vector.x) >= epsilon || Math.abs(oldVector.current.y - vector.y) >= epsilon) {
      // If w<0 it is behind the camera - pin to closest side
      if (vector4.w < 0) {
        vector.x = vector.x < widthHalf ? 0 : size.width;
      }
      vector.x = THREE.MathUtils.clamp(vector.x, 0, size.width);
      vector.y = THREE.MathUtils.clamp(vector.y, 0, size.height);
      // Dim if offscreen
      let opacity = 1;
      if (vector.x <= 0 || vector.x >= size.width || vector.y <= 0 || vector.y >= size.height) {
        opacity = 0.3;
      }
      setElementProps({ x: vector.x, y: vector.y, scale: scale, opacity: opacity });
    }
    oldVector.current.copy(vector);
  }

  useFrame(() => {
    if (group.current) {
      updatePosition(group.current, epsilon);
    }
  });

  return <group ref={group} position={position} />;
}
