/** Illustrations cut out of the "daily task" design (see public/illustrations). */
export type AssetName =
  | 'bear'
  | 'books'
  | 'clock'
  | 'daisy'
  | 'envelope'
  | 'flower'
  | 'glass'
  | 'heart'
  | 'lamp'
  | 'pencils'
  | 'pin'
  | 'plant'
  | 'purple-flower'
  | 'star'
  | 'star-pink'
  | 'sticky-note'
  | 'tulip';

export const asset = (name: AssetName) => `${import.meta.env.BASE_URL}illustrations/${name}.webp`;
