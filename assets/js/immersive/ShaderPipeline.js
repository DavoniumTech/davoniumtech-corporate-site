/** Small GLSL patch pipeline for real Three.js materials. Falls back cleanly if shader hooks are unavailable. */
class ShaderPipeline {
  createHolographicMaterial(THREE, color = 0x43ddec) {
    const material = new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity: 0.42,
      depthWrite: false,
      depthTest: true,
      toneMapped: false,
      blending: THREE.AdditiveBlending
    });
    material.userData.dvnmShader = null;
    material.userData.dvnmPointer = null;
    material.userData.dvnmIntensity = 1;
    material.onBeforeCompile = shader => {
      shader.uniforms.uDvnmTime = { value: 0 };
      shader.uniforms.uDvnmPointer = { value: new THREE.Vector2(0, 0) };
      shader.uniforms.uDvnmIntensity = { value: 1 };
      shader.vertexShader = shader.vertexShader.replace(
        '#include <common>',
        '#include <common>\nuniform float uDvnmTime;\nuniform vec2 uDvnmPointer;\nuniform float uDvnmIntensity;\nvarying float vDvnmGlow;'
      );
      shader.vertexShader = shader.vertexShader.replace(
        '#include <begin_vertex>',
        `#include <begin_vertex>
        vDvnmGlow = 0.0;
        #ifdef USE_INSTANCING
          vec3 dvnmPosition = (instanceMatrix * vec4(transformed, 1.0)).xyz;
          float dvnmWave = sin(uDvnmTime * 0.72 + dvnmPosition.x * 1.7 + dvnmPosition.z * 1.35);
          float dvnmAttraction = exp(-length(dvnmPosition.xz - uDvnmPointer) * 0.78);
          float dvnmScale = length(instanceMatrix[0].xyz);
          transformed.y += ((dvnmWave * 0.014 + dvnmAttraction * 0.025) / max(dvnmScale, 0.006)) * uDvnmIntensity;
          vDvnmGlow = clamp(0.22 + abs(dvnmWave) * 0.42 + dvnmAttraction * 0.48, 0.0, 1.0);
        #endif`
      );
      shader.fragmentShader = shader.fragmentShader.replace(
        '#include <common>',
        '#include <common>\nvarying float vDvnmGlow;'
      );
      shader.fragmentShader = shader.fragmentShader.replace(
        '#include <color_fragment>',
        '#include <color_fragment>\ndiffuseColor.rgb *= (0.72 + vDvnmGlow * 0.55);\ndiffuseColor.a *= (0.46 + vDvnmGlow * 0.48);'
      );
      material.userData.dvnmShader = shader;
      material.userData.dvnmPointer = shader.uniforms.uDvnmPointer.value;
    };
    material.customProgramCacheKey = () => 'davonium-v50-instanced-holographic-field';
    return material;
  }

  update(material, time, pointerX, pointerZ, intensity = 1) {
    const shader = material?.userData?.dvnmShader;
    if (!shader) return;
    shader.uniforms.uDvnmTime.value = Number.isFinite(time) ? time : 0;
    shader.uniforms.uDvnmPointer.value.set(
      Math.max(-4, Math.min(4, Number(pointerX) || 0)),
      Math.max(-5, Math.min(2, Number(pointerZ) || 0))
    );
    shader.uniforms.uDvnmIntensity.value = Math.max(0, Math.min(1, Number(intensity) || 0));
  }
}

export const shaderPipeline = new ShaderPipeline();
export { ShaderPipeline };
