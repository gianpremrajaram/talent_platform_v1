export type LabelType = 'Free' | 'Pro';

export interface DataItem {
  id: number;
  title: string;
  image: string;
  label?: LabelType;
}

export const workspaceData: DataItem[] = [
  {
    id: 1,
    title: 'Acme Corp',
    image: '/assets/images/workspace/bag.svg',
    label: 'Free'
  },
  {
    id: 2,
    title: 'Globex Inc.',
    image: '/assets/images/workspace/global.svg',
    label: 'Pro'
  },
  {
    id: 3,
    title: 'Stellar Labs',
    image: '/assets/images/workspace/lab.svg'
  }
];
