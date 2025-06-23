/**
 * @fileoverview Renderización en Realidad Aumentada con Three.js y AR.js.
 * 
 * @author Manuel Tomas Teves
 * @date 29 mar 2025
 * 
 * Copyright (c) 2025 Manuel Tomas Teves
 * 
 * Se concede permiso, de forma gratuita, a cualquier persona que obtenga una copia
 * de este software y los archivos de documentación asociados (el "Software"), para 
 * utilizar el Software sin restricción, incluyendo sin limitación los derechos de uso, 
 * copia, modificación, fusión, publicación, distribución, sublicencia y/o venta del 
 * Software, y para permitir a las personas a quienes se les proporcione el Software 
 * hacer lo mismo, sujeto a las siguientes condiciones:
 * 
 * El aviso de copyright anterior y este aviso de permiso se incluirán en todas las copias
 * o partes sustanciales del Software.
 * 
 * EL SOFTWARE SE PROPORCIONA "TAL CUAL", SIN GARANTÍA DE NINGÚN TIPO, EXPRESA O IMPLÍCITA, 
 * INCLUYENDO PERO NO LIMITADO A LAS GARANTÍAS DE COMERCIABILIDAD, IDONEIDAD PARA UN PROPÓSITO 
 * PARTICULAR Y NO INFRACCIÓN. EN NINGÚN CASO LOS AUTORES O TITULARES DEL COPYRIGHT SERÁN 
 * RESPONSABLES DE NINGUNA RECLAMACIÓN, DAÑO U OTRA RESPONSABILIDAD, YA SEA EN UNA ACCIÓN 
 * CONTRACTUAL, EXTRACONTRACTUAL O DE OTRO TIPO, QUE SURJA DE O EN CONEXIÓN CON EL SOFTWARE 
 * O EL USO U OTRO TIPO DE ACCIONES EN EL SOFTWARE.
 */

TAR_CLICKEABLECUBE_VISIBLE = true;

const VECTOR3_ZERO = {
    x: 0,
    y: 0,
    z: 0,
}

class ARModel {
    constructor(scene, path, position, scale, rotation, manualColor) {
        this.model = null;
        this.visible = false;
        this.scene = scene;

        const loader = new THREE.GLTFLoader();
        loader.load(path, (gltf) => {
            this.model = gltf.scene;

            if (manualColor) {
                this.model.traverse((child) => {
                    if (child.isMesh) {
                        const oldMat = child.material;
                        const color = oldMat.color.clone().multiplyScalar(1.0);
                        
                        child.material = new THREE.MeshStandardMaterial({
                            map: oldMat.map,
                            color: color,
                        });
                    }
                });
            }

            
            this.model.scale.set(scale.x, scale.y, scale.z);
            this.model.position.set(position.x, position.y, position.z);
            this.model.rotation.set(rotation.x, rotation.y, rotation.z);
            this.visible = true;
            this.scene.add(this.model);
        }, undefined, function (error) {
            console.error('Error al cargar el modelo:', error);
        });
    }
    
    setVisible(state) {
        if (this.model) {
            const newState = state;
            this.model.traverse((child) => {
                if (child.visible !== undefined) child.visible = newState;
            });
        }
    }

    toggleVisibility() {
        if (this.model) {
            const newState = !this.model.visible;
            this.model.traverse((child) => {
                if (child.visible !== undefined) child.visible = newState;
            });
        }
    }

}

class ClickableCube {
    constructor(scene, position, scale, cbkFn) {
        this.cbkFn = cbkFn;
        const geometry = new THREE.BoxGeometry(1, 1, 1);
        const material = new THREE.MeshNormalMaterial({
            transparent: true,
            opacity: TAR_CLICKEABLECUBE_VISIBLE ? 1.0 : 0.0,
            side: THREE.DoubleSide,
        });
        
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.set(position.x, position.y, position.z);
        this.mesh.scale.set(scale.x, scale.y, scale.z);
        scene.add(this.mesh);

        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
    }

    onClick(cbkFn) {
        this.cbkFn = cbkFn;
    }

    checkClick(event, camera) {
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        this.raycaster.setFromCamera(this.mouse, camera);
        const intersects = this.raycaster.intersectObjects([this.mesh]);

        if (intersects.length > 0) {
            console.log('[i] Debug: detected click.');
            this.cbkFn();
        }
    }
}
