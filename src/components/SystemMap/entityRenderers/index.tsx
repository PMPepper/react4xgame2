import { EntityRenderer } from "../types";
import systemBody from "./systemBody";


const allRenderers = {
    systemBody
} as const;


export default allRenderers as Record<keyof typeof allRenderers, EntityRenderer>;