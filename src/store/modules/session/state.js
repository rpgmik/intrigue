import { Scene } from '../../../models/Scene'

let mainScene = new Scene({ id: "MAIN" });

export default {
    version: 3,
    ids: { "Scene#MAIN": mainScene },
    hubs: [],
    links: [],
    scenes: [mainScene]
};