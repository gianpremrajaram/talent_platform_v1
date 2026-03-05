import { useState } from 'react';

// material-ui
import { useColorScheme } from '@mui/material/styles';
import Grid from '@mui/material/Grid';
import Tooltip from '@mui/material/Tooltip';
import Box from '@mui/material/Box';

// third-party
import { Droppable, Draggable } from '@hello-pangea/dnd';

// project imports
import EditColumn from './EditColumn';
import Items from './Items';
import AddItem from './AddItem';
import AlertColumnDelete from './AlertColumnDelete';
import IconButton from 'components/@extended/IconButton';

import { ThemeMode } from 'config';
import { deleteColumn, useGetBacklogs } from 'api/kanban';
import { openSnackbar } from 'api/snackbar';
import { withAlpha } from 'utils/colorUtils';

// assets
import DeleteOutlined from '@ant-design/icons/DeleteOutlined';

// types
import { SnackbarProps } from 'types/snackbar';
import { KanbanColumn, KanbanItem } from 'types/kanban';

interface Props {
  column: KanbanColumn;
  index: number;
}

// ==============================|| KANBAN BOARD - COLUMN ||============================== //

export default function Columns({ column, index }: Props) {
  const { colorScheme } = useColorScheme();
  const { backlogs } = useGetBacklogs();

  const columnItems: KanbanItem[] = column.itemIds.map(
    (itemId: string) => backlogs?.items.filter((item: KanbanItem) => item.id === itemId)[0]
  );

  const handleColumnDelete = () => {
    setOpen(true);
  };

  const [open, setOpen] = useState(false);
  const handleClose = (status: boolean) => {
    setOpen(false);
    if (status) {
      deleteColumn(column.id);
      openSnackbar({
        open: true,
        message: 'Column deleted successfully',
        anchorOrigin: { vertical: 'top', horizontal: 'right' },
        variant: 'alert',
        alert: {
          color: 'success'
        }
      } as SnackbarProps);
    }
  };

  return (
    <Draggable draggableId={column.id} index={index}>
      {(provided) => (
        <Box
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          sx={(theme) => ({
            minWidth: 250,
            border: '1px solid',
            borderColor: theme.vars.palette.divider,
            borderRadius: 1,
            userSelect: 'none',
            margin: `0 ${16}px 0 0`,
            height: '100%',
            ...provided.draggableProps.style
          })}
        >
          <Droppable droppableId={column.id} type="item">
            {(providedDrop, snapshotDrop) => (
              <Box
                ref={providedDrop.innerRef}
                {...providedDrop.droppableProps}
                sx={(theme) => ({
                  background: snapshotDrop.isDraggingOver
                    ? colorScheme === ThemeMode.DARK
                      ? theme.vars.palette.text.disabled
                      : withAlpha(theme.vars.palette.secondary.light, 0.65)
                    : colorScheme === ThemeMode.DARK
                      ? withAlpha(theme.vars.palette.secondary.light, 0.2)
                      : theme.vars.palette.secondary.lighter,
                  padding: '8px 16px 14px',
                  width: 'auto',
                  borderRadius: 1
                })}
              >
                <Grid container sx={{ alignItems: 'center' }} spacing={3}>
                  <Grid size="grow">
                    <EditColumn column={column} />
                  </Grid>
                  <Grid sx={{ mb: 1.5 }}>
                    <Tooltip title="Delete Column">
                      <IconButton onClick={handleColumnDelete} aria-controls="menu-simple-card" aria-haspopup="true" color="error">
                        <DeleteOutlined />
                      </IconButton>
                    </Tooltip>
                    <AlertColumnDelete title={column.title} open={open} handleClose={handleClose} />
                  </Grid>
                </Grid>
                {columnItems.map((item, i) => (
                  <Items key={i} item={item} index={i} />
                ))}
                {providedDrop.placeholder}
                <AddItem columnId={column.id} />
              </Box>
            )}
          </Droppable>
        </Box>
      )}
    </Draggable>
  );
}
