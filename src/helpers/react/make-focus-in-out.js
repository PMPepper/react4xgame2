//DOES NOT WORK WITH REACT PORTALS

//The helper
export default function makeFocusInOut(handler) {
    return (e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) {
            return handler(e);
          }
    }
}