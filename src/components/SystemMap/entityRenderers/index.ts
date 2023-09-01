import { EntityRenderTypes } from "types/game/shared/facets";
import { EntityRenderer } from "../types";
import fleet from "./fleet";
import systemBody from "./systemBody";


const allRenderers: Readonly<Record<EntityRenderTypes, EntityRenderer>> = {
    systemBody,
    fleet,
};


export default allRenderers;