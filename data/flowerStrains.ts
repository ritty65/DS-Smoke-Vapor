import store from './store.json';

export interface FlowerStrain {
  name: string;
  type: string;
  thca: string;
  flavor: string;
  desc: string;
  image: string;
  imageAlt: string;
  imageWidth: number;
  imageHeight: number;
  imageSizes: string;
  imageLoading: string;
  imageCredit: string;
}

export const FLOWER_STRAINS = store.flowerStrains as FlowerStrain[];
