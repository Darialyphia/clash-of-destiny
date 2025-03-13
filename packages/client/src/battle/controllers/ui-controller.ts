import type { CellViewModel } from '@/board/cell.model';

export type HighlightTag =
  | 'movement'
  | 'movement-path'
  | 'danger'
  | 'targeting-range'
  | 'targeting-valid'
  | 'targeting-valid-hover';

export type UiController = {
  onCellClick: (cell: CellViewModel) => void;
  getCellHighlightTag(
    cell: CellViewModel,
    isHovered: boolean,
    isPlayingVfx: boolean
  ): HighlightTag | null;
};
