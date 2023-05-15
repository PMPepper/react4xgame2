



export default function inPlaceReorder<T = any>(array: T[], fromIndex: number, toIndex: number): T[] {
    if(!array || !(array instanceof Array)) {
      throw new Error('Invalid array');
    }
  
    if(fromIndex < 0 || fromIndex >= array.length) {
      throw new Error('Invalid fromIndex');
    }
  
    if(toIndex < 0) {
      throw new Error('Invalid toIndex');
    }
  
    const itemToReorder = array[fromIndex];
  
    //pull out of array
    array.splice(fromIndex, 1);
  
    //put into new position
    array.splice(toIndex, 0, itemToReorder)
  
    return array;
  }
  