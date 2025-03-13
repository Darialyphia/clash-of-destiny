import type { CellViewModel } from '@/board/cell.model';
import type { HighlightTag, UiController } from './ui-controller';

export class EndGameController implements UiController {
  onCellClick(cell: CellViewModel): void {
    console.log('EndGameController.onCellClick', cell);
  }

  getCellHighlightTag(
    cell: CellViewModel,
    isHovered: boolean,
    isPlayingVfx: boolean
  ): HighlightTag | null {
    return null;
  }
}
