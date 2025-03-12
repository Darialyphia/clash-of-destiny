import type { CellViewModel } from '@/board/cell.model';

export type UiController = {
  onCellClick: (cell: CellViewModel) => void;
};
