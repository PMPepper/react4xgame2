import { useId as useIdReact } from "react";




export default function useId(id?: string, prefix: string = '') {
    const _id = useIdReact();

    return id || `${prefix}${_id}`;
}