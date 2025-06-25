class MainARElement {
    constructor(scene) {
        this.model = new ARModel(
            scene,
            new URL('Models/Model.glb', window.location.href).href,
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
    }
}