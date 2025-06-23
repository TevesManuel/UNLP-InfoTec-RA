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

class ARApp {
    setupRenderer() {
        this.renderer = new THREE.WebGLRenderer({
                antialias: true,
                alpha: true
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.domElement.style.position = 'absolute';
        this.renderer.domElement.style.top = '0px';
        this.renderer.domElement.style.left = '0px';
        this.renderer.domElement.style.width = '100vw';
        this.renderer.domElement.style.height = '100vh';
        document.body.appendChild(this.renderer.domElement);
    }

    setupARToolkit() {
        this.arSource = new THREEx.ArToolkitSource({
            sourceType: 'webcam'
        });
        this.arSource.init(() => {
            this.arSource.onResizeElement();
            this.arSource.copyElementSizeTo(this.renderer.domElement);
            setTimeout(() => {
                this.arSource.onResizeElement();
                this.arSource.copyElementSizeTo(this.renderer.domElement);
            }, 250);
        });

        this.arContext = new THREEx.ArToolkitContext({
            cameraParametersUrl: 'camera_para.dat',
            detectionMode: 'color_and_matrix'
        });
        this.arContext.init(() => {
            this.camera.projectionMatrix.copy(this.arContext.getProjectionMatrix());
        });

        new THREEx.ArMarkerControls(this.arContext, this.camera, {
            type: 'pattern',
            patternUrl: 'pattern-qrcode.patt',
            changeMatrixMode: 'cameraTransformMatrix'
        });

        this.scene.visible = false;
    }


    onClick(event) {
        this.clickeables.forEach(clickeable => {        
            clickeable.checkClick(event, this.camera);
        });
    }

    animate() {
        requestAnimationFrame(this.animate.bind(this));
        this.arContext.update(this.arSource.domElement);
        this.scene.visible = true;
        // if (this.doorAdvertisement.model) {
        //     this.doorAdvertisement.model.lookAt(this.camera.position);
        // }
        this.renderer.render(this.scene, this.camera);
    }

    setupScene() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.scene.add(this.camera);
    }

    setupElements() {
        this.model = new ARModel(
            this.scene,
            window.location.origin + '/Models/Model.glb',
            {
                x: 0,
                y: 0,
                z: 0
            },
            {
                x: 2,
                y: 2,
                z: 2
            },
            VECTOR3_ZERO,
            true
        );
        // this.main = new MainARElement(this.scene, window.location.origin); // Por alguna razon no funciona
        this.doorElement = new DoorARElement(this.scene, window.location.origin, this.clickeables);
    }

    setupLights() {
        const light = new THREE.AmbientLight(0xffffff, 1);
        this.scene.add(light);

        const dirLight = new THREE.DirectionalLight(0xffffff, 0.75);
        dirLight.position.set(1, 1, 0);
        this.scene.add(dirLight);
    }

    constructor() {
        this.clickeables = [];

        this.setupScene();
        this.setupRenderer();
        this.setupARToolkit();

        this.setupElements();

        this.setupLights();
        
        this.camera.position.z = 5;
        // this.raycaster = new THREE.Raycaster();
        // this.mouse = new THREE.Vector2();

        window.addEventListener('click', this.onClick.bind(this), false);
        this.animate();
    }
}

new ARApp();