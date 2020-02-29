import React, { useEffect, useReducer } from 'react';
import { filter, indexOf } from 'lodash';
import { makeStyles, GridList, GridListTile, Button } from '@material-ui/core';
import { BoardType, BoardCheckbox } from './BoardCheckbox';
import { useImmerReducer } from 'use-immer';
import { subscribeEvents } from './services/subscribeEvents';
import { getBoardsList } from './services/boards';

type ActionType = {
  boards: BoardType[];
  type: string;
};

type SelectActionType = {
  board: string;
  type: 'TOGGLE' | 'RESET';
};

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    overflow: 'hidden',
    width: '80%',
    height: '90%',
    backgroundColor: theme.palette.background.default,
  },
  gridList: {
    width: '95%',
    height: '100%',
  },
  gridChild: {
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'center',
    color: 'black',
    fontSize: 14,
  },
}));

const boardsReducer = (boards: BoardType[], action: ActionType) => {
  switch (action.type) {
    case 'FETCH_DONE': {
      // boards = action.boards || [];
      const boards = action.boards || [];
      return [...boards];
    }
    // return;
    case 'RESET': {
      return [];
    }
    default:
      return boards;
  }
};

const selectedBoardsReducer = (
  selectedBoards: string[],
  action: SelectActionType,
) => {
  switch (action.type) {
    case 'TOGGLE':
      const exists = indexOf(selectedBoards, action.board) >= 0;
      let boards: string[] = selectedBoards;
      if (exists) {
        boards = filter(boards, (e: string) => action.board !== e);
      } else {
        boards.push(action.board);
      }
      return [...boards];
    case 'RESET':
      return [];
    default:
      return selectedBoards;
  }
};

const BoardsList = () => {
  const classes = useStyles();
  // const [boards, dispatch] = useImmerReducer(boardsReducer, []);
  const [boards, dispatch] = useReducer(boardsReducer, []);
  const [selectedBoards, dispatchSelected] = useReducer(
    selectedBoardsReducer,
    [],
  );
  useEffect(() => {
    const fetchBoards = async () => {
      try {
        const boards = await getBoardsList();
        console.log('==>effect boards', boards);
        dispatch({ type: 'FETCH_DONE', boards });
      } catch (e) {
        console.error(e);
        dispatch({ type: 'RESET', boards: [] });
      }
    };

    fetchBoards();
  }, []);

  // Select/Unselect boards
  const handleSelect = (boardId: string) => {
    dispatchSelected({ type: 'TOGGLE', board: boardId });
  };

  // Subscribe events
  const handleSubscribe = () => {
    subscribeEvents(selectedBoards);
  };

  return (
    <div className={classes.root}>
      <GridList cellHeight={60} className={classes.gridList} cols={2}>
        {boards.map((b: BoardType) => (
          <GridListTile className={classes.gridChild} key={b.id} cols={1}>
            <BoardCheckbox
              board={b}
              selected={selectedBoards}
              handleSelect={handleSelect}
            />
          </GridListTile>
        ))}
      </GridList>
      <Button variant="outlined" color="primary" onClick={handleSubscribe}>
        Save
      </Button>
    </div>
  );
};

export { BoardsList };
