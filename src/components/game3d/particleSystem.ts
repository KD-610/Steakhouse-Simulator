import * as THREE from 'three';

export interface Particle {
  mesh: THREE.Mesh;
  velocity: THREE.Vector3;
  life: number;
  maxLife: number;
}

export class ParticleSystem {
  private particles: Particle[] = [];
  private scene: THREE.Scene;
  private smokeMaterial: THREE.MeshBasicMaterial;
  private sparkMaterial: THREE.MeshBasicMaterial;
  private saltMaterial: THREE.MeshStandardMaterial;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.smokeMaterial = new THREE.MeshBasicMaterial({
      color: 0x94a3b8,
      transparent: true,
      opacity: 0.35,
      depthWrite: false
    });
    this.sparkMaterial = new THREE.MeshBasicMaterial({
      color: 0xf97316,
      transparent: true,
      opacity: 0.9,
      depthWrite: false
    });
    this.saltMaterial = new THREE.MeshStandardMaterial({
      color: 0xfef08a,
      metalness: 0.8,
      roughness: 0.2
    });
  }

  public emitGrillSmoke(position: THREE.Vector3) {
    if (this.particles.length > 150) return;

    // Small smoke puff
    const smokeGeo = new THREE.SphereGeometry(0.08 + Math.random() * 0.06, 6, 6);
    const smokeMesh = new THREE.Mesh(smokeGeo, this.smokeMaterial.clone());
    smokeMesh.position.copy(position);
    smokeMesh.position.x += (Math.random() - 0.5) * 0.3;
    smokeMesh.position.z += (Math.random() - 0.5) * 0.3;
    this.scene.add(smokeMesh);

    this.particles.push({
      mesh: smokeMesh,
      velocity: new THREE.Vector3((Math.random() - 0.5) * 0.1, 0.4 + Math.random() * 0.3, (Math.random() - 0.5) * 0.1),
      life: 0,
      maxLife: 1.5 + Math.random() * 0.5
    });

    // Occasional spark
    if (Math.random() < 0.25) {
      const sparkGeo = new THREE.BoxGeometry(0.02, 0.02, 0.02);
      const sparkMesh = new THREE.Mesh(sparkGeo, this.sparkMaterial);
      sparkMesh.position.copy(position);
      this.scene.add(sparkMesh);

      this.particles.push({
        mesh: sparkMesh,
        velocity: new THREE.Vector3((Math.random() - 0.5) * 0.3, 0.8 + Math.random() * 0.4, (Math.random() - 0.5) * 0.3),
        life: 0,
        maxLife: 0.6
      });
    }
  }

  public emitSaltSprinkle(position: THREE.Vector3) {
    // Generate 35 golden salt grains falling from high angle like Nusret!
    for (let i = 0; i < 35; i++) {
      const saltGeo = new THREE.DodecahedronGeometry(0.018 + Math.random() * 0.015);
      const saltMesh = new THREE.Mesh(saltGeo, this.saltMaterial);
      saltMesh.position.set(
        position.x + (Math.random() - 0.5) * 0.25,
        position.y + 0.9 + Math.random() * 0.4,
        position.z + (Math.random() - 0.5) * 0.25
      );
      this.scene.add(saltMesh);

      this.particles.push({
        mesh: saltMesh,
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 0.15,
          -1.2 - Math.random() * 0.6,
          (Math.random() - 0.5) * 0.15
        ),
        life: 0,
        maxLife: 0.9
      });
    }
  }

  public update(delta: number) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life += delta;

      if (p.life >= p.maxLife) {
        this.scene.remove(p.mesh);
        p.mesh.geometry.dispose();
        if (Array.isArray(p.mesh.material)) {
          p.mesh.material.forEach(m => m.dispose());
        } else {
          p.mesh.material.dispose();
        }
        this.particles.splice(i, 1);
      } else {
        p.mesh.position.addScaledVector(p.velocity, delta);
        const progress = p.life / p.maxLife;

        // Fade smoke
        if (p.mesh.material instanceof THREE.MeshBasicMaterial) {
          p.mesh.material.opacity = Math.max(0, 0.35 * (1 - progress));
          p.mesh.scale.multiplyScalar(1 + delta * 0.6);
        }
      }
    }
  }

  public clear() {
    this.particles.forEach(p => {
      this.scene.remove(p.mesh);
      p.mesh.geometry.dispose();
    });
    this.particles = [];
  }
}
