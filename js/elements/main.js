class MainARElement {
    constructor(scene, urlOrigin) {
        this.model = new ARModel(
            scene,
            urlOrigin + '/Models/Model.glb',
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