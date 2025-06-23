class DoorARElement {
    constructor(scene, urlOrigin, clickeables) {
        this.model = new ARModel(
            scene,
            urlOrigin + '/Models/PuertaPopUp.glb',
            {
                x: 0,
                y: 2,
                z: 2.25
            },
            {
                x: 0.25,
                y: 0.25,
                z: 0.25
            },
            {
                x: 0,
                y: 3*Math.PI/2,
                z: 0,
            },
            false
        );
        this.model.setVisible(false);

        this.clickeable = new ClickableCube(
            scene,
            {
                x: -0.4,
                y: 0.75,
                z: 2.25
            },
            {
                x: 0.25,
                y: 0.25,
                z: 0.25
        });
        this.clickeable.onClick(() => {
            this.model.toggleVisibility();
        });
        clickeables.push(this.clickeable);
    }
}