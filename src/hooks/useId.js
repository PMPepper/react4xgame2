import { useId as useIdReact } from "react";




export default function useId(id, prefix = '') {
    const _id = useIdReact();

    return id || `${prefix}${_id}`;
}